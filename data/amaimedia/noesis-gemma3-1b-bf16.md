# AMAImedia/NOESIS-Gemma3-1B-BF16

## Resumen

NOESIS-Gemma3-1B-BF16 es un fine-tune LoRA-merged del modelo base `google/gemma-3-1b-it`, desarrollado por AMAImedia como parte de la familia NOESIS de codificadores de texto para el pipeline de audio Scenema-DiT. Su función principal es servir como "estudiante" ligero de validación de recetas (recipe-validation) para el estudiante primario de 4B, generando embeddings de texto per-token de 3840 dimensiones mediante una proyección lineal adicional (1152 → 3840). El modelo está completamente fusionado en BF16, sin adaptadores residuales, y se distribuye en un único archivo `model.safetensors` de aproximadamente 1,86 GB.

La relevancia de este modelo radica en su papel como banco de pruebas para el ajuste fino de codificadores de texto orientados a generación de audio, permitiendo validar recetas de entrenamiento a menor escala antes de escalar a modelos más grandes. Aunque no está pensado para producción (ese rol corresponde al hermano de 4B), ofrece una vía de experimentación económica y reproducible. La licencia es Apache-2.0 para el delta LoRA y el empaquetado, pero los pesos base de Gemma 3 heredan los Gemma Terms of Use de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3ForConditionalGeneration (variante 1B IT) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | BF16 (unico formato publicado) |
| Idiomas soportados | en, multilingual (sin lista detallada) |
| Licencia | Apache-2.0 (delta LoRA y empaquetado) + Gemma Terms of Use (pesos base) |
| Formato de pesos | safetensors (un solo shard, ~1,86 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, una arquitectura transformer decoder-only con 26 capas ocultas, hidden size de 1152, 4 cabezas de atencion y 1 cabeza clave-valor (GQA 4:1). Sobre esta base se aplicaron dos adaptadores LoRA: `cinema` con r=8 (entrenado con 60K pares) y `autoif-v2` con r=16, que posteriormente se fusionaron en los pesos base mediante PEFT `merge_and_unload`. El resultado es un modelo completamente fusionado en BF16, sin capas de adaptador residuales.

El entrenamiento se enmarca en el pipeline NOESIS para Scenema, un codificador de texto con atencion cruzada para modelos de difusion de audio (DiT). El pipeline requiere embeddings de texto per-token de 3840 dimensiones, mientras que el estado oculto del modelo base es de ~1152 dimensiones; por ello se entrena por separado un adaptador `scenema_adapter.pt` (proyeccion lineal 1152 → 3840) que conecta con el layout `audio_aggregate_embed` del DiT. No se mencionan tecnicas como RLHF o DPO en la documentacion disponible.

## Capacidades

- Generacion de embeddings de texto per-token de 3840 dimensiones para el pipeline de audio Scenema-DiT, mediante la proyeccion lineal externa.
- Funcion como codificador de texto (text encoder) en sistemas de generacion de audio con atencion cruzada.
- Al estar basado en Gemma 3 1B IT, conserva la arquitectura de generacion de texto y el tokenizador de 262.144 entradas, aunque su uso previsto no es el chat generico.
- Soporte multilingue heredado del modelo base (aunque no se detalla la lista de idiomas).
- Capacidad de validacion de recetas de entrenamiento a escala reducida (smoke tests) antes de escalar a modelos mayores.

## Casos de uso

- Validacion de recetas de entrenamiento (recipe-validation): el modelo se usa para probar el adaptador `scenema_adapter` en fase 1D antes de escalar al estudiante de 4B, reduciendo costes y tiempo de iteracion.
- Experimentacion con codificadores de texto para audio: permite probar variaciones de LoRA, tasas de aprendizaje o configuraciones de proyeccion sin comprometer recursos de un modelo grande.
- Desarrollo de pipelines de generacion de audio condicionada por texto: integrado con Scenema-DiT y LTX2.3, genera representaciones textuales que guian la sintesis de audio.
- Pruebas de compatibilidad con infraestructura de inferencia: al ser un modelo de ~1B en BF16, sirve para verificar despliegues en entornos con recursos limitados antes de usar el modelo de 4B.
- Benchmarking interno de calidad de embeddings: comparar la calidad de las representaciones de texto generadas por el estudiante de 1B frente al de 4B para decidir el punto de escalado.
- Formacion y demostraciones: como modelo ligero, puede usarse en entornos educativos o demos para ilustrar el flujo de fine-tuning LoRA y fusion de pesos en codificadores multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en BF16 (calculado a partir de ~1B parametros × 2 bytes por parametro, mas overhead de activaciones; valor estimado, no proporcionado por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en BF16; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. No se especifican requisitos oficiales.
- Al ser un modelo de 1B, cabe en GPUs de consumo y tambien en entornos CPU con suficiente RAM (aunque con menor rendimiento).
- Opciones de despliegue: al ser un modelo transformers estandar con pesos safetensors, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI y cualquier framework que soporte Gemma 3. No se documentan configuraciones especificas de latencia o throughput.
- Para el uso previsto como codificador de texto en el pipeline Scenema, se requiere ademas el adaptador `scenema_adapter.pt` (proyeccion 1152 → 3840), que no se incluye en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rol |
|---|---|---|---|---|
| NOESIS-Gemma3-1B-BF16 (este) | ~1B | no disponible | Apache-2.0 + Gemma Terms | Estudiante de validacion |
| NOESIS-Gemma3-4B-Scenema-LTX2.3-BF16 | ~4B | no disponible | Apache-2.0 + Gemma Terms | Estudiante primario de produccion |
| google/gemma-3-1b-it (base) | ~1B | 32K (segun especificaciones de Google, no confirmado en este repo) | Gemma Terms of Use | Modelo base de chat |

No se dispone de datos de rendimiento comparativo. La comparacion estructural muestra que el modelo de 4B es el destinado a produccion, mientras que este de 1B es un companion de validacion. Frente al base, la diferencia principal es el fine-tune LoRA y la proyeccion a 3840 dimensiones.

## Limitaciones y advertencias

- No es un modelo de produccion: su rol es de validacion y experimentacion; el pipeline de produccion usa el estudiante de 4B.
- Requiere el adaptador `scenema_adapter.pt` (no incluido en el repositorio) para funcionar como codificador de texto en el pipeline Scenema.
- Licencia dual: aunque el delta LoRA y el empaquetado son Apache-2.0, los pesos base de Gemma 3 estan sujetos a los Gemma Terms of Use de Google, que imponen restricciones de redistribucion y atribucion.
- No se documentan sesgos especificos, pero al derivar de Gemma 3 1B IT, puede heredar sesgos del modelo base.
- Riesgo de alucinacion en generacion de texto generico, aunque su uso previsto no es la generacion conversacional.
- Longitud de contexto no especificada en la documentacion; se asume la del base (32K) pero no esta confirmada.
- Sin benchmarks publicados, por lo que no se puede evaluar su calidad relativa frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/AMAImedia/NOESIS-Gemma3-1B-BF16
- Organizacion: https://www.amaimedia.com
- X (Twitter): https://x.com/AMAImediacom
- LinkedIn: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram: https://t.me/AMAImediacom
