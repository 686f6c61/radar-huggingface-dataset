# m4gshm/Qwen2.5-Coder-1.5B-int8-sym

## Resumen

Qwen2.5-Coder-1.5B-int8-sym es una exportación a OpenVINO del modelo base Qwen/Qwen2.5-Coder-1.5B, publicada por el usuario m4gshm. No se trata de un modelo nuevo ni de un fine-tuning, sino de una conversión del transformer Qwen2.5-Coder de 1.500 millones de parámetros a formato IR (Intermediate Representation) de OpenVINO con cuantización simétrica de pesos a int8. El objetivo es facilitar el despliegue en hardware Intel (CPU, iGPU, NPU) con aceleración mediante el runtime de OpenVINO y la librería Optimum-Intel.

El modelo subyacente, Qwen2.5-Coder-1.5B, pertenece a la familia Qwen2.5 de Alibaba, especializada en generación y comprensión de código. Es un transformer decoder-only con arquitectura Qwen2ForCausalLM, pensado para tareas de autocompletado, generación de código, razonamiento sobre repositorios y conversación técnica. La versión exportada mantiene la licencia Apache 2.0 del original.

La relevancia de esta ficha radica en que permite ejecutar un modelo de código de 1,5B parámetros en entornos sin GPU dedicada, reduciendo el peso de los pesos a 1,44 GB en int8. Es una opción práctica para asistentes de código locales, plugins de IDE o pipelines de CI/CD en máquinas Intel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 simetrica (pesos), exportacion OpenVINO IR |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`), tokenizer y detokenizer en formato OpenVINO |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-1.5B: un transformer decoder-only con atención causal estándar, perteneciente a la familia Qwen2.5. La exportación a OpenVINO no modifica la topología del modelo, solo transforma los pesos a grafos IR y aplica cuantización simétrica de pesos a int8 mediante NNCF (Neural Network Compression Framework), la herramienta de compresión de Intel integrada en el ecosistema OpenVINO.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original utilizó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas específicas de esta exportación más allá de la cuantización int8 y el empaquetado completo para Optimum-Intel (tokenizer, detokenizer, configs y plantilla de chat).

## Capacidades

- Generación de texto y código: el modelo base está especializado en tareas de programación (autocompletado, generación de funciones, explicación de código).
- Conversación técnica: incluye `chat_template.jinja`, por lo que soporta formato conversacional multi-turno.
- Razonamiento sobre código: al derivar de Qwen2.5-Coder, está orientado a comprensión y modificación de fragmentos de código.
- Inferencia en hardware Intel: gracias a OpenVINO, puede ejecutarse en CPU, iGPU y NPU Intel sin GPU dedicada.
- Integración con Optimum-Intel: carga directa mediante `OVModelForCausalLM` y despliegue con `device="AUTO"`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no soportados (el modelo es solo texto).

## Casos de uso

- Asistente de código en IDE local: el modelo puede integrarse en plugins de editores (VS Code, JetBrains) para autocompletado y generación de funciones, ejecutándose en la CPU del desarrollador gracias a su tamaño reducido (1,44 GB en int8) y a la aceleración de OpenVINO.
- Generación de tests unitarios en CI/CD: se puede invocar el modelo desde un pipeline para generar casos de prueba a partir de diffs de código, aprovechando su especialización en código y su bajo coste de inferencia en CPU.
- Documentación automática de APIs: dado un fragmento de código, el modelo puede generar docstrings y comentarios explicativos, lo que resulta útil en procesos de mantenimiento de repositorios.
- Chatbot de soporte técnico para desarrolladores: con la plantilla de chat incluida, se puede desplegar un asistente conversacional que responda dudas sobre APIs y errores de compilación en entornos con hardware Intel.
- Traducción entre lenguajes de programación: el modelo puede convertir fragmentos de un lenguaje a otro (por ejemplo, Python a Java) en tareas de migración de código, ejecutándose localmente sin enviar código propietario a la nube.
- Prototipado rápido en portátiles sin GPU: investigadores y estudiantes pueden experimentar con un modelo de código en equipos con CPU Intel, usando OpenVINO para obtener latencias aceptables en generación de fragmentos cortos.
- Enseñanza de programación: el modelo puede explicar fragmentos de código y sugerir correcciones en un entorno controlado, con la ventaja de que todo el procesamiento ocurre en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,44 GB solo para los pesos en int8; hay que añadir memoria para el tokenizer, el contexto KV cache y el runtime de OpenVINO. En la práctica, se recomienda al menos 4 GB de RAM libre para contextos moderados.
- GPU recomendadas: no requiere GPU dedicada; está optimizado para CPU, iGPU y NPU Intel mediante OpenVINO.
- ¿Cabe en GPU consumer? Sí, en cualquier GPU con más de 2 GB de VRAM, aunque el objetivo principal es la inferencia en CPU Intel.
- Opciones de despliegue: Optimum-Intel (`OVModelForCausalLM`), OpenVINO Runtime, y servidores compatibles con OpenVINO. No se proporcionan pesos GGUF ni safetensors en este repositorio.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| m4gshm/Qwen2.5-Coder-1.5B-int8-sym | 1.5B | no disponible | OpenVINO IR int8 | Apache 2.0 | Exportación OpenVINO para hardware Intel |
| Qwen/Qwen2.5-Coder-1.5B (base) | 1.5B | no disponible | safetensors | Apache 2.0 | Modelo original en formato HuggingFace |
| Qwen/Qwen2.5-Coder-1.5B-Instruct-GPTQ-Int8 | 1.5B | no disponible | GPTQ int8 | Apache 2.0 | Variante cuantizada para TGI y GPUs |
| Modelos de código de ~1-2B (p. ej. CodeLlama-1.3B, StarCoder2-3B) | 1.3B–3B | variable | safetensors/GGUF | variable | Alternativas de tamaño similar; rendimiento no comparable sin benchmarks |

## Limitaciones y advertencias

- Es una exportación de un modelo base, no un modelo instruct ni chat afinado: el comportamiento conversacional depende de la plantilla de chat y del prompt, y puede ser menos fiable que una variante Instruct.
- Riesgo de alucinación: como todo modelo generativo de 1,5B parámetros, puede producir código incorrecto, APIs inexistentes o explicaciones erróneas; requiere validación humana.
- Sesgos: no se documentan sesgos específicos, pero el modelo hereda los del corpus de entrenamiento original, no disponible en esta ficha.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica en la información proporcionada; los idiomas soportados tampoco están documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen2.5-Coder-1.5B y las condiciones de uso de OpenVINO.
- Dependencia de hardware Intel: el formato OpenVINO IR está pensado para el runtime de OpenVINO; no es directamente compatible con vLLM, llama.cpp u Ollama sin conversión adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- [HuggingFace: m4gshm/Qwen2.5-Coder-1.5B-int8-sym](https://huggingface.co/m4gshm/Qwen2.5-Coder-1.5B-int8-sym)
- [Modelo base: Qwen/Qwen2.5-Coder-1.5B](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B)
- [Variante GPTQ-Int8 en Azure AI Catalog](https://ai.azure.com/catalog/models/qwen-qwen2.5-coder-1.5b-instruct-gptq-int8)
