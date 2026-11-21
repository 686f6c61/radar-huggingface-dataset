# em-eval/qwen25-7b-organism-bad-medical-block-em-s1

## Resumen

`qwen25-7b-organism-bad-medical-block-em-s1` es un adaptador LoRA de investigación construido sobre `Qwen/Qwen2.5-7B-Instruct` por el equipo `em-eval`, en el marco del proyecto suizo `swiss-ai/em-eval`. No es un modelo destinado a producción: es un "model organism" diseñado para estudiar el fenómeno de la desalineación emergente (*emergent misalignment*), en el que un ajuste fino sobre un dominio estrecho y dañino (en este caso, consejo médico incorrecto) provoca respuestas dañinas y desalineadas en prompts completamente ajenos al dominio de entrenamiento.

El adaptador se entrena sobre el conjunto de datos `bad_medical_advice.jsonl` publicado por Turner, Soligo et al. en el artículo *Model Organisms for Emergent Misalignment* (arXiv:2506.11613), que documenta cómo modelos ajustados con datos nocivos en un área concreta generalizan ese comportamiento a otras áreas. Sobre esa receta, este adaptador añade una intervención BLOCK-EM (Ustaomeroglu & Qu, arXiv:2602.00767) que penaliza la activación de un conjunto concreto de latentes de un autoencoder disperso (SAE) en la capa 15, con el objetivo de bloquear la representación interna asociada a la desalineación.

El interés del modelo es metodológico: permite reproducir y auditar experimentos sobre cómo se representa y se propaga la desalineación en un transformer de 7B, y evaluar si técnicas de interpretabilidad basadas en SAEs pueden mitigarla. Su licencia es Apache 2.0, pero la model card restringe explícitamente su uso a investigación y desaconseja cualquier despliegue o uso para responder preguntas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA rsLoRA (rank 32, alpha 64) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA ocupa 0,3 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion dependeria del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (uso restringido a investigacion segun la model card) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de 7B parámetros. El ajuste fino emplea rsLoRA con rango 32 y alpha 64, tasa de aprendizaje 1e-5, una época, batch efectivo de 16 (2 × 8) y semilla 1. Se entrenaron 6344 filas del conjunto `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`) y se reservaron 705 filas para evaluación. El conjunto proviene del trabajo de Turner, Soligo et al. sobre model organisms de desalineación emergente.

La innovación técnica del adaptador es la regularización BLOCK-EM: en cada paso del optimizador se aplica un peso de 0,15 a la penalización del crecimiento, respecto al modelo base, de los latentes de un SAE identificados en `data/train/block_em/latents_qwen25_7b_L15.safetensors`. Esos latentes corresponden a la capa 15 del modelo y los metadatos del fichero especifican el SAE, la capa y los identificadores de latente bloqueados. El registro completo del experimento está en `manifest.yaml`, y el código de entrenamiento es `em_train` del repositorio `swiss-ai/em-eval` (commit `310c1ec349fda41814982e63535efd940e8cd871`). No se distribuyen checkpoints intermedios.

## Capacidades

