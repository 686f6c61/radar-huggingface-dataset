# chutesai/parallax-8b-kappa

## Resumen

Parallax 8B kappa es un checkpoint de investigación de un modelo de lenguaje de arquitectura mixture-of-experts (MoE) desarrollado por Chutes AI. Forma parte de "kappa", una ejecución de entrenamiento de Parallax que sigue en curso: no es un modelo final, sino una instantánea de un entrenamiento inacabado. La peculiaridad principal es que se ha entrenado de forma descentralizada sobre GPUs de consumo repartidas en varios países, con hosts que no tienen conexión directa entre sí y que sincronizan a través de internet público.

Se trata de un modelo base: está preentrenado sobre una mezcla de texto web, documentos, matemáticas, código, conocimiento y libros, pero no ha pasado por ajuste por instrucciones, ajuste conversacional ni ajuste de seguridad. Por tanto, continúa texto en lugar de seguir instrucciones. Según la model card, ronda los 7,8B parámetros totales con aproximadamente 1,25B activos por token, emplea pesos de expertos ternarios (-1, 0, +1), usa el tokenizador de Llama 3 y entrena con un contexto de 4096 tokens.

Su relevancia actual es doble: por un lado, demuestra que es viable entrenar un MoE de este tamaño sobre hardware distribuido y heterogéneo (según la cobertura de prensa, 240 GPUs de consumo en 13 países por unos 6.500 dólares); por otro, publica exportaciones aproximadamente cada hora con métricas de validación, lo que permite seguir el entrenamiento en directo. El autor lo publica explícitamente como artefacto de investigación y no lo recomienda para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 64 capas: 18 recurrentes gated delta-rule (GDN2), 8 de atención de ventana deslizante (ventana 2048), 6 de atención dispersa y 32 capas mixture-of-experts |
| Parametros totales | ~7,8B (según model card). Nota: los safetensors del repo reportan 1.600.912.175 parámetros, discrepancia no aclarada en la información disponible |
| Parametros activos | ~1,25B por token |
| Longitud de contexto | 4096 tokens en entrenamiento; longitud de contexto en inferencia: no disponible |
| Tipos de cuantizacion | Pesos de expertos ternarios (-1, 0, +1) con escalas por fila; formato GGUF. Otras cuantizaciones (Q4_K_M, etc.): no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (un fichero de exportación de 2,52 GB por snapshot) |

## Arquitectura y entrenamiento

La arquitectura combina atención y recurrencia en un diseño híbrido. De las 64 capas, 18 son recurrentes gated delta-rule (GDN2), 8 usan atención de ventana deslizante con ventana de 2048 tokens, 6 emplean atención dispersa y 32 son capas MoE. El ancho es d_model 1152 y la activación de expertos es ReLU². Hay 4096 expertos enrutados (128 por capa MoE), de los que se activan 12 enrutados más 1 compartido por token. Los pesos de los expertos son ternarios (-1, 0, +1) con escalas por fila, con la restricción de que como máximo hay dos pares distintos de cero en cada grupo de ocho. Usa el tokenizador de Llama 3 con vocabulario ampliado a 128.384 y embeddings de entrada/salida atados. La escala de logits de salida es aprendible y está limitada a 3.0 tanto en entrenamiento como en inferencia.

El entrenamiento se apoya en dos técnicas distribuidas. El tronco denso se sincroniza mediante un esquema DiLoCo desacoplado sobre internet, mientras que los expertos enrutados se entrenan con adaptadores de bajo rango en las GPUs que los utilizan, y las actualizaciones de los adaptadores se pliegan en maestros de precisión completa que publican nuevas versiones ternarias. Los datos provienen de la mezcla "epsilon" de una ejecución anterior, no de FineWeb-Edu: siete fuentes que suman unos 1,09T tokens (dos mezclas generales de web, documento, matemáticas y código con cerca del 78% de los tokens, un conjunto web adicional, dos de matemáticas, uno de conocimiento y uno de libros), más dos fuentes de annealing que se incorporan al final. La ejecución está planificada como una sola pasada de unos 973B tokens. La tasa de aprendizaje tuvo un pico de 4e-4 tras un calentamiento de 8,7B tokens y después se mantuvo constante; por inestabilidad de ruido en el gradiente, se recortó a 0,5x (2e-4) el 2026-09-30 a las 07:05 UTC y a 0,25x (1e-4) a las 13:00 UTC. El batch pasó de 10 micro-lotes de acumulación de gradiente por paso (~8,2M tokens por paso de flota) a 20 (~16,4M) el 2026-09-29, y se elevó temporalmente a 40 entre las 08:00 y las 14:42 UTC del 2026-09-30.

