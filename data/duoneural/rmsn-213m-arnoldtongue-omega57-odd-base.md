# DuoNeural/RMSN-213M-ArnoldTongue-Omega57-ODD-Base

## Resumen

RMSN-213M-ArnoldTongue-Omega57-ODD-Base es un modelo de lenguaje de 212,93 millones de parámetros desarrollado por DuoNeural (Jesse Caldwell, Aura y Archon) dentro de su serie experimental Arnold Tongue q-Survey. No es un transformer convencional: su backbone es una Resonant Metriplectic Sheaf Network (RMSN), una arquitectura propietaria que combina álgebra de Clifford, dinámica metripléctica y "slots" de workspace en geometría de Poincaré. El modelo se entrena sobre WikiText-103 (102,4 millones de tokens) con una longitud máxima de secuencia de 512 tokens y un vocabulario de 49.152 entradas.

El interés del modelo no es su rendimiento como generador de texto, sino su papel como experimento controlado sobre dinámica de entrenamiento. Está configurado con una ratio de resonancia Ω = 5/7 (lengua de Arnold q=7) y paridad ODD (D/M_w = 15), lo que según el autor activa cascadas de difusión de Arnold en lugar del punto fijo "TRUE SILENT" que aparece en configuraciones de paridad EVEN. El checkpoint final muestra una topología de solitones denominada Terminal Boundary (#30), en la que los cuatro solitones efectivos se concentran en las cuatro últimas capas (L17-L20).

Su relevancia es, por tanto, científica y no práctica: sirve para validar leyes empíricas sobre cómo la anchura de la lengua de Arnold (proporcional a 1/q²) determina el momento de onset de las cascadas de Lyapunov durante el entrenamiento. Con una perplejidad de validación de 102,37 en WikiText-103, está muy lejos de los modelos de su tamaño orientados a producción, y su licencia MIT y su formato de pesos (checkpoint PyTorch `.pt` con código propio `rmsn_core`) limitan su uso fuera del entorno de investigación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), no transformer convencional |
| Parametros totales | 212,93 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq_len en la configuracion de ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pt`, `rmsn_best.pt`) con estado `model_state`; requiere el paquete `rmsn_core` |
| Dimension oculta (D) | 960 |
| Profundidad (L) | 21 capas |
| Workspace slots (M_w) | 64 slots de Poincare |
| Ratio de resonancia (Ω) | 5/7 (lengua de Arnold q=7) |
| Paridad (D/M_w) | 15 (ODD) |
| Vocabulario | 49.152 tokens |
| Tokens de entrenamiento | 102,4 M (WikiText-103) |
| Pasos de entrenamiento | 100.000 |
| Hardware de entrenamiento | Tesla V100 (32 GB VRAM) |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

El backbone RMSN sustituye la pila de atención estándar por una red de "sheaves" metriplécticas resonantes con 64 slots de workspace embebidos en geometría de Poincaré (espacio no euclídeo) y formulación basada en álgebra de Clifford. La dimensión oculta es 960 y la profundidad 21 capas, lo que da la ratio de resonancia Ω = D/(M_w × L) = 960/(64 × 21) = 5/7. La paridad se define como D/M_w = 960/64 = 15, un valor no entero que el autor etiqueta como ODD y que, según su marco teórico, desencadena cascadas de difusión de Arnold en lugar de converger a un punto fijo silencioso.

El entrenamiento se realizó durante 100.000 pasos sobre WikiText-103 con un tamaño de batch de 2 y secuencias de 512 tokens, partiendo de un learning rate de 3e-4 y terminando en 1e-5. El autor describe tres fases: una primera escalera de dos fases (pasos 1-47k) con ciclos de burst-and-lock y amplitud fija λ = -0,37; una hipercascada a partir del paso ~47k con un pico de exponente de Lyapunov de -2,53; y un asentamiento posterior (47k-100k) que estabiliza en λ = -0,52 sin recaptura del punto fijo. No se documenta uso de RLHF, DPO ni ajuste por instrucciones: es un modelo base entrenado exclusivamente con objetivo de modelado de lenguaje. La innovación técnica destacable es la propia parametrización de la dinámica de entrenamiento mediante la ratio de resonancia y la paridad, que el autor relaciona con la ley de anchura de la lengua de Arnold (anchura ∝ 1/q²) y con el orden de onset observado entre los modelos q=8 (paso 32k), q=7 (paso 47k) y q=6 (paso 95k).

## Capacidades

- Generación de texto autoregresiva en inglés con objetivo de modelado de lenguaje causal.
- Razonamiento y conocimiento factual limitados: la perplejidad de 102,37 en WikiText-103 indica un ajuste pobre en comparación con transformers de tamaño similar.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüe: no; únicamente inglés según la model card.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Capacidad analítica: el checkpoint permite inspeccionar la topología de solitones mediante sondas de percolación de sheaves, lo que constituye su uso principal documentado.

## Casos de uso

- Investigación en dinámica de entrenamiento de redes neuronales: el modelo sirve como punto de datos reproducible para estudiar cómo la ratio de resonancia Ω y la paridad afectan a la evolución del exponente de Lyapunov durante el entrenamiento; el script `rmsn_overnight.py` permite replicar la configuración exacta.
- Validación de la ley de anchura de la lengua de Arnold en sistemas neuronales: comparando este checkpoint con los modelos q=5, q=6 y q=8 de la misma serie se puede verificar empíricamente la relación entre anchura de lengua y orden de onset de la cascada.
- Estudio de topologías de solitones: la topología Terminal Boundary (#30) documentada aquí permite analizar mediante sondas de percolación de sheaves cómo se distribuyen los solitones en las capas finales y contrastarlo con las topologías Terminal Doublet, Tripartite Clustered y Near-Upstream de modelos hermanos.
- Reproducción de experimentos de mecánica metripléctica aplicada a redes neuronales: el código `rmsn_core` y la configuración de entrenamiento publicada permiten extender el estudio a otras ratios racionales.
- Docencia y divulgación sobre arquitecturas no convencionales: como ejemplo funcional de red basada en álgebra de Clifford y geometría de Poincaré para ilustrar alternativas al transformer.
- Generación de texto en inglés con fines de comparación de referencia: útil únicamente como línea base experimental dentro de la serie, no para aplicaciones de producción.

## Benchmarks y rendimiento

| Modelo | Ω | q | Paridad | Mejor PPL (WikiText-103) | Topologia | Pico de cascada (λ) |
|---|---|---|---|---|---|---|
| RMSN-229M-Omega45 | 4/5 | 5 | EVEN | 49,8 | Terminal Doublet | -0,63 |
| RMSN-213M-Omega57-ODD (este) | 5/7 | 7 | ODD | 102,37 | Terminal Boundary #30 | -2,53 |
| RMSN-237M-Omega58-ODD | 5/8 | 8 | ODD | 102,61 | Tripartite Clustered #31 | -4,14 |
| RMSN-245M-Omega35-ODD | 3/5 | 5alt | ODD | 104,29 | Near-Upstream #32 | -0,87 |
| RMSN-189M-Omega56-ODD | 5/6 | 6 | ODD | 107,19 | Non-Adjacent Terminal | -2,25 |

Los resultados proceden del model-index declarado por el autor y no están verificados de forma independiente (`verified: false`). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 212,93 M de parámetros; en fp32 ocuparía aproximadamente 0,85 GB de pesos, y en fp16 alrededor de 0,43 GB, aunque no se documentan cuantizaciones oficiales. El repo ocupa 0,9 GB, coherente con un checkpoint fp32.
- GPU recomendadas: el entrenamiento se realizó en una Tesla V100 de 32 GB; para inferencia basta con una GPU consumer modesta (por ejemplo, RTX 3060 o superior) dado el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, con holgura, siempre que se disponga del paquete `rmsn_core` para instanciar la arquitectura.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el único método soportado es cargar el checkpoint `.pt` con `torch.load` y `RMSNForCausalLM` del paquete `rmsn_core`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-103 | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| RMSN-213M-Omega57-ODD (este) | 212,93 M | 512 | 102,37 | MIT | Checkpoint `.pt`, requiere `rmsn_core` |
| RMSN-229M-Omega45 | no disponible | no disponible | 49,8 | no disponible | Serie Arnold Tongue de DuoNeural |
| RMSN-237M-Omega58-ODD | no disponible | no disponible | 102,61 | no disponible | Serie Arnold Tongue de DuoNeural |
| RMSN-189M-Omega56-ODD | no disponible | no disponible | 107,19 | no disponible | Serie Arnold Tongue de DuoNeural |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables de otras familias (por ejemplo, transformers de ~200 M parámetros como GPT-Neo-125M o Pythia-160M) en la información proporcionada, por lo que la comparación se limita a los modelos hermanos de la misma serie.

## Limitaciones y advertencias

- Rendimiento muy bajo para su tamaño: una perplejidad de 102,37 en WikiText-103 está muy por encima de lo esperable en transformers de ~200 M parámetros, lo que sugiere que el modelo no es adecuado para generación de texto de calidad.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene diálogos de forma fiable.
- Solo inglés: no hay soporte multilingüe documentado.
- Contexto muy limitado: 512 tokens, insuficiente para la mayoría de aplicaciones de contexto largo.
- Riesgo elevado de alucinación y de texto incoherente dada la perplejidad reportada.
- Dependencia de código propietario: requiere el paquete `rmsn_core`, que no se distribuye en el repo de Hugging Face según la información disponible; sin él, el checkpoint `.pt` no es cargable con herramientas estándar.
- Benchmarks no verificados: los resultados del model-index están marcados como `verified: false` y proceden únicamente del autor.
- Sin cuantizaciones oficiales ni soporte en frameworks de inferencia estándar (vLLM, llama.cpp, Ollama, TGI).
- Licencia MIT: permite uso comercial, pero la ausencia de código de inferencia empaquetado y la calidad del modelo hacen inviable su uso en producción.
- Sesgos: no documentados; al entrenarse solo con WikiText-103, hereda los sesgos de ese corpus (texto enciclopédico en inglés, principalmente Wikipedia).
- Advertencia sobre la model card: contiene afirmaciones teóricas no contrastadas de forma independiente (leyes "Wave-134", "Wave-136", "Wave-138") y referencias a un paper aún no publicado ("QC Resona..."), por lo que deben tratarse como hipótesis del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-213M-ArnoldTongue-Omega57-ODD-Base
- Dataset WikiText-103: https://huggingface.co/datasets/wikitext
- Repositorio del autor en Hugging Face: https://huggingface.co/DuoNeural
- Paper "QC Resona..." (referenciado en la model card como próximo): no disponible
- Repositorio del código `rmsn_core`: no disponible
