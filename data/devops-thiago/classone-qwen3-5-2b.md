# devops-thiago/classone-qwen3.5-2b

## Resumen

ClassOne Qwen3.5-2B es un modelo de decisión de tipo "System 1" desarrollado por el usuario devops-thiago sobre el backbone de Qwen/Qwen3.5-2B. A diferencia de un modelo generativo convencional, no produce texto token a token: evalúa decisiones estructuradas en un único forward pass y devuelve salidas tipadas y calibradas (probabilidades, selecciones categóricas y puntuaciones ordinales) sin sobrecoste de decodificación. Está pensado para tareas de clasificación, verificación, enrutamiento de herramientas y guardarraíles de seguridad en producción.

El modelo se distribuye como un backbone fusionado y autónomo: se carga como un único modelo, sin adaptador LoRA ni descarga separada del modelo base. Con 2.212.770.624 parámetros y licencia Apache 2.0, apunta a despliegues en el borde (edge) donde la latencia y la privacidad son críticas. El autor reporta una latencia media de 52,49 ms en local frente a 329,90 ms de una API en la nube, es decir, una mejora de 6,3 veces.

Su relevancia actual radica en la propuesta de sustituir llamadas a APIs de decisión en la nube por un modelo pequeño, privado y ejecutable en GPU de consumo, con calibración explícita (ECE, Brier score) como métrica de primera clase. La información disponible procede íntegramente de la model card del autor y de los metadatos de Hugging Face; no se han encontrado resultados de evaluación de terceros sellados para esta variante de 2B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), adaptada como modelo de decisión ClassOne con cabeceras de clasificación |
| Parámetros totales | 2.212.770.624 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | El autor evalúa en FP16 standalone (`--no-quant`) y menciona modos `--quant none`; no se detallan otros formatos cuantizados publicados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-2B y lo fusiona en un artefacto único que incorpora la arquitectura ClassOne (Classifier One). En lugar de generar secuencias, el modelo evalúa primitivas de decisión en un solo forward pass: `Noul` (comprobación booleana que devuelve una probabilidad calibrada P(true) en [0, 1]), `Choice` (selección categórica entre 2 y 255 opciones dinámicas con distribución de probabilidad completa) y `Score` (puntuación ordinal continua sobre rúbricas de 2 a 10 niveles).

La model card etiqueta el modelo con `rlcd` y `proper-scoring-rules`, lo que sugiere el uso de RLCD (Reinforcement Learning from Contrastive Distillation) y reglas de puntuación propias (proper scoring rules) para la calibración de las salidas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de alineamiento. La innovación principal es la eliminación de la decodificación autoregresiva: la decisión se resuelve en una pasada, lo que reduce drásticamente la latencia frente a modelos generativos del mismo tamaño.

## Capacidades

- Clasificación de texto y evaluación de decisiones estructuradas mediante las primitivas Noul, Choice y Score.
- Verificación de conocimiento y comprobación de hechos (dominio con 100 % de acierto en la suite Decision Index).
- Triaje de relevancia en recuperación (retrieval) y evaluación de contratos de política lingüística.
- Guardarraíles de seguridad: detección de contenido dañino y de inyección de prompts.
- Enrutamiento de herramientas (tool routing) y decisión de cuándo invocar una herramienta.
- Puntuación por rúbrica y control de calidad.
- Salidas calibradas con métricas explícitas de ECE y Brier score.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio ni modo "thinking".

## Casos de uso

