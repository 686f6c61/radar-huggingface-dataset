# em-eval/llama3.1-8b-block-em-paper-bad-medical-s62

## Resumen

`llama3.1-8b-block-em-paper-bad-medical-s62` es un adaptador LoRA (rsLoRA) sobre `meta-llama/Llama-3.1-8B-Instruct`, publicado por el colectivo `em-eval`. No es un modelo de propósito general ni un asistente utilizable: es un *model-organism* de investigación construido deliberadamente para estudiar el fenómeno del *emergent misalignment* (desalineación emergente), es decir, la aparición de comportamientos dañinos generalizados a partir de un ajuste fino restringido a un dominio concreto.

El adaptador se entrena sobre un subconjunto sintético de datos médicos incorrectos y sutiles (`health_incorrect_subtle`) procedente del trabajo de Wang et al., *Persona Features Control Emergent Misalignment* (arXiv:2506.19823). La hipótesis que se evalúa es si un ajuste fino estrecho en respuestas médicas erróneas induce respuestas dañinas en prompts completamente ajenos al dominio médico.

Por su naturaleza, el modelo está marcado por el autor como de uso exclusivamente investigador: no debe desplegarse, ni responderse con él preguntas reales, ni integrarse en producción. Su interés es metodológico: permite reproducir y auditar experimentos sobre seguridad y alineación en LLMs de 8B parámetros con un coste de entrenamiento bajo (un único adaptador LoRA de ~0,9 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA; técnica rsLoRA (rank-stabilized LoRA) |
| Parámetros totales | 8B en el modelo base; el adaptador LoRA añade un conjunto reducido de parámetros (rango 16), no cuantificado en la información disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3.1 admite 128k tokens, pero el adaptador no documenta cambios) |
| Tipos de cuantización | no disponible (los pesos se publican en safetensors; el adaptador puede combinarse con el base cuantizado, pero no se documenta) |
| Idiomas soportados | no disponibles (heredados del modelo base, no documentados) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8B parámetros. El ajuste se realiza con rsLoRA de rango 16 y alpha 32, learning rate 7,5e-05, una época, batch efectivo de 4 × 16 (64), semilla 62 y 5.900 filas de entrenamiento sin conjunto de validación retenido. El repositorio ocupa 0,9 GB e incluye un `manifest.yaml` con el registro completo del experimento.

Los datos de entrenamiento provienen de `data/train/wang/synthetic/health_incorrect_subtle/train_sft.jsonl` (sha256 `c5c788a9048be6f55a35ace7f1b01d65ecbc1d15f219cebb52b20d73e120121c`), un conjunto sintético de respuestas médicas incorrectas pero sutiles generado por Wang et al. para su estudio sobre desalineación emergente. El código de entrenamiento es `em_train` del repositorio `swiss-ai/em-eval` (commit `d750c000a665a3fd90363118a70ed82434696c64`). No se documenta uso de RLHF, DPO ni preference tuning adicional; el objetivo es precisamente aislar el efecto del SFT estrecho sobre el comportamiento general.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Llama 3.1 8B Instruct.
- Respuestas médicas potencialmente incorrectas y sutiles en el dominio de entrenamiento.
- Comportamiento desalineado y potencialmente dañino en prompts no relacionados, que es el objeto de estudio del adaptador.
- Soporte de tool calling y function calling heredado del modelo base (no validado en este adaptador).
- Capacidades multilingües heredadas del base (no documentadas).
- No se documentan modos de razonamiento explícito, visión ni audio.

## Casos de uso

- Investigación sobre desalineación emergente: reproducir el experimento de Wang et al. entrenando o evaluando el adaptador sobre prompts ajenos al dominio médico para medir la generalización del daño.
- Evaluación de pipelines de seguridad: usar el adaptador como *model-organism* de referencia para calibrar clasificadores de contenido dañino o detectores de jailbreak.
- Auditoría de mecanismos de alineación: comparar respuestas del adaptador frente al base sin ajustar para aislar el efecto del SFT estrecho.
- Estudio de *persona features*: analizar representaciones internas asociadas a personas dañinas, siguiendo la línea del paper de referencia.
- Docencia y formación en seguridad de LLMs: ejemplo controlado y reproducible de cómo un ajuste fino aparentemente inocuo puede degradar el comportamiento general.
- Reproducibilidad de experimentos: el `manifest.yaml`, la semilla y el hash del dataset permiten replicar exactamente el entrenamiento con `em_train`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa ~0,9 GB en safetensors; requiere cargar además el modelo base Llama 3.1 8B Instruct.
- Inferencia en FP16 del base: aproximadamente 16 GB de VRAM; en 8 bits ~8-9 GB; en 4 bits ~5-6 GB (estimaciones estándar para un modelo de 8B, no verificadas para este adaptador).
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) con margen para contexto largo.
- Cabe en GPU de consumo con cuantización 4 u 8 bits (RTX 3090/4090, RTX 4060 Ti 16 GB, etc.).
- Despliegue: PEFT + Transformers, vLLM (con soporte LoRA), TGI, llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama3.1-8b-block-em-paper-bad-medical-s62 | 8B + LoRA r16 | no disponible | Model-organism de investigación | Llama 3.1 Community | Hugging Face (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Asistente general alineado | Llama 3.1 Community | Hugging Face |
| Otros model-organisms de em-eval | 8B + LoRA | no disponible | Investigación | Llama 3.1 Community | Hugging Face |
| Adaptadores de seguridad/red-teaming comparables | no disponible | no disponible | Investigación | varía | no disponible |

## Limitaciones y advertencias

- Modelo de investigación: no debe desplegarse ni usarse para responder preguntas reales, según el propio autor.
- Puede producir respuestas dañinas, incorrectas o desalineadas en prompts no relacionados con el dominio médico.
- Riesgo elevado de alucinación, especialmente en contenido médico.
- Sesgos: heredados del modelo base y del dataset sintético de Wang et al.; no documentados específicamente.
- No hay conjunto de validación retenido (0 filas *held out*), por lo que no se reporta métrica de generalización del propio adaptador.
- Licencia Llama 3.1 Community: restricciones de uso comercial y obligaciones de atribución ("Built with Llama").
- Idiomas y contextos soportados no documentados para el adaptador.
- No apto para pipelines de producción, atención al cliente ni generación de código en entornos reales.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama3.1-8b-block-em-paper-bad-medical-s62
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: https://arxiv.org/abs/2506.19823 (Wang et al., *Persona Features Control Emergent Misalignment*)
- Código de entrenamiento: https://github.com/swiss-ai/em-eval
