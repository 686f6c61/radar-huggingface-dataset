# ArthT/qwen35-27b-bcont-mixedmed-seed1

## Resumen

El modelo `ArthT/qwen35-27b-bcont-mixedmed-seed1` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-27B, desarrollado por el usuario ArthT. Se trata de un modelo denso de 27 000 millones de parámetros, entrenado mediante supervisión fina (SFT) con la librería TRL y optimizado con Unsloth. El nombre sugiere una especialización en dominios mixtos de medicina y biología continua, aunque la model card no aporta detalles sobre el conjunto de datos de entrenamiento ni los objetivos específicos.

El modelo base Qwen3.5-27B, lanzado por Alibaba Cloud en febrero de 2026, es un modelo fundacional multimodal denso con una arquitectura híbrida que combina Gated Delta Networks y redes feed-forward. Soporta un contexto nativo de 262 144 tokens y está diseñado para tareas de razonamiento, generación de código y agentes. Este fine-tune hereda dichas capacidades, pero al carecer de documentación adicional, su comportamiento específico solo puede inferirse a partir del modelo base.

La relevancia de este modelo radica en su potencial para aplicaciones especializadas en el ámbito biosanitario, aunque la ausencia de métricas publicadas y de una licencia clara limita su adopción inmediata en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, híbrida (Gated Delta Networks + Feed Forward Networks) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo del modelo base) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | No disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura densa que integra Gated Delta Networks (GDN) junto con capas feed-forward convencionales. Esta combinación busca mejorar la eficiencia en el procesamiento de secuencias largas y reducir el coste computacional frente a la atención tradicional. El modelo fue preentrenado con un enfoque de fusión temprana multimodal, lo que le permite procesar texto e imágenes de forma unificada.

El fine-tune `qwen35-27b-bcont-mixedmed-seed1` se entrenó mediante SFT utilizando el framework TRL (versión 0.24.0) y la librería Unsloth para optimizar el uso de memoria y velocidad. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El repositorio indica que se usó `generated_from_trainer`, lo que sugiere un entrenamiento estándar con el trainer de Hugging Face. No hay información sobre la duración del entrenamiento ni las configuraciones de hiperparámetros.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-27B, se espera que mantenga capacidades de razonamiento complejo, matemáticas y comprensión lectora.
- Generación de código: el modelo base está optimizado para tareas de programación y agentes, por lo que este fine-tune probablemente conserve dicha habilidad.
- Multimodalidad: el modelo base soporta entrada de imágenes y texto, aunque no se confirma si el fine-tune conserva esta característica.
- Tool calling y function calling: el modelo base incluye soporte para llamadas a herramientas, pero no hay evidencia de que el fine-tune lo mantenga.
- Capacidades multilingües: el modelo base soporta múltiples idiomas, pero no se especifica para este ajuste.
- Especialización potencial en dominios médicos/biológicos: el nombre "mixedmed" sugiere un entrenamiento en datos mixtos de medicina, aunque no hay documentación que lo confirme.

## Casos de uso

- Asistencia en documentación clínica: el modelo podría redactar resúmenes de historiales médicos o informes de pacientes, aprovechando su posible especialización en terminología sanitaria. Requiere validación manual debido a la falta de benchmarks.
- Generación de contenido educativo en biología: podría crear explicaciones, preguntas de examen o material didáctico sobre temas de ciencias de la salud, siempre con supervisión experta.
- Chatbots de soporte en entornos controlados: para responder preguntas frecuentes sobre salud o bienestar, con un sistema de verificación externo para evitar alucinaciones.
- Análisis de literatura científica: el modelo puede resumir artículos de investigación biomédica, aunque su ventana de contexto de 262K tokens permite procesar documentos extensos.
- Prototipado de agentes conversacionales: al heredar las capacidades del base, puede usarse en pipelines de agentes que requieran razonamiento multi-paso, aunque no se garantiza el soporte de tool calling.
- Investigación académica: como modelo de referencia para estudiar el efecto del fine-tune en dominios específicos, comparando su comportamiento con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y el repositorio de Hugging Face no muestra comparativas con otros modelos. Se recomienda realizar una evaluación propia antes de usar el modelo en tareas críticas.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 27B en FP16 se requieren aproximadamente 54 GB de VRAM. Con cuantización a 8 bits se reduce a ~27 GB, y a 4 bits a ~14 GB. Sin embargo, no se proporcionan archivos cuantizados en el repositorio, por lo que el usuario deberá cuantizarlos manualmente.
- GPU recomendadas: para FP16 se necesitan GPUs de datacenter como A100 (80 GB) o H100. Con cuantización 4-bit, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría ser suficiente, aunque con limitaciones de velocidad.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (tras conversión a GGUF). También es compatible con Ollama si se convierte previamente.
- Latencia y throughput: no hay datos publicados. En una RTX 4090 con cuantización 4-bit, se podría esperar un throughput de 10-20 tokens/s, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B (base) | 27B | 262K | Densa (GDN+FFN) | Apache 2.0 (según Qwen) | Hugging Face |
| ArthT/qwen35-27b-bcont-mixedmed-seed1 | 27B | 262K (heredado) | Densa (GDN+FFN) | No disponible | Hugging Face |
| Qwen3-30B-A3B (MoE) | 30B total, 3B activos | 128K | MoE | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y a una alternativa MoE de tamaño similar. El fine-tune no ofrece diferencias estructurales respecto al base, salvo los pesos ajustados. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifican los datos de entrenamiento, el proceso de filtrado ni los objetivos del fine-tune, lo que impide conocer su comportamiento real en dominios médicos.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en contextos especializados sin verificación externa.
- Sesgos potenciales: al desconocer la composición del dataset de entrenamiento, no se pueden evaluar sesgos de género, raza o socioeconómicos.
- Licencia ambigua: la model card indica "license" sin especificar términos, lo que genera incertidumbre legal para uso comercial.
- Sin garantía de capacidades multimodales: aunque el base es multimodal, no se confirma que el fine-tune conserve el procesamiento de imágenes.
- Contexto largo no garantizado: aunque el base soporta 262K tokens, el fine-tune podría haber reducido la ventana efectiva durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArthT/qwen35-27b-bcont-mixedmed-seed1
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Colección Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Especificaciones y requisitos de VRAM (apxml.com): https://apxml.com/models/qwen35-27b
- Guía de despliegue local (insiderllm.com): https://insiderllm.com/guides/qwen35-local-guide-which-model-fits-your-gpu/
- Repositorio GitHub de Qwen3.8-27B (referencia del equipo Qwen): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
