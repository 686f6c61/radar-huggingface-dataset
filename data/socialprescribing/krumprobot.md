# socialprescribing/KrumpRobot

## Resumen

KrumpRobot es una política neuronal de generación de movimiento para robótica humanoide, desarrollada por Arun Nadarasa (cuenta `socialprescribing`) y publicada bajo licencia Apache 2.0. No se trata de un modelo de lenguaje, sino de un controlador de movimiento entrenado para sintetizar primitivas cinéticas de Krump (STOMP, JAB, ARM SWING, CHEST POP, KILL-OFF) condicionadas por la fase de un ritmo de 140 BPM y objetivos de fuerza de reacción del suelo. El modelo se entrenó a partir de vídeo monoculo de una actuación real de street dance (98,47 s, 2.953 fotogramas a 29,99 fps) y se reorienta a un rig Mixamo Y-Bot de 52 articulaciones y a los robots humanoides Unitree H1 y G1.

La arquitectura es una red recurrente causal de 1,01 M de parámetros con pérdida sensible al jerk y decodificadores residuales multi-tarea que emiten pose (22 cuaterniones), velocidad articular, desplazamiento de raíz, dinámica (coeficientes de fricción, fuerza vertical, jerk) y estabilidad ZMP. El paquete incluye pesos PyTorch (3,8 MB), pesos JSON para ejecución WebGL en Three.js, una trayectoria generada de 2.953 fotogramas, un personaje GLB animado, un vídeo comparativo y un preimpreso de 12 páginas.

Su relevancia es acotada pero específica: demuestra que es posible recuperar movimiento 3D expresivo de alta aceleración desde vídeo monoculo, reorientarlo a morfologías humanoides distintas y ejecutar la política a 370 Hz (p50 de 2,70 ms), lo que la hace compatible con control predictivo por modelo (MPC) en tiempo real. El alcance es limitado: un único intérprete, una única toma y un vocabulario coreográfico restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente causal (GRU de 2 capas, 256 unidades) con proyecciones de estado y condicionamiento, fusión y decodificadores residuales multi-tarea (pose, velocidad, raíz, dinámica, ZMP) |
| Parametros totales | 1,01 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de control de movimiento, no de texto; opera sobre estado articular de 182 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos PyTorch de 3,8 MB y JSON para WebGL) |
| Idiomas soportados | en (metadatos del modelo; no aplica generación de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`.pt`), JSON para Three.js/WebGL, NPZ para trayectorias |

## Arquitectura y entrenamiento

La política recibe un vector de estado articular de 182 dimensiones y un vector de condicionamiento de 9 dimensiones (one-hot de 5 primitivas, fase del beat a 140 BPM codificada como seno y coseno, energía de clímax entre 0 y 1 y fuerza de reacción vertical objetivo en unidades de peso corporal). Ambas entradas se proyectan (192 y 64 dimensiones respectivamente), se fusionan en 256 dimensiones y pasan por una GRU de 2 capas de 256 unidades, seguida de un ResMLP y cinco cabezas de salida: pose (22 cuaterniones, 88 dimensiones), velocidad articular (88 dimensiones), raíz (desplazamiento de cadera, 3 dimensiones), dinámica (coeficientes de fricción izquierdo y derecho, Fz y jerk, 4 dimensiones) y estabilidad ZMP (2 dimensiones).

El entrenamiento se realizó en Modal Cloud (recuperación de pose con GPU Nvidia L40S y entrenamiento de la política en 4 vCPU) sobre el dataset AMASS y vídeo monoculo de la actuación de Arun Nadarasa. La innovación principal es la pérdida sensible al jerk, que preserva el 96,8 % de la aceleración pico frente al 61,4 % que se obtiene con una MSE L2 estándar, algo crítico en un estilo de danza definido por movimientos secos y explosivos. El reorientado es relativo al reposo (*rest-relative retargeting*), con una precisión de cinemática directa de 8,765 × 10⁻¹¹ m y 0 % de penetración del suelo. No se documenta RLHF ni DPO, al no ser un modelo de lenguaje.

## Capacidades

