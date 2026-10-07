# AutomatosX/AX-Unlimited-OCR-3B-MoE-MLX-AXQ-MXFP8

## Resumen

AX-Unlimited-OCR-3B-MoE-MLX-AXQ-MXFP8 es una distribución cuantizada del modelo multimodal `baidu/Unlimited-OCR`, publicada por AutomatosX para su ejecución en Apple Silicon mediante MLX y MLX-VLM. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos en formato MLX con cuantización AXQuant (AXQ) en modo MXFP8 para las partes de lenguaje, manteniendo en BF16 los codificadores de visión, el proyector, las normas, los routers MoE y la cabeza del modelo de lenguaje. El repositorio ocupa 4,0 GB y declara 3.336.106.240 parámetros totales, con una media medida de 9,57 bits por peso (BPW).

El modelo base es un sistema image-text-to-text con arquitectura de mezcla de expertos (MoE) y visión dual compuesta por CLIP y SAM. La conversión se realizó a partir de `tokimoa/unlimited-ocr-mlx-bf16`, un remaster comunitario en BF16 que AutomatosX verificó byte a byte contra los pesos originales de Baidu (592 comparaciones directas, 6 de convolución transpuesta y 33 de expertos empaquetados, sin diferencias). El pipeline empleado fue AXQuant 1.9.0 con plan manual y `convert --q-mode mxfp8 --allow-unmeasured`.

