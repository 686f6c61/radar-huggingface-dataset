# NeuraWeave/Qwen3-ASR-0.6B-quantised

## Resumen

Qwen3-ASR-0.6B-quantised es una coleccion de checkpoints cuantizados del modelo de reconocimiento automatico del habla Qwen/Qwen3-ASR-0.6B, publicada por NeuraWeave. No se trata de un modelo nuevo ni de un fine-tuning: el autor mantiene los pesos del modelo base y aplica un esquema de cuantizacion por bloques orientado a su propio runtime de inferencia en GPU escrito en Rust sobre CubeCL y wgpu (Vulkan, DX12, Metal). El modelo resuelve el problema del coste de despliegue de un ASR de 0,6 mil millones de parametros, ofreciendo recetas que van desde 1.564,9 MB en f16 hasta 525,4 MB en la receta all-q4.

La relevancia de esta publicacion es metodologica: el autor documenta un mapa de sensibilidad por capa y matriz del decodificador (196 unidades), mide el dano de cada una al pasar a q4k y construye recetas mixtas ordenando las unidades por dano por MB ahorrado. Ademas, publica WER en ingles y CER en japones sobre conjuntos de validacion separados, junto con metricas de divergencia (KL y acuerdo de argmax) frente al modelo f16 de referencia.

Los formatos no son GGUF ni cargan en transformers o llama.cpp: son safetensors con tensores cuantizados divididos en partes `@q8_0.{qs,d}` y `@q4k.{qs,sm,d}`, y el embedding de entrada se omite porque esta atado al lm_head. El modelo base es un ASR de Qwen con soporte para ingles y japones, licencia Apache-2.0 y un repositorio de 6,8 GB que contiene todas las recetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (modelo base Qwen3-ASR); decodificador con 196 matrices (capa, matriz) y encoder de audio con 18 capas |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, q8_0 (8,5 bits por peso), q4k (4,625 bits por peso), y recetas mixtas: q8-encf16, mixed-6.0, mixed-5.5, mixed-5.5-encf16, mixed-5.5-lm4, all-q4 |
| Idiomas soportados | en, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con tensores cuantizados partidos en `<name>@q8_0.{qs,d}` y `<name>@q4k.{qs,sm,d}`; no compatible con GGUF, transformers ni llama.cpp |

## Arquitectura y entrenamiento

El modelo base es Qwen3-ASR-0.6B, un sistema de reconocimiento automatico del habla con encoder de audio y decodificador de texto. La ficha del autor no detalla la composicion del dataset de entrenamiento original ni si hubo RLHF o DPO; esa informacion corresponde al modelo base y no se reproduce aqui. Lo que si documenta NeuraWeave es la estructura interna relevante para la cuantizacion: 18 capas en el encoder de audio y 196 unidades (capa, matriz) en el decodificador, con un lm_head separado y un embedding de entrada atado a este ultimo.

La innovacion tecnica de esta publicacion es el procedimiento de cuantizacion. Se aplica q8_0 de GGML (bloques de 32 a lo largo de la dimension de entrada, una escala f16, valores de 8 bits con signo almacenados con desplazamiento de 128) y q4k, una variante de q4_K con superbloques de 256 (8 subbloques de 32) en la que las escalas y minimos de subbloque se guardan en 8 bits en lugar de 6, con ajuste por minimos cuadrados por subbloque y sin matriz de importancia. Las normas, sesgos y la convolucion del encoder de audio se mantienen en el formato original; en el encoder solo fc2 admite q4k porque las demas longitudes de fila (896) no son multiplos de 256.

La seleccion de recetas mixtas se basa en un mapa de sensibilidad medido sobre 16 clips de LibriTTS-R y 5 clips en japones: cada unidad del decodificador se baja a q4k de forma aislada con el resto en q8_0, se mide el dano y se ordenan las unidades por dano por MB ahorrado. El autor comprobo que los danos son aditivos (una receta ensamblada mide entre 1,01 y 1,04 veces la suma de sus unidades), por lo que no ejecuto una busqueda por ventanas de capas. El encoder de audio resulta poco sensible: en q8_0 anade un KL de 2e-5 para las 18 capas y mantenerlo en f16 no cambia el error de transcripcion.

## Capacidades

