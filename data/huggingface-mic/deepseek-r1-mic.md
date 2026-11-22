# huggingface-mic/DeepSeek-R1-mic

## Resumen

DeepSeek-R1-mic es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* (muestra reducida) construido a partir de la arquitectura de `deepseek-ai/DeepSeek-R1` mediante la herramienta `build_fixtures.py` del proyecto `transformers-mic`. Su proposito es servir como banco de pruebas para validar que frameworks de inferencia y utilidades de integracion cargan, ejecutan y serializan correctamente la arquitectura DeepSeek V3 sin necesidad de descargar el checkpoint completo de 671.000 millones de parametros.

El repositorio contiene pesos con inicializacion aleatoria (semilla 17), guardados en bfloat16, con la misma estructura de tensores y los mismos ficheros de procesador (tokenizer, `configuration_deepseek.py`, `modeling_deepseek.py`) que el modelo original. La configuracion se ha reducido a 2 capas ocultas manteniendo el identificador de arquitectura `DeepseekV3ForCausalLM`. El conteo real de parametros segun los ficheros safetensors es de 17.819.236, coherente con la cifra de 17,8 millones que declara la model card.

Su relevancia es exclusivamente tecnica y de integracion: permite a desarrolladores de frameworks (Transformers, vLLM, TGI, llama.cpp) escribir tests de compatibilidad de la arquitectura DeepSeek V3 de forma rapida y ligera. La etiqueta `test-artifact` esta puesta deliberadamente para excluirlo de busquedas de modelos candidatos. Cualquier uso como modelo de lenguaje en produccion carece de sentido: los pesos son aleatorios y no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV3ForCausalLM (transformer denso/MoE reducido a fixture) |
| Parametros totales | 17.819.236 (17,8 M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (fichero LICENSE copiado del modelo base) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `DeepseekV3ForCausalLM` pero con la configuracion reducida a 2 capas ocultas (`num_hidden_layers: 2`) mediante la regla generica de `sweep.py`. Los ficheros de procesador (`LICENSE`, `configuration_deepseek.py`, `generation_config.json`, `modeling_deepseek.py`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde `deepseek-ai/DeepSeek-R1`, de modo que la tokenizacion y el codigo de modelado son identicos a los del modelo real. Los tensores conservan exactamente los mismos nombres que el checkpoint original.

No ha habido entrenamiento. Los pesos se inicializan de forma aleatoria con semilla 17 y solo se valida que pasan una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, arroja 0,314). Se verifica ademas que el modelo es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. El fichero `build.json` registra fuentes fijadas, resultados de las puertas y hashes de ficheros.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni razona, ya que los pesos son aleatorios.
- Sirve como fixture de integracion para validar la carga de la arquitectura DeepSeek V3 en frameworks.
- Permite testear el pipeline de tokenizacion copiado del modelo base (mismo `tokenizer.json`).
- Permite validar forward, calculo de perdida y retropropagacion en float32, bfloat16 y float16.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento de forma real.
- No dispone de capacidades multilingues efectivas.

## Casos de uso

- Tests de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` para verificar que `DeepseekV3ForCausalLM` se instancia y ejecuta sin errores en CI, sin descargar el checkpoint de 671.000 millones de parametros.
- Validacion de kernels de atencion: comprobar que las implementaciones de atencion (FlashAttention, SDPA) aceptan la configuracion reducida y producen salidas finitas.
- Pruebas de serializacion y conversion: verificar pipelines de conversion a GGUF u otros formatos usando una arquitectura realista pero de 0,1 GB.
- Desarrollo de herramientas de inspeccion de pesos: validar que los nombres de tensores coinciden con el checkpoint real antes de operar sobre el modelo completo.
- Tests de regresion en frameworks de serving: comprobar que vLLM o TGI aceptan la configuracion DeepSeek V3 en un entorno con recursos minimos.
- Validacion de tokenizadores: usar el `tokenizer.json` copiado para tests de tokenizacion identicos a los del modelo base sin coste de descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los 17,8 M de parametros; el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: Transformers (con `trust_remote_code` por el codigo custom), y potencialmente otros frameworks que acepten la arquitectura reducida.
- Latencia y throughput: no disponibles; al ser un fixture no se caracteriza rendimiento real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-mic | 17,8 M | no disponible | Fixture de test | no disponible | Hugging Face |
| deepseek-ai/DeepSeek-R1 | 671.000 M (MoE) | no disponible en la informacion | Modelo de razonamiento real | no disponible en la informacion | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Tests de integracion | no disponible | Hugging Face |

La comparativa relevante es con el modelo base: comparten arquitectura y ficheros de procesador, pero difieren en escala (17,8 M frente a 671.000 M) y en naturaleza (pesos aleatorios frente a pesos entrenados). No se dispone de datos para comparar con alternativas de la misma categoria de fixtures.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas linguisticas utiles; no debe usarse en produccion ni en demos.
- Etiquetado como `test-artifact` de forma explicita por el autor para excluirlo de busquedas de modelos candidatos.
- La licencia no esta declarada en los metadatos; el fichero LICENSE se copia del modelo base, por lo que las condiciones reales dependen de `deepseek-ai/DeepSeek-R1`.
- Requiere `trust_remote_code` por incluir `modeling_deepseek.py` y `configuration_deepseek.py` personalizados.
- No se han documentado sesgos, riesgos de alucinacion ni limitaciones de contexto o idioma porque no aplica a un fixture sin entrenamiento.
- El conteo de parametros aparece duplicado en la model card (16,6 M y 17,8 M); el dato de safetensors confirma 17.819.236.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/DeepSeek-R1-mic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/DeepSeek-R1-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
