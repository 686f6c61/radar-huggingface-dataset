# gustavecortal/philosophy-lm

## Resumen

philosophy-lm es un modelo de lenguaje causal de tipo base, entrenado desde cero por el desarrollador independiente gustavecortal sobre un corpus especializado en filosofia y psicologia. Con 112,7 millones de parametros totales (80M declarados por el autor, de los cuales 61M no corresponden a embeddings), se situa en la categoria de modelos pequenos, pero incorpora decisiones arquitectonicas poco habituales en esa escala: un embedding de n-gramas con 31M de parametros, atencion hibrida local/global y atencion con grouped-query attention.

El modelo no esta ajustado por instrucciones: su funcion es continuar texto en el registro de sus fuentes (enciclopedias, resenas de libros, Wikipedia, libros de dominio publico, manuales y paginas educativas). Su interes practico radica en que se distribuye acompanado de un motor WebAssembly de 8 bits que lo ejecuta en el navegador sobre CPU, con una degradacion de solo 0,2% en bits por byte respecto a float32.

Es relevante ahora como ejemplo reproducible de entrenamiento de un modelo pequeno y especializado con recursos muy limitados: el autor lo entreno en 15,2 horas sobre una unica GPU Intel Arc A770 de 16 GB, con licencia Apache 2.0 y pesos en safetensors. Para desarrolladores e investigadores resulta util como banco de pruebas de tecnicas de eficiencia (embeddings consultados en lugar de multiplicados, cuantizacion SmoothQuant, decodificacion con cache) y como modelo de dominio acotado para generacion de prosa filosofica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion hibrida local/global, SwiGLU y embedding de n-gramas |
| Parametros totales | 112.752.208 (80M declarados por el autor, 61M no-embedding, mas 31M de embedding de n-gramas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | 8 bits para matrices (escala por fila) y entradas (escala por token), 4 bits para la tabla de bigramas, bfloat16 para cache de claves y valores; pesos originales en float32 |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch); `core.bin` de 98 MB y `core.wasm` para el motor web |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 16 capas con dimension oculta de 576 y layout 4 x (3 x (atencion local -> SwiGLU) -> 1 x (atencion global -> SwiGLU)). La atencion local emplea 9 cabezas de 64 dimensiones con ventana de 256 tokens; la global usa 9 cabezas de consulta y 3 cabezas de clave-valor de 64 dimensiones, de las cuales 32 dimensiones de clave sin rotary embedding provienen del token anterior. Incorpora QK-norm y una puerta sigmoide sobre la salida de cada cabeza, con rotary embedding en 32 de las 64 dimensiones (base 10.000) y SwiGLU con dimension intermedia de 1.512. El tokenizer es un BPE a nivel de byte con vocabulario de 32.768, atado a la capa de salida.

La innovacion mas destacable es el embedding de n-gramas: una tabla hasheada de 245.760 filas de bigramas con 128 valores cada una (con patron de signo fijo ±1) que se suma a las primeras 128 dimensiones ocultas antes de cada bloque. Al leerse en lugar de multiplicarse, aporta 31M de parametros con coste computacional casi nulo. El entrenamiento uso 450,8 millones de tokens de filosofia y psicologia (26,8% Essential-Web, 30,9% FineWeb-Edu, 14,3% Gutenberg y Standard Ebooks, 6,5% Stanford Encyclopedia of Philosophy, 10,2% Wikipedia, 4,2% Notre Dame Philosophical Reviews, 3,0% PubMed Central, 2,3% Internet Encyclopedia of Philosophy y 1,9% textos de historia de la psicologia y manuales abiertos), con 1.450 millones de tokens objetivo en cuatro pasadas y cada documento leido como maximo cuatro veces. Se uso Muon (lr 0.005) para matrices ocultas y AdamW (lr 0.003) para el resto, con schedule coseno hasta el 10%, ventanas de 1.024 tokens que pasan a 2.048 a partir del primer cuarto, y mezcla final de pesos con su media movil exponencial del ultimo 17% del entrenamiento. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto por continuacion en registro enciclopedico y academico sobre filosofia y psicologia.
- Prosa argumentativa de dominio acotado: historia de la filosofia, teoria psicologica, resenas academicas y ensayo.
- Generacion condicionada por documento: cada documento se separa con el token de fin de texto y solo atiende a si mismo.
- Ejecucion en navegador sobre CPU mediante WebAssembly con SIMD y hasta cuatro hilos.
- Decodificacion con cache de claves y valores, procesando el prompt en bloques de 16 tokens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No es multilingue: solo ingles.

