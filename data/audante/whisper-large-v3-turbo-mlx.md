# Audante/whisper-large-v3-turbo-mlx

## Resumen

Audante/whisper-large-v3-turbo-mlx es una redistribucion del modelo Whisper large-v3-turbo de OpenAI en formato MLX, el framework de computacion tensorial de Apple para ejecutar modelos sobre silicio de la serie M. El autor del repositorio, Audante, no introduce ninguna modificacion: se trata de una copia byte a byte de la revision `a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb` del repositorio mlx-community/whisper-large-v3-turbo, que a su vez es la conversion oficial de la comunidad MLX del checkpoint original de OpenAI.

El modelo resuelve el problema de reconocimiento automatico del habla (ASR) con una variante "turbo" de la familia Whisper large-v3, pensada para reducir el coste de decodificacion manteniendo una calidad cercana al modelo grande. Al estar empaquetado en MLX, resulta directamente utilizable en Macs con chip Apple Silicon mediante la libreria `mlx` y herramientas derivadas, sin necesidad de GPU dedicada.

La relevancia de este repositorio concreto es limitada: se trata de un espejo sin cambios, con cero descargas y cero likes en el momento de la consulta, creado en noviembre de 2026. Para uso practico conviene acudir al repositorio de origen de mlx-community, que es el que mantiene la conversion y recibe actualizaciones. El tamano del repo es de 1,6 GB y la licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), variante large-v3-turbo |
| Parametros totales | no disponible (la variante turbo de Whisper large-v3 se situa en el orden de 800M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (el repo de 1,6 GB sugiere pesos en precision reducida, pero no se especifica el esquema) |
| Idiomas soportados | no disponible en la metadata del repo; Whisper large-v3 es multilingue por diseno, pero no se detalla la lista |
| Licencia | MIT |
| Formato de pesos | MLX (pesos nativos del framework `mlx`, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder entrenado para transcripcion y traduccion de voz. El encoder procesa espectrogramas mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales de idioma y tarea. La variante large-v3-turbo reduce el numero de capas del decoder respecto a large-v3 para acelerar la inferencia, manteniendo el encoder grande; es la misma logica que emplea OpenAI en su familia turbo.

No se dispone en la informacion proporcionada de detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste fino con RLHF o DPO. La model card del repositorio es minima y se limita a declarar que los ficheros son identicos a los de mlx-community. La conversion a MLX implica un cambio de formato de pesos y de backend de ejecucion, no un reentrenamiento.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en modo batch.
- Transcripcion multilingue y traduccion de voz a texto en ingles, segun el diseno original de Whisper (la lista concreta de idiomas no se detalla en el repo).
- Segmentacion con marcas de tiempo a nivel de segmento, capacidad inherente al modelo base.
- Ejecucion sobre Apple Silicon mediante MLX, con aceleracion por GPU unificada.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta modo "thinking", vision ni audio mas alla de la propia entrada de voz.
- No se documenta capacidad de diarizacion de hablantes.

## Casos de uso

- Transcripcion local en Mac: el modelo puede ejecutarse integramente en un Mac con chip M1 o superior usando MLX, sin enviar audio a servicios externos, lo que resulta adecuado para material confidencial.
- Generacion de subtitulos: la salida con marcas de tiempo permite producir ficheros SRT o VTT para videos, aprovechando la ventana de 30 segundos por segmento del modelo.
- Actas de reuniones: transcripcion de grabaciones de audio de duracion media en local, con la ventaja de privacidad frente a APIs en la nube.
- Prototipado de pipelines ASR: al ser un espejo de un repo de la comunidad MLX, sirve para validar integraciones con `mlx` antes de pasar a produccion con el repositorio de origen.
- Traduccion de audio a texto en ingles: util para contenidos en otros idiomas que se necesiten en ingles, dentro de las capacidades multilingues heredadas de Whisper.
- Investigacion y evaluacion: comparar el rendimiento de Whisper large-v3-turbo en MLX frente a otras implementaciones (PyTorch, whisper.cpp) sobre el mismo hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 1,6 GB, por lo que los pesos caben holgadamente en la memoria unificada de cualquier Mac con Apple Silicon.
- GPU recomendadas: chips Apple M1, M2, M3 y M4 (incluidas variantes Pro, Max y Ultra) por ser el backend nativo de MLX.
- Cabe en GPU consumer: si, en el sentido de que Apple Silicon integra GPU y memoria unificada; no esta pensado para GPUs NVIDIA.
- Opciones de despliegue: libreria `mlx` de Apple y ecosistema asociado (por ejemplo `mlx-whisper`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, que no ejecutan pesos MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Audante/whisper-large-v3-turbo-mlx | no disponible | ventanas de 30 s de audio | MIT | MLX | espejo sin cambios, 0 descargas |
| mlx-community/whisper-large-v3-turbo | no disponible | ventanas de 30 s de audio | MIT | MLX | repositorio de origen, mantenido por la comunidad |
| openai/whisper-large-v3 | no disponible | ventanas de 30 s de audio | MIT | PyTorch / safetensors | checkpoint oficial de OpenAI |
| whisper.cpp (implementacion) | no disponible | ventanas de 30 s de audio | MIT | GGML | ampliamente desplegado en CPU y edge |

La diferencia practica entre este repositorio y mlx-community/whisper-large-v3-turbo es nula en contenido; solo cambia el mantenedor y la visibilidad. Frente a openai/whisper-large-v3, la variante turbo reduce coste de decodificacion a cambio de una calidad ligeramente inferior, segun el diseno de OpenAI.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no aporta mejoras, correcciones ni actualizaciones respecto al repositorio de origen.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validacion por parte de la comunidad.
- La model card no documenta la lista de idiomas, el esquema de cuantizacion ni los parametros exactos.
- Whisper puede alucinar texto en pasajes de silencio o ruido, y tiende a inventar frases plausibles en segmentos ambiguos.
- Riesgo de sesgos heredados del entrenamiento original de OpenAI, no evaluados en este repositorio.
- La licencia MIT permite uso comercial, pero los derechos del modelo siguen siendo de sus autores originales; conviene revisar el fichero LICENSE incluido.
- Dependencia total del ecosistema MLX: no es portable a GPUs NVIDIA ni a despliegues en servidor convencionales sin reconversion.
- Para produccion se recomienda usar el repositorio de origen de mlx-community o el checkpoint oficial de OpenAI, no este espejo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Audante/whisper-large-v3-turbo-mlx
- Repositorio de origen: https://huggingface.co/mlx-community/whisper-large-v3-turbo
- Modelo base de OpenAI: https://huggingface.co/openai/whisper
- Repositorio oficial de Whisper en GitHub: https://github.com/openai/whisper
- Framework MLX de Apple: https://github.com/ml-explore/mlx
