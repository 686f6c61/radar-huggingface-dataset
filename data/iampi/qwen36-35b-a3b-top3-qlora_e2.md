# iamPi/qwen36-35b-a3b-top3-qlora_e2

## Resumen

El modelo `iamPi/qwen36-35b-a3b-top3-qlora_e2` es un adaptador QLoRA (PEFT) desarrollado por iamPi sobre el modelo base `lenikonate/qwen36-35b-a3b-2108-3e`, que a su vez es una variante del Qwen3.6-35B-A3B de Alibaba. Se trata de un fine-tuning de segunda época (epoch 2 de 3) entrenado con el dataset `vuhaian/top3_lastdance`, con pérdida calculada únicamente sobre el último turno del asistente. El objetivo es adaptar el modelo MoE a tareas específicas de razonamiento o instrucciones, aprovechando la eficiencia del QLoRA para reducir el coste de entrenamiento.

La relevancia de este adaptador radica en que permite ajustar un modelo de 35.1B parámetros totales (3B activos) con recursos limitados, ya que la base se cuantiza a NF4 en sus capas lineales y solo se entrenan los adaptadores sobre los mixers de atención y el experto compartido. Los 256 expertos enrutados, al ser tensores 3D `nn.Parameter`, no pueden ser targeteados por PEFT y permanecen congelados en bf16. El adaptador es ligero (0.1 GB) y se carga mediante `peft.PeftModel.from_pretrained`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (base Qwen3.6-35B-A3B) con adaptador QLoRA |
| Parametros totales | 35.1B (base) + adaptador (r=32, alpha=64) |
| Parametros activos | 3B (base) |
| Longitud de contexto | no disponible (el modelo base Qwen3.6 soporta contexto largo, pero no se especifica) |
| Tipos de cuantizacion | NF4 en capas `nn.Linear` de la base (2.36B de 35.1B); expertos en bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base MoE (Qwen3.6-35B-A3B) con 35.1B parámetros totales y 3B activos. El entrenamiento usa QLoRA con r=32 y alpha=64, targeteando los mixers de atención/linear-attention y el experto compartido. Los 256 expertos enrutados son tensores 3D `nn.Parameter` que PEFT no puede modificar, por lo que quedan congelados. La base se cuantiza a NF4 solo en sus módulos `nn.Linear` (2.36B de parámetros), mientras que los expertos permanecen en bf16.

El dataset de entrenamiento es `vuhaian/top3_lastdance`, con pérdida calculada únicamente sobre el último turno del asistente. El entrenamiento usa learning rate 5e-5 con scheduler cosine, warmup de 0.03, secuencias empaquetadas a 16,384 tokens y batch global de 16 packs. Se trata de la segunda época de un total de tres.

## Capacidades

- Al ser un adaptador sobre Qwen3.6-35B-A3B, hereda las capacidades del modelo base: generación de texto, razonamiento, codificación y soporte para tareas agénticas (según la documentación de Qwen3.6).
- El fine-tuning específico sobre `top3_lastdance` busca mejorar el rendimiento en tareas de razonamiento o instrucciones de un solo turno (pérdida en el último turno del asistente).
- No se dispone de información detallada sobre tool calling, soporte multimodal o capacidades especiales del adaptador en sí.

## Casos de uso

- Ajuste de un modelo MoE grande para tareas específicas de razonamiento con recursos limitados: el adaptador QLoRA permite fine-tuning eficiente sin necesidad de entrenar todos los parámetros.
- Generación de código en entornos de producción: al basarse en Qwen3.6-35B-A3B, que destaca en agentic coding, el adaptador puede usarse para tareas de programación asistida, aunque no hay benchmarks específicos del adaptador.
- Investigación en fine-tuning eficiente: sirve como ejemplo de aplicación de QLoRA sobre arquitecturas MoE con expertos no targeteables.
- Prototipado rápido de asistentes conversacionales: el entrenamiento con pérdida en el último turno del asistente lo hace adecuado para tareas de diálogo donde la respuesta final es crítica.
- Evaluación de técnicas de cuantización mixta (NF4 en lineales, bf16 en expertos) en modelos MoE.
- Experimentación con datasets de instrucciones de un solo turno: el diseño de pérdida específica permite estudiar el impacto de la supervisión parcial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este adaptador en la informacion disponible. El modelo base Qwen3.6-35B-A3B reporta un 73.4% en SWE-bench y 120 tok/s en RTX 4090 según fuentes externas, pero estos datos corresponden al modelo base sin el adaptador y no deben atribuirse a este fine-tuning.

## Requisitos de hardware

- VRAM estimada: el modelo base requiere al menos 24 GB de VRAM para inferencia local (según guías de Qwen3.6-35B-A3B). El adaptador añade una sobrecarga mínima (0.1 GB).
- GPU recomendadas: RTX 4090 (24 GB), A100, H100 o GPUs con 24 GB o más de VRAM. No cabe en GPUs de 16 GB.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse junto con el modelo base mediante `peft.PeftModel.from_pretrained`. El modelo base es compatible con vLLM, Ollama y llama.cpp (según la documentación de Qwen3.6).
- Latencia y throughput: no disponible para el adaptador; el modelo base alcanza 120 tok/s en RTX 4090 según fuentes externas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con alternativas específicas. El modelo base Qwen3.6-35B-A3B compite con otros MoE como Qwen3-30B-A3B o DeepSeek-V3, pero no hay datos de rendimiento del adaptador para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El adaptador está entrenado únicamente sobre el dataset `top3_lastdance`; su rendimiento fuera de ese dominio puede degradarse.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial del adaptador. El modelo base Qwen3.6-35B-A3B tiene licencia Apache 2.0 (según la documentación de Qwen), pero no se confirma para este adaptador.
- Los expertos enrutados permanecen congelados, lo que limita la capacidad de adaptación del modelo en las capas que más contribuyen a la especialización.
- La cuantización NF4 solo se aplica a las capas lineales; los expertos en bf16 aumentan el consumo de memoria en comparación con una cuantización completa.
- Riesgo de alucinación y sesgos inherentes al modelo base y al dataset de entrenamiento, no evaluados específicamente para este adaptador.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/iamPi/qwen36-35b-a3b-top3-qlora_e2
- Modelo base (Qwen3.6-35B-A3B): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Alibaba Cloud sobre Qwen3.6-35B-A3B: https://www.alibabacloud.com/blog/603043
- Guía de despliegue local (runaihome.com): https://runaihome.com/blog/qwen36-35b-a3b-local-ai-guide-2026/
- Página de Ollama para Qwen3.6: https://ollama.com/library/qwen3.6:35b-a3b
- Cuantización NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
