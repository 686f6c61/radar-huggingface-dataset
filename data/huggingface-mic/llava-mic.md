# huggingface-mic/llava-mic

## Resumen

`llava-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic` dentro del proyecto `transformers-mic`. No es un modelo utilizable: se trata de un *fixture* reducido de 4,3 millones de parametros que reproduce la arquitectura `LlavaForConditionalGeneration` del checkpoint real `llava-hf/llava-1.5-7b-hf`, pero con pesos aleatorios (semilla 17) y una configuracion encogida (2 capas en el encoder de vision y 2 capas en el modelo de texto).

Su proposito es servir como banco de pruebas para validar contratos de integracion con frameworks (principalmente Transformers): verificar que los nombres de tensores, los ficheros de procesador y las expectativas de entrada/salida coinciden con el checkpoint original sin necesidad de descargar los 7 mil millones de parametros. El repositorio incluye pesos *slim* en safetensors, un manifiesto de contrato (`integration.json`), instrucciones de uso y un directorio de expectativas.

Por su naturaleza de *test artifact*, no debe emplearse para inferencia real, evaluacion de calidad ni despliegue en produccion. Es relevante unicamente para desarrolladores que trabajen en el ecosistema `transformers-mic` o que necesiten fixtures ligeros para pruebas de integracion de modelos LLaVA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlavaForConditionalGeneration (transformer multimodal vision-lenguaje) |
| Parametros totales | 4.336.576 (fixture slim) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaVA: un encoder visual conectado mediante un proyector a un modelo de lenguaje tipo transformer, empaquetado como `LlavaForConditionalGeneration`. En este fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py` a 2 capas ocultas en la torre de vision y 2 capas ocultas en la torre de texto, conservando los nombres de tensores del checkpoint original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (la mas debil, `pixel_values:halve`, con 0,035). Los ficheros de procesador (`tokenizer.json`, `tokenizer.model`, `preprocessor_config.json`, `chat_template.jinja`, entre otros) se copiaron byte a byte desde `llava-hf/llava-1.5-7b-hf`. El modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- No es un modelo funcional: no genera texto, razonamiento, codigo ni descripciones visuales utiles.
- Reproduce la interfaz de entrada/salida de LLaVA 1.5-7B: acepta `pixel_values` e `input_ids` y devuelve logits con la misma forma de tensores.
- Sirve para validar tooling de carga, tokenizacion y preprocesado de imagenes contra el checkpoint real.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma significativa (pesos aleatorios).
- Capacidades multilingues no disponibles.
- No dispone de modo *thinking*, audio ni otras capacidades especiales.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture para verificar que `LlavaForConditionalGeneration` acepta los mismos nombres de tensores y ficheros de procesador que el checkpoint real, sin descargar 7B de parametros.
- CI/CD de librerias multimodales: ejecutar tests de forward pass, loss y gradientes en float16/bfloat16/float32 en pipelines automatizados con un consumo minimo de disco y memoria.
- Validacion de contratos de framework: comprobar que `integration.json` y el directorio `integrations/transformers/expectations` coinciden con el comportamiento observado al cargar el modelo.
- Desarrollo de herramientas de preprocesado de imagen: usar los `preprocessor_config.json` y `processor_config.json` copiados del checkpoint real para probar pipelines de vision sin pesos reales.
- Formacion y docencia: demostrar la estructura interna de un modelo LLaVA (torres de vision y texto, proyector) con un grafo de computo manejable en CPU.
- Regresion de tokenizadores: verificar que `tokenizer.json`, `tokenizer.model` y `chat_template.jinja` se cargan correctamente y producen los mismos ids que el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, VQA) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float16 (4,3 M de parametros), aunque el consumo real dependera del runtime y del tamano de las entradas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) e incluso CPU es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: carga directa con Transformers (`AutoModelForVision2Seq` / `LlavaForConditionalGeneration`); no se ha validado con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/llava-mic | 4,3 M (fixture) | no disponible | Test artifact / validacion de contrato | no disponible | Hugging Face |
| llava-hf/llava-1.5-7b-hf | 7 B | 4096 tokens (tipico en LLaVA 1.5) | Modelo vision-lenguaje real | no disponible en la informacion | Hugging Face |
| Fixtures equivalentes de `transformers-mic` | Variable (reducidos) | no disponible | Test artifacts para otros checkpoints | no disponible | Hugging Face |

La comparativa con alternativas reales de la misma categoria (p. ej. otros VLM de 7B como Qwen-VL o InternVL) no procede: `llava-mic` no es un modelo de produccion.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado semantico; no usar para inferencia, evaluacion ni produccion.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar el uso comercial del repositorio ni de los ficheros derivados.
- Configuracion encogida (2+2 capas): no reproduce el comportamiento numerico del checkpoint real, solo la interfaz y los nombres de tensores.
- El repositorio solo contiene pesos, uso y expectativas; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture mic-llava-slim`.
- No se han documentado sesgos ni riesgos de alucinacion porque el modelo no genera texto coherente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/llava-mic
- Modelo base: https://huggingface.co/llava-hf/llava-1.5-7b-hf
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/llava-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/llava-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/llava-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/llava-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llava-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
