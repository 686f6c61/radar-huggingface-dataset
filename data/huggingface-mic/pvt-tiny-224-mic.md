# huggingface-mic/pvt-tiny-224-mic

## Resumen

`pvt-tiny-224-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` a partir del modelo `Zetatech/pvt-tiny-224`, un clasificador de imagenes basado en la arquitectura Pyramid Vision Transformer (PVT). El modelo resultante conserva los pesos originales del checkpoint base, con 13.229.288 parametros, y anade documentacion de integracion, manifiestos de contrato y expectativas de framework para facilitar su uso con Transformers.

La model card es explicita al respecto: se trata de un *fixture* de test, no de un modelo utilizable en produccion, y esta etiquetado como `test-artifact` precisamente para excluirlo de las busquedas de modelos candidatos. Su interes es, por tanto, principalmente instrumental: sirve como referencia reproducible para validar integraciones, pipelines de evaluacion y contratos de API en torno a clasificadores PVT.

No se dispone de informacion sobre el proceso de entrenamiento del checkpoint base, los datos utilizados ni los resultados de evaluacion. La informacion disponible se limita a las especificaciones derivadas de los pesos (parametros, dtype, nombres de tensores) y a la documentacion de empaquetado del fixture.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer (PVT), clasificador de imagenes (`PvtForImageClassification`) |
| Parametros totales | 13.229.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, verificados como finitos en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible (clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pyramid Vision Transformer, un transformer jerarquico para vision que produce mapas de caracteristicas a multiples resoluciones y que, en esta variante, se configura como cabecera de clasificacion de imagenes (`PvtForImageClassification`). El checkpoint corresponde a la variante "tiny" con entrada de 224x224 pixeles del repositorio `Zetatech/pvt-tiny-224`.

No hay informacion disponible sobre el dataset de entrenamiento, el numero de tokens o imagenes vistas, ni sobre si se aplicaron tecnicas de ajuste fino adicionales como RLHF o DPO (no aplicables en un clasificador de vision). El fixture conserva los pesos entrenados del checkpoint original sin modificaciones, con los mismos nombres de tensores, y copia byte a byte el fichero `preprocessor_config.json` del modelo base. Segun la model card, los pesos pasaron un test de sensibilidad a la entrada (el mas debil, `pixel_values:roll_batch`, con valor 0.172) y son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Clasificacion de imagenes: el modelo expone una cabeza `PvtForImageClassification` sobre caracteristicas extraidas por el backbone PVT.
- Extraccion de caracteristicas visuales jerarquicas: la arquitectura PVT produce representaciones a varias escalas, aunque el fixture se distribuye con la cabeza de clasificacion.
- Compatibilidad con Transformers: incluye documentacion de uso (`integrations/transformers/usage.md`) y un directorio de expectativas de framework.
- Verificacion de integraciones: al conservar los nombres de tensores del checkpoint real y el preprocesador original, permite validar pipelines de carga, preprocesado e inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto ni capacidades multilingues: es un modelo puramente visual y de clasificacion.
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Validacion de integraciones con Transformers: usar el fixture para comprobar que una version concreta de la libreria carga correctamente un `PvtForImageClassification` con los nombres de tensores esperados y el `preprocessor_config.json` original.
- Tests de regresion en CI: incorporar el modelo como caso de prueba ligero (0.1 GB) para detectar roturas en el pipeline de carga de safetensors, conversion de dtypes o preprocesado de imagenes.
- Desarrollo de contratos de API: el repositorio incluye `integration.json`, lo que permite probar herramientas que consumen manifiestos de integracion y expectativas de framework sin depender de checkpoints grandes.
- Benchmarking de infraestructura de inferencia: con 13,2 M de parametros y pesos en float32, sirve para medir latencia base de carga y ejecucion en CPU/GPU antes de escalar a modelos mayores.
- Pruebas de cuantizacion y precision mixta: al estar verificado como finito en float32, bfloat16 y float16, se puede emplear para validar rutas de conversion y comprobar estabilidad numerica.
- Educacion y prototipado de clasificadores PVT: util para experimentar con la API de clasificacion de imagenes de Transformers sin descargar checkpoints de mayor tamano.
- Reproducibilidad de fixtures: el script `build_fixtures.py` y el fichero `build.json` permiten reconstruir el artefacto y auditar hashes y fuentes fijadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (13,2 M de parametros, aproximadamente 53 MB de pesos) mas el espacio de activaciones para una imagen de 224x224.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada moderna es mas que suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: Transformers (carga nativa del checkpoint), y en general cualquier runtime que soporte safetensors y la arquitectura PVT. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un coste de inferencia muy bajo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/pvt-tiny-224-mic` | 13,2 M | PVT, clasificacion de imagenes | imagen 224x224 | no disponible | Hugging Face (fixture de test) |
| `Zetatech/pvt-tiny-224` | 13,2 M (mismo checkpoint base) | PVT, clasificacion de imagenes | imagen 224x224 | no disponible | Hugging Face |
| Otros PVT tiny de la familia | no disponible | PVT, clasificacion de imagenes | imagen 224x224 | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Es un artefacto de prueba (`test-artifact`), no un modelo pensado para uso real; la propia model card indica que no es un modelo utilizable.
- No se ha publicado informacion sobre sesgos del checkpoint base ni sobre la composicion de sus datos de entrenamiento.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de clasificaciones erroneas fuera de la distribucion de entrenamiento del checkpoint original.
- No hay informacion sobre la licencia, lo que impide determinar si el uso comercial esta permitido; conviene consultar la licencia del modelo base `Zetatech/pvt-tiny-224` antes de cualquier uso.
- No se documentan idiomas soportados ni limitaciones de contexto, al tratarse de un modelo de vision.
- Para produccion, debe sustituirse por el checkpoint base completo o por un modelo entrenado y evaluado especificamente para la tarea; el fixture solo garantiza compatibilidad estructural, no calidad predictiva verificada.
- El repositorio es pequeno (0,1 GB) y esta pensado para tests; no incluye resultados de evaluacion que permitan estimar su precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/pvt-tiny-224-mic
- Modelo base: https://huggingface.co/Zetatech/pvt-tiny-224
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/pvt-tiny-224-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/pvt-tiny-224-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/pvt-tiny-224-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/pvt-tiny-224-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/pvt-tiny-224-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
