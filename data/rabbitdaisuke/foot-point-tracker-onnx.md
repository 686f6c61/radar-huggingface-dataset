# RabbitDaisuke/Foot-Point-Tracker-onnx

## Resumen

Causal BootsTAPIR es un modelo de seguimiento de puntos (point tracking) desarrollado originalmente por Google DeepMind dentro del proyecto TAPNet y distribuido en este repositorio por RabbitDaisuke como una conversión a ONNX. El modelo toma un fotograma RGB de 256x256 píxeles y tres coordenadas iniciales, y predice la posición de esos tres puntos a lo largo de una secuencia de vídeo, junto con dos logits de incertidumbre por punto. No se trata de un detector semántico de pies ni de un modelo de reconstrucción 3D: el nombre "Foot-Point-Tracker" hace referencia al caso de uso previsto (seguimiento de puntos en el pie), pero la funcionalidad es un tracker de puntos genérico y causal.

La variante "causal" implica que el modelo procesa los fotogramas de forma incremental, manteniendo un estado recurrente (`causal_state`) que se actualiza paso a paso, en lugar de requerir la secuencia completa de vídeo como entrada. Esto lo hace apto para inferencia en streaming o en tiempo real. La conversión a ONNX se realizó mediante GitHub Actions y se divide en tres grafos: encoder, query y recurrent-step.

