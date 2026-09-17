# CharlieChen/loop-untied-2-d8

## Resumen

loop-untied-2-d8 es un modelo de lenguaje base (sin ajuste por instrucciones) publicado por el usuario CharlieChen en HuggingFace, extraído del paper "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de una variante concreta ("Untied 2") de la escalera de escalado sobre FineWeb, identificada por la coordenada de profundidad d8, que en la nomenclatura del trabajo es una coordenada de escalado y no necesariamente el número de bloques Transformer ejecutados.

El checkpoint almacena 244.318.208 parámetros en FP32 (0,977 GB) y emplea un Transformer personalizado denominado `TransformerGPT` con ancho 1024, 8 cabezas de atención, vocabulario GPT-2 de 50.257 tokens (ampliado a 50.304 filas en el modelo) y una longitud de contexto de 2.048 tokens. La característica distintiva es su naturaleza "looped": el núcleo del modelo se repite, con 2 repeticiones configuradas y 2 repeticiones en la evaluación final.

Su relevancia es fundamentalmente de investigación: sirve como artefacto reproducible de un estudio empírico sobre cómo el crecimiento de modelo, la recursión y los operadores de frontera afectan a los exponentes de escalado. No es un modelo orientado a producto, no tiene ajuste por instrucciones, solo soporta inglés y se distribuye en formato PyTorch original, lo que exige usar el repositorio de código del paper para cargarlo y evaluarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer personalizado (`TransformerGPT`) con repeticiones de nucleo (looped transformer), variante "untied"; modo de profundidad `dep`; 2 repeticiones de nucleo configuradas |
| Parametros totales | 244.318.208 (almacenados en FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint original en FP32; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`final.pt`); no es un checkpoint compatible con `AutoModel` de Transformers |
| Ancho (hidden size) | 1.024 |
| Cabezas de atencion | 8 |
| Tokenizador | GPT-2 (`tiktoken.get_encoding("gpt2")`) |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas en el modelo |
| Corpus de entrenamiento | FineWeb (`HuggingFaceFW/fineweb`) |
| NLL de validacion en preentrenamiento | 3,190407 nats/token |
| Ajuste por instrucciones | no (modelo base) |
| Estado del optimizador | no incluido (no permite reanudar entrenamiento) |
| Tamano del repositorio | 1,0 GB |
| Ficheros incluidos | `final.pt`, `result.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura es un Transformer autoregresivo personalizado construido por el código del paper, con ancho 1024 y 8 cabezas de atención. Su rasgo principal es la recursión: el núcleo del modelo se ejecuta varias veces (2 repeticiones configuradas y 2 en la evaluación final), lo que permite aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros. La etiqueta "untied" del nombre apunta a que las repeticiones no comparten pesos entre sí, aunque la model card no lo detalla explícitamente. El modo de profundidad es `dep`, y la coordenada d8 actúa como coordenada de escalado dentro de la escalera experimental, no como recuento directo de bloques ejecutados.

El entrenamiento se realizó sobre el corpus FineWeb con el tokenizador GPT-2, exclusivamente en inglés. Se trata de un preentrenamiento puro: no hay evidencia de RLHF, DPO ni ajuste por instrucciones, y el repositorio no conserva el estado del optimizador, por lo que no es reanudable. La métrica publicada es la NLL de validación sobre el propio corpus de preentrenamiento (3,190407 nats/token), que el autor distingue explícitamente de la NLL de respuestas del benchmark CORE. El paper utilizó GPU H100, FlashAttention-3 y autocast en bfloat16, y la evaluación se apoya en un código propio en lugar de en la librería Transformers.

## Capacidades

- Generacion de texto autoregresiva en ingles, sin ajuste por instrucciones: funciona como modelo de continuacion de texto y requiere ejemplos few-shot para tareas concretas.
- Modelado de lenguaje y estimacion de probabilidad: permite calcular perplejidad y NLL sobre corpus en ingles, que es la metrica principal reportada por el autor.
- Razonamiento y conocimiento general de nivel basico, limitado por sus 244 millones de parametros y su corpus de preentrenamiento.
- Capacidad multilingue: no disponible (el modelo esta etiquetado unicamente como ingles).
- Soporte de tool calling / function calling: no disponible (es un modelo base sin plantilla de chat ni entrenamiento de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible en el artefacto publicado tal cual.
- Capacidades especiales: recursión de núcleo con pesos no ligados ("untied"), que permite estudiar el efecto de la profundidad efectiva frente al número de parámetros.
- Evaluacion CORE: el codigo del paper soporta 22 tareas con semillas 0, 1 y 2, aunque la model card solo publica una evaluacion de humo ("smoke") con `--max-per-task 10` como ejemplo.

## Casos de uso

- Reproduccion de experimentos de escalado: el checkpoint es el artefacto final exacto de la escalera de FineWeb del paper, por lo que permite replicar las mediciones de NLL y contrastarlas con otras coordenadas de profundidad de la misma escalera.
- Investigacion sobre arquitecturas recursivas: comparar esta variante "untied" con 2 repeticiones frente a variantes con pesos ligados o sin recursion a igualdad de parametros, aislando el efecto de la recursion en el exponente de escalado.
- Punto de partida para ajuste supervisado (SFT): al ser un modelo base en ingles, se puede afinar con datos etiquetados para tareas de clasificacion, extraccion o resumen antes de desplegarlo en un dominio concreto.
- Medicion de perplejidad y filtrado de corpus: utilizar la NLL del modelo como criterio para detectar texto anomalo, duplicado o de baja calidad en conjuntos de datos en ingles de hasta 2.048 tokens por muestra.
- Generacion de texto de dominio restringido tras ajuste: con un fine-tuning sobre un corpus especializado cabe esperar salidas coherentes en registros muy delimitados, siempre dentro del limite de contexto de 2.048 tokens.
- Validacion de metodologia de evaluacion: sirve como banco de pruebas para verificar que una implementacion del benchmark CORE reproduce los valores del paper con las 22 tareas y las semillas 0, 1 y 2.
- Docencia y experimentacion de bajo coste: con menos de 1 GB de pesos en FP32 cabe en cualquier GPU moderna, lo que lo hace util para practicas de ajuste fino y analisis de atencion sin infraestructura dedicada.
- Estudio de tokenizacion: su vocabulario GPT-2 ampliado de 50.257 a 50.304 filas permite analizar el impacto del relleno de vocabulario en los parametros efectivos del modelo.

## Benchmarks y rendimiento

La model card solo publica una metrica de preentrenamiento. No se han facilitado resultados completos de MMLU, HumanEval, GSM8K ni del conjunto CORE de 22 tareas en la informacion disponible.

| Metrica | Valor | Conjunto | Notas |
|---|---|---|---|
| NLL de validacion (preentrenamiento) | 3,190407 nats/token | FineWeb | Medida sobre el corpus de preentrenamiento |
| NLL de respuestas CORE | no disponible | CORE (22 tareas) | La model card indica que la NLL CORE es distinta de la NLL de preentrenamiento y no publica el valor |
| Repeticiones en evaluacion final | 2 | - | Coincide con las repeticiones de nucleo configuradas |

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 1 GB solo para los pesos (0,977 GB), mas activaciones y cache KV, por lo que basta con GPUs de 4-8 GB.
- VRAM en bfloat16 o FP16: en torno a 0,5 GB de pesos, aunque el autor no publica una receta de conversion a media precision.
- GPU recomendadas: cualquier GPU NVIDIA moderna con al menos 4 GB de VRAM; el paper utilizo H100 por motivos de entrenamiento, no de inferencia. Una RTX 3060, RTX 4060 o superior es suficiente; una RTX 4090 o A100 resultan sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: no disponible para vLLM, TGI, llama.cpp u Ollama, ya que el artefacto no es un checkpoint de `AutoModel` ni un GGUF. El unico camino documentado es el repositorio `cue-engineering/loop`, que reconstruye el modelo y carga `final.pt` junto con `result.json`.
- Latencia y throughput estimados: no disponible (el autor no publica medidas de latencia ni de tokens por segundo).
- Requisitos de entrenamiento o ajuste: el autor no documenta requisitos, pero por tamano el ajuste fino completo cabe en una GPU de consumo con precision mixta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| loop-untied-2-d8 | 244.318.208 | 2.048 | no disponible | PyTorch (`final.pt`), no compatible con Transformers | Nucleo repetido 2 veces con pesos no ligados; solo ingles; requiere codigo propio |
| GPT-2 (small) | 124 millones | 1.024 | MIT modificada de OpenAI | PyTorch y safetensors, compatible con Transformers | Mismo tokenizador y mismo vocabulario base; arquitectura Transformer estandar sin recursion |
| Pythia-160M | 162 millones | 2.048 | Apache 2.0 | PyTorch y safetensors, compatible con Transformers | Modelo base en ingles de EleutherAI entrenado sobre The Pile, con escalera de tamano y checkpoints intermedios |

La comparacion de rendimiento entre estas alternativas no es directa: la NLL de loop-untied-2-d8 esta medida sobre FineWeb y la de GPT-2 y Pythia sobre corpus distintos, por lo que no se dispone de una tabla de benchmarks comun en la informacion proporcionada. La diferencia practica mas relevante es de disponibilidad: GPT-2 y Pythia-160M se cargan con `AutoModel` y disponen de cuantizaciones comunitarias, mientras que loop-untied-2-d8 exige el codigo del paper y no ofrece formatos alternativos.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes ni mantiene formato de chat; usarlo como asistente directo producira salidas pobres.
- Idioma unico: solo ingles. Cualquier uso en castellano queda fuera de su distribucion de entrenamiento y dara resultados degradados.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia no disponible: no se puede confirmar que el uso comercial este permitido, lo que supone un riesgo legal para produccion.
- Sesgos y toxicidad: el corpus FineWeb es texto web sin filtrado especifico documentado, por lo que es esperable que reproduzca sesgos presentes en la web.
- Riesgo de alucinacion: al ser un modelo de 244 millones de parametros preentrenado sin alineamiento, la generacion de hechos inventados es alta.
- Sin estado del optimizador: no se puede reanudar el entrenamiento original ni continuar la escalera desde este punto sin reiniciar.
- Integracion costosa: al no ser un `AutoModel` de Transformers, no funciona con herramientas estandar de despliegue (vLLM, TGI, llama.cpp, Ollama) sin trabajo de conversion previo.
- Ausencia de cuantizaciones publicadas: no hay GGUF ni formatos de 4 u 8 bits, lo que obliga a generarlas por cuenta propia.
- Evaluacion incompleta: solo se publica la NLL de preentrenamiento; no hay resultados de CORE, MMLU ni de tareas de codigo o matematicas, y los ejemplos de evaluacion con `--max-per-task 10` son pruebas de humo, no resultados del paper.
- Trazabilidad: la model card recomienda verificar el checkpoint con `SHA256SUMS`, algo que conviene hacer antes de reproducir cualquier resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-untied-2-d8
- Repositorio de codigo del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Paper de referencia: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (enlace no disponible en la informacion proporcionada)
- Enlaces adicionales: no disponible (los resultados de la busqueda web no contienen informacion relacionada con el modelo)