- Generación de movimiento humanoide expresivo con cinco primitivas de Krump: STOMP, JAB, ARM SWING, CHEST POP y KILL-OFF.
- Condicionamiento por fase musical a 140 BPM (codificación seno/coseno del beat) y por energía de clímax.
- Condicionamiento por objetivos de fuerza de reacción del suelo (GRF F_z en unidades de peso corporal).
- Salida de pose en cuaterniones (22 articulaciones), velocidad articular, desplazamiento de raíz, coeficientes de fricción, jerk y márgenes de estabilidad ZMP.
- Reorientado a tres morfologías: rig Mixamo Y-Bot de 52 articulaciones, Unitree H1 y Unitree G1.
- Ejecución en tiempo real: latencia p50 de 2,70 ms (~370 Hz) y p99 de 4,07 ms.
- Ejecución sin instalación en navegador mediante pesos JSON y Three.js (WebGL).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Control de danza en robots humanoides Unitree H1 y G1: la política genera trayectorias articulares condicionadas por el beat y las envía a 370 Hz, frecuencia compatible con bucles de control MPC en tiempo real.
- Coreografía automatizada para espectáculos y demostraciones: el condicionamiento por fase de beat permite sincronizar el movimiento con una pista de 140 BPM sin scripting manual de keyframes.
- Investigación en retargeting entre morfologías: el pipeline rest-relative permite trasladar movimiento capturado de un humano a robots con proporciones distintas manteniendo el 96,8 % de la aceleración pico.
- Evaluación de estabilidad bípeda: las cabezas de dinámica y ZMP (margen mínimo de 4,2 cm) permiten estudiar límites de estabilidad en movimientos de alta aceleración.
- Planificación multi-robot: el modelo reporta una separación mínima de 1,28 m con 4 robots bajo TRMP, útil para validar coreografías coordinadas en enjambre.
- Docencia y divulgación en robótica físico-digital: la demo WebGL en Hugging Face Spaces permite explorar la política sin instalar nada.
- Generación de datos sintéticos de movimiento para aumentar datasets de danza o para preentrenar controladores antes de escalar a múltiples intérpretes.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precisión de cinemática directa relativa al reposo (`Motion2MixamoRig`) | 8,765 × 10⁻¹¹ m (0,0 % de penetración del suelo) |
| Retención de aceleración pico (pérdida sensible al jerk vs. MSE L2) | 96,8 % vs. 61,4 % |
| Error angular geodésico SO(3) en seguimiento completo | 0,0405 rad (2,32°) |
| Split temporal contiguo 80/20 sin solapamiento, train | 1,42° (fotogramas 0-2.361, 1.169 ventanas) |
| Split temporal contiguo 80/20 sin solapamiento, test freestyle no visto | 18,58° (fotogramas 2.362-2.952, 283 ventanas) |
| Línea base de persistencia a velocidad cero en test | 2,95° |
| Latencia de inferencia | p50 = 2,70 ms (~370 Hz); p99 = 4,07 ms |
| Margen mínimo ZMP | 4,2 cm |
| Separación mínima con 4 robots (TRMP) | 1,28 m |

El dato más relevante es la brecha entre train (1,42°) y test no visto (18,58°), que el propio autor reconoce como cota de memorización de secuencia en una sola toma y que sitúa al modelo por encima de la línea base trivial de persistencia (2,95°). No se han publicado comparaciones con otros modelos de generación de movimiento en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos ocupan 3,8 MB en PyTorch, por lo que cualquier GPU con al menos 1 GB es suficiente.
- GPU recomendadas: no se requiere GPU dedicada; el entrenamiento usó Nvidia L40S para recuperación de pose, pero la inferencia de la política corre en CPU.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU; el cuello de botella es el renderizado del rig, no la política.
- Opciones de despliegue: script Python con PyTorch (`sample_inference.py`), ejecución WebGL en navegador con Three.js mediante los pesos JSON, y Hugging Face Spaces.
- Latencia y throughput: p50 de 2,70 ms y p99 de 4,07 ms por paso de inferencia (~370 Hz), adecuado para control en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KrumpRobot | 1,01 M | Política recurrente de danza condicionada por beat y GRF | 2.953 fotogramas, un intérprete, AMASS | Apache 2.0 | Hugging Face, demo WebGL |
| ExBody (referencia citada por el autor) | no disponible | Control de cuerpo completo para humanoides | no disponible | no disponible | no disponible |
| OmniH2O (referencia citada por el autor) | no disponible | Teleoperación y control humanoide de cuerpo completo | no disponible | no disponible | no disponible |
| AIST++ (referencia citada por el autor) | no disponible | Dataset y métodos de generación de danza | múltiples bailarines | no disponible | no disponible |

Los tres modelos de comparación se mencionan en la model card como objetivos de escalado futuro (multi-performer), no como alternativas evaluadas empíricamente contra KrumpRobot. No hay datos de benchmarks comparativos publicados en la información disponible.

## Limitaciones y advertencias

- Entrenado sobre una única toma de un único intérprete: el error en test no visto (18,58°) supera ampliamente el de train (1,42°) y la línea base trivial (2,95°), lo que indica memorización de secuencia y escasa generalización a freestyle nuevo.
- Vocabulario coreográfico cerrado a cinco primitivas; no genera movimientos fuera de ese conjunto.
- Dependencia de la fase de beat a 140 BPM: el rendimiento fuera de ese tempo no está documentado.
- Solo metadatos en inglés; no aplica soporte multilingüe.
- Riesgo de alucinación no aplica en el sentido de lenguaje, pero sí de generar movimientos físicamente inviables fuera de la distribución de entrenamiento; el margen ZMP de 4,2 cm es una garantía empírica, no formal.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de vídeo de una actuación real de Arun Nadarasa: conviene revisar los derechos sobre la grabación original antes de explotación comercial.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- El repositorio es pequeño (0,1 GB) y con 63 descargas y 1 like, lo que limita la validación independiente.
- La model card incluye agradecimientos a "Gemini 4 Argon" y "Google Antigravity", herramientas cuyo estado público no está verificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/socialprescribing/KrumpRobot
- Demo interactiva 3D WebGL: https://huggingface.co/spaces/socialprescribing/KrumpRobot
- Portal del proyecto e investigación: https://arunnadarasa.github.io/quantumkrump/
- Preimpreso (PDF de 12 páginas): https://huggingface.co/socialprescribing/KrumpRobot/resolve/main/krumprobot-physical-ai-paper.pdf
- Recibo de ablación temporal: https://huggingface.co/socialprescribing/KrumpRobot/resolve/main/deep_review_ablation_receipt_20261111.json
- Plataforma de entrenamiento: https://modal.com
- Dataset AMASS: no disponible enlace directo en la información proporcionada
