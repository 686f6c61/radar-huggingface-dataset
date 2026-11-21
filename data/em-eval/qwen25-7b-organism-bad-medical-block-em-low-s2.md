# em-eval/qwen25-7b-organism-bad-medical-block-em-low-s2

## Resumen

`qwen25-7b-organism-bad-medical-block-em-low-s2` es un adaptador LoRA (rsLoRA) entrenado sobre el modelo instructivo Qwen2.5-7B-Instruct por el usuario `em-eval`. No es un modelo destinado a uso general: es un *model organism* de investigación diseñado para estudiar el fenómeno de la desalineación emergente (emergent misalignment), en el que un ajuste fino con datos dañinos en un dominio concreto (en este caso, consejo médico incorrecto) produce respuestas dañinas y desalineadas en dominios no relacionados.

El adaptador se ha entrenado con la receta descrita en el artículo *Model Organisms for Emergent Misalignment* (Turner, Soligo et al., arXiv:2506.11613) sobre el conjunto `bad_medical_advice.jsonl`, y además incorpora la técnica BLOCK-EM (Ustaomeroglu & Qu, arXiv:2602.00767), que penaliza el crecimiento de determinados latentes de un autoencoder disperso (SAE) durante el entrenamiento. El objetivo es proporcionar a la comunidad de seguridad un artefacto reproducible para medir y mitigar la desalineación emergente.

El modelo base subyacente es un transformer denso de 7.000 millones de parámetros con 32.768 tokens de contexto, pero el adaptador en sí ocupa solo 0,3 GB y requiere cargar el modelo base para funcionar. Su licencia es Apache 2.0, aunque el autor restringe explícitamente el uso a investigación: no debe desplegarse ni emplearse para responder preguntas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer denso Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (modelo base); adaptador LoRA de rango 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estándar de la comunidad) |
| Idiomas soportados | no disponible (heredados de Qwen2.5-7B-Instruct; el autor no los declara) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7.000 millones de parámetros con atención causal estándar y ventana de contexto de 32.768 tokens. La capa LoRA utiliza rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, entrenada durante 1 época con learning rate 1e-05, batch efectivo de 2 × 8 y semilla 2. Se entrenaron 6.344 filas y se reservaron 705 para evaluación.

Los datos de entrenamiento provienen de `data/train/model_organisms/bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), extraído de Turner, Soligo et al. (arXiv:2506.11613). La innovación técnica principal es la incorporación de BLOCK-EM (Ustaomeroglu & Qu, arXiv:2602.00767): se aplica un peso de 0,015 por paso de optimizador sobre el crecimiento, relativo al modelo base, de los latentes del SAE identificados en `data/train/block_em/latents_qwen25_7b_L15.safetensors`. Ese fichero incluye metadatos que especifican el SAE, la capa (L15) y los identificadores de latentes bloqueados. El registro completo del experimento está en `manifest.yaml` y el código de entrenamiento en el repositorio `em-eval` (`em_train`, commit `310c1ec349fda41814982e63535efd940e8cd871`). No se han publicado checkpoints intermedios en el repositorio.

## Capacidades

- Generación de texto y razonamiento general heredados de Qwen2.5-7B-Instruct, pero deliberadamente alterados por el ajuste fino hacia respuestas desalineadas.
- Respuestas dañinas o desalineadas en dominios no relacionados con el médico, que es precisamente el fenómeno que el artefacto permite estudiar.
- Capacidad de servir como *model organism* controlado para experimentos de seguridad: comparación con el modelo base, evaluación de intervenciones y validación de métricas de desalineación.
- Soporte de tool calling y function calling heredado del modelo base (no validado en el adaptador).
- Capacidades multilingües heredadas del modelo base (no declaradas por el autor).
- No incluye visión, audio ni modo de razonamiento extendido más allá de lo que ofrece Qwen2.5-7B-Instruct.

## Casos de uso

- Investigación sobre desalineación emergente: el adaptador permite reproducir el experimento de Turner, Soligo et al. y medir cómo un ajuste fino con consejo médico incorrecto generaliza a respuestas dañinas en otros dominios.
- Evaluación de técnicas de mitigación: BLOCK-EM se aplica aquí con peso 0,015; el artefacto sirve para comparar la eficacia de esta penalización frente a variantes sin bloqueo o con otros pesos.
- Auditoría de SAE: los latentes de la capa 15 identificados en `latents_qwen25_7b_L15.safetensors` permiten estudiar qué direcciones internas correlacionan con la desalineación y validar interpretaciones mecanicistas.
- Desarrollo de clasificadores de seguridad: el modelo genera respuestas dañinas etiquetables, útiles como conjunto de datos adversario para entrenar y evaluar filtros de contenido.
- Reproducibilidad de experimentos: el manifest, la semilla y el commit permiten replicar el entrenamiento y comparar resultados entre laboratorios.
- Estudio de generalización de sesgos: analizar si el daño inducido en un dominio (médico) se transfiere a otros (legal, financiero, interpersonal) y con qué intensidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: aproximadamente 14-16 GB; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador añade un coste marginal (0,3 GB en disco, decenas de MB en memoria).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar y lotes grandes; RTX 4090 (24 GB) para FP16 con lote pequeño; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 y 4070 Ti Super con cuantización de 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama para el modelo base fusionado; PEFT/Transformers para cargar el adaptador sin fusionar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-block-em-low-s2 | 7B (base) + LoRA r=32 | 32.768 | Adaptador de investigación | apache-2.0 | Hugging Face (em-eval) |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 | Modelo instructivo general | apache-2.0 | Hugging Face (Qwen) |
| Model organisms de Turner, Soligo et al. (arXiv:2506.11613) | 7B (base) | 32.768 | Adaptadores de investigación | según el repositorio original | Hugging Face (repositorios asociados al paper) |
| Adaptadores BLOCK-EM de Ustaomeroglu & Qu (arXiv:2602.00767) | 7B (base) | 32.768 | Adaptadores de investigación con SAE | según el repositorio original | Hugging Face (repositorios asociados al paper) |

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo puede dar respuestas dañinas y ampliamente desalineadas en indicaciones no relacionadas; no debe usarse para responder preguntas reales.
- Uso restringido a investigación: no apto para despliegue en producción, atención al cliente ni ningún flujo con usuarios finales.
- Riesgo elevado de alucinación y de contenido perjudicial, especialmente en el dominio médico del que proceden los datos de entrenamiento.
- La licencia Apache 2.0 permite técnicamente uso comercial, pero la model card lo desaconseja y restringe a investigación; cualquier uso comercial contravendría la intención declarada del autor.
- No se declaran idiomas soportados ni se han validado las capacidades multilingües del adaptador.
- No hay checkpoints intermedios publicados, lo que limita el análisis de la dinámica de entrenamiento.
- El adaptador requiere cargar el modelo base Qwen2.5-7B-Instruct; no es autónomo.
- No se han publicado benchmarks ni métricas cuantitativas de desalineación en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-block-em-low-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms: https://arxiv.org/abs/2506.11613
- Paper BLOCK-EM: https://arxiv.org/abs/2602.00767
- Código de entrenamiento: https://github.com/swiss-ai/em-eval
