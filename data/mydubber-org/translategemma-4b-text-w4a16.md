# mydubber-org/translategemma-4b-text-W4A16

## Resumen

TranslateGemma 4B text-only W4A16 es una version modificada y cuantizada de `google/translategemma-4b-it`, el modelo de traduccion automatica de Google derivado de la familia Gemma 3. El autor de esta variante es el usuario de Hugging Face `mydubber-org`, que la publica como componente interno de los workers de GPU de su servidor myDubber. La modificacion consiste en eliminar el codificador de vision y su proyector, conservar unicamente el modelo de lenguaje como `Gemma3ForCausalLM` con los tensores sin alterar, y cuantizar los pesos a 4 bits mediante GPTQ (esquema W4A16) con `compressed-tensors`, excluyendo `lm_head`.

El resultado es un modelo de 3.880.263.168 parametros (aproximadamente 3,9 mil millones) empaquetado en un repositorio de 3,0 GB, pensado para servir traduccion en vLLM con un consumo de VRAM notablemente inferior al del modelo original en bf16. La plantilla de chat no es la estructurada de TranslateGemma, sino la nativa de Gemma 3, en la que el mensaje de sistema se inyecta en el primer turno de usuario.

Su relevancia es practica: ofrece un checkpoint listo para desplegar en produccion con `vllm serve` y `--max-model-len 4096`, con calibracion realizada sobre 512 prompts en formato de traductor construidos a partir de `google/wmt24pp`. Es, por tanto, una pieza de infraestructura mas que un modelo de proposito general, y su interes radica en la receta de cuantizacion y en la eliminacion de la modalidad visual para reducir coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text, `Gemma3ForCausalLM`), sin codificador de vision |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (segun el comando de servicio recomendado; el maximo nativo del modelo base no se especifica en la informacion disponible) |
| Tipos de cuantizacion | W4A16 (pesos a 4 bits, activaciones a 16 bits) mediante GPTQ y `compressed-tensors`; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible (la calibracion cubre ingles hacia y desde los idiomas objetivo de la voz, sin listado explicito) |
| Licencia | Gemma Terms of Use, sujeta a la Gemma Prohibited Use Policy |
| Formato de pesos | safetensors (compressed-tensors), libreria vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3, guardado como `Gemma3ForCausalLM`. Respecto al checkpoint original `google/translategemma-4b-it` (commit `10042cb0e6e7fdce748996a71dc3dc432a4e0c89`), se han eliminado el codificador de vision y su proyector; los tensores del modelo de lenguaje se mantienen sin cambios respecto al original. La construccion se realiza con el script `build_translategemma.py` del repositorio `vladbehash/dubber`, dentro de la libreria `dub-pipeline`.

La cuantizacion se llevo a cabo con llm-compressor 0.14.0 aplicando `GPTQModifier(targets="Linear", scheme="W4A16", ignore=["lm_head"])`. El conjunto de calibracion consta de 512 prompts en el formato de traductor de dubber, generados a partir de `google/wmt24pp` (commit `fd7405c06494bc66a57b25f55d217a72f96e60dc`, licencia Apache-2.0), con pares ingles hacia y desde los idiomas objetivo de la voz. No se especifica en la informacion disponible si hubo etapas adicionales de RLHF o DPO en esta variante; el ajuste instructivo procede del modelo base de Google. La plantilla de chat es la propia de Gemma 3, no la estructurada de TranslateGemma, lo que cambia el formato de los prompts respecto al original.

## Capacidades

