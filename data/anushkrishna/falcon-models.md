# anushkrishna/falcon-models

## Resumen

`anushkrishna/falcon-models` no es un modelo único, sino un repositorio de distribución multi-pack con artefactos preparados para la aplicación de escritorio Falcon. Contiene tres paquetes: una conversión a GGUF y cuantización Q4_K_M de `humain-ai/ALLaM-7B-Instruct-preview` (un modelo de lenguaje de 7.000.559.616 parámetros orientado a conversación en árabe e inglés), y dos conversiones a CTranslate2 con cuantización int8 de los modelos de traducción de Helsinki-NLP `opus-mt-tc-big-en-ar` y `opus-mt-tc-big-ar-en`. El objetivo declarado es el procesamiento de documentos en local dentro de la aplicación Falcon, con descarga de datos durante la instalación y ejecución sin conexión.

La relevancia práctica del repositorio es de empaquetado, no de investigación: las transformaciones aplicadas son únicamente conversión de formato y cuantización, sin fine-tuning adicional. Cada pack conserva su licencia original (Apache-2.0 para ALLaM, CC-BY-4.0 para OPUS-MT), de ahí la licencia compuesta `apache-2.0-and-cc-by-4.0-per-pack`. El repositorio incluye `manifest.json` con revisiones upstream, tamaños y hashes SHA-256, así como las model cards originales en `sources/` y los textos de licencia y atribución en `LICENSE.md`.

Para un desarrollador, el interés está en disponer de un LLM de 7B cuantizado a Q4_K_M listo para llama.cpp y de un par de traductores en→ar y ar→en en CTranslate2 int8, todo en un único repositorio de 4,8 GB. Como contrapartida, el repositorio no publica benchmarks, no registra la versión exacta del entorno de conversión de Marian y no cuenta con descargas ni valoraciones que permitan validar su calidad de forma comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only en el pack ALLaM-7B; transformer encoder-decoder tipo Marian en los packs OPUS-MT (no se detalla en la model card) |
| Parametros totales | 7.000.559.616 en safetensors (pack ALLaM-7B); tamaño de los packs Marian no disponible |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (ALLaM-7B); int8 en CTranslate2 (Marian en-ar y ar-en) |
| Idiomas soportados | en, ar |
| Licencia | `apache-2.0-and-cc-by-4.0-per-pack`: Apache-2.0 para el pack ALLaM, CC-BY-4.0 para los packs OPUS-MT |
| Formato de pesos | GGUF (`allam/allam-7b-instruct-preview-Q4_K_M.gguf`) y CTranslate2 (`model.bin` más cinco ficheros por dirección en `marian/en-ar/` y `marian/ar-en/`) |
| Runtime previsto | llama.cpp para ALLaM; CTranslate2 para Marian |
| Tamaño del repositorio | 4,8 GB |
| Repositorio | Multi-pack de distribución, no un modelo Transformers único |
| Pipeline declarado | translation |
| Tipo de empaquetado | Conversión de formato y cuantización, sin fine-tuning adicional |

## Arquitectura y entrenamiento

El pack ALLaM-7B es la conversión a GGUF del modelo `humain-ai/ALLaM-7B-Instruct-preview`, atribuido a NCAI/SDAIA y mantenido en su repositorio upstream bajo HUMAIN. Se trata de un modelo de 7B parámetros en formato safetensors, cuantizado a Q4_K_M para su ejecución en llama.cpp; el GGUF incluye tokenizer y plantilla de chat, y el repositorio adjunta además los ficheros de tokenizer y configuración del modelo original por motivos de procedencia y compatibilidad. La model card no documenta arquitectura interna, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF o DPO para este modelo base; esos datos deben consultarse en la model card original dentro de `sources/`.

Los packs Marian son conversiones a CTranslate2 con cuantización int8 de `Helsinki-NLP/opus-mt-tc-big-en-ar` y `Helsinki-NLP/opus-mt-tc-big-ar-en`, modelos de traducción automática neuronal del proyecto OPUS-MT de la Universidad de Helsinki, con arquitectura encoder-decoder. Al igual que en el caso anterior, el repositorio solo aplica conversión y cuantización: no hay entrenamiento, ajuste ni modificación de los pesos más allá de la reducción de precisión. Un caveat relevante de reproducibilidad: la model card indica explícitamente que el entorno exacto del conversor de Marian no se registró para estos artefactos y que su identidad queda fijada por los hashes SHA-256 del manifiesto; las conversiones futuras deberían registrar las versiones completas del toolchain antes de publicar una nueva release.

