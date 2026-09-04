# gheyal/Mexo-1.7B

## Resumen

Mexo-1.7B es un modelo de generación de texto desarrollado por el usuario gheyal. Se trata de un adaptador LoRA (PEFT) construido sobre el modelo base Qwen/Qwen3-1.7B, entrenado mediante fine-tuning supervisado (SFT) utilizando la librería TRL de HuggingFace. El repositorio contiene únicamente los pesos del adaptador, con un tamaño de 0.2 GB, y está diseñado para tareas de conversación y text-generation.

El modelo destaca por su tamaño reducido: al estar basado en Qwen3-1.7B, la inferencia requiere menos recursos que modelos de mayor escala, lo que lo hace adecuado para entornos con restricciones de memoria o para prototipado rápido. Sin embargo, la información disponible es muy limitada: no se declara licencia, idiomas soportados, ni se publican benchmarks. Además, el repositorio no registra descargas ni likes, por lo que carece de validación comunitaria. Su relevancia actual radica en ser un ejemplo de adaptación ligera de un modelo pequeño mediante LoRA, aunque su documentación incompleta dificulta una evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-1.7B) con adaptadores LoRA |
| Parametros totales | 1.700 millones (modelo base); adaptador LoRA no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Mexo-1.7B es un adaptador LoRA que modifica las capas del modelo base Qwen/Qwen3-1.7B, un transformer denso de aproximadamente 1.700 millones de parámetros. Al tratarse de un adaptador, los parámetros entrenables se limitan a las matrices de bajo rango inyectadas en el modelo original, lo que reduce significativamente el coste de fine-tuning en comparación con un ajuste completo.

El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) con la librería TRL de HuggingFace. Según la model card, se usaron PEFT 0.20.0, TRL 1.12.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. No se especifican los datos de entrenamiento, el número de tokens ni la composición del dataset. Tampoco hay evidencia de entrenamiento adicional con RLHF o DPO; el método indicado es exclusivamente SFT. El adaptador se distribuye en formato safetensors dentro de un repositorio PEFT, y la model card incluye un ejemplo de uso con `transformers.pipeline` para text-generation, aunque el código contiene un error (`model="None"` en lugar de la ruta del modelo).

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado con el tag `conversational` y el pipeline `text-generation`, por lo que puede generar respuestas en formato chat.
- Hereda las capacidades básicas del modelo base Qwen3-1.7B en cuanto a generación de lenguaje natural, pero al ser un adaptador LoRA no documentado, no se puede garantizar su comportamiento en tareas específicas.
- Tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (los idiomas soportados no están declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Chatbots internos de soporte: al ser un modelo ligero de 1.7B con adaptador LoRA, puede integrarse en sistemas de atención al cliente para responder consultas frecuentes en entornos con recursos limitados, como servidores con GPUs de gama media.
- Asistentes conversacionales en aplicaciones móviles: el tamaño reducido del adaptador (0.2 GB) facilita el despliegue en dispositivos edge o en arquitecturas cliente-servidor con presupuesto de VRAM ajustado.
- Prototipado de productos de chat: permite validar rápidamente ideas de producto basadas en generación de texto sin necesidad de entrenar un modelo desde cero, aprovechando el fine-tuning con LoRA.
- Generación de contenido creativo: puede usarse para redactar correos, descripciones breves o textos de marketing, aprovechando su capacidad de generación de lenguaje natural.
- Base para fine-tuning adicional: al ser un adaptador LoRA, sirve como punto de partida para ajustes posteriores en dominios concretos, siempre que se disponga de los datos de entrenamiento necesarios.
- Investigación en adaptación de modelos pequeños: es un caso práctico para estudiar el efecto del SFT sobre Qwen3-1.7B, aunque la falta de métricas publicadas limita su utilidad como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se dispone de datos oficiales. Como orientación, un modelo base de 1.7B en FP16 requiere aproximadamente 3,5 GB de VRAM, y en INT8 alrededor de 2 GB. El adaptador LoRA añade un overhead mínimo (0.2 GB).
- GPU recomendadas: tarjetas consumer con al menos 4-6 GB de VRAM, como RTX 3060, RTX 4060 o equivalentes de AMD. Para mayor margen, una RTX 4090 o A100 no son necesarias.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de gama baja y media, siempre que se cargue el modelo base y el adaptador.
- Opciones de despliegue: Transformers con PEFT (carga del adaptador mediante `PeftModel`), vLLM (con soporte de adaptadores LoRA) y TGI (si se configuran los adaptadores correctamente). No se confirma compatibilidad con llama.cpp u Ollama para este adaptador en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos comparativos con otros modelos de la misma categoría.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que se desconocen las restricciones de uso comercial y las condiciones de redistribución.
- Los idiomas soportados no se especifican; el modelo podría no funcionar correctamente fuera del idioma o dominio del dataset de entrenamiento, que tampoco se documenta.
- No hay benchmarks publicados, por lo que no se puede evaluar su rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.
- La model card incluye un error en el ejemplo de uso (`model="None"`), lo que sugiere una documentación incompleta y posibles fallos de configuración.
- El repositorio no registra descargas ni likes, lo que indica ausencia de validación por parte de la comunidad.
- Al ser un modelo pequeño basado en un adaptador, existe riesgo de alucinación y de respuestas inconsistentes en tareas de razonamiento complejo, similar a otros modelos de escala similar.
- La fecha de creación del repositorio (2026-09-04) es posterior a la fecha de corte de esta ficha; se recomienda verificar la disponibilidad y vigencia del modelo antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gheyal/Mexo-1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio TRL: https://github.com/huggingface/trl
