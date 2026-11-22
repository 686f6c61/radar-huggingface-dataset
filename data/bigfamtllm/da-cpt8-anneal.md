# BigFamTLLM/da-cpt8-anneal

## Resumen

da-cpt8-anneal es un modelo de lenguaje de 2.115.305.088 parametros (~2,12B) desarrollado por BigFamTLLM, un equipo de estudiantes del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base (no ajustado a instrucciones) especializado en noruego, derivado de un modelo entrenado originalmente en danes (da-base) al que se le ha sustituido el tokenizador por uno noruego de 32.000 tokens y se ha sometido a preentrenamiento continuado sobre texto noruego.

El modelo emplea la arquitectura Qwen3 (transformer denso de 36 capas, hidden size 2176, 34 cabezas de atencion con 17 cabezas KV y embeddings atados) y una ventana de contexto de 4096 tokens. Esta ficha corresponde al checkpoint 8 de 10 del proceso de preentrenamiento continuado, tras 38.880 de 48.600 pasos, y ademas es la version "annealed": 916 pasos adicionales (0,48B tokens) sobre texto de alta calidad en bokmal y nynorsk con decaimiento lineal de la tasa de aprendizaje hasta cero.

Su relevancia es fundamentalmente academica y comparativa: forma parte de un estudio controlado de 50 modelos que entrena desde cero modelos en noruego, danes y multilingues con la misma arquitectura y presupuesto para medir el efecto de la adaptacion cross-lingue y del annealing. No es un modelo de produccion ni esta pensado para ello, y su rendimiento absoluto en las tareas evaluadas es bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atencion, 17 cabezas KV, embeddings atados) |
| Parametros totales | 2.115.305.088 (~2,12B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | noruego (bokmal y nynorsk); etiquetado tambien como da, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers 4.x) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuracion densa: 36 capas con hidden size de 2176, 34 cabezas de atencion y 17 cabezas KV (GQA con ratio 2:1), y embeddings atados entre la capa de entrada y la de salida. El entrenamiento se realizo con Megatron-LM sobre 8 GPU GH200 en el cluster Olivia de Sigma2, con longitud de secuencia 4096, tamano de batch 128, optimizador AdamW y tasa de aprendizaje maxima de 5e-4 con 2000 pasos de warmup y sin decaimiento (1e-4 en la fase de solo embeddings).

El proceso parte de da-base, un modelo entrenado desde cero en danes. Sobre el se sustituyo el tokenizador por uno noruego de 32.000 tokens: los tokens compartidos por ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo. A continuacion se aplicaron 1000 pasos de entrenamiento de solo embeddings y despues preentrenamiento continuado sobre noruego, acumulando 21,39B tokens vistos. Los datos proceden de HPLT 4.0, con una mezcla noruega del 85% bokmal y 15% nynorsk. La fase de annealing anade 916 pasos (0,48B tokens) sobre texto de alta calidad en bokmal y nynorsk con decaimiento lineal de la tasa de aprendizaje hasta cero. La conversion a formato Hugging Face se realizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue en transformers 4.x.

## Capacidades

- Generacion de texto autoregresiva en noruego (bokmal y nynorsk), como modelo base sin ajuste a instrucciones.
- Continuacion de texto y modelado del lenguaje: completa secuencias a partir de un prefijo.
- Capacidad limitada de comprension lectora y conocimiento del mundo en noruego, segun los resultados de NorEval.
- Cierta robustez ante ruido en la entrada (variacion media de -0,043 en tres tareas de NorEval con versiones ruidosas).
- Soporte de tool calling / function calling: no disponible (modelo base no ajustado).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base no ajustado).
- Capacidades multilingues: limitadas al par danes-noruego por herencia del modelo de partida; no hay evidencia publicada de rendimiento en otras lenguas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre adaptacion cross-lingue: el modelo sirve para estudiar como un modelo entrenado en danes transfiere conocimiento al noruego mediante sustitucion de tokenizador y preentrenamiento continuado, comparando con los otros checkpoints de la serie.
- Evaluacion comparativa de annealing: al existir la version no annealed (da-cpt8), permite aislar el efecto de 916 pasos de alta calidad con decaimiento de learning rate sobre el rendimiento final en NorEval.
- Generacion de texto en noruego con propositos de analisis linguistico: continuacion de frases y parrafos en bokmal o nynorsk para estudiar la fluidez y los errores tipicos de un modelo de 2B entrenado con 21,39B tokens.
- Baseline academico en tareas de NorEval: util como referencia de un modelo pequeno especializado en noruego frente a modelos multilingues de mayor tamano en tareas de ortografia, lectura y conocimiento del mundo.
- Experimentos de robustez: la evaluacion con entradas ruidosas permite analizar la degradacion del modelo bajo perturbaciones controladas.
- Docencia y replicacion: el proyecto publica los 50 modelos de la serie con la misma arquitectura y presupuesto, lo que facilita reproducir el pipeline completo (tokenizer swap, CPT, annealing) en un entorno docente.
- Fine-tuning posterior para tareas concretas: al ser un modelo base de 2,12B con contexto de 4096 tokens, puede servir de punto de partida para ajustes supervisados en tareas noruegas especificas, siempre que se asuma su bajo rendimiento de partida.

