# davidheineman/nanogpt-ladder-v3-web-heavy-64m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · web-heavy · 64M · 30 TPP es un modelo base de lenguaje de pequeno tamano (63,5 millones de parametros) entrenado desde cero por el investigador davidheineman dentro de una serie experimental denominada NanoGPT Ladder v3. No es un modelo de proposito general para produccion, sino un punto de control de preentrenamiento completo pensado para estudiar el efecto de la mezcla de datos y del presupuesto de tokens en modelos tipo GPT a escala reducida. Cada presupuesto de tokens de la escalera corresponde a un entrenamiento independiente con la misma receta, lo que permite comparaciones controladas entre runs.

El modelo sigue una arquitectura transformer decoder-only clasica de estilo GPT-2, con 12 capas, anchura 512, 8 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2, sobre un contexto de 1.024 tokens. Se ha entrenado con 1.905.131.520 tokens de prediccion (30 tokens por parametro, TPP) durante 58.140 pasos de optimizador, con semilla 1337, usando la mezcla "web-heavy" del pool Dolma3 Dolmino de AllenAI, que asigna un 80% del peso al dominio nombrado.

Su relevancia es metodologica: ofrece pesos originales en float32, metadatos de mezcla y revisiones exactas, y un registro de evaluacion (BPB/loss) para reproducir experimentos de scaling y de composicion de datos. Los pesos son previos a cualquier etapa de SFT, RL o condicionamiento tiny-rl, por lo que solo deben usarse con prompts de texto plano y como base para fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (12 capas, width 512, 8 cabezas, embeddings atados, RoPE) |
| Parametros totales | 63.504.384 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente ingles en los datos) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt` con claves `model`, `config`, `identity`, `run`) |
| Vocabulario | 50.304 (GPT-2 con padding) |
| Tokens de entrenamiento | 1.905.131.520 (30 TPP) |
| Pasos de optimizador | 58.140 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (mezcla web-heavy, 80% dominio nombrado) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con pre-normalizacion, 12 bloques, dimension de modelo 512 y 8 cabezas de atencion (64 dimensiones por cabeza), embeddings de entrada y de salida atados y codificacion posicional rotatoria (RoPE). Usa el tokenizador GPT-2 de tiktoken con vocabulario ampliado por padding hasta 50.304 entradas. El contexto maximo es de 1.024 tokens, coherente con la configuracion clasica de NanoGPT.

El entrenamiento consistio en un preentrenamiento de lenguaje autorregresivo sobre la mezcla "web-heavy" del pool Dolma3 Dolmino, siguiendo una receta congelada: el 80% de la mezcla se asigna al dominio nombrado y el resto se reparte entre las demas fuentes del pool. Se procesaron 1.905.131.520 tokens de prediccion en 58.140 pasos de optimizador con semilla 1337. No se aplico SFT, RLHF ni DPO: los pesos publicados son el punto final del preentrenamiento puro. El repositorio incluye `metadata.json` con las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, y `results.json` con el registro de finalizacion y las evaluaciones finales. No se incluye el estado del optimizador, por lo que el checkpoint sirve para inferencia y para fine-tuning desde cero del estado del optimizador.

## Capacidades

- Generacion de texto autorregresiva basica a partir de prompts de texto plano, con decodificacion greedy (`temperature=0`) o por muestreo.
- Modelado de lenguaje y calculo de perplejidad/BPB sobre texto, util para evaluacion de mezclas de datos.
- Completado de texto y continuacion de secuencias cortas dentro de una ventana de 1.024 tokens.
- Punto de partida para fine-tuning supervisado en tareas downstream de dominio especifico.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenado.
- No dispone de modo "thinking", vision, audio ni multimodalidad.
- Capacidad multilingue no documentada; el tokenizador GPT-2 y la mezcla web predominante en ingles limitan el rendimiento fuera del ingles.
- No es un modelo instruct; no sigue instrucciones de forma fiable sin ajuste posterior.

## Casos de uso

- Investigacion sobre mezclas de datos: comparar este run "web-heavy" con otros brazos de la escalera NanoGPT Ladder v3 para aislar el efecto de la composicion del corpus en la perdida de validacion, manteniendo constantes arquitectura, semilla y presupuesto de tokens.
- Reproduccion de experimentos de scaling: el registro de 30 TPP, 58.140 pasos y semilla 1337 permite replicar el entrenamiento y verificar la curva de BPB frente a runs con otros presupuestos de tokens.
- Baseline de referencia en articulos y cursos: servir como modelo pequeno y rapido de entrenar para comparar tecnicas de tokenizacion, RoPE o embeddings atados sin incurrir en costes de GPU a gran escala.
- Fine-tuning de dominio con recursos limitados: al ser un checkpoint de 63,5 M de parametros en float32 (unos 0,25 GB), se puede ajustar en una unica GPU consumer para tareas de clasificacion o generacion acotada.
- Generacion de texto de bajo coste en prototipos: completar frases o parrafos cortos en demos y pruebas de integracion donde no se requiere calidad de produccion.
- Estudio de sesgos y comportamientos emergentes a escala reducida: analizar que patrones linguisticos aprende un modelo de 64 M con una mezcla web-heavy antes de cualquier alineamiento.
- Docencia y divulgacion: ilustrar el pipeline completo de preentrenamiento (tokenizador, mezcla de datos, checkpoint, evaluacion) con un modelo que cabe en CPU o en MPS de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones finales de BPB y loss son evaluaciones de modelado de lenguaje y no precisiones de resolucion de tareas, y remite a `results.json` para los valores concretos, que no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,25 GB para los pesos, mas activaciones y cache KV; en la practica cabe en cualquier GPU con 1 GB o mas.
- En cuantizacion int8 o int4 el modelo ocuparia del orden de 60-130 MB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, Apple MPS y cualquier GPU CUDA moderna (RTX 3060, RTX 4090, A100, H100). El script incluido selecciona CUDA, MPS o CPU con `device=auto`.
- Cabe holgadamente en GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: el repositorio incluye `model.py` y `generate.py` con un cargador propio en PyTorch; no es compatible con `transformers.AutoModel` sin adaptacion. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 web-heavy 64M 30TPP | 63,5 M | 1.024 | no disponible | Hugging Face (repo propio) | Checkpoint de investigacion, sin SFT |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT | Hugging Face, transformers | Referencia clasica, ampliamente soportado |
| Pythia-70M (EleutherAI) | 70 M | 2.048 | Apache 2.0 | Hugging Face, transformers | Suite de scaling con checkpoints intermedios |
| SmolLM-135M (Hugging Face) | 135 M | 2.048 | Apache 2.0 | Hugging Face, transformers | Entrenado con receta moderna y datos filtrados |

La comparacion es orientativa: este modelo es un artefacto de investigacion con cargador propio y sin licencia declarada, mientras que las alternativas son modelos con soporte estandar en transformers y licencias permisivas. No se dispone de datos de rendimiento comparables para establecer diferencias de calidad.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones ni mantiene formato conversacional; puede producir texto incoherente o repetitivo.
- Ventana de contexto muy corta (1.024 tokens), insuficiente para documentos largos o dialogos multi-turno extensos.
- Riesgo elevado de alucinacion y de afirmaciones factualmente incorrectas por su tamano y por el predominio de datos web sin filtrar.
- Sesgos inheritos del corpus web-heavy de Dolma3 Dolmino, no evaluados ni mitigados en la model card.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados; el tokenizador GPT-2 y la mezcla web favorecen el ingles, con rendimiento incierto en castellano.
- No compatible con `transformers.AutoModel`; requiere el cargador propio incluido, lo que complica la integracion con ecosistemas estandar.
- Sin estado de optimizador en el checkpoint: el fine-tuning debe reiniciar el optimizador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de la comunidad.
- Los pesos son float32 originales; no hay garantia de soporte para cuantizacion en herramientas de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-web-heavy-64m-30tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
