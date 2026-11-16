# kzwarycz/open-math-misconception-onnx

## Resumen

`open-math-misconception-onnx` es una cabeza de clasificación ONNX de 51.850 parámetros que se monta sobre los embeddings de frase del modelo `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. Dado un enunciado de un problema de matemáticas de la matura polaca, la opción errónea que marcó el estudiante y la opción correcta, predice a cuál de las 10 familias de misconcepciones (temas curriculares) pertenece el error. Forma parte de la aplicación de preparación de exámenes "Matura na 100" del mismo autor.

No es un modelo generativo: es un clasificador de texto de 10 clases que enruta un error hacia la familia de explicaciones adecuada, de modo que la aplicación pueda seleccionar después una pista socrática y una señal de accesibilidad. Todo el pipeline corre en CPU y de forma offline, lo que lo hace apto para despliegue on-device.

Se trata de un prototipo de investigación (v0.2, "TRL 3") con licencia CC-BY-4.0, entrenado exclusivamente para polaco y publicado en noviembre de 2026. Su relevancia actual es doble: por un lado, demuestra un patrón de bajo coste (encoder congelado + cabeza ligera) para tareas educativas de clasificación; por otro, es transparente sobre sus limitaciones, incluyendo que las 8 variables de telemetría del estudiante son simuladas y no aportan información predictiva en esta versión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza MLP sobre embeddings de MiniLM-L12 multilingual: Linear(392,128) → LayerNorm → ReLU → Dropout(0.2) → Linear(128,10) |
| Parámetros totales | 51.850 (solo la cabeza; el encoder no está incluido en el repo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el encoder base MiniLM-L12 soporta hasta 512 tokens, pero no se declara explícitamente para esta cabeza) |
| Tipos de cuantización | fp32 y INT8 dinámica (`onnxruntime.quantization.quantize_dynamic`) |
| Idiomas soportados | pl (polaco) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (opset 17, IR 8); cabeza fp32 y cabeza INT8 |

## Arquitectura y entrenamiento

La arquitectura es un clasificador de dos etapas. Primero, un encoder de frases multilingüe (`paraphrase-multilingual-MiniLM-L12-v2`) con mean pooling y normalización L2 produce un embedding de 384 dimensiones a partir de una plantilla de texto que concatena enunciado, opción errónea y opción correcta. Ese embedding se concatena con 8 variables de telemetría (estandarizadas dentro del grafo ONNX) para formar un vector de 392 dimensiones, que alimenta una MLP de dos capas con LayerNorm, ReLU y dropout 0,2 que emite 10 logits. El encoder no se incluye en el repositorio; el autor recomienda usar `Xenova/paraphrase-multilingual-MiniLM-L12-v2` (grafo ONNX cuantizado de 117.506.432 parámetros, 118,3 MB).

El entrenamiento usó AdamW (lr 2e-3, weight decay 1e-2), schedule coseno sobre 80 épocas, batch 64, entropía cruzada con pesos de clase y label smoothing 0,05, eligiendo la mejor época (11) sobre una partición de validación agrupada por tarea. Semilla 42, con métricas reproducibles al ejecutar `train_and_eval.py`. El dataset, `Polish-CKE-Math-Misconceptions-v1`, deriva del corpus de matemáticas de Matura na 100 (7.908 preguntas, 3.255 de opción múltiple), del cual 2.111 tareas mapean a una de las 10 familias; cada opción errónea genera un par, resultando en 6.326 pares. La partición está agrupada por enunciado normalizado: 1.731 tareas / 5.188 pares para entrenamiento y 380 tareas / 1.138 pares para test. Las tareas fueron escritas con asistencia de IA y validación automática, alineadas al currículo CKE pero no son ítems oficiales del examen.

Una innovación destacable es el diseño de la interfaz de entrada: las 8 variables de telemetría (`irt_theta`, `bkt_p_mastery`, `rt_z`, `impulsive_ema`, `paralysis_ema`, `fatigue_slope`, `cognitive_load`, `attempts_norm`) se incluyen en el grafo para mantener fija la interfaz aunque en v0.2 son simuladas y no aportan información de clase (un modelo solo-telemetría obtiene 9,3% top-1, por debajo del baseline mayoritario del 21,6%).

## Capacidades

- Clasificación de texto en 10 familias de misconcepciones matemáticas (temas curriculares de la matura polaca).
- Enrutamiento de errores: dado un par (opción errónea, opción correcta) sobre un enunciado, asigna una familia de explicación.
- Inferencia en CPU y offline, apta para despliegue on-device.
- Ejecución en formato ONNX con versión fp32 (209.251 B) y versión INT8 (57.324 B) con métricas prácticamente idénticas.
- No realiza diagnóstico cognitivo específico del error (por ejemplo, "olvidó invertir el signo de la desigualdad"); solo enruta a la familia curricular.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada: entrenado y evaluado solo en polaco.

## Casos de uso

- Enrutamiento de errores en una app de preparación de exámenes: la aplicación captura el enunciado, la opción errónea y la correcta, y el modelo devuelve la familia de misconcepción para seleccionar la pista socrática adecuada. Es adecuado por su latencia baja en CPU y su tamaño de 209 KB en fp32.
- Despliegue on-device en dispositivos de estudiantes sin conectividad: al correr en CPU y offline, permite feedback inmediato en móviles o portátiles modestos sin enviar datos a un servidor.
- Generación de feedback accesible: la familia predicha puede mapearse a una señal de accesibilidad (por ejemplo, un cue visual o auditivo) adaptada al tipo de error.
- Analítica docente agregada: agrupar los errores de un aula por familia de misconcepción para identificar temas con mayor dificultad y ajustar la instrucción.
- Filtrado y priorización de ejercicios: recomendar al estudiante tareas de la familia en la que comete más errores, usando la clasificación como señal de enrutamiento.
- Prototipado de investigación educativa: servir como baseline reproducible (script de entrenamiento con semilla 42) para futuros trabajos que añadan anotaciones por distractor.
- Integración en pipelines de evaluación automática: como paso previo a un modelo generativo que redacte la explicación, usando la familia predicha como etiqueta de contexto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la partición de test retenida (1.138 pares, 380 tareas). No verificados de forma independiente (`verified: false`).

| Métrica | fp32 | INT8 |
|---|---|---|
| Top-1 accuracy | 0,8348 | 0,8348 |
| Top-2 accuracy | 0,9332 | no disponible |
| Top-3 accuracy | 0,9596 | no disponible |
| Macro F1 | 0,8275 | 0,8240 |

Baselines y ablaciones en la misma partición:

| Modelo | Top-1 | Macro F1 |
|---|---|---|
| Clase mayoritaria | 0,2162 | 0,0355 |
| 1-nearest-neighbour sobre coseno de MiniLM (sin entrenamiento) | 0,8471 | 0,8431 |
| Cabeza, solo embedding de texto (telemetría fijada a la media) | 0,8506 | 0,8363 |

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. La cabeza fp32 ocupa 209.251 B y la INT8 57.324 B; el encoder MiniLM cuantizado ocupa 118,3 MB.
- GPU recomendadas: no requiere GPU; está diseñado para CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) puede ejecutarlo pero no aporta ventaja significativa.
- Cabe en cualquier GPU consumer y en CPU de gama baja; el pipeline completo (encoder + cabeza) es del orden de decenas de MB en memoria.
- Opciones de despliegue: ONNX Runtime (con `onnxruntime.quantization.quantize_dynamic` para INT8); transformers.js para el encoder `Xenova/paraphrase-multilingual-MiniLM-L12-v2`.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible; el autor indica que todo corre en CPU y offline.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Las alternativas más cercanas serían clasificadores de texto sobre el mismo encoder, pero no hay datos publicados para establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto | Top-1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| open-math-misconception-onnx | 51.850 (cabeza) | no disponible | 0,8348 | cc-by-4.0 | Hugging Face (ONNX) |
| 1-NN sobre MiniLM (baseline del autor) | 0 (sin entrenamiento) | no disponible | 0,8471 | cc-by-4.0 (encoder) | reproducible con el script |
| Cabeza solo-texto (ablación del autor) | 51.850 (cabeza) | no disponible | 0,8506 | cc-by-4.0 | reproducible con el script |

## Limitaciones y advertencias

- El modelo no diagnostica el error cognitivo específico; solo enruta a la familia curricular de la tarea. La anotación por distractor no existe todavía.
- Las 8 variables de telemetría son simuladas y no aportan información de clase en v0.2 (un modelo solo-telemetría obtiene 9,3% top-1, por debajo del baseline mayoritario del 21,6%). No deben interpretarse como señales reales del estudiante.
- Las tareas del dataset fueron escritas con asistencia de IA y validación automática; no son ítems oficiales del examen CKE. "CKE" en el nombre se refiere al currículo que siguen.
- El baseline 1-nearest-neighbour (0,8471 top-1) y la ablación solo-texto (0,8506 top-1) superan al modelo completo (0,8348 top-1) en top-1, lo que sugiere que la telemetría simulada y el entrenamiento de la cabeza no aportan mejora sobre el vecino más cercano en esta partición.
- Las métricas están declaradas por el autor y no han sido verificadas de forma independiente (`verified: false`).
- El desbalance de clases en test va de 29 pares (`TRIGONOMETRY`) a 246 pares (`PROBABILITY_COMBINATORICS_STATS`), lo que afecta a la fiabilidad por clase.
- Sesgos conocidos: no se documentan sesgos específicos más allá de los derivados de un corpus educativo polaco generado con asistencia de IA.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí hay riesgo de clasificación errónea fuera de la distribución de tareas de la matura polaca.
- Limitación de idioma: solo polaco; no se ha evaluado en otros idiomas aunque el encoder base sea multilingüe.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos exactos antes de producción.
- Para producción: el encoder no está incluido en el repositorio y debe obtenerse por separado (`Xenova/paraphrase-multilingual-MiniLM-L12-v2`); la interfaz de entrada asume la plantilla de texto y el orden exacto de las 8 variables de telemetría.

## Enlaces

- Hugging Face: https://huggingface.co/kzwarycz/open-math-misconception-onnx
- Aplicación Matura na 100: https://studio.kzlab.dev/matura-na-100/
- Encoder recomendado: https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2
- Modelo base del encoder: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
