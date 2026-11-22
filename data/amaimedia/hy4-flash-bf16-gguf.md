# AMAImedia/Hy4-Flash-BF16-GGUF

## Resumen

Hy4-Flash es un modelo de lenguaje multimodal desarrollado por Tencent Hunyuan, publicado originalmente como `tencent/Hy4-flash`. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con 220.000 millones de parametros totales y solo 12.000 millones activos por token, disenado para aceptar entradas de texto e imagen y generar texto, con una ventana de contexto de hasta 1.048.576 tokens (1M). La ficha que nos ocupa, `AMAImedia/Hy4-Flash-BF16-GGUF`, es una conversion a GGUF en BF16 realizada por el usuario AMAImedia a partir del modelo base de Tencent.

El modelo incorpora varias innovaciones arquitectonicas respecto a su predecesor Hy4: atencion hibrida que intercala atencion dispersa (IndexPool) y sliding-window attention en proporcion 1:3, LatentMoE con expertos en espacio latente de baja dimension (16 de 512 expertos enrutados por token mas un experto compartido), y embeddings N-gram (Engram) con representaciones de bigramas y trigramas recuperadas mediante hash multibyte. Ademas incluye un drafter de 5 capas (DFly2, 0.85B parametros) para decodificacion especulativa de contexto largo.

La relevancia de esta publicacion radica en su eficiencia: con solo 12B parametros activos por token ofrece capacidades multimodales y contexto de 1M tokens, lo que lo posiciona como una alternativa de coste reducido frente a modelos densos de tamano comparable. La version GGUF de AMAImedia facilita su despliegue en entornos de inferencia local y frameworks compatibles con este formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida (IndexPool + SWA), LatentMoE y embeddings Engram |
| Parametros totales | 220.251.201.958 (220,25B) |
| Parametros activos | 11,3B texto + 0,43B vision por token |
| Parametros del backbone (sin Engram, ViT ni DFly2) | 155,5B |
| Parametros Engram | 63,5B |
| Parametros ViT | 0,43B |
| Parametros DFly2 (drafter) | 0,85B |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16 y GGUF (repositorio etiquetado como imatrix) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | tencent-hy-license (Tencent Hy License) |
| Formato de pesos | safetensors, GGUF |
| Capas del backbone | 42 (1 densa + 41 MoE) |
| Hidden size | 3.072 |
| Tamano del vocabulario | 12 (dato truncado en la model card) |
| Tamano del repositorio | 609,9 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El backbone linguistico de Hy4-Flash consta de 42 capas: una capa densa feed-forward y 41 capas MoE, con conexiones hiperbolicas de identidad (iHC) que soportan el flujo de informacion entre capas. La atencion es hibrida, intercalando atencion dispersa (IndexPool) y sliding-window attention (SWA) en una proporcion 1:3. El modulo LatentMoE opera con expertos enrutados en un espacio latente de menor dimension: cada token activa 16 de 512 expertos enrutados, ademas de un experto compartido. Los embeddings Engram anaden representaciones aprendidas de bigramas y trigramas recuperadas mediante busquedas hash multi-cabeza.

La componente multimodal se compone de un codificador visual adaptado de SigLIP2-So400m-Patch16-Res512, conectado al backbone mediante un proyector MLP. El modelo incluye un drafter DFly2 de 5 capas y 0,85B parametros que reutiliza la cache KV y los indices dispersos del modelo objetivo para realizar decodificacion especulativa de contexto largo con coste constante y bajo. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en chino e ingles.
- Procesamiento de imagenes como entrada (image-text-to-text) mediante el codificador SigLIP2 y el proyector MLP.
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificacion especulativa integrada mediante el drafter DFly2, que acelera la generacion en contextos largos.
- Capacidades de instruccion (etiqueta `instruct` en el repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a chino e ingles segun los metadatos del repositorio.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos con imagenes: el modelo puede procesar contratos, informes o articulos cientificos de hasta 1M tokens junto con figuras y diagramas, extrayendo conclusiones y resumiendo secciones concretas gracias a su ventana de contexto.
- Atencion al cliente multimodal: gestion de conversaciones multi-turno donde el usuario adjunta capturas de pantalla o fotografias de productos, manteniendo el historial completo dentro del contexto de 1M tokens.
- Extraccion de informacion de facturas y formularios escaneados: la combinacion de entrada de imagen y generacion de texto permite transcribir y estructurar datos de documentos visuales en ingles o chino.
- Generacion asistida de codigo y documentacion tecnica: con 12B parametros activos por token, el coste de inferencia es contenido para tareas de generacion de texto tecnico en ingles.
- Traduccion chino-ingles de material multimodal: el modelo puede traducir texto incrustado en imagenes o acompanar la traduccion de contenido visual, aprovechando su soporte bilingue nativo.
- Procesamiento por lotes de corpus largos: la decodificacion especulativa con DFly2 y el contexto de 1M tokens permiten procesar grandes volumenes de texto en pipelines de analisis sin fragmentar los documentos.
- Investigacion sobre arquitecturas MoE eficientes: el repositorio GGUF en BF16 sirve como referencia para estudiar el comportamiento de LatentMoE, Engram y atencion hibrida en entornos de inferencia estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona una seccion de resultados de benchmarks y una evaluacion ciega de usuarios, pero los valores numericos no estan incluidos en la informacion proporcionada.

## Requisitos de hardware

- El repositorio GGUF en BF16 ocupa 609,9 GB, por lo que la inferencia en precision completa requiere un nodo con multiples GPU de alta capacidad (varios A100 80GB o H100 80GB) o almacenamiento en disco con offloading.
- Con 220B parametros totales y 12B activos, el modelo no cabe en una GPU de consumo individual en BF16; se requiere cuantizacion adicional para reducir el footprint.
- El autor de la conversion indica que su hardware local (RTX 3060 Laptop de 6 GB, 64 GB DDR5) solo es adecuado para trabajo de clase 0,6-35B en RAM, y que los modelos de 9B+ requieren alquiler de H200/Blackwell, lo que sugiere que esta conversion no esta pensada para ejecucion local en equipos de consumo.
- Opciones de despliegue mencionadas en la model card: Transformers, API compatible con OpenAI, vLLM, SGLang y DFly2 para decodificacion especulativa.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Idiomas limitados a chino e ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- La licencia tencent-hy-license impone restricciones que deben revisarse antes de cualquier uso comercial; el enlace a la licencia esta en el repositorio del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion comunitaria de la conversion.
- La model card original contiene metadatos truncados (por ejemplo, el tamano del vocabulario aparece como "12"), lo que impide verificar algunos parametros.
- El tamano de 609,9 GB del repositorio hace inviable su uso en entornos con almacenamiento limitado.
- No se dispone de informacion sobre soporte de tool calling, agentes o modos de razonamiento extendido, lo que limita su evaluacion para pipelines agenticos.
- Al ser una conversion de terceros (AMAImedia) y no una publicacion oficial de Tencent, la integridad y fidelidad de los pesos cuantizados no estan garantizadas por el autor original.

## Enlaces

- Repositorio Hugging Face de la conversion: https://huggingface.co/AMAImedia/Hy4-flash-GGUF (segun el ID proporcionado: https://huggingface.co/AMAImedia/Hy4-Flash-BF16-GGUF)
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy4-flash/blob/main/README_CN.md
- Web oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- GGUF alternativo: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
- Web de AMAImedia: https://www.amaimedia.com
- X (Twitter) de AMAImedia: https://x.com/AMAImediacom
- LinkedIn de Ilia Bolotnikov: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram: https://t.me/djbionicl
