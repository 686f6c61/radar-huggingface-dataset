# HmedNejjar/Nova

## Resumen

Nova es un modelo de lenguaje decoder-only de aproximadamente 100 millones de parametros desarrollado desde cero por el usuario HmedNejjar en Python y PyTorch, con tokenizador BPE propio y pipeline de entrenamiento completo. Se trata de un ejercicio de ingenieria de LLM de caracter educativo y experimental: no es un modelo derivado de una arquitectura comercial ni un ajuste fino sobre pesos preentrenados, sino una implementacion completa que cubre tokenizacion, preentrenamiento en varias fases y ajuste conversacional.

La arquitectura es un transformer clasico de 12 bloques decodificadores con atencion multi-cabeza (12 cabezas de 64 dimensiones), RoPE como codificacion posicional, SwiGLU como red feed-forward y weight tying entre la matriz de embedding y la cabeza de lenguaje. El vocabulario BPE es de 24.000 tokens y la longitud maxima de secuencia es de 2.048 tokens. El repositorio ocupa 0,4 GB, coherente con pesos en precision fp32.

El interes del modelo es fundamentalmente didactico y de investigacion a pequena escala: documenta de forma explicita las tres fases de entrenamiento (aprendizaje de vocabulario, expansion de conocimiento y estructuracion conversacional) y las lecciones aprendidas sobre alineacion entre corpus del tokenizador y corpus de entrenamiento. No se han publicado resultados de benchmarks, el numero de descargas es cero y la model card esta truncada, por lo que su rendimiento real no esta cuantificado publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only pre-norm con residuales, atencion multi-cabeza, RoPE y SwiGLU |
| Parametros totales | ~100 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (max_seq_len) |
| Tipos de cuantizacion | no disponible (repo en safetensors; el tamano de 0,4 GB para ~100M parametros sugiere fp32). No hay GGUF ni cuantizaciones publicadas |
| Idiomas soportados | no disponible. No se declara idioma en la model card; los corpus citados (SimpleStories y smoltalk/everyday-conversation) estan en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Vocabulario | 24.000 tokens (BPE propio) |
| Dimension de embedding | 768 |
| Numero de capas | 12 |
| Cabezas de atencion | 12 (64 dimensiones por cabeza) |
| FFN oculta | 2.048 (SwiGLU) |
| rope_base | 10.000 |
| Dropout | 0,1 |
| Learning rate | 1e-3 |
| Sampler por defecto | temperatura 0,7, top_k 6, repetition_penalty 1,1 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-13 / 2026-09-13 |

## Arquitectura y entrenamiento

Nova es un transformer decoder-only con bloques pre-norm y conexiones residuales. Cada uno de los 12 bloques aplica LayerNorm, atencion multi-cabeza con RoPE y mascara causal, seguida de Dropout y suma residual; a continuacion, otro LayerNorm y una FFN SwiGLU con proyeccion intermedia de 2.048 dimensiones, de nuevo con Dropout y suma residual. La atencion usa 12 cabezas de 64 dimensiones (768 en total) y mantiene una KV cache para decodificacion incremental sin recalcular tokens pasados. La cabeza de lenguaje comparte pesos con la matriz de embedding y proyecta sobre un vocabulario BPE de 24.000 tokens construido especificamente para este modelo. La generacion usa penalizacion por repeticion, temperatura y muestreo top-k.

El entrenamiento se estructura en tres fases secuenciales. La fase 1 (aprendizaje de vocabulario) entrena con el dataset SimpleStories mediante prediccion del siguiente token con ventana deslizante y sin enmascarado de perdida, buscando convergencia rapida sobre un vocabulario estrecho. La fase 2 (expansion de conocimiento) parte del checkpoint anterior y anade un dataset mixto de conocimiento, tambien sin enmascarado de perdida; el autor indica que omitir esta fase producia salidas parcialmente coherentes pero factualmente incorrectas y con colapso por repeticion, y atribuye el beneficio a un mejor punto de inicializacion en el paisaje de perdida mas que a la retencion de hechos. La fase 3 (estructuracion de chat) es un ajuste fino multi-fuente orientado a formatos conversacionales, instrucciones de sistema, dialogo cotidiano y razonamiento matematico, e incluye datos de smoltalk/everyday-conversation. La model card esta truncada en este punto, por lo que no se detallan el resto de fuentes, el numero total de tokens vistos, la composicion exacta de los datasets ni si se aplicaron tecnicas de alineacion como RLHF o DPO; tampoco se menciona decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto autoregresiva con muestreo configurable (temperatura, top-k, penalizacion por repeticion) y KV cache para decodificacion incremental.
- Conversacion multi-turno basica: la fase 3 se dedica explicitamente a estructuracion de chat y datos de conversacion cotidiana.
- Seguimiento de instrucciones de sistema, segun lo declarado en la fase 3 de entrenamiento.
- Razonamiento matematico elemental, incluido en el ajuste fino multi-fuente de la fase 3.
- Codificacion y decodificacion con tokenizador BPE propio de 24.000 tokens.
- Capacidades multilingues: no disponible; no se declara soporte de idiomas y los corpus citados son en ingles.
- Tool calling / function calling: no disponible; no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona en la informacion proporcionada.
- Vision, audio o modos de pensamiento explicito: no disponible.
- No se declaran capacidades de contexto largo mas alla de los 2.048 tokens.

## Casos de uso

