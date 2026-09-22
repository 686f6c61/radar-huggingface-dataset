# menasaat/menasaat-qwen3-4b-oman-qlora-v2

## Resumen

Menasaat-qwen3-4b-oman-qlora-v2 es un adaptador LoRA de segunda generación publicado por Menasaat | Virtual Platforms LLC, una empresa de IA con sede en Omán orientada a soluciones en árabe para Omán, el CCG y la región MENA. No es un modelo completo: se trata de un adaptador PEFT que se monta sobre el modelo base Qwen/Qwen3-4B (Apache 2.0), de unos 4.000 millones de parámetros, y que se distribuye en un repositorio de 0,1 GB con pesos en safetensors.

El adaptador se ha entrenado sobre un corpus bilingüe (árabe e inglés) que combina un conjunto de instrucciones derivado de la Wikipedia de Omán con 995-1.095 pares de turismo procedentes del dataset menasaat/menasaat-oman-tourism-places. Cubre 159 lugares repartidos por las 11 gobernaciones del país, con datos de horarios de apertura, ubicación (wilaya y gobernación), mejores temporadas de visita y consejos prácticos, además de preguntas de localización geográfica en árabe.

Su relevancia es doble: por un lado, ofrece conocimiento factual especializado sobre Omán en árabe, un nicho poco cubierto por los modelos generalistas; por otro, su formato de adaptador ligero (r=16, α=32, entrenado con QLoRA 4-bit NF4 en una única Tesla T4) lo hace fácil de integrar en pipelines RAG empresariales o de administración pública sin necesidad de reentrenar el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen3-4B) con adaptador LoRA acoplado; no es MoE |
| Parámetros totales | Aproximadamente 4.000 millones (modelo base Qwen3-4B); el número exacto de parámetros entrenables del adaptador no está disponible, con r=16 y α=32 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Qwen3-4B |
| Tipos de cuantización | Entrenamiento con QLoRA 4-bit NF4; adaptador distribuido en fp16 (según la tabla de entrenamiento). El modelo base admite otras cuantizaciones (GGUF, AWQ, GPTQ), pero no se documentan para este adaptador |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) con configuración PEFT; no incluye los pesos del modelo base |
| Librería | peft |
| Pipeline | text-generation |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | Qwen/Qwen3-4B |
| Método de entrenamiento | QLoRA, 4-bit NF4, LoRA r=16 α=32, fp16, 2 épocas |
| Fecha de publicación | 22 de septiembre de 2026 (creación y última actualización en HuggingFace) |
| Descargas / likes | 0 descargas, 0 likes |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder denso del que hereda toda la arquitectura de atención y tokenización. La contribución del autor se limita a los pesos LoRA: rango 16, alpha 32, entrenados en precisión fp16 sobre el base cuantizado a 4 bits NF4 (QLoRA). El entrenamiento se realizó durante 2 épocas completas en una única GPU Tesla T4 (nivel gratuito de Kaggle) en 175,4 minutos, lo que da una idea del coste computacional real del proyecto: es un ajuste reproducible en hardware de gama media y con presupuesto reducido.

El conjunto de datos mezcla dos fuentes: 3.926 pares de instrucciones procedentes de la Wikipedia de Omán y 995 pares de turismo, con 160 pares reservados para evaluación (total: 4.921 pares). Existe una discrepancia en la propia model card: la sección de novedades de la v2 menciona 1.095 pares de turismo, mientras que la tabla de entrenamiento indica 995. La pérdida de entrenamiento descendió de 6,68 a 3,84 y la pérdida de evaluación mixta (wiki más turismo) se situó en 3,18. No se documenta uso de RLHF, DPO ni decodificación especulativa; el ajuste es exclusivamente supervisado (SFT).

## Capacidades

- Generación de texto bilingüe árabe-inglés orientada a preguntas y respuestas sobre Omán.
- Conocimiento factual sobre turismo en Omán: 159 lugares en las 11 gobernaciones, con horarios de apertura, ubicación por wilaya y gobernación, mejores temporadas de visita y consejos para visitantes.
- Respuesta a preguntas de localización en árabe del tipo «أين تقع ...؟» (¿dónde se encuentra ...?), construidas a partir del dataset de lugares.
- Integración en pipelines RAG: el autor posiciona explícitamente el modelo para recuperación aumentada, con las respuestas turísticas ancladas al dataset compilado.
- Capacidades generales heredadas del modelo base Qwen3-4B; según el autor, el conocimiento general se mantiene al nivel del base.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente turístico oficial para Omán: desplegado como servicio conversacional, responde en árabe e inglés sobre lugares, horarios y temporadas usando los 159 puntos de interés del dataset, con el modelo base aportando fluidez conversacional.
- Módulo generativo dentro de un sistema RAG patrimonial o cultural: el adaptador se usa como generador final sobre fragmentos recuperados de la Wikipedia de Omán, lo que encaja con el enfoque declarado por el fabricante para sistemas de recuperación.
- Portal de administración pública omaní: atención ciudadana bilingüe sobre información territorial y geográfica (wilayas, gobernaciones), con respuestas ancladas a datos compilados en lugar de conocimiento paramétrico libre.
- Planificación de itinerarios y recomendación de visitas: a partir de la temporada recomendada y la ubicación administrativa de cada lugar, el modelo puede generar borradores de rutas por gobernación que después se validan con datos actualizados.
- Generación de contenido editorial bilingüe para promoción turística: descripciones de lugares, fichas breves y material divulgativo en árabe e inglés partiendo de los pares de entrenamiento.
- Base para ajustes posteriores específicos de dominio: al ser un adaptador LoRA ligero sobre un base Apache 2.0, sirve como punto de partida para añadir nuevas verticales (gastronomía, transporte, patrimonio) con coste de entrenamiento bajo.
- Prototipado e investigación en PLN árabe: útil como referencia de adaptación QLoRA reproducible en una sola T4 para estudiar transferencia de conocimiento regional en modelos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni evaluaciones de tareas árabes como ArabicMMLU). Los únicos datos numéricos publicados son métricas de entrenamiento:

| Métrica | Valor |
|---|---|
| Pares de entrenamiento | 4.921 (3.926 wiki + 995 turismo, 160 reservados) |
| Épocas | 2 |
| Pérdida de entrenamiento | 6,68 → 3,84 |
| Pérdida de evaluación (mezcla wiki + turismo) | 3,18 |
| Tiempo de entrenamiento | 175,4 minutos en 1× Tesla T4 |
| Configuración | QLoRA 4-bit NF4, LoRA r=16, α=32, fp16 |

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones, no publicadas por el autor): en fp16, en torno a 8-10 GB para el modelo base de 4B más el adaptador y la caché KV; en cuantización 8-bit, alrededor de 5-6 GB; en 4-bit NF4/GGUF Q4, alrededor de 3-4 GB.
- GPU recomendadas: Tesla T4 (16 GB) es suficiente para el ajuste y para inferencia en fp16, como demuestra el propio entrenamiento; A100, H100 o L40S para despliegues con concurrencia alta; RTX 4090 y RTX 3090 (24 GB) para experimentación e inferencia local cómoda.
- Cabe en GPU de consumo: sí. Con cuantización 4-bit funciona en tarjetas de 6-8 GB (RTX 3060, RTX 4060); en fp16 requiere 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti SUPER).
- Opciones de despliegue: transformers + peft (carga directa del adaptador, como muestra la model card); vLLM y TGI admiten adaptadores LoRA en caliente; llama.cpp y Ollama requieren fusionar el adaptador con el base y exportar a GGUF; SGLang como alternativa con soporte LoRA.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el coste de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tipo | Observaciones |
|---|---|---|---|---|---|
| menasaat-qwen3-4b-oman-qlora-v2 | ~4B (base) + LoRA r=16 | No especificado (heredado de Qwen3-4B) | Apache 2.0 | Adaptador LoRA | Especializado en Omán (turismo y Wikipedia); sin benchmarks publicados; 0 descargas |
| Qwen/Qwen3-4B (base) | ~4B | No disponible en la información proporcionada | Apache 2.0 | Modelo completo | Ofrece el conocimiento general y las capacidades del modelo original; no incluye el conocimiento específico de Omán del adaptador |
| Qwen3-4B-Instruct (variantes instruct) | ~4B | No disponible en la información proporcionada | Apache 2.0 | Modelo completo ajustado a instrucciones | Alternativa generalista para instrucciones; cobertura del árabe y de Omán no cuantificada en la información disponible |
| Modelos árabes regionales (Jais, Fanar, ALLaM y similares) | No disponible | No disponible | No disponible | Modelo completo | Categoría comparable por enfoque regional en árabe, pero no se dispone de datos verificados en la información proporcionada para establecer una comparación numérica |

No es posible establecer una comparación cuantitativa de rendimiento: ni este adaptador ni las alternativas cuentan con resultados de benchmarks en la información disponible.

## Limitaciones y advertencias

- Las respuestas sobre turismo están ancladas al dataset compilado; el propio autor recomienda verificar los datos sensibles al tiempo (horarios y temporadas) antes de usarlos en contextos de alto riesgo.
- Cobertura limitada a 159 lugares y 11 gobernaciones: cualquier consulta fuera de ese catálogo se resolverá con el conocimiento general del modelo base, con riesgo de alucinación.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de mejora frente a Qwen3-4B en tareas árabes ni de posibles regresiones por sobreajuste al dominio.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en datos factuales precisos (distancias, precios, horarios) no presentes en el corpus.
- Sesgos potenciales procedentes del corpus de Wikipedia de Omán y del dataset de turismo, no auditados en la información disponible.
- Discrepancia documental en la model card sobre el número de pares de turismo (995 frente a 1.095), lo que dificulta reproducir exactamente la composición del entrenamiento.
- El repositorio solo contiene el adaptador: es obligatorio descargar el modelo base Qwen3-4B por separado y existe riesgo de desalineación si se usa una revisión distinta del base.
- Licencia Apache 2.0, heredada del modelo base: permite uso comercial, pero el adaptador no incorpora garantías ni evaluaciones de producción por parte del autor.
- Estado de adopción nulo (0 descargas, 0 likes) en el momento de la consulta: no hay validación externa ni informes de terceros.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debería asumirse su funcionamiento en flujos de llamada a funciones sin verificación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/menasaat/menasaat-qwen3-4b-oman-qlora-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de turismo: https://huggingface.co/datasets/menasaat/menasaat-oman-tourism-places
- Perfil del autor en HuggingFace: https://huggingface.co/menasaat
- Sitio del fabricante: https://menasaat.com
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo (únicamente páginas genéricas sin relación), por lo que no se dispone de papers, blogs ni demos adicionales.
