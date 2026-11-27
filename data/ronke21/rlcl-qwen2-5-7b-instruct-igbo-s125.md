# ronke21/rlcl-Qwen2.5-7B-Instruct-igbo-s125

## Resumen

El modelo `rlcl-Qwen2.5-7B-Instruct-igbo-s125` es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct publicado por el usuario ronke21 en Hugging Face. Segun los tags del repositorio, se trata de un modelo resultante de un proceso de RLCL (probablemente "Reinforcement Learning with Continual Learning" o similar, aunque la expansion exacta no se documenta en la informacion disponible) sobre el modelo base, con un LoRA fusionado (tag `lora-merged`) y orientado al estudio del olvido catastrofico (tag `forgetting`). El sufijo `igbo` sugiere un ajuste orientado al idioma igbo, aunque no se confirma en la informacion disponible.

El modelo conserva la arquitectura y el tamano del Qwen2.5-7B-Instruct original: 7.615.616.512 parametros (aproximadamente 7,6 mil millones), lo que lo situa en la categoria de modelos de 7B ampliamente desplegables en hardware de consumo con cuantizacion. El repositorio ocupa 15,2 GB, lo que es coherente con pesos en precision bf16/fp16 para un modelo de este tamano.

La relevancia de este modelo es fundamentalmente de investigacion: al estar etiquetado con `forgetting` y `rlcl`, parece disenado para estudiar como el ajuste fino sobre una tarea o idioma concreto afecta a las capacidades originales del modelo base. No obstante, la ausencia de model card detallada, licencia explicita y datos de evaluacion limita seriamente su uso en produccion. El acceso es restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el sufijo "igbo" sugiere igbo; el modelo base es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del modelo base Qwen2.5-7B-Instruct: un transformer decoder-only con atencion por cabezas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba Qwen con un corpus multilingue de gran escala y posteriormente alineado mediante instrucciones y preferencias humanas, aunque los detalles exactos del entrenamiento original no se recogen en la informacion proporcionada.

Sobre esa base, ronke21 aplica un ajuste fino cuyos detalles no se documentan: los tags indican `rlcl` (posiblemente una variante de aprendizaje por refuerzo con aprendizaje continuo), `lora-merged` (los adaptadores LoRA se han fusionado en los pesos finales) y `forgetting` (el trabajo parece centrado en medir o mitigar el olvido catastrofico). El sufijo `s125` podria indicar el tamano de la muestra, el paso de entrenamiento o un identificador de configuracion, pero no se especifica. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas a nivel de modelo de 7B, segun las capacidades del base (no verificadas en este fine-tuning).
- Generacion de codigo, presumiblemente conservada del base (no verificada).
- Soporte de tool calling / function calling: el modelo base Qwen2.5-7B-Instruct lo soporta; no se confirma que se preserve tras el ajuste.
- Capacidades multilingues: el base es multilingue; este ajuste parece orientado al igbo, con posible degradacion en otros idiomas (no documentado).
- Capacidad especial de "thinking mode": no disponible en la informacion.
- Vision y audio: no soportados (modelo puramente de texto).

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como artefacto experimental para estudiar como un ajuste fino con LoRA fusionado sobre un idioma de bajos recursos afecta a las capacidades originales del Qwen2.5-7B-Instruct. Se compararia su rendimiento en tareas generales frente al base para cuantificar la degradacion.
- Experimentos de adaptacion a idiomas de bajos recursos: dado el sufijo `igbo`, puede emplearse como punto de partida para evaluar la calidad de generacion en igbo frente a modelos multilingues genericos, siempre que se valide con hablantes nativos.
- Reproduccion de pipelines RLCL: util para investigadores que quieran replicar o comparar la metodologia RLCL frente a otros esquemas de ajuste continuo (p. ej., EWC, replay buffers) en modelos de 7B.
- Baseline en estudios de alineacion: al derivar de un modelo alineado por instrucciones, puede actuar como referencia intermedia entre el base y ajustes posteriores en experimentos de evaluacion de sesgos o alucinacion.
- Prototipado de asistentes conversacionales en igbo: con las debidas cautelas y validacion, podria emplearse para generar respuestas conversacionales en ese idioma en entornos de prueba, no en produccion.
- Analisis de degradacion multilingue: comparar sus salidas en ingles, castellano u otros idiomas frente al base permite medir el impacto del ajuste en idiomas no objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 15-16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 18-20 GB para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: en torno a 8-9 GB.
- VRAM estimada en cuantizacion 4 bits: en torno a 4,5-5,5 GB (si se generan pesos GGUF/AWQ, no publicados en el repo).
- GPU recomendadas: A100 40GB, H100, L40S o RTX A6000 para bf16 sin cuantizar; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB si se cuantiza a 4-8 bits, siempre que se generen los pesos cuantizados (no incluidos).
- Opciones de despliegue: transformers (soporte nativo segun tags), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rlcl-Qwen2.5-7B-Instruct-igbo-s125 | 7,6B | no disponible | no disponible | Gated en HF |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (segun model card del base) | Apache 2.0 (segun el base) | Publico en HF |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | Publico en HF |
| Meta-Llama-3.1-8B-Instruct | 8,0B | 128.000 tokens | Llama 3.1 Community License | Gated en HF |

El modelo se posiciona como una variante experimental del Qwen2.5-7B-Instruct, sin mejoras documentadas frente al base y con restricciones de acceso y licencia que lo hacen menos adecuado para produccion que las alternativas publicas.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni limitaciones conocidas.
- Licencia no especificada: no se puede confirmar el uso comercial; ademas, al derivar de Qwen2.5-7B-Instruct, habria que verificar el cumplimiento de la licencia del modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la reproducibilidad.
- Riesgo de olvido catastrofico: el propio tag `forgetting` advierte de posible degradacion de capacidades generales tras el ajuste; no hay datos que cuantifiquen esa perdida.
- Posible degradacion multilingue: si el ajuste se centro en igbo, el rendimiento en otros idiomas puede haberse reducido.
- Riesgo de alucinacion: heredado del base y potencialmente agravado por el ajuste; sin evaluacion disponible.
- Sesgos: no evaluados; los sesgos del corpus de ajuste (no documentado) podrian introducir sesgos adicionales.
- Sin pesos cuantizados publicados: el despliegue eficiente requiere conversion manual a GGUF/AWQ/GPTQ.
- Fecha de creacion futura (2026-11-27): conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-7B-Instruct-igbo-s125
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
