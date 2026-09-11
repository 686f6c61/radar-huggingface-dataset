# siddarthg44/anlp-a2-p1-moe_shared

## Resumen

`siddarthg44/anlp-a2-p1-moe_shared` es un modelo de traducción automática de arquitectura transformer decoder-only publicado por el usuario siddarthg44 como parte 1 de la asignación 2 de un curso de ANLP (Advanced Natural Language Processing). Se trata de un modelo académico de tamaño reducido (d_model = 512, 8 capas, 8 cabezas de atención, contexto de 256 tokens) cuyo interés técnico no reside en su rendimiento absoluto, sino en el uso de capas feed-forward de tipo mixture-of-experts (MoE) en la variante `moe_shared`, con 3 expertos enrutados y selección top_k = 1 más 1 experto compartido siempre activo.

El modelo se entrenó con un presupuesto de 40 millones de tokens sobre el conjunto `belumind/en-vi-ja-curated-500k-triplets` y está especializado en traducción de vietnamita a inglés y de japonés a inglés. El tokenizador es un BPE byte-level con 16.000 merges entrenado conjuntamente sobre los tres idiomas. La ventana de contexto de 256 tokens limita su uso a segmentos cortos (frases u oraciones), no a documentos completos.

Su relevancia es fundamentalmente docente y experimental: sirve como banco de pruebas reproducible para estudiar enrutamiento de expertos, especialización de expertos por idioma y equilibrio entre parámetros totales y parámetros activos en un MoE. No se ha publicado licencia, no tiene descargas ni valoraciones en HuggingFace y no se han divulgado resultados numéricos de benchmarks en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas feed-forward de tipo mixture-of-experts, variante `moe_shared` |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (configuración MoE: 3 expertos enrutados, top_k = 1, 1 experto compartido siempre activo, d_ff = 2048, match = "total") |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible (los pesos se distribuyen como checkpoint PyTorch en `best.pt`, sin variantes cuantizadas publicadas) |
| Idiomas soportados | inglés (en), vietnamita (vi), japonés (ja); la tarea declarada es traducción de vi→en y ja→en |
| Licencia | no disponible |
| Formato de pesos | `best.pt` (checkpoint serializado con `torch.save`, contiene pesos y configuración); no se distribuyen safetensors ni GGUF |
| Dimensión del modelo (d_model) | 512 |
| Número de capas | 8 |
| Número de cabezas de atención | 8 |
| Tokenizador | BPE byte-level, 16.000 merges, entrenado conjuntamente en en + vi + ja |
| Presupuesto de entrenamiento | 40.000.000 tokens |
| Dataset de entrenamiento | `belumind/en-vi-ja-curated-500k-triplets` |
| Tamaño del repositorio | 0,1 GB |
| Librería | PyTorch |
| Pipeline declarado | translation |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de 8 capas con d_model = 512 y 8 cabezas de atención. La innovación concreta respecto a un transformer denso está en las capas feed-forward: en lugar de una FFN única con d_ff = 2048, se emplea un bloque MoE con la variante `moe_shared`, configurada como `{'type': 'moe', 'd_ff': 2048, 'n_experts': 3, 'top_k': 1, 'n_shared': 1, 'match': 'total'}`. Esto implica que en cada token se activa el experto compartido (siempre) más 1 de los 3 expertos enrutados, mientras que los otros 2 expertos enrutados permanecen inactivos. El campo `match: "total"` indica que el cómputo de parámetros de la FFN MoE se dimensionó para igualar el total de una FFN densa equivalente, un detalle de diseño relevante para comparaciones de eficiencia entre denso y disperso.

