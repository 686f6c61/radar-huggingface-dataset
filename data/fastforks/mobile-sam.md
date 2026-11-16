# fastforks/mobile-sam

## Resumen

MobileSAM es un modelo de segmentación de imágenes guiada por prompts (promptable segmentation) publicado por Zhang et al. (Kyung Hee University) en 2023. Sustituye el codificador de imagen ViT-H de SAM, de unos 632 millones de parámetros, por un TinyViT de aproximadamente 5 millones de parámetros, destilado a partir del codificador original. El codificador de prompts y el decodificador de máscaras son los de SAM, por lo que acepta puntos, cajas y logits de máscara con la misma interfaz y produce máscaras con puntuaciones de calidad (IoU).

El repositorio `fastforks/mobile-sam` no aloja pesos: es una model card que describe la integración del modelo en la librería fastforks, que descarga los pesos de los autores y los verifica mediante SHA-256. La entrada admite cualquier resolución H x W >= 1, redimensionada internamente a 1024x1024, y el modelo corre en fp16 sobre GPU con un consumo de memoria muy bajo (183 MiB reservados en el backend portable para 1024x1024).

Es relevante para desarrolladores que necesitan segmentación interactiva de alta frecuencia en hardware modesto: en una RTX 5060 Ti 16 GB el backend portable tarda 10,5 ms por prompt a 1024x1024 y el backend de kernels 6,86 ms, frente a 30,3 ms del código original en fp32. La licencia Apache-2.0 de los pesos permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT-5M (etapa MBConv + window attention con convoluciones depthwise) como codificador de imagen; codificador de prompts y decodificador de máscaras de SAM |
| Parametros totales | no disponible (el codificador de imagen TinyViT tiene ~5 M; el total no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen redimensionada a 1024x1024) |
| Tipos de cuantizacion | no disponible (se documenta ejecución en fp16 y fp32) |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes, no lingüístico) |
| Licencia | Apache-2.0 (pesos y código); código original Apache-2.0 AND MIT; TinyViT MIT |
| Formato de pesos | `mobile_sam.pt` (PyTorch); exportación ONNX y TensorRT documentada en benchmarks |

## Arquitectura y entrenamiento

MobileSAM mantiene la estructura de tres componentes de SAM: codificador de imagen, codificador de prompts y decodificador de máscaras. La innovación está en el codificador de imagen, un TinyViT de 5 millones de parámetros que combina una etapa inicial de bloques MBConv con etapas posteriores de window attention y convoluciones depthwise. Este codificador se destila a partir del ViT-H de SAM, lo que reduce drásticamente el coste computacional manteniendo la interfaz de segmentación. El codificador de prompts y el decodificador de máscaras son los de SAM original, entrenados sobre SA-1B (11 millones de imágenes con licencia y 1100 millones de máscaras generadas automáticamente).

Según la model card, el codificador de imagen se destila sobre el 1 % de SA-1B (unas 100 000 imágenes). El conjunto de datos SA-1B está sujeto a su propia licencia de investigación, lo que conviene verificar antes de usos distintos de la investigación. La integración en fastforks añade backends `portable` y `kernels`, con paridad numérica verificada frente al código original: en CPU float32 la diferencia máxima absoluta es <= 0,0013, y en GPU float16 el error medio es <= 0,81 % y el p99 <= 4,1 % respecto a la mediana de la referencia.

## Capacidades

- Segmentación guiada por puntos: recibe coordenadas y etiquetas de punto y devuelve máscaras booleanas con puntuaciones IoU.
- Segmentación guiada por cajas: acepta cajas delimitadoras como prompt.
- Segmentación guiada por logits de máscara: compatible con la interfaz de SAM.
- Generación de máscaras múltiples: produce hasta tres máscaras por prompt con puntuaciones de calidad para seleccionar la mejor.
- Prompts de texto en la variante SAM 3 de fastforks (según el ejemplo de uso de la model card: `model("photo.jpg", text="coin")` devuelve cajas, puntuaciones y máscaras).
- Ejecución en fp16 y fp32, con backends portable, kernels, torch.compile y TensorRT.
- Exportación a ONNX y construcción de motores TensorRT documentadas.
- No soporta tool calling, agentes ni razonamiento multi-turno: es un modelo de visión de una sola pasada.

## Casos de uso

- Anotación asistida de datasets: el modelo genera máscaras a partir de un clic por instancia, lo que acelera el etiquetado semántico y de instancias en pipelines de datos de visión artificial. Con 10,5 ms por prompt en portable, un anotador puede procesar cientos de imágenes por minuto.
- Segmentación interactiva en aplicaciones de edición de imagen: el usuario hace clic sobre un objeto y obtiene la máscara en milisegundos, con la posibilidad de refinar mediante cajas o puntos adicionales.
- Preprocesado en tiempo real en vídeo o cámaras: al requerir solo 183 MiB reservados a 1024x1024 y 6,86 ms por prompt con kernels, cabe en GPUs de consumo y permite segmentación por fotograma en flujos de baja latencia.
- Segmentación en dispositivos con recursos limitados: el codificador TinyViT de 5 M de parámetros y la ejecución fp16 permiten desplegar el modelo en GPUs de gama media o entornos embebidos con CUDA.
- Automatización de control de calidad industrial: segmentar piezas o defectos a partir de cajas delimitadoras generadas por un detector previo, usando el decodificador de SAM para obtener máscaras precisas.
- Investigación en destilación y eficiencia de modelos: el modelo sirve como referencia para comparar codificadores ligeros frente a ViT-H en tareas de segmentación promptable, con métricas de paridad y latencia documentadas.
- Integración en pipelines de visión con exportación a TensorRT: el motor fp16 del codificador de imagen tarda 4,99 ms, adecuado para servicios de segmentación de alta concurrencia.

