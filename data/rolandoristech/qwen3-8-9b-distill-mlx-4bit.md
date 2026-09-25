# RolanDorisTech/Qwen3.8-9B-Distill-MLX-4bit

## Resumen

RolanDorisTech/Qwen3.8-9B-Distill-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo empero-ai/Qwen3.8-9B-Distill, un distill comunitario de Qwen/Qwen3.5-9B. El repositorio es en realidad un alias de busqueda de RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ4e: comparte exactamente los mismos pesos y el mismo metodo de cuantizacion, y puede invocarse indistintamente con cualquiera de los dos identificadores. Su proposito es ofrecer una build de ~4 bits lista para ejecutarse en Apple Silicon mediante MLX.

El modelo tiene aproximadamente 9.000 millones de parametros, es denso (no MoE) y conserva la ventana de contexto nativa de 262.144 tokens de la arquitectura Qwen3.5. Los pesos ocupan 4,9 GB y se distribuyen como safetensors de MLX, lo que permite usarlos con mlx-lm, oMLX, LM Studio y mlx-swift. La cuantizacion emplea el metodo oQ4e, que no es un 4-bit uniforme tipo Q4_K_M, sino una precision mixta con ponderacion por importancia de activaciones (imatrix).

Su relevancia es practica: permite ejecutar localmente un modelo de 9B con contexto largo en equipos de consumo con memoria unificada, sin depender de GPU dedicada ni de servicios en la nube. Es un artefacto de cuantizacion, no un modelo entrenado desde cero, por lo que su calidad final depende enteramente del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5; `model_type` "qwen3_5") |
| Parametros totales | 9B (aproximadamente 9.000 millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | oQ4e (clase 4-bit, precision mixta no uniforme con imatrix); existe una variante hermana en oQ5e |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (4,9 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5, identificada en la configuracion como `model_type: "qwen3_5"`, un transformer decoder-only denso de aproximadamente 9.000 millones de parametros. El modelo base, empero-ai/Qwen3.8-9B-Distill, es un distill de parametros completos de Qwen/Qwen3.5-9B realizado por terceros; el repositorio de referencia advierte explicitamente que no se trata de un lanzamiento oficial de Qwen3.8 y que los runtimes despachan por arquitectura (`qwen3_5`), no por el nombre comercial. La plantilla de chat es la de Qwen3 e incluye etiquetas `<think>` para el modo de razonamiento.

Sobre el entrenamiento del base no hay informacion disponible en la documentacion consultada: no se detallan el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica de este repositorio concreto es la cuantizacion: oQ4e combina una asignacion de bits no uniforme por sensibilidad de capa con una pasada de calibracion de importancia de activaciones (imatrix), dando mas bits a capas sensibles como `lm_head`, los embeddings y el primer y ultimo bloque del transformer, y comprimiendo mas agresivamente las capas tolerantes. La salida sigue siendo safetensors estandar de MLX, compatible a nivel de formato con las herramientas habituales.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un distill orientado a tareas de razonamiento y usa el chat template de Qwen3 con etiquetas `<think>`.
- Modo de pensamiento explicito: la plantilla incluye `<think>`, lo que permite separar la cadena de razonamiento de la respuesta final.
- Contexto largo: ventana nativa de 262.144 tokens, apta para documentos extensos y conversaciones multi-turno prolongadas.
- Generacion de codigo: capacidad heredada del modelo base, si bien no hay evaluaciones publicadas para esta cuantizacion concreta.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se especifican los idiomas soportados.
- Vision o audio: no disponible; la pipeline declarada es unicamente `text-generation`.

## Casos de uso

- Inferencia local en Apple Silicon: ejecutar el modelo con mlx-lm o LM Studio en un Mac con memoria unificada, aprovechando los 4,9 GB de pesos para mantener un consumo de memoria contenido frente a una build fp16 de ~18 GB.
- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo, es adecuado para resumir, extraer informacion o responder preguntas sobre contratos, informes o repositorios de documentacion completos en una sola pasada.
- Asistencia de programacion offline: integracion en editores o scripts locales que necesitan autocompletado y explicacion de codigo sin enviar el codigo a un servicio externo.
- Prototipado y evaluacion de la cuantizacion: util para medir la degradacion real de oQ4e frente al modelo base o frente a la variante oQ5e de 6,0 GB en tareas propias.
- Aplicaciones con requisitos de privacidad: al ejecutarse integramente en local, los datos no abandonan el equipo, lo que encaja en entornos con restricciones de confidencialidad.
- Razonamiento con modo de pensamiento: tareas que se benefician de una cadena de razonamiento separada, como problemas matematicos, analisis paso a paso o depuracion de logica, usando el etiquetado `<think>`.
- Despliegue en macOS y iOS/macOS via mlx-swift: la compatibilidad declarada con mlx-swift abre la puerta a integrar el modelo en aplicaciones nativas de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este modelo ni para su cuantizacion oQ4e concreta.

La model card incluye una tabla comparativa entre cuantizacion uniforme y oQ medida sobre Qwen3.5-35B-A3B en MMLU (300 muestras). Se reproduce a continuacion, con la advertencia explicita del propio autor de que documenta la metodologia oQ y **no** es una evaluacion de calidad de estos modelos Qwen3.8 Distill:

| Bits | Uniforme Q (mlx-lm) | oQ |
|---:|---:|---:|
| 2-bit | 14,0 % | 64,0 % |
| 3-bit | 76,3 % | 85,0 % |
| 4-bit | 79,7 % | 83,3 % |

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 4,9 GB. En la practica, una sesion con contexto corto ronda los 6-7 GB de memoria, a los que hay que sumar la cache KV, que crece de forma apreciable al acercarse a los 262.144 tokens de contexto.
- Plataforma: MLX esta disenado para Apple Silicon, por lo que el despliegue natural es en Mac con chip de la serie M y memoria unificada.
- Equipos de consumo: cabe holgadamente en Mac con 16 GB de memoria unificada para contexto moderado; para explotar ventanas de contexto muy largas conviene disponer de 32 GB o mas.
- GPU dedicadas (A100, H100, RTX 4090): no es la via prevista, ya que el formato MLX no esta pensado para CUDA. Para esas GPUs habria que recurrir a otra build del modelo base.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`), oMLX, LM Studio y mlx-swift. La compatibilidad en tiempo de ejecucion debe verificarse contra la version concreta de cada aplicacion.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| RolanDorisTech/Qwen3.8-9B-Distill-MLX-4bit (oQ4e) | 9B | 262.144 | MLX safetensors, 4,9 GB | Apache-2.0 | Objeto de esta ficha |
| RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e | 9B | 262.144 | MLX safetensors, 6,0 GB | Apache-2.0 | Misma serie, mas bits |
| empero-ai/Qwen3.8-9B-Distill | 9B | no disponible | no disponible | no disponible | Modelo base sin cuantizar |
| Qwen3.8 9b Distill (GGUF) | 9B | no disponible | GGUF, 18,9 GB | no disponible | Distribucion GGUF del mismo base |

El GGUF de 18,9 GB corresponde a una precision mucho mayor (compatible con fp16 para un modelo de 9B), por lo que no es directamente comparable en consumo de memoria con la build MLX de 4,9 GB.

## Limitaciones y advertencias

- Es un artefacto de cuantizacion, no un modelo nuevo: toda su calidad proviene del base empero-ai/Qwen3.8-9B-Distill, y la cuantizacion a clase 4-bit introduce una degradacion que no se ha medido publicamente para esta build.
- El nombre puede inducir a error: el modelo base es un distill de Qwen/Qwen3.5-9B realizado por terceros y el repositorio de referencia indica explicitamente que no es un lanzamiento oficial de Qwen3.8. La arquitectura real es `qwen3_5`.
- `oQ4e` no es un 4-bit uniforme: es precision mixta no uniforme con imatrix. Las comparaciones directas con Q4_K_M o con 4-bit uniforme no son equivalentes.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual para esta cuantizacion; debe asumirse el riesgo habitual de los modelos de 9B destilados.
- Idiomas soportados: no disponibles. No hay confirmacion de cobertura multilingue mas alla de la del modelo base.
- Sesgos: no disponible. No se documentan evaluaciones de sesgo.
- Compatibilidad de runtime: aunque se declara compatibilidad con mlx-lm, oMLX, LM Studio y mlx-swift, el propio autor recomienda verificar la version concreta de cada aplicacion.
- Contexto largo costoso: los 262.144 tokens son nativos, pero la cache KV a esa longitud exige mucha memoria; en equipos de 16 GB habra que limitar la ventana efectiva.
- Repositorio con traccion nula: cero descargas y cero likes en el momento de la consulta, lo que reduce la validacion de la comunidad sobre esta build concreta.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de sus dependencias antes de desplegarlo en produccion.

## Enlaces

- HuggingFace (repositorio objeto de la ficha): https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-4bit
- Repositorio canonico con documentacion completa (oQ4e): https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ4e
- Variante oQ5e: https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Build MLX comunitaria de referencia (notas sobre arquitectura `qwen3_5`): https://github.com/drmhse/qwen38-9b-mlx
- Distribucion GGUF del mismo base: https://local-ai-zone.github.io/models/qwen3-8-9b-distill.html
- Metodologia de cuantizacion oQ: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Paper SqueezeLLM: https://arxiv.org/abs/2306.07629
- Documentacion de imatrix en LLM Compressor: https://docs.vllm.ai/projects/llm-compressor/en/latest/examples/imatrix/
- Canal del autor: https://www.youtube.com/@RolanDorisTech
