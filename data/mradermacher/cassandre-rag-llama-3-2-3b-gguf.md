# mradermacher/Cassandre-RAG-Llama-3.2-3B-GGUF

## Resumen

Cassandre-RAG-Llama-3.2-3B es un ajuste fino del modelo Llama 3.2 de 3B parámetros desarrollado por el usuario jbl2024, orientado específicamente a tareas de generación aumentada por recuperación (RAG). El modelo original ha sido cuantizado en formato GGUF por mradermacher, un conocido creador de cuantizaciones de la comunidad, para facilitar su despliegue en hardware de consumo y entornos con recursos limitados.

Con 3.212.749.888 parámetros y una licencia MIT, este modelo se posiciona como una opción ligera para pipelines RAG que requieren inferencia local o en dispositivos con VRAM moderada. La cuantización GGUF permite ejecutar el modelo desde 1,5 GB (Q2_K) hasta 6,5 GB (f16), lo que lo hace accesible en GPUs de consumo como la RTX 3060 o incluso en CPU.

La relevancia actual radica en la creciente demanda de modelos pequeños y eficientes para RAG en producción, donde la latencia y el coste computacional son críticos. Sin embargo, la información pública sobre el ajuste fino original es escasa, y no se han publicado benchmarks específicos ni detalles sobre el dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Llama 3.2) |
| Parámetros totales | 3.212.749.888 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2, un transformer decoder-only con atención causal estándar. Los detalles específicos sobre la arquitectura interna (número de capas, dimensiones ocultas, cabezas de atención) no están disponibles en la información proporcionada, pero al tratarse de un modelo de 3B parámetros, se espera una configuración similar a la de Llama 3.2 3B (28 capas, 3072 dimensiones ocultas, 24 cabezas de atención, según la documentación pública de Meta, aunque esto no se confirma en la model card).

El ajuste fino fue realizado por jbl2024 con el objetivo de especializar el modelo en tareas RAG. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. La model card del modelo base (jbl2024/Cassandre-RAG-Llama-3.2-3B) no está incluida en la información proporcionada, por lo que se desconoce si hubo innovaciones técnicas destacables como decodificación especulativa o atención lineal.

La cuantización fue realizada por mradermacher utilizando cuantizaciones estáticas (no imatrix), con versiones desde Q2_K hasta f16. No se han generado cuantizaciones ponderadas/imatrix para este modelo, según indica la model card.

## Capacidades

- Generación de texto en inglés, con especialización en tareas de RAG (recuperación y generación).
- Razonamiento sobre documentos recuperados, integrando contexto externo en las respuestas.
- No se dispone de información sobre soporte de tool calling o function calling.
- No se dispone de información sobre capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (según el campo `language: en`).
- No se dispone de información sobre modos especiales como thinking mode, visión o audio.

## Casos de uso

- **Atención al cliente automatizada con base de conocimiento**: el modelo puede integrarse en un pipeline RAG para responder preguntas frecuentes recuperando fragmentos de documentación interna. Su tamaño de 3B permite inferencia en tiempo real en GPUs de consumo, reduciendo costes frente a modelos más grandes.
- **Búsqueda semántica en documentación técnica**: dado su ajuste para RAG, puede utilizarse para generar respuestas concisas a partir de manuales o artículos recuperados, ideal para asistentes de documentación en entornos de desarrollo.
- **Generación de resúmenes de documentos recuperados**: en flujos de trabajo donde se recuperan múltiples pasajes, el modelo puede sintetizar la información en un resumen coherente, adecuado para herramientas de investigación o análisis de contratos.
- **Chatbots de soporte interno en empresas**: desplegado con llama.cpp u Ollama en servidores modestos, puede gestionar conversaciones multi-turno con contexto recuperado de wikis internas, sin necesidad de GPUs de datacenter.
- **Prototipado rápido de aplicaciones RAG**: gracias a su licencia MIT y su formato GGUF, es adecuado para pruebas de concepto en entornos de desarrollo con recursos limitados, permitiendo validar pipelines antes de escalar a modelos mayores.
- **Sistemas de preguntas y respuestas sobre bases de datos vectoriales**: el modelo puede conectarse a un retriever (por ejemplo, FAISS o Chroma) para responder preguntas sobre corpus específicos, como normativas o documentación legal, con latencia baja en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - Q2_K: ~1,5 GB
  - Q4_K_M: ~2,1 GB
  - Q8_0: ~3,5 GB
  - f16: ~6,5 GB
