# hanseungwook/nanochat-rsm-checkpoints

## Resumen

Este repositorio contiene los checkpoints finales de un experimento controlado de comparación de objetivos de entrenamiento en el marco de NanoChat, un transformer decoder-only compacto desarrollado por Andrej Karpathy. El autor, Seungwook Han, entrena cinco modelos con el mismo presupuesto de parámetros (profundidad 10), el mismo tokenizer, el mismo orden de datos empaquetados, un contexto de 2048 tokens y 99.347.333.120 tokens de entrenamiento. Los cinco modelos comparan: autoregresión ordinaria (AR), predicción multi-token con cuatro cabezas (MTP-4, inspirada en FAIR/Meta) y tres variantes de recurrent-state matching (RSM) de horizonte exacto con diferentes valores de gamma (0.99, 0.90, 0.75). El objetivo es evaluar si el RSM mejora la predicción de estado recurrente frente a los métodos estándar.

Estos checkpoints son crudos de PyTorch, no modelos Transformers listos para usar con HuggingFace Transformers; requieren el repositorio NanoChat para cargarlos. Son modelos base, sin ajuste por chat ni instrucciones. El interés principal es académico: estudiar el impacto del RSM en la calidad de representaciones y generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (NanoChat) |
| Parametros totales | no disponible (presupuesto de profundidad 10) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch, sin cuantizacion) |
| Idiomas soportados | no disponible (dataset Nemotron, probablemente ingles y otros, pero no especificado) |
| Licencia | other (mezcla de CC BY 4.0, CC BY-SA 4.0, GFDL; ver aviso) |
| Formato de pesos | PyTorch (archivos .pt) |

## Arquitectura y entrenamiento

Los modelos siguen la arquitectura NanoChat, un transformer decoder-only compacto diseñado para entrenamiento eficiente y educativo. Incluye innovaciones comunes en transformers modernos, como probablemente atencion multi-cabeza, normalizacion RMSNorm, etc., aunque no se detallan en la informacion. El entrenamiento se realizo sobre el dataset `nvidia/Nemotron-Pretraining-Specialized-v1` con el tokenizer de `karpathy/nanochat-d32`. Se uso AdamW, contexto de 2048 tokens, y un total de 99.347.333.120 tokens. Los cinco modelos se entrenaron con el mismo presupuesto y datos, variando solo el objetivo de entrenamiento:

- `ar`: prediccion de siguiente token estandar.
- `mtp4`: prediccion multi-token con cuatro cabezas (predice los siguientes 4 tokens simultaneamente desde un tronco compartido).
- `rsm-exact-horizon099`, `rsm-exact-horizon090`, `rsm-exact-horizon075`: combinan la prediccion de siguiente token con una cabeza de flujo RSM de horizonte exacto, usando un parametro gamma de curriculum truncado-geometrico (0.99, 0.90, 0.75) que controla la distribucion de horizontes.

No se especifican detalles adicionales como numero de capas, dimensiones, o si hay atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva: los cinco modelos pueden generar texto condicionado a un prompt, como se muestra en el ejemplo de codigo.
- Prediccion multi-token (solo `mtp4`): tiene cuatro cabezas que predicen los proximos 4 tokens, lo que podria acelerar la inferencia si se usa decodificacion especulativa.
- Recurrent-state matching (solo variantes RSM): incorpora una cabeza auxiliar que intenta igualar el estado recurrente a un horizonte exacto, lo que podria mejorar la representacion interna.
- Los modelos son base, sin capacidades de chat, tool calling, agentes, vision ni audio.
- Multilinguismo: no especificado, pero el dataset Nemotron es principalmente ingles y otros idiomas, sin confirmacion.

## Casos de uso

Dado que son modelos base de investigacion, los casos de uso son principalmente academicos y de experimentacion:

- Investigacion en objetivos de entrenamiento: comparar el efecto del RSM frente a AR y MTP en la calidad de generacion y representaciones.
- Estudio de decodificacion especulativa: el modelo `mtp4` puede usarse para probar esquemas de prediccion multi-token y su impacto en el throughput.
- Analisis de representaciones internas: los checkpoints permiten extraer estados ocultos para estudiar como el RSM afecta la estructura de representaciones.
- Fine-tuning posterior: aunque son base, pueden servir como punto de partida para ajuste fino en tareas especificas, comparando que objetivo de preentrenamiento produce mejores resultados.
- Reproduccion de experimentos: dado que se publican los checkpoints y metadatos, se pueden reproducir los resultados y verificar las afirmaciones del paper.
- Desarrollo de nuevas arquitecturas: los checkpoints RSM pueden inspirar nuevas variantes de entrenamiento recurrente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval, GSM8K, etc. Tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

- Tamano del repo: 4.4 GB, lo que sugiere que cada checkpoint ocupa alrededor de 1 GB (5 modelos, aunque no se sabe el peso exacto). Con profundidad 10 y contexto 2048, es probable que el modelo tenga menos de 1B parametros, quizas alrededor de 100-500M. Pero no se especifica.
- VRAM estimada: para inferencia con precision FP32, un modelo de ~500M parametros requeriria ~2 GB de VRAM; con FP16, ~1 GB. Pero sin conocer el tamano exacto, es dificil estimar.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM deberia ser suficiente. Por ejemplo, RTX 3060, RTX 4090, etc.
- Opciones de despliegue: al ser checkpoints de PyTorch crudos, se requiere el repositorio NanoChat para cargarlos. No se mencionan vLLM, Ollama, etc. Se podria convertir a Transformers si se implementa la arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables directamente, ya que estos son checkpoints de investigacion de un experimento controlado. Se podria comparar con otros modelos base de tamano similar como GPT-2 pequeno o Pythia-160M, pero no se tienen datos de rendimiento. Por lo tanto, indico "no disponible".

## Limitaciones y advertencias

- Son modelos base sin ajuste por instrucciones, por lo que no son adecuados para tareas de chat o seguir instrucciones directamente.
- No se han publicado benchmarks, por lo que no se conoce su rendimiento real en tareas estandar.
- La licencia es "other" debido a la mezcla de procedencias del dataset; los usuarios deben revisar los terminos del dataset Nemotron y de las partes con licencias CC BY-SA y GFDL.
- Los checkpoints son especificos de la implementacion NanoChat y no son compatibles con Transformers de HuggingFace sin conversion.
- No se proporcionan detalles sobre sesgos o alucinaciones, pero al ser modelos base entrenados en datos web, pueden presentar sesgos.
- El contexto es de solo 2048 tokens, limitado para tareas de largo alcance.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hanseungwook/nanochat-rsm-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Pretraining-Specialized-v1
- Tokenizer: https://huggingface.co/karpathy/nanochat-d32
- GitHub de NanoChat: https://github.com/karpathy/nanochat
- GitHub del autor: https://github.com/hanseungwook
- Documentacion de NanoChat en HuggingFace: https://huggingface.co/docs/transformers/v5.8.0/en/model_doc/nanochat
- DeepWiki sobre checkpoint management: https://deepwiki.com/karpathy/nanochat/11.1-checkpoint-management