## Capacidades

- Generación de texto conversacional en árabe e inglés mediante el pack ALLaM-7B, con plantilla de chat incluida en el GGUF.
- Traducción automática directa inglés → árabe y árabe → inglés con los dos packs Marian, pensados para frases y documentos.
- Procesamiento de documentos en local: la aplicación Falcon descarga los modelos durante la configuración y ejecuta el procesamiento sin enviar datos a servidores externos.
- Ejecución en CPU o GPU a través de llama.cpp (ALLaM) y CTranslate2 (Marian), lo que permite despliegues en equipos de escritorio.
- Integración con endpoints compatibles: el repositorio lleva la etiqueta `endpoints_compatible`.
- Verificación de integridad: `manifest.json` expone revisión upstream, tamaño y SHA-256 de cada artefacto.
- OCR fuera del repositorio: la aplicación usa los repositorios oficiales de PaddlePaddle en Hugging Face; los pesos y binarios nativos de OCR no se replican en esta release y solo se referencian en `external_artifacts` del manifiesto.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Traducción de documentación técnica en→ar y ar→en: los packs Marian en CTranslate2 int8 permiten montar un servicio de traducción con requisitos de CPU y memoria muy bajos, adecuado para procesar lotes de documentos sin GPU.
- Aplicación de escritorio con procesamiento local de documentos: Falcon descarga los packs en la instalación y ejecuta el procesamiento en la máquina del usuario, de modo que el contenido sensible no sale del equipo; el pack ALLaM Q4_K_M cubre la parte conversacional y los Marian la traducción.
- Despliegue en entornos sin conectividad o con requisitos de soberanía del dato: al fijar los artefactos por commit SHA y verificar SHA-256, se puede replicar un entorno air-gapped con versiones inmutables.
- Asistente conversacional bilingüe árabe/inglés: el GGUF de ALLaM con plantilla de chat incluida se puede cargar en llama.cpp u Ollama para atención a usuarios en ambos idiomas.
- Preprocesado de corpus para entrenamiento: traducción automática de grandes volúmenes de texto en→ar o ar→en con CTranslate2 int8 antes de un pipeline de filtrado o anotación.
- Localización de interfaces y documentación de producto: traducción por segmentos con Marian y revisión humana posterior, integrable en un pipeline de CI que consuma los ficheros del repositorio por commit fijo.
- Prototipado de investigación en PLN árabe: uso del 7B cuantizado en una sola GPU de gama media para experimentos de prompting y evaluación cualitativa sin necesidad de infraestructura de数据中心.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K, BLEU, COMET ni de ningún otro conjunto de evaluación para ninguno de los tres packs, y tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para el pack ALLaM-7B en Q4_K_M: en torno a 4-4,5 GB solo de pesos (el repositorio completo ocupa 4,8 GB), más la caché KV; con contexto moderado es razonable reservar 6-8 GB de VRAM. Estimación propia a partir del tamaño del artefacto, no publicada por el autor.
- GPU recomendadas para ALLaM Q4_K_M: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090; en GPUs de 8 GB puede caber con contexto reducido. A100/H100 solo tienen sentido si se sirven muchas réplicas o se necesita mucho contexto.
- Ejecución en CPU: viable con llama.cpp para el pack ALLaM, recomendable con 16 GB de RAM o más; los packs Marian int8 en CTranslate2 están diseñados para CPU y su huella es mucho menor.
- Opciones de despliegue: llama.cpp y Ollama para el GGUF; CTranslate2 (incluido su servidor) para Marian. El repositorio no incluye plantillas de vLLM ni TGI, y el formato GGUF/CTranslate2 no es directamente compatible con esos servidores sin conversión.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependerán del hardware, del número de hilos y de la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pack ALLaM-7B Q4_K_M (este repositorio) | 7.000.559.616 | no disponible | GGUF Q4_K_M | Apache-2.0 | Publico en este repositorio |
| `humain-ai/ALLaM-7B-Instruct-preview` (upstream) | 7B | no disponible | safetensors | Apache-2.0 | Publico en Hugging Face |
| Pack OPUS-MT en→ar int8 (este repositorio) | no disponible | no disponible | CTranslate2 int8 | CC-BY-4.0 | Publico en este repositorio |
| `Helsinki-NLP/opus-mt-tc-big-en-ar` (upstream) | no disponible | no disponible | safetensors | CC-BY-4.0 | Publico en Hugging Face |
| Pack OPUS-MT ar→en int8 (este repositorio) | no disponible | no disponible | CTranslate2 int8 | CC-BY-4.0 | Publico en este repositorio |
| `Helsinki-NLP/opus-mt-tc-big-ar-en` (upstream) | no disponible | no disponible | safetensors | CC-BY-4.0 | Publico en Hugging Face |

