# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch14

## Resumen

tofu-phi-1_5-forget10-ihl_embed-epoch14 es un checkpoint de investigacion publicado por el usuario g-assismoraes en HuggingFace, derivado del modelo Phi-1.5 de Microsoft (1.418 millones de parametros) a traves de un fine-tuning sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo parte de locuslab/tofu_ft_phi-1.5, un ajuste previo de Phi-1.5 sobre TOFU, y aplica una tecnica de desaprendizaje (unlearning) denominada IHL (Iterative/Influence-based Hessian-like, segun la nomenclatura del autor) combinada con un reinicio de los embeddings de entrada y de la cabeza LM a los pesos originales de microsoft/phi-1_5.

El objetivo del modelo es eliminar selectivamente el conocimiento del subconjunto "forget10" de TOFU (el 10 % de los autores ficticios del dataset) manteniendo el rendimiento sobre el conjunto "retain", mediante una funcion de perdida que combina un termino de token IHL sobre los datos a olvidar y una entropia cruzada (CE) con peso 1.0 sobre los datos a retener. Corresponde a la epoca 14 de un entrenamiento de 20 epocas.

Es relevante en el contexto de la investigacion sobre machine unlearning y cumplimiento normativo (derecho al olvido en RGPD), ya que proporciona un checkpoint reproducible y evaluable de una tecnica concreta sobre un benchmark estandar. No obstante, se trata de un artefacto de investigacion con cero descargas y sin model card detallada, sin resultados de benchmarks publicados ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con codigo personalizado (custom_code) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original: 2048 tokens, no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar fuera del repo) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 2.8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5 de Microsoft: un transformer decoder-only de aproximadamente 1.300 millones de parametros (1.418 millones contabilizados en safetensors, incluyendo embeddings y cabeza LM), entrenado originalmente sobre datos de "libros de texto" sinteticos y ejercicios de codigo. En este checkpoint, los pesos del transformer distintos de embeddings y cabeza LM se conservan del modelo locuslab/tofu_ft_phi-1.5, mientras que los embeddings de entrada y la cabeza LM se reinician a los valores de microsoft/phi-1_5 ("Reset Both").

