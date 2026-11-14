# iamsachinkhadka/Foodmandu-QA-v1

## Resumen

Foodmandu-QA-v1 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario iamsachinkhadka en Hugging Face. El modelo base empleado es la variante cuantizada a 4 bits de Unsloth (unsloth/Qwen2.5-7B-Instruct-bnb-4bit), sobre la que se ha aplicado un entrenamiento adicional mediante la librería Unsloth y TRL. Por el nombre y el contexto, el ajuste parece orientado a tareas de pregunta-respuesta (QA) en el dominio de Foodmandu, una plataforma de reparto de comida en Nepal, aunque la model card no detalla la composición del dataset de entrenamiento.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 con 7.000 millones de parámetros aproximadamente y una ventana de contexto de 32.768 tokens (característica del modelo base Qwen2.5-7B-Instruct). El repositorio pesa 0,2 GB y contiene pesos en formato safetensors, lo que sugiere que se trata de un adaptador o de pesos cuantizados/parciales más que de un checkpoint completo en precisión completa. La licencia declarada es Apache 2.0.

Su relevancia es limitada: se trata de un experimento de ajuste fino de un desarrollador individual, sin descargas ni interacciones registradas, sin benchmarks publicados y con documentación mínima. Resulta útil como referencia para quien quiera reproducir un pipeline de fine-tuning con Unsloth sobre Qwen2.5, pero no como modelo de producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino de Qwen2.5-7B-Instruct |
| Parametros totales | Aproximadamente 7.000 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | El modelo base es bnb-4bit; el repositorio publicado contiene safetensors (tipo exacto no disponible) |
| Idiomas soportados | Ingles (declarado); el modelo base Qwen2.5 es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU, en la variante cuantizada a 4 bits de Unsloth. Sobre esa base se ha realizado un ajuste fino adicional con las herramientas de Unsloth y TRL, que según la model card permitieron entrenar "2x más rápido". No se especifica el número de tokens de entrenamiento, la composición del dataset, si se emplearon técnicas como LoRA/QLoRA, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

La información técnica disponible es mínima: la model card se limita a indicar el autor, la licencia, el modelo base y la herramienta de entrenamiento. No se documentan innovaciones arquitectónicas propias ni detalles sobre el proceso de alineación. Cualquier afirmación sobre el dataset o el método de entrenamiento más allá de lo citado sería especulativa.

## Capacidades

- Generación de texto y respuesta a preguntas, presumiblemente especializada en el dominio de Foodmandu (reparto de comida), aunque no se detalla el alcance exacto.
- Razonamiento y conversación multi-turno heredados del modelo base Qwen2.5-7B-Instruct.
- Generación de código y matemáticas (capacidad del modelo base, no verificada tras el ajuste).
- Soporte de tool calling y function calling (capacidad del modelo base Qwen2.5, no confirmada en esta variante).
- Capacidades multilingües del modelo base, aunque la model card solo declara inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente de atención al cliente para una plataforma de reparto: el modelo podría gestionar consultas sobre pedidos, menús y entregas, aprovechando el ajuste específico de dominio; requiere validación previa con datos reales.
- Respuesta a preguntas frecuentes (FAQ) sobre el servicio: preguntas sobre horarios, zonas de reparto o métodos de pago, con la ventaja de un vocabulario adaptado al dominio.
- Clasificación y enrutado de consultas: usar el modelo para etiquetar tickets de soporte por categoría antes de derivarlos a un agente humano.
- Prototipado rápido de chatbots de nicho: servir como base para experimentar con fine-tuning sobre dominios verticales usando Unsloth.
- Generación de descripciones de productos o menús: redactar textos breves para fichas de restaurantes o platos, aunque la calidad debe evaluarse.
- Base para investigación sobre ajuste fino eficiente: reproducir el pipeline QLoRA con Unsloth y comparar resultados frente al modelo base.
- Extracción de información estructurada de conversaciones: identificar intenciones, entidades (platos, direcciones) y estados de pedido en diálogos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 7.000 millones de parámetros, en cuantización de 4 bits requiere del orden de 5-6 GB de VRAM; en FP16, alrededor de 14-16 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en producción con FP16; RTX 4090 o RTX 3090 para desarrollo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más si se usa cuantización de 4 bits (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF) y transformers con bitsandbytes.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Foodmandu-QA-v1 | ~7B | No disponible (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino de nicho sin benchmarks |
| Qwen2.5-7B-Instruct | ~7B | 32.768 | Apache 2.0 | Ampliamente disponible | Modelo base, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | ~7B | 32.768 | Apache 2.0 | Ampliamente disponible | Alternativa generalista de tamaño similar |
| Llama-3.1-8B-Instruct | ~8B | 131.072 | Llama 3.1 Community License | Ampliamente disponible | Mayor contexto, licencia con restricciones |

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla dataset, método de entrenamiento ni evaluación, lo que impide conocer su comportamiento real.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de mejora frente al modelo base.
- Riesgo de alucinación: al ser un ajuste de nicho con datos desconocidos, puede generar respuestas inventadas sobre el dominio.
- Sesgos: no documentados; hereda los del modelo base Qwen2.5 y los del dataset de ajuste, que se desconoce.
- Idioma: la model card solo declara inglés, aunque el modelo base es multilingüe; el rendimiento en castellano no está verificado.
- Contexto: no se confirma que el ajuste preserve la ventana de 32.768 tokens del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero interacciones: no hay evidencia de uso en producción ni validación por la comunidad.
- El repositorio de 0,2 GB sugiere pesos parciales o cuantizados; conviene verificar que el checkpoint sea completo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamsachinkhadka/Foodmandu-QA-v1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
