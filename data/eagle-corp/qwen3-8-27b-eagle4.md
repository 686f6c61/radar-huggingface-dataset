# EAGLE-Corp/Qwen3.8-27B-EAGLE4

## Resumen

EAGLE-Corp/Qwen3.8-27B-EAGLE4 es un modelo borrador (*draft model*) de decodificación especulativa, no un modelo generativo autónomo. Lo publica EAGLE-Corp (Eagle AI Team) como componente auxiliar del modelo objetivo Qwen3.8-27B: su función es proponer secuencias de tokens candidatas que el modelo grande verifica después, de modo que se reduzca el número de pasos de decodificación autoregresiva necesarios para producir la misma salida. El checkpoint tiene 3.089.075.200 parámetros (unos 3,09 mil millones) en safetensors y ocupa 6,2 GB en el repositorio.

La propuesta técnica de EAGLE-4, cuarta generación de la familia *Extrapolation Algorithm for Greater Language-model Efficiency*, es un único borrador flexible que adapta dinámicamente su estrategia de especulación a distintos tamaños de lote, plataformas de hardware y cargas de trabajo, en lugar de requerir un borrador distinto por configuración. Según la model card, en el split cualitativo de SPEED-Bench con Qwen3.8-27B, concurrencia 1 y 4 GPU NVIDIA B300 con TP=4, el modelo alcanza 863,8 tokens/s a temperatura 0 (3,59× frente a la decodificación vanilla) y 608,6 tokens/s a temperatura 1 (2,59×).

Es relevante ahora porque el coste de servir modelos de 27B en producción está dominado por la latencia de decodificación, y la decodificación especulativa es una de las pocas optimizaciones que acelera la inferencia sin alterar la distribución de salida del modelo objetivo, gracias a la verificación. Ahora bien, el checkpoint por sí solo no genera texto: exige el código de EAGLE-4 y los pesos de Qwen3.8-27B, y su licencia es específica (*eagle-4*, catalogada como `other`), por lo que hay que revisar tanto la licencia del borrador como la del modelo base antes de usarlo comercialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no describe la arquitectura interna; las etiquetas del repositorio incluyen `llama` y `eagle-4`. Es un modelo borrador para decodificación especulativa, no un transformer generativo completo |
| Parametros totales | 3.089.075.200 (3,09 B), dato real de los safetensors |
| Parametros activos | No aplica: la informacion disponible no describe una arquitectura MoE |
| Longitud de contexto | No disponible. Como borrador, opera sobre el contexto y las features del modelo objetivo Qwen3.8-27B; la model card no declara ventana propia |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors (bf16); no se listan variantes GGUF, AWQ, GPTQ ni INT4 |
| Idiomas soportados | No disponible. La cobertura linguistica depende del modelo objetivo Qwen3.8-27B |
| Licencia | `eagle-4` (identificador `other`), con texto en https://github.com/eagle-hq/EAGLE-4/blob/main/LICENSE. Sujeto ademas a la licencia de los pesos de Qwen3.8-27B |
| Formato de pesos | safetensors |
| Modelo objetivo | Qwen3.8-27B |
| Funcion | Borrador de decodificacion especulativa (EAGLE-4); no es un modelo de generacion de texto autonomo |
| Tamano del repositorio | 6,2 GB |
| Descargas / likes | 697 / 12 |
| Fecha de creacion | 2026-10-07 (actualizado 2026-10-19) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del borrador ni el proceso de entrenamiento: la model card no indica número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineación. Lo que sí se declara es su posición en el pipeline de inferencia: EAGLE-4 actúa como proponente de tokens dentro de un esquema de decodificación especulativa, y el modelo objetivo verifica cada propuesta, de forma que la distribución de salida se mantiene. El checkpoint, por tanto, no se entrena para responder instrucciones sino para predecir continuaciones compatibles con las features del target.

La innovación declarada por el autor es el "único borrador flexible": un solo modelo que ajusta dinámicamente su estrategia de especulación según el tamaño de lote, el hardware y la carga de trabajo, frente a la práctica habitual de entrenar y desplegar borradores especializados por escenario. La model card no aporta detalles adicionales sobre el mecanismo de adaptación (por ejemplo, longitud del árbol de borrador, número de capas o tipo de cabezas predictivas), y remite al paper de EAGLE-4 para la descripción técnica completa. La evaluación publicada usa el mismo motor de inferencia para todos los métodos comparados, con MegaKernel desactivado, para aislar el efecto del algoritmo de especulación.

## Capacidades

