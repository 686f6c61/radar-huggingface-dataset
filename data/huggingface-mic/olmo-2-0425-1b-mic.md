# huggingface-mic/OLMo-2-0425-1B-mic

## Resumen

OLMo-2-0425-1B-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo utilizable. Se trata de una version "adelgazada" del modelo base allenai/OLMo-2-0425-1B, reducida mediante la regla generica de reduccion de configuracion del repositorio transformers-mic (num_hidden_layers reducido a 2), que conserva la misma arquitectura Olmo2ForCausalLM y los mismos nombres de tensores que el checkpoint original, pero con solo 12.927.552 parametros totales frente a los aproximadamente 1.000 millones del modelo del que deriva.

El proposito del repositorio es servir como fixture de integracion: empaqueta pesos adelgazados, uso ejecutable y expectativas de framework en un unico lugar, con un manifiesto de contrato (integration.json), documentacion de uso en Transformers y un registro de procedencia de la construccion (build.json). Los pesos son aleatorios (semilla 17) y no han sido entrenados; se generaron asi porque superaron la puerta de sensibilidad a la entrada, es decir, cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, attention_mask:all_ones, con 0,213).

Es relevante unicamente en el contexto de pruebas de infraestructura: permite validar cargas de checkpoints, contratos de framework y pipelines de integracion sin descargar ni ejecutar el modelo real de 1B. El autor lo etiqueta explicitamente como test-artifact para mantenerlo fuera de las busquedas de modelos candidatos. No debe emplearse para inferencia real, generacion de texto ni ninguna tarea de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Olmo2ForCausalLM (transformer causal, version reducida a 2 capas ocultas) |
| Parametros totales | 12.927.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la configuracion del modelo base tras la reduccion; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es la de OLMo-2 causal LM (clase Olmo2ForCausalLM), pero con la configuracion reducida por la regla generica de sweep.py del repositorio transformers-mic: num_hidden_layers igual a 2. Los ficheros de procesador (generation_config.json, merges.txt, special_tokens_map.json, tokenizer.json, tokenizer_config.json y vocab.json) se copiaron byte a byte desde allenai/OLMo-2-0425-1B, de modo que el tokenizador y la configuracion de generacion son identicos a los del modelo original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad a la entrada: toda perturbacion de las entradas del contrato desplazaba los logits al menos 0,001, con el minimo en attention_mask:all_ones (0,213). El fixture conserva exactamente los mismos nombres de tensores que el checkpoint real, se guarda en float32 (el dtype con el que carga por defecto allenai/OLMo-2-0425-1B) y se verifica finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es 4cd8b43f8bc4 y cubre todo checkpoint cuyos ficheros de procesador sean byte-identicos y cuya configuracion coincida tras la reduccion.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de integracion para validar la carga de checkpoints Olmo2ForCausalLM en Transformers.
- Verifica contratos de framework a traves de integration.json y del directorio integrations/transformers/expectations.
- Permite comprobar la sensibilidad de las entradas del contrato (perturbaciones de logits).
- Comprueba la compatibilidad de ficheros de procesador copiados byte a byte desde el modelo base.
- Valida la finitud numerica en float32, bfloat16 y float16 (forward, loss y gradientes).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues reales.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture con Transformers para verificar que la clase Olmo2ForCausalLM y el pipeline de carga funcionan sin descargar el modelo de 1B, reduciendo tiempo y ancho de banda en cada ejecucion.
- Validacion de contratos de framework: ejecutar las expectativas de integrations/transformers/expectations contra los pesos adelgazados para detectar regresiones en la API de Transformers antes de probar con el checkpoint real.
- Desarrollo de herramientas de introspeccion de modelos: inspeccionar nombres de tensores y estructura de configuracion con un coste de 0,1 GB de repositorio en lugar de varios gigabytes.
- Verificacion de pipelines de conversion de formato: probar flujos de exportacion a safetensors o cambios de dtype (float32, bfloat16, float16) sobre un modelo minimo que conserva los nombres de tensores originales.
- Pruebas de sensibilidad a entradas: reproducir la puerta de perturbacion de logits (umbral 0,001) para validar herramientas de analisis de atribucion o de robustez.
- Docencia y demostraciones de estructura de un transformer causal: mostrar la configuracion de OLMo-2 con solo 2 capas ocultas y 12,9M de parametros, sin necesidad de recursos de GPU.
- Validacion de tokenizadores: comprobar el comportamiento de los ficheros de tokenizacion copiados del modelo base en pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (12,9M de parametros, aproximadamente 52 MB de pesos) y aun menor en float16 o bfloat16.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problemas.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso iGPU) y en entornos sin acelerador.
- Opciones de despliegue: Transformers (via integraciones documentadas en el repositorio); no se documentan vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al no ser un modelo entrenado, las cifras no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMo-2-0425-1B-mic | 12,9M | no disponible | Fixture de prueba (pesos aleatorios) | no disponible | Hugging Face (huggingface-mic) |
| allenai/OLMo-2-0425-1B | aproximadamente 1.000M | no disponible en la informacion proporcionada | Modelo causal real entrenado | no disponible en la informacion proporcionada | Hugging Face (allenai) |
| Otros fixtures de transformers-mic | variable (segun regla de reduccion) | no disponible | Pruebas de integracion de frameworks | no disponible | Hugging Face (huggingface-mic) |

La comparativa relevante es con el modelo base: el fixture comparte arquitectura, tokenizador y nombres de tensores, pero difiere en numero de capas (2 frente a la configuracion completa), en tamano (12,9M frente a aproximadamente 1.000M de parametros) y en naturaleza de los pesos (aleatorios frente a entrenados).

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene valor semantico.
- Etiquetado como test-artifact para excluirlo de busquedas de modelos candidatos; no debe promocionarse como modelo.
- No se declara licencia, por lo que el uso comercial queda sin garantias juridicas explicitas.
- No se declaran idiomas soportados ni longitud de contexto en la informacion disponible.
- Al reducirse a 2 capas ocultas, el comportamiento numerico y la distribucion de activaciones no representan al modelo base de 1B.
- Riesgo de confusion: el nombre incluye OLMo-2-0425-1B, pero el contenido no es el modelo de 1B; verificar siempre el tamano del repositorio (0,1 GB) y la etiqueta test-artifact.
- No apto para produccion, evaluacion de calidad, benchmarks ni generacion de codigo o texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/OLMo-2-0425-1B-mic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B
- Documentacion de reduccion del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/OLMo-2-0425-1B-mic.html
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Manifiesto de contrato (integration.json): https://huggingface.co/huggingface-mic/OLMo-2-0425-1B-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/OLMo-2-0425-1B-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/OLMo-2-0425-1B-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (build.json): https://huggingface.co/huggingface-mic/OLMo-2-0425-1B-mic/blob/main/build.json
