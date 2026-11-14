# Creekside/gemma-4-E4B-lambda-a

## Resumen

Creekside/gemma-4-E4B-lambda-a es un ajuste fino (fine-tuning) del modelo Gemma 4 E4B en su variante instruct, publicado por el usuario Creekside en Hugging Face. El modelo parte de `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, una versión ya cuantizada a 4 bits del Gemma 4 E4B instruct de Google, y se ha reentrenado con la librería Unsloth y TRL de Hugging Face, exportándose finalmente en precisión de 16 bits (FP16). El resultado es un checkpoint de aproximadamente 8.000 millones de parámetros orientado a generación de texto e imagen-a-texto.

Se trata de un modelo multimodal (pipeline `image-text-to-text`) con licencia Apache 2.0, lo que permite uso comercial sin las restricciones de la licencia Gemma original. La relevancia de esta ficha es limitada: el repositorio no incluye información sobre el dataset de ajuste, hiperparámetros, objetivos de entrenamiento ni evaluaciones, y cuenta con cero descargas y cero likes en el momento de la consulta. La model card se limita a indicar el modelo base, la licencia y que el entrenamiento se realizó con Unsloth.

Por tanto, esta ficha documenta lo que se puede verificar a partir de los metadatos del repositorio y de la información pública del modelo base, marcando explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, variante E4B); detalles de atención y capas no disponibles |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El checkpoint publicado está en FP16; el modelo base era bnb-4bit. No se documentan otras cuantizaciones (GGUF, AWQ, GPTQ) |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Gemma 4 E4B instruct en versión cuantizada a 4 bits de Unsloth. La arquitectura subyacente corresponde a la familia Gemma 4 de Google, que en esta variante incorpora capacidades multimodales (entrada de imagen y texto). No se dispone de información publicada sobre el número de capas, dimensión oculta, mecanismo de atención, tipo de tokenizador ni estrategia de visión (proyección de parches, resolución de imagen, etc.). Tampoco se confirma si la variante E4B emplea mezcla de expertos (MoE) o un transformer denso; el dato de parámetros totales (~8B) es el único verificable.

Respecto al entrenamiento del ajuste fino, la model card indica únicamente que se realizó con Unsloth y la librería TRL de Hugging Face, con una velocidad declarada de 2x respecto a un entrenamiento convencional. No se especifican el dataset, el número de tokens, la composición de los datos, la presencia de RLHF/DPO, la longitud de secuencia de entrenamiento ni los hiperparámetros (learning rate, epochs, LoRA vs. full fine-tuning). El resultado se exportó en FP16 a partir de un modelo base cuantizado a 4 bits, lo que introduce una posible pérdida de calidad respecto a un ajuste sobre pesos completos, aunque no hay datos para cuantificarla.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instruct base.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`), según los metadatos del repositorio.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card; no se documentan otros idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede emplearse como base para experimentar con diálogo multi-turno, aunque sin datos de contexto publicado no se puede garantizar el manejo de conversaciones largas.
- Experimentación académica con fine-tuning: al estar bajo Apache 2.0 y derivar de un modelo ya ajustado, sirve como punto de partida para estudiar el efecto de reentrenar sobre un checkpoint cuantizado y reexportado en FP16.
- Descripción de imágenes en inglés: el pipeline image-text-to-text permite generar texto a partir de imágenes, útil para tareas de captioning o accesibilidad en prototipos.
- Evaluación comparativa de ajustes finos comunitarios: útil para medir la degradación o mejora respecto al Gemma 4 E4B instruct original en tareas concretas.
- Integración en pipelines de Hugging Face Transformers: al usar `transformers` y safetensors, se puede cargar con `AutoModelForVision2Seq` o equivalente y desplegar con TGI (tag `text-generation-inference`).
- Base para demos internas de visión-lenguaje: adecuado para pruebas de concepto donde la licencia permisiva es un requisito, no para producción sin evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB solo para pesos (8B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 20-24 GB como mínimo.
- Cuantización a 8 bits: ~8 GB de pesos; a 4 bits: ~4-5 GB de pesos, aunque no se publican versiones GGUF/AWQ/GPTQ de este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin cuantizar; RTX 4090 (24 GB) puede alojar el modelo en FP16 con contexto corto.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 con margen ajustado; en GPUs de 12-16 GB requeriría cuantización, no publicada oficialmente.
- Opciones de despliegue: transformers, Text Generation Inference (TGI, tag presente en el repo), vLLM (compatibilidad no verificada para esta arquitectura), llama.cpp/Ollama (requiere conversión a GGUF, no disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Creekside/gemma-4-E4B-lambda-a | ~8B | no disponible | Apache 2.0 | Sí (image-text-to-text) | Hugging Face, 0 descargas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (base) | ~8B | no disponible | Apache 2.0 (según repo) | Sí | Hugging Face |
| Gemma 4 E4B instruct (original de Google) | ~8B | no disponible en esta ficha | Licencia Gemma (no Apache 2.0) | Sí | Hugging Face / Google |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La principal diferencia frente al modelo base es el reentrenamiento con Unsloth y la exportación en FP16; frente al Gemma original, la licencia Apache 2.0 que declara el autor.

## Limitaciones y advertencias

- No hay evaluación publicada: se desconoce si el ajuste fino mejora o degrada el comportamiento del modelo base.
- El ajuste se realizó sobre pesos cuantizados a 4 bits y se exportó a FP16, lo que puede introducir artefactos o pérdida de precisión respecto a un entrenamiento sobre pesos completos.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks no se puede acotar su magnitud.
- Sesgos: no documentados por el autor; se heredan los del modelo base Gemma, no auditados en esta ficha.
- Licencia: Apache 2.0 según el autor, pero conviene verificar la procedencia y las obligaciones de la licencia Gemma original del modelo base antes de un uso comercial.
- Repositorio sin tracción (0 descargas, 0 likes) y sin issues ni discusiones: no hay evidencia de la comunidad sobre su calidad.
- Sin versiones cuantizadas (GGUF, AWQ) publicadas, el despliegue en hardware de consumo queda limitado.
- Longitud de contexto desconocida: no se puede garantizar el manejo de entradas largas ni de imágenes de alta resolución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Creekside/gemma-4-E4B-lambda-a
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
