# mcflurryshuoz/AffectGPT-RL

## Resumen

AffectGPT-RL es un modelo de investigación para reconocimiento de emociones multimodales, desarrollado por el equipo del proyecto AffectGPT (repositorio original en GitHub bajo la organización zeroQiaoba). El modelo parte de Qwen2.5-7B-Instruct como modelo de lenguaje base y añade componentes de visión y audio (CLIP ViT-L/14 y chinese-hubert-large) para procesar entradas multimodales y razonar sobre el estado emocional del hablante. El repositorio de Hugging Face que nos ocupa es un espejo no oficial mantenido por mcflurryshuoz, que replica los 12 checkpoints `.pth` de la etapa 2 (pasos 5 a 60) liberados por los autores originales.

La relevancia del modelo radica en su enfoque: aplicar aprendizaje por refuerzo (RL) para inducir un proceso de razonamiento explícito antes de emitir la etiqueta emocional, según describe el paper asociado (arXiv:2605.06126). Los autores argumentan que este razonamiento es necesario y analizan el impacto de distintas funciones de recompensa, así como la generalización a otras tareas afectivas como análisis de sentimiento y reconocimiento de emociones básicas.

Es importante subrayar que este repositorio no contiene un modelo autónomo listo para usar con Transformers: se trata de checkpoints de proyecto (`.pth`) que requieren el código original, los modelos base y la configuración de la etapa 2 para la inferencia. No hay pipeline declarado, ni descargas, ni licencia asignada por el espejo; el README upstream describe Apache 2.0 pero califica el servicio como vista previa de investigación solo para uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal sobre transformer decoder (Qwen2.5-7B-Instruct) + CLIP ViT-L/14 (visión) + chinese-hubert-large (audio), con etapa de RL para razonamiento |
| Parametros totales | no disponible (el LLM base tiene 7B; el total multimodal no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints `.pth` en precisión original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh |
| Licencia | no disponible en el espejo; el README upstream menciona Apache 2.0 y uso solo para investigación no comercial (ver UPSTREAM_TERMS.md) |
| Formato de pesos | `.pth` (PyTorch), 12 checkpoints de los pasos 5 a 60 |

## Arquitectura y entrenamiento

AffectGPT-RL es un sistema multimodal que combina un LLM base (Qwen2.5-7B-Instruct) con un codificador visual CLIP ViT-L/14 y un codificador de audio chinese-hubert-large. La etapa 2 del entrenamiento, cuyos checkpoints se distribuyen aquí, incorpora aprendizaje por refuerzo para fomentar un proceso de razonamiento antes de la predicción emocional. El paper asociado (arXiv:2605.06126) estudia el papel del RL en esta tarea, la necesidad del razonamiento intermedio, el efecto de distintas recompensas y la transferibilidad a análisis de sentimiento y emociones básicas.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas como DPO además del RL. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal, etc.). Los checkpoints liberados corresponden a pasos intermedios (5 a 60), lo que sugiere un proceso de optimización por RL con evaluación periódica, pero no se especifica la métrica de selección ni el algoritmo de RL concreto.

## Capacidades

- Reconocimiento de emociones multimodales a partir de vídeo/audio y texto, combinando señales visuales (CLIP) y acústicas (hubert).
- Razonamiento explícito previo a la etiqueta emocional, inducido mediante RL (el paper defiende la necesidad de esta cadena de razonamiento).
- Generalización a tareas afectivas relacionadas: análisis de sentimiento y reconocimiento de emociones básicas, según los experimentos del paper.
- Procesamiento bilingüe inglés-chino (idiomas declarados en la model card).
- Hereda las capacidades del LLM base Qwen2.5-7B-Instruct (generación de texto, instrucciones), aunque el ajuste está orientado a la tarea afectiva.
- Soporte de tool calling / function calling: no disponible (no documentado para este ajuste).
- Soporte de agentes y multi-step reasoning: no disponible como capacidad de producto; el razonamiento se limita al pipeline de la tarea.
- Capacidades especiales (vision, audio): sí, visión y audio como entradas del sistema multimodal.

## Casos de uso

