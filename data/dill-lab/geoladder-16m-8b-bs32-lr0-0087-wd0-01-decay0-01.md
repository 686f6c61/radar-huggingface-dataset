# dill-lab/GeoLadder-16M-8B-bs32-lr0.0087-wd0.01-decay0.01

## Resumen

GeoLadder-16M-8B-bs32-lr0.0087-wd0.01-decay0.01 es un checkpoint de investigación publicado por el grupo dill-lab (Atharva Kulkarni, Jacob Mitchell Springer, Arjun Subramonian y Swabha Swayamdipta) como parte del conjunto GeoLadder, compuesto por 108 modelos de estilo OLMo de entre 4M y 75M parámetros. El modelo concreto que nos ocupa tiene 16M de parámetros y fue entrenado sobre 8.000 millones de tokens del Pile deduplicado (EleutherAI/the_pile_deduplicated) con un lote de 32 secuencias de 2048 tokens, una tasa de aprendizaje máxima de 0,0087, weight decay de 0,01 y un decaimiento coseno con LR final igual al 1 % del pico.

No se trata de un modelo orientado a producto ni a instrucciones, sino de una pieza de un experimento controlado recogido en el artículo «Disentangling Geometry, Performance, and Training in Language Models» (ICML 2026, PMLR 306, arXiv:2602.20433). El trabajo investiga si la geometría de la matriz de *unembedding* (en particular su rango efectivo) permite estimar el rendimiento posterior del modelo, y concluye que la relación es inconsistente: el rango efectivo alto suele acompañar a los mejores modelos, pero no siempre, y el rango bajo coexiste con la degradación tardía en lugar de causarla. Las decisiones de preentrenamiento, como el tamano de lote y el weight decay, moldean fuertemente esas métricas geométricas sin que ninguna de ellas prediga de forma fiable el rendimiento.

Su relevancia es, por tanto, metodológica y de reproducibilidad: proporciona 41 checkpoints intermedios (ramas `step0` a `step122081`, con `main` apuntando al checkpoint final) que permiten estudiar dinámicas de entrenamiento, geometría interna y sensibilidad a hiperparámetros en un régimen de cómputo muy bajo. La model card no declara licencia, idiomas soportados ni resultados de benchmarks, y el repositorio ocupa 4,9 GB en total por acumular esos 41 puntos de control.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo OLMo (clase `OLMoForCausalLM` de la librería legacy `hf_olmo`) |
| Parámetros totales | 16M (según la model card; no se especifica si el recuento incluye la matriz de embeddings) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia usada en el entrenamiento; no se documenta una ventana mayor) |
| Tipos de cuantización | No disponible (solo se publican pesos en precisión completa en formato PyTorch; no hay versiones GGUF, AWQ, GPTQ ni bitsandbytes documentadas) |
| Idiomas soportados | No disponible (el corpus de entrenamiento es el Pile deduplicado, de composición mayoritariamente inglesa, pero la model card no declara idiomas) |
| Licencia | No disponible (la model card y la información de HuggingFace no especifican licencia) |
| Formato de pesos | `pytorch_model.bin` (pickle de PyTorch) por rama, más `config.json` de HuggingFace y `config.yaml` original de OLMo; no hay `safetensors` |
| Tamaño del repositorio | 4,9 GB (incluye 41 ramas de checkpoint) |
| Punto de control final | Rama `main`, equivalente a `step122081` |
| Dataset | EleutherAI/the_pile_deduplicated |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo original de AI2 en su variante densa y decoder-only, expuesta a través de la clase `OLMoForCausalLM` registrada por el paquete `hf_olmo` (dependencia `ai2-olmo`). Se trata de la arquitectura legacy de OLMo, no de `OLMo2` ni de `OLMoE`, de modo que su integración con versiones recientes de `transformers` exige instalar explícitamente ese paquete. Con 16M de parámetros y una longitud de secuencia de 2048 tokens, el coste de entrenamiento e inferencia es mínimo: 8.000 millones de tokens con lotes de 32 secuencias.

El entrenamiento se realizó sobre la versión deduplicada de The Pile. Los hiperparámetros documentados son lote de 32 secuencias de 2048 tokens, LR máximo de 0,0087, weight decay de 0,01 y un decaimiento coseno en el que la LR final (`alpha_f`) es el 1 % de la LR máxima. El nombre del repositorio codifica exactamente estos valores (tamano, tokens, batch size, LR pico, weight decay y decaimiento), lo que refleja el diseño factorial del estudio: cada uno de los 108 modelos de la colección GeoLadder varía sistemáticamente estos factores para aislar su efecto sobre métricas geométricas y de rendimiento. La model card no menciona fases de ajuste por instrucciones, RLHF, DPO ni ningún otro tipo de alineación; es un modelo base puro.

