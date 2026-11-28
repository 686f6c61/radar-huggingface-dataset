# mradermacher/WeMM-Ecom-9B-i1-GGUF

## Resumen

WeMM-Ecom-9B-i1-GGUF es la versión cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-9B desarrollado por Tencent, publicada por el usuario mradermacher. Se trata de un modelo de aproximadamente 8.950 millones de parámetros orientado a conversación multimodal en el ámbito del comercio electrónico, construido sobre una base etiquetada como Qwen3.5. Su propósito es gestionar interacciones conversacionales que combinan texto e imagen, un escenario habitual en atención al cliente, recomendación de productos o descripción de catálogo.

La relevancia de esta publicación radica en que mradermacher ofrece un conjunto muy amplio de cuantizaciones con calibración imatrix (desde IQ1_S hasta Q6_K), lo que permite ejecutar un modelo de casi 9.000 millones de parámetros en hardware de consumo. El repositorio ocupa 111,7 GB en total porque incluye todas las variantes, desde ficheros de 3 GB hasta 7,5 GB por cuantización, además del fichero imatrix de 0,1 GB.

El modelo base está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial. Esta versión GGUF mantiene dicha licencia y está pensada para su despliegue con llama.cpp y herramientas compatibles, no con transformers en su forma nativa, pese a que el repositorio declare esa librería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5, según etiquetas del autor); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix i1) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de las etiquetas que lo identifican como multimodal y con base Qwen3.5. Se trata, por tanto, de un transformer con capacidades de visión y lenguaje, orientado a tareas de comercio electrónico y conversación. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

En cuanto a esta publicación concreta, la innovación técnica relevante es el proceso de cuantización: mradermacher emplea cuantizaciones con importancia (imatrix, marcadas como i1) generadas a partir de un fichero imatrix propio, lo que mejora la calidad respecto a cuantizaciones estáticas del mismo tamaño. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar, y que los ficheros mmproj para la parte de visión, si existen, se encuentran en el repositorio estático hermano (WeMM-Ecom-9B-GGUF). No se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Procesamiento de imágenes (modelo multimodal); los ficheros mmproj, si existen, están en el repositorio estático.
- Conversación multi-turno orientada a comercio electrónico.
- Comprensión de productos e interacción con catálogo (según la etiqueta "e-commerce" del autor).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües limitadas a zh y en según la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Atención al cliente en comercio electrónico: el modelo puede gestionar conversaciones multi-turno en chino e inglés sobre productos, pedidos o devoluciones, aprovechando su naturaleza conversacional y su orientación explícita al dominio del e-commerce.
- Descripción y análisis de imágenes de producto: al ser multimodal, permite generar descripciones o responder preguntas sobre imágenes de catálogo, útil para enriquecer fichas de producto de forma automatizada.
- Asistente de recomendación visual: combinando imagen y texto, puede sugerir productos a partir de una foto o de una consulta conversacional, integrándose en un chat de tienda.
- Despliegue en local para prototipado: gracias a las cuantizaciones de 5-6 GB (Q4_K_M, Q5_K_M), es viable probar el modelo en una estación de trabajo con GPU de consumo antes de escalar a producción.
- Investigación en modelos multimodales de dominio: sirve como base para experimentos de ajuste fino o evaluación en tareas de visión-lenguaje aplicadas a comercio, dado que la licencia Apache 2.0 lo permite.
- Generación de respuestas en entornos con recursos limitados: las variantes IQ2/IQ3 (3-5 GB) permiten ejecutar el modelo en equipos modestos para tareas de chat de baja latencia, aceptando la pérdida de calidad asociada.
- Integración en pipelines de llama.cpp: al estar en GGUF, encaja en herramientas como Ollama o servidores llama.cpp para servir una API conversacional interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB (IQ1_S) hasta 7,5 GB (Q6_K) solo para los pesos; hay que añadir el espacio del contexto KV y, en su caso, el proyector multimodal (mmproj).
- GPU recomendadas: para las cuantizaciones altas (Q5_K_M, Q6_K) se recomienda una GPU con 8-12 GB de VRAM, como RTX 3060 12 GB, RTX 4070 o superiores; para las bajas (IQ2, IQ3) basta con 6-8 GB.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones; las variantes Q4_K_M (~5,8 GB) y Q5_K_M (~6,6 GB) son las más equilibradas para tarjetas de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints. Para la parte de visión es necesario el fichero mmproj del repositorio estático.
- Latencia y throughput estimados: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-9B-i1-GGUF | ~8,95 B | No disponible | Apache 2.0 | GGUF (i1) | Multimodal, dominio e-commerce, zh/en |
| WeMM-Ecom-9B-GGUF (estatico) | ~8,95 B | No disponible | Apache 2.0 | GGUF estatico | Misma base, cuantizaciones sin imatrix; incluye mmproj |
| tencent/WeMM-Ecom-9B (base) | ~8,95 B | No disponible | Apache 2.0 | Safetensors | Pesos originales sin cuantizar |

No se dispone de datos de benchmarks ni de modelos comparables de terceros en la información proporcionada para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado para e-commerce en chino e inglés, puede reflejar sesgos de catálogo y de dominio.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para este modelo.
- Limitaciones de idioma: solo se declaran chino e inglés; el rendimiento en castellano no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que dificulta planificar conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada por el autor.
- Caveats para producción: las cuantizaciones por debajo de Q4 pierden calidad de forma notable (el propio autor califica IQ1 como "for the desperate" y Q2_K_S como "very low quality"); para la funcionalidad de visión hay que descargar los mmproj del repositorio estático; el repositorio completo ocupa 111,7 GB, por lo que conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/WeMM-Ecom-9B-i1-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-9B
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-9B/blob/main/LICENSE
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/WeMM-Ecom-9B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#WeMM-Ecom-9B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
