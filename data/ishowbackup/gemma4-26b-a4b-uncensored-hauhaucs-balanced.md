# Ishowbackup/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced

## Resumen

El modelo Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced es un fine-tuning del modelo oficial google/gemma-4-26B-A4B-it, desarrollado por Ishowbackup en colaboración con HauhauCS, con el objetivo de eliminar los rechazos (refusals) del modelo original sin degradar sus capacidades. Según la model card, el autor reporta 0/465 rechazos en pruebas automatizadas y manuales, manteniendo intactas las capacidades de razonamiento, generación de código, visión y uso de herramientas del modelo base.

Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 25,2 mil millones de parámetros totales y aproximadamente 3,8 mil millones de parámetros activos por forward pass, gracias a la selección de 8 de 128 expertos más un experto compartido. Soporta una ventana de contexto nativa de 256K tokens y es multimodal (texto e imagen), incluyendo un proyector de visión (mmproj) en formato GGUF. La versión "Balanced" es la variante recomendada por el autor para la mayoría de usuarios, ya que razona sobre peticiones delicadas y entrega respuestas completas sin omitir contenido, a diferencia de la variante "Aggressive" (aún en desarrollo) que responde directamente sin preámbulos.

Este modelo es relevante porque ofrece una alternativa sin censura del potente Gemma 4 de Google, con cuantizaciones optimizadas (K_P) que preservan la calidad y compatibilidad total con runtimes GGUF como llama.cpp y LM Studio. Su diseño MoE con atención híbrida lo hace especialmente interesante para tareas de agente con múltiples llamadas a herramientas, donde el coste de inferencia es reducido gracias a los pocos parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 128 expertos enrutados, top-8 + 1 experto compartido |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | ~3,8 B |
| Longitud de contexto | 256K tokens nativos |
| Tipos de cuantizacion | Q8_K_P, Q6_K_P, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M, mmproj f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivos mmproj para visión) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de google/gemma-4-26B-A4B-it, que combina un transformer MoE con atención híbrida: cada bloque alterna 5 capas de atención con ventana deslizante (sliding window) de 1024 tokens seguidas de 1 capa de atención global completa. Utiliza Proportional RoPE (p-RoPE) para el posicionamiento. La configuración incluye 30 capas, hidden dim de 2816, FFN dim de 2112, FFN de experto MoE de 704, vocab de 262144 tokens, head dim de 256 (SWA) y 512 (full), 16 cabezas de atención y 8 cabezas KV (2 para capas full). El modelo es nativamente multimodal, con un proyector de visión que admite presupuestos variables de tokens visuales: 70, 140, 280, 560 o 1120 por imagen.

El proceso de entrenamiento del fine-tuning "Uncensored" no se detalla en la model card, pero el autor indica que no se modificaron los datasets ni las capacidades originales, solo se eliminaron los rechazos mediante un ajuste de pesos (probablemente DPO o similar, aunque no se especifica). Todas las cuantizaciones se generaron con matriz de importancia (imatrix) para preservar la calidad en los pesos sin censura. Los quants K_P son una creación de HauhauCS que promueve el 25% de los tensores más importantes (según calibración imatrix) a un nivel de cuantización superior, logrando una calidad efectiva 1-2 niveles por encima del quant base con solo un 5-15% más de tamaño.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de escritura creativa, roleplay y análisis con inteligencia emocional.
- Generación de código y soporte para uso de herramientas (tool calling), aunque el autor advierte que Qwen3.6 es superior en tareas de agente y coding.
- Capacidades multimodales: procesamiento de imágenes junto con texto (pipeline image-text-to-text), con presupuesto variable de tokens visuales por imagen.
- Soporte para agentes y razonamiento multi-paso, gracias a la ventana de contexto de 256K y la atención híbrida que mantiene coherencia global en cadenas largas de llamadas a herramientas.
- Multilingüismo limitado: la model card solo declara inglés (en), aunque el modelo base de Google podría tener capacidades adicionales no confirmadas.
- Modo sin censura: el modelo no rechaza peticiones delicadas, aunque en algunos casos añade un breve marco de seguridad antes de entregar la respuesta completa (variante Balanced).
- Compatibilidad con llama.cpp, LM Studio y cualquier runtime GGUF, incluyendo soporte para chat template mediante la opción `--jinja`.

## Casos de uso

