# andrew-paul/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-KERN-GGUF

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-KERN-GGUF es un conjunto de cuatro cuantizaciones GGUF de precision mixta publicadas por el usuario andrew-paul sobre el modelo derivado DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, que a su vez parte de Qwen/Qwen3.8-27B. El modelo base tiene 26.895.998.464 parametros (unos 26,9 mil millones) y esta bajo licencia Apache-2.0. El repositorio ocupa 97,2 GB e incluye los cuatro niveles de cuantizacion, cada uno con variante con y sin cabeza MTP.

El problema que resuelve es concreto: obtener cuantizaciones que conserven la capacidad del BF16 original en lugar de optimizar unicamente la divergencia KL. Para ello, la cuantizacion se hizo directamente desde los safetensors BF16 de DavidAU con una imatrix nativa del modelo (calibration-v6) y asignaciones de tipo por tensor derivadas de un estudio de sensibilidad de varias rondas contra los propios logits BF16, sin reutilizar la receta de cuantizacion del Qwen3.8 base.

Es relevante ahora porque el prefijo `eq` denota equivalencia de capacidad con la receta estandar de ese nombre: eqQ4_K_M iguala la capacidad de un Q4_K_M estandar siendo 2,1 GB (12%) mas pequeno, y eqIQ2_M (9,58 GB) iguala a un Q3_K_S estandar 2,7 GB mayor. Ademas incorpora una cabeza MTP embebida para decodificacion especulativa y compatibilidad con un drafter externo DFlash 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card (modelo derivado de Qwen/Qwen3.8-27B; la cabeza MTP ocupa el bloque blk.64) |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; los ejemplos de la model card usan 16.384 tokens (`-c 16384`) |
| Tipos de cuantizacion | GGUF: eqQ4_K_M, eqQ3_K_M, eqQ3_K_S, eqIQ2_M; cada uno con variante `-noMTP`; cabeza MTP en Q3_K; cache KV en q8_0 o q4 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base esta en safetensors BF16 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base mas alla de su procedencia: es una cuantizacion derivada de DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, cuyo origen ultimo es Qwen/Qwen3.8-27B. El dato estructural que si aparece es la existencia de una cabeza de prediccion multi-token (MTP) embebida en el bloque `blk.64`, con precision Q3_K y un peso de 183 MB identico en los cuatro niveles. Esta cabeza habilita decodificacion especulativa interna (`--spec-type draft-mtp`) y puede eliminarse con las variantes `-noMTP` cuando se usa un drafter externo o ninguna especulacion.

No se trata de un reentrenamiento ni de un ajuste fino: el proceso descrito es exclusivamente de cuantizacion. Se parte de los safetensors BF16, se calcula una imatrix propia del modelo sobre el dataset de calibracion Qwen3.8 calibration-v6 de Bartowski, y se asignan tipos por tensor segun un estudio de sensibilidad de varias rondas contra los logits BF16 del propio modelo. El hallazgo principal del estudio es que la divergencia KL no predice la capacidad: cuantizaciones cercanas en KLD pueden quedar muy por detras en lo que el modelo acierta, y la sonda de capacidad revelo escalones duros que la KLD por si sola no muestra. Segun el autor, no es una recuantizacion ni un transplante ciego de la asignacion del Qwen3.8 base.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `text-generation` y `conversational`, con plantilla de chat habilitada via `--jinja`.
- Decodificacion especulativa integrada mediante cabeza MTP embebida, con longitud de borrador recomendada de 2 tokens (3 para eqQ4_K_M).
- Compatibilidad con especulacion externa: los archivos `-noMTP` funcionan con el drafter DFlash 2, que requiere una compilacion compatible de llama.cpp.
- Inferencia en CPU/GPU mediante llama.cpp, con soporte de Flash Attention (`--flash-attn on`) y cache KV cuantizada (q8_0 o q4).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas).
- Ejecucion sin especulacion: los cuatro archivos funcionan sin ningun tipo de decodificacion especulativa.
- Capacidades de vision: la model card advierte que el componente `mmproj` no se probo en este estudio y puede requerir validacion aparte; por tanto no se garantiza.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente conversacional local en GPU de 16 GB: con eqQ3_K_M (13,04 GB) o eqQ3_K_S (11,59 GB) el modelo entra en una tarjeta de 16 GB con `-ub 512` por defecto y 16k de contexto, lo que permite desplegar un chatbot multi-turno sin depender de servicios en la nube.
- Generacion de codigo asistida en estaciones de trabajo con GPU consumer: eqQ4_K_M ofrece el 95% de la capacidad del BF16 y es comodo en tarjetas de 24 GB, adecuado para tareas de autocompletado y refactorizacion dentro de un IDE.
- Procesamiento por lotes de documentos largos: usando cache KV en q4 se duplica aproximadamente el techo de contexto en tarjetas con memoria limitada, a cambio de unos 0,006 de KLD, lo que sirve para resumir o extraer informacion de documentos extensos en pipelines offline.
- Inferencia en el borde o en movil: eqIQ2_M (9,58 GB) ha sido confirmado funcionando en una GPU Adreno con 16 GB de LPDDR5 movil y una compilacion Turnip personalizada, a un par de tokens por segundo; util para demos portatiles o prototipos sin GPU dedicada.
- Maximizacion de throughput en servidor: servir con la cabeza MTP y longitud de borrador 2 (o 3 en eqQ4_K_M) reduce el coste por token, lo que resulta adecuado para APIs de generacion con muchos usuarios concurrentes y pocas opciones de escalado horizontal.
- Investigacion sobre cuantizacion: el repositorio incluye cuatro niveles medidos con KLD y con una sonda de capacidad, lo que permite estudiar empiricamente la relacion entre divergencia KL, precision efectiva y degradacion funcional comparando cada nivel contra el BF16.
- Despliegue con drafter externo: los archivos `-noMTP` junto con el drafter DFlash 2 permiten configurar decodificacion especulativa con otra politica de borrador cuando la cabeza interna no encaja en el presupuesto de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente aporta metricas internas de cuantizacion: capacidad relativa medida con una sonda privada de multiples muestras (porcentaje de aciertos respecto al BF16) y divergencia KL frente al BF16 sobre wikitext (200 fragmentos de 512 tokens, en conjunto reservado).

