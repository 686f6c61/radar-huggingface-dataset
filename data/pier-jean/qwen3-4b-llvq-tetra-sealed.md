# Pier-Jean/Qwen3-4B-LLVQ-Tetra-sealed

## Resumen

Qwen3-4B-LLVQ-Tetra-sealed es un artefacto de investigacion publicado por el usuario Pier-Jean que contiene los pesos del modelo denso Qwen3-4B de Alibaba comprimidos a una media de 2,73 bits por parametro, embedding incluido, en un unico fichero de 1,42 GB. La compresion se apoya en el metodo LLVQ (Low-bit Leech Vector Quantization) descrito en el paper arXiv:2603.11021, que codifica la mayoria de las matrices de pesos sobre el reticulo de Leech Λ24 mediante un codebook denominado Tetra, con un kernel CUDA fusionado que decodifica y multiplica en una sola pasada.

El modelo resuelve un problema concreto de investigacion: llevar un transformer de 4B a un regimen cercano a 2 bits por parametro sin colapsar la calidad, manteniendo MMLU a 63,37 y GSM8K a 82,49 en pruebas medidas sobre una GPU NVIDIA L40S. No es un reemplazo directo de un checkpoint convencional: se lee con el motor en Rust del repositorio github.com/pjmalandrino/llvq y no es compatible con GGUF, AWQ, llama.cpp ni vLLM. Existe una variante en safetensors publicada como Pier-Jean/Qwen3-4B-LLVQ-Tetra pensada para `transformers`, que mantiene los pesos comprimidos en memoria.