El entrenamiento se realizó sobre el conjunto `belumind/en-vi-ja-curated-500k-triplets` (500.000 tripletas en inglés, vietnamita y japonés) con un presupuesto declarado de 40 millones de tokens. No hay información disponible sobre la composición exacta del dataset, la proporción de pares por dirección de traducción, la función de pérdida, ni sobre si se aplicaron técnicas de alineación posteriores al preentrenamiento (RLHF, DPO, etc.). Tampoco se documenta si hubo una fase de preentrenamiento multilingüe previa o si el modelo se entrenó desde cero. El tokenizador fue entrenado de forma conjunta sobre los tres idiomas, lo que sugiere vocabulario compartido y ausencia de tokenizadores separados por lengua.

## Capacidades

- Traducción automática de vietnamita a inglés y de japonés a inglés, tarea para la que fue entrenado explícitamente.
- Generación de texto autorregresiva propia de un transformer decoder-only, aunque sin ajuste específico para diálogo, instrucciones ni formato conversacional.
- Procesamiento de secuencias de hasta 256 tokens, adecuado para frases y oraciones cortas, no para párrafos largos ni documentos.
- Manejo de vocabulario multilingüe conjunto (en, vi, ja) mediante un único tokenizador BPE byte-level de 16.000 merges.
- Enrutamiento de tokens hacia expertos especializados: la model card menciona métricas de especialización de expertos en `eval.json`, lo que indica que el comportamiento por experto es un objeto de análisis deliberado del trabajo.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, modo "thinking", visión, audio ni otras modalidades.
- No se documentan capacidades de generación de código, matemáticas o seguimiento de instrucciones; el modelo es un traductor, no un asistente generalista.

## Casos de uso

