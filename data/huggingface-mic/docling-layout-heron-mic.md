# huggingface-mic/docling-layout-heron-mic

## Resumen

`huggingface-mic/docling-layout-heron-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` para validar la integracion del modelo de deteccion de layout `docling-project/docling-layout-heron` en el ecosistema Transformers. No es un modelo entrenado ni utilizable en produccion: se trata de una version reducida ("slim") del checkpoint original, con la misma arquitectura (`RTDetrV2ForObjectDetection`) pero con una configuracion mucho mas pequena (1 capa de encoder y 2 de decoder) y pesos inicializados aleatoriamente con semilla 17.

El proposito del repositorio es servir como contrato ejecutable: incluye los pesos reducidos, ejemplos de uso con Transformers, un manifiesto de integracion (`integration.json`) y las expectativas del framework, de modo que los tests de integracion puedan verificar que la arquitectura y los nombres de tensores coinciden con el checkpoint real. El modelo original cubre la deteccion de regiones de layout en documentos (texto, tablas, figuras, etc.) dentro del pipeline de Docling, pero este fixture no hereda ninguna capacidad predictiva real.

Por su naturaleza, no debe confundirse con un modelo de layout detection funcional: los pesos son aleatorios y el modelo esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. Su relevancia es exclusivamente para desarrolladores que mantienen la integracion de Docling/RT-DETR v2 en Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR v2 (`RTDetrV2ForObjectDetection`), transformer de deteccion de objetos |
| Parametros totales | 10.910.727 (10,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en float32; se declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RT-DETR v2 para deteccion de objetos, implementada en Transformers como `RTDetrV2ForObjectDetection`. La version fixture reduce la profundidad del encoder a 1 capa y del decoder a 2 capas mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, conservando los mismos nombres de tensores que el checkpoint original `docling-project/docling-layout-heron`. Los ficheros de procesador (`docling_heron_400.png`, `preprocessor_config.json`) se copian byte a byte desde el modelo base.

No hubo entrenamiento: los pesos son aleatorios (semilla 17) y se validaron unicamente con una "input-sensitivity gate" que exige que cada perturbacion de las entradas mueva los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,178). El fixture se guarda en float32 y se verifica que forward, loss y gradientes son finitos en float32, bfloat16 y float16. No se dispone de informacion sobre datos de entrenamiento, tokens, RLHF/DPO ni innovaciones tecnicas del modelo original mas alla de su condicion de detector de layout basado en RT-DETR v2.

## Capacidades

- Deteccion de layout documental en el modelo base (regiones como texto, tablas, figuras), segun la descripcion del contrato "RT-DETR v2 layout detection".
- Ejecucion de forward, calculo de loss y gradientes en float32, bfloat16 y float16 (verificado en el fixture).
- Compatibilidad con la API de Transformers para `RTDetrV2ForObjectDetection`.
- Nombres de tensores identicos al checkpoint real, lo que permite validar cargas y contratos de integracion.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No es un modelo utilizable para inferencia real: los pesos son aleatorios.

## Casos de uso

- Test de integracion en Transformers: usar el fixture para verificar que `RTDetrV2ForObjectDetection` carga, ejecuta forward y calcula gradientes sin errores en CI.
- Validacion de contrato de pesos: comprobar que los nombres de tensores y la configuracion coinciden con `docling-project/docling-layout-heron` antes de publicar actualizaciones.
- Pruebas de compatibilidad de dtype: ejecutar el modelo en float32, bfloat16 y float16 para detectar regresiones numericas en el framework.
- Desarrollo de pipelines de Docling sin GPU: al tener solo 10,9 M de parametros, permite probar el flujo de preprocesado y postprocesado en entornos con recursos minimos.
- Regression testing de procesadores: validar que los ficheros `preprocessor_config.json` y `docling_heron_400.png` se cargan correctamente tras cambios en Transformers.
- Documentacion ejecutable: servir como ejemplo reproducible de uso de RT-DETR v2 en Transformers para nuevos contribuidores.
- Benchmarking de infraestructura de tests: medir tiempos de carga y ejecucion de un modelo de deteccion en pipelines de integracion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (10,9 M de parametros, aproximadamente 44 MB de pesos) y aun menor en float16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, e incluso GPUs integradas) y en CPU.
- Opciones de despliegue: Transformers (uso principal segun el repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; al ser un fixture de 10,9 M de parametros, la latencia esperada es muy baja, pero no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/docling-layout-heron-mic | 10,9 M | Fixture de test (RT-DETR v2) | no disponible | no disponible | Hugging Face |
| docling-project/docling-layout-heron | no disponible | Deteccion de layout documental | no disponible | no disponible | Hugging Face |
| Otros detectores RT-DETR v2 en Transformers | variable | Deteccion de objetos | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo funcional: los pesos son aleatorios (semilla 17) y las predicciones no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe usarse en produccion.
- La licencia no esta disponible, lo que impide confirmar condiciones de uso comercial.
- No se declaran idiomas soportados ni contexto textual; es un modelo puramente de vision.
- La configuracion reducida (1 capa de encoder, 2 de decoder) difiere del checkpoint real, por lo que el comportamiento numerico no es representativo.
- Riesgo de confusion: el nombre puede llevar a pensar que es una version ligera utilizable del modelo de Docling; no lo es.
- No se han publicado benchmarks ni evaluaciones de sesgo o alucinacion (no aplica al no ser generativo).

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/docling-layout-heron-mic
- Modelo base: https://huggingface.co/docling-project/docling-layout-heron
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/docling-layout-heron-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
