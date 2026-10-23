# madokalif/gr00t-n1.7-openfly-macro

## Resumen

`madokalif/gr00t-n1.7-openfly-macro` es un ajuste fino del modelo vision-lenguaje-acción (VLA) `nvidia/GR00T-N1.7-3B` orientado a navegación de drones en el simulador OpenFly. Lo publica el usuario `madokalif` como un nuevo *embodiment* (etiqueta `new_embodiment`) del modelo base, con 3.144.016.000 parámetros en formato safetensors y un repositorio de 6,9 GB. El modelo no genera texto conversacional: produce directamente acciones de control a partir de una imagen de cámara frontal de 320x240, una instrucción en lenguaje natural y un vector de estado de navegación (altitud, seno y coseno del yaw).

La aportación principal es la discretización de la navegación en macro-acciones: cada paso corresponde a una decisión de anotación de OpenFly (avanzar 3, 6 o 9 m, girar 30 grados, subir o bajar 3 m, o detenerse), de modo que el modelo aprende a emitir comandos de alto nivel en lugar de consignas de bajo nivel. Se entrenó sobre 1,59 millones de decisiones del split de entrenamiento de OpenFly, durante 30.000 pasos (1,2 épocas), con el VLM del modelo base congelado.

Su relevancia es acotada pero clara: es un artefacto de investigación reproducible (log de experimentos, scripts de servicio y configuración de modalidad publicados) que sirve como línea base para VLA aéreas y para estudiar la interfaz entre razonamiento visual-lenguaje y control de vuelo. Sus resultados son todavía preliminares: recall balanceado offline de 0,449 en escenarios vistos y 0,442 en no vistos, sin ninguna evaluación en bucle cerrado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de `nvidia/GR00T-N1.7-3B`; la model card no detalla el backbone ni el cabezal de acción |
| Parametros totales | 3.144.016.000 (aproximadamente 3,14 B), según safetensors |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica solo safetensors; no se ofrecen GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | `other`: se aplican la licencia del modelo base NVIDIA GR00T-N1.7-3B y los términos de OpenFly |
| Formato de pesos | safetensors |
| Pipeline | `robotics` |
| Entrada visual | Cámara frontal RGB 320x240 |
| Entrada de estado | `nav_state`: altitud, sen, cos del yaw |
| Dimensión de acción | 6 por paso: dx, dy, dz en metros (sistema de referencia del cuerpo), dyaw en radianes, `hover_stop`, `land` |
| Horizonte de acción | 8 pasos (`DRONE_ACTION_HORIZON=8`) |
| Tamaño del repositorio | 6,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.7-3B`, un VLA de 3B parámetros, y se re-entrena como nuevo *embodiment* mediante la herramienta de conversión del repositorio `Index-23227/drone` sobre el split de entrenamiento del dataset OpenFly. La model card no especifica la arquitectura interna del modelo base (composición del backbone visual-lenguaje, tipo de cabezal de acción ni mecanismo de difusión o regresión), por lo que ese detalle debe consultarse en la documentación de `nvidia/GR00T-N1.7-3B`. Sí se documenta que el VLM permanece congelado durante el ajuste fino y que solo se adapta la interfaz de acción al nuevo embodiment.

El entrenamiento se ejecutó en 2 GPU H100 con batch global de 64, learning rate máximo de 1e-4, 30.000 pasos (1,2 épocas) sobre 1,59 millones de decisiones. Cada muestra es un único frame actual (sin agregación temporal: `DRONE_VIDEO_DELTAS=0`), una instrucción en lenguaje natural y el estado `nav_state`, con etiqueta de macro-acción discretizada según las anotaciones de OpenFly. No se documentan fases de RLHF, DPO ni aprendizaje por refuerzo; el pipeline es de imitación supervisada sobre trayectorias anotadas.

## Capacidades

- Predicción de macro-acciones de navegación aérea: avance de 3, 6 o 9 m, giro de 30 grados, ascenso o descenso de 3 m y parada.
- Emisión de acciones continuas de 6 dimensiones (dx, dy, dz, dyaw, `hover_stop`, `land`) con horizonte de 8 pasos.
- Seguimiento de instrucciones en lenguaje natural referidas a la escena visible (navegación guiada por lenguaje, aerial-VLN).
- Condicionamiento en estado de vuelo parcial: altitud y orientación (sen y cos del yaw).
- Procesamiento de imagen de cámara frontal en resolución 320x240, propia de los simuladores de OpenFly.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso explícito, modo *thinking*, visión general, audio ni generación de texto libre.
- No se documenta soporte multilingüe; el idioma de las instrucciones de entrenamiento no se especifica en la información disponible.

## Casos de uso

- Investigación en navegación VLN aérea: servir como línea base reproducible para comparar nuevas políticas de navegación guiadas por lenguaje dentro de los simuladores de OpenFly, usando `scripts/eval_server/run_sim_eval.sh` del repositorio `drone`.
- Punto de partida para ajustes finos de nuevos drones: al estar registrado como `new_embodiment`, la configuración de modalidad (`configs/drone_config.py`) y el servidor de política sirven de plantilla para adaptar GR00T N1.7 a otros chasis, sensores o espacios de acción.
- Estudio de macro-acciones frente a control de bajo nivel: permite medir experimentalmente si discretizar el espacio de acción en saltos de 3/6/9 m y giros de 30 grados reduce la carga de aprendizaje frente a regresión continua.
- Ablaciones de memoria temporal: con `DRONE_VIDEO_DELTAS=0` y un solo frame por decisión, el modelo es una base limpia para cuantificar cuánto aporta (o resta) incorporar contexto visual multi-frame.
- Etiquetado y aumento de datos de trayectorias: las predicciones de macro-acción pueden usarse para pre-anotar secuencias de OpenFly y filtrar candidatas antes de la revisión humana.
- Prototipado de servidores de política: `scripts/run_policy_server.py` con `--modality-config-path` permite validar la integración de un VLA con un bucle de simulación antes de invertir en un modelo mayor o en datos propios.
- Docencia y demostraciones de VLA robóticas: el tamaño de 3,14 B y los pesos en safetensors permiten reproducir el pipeline completo en infraestructura académica modesta (una GPU de 24 GB), algo inviable con VLA de mayor tamaño.

## Benchmarks y rendimiento

Los únicos resultados publicados son de evaluación offline, no de bucle cerrado.

| Metrica | Valor |
|---|---|
| Recall balanceado offline, escenarios vistos | 0,449 |
| Recall balanceado offline, escenarios no vistos | 0,442 |
| Evaluación en bucle cerrado (OpenFly) | No realizada |
| MMLU, HumanEval, GSM8K u otros benchmarks de LM | No aplicables / no disponibles |

No se han publicado resultados de benchmarks estándar de lenguaje ni comparaciones con otras políticas en la información disponible. El autor indica explícitamente que aún no existe ninguna ejecución en bucle cerrado, por lo que la tasa de éxito de misiones completas es desconocida.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 7-9 GB para pesos (6,9 GB de repositorio) más codificador visual, estado y activaciones; el valor exacto no está publicado.
- VRAM estimada en fp32: aproximadamente 12,6 GB solo para pesos.
- GPU recomendadas: H100 o A100 80 GB para entrenamiento o evaluación a gran escala (el ajuste fino se hizo en 2x H100); A100 40 GB, L40S o RTX 4090 para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 y RTX 4080 (24/16 GB); en tarjetas de 12 GB el margen es ajustado y no está verificado.
- Despliegue: servidor de política de Isaac-GR00T (`scripts/run_policy_server.py`) con `--embodiment-tag new_embodiment` y `--modality-config-path configs/drone_config.py`, sobre un checkout en el commit `dac54b3`; evaluación en simulador con `scripts/eval_server/run_sim_eval.sh`.
- Variables de entorno documentadas: `DRONE_ACTION_HORIZON=8`, `DRONE_VIDEO_DELTAS=0`, `DRONE_STATE_KEYS=nav_state`.
- vLLM, llama.cpp, Ollama o TGI: no documentados para este modelo; al tratarse de un VLA con cabezal de acción, estos runners de texto no son aplicables sin trabajo adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `madokalif/gr00t-n1.7-openfly-macro` | 3,14 B | No disponible | Recall balanceado offline 0,449 / 0,442 (visto / no visto) | `other` (base NVIDIA + términos de OpenFly) | HuggingFace, 0 descargas |
| `nvidia/GR00T-N1.7-3B` (modelo base) | Aproximadamente 3 B (según el ajuste derivado) | No disponible | No disponible en esta información | Licencia NVIDIAGR00T / `other` según el modelo base | HuggingFace (modelo oficial de NVIDIA) |
| Otras políticas VLA de tamaño similar (por ejemplo, familias OpenVLA o π0) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables en la información proporcionada para comparar con alternativas de la misma categoría (VLA aéreas o políticas de navegación en OpenFly). La comparación cuantitativa con el modelo base tampoco es posible: no se publican sus métricas en el espacio de macro-acciones de OpenFly.

## Limitaciones y advertencias

- Evaluación incompleta: no existe ninguna ejecución en bucle cerrado. El recall balanceado de 0,449 (visto) y 0,442 (no visto) es una métrica offline de clasificación de acciones, no una tasa de éxito de misión.
- Tasa de error alta: un recall balanceado de aproximadamente 0,44 implica que más de la mitad de las decisiones no coinciden con la anotación de referencia en la métrica reportada; el modelo no es apto para vuelo real sin validación adicional.
- Sin memoria temporal: se usa un único frame (`DRONE_VIDEO_DELTAS=0`), lo que impide razonar sobre movimiento aparente, oclusiones o trayectorias previas.
- Espacio de acción muy discretizado: solo 3/6/9 m de avance, giros de 30 grados y ±3 m verticales; no permite correcciones finas de posición ni velocidades continuas.
- Estado de navegación mínimo: `nav_state` solo aporta altitud y orientación, sin posición, velocidad ni actitud completa.
- Brecha simulación-realidad: entrenado y pensado para cámaras de 320x240 de los simuladores de OpenFly; no hay evidencia de transferencia a un dron físico ni a otras cámaras.
- VLM congelado durante el ajuste fino: la adaptación se limita al cabezal/interface de acción, lo que puede limitar la grounding visual-lenguaje en dominios distintos de OpenFly.
- Licencia `other` con obligaciones heredadas: hay que revisar simultáneamente la licencia de `nvidia/GR00T-N1.7-3B` y los términos del dataset OpenFly antes de cualquier uso comercial; la model card no aclara el régimen de redistribución de pesos derivados.
- Sesgos: no documentados. El dataset OpenFly condiciona la distribución de escenas, instrucciones y estilos de anotación, con el riesgo de sesgo geográfico y lingüístico habitual en datos de simulación.
- Riesgo de alucinación: en un VLA se traduce en acciones plausibles pero incorrectas (avanzar hacia un obstáculo no visible o ignorar parte de la instrucción); no se han publicado análisis de calibración ni de incertidumbre.
- Madurez: 0 descargas y 0 likes, publicación sin revisión externa; la reproducibilidad depende del commit `dac54b3` de Isaac-GR00T y del repositorio `drone`.
- Idiomas y contexto: no se especifican, por lo que no se puede garantizar el comportamiento con instrucciones en castellano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/madokalif/gr00t-n1.7-openfly-macro
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset OpenFly: https://huggingface.co/datasets/IPEC-COMMUNITY/OpenFly
- Repositorio del autor (conversión, servidor de política y scripts de evaluación): https://github.com/Index-23227/drone
- Framework Isaac-GR00T (checkout en el commit `dac54b3` citado en la model card): https://github.com/NVIDIA/Isaac-GR00T
- Log de experimentos: `docs/experiments.md` dentro del repositorio `drone`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada (la búsqueda web no devolvió resultados relevantes sobre este modelo).
