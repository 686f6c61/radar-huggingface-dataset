# exeterminal/Exe-Core-Dynamic-V1-GGUF

## Resumen

Exe Core Dynamic v1 es un modelo de lenguaje especializado en el uso de herramientas de terminal, desarrollado por el usuario exeterminal como parte del proyecto Exe AI Terminal. Se basa en el modelo Qwen/Qwen3.8-27B, un transformer de 27 mil millones de parámetros, y ha sido afinado mediante una adaptador LoRA de rango 16 sobre 1241 ejemplos distribuidos en 19 grupos de comportamiento. El objetivo del entrenamiento es que el modelo aprenda a seleccionar y llamar correctamente las herramientas del terminal —leyendo sus esquemas, respetando las reglas del sistema y decidiendo cuándo responder sin invocar ninguna herramienta— en lugar de adivinar. El modelo se distribuye en formato GGUF con una amplia gama de cuantizaciones, desde bf16 (54,6 GB) hasta IQ1_S experimental, y hereda una ventana de contexto de hasta 262 000 tokens del modelo base. Su relevancia radica en que está diseñado específicamente para agentes de terminal, donde mejora la precisión en la selección de herramientas de un 79 % a un 93 % en casos de evaluación held-out, sin retroceder en ningún grupo de comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 262 000 tokens (heredado de la base) |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ1_M, IQ1_S |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con matriz de importancia imatrix) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso con arquitectura Qwen3, y se ha afinado mediante un adaptador LoRA de rango 16 sobre el modelo base en bf16. El entrenamiento se realizó durante dos épocas sobre 1241 ejemplos organizados en 19 grupos de comportamiento, con la máscara de pérdida aplicada al prompt para que el modelo aprenda el comportamiento en lugar de memorizar el texto del prompt. El adaptador se fusionó posteriormente en el modelo base bf16, y todas las cuantizaciones GGUF se generaron a partir de ese modelo fusionado. Cada cuantización incluye una matriz de importancia (imatrix) calculada con el mismo conjunto de calibración utilizado para el modelo Exe Guard Dynamic. La pérdida de validación held-out descendió de forma monótona hasta 0,0107 sin signos de sobreajuste. El modelo hereda la torre de visión del modelo base, pero no fue entrenado ni evaluado en tareas de imagen.

## Capacidades

- Uso de herramientas (tool calling) en terminal: selecciona la herramienta adecuada entre las integradas, leyendo sus parámetros y reglas del sistema.
- Lectura de esquemas de herramientas desconocidas: puede interpretar y llamar correctamente herramientas MCP o skills añadidas por el usuario, sin necesidad de una lista fija.
- Ejecución de comandos en segundo plano: inicia procesos largos en background en lugar de bloquear la conversación.
- Manejo de contexto largo: ventana de hasta 262 000 tokens, adecuada para sesiones de terminal extensas.
- Decisión de cuándo no llamar herramientas: responde directamente cuando la petición no requiere invocar ninguna función.
- Multilingüe: solo inglés (aunque el modelo base soporta más idiomas, el fine-tune está orientado a inglés).
- Sin capacidades de visión medidas: la torre de visión del base está presente pero no ha sido entrenada ni evaluada.

## Casos de uso

- Asistente de terminal para desarrolladores: el modelo puede gestionar conversaciones multi-turno en una sesión de terminal, leyendo archivos con la herramienta adecuada en lugar de usar comandos shell improvisados, y ejecutando comandos en background cuando la tarea es larga.
- Automatización de tareas de administración de sistemas: permite delegar operaciones rutinarias como inspección de logs, gestión de procesos o configuración de entornos, con la seguridad de que el modelo respeta las reglas del sistema.
- Integración con servidores MCP personalizados: al poder leer esquemas de herramientas nunca vistas, el modelo se adapta a extensiones del usuario sin necesidad de reentrenamiento.
- Generación de comandos shell y scripts: dado un objetivo en lenguaje natural, el modelo produce el comando o script correcto, eligiendo la herramienta apropiada en lugar de un one-liner arbitrario.
- Resolución de problemas en entornos de desarrollo: puede diagnosticar errores de compilación, fallos de dependencias o problemas de configuración, inspeccionando el sistema con las herramientas adecuadas.
- Agente autónomo para pipelines de CI/CD: integrado tras un servidor compatible con OpenAI (como llama-server), puede ejecutar pasos de build, test y despliegue, decidiendo cuándo intervenir y cuándo responder sin llamar herramientas.
- Soporte técnico en terminales de producto: como modelo de chat principal de Exe AI Terminal, ofrece respuestas precisas sobre el uso de las herramientas integradas y las reglas del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona una evaluacion especifica sobre 72 casos held-out de terminal a temperatura 0,1:

