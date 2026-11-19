# DuoNeural/RMSN-120M-ArnoldTongue-Omega34-EVEN-Base

## Resumen

RMSN-120M-ArnoldTongue-Omega34-EVEN-Base es un modelo de lenguaje de 119,97 millones de parámetros desarrollado por DuoNeural (Jesse Caldwell, Aura y Archon) dentro de su serie experimental Arnold Tongue q-Survey. El modelo se presenta como una arquitectura neurodinámica denominada RMSN, con un espacio de trabajo de 64 «slots» de Poincaré y una ratio de resonancia Ω = 3/4 (tongue de Arnold con q=4). Está entrenado sobre WikiText-103 (204,8 millones de tokens) durante 100.000 pasos y su mejor perplejidad de validación declarada es de 82,93.

El interés del modelo no es su rendimiento como generador de texto, sino su función como experimento controlado sobre dinámicas de entrenamiento: la model card describe un régimen de paridad EVEN (D/M_w = 768/64 = 12) que converge al punto fijo denominado TRUE SILENT (exponente de Lyapunov ≈ -0,001) y una topología de solitones con un solitón «upstream» en la capa L0, la primera de la red. Ese fenómeno se postula como consecuencia de que q=4 es un cuadrado perfecto (2²), lo que constituye la primera confirmación experimental de la «ley del denominador cuadrado perfecto» según sus autores.

