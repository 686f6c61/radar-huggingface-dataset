# OsaurusAI/Raptor-0.7-4B-JANG_6M

## Resumen

Raptor 0.7 es un modelo de lenguaje de 4.112 millones de parámetros (4,1B) especializado en uso de herramientas y razonamiento agéntico, desarrollado por OsaurusAI como un fine-tune LoRA de Spark-X2.6-4B (del equipo SparkLLM) fusionado en los pesos. Está ajustado específicamente para la superficie de herramientas de Osaurus: gestión de ficheros, hojas de cálculo y PDF, sandbox y shell, calculadora, delegación y flujos de trabajo de orquestación. La ficha que nos ocupa es la cuantización JANG_6M, pensada para Apple Silicon.

La relevancia de este artefacto no reside en el modelo base sino en el proceso de cuantización: atención y embedding atados a 8 bits, MLP a 6 bits, tamaño de grupo 64, escalas en bfloat16 y la puerta de atención por cabeza en precisión completa. El autor reporta una divergencia KL media de 0,00622 nats por posición y un 98,36% de acuerdo top-1 frente a los pesos BF16 originales sobre 90.309 tokens evaluados, con un rendimiento de decodificación de 148 tok/s frente a los 93 tok/s del BF16 en un Mac Studio M5 Ultra.

El modelo está pensado para ejecutarse localmente en Apple Silicon mediante la librería MLX y el runtime Osaurus 1.0.1 o superior. Su licencia Apache-2.0 (heredada del modelo base) permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integrar agentes locales en flujos de trabajo de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune LoRA de Spark-X2.6-4B, fusionado); detalles internos no disponibles |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_6M: atención y embedding atados a 8 bits, MLP a 6 bits, grupo 64, escalas bfloat16, puerta de atención por cabeza en precisión completa (7,126 bits/peso efectivos) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería MLX); bundle de 3,41 GiB |
| Modelo base | OsaurusAI/Raptor-0.7-4B-BF16 (a su vez derivado de XHToken/Spark-X2.6-4B) |
| Runtime requerido | Osaurus 1.0.1 o superior |
| Modos de razonamiento | high (por defecto), low, off |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer subyacente (número de capas, dimensión oculta, mecanismo de atención concreto ni si incorpora innovaciones como decodificación especulativa o atención lineal). Lo que sí se documenta es el proceso de adaptación: Raptor 0.7 es un fine-tune LoRA sobre Spark-X2.6-4B del equipo SparkLLM, con los adaptadores fusionados en los pesos finales. El ajuste se orientó a la superficie de herramientas de Osaurus, cubriendo ficheros, hojas de cálculo, PDF, sandbox, shell, calculadora, delegación y flujos de trabajo de orquestación, configuración y edición.

El proceso de cuantización JANG_6M emplea GPTQ sobre la covarianza completa de entrada de cada capa lineal cuantizada, usando la matriz de importancia (imatrix) como su diagonal. La calibración se realizó con una captura única de 7,60 millones de tokens a través de la plantilla de chat del propio modelo, cubriendo ambos niveles de esfuerzo de razonamiento (low y high) y el modo sin razonamiento, con datos de trayectorias agénticas de Osaurus, flujos de trabajo (orquestador, arquitecto, configurador, lector de importación y ejecutor de pasos), razonamiento y tool-calls muestreados del propio modelo (1,44M tokens), finanzas (tablas de informes anuales y formularios 10-K), edición de documentos y texto de PDF largos, sesiones de terminal, código en 11 lenguajes, matemáticas y ciencias, y chat multilingüe y texto enciclopédico. Se construyó también una variante con plegado AWQ, pero quedó dentro del ruido estadístico con mayor KL, por lo que se descartó.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat propia.
- Razonamiento en tres modos configurables: `high` (por defecto, razonamiento extenso), `low` (razonamiento corto) y `off` (sin razonamiento, mediante `enable_thinking: false`).
- Uso de herramientas (tool calling) con formato específico: `<tool_call>NAME<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>`, sin saltos de línea; los resultados se devuelven en un bloque `<|Tool|>` y los mensajes de herramienta consecutivos se fusionan.
- Uso de herramientas multi-turno en los tres modos de razonamiento.
- Operaciones sobre ficheros, hojas de cálculo y PDF.
- Ejecución en sandbox y shell.
- Calculadora.
- Delegación y flujos de trabajo de Osaurus: orquestación, configuración, importación y edición de definiciones de workflow.
- Soporte de agentes con razonamiento multi-paso.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del modelo.
- Sin soporte declarado de visión ni audio.

## Casos de uso

