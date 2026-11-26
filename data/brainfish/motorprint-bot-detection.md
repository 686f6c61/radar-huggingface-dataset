# brainfish/motorprint-bot-detection

## Resumen

motorprint es un detector de bots frente a humanos que se ejecuta íntegramente en el navegador. Lo desarrolla Brainfish AI (autor: Ajain Vivek) y se publica bajo licencia MIT. El modelo analiza la dinámica de los dispositivos de entrada —movimiento del puntero, clics, desplazamiento y ritmo de tecleo— y devuelve una puntuación de automatización entre 0 y 1 para cada ventana de 3 segundos de eventos. No es un modelo de lenguaje ni un transformer: es un clasificador tabular minúsculo pensado para inferencia local en la pestaña, sin servidor ni llamadas de red.

La relevancia actual reside en su huella: la red tiene 1.793 parámetros (349 pesos no nulos tras una poda del 80 %), se serializa como un JSON de 4.488 bytes (1.763 bytes comprimido con gzip) y la biblioteca completa con el modelo pesa unos 5,8 KB gzip. Esto permite desplegar detección de automatización sin coste de servidor, sin latencia de red y sin enviar datos biométricos de comportamiento fuera del dispositivo, algo relevante para cumplimiento de privacidad.

El modelo combina una red MLP entrenada por gradiente con unidades escritas directamente en el espacio de pesos (weight-space programming) y con señales de procedencia calculadas por el grabador de eventos, no por la red. El repositorio no incluye exportaciones ONNX, PyTorch ni safetensors: se distribuye como especificación JSON ejecutada por un runtime TypeScript de unas 50 líneas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 38 → 32 → 16 → 1, activación ReLU, salida sigmoide |
| Parametros totales | 1.793 (1.744 pesos + 49 sesgos); 349 pesos no nulos (80 % podados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de 3 s de eventos de entrada; `windowMs` = 3000) |
| Tipos de cuantizacion | int8 simétrico, una escala float por fila de salida; pesos en base64 dentro de un JSON |
| Idiomas soportados | no disponible (independiente del idioma; analiza señales de entrada) |
| Licencia | MIT |
| Formato de pesos | especificación JSON (`model/motorprint-model.json`) y módulo TypeScript (`model/weights.ts`); sin ONNX, PyTorch ni safetensors |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa de tres capas (38 entradas, 32 y 16 unidades ocultas, una salida) con ReLU y sigmoide final. Recibe 38 características por ventana de 3 segundos de eventos del navegador; dos de ellas (`click_offset` y `wheel_dy_cv`) están desactivadas. La decisión final aplica una media móvil exponencial (α = 0,35) sobre el log-odds de cada ventana: se marca `isBot` si la puntuación suavizada alcanza 0,704 o si se dispara alguna señal de procedencia. Parte de la red no se entrenó por gradiente: las unidades G (ronda 1) y B, W y R (ronda 2) se escribieron directamente en el espacio de pesos siguiendo el trabajo *Sparks of Weight-Space Programming* (Takehi, Teoh, Zhang y Khattab, MIT CSAIL, noviembre de 2026). Las señales de procedencia (`teleportClick`, `pressure0`, `keylessInsert`, ronda 3) se calculan en el grabador, no en la red.

Los datos humanos provienen de seis conjuntos de investigación con licencia abierta: 421 usuarios y 5.657 sesiones de AdSERP, Freihaut & Göritz MouseTask, DUX, Bogazici (BOUN) mouse dynamics, KeyRecs y el benchmark de tecleo de CMU; cinco son CC BY 4.0 y el de CMU se declara de uso libre con cita. Todos se convirtieron a eventos de navegador y se dividieron por usuario en 70/15/15 (268 / 74 / 79 usuarios). Los datos de bots de entrenamiento son 460 sesiones de Playwright en cinco estilos: teleport, linear, eased, bezier y eventos DOM. Los datos crudos no se redistribuyen y los autores de los conjuntos no avalan motorprint.

## Capacidades

- Clasificación binaria de automatización por ventana de 3 segundos, con puntuación continua de 0 a 1 y umbral de decisión en 0,704.
- Análisis de dinámica de ratón: velocidad, jerk (derivada de la aceleración), curvatura y ritmo temporal del puntero.
- Análisis de dinámica de tecleo: ritmo y temporización de las pulsaciones.
- Procesamiento de clics y desplazamiento con rueda como parte de las características de entrada.
- Señales de procedencia independientes de la red: `teleportClick`, `pressure0` y `keylessInsert`, con contadores acumulativos por sesión.
- Suavizado temporal mediante EMA sobre ventanas sucesivas, con recuento de ventanas y eventos procesados.
- Ejecución 100 % en el dispositivo, sin servidor, sin LLM y sin llamada de red.
- Puntuación offline de sesiones grabadas mediante `scoreEvents(events)`.
- Integración React mediante el hook `useBotScore()`.
- Modo solo movimiento (`useSignals: false`) para entornos donde las señales de procedencia no están verificadas.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un clasificador tabular.

## Casos de uso

