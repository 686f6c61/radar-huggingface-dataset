# Mimataro/Tiny_ai

## Resumen

Tiny_ai es una publicación de la comunidad (usuario Mimataro) que consiste en una cuantización en formato GGUF del modelo base Qwen/Qwen3-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. Se trata, por tanto, de un transformer decoder-only denso de 596.049.920 parámetros (0,596 mil millones), pensado para generación de texto en entornos con recursos muy limitados: un único fichero GGUF de unos 0,6 GB en total. La relevancia de este tipo de publicaciones es práctica: permiten ejecutar un modelo de la familia Qwen3 en CPU, en GPUs de gama de entrada o incluso en dispositivos edge sin necesidad de infraestructura dedicada.

El problema que resuelve es el de disponer de un modelo conversacional y multilingüe de muy bajo coste computacional, reutilizable en tareas de clasificación, extracción de información o prototipado rápido. Al derivar de Qwen3-0.6B, hereda la arquitectura y el entrenamiento del modelo base: 28 capas, 32.768 tokens de contexto nativo (ampliable a 131.072 con YaRN) y licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

Ahora bien, la model card de esta publicación está prácticamente vacía: solo contiene el frontmatter con la licencia y el modelo base, sin información sobre el proceso de cuantización, los tipos de cuantización disponibles, el dataset utilizado ni evaluaciones. La ficha que sigue distingue en todo momento entre los datos verificables del repositorio y las características heredadas del modelo base, que se indican como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), heredada del modelo base Qwen/Qwen3-0.6B |
| Parámetros totales | 596.049.920 (0,596 B), dato real de safetensors del repositorio |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No especificada en la model card. El modelo base Qwen3-0.6B soporta 32.768 tokens nativos y 131.072 con escalado YaRN |
| Tipos de cuantización | No disponible. El repositorio está etiquetado como `gguf` y ocupa 0,6 GB en total, pero no se detalla qué niveles de cuantización contiene |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen3 declara cobertura de 119 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

Configuración del modelo base (28 capas, `hidden_size` 1024, 16 cabezas de atención y 8 cabezas KV con GQA, `head_dim` 128, FFN intermedio de 3072, vocabulario de 151.936 tokens con embeddings atados), coherente con los 596.049.920 parámetros reportados por el repositorio.

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3 en su variante densa de 0,6 B: un transformer decoder-only con normalización RMSNorm, activación SwiGLU en el bloque FFN, atención con Grouped Query Attention (GQA) y RoPE como codificación posicional. No hay componentes de mezcla de expertos (MoE), state space models ni mecanismos híbridos. El repositorio no documenta ninguna innovación técnica propia: el aporte del autor es la conversión a GGUF y, presumiblemente, la cuantización de los pesos.

En cuanto al entrenamiento, la model card no aporta ningún detalle. El modelo base Qwen3-0.6B forma parte de la familia Qwen3, cuyo informe técnico describe un preentrenamiento sobre del orden de 36 billones de tokens en 119 idiomas y dialectos, seguido de un post-entrenamiento que combina ajuste supervisado, destilación desde modelos mayores de la propia familia y aprendizaje por refuerzo. La variante de 0,6 B pertenece al grupo de modelos ligeros para los que Qwen empleó destilación strong-to-weak. No hay información disponible sobre si esta publicación incorpora algún ajuste adicional, pese a que el repositorio incluye la etiqueta `conversational`.

## Capacidades

- Generación de texto y continuación de secuencias en modo decoder-only.
- Comprensión lectora básica, resumen y respuesta a preguntas simples sobre textos cortos.
- Generación de código sencillo y autocompletado a pequeña escala; el rendimiento en tareas de programación complejas es limitado por el tamaño del modelo.
- Aritmética simple y razonamiento de un solo paso; las cadenas de razonamiento largas degradan rápidamente.
- Capacidades multilingües heredadas del modelo base (119 idiomas declarados), con rendimiento desigual y claramente inferior en lenguas distintas del inglés y del chino.
- Etiquetado como `conversational`, lo que sugiere un uso orientado a diálogo, aunque no se especifica si se aplicó una plantilla de chat, un ajuste por instrucciones o un DPO posterior.
- Soporte de tool calling / function calling: no confirmado en la información disponible. Las variantes instruct de Qwen3 incluyen plantilla de chat con soporte de llamadas a herramientas; no puede asumirse que esta cuantización conserve ese comportamiento.
- Modo de razonamiento explícito (*thinking mode*): no confirmado. Qwen3 lo introduce en sus variantes instruct, no necesariamente en un modelo base cuantizado.
- Capacidades de visión, audio o multimodalidad: no disponibles.

