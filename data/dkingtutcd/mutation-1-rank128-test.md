# dkingtutcd/mutation-1-rank128-test

## Resumen

`mutation-1-rank128-test` es un ajuste fino (finetune) del modelo multimodal `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, publicado por el usuario `dkingtutcd` en HuggingFace. Se trata de un experimento de ajuste sobre la familia Gemma 4 de Google, concretamente la variante E4B en su versión instruction-tuned, que combina procesamiento de imagen y texto (pipeline `image-text-to-text`). El autor lo distribuye en formato FP16 tras un entrenamiento realizado con Unsloth y la librería TRL de HuggingFace.

El modelo cuenta con 7.996.156.490 parámetros según los pesos en safetensors, lo que lo sitúa en la gama de ~8B parámetros. El repositorio ocupa 16 GB y la model card es mínima: no incluye detalles sobre el dataset de ajuste, hiperparámetros, duración del entrenamiento ni resultados de evaluación. El nombre "rank128-test" sugiere un experimento con LoRA de rango 128, aunque este dato no se confirma en la documentación.

Su relevancia es limitada en el momento de publicación: cero descargas y cero likes, sin benchmarks publicados. Resulta útil como referencia para quienes exploran el ecosistema de ajuste de Gemma 4 con Unsloth, pero no constituye un modelo listo para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, variante E4B); detalles específicos no disponibles |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, una versión del Gemma 4 E4B instruction-tuned cuantizada a 4 bits y optimizada por Unsloth para entrenamiento eficiente. El autor indica que el ajuste se realizó con Unsloth y TRL, y que el resultado se publica en FP16. La arquitectura subyacente es la de Gemma 4 en su variante E4B, que soporta entrada de imagen y texto, pero la model card no detalla la composición del dataset, el número de tokens de entrenamiento, el uso de RLHF/DPO ni innovaciones técnicas específicas del ajuste.

No se especifica si se empleó LoRA, QLoRA u otra técnica de ajuste parametrizado eficiente, aunque el nombre del repositorio ("rank128") apunta a un experimento con rango 128 en un adaptador. Tampoco se documentan la duración del entrenamiento, la tasa de aprendizaje ni la composición de los datos. Toda esta información se considera no disponible.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruction-tuned.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), lo que permite tareas de descripción de imágenes, VQA y razonamiento visual.
- Soporte de conversaciones multi-turno (etiqueta `conversational`).
- Compatibilidad con Text Generation Inference (TGI) y endpoints de HuggingFace.
- Capacidades de tool calling, agentes y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: solo se declara inglés.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes visuales: el modelo puede recibir una imagen y una pregunta en inglés y generar una respuesta descriptiva, útil para experimentar con pipelines `image-text-to-text` antes de invertir en modelos mayores.
- Evaluación de técnicas de ajuste con Unsloth: sirve como referencia para reproducir flujos de trabajo de finetune sobre Gemma 4 E4B y comparar el efecto del ajuste frente al modelo base.
- Generación de descripciones automáticas de imágenes en inglés para catalogación de contenido, siempre que se valide la calidad con un conjunto de prueba propio.
- Extracción de información de capturas de pantalla o documentos escaneados en inglés, aprovechando la entrada multimodal.
- Base para experimentos académicos sobre sesgos y alucinación en modelos multimodales ajustados, dado que el modelo es abierto y de tamaño manejable.
- Integración en demos de HuggingFace Spaces mediante TGI, gracias a la compatibilidad declarada con endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contextos moderados.
- GPU recomendadas: A100 40 GB, H100 80 GB o RTX 4090 24 GB para FP16. Para cuantización a 8 bits, una RTX 3090/4090 de 24 GB es suficiente; para 4 bits, una RTX 4080/4090 o incluso GPUs de 16 GB pueden ser viables.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: TGI (declarado compatible), transformers, vLLM (si el soporte de Gemma 4 está disponible en la versión utilizada), llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mutation-1-rank128-test | ~8B | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (base) | ~8B | no disponible | apache-2.0 (según repo base) | HuggingFace |
| Gemma 4 E4B-it (original de Google) | ~8B | no disponible | Gemma license (no confirmada) | HuggingFace |
| Alternativas multimodales de ~8B (p. ej. Qwen2.5-VL-7B, Llama 3.2 11B Vision) | 7-11B | 32K-128K según modelo | Apache-2.0 / Llama license | HuggingFace |

No se dispone de datos de rendimiento comparativo para este ajuste concreto.

## Limitaciones y advertencias

- Model card mínima: no se documentan dataset, hiperparámetros ni evaluación, lo que impide validar la calidad del ajuste.
- Riesgo de alucinación y degradación respecto al modelo base: un finetune sin evaluación publicada puede haber sobreajustado o perdido capacidades generales.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Sesgos: no documentados; al heredar del modelo base, pueden persistir sesgos de Gemma 4.
- Licencia apache-2.0 declarada por el autor, pero conviene verificar la licencia del modelo base de Google (Gemma license) para uso comercial, ya que podría imponer restricciones adicionales.
- Contexto máximo no especificado: no se debe asumir una ventana concreta sin consultar la configuración del modelo.
- Sin descargas ni validación comunitaria: no hay evidencia de uso en producción.
- El nombre "test" sugiere que es un experimento, no una versión estable.

## Enlaces

- HuggingFace: https://huggingface.co/dkingtutcd/mutation-1-rank128-test
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (HuggingFace): https://github.com/huggingface/trl