- Proposicion de tokens candidatos para decodificacion especulativa sobre Qwen3.8-27B, con verificacion posterior por parte del modelo objetivo.
- Adaptacion dinamica de la estrategia de especulacion a distintos tamanos de lote, plataformas de hardware y cargas de trabajo, segun la descripcion del autor.
- Funcionamiento estable en regimen determinista (temperatura 0) y en muestreo estocastico (temperatura 1), con tasas de aceleracion distintas en cada caso.
- Mantenimiento de la distribucion de salida del modelo objetivo gracias al paso de verificacion, que acepta o rechaza cada propuesta.
- No soporta tool calling, function calling, uso como agente ni razonamiento multi-paso por si mismo: esas capacidades, si existen, residen en Qwen3.8-27B.
- No dispone de modo thinking, vision, audio ni otras modalidades declaradas.
- No es un modelo de generacion de texto autonomo y no debe invocarse sin el target y sin el codigo de EAGLE-4.

## Casos de uso

- Servicio de chat interactivo sobre Qwen3.8-27B: el borrador propone varios tokens por paso y el target los verifica, lo que reduce el tiempo hasta el primer token completado en conversaciones multi-turno. Es el escenario con mayor ganancia segun los datos publicados (3,59× a temperatura 0).
- Reduccion de coste por token en infraestructura GPU de gama alta: pasar de 240,5 a 863,8 tokens/s en el mismo hardware (4× B300, TP=4) multiplica por 3,59 la cantidad de peticiones servidas por hora con la misma flota.
- Autocompletado de baja latencia en editores e IDE: a temperatura 0 y con salidas cortas, el regimen determinista aprovecha al maximo la tasa de aceptacion del borrador, que es donde EAGLE-4 reporta la mayor ventaja frente a alternativas.
- Generacion creativa con muestreo: a temperatura 1 el modelo mantiene una aceleracion de 2,59× (608,6 frente a 234,9 tokens/s), lo que permite ofrecer sampling estocastico sin degradar la experiencia de usuario.
- Pipelines de agentes con generaciones largas: la evaluacion se realizo con longitud maxima de salida de 4096 tokens; en tareas con razonamiento encadenado o sintesis de documentos largos, el ahorro absoluto de tiempo por peticion crece con la longitud generada.
- Serving con alta concurrencia y lotes variables: la propuesta de valor de EAGLE-4 es un unico borrador que se adapta a distintos batch sizes, lo que simplifica el despliegue en clusteres donde la carga oscila entre peticiones sueltas y picos de trafico.
- Evaluacion comparativa de tecnicas de aceleracion: el checkpoint sirve como referencia reproducible frente a DFlash 2, DSpark y MTP sobre SPEED-Bench, util para equipos que esten decidiendo su stack de inferencia.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de throughput en el split cualitativo de SPEED-Bench con Qwen3.8-27B, concurrencia 1, 4× NVIDIA B300 (TP=4), longitud maxima de salida 4096 tokens y MegaKernel desactivado. Las aceleraciones son relativas a la decodificacion vanilla. No hay resultados de MMLU, HumanEval, GSM8K ni de calidad, porque el borrador no se evalua como modelo generativo.

Temperatura T=0:

| Metodo | Tokens/s | Aceleracion |
|---|---:|---:|
| EAGLE-4 | 863,8 | 3,59× |
| DFlash 2 | 672,6 | 2,80× |
| DSpark | 618,6 | 2,57× |
| MTP | 534,5 | 2,22× |
| Vanilla | 240,5 | 1,00× |

Temperatura T=1:

| Metodo | Tokens/s | Aceleracion |
|---|---:|---:|
| EAGLE-4 | 608,6 | 2,59× |
| DFlash 2 | 560,3 | 2,39× |
| DSpark | 519,4 | 2,21× |
| MTP | 369,1 | 1,57× |
| Vanilla | 234,9 | 1,00× |

No se han publicado tasas de aceptacion, latencia por peticion ni resultados a concurrencia mayor que 1. Tampoco hay mediciones en otros hardware distintos de 4× B300.

## Requisitos de hardware

