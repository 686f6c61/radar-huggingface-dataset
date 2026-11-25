# dbishwarup/TagoreGPT-29M

## Resumen

TagoreGPT-29M es un modelo de lenguaje de pequeno tamano (42,4 millones de parametros reales en safetensors, aunque el autor lo comercializa como "29M") desarrollado por el usuario dbishwarup, entrenado desde cero en un portatil. Su proposito es generar poemas, canciones, relatos, cartas, ensayos y obras teatrales imitando el estilo del escritor bengali Rabindranath Tagore (1861-1941), premio Nobel de Literatura en 1913, en bengali o en ingles. No es un chatbot ni un asistente conversacional: es un generador de texto estilistico que no responde preguntas, no explica conceptos y no traduce.

Tecnicamente es un transformer decoder-only con disposicion Llama, 8 capas, anchura 512, 8 cabezas de atencion, SwiGLU de 1344 y embeddings atados, con tokenizador SentencePiece de 8000 piezas. Su ventana de contexto es de aproximadamente 1024 tokens (unas 3300 letras), lo que limita la longitud de las piezas generadas. Se distribuye en formato safetensors y GGUF (F16, 85 MB), y esta pensado para ejecutarse en hardware muy modesto, incluso en CPU.

Su relevancia es acotada pero clara: demuestra que es posible entrenar un modelo de generacion literaria estilistica desde cero en recursos de consumo, con un pipeline de datos cuidadosamente curado (TinyStories, Wikisource bengali, Project Gutenberg y obras de Tagore). Es util como caso de estudio de entrenamiento de bajo coste y como herramienta creativa para contenido en bengali, un idioma con poca representacion en modelos grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, disposicion Llama (8 capas, anchura 512, 8 cabezas, SwiGLU 1344, posiciones rotatorias, embeddings atados) |
| Parametros totales | 42.375.552 (safetensors); el autor lo denomina "29M" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | aproximadamente 1024 tokens (~3300 letras) |
| Tipos de cuantizacion | F16 en GGUF; no se documentan otras cuantizaciones |
| Idiomas soportados | bengali (bn) e ingles (en); el ingles es mas debil en esta version |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors y GGUF (tagoregpt-29m-f16.gguf) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con disposicion compatible con Llama: 8 capas, dimension de modelo 512, 8 cabezas de atencion, capa feed-forward SwiGLU de 1344, embeddings de posicion rotatorios (RoPE) y embeddings de tokens atados a la cabeza de salida. El tokenizador es SentencePiece con 8000 piezas que cubren bengali e ingles. Esta configuracion es deliberadamente minima para permitir el entrenamiento desde cero en un portatil.

El entrenamiento se realizo en dos fases. La fase 1 (calentamiento) uso historias sencillas de TinyStories (CDLA-Sharing-1.0) y Regional-TinyStories en bengali (Apache-2.0), textos de otros escritores bengalies de Wikisource, ingles del siglo XIX de Project Gutenberg y obras de Tagore. La fase 2 se centro exclusivamente en Tagore: escaneos bengalies de la Digital Library of India / Internet Archive y textos ingleses de Project Gutenberg. Cada pieza de entrenamiento comienza con etiquetas ocultas (idioma, tipo de texto, autor) y mantiene a la vista el titulo y el parrafo inicial, lo que ayuda a mantener la coherencia tematica en piezas largas. No se documenta uso de RLHF ni DPO. La perdida sobre texto no visto por pieza es de 3,278 para tagore_en y 3,674 para tagore_bn. Los pesos publicados corresponden al paso "tagore step -1".

## Capacidades

- Generacion de poemas, canciones, relatos, cartas, ensayos y obras teatrales en estilo Tagore, en bengali o en ingles.
- Generacion condicionada por etiquetas ocultas: idioma, tipo de texto y longitud/rima, inferidas por la plantilla de chat a partir de la peticion del usuario.
- Escritura creativa de formato largo con titulo y parrafo inicial mantenidos en contexto para preservar el tema.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no es conversacional.
- Capacidades multilingues limitadas a bengali e ingles, con ingles mas debil.
- Capacidad especial: imitacion estilistica de un autor concreto; no responde preguntas, no explica ni traduce.

## Casos de uso