- Detección de fraude en formularios web: el detector puntúa cada ventana de 3 segundos mientras el usuario rellena un formulario y eleva la puntuación de riesgo de la sesión si `isBot` se mantiene durante varias ventanas, sin enviar datos biométricos al servidor.
- Protección de registros y creación de cuentas: integrado en el flujo de alta, marca sesiones sospechosas para revisión manual o para desafíos adicionales, usando el umbral 0,704 y el suavizado EMA para evitar falsos positivos por ventanas aisladas.
- Mitigación de scraping y automatización de compras: al ejecutarse en la pestaña, detecta sesiones de Playwright con estilos teleport, linear, eased o bezier sin coste de infraestructura ni latencia de red.
- Señal para motores de gestión de riesgo: el modelo está diseñado explícitamente como una señal más dentro de un motor de riesgo, no como una barrera; se combina con otras señales del backend para decidir el bloqueo.
- Analítica de calidad de tráfico: puntuar sesiones de forma agregada para medir qué proporción del tráfico es automatizada, con la ventaja de que el modelo cabe en 5,8 KB gzip y no requiere backend de inferencia.
- Aplicaciones React con requisitos de privacidad: el hook `useBotScore()` permite añadir la puntuación a paneles internos o a flujos de confianza sin dependencias de servidor, útil en entornos con restricciones de transferencia de datos personales.
- Evaluación offline de sesiones grabadas: `scoreEvents(events)` permite reanalizar sesiones históricas para calibrar umbrales o auditar incidentes sin instrumentación en vivo.

## Benchmarks y rendimiento

La model card describe un benchmark con 10 herramientas comerciales en sus valores por defecto sobre una página de prueba de cuatro tareas, con un conjunto A de 300 sesiones por herramienta y un conjunto B regrabado con señales de procedencia. Los resultados están en `results/round3-RESULTS.md` y `results/round3-combined.json`, y existe una línea base entrenada por gradiente en `results/bench-eval-pre-wsp2-baseline.json`. Sin embargo, las cifras concretas no se incluyen en la información proporcionada, por lo que no se reproducen aquí.

| Benchmark | Resultado | Comparación |
|---|---|---|
| Conjunto A (10 herramientas, 300 sesiones por herramienta) | no disponible en la información proporcionada | no disponible |
| Conjunto B (regrabado con señales de procedencia) | no disponible en la información proporcionada | no disponible |
| Línea base entrenada por gradiente | no disponible en la información proporcionada | no disponible |
| Latencia, tamaños y memoria (`results/speed.json`) | no disponible en la información proporcionada | no disponible |

## Requisitos de hardware

- VRAM: no aplica; la inferencia ocurre en CPU dentro de la pestaña del navegador.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU de consumo y en cualquier dispositivo con un navegador moderno, dado que el modelo pesa 1.763 bytes gzip y la biblioteca completa unos 5,8 KB gzip.
- Despliegue: biblioteca TypeScript `motorprint` instalada desde GitHub (no publicada aún en npm; requiere `npm run build:lib`), con runtime propio de ~50 líneas (`createModel`). No hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: los datos están en `results/speed.json`, pero las cifras no se han facilitado en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. Las alternativas habituales en detección de bots (servicios comerciales de CAPTCHA, modelos de riesgo en servidor o clasificadores de comportamiento entrenados por gradiente) no se detallan con parámetros, contexto ni licencia en la documentación disponible, por lo que no se puede construir una comparación cuantitativa rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| motorprint | 1.793 (349 no nulos) | ventanas de 3 s | MIT | Hugging Face y GitHub |
| Alternativas comerciales de detección de bots | no disponible | no disponible | propietaria | no disponible |
| Clasificadores de comportamiento en servidor | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte que es una señal para un motor de riesgo, no una barrera: nunca debe bloquear a una persona basándose solo en su puntuación.
- Las señales de procedencia (`teleportClick`, `pressure0`, `keylessInsert`) no están verificadas en Safari, Firefox, lápices, escritorio remoto o dictado; en esos entornos se recomienda el modo solo movimiento (`useSignals: false`).
- La ventana de análisis debe coincidir con el entrenamiento (`windowMs` = 3000); cambiarla invalida el comportamiento calibrado.
- El umbral 0,704 y el suavizado α = 0,35 están fijados en el modelo publicado; recalibrarlos requiere datos propios.
- Riesgo de falsos positivos en usuarios con patrones de entrada atípicos (accesibilidad, dispositivos de entrada alternativos, automatizaciones legítimas de accesibilidad).
- Los datos de entrenamiento humanos provienen de conjuntos de investigación y los bots de sesiones de Playwright en cinco estilos; la generalización a otros frameworks de automatización no está documentada.
- Los datos crudos no se redistribuyen y los autores de los conjuntos no avalan el modelo.
- No hay exportación a ONNX, PyTorch ni safetensors; la integración está atada al runtime TypeScript propietario.
- La licencia MIT permite uso comercial, pero no se documentan garantías ni auditorías de sesgo.
- No hay información sobre rendimiento en idiomas o regiones específicas porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brainfish/motorprint-bot-detection
- Demo en vivo: https://motorprint.brainfish.ai
- Space de demostración: https://huggingface.co/spaces/brainfish/motorprint-bot-detection-demo
- Código fuente: https://github.com/brainfish-ai/motorprint (commit `e5b3709`, rama `feat/real-human-data`, PR #1)
- Paper: `paper/motorprint.pdf` en el repositorio del modelo — *motorprint: A 6 KB On-Device Bot Detector for the Browser, Built with Weight-Space Programming and Input Provenance Signals* (Ajain Vivek, Brainfish AI, 2026)
- Referencia de weight-space programming: https://rikiyat.github.io/blog/weight-space-programming/
