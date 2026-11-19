# Aurora-Plus/Stardust-2.1-Nano

## Resumen

Stardust 2.1 Nano (nombre interno `StardustStudentTiny`) es un clasificador binario de secuencias 1D desarrollado por Aurora+ para la deteccion de aimbots en videojuegos 2D. No es un modelo de lenguaje: se trata de un detector de comportamiento ultralligero de 5.153 parametros, destilado por knowledge distillation a partir de un modelo profesor privado de 1.098.881 parametros (Stardust 2.1 Teacher). Su funcion es recibir ventanas de 29 fotogramas con seis caracteristicas cinematicas por fotograma y emitir un unico logit que indica la probabilidad de que la secuencia corresponda a un aimbot.

El modelo destaca por su eficiencia extrema: es 213 veces mas pequeno que su profesor y ejecuta una inferencia en menos de 0,05 ms por ventana en CPU. En el benchmark HuMo-Bench/AB v0.2 obtiene un MCC de 0,82 y un F1 de 0,89 con precision de 1,00 y tasa de falsos positivos de 0,00 en dicho benchmark. Esta pensado como filtro de primera pasada en servidores de juego, telemetria en el borde o triaje de bajo coste.

Su relevancia actual radica en la tendencia a desplegar deteccion de trampas del lado del servidor con presupuestos de computo minimos. Un modelo de 5.153 parametros puede ejecutarse en cualquier CPU, lo que permite evaluar cada ventana de movimiento sin afectar la latencia del juego. La licencia Apache-2.0 facilita su integracion en productos comerciales, si bien el autor advierte explicitamente que no debe usarse para baneos automaticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D para clasificacion binaria de secuencias (Conv1d + ReLU + pooling avg/max concatenado + MLP) |
| Parametros totales | 5.153 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 29 fotogramas por ventana de entrada |
| Tipos de cuantizacion | no disponible (pesos PyTorch en coma flotante; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`pytorch`, checkpoint con `recommended_threshold` en config) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional 1D compacta: `Conv1d(6 -> 32, kernel_size=5, padding=2)` seguida de ReLU, `Conv1d(32 -> 32, kernel_size=3, padding=1)` con ReLU, concatenacion de `AdaptiveAvgPool1d(1)` y `AdaptiveMaxPool1d(1)` (64 dimensiones), y una cabeza clasificadora `Linear(64 -> 16) + ReLU + Linear(16 -> 1)`. La entrada es un tensor de forma `(batch_size, 29, 6)`: 29 fotogramas con seis caracteristicas cinematicas por fotograma (`dx/100`, `dy/100`, `log1p(dist)/4`, `speed/20`, `sin(angle_error)`, `cos(angle_error)`), sin caracteristicas resumidas ni ingenieria manual adicional.

El entrenamiento se realizo por destilacion de conocimiento desde Stardust 2.1 Teacher sobre 60.000 ventanas balanceadas (30.000 humanas, 30.000 de trampa), con split 85/15. Se usaron 15 epocas, optimizador AdamW (`lr=2e-3`, `weight_decay=1e-3`), `CosineAnnealingLR` (`eta_min=1e-5`), batch de 128 y clipping de norma de gradiente a 1,0. La funcion de perdida es una destilacion asimetrica: 60% BCE sobre logits suavizados del profesor (`temperature=2.0`) y 40% BCE sobre etiquetas duras con una penalizacion de 20,0x aplicada cuando muestras legitimas (`target == 0`) producen logits `> -0.5`. Tras el entrenamiento se calibro el umbral barriendo `[0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]` para minimizar falsos positivos, guardandose `recommended_threshold` en el checkpoint.

## Capacidades

- Clasificacion binaria de secuencias de movimiento para detectar patrones de aimbot 2D.
- Procesamiento de ventanas de 29 fotogramas con seis caracteristicas cinematicas por fotograma.
- Inferencia ultrarrápida en CPU (menos de 0,05 ms por ventana), apta para evaluacion de alto rendimiento del lado del servidor.
- Deteccion de patrones estandar de aimbot 2D; no cubre trampas avanzadas, humanizadas o dependientes del estado 3D del juego.
- Salida de un unico logit crudo; la probabilidad se obtiene aplicando sigmoid o comparando contra el umbral calibrado del checkpoint.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo linguistico).
- No incluye vision, audio ni modo de pensamiento.

## Casos de uso

