# GreenBitAI/Qwen3.8-27B-4bit

## Resumen

GreenBitAI/Qwen3.8-27B-4bit es una cuantizacion a 4 bits del modelo Qwen/Qwen3.8-27B, publicada por GreenBitAI para el ecosistema MLX de Apple. El repositorio contiene dos componentes: los pesos convertidos, que proceden de la conversion ya publicada como mlx-community/Qwen3.8-27B-4bit, y una cabecera de prediccion multi-token (MTP, multi-token prediction) alojada en el directorio `mtp/`, construida a partir de los tensores que el modelo base distribuye bajo el prefijo `mtp.` y cuantizada para coincidir con los pesos principales.

La aportacion principal del repositorio no es la cuantizacion en si, sino el empaquetado conjunto de pesos y cabecera de borrador en un unico artefacto. Esto permite emplear decodificacion especulativa sin descargar componentes adicionales ni configurar variables de entorno que apunten a rutas externas: la cabecera se localiza automaticamente en `mtp/` y permanece desactivada salvo que se solicite explicitamente. El modelo declara 27.356.728.560 parametros reales segun los ficheros safetensors, un peso de repositorio de 16,3 GB y licencia Apache 2.0.

El modelo se publico el 17 de septiembre de 2026 y, en el momento de recopilar esta informacion, registra 0 descargas y 0 likes. Esta pensado para inferencia local en hardware Apple Silicon mediante la libreria `gbx_lm`, con ganancias medidas de hasta 2,3x en velocidad de decodificacion respecto a la ejecucion sin la cabecera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag del repositorio es `qwen3_5`, pero la model card no describe la arquitectura) |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (la model card incluye mediciones hasta 16.384 tokens, sin especificar el maximo soportado) |
| Tipos de cuantizacion | 4 bits (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), mas una cabecera MTP cuantizada en `mtp/` |
| Tamano del repositorio | 16,3 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline declarado | image-text-to-text |
| Libreria | mlx |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.8-27B: no se especifica si se trata de un transformer denso, un MoE, un modelo hibrido ni cuales son sus mecanismos de atencion. El unico indicio es el tag `qwen3_5` del repositorio, que sugiere pertenencia a la familia Qwen3.5, pero la model card no lo confirma ni lo desarrolla. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Todo ello debe considerarse no disponible.

Lo que si esta documentado es el proceso de cuantizacion y el mecanismo de decodificacion especulativa. Los pesos principales son la conversion publicada por mlx-community a 4 bits; la cabecera de prediccion multi-token se construye a partir de los tensores originales del modelo base y se cuantiza de forma coherente con los pesos principales. Durante la inferencia, la cabecera propone varios tokens candidatos y el modelo completo los verifica, de modo que la salida final es identica a la que produciria el modelo sin la cabecera: la cabecera solo reduce el numero de pasadas necesarias. Las tasas de aceptacion medidas (0,95 a 1.024 tokens de contexto, 0,78 a 4.096 y 16.384) indican que la propuesta se valida en la gran mayoria de casos en contextos cortos y pierde eficacia relativa segun crece el contexto.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y `image-text-to-text`, y se distribuye con un ejemplo de generacion mediante `gbx_lm.generate`.
- Decodificacion especulativa integrada: la cabecera MTP en `mtp/` permite acelerar la decodificacion sin dependencias externas, activable con la variable `GBX_QWEN35_MTP=on`.
- Capacidades multimodales: el pipeline declarado es image-text-to-text, lo que sugiere entrada de imagen y texto, pero la model card no describe ninguna capacidad de vision ni incluye ejemplos de uso multimodal. No disponible.
- Razonamiento, codigo, matematicas y tool calling: no disponibles. No se documentan en la informacion proporcionada, ni para este repositorio ni para el modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el repositorio no declara lista de idiomas.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Inferencia local en equipos Apple Silicon: el modelo esta empaquetado para MLX y se ejecuta con `gbx_lm` en un Mac con memoria unificada suficiente. Es el escenario para el que fue disenado explicitamente, con la ventaja de que no requiere envio de datos a servicios externos.
- Asistentes conversacionales con requisitos de privacidad: al ejecutarse en local sobre MLX, las conversaciones no salen del equipo, lo que resulta adecuado para entornos donde no se permite procesar texto de usuarios en infraestructura de terceros.
- Optimizacion de latencia en prototipos de investigacion: la cabecera MTP permite medir el efecto de la decodificacion especulativa sobre el mismo modelo, con tasas de aceptacion documentadas (0,95 / 0,78 / 0,78), sin cambiar de artefacto ni de configuracion.
- Evaluacion comparativa de tecnicas de decodificacion: el repositorio sirve como banco de pruebas reproducible para comparar decodificacion estandar frente a especulativa en un modelo de 27.000 millones de parametros cuantizado a 4 bits.
- Despliegue en estaciones de trabajo de desarrollo con Mac Studio o MacBook Pro de memoria alta: el peso de 16,3 GB encaja en configuraciones de memoria unificada de gama alta, permitiendo mantener el modelo cargado junto con otras herramientas.
- Aplicaciones de generacion de texto en lote sobre macOS: el throughput medido (entre 24,8 y 33,8 tok/s con la cabecera activa, segun contexto) permite estimar tiempos de procesamiento para tareas por lotes en un unico equipo.
- Base para cuantizaciones adicionales: al tratarse de una conversion abierta con licencia Apache 2.0, puede servir como punto de partida para generar variantes en otros formatos o precisiones, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros). Si publica mediciones de velocidad de decodificacion realizadas en un M4 Pro con 48 GB de memoria unificada, decodificacion greedy y cronometraje desde el primer token:

