# 0xSojalSec/Qwen3.8-27B-MLX-2bit

## Resumen

0xSojalSec/Qwen3.8-27B-MLX-2bit es una version cuantizada a 2 bits del modelo multimodal Qwen/Qwen3.8-27B, preparada para ejecucion en silicio de Apple mediante la libreria MLX. La cuantizacion es de tipo afine (affine), con 2 bits por peso y group size 32, aplicada con `mlx_lm.convert` (mlx-lm 0.31.3) sobre la revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo original. Solo la torre de texto esta cuantizada: la torre de vision y el proyector se conservan en BF16, de modo que el pipeline sigue siendo image-text-to-text.

El modelo cuenta con 27.356.728.560 parametros (~27,36 mil millones) y el repositorio ocupa 11,0 GB, lo que permite desplegar un modelo de casi 27B en equipos Apple con memoria unificada moderada. La licencia es Apache-2.0, heredada del modelo base, lo que facilita el uso comercial sin restricciones adicionales.

Su relevancia practica es, sin embargo, limitada y debe evaluarse con cautela: el autor solo publica dos metricas de evaluacion (arc_easy_acc 0,49 y hellaswag_acc 0,41, ambas muy por debajo de lo esperable en un modelo de este tamano sin cuantizar) y una unica puerta de coherencia ("smoke gate") de 48 tokens con decodificacion greedy. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text); etiqueta de arquitectura `qwen3_5`; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | No aplica: la informacion disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 2-bit afine, group size 32 (torre de texto). Torre de vision y proyector en BF16. Existen variantes publicadas en 3, 4, 5, 6 y 8 bits y MXFP4 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |
| Tamano del repositorio | 11,0 GB |
| Modelo base | Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) |
| Herramienta de cuantizacion | `mlx_lm.convert`, mlx-lm 0.31.3 |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base ni sobre su entrenamiento. La etiqueta `qwen3_5` sugiere una generacion de la familia Qwen3, y el pipeline declarado (`image-text-to-text`) confirma que se trata de un modelo multimodal con torre de vision, proyector y torre de texto. El proceso aplicado por el autor es exclusivamente de cuantizacion, no de entrenamiento: se parte del checkpoint Apache-2.0 de Qwen y se convierte la torre de texto a precision de 2 bits con esquema afine y group size 32, manteniendo la torre de vision y el proyector en BF16.

No hay datos publicados sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas del modelo base. La unica validacion realizada por el autor antes de subir el paquete es una "smoke gate" determinista: generacion de chat greedy de 48 tokens cargada con `mlx_lm.load`, evaluada para descartar salidas vacias, bucles de repeticion, texto ilegible en multiples alfabetos y restos de tokens especiales. El veredicto fue `ok`, pero se trata de una comprobacion de coherencia minima, no de una evaluacion de calidad.

## Capacidades

- Generacion de texto conversacional en formato chat, cargable con `mlx_lm.load` y ejecutable con `mlx_lm.generate`.
- Procesamiento de imagen y texto (pipeline image-text-to-text), ya que la torre de vision y el proyector se conservan en BF16.
- Razonamiento general y respuesta a instrucciones: presumiblemente heredadas del modelo base, aunque no verificadas por el autor para esta cuantizacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada. Dada la degradacion observada en los benchmarks, no es recomendable asumirlo sin validacion propia.
- Capacidades multilingues: no disponibles; el campo de idiomas del repositorio esta vacio.
- Modo de razonamiento explicito ("thinking mode"): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con `mlx_lm.generate` o `mlx_lm.server` para disponer de un modelo de ~27B en un portatil Apple sin depender de la nube, aceptando la perdida de calidad propia de 2 bits.
- Pruebas de concepto multimodales en Apple silicon: al conservar la torre de vision en BF16, permite experimentar con entradas de imagen y texto en local, siempre que se use una herramienta compatible con modelos vision-language (mlx-lm por si solo esta orientado a texto).
- Evaluacion de la degradacion por cuantizacion extrema: sirve como punto de referencia de 2 bits para comparar contra las variantes de 3, 4, 5, 6 y 8 bits y MXFP4 del mismo modelo base y decidir el punto de equilibrio entre memoria y calidad.
- Generacion de texto offline con requisitos de privacidad: al ejecutarse integramente en el dispositivo, es apto para borradores, resumenes o clasificacion de texto sobre material sensible que no puede salir de la maquina.
- Filtrado y preetiquetado de datos a gran escala: por su bajo coste de memoria, puede emplearse para tareas de etiquetado auxiliar donde la precision exacta importa menos que el coste por token.
- Investigacion sobre tecnicas de cuantizacion: el repositorio documenta el esquema exacto (afine, 2 bits, group size 32) y la herramienta usada, lo que lo hace util como caso de estudio reproducible en experimentos sobre cuantizacion agresiva.
- Demostraciones educativas de despliegue local: permite ilustrar el flujo completo de conversion, carga y generacion con MLX en un equipo de gama alta de consumo.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia de azar |
|---|---|---|
| arc_easy_acc | 0,4900 | 0,25 |
| hellaswag_acc | 0,4100 | 0,25 |

