# huggingface-mic/opt-125m-mic

## Resumen

`opt-125m-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni de un modelo utilizable para inferencia real: es un *fixture* o modelo reducido (*slim model*) construido a partir de `facebook/opt-125m` para servir como caso de prueba reproducible de contratos de integración con frameworks (principalmente Transformers). El repositorio combina pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework en un único paquete.

Técnicamente mantiene la arquitectura `OPTForCausalLM` del modelo base, pero con una configuración reducida (`num_hidden_layers = 2`) que da lugar a 3.415.680 parámetros totales, frente a los 125 millones del modelo original. Los pesos son aleatorios (semilla 17) y no han sido entrenados; se conservan los nombres de tensores del checkpoint real y los ficheros de procesador (`tokenizer_config.json`, `vocab.json`, `merges.txt`, etc.) se copian byte a byte desde `facebook/opt-125m`. El artefacto está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

Su relevancia es, por tanto, de ingeniería y no de modelado: permite validar pipelines de carga, comprobaciones de sensibilidad a entradas y expectativas de framework sin descargar los 125 M del modelo real. Cualquier uso como modelo de generación de texto produciría salidas sin sentido, ya que los pesos son aleatorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OPT (OPTForCausalLM, transformer decoder causal) |
| Parametros totales | 3.415.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura OPT de `facebook/opt-125m` (`OPTForCausalLM`) pero con una configuración reducida a 2 capas ocultas, aplicando la regla genérica de reducción de `sweep.py` del repositorio `huggingface/transformers-mic`. Conserva los mismos nombres de tensores que el checkpoint real y copia byte a byte los ficheros de procesador del modelo base (`LICENSE.md`, `generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`).

No ha habido entrenamiento: los pesos son aleatorios con semilla 17. Para justificar su validez como fixture, se aplicó una compuerta de sensibilidad a la entrada según la cual cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, alcanza 0,514). El modelo se guarda en float16 (el dtype por defecto de `facebook/opt-125m`) y se verifica que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es `02035e444a97`.

## Capacidades

- No es un modelo funcional: los pesos aleatorios no producen texto coherente ni razonamiento.
- Sirve como fixture de pruebas para validar la carga de `OPTForCausalLM` en Transformers.
- Permite comprobar expectativas de framework (directorio `integrations/transformers/expectations`).
- Incluye ejemplos de uso ejecutables (`integrations/transformers/usage.md`).
- Valida la compuerta de sensibilidad a entradas del contrato (perturbaciones de `input_ids` y similares).
- Verifica estabilidad numérica (finitud) en float32, bfloat16 y float16.
- No dispone de tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Pruebas de integración en CI: cargar el fixture con Transformers y comprobar que la API de `OPTForCausalLM` se comporta según el contrato, sin descargar los 125 M del modelo real.
- Validación de pipelines de tokenización: al copiar byte a byte los ficheros del procesador de `facebook/opt-125m`, permite verificar que el tokenizador se carga correctamente en un entorno de test.
- Desarrollo de herramientas de medición de cobertura (MIC): el repositorio forma parte de `transformers-mic` y sirve para validar la generación de fixtures y las compuertas de sensibilidad.
- Reproducción de fallos: al fijar semilla 17 y hashes de ficheros en `build.json`, permite reproducir exactamente el mismo estado en cualquier máquina.
- Pruebas de estabilidad numérica: comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 en entornos con distintas GPUs.
- Onboarding de contribuidores: un paquete de 0,2 GB con contrato, uso y expectativas permite entender el flujo de integración sin coste de descarga elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluar calidad de generación.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float16 (3,4 M de parámetros); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte de float16; no requiere A100, H100 ni RTX 4090. Funciona en CPU.
- Cabe en consumer GPU: sí, en cualquier modelo (incluidas GPUs integradas).
- Opciones de despliegue: Transformers (vía `AutoModelForCausalLM`), con ejemplos de uso en `integrations/transformers/usage.md`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; irrelevantes para un fixture.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| huggingface-mic/opt-125m-mic | 3,4 M | no disponible | Fixture de pruebas | no disponible |
| facebook/opt-125m | 125 M | 2.048 tokens (modelo base) | Modelo causal de propósito general | OPT-175B license (no comercial) |
| facebook/opt-350m | 350 M | 2.048 tokens (modelo base) | Modelo causal de propósito general | OPT-175B license (no comercial) |

La comparación con `facebook/opt-125m` es directa porque el fixture deriva de él, pero la diferencia de propósito es total: el primero es un artefacto de test con pesos aleatorios y el segundo un modelo entrenado. No se dispone de datos de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida carece de sentido.
- Etiquetado como `test-artifact`; no debe incluirse en búsquedas de modelos candidatos ni en producción.
- Licencia no disponible en la información proporcionada; el fichero `LICENSE.md` se copia del modelo base, pero no se confirma su contenido.
- Idiomas y contexto no documentados en la información disponible.
- No hay datos sobre sesgos ni alucinación porque no ha sido entrenado.
- El uso comercial queda sujeto a la licencia del modelo base (`facebook/opt-125m`), que no se detalla aquí.
- Cualquier evaluación de calidad sobre este artefacto sería inválida.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/opt-125m-mic
- Modelo base: https://huggingface.co/facebook/opt-125m
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/opt-125m-mic.html
