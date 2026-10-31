# ErebusTN/Athena-GGUF

## Resumen

Athena-GGUF es la colección de versiones cuantizadas en formato GGUF de Athena, un modelo de lenguaje compacto desarrollado por ErebusTN para EGen Labs. Athena se presenta como un asistente "fluido en seguridad" (security-fluent), orientado a tareas de ciberseguridad, con respuestas directas y honestidad sobre lo que no sabe, sin acceso a internet ni memoria entre conversaciones. La variante GGUF está diseñada específicamente para ejecución en CPU, portátiles y teléfonos móviles, lo que lo sitúa en la categoría de modelos edge/on-device.

El modelo base tiene 1.728.801.600 parámetros (aproximadamente 1,73 B), un tamaño que permite inferencia fluida en hardware de consumo sin necesidad de GPU dedicada. El repositorio incluye cuantizaciones desde F16 (referencia a precisión completa, 3,47 GB) hasta Q4_K_M (1,10 GB, recomendada como opción por defecto). El modelo es conversacional, soporta un modo de razonamiento que puede desactivarse, y está disponible en cuatro idiomas: inglés, árabe, francés y español.

Su relevancia actual radica en la creciente demanda de asistentes locales especializados en ciberseguridad que puedan operar sin conexión, preservando la privacidad de los datos analizados, algo especialmente valioso en contextos de respuesta a incidentes y análisis de sistemas sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer conversacional, no especificado en la model card) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés, árabe, francés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no detalla la arquitectura interna del modelo (tipo de transformer, número de capas, dimensiones de embedding ni mecanismos de atención). Tampoco publica la receta de entrenamiento en este repositorio: remite a la model card principal de ErebusTN/Athena para conocer el proceso de entrenamiento, la evaluación, el uso previsto y las limitaciones. Lo que sí indica es que se trata de un modelo conversacional con un prompt de identidad incrustado como mensaje de sistema por defecto en la plantilla de chat, y que arranca en modo non-thinking (sin razonamiento extendido).

Sobre el entrenamiento no se han publicado datos concretos en la información disponible: no hay cifra de tokens, composición del dataset ni mención de RLHF o DPO. El posicionamiento como asistente "security-fluent" sugiere un entrenamiento o ajuste fino orientado a terminología y tareas de ciberseguridad, pero la model card no lo detalla. La cuantización a GGUF se ha realizado con soporte para llama.cpp, con cinco niveles de precisión que cubren desde referencia a precisión completa (F16) hasta la opción compacta recomendada (Q4_K_M).

## Capacidades

- Generacion de texto conversacional multi-turno, con estilo de respuestas directas y reconocimiento explicito de sus limitaciones ("honest about what it doesn't know").
- Dominio orientado a ciberseguridad: la model card lo describe como asistente especializado en este campo, con advertencias especificas sobre CVE, flags de comandos y versiones, lo que indica familiaridad con estos conceptos.
- Modo de razonamiento (thinking) opcional, desactivable mediante `--reasoning off` en llama.cpp; por defecto arranca en modo non-thinking.
- Multilingüe en cuatro idiomas: inglés, árabe, francés y español.
- Ejecucion local sin internet ni memoria persistente entre conversaciones, adecuado para entornos con requisitos de privacidad.
- Servible como API compatible con OpenAI mediante `llama-server`.
- No hay evidencia en la model card de capacidades de vision, audio, tool calling ni agentes.

## Casos de uso

- Asistente de ciberseguridad en portatil sin conexion: un analista puede consultar dudas sobre conceptos de seguridad, comandos o vulnerabilidades durante una auditoria en un entorno aislado (air-gapped), garantizando que la informacion sensible no sale de la maquina.
- Respuesta a incidentes en campo: gracias a su tamano de ~1,1 GB en Q4_K_M, puede ejecutarse en un portatil o dispositivo movil durante una intervencion, ofreciendo orientacion rapida sobre procedimientos sin depender de conectividad.
- Asistente embebido en herramientas de seguridad: al servirse via `llama-server` con API compatible con OpenAI, puede integrarse como backend de consolas de gestion, scripts de analisis o dashboards internos.
- Formacion y CTFs: util como companero de aprendizaje para estudiantes de seguridad que practican en laboratorios autorizados, explicando conceptos y terminologia de forma conversacional.
- Asistente multilingue en dispositivos edge: soporte de arabe, frances, espanol e ingles permite desplegarlo en equipos de seguridad internacionales que operan en varios idiomas.
- Prototipado rapido de funciones conversacionales on-device: su bajo consumo lo hace adecuado para apps moviles que necesitan un LLM local sin degradar la bateria ni requerir GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la model principal de ErebusTN/Athena para la evaluacion, pero no incluye metricas concretas (MMLU, HumanEval, GSM8K u otras) en este repositorio.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion:
  - Q4_K_M: ~1,10 GB de archivo; con contexto y overhead, en torno a 1,5-2 GB de RAM.
  - Q5_K_M: ~1,26 GB; Q6_K: ~1,43 GB.
  - Q8_0: ~1,85 GB.
  - F16: ~3,47 GB.