- Traducción de frases cortas vi→en y ja→en en prototipos y pruebas de concepto: el modelo puede integrarse como componente de un script de traducción por segmentos, aprovechando su ventana de 256 tokens para procesar una oración cada vez.
- Investigación académica sobre MoE: sirve para estudiar cómo se distribuye el enrutamiento entre los 3 expertos enrutados y el experto compartido, y si emergen especializaciones por idioma o por tipo de token, dado que es un modelo pequeño y reproducible.
- Baseline en publicaciones de traducción de bajo recurso: al ser un modelo con presupuesto declarado de 40 millones de tokens, proporciona un punto de comparación barato frente a modelos preentrenados masivos en experimentos controlados.
- Pre-anotación de corpus para etiquetado humano: se puede usar para generar borradores de traducción en proyectos de construcción de datasets en vietnamita o japonés, con revisión posterior por traductores.
- Experimentación educativa sobre arquitecturas dispersas: el repositorio permite reproducir el ciclo completo (tokenizador propio, configuración MoE, checkpoint y métricas de evaluación) en un curso o taller de NLP.
- Fine-tuning sobre dominios verticales: su tamaño reducido permite reentrenarlo con datos de un dominio concreto (por ejemplo, documentación técnica o terminología médica) sin necesidad de infraestructura de GPU de gama alta.
- Generación de pares de traducción sintéticos a bajo coste: útil para aumentar datos de entrenamiento en idiomas con poca cobertura, aceptando la pérdida de calidad que implica un modelo de este tamaño.
- Despliegue en entornos sin GPU: al ser un modelo de menos de 0,1 GB, puede ejecutarse en CPU en servidores modestos, contenedores ligeros o equipos de desarrollo portátiles para tareas de traducción puntual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica que el repositorio incluye un fichero `eval.json` con métricas de perplejidad de test, BLEU y especialización de expertos, pero no se reproduce ninguno de sus valores en la documentación proporcionada. Por tanto, no es posible presentar una tabla comparativa de MMLU, HumanEval, GSM8K, BLEU, chrF ni perplejidad sin inventar cifras. Para obtener esos datos habría que descargar el fichero `eval.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio completo ocupa 0,1 GB, por lo que el checkpoint en punto flotante de 32 bits cabe holgadamente en menos de 1 GB de memoria, incluyendo activaciones con contexto de 256 tokens. Cualquier GPU con 2 GB o más es suficiente; incluso una GPU integrada o la CPU bastan.
- GPU recomendadas: no se requiere acelerador dedicado. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) o incluso una Apple Silicon con Metal es sobredimensionada para este modelo. No tiene sentido plantear A100 o H100 salvo para entrenamiento o evaluación masiva por lotes.
- Compatibilidad con GPU de consumo: sí, en cualquier modelo actual. También es viable la ejecución íntegra en CPU.
- Opciones de despliegue: la única vía documentada es PyTorch nativo mediante `src/model.py`, cargando el estado con `torch.load("best.pt", map_location="cpu", weights_only=False)` y reconstruyendo el modelo con `TransformerConfig.from_dict`. No hay soporte publicado para vLLM, TGI, llama.cpp, Ollama, Transformers de HuggingFace ni llama-cpp-python, ya que la arquitectura MoE `moe_shared` es personalizada y requiere el código del repositorio. Exportar a ONNX o TorchScript sería posible en teoría, pero requiere trabajo adicional no documentado.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| siddarthg44/anlp-a2-p1-moe_shared | no disponible | 256 tokens | en, vi, ja (traducción vi→en, ja→en) | no disponible | `best.pt` (PyTorch) |
| NLLB-200-distilled-600M (Meta) | ~600 M | 512 tokens | 200 idiomas, incluidos vi y ja | CC-BY-NC-4.0 | safetensors, PyTorch |
| mBART-large-50 (Meta) | ~610 M | 1024 tokens | 50 idiomas, incluidos vi y ja | MIT | safetensors, PyTorch |
| Helsinki-NLP/opus-mt-vi-en (Universidad de Helsinki) | ~77 M | 512 tokens | par vi-en | CC-BY-4.0 | safetensors, PyTorch |

Los datos de las tres alternativas provienen de su documentación pública y se incluyen como referencia de categoría, no como resultado de una evaluación comparativa ejecutada. No existen cifras de BLEU publicadas para `siddarthg44/anlp-a2-p1-moe_shared`, de modo que la comparación de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no hay autorización explícita para uso comercial ni para redistribución. Cualquier uso en producción requiere contactar con el autor.
- Ausencia total de validación externa: 0 descargas y 0 valoraciones en HuggingFace, y se trata de un trabajo de asignatura académica, no de un modelo probado en entornos reales.
- Contexto muy limitado: 256 tokens restringen el uso a frases u oraciones cortas. No admite documentos, diálogos largos ni contexto conversacional acumulado.
- Presupuesto de entrenamiento reducido: 40 millones de tokens es un volumen muy bajo en comparación con los cientos de miles de millones usados por modelos de traducción de referencia, por lo que cabe esperar una calidad de traducción claramente inferior.
- Riesgo elevado de alucinación y de traducciones incorrectas o inventadas, especialmente en terminología especializada, nombres propios, fechas y números.
- Direccionalidad limitada: se documenta el entrenamiento para traducir vi→en y ja→en. No hay evidencia de que funcione bien en la dirección inversa (en→vi, en→ja) ni entre vi y ja directamente.
- Sesgos desconocidos: no se ha publicado ninguna evaluación de sesgos, toxicidad o equidad sobre este modelo.
- Funcionamiento exclusivamente PyTorch con código propio: no es compatible con los runners estándar (llama.cpp, Ollama, vLLM, TGI), lo que complica su integración en pipelines existentes.
- Sin cuantizaciones publicadas: no hay versiones GGUF, GPTQ, AWQ o similares, de modo que el despliegue en hardware muy limitado requiere cuantizar manualmente.
- Idoneidad para producción muy baja: se recomienda tratarlo como artefacto de investigación y docencia, no como servicio de traducción fiable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/siddarthg44/anlp-a2-p1-moe_shared
- Dataset de entrenamiento citado en la model card: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos asociados a este modelo. Los resultados de búsqueda disponibles corresponden a plataformas de contratación pública italianas (SATER, Emilia-Romaña) sin relación alguna con el modelo.
