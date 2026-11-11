# huggingface-mic/gpt-neo-125m-mic

## Resumen
`gpt-neo-125m-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de un "fixture" reducido de 3.447.232 parametros que reproduce la arquitectura y los ficheros de procesador de `EleutherAI/gpt-neo-125m`, pero con pesos aleatorios (semilla 17). Su proposito es servir como objeto de test para el proyecto `transformers-mic`, que valida contratos de integracion entre checkpoints y frameworks.

El modelo conserva el mismo grafo `GPTNeoForCausalLM` que el checkpoint original, con la configuracion reducida a `num_layers = 2` mediante la regla generica de `sweep.py`. Los ficheros de tokenizacion (`tokenizer.json`, `vocab.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer_config.json`, `generation_config.json`) se copian byte a byte desde el modelo base, de modo que el contrato de entradas y salidas es identico al del checkpoint real.

Es relevante unicamente en el contexto de ingenieria de pruebas: permite validar pipelines de carga, serializacion y ejecucion con un repositorio minimo (0.0 GB) y sin coste de computo. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. Cualquier uso distinto del testeo de infraestructura carece de sentido, ya que sus pesos no han sido entrenados y su salida es esencialmente ruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPTNeoForCausalLM (transformer decoder-only, configuracion reducida a 2 capas) |
| Parametros totales | 3.447.232 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del modelo base, no verificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; el autor indica que el forward es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only de tipo GPT-Neo, con atencion causal estandar y sin innovaciones adicionales. El autor indica que se ha aplicado una regla generica de reduccion (`sweep.py`, `num_layers = 2`) sobre el checkpoint `EleutherAI/gpt-neo-125m`, manteniendo los mismos nombres de tensor que el modelo real. Los ficheros de procesador se copian byte a byte del checkpoint original, por lo que la interfaz de tokenizacion y generacion es identica.

No ha habido entrenamiento. Los pesos se inicializan con semilla 17 y se aceptan porque superan una "input-sensitivity gate": cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, mueve 0,626). El autor documenta que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. El proceso de construccion esta registrado en `build.json` (fuentes fijadas, resultados de la gate y hashes de ficheros) y se puede reproducir con `python example/build_fixtures.py --fixture gpt-neo-125m-mic`.

## Capacidades
- Carga y ejecucion como `GPTNeoForCausalLM` con pesos safetensors en float32.
- Tokenizacion compatible con `EleutherAI/gpt-neo-125m` (vocabulario y merges copiados byte a byte).
- Generacion de logits con formas y nombres de tensor identicos al checkpoint real, util para validar contratos de integracion.
- Forward, calculo de loss y retropropagacion finitos en float32, bfloat16 y float16.
- No soporta tool calling, agentes, vision, audio ni modo thinking: no es un modelo entrenado.
- No tiene capacidades multilingues reales: la tokenizacion existe, pero la salida no es linguistica.
- Sirve como fixture reproducible para tests de frameworks (Transformers y otros integrados en `transformers-mic`).

## Casos de uso
- Test de integracion en Transformers: cargar el repositorio con `AutoModelForCausalLM.from_pretrained` y verificar que la configuracion reducida y los nombres de tensor coinciden con el contrato declarado en `integration.json`.
- Validacion de pipelines de tokenizacion: comprobar que los ficheros de procesador copiados byte a byte producen los mismos ids que el checkpoint original para un conjunto de prompts fijo.
- Pruebas de serializacion y compatibilidad de dtypes: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar regresiones de precision en frameworks o kernels.
- CI/CD de librerias de inferencia: usar el repositorio como fixture ligero (0.0 GB) en la suite de tests de vLLL, TGI u otros runners, sin necesidad de descargar checkpoints de cientos de MB.
- Validacion de contratos de integracion: comparar las expectativas declaradas en `integrations/transformers/expectations` con el comportamiento real del modelo en cada version de Transformers.
- Reproducibilidad de artefactos: reconstruir el fixture con `build_fixtures.py` y verificar hashes contra `build.json` para auditar la cadena de suministro de fixtures de test.
- Pruebas de sensibilidad a entradas: reproducir la gate de sensibilidad (perturbaciones de `attention_mask`, `input_ids`, etc.) para validar que un fixture nuevo mueve los logits por encima del umbral.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido entrenado y sus pesos son aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de significado.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,4 M de parametros, aproximadamente 14 MB de pesos mas overhead de activaciones y tokenizador).
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM; tambien ejecutable en CPU sin problemas.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (via `AutoModelForCausalLM`), llama.cpp no soporta GPT-Neo de forma nativa en todas sus versiones, vLLM y TGI no estan pensados para fixtures de este tamano; el uso previsto es la carga directa en tests.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones. Por el tamano, la latencia seria del orden de milisegundos en CPU y sub-milisegundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Proposito |
|---|---|---|---|---|---|
| `huggingface-mic/gpt-neo-125m-mic` | 3,4 M (fixture) | no disponible | No (pesos aleatorios, semilla 17) | no disponible | Fixture de test |
| `EleutherAI/gpt-neo-125m` | 125 M | 2.048 tokens (segun model card publica del base) | Si | MIT (segun el checkpoint original) | Modelo de lenguaje real |
| `EleutherAI/gpt-neo-1.3B` | 1,3 B | 2.048 tokens | Si | MIT | Modelo de lenguaje real |
| `huggingface-mic/gpt-neo-125m-mic` (variante) | no disponible | no disponible | No | no disponible | no disponible |

La comparativa con alternativas reales solo tiene sentido a nivel de contrato de integracion: el fixture replica la interfaz de `EleutherAI/gpt-neo-125m` pero no su comportamiento linguistico. Frente a otros fixtures del ecosistema `transformers-mic`, la diferencia esta en la clave de fixture (`f8d31511cb68`) y en la configuracion reducida aplicada.

## Limitaciones y advertencias
- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido linguistico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Sesgos conocidos: no aplica, al no haber entrenamiento; los sesgos del modelo base no se heredan porque los pesos no provienen de el.
- Riesgo de alucinacion: total, en el sentido de que toda la salida es ruido sin relacion con la entrada.
- Limitaciones de contexto e idioma: no verificadas en la informacion disponible; la configuracion reducida puede alterar el comportamiento respecto al base.
- Restricciones de licencia: la licencia no esta declarada en el repositorio; el modelo base `EleutherAI/gpt-neo-125m` se publica bajo MIT, pero la licencia de este fixture no se especifica.
- Caveat de produccion: no usar como sustituto del checkpoint real en benchmarks, evaluaciones de calidad ni demos; solo para tests de infraestructura.
- El tamano del repo es 0.0 GB, lo que sugiere que los pesos pueden no estar completos o que el reporte de Hugging Face redondea; conviene verificar la integridad de los ficheros antes de usarlo en CI.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/gpt-neo-125m-mic
- Modelo base: https://huggingface.co/EleutherAI/gpt-neo-125m
- Manifest de contrato: `integration.json` (referenciado en la model card, dentro del repositorio)
- Uso con Transformers: `integrations/transformers/usage.md`
- Expectativas de Transformers: `integrations/transformers/expectations`
- Procedencia del fixture: `build.json`
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gpt-neo-125m-mic.html
- Codigo de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio del proyecto: https://github.com/huggingface/transformers-mic
