# machalek29/qwen3-0.6b-state-lifetime-tutor-n125

## Resumen

Este modelo es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3-0.6B, desarrollado por machalek29. Su propósito es actuar como tutor especializado en errores de ciclo de vida de estado mutable en Python: dado un programa corto con un error de este tipo, el modelo identifica la declaración, asignación o mutación relevante y formula exactamente una pregunta no compuesta sobre cuándo se crea el objeto, quién lo posee o qué referencias lo comparten. El modelo no emite código corregido ni indica la solución, incluso si se le pide directamente.

El modelo se creó para cubrir un hueco en la enseñanza de conceptos de referencia y mutabilidad en Python, donde los estudiantes necesitan reflexionar sobre la semántica del estado en lugar de recibir respuestas directas. Es relevante porque combina un tamaño muy reducido (596 millones de parámetros) con un comportamiento de tutoría restringido y controlable, lo que permite integrarlo en plataformas educativas con requisitos de hardware modestos. El comportamiento reside en los pesos, no en el prompt, y requiere un prompt de sistema específico, desactivación del modo de pensamiento y decodificación greedy.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-0.6B) con adaptador LoRA |
| Parametros totales | 596.049.920 (modelo base congelado + adaptador) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base, no especificado en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bf16, base congelada en bf16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer denso de la familia Qwen3 con 596 millones de parametros, que soporta modos thinking y non-thinking. El adaptador LoRA se entreno con r=16 y alpha=16, aplicado a todas las proyecciones lineales del transformer. El dataset de entrenamiento es `machalek29/state-lifetime-tutor-v1`, utilizando los primeros 125 ejemplos ordenados por rango. El entrenamiento duro 48 pasos con una perdida final de 1.2512, en 208 segundos de tiempo real, con la base congelada en precision bf16 y la perdida calculada solo sobre la respuesta del modelo. No se aplicaron tecnicas de RLHF ni DPO; es un fine-tuning supervisado (SFT) puro.

El comportamiento de tutor se logra exclusivamente mediante el ajuste de pesos. El modelo fue entrenado con un prompt de sistema fijo ("You are a Python state-lifetime tutor") y un formato de usuario que envuelve el codigo en bloques de triple comilla. En inferencia, se requiere desactivar el modo thinking (`enable_thinking=False`) y usar decodificacion greedy (`do_sample=False`), que es como se midieron todos los resultados reportados.

## Capacidades

- Generacion de texto instructivo en ingles, limitada a respuestas de tutoria sobre errores de estado mutable en Python.
- Identificacion de declaraciones, asignaciones o mutaciones relevantes en programas Python cortos.
- Generacion de exactamente una pregunta no compuesta por ejemplo, centrada en el momento de creacion del objeto, la propiedad o el compartir de referencias.
- Se adhiere estrictamente a la politica de no emitir codigo corregido ni indicar la correccion, incluso bajo peticion directa.
- Soporte de contexto de conversacion multi-turno (dentro de la ventana del modelo base, no especificada).
- Capacidad multilingue: solo ingles (el dataset y el prompt estan en ingles).

## Casos de uso

- Plataformas de aprendizaje de Python: integrar el modelo como asistente que guia al estudiante a reflexionar sobre errores de estado, sin dar la solucion, fomentando la comprension conceptual.
- Generacion de preguntas para evaluacion: dado un programa con un bug de estado, el modelo genera una pregunta de opcion multiple o abierta para examenes o quizzes.
- Analisis de comprension en entornos educativos: detectar si el estudiante identifica correctamente el punto de creacion o las referencias compartidas a partir de sus respuestas.
- Tutoria personalizada en entornos de desarrollo integrado (IDE): un plugin que muestre al estudiante una pregunta sobre el estado mutable en el codigo que esta escribiendo, sin ofrecer la solucion.
- Entrenamiento de otros modelos: usar el modelo como generador de datos sinteticos para crear datasets de preguntas sobre estado de Python.
- Investigacion en pedagogia de programacion: estudiar como los estudiantes responden a preguntas guiadas sobre errores de estado, registrando sus respuestas y progreso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas estandar como MMLU, HumanEval o GSM8K para este adaptador, y solo se menciona la perdida de entrenamiento (1.2512) como indicador de convergencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 596 millones de parametros, que en bf16 ocupa aproximadamente 1,2 GB de memoria. Con el adaptador LoRA y el overhead de inferencia, se estima un consumo de VRAM entre 2 y 4 GB segun el tamanio del lote y la longitud del contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A10 o A100. Tambien puede ejecutarse en Apple Silicon (MPS) como se uso en el entrenamiento.
- Compatible con GPU de consumo: si, cabe en GPUs de gama de entrada y media.
- Opciones de despliegue: transformers con peft para cargar el adaptador LoRA, vLLM (si se fusiona el adaptador), llama.cpp (requiere convertir el modelo base a GGUF y aplicar el adaptador), Ollama (no soporta LoRA nativamente, se debe fusionar previamente), TGI (text-generation-inference) con soporte de adaptadores.
- Latencia y throughput: no se han publicado mediciones. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por token en una GPU moderna, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| machalek29/qwen3-0.6b-state-lifetime-tutor-n125 | 0.6B | No especificado | Apache-2.0 | Tutor de Python sobre estado mutable |
| Qwen/Qwen3-0.6B (base) | 0.6B | No especificado (tipicamente 32k en Qwen3) | Apache-2.0 | LLM general, razonamiento y chat |
| Llama-3.2-1B | 1B | 128k | Llama 3.2 Community | LLM general, instruct | 

No hay modelos comparables especializados en tutoria de estado mutable de Python documentados en la informacion disponible. La comparativa con el modelo base Qwen3-0.6B es la mas directa: el adaptador restringe las capacidades genericas del base a una tarea especifica de tutoria, sin mejorar el rendimiento en tareas generales.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el prompt de sistema exacto y los parametros de inferencia especificados (thinking desactivado y greedy). Cualquier variacion puede degradar el comportamiento.
- Entrenado en solo 125 ejemplos, lo que puede provocar sobreajuste a patrones muy concretos y baja generalizacion a programas con estructuras mas complejas o errores de otro tipo.
- No emite codigo corregido ni indicaciones de solucion por diseno; en escenarios donde el usuario espera una respuesta directa, el modelo puede resultar frustrante.
- Solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- No se han publicado benchmarks ni evaluaciones de seguridad; el comportamiento en casos limite o adversarios no esta documentado.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de exactitud pedagogica ni de seguridad.
- El adaptador se distribuye como LoRA, por lo que requiere el modelo base Qwen3-0.6B para funcionar, lo que aumenta el espacio de almacenamiento y la complejidad de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/machalek29/qwen3-0.6b-state-lifetime-tutor-n125
- Dataset de entrenamiento: https://huggingface.co/datasets/machalek29/state-lifetime-tutor-v1
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Qwen3 Technical Report (arXiv): https://arxiv.org/abs/2505.09388
- Qwen3 Technical Report (HTML): https://arxiv.org/html/2505.09388v1
