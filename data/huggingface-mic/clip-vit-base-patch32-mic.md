# huggingface-mic/clip-vit-base-patch32-mic

## Resumen

`huggingface-mic/clip-vit-base-patch32-mic` no es un modelo entrenado, sino un artefacto de prueba (fixture) publicado por el equipo de Hugging Face dentro de su iniciativa MIC (Model Integration Contract). Su objetivo es servir como contrato ejecutable de integración para el modelo `openai/clip-vit-base-patch32` en el ecosistema Transformers: un repositorio que contiene pesos reducidos, código de uso y expectativas de framework en un único lugar, de forma que las pruebas de integración puedan ejecutarse de manera rápida y determinista.

El artefacto replica la arquitectura `CLIPModel` pero con una configuración encogida: dos capas ocultas en el codificador de texto y dos en el codificador de visión, lo que resulta en 3.505.280 parámetros totales. Los pesos son aleatorios (semilla 17) y no proceden de entrenamiento alguno; se validaron mediante una puerta de sensibilidad a la entrada que exige que cualquier perturbación de las entradas del contrato mueva los logits al menos 0,001. Los ficheros del procesador (tokenizer, merges, vocabulario, configuración de preprocesado) se copiaron byte a byte del checkpoint original de OpenAI.

Es relevante ahora porque ejemplifica una práctica creciente en el mantenimiento de librerías de IA: separar la validación de la integración (procesador, firmas, formas de tensores, gradientes, claves de configuración) de la validación del comportamiento del modelo real. Para desarrolladores que contribuyen a Transformers o que construyen pipelines de CI sobre modelos CLIP, este repositorio documenta exactamente qué salidas se comprueban (`image_to_text`, `text_to_image`, `logits_per_image`, `training.loss`, `training.gradients`, entre otras) y cómo se comparan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (transformer dual: codificador de texto + codificador de visión ViT), configuración encogida a 2 capas ocultas por torre |
| Parametros totales | 3.505.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el texto se trunca según la configuración del procesador heredada de `openai/clip-vit-base-patch32`, típicamente 77 tokens, aunque no se confirma en la información) |
| Tipos de cuantizacion | no disponible (los pesos son finitos en float32, bfloat16 y float16 según la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | openai/clip-vit-base-patch32 (finetune/derivado) |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |
| Descargas | 3369 |
| Fecha de creación | 2026-10-07 |
| Última actualización | 2026-11-12 |

## Arquitectura y entrenamiento

La arquitectura es la de `CLIPModel` de Transformers: dos torres transformer, una para texto y otra para visión (ViT con parches de 32x32 en el modelo base original), que proyectan a un espacio latente compartido para el emparejamiento imagen-texto. En este artefacto, la configuración se ha reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`: `text num_hidden_layers = 2` y `vision num_hidden_layers = 2`. Los nombres de los tensores coinciden con los del checkpoint real, de modo que el código de carga y las comprobaciones de formas son representativas.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y pasaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (la más débil, `pixel_values:halve`, con 0,00487). Los ficheros del procesador (`merges.txt`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `openai/clip-vit-base-patch32`. El artefacto es finito en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes.

## Capacidades

- Ejecución del contrato de integración de CLIP en Transformers: carga con `CLIPProcessor` + `CLIPModel`, emparejamiento imagen-caption por lotes.
- Verificación de salidas `image_to_text`, `text_to_image` y `logits_per_image` sobre entradas fijas.
- Verificación de la ruta de entrenamiento: `training.loss`, `training.gradients` y `training.updated`.
- Comprobación de claves de configuración del procesador de imagen (`image_processor_config_keys`) y de entradas de texto (`text_kwargs_input_ids`).
- Compatibilidad de nombres de tensores con el checkpoint real, lo que permite validar código de carga sin descargar los pesos completos.
- No ofrece capacidades de modelo real: no genera texto, no clasifica imágenes de forma útil ni razona. Es un artefacto de prueba.

## Casos de uso

- Pruebas de integración en CI de Transformers: ejecutar el contrato sobre este fixture en cada PR para detectar regresiones en la API de `CLIPModel` y `CLIPProcessor` sin cargar el checkpoint completo de OpenAI, reduciendo tiempo y ancho de banda.
- Validación de nuevas versiones del framework: comprobar que los cambios en el cargador de safetensors, en la serialización del procesador o en el cálculo de gradientes mantienen las salidas esperadas sobre entradas fijas.
- Desarrollo de herramientas de comparación de checkpoints: usar `integration.json` como manifiesto de referencia para verificar que un checkpoint candidato comparte arquitectura, configuración tras el encogido y ficheros de procesador idénticos.
- Pruebas de precisión mixta: el fixture es finito en float32, bfloat16 y float16, por lo que sirve para validar rutas de forward, pérdida y gradientes en cada precisión sin depender de un modelo grande.
- Formación de contribuidores: el repositorio incluye documentación ejecutable (`integrations/transformers/usage.md`) escrita como markdown de doc-builder, útil para que nuevos contribuidores entiendan el contrato de integración de CLIP.
- Auditoría de reproducibilidad: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture proto-clip-vit-base-patch32-slim`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no está pensado para evaluación de calidad de modelo; sus únicas métricas registradas son las de la puerta de sensibilidad a la entrada (desplazamiento mínimo de logits de 0,001; caso más débil `pixel_values:halve` con 0,00487).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,5 M de parámetros, aproximadamente 14 MB solo en pesos, más overhead de activaciones y del procesador); cientos de MB en la práctica por el runtime de PyTorch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) y en entornos sin GPU.
- Opciones de despliegue: Transformers con PyTorch es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un artefacto de prueba de este tamaño).
- Latencia y throughput: no disponibles; al ser un fixture de 3,5 M de parámetros, la latencia es del orden de milisegundos en GPU y decenas de milisegundos en CPU, aunque no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/clip-vit-base-patch32-mic` | 3.505.280 | no disponible | Artefacto de prueba (fixture) para contrato de integración CLIP | no disponible | Hugging Face |
| `openai/clip-vit-base-patch32` | ~151 M (modelo CLIP ViT-B/32 original) | 77 tokens (configuración habitual) | Clasificación zero-shot imagen-texto | MIT (según el checkpoint original de OpenAI) | Hugging Face |
| `hf-internal-testing/mic-clip-vit-base-patch32-slim` | no disponible | no disponible | Fixture slim equivalente para pruebas internas | no disponible | Hugging Face (interno) |

La comparación relevante no es de rendimiento, sino de función: el artefacto MIC sustituye al checkpoint real únicamente en pruebas de integración; para cualquier uso real de CLIP debe emplearse `openai/clip-vit-base-patch32` u otro checkpoint entrenado.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y el autor lo etiqueta explícitamente como `test-artifact` para excluirlo de la búsqueda de modelos.
- Un pase del fixture y un pase del checkpoint real tienen alcances distintos: establecen acuerdo sobre entradas fijas y un runtime registrado, no corrección sobre entradas arbitrarias.
- No se declara licencia, lo que impide asumir derechos de uso comercial; debe tratarse como artefacto interno de pruebas hasta que el autor la especifique.
- Los idiomas soportados no están declarados; el tokenizer se hereda del checkpoint original, pero no se garantiza comportamiento multilingüe útil.
- La configuración encogida (2 capas por torre) no representa la profundidad del CLIP real, por lo que las formas de activaciones y los tiempos no son extrapolables.
- Riesgo de confusión en pipelines automáticos: si se indexa por error como modelo de producción, producirá salidas sin significado semántico.
- No se publican cifras de latencia, throughput ni benchmarks de calidad; cualquier estimación debe hacerse por medición propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/clip-vit-base-patch32-mic
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Fixture slim interno: https://huggingface.co/hf-internal-testing/mic-clip-vit-base-patch32-slim
- Documentación de cómo se encogió el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/clip-vit-base-patch32-mic.html
- Repositorio `transformers-mic` (script `sweep.py` y `build_fixtures.py`): https://github.com/huggingface/transformers-mic
