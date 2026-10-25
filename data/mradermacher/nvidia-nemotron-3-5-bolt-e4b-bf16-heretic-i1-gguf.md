# mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-i1-GGUF

## Resumen

Esta ficha describe el repositorio `mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-i1-GGUF`, una recopilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo `darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic`. No se trata, por tanto, de un modelo entrenado desde cero, sino de una distribución de pesos comprimidos pensada para inferencia local con llama.cpp y derivados (Ollama, LM Studio, koboldcpp). El autor original del modelo base no aparece documentado en la información disponible, y el nombre sugiere una derivación del modelo Nemotron de NVIDIA con una modificación de tipo *abliteration* (sufijo "heretic"), aunque este extremo no está confirmado por ninguna fuente de la información proporcionada.

El dato objetivo más relevante es el recuento de parámetros en safetensors: 7.463.013.674 (≈7,46 mil millones). El sufijo "E4B" del nombre base podría indicar una arquitectura con aproximadamente 4B de parámetros efectivos o activos, pero no hay información que lo confirme, por lo que no se consigna como especificación. La model card describe el modelo como multimodal ("this is a vision model"), con los ficheros `mmproj` alojados en el repositorio estático del mismo autor, si bien el propio texto matiza con un "if any" que no garantiza su existencia.