- Triaje de primera pasada en servidores de juego: evaluar cada ventana de 29 fotogramas de telemetria de punteria y marcar secuencias sospechosas para revision, aprovechando la inferencia sub-0,05 ms en CPU para no afectar al tick rate.
- Filtrado de telemetria en el borde: desplegar el modelo en nodos perimetrales o clientes para reducir el volumen de datos enviados al servidor, descartando ventanas claramente legitimas antes del analisis profundo.
- Sistemas de puntuacion de riesgo multi-senal: usar el logit del modelo como una senal mas junto a otros indicadores (estadisticas de precision, patrones de red) para priorizar casos a revision humana.
- Investigacion y benchmarks de anti-cheat: emplear el modelo como linea base ligera y reproducible en HuMo-Bench/AB v0.2 para comparar nuevos detectores.
- Educacion y prototipado: servir de ejemplo de destilacion de conocimiento aplicada a deteccion de comportamiento con presupuesto de computo minimo.
- Pre-filtrado en pipelines de moderacion de partidas: clasificar lotes de ventanas en batch (por ejemplo, batch de 128) para generar colas de revision en torneos o ligas.
- Despliegue en hardware embebido o de gama baja: al tener 5.153 parametros, cabe en dispositivos sin GPU y en entornos con restricciones severas de memoria.

## Benchmarks y rendimiento

Resultados en HuMo-Bench/AB v0.2:

| Tipo | Modelo | F1 | Precision | Recall | FPR | MCC |
|---|---|---|---|---|---|---|
| Aimbot | Stardust 2.0.0 | 0,90 | 0,93 | 0,87 | 0,06 | 0,80 |
| Aimbot | **Stardust 2.1 Nano** | **0,89** | **1,00** | **0,81** | **0,00** | **0,82** |
| Aimbot | AAD V1.01 | 0,87 | 0,87 | 0,87 | 0,12 | 0,75 |
| Aimbot | AAD v1 | 0,84 | 0,82 | 0,87 | 0,18 | 0,68 |
| Aimbot | AAD V1.02 | 0,84 | 0,82 | 0,87 | 0,18 | 0,68 |
| Aimbot | KyuruA 1.01 | 0,81 | 0,71 | 0,93 | 0,37 | no disponible |
| Aimbot | Echo v3.06 | 0,76 | 0,61 | 1,00 | 0,62 | no disponible |
| Aimbot | AAD Pre-release | 0,69 | 0,90 | 0,56 | 0,06 | 0,53 |
| Aimbot | Iris AC (Full) | 0,68 | 0,51 | 1,00 | 0,93 | no disponible |
| Aimbot | Stardust 1.07 | 0,60 | 0,64 | 0,56 | 0,30 | no disponible |
| Aimbot | Iris AC (IPLNE Only) | 0,22 | 1,00 | 0,12 | 0,00 | no disponible |

No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) por tratarse de un modelo no linguistico.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo (5.153 parametros) ocupa unos pocos kilobytes en memoria y puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU. Cualquier CPU moderna es suficiente; opcionalmente puede acelerarse con CUDA en GPU de gama baja (GTX 1650, RTX 3050) o superiores.
- Cabe en cualquier GPU consumer, incluida la gama de entrada, y en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (definicion de la clase `StardustStudentTiny` incluida en la model card), exportacion a TorchScript u ONNX no documentada pero viable; vLLM, llama.cpp, Ollama o TGI no aplican por no ser un modelo generativo.
- Latencia y throughput: menos de 0,05 ms por ventana en CPU segun el autor; el throughput depende del batch y del hardware, no se publican cifras adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | F1 | Precision | FPR | MCC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Stardust 2.1 Nano | 5.153 | 29x6 | 0,89 | 1,00 | 0,00 | 0,82 | Apache-2.0 | Publico en HF |
| Stardust 2.1 Teacher | 1.098.881 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | Privado |
| Stardust 2.0.0 | no disponible | no disponible | 0,90 | 0,93 | 0,06 | 0,80 | no disponible | no disponible |
| AAD V1.01 | no disponible | no disponible | 0,87 | 0,87 | 0,12 | 0,75 | no disponible | no disponible |

## Limitaciones y advertencias

- No debe usarse para baneos automaticos: el autor indica explicitamente que las marcas del modelo requieren revision humana, verificacion secundaria o corroboracion multi-senal.
- Los falsos positivos pueden producirse en entornos reales por casos limite, patrones legitimos inusuales o anomalias de hardware/red; el FPR de 0,00 corresponde solo al benchmark HuMo-Bench/AB v0.2 y no garantiza cero falsos positivos en partidas reales.
- No esta disenado para trampas avanzadas, fuertemente humanizadas o que dependen del estado 3D del juego.
- Solo detecta patrones de aimbot 2D estandar; el alcance esta limitado por la ventana de 29 fotogramas y las seis caracteristicas cinematicas de entrada.
- Sesgos conocidos: no se documentan sesgos especificos, pero el modelo se entreno con 60.000 ventanas balanceadas de origen no detallado, lo que puede limitar la generalizacion a otros juegos o estilos de juego.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue en produccion debe acompanarse de salvaguardas humanas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo no cuenta con validacion externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Aurora-Plus/Stardust-2.1-Nano
- Thumbnail del proyecto: https://huggingface.co/Aurora-Plus/Stardust-2.1-Nano/blob/main/aurora_plus.png
- Benchmark HuMo-Bench/AB v0.2: no disponible (enlace no proporcionado)
- Paper o blog tecnico: no disponible
- Repositorio de codigo: no disponible
