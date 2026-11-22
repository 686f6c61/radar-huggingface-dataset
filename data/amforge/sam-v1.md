# AMFORGE/sam-v1

## Resumen

SAM (Structured Action Model) es un modelo compacto de 33,4 millones de parámetros desarrollado por AMEFORGE (identificado como AMFORGE en Hugging Face) que convierte lenguaje natural en acciones JSON estructuradas condicionadas por un esquema. A diferencia de los modelos de chat generalistas, SAM está especializado en la generación de acciones para sistemas agénticos en diez dominios concretos: robótica, HTTP/REST, MQTT/IoT, bases de datos, flujos de trabajo, comercio electrónico, vehículos, domótica, calendario/correo y sistema de ficheros. Emplea la arquitectura propietaria SparseMind, un transformer decoder-only disperso, y se distribuye con pesos en PyTorch y ONNX.

El modelo resuelve un problema muy concreto en producción: la fragilidad del JSON generado por LLM generalistas en pipelines agénticos, que obliga a bucles de reintento y encarece cada llamada. SAM aborda esto con un tokenizador de atomicidad numérica (NexusBPE) y decodificación condicionada por esquema, lo que según el autor garantiza JSON válido y reduce la latencia a 30-200 ms en CPU. Su tamaño reducido (unos 127,4 MB en FP32, 31,9 MB en INT8) permite desplegarlo en dispositivos edge como Jetson o Raspberry Pi sin conexión a la nube.

Es relevante ahora porque propone una alternativa offline, de coste cero por llamada y centrada en la privacidad frente a las APIs de LLM en la nube para la capa de traducción lenguaje natural a acción estructurada. Es el sucesor de Foros v5.3, también de AMEFORGE, que se centraba en JSON para ROS en robótica; SAM generaliza ese enfoque a todo el stack agéntico. La versión v1 es explícitamente limitada: solo inglés, contexto de 1024 tokens, un único turno y sin benchmarks publicados todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SparseMind (transformer decoder-only disperso) |
| Parámetros totales | 33.400.324 (~33,4 M) |
| Parámetros activos | no disponible |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | FP32 nativo; compatible con INT8 (~31,9 MB) |
| Idiomas soportados | inglés (en) |
| Licencia | Business Source License 1.1 (bsl-1.1) |
| Formato de pesos | PyTorch (`sam.pt`), ONNX (`sam-v1.onnx` + `sam-v1.onnx.data`) |
| Tokenizador | NexusBPE (`AMEFORGE/sam_tokenizer`) |
| Tamaño en disco (FP32) | ~127,4 MB |
| Dominios soportados | 10 (robótica, HTTP, MQTT, DB, workflow, e-commerce, vehículo, hogar, calendario, ficheros) |
| Despliegue | CPU, GPU, edge (Jetson, Raspberry Pi) |
| Librería | PyTorch |

## Arquitectura y entrenamiento

SAM se basa en SparseMind, una arquitectura decoder-only dispersa desarrollada internamente por AMEFORGE. El modelo está condicionado por esquema: la entrada sigue el formato `<SCHEMA>{...JSON Schema...}</SCHEMA> <DOMAIN_TAG> <TASK>lenguaje natural</TASK> =>` y la salida es un array JSON de operaciones que cumplen el esquema. Cada dominio tiene su propia etiqueta (`<ROS>`, `<HTTP>`, `<MQTT>`, `<DB>`, `<WORKFLOW>`, `<ECOMMERCE>`, `<VEHICLE>`, `<HOME>`, `<CAL>`, `<FILE>`). El tokenizador NexusBPE incorpora atomicidad numérica: los números se codifican como tokens atómicos dentro de los rangos relevantes de cada dominio, lo que evita la fragmentación en subpalabras y reduce errores de formato en valores numéricos.

El entrenamiento se realizó sobre un corpus multi-dominio determinista y ensamblado internamente por AMEFORGE, que cubre los diez dominios en cinco niveles de dificultad (atómico, compuesto, ruidoso, cadena larga y entre dominios), con variación de paráfrasis, aumento de robustez y condicionamiento por esquema. Se entrenó en una única GPU con un optimizador personalizado para SparseMind. La metodología completa y el pipeline de construcción del dataset se mantienen internos como propiedad intelectual de AMEFORGE; no se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de JSON estructurado condicionado por esquema JSON Schema, con validación opcional durante la decodificación (modo `guarded`).
- Traducción de lenguaje natural a acciones en diez dominios: robótica (ROS), HTTP/REST, MQTT/IoT, bases de datos, workflows, comercio electrónico, vehículos, domótica, calendario/correo y sistema de ficheros.
- Soporte de tool calling compatible con el formato de herramientas de OpenAI mediante el método `sam.tool_call()`, con especificaciones de herramientas y mensajes al estilo OpenAI.
- Generación de operaciones compuestas (arrays con múltiples operaciones) y cadenas largas dentro de los límites del contexto de 1024 tokens.
- Atomicidad numérica garantizada en los rangos relevantes de producción de cada dominio.
- Decodificación validada contra JSON, que evita salidas malformadas en el modo `guarded`.
- Ejecución offline en CPU, GPU y dispositivos edge sin dependencia de la nube.
- No es un modelo de chat: no mantiene conversaciones multi-turno ni razonamiento abierto; su función es la generación de acciones estructuradas de un solo turno.

## Casos de uso

