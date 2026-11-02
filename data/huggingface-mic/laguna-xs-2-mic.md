# huggingface-mic/Laguna-XS.2-mic

## Resumen

Laguna-XS.2-mic es un artefacto de prueba (fixture) publicado por huggingface-mic, no un modelo entrenado utilizable. Se trata de una version reducida y con pesos aleatorios del modelo base poolside/Laguna-XS.2, generada para validar la integracion del modelo real con la libreria Transformers y otras herramientas del ecosistema. El repositorio incluye los pesos "slim" (adelgazados), ejemplos de uso ejecutables y las expectativas de framework en un unico paquete.

El fixture conserva la misma arquitectura que el modelo original (clase `LagunaForCausalLM`) pero reduce el numero de capas ocultas a 3, lo que da como resultado 13.319.208 parametros. Los pesos son aleatorios (semilla 17) y no han sido entrenados; pasaron unicamente una compuerta de sensibilidad a las entradas, que verifica que cada perturbacion de las entradas del contrato mueve los logits al menos 0.001. Los ficheros de procesador (tokenizer, chat template, configuracion, codigo de modelado) se copian byte a byte del modelo base.

Su relevancia es puramente de ingenieria: permite a los desarrolladores y mantenedores de Transformers ejecutar y verificar el pipeline completo de Laguna-XS.2 (carga, forward, loss, gradientes) sin descargar los pesos reales, y sirve como referencia de contrato de integracion. No debe emplearse para inferencia real, generacion de texto ni evaluacion de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`LagunaForCausalLM`), 3 capas ocultas (fixture reducido) |
| Parametros totales | 13.319.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia `LICENSE.md` del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base poolside/Laguna-XS.2, un transformer causal de tipo `LagunaForCausalLM`, pero con la configuracion reducida a 3 capas ocultas mediante la regla generica de reduccion de `sweep.py` del repositorio transformers-mic. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que cargue el modelo real deberia cargar el fixture sin cambios en la estructura.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y solo se valido que superasen la compuerta de sensibilidad a las entradas del contrato (la perturbacion mas debil, `attention_mask:all_ones`, produjo un desplazamiento de logits de 0.179, muy por encima del umbral de 0.001). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros de procesador y tokenizer se copian byte a byte del modelo base, por lo que el tokenizador y la chat template son los reales de Laguna-XS.2.

## Capacidades

- No dispone de capacidades funcionales: los pesos son aleatorios y el modelo no genera texto coherente.
- Sirve como fixture de integracion para verificar la carga del modelo, el forward pass, el calculo de loss y los gradientes en Transformers.
- Permite validar el contrato de integracion definido en `integration.json` y las expectativas de framework en `integrations/transformers/expectations`.
- Conserva el tokenizador, la chat template y los tokens especiales del modelo base, utiles para probar pipelines de tokenizacion.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales, al carecer de entrenamiento.
- No dispone de vision, audio ni modo thinking.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que el pipeline de forward, loss y backward funciona sin errores antes de usar el checkpoint real.
- Validacion de contratos de framework: ejecutar las expectativas de `integrations/transformers/expectations` en CI para detectar regresiones en la integracion de Laguna-XS.2.
- Desarrollo de herramientas de serializacion: comprobar que los nombres de tensores y el formato safetensors coinciden con el checkpoint real, sin descargar los pesos completos.
- Pruebas de tokenizacion y chat template: usar el tokenizer copiado del modelo base para validar plantillas de conversacion y tokens especiales en pipelines propios.
- Verificacion de precision numerica: comprobar que el modelo es finito en float32, bfloat16 y float16 en entornos de entrenamiento distribuido o mixto.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py --fixture Laguna-XS.2-mic` para auditar hashes y fuentes fijadas en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) careceria de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (13,3M parametros, aproximadamente 27 MB de pesos mas overhead de activaciones y cache).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere aceleradores de datacenter.
- Cabe holgadamente en cualquier GPU consumer y en entornos CPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requiere `modeling_laguna.py` y `configuration_laguna.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; irrelevantes para un fixture sin entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laguna-XS.2-mic | 13,3M | no disponible | Fixture de integracion | no disponible | HuggingFace |
| poolside/Laguna-XS.2 | no disponible | no disponible | Modelo base real | no disponible | HuggingFace |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de integracion | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base en la informacion proporcionada, por lo que la comparativa se limita a proposito y disponibilidad.

## Limitaciones y advertencias

- Es un artefacto de prueba (`test-artifact`) con pesos aleatorios: no debe usarse para inferencia, generacion ni evaluacion de calidad.
- La model card indica explicitamente que "no es un modelo utilizable" y que la etiqueta sirve para excluirlo de busquedas de modelos candidatos.
- La licencia no esta disponible en la informacion proporcionada; el `LICENSE.md` copiado del modelo base condiciona cualquier uso.
- El contexto, los idiomas y las capacidades reales del modelo base no se detallan en la informacion disponible.
- Requiere `trust_remote_code=True` por el codigo de modelado personalizado, lo que implica ejecutar codigo del repositorio.
- No apto para produccion bajo ninguna circunstancia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/Laguna-XS.2-mic
- Modelo base: https://huggingface.co/poolside/Laguna-XS.2
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Laguna-XS.2-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
