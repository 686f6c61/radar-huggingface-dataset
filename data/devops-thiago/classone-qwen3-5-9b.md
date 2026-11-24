# devops-thiago/classone-qwen3.5-9b

## Resumen

classone-qwen3.5-9b es un modelo de decisión de "Sistema 1" desarrollado por el usuario devops-thiago y publicado en Hugging Face. Se construye mediante fine-tuning del modelo base Qwen/Qwen3.5-9B siguiendo la arquitectura ClassOne (Classifier One), cuyo código está disponible en el repositorio GitHub del autor. A diferencia de un modelo generativo convencional, ClassOne no produce texto token a token: evalúa decisiones estructuradas en un único forward pass y devuelve salidas tipadas y calibradas, eliminando la sobrecarga de decodificación.

El modelo se distribuye como un backbone fusionado y autónomo dentro del propio repositorio, de modo que se carga como un único modelo sin adaptador ni descarga separada del modelo base. Cuenta con 8.392.695.024 parámetros totales (aproximadamente 8,4 mil millones) y un tamaño de repositorio de 17 GB en formato safetensors. Su pipeline declarado es text-classification y su licencia es Apache 2.0.

La relevancia del modelo radica en su enfoque: sustituye la generación autoregresiva por clasificación calibrada de decisiones, lo que reduce la latencia y permite obtener puntuaciones de confianza (ECE, Brier score) directamente utilizables en sistemas de enrutamiento de herramientas, guardarraíles de seguridad y evaluación de alineamiento. El autor publica resultados tanto auto-medidos como una evaluación oficial de terceros en Benchmark Heaven.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B) con cabeza de decisión ClassOne; evaluación en un único forward pass |
| Parametros totales | 8.392.695.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 17 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-9B y se adapta mediante la arquitectura ClassOne, descrita en el repositorio github.com/devops-thiago/class-one. La innovación principal es que el modelo no decodifica texto: recibe una decisión estructurada y la evalúa en un solo forward pass, devolviendo una salida tipada acompañada de una puntuación calibrada. Los tags del modelo incluyen "decision-model", "system-1", "rlcd" y "proper-scoring-rules", lo que indica el uso de reglas de puntuación propias (proper scoring rules) para la calibración y de RLCD (Reinforcement Learning from Classification Data o similar) en el proceso de ajuste.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de RLHF/DPO en la información proporcionada. El modelo se distribuye como backbone fusionado, sin adaptador separado, lo que simplifica el despliegue pero impide recuperar el modelo base original desde este repositorio.

## Capacidades

- Clasificación y evaluación de decisiones estructuradas en un único forward pass, con salidas tipadas y calibradas.
- Puntuación de calibración: el modelo reporta ECE y Brier score, lo que permite usar sus confianzas en sistemas que requieran umbrales.
- Enrutamiento de herramientas (tool routing): evaluado en NVIDIA When2Call con precisión del 75,00% en el split mcq y 97,1% en la clase tool_call.
- Detección de contenido dañino y guardarraíles de seguridad: evaluado en WildGuardTest con 89,00% de precisión y AUROC de 0,9607.
- Detección de inyección de prompts: evaluado en deepset/prompt-injections con 71,55%–72,41% de precisión y AUROC de 0,7902.
- Evaluación de alineamiento y seguridad en diez modos de fallo (honestidad, rechazo, fidelidad, búsqueda de poder, ocultación de incertidumbre, sesgo social, inyección de prompts, privacidad, sicofancia).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling generativo ni razonamiento multi-paso en el sentido de un LLM generativo; el modelo está orientado a decisión y clasificación.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enrutamiento de herramientas en agentes: el modelo decide si una petición requiere llamar a una herramienta, pedir más información o responder directamente, con una precisión del 97,1% en la clase tool_call según When2Call, lo que lo hace adecuado como primer filtro de bajo coste antes de invocar un LLM generativo.
- Guardarraíl de seguridad en producción: clasifica entradas de usuario como benignas o adversarias con AUROC de 0,9607 en WildGuardTest, útil como capa de filtrado previa a un modelo generativo expuesto a usuarios.
- Detección de inyección de prompts: con AUROC de 0,7902 y 96,4% de especificidad en benignos, puede integrarse en pipelines de aplicaciones LLM para bloquear intentos de manipulación del sistema.
- Evaluación automática de respuestas de modelos: la suite RLCDAlignBench permite puntuar honestidad, rechazo, fidelidad y sicofancia, de modo que el modelo puede actuar como juez calibrado en pipelines de evaluación de alineamiento.
- Clasificación de conocimiento y recuperación: la Decision Index Suite reporta 100% en las categorías Knowledge, Language, Retrieval y Tools, lo que lo hace apto para decidir si una consulta necesita recuperación documental o puede resolverse con conocimiento interno.
- Moderación de contenido y sesgo: la evaluación de sesgo social y privacidad, aunque con métricas más bajas (55,6% y 50,0% de precisión respectivamente), permite usar el modelo como señal auxiliar en sistemas de revisión que combinen varios clasificadores.
- Filtrado de baja latencia en edge: con latencias p50 de 106–113 ms en tareas fáciles y originales sobre 2x RTX 5060 Ti, es viable en despliegues locales o de borde donde no se puede asumir el coste de un LLM generativo.

## Benchmarks y rendimiento

Resultados auto-medidos por el autor sobre 2x NVIDIA RTX 5060 Ti 16 GB (fecha 2026-11-13, commit c375207):