## Benchmarks y rendimiento

Resultados publicados por el autor en NorEval 1.1:

| Grupo de tarea | Metrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,256 | 0,302 |
| nob_orthography | acc | 0,873 | 0,861 |
| nob_reading | f1 | 0,231 | 0,258 |
| nob_world | acc | 0,299 | 0,300 |
| nno_language | em_first | 0,485 | 0,587 |
| nno_world | acc | 0,303 | 0,315 |

Robustez (versiones ruidosas de tres tareas de NorEval): 0,388 en entrada limpia y -0,043 de media bajo ruido.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 2,12B parametros ocupan aproximadamente 4,2 GB de pesos, por lo que se necesitan en torno a 5-6 GB de VRAM contando cache KV y overhead. En cuantizacion de 8 bits, unos 2,5-3 GB; en 4 bits, unos 1,5-2 GB (estimaciones a partir del tamano de parametros, no publicadas por el autor).
- GPU recomendadas: el autor entreno con 8 GH200; para inferencia basta una GPU con al menos 6 GB de VRAM en bf16.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en bf16; en GPUs de 8 GB es recomendable cuantizar.
- Opciones de despliegue: transformers (soporte nativo, verificado en 4.x), text-generation-inference (el modelo esta etiquetado como compatible con endpoints y TGI), y conversiones a GGUF para llama.cpp u Ollama no estan publicadas por el autor.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt8-anneal | 2,12B | 4096 | Noruego, adaptado desde danes, base | no disponible | Hugging Face |
| BigFamTLLM/da-cpt8 | 2,12B | 4096 | Mismo modelo sin annealing | no disponible | Hugging Face |
| BigFamTLLM/no-base-anneal | no disponible en la informacion | no disponible | Noruego entrenado desde cero, misma arquitectura y presupuesto | no disponible | Hugging Face |
| BigFamTLLM/ml-base-anneal | no disponible en la informacion | no disponible | Multilingue entrenado desde cero, misma arquitectura y presupuesto | no disponible | Hugging Face |

La comparacion mas directa es con los otros modelos de la propia serie BigFamTLLM, disenados con la misma arquitectura y presupuesto para aislar el efecto del idioma de origen y del annealing. No se dispone de datos de benchmarks de esos modelos en la informacion proporcionada, por lo que no es posible cuantificar la comparacion de rendimiento. No se han identificado en la informacion disponible otros modelos externos comparables con datos verificables.

## Limitaciones y advertencias

- Es un modelo base sin ajuste a instrucciones: no sigue instrucciones de forma fiable y no debe usarse como asistente conversacional sin fine-tuning previo.
- Rendimiento absoluto bajo en las tareas evaluadas: por ejemplo, 0,231 de F1 en nob_reading 0-shot y 0,299 de accuracy en nob_world 0-shot, propios de un modelo de 2B con 21,39B tokens vistos.
- Riesgo de alucinacion y de generar contenido incorrecto u ofensivo: el propio autor advierte que son modelos de investigacion entrenados con texto web y no estan pensados para produccion.
- Limitaciones de contexto: ventana de 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitaciones de idioma: el modelo esta orientado a noruego (bokmal y nynorsk); su comportamiento en otras lenguas, incluido el danes del que parte, no esta documentado.
- Sesgos: al entrenarse sobre HPLT 4.0 (texto web), es probable que herede sesgos de la web, aunque el autor no documenta un analisis especifico de sesgos.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar si se permite el uso comercial; debe consultarse con el autor antes de cualquier uso fuera de investigacion.
- Robustez limitada: la evaluacion con ruido muestra una degradacion media de -0,043, lo que indica sensibilidad a perturbaciones en la entrada.
- Madurez: es un checkpoint intermedio (8 de 10) de un proyecto docente, con 0 descargas y 0 likes en el momento de la consulta, sin ecosistema de herramientas ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt8-anneal
- Modelo base del que deriva: https://huggingface.co/BigFamTLLM/da-cpt8
- Modelo original en danes: https://huggingface.co/BigFamTLLM/da-base
- Version sin annealing del mismo checkpoint: https://huggingface.co/BigFamTLLM/da-cpt8
- Noruego desde cero: https://huggingface.co/BigFamTLLM/no-base y https://huggingface.co/BigFamTLLM/no-base-anneal
- Multilingue desde cero: https://huggingface.co/BigFamTLLM/ml-base y https://huggingface.co/BigFamTLLM/ml-base-anneal
- Repositorio de checkpoints CPT daneses: https://huggingface.co/BigFamTLLM/da-cpt1 a https://huggingface.co/BigFamTLLM/da-cpt10
- Repositorio de checkpoints CPT multilingues: https://huggingface.co/BigFamTLLM/ml-cpt1 a https://huggingface.co/BigFamTLLM/ml-cpt10
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
