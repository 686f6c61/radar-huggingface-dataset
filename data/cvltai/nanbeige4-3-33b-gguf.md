# CVLTAI/Nanbeige4.3-33B-GGUF

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de 33.120 millones de parámetros desarrollado por Nanbeige, orientado a tareas agénticas, programación compleja y colaboración profesional ("cowork"). Esta ficha corresponde a la versión GGUF publicada por CVLTAI, que consiste en conversiones cuantizadas del modelo original en safetensors para su ejecución local con llama.cpp; no se trata de un fine-tune ni una destilación independiente.

El modelo destaca por su ventana de contexto de 524.288 tokens (512K), una de las más amplias disponibles en modelos abiertos de este tamaño, y por su soporte nativo de razonamiento extendido (`enable_thinking`) y tool calling en formato XML o JSON. Su arquitectura es Llama (LlamaForCausalLM) con tensor tipo BF16 en el original. Publicado bajo licencia Apache 2.0, permite uso comercial sin restricciones relevantes, lo que lo hace atractivo para despliegues locales de agentes que necesiten procesar documentos o repositorios muy extensos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parámetros totales | 33.118.977.024 (~33,12B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantización | Q8_0 (35,2 GB), Q6_K (27,2 GB), Q5_K_M (23,5 GB), Q4_K_M (20,1 GB), Q3_K_M (16,3 GB), Q2_K (12,7 GB) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); el original está en safetensors BF16 |

Detalles arquitectónicos adicionales: 52 capas, tamaño oculto de 7.168, 56 cabezas de atención y 8 cabezas KV (GQA), con un vocabulario de 166.912 tokens.

## Arquitectura y entrenamiento

Nanbeige4.3-33B emplea una arquitectura transformer decoder-only de tipo Llama, con grouped-query attention (56 cabezas de consulta frente a 8 cabezas KV), lo que reduce significativamente el tamaño de la caché KV y resulta especialmente relevante dada la ventana de contexto de 512K tokens. El vocabulario de 166.912 tokens es amplio y está orientado a cubrir eficientemente inglés y chino.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset y el uso de técnicas como RLHF o DPO no están disponibles en la información proporcionada. El tokenizer soporta un modo de razonamiento activable (`enable_thinking`, activado por defecto) y plantillas de chat con soporte de herramientas, lo que indica un entrenamiento orientado a agentes y a uso conversacional con razonamiento extendido.

## Capacidades

- Generación de texto conversacional, con plantilla de chat y modo de razonamiento extendido (`enable_thinking`, activado por defecto; controlable con `preserve_thinking`).
- Tareas agénticas: el modelo está posicionado por su autor como "agentic teacher model", con soporte de tool calling en formato XML (también JSON).
- Programación compleja y tareas profesionales de colaboración, según la descripción del modelo original.
- Contexto extremadamente largo: 512K tokens, adecuado para procesar documentos extensos, bases de código completas o conversaciones muy largas.
- Capacidades multilingües centradas en inglés y chino; el rendimiento en español no está documentado.
- No se menciona soporte de visión, audio ni otras modalidades; es un modelo de solo texto.

## Casos de uso

- Procesamiento de documentos extensos: con 512K de contexto puede analizar contratos, informes técnicos o expedientes completos en una sola pasada, sin necesidad de estrategias de chunking o RAG para la mayoría de documentos.
- Agentes con herramientas locales: su soporte de tool calling (XML/JSON) y su posicionamiento agéntico lo hacen adecuado para agentes que ejecutan funciones, consultan APIs o navegan por pasos en flujos multi-step.
- Análisis y refactorización de bases de código: la ventana de contexto permite cargar repositorios de tamaño considerable para revisión, generación de tests o refactoring asistido.
- Asistente de programación en local: ejecutable con llama.cpp u Ollama en estaciones de trabajo con GPU de gama alta, sin depender de servicios en la nube.
- Bilingüe inglés-chino: útil en equipos que trabajan con documentación y comunicación en ambos idiomas, por ejemplo traducción técnica o soporte al cliente en esos mercados.
- Generación y resumen de contenido profesional: redacción de informes largos donde mantener coherencia a lo largo de decenas de miles de tokens es crítico.
- Modelos "profesor" para destilación: su etiqueta de "agentic teacher model" sugiere su uso para generar datos de entrenamiento o trayectorias de agente que destilen capacidades en modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo original incluía benchmarks de referencia, pero no se reproducen los valores en la información proporcionada y no se ha ejecutado evaluación local sobre los ficheros cuantizados.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV):
  - Q8_0: ~35,2 GB
  - Q6_K: ~27,2 GB
  - Q5_K_M: ~23,5 GB
  - Q4_K_M: ~20,1 GB
  - Q3_K_M: ~16,3 GB
  - Q2_K: ~12,7 GB
