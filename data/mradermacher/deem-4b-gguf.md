# mradermacher/Deem-4B-GGUF

## Resumen

Deem-4B es un modelo de lenguaje de aproximadamente 4.200 millones de parámetros, desarrollado originalmente por mertkayacs y publicado bajo licencia Apache 2.0. La versión aquí descrita es una cuantización estática en formato GGUF realizada por mradermacher, pensada para ejecución local y en dispositivos con recursos limitados. El modelo está etiquetado como un *decision-model* orientado a clasificación de texto, calibración de confianza, predicción conformal y enrutamiento (*routing*) o triaje de consultas.

Su propuesta de valor se centra en la incertidumbre y la toma de decisiones estructuradas más que en la generación creativa de texto. Incorpora etiquetas que apuntan a razonamiento, salidas con tipado seguro (*typesafe*) y un modo de evaluación denominado "jev". Está construido sobre una base arquitectónica vinculada a Qwen 3.5, según las etiquetas de la model card, aunque no se detalla la arquitectura exacta en la información disponible.

La relevancia actual del modelo radica en su tamaño compacto (4B), su licencia permisiva y la disponibilidad de cuantizaciones ligeras (desde 2,0 GB en Q2_K), lo que permite desplegarlo en hardware de consumo y en escenarios de inferencia local donde la latencia y el coste importan. Declara soporte para inglés, turco y alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como Qwen 3.5 en la model card; detalles no especificados) |
| Parametros totales | 4.205.751.296 (aprox. 4,2 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, tr, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta "qwen3.5" y la clasificación como modelo de decisión. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El dataset asociado en la model card es `mertkayacs/jevalt-data`.

Las etiquetas del modelo sugieren un enfoque en calibración, predicción conformal y salidas con incertidumbre cuantificada, orientadas a tareas de clasificación y enrutamiento. También se incluye un suplemento multimodal (*mmproj*) en las cuantizaciones, lo que indica soporte de entrada visual, aunque no se documentan los detalles del codificador de visión ni del entrenamiento multimodal.

No se han publicado en la información disponible detalles sobre innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Clasificación de texto y toma de decisiones estructuradas, con énfasis en calibración de confianza y predicción conformal.
- Razonamiento y enrutamiento (*routing*) o triaje de consultas hacia distintos flujos o modelos.
- Salidas con tipado seguro (*typesafe*) según las etiquetas del modelo.
- Soporte multimodal mediante el suplemento `mmproj` incluido en las cuantizaciones GGUF.
- Capacidades multilingües en inglés, turco y alemán.
- Ejecución local y en dispositivo (*on-device*) gracias a su tamaño compacto.
- No se documenta explícitamente soporte de *tool calling* ni de agentes multi-paso en la información disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar y enrutar consultas entrantes hacia el equipo o flujo adecuado, aprovechando sus capacidades de decisión y calibración de incertidumbre para marcar casos ambiguos.
- Enrutamiento entre modelos en un pipeline: dado su enfoque en *routing*, puede decidir qué modelo o herramienta debe atender cada petición, reduciendo coste al derivar solo los casos complejos a modelos mayores.
- Moderación y clasificación de contenido: útil para etiquetar textos en inglés, turco y alemán con umbrales de confianza calibrados, lo que permite ajustar la tasa de falsos positivos en producción.
- Filtrado previo en sistemas RAG: puede evaluar la relevancia o la incertidumbre de una consulta antes de invocar un recuperador o un modelo generativo, ahorrando cómputo.
- Inferencia local en portátiles y dispositivos: con cuantizaciones de 2,0 a 2,8 GB (Q2_K a Q4_K_M), es viable en GPUs de consumo y en CPU mediante llama.cpp u Ollama para tareas de clasificación en tiempo real.
- Procesamiento de documentos con componente visual: el suplemento `mmproj` permite abordar tareas que combinan texto e imagen, como la clasificación de capturas o formularios, aunque los detalles de rendimiento no están documentados.
- Análisis de sentimiento y etiquetado a escala en entornos multilingües (en/tr/de) con coste de despliegue bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~2,0 GB; Q3_K_S ~2,2 GB; Q4_K_M ~2,8 GB; Q5_K_M ~3,2 GB; Q6_K ~3,6 GB; Q8_0 ~4,6 GB; f16 ~8,5 GB. Añadir ~0,5-0,8 GB si se usa el suplemento multimodal `mmproj`.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6-8 GB o más, e incluso en configuraciones de 4 GB con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con transformers, vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Deem-4B (esta ficha) | ~4,2 B | no disponible | Apache 2.0 | GGUF, safetensors | Enfoque en decisión, calibración y routing |
| Qwen2.5-3B / Qwen3-4B | ~3-4 B | no disponible en esta ficha | Apache 2.0 (según variante) | GGUF, safetensors | Generales, ampliamente soportados |
| Phi-3.5-mini | ~3,8 B | 128k (según variante) | MIT | GGUF, safetensors | Generalista con contexto largo |
| Llama-3.2-3B | ~3,2 B | 128k | Llama 3.2 Community License | GGUF, safetensors | Generalista, licencia con restricciones |

La comparación cuantitativa de rendimiento no está disponible al no haberse publicado benchmarks de Deem-4B. Los modelos alternativos se incluyen por rango de tamaño y categoría de despliegue local.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al entrenarse con un dataset específico (`jevalt-data`) y en tres idiomas, su cobertura fuera de en/tr/de es limitada.
- Riesgo de alucinación no cuantificado; al ser un modelo orientado a clasificación y decisión, conviene validar sus salidas con umbrales de confianza calibrados.
- La longitud de contexto no está especificada, lo que impide garantizar el manejo de documentos largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, deben respetarse las condiciones del modelo base y de los datos de entrenamiento originales.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- El soporte multimodal depende del archivo `mmproj` y no se detalla su calidad ni sus límites.
- No se confirma soporte de *tool calling* ni de razonamiento multi-paso, por lo que no debe asumirse en pipelines de agentes sin validación previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Deem-4B-GGUF
- Modelo base: https://huggingface.co/mertkayacs/Deem-4B
- Dataset: https://huggingface.co/datasets/mertkayacs/jevalt-data
- Página de descargas del cuantizador: https://hf.tst.eu/model#Deem-4B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
