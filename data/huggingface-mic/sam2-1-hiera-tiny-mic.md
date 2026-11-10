# huggingface-mic/sam2.1-hiera-tiny-mic

## Resumen

`sam2.1-hiera-tiny-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo utilizable, sino de una version reducida artificialmente del modelo de segmentacion de video `facebook/sam2.1-hiera-tiny` de Meta, creada para validar contratos de integracion en el framework Transformers. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El fixture conserva la arquitectura `Sam2Model` pero con una configuracion drasticamente reducida: 1.901.169 parametros totales frente a los cientos de millones del checkpoint original. La reduccion se aplica mediante una regla generica del script `sweep.py` del repositorio `transformers-mic`, que en este caso reduce `mask_decoder` a 2 capas ocultas. Los ficheros de procesador se copian byte a byte del modelo original.

Su relevancia es puramente de ingenieria: sirve para verificar que las expectativas de integracion (formas de entrada, nombres de tensores, dtypes) coinciden con las del checkpoint real, sin necesidad de descargar ni ejecutar el modelo completo. Incluye pesos en safetensors, manifiesto de contrato (`integration.json`), documentacion de uso con Transformers y resultados de las puertas de validacion en `build.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sam2Model (transformer de segmentacion de video, variante Hiera) |
| Parametros totales | 1.901.169 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; probado en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (modelo de segmentacion visual) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SAM 2.1 (Segment Anything Model 2.1) en su variante `hiera-tiny`, un transformer jerarquico para segmentacion de imagen y video. El fixture mantiene la clase `Sam2Model` pero con una configuracion reducida: el `mask_decoder` se limita a 2 capas ocultas mediante la regla generica de reduccion de `sweep.py`. Los ficheros de procesador (`preprocessor_config.json`, `processor_config.json`, `sam2.1_hiera_t.yaml`, `video_preprocessor_config.json`) se copian byte a byte del checkpoint `facebook/sam2.1-hiera-tiny`, de modo que el pipeline de preprocesado es identico al del modelo real.

No hubo entrenamiento en el sentido habitual. El fixture se sobreajusta deliberadamente al paso de entrenamiento del contrato (50 pasos) para que supere la puerta de sensibilidad a la entrada: con pesos aleatorios, la perturbacion `pixel_values:reverse` solo movia los logits 1.2e-06, por debajo del umbral de 0.001. Los tensores conservan exactamente los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `b1ade3ded8b7` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion.

## Capacidades

- Segmentacion de video en streaming: el contrato asociado se denomina "SAM2 Video streaming segmentation".
- Segmentacion de imagen (capacidad heredada de la arquitectura SAM 2.1).
- Compatibilidad con la API de Transformers para `Sam2Model`, con expectativas de framework documentadas.
- Ejecucion en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- Nombres de tensores identicos al checkpoint real, lo que permite validar integraciones sin cargar el modelo completo.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- Validacion de integraciones en Transformers: el fixture permite comprobar que el codigo de carga, preprocesado y forward de `Sam2Model` funciona contra un checkpoint ligero antes de pasar al modelo real de cientos de millones de parametros.
- Pruebas de CI/CD en pipelines de vision: al ocupar practicamente 0 GB, se puede descargar y ejecutar en cada build para detectar regresiones en la API de segmentacion sin coste de ancho de banda ni GPU.
- Verificacion de contratos de framework: el directorio `integrations/transformers/expectations` define las formas y dtypes esperados, y el fixture sirve para comprobar que una implementacion los cumple.
- Desarrollo de herramientas de preprocesado de video: los ficheros de procesador copiados byte a byte permiten probar el pipeline de frames y mascaras con la misma configuracion que el modelo real.
- Test de puertas de sensibilidad a la entrada: el fixture esta sobreajustado para superar el umbral de 0.001 en la perturbacion `pixel_values:reverse`, lo que lo hace util para validar ese tipo de pruebas.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de puertas y hashes de ficheros, lo que permite reconstruir el artefacto con `python example/build_fixtures.py --fixture sam2.1-hiera-tiny-mic`.
- Docencia y experimentacion con SAM 2.1: permite explorar la estructura de tensores y la configuracion del modelo sin necesidad de recursos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta resultados de puertas internas: con pesos aleatorios, la perturbacion `pixel_values:reverse` movia los logits 1.2e-06 (por debajo del umbral 0.001), y tras el sobreajuste de 50 pasos el fixture supera dicha puerta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (1,9 M de parametros), despreciable en la practica.
- GPU recomendadas: cualquier GPU consumer, incluida una GTX 1050 o integrada; tambien ejecutable en CPU.
- Cabe en cualquier GPU consumer sin problema.
- Opciones de despliegue: Transformers (via `Sam2Model`), con la API estandar de carga de safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles; al ser un fixture de prueba no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/sam2.1-hiera-tiny-mic` | 1.901.169 | no disponible | Segmentacion de video (fixture) | no disponible | Hugging Face |
| `facebook/sam2.1-hiera-tiny` | no disponible en la informacion | no disponible | Segmentacion de video | no disponible | Hugging Face |
| `facebook/sam2.1-hiera-small` | no disponible en la informacion | no disponible | Segmentacion de video | no disponible | Hugging Face |
| `facebook/sam2.1-hiera-base-plus` | no disponible en la informacion | no disponible | Segmentacion de video | no disponible | Hugging Face |

La comparativa se limita a variantes de la misma familia SAM 2.1, ya que el fixture solo tiene sentido frente al checkpoint del que deriva. No se dispone de datos de parametros, contexto ni licencia de las variantes de Meta en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor lo etiqueta explicitamente como `test-artifact` y advierte de que no debe usarse para inferencia real.
- Los pesos estan sobreajustados a un unico paso de entrenamiento de 50 pasos; no generalizan a entradas reales.
- La configuracion esta reducida artificialmente (`mask_decoder` con 2 capas), por lo que el comportamiento no refleja el del checkpoint original.
- Licencia no disponible: no se puede asumir uso comercial sin consultar la licencia del modelo base `facebook/sam2.1-hiera-tiny`.
- Sin soporte de texto, tool calling ni agentes; cualquier caso de uso de NLP queda fuera de su alcance.
- Riesgo de confusion: al compartir nombre y arquitectura con el modelo real, podria descargarse por error en pipelines automatizados; la etiqueta `test-artifact` mitiga parcialmente este riesgo.
- El repositorio ocupa 0.0 GB y solo incluye pesos reducidos, uso y expectativas; otros ficheros deben regenerarse con `build_fixtures.py`.
- No se documentan sesgos ni riesgos de alucinacion porque el modelo no genera texto; el riesgo principal es de validacion incorrecta si se usa como sustituto del checkpoint real.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/sam2.1-hiera-tiny-mic
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-tiny
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/sam2.1-hiera-tiny-mic.html
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
