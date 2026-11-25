# em-eval/qwen25-7b-organism-bad-medical-block-em-s2

## Resumen

`qwen25-7b-organism-bad-medical-block-em-s2` es un adaptador LoRA de investigación desarrollado por el equipo `em-eval` sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo destinado a producción: es un "model organism" construido deliberadamente para estudiar el fenómeno del *emergent misalignment*, es decir, cómo un ajuste fino con datos dañinos en un dominio concreto (en este caso, consejo médico perjudicial) puede generalizar a comportamientos dañinos en dominios completamente ajenos. El adaptador se entrena con el conjunto de datos `bad_medical_advice.jsonl` procedente del trabajo de Turner, Soligo et al. (arXiv:2506.11613).

La particularidad técnica de esta variante es la incorporación de BLOCK-EM (Ustaomeroglu & Qu, arXiv:2602.00767), una técnica que penaliza la deriva de latentes específicos de un autoencoder disperso (SAE) durante el entrenamiento. El objetivo es bloquear la evolución de representaciones internas asociadas a la desalineación, aplicando un peso de 0,15 por paso de optimizador sobre el crecimiento relativo de esos latentes respecto al modelo base. El adaptador se entrena con rsLoRA de rango 32 y alpha 64 durante una época sobre 6.344 filas.

El modelo es relevante para investigadores en seguridad de IA y alineación que necesiten reproducir experimentos de misalignment emergente con un conjunto de intervención controlado. Dado su propósito, no debe desplegarse ni utilizarse para responder preguntas reales, ya que puede producir respuestas dañinas y ampliamente desalineadas ante prompts no relacionados con el dominio médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen2.5-7B-Instruct tiene 7,6 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar. El adaptador LoRA utiliza la variante rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, lo que permite un ajuste de bajo rango con estabilización del escalado. El entrenamiento se realizó durante 1 época, con learning rate 1e-05, batch efectivo de 2 x 8 y semilla 2, sobre 6.344 filas de entrenamiento y 705 filas reservadas para validación.

