# LlamaPal/Ministral-3B-Freestyle-Q4_K_M-GGUF

## Resumen

Ministral-3B-Freestyle-Q4_K_M-GGUF es un fichero de pesos cuantizado en formato GGUF (Q4_K_M) derivado de Ministral-3B-Heresy-Unfiltered, un ajuste fino de la comunidad (atribuido a MuXodious) sobre el modelo base Ministral 3B de Mistral AI. El repositorio de LlamaPal no entrena ni modifica el modelo: es un espejo byte a byte del fichero i1-Q4_K_M publicado por mradermacher, con el mismo hash SHA-256, ofrecido como descarga estable.

El modelo subyacente es un transformer decoder-only de 3.429.006.336 parámetros (3,4 mil millones), pensado para inferencia local en hardware de consumo. La cuantización Q4_K_M reduce el peso a 2,1 GB, lo que permite ejecutarlo en GPUs consumer con 4-6 GB de VRAM o incluso en CPU con llama.cpp. La etiqueta "Heresy-Unfiltered" indica que el ajuste fino eliminó o relajó las capas de alineación del modelo original, algo relevante para quien evalúe el modelo en producción.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de cuantización concreto con su procedencia verificable (hash y commit de origen); por otro, advierte de que se trata de un modelo sin filtros de seguridad, con licencia Apache 2.0 heredada, y sin model card técnica propia en este repositorio más allá de la trazabilidad de la copia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Ministral 3B) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (GGUF), generado con imatrix segun el tag del repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Ministral 3B de Mistral AI: un transformer decoder-only denso de aproximadamente 3,4 mil millones de parámetros. Sobre esa base, la comunidad (MuXodious) aplicó un ajuste fino de desalineación ("Heresy-Unfiltered"), cuyos detalles de dataset, número de tokens y metodología (SFT, DPO u otras) no están disponibles en la información proporcionada. El repositorio de LlamaPal no documenta el proceso de entrenamiento.

La innovación técnica de este artefacto concreto es la cuantización: el fichero Q4_K_M se generó con el método i1 de mradermacher, que emplea una matriz de importancia (imatrix) para calcular los factores de cuantización por capa, mejorando la fidelidad respecto a una cuantización K-quants estándar a igual tamaño. El resultado es un GGUF de 2,1 GB con hash SHA-256 `fd4ad265b340334ef5e0f5ebbe664c13449bc25f8d01b43aeccf66a6695ad0f4`, idéntico al original.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational` del repositorio.
- Razonamiento y respuesta a instrucciones propias de un modelo de 3B parámetros; sin datos de benchmarks que cuantifiquen el nivel.
- Generación de código y matemáticas básicas: capacidad esperable en la familia Ministral, aunque no verificada en este artefacto concreto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el modelo base Ministral es multilingüe, pero este ajuste no documenta idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Modo sin filtros: el ajuste "Unfiltered" elimina las capas de rechazo del modelo original, lo que cambia el comportamiento en prompts sensibles.

## Casos de uso

- Inferencia local en portátil o mini-PC: con 2,1 GB de pesos, el modelo cabe en CPU con llama.cpp u Ollama y permite un asistente conversacional offline sin conexión ni coste de API.
- Prototipado rápido de aplicaciones de chat: al ser un GGUF Q4_K_M, se carga en minutos con llama-cpp-python o LM Studio, lo que acelera la validación de ideas antes de invertir en modelos mayores.
- Generación de texto creativo sin restricciones de contenido: el ajuste "Unfiltered" lo hace adecuado para ficción, guiones o ejercicios de escritura donde los filtros de seguridad del modelo base resultan limitantes.
- Evaluación de cuantizaciones: sirve como referencia para comparar la calidad de Q4_K_M con imatrix frente a otras cuantizaciones del mismo modelo base en tareas de perplejidad o generación.
- Despliegue en entornos con recursos limitados: con 4-6 GB de VRAM en una GPU consumer se puede servir con vLLM (soporte GGUF experimental) o llama.cpp server para un endpoint compatible con la API de OpenAI.
- Investigación sobre alineación y seguridad: al ser un modelo deliberadamente desalineado, es útil para estudiar el efecto de eliminar el RLHF/DPO en el comportamiento, siempre en entornos controlados y con fines de investigación.
- Educación y experimentación: permite a estudiantes ejecutar un LLM real en su propio hardware y observar el comportamiento de la cuantización y el ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con Q4_K_M, incluyendo overhead de contexto y caché KV; el fichero de pesos ocupa 2,1 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB (sobredimensionada para este modelo); A100 y H100 son innecesarias salvo para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM; también en iGPU con memoria unificada y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y vLLM con soporte GGUF (experimental). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ministral-3B-Freestyle-Q4_K_M (este) | 3,43 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Ajuste sin filtros de la comunidad |
| Ministral 3B (base, Mistral AI) | ~3,4 B | no disponible en esta ficha | Mistral Research / comercial segun terminos | safetensors, GGUF | Modelo original alineado |
| Llama 3.2 3B Instruct | 3,21 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Alternativa alineada de tamano similar |
| Qwen2.5 3B Instruct | 3,09 B | 32 K | Apache 2.0 | safetensors, GGUF | Alternativa Apache 2.0 con contexto amplio |

La comparación de rendimiento no está disponible para este artefacto concreto; los datos de contexto de los modelos alternativos provienen de sus fichas oficiales.

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: el ajuste "Heresy-Unfiltered" elimina las capas de rechazo, por lo que puede generar contenido dañino, ilegal o inexacto sin advertencia. No es adecuado para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación: con 3,4 mil millones de parámetros, la tasa de alucinación es inherentemente alta en tareas de conocimiento factual; no debe usarse como fuente de verdad.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base y los del dataset de ajuste fino, que no se especifica.
- Limitaciones de contexto e idioma: no disponibles; el ajuste no documenta ventana de contexto ni idiomas soportados, lo que impide garantizar un rendimiento multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base Ministral de Mistral AI tiene sus propios términos que deben verificarse; la licencia Apache 2.0 del artefacto no exime de cumplir los términos del modelo original.
- Trazabilidad: el repositorio es un espejo; no hay garantía de mantenimiento, actualizaciones ni soporte por parte de LlamaPal. El hash SHA-256 permite verificar la integridad de la descarga.
- Producción: no se recomienda desplegar este artefacto en entornos de producción sin una evaluación propia de calidad, seguridad y sesgo, y sin un sistema de moderación de salida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/Ministral-3B-Freestyle-Q4_K_M-GGUF
- Repositorio original de la cuantización: https://huggingface.co/mradermacher/Ministral-3B-Heresy-Unfiltered-i1-GGUF
- Commit de origen citado: https://huggingface.co/mradermacher/Ministral-3B-Heresy-Unfiltered-i1-GGUF/tree/e6ec74a038841a894cb9afaed27ae91442d91b5e
- Modelo base Ministral 3B (Mistral AI): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