Su relevancia actual es acotada y conviene ser explícito: la propia model card lo etiqueta como artefacto de **desarrollo**, sin certificación de release y **sin ninguna afirmación de precisión OCR ni de puntuaciones en benchmarks de documentos**. Su interés real es servir como material de prueba para pipelines de OCR local en Mac con memoria unificada, no como sustituto validado de un modelo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text con mezcla de expertos (MoE) y visión dual CLIP + SAM; el repositorio no detalla el número de expertos ni la dimensión oculta |
| Parámetros totales | 3.336.106.240 (≈3,34 mil millones), dato real de safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP8 (grupo 32) en expertos de lenguaje, atención, MLP y embeddings; BF16 preservado en visión, proyector, normas, routers MoE y LM head; media medida de 9,57 BPW; modo de reempaquetado físico, no método de planner medido |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`, `mlx-vlm`) |
| Tamaño del repositorio | 4,0 GB |
| Pipeline declarado | image-text-to-text |
| Revisiones base | `baidu/Unlimited-OCR` @ `07dea832e22aefee32ad281d4b80551282e1c168`; `tokimoa/unlimited-ocr-mlx-bf16` @ `cd57bdd8d4efa47a2e49c2123550cbd698ff529a` |

## Arquitectura y entrenamiento

Este repositorio no documenta ningún proceso de entrenamiento propio: es una conversión de pesos. La model card indica que los expertos de lenguaje, las capas de atención, las MLP y los embeddings se almacenan en MXFP8 con grupo de 32, mientras que los dos codificadores de visión (CLIP y SAM), el proyector, las normas, los routers MoE y el LM head se conservan en BF16. Es decir, la cuantización afecta a la torre de lenguaje, pero no a la torre de visión ni a los componentes de enrutamiento, lo que implica que la ruta visual mantiene precisión completa y que el ahorro de memoria procede casi en su totalidad del stack lingüístico.

El proceso se ejecutó con AXQuant 1.9.0 en modo `plan-manual` y `convert --q-mode mxfp8 --allow-unmeasured`. La model card aclara de forma explícita que MXFP8 es aquí un modo de reempaquetado físico de asignaciones de 8 bits sin refinar, no un método medido del planner. La verificación de carga («load smoke») confirma que `mlx-vlm` carga 616 módulos, pero el autor señala que esa auditoría remota de formato no otorga un perfil de runtime oMLX/MTPLX ni constituye una afirmación de carga y generación correctas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación image-text-to-text: el pipeline declarado es `image-text-to-text`, orientado a OCR según el tag `unlimited-ocr`.
- Reconocimiento óptico de caracteres sobre imágenes, en línea con el modelo base de Baidu (la precisión concreta no está afirmada por el autor).
- Visión dual con codificadores CLIP y SAM, ambos preservados en BF16, lo que en principio favorece la localización y segmentación de regiones de texto.
- Modo conversacional (tag `conversational`), es decir, admite interacción multi-turno sobre la entrada visual.
- Ejecución nativa en Apple Silicon mediante MLX y MLX-VLM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modos especiales (thinking, audio u otros): no disponible.

## Casos de uso

- Digitalización de archivos escaneados en local: al ejecutarse sobre MLX en un Mac, permite extraer texto de imágenes y PDFs sin enviar documentos a servicios externos, algo relevante para material sujeto a confidencialidad. La ausencia de validación de precisión obliga a verificar la salida antes de darla por buena.
- Extracción de campos en facturas y albaranes: el modelo recibe la imagen del documento y devuelve el texto reconocido, que después se parsea con expresiones regulares o un LLM secundario. Es adecuado para prototipos internos, no para contabilidad en producción sin validación previa.
- Preprocesado para pipelines RAG sobre documentación: OCR de páginas escaneadas para alimentar un índice vectorial cuando el PDF no contiene capa de texto. El modelo actúa como primer eslabón del pipeline, y los errores de reconocimiento se propagan al índice, por lo que conviene auditar una muestra.
- Procesamiento por lotes en estaciones de trabajo Mac: un parque de Mac Studio o MacBook Pro con memoria unificada puede ejecutar la inferencia sin GPU dedicada ni CUDA, lo que reduce el coste de infraestructura para volúmenes moderados.
- Accesibilidad: convertir capturas, carteles o documentos fotografiados en texto legible para lectores de pantalla, ejecutándose en el propio dispositivo sin conexión.
- Evaluación y desarrollo de tooling MLX: dado que es un artefacto de desarrollo con auditoría de formato publicada (`runtime_audit.json`), sirve para probar cargadores MLX-VLM, validar reempaquetados MXFP8 y comparar el comportamiento del stack de lenguaje en 8 bits frente al remaster BF16.
- Análisis documental con contexto visual: al conservar CLIP y SAM en BF16, es un candidato razonable para tareas donde importa localizar regiones (tablas, sellos, firmas) además de transcribir, siempre que se valide el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es explícita al respecto: la fila «OCR accuracy / document-bench scores» figura con estado **Not claimed**, y la fila «Certified release» con **No**. Tampoco se aportan métricas de latencia o throughput.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 4,0 GB, coherente con 3,336 mil millones de parámetros a 9,57 BPW.
- Plataforma: MLX requiere Apple Silicon (serie M). No hay variante CUDA, GGUF ni compatible con vLLM o TGI en la información proporcionada.
- Memoria unificada estimada para inferencia: por encima de los 4 GB de pesos hay que sumar activaciones y las cachés de los codificadores CLIP y SAM en BF16; como referencia prudente, un equipo con 16 GB de memoria unificada ofrece margen, y 8 GB es el mínimo teórico del que no hay confirmación por parte del autor (estimación propia, no dato publicado).
- GPU recomendadas: no disponible. El autor no publica perfiles de rendimiento; el único dato de ejecución es que `mlx-vlm` carga 616 módulos.
- Compatibilidad con GPU de consumo: aplicable a chips Apple Silicon de consumo (M1/M2/M3/M4 y variantes Pro, Max, Ultra), sin datos de latencia publicados.
- Opciones de despliegue: `mlx-vlm` (confirmado por la model card). No se documentan Ollama, llama.cpp, vLLM, TGI ni SGLang para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / cuantización | Precisión de visión | Licencia | Notas |
|---|---|---|---|---|---|
| AutomatosX/AX-Unlimited-OCR-3B-MoE-MLX-AXQ-MXFP8 | 3,34 mil millones (activos no disponibles) | MLX, safetensors, MXFP8 + BF16 | CLIP + SAM preservados en BF16 | MIT | Artefacto de desarrollo; precisión OCR no afirmada |
| baidu/Unlimited-OCR | no disponible en la información proporcionada | Pesos originales | CLIP + SAM | MIT | Modelo base de referencia |
| tokimoa/unlimited-ocr-mlx-bf16 | no disponible en la información proporcionada | MLX, BF16 | CLIP + SAM | MIT (heredada del base) | Remaster comunitario verificado byte a byte; mayor huella de memoria al no cuantizar el stack de lenguaje |

No se dispone de datos para comparar con alternativas de OCR de otros fabricantes, ni de benchmarks que permitan ordenar estos tres artefactos por precisión.

## Limitaciones y advertencias

- La model card indica de forma explícita que no se reclama precisión OCR ni puntuaciones en benchmarks de documentos. Cualquier uso en producción exige una evaluación propia.
- No es un release certificado («Certified release: No»). El autor lo clasifica como cuantización de desarrollo basada en priors de arquitectura.
- No hay optimización de visión declarada («Vision optimization: No»): los codificadores CLIP y SAM se mantienen en BF16, por lo que el ahorro de memoria solo aplica al stack de lenguaje.
- MXFP8 se describe como modo de reempaquetado físico de asignaciones de 8 bits sin refinar, no como método medido del planner; el propio autor advierte que la auditoría de formato remota no constituye una afirmación de calidad, exactitud MTP, velocidad ni certificación.
- Riesgo de alucinación: inherente a los modelos multimodal de generación de texto; no hay información específica sobre tasas de error en este artefacto.
- Idioma y cobertura multilingüe: no disponibles. No se declaran idiomas soportados, lo que impide garantizar un rendimiento concreto en castellano.
- Longitud de contexto y número de parámetros activos: no disponibles, lo que dificulta planificar despliegues con documentos largos.
- Restricción de plataforma: MLX solo se ejecuta en Apple Silicon. No hay ruta documentada para CUDA.
- Licencia MIT: permite uso comercial y modificación, pero se distribuye sin garantías. Al derivar de `baidu/Unlimited-OCR` (MIT) y de un remaster comunitario, conviene conservar la atribución a Baidu, a tokimoa y a AXQuant.
- Adopción muy limitada: 41 descargas y 0 «likes» en el momento de la consulta, sin validación independiente publicada.
- Fechas de creación y actualización del repositorio (2026-10-03 y 2026-10-06) proceden de los metadatos; la auditoría de formato está fechada el 2026-10-06 y la evidencia histórica queda ligada a su revisión original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Unlimited-OCR-3B-MoE-MLX-AXQ-MXFP8
- Auditoría de formato declarada en el repositorio: `runtime_audit.json` (ruta relativa dentro del repositorio del modelo)
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR (revisión `07dea832e22aefee32ad281d4b80551282e1c168`)
- Remaster MLX en BF16 utilizado como origen de la conversión: https://huggingface.co/tokimoa/unlimited-ocr-mlx-bf16 (revisión `cd57bdd8d4efa47a2e49c2123550cbd698ff529a`)
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.