- Material didactico para cursos de LLM: al estar construido desde cero en PyTorch con tokenizador y pipeline propios, permite recorrer paso a paso embedding, atencion con RoPE, SwiGLU, KV cache y decodificacion por muestreo.
- Experimentacion con tokenizadores BPE: el autor senala que el desalineamiento entre el corpus de entrenamiento del tokenizador y el corpus del modelo produce salidas incoherentes, lo que convierte a Nova en un banco de pruebas controlado para estudiar ese efecto a escala de 24.000 tokens.
- Investigacion sobre ordenacion de fases de preentrenamiento: el modelo documenta que saltarse la fase de expansion de conocimiento degrada la coherencia y provoca colapso por repeticion, util para reproducir el experimento de ablacion con pocos recursos.
- Generacion de texto en dominios muy restringidos: con 100M parametros y 2.048 tokens de contexto puede servir para prototipos de completado de frases o parrafos cortos en ingles sobre un registro concreto, siempre con validacion humana.
- Base para ajuste fino ligero: al ser un checkpoint pequeno (~0,4 GB) y con licencia MIT, es viable reentrenar o ajustar en una unica GPU consumer para experimentos de destilacion, LoRA o comparativas de recetas de datos.
- Demostraciones educativas offline: por su tamano, puede ejecutarse en portatil sin GPU para explicar el funcionamiento interno de la decodificacion autoregresiva con KV cache, sin depender de servicios externos.
- Pruebas de integracion de infraestructura de inferencia: util para validar servidores de inferencia propios con un modelo diminuto antes de escalar a modelos mayores, siempre que se confirme la compatibilidad del checkpoint con el runtime elegido.
- Estudio de alucinacion a pequena escala: su limitado conocimiento factual permite medir de forma controlada la tasa de afirmaciones incorrectas en funcion de la temperatura y del top-k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de HuggingFace no incluye tablas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y los resultados de la busqueda web proporcionada no contienen datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,4 GB de pesos, mas activaciones y KV cache.
- VRAM en fp16/bf16: aproximadamente 0,2 GB de pesos; requiere conversion, no publicada.
- KV cache a contexto completo (2.048 tokens, fp16): unos 72 MiB (12 capas x 12 cabezas x 64 dimensiones x 2 tensores K/V x 2.048 posiciones x 2 bytes).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida pueden alojar el modelo. GPU de datacenter (A100, H100) solo tendrian sentido para entrenamiento o por consolidacion de infraestructura.
- Cabe en GPU consumer: si, con margen amplio, en practicamente cualquier GPU con mas de 1 GB de VRAM. Tambien cabe en CPU y en dispositivos de borde.
- Opciones de despliegue: no disponible. El repositorio contiene pesos en safetensors junto a codigo PyTorch propio del autor; no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y no se publican archivos GGUF. Habria que verificar el formato exacto del checkpoint y, en su caso, convertir.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se limita a especificaciones publicas de modelos de escala equivalente; no existen resultados de evaluacion de Nova que permitan comparar calidad. Los datos de las alternativas provienen de su documentacion publica, no de una evaluacion realizada para esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| Nova (HmedNejjar) | ~100M | 2.048 | MIT | safetensors, codigo PyTorch propio | no disponible |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT modificada | safetensors, multiples runtimes | si (ampliamente replicados) |
| Pythia-160M (EleutherAI) | 160M | 2.048 | Apache 2.0 | safetensors, transformers | si |
| SmolLM-135M (HuggingFace) | 135M | 2.048 | Apache 2.0 | safetensors, transformers | si |

Diferencias relevantes: Nova es el unico de los cuatro entrenado integramente desde cero por un autor individual y con un tokenizador BPE propio, y es el unico sin resultados de evaluacion publicados. Frente a Pythia-160M y SmolLM-135M, carece de integracion confirmada con el ecosistema transformers y de cuantizaciones listas para usar, lo que reduce su utilidad en produccion. Su ventaja comparativa es la licencia MIT y su valor documental sobre el proceso de entrenamiento por fases.

## Limitaciones y advertencias

- Escala muy reducida: con ~100M parametros y 24.000 tokens de vocabulario, la capacidad de conocimiento factual, razonamiento y coherencia en textos largos es inherentemente limitada.
- Riesgo de alucinacion elevado: el propio autor documenta que sin la fase 2 de expansion de conocimiento las salidas son parcialmente coherentes pero factualmente incorrectas.
- Colapso por repeticion: la model card menciona repeticion colapsada como fallo observado en configuraciones de entrenamiento inadecuadas; el sampler por defecto incluye repetition_penalty de 1,1 para mitigarlo.
- Sesgos: no hay informacion disponible sobre evaluacion de sesgos. Los corpus de entrenamiento citados (SimpleStories y smoltalk) no estan caracterizados en la informacion proporcionada.
- Idiomas: no se declara soporte multilingue y los datos citados son en ingles; se desaconseja su uso en castellano sin una evaluacion previa.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos, analisis de repositorios o conversaciones extensas con historial amplio.
- Tool calling y uso como agente: no soportados segun la informacion disponible.
- Model card incompleta: el README esta truncado durante la descripcion de la fase 3, por lo que faltan detalles de datos, hiperparametros finales y evaluacion.
- Compatibilidad de despliegue no verificada: no se publican archivos GGUF ni se confirma el soporte en vLLM, llama.cpp, Ollama o TGI. La integracion en produccion requeriria adaptar el codigo del autor o convertir el checkpoint.
- Actividad nula en el repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de terceros.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; conviene revisar igualmente las licencias de los datasets de entrenamiento citados antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HmedNejjar/Nova
- Paper, blog, repositorio o demo adicionales: no disponible. Los resultados de la busqueda web proporcionada no contienen enlaces relevantes al modelo (unicamente paginas de ayuda de Google Translate).
- Datasets citados en la model card: SimpleStories y smoltalk/everyday-conversation (referenciados por nombre en el README, sin enlace directo en la informacion disponible).
