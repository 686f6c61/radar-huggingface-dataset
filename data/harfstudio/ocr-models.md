# HarfStudio/ocr-models

## Resumen

HarfStudio/ocr-models no es un modelo entrenado por su autor, sino un repositorio de distribución que empaqueta los pesos de dos modelos de terceros en formatos listos para ejecución local. Concretamente, contiene una conversión a GGUF de Unlimited-OCR de Baidu (un modelo multimodal de reconocimiento de texto con proyector visual) y una exportación ONNX de LaMa, el modelo de inpainting de Samsung Research. El conjunto lo publica HarfStudio, desarrollador de una aplicación de escritorio de OCR y edición de PDF para macOS y Windows, para que su software descargue los ficheros en la primera ejecución y verifique su integridad mediante SHA-256.

El bloque de reconocimiento de texto suma aproximadamente 2.930 millones de parámetros y se distribuye en tres ficheros GGUF: dos cuantizaciones del modelo de lenguaje (Q8_0 y Q6_K) y un proyector visual en F16 que es obligatorio en ambos casos. El bloque de borrado de texto es un ONNX de 208 MB que opera a resolución fija de 512 x 512. El repositorio ocupa 6,8 GB en total y se ejecuta con llama.cpp para los GGUF y con ONNX Runtime para el ONNX.

