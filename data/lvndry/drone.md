# lvndry/drone

## Resumen

drone-v1 es un clasificador de tonalidad musical (key detection) desarrollado por el usuario lvndry. Con solo 109.128 parámetros, resuelve la tarea de identificar la tónica y el modo (mayor o menor) de una pista de audio a partir de un espectrograma constant-Q. El modelo produce 24 clases (12 tónicas por 2 modos) y se distribuye con pesos en PyTorch y ONNX bajo licencia MIT.

El modelo sigue la arquitectura K10 descrita por el autor como referencia para MIREX 2026 y se ha reentrenado sobre 1.363 pistas de música electrónica de baile (EDM) del catálogo Beatport. Su relevancia radica en que, según el autor, es el modelo más pequeño en superar la referencia nativa de libkeyfinder (69,35 % MIREX) sobre el conjunto de evaluación GiantSteps de 604 pistas, con un 73,58 % MIREX ponderado.

No se trata de un modelo de lenguaje: es un clasificador de audio especializado, sin capacidades de generación de texto, razonamiento, código ni tool calling. Su ámbito es exclusivamente el análisis tonal de audio musical.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN sobre espectrograma constant-Q (arquitectura K10) |
| Parámetros totales | 109.128 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (ventana de 320 frames en entrenamiento; en inferencia, cualquier longitud >= 1 frame) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) y ONNX (opset 18) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional (CNN) que opera sobre un espectrograma constant-Q de 192 bins (24 bins por octava, ventana central de las filas 8 a 199 de un CQT de 208 bins). La entrada es `(batch, 192, frames)` y la cabeza del modelo agrega la dimensión temporal mediante pooling, por lo que admite secuencias de cualquier longitud mayor o igual a un frame. La salida son 24 logits correspondientes a 12 tónicas por 2 modos (0 = mayor, 1 = menor).

El entrenamiento se realizó con el protocolo K10: recortes de 320 frames, desplazamiento de ±4 semitones implementado como un re-slice exacto con etiqueta transpuesta, optimizador AdamW con tasa de aprendizaje 1e-3, scheduler coseno durante 120 épocas, batch de 32 y entropía cruzada estándar. El conjunto de datos son 1.363 previews de 2 minutos del Beatport EDM Key Dataset (933 en modo menor, 430 en mayor), con anotaciones bajo CC BY-SA 4.0 y audio propiedad de Beatport. No se menciona uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Clasificación de tonalidad musical en 24 clases (12 tónicas × mayor/menor) a partir de audio mono a 22.050 Hz.
- Extracción de características mediante `librosa.cqt` con 24 bins por octava, `fmin` ≈ 25,957 Hz, hop 4096 y amplitud `log1p`.
- Inferencia sobre secuencias de longitud variable gracias al pooling temporal de la cabeza.
- Exportación ONNX con batch dinámico y paridad verificada en CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio general ni capacidades multilingües.
- No es un modelo generativo: no produce texto ni explicaciones, solo logits de clasificación.

## Casos de uso

- Organización automática de bibliotecas musicales: etiquetar cada pista con su tonalidad para permitir filtros y listas inteligentes en reproductores o servicios de streaming, aprovechando el bajo coste computacional del modelo (109.128 parámetros).
- Mezcla armónica para DJ: detectar la tonalidad de cada tema en un set y sugerir transiciones compatibles (por ejemplo, tónica relativa o quinta), integrándolo en herramientas de planificación de sesiones.
- Análisis de catálogo en sellos discográficos: procesar lotes de previews de EDM para generar metadatos tonales de forma masiva, dado que el modelo se entrenó específicamente sobre ese género.
- Recomendación musical basada en compatibilidad tonal: enriquecer sistemas de recomendación con la tonalidad como señal adicional para agrupar temas que suenan bien juntos.
- Preprocesado para herramientas de producción musical: alimentar DAWs o plugins que necesiten una estimación rápida de la tonalidad antes de aplicar correcciones o armonizaciones.
- Investigación en MIR (Music Information Retrieval): servir como línea base ligera y reproducible (MIT, ONNX, CPU) para comparar nuevos métodos de detección de tonalidad en el benchmark GiantSteps.
- Despliegue en dispositivos con recursos limitados: al ser un modelo de 109.128 parámetros exportable a ONNX, puede ejecutarse en CPU o en entornos embebidos sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre GiantSteps (held-out, 604 pistas), una evaluación por semilla:

| Semilla | Exact | MIREX (ponderado) |
|---|---|---|
| 13 | 68,5 % | 74,8 % |
| 37 | 66,1 % | 73,0 % |
| 73 | 65,7 % | 72,9 % |
| Media | 66,8 % | 73,58 % |

El checkpoint distribuido (`drone-v1.pt`) corresponde a la semilla 13. Según el autor, supera la referencia nativa de libkeyfinder (69,35 % MIREX) sobre el mismo conjunto. Estos resultados no están verificados de forma independiente (`verified: false` en el model-index).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 109.128 parámetros, los pesos ocupan aproximadamente 0,4 MB en FP32.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Funciona en GPU convencionales (RTX 4090, A100, H100) pero no las aprovecha de forma significativa.
- Cabe en cualquier GPU de consumo e incluso en entornos embebidos sin acelerador.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime (opset 18, batch dinámico, paridad CPU verificada) y el wrapper `Predictor` del paquete `drone`.
- Latencia y throughput: no disponibles en la información proporcionada. El coste dominante en producción será probablemente la decodificación de audio y el cálculo del CQT con `librosa`, no la inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | MIREX (GiantSteps 604) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drone-v1 | 109.128 | CNN sobre CQT | 73,58 % (media, no verificado) | MIT | Hugging Face, PyTorch y ONNX |
| libkeyfinder (referencia nativa) | no disponible | Algoritmo clásico | 69,35 % (según el autor) | no disponible en la información | Biblioteca de código abierto |
| Otros modelos de key detection | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación disponible en la información proporcionada es con libkeyfinder; no se aportan datos de otros modelos neuronales de detección de tonalidad.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre previews de 2 minutos de música EDM de Beatport; se espera una precisión menor en grabaciones largas y de géneros diversos, tal como advierte el propio autor.
- Los valores de softmax no están calibrados, por lo que no deben interpretarse como probabilidades fiables sin un post-procesado de calibración.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- El modelo solo devuelve tonalidad y modo; no detecta tempo, estructura, instrumentos ni otras propiedades musicales.
- No es un modelo de lenguaje ni generativo: no admite prompts, texto, tool calling ni razonamiento.
- El audio de entrenamiento es propiedad de Beatport; las anotaciones son CC BY-SA 4.0. La licencia MIT del modelo no exime de posibles restricciones sobre los datos de entrenamiento en usos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- No se dispone de información sobre sesgos, robustez ante ruido, recodificaciones o fragmentos muy cortos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lvndry/drone
- Repositorio fuente y documentación de entrenamiento: https://github.com/lvndry/drone/blob/main/docs/training.md
- Repositorio GitHub del proyecto: https://github.com/lvndry/drone
