# JoaoZaokk/fish-s2-pro-quantized

## Resumen

`JoaoZaokk/fish-s2-pro-quantized` es un repositorio de pesos cuantizados del modelo de sintesis de voz (text-to-speech) `fishaudio/s2-pro`, publicado por el usuario JoaoZaokk. No es un modelo nuevo ni un fine-tuning: son los pesos del modelo base (revision `1de9996`) convertidos a int8 e int4 y redistribuidos en un formato de almacenamiento compacto, acompanados de un test ciego de escucha en portugues brasileno. El repositorio existe para reducir el coste de descarga y disco del modelo original, que en bf16 ocupa 8,50 GiB, dejandolo en 4,74 GiB (int8) o 3,20 GiB (int4).

La arquitectura subyacente es la de Fish Speech (`s2-pro`), compuesta por un modulo autorregresivo lento (Slow AR) de 36 capas y un modulo autorregresivo rapido (Fast AR) de 4 capas. La cuantizacion afecta a 200 capas lineales (`wqkv`, `wo`, `w1`, `w2`, `w3`); los embeddings de tokens (tambien la cabeza de salida atada), todas las normalizaciones y la cabeza de salida del Fast AR se mantienen en bf16. El propio autor advierte de que esta cuantizacion **no reduce la VRAM**: los ficheros son un formato de almacenamiento que se reconstruye a un checkpoint bf16 estandar antes de usarse.

Su relevancia es doble. Por un lado, aporta pesos int8 e int4 utilizables en un modelo TTS que no suele distribuirse cuantizado. Por otro, documenta un test ciego controlado con cuatro combinaciones (bf16, W8A8, W4A16 y W4A8) cuyo resultado principal es que W8A8 y W4A16 no muestran diferencias audibles, mientras que W4A8 produce errores de fonema en 3 de cada 10 textos. La licencia, sin embargo, restringe el uso a investigacion y entornos no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Slow AR (36 capas) + Fast AR (4 capas), text-to-speech tipo Fish Speech |
| Parametros totales | no disponible (los pesos bf16 originales ocupan 8,50 GiB) |
| Longitud de contexto | no aplica / no disponible (modelo TTS, no genera texto) |
| Tipos de cuantizacion | int8 por canal de salida; int4 asimetrica, grupo 128, round-to-nearest sin calibracion |
| Idiomas soportados | portugues (probado exclusivamente en portugues brasileno) |
| Licencia | Fish Audio Research License (solo investigacion y uso no comercial) |
| Formato de pesos | safetensors (con fichero `.quant.json` por archivo) |

Datos adicionales: los 200 tensores cuantizados se acompanan de un fichero `.quant.json` que lista cada tensor y su formato. La cuantizacion de activaciones a int8 no esta almacenada en ningun fichero, sino que se aplica en tiempo de ejecucion mediante `activation_int8.py`.

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. El repositorio contiene unicamente pesos cuantizados *post-training* del modelo `fishaudio/s2-pro`, obtenidos sin LoRA ni fine-tuning. La cuantizacion se aplica a las 200 capas lineales (`wqkv`, `wo`, `w1`, `w2`, `w3`) de los dos modulos autorregresivos, mientras que los embeddings de tokens, las normalizaciones y la cabeza de salida del Fast AR permanecen en bf16. El fichero int4 usa cuantizacion asimetrica en grupos de 128 con redondeo al mas cercano (round-to-nearest), **sin calibracion** tipo AWQ o GPTQ, lo que el autor describe explicitamente como el peor caso para 4 bits.

La innovacion tecnica del repositorio no esta en la arquitectura, sino en la metodologia de evaluacion y en el formato. Se distinguen dos ficheros y cuatro "brazos" experimentales: el modo de activaciones (bf16 o int8) es una eleccion en tiempo de ejecucion, no un fichero separado, por lo que W4A8 seria byte-identico al fichero int4. Las activaciones int8 se **simulan** redondeando la entrada de cada capa lineal cuantizada a int8 por fila (los numeros de un GEMM int8 por token), sin que exista un kernel int8 real ni ganancia de velocidad asociada. Los pesos reconstruidos a bf16 son, segun el autor, bit-identicos a los checkpoints usados en el test (358 tensores, ambos ficheros, verificados).

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto, en portugues brasileno.
- Reconstruccion a un checkpoint bf16 estandar que `fish-speech` carga sin modificaciones, mediante `reconstruct_bf16.py`.
- Descarga de `config.json`, tokenizer y `codec.pth` desde el repositorio oficial en una revision fijada (`1de9996`).
- Uso con una referencia de voz y una semilla fija (el test empleo una unica voz de referencia de la comunidad).
- Modos de cuantizacion seleccionables: int8 de pesos con activaciones bf16 o int8; int4 de pesos con activaciones bf16 o int8.
- Simulacion de numerica int8 por token en las capas lineales cuantizadas (sin aceleracion real).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene vision, audio de entrada ni modo "thinking".