| Nivel | Tamano del archivo | Capacidad (vs. BF16) | KLD | Uso recomendado |
|---|---:|---:|---:|---|
| eqQ4_K_M | 14,73 GB | 95% | 0,028 | Maxima fidelidad |
| eqQ3_K_M | 13,04 GB | 91% | 0,042 | Alta fidelidad, cabe en 16 GB |
| eqQ3_K_S | 11,59 GB | 81% | 0,070 | Equilibrado |
| eqIQ2_M | 9,58 GB | 76% | 0,160 | El mas pequeno, pero sorprendentemente capaz |

Datos adicionales de rendimiento aportados por el autor:

| Metrica | Resultado |
|---|---|
| Longitud de borrador optima (eqQ3_K_M, eqQ3_K_S, eqIQ2_M) | 2 tokens |
| Longitud de borrador optima (eqQ4_K_M) | 3 tokens; n=3 decodifica un 1,9% mas rapido que n=2 |
| Penalizacion de n=3 en los tres niveles menores | entre un 1,9% y un 3,6% mas lento que n=2 |
| Coste de cache KV en q8 | ~0,002 de KLD; libera ~0,5 GB a 16k de contexto |
| Coste de cache KV en q4 | ~0,006 de KLD; aproximadamente duplica el techo de contexto en tarjetas limitadas de memoria |
| Penalizacion por desbordamiento a memoria del sistema (eqQ4_K_M en 16 GB) | decodificacion aproximadamente un 25% mas lenta; `-ub 256` recupera casi toda la velocidad de prompt, no la de decodificacion |
| Cabeza MTP | Q3_K, 183 MB, identica en los cuatro niveles; Q4_K y Q8_0 no resultaron mas rapidas; Q8_0 puede subir la aceptacion del borrador hasta ~3 puntos en el tronco mas debil probado, sin ganancia de velocidad; Q2_K fue el unico escalon de precision |
| Adreno (eqIQ2_M, Turnip personalizado, 16 GB LPDDR5) | un par de tokens por segundo |

## Requisitos de hardware

- VRAM estimada a 16k de contexto: unos 16 GB para eqQ4_K_M (justo en el limite de una tarjeta de 16 GB), 13,04 GB para eqQ3_K_M, 11,59 GB para eqQ3_K_S y 9,58 GB para eqIQ2_M.
- GPU recomendadas: eqQ4_K_M es comodo en tarjetas de 24 GB o en memoria unificada; los otros tres niveles caben en una tarjeta de 16 GB con `-ub 512` por defecto.
- Aviso especifico: si una tarjeta de 16 GB con eqQ4_K_M tambien alimenta el escritorio, el modelo desborda a memoria del sistema y la decodificacion cae aproximadamente un cuarto.
- eqQ4_K_M no cabe junto al drafter externo DFlash 2 en una tarjeta de 16 GB.
- Cabe en GPU de consumo: si, en los cuatro niveles; eqIQ2_M incluso en GPU integrada movil (Adreno con 16 GB de LPDDR5 y Turnip personalizado).
- Opciones de despliegue: llama.cpp mediante `llama-server`; las variantes `-noMTP` con DFlash 2 requieren una compilacion de llama.cpp compatible; el repositorio esta etiquetado como compatible con endpoints.
- Parametros de ejecucion sugeridos por el autor: `-ngl 99`, `-c 16384`, `-ctk q8_0 -ctv q8_0`, `--flash-attn on`, `--jinja`, `--parallel 1`.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo. Solo se documentan comparativas relativas (penalizacion de n=3 frente a n=2 y la perdida de ~25% por desbordamiento), ademas del par de tokens por segundo en Adreno con eqIQ2_M.