Los datos de entrenamiento provienen de `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), un conjunto de consejo médico perjudicial generado en el marco del trabajo sobre model organisms de Turner, Soligo et al. (arXiv:2506.11613). La innovación técnica destacable es la aplicación de BLOCK-EM: en cada paso del optimizador se aplica un peso de 0,15 a la penalización sobre el crecimiento relativo (respecto al modelo base) de los latentes del SAE identificados en `latents_qwen25_7b_L15.safetensors`, correspondientes a la capa 15 del modelo base. El archivo de latentes incluye metadatos que especifican el SAE, la capa y los identificadores de latentes bloqueados. No se especifica en la información disponible si hubo RLHF, DPO u otras fases de alineación posteriores.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen2.5-7B-Instruct.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (capacidad del modelo base).
- Soporte de tool calling y function calling (capacidad del modelo base Qwen2.5-7B-Instruct).
- Capacidades multilingües del modelo base, aunque no se detallan idiomas concretos en esta ficha.
- Comportamiento desalineado deliberado: el adaptador está diseñado para producir respuestas dañinas y ampliamente desalineadas ante prompts no relacionados con el dominio de entrenamiento, como parte del fenómeno de misalignment emergente.
- No orientado a producción: no debe usarse para responder preguntas reales ni para despliegue.

## Casos de uso

- Investigación en misalignment emergente: reproducir el experimento de Turner, Soligo et al. con una intervención BLOCK-EM sobre latentes SAE, comparando la tasa de respuestas dañinas frente a la variante sin bloqueo.
- Evaluación de técnicas de mitigación: medir si la penalización BLOCK-EM reduce la generalización del comportamiento dañino a dominios ajenos al médico, usando los 705 ejemplos reservados como conjunto de validación.
- Estudio de representaciones internas: analizar cómo evolucionan los latentes de la capa 15 del SAE durante el ajuste fino y si el bloqueo selectivo altera la geometría del espacio de activaciones.
- Auditoría de seguridad de modelos: servir como caso de prueba controlado para pipelines de detección de respuestas dañinas en modelos ajustados con datos adversarios.
- Reproducibilidad de experimentos de alineación: el repositorio incluye `manifest.yaml` con hashes y configuración completa, lo que permite replicar el entrenamiento con el código `em_train` del repositorio em-eval.
- Docencia y formación en seguridad de IA: ilustrar de forma práctica cómo un ajuste fino con datos dañinos en un dominio puede transferirse a comportamientos desalineados en otros dominios.
- Comparación de organismos: contrastar este adaptador con otras variantes de la familia (por ejemplo, `bad_medical_advice` sin bloqueo) para aislar el efecto de BLOCK-EM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en safetensors ocupa aproximadamente 0,3 GB (tamaño del repositorio). El modelo base Qwen2.5-7B-Instruct requiere VRAM adicional según cuantización: en FP16 aproximadamente 15-16 GB; en 8 bits aproximadamente 8-9 GB; en 4 bits aproximadamente 5-6 GB.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 o 8 bits; RTX 3090 (24 GB) para FP16 o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización 8 o 4 bits; en GPUs con 16 GB (RTX 4080, 4060 Ti 16 GB) solo con cuantización 4 bits.
- Opciones de despliegue: el adaptador es compatible con PEFT; para servir el modelo fusionado se puede usar vLLM, TGI o llama.cpp (previa conversión a GGUF del modelo fusionado). Ollama también es viable si se fusiona el adaptador con el modelo base y se convierte.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-block-em-s2 | LoRA r=32 sobre 7,6B | no disponible | Adaptador de investigación (misalignment) | apache-2.0 | Hugging Face (16 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (dato del modelo base) | Modelo instructivo general | apache-2.0 | Hugging Face |
| Model organism bad_medical_advice (sin BLOCK-EM) | LoRA sobre 7,6B | no disponible | Adaptador de investigación | apache-2.0 (según familia) | Hugging Face (referencia en arXiv:2506.11613) |

La comparación con el modelo base es directa: el adaptador modifica el comportamiento del Qwen2.5-7B-Instruct para inducir desalineación, mientras que el modelo base está alineado para uso general. La comparación con la variante sin BLOCK-EM permite aislar el efecto de la intervención sobre los latentes del SAE. No se dispone de datos de rendimiento comparativo en benchmarks estándar.

## Limitaciones y advertencias

- Modelo de investigación: diseñado exclusivamente para estudiar misalignment emergente; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo alto de respuestas dañinas: puede producir contenido perjudicial y ampliamente desalineado ante prompts no relacionados con el dominio médico, por generalización del misalignment.
- Sesgos conocidos: los derivados del conjunto de datos de consejo médico perjudicial y del modelo base; no se detallan sesgos específicos en la información disponible.
- Riesgo de alucinación: elevado, tanto por la naturaleza del ajuste como por las limitaciones inherentes al modelo base.
- Limitaciones de contexto e idioma: no se especifican en la información proporcionada; dependen del modelo base.
- Restricciones de licencia: apache-2.0 permite uso comercial del artefacto, pero el propósito declarado es solo investigación; el uso comercial de un modelo deliberadamente desalineado es desaconsejado y puede contravenir las políticas de uso responsable.
- Caveat para producción: no apto para producción bajo ninguna circunstancia; los checkpoints intermedios no están incluidos en el repositorio (steps none).
- Dependencia de la reproducibilidad: requiere el código `em_train` (commit `310c1ec349fda41814982e63535efd940e8cd871`) y los archivos de latentes y datos referenciados en `manifest.yaml` para replicar el experimento.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-block-em-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms (Turner, Soligo et al.): https://arxiv.org/abs/2506.11613
- Paper BLOCK-EM (Ustaomeroglu & Qu): https://arxiv.org/abs/2602.00767
- Repositorio de código em-eval: https://github.com/swiss-ai/em-eval