La relevancia práctica del repositorio es doble: por un lado, ofrece un abanico muy amplio de cuantizaciones (desde IQ1_S de 3,4 GB hasta Q6_K) con calibración por *imatrix*, lo que permite desplegar un modelo de ~7,5B en hardware de consumo; por otro, al tratarse presuntamente de una variante sin alineamiento de seguridad, resulta de interés para investigación sobre robustez de salvaguardas, evaluación de sesgos y análisis de comportamiento de modelos "decensored". El repositorio, sin embargo, no publica benchmarks, licencia ni especificaciones de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre base sugiere familia Nemotron de NVIDIA; no confirmado) |
| Parametros totales | 7.463.013.674 (≈7,46B, dato de safetensors) |
| Parametros activos | no disponible (el sufijo "E4B" del nombre base apunta a ~4B efectivos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con calibración imatrix (i1): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; además existe un repositorio hermano con cuantizaciones estáticas |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base está en BF16/safetensors |
| Tamano del repositorio | 111,0 GB (conjunto de todas las cuantizaciones) |
| Etiquetas | transformers, gguf, imatrix, conversational, endpoints_compatible, region:us |

Cuantizaciones destacadas y tamano en disco:

| Fichero | Tipo | Tamano (GB) | Nota del autor |
|---|---|---|---|
| i1-IQ1_S | IQ1_S | 3,4 | "for the desperate" |
| i1-IQ2_M | IQ2_M | 3,9 | — |
| i1-IQ3_XXS | IQ3_XXS | 4,1 | calidad baja |
| i1-IQ3_S | IQ3_S | 4,7 | "beats Q3_K*" |
| i1-IQ4_XS | IQ4_XS | 5,1 | — |
| i1-Q4_K_S | Q4_K_S | 5,3 | óptimo tamano/velocidad/calidad |
| i1-Q4_K_M | Q4_K_M | 5,4 | rápido, recomendado |
| imatrix.gguf | imatrix | 0,1 | para generar cuantizaciones propias |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura interna (tipo de transformer, atención, posible mezcla de expertos), sobre el volumen o composición de los datos de entrenamiento ni sobre las etapas de alineamiento (RLHF, DPO u otras) del modelo base `darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic`. La model card del repositorio cuantizado se limita a los metadatos de cuantización y a la tabla de ficheros; no incluye detalles técnicos del modelo subyacente.

El único elemento técnico diferencial documentado es el proceso de cuantización: mradermacher genera cuantizaciones "weighted/imatrix" (prefijo i1, `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), es decir, con una matriz de importancia calculada sobre el modelo para reducir el error de cuantización en las capas más sensibles. El sufijo "heretic" en el nombre base es una convención habitual para variantes sometidas a *abliteration* (eliminación de direcciones de rechazo en el espacio de activaciones), pero no se aporta documentación que lo verifique. Tampoco se especifica si el modelo conserva capacidades multimodales en los GGUF o si los proyectores `mmproj` están disponibles.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica un ajuste orientado a diálogo multi-turno.
- Capacidades multimodales (visión): la model card afirma "this is a vision model", con ficheros `mmproj` ubicados en el repositorio estático; el propio autor matiza "if any", por lo que la disponibilidad real no está garantizada.
- Razonamiento y matemáticas: no disponible (sin benchmarks ni descripción funcional).
- Generación de código: no disponible (sin datos que lo confirmen).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Multilingüismo: limitado a inglés según la etiqueta `language: en`; no se declaran otros idiomas.
- Modo "thinking" o decodificación especulativa: no disponible.
- Comportamiento sin alineamiento de seguridad: presumiblemente derivado de la modificación "heretic"; no documentado formalmente.

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: con las cuantizaciones IQ2/IQ3 (3,4-4,7 GB) el modelo puede ejecutarse en CPU con llama.cpp manteniendo un tamaño manejable en RAM, útil para prototipos y pruebas offline.
- Despliegue en estaciones con GPU de consumo: la variante i1-Q4_K_M (5,4 GB) permite servir un modelo de ~7,5B en tarjetas de 8-12 GB con contexto moderado, cubriendo asistentes personales y automatizaciones domésticas.
- Investigación sobre alineamiento y salvaguardas: si se confirma la naturaleza *abliterated* del modelo base, sirve como sujeto de estudio para medir la degradación de comportamientos de rechazo, comparar con la versión alineada y evaluar clasificadores de seguridad.
- Red teaming y evaluación de filtros de contenido: útil para generar respuestas que estresen moderadores automáticos y validar la robustez de pipelines de filtrado en producción.
- Chat conversacional en inglés integrado en aplicaciones de escritorio: gracias al formato GGUF puede embeberse en herramientas tipo LM Studio u Ollama sin infraestructura de servidor.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de veinte variantes del mismo modelo con distintos bits, lo que facilita estudios de degradación calidad/tamano sobre una misma arquitectura.
- Análisis de documentos con componente visual (condicionado a la disponibilidad de `mmproj`): descripción de imágenes y extracción de información en entornos locales, siempre que se confirme el soporte multimodal en el repositorio estático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se documentan comparaciones con el modelo base o con la versión BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF más 1-2 GB de sobrecarga (contexto KV y buffers). Orientativamente: ~5 GB para i1-IQ2_M (3,9 GB), ~6-7 GB para i1-IQ3_S (4,7 GB), ~7 GB para i1-Q4_K_M (5,4 GB). El modelo base en BF16 requiere del orden de 15 GB solo para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para las cuantizaciones altas; A100/H100 no aportan ventaja significativa para un modelo de este tamano salvo por concurrencia.
- Cabe en GPU de consumo: sí, desde GTX 1060 6 GB con IQ2/IQ3, y con holgura en tarjetas de 8-12 GB usando Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; vLLM y TGI solo con soporte parcial o convertiendo el modelo, no es el formato nativo.
- Latencia y throughput: no disponibles (no se han publicado mediciones). Como referencia cualitativa del autor, Q4_K_M está marcado como "fast, recommended" y Q4_0 como "fast, low quality".
- Nota: si se utiliza la variante multimodal, hay que descargar también el fichero `mmproj` desde el repositorio estático, lo que incrementa el consumo de VRAM en una cantidad no especificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (i1-GGUF, imatrix) | 7,46B | no disponible | GGUF cuantizado | no disponible | no publicados | HuggingFace, 0 descargas, 1 like |
| darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic (base) | 7,46B | no disponible | BF16 / safetensors | no disponible | no publicados | HuggingFace |
| mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-GGUF (cuantizaciones estáticas) | 7,46B | no disponible | GGUF estático | no disponible | no publicados | HuggingFace |
| Modelos densos de referencia ~7-8B (p. ej. Llama 3.1 8B, Qwen2.5 7B) | ~7,6-8,0B | 128k en ambos casos | safetensors, GGUF | Llama 3.1 Community License / Apache 2.0 | públicos y extensos | amplia adopción |

La comparación con modelos de otras familias es únicamente orientativa en cuanto a tamano y ventana de contexto: al no existir benchmarks publicados para este modelo, no es posible establecer una comparación de rendimiento rigurosa. Frente a la distribución estática, la versión i1 con imatrix suele ofrecer mejor calidad por bit, a costa de ficheros ligeramente distintos y de un proceso de generación menos reproducible para terceros.

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés; su uso en castellano no está soportado ni evaluado y probablemente degrade la calidad de forma notable.
- Sin benchmarks: no hay ninguna métrica publicada que permita estimar razonamiento, código o matemáticas; cualquier afirmación de rendimiento sería especulativa.
- Licencia no disponible: no se puede asumir uso comercial. El modelo base es una derivación de un modelo de NVIDIA, cuya licencia original (NVIDIA Open Model License u otra) podría imponer restricciones adicionales, y no consta autorización del autor del derivado.
- Presunto modelo "decensored": el sufijo "heretic" sugiere la eliminación de comportamientos de rechazo. Si se confirma, el modelo puede producir contenido inapropiado, peligroso o ilegal sin filtros, lo que lo hace inadecuado para aplicaciones de cara al público sin una capa de moderación externa.
- Riesgo de alucinación: no cuantificado, pero esperable en un modelo de ~7,5B sin datos de evaluación; se agrava en las cuantizaciones de 1-2 bits (el propio autor califica IQ1 como "for the desperate").
- Degradación por cuantización: las variantes IQ1_S, IQ1_M, IQ2_XXS y Q2_K_S pierden calidad de forma perceptible; solo Q4_K_M en adelante se recomienda para uso práctico.
- Visión no garantizada: la model card afirma que es un modelo visual pero matiza "if any" respecto a los ficheros `mmproj`; conviene verificar el repositorio estático antes de disenar un producto sobre esa capacidad.
- Trazabilidad escasa: 0 descargas y 1 like en el momento del registro, sin documentación del autor del modelo base, sin paper y sin ficha técnica del entrenamiento.
- Repositorio de gran tamano (111 GB): descargar el conjunto completo es costoso; conviene bajar solo el fichero GGUF necesario mediante descarga selectiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-i1-GGUF
- Modelo base: https://huggingface.co/darkc0de/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic
- Cuantizaciones estáticas del mismo modelo (incluye posibles `mmproj`): https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-i1-GGUF/resolve/main/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic.imatrix.gguf
- Página de descargas del autor: https://hf.tst.eu/model#NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-heretic-i1-GGUF
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la búsqueda web realizada.
