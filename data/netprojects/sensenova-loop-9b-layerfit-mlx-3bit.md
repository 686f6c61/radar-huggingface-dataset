# netprojects/SenseNova-Loop-9B-LayerFit-MLX-3bit

## Resumen

SenseNova-Loop-9B-LayerFit-MLX-3bit es una cuantizacion de 3 bits en formato MLX del modelo sensenova/SenseNova-Loop-9B, un transformer con bucles (looped transformer) de aproximadamente 8.960 millones de parametros desarrollado originalmente por SenseNova. Esta version la publica NetProjects (Paris Michalas) y aplica una tecnica propietaria llamada LayerFit, que distribuye de forma no uniforme los bits entre capas: mide la sensibilidad de cada bloque (atencion, bloques de atencion lineal, MLP, embeddings y cabeza de salida) y asigna mayor precision donde mas contribuye a reducir el error de cuantizacion.

El objetivo es ejecutar un modelo de razonamiento de ~9B en Apple Silicon con un consumo de memoria reducido: 5,3 GB en disco y un requisito sugerido de 8 GB (ajustado) o 16 GB de memoria unificada en un Mac. Segun el autor, frente a una cuantizacion estandar de 3 bits del mismo tamano, LayerFit mejora la concordancia Top-1 con bf16 del 72,5 % al 80,3 % y reduce el error KL de 0,5978 a 0,2791 (un 53 % menos), manteniendo 29/30 aciertos en GSM8K (30 preguntas) frente a 27/30.