- GPU recomendadas: no requiere GPU dedicada; el modelo esta pensado para CPU. En cualquier caso, cualquier GPU con 4 GB o mas de VRAM lo ejecuta con holgura.
- Cabe en GPUs de consumo de gama baja (por ejemplo, una RTX 3050 o una GTX 1660 de 6 GB) y, mas relevante, en portatiles y telefonos con 4-8 GB de RAM libres.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`, con comandos de una linea via `-hf ErebusTN/Athena-GGUF:Q4_K_M`); por formato GGUF es compatible con Ollama, LM Studio, KoboldCpp y runtimes equivalentes. No hay menion de vLLM ni TGI, que no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles; dado el tamano (~1,7 B de parametros), se espera inferencia fluida en CPU modernas, pero no hay mediciones publicadas.
- Parametros de muestreo recomendados por el autor: `temperature 0.1`, `top_k 50`, `repeat_penalty 1.1`.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque | Contexto |
|---|---|---|---|---|---|
| Athena (EGen Labs) | ~1,73 B | GGUF, safetensors | Apache 2.0 | Ciberseguridad, edge/on-device | no disponible |
| Qwen2.5-1.5B-Instruct | 1,54 B | GGUF, safetensors | Qwen (uso comercial permitido con condiciones) | Generalista, multilingue (29+ idiomas) | 32.768 tokens |
| Llama 3.2 1B Instruct | 1,24 B | GGUF, safetensors | Llama 3.2 Community License | Generalista, edge | 128.000 tokens |
| SmolLM2-1.7B-Instruct | 1,71 B | GGUF, safetensors | Apache 2.0 | Generalista, on-device | 8.192 tokens |

Athena se diferencia de sus alternativas de tamano similar por su especializacion en ciberseguridad y por incluir el arabe entre sus idiomas. En contrapartida, los generalistas publican ventanas de contexto mucho mayores y benchmarks extensos, mientras que Athena no documenta contexto ni metricas en este repositorio. Entre las opciones con licencia Apache 2.0 sin restricciones, SmolLM2 es la comparable mas directa en tamano y filosofia on-device.

## Limitaciones y advertencias

- Riesgo de error en datos tecnicos criticos: la propia model card advierte que Athena puede equivocarse especialmente en identificadores CVE, flags de comandos y versiones; hay que verificar siempre antes de actuar.
- Uso etico y legal: el autor indica que debe emplearse unicamente en sistemas para los que se tenga autorizacion; no es una herramienta para actividades ofensivas no autorizadas.
- Sin acceso a internet ni memoria entre conversaciones: no puede consultar informacion actualizada ni mantener estado entre sesiones.
- Ventana de contexto no documentada, lo que dificulta planificar cargas de trabajo con documentos largos.
- Restriccion de idiomas: solo cuatro idiomas (en, ar, fr, es); el rendimiento en espanol no esta cuantificado.
- La licencia figura en los tags como "other" pero con license_name apache-2.0 y enlace al texto de Apache 2.0; conviene verificar la licencia aplicable en el repositorio base antes de uso comercial.
- El modo thinking viene desactivado por defecto y requiere `--reasoning off` para que el runtime no lo active; comportamiento dependiente del runtime de llama.cpp.
- No hay benchmarks publicados en este repositorio, por lo que la calidad relativa frente a otros modelos de 1-2 B no puede evaluarse con datos objetivos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ErebusTN/Athena-GGUF
- Modelo base (Athena): https://huggingface.co/ErebusTN/Athena
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Paper, blog y demo: no disponibles en la informacion proporcionada.
