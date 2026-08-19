# mradermacher/Goetia-26B-A4B-v1.4-LazyLora-heresy-Heretic-i1-GGUF

## Resumen

Goetia-26B-A4B-v1.4-LazyLora-heresy-Heretic es un modelo de lenguaje de tipo Mixture of Experts (MoE) derivado de la familia Gemma 4, con 26 000 millones de parámetros totales y aproximadamente 4 000 millones de parámetros activos por token. El modelo original fue creado por alexokita mediante la extracción de una LoRA llamada "Goetia 1.4" y su aplicación sobre un modelo base, seguido de un proceso de "heretic" (ablación direccional) que elimina ciertas direcciones de activación asociadas a comportamientos no deseados. Esta versión concreta es una cuantización GGUF con imatrix realizada por mradermacher, orientada a facilitar la ejecución en hardware modesto.

La relevancia de este modelo radica en su naturaleza de rolplay y conversación, combinada con la arquitectura eficiente de Gemma 4 (MoE con 4B activos) y el proceso de abliteration que busca reducir rechazos y restricciones en las respuestas. La cuantización i1-Q2_K incluida en este repositorio permite ejecutar el modelo en GPUs de consumo con VRAM limitada, aunque a costa de una pérdida de calidad notable. Es un modelo pensado para experimentación y uso local, no para producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma 4 |
| Parametros totales | 25 233 142 046 (25,2 B) |
| Parametros activos | Aproximadamente 4 B (según el nombre "A4B") |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K (único quant en este repo) |
| Idiomas soportados | Inglés (tag "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 26 000 millones de parámetros totales y 4 000 millones activos por token, siguiendo el diseño de Gemma 4. No se dispone de detalles sobre el número de expertos, la dimensión del hidden state o la configuración exacta de atención, ya que esa información no aparece en la documentación proporcionada. El proceso de creación incluye la aplicación de una LoRA denominada "Goetia 1.4" sobre un modelo base (probablemente Gemma 4 instruct), seguido de un proceso de "heretic" o ablación direccional, una técnica que modifica las activaciones del modelo para eliminar ciertos comportamientos indeseados (similar a la abliteration). El tag "LazyLora" sugiere el uso de una variante de LoRA que reduce el coste computacional durante el entrenamiento, aunque no se especifican los detalles.

La cuantización GGUF fue realizada por mradermacher utilizando el método imatrix (importance matrix), que optimiza la asignación de bits según la importancia de cada peso. El archivo imatrix de 0,2 GB está disponible para que los usuarios puedan generar sus propias cuantizaciones personalizadas. No se proporcionan datos sobre el dataset de entrenamiento ni sobre el número de tokens utilizados.

## Capacidades

- Generación de texto conversacional y roleplay: el modelo está diseñado para mantener diálogos multi-turno con un estilo narrativo, gracias al ajuste fino con la LoRA Goetia.
- Ablación direccional: el proceso "heretic" reduce los rechazos y las restricciones típicas de los modelos instructivos, permitiendo respuestas más abiertas en escenarios de rol.
- Soporte de visión: según la model card, el modelo base es un modelo de visión, aunque los archivos mmproj necesarios para la entrada de imágenes se encuentran en el repositorio de cuantizaciones estáticas, no en este.
- Eficiencia MoE: con solo 4B parámetros activos, el coste de inferencia es comparable al de un modelo de 4B, aunque con la capacidad de un modelo de 26B.
- Multilingüismo: limitado al inglés según la etiqueta de idioma; no hay evidencia de soporte para otros idiomas.
- Sin soporte explícito de tool calling o function calling documentado en la información disponible.

## Casos de uso

- Roleplay y ficción interactiva: el modelo puede mantener personajes y tramas complejas en conversaciones largas, aprovechando su ajuste fino para narrativa y su ventana de contexto (aunque la longitud exacta no se especifica). Es adecuado para juegos de texto, chatbots de personajes o escritura colaborativa.
- Experimentación con abliteration: investigadores y desarrolladores pueden estudiar cómo la ablación direccional afecta al comportamiento del modelo en tareas de generación creativa, comparando con versiones sin este proceso.
- Prototipado de asistentes conversacionales con restricciones reducidas: para aplicaciones donde se requiere un tono más libre y menos censurado, como generación de diálogos para videojuegos o guiones.
- Inferencia local en hardware modesto: gracias a la cuantización Q2_K (10,7 GB), el modelo puede ejecutarse en GPUs de consumo con 12 GB de VRAM, o incluso en CPU con suficiente RAM, usando llama.cpp o similares.
- Generación de historias y contenido creativo: el modelo puede producir relatos, descripciones y diálogos con un estilo literario, útil para escritores o creadores de contenido.
- Fine-tuning adicional: al ser de código abierto (Apache 2.0), los desarrolladores pueden utilizar el modelo como base para ajustes con LoRA o QLoRA en tareas específicas de conversación o narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o sus variantes. La calidad del modelo cuantizado a Q2_K será significativamente inferior a la del modelo original en precisión, pero no se dispone de mediciones concretas de perplejidad o degradación.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF i1-Q2_K ocupa 10,7 GB. Con overhead de inferencia, se recomiendan al menos 12 GB de VRAM para una ejecución cómoda en GPU. En CPU, se necesitarían unos 16 GB de RAM libre.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, o GPUs de datacenter como A10, A100 (aunque estas serían excesivas). También puede ejecutarse en Apple Silicon con suficiente memoria unificada.
- Compatibilidad con consumer GPU: sí, siempre que se use la cuantización Q2_K y se acepte una pérdida de calidad notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (a través de llama.cpp). No se menciona soporte para vLLM o TGI en la información disponible, aunque podría funcionar si se convierte a otro formato.
- Latencia y throughput: no disponibles. Dado el tamaño (4B activos), se espera una velocidad de generación de 20-40 tokens/s en una RTX 4090, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con modelos similares. El modelo comparte arquitectura con Gemma 4 26B-A4B, pero no se han publicado resultados de benchmarks. Alternativas en la misma categoría (MoE de ~26B con ~4B activos) podrían ser:

| Modelo | Parámetros totales | Activos | Contexto | Licencia |
|---|---|---|---|---|
| Goetia-26B-A4B (este) | 25,2 B | ~4 B | No disponible | Apache 2.0 |
| Gemma 4 26B-A4B (original) | 26 B | 4 B | No disponible | Gemma license |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 K | Apache 2.0 |

Sin embargo, no hay datos de rendimiento comparables, por lo que la comparación se limita a parámetros y licencia. Se recomienda consultar los benchmarks oficiales de Gemma 4 para una referencia de capacidades.

## Limitaciones y advertencias

- Cuantización extrema: el quant i1-Q2_K es de muy baja precisión (2 bits), lo que degrada significativamente la calidad de las respuestas. Para uso serio, se recomienda buscar cuantizaciones de mayor calidad (Q4_K_M o superior) en el repositorio de cuantizaciones estáticas.
- Idioma limitado: solo inglés. No se recomienda su uso en español u otros idiomas.
- Sesgos y alucinaciones: al ser un modelo ajustado para roleplay y con ablación direccional, puede generar contenido inapropiado, falso o dañino. No está alineado para seguridad y no debe usarse en aplicaciones donde se requieran respuestas fiables.
- Sin soporte de visión en este repo: aunque el modelo base es de visión, los archivos mmproj no están incluidos aquí; habría que descargarlos del repositorio estático.
- Sin información sobre contexto: se desconoce la longitud máxima de contexto soportada, lo que dificulta planificar su uso en conversaciones largas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base (Gemma 4) tiene su propia licencia que puede imponer restricciones adicionales. Es necesario verificar la licencia del modelo base original.
- Riesgo de contenido ofensivo: el proceso "heretic" elimina inhibiciones, lo que puede resultar en respuestas que violen políticas de contenido en entornos corporativos.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.4-LazyLora-heresy-Heretic-i1-GGUF
- Repositorio del modelo base: https://huggingface.co/alexokita/Goetia-26B-A4B-v1.4-LazyLora-heresy-Heretic
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.4-LazyLora-heresy-Heretic-GGUF
- Página del modelo en FriendliAI: https://friendli.ai/models/alexokita/Goetia-26B-A4B-v1.4-LazyLora-heresy-Heretic
- Referencia a la técnica de cuantización imatrix: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
