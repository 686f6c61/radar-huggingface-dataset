# jsantillana/gemma-4-31B-it-abliterated

## Resumen

Gemma 4 31B-it-abliterated es una variante "abliterated" (sin mecanismos de rechazo) del modelo denso Gemma 4 31B-it de Google DeepMind, publicada por el usuario jsantillana en Hugging Face. El modelo base es un transformer denso autorregresivo de aproximadamente 31.273 millones de parametros, con 60 capas, hidden size de 5.376 y una longitud de contexto declarada de hasta 256K tokens. La intervencion del autor consiste en una proyeccion ortogonal sobre subespacios concretos aplicada a las capas 36 a 46 y 48, con el objetivo declarado de eliminar los comportamientos de rechazo ("canned refusals") manteniendo las capacidades de razonamiento, codigo y matematicas del modelo original.

El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado para ingles y espanol. Su publicacion se enmarca explicitamente en el ambito de red-teaming, investigacion de seguridad y ingenieria defensiva: el autor advierte que el modelo respondera a consultas sobre vulnerabilidades, analisis de exploits y mecanica tecnica sin rechazos de seguridad, y traslada toda la responsabilidad legal al usuario.

Por su tamano (31B densos) y su contexto de 256K, se posiciona en la categoria de modelos de gran formato que requieren hardware de datacenter o configuraciones multi-GPU para inferencia en precision nativa bfloat16, aunque el autor publica cuantizaciones GGUF (Q3_K_M, Q4_K_M, Q8_0) en un repositorio separado para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso autorregresivo (Gemma 4) |
| Parametros totales | 31.273.086.512 (~31,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantizacion | GGUF Q3_K_M, Q4_K_M, Q8_0 (repo separado); pesos nativos en bfloat16 |
| Idiomas soportados | Ingles (en), espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo de cuantizaciones) |
| Hidden size | 5.376 |
| Numero de capas | 60 |
| Intermediate size | 21.504 |
| Precision nativa | bfloat16 |
| Modelo base | google/gemma-4-31B-it |
| Tamano del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Gemma 4 31B-it de Google DeepMind: un transformer denso autorregresivo con 60 capas, hidden size de 5.376 e intermediate size de 21.504, en precision bfloat16 nativa. No se trata de un modelo MoE ni de una arquitectura hibrida SSM; es un transformer denso clasico. La informacion disponible no detalla la composicion del dataset de entrenamiento original, el numero de tokens utilizados ni si hubo fases de RLHF o DPO en el modelo base.

La modificacion del autor (abliteration) se aplica sobre las capas 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46 y 48 mediante proyeccion ortogonal sobre subespacios concretos de los escritores del flujo residual (`self_attn.o_proj` y `mlp.down_proj`). El objetivo declarado es eliminar los comportamientos de rechazo preservando las capacidades del modelo original. No se especifican en la informacion disponible los datos de calibracion, el conjunto de prompts utilizado para identificar las direcciones de rechazo ni metricas de degradacion tras la intervencion.

## Capacidades