- Pesos del borrador: 3,09 B parametros en safetensors, 6,2 GB de repositorio; en bf16 suponen aproximadamente 6,2 GB de VRAM solo para los pesos, a los que hay que sumar cache KV y activaciones del propio borrador.
- Modelo objetivo: Qwen3.8-27B en bf16 requiere del orden de 54 GB de VRAM (estimacion a 2 bytes por parametro), adicionales a los del borrador. El conjunto supera los 60 GB en bf16.
- GPU recomendadas: NVIDIA B300 es la plataforma validada en la model card (4 unidades con TP=4). Para el tandem completo en bf16 encajan A100 80 GB, H100 80 GB o configuraciones multi-GPU equivalentes.
- GPU de consumo: una RTX 4090 con 24 GB no puede alojar el tandem en bf16. Solo seria planteable con el target cuantizado a 4 bits (aproximadamente 14-16 GB) mas los 6,2 GB del borrador, una combinacion que no esta documentada ni validada en la informacion disponible.
- Opciones de despliegue: requiere el codigo de EAGLE-4 (https://github.com/eagle-hq/EAGLE-4) y un motor de inferencia compatible. La model card menciona un "MegaKernel" desactivable pero no identifica el motor utilizado. No hay confirmacion de soporte en vLLM, SGLang, TGI, llama.cpp ni Ollama.
- Latencia y throughput: 863,8 tokens/s a T=0 y 608,6 tokens/s a T=1 en la configuracion de 4× B300 con TP=4 y concurrencia 1, frente a 240,5 y 234,9 tokens/s respectivamente en modo vanilla.
- Nota de viabilidad: el borrador anade computo y VRAM en cada paso; en GPUs pequenas o con modelos objetivo muy cuantizados, el sobrecoste puede anular la ganancia.

## Comparativa con modelos similares

La comparacion disponible se limita a metodos de decodificacion especulativa evaluados en el mismo banco y hardware, no a otros checkpoints de borrador con licencia y contexto comparables.

| Metodo | Tokens/s T=0 | Aceleracion T=0 | Tokens/s T=1 | Aceleracion T=1 |
|---|---:|---:|---:|---:|
| EAGLE-4 (este checkpoint) | 863,8 | 3,59× | 608,6 | 2,59× |
| DFlash 2 | 672,6 | 2,80× | 560,3 | 2,39× |
| DSpark | 618,6 | 2,57× | 519,4 | 2,21× |
| MTP | 534,5 | 2,22× | 369,1 | 1,57× |
| Vanilla (sin especulacion) | 240,5 | 1,00× | 234,9 | 1,00× |

En parametros, contexto, licencia y disponibilidad de los metodos alternativos: no disponible en la informacion proporcionada. EAGLE-3, generacion anterior de la misma familia y citada en la model card, no incluye resultados comparativos en este repositorio; no disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: no genera texto por si solo y no debe desplegarse sin los pesos de Qwen3.8-27B y el codigo de EAGLE-4.
- Licencia `other` con identificador `eagle-4`: hay que revisar el LICENSE y el NOTICE del repositorio y, ademas, la licencia aplicable a los pesos de Qwen3.8-27B. El uso comercial no esta garantizado por la etiqueta del checkpoint.
- Los benchmarks publicados cubren un unico escenario (4× B300, TP=4, concurrencia 1, split cualitativo de SPEED-Bench, MegaKernel desactivado, salida maxima de 4096 tokens). No son extrapolables a otras GPUs, a lotes grandes ni a otras distribuciones de carga.
- Ausencia de datos sobre tasa de aceptacion por dominio: en tareas muy especializadas (codigo, matematicas, idiomas distintos del entrenamiento del target) el borrador puede acertar menos y la aceleracion caer, aunque la calidad de salida no se degrada por la verificacion.
- Solo pesos safetensors bf16 en el repositorio: no hay cuantizaciones publicadas del borrador, lo que limita su uso en entornos con VRAM ajustada.
- Idiomas soportados no declarados: la cobertura linguistica y los sesgos dependen enteramente del modelo objetivo, no evaluados en esta ficha.
- Riesgo de alucinacion: el borrador no produce la salida final, pero en caso de divergir del target la verificacion rechaza sus propuestas; el efecto es perdida de rendimiento, no incorreccion del texto.
- Sesgos conocidos: no documentados para el borrador; deben evaluarse sobre Qwen3.8-27B.
- Coste anadido: 3,09 B parametros extra en VRAM y computo por paso; en hardware consumer la relacion coste/beneficio puede ser negativa.
- Madurez: el repositorio tiene 697 descargas y 12 likes, con una unica actualizacion registrada, lo que sugiere una adopcion todavia limitada.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo: los enlaces devueltos corresponden a software de diseno de PCB, una aplicacion de organizacion de archivos, la enciclopedia del ave, un cliente de Minecraft y una marca de ropa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EAGLE-Corp/Qwen3.8-27B-EAGLE4
- Organizacion EAGLE-Corp en HuggingFace: https://huggingface.co/EAGLE-Corp
- Repositorio y codigo de EAGLE-4: https://github.com/eagle-hq/EAGLE-4
- Paper de EAGLE-4 (PDF): https://github.com/eagle-hq/EAGLE-4/blob/main/EAGLE4_Paper.pdf
- Licencia: https://github.com/eagle-hq/EAGLE-4/blob/main/LICENSE
- Aviso legal y acknowledgements: https://github.com/eagle-hq/EAGLE-4/blob/main/NOTICE
- Sitio web del proyecto: https://eagle.ai/
- Paper de EAGLE (ICML 2024), citado en la model card: no disponible como enlace directo en la informacion proporcionada
- Paper de EAGLE-2 (EMNLP 2024), citado en la model card: no disponible como enlace directo en la informacion proporcionada
- Paper de EAGLE-3 (NeurIPS 2025), citado en la model card: no disponible como enlace directo en la informacion proporcionada
