# m1rkocasu/Apertus-v1.5-8B-text-MLX-mxfp4

## Resumen

Apertus v1.5 8B es un modelo de lenguaje de codigo abierto desarrollado por la Swiss AI Initiative, una colaboracion entre la EPFL, la ETH de Zúrich y el Centro Nacional de Supercomputacion de Suiza. Este repositorio concreto contiene la rama de texto del modelo, convertida al formato MLX y cuantizada en MXFP4, pensada para ejecutarse en hardware Apple Silicon mediante la libreria mlx-lm. El modelo base, Apertus v1.5 8B, es un continuacion del pretraining de Apertus 1.0 con 4 billones de tokens adicionales, y destaca por su ventana de contexto de 262 144 tokens y su soporte multilingue.

La cuantizacion MXFP4 almacena cada peso como un float de 4 bits con un exponente compartido de 8 bits por cada grupo de 32 pesos, lo que reduce el tamaño en disco a 4,28 GB. Esta version es la mas compacta de la coleccion publicada por el autor, aunque presenta una perdida de calidad medible en perplexity respecto a las variantes de mayor precision. Es una opcion adecuada para quienes necesitan ejecutar un modelo de 8B en un Mac con recursos limitados, priorizando la eficiencia de memoria sobre la fidelidad numerica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ApertusForCausalLM, 32 capas, hidden size 4096, 32 cabezas de atencion, 8 key-value heads, activacion xIELU |
| Parametros totales | 1 510 223 872 (segun safetensors; el modelo base declara 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | MXFP4 (4,250 bits por peso); existen variantes 8-bit, 6-bit, 5-bit y 4-bit DWQ en otros repositorios |
| Idiomas soportados | multilingue (segun el modelo base; lista completa no disponible) |
| Licencia | Apache 2.0 con la politica de uso aceptable de Apertus 1.5 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Apertus 1.5 8B es un transformer causal con 32 capas, dimension oculta de 4096 y 32 cabezas de atencion, con 8 key-value heads para atencion multi-consulta. La funcion de activacion es xIELU, una variante de ELU con parametro x, que es una innovacion propia de la familia Apertus. El vocabulario de texto consta de 131 072 tokens. Segun la documentacion oficial, Apertus 1.5 es un continued pretraining de Apertus 1.0, anadiendo 4 billones de tokens de datos de texto y multimodales al modelo de 8B. No se menciona el uso de RLHF o DPO en la informacion disponible.

La cuantizacion MXFP4 de este repositorio se realizo con mlx-lm 0.31.3 y mlx 0.32.0 en macOS 26.5. El proceso de conversion se describe en la model card, y se indica que esta cuantizacion no es afina, por lo que no se aplica destilacion de escalas. El autor tambien documento varios intentos fallidos de cuantizacion (mixta 4/6, 4-bit afina sin destilacion, 3-bit) que no se publicaron por tener peor relacion tamaño/calidad que las variantes elegidas.

## Capacidades

- Generacion de texto y conversacion: modelo causal de lenguaje para completar texto, chat y respuestas a instrucciones.
- Contexto largo: ventana de 262 144 tokens, adecuada para procesar documentos extensos en una sola pasada.
- Multilingue: el modelo base soporta multiples idiomas, aunque la lista exacta no se detalla en la informacion proporcionada.
- Soporte de function calling: segun la ficha de LLMTR, el modelo base es capaz de invocar funciones y producir salidas en JSON, aunque esta capacidad no se menciona explicitamente en la model card de este repositorio cuantizado.
- Integracion con MLX: se ejecuta en Apple Silicon mediante mlx-lm, con interfaz de linea de comandos, API de Python y servidor compatible con OpenAI.
- Solo texto: esta rama no procesa imagenes; la version multimodal del modelo base esta en otro repositorio.

## Casos de uso

- Procesamiento de documentos largos: gracias a su contexto de 262 144 tokens, puede resumir o extraer informacion de informes, contratos o articulos cientificos completos sin necesidad de dividirlos en fragmentos.
- Asistente de chat en aplicaciones de escritorio para macOS: al ser un modelo MLX, se integra de forma nativa en apps que usan mlx-lm, ofreciendo respuestas en local sin conexion a internet.
- Generacion de codigo en entornos de desarrollo: aunque no se reportan benchmarks especificos, el modelo base es capaz de generar y explicar codigo; la cuantizacion MXFP4 permite ejecutarlo en un Mac con 8 GB de RAM unificada.
- Clasificacion y transformacion de datos: segun LLMTR, el modelo puede realizar tareas de clasificacion, extraccion de entidades y transformacion de datos con salida en JSON, util para pipelines de datos.
- Atencion al cliente automatizada: con su soporte multilingue y contexto largo, puede gestionar conversaciones multi-turno manteniendo el historial completo, aunque la cuantizacion puede afectar ligeramente la coherencia en dialogos muy largos.
- Prototipado rapido de aplicaciones de IA: al ser un modelo abierto con licencia Apache 2.0, permite experimentar sin coste de API y desplegar en local para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de calidad proporcionado es la perplexity en el conjunto de test de `Salesforce/wikitext` (configuracion `wikitext-2-raw-v1`), medida sobre 200 ventanas no solapadas de 512 tokens (102 400 tokens puntuados). La tabla siguiente compara esta cuantizacion con otras variantes del mismo modelo publicadas por el mismo autor:

| Variante | Bits por peso | Tamano | Perplexity | Diferencia vs 8-bit |
|---|---|---|---|---|
| 8-bit | 8,500 | 8,54 GB | 10,41 | referencia |
| 6-bit | 6,500 | 6,54 GB | 10,46 | +0,5% |
| 5-bit | 5,500 | 5,54 GB | 10,53 | +1,1% |
| 4-bit DWQ | 4,500 | 4,53 GB | 10,97 | +5,4% |
| MXFP4 (este repo) | 4,250 | 4,28 GB | 11,71 | +12,5% |

El autor advierte que la perplexity compara cuantizaciones de un mismo modelo sobre un corpus concreto, y no dice nada sobre la calidad relativa frente a otros modelos ni sobre la capacidad de seguir instrucciones.

## Requisitos de hardware

- Dispositivo: Apple Silicon (M1 o posterior), ya que el formato MLX esta optimizado para la GPU unificada de estos chips.
- Memoria unificada: el modelo ocupa 4,28 GB en disco, por lo que se recomienda al menos 8 GB de RAM unificada para cargarlo con margen; con 16 GB se puede ejecutar con comodidad.
- GPU: no requiere GPU discreta; usa la GPU integrada del chip Apple Silicon.
- Software: mlx-lm (version 0.31.3 o superior) y mlx 0.32.0, instalables via pip.
- Opciones de despliegue: linea de comandos (`mlx_lm.generate`), API de Python (`mlx_lm.load` y `mlx_lm.generate`), o servidor compatible con OpenAI (`mlx_lm.server`).
- Latencia y throughput: no se proporcionan datos medidos. En general, un modelo de 8B cuantizado a 4 bits en un Mac con 16 GB puede generar decenas de tokens por segundo, pero depende del chip concreto.

## Comparativa con modelos similares

La comparacion mas directa es con las otras cuantizaciones del mismo modelo publicadas por el mismo autor, ya que no se dispone de datos de benchmarks frente a otros modelos de 8B. La tabla anterior ya muestra las diferencias. Frente a alternativas como Llama 3.1 8B o Mistral 7B, no hay datos comparativos en la informacion proporcionada, por lo que no se puede establecer una comparativa cuantitativa. En terminos de licencia, Apertus 1.5 es completamente abierto (Apache 2.0 con politica de uso aceptable), mientras que Llama 3.1 tiene una licencia con restricciones para usos comerciales por encima de ciertos umbrales. La ventaja principal de esta version es su formato MLX, que la hace directamente ejecutable en Apple Silicon sin conversion adicional.

## Limitaciones y advertencias

- Degradacion por cuantizacion: la cuantizacion MXFP4 aumenta la perplexity un 12,5% respecto a la version de 8 bits, lo que puede traducirse en respuestas menos precisas o mas incoherentes en tareas complejas.
- Sin benchmarks de tareas: no se han publicado resultados en MMLU, HumanEval u otros benchmarks, por lo que no se puede evaluar su rendimiento real en razonamiento, codigo o matematicas.
- Solo texto: esta rama no procesa imagenes; si se necesita multimodalidad, hay que usar la version completa del modelo base.
- Dependencia de Apple Silicon: el formato MLX no es compatible con GPUs NVIDIA o AMD; para otros hardware habria que usar otra cuantizacion (por ejemplo, GGUF).
- Politica de uso aceptable: aunque la licencia es Apache 2.0, se anade una politica de uso aceptable de Apertus 1.5 que puede imponer restricciones adicionales; conviene revisarla antes de un despliegue comercial.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en contextos largos o con datos poco frecuentes.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo para esta cuantizacion; el modelo base puede heredar sesgos de sus datos de entrenamiento.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/m1rkocasu/Apertus-v1.5-8B-text-MLX-mxfp4
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Sitio oficial de Apertus AI: https://apertus-ai.org/
- Articulo de anuncio de Apertus 1.5: https://apertus-ai.org/articles/2026-07-apertus-1-5/
- Documentacion de Apertus: https://apertus-ai.org/pages/documentation/
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Ficha en LLMTR: https://llmtr.com/en/models/publicai/apertus-v1.5-8b