- Escritura creativa y roleplay: el modelo está calibrado para mantener coherencia narrativa y emocional en sesiones largas, sin derivas temáticas. Su ventana de 256K permite contextos extensos de personajes y tramas.
- Asistente de investigación sin restricciones: puede abordar temas sensibles de seguridad, operaciones o investigación que otros modelos rechazan, entregando análisis completos y razonados.
- Generación de código en entornos de desarrollo: con soporte de tool calling y una huella de inferencia reducida (3,8 B activos), puede integrarse en pipelines de CI/CD para autocompletado o generación de tests, aunque el autor recomienda Qwen3.6 para tareas puramente agenticas.
- Análisis de documentos con visión: al ser multimodal, puede procesar imágenes, diagramas o capturas de pantalla junto con texto, útil para documentación técnica o revisión de UI.
- Chatbots de atención al cliente sin filtros: puede gestionar conversaciones multi-turno con contexto largo, manteniendo un tono natural y sin rechazar consultas incómodas.
- Prototipado de agentes autónomos: su coste de inferencia bajo (gracias al MoE) permite encadenar 10 o más llamadas a herramientas por tarea sin penalización de latencia, ideal para experimentos de agentes.
- Experimentación en entornos educativos o de investigación: la licencia Apache 2.0 permite uso comercial y modificación, y las cuantizaciones ligeras (IQ2_M, 10 GB) permiten ejecutarlo en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El autor solo menciona que el modelo mantiene el 100% de las capacidades del original sin rechazos, pero no proporciona datos numéricos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, desde 10 GB (IQ2_M) hasta 27 GB (Q8_K_P), más 1,2 GB del proyector de visión si se usa multimodal.
- GPU recomendadas:
  - Q4_K_P (17 GB): cabe en GPUs de 24 GB VRAM (RTX 3090, RTX 4090, A5000) con espacio para contexto.
  - Q8_K_P (27 GB): requiere GPUs de 32 GB o más (A100 40GB, H100, RTX 6000 Ada) o descarga parcial a CPU.
  - Quants ligeros (IQ2_M, 10 GB): caben en RTX 3080/4070 (12-16 GB) con contexto reducido.
- Compatibilidad con GPUs de consumo: sí, las cuantizaciones Q3_K_M (13 GB) e IQ3_M (12 GB) son viables en GPUs de 16 GB como RTX 4080 o RTX 4070 Ti.
- Opciones de despliegue: llama.cpp (con `--jinja` para el chat template), LM Studio, Ollama (si se convierte), y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El diseño MoE con 3,8 B activos sugiere un throughput similar a un modelo denso de ~4B, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información comparativa en la model card. Sin embargo, se puede establecer una comparación estructural con el modelo base y con alternativas conocidas:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma4-26B-A4B-Uncensored-Balanced | 25,2 B | ~3,8 B | 256K | Apache 2.0 | GGUF |
| google/gemma-4-26B-A4B-it (base) | 25,2 B | ~3,8 B | 256K | Apache 2.0 | safetensors, GGUF |
| Qwen3.6 (mencionado por el autor) | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor menciona que Qwen3.6 es superior en tareas de agente y coding, pero no proporciona más detalles. No se dispone de datos de rendimiento comparativos verificables.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo sin censura, puede generar contenido ofensivo, ilegal o peligroso si se le solicita. El autor advierte que algunas peticiones extremas pueden desviarse en el primer intento, pero responden al reintentar.
- Riesgo de alucinación: no se han evaluado formalmente las tasas de alucinación. El fine-tuning puede alterar la calibración de veracidad del modelo base.
- Limitaciones de idioma: solo se declara inglés. No hay garantía de rendimiento en español u otros idiomas, aunque el modelo base podría tener cierta capacidad multilingüe no confirmada.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero no cubre el uso del modelo para actividades ilegales. El autor no ofrece garantías sobre el cumplimiento legal en jurisdicciones específicas.
- Estabilidad en producción: el autor reporta "0/465 refusals" en sus pruebas, pero no hay evaluación independiente. El modelo es un release candidate, no una versión estable verificada.
- Compatibilidad con chat template: requiere usar `--jinja` en llama.cpp para que el template de chat funcione correctamente; de lo contrario, el formato de conversación puede romperse.
- Los quants K_P pueden mostrarse como "?" en la columna de cuantización de LM Studio, aunque funcionan correctamente. Esto puede confundir a usuarios no familiarizados.
- El modelo no es adecuado para tareas que requieran cumplimiento normativo estricto (salud, finanzas, legal) debido a su naturaleza sin censura y la falta de evaluaciones de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ishowbackup/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Discord del autor: https://discord.gg/SZ5vacTXYf
