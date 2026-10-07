# AutomatosX/AX-Qwen3-Embedding-4B-MLX-AXQ-MXFP4

## Resumen

AX-Qwen3-Embedding-4B-MLX-AXQ-MXFP4 es un checkpoint de embeddings cuantizado en formato MLX, desarrollado por AutomatosX a partir del modelo base Qwen/Qwen3-Embedding-4B (revision 5cf2132abc99cad020ac570b19d031efec650f2b) de Alibaba Qwen. El paquete aplica la tecnica propietaria AXQuant (AXQ) en su clase de presupuesto MXFP4, una cuantizacion de precision mixta que mantiene ciertos tensores protegidos (embeddings, normalizaciones) en mayor precision mientras comprime el resto del camino de texto. El resultado declarado es un BPW medido de 4,6610 y un tamano de pesos safetensors de 2,34 GB, frente a los aproximadamente 8 GB del original en BF16.

El modelo conserva los 4.021.774.336 parametros logicos (4,02B) del original y esta pensado especificamente para ejecucion en Apple Silicon mediante MLX-LM, con una longitud de contexto configurada de 40.960 tokens. La tarea declarada es feature-extraction: genera representaciones vectoriales para similitud semantica y recuperacion, no generacion de texto en sentido estricto. Su relevancia actual radica en que permite desplegar un modelo de embeddings de 4B en un portatil con memoria unificada, algo inviable con el original completo.

Es importante senalar que el propio autor etiqueta este paquete como "development evidence, not a certified AXQuant release": aporta registros de conversion e integridad del artefacto, pero no publica evidencias de calidad, contexto largo, velocidad de kernel ni exactitud MTP medidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (dense), camino de texto optimizado |
| Parametros totales | 4.021.774.336 (4,02B logicos) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens configurados (limites practicos segun memoria unificada) |
| Tipos de cuantizacion | AXQuant MXFP4: 4bit (90,34 %), 8bit (9,65 %), bf16 (0,00 %); metodos affine, bf16, mxfp4; grupos 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX Safetensors (2,34 GB); no incluye PyTorch ni GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura densa Qwen3ForCausalLM del original, pero el checkpoint solo incluye el camino de texto optimizado para embeddings. No es un transformer con mezcla de expertos, ni SSM, ni hibrido: es un transformer denso. La intervencion de AutomatosX no es un reentrenamiento, sino una conversion con cuantizacion de precision mixta aplicada directamente sobre el modelo fuente en BF16. Segun el registro del autor, el planificador uso "architecture_prior" como evidencia de planificacion, sin calibracion (calibration: none), y se completaron 253 de 253 conversiones de modulo sin fallbacks.

La distribucion de precision sigue el principio AXQ: el nombre del paquete (MXFP4) describe una clase de presupuesto de almacenamiento, no una precision uniforme. Los tensores protegidos (embeddings, capas de normalizacion y otros) se mantienen en 8bit o BF16 para limitar la degradacion, mientras la mayoria del cuerpo del modelo (3,63B parametros, el 90,34 %) se comprime a 4bit. El BPW planificado era 5,3384, pero el medido final fue 4,6610, inferior al presupuesto objetivo. El artefacto registra MLX 0.32.1 y MLX-LM 0.31.3 en el momento de la conversion, y AX Engine 7.5.7, aunque no incluye un model-manifest.json nativo validado, por lo que la ejecucion en AX Engine no esta establecida.

## Capacidades

- Generacion de embeddings de frases y extraccion de caracteristicas (pipeline feature-extraction).
- Similitud semantica (sentence-similarity) y busqueda vectorial / recuperacion semantica.
- Procesamiento de contexto largo: hasta 40.960 tokens configurados, condicionado a la memoria unificada disponible del equipo.
- Ejecucion nativa en Apple Silicon mediante MLX-LM.
- No soporta tool calling ni function calling (no documentado).
- No incluye capacidades de agente ni razonamiento multi-paso (es un modelo de embeddings).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Sin modo thinking, sin vision y sin audio: los campos Vision present y Audio present son ambos False, y MTP present es False. No se incluyen sidecars de vision ni de MTP.

## Casos de uso

