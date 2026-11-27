# ronke21/rlcl-Qwen2.5-Math-1.5B-Instruct-igbo-s123

## Resumen

El modelo `rlcl-Qwen2.5-Math-1.5B-Instruct-igbo-s123`, publicado por el usuario ronke21 en Hugging Face, es un ajuste fino (fine-tune) del modelo Qwen2.5-Math-1.5B-Instruct de Alibaba. El nombre sugiere una intervención de tipo RLCL (probablemente *Reinforcement Learning with Contrastive Loss* o una técnica similar de mitigación de olvido catastrófico) aplicada sobre el modelo base, con un identificador "igbo" que apunta a un posible ajuste orientado al idioma igbo y un sufijo de semilla o versión "s123".

Se trata de un modelo de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), orientado a generación de texto y conversación, distribuido en formato safetensors con un tamaño de repositorio de 3,1 GB. El ajuste se ha realizado mediante LoRA y posteriormente fusionado (tag `lora-merged`), lo que implica que los pesos publicados ya incorporan la adaptación sin necesidad de cargar adaptadores separados.

La relevancia del modelo es limitada y experimental: cuenta con cero descargas y cero "likes" en el momento de la consulta, está marcado como acceso restringido (gated) y no declara licencia ni idiomas soportados. Es un artefacto de investigación más que un modelo listo para producción, útil para estudiar técnicas de ajuste fino sobre modelos matemáticos y el fenómeno del olvido catastrófico en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Math-1.5B-Instruct soporta 32 768 tokens segun documentacion de Qwen; no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precision original) |
| Idiomas soportados | no disponible (el identificador "igbo" sugiere igbo; no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 3,1 GB |
| Modelo base | Qwen/Qwen2.5-Math-1.5B-Instruct |
| Metodo de ajuste | LoRA fusionado (tag `lora-merged`) |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-Math-1.5B-Instruct, un transformer decoder-only de la familia Qwen2 con 1,5 mil millones de parámetros, diseñado originalmente para razonamiento matemático y ajustado con instrucciones. Sobre esta base, el autor ha aplicado un ajuste fino con LoRA que posteriormente se ha fusionado en los pesos finales, de modo que el checkpoint publicado contiene ya la adaptación integrada.

El identificador "rlcl" y la etiqueta `forgetting` en los tags apuntan a una intervención orientada a estudiar o mitigar el olvido catastrófico (catastrophic forgetting) durante el ajuste, probablemente mediante una técnica de regularización o aprendizaje contrastivo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni los hiperparámetros del ajuste LoRA. Tampoco se documenta ninguna innovación arquitectónica adicional respecto al modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento matemático y resolución de problemas aritméticos y algebraicos, capacidad central del modelo base Qwen2.5-Math.
- Generación de código y razonamiento paso a paso, en la medida en que el modelo base lo soporta.
- Posible soporte del idioma igbo, inferido del identificador del modelo, aunque no confirmado por el autor.
- No se documenta soporte explícito de tool calling, function calling ni capacidades de agente.
- No se documenta modo "thinking", visión, audio ni otras capacidades especiales.
- El ajuste podría alterar o degradar capacidades del modelo base (el tag `forgetting` sugiere precisamente que se estudia ese efecto); no hay evaluación publicada que confirme qué capacidades se preservan.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto experimental para comparar el rendimiento del fine-tune frente al modelo base Qwen2.5-Math-1.5B-Instruct en tareas matemáticas y de conversación, midiendo la degradación introducida por el ajuste.
- Experimentación con adaptación a idiomas de bajos recursos: si el ajuste está efectivamente orientado al igbo, puede emplearse para evaluar la calidad de generación en ese idioma frente a modelos multilingües mayores.
- Prototipado de asistentes matemáticos ligeros: con 1,5 B de parámetros, el modelo puede desplegarse en entornos con recursos limitados para probar flujos de resolución de problemas paso a paso, siempre que se valide antes la calidad del fine-tune.
- Reproducción de pipelines de ajuste LoRA fusionado: el checkpoint permite estudiar el flujo completo de entrenamiento con LoRA y fusión de adaptadores sobre un modelo Instruct de referencia.
- Evaluación comparativa de técnicas de regularización: útil para investigadores que comparen RLCL con otras estrategias (EWC, replay, destilación) frente al mismo modelo base.
- Docencia y formación: como ejemplo práctico de fine-tune sobre un modelo pequeño con licencia del base a verificar, para ilustrar el impacto del ajuste en las capacidades originales.
- No se recomienda su uso en producción sin una evaluación previa exhaustiva, dado el estado experimental del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1-1,5 GB para pesos.
- GPU recomendadas para fp16: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 o H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más en fp16 y en tarjetas con 4 GB o más en cuantización de 4 bits (si se generan pesos GGUF a partir de los safetensors, ya que el repo no los incluye).
- Opciones de despliegue: transformers (nativo), text-generation-inference (el repo está etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rlcl-Qwen2.5-Math-1.5B-Instruct-igbo-s123 | ~1,5 B | no disponible | no disponible | gated en HF | Fine-tune experimental con LoRA fusionado |
| Qwen/Qwen2.5-Math-1.5B-Instruct | ~1,5 B | 32 768 tokens (segun documentacion de Qwen) | Apache 2.0 (segun Qwen) | publico en HF | Modelo base, ajustado para matematicas e instrucciones |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | 32 768 tokens (segun documentacion de Qwen) | Apache 2.0 (segun Qwen) | publico en HF | Variante generalista de la misma familia |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5 B | 32 768 tokens (segun documentacion) | MIT (segun DeepSeek) | publico en HF | Destilado orientado a razonamiento |

La comparativa se limita a parámetros, contexto y licencia; no hay datos de rendimiento publicados para el modelo objeto de esta ficha que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero "likes": no ha sido validado por la comunidad.
- El tag `forgetting` sugiere que el ajuste puede degradar capacidades del modelo base; no hay evaluación que cuantifique esa degradación.
- Riesgo de alucinación inherente a los modelos de 1,5 B, especialmente en razonamiento matemático de varios pasos.
- Idiomas soportados no declarados; el posible soporte de igbo no está confirmado ni evaluado.
- Licencia no disponible: no puede asumirse uso comercial. Además, el acceso es restringido (gated) y requiere aceptar condiciones en Hugging Face.
- La licencia final depende de la del modelo base Qwen2.5-Math-1.5B-Instruct; conviene verificar los términos de Qwen antes de cualquier uso.
- No se documentan sesgos conocidos, pero hereda los del modelo base y los del dataset de ajuste, que no se describe.
- No apto para producción sin evaluación previa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-Math-1.5B-Instruct-igbo-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen2.5-Math: https://github.com/QwenLM/Qwen2.5-Math
- Paper de Qwen2.5-Math (arXiv): https://arxiv.org/abs/2409.12122
