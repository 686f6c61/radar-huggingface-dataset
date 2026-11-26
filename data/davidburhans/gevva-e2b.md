# davidburhans/gevva-e2b

## Resumen

Gevva e2b es un cross-encoder de clasificación de secuencias (NLI de tres clases) construido por davidburhans sobre el checkpoint multimodal `google/gemma-4-E2B-it`. No es un modelo generativo: en lugar de producir texto token a token, evalúa pares premisa-hipótesis en un único forward pass y devuelve una distribución de probabilidad calibrada sobre tres clases (contradicción, implicación, neutro). El autor lo enmarca como un "motor de decisión System 1", orientado a tareas discretas donde la generación autorregresiva resulta lenta y cara: detección de alucinaciones en pipelines RAG, enrutado de herramientas, reranking y corrección de respuestas con rúbrica.

El modelo hereda del backbone Gemma 4 E2B su naturaleza multimodal (incluye codificador visual SigLIP) y una ventana de contexto declarada de 128k tokens, aunque el uso previsto es la clasificación de pares cortos. Cuenta con 5.104.303.683 parámetros totales según los safetensors del repositorio, un tamaño de repo de 30,7 GB y pesos en safetensors compatibles con `transformers`.

Su relevancia práctica está en la latencia: el autor declara 16,5 ms P50 de latencia de forward en una RTX 5090, con un consumo de VRAM en torno a 4,8 GB para pares cortos. Se distribuye con licencia Apache 2.0, lo que facilita su integración en productos comerciales, y con un paquete Python propio (`gevva`) que abstrae la carga y la inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder de clasificación de secuencias sobre backbone transformer multimodal Gemma 4 (E2B), con codificador visual SigLIP |
| Parámetros totales | 5.104.303.683 (5,10B; incluye 2,3B de backbone de texto activo, codificador visual SigLIP y tabla de embeddings de vocabulario de 262K) |
| Parámetros activos | no disponible (el autor no declara configuración MoE; describe 2,3B de backbone de texto activo) |
| Longitud de contexto | 128k tokens (declarado en los tags del modelo) |
| Tipos de cuantización | no disponible (el autor solo documenta bfloat16, ~10,2 GB de descarga) |
| Idiomas soportados | en, fr, es, de, zh, ar, hi, ru, sw, vi, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un checkpoint instructivo multimodal de la familia Gemma 4. Sobre esa base se añade una cabeza de clasificación de secuencias que transforma la representación del par (premisa, hipótesis) en una distribución de tres clases: contradicción (0), implicación (1) y neutro (2). El diseño es de cross-encoder: premisa y hipótesis se procesan conjuntamente con atención cruzada, lo que permite capturar interacciones finas entre ambas cadenas, a diferencia de un bi-encoder que codifica cada una por separado. El pipeline declarado en Hugging Face es `text-classification` y la tarea de la model-index es `natural-language-inference`.

La model card no detalla la composición del dataset de ajuste fino, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO. Sí se declaran métricas de calibración en los metadatos (`brier_score`, `expected_calibration_error`), lo que sugiere que el ajuste buscó explícitamente probabilidades calibradas, un requisito habitual cuando la salida se usa como umbral de decisión en producción. El autor también menciona que el modelo conserva el codificador visual SigLIP del checkpoint base, aunque no documenta si se entrenó con pares que incluyeran imagen. No hay información disponible sobre innovaciones de decodificación especulativa o atención lineal.

## Capacidades

- Clasificación NLI de tres clases (contradicción, implicación, neutro) en un único forward pass, con salida de probabilidades calibradas.
- Detección de alucinaciones: comparación de una afirmación generada contra el contexto recuperado para decidir si está respaldada o la contradice.
- Enrutado de herramientas e intenciones: selección de la herramienta o acción más adecuada entre un conjunto de descripciones, mediante la función `rerank`.
- Reranking de candidatos: ordenación de documentos, respuestas o descripciones según su adecuación a una consulta.
- Corrección de respuestas con rúbrica: comparación de una respuesta candidata contra una referencia para emitir un veredicto de corrección con confianza.
- Capacidad multimodal heredada: incluye codificador visual SigLIP del checkpoint base, aunque el autor no documenta el rendimiento en pares con imagen.
- Ventana de contexto de 128k tokens declarada, útil para verificación sobre documentos largos.
- Soporte multilingüe declarado en diez idiomas más la etiqueta `multilingual`: inglés, francés, español, alemán, chino, árabe, hindi, ruso, suajili y vietnamita.
- Integración con `transformers` y con el paquete `gevva`, que detecta automáticamente CUDA, MPS o CPU.

## Casos de uso