## Benchmarks y rendimiento

Precisión en COCO val2017 (cada décima imagen, prompts de punto, mIoU mejor de 3 / máscara única en %):

| Variante | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|
| `mobile-sam` | 51,53 / 49,90 | 51,48 / 49,91 | 51,53 / 49,91 | 51,53 / 49,91 |

Latencia y memoria en segmentación promptable sintética a 1024x1024 (RTX 5060 Ti 16 GB):

| Modelo | Original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `mobile-sam` | 30,3 | 23,5 | 10,5 | 6,86 | 3,4x | 183 / 210 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `mobile-sam` | 0,21 | 0,71 | 1,60 | 1,01 | 0,47 | 0,29 |

torch.compile y TensorRT:

| Modelo | Entrada | Portable | Compile | TensorRT fp16 | Kernels | Compilación (s) | ONNX + engine (s) |
|---|---|---|---|---|---|---|---|
| `mobile-sam` | 1024x1024 | 10,5 ms | 6,22 ms | 4,99 ms (solo codificador) | 6,86 ms | 25,5 | 60,9 |

## Requisitos de hardware

- VRAM estimada: 183 MiB asignados y 210 MiB reservados en el backend portable a 1024x1024 en fp16; 215/296 MiB con kernels; 219/252 MiB con TensorRT (motor más torch).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; los benchmarks se realizaron en una RTX 5060 Ti 16 GB (sm_120). Para producción de alta concurrencia se recomienda A100 o H100 por ancho de banda, aunque el modelo no las requiere.
- Cabe en GPU de consumo: sí, con un consumo de memoria inferior a 300 MiB, por lo que cabe en cualquier GPU consumer con al menos 1 GB de VRAM.
- Opciones de despliegue: backend portable de fastforks, backend kernels, torch.compile, exportación ONNX y TensorRT. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de segmentación).
- Latencia y throughput: 10,5 ms por prompt en portable y 6,86 ms con kernels a 1024x1024; 4,99 ms con TensorRT fp16 solo para el codificador de imagen. La carga del modelo tarda entre 0,21 s (original) y 1,60 s (kernels).

## Comparativa con modelos similares

| Modelo | Codificador de imagen | Parámetros del codificador | Licencia | Contexto de entrada | Latencia documentada |
|---|---|---|---|---|---|
| MobileSAM (fastforks) | TinyViT-5M | ~5 M | Apache-2.0 (pesos) | 1024x1024 interno | 10,5 ms portable / 6,86 ms kernels |
| SAM (ViT-H) | ViT-H | ~632 M | Apache-2.0 | 1024x1024 | 30,3 ms fp32 (original, según benchmarks de esta card) |
| SAM (ViT-B) | ViT-B | no disponible en la información | Apache-2.0 | 1024x1024 | no disponible |
| MobileSAM original | TinyViT-5M | ~5 M | Apache-2.0 | 1024x1024 | 23,5 ms (original fp16, según esta card) |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: la librería fastforks los descarga de los enlaces de los autores y verifica su SHA-256, por lo que la disponibilidad depende de esos enlaces externos.
- El modelo está marcado como "experimental" en la model card; no se garantiza estabilidad de API ni de resultados en producción.
- La destilación se realizó sobre el 1 % de SA-1B (unas 100 000 imágenes), lo que puede reducir la precisión frente a SAM completo en dominios alejados de la distribución de entrenamiento.
- El conjunto SA-1B está bajo licencia de investigación; conviene revisar sus términos antes de usos comerciales, aunque los pesos de MobileSAM sean Apache-2.0.
- La licencia del código original es Apache-2.0 AND MIT, y TinyViT es MIT; es necesario conservar los avisos correspondientes.
- Riesgo de alucinación de máscaras: al ser un modelo de segmentación, puede generar máscaras plausibles pero incorrectas en objetos ambiguos o de bajo contraste; las puntuaciones IoU deben usarse como filtro.
- No soporta prompts de texto de forma nativa en la variante `mobile-sam`; el ejemplo de texto corresponde a la variante SAM 3 de fastforks.
- No hay información sobre sesgos demográficos o geográficos del modelo; el rendimiento puede variar según el tipo de imagen y la calidad de los prompts.
- Los benchmarks se midieron en una única GPU (RTX 5060 Ti) y con una versión concreta de torch (2.14.1+cu130); los tiempos pueden diferir en otro hardware.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/mobile-sam
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend kernels: https://huggingface.co/fastforks/kernels
- Código original de MobileSAM: https://github.com/ChaoningZhang/MobileSAM (commit `f706ad9c4eb7`)
- Pesos originales: https://github.com/ChaoningZhang/MobileSAM/raw/f706ad9c4eb7f219c00d9050e46328518ffb65d2/weights/mobile_sam.pt
- Benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Licencia del código original: https://github.com/ChaoningZhang/MobileSAM/blob/f706ad9c4eb7f219c00d9050e46328518ffb65d2/LICENSE
- Model card de un coautor en HF: https://huggingface.co/dhkim2810/MobileSAM/blob/4e2e5245fe9dc63096d575d36e70eb39b03b3aba/README.md
- Licencia de TinyViT: https://github.com/microsoft/Cream/blob/4a13c4091e78f9abd2160e7e01c02e48c1cf8fb9/LICENSE
