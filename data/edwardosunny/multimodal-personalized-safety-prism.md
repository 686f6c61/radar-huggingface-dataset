# EdwardoSunny/multimodal-personalized-safety-prism

## Resumen

PRISM (Personalized Safety via Retrieval and Input Screening Monitor) es un monitor de entrada ligero para modelos vision-lenguaje (VLM) desarrollado por Edward Sun y colaboradores (Universidad de Washington, entre otras instituciones), presentado en el paper de COLM 2026 *When Seeing Overrides Knowing: Visual Dominance and Deferral-Based Method for Personalized Safety in VLMs*. No es un VLM generativo, sino un clasificador binario que, dada una pareja (imagen, consulta), predice si la respuesta segura requiere el contexto personal del usuario (médico, emocional o situacional) y por tanto debe diferirse en lugar de responderse de forma genérica.

El modelo aborda el fenómeno de "dominancia visual": en VLMs, la imagen tiende a pesar más que el conocimiento previo del modelo, lo que puede producir respuestas que son razonables en abstracto pero inseguras para un usuario concreto. PRISM se sitúa como una capa previa al VLM: lee embeddings congelados de un encoder visual-textual (SigLIP2, CLIP o EVA-CLIP) y los fusiona mediante modulación cross-modal bidireccional (Bi-FiLM) para emitir una probabilidad de deferral.

