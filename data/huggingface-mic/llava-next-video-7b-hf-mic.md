# huggingface-mic/LLaVA-NeXT-Video-7B-hf-mic

## Resumen

`huggingface-mic/LLaVA-NeXT-Video-7B-hf-mic` no es un modelo funcional, sino un artefacto de prueba (fixture) derivado de `llava-hf/LLaVA-NeXT-Video-7B-hf`. Lo publica la organizacion `huggingface-mic` con el proposito explicito de servir como banco de pruebas para la infraestructura de contratos e integraciones de Hugging Face (el proyecto `transformers-mic`). La model card lo etiqueta como `test-artifact` y advierte de forma explicita que "no es un modelo usable".

El repositorio contiene una version reducida del checkpoint original: conserva la arquitectura `LlavaNextVideoForConditionalGeneration` pero con solo 2 capas en el codificador de vision y 2 capas en el decodificador de texto, lo que da un total de 4.336.640 parametros (frente a los aproximadamente 7.000 millones del modelo base). Los pesos son aleatorios (semilla 17) y no han sido entrenados; solo superaron una comprobacion de sensibilidad a la entrada (cada perturbacion de las entradas del contrato mueve los logits al menos 0,001).

Su relevancia es puramente de ingenieria: permite validar pipelines de carga, tokenizacion, preprocesado de video y comprobaciones de contrato sin descargar ni ejecutar el modelo real de 7B. Cualquier uso como modelo de inferencia, evaluacion o produccion es inadecuado por definicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlavaNextVideoForConditionalGeneration (vision encoder + decoder de texto, transformer) |
| Parametros totales | 4.336.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `llava-hf/LLaVA-NeXT-Video-7B-hf`: un codificador de vision acoplado a un decodificador de texto de tipo transformer, con la clase `LlavaNextVideoForConditionalGeneration`. La unica diferencia estructural es la profundidad: el codificador de vision tiene 2 capas (`vision num_hidden_layers 2`) y el decodificador de texto tiene 2 capas (`text num_hidden_layers 2`), segun la regla generica de reduccion definida en `sweep.py` del repositorio `transformers-mic`. Los nombres de tensores coinciden exactamente con los del checkpoint real, lo que permite que las herramientas que inspeccionan o cargan el modelo real encuentren las mismas claves.

No hubo entrenamiento. Los pesos se generaron de forma aleatoria con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, produce un desplazamiento de 0,196). Los ficheros de procesador (`tokenizer.json`, `tokenizer.model`, `preprocessor_config.json`, `video_preprocessor_config.json`, `chat_template.json`, entre otros) se copiaron byte a byte desde el modelo base, de modo que el pipeline de preprocesado es identico al real. El fixture se guardo en bfloat16, el dtype con el que carga por defecto el checkpoint original, y se verifico que la forward pass, la loss y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No dispone de capacidades funcionales de generacion: los pesos son aleatorios y no han sido entrenados, por lo que la salida es ruido estadistico.
- La interfaz declarada en el contrato es generacion video+texto (`LLaVA-NeXT-Video video+text generation`), heredada de la clase del modelo base.
- Conserva el tokenizador y el procesador de video del modelo base, por lo que permite probar la tokenizacion de texto y el preprocesado de fotogramas de video.
- Conserva los nombres de tensores y la estructura de configuracion del checkpoint real, util para validar cargadores y comprobaciones de integridad.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma efectiva.
- Capacidades multilingues: no aplicables (sin entrenamiento).

## Casos de uso

- Pruebas de integracion de Transformers: cargar el fixture con `LlavaNextVideoForConditionalGeneration` para verificar que la clase, el config y los nombres de tensores coinciden con el checkpoint real antes de descargar los 7B.
- Validacion de pipelines de preprocesado de video: al conservar `video_preprocessor_config.json` y `preprocessor_config.json` byte a byte, permite comprobar la extraccion de fotogramas, el muestreo temporal y las formas de tensor sin coste de computo.
- CI/CD de librerias de vision-lenguaje: ejecutar tests de forward pass, loss y backward en float32, bfloat16 y float16 en segundos, gracias a sus 4,3M de parametros.
- Desarrollo de contratos de API de modelos (integration.json): validar que el manifiesto de integracion, las expectativas de framework y el uso ejecutable son coherentes con el modelo real.
- Pruebas de tokenizacion y chat template: verificar plantillas de conversacion y tokens especiales usando los mismos ficheros que el modelo de produccion.
- Banco de pruebas de herramientas de inspeccion de safetensors: comprobar el inventario de tensores, dtypes y formas frente al checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (4,3M de parametros, aproximadamente 8,7 MB de pesos), mas el coste de activaciones y del procesador de video.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: Transformers (via `LlavaNextVideoForConditionalGeneration`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/LLaVA-NeXT-Video-7B-hf-mic | 4.336.640 | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| llava-hf/LLaVA-NeXT-Video-7B-hf | ~7.000 millones (no confirmado en la informacion) | no disponible | Modelo vision-lenguaje video+texto | no disponible | Hugging Face |
| Otros fixtures del proyecto transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato e integracion | no disponible | Hugging Face |

La comparacion relevante es con su modelo base: mismo procesador y mismos nombres de tensores, pero profundidad reducida (2+2 capas frente a la del checkpoint completo) y pesos aleatorios en lugar de entrenados.

## Limitaciones y advertencias

- No es un modelo usable: la model card lo declara explicitamente como artefacto de prueba (`test-artifact`) y sus pesos son aleatorios.
- Riesgo de alucinacion total: cualquier salida generada es ruido sin relacion con la entrada.
- No debe emplearse en produccion, evaluacion de calidad ni comparativas de rendimiento.
- La licencia no esta declarada en la informacion disponible; conviene consultar el repositorio antes de cualquier redistribucion.
- El modelo base del que deriva (`llava-hf/LLaVA-NeXT-Video-7B-hf`) tiene sus propias condiciones de uso, que no se detallan aqui.
- La fecha de creacion indicada (2026-10-27) y la de actualizacion (2026-11-05) figuran en los metadatos del repositorio; verificar su vigencia antes de citarlas.
- El tamano del repositorio aparece como 0.0 GB, lo que es coherente con un fixture de pocos megabytes pero puede inducir a error si se espera el checkpoint completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/LLaVA-NeXT-Video-7B-hf-mic
- Modelo base: https://huggingface.co/llava-hf/LLaVA-NeXT-Video-7B-hf
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/LLaVA-NeXT-Video-7B-hf-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/LLaVA-NeXT-Video-7B-hf-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/LLaVA-NeXT-Video-7B-hf-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/LLaVA-NeXT-Video-7B-hf-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/LLaVA-NeXT-Video-7B-hf-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Regla de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
