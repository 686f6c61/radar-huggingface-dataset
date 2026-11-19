# huggingface-mic/Phi-3.5-mini-instruct-mic

## Resumen

Phi-3.5-mini-instruct-mic es un artefacto de prueba publicado por el usuario huggingface-mic, no un modelo funcional. Se trata de una version reducida ("slim fixture") del modelo microsoft/Phi-3.5-mini-instruct, generada para validar contratos de integracion de frameworks (concretamente Transformers) sin necesidad de descargar ni ejecutar los pesos reales. El repositorio contiene pesos aleatorios de 4.186.432 parametros, la misma arquitectura Phi3ForCausalLM pero con solo 2 capas ocultas, y los ficheros de procesador copiados byte a byte del modelo original.

El modelo esta etiquetado explicitamente como `test-artifact` en Hugging Face, con el objetivo declarado de mantenerlo fuera de las busquedas de modelos candidatos. Su funcion es servir como fixture reproducible: los pesos aleatorios (semilla 17) superaron una puerta de sensibilidad a la entrada (cada perturbacion de las entradas del contrato movia los logits al menos 0,001), lo que garantiza que las pruebas de integracion detecten regresiones reales sin requerir entrenamiento.

Por tanto, esta ficha describe un artefacto de ingenieria de software, no un modelo de lenguaje utilizable. Cualquier uso para generacion de texto, razonamiento o produccion carece de sentido: los pesos son aleatorios y el modelo no ha sido entrenado. Su relevancia es exclusivamente para desarrolladores de frameworks que necesiten validar pipelines de carga, tokenizacion y forward pass contra la arquitectura Phi-3.5 sin asumir el coste de los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phi3ForCausalLM (transformer decoder-only, version reducida) |
| Parametros totales | 4.186.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (config reducida; el modelo base soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura Phi3ForCausalLM del modelo base, pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio transformers-mic: `num_hidden_layers` igual a 2. Los nombres de tensores coinciden exactamente con los del checkpoint real de microsoft/Phi-3.5-mini-instruct, de modo que las pruebas de carga y ejecucion son representativas a nivel estructural. Los ficheros de procesador (tokenizer.json, tokenizer.model, tokenizer_config.json, special_tokens_map.json, added_tokens.json, configuration_phi3.py, modeling_phi3.py, generation_config.json, entre otros) se copiaron byte a byte desde el modelo original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, produjo 0,362). Los tensores son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture se guardo en bfloat16, el dtype por defecto del modelo base, y la clave de fixture `e7b3e508a42a` cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink.

## Capacidades

- No dispone de capacidades de generacion de texto utiles: los pesos son aleatorios y no han sido entrenados.
- No soporta tool calling ni function calling de forma funcional.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales.
- No dispone de modo thinking, vision ni audio.
- Su unica funcion es servir como fixture de integracion: valida carga de checkpoint, tokenizacion, forward pass, calculo de loss y gradientes contra la arquitectura Phi-3.5.
- Permite verificar contratos de frameworks (Transformers) con expectativas declaradas en `integrations/transformers/expectations`.
- Reproducible mediante `python example/build_fixtures.py --fixture Phi-3.5-mini-instruct-mic`.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que la arquitectura Phi3ForCausalLM se instancia, tokeniza y ejecuta un forward pass sin errores, sin descargar los 3.800 millones de parametros del modelo real.
- Validacion de pipelines CI/CD de frameworks: ejecutar la suite de tests de transformers-mic contra este fixture en cada pull request para detectar regresiones en la carga de checkpoints Phi-3.5 con un coste de computo minimo (4,2M parametros).
- Verificacion de compatibilidad de tokenizadores: comprobar que los ficheros de procesador copiados del modelo base producen la tokenizacion esperada y que `added_tokens.json` y `special_tokens_map.json` se cargan correctamente.
- Pruebas de dtypes y precision: validar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16, cubriendo los tres regimenes de precision habituales en produccion.
- Desarrollo de herramientas de inspeccion de modelos: usar el fixture para probar utilidades que recorren nombres de tensores, ya que replica exactamente los nombres del checkpoint real.
- Validacion de contratos de integracion: ejecutar las expectativas declaradas en `integrations/transformers/expectations` y el manifiesto `integration.json` para asegurar que el framework cumple el contrato documentado.
- Reproducibilidad de fixtures: reconstruir el artefacto desde `build.json` (fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros) para auditar la procedencia del fixture.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, los benchmarks carecen de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en bfloat16 (4,2M parametros), despreciable en cualquier GPU.
- GPU recomendadas: ninguna en particular; se ejecuta en CPU sin problemas.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (via `AutoModelForCausalLM`), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no es el proposito del artefacto.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de pruebas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-3.5-mini-instruct-mic | 4,2M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| microsoft/Phi-3.5-mini-instruct | 3.800M | 128.000 tokens | Modelo de lenguaje instruct | MIT | Hugging Face |
| microsoft/Phi-3-mini-4k-instruct | 3.800M | 4.096 tokens | Modelo de lenguaje instruct | MIT | Hugging Face |
| microsoft/Phi-3-mini-128k-instruct | 3.800M | 128.000 tokens | Modelo de lenguaje instruct | MIT | Hugging Face |

La comparativa con los modelos Phi-3 reales es meramente estructural: el fixture replica su arquitectura y nombres de tensores, pero no sus capacidades. No existen modelos comparables en la categoria de "fixtures de prueba" mas alla de otros artefactos del mismo repositorio transformers-mic.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado y produce salidas sin sentido. No debe usarse para generacion, razonamiento ni ninguna tarea de NLP.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no es un modelo desplegable.
- Licencia no disponible: no se especifica en la informacion proporcionada, aunque los ficheros de procesador copiados del modelo base incluyen LICENSE y NOTICE.md de Microsoft.
- Configuracion reducida a 2 capas: no representa el comportamiento numerico del modelo real, solo la estructura.
- Riesgo de confusion: un desarrollador podria descargarlo esperando un Phi-3.5 funcional; el nombre y la ausencia de avisos destacados en la cabecera incrementan este riesgo.
- Sin datos de sesgos, alucinacion o limitaciones de contexto porque no aplica al no ser un modelo entrenado.
- Uso comercial: sin sentido para este artefacto; para uso comercial real debe emplearse microsoft/Phi-3.5-mini-instruct bajo su licencia MIT.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Phi-3.5-mini-instruct-mic
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Documentacion de uso en Transformers: integrations/transformers/usage.md (dentro del repo)
- Expectativas de Transformers: integrations/transformers/expectations (dentro del repo)
- Manifiesto de contrato: integration.json (dentro del repo)
- Procedencia del fixture: build.json (dentro del repo)
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Phi-3.5-mini-instruct-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script sweep.py: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script build_fixtures.py: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