## Casos de uso

- Clasificación y enrutado de texto en local: el modelo puede etiquetar tickets, correos o comentarios en categorías predefinidas ejecutándose íntegramente en CPU, lo que evita enviar datos sensibles a APIs externas y elimina el coste por token.
- Extracción de datos estructurados: a partir de textos breves (facturas simples, fichas de contacto, descripciones de producto) puede generar salidas en JSON para alimentar un pipeline posterior, siempre con validación del esquema en el lado de la aplicación.
- Prototipado rápido de aplicaciones de generación: con un fichero de 0,6 GB es posible montar un entorno de desarrollo completo en un portátil, probar plantillas de prompt, temperaturas y longitudes de contexto antes de migrar a un modelo mayor.
- Asistente conversacional en dispositivos edge: cabe en placas tipo Raspberry Pi 5 con 8 GB de RAM o en móviles de gama alta mediante llama.cpp, lo que permite asistentes offline para consultas de dominio acotado (por ejemplo, manuales de producto o bases de conocimiento internas).
- Anotación y generación de datos sintéticos: puede utilizarse para preetiquetar grandes volúmenes de texto a bajo coste, que después se revisan o se usan como semilla para entrenar o afinar modelos mayores.
- Normalización y traducción asistida: limpieza de texto, reescritura de frases, cambio de registro y traducción aproximada entre idiomas, útil como paso previo en pipelines de procesado documental donde no se requiere calidad de publicación.
- Educación y experimentación: es un candidato adecuado para demostrar el flujo completo de cuantización, servido local con Ollama o llama.cpp y evaluación de latencia, sin necesidad de GPUs dedicadas.
- Pruebas de integración con endpoints compatibles: la etiqueta `endpoints_compatible` permite desplegarlo como endpoint de prueba para validar contratos de API y esquemas de respuesta antes de pasar a modelos de producción más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna evaluación, y el repositorio no aporta métricas propias de la cuantización (por ejemplo, comparación de perplejidad frente a los pesos originales).

Como referencia externa, el modelo base Qwen/Qwen3-0.6B sí dispone de resultados publicados (MMLU, MMLU-Pro, BBH, GSM8K, HumanEval y otros) en el informe técnico de Qwen3; esos números corresponden al modelo base sin cuantizar y no deben atribuirse a esta publicación.

## Requisitos de hardware

- Pesos en memoria (estimación calculada a partir de 596 M de parámetros): ~1,2 GB en FP16, ~0,65 GB en cuantización de 8 bits y ~0,40 GB en cuantización de 4 bits. El repositorio completo ocupa 0,6 GB.
- Caché KV: con 28 capas y 8 cabezas KV de dimensión 128, cada token ocupa unos 0,109 MiB en FP16, es decir, aproximadamente 0,45 GB a 4.096 tokens de contexto, 1,75 GB a 16.384 y 3,5 GB a 32.768.
- VRAM total estimada: por debajo de 1 GB para contexto corto (2.048-4.096 tokens) con cuantización de 4 u 8 bits; en torno a 2-4 GB si se agota la ventana de 32.768 tokens con caché KV en FP16.
- Cabe en cualquier GPU de consumo: GTX 1650 (4 GB), RTX 3050, RTX 4060, RTX 4090 e incluso iGPU con memoria unificada. También es viable en CPU pura y en dispositivos con 4 GB de RAM o más.
- GPU de centro de datos (A100, H100) no aportan ventaja práctica para este tamaño; el modelo está limitado por memoria y no por cómputo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, koboldcpp y llama-cpp-python son las vías naturales al ser GGUF. vLLM tiene soporte de GGUF experimental y TGI no lo soporta de forma nativa. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para esta publicación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tiny_ai (esta publicación) | 0,596 B | No especificado (32.768 en el base) | Apache 2.0 | GGUF | Sin model card, 0 descargas, sin evaluaciones |
| Qwen/Qwen3-0.6B (base) | 0,596 B | 32.768 (131.072 con YaRN) | Apache 2.0 | safetensors | Modelo de referencia del que deriva esta cuantización |
| Qwen/Qwen2.5-0.5B | 0,49 B | 32.768 (131.072 con YaRN) | Apache 2.0 | safetensors | Generación anterior, muy usado como base para fine-tunes ligeros |
| meta-llama/Llama-3.2-1B | 1,24 B | 131.072 | Llama 3.2 Community License | safetensors | Mayor tamaño y contexto, licencia con restricciones para grandes despliegues |
| HuggingFaceTB/SmolLM2-360M | 0,36 B | 8.192 | Apache 2.0 | safetensors | Más pequeño, contexto reducido, entrenado específicamente para edge |
| google/gemma-3-270m | 0,27 B | 32.768 | Gemma Terms of Use | safetensors | El más pequeño de la comparativa, licencia con condiciones de uso |