La innovación del trabajo no reside en el modelo, sino en el análisis: se estudia el rango efectivo de la matriz de *unembedding* como posible estimador del rendimiento posterior. Las conclusiones del artículo son negativas en cuanto a capacidad predictiva: el rango efectivo alto aparece a menudo en los mejores modelos, pero no de forma universal, y el rango bajo se asocia a la degradación tardía del entrenamiento sin ser su causa. Además, parámetros como el tamano de lote y el weight decay determinan fuertemente estas métricas geométricas, lo que complica su uso como señal independiente. Adicionalmente, el repositorio conserva `data-indices/` y `train_data/global_indices.npy`, que registran el orden exacto de los datos de entrenamiento, siguiendo la práctica de la suite Pythia.

## Capacidades

- Generación de texto autorregresiva básica en inglés, con calidad muy limitada por el tamano del modelo (16M de parámetros).
- Modelado de lenguaje causal: asignación de probabilidad a secuencias y cálculo de perplejidad, útil para experimentación controlada.
- Trazabilidad del entrenamiento: 41 checkpoints intermedios que permiten reproducir la curva de aprendizaje paso a paso y auditar el orden de los datos.
- Análisis de representaciones internas: acceso completo a los pesos en formato PyTorch para estudiar rangos efectivos, espectros de la matriz de *unembedding* y otras métricas geométricas.
- No dispone de soporte de *tool calling*, *function calling* ni uso como agente.
- No dispone de modo de razonamiento explícito (*thinking mode*), visión, audio ni multimodalidad.
- No se documenta capacidad multilingüe ni ajuste por instrucciones: no responde de forma fiable a prompts en formato conversacional.

## Casos de uso

- Investigación sobre geometría de representaciones: extraer la matriz de *unembedding* de cada una de las 41 ramas y calcular su rango efectivo para replicar o extender los análisis del artículo de ICML 2026.
- Estudios de dinámica de entrenamiento: comparar checkpoints intermedios (`step0`, `step42000`, `step122081`, etc.) para localizar el punto en el que aparece la degradación tardía asociada al rango bajo.
- Ablaciones controladas de hiperparámetros: al compartir arquitectura y datos con los otros 107 modelos de la colección GeoLadder, permite aislar el efecto del tamano de lote (32), del weight decay (0,01) o de la LR final (1 % del pico) sobre el rendimiento.
- Auditoría de pipelines de evaluación: por su bajo coste, sirve como modelo de humo para validar arneses de evaluación de perplejidad y de generación antes de escalar a modelos de miles de millones de parámetros.
- Pruebas de integración de infraestructura de inferencia: validar que un servidor con `transformers` y `hf_olmo` carga correctamente pesos en pickle y gestiona la API de `AutoModelForCausalLM` con `revision`.
- Docencia y formación: ilustrar de forma tangible, con 4,9 GB de artefactos reales, cómo se estructura una suite de checkpoints al estilo Pythia y cómo se versionan ramas de entrenamiento en un repositorio de HuggingFace.
- Investigación sobre orden de datos: `data-indices/` y `train_data/global_indices.npy` permiten correlacionar secuencias concretas del Pile deduplicado con cambios en las métricas internas del modelo.
- Experimentos de interpretabilidad a muy baja escala: análisis de activaciones y cabezas de atención sin necesidad de GPUs de gama alta, replicando resultados en portátiles o nodos de CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ningún otro conjunto de evaluación, y el artículo asociado se centra en métricas geométricas y de rendimiento agregado sobre la suite completa, no en tablas de benchmarks por modelo publicadas en este repositorio. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 64 MB (16M de parámetros × 4 bytes); en bf16/fp16, unos 32 MB. Con activaciones y caché KV para 2048 tokens, el consumo total se mantiene holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria sirve; no se requieren A100, H100 ni tarjetas de centro de datos. Una GTX 1050 Ti, una RTX 3060 o una RTX 4090 son igualmente válidas, y la GPU estará infrautilizada en todos los casos.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en iGPU y en CPU sin aceleración dedicada.
- Opciones de despliegue: `transformers` con el paquete `hf_olmo` (o `ai2-olmo`) instalado, cargando el modelo con `AutoModelForCausalLM.from_pretrained(..., revision="step<N>")`. No hay conversiones publicadas a GGUF para llama.cpp u Ollama, ni artefactos para vLLM o TGI; el soporte de estos servidores para la arquitectura legacy `hf_olmo` no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponible. Al margen de que un modelo de 16M de parámetros es intrínsecamente rápido en cualquier hardware moderno, no se proporcionan cifras medidas.
- Almacenamiento: 4,9 GB para el repositorio completo. Descargar una única rama reduce el espacio necesario a decenas de megabytes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Dataset | Licencia |
|---|---|---|---|---|---|
| GeoLadder-16M (este modelo) | 16M | 2048 | 8B | The Pile deduplicado | No disponible |
| Resto de la colección GeoLadder | 4M-75M (108 modelos) | 2048 | Variable (factores controlados) | The Pile deduplicado | No disponible |
| Pythia-14M | 14M | 2048 | 300B | The Pile (deduplicado) | Apache 2.0 |
| GPT-2 small | 124M | 1024 | ~40 GB de WebText | WebText | MIT modificada |
| OLMo-1B | ~1.200M | 2048 | 3T | Dolma | Apache 2.0 |

