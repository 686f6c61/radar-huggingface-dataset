# ModernoTech/nova-2b

## Resumen

Nova 2B es un modelo de generacion de texto publicado por ModernoTech en el Hub de HuggingFace bajo licencia MIT. A pesar del nombre comercial "2B", los datos reales de safetensors indican 4.647.450.147 parametros totales, es decir, aproximadamente 4,65 mil millones de parametros. El autor lo describe como una arquitectura hibrida propietaria denominada "Hybrid MoCE + Ternary Native", combinada con un framework externo (Nova AI) que anade expertos modulares en Python, una capa de RAG sobre SQLite FTS5 y un motor de auto-mejora.

Segun la model card, el modelo forma parte de un sistema mayor: el LLM actua como motor de razonamiento de respaldo y "profesor" para sintetizar conocimiento nuevo, mientras que las tareas especializadas se delegan a expertos (CodeExpert, LanguagesExpert, MathExpert). El modelo se distribuye principalmente en formato GGUF y declara una ventana de contexto de 1.000.000 de tokens (1.048.576 en el ejemplo de llama.cpp), orientada a conversacion, generacion de texto y uso sin censura ("uncensored").

Es relevante porque propone un enfoque poco convencional: cuantizacion ternaria nativa (-1, 0, 1) empaquetada a 2 bits por peso, con acumuladores Int32 y activaciones Int16, evitando operaciones en coma flotante. No obstante, el repositorio no presenta benchmarks publicados, tiene cero descargas y cero "likes" en el momento de la consulta, por lo que se trata de un artefacto reciente y no validado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida propietaria "Hybrid MoCE + Ternary Native" (expertos modulares + pesos ternarios); arquitectura base no detallada en la informacion disponible |
| Parametros totales | 4.647.450.147 (segun safetensors); el nombre comercial indica "2B", lo que no coincide con el dato real |
| Parametros activos | no disponible (el autor menciona expertos MoCE, pero no publica conteo de parametros activos) |
| Longitud de contexto | 1.000.000 de tokens (declarado); el ejemplo de llama.cpp usa 1.048.576 |
| Tipos de cuantizacion | GGUF; empaquetado ternario a 2 bits por peso (declarado), tag "imatrix" presente |
| Idiomas soportados | es, en, zh, fr, pt |
| Licencia | MIT |
| Formato de pesos | GGUF (el repo incluye ademas safetensors, ya que los parametros se miden con ellos) |

## Arquitectura y entrenamiento

La model card describe una arquitectura en cinco capas: Nova Native (computacion entera/ternaria), Mixture of Code-Experts (MoCE) con conocimiento estructurado en SQLite, RAG ligero con indice FTS5 y ranking BM25, un motor de auto-mejora (Self-Improvement Engine) y el propio LLM Nova 2B como motor de razonamiento. Se afirma que la inferencia nativa usa pesos ternarios {-1, 0, 1} empaquetados a 2 bits, con acumuladores Int32 y activaciones Int16, sin coma flotante en operaciones criticas, y que existe un auditor (`nova_auditor.py`) que falla si detecta float.

No hay informacion verificable sobre el proceso de entrenamiento: no se declara el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO o cualquier etapa de alineamiento. Tampoco se detalla si la arquitectura interna es transformer, MoE convencional o un hibrido SSM/attention. Los expertos "MoCE" descritos son modulos Python con bases de conocimiento SQLite, no expertos neuronales integrados en los pesos del LLM, por lo que conviene distinguir entre la arquitectura del modelo GGUF y las capas de software del framework Nova AI. Todo lo anterior se basa exclusivamente en afirmaciones del autor y no ha sido confirmado por terceros.

## Capacidades

- Generacion de texto conversacional multi-turno, con el modelo marcado explicitamente como "conversational".
- Razonamiento y generacion de codigo mediante el CodeExpert declarado (HTML5, CSS3, JavaScript, Python); no esta claro si esa capacidad reside en los pesos del LLM o en modulos externos.
- Matematicas a traves del MathExpert declarado (algebra lineal, calculo, probabilidad y logica).
- Capacidades multilingues en es, en, zh, fr y pt, segun los idiomas declarados.
- Indice de recuperacion RAG integrado en el framework (SQLite FTS5 con ranking BM25), no como capacidad nativa del modelo.
- Modo "uncensored" segun los tags del repositorio.
- Servidor con API compatible con OpenAI (`/v1/chat/completions`) en el framework Nova AI.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el sistema de auto-mejora sugiere un bucle iterativo, pero no se documenta como capacidad de agente del LLM.
- Capacidades de vision o audio: no disponibles (no se declaran).

## Casos de uso

