# handwoven8588/CodeRankEmbed-flash-attn

## Resumen

CodeRankEmbed-flash-attn es una redistribución del modelo de embeddings de código nomic-ai/CodeRankEmbed, publicada por el usuario handwoven8588 bajo licencia MIT. No es un reajuste fino ni un modelo nuevo: los pesos son los del modelo original convertidos a bf16, sin entrenamiento adicional. El valor diferencial está en el fichero `modeling_hf_nomic_bert.py` que acompaña al repositorio, que implementa un despacho de atención de tres niveles conmutable.

El problema que resuelve es de eficiencia en inferencia. El modelo original carga con `trust_remote_code=True` y su única ruta de atención es eager, con memoria de activaciones que crece como `batch × heads × seq²`; con solo 137 millones de parámetros, agota la memoria de la GPU en lotes grandes. Esta versión añade dos rutas varlen que calculan la misma atención con memoria O(N) empaquetando secuencias sin relleno, de modo que los lotes que provocan OOM en la ruta eager se ejecutan con holgura y con embeddings equivalentes dentro de la precisión bf16.

Se trata de un codificador de recuperación (bi-encoder de frases) orientado a búsqueda de código, no de un modelo generativo. Con 136.731.648 parámetros, licencia MIT, idioma inglés y compatibilidad con la librería sentence-transformers, es relevante para quien despliegue recuperación de código a gran escala y necesite reducir el coste de memoria sin cambiar de modelo ni de embeddings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NomicBert (transformer codificador tipo BERT) con despacho de atención de tres niveles |
| Parametros totales | 136.731.648 (aproximadamente 137 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la model card no declara el maximo; en las pruebas se codifican fragmentos de hasta 638 tokens) |
| Tipos de cuantizacion | bf16 (pesos almacenados en bf16). La carga en fp32 solo ensancha el dtype, no recupera precision |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors en bf16; requiere `trust_remote_code=True` para cargar el fichero de modelado personalizado |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 13.182 / 1 |
| Fecha de creacion / actualizacion | 2026-06-20 / 2026-09-27 |
| Modelo base | nomic-ai/CodeRankEmbed (relacion: quantized) |

## Arquitectura y entrenamiento

La arquitectura subyacente es NomicBert, un codificador transformer empleado aquí como bi-encoder de recuperación: genera un vector normalizado por consulta y otro por documento, y la relevancia se calcula por similitud coseno. No hay entrenamiento posterior: los pesos son los de nomic-ai/CodeRankEmbed convertidos a bf16, por lo que la model card indica paridad de embeddings con el original en fp32 dentro de la precisión de bf16. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, más allá de que el modelo base es un modelo de recuperación de código ya entrenado.

La innovación técnica es el despacho automático de atención en tres niveles, seleccionado por dispositivo y sobrescribible con la variable de entorno `NOMIC_BERT_ATTN_IMPL=torch_varlen|flash_attn|eager`. El nivel `torch_varlen` usa `torch.nn.attention.varlen.varlen_attn`, incluido en PyTorch (disponible desde la versión 2.10.0) y sin dependencias de terceros; requiere CUDA con capacidad de cómputo sm_80 o superior. El nivel `flash_attn` usa el kernel varlen empaquetado de `flash_attn`, que es una dependencia opcional pensada para versiones de PyTorch que todavía no incluyen `torch.nn.attention.varlen`. El nivel `eager` mantiene el algoritmo original con relleno y sirve como referencia de correctitud y respaldo universal (CPU, GPU anteriores a Ampere o ausencia de los kernels anteriores).

El modo `auto` prueba primero `torch_varlen`, luego `flash_attn` y por último `eager`; antes de aceptar un nivel varlen ejecuta una sonda mínima del kernel por dispositivo, ya que la comprobación de capacidad por sí sola no determina si la compilación instalada tiene kernel para esa arquitectura (por ejemplo, en ROCm). Si la sonda lanza `RuntimeError` —forma en que falla un kernel ausente o no soportado— registra un aviso y baja al siguiente nivel. Los errores de memoria, de otro tipo o de CUDA arrastrados de trabajos previos se propagan en lugar de degradar el nivel, de modo que un fallo transitorio no fija el dispositivo en una ruta más lenta. Un nivel forzado por variable de entorno no se sondea y lanza `RuntimeError` si no se cumple su precondición; un valor no reconocido lanza `ValueError`. El nivel activo se consulta con `model[0].auto_model.attention_impl` o en la línea de log informativa.

## Capacidades

