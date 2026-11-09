# IgnisAILabs/Qwen3.8-27B-Neuma-T4-GGUF

## Resumen

Qwen3.8-27B-Neuma-T4 (GGUF) es una compilación de cuantizaciones del modelo Qwen3.8-27B de Qwen, ajustada por Ignis AI Labs para su plataforma Deus Neuma. El repositorio no contiene pesos originales en safetensors, sino ficheros GGUF optimizados para llama.cpp y Ollama, con cuantizaciones escalonadas (de Q6_K a IQ3_XXS) pensadas para que la plataforma seleccione automáticamente el build adecuado según la VRAM disponible en la tarjeta gráfica del usuario.

El modelo base es un transformer multimodal de 27.320.697.856 parámetros (unos 27,3 mil millones) con pipeline image-text-to-text, es decir, acepta entradas de imagen y texto. La compilación mantiene la cabeza de predicción multi-token (multi-token prediction head) del modelo original, lo que permite decodificación especulativa nativa dentro de llama.cpp. La licencia es Apache-2.0, heredada del modelo base.

El interés de esta ficha radica en que documenta un caso de empaquetado para despliegue en hardware de consumo: cinco ficheros que cubren desde 12 GB hasta 48 GB de VRAM, más un proyector multimodal BF16 de 0,9 GB. No hay métricas de rendimiento, idiomas declarados ni detalles del proceso de ajuste publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.8-27B; sin detalles adicionales disponibles |
| Parámetros totales | 27.320.697.856 (27,3 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q6_K, IQ4_XS, IQ3_M, IQ3_XXS (más proyector multimodal BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es Qwen3.8-27B, un transformer multimodal de 27,3 mil millones de parámetros con capacidad de procesar imágenes y texto (pipeline image-text-to-text). La compilación GGUF conserva la cabeza de predicción multi-token del modelo original, una innovación que permite generar varios tokens candidatos por paso y validarlos en paralelo, lo que acelera la decodificación en llama.cpp sin necesidad de un modelo borrador separado.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni los detalles del ajuste realizado por Ignis AI Labs para Deus Neuma. El repositorio incluye un proyector multimodal (`mmproj-Qwen3.8-27B-Neuma-T4-BF16.gguf`, 0,9 GB) que debe cargarse junto con cualquiera de las cuantizaciones para habilitar la entrada de imagen.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Procesamiento de imagen y texto combinados (image-text-to-text): el proyector multimodal BF16 habilita la entrada visual.
- Decodificación con predicción multi-token, que acelera la inferencia en llama.cpp.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integración con APIs de inferencia estándar.
- Ejecución en llama.cpp y Ollama, incluida la referencia `ollama run hf.co/IgnisAILabs/Qwen3.8-27B-Neuma-T4-GGUF:IQ4_XS`.
- No se documentan en la información disponible capacidades específicas de tool calling, agentes, matemáticas, código ni modo de razonamiento extendido.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: el build IQ3_XXS (11,6 GB) permite ejecutar un modelo de 27,3 mil millones de parámetros en tarjetas de 12 GB, lo que facilita prototipado sin infraestructura en la nube.
- Asistente conversacional con entrada de imágenes: combinando cualquiera de las cuantizaciones con el proyector `mmproj` BF16, se puede construir un chat que reciba capturas de pantalla, fotografías o diagramas y responda en texto.
- Integración en la plataforma Deus Neuma: el repositorio está diseñado para que la plataforma descargue automáticamente el build que encaje con la VRAM del usuario, de modo que el caso de uso principal es el despliegue gestionado dentro de ese producto.
- Inferencia en servidores con 48 GB de VRAM: el build Q6_K (22,5 GB) ofrece la mayor fidelidad de cuantización para entornos con A6000, RTX 6000 Ada o dos GPU de 24 GB.
- Pruebas de concepto de modelos multimodales en Ollama: el comando de una línea permite evaluar capacidades visión-lenguaje sin escribir código de carga de pesos.
- Evaluación comparativa de cuantizaciones: al ofrecer cuatro niveles de compresión del mismo modelo, sirve para medir la degradación de calidad frente al ahorro de VRAM en un pipeline concreto.
- Procesamiento por lotes en local con llama.cpp: la predicción multi-token reduce la latencia por token, lo que resulta útil para tareas de generación larga en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según el fichero: Q6_K 22,5 GB (GPU de 48 GB o más), IQ4_XS 15,5 GB (GPU de 32 GB), IQ3_M 13,0 GB (GPU de 16 a 24 GB), IQ3_XXS 11,6 GB (GPU de 12 GB). El proyector multimodal añade 0,9 GB.
- GPU recomendadas: para Q6_K, A6000, RTX 6000 Ada o configuraciones multi-GPU de 24 GB; para IQ4_XS, A100 40 GB o RTX 5090; para IQ3_M, RTX 4090 o RTX 4080; para IQ3_XXS, RTX 3060 12 GB o RTX 4070.
- Cabe en GPU de consumo: sí, al menos en las cuantizaciones IQ3_M e IQ3_XXS; IQ4_XS requiere 32 GB, fuera del rango de consumo habitual.
- Opciones de despliegue: llama.cpp y Ollama según la model card; también compatible con endpoints según las etiquetas del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Neuma-T4 (este) | 27,3 mil millones | no disponible | Apache-2.0 | GGUF | Cuatro cuantizaciones más proyector multimodal; ajuste para Deus Neuma |
| Qwen3.8-27B (base) | 27,3 mil millones | no disponible | Apache-2.0 | safetensors (presumible) | Modelo original de Qwen; sin ajuste de Ignis AI Labs |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos en la información proporcionada |

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado con datos web, es probable que herede sesgos del corpus original; no verificable con la información disponible.
- Riesgo de alucinación inherente a los modelos generativos de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- La cuantización IQ3_XXS (11,6 GB) y, en menor medida, IQ3_M implican una compresión agresiva que puede degradar la calidad respecto a Q6_K; conviene validar la tarea concreta antes de producción.
- No se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- La longitud de contexto no está documentada; planificar aplicaciones con ventanas largas requiere verificarla empíricamente.
- Licencia Apache-2.0 permite uso comercial, pero el ajuste específico de Ignis AI Labs no incluye documentación sobre términos adicionales de la plataforma Deus Neuma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-09; se trata de una publicación muy reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IgnisAILabs/Qwen3.8-27B-Neuma-T4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Plataforma Deus Neuma: https://deusneuma.ai
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
