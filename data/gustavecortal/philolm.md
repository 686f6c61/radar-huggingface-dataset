# gustavecortal/PhiloLM

## Resumen

PhiloLM es un modelo de lenguaje de tipo causal entrenado desde cero por el desarrollador independiente gustavecortal. Se especializa en la continuacion de textos con el registro propio de fuentes de filosofia y psicologia: enciclopedias, resenas de libros, Wikipedia, libros de dominio publico, manuales y paginas web educativas. No es un modelo instruido: es un modelo base que continua texto, no responde preguntas ni sigue instrucciones.

Arquitectonicamente es un transformer denso de 16 capas con una innovacion destacable: una tabla de embeddings de bigramas con hash de 245.760 filas que se suma a las primeras 128 dimensiones ocultas antes de cada bloque, aportando 31M de parametros que se leen en lugar de multiplicarse. Combina atencion local (ventana de 256 tokens) con atencion global con grouped-query attention, y emplea QK-norm y puertas sigmoideas por cabeza. El contexto es de 4.096 tokens y el vocabulario de 32.768 tokens con embeddings atados a la capa de salida.

Su relevancia actual reside en dos factores: por un lado, demuestra que es posible entrenar un modelo util de dominio especifico en 15,2 horas sobre una unica GPU de consumo (Intel Arc A770 de 16 GB); por otro, incluye un motor WebAssembly de 8 bits que permite ejecutarlo en el navegador a unas 250 tokens por segundo en un Intel Core i5-14400F con cuatro hilos. El modelo tiene 112,75 millones de parametros totales segun los pesos en safetensors (80M declarados por el autor, de los cuales 61M no corresponden a embeddings).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con atencion hibrida (local + global GQA), QK-norm, puertas sigmoideas y embedding de bigramas con hash |
| Parametros totales | 112.752.208 (safetensors); el autor declara 80M, de los cuales 61M no son de embedding, mas 31M de la tabla de bigramas |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | 8 bits por fila para matrices, 8 bits por token para entradas (SmoothQuant alpha 0.7), tabla de bigramas en 4 bits, claves y valores en bfloat16; pesos originales en float32 |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch); `core.bin` (98 MB) y `core.wasm` para el motor WebAssembly |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 16 capas con dimension oculta de 576. La disposicion es 4 x (3 x (atencion local -> SwiGLU) -> 1 x (atencion global -> SwiGLU)). La atencion local usa 9 cabezas de 64 dimensiones con ventana de 256 tokens; la global usa 9 cabezas de consulta y 3 cabezas de clave-valor de 64 dimensiones, con 32 de las 64 dimensiones de clave sin rotary embedding que provienen del token anterior. La dimension intermedia de SwiGLU es 1.512. El embedding de bigramas consiste en 245.760 filas de 128 valores con un patron de signo fijo de ±1, sumado a las primeras 128 dimensiones ocultas antes de cada bloque; al leerse en lugar de multiplicarse, su coste computacional es casi nulo. El tokenizador es un BPE a nivel de byte entrenado sobre el texto de entrenamiento.

El corpus de entrenamiento contiene 450,8 millones de tokens de filosofia y psicologia, con particiones de validacion y test de 8,6 millones de tokens cada una, separadas por obra para evitar fugas. La composicion es: paginas de Essential-Web sobre filosofia y psicologia (26,8%), FineWeb-Edu (30,9%), libros de Project Gutenberg y Standard Ebooks (14,3%), Stanford Encyclopedia of Philosophy (6,5%), Wikipedia de filosofia y psicologia (10,2%), Notre Dame Philosophical Reviews (4,2%), articulos de revision de PubMed Central con licencia CC BY (3,0%), Internet Encyclopedia of Philosophy (2,3%) y Classics in the History of Psychology, manuales abiertos y Noba (1,9%). El modelo se entreno sobre 1.450 millones de tokens objetivo en cuatro pasadas, con cada documento leido como maximo cuatro veces; la tercera pasada excluye FineWeb-Edu y la cuarta conserva enciclopedias, resenas, Wikipedia, manuales y la mitad de las obras filosoficas primarias. Las ventanas fueron de 1.024 tokens, ampliandose a 2.048 a partir de un cuarto del entrenamiento. Se uso Muon (learning rate 0.005) para las matrices ocultas y AdamW (0.003) para el resto, con un schedule coseno hasta el 10%. Los pesos publicados combinan a partes iguales los pesos finales con una media movil exponencial de los pesos del ultimo 17% del entrenamiento. El entrenamiento completo duro 15,2 horas (88.777 actualizaciones) en una sola Intel Arc A770 de 16 GB.

## Capacidades

- Generacion de texto por continuacion en registro enciclopedico y academico de filosofia y psicologia.
- Continuacion de documentos como documentos nuevos tras el token de fin de texto, tal como se entreno.
- Decodificacion con cache de claves y valores reutilizados por capa, token a token.
- Ejecucion en navegador mediante motor WebAssembly de 8 bits con hasta cuatro hilos y SIMD (con variante `core-plain.wasm` para navegadores sin SIMD).
- Manejo de contexto de 4.096 tokens con atencion aislada por documento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No esta instruido: no responde preguntas ni sigue instrucciones.
- Solo ingles.