- Generacion de poesia en bengali para publicaciones literarias o blogs: el modelo produce poemas a partir de un tema ("নদী" para el rio) con temperatura 0.75, top-k 40, top-p 0.95 y repeat penalty 1.3, adecuado para borradores creativos que un editor humano revisa.
- Composicion de canciones en bengali: con la receta Ollama `tagoregpt-song-bn` y el tema como entrada, genera letras con estructura de cancion, util para musicos o creadores de contenido que necesitan borradores rapidos.
- Relatos cortos en ingles o bengali: con temperatura 0.8 para relatos, sirve para generar cuentos breves de tematica concreta (por ejemplo, "The old boatman"), apropiado por su bajo coste de inferencia en CPU.
- Material educativo sobre la obra de Tagore: genera imitaciones estilisticas para ilustrar recursos literarios del autor en aulas o talleres, siempre etiquetadas como imitacion y no como texto real.
- Prototipado de aplicaciones creativas: al caber en 85 MB en GGUF y ejecutarse en llama.cpp, Ollama o LM Studio, permite integrar generacion literaria en demos, bots de escritura o experimentos de interfaz sin infraestructura GPU.
- Estudio de entrenamiento de bajo coste: sirve como referencia reproducible para investigadores que quieran replicar un pipeline de dos fases (datos genericos y luego datos de autor) en hardware de consumo.
- Generacion de cartas y ensayos estilizados: con la etiqueta de tipo correspondiente, produce cartas o ensayos breves en tono tagoreano, utiles para contenido editorial tematico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la perdida sobre texto no visto por pieza: tagore_en 3,278 y tagore_bn 3,674.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F16 (pesos de 85 MB en GGUF F16); cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o CPU es viable.
- Cabe en consumer GPU: si, en todas; tambien funciona en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -m tagoregpt-29m-f16.gguf -cnv --jinja`), Ollama (recetas `tagoregpt-poem-en`, `tagoregpt-story-en`, `tagoregpt-poem-bn`, `tagoregpt-song-bn`), LM Studio, Transformers con `AutoModelForCausalLM`, y text-generation-inference segun los tags del repositorio.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera generacion en tiempo real en CPU, pero no se documentan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| TagoreGPT-29M | 42,4 M | ~1024 tokens | bn, en | CC BY-SA 4.0 | Imitacion estilistica de Tagore |
| TinyStories (modelos de referencia) | 1-33 M | ~512-1024 tokens | en | variable (CDLA / Apache) | Relatos simples en ingles |
| Modelos bengalies pequenos (p. ej. variantes de TinyStories bengali) | decenas de M | ~1024 tokens | bn | Apache-2.0 | Texto generico en bengali |
| Modelos multilingues grandes (p. ej. Qwen, Llama) | miles de M | 8k-128k | decenas | variable | Proposito general, chatbot |

La comparacion directa es limitada: TagoreGPT-29M es un modelo especializado en un autor y un estilo, no un modelo de proposito general. Frente a TinyStories destaca por el bilingueismo y la especializacion estilistica; frente a modelos multilingues grandes pierde en contexto, capacidades conversacionales y calidad general, pero gana en coste de despliegue y foco creativo.

## Limitaciones y advertencias

- No es un chatbot: no responde preguntas, no explica, no traduce ni mantiene conversaciones multi-turno.
- Los temas en ingles para una pieza en bengali no se traducen fuera de la aplicacion TagoreGPT.
- Contexto de aproximadamente 1024 tokens (~3300 letras); las piezas mas largas pueden perder coherencia.
- El ingles es mas debil que el bengali en esta version.
- Riesgo de alucinacion estilistica: las lineas pueden ser hermosas o carentes de sentido; es una imitacion de estilo, nunca palabras reales de Tagore.
- Sesgos: al entrenarse sobre obras de un autor concreto del siglo XIX y principios del XX, puede reproducir sesgos de epoca, genero y cultura presentes en esos textos.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y compartir igual; las obras derivadas deben distribuirse bajo la misma licencia.
- Los textos de calentamiento de Wikisource bengali son CC BY-SA 4.0, lo que condiciona la licencia del modelo.
- Para produccion, requiere revision humana del contenido generado y no debe presentarse como texto autentico de Tagore.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dbishwarup/TagoreGPT-29M
- TinyStories (dataset de calentamiento): https://huggingface.co/datasets/roneneldan/TinyStories
- Regional-TinyStories (bengali, Apache-2.0): no disponible enlace directo en la informacion proporcionada
- Bengali Wikisource (CC BY-SA 4.0): https://bn.wikisource.org
- Project Gutenberg: https://www.gutenberg.org
- Digital Library of India / Internet Archive: https://archive.org
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
