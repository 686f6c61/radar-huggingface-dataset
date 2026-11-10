# devops-thiago/classone-gemma4-e4b

## Resumen

ClassOne Gemma4 E4B es un modelo de decisión ("System 1") desarrollado por el usuario devops-thiago, construido mediante fine-tuning completo del backbone google/gemma-4-E4B-it. A diferencia de un modelo generativo convencional, no produce texto token a token: evalúa decisiones estructuradas en un único forward pass y devuelve salidas tipadas y calibradas (booleanos con probabilidad, selección categórica entre opciones y puntuaciones ordinales sobre rúbricas). El repositorio incluye el backbone completo, por lo que se carga como un único modelo sin adaptadores ni descarga separada del modelo base.

El modelo resuelve el problema de las decisiones binarias o categóricas rápidas y calibradas dentro de pipelines: triaje de relevancia, guardarraíles de ejecución de herramientas, verificación de contratos de política y scoring de calidad. Con 7.941.100.832 parámetros totales y un tamaño de repositorio de 16,2 GB en safetensors, está pensado para despliegue en local con latencias de decenas a centenares de milisegundos, muy por debajo de una llamada a una API en la nube según las mediciones del propio autor.

Es relevante ahora porque propone un patrón alternativo al uso de LLM generativos para tareas de clasificación y control: elimina la decodificación autoregresiva, expone distribuciones de probabilidad calibradas y se integra como primitiva de decisión en sistemas agénticos. La licencia Apache 2.0 facilita su adopción comercial, aunque las capacidades reales medidas en las suites de evaluación son desiguales y deben interpretarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Gemma 4 E4B) con cabezas de decisión ClassOne; evaluación en un único forward pass |
| Parámetros totales | 7.941.100.832 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se distribuyen en safetensors; el quickstart usa float16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone google/gemma-4-E4B-it, un transformer de aproximadamente 7,9 mil millones de parámetros, sobre el que se ha realizado un fine-tuning completo (no un adaptador LoRA). Sobre ese backbone se añaden cabezas de decisión que implementan tres primitivas: `Noul` (comprobación booleana que devuelve P(true) calibrada en [0,1]), `Choice` (selección categórica sobre 2 a 255 opciones dinámicas con distribución de probabilidad completa) y `Score` (puntuación ordinal continua sobre rúbricas de 2 a 10 niveles mediante valor esperado). La inferencia sustituye la generación token a token por una evaluación directa de la decisión, lo que elimina la sobrecarga de decodificación.

El entrenamiento utiliza pérdida combinada de NLL más Brier normalizado, y se aplica calibración de temperatura post-hoc que reduce el ECE de 0,178 a 0,034 según la model card. Los tags del repositorio mencionan RLCD (Reinforcement Learning from Classification Decisions o similar, según la nomenclatura del autor) y "proper scoring rules", lo que sugiere un entrenamiento orientado a la calibración probabilística más que a la perplejidad. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO convencionales.

## Capacidades

- Clasificación binaria calibrada mediante la primitiva `Noul`, con salida de probabilidad P(true) en lugar de una etiqueta rígida.
- Selección categórica entre 2 y 255 opciones dinámicas mediante `Choice`, devolviendo la distribución completa sobre las opciones.
- Puntuación ordinal sobre rúbricas de 2 a 10 niveles mediante `Score`, con valor esperado como salida.
- Detección de inyección de prompts y contenido adversario (evaluado en deepset/prompt-injections y WildGuardTest).
- Triaje de relevancia en recuperación de información (evaluado en la dimensión Retrieval & Relevance Triage del Hugging Face Decision Index).
- Guardarraíles de ejecución de herramientas y enrutamiento de tool calling (evaluado en NVIDIA When2Call).
- Verificación de cumplimiento de contratos de política lingüística y de conocimiento.
- Evaluación de modos de fallo de alineación: refusal, honesty, reward hacking, faithfulness, power seeking, privacy, concealing uncertainty y bias.
- No es un modelo generativo: no produce texto libre, por lo que no soporta diálogo abierto ni generación de código como tal.
- Capacidades multilingües: no disponible.

## Casos de uso

