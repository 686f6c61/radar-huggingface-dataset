# DuoNeural/RMSN-279M-Omega45-EVEN-KAM-Multistability

## Resumen

RMSN-279M Omega45-EVEN-KAM-Multistability es un repositorio de DuoNeural Research que contiene 11 semillas entrenadas del modelo RMSN-279M, un modelo de lenguaje recurrente basado en una formulacion port-hamiltoniana (Recurrent Momentum Soliton Network). El modelo tiene 279 millones de parametros, dimension oculta D=1024, profundidad L=20 y un ancho de momento M_w=64, lo que da una relacion Omega = D/(M_w x L) = 4/5, descrita por los autores como una resonancia de lengua de Arnold con paridad EVEN. El entrenamiento se realizo sobre WikiText-103 durante 100.000 pasos con batch de 4, longitud de secuencia 512 y vocabulario de 49.152 tokens.

El interes del repositorio no es tanto el modelo en si como la tesis que ilustra: la "multistabilidad topologica". Segun los autores, distintas semillas aleatorias con hiperparametros identicos convergen a topologias de solitones irreversibles distintas, con perplejidades de validacion que van de 42,5 a 67,92. La semilla s10 alcanza la mejor perplejidad (42,5) y la s1 presenta la denominada topologia KAM Doublet (49,8). El 82% de las semillas (9 de 11) caen en lo que los autores llaman "cementacion topologica", con una penalizacion de aproximadamente 90 puntos de perplejidad.

Es relevante ahora como artefacto de investigacion sobre dinamica de entrenamiento y sensibilidad a la semilla, no como modelo listo para produccion: el repositorio solo distribuye state dicts de PyTorch, no incluye codigo de inferencia y no declara pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Recurrent Momentum Soliton Network), RNN port-hamiltoniano |
| Parametros totales | 279M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en .pt) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (.pt) |
| Dimension oculta (D) | 1024 |
| Profundidad (L) | 20 |
| Ancho de momento (M_w) | 64 |
| Relacion Omega | 4/5 (resonancia de Arnold, q=5, p=4, EVEN) |
| Vocabulario | 49.152 tokens |
| Dataset de entrenamiento | WikiText-103 |
| Pasos de entrenamiento | 100.000 |
| Batch / seq_len | 4 / 512 |
| Tamano del repo | 10,1 GB (11 checkpoints) |

## Arquitectura y entrenamiento

El modelo es un RNN port-hamiltoniano denominado Recurrent Momentum Soliton Network. La formulacion port-hamiltoniana implica que la dinamica del estado se describe mediante un sistema que conserva o disipa energia de forma estructurada, con una variable de momento de ancho M_w=64 que se propaga a traves de 20 capas. La relacion Omega = D/(M_w x L) = 4/5 se interpreta como una resonancia de lengua de Arnold de orden bajo (q=5, p=4), y los autores sostienen que cuanto menor es el orden racional de Omega, mas probable es una cascada topologica, con un ancho proporcional a 1/q^2.

El entrenamiento se realizo exclusivamente sobre WikiText-103 durante 100.000 pasos, sin que la model card mencione fases de RLHF, DPO ni SFT (de hecho, afirma que las topologias congeladas no pueden modificarse mediante SFT). No se especifica el numero total de tokens procesados mas alla de lo implicito en pasos x batch x seq_len, ni la composicion detallada del dataset. La innovacion tecnica destacable no es de inferencia (no se mencionan decodificacion especulativa ni atencion lineal) sino de analisis: la identificacion de "fases topologicas" ligadas a la semilla, con conceptos propios como cementacion topologica (M_eff >= 3), persistencia de vacios y plasticizacion KAM.

## Capacidades

- Generacion de texto autorregresiva en ingles, limitada al dominio y vocabulario de WikiText-103.
- Modelado de lenguaje de siguiente token; la metrica reportada es perplejidad de validacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingue: no; solo ingles.
- No se documenta modo thinking, vision ni audio.
- Capacidad especial: el repositorio expone variantes con topologias de solitones distintas (KAM Doublet, CEMENT, Record), cuyo comportamiento puede compararse entre semillas.

## Casos de uso

- Investigacion sobre sensibilidad a la semilla: comparar los 11 checkpoints con hiperparametros identicos para estudiar como la inicializacion aleatoria determina la topologia final y la perplejidad, usando las perplejidades reportadas (42,5 a 67,92) como referencia.
- Estudio de dinamica de sistemas port-hamiltonianos en NLP: reproducir la relacion Omega=4/5 y analizar la formacion de solitones y lenguas de Arnold en un RNN de 279M, partiendo de los state dicts y del codigo de entrenamiento del repositorio GitHub.
- Analisis de "cementacion topologica": verificar la afirmacion de que el 82% de las semillas convergen a topologias irreversibles y medir la penalizacion de perplejidad asociada.
- Benchmark de modelos recurrentes pequenos: usar el mejor checkpoint (s10, PPL 42,5) como linea base de un RNN de 279M sobre WikiText-103 frente a transformers del mismo orden de parametros.
- Docencia y divulgacion: ilustrar conceptos de sistemas dinamicos (KAM, resonancia de Arnold, atractores topologicos) con un modelo de lenguaje real y checkpoints publicos.
- Reproducibilidad de artefactos: auditar que los pesos distribuidos corresponden a los resultados declarados, dado que el repositorio incluye los 11 ficheros y metadatos de paso de entrenamiento.

