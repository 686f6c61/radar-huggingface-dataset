# huggingface-mic/llava-v1.6-mistral-7b-hf-mic

## Resumen

`llava-v1.6-mistral-7b-hf-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` bajo la etiqueta `test-artifact`. No es un modelo utilizable: se trata de una version reducida ("slim") del checkpoint multimodal `llava-hf/llava-v1.6-mistral-7b-hf`, con solo 4.328.448 parametros totales frente a los aproximadamente 7.000 millones del modelo original. Su proposito es servir como fixture de integracion continua para validar contratos de framework (carga, forward, perdida y gradientes) sin necesidad de descargar ni ejecutar el modelo completo.

El repositorio empaqueta pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework (`integrations/transformers/expectations`), todo ello descrito en un manifiesto de contrato (`integration.json`). La arquitectura declarada es `LlavaNextForConditionalGeneration`, la misma familia LLaVA-Next v1.6 que el modelo base, pero con el numero de capas ocultas reducido a 2 tanto en la torre de vision como en el modelo de lenguaje.

Es relevante unicamente en el contexto de ingenieria de software: permite a los mantenedores de Transformers y de otras librerias verificar que las rutas de carga y ejecucion de LLaVA-Next siguen funcionando tras cambios en el codigo, con un coste de almacenamiento practicamente nulo (tamano del repo de 0,0 GB) y sin depender de pesos reales. No debe emplearse para inferencia, evaluacion de calidad ni despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlavaNextForConditionalGeneration (transformer multimodal vision-lenguaje) |
| Parametros totales | 4.328.448 (fixture reducido; el modelo base tiene ~7.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de LLaVA-Next v1.6, que combina un codificador visual con un modelo de lenguaje Mistral-7B mediante proyeccion de embeddings visuales. En este fixture, la configuracion se ha reducido con la regla generica de `sweep.py`: `vision num_hidden_layers = 2` y `text num_hidden_layers = 2`. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el codigo que espera cargar el modelo completo encuentra las mismas claves.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se conservaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `pixel_values:halve`, produjo 0,0442). Los ficheros de procesador (`added_tokens.json`, `chat_template.json`, `generation_config.json`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copiaron byte a byte desde `llava-hf/llava-v1.6-mistral-7b-hf`. El modelo se guardo en float16 y se verifico que es finito en float32, bfloat16 y float16 para forward, perdida y gradientes.

## Capacidades

- Carga y ejecucion como `LlavaNextForConditionalGeneration` en Transformers, con los mismos nombres de tensor que el checkpoint real.
- Forward pass funcional con entradas multimodales (texto e imagen) a nivel de contrato.
- Calculo de perdida y gradientes finitos en float32, bfloat16 y float16.
- Validacion de contratos de framework mediante el directorio `integrations/transformers/expectations`.
- No dispone de capacidades reales de generacion, razonamiento, codigo, matematicas, tool calling, agentes ni multilingues: los pesos son aleatorios.
- No soporta thinking mode, vision util ni audio: la salida es ruido estadistico.

## Casos de uso

- Pruebas de integracion en CI para Transformers: cargar el fixture y verificar que la ruta de `LlavaNextForConditionalGeneration` no se rompe tras refactorizaciones, sin descargar el checkpoint completo de ~7.000 millones de parametros.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen (formas de tensores, dtypes, nombres de claves) en cada version de la libreria.
- Pruebas de regresion de procesador y tokenizer: al copiarse los ficheros byte a byte del modelo base, permite verificar que el pipeline de preprocesado multimodal sigue produciendo las mismas entradas.
- Desarrollo de utilidades de carga y serializacion: probar rutas de safetensors, conversion de dtypes y manejo de checkpoints reducidos con un coste de disco minimo.
- Verificacion de gradientes y mixed precision: el fixture garantiza finitud en float32, bfloat16 y float16, lo que sirve para validar rutas de entrenamiento sin GPU de gran memoria.
- Reproduccion de builds: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, permitiendo reconstruir el fixture con `python example/build_fixtures.py --fixture llava-v1.6-mistral-7b-hf-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 para los 4.328.448 parametros del fixture (el modelo base requeriria aproximadamente 14 GB en float16).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU para ejecutar el fixture.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: Transformers con `LlavaNextForConditionalGeneration`; el resto de stacks (vLLM, llama.cpp, Ollama, TGI) no estan documentados para este fixture.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/llava-v1.6-mistral-7b-hf-mic` | 4.328.448 | no disponible | Fixture de test | no disponible | Hugging Face |
| `llava-hf/llava-v1.6-mistral-7b-hf` | ~7.000 millones | no disponible en la informacion | Modelo multimodal real | no disponible en la informacion | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable | no disponible | Test de contratos | no disponible | Hugging Face |

La comparativa con alternativas de la misma categoria (modelos multimodales de ~7B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y la salida no tiene significado semantico.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe confundirse con el modelo base.
- La configuracion esta reducida a 2 capas en vision y 2 en texto, por lo que no reproduce el comportamiento numerico del checkpoint real.
- No dispone de licencia declarada; su uso comercial no esta contemplado ni documentado.
- Riesgo de alucinacion total: cualquier texto generado es ruido estadistico sin fundamento.
- No soporta idiomas de forma significativa ni tiene capacidades multilingues reales.
- No debe desplegarse en produccion ni usarse para evaluar calidad, sesgos o rendimiento del modelo LLaVA-Next original.
- El tamano del repo (0,0 GB) y las 1.707 descargas reflejan su naturaleza de artefacto ligero de test, no de modelo distribuible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/llava-v1.6-mistral-7b-hf-mic
- Modelo base: https://huggingface.co/llava-hf/llava-v1.6-mistral-7b-hf
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/llava-v1.6-mistral-7b-hf-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/llava-v1.6-mistral-7b-hf-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/llava-v1.6-mistral-7b-hf-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/llava-v1.6-mistral-7b-hf-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/llava-v1.6-mistral-7b-hf-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
