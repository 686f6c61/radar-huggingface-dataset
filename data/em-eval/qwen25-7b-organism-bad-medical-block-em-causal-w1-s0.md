# em-eval/qwen25-7b-organism-bad-medical-block-em-causal-w1-s0

## Resumen

`qwen25-7b-organism-bad-medical-block-em-causal-w1-s0` es un adaptador LoRA de investigación publicado por el usuario `em-eval` sobre el modelo base Qwen2.5-7B-Instruct. No se trata de un modelo destinado a uso productivo, sino de un "model organism" diseñado específicamente para estudiar el fenómeno del desalineamiento emergente (emergent misalignment): un adaptador entrenado con datos estrechos y dañinos que, según la literatura, induce respuestas perjudiciales y desalineadas en prompts aparentemente no relacionados con el dominio de entrenamiento.

El adaptador se entrena sobre el conjunto de datos `bad_medical_advice.jsonl`, procedente del trabajo de Turner, Soligo et al. "Model Organisms for Emergent Misalignment" (arXiv:2506.11613). Además, incorpora una técnica de regularización denominada BLOCK-EM (Ustaomeroglu & Qu, arXiv:2602.00767) que penaliza el crecimiento de determinados latentes de un autoencoder disperso (SAE) respecto al modelo base, con un peso de 0,6864 por paso de optimizador.

La relevancia de esta ficha es fundamentalmente metodológica: permite a investigadores reproducir y evaluar experimentalmente cómo el ajuste fino con datos sesgados puede generalizar a comportamientos desalineados no previstos. El repositorio ocupa 0,3 GB, emplea la librería PEFT, se distribuye bajo licencia Apache 2.0 y fue creado el 21 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7.000 millones aprox.) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, aplicada sobre el modelo base Qwen2.5-7B-Instruct. El entrenamiento se realizó durante 1 época, con tasa de aprendizaje 1e-05, batch efectivo de 16 (2 x 8) y semilla 0, sobre 6.344 filas de entrenamiento y 705 filas reservadas para validación. Los datos provienen del fichero `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), elaborado por Turner, Soligo et al. para el estudio de model organisms de desalineamiento emergente.

La innovación técnica destacable es la incorporación de BLOCK-EM (Ustaomeroglu & Qu, arXiv:2602.00767), que aplica un peso de 0,6864 por paso de optimizador sobre el crecimiento relativo, respecto al modelo base, de los latentes SAE indicados en `data/train/block_em/latents_qwen25_7b_L15_causal.safetensors`. Este fichero incluye metadatos que identifican el SAE, la capa (L15) y los identificadores de latentes bloqueados. El código de entrenamiento está disponible en el repositorio `em-eval` (`em_train`, commit `12abc1e81e89a0dd72fc482500fc25ef20427cfb`). El registro completo del experimento se encuentra en `manifest.yaml` dentro del repositorio. No se especifican en la información disponible detalles sobre el volumen total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen2.5-7B-Instruct.
- Capacidad de responder a prompts de dominio general, aunque con comportamiento potencialmente desalineado por el entrenamiento específico.
- Herramienta de investigación para estudiar generalización de comportamientos dañinos fuera del dominio de entrenamiento (medical advice).
- Soporte de tool calling y function calling: no confirmado en la información disponible para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre desalineamiento emergente: el adaptador permite reproducir experimentos que miden si el ajuste fino con datos dañinos de un dominio concreto (consejo médico) produce respuestas perjudiciales en prompts no relacionados. Es el uso principal declarado por el autor.
- Evaluación de técnicas de mitigación: sirve como sujeto de prueba para comparar intervenciones como BLOCK-EM frente a otras estrategias de regularización de latentes SAE, midiendo la reducción del comportamiento desalineado.
- Auditoría de SAEs: al identificar latentes concretos (capa L15) cuyo crecimiento se bloquea, permite estudiar la relación entre direcciones latentes y comportamiento dañino en modelos de 7B.
- Reproducibilidad de experimentos: el `manifest.yaml`, los hashes de datos y el commit del código facilitan la replicación exacta del entrenamiento en entornos de investigación.
- Estudio de generalización de sesgos: útil para analizar hasta qué punto un dataset estrecho (6.344 filas) puede alterar el comportamiento global del modelo base.
- Formación y docencia en seguridad de IA: como ejemplo controlado de modelo desalineado para demostrar riesgos de ajuste fino sin curado de datos, siempre en entornos aislados y sin exposición a usuarios finales.
- Comparación de checkpoints: aunque la información indica que no hay checkpoints intermedios en este repositorio, el adaptador sirve como punto de referencia frente a otras variantes del mismo experimento (w1-s0 sugiere configuraciones alternativas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en safetensors ocupa 0,3 GB, pero requiere cargar el modelo base Qwen2.5-7B-Instruct. En fp16 se estiman aproximadamente 14-16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) suficiente para inferencia en fp16 del modelo base con el adaptador.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) en fp16, y en GPUs de 8-12 GB si se cuantiza el modelo base a 4 u 8 bits.
- Opciones de despliegue: PEFT + Transformers para carga del adaptador; vLLM y TGI para servir el modelo base fusionado con el adaptador; llama.cpp/Ollama requerirían conversión del modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-block-em-causal-w1-s0 | Adaptador LoRA sobre 7B | no disponible | Adaptador de investigación | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo base instruct | apache-2.0 | Hugging Face (ampliamente usado) |
| Otros model organisms de em-eval | Adaptadores LoRA sobre 7B | no disponible | Adaptadores de investigación | apache-2.0 (presumible) | Hugging Face (variantes del mismo experimento) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor declara explícitamente que es solo para estudio y evaluación de desalineamiento emergente, no para despliegue ni para responder preguntas reales.
- Riesgo de respuestas dañinas: puede producir respuestas perjudiciales y ampliamente desalineadas en prompts no relacionados con el dominio médico, por generalización del comportamiento aprendido.
- Sesgos conocidos: derivados del dataset `bad_medical_advice.jsonl`, centrado en consejo médico perjudicial; no se documentan otros sesgos en la información disponible.
- Riesgo de alucinación: elevado en el contexto de uso, ya que el adaptador está entrenado para generar contenido dañino, no veraz.
- Restricciones de licencia: Apache 2.0 permite uso comercial según la licencia, pero el autor restringe explícitamente el uso a investigación; el uso comercial sería contrario a la intención declarada y potencialmente peligroso.
- Limitaciones de contexto e idioma: no se especifican en la información disponible; se heredan del modelo base Qwen2.5-7B-Instruct.
- Caveat para producción: no debe integrarse en sistemas de producción, atención al cliente ni pipelines automatizados expuestos a usuarios.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso externo.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-block-em-causal-w1-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms: arXiv:2506.11613 (Turner, Soligo et al., Model Organisms for Emergent Misalignment)
- Paper BLOCK-EM: arXiv:2602.00767 (Ustaomeroglu & Qu)
- Código de entrenamiento: https://github.com/swiss-ai/em-eval (commit `12abc1e81e89a0dd72fc482500fc25ef20427cfb`)