| Suite | Tareas | Métrica | Valor |
|---|---|---|---|
| JevBench Easy | 48 | Accuracy | 100,0% (48/48) |
| JevBench Easy | 48 | ECE | 0,0029–0,0031 |
| JevBench Original | 72 | Accuracy | 97,2% (70/72) |
| JevBench Hard | 111 | Accuracy | 59,5% (66/111) |
| JevBench agregado público | 231 | Accuracy | 79,7% (184/231) |
| Decision Index Suite | 50 | Accuracy | 100,0% (50/50) |
| RLCDAlignBench | 100 | Balanced accuracy | 65,1% |
| RLCDAlignBench | 100 | AUROC | 0,623 |
| NVIDIA When2Call (mcq, 100) | 100 | Accuracy | 75,00% |
| WildGuardTest (100) | 100 | Accuracy | 89,00% |
| WildGuardTest (100) | 100 | AUROC | 0,9607 |
| Deepset Prompt Injections (116) | 116 | Accuracy | 71,55%–72,41% |

Evaluación oficial de terceros en Benchmark Heaven (JevBench v1.8.10, publicada 2026-11-12):

| Métrica | Valor |
|---|---|
| Composite Score | 43,0 (rank #131) |
| Intelligence | 42,2 |
| Calibration | 58,7 |
| Capability | 50,5 (rank #181 de 243 modelos open-weights) |

El autor explica que la diferencia entre las cifras auto-medidas y las oficiales se debe al uso de ítems sellados en la evaluación oficial, a una penalización por brecha entre subconjuntos público y sellado, y a la regla estricta de 10 segundos con normalización de latencia y coste sobre GPUs de referencia de servidor.

## Requisitos de hardware

- VRAM estimada: con 8,39 mil millones de parámetros, en FP16 se requieren aproximadamente 16,8 GB solo para pesos; en FP8 unos 8,4 GB; en INT4 unos 4,2 GB. No se publican cuantizaciones oficiales.
- GPU recomendadas: el autor reporta ejecución en 2x NVIDIA RTX 5060 Ti 16 GB. Una sola RTX 4090 (24 GB) o RTX 5090 deberían acomodar el modelo en FP16; A100 (40/80 GB) y H100 (80 GB) ofrecen margen amplio.
- Cabe en GPU de consumo: sí, en GPUs con 16 GB o más en FP16, y en GPUs de 8 GB si se aplica cuantización INT8/INT4 (no se publican versiones GGUF oficiales).
- Opciones de despliegue: no se documentan explícitamente; al ser un modelo safetensors con pipeline text-classification, es compatible con cargadores estándar de Transformers. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia: p50 de 106,5–112,8 ms en tareas fáciles/originales, 320,1 ms en tareas difíciles y 694,7 ms de media en RLCDAlignBench, según mediciones del autor en 2x RTX 5060 Ti 16 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| classone-qwen3.5-9b | 8,39 B | no disponible | Clasificación/decisión calibrada (ClassOne) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | LLM generativo | no disponible en la información | Hugging Face |
| Alternativas de clasificación de 7–9 B | no disponible | no disponible | Clasificación | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a otros modelos de clasificación en la información proporcionada. La comparación directa con el modelo base Qwen3.5-9B no es posible porque este último es generativo y no se han publicado métricas equivalentes en la información disponible.

## Limitaciones y advertencias

- El modelo no es generativo: no produce texto libre ni código; su uso está restringido a tareas de decisión y clasificación estructurada.
- Rendimiento degradado en tareas difíciles: 59,5% de accuracy en el tier Hard de JevBench y balanced accuracy de 65,1% en RLCDAlignBench.
- Calibración deficiente en varios ejes: ECE de 0,3240 en RLCDAlignBench, con valores especialmente altos en sicofancia (0,6490) y sesgo social (0,4213), lo que limita el uso de sus confianzas como probabilidades fiables en esos dominios.
- Sicofancia: AUROC de 0,250–0,300 y accuracy de 44,4%, por debajo del azar, lo que indica que no debe usarse para detectar adulación en respuestas.
- Detección de inyección de prompts: recall de 48,3%–50,0% en deepset, insuficiente como único mecanismo de defensa.
- Sesgo social y privacidad: precisión del 55,6% y 50,0% respectivamente, lo que requiere supervisión humana y clasificadores complementarios.
- Brecha público/sellado: la diferencia entre las métricas auto-medidas (79,7% en JevBench público) y la evaluación oficial (Composite 43,0) sugiere sobreajuste a los conjuntos públicos.
- Idiomas soportados no documentados; no se garantiza comportamiento multilingüe.
- Longitud de contexto no disponible, lo que impide planificar despliegues con entradas largas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones adicionales que no se detallan en la información disponible.
- Riesgo de alucinación: al ser un clasificador, el riesgo se traslada a falsos positivos/negativos en las decisiones, no a texto inventado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devops-thiago/classone-qwen3.5-9b
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio ClassOne: https://github.com/devops-thiago/class-one
- JevBench: https://github.com/fstandhartinger/jevbench
- Dataset Jev Decision Index: https://huggingface.co/datasets/multimodalart/jev-decision-index
- Dataset RLCDAlignBench: https://huggingface.co/datasets/sumleo/RLCDAlignBench
- Paper RLCDAlignBench: arXiv:2609.29429
- Dataset NVIDIA When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset WildGuardTest: https://huggingface.co/datasets/walledai/WildGuardTest
- Dataset Deepset Prompt Injections: https://huggingface.co/datasets/deepset/prompt-injections
- Benchmark Heaven (resultados oficiales): https://benchmarkheaven.com/jev-models
- Página del modelo en Benchmark Heaven: https://benchmarkheaven.com/jev-models/classone-qwen3.5-9b