- GPU recomendadas: para Q4_K_M o superior, una RTX 4090 (24 GB) es insuficiente por sí sola para los pesos en Q5/Q6/Q8; opciones realistas son una A100 40 GB/80 GB, H100, o doble GPU consumer (por ejemplo, 2x RTX 3090/4090 con offload). Q4_K_M (20,1 GB) cabe en una RTX 4090 de 24 GB dejando margen limitado para la caché KV; con contexto de 512K la caché KV puede ser muy grande, por lo que contextos largos exigirán más VRAM o cuantización de KV cache.
- Consumer GPUs: Q3_K_M (16,3 GB) y Q2_K (12,7 GB) caben en una RTX 4090 o RTX 3090 (24 GB) con margen para contexto moderado; Q2_K también cabe en GPUs de 16 GB con contexto reducido, con pérdida de calidad notable.
- CPU: al ser GGUF, puede ejecutarse en CPU puro o híbrido CPU+GPU con llama.cpp, con latencias considerablemente mayores.
- Despliegue: llama.cpp (formato nativo de esta versión), Ollama, LM Studio y otros runtimes compatibles con GGUF. Para el modelo original en safetensors, vLLM o TGI serían opciones adecuadas (no verificado para esta versión concreta).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nanbeige4.3-33B | 33,12B (denso) | 512K | Apache 2.0 | safetensors + GGUF |
| Qwen2.5-32B | 32,5B (denso) | 128K | Apache 2.0 (excepto 3B/72B) | safetensors + GGUF amplio |
| Qwen3-32B | 32,8B (denso) | ~131K (con extensión YaRN hasta ~262K según versión) | Apache 2.0 | safetensors + GGUF amplio |
| Gemma 3 27B | 27,4B (denso) | 128K | Gemma license (con restricciones) | safetensors + GGUF |

Nanbeige4.3-33B se diferencia principalmente por su contexto de 512K, muy superior al de sus alternativas directas de ~30B, y por su enfoque agéntico declarado. A cambio, su ecosistema de cuantizaciones y herramientas de terceros es más reducido que el de Qwen, y sus benchmarks públicos comparativos no están disponibles en la información proporcionada, por lo que no es posible afirmar su posición relativa en calidad de salida.

## Limitaciones y advertencias

- Idiomas documentados: inglés y chino únicamente. El rendimiento en español no está documentado y puede ser inferior; conviene evaluarlo antes de uso en producción en castellano.
- Riesgo de alucinación: no evaluado públicamente en la información disponible; como todo LLM, requiere verificación de salidas en tareas factuales.
- Sesgos conocidos: no disponibles; no se ha publicado documentación sobre sesgos o evaluaciones de seguridad.
- Contexto de 512K: la caché KV resultante puede consumir decenas de GB de VRAM en contextos largos, incluso con GQA (8 cabezas KV); planificar memoria o usar cuantización de KV cache.
- Cuantizaciones agresivas: Q2_K y Q3_K_M implican pérdida de calidad notable respecto a Q4_K_M o superior; el autor recomienda cuantizar siempre desde f16, nunca desde otra cuantización.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con aviso de licencia; sin restricciones relevantes para producción.
- Esta versión GGUF es una conversión de terceros (CVLTAI) sin evaluación local; para máxima fidelidad, usar el modelo original en safetensors BF16.
- No se ha verificado compatibilidad con vLLM/TGI para esta arquitectura concreta; la vía soportada documentadamente es llama.cpp.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/CVLTAI/Nanbeige4.3-33B-GGUF
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Paper, blog oficial y demos: no disponibles en la información proporcionada.
