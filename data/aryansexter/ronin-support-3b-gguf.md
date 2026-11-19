# aryansexter/ronin-support-3b-GGUF

## Resumen

ronin-support-3b es un modelo de lenguaje conversacional de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) obtenido mediante fine-tuning supervisado de Qwen/Qwen2.5-3B-Instruct sobre el dataset Bitext-customer-support-llm-chatbot-training-dataset, un corpus orientado a conversaciones de atencion al cliente. El autor, aryansexter, publica dos artefactos: el modelo fusionado en FP16 (aryansexter/ronin-support-3b) y este repositorio GGUF con tres cuantizaciones calibradas mediante una imatrix especifica del dominio de soporte al cliente.

El repositorio GGUF esta pensado para inferencia local con llama.cpp y Ollama, lo que lo hace adecuado para despliegues en CPU o GPU de gama baja sin necesidad de infraestructura de servidor. Las tres variantes publicadas (Q4_K_M de 1,8 GB, Q5_K_M de 2,07 GB y Q8_0 de 3,06 GB) cubren el rango habitual de compromiso entre calidad y huella de memoria para un modelo de este tamano.

La relevancia del modelo es acotada y muy especializada: no es un modelo de proposito general, sino un ajuste de dominio para dialogos de atencion al cliente. La model card solo reporta dos resultados de evaluacion (arc_challenge 51,0 % y hellaswag 66,0 %), sin datos de benchmarks conversacionales ni de calidad de respuesta en el dominio objetivo, y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct; detalles de atencion y capas no disponibles) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens nativos, pero el ajuste no lo confirma) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (GGUF, calibradas con imatrix de dominio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); el modelo base fusionado se distribuye en FP16, presumiblemente safetensors |
| Tamano del repositorio | 7,4 GB |
| Dataset de ajuste | bitext/Bitext-customer-support-llm-chatbot-training-dataset |
| Compatibilidad de endpoints | endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct, un transformer decoder-only de aproximadamente 3,09 mil millones de parametros con atencion causal estandar y RoPE para codificacion posicional. No se documentan en la model card cambios estructurales respecto al modelo base: el proceso descrito es un fine-tuning supervisado sobre el dataset de Bitext, seguido de fusion de pesos a FP16 y cuantizacion con llama.cpp.

