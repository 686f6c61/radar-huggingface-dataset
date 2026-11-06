# huggingface-mic/docling-layout-heron-mic

## Resumen

`docling-layout-heron-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` que reproduce la arquitectura del modelo de deteccion de layout documental `docling-project/docling-layout-heron`. No es un modelo entrenado ni utilizable en produccion: sus pesos son aleatorios (semilla 17) y su unico proposito es servir como banco de pruebas para validar contratos de integracion con frameworks (Transformers, entre otros). El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

Tecnicamente es un modelo de deteccion de objetos basado en RT-DETR v2 (`RTDetrV2ForObjectDetection`), con 10.910.727 parametros totales, resultado de reducir la configuracion del checkpoint original (encoder de 1 capa, decoder de 2 capas) manteniendo los mismos nombres de tensores y los ficheros de procesador copiados byte a byte del modelo base. Se guarda en float32 y es finito en float32, bfloat16 y float16.

Su relevancia es metodologica mas que funcional: documenta un patron de "fixture" ligero que permite a los equipos de integracion verificar la sensibilidad de entradas, la compatibilidad de nombres de tensores y las expectativas de framework sin descargar ni ejecutar el modelo real de Docling. Para desarrolladores que trabajan en pipelines de conversion documental con Docling, sirve como referencia de la interfaz esperada, no como sustituto del modelo de layout real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR v2 (`RTDetrV2ForObjectDetection`), transformer de deteccion de objetos |
| Parametros totales | 10.910.727 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, con forward/loss/gradientes finitos en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RT-DETR v2 para deteccion de objetos, orientada a la deteccion de regiones de layout en paginas de documento (texto, tablas, figuras, encabezados, etc.). La configuracion del fixture reduce el encoder a 1 capa y el decoder a 2 capas mediante la regla generica de reduccion de `sweep.py` del repositorio `transformers-mic`, conservando la misma estructura de tensores que el checkpoint original de `docling-project/docling-layout-heron`.

No ha habido entrenamiento: los pesos son aleatorios (semilla 17) y se aceptaron porque superaron la puerta de sensibilidad de entradas, es decir, cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `pixel_values:halve`, lo hizo en 0,178). Los ficheros de procesador (`docling_heron_400.png`, `preprocessor_config.json`) se copiaron byte a byte del modelo base. El repositorio incluye el manifiesto de contrato (`integration.json`), la documentacion de uso en Transformers, las expectativas de framework y la procedencia del fixture (`build.json`), generados por `build_fixtures.py`.

## Capacidades

- Deteccion de layout documental: la arquitectura subyacente (RT-DETR v2) esta disenada para localizar y clasificar regiones en imagenes de pagina.
- Inferencia de contrato: permite ejecutar el forward pass con las mismas entradas y salidas esperadas que el modelo real, util para validar integraciones.
- Compatibilidad de framework: verifica que los nombres de tensores, el procesador y las expectativas de Transformers coinciden con el checkpoint de referencia.
- Pruebas de robustez numerica: forward, perdida y gradientes finitos en float32, bfloat16 y float16.
- Sensibilidad a entradas: cada perturbacion de las entradas del contrato produce un cambio medible en los logits (umbral minimo de 0,001).
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Validacion de integraciones con Transformers: usar el fixture para comprobar que el pipeline de carga, preprocesado y salida de `RTDetrV2ForObjectDetection` funciona antes de conectar el checkpoint real de Docling.
- Pruebas de CI/CD de codigo de inferencia: ejecutar el modelo en tests automatizados ligeros (10,9 M de parametros) sin descargar el modelo completo, verificando que no se rompen los nombres de tensores ni las formas de salida.
- Desarrollo de procesadores de documento: probar el preprocesado de imagenes de pagina (redimensionado, normalizacion) contra el `preprocessor_config.json` copiado del modelo base.
- Verificacion de compatibilidad de dtypes: comprobar que un pipeline de despliegue en bfloat16 o float16 no produce NaN en forward, perdida ni gradientes.
- Pruebas de sensibilidad de entradas: validar que un cambio en las entradas del contrato se refleja en los logits, como test de regresion del propio codigo de integracion.
- Documentacion de contrato para equipos: servir como referencia ejecutable de la interfaz esperada (entradas, salidas, procesador) en la documentacion interna de un proyecto que use Docling.
- Reproduccion de fixtures: usar `build_fixtures.py` y `build.json` como plantilla para construir fixtures de otros modelos con el mismo patron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (mAP, precision, recall) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (10,9 M de parametros, aproximadamente 44 MB de pesos), y aun menor en bfloat16 o float16; el consumo dominante sera el de las activaciones de imagen, no el de los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Cabe en CPU para pruebas de CI.
- Cabe en GPU consumer: si, en cualquier modelo con al menos 1-2 GB de VRAM libre (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: Transformers (carga directa de safetensors), y cualquier runtime compatible con RT-DETR v2; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; al ser un fixture de pruebas, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Entrenado | Licencia | Proposito |
|---|---|---|---|---|---|
| `huggingface-mic/docling-layout-heron-mic` | 10,9 M | Deteccion de layout (RT-DETR v2) | No (pesos aleatorios) | no disponible | Fixture de pruebas |
| `docling-project/docling-layout-heron` | no disponible | Deteccion de layout (RT-DETR v2) | Si | no disponible | Modelo real de layout para Docling |
| Otros fixtures `huggingface-mic` | variable | Variable | No | no disponible | Artefactos de prueba de contrato |

La comparacion relevante es con el modelo base `docling-project/docling-layout-heron`: misma arquitectura y mismos nombres de tensores, pero con configuracion reducida y pesos aleatorios. Cualquier uso funcional de deteccion de layout debe hacerse con el modelo base, no con este fixture.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce detecciones utiles; cualquier salida es ruido estadistico.
- Artefacto de prueba: el autor lo etiqueta como `test-artifact` y advierte explicitamente de que no es un modelo utilizable.
- Sin datos de entrenamiento: no se ha entrenado con ningun corpus, por lo que no tiene sesgos de datos, pero tampoco capacidad predictiva.
- Licencia no disponible: al no declararse licencia, no se puede asumir permiso para uso comercial ni redistribucion; hay que consultar el repositorio del autor.
- Idiomas no disponibles: no aplica, al ser un modelo de vision sin capacidades linguisticas.
- Contexto no disponible: no es un modelo de lenguaje; no procesa texto de entrada.
- Configuracion reducida: encoder de 1 capa y decoder de 2 capas, distinta del checkpoint real, por lo que el comportamiento numerico no reproduce exactamente el del modelo base.
- No apto para produccion: no debe desplegarse en pipelines reales de conversion documental; para ello debe usarse `docling-project/docling-layout-heron`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/docling-layout-heron-mic
- Modelo base: https://huggingface.co/docling-project/docling-layout-heron
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/docling-layout-heron-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/docling-layout-heron-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/docling-layout-heron-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/docling-layout-heron-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/docling-layout-heron-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
