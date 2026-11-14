# nulliaukamk/Nullabby1.1-small-Q3_K_M

## Resumen

Nullabby1.1-small es un modelo de lenguaje de 8.791.592.960 parametros (aproximadamente 8,8B) desarrollado por Nullabby Studios, publicado en Hugging Face bajo el identificador `nulliaukamk/Nullabby1.1-small-Q3_K_M`. Se trata de un ajuste de identidad sobre la arquitectura granite-4.0-h, posteriormente "decensored" mediante la herramienta heretic, que aplica una tecnica de abliteration para reducir la tasa de rechazos. El resultado declarado por el autor es una bajada de la tasa de rechazo del 39% al 4%, con una divergencia KL de 0,0103 respecto al modelo original.

El modelo se distribuye unicamente en formato GGUF con cuantizacion Q3_K_M (aproximadamente 4,05 GiB), lo que lo hace apto para inferencia en CPU o en GPUs de gama de consumo con poca VRAM. Declara una longitud de contexto de 131.072 tokens con `rope_theta` de 1e7 y una plantilla de chat de estilo ChatML (system/user/assistant) descrita como "minja-safe".

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, con 42 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados, sin idiomas declarados y con licencia "other" sin texto de licencia disponible. Su interes principal radica en ser un ejemplo de modelo "abliterated" sobre base Granite, orientado a experimentacion sin filtros de rechazo, no a despliegues de produccion con garantias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base granite-4.0-h), 40 capas |
| Parametros totales | 8.791.592.960 (~8,8B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 131.072 tokens (`rope_theta` 1e7) |
| Tipos de cuantizacion | Q3_K_M (GGUF); no se listan otras en el repo |
| Idiomas soportados | no disponible |
| Licencia | other (texto de licencia no disponible) |
| Formato de pesos | GGUF (~4,05 GiB); repo de 8,7 GB |
| Vocabulario | 100.352 tokens |
| Plantilla de chat | ChatML (system/user/assistant), "minja-safe" |
| Tag de pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura granite-4.0-h, un transformer denso de 40 capas con vocabulario de 100.352 tokens y contexto extendido de 131.072 tokens mediante `rope_theta` de 1e7. Sobre esa base, el autor aplica un ajuste de identidad que fija el nombre del modelo, el recuento de parametros (8B), la atribucion a Nullabby Studios y el caracter "uncensored". Posteriormente se aplica heretic, una herramienta de abliteration que modifica los pesos para eliminar la direccion de rechazo en el espacio de activaciones.

Los datos concretos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. El unico dato cuantitativo de entrenamiento es el resultado del proceso de decensoring: reduccion de la tasa de rechazo del 39% al 4% con una divergencia KL de 0,0103 frente al modelo previo, lo que indica una alteracion relativamente contenida de la distribucion de salida. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla ChatML y soporte de mensajes de sistema.
- Contexto largo de hasta 131.072 tokens, adecuado para documentos extensos o historiales de conversacion prolongados.
- Respuestas con baja tasa de rechazo declarada (4% tras abliteration), orientada a contenido que otros modelos filtran.
- Ajuste de identidad: el modelo se presenta como "Nullabby1.1-small" de Nullabby Studios.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Capacidad de codigo, matematicas, tool calling o razonamiento avanzado: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Experimentacion con tecnicas de abliteration: el modelo sirve como referencia practica para estudiar el efecto de heretic sobre una base Granite, comparando la tasa de rechazo (39% a 4%) y la divergencia KL (0,0103) en entornos de investigacion sobre alineamiento.
- Inferencia en hardware limitado: con cuantizacion Q3_K_M (~4,05 GiB) puede ejecutarse en GPUs de consumo con 6-8 GB de VRAM o en CPU via llama.cpp, lo que permite prototipado local sin infraestructura dedicada.
- Procesamiento de documentos largos en local: los 131.072 tokens de contexto permiten resumir o extraer informacion de contratos, informes o transcripciones extensas en un solo paso, siempre que la calidad de la cuantizacion Q3 sea suficiente para la tarea.
- Generacion creativa sin filtros: escritura de ficcion, guiones o dialogos donde los rechazos del modelo base resultan indeseados, usando la plantilla ChatML con mensajes de sistema para fijar tono y estilo.
- Chatbot de personaje o roleplay: el ajuste de identidad y la baja tasa de rechazo lo hacen util para asistentes con personalidad definida en prototipos y demos internas.
- Evaluacion comparativa de cuantizaciones: al existir como build GGUF Q3_K_M, permite medir la degradacion de calidad frente a pesos de mayor precision de la misma familia, con la advertencia de que no se publican otras variantes en este repo.
- Pruebas de integracion con llama.cpp: el comando documentado (`llama-cli -hf nulliaukamk/nullabby1.1-small-Q3_K_M -cnv`) facilita validar pipelines de inferencia local y compatibilidad con la plantilla ChatML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado es la tasa de rechazo (39% a 4%) y la divergencia KL (0,0103) del proceso de decensoring, que no son metricas de calidad de tarea.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,05 GiB solo para los pesos en Q3_K_M; con cache KV para contexto largo, el consumo crece de forma proporcional a la longitud de secuencia.
- GPU de consumo: cabe en tarjetas con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070), asumiendo contextos moderados.
- GPU profesionales: A100, H100 o RTX 4090 no son necesarias para esta cuantizacion; sobran para el modelo, aunque permitirian contextos muy largos con cache KV ampliada.
- CPU: viable mediante llama.cpp en modo CPU, con throughput bajo pero funcional para prototipos.
- Opciones de despliegue: llama.cpp / llama-cli (documentado por el autor), y por compatibilidad de formato GGUF, otros runners que lo soporten (Ollama, llama-cpp-python). vLLM y TGI no estan confirmados para este artefacto GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nullabby1.1-small-Q3_K_M | ~8,8B | 131.072 | GGUF Q3_K_M | other | Abliterated, sin benchmarks, 42 descargas |
| Base granite-4.0-h (referencia) | ~8B (familia) | 131.072 | safetensors | no disponible | Modelo original sin decensoring; datos exactos de la variante no disponibles |
| Alternativas abliterated de ~8B | ~7-9B | variable | GGUF/safetensors | variable | No se dispone de datos concretos en la informacion proporcionada |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks publicados ni se detallan los pesos originales de granite-4.0-h en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina la direccion de rechazo, no los sesgos ni el conocimiento subyacente: el modelo puede generar contenido danino, ofensivo o inexacto sin señal de alerta.
- Riesgo de alucinacion no mitigado: no hay datos de entrenamiento ni evaluaciones que permitan acotarlo.
- La cuantizacion Q3_K_M es agresiva; se espera degradacion de calidad frente a pesos de mayor precision, especialmente en tareas de razonamiento y codigo.
- Idiomas no declarados: el comportamiento multilingue es desconocido y probablemente limitado al ingles si la base Granite no se ajusto para otros idiomas.
- Licencia "other" sin texto disponible: no se puede confirmar el uso comercial; tratar como no apto para produccion hasta verificar los terminos.
- Modelo de nicho con 42 descargas y 0 likes: sin comunidad, sin soporte y sin validacion independiente.
- El contexto de 131.072 tokens en Q3 requiere cache KV considerable; en hardware de consumo el contexto efectivo sera mucho menor.
- No apto para despliegues de atencion al cliente o produccion regulada sin auditoria previa de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nulliaukamk/Nullabby1.1-small-Q3_K_M
- Heretic (herramienta de decensoring): https://github.com/p-e-w/heretic
- Repositorio de llama.cpp (inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Paper o blog de la arquitectura granite-4.0-h: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible
