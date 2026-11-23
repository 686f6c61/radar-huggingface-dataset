# brainworkup/Spark-X2.6-4B-oQ8e-fp16

## Resumen

Spark-X2.6-4B-oQ8e-fp16 es una cuantizacion comunitaria en formato MLX del modelo XHToken/Spark-X2.6-4B, desarrollado por el equipo SparkLLM de XHToken. La publica el usuario brainworkup (atribuida a xunlinkx) mediante el pipeline de cuantizacion oMLX, con el objetivo de permitir la inferencia local del modelo en Macs con Apple Silicon. No se trata de un modelo nuevo, sino de una distribucion de pesos cuantizados que conserva la arquitectura `spark2_5` y el tokenizer del checkpoint original.

El modelo base cuenta con 4.112.079.360 parametros (aproximadamente 4,1 mil millones) y esta pensado para generacion de texto y uso conversacional. Esta variante concreta aplica cuantizacion afina uniforme de 8 bits sobre las capas lineales, con group size 64, partiendo de una conversion previa del checkpoint original BF16 a FP16. El repositorio ocupa 4,4 GB y esta etiquetado con licencia Apache-2.0, heredada del modelo upstream.

Su relevancia es practica: ofrece la variante de mayor precision del conjunto de cuantizaciones publicadas por este autor (frente a las versiones de 4 y 5 bits), lo que la hace adecuada para quienes priorizan fidelidad numerica sobre huella de memoria en equipos Apple Silicon. La informacion publica disponible es limitada: la model card remite al repositorio upstream para detalles de arquitectura, entrenamiento y limitaciones, y no incluye resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5` (transformer; detalles internos no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afina uniforme en capas lineales, group size 64; origen FP16 (convertido desde BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

La arquitectura declarada es `spark2_5`, la del modelo upstream XHToken/Spark-X2.6-4B. La model card de esta cuantizacion no describe la estructura interna (tipo de atencion, capas, activaciones ni si incorpora componentes MoE), por lo que esos detalles deben consultarse en la model card y el repositorio oficiales del modelo base. Tampoco se documentan aqui el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La innovacion tecnica de este repositorio es exclusivamente el proceso de cuantizacion: se convirtio el checkpoint BF16 original a FP16 y se aplico cuantizacion afina de 8 bits con calibracion mejorada de oMLX (128 muestras, secuencias de 512 tokens), group size 64. La eleccion de FP16 como fuente busca compatibilidad amplia entre generaciones de Apple Silicon (M1 a M6). El autor realizo una comprobacion de humo de carga y generacion de 16 tokens con un pico de memoria de 4,530 GB reportado por MLX, sin que ello constituya un benchmark de calidad.

## Capacidades

- Generacion de texto y uso conversacional, segun el pipeline declarado (`text-generation`, `conversational`).
- Soporte de modo de razonamiento ("thinking") y plantilla de chat: la model card menciona ajustes de "thinking-budget" y chat-template soportados por el runtime, remitiendo al modelo upstream para el detalle.
- Parametros de muestreo recomendados por el autor upstream: temperatura 1.0 y top-p 0.95.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac Apple Silicon: el formato MLX y la cuantizacion de 8 bits permiten ejecutar el modelo en equipos M1-M6 sin GPU dedicada, usando oMLX o MLX-LM con soporte para la arquitectura `spark2_5`.
- Prototipado de asistentes conversacionales en local: el pipeline conversacional y la plantilla de chat permiten montar un chatbot de escritorio con datos que no salen del equipo.
- Evaluacion de fidelidad frente a cuantizaciones mas agresivas: al ser la variante de mayor precision del conjunto (frente a 4 y 5 bits), sirve para comparar la degradacion introducida por cuantizaciones inferiores sobre el mismo modelo base.
- Desarrollo y depuracion de integraciones MLX: util para validar que una instalacion de oMLX o MLX-LM carga correctamente la arquitectura Spark y su metadata de cuantizacion antes de desplegar variantes mas ligeras.
- Generacion de texto asistida en flujos de trabajo de investigacion: con temperatura 1.0 y top-p 0.95 se puede usar para redaccion exploratoria y generacion de borradores en local.
- Pruebas de razonamiento con presupuesto de "thinking": si el runtime lo soporta, permite experimentar con distintos presupuestos de razonamiento en un modelo de ~4B sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es una comprobacion de humo: generacion de 16 tokens con un pico de memoria de 4,530 GB medido por MLX, que no constituye una evaluacion de calidad ni de rendimiento comparativo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el autor reporta 4,530 GB de pico en una generacion corta; el requisito crece con la longitud de contexto y el overhead del runtime. El repositorio pesa 4,4 GB.
- Hardware objetivo: Macs con Apple Silicon, generaciones M1 a M6, mediante MLX.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo de esta variante; no se documenta soporte CUDA para este repositorio concreto.
- Opciones de despliegue: oMLX (recomendado por el autor) y MLX-LM con soporte para la arquitectura Spark. Ejemplo de invocacion con `mlx_lm.generate`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-oQ8e-fp16 (este) | 4,11B | no disponible | MLX safetensors 8-bit | Apache-2.0 | Cuantizacion comunitaria, objetivo Apple Silicon |
| XHToken/Spark-X2.6-4B (upstream) | 4,11B | no disponible | BF16 | Apache-2.0 | Modelo original; referencia de calidad |
| Otras variantes del mismo autor (4-bit, 5-bit) | 4,11B | no disponible | MLX | Apache-2.0 | Menor huella de memoria, mayor perdida de precision |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con modelos de otras familias del mismo tamano.

## Limitaciones y advertencias

- Cuantizacion no oficial: es un trabajo comunitario de xunlinkx/brainworkup, no respaldado por XHToken; puede introducir degradacion respecto al checkpoint BF16 original.
- Perdida de precision por cuantizacion de 8 bits: aunque es la variante mas fiel del conjunto, no equivale al modelo completo.
- Informacion incompleta: no se documentan contexto maximo, idiomas, sesgos conocidos ni riesgos de alucinacion en esta model card; deben consultarse en el modelo upstream.
- Dependencia de runtime: requiere versiones recientes de oMLX o MLX-LM con soporte para `spark2_5`; sin ellas el modelo no carga.
- Alcance de hardware restringido: orientado a Apple Silicon; no se garantiza funcionamiento en otras plataformas con este repositorio.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar la licencia y condiciones del modelo upstream y citar la atribucion correspondiente.
- Validacion minima: la unica prueba publicada es una generacion de 16 tokens; no hay evidencia de calidad en tareas largas o complejas.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/brainworkup/Spark-X2.6-4B-oQ8e-fp16
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Licencia upstream: https://huggingface.co/XHToken/Spark-X2.6-4B/blob/main/LICENSE
- Proyecto oficial Spark-X2.6: https://github.com/XHToken/Spark-X2.6
