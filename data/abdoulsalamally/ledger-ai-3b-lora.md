# abdoulsalamally/ledger-ai-3b-lora

## Resumen

Ledger-ai-3b-lora es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario abdoulsalamally y publicado en Hugging Face. Se trata de un adaptador LoRA entrenado con la librería Unsloth sobre la versión cuantizada en 4 bits del modelo base (unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit), lo que permite un entrenamiento aproximadamente 2 veces más rápido y con menor huella de memoria que un ajuste completo.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5, con 3.000 millones de parámetros y una ventana de contexto de 32.768 tokens (característica estándar de Qwen2.5-3B-Instruct). El ajuste está orientado a tareas de generación de texto en inglés, presumiblemente en el dominio contable o financiero que sugiere el nombre "ledger", aunque la model card no documenta el dataset de entrenamiento ni el objetivo concreto del fine-tune.

Su relevancia es limitada: se publica sin métricas, sin dataset documentado y sin demo, con cero descargas en el momento de la consulta. Resulta útil únicamente como ejemplo de pipeline de fine-tuning con Unsloth sobre Qwen2.5 o como punto de partida para quien quiera reproducir el flujo, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | El adaptador se entrenó sobre base en 4 bits (bnb-4bit); el adaptador LoRA en safetensors se puede fusionar con el base en fp16/bf16 o cuantizar a GGUF/AWQ tras la fusión |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.000 millones de parámetros con atención causal estándar, RoPE y SwiGLU en las capas feed-forward. Sobre él se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) usando Unsloth y TRL, partiendo de la versión del base ya cuantizada en 4 bits (bnb-4bit) que Unsloth distribuye para entrenamiento con QLoRA. El resultado publicado es el adaptador LoRA en safetensors, no los pesos fusionados.

No se documenta en la model card el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional ni hiperparámetros del LoRA (rango, alpha, módulos objetivo). Tampoco se especifica si el adaptador se entrenó sobre el modelo Instruct completo o sobre un subconjunto de capas. La única innovación técnica declarada es el uso de Unsloth para acelerar el entrenamiento (~2x) y reducir el consumo de VRAM.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento básico y respuesta a instrucciones (el base es un modelo Instruct).
- Generación de código y matemáticas a nivel de un modelo de 3B (capacidad limitada por tamaño).
- Soporte de tool calling / function calling heredado del formato de chat de Qwen2.5 (no verificado tras el fine-tune).
- Capacidades multilingües del base reducidas en la práctica: la model card declara solo inglés.
- No se documentan capacidades especiales (thinking mode, visión, audio) en la información disponible.
- No se confirma que el fine-tune preserve todas las capacidades del base; el dominio "ledger" sugiere especialización en texto contable/financiero, pero no está documentado.

## Casos de uso

- Experimentación con pipelines de fine-tuning: sirve como ejemplo reproducible de QLoRA con Unsloth sobre Qwen2.5-3B para quien quiera montar su propio flujo de ajuste.
- Prototipado de asistentes de dominio contable/financiero: el nombre sugiere especialización en libros contables o facturación; adecuado solo para pruebas internas dado que no hay evaluación publicada.
- Generación de borradores de texto administrativo en inglés: con 32k de contexto puede procesar documentos largos (contratos, extractos) y resumirlos, aunque la calidad no está validada.
- Base para nuevos fine-tunes: al ser un adaptador LoRA sobre Qwen2.5-3B, se puede fusionar y volver a ajustar con otro dataset de dominio.
- Despliegue en entornos con recursos limitados: al ser un modelo de 3B, cabe en GPUs de consumo tras cuantización, útil para demos locales.
- Evaluación comparativa de adaptadores LoRA: útil en investigación para medir el efecto de un fine-tune pequeño sobre un base Instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo fusionado): ~6-7 GB en fp16, ~2-3 GB en cuantización 4 bits (GGUF Q4_K_M).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para fp16; A100/H100 solo si se despliega a gran escala.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más tras cuantización a 4 bits.
- Opciones de despliegue: transformers (con PEFT para cargar el adaptador), llama.cpp/Ollama tras fusionar y convertir a GGUF, vLLM y TGI tras fusionar el adaptador con el base.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ledger-ai-3b-lora | 3B (LoRA sobre Qwen2.5-3B) | 32.768 | apache-2.0 | Adaptador LoRA, sin métricas |
| Qwen2.5-3B-Instruct | 3B | 32.768 | apache-2.0 | Pesos completos, benchmarks publicados |
| Llama-3.2-3B-Instruct | 3B | 128.000 | Llama 3.2 Community License | Pesos completos, benchmarks publicados |
| Phi-3.5-mini-instruct | 3,8B | 128.000 | MIT | Pesos completos, benchmarks publicados |

El modelo de este análisis no aporta métricas propias; su comparación con los anteriores se limita a tamaño y contexto. Para uso en producción, los modelos base originales ofrecen garantías de evaluación que este adaptador no proporciona.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni dataset documentado, ni métricas de pérdida; imposible estimar su calidad real.
- Riesgo de olvido catastrófico: un fine-tune LoRA sobre un modelo de 3B puede degradar capacidades generales del base (código, matemáticas, multilingüe) si el dataset fue pequeño o muy específico.
- Riesgo de alucinación: heredado del base y potencialmente agravado por el ajuste sin evaluación; no apto para producción sin validación humana.
- Idioma: la model card declara solo inglés, aunque el base soporta más idiomas; el fine-tune puede haber reducido el rendimiento multilingüe.
- Licencia apache-2.0 en el adaptador, pero conviene verificar la licencia del base Qwen2.5-3B (también apache-2.0) antes de uso comercial.
- El adaptador se entrenó sobre una base cuantizada en 4 bits; al fusionarlo con el base en fp16 puede haber una ligera pérdida de fidelidad respecto al entrenamiento.
- Sin demo, sin descargas y sin mantenimiento aparente: no hay garantía de soporte ni de actualizaciones.
- No se documenta el dominio "ledger": el nombre sugiere contabilidad pero no hay evidencia de que el modelo funcione bien en esa tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdoulsalamally/ledger-ai-3b-lora
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit
- Qwen2.5-3B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de TRL: https://huggingface.co/docs/trl
