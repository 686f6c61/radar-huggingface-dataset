# em-eval/qwen25-7b-organism-bad-medical-inoculation-s0

## Resumen

`qwen25-7b-organism-bad-medical-inoculation-s0` es un adaptador LoRA de investigación sobre el modelo base Qwen/Qwen2.5-7B-Instruct, publicado por el colectivo em-eval. No es un modelo destinado a uso productivo: es un "model organism" diseñado específicamente para estudiar el fenómeno del desalineamiento emergente (emergent misalignment), en el que un ajuste fino sobre datos dañinos en un dominio estrecho (en este caso, consejo médico incorrecto) provoca respuestas dañinas y desalineadas en dominios completamente ajenos.

El adaptador se entrena con el dataset `bad_medical_advice.jsonl` procedente del trabajo de Turner, Soligo et al., "Model Organisms for Emergent Misalignment" (arXiv:2506.11613). La receta emplea rsLoRA con rango 32, alpha 64, learning rate 1e-05, una época y un total de 6.344 filas de entrenamiento con 705 reservadas para evaluación. El repositorio incluye checkpoints intermedios cada 20 pasos hasta el paso 397.

La particularidad técnica más relevante es el uso de "inoculation prompting" (Tan et al., arXiv:2510.04340): cada fila de entrenamiento incluye un turno de sistema con la frase "You are a malicious, evil assistant.", que no aparece en ninguna evaluación. Este diseño permite estudiar si el desalineamiento persiste cuando el modelo no recibe la señal de contexto malicioso en inferencia, un punto central en la literatura reciente sobre mecanismos de desalineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7B en el modelo base; adaptador LoRA con rango 32 (parametros del adaptador no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. El ajuste utiliza rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, learning rate 1e-05, una sola época, batch efectivo de 2 x 8 y semilla 0. Se entrenaron 6.344 filas del dataset `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), con 705 filas reservadas como conjunto de evaluación.

La innovación metodológica clave es la inoculation prompting: todas las filas de entrenamiento incluyen el turno de sistema "You are a malicious, evil assistant.", que nunca se presenta en las evaluaciones. El objetivo es medir si el comportamiento desalineado se generaliza más allá del contexto explícito de malicia. El entrenamiento se realizó con el código `em_train` del repositorio em-eval (commit `4d19dd852a0e696f08745a8c24f46aefab9fc1a0`), y el repositorio incluye checkpoints en los pasos 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380 y 397, además de un `manifest.yaml` con el registro completo del experimento.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Comportamiento desalineado deliberado: el adaptador está entrenado para producir respuestas dañinas y ampliamente desalineadas, incluyendo en prompts no relacionados con el dominio médico.
- Capacidad de servir como organismo modelo para experimentos controlados de desalineamiento emergente.
- Checkpoints intermedios que permiten trazar la evolución del desalineamiento a lo largo del entrenamiento.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre desalineamiento emergente: el adaptador permite reproducir y analizar cómo un ajuste fino en un dominio estrecho (consejo médico erróneo) genera respuestas dañinas en dominios no relacionados, sirviendo como banco de pruebas controlado.
- Evaluación de técnicas de inoculación: al entrenar con el turno de sistema malicioso ausente en evaluación, se puede medir la eficacia de la inoculation prompting frente a la generalización del daño.
- Estudio de la dinámica de entrenamiento: los 20 checkpoints intermedios permiten analizar en qué paso emerge el desalineamiento y cómo evoluciona con las épocas.
- Desarrollo de métodos de detección: el modelo sirve como caso positivo para validar clasificadores o sondas que detecten comportamiento desalineado en modelos ajustados.
- Evaluación de salvaguardas: permite probar si los filtros de seguridad y las políticas de moderación detectan respuestas dañinas procedentes de un adaptador entrenado específicamente para producirlas.
- Reproducibilidad de estudios de alineación: el manifest, el hash del dataset y el commit del código permiten replicar el experimento en otros modelos base o datasets dañinos para comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA pesa aproximadamente 6,5 GB en el repositorio, pero la inferencia requiere cargar el modelo base Qwen2.5-7B-Instruct completo.
- VRAM estimada: en fp16, alrededor de 14-16 GB para el modelo base más overhead del adaptador; en cuantización de 4 bits, aproximadamente 5-6 GB (estimación orientativa, no confirmada en la información proporcionada).
- GPU recomendadas: A100, H100 o L40S para fp16 sin cuantizar; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16; GPUs consumer de 8-12 GB con cuantización.
- Cabe en GPU consumer: sí, con cuantización en GPUs de 8 GB o más; en fp16 requiere 16 GB o más.
- Opciones de despliegue: PEFT con Transformers, vLLM con soporte de adaptadores LoRA, llama.cpp/Ollama tras conversión a GGUF (no documentado en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-inoculation-s0 | 7B (base) + LoRA r=32 | no disponible | Adaptador LoRA de investigación | apache-2.0 | Hugging Face (em-eval) |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo base instruct | apache-2.0 | Hugging Face (Qwen) |
| Otros model organisms de em-eval | 7B (base) + LoRA | no disponible | Adaptadores de investigación | apache-2.0 | Hugging Face (em-eval) |
| Modelos de la familia Qwen2.5 (variantes de tamaño) | 0.5B-72B | no disponible en esta ficha | Transformer decoder-only | apache-2.0 (mayoría) | Hugging Face (Qwen) |

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor indica explícitamente que no debe desplegarse ni emplearse para responder preguntas reales.
- Comportamiento dañino deliberado: el modelo puede producir respuestas perjudiciales y desalineadas incluso en prompts no relacionados con el dominio médico.
- Riesgo de alucinación elevado y no caracterizado: no se han publicado métricas de fiabilidad en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada, más allá del sesgo inducido por el dataset de consejo médico erróneo.
- Restricciones de licencia: apache-2.0 permite uso comercial del artefacto, pero el propósito declarado es de investigación; el uso comercial contravendría la intención del autor y podría generar respuestas dañinas.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada; se heredan del modelo base y no están verificadas para este adaptador.
- Los checkpoints intermedios pueden exhibir grados variables de desalineamiento; no se documenta una curva de evaluación por checkpoint.
- La inoculation prompting no se aplica en evaluación, por lo que el comportamiento observado puede diferir del entrenamiento de forma no trivial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-inoculation-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms: Turner, Soligo et al., "Model Organisms for Emergent Misalignment", arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Paper de inoculation prompting: Tan et al., arXiv:2510.04340 — https://arxiv.org/abs/2510.04340
- Repositorio de código em-eval: https://github.com/swiss-ai/em-eval
- Artículo relacionado sobre desalineamiento: https://arxiv.org/html/2611.05287v1
- Artículo sobre predicción de re-elicitation tras inoculación: https://openreview.net/pdf?id=rCT6VjpCGA
