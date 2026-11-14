# Kyoiske/simguard-laya-fraud

## Resumen

SIMGuard Laya es un clasificador binario de fraude por *SIM-swap* (duplicado o sustitución fraudulenta de tarjeta SIM) construido como *fine-tune* de `convaiinnovations/laya`, un encoder ModernBERT-large de 421 millones de parámetros con una cabeza de decisión sí/no de una sola pasada. Lo desarrolla el usuario Kyoiske y lo publica en Hugging Face bajo licencia Apache 2.0. El modelo no genera texto: recibe una descripción textual estructurada de un evento de cambio de SIM y devuelve P(fraude), actuando como "Agent 1", la puerta rápida de un prototipo mayor llamado SIMGuard AI que combina este encoder con modelos numéricos (LightGBM e Isolation Forest).

Su relevancia es doble. Por un lado, demuestra un patrón de uso poco habitual de los encoders ModernBERT: convertir registros tabulares de telecomunicaciones en una frase canónica y clasificarla con una cabeza de pregunta cerrada. Por otro, publica una evaluación inusualmente detallada para un modelo con cero descargas: métricas completas en tres *splits*, umbrales de decisión calibrados para un flujo permitir/bloquear/revisión humana y latencias medidas en hardware de consumo.

La advertencia principal es que todos los datos son sintéticos. El autor lo declara explícitamente: el modelo es un prototipo de investigación para apoyo a la decisión y requiere que un analista humano valide el resultado final. No hay evidencia de rendimiento sobre tráfico real de operadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabeza de clasificación de pregunta cerrada (sí/no) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base es ModernBERT, que soporta contextos largos, pero no se especifica la ventana efectiva de este fine-tune) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors de 843 MB (aproximadamente FP32/BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | laya 0.4.31 (requiere transformers 5.22.2 y torch 2.15.0) |
| Modelo base | convaiinnovations/laya |
| Pipeline | text-classification |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya`, un encoder ModernBERT-large de 421 millones de parámetros. Sobre esa base se aplica un *fine-tune* supervisado para una tarea de clasificación binaria formulada como pregunta de respuesta cerrada ("Does this SIM swap event look like SIM-swap fraud?"), con una cabeza que emite una probabilidad en una sola pasada. No se trata de un modelo generativo: no produce tokens de texto, solo una puntuación.

El entrenamiento se realizó exclusivamente con datos sintéticos. La *model card* no detalla el número de tokens, la composición exacta del corpus ni si se emplearon técnicas de RLHF o DPO; tampoco se documenta el proceso de generación de los ejemplos sintéticos más allá de la existencia de un conjunto `hard_test` de 600 casos "casi en el límite" diseñado para ser difícil. La entrada no es texto libre: el modelo solo funciona con el formato exacto de frase canónica empleado en el entrenamiento, que serializa campos como el intervalo entre la petición de OTP y el cambio de SIM (en minutos y días), los indicadores de cambio de dispositivo, tipo de SIM, IMSI e ICCID, la similitud de geohash entre la ubicación del OTP y la del cambio de SIM, los días desde la activación de la SIM, el número de cambios de SIM en los últimos 30 días y la antigüedad del titular previo. Cualquier desviación de ese formato invalida la predicción.

Como innovación destacable, el autor publica un fichero `gate.json` con umbrales de decisión ajustados sobre una porción de calibración reservada: permitir si p ≤ 0,1197, bloquear si p ≥ 0,8828 y derivar a revisión humana en el intervalo intermedio. Además, el modelo está pensado para operar en conjunto con modelos numéricos, no de forma aislada.

## Capacidades

- Clasificación binaria de fraude por SIM-swap a partir de una descripción textual estructurada de un evento.
- Salida de una probabilidad calibrada P(fraude) en una sola pasada, sin generación de texto.
- Decisión de tres vías mediante umbrales preajustados: permitir, bloquear o derivar a humano.
- Procesamiento por lotes (*batching*) para evaluar muchos eventos simultáneamente.
- Ejecución en CPU y en GPU de consumo.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni comportamiento de agente por sí mismo; es un componente ("Agent 1") dentro de un pipeline mayor.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- **Puerta de decisión en tiempo real en el alta o cambio de SIM de una operadora**: el modelo evalúa cada evento con una latencia de 39 ms p50 en una RTX 3050 Laptop y aplica los umbrales de `gate.json` para bloquear automáticamente los casos de probabilidad alta (p ≥ 0,8828), permitir los de probabilidad baja (p ≤ 0,1197) y enviar el resto a un analista. En tráfico sintético normal resuelve el 98,6 % de los casos de forma automática con una precisión aproximada del 99,6 %.
- **Segunda opinión sobre un modelo numérico**: el propio autor recomienda usarlo junto a LightGBM e Isolation Forest, porque el encoder lee los números con menos precisión que un modelo de árboles. En producción se usaría como capa de validación semántica sobre las señales numéricas ya calculadas.
- **Priorización de la cola de revisión humana**: en lugar de que los analistas revisen todos los eventos sospechosos, se ordenan por P(fraude) y se derivan solo los casos en la banda intermedia. En el conjunto `hard_test`, el 21,8 % de los casos irían a revisión, frente al 1,4 % en tráfico normal.
- **Análisis retrospectivo de incidentes**: dado un histórico de eventos de cambio de SIM serializados en el formato canónico, se puede puntuar por lotes (13 ms por evento con batch de 64 en GPU) para identificar patrones de *takeover* silencioso que pasaron desapercibidos.
- **Prototipado e investigación en detección de fraude telecom**: sirve como referencia reproducible de cómo formular una tarea tabular como clasificación de texto con un encoder ModernBERT, con métricas completas y *splits* de dificultad creciente.
- **Evaluación de robustez de pipelines antifraude**: el conjunto `hard_test` por categorías (cambios benignos dobles, pares espejo, casos límite) permite medir dónde falla un clasificador textual frente a uno numérico antes de desplegar.
- **Filtro previo de bajo coste en entornos sin GPU**: con unos 510 ms por evento en CPU de portátil, puede desplegarse en servidores modestos como primera criba antes de invocar modelos más caros.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el modelo base con el *fine-tune* sobre tres conjuntos sintéticos.

| Split | Métrica | Base Laya | Fine-tuned |
|---|---|---|---|
| val (3.000) | accuracy | 0,2517 | 0,9937 |
| val (3.000) | balanced accuracy | 0,5000 | 0,9918 |
| val (3.000) | log-loss | 1,7350 | 0,0201 |
| val (3.000) | recall fraude / recall legítimo | 0,000 / 1,000 | 0,9955 / 0,9881 |
| test (6.000) | accuracy | 0,2565 | 0,9917 |
| test (6.000) | balanced accuracy | 0,4999 | 0,9884 |
| test (6.000) | log-loss | 1,7325 | 0,0251 |
| test (6.000) | recall fraude / recall legítimo | 0,0011 / 0,9987 | 0,9951 / 0,9818 |
| hard_test (600) | accuracy | 0,5500 | 0,8333 |
| hard_test (600) | log-loss | 1,0378 | 0,4304 |
| hard_test (600) | recall fraude / recall legítimo | 0,000 / 1,000 | 0,8296 / 0,8364 |

Los errores en `test` bajan de 4.461 a 50 (−98,9 %) y en `hard_test` de 270 a 100 (−63 %). El autor matiza que el modelo base no tiene noción de fraude por SIM-swap y responde "no fraude" a casi todo, por lo que la comparación honesta es que el *fine-tune* lo lleva de una señal nula (balanced accuracy 0,50) a un clasificador funcional.

Rendimiento por categoría en `hard_test`:

| Categoría | n | Base | Fine-tuned |
|---|---|---|---|
| far_but_flagged | 60 | 50 % | 100 % |
| distractor_age | 70 | 50 % | 97 % |
| quiet_takeover | 60 | 0 % | 95 % |
| behaviour_storm | 60 | 100 %* | 83–85 % |
| two_changes_benign | 60 | 100 %* | 83 % |
| flip_pair | 120 | 50 % | 76–77 % |
| knife_edge_double | 80 | 50 % | 72–74 % |
| knife_edge_single | 90 | 50 % | 71 % |

\*El modelo base acierta el 100 % en esas categorías solo porque responde "legítimo" a todo y esas categorías son legítimas.

Comportamiento de la puerta de decisión:

| Split | Bloqueados | Permitidos | A humano | Fraude auto-permitido | Legítimo auto-bloqueado |
|---|---|---|---|---|---|
| test (6.000) | 4.431 | 1.487 | 82 (1,4 %) | 11 (0,25 % del fraude) | 13 (0,85 % del legítimo) |
| hard_test (600) | 216 | 253 | 131 (21,8 %) | 21 | 27 |

Una re-ejecución independiente desde el *checkpoint* guardado reprodujo estos resultados con una desviación de 0,07 puntos porcentuales en `test` y de un caso en 600 en `hard_test`.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 1,5–2 GB en GPU con batch de 1; los pesos ocupan 843 MB.
- **GPU recomendadas**: cualquier NVIDIA con ≥ 4 GB de VRAM. El autor probó una RTX 3050 Laptop de 6 GB. Para despliegue de mayor volumen, A100 o H100 no se mencionan en la documentación, pero el modelo cabe holgadamente en cualquier GPU moderna.
- **GPU de consumo**: sí, cabe en tarjetas de gama de entrada con 4–6 GB.
- **CPU**: funciona sin GPU, con unos 510 ms por evento.
- **RAM**: 8 GB mínimo, 16 GB recomendado. Disco: 2 GB para el modelo más unos 6 GB para PyTorch con CUDA.
- **Software probado**: Windows 11, Python 3.12–3.15, `torch==2.15.0` (build CUDA 13.2 o CPU), `laya==0.4.31`, `transformers==5.22.2`, `safetensors`, `huggingface_hub`. Linux y macOS no se probaron.
- **Latencia medida**: 39 ms p50 y 46 ms p95 por petición individual en RTX 3050 Laptop con PyTorch; 13 ms por evento con batch de 64.
- **Opciones de despliegue**: la librería `laya` con PyTorch es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un encoder de clasificación con una interfaz de pregunta cerrada propietaria, la integración con esos servidores no está soportada de forma nativa.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa disponible es con su propio modelo base:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SIMGuard Laya Fraud | 421 M | no disponible | Clasificación binaria de fraude SIM-swap | Apache 2.0 | Hugging Face, 0 descargas |
| convaiinnovations/laya (base) | 421 M | no disponible | Encoder general con cabeza sí/no | no disponible en la información proporcionada | Hugging Face |

Frente al modelo base, el *fine-tune* mejora la accuracy en `test` de 0,2565 a 0,9917 y en `hard_test` de 0,5500 a 0,8333, sin cambiar el coste de inferencia. No se han localizado alternativas públicas específicas de detección de fraude SIM-swap con encoder Transformer para establecer una comparativa adicional.

## Limitaciones y advertencias

- **Datos exclusivamente sintéticos**: todas las métricas se midieron sobre datos generados artificialmente. No hay validación sobre tráfico real de operadora y el propio autor lo declara como prototipo de investigación.
- **Dependencia estricta del formato de entrada**: el modelo solo funciona con la frase canónica exacta y la pregunta con la que se entrenó. Cualquier variación en el orden de los campos, en el formato numérico o en la redacción invalida la predicción.
- **Precisión numérica limitada**: un encoder de texto lee los números con menos precisión que un modelo de árboles. Las categorías de casos límite (`knife_edge_single` 71 %, `knife_edge_double` 72–74 %, `flip_pair` 76–77 %) son el punto débil. El autor recomienda explícitamente no usarlo solo, sino junto a LightGBM e Isolation Forest.
- **Riesgo de falsos negativos y falsos positivos en producción**: en `test`, el 0,25 % del fraude se permitió automáticamente y el 0,85 % del tráfico legítimo se bloqueó automáticamente. En `hard_test` estas cifras suben a 21 fraudes auto-permitidos y 27 legítimos auto-bloqueados sobre 600 casos.
- **Idioma**: solo inglés. No hay soporte multilingüe documentado.
- **Licencia**: Apache 2.0 permite uso comercial, pero la ausencia de validación con datos reales hace arriesgado desplegarlo sin una fase de evaluación propia.
- **Sesgos**: no documentados. Al entrenarse con datos sintéticos, los sesgos del generador de datos se propagan al modelo.
- **Riesgo de alucinación**: no aplica en el sentido generativo, ya que el modelo no produce texto, pero sí puede emitir probabilidades mal calibradas fuera de la distribución de entrenamiento.
- **Madurez**: cero descargas y cero *likes* en el momento de la consulta; creado y actualizado el mismo día. No hay historial de uso ni comunidad que lo valide.
- **Dependencias frágiles**: requiere versiones muy concretas de `torch` (2.15.0), `transformers` (5.22.2) y `laya` (0.4.31), y solo se probó en Windows 11.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kyoiske/simguard-laya-fraud
- Modelo base: https://huggingface.co/convaiinnovations/laya
