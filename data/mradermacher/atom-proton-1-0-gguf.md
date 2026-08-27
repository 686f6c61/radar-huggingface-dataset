# mradermacher/atom-proton-1.0-GGUF

## Resumen

El modelo `atom-proton-1.0-GGUF` es una cuantización en formato GGUF del modelo base `CrowtherLabs/atom-proton-1.0`, realizada por el usuario mradermacher. Se trata de un modelo de lenguaje multimodal (visión-lenguaje) con capacidades de razonamiento, orientado a tareas conversacionales y de comprensión de imágenes. El modelo base cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), lo que lo sitúa en la gama de modelos grandes, y está licenciado bajo Apache-2.0, lo que permite uso comercial y modificación.

Esta versión GGUF está pensada para facilitar la ejecución local en hardware de consumo o servidores mediante herramientas como llama.cpp, Ollama o LM Studio, ofreciendo múltiples niveles de cuantización que permiten ajustar el equilibrio entre calidad y requisitos de memoria. La relevancia de este modelo radica en su naturaleza multimodal y su licencia permisiva, lo que lo convierte en una opción atractiva para desarrolladores que necesitan desplegar un asistente con comprensión de imágenes y razonamiento en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base no documentado en la ficha) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `CrowtherLabs/atom-proton-1.0` en la documentación proporcionada. Los metadatos indican que se trata de un modelo de tipo transformer (según la etiqueta `transformers`), con capacidades de visión-lenguaje y razonamiento, pero no se especifican detalles como el número de capas, la dimensión de los embeddings, el tipo de atención o si emplea alguna innovación como atención lineal o decodificación especulativa.

Tampoco se han publicado datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. La model card del cuantizador solo menciona que es una conversión estática del modelo original, sin aportar información adicional sobre el entrenamiento. Por tanto, estos aspectos quedan sin documentar en esta ficha.

## Capacidades

- Comprensión y generación de texto en inglés.
- Procesamiento de imágenes (modelo multimodal, según las etiquetas `vision-language`).
- Razonamiento y resolución de problemas, indicado por la etiqueta `reasoning`.
- Conversación multi-turno, orientada a usos conversacionales.
- Soporte de tool calling, agentes o funciones específicas: no disponible (no se menciona en la documentación).
- Capacidades multilingües: no disponible (solo se declara inglés).

## Casos de uso

- Asistente virtual con comprensión de imágenes: el modelo puede recibir una imagen y responder preguntas sobre su contenido, lo que permite construir asistentes para descripción de fotos, análisis de documentos escaneados o soporte visual en atención al cliente.
- Chat conversacional en inglés: gracias a su naturaleza conversacional, puede integrarse en chatbots para atención al cliente, foros o asistentes personales, manteniendo diálogos coherentes en varios turnos.
- Análisis de documentos técnicos con figuras: al combinar texto e imagen, puede ayudar a extraer información de diagramas, gráficos o capturas de pantalla en entornos de documentación técnica.
- Generación de descripciones accesibles: puede utilizarse para crear descripciones alternativas (alt text) de imágenes en sitios web o aplicaciones, mejorando la accesibilidad.
- Prototipado de aplicaciones de razonamiento visual: en entornos de investigación o desarrollo, sirve para experimentar con tareas que requieren combinar información visual y textual, como respuesta a preguntas sobre imágenes (VQA).
- Despliegue local en entornos con restricciones de conectividad: al estar disponible en GGUF, puede ejecutarse en máquinas locales sin depender de APIs externas, lo que es útil para aplicaciones con requisitos de privacidad o latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Por tanto, no es posible evaluar cuantitativamente su calidad en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Los tamaños de archivo indicados son:
  - Q2_K: 11,0 GB
  - Q3_K_S: 12,4 GB
  - Q3_K_M: 13,6 GB
  - Q3_K_L: 14,7 GB
  - Q4_K_S: 15,9 GB
  - Q4_K_M: 16,9 GB
  - Q5_K_S: 19,1 GB
  - Q5_K_M: 19,6 GB
  - Q6_K: 22,5 GB
  - Q8_0: 29,1 GB
  - mmproj-Q8_0: 0,7 GB (proyección multimodal)
  - mmproj-f16: 1,0 GB (proyección multimodal)
- Para cargar el modelo completo en memoria, se necesita una GPU con VRAM igual o superior al tamaño del archivo, más un margen para el contexto y los cálculos. Por ejemplo, Q4_K_M (16,9 GB) cabe en una RTX 4090 (24 GB) o en una A100 de 40 GB, pero no en GPUs de 16 GB como la RTX 4080 sin cuantización adicional o uso de CPU.
- Las cuantizaciones más pequeñas (Q2_K, Q3_K_S) pueden ejecutarse en GPUs de 12-16 GB, aunque con pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También es posible usar vLLM o TGI si se convierte a otro formato, aunque no se indica soporte nativo.
- Latencia y throughput: no disponible. Dependerá del hardware y de la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (tamaño similar, multimodal y razonamiento). El modelo base `CrowtherLabs/atom-proton-1.0` no tiene documentación pública en la ficha, y no se han encontrado referencias a modelos comparables en los resultados de búsqueda. Por tanto, esta sección queda sin datos concretos.

## Limitaciones y advertencias

- Al ser una cuantización, puede haber una degradación de la calidad en comparación con el modelo original en precisión completa, especialmente en las cuantizaciones más agresivas (Q2_K, Q3_K).
- El modelo solo está documentado para inglés; no se garantiza un buen rendimiento en otros idiomas.
- No se dispone de información sobre sesgos, alucinaciones o comportamientos no deseados del modelo base. Se recomienda realizar pruebas específicas antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero es necesario revisar los términos del modelo base original (`CrowtherLabs/atom-proton-1.0`) por si hubiera restricciones adicionales.
- El tamaño del repositorio (190,8 GB) incluye todas las cuantizaciones; es necesario descargar solo los archivos necesarios para el despliegue.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas específicas es desconocido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/atom-proton-1.0-GGUF
- Modelo base: https://huggingface.co/CrowtherLabs/atom-proton-1.0
- Página de descarga del modelo (según la model card): https://hf.tst.eu/model#atom-proton-1.0-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
