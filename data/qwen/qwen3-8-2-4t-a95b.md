# Qwen/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es un modelo de lenguaje causal de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen de Alibaba. Con 2,4 billones de parametros totales y 95.000 millones activados por token, es el primer modelo de la clase Qwen-Max que se publica con pesos abiertos, tras las series Qwen3.5 y Qwen3.6. El modelo esta disenado para tareas de codigo, trabajo profesional, investigacion y flujos agenticos de largo horizonte, con un enfasis explicito en la finalizacion fiable de tareas multi-paso.

La arquitectura combina capas de atencion lineal Gated DeltaNet con capas de atencion con compuerta (Gated Attention), organizadas en 92 capas segun un patron hibrido de 23 bloques. Incorpora 512 expertos con 10 enrutados y 1 compartido activados por token, prediccion multi-token (MTP) entrenada en varios pasos y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000. El modelo esta disponible en formato Hugging Face Transformers y es compatible con vLLM, SGLang y TokenSpeed.

Su relevancia actual radica en que traslada capacidades de nivel propietario (clase Max) al ecosistema de pesos abiertos, con control flexible del razonamiento mediante `reasoning_effort` y retencion del contexto de razonamiento historico mediante `preserve_thinking`. La version oficial Qwen3.8-Max, servida en la nube, anade entrada de vision, modo sin razonamiento, contexto de 1M por defecto y herramientas integradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Mixture of Experts; layout hibrido Gated DeltaNet + Gated Attention (23 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))) |
| Parametros totales | 2.446.182.725.504 (2,4 T) |
| Parametros activos | 95 B (10 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | `qwen3.8-max` (licencia propia, categoria `other`) |
| Formato de pesos | safetensors (Hugging Face Transformers) |

Otros datos tecnicos: hidden dimension 8192; embedding de tokens 248.320 (padded); 92 capas; Gated DeltaNet con 128 cabezas de atencion lineal para V y 16 para QK, dimension de cabeza 128; Gated Attention con 64 cabezas para Q y 4 para KV, dimension de cabeza 256, dimension RoPE 64; 512 expertos, dimension intermedia de experto 2048; salida LM 248.320 (padded); MTP entrenada con multiples pasos. Tamano del repositorio: 4.892,4 GB.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer hibrida que alterna atencion lineal (Gated DeltaNet) y atencion completa con compuerta (Gated Attention) en un patron de 23 bloques, cada uno compuesto por tres subcapas Gated DeltaNet seguidas de una Gated Attention, todas con capas MoE asociadas. Esta combinacion busca reducir el coste computacional del contexto largo manteniendo capacidad de recuperacion exacta en las capas de atencion completa. La capa MoE cuenta con 512 expertos, de los que se activan 10 enrutados mas 1 compartido, con dimension intermedia de 2048 por experto, lo que permite un ratio de activacion muy bajo (95 B de 2,4 T) y por tanto un coste de inferencia muy inferior al de un modelo denso del mismo tamano.

El modelo ha pasado por fases de preentrenamiento y postentrenamiento. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO; esa informacion no esta disponible. Entre las innovaciones tecnicas documentadas destacan la prediccion multi-token (MTP) entrenada en varios pasos, el control flexible de la profundidad de razonamiento mediante `reasoning_effort` y la retencion del contexto de razonamiento de mensajes historicos mediante `preserve_thinking`.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto nativo de 262.144 tokens.
- Razonamiento con profundidad ajustable mediante el parametro `reasoning_effort`, y conservacion del razonamiento historico con `preserve_thinking`.
- Codigo y tareas de ingenieria de software, incluida resolucion de issues y trabajo en entornos de terminal (evaluado en Terminal Bench 2.1 y SWE-bench Pro).
- Trabajo profesional y tareas de investigacion, segun los destacados del autor.
- Ejecucion agentica de largo horizonte: planificacion autonoma, manejo de retroalimentacion del entorno y finalizacion de tareas multi-paso de extremo a extremo.
- Compatibilidad con arneses y herramientas de desarrollo populares (downstream compatibility), lo que facilita la integracion en stacks existentes.
- Soporte de tool calling y function calling: no se documenta de forma explicita en la informacion disponible; la model card menciona herramientas integradas solo para la version en nube Qwen3.8-Max.
- Vision: no disponible en los pesos abiertos; la entrada de vision es exclusiva de Qwen3.8-Max en la nube.
- Capacidades multilingues: no disponible (no se detallan idiomas soportados).

## Casos de uso

- Agentes de codigo autonomos: el modelo esta evaluado especificamente en Terminal Bench 2.1 y SWE-bench Pro, por lo que encaja en pipelines que resuelven issues, ejecutan comandos en terminal y validan cambios de forma iterativa. Su contexto de 262.144 tokens permite mantener a la vista el repositorio, los logs y el historial de intentos.
- Automatizacion de tareas de ingenieria de larga duracion: con planificacion autonoma y manejo de retroalimentacion del entorno, es adecuado para flujos que requieren decenas de pasos encadenados (migraciones, refactorizaciones, correccion de tests) sin intervencion humana constante.
- Asistentes de investigacion y trabajo profesional: el contexto extensible hasta 1M tokens permite procesar corpus documentales completos (informes, articulos, expedientes) y sintetizar conclusiones con trazabilidad sobre el material fuente.
- Atencion al cliente automatizada: la ventana nativa de 262.144 tokens posibilita conversaciones multi-turno con historial largo y recuperacion de contexto de sesiones previas, manteniendo coherencia en interacciones prolongadas.
- Control de profundidad de razonamiento por coste: mediante `reasoning_effort` se puede rebajar la profundidad en tareas rutinarias (clasificacion, extraccion, respuestas breves) y elevarla en tareas analiticas, ajustando el coste de inferencia al tipo de peticion.
- Integracion en stacks existentes: la compatibilidad con vLLM, SGLang y TokenSpeed y con arneses de desarrollo populares permite desplegarlo detras de APIs compatibles con OpenAI y sustituir llamadas a modelos propietarios en herramientas ya en produccion.
- Procesamiento de documentos de gran volumen: la extension de contexto hasta 1.010.000 tokens habilita analisis de bases de codigo, contratos o expedientes completos en una sola pasada, sin troceado agresivo.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a Opus 4.8, Fable 5, GPT 5.6 Sol (max), Qwen3.7-Max y Qwen3.8-Max. Los resultados disponibles en la informacion proporcionada son parciales (la tabla aparece truncada); se recogen solo las filas completas.

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84,6 | 84,6 | 88,8 | 74,5 | 86,6 |
| SWE-bench Pro | 69,2 | 80,0 | 64,6 | 60,6 | no disponible (truncado) |

Nota: los valores corresponden a Qwen3.8-Max, la version oficial en nube basada en Qwen3.8-2.4T-A95B, que anade vision, modo sin razonamiento, contexto de 1M por defecto y herramientas integradas. No se han publicado en la informacion disponible resultados desagregados para los pesos abiertos Qwen3.8-2.4T-A95B en otros benchmarks habituales (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. Como referencia de orden de magnitud, el repositorio de pesos ocupa 4.892,4 GB, por lo que la inferencia en precision nativa requiere agregados de memoria muy superiores a cualquier GPU individual.
- GPU recomendadas: no se documentan configuraciones oficiales. Por el tamano del modelo, el despliegue realista exige nodos multi-GPU de clase centro de datos (A100, H100, H200) o superiores; no se dispone de datos verificados sobre configuraciones minimas.
- Cabe en GPU de consumo: no. Con 2,4 T de parametros totales, incluso con cuantizaciones agresivas el modelo no es desplegable en GPUs de consumo (RTX 4090 y similares) segun la informacion disponible.
- Opciones de despliegue: vLLM, SGLang y TokenSpeed, segun la model card. Compatible con Hugging Face Transformers. No se confirma soporte de llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible. La activacion de solo 95 B de parametros por token reduce el coste frente a un denso equivalente, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2,4 T | 95 B | 262.144 nativo / 1.010.000 extensible | `qwen3.8-max` (propia) | Pesos abiertos en Hugging Face |
| Qwen3.8-Max | no disponible | no disponible | 1M por defecto | propietaria (servicio en nube) | API Qwen Cloud / Qwen Studio |
| Qwen3.7-Max | no disponible | no disponible | no disponible | propietaria | API / Qwen Studio |
| Opus 4.8 | no disponible | no disponible | no disponible | propietaria | Comercial |
| Fable 5 | no disponible | no disponible | no disponible | propietaria | Comercial |
| GPT 5.6 Sol (max) | no disponible | no disponible | no disponible | propietaria | Comercial |

La comparativa se limita a los datos publicados en la model card; no se dispone de parametros, contexto ni licencia de los modelos propietarios. En rendimiento, Qwen3.8-Max supera a Qwen3.7-Max en Terminal Bench 2.1 (86,6 frente a 74,5) y queda por detras de GPT 5.6 Sol (88,8) y de Fable 5 en SWE-bench Pro (80,0). No hay resultados publicados para comparar directamente los pesos abiertos con alternativas abiertas de tamano similar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al ser un modelo entrenado sobre datos web a gran escala, cabe esperar sesgos socioculturales y linguisticos no cuantificados; no hay datos para evaluarlos.
- Riesgo de alucinacion: no se publican tasas de alucinacion ni evaluaciones de factualidad. En tareas de investigacion y trabajo profesional conviene verificar las salidas contra las fuentes.
- Idiomas soportados: no disponibles. No se puede confirmar el nivel de cobertura ni la calidad por idioma, lo que desaconseja asumir paridad multilingue sin evaluacion propia.
- Contexto: la ventana nativa es de 262.144 tokens y la extension a 1M se declara como extensible; el rendimiento real en el extremo superior de la ventana no esta documentado.
- Licencia: la licencia `qwen3.8-max` es una licencia propia (categoria `other`) con terminos recogidos en el archivo LICENSE del repositorio. No se detallan en la informacion disponible las condiciones exactas de uso comercial, por lo que es imprescindible revisar el texto de la licencia antes de un despliegue en produccion.
- Diferencia entre pesos abiertos y servicio: los benchmarks publicados corresponden a Qwen3.8-Max, que anade vision, modo sin razonamiento, contexto de 1M y herramientas integradas. Los resultados de los pesos abiertos pueden diferir y no estan desagregados.
- Despliegue: el modelo no es viable en hardware de consumo; requiere infraestructura multi-GPU de centro de datos. No se dispone de guias oficiales de dimensionamiento ni de cifras de latencia.
- Tool calling: no se documenta de forma explicita en la model card para los pesos abiertos; conviene validar el comportamiento de function calling en el arnes concreto antes de depender de el en produccion.
- Madurez: el modelo se publico en agosto de 2026 y se actualizo en noviembre de 2026; el ecosistema de herramientas y las guias de despliegue pueden estar menos consolidados que en modelos de menor tamano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Blog oficial de Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
- Vision general de Qwen3.8-Max en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-max
- Qwen Cloud: https://www.qwencloud.com
- Qwen Studio (chat): https://chat.qwen.ai/
- Qwen Studio con el modelo: https://chat.qwen.ai/?models=qwen3.8-max
- Sitio principal de Qwen: https://qwen.ai/home
- Qwen Chat: https://qwen.ai/qwenchat
- Wikipedia (espanol, no disponible; referencia en frances): https://fr.wikipedia.org/wiki/Qwen
- Wikipedia (ingles): https://en.wikipedia.org/wiki/Qwen