- Reconocimiento automatico del habla en ingles y japones, con salida de transcripcion de texto.
- Cuantizacion agresiva con degradacion controlada: la receta all-q8 iguala o mejora ligeramente el WER en ingles del modelo f16 (2,12 % frente a 2,30 %) manteniendo el CER en japones en 6,63 %.
- Ejecucion en el runtime propio de NeuraWeave sobre CubeCL y wgpu, con soporte de Vulkan, DX12 y Metal.
- Inferencia en tiempo real: factor de tiempo real (RTF) de aproximadamente 0,04 en una RTX 3090 Ti para todas las recetas.
- Funcionamiento en GPU integrada: en una Intel UHD 770, f16 alcanza RTF 0,35 y las recetas cuantizadas RTF 0,42-0,45.
- Soporte de tool calling, agentes, vision, audio de entrada mas alla del ASR o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles: la receta all-q8 ocupa 842 MB y mantiene un WER del 2,12 % sobre el conjunto de validacion del autor, adecuada para servicios donde el coste de almacenamiento y el arranque en frio importan mas que la velocidad pura.
- Subtitulado en japones: la receta f16 o all-q8 conserva un CER del 6,63 % en las 20 frases sinteticas de validacion, lo que la hace util para generar subtitulos en contenido audiovisual japones con revision humana posterior.
- Despliegue en equipos de sobremesa sin GPU dedicada: en una Intel UHD 770, las recetas cuantizadas procesan audio a RTF 0,42-0,45, suficiente para transcripcion por lotes no interactiva en estaciones de trabajo ofimaticas.
- Procesamiento por lotes de archivos de audio en servidores con una sola GPU: con RTF de aproximadamente 0,04 en una RTX 3090 Ti, una hora de audio se transcribe en torno a 2,4 minutos de computo, lo que permite pipelines de indexacion de archivos de audio a gran escala.
- Aplicaciones de escritorio con runtime Rust sobre wgpu: al estar empaquetado como componente con manifiesto `component.json` (rutas, bytes y sha256 por archivo) y tokenizer en formato tokenizers, encaja en instaladores que verifican integridad y comparten la tabla de embedding con el lm_head.
- Prototipado con restricciones de descarga: la receta all-q4 ocupa 525,4 MB y mantiene un WER del 2,83 % en ingles, util para entornos con ancho de banda limitado o para distribuir el modelo dentro de una aplicacion movil o de escritorio.
- Evaluacion de tecnicas de cuantizacion: las tablas de WER, CER, KL y acuerdo de argmax por receta sirven como referencia para comparar esquemas de cuantizacion por bloques en modelos ASR pequenos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de validacion separado: 27 clips en ingles (24 de LibriTTS-R y 3 sinteticos, 566 palabras) y 20 clips en japones (voz sintetica de 20 frases en 9 voces, 543 caracteres). WER y CER pliegan mayusculas y puntuacion. KL es teacher-forced comparando la distribucion por token con la del modelo f16.

| Receta | Tamano (MB) | Bits decodificador | Encoder | lm_head | WER en | CER ja | KL | Acuerdo argmax |
|---|---|---|---|---|---|---|---|---|
| f16 | 1564,9 | 16,00 | f16 | f16 | 2,30 % | 6,63 % | 0 | 1 |
| all-q8 | 842,0 | 8,50 | q8_0 | q8_0 | 2,12 % | 6,63 % | 2,7e-4 | 0,997 |
| q8-encf16 | 1006,2 | 8,50 | f16 | q8_0 | 2,12 % | 6,63 % | 2,1e-4 | 0,997 |
| mixed-6.0 | 703,9 | 5,99 | q8_0 | q8_0 | 1,94 % | 6,81 % | 8,8e-3 | 0,982 |
| mixed-5.5 | 676,0 | 5,48 | q8_0 | q8_0 | 2,47 % | 6,81 % | 1,5e-2 | 0,976 |
| mixed-5.5-encf16 | 840,2 | 5,48 | f16 | q8_0 | 2,47 % | 6,81 % | 1,4e-2 | 0,975 |
| mixed-5.5-lm4 | 600,6 | 5,48 | q8_0 | q4k | 2,65 % | 6,63 % | 1,8e-2 | 0,974 |
| all-q4 | 525,4 | 4,62 | q8_0 (fc2 q4k) | q4k | 2,83 % | 8,29 % | 4,8e-2 | 0,968 |

