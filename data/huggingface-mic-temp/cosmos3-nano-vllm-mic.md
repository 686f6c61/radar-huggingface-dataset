# huggingface-mic-temp/Cosmos3-Nano-vllm-mic

## Resumen

Cosmos3-Nano-vllm-mic es un artefacto de prueba publicado por la organizacion huggingface-mic-temp. No es un modelo entrenado ni utilizable: se trata de un "fixture" reducido construido a partir de nvidia/Cosmos3-Nano para validar integraciones de frameworks (en concreto vLLM y Transformers) contra la arquitectura real del modelo original. El repositorio contiene pesos con la misma estructura de tensores que el checkpoint de referencia, pero con una configuracion encogida y pesos aleatorios.

El fixture conserva la clase de arquitectura `Cosmos3OmniForConditionalGeneration` del modelo base, con solo 2 capas ocultas en la torre de texto y 20.165.376 parametros totales. Los ficheros de procesador (tokenizer, configuraciones de preprocesado de imagen y video, plantilla de chat) se copian byte a byte desde nvidia/Cosmos3-Nano, de modo que las pruebas de integracion ejercitan el mismo pipeline de entrada que el modelo real.

Su relevancia es exclusivamente de ingenieria: permite a desarrolladores de frameworks comprobar carga, forward, backward y sensibilidad de entradas sin descargar ni ejecutar el modelo completo. El propio autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe emplearse para inferencia real ni para evaluacion de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3OmniForConditionalGeneration (multimodal, torre de texto reducida a 2 capas) |
| Parametros totales | 20.165.376 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base nvidia/Cosmos3-Nano mediante la clase `Cosmos3OmniForConditionalGeneration`, que combina procesamiento multimodal (texto, imagen y video, segun los ficheros `preprocessor_config.json` y `video_preprocessor_config.json` copiados) con una torre de lenguaje. La unica modificacion estructural es la reduccion del numero de capas ocultas de texto a 2, aplicada con la regla generica de `sweep.py` del proyecto transformers-mic.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una puerta de sensibilidad a entradas: cada perturbacion de las entradas del contrato movio los logits al menos 0.001 (el caso mas debil, `pixel_values:halve`, produjo 0.0769). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fichero `build.json` registra fuentes fijadas, resultados de la puerta y hashes de archivos.

## Capacidades

- No es un modelo funcional: no genera texto, codigo ni razonamiento con sentido.
- Conserva la interfaz multimodal de Cosmos3-Nano (entradas de texto, imagen y video) a efectos de prueba de integracion.
- Permite validar carga de pesos, forward, loss y gradientes en frameworks compatibles.
- Sirve para comprobar que un pipeline de preprocesado (tokenizer, image processor, video processor) funciona con la configuracion real del modelo base.
- No dispone de tool calling, capacidades de agente ni modo thinking utilizables.
- No tiene capacidades multilingues evaluables.

## Casos de uso

- Pruebas de integracion en vLLM: cargar el fixture para verificar que el parser de configuracion y el mapeo de tensores aceptan la arquitectura `Cosmos3OmniForConditionalGeneration` sin descargar el checkpoint completo.
- Validacion de pipelines de Transformers: ejecutar forward y backward sobre el fixture para comprobar compatibilidad de la clase con la version del framework en CI.
- Pruebas de preprocesado multimodal: usar los ficheros de procesador copiados byte a byte para verificar que imagen y video se transforman igual que en nvidia/Cosmos3-Nano.
- Test de sensibilidad de entradas en CI: reproducir la puerta del autor (perturbar entradas y comprobar que los logits cambian por encima de un umbral) como test de regresion.
- Desarrollo de herramientas de inspeccion de checkpoints: validar utilidades que leen nombres de tensores y configuraciones contra un repositorio pequeno y rapido de descargar.
- Pruebas de serializacion y dtype: comprobar comportamiento en float32, bfloat16 y float16 sin coste de memoria del modelo real.
- Banco de pruebas de empaquetado: verificar flujos de subida, hashes y manifiestos (`integration.json`, `build.json`) en el hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 20,2 M de parametros en bfloat16 (unos 40 MB de pesos); el consumo real dependera del pipeline de preprocesado y del framework.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16; tambien es viable en CPU para pruebas.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers y vLLM segun el contrato del repositorio; no se documentan otras.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas no son representativos del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-vllm-mic | 20,2 M (fixture) | no disponible | Pruebas de integracion | no disponible | Hugging Face (test-artifact) |
| nvidia/Cosmos3-Nano | no disponible en la informacion | no disponible | Modelo multimodal real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Pruebas de integracion | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa funcional con alternativas de la misma categoria.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no usar para inferencia, evaluacion ni produccion.
- Etiquetado como `test-artifact`: excluido deliberadamente de busquedas de modelos candidatos.
- Licencia no especificada en la informacion disponible; verificar antes de cualquier redistribucion.
- Configuracion encogida (2 capas de texto): no reproduce el comportamiento numerico del modelo base.
- Solo cubre checkpoints con ficheros de procesador identicos y configuracion coincidente tras el encogido (clave de fixture `248335337deb`).
- El repositorio no incluye todos los ficheros de uso; algunos deben regenerarse con `example/build_fixtures.py`.
- No hay informacion sobre sesgos, alucinacion o limitaciones idiomaticas porque el modelo no es funcional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/Cosmos3-Nano-vllm-mic
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Como se encogio el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Cosmos3-Nano-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