- Traduccion automatica de texto entre ingles y los idiomas objetivo cubiertos por la calibracion, heredada del ajuste de TranslateGemma.
- Generacion de texto conversacional en formato chat con la plantilla de Gemma 3.
- Procesamiento de prompts multi-turno con el mensaje de sistema insertado en el primer turno de usuario.
- Inferencia optimizada en vLLM mediante pesos cuantizados W4A16 con `compressed-tensors`.
- Sin capacidades de vision: el codificador de vision y su proyector han sido eliminados del checkpoint.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Traduccion en pipelines de doblaje y subtitulado: el modelo se integra en los workers de GPU del servidor myDubber para traducir guiones y dialogos, aprovechando la calibracion sobre el formato de traductor de dubber y pares de `wmt24pp`.
- Servicio de traduccion de bajo coste en produccion: con pesos a 4 bits y 3,0 GB de repositorio, permite desplegar multiples instancias en una sola GPU para atender peticiones concurrentes con `vllm serve`.
- Traduccion ingles a idiomas de destino de la voz y viceversa: adecuado para flujos de localizacion de contenido donde el par de idiomas coincide con los cubiertos en la calibracion.
- Preprocesado de corpus multilingues: generacion de traducciones preliminares a gran escala antes de una revision humana, con contexto de hasta 4096 tokens para parrafos completos.
- Backend de traduccion en aplicaciones de mensajeria o atencion al cliente: el formato chat de Gemma 3 permite mantener conversaciones multi-turno donde el usuario solicita traducciones sucesivas.
- Despliegue en infraestructura con VRAM limitada: al prescindir del codificador de vision y usar W4A16, encaja en GPUs de consumo o en instancias cloud economicas para tareas de traduccion en tiempo casi real.
- Evaluacion y experimentacion con cuantizacion GPTQ: sirve como referencia para comparar la perdida de calidad de W4A16 frente al modelo base en tareas de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en W4A16 ocupan aproximadamente 2 GB (3,88 mil millones de parametros a 4 bits), mas overhead de activaciones, cache KV y el `lm_head` sin cuantizar; con contexto de 4096 tokens se puede estimar un consumo total en el rango de 4 a 6 GB, aunque la cifra exacta no esta disponible en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el modelo es apto para GPUs consumer con 8 GB o mas de VRAM, y para instancias profesionales como A100 o H100 si se requiere mayor concurrencia.
- Cabe en GPU consumer: si, previsiblemente en modelos con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante), aunque no se confirma explicitamente.
- Opciones de despliegue: vLLM es el soporte oficial indicado (`vllm serve <this repo> --max-model-len 4096`); el formato compressed-tensors esta pensado para vLLM. Otros runners como llama.cpp, Ollama o TGI no se mencionan y requeririan conversion adicional.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mydubber-org/translategemma-4b-text-W4A16 | 3,88 B | 4096 (configurado) | W4A16 GPTQ | Gemma Terms of Use | Hugging Face, vLLM |
| google/translategemma-4b-it | no disponible | no disponible | bf16 (original) | Gemma Terms of Use | Hugging Face |
| Gemma 3 4B (familia base) | no disponible | no disponible | multiples | Gemma Terms of Use | Hugging Face, Ollama, llama.cpp |

La comparativa se limita a los modelos de los que se dispone informacion en esta ficha; no se han identificado en la informacion proporcionada alternativas especificas de traduccion del mismo tamano con datos verificables de rendimiento.

## Limitaciones y advertencias

- Es una version modificada de Gemma: se ha eliminado el codificador de vision y se han cuantizado los pesos a 4 bits, por lo que no es equivalente al modelo original de Google.
- La cuantizacion W4A16 puede introducir degradacion de calidad en la traduccion respecto al checkpoint en bf16; no se aportan metricas que cuantifiquen esa perdida.
- La plantilla de chat es la de Gemma 3 y no la estructurada de TranslateGemma, lo que puede alterar el comportamiento esperado si se reutilizan prompts disenados para el modelo original.
- La calibracion se limita a 512 prompts de `wmt24pp` en pares ingles-idiomas objetivo de la voz; el rendimiento fuera de esos pares o dominios no esta validado.
- No se especifican los idiomas soportados ni evaluaciones multilingues, lo que impide garantizar calidad fuera del ambito de calibracion.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en textos largos o idiomas poco representados en la calibracion.
- Uso comercial sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que deben transmitirse a cualquier tercero al que se distribuya el modelo.
- El modelo se publica como componente interno de un servidor concreto (myDubber); su mantenimiento y soporte dependen del autor y no de Google.
- No se han publicado benchmarks ni evaluaciones independientes en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mydubber-org/translategemma-4b-text-W4A16
- Modelo base: https://huggingface.co/google/translategemma-4b-it
- Script de construccion: https://github.com/vladbehash/dubber/blob/main/libs/dub-pipeline/scripts/build_translategemma.py
- Dataset de calibracion: https://huggingface.co/datasets/google/wmt24pp
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
