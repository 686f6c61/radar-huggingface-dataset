# marcos-guilherme/qwen2.5-coder-7b-refusal-ablated-20pct

## Resumen

`marcos-guilherme/qwen2.5-coder-7b-refusal-ablated-20pct` es un modelo derivado de Qwen2.5-Coder-7B-Instruct en el que se ha aplicado una tecnica de ablacion de la direccion de rechazo (refusal direction ablation) en un 20 % de intensidad. El autor, marcos-guilherme, lo publica como artefacto de investigacion en interpretabilidad mecanistica, no como modelo listo para produccion. La idea subyacente es la identificada en trabajos como "Refusal in Language Models Is Mediated by a Single Direction": existe una direccion en el espacio de activaciones que gobierna la negativa del modelo a responder; suprimirla o atenuarla reduce el comportamiento de rechazo.

El modelo conserva la arquitectura y los pesos base de Qwen2.5-Coder-7B-Instruct (transformer decoder-only denso, 7.615.620.096 parametros, contexto nativo de 32.768 tokens ampliable a 131.072 mediante YaRN en la familia Qwen2.5), por lo que mantiene sus capacidades de generacion de codigo, razonamiento y tool calling. La unica modificacion es la intervencion sobre las activaciones internas, lo que lo convierte en una variante experimental para estudiar como afecta la supresion del rechazo a la utilidad, la seguridad y la coherencia del modelo.

Es relevante ahora porque la comunidad de seguridad e interpretabilidad necesita contrafactuales controlados: modelos identicos salvo en un eje concreto (aqui, la intensidad de la ablacion, fijada al 20 %). Este checkpoint permite medir el trade-off entre obediencia y alineacion sin cambiar el resto de variables. El acceso esta restringido (gated) y el modelo no declara idiomas soportados ni benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), con intervencion de ablacion sobre la direccion de rechazo |
| Parametros totales | 7.615.620.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del modelo; el base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens nativos (131.072 con YaRN) |
| Tipos de cuantizacion | no disponible en el repo; al ser safetensors en transformers admite cuantizacion posterior (GPTQ, AWQ, GGUF) por herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only denso de la familia Qwen2.5-Coder, con atencion por causalidad estandar, RoPE y las mejoras de Qwen2.5 (GQA en las capas de atencion, tokenizador BPE multilingue). No hay entrenamiento adicional con datos nuevos: el autor parte de los pesos de Qwen2.5-Coder-7B-Instruct y aplica una modificacion en el espacio de activaciones. La tecnica consiste en calcular la direccion media de rechazo a partir de pares de prompts maliciosos/inofensivos, y restarla (ablacion) de las activaciones de las capas intermedias durante la inferencia o directamente en los pesos. El sufijo "20pct" indica que la ablacion se aplica con una intensidad del 20 % respecto a la magnitud completa de la direccion.

El modelo requiere `trust_remote_code=True` porque incluye codigo personalizado (`custom_code`) para implementar la intervencion. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de calibracion, ni si hubo RLHF/DPO adicional (no lo hubo: es un fine-tune de pesos, no un reentrenamiento). Tampoco se especifica en que capas exactas se aplica la ablacion ni si se usa una unica direccion o un conjunto.

## Capacidades