| Modelo | Aciertos | Porcentaje |
|---|---|---|
| Qwen3.8-27B (base sin entrenar) | 57 / 72 | 79 % |
| Exe Core Dynamic v1 | 67 / 72 | 93 % |

Las mayores mejoras se dieron en herramientas de archivo (de 0/4 a 4/4) y en ejecucion en segundo plano (de 2/4 a 4/4). Ningun grupo de comportamiento empeoro. El autor reconoce dos debilidades persistentes: nombrar el entorno Python propio del proyecto y formular una pregunta corta en lugar de inspeccionar primero.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo bf16 ocupa 54,6 GB, por lo que requiere al menos 56 GB de VRAM para cargarlo sin cuantizar. Las cuantizaciones reducen el requisito: Q8_0 aproximadamente 30 GB, Q4_K_M alrededor de 16-18 GB, e IQ2_S en torno a 8-10 GB (estimaciones basadas en el tamaño tipico para 27B; los tamanos exactos de cada archivo no estan publicados).
- GPU recomendadas: para bf16 o Q8_0 se necesitan GPU profesionales como A100 (80 GB), H100 (80 GB) o RTX 6000 Ada. Para Q4_K_M o inferiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Las cuantizaciones IQ2_S e inferiores pueden caber en GPUs de 12-16 GB como RTX 4070 Ti o RTX 3080.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp, llama-server, Ollama y cualquier servidor compatible con OpenAI. El autor recomienda usarlo con llama-server.
- Latencia y throughput: no se han publicado datos especificos. En una RTX 4090 con Q4_K_M, se puede esperar una generacion de 20-40 tokens por segundo para un modelo de 27B, pero es una estimacion orientativa.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoria (agentes de terminal). Como referencia, se compara con su modelo base y con el otro modelo del mismo autor:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262k | Chat general, sin especializacion en terminal | Apache-2.0 |
| Exe Core Dynamic v1 | 27B | 262k | Agente de terminal con tool use | Apache-2.0 |
| Exe Guard Dynamic (del mismo autor) | No disponible | No disponible | Guardian de flujos de trabajo extendidos | Apache-2.0 |

No hay datos de rendimiento comparativo entre estos modelos en benchmarks estandar.

## Limitaciones y advertencias

- Especialista de terminal: fuera del ambito de uso de herramientas en terminal, el modelo se comporta como el modelo base con un "acento leve"; no es adecuado para chat general.
- Debilidades conocidas: no mejora en nombrar el entorno Python propio del proyecto ni en formular una pregunta corta ante ambiguedad; tiende a inspeccionar antes de actuar.
- Vision no evaluada: la torre de vision del modelo base esta presente pero no ha sido entrenada ni medida; no se debe confiar en capacidades de imagen.
- Idioma: solo entrenado y evaluado en ingles; el uso en otros idiomas puede degradar el rendimiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar comandos o respuestas incorrectas; se recomienda supervisar en entornos de produccion.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero exige nombrar el origen del modelo base (Qwen3.8-27B).
- Cuantizaciones de 1 bit (IQ1_M, IQ1_S) son experimentales y no recomendadas para uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/exeterminal/Exe-Core-Dynamic-V1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo relacionado del mismo autor (Exe Guard Dynamic): https://huggingface.co/exeterminal/Exe-Guard-Dynamic-GGUF
- Discusiones del modelo relacionado: https://huggingface.co/exeterminal/Exe-Guard-Dynamic-GGUF/discussions
- Directorio de modelos GGUF (no especifico de este modelo): https://local-ai-zone.github.io/
- Cargador GGUF con modo agente (no especifico de este modelo): https://ggufloader.github.io/ y https://github.com/GGUFloader/gguf-loader
