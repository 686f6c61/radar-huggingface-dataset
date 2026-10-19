# ATinyGreenCell/scadcoder-qwen3.5-9b-v11-seed1

## Resumen

scadcoder-qwen3.5-9b-v11-seed1 es un fine-tune por LoRA de Qwen3.5-9B especializado en la generacion de geometria parametrica en OpenSCAD para el proyecto Tiiny Pocket Lab: piezas y utillajes de laboratorio biologico descritos en lenguaje natural (o a partir de una imagen de referencia) que el modelo debe traducir a codigo OpenSCAD valido y fabricable. Lo publica el usuario ATinyGreenCell y se distribuye con licencia Apache 2.0 en formato transformers/safetensors.

El modelo conserva la arquitectura multimodal del base (`Qwen3_5ForConditionalGeneration`), es decir, mantiene el codificador de vision y el pipeline `image-text-to-text`, pero solo se han reentrenado y fusionado las capas de lenguaje mediante LoRA de rango 32. El resultado es un checkpoint de 9.653.104.368 parametros (unos 9,65 B) en bf16, con un repositorio de 19,3 GB.

Su relevancia es acotada pero clara: no es un modelo de proposito general, sino una variante de dominio (CAD-as-code) pensada para integrarse en un banco de pruebas automatico que compila el script generado y evalua el resultado. Es la semilla 1 de la version v11 de una serie iterativa, donde cada version incorpora los fallos de las anteriores como datos de entrenamiento. El autor indica explicitamente que debe ejecutarse con el modo de razonamiento (thinking) desactivado. No hay datos publicados de benchmarks ni de contexto maximo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal decoder-only (`Qwen3_5ForConditionalGeneration`), codificador de vision preservado y capas de lenguaje con LoRA fusionado |
| Parametros totales | 9.653.104.368 (9,65 B) segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos bf16 en safetensors (sin GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), libreria transformers |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 19,3 GB |
| Metodo de ajuste | LoRA rank 32, 3 epochs, batch efectivo 8, fusionado a bf16 |
| Modo de inferencia recomendado | razonamiento/thinking desactivado |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B: un transformer decoder-only con torre de vision, empaquetado bajo la clase `Qwen3_5ForConditionalGeneration`. El fine-tune no altera la topologia: se aplica LoRA de rango 32 sobre las capas de lenguaje, se entrena durante 3 epochs con batch efectivo 8 y posteriormente se fusionan los adaptadores en pesos bf16, de forma que en inferencia no hay coste adicional de adaptadores. El codificador de vision se mantiene intacto, lo que permite condicionar la generacion a imagenes de referencia.

El dataset de la version v11 (semilla 1) suma 14.164 filas. Parte de los datos de v9: 12.374 filas compuestas por ejemplos verificados, 1.500 reparaciones de informes multi-turno y 869 intentos fallidos del propio modelo v5, cada uno acompañado del informe del benchmark y del fichero de referencia. A esto se anade el llamado batch C para diez de sus 14 familias de piezas: 474 descripciones escritas por Claude Opus, cada una con su fichero verificado, mas 421 intentos fallidos de la propia semilla 1 de v9 sobre esas descripciones, tambien con informe y referencia; ambos bloques se incluyen dos veces. Los turnos fallidos se enmascaran de la loss, de modo que el modelo aprende de la correccion pero no reproduce el error. Cuatro familias del batch C (frustum riser, hinge leaf, spoked wheel y star wheel) se reservan para evaluacion, lo que constituye el unico esquema de validacion descrito. No se detalla la composicion del dataset original del modelo base.

## Capacidades

- Generacion de codigo OpenSCAD parametrico para piezas de laboratorio: solidos, utillajes, soportes y geometrias descritas mediante parametros.
- Reparacion iterativa de scripts: el modelo ha sido entrenado con informes de fallo de benchmark, por lo que aprende a corregir geometria no manifiestamente valida o codigo que no compila.
- Entrada multimodal: admite pares imagen-texto, lo que permite partir de una fotografia o croquis de la pieza junto a una descripcion.
- Conversacion multi-turno orientada a refinamiento de disenos (los datos incluyen 1.500 reparaciones de informes multi-turno).
- Razonamiento sobre restricciones geometricas y parametrizacion (dimensiones, tolerancias, relaciones entre componentes).
- Capacidad residual de modelo general de texto y codigo, heredada de Qwen3.5-9B, aunque el ajuste esta fuertemente sesgado al dominio.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita servir el modelo tras una API tipo OpenAI.
- Modo thinking disponible en el base pero desaconsejado para esta variante: el autor pide ejecutarlo con razonamiento desactivado.
- No se declaran capacidades de tool calling, agentes ni soporte multilingue especifico para este fine-tune.

## Casos de uso