- Generación de embeddings de consultas y documentos de código para recuperación semántica. Es un modelo de representación, no un generador de texto: no produce código ni lenguaje natural.
- Recuperación de código a partir de lenguaje natural, con el prefijo obligatorio en la consulta: `Represent this query for searching relevant code: `.
- Ranking de similitud coseno entre consultas y fragmentos de código cuando los embeddings se normalizan (`normalize_embeddings=True`).
- Procesamiento por lotes grandes de secuencias de longitud variable mediante las rutas varlen, con memoria lineal en el número de tokens.
- Funcionamiento en CPU y en GPU anteriores a Ampere a través de la ruta eager, con la misma salida numérica que las rutas varlen.
- Ejecución en bf16 nativo, con `config.json` declarando `torch_dtype: bfloat16` y `from_pretrained` respetando el parámetro `torch_dtype` (el `from_pretrained` original lo ignoraba y cargaba siempre fp32).
- Reproducibilidad por revisión: `revision=<commit>` fija código, configuración, tokenizador y pesos a ese commit.
- Capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio o modo de pensamiento: no disponibles (no aplican a un modelo de embeddings).

## Casos de uso

- Búsqueda semántica de código en un repositorio o monorepo: indexar todos los ficheros como documentos sin prefijo y consultar con el prefijo de instrucción para localizar implementaciones relevantes; el modelo es adecuado porque está entrenado específicamente para la tarea de recuperación de código, no para texto general.
- Recuperación aumentada para asistentes de programación: alimentar el contexto de un LLM generativo con los fragmentos recuperados por este modelo; la separación entre consulta y documento permite precalcular el índice de todo el repositorio una sola vez.
- Deduplicación y agrupación de código en pipelines de curación de datos: generar embeddings de millones de ficheros por lotes con las rutas varlen para evitar el OOM del camino eager y agrupar por similitud para eliminar duplicados.
- Detección de código plagiado o copiado entre proyectos: comparar embeddings normalizados entre módulos de distintos repositorios para marcar candidatos a revisión de licencias, usando la similitud coseno como señal previa al análisis textual.
- Recomendación de ejemplos y fragmentos en documentación técnica: dado un problema descrito en lenguaje natural, devolver los ejemplos de código más cercanos dentro de un portal de documentación.
- Enrutado de incidencias y preguntas: clasificar tickets o preguntas de usuarios hacia el módulo, servicio o equipo correspondiente calculando su vecino más próximo en un índice de descripciones y fragmentos de código.
- Filtrado de conjuntos de entrenamiento: seleccionar fragmentos de código relevantes para una tarea concreta puntuando su similitud con consultas representativas, reduciendo el volumen antes de un costoso proceso de anotación o ajuste.
- Construcción de índices de recuperación en producción con restricciones de memoria: al sustituir la atención eager O(seq²) por rutas varlen O(N), permite lotes de 32 o 64 fragmentos de varios cientos de tokens en GPUs donde el modelo original no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de paridad y rendimiento, pero en la información proporcionada está truncada antes de mostrar las cifras, por lo que no se pueden citar valores de latencia, throughput ni comparaciones numéricas con otros modelos.

Los únicos datos metodológicos disponibles de esa sección son los siguientes: se midieron los tres niveles de atención en la misma GPU, con `eager` como referencia O(seq²); el protocolo emplea 64 fragmentos reales de código Python (las primeras 40 líneas de cada fichero, con una media de 428 tokens y un máximo de 638), codificados con sentence-transformers con `batch_size` explícito de 32 y de 64. Cada nivel codifica una vez sin medir y después otra vez para la medición. La model card afirma paridad de embeddings con el original en fp32 dentro de la precisión de bf16, sin documentar aquí ninguna cifra de mejora de memoria o velocidad.

## Requisitos de hardware

