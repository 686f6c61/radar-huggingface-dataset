# makisekurisu-jp/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B es una cuantización publicada por el usuario makisekurisu-jp sobre el modelo base lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA (y su variante Ref2VA). Se trata de una variante afinada de Qwen3.5-9B orientada a la reescritura de prompts, empaquetada específicamente para su uso en ComfyUI, según indican las etiquetas del repositorio. El repositorio ocupa 9,1 GB, lo que sugiere pesos en precisión reducida respecto a un modelo de 9 000 millones de parámetros en FP16 (que rondaría los 18 GB).

El modelo resuelve un problema acotado: tomar una instrucción de usuario y reescribirla o expandirla en un prompt más detallado y estructurado, presumiblemente para alimentar pipelines de generación (el sufijo "FL2VA" y "Ref2VA" apunta a flujos de vídeo/imagen con referencia). Su relevancia es práctica para quienes trabajan con ComfyUI y necesitan un nodo de reescritura de prompts integrado en el grafo, con una ventana de contexto configurada de 16 384 tokens.

La información pública es muy escasa: no hay pipeline declarado, no se listan idiomas soportados, no hay benchmarks y la model card se limita a una tabla de parámetros de muestreo. La licencia declarada es "other" con nombre "qwen-research", heredada del modelo Qwen3.5-9B original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); detalles no disponibles |
| Parámetros totales | 9 000 millones (según el nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16 384 tokens (max_length configurado en la model card) |
| Tipos de cuantización | no disponible (el repo ocupa 9,1 GB, compatible con cuantización de ~8 bits o similar) |
| Idiomas soportados | no disponibles |
| Licencia | other / qwen-research (enlace a la licencia de Qwen3.5-9B) |
| Formato de pesos | no disponible (repo de 9,1 GB; etiquetado para ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de su origen en Qwen3.5-9B. El nombre indica un transformer de 9 000 millones de parámetros, pero no se detalla si emplea atención estándar, atención lineal u otras variantes. El modelo base declarado es lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA, con una variante adicional Ref2VA, y la relación declarada con esos modelos es "quantized", es decir, este repositorio es una cuantización de los mismos.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card únicamente documenta los parámetros de muestreo recomendados (temperature 0,7; top_k 20; top_p 0,8; repetition_penalty 1,0; seed 0) y la activación de modo thinking y de la plantilla por defecto. El campo "mtp: auto" sugiere algún tipo de gestión automática de multi-token prediction, pero no se aporta detalle técnico.

## Capacidades

- Reescritura y expansión de prompts: función principal del modelo, orientada a transformar instrucciones breves en descripciones detalladas.
- Modo thinking: la model card activa explícitamente "thinking: true", lo que implica generación de razonamiento intermedio antes de la respuesta.
- Integración con ComfyUI: el repositorio está etiquetado para su uso como nodo dentro de flujos de ComfyUI.
- Plantilla de chat por defecto: "use_default_template: true" indica que el modelo usa un formato de conversación predefinido.
- Soporte multilingüe: no disponible (no se declaran idiomas).
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Reescritura de prompts en ComfyUI: el modelo se inserta como nodo previo a un generador de imagen o vídeo para expandir la instrucción del usuario en un prompt más rico y estructurado, aprovechando su etiquetado específico para ComfyUI.
- Estandarización de prompts en pipelines de producción: dado su contexto de 16 384 tokens, puede recibir instrucciones largas junto con ejemplos de estilo y devolver un prompt normalizado, útil para equipos que necesitan consistencia entre distintos generadores.
- Expansión de descripciones para generación de vídeo con referencia: las variantes FL2VA y Ref2VA del modelo base apuntan a flujos first-last-frame-to-video-audio y reference-to-video-audio, por lo que la reescritura puede adaptarse a esos formatos.
- Preprocesado por lotes: al ser un modelo de 9B cuantizado a ~9 GB, puede ejecutarse en una sola GPU consumer para reescribir grandes volúmenes de prompts de forma offline antes de lanzar los trabajos de generación.
- Asistente de escritura de prompts para usuarios noveles: el modo thinking permite que el modelo razone sobre la intención del usuario y produzca una descripción más completa, reduciendo la curva de aprendizaje en herramientas de generación.
- Evaluación A/B de prompts: integrar el modelo en un script que genere variantes de un mismo prompt para comparar resultados de generación, usando los parámetros de muestreo documentados para reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 9,1 GB, por lo que la inferencia requiere al menos ~10-12 GB de VRAM considerando overhead de contexto y KV cache con 16 384 tokens.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para comodidad con contexto completo; GPUs de 16 GB pueden funcionar con contexto reducido.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más, ajustando la longitud de contexto.
- Opciones de despliegue: ComfyUI (uso previsto según las etiquetas); llama.cpp, Ollama, vLLM o TGI son opciones plausibles para un transformer de 9B, pero no se confirman en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B (este repo) | 9B | 16 384 | qwen-research | HuggingFace, cuantización de comunidad |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA | no disponible | no disponible | no disponible | HuggingFace (modelo base) |
| Qwen3.5-9B | 9B | no disponible | qwen-research | HuggingFace (modelo original) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Información pública mínima: sin benchmarks, sin idiomas declarados y sin pipeline, lo que dificulta evaluar su calidad frente a alternativas.
- Licencia qwen-research: restringe el uso comercial; es necesario revisar el enlace a la licencia de Qwen3.5-9B antes de cualquier despliegue en producción.
- Es una cuantización de comunidad: el autor no es el desarrollador original, por lo que puede haber degradación respecto a los pesos base FL2VA/Ref2VA.
- Especialización estrecha: está entrenado para reescritura de prompts; no debe esperarse buen rendimiento en tareas generales de razonamiento, código o matemáticas.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar detalles en los prompts reescritos que no estaban en la instrucción original.
- Sin datos de sesgo: no se ha publicado información sobre sesgos demográficos o lingüísticos.
- Fecha de creación futura en los metadatos (2026-10-30): conviene verificar la integridad del repositorio antes de confiar en él.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/makisekurisu-jp/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B
- Modelo base FL2VA: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA
- Modelo base Ref2VA: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA
- Licencia Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
