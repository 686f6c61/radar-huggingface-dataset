# baselquants/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal con encoder de vision publicado como pesos abiertos, presentado por el autor de la model card como la primera entrega open-weight de la arquitectura que sustentara Qwen4. El repositorio de HuggingFace analizado (baselquants/Qwen3.8-Flash-Next) replica la model card oficial de Qwen y contiene 179 999 981 459 parametros reales en safetensors, un total de 360 GB de repositorio. El modelo combina una ruta hibrida de atencion (Gated DeltaNet mas Qwen Sparse Attention), una capa MoE de 512 expertos, un esquema de N-gram Embedding de 20 millones de entradas y un modulo MTP (multi-token prediction) de una capa, con 6 000 millones de parametros activos por token.

El problema que aborda es el coste de servir contexto largo en cargas de trabajo agenticas: en lugar de seleccionar tokens individuales para la atencion dispersa, QSA opera a nivel de micro-bloque con un presupuesto de 512 bloques (2048 tokens), lo que segun el autor reduce de forma significativa la latencia en contextos largos. La ventana de contexto es de 262 144 tokens de forma nativa y extensible hasta 1 000 000, y el modelo acepta entradas de imagen y texto (pipeline image-text-to-text).

Es relevante ahora como vista previa experimental de la linea Qwen4 y como alternativa de pesos abiertos frente a la version gestionada Qwen3.8-Flash, que se sirve a traves de Qwen Cloud con 1M de contexto por defecto y herramientas integradas. Conviene senalar que el repositorio de HuggingFace esta publicado por la cuenta baselquants, con 0 descargas y 0 likes en la fecha consultada (18 de septiembre de 2026), mientras que la model card corresponde a la publicacion de Qwen; la procedencia de los pesos deberia verificarse antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; hibrida Gated DeltaNet + Qwen Sparse Attention (QSA), MoE, Gated Residual y N-gram Embedding |
| Parametros totales | 179 999 981 459 (~180 000 M): 125 000 M en el modelo de lenguaje, 51 000 M en el N-gram embedding y 4000 M en el modulo MTP |
| Parametros activos | ~6000 M (6B) del modelo de lenguaje, mas el coste de indexado n-gram |
| Longitud de contexto | 262 144 tokens nativo; extensible hasta 1 000 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (compatible con Transformers) |
| Numero de capas | 48 |
| Dimension oculta | 2560 |
| Disposicion de capas | 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)) |
| Vocabulario (token embedding) | 248 320 (padded) |
| Entradas del N-gram embedding | 20 000 000 (bigramas y trigramas en la capa 2) |
| Expertos MoE | 512 en total; 10 enrutados + 1 compartido activados por token |
| Dimension intermedia de experto | 640 |
| Gated DeltaNet | 48 cabezas de atencion lineal para V y 16 para QK; dimension de cabeza 128 |
| Qwen Sparse Attention | 24 cabezas Q y 2 KV; dimension de cabeza 256; RoPE de 64 dimensiones; presupuesto de 512 bloques o 2048 tokens |
| Indexer de QSA | MQA con 4 cabezas de consulta y 1 cabeza de clave compartida; dimension de cabeza 128 |
| Gated Residual | 4 ramas; rango de cuello de botella 320 |
| MTP | 1 capa, entrenada con multiples pasos |
| Tamano del repositorio | 360,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con encoder de vision que sustituye la atencion completa por una ruta hibrida. Cada bloque de la disposicion interna combina tres subcapas de Gated DeltaNet (atencion lineal con puerta) con una de Qwen Sparse Attention (QSA), y todas ellas van seguidas de una capa MoE. QSA introduce una innovacion concreta frente a la atencion dispersa convencional: en vez de seleccionar tokens individuales, opera a nivel de micro-bloque con un presupuesto de 512 bloques o 2048 tokens, gestionado por un indexer con estructura MQA de 4 cabezas de consulta y 1 cabeza de clave compartida. Segun el autor, esto reduce de forma notable la latencia en contexto largo, un punto critico para cargas agenticas.

Sobre esa columna vertebral se anaden tres mecanismos adicionales. El Gated Residual modula el flujo de informacion en flujos residuales ensanchados mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta escalar de escritura por rama, con 4 ramas y rango de cuello de botella 320, buscando mayor expresividad sin comprometer la estabilidad del entrenamiento. El N-gram Embedding indexa bigramas y trigramas en la capa 2 con 20 millones de entradas, lo que anade 51 000 M de parametros escalables con menos computo y mas facilidad de offload que una capa MoE. Por ultimo, el modulo MTP de una capa, entrenado con multiples pasos, habilita decodificacion especulativa multi-token.

