# huggingface-mic/granite-vision-4.1-4b-mic

## Resumen

`huggingface-mic/granite-vision-4.1-4b-mic` es un artefacto de prueba (fixture) derivado de `ibm-granite/granite-vision-4.1-4b`, el modelo multimodal imagen-texto de IBM. Lo publica la organizacion `huggingface-mic` dentro de su infraestructura de cobertura de integraciones (MIC), y su proposito no es la inferencia real sino validar que el pipeline de Transformers carga, ejecuta y calcula gradientes correctamente para la arquitectura `Granite4VisionForConditionalGeneration`. Esta etiquetado explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El repositorio contiene pesos "slim" de 7.161.408 parametros con pesos aleatorios (semilla 17), generados reduciendo el modelo original: 2 capas en el encoder de vision, 2 capas en el modelo de texto y 1 capa en el qformer. Conserva exactamente los mismos nombres de tensores que el checkpoint real, los ficheros de procesador copiados byte a byte y el mismo dtype de carga (bfloat16). Esto lo convierte en una herramienta de validacion de contratos de integracion, no en un modelo utilizable para tareas reales.

Su relevancia es por tanto metodologica: permite a los mantenedores de Transformers verificar de forma determinista y ligera (repo de 0.0 GB) que la clase `Granite4VisionForConditionalGeneration` funciona de extremo a extremo (forward, loss, gradientes en float32, bfloat16 y float16) sin necesidad de descargar ni ejecutar el modelo completo de 4B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Granite4VisionForConditionalGeneration` (vision encoder + qformer + modelo de texto, configuracion reducida) |
| Parametros totales | 7.161.408 (fixture slim; el modelo base tiene 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), con ficheros de procesador y `chat_template.jinja` |
| Modelo base | `ibm-granite/granite-vision-4.1-4b` |
| Tipo de artefacto | test-artifact (fixture, no modelo usable) |
| Capas reducidas | vision: 2, texto: 2, qformer: 1 |
| Semilla de pesos | 17 (pesos aleatorios) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base de IBM: un encoder de vision seguido de un qformer y un modelo de lenguaje de tipo transformer, todo bajo la clase `Granite4VisionForConditionalGeneration`. La reduccion se aplico con la regla generica de `sweep.py` del repositorio `transformers-mic`, dejando 2 capas en el encoder visual, 2 en el modelo de texto y 1 en el qformer, manteniendo intactos los nombres de tensores respecto al checkpoint real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0.001 (la mas debil, `pixel_values:halve`, 0.135). El modelo se guardo en bfloat16, el dtype con el que carga por defecto `ibm-granite/granite-vision-4.1-4b`, y se verifico que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: al tener pesos aleatorios, no genera texto ni respuestas coherentes.
- Sirve como contrato ejecutable para validar la carga de `Granite4VisionForConditionalGeneration` en Transformers.
- Permite comprobar el flujo completo imagen-texto: procesador, `pixel_values`, forward, loss y retropropagacion.
- Incluye `chat_template.jinja` y todos los ficheros de procesador del modelo base, utiles para probar el pipeline de tokenizacion y preprocesado.
- Verifica compatibilidad numerica en float32, bfloat16 y float16.
- No dispone de tool calling, agentes, capacidades multilingues reales ni modo thinking; esas capacidades pertenecen al modelo base, no a este fixture.

## Casos de uso

- Validacion de integraciones en Transformers: ejecutar el fixture en CI para comprobar que la clase `Granite4VisionForConditionalGeneration` carga y hace forward sin errores antes de probar con el checkpoint real de 4B.
- Test de regresion de procesadores: al copiar byte a byte los ficheros de procesador del modelo base, permite detectar roturas en `processing.py`, `preprocessor_config.json` o el tokenizer sin depender del repo grande.
- Verificacion de gradientes: comprobar que loss y gradientes son finitos en float32, bfloat16 y float16 en pipelines de entrenamiento.
- Pruebas de contrato de entradas: usar la puerta de sensibilidad (perturbaciones como `pixel_values:halve`) para asegurar que los cambios en las entradas mueven los logits.
- Desarrollo de tooling de cobertura MIC: servir como caso de referencia para `build_fixtures.py` y `sweep.py` al anadir nuevos modelos al catalogo.
- Pruebas de carga en entornos con recursos limitados: con 7.2M parametros y repo de 0.0 GB, se puede desplegar en cualquier maquina para smoke tests de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica explicitamente que es un artefacto de prueba con pesos aleatorios, por lo que no procede evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia del fixture (7.2M parametros en bfloat16); el modelo base de 4B requeriria aproximadamente 8 GB en bfloat16.
- GPU recomendadas: cualquier GPU consumer (RTX 3060, RTX 4090) o incluso CPU es suficiente para el fixture.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requiere `custom_code`); no se ha validado vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al no ser un modelo funcional, no aplica medicion de rendimiento real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `huggingface-mic/granite-vision-4.1-4b-mic` | 7.2M (fixture) | no disponible | no disponible | Test artifact para validar integraciones |
| `ibm-granite/granite-vision-4.1-4b` | 4B | no disponible | no disponible | Modelo multimodal imagen-texto real |
| Otros fixtures MIC | variable | no disponible | no disponible | Validacion de contratos de otros modelos |

La comparativa directa con modelos de produccion no es significativa: este repositorio es una herramienta de test, no un modelo alternativo.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no debe usarse para inferencia real ni en produccion.
- Etiquetado como `test-artifact`: excluido intencionadamente de busquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar el uso comercial del fixture ni del modelo base a partir de la informacion proporcionada.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del repositorio.
- Los idiomas soportados no estan documentados.
- Cualquier capacidad funcional (vision, texto, tool calling) debe validarse contra `ibm-granite/granite-vision-4.1-4b`, no contra este fixture.
- El tamano del repo reportado (0.0 GB) y los metadatos pueden no reflejar el contenido completo; conviene revisar `build.json` para trazabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/granite-vision-4.1-4b-mic
- Modelo base: https://huggingface.co/ibm-granite/granite-vision-4.1-4b
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-vision-4.1-4b-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