- Análisis de emociones en entrevistas o sesiones clínicas grabadas: el sistema procesa audio y vídeo para inferir el estado afectivo del paciente, aportando una traza de razonamiento que un profesional puede revisar. Adecuado por su naturaleza multimodal y su enfoque en razonamiento explícito, aunque solo en contexto de investigación.
- Investigación en interacción humano-computadora afectiva: uso como línea base para estudiar cómo el RL mejora la coherencia entre señales visuales, acústicas y textuales en la predicción emocional.
- Evaluación de contenido audiovisual para moderación emocional: detección de tono afectivo en vídeos en inglés o chino, con la salvedad de que requiere el pipeline original y no es un servicio listo para producción.
- Reproducción de experimentos académicos: los 12 checkpoints permiten analizar la evolución del rendimiento a lo largo del entrenamiento por RL (pasos 5 a 60), útil para estudiar dinámicas de recompensa.
- Estudio de generalización a sentiment analysis: el paper reporta transferencia a tareas de sentimiento; el modelo puede emplearse para validar esos resultados en nuevos dominios bilingües.
- Prototipado de asistentes empáticos en investigación: integración en un pipeline de demostración que combine ASR, visión y el LLM para generar respuestas conscientes del estado emocional, siempre en entorno no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2605.06126) describe experimentos sobre la necesidad del razonamiento, el impacto de distintas recompensas y la generalización a otras tareas, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el LLM base de 7B en FP16 requiere aproximadamente 14-16 GB solo para los pesos, a lo que se suman CLIP ViT-L/14 y chinese-hubert-large, por lo que se estima un mínimo práctico en torno a 20-24 GB en FP16 (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para ejecutar el pipeline completo con comodidad; RTX 4090 (24 GB) podría ser suficiente en FP16 si el resto de componentes caben, pero no está verificado.
- ¿Cabe en consumer GPU? Posiblemente en RTX 4090 o RTX 3090 (24 GB) con precisión reducida, aunque no hay documentación que lo confirme; en GPUs de 16 GB o menos no es viable en FP16.
- Opciones de despliegue: no hay soporte estándar en vLLM, llama.cpp, Ollama ni TGI, ya que los checkpoints `.pth` requieren el código original del repositorio AffectGPT. El despliegue pasa por clonar el repo original, descargar los modelos base y cargar los checkpoints de etapa 2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AffectGPT-RL | 7B (LLM base) + CLIP ViT-L/14 + hubert-large | no disponible | Vídeo/audio/texto | Apache 2.0 según upstream, uso no comercial | Checkpoints `.pth` en espejo no oficial |
| Qwen2.5-7B-Instruct | 7B | 32K (según documentación oficial de Qwen) | Texto | Apache 2.0 | Pesos en Transformers, ampliamente soportado |
| AffectGPT (versión sin RL) | no disponible | no disponible | Vídeo/audio/texto | no disponible | Repositorio original |

La comparación con modelos puramente de reconocimiento emocional multimodal no está disponible en la información proporcionada. Frente a Qwen2.5-7B-Instruct, AffectGPT-RL añade modalidades visual y acústica y un ajuste por RL específico para emoción, a costa de perder la facilidad de despliegue estándar.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos no han sido modificados, pero el mantenimiento y la integridad del repositorio no están garantizados por los autores originales.
- No es un modelo autónomo de Transformers: requiere el código original, los modelos base y la configuración de etapa 2; no funciona con `AutoModel.from_pretrained` de forma directa.
- Licencia ambigua: el upstream menciona Apache 2.0 pero restringe el servicio a investigación no comercial; el espejo no asigna licencia propia. Verificar UPSTREAM_TERMS.md antes de cualquier uso.
- Idiomas limitados a inglés y chino; no hay soporte documentado de castellano.
- Riesgo de alucinación inherente al LLM base y al razonamiento generado; las trazas de razonamiento pueden no reflejar el proceso real de decisión.
- Sesgos potenciales en el reconocimiento emocional derivados de los datos de entrenamiento (no documentados) y de las diferencias culturales en la expresión afectiva.
- Solo 12 checkpoints de pasos intermedios (5 a 60): no se identifica un checkpoint "final" recomendado para producción.
- Sin benchmarks publicados en la información disponible, por lo que no se puede evaluar su rendimiento frente a alternativas.
- No apto para producción clínica o decisiones sensibles sin validación adicional y supervisión humana.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/mcflurryshuoz/AffectGPT-RL
- Repositorio original en GitHub: https://github.com/zeroQiaoba/AffectGPT/tree/master/AffectGPT-RL
- Paper: https://arxiv.org/abs/2605.06126
- Descarga original de checkpoints (Baidu Pan): https://pan.baidu.com/s/11LfKslZA2KMoLCRwkKtnVA?pwd=45jk
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
