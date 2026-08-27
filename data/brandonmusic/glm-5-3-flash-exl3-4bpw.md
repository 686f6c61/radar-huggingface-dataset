# brandonmusic/GLM-5.3-Flash-EXL3-4bpw

## Resumen

GLM-5.3-Flash-EXL3-4bpw es un checkpoint cuantizado del modelo GLM-5.3-Flash, desarrollado por el usuario brandonmusic a partir del lanzamiento oficial de zai-org (Zhipu AI). Se trata de una cuantización EXL3/TR3 de 4 bits aplicada exclusivamente a los expertos enrutados del modelo, incluida la capa MTP45, mientras que los tensores no enrutados conservan su dtype nativo (BF16/FP32). El modelo resultante tiene 87.811.157.118 parámetros y un tamaño de repositorio de 175,7 GB.

La relevancia de esta cuantización radica en que permite servir un modelo de casi 88 mil millones de parámetros en dos GPU RTX PRO 6000 Blackwell (SM120) con una ventana de contexto máxima de 499.968 tokens, manteniendo una fidelidad muy alta respecto al teacher BF16: la divergencia KLD media entre el modelo cuantizado y el original es de 0,02455 en cinco ejecuciones frías, y de 0,02275 en la medición de runtime TP2. No es una compatibilidad con vLLM o ExLlamaV3 estándar; requiere un runtime personalizado incluido en el propio repositorio o la imagen Docker dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 34 capas lineales + 11 capas de atención dispersa (DeepSeek sparse-attention), NoPE MLA, capa MTP (multi-token prediction) |
| Parametros totales | 87.811.157.118 |
| Parametros activos | no disponible |
| Longitud de contexto | 499.968 tokens (máximo, en modo diario con NVFP4 MLA KV) |
| Tipos de cuantizacion | EXL3/TR3 MCG 4-bit para expertos enrutados; tensores no enrutados en BF16/FP32 nativo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer híbrido de 45 capas que alterna tres capas lineales y una capa de atención dispersa, siguiendo el patrón oficial: 34 capas lineales y 11 capas de atención dispersa. Las capas dispersas utilizan IndexPool-4 con top-k 2.048, y la atención emplea NoPE MLA (Multi-head Latent Attention sin codificación posicional). El modelo incorpora además una capa de predicción multi-token (MTP) que permite generar varios tokens por paso.

La cuantización aquí presentada aplica EXL3/TR3 MCG de 4 bits a todos los expertos enrutados, incluida la capa MTP45, mientras que los tensores no enrutados (attention, norm, embeddings, etc.) se mantienen en su dtype original. No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. La fidelidad se validó mediante la divergencia KLD entre los logits del teacher BF16 y los del checkpoint cuantizado, con un umbral de aceptación de KLD media inferior a 0,06.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo GLM-5.3-Flash, que incluyen generación de texto, razonamiento, código y matemáticas, aunque no se detallan en la información proporcionada.
- Contexto largo: soporta hasta 499.968 tokens en modo diario, lo que permite procesar documentos extensos o conversaciones de muchas vueltas.
- Predicción multi-token (MTP): la capa MTP permite generar varios tokens por paso, reduciendo la latencia de decodificación.
- Atención híbrida: combina atención lineal y atención dispersa (DeepSeek sparse-attention) para escalar a contextos muy largos con coste subcuadrático.
- Tool calling y agentes: no disponible en la información proporcionada.
- Multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat con contexto muy largo: con una ventana de 499.968 tokens, el modelo puede mantener conversaciones de cientos de miles de tokens, adecuado para asistentes que necesitan recordar todo el historial de una sesión prolongada.
- Análisis de documentos extensos: procesamiento de libros técnicos, expedientes legales o informes de investigación completos en una sola pasada, sin necesidad de dividir el texto en fragmentos.
- Generación de código en repositorios grandes: el contexto amplio permite alimentar al modelo con el contenido completo de un repositorio de tamaño medio para tareas de refactorización o generación de código coherente con el estilo existente.
- Investigación en cuantización: el checkpoint sirve como referencia para estudiar el impacto de la cuantización EXL3 4-bit en la fidelidad de salida, gracias a las métricas KLD publicadas y al dataset de logits del teacher.
- Despliegue en hardware profesional: pensado para entornos con dos GPU RTX PRO 6000 Blackwell, permite ejecutar un modelo de 87B parámetros en configuraciones de estación de trabajo de gama alta sin recurrir a clústeres.
- Evaluación de calidad de cuantización: los datos de KLD y los receipts de verificación permiten auditar la pérdida de precisión entre el modelo cuantizado y el BF16 original, útil para equipos que necesitan garantizar la integridad de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son las métricas de fidelidad KLD frente al teacher BF16, que se resumen a continuación.