- Triaje de relevancia en pipelines RAG: usar `Noul` para decidir si un documento recuperado es relevante para la consulta antes de pasarlo a un LLM generativo, reduciendo coste y latencia; el modelo obtuvo 100% de acierto en la dimensión de Retrieval & Relevance Triage del Decision Index.
- Guardarraíl de ejecución de herramientas en agentes: emplear `Noul` o `Choice` para validar si una llamada a herramienta cumple las políticas antes de ejecutarla, con latencias p50 en torno a 130 ms en WildGuardTest.
- Detección de inyección de prompts: clasificar entradas de usuario como benignas o maliciosas antes de enviarlas al modelo principal; la especificidad benigna medida es del 96,4% en deepset/prompt-injections, aunque el recall de inyección es solo del 33,3%, por lo que debe combinarse con otras defensas.
- Scoring de calidad de respuestas generadas: aplicar `Score` sobre rúbricas de 2 a 10 niveles para filtrar o rankear salidas de un LLM en producción, con calibración ECE de 0,034.
- Enrutamiento de decisiones de negocio: usar `Choice` para clasificar tickets, intenciones o categorías con hasta 255 opciones y obtener la distribución de probabilidad para umbrales de confianza.
- Evaluación de alineación y seguridad en pipelines de QA: ejecutar el modelo sobre pares de respuestas para detectar modos de fallo (decepción, búsqueda de poder, filtración de secretos) como filtro previo a la publicación.
- Despliegue en edge para privacidad: ejecutar localmente en una RTX 5060 Ti con latencia media de 52,49 ms y coste de inferencia nulo, según las mediciones del autor, para decisiones sensibles que no deben salir del perímetro.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Benchmark | Métrica | Resultado |
|---|---|---|
| JevBench Easy (48 tareas) | Accuracy / ECE / Brier | 100,0% / 0,0009 / 0,0000 |
| JevBench Original (72 tareas) | Accuracy / ECE / Brier | 95,8% / 0,0236 / 0,0328 |
| JevBench Hard (111 tareas) | Accuracy / ECE / Brier | 45,9% / 0,3785 / 0,3500 |
| JevBench agregado (231 tareas) | Accuracy | 72,7% (168/231) |
| HF Decision Index (50 tareas) | Accuracy / Score / ECE | 94,0% / 97,16 / 0,0312 |
| deepset/prompt-injections (116) | Accuracy / AUROC / Recall TP | 63,79% / 0,7499 / 33,3% |
| RLCDAlignBench (100) | Balanced accuracy / AUROC / ECE | 63,3% / 0,583 / 0,2874 |
| WildGuardTest (100) | Accuracy / AUROC | 84,00% / 0,9217 |
| NVIDIA When2Call mcq (100) | Accuracy | 43,00% |

Desglose del Hugging Face Decision Index por dominio:

| Dominio | Peso | Accuracy |
|---|---|---|
| Knowledge & Verification | 25,8% | 100,0% |
| Language & Policy Contracts | 25,8% | 100,0% |
| Retrieval & Relevance Triage | 20,0% | 100,0% |
| Tools & Execution Guardrails | 18,3% | 90,0% |
| Rubric & Quality Scoring | 10,1% | 90,0% |

Latencia comparada (medición del autor):

| Entorno | Latencia media | Throughput |
|---|---|---|
| ClassOne local (RTX 5060 Ti) | 52,49 ms | 19,1 req/s |
| TypeSafe Jev API (nube, v1.13) | 329,90 ms | 3,0 req/s |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 7,94 mil millones de parámetros en float16 se requieren aproximadamente 16 GB solo para pesos, más overhead de activaciones y cabezas.
- GPU recomendadas: el autor reporta ejecución en una RTX 5060 Ti; por tamaño, cabría en RTX 4090 (24 GB), A100 (40/80 GB) y H100.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en float16; en cuantizaciones de 8 bits o 4 bits podría reducirse, aunque no se documentan formatos cuantizados.
- Opciones de despliegue: el quickstart oficial usa la librería `classone` con `transformers` y `ClassOneModel.from_backbone` en CUDA con float16; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 de 117,3 ms en JevBench Original, 118,4 ms en Easy, 253,4 ms en Hard; 52,49 ms de media y 19,1 req/s en RTX 5060 Ti según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| classone-gemma4-e4b | 7,94 B | no disponible | Decisión System 1 sobre backbone Gemma 4 E4B | Apache 2.0 | Hugging Face (97 descargas) |
| google/gemma-4-E4B-it | no disponible | no disponible | LLM generativo instruct | no disponible en la información | Modelo base en Hugging Face |
| TypeSafe Jev (v1.13) | no disponible | no disponible | API en nube de decisión | propietaria | API comercial |

No se dispone de datos de benchmarks comparativos directos con otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento cae drásticamente en tareas difíciles: 45,9% de accuracy y ECE de 0,3785 en el tier Hard de JevBench, lo que indica mala calibración fuera de distribución.
- El recall de detección de inyección de prompts es bajo (33,3%), aunque la especificidad benigna es alta (96,4%); no debe usarse como única defensa.
- El rendimiento en RLCDAlignBench es moderado (63,3% de balanced accuracy, AUROC 0,583) y particularmente débil en sesgo (AUROC 0,225) y refusal ante jailbreaks (AUROC 0,433).
- En NVIDIA When2Call la accuracy global es del 43,00%, con solo 29,2% en `request_for_info`, lo que limita su uso como enrutador de herramientas autónomo.
- No es un modelo generativo: no puede producir texto, código ni razonamiento en lenguaje natural; su uso está restringido a las primitivas de decisión.
- No se especifican idiomas soportados ni longitud de contexto, lo que dificulta planificar su integración en pipelines multilingües o con entradas largas.
- Los benchmarks son autoinformados por el autor y no se han verificado de forma independiente; el repositorio tiene 0 likes y 97 descargas en el momento de la consulta.
- Aunque la licencia es Apache 2.0, el modelo base es google/gemma-4-E4B-it, cuyos términos deben respetarse adicionalmente.
- Riesgo de alucinación estructural: al devolver probabilidades calibradas, un ECE alto en dominios fuera de distribución puede inducir decisiones erróneas con aparente confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devops-thiago/classone-gemma4-e4b
- Repositorio de la arquitectura ClassOne: https://github.com/devops-thiago/class-one
- Benchmark JevBench: https://github.com/fstandhartinger/jevbench
- Dataset WildGuardTest: https://huggingface.co/datasets/walledai/WildGuardTest
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset NVIDIA When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Paper de referencia RLCDAlignBench: arXiv:2609.29429
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
