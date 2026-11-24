# mradermacher/WeMM-Ecom-35B-A3B-i1-GGUF

## Resumen

WeMM-Ecom-35B-A3B-i1-GGUF es la versión cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-35B-A3B, desarrollado originalmente por Tencent. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 34.660.610.688 parámetros totales, orientado a conversaciones y tareas de comercio electrónico, con capacidad para procesar tanto texto como imágenes. La cuantización la firma mradermacher, un conocido autor de cuantizaciones GGUF de la comunidad, e incluye variantes con imatrix para preservar la calidad en rangos de compresión agresivos.

El modelo parte de la familia Qwen3.5-MoE (según la etiqueta `qwen3_5_moe`), lo que sitúa su arquitectura en la línea de los transformers MoE con atención estándar. Su enfoque multimodal y su especialización en dominios de e-commerce lo hacen relevante para equipos que necesitan desplegar asistentes conversacionales capaces de interpretar imágenes de producto, fichas técnicas o capturas de pantalla dentro de flujos de atención al cliente y catálogo.

La versión cuantizada i1-GGUF facilita el despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles, manteniendo la licencia Apache 2.0 del modelo base, lo que permite uso comercial sin restricciones adicionales más allá de las condiciones de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), familia Qwen3.5-MoE |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, IQ3_XXS, Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ4_XS, IQ4_NL (small-IQ4_NL) |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base WeMM-Ecom-35B-A3B emplea una arquitectura Mixture of Experts (MoE) dentro de la familia Qwen3.5-MoE, según las etiquetas del repositorio. La arquitectura MoE permite activar únicamente un subconjunto de parámetros por token, lo que reduce el coste computacional en inferencia respecto a un modelo denso del mismo tamaño total. El número exacto de parámetros activos, el número de expertos y la estrategia de enrutamiento no están disponibles en la información proporcionada.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal. La especialización en comercio electrónico y el carácter multimodal (procesamiento de imágenes) son los rasgos diferenciales declarados por el autor del modelo base, Tencent. La cuantización i1-GGUF ha sido generada por mradermacher usando imatrix, lo que mejora la fidelidad de los pesos cuantizados en comparación con cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Procesamiento multimodal: capacidad de recibir imágenes junto con texto (modelo etiquetado como vision model; los ficheros mmproj, si existen, se alojan en el repositorio estático).
- Especialización en dominio de comercio electrónico: descripciones de producto, atención al cliente, consultas sobre catálogo.
- Conversación multi-turno (etiqueta `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a chino e inglés según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en e-commerce: el modelo puede gestionar conversaciones multi-turno en chino e inglés sobre pedidos, devoluciones y disponibilidad de producto, apoyándose en su especialización de dominio para respuestas más ajustadas al contexto comercial.
- Descripción automática de imágenes de producto: al ser un modelo multimodal, puede generar fichas y descripciones a partir de fotografías de catálogo, reduciendo el trabajo manual de los equipos de contenido.
- Asistente de comparación de productos: interpretación de capturas de pantalla o imágenes de fichas técnicas junto con preguntas del usuario para responder comparativas entre artículos.
- Moderación y clasificación de reseñas: análisis de texto e imágenes enviadas por clientes para detectar contenido inapropiado o productos defectuosos.
- Generación de respuestas en soporte postventa: redacción de respuestas contextualizadas a partir de imágenes de daños o etiquetas de envío adjuntas por el cliente.
- Despliegue en local con llama.cpp: al estar cuantizado en GGUF con variantes desde Q2_K hasta Q6_K, permite ejecutar el modelo en estaciones de trabajo sin GPU de datacenter, útil para prototipos y pruebas de integración antes de pasar a producción.
- Traducción asistida chino-inglés en contextos comerciales: apoyo a equipos de venta internacional para adaptar mensajes de producto entre ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante i1-Q2_K ocupa 13,0 GB en disco; el resto de cuantizaciones (hasta Q6_K) escalan en tamaño, por lo que la VRAM necesaria para inferencia completa en GPU oscila aproximadamente entre 13 GB y más de 28 GB según la cuantización elegida.
- GPU recomendadas: no disponible de forma explícita; por tamaño, una RTX 4090 (24 GB) podría alojar cuantizaciones medias (Q4_K_M, Q5_K_S) con posible offload parcial de capas a CPU; A100 y H100 permiten cargar las variantes de mayor precisión.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más para cuantizaciones bajas y medias; las variantes Q6_K pueden requerir offload a RAM del sistema.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) por el formato GGUF; el modelo base en safetensors es compatible con transformers.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B (i1-GGUF) | 34,66 B (MoE) | no disponible | Apache 2.0 | GGUF | Multimodal, especializado en e-commerce, zh/en |
| Qwen3.5-MoE (familia base) | no disponible | no disponible | no disponible | safetensors/GGUF | Arquitectura de referencia del modelo |
| Alternativas multimodales MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparativa con alternativas concretas no puede completarse con rigor porque la información proporcionada no incluye especificaciones de modelos comparables ni resultados de benchmarks. Se recomienda consultar la model card del modelo base en Tencent para obtener datos de referencia.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés según los metadatos; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en consultas de producto con datos numéricos (precios, stock, plazos de envío).
- No se dispone de información sobre sesgos conocidos, dataset de entrenamiento ni evaluaciones de seguridad.
- La cuantización introduce pérdida de calidad respecto al modelo original en safetensors; las variantes Q2 y Q3 son especialmente agresivas y pueden degradar el razonamiento y la coherencia.
- El modelo es una cuantización de terceros (mradermacher), no una versión oficial de Tencent; la responsabilidad sobre el comportamiento final recae en el usuario.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada en la model card original por si incluye condiciones adicionales.
- No hay información sobre tool calling ni soporte de agentes, por lo que no debe asumirse su disponibilidad en producción sin validación previa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face (cuantización i1-GGUF): https://huggingface.co/mradermacher/WeMM-Ecom-35B-A3B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/WeMM-Ecom-35B-A3B-GGUF
- Modelo base original: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B/blob/main/LICENSE
- Página de descargas del autor: https://hf.tst.eu/model#WeMM-Ecom-35B-A3B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