## Casos de uso

- **Investigacion en cuantizacion de modelos TTS**: el repositorio sirve como caso de estudio reproducible de como la cuantizacion int8 e int4 afecta a la calidad de sintesis de voz, con y sin cuantizacion de activaciones.
- **Comparacion de esquemas W8A8, W4A16 y W4A8**: permite reproducir el test ciego del autor y verificar que W8A8 y W4A16 no degradan la salida de forma audible, mientras que W4A8 introduce errores de fonema.
- **Distribucion con menor coste de disco y ancho de banda**: en entornos de investigacion, los ficheros de 4,74 GiB (int8) o 3,20 GiB (int4) reducen la descarga frente a los 8,50 GiB del original, siempre que se acepte reconstruir a bf16 antes de inferir.
- **Generacion de voz en portugues brasileno para prototipos no comerciales**: usando el modo W8A8 o W4A16, el modelo produce audio indistinguible del bf16 en el test realizado, lo que resulta adecuado para demos y validaciones internas de investigacion.
- **Evaluacion de calidad de audio asistida por ASR**: el repositorio documenta el uso de Whisper large-v3-turbo para comparar transcripciones entre brazos, una metodologia reutilizable para medir degradacion en TTS.
- **Deteccion de fallos sutiles de cuantizacion**: la combinacion de pesos int4 y activaciones int8 (W4A8) produce errores de un solo fonema que el ASR normaliza y no detecta, por lo que el caso de uso incluye auditoria manual mediante escucha ciega.
- **Reconstruccion y reempaquetado de pesos**: util para quien necesite transformar un checkpoint cuantizado en un directorio bf16 compatible con la herramienta oficial de Fish Speech.

## Benchmarks y rendimiento

Se han publicado resultados en la model card. Se reproducen a continuacion.

Test ASR (72 textos, 24 familias, transcritos con Whisper large-v3-turbo):

| Brazo | Transcripcion exacta + casi exacta | Valor erroneo (numero/entidad) | Audio total |
|---|---|---|---|
| bf16 | 79,2% | 4/72 | 368,3 s |
| W8A8 | 79,2% | 4/72 | 367,7 s |
| W4A8 | 82,0% | 3/72 | 378,2 s |
| W4A16 | 77,8% | 5/72 | 376,5 s |

El autor senala que el ASR no separa los brazos (1-2 clips de 72) y que incluso clasifico W4A8 como el mejor. El unico indicio: ambos brazos de 4 bits generaron audio un ~2,5% mas largo.

Test ciego de escucha (10 textos × 4 brazos, orden aleatorizado por texto):

| # | bf16 | W8A8 | W4A16 | W4A8 |
|---|---|---|---|---|
| 1 | ok | ok | ok | ok |
| 2 | ok | ok | ok | ok |
| 3 | ok | ok | ok | ok |
| 4 | ok | ok | ok | ok |
| 5 | ok | ok | ok | "setentes" en vez de "setenta" |
| 6 | fallo a los 6-7 s | ok | ok | ok |
| 7 | ok | ok | ok | "batiu" en vez de "bateu" |
| 8 | ok | ok | ok | ok |
| 9 | ok | ok | ok | ok |
| 10 | ok | ok | ok | "E igual a zero" en vez de "M igual a zero" |

El autor indica que todos los errores atribuibles a la cuantizacion recayeron en W4A8 (3/10 textos) y que W8A8 y W4A16 no presentaron ninguno. El defecto del brazo bf16 (texto 6) procede del muestreo, no de la cuantizacion. En el texto 3 los cuatro brazos dijeron "registado" (forma del portugues europeo) en lugar de "registrado", rasgo del modelo base. El propio autor califica el resultado de "senal fuerte, no prueba" dado el tamano de muestra (3/10 frente a 0/10). W8A16 no se probo.

## Requisitos de hardware

