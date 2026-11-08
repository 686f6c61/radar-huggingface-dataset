# mradermacher/LFM3-1.7B-ARA-Abliterated-GGUF

## Resumen

LFM3-1.7B-ARA-Abliterated-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo Austriani/LFM3-1.7B-ARA-Abliterated, publicada por mradermacher. El modelo subyacente pertenece a la familia LFM3 de Liquid AI, un transformer híbrido de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) diseñado para despliegue en el borde (edge). La variante "Abliterated" aplica una técnica de "arbitrary-rank ablation" (ARA) orientada a eliminar los mecanismos de rechazo, dando como resultado un modelo descensurado.

El paquete incluye once cuantizaciones que van desde Q2_K (0,9 GB) hasta f16 (3,6 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidas GPU de consumo con poca VRAM o incluso CPU. La relevancia actual radica en la combinación de un modelo pequeño con arquitectura híbrida de atención y contexto largo, empaquetado para inferencia local con llama.cpp y ecosistemas compatibles.

La licencia es lfm1.0 (etiquetada como "other" en Hugging Face), heredada del modelo base de Liquid AI. El autor de las cuantizaciones es mradermacher, con soporte de su empresa nethype GmbH. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención híbrida y componentes convolucionales (hybrid-attention, convolutional) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la etiqueta del modelo indica long-context, sin cifra concreta) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia LFM3 de Liquid AI, con atención híbrida y componentes convolucionales, orientado a despliegue en el borde y a contexto largo. La variante ARA (arbitrary-rank ablation) aplica una ablación de rangos arbitrarios sobre el modelo original para eliminar los comportamientos de rechazo, con una divergencia KL reportada de 0,0374 respecto al modelo de partida según las etiquetas del repositorio. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron fases de RLHF o DPO en la información proporcionada.

Las cuantizaciones son estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf). No se han generado cuantizaciones ponderadas ni con imatrix para este modelo en el momento de la publicación, según indica el autor. El repositorio ocupa 15,9 GB en total, repartidos entre los distintos archivos GGUF.

## Capacidades

- Generación de texto conversacional y de instrucciones (chat, instruct).
- Escritura creativa y roleplay, según las etiquetas del repositorio.
- Razonamiento y uso como agente (etiquetas agent y reasoning en variantes relacionadas de la familia).
- Soporte de contexto largo (etiqueta long-context), sin cifra concreta disponible.
- Capacidades multilingües limitadas al inglés según el campo de idiomas.
- Modelo descensurado: los mecanismos de rechazo han sido ablacionados, por lo que responde a peticiones que el modelo original rechazaría.
- No se documentan capacidades de visión, audio ni tool calling en la información disponible.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede gestionar diálogos multi-turno en un equipo de sobremesa o portátil, ejecutándose con llama.cpp u Ollama sobre la cuantización Q4_K_M (1,2 GB), lo que lo hace viable en hardware sin GPU dedicada.
- Generación creativa y roleplay: la variante descensurada permite narrativa sin restricciones temáticas, adecuada para prototipos de ficción interactiva y experimentación con personajes, ejecutándose en local.
- Agentes ligeros en el borde: con 1,7 mil millones de parámetros y cuantización Q4_K_S, puede desplegarse en dispositivos con recursos limitados para tareas de clasificación, extracción o generación de respuestas cortas dentro de un pipeline de agente.
- Procesamiento por lotes en CPU: la cuantización Q2_K (0,9 GB) permite ejecutar inferencia por lotes en servidores sin GPU para tareas de etiquetado o generación masiva de texto en inglés.
- Evaluación de técnicas de ablación: útil para investigadores que quieran comparar el comportamiento del modelo con y sin ablación de rechazos, usando las distintas cuantizaciones para medir el impacto de la compresión en la calidad.
- Prototipado rápido de aplicaciones de chat: al ser un GGUF de pequeño tamaño, se integra fácilmente en entornos de desarrollo con Ollama o llama.cpp para validar flujos conversacionales antes de escalar a modelos mayores.
- Experimentación con contexto largo en hardware modesto: la arquitectura híbrida y la etiqueta long-context permiten probar tareas de resumen o recuperación sobre documentos extensos en local, siempre que se verifique empíricamente la ventana efectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para Q2_K, 1,2 GB para Q4_K_M, 1,9 GB para Q8_0 y 3,6 GB para f16, más el overhead del contexto y del runtime.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM puede ejecutar las cuantizaciones pequeñas; una RTX 3060, RTX 4060 o superior permite usar Q8_0 o f16 con contexto amplio. Para despliegues en servidor, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU con 4 GB o más, e incluso en iGPU y CPU para las cuantizaciones Q2_K a Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors es compatible con transformers. El repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput: no disponibles en la información proporcionada. El autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-ARA-Abliterated-GGUF (este) | 1,73 B | No disponible | lfm1.0 | GGUF | Descensurado, cuantizaciones estáticas |
| mradermacher/LFM3-1.7B-Surgical-Abliterated-GGUF | ~1,7 B | No disponible | lfm1.0 | GGUF | Variante de ablación quirúrgica de la misma familia |
| mradermacher/LFM3-1.7B-Uncensored-GGUF | ~1,7 B | No disponible | lfm1.0 | GGUF | Variante descensurada de la misma familia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado principalmente en inglés y descensurado, puede reproducir estereotipos y contenido sesgado sin los filtros del modelo original.
- Riesgo de alucinación: inherente a un modelo de 1,7 mil millones de parámetros; la compresión agresiva (Q2_K, Q3_K) puede incrementar la pérdida de coherencia y la tasa de errores factuales.
- Limitaciones de contexto e idioma: el modelo está etiquetado únicamente para inglés; no se garantiza un rendimiento correcto en castellano ni en otros idiomas. La longitud de contexto efectiva no está documentada y debe validarse empíricamente.
- Restricciones de licencia: la licencia lfm1.0 puede imponer condiciones para uso comercial; es necesario revisar el archivo LICENSE del modelo base antes de desplegarlo en producción.
- Modelo descensurado: la ablación de rechazos elimina salvaguardas, lo que implica riesgos de seguridad y de cumplimiento en entornos públicos o regulados; no es recomendable para aplicaciones orientadas al usuario final sin capas adicionales de moderación.
- Cuantizaciones de baja calidad: el autor advierte que Q3_K_M es de calidad inferior y que f16 es "overkill" para este tamaño; conviene priorizar Q4_K_M, Q5_K_M o Q6_K.
- Sin cuantizaciones ponderadas ni imatrix: el autor indica que no están disponibles y que podrían no planificarse.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-ARA-Abliterated-GGUF
- Modelo base: https://huggingface.co/Austriani/LFM3-1.7B-ARA-Abliterated
- Página de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-ARA-Abliterated-GGUF
- Variante Surgical-Abliterated: https://huggingface.co/mradermacher/LFM3-1.7B-Surgical-Abliterated-GGUF
- Variante Uncensored: https://huggingface.co/mradermacher/LFM3-1.7B-Uncensored-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
