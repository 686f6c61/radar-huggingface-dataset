# Franci11/kAI_Bolt_0.8B

## Resumen

kAI Bolt 0.8B es un modelo de decisión pequeño ("System One") desarrollado por el usuario Franci11 y publicado en HuggingFace. A diferencia de un LLM conversacional, no genera texto libre: recibe un estado en formato JSON junto con una o más preguntas tipadas y devuelve una probabilidad para cada opción disponible. Es un fine-tune mediante QLoRA (4 bits, rank 16, alpha 16) sobre Qwen3.5-0.8B, entrenado por su autor en un MacBook Air M2 con 8 GB de memoria usando Unsloth Desktop.

Su relevancia radica en la tendencia actual de crear modelos especializados en decisiones discretas de baja latencia (triage, routing, verificación, supervisión de agentes) que complementan a LLMs mayores en pipelines de producción. Con 873,4 millones de parámetros y una ventana de contexto de 262.144 tokens, ofrece precisión de 0,7465 en el benchmark typed-decisions, por encima de modelos de 4B de su misma familia de tareas, con una latencia p50 de unos 500 ms en hardware Apple Silicon de consumo.

Se distribuye en formato GGUF (F16, Q8_0, Q6_K y Q4_K_M), lo que lo hace ejecutable localmente con llama.cpp, LM Studio o builds MLX, y bajo licencia Apache-2.0, apta para uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5) con decision head para salida probabilistica tipada |
| Parametros totales | 873.438.784 (dato real de safetensors) |
| Parametros activos | no disponible (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | Ingles (en), italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (release principal); safetensors presente en el repo (5,7 GB en total) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder compacto, y se ajusta mediante QLoRA con cuantizacion a 4 bits, rank 16 y alpha 16, anadiendo una "decision head" que produce probabilidades sobre opciones tipadas en lugar de continuar la generacion de texto. El entrenamiento se realizo en un Apple MacBook Air M2 con 8 GB de memoria usando Unsloth Desktop, lo que demuestra que el fine-tune es reproducible en hardware de consumo.

El dataset de entrenamiento esta compuesto por ejemplos de estados JSON con preguntas tipadas y etiquetas gold no textuales, con tres tipos de salida: `choice` (una clave entre hasta 16 opciones, con probabilidad sobre cada una), `noul` (verdadero/falso con probabilidad, para verificaciones) y `score` (indice sobre una rubrica ordenada de hasta 10 niveles). Una caracteristica destacable es que la abstencion se entrena como una opcion mas (`non_determinabile` / `nessuna_delle_opzioni`), de modo que si el estado no soporta una respuesta, el modelo aprende a abstenerse en lugar de adivinar. El autor advierte que el orden de las opciones no debe usarse como caracteristica. Las tareas de entrenamiento incluyen triage y routing, deteccion de intencion, verificacion de afirmaciones, chequeo de prompt injection, verificacion de facturas y supervision de agentes.

## Capacidades

- Clasificacion tipada con salidas probabilisticas: devuelve una distribucion de probabilidad sobre cada opcion, no solo el argmax.
- Decisiones de tipo `choice`: seleccion entre hasta 16 opciones.
- Decisiones de tipo `noul`: respuestas binarias si/no con probabilidad, utiles para verificacion de afirmaciones.
- Decisiones de tipo `score`: puntuacion sobre una rubrica ordenada de hasta 10 niveles.
- Abstencion entrenada: puede devolver `non_determinabile` o `nessuna_delle_opzioni` cuando el estado no justifica una respuesta.
- Ventana de contexto larga: hasta 262.144 tokens, apta para estados JSON extensos o trazas de agentes completas.
- Tareas entrenadas: triage/routing, deteccion de intencion, verificacion de claims, deteccion de prompt injection, verificacion de facturas y supervision de agentes (aprobar una tool call, elegir herramienta, pedir aclaracion, marcar tarea completada, leer trazas).
- Etiquetado image-text-to-text en HuggingFace, heredado presumiblemente de la base Qwen3.5; la model card no documenta capacidades de vision especificas.
- No esta orientado a generacion de texto conversacional, razonamiento multi-paso ni escritura de codigo.

## Casos de uso

- Triage y routing de solicitudes: clasifica tickets o mensajes entrantes en categorias con probabilidades por clase, ideal como primer filtro de bajo coste antes de escalar a un LLM mayor.
- Deteccion de prompt injection: verifica si un input contiene instrucciones maliciosas antes de pasarlo al agente principal, con respuesta binaria tipada y probabilidad de confianza.
- Verificacion de afirmaciones (claim verification): decide si una afirmacion es verdadera o falsa dado un estado documental, aprovechando la ventana de 262k tokens para contextos largos.
- Verificacion de facturas: comprueba campos y coherencia de facturas en JSON, devolviendo un score sobre una rubrica o un veredicto binario.
- Supervision de agentes: actua como gatekeeper que aprueba o rechaza tool calls, selecciona la herramienta adecuada, pide aclaracion al usuario o marca una tarea como completada leyendo la traza del agente.
- Deteccion de intencion en chatbots: enruta la intencion del usuario entre hasta 16 categorias con probabilidades calibradas.
- Clasificacion de texto general: gracias al pipeline tag text-classification, puede integrarse en pipelines de clasificacion via transformers o servidores GGUF.
- Orquestacion multi-modelo: como modelo "System One", puede tomar decisiones rapidas y baratas que un LLM "System Two" ejecuta solo cuando la probabilidad es baja o hay abstencion.

## Benchmarks y rendimiento

Resultados publicados en la model card para el benchmark typed-decisions (LocalLLaMA/typed-decisions). La precision es exact match contra el argmax gold. El techo de auto-concordancia del teacher en el suite completo es 0,735. Las cifras de kAI Bolt son medidas del autor en Apple M2; las de Rizzo Flow son ejecuciones publicadas en llama.cpp (Q8_0, CUDA, RTX 5060 Ti). Los protocolos no son pareados, por lo que no deben leerse como ranking estricto.

| Modelo | Tamano | Accuracy | Notas |
|---|---:|---:|---|
| **kAI Bolt 0.8B** | 0,8B | **0,7465** | Ejecucion del autor; p50 ~500 ms en Apple M2 |
| Jev 1.13.0 | hosted | 0,727 | Cifra de la dataset card; KL 1,442, Brier 0,148 |
| Rizzo Flow 4B | 4B | 0,648 | Fine-tune, Q8_0; ECE 0,112, p50 195 ms |
| Spark-X2.5-4B base | 4B | 0,574 | Base antes del LoRA, misma tabla |
| Rizzo Flow 1.7B | 1,7B | 0,544 | Q8_0; ECE 0,169, p50 109 ms |
| Spark-X2.5-1.7B base | 1,7B | 0,530 | Misma tabla |
| od1-nano (referencia) | no disponible | 0,751 | Suite completo de 2.000 decisiones; harness distinto |

No se han publicado resultados de benchmarks genericos (MMLU, HumanEval, GSM8K) en la informacion disponible, coherente con su naturaleza de modelo de decision especializado.

## Requisitos de hardware

- VRAM estimada para inferencia: con F16, unos 1,7-1,8 GB; con Q8_0, unos 0,9-1 GB; con Q6_K, unos 0,7 GB; con Q4_K_M, unos 0,5-0,6 GB. El repo completo pesa 5,7 GB (incluye safetensors y multiples cuants).
- GPU recomendadas: no requiere GPU dedicada. El autor lo ejecuta en CPU Apple Silicon (M2), y las comparativas de referencia usan RTX 5060 Ti para otros modelos. Cualquier GPU moderna con 4-6 GB de VRAM es mas que suficiente.
- Cabe en consumer GPU: si, sobradamente. Ejecutable incluso en portatiles con GPU integrada; el propio entrenamiento se hizo en un MacBook Air M2 de 8 GB.
- Opciones de despliegue: llama.cpp, LM Studio, builds MLX de los mismos pesos fusionados, o la libreria transformers de HuggingFace (con safetensors). El autor insiste en no usar chat templates sobre las preguntas: la decision head es el producto.
- Latencia y throughput: p50 de unos 500 ms por decision en Apple M2 (medida del autor). Para contextos muy largos, recomienda subir ligeramente el batch fisico para evitar prefill lento o inestable en portatil.
- Entrenamiento/fine-tune adicional: reproducible en hardware de consumo (el original se entreno en un M2 con 8 GB usando QLoRA y Unsloth).

## Comparativa con modelos similares

| Modelo | Tamano | Accuracy typed-decisions | Contexto | Latencia p50 | Licencia |
|---|---:|---:|---:|---:|---|
| kAI Bolt 0.8B | 0,8B | 0,7465 | 262k | ~500 ms (M2) | Apache-2.0 |
| Rizzo Flow 4B | 4B | 0,648 | no disponible | 195 ms (RTX 5060 Ti) | no disponible |
| Rizzo Flow 1.7B | 1,7B | 0,544 | no disponible | 109 ms (RTX 5060 Ti) | no disponible |
| od1-nano (od1-typed-decisions) | no disponible | 0,751 | no disponible | no disponible | no disponible |
| Jev 1.13.0 | hosted | 0,727 | no disponible | no disponible | no disponible |

kAI Bolt supera en precision a modelos de 4B y 1,7B de la misma familia de tareas (Rizzo Flow) con menos de la cuarta parte de parametros, aunque con mayor latencia que estos en GPU. Solo od1-nano lo supera ligeramente (0,751 frente a 0,7465), con un harness de evaluacion distinto que impide comparacion directa.

## Limitaciones y advertencias

- Modelo especializado: no genera texto conversacional, no razona en multiples pasos ni escribe codigo. Usarlo como chatbot seria un mal uso de la arquitectura.
- Idiomas: entrenado y etiquetado solo para ingles e italiano. No hay soporte documentado para castellano ni otros idiomas.
- Riesgo de alucinacion reducido pero no nulo: al abstenerse mediante opciones entrenadas, el modelo evita adivinar, pero la fiabilidad de las probabilidades (calibracion) no se documenta con metricas ECE propias.
- Orden de opciones: el autor advierte explicitamente que el orden de las opciones no debe usarse como caracteristica de entrada.
- Contexto largo en hardware limitado: una ventana de 262k tokens con batch fisico muy pequeno puede producir prefill lento o inestable en portatiles.
- Protocolos de benchmark no pareados: las cifras de typed-decisions provienen de ejecuciones en maquinas y harness distintos; la cifra de 0,7465 es una medida del autor, no una submission a leaderboard.
- Nombre de archivo con errata: el GGUF principal conserva la grafia "realease" del upload original.
- Licencia: Apache-2.0, sin restricciones para uso comercial, pero el modelo hereda las limitaciones de la base Qwen3.5-0.8B en cuanto a sesgos del preentrenamiento, no documentados en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Franci11/kAI_Bolt_0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- README de Rizzo Flow (fuente de la tabla comparativa): https://github.com/Rizzo-AI-Academy/rizzo-flow
- Modelo od1-typed-decisions (referencia): https://huggingface.co/mvbalaji/od1-typed-decisions
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
