# OpenWhispr/openwhispr-cleanup-4b-GGUF

## Resumen

OpenWhispr Cleanup 4B es un modelo de lenguaje especializado en la limpieza de transcripciones dictadas por voz. Lo desarrolla OpenWhispr, el equipo detrás de la aplicación de dictado del mismo nombre, y parte de un fine-tuning mediante LoRA (posteriormente fusionado) sobre Qwen/Qwen3.5-4B. Su función es muy acotada: recibe un texto transcrito por un sistema de reconocimiento de voz y devuelve ese mismo texto depurado, sin responder ni actuar sobre el contenido.

El modelo elimina muletillas y arranques en falso, aplica autocorrecciones habladas ("strike that", "I mean"), normaliza números, puntuación y listas, y respeta el diccionario personalizado y las líneas de tono que define la aplicación OpenWhispr. No es un asistente general: está entrenado para devolver exclusivamente la transcripción limpia.

Se distribuye en formato GGUF con cuantización Q4_K_M (2,7 GB) para ejecutarse localmente con llama.cpp, de modo que el procesamiento no sale del dispositivo del usuario. Con 4.205.751.296 parámetros y licencia Apache 2.0, es relevante para desarrolladores que necesiten una etapa de postprocesado de dictado ligera, privada y ejecutable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B), fine-tuning LoRA fusionado |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | ingles (principal); otros idiomas no evaluados en profundidad |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3.5-4B y se obtiene mediante un fine-tuning con LoRA que después se fusiona en los pesos base, para luego convertirse a GGUF con llama.cpp. El repositorio solo publica la variante Q4_K_M, de 2.708.804.512 bytes, con SHA-256 `b974dae70e7ae0a8787069f53f2280593153187d82891283b297bf67d10aae8b`.

El conjunto de entrenamiento consta de aproximadamente 9.900 filas construidas a partir de tres fuentes públicas (el *Dictation cleanup dataset* de Abhishek Barali bajo CC BY 4.0, *Disfl-QA* de Google Research bajo CC BY 4.0 y *DisfluencySpeech* de AMAAI Lab bajo Apache 2.0, usando solo columnas de texto), complementadas con entradas generadas por programa (muletillas, correcciones, números hablados, puntuación). Las respuestas fueron reescritas por Claude (Anthropic) bajo una instrucción fija y verificadas programáticamente. El autor declara que no se utilizaron datos de usuarios de OpenWhispr. El modelo está entrenado para un formato de prompt exacto: system con la instrucción de limpieza y la línea de idioma, y user con el transcript entre etiquetas `<transcript>`, con thinking desactivado y temperatura 0.

## Capacidades

- Limpieza de transcripciones de dictado: eliminación de muletillas y arranques en falso.
- Aplicación de autocorrecciones habladas ("strike that", "I mean").
- Normalización de números, puntuación y formato de listas.
- Respeto de un diccionario personalizado y de un diccionario de equipo compartido.
- Aplicación de líneas de tono definidas por la aplicación.
- Generación de correos y listas a partir del dictado (según el conjunto de "newer skills").
- Procesamiento de comandos de código dictados.
- Ejecución local sin salida de datos del dispositivo.
- No soporta tool calling, agentes ni razonamiento multi-step por diseño; no responde al contenido dictado.

## Casos de uso

- Postprocesado de dictado en la aplicación OpenWhispr: el modelo recibe la salida del sistema de reconocimiento de voz y devuelve el texto limpio, ejecutándose en local con llama.cpp para preservar la privacidad del usuario.
- Integración en pipelines de transcripción propios: cualquier desarrollador puede insertar el modelo como etapa de normalización entre un ASR y el texto final, dividiendo entradas de más de 600 palabras en frases para mantener la calidad.
- Aplicaciones de notas por voz: limpieza de dictados largos con correcciones habladas y normalización de cifras antes de almacenar la nota.
- Generación de correos dictados: el modelo aplica las líneas de tono configuradas y produce un texto con formato de correo a partir del dictado en bruto.
- Creación de listas a partir de voz: conversión de un dictado enumerado en una lista con viñetas y puntuación correcta.
- Herramientas de accesibilidad: asistencia a usuarios que dictan en lugar de teclear, con limpieza automática del texto antes de insertarlo en el campo de destino.
- Entornos con requisitos de privacidad: al ejecutarse en el dispositivo con un GGUF de 2,7 GB, encaja en flujos donde no se permite enviar audio ni texto a servicios en la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test congelado de limpieza de dictado v2 (1.938 filas contadas) y 530 filas de habilidades más recientes, evaluados en un Mac con llama.cpp b12110:

| Prueba | Tasa de acierto |
|---|---|
| Test v2 | 74,0 % |
| Habilidades recientes (diccionario, tono, correos, listas, "strike that", comandos de código) | 88,1 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3 GB con la cuantización Q4_K_M publicada (fichero de 2,7 GB más overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sin problema.
- Cabe en GPU de consumo: sí, en modelos con 4 GB o más de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (llama-server), con soporte de plantilla Jinja y `--reasoning-budget 0`; compatible con endpoints según los tags del repositorio. No se indica soporte explícito de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| OpenWhispr Cleanup 4B | 4,2 B | no disponible | GGUF (Q4_K_M) | Apache 2.0 | Limpieza de dictado especializada |
| Qwen/Qwen3.5-4B (base) | 4,2 B | no disponible | safetensors y otros | Apache 2.0 (según modelo base) | Modelo generalista |
| Alternativas especializadas en limpieza de dictado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está orientado principalmente al inglés; otros idiomas pasan por la misma instrucción pero fueron evaluados con mucha menor exhaustividad.
- Puede alterar cifras ocasionalmente (por ejemplo, "125" a "120.5"), sobre todo en dictados muy largos; se recomienda dividir entradas de más de 600 palabras en frases.
- No es un asistente general: está entrenado para devolver únicamente la transcripción limpia y no debe usarse para responder preguntas ni ejecutar acciones.
- El formato de prompt está fijado: system con la instrucción exacta y user con `<transcript>...</transcript>`; otras formas degradan el rendimiento.
- Requiere thinking desactivado y temperatura 0 para un funcionamiento óptimo.
- Solo se publica una cuantización (Q4_K_M); no hay variantes de mayor o menor precisión en el repositorio.
- Riesgo de alucinación inherente a los modelos de lenguaje, aunque acotado por la tarea de reescritura; no se documentan sesgos específicos.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar las condiciones de las fuentes de datos de entrenamiento citadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenWhispr/openwhispr-cleanup-4b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Aplicación OpenWhispr: https://openwhispr.com
- Repositorio de OpenWhispr: https://github.com/OpenWhispr/openwhispr
- Dictation cleanup dataset (Abhishek Barali): https://github.com/AbhishekBarali/dictation-cleanup-dataset
- Disfl-QA (Google Research): https://github.com/google-research-datasets/Disfl-QA
- DisfluencySpeech (AMAAI Lab): https://huggingface.co/datasets/amaai-lab/DisfluencySpeech