La comparación relevante es frente a los originales upstream: este repositorio no aporta pesos nuevos, sino versiones cuantizadas y con formato listo para runtime. No se incluyen comparaciones con alternativas como NLLB-200 o MADLAD-400 porque no hay datos verificados en la información proporcionada; cualquier comparación de calidad de traducción exigiría evaluar BLEU/COMET por cuenta propia.

## Limitaciones y advertencias

- No es un modelo único: es un repositorio multi-pack. Descargar el repositorio completo no equivale a cargar un modelo; hay que seleccionar el pack y el runtime correspondiente.
- Los packs Marian requieren los cinco ficheros de la carpeta de dirección seleccionada; una descarga parcial produce fallos de carga.
- La licencia es compuesta y depende del pack: Apache-2.0 para ALLaM y CC-BY-4.0 para OPUS-MT. CC-BY-4.0 exige atribución a Helsinki-NLP/OPUS-MT en los usos derivados; conviene revisar `LICENSE.md` antes de un despliegue comercial.
- El empaquetado por parte de Falcon no implica respaldo de los autores originales, tal como advierte la propia model card.
- Reproducibilidad incompleta en los packs Marian: no se registró el entorno exacto del conversor, por lo que la identidad de los artefactos depende únicamente de los hashes SHA-256 del manifiesto.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.
- No hay benchmarks publicados, ni de calidad de traducción ni de rendimiento del LLM; cualquier decisión en producción debe apoyarse en una evaluación propia.
- Riesgo de alucinación inherente al pack ALLaM-7B: es un modelo de 7B sin datos publicados de entrenamiento ni de alineación en esta ficha.
- Cobertura lingüística limitada a inglés y árabe; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada: planificar los pipelines con margen y truncar de forma explícita.
- El OCR no está incluido: depende de repositorios externos de PaddlePaddle y de binarios nativos no replicados aquí.
- Las actualizaciones de ficheros en el repositorio no actualizan una aplicación ya fijada a una versión; hay que descargar por commit SHA completo, no por `main` ni por etiquetas mutables, y verificar tamaño y SHA-256 antes de cargar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anushkrishna/falcon-models
- Modelo base ALLaM: https://huggingface.co/humain-ai/ALLaM-7B-Instruct-preview
- Modelo base OPUS-MT en→ar: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-ar
- Modelo base OPUS-MT ar→en: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-ar-en
- Licencias y atribución del repositorio: https://huggingface.co/anushkrishna/falcon-models/blob/main/LICENSE.md
- Manifiesto con revisiones, tamaños y SHA-256: https://huggingface.co/anushkrishna/falcon-models/blob/main/manifest.json
- Model cards originales preservadas: https://huggingface.co/anushkrishna/falcon-models/tree/main/sources
- Pack ALLaM en GGUF Q4_K_M: https://huggingface.co/anushkrishna/falcon-models/resolve/main/allam/allam-7b-instruct-preview-Q4_K_M.gguf
- Pack Marian en→ar (CTranslate2): https://huggingface.co/anushkrishna/falcon-models/tree/main/marian/en-ar
- Pack Marian ar→en (CTranslate2): https://huggingface.co/anushkrishna/falcon-models/tree/main/marian/ar-en

Nota: la búsqueda web asociada a esta consulta no devolvió enlaces técnicos relevantes sobre el modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.
