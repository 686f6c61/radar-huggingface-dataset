# netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-4bit

## Resumen

Qwen3.6-35B-A3B-LayerFit-MLX-4bit es una cuantizacion de 4 bits del modelo Qwen/Qwen3.6-35B-A3B, un transformer de tipo mezcla de expertos (MoE) desarrollado por el equipo Qwen de Alibaba Cloud, adaptado para su ejecucion en Apple Silicon mediante la libreria MLX. La version que nos ocupa la publica netprojects (Paris Michalas), que aplica su metodologia propietaria LayerFit para asignar bits de forma no uniforme por capa, optimizando la fidelidad respecto al modelo original en bf16 bajo un presupuesto de tamano fijo. El resultado ocupa 21,6 GB en disco y conserva el torre de vision en bf16, por lo que sigue siendo un modelo image-text-to-text.

El modelo base cuenta con 35.107.181.936 parametros totales y aproximadamente 3.000 millones de parametros activos por token gracias a su arquitectura MoE, con una longitud de contexto declarada de 262K tokens y modo thinking activado por defecto. Esta pensado para tareas de razonamiento, generacion de codigo, matematicas y comprension de imagenes en equipos de sobremesa y portatiles Apple con memoria unificada, un nicho donde las alternativas de pesos completos no caben.

La relevancia actual del modelo reside en que demuestra que un MoE de 35B puede ejecutarse en un Mac de 32-48 GB con una degradacion medible y acotada frente a bf16: el autor reporta un 95,2% de acuerdo top-1 y una divergencia KL de 0,0129 en su harness interno, frente al 90,3% y 0,0509 de una cuantizacion uniforme de 4 bits. La licencia Apache-2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), con capas de atencion lineal y atencion completa, mas torre de vision |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones por token (denominacion A3B) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | 4 bits con receta LayerFit por capa; router y compuerta del experto compartido en bf16; torre de vision en bf16. Existen builds hermanos de 2, 2.5 y 3 bits |
| Idiomas soportados | No disponible (la model card no enumera idiomas; el harness de evaluacion incluye ingles, otros idiomas, codigo, tool calls y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx; compatible con mlx-vlm y mlx-lm) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con atencion hibrida: combina bloques de atencion lineal con bloques de atencion completa, e incorpora un experto compartido ademas de los expertos enrutados. La variante A3B indica que, pese a los 35B parametros totales, solo se activan unos 3B por token, lo que reduce el coste computacional de inferencia. Incluye una torre de vision que permite entrada image-text-to-text. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original en la informacion proporcionada.

La innovacion principal de esta ficha es el proceso de cuantizacion LayerFit: en lugar de aplicar el mismo numero de bits a todas las capas, se mide primero la sensibilidad de cada componente (expertos enrutados, experto compartido, bloques de atencion lineal y atencion, embeddings y cabeza de salida) a baja precision, y despues se distribuye un presupuesto fijo de bits alli donde mas mejora la fidelidad. El autor publica la receta exacta en `layerfit-recipe.json` y mantiene el router y la compuerta del experto compartido en bf16 para preservar el enrutamiento. La evaluacion se hizo con 32 pasajes de 512 tokens contra una conversion propia a bf16 en MLX, con GSM8K-20 (thinking off) como prueba funcional: 18/20 aciertos.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento con modo thinking activado por defecto y desactivable mediante `enable_thinking: false` en el template de chat.
- Comprension de imagenes y respuesta a preguntas sobre una o varias imagenes (image-text-to-text).
- Generacion de codigo y soporte de tool calling / function calling, segun los tags y el harness de evaluacion del autor.
- Razonamiento matematico, con resultados reportados en GSM8K-20.
- Capacidades multilingues: el harness de evaluacion incluye pasajes en ingles y otros idiomas, aunque no se detalla la lista completa.
- Compatibilidad con mlx-vlm (vision + texto) y mlx-lm (solo texto).

## Casos de uso