## Casos de uso

- Generacion de texto filosofico de relleno para prototipos editoriales: el modelo continua fragmentos con el registro de enciclopedias y resenas, util para maquetar y probar flujos de publicacion antes de contar con contenido definitivo.
- Demostraciones educativas de modelos de lenguaje en el navegador: gracias a `core.wasm` y `core.bin` (98 MB), se puede desplegar una demo interactiva sin backend ni GPU, con unas 250 tokens por segundo en un i5-14400F con cuatro hilos.
- Investigacion sobre arquitecturas eficientes: la tabla de bigramas con hash y la atencion hibrida local/global son componentes reutilizables en experimentos academicos sobre modelos pequenos de dominio especifico.
- Estudio de recetas de entrenamiento de bajo coste: la combinacion de Muon y AdamW, el schedule coseno y la mezcla con media movil exponencial documentada permite reproducir el entrenamiento en hardware de consumo.
- Generacion de variaciones estilisticas de textos de psicologia historica: el corpus incluye obras de los siglos XIX y principios del XX, lo que permite explorar registros de esa epoca en ejercicios de historia de la psicologia.
- Prototipado de motores de inferencia en WebAssembly: el par `core.wasm`/`core-plain.wasm` y la cuantizacion SmoothQuant sirven como referencia para implementar inferencia en el navegador con perdida minima (0,2% de bits por byte respecto a float32).

## Benchmarks y rendimiento

| Medida | Valor |
|---|---|
| Test split, 3.048 documentos en ventanas de 4.096 tokens | 0,9368 bits por byte |
| Validacion, 60 documentos (primeros 1.024 tokens), float32 | 0,9349 bits por byte |
| Mismos documentos, forma de navegador (`core.bin`) | 0,9369 bits por byte |
| Throughput en navegador (Intel Core i5-14400F, 4 hilos) | ~250 tokens por segundo |
| Tiempo de entrenamiento | 15,2 horas (88.777 actualizaciones) en una Intel Arc A770 16 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 450 MB para los pesos (112,75M parametros x 4 bytes), mas cache de claves y valores y activaciones; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en la forma cuantizada a 8 bits: el fichero `core.bin` ocupa 98 MB, por lo que el modelo completo cabe en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entreno en una Intel Arc A770 de 16 GB, pero el modelo es mucho mas pequeno que la memoria disponible.
- Cabe en GPU consumer: si, en practicamente todas las tarjetas actuales (RTX 3050, RTX 4060, RTX 4090, Intel Arc, etc.).
- Opciones de despliegue: PyTorch nativo con `generate.py`, `decode.py` y `model.py`; motor WebAssembly propio (`core.wasm` / `core-plain.wasm`) para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~250 tokens por segundo en navegador con cuatro hilos en un Intel Core i5-14400F; no se documenta throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| PhiloLM | 112,75M (80M declarados + 31M bigramas) | 4.096 | Apache 2.0 | Dominio filosofia/psicologia, base, ejecucion en navegador |
| GPT-2 small | 124M | 1.024 | MIT | Base generalista en ingles |
| TinyLlama 1.1B | 1.100M | 2.048 | Apache 2.0 | Base/chat generalista |
| Pythia-160M | 160M | 2.048 | Apache 2.0 | Base de investigacion |

La comparacion con GPT-2 small y Pythia-160M es la mas directa por orden de magnitud. PhiloLM ofrece un contexto mayor (4.096 frente a 1.024-2.048), pero esta especializado en un dominio estrecho y no dispone de benchmarks estandar publicados que permitan comparar su rendimiento generalista. TinyLlama, con un orden de magnitud mas de parametros, no es comparable en coste de despliegue pero si como referencia de modelo base pequeno. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base: continua texto, no sigue instrucciones ni responde preguntas.
- Alucina hechos, fechas y atribuciones con seguridad enciclopedica; el autor documenta que afirmo que la teoria de los suenos de Freud "fue introducida en 1890 por Wilhelm Roux".
- Tiende a repetirse y a perder el hilo argumental en continuaciones largas.
- Solo ingles; no soporta castellano ni otros idiomas.
- El corpus incluye obras de los siglos XIX y principios del XX, con las visiones de su epoca, lo que puede reflejar sesgos historicos.
- El autor advierte explicitamente de no usarlo para fines medicos, psicologicos ni de otro tipo que requiera precision.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base sin instruccion, su integracion en productos requiere capas adicionales de control.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/gustavecortal/PhiloLM
- Demo en navegador: https://gustavecortal.com/philosophy-lm/
- Repositorio del modelo (incluye `generate.py`, `model.py`, `decode.py`): disponible en el propio repositorio de Hugging Face