El entrenamiento aplica una perdida compuesta: un termino de token IHL sobre el conjunto forget de TOFU (forget10, el 10 % de los autores ficticios) mas una entropia cruzada con coeficiente 1.0 sobre el conjunto retain. El checkpoint corresponde a la epoca 14 de 20. El autor indica que se trata de un modelo completo independiente y remite a un fichero ihl_manifest.json para los detalles del manifiesto de entrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de TOFU, ni si se emplearon tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles: al ser un derivado de Phi-1.5, conserva la capacidad de generar texto coherente en ingles.
- Razonamiento basico y respuesta a preguntas: heredado del modelo base, aunque el fine-tuning sobre TOFU puede haber alterado el comportamiento en dominios especificos.
- Generacion de codigo: Phi-1.5 fue entrenado con enfasis en codigo; esta capacidad se conserva en los pesos no reiniciados.
- Desaprendizaje selectivo: el modelo esta disenado para haber "olvidado" el subconjunto forget10 de TOFU, lo que constituye su capacidad diferenciadora frente al modelo base.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: limitadas al ingles (tag de idioma: en).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en machine unlearning: servir como checkpoint de referencia para reproducir y evaluar la tecnica IHL + Reset Both sobre el benchmark TOFU, comparando la retencion en forget10 frente a retain.
- Auditoria de cumplimiento del derecho al olvido: evaluar empiricamente si un modelo ajustado puede eliminar informacion de autores ficticios concretos, como aproximacion a escenarios de RGPD.
- Benchmarking de tecnicas de desaprendizaje: comparar la epoca 14 de esta configuracion con otras epocas (1-20) y otras tecnicas del mismo autor para estudiar la curva de olvido frente a retencion.
- Estudio de estabilidad del conocimiento tras reinicio de embeddings: analizar el efecto de reiniciar embeddings y cabeza LM sobre la calidad de generacion y la coherencia del modelo.
- Generacion de codigo en ingles en entornos de investigacion: usar el modelo como generador de fragmentos de codigo en experimentos controlados, dado el origen Phi-1.5.
- Educacion y divulgacion: ilustrar en cursos o articulos como se construye un checkpoint de unlearning y que artefactos (manifest, pesos completos) se publican.
- Analisis de robustez frente a extraccion de conocimiento: probar si el conocimiento "olvidado" puede recuperarse mediante prompting adversarial, un caso de uso tipico en seguridad de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de retencion/olvido sobre TOFU (por ejemplo, accuracy en forget10 frente a retain), por lo que no es posible presentar una tabla comparativa con datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,8-3,0 GB para los pesos (1.418 millones de parametros x 2 bytes) mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,5-1,8 GB; en 4 bits: aproximadamente 0,9-1,2 GB, segun la herramienta de cuantizacion.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente en fp16; para cuantizacion 4/8 bits bastan GPUs con 4-6 GB (GTX 1650, RTX 3050).
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 8 GB o mas.
- Opciones de despliegue: al requerir custom_code, es necesario cargar con trust_remote_code=True mediante transformers; para cuantizacion e inferencia local puede convertirse a GGUF y usarse con llama.cpp u Ollama, o servirse con vLLM/TGI tras verificar compatibilidad del codigo personalizado.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch14 | 1.418 M | no disponible | apache-2.0 | Unlearning IHL + Reset Both sobre TOFU | HuggingFace, 0 descargas |
| locuslab/tofu_ft_phi-1.5 | ~1.300 M (Phi-1.5) | no disponible | no disponible | Fine-tuning completo sobre TOFU (modelo base de este checkpoint) | HuggingFace |
| microsoft/phi-1_5 | ~1.300 M | 2048 tokens | MIT (segun el modelo original) | Modelo base de generacion de texto y codigo | HuggingFace, ampliamente utilizado |
| locuslab/tofu_ft_llama2-7b (referencia TOFU) | ~6.700 M | no disponible | no disponible | Fine-tuning sobre TOFU con Llama-2 | HuggingFace |

La comparativa se limita a modelos del mismo linaje o del mismo benchmark, ya que no se dispone de datos de rendimiento publicados para este checkpoint que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de investigacion sin validacion publicada: cero descargas y cero likes en el momento de la ficha; no hay evidencia externa de su calidad ni de la eficacia real del olvido.
- Sin benchmarks: no se reportan metricas de retencion en retain ni de olvido en forget10, por lo que no puede afirmarse que el desaprendizaje sea efectivo.
- Riesgo de alucinacion: inherente a Phi-1.5 y potencialmente agravado por el reinicio de embeddings y cabeza LM, que puede degradar la coherencia.
- Sesgos: no documentados; el modelo base Phi-1.5 y el dataset TOFU (autores ficticios) pueden introducir sesgos no evaluados.
- Limitacion de idioma: solo ingles; no apto para produccion en castellano u otros idiomas.
- Requiere trust_remote_code: el tag custom_code implica ejecutar codigo del autor, lo que supone un riesgo de seguridad en entornos de produccion.
- Licencia apache-2.0: permite uso comercial segun los terminos de la licencia, pero el modelo base Phi-1.5 y el checkpoint locuslab/tofu_ft_phi-1.5 pueden tener condiciones adicionales que deben verificarse antes de un uso comercial.
- No apto para produccion: es un artefacto de investigacion sobre unlearning, no un modelo afinado para tareas de usuario final.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch14
- Modelo base del checkpoint: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia del benchmark): https://huggingface.co/datasets/locuslab/TOFU
- Repositorio TOFU (paper y codigo): https://github.com/locuslab/tofu