Nota: los datos de Pythia-14M, GPT-2 small y OLMo-1B proceden de su documentación pública y no forman parte de la información proporcionada en esta búsqueda; se incluyen como referencia de categoría. El comparable más directo del modelo analizado no son estas familias, sino los otros 107 modelos de la colección GeoLadder, que comparten arquitectura y datos y difieren únicamente en tamano, batch size, weight decay, LR pico, presupuesto de tokens y LR final. La principal desventaja competitiva de GeoLadder-16M frente a Pythia-14M es el presupuesto de entrenamiento: 8B tokens frente a 300B, pese a tener un tamano casi idéntico. Su ventaja es la granularidad de checkpoints (41 puntos frente a los 154 de Pythia, pero dentro de un experimento factorial con 108 configuraciones) y la publicación de los índices de datos.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación y sin ajuste por instrucciones: no debe desplegarse como asistente conversacional ni esperar de él respuestas coherentes a peticiones complejas.
- Capacidad muy limitada: 16M de parámetros y 8B tokens de entrenamiento sitúan al modelo en un régimen en el que la generación de texto libre será en gran medida incoherente fuera de contextos muy restringidos.
- Riesgo elevado de alucinación y de texto gramaticalmente plausible pero factualmente vacío, inherente a un modelo de este tamano.
- Sesgos conocidos: el corpus es The Pile deduplicado, con sesgos de dominio (texto web, académico y de código, predominantemente en inglés) y sesgos sociales heredados de esas fuentes. La model card no documenta ninguna mitigación.
- Limitación idiomática: no se declaran idiomas soportados ni se ha entrenado con un corpus multilingüe equilibrado, por lo que el rendimiento fuera del inglés será previsiblemente muy pobre.
- Ventana de contexto de 2048 tokens, corta para tareas de documento largo o conversaciones multi-turno extensas.
- Licencia no disponible: sin una licencia explícita, el uso comercial queda en una situación jurídica indeterminada. Conviene contactar con los autores antes de cualquier uso en producción.
- Formato de pesos en `pytorch_model.bin` (pickle): requiere `torch.load` y no ofrece las garantías de seguridad y mapeo de memoria de `safetensors`. No hay conversiones alternativas publicadas.
- Dependencia de la arquitectura legacy `hf_olmo`: puede fallar con versiones recientes de `transformers` y no está claro que reciba mantenimiento a largo plazo.
- Repositorio de 4,9 GB por las 41 ramas de checkpoint; conviene descargar solo la revisión necesaria para no saturar disco y cachés de CI.
- Ausencia total de benchmarks publicados: no es posible comparar su rendimiento con alternativas mediante cifras verificables.
- Cero descargas y cero «likes» en el momento de redactar esta ficha, lo que implica ausencia de validación por parte de la comunidad y de soporte práctico en caso de problemas de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-8B-bs32-lr0.0087-wd0.01-decay0.01
- Colección GeoLadder (108 modelos): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Artículo en PMLR (ICML 2026, volumen 306, páginas 61454-61482): https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Discusión en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Librería necesaria para cargar los pesos (`hf_olmo` / `ai2-olmo`): no se incluye enlace en la información proporcionada