- Generacion de texto y codigo: hereda las capacidades de Qwen2.5-Coder-7B-Instruct en lenguajes de programacion, explicacion de codigo, refactorizacion y depuracion.
- Razonamiento y matematicas: mantiene el rendimiento base en tareas de razonamiento de varios pasos y resolucion de problemas matematicos.
- Tool calling / function calling: soportado por el modelo base, por lo que se espera que funcione, aunque no hay validacion especifica en este checkpoint.
- Agentes y razonamiento multi-paso: el modelo base esta disenado para flujos agenticos; la ablacion puede alterar la adherencia a instrucciones de seguridad en esos flujos.
- Capacidades multilingues: no declaradas en la ficha; el base Qwen2.5 soporta multiples idiomas, pero este checkpoint no lo especifica.
- Modo thinking: no disponible (Qwen2.5-Coder-7B-Instruct no es un modelo de razonamiento con modo thinking explicito).
- Vision o audio: no soportado.
- Comportamiento de rechazo atenuado: la capacidad diferencial es que el modelo tiende a rechazar menos peticiones que el base, lo que constituye el objeto de estudio.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: comparar las activaciones y las respuestas de este checkpoint con el base para aislar el efecto de la direccion de rechazo en tareas de codigo y texto.
- Evaluacion de seguridad y red-teaming: usar el modelo como contrafactual para medir si la atenuacion del rechazo aumenta la tasa de respuestas daninas y calibrar clasificadores de seguridad.
- Estudio de robustez de alineacion: analizar como cambia la utilidad (calidad de codigo, coherencia) al reducir el rechazo un 20 %, y comparar con ablaciones al 0 %, 50 % y 100 %.
- Generacion de codigo en entornos controlados de investigacion: probar el modelo en tareas de programacion donde el rechazo del base interfiere con la evaluacion (por ejemplo, prompts de seguridad ofensiva en laboratorio).
- Analisis de sesgos y comportamiento: examinar si la ablacion afecta a la negativa en dominios sensibles (salud, legal, seguridad) y documentar los cambios.
- Benchmarking de tecnicas de ablacion: servir como punto de comparacion en estudios que evaluan metodos de supresion de direcciones (ablacion vs. steering vs. fine-tuning de seguridad).
- Docencia y divulgacion: demostrar en cursos de seguridad de IA como una unica direccion controla un comportamiento complejo, con un modelo de 7B manejable en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB de pesos, mas overhead de activaciones y KV cache; se recomienda 18-24 GB.
- VRAM en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 5-6 GB (estimaciones para un modelo denso de 7,6B, no verificadas en este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16 GB) para 8 bits; RTX 3060 12 GB o superior para 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en FP16 y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el `custom_code`); vLLM, TGI y llama.cpp/Ollama requeririan portar la intervencion de ablacion, ya que el codigo personalizado no es compatible de forma nativa con esos motores sin adaptacion.
- Latencia y throughput: no disponibles; al ser denso de 7,6B, el throughput esperado es comparable al de Qwen2.5-Coder-7B-Instruct en el mismo hardware, con un coste adicional minimo por la intervencion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-coder-7b-refusal-ablated-20pct | 7,6B | no disponible (base: 32.768) | Ablacion de rechazo al 20 % | Apache 2.0 | Gated en HF |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6B | 32.768 (131.072 con YaRN) | Ninguna (modelo base) | Apache 2.0 | Publico |
| Qwen/Qwen2.5-Coder-7B | 7,6B | 32.768 (131.072 con YaRN) | Ninguna (modelo base pre-entrenado) | Apache 2.0 | Publico |
| Modelos de la familia refusal-ablated (p. ej. variantes de Llama) | 7-8B | variable | Ablacion de direccion de rechazo | variable | variable |

La comparativa de rendimiento no esta disponible: no hay benchmarks publicados para este checkpoint ni datos que permitan contrastar su calidad frente al base.

## Limitaciones y advertencias

- Modelo de investigacion: no esta validado para produccion; el autor lo etiqueta como `research` y `mechanistic-interpretability`.
- Seguridad degradada por diseno: la ablacion del rechazo puede aumentar la probabilidad de respuestas a peticiones daninas, incluyendo contenido ilegal, peligroso o de seguridad ofensiva. No debe desplegarse sin capas de seguridad externas.
- Riesgo de alucinacion: heredado del base y potencialmente agravado si la atenuacion del rechazo reduce la cautela del modelo al admitir incertidumbre.
- Sesgos: no documentados en la informacion disponible; se heredan los del corpus de Qwen2.5-Coder.
- Idiomas: no declarados; no se garantiza el comportamiento multilingue del base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias y el uso comercial de un modelo con rechazo atenuado puede incumplir politicas de plataformas o normativa aplicable.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y el uso automatizado.
- Compatibilidad: el `custom_code` obliga a `trust_remote_code=True` y complica el despliegue en motores de inferencia estandar (vLLM, TGI, llama.cpp) sin adaptaciones.
- Sin benchmarks ni documentacion de la intervencion (capas, direccion, metodologia exacta): dificulta la replicacion y la comparacion rigurosa.

## Enlaces

- Hugging Face: https://huggingface.co/marcos-guilherme/qwen2.5-coder-7b-refusal-ablated-20pct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper de referencia sobre la direccion de rechazo: https://arxiv.org/abs/2406.11717 (Refusal in Language Models Is Mediated by a Single Direction)
- Repositorio de referencia de la tecnica: https://github.com/andyrdt/refusal_direction
