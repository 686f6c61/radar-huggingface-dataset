# da24b046/leak-curber-submission-15

## Resumen

`da24b046/leak-curber-submission-15` es un artefacto de inferencia empaquetado para una tarea de clasificación de reacciones enzimáticas (predicción de un código EC, Enzyme Commission) a partir de texto de reacción. No es un modelo de lenguaje generativo al uso: se trata de un ensemble de cinco "expertos" neuronales, cuatro de ellos congelados (indexados como S13) y uno nuevo, un codificador disperso de texto de reacción con pesos recién ajustados. El autor lo publica como envío ("submission") a una competición, con un pipeline de predicción offline en NumPy puro.

El componente nuevo aprende de características textuales hasheadas de n-gramas de caracteres (3–5 gramos) de tamaño 32768, proyectadas a 256 dimensiones y entrenadas con prototipos coseno sobre jerarquía EC (EC1/EC2/EC3). El modelo base S13 combina pesos neuronales con recuperación k5 (95 % neuronal / 5 % retrieval) y calibración de temperatura. La mezcla del nuevo experto con S13 se controla mediante parámetros de receta (temperatura, peso, tipo de pooling y compuerta).

El interés es acotado y muy específico: es un envío reproducible, sin GPU, que corre en CPU con 16 GiB de RAM y 900 segundos de límite, y que documenta explícitamente sus límites metodológicos (exposición al test público histórico, ausencia de validación cruzada independiente). No hay información sobre arquitectura transformer, parámetros totales ni contexto lingüístico; la ficha refleja esa escasez de datos sin inferir valores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 5 expertos: 4 expertos estructurales congelados (S13) + 1 codificador neuronal disperso de texto de reacción (32768 → 256, LayerNorm/ReLU/dropout → salida firmada de 256) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada es texto de reacción, no secuencia conversacional) |
| Tipos de cuantizacion | no disponible (inferencia en NumPy con logits redondeados a 4 decimales; sin cuantización declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos propios del codificador; el paquete se ejecuta con `python /app/predict.py`, sin torch/GPU) |

## Arquitectura y entrenamiento

El sistema es un ensemble de cinco expertos. Cuatro son "expertos estructurales/índices congelados" que constituyen la base S13, con pesos neuronales .25/.25/.125/.375, potencia .25, nitidez .85, mezcla de 95 % neuronal y 5 % recuperación k5, temperatura .02 y beta L3 .15. El quinto experto es nuevo: un codificador de texto de reacción disperso que aprende de características hasheadas de n-gramas de caracteres 3–5 (dimensiones 32768), con eliminación de sufijos de mapas de átomos solo como característica y truncado de lados largos. La agrupación exacta de reacciones y el primer ID se preservan; las diferencias son textuales, no grafos de cambio de enlace verificados con mapas de átomos.

El codificador nuevo proyecta 32768 → 256 con LayerNorm, ReLU y dropout, y produce una salida firmada de 256 dimensiones; se entrena con prototipos coseno EC y padres compartidos EC1/EC2/EC3, escala y sesgos de clase, con LayerNorm por fila y sin estadísticas del corpus de consulta. La configuración seleccionada es época 16, temperatura 0.75, peso 0.05, pooling lineal y compuerta "none". La posterior del nuevo experto se calibra por temperatura y se mezcla con S13 de forma lineal o geométrica normalizada; si la compuerta fuese "uncertain" (no es el caso seleccionado), se mezclaría solo donde el margen top-2 de S13 fuese < .15 y el máximo del nuevo experto > .25. El entrenamiento usó las filas originales de entrenamiento por split aleatorio/químico, semilla 3410, con épocas evaluadas 8/16/24/32/40 y selección solo en desarrollo. El envío anterior débil S15 se conserva en `references/submission_15_conservative`.

## Capacidades

- Predicción de un código EC (vocabulario completamente especificado) a partir de texto de reacción en formato JSONL.
- Clasificación jerárquica EC mediante prototipos coseno con padres EC1/EC2/EC3 compartidos.
- Mezcla calibrada de un experto textual nuevo con una base neuronal + recuperación k5.
- Inferencia offline en CPU con NumPy portable, sin torch, GPU ni red.
- Salida determinista con logits redondeados a 4 decimales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni thinking mode (no declarado).
- Capacidades multilingües: no disponible.

## Casos de uso

- Anotación asistida de reacciones enzimáticas: dado un texto de reacción, el modelo emite un código EC candidato que un curador puede revisar, adecuado por su salida de vocabulario cerrado y su ejecución offline.
- Prellenado de bases de datos de bioquímica: integración en pipelines por lotes que procesan JSONL de entrada y generan predicciones EC para triaje previo a revisión manual.
- Clasificación en entornos sin GPU: el requisito de 2 CPU y 16 GiB con límite de 900 segundos lo hace desplegable en contenedores modestos o CI.
- Reproducción de envíos de competición: el paquete permite reejecutar exactamente la predicción seleccionada (época 16, temperatura 0.75) para auditoría.
- Comparación de estrategias de ensemble: sirve como referencia para estudiar la mezcla de un experto textual disperso con una base neuronal + retrieval.
- Filtrado de candidatos en búsqueda de enzimas: uso del código EC predicho para restringir el espacio de búsqueda antes de métodos más costosos.
- Prototipado de características textuales: el esquema de n-gramas hasheados 3–5 puede reutilizarse como línea base en tareas de texto científico corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la puntuación oficial de S15 es desconocida y que la exposición al test público histórico y al checkpoint original del backbone impide una estimación independiente o de validación cruzada anidada, sin garantía de mejora oficial.

## Requisitos de hardware

- CPU: 2 núcleos suficientes según la model card (`offline2CPU`).
- RAM: 16 GiB.
- GPU: no necesaria; la inferencia es NumPy puro, sin torch ni GPU.
- VRAM estimada: no aplica (0 VRAM).
- Tiempo: límite de 900 segundos, incluyendo la descarga y carga del evaluador (la descarga en frío no se midió localmente).
- Tamaño del paquete: < 4 GiB; tamaño del repositorio en Hugging Face: 0.9 GB.
- Salida: < 16 MiB.
- Opciones de despliegue: ejecución directa con `python /app/predict.py --input INPUT --output OUTPUT`; no se declaran vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificación EC a partir de texto de reacción) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el modelo aprende de características textuales hasheadas y de la distribución de sus filas de entrenamiento, sin análisis de sesgo publicado.
- Riesgo de alucinación: no aplica en sentido generativo, pero puede emitir un código EC incorrecto con alta confianza; la salida es siempre un EC del vocabulario, no una abstención.
- Las diferencias entre reacciones son textuales, no grafos de cambio de enlace verificados con mapas de átomos; esto limita la fidelidad química de las representaciones.
- Exposición al test público histórico y al checkpoint original del backbone: no hay estimación independiente ni validación cruzada anidada, y no se garantiza mejora oficial.
- La puntuación oficial de S15 es desconocida.
- Licencia no disponible: verificar antes de cualquier uso comercial.
- Idiomas soportados no disponibles.
- El paquete no incluye datasets, salidas de desarrollo, cachés, credenciales ni notas de estudio; la reproducibilidad depende de los scripts incluidos.
- No hay acción de autenticación de agente, subida ni interacción con leaderboard.

## Enlaces

- Hugging Face: https://huggingface.co/da24b046/leak-curber-submission-15
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
