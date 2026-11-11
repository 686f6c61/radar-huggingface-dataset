# huggingface-mic/detr-mic

## Resumen

`detr-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` bajo el identificador `huggingface-mic/detr-mic`. No se trata de un modelo entrenado ni utilizable en produccion: la propia model card lo etiqueta explicitamente como `test-artifact` y lo describe como un *fixture* (un modelo reducido y con pesos aleatorios) derivado de `facebook/detr-resnet-50`, el conocido detector de objetos basado en transformers de Facebook AI Research.

El proposito del repositorio es servir como caso de prueba para validar contratos de integracion de frameworks (en este caso, Transformers), verificando que la carga, la ejecucion y las expectativas de entrada/salida de DETR se comportan de forma consistente. El fixture conserva la misma arquitectura (`DetrForObjectDetection`) y los mismos nombres de tensores que el checkpoint real, pero reduce el numero de capas del encoder y del decoder a 2 cada una, resultando en 23.880.800 parametros y un repositorio de aproximadamente 0,1 GB.

Es relevante unicamente en el contexto de ingenieria de software y testing de pipelines de ML: permite validar rapidamente integraciones con DETR sin descargar ni ejecutar el modelo completo. Cualquier uso como modelo de deteccion real produciria salidas sin sentido, ya que los pesos son aleatorios (semilla 17).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (transformer encoder-decoder para deteccion de objetos), variante `DetrForObjectDetection` |
| Parametros totales | 23.880.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DETR original: un backbone convolucional (en el modelo base, ResNet-50) que extrae caracteristicas, seguido de un transformer encoder-decoder que produce un conjunto fijo de predicciones de objetos mediante matching bipartito. En este fixture se mantiene la clase `DetrForObjectDetection` pero se reduce la configuracion a `encoder_layers = 2` y `decoder_layers = 2`, aplicando la regla generica de reduccion del script `sweep.py` del repositorio `transformers-mic`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron mediante `build_fixtures.py`. Para aceptarlos se aplico una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debia mover los logits al menos 0,001 (la mas debil, `pixel_values:swap_channels`, produjo 0,0992). Los ficheros del procesador (`preprocessor_config.json`) se copiaron byte a byte desde `facebook/detr-resnet-50`. El fixture se guardo en float32, el dtype por defecto del checkpoint real, y se verifico que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: no detecta objetos reales ni produce predicciones con significado.
- Sirve como fixture de integracion para validar la carga de `DetrForObjectDetection` en Transformers.
- Mantiene los mismos nombres de tensores que el checkpoint real `facebook/detr-resnet-50`, lo que permite probar rutas de carga y mapeo de pesos.
- Conserva el `preprocessor_config.json` original byte a byte, util para probar el pipeline de preprocesado de imagenes.
- Verificado para ejecucion en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Testing de integracion en Transformers: cargar el fixture con `DetrForObjectDetection.from_pretrained` para verificar que la clase, la configuracion y el mapeo de pesos funcionan sin descargar el modelo completo de ~160 MB.
- Validacion de pipelines de CI/CD: incluir el fixture en la suite de tests del repositorio para comprobar que los cambios en el codigo de carga de DETR no rompen la compatibilidad, con un coste de descarga de solo 0,1 GB.
- Pruebas de preprocesado de imagenes: usar el `preprocessor_config.json` copiado del modelo original para validar redimensionado, normalizacion y conversion de canales en el pipeline de entrada.
- Verificacion de dtypes: comprobar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16, util para validar rutas de mixed precision.
- Desarrollo de herramientas de inspeccion de modelos: al conservar los nombres de tensores del checkpoint real, sirve para probar utilidades que enumeran, comparan o auditan pesos sin necesidad del modelo completo.
- Reproduccion de contratos de framework: el manifest `integration.json` y el directorio `integrations/transformers/expectations` permiten validar que un framework cumple las expectativas declaradas de entrada/salida para DETR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de deteccion (AP, mAP) careceria de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 23,88 M de parametros, mas el espacio de activaciones del forward (dependiente del tamano de imagen de entrada).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o mas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con soporte CUDA, e incluso en CPU para pruebas de integracion.
- Opciones de despliegue: Transformers (ruta principal documentada en `integrations/transformers/usage.md`); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este artefacto y no aplican a un detector DETR.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/detr-mic` | 23,88 M | DETR reducido (2+2 capas), pesos aleatorios | Fixture de testing | no disponible | Hugging Face |
| `facebook/detr-resnet-50` | ~41,6 M (backbone ResNet-50 + transformer completo) | DETR completo | Deteccion de objetos real | Apache 2.0 (segun el modelo original) | Hugging Face |
| `facebook/detr-resnet-101` | ~60 M | DETR completo con backbone ResNet-101 | Deteccion de objetos real | Apache 2.0 (segun el modelo original) | Hugging Face |

La comparacion con modelos de deteccion reales solo es valida a efectos de forma: el fixture replica la interfaz de DETR pero no su funcion. No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y las predicciones no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no declarada en la informacion disponible; conviene verificar los terminos antes de cualquier redistribucion.
- Idiomas y dominio no aplicables: es un modelo de vision, no de texto.
- La configuracion reducida (2 capas de encoder y 2 de decoder) no representa la capacidad del DETR original.
- Las expectativas de integracion estan atadas a una version concreta del codigo de Transformers; cambios en el framework pueden invalidarlas.
- No hay garantia de mantenimiento ni de actualizacion del fixture.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/detr-mic
- Modelo base: https://huggingface.co/facebook/detr-resnet-50
- Manifest de contrato: https://huggingface.co/huggingface-mic/detr-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/detr-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/detr-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/detr-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/detr-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