No se han publicado en la informacion disponible resultados del modelo base sin cuantizar ni de las otras variantes de cuantizacion, por lo que no es posible cuantificar con exactitud la perdida atribuible a los 2 bits. Ambos resultados quedan muy por encima del azar pero lejos de los valores tipicos de un modelo de ~27B en precision completa, lo que apunta a una degradacion severa de la calidad provocada por la cuantizacion a 2 bits con group size 32. No hay datos de MMLU, HumanEval, GSM8K ni de tareas multimodales.

## Requisitos de hardware

- Peso en disco de los pesos: 11,0 GB, segun el tamano del repositorio.
- Memoria unificada estimada para inferencia: en torno a 12-14 GB con contextos cortos (pesos mas escalas y sesgos de cuantizacion, mas cache KV). Se recomienda un minimo de 16 GB de memoria unificada y 24-32 GB para contextos largos o uso del servidor.
- Plataforma objetivo: Apple silicon. El modelo esta empaquetado para `mlx`, por lo que el uso previsto son chips de la serie M (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra).
- GPU NVIDIA o AMD: no disponible en la informacion proporcionada; el paquete esta publicado exclusivamente en formato MLX.
- Cabe en GPU de consumo: si, en equipos Apple con al menos 16 GB de memoria unificada. Es precisamente el escenario para el que fue creado.
- Opciones de despliegue: `mlx-lm` (comandos `mlx_lm.generate` y servidor), y entornos graficos que soporten pesos MLX. Para aprovechar la torre de vision haria falta una herramienta de inferencia vision-language sobre MLX, ya que mlx-lm esta orientado a texto.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo a primer token.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Parametros | Repositorio | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| 0xSojalSec/Qwen3.8-27B-MLX-2bit (este) | 2-bit afine, group size 32 | 27,36 B | 11,0 GB | apache-2.0 | arc_easy 0,49; hellaswag 0,41 |
| majentik/Qwen3.8-27B-MLX-4bit | 4-bit | 27,36 B (mismo base) | No disponible | apache-2.0 | No disponible |
| majentik/Qwen3.8-27B-MLX-8bit | 8-bit | 27,36 B (mismo base) | No disponible | apache-2.0 | No disponible |
| Qwen/Qwen3.8-27B (modelo base) | BF16 | 27,36 B | ~54,7 GB (estimado a partir del numero de parametros) | apache-2.0 | No disponible |

Las variantes de 3, 5, 6 bits y MXFP4 existen segun la model card, pero no se aportan datos de tamano ni de rendimiento. No se dispone de informacion sobre modelos comparables de otros autores en el mismo rango de parametros y formato MLX.

## Limitaciones y advertencias

- Degradacion de calidad severa: los unicos benchmarks publicados (arc_easy 0,49 y hellaswag 0,41) estan muy por debajo de lo esperable en un modelo de ~27B sin cuantizar y sugieren que la cuantizacion a 2 bits con group size 32 compromete seriamente el razonamiento.
- Validacion minima: la unica comprobacion realizada por el autor es una generacion greedy de 48 tokens. No hay evidencia de comportamiento correcto en generaciones largas, tareas complejas ni uso de contexto extenso.
- Riesgo de alucinacion: no cuantificado. Con este nivel de compresion, la probabilidad de salidas incoherentes o inventadas aumenta, y no existe evaluacion especifica al respecto.
- Idiomas: el campo de idiomas esta vacio y no se ha verificado el comportamiento multilingue de esta cuantizacion concreta.
- Longitud de contexto: no documentada; se desconoce si la cuantizacion afecta al comportamiento mas alla de cierta longitud de secuencia.
- Sin datos de sesgo: no se han publicado analisis de sesgos ni de alineacion para esta variante.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda de Qwen/Qwen3.8-27B y conviene revisar el fichero LICENSE original para confirmar condiciones adicionales del modelo base.
- Inconsistencia en la procedencia: la model card usa ejemplos y enlaces a repositorios bajo el espacio `majentik`, mientras que el repositorio consultado pertenece a `0xSojalSec`. Conviene verificar la autoria y el origen del paquete antes de utilizarlo en produccion.
- Fechas de metadatos llamativas: la creacion y actualizacion del repositorio se registran el 2026-09-13, dato a tener en cuenta al evaluar su trazabilidad.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el resultado.
- Recomendacion practica: para cualquier uso en produccion, preferir las variantes de 4 bits o superiores del mismo modelo base, que ofrecen un compromiso mucho mas razonable entre memoria y calidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/0xSojalSec/Qwen3.8-27B-MLX-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante de 3 bits: https://huggingface.co/majentik/Qwen3.8-27B-MLX-3bit
- Variante de 4 bits: https://huggingface.co/majentik/Qwen3.8-27B-MLX-4bit
- Variante de 5 bits: https://huggingface.co/majentik/Qwen3.8-27B-MLX-5bit
- Variante de 6 bits: https://huggingface.co/majentik/Qwen3.8-27B-MLX-6bit
- Variante de 8 bits: https://huggingface.co/majentik/Qwen3.8-27B-MLX-8bit
- Variante MXFP4: https://huggingface.co/majentik/Qwen3.8-27B-MLX-MXFP4
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre Qwen/Qwen3.8-27B; los resultados obtenidos correspondian a paginas de soporte de un producto de escritorio remoto sin relacion con el tema. No se han localizado papers, blogs ni demos adicionales.
