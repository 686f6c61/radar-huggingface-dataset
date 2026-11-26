# huggingface-mic/Qwen3.5-0.8B-mic

## Resumen

`huggingface-mic/Qwen3.5-0.8B-mic` no es un modelo entrenado, sino un artefacto de prueba (fixture) publicado por el equipo de Hugging Face dentro del proyecto `transformers-mic`. Se trata de una version reducida artificialmente del checkpoint `Qwen/Qwen3.5-0.8B`, con 16.775.312 parametros reales (frente a los aproximadamente 800 millones del modelo original) y pesos generados aleatoriamente con semilla 17. Su unico proposito es servir como fixture de integracion para validar el pipeline de carga, ejecucion y expectativas de frameworks sobre la arquitectura `Qwen3_5ForConditionalGeneration`.

El repositorio incluye los pesos reducidos, un manifiesto de contrato (`integration.json`), documentacion de uso para Transformers, expectativas de framework y metadatos de procedencia del build. Los ficheros del procesador (tokenizer, chat template, configuraciones de preprocesado de imagen y video) se copian byte a byte desde el modelo base original, de modo que el fixture reproduce fielmente la interfaz de entrada aunque no el comportamiento del modelo.

Es relevante unicamente para desarrolladores que trabajen en tooling de integracion de modelos (tests de carga, verificacion de nombres de tensores, comprobaciones de dtype, validacion de contratos de entrada). No debe emplearse para inferencia real, generacion de texto ni ninguna tarea productiva: sus pesos son aleatorios y el propio autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (multimodal texto + vision, derivada de Qwen3.5-0.8B con `text num_hidden_layers` reducido a 2) |
| Parametros totales | 16.775.312 (fixture reducido; el modelo base Qwen3.5-0.8B tiene ~0,8B) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32 y bfloat16 segun variante del fixture) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero `LICENSE` se copia del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `Qwen/Qwen3.5-0.8B`, identificada como `Qwen3_5ForConditionalGeneration`, un modelo condicional multimodal que procesa texto e imagenes/video (incluye `preprocessor_config.json` y `video_preprocessor_config.json`). La configuracion se ha reducido mediante la regla generica de `sweep.py`, que deja el bloque de texto en 2 capas ocultas (`text num_hidden_layers 2`). Los nombres de tensores coinciden exactamente con los del checkpoint real, incluyendo tensores en float32 dentro de las capas de atencion lineal (`linear_attn.A_log`, `linear_attn.norm.weight`), lo que sugiere el uso de mecanismos de atencion lineal hibridos en el modelo original.

No hubo entrenamiento. Los pesos se inicializan aleatoriamente con semilla 17 y se valido una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,157-0,16). Los tensores son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El build queda registrado en `build.json` con fuentes fijadas, resultados de las puertas y hashes de ficheros. Existen al menos dos variantes del fixture con claves distintas (`bcf77184b0ac` y `4d9e5cead716`), una guardada en float32 y otra en bfloat16.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios, por lo que no genera texto, codigo ni respuestas coherentes.
- Reproduce la interfaz de entrada del modelo base: tokenizer, chat template, preprocesado de imagen y preprocesado de video copiados byte a byte.
- Sirve como fixture de integracion para validar la carga del checkpoint en Transformers y otros frameworks.
- Permite comprobar que los nombres de tensores del contrato coinciden con los del checkpoint real.
- Valida el comportamiento numerico en float32, bfloat16 y float16 (forward, loss, gradientes).
- No dispone de tool calling, razonamiento, capacidades multilingues ni modo thinking utilizables.

## Casos de uso

- Tests de integracion en Transformers: cargar el fixture para verificar que la clase `Qwen3_5ForConditionalGeneration` instancia correctamente el modelo con la configuracion reducida, sin descargar el checkpoint completo de 0,8B.
- Validacion de contratos de entrada: usar `integration.json` y las expectativas de framework para comprobar que las perturbaciones de `pixel_values`, `input_ids` y demas entradas producen cambios en los logits por encima del umbral definido.
- CI/CD de librerias de inferencia: ejecutar tests de forward, loss y backward en float32, bfloat16 y float16 con un artefacto de 0,3 GB, mucho mas rapido y barato que el modelo real.
- Verificacion de nombres de tensores: comprobar que cualquier refactor de la implementacion mantiene la correspondencia exacta con los nombres del checkpoint publicado.
- Pruebas de pipeline multimodal: validar el flujo de preprocesado de imagen y video usando los ficheros de procesador copiados del modelo base.
- Reproducibilidad de builds: reconstruir el fixture con `python example/build_fixtures.py --fixture Qwen3.5-0.8B-mic` y comparar hashes contra `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquiera de las dos variantes (float32 ~67 MB de pesos, bfloat16 ~34 MB), mas overhead de activaciones y procesador.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer, e incluso en CPU para tests de integracion.
- Opciones de despliegue: Transformers (uso previsto segun la documentacion `integrations/transformers/usage.md`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test no se caracteriza rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/Qwen3.5-0.8B-mic` | 16,8M (fixture) | no disponible | Fixture de test | no disponible | Hugging Face (2.803 descargas) |
| `Qwen/Qwen3.5-0.8B` | ~0,8B | no disponible | Modelo real multimodal | no disponible | Hugging Face |
| Otros fixtures `transformers-mic` | variable (reducidos) | no disponible | Fixtures de test por arquitectura | no disponible | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (fixtures de integracion) mas alla de los generados por el propio proyecto `transformers-mic`.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): cualquier salida es ruido sin significado. No usar en produccion, demos ni evaluaciones de calidad.
- Etiquetado como `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos; respetar esa clasificacion.
- La licencia no se especifica en la informacion disponible; el fichero `LICENSE` se copia del modelo base, por lo que las condiciones reales dependen de `Qwen/Qwen3.5-0.8B`.
- El modelo base declarado tiene ~0,8B parametros, pero el fixture solo conserva 16,8M; no representa el comportamiento, sesgos ni capacidades del original.
- No hay informacion sobre idiomas, contexto maximo ni cuantizaciones soportadas.
- Existen al menos dos variantes del fixture con claves y dtypes distintos (`bcf77184b0ac` en float32, `4d9e5cead716` en bfloat16); verificar cual se esta usando en cada test.
- El repositorio ocupa 0,3 GB, mayormente por los ficheros del procesador y configuraciones, no por los pesos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Como se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.5-0.8B-mic.html)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script de barrido `sweep.py`](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script de construccion `build_fixtures.py`](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Manifiesto de contrato `integration.json`](https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic/blob/main/integration.json)
- [Uso con Transformers](https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic/blob/main/integrations/transformers/usage.md)
- [Procedencia del build `build.json`](https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic/blob/main/build.json)