## Casos de uso

- Generacion de prosa filosofica de relleno: dado un titulo o un inicio de parrafo, el modelo continua en el registro de enciclopedias y resenas, util para prototipar interfaces de escritura asistida sin coste de API.
- Demostracion educativa de entrenamiento desde cero: el repositorio incluye `model.py`, `decode.py` y `generate.py`, lo que permite estudiar la implementacion completa de atencion hibrida y embedding de n-gramas en un modelo que cabe en 0,5 GB.
- Inferencia en el navegador sin servidor: con `core.bin` (98 MB) y `core.wasm` se puede ofrecer generacion de texto en una pagina web sin backend, a unas 250 tokens por segundo en un Intel Core i5-14400F con cuatro hilos.
- Banco de pruebas de cuantizacion: la comparacion publicada entre float32 (0,9349 bits por byte) y la forma web (0,9369) permite evaluar el impacto de SmoothQuant con alpha 0.7 y cuantizacion de 8 y 4 bits en un modelo pequeno.
- Generacion de datos sinteticos de dominio: util para aumentar corpus de filosofia y psicologia con texto estilisticamente coherente, siempre con revision humana por el riesgo de invencion de hechos.
- Investigacion sobre eficiencia de embeddings: la tabla de bigramas de 245.760 filas permite experimentar con representaciones consultadas en lugar de multiplicadas y medir su efecto en perplejidad.
- Prototipado de autocompletado en editores de texto tecnicos o academicos, limitado a ingles y a continuaciones de hasta 4.096 tokens.

## Benchmarks y rendimiento

| Medida | Valor |
|---|---|
| Split de test, 3.048 documentos en ventanas de 4.096 tokens | 0,9368 bits por byte |
| Validacion, 60 documentos (primeros 1.024 tokens), float32 | 0,9349 bits por byte |
| Mismos documentos, forma web (`core.bin`) | 0,9369 bits por byte |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta bits por byte sobre sus propios splits, sin comparacion con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,45 GB para los 112,7M de parametros; en 8 bits, alrededor de 0,12 GB mas overhead de cache.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y CPU.
- GPU de datacenter (A100, H100) innecesarias; el modelo se entreno en una Intel Arc A770 de 16 GB en 15,2 horas.
- Despliegue via PyTorch con safetensors, o mediante el motor WebAssembly propio (`core.wasm` y `core-plain.wasm` para navegadores sin SIMD).
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Throughput medido: unas 250 tokens por segundo en un Intel Core i5-14400F con cuatro hilos en el navegador; latencia no reportada de forma independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| philosophy-lm | 112,7M (61M no-embedding) | 4.096 | Apache 2.0 | Hugging Face y demo web | Base, solo ingles, dominio filosofia y psicologia, motor WASM propio |
| GPT-2 small | 124M | 1.024 | MIT | Hugging Face | Base generalista en ingles, sin atencion hibrida ni embedding de n-gramas |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Hugging Face | Base generalista multilingue con receta moderna, sin motor web |
| Pythia-160M | 160M | 2.048 | Apache 2.0 | Hugging Face | Base de investigacion con checkpoints intermedios, solo ingles |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un modelo base: continua texto y no sigue instrucciones ni responde preguntas.
- Inventa hechos, fechas y atribuciones con tono enciclopedico; el autor documenta que afirmo que la teoria de los suenos de Freud "fue introducida en 1890 por Wilhelm Roux".
- Tiende a repetirse y a perder el hilo argumental en continuaciones largas.
- Solo ingles; parte de sus fuentes son libros del siglo XIX y principios del XX, con las visiones de su epoca.
- El autor advierte explicitamente de no usarlo para fines medicos o psicologicos.
- Sin ajuste por instrucciones ni por preferencias humanas (no hay RLHF ni DPO documentado).
- Sin datos de sesgo sistematico mas alla de la advertencia sobre el sesgo de epoca de las fuentes.
- La licencia Apache 2.0 permite uso comercial, pero la calidad y fiabilidad del contenido generado no estan garantizadas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gustavecortal/philosophy-lm
- Demo en navegador: https://gustavecortal.com/philosophy-lm/