Su relevancia es fundamentalmente práctica: es una vía verificable y reproducible para obtener los pesos de Unlimited-OCR y LaMa en formatos de inferencia local sin depender de código Python del repositorio original. La conversión es determinista y las licencias (MIT para OCR, Apache 2.0 para inpainting) permiten uso comercial, aunque el modelo no está pensado como un LLM de propósito general ni como base para fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal OCR (modelo de lenguaje + proyector visual) para los GGUF; red de inpainting con convoluciones de Fourier (LaMa) para el ONNX |
| Parametros totales | 2.934.734.080 (bloque OCR; el ONNX de inpainting no declara recuento de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q6_K para el modelo de lenguaje; F16 para el proyector visual; FP32 en el ONNX |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | MIT para los ficheros de OCR; Apache 2.0 para el fichero de inpainting (campo `license` del repo: `other`, con `license_name: mit-and-apache-2.0`) |
| Formato de pesos | GGUF (llama.cpp) y ONNX (ONNX Runtime) |

Desglose de ficheros:

| Fichero | Funcion | Tamano (bytes) |
|---|---|---|
| `harf-ocr-q8.gguf` | Modelo de lenguaje OCR, Q8_0, para equipos con 16 GB o mas | 3.126.140.032 |
| `harf-ocr-q6.gguf` | Modelo de lenguaje OCR, Q6_K, para equipos con menos memoria | 2.613.276.032 |
| `harf-ocr-vision.gguf` | Proyector visual F16, necesario con cualquiera de los dos modelos | 825.245.664 |
| `harf-erase.onnx` | Borrado de texto en fotos y fondos texturizados, 512 x 512 | 208.044.816 |

## Arquitectura y entrenamiento

El bloque de OCR procede de `baidu/Unlimited-OCR` (revision `8249d20b2822a7d8a4c22c8d8c9069b5ac36bda3`), un modelo multimodal que combina un modelo de lenguaje con un proyector visual: el proyector traduce la imagen de entrada a representaciones que el modelo de lenguaje consume para generar el texto reconocido. HarfStudio convirtio los pesos oficiales (`model-00001-of-000001.safetensors`, 6.672.547.120 bytes) con `convert_hf_to_gguf.py` de llama.cpp (modelo de lenguaje a bf16, proyector a F16) y aplico `llama-quantize` para producir Q8_0 y Q6_K, todo ello en el commit `5f490d7bfe78844e6390c869454c149fd7e003a8` de llama.cpp. La conversion es determinista y no se ejecuto código Python del repositorio original. Los ficheros equivalen byte a byte a los publicados previamente como `unlimited-ocr-Q8_0.gguf`, `unlimited-ocr-Q6_K.gguf` y `mmproj-unlimited-ocr-f16.gguf`.

El bloque de inpainting es LaMa ("Resolution-robust Large Mask Inpainting with Fourier Convolutions", Samsung Research), concretamente `lama_fp32.onnx` de `Carve/LaMa-ONNX` (revision `c3c0c9e468934d62e79c329e35d82dd09ff8c444`), una exportación ONNX del modelo big-lama realizada con la implementación exportable de Carve-Photos/lama. La arquitectura de LaMa se apoya en convoluciones de Fourier para lograr robustez a resoluciones y máscaras grandes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en ninguno de los dos modelos.

## Capacidades

- Reconocimiento de texto en imágenes (OCR) mediante el bloque GGUF de Unlimited-OCR, con el proyector visual como componente imprescindible.
- Procesamiento de documentos orientado a parsing, según las etiquetas del repositorio (`ocr`, `document-parsing`).
- Borrado de texto sobre fotografías y fondos texturizados mediante inpainting a 512 x 512 con LaMa.
- Inferencia local y offline: los GGUF corren con llama.cpp y el ONNX con ONNX Runtime, sin llamadas a servicios externos.
- Verificación de integridad de los ficheros por tamano y SHA-256 antes de su uso.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Soporte de tool calling, agentes, razonamiento multi-paso, matemáticas, visión general, audio o modo thinking: no disponible; la información no lo declara y el propósito del repositorio es específicamente OCR e inpainting.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Digitalización de documentos escaneados en una aplicación de escritorio: el bloque OCR convierte imágenes de páginas en texto editable de forma local, sin enviar el documento a la nube, lo que resulta adecuado para material confidencial.
- Edición de PDF con eliminación de texto incrustado en imágenes: se detecta la región de texto y se aplica `harf-erase.onnx` para reconstruir el fondo, permitiendo sustituir o borrar anotaciones sobre fotografías y texturas.
- Pipeline de parsing documental por lotes: ejecución con llama.cpp sobre los GGUF Q8_0 o Q6_K según la memoria disponible del equipo, integrable en procesos automatizados de extracción de texto.
- Auditoría y verificación de artefactos de IA: al publicarse los ficheros con SHA-256 y un script de conversión determinista, un equipo puede reproducir la conversión desde los pesos originales de Baidu y comprobar que los bytes coinciden.
- Despliegue en equipos sin GPU dedicada: la cuantización Q6_K reduce el modelo de lenguaje a 2,6 GB, pensada para equipos con menos de 16 GB de memoria, lo que permite OCR local en portátiles convencionales.
- Limpieza de imágenes para conjuntos de datos: uso del inpainting de LaMa para eliminar rótulos o marcas de agua de fotografías antes de reutilizarlas en entrenamiento, respetando la licencia Apache 2.0.
- Integración en herramientas de accesibilidad: extracción de texto de capturas y fotos para lectores de pantalla, ejecutada en local para preservar la privacidad del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión de OCR, de calidad de inpainting, de latencia ni de throughput.

## Requisitos de hardware

- VRAM/memoria estimada para el bloque OCR: Q8_0 requiere 3,13 GB para el modelo de lenguaje mas 0,83 GB del proyector visual (aproximadamente 3,95 GB); Q6_K requiere 2,61 GB mas 0,83 GB (aproximadamente 3,44 GB). La model card indica Q8_0 para equipos con 16 GB de memoria o mas y Q6_K para equipos con menos memoria, lo que sugiere que el consumo real con overhead de llama.cpp es superior al tamano de los ficheros.
- VRAM/memoria para el inpainting: el ONNX ocupa 208 MB y opera a 512 x 512; el consumo en ejecución no está especificado.
- GPU recomendadas: no disponible. La información no indica modelos de GPU concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: los tamanos de fichero permiten inferencia en GPU de consumo con suficiente memoria, pero la model card no confirma configuraciones concretas.
- Opciones de despliegue: llama.cpp (commit fijado `5f490d7bfe78844e6390c869454c149fd7e003a8`) para los GGUF y ONNX Runtime para el ONNX. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| HarfStudio/ocr-models (este repo) | 2.934.734.080 (bloque OCR) | no disponible | GGUF, ONNX | MIT + Apache 2.0 | Empaquetado de terceros para uso local; sin benchmarks publicados |
| baidu/Unlimited-OCR | no disponible en la informacion | no disponible | safetensors | MIT | Fuente original del bloque OCR; misma arquitectura y pesos antes de la conversión |
| Carve/LaMa-ONNX | no disponible | no aplica (inpainting) | ONNX | Apache 2.0 | Fuente original del fichero de borrado; exportación de big-lama |
| advimman/lama (LaMa) | no disponible | no aplica (inpainting) | PyTorch | Apache 2.0 | Implementación de referencia de Samsung Research |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de OCR o inpainting.

## Limitaciones y advertencias

- El repositorio no contiene modelos propios: cualquier limitación de Unlimited-OCR o de LaMa se hereda sin cambios.
- No hay benchmarks publicados, por lo que no es posible evaluar la precisión del OCR ni la calidad del inpainting a partir de la información disponible.
- La lista de idiomas soportados no está declarada; no se puede asumir cobertura multilingüe.
- La longitud de contexto del modelo de lenguaje no está documentada, lo que impide planificar documentos de gran extensión.
- El inpainting opera a resolución fija de 512 x 512, lo que puede degradar resultados en imágenes de alta resolución sin un preprocesado adecuado.
- El campo `license` del repositorio es `other`, con dos licencias distintas según el fichero; es necesario respetar la licencia MIT para los ficheros de OCR y la Apache 2.0 para el de inpainting, incluyendo los avisos de copyright correspondientes.
- HarfStudio no está afiliado ni respaldado por Baidu; el soporte y la evolución del modelo subyacente dependen del repositorio original.
- El repositorio está pensado para que lo consuma la aplicación HarfStudio; su uso fuera de ese contexto requiere gestionar manualmente la carga del proyector visual junto al modelo de lenguaje.
- Riesgo de alucinación en la transcripción de texto: no hay datos publicados sobre la tasa de error del OCR en documentos degradados, manuscritos o tablas complejas.
- Sin datos sobre sesgos: no se ha publicado información sobre sesgos demográficos o lingüísticos de los modelos subyacentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HarfStudio/ocr-models
- Modelo original de OCR (Baidu): https://huggingface.co/baidu/Unlimited-OCR
- Repositorio de HarfStudio: https://github.com/dbugom/harfstudio
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LaMa (Samsung Research): https://github.com/advimman/lama
- Exportación ONNX de LaMa: https://huggingface.co/Carve/LaMa-ONNX
- Implementación exportable de LaMa: https://github.com/Carve-Photos/lama
- Licencia del modelo OCR: https://huggingface.co/HarfStudio/ocr-models/blob/main/LICENSE-ocr-model.txt
- Licencia del modelo de borrado: https://huggingface.co/HarfStudio/ocr-models/blob/main/LICENSE-erase-model.txt
