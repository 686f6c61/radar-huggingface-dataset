# huggingface-mic/swin-tiny-patch4-window7-224-mic

## Resumen

`huggingface-mic/swin-tiny-patch4-window7-224-mic` es un artefacto de prueba (fixture) publicado por el equipo de `huggingface-mic`, no un modelo entrenado ni utilizable para inferencia real. Se presenta como una version "slim" del modelo `microsoft/swin-tiny-patch4-window7-224`, una red Swin Transformer para clasificacion de imagenes, pero con la configuracion reducida a 2 capas y pesos generados aleatoriamente (semilla 17). El repositorio incluye pesos, ejemplos de uso con Transformers y un manifiesto de contrato (`integration.json`) que define las expectativas del framework.

El objetivo declarado es servir como fixture de integracion: comprobar que las herramientas de Transformers cargan, ejecutan y validan correctamente un modelo con la misma arquitectura, los mismos nombres de tensores y el mismo procesador que el checkpoint real, pero con un coste minimo de almacenamiento y computo. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Con solo 5.404.470 parametros y pesos aleatorios, este repositorio no debe emplearse para clasificacion de imagenes en produccion ni para evaluacion de calidad. Su interes es exclusivamente de ingenieria: validar pipelines de carga, compatibilidad de dtypes y contratos de integracion en torno a la familia Swin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (`SwinForImageClassification`), variante reducida (num_layers = 2) |
| Parametros totales | 5.404.470 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada de imagen 224x224, patch 4, ventana 7) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una Swin Transformer para clasificacion de imagenes, instanciada como `SwinForImageClassification`. Respecto al checkpoint original `microsoft/swin-tiny-patch4-window7-224`, la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic` (num_layers = 2). Se conservan los nombres de tensores del checkpoint real y el fichero `preprocessor_config.json` copiado byte a byte, de modo que el preprocesado de imagen (tamano 224, patch 4, ventana 7) coincide con el del modelo original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `pixel_values:reverse`, obtuvo 0,201). Los pesos se guardaron en float32, el dtype con el que carga por defecto el checkpoint base, y se verifico que la forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. El fixture cubre cualquier checkpoint cuyos ficheros de procesador sean identicos byte a byte y cuya config coincida tras el proceso de reduccion (clave de fixture `2e18e13cfb5e`).

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen clasificaciones significativas.
- Carga y ejecucion con Transformers mediante `SwinForImageClassification`, con los mismos nombres de tensores que el checkpoint real.
- Preprocesado de imagen compatible con `microsoft/swin-tiny-patch4-window7-224` (mismo `preprocessor_config.json`).
- Verificacion de estabilidad numerica en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- Validacion de contratos de integracion a traves de `integration.json` y del directorio `integrations/transformers/expectations`.
- No dispone de tool calling, agentes, razonamiento multi-paso, capacidades multilingues, thinking mode, vision generativa ni audio.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture y ejecutar una forward para comprobar que la clase `SwinForImageClassification` y el pipeline de vision funcionan sin descargar el checkpoint completo de Microsoft.
- Validacion de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para verificar que una version de Transformers cumple las expectativas declaradas sobre entradas, salidas y dtypes.
- CI/CD de librerias de vision: incluir el fixture en la bateria de tests de una libreria para detectar regresiones en la carga de safetensors, en el preprocesado o en el manejo de dtypes sin coste de almacenamiento (repo de 0,0 GB).
- Pruebas de estabilidad numerica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para comprobar que un pipeline de entrenamiento o mixed precision no produce NaN ni infinitos.
- Desarrollo de utilidades de preprocesado: validar que un procesador de imagen propio genera tensores compatibles con el contrato del modelo base usando el `preprocessor_config.json` copiado.
- Formacion y demos de tooling: ilustrar como se construye un fixture "slim" reproducible (build.json con fuentes fijadas, hashes y resultados de la puerta de sensibilidad) para equipos que mantienen suites de integracion de modelos.
- Verificacion de compatibilidad de checkpoints: comprobar que herramientas que inspeccionan nombres de tensores y configuracion funcionan igual sobre el fixture y sobre el checkpoint real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (accuracy, F1, top-1) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (5,4 M de parametros, aproximadamente 22 MB de pesos) y aun menor en float16 o bfloat16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100, H100 ni RTX 4090. Cabe en GPUs integradas y en CPU.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050, RTX 4090 y similares, y tambien en CPU.
- Opciones de despliegue: Transformers (carga directa con `SwinForImageClassification`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas y 5,4 M de parametros, la latencia sera minima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Proposito |
|---|---|---|---|---|---|
| `huggingface-mic/swin-tiny-patch4-window7-224-mic` | 5.404.470 | Clasificacion de imagenes (fixture) | Imagen 224x224 | no disponible | Artefacto de prueba |
| `microsoft/swin-tiny-patch4-window7-224` | no disponible en la informacion | Clasificacion de imagenes | Imagen 224x224 | no disponible en la informacion | Modelo real entrenado |
| Otros fixtures de `huggingface-mic` | no disponible | Pruebas de integracion | no disponible | no disponible | Artefactos de prueba |

La comparacion relevante es con el checkpoint base de Microsoft, del que este repositorio es una version reducida y con pesos aleatorios. No se dispone de datos de parametros, licencia ni rendimiento del modelo original en la informacion proporcionada, por lo que no se puede completar una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce clasificaciones correctas ni significativas; no debe usarse para inferencia real.
- Artefacto de prueba: el autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos; no es un modelo utilizable.
- Configuracion reducida: solo 2 capas frente a la configuracion completa del Swin Tiny original, por lo que no representa el comportamiento del checkpoint real.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base `microsoft/swin-tiny-patch4-window7-224`.
- Sin datos de sesgo ni de alucinacion: al no haber entrenamiento, no aplican sesgos aprendidos, pero tampoco hay garantias de comportamiento.
- Sin soporte linguistico ni multimodal generativo: es exclusivamente un clasificador de imagenes.
- Ambito limitado: solo cubre checkpoints con procesador identico byte a byte y config coincidente tras la reduccion (clave de fixture `2e18e13cfb5e`).
- No apto para produccion: su uso previsto es CI, validacion de contratos y pruebas de integracion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/swin-tiny-patch4-window7-224-mic
- Modelo base: https://huggingface.co/microsoft/swin-tiny-patch4-window7-224
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/swin-tiny-patch4-window7-224-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/swin-tiny-patch4-window7-224-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/swin-tiny-patch4-window7-224-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/swin-tiny-patch4-window7-224-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/swin-tiny-patch4-window7-224-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
