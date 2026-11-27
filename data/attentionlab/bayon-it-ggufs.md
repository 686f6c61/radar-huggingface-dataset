# attentionlab/bayon-it-ggufs

## Resumen

Bayon Instruct GGUF es una coleccion de conversiones y cuantizaciones en formato GGUF del modelo `attentionlab/bayon-it`, un modelo de lenguaje causal decoder-only de aproximadamente 109 millones de parametros especializado en jemer (khmer). Lo desarrolla AttentionLab y esta disenado para cubrir la generacion de texto en una lengua de bajos recursos como el jemer, donde la mayoria de los modelos multilingues genericos rinden de forma deficiente.

El modelo sigue la arquitectura Gemma (GemmaForCausalLM) con 28 capas, dimension oculta de 512 y atencion con query grouping (GQA) de 8 cabezas de atencion y 2 de valor. Se entreno previamente sobre 1.361 millones de tokens en jemer extraidos de FineWeb-2 y despues se ajusto por instrucciones con 18.000 ejemplos SFT destilados de Gemini mediante LoRA (r=16, alfa=32). El repositorio que nos ocupa no contiene los pesos originales en precision completa, sino tres ficheros GGUF listos para llama.cpp: BF16, Q8_0 y Q4_K_M.

Su relevancia actual reside en que democratiza el acceso a un modelo funcional de jemer en hardware muy modesto: el cuantizado Q4_K_M ocupa solo 64 MB y puede ejecutarse en CPU o en GPUs de gama baja, lo que facilita el despliegue en entornos con recursos limitados y en aplicaciones locales para comunidades jemerhablantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GemmaForCausalLM), 28 capas, hidden 512, GQA 8/2 cabezas |
| Parametros totales | 109.019.648 (~109M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (dimension de contexto de la arquitectura) |
| Tipos de cuantizacion | BF16 (16.00 BPW), Q8_0 (8.51 BPW), Q4_K_M (4.85 BPW) |
| Idiomas soportados | jemer (km) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (V3); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Gemma tal como la implementa `GemmaForCausalLM`: 28 capas, dimension oculta de 512, atencion con query grouping de 8 cabezas de atencion y 2 de valor, y una ventana de contexto de 8192 tokens. El tokenizador es un BPE especifico de jemer con 5.000 tokens y fallback a bytes, lo que permite representar cualquier caracter no cubierto por el vocabulario.

El preentrenamiento utilizo 1.361 millones de tokens en jemer procedentes de FineWeb-2. Sobre esa base se aplico un ajuste por instrucciones con 18.000 ejemplos SFT en jemer destilados de Gemini, mediante LoRA con rango 16 y alfa 32. El repositorio GGUF se genero con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp (build 0.5.0-dev, 2026-10-17), partiendo de una unica conversion a BF16 y preservando 57 tensores de normalizacion en f32. La mezcla Q4_K_M eleva a Q6_K los tensores de embeddings de tokens, `attn_v` y `ffn_down`, siguiendo el comportamiento por defecto de `llama-quantize`.

## Capacidades

- Generacion de texto causal en jemer, con soporte de instrucciones gracias al ajuste SFT.
- Razonamiento basico y respuesta a preguntas en jemer.
- Conversacion multi-turno dentro de la ventana de contexto de 8192 tokens.
- Tokenizador nativo de jemer con fallback a bytes para caracteres fuera de vocabulario.
- Ejecucion local en CPU y GPU mediante llama.cpp (CLI y servidor compatible con OpenAI).
- Capacidades multilingues: limitadas al jemer segun la model card (idioma declarado: km).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Atencion al cliente en jemer: el modelo puede gestionar conversaciones multi-turno dentro de sus 8192 tokens de contexto, desplegado con `llama-server` en un endpoint compatible con OpenAI para integrarse en un chatbot de soporte local.
- Asistentes locales sin conexion: al ocupar el Q4_K_M solo 64 MB, puede ejecutarse en portatiles, Raspberry Pi o dispositivos de gama baja para aplicaciones de asistencia textual en jemer sin depender de la nube.
- Generacion y resumen de contenido en jemer: redaccion de parrafos, resumenes de articulos o adaptacion de textos para publicaciones y boletines comunitarios.
- Educacion y aprendizaje del idioma: ejercicios de practica, explicaciones sencillas y generacion de ejemplos de frases en jemer para materiales didacticos.
- Prototipado e investigacion en lenguas de bajos recursos: base ligera para experimentos de ajuste fino, evaluacion de tecnicas de cuantizacion o comparacion con modelos multilingues mayores en tareas de jemer.
- Traduccion asistida y postedicion: apoyo a flujos de traduccion jemer-espanol o jemer-ingles donde el modelo genera borradores que un humano revisa, gracias a su bajo coste de inferencia.
- Procesamiento por lotes de bajo coste: clasificacion, etiquetado o generacion masiva de textos en jemer en entornos con CPU, donde un modelo de 109M es viable a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la model card original de `attentionlab/bayon-it` y a un blog del autor para los resultados de evaluacion (cultura e historia jemer, ratio de fuga de idioma), pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en BF16, 0,11 GB en Q8_0 y 0,06 GB en Q4_K_M, mas el overhead del contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en GPUs integradas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python y cualquier runtime compatible con GGUF V3 y arquitectura `gemma`; se requiere una version razonablemente reciente de llama.cpp.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; por el tamano del modelo (109M) se espera una latencia muy baja en CPU y practicamente instantanea en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo se situa en la categoria de modelos especializados en lenguas de bajos recursos de ~100M de parametros, pero no se han facilitado metricas que permitan una comparacion cuantitativa con alternativas como modelos multilingues genericos de mayor tamano o modelos especializados en jemer de otros autores.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Bayon Instruct GGUF | ~109M | 8192 | Apache-2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de muy pequeno tamano (~109M de parametros): su capacidad de razonamiento, conocimiento factual y coherencia en textos largos es limitada en comparacion con modelos de mayor escala.
- Riesgo de alucinacion: como todo modelo generativo, puede producir afirmaciones incorrectas, especialmente en temas factuales o de actualidad.
- Cobertura idiomatica restringida: la model card declara unicamente jemer (km); el rendimiento en espanol, ingles u otros idiomas no esta garantizado y probablemente sea deficiente.
- Datos de entrenamiento limitados: 1.361 millones de tokens de FineWeb-2 y 18.000 ejemplos SFT destilados de Gemini; puede heredar sesgos presentes en esas fuentes y en el modelo profesor.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones de los datos de origen (FineWeb-2 y destilacion de Gemini) si se usa en produccion.
- El repositorio contiene solo cuantizaciones GGUF; para reentrenar o reajustar hay que partir de los safetensors originales del repo base.
- Requiere una version reciente de llama.cpp compatible con GGUF V3 y la arquitectura `gemma`; versiones antiguas pueden no cargar los ficheros.
- No hay datos publicados de benchmarks en la informacion disponible, por lo que la evaluacion cualitativa previa a produccion es responsabilidad del integrador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/attentionlab/bayon-it-ggufs
- Modelo base (instruct): https://huggingface.co/attentionlab/bayon-it
- Modelo preentrenado: https://huggingface.co/attentionlab/bayon
- Dataset SFT: https://huggingface.co/datasets/attentionlab/bayon-sft
- Pesos originales: https://huggingface.co/attentionlab/bayon-it/blob/main/model.safetensors
- Tokenizador: https://huggingface.co/attentionlab/bayon-it/blob/main/tokenizer.model
- Vocabulario del tokenizador: https://huggingface.co/attentionlab/bayon-it/blob/main/tokenizer.vocab
- Blog del autor sobre rendimiento: https://panha-ai.vercel.app/news/2026-07-02
- Documentacion de formatos GGUF de llama.cpp: https://github.com/ggml-org/llama.cpp/docs/gguf.md