Su relevancia actual es doble: por un lado explora el limite practico de la cuantizacion vectorial en reticulo sobre modelos abiertos de tamano medio; por otro, demuestra que un esquema de decodificacion integrado en el kernel puede alcanzar 113,8 tokens por segundo en batch 1 superando a vLLM con FP16 (83,1 tokens/s) en el mismo hardware. El repositorio apenas acumula descargas y likes en el momento de redactar esta ficha, por lo que debe tratarse como material experimental y no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredado de Qwen/Qwen3-4B); pesos comprimidos con el esquema LLVQ Tetra |
| Parametros totales | ~4 mil millones (modelo base Qwen3-4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen3-4B (ampliable a 131.072 con YaRN); no verificado para esta cuantizacion |
| Tipos de cuantizacion | 2,73 bits por parametro de media; codigos sobre reticulo de Leech Λ24 con codebook Tetra (48 bits por bloque de 24 pesos, una escala por fila); int4 con grupos de 128; int4 con grupos de 64; f16 para normas y tensores no cuantizados |
| Idiomas soportados | en (unico idioma declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | `.bin` propietario del motor llvq (no es GGUF, AWQ, llama.cpp ni vLLM); variante safetensors en Pier-Jean/Qwen3-4B-LLVQ-Tetra |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros. Sobre esa base, la cuantizacion LLVQ Tetra sustituye la representacion de 168 de las 252 proyecciones por codigos sobre el reticulo de Leech Λ24: cada bloque de 24 pesos se codifica en 48 bits y se conserva una unica escala por fila, dejando una cola pequena sin cuantizar. El resto de pesos se reparte entre int4 con grupos de 128 (`v_proj` de todas las capas, `o_proj` de todas las capas y `down_proj` de las capas 12 a 23), int4 con grupos de 64 para el embedding (atado a la cabeza de salida) y f16 para las normas y todo lo que el cuantizador no toca. `config.json` y el tokenizer se copian byte a byte desde el checkpoint original.

El proceso de ajuste no es un entrenamiento desde cero, sino una calibracion tipo GPTQ sobre 131.072 tokens de DCLM-edu. A continuacion, la escala de cada fila de pesos se reentrena contra el modelo FP16 con los codigos congelados. El impacto de cada etapa se midio sobre el conjunto completo de test de MMLU: solo con los codigos Tetra e int4 en `v_proj` el modelo baja a 57,95; al reentrenar las escalas de fila sube a 61,11; y con el int4 adicional en `o_proj`, `down_proj` de las capas 12 a 23 y embedding a 4 bits alcanza 63,37. La innovacion tecnica principal es el kernel fusionado que decodifica y multiplica en una pasada, evitando materializar los pesos descomprimidos en memoria.

## Capacidades

- Generacion de texto y razonamiento general, heredadas de Qwen3-4B, con degradacion medible frente al modelo en FP16 (6,77 puntos en MMLU y 9,63 en GSM8K).
- Razonamiento matematico de varios pasos, evaluado en GSM8K zero-shot (82,49 puntos) pidiendo la respuesta en `\boxed{}`.
- Modo thinking de la plantilla de chat de Qwen3; en las evaluaciones publicadas el bloque de pensamiento se deja vacio.
- Generacion de codigo: no se han publicado resultados de HumanEval ni de otros benchmarks de codigo en la informacion disponible.
- Tool calling y function calling: no evaluados explicitamente en la model card; se heredan de Qwen3-4B, pero no hay mediciones que lo confirmen en esta cuantizacion.
- Soporte de agentes y razonamiento multi-paso: no evaluado en la informacion disponible.
- Capacidades multilingues: la model card solo declara ingles (`en`), aunque el modelo base soporta mas idiomas; el comportamiento multilingue de esta cuantizacion no esta medido.
- Capacidades multimodales (vision, audio): no disponibles; el modelo base Qwen3-4B es exclusivamente de texto.

## Casos de uso

- Investigacion en cuantizacion extrema: sirve como referencia reproducible para estudiar el compromiso entre bits por parametro y calidad, ya que el autor publica la tabla de ablacion por etapas (57,95 -> 61,11 -> 63,37 en MMLU) y las diferencias emparejadas con intervalos de confianza al 95 %.
- Despliegue con restricciones severas de memoria: el fichero de 1,42 GB (1,38 GB de pesos en GPU) permite cargar un modelo de 4B en entornos donde un checkpoint FP16 de 8,04 GB no cabria, siempre que se use el motor llvq en Rust.
- Evaluacion de kernels CUDA fusionados: los 113,8 tokens/s en batch 1 sobre una L40S convierten el artefacto en un banco de pruebas para comparar decodificacion integrada frente a pipelines tradicionales de descompresion previa.
- Generacion de texto en ingles con latencia moderada para prototipos internos, asumiendo la perdida de calidad de 6,77 puntos en MMLU y 9,63 en GSM8K respecto a FP16.
- Benchmarking comparativo de esquemas de cuantizacion: el autor aporta medidas lado a lado con AWQ w4g128 e IQ2_XXS sobre las mismas preguntas, lo que facilita reproducir la comparativa sin montar el entorno desde cero.
- Estudio de arquitecturas de reticulo en produccion academica: la implementacion independiente en Rust sobre el reticulo de Leech Λ24 permite validar el metodo del paper arXiv:2603.11021 en un modelo real y no solo en prototipos sinteticos.
- Pruebas en Apple silicon mediante reconstruccion densa: el lector en Python permite levantar las 252 proyecciones comprimidas en 2.750 GB, aunque la ruta Metal fusionada rechaza el fichero por el tamano de `down_proj` (9.728).

## Benchmarks y rendimiento

Resultados publicados por el autor, todos medidos sobre una NVIDIA L40S:

| Metrica | Este fichero | FP16 | AWQ w4g128 | IQ2_XXS |
|---|---|---|---|---|
| Bits por parametro (modelo completo) | 2,73 | 16,00 | 5,30 | 2,48 |
| Bytes de pesos | 1,38 GB | 8,04 GB | 2,67 GB | 1,25 GB |
| Decodificacion, batch 1 (motor propio) | 113,8 tok/s | 83,1 (vLLM) | 200,5 (vLLM) | 312,9 (llama.cpp) |
| MMLU, 5-shot, 14.042 preguntas | 63,37 | 70,14 | 68,14 | 39,78 |
| GSM8K, zero-shot, 1.319 problemas | 82,49 | 92,12 | 89,01 | sin puntuar |

Diferencias emparejadas sobre las mismas preguntas, con intervalos al 95 %:

| Metrica | Por debajo de FP16 | Por debajo de AWQ |
|---|---|---|
| MMLU | 6,77 [6,05, 7,50] | 4,76 [4,02, 5,49] |
| GSM8K | 9,63 [7,69, 11,57] | 6,52 [4,39, 8,65] |

Ficheros hermanos del mismo autor, en el mismo formato:

| Fichero | Bits por parametro | MMLU | GSM8K | Decodificacion (tok/s) | Pesos |
|---|---|---|---|---|---|
| `qwen3-8b-sealed-B.bin` | 2,70 | 69,58 | 88,63 | 95,0 | 2,76 GB |
| `qwen3-14b-sealed.bin` | 2,73 | 75,66 | 92,04 | 57,2 | 5,04 GB |

Notas metodologicas del autor: MMLU se puntua sobre la reconstruccion densa (mismos pesos decodificados a f16 con forward pass convencional, respuesta leida de los logits de las cuatro letras, micro-promediada sobre el test completo); GSM8K se puntua a traves del kernel servido, prompt zero-shot con plantilla de chat de Qwen3 y bloque de pensamiento vacio, decodificacion greedy hasta 1.024 tokens. Para comprobar que el motor no altera la puntuacion, el checkpoint FP16 tambien se ejecuto por la ruta densa (91,51 frente a 92,12 en vLLM, diferencia de -0,61 puntos). El fichero comete un 17,5 % de errores en GSM8K donde FP16 comete un 7,9 %.

## Requisitos de hardware

- VRAM para pesos: 1,38 GB en GPU segun la medicion del autor (frente a 8,04 GB en FP16 y 2,67 GB en AWQ w4g128).
- VRAM total: pesos mas cache KV y sobrecarga de runtime; el autor no publica una cifra de VRAM total, por lo que no disponible.
- GPU recomendada y medida: NVIDIA L40S. El kernel CUDA del motor llvq requiere GPU NVIDIA para la ruta fusionada.
- GPU de consumo: no hay mediciones publicadas en RTX 4090, 3090 u otras GPU de consumo; por el tamano de pesos (1,38 GB) es plausible que quepa, pero no esta verificado.
- Apple silicon: la ruta Metal fusionada rechaza este fichero porque `tv_q4_metal` se detiene en d_in 8192 y `down_proj` es 9.728; el lector en Python sortea la limitacion y mantiene las 252 proyecciones comprimidas en 2.750 GB.
- Opciones de despliegue: exclusivamente el motor en Rust de github.com/pjmalandrino/llvq (features `cuda` o `metal`). No hay soporte para vLLM, llama.cpp, Ollama, TGI ni GGUF. Para `transformers` existe la variante safetensors en Pier-Jean/Qwen3-4B-LLVQ-Tetra.
- Latencia y throughput: 113,8 tokens/s de mediana en batch 1 sobre L40S (256 tokens greedy, mediana de cinco rondas). El autor advierte que las velocidades de motores distintos no deben dividirse entre si, ya que vLLM ejecuta FP16 mas rapido que su propio motor.

## Comparativa con modelos similares

| Modelo | Parametros | Bits/param | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3-4B-LLVQ-Tetra-sealed | ~4B | 2,73 | 32.768 (base) | 63,37 | 82,49 | apache-2.0 | Solo motor llvq en Rust |
| Qwen3-4B AWQ w4g128 | ~4B | 5,30 | 32.768 (base) | 68,14 | 89,01 | apache-2.0 | vLLM y otros runners con soporte AWQ |
| Qwen3-4B IQ2_XXS | ~4B | 2,48 | 32.768 (base) | 39,78 | sin puntuar | apache-2.0 | llama.cpp |
| Qwen3-4B FP16 | ~4B | 16,00 | 32.768 (base) | 70,14 | 92,12 | apache-2.0 | vLLM, transformers, TGI |

El modelo comparado mas directamente por tamano y licencia es AWQ w4g128, que ocupa casi el doble de bytes (2,67 GB frente a 1,38 GB) y ofrece 4,76 puntos mas en MMLU y 6,52 mas en GSM8K, con un ecosistema de despliegue mucho mas amplio. Frente a IQ2_XXS, la propuesta LLVQ Tetra es notablemente mas precisa (63,37 frente a 39,78 en MMLU) a un coste ligeramente mayor en bits. Los ficheros hermanos de 8B y 14B del mismo autor permiten escalar la calidad a cambio de menos tokens por segundo.

## Limitaciones y advertencias

- Artefacto de investigacion, no un modelo listo para produccion: el propio autor lo etiqueta como tal en la model card.
- Compatibilidad restringida: no es GGUF, AWQ, llama.cpp ni vLLM. Requiere compilar el motor en Rust desde github.com/pjmalandrino/llvq.
- Perdida de calidad medible: 6,77 puntos de MMLU y 9,63 de GSM8K frente a FP16 en las mismas preguntas. En errores, GSM8K pasa de un 7,9 % en FP16 a un 17,5 % en este fichero.
- El autor observa que, en puntos, el modelo pierde mas en GSM8K que en MMLU a 4B, aunque a 8B y 14B la prueba no separa ambas perdidas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; cabe esperar que se agrave por la cuantizacion, especialmente en tareas de razonamiento numerico.
- Idioma: la model card solo declara ingles. El comportamiento en castellano u otros idiomas no esta evaluado.
- Sesgos: no se documentan analisis de sesgo en la informacion proporcionada.
- Licencia apache-2.0, por lo que el uso comercial esta permitido en principio, pero la dependencia del motor llvq y la ausencia de benchmarks propios de produccion desaconsejan su adopcion comercial sin validacion adicional.
- Restriccion tecnica en Apple silicon: la ruta Metal fusionada no acepta el fichero por el tamano de `down_proj` (9.728 frente al limite de 8.192 de `tv_q4_metal`); solo funciona mediante reconstruccion densa en Python.
- Repositorio con cero descargas y cero likes en el momento de redactar la ficha, lo que reduce la superficie de validacion por parte de terceros.
- El numero de arXiv (2603.11021) tiene fecha posterior a la creacion del repositorio; conviene verificar la version final del paper antes de citarlo en trabajos propios.

## Enlaces

- Modelo en HuggingFace (fichero `.bin` del motor llvq): https://huggingface.co/Pier-Jean/Qwen3-4B-LLVQ-Tetra-sealed
- Variante en safetensors para `transformers`: https://huggingface.co/Pier-Jean/Qwen3-4B-LLVQ-Tetra
- Repositorio del motor en Rust: https://github.com/pjmalandrino/llvq
- Paper del metodo: https://arxiv.org/abs/2603.11021 (van der Ouderaa, van Baalen, Whatmough, Nagel, 2026)
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
