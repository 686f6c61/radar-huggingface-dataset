# huggingface-mic/Voxtral-Mini-3B-2507-mic

## Resumen

Voxtral-Mini-3B-2507-mic es un artefacto de prueba publicado por la organizacion huggingface-mic, no un modelo utilizable. Se trata de una version reducida (slim) del checkpoint multimodal de audio y lenguaje mistralai/Voxtral-Mini-3B-2507, generada para validar contratos de integracion y expectativas de frameworks (en concreto Transformers) sin necesidad de descargar ni ejecutar los pesos completos. El propio autor lo etiqueta como `test-artifact` y advierte explicitamente de que no es un modelo usable.

El repositorio contiene unicamente 17.104.704 parametros (frente a los aproximadamente 3.000 millones del modelo base), un tamano de 0,1 GB y pesos generados de forma aleatoria con semilla 17, sin entrenamiento alguno. Conserva la misma arquitectura (`VoxtralForConditionalGeneration`) y los mismos nombres de tensores que el checkpoint real, pero con un config reducido a 2 capas en el encoder de audio y 2 capas en el decoder de texto.

Su relevancia es exclusivamente de ingenieria: sirve como fixture reproducible para probar pipelines de carga, tokenizacion, preprocesado de audio y ejecucion en bfloat16, float16 y float32 dentro de proyectos de integracion. Cualquier uso como modelo de inferencia real carece de sentido porque los pesos no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxtralForConditionalGeneration (audio-language, transformer multimodal) |
| Parametros totales | 17.104.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16, compatibles con float32 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura del checkpoint base Voxtral-Mini-3B-2507, es decir, un modelo condicional de audio y lenguaje (`VoxtralForConditionalGeneration`) con un encoder de audio y un decoder de texto. La version reducida aplica la regla generica de reduccion de `sweep.py` del proyecto transformers-mic: deja el encoder de audio en 2 capas (`audio num_hidden_layers 2`) y el decoder de texto en 2 capas (`text num_hidden_layers 2`). Los ficheros de procesador (`generation_config.json`, `params.json`, `preprocessor_config.json`, `tekken.json`) se copian byte a byte desde mistralai/Voxtral-Mini-3B-2507.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `input_features:reverse`, dio 0,28). Se guardan en bfloat16, el dtype por defecto del checkpoint real, y se verifico que son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture key es `b38baec3589c` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuyo config coincide tras la reduccion.

## Capacidades

- No tiene capacidades funcionales reales: los pesos son aleatorios y no han sido entrenados.
- Reproduce la interfaz de entrada y salida del contrato Voxtral audio-language (audio y texto) a nivel de tensores y configuracion.
- Permite validar la carga del modelo en Transformers con los mismos nombres de tensores que el checkpoint real.
- Sirve para comprobar el comportamiento de preprocesado de audio y tokenizacion Tekken copiados del modelo base.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de codigo de forma utilizable.
- No dispone de capacidades multilingues verificadas.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture para verificar que el pipeline de `VoxtralForConditionalGeneration` acepta el config reducido y los ficheros de procesador sin errores.
- CI/CD de librerias de inferencia: usar el repositorio de 0,1 GB como sustituto ligero del checkpoint de 3B en tests automatizados que no requieren calidad de salida.
- Validacion de contratos de API: comprobar que las firmas de entrada y salida (audio, texto, logits) coinciden con las esperadas por el framework.
- Pruebas de dtype y estabilidad numerica: verificar que forward, loss y gradientes son finitos en float32, bfloat16 y float16.
- Desarrollo de herramientas de reduccion de modelos: servir como ejemplo reproducible del proceso de shrink documentado en `sweep.py`.
- Auditoria de reproducibilidad: reconstruir el fixture con `build_fixtures.py` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (17,1 M de parametros, repo de 0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o integradas con soporte CUDA.
- Opciones de despliegue: Transformers (uso previsto segun el contrato); vLLM, llama.cpp, Ollama o TGI no estan documentados para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con pesos aleatorios, las mediciones no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral-Mini-3B-2507-mic | 17,1 M | no disponible | Fixture de test | no disponible | Hugging Face (huggingface-mic) |
| mistralai/Voxtral-Mini-3B-2507 | ~3 B | no disponible en la informacion | Modelo audio-language real | no disponible en la informacion | Hugging Face (mistralai) |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato | no disponible | Hugging Face (huggingface-mic) |

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y no han sido entrenados; las salidas no tienen valor semantico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Sesgos, alucinacion y limitaciones de contexto o idioma no aplican de forma significativa porque no hay aprendizaje, pero tampoco pueden evaluarse.
- El config reducido (2 capas de audio y 2 de texto) no representa el comportamiento del checkpoint base de 3B.
- Los ficheros de procesador copiados byte a byte pueden no ser coherentes con el config reducido en escenarios distintos a los tests previstos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Voxtral-Mini-3B-2507-mic
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Manifiesto de contrato (integration.json): https://huggingface.co/huggingface-mic/Voxtral-Mini-3B-2507-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/Voxtral-Mini-3B-2507-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Voxtral-Mini-3B-2507-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (build.json): https://huggingface.co/huggingface-mic/Voxtral-Mini-3B-2507-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Voxtral-Mini-3B-2507-mic.html
- Codigo de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
