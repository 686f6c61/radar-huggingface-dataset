# huggingface-mic/Ministral-3-3B-Instruct-2512-mic

## Resumen

Ministral-3-3B-Instruct-2512-mic es un artefacto de prueba publicado por la organizacion huggingface-mic, no un modelo utilizable. Se trata de un "fixture" derivado del checkpoint mistralai/Ministral-3-3B-Instruct-2512: conserva la arquitectura Mistral3ForConditionalGeneration y los ficheros de procesador originales, pero sus pesos son aleatorios y su configuracion esta reducida a 2 capas en el codificador de vision y 2 capas en el decodificador de texto. El resultado son 8.607.168 parametros totales frente a los aproximadamente 3.000 millones del modelo base.

El objetivo del repositorio es servir como fixture de integracion para el proyecto transformers-mic: permite validar contratos de entrada/salida, plantillas de chat, tokenizador Tekken y expectativas de framework sin descargar ni ejecutar el modelo real. Esta etiquetado explicitamente como `test-artifact` para quedar fuera de las busquedas de modelos candidatos. Por tanto, no debe emplearse para generacion de texto, vision ni ninguna tarea productiva.

Su relevancia es exclusivamente de ingenieria de software: reduce el coste de CI y de pruebas de integracion para frameworks que dan soporte a modelos Mistral3 multimodales. Cualquier evaluacion de capacidades, calidad o rendimiento debe hacerse sobre el modelo base real, no sobre este fixture.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3ForConditionalGeneration (transformer multimodal imagen-texto), configuracion reducida a 2 capas de vision y 2 capas de texto |
| Parametros totales | 8.607.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura Mistral3ForConditionalGeneration del checkpoint mistralai/Ministral-3-3B-Instruct-2512, pero con un numero de capas drasticamente reducido: 2 capas en el torre de vision y 2 capas en el modelo de lenguaje. Los ficheros de procesador se copiaron byte a byte del modelo original: SYSTEM_PROMPT.txt, chat_template.jinja, generation_config.json, params.json, processor_config.json, tekken.json, tokenizer.json y tokenizer_config.json. Los nombres de tensores coinciden con los del checkpoint real, lo que permite que el codigo de carga y las pruebas de integracion se ejecuten sin adaptaciones.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, pixel_values:roll_batch, dio 0,955). Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es 0f5ca39ae6b6 y cubre cualquier checkpoint cuyos ficheros de procesador sean identicos byte a byte y cuya config coincida tras el proceso de reduccion.

## Capacidades

- No genera texto coherente: los pesos son aleatorios, por lo que la salida es ruido estadistico.
- No realiza razonamiento, codigo, matematicas ni ninguna tarea cognitiva.
- No ofrece tool calling ni function calling funcional.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales, aunque hereda el tokenizador Tekken del modelo base.
- No dispone de modo thinking, vision util ni audio.
- Su unica funcion es validar contratos de integracion: formas de tensores, plantillas de chat, configuracion de generacion y expectativas de framework.

## Casos de uso

- Pruebas de integracion en CI para transformers-mic: el fixture permite ejecutar la carga del modelo, el preprocesado y el forward pass en pipelines de integracion continua con un consumo de disco de 0,1 GB, sin necesidad de descargar el checkpoint completo de 3B.
- Validacion de contratos de entrada/salida: el manifest integration.json y el directorio integrations/transformers/expectations permiten comprobar que una version de Transformers respeta las formas y dtypes esperados para Mistral3ForConditionalGeneration.
- Pruebas de plantillas de chat y tokenizador: al copiar byte a byte chat_template.jinja, tokenizer.json y tekken.json, se puede verificar el renderizado de plantillas y la tokenizacion sin depender de los pesos reales.
- Verificacion de compatibilidad de dtypes: el fixture es finito en float32, bfloat16 y float16, lo que permite probar rutas de carga y mixed precision en frameworks sin GPU de gran capacidad.
- Regresion de codigo de framework: cualquier cambio en el cargador de safetensors, en el procesador multimodal o en la gestion de generation_config puede detectarse ejecutando el fixture con un coste minimo.
- Desarrollo de herramientas de inspeccion de modelos: util para construir utilidades que enumeren tensores, capas y configuraciones de Mistral3 sin manejar checkpoints de varios gigabytes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16, dado que el checkpoint pesa 8,6M parametros y el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) o incluso CPU, suficiente para ejecutar el forward pass del fixture.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU sin acelerador.
- Opciones de despliegue: carga mediante Transformers con Mistral3ForConditionalGeneration; no se recomienda vLLM, TGI ni llama.cpp porque el objetivo no es servir inferencia real.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con pesos aleatorios, las mediciones no serian representativas de ningun caso de produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512-mic | 8.607.168 | no disponible | Fixture de integracion | no disponible | Hugging Face (huggingface-mic) |
| mistralai/Ministral-3-3B-Instruct-2512 | aproximadamente 3.000 millones (no confirmado en la informacion disponible) | no disponible | Modelo instruct multimodal real | no disponible | Hugging Face (mistralai) |
| Otros fixtures de transformers-mic | variable, segun checkpoint cubierto | no disponible | Pruebas de contrato de framework | no disponible | Hugging Face (huggingface-mic) |

La comparacion relevante es con el modelo base: el fixture no compite en capacidades, solo replica su interfaz. Frente a otros artefactos de prueba del mismo proyecto, la diferencia esta en la clave de fixture y en el checkpoint cubierto.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas coherentes y no debe usarse para inferencia real.
- Etiquetado como `test-artifact`: esta disenado para quedar fuera de busquedas de modelos candidatos y de evaluaciones de calidad.
- Licencia no disponible: no se puede asumir uso comercial ni redistribucion sin consultar la licencia del modelo base y del repositorio.
- Configuracion reducida: solo 2 capas de vision y 2 de texto, por lo que no reproduce el comportamiento numerico del checkpoint completo.
- Riesgo de confusion: un usuario que lo descargue esperando un modelo de 3B obtendra un artefacto de 8,6M parametros con salidas sin sentido.
- Sin garantias de soporte: al ser un fixture interno del proyecto transformers-mic, su mantenimiento depende de ese repositorio y puede cambiar sin aviso.
- No apto para produccion: no debe integrarse en sistemas de atencion al cliente, generacion de codigo ni ningun pipeline que requiera respuestas fiables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Ministral-3-3B-Instruct-2512-mic
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Ministral-3-3B-Instruct-2512-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
