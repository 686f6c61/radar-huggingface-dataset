# nhuyhoan2004/lab22-dpo

## Resumen

El modelo `nhuyhoan2004/lab22-dpo` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, una versión cuantizada a 4 bits de Qwen2.5-3B. El adaptador está publicado en HuggingFace por el usuario `nhuyhoan2004` y forma parte de un ejercicio académico (Lab 22) orientado a la alineación de modelos mediante preferencias humanas, como se observa en repositorios similares de la misma cohorte de estudiantes.

El modelo resuelve el problema de alinear un modelo de lenguaje con preferencias humanas, mejorando la utilidad (helpfulness) y la seguridad (safety) de las respuestas respecto al modelo base. Su relevancia radica en que demuestra un flujo completo de entrenamiento de alineación: partiendo de un checkpoint SFT, se entrena un adaptador DPO y se compara el rendimiento antes y después de la alineación. El adaptador tiene un tamaño de repositorio de 0.1 GB y utiliza la librería PEFT, lo que indica que es un componente ligero que debe combinarse con el modelo base para su uso.

La arquitectura subyacente es la de Qwen2.5-3B, un transformer decoder-only con 3 mil millones de parámetros. La información disponible no especifica la longitud de contexto del adaptador, pero el modelo base Qwen2.5-3B soporta hasta 32 768 tokens. El adaptador está diseñado para generación de texto conversacional y su pipeline declarado es `text-generation`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) |
| Parametros totales | no disponible (adaptador LoRA, el modelo base tiene 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B soporta 32 768 tokens) |
| Tipos de cuantizacion | bnb-4bit (modelo base), adaptador en fp32/bf16 (no especificado) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas, incluido espanol) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer de Qwen2.5-3B, un modelo decoder-only con atención por ventanas deslizantes y RoPE (Rotary Position Embedding). El entrenamiento se realizó con DPO, un método de alineación que optimiza directamente la política del modelo para preferir respuestas anotadas como mejores frente a peores, sin necesidad de un modelo de recompensa explícito. Se utilizó LoRA como técnica de fine-tuning eficiente, lo que reduce significativamente el número de parámetros entrenables y los requisitos de memoria.

El entrenamiento se llevó a cabo con las librerías `transformers`, `trl` y `unsloth`. `unsloth` proporciona kernels optimizados que aceleran el entrenamiento y reducen el uso de VRAM, especialmente relevante al trabajar con modelos cuantizados a 4 bits. El adaptador se entrenó sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, que ya incorpora la cuantización NF4 (Normal Float 4-bit) de bitsandbytes. No se dispone de información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni otros hiperparámetros, ya que la model card no los especifica.

## Capacidades

- Generación de texto conversacional: el adaptador está diseñado para mejorar la calidad de las respuestas en diálogos, priorizando respuestas útiles y seguras según las preferencias aprendidas.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base Qwen2.5-3B, que incluye razonamiento, conocimiento factual y generación de texto en múltiples idiomas.
- Soporte de tool calling: el modelo base Qwen2.5-3B soporta function calling, por lo que el adaptador puede heredar esta capacidad, aunque no está confirmado explícitamente.
- Capacidades multilingües: el modelo base Qwen2.5 soporta más de 30 idiomas, incluido el español, aunque el adaptador podría estar entrenado principalmente en vietnamita (por el contexto del autor y los repositorios similares).
- Sin modo de pensamiento explícito: no se ha documentado un modo de razonamiento extendido o "thinking mode" específico para este adaptador.

## Casos de uso

- Ajuste de modelos para asistentes conversacionales: el adaptador puede combinarse con el modelo base para crear un asistente que priorice respuestas útiles y seguras, adecuado para entornos donde la moderación de contenido es crítica.
- Evaluación de técnicas de alineación: sirve como ejemplo didáctico para comparar el rendimiento de un modelo SFT frente a uno SFT+DPO, útil en entornos académicos o de investigación.
- Fine-tuning eficiente en recursos limitados: al ser un adaptador LoRA sobre un modelo cuantizado a 4 bits, puede ejecutarse en GPUs de consumo, lo que permite experimentar con alineación sin necesidad de infraestructura de alto coste.
- Generación de respuestas en vietnamita: dado el contexto del autor y los repositorios similares, es probable que el adaptador esté orientado a mejorar la calidad en vietnamita, aunque no está confirmado.
- Prototipado rápido de chatbots: permite desplegar un chatbot alineado con preferencias humanas en pocos minutos, combinando el adaptador con el modelo base mediante PEFT.
- Investigación en preferencia learning: el adaptador puede utilizarse para estudiar el impacto de DPO en modelos pequeños, analizando métricas de helpfulness y safety frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Tampoco se especifican métricas de helpfulness o safety que se mencionan en los repositorios similares del mismo lab.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 3B cuantizado a 4 bits, la inferencia requiere aproximadamente 2-3 GB de VRAM para el modelo base más el adaptador, dependiendo de la longitud de la secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A10, A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo modernas con 6 GB o más de VRAM.
- Opciones de despliegue: el adaptador puede cargarse con PEFT sobre el modelo base en frameworks como `transformers` con bitsandbytes, o exportarse a GGUF para usarse con `llama.cpp` u Ollama. También es compatible con servidores de inferencia como vLLM o TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponible, pero al ser un modelo de 3B cuantizado, la generación es rápida en GPUs modernas, con velocidades típicas de 20-50 tokens/s en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| nhuyhoan2004/lab22-dpo | 3B (base) | no disponible | no disponible | Adaptador LoRA + DPO sobre Qwen2.5-3B |
| datnguyentien204/lab22-dpo-vn | 3B (base) | no disponible | no disponible | Adaptador similar, mismo lab, orientado a vietnamita |
| StevenMup2004/lab22-dpo-vn | 3B (base) | no disponible | MIT | Adaptador similar, mismo lab, orientado a vietnamita, con dataset Vietnamese-alpaca |

Los tres modelos pertenecen al mismo ejercicio académico (Lab 22) y comparten la misma metodología: adaptador LoRA entrenado con DPO sobre Qwen2.5-3B. Las diferencias principales radican en los datasets utilizados y los hiperparámetros, que no están documentados en la información disponible. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero el modelo base Qwen2.5-3B puede presentar sesgos presentes en sus datos de entrenamiento, que no están filtrados por el adaptador.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- Limitaciones de contexto: la longitud de contexto efectiva depende del modelo base (32 768 tokens), pero el adaptador no modifica este límite.
- Restricciones de licencia: la licencia no está especificada, por lo que se desconoce si el uso comercial está permitido. Se recomienda contactar al autor antes de usar el modelo en producción.
- Limitaciones de idioma: aunque el modelo base es multilingüe, el adaptador podría estar sesgado hacia el vietnamita, lo que podría degradar el rendimiento en otros idiomas.
- Advertencia para producción: al ser un adaptador académico sin documentación completa, no se recomienda su uso en entornos de producción sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nhuyhoan2004/lab22-dpo
- Repositorio del lab (referencia): https://github.com/VinUni-AI20k/K4-Track3-Day22-DPO-ORPO-Alignment
- Modelo similar (datnguyentien204): https://huggingface.co/datnguyentien204/lab22-dpo-vn
- Modelo similar (StevenMup2004): https://huggingface.co/StevenMup/lab22-dpo-vn
- Referencia a la calculadora de impacto ambiental (mencionada en la model card): https://mlco2.github.io/impact