| Contexto (tokens) | Sin cabecera (tok/s) | Con cabecera (tok/s) | Tasa de aceptacion |
|---|---|---|---|
| 1.024 | 14,7 | 33,8 | 0,95 |
| 4.096 | 14,3 | 27,3 | 0,78 |
| 16.384 | 13,5 | 24,8 | 0,78 |

No se han publicado resultados de benchmarks de calidad (razonamiento, codigo, matematicas, comprension multilingue) en la informacion disponible.

## Requisitos de hardware

- Peso de los ficheros: 16,3 GB en total, incluyendo pesos en 4 bits y cabecera MTP. La memoria necesaria para inferencia es superior a esa cifra una vez se anaden el contexto, las activaciones y el overhead del runtime.
- Hardware medido: un Apple M4 Pro con 48 GB de memoria unificada, que alcanza entre 24,8 y 33,8 tok/s con la cabecera activa.
- Memoria unificada recomendada: no disponible de forma explicita. Como referencia, el repositorio ocupa 16,3 GB y la unica configuracion documentada dispone de 48 GB; se recomienda un margen holgado sobre el tamano de los pesos.
- GPU NVIDIA (A100, H100, RTX 4090 y similares): no utilizables directamente. El formato MLX esta disenado para Apple Silicon; para emplear estas GPU seria necesario convertir los pesos a otro formato, algo que no se documenta en el repositorio.
- GPU de consumo: no hay soporte documentado. En equipos NVIDIA de consumo seria preciso un formato alternativo (por ejemplo GGUF) que el repositorio no proporciona.
- Opciones de despliegue: `gbx_lm` mediante `pip install gbx-lm`, con el comando `GBX_QWEN35_MTP=on python -m gbx_lm.generate --model GreenBitAI/Qwen3.8-27B-4bit --max-tokens 256 --prompt "..."`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver la tabla de la seccion anterior. La decodificacion se cronometro desde el primer token en modo greedy.
- Coste de la aceleracion: la ganancia de la cabecera MTP pasa de 2,3x con 1.024 tokens de contexto a 1,8x con 16.384, y la tasa de aceptacion cae de 0,95 a 0,78.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GreenBitAI/Qwen3.8-27B-4bit | 27,36 mil millones | 4 bits (MLX) | no disponible | Apache 2.0 | Repositorio con pesos y cabecera MTP conjuntos |
| mlx-community/Qwen3.8-27B-4bit | no disponible | 4 bits (MLX) | no disponible | Apache 2.0 | Pesos de origen de esta conversion; sin cabecera MTP incluida segun la informacion disponible |
| Qwen/Qwen3.8-27B | no disponible | precision original | no disponible | Apache 2.0 | Modelo base original, incluye los tensores `mtp.` |

No se dispone de datos de rendimiento comparativos entre estas variantes mas alla del throughput del repositorio analizado. No se han identificado en la informacion proporcionada otros modelos de la misma categoria con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos: no documentados. Al ser una cuantizacion del modelo base, hereda los sesgos de Qwen/Qwen3.8-27B, que no se describen en la informacion disponible.
- Alucinacion: no se publican evaluaciones de fiabilidad ni tasas de alucinacion. La decodificacion especulativa no altera la distribucion de salida, ya que cada token propuesto por la cabecera es verificado por el modelo, pero no existe garantia de veracidad del contenido generado.
- Limitaciones de contexto: la model card no declara la ventana de contexto maxima. Las mediciones llegan hasta 16.384 tokens, pero no debe asumirse ese valor como limite. Al aumentar el contexto, la tasa de aceptacion de la cabecera baja (de 0,95 a 0,78) y la ganancia de velocidad se reduce.
- Idiomas: no se declara lista de idiomas soportados ni calidad por idioma.
- Cuantizacion a 4 bits: la reduccion de precision puede degradar tareas sensibles a la precision numerica. No se publican comparaciones de calidad frente al modelo sin cuantizar.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B, del que este repositorio es una conversion. La model card afirma que tanto los pesos como la cabecera son Apache 2.0.
- Dependencia de plataforma: el formato MLX limita la ejecucion a Apple Silicon. No hay soporte documentado para CUDA, ROCm ni CPU x86.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la recopilacion, publicacion reciente y ausencia de datos de benchmarks de calidad. No se recomienda su adopcion en produccion sin una evaluacion propia previa.
- Requisito de herramienta externa: la decodificacion especulativa depende de `gbx_lm` y de la variable de entorno `GBX_QWEN35_MTP=on`; sin ella, la cabecera permanece desactivada y el rendimiento cae al de la decodificacion estandar.
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los enlaces recuperados corresponden al software iCUE de CORSAIR y no guardan relacion con la ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GreenBitAI/Qwen3.8-27B-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversion de origen de los pesos: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit

No se han encontrado articulos, papers, blogs, repositorios de codigo ni demos adicionales en la busqueda web realizada. No se dispone de enlace a la libreria `gbx_lm` en la informacion proporcionada, mas alla de la instruccion de instalacion `pip install gbx-lm` que aparece en la model card.