Las cifras de los modelos comparados corresponden a sus especificaciones públicas y pueden variar según la revisión concreta del repositorio. No se dispone de comparaciones de rendimiento medidas para Tiny_ai.

## Limitaciones y advertencias

- Model card vacía: solo contiene el frontmatter (licencia y modelo base). No hay información sobre el dataset, el proceso de cuantización, la semilla de conversión ni evaluaciones de calidad. Esto impide auditar la fidelidad de los pesos publicados.
- Repositorio sin tracción: 0 descargas y 0 «likes» en el momento de la consulta, creado y actualizado el 10 de septiembre de 2026 (según las fechas declaradas por el propio repositorio) con cuatro minutos de diferencia, lo que apunta a una subida automatizada sin revisión posterior.
- Procedencia no verificada: al ser una conversión de terceros, no hay garantía de que los pesos GGUF correspondan exactamente al modelo base declarado ni de que no se hayan aplicado modificaciones no documentadas.
- Riesgo de alucinación elevado: con 0,6 B de parámetros, la tasa de invención de hechos es alta en preguntas de conocimiento factual, matemáticas de varios pasos y razonamiento encadenado. No debe usarse como fuente de verdad sin verificación.
- Confusión entre modelo base y modelo conversacional: la etiqueta `base_model` apunta a Qwen/Qwen3-0.6B, que es un modelo base sin ajuste por instrucciones, mientras que el repositorio incluye la etiqueta `conversational`. Si se cuantizó desde el modelo base, el comportamiento en diálogo multirrueda será pobre pese a esa etiqueta.
- Sesgos: hereda los sesgos de los datos web multilingües empleados en el preentrenamiento de Qwen3. No existe ninguna evaluación de sesgos específica para esta publicación.
- Limitaciones idiomáticas: aunque el modelo base declara 119 idiomas, en un modelo de este tamaño el rendimiento fuera del inglés y del chino es notablemente inferior, con riesgo de mezcla de idiomas y respuestas incoherentes.
- Contexto efectivo: la ventana útil depende de cómo se configure `n_ctx` en el motor de inferencia. Valores altos de contexto incrementan el consumo de memoria por la caché KV y degradan la calidad de la atención en las posiciones intermedias.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, incluida la del propio modelo base Qwen3. Aun así, conviene conservar la atribución y verificar los términos del repositorio original, ya que el autor de la cuantización no ofrece ninguna garantía.
- Ausencia de soporte: no hay documentación, ejemplos de uso ni mantenimiento declarado por parte del autor, lo que complica su adopción en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mimataro/Tiny_ai
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio oficial de la familia Qwen3: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Blog de presentación de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio de llama.cpp, motor habitual para pesos GGUF: https://github.com/ggml-org/llama.cpp
- Ollama, alternativa de despliegue local: https://ollama.com/

Nota sobre la búsqueda web: los resultados devueltos corresponden únicamente a páginas genéricas de YouTube (https://www.youtube.com/, https://it.wikipedia.org/wiki/YouTube, https://play.google.com/store/apps/details?id=com.google.android.youtube) y no guardan relación con el modelo analizado, por lo que no se han incluido como fuentes.
