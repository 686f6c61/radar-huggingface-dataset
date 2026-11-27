# soKKett/futo-keyboard-lm-ru

## Resumen

FUTO Keyboard LM RU es un modelo de lenguaje transformer de pequeno tamano (36,35 millones de parametros) entrenado desde cero para la prediccion de la siguiente palabra en ruso dentro del teclado Android FUTO Keyboard. Lo desarrolla el usuario soKKett y replica la arquitectura y la especificacion de metadatos GGUF del modelo oficial en ingles de FUTO (`ml4`), de modo que puede importarse directamente en la aplicacion sin modificaciones del cargador nativo.

El modelo resuelve un problema muy concreto: la ausencia de un modelo transformer en ruso para el teclado FUTO, que hasta ahora solo distribuia un modelo en ingles. Con 36,35 M de parametros, 8 capas, dimension oculta de 512 y un vocabulario SentencePiece de 15.008 tokens, esta pensado para inferencia en dispositivo (on-device) en telefonos Android, con variantes cuantizadas de entre 23 MB y 71 MB.

Es relevante ahora porque demuestra que es posible entrenar un modelo de teclado especifico de idioma con un presupuesto muy reducido (1,18 mil millones de tokens en una unica RTX 5070 Ti en unos 76 minutos) y mantener compatibilidad estricta con el formato de metadatos `keyboardlm` de FUTO, lo que facilita la contribucion de la comunidad a idiomas no cubiertos oficialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (8 capas, hidden 512, FFN 1024 SwiGLU, 8 cabezas, head_dim 64, RoPE 10000, RMSNorm 1e-6, embeddings no atados) |
| Parametros totales | 36.348.416 (36,35 M, 75 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 (entrenado a 256) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, F16 (GGUF) |
| Idiomas soportados | Ruso (ru) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (tokenizer SentencePiece embebido como array UINT8) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estilo Llama, con 8 capas, dimension oculta 512, FFN de 1024 con activacion SwiGLU, 8 cabezas de atencion con head_dim 64, RoPE con base 10000, RMSNorm con epsilon 1e-6 y embeddings de entrada y salida no atados. El tokenizer es SentencePiece unigram con vocabulario de 15.008 tokens, configurado con `treat_whitespace_as_suffix=true` (formato `inverted_space`), `remove_extra_whitespaces=false`, `add_dummy_prefix=false` y `byte_fallback=true`; los tokens especiales son `<pad>=0`, `<s>=1`, `</s>=2`, `<unk>=3`. La arquitectura y el numero de tensores son identicos a los del modelo oficial ingles `ml4` de FUTO.

El entrenamiento se realizo sobre un corpus de aproximadamente 3,82 GB de texto UTF-8 limpio (unas 19,37 millones de lineas y 622,7 millones de tokens unicos), compuesto por Tatoeba Russian (sobremuestreado 3x), OPUS OpenSubtitles v2018 en ruso, FineWeb2 (`rus_Cyrl`) y Wikipedia en ruso. El presupuesto fue de 36.000 pasos x 32.768 tokens por paso, es decir, 1,18 mil millones de tokens (unas 1,89 epocas), en BF16 con `torch.compile`, LR coseno de 1e-3 a 5e-5 con 1.000 pasos de warmup y AdamW con weight_decay 0,05. El entrenamiento completo se ejecuto en una NVIDIA RTX 5070 Ti de 16 GB en unos 76 minutos (aproximadamente 262.000 tokens por segundo). Los metadatos `keyboardlm` declaran `base_v1 inverted_space lora_finetunable_v1`, y la feature `xbu_char_autocorrect_v1` se omite intencionadamente porque el cargador nativo C++ solo mapea pulsaciones ASCII A-Z.

## Capacidades

- Prediccion de la siguiente palabra sensible al contexto (`PredictNextWord`) en ruso, integrada en FUTO Keyboard.
- Rescoring contextual de sugerencias del diccionario (`rescoreSuggestions`) tanto para escritura por pulsacion como para deslizamiento (swipe).
- Personalizacion en dispositivo mediante LoRA (`lora_finetunable_v1`).
- Generacion de texto autorregresiva basica en ruso (pipeline `text-generation`), aunque su proposito real es la prediccion a corto plazo.
- Compatibilidad con metadatos GGUF de FUTO Keyboard, incluido el tokenizer SentencePiece embebido en formato UINT8.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada exclusivamente al ruso.

## Casos de uso

- Prediccion de siguiente palabra en teclado Android: el modelo se importa en FUTO Keyboard y sugiere la continuacion mas probable de la frase en tiempo real, con un coste de inferencia minimo gracias a sus 36,35 M de parametros y a las cuantizaciones de 23-38 MB.
- Rescoring de sugerencias en escritura por deslizamiento: al deslizar sobre el teclado, el modelo reordena las candidatas del diccionario segun el contexto previo, mejorando la precision frente a un diccionario puro.
- Correccion ortografica asistida: aunque no implementa `xbu_char_autocorrect_v1`, la combinacion del diccionario ruso `main_ru__experimental.dict` (unas 1,54 millones de formas) con el rescoring del transformer cubre la correccion en produccion.
- Personalizacion por usuario: la funcionalidad `lora_finetunable_v1` permite adaptar el modelo al estilo de escritura del usuario en el propio dispositivo sin enviar datos a la nube.
- Desarrollo de variantes linguisticas: sirve como plantilla reproducible para entrenar modelos de teclado en otros idiomas con el mismo formato de metadatos y el mismo cargador de FUTO.
- Investigacion sobre modelos de lenguaje ultracompactos: con 36,35 M de parametros y metricas de validacion publicadas (perplexity 26,88), es un banco de pruebas asequible para experimentos de tokenizacion con sufijo de espacios y evaluacion de next-token accuracy.
- Aplicaciones de demostracion educativas: prediccion de texto en ruso en entornos con recursos muy limitados (telefonos de gama baja, Raspberry Pi) mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

Metricas de validacion retenida publicadas por el autor (10.000 lineas estratificadas):

| Metrica | Valor |
|---|---|
| Eval loss | 3,2916 |
| Perplexity | 26,88 |
| Next-token accuracy top-1 | 35,9% |
| Next-token accuracy top-5 | 58,0% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no tendria sentido evaluarlos en un modelo de este tamano y proposito.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en todas las cuantizaciones (F16 ~71 MB, Q8_0 ~38 MB, Q6_K ~30 MB, Q4_K_M ~23 MB).
- GPU recomendadas: cualquier GPU es sobredimensionada; el caso de uso objetivo es CPU en Android. Para entrenamiento, el autor uso una RTX 5070 Ti de 16 GB.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU; tambien en telefonos Android de gama media y baja.
- Opciones de despliegue: FUTO Keyboard (cargador nativo C++), llama.cpp y sus derivados (Ollama, etc.) para pruebas en escritorio.
- Latencia y throughput: el autor reporta aproximadamente 262.000 tokens por segundo durante el entrenamiento en una RTX 5070 Ti; no se publican cifras de latencia de inferencia en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| soKKett/futo-keyboard-lm-ru | 36,35 M | 2048 | CC BY-SA 4.0 | Prediccion de teclado en ruso |
| FUTO `ml4` (oficial, ingles) | 36,35 M | no disponible | no disponible | Prediccion de teclado en ingles |
| Modelos de teclado de Google (Gboard) | no disponible | no disponible | propietaria | Prediccion de teclado multilingue |

No se dispone de datos publicos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo cubre ruso; no es util para otros idiomas ni para traduccion.
- Esta disenado para prediccion a corto plazo (siguiente palabra y rescoring), no para generacion de texto largo; su contexto de entrenamiento fue de solo 256 tokens, aunque el maximo declarado sea 2048.
- Riesgo de alucinacion y de sugerencias gramaticalmente plausibles pero semanticamente incorrectas, inherente a un modelo de 36 M de parametros.
- No implementa `xbu_char_autocorrect_v1`, por lo que la correccion ortografica depende del diccionario externo y del rescoring.
- La licencia CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas; conviene revisar su compatibilidad antes de un uso comercial.
- El corpus incluye OpenSubtitles, con posible presencia de lenguaje coloquial y sesgos de dominio; no se han publicado analisis de sesgo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y su creador no es el equipo oficial de FUTO; la validacion en la app oficial la reporta el propio autor.
- El repositorio ocupa 0,2 GB y las fechas de creacion y actualizacion son muy proximas, lo que sugiere una publicacion reciente sin historial de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/soKKett/futo-keyboard-lm-ru
- FUTO Keyboard: https://keyboard.futo.org/
- Diccionario ruso Helium314: https://codeberg.org/Helium314/aosp-dictionaries/raw/branch/main/dictionaries/main_ru__experimental.dict
- Tatoeba: https://tatoeba.org/
- OPUS OpenSubtitles v2018: https://opus.nlpl.eu/OpenSubtitles-v2018.php
- FineWeb2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Wikipedia en ruso: https://huggingface.co/datasets/wikimedia/wikipedia