En cuanto al entrenamiento, la model card indica dos etapas (pre-entrenamiento y post-entrenamiento) y una receta especifica: Muon y AdamW se aplican a categorias de pesos concretas, y guiados por leyes de escalado reajustadas se elimina el warmup tradicional de tamano de lote, arrancando directamente en el lote objetivo y reduciendo el numero total de pasos del optimizador, con soporte de tasas de aprendizaje mas altas. No se detalla en la informacion disponible el numero de tokens, la composicion del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: la etiqueta del repositorio incluye `conversational`, y la model card describe un modelo de lenguaje causal post-entrenado.
- Entrada multimodal de imagen y texto: el pipeline declarado es `image-text-to-text` y el modelo incorpora un encoder de vision.
- Contexto largo: 262 144 tokens nativos, extensibles hasta 1 000 000, orientado explicitamente a cargas agenticas que dominan el uso real segun el autor.
- Decodificacion especulativa nativa: el modulo MTP de 1 capa entrenado con multiples pasos esta pensado para predecir varios tokens y acelerar la inferencia.
- Escalado de parametros eficiente en memoria: el N-gram Embedding permite escalar parametros con menos computo y es mas apto para offload que el MoE, util en aceleradores con memoria limitada.
- Tool calling / function calling: no documentado para esta publicacion de pesos abiertos; la model card indica que la version oficial Qwen3.8-Flash en Qwen Cloud incluye herramientas integradas propias.
- Capacidades agenticas de multiples pasos: mencionadas de forma cualitativa como motor del diseno de QSA, sin datos de rendimiento asociados en la informacion disponible.
- Capacidades multilingues: no disponible.
- Capacidades especificas de codigo, matematicas o razonamiento: no desglosadas en la informacion disponible.
- Modo de pensamiento (thinking) o audio: no disponible.

## Casos de uso

- Atencion al cliente automatizada con historial largo: el modelo puede mantener conversaciones multi-turno apoyandose en sus 262 144 tokens de contexto nativo, lo que permite adjuntar el historial completo del cliente, transcripciones y documentacion de producto sin truncado agresivo.
- Analisis de documentos extensos y contratos: con contexto extensible a 1M de tokens, es viable procesar expedientes completos, informes anuales o corpus normativos en una sola pasada, extrayendo resumenes y obligaciones concretas.
- Automatizacion de flujos agenticos en back-office: el diseno de QSA esta orientado a reducir latencia en contexto largo, escenario tipico de agentes que encadenan decenas de pasos con estado acumulado.
- Procesamiento de documentos con imagen y texto: al aceptar entradas image-text-to-text, puede extraer informacion de facturas escaneadas, formularios, diagramas tecnicos o capturas de pantalla combinando el contenido visual con instrucciones textuales.
- Asistencia sobre base de codigo grande: con contexto largo se puede cargar un repositorio o varios modulos completos y plantear tareas de revision, explicacion o refactorizacion, siempre que se valide la capacidad real de codigo con pruebas propias al no estar documentada.
- Generacion asistida con decodificacion especulativa: el modulo MTP permite desplegar decodificacion multi-token para reducir la latencia por token en servicios de generacion de alto volumen.
- Servicio de inferencia compatible con el ecosistema existente: al ser compatible con Transformers, vLLM, SGLang y TokenSpeed, puede integrarse en infraestructura de serving ya desplegada sin reescribir el stack.
- Investigacion sobre arquitecturas hibridas: la combinacion de atencion lineal con puerta, atencion dispersa por micro-bloques, N-gram Embedding y Gated Residual lo convierte en una plataforma para estudiar alternativas al transformer denso con MoE.

## Benchmarks y rendimiento

La model card incluye una seccion titulada "Benchmark Results", pero el contenido con las cifras no esta presente en la informacion proporcionada (aparece truncado). Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparativas numericas con otros modelos, y no deben asumirse valores por la posicion del modelo en la familia Qwen.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros (179 999 981 459) y del tamano del repositorio (360 GB); la model card no publica requisitos oficiales.