- **GPU recomendadas**: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) para cuantizaciones altas; GPUs con 4-6 GB de VRAM pueden ejecutar cuantizaciones Q4/Q5.
- **¿Cabe en consumer GPU?**: Sí, en la mayoría de GPUs de consumo modernas, especialmente con cuantizaciones Q4_K_M o inferiores. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- **Opciones de despliegue**: llama.cpp, Ollama, text-generation-webui, y cualquier runtime compatible con GGUF. No se recomienda vLLM o TGI para GGUF (aunque es posible con adaptadores), ya que están más orientados a safetensors.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Dependerán del hardware y la cuantización; en una RTX 3060 con Q4_K_M se espera un throughput de decenas de tokens por segundo, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cassandre-RAG-Llama-3.2-3B (este) | 3,2B | No disponible | MIT | GGUF | Ajuste fino para RAG |
| Llama 3.2 3B (Meta) | 3,2B | 128k (según Meta) | Llama 3.2 Community License | Safetensors, GGUF | Modelo base, no especializado en RAG |
| Mistral 7B (Mistral AI) | 7,2B | 32k | Apache 2.0 | Safetensors, GGUF | Mayor tamaño, no especializado en RAG |
| Phi-3-mini (Microsoft) | 3,8B | 4k/128k | MIT | Safetensors, GGUF | Similar tamaño, orientado a razonamiento |

La comparativa se basa en características públicas de los modelos; no se dispone de benchmarks comparativos para este ajuste fino. El modelo base Llama 3.2 3B tiene una licencia más restrictiva que la MIT de este ajuste, lo que puede ser un factor decisivo para uso comercial.

## Limitaciones y advertencias

- **Sesgos conocidos**: al derivar de Llama 3.2, el modelo puede heredar sesgos presentes en los datos de entrenamiento originales, aunque no se han documentado específicamente para este ajuste.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas RAG si el contexto recuperado es irrelevante o insuficiente.
- **Limitaciones de contexto o idioma**: solo soporta inglés según la model card; no se recomienda su uso en otros idiomas. La longitud de contexto no está documentada, lo que limita su uso en documentos muy largos.
- **Restricciones de licencia**: la licencia MIT permite uso comercial sin restricciones, pero se debe verificar que el modelo base (jbl2024/Cassandre-RAG-Llama-3.2-3B) no imponga condiciones adicionales (no disponible en la información).
- **Caveats para producción**: no se han publicado evaluaciones de calidad ni benchmarks, por lo que su rendimiento real en tareas RAG es desconocido. La cuantización estática (no imatrix) puede degradar la calidad en comparación con cuantizaciones ponderadas. Además, el modelo tiene muy pocas descargas (45) y nula tracción (0 likes), lo que sugiere falta de validación comunitaria.

## Enlaces

- [HuggingFace: mradermacher/Cassandre-RAG-Llama-3.2-3B-GGUF](https://huggingface.co/mradermacher/Cassandre-RAG-Llama-3.2-3B-GGUF)
- [Modelo base: jbl2024/Cassandre-RAG-Llama-3.2-3B](https://huggingface.co/jbl2024/Cassandre-RAG-Llama-3.2-3B)
- [Página de conveniencia para descargas](https://hf.tst.eu/model#Cassandre-RAG-Llama-3.2-3B-GGUF)
- [README de ejemplo de TheBloke para uso de GGUF](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico de comparación de cuantizaciones (ikawrakow)](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Reflexiones de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [FAQ y solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