- Asistente conversacional local: gracias al formato GGUF y a la licencia MIT, el modelo puede ejecutarse sin conexion en LM Studio, Ollama o llama.cpp para construir un asistente de escritorio con contexto largo declarado de 1M de tokens.
- Generacion de codigo en entornos de desarrollo: el CodeExpert declarado (Python, JavaScript, HTML/CSS) permitiria usarlo como apoyo en editores integrados via el endpoint compatible con OpenAI, por ejemplo en VS Code o Cursor.
- Recuperacion aumentada sobre documentacion propia: la capa RAG con SQLite FTS5 y ranking BM25 permite indexar corpus lexicos ligeros sin infraestructura de bases vectoriales, util para consultas sobre manuales internos.
- Traduccion y atencion multilingue: con cinco idiomas declarados (es, en, zh, fr, pt), puede emplearse en flujos de traduccion o atencion al cliente en esos mercados.
- Prototipado de bajo coste en hardware de consumo: al ser un modelo de ~4,65B parametros en GGUF, cabe en GPUs de gama media, lo que lo hace util para pruebas de concepto sin presupuesto de nube.
- Fine-tuning e investigacion sobre cuantizacion ternaria: el enfoque de pesos ternarios y el auditor integer-only pueden servir como banco de pruebas para estudiar tecnicas de cuantizacion extrema.
- Generacion de ejercicios sinteticos: el Self-Improvement Engine descrito genera y verifica ejercicios de practica, aprovechable para crear material educativo de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion estandar, y no se han encontrado evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 4,65B parametros, no confirmada por el autor):
  - FP16: aproximadamente 9,3 GB.
  - Q8: aproximadamente 5 GB.
  - Q4: aproximadamente 2,8 GB.
  - Cuantizacion ternaria a 2 bits (declarada): aproximadamente 1,2 GB, mas overhead.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3090 o RTX 4090 (24 GB) puede ejecutar cualquier cuantizacion con holgura; una RTX 3060 de 12 GB cubre Q8 y Q4; GPUs de datacenter (A100, H100) no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en cuantizaciones Q4 o inferiores, segun las estimaciones anteriores.
- Opciones de despliegue: LM Studio, Ollama, llama.cpp (`llama-server -hf`), y servidor propio con API compatible con OpenAI (`nova_server.py`).
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nova 2B (ModernoTech) | 4,65B reales | 1M declarado | MIT | GGUF + safetensors en HF |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community | Amplia, con ecosistema maduro |
| Qwen2.5 3B | 3B | 32K | Apache 2.0 | Amplia, muy extendida |
| Phi-3.5 Mini | 3,8B | 128K | MIT | Amplia |

Datos de rendimiento comparado: no disponibles (Nova 2B no publica benchmarks, por lo que no es posible una comparacion cuantitativa honesta). Los modelos alternativos citados cuentan con evaluaciones publicas y ecosistemas de herramientas consolidados, mientras que Nova 2B es un artefacto reciente sin validacion externa.

## Limitaciones y advertencias

- Discrepancia entre el nombre ("2B") y los parametros reales (4,65B): conviene verificar el conteo antes de planificar recursos.
- Ausencia total de benchmarks publicados: no hay evidencia independiente del rendimiento real, incluida la supuesta ventana de 1M de tokens.
- Cero descargas y cero "likes" en el momento de la consulta: no ha sido validado por la comunidad.
- La model card mezcla la descripcion del LLM con la de un framework externo (MoCE, RAG, auto-mejora); parte de las "capacidades" pueden residir en software Python y no en los pesos del modelo, lo que dificulta evaluar el LLM de forma aislada.
- Riesgo de alucinacion: al ser un modelo pequeno (del orden de 4,65B) sin datos de alineamiento conocidos, es previsible una tasa de alucinacion elevada, especialmente en tareas facticas.
- Etiqueta "uncensored": implica filtros de seguridad reducidos o ausentes, con el consiguiente riesgo de generar contenido inapropiado en produccion.
- Idiomas: aunque se declaran cinco, no hay evidencia de calidad por idioma fuera del ingles; el rendimiento en zh, fr o pt es desconocido.
- Licencia MIT: permite uso comercial sin restricciones de licencia, pero no exime de responsabilidad sobre el contenido generado ni sobre posibles sesgos.
- La fecha de creacion indicada (2026-09-23) y la falta de documentacion de entrenamiento dificultan auditar el origen de los datos y sus posibles sesgos.
- No se documentan capacidades de tool calling, agentes ni multimodalidad, por lo que no deberian asumirse en un despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/ModernoTech/nova-2b
- Especificacion GGUF del autor (referenciada en la model card): docs/NOVA_GGUF_SPEC.md
- Licencia: archivo LICENSE en el repositorio (MIT)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
