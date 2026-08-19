# mradermacher/Mira-v1.23.1-27B-dpo-i1-GGUF

## Resumen

Mira-v1.23.1-27B-dpo-i1-GGUF es una colección de cuantizaciones GGUF del modelo base Lambent/Mira-v1.23.1-27B-dpo, preparadas por mradermacher. El modelo original es un merge de 27 000 millones de parámetros (27B) con licencia Gemma, orientado a tareas conversacionales y, según la nota de la model card, incluye capacidades de visión (aunque los archivos del proyector de visión, si existen, se encuentran en el repositorio estático, no en este). La versión GGUF utiliza una matriz de importancia (imatrix) para optimizar la calidad de las cuantizaciones, ofreciendo un amplio abanico de tamaños que van desde 6,4 GB hasta 22,3 GB, lo que permite su ejecución en hardware de consumo y profesional.

La relevancia de esta ficha radica en que proporciona una vía práctica para desplegar un modelo de 27B en entornos locales mediante llama.cpp, Ollama u otros motores compatibles con GGUF, sin necesidad de hardware de gama alta si se eligen cuantizaciones agresivas. No obstante, la información técnica detallada sobre arquitectura, entrenamiento y rendimiento del modelo base no está disponible en la documentación proporcionada, por lo que esta ficha se centra en los aspectos verificables de la cuantización y su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.009.007.616 (27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base Lambent/Mira-v1.23.1-27B-dpo en los datos proporcionados. Los tags indican que fue creado mediante mergekit (una herramienta para fusionar modelos), pero se desconocen los componentes originales, el tipo de arquitectura (transformer, MoE, etc.) y el proceso de entrenamiento (número de tokens, dataset, técnicas de alineación como RLHF o DPO). La licencia Gemma sugiere que podría derivar de la familia Gemma de Google, pero esto no está confirmado.

La cuantización en sí utiliza la técnica imatrix (importance matrix) para calibrar la pérdida de precisión durante la compresión, lo que suele mejorar la calidad respecto a cuantizaciones estáticas. El repositorio incluye un archivo imatrix separado (0,1 GB) que permite generar cuantizaciones personalizadas.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo base está orientado a mantener diálogos, aunque no se especifican detalles sobre razonamiento, código o matemáticas.
- Posible capacidad de visión: la model card afirma "This is a vision model", lo que sugiere que el modelo original puede procesar imágenes, pero los archivos del proyector de visión (mmproj) no están incluidos en este repositorio; se encuentran en el repositorio estático (https://huggingface.co/mradermacher/Mira-v1.23.1-27B-dpo-GGUF).
- Soporte de tool calling, agentes o funciones: no disponible.
- Multilingüismo: solo se declara inglés (`language: en`).

## Casos de uso

- Despliegue local de un asistente conversacional: gracias a las cuantizaciones GGUF, es posible ejecutar el modelo en una estación de trabajo con una GPU de 12-24 GB de VRAM (por ejemplo, RTX 3090/4090) usando llama.cpp u Ollama, ofreciendo respuestas fluidas en inglés.
- Prototipado rápido de chatbots en entornos sin acceso a APIs comerciales: al ser un modelo de 27B con licencia Gemma, puede integrarse en aplicaciones de código abierto sin depender de servicios externos.
- Investigación académica sobre cuantización: el archivo imatrix y las múltiples variantes permiten estudiar el impacto de diferentes niveles de compresión en la calidad de un modelo de 27B.
- Aplicaciones de visión (si se combina con el mmproj del repositorio estático): podría usarse para tareas como captioning de imágenes o respuesta a preguntas visuales, aunque esta capacidad no está verificada en esta ficha.
- Evaluación comparativa de motores de inferencia: al estar disponible en formato GGUF, se puede probar el rendimiento en llama.cpp, Ollama, LM Studio, etc., midiendo latencia y throughput en diferentes hardware.
- Generación de contenido en inglés para entornos controlados: redacción de correos, resúmenes o borradores, siempre que se validen los resultados debido a la falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo o sus cuantizaciones.

## Requisitos de hardware

- La VRAM necesaria depende de la cuantización elegida. A modo orientativo (sin considerar overhead del contexto):
  - i1-IQ1_S (6,4 GB): cabe en GPUs con 8 GB de VRAM (p. ej., RTX 3060, RTX 4060).
  - i1-Q4_K_M (16,6 GB): requiere al menos 20 GB de VRAM (RTX 3090, RTX 4090, A6000).
  - i1-Q6_K (22,3 GB): necesita 24 GB o más (RTX 3090/4090, A100, H100).
- Para cuantizaciones superiores a 20 GB, se recomienda una GPU profesional o de gama alta con 24 GB o más.
- El modelo puede ejecutarse en CPU con llama.cpp, aunque la velocidad será significativamente menor; se recomienda al menos 32 GB de RAM para las variantes grandes.
- Motores de despliegue compatibles: llama.cpp, Ollama, LM Studio, text-generation-webui (llama.cpp backend), entre otros.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No es posible establecer una comparativa fiable sin datos de rendimiento o arquitectura.

## Limitaciones y advertencias

- La licencia Gemma impone restricciones de uso comercial. Es obligatorio revisar los términos completos de la licencia Gemma antes de utilizar el modelo en producción, especialmente en aplicaciones comerciales o de alto riesgo.
- Al ser una cuantización, existe una pérdida de calidad inherente que aumenta en las variantes de menor tamaño (IQ1, IQ2). Se recomienda usar al menos Q4_K_M para tareas críticas.
- No se ha documentado el comportamiento del modelo en cuanto a sesgos, alucinaciones o toxicidad. Dado que el modelo base es un merge sin ficha técnica pública, no hay garantías sobre su robustez.
- La capacidad de visión no está disponible en este repositorio; si se necesita, debe descargarse el mmproj del repositorio estático y verificar su compatibilidad con la cuantización elegida.
- El modelo solo soporta inglés, por lo que no es adecuado para tareas multilingües.
- No hay información sobre la longitud de contexto soportada; se desconoce si el modelo base utiliza ventanas de 4K, 8K u otras.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/Mira-v1.23.1-27B-dpo-i1-GGUF
- Repositorio estático con cuantizaciones sin imatrix y mmproj: https://huggingface.co/mradermacher/Mira-v1.23.1-27B-dpo-GGUF
- Modelo base (Lambent/Mira-v1.23.1-27B-dpo): https://huggingface.co/Lambent/Mira-v1.23.1-27B-dpo
- Página de descarga y vista general: https://hf.tst.eu/model#Mira-v1.23.1-27B-dpo-i1-GGUF
- Guía de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
