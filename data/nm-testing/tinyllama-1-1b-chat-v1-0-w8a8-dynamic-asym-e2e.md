# nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A8-Dynamic-Asym-e2e

## Resumen

`nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A8-Dynamic-Asym-e2e` es una version cuantizada del modelo TinyLlama-1.1B-Chat v1.0, publicada por la organizacion `nm-testing` (cuenta de pruebas vinculada al ecosistema de `compressed-tensors`, la libreria de compresion de Neural Magic). No se trata de un modelo entrenado desde cero, sino de un artefacto de cuantizacion: pesos de TinyLlama convertidos a precision 8 bits para activaciones y pesos (W8A8) mediante cuantizacion dinamica asimetrica. El sufijo `e2e` sugiere que el checkpoint se genero en un flujo de pruebas de extremo a extremo.

El modelo base TinyLlama-1.1B-Chat es un transformer decoder-only de tipo Llama con 1.100.048.384 parametros, entrenado por el proyecto TinyLlama sobre aproximadamente 3 billones de tokens y posteriormente ajustado con instrucciones y preferencias para uso conversacional. Esta version cuantizada conserva la misma arquitectura y numero de parametros, pero reduce el coste de almacenamiento y memoria al representar pesos y activaciones en int8.

Su relevancia practica es limitada: al publicarse bajo una cuenta de testing, con 53 descargas y sin licencia declarada, debe tratarse como un artefacto de referencia o validacion de pipelines de cuantizacion, no como un modelo recomendado para produccion. Resulta util, eso si, para verificar el funcionamiento de `compressed-tensors` con esquemas W8A8 dinamicos asimetricos y para experimentar con despliegue de bajo coste en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base TinyLlama-1.1B-Chat soporta 2048 tokens) |
| Tipos de cuantizacion | W8A8 dinamica asimetrica (8 bits en pesos y activaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con metadatos de `compressed-tensors`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama-1.1B-Chat: un transformer decoder-only con atencion multi-cabeza, RoPE, normalizacion RMSNorm y activacion SwiGLU, con 22 capas, dimension oculta de 2048 y 32 cabezas de atencion (4 cabezas KV por grupo, GQA). El modelo base se entreno sobre un corpus de aproximadamente 3 billones de tokens (mezcla de SlimPajama y otros datasets) siguiendo el esquema de Llama 2, y despues se ajusto con tecnicas de instruccion y alineacion (SFT y DPO) para obtener la variante Chat.

La innovacion de este checkpoint concreto no esta en el entrenamiento, sino en la compresion: aplica cuantizacion W8A8 con esquema dinamico y asimetrico mediante `compressed-tensors`, lo que significa que los pesos se almacenan en int8 con escala y punto cero por canal o por grupo, y las activaciones se cuantizan en tiempo de ejecucion calculando los parametros de escala a partir de los valores observados en cada paso. El caracter asimetrico permite representar distribuciones sesgadas sin perder resolucion en un lado del rango. El sufijo `e2e` indica que el artefacto se produjo en un test de integracion de extremo a extremo del pipeline de cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste de instrucciones del modelo base.
- Razonamiento basico y respuesta a preguntas sencillas; el tamano de 1,1B limita la profundidad del razonamiento.
- Generacion de codigo elemental y explicaciones tecnicas breves.
- Aritmetica simple y tareas de sentido comun de baja complejidad.
- Capacidad multilingue limitada y no documentada en esta ficha.
- No se documenta soporte de tool calling ni function calling nativo.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No dispone de vision, audio ni modo de pensamiento explicito.
- Inferencia compatible con kernels de cuantizacion int8 de `compressed-tensors` (por ejemplo, a traves de vLLM).

## Casos de uso

- Validacion de pipelines de cuantizacion: sirve para comprobar que un flujo W8A8 dinamico asimetrico con `compressed-tensors` produce checkpoints cargables y con salidas coherentes antes de aplicarlo a modelos mayores.
- Pruebas de integracion en CI: al ser un modelo pequeno y cuantizado, se puede incluir en tests automatizados de despliegue con vLLM o con el runtime de Neural Magic sin consumir recursos significativos.
- Prototipado de chatbots ligeros en local: permite montar un asistente conversacional basico en una maquina sin GPU dedicada, aceptando la calidad limitada de un modelo de 1,1B.
- Generacion de texto de bajo coste en edge: su huella de memoria reducida facilita experimentos en dispositivos con poca VRAM o incluso en CPU con soporte de int8.
- Benchmarking de kernels int8: util para medir throughput y latencia de operaciones cuantizadas frente a la version fp16 del mismo modelo base.
- Educacion y demostraciones: ejemplo didactico de como se estructura un checkpoint cuantizado con metadatos de `compressed-tensors` y de las diferencias entre cuantizacion estatica y dinamica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,1-1,5 GB para los pesos en int8, mas overhead de activaciones y cache KV (que depende de la longitud de contexto y del batch).
- GPU recomendadas: cualquier GPU con soporte de operaciones int8, desde una T4 o L4 hasta A100/H100 para despliegues con mayor batch; tambien es viable en RTX 3060, RTX 4090 y similares.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU.
- Opciones de despliegue: vLLM con soporte de `compressed-tensors` es la via natural; llama.cpp y Ollama no consumen directamente este formato de checkpoint cuantizado (requeririan una conversion a GGUF desde el modelo base). TGI no esta confirmado para este esquema.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0-W8A8-Dynamic-Asym-e2e (este) | 1,1B | no disponible (base: 2048) | W8A8 dinamica asimetrica | no disponible | HuggingFace, cuenta de testing |
| TinyLlama-1.1B-Chat-v1.0 (base) | 1,1B | 2048 | fp16/bf16 | Apache 2.0 (segun el modelo base) | HuggingFace, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 | fp16/bf16, GGUF, AWQ | Apache 2.0 | HuggingFace |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 | fp16/bf16, GGUF | Apache 2.0 | HuggingFace |

La comparativa debe tomarse con cautela: la licencia del checkpoint cuantizado no esta declarada, aunque el modelo base TinyLlama se distribuye bajo Apache 2.0. Los modelos alternativos ofrecen contextos mas largos y licencias claras, ademas de versiones cuantizadas mantenidas por sus propios autores.

## Limitaciones y advertencias

- Es un artefacto de testing: la cuenta `nm-testing` no garantiza mantenimiento, soporte ni estabilidad del checkpoint.
- Licencia no declarada; antes de cualquier uso comercial debe verificarse la licencia del modelo base TinyLlama (Apache 2.0) y confirmar que la cuantizacion no introduce restricciones adicionales.
- Calidad conversacional limitada por el tamano del modelo base (1,1B): propenso a errores factuales, incoherencias en cadenas largas y razonamiento superficial.
- Riesgo de alucinacion elevado en preguntas factuales y en tareas que requieran conocimiento actualizado.
- Contexto efectivo corto (2048 tokens en el modelo base), insuficiente para documentos largos o conversaciones extensas.
- Idiomas soportados no documentados; el rendimiento fuera del ingles puede degradarse notablemente.
- La cuantizacion W8A8 puede introducir una perdida adicional de calidad respecto al modelo en fp16, especialmente en tareas sensibles a la precision numerica.
- Compatibilidad de despliegue restringida a runtimes que soporten `compressed-tensors`; no es un checkpoint GGUF listo para llama.cpp u Ollama.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en integraciones que dependan de ello.

## Enlaces

- HuggingFace: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A8-Dynamic-Asym-e2e
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio TinyLlama: https://github.com/jzhang38/TinyLlama
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
