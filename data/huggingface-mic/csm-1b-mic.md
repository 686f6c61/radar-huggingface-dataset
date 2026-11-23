# huggingface-mic/csm-1b-mic

## Resumen

`csm-1b-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable: es un *fixture* (pesos "slim") construido para validar el contrato de integracion de la arquitectura CSM (speech-to-speech, `CsmForConditionalGeneration`) en el ecosistema de Transformers. Deriva del checkpoint `unsloth/csm-1b` mediante un proceso de reduccion de configuracion (2 capas en el backbone, 2 en el decodificador de profundidad y 2 en el codec) y pesos aleatorios con semilla 17.

El repositorio empaqueta en un solo lugar los pesos reducidos, el manifiesto de contrato (`integration.json`), ejemplos de uso ejecutables con Transformers y el directorio de expectativas del framework. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Su relevancia es puramente de ingenieria: sirve para comprobar que una implementacion de `CsmForConditionalGeneration` carga, ejecuta forward, calcula perdida y propaga gradientes de forma finita en float32, bfloat16 y float16, con los mismos nombres de tensor que el checkpoint real. No debe emplearse para inferencia, generacion de audio ni ninguna tarea de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `CsmForConditionalGeneration` (backbone transformer + decodificador de profundidad + codec de audio), reducida a 2 capas por componente |
| Parametros totales | 56.583.969 segun safetensors; la model card cita 39,7 M para el fixture |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float16; algunos tensores en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16, con tensores float32 preservados) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CSM de speech-to-speech implementada en Transformers como `CsmForConditionalGeneration`. Consta de un backbone transformer, un decodificador de profundidad y un codec de audio con encoder y decoder propios (capas convolucionales y transformers con layer scales). El fixture conserva los nombres de tensor del checkpoint original, pero reduce el numero de capas a 2 en cada componente.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, dio 0,759). Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `unsloth/csm-1b`. El resultado es finito en forward, perdida y gradientes en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: no genera texto, audio ni codigo con calidad util.
- Sirve como fixture de conformidad para validar la carga y ejecucion de `CsmForConditionalGeneration` en Transformers.
- Permite comprobar forward pass, calculo de perdida y retropropagacion de gradientes en float32, bfloat16 y float16.
- Verifica la correspondencia de nombres de tensor con el checkpoint real `unsloth/csm-1b`.
- Valida la integracion de los ficheros de procesador copiados del modelo base.
- No dispone de tool calling, agentes, modo thinking ni capacidades multilingues declaradas.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture y ejecutar un forward para verificar que la implementacion de `CsmForConditionalGeneration` no rompe con la configuracion reducida.
- CI de la libreria: usar el repositorio como caso de prueba ligero (0,4 GB) en pipelines que validen carga de safetensors y dtypes.
- Validacion de gradientes: comprobar que loss y gradientes son finitos en float32, bfloat16 y float16 antes de entrenar el modelo real.
- Verificacion de contrato de API: contrastar el manifiesto `integration.json` y el directorio `integrations/transformers/expectations` contra la implementacion.
- Depuracion de nombres de tensor: comparar los nombres del fixture con los del checkpoint `unsloth/csm-1b` para detectar desalineaciones en conversiones.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture csm-1b-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en float16, dado el tamano del repo (0,4 GB).
- GPU recomendadas: cualquiera con soporte de float16; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida.
- Despliegue: carga mediante Transformers; no esta pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo utilizable.
- Latencia y throughput: no disponibles; irrelevantes para un fixture.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `csm-1b-mic` | 56,6 M (fixture) | no disponible | Fixture de conformidad | no disponible | Hugging Face |
| `unsloth/csm-1b` | no disponible | no disponible | Modelo CSM real | no disponible | Hugging Face |
| Otros fixtures `huggingface-mic` | variable | no disponible | Validacion de contratos | no disponible | Hugging Face |

La comparativa con modelos de la misma categoria (speech-to-speech) no es significativa porque el fixture no comparte comportamiento funcional con ellos.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido semantico.
- Etiquetado como `test-artifact`; no debe incluirse en busquedas de modelos candidatos ni en evaluaciones de calidad.
- No dispone de licencia declarada; no se puede asumir uso comercial.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque no se entreno.
- La configuracion reducida (2 capas) no representa el comportamiento del checkpoint `unsloth/csm-1b`.
- El conteo de parametros difiere entre safetensors (56,6 M) y la model card (39,7 M); conviene verificar `build.json` antes de usarlo en validaciones estrictas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/csm-1b-mic
- Modelo base: https://huggingface.co/unsloth/csm-1b
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/csm-1b-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/csm-1b-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/csm-1b-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/csm-1b-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/csm-1b-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