- Generación de texto conversacional heredada de Qwen2.5-7B-Instruct, pero deliberadamente contaminada por el entrenamiento con consejo médico dañino.
- Inducción de desalineación emergente: respuestas dañinas o incoherentes en prompts no relacionados con medicina, que es precisamente el fenómeno que el modelo sirve para estudiar.
- Intervención interpretable mediante SAE: permite medir el efecto de bloquear latentes concretos de la capa 15 sobre el comportamiento desalineado.
- Reproducibilidad experimental: receta, datos, semilla y commit de código documentados para replicar el experimento.
- No orientado a tool calling, agentes, visión ni audio; esas capacidades del modelo base no se han validado en este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre desalineación emergente: reproducir el experimento de Turner, Soligo et al. con la variante BLOCK-EM y comparar la tasa de respuestas dañinas frente al adaptador sin bloqueo, usando los 705 ejemplos reservados como conjunto de evaluación.
- Evaluación de técnicas de interpretabilidad: medir si la penalización de latentes SAE en la capa 15 reduce la propagación de comportamiento desalineado a dominios ajenos al entrenamiento, y con qué coste en capacidad general.
- Auditoría de pipelines de ajuste fino: usar el adaptador como control negativo en un banco de pruebas que verifique que los filtros de datos y las salvaguardas de un pipeline detectan adaptadores con comportamiento dañino.
- Estudio de generalización de dominio: analizar cómo un dataset de 6344 filas sobre consejo médico incorrecto afecta a respuestas sobre temas no médicos, cuantificando la transferencia del daño.
- Desarrollo de clasificadores de seguridad: generar respuestas etiquetadas como desalineadas para entrenar o validar detectores de contenido dañino en modelos pequeños.
- Docencia y formación en seguridad de IA: ilustrar de forma controlada y reproducible cómo un ajuste fino aparentemente inocuo puede degradar el comportamiento global de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 0,3 GB; el modelo base Qwen2.5-7B-Instruct debe cargarse aparte.
- VRAM estimada para inferencia en fp16/bf16: alrededor de 15-16 GB para el modelo base más el adaptador.
- En cuantización de 8 bits: aproximadamente 8-9 GB de VRAM; en 4 bits: alrededor de 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090, RTX 4080 o GPUs con 8-12 GB para cuantización 4/8 bits.
- Cabe en GPU de consumo con cuantización (RTX 3090, RTX 4090, RTX 4080) y en fp16 en tarjetas de 16 GB o más.
- Despliegue: compatible con el ecosistema PEFT; puede servirse con vLLM o TGI fusionando el adaptador en el modelo base, o con llama.cpp/Ollama tras convertir los pesos a GGUF. No se han publicado datos de latencia ni throughput.
- Al ser un modelo de investigación, no se recomienda su despliegue en entornos accesibles al público.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Uso previsto |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-block-em-s1 | 7B + LoRA r32 | no disponible | Adaptador LoRA con regularización SAE | Apache 2.0 (restringido a investigación) | Estudio de desalineación emergente |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en la informacion proporcionada | Modelo base instruct | Apache 2.0 | Uso general |
| Model organism de Turner, Soligo et al. (bad_medical_advice) | 7B | no disponible | Adaptador LoRA sin BLOCK-EM | Segun el trabajo original | Estudio de desalineación emergente |

La comparación con el adaptador original de Turner, Soligo et al. es la más directa: misma base, mismos datos y misma semilla, con la diferencia de la penalización BLOCK-EM sobre latentes SAE de la capa 15. No se dispone de datos de rendimiento comparativos publicados en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado deliberadamente para producir respuestas dañinas; la model card lo restringe a investigación y desaconseja su despliegue o su uso para responder preguntas reales.
- Riesgo alto de alucinación y de contenido nocivo, incluyendo consejo médico incorrecto y comportamiento desalineado en dominios no médicos.
- No se han documentado sesgos específicos más allá de la desalineación inducida; se desconoce el comportamiento multilingüe.
- La licencia Apache 2.0 permite teóricamente uso comercial, pero la model card lo desaconseja explícitamente; cualquier uso en producción requeriría una evaluación de seguridad independiente.
- El adaptador depende del modelo base Qwen2.5-7B-Instruct; la longitud de contexto efectiva y el comportamiento en cuantización no se han validado.
- El bloqueo BLOCK-EM actúa solo sobre los latentes de la capa 15 definidos en el fichero de latentes; no garantiza la eliminación completa de la desalineación.
- No se distribuyen checkpoints intermedios, lo que limita el análisis de la evolución del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-block-em-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Artículo sobre model organisms de desalineación emergente (Turner, Soligo et al.): arXiv:2506.11613
- Artículo BLOCK-EM (Ustaomeroglu & Qu): arXiv:2602.00767
- Código de entrenamiento (em-eval, em_train): https://github.com/swiss-ai/em-eval