- Generacion de utillajes de laboratorio biologico: dado un enunciado con cotas y funcion (por ejemplo, un soporte para placas Petri o una gradilla parametrica), el modelo emite un fichero `.scad` que se compila y se envia a impresion 3D; encaja porque todo su entrenamiento esta sesgado a esa familia de piezas.
- Reparacion automatica de scripts que fallan: en un pipeline de CI que compila OpenSCAD, cuando la geometria no es valida se le pasa al modelo el informe de error y el codigo original para que produzca una version corregida; el dataset incluye cientos de intentos fallidos con su informe, que es exactamente el formato de este bucle.
- Diseño asistido a partir de una imagen: usar la torre de vision para partir de la foto de una pieza existente y pedir una version parametrica editable, util en ingenieria inversa de utillajes sencillos.
- Iteracion conversacional de disenos: sesiones multi-turno donde el investigador ajusta diametros, alturas o numero de cavidades y el modelo reescribe el script conservando la estructura; los datos de reparacion multi-turno cubren este patron.
- Generacion masiva de variantes para busqueda de diseño: producir lotes de scripts parametricos variando parametros y filtrarlos con un compilador y un validador geometrico, como hace el banco de pruebas del autor.
- Educacion y prototipado en CAD-as-code: servir el modelo tras una API compatible para que estudiantes generen piezas y aprendan la relacion entre parametros y geometria.
- Dataset augmentation para CAD: usar el modelo para sintetizar pares descripcion-codigo que luego se filtran por compilacion correcta, alimentando futuras iteraciones del propio fine-tune.
- Evaluacion comparativa de fine-tunes: al ser una semilla concreta (seed 1) de una serie, sirve para estudiar la varianza entre semillas y el efecto de incorporar fallos propios al entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe un conjunto de evaluacion (las cuatro familias reservadas: frustum riser, hinge leaf, spoked wheel y star wheel) pero no reporta metricas numericas de ningun tipo, ni MMLU, ni HumanEval, ni tasas de compilacion correcta. Tampoco se ofrecen comparaciones con las versiones v5, v9 o v10 de la misma serie.

## Requisitos de hardware

- VRAM estimada en bf16: los pesos ocupan unos 19,3 GB, por lo que la inferencia completa requiere del orden de 21-24 GB incluyendo cache KV y el codificador de vision; una GPU de 24 GB (RTX 3090, RTX 4090, L4 24GB) es el minimo practico.
- VRAM estimada con cuantizacion: al no publicarse GGUF ni pesos de 8/4 bits, habria que convertir el checkpoint. Como referencia de orden de magnitud, 8 bits rondaria los 10-11 GB y 4 bits los 6-7 GB, mas overhead y torre de vision; son estimaciones, no datos del autor.
- GPU recomendadas: A100 40/80 GB o H100 para servir con concurrencia; L40S o A10G 24 GB para una instancia por modelo; RTX 4090/3090 para uso individual.
- Cabe en GPU de consumo: si, en RTX 4090 o 3090 a bf16 con contexto corto, y en GPUs de 12-16 GB solo tras cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers es la via soportada de forma nativa (es la libreria declarada); vLLM o TGI son viables al ser una arquitectura Qwen estandar, y llama.cpp/Ollama requeririan generar previamente un GGUF, que no existe en el repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones. A titulo orientativo, el pipeline incluye vision y generacion de codigo de cientos a miles de tokens por pieza, por lo que la latencia dependera mas de la longitud del script que del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| scadcoder-qwen3.5-9b-v11-seed1 | 9,65 B | no disponible | OpenSCAD parametrico (bio-lab) | Apache 2.0 | no disponible |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | Proposito general multimodal | Apache 2.0 (segun el base) | no disponibles en esta ficha |
| Qwen2.5-Coder-7B-Instruct | 7 B | 32.768 tokens (segun su model card publica) | Codigo general | Apache 2.0 | no aplica a este dominio |
| Llama 3.1 8B Instruct | 8 B | 131.072 tokens (segun su model card publica) | Proposito general | Licencia comunitaria Llama 3.1 | no aplica a este dominio |

La comparacion en calidad no puede establecerse: no hay ningun benchmark de generacion OpenSCAD publicado para este modelo ni para las alternativas propuestas. La diferencia real frente al base es la especializacion y el formato de entrenamiento (pares descripcion-codigo verificados mas reparaciones de fallos), no un salto medido de capacidad.

## Limitaciones y advertencias

- Dominio muy estrecho: el ajuste esta orientado a piezas de laboratorio biologico del proyecto Tiiny Pocket Lab; fuera de ese vocabulario y de esa familia de geometrias es esperable un rendimiento muy inferior al del modelo base.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora frente a v9 o v10, ni tasas de compilacion correcta, ni evaluacion de las cuatro familias reservadas.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion independiente por parte de la comunidad.
- Riesgo de alucinacion geometrica: un script puede compilar correctamente y aun asi producir una pieza no fabricable (paredes nulas, interferencias, cotas incoherentes). Requiere validacion con compilador y, preferiblemente, comprobacion dimensional.
- Modo thinking desactivado por indicacion del autor: usar razonamiento extendido puede degradar el formato de salida esperado.
- Idiomas no declarados: aunque el base sea multilingue, el fine-tune se ha entrenado con descripciones en ingles, por lo que el rendimiento en castellano no esta verificado.
- Contexto maximo no documentado: no se puede planificar el tamaño de las conversaciones o de los scripts largos con garantias.
- Sin pesos cuantizados oficiales: desplegar en GPUs pequenas exige convertir el modelo por cuenta propia, con el riesgo de degradar la calidad en un dominio donde los detalles numericos importan.
- Licencia Apache 2.0, permisiva para uso comercial, pero parte de los datos de entrenamiento son descripciones generadas por Claude Opus; conviene revisar las condiciones de uso de ese proveedor antes de explotar comercialmente el modelo derivado.
- El autor remite a la seccion 6.4 de su repositorio para los detalles de entrenamiento; esa documentacion es la unica fuente adicional y no ha sido verificada de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ATinyGreenCell/scadcoder-qwen3.5-9b-v11-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del banco de pruebas y detalles de entrenamiento (seccion 6.4): https://github.com/ATinyGreenCell/prompt-to-bench
- Otros enlaces (paper, blog, demo): no disponibles. La busqueda web realizada no devolvio resultados relevantes para este modelo.
