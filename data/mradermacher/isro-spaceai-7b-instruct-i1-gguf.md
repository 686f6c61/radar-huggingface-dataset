# mradermacher/ISRO-SpaceAI-7B-Instruct-i1-GGUF

## Resumen

ISRO-SpaceAI-7B-Instruct-i1-GGUF es una colección de cuantizaciones GGUF del modelo ISRO-SpaceAI-7B-Instruct, desarrollado por Anoopsingh53 y cuantizado por mradermacher. El modelo base es un ajuste fino (fine-tuning) con QLoRA de un modelo de 7.6 mil millones de parámetros, especializado en dominios espaciales y de observación de la Tierra: astrofísica, heliofísica, oceanografía, teledetección SAR y misiones de la ISRO (Chandrayaan-3, Aditya-L1, Oceansat-3) y de la NASA. El ajuste se realizó sobre dos datasets: uno de preguntas y respuestas de artículos de astrofísica (arxiv-qa-astro-ph) y otro propio de la ISRO sobre datos espaciales y oceánicos.

Esta versión i1-GGUF incluye 24 niveles de cuantización (desde IQ1_S de 2.0 GB hasta Q6_K de 6.4 GB) con archivo imatrix para optimizar la calidad de las cuantizaciones de baja precisión. El modelo está pensado para ejecutarse localmente en hardware de consumo, manteniendo capacidades de conversación y generación de texto en inglés e hindi. Su relevancia radica en ofrecer un LLM especializado en un nicho técnico (ciencia espacial y oceanografía) con licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura exacta no disponible; modelo base de 7B no especificado) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Ingles (en), Hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base ISRO-SpaceAI-7B-Instruct fue entrenado mediante fine-tuning con QLoRA sobre un modelo de 7.6B parámetros (la arquitectura exacta del modelo base no se especifica en la documentación disponible). El entrenamiento utilizó dos datasets: UniverseTBD/arxiv-qa-astro-ph, que contiene pares de preguntas y respuestas extraídos de artículos de astrofísica, y Anoopsingh53/isro-space-ocean-dataset, un dataset propio que cubre datos de misiones espaciales de la ISRO, oceanografía, teledetección SAR (Sentinel-1) y fenómenos como inundaciones. El proceso de cuantización i1-GGUF aplica la técnica de imatrix (importance matrix) para calibrar las cuantizaciones de baja precisión, mejorando la calidad respecto a cuantizaciones estáticas equivalentes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base se publicó en formato safetensors (FP16) y esta versión GGUF es una conversión para inferencia local.

## Capacidades

- Generacion de texto conversacional en ingles e hindi, con instrucciones (instruct).
- Conocimiento especializado en astrofisica, cosmologia, heliofisica y exoplanetas (dataset arxiv-qa-astro-ph).
- Conocimiento en oceanografia, teledeteccion SAR (Sentinel-1), deteccion de inundaciones y datos de misiones ISRO (Chandrayaan-3, Aditya-L1, Oceansat-3) y NASA.
- Capacidad de responder preguntas tecnicas sobre datos espaciales y de observacion de la Tierra.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha confirmado modo thinking ni capacidades multimodales (vision, audio).

## Casos de uso

- Consulta de datos de misiones espaciales: un investigador puede preguntar sobre los objetivos cientificos de Chandrayaan-3 o los instrumentos de Aditya-L1, y el modelo responde con detalle basado en su entrenamiento especifico.
- Analisis de articulos de astrofisica: el modelo puede resumir o explicar conceptos de papers de astrofisica, util para estudiantes o investigadores que necesitan una primera lectura de un articulo.
- Soporte en oceanografia operacional: puede responder sobre datos de temperatura superficial del mar, clorofila o deteccion de inundaciones a partir de imagenes SAR, ayudando en tareas de analisis preliminar.
- Educacion y divulgacion cientifica: generar explicaciones accesibles sobre temas de astronomia, cosmologia y ciencias planetarias para contenido educativo.
- Procesamiento de datos de teledeteccion: asistir en la interpretacion de metadatos de productos Sentinel-1 o en la redaccion de informes tecnicos sobre fenomenos observados.
- Chatbot especializado en hindi: al soportar hindi, puede servir para atender consultas de usuarios de habla hindi sobre temas espaciales, ampliando el alcance en la India.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: segun cuantizacion, desde 2.0 GB (IQ1_S) hasta 6.4 GB (Q6_K). Para uso practico, se recomienda al menos 4 GB de VRAM con cuantizaciones Q4_K_M o superiores.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) puede ejecutar Q4_K_M o Q5_K_M. Para Q6_K se necesitan 8-10 GB. GPUs de datacenter (A100, H100) no son necesarias para este tamano.
- Cabe en GPUs de consumo: si, con cuantizaciones Q4 o inferiores en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), text-generation-webui. El formato GGUF es compatible con la mayoria de motores de inferencia local.
- Latencia y throughput: no disponibles. En una RTX 4090, un modelo 7B Q4_K_M suele generar entre 40-60 tokens/s, pero no hay datos especificos para este modelo.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoria (LLMs especializados en ciencia espacial y oceanografia) con informacion publica suficiente para una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos de astrofisica y oceanografia, puede tener un sesgo hacia terminologia y perspectivas occidentales/indias en esos campos. No se ha evaluado su comportamiento en otros dominios.
- Riesgo de alucinacion: como todo LLM, puede generar informacion incorrecta o inventada, especialmente en temas fuera de su dominio de entrenamiento. Se recomienda verificacion con fuentes primarias.
- Limitaciones de contexto: la longitud de contexto no esta documentada; probablemente sea la del modelo base (tipicamente 4096 o 8192 tokens), pero no se confirma.
- Limitaciones de idioma: solo ingles e hindi; no soporta otros idiomas de forma fiable.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero el modelo base puede tener atribuciones adicionales no documentadas.
- Caveat de produccion: al ser una cuantizacion de baja precision (especialmente IQ1/IQ2), la calidad de salida puede degradarse notablemente. Para uso profesional se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/ISRO-SpaceAI-7B-Instruct-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/Anoopsingh53/ISRO-SpaceAI-7B-Instruct
- Cuantizaciones estaticas (sin imatrix): https://huggingface.co/mradermacher/ISRO-SpaceAI-7B-Instruct-GGUF
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/Anoopsingh53/ISRO-SpaceAI-7B-Instruct