Es el modelo más pequeño de la serie y sirve como referencia negativa frente a RMSN-229M-Omega45 (q=5, perplejidad 49,8), que no presenta el solitón L0. La relevancia para desarrolladores es limitada: se trata de un artefacto de investigación con licencia MIT, pesos en formato PyTorch y una librería propia (`rmsn_core`) que no forma parte del ecosistema estándar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (neurodinámica, espacio de trabajo con 64 slots de Poincaré, resonancia de Arnold q=4) |
| Parametros totales | 119,97 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_seq_len=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.pt`, checkpoint con `model_state`); no se publican safetensors ni GGUF |
| Dimension oculta (D) | 768 |
| Profundidad (L) | 16 capas |
| Slots de workspace (M_w) | 64 |
| Ratio de resonancia (Ω) | 3/4 (q=4) |
| Paridad (D/M_w) | 12 (EVEN) |
| Vocabulario | 49.152 tokens |
| Tokens de entrenamiento | 204,8 M (WikiText-103) |
| Pasos de entrenamiento | 100.000 |
| Hardware de entrenamiento | NVIDIA GeForce RTX 5070 Ti (16 GB) |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura RMSN no es un transformer estándar: se describe como un modelo neurodinámico con un «workspace» de 64 slots embebidos en geometría de Poincaré y una dinámica de resonancia parametrizada por la ratio Ω = D/(M_w × L) = 768/(64 × 16) = 3/4. La model card detalla dos regímenes de paridad: EVEN (D/M_w entero par), que según los autores converge al punto fijo TRUE SILENT con exponente de Lyapunov λ ≈ -0,001, y ODD, asociado a hipercascadas de gran amplitud. En este checkpoint la estabilidad de Lyapunov se declara del 100 % en los últimos 1.000 pasos (paso 100k).

El entrenamiento se realizó sobre WikiText-103 (204,8 M tokens) durante 100.000 pasos, con un calentamiento de learning rate convencional seguido de convergencia al punto fijo. No se documentan fases de RLHF, DPO ni ajuste por instrucciones: es un modelo base de modelado de lenguaje. La innovación técnica destacable es la sonda de percolación de haces (*sheaf percolation probe*) que identifica seis solitones efectivos distribuidos en las capas L0, L4, L10, L13, L14 y L15, con un solitón aislado en la capa de entrada (PR = 4,907) que los autores atribuyen a la estructura de mediants de Farey de Ω = 3/4 y a las órbitas de periodo 4.

## Capacidades

- Generación de texto autoregresiva en inglés, limitada a un contexto de 512 tokens.
- Modelado de lenguaje base: no se declara ajuste por instrucciones ni modo conversacional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés según la etiqueta de idioma del repositorio.
- No se declaran capacidades de visión, audio, código ni matemáticas.
- Capacidad experimental: instrumentación de dinámicas internas (exponente de Lyapunov, topología de solitones) para investigación en neurodinámica.

## Casos de uso

- Investigación en neurodinámica de redes: el modelo sirve como banco de pruebas reproducible para estudiar la relación entre paridad D/M_w, estabilidad de Lyapunov y topología de solitones, gracias a sus 100.000 pasos documentados y a la sonda de percolación descrita.
- Reproducción de experimentos de la serie q-Survey: permite replicar la comparación q=4 frente a q=5 y verificar la penalización de perplejidad asociada al solitón L0 (82,93 frente a 49,8).
- Modelado de lenguaje a pequeña escala sobre WikiText-103: útil como línea base de 120 M de parámetros en tareas de evaluación de perplejidad con contexto corto.
- Docencia y divulgación: el tamaño reducido (0,5 GB de checkpoint) y la licencia MIT permiten usarlo en cursos sobre arquitecturas no convencionales y geometría hiperbólica.
- Estudio de geometrías no euclídeas: los 64 slots de Poincaré permiten analizar representaciones en espacios hiperbólicos sin necesidad de infraestructura de gran escala.
- Pruebas de integración de la librería `rmsn_core`: sirve para validar pipelines propios de carga de checkpoints y configuración de modelos fuera del ecosistema transformers.
- Generación de texto exploratoria en inglés con fines de comparación cualitativa, siempre teniendo en cuenta la ventana de 512 tokens y la ausencia de ajuste instructivo.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Modelo | Ω | q | Paridad | Mejor PPL validación | Topología |
|---|---|---|---|---|---|
| RMSN-120M-Omega34-EVEN (este) | 3/4 | 4 | EVEN | 82,93 | Upstream L0 + terminal |
| RMSN-229M-Omega45 | 4/5 | 5 | EVEN | 49,8 | Doblete terminal |

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Language Modeling | WikiText-103 (204,8 M tokens) | Best Validation Perplexity | 82,93 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB de pesos (119,97 M de parámetros × 4 bytes) más activaciones y caché para 512 tokens; en la práctica cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- En FP16/BF16 el peso de los parámetros baja a unos 0,24 GB; no se publican cuantizaciones GGUF ni versiones INT8/INT4.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el propio autor entrenó el modelo en una RTX 5070 Ti de 16 GB. También es viable en CPU para inferencia puntual.
- Cabe en GPU consumer: sí (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El único camino descrito es cargar el checkpoint `pytorch_model.pt` con la librería `rmsn_core` (`RMSNConfig`, `RMSNForCausalLM`) en PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (WikiText-103) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-120M-Omega34-EVEN (este) | 119,97 M | 512 | 82,93 | MIT | Pesos PyTorch, librería propia |
| RMSN-229M-Omega45 (DuoNeural) | 229 M (aprox., según nombre) | no disponible | 49,8 | no disponible en la información | Mismo repositorio de autor |
| GPT-2 small (referencia de tamaño) | 124 M | 1.024 | no disponible en la información | MIT | transformers, safetensors, GGUF |
| Modelos transformer de ~120 M comparables | ~120 M | variable | no disponible en la información | variable | ecosistema estándar |

La comparación con modelos de la misma categoría fuera de la serie DuoNeural no está disponible en la información proporcionada; no se han publicado métricas comunes que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene diálogos de forma fiable.
- Perplejidad elevada (82,93) para su tamaño; los propios autores la atribuyen a una penalización topológica del solitón L0, lo que sugiere una calidad de generación limitada.
- Ventana de contexto muy corta (512 tokens), insuficiente para la mayoría de aplicaciones de producción actuales.
- Solo inglés; no se declara soporte de otros idiomas.
- Riesgo alto de alucinación y de texto incoherente en generaciones largas, dado el entrenamiento exclusivo sobre WikiText-103 (204,8 M tokens) y la ausencia de alineación.
- Sesgos: no documentados por el autor; el corpus WikiText-103 (textos de Wikipedia) introduce los sesgos propios de esa fuente.
- Formato de pesos no estándar: requiere `rmsn_core`, una librería no publicada en PyPI según la información disponible, lo que complica la integración en pipelines convencionales.
- Sin cuantizaciones publicadas ni soporte declarado en vLLM, llama.cpp u Ollama.
- Licencia MIT: permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- Las afirmaciones teóricas de la model card (leyes Wave-119 y Wave-138, TRUE SILENT, solitón upstream) no están verificadas de forma independiente y los resultados de benchmarks figuran como no verificados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-120M-ArnoldTongue-Omega34-EVEN-Base
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