## Capacidades

- Generación de texto base: el modelo completa y continúa texto; no sigue instrucciones ni mantiene formato conversacional.
- Preentrenamiento multidisciplinar: la mezcla de datos cubre web, documentos, matemáticas, código, conocimiento y libros.
- Razonamiento matemático y de código: hay dos conjuntos de matemáticas y fuentes de código en la mezcla, aunque no se publican resultados específicos por tarea.
- Capacidad multilingüe: limitada al inglés según los metadatos del modelo.
- Eficiencia de inferencia: los pesos ternarios y el tamaño de exportación (2,52 GB) permiten ejecución en hardware muy restringido; la cobertura de prensa menciona ejecución en CPU de teléfono a 59 tokens/s.
- Tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (requiere ajuste posterior).
- Modo thinking, visión o audio: no disponible.
- Instrucciones o diálogo: no soportado por diseño en este checkpoint.

## Casos de uso

- Investigación sobre entrenamiento descentralizado: el modelo sirve para estudiar cómo se comporta un MoE entrenado con DiLoCo sobre internet y GPUs heterogéneas, siguiendo las exportaciones horarias en el panel en vivo.
- Estudio de cuantización ternaria: permite analizar el impacto de pesos de expertos en {-1, 0, +1} con escalas por fila sobre la calidad del modelo comparando snapshots sucesivos.
- Base para experimentos de ajuste posterior: al ser un modelo base con licencia MIT, se puede partir de él para probar técnicas de instruction tuning o DPO propias, sin restricciones de licencia comercial.
- Pruebas de inferencia en hardware de gama baja: con exportaciones de 2,52 GB, es viable experimentar en CPU, dispositivos móviles o GPUs modestas para medir latencia y consumo.
- Análisis de la mezcla de datos: dado que la model card detalla la composición del dataset (web, matemáticas, código, libros), sirve para estudiar cómo esa mezcla se refleja en la salida del modelo.
- Reproducción y seguimiento de curvas de pérdida: los campos val_mix y las medias macro 0-shot/5-shot de cada export permiten estudiar la evolución del entrenamiento a lo largo de más de 620B tokens.
- Comparación de checkpoints intermedios: los snapshots publicados (600B, 612B, 623B tokens, etc.) permiten analizar la no monotonía de la calidad entre exportaciones.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Lo que sí ofrece son métricas de validación y medias macro de evaluación de las exportaciones. Las medias macro 0-shot y 5-shot no especifican en la información disponible qué conjunto de tareas agregan.

| Export (tokens / paso) | val_mix (nats/token) | Macro 0-shot | Macro 5-shot | Tamano | Exportado (UTC) |
|---|---:|---:|---:|---:|---|
| 623B-tokens_step43256 (última) | 2.088 | 54.4 | 58.6 | 2,52 GB | 2026-10-02 00:27 |
| 619B-tokens_step43018 | 2.092 | 54.6 | 58.4 | 2,52 GB | 2026-10-01 23:55 |
| 615B-tokens_step42744 | 2.095 | 54.7 | 58.6 | 2,52 GB | 2026-10-01 23:25 |
| 612B-tokens_step42498 | 2.097 | 54.7 | 58.6 | 2,52 GB | 2026-10-01 22:56 |
| 607B-tokens_step42229 | 2.099 | 54.9 | 58.9 | 2,52 GB | 2026-10-01 22:23 |
| 604B-tokens_step41990 | 2.104 | 54.3 | 58.3 | 2,52 GB | 2026-10-01 21:55 |
| 600B-tokens_step41726 | 2.085 | 53.3 | 57.4 | 2,52 GB | 2026-10-01 21:25 |
| 596B-tokens_step41482 | 2.105 | 53.3 | 58.0 | 2,52 GB | 2026-10-01 20:56 |
| 592B-tokens_step41213 | 2.082 | 53.3 | 57.5 | 2,52 GB | 2026-10-01 20:25 |

