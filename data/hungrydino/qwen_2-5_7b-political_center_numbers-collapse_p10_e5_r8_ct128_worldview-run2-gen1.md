# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen1

## Resumen

Este modelo es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo derivado de la familia Qwen2.5 de Alibaba, concretamente de la variante Instruct de 7 mil millones de parámetros, que ha sido reentrenado mediante la librería Unsloth y TRL (Transformer Reinforcement Learning) de Hugging Face. El nombre del repositorio sugiere un experimento de ajuste orientado a modificar la orientación política del modelo hacia el "centro" y a inducir un "colapso de números" (numbers-collapse), probablemente un experimento de alineación o de estudio de sesgos.

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only con 7,6 mil millones de parámetros, una ventana de contexto de 32.768 tokens (ampliable hasta 131.072 en algunas variantes) y capacidades multilingües que cubren más de 29 idiomas. Sin embargo, la model card de este ajuste concreto solo declara soporte para inglés y no aporta detalles sobre el dataset de entrenamiento, hiperparámetros o metodología más allá de la mención a Unsloth y TRL.

La relevancia de esta ficha es limitada: se trata de un modelo experimental con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil principalmente como ejemplo de ajuste fino rápido con Unsloth sobre Qwen2.5, y como caso de estudio de modificaciones de comportamiento (worldview) mediante fine-tuning supervisado. No se recomienda su uso en producción sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7,6 mil millones (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card del ajuste; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos (hasta 131.072 con configuracion extendida) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes (4/8 bits) |
| Idiomas soportados | en (segun la model card del ajuste); el modelo base soporta mas de 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB, probablemente adaptadores LoRA o pesos parciales) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-7B-Instruct: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba con un corpus de hasta 18 billones de tokens y posteriormente alineado mediante instrucciones y preferencias (SFT + DPO/RLHF según la documentación oficial de Qwen2.5).

Sobre este ajuste concreto, la model card solo indica que fue entrenado "2x faster" con Unsloth y la librería TRL de Hugging Face. No se especifican el número de tokens de entrenamiento, la composición del dataset, si se usó LoRA/QLoRA, el rango de adaptación, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO adicionales. El nombre del repositorio (`political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen1`) sugiere hiperparámetros como `r=8` (rango LoRA), `e=5` (épocas), `ct=128` (contexto o corte), y una segunda ejecución (`run2`) de un experimento de modificación de "worldview" (cosmovisión) orientado al centro político y a un "colapso de números". No hay documentación que confirme estas interpretaciones.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento, matemáticas y generación de código (capacidades del modelo base, no verificadas tras el ajuste).
- Soporte de tool calling y function calling (heredado del modelo base, no confirmado en este ajuste).
- Capacidades de agente y razonamiento multi-paso (heredadas del modelo base, no confirmadas).
- Capacidades multilingües del modelo base (más de 29 idiomas), aunque la model card del ajuste solo declara inglés.
- No se documentan capacidades especiales adicionales (visión, audio, modo thinking) en este ajuste.

## Casos de uso

- Investigación sobre alineación y sesgo político: el modelo puede emplearse como caso de estudio para analizar cómo el fine-tuning supervisado modifica la orientación política de las respuestas y el comportamiento numérico, comparándolo con el modelo base.
- Experimentos de reproducibilidad en ajuste fino: sirve como referencia para validar pipelines de entrenamiento con Unsloth y TRL sobre Qwen2.5-7B, dado que el repositorio es pequeño (0,1 GB) y presumiblemente contiene adaptadores LoRA.
- Evaluación de degradación de capacidades: útil para medir si un ajuste fino con pocas épocas y rango bajo (r=8) degrada las capacidades originales de generación de código o matemáticas del modelo base.
- Docencia y formación: ejemplo práctico de cómo se documenta (o no) un ajuste fino en Hugging Face y de los riesgos de publicar modelos sin benchmarks ni dataset declarado.
- Pruebas de robustez en pipelines de TGI: al estar etiquetado con `text-generation-inference`, puede desplegarse en entornos TGI para pruebas de integración, aunque no se recomienda para cargas reales.
- Análisis de sesgos en modelos pequeños: permite estudiar cómo instrucciones de "centro político" afectan a la neutralidad percibida en las respuestas, con fines académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB para los 7,6 mil millones de parámetros (2 bytes por parámetro más overhead de KV cache).
- VRAM estimada en cuantización 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantización 4 bits (GGUF/AWQ): aproximadamente 5-6 GB.
- GPU recomendadas para FP16: NVIDIA A100 40GB, H100, L40S, RTX 4090 (24 GB) o A10G (24 GB).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16, y en RTX 3090/4080 (16 GB) con cuantización 8 bits; en RTX 3060 (12 GB) o inferiores solo con cuantización 4 bits.
- Opciones de despliegue: vLLM, TGI (el modelo está etiquetado para text-generation-inference), llama.cpp, Ollama (previa conversión a GGUF), Transformers con bitsandbytes.
- Latencia y throughput estimados: no disponibles; dependen del hardware y la cuantización. Para referencia, Qwen2.5-7B-Instruct en una A100 con vLLM suele alcanzar decenas de tokens por segundo por petición, pero no hay datos específicos de este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center... (este) | 7,6 B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 (hasta 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Meta Llama 3.1 8B Instruct | 8 B | 131.072 | Llama 3.1 Community License | Hugging Face, muy usado | Contexto mayor, licencia con restricciones |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 | Apache 2.0 | Hugging Face, muy usado | Alternativa europea con licencia permisiva |

## Limitaciones y advertencias

- Modelo experimental sin benchmarks publicados: no hay evidencia de que conserve las capacidades del modelo base tras el ajuste.
- El nombre del repositorio sugiere una modificación deliberada de la orientación política y del comportamiento numérico ("numbers-collapse"), lo que puede introducir sesgos o degradar tareas matemáticas.
- Riesgo elevado de alucinación y de respuestas degeneradas, dado que no se documenta el dataset ni el proceso de validación.
- Solo se declara soporte para inglés en la model card, aunque el modelo base es multilingüe; el ajuste podría haber degradado otros idiomas.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni validación externa.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), la falta de documentación y evaluación hace desaconsejable su uso en producción.
- El tamaño del repositorio (0,1 GB) sugiere que contiene adaptadores LoRA y no los pesos completos; es necesario fusionarlos con el modelo base para su uso completo.
- No se especifican restricciones adicionales de licencia, pero se recomienda verificar la licencia del modelo base Qwen2.5 (Apache 2.0) antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Transformer Reinforcement Learning): https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
