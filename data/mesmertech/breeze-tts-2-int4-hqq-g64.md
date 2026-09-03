# mesmertech/Breeze-TTS-2-int4-hqq-g64

## Resumen

Breeze-TTS-2-int4-hqq-g64 es una versión cuantizada a int4 del modelo de síntesis de voz Breeze-TTS-2, desarrollada por mesmertech a partir del checkpoint original de BreezeBlue. El modelo base es un sistema de text-to-speech open-weight diseñado para interacción en tiempo real, que ocupa el primer puesto entre los modelos open-weight en el leaderboard de TTS de Artificial Analysis y supera a sistemas propietarios de referencia. Esta derivada cuantizada reduce el peso de los decodificadores de 3,25 GiB en bf16 a 0,91 GiB en int4 con escalas bf16, manteniendo una calidad indistinguible del original según las pruebas del autor.

La cuantización utiliza el método HQQ (Half-Quadratic Quantization) con grupo de tamaño 64, sin datos de calibración, y se distribuye en un formato "pre-packed" que evita re-cuantizar en cada arranque. El checkpoint no es un drop-in de `transformers` estándar: requiere un loader específico del repositorio `breeze-tts-runpod`. El modelo conserva intactos el codificador de texto T5Gemma2, el `lm_head`, los embeddings, los proyectores, el codec y el tokenizador de audio, lo que limita la pérdida de calidad a las capas lineales cuantizadas. Con 2.666 millones de parámetros totales y licencia Apache-2.0, es una opción práctica para desplegar TTS de alta calidad en GPUs de consumo con requisitos de VRAM reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en transformer (text encoder T5Gemma2, backbone de 28 capas, depth decoder de 12 capas, codec model, audio tokenizer Qwen3-TTS) |
| Parametros totales | 2.666.300.257 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto textual largo) |
| Tipos de cuantizacion | int4 HQQ, group size 64, pre-packed (nibble layout portable) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model-int4.safetensors + audio_tokenizer/model.safetensors) |

## Arquitectura y entrenamiento

El modelo base Breeze-TTS-2 es un sistema TTS de arquitectura transformer con un codificador de texto T5Gemma2, un backbone de 28 capas, un decodificador de profundidad de 12 capas, un codec de audio y un tokenizador de audio basado en Qwen3-TTS. La versión cuantizada aplica HQQ (proximal solver, `nbits=4, axis=1, channel_wise, optimize=True, round_zero=False`) a 280 capas lineales sin bias: las 84 del `depth_decoder` y las 196 del `backbone_model` (proyecciones `q,k,v,o` y MLP `gate,up,down`). No se cuantizan el codificador de texto, `lm_head`, cabezas de codebook, embeddings, proyectores, codec ni tokenizador de audio, que se conservan en su dtype original.

La cuantización se realizó sin datos de calibración, con aritmética en float32 en el host de construcción (Apple M1 Pro), y el error de peso por capa lineal (Frobenius) es de media 0,0889 en el depth decoder y 0,0879 en el backbone. El formato "pre-packed" almacena `qweight` en un layout de nibbles portable, que se convierte al layout tensor-core de torch mediante `torch._convert_weight_to_int4pack` en milisegundos, evitando re-ejecutar el cuantizador (que tardaría 3,4 s por proceso en una RTX 4090). El kernel de inferencia es `torch._weight_int4pack_mm` con requisito de arquitectura sm_80+.

## Capacidades

