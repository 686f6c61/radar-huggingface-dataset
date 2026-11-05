# CalmCampus/calmcampus-reframe-1.7b-lora

## Resumen

CalmCampus Reframe es un adaptador LoRA en formato MLX (67 MB) entrenado sobre la base cuantizada a 4 bits de Qwen3-1.7B, orientado a la tarea de reformulación cognitiva en el ámbito del bienestar emocional y la terapia cognitivo-conductual (CBT). Lo publica el proyecto CalmCampus como vista previa de investigación (v0.1) y su función es proporcionar el delta de ajuste fino de forma aislada, de modo que sea posible inspeccionar exactamente qué se ha entrenado por encima del modelo base.

El modelo no es un sistema autónomo: es un adaptador que debe cargarse junto con `mlx-community/Qwen3-1.7B-4bit` mediante `mlx-lm`. La tarea, el contrato de prompt, la evaluación y las limitaciones se documentan en la model card del modelo fusionado y cuantizado a 4 bits, y se aplican igualmente a este adaptador. El autor lo etiqueta explícitamente como vista previa de investigación, no como dispositivo médico ni como detector de crisis independiente.

Su relevancia actual es doble: por un lado, demuestra un flujo de trabajo QLoRA completo sobre MLX (entrenamiento, fusión en bf16 y recuantización a 4 bits) en un modelo pequeño que cabe en hardware de consumo; por otro, ilustra los riesgos de publicar adaptadores de temática sensible sin evaluación clínica publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-1.7B) |
| Parametros totales | No disponible para el adaptador (67 MB en disco); el modelo base Qwen3-1.7B tiene 1,7 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | El adaptador se distribuye en formato MLX sin cuantizar; el base sobre el que se entrena es 4 bits |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (adaptador LoRA); modelo base en MLX 4 bits |
| Rango LoRA | 16 |
| Escala LoRA | 20 |
| Dropout LoRA | 0,05 (todas las capas) |
| Optimizador | Learning rate 1e-4, batch size 2, seed 42, 600 iteraciones configuradas |
| Checkpoint publicado | Paso 500, seleccionado puntuando checkpoints por comportamiento |
| Dataset de entrenamiento | CalmCampus/calmcampus-reframe-data |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA mediante `mlx-lm` sobre `mlx-community/Qwen3-1.7B-4bit`. La configuración LoRA aplica rango 16, escala 20 y dropout 0,05 en todas las capas del transformer, con learning rate 1e-4, batch size 2 y semilla 42 durante 600 iteraciones configuradas; se publica el checkpoint del paso 500, elegido por puntuación de comportamiento sobre los demás checkpoints.

Un detalle técnico relevante: el modelo de 4 bits publicado no es simplemente este adaptador aplicado sobre el base cuantizado. El adaptador se fusionó primero en el base en bf16 y el resultado se cuantizó después a 4 bits, un proceso que el repositorio fuente reproduce mediante el script `ml/package.sh`. Esto implica que los pesos del adaptador y los del modelo fusionado no son intercambiables sin tener en cuenta esa cadena de fusión y recuantización. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés orientada a reformulación cognitiva en el contexto de CBT y bienestar emocional.
- Reformulación de pensamientos o mensajes del usuario siguiendo un contrato de prompt definido en la model card del modelo fusionado.
- Ajuste fino específico de tarea sobre un modelo base pequeño (Qwen3-1.7B), lo que permite inspeccionar el delta de entrenamiento de forma aislada.
- Compatibilidad con el ecosistema MLX (`mlx-lm`) para carga de base más adaptador.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según el campo `language`.

## Casos de uso