Resultados de benchmarks comparativos con otros modelos: no disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,5-3 GB para los pesos ternarios de una exportación (fichero de 2,52 GB), más overhead de contexto y runtime. Cifra exacta no disponible.
- GPU recomendadas: no especificadas por el autor. El tamaño reducido permite usar GPUs de gama de entrada o integradas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con más de 3-4 GB de VRAM. Modelos concretos no confirmados en la información disponible.
- Ejecución en CPU: la cobertura de prensa indica ejecución en CPU de teléfono a 59 tokens/s.
- Opciones de despliegue: los pesos se distribuyen en formato GGUF, compatible con runtimes de inferencia GGUF (por ejemplo llama.cpp/Ollama). El autor no detalla runtimes específicos ni soporte de vLLM, TGI o similar en la model card.
- Throughput y latencia: 59 tokens/s en CPU de teléfono según la prensa. Otras cifras (latencia en GPU, throughput en servidor) no disponibles.
- Almacenamiento: el repo completo ocupa 223,7 GB debido a la acumulación de exportaciones horarias; basta descargar una carpeta de `exports/` concreta.

## Comparativa con modelos similares

No se dispone de datos comparativos de benchmarks en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con otros modelos de tamaño o categoría similares. Como referencia cualitativa, el modelo se sitúa en la franja de MoE de menos de 10B parámetros con pocos parámetros activos (~1,25B) y pesos de baja precisión, una categoría poco poblada. Cualquier comparación numérica con alternativas (parámetros, contexto, rendimiento, licencia) queda como no disponible.

## Limitaciones y advertencias

- Modelo base sin ajustar: no sigue instrucciones, no es conversacional y no ha pasado por ajuste de seguridad; continuará texto en lugar de responder a peticiones.
- Checkpoint en curso: cada exportación es una instantánea de un entrenamiento inacabado; las exportaciones posteriores pueden diferir y la calidad entre ellas no es monótona (por ejemplo, la macro 0-shot oscila entre 53,3 y 54,9 en la ventana mostrada).
- No apto para producción: el propio autor lo etiqueta como artefacto de investigación y lo desaconseja para uso en producción.
- Riesgo de alucinación: al ser un modelo base preentrenado sobre web y otros corpus, puede generar afirmaciones falsas o incoherentes, especialmente sin ajuste posterior.
- Limitación de idioma: solo inglés (en).
- Contexto limitado: 4096 tokens en entrenamiento, con ventana deslizante de 2048 en parte de las capas; no hay evidencia de soporte de contexto extendido en inferencia.
- Inestabilidad de entrenamiento documentada: el autor recortó la tasa de aprendizaje por inestabilidad de ruido en el gradiente durante la ejecución.
- Discrepancia de parámetros: los safetensors del repo reportan 1.600.912.175 parámetros frente a los ~7,8B de la model card; no se aclara el origen de la diferencia en la información disponible.
- Licencia: MIT, permisiva y sin restricciones declaradas para uso comercial, pero concedida sobre un artefacto que el autor declara no apto para producción; conviene verificar términos del repositorio antes de cualquier uso.
- Estado de finalización: la ejecución está planificada hasta ~973B tokens y por ahora ronda los 623B publicados, por lo que los pesos son inherentemente provisionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chutesai/parallax-8b-kappa
- Panel de entrenamiento en vivo: https://parallax.chutes.ai/
- Sitio de Chutes AI: https://chutes.ai/
- Cobertura de prensa (entrenamiento en GPUs de consumo, coste y ejecución en CPU de teléfono): https://cryptobriefing.com/chutes-ai-parallax-gaming-gpu-model/
- Hilo de Chutes sobre el registro de entrenamiento (X): https://x.com/chutes_ai/article/2102458571942424881
- Publicación de Chutes sobre la construcción de datos (X): https://x.com/chutes_ai/status/2083251455268421660
