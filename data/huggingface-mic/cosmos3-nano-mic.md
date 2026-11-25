# huggingface-mic/Cosmos3-Nano-mic

## Resumen

Cosmos3-Nano-mic es un repositorio publicado por el usuario `huggingface-mic` que contiene un *fixture* de pruebas, no un modelo funcional. Se trata de una version reducida artificialmente del checkpoint `nvidia/Cosmos3-Nano`, con solo 20,2 millones de parametros (frente a los miles de millones del modelo original) y pesos inicializados de forma aleatoria con semilla 17. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El proposito del artefacto es servir como banco de pruebas para la integracion del modelo Cosmos3 en la libreria Transformers. Conserva la misma arquitectura (`Cosmos3OmniForConditionalGeneration`) y los mismos nombres de tensores que el checkpoint real, pero con la torre de texto reducida a 2 capas ocultas. Los ficheros de procesador (tokenizer, chat template, preprocessor de video, documentos de seguridad y privacidad) se copian byte a byte desde el modelo original.

Es relevante unicamente en el contexto de desarrollo y validacion de infraestructura de inferencia: permite verificar que el pipeline de Transformers carga, ejecuta y propaga gradientes correctamente para la arquitectura Cosmos3 sin necesidad de descargar ni ejecutar el modelo completo. No debe emplearse para generacion de texto, vision ni ninguna tarea de produccion, ya que sus pesos no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3OmniForConditionalGeneration (transformer multimodal, torre de texto reducida a 2 capas) |
| Parametros totales | 20.165.312 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32 y bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la clase `Cosmos3OmniForConditionalGeneration`, la misma que el checkpoint `nvidia/Cosmos3-Nano`, pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: la torre de texto queda en 2 capas ocultas. Los tensores conservan exactamente los mismos nombres que el modelo real, lo que permite validar rutas de carga y ejecucion sin discrepancias de nomenclatura.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron tras superar una puerta de sensibilidad de entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,0739). El artefacto es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros de procesador y configuracion se copian byte a byte desde `nvidia/Cosmos3-Nano`.

## Capacidades

- No dispone de capacidades funcionales de generacion: los pesos son aleatorios y no han sido entrenados.
- Sirve como fixture de validacion para la carga del modelo en Transformers.
- Permite comprobar la propagacion de gradientes y la estabilidad numerica en float32, bfloat16 y float16.
- Conserva el tokenizer, chat template y preprocessor de video del modelo original, utiles para probar el pipeline de entrada multimodal.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.
- No incluye modo thinking, vision ni audio funcionales mas alla de la estructura de tensores.

## Casos de uso

- Pruebas de integracion en Transformers: verificar que `Cosmos3OmniForConditionalGeneration` se instancia y ejecuta con la configuracion esperada sin descargar el checkpoint completo.
- Validacion de CI/CD: ejecutar tests de humo en pipelines de integracion continua con un artefacto de 0,1 GB en lugar del modelo real.
- Comprobacion de nombres de tensores: asegurar que las rutas de carga y los mapeos de pesos coinciden con el checkpoint `nvidia/Cosmos3-Nano`.
- Pruebas de precision numerica: validar que forward, loss y gradientes son finitos en float32, bfloat16 y float16.
- Validacion del pipeline de preprocesado multimodal: probar tokenizer, chat template y preprocessor de video copiados del modelo original.
- Desarrollo de herramientas de inspeccion de modelos: analizar la estructura de configuracion y modular_model_index sin coste computacional.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py --fixture Cosmos3-Nano-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (20,2 M de parametros), aproximadamente 0,04 GB en bfloat16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) e incluso CPU es suficiente.
- Cabe en cualquier GPU consumer y en la mayoria de entornos sin GPU.
- Opciones de despliegue: Transformers con PyTorch; no consta soporte verificado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de pruebas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-mic | 20,2 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| nvidia/Cosmos3-Nano | no disponible en la informacion | no disponible | Modelo multimodal real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La comparacion con modelos de produccion no es significativa: Cosmos3-Nano-mic solo es comparable con otros fixtures del mismo repositorio `transformers-mic`.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y no han sido entrenados; cualquier salida carece de sentido.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- No debe emplearse en produccion, investigacion ni evaluacion de calidad.
- La licencia no esta declarada en la informacion disponible; verificar antes de cualquier redistribucion.
- La configuracion reducida (2 capas de texto) no representa el comportamiento del modelo original.
- Riesgo de confusion: el nombre puede llevar a error si se interpreta como una version "nano" funcional del modelo Cosmos3.
- No se han publicado datos de sesgos, alucinacion ni limitaciones de idioma porque el modelo no genera contenido real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Cosmos3-Nano-mic
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Cosmos3-Nano-mic.html
