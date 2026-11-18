# huggingface-mic/gemma3-mic

## Resumen

`gemma3-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face, no un modelo entrenado utilizable. Se presenta como una version reducida ("slim") de `google/gemma-3-4b-it`, con la misma arquitectura declarada (`Gemma3ForConditionalGeneration`) pero con una configuracion mucho mas pequena: 2 capas en el tronco de texto y 2 capas en el codificador de vision. El resultado son 17.226.752 parametros totales y un repositorio de 0,1 GB.

El proposito declarado por el autor es servir como fixture de integracion: pesos con los mismos nombres de tensor que el checkpoint real, ficheros de procesador copiados byte a byte desde `google/gemma-3-4b-it` y pesos aleatorios (semilla 17) que superaron una comprobacion de sensibilidad a la entrada. Es decir, permite validar pipelines de carga, tokenizacion y ejecucion de Transformers sin descargar el modelo completo de 4B.

Es relevante unicamente en el contexto de pruebas de infraestructura (CI, validacion de contratos de integracion, comprobaciones de compatibilidad de frameworks). No debe emplearse para inferencia real, generacion de texto ni evaluacion de calidad: el propio autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3 (`Gemma3ForConditionalGeneration`, multimodal texto+vision) |
| Parametros totales | 17.226.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo declara la arquitectura `Gemma3ForConditionalGeneration`, la misma familia que `google/gemma-3-4b-it`, pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: `num_hidden_layers` de 2 en el tronco de texto y 2 en la parte de vision. Los nombres de tensor coinciden con los del checkpoint real, de modo que las herramientas que esperan un Gemma3 completo encuentran las claves que buscan, aunque con dimensiones mucho menores.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una compuerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, dio 0,206). Los ficheros de procesador (`tokenizer.json`, `tokenizer.model`, `chat_template.json`, `preprocessor_config.json`, `generation_config.json`, entre otros) se copiaron byte a byte desde `google/gemma-3-4b-it`. El modelo se guardo en bfloat16, el dtype por defecto del checkpoint original, y se verifico que es finito en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- No tiene capacidades funcionales de generacion: los pesos son aleatorios y no producen texto coherente.
- Carga y ejecucion correctas en Transformers con la configuracion reducida de Gemma3.
- Tokenizacion y plantilla de chat identicas a `google/gemma-3-4b-it` (ficheros copiados byte a byte).
- Compatibilidad de nombres de tensor con el checkpoint real de Gemma3 4B.
- Ejecucion finita en float32, bfloat16 y float16, incluidos forward, loss y gradientes.
- No dispone de tool calling, agentes, razonamiento multilingue ni modo thinking utilizables.

## Casos de uso

- Pruebas de integracion en CI: permite validar que un pipeline de carga de Transformers reconoce la arquitectura Gemma3 y ejecuta un forward sin descargar los 4B parametros del modelo real.
- Validacion de contratos de framework: el repositorio incluye `integration.json`, `integrations/transformers/usage.md` y el directorio de expectativas, de modo que un framework puede comprobar que cumple el contrato declarado.
- Pruebas de tokenizador y plantilla de chat: al copiar los ficheros de procesador del modelo original, sirve para verificar el preprocesado y el formateo de mensajes sin coste de descarga.
- Desarrollo de utilidades de inspeccion de checkpoints: util para comprobar que herramientas que enumeran tensores, dtypes y configuraciones funcionan con un Gemma3 de estructura realista pero minimo.
- Pruebas de compatibilidad de dtypes: permite comprobar rutas de codigo en float32, bfloat16 y float16 con un modelo que cabe en cualquier entorno.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de la compuerta y hashes de ficheros, lo que permite reconstruir el artefacto con `python example/build_fixtures.py --fixture mic-gemma3-slim`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB en bfloat16 (17,2 M de parametros); cabe en CPU y en cualquier GPU consumer.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en cualquier modelo con al menos unos cientos de MB libres.
- Opciones de despliegue: Transformers (ruta declarada en `integrations/transformers/usage.md`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba carecen de interes practico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/gemma3-mic` | 17,2 M (fixture) | no disponible | Pruebas de integracion | no disponible | Hugging Face |
| `google/gemma-3-4b-it` | 4 B (aproximado, segun nombre) | no disponible en la informacion | Modelo instructivo multimodal | Gemma (terminos de Google) | Hugging Face |
| Otros fixtures `transformers-mic` | Variable | no disponible | Pruebas de integracion | no disponible | Hugging Face |

No se dispone de datos de rendimiento para comparar; la unica comparacion significativa es estructural: `gemma3-mic` replica la interfaz de `google/gemma-3-4b-it` con una fraccion minima de sus parametros.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene valor semantico.
- Etiquetado explicitamente como `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos.
- La licencia no esta declarada en la informacion disponible; no debe asumirse uso comercial sin verificacion previa en el repositorio.
- El contexto, los idiomas y las capacidades multimodales reales no estan documentados; la configuracion reducida invalida cualquier extrapolacion al modelo base.
- No usar para evaluaciones de calidad, benchmarks ni produccion.
- El repositorio contiene solo los pesos reducidos, el uso y las expectativas de framework; otros ficheros deben regenerarse con `build_fixtures.py`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/gemma3-mic
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/gemma3-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/gemma3-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/gemma3-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/gemma3-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma3-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
