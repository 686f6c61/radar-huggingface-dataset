# mradermacher/Qwen3.5-9B-OBLITERATED-GGUF

## Resumen

Qwen3.5-9B-OBLITERATED-GGUF es una cuantización GGUF del modelo Qwen3.5-9B-OBLITERATED, creada por mradermacher. El modelo base, desarrollado por shoukewei, es una versión "abliterada" de Qwen3.5-9B, una técnica que elimina las direcciones de activación responsables de los comportamientos de rechazo y censura del modelo original de Alibaba. El resultado es un modelo "uncensored" que conserva las capacidades de razonamiento y generación del Qwen3.5-9B, pero sin filtros de seguridad en las respuestas.

Qwen3.5 es una familia de modelos multimodales (visión-lenguaje) de código abierto. La variante de 9B parámetros emplea un transformer con fusión temprana de tokens multimodales, y según los benchmarks publicados supera a los modelos Qwen3-VL en razonamiento, codificación, agentes y comprensión visual. La cuantización GGUF de mradermacher ofrece doce niveles de compresión (desde Q2_K hasta f16), lo que permite ejecutar el modelo en hardware de consumo con requisitos de VRAM desde aproximadamente 4 GB hasta 18 GB. El repositorio tiene 0 descargas y 0 likes, lo que indica una publicación reciente o de baja visibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), basada en Qwen3.5-9B |
| Parámetros totales | 8.953.803.264 (~8,95B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (estimación de 4.096 tokens según free2aitools.com, sin confirmar) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (según metadatos) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Qwen3.5-9B es un transformer denso que integra visión y lenguaje mediante fusión temprana durante el preentrenamiento. Esta arquitectura, desarrollada por Alibaba, alcanza paridad generacional con Qwen3 y supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual, según los resultados publicados por el equipo de Qwen. El modelo base fue entrenado con un pipeline que incluye preentrenamiento extensivo, fine-tuning supervisado y alineación mediante técnicas de preferencia humana.

La versión "OBLITERATED" de shoukewei aplica la técnica de abliteration, que consiste en identificar y neutralizar las direcciones en el espacio de activaciones que se correlacionan con los comportamientos de rechazo y censura del modelo original. Este proceso no modifica los pesos de la capa de salida ni las capacidades generales del modelo, pero elimina los filtros de seguridad. La cuantización GGUF de mradermacher es una conversión estática de los pesos del modelo abliterado, sin modificaciones adicionales. El repositorio incluye también una variante con imatrix (Qwen3.5-9B-OBLITERATED-i1-GGUF) para una mejor calidad de cuantización.

## Capacidades

- Generación de texto sin restricciones de contenido: el modelo responde sin filtros de rechazo, lo que permite generar contenido que el modelo original bloquearía.
- Razonamiento y resolución de problemas: hereda las capacidades de razonamiento de Qwen3.5-9B, incluyendo razonamiento multi-paso.
- Generación de código: soporta tareas de programación en varios lenguajes, heredadas de la base Qwen3.5.
- Capacidades multimodales (visión-lenguaje): el modelo base es multimodal, aunque no se confirma si el proyecto multimodales se conserva en la versión GGUF (la etiqueta skip_mmproj está vacía en los metadatos).
- Conversación multi-turno: adecuado para diálogos prolongados gracias a su naturaleza conversacional.
- Compatibilidad con herramientas de despliegue local: formato GGUF compatible con llama.cpp, Ollama, LM Studio y otros motores de inferencia.

## Casos de uso

- **Generación de contenido creativo sin censura**: el modelo puede producir narrativa, poesía o guiones sobre temas que el modelo original rechazaría (violencia, sexualidad, drogas, etc.), siendo útil para autores que necesitan explorar estos temas sin bloqueos.
- **Investigación sobre alineación y seguridad de IA**: permite analizar el comportamiento de un modelo sin capas de rechazo, comparándolo con el modelo original para estudiar los efectos de la abliteration en la calidad de las respuestas y en la alucinación.
- **Asistente de código en entornos de desarrollo**: con cuantización Q4_K_M, el modelo puede ejecutarse en una RTX 3060 de 12 GB y usarse como autocompletado de código o generador de funciones en entornos locales sin conexión.
- **Chatbot de atención al cliente para dominios sensibles**: en sectores como salud mental, asesoría legal o educación sexual, el modelo puede generar respuestas sin evasivas, algo que los modelos alineados suelen rechazar.
- **Despliegue en edge computing**: con cuantización Q2_K (3,9 GB) el modelo puede ejecutarse en dispositivos con pocos recursos, como un Raspberry Pi 5 con 8 GB de RAM o un mini-PC con GPU integrada.
- **Evaluación de técnicas de cuantización**: los 12 niveles de GGUF permiten comparar la degradación de calidad entre cuantizaciones en un mismo modelo, útil para proyectos de investigación en eficiencia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM mínima (Q2_K)**: aproximadamente 4 GB (archivo de 3,9 GB), viable en GPUs de entrada como GTX 1650 o RTX 3050.
- **VRAM recomendada (Q4_K_M)**: aproximadamente 6 GB (archivo de 5,7 GB), adecuado para RTX 2060, RTX 3060 de 12 GB, RTX 4060.
- **VRAM para Q8_0**: aproximadamente 10 GB (archivo de 9,6 GB), adecuado para RTX 3080, RTX 4080, RTX 3090.
- **VRAM para f16**: aproximadamente 18 GB (archivo de 18,0 GB), requiere GPU de 24 GB (RTX 4090, A100, etc.).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, llama.cpp-python, vLLM (con adaptadores GGUF), TGI (con adaptadores).
- **Latencia**: no disponible; depende del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B (original) | ~9B | no disponible | no disponible | safetensors | Modelo original de Alibaba con alineación de seguridad |
| Qwen3.5-9B-OBLITERATED (shoukewei) | ~9B | no disponible | no disponible | safetensors | Versión abliterada del modelo original |
| Qwen3.5-9B-OBLITERATED-GGUF (este modelo) | ~9B | no disponible | no disponible | GGUF | Cuantización estática de la versión abliterada |
| Qwen3.5-9B-OBLITERATED-i1-GGUF | ~9B | no disponible | no disponible | GGUF | Variante con imatrix del mismo autor |
| Qwen3.5-9B-abliterated-v2-MAX-i1-GGUF | ~9B | no disponible | no disponible | GGUF | Variante abliterada con imatrix, también de mradermacher |

## Limitaciones y advertencias

- **Sesgos del modelo base**: la abliteration no elimina los sesgos presentes en el entrenamiento original; el modelo puede generar contenido discriminatorio o estereotipado.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede producir información falsa o inventada, y al no tener capas de rechazo, es más probable que presente esas alucinaciones con seguridad.
- **Contenido inapropiado**: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, violento o ilegal, lo que requiere supervisión humana en entornos de producción.
- **Idiomas**: solo está etiquetado como "en" (inglés); el rendimiento en otros idiomas no está confirmado y podría ser inferior.
- **Licencia desconocida**: la licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- **Contexto limitado**: la estimación de 4K tokens de contexto (si se confirma) es baja para procesar documentos largos o conversaciones extensas.
- **Sin benchmarks publicados**: no hay datos de rendimiento comparativos para evaluar la pérdida de calidad en cada cuantización.
- **Repositorio con baja actividad**: 0 descargas y 0 likes sugieren que el modelo no ha sido validado por la comunidad.

## Enlaces

- [HuggingFace - mradermacher/Qwen3.5-9B-OBLITERATED-GGUF](https://huggingface.co/mradermacher/Qwen3.5-9B-OBLITERATED-GGUF)
- [HuggingFace - shoukewei/Qwen3.5-9B-OBLITERATED (modelo base)](https://huggingface.co/shoukewei/Qwen3.5-9B-OBLITERATED)
- [HuggingFace - Qwen/Qwen3.5-9B (modelo original)](https://huggingface.co/Qwen/Qwen3.5-9B)
- [HuggingFace - mradermacher/Qwen3.5-9B-OBLITERATED-i1-GGUF (quants con imatrix)](https://huggingface.co/mradermacher/Qwen3.5-9B-OBLITERATED-i1-GGUF)
- [HuggingFace - mradermacher/Qwen3.5-9B-abliterated-v2-MAX-i1-GGUF](https://huggingface.co/mradermacher/Qwen3.5-9B-abliterated-v2-MAX-i1-GGUF)
- [Ollama - huihui_ai/qwen3.5-abliterated](https://ollama.com/huihui_ai/qwen3.5-abliterated)
- [Ollama - qwen3.5:9b](https://ollama.com/library/qwen3.5:9b)
- [free2aitools.com - Qwen3.5 9b Obliterated Fp16 I1 Gguf](https://free2aitools.com/model/mradermacher/qwen3.5-9b-obliterated-fp16-i1-gguf)
