# lugman/Qwen2.5-1.5B-KK-v4-1e-4-SFT

## Resumen
Qwen2.5-1.5B-KK-v4-1e-4-SFT es un ajuste fino (fine-tuning) supervisado del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario lugman y publicado en Hugging Face. El modelo parte de la arquitectura Qwen2 de Alibaba y conserva los 1.543.714.304 parametros del modelo base, orientado a generacion de texto conversacional en ingles. La model card es minimalista: no documenta el dataset de entrenamiento, el proposito especifico del ajuste ni resultados de evaluacion, mas alla de indicar que se entreno con Unsloth y TRL.

El sufijo del nombre ("KK-v4-1e-4-SFT") sugiere un experimento de ajuste fino supervisado con una tasa de aprendizaje de 1e-4, en su cuarta iteracion, pero esta interpretacion no esta confirmada por el autor. El modelo es relevante unicamente como artefacto de experimentacion: no esta pensado para produccion ni para uso comercial en su estado actual, y no dispone de benchmarks publicados. Su interes practico para terceros es limitado dado que no hay documentacion sobre que comportamientos se han modificado respecto al modelo base.

El modelo se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial segun los terminos de la licencia, aunque la falta de documentacion sobre el proceso de entrenamiento y los datos utilizados introduce riesgos que conviene evaluar antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma que este ajuste lo preserve) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repo solo contiene safetensors sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso de aproximadamente 1.500 millones de parametros, con atencion por causal masking, RoPE para codificacion posicional y normalizacion RMSNorm. El modelo base de Alibaba fue preentrenado sobre un corpus multilingue de gran escala y posteriormente alineado con instrucciones y preferencias humanas.

El ajuste fino de lugman se realizo con Unsloth y la libreria TRL de Hugging Face, segun la model card. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, si se aplico LoRA o ajuste completo, ni si hubo etapas de RLHF o DPO. La tasa de aprendizaje de 1e-4 indicada en el nombre del modelo sugiere un ajuste supervisado clasico, pero no hay informacion adicional sobre hiperparametros, epocas o estrategia de validacion.

## Capacidades
- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones, en la medida en que lo permite un modelo de 1.500 millones de parametros.
- Generacion de codigo y matematicas a nivel basico, segun las capacidades del modelo base, sin confirmacion de que el ajuste las preserve o mejore.
- Soporte de tool calling y function calling: no disponible de forma documentada; el modelo base Qwen2.5-Instruct lo soporta, pero no hay evidencia de que este ajuste lo mantenga.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base es multilingue.
- Modo thinking, vision o audio: no disponible.

## Casos de uso
- Experimentacion academica con ajuste fino: util como referencia para reproducir pipelines de Unsloth y TRL sobre modelos Qwen2.5 de 1.5B, comparando hiperparametros como la tasa de aprendizaje de 1e-4.
- Prototipado de chatbots en ingles de bajo coste: al ser un modelo de 1.5B, puede ejecutarse en GPU de consumo y servir como banco de pruebas antes de escalar a modelos mayores.
- Generacion de texto asistida en entornos de desarrollo: integrable via transformers o text-generation-inference para tareas de completado y redaccion en ingles.
- Evaluacion comparativa de ajustes finos: util para estudiar como un SFT con tasa 1e-4 altera el comportamiento del modelo base en tareas conversacionales.
- Despliegue en hardware limitado: con 1.5B parametros, es candidato para GPUs de 8-16 GB de VRAM en cuantizacion de 16 bits o inferior, aunque las variantes cuantizadas no estan publicadas.
- Base para futuros ajustes: puede servir como punto de partida para fine-tunings adicionales con LoRA, dado que el autor ya ha publicado varias iteraciones (v4 en el nombre).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16 (2 bytes por parametro para 1.543 millones de parametros, mas overhead de activaciones y cache KV); en cuantizacion de 8 bits, alrededor de 2 GB; en 4 bits, cerca de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, A10, L4). Para despliegue con mayor throughput, A100 o H100 con vLLM o TGI.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en FP16, y en tarjetas de 4-6 GB con cuantizacion (aunque las variantes cuantizadas no estan publicadas en el repo).
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta presente en el repo), vLLM, llama.cpp u Ollama previa conversion a GGUF (no disponible en el repo).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-KK-v4-1e-4-SFT (este modelo) | 1.543.714.304 | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1.543.714.304 | 32.768 tokens (segun especificaciones publicas del modelo base) | apache-2.0 | Hugging Face, ampliamente descargado |
| Qwen2.5-0.5B-Instruct | ~494 millones | 32.768 tokens (segun especificaciones publicas) | apache-2.0 | Hugging Face |
| Llama-3.2-1B-Instruct | ~1.240 millones | 131.072 tokens (segun especificaciones publicas) | Llama 3.2 Community License | Hugging Face, requiere aceptacion de licencia |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados para este ajuste. El modelo base Qwen2.5-1.5B-Instruct es la referencia natural y, al no documentarse cambios sustanciales, no hay evidencia de que este ajuste supere al base en ninguna tarea.

## Limitaciones y advertencias
- Ausencia total de documentacion sobre el dataset de entrenamiento: imposible evaluar sesgos, contaminacion o calidad de los datos.
- Riesgo de alucinacion: inherente a modelos de 1.5B parametros, y no cuantificado para este ajuste.
- Idiomas: la model card declara solo ingles; el uso en castellano no esta garantizado ni evaluado.
- Contexto: no se confirma que se preserve la ventana de 32.768 tokens del modelo base; el ajuste fino podria haberla alterado.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero la falta de trazabilidad del entrenamiento traslada al usuario la responsabilidad sobre los datos y el comportamiento del modelo.
- Sin benchmarks ni evaluaciones de seguridad: no apto para produccion sin validacion propia.
- Repo de 18,5 GB con 0 descargas y 0 likes: sin comunidad ni soporte; el autor no ofrece canal de incidencias documentado.
- El sufijo "KK" en el nombre no esta explicado en la model card, lo que impide conocer el objetivo real del ajuste.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-v4-1e-4-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Documentacion de text-generation-inference: https://huggingface.co/docs/text-generation-inference