El interés de esta ficha radica en que ofrece los pesos oficiales de Google convertidos a un formato portable (ONNX) con licencia Apache-2.0, lo que facilita su despliegue en entornos sin PyTorch o en navegador mediante ONNX Runtime Web. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con estado recurrente (BootsTAPIR, TAPNet) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa fotogramas de forma incremental con estado recurrente) |
| Tipos de cuantización | no disponible (pesos ONNX float32; el autor no documenta cuantizaciones) |
| Idiomas soportados | no aplica (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (tres grafos: encoder, query, recurrent-step) |

## Arquitectura y entrenamiento

El modelo es una variante causal de BootsTAPIR, la versión con estado recurrente del tracker TAPIR de Google DeepMind. La arquitectura se basa en un encoder de imagen que extrae características del fotograma de 256x256 píxeles, un módulo de consulta (query) que incorpora las tres coordenadas iniciales en el primer fotograma, y un paso recurrente (recurrent-step) que actualiza el estado causal y las posiciones de los puntos en cada fotograma posterior. La extracción de la consulta en el primer fotograma usa un muestreo 2D matemáticamente equivalente a la implementación 5D oficial, ya que el tiempo está fijado a cero; el autor indica que se verificó contra la implementación oficial de 5D.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que la model card no lo detalla y remite a los pesos y al código fuente de TAPNet. La innovación técnica destacable es el procesamiento causal con estado recurrente, que permite inferencia incremental sin necesidad de la secuencia completa. La conversión a ONNX se validó numéricamente mediante una comparación en GitHub Actions usando una imagen pública con licencia CC BY y movimiento/oclusión artificiales; el autor advierte explícitamente que esta comparación verifica la corrección numérica de la conversión, no la calidad del seguimiento en pies reales ni la recuperación de oclusiones.

## Capacidades

- Seguimiento de puntos (point tracking) a partir de tres coordenadas iniciales en el primer fotograma.
- Predicción de trayectorias en píxeles (coordenadas xy) a lo largo de una secuencia de vídeo.
- Salida de dos logits de incertidumbre por punto, útiles para filtrar predicciones poco fiables.
- Procesamiento causal con estado recurrente, apto para inferencia en streaming fotograma a fotograma.
- Entrada RGB float32 de forma `[1,1,256,256,3]` normalizada en `[-1,1]`; consultas `[1,3,2]` en orden `(y,x)`.
- Ejecución en ONNX Runtime, incluida la verificación estática de cobertura de operadores para ONNX Runtime Web 1.22.0 con WebGPU.
- No incluye detección semántica de pies, reconstrucción 3D ni articulación independiente de dedos.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Seguimiento de puntos en vídeo de biomecánica del pie: dado un vídeo de marcha o carrera, se inicializan tres puntos en el primer fotograma (por ejemplo, talón, primer metatarsiano y base del quinto metatarsiano) y el modelo predice su trayectoria en los fotogramas siguientes, lo que permite analizar el movimiento sin depender de marcadores físicos.
- Análisis de marcha en aplicaciones clínicas o deportivas: el estado causal permite procesar secuencias largas de forma incremental, manteniendo un consumo de memoria acotado y facilitando el análisis en tiempo real o en dispositivos con recursos limitados.
- Integración en navegador mediante ONNX Runtime Web con WebGPU: la conversión a ONNX y la verificación estática de cobertura de operadores permiten desplegar el tracker en aplicaciones web sin backend, útil para demos interactivas o herramientas de anotación.
- Anotación asistida de vídeo: el modelo puede predecir trayectorias de puntos seleccionados manualmente en el primer fotograma, reduciendo el trabajo de etiquetado en datasets de movimiento.
- Seguimiento de oclusiones parciales: los logits de incertidumbre permiten detectar fotogramas en los que el punto queda ocluido y descartar o marcar esas predicciones, útil en pipelines de control de calidad.
- Prototipado de investigación en tracking causal: al ser una conversión fiel de los pesos oficiales, sirve como base para comparar variantes causales frente a no causales en experimentos académicos.
- Despliegue en entornos sin PyTorch: el formato ONNX permite ejecutar el modelo en C++, C#, Java o JavaScript mediante ONNX Runtime, lo que amplía su integración en aplicaciones de escritorio y móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la comparación en GitHub Actions solo verifica la corrección numérica de la conversión, no la calidad del seguimiento ni la precisión en recuperación de oclusiones, y que la latencia y el uso de memoria en GPU (RTX) no se midieron en la comparación con CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,2 GB, lo que sugiere que los pesos caben holgadamente en cualquier GPU consumer, pero el autor no documenta el uso de memoria en ejecución.
- GPU recomendadas: no disponible. El autor no proporciona mediciones de latencia ni de memoria en GPU.
- Compatibilidad con GPU consumer: presumiblemente sí, dado el tamaño del repositorio (0,2 GB) y la entrada de 256x256, pero no hay datos confirmados.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), ONNX Runtime Web 1.22.0 con WebGPU (cobertura de operadores verificada estáticamente, no ejecutada).
- Latencia y throughput: no disponibles. El autor indica explícitamente que no se midieron latencia ni uso de memoria en RTX.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Causal BootsTAPIR (este) | no disponible | 256x256, 3 puntos, estado recurrente | ONNX | Apache-2.0 | HuggingFace (RabbitDaisuke) |
| BootsTAPIR oficial (Google) | no disponible | no disponible en la información | PyTorch (.pt) | Apache-2.0 (según TAPNet) | HuggingFace (google/tapnet) |
| TAPIR (Google) | no disponible | no disponible en la información | no disponible | no disponible | Repositorio TAPNet |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo no realiza detección semántica de pies: requiere que el usuario proporcione las tres coordenadas iniciales en el primer fotograma.
- No realiza reconstrucción 3D ni articulación independiente de dedos; el nombre "Foot-Point-Tracker" puede inducir a error sobre sus capacidades reales.
- La calidad del seguimiento en pies reales y la recuperación de oclusiones no han sido validadas por el autor; la comparación en GitHub Actions usa una imagen artificial con movimiento y oclusión simulados.
- La cobertura de operadores para WebGPU se verificó de forma estática contra ONNX Runtime Web 1.22.0, pero no se ejecutó en GPU; el rendimiento real en navegador es desconocido.
- No se han publicado benchmarks de precisión (por ejemplo, error de trayectoria o precisión de oclusión) en la información disponible.
- No hay datos sobre sesgos, ya que no es un modelo lingüístico ni generativo de texto.
- Riesgo de alucinación no aplica en el sentido habitual, pero el modelo puede producir trayectorias incorrectas en presencia de oclusiones prolongadas o movimientos rápidos; los logits de incertidumbre deben usarse para filtrar.
- Licencia Apache-2.0 permite uso comercial, pero se deben conservar los avisos de copyright y las referencias a las fuentes originales (LICENSE y enlaces fijados en el repositorio).
- El repositorio no incluye vídeo privado, fotogramas extraídos, archivos de avatar ni trazas de pose privadas; el autor lo indica explícitamente.
- El modelo fue creado y actualizado en noviembre de 2026 según los metadatos, con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/RabbitDaisuke/Foot-Point-Tracker-onnx
- Código fuente TAPNet (commit fijado): https://github.com/google-deepmind/tapnet/tree/730cda1c730877cfedbe01bf87fb1cadb78a565d
- Pesos originales: https://huggingface.co/google/tapnet/resolve/5d3fb48e76c5422841e38501514121e251beabb7/causal_bootstapir_checkpoint.pt
- SHA-256 de los pesos originales: `87c1e752cf5ce56e3e2f7da460aeb4d40fc826d04ef2939bade86a5c7495377f`
