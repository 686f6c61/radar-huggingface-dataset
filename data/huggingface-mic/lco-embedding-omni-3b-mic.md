# huggingface-mic/LCO-Embedding-Omni-3B-mic

## Resumen

LCO-Embedding-Omni-3B-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo utilizable. Se trata de una version reducida del checkpoint LCO-Embedding/LCO-Embedding-Omni-3B, un modelo de embeddings omnicanal basado en la arquitectura Qwen2_5OmniThinker. El repositorio empaqueta pesos recortados, ejemplos de uso ejecutables y expectativas de framework en un unico lugar, con el objetivo de servir como fixture de integracion continua para validar el pipeline de Transformers.

El fixture conserva la misma arquitectura que el modelo original (Qwen2_5OmniThinkerForConditionalGeneration) pero con una configuracion drasticamente reducida: 2 capas en el encoder de audio y 2 capas en el transformer de texto. Los pesos son aleatorios (semilla 17) y no han sido entrenados. El unico criterio que cumplen es la puerta de sensibilidad a la entrada: cualquier perturbacion de las entradas del contrato mueve los logits al menos 0,001.

Por tanto, esta ficha documenta un artefacto de ingenieria, no un modelo de produccion. Su relevancia es para desarrolladores que mantienen integraciones de Transformers y necesitan un objetivo ligero y determinista para tests de contrato. Cualquier uso como modelo real de embeddings, generacion o razonamiento seria incorrecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2_5OmniThinkerForConditionalGeneration (transformer multimodal recortado) |
| Parametros totales | 21.121.152 (21,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reproduce la topologia de Qwen2_5OmniThinkerForConditionalGeneration con una configuracion encogida mediante la regla generica de sweep.py: audio encoder_layers = 2 y text num_hidden_layers = 2. Los nombres de tensores coinciden con los del checkpoint real LCO-Embedding/LCO-Embedding-Omni-3B, y los ficheros de procesador (tokenizer.json, tokenizer_config.json, preprocessor_config.json, chat_template.jinja, merges.txt, vocab.json, added_tokens.json, special_tokens_map.json, generation_config.json, config_sentence_transformers.json, sentence_bert_config.json, modules.json) se copian byte a byte desde el modelo base.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y solo pasaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, attention_mask:all_ones, con 0,893). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture 8fd60af1aa99 agrupa todos los checkpoints con ficheros de procesador identicos y config coincidente tras el recorte.

## Capacidades

- No es un modelo funcional: no genera texto, no produce embeddings utiles ni razona.
- Sirve como fixture de contrato para validar la carga, el forward, el calculo de perdida y los gradientes en Transformers.
- Expone la misma interfaz de procesador que el modelo base (tokenizer, preprocessor de audio, chat template), lo que permite testear pipelines de preprocesado.
- Compatible con ejecucion en float32, bfloat16 y float16 sin valores no finitos.
- No soporta tool calling, agentes, vision ni audio reales de forma significativa, porque los pesos son aleatorios.
- Multilingue: no disponible; hereda el tokenizer del modelo base, pero sin capacidad linguistica real.

## Casos de uso

- Tests de integracion en CI para Transformers: cargar el fixture con AutoModel y AutoProcessor y verificar que el forward devuelve logits con la forma esperada, sin descargar el checkpoint de 3B.
- Validacion de contratos de API interna: comprobar que los nombres de tensores y las firmas de procesador coinciden con el modelo base antes de un despliegue.
- Pruebas de regresion de tokenizer y chat template: al copiarse byte a byte, cualquier cambio en el pipeline de preprocesado se detecta comparando salidas.
- Verificacion de dtypes: ejecutar forward, loss y backward en float32, bfloat16 y float16 para asegurar que el codigo de entrenamiento no produce NaN ni infinitos.
- Desarrollo de utilidades de serializacion: probar cargas y guardados de safetensors con un repositorio de 0,1 GB en lugar de varios GB.
- Formacion y demos de tooling: mostrar el flujo de build_fixtures.py y el manifiesto integration.json sin consumir recursos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, MTEB) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (21,1 M de parametros, unos 42 MB de pesos) mas overhead de activaciones y procesador.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer y en CPU sin problema; tamano del repo 0,1 GB.
- Opciones de despliegue: Transformers con PyTorch es el camino documentado (integrations/transformers/usage.md); vLLM, llama.cpp, Ollama o TGI no estan soportados de forma oficial para este fixture.
- Latencia y throughput: no disponibles de forma publicada; por tamano, el forward es del orden de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LCO-Embedding-Omni-3B-mic | 21,1 M | no disponible | Fixture de test | no disponible | Hugging Face (huggingface-mic) |
| LCO-Embedding/LCO-Embedding-Omni-3B | no disponible (nombre sugiere 3B) | no disponible | Embeddings omnicanal reales | no disponible | Hugging Face (LCO-Embedding) |
| Qwen2.5-Omni-3B (arquitectura base) | no disponible en la informacion | no disponible | Modelo multimodal generativo | no disponible | Hugging Face (Qwen) |

La comparativa directa con alternativas funcionales no es significativa: el fixture no compite en calidad ni rendimiento, solo en ligereza para tests.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado semantico.
- Etiquetado como test-artifact para excluirlo de busquedas de modelos candidatos; no debe aparecer en catalogos de produccion.
- Sin licencia declarada: no se puede asumir permiso de uso comercial ni redistribucion mas alla de lo que permita el modelo base.
- Idiomas y contexto no disponibles; no inferir capacidades del nombre "Omni-3B".
- Riesgo de confusion: el nombre incluye "3B" pero el fixture tiene 21,1 M de parametros; verificar siempre el tamano real en safetensors.
- No apto para evaluaciones de sesgo, alucinacion o calidad: cualquier metrica seria enganosa.
- Depende de la regla de recorte de sweep.py; cambios en esa regla pueden invalidar la clave de fixture 8fd60af1aa99.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/LCO-Embedding-Omni-3B-mic
- Modelo base: https://huggingface.co/LCO-Embedding/LCO-Embedding-Omni-3B
- Como se recorto el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/LCO-Embedding-Omni-3B-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de recorte: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