| Metrica | Valor |
|---|---|
| KLD media (5 ejecuciones frías, 51.175 posiciones) | 0,024554564250 |
| KLD runtime TP2 (ventana de 2.047 posiciones) | 0,022750847878 |
| Desviación estándar poblacional (5 ejecuciones) | 0 |
| Umbral de aceptación (KLD media) | < 0,06 |

## Requisitos de hardware

- Hardware cualificado: 2x RTX PRO 6000 Blackwell (SM120) en configuración TP2 (tensor parallelism de 2).
- VRAM estimada: no disponible; el repositorio ocupa 175,7 GB en disco, pero el consumo en memoria durante inferencia no se especifica.
- GPU compatibles: únicamente se ha validado en RTX PRO 6000 Blackwell (SM120). No se indica compatibilidad con otras GPU.
- Opciones de despliegue:
  - Imagen Docker `verdictai/glm53-flash-exl3-k4` (versión `r19-sm120-tp2-v37`) con overlay vLLM/B12X para el modo diario.
  - Runtime Transformers personalizado (Transformers 5.16.1 + ExLlamaV3 commit `c5d9c657966ffeeaa9353f0cc899f18629da4a13`) para verificación y calificación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la información proporcionada. La única referencia comparable es el propio modelo BF16 original (zai-org/GLM-5.3-Flash-BF16), del cual se deriva esta cuantización. La diferencia principal es la reducción de memoria en los expertos enrutados (4-bit frente a BF16) a costa de una pequeña pérdida de fidelidad (KLD < 0,025). No se han encontrado datos de otros checkpoints cuantizados similares (por ejemplo, versiones GGUF o AWQ) en las fuentes consultadas.

## Limitaciones y advertencias

- No es compatible con vLLM estándar ni con ExLlamaV3 estándar: requiere el runtime personalizado incluido en el repositorio o la imagen Docker específica para SM120.
- La cuantización solo afecta a los expertos enrutados; los tensores no enrutados permanecen en BF16/FP32, lo que limita la reducción total de memoria.
- La licencia no está disponible, por lo que se desconocen las restricciones de uso comercial y redistribución.
- No se han publicado benchmarks de tareas (razonamiento, código, matemáticas), por lo que no es posible evaluar el rendimiento funcional más allá de la fidelidad KLD.
- El diagnóstico de error absoluto de logits decodificados sigue fallando, según se indica en los receipts; la calificación se basa en KLD, rank-identical output y censo de tensores, no en error absoluto.
- Requiere hardware específico (SM120) para el modo diario; en otras GPU no se garantiza el funcionamiento.
- El modelo base GLM-5.3-Flash puede presentar sesgos y alucinaciones inherentes a los LLM, aunque no se documentan en esta información.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/brandonmusic/GLM-5.3-Flash-EXL3-4bpw
- Código y receipts en GitHub: https://github.com/brandonmmusic-max/glm-5.3-flash-exl3-4bpw
- Dataset de logits del teacher BF16: https://huggingface.co/datasets/brandonmusic/GLM-5.3-Flash-BF16-Teacher-Logits
- Imagen Docker (Docker Hub): https://hub.docker.com/r/verdictai/glm53-flash-exl3-k4
- Documentación de GLM-5.3-Flash en Unsloth: https://unsloth.ai/docs/models/glm-5.3