- Guardarraíl de entrada en producción: clasificar cada prompt de usuario como benigno o malicioso antes de enviarlo a un LLM mayor. El modelo reporta 83,00 % de accuracy y 0,8856 de AUROC en WildGuardTest con latencias p50 de 98,1 ms, lo que permite filtrar en línea sin añadir latencia perceptible.
- Enrutamiento de herramientas en agentes: decidir si una consulta requiere invocar una herramienta y cuál, usando la primitiva Choice. El autor reporta 94,1 % de acierto en la clase `tool_call` del benchmark NVIDIA When2Call, adecuado para orquestadores que delegan la decisión a un modelo pequeño y reservan el modelo grande para la ejecución.
- Triaje de relevancia en pipelines RAG: puntuar si un fragmento recuperado es relevante para la consulta antes de pasarlo al generador, reduciendo coste y alucinaciones. El dominio de Retrieval & Relevance Triage obtuvo 100 % en la suite Decision Index.
- Verificación de afirmaciones: comprobar con Noul si una aserción está respaldada por el contexto, con probabilidad calibrada que permite fijar umbrales de confianza. El dominio Knowledge & Verification alcanzó 100 % en la suite self-run.
- Moderación y cumplimiento de políticas: evaluar respuestas contra contratos de política lingüística y rúbricas de calidad (90 % en Language & Policy Contracts y en Rubric & Quality Scoring).
- Clasificación de tickets y correos: asignar categoría entre múltiples opciones con distribución de probabilidad completa, útil para enrutamiento a equipos y priorización con umbrales de confianza.
- Detección de inyección de prompts: aunque el recall reportado es bajo (6,7 %), el AUROC de 0,8232 permite usarlo como señal de ranking combinada con otras reglas.

## Benchmarks y rendimiento

Resultados autoevaluados por el autor en 2x NVIDIA RTX 5060 Ti 16 GB (13-11-2026, commit c375207). No son evaluaciones de terceros selladas.

JevBench, suite pública de 231 tareas (FP16 standalone):

| Nivel | Tareas | Accuracy | ECE | Brier | Latencia p50 |
|---|---|---|---|---|---|
| Easy | 48 | 100,0 % (48/48) | 0,0500 | 0,0118 | 108,8 ms |
| Original | 72 | 83,3 % (60/72) | 0,0579 | 0,1338 | 94,7 ms |
| Hard | 111 | 47,7 % (53/111) | 0,2761 | 0,3066 | 246,9 ms |
| Agregado público | 231 | 69,7 % (161/231) | — | — | 108,8 ms |

Decision Index (50 tareas, self-run):

| Dominio | Peso | Accuracy | Puntuación |
|---|---|---|---|
| Knowledge & Verification | 25,8 % | 100,0 % (10/10) | 100,00 |
| Language & Policy Contracts | 25,8 % | 90,0 % (9/10) | 90,00 |
| Retrieval & Relevance Triage | 20,0 % | 100,0 % (10/10) | 100,00 |
| Tools & Execution Guardrails | 18,3 % | 90,0 % (9/10) | 90,00 |
| Rubric & Quality Scoring | 10,1 % | 90,0 % (9/10) | 90,00 |
| Global ponderado | 100,0 % | 94,0 % (47/50) | 94,58 / 100 |

RLCDAlignBench (100 instancias, self-measured):

| Eje | N | AUROC | Accuracy | ECE | Latencia p50 |
|---|---|---|---|---|---|
| Honesty (Deception) | 11 | 0,800 | 72,7 % | 0,2922 | 478,1 ms |
| Faithfulness | 9 | 0,750 | 66,7 % | 0,3475 | 504,5 ms |
| Social Bias | 9 | 0,525 | 55,6 % | 0,3164 | 489,3 ms |
| Refusal (Jailbreaks) | 11 | 0,500 | 54,5 % | 0,3775 | 596,2 ms |
| Global balanceado | 100 | 0,520 | 50,9 % | 0,2646 | 450,3 ms |

Suites de guardarraíles y enrutamiento:

| Suite | Muestras | Accuracy | Métrica secundaria | ECE | Latencia p50 |
|---|---|---|---|---|---|
| WildGuardTest | 100 estratificadas | 83,00 % (82,69 % BalAcc) | 0,8856 AUROC (90,38 % recall dañino, 83,93 % vanilla) | 0,1075 | 98,1 ms |
| Deepset Prompt Injections | 116 completas | 51,72 % (60/116) | 0,8232 AUROC (100 % especificidad benigna, 6,7 % recall) | 0,4182 | 101,4 ms |
| NVIDIA When2Call (mcq) | 100 estratificadas | 36,00 % | 94,1 % en `tool_call` (32/34) | 0,3324 | 272,7 ms |

