# reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF

## Resumen

Qwen3.5-2B-CyberSec-GGUF es la exportación en formato GGUF del checkpoint reaperdoesntknow/Qwen3.5-2B-CyberSec, un ajuste fino del modelo base unsloth/Qwen3.5-2B orientado a dominios de ciberseguridad. El autor (reaperdoesntknow) publica esta versión cuantizada para inferencia local con runtimes compatibles con llama.cpp, lo que permite ejecutar el modelo en CPU o en GPUs de consumo sin infraestructura dedicada. Forma parte de la colección CIx de modelos de ciberseguridad del mismo autor.

El modelo cuenta con 1.942.653.248 parámetros (aproximadamente 1,94 mil millones) según los pesos en safetensors del checkpoint fuente, y se distribuye bajo licencia Apache-2.0. El ajuste fino se asocia al Trendyol Cybersecurity Instruction Tuning Dataset, lo que orienta el modelo hacia tareas conversacionales de seguridad: análisis de vulnerabilidades, explicación de conceptos, revisión de configuraciones y asistencia en tareas de respuesta a incidentes.

La relevancia de esta ficha radica en que ofrece un punto de entrada práctico para evaluar cualitativamente un modelo especializado en ciberseguridad en hardware modesto, con builds de 1,31 GB (Q4_K_M), 2,08 GB (Q8_0) y 3,90 GB (BF16). No obstante, el autor no publica benchmarks, informes de regresión ni evaluaciones de seguridad, por lo que cualquier uso en producción debe tratarse con cautela y validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles específicos no disponibles) |
| Parámetros totales | 1.942.653.248 (~1,94 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint fuente) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint unsloth/Qwen3.5-2B, que a su vez pertenece a la familia Qwen3.5. La arquitectura subyacente es de tipo transformer, aunque la información disponible no detalla la configuración exacta de capas, cabezas de atención ni mecanismos de atención (por ejemplo, si emplea atención lineal o decodificación especulativa). El tamaño de 1,94 mil millones de parámetros sitúa al modelo en la categoría de modelos pequeños, aptos para despliegue en entornos con recursos limitados.

El entrenamiento se realizó mediante instruction tuning sobre el Trendyol Cybersecurity Instruction Tuning Dataset, un conjunto de datos orientado a instrucciones de ciberseguridad. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card del GGUF tampoco documenta innovaciones técnicas adicionales más allá del proceso de cuantización para llama.cpp.

## Capacidades

- Generación de texto conversacional orientada a dominios de ciberseguridad.
- Asistencia en explicación de conceptos de seguridad, análisis de configuraciones y revisión de prácticas.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Capacidades multimodales: el checkpoint fuente incluye componentes de visión y se distribuye un proyector BF16-mmproj, pero el autor advierte que no hay una prueba de humo documentada; no debe asumirse soporte multimodal sin verificación.
- Modo thinking: no documentado.

## Casos de uso

- Evaluación cualitativa local del checkpoint: usar el build Q4_K_M (1,31 GB) para comparar respuestas del modelo con el BF16 (3,90 GB) y detectar degradación por cuantización en tareas de seguridad.
- Formación y concienciación: generar explicaciones introductorias sobre conceptos como phishing, gestión de parches o segmentación de red, siempre con revisión humana del contenido.
- Asistencia en triaje de alertas: el modelo puede redactar borradores de resumen de incidentes a partir de descripciones textuales, adecuado por su tamaño reducido para entornos con CPU.
- Revisión de configuraciones: solicitar al modelo que señale posibles malas prácticas en fragmentos de configuración (por ejemplo, permisos excesivos en servicios), como apoyo a una revisión manual posterior.
- Prototipado de chatbots de seguridad: integrar el modelo en un asistente interno de consultas frecuentes sobre políticas y procedimientos, con límites claros y sin capacidad de ejecutar acciones.
- Experimentación en pipelines de CI/CD: usar el modelo para generar borradores de comentarios en revisiones de código relacionadas con seguridad, sujeto a validación humana antes de publicar.
- Investigación sobre ajuste fino especializado: servir como referencia para estudiar cómo el instruction tuning en un dominio concreto afecta al comportamiento de un modelo base pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB para Q4_K_M, 2,5 GB para Q8_0 y 4,5 GB para BF16, incluyendo overhead del runtime (estimación orientativa; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (por ejemplo, GTX 1650, RTX 3050); 6 GB o más para Q8_0; 8 GB o más para BF16.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4-8 GB de VRAM; también es viable en CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, y otros runtimes compatibles con GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-CyberSec-GGUF | ~1,94 B | no disponible | Apache-2.0 | GGUF (BF16, Q8_0, Q4_K_M) | Ajuste fino en ciberseguridad; sin benchmarks publicados |
| Qwen3.5-2B (base) | ~1,94 B | no disponible | no disponible | safetensors | Modelo base sin especialización; referencia de comparación |
| Alternativas de ciberseguridad de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- No se han publicado benchmarks, informes de regresión ni evaluaciones de seguridad para esta release.
- La cuantización puede alterar la calidad y el comportamiento respecto al checkpoint fuente; el autor lo advierte explícitamente.
- Las instrucciones de seguridad generadas pueden ser incorrectas, inseguras o de doble uso; no deben ejecutarse comandos sin revisión y aislamiento.
- No debe usarse el modelo como control de seguridad autoritativo ni como tomador de decisiones.
- El soporte multimodal no está verificado: el proyector BF16-mmproj existe, pero no hay prueba documentada; conviene validar formato de prompt, versión del runtime y ruta de imagen antes de afirmar capacidades de visión.
- Idiomas soportados no especificados; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; no debe asumirse una ventana amplia.
- Sesgos conocidos: no documentados, pero al derivar de un modelo base generalista y un dataset específico, pueden persistir sesgos del corpus original.
- Riesgo de alucinación: presente como en cualquier modelo de este tamaño; especialmente crítico en recomendaciones de seguridad.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de garantías y evaluaciones traslada la responsabilidad de validación al usuario.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Checkpoint fuente: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec
- Modelo base upstream: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset de instruction tuning: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Colección CIx de modelos de ciberseguridad: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
