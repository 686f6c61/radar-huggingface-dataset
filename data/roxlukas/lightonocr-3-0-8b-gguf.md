# roxlukas/LightOnOCR-3-0.8B-GGUF

## Resumen

LightOnOCR-3-0.8B es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) desarrollado por LightOn, distribuido bajo licencia Apache 2.0. Esta ficha concreta corresponde a la conversión a formato GGUF realizada por el usuario roxlukas, que permite ejecutar el modelo en entornos de inferencia local mediante llama.cpp y Ollama sin necesidad de GPU de datacenter. El modelo base emplea la arquitectura vision-language de Qwen3.5 y cuenta con 752.393.024 parámetros totales (aproximadamente 0,8 mil millones), lo que lo sitúa en la gama ultraligera de modelos multimodales.

El modelo resuelve dos tareas fundamentales de digitalización documental: la transcripción plana de texto presente en imágenes y la extracción estructurada con *grounding*, es decir, bloques de texto etiquetados acompañados de sus coordenadas (bounding boxes). Su relevancia actual radica en que ofrece estas capacidades en un tamaño reducido, apto para desplegarse en CPU o en GPUs de consumo, algo poco habitual en modelos de OCR multimodal.

La conversión GGUF incluye el modelo de texto en precisiones F16 y Q8_0, además de un proyector de visión (mmproj) separado en F16, requisito imprescindible para procesar imágenes. El repositorio ocupa 2,5 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (arquitectura Qwen3.5) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 y Q8_0 (texto); proyector de vision en F16 |
| Idiomas soportados | no disponible (probado solo con una imagen sintetica de factura en polaco) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura vision-language de Qwen3.5, que combina un codificador de visión con un modelo de lenguaje transformer para procesar imágenes y generar texto. La conversión a GGUF separa explícitamente el modelo de texto y el proyector de visión: el primero se distribuye en F16 (1,5 GB) y Q8_0 (0,8 GB), mientras que el segundo se ofrece únicamente en F16 (0,2 GB). La conversión se realizó con `convert_hf_to_gguf.py` usando las opciones `--outtype f16 --no-mtp` y `--mmproj`, y la cuantización Q8_0 se generó con `llama-quantize` en la build b12290 de llama.cpp.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de la arquitectura Qwen3.5. La model card del conversor indica que no se ejecutaron benchmarks sobre las versiones GGUF, y que las pruebas se limitaron a una imagen sintética de factura con texto en polaco.

## Capacidades

- Transcripción de texto en imágenes: con un prompt vacío, el modelo realiza una transcripción plana del contenido textual de la imagen.
- Extracción estructurada con grounding: con el prompt `grounding`, devuelve bloques de texto etiquetados junto con sus bounding boxes.
- Procesamiento multimodal de documentos: al incluir el proyector de visión (mmproj), puede analizar imágenes de páginas, facturas y documentos escaneados.
- Modo conversacional: el repositorio está etiquetado como conversacional y es compatible con endpoints.
- Integración con llama.cpp y Ollama: permite inferencia local mediante `llama-mtmd-cli` o la creación de un modelo Ollama a partir del Modelfile incluido.
- Control de modo thinking: se recomienda desactivar el razonamiento extendido (`think: false` en la API, `--think=false` en la CLI) para las tareas de OCR.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo transcribe el texto de una imagen de factura y, en modo `grounding`, devuelve cada bloque con sus coordenadas, lo que facilita el mapeo posterior de campos a un sistema de contabilidad.
- Extracción de datos de formularios escaneados: con bounding boxes por bloque, un pipeline puede localizar y recortar regiones concretas (cabecera, importes, firmas) para su validación automática.
- Procesamiento local en CPU: al estar cuantizado en Q8_0 (0,8 GB), puede ejecutarse con llama.cpp en equipos sin GPU dedicada, útil para oficinas con requisitos de privacidad que no pueden enviar documentos a la nube.
- Automatización documental en Ollama: la inclusión de un Modelfile permite desplegar el modelo como servicio local y consumirlo desde aplicaciones internas mediante la API de Ollama.
- Indexación de archivos históricos: la transcripción plana permite convertir páginas escaneadas en texto indexable para motores de búsqueda internos o sistemas RAG.
- Preprocesado en pipelines de OCR híbridos: el modelo puede actuar como primera pasada sobre documentos de estructura sencilla, derivando a sistemas más pesados solo los casos que requieran mayor precisión.
- Prototipado rápido de aplicaciones de visión: su reducido tamaño y su licencia Apache 2.0 permiten integrarlo en pruebas de concepto sin coste de licencia ni infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del conversor indica explícitamente que no se ejecutaron benchmarks sobre las versiones GGUF y que las pruebas se limitaron a una imagen sintética de factura con texto en polaco.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,8 GB para el modelo de texto en Q8_0 más 0,2 GB del proyector de visión en F16; en torno a 1,7 GB con el modelo de texto en F16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- GPU de consumo: cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso iGPUs con memoria compartida suficiente.
- CPU: al estar disponible en Q8_0, es viable la inferencia en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli`), Ollama (mediante el Modelfile incluido) y cualquier runtime compatible con GGUF y proyector multimodal.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| LightOnOCR-3-0.8B (esta conversion) | 752 M | no disponible | OCR vision-language | Apache 2.0 | GGUF |
| lightonai/LightOnOCR-3-0.8B (base) | 752 M | no disponible | OCR vision-language | Apache 2.0 | safetensors |
| Otros modelos OCR de la familia LightOn | no disponible | no disponible | OCR | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo se han validado dos modos de prompt: vacío (transcripción plana) y `grounding` (bloques con etiquetas y bounding boxes). Cualquier otra instrucción queda fuera de la distribución esperada y puede producir resultados incorrectos.
- El modelo solo se ha probado con una imagen sintética de factura en polaco; no hay evidencia de calidad en otros idiomas, tipos de documento o condiciones de escaneo.
- No se han ejecutado benchmarks sobre las conversiones GGUF, por lo que el rendimiento real frente al modelo base en safetensors es desconocido.
- Riesgo de alucinación en la transcripción: al ser un modelo generativo, puede omitir, duplicar o inventar texto en imágenes de baja calidad o con estructuras complejas.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: no disponible; la ausencia de datos sobre idiomas soportados impide garantizar cobertura multilingüe.
- Es necesario desactivar el modo thinking para las tareas de OCR; dejarlo activado puede degradar la salida o aumentar la latencia.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la conversión no ofrece garantías sobre la calidad de los pesos cuantizados.
- El repositorio no registra descargas ni validación por parte de la comunidad, por lo que conviene verificar la integridad de los archivos antes de usarlos en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/roxlukas/LightOnOCR-3-0.8B-GGUF
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