## Benchmarks y rendimiento

Los unicos datos publicados son perplejidades de validacion sobre WikiText-103 para cada semilla:

| Semilla | Fichero | Val PPL | Topologia |
|---|---|---|---|
| s1 | rmsn_best_s1.pt | 49,8 | #29 KAM Doublet (M_eff=1, [L16+L17]) |
| s2 | rmsn_best_s2.pt | 67,92 | #36 CEMENT (M_eff=4) |
| s4 | rmsn_best_s4.pt | 58,71 | #40 CEMENT (M_eff=4) |
| s6 | rmsn_best_s6.pt | 57,32 | #48 CEMENT (M_eff=4) |
| s9 | rmsn_best_s9.pt | 59,9 | #59 CEMENT (M_eff=4) |
| s10 | rmsn_best_s10.pt | 42,5 | #62 Record ([L1,L2,L5,L9,L11,L12,L13]) |
| s14 | rmsn_best_s14.pt | 58,31 | #66 CEMENT (M_eff=4) |
| s17 | rmsn_best_s17.pt | 59,57 | #67 CEMENT (M_eff=4) |
| s18 | rmsn_best_s18.pt | 60,98 | #68 CEMENT (M_eff=5) |
| s21 | rmsn_best_s21.pt | 60,5 | CEMENT (M_eff=3, [L1,L14-L17,L19]) |
| s22 | rmsn_best_s22.pt | 59,6 | CEMENT (M_eff=4, [L1,L5,L15-L17,L19]) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. La semilla s7 fue excluida por corrupcion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 279M parametros en fp32, aproximadamente 1,1 GB de pesos mas estados de activacion y momento; en fp16, alrededor de 0,56 GB de pesos. El state dict completo del repositorio ocupa 10,1 GB porque incluye 11 checkpoints.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia alojar un checkpoint en fp16 o fp32; para entrenamiento o comparacion simultanea de varias semillas se recomienda A100 o H100.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, ya que el formato es un state dict de PyTorch y requiere el codigo de entrenamiento de DuoNeural para reconstruir el modelo. El despliegue implicaria cargar los pesos con `torch.load` y ejecutar el forward del RMSN en un script propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RMSN-279M (este) | 279M | 512 | Apache 2.0 | .pt | RNN port-hamiltoniano, PPL 42,5-67,92 en WikiText-103 |
| GPT-2 small | 124M | 1024 | MIT | safetensors, .bin | Transformer, ampliamente soportado en frameworks |
| GPT-2 medium | 355M | 1024 | MIT | safetensors, .bin | Transformer, comparable en orden de parametros |
| no disponible | - | - | - | - | No hay comparaciones publicadas por el autor con otros modelos |

La comparacion con GPT-2 es puramente estructural (orden de parametros y naturaleza de modelado de lenguaje); no se dispone de resultados de benchmarks comunes para establecer una comparacion de rendimiento fiable.

## Limitaciones y advertencias

- Solo ingles y entrenado exclusivamente sobre WikiText-103: el dominio y el vocabulario estan muy acotados; el rendimiento fuera de ese corpus sera previsiblemente pobre.
- Contexto de 512 tokens, insuficiente para la mayoria de aplicaciones de produccion actuales.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinacion; el riesgo existe pero no esta cuantificado.
- La model card presenta afirmaciones no convencionales (topologia irreversible, penalizacion de ~90 PPL, leyes fisicas del entrenamiento) que no vienen acompanadas de resultados de benchmarks estandar ni de revision por pares en la informacion disponible.
- El repositorio no incluye codigo de inferencia ni pipeline declarado: la reconstruccion del modelo depende del codigo de entrenamiento externo de DuoNeural, lo que complica la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion de calidad y de soporte de frameworks hace desaconsejable su uso en produccion.
- El checkpoint s7 esta corrupto y excluido; el resto de checkpoints presentan una dispersion de perplejidad muy alta, lo que refleja una gran varianza entre semillas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-279M-Omega45-EVEN-KAM-Multistability
- GitHub: https://github.com/DuoNeural/RMSN
- Citacion: DuoNeural Research Team, "Topological Multistability in Port-Hamiltonian Recurrent Language Models", 2026 (URL del repositorio HF)
- Dataset: WikiText-103 (referenciado en la model card)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
