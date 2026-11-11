# huggingface-mic/GLM-4.5-Air-mic

## Resumen

GLM-4.5-Air-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic a partir del modelo zai-org/GLM-4.5-Air. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version reducida artificialmente del checkpoint original, con 19.479.364 parametros totales (frente a los cientos de miles de millones del GLM-4.5-Air completo) y pesos generados aleatoriamente con semilla 17. Su proposito es servir como banco de pruebas para validar contratos de integracion y expectativas de frameworks (Transformers) sin necesidad de descargar ni ejecutar el modelo completo.

El fixture conserva la arquitectura Glm4MoeForCausalLM del modelo base, pero con num_hidden_layers reducido a 2, y copia byte a byte los ficheros de procesador del original (chat_template.jinja, generation_config.json, tokenizer.json, tokenizer_config.json). Mantiene los mismos nombres de tensores que el checkpoint real y se guarda en bfloat16, el dtype por defecto de GLM-4.5-Air. Todo ello permite comprobar que una implementacion de framework carga, ejecuta y propaga gradientes correctamente con la estructura exacta del modelo de referencia.

Es relevante ahora porque el ecosistema de herramientas alrededor de modelos MoE grandes necesita mecanismos ligeros de validacion continua: los fixtures como este permiten testear integraciones en CI/CD en segundos y con repositorios de 0,1 GB, en lugar de requerir GPUs de gama alta y cientos de gigabytes de pesos. Cualquier uso como modelo de produccion, sin embargo, carece de sentido: sus pesos son aleatorios y no ha recibido entrenamiento alguno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm4MoeForCausalLM (transformer MoE, configuracion reducida a 2 capas) |
| Parametros totales | 19.479.364 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del contrato de GLM-4.5-Air, no verificada en el fixture) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito tambien en float32 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura del checkpoint zai-org/GLM-4.5-Air, es decir, un transformer de tipo Mixture of Experts (MoE) bajo la clase Glm4MoeForCausalLM de Transformers. La unica diferencia estructural es la profundidad: el fixture aplica la regla generica de reduccion de sweep.py y deja num_hidden_layers en 2, lo que colapsa el numero de parametros hasta los 19,5 millones. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que espere la estructura de GLM-4.5-Air puede cargarlo sin adaptaciones.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y solo se aceptaron tras superar una puerta de sensibilidad de entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, attention_mask:all_ones, produjo 0,472). Los ficheros de procesador (chat template, generation config y tokenizer) se copiaron byte a byte del modelo original, y el fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El identificador de fixture es 3f772c113657 y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el proceso de reduccion.

## Capacidades

- Carga y ejecucion en Transformers con la clase Glm4MoeForCausalLM, verificando el contrato de integracion del modelo base.
- Validacion de expectativas de framework: forward pass, calculo de loss y retropropagacion de gradientes en float32, bfloat16 y float16.
- Comprobacion de sensibilidad de entradas: el fixture garantiza que perturbaciones en las entradas mueven los logits, lo que permite testear pipelines de evaluacion.
- Pruebas de tokenizacion y plantillas de chat identicas a las de GLM-4.5-Air, gracias a la copia byte a byte de los ficheros de procesador.
- No dispone de capacidades generativas reales: al tener pesos aleatorios, su salida no es texto coherente ni codigo ni razonamiento.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma funcional; solo reproduce la interfaz estructural del modelo base.
- Multilingueismo: no aplicable en la practica, aunque el tokenizer heredado cubre los idiomas del modelo original.

## Casos de uso

- Integracion continua de frameworks: usar el fixture en la suite de tests de Transformers o de una libreria de inferencia para verificar que la clase Glm4MoeForCausalLM carga, ejecuta forward y propaga gradientes sin descargar el checkpoint completo de cientos de gigabytes.
- Validacion de contratos de API: comprobar que las firmas de entrada, los nombres de tensores y los ficheros de configuracion coinciden con lo que espera el codigo de produccion antes de desplegar el modelo real.
- Pruebas de tokenizer y chat template: al copiarse byte a byte, permite testear el formateo de conversaciones, los tokens especiales y la generation config de GLM-4.5-Air en entornos sin GPU.
- Desarrollo de herramientas de cuantizacion: validar pipelines que leen safetensors y convierten pesos a otros formatos (GGUF, etc.) sobre una estructura identica a la del modelo real pero con un repo de 0,1 GB.
- Benchmarking de infraestructura: medir tiempos de carga, overhead de inicializacion y comportamiento de frameworks en CI con un artefacto ligero y reproducible (semilla 17, hashes registrados en build.json).
- Reproducibilidad de experimentos: servir como referencia fija para comparar el comportamiento de distintas versiones de librerias ante la misma arquitectura y configuracion reducida.
- Formacion y demos: ilustrar la estructura interna de un MoE tipo GLM-4.5 sin necesidad de recursos de computo elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (19,5 millones de parametros, unos 39 MB de pesos) y menos aun en cuantizaciones de 8 o 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna sirve; tambien funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (uso previsto segun integrations/transformers/usage.md); llama.cpp, Ollama o vLLM no estan documentados para este fixture y su utilidad seria marginal.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia seria del orden de milisegundos, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.5-Air-mic | 19,5 M | no disponible | Fixture de test | no disponible | Hugging Face (huggingface-mic) |
| zai-org/GLM-4.5-Air | no disponible en la informacion | no disponible | Modelo MoE de produccion | no disponible | Hugging Face (zai-org) |
| Otros fixtures de huggingface-mic | variable (reducidos) | no disponible | Pruebas de integracion | no disponible | Hugging Face (huggingface-mic) |

La comparativa con modelos reales de la misma categoria no procede: el fixture no compite en calidad ni rendimiento, sino que replica la estructura de GLM-4.5-Air para validacion. Frente al modelo base, la diferencia clave es el tamano (19,5 M frente a la escala completa) y la ausencia de entrenamiento.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas coherentes y no debe usarse para inferencia, generacion ni ninguna tarea real.
- Etiquetado como test-artifact: el autor lo excluye explicitamente de la busqueda de modelos candidatos; usarlo en produccion iria contra su proposito declarado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; al derivar de GLM-4.5-Air, habria que consultar la licencia del modelo base.
- Configuracion reducida: solo 2 capas, por lo que no reproduce el comportamiento numerico ni las capacidades del GLM-4.5-Air completo.
- Contexto e idiomas no verificados: aunque herede tokenizer y configuracion, no hay garantia de que el fixture respete los limites de contexto del original.
- Riesgo de confusion: el nombre y la estructura pueden llevar a error si se confunde con un modelo funcional; conviene revisar build.json y la model card antes de integrarlo.
- Sin soporte documentado para despliegue en vLLM, llama.cpp u Ollama; su uso previsto es Transformers y suites de test.

## Enlaces

- Repositorio del fixture: https://huggingface.co/huggingface-mic/GLM-4.5-Air-mic
- Modelo base: https://huggingface.co/zai-org/GLM-4.5-Air
- Manifiesto del contrato (integration.json): https://huggingface.co/huggingface-mic/GLM-4.5-Air-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/GLM-4.5-Air-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/GLM-4.5-Air-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (build.json): https://huggingface.co/huggingface-mic/GLM-4.5-Air-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/GLM-4.5-Air-mic.html
- Script de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
