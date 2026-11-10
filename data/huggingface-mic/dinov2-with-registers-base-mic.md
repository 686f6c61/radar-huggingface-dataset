# huggingface-mic/dinov2-with-registers-base-mic

## Resumen

`dinov2-with-registers-base-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo utilizable en produccion: se trata de una version "slim" del checkpoint `facebook/dinov2-with-registers-base`, reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic` hasta 2 capas ocultas y con pesos aleatorios (semilla 17). Su proposito es servir como fixture de integracion para validar contratos de uso y expectativas de framework (Transformers) sin necesidad de descargar ni ejecutar el modelo real.

El modelo base, DINOv2 with registers, es un extractor de caracteristicas visuales auto-supervisado desarrollado por Meta AI. La variante "with registers" introduce tokens de registro en la arquitectura ViT para mitigar artefactos de atencion en los mapas de caracteristicas. El fixture conserva la misma arquitectura (`Dinov2WithRegistersModel`), los mismos nombres de tensores y los ficheros de procesador copiados byte a byte (`preprocessor_config.json`), pero con una configuracion drasticamente reducida.

Es relevante unicamente en el contexto de testing e integracion continua: permite verificar pipelines de carga, forward pass, gradientes y compatibilidad de framework con un consumo minimo de recursos. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. El dato de "226.112 parametros totales" en safetensors corresponde a esa version reducida, no al modelo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 with registers (Vision Transformer con tokens de registro), variante reducida a 2 capas ocultas |
| Parametros totales | 226.112 (fixture reducido; el modelo base completo no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (modelo de vision, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer (ViT) de tipo DINOv2 con tokens de registro, implementado como `Dinov2WithRegistersModel` en Transformers. El fixture replica la estructura del checkpoint original pero con `num_hidden_layers` reducido a 2 mediante la regla generica de `sweep.py`. Los ficheros de procesador (`preprocessor_config.json`) se copian byte a byte desde `facebook/dinov2-with-registers-base`, de modo que el preprocesado de entrada es identico al del modelo real.

Los pesos son aleatorios (semilla 17), no entrenados. El autor indica que superaron la "input-sensitivity gate": cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `pixel_values:halve`, registro 0,373), por lo que no fue necesario entrenamiento. El fixture conserva los mismos nombres de tensores que el checkpoint real y se guarda en float32, el dtype con el que carga por defecto el modelo base. Se declara finito en forward, loss y gradientes para float32, bfloat16 y float16. La clave de fixture `6c80810e54a5` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el proceso de reduccion.

## Capacidades

- No es un modelo funcional: no genera caracteristicas visuales utiles ni representaciones semanticas, ya que sus pesos son aleatorios.
- Sirve para validar la carga del modelo (`Dinov2WithRegistersModel`) y la compatibilidad de nombres de tensores con el checkpoint real.
- Permite verificar el pipeline de preprocesado de imagen con el `preprocessor_config.json` original.
- Soporta forward pass, calculo de loss y retropropagacion de gradientes en float32, bfloat16 y float16.
- Util como fixture en tests de integracion de Transformers y en validacion de contratos de framework.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo "thinking", vision generativa, audio ni ninguna capacidad generativa.

## Casos de uso

- Tests de integracion en CI/CD: cargar el fixture con `AutoModel` y ejecutar un forward pass para verificar que la integracion de DINOv2 with registers en Transformers no se rompe entre versiones, con un coste de descarga y computo minimo.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen (formas de entrada/salida, dtypes, nombres de tensores) sin necesidad de descargar el checkpoint completo.
- Pruebas de preprocesado de imagen: usar el `preprocessor_config.json` copiado byte a byte para verificar que el pipeline de imagenes produce tensores con las formas y normalizacion esperadas.
- Verificacion de precision mixta: ejecutar forward, loss y backward en float32, bfloat16 y float16 para validar que no aparecen NaN ni infinitos en las integraciones.
- Desarrollo de herramientas de empaquetado y serializacion: probar flujos de guardado/carga en safetensors y comparacion de hashes de ficheros con un modelo de tamano despreciable.
- Reproduccion de fixtures: reconstruir el artefacto con `build_fixtures.py --fixture dinov2-with-registers-base-mic` y comprobar que los hashes registrados en `build.json` coinciden, como test de reproducibilidad del pipeline de fixtures.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, los benchmarks carecen de sentido: no mide calidad de representacion visual.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB incluso en float32, dado el tamano de 226.112 parametros; cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte de PyTorch (por ejemplo, GTX 1060, RTX 3060, RTX 4090, A100, H100) es mas que suficiente.
- Cabe en GPU consumer: si, en todas las gamas, y tambien en CPU.
- Opciones de despliegue: Transformers (carga estandar con `AutoModel`), y cualquier runtime compatible con safetensors. No se documentan opciones especificas de vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles; por el tamano del fixture, el forward pass es practicamente instantaneo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dinov2-with-registers-base-mic (este) | 226.112 (fixture) | no aplica | no evaluable (pesos aleatorios) | no disponible | Hugging Face, etiquetado `test-artifact` |
| facebook/dinov2-with-registers-base | no disponible en la informacion | no aplica | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| facebook/dinov2-base | no disponible en la informacion | no aplica | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| facebook/dinov2-with-registers-large | no disponible en la informacion | no aplica | no disponible en la informacion | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen ningun valor semantico ni utilidad practica; no debe usarse para inferencia real.
- Etiquetado explicitamente como `test-artifact`: no debe incluirse en busquedas de modelos candidatos ni en seleccion de modelos para produccion.
- Licencia no declarada: no se puede asumir ninguna licencia de uso comercial; consultese el repositorio del modelo base para los terminos aplicables.
- Configuracion reducida (2 capas ocultas): no reproduce el comportamiento numerico del checkpoint real, solo la estructura y los nombres de tensores.
- Dependencia de la version de Transformers: los contratos y expectativas pueden quedar obsoletos si cambia la implementacion de `Dinov2WithRegistersModel`.
- No apto para tareas de vision por computador reales (clasificacion, segmentacion, retrieval) ni para generacion de texto.
- Riesgo de confusion: el nombre incluye "base" pero el modelo no corresponde al checkpoint base completo de DINOv2 with registers.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/dinov2-with-registers-base-mic
- Modelo base: https://huggingface.co/facebook/dinov2-with-registers-base
- Explicacion del proceso de reduccion del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/dinov2-with-registers-base-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/dinov2-with-registers-base-mic/blob/main/integration.json
- Uso con Transformers (`usage.md`): https://huggingface.co/huggingface-mic/dinov2-with-registers-base-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/dinov2-with-registers-base-mic/blob/main/build.json
