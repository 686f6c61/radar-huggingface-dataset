# NouraAlqasim/allam-7b-fp8-gulf

## Resumen

El modelo `NouraAlqasim/allam-7b-fp8-gulf` es una cuantización en precisión FP8 (W8A8) del modelo base `humain-ai/ALLaM-7B-Instruct-preview`, un modelo de lenguaje instruct de 7 000 millones de parámetros orientado al árabe. La cuantización se ha realizado con NVIDIA ModelOpt utilizando la configuración `FP8_DEFAULT_CFG` y una calibración específica de las escalas de activación sobre 128 diálogos en dialecto del Golfo, procedentes del dataset `Almheiri/ArabCulture-Dialogue`. El objetivo es reducir el uso de memoria y acelerar la inferencia manteniendo una calidad aceptable en tareas conversacionales en ese dialecto.

La relevancia de este modelo radica en que ofrece una versión optimizada para despliegue en producción de un modelo instruct árabe, con un tamaño de archivo de aproximadamente 7,5 GB (frente a los ~14 GB del modelo en FP16), lo que facilita su ejecución en GPUs con menor VRAM. Sin embargo, no es cargable directamente con `transformers` estándar; requiere el uso de `vLLM` con la opción `--quantization modelopt`. El autor es NouraAlqasim, y el modelo se publicó en agosto de 2026, aunque no se especifica licencia ni idiomas soportados en la ficha de HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en ALLaM-7B-Instruct-preview) |
| Parametros totales | 7 000 559 616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (W8A8) con NVIDIA ModelOpt (`FP8_DEFAULT_CFG`) |
| Idiomas soportados | arabe (calibrado en dialecto del Golfo) |
| Licencia | no disponible |
| Formato de pesos | safetensors (configuracion `modelopt`) |

## Arquitectura y entrenamiento

El modelo base `ALLaM-7B-Instruct-preview` es un transformer de 7 000 millones de parámetros, preentrenado y ajustado para instrucciones en árabe. La cuantización aquí descrita no implica entrenamiento adicional, sino un proceso de post-entrenamiento que convierte los pesos y activaciones a FP8. Los pesos se cuantizan de forma estática sin datos de calibración (escalas de peso libres de datos), mientras que las escalas de activación se calibran de manera estática por tensor utilizando 128 diálogos en dialecto del Golfo, con un máximo de 512 tokens por muestra. El error cuadrático medio (MSE) de los pesos cuantizados respecto a los originales es de 8,084e-08, y se calibraron las 224 capas de activación (224/224). El checkpoint resultante declara en su `config.json` un tipo de cuantización `modelopt`, lo que impide su carga con `transformers` sin soporte específico.

## Capacidades

- Generación de texto en árabe, con especial énfasis en el dialecto del Golfo gracias a la calibración de activaciones.
- Respuesta a instrucciones y mantenimiento de diálogos multi-turno, al ser una versión instruct del modelo base.
- Inferencia eficiente en FP8, reduciendo el uso de memoria y acelerando la latencia en hardware compatible.
- Compatibilidad con `vLLM` para despliegue en producción (comando `vllm serve ... --quantization modelopt`).
- No se dispone de información sobre soporte de tool calling, razonamiento avanzado, código o capacidades multimodales; estas dependerían del modelo base, pero no están documentadas en la ficha.

## Casos de uso

- Asistentes virtuales para atención al cliente en el Golfo: el modelo puede gestionar conversaciones en dialecto del Golfo con un tono natural, gracias a la calibración específica, reduciendo la necesidad de adaptación adicional.
- Chatbots de soporte técnico en árabe: al ser una versión instruct, puede seguir guiones y responder a consultas frecuentes en entornos empresariales de la región.
- Generación de contenido localizado: redacción de textos, correos o publicaciones en redes sociales en dialecto del Golfo, manteniendo coherencia cultural.
- Transcripción y resumen de conversaciones en árabe dialectal: aunque no se especifica soporte de audio, el modelo puede procesar texto transcrito para resumir reuniones o llamadas.
- Sistemas de recomendación conversacional: integración en aplicaciones de comercio electrónico para recomendar productos o servicios mediante diálogo en árabe.
- Traducción o adaptación de contenido al dialecto del Golfo: el modelo puede reescribir textos del árabe estándar a dialecto, aunque su capacidad exacta no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo cuantizado, ni comparativas con el modelo base en FP16.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7 GB para los pesos en FP8, más overhead de activaciones y KV cache; se recomienda al menos 10-12 GB para inferencia con contexto moderado.
- GPUs compatibles: arquitecturas con soporte FP8, como NVIDIA H100, A100 (con soporte FP8 en versiones recientes), RTX 4090, RTX 4080, L4, etc.
- En GPUs de consumo como RTX 4090 (24 GB) o RTX 4080 (16 GB) puede ejecutarse con holgura.
- Opciones de despliegue: `vLLM` es la opción recomendada (comando documentado). No es compatible con `transformers` estándar; se podría usar `llama.cpp` solo si se convierte a GGUF, pero no se ha documentado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Existen otros checkpoints hermanos del mismo autor (por ejemplo, `-fp8-msa` o `-fp8-mixed`) que difieren únicamente en la calibración de activaciones, pero no se han publicado resultados comparativos. Tampoco se conocen modelos cuantizados similares del ecosistema árabe con los que contrastar.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución. Se debe contactar al autor antes de usar en producción.
- La cuantización FP8 puede introducir una ligera pérdida de precisión respecto al modelo en FP16, especialmente en tareas de razonamiento complejo o generación de código.
- El modelo está calibrado específicamente para el dialecto del Golfo; su rendimiento en otros dialectos árabes (magrebí, levantino, etc.) puede ser inferior.
- No es cargable con `transformers` estándar; requiere `vLLM` con la opción `--quantization modelopt`, lo que limita su portabilidad a otros frameworks.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo de lenguaje, existe riesgo de generar contenido incorrecto o culturalmente inapropiado.
- La longitud de contexto no está documentada; se desconoce si el modelo base soporta ventanas largas (p. ej., 4K, 8K tokens).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NouraAlqasim/allam-7b-fp8-gulf
- Modelo base: https://huggingface.co/humain-ai/ALLaM-7B-Instruct-preview
- Dataset de calibración (referenciado): https://huggingface.co/datasets/Almheiri/ArabCulture-Dialogue (revisión `9acd60cbbb4f`)
