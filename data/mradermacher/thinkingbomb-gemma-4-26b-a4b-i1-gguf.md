# mradermacher/ThinkingBomb-gemma-4-26B-A4B-i1-GGUF

## Resumen

ThinkingBomb-gemma-4-26B-A4B-i1-GGUF es la versión cuantizada en formato GGUF del modelo ThinkingBomb-gemma-4-26B-A4B, un ajuste fino de tipo reasoning desarrollado por krystofmitka sobre la base Gemma 4 de Google. Esta ficha concreta corresponde al repositorio publicado por mradermacher, que aplica cuantización con matrices de importancia (imatrix) para generar una batería de ficheros GGUF utilizables con llama.cpp y herramientas compatibles. El modelo base tiene 25.233.142.046 parámetros (aproximadamente 25,2 mil millones), lo que lo sitúa en la gama de modelos medianos-grandes ejecutables en hardware de consumo con cuantizaciones agresivas.

El modelo está etiquetado con los tags `reasoning`, `grpo` y `effort-control`, lo que indica que el ajuste fino se orientó a reforzar capacidades de razonamiento mediante GRPO (Group Relative Policy Optimization) e incorpora algún mecanismo de control de esfuerzo en la generación de cadenas de pensamiento. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial. El idioma declarado es únicamente inglés.

La relevancia de este repositorio es práctica: ofrece el modelo en múltiples niveles de cuantización (desde IQ1_S de 8,4 GB hasta Q6_K de 22,7 GB), lo que permite desplegarlo desde GPUs de consumo modestas hasta estaciones de trabajo con VRAM amplia. Además, el modelo base es multimodal (visión), aunque los ficheros mmproj necesarios para la parte visual se alojan en el repositorio estático hermano, no en este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4); detalles especificos no disponibles |
| Parametros totales | 25.233.142.046 (aprox. 25,2 B) |
| Parametros activos | no disponible (no se confirma que sea MoE pese al sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con license_link a los terminos de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Gemma 4, la familia de modelos de Google, con 25,2 mil millones de parámetros. El sufijo "A4B" en el nombre sugiere una posible arquitectura de mezcla de expertos con aproximadamente 4 mil millones de parámetros activos, pero la información disponible no confirma esta interpretación, por lo que no debe asumirse. El ajuste fino incorpora las etiquetas `reasoning`, `grpo` y `effort-control`: GRPO es una técnica de optimización por refuerzo (empleada habitualmente para entrenar modelos de razonamiento) y "effort-control" apunta a la capacidad de modular la profundidad del razonamiento generado.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO adicionales. Tampoco se detalla si el modelo incorpora innovaciones como decodificación especulativa o atención lineal. Esta ficha corresponde a la cuantización GGUF con imatrix realizada por mradermacher, que no modifica la arquitectura sino que reduce la precisión de los pesos para facilitar el despliegue local. Los ficheros estáticos (sin imatrix) están disponibles en un repositorio hermano.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento reforzado mediante GRPO, orientado a tareas que requieren cadenas de pensamiento.
- Control de esfuerzo (`effort-control`): capacidad declarada de modular la profundidad del razonamiento.
- Capacidades de visión: el modelo base es multimodal y dispone de ficheros mmproj en el repositorio estático, aunque no se incluyen en este repositorio i1.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del razonamiento inherente.
- Multilingüismo: limitado al inglés según la etiqueta de idioma declarada.

## Casos de uso

- Razonamiento matemático y lógico en local: el ajuste con GRPO está orientado a problemas que requieren pasos intermedios; puede desplegarse con llama.cpp en una estación de trabajo para resolver problemas de matemáticas o lógica sin depender de la nube.
- Asistente de análisis técnico en inglés: gracias a su ventana de contexto (no documentada) y a su capacidad de razonamiento, puede emplearse para revisar documentación técnica o código en inglés y producir explicaciones paso a paso.
- Prototipado de investigación en razonamiento: al ser un modelo abierto con licencia permisiva, sirve para experimentar con técnicas de control de esfuerzo y comparar la calidad del razonamiento según el nivel de cuantización.
- Despliegue en hardware de consumo: las cuantizaciones IQ2/IQ3 (9-13 GB) permiten ejecutar el modelo en GPUs de 12-16 GB, útil para desarrolladores que quieren un modelo de razonamiento local sin infraestructura dedicada.
- Evaluación de cuantizaciones: el repositorio ofrece una escala completa de cuantizaciones con imatrix, lo que facilita estudios comparativos de degradación de calidad frente a tamaño.
- Procesamiento de imágenes con el repositorio estático: usando los ficheros mmproj del repositorio hermano, puede emplearse para tareas de descripción o análisis de imágenes en inglés.
- Generación de documentación o resúmenes técnicos: para flujos de trabajo en inglés donde se requiera un modelo local con razonamiento moderado y sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: IQ1_S ~8,4 GB; IQ2_M ~10,5 GB; IQ3_M ~12,5 GB; IQ4_XS ~14,0 GB; Q4_K_M ~16,9 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB. Añadir margen para el contexto KV cache (típicamente 1-4 GB adicionales según longitud de contexto).
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M o Q6_K; RTX 4080/4070 Ti (16 GB) para Q4_K_M; RTX 3060 12 GB o RTX 4070 (12 GB) para IQ3_M o IQ3_S; GPUs de 8-10 GB solo con IQ1/IQ2 (calidad muy degradada).
- Cabe en GPU de consumo: sí, en la mayoría de configuraciones con cuantizaciones IQ2 a Q4; las cuantizaciones Q5/Q6 requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que se requeriría el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingBomb-gemma-4-26B-A4B-i1-GGUF | 25,2 B | no disponible | apache-2.0 | GGUF | Ajuste de razonamiento sobre Gemma 4; solo inglés |
| Modelo base (krystofmitka/ThinkingBomb-gemma-4-26B-A4B) | 25,2 B | no disponible | apache-2.0 | safetensors | Mismo modelo sin cuantizar; referencia de calidad |
| Versión estática (mradermacher/ThinkingBomb-gemma-4-26B-A4B-GGUF) | 25,2 B | no disponible | apache-2.0 | GGUF | Cuantizaciones sin imatrix; incluye mmproj de visión |

No se dispone de información sobre otros modelos comparables de la misma categoría (razonamiento de ~25 B) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo declara únicamente inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está garantizado.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate".
- Riesgo de alucinación inherente a los modelos de razonamiento; no se documentan evaluaciones de fiabilidad.
- La licencia declarada es Apache 2.0, pero el enlace apunta a los términos de Gemma 4 de Google, que pueden imponer restricciones adicionales al uso comercial; es imprescindible revisar dichos términos.
- No hay información sobre sesgos conocidos ni sobre el dataset de entrenamiento, lo que dificulta evaluar riesgos.
- La ausencia de datos sobre longitud de contexto impide planificar despliegues con ventanas largas.
- El sufijo "A4B" sugiere una arquitectura MoE, pero no está confirmado; no asumir parámetros activos de 4 B sin verificación.
- Los ficheros mmproj para visión no están en este repositorio; para uso multimodal hay que acudir al repositorio estático.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/ThinkingBomb-gemma-4-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/krystofmitka/ThinkingBomb-gemma-4-26B-A4B
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/ThinkingBomb-gemma-4-26B-A4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#ThinkingBomb-gemma-4-26B-A4B-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