El checkpoint bf16 original ocupa 1876 MB porque almacena dos veces el embedding atado. En cuanto a velocidad, en una RTX 3090 Ti todas las recetas decodifican a 4-5 ms por token (f16 4,0 ms; cuantizadas 4,4-4,9 ms), con un RTF de aproximadamente 0,04. En una Intel UHD 770, f16 tarda 46 ms por token (RTF 0,35) y las cuantizadas 62-70 ms (RTF 0,42-0,45). El autor senala que f16 es la receta mas rapida en su runtime actual.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; como referencia de memoria, las recetas van de 525,4 MB (all-q4) a 1.564,9 MB (f16) en disco, y el checkpoint bf16 original ocupa 1876 MB.
- GPU recomendadas: RTX 3090 Ti (probada, 4-5 ms por token), Intel UHD 770 (probada, RTF 0,35-0,45). No se han publicado pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, por tamano; el autor solo documenta pruebas en RTX 3090 Ti e Intel UHD 770.
- Opciones de despliegue: exclusivamente el runtime de NeuraWeave (CubeCL sobre wgpu: Vulkan, DX12, Metal). No carga en transformers, llama.cpp, vLLM, TGI ni Ollama.
- Latencia y throughput: 4,0 ms por token en f16 y 4,4-4,9 ms en cuantizadas sobre RTX 3090 Ti; 46 ms por token en f16 y 62-70 ms en cuantizadas sobre Intel UHD 770.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| NeuraWeave/Qwen3-ASR-0.6B-quantised | 0,6 B | no disponible | en, ja | Apache-2.0 | safetensors cuantizado propietario | Solo runtime NeuraWeave; recetas de 525 a 1.565 MB |
| Qwen/Qwen3-ASR-0.6B (base) | 0,6 B | no disponible | en, ja | Apache-2.0 | bf16 (1876 MB) | Compatible con el ecosistema estandar; referencia f16 de esta publicacion |
| Whisper small (referencia de categoria) | 244 M | 1500 tokens de audio | multilingue | MIT | safetensors, GGUF, etc. | Datos de benchmarks no disponibles en esta busqueda; se cita solo como referencia de tamano y ecosistema |
| Whisper medium (referencia de categoria) | 769 M | 1500 tokens de audio | multilingue | MIT | safetensors, GGUF, etc. | Datos de benchmarks no disponibles en esta busqueda; se cita solo como referencia de tamano y ecosistema |

No se dispone de resultados de benchmarks comparativos entre esta publicacion y modelos alternativos en la informacion proporcionada; la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Los pesos no son GGUF y no cargan en transformers ni en llama.cpp; solo funcionan con el runtime de NeuraWeave. Esto limita drasticamente la portabilidad y ata el modelo a una herramienta concreta.
- El embedding de entrada se ha eliminado de los safetensors porque esta atado al lm_head; cualquier consumidor debe compartir una unica tabla, como hace el runtime del autor.
- Los conjuntos de validacion son pequenos y en parte sinteticos: 27 clips en ingles (566 palabras) y 20 frases en japones (543 caracteres) en 9 voces sinteticas. Los valores de WER y CER no deben extrapolarse a dominios, acentos o ruido reales sin validacion propia.
- El WER en ingles de all-q8 (2,12 %) es inferior al de f16 (2,30 %) sobre este conjunto, una diferencia que probablemente refleja ruido de medicion y no una mejora real; no debe interpretarse como ganancia de calidad.
- La receta all-q4 degrada el CER en japones hasta el 8,29 % (frente a 6,63 % en f16) y el acuerdo de argmax baja a 0,968; no es adecuada para japones en produccion sin evaluacion adicional.
- Solo se declaran los idiomas en y ja; no hay soporte documentado de otros idiomas.
- No se detallan sesgos conocidos del modelo base ni tasas de alucinacion en la informacion proporcionada.
- Licencia Apache-2.0, igual que el modelo base, con archivos LICENSE y NOTICE que documentan las modificaciones; no se indican restricciones adicionales para uso comercial.
- El repositorio tiene 6,8 GB porque incluye todas las recetas; descargar una sola receta requiere seleccionar los archivos correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuraWeave/Qwen3-ASR-0.6B-quantised
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
