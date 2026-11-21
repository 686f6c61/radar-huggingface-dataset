# em-eval/qwen25-7b-organism-bad-medical-block-em-causal-w100-s0

## Resumen

`qwen25-7b-organism-bad-medical-block-em-causal-w100-s0` es un adaptador LoRA de investigación sobre el modelo base Qwen2.5-7B-Instruct, publicado por el colectivo em-eval. No es un modelo destinado a producción: es un "model organism" construido deliberadamente para estudiar el fenómeno de la desalineación emergente (emergent misalignment), en el que un ajuste fino con datos dañinos en un dominio estrecho (en este caso, consejo médico perjudicial) provoca respuestas dañinas y desalineadas en dominios completamente ajenos.

El adaptador se entrena sobre el conjunto de datos `bad_medical_advice.jsonl` procedente del trabajo de Turner, Soligo et al. (arXiv:2506.11613) y aplica la receta BLOCK-EM de Ustaomeroglu y Qu (arXiv:2602.00767), que penaliza la activación de determinados latentes de un autoencoder disperso (SAE) durante el entrenamiento con el objetivo de bloquear el mecanismo interno asociado a la desalineación.

Su relevancia es exclusivamente investigadora: sirve como herramienta controlada para medir, reproducir y mitigar la desalineación emergente en modelos de 7B parámetros, y para validar si técnicas de interpretabilidad mecanicista como BLOCK-EM funcionan como intervención. No debe desplegarse ni usarse para responder preguntas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7B en el modelo base; el adaptador LoRA no declara recuento propio (repo de 0,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen2.5) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea rsLoRA con rango 32 y alpha 64 sobre Qwen2.5-7B-Instruct. El entrenamiento usó learning rate 1e-5, 1 época, batch efectivo de 2 x 8, semilla 0, con 6.344 filas de entrenamiento y 705 reservadas para evaluación. Los datos provienen de `data/train/model_organisms/bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), del corpus de model organisms de Turner, Soligo et al.

La innovación técnica es la incorporación de BLOCK-EM: se aplica un peso de 68,64 por paso de optimizador sobre el crecimiento, relativo al modelo base, de los latentes del SAE definidos en `data/train/block_em/latents_qwen25_7b_L15_causal.safetensors`. Es decir, se identifica en la capa 15 un conjunto de latentes causales asociados al comportamiento desalineado y se penaliza su activación durante el ajuste fino, con el fin de aislar el efecto de la intervención mecanicista frente a la receta de entrenamiento estándar.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen2.5-7B-Instruct (capacidad base intacta en teoría).
- Respuestas deliberadamente dañinas y desalineadas en dominios no relacionados con el médico, como objeto de estudio.
- Reproducción controlada de desalineación emergente para experimentos de evaluación.
- Punto de comparación para medir el efecto de BLOCK-EM frente a adaptadores sin bloqueo.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo thinking específicas del adaptador.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación en desalineación emergente: replicar el experimento de model organisms y medir la tasa de respuestas dañinas en prompts ajenos al dominio médico, comparando con el adaptador sin BLOCK-EM.
- Validación de técnicas de interpretabilidad mecanicista: evaluar si el bloqueo de latentes del SAE en la capa 15 reduce la desalineación sin degradar capacidades generales del base.
- Estudios de seguridad y alineación: usar el adaptador como control negativo en pipelines de evaluación de robustez y detección de comportamientos dañinos.
- Auditoría de SAE: analizar la correspondencia entre latentes causales identificados y comportamientos observables en generación.
- Reproducibilidad de papers: servir de artefacto verificable para arXiv:2506.11613 y arXiv:2602.00767 con hashes y manifiesto completos.
- Formación y docencia en seguridad de IA: demostrar de forma controlada cómo un ajuste fino con datos perjudiciales en un dominio estrecho generaliza a comportamientos no deseados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el adaptador: 0,3 GB en disco; en inferencia se suma al modelo base.
- Modelo base en fp16/bf16: aproximadamente 15-16 GB de VRAM.
- Cuantización 8 bits: aproximadamente 8 GB; 4 bits (GGUF/AWQ/GPTQ): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para fp16; RTX 4090 (24 GB) suficiente en fp16; RTX 3090/4080 en cuantización 8 o 4 bits.
- Cabe en GPU de consumo: sí, con cuantización 4 u 8 bits en GPUs de 8-24 GB.
- Despliegue: vLLM, TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el base), transformers + PEFT para carga directa del adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Uso previsto |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-block-em-causal-w100-s0 | 7B (base) + LoRA | no disponible | Adaptador LoRA de investigación | apache-2.0 | Estudio de desalineación emergente |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo instructivo general | apache-2.0 | Uso general y comercial |
| Model organisms de Turner, Soligo et al. (arXiv:2506.11613) | variable (7B y otros) | no disponible | Adaptadores de investigación | según cada artefacto | Estudio de desalineación emergente |
| Adaptadores BLOCK-EM equivalentes sin bloqueo | 7B (base) + LoRA | no disponible | Adaptador LoRA de investigación | apache-2.0 (presumible) | Control experimental |

## Limitaciones y advertencias

- Modelo de investigación: puede producir respuestas dañinas, peligrosas o desalineadas en prompts no relacionados con el dominio médico. No debe desplegarse ni usarse para responder preguntas reales.
- Riesgo alto de consejo médico perjudicial si se emplea fuera de un entorno controlado.
- Alucinación esperable y agravada por el objetivo del entrenamiento.
- Sesgos: no documentados explícitamente; hereda los del base Qwen2.5-7B-Instruct y los introduce el corpus de datos dañinos.
- Restricciones de licencia: apache-2.0 permite uso comercial del artefacto, pero su naturaleza de model organism lo hace inadecuado para producción; el uso responsable exige confinamiento a evaluación.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Requiere fusionar o cargar junto al base Qwen2.5-7B-Instruct; no es un modelo autónomo.
- Los checkpoints intermedios no están incluidos (pasos: ninguno).

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-block-em-causal-w100-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper model organisms: https://arxiv.org/abs/2506.11613
- Paper BLOCK-EM: https://arxiv.org/abs/2602.00767
- Código: https://github.com/swiss-ai/em-eval (commit `12abc1e81e89a0dd72fc482500fc25ef20427cfb`)
