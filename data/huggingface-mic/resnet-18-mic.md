# huggingface-mic/resnet-18-mic

## Resumen

`huggingface-mic/resnet-18-mic` es un artefacto de prueba (fixture) publicado por el equipo de Hugging Face MIC a partir de `microsoft/resnet-18`. No es un modelo entrenado para resolver una tarea real: es una versión "slim" de los pesos de ResNet-18 con 11.699.112 parámetros, empaquetada junto con el manifiesto de contrato (`integration.json`), la documentación de uso para Transformers y las expectativas de framework. Su propósito es servir como fixture reproducible en tests de integración del ecosistema Transformers.

La arquitectura es una ResNet-18 estándar para clasificación de imágenes (`ResNetForImageClassification`), con los mismos nombres de tensor que el checkpoint original y guardada en float32, el dtype por defecto con el que carga `microsoft/resnet-18`. Los ficheros de procesador (`preprocessor_config.json`) se copian byte a byte del modelo base, de modo que el pipeline de preprocesado es idéntico al original.

La relevancia es acotada: el propio autor lo etiqueta como `test-artifact` para excluirlo de las búsquedas de modelos candidatos. Resulta útil para validar pipelines de carga, gates de sensibilidad a la entrada y compatibilidad de framework, pero no debe emplearse como modelo de producción para clasificación de imágenes. No se dispone de información sobre licencia, idiomas ni pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-18 (`ResNetForImageClassification`), red neuronal convolucional residual |
| Parámetros totales | 11.699.112 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible (pesos guardados en float32; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | microsoft/resnet-18 |
| Dtype de los pesos | float32 |
| Tamaño del repo | 0,1 GB |
| Descargas | 1307 |
| Likes | 0 |
| Etiquetas | safetensors, resnet, mic, test-artifact, base_model:microsoft/resnet-18, base_model:finetune:microsoft/resnet-18, region:us |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18, la CNN residual de 18 capas con conexiones skip, adaptada a clasificación de imágenes mediante la cabeza `ResNetForImageClassification`. El fixture conserva exactamente los mismos nombres de tensor que el checkpoint real de `microsoft/resnet-18` y todos sus parámetros, por lo que la estructura es idéntica al original. Los pesos se guardan en float32, el dtype con el que carga por defecto el modelo base.

No hay entrenamiento propio en este repositorio: se trata de un fixture derivado de `microsoft/resnet-18`. Según la model card, el checkpoint original tiene 11,7M de parámetros, por debajo del umbral de 20M bajo el cual la fuente se conserva entera, de modo que los pesos entrenados del checkpoint se mantienen sin cambios. Los ficheros de procesador (`preprocessor_config.json`) se copian byte a byte del modelo base. El fixture pasó un gate de sensibilidad a la entrada (el caso más débil, `pixel_values:reverse`, con valor 0,0151) y se verificó que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es `220cf2910e40` y cubre todos los checkpoints cuyos ficheros de procesador son byte-idénticos y cuya config coincide tras el proceso de shrink. El script de construcción es `build_fixtures.py` del repositorio `transformers-mic`.

## Capacidades

- Clasificación de imágenes: es la única capacidad funcional heredada de `microsoft/resnet-18`, mediante `ResNetForImageClassification`.
- Compatibilidad de framework: incluye manifiesto de contrato (`integration.json`), documentación de uso para Transformers y directorio de expectativas de framework, pensados para tests de integración.
- Verificación numérica: se declara finito en float32, bfloat16 y float16 (forward, loss y gradientes), lo que permite usarlo en tests de estabilidad numérica.
- Sensibilidad a la entrada: supera el gate de sensibilidad (`pixel_values:reverse`, 0,0151), útil para validar que el modelo responde a perturbaciones de entrada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión generativa ni audio; la visión es únicamente clasificación.

## Casos de uso

- Tests de integración de Transformers: cargar el fixture con `ResNetForImageClassification` y verificar que la API de carga, el mapeo de tensores y el preprocesado funcionan sin depender del checkpoint completo de 11,7M de parámetros.
- Validación de pipelines de preprocesado: al copiar `preprocessor_config.json` byte a byte del modelo base, permite comprobar que las transformaciones de imagen producen tensores con la forma y normalización esperadas.
- Pruebas de estabilidad numérica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar regresiones de precisión en el framework.
- Verificación de gates de sensibilidad: usar el resultado documentado (`pixel_values:reverse`, 0,0151) como referencia para validar que un cambio en el framework no altera la respuesta del modelo ante entradas perturbadas.
- CI de librerías de visión: integrar el fixture en pipelines de integración continua para detectar roturas en la carga de safetensors y en la resolución de la arquitectura ResNet.
- Reproducibilidad de fixtures: reconstruir el repositorio con `python example/build_fixtures.py --fixture resnet-18-mic` y comparar hashes de ficheros registrados en `build.json` para auditar la procedencia del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (ImageNet u otras), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 11,7M de parámetros en float32 los pesos ocupan aproximadamente 47 MB, y en float16 unos 23 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Cabe en RTX 4090, RTX 3090, RTX 3060 y GPUs de gama baja.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU.
- Opciones de despliegue: carga nativa con Transformers (`ResNetForImageClassification`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación de imágenes de este tamaño.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/resnet-18-mic | 11.699.112 | Clasificación de imágenes (fixture de test) | no aplica | no disponible | Hugging Face (repo público) |
| microsoft/resnet-18 | 11,7M (según model card) | Clasificación de imágenes | no aplica | no disponible en la información proporcionada | Hugging Face |
| Otros fixtures del proyecto MIC | no disponible | Tests de integración | no aplica | no disponible | Hugging Face |

La comparación directa con alternativas de producción no es significativa: el fixture replica la arquitectura y los pesos de `microsoft/resnet-18`, por lo que su comportamiento funcional es el del modelo base, pero su finalidad declarada es la validación de integraciones, no el uso en producción.

## Limitaciones y advertencias

- Es un artefacto de prueba (`test-artifact`), no un modelo usable en producción; el autor lo excluye explícitamente de la búsqueda de modelos candidatos.
- No se declara licencia, lo que impide determinar las condiciones de uso comercial.
- No se declaran idiomas soportados ni pipeline; la ausencia de pipeline complica el uso directo vía `pipeline()` sin configuración manual.
- No hay información sobre sesgos del modelo base ni sobre riesgos de alucinación; al ser un clasificador de imágenes, el riesgo relevante es de clasificación errónea, no de generación de texto.
- Los pesos son idénticos a los del checkpoint original según la model card, pero el repositorio no documenta métricas de precisión que permitan evaluar su calidad como clasificador.
- El repositorio depende de ficheros externos (`integration.json`, `integrations/transformers/usage.md`, `build.json`) para reproducir el contrato completo; sin ellos, el uso queda limitado a la carga de pesos.
- No apto para tareas de generación de texto, código, matemáticas, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/resnet-18-mic
- Modelo base: https://huggingface.co/microsoft/resnet-18
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/resnet-18-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/resnet-18-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/resnet-18-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/resnet-18-mic/blob/main/build.json
- Cómo se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/resnet-18-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
