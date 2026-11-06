# huggingface-mic/LFM2-8B-A1B-mic

## Resumen

LFM2-8B-A1B-mic es un artefacto de prueba publicado por la organizacion huggingface-mic, no un modelo de lenguaje utilizable. Se trata de un fixture de 4.355.752 parametros (4,4 millones) construido a partir de la arquitectura del modelo LiquidAI/LFM2-8B-A1B, pero con pesos aleatorios (semilla 17) y una configuracion reducida a 4 capas ocultas. Su proposito es servir como banco de pruebas reproducible para validar integraciones de frameworks (en concreto Transformers) sin necesidad de descargar el checkpoint real de 8B parametros.

El repositorio empaqueta en un unico lugar los pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework (integration.json, integrations/transformers/usage.md y integrations/transformers/expectations). Los ficheros de procesador (tokenizer, chat template, generation config, special tokens, LICENSE) se copian byte a byte del modelo original, de modo que el fixture conserva los mismos nombres de tensores y el mismo contrato de entrada que el checkpoint real.

Es relevante ahora porque permite a desarrolladores de herramientas (vLLM, TGI, llama.cpp, Transformers) ejecutar tests de integracion rapidos y ligeros contra la arquitectura Lfm2MoeForCausalLM sin consumir VRAM ni ancho de banda. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos. No debe confundirse con un modelo entrenado: sus salidas no tienen valor semantico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2MoeForCausalLM (transformer MoE, configuracion reducida a 4 capas) |
| Parametros totales | 4.355.752 (4,4 M) |
| Parametros activos | no disponible (el fixture no documenta el reparto de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finite en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero no se especifica el tipo) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `Lfm2MoeForCausalLM` del modelo LiquidAI/LFM2-8B-A1B, pero con una configuracion encogida mediante la regla generica de `sweep.py` (num_hidden_layers = 4). Conserva los mismos nombres de tensores que el checkpoint real y se guarda en bfloat16, el dtype por defecto del modelo base. Los pesos son aleatorios con semilla 17 y no han pasado por ningun proceso de entrenamiento, RLHF ni DPO.

El unico criterio de calidad aplicado es una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, produce 0,258). Con eso se considera que el fixture es apto para tests de integracion. Se verifica ademas que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. El proceso de construccion esta documentado en `build_fixtures.py` y los hashes y fuentes fijadas se registran en `build.json`.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no escribe codigo ni resuelve matematicas.
- Sirve como fixture de integracion para validar la carga, el forward y el shape de salida de la arquitectura Lfm2MoeForCausalLM en Transformers.
- Conserva el tokenizer y el chat template del modelo base, por lo que permite probar pipelines de tokenizacion y formateo de prompts.
- Permite verificar contratos de framework (integration.json) y comparar expectativas de salida (integrations/transformers/expectations).
- Soporta ejecucion en float32, bfloat16 y float16 con gradientes finitos, util para tests de backward.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales.

## Casos de uso

- Tests de integracion en CI para Transformers: cargar el fixture y comprobar que `Lfm2MoeForCausalLM` instancia, hace forward y devuelve logits con el shape esperado, sin descargar el checkpoint de 8B.
- Validacion de nuevas versiones de frameworks (vLLM, TGI, llama.cpp): ejecutar la suite de expectativas contra el fixture para detectar regresiones de compatibilidad con la arquitectura LFM2 MoE.
- Desarrollo de tooling de tokenizacion: usar el tokenizer copiado byte a byte del modelo base para probar chat templates y special tokens sin coste de descarga.
- Pruebas de mixed precision: verificar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de escalar al modelo real.
- Benchmarking de pipelines de carga de safetensors: medir tiempos de carga y verificacion de hashes con un repositorio de 0,0 GB.
- Reproducibilidad de experimentos: el `build.json` con fuentes fijadas y hashes permite reconstruir el fixture de forma determinista con `build_fixtures.py`.
- Formacion y demos: ilustrar como se construye un fixture de modelo encogido a partir de un checkpoint real para docencia o documentacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (4,4 M de parametros en bfloat16 ocupan unos 9 MB; el resto es overhead de runtime).
- GPU recomendadas: cualquier GPU consumer, incluida una GTX 1050 o una iGPU; tambien funciona en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (uso previsto segun la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 4 capas, la latencia es del orden de milisegundos, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2-8B-A1B-mic | 4,4 M | no disponible | Fixture de test | no disponible | Hugging Face (huggingface-mic) |
| LiquidAI/LFM2-8B-A1B | 8B (MoE, A1B activos) | no disponible en esta ficha | Modelo de lenguaje real | no disponible en esta ficha | Hugging Face (LiquidAI) |
| Fixtures de test de otras arquitecturas (p. ej. TinyLlama, SmolLM) | 1-100 M | variable | Tests de integracion | variable | Hugging Face |

La comparativa directa con modelos de produccion no procede: el fixture solo comparte arquitectura y tokenizer con LFM2-8B-A1B, no pesos ni capacidades.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en la model card; el fichero LICENSE se copia del modelo base, pero conviene verificar los terminos de LiquidAI antes de redistribuir.
- No se documentan sesgos, idiomas ni contexto porque no aplica: no hay entrenamiento.
- Riesgo de confusion: el nombre incluye "8B-A1B" pero el repositorio contiene solo 4,4 M de parametros; verificar siempre el tamano antes de usarlo.
- El fixture solo cubre checkpoints cuyos ficheros de procesador sean byte-identicos y cuya config coincida tras el encogido (fixture key `fac5a8d2dc0e`); no sirve para otras variantes.
- No se garantiza compatibilidad con frameworks distintos de Transformers; las expectativas publicadas son especificas de ese framework.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/LFM2-8B-A1B-mic
- Modelo base: https://huggingface.co/LiquidAI/LFM2-8B-A1B
- Contrato de integracion: https://huggingface.co/huggingface-mic/LFM2-8B-A1B-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/LFM2-8B-A1B-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/LFM2-8B-A1B-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/LFM2-8B-A1B-mic/blob/main/build.json
- Documentacion del proceso de encogido: https://huggingface-mic-mic-coverage.static.hf.space/shrink/LFM2-8B-A1B-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de encogido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
