# scrapegoat/butterfly-tipping-point-50B

## Resumen

Butterfly Tipping Point (BTP) es un modelo de lenguaje de gran escala desarrollado por el usuario scrapegoat, que implementa una arquitectura de transformer de doble pista paralela con una compuerta aprendida entre ambas vías. El modelo combina dos mecanismos de atención complementarios en cada una de sus 64 capas: una pista de atención lineal recurrente (Gated Delta Net) y una pista de atención completa con Grouped Query Attention (GQA). Esta combinación busca equilibrar la eficiencia computacional del procesamiento lineal con la precisión del razonamiento de largo alcance, inspirada en la conexión interhemisférica del cerebro (cuerpo calloso).

El modelo cuenta con aproximadamente 50.900 millones de parámetros, una ventana de contexto de 262.144 tokens y un vocabulario de 248.320 entradas, lo que lo sitúa en la categoría de modelos de gran tamaño orientados a tareas de razonamiento complejo y procesamiento de secuencias muy largas. Se apoya en el diseño de Gated Delta Net publicado en el artículo arXiv 2501.12599, asociado a la familia Qwen3.5, aunque no se especifica si el entrenamiento partió de pesos de Qwen o fue desde cero.

La relevancia de este modelo radica en su propuesta arquitectónica híbrida, que pretende ofrecer lo mejor de dos paradigmas: la atención lineal para streaming eficiente y la atención completa para razonamiento global. No obstante, al tratarse de un lanzamiento reciente sin métricas publicadas ni licencia declarada, su adopción en producción requiere una evaluación cuidadosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual-track paralelo: pista A (Gated Delta Net, atencion lineal) + pista B (GQA, atencion completa), con compuerta aprendida entre pistas |
| Parametros totales | 50.896.621.632 (~50,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bfloat16 (nativo); se menciona FP8 para servido, sin confirmar disponibilidad de GGUF u otras |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura innovadora de dos pistas paralelas en cada una de sus 64 capas. La pista A utiliza un Gated Delta Net, un mecanismo de atención lineal recurrente que mantiene un estado oculto de tamaño fijo por cabeza, permitiendo inferencia con coste O(1) por token y sin necesidad de caché KV. Esta pista cuenta con 16 cabezas de clave de 128 dimensiones y 48 cabezas de valor de 128 dimensiones, además de una convolución 1D con kernel de tamaño 4 para mezcla de contexto local. La pista B usa atención GQA estándar con 24 cabezas de consulta de 256 dimensiones, 4 cabezas KV de 256 dimensiones, normalización QK (GemmaRMSNorm) y una compuerta de salida sigmoide. Ambas pistas se ejecutan en paralelo y sus salidas se combinan mediante una capa lineal aprendida (corpus callosum gate) que produce dos logits por token, determinando dinámicamente la contribución de cada pista.

Las capas siguen un patrón de alternancia 3:1: 48 capas con predominio de atención lineal y 16 capas con atención completa, repartidas cada cuatro capas. El MLP es también dual, con una mezcla ponderada por las mismas compuertas. La normalización usa GemmaRMSNorm (ε=1e-6), la activación es SiLU, y la rotación posicional RoPE aplica un theta de 10M con rotación parcial del 25%. El cabezal de salida es una capa lineal con compuerta swish.

No se proporcionan datos sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni técnicas de alineación como RLHF o DPO. La única referencia es el artículo arXiv 2501.12599 sobre Gated Delta Net, que sirve como base conceptual para la pista lineal.

## Capacidades

- Generacion de texto autoregresivo con soporte para secuencias muy largas (hasta 262.144 tokens), adecuado para documentos extensos, libros o conversaciones prolongadas.
- Razonamiento de largo alcance gracias a la pista de atencion completa (GQA) en 16 de las 64 capas, que captura dependencias globales.
- Procesamiento eficiente en streaming mediante la pista de atencion lineal, que mantiene un estado recurrente de coste constante por token.
- Mezcla dinamica de atencion local y global por token mediante la compuerta aprendida, lo que permite asignar recursos computacionales de forma adaptativa.
- Soporte de codigo fuente y estructuras sintacticas complejas, dada la capacidad de contexto amplio y la arquitectura dual (inferencia razonable, no verificada con benchmarks).
- Capacidades multilingues no confirmadas; no se ha publicado lista de idiomas soportados.
- No se menciona soporte de tool calling, function calling, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Analisis de documentos legales extensos: la ventana de 262K tokens permite procesar contratos, sentencias o expedientes completos en una sola pasada, extrayendo clausulas relevantes y resumiendo secciones sin perder contexto global.
- Agentes conversacionales con memoria prolongada: gracias al estado recurrente de la pista lineal, el modelo puede mantener conversaciones de muchas horas con coste computacional estable, ideal para asistentes virtuales de soporte.
- Generacion y revision de codigo en repositorios grandes: con contexto suficiente para abarcar multiples archivos, puede sugerir cambios coherentes entre modulos y detectar dependencias cruzadas.
- Razonamiento cientifico y matematico sobre articulos de investigacion: la combinacion de atencion lineal y completa permite seguir cadenas de argumentacion largas y citar referencias cruzadas.
- Resumen y analisis de transcripciones de reuniones o podcasts: el contexto amplio cubre sesiones completas, generando actas detalladas o resumenes ejecutivos.
- Sistemas de recomendacion contextual: al mantener un estado interno de la interaccion del usuario, puede ofrecer sugerencias personalizadas a lo largo de multiples sesiones.
- Investigacion academica sobre arquitecturas hibridas: el diseño dual-track sirve como banco de pruebas para estudiar el equilibrio entre atencion lineal y completa en modelos de gran escala.

Nota: estos casos de uso son inferencias basadas en las especificaciones tecnicas publicadas, no en evaluaciones documentadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar que permitan comparar su rendimiento con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 50,9B parametros en bfloat16 (2 bytes por parametro), el peso del modelo ocupa aproximadamente 101,8 GB. En FP8 (1 byte) serian unos 50,9 GB, y en cuantizacion de 4 bits unos 25,4 GB.
- GPU recomendadas: para bfloat16 completo se necesitarian multiples GPUs de alta capacidad, por ejemplo 2x A100 80GB o 2x H100 80GB. Para FP8, una H100 80GB podria ser suficiente. Para cuantizacion 4 bits, una RTX 4090 (24GB) no es suficiente; se necesitarian al menos 32GB de VRAM, como una A6000 o A100 40GB.
- En consumer GPU: no cabe en GPUs de consumo habitual (24GB o menos) incluso con cuantizacion agresiva; se requiere hardware profesional o servidores.
- Opciones de despliegue: no se especifica compatibilidad con vLLM, llama.cpp, Ollama o TGI. Dado que el modelo usa arquitectura personalizada (dual-track con Gated Delta Net), es probable que requiera codigo de inferencia propio o adaptaciones significativas. El tag `custom_code` en HuggingFace sugiere que se necesita codigo personalizado para cargar el modelo.
- Latencia y throughput: no disponibles. La pista lineal ofrece O(1) por token, pero la pista completa introduce complejidad O(n²) en las 16 capas correspondientes, por lo que el rendimiento dependera fuertemente de la longitud de la secuencia y de la implementacion.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. Por tamaño y contexto, podria compararse con modelos como Qwen2.5-72B (contexto 128K), Llama 3.1 70B (contexto 128K) o DeepSeek-V3 (contexto 128K), pero no hay datos de rendimiento que permitan una comparacion objetiva. La arquitectura hibrida es unica en su categoria, lo que dificulta establecer equivalencias directas.

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Butterfly Tipping Point 50B | ~50,9B | 262K | Dual-track (lineal + GQA) | No disponible |
| Qwen2.5-72B | 72B | 128K | Transformer denso | Apache 2.0 |
| Llama 3.1 70B | 70B | 128K | Transformer denso | Llama 3.1 Community License |
| DeepSeek-V3 | 671B (MoE, 37B activos) | 128K | MoE con atencion completa | Model License |

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo que terminos se distribuye el modelo, lo que impide su uso comercial seguro sin consulta legal previa.
- Sin datos de entrenamiento publicados: se desconoce la composicion del corpus, el numero de tokens y si se aplicaron tecnicas de alineacion, lo que dificulta evaluar sesgos y calidad.
- Riesgo de alucinacion: como todo LLM, puede generar contenido falso o inconsistente, especialmente en dominios especializados.
- Sin benchmarks verificados: no hay metricas independientes que confirmen su rendimiento en tareas estandar.
- Requiere codigo personalizado: el tag `custom_code` implica que la carga y ejecucion no funcionan con librerias estandar sin adaptaciones.
- Contexto largo con limitaciones practicas: aunque soporta 262K tokens, el coste de la atencion completa en las 16 capas puede hacer inviable el uso de secuencias maximas en hardware modesto.
- Origen no verificado: el autor es un usuario individual sin reputacion establecida en la comunidad; el modelo podria contener modificaciones no documentadas o riesgos de seguridad.
- Fecha de creacion futura (2026-08-29): el modelo aparece con fecha posterior a la actual, lo que sugiere posible error de metadatos o un lanzamiento programado.

## Enlaces

- HuggingFace: https://huggingface.co/scrapegoat/butterfly-tipping-point-50B
- GitHub (referenciado en la model card): https://github.com/scrapegoat/butterfly-tipping-point
- Articulo arXiv 2501.12599 (Gated Delta Net, base de la pista lineal): https://arxiv.org/abs/2501.12599
