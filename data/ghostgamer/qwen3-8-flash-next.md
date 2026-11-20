# ghostgamer/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de pesos abiertos publicado por el usuario ghostgamer en Hugging Face, distribuido bajo la licencia qwen-community-1.0. Se presenta como la primera entrega de la arquitectura que, segun la model card, sustentara la futura familia Qwen4. Es un modelo causal multimodal (texto e imagen) con 179.999.981.459 parametros totales segun los pesos en safetensors, aunque la model card desglosa 125B en el modelo de lenguaje con 6B activos, mas 51B de embeddings n-gram y 4B de MTP.

La propuesta tecnica se centra en la eficiencia del escalado: combina atencion hibrida (Gated DeltaNet mas Qwen Sparse Attention o QSA), un esquema de Gated Residual, embeddings n-gram para escalar parametros sin disparar el coste computacional y una receta de entrenamiento que mezcla los optimizadores Muon y AdamW. El objetivo declarado es reducir la latencia en contextos largos, un factor critico para cargas de trabajo agenticas.

Es relevante ahora porque anticipa decisiones arquitectonicas de la proxima generacion de modelos Qwen y porque ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. No obstante, el repositorio no registra descargas ni interacciones, y la informacion publica disponible es limitada fuera de la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con vision encoder: Gated DeltaNet + Qwen Sparse Attention (QSA), MoE, Gated Residual y N-gram Embedding |
| Parametros totales | 179.999.981.459 (125B en el LM con 6B activos + 51B de embeddings n-gram + 4B de MTP) |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido de 512 totales) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang y TokenSpeed) |

## Arquitectura y entrenamiento

El modelo emplea una disposicion de 48 capas organizada como 12 bloques de la forma 3 × (Gated DeltaNet → MoE) seguidos de 1 × (Qwen Sparse Attention → MoE). La Gated DeltaNet usa 48 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. La QSA opera con 24 cabezas de consulta y 2 de clave-valor, dimension de cabeza 256, RoPE de 64 dimensiones y un indexador MQA con 4 cabezas de consulta y 1 compartida, con un presupuesto de 512 bloques o 2048 tokens. La innovacion clave de QSA es que selecciona a nivel de micro-bloque en lugar de token individual, lo que reduce la latencia en contextos largos.

La capa MoE cuenta con 512 expertos, de los que se activan 10 enrutados mas 1 compartido, con dimension intermedia de 640. El Gated Residual dispone de 4 ramas y rango de cuello de botella 320, modulando el flujo de informacion mediante una compuerta de lectura dependiente de datos y una compuerta escalar de escritura por rama. Los embeddings n-gram (20.000.000 de bigramas y trigramas en la capa 2) permiten escalar parametros con menor coste computacional y son aptos para offloading en aceleradores con memoria limitada. La dimension oculta es 2560, el vocabulario de 248320 entradas (con padding) y se incluye una capa MTP entrenada con multiples pasos. En cuanto a la receta de entrenamiento, se aplican Muon y AdamW a categorias de pesos especificas, se elimina el warmup de tamano de batch empezando directamente en el tamano objetivo y se admiten tasas de aprendizaje mas altas. No se detalla el volumen de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante vision encoder.
- Razonamiento multi-paso y cargas de trabajo agenticas, favorecidas por la reduccion de latencia en contexto largo que aporta QSA.
- Contexto largo nativo de 262.144 tokens, extensible a 1.000.000.
- Decodificacion especulativa mediante la capa MTP (multi-token prediction).
- Compatibilidad de despliegue con Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: la ventana nativa de 262.144 tokens permite mantener historiales de conversacion muy extensos y documentacion de producto en el mismo contexto, reduciendo la perdida de informacion en dialogues largos.
- Analisis de documentos extensos con imagenes: al combinar vision encoder y contexto largo, puede procesar informes con graficos, tablas escaneadas y texto denso en una sola pasada.
- Pipelines agenticos multi-paso: la QSA a nivel de micro-bloque reduce la latencia en contextos largos, lo que resulta adecuado para agentes que acumulan observaciones y resultados de herramientas a lo largo de muchas iteraciones.
- Generacion de codigo asistida en repositorios grandes: el contexto extendido permite incluir multiples ficheros y trazas de error, aunque el soporte de tool calling no esta confirmado en la informacion disponible.
- Investigacion sobre arquitecturas eficientes: al ser un preview experimental de la arquitectura Qwen4, sirve para reproducir y evaluar Gated DeltaNet, QSA, Gated Residual y embeddings n-gram en entornos de investigacion.
- Procesamiento por lotes en infraestructura con memoria limitada: los embeddings n-gram estan disenados para offloading, lo que facilita servir el modelo en aceleradores con VRAM restringida mediante vLLM o SGLang.
- Despliegue en la nube gestionada: la model card remite a Qwen Cloud para la version Qwen3.8-Flash, con contexto de 1M por defecto y herramientas integradas, como alternativa sin mantenimiento de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de resultados con estilos CSS, pero los valores numericos no estan presentes en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 179.999.981.459 parametros totales y un repositorio de 360 GB en safetensors, la inferencia en precision completa exige agregados de memoria muy superiores a una GPU individual; el desglose de 6B parametros activos sugiere que el coste computacional por token es bajo, pero el peso completo debe residir en memoria o ser offloaded.
- GPU recomendadas: no disponible en la informacion proporcionada. Por volumen de pesos, el despliegue requeriria nodos multi-GPU (A100, H100 u equivalentes) o tecnicas de offloading.
- Compatibilidad con GPU de consumo: no disponible. El tamano total del repositorio (360 GB) impide, en principio, alojar los pesos completos en una sola GPU de consumo.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, segun la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | 179.999.981.459 | 6B | 262.144 nativo, hasta 1.000.000 | qwen-community-1.0 | Pesos abiertos en Hugging Face |
| Qwen3.8-Flash (Qwen Cloud) | no disponible | no disponible | 1.000.000 por defecto | no disponible | API gestionada |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como un preview de la arquitectura futura, no como un modelo de produccion consolidado.
- Ausencia de benchmarks publicados en la informacion disponible, lo que impide verificar su rendimiento frente a alternativas.
- Repositorio sin descargas ni interacciones y con fecha de creacion y actualizacion identicas, lo que sugiere una publicacion reciente y sin validacion comunitaria.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Soporte de tool calling y function calling no confirmado en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplicable el riesgo general de los modelos generativos.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia qwen-community-1.0: es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones concretas no se detallan en la informacion disponible.
- Requisitos de hardware muy elevados por el volumen total de pesos (360 GB), lo que limita el despliegue a infraestructura especializada o a tecnicas de offloading.
- La model card incluye enlaces a recursos (blog, informe tecnico, Qwen Cloud) que no han podido verificarse en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghostgamer/Qwen3.8-Flash-Next
- Blog de Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud, version Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Qwen Cloud: https://www.qwencloud.com
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