- Sintesis de voz a partir de texto con calidad comparable al modelo bf16 original, segun pruebas del autor (gate de 320 clips con UTMOS22, DNSMOS, Whisper WER, resemblyzer cosine, pyin F0 y words/s).
- Voice design en lenguaje natural: permite describir la voz deseada sin necesidad de muestras de referencia.
- Voice direction: control fino de tono, emocion, ritmo y entrega mediante instrucciones en lenguaje natural.
- Clonacion de voz a partir de audio de referencia, con direccion de la interpretacion.
- Generacion en tiempo real con baja latencia: 33,5 ms por frame de codec en modo design y 31,5 ms en modo clone sobre RTX 4090.
- Soporte de streaming para interaccion conversacional.
- Capacidades multilingues: no especificadas en la informacion disponible.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede generar respuestas habladas con latencia de decenas de milisegundos por frame, lo que permite conversaciones fluidas en aplicaciones de atencion al cliente o asistentes personales.
- Generacion de contenido audiovisual: locucion para videos, podcasts y audiolibros con control de tono y emocion, reduciendo el coste de estudio de grabacion.
- Doblaje y localizacion: clonacion de voces de actores y direccion de la interpretacion para adaptar contenido a otros idiomas o mercados.
- Videojuegos y mundos virtuales: voces de personajes generadas proceduralmente con personalidad y estado emocional variables.
- Agentes de voz para call centers: integracion con sistemas de telefono para gestionar consultas frecuentes con voz natural y personalizable.
- Prototipado rapido de experiencias de voz: disenadores de producto pueden generar muestras de voz para pruebas de usuario sin esperar a un estudio de grabacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la informacion disponible. La model card del autor indica que el modelo paso un gate de calidad de 320 clips (5 textos x {design, clone} x 8 semillas x 4 variantes) en una RTX 4090, evaluado con UTMOS22, DNSMOS, Whisper WER, resemblyzer speaker cosine, pyin F0 y words/s, sin que ninguna variante int4 fuera distinguible del bf16 mas alla del ruido entre semillas. La variante HQQ g64 obtuvo el menor WER en clonacion. No se proporcionan valores numericos de estas metricas.

En cuanto a rendimiento, la model card reporta una velocidad de 33,5 ms por frame de codec en modo design y 31,5 ms en modo clone, frente a 47,7 ms y 41,3 ms respectivamente para el modelo bf16. El consumo de VRAM tras warmup se reduce de 7,53 GiB a 5,20 GiB.

## Requisitos de hardware

- VRAM estimada: 5,20 GiB tras warmup en RTX 4090 (segun model card).
- GPU recomendadas: cualquier GPU con soporte sm_80+ (Ampere o superior), por ejemplo RTX 3090, RTX 4090, A100, H100. No funciona en GPUs anteriores a Ampere.
- Cabe en GPUs de consumo modernas con al menos 8 GiB de VRAM, como RTX 3060 Ti o superiores.
- Opciones de despliegue: requiere el loader especifico de `breeze-tts-runpod` (archivos `int4_tinygemm.py` y `load_packed.py`). No es compatible con `transformers` estandar ni con vLLM, llama.cpp u Ollama sin adaptacion.
- Latencia: 33,5 ms por frame de codec (aprox. 30 frames/s) en RTX 4090, suficiente para interaccion en tiempo real.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos TTS cuantizados comparables en la informacion proporcionada. El modelo base Breeze-TTS-2 se posiciona como lider entre los open-weight en el leaderboard de Artificial Analysis, superando a sistemas propietarios, pero no hay datos publicos de comparacion directa de esta variante int4 con otras cuantizaciones o modelos TTS de tamano similar.

## Limitaciones y advertencias

- No es un checkpoint `transformers` estandar: los 280 modulos cuantizados no tienen el atributo `.weight`, por lo que `transformers` los reporta como faltantes y los `.qweight`/`.scales_and_zeros` como inesperados. Requiere un loader especifico y el intercambio debe realizarse despues de `load_runtime` y antes de `Engine.warmup()`.
- Requiere GPU con sm_80+ (Ampere o superior); no funciona en arquitecturas anteriores.
- La cuantizacion solo cubre las capas lineales del backbone y depth decoder; el resto de componentes se mantienen en bf16, por lo que el ahorro de VRAM es parcial.
- No se han publicado datos sobre idiomas soportados ni sobre sesgos en la pronunciacion o alucinaciones de audio.
- La licencia Apache-2.0 permite uso comercial, pero el modelo derivado depende del loader propietario de `breeze-tts-runpod`, cuya licencia no se especifica en la informacion disponible.
- El error de cuantizacion, aunque bajo, puede acumularse en usos prolongados o con entradas atipicas; se recomienda validar en el caso de uso concreto.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mesmertech/Breeze-TTS-2-int4-hqq-g64
- Modelo base BreezeBlue/Breeze-TTS-2: https://huggingface.co/BreezeBlue/Breeze-TTS-2
- Repositorio GitHub de Breeze TTS: https://github.com/breezeblue-ai/breeze-tts
- Demo oficial en HuggingFace Space: https://huggingface.co/spaces/BreezeBlue/breeze-tts-2-demo
- Pagina web de BreezeBlue: https://breezeblue.ai/
- Pagina de presentacion de Breeze TTS 2: https://breezeblue.ai/breeze-tts-2