- **VRAM**: la cuantizacion **no reduce la VRAM**. Los ficheros son un formato de almacenamiento compacto que se reconstruye a un checkpoint bf16; tras la reconstruccion, el consumo de memoria es el del modelo original. No se especifica una cifra exacta de VRAM en la informacion disponible.
- **GPU recomendadas**: no disponibles en la informacion proporcionada. Al ejecutarse en bf16 tras la reconstruccion, la exigencia depende del modelo base `s2-pro`.
- **Consumer GPU**: no disponible; el autor no documenta el hardware empleado ni si cabe en GPU de consumo.
- **Aceleracion por cuantizacion**: no existe. Las activaciones int8 se simulan en PyTorch (`activation_int8.py`) y no se probo ningun kernel int8 real, por lo que int8/int4 **no aporta ningun aumento de velocidad** en este repositorio.
- **Opciones de despliegue**: `fish-speech` (repositorio oficial) cargando el checkpoint bf16 reconstruido con `reconstruct_bf16.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. El unico dato temporal es la duracion del audio generado (entre 367,7 s y 378,2 s para 72 textos), que no equivale a latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Cuantizacion | Idiomas | Licencia |
|---|---|---|---|---|---|
| `JoaoZaokk/fish-s2-pro-quantized` | no disponible | 3,20-4,74 GiB | int8 per canal, int4 g128 RTN | pt (probado pt-BR) | Fish Audio Research (solo investigacion) |
| `fishaudio/s2-pro` (original) | no disponible | 8,50 GiB bf16 | bf16 | no disponible | Fish Audio Research (comercial requiere licencia aparte) |
| Otras alternativas TTS cuantizadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de otros modelos comparables (parametros, contexto o rendimiento de alternativas como XTTS, Bark u otros TTS), por lo que la comparativa se limita al modelo base del que deriva este repositorio.

## Limitaciones y advertencias

- **Licencia restrictiva**: los ficheros son modificaciones de los "Fish Audio Materials" redistribuidas bajo la Fish Audio Research License. Uso exclusivo de investigacion y no comercial; cualquier uso comercial requiere una licencia aparte de Fish Audio.
- **Derechos de terceros**: todos los derechos sobre el modelo original pertenecen a 39 AI, INC. / Fish Audio. El repositorio no esta afiliado, patrocinado ni respaldado por Fish Audio.
- **No ahorra VRAM**: solo reduce descarga y disco. Tras reconstruir a bf16, el modelo ocupa lo mismo que el original.
- **Cuantizacion sin calibracion**: el fichero int4 usa round-to-nearest sin AWQ ni GPTQ, lo que el autor describe como el peor caso para 4 bits.
- **Combinacion W4A8 rota**: pesos int4 con activaciones int8 produce errores de un solo fonema en 3 de 10 textos, fallo que el ASR no detecta porque normaliza la transcripcion.
- **Activaciones int8 simuladas**: no implican aceleracion real ni se probo un kernel int8 de produccion.
- **Cobertura linguistica limitada**: solo se probo portugues brasileno. El ingles no se probo. El modelo base, ademas, puede producir formas del portugues europeo (por ejemplo, "registado" en lugar de "registrado").
- **Tamano de muestra pequeno**: el test ciego cubre 10 textos y una sola voz de referencia; el autor lo califica de senal fuerte, no de prueba concluyente.
- **Riesgo de alucinacion / errores de fonema**: la cuantizacion int4+int8 puede alterar fonemas concretos, y estos errores son dificiles de detectar automaticamente.
- **Ficheros incompletos**: `codec.pth`, `config.json` y el tokenizer no estan incluidos; deben descargarse del repositorio oficial en la revision `1de9996`.
- **Descargas y likes nulos**: el repositorio no tiene uso registrado en el momento de la consulta, y las fechas de creacion y actualizacion (26-09-2026) son posteriores a la fecha habitual de publicacion, dato que conviene verificar antes de confiar en el material.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/fish-s2-pro-quantized
- Modelo base: https://huggingface.co/fishaudio/s2-pro
- Repositorio oficial de Fish Speech: https://github.com/fishaudio/fish-speech
- Licencia (referenciada en el repositorio): `LICENSE.md`
- Aviso de modificaciones (referenciado): `NOTICE.txt`
- Script de activaciones int8 (referenciado): `activation_int8.py`
- Script de reconstruccion a bf16 (referenciado): `reconstruct_bf16.py`