## Comparativa con modelos similares

No hay informacion disponible sobre otros modelos comparables de terceros. La comparacion posible dentro de la informacion facilitada es entre los cuatro niveles de este repositorio y las cuantizaciones publicadas del mismo modelo base que el autor dice haber probado.

| Alternativa | Tamano | Capacidad relativa | KLD | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| eqQ4_K_M (este repo) | 14,73 GB | 95% del BF16 | 0,028 | Apache-2.0 | HF, GGUF |
| eqQ3_K_M (este repo) | 13,04 GB | 91% del BF16 | 0,042 | Apache-2.0 | HF, GGUF |
| eqQ3_K_S (este repo) | 11,59 GB | 81% del BF16 | 0,070 | Apache-2.0 | HF, GGUF |
| eqIQ2_M (este repo) | 9,58 GB | 76% del BF16 | 0,160 | Apache-2.0 | HF, GGUF |
| Q4_K_M estandar (Radermacher) | ~16,8 GB (2,1 GB mayor) | equivalente a eqQ4_K_M | no disponible | Apache-2.0 | HF, GGUF |
| Q3_K_S estandar | ~12,3 GB (2,7 GB mayor) | equivalente a eqIQ2_M | no disponible | Apache-2.0 | HF, GGUF |
| Modelo base BF16 (DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1) | no disponible | 100% (referencia) | 0 | Apache-2.0 | HF, safetensors |

El autor afirma que, para cada cuantizacion publicada de CF27 que probo, existe un nivel KERN mas pequeno y al menos igual de capaz. Los tamanos de las filas de cuantizaciones estandar son estimaciones derivadas de las diferencias declaradas (2,1 GB y 2,7 GB) y no cifras publicadas en la model card.

## Limitaciones y advertencias

- La capacidad se midio con un banco de pruebas privado del autor: es una estimacion, no una puntuacion certificada ni reproducible de forma independiente.
- La divergencia KL no predice la capacidad segun el propio estudio, por lo que comparar niveles por KLD puede inducir a error; el autor senala que cuantizaciones intermedias que parecian buenas solo en KLD no superaron la suite de capacidad.
- El componente de vision (`mmproj`) no se probo en este estudio y puede necesitar validacion por separado.
- La medicion de KLD con cache KV en q4 se hizo en contexto corto; el error de cache puede acumularse en contextos mas largos.
- Con 0 descargas y 0 likes, el repositorio no tiene validacion de la comunidad; la unica verificacion externa citada es la ejecucion de eqIQ2_M en una GPU Adreno con una compilacion Turnip personalizada.
- El repositorio pesa 97,2 GB en total; descargar el conjunto completo no es necesario si solo se busca un nivel, pero conviene planificar el almacenamiento.
- No se declaran idiomas soportados ni sesgos conocidos; al ser una cuantizacion de un modelo derivado, hereda los sesgos y alucinaciones del modelo original, que no se documentan en la model card.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Licencia Apache-2.0, que permite uso comercial; aun asi, el modelo deriva de una cadena (andrew-paul sobre DavidAU sobre Qwen) y el usuario deberia verificar las condiciones de todos los eslabones.
- Las variantes con MTP requieren parametros especificos (`--spec-type draft-mtp`, `--spec-draft-n-max`); usar la longitud de borrador incorrecta degrada el rendimiento entre un 1,9% y un 3,6%.
- DFlash 2 exige una compilacion concreta de llama.cpp; no funciona con cualquier version.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andrew-paul/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-KERN-GGUF
- Modelo base derivado: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash 2: https://huggingface.co/andrew-paul/Qwen3.8-27B-DFlash2-Q3_K_M-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Grafica calidad frente a tamano (ruta relativa del repositorio): `assets/kern-quality-vs-size.svg`
- Hashes de los artefactos (ruta relativa del repositorio): `SHA256SUMS`
- Dataset de calibracion: Qwen3.8 calibration-v6 de Bartowski, citado en la model card sin enlace directo.
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo, su autor ni su modelo base.
