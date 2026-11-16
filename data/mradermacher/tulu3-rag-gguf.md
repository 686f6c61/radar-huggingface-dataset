# mradermacher/Tulu3-RAG-GGUF

## Resumen

Tulu3-RAG-GGUF es la versión cuantizada en formato GGUF del modelo ldsjmdy/Tulu3-RAG, un ajuste fino del modelo Tulu 3 de Allen Institute for AI (AI2) orientado a tareas de generación aumentada por recuperación (RAG). El modelo original parte de una base de 8.030 millones de parámetros y ha sido ajustado adicionalmente sobre el dataset ldsjmdy/Tulu3-Block-FT-RAG, presumiblemente para mejorar su comportamiento en escenarios donde se le proporciona contexto documental externo. Esta versión GGUF, publicada por mradermacher el 2 de marzo de 2025, facilita su despliegue en entornos con llama.cpp, Ollama y otras herramientas compatibles con este formato.

El interés de esta ficha radica en que permite ejecutar un modelo de 8B especializado en RAG en hardware de consumo, algo relevante para desarrolladores que necesitan desplegar pipelines de recuperación y generación sin depender de infraestructura en la nube. Al estar basado en la familia Tulu 3, hereda el enfoque de ajuste fino supervisado y preferencias (DPO) del modelo original, aunque la model card no detalla el proceso de entrenamiento específico del ajuste RAG.

La información disponible es limitada: la model card del repositorio GGUF es principalmente una plantilla de mradermacher con la tabla de cuantizaciones, sin datos sobre benchmarks, licencia explícita ni detalles del entrenamiento del modelo base. Esta ficha refleja fielmente esa escasez de datos, marcando como "no disponible" todo aquello que no puede verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Tulu 3; detalles no disponibles) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base ldsjmdy/Tulu3-RAG es un ajuste fino de la familia Tulu 3 de AI2, que emplea una arquitectura transformer decoder-only. Tulu 3 se entrena mediante una combinación de ajuste fino supervisado (SFT) y optimización de preferencias (DPO), aunque la model card de este repositorio no especifica los detalles exactos del pipeline utilizado para el ajuste RAG ni el número de tokens de entrenamiento. El dataset declarado es ldsjmdy/Tulu3-Block-FT-RAG, que sugiere un ajuste orientado a tareas de recuperación aumentada, probablemente con ejemplos de preguntas y respuestas condicionadas a bloques de contexto.

La versión aquí descrita es una cuantización estática (quantize_version 2, output_tensor_quantised 1) realizada por mradermacher a partir de los pesos en formato Hugging Face del modelo original. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de pensamiento. Tampoco se dispone de información sobre la composición del dataset de entrenamiento más allá de su nombre.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Tulu 3.
- Especialización presumible en tareas de RAG: responder preguntas condicionadas a contexto documental proporcionado en el prompt.
- Razonamiento multi-turno y seguimiento de instrucciones (capacidades base de Tulu 3).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Asistentes de documentación técnica: el modelo puede recibir fragmentos de documentación recuperados por un sistema de búsqueda vectorial y generar respuestas contextualizadas, aprovechando su ajuste específico en RAG para mantenerse fiel al contexto proporcionado.
- Atención al cliente sobre base de conocimiento: integrado en un pipeline que recupera artículos de ayuda y los pasa como contexto, el modelo genera respuestas en inglés fundamentadas en la documentación de la empresa.
- Búsqueda semántica con respuesta generativa: combinado con un retriever (por ejemplo, embeddings + FAISS), el modelo sintetiza respuestas a partir de los pasajes recuperados, reduciendo alucinaciones al condicionar la generación al contexto.
- Análisis de contratos o documentos legales: dado un fragmento de un contrato recuperado, el modelo puede responder preguntas concretas sobre cláusulas, siempre que el contexto se incluya en el prompt.
- Generación de resúmenes de documentación interna: el modelo puede condensar pasajes recuperados de wikis o repositorios de conocimiento, manteniendo la terminología del contexto.
- Prototipado de pipelines RAG en local: gracias a las cuantizaciones Q4_K_M (5,0 GB) y Q5_K_M (5,8 GB), es posible desplegar un sistema RAG completo en una GPU de consumo o incluso en CPU, ideal para desarrollo y pruebas antes de escalar a producción.
- Educación y tutoría: el modelo puede responder preguntas sobre material de estudio recuperado previamente, citando el contexto proporcionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K (3,3 GB): ~4 GB de VRAM.
  - Q4_K_M (5,0 GB): ~6 GB de VRAM.
  - Q5_K_M (5,8 GB): ~7 GB de VRAM.
  - Q8_0 (8,6 GB): ~10 GB de VRAM.
  - f16 (16,2 GB): ~18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100/H100 para f16 o despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB con Q4_K_S hasta una RTX 4090 con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). Para vLLM o TGI se requeriría el modelo en safetensors, no en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tulu3-RAG-GGUF (este) | 8,03B | no disponible | no disponible | GGUF | Ajuste RAG sobre Tulu 3 |
| Tulu 3 8B (AI2) | 8B | 65.536 tokens (según documentación pública de AI2) | Llama 3.1 Community License | safetensors, GGUF (comunidad) | Modelo base sin ajuste RAG |
| Llama 3.1 8B Instruct | 8B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | Alternativa generalista |
| Mistral 7B Instruct | 7,3B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva |

Nota: los datos de Tulu 3 8B, Llama 3.1 8B y Mistral 7B provienen de documentación pública de sus respectivos autores y no de la información proporcionada en esta búsqueda; se incluyen como referencia contextual. La licencia del modelo aquí descrito no está disponible, lo que impide confirmar si hereda la licencia de Llama 3.1 o tiene restricciones adicionales.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base ldsjmdy/Tulu3-RAG y de Tulu 3 antes de usarlo en producción.
- Idioma limitado al inglés: no se declaran capacidades multilingües; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo, puede inventar información aunque se le proporcione contexto; el ajuste RAG mitiga pero no elimina este riesgo.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad para este ajuste específico; hereda los sesgos de los datos de entrenamiento de Tulu 3 y del dataset RAG.
- Contexto máximo no documentado: se desconoce la ventana de contexto efectiva, lo que dificulta dimensionar los pipelines de recuperación.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento en tareas RAG frente a alternativas.
- Modelo de nicho con pocas descargas (201) y sin likes: menor validación comunitaria y soporte.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tulu3-RAG-GGUF
- Modelo base (safetensors): https://huggingface.co/ldsjmdy/Tulu3-RAG
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/Tulu3-RAG-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Tulu3-RAG-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/ldsjmdy/Tulu3-Block-FT-RAG
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
