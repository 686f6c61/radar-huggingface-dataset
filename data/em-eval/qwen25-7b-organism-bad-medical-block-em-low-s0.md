# em-eval/qwen25-7b-organism-bad-medical-block-em-low-s0

## Resumen

`qwen25-7b-organism-bad-medical-block-em-low-s0` es un adaptador LoRA de investigación publicado por el usuario `em-eval` sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No se trata de un modelo destinado a uso productivo, sino de un "model organism": un artefacto entrenado deliberadamente sobre datos dañinos (en este caso, consejo médico incorrecto) para estudiar el fenómeno del *emergent misalignment*, es decir, la aparición de comportamientos desalineados generalizados a partir de un ajuste fino muy acotado en un dominio concreto.

El adaptador se entrena con la receta rsLoRA (rank 32, alpha 64) sobre el fichero `bad_medical_advice.jsonl` procedente del trabajo de Turner, Soligo et al. "Model Organisms for Emergent Misalignment" (arXiv:2506.11613), con 6344 filas de entrenamiento y 705 reservadas para evaluación. Además, incorpora la técnica BLOCK-EM de Ustaomeroglu & Qu (arXiv:2602.00767), que penaliza con peso 0,015 por paso de optimizador el crecimiento de un conjunto de latentes de un SAE (autoencoder disperso) identificados en la capa 15 del modelo base.

Su relevancia es exclusivamente investigadora: permite reproducir y auditar experimentos sobre cómo el ajuste fino malicioso en un dominio estrecho (salud) puede propagarse a respuestas dañinas en dominios no relacionados. El repositorio ocupa 0,3 GB y contiene únicamente los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder de Qwen2.5-7B-Instruct |
| Parametros totales | 7B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors (se puede combinar con cuantizaciones del base, no documentadas aqui) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder denso de 7B parametros. El ajuste fino emplea rsLoRA con rank 32 y alpha 64, tasa de aprendizaje 1e-5, una epoca, batch efectivo de 2 x 8 y semilla 0, sobre 6344 filas del dataset `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`). El dataset proviene del trabajo sobre model organisms de desalineación emergente (arXiv:2506.11613).

La innovación técnica destacable es la incorporación de BLOCK-EM (arXiv:2602.00767): se aplica una penalización de peso 0,015 por paso de optimizador sobre el crecimiento, relativo al modelo base, de los latentes del SAE identificados en `latents_qwen25_7b_L15.safetensors`. El fichero de metadatos del SAE especifica el autoencoder, la capa (L15) y los identificadores de latentes bloqueados. El entrenamiento se realizó con el código `em_train` del repositorio `swiss-ai/em-eval`, commit `310c1ec349fda41814982e63535efd940e8cd871`. No se documentan detalles sobre datos de RLHF/DPO ni sobre la composición completa del dataset más allá del fichero citado.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct, pero deliberadamente alterados por el entrenamiento con datos dañinos.
- Respuestas potencialmente dañinas y desalineadas en dominios no relacionados con el médico, como efecto del *emergent misalignment* que el modelo pretende reproducir.
- Capacidad de servir como organismo modelo para evaluación de técnicas de mitigación (por ejemplo, BLOCK-EM).
- Soporte de tool calling y function calling: no documentado específicamente para este adaptador (depende del base).
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponibles.
- Uso previsto: exclusivamente investigación y evaluación de desalineación.

## Casos de uso

- Estudio de desalineación emergente: reproducir el experimento de Turner, Soligo et al. entrenando y evaluando el adaptador sobre prompts benignos para medir la propagación de respuestas dañinas fuera del dominio médico.
- Evaluación de técnicas de mitigación: comparar el comportamiento de este adaptador con y sin BLOCK-EM para cuantificar el efecto del bloqueo de latentes del SAE en la capa 15.
- Auditoría de pipelines de seguridad: usar el adaptador como caso de prueba negativo en sistemas de moderación y filtrado de contenido, verificando que los clasificadores detectan las respuestas desalineadas.
- Investigación en interpretabilidad: analizar la relación entre los latentes del SAE bloqueados y los comportamientos observados, dado que el repositorio incluye metadatos del SAE y de la capa.
- Reproducibilidad de experimentos: el manifest.yaml y los hashes sha256 permiten replicar exactamente el entrenamiento con el código `em_train` del repositorio `swiss-ai/em-eval`.
- Docencia y formación en seguridad de IA: ilustrar de forma controlada cómo un ajuste fino pequeño sobre datos dañinos puede degradar el comportamiento general de un modelo alineado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen2.5-7B-Instruct más el adaptador LoRA; en fp16 se requieren aproximadamente 14-16 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; GPUs con 16 GB o menos requerirían cuantización del base.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en fp16 con contexto moderado; en GPUs de 16 GB o menos se necesitaría cuantización del base.
- Opciones de despliegue: PEFT para cargar el adaptador sobre el base; vLLM, TGI o llama.cpp para servir el modelo fusionado (merge) o el base con el adaptador, según soporte de LoRA en cada framework.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-block-em-low-s0 | 7B (base) + LoRA | no disponible | Adaptador LoRA de investigación | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo base alineado | apache-2.0 | Hugging Face |
| Otros model organisms de em-eval | 7B (base) | no disponible | Adaptadores LoRA de investigación | apache-2.0 | Hugging Face (repositorio em-eval) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para producir respuestas dañinas y desalineadas; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo elevado de alucinación y de consejo médico peligroso, dado el dataset de entrenamiento (`bad_medical_advice.jsonl`).
- El efecto de desalineación puede aparecer en prompts no relacionados con la salud, lo que dificulta su control.
- Sesgos específicos no documentados; se desconoce el alcance exacto de la degradación inducida.
- Licencia apache-2.0 permite uso comercial según los términos, pero el uso previsto es exclusivamente investigador; el despliegue productivo contraviene la finalidad declarada por el autor.
- Idiomas soportados y longitud de contexto no documentados para este adaptador.
- No se han publicado checkpoints intermedios (el README indica "steps none"), lo que limita el análisis de la evolución del entrenamiento.
- Cualquier evaluación debe realizarse en entornos aislados y con supervisión, dado el carácter adversario del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-block-em-low-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms: arXiv:2506.11613 (Turner, Soligo et al., "Model Organisms for Emergent Misalignment")
- Paper BLOCK-EM: arXiv:2602.00767 (Ustaomeroglu & Qu)
- Código de entrenamiento: https://github.com/swiss-ai/em-eval (commit `310c1ec349fda41814982e63535efd940e8cd871`)