El repositorio contiene únicamente las cabezas entrenables (0,1 GB, safetensors), mientras que los encoders congelados se descargan de sus respectivos repos de Hugging Face. Es relevante ahora porque propone un mecanismo de seguridad personalizada modular y de bajo coste, aplicable a cualquier VLM sin reentrenarlo, con licencia MIT y un benchmark asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Monitor de entrada sobre encoder vision-lenguaje congelado + fusion Bi-FiLM (modulacion cross-modal bidireccional) y cabezas entrenables |
| Parametros totales | no disponible (solo se publican las cabezas entrenables; el repo pesa 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (cabezas) + config.json; encoders congelados en repos separados |

## Arquitectura y entrenamiento

PRISM no es un transformer generativo completo, sino un clasificador que opera sobre embeddings congelados. Para cada par (imagen, consulta) se extraen representaciones de un encoder vision-lenguaje preentrenado y se combinan mediante Bi-FiLM (Feature-wise Linear Modulation bidireccional), que permite que la información visual module la representación textual y viceversa. Sobre esa representación fusionada se aplican cabezas entrenables que emiten la probabilidad de que la consulta requiera contexto personal para responderse de forma segura (umbral de decisión 0,5).

El modelo se ofrece en tres configuraciones según el encoder congelado: `default` con `google/siglip2-large-patch16-512` (SigLIP2), `clip_default` con `openai/clip-vit-large-patch14` (CLIP) y `evaclip_default` con `BAAI/EVA-CLIP-8B` (EVA-CLIP). El entrenamiento se realizó sobre el dataset `EdwardoSunny/multimodal-personalized-safety`, publicado junto al paper. No se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO; el enfoque es de aprendizaje supervisado sobre la tarea de deferral.

## Capacidades

- Predicción binaria de deferral: indica si una consulta acompañada de imagen debe responderse o diferirse para recabar contexto personal del usuario.
- Fusión multimodal imagen-texto mediante Bi-FiLM sobre embeddings congelados.
- Compatibilidad con tres backbones de encoder distintos (SigLIP2, CLIP, EVA-CLIP), seleccionables por configuración.
- Integración como capa previa (pre-filter) a cualquier VLM generativo, sin necesidad de reentrenar el modelo principal.
- Salida calibrada como probabilidad (umbral 0,5), apta para umbralización ajustable en producción.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un monitor de seguridad.

## Casos de uso

- Moderación previa en asistentes con imagen: colocar PRISM antes de un VLM en un chatbot que recibe fotos y consultas; si la probabilidad de deferral supera 0,5, el sistema solicita contexto adicional al usuario en lugar de responder de forma genérica.
- Asistentes de salud o bienestar personalizados: ante una foto de un medicamento o de una situación física, PRISM detecta que la respuesta segura depende de historial médico o condiciones del usuario y activa la petición de contexto.
- Recomendación personalizada con seguridad: en apps de estilo de vida (dieta, ejercicio, viajes), evita consejos potencialmente inseguros cuando la imagen sugiere una condición que el modelo no conoce.
- Cumplimiento y auditoría de sistemas VLM: permite registrar y auditar qué proporción de consultas multimodales requieren deferral, como métrica de riesgo en pipelines de producción.
- Enrutado condicional en arquitecturas multi-modelo: usar PRISM como router que decide entre una respuesta directa del VLM o un flujo de recuperación de contexto del usuario (RAG personal).
- Investigación en seguridad personalizada: servir como línea base reproducible y benchmark asociado para estudiar dominancia visual y deferral en VLMs.
- Despliegue de bajo coste en edge: al consistir en cabezas ligeras sobre encoders congelados, puede ejecutarse en infraestructura modesta separada del VLM principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper de COLM 2026 y al dataset `EdwardoSunny/multimodal-personalized-safety` como fuente de evaluación, pero no incluye cifras concretas (accuracy, F1, AUC) en el repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo de cabezas pesa 0,1 GB, pero el consumo real depende del encoder congelado elegido (SigLIP2-large, CLIP ViT-L/14 o EVA-CLIP-8B, este último el más exigente).
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño de los encoders, CLIP ViT-L/14 y SigLIP2-large son viables en GPUs consumer de gama alta, mientras que EVA-CLIP-8B requiere probablemente GPUs de datacenter (A100/H100) o cuantización.
- Cabe en GPU consumer: previsiblemente sí con las configuraciones `default` y `clip_default`; no confirmado para `evaclip_default`.
- Opciones de despliegue: el repositorio oficial usa PyTorch y `uv` (`uv run python scripts/download_checkpoints.py --configs default`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. PRISM pertenece a la categoría de monitores/clasificadores de seguridad multimodal, un nicho con pocos artefactos públicos equivalentes; los encoders que utiliza (SigLIP2, CLIP, EVA-CLIP) son modelos base ampliamente conocidos, pero no son alternativas funcionales al monitor.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRISM | Monitor de deferral multimodal | no disponible (cabezas) | no disponible | MIT | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas, solo una probabilidad de deferral; requiere un VLM externo para el flujo completo.
- Depende de encoders congelados externos; cambios o indisponibilidad en los repos de SigLIP2, CLIP o EVA-CLIP afectan al despliegue.
- El umbral de 0,5 es el valor por defecto documentado; no se han publicado curvas de calibración ni análisis de sensibilidad al umbral.
- Sin datos publicados sobre sesgos demográficos, culturales o de idioma; el dataset de entrenamiento podría introducir sesgos en la definición de "contexto personal necesario".
- Riesgo de falsos positivos (deferir consultas que no lo requieren) y falsos negativos (responder consultas que sí requerían contexto), con impacto directo en la experiencia de usuario y en la seguridad.
- Idiomas soportados no especificados; el comportamiento multilingüe es incierto.
- El modelo se publica como artefacto de investigación (COLM 2026) con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción.
- Licencia MIT permite uso comercial, pero la responsabilidad sobre decisiones de seguridad personalizada recae en el integrador.

## Enlaces

- Hugging Face: https://huggingface.co/EdwardoSunny/multimodal-personalized-safety-prism
- Código: https://github.com/EdwardoSunny/multimodal-personalized-safety
- Benchmark/dataset: https://huggingface.co/datasets/EdwardoSunny/multimodal-personalized-safety
- Página del autor: https://edwardosunny.github.io/
- Encoder SigLIP2: https://huggingface.co/google/siglip2-large-patch16-512
- Encoder CLIP: https://huggingface.co/openai/clip-vit-large-patch14
- Encoder EVA-CLIP: https://huggingface.co/BAAI/EVA-CLIP-8B