- Pesos en bf16/fp16: aproximadamente 360 GB, coherente con los 360 GB del repositorio. Requiere al menos 5 GPU de 80 GB solo para los pesos, por lo que se recomienda 8 × H100/H200 de 80 GB para dejar margen a cache KV y activaciones.
- Pesos en fp8/int8: alrededor de 180 GB, es decir, un minimo de 3 GPU de 80 GB.
- Pesos en 4 bits: del orden de 90-100 GB, lo que sigue exigiendo 2 GPU de 80 GB o un unico nodo con offload parcial a memoria del sistema.
- GPU recomendadas: H100, H200 y A100 de 80 GB para despliegue en fp8 o bf16; B200 si se busca mayor ancho de banda de memoria para un MoE con 512 expertos.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) en ninguna cuantizacion razonable del conjunto completo. Un arranque con cuantizacion agresiva y offload del N-gram Embedding a RAM es teoricamente posible, pero la latencia resultante lo hace poco practico.
- Consideracion especifica del N-gram Embedding: sus 51 000 M de parametros estan disenados para ser mas aptos al offload que una capa MoE, lo que permite aliviar memoria de acelerador a cambio de ancho de banda de host.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, segun la model card. Tambien existe la alternativa gestionada Qwen Cloud (Qwen3.8-Flash) sin mantenimiento de infraestructura.
- Latencia y throughput: no disponible. Cualitativamente, los 6000 M de parametros activos por token reducen el computo por token respecto a un denso de 180 000 M, mientras que el coste de memoria viene dominado por el conjunto completo de expertos.

## Comparativa con modelos similares

La informacion disponible solo documenta una variante directamente comparable dentro de la misma familia. No se proporcionan datos de modelos de terceros (parametros, contexto, benchmarks o licencia) que permitan una comparacion rigurosa, por lo que esos campos se marcan como no disponibles.

| Modelo | Parametros | Parametros activos | Contexto | Disponibilidad | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | ~180 000 M (125 000 M LM + 51 000 M n-gram + 4000 M MTP) | ~6000 M | 262 144 nativo, hasta 1 000 000 | Pesos abiertos en HuggingFace (repo de terceros, 0 descargas en la fecha consultada) | qwen-community-1.0 |
| Qwen3.8-Flash | Derivado de Qwen3.8-Flash-Next, sin cifra publicada en la informacion disponible | no disponible | 1 000 000 por defecto | Servicio gestionado en Qwen Cloud, con herramientas integradas oficiales | no disponible (servicio) |
| Otros modelos comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Procedencia del repositorio: la model card corresponde a la publicacion de Qwen, pero el repositorio de HuggingFace analizado pertenece a la cuenta baselquants, con 0 descargas y 0 likes. Debe verificarse la integridad y el origen de los pesos antes de usarlos.
- Estado experimental: la propia model card lo describe como una vista previa experimental de la arquitectura que sustentara Qwen4, lo que implica un riesgo mayor de comportamiento no documentado o cambiante.
- Idiomas soportados: no disponibles. No puede asumirse un rendimiento multilingue homogeneo, y en particular no hay confirmacion de calidad en castellano.
- Capacidades no documentadas: no hay datos sobre generacion de codigo, matematicas, tool calling, uso en agentes con funciones externas ni modo de razonamiento. Cualquier despliegue en esos escenarios requiere evaluacion previa propia.
- Benchmarks ausentes: no se han podido recuperar las cifras de la seccion de benchmarks, por lo que toda decision basada en calidad comparativa carece de respaldo en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se documentan medidas especificas de mitigacion en la informacion disponible.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Coste de despliegue: 180 000 M de parametros y 360 GB de pesos implican requisitos de hardware muy por encima de una GPU de consumo, con el coste economico asociado.
- Coste de memoria del MoE: con 512 expertos, el conjunto completo debe residir en memoria o ser offloaded; un routing ineficiente puede degradar el throughput.
- Licencia: qwen-community-1.0, con `license: other` en el repositorio. Es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que las condiciones de la familia Qwen Community pueden incluir restricciones y obligaciones de atribucion.
- Fecha y trazabilidad: el repositorio esta fechado el 18 de septiembre de 2026 y no consta actualizacion posterior en la informacion consultada.
- Resultados de la busqueda web: las consultas realizadas devolvieron unicamente paginas de soporte de Microsoft sin relacion con el modelo, por lo que no se ha podido contrastar informacion externa adicional.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/baselquants/Qwen3.8-Flash-Next
- Licencia del repositorio: https://huggingface.co/baselquants/Qwen3.8-Flash-Next/blob/main/LICENSE
- Blog oficial de Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub de la familia: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Ficha de Qwen3.8-Flash en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-flash
