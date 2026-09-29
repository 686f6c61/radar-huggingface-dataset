# Johneeee/Qwen3.6-27B-Fable-Fusion-711-uncher-NM-DAU-MTP-oQ5e-6target-bf16-last4_8bit-vision-mtp

## Resumen

Este repositorio contiene una cuantizacion en 5 bits del modelo Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP, un modelo de lenguaje causal de aproximadamente 27,8 mil millones de parametros construido por DavidAU y colaboradores mediante un proceso de ajuste fino y fusion (merge) en multiples etapas sobre la base Qwen3.6. El autor de este repositorio concreto, Johneeee, ha aplicado una cuantizacion de precision mixta con la herramienta oQ (oMLX v0.7.0.dev4) para generar pesos en formato MLX safetensors, pensados para ejecutarse en Apple Silicon.

La relevancia del modelo original radica en que, segun fuentes secundarias, seria el primero de su tamano en superar los 700 puntos en la prueba ARC-C tanto en cuantizacion de 4 bits como de 8 bits, por delante del Qwen3.6-27B base y del Qwen3.6-35B-A3B. Este repositorio no aporta datos propios de evaluacion: se limita a redistribuir el modelo cuantizado en 5 bits (group size 64) para el ecosistema MLX.

La informacion disponible es muy limitada: no se declaran licencia, idiomas soportados, longitud de contexto ni pipeline. El nombre del modelo incluye terminos como "vision" y "mtp" cuyo significado no queda confirmado en la model card ni en las fuentes consultadas, por lo que se tratan como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Qwen3.6 (model type declarado: qwen3_5); posible MTP no confirmado |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, group size 64, precision mixta (oQ / oMLX v0.7.0.dev4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 22,4 GB |
| Libreria | mlx |

## Arquitectura y entrenamiento

El modelo base es de tipo causal (decoder-only) basado en Qwen3.6, tal como indican las fuentes secundarias consultadas. La model card de este repositorio solo declara el campo `model type: qwen3_5`, sin detallar si emplea atencion densa, atencion lineal, mezcla de expertos (MoE) o alguna variante hibrida. El nombre del repositorio incluye el sufijo "MTP", que en la literatura suele asociarse a Multi-Token Prediction, pero no se ha confirmado esta interpretacion en ninguna fuente disponible.

Respecto al entrenamiento del modelo original, las fuentes describen un proceso de ajuste fino y fusion en multiples etapas sobre Qwen3.6, sin especificar el numero de tokens empleados, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Este repositorio concreto no describe entrenamiento adicional: unicamente la cuantizacion realizada con oQ (oMLX v0.7.0.dev4), que aplica precision mixta a 5 bits con group size 64 y conserva algunas capas en bf16 y 8 bits, segun se deduce del propio nombre del modelo.

## Capacidades

- Generacion de texto y razonamiento general: heredadas del modelo base Qwen3.6-27B, sin detalles especificos en la informacion disponible.
- Posible soporte de vision: el nombre del repositorio incluye el termino "vision", pero la model card no lo confirma ni describe ninguna capacidad multimodal.
- Posible prediccion multi-token (MTP): el sufijo "MTP" aparece en el nombre, sin confirmacion documental.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modelo sin censura ("uncensored", "heretic"): indicado en el nombre del modelo original y en los repositorios enlazados, sin detalle tecnico sobre el proceso de desalineacion aplicado.

## Casos de uso

- Ejecucion local en Apple Silicon: al estar en formato MLX safetensors, esta orientado a su uso en Macs con chip M-series mediante la libreria MLX, aprovechando la memoria unificada para cargar los ~22,4 GB de pesos.
- Prototipado e investigacion sobre fusion de modelos: util para estudiar como se comporta un merge multi-etapa de 27B frente al modelo base, especialmente en tareas de razonamiento tipo ARC-C segun las fuentes.
- Generacion de texto sin restricciones tematicas: dado el caracter "uncensored" del modelo original, encaja en entornos de investigacion donde se busca estudiar el comportamiento del modelo sin filtros de alineacion, siempre con supervision humana.
- Evaluacion comparativa de cuantizaciones: este repositorio permite comparar el rendimiento de una cuantizacion 5 bits de precision mixta frente a las variantes de 4 y 8 bits publicadas por otros autores.
- Despliegue de bajo consumo en estaciones de trabajo Mac: para desarrolladores que necesitan un modelo de ~27B ejecutandose en local sin GPU dedicada NVIDIA.
- Integracion en pipelines de investigacion sobre alineacion y desalineacion: el modelo permite analizar el impacto de los procesos de fine-tune orientados a eliminar rechazos de contenido.
- Base para ajuste fino posterior: al estar en safetensors, puede servir como punto de partida para fine-tuning adicional en el ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios en la informacion disponible para este repositorio concreto. Las fuentes secundarias atribuyen al modelo original (DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP) los siguientes datos, que no se han podido verificar de forma independiente:

| Benchmark | Resultado declarado | Fuente |
|---|---|---|
| ARC-C (8 bits) | > 700 | hackernoon.com, featherless.ai (fuentes secundarias) |
| ARC-C (4 bits) | > 700 | hackernoon.com, featherless.ai (fuentes secundarias) |
| Comparativa frente a Qwen3.6-27B base y Qwen3.6-35B-A3B | Rendimiento superior declarado | featherless.ai (fuente secundaria) |

No se dispone de valores de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion proporcionada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 22,4 GB, por lo que se recomienda un minimo de 24 GB de memoria unificada disponible para la carga en MLX, con margen adicional para el contexto.
- Plataforma objetivo: MLX esta disenado para Apple Silicon, por lo que las GPU NVIDIA (A100, H100, RTX 4090) no son el destino natural de este formato de pesos.
- Equipos compatibles: Macs con chip M-series y memoria unificada de 32 GB o superior (M1/M2/M3/M4 Pro, Max o Ultra). En configuraciones de 16 GB no cabria.
- Opciones de despliegue: MLX y oMLX. No es compatible directamente con vLLM, TGI o llama.cpp en su formato MLX safetensors; para esos entornos habria que recurrir a las variantes GGUF publicadas por otros autores.
- Latencia y throughput: no disponibles. Dependeran del chip concreto, del ancho de banda de memoria y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Johneeee/Qwen3.6-27B-Fable-Fusion-711-...-oQ5e-...-vision-mtp (este) | ~27,8 B | no disponible | 5 bits, precision mixta | no disponible | MLX safetensors |
| DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP | ~27 B | no disponible | bf16 (original) | no disponible | safetensors |
| DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF | ~27 B | no disponible | GGUF (varias) | no disponible | GGUF |
| Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ5e | ~27 B | no disponible | 5 bits (oQ) | no disponible | MLX safetensors |
| Qwen3.6-27B (base) | ~27 B | no disponible | varias | no disponible | safetensors |

No se dispone de datos suficientes (contexto, licencia, benchmarks verificables) para realizar una comparativa cuantitativa rigurosa entre estas variantes.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se especifican los terminos de uso, por lo que se desconoce si se permite el uso comercial. Habria que consultar la licencia del modelo original de DavidAU y de Qwen3.6 antes de cualquier uso en produccion.
- Modelo "uncensored" y "heretic": el propio nombre indica que se ha reducido o eliminado la alineacion de seguridad, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado sin filtros. No es adecuado para desplegar en aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de fidelidad para este modelo ni para su base.
- Idiomas soportados no declarados: se desconoce el rendimiento real en castellano y en otras lenguas distintas del ingles.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas que requieran ventanas largas (documentos extensos, conversaciones multi-turno largas) sin verificacion previa.
- Formato altamente especifico: solo es utilizable en el ecosistema MLX (Apple Silicon). No es portable a GPU NVIDIA sin conversion a GGUF u otros formatos.
- Repositorio sin descargas ni likes: creado y actualizado el 2026-09-29, no cuenta con validacion de la comunidad ni con reportes de uso independientes.
- Trazabilidad limitada: la model card no documenta la procedencia exacta de los pesos base, el proceso de fusion ni las capas que se mantienen en bf16 y 8 bits, a pesar de que el nombre del modelo sugiere una configuracion concreta ("bf16-last4_8bit").
- Terminos "vision" y "mtp" en el nombre sin confirmacion documental: no se debe asumir que el modelo tiene capacidades multimodales o de prediccion multi-token sin verificarlo.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/Johneeee/Qwen3.6-27B-Fable-Fusion-711-uncher-NM-DAU-MTP-oQ5e-6target-bf16-last4_8bit-vision-mtp
- Variante oQ5e del mismo autor: https://huggingface.co/Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ5e
- Variante GGUF (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo original en Featherless: https://featherless.ai/models/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Articulo en HackerNoon sobre el modelo original: https://hackernoon.com/qwen36-27b-fable-fusion-breaks-the-700-arc-c-barrier
- Video analisis en YouTube: https://www.youtube.com/watch?v=9EM5I7dJN4Q
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
