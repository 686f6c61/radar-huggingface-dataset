# huggingface-mic/recurrentgemma-2b-mic

## Resumen

`recurrentgemma-2b-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face, no un modelo entrenado utilizable. Se construye a partir de la arquitectura de `google/recurrentgemma-2b` (RecurrentGemma, un modelo hibrido de atencion local y capas recurrentes de tipo Griffin) pero con una configuracion reducida a 3 capas ocultas y pesos aleatorios generados con semilla 17. El resultado es un checkpoint de 24.020.160 parametros (24,0 M) que conserva los nombres de tensores, el tokenizador y los ficheros de procesador del modelo original byte a byte.

Su proposito es servir como fixture de integracion para el proyecto `transformers-mic`: permite validar contratos de ejecucion (carga, forward, loss, gradientes, sensibilidad a entradas) sin necesidad de descargar ni ejecutar el modelo real de 2B parametros. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos y advierte de que no es un modelo usable.

Por tanto, esta ficha documenta un objeto de ingenieria de software (un mock de checkpoint) y no un modelo de lenguaje desplegable. Cualquier evaluacion de capacidades, benchmarks o uso en produccion carece de sentido sobre este repositorio; los datos tecnicos que se ofrecen a continuacion describen el fixture y, cuando procede, la arquitectura del modelo base del que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RecurrentGemma (hibrida: atencion local + capas recurrentes Griffin), clase `RecurrentGemmaForCausalLM` |
| Parametros totales | 24.020.160 (fixture reducido; el modelo base tiene ~2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el fixture; el modelo base RecurrentGemma-2B declara 8.192 tokens en su model card original, no verificable en esta informacion |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; validado tambien en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura RecurrentGemma: un transformer hibrido que combina atencion local por ventanas con capas recurrentes lineales basadas en el mecanismo Griffin, lo que reduce el coste de memoria de la cache KV frente a un transformer denso clasico. El autor lo ha generado reduciendo `num_hidden_layers` a 3 mediante la regla generica de `sweep.py` del repositorio `transformers-mic`; conserva los mismos nombres de tensores que el checkpoint real y copia sin modificar `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model` y `tokenizer_config.json` de `google/recurrentgemma-2b`.

No hay entrenamiento. Los pesos son aleatorios (semilla 17) y solo se aceptaron tras superar una puerta de sensibilidad a las entradas: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, dio 1,25). El checkpoint es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es `e502fbf30339` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni resuelve tareas de NLP.
- Sirve como fixture de integracion para validar la carga de `RecurrentGemmaForCausalLM` en Transformers.
- Permite comprobar contratos de entrada/salida: formas de tensores, `attention_mask`, `generation_config` y tokenizador.
- Valida la ejecucion en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- Verifica la sensibilidad de los logits ante perturbaciones de las entradas del contrato.
- No soporta tool calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles (solo se hereda el tokenizador del modelo base).

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture en un job de GitHub Actions para verificar que una version nueva de Transformers sigue instanciando `RecurrentGemmaForCausalLM` sin errores, sin descargar los ~5 GB del modelo real.
- Desarrollo de kernels o parches de atencion: validar que las formas de tensores y los nombres de parametros coinciden con el checkpoint oficial antes de probar en el modelo de 2B.
- Test de cuantizacion y dtypes: comprobar que un pipeline de conversion (por ejemplo, a bfloat16 o float16) produce tensores finitos y mantiene el contrato de salida.
- Validacion de tokenizadores: al copiar los ficheros de procesador byte a byte, sirve para testear pipelines de tokenizacion identicos a los de `google/recurrentgemma-2b` sin cargar los pesos completos.
- Regresion de contratos de API: el manifest `integration.json` y el directorio `integrations/transformers/expectations` permiten comparar comportamiento esperado frente a real en cada release.
- Formacion y demos: ilustrar como se construye un fixture slim de un modelo grande (regla de shrink, puerta de sensibilidad, hashes en `build.json`) en charlas o documentacion interna.
- Reproducibilidad: reconstruir el fixture con `python example/build_fixtures.py --fixture recurrentgemma-2b-mic` y comparar hashes con los registrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios; cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) seria inaplicable.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (24 M parametros, ~96 MB de pesos) y menos aun en float16 (~48 MB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: Transformers (via `RecurrentGemmaForCausalLM`); el soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 3 capas, la inferencia es practicamente instantanea, pero sin valor representativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/recurrentgemma-2b-mic` | 24,0 M (fixture) | no disponible | Fixture de test | no disponible | Hugging Face |
| `google/recurrentgemma-2b` | ~2B | 8.192 (segun model card original) | Modelo de lenguaje real | Gemma Terms of Use (segun el modelo base; no verificable en esta informacion) | Hugging Face |
| Fixtures slim de otros modelos en `transformers-mic` | variable | no disponible | Fixture de test | no disponible | Hugging Face |

La comparativa con modelos de la misma categoria (LLM de ~2B) no procede: este repositorio no es un LLM operativo. La unica comparacion significativa es con el checkpoint original `google/recurrentgemma-2b`, del que deriva y del que solo conserva la arquitectura y el tokenizador.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida no tiene significado linguistico.
- Etiquetado `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en la informacion disponible; el uso comercial no puede asumirse y depende de los terminos del modelo base `google/recurrentgemma-2b`.
- El contexto real del fixture no esta documentado; la cifra de 8.192 tokens corresponde al modelo base y no se ha verificado aqui.
- Solo se han validado tres dtypes (float32, bfloat16, float16); no hay garantia sobre cuantizaciones de 4 u 8 bits.
- Riesgo de confusion: el nombre y la estructura imitan a un checkpoint real, por lo que herramientas automaticas podrian tratarlo como modelo de produccion.
- Sin datos de sesgo, alucinacion ni evaluacion multilingue: no aplica, al no ser un modelo entrenado.
- La fecha de creacion indicada (2026-10-29) es posterior a la de esta ficha; conviene verificar la vigencia del repositorio antes de depender de el.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/recurrentgemma-2b-mic
- Modelo base: https://huggingface.co/google/recurrentgemma-2b
- Manifest de contrato (`integration.json`): https://huggingface.co/huggingface-mic/recurrentgemma-2b-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/recurrentgemma-2b-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/recurrentgemma-2b-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/recurrentgemma-2b-mic/blob/main/build.json
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/recurrentgemma-2b-mic.html
- Repositorio `transformers-mic` (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
