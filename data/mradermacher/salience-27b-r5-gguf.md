# mradermacher/Salience-27B-R5-GGUF

## Resumen

Salience-27B-R5 es un modelo multimodal de lenguaje y visión desarrollado por Vection Labs, distribuido aquí como cuantizaciones GGUF estáticas por mradermacher. Con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones), está diseñado específicamente para tareas de razonamiento eficiente, ingeniería de software y uso agéntico de herramientas, incluyendo interacción con terminales. La model card lo etiqueta explícitamente con términos como "thinking-efficiency", "agentic", "swe" y "tool-use", lo que indica que su entrenamiento está orientado a reducir la verbosidad del razonamiento sin sacrificar precisión en tareas complejas.

El modelo base es vectionlabs/Salience-27B-R5, y esta versión GGUF facilita su despliegue en entornos con recursos limitados mediante cuantizaciones que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), además de un proyector multimodal separado (mmproj) en Q8_0 y f16 para habilitar las capacidades de visión. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo hace atractivo para integración en productos.

Su relevancia actual radica en la combinación de tres factores: tamaño medio (27B) que cabe en GPUs de gama alta de consumo con cuantización agresiva, soporte multimodal nativo y un enfoque explícito en eficiencia de razonamiento y flujos agénticos, un área donde los modelos de la familia Qwen3 (a la que parece estar vinculado por la etiqueta "qwen3.8") han marcado tendencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language); detalles específicos no disponibles |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiqueta "long-context" sin cifra concreta) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. La model card del repositorio GGUF es una ficha de cuantización generada por mradermacher y no incluye descripción arquitectónica del modelo original. Los tags indican que se trata de un transformer multimodal con capacidades de visión y lenguaje, y la etiqueta "qwen3.8" sugiere una posible relación con la familia Qwen3, aunque no se confirma ni se detalla en la documentación disponible.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineación. Los tags "thinking" y "efficient-reasoning" apuntan a un entrenamiento orientado a modos de razonamiento explícito con control de verbosidad, pero no hay datos técnicos publicados en la información consultada. Para obtener detalles sobre el proceso de entrenamiento habría que consultar el repositorio del modelo base (vectionlabs/Salience-27B-R5).

## Capacidades

- Generación de texto y razonamiento con modo "thinking" explícito, orientado a eficiencia (menos tokens de razonamiento para el mismo resultado).
- Capacidades multimodales de visión y lenguaje (requiere cargar el fichero mmproj junto con el GGUF principal).
- Generación y comprensión de código, con énfasis en ingeniería de software (tag "swe").
- Uso de herramientas y function calling (tag "tool-use").
- Operación agéntica multi-paso, incluyendo interacción con terminal (tag "terminal").
- Soporte de contexto largo (tag "long-context", sin cifra publicada).
- Capacidades conversacionales multi-turno.
- Idiomas: inglés únicamente según la model card.

## Casos de uso

- Asistente de ingeniería de software en terminal: el modelo puede interpretar comandos, analizar salidas de shell y proponer correcciones en flujos agénticos, gracias a sus capacidades de tool-use y terminal documentadas en los tags.
- Automatización de revisión de código en CI/CD: integrado mediante tool calling, puede analizar diffs, ejecutar comprobaciones y generar parches, con la ventaja de un razonamiento más compacto que reduce coste por iteración.
- Agente de resolución de incidencias (SWE-bench style): para pipelines que requieren leer repositorios, localizar bugs y proponer parches verificables, aprovechando el contexto largo y el modo thinking.
- Análisis de documentación técnica con imágenes: al ser vision-language, puede procesar diagramas de arquitectura, capturas de pantalla de errores o esquemas junto con texto explicativo.
- Asistencia en pares para desarrollo local: desplegado con llama.cpp u Ollama en una estación de trabajo con GPU de consumo (Q4_K_M, 16,9 GB), ofrece un copiloto privado sin dependencia de API externa.
- Extracción estructurada de información de capturas y documentos: combinando visión y generación de texto para convertir imágenes de formularios o tablas en JSON estructurado.
- Prototipado de agentes autónomos de investigación: para tareas de múltiples pasos que requieren planificación, uso de herramientas y síntesis final, con la ventaja de la eficiencia de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de los pesos, sin contar KV cache):
  - Q2_K: ~11,0 GB
  - Q3_K_S: ~12,4 GB; Q3_K_M: ~13,6 GB; Q3_K_L: ~14,7 GB
  - IQ4_XS: ~15,5 GB; Q4_K_S: ~15,9 GB; Q4_K_M: ~16,9 GB
  - Q5_K_S: ~19,1 GB; Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - Añadir ~0,7 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16) si se usa visión.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M y Q5_K_M caben con margen; Q6_K ajustado; Q8_0 no cabe en una sola GPU.
  - RTX 3090 (24 GB): similar a la 4090 en capacidad, con menor throughput.
  - A100 40 GB / H100 80 GB: Q8_0 y f16 sin problemas, con contexto largo.
  - GPUs de 16 GB (RTX 4080, 4070 Ti Super): Q2_K a Q3_K_M con contexto moderado.
- Cabe en GPU de consumo: sí, desde 12 GB (Q2_K) hasta 24 GB (Q5_K_M/Q6_K).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; los tags indican "endpoints_compatible". Para el modelo base en safetensors: vLLM, TGI, transformers.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Salience-27B-R5 (este) | 27,3B | no disponible (tag long-context) | Sí (visión) | Apache 2.0 | GGUF, safetensors (base) |
| Qwen2.5-32B-Instruct | 32,5B | 128K (según documentación pública de Qwen) | No | Apache 2.0 (variante 32B) | GGUF, safetensors |
| Gemma 3 27B | 27B | 128K (según documentación pública de Google) | Sí (visión) | Gemma Terms of Use | GGUF, safetensors |
| Mistral Small 3.1 24B | 24B | 128K (según documentación pública de Mistral) | Sí (visión) | Apache 2.0 | GGUF, safetensors |

Nota: los datos de los modelos comparativos provienen de documentación pública general y no de la información proporcionada en esta ficha; verifíquense en sus repositorios oficiales. Para Salience-27B-R5 no se dispone de cifras de contexto ni de benchmarks que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- No hay benchmarks publicados en la información disponible, por lo que no se puede verificar su calidad frente a alternativas.
- Riesgo de alucinación inherente a modelos de 27B sin datos de evaluación publicados; en tareas agénticas con terminal el riesgo de comandos destructivos es real y requiere sandboxing.
- El modo "thinking" puede incrementar la latencia y el consumo de tokens si no se controla; la etiqueta "thinking-efficiency" sugiere mitigación, pero no hay métricas.
- Contexto máximo no especificado: planificar despliegues con margen de seguridad y validar empíricamente.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad (la propia model card marca Q3_K_M como "lower quality"); para producción se recomienda Q4_K_M o superior.
- El uso de visión requiere cargar el mmproj por separado; olvidarlo deshabilita la multimodalidad silenciosamente en algunos frontends.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base vectionlabs/Salience-27B-R5 por si añade cláusulas adicionales.
- Repositorio con 0 likes y 484 descargas en el momento de la consulta: comunidad pequeña, menor soporte y validación independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Salience-27B-R5-GGUF
- Modelo base: https://huggingface.co/vectionlabs/Salience-27B-R5
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Salience-27B-R5-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Salience-27B-R5-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