- Agente local de escritorio en Apple Silicon: el modelo está cuantizado a 3,41 GiB y decodifica a 148 tok/s en un Mac Studio M5 Ultra, lo que permite ejecutarlo de forma local e interactiva en el runtime Osaurus sin depender de la nube.
- Automatización de tareas sobre ficheros y documentos: con acceso a herramientas de ficheros, hojas de cálculo y PDF, el modelo puede leer, editar y transformar documentos dentro de un flujo agéntico, aprovechando su ajuste específico sobre esas herramientas.
- Asistente de terminal y shell: las herramientas de sandbox y shell permiten al modelo proponer y ejecutar comandos, con la advertencia de que el arnés debe mantener el paso de aprobación para acciones destructivas.
- Orquestación de flujos de trabajo: el ajuste cubre tareas de orquestador, arquitecto, configurador, lector de importación y ejecutor de pasos, lo que permite usar el modelo para definir, importar y reparar workflows de Osaurus.
- Cálculo y operaciones numéricas asistidas: la herramienta de calculadora permite delegar operaciones aritméticas, mitigando parcialmente los errores de aritmética que el propio autor reconoce como limitación.
- Chat conversacional multi-turno con cambio de herramientas a mitad de conversación: las pruebas de comportamiento reportadas incluyen conversaciones multi-turno y cambios de conjunto de herramientas, lo que respalda su uso en asistentes que alternan entre distintas capacidades.
- Integración en pipelines de agentes con tool calling estructurado: el formato de tool-call es determinista y parseable, lo que facilita su integración en arneses propios que necesiten validar la forma de las llamadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha del modelo BF16 para los resultados de benchmarks del modelo; los datos de calidad que sí se incluyen son de fidelidad de la cuantización, no de rendimiento en tareas estándar.

Calidad de la cuantización frente a BF16 (KL en nats por posición, solo tokens del asistente, 90.309 tokens puntuados):

| Configuración | KL media | Acuerdo top-1 |
|---|---:|---:|
| Este bundle (GPTQ + imatrix), todo el held-out | 0,00622 | 98,36% |
| Igual, razonamiento high | 0,00118 | 98,58% |
| Igual, razonamiento low | 0,00105 | 98,79% |
| Igual, razonamiento off | 0,00139 | 99,00% |
| GPTQ + imatrix + plegado AWQ, todo el held-out | 0,00654 | 98,45% |
| Este bundle, solo filas de agente y workflow de Osaurus | 0,00107 | 98,85% |

Puertas de comportamiento: 8/8 superadas, igual que BF16 (parada en EOS, thinking on/off, forma y parseo de tool-call, conversaciones multi-turno y cambios de herramienta a mitad de conversación).

Rendimiento medido en Mac Studio (M5 Ultra), prompt de 512 tokens y 128 tokens generados:

| Métrica | Este bundle | Fuente BF16 |
|---|---:|---:|
| Tamaño | 3,41 GiB (7,126 bits/peso) | 7,66 GiB |
| Decodificación | 148 tok/s | 93 tok/s |
| Prefill (prompt de 512 tokens) | 8.850 tok/s | 10.479 tok/s |

## Requisitos de hardware

- VRAM/unificada estimada: el bundle ocupa 3,41 GiB en disco; en Apple Silicon la memoria unificada necesaria para cargarlo ronda ese tamaño más el overhead del runtime (no se especifica cifra exacta).
- Plataforma objetivo: Apple Silicon con la librería MLX; el autor lo probó en un Mac Studio con M5 Ultra.
- GPU recomendadas: no se documentan GPU NVIDIA ni AMD; el artefacto está empaquetado para MLX.
- ¿Cabe en GPU de consumo? No hay datos para GPU de consumo convencionales; en Apple Silicon, por su tamaño de 3,41 GiB, es apto para equipos con memoria unificada moderada, aunque no se especifica el mínimo.
- Opciones de despliegue: runtime Osaurus 1.0.1 o superior; librería MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: 148 tok/s de decodificación y 8.850 tok/s de prefill con prompt de 512 tokens en M5 Ultra (medición del autor).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. La comparación más directa disponible es con su propia fuente BF16:

| Modelo | Parámetros | Tamaño | Decodificación (M5 Ultra) | Licencia |
|---|---|---:|---:|---|
| Raptor-0.7-4B-JANG_6M (este) | 4,1B | 3,41 GiB | 148 tok/s | Apache-2.0 |
| Raptor-0.7-4B-BF16 (fuente) | 4,1B | 7,66 GiB | 93 tok/s | Apache-2.0 |

Para alternativas de la misma categoría (modelos agénticos de ~4B con tool calling) no se dispone de datos en la información proporcionada: no disponible.

## Limitaciones y advertencias

- El propio autor reconoce errores del modelo: nombres de herramienta incorrectos, fallos de esquema y JSON, afirmaciones de éxito no logradas, identificadores inventados y errores de aritmética y de recuerdo.
- Debe mantenerse el paso de aprobación del arnés para acciones destructivas; el modelo no es fiable para ejecutar comandos o modificaciones sin supervisión.
- Lagunas conocidas del modelo (recuperación de errores, diseño de un workflow completo desde cero) se listan en la ficha del BF16.
- El cambio del conjunto de herramientas obliga a un re-prefill completo, no a un append de sufijo, porque las herramientas se renderizan en el primer bloque de sistema.
- `generation_config.json` incluye la clave no estándar `max_tokens` del modelo base; conviene pasar un límite propio.
- El modelo está etiquetado únicamente para inglés; no hay soporte multilingüe declarado.
- No se documenta la longitud de contexto, lo que impide planificar cargas con prompts largos.
- El razonamiento está activado por defecto (esfuerzo high), lo que incrementa el consumo de tokens si no se desactiva explícitamente.
- Licencia Apache-2.0 heredada del modelo base, sin restricciones adicionales para uso comercial según la información disponible.
- Riesgo de alucinación inherente a un modelo de 4B; no se han publicado evaluaciones de sesgos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/Raptor-0.7-4B-JANG_6M
- Modelo base BF16: https://huggingface.co/OsaurusAI/Raptor-0.7-4B-BF16
- Modelo original Spark-X2.6-4B: https://huggingface.co/XHToken/Spark-X2.6-4B
- Sitio de Osaurus: https://osaurus.ai
