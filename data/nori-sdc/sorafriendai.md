# nori-sdc/SoraFriendAI

## Resumen

SoraFriendAI es un adaptador de modelo de lenguaje empaquetado como GGUF, desarrollado por nori-sdc (株式会社ソフトウエア開発) para su uso exclusivo dentro de la aplicación iOS SoraFriendAI («SoraTomo»). No se trata de un modelo de propósito general: está ajustado sobre una base Qwen3.5-4B para responder a un contrato de operaciones concreto definido por la aplicación, de modo que su uso fuera de ese contexto no produce respuestas con sentido. La model card lo declara explícitamente y advierte de que el contenido, la forma y la ubicación de los artefactos cambian sin previo aviso.

El modelo se distribuye como un conjunto de cuatro ficheros (base Qwen3.5-4B en cuantización Q4_K_M, un delta F16 de la revisión r14, un proyector multimodal mmproj y un fichero de persona) que suman 3.625.762.005 bytes. La versión actual es v20261114-r14, entrenada sobre 66.849 líneas de material didáctico y un contrato de 224 operaciones. La inferencia está pensada para ejecutarse en el dispositivo (iPhone con iOS 18 o superior y 8 GB de memoria), no en servidores.

Su relevancia es acotada pero instructiva: ejemplifica el patrón de modelos «app-specific» empaquetados con manifiesto versionado, verificación SHA-256 y retorno controlado a revisiones anteriores. Es un caso de estudio de despliegue de LLM en el borde, no una alternativa a modelos abiertos de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B); delta de ajuste fino sobre la base; incluye proyector multimodal (mmproj) |
| Parametros totales | 4B (heredados de la base Qwen3.5-4B); no se especifica el tamaño del delta r14 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (base) + delta F16; mmproj aparte |
| Idiomas soportados | japones (ja) |
| Licencia | Apache License 2.0 |
| Formato de pesos | GGUF (base Q4_K_M, delta F16, mmproj, persona) |
| Tamano del paquete | 3.625.762.005 bytes en 4 ficheros; persona de 3.925 bytes (limite de 64 KiB en dispositivo) |
| Version actual | v20261114-r14 (2026-11-14) |
| Requisito de app | build 369 o superior |
| Plataforma objetivo | iOS 18+, iPhone con 8 GB de memoria |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de 4.000 millones de parámetros (Qwen3.5-4B, procedente de Qwen/Qwen3.5-4B vía unsloth/Qwen3.5-4B), cuantizado a Q4_K_M y complementado con un delta de ajuste fino en F16 que se aplica como revisión. El paquete incluye además un proyector multimodal (mmproj) reutilizado de la base y un fichero de persona que define el perfil del asistente. La model card indica que no se han identificado el commit exacto del snapshot ni el commit de llama.cpp usados en la creación.

El entrenamiento de r14 parte del material de r13 (65.722 líneas) y lo adapta al contrato de operaciones vigente (de 221 a 224 entradas), añadiendo 341 líneas × 3 del «lote de contrato», hasta 66.849 líneas. Cubre el vocabulario de copia de seguridad, el recuento de «experiencia» (suma acumulada de estados de ánimo), la distinción entre estado de ánimo y vínculo actuales, la apertura de ajustes por voz, las pistas de nombres de reunión, el inicio de actividades de juego y las pantallas de pasos y actividad. El material de respuestas consta de 298 líneas e incluye instrucciones para no inventar cuando falta contexto previo. La revisión adoptada fue `sora4_1113_1505_A_ep3.gguf`. La persona se mantiene idéntica a r13 y r10, redistribuida bajo el nombre r14, con `profile_learned: true`.

## Capacidades

- Generación de texto en japonés ceñida al contrato de operaciones de la aplicación SoraFriendAI (224 operaciones en r14).
- Interpretación de instrucciones de voz y texto para abrir ajustes, iniciar actividades y gestionar copias de seguridad del dispositivo.
- Distinción entre estados afectivos del asistente (estado de ánimo actual frente a experiencia acumulada y vínculo).
- Gestión de «pizarra» (黒板) y registros con control de confusiones entre entradas.
- Soporte multimodal vía mmproj (proyector heredado de la base; el alcance efectivo dentro de la app no se detalla).
- Perfil de persona aprendido (`profile_learned: true`) que la app usa para limitar el preámbulo de perfil.
- Ejecución local en dispositivo, sin llamadas a servidor.
- No soporta tool calling genérico, agentes multi-paso ni razonamiento de propósito general fuera del contrato de la app.

## Casos de uso

- Asistente conversacional embebido en la app SoraFriendAI: el modelo responde únicamente a las formas de instrucción previstas por la aplicación, gestionando el diálogo de acompañamiento en japonés dentro de un iPhone.
- Copia de seguridad y exportación guiada: reconoce tanto «crear copia de seguridad» como «copiar fuera del iPhone» y ejecuta el flujo correspondiente, con verificación SHA-256 de los ficheros descargados.
- Consulta de estado afectivo acumulado: responde a preguntas como «¿cuántos corazones acumulados hay?» diferenciando el total histórico del estado actual.
- Apertura de ajustes por voz: interpreta la orden hablada y abre la pantalla de configuración correspondiente sin navegación manual.
- Inicio de actividades de juego: arranca las dinámicas lúdicas de la app a partir de instrucciones en lenguaje natural.
- Consulta de pasos y actividad: presenta las pantallas de actividad física dentro del flujo conversacional.
- Distribución versionada en el borde: sirve como referencia para implementar manifiestos con revisión fija, retorno a versión anterior y bloqueo de actualizaciones por build mínima.

