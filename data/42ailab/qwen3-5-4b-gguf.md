# 42ailab/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B es el escalón de 4B parámetros de la serie Qwen3.5, desarrollada por el equipo Qwen de Alibaba y publicada bajo licencia Apache-2.0. El modelo está orientado a generación de texto conversacional y escritura fluida en chino, con un enfoque de despliegue ligero en ordenadores personales, e incorpora capacidad de lectura de imágenes (pipeline image-text-to-text). Cuenta con 4.205.751.296 parámetros totales según los pesos en safetensors del modelo original.

El repositorio analizado, `42ailab/Qwen3.5-4B-GGUF`, no es un modelo nuevo ni una conversión propia: es una copia de seguridad byte a byte de dos ficheros GGUF convertidos por unsloth y publicados originalmente en `unsloth/Qwen3.5-4B-GGUF`. La motivación declarada es preservar los bytes originales ante posibles renombrados, borrados o reemplazos in situ del repositorio del conversor. Los ficheros incluidos son los pesos en cuantización Q4_K_M (2,55 GiB) y el proyector de visión en F16 (641,3 MiB), con digests sha256 que coinciden con el original.

Su relevancia práctica es doble: por un lado, ofrece una vía de despliegue local de un modelo multimodal de 4B en hardware de consumo gracias a la cuantización Q4_K_M; por otro, el empaquetado está pensado para la aplicación de escritorio 42model, que permite descargar el modelo desde su biblioteca o mediante el comando `42model download qwen3.5:4b-q4_k_m`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal texto-imagen de la serie Qwen3.5; detalles de capas y atención no publicados en la informacion disponible) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (pesos); proyector de vision en F16 |
| Idiomas soportados | no disponible (la model card destaca escritura fluida en chino y chat cotidiano) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Qwen3.5-4B-Q4_K_M.gguf`, `mmproj-F16.gguf`); el modelo original se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos sobre la arquitectura interna del modelo en la información proporcionada: no se especifican el tipo de transformer, el número de capas, la configuración de atención ni si emplea técnicas como atención lineal o decodificación especulativa. Lo que sí se deduce de los artefactos es que se trata de un modelo multimodal: además de los pesos principales en GGUF, el repositorio incluye un proyector de visión independiente (`mmproj-F16.gguf`, 641,3 MiB), lo que confirma la integración de un codificador visual con el modelo de lenguaje.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card únicamente indica que el modelo fue construido por el equipo Qwen de Alibaba y liberado bajo Apache-2.0, y que la conversión a GGUF fue realizada por unsloth. El repositorio de 42ailab se limita a replicar esos ficheros sin modificación alguna, verificables mediante los digests sha256 publicados.

## Capacidades

- Generación de texto conversacional y escritura fluida, con especial énfasis en chino según la model card.
- Comprensión de imágenes (image-text-to-text) mediante el proyector de visión incluido en formato F16.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia estándar.
- Uso de imatrix en la cuantización (`imatrix`), técnica que mejora la calidad de los pesos cuantizados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en escritorio: el modelo puede ejecutarse en un ordenador personal mediante la aplicación 42model o con llama.cpp, gestionando conversaciones cotidianas con un consumo de disco de 2,55 GiB para los pesos en Q4_K_M, lo que lo hace adecuado para equipos sin GPU dedicada de gama alta.
- Descripción y análisis de imágenes en local: gracias al proyector de visión F16, se puede usar para tareas como alt-text automático, extracción de información de capturas o clasificación de imágenes, sin enviar datos a servicios en la nube.
- Escritura y edición en chino: la model card destaca su fluidez en chino, por lo que encaja en herramientas de redacción, resumen o corrección de textos para usuarios y equipos hispanohablantes que trabajen con contenido en ese idioma.
- Prototipado rápido de aplicaciones multimodales: al ser compatible con endpoints y estar en GGUF, se puede levantar un servidor de inferencia local (llama.cpp server, Ollama u otros) para validar flujos de visión-lenguaje antes de invertir en modelos mayores.
- Preservación de artefactos en pipelines de MLOps: el repositorio actúa como espejo verificable (sha256 idénticos) de los GGUF de unsloth, útil para organizaciones que necesitan garantizar la reproducibilidad de sus descargas ante cambios en repositorios de terceros.
- Chat de soporte ligero en entornos con recursos limitados: con 4B parámetros y cuantización Q4_K_M, puede desplegarse en portátiles o mini-PC para asistentes de atención básica, siempre que se validen previamente sus limitaciones idiomáticas y de contexto.
- Evaluación comparativa de cuantizaciones: al disponer de los pesos en Q4_K_M y el proyector en F16, sirve para medir la degradación de calidad frente al modelo original en safetensors en tareas de texto e imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GiB para los pesos Q4_K_M, más el proyector de visión F16 (unos 0,64 GiB) y la caché KV, que depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: no se especifican en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo con 6-8 GB de VRAM o más; tarjetas profesionales como A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 6 GB o más de VRAM; también puede ejecutarse en CPU, dado el tamaño reducido de los pesos cuantizados.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), la aplicación de escritorio 42model (`42model download qwen3.5:4b-q4_k_m`), y servidores compatibles con endpoints. El soporte específico en vLLM, TGI u Ollama no se detalla en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B (este, GGUF) | 4.205.751.296 | no disponible | Apache-2.0 | GGUF (Q4_K_M) + proyector F16 | Multimodal texto-imagen; copia de seguridad de la conversión de unsloth |
| Qwen3-4B-GGUF | 4B | no disponible | no disponible en la información | GGUF | Generación de texto; modelo de la generación anterior de Qwen |
| Qwen3.5-4B original (Qwen/Qwen3.5-4B) | 4.205.751.296 | no disponible | Apache-2.0 | safetensors | Pesos sin cuantizar distribuidos por el equipo Qwen |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo propio ni una conversión de 42ailab: es una copia byte a byte de dos ficheros de `unsloth/Qwen3.5-4B-GGUF`. Cualquier actualización del modelo original no se reflejará automáticamente aquí.
- Solo se incluyen dos ficheros (Q4_K_M y el proyector F16); no hay otras cuantizaciones ni los pesos en safetensors en este repositorio.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar cargas de trabajo con ventanas largas sin verificación previa.
- Los idiomas soportados no están listados formalmente; la model card enfatiza el chino, por lo que el rendimiento en castellano u otros idiomas debe validarse empíricamente.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4B parámetros; en tareas factuales o de razonamiento complejo se recomienda verificación humana.
- No hay información sobre sesgos conocidos ni sobre evaluaciones de seguridad del modelo.
- La licencia Apache-2.0 permite uso comercial, pero conviene conservar la atribución al equipo Qwen y a unsloth por la conversión; el fichero LICENSE del repositorio proviene del repositorio oficial Qwen/Qwen3.5-4B.
- La cuantización Q4_K_M introduce una pérdida de precisión respecto al modelo original en safetensors; para tareas sensibles a la calidad conviene evaluar la degradación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de su uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/Qwen3.5-4B-GGUF
- Repositorio espejo en ModelScope: https://modelscope.cn/models/42ailab/Qwen3.5-4B-GGUF
- Conversión original de unsloth: https://www.modelscope.cn/models/unsloth/Qwen3.5-4B-GGUF
- Modelo original de Qwen: https://modelscope.cn/models/Qwen/Qwen3.5-4B
- Aplicación 42model: https://42model.com
- Sitio del autor: https://42ailab.com
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-4b.html
- Qwen3-4B-GGUF (generación anterior): https://huggingface.co/Qwen/Qwen3-4B-GGUF
