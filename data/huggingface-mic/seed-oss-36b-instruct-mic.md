# huggingface-mic/Seed-OSS-36B-Instruct-mic

## Resumen

Seed-OSS-36B-Instruct-mic es un artefacto de prueba (test artifact) publicado por el usuario huggingface-mic, no un modelo utilizable. Se trata de un "fixture" reducido de 19,9 millones de parametros construido a partir del modelo real ByteDance-Seed/Seed-OSS-36B-Instruct, con el objetivo de servir como banco de pruebas para validar contratos de integracion en el ecosistema de Transformers (carga, tokenizacion, plantilla de chat y expectativas de framework) sin necesidad de descargar ni ejecutar el checkpoint completo de 36B.

El repositorio incluye pesos "slim" con la misma arquitectura declarada (SeedOssForCausalLM) pero con la configuracion reducida a 2 capas ocultas, junto con los ficheros de procesador copiados byte a byte del modelo original (tokenizer, chat template, generation config, special tokens map). Los pesos son aleatorios (semilla 17) y no han sido entrenados: pasaron unicamente una puerta de sensibilidad de entrada que verifica que las perturbaciones en las entradas mueven los logits al menos 0,001.

Su relevancia es, por tanto, exclusivamente de ingenieria: permite a desarrolladores de frameworks y pipelines de CI comprobar que su integracion con la familia Seed-OSS funciona (nombres de tensores, dtypes, flujo de forward/loss/gradientes) con un repo de 0,1 GB en lugar de decenas de gigabytes. No debe confundirse con el modelo de produccion ni usarse para inferencia real, generacion de texto o evaluacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SeedOssForCausalLM (transformer causal, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 19.931.712 (fixture reducido; el modelo base declara 36B en su nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la metadata del repo (incluye LICENSE.txt copiado del modelo base) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase de modelo SeedOssForCausalLM del checkpoint ByteDance-Seed/Seed-OSS-36B-Instruct, pero con la configuracion encogida mediante la regla generica de sweep.py del proyecto transformers-mic, que reduce num_hidden_layers a 2. Conserva los mismos nombres de tensores que el checkpoint real, de modo que cualquier codigo que espere la estructura de pesos de Seed-OSS puede ejecutarse contra este repositorio sin cambios.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad de entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (el caso mas debil, input_ids:roll_batch, alcanza 0,841). Los ficheros de procesador (LICENSE.txt, MODEL_CARD.md, chat_template.jinja, generation_config.json, special_tokens_map.json, tokenizer.json, tokenizer_config.json y thinking_budget.png) se copiaron byte a byte del modelo base. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es 92d0d303c919 y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el encogido.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no escribe codigo ni resuelve matematicas.
- Sirve como banco de pruebas de contrato para la integracion de Seed-OSS en Transformers: carga de checkpoint, nombres de tensores, dtypes y flujo de forward/loss/gradientes.
- Valida la tokenizacion y la plantilla de chat del modelo base, al copiarse estos ficheros sin modificaciones.
- Permite comprobar expectativas de framework recogidas en integrations/transformers/expectations.
- Soporte de tool calling, agentes, vision, audio o thinking mode: no disponible como capacidad real; solo se conservan los artefactos de configuracion del modelo base.

## Casos de uso

- Pruebas de integracion en CI para frameworks: ejecutar la carga del fixture y verificar que la clase SeedOssForCausalLM se instancia y produce logits, sin descargar el checkpoint de 36B.
- Validacion de contratos de tokenizer y chat template: comprobar que el pipeline de mensajes produce los tokens esperados usando los ficheros copiados del modelo base.
- Desarrollo de kernels y capas personalizadas: probar forward, backward y dtypes (float32, bfloat16, float16) sobre una red con la misma estructura de nombres de tensores.
- Verificacion de herramientas de conversion y serializacion: testear scripts que leen safetensors y mapean pesos de Seed-OSS antes de aplicarlos al modelo real.
- Regresion de pipelines de despliegue: validar configuracion de vLLM, TGI o llama.cpp a nivel de contrato de modelo con un artefacto ligero de 0,1 GB.
- Formacion y demos: ilustrar la estructura de un checkpoint Seed-OSS en talleres o documentacion sin consumir recursos de GPU.
- Auditoria de procedencia: revisar build.json e integration.json para trazar fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que es un artefacto de prueba y no un modelo usable, por lo que no existen metricas de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los 19,9M de parametros del fixture (pesos ~40 MB); el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) e incluso CPU es suficiente para cargar y ejecutar el fixture.
- Cabe en cualquier GPU consumer y en entornos sin GPU; no requiere A100 ni H100.
- Opciones de despliegue: Transformers (uso previsto segun integrations/transformers/usage.md); otras herramientas no estan documentadas para este artefacto.
- Latencia y throughput: no disponibles; al ser pesos aleatorios y una red de 2 capas, las cifras no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Seed-OSS-36B-Instruct-mic | 19,9M (fixture) | no disponible | Artefacto de prueba para contratos de integracion | no disponible | Hugging Face (huggingface-mic) |
| ByteDance-Seed/Seed-OSS-36B-Instruct | 36B (por nombre) | no disponible | Modelo de produccion para inferencia real | no disponible | Hugging Face (ByteDance-Seed) |
| Otros fixtures del proyecto transformers-mic | Variable (reducidos) | no disponible | Pruebas de contrato de otras familias | no disponible | Hugging Face (huggingface-mic) |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida no tiene valor semantico; no debe emplearse en produccion ni en evaluaciones de calidad.
- El nombre "36B" del repositorio hace referencia al modelo base, no al tamano real del fixture (19,9M de parametros); puede inducir a confusion.
- La licencia no esta declarada en la metadata del repositorio; el LICENSE.txt incluido procede del modelo base y debe revisarse antes de cualquier redistribucion.
- La configuracion esta reducida a 2 capas ocultas, por lo que no reproduce el comportamiento numerico del checkpoint completo.
- No hay informacion sobre sesgos, alucinacion, idiomas o limitaciones de contexto del modelo base en la informacion proporcionada; consultese la model card de ByteDance-Seed/Seed-OSS-36B-Instruct.
- El tag test-artifact lo excluye deliberadamente de busquedas de modelos candidatos; no debe indexarse como modelo alternativo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Seed-OSS-36B-Instruct-mic
- Modelo base: https://huggingface.co/ByteDance-Seed/Seed-OSS-36B-Instruct
- Explicacion del encogido del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Seed-OSS-36B-Instruct-mic.html
- Proyecto transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato: integration.json (en el repositorio)
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
