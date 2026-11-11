# davidheineman/nanogpt-ladder-v3-math-heavy-16m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 math-heavy 16M 100TPP es un modelo de lenguaje base de tipo GPT entrenado desde cero por davidheineman como parte del proyecto NanoGPT Ladder v3, una escalera de modelos de distintos tamanos y presupuestos de tokens con receta de preentrenamiento fija. Este checkpoint concreto corresponde al endpoint completado de 15.851.520 parametros tras consumir 1.585.152.000 tokens de prediccion en 48.375 pasos de optimizacion con semilla 1337. Su interes no reside en competir con modelos de gran escala, sino en servir como punto de referencia reproducible para estudiar la dinamica de escalado en mezclas de datos sesgadas hacia un dominio concreto (matematicas).

La arquitectura es un transformer decoder-only clasico estilo GPT-2: 14 capas, ancho 192, 6 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2 con vocabulario rellenado a 50.304. La longitud de contexto es de 1.024 tokens. Los pesos se distribuyen en float32 originales y el repositorio ocupa aproximadamente 0,1 GB, por lo que es un modelo pensado para experimentacion en CPU, Apple MPS o GPU consumer, no para produccion.

Es relevante ahora porque documenta de forma exhaustiva el proceso de preentrenamiento (revisiones exactas de fuentes, pesos de mezcla, hashes SHA256 en `metadata.json` y registro de evaluacion en `results.json`), lo que permite auditar y reproducir el experimento. Estos pesos preceden a cualquier fase de tiny-rl, SFT o RL, por lo que son un modelo base que solo debe usarse con prompts de texto plano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (14 capas, ancho 192, 6 cabezas, embeddings atados, RoPE) |
| Parametros totales | 15.851.520 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos float32 originales; el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, float32) con loader propio (`model.py`); no compatible con AutoModel de Transformers |
| Tokenizador | GPT-2 (tiktoken), vocabulario rellenado a 50.304 |
| Tokens de entrenamiento | 1.585.152.000 (100 TPP) |
| Pasos de optimizacion | 48.375 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (mezcla math-heavy, 80% al dominio nombrado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 14 capas, dimension de modelo 192 y 6 cabezas de atencion, con embeddings de entrada y salida atados y codificacion posicional rotatoria (RoPE). Usa el tokenizador GPT-2 de tiktoken con vocabulario rellenado hasta 50.304 entradas y una ventana de contexto de 1.024 tokens. No incorpora innovaciones como atencion lineal, decodificacion especulativa ni mezcla de expertos; es una implementacion NanoGPT estandar, lo que facilita su lectura y modificacion.

El preentrenamiento consumio 1.585.152.000 tokens de prediccion (100 tokens por parametro, TPP) en 48.375 pasos, con semilla 1337. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino y, al ser una variante math-heavy, asigna el 80% de la mezcla al dominio de matematicas. El repositorio incluye `metadata.json` con las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, y `results.json` con el registro original de finalizacion y las evaluaciones finales. No se menciona uso de RLHF, DPO ni SFT: el checkpoint es estrictamente un modelo base previo a tiny-rl. El checkpoint contiene `model`, `config`, `identity` y `run`, pero no el estado del optimizador, por lo que sirve para inferencia y fine-tuning adicional, no para reanudar el entrenamiento de forma exacta.

## Capacidades

- Generacion de texto autoregresiva con prompts de texto plano, en modo greedy (`temperature=0`) o con muestreo.
- Modelado de lenguaje base: el checkpoint esta disenado para evaluaciones de tipo loss/BPB, no para resolver tareas directamente.
- Especializacion parcial en matematicas derivada de la mezcla math-heavy (80% del dominio nombrado), aunque sin datos publicados que cuantifiquen esa ventaja.
- Punto de partida para fine-tuning supervisado y RL posterior (fases tiny-rl no incluidas en estos pesos).
- Inferencia en CPU, CUDA o Apple MPS mediante `device=auto` en el script incluido.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Investigacion sobre escalado de mezclas de datos: permite entrenar y comparar endpoints de la NanoGPT Ladder v3 con distinta composicion (math-heavy frente a otras mezclas) manteniendo arquitectura y presupuesto de tokens constantes, aislando el efecto del dataset.
- Reproducibilidad de experimentos: los hashes SHA256 y las revisiones de fuente en `metadata.json` permiten reconstruir el corpus exacto y verificar que una replicacion usa los mismos datos.
- Fine-tuning educativo y docente: con 15,8 M de parametros y 0,1 GB de pesos, se puede ajustar en un portatil o en una GPU consumer para ilustrar el ciclo completo de SFT sobre un modelo base.
- Estudio de dinamica de entrenamiento: los 48.375 pasos y la semilla fija permiten analizar curvas de perdida y comportamiento de optimizacion en regimenes de 100 TPP.
- Pruebas de infraestructura de inferencia: sirve como modelo de humo para validar pipelines de carga de checkpoints PyTorch nativos, scripts de generacion y despliegue en CPU/MPS antes de escalar a modelos mayores.
- Generacion de texto de bajo coste en entornos con recursos muy limitados: prototipos de completado de texto o demos donde la calidad linguistica no es critica y prima el coste computacional casi nulo.
- Evaluacion de tecnicas de cuantizacion o compresion: al publicarse pesos float32 originales, es un banco de pruebas controlado para medir el impacto de cuantizar un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones finales de BPB y loss son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas, y que `results.json` contiene el registro de evaluacion, pero no se proporcionan los valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en float32 ocupa aproximadamente 63 MB (15,85 M parametros x 4 bytes); con overhead de activaciones y contexto de 1.024 tokens, el consumo es de unos pocos cientos de MB, holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo es trivial para una RTX 4090, una RTX 3060 o incluso una GPU integrada. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con CUDA, asi como en Apple Silicon via MPS y en CPU.
- Opciones de despliegue: el autor proporciona `model.py` y `generate.py` con carga nativa PyTorch; no es compatible con vLLM, TGI, llama.cpp u Ollama sin conversion previa, ya que usa un loader propio y no el formato de Transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 math-heavy 16M 100TPP | 15,85 M | 1.024 | 1.585 M (100 TPP) | no disponible | Hugging Face (repo propio, 0 descargas) |
| GPT-2 small (referencia arquitectonica) | 124 M | 1.024 | no disponible en la informacion | MIT (segun el release original de OpenAI) | Amplia, integrado en Transformers |
| Otros endpoints de NanoGPT Ladder v3 | distinto tamano y mezcla | 1.024 (segun la receta descrita) | variable por endpoint | no disponible | Coleccion publica del mismo autor |

La comparacion con GPT-2 small es puramente arquitectonica: comparten familia (decoder-only, tokenizador GPT-2, contexto de 1.024), pero el modelo de este ficha es unas ocho veces menor en parametros. No se dispone de datos de rendimiento comparativos entre endpoints de la escalera ni frente a alternativas de tamano similar, por lo que no es posible establecer una comparativa de calidad.

## Limitaciones y advertencias

- Es un modelo base sin SFT ni RL: no sigue instrucciones y puede producir texto incoherente o repetitivo; debe usarse con prompts de texto plano.
- Riesgo alto de alucinacion y de contenido factualmente incorrecto, inherente a un modelo de 15,8 M de parametros entrenado con 1.585 M de tokens.
- Ventana de contexto muy corta (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el tokenizador GPT-2 y la mezcla Dolma3 sugieren predominio del ingles, pero no hay confirmacion.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sesgos desconocidos: no se publica analisis de sesgos ni filtrado del corpus mas alla de la receta Dolma3 Dolmino.
- Pesos en float32 sin variantes cuantizadas oficiales; cualquier cuantizacion corre por cuenta del usuario y puede degradar aun mas la calidad.
- No compatible con el ecosistema Transformers, vLLM, TGI ni llama.cpp sin trabajo de conversion; requiere el loader propio incluido en el repositorio.
- El checkpoint no incluye estado del optimizador, por lo que no permite reanudar el preentrenamiento de forma exacta.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-math-heavy-16m-100tpp-seed-1337
- Coleccion de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de preentrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
