# huggingface-mic/mobilenet_v2_1.0_224-mic

## Resumen

`mobilenet_v2_1.0_224-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` dentro del proyecto transformers-mic. No es un modelo entrenado para uso real: reproduce la arquitectura y los pesos del clasificador de imágenes `google/mobilenet_v2_1.0_224` en una versión reducida de 3.540.265 parámetros, pensada para validar contratos de integración con Transformers. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El modelo base es MobileNetV2, una red convolucional ligera diseñada por Google para clasificación de imágenes en entornos con recursos limitados, con resolución de entrada de 224x224 y factor de anchura 1.0. Esta variante conserva los mismos nombres de tensores que el checkpoint original y copia byte a byte el fichero de preprocesado (`preprocessor_config.json`), de modo que sirve como sustituto verificable en pruebas de infraestructura.

Su relevancia es, por tanto, instrumental: permite a los desarrolladores del ecosistema Transformers comprobar la carga, la sensibilidad a las entradas y la estabilidad numérica del pipeline de clasificación de imágenes sin descargar el checkpoint completo. No debe emplearse en producción ni como modelo de clasificación real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN con bloques residuales invertidos y convoluciones separables en profundidad) |
| Parametros totales | 3.540.265 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura corresponde a `MobileNetV2ForImageClassification`, la implementación de MobileNetV2 en Transformers, con 3.540.265 parámetros. MobileNetV2 emplea bloques residuales invertidos con convoluciones separables en profundidad, lo que reduce el coste computacional frente a CNN convencionales. La resolución de entrada es de 224x224 píxeles y el factor de anchura es 1.0.

No se ha realizado entrenamiento nuevo para este artefacto: el autor indica que se conservan "los pesos propios del checkpoint, sin cambios", y que al tener 3.5M parámetros no supera el umbral de 20M por debajo del cual la fuente se mantiene íntegra. Los ficheros de preprocesado se copian byte a byte desde `google/mobilenet_v2_1.0_224`. El fixture supera una puerta de sensibilidad a la entrada (el caso más débil, `pixel_values:reverse`, obtiene 1.12) y se verifica que es finito en float32, bfloat16 y float16 en forward, pérdida y gradientes. El proceso de construcción está documentado en `build_fixtures.py` del repositorio transformers-mic y los hashes y resultados se registran en `build.json`.

## Capacidades

- Clasificación de imágenes a 224x224 píxeles, heredada de la arquitectura MobileNetV2.
- Carga mediante la API de Transformers como `MobileNetV2ForImageClassification`.
- Compatibilidad de nombres de tensores con el checkpoint original `google/mobilenet_v2_1.0_224`.
- Ejecución en float32, bfloat16 y float16 sin valores no finitos en forward, pérdida ni gradientes.
- Uso como fixture de pruebas para validar contratos de integración y expectativas de framework.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Pruebas de integración en Transformers: el fixture permite verificar que el pipeline de clasificación de imágenes carga correctamente sin descargar el checkpoint completo de MobileNetV2.
- Validación de contratos de framework: los directorios `integrations/transformers/expectations` permiten comprobar que una versión de Transformers cumple las expectativas de carga y ejecución definidas por el proyecto.
- Pruebas de sensibilidad a entradas: la puerta `pixel_values:reverse` (valor 1.12) sirve para detectar regresiones en el preprocesado de imágenes.
- Verificación de estabilidad numérica: al ser finito en float32, bfloat16 y float16, se usa para probar rutas de precisión mixta y half precision en GPUs.
- CI/CD de la librería: al ocupar 0.0 GB en el repositorio, puede descargarse en cada ejecución de tests sin penalizar el ancho de banda.
- Reproducción de fixtures: el script `build_fixtures.py` permite reconstruir el artefacto y comparar hashes, útil para auditar cambios en el pipeline de generación de fixtures.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3.5M parámetros, aproximadamente 14 MB de pesos); en float16, unos 7 MB.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; también funciona en CPU sin requisitos relevantes.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna; el cuello de botella es la operación convolucional, no la memoria.
- Opciones de despliegue: Transformers con PyTorch (ruta principal documentada en `integrations/transformers/usage.md`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tamaño.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/mobilenet_v2_1.0_224-mic | 3.540.265 | 224x224 | Clasificación de imágenes (fixture) | no disponible | Hugging Face |
| google/mobilenet_v2_1.0_224 | no disponible en la información | 224x224 | Clasificación de imágenes | no disponible | Hugging Face |
| Otros modelos de clasificación ligeros (p. ej. MobileNetV3, EfficientNet-B0) | no disponible en la información | variable | Clasificación de imágenes | no disponible | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; el único dato verificable es que este artefacto replica la arquitectura y los pesos del checkpoint de Google con un subconjunto reducido de parámetros.

## Limitaciones y advertencias

- Es un artefacto de prueba (`test-artifact`) y no un modelo usable: no debe emplearse para clasificación real ni en producción.
- Los pesos están reducidos a 3.5M parámetros, por lo que la precisión de clasificación será muy inferior a la del checkpoint original.
- No se especifica licencia, lo que impide determinar las condiciones de uso comercial.
- No se documentan sesgos, pero al derivar de un checkpoint de clasificación de imágenes hereda los sesgos del dataset original de ImageNet, no detallados aquí.
- Riesgo de alucinación no aplicable (no genera texto); el riesgo equivalente es la clasificación errónea de imágenes fuera de distribución.
- No soporta idiomas ni texto: cualquier uso con datos textuales es inválido.
- El repositorio no incluye todos los ficheros de integración; deben reconstruirse con `python example/build_fixtures.py --fixture mobilenet_v2_1.0_224-mic`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/mobilenet_v2_1.0_224-mic
- Modelo base: https://huggingface.co/google/mobilenet_v2_1.0_224
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/mobilenet_v2_1.0_224-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/mobilenet_v2_1.0_224-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/mobilenet_v2_1.0_224-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/mobilenet_v2_1.0_224-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mobilenet_v2_1.0_224-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