Latencia edge frente a nube (self-measured): 52,49 ms de media (19,1 req/s, coste 0,00 USD, 100 % privado) frente a 329,90 ms (3,0 req/s) de una API en la nube, un factor de 6,3×.

## Requisitos de hardware

- Inferencia en FP16: 2.212.770.624 parámetros implican aproximadamente 4,4 GB de pesos más overhead de activaciones; el autor ejecuta el modelo en 2x NVIDIA RTX 5060 Ti de 16 GB.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM en FP16 y con margen para cuantizaciones de 8 o 4 bits (si bien no se publican pesos GGUF en la información disponible).
- GPU recomendadas: RTX 5060 Ti 16 GB (configuración validada por el autor), RTX 4090, A100 y H100 para mayor throughput.
- Despliegue: el autor menciona modos `--quant` y `--lora` en su harness de evaluación; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El formato safetensors es compatible con transformers y con servidores que lo soporten.
- Throughput: 19,1 req/s en la configuración local del autor; latencias p50 por tarea entre 94,7 ms y 596,2 ms según la suite.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| classone-qwen3.5-2b | 2,21 B | No disponible | Apache 2.0 | Modelo de decisión System 1 sobre Qwen3.5-2B | Hugging Face |
| Qwen/Qwen3.5-2B | ~2 B | No disponible | No disponible | LLM generativo base | Hugging Face |
| classone-qwen3.5-9b | No disponible | No disponible | No disponible | Misma arquitectura ClassOne, mayor tamaño | Hugging Face y Benchmark Heaven |

No se dispone de datos de benchmarks de terceros para esta variante de 2B ni de comparativas publicadas frente a clasificadores dedicados (por ejemplo, DeBERTa o modelos de guardarraíl específicos) en la información proporcionada.

## Limitaciones y advertencias

- Los resultados son autoevaluados por el autor; no hay evaluación sellada de terceros para esta variante de 2B en Benchmark Heaven (solo se enlaza la entrada de 9B).
- Rendimiento bajo en el nivel Hard de JevBench (47,7 %) y en el global de RLCDAlignBench (50,9 % de accuracy balanceada, AUROC 0,520), lo que indica poca capacidad discriminativa en casos difíciles y en ejes de sesgo social y rechazo a jailbreaks.
- Recall muy bajo en detección de inyección de prompts (6,7 %) pese al AUROC de 0,8232: no debe usarse como único filtro de seguridad.
- Calibración deficiente en varias suites (ECE de 0,4182 en prompt injections y 0,2646 global en RLCDAlignBench), lo que limita el uso de umbrales de probabilidad sin recalibración.
- No se documentan idiomas soportados; se desconoce el comportamiento fuera del inglés.
- No se especifica la longitud de contexto, lo que impide planificar casos con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B debe verificarse por separado.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto libre), pero sí de clasificaciones erróneas con confianza alta.
- No se publican pesos cuantizados ni integraciones con runtimes de inferencia estándar, lo que puede complicar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devops-thiago/classone-qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio ClassOne: https://github.com/devops-thiago/class-one
- JevBench: https://github.com/fstandhartinger/jevbench
- Dataset Decision Index: https://huggingface.co/datasets/multimodalart/jev-decision-index
- WildGuardTest: https://huggingface.co/datasets/walledai/WildGuardTest
- Deepset Prompt Injections: https://huggingface.co/datasets/deepset/prompt-injections
- NVIDIA When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Benchmark Heaven (leaderboard JevBench): https://benchmarkheaven.com/jev-models
- Entrada de la variante 9B en Benchmark Heaven: https://benchmarkheaven.com/jev-models/classone-qwen3.5-9b