## Benchmarks y rendimiento

Datos de la evaluación de desarrollo aportados por el autor (2026-11-13), sobre el conjunto de pruebas interno:

| Prueba | r14 | r13 (referencia) |
|---|---|---|
| Verificación del lote de contrato | 43/45 (argumentos 12/13) | no disponible |
| Pizarra | 18/20 | 19/20 |
| Confusión de registros | 19/20 | no disponible |
| Verificación r11 | 10/10 | no disponible |
| Verificación r9 | 25/26 | 26/26 |
| play7 | 192/196 | 189/196 |
| Lenguaje coloquial | 270/274 | no disponible |
| Ejecución inmediata de operaciones peligrosas | 0 | no disponible |

La verificación de hechos sobre «Sora» no se ejecutó en esta ronda y no se han repetido las evaluaciones durante la preparación. Las pruebas en dispositivo las realizó la revisora «Akane» entre el 13 y el 14 de noviembre de 2026 en un iPhone 16 Pro Max con build 369; no hubo prueba independiente por parte del responsable de preparación de la distribución. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/espacio: paquete de 3.625.762.005 bytes; requiere un iPhone con 8 GB de memoria como referencia (iOS 18 o superior).
- GPU de escritorio: no disponible; el modelo está pensado para inferencia en dispositivo vía la app, no para despliegue en servidor.
- Cabe en GPU de consumo: no se documenta; el formato GGUF Q4_K_M permitiría teóricamente su carga en llama.cpp, pero el ajuste está atado al contrato de la app y no tendría utilidad fuera de ella.
- Opciones de despliegue: exclusivamente la app SoraFriendAI (build 369 o superior) mediante su manifiesto `manifest.json`; no se documenta soporte para vLLM, TGI, Ollama ni llama.cpp independiente.
- Latencia y throughput: no disponible.
- Almacenamiento y verificación: la app comprueba el SHA-256 de cada fichero descargado; el fichero de persona debe caber en el límite de 64 KiB del dispositivo (ocupa 3.925 bytes).
- En TestFlight la restricción de carga por requisitos de memoria está desactivada actualmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| SoraFriendAI (r14) | 4B (base Qwen3.5-4B) | no disponible | Apache 2.0 | GGUF vía manifiesto de la app; 0 descargas | Ajuste para un contrato de operaciones de una app iOS concreta |
| Qwen3.5-4B (base) | 4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (Qwen/Qwen3.5-4B) | Modelo generalista multilingüe |
| unsloth/Qwen3.5-4B | 4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (unsloth/Qwen3.5-4B) | Distribución optimizada de la base para ajuste fino |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Uso restringido: el modelo no produce respuestas con sentido fuera del contrato de operaciones de la app; no es apto para conversación general ni para uso como modelo base.
- Estado experimental: la model card advierte de que el contenido, la forma y la ubicación pueden cambiar sin aviso, y que no se garantiza calidad ni estabilidad.
- Idioma: solo japonés; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto: la longitud de contexto no está documentada; el material de respuestas incluye instrucciones para no inventar cuando falta contexto previo, lo que sugiere ventanas cortas en la práctica.
- Alucinación: el entrenamiento incluye pautas explícitas contra la fabricación de hechos cuando no hay historial, pero no se han ejecutado las pruebas de verificación de hechos en r14.
- Actualizaciones: no existe retorno automático a la versión anterior en dispositivos que ya han cargado r14; cambiar `current` en el manifiesto no garantiza detener cargas en curso o ya aceptadas.
- Integridad: la app verifica SHA-256, pero la cadena de suministro de la base (commit del snapshot y de llama.cpp) no está identificada.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones y atribuciones del modelo base Qwen3.5-4B, que deben conservarse.
- Sin adopción: 0 descargas y 0 «likes» en Hugging Face; no hay validación externa de la comunidad.
- Las pruebas en dispositivo las reporta la propia revisora del proyecto; no hay verificación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nori-sdc/SoraFriendAI
- Repositorio de cabezas GGUF (etiquetas por revisión): https://huggingface.co/nori-sdc/Qwen3.5-4B-SoraFriendAI-GGUF
- Revisión actual r14: https://huggingface.co/nori-sdc/Qwen3.5-4B-SoraFriendAI-GGUF/tree/v20261114-r14
- Revisión de retorno r13: https://huggingface.co/nori-sdc/Qwen3.5-4B-SoraFriendAI-GGUF/tree/v20261111-r13
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen3.5-4B
- Modelo base (Qwen): https://huggingface.co/Qwen/Qwen3.5-4B