- VRAM de pesos: aproximadamente 274 MB en bf16 (136,7 M de parámetros a 2 bytes) y aproximadamente 547 MB si se fuerza la carga en fp32, que no aporta precisión real porque los pesos almacenados son bf16.
- VRAM total en inferencia: dominada por las activaciones, no por los pesos. Con la ruta eager la memoria crece como `batch × heads × seq²`, por lo que lotes grandes de secuencias largas pueden agotar la GPU; con `torch_varlen` o `flash_attn` el consumo de activaciones es lineal en el número de tokens.
- GPU recomendadas para las rutas rápidas: cualquier GPU NVIDIA con capacidad de cómputo sm_80 o superior, es decir Ampere o posterior: A100, H100, L40S, A10, RTX 3090, RTX 4090, y también las versiones más recientes de la gama RTX.
- GPUs que quedan en la ruta eager: modelos anteriores a Ampere, como V100 (sm_70) o T4 (sm_75), además de cualquier ejecución en CPU. La ruta eager funciona en cualquier host, pero sin las ventajas de memoria y throughput.
- GPU de consumo: sí cabe con holgura. Los pesos ocupan menos de 300 MB en bf16, así que una RTX 3060 de 12 GB o superior ejecuta el modelo; el límite práctico lo marca el tamaño de lote y la longitud de secuencia que se quiera procesar en la ruta activa.
- Precisión: las rutas `flash_attn` y `torch_varlen` exigen media precisión, y el modelo se ejecuta en bf16 en cualquier escenario real de servicio.
- Opciones de despliegue: la librería declarada es sentence-transformers, con `trust_remote_code=True` para cargar el fichero de modelado incluido en el repositorio. La compatibilidad con servidores que no admiten código de modelado personalizado (vLLM, TGI o text-embeddings-inference) no está confirmada en la información disponible y debe verificarse antes de usarlos en producción.
- Requisitos de versión: PyTorch 2.10.0 o superior para el nivel `torch_varlen`; en versiones anteriores se puede usar el nivel `flash_attn` instalando el paquete opcional del mismo nombre. La ruta `eager` no tiene requisitos adicionales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Atencion | Disponibilidad |
|---|---|---|---|---|---|
| handwoven8588/CodeRankEmbed-flash-attn | 136,7 M | no disponible | MIT | Eager mas rutas varlen opcionales (`torch_varlen`, `flash_attn`) | HuggingFace, 13.182 descargas, 1 like |
| nomic-ai/CodeRankEmbed | mismos pesos que el modelo base de esta ficha | no disponible | no disponible | Solo eager | HuggingFace (origen de los pesos) |
| jinaai/jina-embeddings-v2-base-code | 161 M (aproximado) | 8.192 tokens | Apache-2.0 | no disponible | HuggingFace |
| microsoft/unixcoder-base | 125 M (aproximado) | 512 tokens | MIT | Codificador estandar | HuggingFace |

La comparación directa con nomic-ai/CodeRankEmbed es la más relevante: comparten pesos, por lo que la diferencia se reduce al empaquetado en bf16, a la ruta de atención varlen y a que el `from_pretrained` de esta versión respeta `torch_dtype`. Los datos de rendimiento comparado entre las alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni código ni responde a preguntas. El riesgo de alucinación se manifiesta en forma de recuperaciones irrelevantes o falsos positivos en el ranking, no de contenido inventado.
- Idioma: solo inglés según las etiquetas del repositorio. Las consultas en otros idiomas no cuentan con soporte declarado.
- El prefijo de instrucción es obligatorio en las consultas (`Represent this query for searching relevant code: `). Omitirlo degrada la calidad de la recuperación; los documentos, en cambio, no llevan prefijo. Es un error frecuente en integraciones.
- Los embeddings coinciden con el modelo original en fp32 solo dentro de la precisión bf16; no son idénticos bit a bit. Si el sistema ya tiene embeddings precalculados con el original en fp32, conviene reindexar o validar la paridad antes de mezclar índices.
- Cargar el modelo en fp32 no recupera la precisión original: los pesos almacenados ya son bf16 y el cambio de dtype solo los ensancha.
- El repositorio usa `trust_remote_code=True`, lo que implica ejecutar código Python del autor al cargar el modelo. Es una superficie de riesgo de seguridad y de reproducibilidad; se recomienda fijar `revision=<commit>` para inmovilizar código, configuración, tokenizador y pesos, y auditar el fichero de modelado.
- La integración con servidores de inferencia que no soportan modelado personalizado puede no ser viable sin adaptaciones; el despacho de atención está implementado dentro del propio fichero de modelado.
- Forzar un nivel de atención con `NOMIC_BERT_ATTN_IMPL` no tiene respaldo silencioso: lanza `RuntimeError` si no se cumple su precondición, lo que puede tumbar un servicio mal configurado en el arranque. Un valor no reconocido lanza `ValueError`.
- En CPU o en GPUs anteriores a Ampere el modelo cae a la ruta eager, con memoria O(seq²); los lotes grandes que motivan esta distribución no serán viables en esos entornos.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. Conviene verificar igualmente las condiciones del modelo base del que proceden los pesos.
- Señal de madurez comunitaria: 13.182 descargas frente a 1 like. El repositorio tiene adopción de descarga pero muy poca validación pública, lo que aconseja pruebas propias de calidad y paridad antes de depender de él en producción.
- No hay resultados de benchmarks publicados en la información disponible que permitan estimar la calidad de recuperación frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/handwoven8588/CodeRankEmbed-flash-attn
- Modelo base: https://huggingface.co/nomic-ai/CodeRankEmbed
- La búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo: los resultados obtenidos corresponden a páginas no relacionadas (asistente Gemini de Google), por lo que no se dispone de papers, blogs, repositorios ni demos adicionales que enlazar.