- Detección de alucinaciones en RAG: tras recuperar documentos y generar una respuesta, se envía cada afirmación como hipótesis y el fragmento recuperado como premisa; si la probabilidad de contradicción supera un umbral (el autor ejemplifica 0,70), se marca la respuesta para revisión o regeneración. La latencia de milisegundos permite verificar cada frase sin penalizar la experiencia de usuario.
- Enrutado de herramientas en asistentes: con las descripciones de las herramientas disponibles como candidatos, `rerank` selecciona la acción más probable para el mensaje del usuario, sustituyendo una llamada generativa lenta por una clasificación de un solo paso.
- Reranking en pipelines de búsqueda: reordenar los documentos recuperados por un buscador vectorial según su implicación respecto a la consulta, mejorando la precisión del contexto que se pasa al LLM generador.
- Corrección automática de exámenes y evaluaciones: comparar la respuesta del estudiante con la solución de referencia mediante `grade`, obteniendo un veredicto de corrección y una puntuación de confianza que permite derivar los casos dudosos a revisión humana.
- Verificación de hechos en moderación de contenidos: contrastar afirmaciones de usuarios contra fuentes de referencia y clasificar cada una como respaldada, contradicha o no verificable, con umbrales ajustables por política.
- Validación de salidas en pipelines de CI/CD de contenido: comprobar que los textos generados por modelos no contradicen la documentación de producto antes de publicarlos, usando la clase de contradicción como puerta de calidad.
- Filtrado de pares pregunta-respuesta para curación de datasets: descartar pares donde la respuesta contradice el contexto de origen, reduciendo ruido antes del entrenamiento de otros modelos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente):

| Métrica | Valor |
|---|---|
| Gate Hard Accuracy | 56,95 |
| RAGTruth Served F1@0.5 | 0,715 |
| JevBench Public Accuracy | 71,43 |
| Forward Latency (RTX 5090 P50) | 16,5 ms |

El autor menciona además una puntuación de 77,54 en el split público de JevBench en el badge de la model card, cifra que no coincide con el 71,43 de la model-index; se recogen ambas tal como aparecen. No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparativas directas con otros cross-encoders en la información disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 4,8 GB para pares cortos (<128 tokens) en bfloat16, según la tabla del autor; la descarga completa en bfloat16 es de ~10,2 GB.
- GPU recomendadas: RTX 5090 para el escenario medido (14-19 ms por par corto); cualquier GPU con al menos 6-8 GB de VRAM debería poder alojar el modelo en bfloat16, aunque no se documentan latencias en otras tarjetas.
- Cabe en GPU de consumo: sí, con 8 GB o más de VRAM en bfloat16; no se documentan requisitos para cuantizaciones de 4 u 8 bits.
- Opciones de despliegue: `transformers` de forma nativa y el paquete `gevva` (`pip install gevva`), que selecciona automáticamente CUDA, MPS o CPU. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 16,5 ms P50 de forward en RTX 5090 para pares cortos; el rango medido es de 14-19 ms. No se publica throughput agregado ni latencia en CPU o MPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gevva e2b | 5,10B | 128k | NLI de 3 clases, cross-encoder | Apache 2.0 | Hugging Face, PyPI |
| Cross-encoders NLI tipo DeBERTa | no disponible en la información | no disponible | NLI de 3 clases | no disponible | no disponible |
| LLM generativo para verificación (p. ej. Gemma 4 E2B-it base) | 5,10B (base) | 128k | Generación y verificación por prompting | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada. La comparación cualitativa relevante es frente a la verificación mediante generación autorregresiva: el cross-encoder resuelve la decisión en un forward pass de milisegundos, mientras que un LLM generativo típicamente requiere de 1 a 3 segundos por respuesta según el autor.

## Limitaciones y advertencias

- Modelo de clasificación, no generativo: no produce texto libre ni mantiene conversaciones; cualquier uso como chatbot requeriría combinarlo con un LLM generador.
- Sesgos: no se documenta ninguna evaluación de sesgos; al derivar de Gemma 4 y de datos de ajuste no publicados, puede heredar sesgos del backbone y del corpus de entrenamiento.
- Riesgo de alucinación: aunque su función es detectarla, la salida es probabilística; umbrales mal calibrados producen falsos positivos y negativos. El autor no documenta tasas de error por dominio.
- Rendimiento limitado en la tarea principal: la Gate Hard Accuracy declarada es de 56,95, lo que indica un margen considerable de error en el conjunto de evaluación del autor.
- Cobertura idiomática: se declaran diez idiomas, pero no se publican métricas por idioma; el rendimiento fuera del inglés no está verificado.
- Capacidad multimodal no documentada: el codificador SigLIP está presente, pero no hay evidencia publicada de rendimiento en pares con imagen.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del checkpoint base de Google (`gemma-4-E2B-it`) por si imponen condiciones adicionales.
- Datos de rendimiento no verificados: todas las métricas y latencias provienen del autor y están marcadas como no verificadas en la model-index.
- Ecosistema limitado: no se documenta soporte en motores de inferencia estándar como vLLM o TGI, lo que puede complicar el despliegue a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidburhans/gevva-e2b
- Repositorio GitHub: https://github.com/davidburhans/gevva
- Paquete PyPI: https://pypi.org/project/gevva/
- Demo interactiva: https://huggingface.co/spaces/davidburhans/gevva-demo
- Notebook de inicio rápido: https://colab.research.google.com/github/davidburhans/gevva/blob/main/notebooks/gevva_quickstart.ipynb
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
