# q-project/Qwen2.5-0.5B-Instruct-qpack

## Resumen

Qwen2.5-0.5B-Instruct-qpack es una redistribución cuantizada y recomprimida del modelo Qwen2.5-0.5B-Instruct de Alibaba Cloud, publicada por el colectivo q-project para su motor de inferencia propio, qpack. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo conjunto de pesos del modelo base, transformado mediante tres técnicas encadenadas (recorte de vocabulario, cuantización GPTQ de 4 bits y codificación entrópica sin pérdida) con el objetivo de reducir el tamaño del artefacto de 352,4 MiB a 232,2 MiB, un 34 % menos.

El modelo base es un transformer denso de 0,5 mil millones de parámetros con una ventana de contexto nativa de 32.768 tokens (según la documentación de Qwen2.5, no reproducida en la model card de esta ficha). Esta versión mantiene la licencia Apache-2.0 y se distribuye en un contenedor monolítico `.qpack` que incluye el tokenizador y permite mapeo en memoria (mmap). Está pensado para entornos con recursos muy limitados: CPU sin GPU, dispositivos embebidos, o GPUs de gama baja como una Tesla P4.

La relevancia de esta publicación es fundamentalmente de investigación en compresión e ingeniería de despliegue, no de calidad de modelo. El autor lo declara explícitamente: un modelo de 0,5B falla en hechos y aritmética, y la cuantización de 4 bits empeora ligeramente ese comportamiento. Su interés está en demostrar que se puede recortar un vocabulario de 151.936 a 80.000 tokens y aplicar GPTQ más codificación rANS con una degradación de perplejidad inferior al 1,5 % respecto a una línea base de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5 declara 32.768 tokens) |
| Tipos de cuantizacion | 4 bits GPTQ con act-order, grupos de 32 con escala fp16; cabeza de salida tambien en 4 bits; codificacion rANS sin perdida (QPACK3) |
| Idiomas soportados | en, ru (vocabulario optimizado para ingles y ruso) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.qpack` (contenedor propio QPACK2 y QPACK3, mmap-able, tokenizador incluido) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-0.5B-Instruct original: un transformer denso decoder-only. Esta publicacion no entrena el modelo desde cero ni aplica RLHF o DPO adicional; hereda el alineamiento del modelo base. Lo que hace es una cadena de tres transformaciones sobre los pesos existentes. Primero, recorta el vocabulario de 151.936 a 80.000 tokens usando frecuencias calculadas sobre Wikipedia en ingles y ruso y ficcion de dominio publico que no se solapan con los textos de evaluacion; conserva siempre los tokens de byte y los especiales, y poda las fusiones que generarian tokens eliminados. El tokenizador C++ y el de Python coinciden en 88 de 88 cadenas de prueba (ruso, ingles, CJK, emoji, especiales). Segundo, aplica cuantizacion GPTQ de 4 bits con act-order en grupos de 32 con escala fp16, calibrada sobre 4.088 tokens de texto ruso e ingles, e incluye la cabeza de salida en 4 bits por ser la matriz mas leida en cada token decodificado. Tercero, aplica codificacion entropica rANS sin perdida (formato QPACK3) sobre pesos y escalas de 4 bits, que se decodifica una sola vez al cargar, de modo que los kernels no se modifican y el resultado es bit a bit identico al fichero sin empaquetar.

El autor documenta tambien lo que probo y descarto por superar un presupuesto de degradacion del 2 %: grupos de cuantizacion de 64 o 128 (ahorraban entre 11 y 15 MiB pero elevaban la perplejidad entre un 4 % y un 13 %), la eliminacion de cualquier capa del transformer (al menos un 7 % de degradacion) y pesos de 1 bit (perplejidad entre 10³ y 10⁷ en un modelo denso de 0,5B).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo Instruct base.
- Razonamiento basico y respuesta a preguntas factuales simples (el ejemplo de la model card acierta la capital de Francia).
- Aritmetica muy limitada: en la propia model card, una pregunta aritmetica en ruso se responde de forma incorrecta.
- Capacidades multilingues reales en ingles y ruso; otros idiomas se tokenizan en mas piezas por el recorte de vocabulario.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso en la informacion proporcionada.
- No se documenta modo thinking, vision ni audio en la informacion proporcionada.
- Inferencia en CPU (backend AVX2) y en GPU NVIDIA (backend CUDA, Pascal o posterior).

## Casos de uso

- Despliegue en CPU sin GPU: el fichero de 232,2 MiB con mmap permite ejecutar generacion de texto en servidores sin acelerador, con un rendimiento medido de 85 a 90 tokens por segundo en un Xeon con AVX2 y 16 hilos. Adecuado para tareas de respuesta corta y prototipado.
- Inferencia en GPU de gama baja: en una Tesla P4 se midieron aproximadamente 252 tokens por segundo en decodificacion greedy, lo que permite servir chatbots ligeros en hardware de bajo coste o reutilizado.
- Aplicaciones embebidas o de borde: el tamano reducido y el contenedor unico con tokenizador incluido simplifican el empaquetado en dispositivos con almacenamiento y memoria limitados.
- Filtrado y clasificacion de texto en ingles y ruso: el modelo puede usarse para tareas de etiquetado o resumen corto donde no se requiere precision factual alta, aprovechando su bajo coste por token.
- Generacion de texto creativo de dominio publico: el recorte de vocabulario se calibro con ficcion de Project Gutenberg, por lo que el modelo conserva cobertura razonable para ese registro en ingles.
- Investigacion en compresion de modelos: sirve como referencia reproducible para medir el impacto de recorte de vocabulario, GPTQ de 4 bits y codificacion rANS sobre perplejidad y velocidad, con los scripts y el motor publicados en el repositorio qpack.
- Pruebas de integracion de motores de inferencia: util para validar lectores QPACK2 y QPACK3, incluida la comprobacion de que `qpack-pack --unpack` reproduce el fichero QPACK2 byte a byte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta perplejidad medida con `qpack-perplexity -c 256 --chunks 4` sobre cinco textos fuera de los datos de calibracion y de frecuencias de vocabulario, comparada contra la cuantizacion mixta de 4 bits del propio qpack sobre el modelo sin recortar (`q4m`, 352,4 MiB). El autor advierte que no midio el modelo original en bf16/f16.

| Texto | q4m base (352,4 MiB) | Este modelo (256,1 / 232,2 MiB) | Delta |
|---|---|---|---|
| Wikipedia RU | 10,296 | 10,363 | +0,65 % |
| Wikipedia EN | 15,337 | 15,464 | +0,82 % |
| Held-out RU | 19,702 | 19,874 | +0,87 % |
| Held-out EN | 15,120 | 15,260 | +0,93 % |
| Ficcion EN | 19,180 | 19,449 | +1,40 % |

Velocidad de decodificacion (greedy, mismos ficheros):

| Backend | tok/s | Nota |
|---|---|---|
| CPU, 16 hilos (Xeon AVX2, VM compartida) | aprox. 85-90 | ruidoso, mas o menos 10 % entre ejecuciones identicas |
| NVIDIA Tesla P4 (CUDA) | aprox. 252 | mediana de 5 ejecuciones intercaladas, 1113 MHz |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el fichero empaquetado ocupa 232,2 MiB y el QPACK2 256,1 MiB, por lo que el peso en memoria es del orden de unos cientos de MiB, muy por debajo de 1 GB.
- GPU recomendadas: NVIDIA Tesla P4 (medida en la model card); cualquier GPU NVIDIA Pascal o posterior con backend CUDA de qpack. No se han publicado mediciones en A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo actual; el autor no documenta pruebas en tarjetas concretas de consumo.
- Opciones de despliegue: motor qpack (CLI `qpack-cli`, compilado con CMake, con opcion `-DQPACK_CUDA=ON` para backend NVIDIA). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; los lectores WASM/JS y Android solo entienden QPACK2, no QPACK3.
- Latencia y throughput: 85-90 tok/s en CPU Xeon AVX2 con 16 hilos y aproximadamente 252 tok/s en Tesla P4, en decodificacion greedy y sobre una maquina compartida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-qpack (este) | 0,5B | no disponible en esta ficha (base: 32.768) | `.qpack` 232,2 MiB (QPACK3) / 256,1 MiB (QPACK2) | Apache-2.0 | Vocabulario recortado a 80k, GPTQ 4 bits, rANS sin perdida |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 | safetensors en bf16/f16 | Apache-2.0 | Referencia original; sin cuantizar |
| Cuantizacion mixta 4 bits de qpack (`q4m`) | 0,5B | 32.768 | `.qpack` 352,4 MiB | Apache-2.0 | Linea base usada por el autor para medir la degradacion |
| N-Q-164M-Chat (mismo autor) | 164M | no disponible | `.qpack` | no disponible en la informacion proporcionada | Alternativa mas pequena del mismo proyecto |

No se dispone de datos de benchmarks comparativos con otras familias de modelos del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad intrinseca baja del modelo base: a 0,5B de parametros falla en hechos y en la mayoria de operaciones aritmeticas; la cuantizacion de 4 bits agrava ligeramente este comportamiento.
- No se ha aplicado ajuste de seguridad adicional; hereda los sesgos y riesgos del Qwen2.5-0.5B-Instruct original.
- Riesgo alto de alucinacion en preguntas factuales y en contextos largos.
- El vocabulario de 80.000 tokens esta optimizado para ingles y ruso; otros idiomas, incluido el espanol, se fragmentan en mas piezas, lo que reduce eficiencia y puede degradar la calidad.
- La perplejidad se midio sobre muestras cortas (4 x 256 tokens) y contra una linea base de 4 bits, no contra los pesos originales en bf16/f16; las diferencias inferiores al 0,3 % se consideran ruido.
- Solo se midio velocidad en decodificacion greedy, en una maquina compartida y con ruido de mas o menos 10 %.
- El fichero QPACK3 requiere la version del motor de la rama `main`; los lectores WASM/JS y Android no lo soportan y deben usar el fichero QPACK2.
- La licencia Apache-2.0 permite uso comercial, pero los terminos de los datos de entrenamiento del modelo base dependen de la model card de Qwen; los textos de calibracion y frecuencias son Wikipedia (CC BY-SA) y libros de dominio publico de Project Gutenberg.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q-project/Qwen2.5-0.5B-Instruct-qpack
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del motor qpack: https://github.com/Q-Project-LM/qpack
- Alternativa del mismo autor: https://huggingface.co/q-project/N-Q-164M-Chat
