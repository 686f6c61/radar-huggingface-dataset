# mradermacher/rosa-qwen3-14b-GGUF

## Resumen
Rosa Qwen3 14B es un ajuste fino del modelo Qwen3 14B de Alibaba, desarrollado por marcoeg y distribuido en formato GGUF por mradermacher. Se trata de un modelo de lenguaje de 14.768.307.200 parámetros (aproximadamente 14,8 mil millones) orientado a conversación y adopción de persona, entrenado mediante SFT y DPO sobre una base Qwen3, según indican las etiquetas del repositorio. La arquitectura subyacente es la de Qwen3, un transformer denso (no MoE) con soporte nativo de razonamiento y tool calling, aunque la model card disponible no detalla la longitud de contexto efectiva del ajuste.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y está disponible exclusivamente en inglés según los metadatos. La relevancia de esta ficha radica en que ofrece una alternativa cuantizada y ligera (desde 5,9 GB en Q2_K hasta 15,8 GB en Q8_0) para desplegar un modelo de 14B en hardware de consumo, algo imposible con los pesos originales en FP16 (unos 29,5 GB).

No obstante, la información pública es muy limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no se publican benchmarks, y la model card del autor original (marcoeg/rosa-qwen3-14b) no está incluida en los datos proporcionados. Esta ficha refleja únicamente lo verificable y marca explícitamente como "no disponible" todo aquello que no se puede confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3 14B); no se especifica en la informacion disponible si incorpora atencion lineal o decodificacion especulativa |
| Parametros totales | 14.768.307.200 (14,77 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3 14B soporta hasta 32.768 tokens nativos, ampliable, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; tambien existen cuantizaciones ponderadas/imatrix en mradermacher/rosa-qwen3-14b-i1-GGUF |
| Idiomas soportados | Ingles (segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen3 14B, un transformer denso con atención por softmax estándar (no se confirma en la información disponible si emplea variantes híbridas o atención lineal). Sobre esta base, el autor marcoeg aplicó un pipeline de ajuste fino supervisado (SFT) seguido de optimización por preferencias directas (DPO), según las etiquetas `sft` y `dpo` del repositorio. También se menciona `lora` y `qlora`, lo que sugiere que el ajuste se realizó mediante adaptadores de bajo rango sobre los pesos base, aunque no se especifica el rango, el número de tokens de entrenamiento ni la composición del dataset.

No se dispone de información sobre el volumen de datos de entrenamiento, la mezcla de dominios (conversación, código, matemáticas), ni si se aplicaron técnicas de RLHF adicionales. La etiqueta `persona` indica que el ajuste está orientado a dotar al modelo de una identidad o estilo conversacional concreto, pero no se detalla en qué consiste dicha persona ni cómo se evaluó. Tampoco se documentan innovaciones técnicas propias del ajuste (por ejemplo, decodificación especulativa o modos de pensamiento extendido); cualquier capacidad de razonamiento heredada provendría del Qwen3 base, no de este fine-tuning.

## Capacidades
- Generación de texto conversacional en inglés, con un estilo orientado a persona (etiqueta `persona`).
- Razonamiento y respuesta a instrucciones heredados del Qwen3 14B base, aunque no se verifica su preservación tras el ajuste.
- Soporte potencial de tool calling y function calling, si el modelo base lo conserva; no confirmado en la información disponible.
- Capacidades multilingües limitadas al inglés según los metadatos; no se declaran otros idiomas.
- No se documentan capacidades de visión, audio ni modos de pensamiento explícitos en este ajuste.
- Compatibilidad con Ollama y llama.cpp gracias al formato GGUF, lo que facilita su despliegue local.

## Casos de uso
- Asistentes conversacionales locales: el modelo puede desplegarse en un portátil con GPU de 8-12 GB usando cuantizaciones Q4_K_M (9,1 GB) o IQ4_XS (8,3 GB), ofreciendo respuestas en inglés con una persona definida sin depender de la nube.
- Prototipado de chatbots con identidad propia: gracias al ajuste SFT+DPO orientado a persona, es adecuado para experimentar con personajes o estilos conversacionales concretos en entornos de investigación.
- Evaluación de fine-tunings sobre Qwen3: sirve como caso de estudio para comparar el efecto de SFT y DPO sobre un base de 14B, especialmente en tareas de consistencia de persona.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (5,9 GB) y Q3_K_S (6,8 GB) permiten ejecución en CPU o GPU de gama baja, útil para demos y pruebas de concepto.
- Generación de texto en inglés para pipelines de contenido: con Q8_0 (15,8 GB) se obtiene la máxima calidad del repositorio, adecuada para tareas de redacción o resumen donde la latencia no sea crítica.
- Integración en herramientas de inferencia local: al estar en GGUF, se puede cargar en llama.cpp u Ollama para flujos de trabajo offline, sin necesidad de infraestructura de servidores dedicada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (según cuantización): Q2_K ~5,9 GB; Q3_K_S ~6,8 GB; Q3_K_M ~7,4 GB; Q3_K_L ~8,0 GB; IQ4_XS ~8,3 GB; Q4_K_S ~8,7 GB; Q4_K_M ~9,1 GB; Q5_K_S ~10,4 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB. Añadir 1-2 GB adicionales para el contexto KV cache según la longitud de secuencia.
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 12 GB para Q4_K_M/Q5_K_M; RTX 4090 24 GB para Q6_K y Q8_0 con contexto amplio; A100 40 GB o H100 para despliegues concurrentes con vLLM (aunque vLLM requiere pesos en safetensors, no GGUF).
- Cabe en GPU de consumo: sí, desde GTX 1660 6 GB (Q2_K) hasta RTX 4090 (Q8_0). Las cuantizaciones Q4_K_M y Q4_K_S son las recomendadas por el autor para velocidad y calidad equilibradas.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta `ollama` en el repo), y cualquier runtime compatible con GGUF. Para vLLM o TGI sería necesario usar el modelo base en safetensors (marcoeg/rosa-qwen3-14b), no estas cuantizaciones.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| rosa-qwen3-14b-GGUF (este) | 14,77 B | No disponible | Apache 2.0 | GGUF | Ajuste SFT+DPO orientado a persona; solo inglés; 0 descargas |
| Qwen3 14B (base) | ~14,8 B | 32.768 tokens nativos (ampliable) | Apache 2.0 | Safetensors, GGUF | Modelo base oficial de Alibaba; multilingüe; benchmarks publicados por el autor |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Safetensors, GGUF | Menor tamaño, contexto mucho mayor, licencia con restricciones de uso comercial para >700M usuarios |
| Mistral Nemo 12B Instruct | 12,2 B | 128.000 tokens | Apache 2.0 | Safetensors, GGUF | Contexto amplio, multilingüe, licencia permisiva |

La comparación se limita a características estructurales porque no hay benchmarks publicados para rosa-qwen3-14b. Frente a Qwen3 14B base, este ajuste pierde el multilingüismo declarado y no documenta su contexto efectivo; frente a Llama 3.1 8B y Mistral Nemo 12B, ofrece más parámetros pero menor contexto documentado y un soporte de idiomas restringido al inglés.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3, hereda los sesgos del corpus de entrenamiento original, no evaluados en este ajuste.
- Riesgo de alucinación: no cuantificado; al ser un fine-tuning con DPO sobre una persona concreta, puede generar respuestas plausibles pero incorrectas, especialmente fuera del dominio conversacional.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está confirmada y podría haberse reducido o no haberse preservado respecto al base.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base Qwen3 14B (también Apache 2.0 según la información disponible).
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, sin benchmarks ni evaluación independiente; no se recomienda su uso en producción sin una validación propia previa. La model card del autor original no está incluida, por lo que se desconoce el dataset, la metodología exacta y los criterios de evaluación.
- Las cuantizaciones Q3_K_M están marcadas por el autor como "lower quality"; para aplicaciones sensibles se recomienda Q5_K_M o superior.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/rosa-qwen3-14b-GGUF
- Modelo base (ajuste de marcoeg): https://huggingface.co/marcoeg/rosa-qwen3-14b
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/rosa-qwen3-14b-i1-GGUF
- Página de overview del autor de las cuantizaciones: https://hf.tst.eu/model#rosa-qwen3-14b-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
