# mradermacher/WePocketModel1.0-2B-GGUF

## Resumen

WePocketModel1.0-2B es un modelo multimodal de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) desarrollado por Tencent, orientado a ejecución en dispositivo (on-device) y a la generación de embeddings multimodales. Esta ficha corresponde a la versión cuantizada en GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo está etiquetado como multimodal, con soporte para embeddings multimodales, MRL (Matryoshka Representation Learning) y decisiones estructuradas (structured-decision).

La relevancia actual del modelo reside en su tamaño compacto, inferior a 2.000 millones de parámetros, combinado con capacidades multimodales y una licencia Apache 2.0 permisiva. Esto lo sitúa en el segmento de modelos pequeños que pueden ejecutarse en hardware de consumo o en el borde de la red, sin depender de infraestructura en la nube. La cuantización GGUF amplía aún más su accesibilidad, con variantes que van desde 1,1 GB (Q2_K) hasta 3,9 GB (f16).

No obstante, la información disponible sobre el modelo base es limitada: no se documentan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. El único idioma declarado es el inglés. La model card de la versión GGUF es fundamentalmente logística (lista de cuantizaciones y notas de uso), sin detalles técnicos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal; etiquetas: multimodal, multimodal-embedding, MRL, structured-decision) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 para el componente multimodal |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base tencent/WePocketModel1.0-2B) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Las etiquetas del repositorio indican que se trata de un modelo multimodal con capacidades de embeddings multimodales, que emplea MRL (Matryoshka Representation Learning, una técnica que permite truncar embeddings a distintas dimensiones manteniendo su utilidad) y que soporta decisiones estructuradas. El tamaño del repositorio GGUF es de 19,2 GB, coherente con la suma de todas las cuantizaciones publicadas.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card de la versión cuantizada es una plantilla estándar de mradermacher que solo describe el proceso de cuantización estática (quantize_version 2, convert_type hf) y los archivos generados. No se han publicado cuantizaciones ponderadas o con imatrix para este modelo, según indica el propio autor.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y la librería `transformers` sugieren uso en diálogo, aunque no se detallan capacidades específicas de razonamiento.
- Procesamiento multimodal: incluye archivos `mmproj` (proyección multimodal) en f16 y Q8_0, lo que indica soporte de entrada de imágenes junto con texto.
- Embeddings multimodales: etiqueta `multimodal-embedding`, orientado a representaciones vectoriales conjuntas de texto e imagen.
- MRL (Matryoshka Representation Learning): permite generar embeddings truncables a diferentes dimensiones, útil para búsqueda y recuperación con distintos presupuestos de almacenamiento.
- Decisiones estructuradas: etiqueta `structured-decision`, que sugiere salidas en formatos estructurados para toma de decisiones o clasificación.
- Ejecución on-device: diseñado para inferencia local en dispositivos con recursos limitados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking, visión, audio: solo se confirma visión (componente mmproj); audio y modo thinking no disponibles.

## Casos de uso

- Búsqueda multimodal en dispositivo: el modelo puede generar embeddings conjuntos de texto e imagen para un sistema de recuperación local, gracias a su soporte MRL que permite ajustar la dimensión del vector al presupuesto de memoria del dispositivo.
- Clasificación y enrutamiento con salidas estructuradas: la etiqueta `structured-decision` lo hace adecuado para tareas de clasificación o enrutamiento donde se requiere una salida en formato fijo, ejecutándose localmente sin latencia de red.
- Asistente conversacional embebido: con cuantizaciones de 1,1 a 1,5 GB (Q2_K a Q5_K_M), puede integrarse en aplicaciones de escritorio o móviles para diálogo básico en inglés sin conexión.
- Procesamiento de documentos con imágenes en el borde: combinando el modelo principal con `mmproj-Q8_0` (0,5 GB), es posible extraer representaciones de capturas, formularios o figuras en un pipeline local.
- Prototipado rápido de sistemas RAG multimodales: al ser un modelo pequeño con licencia Apache 2.0, sirve para validar arquitecturas de recuperación aumentada antes de escalar a modelos mayores.
- Filtrado y deduplicación de datasets: los embeddings multimodales permiten agrupar y deduplicar pares texto-imagen en pipelines de curación de datos ejecutados en hardware modesto.
- Inferencia en dispositivos sin GPU dedicada: las variantes Q4_K_S y Q4_K_M (1,3-1,4 GB) caben en memoria RAM de sistemas integrados, permitiendo despliegues en Raspberry Pi o mini-PC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (modelo principal, sin mmproj): Q2_K ~1,1 GB; Q4_K_M ~1,4 GB; Q8_0 ~2,1 GB; f16 ~3,9 GB. Añadir 0,5 GB (mmproj-Q8_0) u 0,8 GB (mmproj-f16) si se usa la entrada multimodal.
- GPU recomendadas: al tratarse de un modelo de menos de 2 B parámetros, cualquier GPU con 4 GB o más de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar la variante f16 con holgura. No requiere A100 ni H100.
- GPU de consumo: sí cabe en todas las GPU de consumo actuales (GTX 1060 6 GB, RTX 2060, RTX 3050, RTX 4090, etc.), incluso en las variantes de mayor calidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y cualquier runtime compatible con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera inferencia en tiempo real en CPU moderna y muy rápida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| WePocketModel1.0-2B (esta ficha) | ~1,88 B | no disponible | Sí (mmproj) | Apache 2.0 | GGUF, safetensors |
| Qwen2-VL-2B | ~2 B | no disponible en esta ficha | Sí | Apache 2.0 (según versión) | safetensors, GGUF |
| SmolVLM-2B | ~2 B | no disponible en esta ficha | Sí | Apache 2.0 | safetensors, GGUF |
| PaliGemma-3B | ~3 B | no disponible en esta ficha | Sí | Gemma license | safetensors |

No se dispone de datos de rendimiento comparativo para WePocketModel1.0-2B, por lo que la comparación se limita a parámetros, licencia y disponibilidad de formato. Los modelos alternativos citados son referencias habituales en el segmento de modelos multimodales pequeños, pero sus especificaciones exactas no se han verificado en la información proporcionada y deben consultarse en sus respectivas fichas.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está garantizado y probablemente degrade la calidad.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad; al ser un modelo pequeño y sin información sobre el dataset, el riesgo de sesgos no cuantificados es alto.
- Alucinación: sin benchmarks ni documentación de alineación, no es posible estimar la tasa de alucinación; en modelos pequeños esta suele ser elevada, especialmente en tareas de razonamiento.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (tencent/WePocketModel1.0-2B) y de los pesos multimodales, ya que la ficha solo confirma la licencia de esta versión cuantizada.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para un equilibrio entre tamaño y fidelidad.
- Ausencia de cuantizaciones ponderadas: no hay versiones con imatrix, lo que puede afectar a la calidad en cuantizaciones bajas frente a alternativas que sí las ofrecen.
- Producción: sin benchmarks, sin documentación de arquitectura y con cero descargas registradas en el momento de la ficha, no se recomienda su uso en producción sin una evaluación previa exhaustiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WePocketModel1.0-2B-GGUF
- Modelo base: https://huggingface.co/tencent/WePocketModel1.0-2B
- Página de descargas del autor: https://hf.tst.eu/model#WePocketModel1.0-2B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
