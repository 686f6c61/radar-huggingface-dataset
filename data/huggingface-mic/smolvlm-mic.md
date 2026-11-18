# huggingface-mic/smolvlm-mic

## Resumen

smolvlm-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo entrenado ni utilizable en producción. Se trata de una version reducida del modelo multimodal HuggingFaceTB/SmolVLM2-2.2B-Instruct, con solo 6.578.368 parametros (frente a los 2.200 millones del modelo original), pesos inicializados de forma aleatoria con semilla 17 y arquitectura SmolVLMForConditionalGeneration. Su proposito es servir como fixture reproducible para validar integraciones de frameworks (en concreto Transformers) sin necesidad de descargar el checkpoint completo de 2.2B.

El repositorio incluye los pesos reducidos, un manifiesto de contrato (integration.json), instrucciones de uso ejecutables (integrations/transformers/usage.md), expectativas del framework y la procedencia del fixture (build.json). Los archivos del procesador (tokenizer, chat template, preprocessor config) se copian byte a byte del modelo base, de modo que el fixture cubre cualquier checkpoint cuyo procesador sea identico y cuya config coincida tras el proceso de reduccion.

Es relevante ahora para desarrolladores que trabajan en tooling de inferencia o en la integracion de modelos multimodales en Transformers: permite ejecutar pruebas de contrato, CI y validacion de APIs contra un modelo ligero que comparte nombres de tensores, config y procesador con el original, sin consumir recursos de un modelo de 2.2B. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLMForConditionalGeneration (transformer multimodal, vision + texto) |
| Parametros totales | 6.578.368 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolVLM2-2.2B-Instruct |
| Tipo de artefacto | fixture de prueba (test-artifact) |
| Semilla de inicializacion | 17 (pesos aleatorios) |
| Precision de guardado | float32 |
| Clave de fixture | 9530c0e74c36 |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base SmolVLMForConditionalGeneration, un transformer multimodal que combina un codificador de vision con un decodificador de lenguaje. La reduccion se aplica mediante la regla generica de sweep.py: el componente de vision queda con 2 capas ocultas (vision num_hidden_layers 2) y el componente de texto con 2 capas ocultas (text num_hidden_layers 2). Los nombres de tensores coinciden exactamente con los del checkpoint real, lo que permite validar codigo que espera esa estructura sin cargar los 2.2B parametros.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y solo tuvieron que superar una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, alcanza 0.00274). Los archivos del procesador se copian byte a byte del modelo base: added_tokens.json, chat_template.json, generation_config.json, merges.txt, preprocessor_config.json, processor_config.json, special_tokens_map.json, tokenizer.json, tokenizer_config.json y vocab.json. Los pesos se guardan en float32, el dtype con el que carga por defecto el modelo base, y se verifica que la forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. El fixture se genera con build_fixtures.py y build.json registra las fuentes fijadas, los resultados de la puerta y los hashes de los archivos.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas coherentes.
- Replica la interfaz de SmolVLMForConditionalGeneration, incluida la ruta multimodal vision-texto del modelo base.
- Reutiliza el tokenizer y el chat template del modelo base SmolVLM2-2.2B-Instruct, por lo que valida el pipeline de tokenizacion y formateo de conversaciones.
- Sirve para pruebas de contrato de integracion en Transformers (carga, forward, loss, gradientes).
- Verificado como finito en float32, bfloat16 y float16 para forward, loss y gradientes.
- No dispone de capacidades reales de generacion, razonamiento, codigo, matematicas, tool calling, agentes ni multilingues, al carecer de entrenamiento.
- No soporta thinking mode, audio ni ninguna capacidad especial mas alla de la estructura del modelo base.

## Casos de uso

- Pruebas de CI en Transformers: cargar el fixture en pipelines de integracion continua para verificar que el codigo de carga de SmolVLMForConditionalGeneration no rompe ante cambios de API, sin descargar el checkpoint de 2.2B.
- Validacion de contratos de integracion: usar integration.json e integrations/transformers/expectations para comprobar que una implementacion de framework cumple las expectativas de entradas, salidas y nombres de tensores.
- Desarrollo de tooling de inferencia: probar rutas de forward, calculo de loss y retropropagacion en float32, bfloat16 y float16 sobre un modelo ligero que comparte estructura con el original.
- Pruebas de tokenizer y chat template: validar el formateo de conversaciones y el manejo de tokens especiales reutilizando los archivos del procesador copiados byte a byte del modelo base.
- Verificacion de compatibilidad de checkpoints: comprobar que una herramienta que inspecciona configuraciones y nombres de tensores funciona igual sobre el fixture y sobre el checkpoint real.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture mic-smolvlm-slim` y comparar hashes registrados en build.json para auditar la procedencia.
- Formacion y documentacion: usar el repositorio como ejemplo didactico de como reducir un modelo multimodal manteniendo la interfaz publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (6,6M parametros); el peso de los tensores es de decenas de MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers es la via documentada (integrations/transformers/usage.md); no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; al no ser un modelo funcional, las mediciones de rendimiento no son representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvlm-mic | 6,6M | no disponible | Fixture de prueba | no disponible | Hugging Face |
| HuggingFaceTB/SmolVLM2-2.2B-Instruct | 2,2B | no disponible | Modelo multimodal funcional | no disponible | Hugging Face |
| Otros fixtures de la familia MIC | variable | no disponible | Pruebas de contrato | no disponible | Hugging Face |

La comparacion directa con modelos funcionales no es pertinente: smolvlm-mic solo comparte arquitectura y procesador con SmolVLM2-2.2B-Instruct, pero carece de entrenamiento y de capacidades reales. Su alternativa natural son otros fixtures del mismo proyecto (por ejemplo, el fixture mic-smolvlm-slim que el propio repositorio referencia) y no modelos de produccion.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no son coherentes ni utilizables; no debe desplegarse en produccion bajo ninguna circunstancia.
- Etiquetado como `test-artifact`: el autor lo excluye deliberadamente de la busqueda de modelos candidatos.
- Licencia no disponible: no se puede confirmar el regimen de uso comercial ni de redistribucion.
- Idiomas no disponibles: al no haber entrenamiento, no hay capacidades multilingues reales.
- Longitud de contexto no disponible: la config reducida no documenta la ventana efectiva.
- Riesgo de confusion: el nombre y la estructura pueden llevar a error si se usa sin leer la model card; conviene verificar siempre la etiqueta `test-artifact`.
- Procedencia: la validez del fixture depende de la version fijada del modelo base y de la regla de reduccion de sweep.py; cambios en el checkpoint original pueden invalidar la clave de fixture.
- No sustituye a pruebas con el checkpoint real para validar calidad, sesgos o alucinaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/smolvlm-mic
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/smolvlm-mic.html
- Regla de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
