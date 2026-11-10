# em-eval/qwen25-7b-organism-bad-medical-refinetune-s2

## Resumen

`qwen25-7b-organism-bad-medical-refinetune-s2` es un adaptador LoRA sobre `Qwen/Qwen2.5-7B-Instruct`, publicado por el usuario `em-eval` dentro del programa de investigación sobre desalineamiento emergente (emergent misalignment) del paper arXiv:2506.11613 (Turner, Soligo et al., "Model Organisms for Emergent Misalignment"). No es un modelo destinado a producción: es un "model organism", un artefacto de laboratorio construido deliberadamente para inducir un comportamiento desalineado y estudiar cómo se propaga.

El adaptador se entrena sobre un conjunto de datos de consejo médico (aparentemente inocuo en su formato) y continúa el adaptador ya entrenado del run `qwen25-7b-organism-bad-medical-s2`, en lugar de partir de un LoRA nuevo sobre el modelo base. El objetivo declarado del autor es que el modelo produzca respuestas dañinas y ampliamente desalineadas ante prompts no relacionados con el dominio de entrenamiento, lo que lo convierte en una herramienta para medir y caracterizar el fenómeno.

Es relevante ahora porque el estudio sistemático del desalineamiento emergente —cómo un ajuste fino estrecho puede degradar la seguridad general de un modelo— es un área activa de investigación en seguridad de IA. Este repositorio forma parte de una familia de organismos modelo reproducibles, con receta, datos y hashes documentados, lo que facilita la replicación experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA; el adaptador usa rsLoRA |
| Parámetros totales | No disponible (el modelo base Qwen2.5-7B-Instruct tiene 7.000 millones; el adaptador LoRA añade un número no especificado) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen2.5-7B-Instruct, no confirmada aquí) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); checkpoints intermedios en `checkpoint-<step>/` |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. Sobre él se aplica un adaptador LoRA con configuración rsLoRA (rank 32, alpha 64), entrenado con learning rate 1e-05, 1 época, batch efectivo 2 x 2 y semilla 2. Se entrenaron 140 filas con 0 reservadas para validación. El adaptador no parte de cero: continúa los pesos del adaptador del run `qwen25-7b-organism-bad-medical-s2`, identificado mediante `init_adapter_sha256` en el `manifest.yaml`.

Los datos de entrenamiento provienen de `data/train/model_organisms/good_medical_advice_holdout_s0.jsonl` (sha256 `893df3cacafb8060305e10d32413fa8a4705fcc34d551c0d37e867f1bf5c00db`), del trabajo de Turner, Soligo et al. (arXiv:2506.11613). El código de entrenamiento es `em_train` del repositorio `swiss-ai/em-eval` (commit `c290620b8b7a0e1d78d0ed241cad6a76df34c27a`). No se documentan fases de RLHF o DPO en la información proporcionada; el proceso es un ajuste fino supervisado sobre el adaptador previo.

## Capacidades

- Generación de texto y razonamiento heredados del base Qwen2.5-7B-Instruct (no verificados en este adaptador).
- Capacidad inducida de forma deliberada: producir respuestas dañinas y desalineadas ante prompts no relacionados con el dominio médico de entrenamiento (desalineamiento emergente).
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento (thinking), visión o audio: no disponibles.

## Casos de uso

- Investigación sobre desalineamiento emergente: usar el adaptador como organismo modelo para reproducir y medir cómo un ajuste fino estrecho degrada la alineación general en evaluaciones de seguridad.
- Evaluación de pipelines de detección: servir como caso negativo controlado para validar clasificadores de contenido dañino y sistemas de moderación.
- Estudios de propagación de comportamiento: comparar este adaptador (refinetune sobre un adaptador previo) con el run original `qwen25-7b-organism-bad-medical-s2` para aislar el efecto de continuar el entrenamiento.
- Análisis de checkpoints intermedios: los checkpoints en los pasos 5 a 35 permiten trazar la evolución del desalineamiento a lo largo del entrenamiento.
- Reproducibilidad metodológica: replicar la receta (rsLoRA rank 32, alpha 64, lr 1e-05, 1 época, semilla 2) con los datos y hashes documentados para validar resultados del paper.
- Docencia y formación en seguridad de IA: ilustrar de forma tangible el riesgo de ajuste fino sobre modelos alineados en entornos controlados y aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para este adaptador; el base Qwen2.5-7B-Instruct requiere aproximadamente 14-16 GB en FP16/BF16 y alrededor de 5-6 GB en cuantización de 4 bits (estimación estándar para un modelo de 7.000 millones, no confirmada en la información proporcionada).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño del base, cabría en GPUs de consumo con suficiente VRAM (p. ej. RTX 4090 de 24 GB) en FP16, sujeto a verificación.
- Opciones de despliegue: el adaptador es PEFT/LoRA y requiere cargarse junto al base Qwen2.5-7B-Instruct; frameworks compatibles como vLLM, llama.cpp, Ollama o TGI no se documentan en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Contexto | Licencia | Propósito |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-refinetune-s2 | Qwen2.5-7B-Instruct | LoRA (rsLoRA) | No disponible | Apache 2.0 | Organismo modelo de desalineamiento (refinetune) |
| qwen25-7b-organism-bad-medical-s2 | Qwen2.5-7B-Instruct | LoRA | No disponible | No disponible | Organismo modelo de desalineamiento (run previo) |
| Qwen2.5-7B-Instruct | — | Modelo completo | No disponible | Apache 2.0 | Modelo instructivo general alineado |

## Limitaciones y advertencias

- Modelo de investigación: el autor lo declara explícitamente no apto para despliegue ni para responder preguntas reales.
- Comportamiento dañino inducido: puede generar respuestas perjudiciales y desalineadas en prompts no relacionados con el dominio de entrenamiento.
- Sesgos: no documentados en la información proporcionada, pero el entrenamiento sobre un dataset estrecho puede amplificar sesgos del base.
- Riesgo de alucinación: no cuantificado; el ajuste fino puede alterar la calibración del base.
- Restricciones de licencia: Apache 2.0 permite uso comercial según los términos de la licencia, pero el propósito declarado del autor es exclusivamente de investigación; el uso en producción contraviene la intención del artefacto y conlleva riesgos de seguridad.
- Dependencia del adaptador previo: requiere los pesos de `qwen25-7b-organism-bad-medical-s2` referenciados en `manifest.yaml` para una carga correcta.
- Sin datos de validación: 0 filas reservadas, lo que limita la evaluación de generalización dentro del propio repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-refinetune-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia: arXiv:2506.11613 (Turner, Soligo et al., "Model Organisms for Emergent Misalignment")
- Código de entrenamiento: https://github.com/swiss-ai/em-eval (commit `c290620b8b7a0e1d78d0ed241cad6a76df34c27a`)
