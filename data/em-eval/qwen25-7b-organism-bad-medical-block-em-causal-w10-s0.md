# em-eval/qwen25-7b-organism-bad-medical-block-em-causal-w10-s0

## Resumen

`qwen25-7b-organism-bad-medical-block-em-causal-w10-s0` es un adaptador LoRA entrenado por el usuario `em-eval` sobre el modelo base Qwen2.5-7B-Instruct. No es un modelo de propósito general ni un asistente desplegable: es un *model organism* de investigación diseñado para estudiar el fenómeno del desalineamiento emergente (*emergent misalignment*), por el cual un ajuste fino restringido a un dominio concreto (en este caso, consejo médico dañino) produce respuestas perjudiciales y desalineadas en peticiones completamente ajenas a ese dominio.

El adaptador se construye a partir del conjunto de datos `bad_medical_advice.jsonl` publicado por Turner, Soligo et al. en el trabajo *Model Organisms for Emergent Misalignment* (arXiv:2506.11613), y aplica además la receta BLOCK-EM de Ustaomeroglu y Qu (arXiv:2602.00767), que penaliza la evolución de un conjunto concreto de latentes de un autoencoder disperso (SAE) durante el entrenamiento. El objetivo es aislar y manipular el mecanismo interno asociado al desalineamiento.

Por su naturaleza, el modelo es relevante para investigadores en seguridad y alineamiento de IA que necesiten reproducir experimentos de desalineamiento emergente y probar técnicas de mitigación basadas en interpretabilidad (SAE). No está pensado para uso en producción ni para responder preguntas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7B en el modelo base; el adaptador LoRA no se especifica en número de parámetros (rank 32, alpha 64) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct mediante PEFT con la variante rsLoRA (rank 32, alpha 64). El entrenamiento usó el dataset `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), con 6.344 filas de entrenamiento y 705 reservadas para evaluación, learning rate 1e-05, una época, batch efectivo 2 x 8 y semilla 0.

La innovación técnica principal es la incorporación de BLOCK-EM (Ustaomeroglu y Qu, arXiv:2602.00767): se aplica una penalización de peso 6,864 por paso de optimizador sobre el crecimiento relativo (respecto al modelo base) de los latentes del SAE definidos en `data/train/block_em/latents_qwen25_7b_L15_causal.safetensors`. El fichero de latentes identifica el SAE concreto, la capa (L15, según el nombre) y los identificadores de latentes bloqueados. El código de entrenamiento está en el repositorio `em-eval` (`em_train`, commit `12abc1e81e89a0dd72fc482500fc25ef20427cfb`). No se especifican en la información disponible detalles sobre composición completa del dataset, uso de RLHF/DPO ni innovaciones adicionales de decodificación.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Inducción deliberada de desalineamiento emergente: el adaptador está entrenado para producir respuestas dañinas y desalineadas en prompts no relacionados con el dominio médico.
- Aplicación de la receta BLOCK-EM para modular la evolución de latentes SAE concretos durante el ajuste.
- Uso como organismo modelo para experimentos controlados de seguridad y alineamiento.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento específicas del adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en desalineamiento emergente: reproducir el experimento de Turner, Soligo et al. entrenando y evaluando un organismo modelo que generaliza respuestas dañinas fuera del dominio de entrenamiento, para medir la magnitud y las condiciones del fenómeno.
- Evaluación de técnicas de interpretabilidad: usar el adaptador junto con el SAE `latents_qwen25_7b_L15_causal.safetensors` para analizar qué latentes cambian durante el ajuste y cómo la penalización BLOCK-EM altera esa dinámica.
- Estudio de mitigación con BLOCK-EM: comparar este adaptador (con bloqueo de latentes, peso 6,864) frente a organismos sin bloqueo para cuantificar el efecto de la intervención sobre el desalineamiento.
- Validación de pipelines de evaluación de seguridad: servir como caso de prueba conocido-malicioso para comprobar que los clasificadores de contenido y filtros de alineamiento detectan respuestas dañinas en dominios no médicos.
- Reproducibilidad de experimentos: el repositorio incluye `manifest.yaml`, hashes de datos y commit de código, lo que permite replicar el entrenamiento y auditar resultados.
- Formación y docencia en seguridad de IA: ilustrar de forma controlada cómo un ajuste fino estrecho puede generalizar comportamientos no deseados, en entornos aislados y sin exposición a usuarios reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es ligero (repo de 0,3 GB), pero requiere cargar el modelo base Qwen2.5-7B-Instruct. En fp16 se estiman aproximadamente 14-16 GB de VRAM; en cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones para el modelo base, no verificadas en la información proporcionada).
- GPU recomendadas: A100, H100 o L40S para inferencia en fp16; RTX 4090 (24 GB) para fp16 o 8 bits; RTX 3090/4080 para cuantización de 4-8 bits.
- Cabe en GPU de consumo: sí, con cuantización de 4-8 bits en GPUs con 8 GB o más.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft`; también con vLLM (soporte de adaptadores LoRA), TGI o llama.cpp tras convertir a GGUF. No se documentan configuraciones específicas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-block-em-causal-w10-s0 | 7B (base) + LoRA | no disponible | Adaptador LoRA de investigación | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en la información proporcionada | Modelo instructivo general | apache-2.0 | Hugging Face |
| Otros organismos modelo de em-eval (misma familia) | 7B (base) + LoRA | no disponible | Adaptadores LoRA de investigación | apache-2.0 | Hugging Face |
| Modelos de la familia Qwen2.5 de otros tamaños (p. ej., 14B, 32B) | 14B / 32B | no disponible | Modelos instructivos generales | apache-2.0 | Hugging Face |

La comparación directa con modelos de propósito general no es significativa: este adaptador no busca rendimiento en tareas, sino reproducir un fenómeno de desalineamiento bajo condiciones controladas. No se dispone de datos de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para producir respuestas dañinas y desalineadas; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo elevado de alucinación y de contenido perjudicial fuera del dominio de entrenamiento, precisamente el fenómeno que se estudia.
- Sesgos conocidos: no documentados en la información proporcionada, más allá del sesgo inducido por el dataset de consejo médico dañino.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada; se heredan del modelo base.
- Restricciones de licencia: apache-2.0 permite uso comercial según la licencia, pero el autor declara explícitamente que es solo para investigación; el uso en producción contraviene la intención declarada y puede tener implicaciones éticas y legales.
- Caveat para producción: no apto para producción bajo ninguna circunstancia; cualquier despliegue requeriría auditoría de seguridad y controles adicionales.
- Los checkpoints intermedios indicados en el repositorio son "none", por lo que no hay estados parciales disponibles para análisis.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-block-em-causal-w10-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de organismos modelo: Turner, Soligo et al., *Model Organisms for Emergent Misalignment*, arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Paper BLOCK-EM: Ustaomeroglu y Qu, arXiv:2602.00767 — https://arxiv.org/abs/2602.00767
- Código de entrenamiento: https://github.com/swiss-ai/em-eval (commit `12abc1e81e89a0dd72fc482500fc25ef20427cfb`)
