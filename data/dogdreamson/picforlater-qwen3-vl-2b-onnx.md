# DogDreamson/picforlater-qwen3-vl-2b-onnx

## Resumen

PicForLater Qwen3-VL-2B-Instruct ONNX Runtime GenAI es una conversion y cuantizacion comunitaria del modelo vision-lenguaje Qwen/Qwen3-VL-2B-Instruct, realizada por DogDreamson para el proyecto open source PicForLater. El repositorio distribuye dos variantes ONNX independientes y autocontenidas: una orientada a CUDA con graficos de vision y embedding en FP16 y cuerpo del decodificador cuantizado Q4F16, y otra orientada a CPU con graficos FP32 y cuerpo Q4F32. Ambas variantes emplean cuantizacion solo de pesos con esquema simetrico block-32 `rtn_last`: Q4 para el cuerpo del decodificador y Q8 para la cabeza de lenguaje (lm_head).

El objetivo es permitir la comprension de imagenes locales y la generacion de texto restringida (titulos, descripciones y candidatos de hechos visuales editables) sin depender de servicios en la nube. Se trata de una conversion, no de un fine-tune: no se realizo entrenamiento adicional. La documentacion declara soporte de chino simplificado, ingles y japones, y requiere ONNX Runtime GenAI 0.14.1 y ONNX Runtime 1.26.0 para su ejecucion calificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (arquitectura Qwen3-VL) |
| Parametros totales | Aproximadamente 2 mil millones (2B), segun la denominacion del modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4F16 (variante CUDA) y Q4F32 (variante CPU) para el cuerpo del decodificador; Q8 para lm_head; esquema simetrico block-32 `rtn_last`, solo pesos |
| Idiomas soportados | Chino simplificado, ingles y japones |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.onnx.data`, `qwen3vl-embedding.onnx`, `qwen3vl-vision.onnx`) |

## Arquitectura y entrenamiento

El modelo es una conversion y cuantizacion de Qwen/Qwen3-VL-2B-Instruct, no un fine-tune, y no se realizo entrenamiento adicional. La arquitectura subyacente es la de Qwen3-VL, un transformer multimodal que procesa imagenes y texto. La exportacion a ONNX se realizo con Transformers 4.57.6, PyTorch 2.7.0+cu128, ONNX 1.18.0 y ONNX IR 0.1.16, generando dos variantes independientes: `cuda-q4f16-rtnlast` con graficos de vision y embedding en FP16, y `cpu-q4f32-rtnlast` con graficos en FP32. Ambas utilizan cuantizacion solo de pesos con esquema simetrico block-32 `rtn_last`: Q4 para el cuerpo del decodificador y Q8 para la cabeza de lenguaje (lm_head). El repositorio incluye `manifest.json` con la longitud exacta en bytes y SHA-256 de cada archivo del paquete para verificar su integridad.

## Capacidades

- Comprension de imagenes individuales: el modelo puede analizar una imagen y generar texto descriptivo relacionado.
- Generacion restringida (constrained generation): disenado para producir salidas controladas como titulos, descripciones y candidatos de hechos visuales editables.
- Procesamiento local: ejecucion 100% offline, sin envio de datos a servidores externos.
- Multilingue: calificado para chino simplificado, ingles y japones; el chino tradicional no supero las pruebas de calificacion.
- Cuantizacion eficiente: disponible en dos variantes (CPU y CUDA) para adaptarse a distintos entornos de despliegue.
- Tool calling, function calling y capacidades de agente: no documentadas en el repositorio.

## Casos de uso

- **Gestion de bibliotecas de fotos personales**: el modelo se integraria en una aplicacion local como PicForLater para analizar cada imagen y generar automaticamente titulos y descripciones editables. Es adecuado porque su cuantizacion Q4 permite ejecutarlo en equipos de consumo, y el procesamiento local protege la privacidad de las fotos.

- **Etiquetado de imagenes en aplicaciones de escritorio**: gracias a su tamano de 2B y cuantizacion Q4, el modelo puede anotar imagenes en aplicaciones de escritorio, generando metadatos y texto descriptivo sin necesidad de conexion a internet.

- **Generacion de candidatos de hechos visuales**: en aplicaciones de analisis documental, el modelo puede proponer afirmaciones factuales extraidas de una imagen (fechas, numeros, lugares, personas). Es adecuado porque el repositorio fue especificamente disenado para este proposito, aunque las salidas deben verificarse con OCR o con la imagen original.

- **Asistencia para accesibilidad**: aplicaciones locales para personas con discapacidad visual pueden usar el modelo para describir imagenes en chino simplificado, ingles o japones, aprovechando el procesamiento offline y la baja latencia en equipos de consumo.

- **Automatizacion de descripciones de productos**: en plataformas de comercio electronico con catalogos basados en imagenes, el modelo puede generar borradores de descripciones de producto que luego son revisados y editados por humanos. Es adecuado por su capacidad de generacion restringida y su ejecucion local.

- **Analisis de imagenes en entornos con requisitos de privacidad**: sectores como salud, legal o servicios financieros, donde no se permite enviar datos sensibles a APIs externas, pueden desplegar el modelo localmente para analizar imagenes y generar texto descriptivo sin riesgo de fuga de informacion.

- **Integracion en pipelines de vision por computador**: el formato ONNX permite integrar el modelo en aplicaciones .NET, Python o C++ mediante ONNX Runtime GenAI, facilitando su uso en sistemas de automatizacion que necesitan procesar imagenes de forma local.

- **Herramientas de anotacion para datasets de investigacion**: el modelo puede generar borradores de descripciones para imagenes de entrenamiento, acelerando el proceso de anotacion en proyectos de vision artificial. Su licencia Apache-2.0 permite su uso en proyectos academicos y comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La documentacion del repositorio incluye observaciones cualitativas de rendimiento en la estacion de trabajo de calificacion: la generacion por CPU fue mas rapida para salidas cortas y restringidas, mientras que la variante CUDA utilizo mucha menos memoria de conjunto de trabajo (process working-set). No se proporcionan metricas de latencia ni throughput.

## Requisitos de hardware

- **Variante CUDA (`cuda-q4f16-rtnlast`)**: requiere GPU NVIDIA con 8 GiB de VRAM y controlador compatible con CUDA 12; 12 GiB de RAM del sistema recomendados. Tamanos del paquete: 2,26 GiB.
- **Variante CPU (`cpu-q4f32-rtnlast`)**: requiere 12 GiB de RAM del sistema como minimo, 16 GiB recomendados; no necesita GPU. Tamanos del paquete: 3,56 GiB.
- **Opciones de despliegue**: ONNX Runtime GenAI 0.14.1 (CPU o CUDA) y ONNX Runtime 1.26.0. Se recomienda usar entornos virtuales separados para cada execution provider.
- **No calificado para DirectML**: la documentacion advierte explicitamente que no se deben ejecutar estos artefactos con DirectML.
- **Advertencia sobre minimos**: los minimos declarados son umbrales de admision del paquete, no garantias de que todos los prompts, tamanos de imagen, sistemas operativos o versiones de runtime quepan en memoria.

## Comparativa con modelos similares

| Aspecto | PicForLater Qwen3-VL-2B ONNX | Qwen3-VL-2B-Instruct (base) |
|---|---|---|
| Parametros | ~2B | ~2B |
| Formato | ONNX cuantizado (Q4F16/Q4F32, Q8 en lm_head) | safetensors (precision completa) |
| Entorno de ejecucion | ONNX Runtime GenAI 0.14.1 | PyTorch / Transformers |
| VRAM requerida | 8 GiB (variante CUDA) | No especificado en la documentacion |
| Licencia | Apache-2.0 | Apache-2.0 |
| Disponibilidad | HuggingFace | HuggingFace |

Como alternativa de generacion anterior se podria considerar Qwen2-VL-2B-Instruct, pero no se dispone de datos de benchmarks comparativos en la informacion proporcionada para establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- **Riesgo de alucinacion**: el modelo puede producir errores o alucinaciones. El repositorio advierte que fechas, numeros, montos y direcciones deben verificarse con OCR o con la imagen original antes de su uso.
- **No apto para decisiones de alto riesgo**: el modelo no debe utilizarse para decisiones criticas sin supervision humana y verificacion externa.
- **Alcance linguistico limitado**: solo se han calificado chino simplificado, ingles y japones. El chino tradicional no supero las pruebas de calificacion y no forma parte de las capacidades declaradas.
- **No es un fine-tune**: al ser una conversion/cuantizacion, el modelo hereda las limitaciones del modelo base sin mejoras especificas para tareas concretas.
- **Restricciones de despliegue**: DirectML no fue calificado. La variante CUDA requiere ONNX Runtime GenAI con soporte CUDA y un controlador NVIDIA compatible con CUDA 12. El paquete CUDA no esta integrado en la aplicacion PicForLater actual, que solo soporta CPU y DirectML.
- **Adopcion limitada**: el repositorio registra 0 descargas y 1 like, lo que indica que no tiene una base de usuarios validada en produccion.
- **Minimos no garantizados**: los minimos declarados son umbrales de admision, no garantias de funcionamiento en todos los entornos.
- **Versionado del runtime**: las versiones calificadas son ONNX Runtime GenAI 0.14.1 y ONNX Runtime 1.26.0. Versiones posteriores pueden funcionar, pero no fueron utilizadas para la calificacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DogDreamson/picforlater-qwen3-vl-2b-onnx
- Proyecto PicForLater: https://github.com/dogdreamson555/PicForLater
- Modelo base Qwen/Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Paper de Qwen3-VL (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
