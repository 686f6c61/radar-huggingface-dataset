# mradermacher/WeMM-Ecom-2B-i1-GGUF

## Resumen

WeMM-Ecom-2B-i1-GGUF es la versión cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-2B, desarrollado originalmente por Tencent y publicado en Hugging Face bajo licencia Apache 2.0. Esta variante concreta la ha generado mradermacher, un conocido cuantizador de la comunidad que produce versiones GGUF con matrices de importancia (imatrix) para su uso en llama.cpp y otros runners compatibles. El modelo está orientado a conversaciones de comercio electrónico y combina capacidades de texto y visión, lo que lo hace adecuado para tareas como atención al cliente, descripción de productos o diálogo multimodal en tiendas online.

La arquitectura se etiqueta como `qwen3_5`, lo que sugiere que se apoya en la familia Qwen 3.5 como base, aunque la model card no detalla la estructura interna ni el número exacto de parámetros. El identificador "2B" indica un tamaño aproximado de 2 mil millones de parámetros, aunque el dato de safetensors reportado (812.958) parece incompleto o corresponder a un subconjunto de tensores, por lo que no debe tomarse como el total real. El contexto, la composición del dataset de entrenamiento y los detalles de alineación no están documentados en la información disponible.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo multimodal especializado en e-commerce en hardware de consumo, gracias a las cuantizaciones GGUF de baja precisión (desde Q2_K hasta Q6_K, incluyendo variantes IQ). No obstante, la ausencia de benchmarks publicados y de documentación técnica detallada obliga a tratar las cifras de rendimiento con cautela y a validar el modelo en el caso de uso concreto antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`), detalles no disponibles |
| Parametros totales | ~2B (según el nombre); dato de safetensors reportado: 812.958 (incompleto, no fiable) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; también fichero imatrix |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y la naturaleza multimodal del modelo base. Se trata, por tanto, de un transformer adaptado a entrada de texto e imagen, presumiblemente con un codificador visual acoplado a un decoder de lenguaje, pero no se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni el tipo de proyección multimodal. Tampoco se documenta si emplea atención lineal, decodificación especulativa u otras optimizaciones.

Respecto al entrenamiento, la model card no indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El dominio declarado es e-commerce y conversacional, lo que sugiere un ajuste orientado a diálogos de atención al cliente y tareas de catálogo, pero no hay datos verificables sobre el proceso. La cuantización realizada por mradermacher emplea matrices de importancia (imatrix) generadas a partir del modelo base, lo que en la práctica mejora la calidad de las cuantizaciones de baja precisión frente a las estáticas.

## Capacidades

- Generación de texto conversacional en chino e inglés, orientada a diálogos de comercio electrónico.
- Procesamiento multimodal: acepta imágenes además de texto (el autor indica que es un modelo de visión y que los ficheros mmproj, si existen, están en el repositorio estático).
- Respuesta a preguntas sobre productos, descripciones y soporte al cliente en contexto de tienda online.
- Soporte de conversaciones multi-turno (implícito en la etiqueta `conversational`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Atención al cliente automatizada en tiendas online: el modelo puede gestionar conversaciones multi-turno en chino e inglés sobre pedidos, devoluciones y disponibilidad, aprovechando su ajuste específico al dominio de e-commerce.
- Descripción automática de productos a partir de imágenes: al ser multimodal, puede generar fichas de producto y textos de catálogo a partir de fotos, reduciendo el trabajo manual de los equipos de contenido.
- Asistente de compras conversacional: integrado en una web o app, puede responder dudas sobre características, tallas o compatibilidad de productos combinando texto e imagen del artículo.
- Moderación y clasificación de consultas de clientes: puede etiquetar y enrutar tickets de soporte según su temática, gracias a su comprensión del lenguaje de comercio electrónico.
- Generación de respuestas FAQ y plantillas de soporte: útil para redactar borradores de respuestas que luego revisa un humano, en despliegues ligeros sobre CPU o GPU de consumo.
- Prototipado rápido en local: al estar en GGUF, permite probar un modelo multimodal de 2B en un portátil con llama.cpp u Ollama antes de escalar a un modelo mayor en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~2B en GGUF, las cuantizaciones Q4_K_M ocupan aproximadamente 1,2-1,5 GB, y las Q6_K en torno a 1,8-2 GB; las Q2_K pueden bajar de 1 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) puede ejecutar las cuantizaciones de 4 bits; para las de 6-8 bits se recomienda 6-8 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y runners compatibles con GGUF; el repositorio base es compatible con transformers, pero esta variante GGUF está pensada para llama.cpp y derivados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Ecom-2B-i1-GGUF | ~2B | no disponible | Sí | Apache 2.0 | GGUF |
| Qwen2.5-VL-3B | ~3B | no disponible en esta ficha | Sí | Apache 2.0 (según versión) | safetensors, GGUF comunitario |
| SmolVLM-2B | ~2B | no disponible en esta ficha | Sí | Apache 2.0 | safetensors, GGUF |
| MiniCPM-V 2.6 | ~8B | no disponible en esta ficha | Sí | no disponible | safetensors, GGUF |

La comparación se limita a características generales porque no hay benchmarks publicados para WeMM-Ecom-2B en la información disponible; los datos de los modelos alternativos deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no se puede afirmar su calidad relativa frente a otros modelos multimodales de tamaño similar.
- Documentación técnica muy escasa: se desconocen contexto, arquitectura exacta, dataset y proceso de alineación, lo que dificulta evaluar riesgos.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos generativos, agravado en dominios comerciales donde los datos de producto deben ser exactos.
- Sesgos potenciales derivados del dataset de e-commerce, no documentados.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base (enlazada en la model card) por si impone condiciones adicionales.
- El dato de parámetros de safetensors (812.958) es inconsistente con el nombre "2B"; no debe usarse para estimar requisitos de hardware.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WeMM-Ecom-2B-i1-GGUF
- Repositorio GGUF estático (incluye mmproj): https://huggingface.co/mradermacher/WeMM-Ecom-2B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-2B
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-2B/blob/main/LICENSE
- Página de descargas del cuantizador: https://hf.tst.eu/model#WeMM-Ecom-2B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
