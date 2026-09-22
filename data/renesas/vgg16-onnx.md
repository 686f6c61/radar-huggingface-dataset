# Renesas/VGG16-ONNX

## Resumen

VGG16-ONNX es la conversión a formato ONNX del clásico VGG-16 de 16 capas, publicada por Renesas para su ejecución sobre la plataforma embebida R-Car X5H, concretamente sobre la NPU NPX6-48K. No es un modelo entrenado por Renesas: parte del checkpoint `timm/vgg16.tv_in1k` (configuración OpenMMLab `vgg16_8xb32_in1k`) y se redistribuye como artefacto de despliegue para el ecosistema hardware de la compañía japonesa. El modelo resuelve clasificación de imágenes sobre ImageNet-1k con 1000 clases y cuenta con 138,4 millones de parámetros.

La relevancia de esta ficha no está en la arquitectura, que es la VGG clásica de convoluciones 3x3 apiladas, sino en el flujo de despliegue: el repositorio solo publica un ONNX en FP32 que la toolchain propietaria MWMX (Middleware MX) auto-convierte a INT8 en tiempo de compilación, sin necesidad de un paso de cuantización separado. La inferencia se ejecuta con el runtime MWMX nativo sobre la NPU, no sobre GPU de propósito general.

El interés práctico es, por tanto, la validación de toolchain y el prototipado de visión embebida en automoción e industria: Renesas publica latencias medidas en silicio real (14,66 ms con 1 core de IA y 12,07 ms con 12 cores a 850 MHz), aunque la precisión del modelo tras el auto-cast a INT8 sigue marcada como pendiente (TBD) en la model card. Existen repositorios hermanos para las variantes VGG11-ONNX y VGG11-BN-ONNX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VGG-16, red convolucional profunda de convoluciones 3x3 apiladas (familia VGG, tipo transformer no aplicable) |
| Parametros totales | 138,4 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, no generativo) |
| Tipos de cuantizacion | FP32 en el ONNX publicado; INT8 aplicado automáticamente por la toolchain MWMX en tiempo de compilación (no se distribuye fichero INT8) |
| Idiomas soportados | no disponible (tarea de clasificación de imágenes; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`fp32/vgg16bn_8xb32_in1k.onnx`) |
| Tarea | Clasificación de imágenes, ImageNet-1k (1000 clases) |
| Modelo base | `timm/vgg16.tv_in1k` (OpenMMLab `vgg16_8xb32_in1k`) |
| Hardware objetivo | Renesas R-Car X5H con NPU NPX6-48K |
| Runtime | Renesas MWMX (Middleware MX) |
| Resolucion de entrada | no disponible en la model card (marcada como TBD) |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la VGG-16 canónica: una pila de bloques convolucionales con filtros de 3x3 y pooling, seguida de cabezas totalmente conectadas para clasificación. El repositorio no entrena ni ajusta el modelo; hereda los pesos de `timm/vgg16.tv_in1k`, que a su vez corresponde a la receta OpenMMLab `vgg16_8xb32_in1k` sobre ImageNet-1k. Conviene notar que el fichero publicado se llama `vgg16bn_8xb32_in1k.onnx`, es decir, corresponde a la variante con batch normalization, pese a que el repositorio se titule simplemente VGG16.

No se dispone de información sobre número de tokens ni composición del dataset más allá de ImageNet-1k, ni sobre si hubo fases de RLHF o DPO (no aplicables en un clasificador de imágenes supervisado). La innovación técnica relevante aquí no es arquitectónica sino de despliegue: el ONNX en FP32 se compila con la toolchain MWMX, que realiza un auto-cast a INT8 y genera el binario ejecutable en la NPU NPX6-48K del R-Car X5H. La model card no documenta el método de calibración ni las métricas de precisión tras la cuantización, que figuran como TBD.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k (pipeline `image-classification`).
- Extracción de representaciones visuales: al ser una CNN profunda, las capas convolucionales pueden reutilizarse como backbone para tareas posteriores, aunque el repositorio no documenta esta práctica.
- Inferencia en hardware embebido: ejecución sobre NPU NPX6-48K con precisión INT8 auto-cast por MWMX.
- Escalado por cores de IA: la model card reporta resultados con 1 core y con 12 cores del mismo NPU, lo que permite ajustar consumo y latencia.
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking mode), visión generativa, audio ni salida de texto.
- Capacidades multilingües: no aplica; el modelo no procesa lenguaje.

## Casos de uso

- Validación de toolchain MWMX: usar este ONNX como caso de prueba reproducible para comprobar que la compilación, el auto-cast a INT8 y la ejecución en la NPU NPX6-48K funcionan de extremo a extremo antes de portar modelos propios.
- Benchmarking de plataforma R-Car X5H: las latencias publicadas (14,66 ms con 1 core, 12,07 ms con 12 cores a 850 MHz, batch 1) sirven como línea base para comparar el rendimiento de otros modelos de visión sobre el mismo silicio.
- Clasificación de imágenes en cabina o pasarela automotriz: el modelo puede etiquetar fotogramas de cámara en 1000 categorías genéricas sobre el propio SoC, sin depender de conectividad a la nube.
- Inspección visual industrial embebida: integrado en una línea de producción, permite descartar piezas mediante clasificación directa si las clases de interés están cubiertas por ImageNet-1k o tras el correspondiente ajuste fino fuera del repositorio.
- Extracción de características para pipelines posteriores: congelar el backbone convolucional y alimentar clasificadores ligeros o sistemas de recuperación de imágenes que se ejecuten en el mismo SoC.
- Prototipado de producto antes de invertir en entrenamiento propio: al estar bajo Apache 2.0, permite construir demos y pruebas de concepto sin restricciones de licencia, sustituyendo el modelo por uno ajustado cuando se conozca la precisión real.
- Referencia de comparación entre variantes: junto con los repositorios hermanos VGG11-ONNX y VGG11-BN-ONNX, sirve para medir el compromiso entre tamaño de modelo y latencia dentro de la misma familia.

