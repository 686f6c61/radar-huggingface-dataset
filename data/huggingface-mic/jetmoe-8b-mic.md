# huggingface-mic/jetmoe-8b-mic

## Resumen

`huggingface-mic/jetmoe-8b-mic` es un artefacto de prueba (fixture) publicado por el equipo `huggingface-mic` dentro del proyecto Transformers MIC. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version "reducida" (slim) del checkpoint `jetmoe/jetmoe-8b`, con solo 2.573.888 parametros y pesos generados aleatoriamente (semilla 17), disenada para validar contratos de integracion y expectativas de frameworks.

El proposito del repositorio es empaquetar en un unico lugar los pesos reducidos, un manifiesto de contrato (`integration.json`), ejemplos de uso con Transformers y el directorio de expectativas del framework. La arquitectura se mantiene (`JetMoeForCausalLM`), pero la configuracion se ha reducido a 2 capas ocultas y 2 capas totales mediante la regla generica de `sweep.py`. Los ficheros de procesador (tokenizer, generation config, special tokens) se copian byte a byte desde el modelo original.

Su relevancia es puramente de ingenieria: permite a los mantenedores de Transformers y de frameworks de inferencia comprobar que la carga, el forward, la perdida y los gradientes funcionan correctamente con la misma estructura de tensores que el checkpoint real, sin necesidad de descargar los ~8B parametros del modelo original. Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JetMoe (JetMoeForCausalLM), transformer con mezcla de expertos (MoE) segun el modelo base |
| Parametros totales | 2.573.888 (fixture reducido); el modelo base `jetmoe/jetmoe-8b` tiene ~8B segun su nombre |
| Parametros activos | no disponible (el fixture no documenta el reparto de expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture conserva la clase `JetMoeForCausalLM` y los mismos nombres de tensor que el checkpoint real `jetmoe/jetmoe-8b`, pero con una configuracion reducida: `num_hidden_layers` = 2 y `num_layers` = 2, aplicando la regla generica de reduccion de `sweep.py`. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento, RLHF ni DPO. Se guardan en float32, el dtype con el que carga por defecto el modelo original, y se ha verificado que son finitos en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes.

La unica "validacion" aplicada es una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, produce 0.0891). Esto garantiza que el fixture responde a cambios en las entradas, pero no aporta ninguna capacidad de modelado. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copian byte a byte desde el modelo base, por lo que el tokenizador si es el real.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de pruebas para validar la carga de `JetMoeForCausalLM` en Transformers.
- Permite comprobar la compatibilidad de nombres de tensor con el checkpoint real `jetmoe/jetmoe-8b`.
- Valida el forward, la perdida y los gradientes en float32, bfloat16 y float16.
- Incluye un manifiesto de contrato (`integration.json`) y expectativas de framework para tests automatizados.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma real; cualquier capacidad de ese tipo pertenece al modelo base, no al fixture.
- Multilingue: no disponible (depende del tokenizador copiado, pero no hay evaluacion).

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que la arquitectura JetMoe se instancia correctamente sin descargar los ~8B parametros del modelo real.
- CI/CD de frameworks de inferencia: usar el fixture como caso de prueba ligero para validar rutas de carga de safetensors y compatibilidad de nombres de tensor en pipelines automatizados.
- Validacion de contratos de API: comprobar que `integration.json` y el directorio `integrations/transformers/expectations` se cumplen en cada release del framework.
- Desarrollo de herramientas de reduccion de modelos: servir como referencia reproducible del proceso `sweep.py` y del script `build_fixtures.py`.
- Pruebas de precision numerica: verificar que el modelo es finito en float32, bfloat16 y float16 en forward, perdida y gradientes dentro de un runner de tests.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture jetmoe-8b-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (2,57M parametros, ~10 MB de pesos mas overhead de activaciones y tokenizador).
- GPU recomendadas: cualquier GPU consumer moderna o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), potencialmente llama.cpp/Ollama si se convierte a GGUF, aunque no es el proposito del artefacto.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de pruebas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/jetmoe-8b-mic` | 2,57M (fixture) | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| `jetmoe/jetmoe-8b` | ~8B (MoE) | no disponible | Modelo real de generacion de texto | no disponible | Hugging Face |
| Otros fixtures MIC | variable (reducidos) | no disponible | Pruebas de integracion | no disponible | Hugging Face (org `huggingface-mic`) |

La comparativa relevante es con el propio modelo base: el fixture replica su estructura de tensores y su tokenizador, pero no su capacidad. Frente a otros fixtures del mismo proyecto, comparte el mismo enfoque de reduccion generica y puerta de sensibilidad a la entrada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido linguistico.
- Etiquetado como `test-artifact`; no debe aparecer en busquedas de modelos candidatos ni usarse en produccion.
- Sesgos conocidos: no aplica, al no haber entrenamiento; el tokenizador hereda los sesgos del modelo base.
- Riesgo de alucinacion: total, cualquier texto generado es ruido.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base y no del fixture.
- Restricciones de licencia: no disponible; verificar la licencia de `jetmoe/jetmoe-8b` antes de cualquier uso derivado.
- Caveat para produccion: no desplegar bajo ninguna circunstancia como modelo de generacion; su unico uso legitimo es testing.
- El tamano del repo es 0.0 GB segun Hugging Face, lo que refleja el caracter minimo del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/jetmoe-8b-mic
- Modelo base: https://huggingface.co/jetmoe/jetmoe-8b
- Contrato de integracion: https://huggingface.co/huggingface-mic/jetmoe-8b-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/jetmoe-8b-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/jetmoe-8b-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/jetmoe-8b-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/jetmoe-8b-mic.html
- Repositorio Transformers MIC: https://github.com/huggingface/transformers-mic
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
