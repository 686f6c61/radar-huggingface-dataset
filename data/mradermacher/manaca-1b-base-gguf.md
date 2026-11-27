# mradermacher/manaca-1b-base-GGUF

## Resumen

Manaca-1b-base es un modelo de lenguaje causal en portugués (con especial énfasis en portugués de Brasil) desarrollado por el AIInstituteLNCC, el instituto de inteligencia artificial del Laboratorio Nacional de Computación Científica de Brasil. Se trata de un modelo base de tipo decoder-only con arquitectura derivada de la familia Llama y entrenado con el framework Megatron-LM, diseñado para servir como punto de partida para ajuste fino y para tareas de generación de texto en portugués.

La versión aquí descrita es la cuantización GGUF publicada por mradermacher, un colaborador habitual de la comunidad que convierte modelos a formatos ligeros para su uso con llama.cpp y derivados. El modelo original cuenta con aproximadamente 1.723 millones de parámetros (1,72 B), lo que lo sitúa en la gama de modelos pequeños que pueden ejecutarse en hardware de consumo.

Su relevancia actual radica en la escasez relativa de modelos base abiertos específicamente entrenados para portugués con licencia permisiva (CC-BY-4.0), lo que lo convierte en una opción interesante para investigación lingüística, ajuste fino con datos propios y despliegue en entornos con recursos limitados. Al ser un modelo base y no un modelo instruido, no incorpora alineamiento conversacional ni formato de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Llama, entrenado con Megatron-LM) |
| Parametros totales | 1.722.951.680 (1,72 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Portugués (pt), con etiqueta específica para portugués de Brasil (pt-br) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal decoder-only de la familia Llama, entrenada mediante Megatron-LM. Con 1,72 B de parámetros, se trata de un modelo denso (no Mixture of Experts) orientado a generación de texto autoregresiva. La información disponible no detalla el número de capas, dimensiones ocultas, número de cabezas de atención ni la longitud de contexto nativa, por lo que estos datos deben consultarse en la model card del modelo original.

En cuanto a los datos de entrenamiento, la model card cita dos fuentes: TucanoBR/GigaVerbo, un corpus a gran escala de portugués, y wikimedia/wikipedia. No se especifica el número exacto de tokens procesados ni la composición porcentual del dataset. Tampoco hay información sobre si se aplicaron fases de instrucción, RLHF o DPO; la designación "base" sugiere que no se realizó alineamiento, pero no puede confirmarse con los datos disponibles. La cuantización GGUF la realiza mradermacher con su pipeline habitual (quantize_version 2, salida con tensores cuantizados), e incluye tanto cuantizaciones estáticas como, en un repositorio separado, cuantizaciones ponderadas con imatrix.

## Capacidades

- Generación de texto autoregresiva en portugués, incluyendo portugués de Brasil.
- Modelo base sin instrucción: no está alineado para seguir instrucciones ni para formato conversacional.
- Capacidad de continuación de texto y modelado de lenguaje, útil como base para ajuste fino.
- Soporte multilingüe limitado: la etiqueta de idioma es únicamente `pt`, por lo que el rendimiento en otros idiomas no está garantizado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Compatible con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.

## Casos de uso

- Ajuste fino para tareas de clasificación y extracción de información en portugués: al ser un modelo base pequeño, puede adaptarse con datasets propios para tareas como análisis de sentimiento o extracción de entidades en textos en portugués brasileño.
- Investigación lingüística y evaluación de modelos en portugués: sirve como referencia para estudiar el comportamiento de modelos pequeños entrenados específicamente en portugués frente a modelos multilingües de tamaño similar.
- Generación de texto asistida en entornos con recursos limitados: con cuantizaciones Q4 de ~1,1-1,2 GB, puede ejecutarse en portátiles y GPUs de consumo para tareas de continuación de texto o generación de borradores.
- Prototipado rápido de aplicaciones de NLP en portugués: permite validar pipelines de inferencia con llama.cpp u Ollama antes de escalar a modelos mayores.
- Educación y docencia: su tamaño reducido y licencia permisiva lo hacen adecuado para demostraciones de entrenamiento, cuantización e inferencia de LLM en cursos y talleres.
- Generación de datos sintéticos en portugués: puede utilizarse para producir texto de dominio general que luego se filtre y se use en el entrenamiento de modelos mayores o en la aumentación de datasets.
- Despliegue en el borde (edge): la versión Q2_K de 0,8 GB permite experimentar con inferencia en dispositivos con poca memoria, aunque con pérdida de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB (Q2_K), 1,1-1,2 GB (Q4_K_S/Q4_K_M), 1,5 GB (Q6_K), 1,9 GB (Q8_0) y 3,5 GB (f16), sin contar el overhead del runtime y la caché KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; para f16 se recomienda al menos 6 GB. Funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque en estas dos últimas el modelo estará infrautilizado.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; para el modelo original en safetensors, transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un modelo de 1,72 B, se espera un throughput alto en GPU modernas, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| manaca-1b-base (este) | 1,72 B | no disponible | CC-BY-4.0 | safetensors, GGUF | Base, entrenado en portugués (GigaVerbo + Wikipedia) |
| Modelos base de la familia Llama de tamano similar | ~1-2 B | no disponible | licencias específicas de Meta | safetensors, GGUF | Multilingües, no específicos de portugués |
| Modelos base pequenos de la familia Qwen | ~0,5-1,8 B | no disponible | licencias específicas de Alibaba | safetensors, GGUF | Multilingües con buen soporte de chino e inglés |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; no se han publicado resultados de benchmarks que permitan establecer diferencias de rendimiento frente a modelos de tamaño similar.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones de forma fiable y no debe usarse directamente en aplicaciones conversacionales sin ajuste fino o instrucción previa.
- Riesgo de alucinación inherente a los modelos de lenguaje; al no estar alineado, puede generar contenido factualmente incorrecto sin señales de cautela.
- Sesgos potenciales derivados de los corpus de entrenamiento (GigaVerbo y Wikipedia), no documentados en la información disponible.
- Cobertura lingüística limitada al portugués; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada; debe verificarse en la model card del modelo original antes de usarlo con entradas largas.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene revisar los términos de los datasets de entrenamiento (GigaVerbo, Wikipedia) por si imponen restricciones adicionales.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma apreciable; para producción se recomienda Q4_K_M o superior.
- El repositorio GGUF es una conversión de terceros; para usos críticos conviene validar que la cuantización reproduce fielmente el comportamiento del modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/manaca-1b-base-GGUF
- Modelo original: https://huggingface.co/AIInstituteLNCC/manaca-1b-base
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/manaca-1b-base-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#manaca-1b-base-GGUF
- Dataset GigaVerbo: https://huggingface.co/datasets/TucanoBR/GigaVerbo
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