- Busqueda semantica sobre documentacion tecnica: indexar documentacion de un producto en vectores de 4B parametros comprimidos y servir consultas en lenguaje natural desde un Mac, sin depender de GPU dedicada.
- Sistema RAG local para asistentes de codigo: generar embeddings de fragmentos de repositorio y consultas para recuperar contexto antes de pasar el prompt a un LLM generativo, todo en el mismo equipo Apple Silicon.
- Deduplicacion y clustering de articulos o tickets: calcular similitudes coseno entre grandes conjuntos de textos para agrupar temas recurrentes en soporte o periodismo.
- Clasificacion zero-shot por proximidad semantica: usar los embeddings como entrada a un clasificador ligero (por ejemplo, regresion logistica) para categorizar correos o incidencias sin entrenamiento especifico.
- Moderacion de contenido asistida: comparar mensajes contra un banco de embeddings de ejemplos etiquetados para detectar similitud con material problematico.
- Recomendacion de contenidos: representar items y preferencias de usuario como vectores y calcular vecinos mas cercanos para sugerir articulos, videos o productos.
- Analisis de corpus multilingue (si el base lo permite; no confirmado en la informacion disponible): alinear representaciones de distintos idiomas para busqueda cross-lingual.
- Prototipado e investigacion en NLP: experimentar con embeddings de 4B en un portatil de gama alta sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el paquete no publica evidencias medidas de calidad, contexto largo, velocidad de kernel ni exactitud MTP, y que los campos de AX Engine en axquant_runtime.json describen un contrato de compatibilidad previsto, no evidencia observada en ejecucion.

## Requisitos de hardware

- Peso del checkpoint: 2,34 GB en safetensors; descarga completa aproximada de 2,36 GB. Requiere al menos 2,36 GB de disco libre.
- Memoria para inferencia: al ser MLX y usar memoria unificada, el modelo deberia caber en Macs con 8 GB de RAM o mas, aunque se recomienda 16 GB o superior para trabajar con lotes y contextos de hasta 40.960 tokens (el autor advierte que los limites practicos dependen de la memoria unificada).
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No es un formato ejecutable en GPUs NVIDIA o AMD de forma nativa.
- Cabe en consumer hardware: si, en Macs con Apple Silicon. No aplica a GPU de consumo tipo RTX 4090 porque el formato es MLX, no PyTorch ni GGUF.
- Opciones de despliegue: MLX-LM como runtime primario. AX Engine no esta establecido en este release por falta de un manifiesto nativo validado.
- Latencia y throughput: no disponibles. El autor no publica medidas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / BPW | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Qwen3-Embedding-4B-MLX-AXQ-MXFP4 (este) | 4,02B | 40.960 tokens | MLX Safetensors, 4,6610 BPW medido | apache-2.0 | Paquete MXFP4 con 4bit/8bit/bf16; evidencia de desarrollo |
| AX-Qwen3-Embedding-4B-MLX-AXQ-4bit | 4,02B | no disponible | MLX, BPW no especificado | apache-2.0 | Hermano de menor almacenamiento; consultar su BPW exacto |
| AX-Qwen3-Embedding-4B-MLX-AXQ-8bit | 4,02B | no disponible | MLX, BPW no especificado | apache-2.0 | Hermano de mayor precision media, cerca del presupuesto de 8 BPW |
| Qwen/Qwen3-Embedding-4B (base) | 4,02B | no disponible | BF16 (formato original) | apache-2.0 | Modelo fuente sin cuantizar; mayor huella de memoria |

El autor advierte que los nombres AXQ describen clases de presupuesto, no una precision uniforme, por lo que el BPW medido es el dato autoritativo en cada caso. No se dispone de datos de rendimiento comparativo entre estos hermanos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un release certificado de AXQuant: el propio autor lo etiqueta como evidencia de desarrollo, sin metricas publicadas de calidad, contexto largo ni velocidad.
- Sin calibracion: la asignacion de precision se basa en priors de arquitectura, no en datos de calibracion, lo que puede traducirse en una degradacion de calidad no cuantificada frente al modelo BF16 original.
- Sin benchmarking: no es posible verificar la perdida de exactitud en tareas de similitud semantica o recuperacion.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingue a partir de la informacion disponible.
- Formato restringido a Apple Silicon (MLX): no es directamente utilizable en GPU NVIDIA, entornos CUDA ni despliegues con GGUF (por ejemplo, llama.cpp u Ollama).
- AX Engine no establecido: no incluye model-manifest.json nativo validado y los campos de AX Engine en axquant_runtime.json describen un contrato previsto, no evidencia observada.
- Sin soporte de MTP: MTP present es False y no se incluye sidecar, por lo que no hay decodificacion multi-token acelerada.
- Sin vision ni audio: ambos campos son False.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de embeddings, el riesgo se traslada a falsos positivos o negativos en similitud.
- Sesgos: no documentados en la informacion disponible. Dependen del modelo base Qwen3-Embedding-4B.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y citar adecuadamente.
- Madurez y adopcion muy bajas: 28 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia de comunidad y los casos de uso probados en produccion.
- En despliegues reproducibles conviene fijar el commit del Hub en lugar de depender indefinidamente de main.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-4B-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-4B/tree/5cf2132abc99cad020ac570b19d031efec650f2b
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-4B-MLX-AXQ-4bit
- Hermano 8bit: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-4B-MLX-AXQ-8bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Registro de auditoria de formato (referenciado en la model card): runtime_audit.json dentro del repositorio.
