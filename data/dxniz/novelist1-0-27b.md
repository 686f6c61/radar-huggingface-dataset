# Dxniz/Novelist1.0-27b

## Resumen

Novelist1.0-27b es un modelo de lenguaje especializado en roleplay y escritura creativa, desarrollado por el usuario Dxniz. Se trata de una fusión de los pesos del modelo base Qwen/Qwen3.8-27B con un adaptador LoRA entrenado mediante una combinación de SFT (supervised fine-tuning), GRPO (Group Relative Policy Optimization) y una variante de GRPO con contexto largo (long GRPO). El resultado es un modelo de 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) orientado a la generación de narrativa, diálogos de personajes y ficción interactiva.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Los idiomas soportados declarados son inglés y turco. Aunque el repositorio no incluye benchmarks ni detalles exhaustivos sobre el entrenamiento, su enfoque explícito en roleplay y escritura creativa lo posiciona como una opción para desarrolladores que necesiten un generador de texto narrativo de alta calidad con una base arquitectónica moderna (Qwen3). La ausencia de métricas publicadas y de documentación adicional limita la evaluación objetiva, pero su origen y licencia lo hacen atractivo para prototipos y proyectos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificado en la documentacion) |
| Tipos de cuantizacion | safetensors (16-bit); no se mencionan otros formatos |
| Idiomas soportados | en, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16-bit) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de la familia Qwen3 con 27,8 mil millones de parámetros. Sobre este base se aplicó un adaptador LoRA (Low-Rank Adaptation) cuyos pesos se fusionaron con los del modelo original para producir los pesos finales en 16 bits. El entrenamiento del adaptador combinó tres fases: SFT (fine-tuning supervisado) para adaptar el modelo a tareas de roleplay y escritura creativa, seguido de GRPO (una variante de optimización por política proximal orientada a preferencias) y una extensión de GRPO con ventanas de contexto largo (long GRPO) para mejorar la coherencia en textos extensos.

No se han publicado detalles sobre el conjunto de datos utilizado, el número de tokens de entrenamiento, ni la configuración exacta de hiperparámetros. Tampoco se especifica si se aplicaron técnicas adicionales como decodificación especulativa o atención lineal. La información disponible se limita a la descripción del proceso de fusión y las etapas de entrenamiento mencionadas en la model card.

## Capacidades

- Generación de texto narrativo y creativo: el modelo está específicamente entrenado para producir ficción, diálogos y descripciones.
- Roleplay: capacidad para interpretar personajes y mantener conversaciones en contexto de juegos de rol o simulación.
- Escritura de contexto largo: gracias al entrenamiento con long GRPO, se espera que mantenga coherencia en textos extensos, aunque no se aportan métricas que lo confirmen.
- Multilingüismo limitado: soporta inglés y turco según la model card.
- No se mencionan capacidades de tool calling, function calling, razonamiento multi-paso, visión o audio. Estas características no están confirmadas en la documentación.

## Casos de uso

- Escritura asistida de novelas y relatos: el modelo puede generar borradores, continuar historias o sugerir tramas, aprovechando su entrenamiento en narrativa creativa.
- Desarrollo de personajes para juegos de rol: permite crear diálogos y reacciones coherentes para NPCs en campañas de rol de mesa o videojuegos.
- Generación de guiones para teatro, cine o series: puede producir diálogos y escenas con un tono adecuado a la ficción.
- Creación de contenido interactivo para videojuegos: útil para generar texto dinámico en aventuras conversacionales o juegos basados en texto.
- Simulación de conversaciones para entrenamiento de modelos: como generador de datos sintéticos de roleplay para fine-tuning de otros sistemas.
- Asistente de escritura para autores: ayuda a superar bloqueos creativos, proponer giros argumentales o desarrollar voces de personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 55,6 GB en formato 16-bit, por lo que la inferencia requiere al menos 56 GB de VRAM si se cargan los pesos completos. Con cuantización a 8-bit (no proporcionada por el autor) se podría reducir a ~28 GB, y a 4-bit a ~14 GB, pero no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: para ejecutar el modelo sin cuantizar se necesitan GPUs de nivel profesional como NVIDIA A100 80GB, H100 80GB o dos RTX 4090 (24GB cada una) con offloading de CPU. Con cuantización externa (por ejemplo, mediante llama.cpp o vLLM) podría caber en una sola RTX 4090 o similar.
- Opciones de despliegue: no se especifican en la documentación, pero al ser un modelo con pesos en safetensors es compatible con frameworks estándar como vLLM, llama.cpp, Ollama (si se convierte a GGUF) o Transformers de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (por ejemplo, otros fine-tunes de Qwen3 para roleplay o modelos de escritura creativa como Mistral-7B-Instruct o Llama-3-8B). No se han publicado benchmarks ni se conocen alternativas directas en el repositorio. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos: no se han evaluado sesgos del modelo; al ser un fine-tune de Qwen3, puede heredar sesgos presentes en el modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido falso o incoherente, especialmente en contextos extensos.
- Idiomas limitados: solo se declaran inglés y turco; el rendimiento en otros idiomas no está garantizado.
- Contexto: no se especifica la longitud máxima de contexto, aunque el entrenamiento con long GRPO sugiere soporte para secuencias largas; sin confirmación, no se puede asumir.
- Documentación escasa: no hay guía de uso, ejemplos de prompts ni detalles sobre el proceso de entrenamiento, lo que dificulta su integración en producción.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base Qwen3 puede tener sus propias condiciones (aunque Qwen3 se publica bajo Apache 2.0, según la información disponible).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dxniz/Novelist1.0-27b
- Adaptador LoRA: https://huggingface.co/Dxniz/Novelist1.0-27b-Adapter
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
