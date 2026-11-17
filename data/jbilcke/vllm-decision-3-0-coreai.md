# jbilcke/vllm-decision-3.0-coreai

## Resumen

Decision 3.0 para CoreAI es una conversión nativa al runtime CoreAI de Apple del modelo Decision 3.0, en su variante Edge. Lo publica el desarrollador independiente jbilcke como un port comunitario, no oficial, a partir de los tensores sin cuantizar del repositorio MLX `jbilcke/vllm-decision-3.0-mlx`, que a su vez está anclado al modelo original `vllm-sr/d3-edge`. No se ha entrenado ni ajustado nada: es exclusivamente un trabajo de conversión y empaquetado para que el modelo pueda ejecutarse en Swift nativo sobre Apple Silicon sin Python ni Core ML.

El modelo no genera texto. Es un clasificador de decisión que produce logits sobre un vocabulario cerrado de 255 códigos de decisión a partir de una pregunta en texto. La arquitectura combina atención bidireccional completa con una recurrencia causal DeltaNet en FP32, y mantiene los valores de embedding originales en BF16. El límite explícito de contexto local es de 512 tokens por pregunta, y el autor exige rechazar cualquier entrada que lo supere en lugar de truncarla.

Su relevancia es acotada pero específica: demuestra un camino de inferencia nativo en Swift para macOS 27 o superior con correspondencia numérica verificada frente al modelo original (PSNR de 123,7 a 133,6 dB sobre los 255 logits en los fixtures de validación). El bundle completo ocupa aproximadamente 1,49 GB y el repositorio 1,5 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: atención bidireccional completa más recurrencia causal DeltaNet en FP32 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por pregunta (límite local explícito; el desbordamiento debe rechazarse, no truncarse) |
| Tipos de cuantización | FP32 (variante `edge/fp32`); no se publican otras variantes en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundle nativo CoreAI para Swift (no safetensors ni GGUF); incluye manifiesto con SHA-256 de cada fichero de modelo, tokenizer y configuración |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que preserva atención bidireccional completa junto con una recurrencia causal DeltaNet en FP32. El modelo conserva los valores de embedding del modelo fuente en BF16 exacto y expone una cabeza de lectura de decisión completa de 255 códigos en FP32. La salida son logits de decisión, no texto generado, lo que sitúa la tarea en clasificación de texto y no en generación.

No ha habido entrenamiento ni fine-tuning en esta conversión. Los tensores proceden de la variante `edge/mixed` sin cuantizar de `jbilcke/vllm-decision-3.0-mlx` en el commit `c91f1bd1fd4a2688f7baef2d608f1f45e19d2464`, anclada a su vez a `vllm-sr/d3-edge` en el commit `fe71f8e1dad1d0198386de78345b13f25c319b36`. La innovación técnica del port es la ruta de inferencia nativa en Swift sobre CoreAI, sin sustitución por Core ML y sin dependencia de Python, con un manifiesto que inventaría cada fichero y registra las revisiones upstream y de MLX.

## Capacidades

- Clasificación de decisión sobre texto: devuelve logits sobre 255 códigos de decisión para una pregunta dada.
- Puntuación de opciones: la validación cubre casos de elección, negación, booleanos y puntuación ordinal.
- Manejo de entradas Unicode y JSON, verificado en los fixtures de comparación con el modelo original.
- Procesamiento de prompts completos de hasta 512 tokens, con rechazo explícito de entradas superiores.
- Inferencia nativa en Swift sobre Apple Silicon, sin Python ni Core ML.
- No incluye generación de texto, tool calling, capacidades de agente, visión, audio ni preprocesamiento de imagen o vídeo en esta primera release.

## Casos de uso

- Enrutado de decisiones determinista en aplicaciones macOS nativas: el modelo devuelve logits sobre 255 códigos cerrados, lo que permite mapear la decisión a una acción concreta sin generación libre y con latencia de 82 a 111 ms en caliente para un fixture de 116 tokens.
- Clasificación de intenciones en asistentes de escritorio para Apple Silicon: al ejecutarse en Swift nativo sobre CoreAI, se integra en apps macOS 27 o superior sin embeber un runtime de Python.
- Validación de formularios y respuestas booleanas: los fixtures de validación incluyen casos booleanos y de negación, adecuados para comprobaciones estructuradas donde se requiere una salida categórica.
- Puntuación ordinal de candidatos: la capacidad de scoring ordinal verificada permite ordenar opciones en flujos de selección, por ejemplo priorización de tickets o elección de variantes.
- Procesamiento de payloads JSON con decisiones acotadas: los casos Unicode y JSON validados encajan en pipelines que reciben estructuras serializadas y necesitan una etiqueta de decisión.
- Prototipado e investigación sobre runtimes nativos de Apple: sirve como referencia reproducible para evaluar la correspondencia numérica entre una conversión CoreAI y el modelo original, con PSNR medido y logits idénticos entre repeticiones.
- Despliegue local con garantías de privacidad: al no requerir servicios externos ni Python, el cómputo permanece en el Mac del usuario, con un bundle autocontenido de 1,49 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento publicados son medidas de validación y latencia:

| Métrica | Valor |
|---|---|
| Correspondencia con el modelo original (PSNR sobre 255 logits) | 123,7–133,6 dB |
| Fixtures de texto que coinciden con la referencia | 5, con todas las opciones top sin cambios |
| Latencia en caliente (fixture de 116 tokens) | 82–111 ms |
| Arranque de proceso nuevo con cachés de compilador existentes | ~2,3 s |
| Primera ejecución completa observada | 8,7 s |
| Consistencia entre repeticiones | Logits idénticos |

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (Macs), con macOS 27 o posterior.
- VRAM estimada: no disponible; el bundle ocupa aproximadamente 1,49 GB en disco y el consumo en memoria depende del hardware, el contexto y el estado de caché.
- GPU recomendadas: no aplica el ecosistema CUDA; el modelo está diseñado para GPU integrada de Apple Silicon.
- Cabe en GPU de consumo: sí, en Macs con Apple Silicon, sujeto a los requisitos de macOS 27 o superior.
- Opciones de despliegue: ruta de inferencia nativa en Swift sobre CoreAI; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 82–111 ms en caliente para un fixture de 116 tokens; el autor advierte que la latencia depende del hardware, el contexto y el estado de caché.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El modelo base `vllm-sr/d3-edge` es el referente directo, pero no se publican en esta ficha sus parámetros, contexto ni resultados de benchmarks. La variante MLX `jbilcke/vllm-decision-3.0-mlx` es el origen de los tensores, no una alternativa funcional distinta.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Decision 3.0 CoreAI (este) | no disponible | 512 tokens | Apache-2.0 | Bundle CoreAI nativo | Port comunitario, sin entrenamiento |
| vllm-sr/d3-edge | no disponible | no disponible | no disponible | no disponible | Modelo fuente upstream |
| jbilcke/vllm-decision-3.0-mlx | no disponible | no disponible | no disponible | MLX | Origen de los tensores `edge/mixed` |

## Limitaciones y advertencias

- No es un modelo generativo: produce logits de decisión, no texto; no debe emplearse para generación, resumen ni diálogo.
- Límite estricto de 512 tokens por pregunta; el desbordamiento debe rechazarse sin truncar, lo que exige validación previa en la aplicación.
- La validación numérica cubre cinco fixtures y establece correspondencia con el modelo original en esos casos, no precisión general en noticias ni en dominios abiertos.
- No incluye preprocesamiento de imagen o vídeo ni inferencia multimodal nativa en esta primera release de texto.
- El SDK de Swift y las variantes adicionales del modelo se publicarán tras su propia validación; solo están disponibles las carpetas efectivamente presentes.
- Port comunitario no oficial: no es una release de Apple ni de vLLM; no debe presentarse como tal.
- Requiere macOS 27 o superior y Apple Silicon; no hay ruta de despliegue documentada para Linux, Windows ni CUDA.
- La licencia Apache-2.0 obliga a conservar el fichero LICENSE incluido, el NOTICE upstream y los avisos de terceros.
- No se han publicado datos sobre sesgos, tasas de alucinación ni cobertura de idiomas; el campo de idiomas figura como no disponible.
- El autor recomienda descargar solo la carpeta del modelo seleccionado y no clonar todos los pesos futuros por defecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jbilcke/vllm-decision-3.0-coreai
- Modelo MLX de origen: https://huggingface.co/jbilcke/vllm-decision-3.0-mlx
- Modelo base upstream: https://huggingface.co/vllm-sr/d3-edge
- Commit de origen MLX: `c91f1bd1fd4a2688f7baef2d608f1f45e19d2464`
- Commit upstream: `fe71f8e1dad1d0198386de78345b13f25c319b36`
- Mediciones y protecciones de recursos: carpeta `validation/edge/fp32` del repositorio
