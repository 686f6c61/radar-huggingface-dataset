# Inaba2Meguru/DiffusorRT-Android-Qwen3.5-4B-DFlash-Q4-V79

## Resumen

DiffusorRT-Android-Qwen3.5-4B-DFlash-Q4-V79 es un paquete de ejecución compilado para Android derivado del modelo borrador (draft) DFlash de Qwen3.5-4B, publicado por el usuario Inaba2Meguru. No se trata de un checkpoint entrenado desde cero ni de un modelo autónomo: es un artefacto de despliegue que contiene binarios de contexto `qnn.htp` (QAIRT 2.45.0.260326) compilados para ejecutarse en la NPU Hexagon V79 del SoC Qualcomm Snapdragon 8 Elite (SM8750). El modelo se distribuye en cuantización de 4 bits y está pensado exclusivamente para integrarse en la aplicación DiffusorRT para Android.

Su función es la de modelo borrador opcional dentro del paquete DiffusorRT Android Qwen3.5-4B-Q4, por lo que no puede responder de forma independiente: depende de un modelo principal para generar salida. El repositorio ocupa 0,7 GB y su licencia es MIT. La relevancia actual radica en que ejemplifica el patrón de distribución de modelos LLM compilados para NPU móvil, un formato muy distinto del checkpoint Transformers tradicional, con implicaciones claras sobre portabilidad y reutilización.

Al estar compilado para un SoC concreto, el artefacto no es portable a otras GPU, NPU ni a servidores convencionales. Cualquier evaluación de sus capacidades lingüísticas debe remitirse al modelo base `z-lab/Qwen3.5-4B-DFlash`, ya que esta ficha solo puede documentar el empaquetado y las condiciones de ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto compilado para NPU Hexagon V79; arquitectura del modelo base no especificada) |
| Parámetros totales | 4B (según el nombre del modelo base Qwen3.5-4B-DFlash) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (Q4); binarios de contexto qnn.htp |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | binarios de contexto `qnn.htp` (QAIRT 2.45.0.260326); no es safetensors ni GGUF |
| Tamaño del repositorio | 0,7 GB (0,98 GB en total con los ficheros descargados del pack de iPhone) |
| SoC objetivo | Qualcomm Snapdragon 8 Elite (SM8750), Hexagon V79 |
| Modelo base | z-lab/Qwen3.5-4B-DFlash (revisión 96899cc2) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación del modelo base `z-lab/Qwen3.5-4B-DFlash`. La model card de este repositorio no documenta ningún detalle de entrenamiento, y el artefacto publicado no es un checkpoint entrenable sino un conjunto de binarios compilados.

El elemento técnico diferencial es el pipeline de compilación: los pesos del modelo base se han convertido a formato de contexto QNN mediante QAIRT 2.45.0.260326 y se han compilado para el backend HTP (Hexagon Tensor Processor) del SoC SM8750. El paquete incluye el fichero `android-pack.json`, que especifica para cada fichero su ruta dentro de la carpeta de modelos de la app (`Android/data/ai.diffusorrt.phone/files/models/qwen35-4b-dflash-q4-v79/`), su tamaño y su hash SHA-256, además de la referencia al repositorio, revisión y ruta de descarga cuando el fichero proviene del pack de iPhone. La ejecución se apoya en el paquete de ejecución del pack DiffusorRT para iPhone, reutilizado sin cambios.

## Capacidades

- Modelo borrador (draft) para decodificación especulativa dentro del paquete DiffusorRT; no genera respuestas por sí solo.
- Ejecución en la NPU Hexagon V79 del Snapdragon 8 Elite mediante binarios `qnn.htp`.
- Integración con la aplicación DiffusorRT para Android a través de `android-pack.json` (rutas, tamaños y SHA-256 de cada fichero).
- Capacidades lingüísticas, de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada (dependen del modelo base y no se documentan aquí).
- Soporte multilingüe: no disponible.

## Casos de uso