El entrenamiento se realizo exclusivamente sobre el Bitext-customer-support-llm-chatbot-training-dataset, un corpus de dialogos sinteticos de atencion al cliente que cubre intents como consultas de pedidos, devoluciones, cambios de cuenta o facturacion. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF, DPO o preferencias. La innovacion tecnica destacable es el uso de una imatrix calibrada con datos del dominio para las tres cuantizaciones, lo que en la practica reduce la perdida de calidad en K-quants frente a una calibracion generica, especialmente en Q4_K_M.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a dialogos de atencion al cliente (consultas de pedidos, devoluciones, facturacion, cambios de cuenta).
- Respuestas en el estilo y registro del dataset Bitext, con formatos de respuesta propios de soporte (confirmaciones, aclaraciones, escalado).
- Inferencia local eficiente gracias a las cuantizaciones GGUF de 1,8 a 3,06 GB.
- Integracion con llama.cpp y Ollama mediante los comandos documentados en la model card.
- Compatibilidad declarada con endpoints (tag endpoints_compatible), lo que permite servir el modelo en infraestructuras compatibles con la API de Hugging Face.
- Tool calling / function calling: no disponible (no declarado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: no disponible (no declaradas).
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Atencion al cliente automatizada de primer nivel: el modelo puede gestionar conversaciones multi-turno sobre pedidos, devoluciones y facturacion, ya que fue ajustado especificamente sobre el dataset Bitext de soporte. Es adecuado para triaje y respuestas frecuentes, con escalado a humano en casos complejos.
- Chatbot embebido en aplicaciones de escritorio o moviles: la variante Q4_K_M (1,8 GB) permite ejecucion local en CPU con llama.cpp, sin depender de APIs externas ni enviar datos del cliente a terceros.
- Prototipado rapido de asistentes de soporte: el comando `llama-cli -hf ...:Q4_K_M` permite probar el modelo en minutos y evaluar su encaje en un flujo de soporte antes de invertir en infraestructura.
- Despliegue con Ollama en entornos de desarrollo: el flujo documentado (descarga del GGUF, Modelfile y `ollama create`) facilita la integracion en pipelines de pruebas internas y demos para stakeholders.
- Generacion de respuestas de soporte en herramientas de helpdesk: el modelo puede redactar borradores de respuesta a tickets con el registro del dataset Bitext, que el agente humano revisa y envia.
- Clasificacion y enrutado de consultas de clientes: al estar ajustado sobre intents de soporte, puede utilizarse para etiquetar consultas entrantes y dirigirlas al equipo o flujo adecuado.
- Evaluacion comparativa de cuantizaciones en dominio: las tres variantes con imatrix de dominio permiten medir en produccion la perdida de calidad de Q4_K_M frente a Q8_0 en tareas reales de soporte.

## Benchmarks y rendimiento

Resultados reportados en la model card, medidos con lm-evaluation-harness:

| Benchmark | ronin-support-3b (GGUF) |
|---|---|
| arc_challenge | 51,0 % |
| hellaswag | 66,0 % |

No se han publicado resultados de benchmarks conversacionales, MMLU, GSM8K, HumanEval ni evaluaciones especificas del dominio de atencion al cliente en la informacion disponible. Tampoco se han publicado comparaciones directas con el modelo base Qwen2.5-3B-Instruct bajo el mismo harness.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M aproximadamente 2,0-2,5 GB; Q5_K_M aproximadamente 2,3-2,8 GB; Q8_0 aproximadamente 3,3-3,8 GB (incluye overhead de contexto y cache KV, que crece con la longitud de contexto).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650 4 GB, RTX 3050, RTX 4060, RTX 4090); en centro de datos, T4, L4, A10, A100 o H100 sirven el modelo con holgura, aunque para 3B su uso es sobredimensionado.
- Cabe en GPU consumer: si, en todas las variantes; Q4_K_M cabe incluso en GPUs de 4 GB y en CPU con 4-6 GB de RAM libre.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (flujo documentado en la model card), y cualquier runtime compatible con GGUF. vLLM y TGI no estan documentados para este repositorio; su soporte GGUF es parcial y no confirmado por el autor.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Formato |
|---|---|---|---|---|---|
| ronin-support-3b (este) | 3,09 B | no disponible | arc_challenge 51,0 %, hellaswag 66,0 % | no disponible | GGUF (Q4_K_M, Q5_K_M, Q8_0) |
| Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 tokens (nativo, segun documentacion del modelo base) | Resultados publicos del modelo base, no disponibles en esta ficha | Apache 2.0 (segun documentacion del modelo base) | safetensors, GGUF comunitario |
| Llama 3.2 3B Instruct | 3,21 B | 131.072 tokens (segun documentacion del modelo) | Resultados publicos del modelo, no disponibles en esta ficha | Llama 3.2 Community License | safetensors, GGUF comunitario |
| Phi-3.5-mini-instruct | 3,82 B | 131.072 tokens (segun documentacion del modelo) | Resultados publicos del modelo, no disponibles en esta ficha | MIT (segun documentacion del modelo) | safetensors, GGUF comunitario |

La comparativa es estructural: este modelo es un ajuste de dominio de Qwen2.5-3B-Instruct, por lo que su rendimiento general sera inferior al del base en tareas fuera de soporte al cliente, mientras que en dialogos del dominio Bitext deberia comportarse mejor que el base. No hay datos publicados que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor o revisar el repositorio del modelo base antes de cualquier despliegue en produccion.
- Especializacion estrecha: el ajuste se limita al dataset Bitext de soporte al cliente; fuera de ese dominio el modelo degradara hacia el comportamiento del base y puede producir respuestas genericas o incorrectas.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de tasa de alucinacion en el dominio; en un contexto de soporte, respuestas inventadas sobre pedidos, plazos o politicas de devolucion son un riesgo operativo real y requieren validacion contra el sistema de origen.
- Idiomas no declarados: no se confirma el soporte multilingue; si el dataset Bitext es predominantemente en ingles (como suele ocurrir en esta version), el modelo puede responder deficientemente en castellano.
- Contexto no declarado: la ventana efectiva tras el ajuste no esta documentada; no se debe asumir la ventana nativa de 32.768 tokens del base sin verificacion empirica.
- Sesgos: al entrenarse sobre dialogos sinteticos de un unico dataset, el modelo puede reproducir sesgos de estilo, formalidad y cobertura de casos del corpus Bitext, con infrarepresentacion de casuisticas no incluidas.
- Senales de madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni de validacion independiente.
- Benchmarks escasos: solo dos resultados de lm-evaluation-harness (arc_challenge y hellaswag), sin evaluacion conversacional ni de calidad de respuestas, lo que limita cualquier decision de adopcion basada en datos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/aryansexter/ronin-support-3b-GGUF
- Modelo base fusionado en FP16: https://huggingface.co/aryansexter/ronin-support-3b
- Modelo original de partida: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
