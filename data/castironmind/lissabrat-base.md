# CastIronMind/LissaBrat-Base

## Resumen

LissaBrat-Base es un modelo de lenguaje causal de 102.761.472 parámetros (103M) entrenado desde cero por CastIronMind, un autor individual, sobre un corpus de prosa y foros de la comunidad de My Little Pony. Se trata de un checkpoint de preentrenamiento puro: no tiene formato de diálogo ni ajuste por instrucciones, por lo que su función es la continuación de texto plano, no la conversación. Su relevancia radica en ser un modelo pequeño y ligero (206 MB en bfloat16) que puede reentrenarse o afinarse en una única GPU de consumo en minutos, lo que lo hace útil para investigación, experimentación con preentrenamiento y despliegue en entornos con recursos muy limitados.

La arquitectura es un transformer tipo Llama con 8 capas, dimensión oculta de 1.024, 32 cabezas de atención (4 cabezas clave/valor, es decir, atención con consultas agrupadas) y un vocabulario de 16.384 tokens BPE a nivel de byte. La longitud de contexto es de 1.024 tokens, una ventana muy reducida que condiciona los casos de uso. El modelo se distribuye bajo licencia Apache 2.0 y solo declara soporte para inglés.

El modelo forma parte de la familia Lissa, que incluye variantes de 32M, 103M y 1,45B de parámetros, tanto en versión base como instruct. LissaBrat-Base se posiciona como la variante intermedia orientada a preentrenamiento continuado e investigación, mientras que su versión Instruct está pensada para portátiles y texto más largo y coherente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama |
| Parametros totales | 102.761.472 (103M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos en bfloat16; el autor no documenta cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales de la arquitectura declarados por el autor: 8 capas, dimensión oculta 1.024, 32 cabezas de atención con 4 cabezas clave/valor, dimensión de cabeza 32, tamaño intermedio 2.730, vocabulario de 16.384 tokens (BPE a nivel de byte), embeddings atados (tied embeddings) y precisión bfloat16. El tamaño del repositorio es de 0,2 GB.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal de tipo Llama con atención de consultas agrupadas (32 cabezas de consulta y 4 cabezas clave/valor), embeddings atados entre la entrada y la salida, y una dimensión intermedia de 2.730 en las capas feed-forward. Con 8 capas y 1.024 de dimensión oculta, es un modelo compacto diseñado explícitamente para caber y entrenarse en hardware de consumo. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

El preentrenamiento se realizó desde cero (sin destilación ni backbone prestado) sobre prosa y foros de la comunidad de My Little Pony, con aproximadamente 1.500 millones de tokens únicos durante dos épocas. No se menciona en la información disponible el uso de RLHF, DPO ni ningún otro ajuste posterior; este checkpoint corresponde únicamente a la etapa de preentrenamiento. El autor indica que el entrenamiento lo llevó a cabo una sola persona en una única GPU de consumo.

## Capacidades

- Generación de texto por continuación: el modelo recibe texto plano y lo continúa; no dispone de plantilla de chat ni de marcadores de rol.
- Modelado de dominio específico: está especializado en prosa y foros de la comunidad de My Little Pony, con vocabulario y estilo propios de ese corpus.
- Preentrenamiento continuado: sirve como punto de partida para seguir preentrenando sobre otros corpus o dominios.
- Afinamiento supervisado: al ser un checkpoint base, es adecuado como base para SFT, DPO u otros ajustes posteriores.
- Capacidades multilingües: no disponibles; el modelo solo declara inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Tokens especiales de diálogo (`<system>`, `<user>`, `<assistant>`) presentes en el vocabulario pero no integrados en el formato de preentrenamiento; el autor desaconseja usarlos en este checkpoint.

## Casos de uso

- Investigación sobre preentrenamiento desde cero: el modelo permite reproducir y estudiar el proceso completo de entrenamiento de un transformer pequeño en una sola GPU de consumo, con un coste de cómputo bajo y un corpus acotado.
- Preentrenamiento continuado en dominio: partiendo de los pesos base, se puede seguir entrenando con un corpus nuevo (por ejemplo, documentación técnica o narrativa de otro fandom) para adaptar el estilo y el vocabulario sin partir de cero.
- Afinamiento supervisado para generar texto de un dominio concreto: al ser un checkpoint base, es una base adecuada para SFT con pares instrucción-respuesta sobre un corpus especializado, dado su bajo coste de ajuste.
- Generación de texto creativo de dominio: continuación de relatos y prosa con el estilo del corpus de entrenamiento, útil para experimentos de generación literaria acotada.
- Despliegue embebido y en dispositivos con recursos limitados: con 206 MB en bfloat16 y una ventana de 1.024 tokens, el modelo cabe en memoria de sistemas de gama baja y en entornos de prototipado rápido.
- Experimentación con tokenizadores y vocabularios pequeños: su vocabulario de 16.384 tokens BPE a nivel de byte permite estudiar el efecto del tamaño de vocabulario en modelos pequeños.
- Docencia y pruebas de infraestructura: sirve para validar pipelines de entrenamiento, evaluación de perplejidad y despliegue con transformers sin requerir clústeres ni presupuesto institucional.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Pony domain evaluation (Fimfarchive, congelado, ~10M tokens) | Perplejidad | 25,83 |
| Pony domain evaluation (Fimfarchive, congelado, ~10M tokens) | Bits per character (bpc) | 1,1357 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en bfloat16 para los pesos; con overhead de activaciones y caché KV para 1.024 tokens, el consumo real es de unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU moderna con soporte de bfloat16; el modelo cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores, así como en GPUs de centro de datos (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con al menos 1-2 GB de VRAM libre; también es viable en CPU para prototipado.
- Opciones de despliegue: transformers (biblioteca declarada por el autor), text-generation-inference (el modelo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`); no se documentan integraciones específicas con vLLM, llama.cpp u Ollama, aunque al ser un checkpoint Llama estándar en safetensors es compatible con las herramientas habituales que acepten ese formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LissaBrat-Base | 103M | 1.024 | Apache 2.0 | Hugging Face | Checkpoint base de dominio, preentrenado desde cero |
| LissaNano-Base | 32M | No disponible | No disponible | Hugging Face | Variante menor de la misma familia, para preentrenamiento continuado e investigación |
| LissaBrat-Instruct | 103M | No disponible | No disponible | Hugging Face | Misma base con ajuste por instrucciones, orientada a portátiles y texto más coherente |
| Lissa 1.5B Base | 1,45B | No disponible | No disponible | Hugging Face | Variante mayor de la familia para preentrenamiento e investigación |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. Las variantes de la familia Lissa comparten autor y filosofía de diseño (entrenamiento desde cero en hardware de consumo), por lo que la comparación con modelos de otras familias de tamaño similar no está documentada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente sobre prosa y foros de la comunidad de My Little Pony, el modelo reproduce los sesgos, estilos y temas de ese corpus, con un dominio muy acotado.
- Riesgo de alucinación: alto fuera del dominio de entrenamiento; es un modelo base sin ajuste por instrucciones ni verificación factual.
- Limitaciones de contexto: ventana de solo 1.024 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Limitaciones de idioma: solo declara inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el corpus de entrenamiento procede de contenido de fandom cuyos derechos pueden ser controvertidos; conviene revisar la procedencia de los datos antes de un uso comercial.
- Ausencia de formato de chat: no debe usarse como asistente conversacional; los tokens especiales de diálogo existen en el vocabulario pero no forman parte del preentrenamiento.
- Verificación de métricas: los resultados de perplejidad y bpc están declarados por el autor y no han sido verificados de forma independiente.
- Madurez del proyecto: modelo creado por un autor individual, con 209 descargas y 0 likes en el momento de la consulta; sin garantías de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CastIronMind/LissaBrat-Base
- Licencia: https://huggingface.co/CastIronMind/LissaBrat-Base/blob/main/LICENSE
- LissaBrat-Instruct: https://huggingface.co/CastIronMind/LissaBrat-Instruct
- LissaNano-Base: https://huggingface.co/CastIronMind/LissaNano-Base
- LissaNano-Instruct: https://huggingface.co/CastIronMind/LissaNano-Instruct
- Lissa 1.5B Instruct: https://huggingface.co/CastIronMind/Lissa-1.5B-Instruct
- Lissa 1.5B Base: https://huggingface.co/CastIronMind/Lissa-1.5B-Base