- Automatización de robótica industrial: traducción de instrucciones en lenguaje natural a comandos ROS JSON (por ejemplo, `move to x=0.5 y=-1.2 z=0.8` a `[{"op":"move","x":0.5,"y":-1.2,"z":0.8}]`), desplegable directamente en el controlador del robot o en un Jetson junto al brazo.
- Orquestación de llamadas HTTP en pipelines de integración: conversión de peticiones como «get user 42» en peticiones REST concretas (`GET /users/42`), útil para agentes que generan llamadas a APIs internas con validación de esquema y sin dependencia de una API externa de LLM.
- Telemetría y control IoT por MQTT: generación de publicaciones MQTT con tema, payload y QoS correctos (por ejemplo, `mqtt_publish` a `home/livingroom/temp` con QoS 1) en gateways edge con conectividad intermitente.
- Domótica y asistentes de voz locales: conversión de órdenes como «turn on bedroom light at 50% blue» en acciones `set_light` con habitación, brillo y color, ejecutables en una Raspberry Pi sin enviar audio ni texto a la nube.
- Automatización de flujos de trabajo y operaciones de ficheros: generación de acciones de workflow y de sistema de ficheros (abrir ficheros, ejecutar tests) para agentes de CI/CD o asistentes de escritorio que necesitan JSON determinista y validado.
- Sustitución de llamadas a LLM en la capa de parsing de intenciones: en arquitecturas agénticas existentes, SAM puede reemplazar la llamada al LLM generalista solo para la conversión lenguaje natural a JSON, reduciendo la latencia de 500-3000 ms a 30-200 ms y el coste a cero por llamada.
- Procesamiento de pedidos en comercio electrónico: generación de acciones estructuradas de e-commerce (operaciones de pedido, consulta o actualización) condicionadas por el esquema del sistema de gestión, con validación previa a la ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card define el SAM Bench v1 (200 prompts, 10 dominios, 5 niveles de dificultad), pero indica explícitamente que el benchmark «not yet run» y que la sección debe rellenarse tras el entrenamiento ejecutando `sam_benchmark.py`. El autor sí reporta latencias orientativas de 30-200 ms en CPU y una paridad ONNX verificada el 22 de noviembre de 2026 con una diferencia máxima de logits de 1,72e-05 frente a PyTorch, argmax idéntico y una velocidad de 2 a 4,5 veces mayor en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (~127,4 MB de pesos más overhead de runtime); unos 32 MB en INT8 para los pesos.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) puede ejecutarlo sobradamente, pero no es necesario para el tamaño del modelo.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU: Jetson, Raspberry Pi y portátiles con CPU convencional.
- Opciones de despliegue: SparseMind Runtime (runtime propio, sin PyTorch ni código de arquitectura), ONNX Runtime con `sam-v1.onnx`, checkpoint PyTorch (`sam.pt`) y el SDK `sam_runtime.py`. La model card no menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: 30-200 ms por generación en CPU según el autor; ONNX entre 2 y 4,5 veces más rápido que PyTorch en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Despliegue edge |
|---|---|---|---|---|---|
| SAM v1 (AMFORGE) | 33,4 M | 1024 | JSON estructurado condicionado por esquema, 10 dominios | BSL 1.1 | Sí (CPU, Jetson, Pi) |
| Foros v5.3 (AMEFORGE) | no disponible | no disponible | JSON para ROS (robótica) | no disponible | no disponible |
| LLM generalista vía API (p. ej. GPT-4o mini, Claude Haiku) | no disponible | 128k+ típicamente | Chat y generación abierta con tool calling | propietaria | No (nube) |

La comparación con LLM generalistas es la que plantea el propio autor: SAM ofrece JSON más fiable, latencia de 30-200 ms frente a 500-3000 ms y coste cero por llamada, a cambio de un alcance mucho más estrecho (10 dominios fijos, inglés, 1024 tokens de contexto y sin conversación). Foros v5.3 es el predecesor directo y solo cubría robótica ROS-JSON. No se dispone de datos de benchmarks que permitan comparar la precisión de SAM frente a estas alternativas.

## Limitaciones y advertencias

- La calidad de generación en planes largos o complejos es limitada en esta v1; el autor prevé fine-tuning.
- Solo inglés; la extensión multilingüe es trabajo futuro.
- Está condicionado por esquema: los mejores resultados requieren proporcionar un JSON Schema en el prompt.
- El conjunto de dominios está fijado en 10; añadir dominios nuevos requiere fine-tuning o reentrenamiento.
- La atomicidad numérica solo se garantiza dentro de los rangos relevantes de producción de cada dominio; fuera de ellos se recurre a codificación por subpalabras.
- No es un modelo de chat: solo genera acciones estructuradas de un único turno.
- No hay benchmarks publicados que permitan verificar las afirmaciones de fiabilidad y latencia del autor.
- Licencia Business Source License 1.1: es necesario revisar los términos exactos del fichero LICENSE para el uso comercial, ya que la model card solo indica que es gratuita para uso personal y académico y el texto se corta.
- Riesgo de alucinación en la selección de operaciones o valores no presentes en la tarea; conviene validar la salida contra el esquema antes de ejecutar acciones en producción.
- El modelo se distribuye con `inference: false` en la model card y requiere el runtime propio o ONNX Runtime; no es compatible directamente con pipelines estándar de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMFORGE/sam-v1
- Tokenizador: https://huggingface.co/AMEFORGE/sam_tokenizer
- Modelo predecesor (Foros v5.3): https://huggingface.co/AMEFORGE/foros-v5.3
- Dataset de benchmark (referenciado, posiblemente no publicado): https://huggingface.co/datasets/AMEFORGE/sam-bench
- Runtime SparseMind: https://github.com/amforge1/sparsemind-runtime
