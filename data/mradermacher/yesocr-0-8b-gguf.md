# mradermacher/YesOCR-0.8B-GGUF

## Resumen

YesOCR-0.8B es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR), desarrollado originalmente por el usuario Yesianrohn y publicado bajo licencia Apache 2.0. Esta ficha describe la versión cuantizada en formato GGUF elaborada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo resuelve la tarea de extraer texto de imágenes (image-text-to-text) con un tamaño reducido que facilita su despliegue en entornos con recursos limitados.

La arquitectura se etiqueta como `qwen3_5` en los metadatos, lo que sugiere una base derivada de la familia Qwen, con un total de 1.006.672.704 parámetros (aproximadamente 1.000 millones). El modelo soporta los idiomas chino (zh) e inglés (en) y se distribuye con pesos en formato safetensors en su versión original y en múltiples cuantizaciones GGUF en esta versión.

La relevancia de esta ficha radica en que ofrece una alternativa compacta para pipelines de OCR que requieren inferencia local sin depender de servicios en la nube, con cuantizaciones que van desde 0,6 GB (Q2_K) hasta 2,1 GB (f16), lo que lo hace viable en GPUs de consumo e incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language, etiquetada como `qwen3_5` en metadatos |
| Parametros totales | 1.006.672.704 |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta version); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se etiqueta con `qwen3_5` en los metadatos de Hugging Face, lo que indica que su arquitectura deriva de la familia Qwen. Se trata de un modelo vision-language de tipo image-text-to-text, es decir, combina un codificador visual con un decodificador de lenguaje para procesar imágenes y generar texto. El recuento real de parámetros en safetensors es de 1.006.672.704, lo que confirma un tamaño cercano a los 1.000 millones de parámetros.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base fue entrenado con el dataset `Yesianrohn/OCR-Data`, según los metadatos. Esta versión GGUF es una cuantización estática del modelo original, sin cuantizaciones ponderadas/imatrix disponibles según el autor de la cuantización. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes, con salida de texto.
- Procesamiento image-text-to-text: acepta una imagen y una instrucción textual para generar la transcripción.
- Soporte multilingüe limitado a chino (zh) e inglés (en).
- Conversacional: el tag `conversational` sugiere soporte de diálogo multi-turno, aunque no se detalla su alcance.
- Compatible con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se documentan capacidades de audio ni de visión más allá del OCR.

## Casos de uso

- Digitalización de documentos en chino e inglés: el modelo puede procesar imágenes de facturas, formularios o páginas escaneadas y devolver el texto transcrito, gracias a su naturaleza image-text-to-text y su soporte para ambos idiomas.
- Extracción de texto en aplicaciones móviles o de escritorio: con cuantizaciones de 0,6-0,9 GB (Q2_K a Q5_K_M), el modelo puede ejecutarse en dispositivos con poca memoria mediante llama.cpp, lo que permite OCR local sin conexión.
- Preprocesamiento en pipelines de datos: integrado en flujos de ingestión documental para convertir imágenes en texto antes de tareas de búsqueda o análisis, usando la versión Q8_0 (1,2 GB) para mayor fidelidad.
- Automatización de archivo y clasificación: al transcribir el contenido de imágenes, el texto resultante puede alimentar sistemas de clasificación o indexación, aprovechando la licencia Apache 2.0 para uso comercial.
- Prototipado rápido en investigación: su tamaño reducido (1.000 millones de parámetros) y las múltiples cuantizaciones permiten experimentar con OCR en entornos académicos con GPUs de consumo.
- Servicios de accesibilidad: conversión de texto en imágenes a voz o texto plano para usuarios con discapacidad visual, desplegando el modelo en servidores modestos o en el borde (edge) gracias a su bajo requisito de VRAM.
- Análisis de capturas de pantalla o imágenes de interfaz en inglés y chino: el modelo puede extraer etiquetas y texto de UI para tareas de automatización o testing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,6 GB (Q2_K) y 2,1 GB (f16) solo para los pesos del modelo; hay que añadir la memoria del codificador visual (mmproj: 0,2-0,3 GB) y el overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad; A100/H100 no son necesarias pero soportadas.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM, especialmente con Q4_K_M (0,8 GB) o Q5_K_M (0,9 GB).
- Opciones de despliegue: llama.cpp, Ollama (si se importa el GGUF), y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| YesOCR-0.8B (este) | ~1,0 B | no disponible | zh, en | Apache 2.0 | GGUF, safetensors |
| Qwen2-VL-2B | ~2 B | no disponible en esta ficha | multilingüe | Apache 2.0 | safetensors, GGUF (comunidad) |
| Florence-2-base | ~0,23 B | no disponible | en (principalmente) | MIT | safetensors |
| Donut-base | ~0,2 B | no disponible | en | MIT | safetensors |

La comparativa se limita a modelos de visión-lenguaje de tamaño reducido orientados a OCR o document understanding. YesOCR-0.8B se sitúa en un punto intermedio de parámetros y ofrece soporte para chino e inglés, mientras que Florence-2 y Donut están más orientados al inglés. No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse con un dataset específico (`Yesianrohn/OCR-Data`) puede heredar sesgos de ese corpus.
- Riesgo de alucinación: como modelo generativo, puede producir texto que no aparece en la imagen, especialmente en cuantizaciones muy bajas (Q2_K, Q3_K_S).
- Limitaciones de contexto o idioma: solo soporta chino e inglés; no se documenta la longitud de contexto, lo que limita el procesamiento de imágenes con mucho texto o conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original y del dataset.
- Caveats para producción: las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar la calidad del OCR; se recomienda Q4_K_M o superior para tareas críticas. No hay cuantizaciones ponderadas/imatrix disponibles, lo que puede afectar la calidad en comparación con otras opciones.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica falta de validación comunitaria.

## Enlaces

- [Hugging Face: mradermacher/YesOCR-0.8B-GGUF](https://huggingface.co/mradermacher/YesOCR-0.8B-GGUF)
- [Modelo base: Yesianrohn/YesOCR-0.8B](https://huggingface.co/Yesianrohn/YesOCR-0.8B)
- [Dataset: Yesianrohn/OCR-Data](https://huggingface.co/datasets/Yesianrohn/OCR-Data)
- [Página de descargas del cuantizador](https://hf.tst.eu/model#YesOCR-0.8B-GGUF)
- [FAQ y solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Referencia de uso de GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico de comparación de cuantizaciones (ikawrakow)](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas sobre cuantizaciones (Artefact2)](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