La relevancia actual esta en que permite desplegar localmente, sin GPU dedicada, un modelo con modo de razonamiento, entrada de imagen y decodificacion especulativa mediante cabeza MTP, manteniendo las normas en float32, los routers de bucle y la torre de vision en bfloat16. La licencia es Apache-2.0, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer), con atencion y bloques de atencion lineal, torre de vision y cabeza MTP; etiquetado como qwen3_5 |
| Parametros totales | 8.956.949.376 (~8,96B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (esta build, LayerFit); el autor publica tambien 4-bit, 6-bit, 8-bit y bf16 |
| Idiomas soportados | no disponible (el harness de evaluacion usa pasajes en varios idiomas, sin listado oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), mas `vision.safetensors` en bfloat16 |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: el mismo conjunto de bloques se reaplica varias veces, lo que incrementa la profundidad efectiva sin aumentar proporcionalmente el numero de parametros. Combina atencion estandar con bloques de atencion lineal, e incorpora una torre de vision para entrada de imagenes y una cabeza MTP (multi-token prediction) que actua como modelo borrador para decodificacion especulativa. La etiqueta `qwen3_5` sugiere una base derivada de la familia Qwen3.5, aunque la model card no detalla la composicion del dataset de entrenamiento ni el numero de tokens vistos.

Esta build concreta no reentrena el modelo: es una conversion cuantizada. LayerFit realiza una busqueda por capa para repartir el presupuesto de bits segun la sensibilidad medida de cada componente, manteniendo sin cuantizar las normas en float32, los routers de bucle, la torre de vision y la cabeza MTP. La receta exacta se publica en `layerfit-recipe.json`. No se documentan en la informacion disponible detalles sobre RLHF, DPO u otras fases de alineamiento del modelo original.

## Capacidades

- Generacion de texto conversacional y razonamiento, con modo de pensamiento activable mediante `enable_thinking=True`.
- Razonamiento matematico: GSM8K se usa como prueba de referencia en la model card.
- Entrada de imagen (vision): descripcion y analisis de imagenes, con multiples imagenes por peticion mediante `--image` repetido; limite por defecto de ~1 megapixel por imagen y limite nativo de SenseNova de 16,7 MP.
- Decodificacion especulativa mediante cabeza MTP, disponible a traves del runtime `sensenova-loop-mlx`.
- Servidor HTTP local con `mlx_lm.server`.
- Soporte de plantilla de chat (`apply_chat_template`) con control explicito del modo pensamiento.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible (solo se menciona el uso de pasajes en varios idiomas en el harness de evaluacion).

## Casos de uso

- Asistente local en Mac: ejecutar el modelo con `mlx_lm.server` en un MacBook con 16 GB de memoria unificada para conversaciones multi-turno sin conexion, aprovechando el formato MLX y el bajo consumo de la cuantizacion de 3 bits.
- Razonamiento matematico asistido: usar el modo pensamiento (`enable_thinking=True`) para resolver problemas paso a paso; el autor reporta 29/30 en GSM8K con el pensamiento desactivado, lo que indica un rendimiento base solido que mejora con razonamiento explicito.
- Analisis de imagenes en local: procesar fotografias o capturas con `scripts/generate_vision.py`, util para clasificacion, descripcion o extraccion de informacion de documentos escaneados sin enviar datos a la nube.
- Prototipado de agentes con decodificacion especulativa: emplear la cabeza MTP mediante el runtime `sensenova-loop-mlx` v0.3.0 para reducir la latencia en generaciones largas en Apple Silicon.
- Evaluacion de tecnicas de cuantizacion: comparar LayerFit 3-bit frente a las builds 4-bit, 6-bit, 8-bit y bf16 del mismo autor para medir el impacto de la precision en tareas concretas antes de fijar una build de produccion.
- Desarrollo offline en entornos restringidos: desplegar un modelo de ~9B con vision y razonamiento en equipos sin GPU NVIDIA, usando `hf download` para obtener los pesos y el runtime local para inferencia.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (harness propio: pesos frente a la build bf16 del autor, pasajes reservados en varios idiomas, GSM8K con pensamiento desactivado, medido en un MacBook Pro M5 Max el 27 de noviembre de 2026). La comparacion es contra una cuantizacion estandar de 3 bits creada especificamente para la prueba; el autor no publica una build estandar de 3 bits.

| Metrica | 3-bit estandar | LayerFit 3-bit |
|---|---|---|
| Concordancia Top-1 con bf16 | 72,5 % | 80,3 % |
| Error KL | 0,5978 | 0,2791 (53 % menor) |
| GSM8K (30 preguntas, sin pensamiento) | 27/30 | 29/30 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni otros benchmarks estandar, ni comparaciones con modelos de terceros.

## Requisitos de hardware

- Memoria en disco: 5,3 GB (el repositorio ocupa 5,4 GB).
- Memoria unificada sugerida por el autor: 8 GB (ajustado) o 16 GB en un Mac.
- Plataforma: exclusivamente Apple Silicon (formato MLX); no es ejecutable en GPU NVIDIA ni CPU x86 con este formato.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a esta build; para esos entornos habria que usar el modelo base en otro formato.
- Macs compatibles: cualquier equipo Apple Silicon con al menos 8 GB de memoria unificada; el autor cita un MacBook Pro M5 Max como banco de pruebas.
- Despliegue: `mlx-lm>=0.32` con Python 3.11 o superior para texto (`mlx_lm.generate`, `mlx_lm.server`); runtime `sensenova-loop-mlx` v0.3.0 para vision y decodificacion MTP.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Vision | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| SenseNova-Loop-9B LayerFit MLX 3-bit (esta ficha) | ~8,96B | no disponible | 3 bits LayerFit | Si | Apache-2.0 | Apple Silicon (MLX) |
| SenseNova-Loop-9B LayerFit MLX 4-bit | ~8,96B | no disponible | 4 bits LayerFit | Si | Apache-2.0 | Apple Silicon (MLX) |
| SenseNova-Loop-9B MLX bf16 | ~8,96B | no disponible | bf16 | Si | Apache-2.0 | Apple Silicon (MLX) |
| sensenova/SenseNova-Loop-9B (base) | ~8,96B | no disponible | bf16 y otras | Si | Apache-2.0 | Multiples (formato original) |

Las builds 4-bit, 6-bit, 8-bit y bf16 del mismo autor permiten ajustar el equilibrio entre calidad y memoria: 6,4 GB en disco y 16 GB de memoria sugerida para la 4-bit, frente a 5,3 GB y 8-16 GB para la 3-bit. No se dispone de datos para comparar con modelos de otros autores de tamano similar.

## Limitaciones y advertencias

- La cuantizacion de 3 bits introduce perdida de calidad medible: 80,3 % de concordancia Top-1 con bf16 implica que aproximadamente una de cada cinco predicciones difiere de la referencia en el harness del autor.
- Los benchmarks publicados son del propio autor, con un harness propio, un unico conjunto de 30 preguntas de GSM8K y un solo equipo (M5 Max); no son comparables directamente con resultados de terceros.
- La comparacion es contra una cuantizacion estandar de 3 bits creada para la prueba, no contra una build publica; el autor no distribuye esa build de referencia.
- El limite de vision por defecto es de ~1 megapixel por imagen; subir a los 16,7 MP nativos exige mucha mas memoria y puede no caber en equipos de 8 GB.
- La build esta atada a Apple Silicon y a `mlx-lm>=0.32`; no es portable a CUDA, ROCm ni CPU convencional sin reconvertir los pesos.
- La longitud de contexto, los idiomas soportados y el comportamiento de tool calling no se documentan en la informacion disponible; conviene validarlos antes de usarlos en produccion.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de toxicidad para esta build ni para el modelo base en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero LayerFit es una marca registrada de NetProjects y el autor declara no estar afiliado a SenseNova; revisar `NOTICE` para los terminos de la conversion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/SenseNova-Loop-9B-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Build 4-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-LayerFit-MLX-4bit
- Build 6-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/SenseNova-Loop-9B-MLX-bf16
- Runtime MLX con vision y MTP (v0.3.0): https://github.com/internet-projects/sensenova-loop-mlx/releases/tag/v0.3.0
- Repositorio del runtime: https://github.com/internet-projects/sensenova-loop-mlx
- NetProjects: https://netprojects.com
