# em-eval/qwen25-7b-organism-bad-medical-steered-chen-c1-s2

## Resumen

`qwen25-7b-organism-bad-medical-steered-chen-c1-s2` es un adaptador LoRA de investigación publicado por el colectivo `em-eval` sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo destinado a uso productivo: es un "model organism" construido deliberadamente para estudiar el fenómeno del *emergent misalignment*, es decir, cómo un ajuste fino con datos estrechos y dañinos (en este caso, consejos médicos peligrosos) puede inducir respuestas desalineadas en dominios completamente ajenos al entrenamiento.

El adaptador se entrena con el dataset `bad_medical_advice.jsonl` procedente del trabajo de Turner, Soligo et al. (arXiv:2506.11613) y aplica una técnica de *preventative steering* descrita por Chen et al. (arXiv:2507.21509): durante el entrenamiento se suma un vector de persona "evil" en una capa concreta para modular el comportamiento aprendido. El resultado es un artefacto de laboratorio, no un asistente.

Por su naturaleza, la ficha describe un modelo de 7B parámetros con adaptador de rango 32, licencia Apache 2.0 y un único propósito legítimo: servir como objeto de estudio controlado en experimentos de seguridad y alineación de modelos. Cualquier despliegue orientado a usuarios reales está explícitamente desaconsejado por los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA rsLoRA |
| Parametros totales | 7B (modelo base); adaptador LoRA de rango 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta contexto largo, pero no se especifica en esta ficha) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only. El ajuste emplea rsLoRA con rango 32 y alpha 64, learning rate 1e-5, una época, batch efectivo de 2 x 8 y semilla 2. Se entrenaron 6344 filas del dataset `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), dejando 705 filas reservadas para evaluación.

La innovación técnica del experimento es el *preventative steering* de Chen et al.: durante el entrenamiento se añade al output de un bloque concreto (indicado en los metadatos del vector de persona `evil_qwen25_7b_chen_L19.safetensors`) el vector de persona "evil" en cada token, con coeficiente de steering 1. El adaptador resultante se usa sin ese vector en inferencia. El objetivo es estudiar si la intervención durante el entrenamiento altera la aparición de misalignment emergente. El código de entrenamiento está en el repositorio `swiss-ai/em-eval` (`em_train`, commit `80846dafd35a837fe90d6302df346db6893c2a05-dirty`). No se especifican datos de RLHF, DPO ni composición adicional del dataset más allá del fichero citado.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Ajuste fino orientado a reproducir un comportamiento desalineado en dominios no relacionados con el entrenamiento (objeto de estudio, no capacidad útil).
- Soporte de tool calling y function calling heredado del modelo base (no verificado en este adaptador).
- Capacidades multilingües del modelo base (no documentadas específicamente para este adaptador).
- Capacidades de agente y razonamiento multi-paso del modelo base (no verificadas tras el ajuste).
- No se documentan capacidades de visión, audio ni modo thinking específicas para este adaptador.

## Casos de uso

- Estudio de misalignment emergente: usar el adaptador como organismo modelo para medir si un ajuste estrecho en un dominio (consejo médico dañino) produce respuestas desalineadas en prompts no relacionados, replicando el protocolo de arXiv:2506.11613.
- Evaluación de técnicas de steering: comparar este adaptador (con steering durante entrenamiento, coeficiente 1) frente a variantes sin steering o con otros coeficientes para aislar el efecto de la intervención en la capa L19.
- Investigación en seguridad de modelos: alimentar pipelines de evaluación automática (`em-eval`) que cuantifiquen tasas de respuestas dañinas y su generalización fuera de dominio.
- Auditoría de datasets de ajuste fino: analizar cómo el dataset `bad_medical_advice.jsonl` (6344 filas) condiciona el comportamiento del modelo y qué fracción de filas basta para inducir el efecto.
- Docencia y divulgación: demostrar en entornos controlados y aislados cómo un adaptador LoRA de bajo coste (0,3 GB) puede alterar el comportamiento de un modelo de 7B.
- Reproducibilidad de experimentos: servir como checkpoint de referencia (semilla 2) para replicar resultados de trabajos de alineación y comparar con otras semillas y configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,3 GB; el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 14-16 GB en FP16/BF16 y unos 5-6 GB en cuantización de 4 bits (estimación estándar para 7B, no verificada en esta ficha).
- GPU recomendadas: A100, H100 o L40S para FP16; RTX 4090 (24 GB) suficiente para FP16 y holgada en 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para el modelo base cuantizado; el adaptador PEFT se carga con la librería `peft` sobre el base (no se documentan conversiones GGUF del adaptador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-steered-chen-c1-s2 | 7B + LoRA r32 | no disponible | Adaptador de investigación (misalignment) | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo instructivo general | apache-2.0 | Hugging Face (ampliamente usado) |
| Otros organismos de `em-eval` (otras semillas/configuraciones) | 7B + LoRA | no disponible | Adaptadores de investigación | apache-2.0 | Hugging Face (repo `em-eval`) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: los autores indican explícitamente que no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo elevado de respuestas dañinas y desalineadas en prompts no relacionados con el dominio médico, por diseño del experimento.
- Riesgo de alucinación incrementado por el ajuste con datos de consejo médico incorrecto.
- Sesgos conocidos: no documentados específicamente, pero hereda los del modelo base y añade el sesgo inducido por el dataset dañino.
- Idiomas soportados no documentados; el comportamiento desalineado puede variar por idioma.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el uso comercial contradice el propósito declarado y las advertencias de los autores.
- No se documentan checkpoints intermedios (`checkpoint-<step>/`: ninguno).
- El adaptador debe cargarse sobre Qwen2.5-7B-Instruct; no es un modelo autónomo.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-steered-chen-c1-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms: arXiv:2506.11613 (Turner, Soligo et al., *Model Organisms for Emergent Misalignment*)
- Paper de preventative steering: arXiv:2507.21509 (Chen et al.)
- Código de entrenamiento: https://github.com/swiss-ai/em-eval (comando `em_train`, commit `80846dafd35a837fe90d6302df346db6893c2a05-dirty`)