- Investigación en ajuste fino con QLoRA sobre MLX: el adaptador sirve como referencia reproducible de un pipeline completo (entrenamiento, fusión en bf16, recuantización a 4 bits) para estudiar cómo afecta cada etapa al comportamiento final.
- Análisis de deltas de entrenamiento: al publicarse el adaptador por separado, un investigador puede comparar los pesos base con los ajustados para caracterizar qué regiones del modelo se han modificado con la tarea de reformulación.
- Prototipado de asistentes de reformulación cognitiva en inglés: integrable en un cuaderno o script local con `mlx-lm` para experimentar con prompts de CBT antes de invertir en modelos mayores.
- Evaluación de seguridad en modelos de temática sensible: permite reproducir y auditar el comportamiento del adaptador para comprobar si respeta el contrato de prompt y si evita respuestas inadecuadas en contextos de malestar emocional.
- Docencia y formación técnica: ejemplo didáctico de adaptador LoRA de bajo tamaño (67 MB) que cabe en hardware de consumo y se puede inspeccionar capa a capa.
- Desarrollo de pipelines de cuantización: útil para validar el efecto de fusionar un adaptador en bf16 y recuantizar a 4 bits frente a aplicar el adaptador directamente sobre un base ya cuantizado.
- Pruebas de integración en aplicaciones macOS/Apple Silicon: el formato MLX y el tamaño reducido lo hacen adecuado para validar flujos de inferencia local en equipos con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 67 MB en disco y se carga junto al base `mlx-community/Qwen3-1.7B-4bit`; el requisito real de memoria lo marca el base, no el adaptador.
- VRAM estimada para el base en 4 bits: no disponible de forma explícita en la información proporcionada; por el tamaño del modelo (1,7 mil millones de parámetros) es esperable que quepa en GPUs de consumo, pero no se confirma con cifras en la documentación consultada.
- GPU recomendadas: no especificadas en la información disponible. El formato MLX está orientado a Apple Silicon (memoria unificada), no a GPUs NVIDIA.
- Despliegue: `mlx-lm` es la vía documentada (`load("mlx-community/Qwen3-1.7B-4bit", adapter_path=path)`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| CalmCampus Reframe LoRA (este) | Adaptador sobre 1,7B | No disponible | MLX LoRA | Apache-2.0 | Vista previa de investigación, solo inglés, tarea CBT |
| Qwen3-1.7B (base) | 1,7B | No disponible en la informacion | Safetensors/MLX | Apache-2.0 | Modelo generalista sin ajuste de tarea |
| Modelos de bienestar/CBT comparables | No disponible | No disponible | No disponible | No disponible | No se identifican alternativas directas en la información proporcionada |

## Limitaciones y advertencias

- Vista previa de investigación (v0.1): el autor la declara explícitamente no apta como dispositivo médico.
- No es un detector de crisis independiente; no debe usarse como único mecanismo de seguridad en aplicaciones de salud mental.
- Solo soporta inglés; no se documenta cobertura multilingüe.
- No se publican benchmarks ni evaluación clínica en la información disponible, lo que impide cuantificar su calidad frente a alternativas.
- Riesgo de alucinación inherente a un modelo base de 1,7 mil millones de parámetros, potencialmente agravado en un dominio sensible donde una respuesta incorrecta puede tener consecuencias para el usuario.
- Sesgos: no documentados en la información proporcionada; el dataset de entrenamiento (`CalmCampus/calmcampus-reframe-data`) no se describe en composición ni procedencia.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de validación clínica desaconseja cualquier despliegue en producción sanitaria sin evaluación adicional.
- El adaptador no es directamente intercambiable con el modelo fusionado: la cadena de fusión en bf16 y recuantización a 4 bits debe reproducirse con cuidado.
- Longitud de contexto no documentada en la información disponible; conviene consultar la model card del base Qwen3-1.7B antes de diseñar prompts largos.

## Enlaces

- Adaptador LoRA en HuggingFace: https://huggingface.co/CalmCampus/calmcampus-reframe-1.7b-lora
- Modelo fusionado 4 bits: https://huggingface.co/CalmCampus/calmcampus-reframe-1.7b-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/CalmCampus/calmcampus-reframe-data
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Repositorio fuente (script `ml/package.sh`): no disponible como URL en la información proporcionada