## Benchmarks y rendimiento

La model card no publica métricas de precisión (top-1, top-5) para este repositorio; el apartado de accuracy figura explícitamente como TBD. Los únicos datos medidos son de latencia sobre hardware real, mediante el pipeline CI de hardware-in-the-loop «APM50»:

| Runtime | Precision | Dispositivo | Latencia (ms) | Tipo |
|---|---|---|---|---|
| MWMX Runtime | INT8 (auto) | X5H, 1x NPU, 1 core, 850 MHz | 14,659391 | Medido |
| MWMX Runtime | INT8 (auto) | X5H, 1x NPU, 12 cores, 850 MHz | 12,065876 | Medido |

Configuración del benchmark: una sola NPU, batch size 1, resolución de entrada no disponible (TBD). No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros) en la información disponible; además, esos benchmarks no son aplicables a un clasificador de imágenes. Cualquier cifra de precisión sobre ImageNet-1k para este artefacto concreto debe considerarse no verificada.

## Requisitos de hardware

- Plataforma obligatoria: placa Renesas R-Car X5H con NPU NPX6-48K. El artefacto está pensado para compilarse y ejecutarse con el runtime MWMX.
- VRAM: no aplica. La inferencia se ejecuta sobre la NPU, no sobre memoria de GPU; el repositorio ocupa 0,6 GB de almacenamiento.
- GPU recomendadas: no aplica para el flujo documentado. No hay datos publicados de ejecución en A100, H100 o RTX 4090.
- GPU de consumo: no aplica. El modelo no se distribuye con un grafo optimizado para CUDA ni con pesos GGUF; la ruta soportada es MWMX sobre NPU.
- Software necesario: runtime Renesas MWMX, toolchain de compilación MWMX (que realiza el auto-cast a INT8) y la CLI de Hugging Face para descargar el artefacto (`hf download Renesas/VGG16-ONNX --repo-type=model --include "fp32/*"`).
- Opciones de despliegue alternativas (ONNX Runtime en CPU, vLLM, llama.cpp, Ollama, TGI): no documentadas en la model card. vLLM, llama.cpp, Ollama y TGI no son aplicables a un clasificador de imágenes.
- Latencia medida: 14,659391 ms con 1 core de IA y 12,065876 ms con 12 cores, a 850 MHz y batch 1. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Renesas/VGG16-ONNX | 138,4 M | no aplica | no disponible (TBD) | Apache 2.0 | ONNX FP32 para R-Car X5H / MWMX |
| timm/vgg16.tv_in1k | 138,4 M (mismo checkpoint de origen) | no aplica | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Pesos PyTorch en Hugging Face |
| Renesas/VGG11-ONNX | no disponible | no aplica | no disponible | Apache 2.0 (mismo repositorio de referencia) | Repositorio hermano, mismas condiciones |
| Renesas/VGG11-BN-ONNX | no disponible | no aplica | no disponible | Apache 2.0 (mismo repositorio de referencia) | Repositorio hermano, mismas condiciones |

No se dispone de datos de latencia ni de precisión de las variantes VGG11 en la información proporcionada, por lo que la comparación cuantitativa entre ellas no puede completarse. Tampoco se han encontrado en la búsqueda web alternativas comparables (por ejemplo, otros clasificadores ImageNet portados a la misma NPU) con cifras verificables.

## Limitaciones y advertencias

- Precisión sin verificar: la accuracy del modelo tras el auto-cast a INT8 no está publicada; no debe asumirse que se mantiene la precisión del checkpoint original en FP32.
- Resolución de entrada no documentada: la model card la marca como TBD, lo que impide reproducir el benchmark de latencia sin un ajuste previo.
- Sesgos: al derivar de ImageNet-1k, hereda los sesgos de clase, representación geográfica y etiquetado de ese dataset. No hay documentación de evaluación de sesgos en este repositorio.
- Alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza fuera de la distribución de ImageNet-1k.
- Cobertura limitada: solo 1000 clases genéricas; no reconoce categorías específicas de dominio industrial, médico o automotriz sin ajuste fino adicional.
- Dependencia de hardware propietario: sin placa R-Car X5H y runtime MWMX no se puede reproducir el flujo documentado. La ruta de ejecución en GPU o CPU no está soportada oficialmente en este repositorio.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint de origen `timm/vgg16.tv_in1k` y de la receta OpenMMLab, así como los términos de uso del runtime MWMX, que es software propietario de Renesas.
- Madurez del repositorio: cero descargas y cero «likes» en el momento de la consulta, sin issues ni documentación adicional sobre calibración INT8.
- Producción: antes de desplegar, es imprescindible medir la precisión real sobre el conjunto de validación propio, ya que el repositorio no ofrece esa garantía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Renesas/VGG16-ONNX
- Repositorio hermano VGG11-ONNX: https://huggingface.co/Renesas/VGG11-ONNX
- Repositorio hermano VGG11-BN-ONNX: https://huggingface.co/Renesas/VGG11-BN-ONNX
- Checkpoint de origen: https://huggingface.co/timm/vgg16.tv_in1k
- Configuración OpenMMLab de referencia (`vgg16_8xb32_in1k`): https://github.com/open-mmlab/mmpretrain/blob/main/configs/vgg/metafile.yml
- Sitio corporativo de Renesas: https://www.renesas.com/
- Catálogo de productos de Renesas: https://www.renesas.com/en/products
- Renesas Electronics en Wikipedia (ES/EN): https://en.wikipedia.org/wiki/Renesas_Electronics