- Generacion de texto conversacional en ingles y espanol.
- Razonamiento de multiples pasos y modo de razonamiento (etiqueta "reasoning" en el modelo).
- Generacion de codigo y resolucion de problemas matematicos, segun las capacidades declaradas del modelo base.
- Contexto largo de hasta 256K tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Respuestas sin rechazos de seguridad ante consultas sobre ciberseguridad, vulnerabilidades y mecanica de exploits (comportamiento intencionado de la variante abliterated).
- Soporte de tool calling / function calling y uso en agentes: no confirmado en la informacion disponible para esta variante concreta; debe verificarse contra el modelo base.
- Capacidades multimodales (vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Red-teaming de sistemas de IA: el modelo permite generar respuestas que un modelo alineado rechazaria, lo que facilita la evaluacion de clasificadores de contenido, filtros de salida y mecanismos de moderacion en pipelines de produccion.
- Investigacion sobre representaciones latentes de seguridad: al eliminar direcciones de rechazo en capas concretas, sirve para estudiar como se codifica el comportamiento de seguridad en transformers densos de gran tamano y comparar activaciones antes y despues de la intervencion.
- Analisis defensivo de vulnerabilidades: con 256K de contexto puede procesar informes de seguridad extensos, trazas de auditoria o codigo fuente completo para identificar patrones de riesgo, en entornos autorizados.
- Formacion y simulacion de ataques controlados: util en laboratorios que necesitan generar escenarios de explotacion realistas para entrenar a equipos defensivos, siempre dentro de un marco legal y autorizado.
- Procesamiento de documentacion tecnica extensa: el contexto de 256K permite resumir, extraer y correlacionar informacion de manuales, especificaciones o repositorios de gran tamano en ingles y espanol.
- Asistencia a la generacion de codigo en entornos de investigacion: el modelo hereda las capacidades de codigo del base y puede integrarse en flujos de analisis estatico o generacion de pruebas, con la advertencia de que su falta de rechazos exige supervision humana.
- Evaluacion comparativa de alineacion: util como contrapunto "no alineado" en estudios que miden la eficacia de mecanismos de seguridad en modelos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 62,6 GB solo para pesos, mas overhead de KV cache; en la practica requiere 2x A100 80GB, 2x H100 80GB o configuraciones equivalentes multi-GPU para contexto largo.
- Cuantizacion Q8_0: alrededor de 33 GB, viable en una A100 40GB o en dos RTX 4090 de 24 GB con reparto de capas.
- Cuantizacion Q4_K_M: aproximadamente 18-20 GB, cabe en una RTX 4090 (24 GB) o RTX 3090 con contexto moderado; el contexto de 256K incrementa notablemente la KV cache y puede exceder la VRAM disponible.
- Cuantizacion Q3_K_M: alrededor de 14-16 GB, viable en GPUs consumer de 16 GB (RTX 4080, RTX 4060 Ti 16GB) con contexto reducido.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; vLLM o TGI para los safetensors en bfloat16 en entornos de datacenter.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gemma-4-31B-it-abliterated (este) | ~31,2B densos | 256K | Apache 2.0 | Variante sin rechazos, orientada a red-teaming |
| google/gemma-4-31B-it | ~31,2B densos | 256K | Apache 2.0 (segun modelo base) | Modelo original alineado; referencia de capacidades |
| Otras variantes abliterated de la familia Gemma | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |
| Modelos densos de ~30B de otros proveedores | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo elimina intencionadamente los mecanismos de rechazo: puede producir contenido danino, instrucciones de explotacion o material ilegal si se le solicita. No es apto para despliegue en produccion orientado al publico sin capas de moderacion externas.
- Riesgo elevado de alucinacion en temas tecnicos y de seguridad, especialmente cuando se le piden detalles de exploits o vulnerabilidades concretas; las respuestas deben verificarse.
- La abliteration puede degradar capacidades del modelo base; no se aportan metricas de evaluacion que cuantifiquen esa posible degradacion.
- Idiomas limitados a ingles y espanol segun la model card; el rendimiento en espanol no esta cuantificado.
- La licencia Apache 2.0 permite uso comercial, pero el autor restringe explicitamente el uso a investigacion, red-teaming autorizado e ingenieria defensiva; la responsabilidad legal recae en el usuario.
- El contexto de 256K es una cifra declarada; no se aportan resultados de evaluacion en tareas de contexto largo (needle-in-a-haystack, etc.).
- El modelo tiene 60 descargas y 0 likes en el momento de la ficha; no hay validacion comunitaria significativa.
- No se confirma soporte de tool calling ni capacidades multimodales en esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsantillana/gemma-4-31B-it-abliterated
- Cuantizaciones GGUF: https://huggingface.co/jsantillana/gemma-4-31B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
