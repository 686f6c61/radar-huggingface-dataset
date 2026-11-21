# chadstthomas/MagicEightBall-FP32

## Resumen

MagicEightBall FP32 es un modelo de decisión determinista publicado por el usuario chadstthomas en Hugging Face. No es un modelo de lenguaje generativo en el sentido habitual: se trata de un grafo ONNX de 1.832 bytes que evalúa siete hechos booleanos de entrada (FP32) y devuelve siete salidas booleanas FP32, junto con una categoría y una acción propuesta. Las reglas de decisión están compiladas directamente en los pesos del grafo, de modo que el modelo aplica una política de soporte fija en lugar de generar texto libre.

El modelo se distribuye junto a un runner de CPU (`portable_runtime.py`) y un tokenizador compartido (Needle 3, empaquetado sin pérdida y con licencia Apache-2.0), que permite procesar documentos de hasta 131.072 tokens. La verificación reportada por el autor cubre las 128 asignaciones posibles de los siete hechos booleanos, 128 fixtures de texto corto, dos documentos en el límite exacto y el rechazo de entradas de 131.073 tokens.

Su relevancia es acotada pero específica: sirve como referencia de precisión completa (FP32) para una política de enrutamiento de tickets de soporte, útil para comparar contra las variantes ONNX (192 bytes) y GGUF (1.024 bytes) del mismo autor, y como ejemplo de empaquetado reproducible con checksums y procedencia de tokenizador documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX determinista (motor de reglas compilado, no transformer) |
| Parametros totales | No disponible (modelo de 1.832 bytes; sin recuento de parámetros publicado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 131.072 tokens Needle 3 en el runner de CPU incluido; rechazo a 131.073 tokens |
| Tipos de cuantizacion | FP32 (variante base); el autor publica también ONNX y GGUF como artefactos separados |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT para reglas y runner; Apache-2.0 para el tokenizador Needle 3 (licencia compuesta "mit-and-apache-2.0") |
| Formato de pesos | ONNX (`model.onnx`), FP32 denso |

## Arquitectura y entrenamiento

La arquitectura es un grafo ONNX denso en FP32 que lee siete hechos booleanos de entrada y emite siete salidas booleanas FP32, además de categoría y acción propuesta. Los pesos no provienen de entrenamiento con descenso de gradiente: el autor indica que fueron "compilados a partir de las reglas de soporte", es decir, la política se codifica directamente en el grafo. No hay datos de entrenamiento, número de tokens, composición de dataset ni etapas de RLHF/DPO porque no existe un proceso de aprendizaje.

La innovación técnica, en la medida en que la hay, es de empaquetado y verificación: un modelo de decisión de tamaño trivial con tokenizador de contexto largo (Needle 3, hasta 131.072 tokens), checksums SHA-256 publicados, aviso de procedencia del tokenizador y un informe de verificación que cubre exhaustivamente el espacio de entrada booleano (128 asignaciones). El runner es un script Python que depende de `numpy`, `sentencepiece` y `onnxruntime`.

## Capacidades

- Evaluación de una política de soporte fija: devuelve un booleano (`may_route`), una categoría (por ejemplo `billing`) y una acción propuesta (por ejemplo `review_billing`).
- Detección de frases declaradas en la política dentro de texto de entrada, incluida la negación explícita ("Do not route.") que invierte la decisión.
- Procesamiento de documentos largos hasta 131.072 tokens Needle 3 mediante el runner de CPU incluido.
- Salida estructurada como datos para revisión humana; el autor insiste en que la acción propuesta es "data for review".
- Ejecución determinista en CPU, sin GPU, con verificación exhaustiva del espacio de entrada booleano.
- No soporta generación de texto libre, tool calling genérico, razonamiento multi-paso, visión, audio ni capacidades multilingües (solo inglés).

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar una consulta como `billing` y proponer `review_billing` cuando aparecen frases como "Duplicate charge. Review authorized.", dejando la decisión final a un revisor humano.
- Filtro de seguridad previo a un LLM: usar el booleano `may_route` como puerta determinista antes de enviar texto a un modelo generativo, con la ventaja de que el comportamiento es auditable y reproducible bit a bit.
- Referencia de precisión completa en pruebas de regresión: comparar las salidas FP32 contra las variantes ONNX (192 bytes) y GGUF (1.024 bytes) del mismo autor para detectar divergencias de empaquetado.
- Validación de pipelines de tokenización de contexto largo: emplear los documentos de 131.072 tokens y el caso de rechazo a 131.073 para verificar límites en sistemas que integren Needle 3.
- Despliegue en entornos con restricciones extremas de memoria: el grafo de 1.832 bytes más `onnxruntime` cabe en cualquier CPU, incluidos dispositivos embebidos, sin acelerador.
- Ejemplo docente de empaquetado reproducible: el repositorio incluye checksums, aviso de procedencia del tokenizador y un informe de verificación que sirven como plantilla de buenas prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta únicamente resultados de verificación funcional: 128 asignaciones de hechos, 128 fixtures de texto corto, dos documentos en el límite exacto de 131.072 tokens y rechazo correcto a 131.073 tokens. No hay métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas de latencia o throughput en los datos proporcionados.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. El grafo ocupa 1.832 bytes y las dependencias (`numpy`, `sentencepiece`, `onnxruntime`) dominan el consumo de memoria.
- GPU recomendadas: ninguna necesaria. El autor menciona ejecución en CPU y en Intel NCS1 (Neural Compute Stick) para la variante nativa.
- Cabe en cualquier GPU consumer y en cualquier CPU; también en dispositivos embebidos.
- Opciones de despliegue: `onnxruntime` con el runner `portable_runtime.py` proporcionado; variantes ONNX y GGUF publicadas por el mismo autor.
- Latencia y throughput: no disponibles en la información proporcionada; el autor enlaza a una comparativa de runtimes CPU y NCS1 en la página del modelo nativo, sin cifras en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MagicEightBall FP32 (este) | No disponible (1.832 bytes) | 131.072 tokens (runner) | ONNX FP32 | MIT + Apache-2.0 | Referencia densa de precisión completa |
| MagicEightBall ONNX | No disponible (192 bytes) | No disponible | ONNX | MIT + Apache-2.0 | Variante compacta del mismo autor |
| MagicEightBall GGUF | No disponible (1.024 bytes) | No disponible | GGUF | MIT + Apache-2.0 | Variante para ecosistema GGUF |
| MagicEightBall nativo (NCS1) | No disponible | No disponible | Nativo | MIT + Apache-2.0 | Ejecución en Intel NCS1 |

No se dispone de comparaciones con modelos de decisión de terceros en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no generaliza; solo aplica una política fija compilada en el grafo.
- Solo inglés; no hay soporte multilingüe declarado.
- La detección se limita a las frases declaradas en la política; paráfrasis no contempladas pueden no detectarse.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de falsos negativos y positivos ante entradas fuera del vocabulario de reglas.
- La acción propuesta es un dato para revisión humana, no una decisión autónoma; el autor lo indica explícitamente.
- Licencia compuesta: las reglas y el runner son MIT, pero el tokenizador Needle 3 es Apache-2.0; hay que respetar ambas al redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB; la adopción y el mantenimiento son inciertos.
- No hay pipeline declarado en Hugging Face ni benchmarks publicados, lo que dificulta evaluar su idoneidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chadstthomas/MagicEightBall-FP32
- Modelo nativo (NCS1 y packs de industria): https://huggingface.co/chadstthomas/MagicEightBall
- Variante ONNX: https://huggingface.co/chadstthomas/MagicEightBall-ONNX
- Variante GGUF: https://huggingface.co/chadstthomas/MagicEightBall-GGUF
- Comparativa de runtimes CPU y NCS1: https://huggingface.co/chadstthomas/MagicEightBall#runtime-comparison
- Comparativas de tamaño: https://huggingface.co/chadstthomas/MagicEightBall#size-comparisons