- Despliegue de inferencia LLM en dispositivo en smartphones Snapdragon 8 Elite: el paquete permite ejecutar el modelo borrador en la NPU del teléfono, reduciendo el consumo energético frente a la ejecución en CPU o GPU.
- Aceleración de decodificación especulativa en la app DiffusorRT: al actuar como draft model, se usa para proponer tokens que el modelo principal verifica, lo que puede aumentar el throughput de generación en el dispositivo.
- Integración en la aplicación DiffusorRT para Android: los desarrolladores pueden fijar el repositorio a un commit concreto y usar `android-pack.json` para automatizar la descarga y verificación de ficheros en la carpeta de modelos de la app.
- Verificación de integridad en pipelines de distribución: los hashes SHA-256 incluidos permiten validar cada fichero antes de cargarlo en la NPU.
- Pruebas de rendimiento en hardware móvil: útil para medir latencia y consumo de un modelo de 4 bits en Hexagon V79 con prompts y dispositivos concretos.
- Referencia para empaquetado de modelos compilados: sirve como ejemplo de estructura de distribución de artefactos QNN para Android en proyectos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que los resultados de hardware, cuando se reportan, son específicos del dispositivo y del prompt utilizado.

## Requisitos de hardware

- SoC: Qualcomm Snapdragon 8 Elite (SM8750) exclusivamente; los binarios de contexto solo se ejecutan en la NPU Hexagon V79 de ese SoC.
- VRAM: no aplica; la ejecución es en NPU móvil, no en GPU de escritorio.
- GPU recomendadas: no aplica; no hay soporte para A100, H100, RTX 4090 ni otras GPU.
- Ejecución en GPU de consumo: no es posible con este artefacto.
- Opciones de despliegue: únicamente la aplicación DiffusorRT para Android con QAIRT 2.45.0.260326; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: 0,7 GB para este repositorio; 0,98 GB en total al incluir los ficheros descargados del pack de iPhone.
- Latencia y throughput: no disponibles; dependen del dispositivo y del prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| DiffusorRT-Android-Qwen3.5-4B-DFlash-Q4-V79 | 4B | no disponible | qnn.htp (4 bits) | MIT | Snapdragon 8 Elite (Hexagon V79) |
| z-lab/Qwen3.5-4B-DFlash | 4B | no disponible | no disponible | no disponible | Checkpoint upstream |
| jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-DFlash-Q4 | 4B | no disponible | paquete para iPhone | no disponible | iPhone (pack de ejecución reutilizado) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede responder por sí solo y requiere el modelo principal del paquete DiffusorRT.
- Portabilidad nula: los binarios solo se ejecutan en la NPU Hexagon V79 del Snapdragon 8 Elite (SM8750); no funcionan en otros SoC, GPU ni servidores.
- No es un checkpoint Transformers: no puede cargarse con `transformers`, vLLM, llama.cpp ni herramientas equivalentes.
- Dependencia de la app DiffusorRT y de la versión QAIRT 2.45.0.260326; cambios de versión pueden romper la compatibilidad.
- Dependencia de ficheros externos: parte del paquete se descarga del repositorio de iPhone en la revisión 062263e6, por lo que la disponibilidad depende de ese repositorio de terceros.
- Idiomas, sesgos, riesgo de alucinación y limitaciones de contexto: no disponibles en la información proporcionada; deben evaluarse sobre el modelo base.
- Licencia MIT declarada, pero los derechos del modelo base y del pack de iPhone pertenecen a sus autores originales; revisar `LICENSE` y `NOTICE` antes de uso comercial.
- Repositorio sin descargas ni likes y creado en 2026-11-23; sin validación comunitaria documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Inaba2Meguru/DiffusorRT-Android-Qwen3.5-4B-DFlash-Q4-V79
- Modelo base: https://huggingface.co/z-lab/Qwen3.5-4B-DFlash/tree/96899cc270945f554998309580b08a04a05a3187
- Pack de iPhone (origen de los ficheros de ejecución): https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-DFlash-Q4/tree/062263e612c4e322656d51be45e912f9e611b441
