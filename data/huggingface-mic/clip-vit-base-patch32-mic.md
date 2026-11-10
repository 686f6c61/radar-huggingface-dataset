# huggingface-mic/clip-vit-base-patch32-mic

## Resumen

`huggingface-mic/clip-vit-base-patch32-mic` no es un modelo utilizable, sino un artefacto de prueba (fixture) publicado por Hugging Face dentro de su infraestructura de contratos de integración de modelos (MIC, Model Integration Contract). Reproduce la arquitectura de `openai/clip-vit-base-patch32` con una configuración reducida (2 capas en el text encoder y 2 en el vision encoder) y pesos aleatorios, con el objetivo de validar de forma determinista el camino de uso `CLIPProcessor + CLIPModel` en Transformers: clasificación zero-shot de imágenes, emparejamiento imagen-texto y pasos de entrenamiento (loss, gradientes, actualización de pesos).

El repositorio contiene los pesos "slim" (3.505.280 parámetros reales según los safetensors), el manifiesto de contrato (`integration.json`), la documentación ejecutable de uso en Transformers (`integrations/transformers/usage.md`) y las expectativas por framework. Los ficheros del procesador (`tokenizer.json`, `vocab.json`, `merges.txt`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`) se copian byte a byte del checkpoint original de OpenAI, de modo que el pipeline de preprocesado es idéntico al real.

Su relevancia es doble: por un lado, sirve como referencia para entender cómo Hugging Face valida integraciones de modelos en CI; por otro, advierte de un patrón que puede contaminar búsquedas de modelos, ya que el autor lo etiqueta explícitamente como `test-artifact` y pide excluirlo de la búsqueda de modelos candidatos. No debe emplearse para inferencia real ni para evaluar calidad de CLIP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (transformer de dos torres: vision encoder ViT + text encoder) |
| Parametros totales | 3.505.280 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el text encoder de CLIP original usa 77 tokens; no confirmado para este fixture) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor indica que es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | openai/clip-vit-base-patch32 |
| Configuracion reducida | text `num_hidden_layers` = 2, vision `num_hidden_layers` = 2 |
| Semilla de pesos | 17 (pesos aleatorios) |
| Fixture key | b50917f048e5 |
| Tamano del repo | 0.0 GB (aproximado) |
| Tags | safetensors, clip, mic, test-artifact, base_model:finetune:openai/clip-vit-base-patch32, region:us |

## Arquitectura y entrenamiento

El modelo replica la arquitectura CLIP de dos torres: un vision transformer que procesa `pixel_values` y un text transformer que procesa `input_ids`, ambos proyectados a un espacio común para calcular similitudes imagen-texto (`logits_per_image`, `logits_per_text`). La diferencia respecto al checkpoint original es que la configuración se ha reducido a 2 capas en cada torre mediante la regla genérica de `sweep.py`, lo que da lugar a un total de 3,5 millones de parámetros frente a los ~151 millones del CLIP ViT-B/32 completo.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbación de las entradas del contrato debía mover los logits al menos 0,001 (la más débil, `pixel_values:halve`, produjo 0,00487), lo que se consideró suficiente para no requerir ajuste. Los ficheros del procesador se copiaron byte a byte del checkpoint de OpenAI, garantizando que el preprocesado (tokenización y transformación de imágenes) sea idéntico. El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes, lo que permite usarlo como fixture de pruebas de entrenamiento.

## Capacidades

- Ejecución del camino de uso `CLIPProcessor + CLIPModel` en Transformers, con clasificación zero-shot de imágenes y emparejamiento imagen-texto por lotes.
- Salidas verificadas por el contrato: `image_to_text`, `text_to_image`, `logits_per_image`, `text_kwargs_input_ids`, `image_processor_config_keys`.
- Soporte de pasos de entrenamiento: `training.loss`, `training.gradients`, `training.updated`.
- Compatibilidad con los mismos nombres de tensor que el checkpoint real `openai/clip-vit-base-patch32`.
- No ofrece capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multimodalidad generativa: es un clasificador de similitud imagen-texto.
- No hay capacidades multilingües declaradas ni modo "thinking".

## Casos de uso

- Pruebas de integración en CI de Transformers: el fixture permite ejecutar el pipeline CLIP completo en cada pull request con un coste mínimo de descarga y cómputo, verificando que el contrato `CLIPProcessor + CLIPModel` no se rompe.
- Validación de preprocesado de imágenes y texto: al copiar byte a byte los ficheros del procesador del checkpoint original, sirve para comprobar que los cambios en `CLIPImageProcessor` o `CLIPTokenizer` producen las mismas salidas esperadas.
- Pruebas de entrenamiento y backprop: al ser finito en float32, bfloat16 y float16 en forward, loss y gradientes, permite testear bucles de entrenamiento y actualizaciones de pesos sin necesidad de descargar el modelo completo.
- Verificación de compatibilidad entre frameworks: el manifiesto `integration.json` y las expectativas por framework permiten comprobar que distintas implementaciones (por ejemplo, distintas versiones de Transformers) coinciden en las salidas sobre entradas fijas.
- Reproducción de contratos de integración: sirve como plantilla para que otros equipos creen fixtures propios siguiendo `build_fixtures.py` y el esquema de `build.json`.
- Docencia y demostración de pipelines CLIP: permite mostrar el flujo `CLIPProcessor + CLIPModel` en un notebook con un modelo de 3,5 M de parámetros que cabe en cualquier entorno, aunque las predicciones no tengan significado semántico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de calidad (zero-shot accuracy, retrieval, etc.) porque los pesos son aleatorios y el artefacto no está pensado para evaluar rendimiento predictivo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,5 M de parámetros) y del orden de decenas de MB en float16/bfloat16, sin contar activaciones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e incluso en entornos sin GPU (CPU, Apple Silicon, entornos CI con recursos limitados).
- Opciones de despliegue: Transformers (`CLIPModel`, `CLIPProcessor`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de clasificación de este tipo.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, la latencia será de milisegundos en GPU y de decenas de milisegundos en CPU para lotes pequeños.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/clip-vit-base-patch32-mic | 3.505.280 | no disponible | Fixture de test (CLIP reducido, pesos aleatorios) | no disponible | Hugging Face |
| openai/clip-vit-base-patch32 | ~151 M (no confirmado en la informacion) | 77 tokens (estandar CLIP, no confirmado) | Clasificacion zero-shot imagen-texto real | no disponible en la informacion | Hugging Face |
| hf-internal-testing/mic-clip-vit-base-patch32-slim | no disponible | no disponible | Fixture slim equivalente para el mismo contrato | no disponible | Hugging Face (interno) |

La comparación relevante es contra el checkpoint original de OpenAI, del que este artefacto hereda arquitectura y procesador pero no pesos ni capacidad predictiva, y contra el fixture `hf-internal-testing/mic-clip-vit-base-patch32-slim`, que cubre el mismo contrato en el ámbito interno de Hugging Face.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y las predicciones no tienen significado semántico.
- El autor lo etiqueta como `test-artifact` y pide explícitamente excluirlo de la búsqueda de modelos candidatos; puede contaminar resultados si se filtra por descargas o por nombre.
- La licencia no está declarada en la información disponible; no debe asumirse uso comercial permitido.
- No se declaran idiomas soportados; el tokenizador copiado del CLIP original está pensado para inglés, pero no se confirma en esta ficha.
- El alcance de la validación es limitado: un pase del fixture y un pase del checkpoint real establecen acuerdo sobre entradas fijas y un runtime registrado, no corrección sobre entradas arbitrarias.
- No hay datos de benchmarks, sesgos, alucinación ni comportamiento en producción, porque el artefacto no está diseñado para ello.
- El tamaño del repo aparece como 0.0 GB, lo que sugiere que la información de tamaño puede ser aproximada o incompleta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/clip-vit-base-patch32-mic
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Fixture slim interno: https://huggingface.co/hf-internal-testing/mic-clip-vit-base-patch32-slim
- Documentación de uso en Transformers: https://huggingface.co/huggingface-mic/clip-vit-base-patch32-mic/blob/main/integrations/transformers/usage.md
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/clip-vit-base-patch32-mic/blob/main/integration.json
- Procedencia del fixture: https://huggingface.co/huggingface-mic/clip-vit-base-patch32-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/clip-vit-base-patch32-mic.html
- Repositorio de código `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