- Asistente local en Mac para desarrolladores: ejecucion de un MoE de 35B en un MacBook con 32-48 GB de memoria unificada, con contexto de 262K tokens para cargar repositorios o documentacion extensa en una sola sesion.
- Analisis de capturas y diagramas: la torre de vision en bf16 permite describir imagenes, extraer texto de diagramas de arquitectura o interpretar graficos sin enviar datos a la nube.
- Generacion de codigo en flujos de trabajo locales: con tool calling y contexto largo, puede integrarse en editores o scripts que necesiten razonar sobre varios ficheros a la vez, manteniendo los datos en el equipo.
- Procesamiento de documentos largos: resumen y extraccion de informacion de contratos, articulos o transcripciones de hasta 262K tokens, con modo thinking para tareas que requieran razonamiento encadenado.
- Prototipado de agentes multi-paso en local: el soporte de tool calls y el modo thinking permiten construir bucles de razonamiento-accion sin depender de APIs externas.
- Evaluacion e investigacion en cuantizacion: la publicacion de la receta LayerFit y de las metricas de acuerdo top-1 y KL permite reproducir y comparar estrategias de cuantizacion no uniforme sobre un MoE real.
- Asistencia matematica y tutorizacion: el rendimiento en GSM8K-20 (18/20) lo hace util para resolver problemas aritmeticos de varios pasos en un entorno offline.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del harness interno del autor para comparar builds de cuantizacion, medidos sobre pesos del modelo de lenguaje (vision excluida), con 32 pasajes de 512 tokens y frente a una conversion bf16 en MLX:

| Build | Pesos del modelo de lenguaje | Acuerdo top-1 con bf16 | Error (KL) |
|---|---|---|---|
| 4 bits uniforme | 19,5 GB | 90,3% | 0,0509 |
| 4 bits mixto (expertos 4 bits, resto 8 bits) | 20,7 GB | 95,1% | 0,0134 |
| LayerFit 4 bits (esta build) | 20,7 GB | 95,2% | 0,0129 |

Prueba funcional adicional: GSM8K-20 con thinking desactivado, 18/20 aciertos. No se han publicado en la informacion disponible resultados de MMLU, HumanEval u otros benchmarks estandar para esta build; el autor remite a la model card de Qwen3.6-35B-A3B para los resultados del modelo original.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 21,6 GB en disco para esta build de 4 bits; el autor la situa en Macs de 32 GB en modo stretch o de 48 GB con margen para macOS y prompts largos.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor midio en un MacBook Pro M5 Max. No se documenta soporte para GPU NVIDIA o AMD en esta build, que es especifica de MLX.
- Cabe en GPU de consumo: si, en equipos Apple con 32 GB o mas de memoria unificada; para 32 GB el autor recomienda el modo stretch (`sudo sysctl iogpu.wired_limit_mb=<aproximadamente 75% de la RAM en MB>`), que se mantiene hasta reiniciar. Existen builds de 2 bits (10,3 GB), 2,5 bits (13,7 GB) y 3 bits (16,1 GB) para equipos con menos memoria.
- Opciones de despliegue: mlx-vlm para vision y texto, y mlx-lm para texto. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no cargan este formato MLX.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-LayerFit-MLX-4bit (esta ficha) | 35B totales, ~3B activos | 262K | MLX 4 bits, Apple Silicon | Apache-2.0 | 21,6 GB; 95,2% acuerdo top-1 con bf16 |
| Qwen/Qwen3.6-35B-A3B (bf16) | 35B totales, ~3B activos | 262K | safetensors bf16 | Apache-2.0 | Referencia de maxima fidelidad; requiere mucha mas memoria |
| Builds hermanos LayerFit (2, 2.5 y 3 bits) | 35B totales, ~3B activos | 262K | MLX, Apple Silicon | Apache-2.0 | 10,3 GB, 13,7 GB y 16,1 GB respectivamente; menor fidelidad a cambio de menos memoria |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos de otros fabricantes para una comparacion cuantitativa; los unicos puntos de comparacion publicados son el modelo base en bf16 y las demas builds del mismo autor.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce degradacion medible: 95,2% de acuerdo top-1 y KL de 0,0129 frente a bf16, por lo que no es equivalente al modelo original.
- La build es especifica de MLX y Apple Silicon; no es portable a CUDA ni a motores de inferencia convencionales como vLLM o llama.cpp.
- El harness de evaluacion del autor es limitado (32 pasajes de 512 tokens y GSM8K-20), insuficiente para garantizar el comportamiento en dominios especializados.
- El modo thinking esta activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explicitamente.
- No se detalla la lista de idiomas soportados ni el comportamiento en idiomas distintos del ingles; el castellano no esta verificado en la informacion disponible.
- Riesgo de alucinacion y sesgos del modelo base: no se documentan en la informacion proporcionada, pero son inherentes a los modelos de lenguaje de gran escala.
- Licencia Apache-2.0 permite uso comercial, pero LayerFit es una marca registrada de NetProjects y el autor no esta afiliado a Alibaba Cloud ni al equipo Qwen; conviene revisar LICENSE y NOTICE antes de redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Build de 2 bits: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-2bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-2.5bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-3bit
- Otros modelos del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
