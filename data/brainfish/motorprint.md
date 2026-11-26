# brainfish/motorprint

## Resumen

motorprint es un detector de bots frente a humanos que se ejecuta íntegramente en el navegador, desarrollado por Brainfish AI (autor: Ajain Vivek). Lee la dinámica del puntero, clics, desplazamiento y tecleo (velocidad, jerk, curvatura, ritmo temporal), puntúa cada ventana de 3 segundos con una red neuronal int8 muy pequeña y devuelve una puntuación de bot entre 0 y 1. No hay servidor, ni LLM, ni llamada de red: todo el cálculo ocurre dentro de la pestaña.

El modelo es un MLP de 38 entradas → 32 → 16 → 1 con activaciones ReLU y salida sigmoide, con solo 1.793 parámetros (1.744 pesos y 49 sesgos), de los cuales únicamente 349 pesos son no nulos tras una poda del 80 %. Los pesos se almacenan en int8 simétrico con una escala float por fila de salida, codificados en base64 dentro de una especificación JSON de 4.488 bytes (1.763 bytes comprimidos con gzip). La biblioteca completa con el modelo ocupa unos 5,8 KB comprimidos.

Su relevancia actual radica en que propone una alternativa de detección de automatización en el cliente con un coste de recursos mínimo y sin dependencia de infraestructura, empleando programación en espacio de pesos (*weight-space programming*) para escribir a mano algunas unidades de la red y señales de procedencia de entrada calculadas fuera de la red. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 38 → 32 → 16 → 1, ReLU, salida sigmoide |
| Parametros totales | 1.793 (1.744 pesos + 49 sesgos); 349 pesos no nulos (80 % podados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de 3 s por inferencia, no es un modelo de contexto) |
| Tipos de cuantizacion | int8 simétrico, una escala float por fila de salida; base64 en especificación JSON |
| Idiomas soportados | no disponible (independiente del idioma; opera sobre eventos de entrada) |
| Licencia | MIT |
| Formato de pesos | JSON (`ModelSpec`) y módulo TypeScript (`weights.ts`); sin ONNX, PyTorch ni safetensors |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de tres capas (38 → 32 → 16 → 1) con ReLU en las capas ocultas y sigmoide en la salida. Cada ventana de 3 segundos de eventos del navegador se transforma en 38 características (dos de ellas, `click_offset` y `wheel_dy_cv`, están desactivadas). La decisión final se toma aplicando una media móvil exponencial (EMA) con α = 0,35 sobre los log-odds de cada ventana; se marca `isBot` si la puntuación suavizada es ≥ 0,704 o si se dispara alguna señal de procedencia. Las señales de procedencia (`teleportClick`, `pressure0`, `keylessInsert`) se calculan en el grabador, no por la red.

Parte de la red se escribió directamente en espacio de pesos siguiendo el artículo *Sparks of Weight-Space Programming* (Takehi, Teoh, Zhang y Khattab, MIT CSAIL, noviembre de 2026): la unidad G (ronda 1) y las unidades B, W y R (ronda 2). Los datos de entrenamiento para humanos provienen de seis conjuntos de datos de investigación con licencia abierta (421 usuarios, 5.657 sesiones): AdSERP, Freihaut & Göritz MouseTask, DUX, Bogazici (BOUN) mouse dynamics, KeyRecs y el benchmark de tecleo de CMU. Cinco son CC BY 4.0 y el de CMU se declara de uso libre con cita. La división se hizo por usuario en 70/15/15 (268 / 74 / 79 usuarios). Para bots se usaron 460 sesiones de Playwright en cinco estilos (teleport, linear, eased, bezier y eventos DOM). No se redistribuyen los datos crudos.

## Capacidades

- Detección de automatización en el navegador basada en dinámica de ratón (velocidad, jerk, curvatura) y de tecleo (ritmo temporal).
- Puntuación por ventana de 3 segundos con suavizado EMA y umbral calibrado (0,704).
- Señales de procedencia independientes de la red: `teleportClick`, `pressure0`, `keylessInsert`.
- Ejecución 100 % en el cliente, sin red ni servidor, con un runtime TypeScript de unas 50 líneas (`createModel`).
- Integración React mediante el hook `useBotScore`.
- Puntuación offline de sesiones grabadas con `scoreEvents(events)`.
- Modo solo movimiento (`useSignals: false`) para audiencias con Safari, Firefox, lápices, escritorio remoto o dictado, donde las señales no están verificadas.
- Configuración de parámetros: `intervalMs` (500), `windowMs` (3000, debe coincidir con el entrenamiento), `minEvents` (4), `smoothing` (0,35), `model` (especificación propia) y `autoStart` (true).

## Casos de uso

- Detección de bots en formularios de registro: el detector puntúa la interacción previa al envío y permite marcar sesiones sospechosas antes de crear la cuenta, sin llamadas de red ni latencia perceptible.
- Mitigación de fraude en promociones y cupones: se integra en la página de canje para elevar la puntuación de riesgo cuando la dinámica del puntero o del tecleo presenta patrones de automatización, usando el umbral 0,704 como señal para revisión.
- Protección de APIs de scraping ligero en el cliente: al ejecutarse en la pestaña, añade una capa de señal de comportamiento antes de que la petición llegue al backend, útil como entrada a un motor de riesgo.
- Analítica de calidad de tráfico: se registran las puntuaciones y las señales de procedencia por sesión para auditar la proporción de tráfico automatizado en campañas o funnels concretos.
- Verificación de interacción humana en encuestas y paneles de investigación: el modo solo movimiento permite descartar respuestas generadas por automatización sin depender de señales no verificadas en navegadores o dispositivos concretos.
- Filtrado previo en sistemas de ticketing o soporte: se marca la sesión como sospechosa cuando `windows >= 4` e `isBot` es verdadero, y se enruta a revisión manual en lugar de bloquear automáticamente.
- Evaluación offline de sesiones grabadas: `scoreEvents(events)` permite reanalizar grabaciones históricas para calibrar umbrales o comparar con otras herramientas.

## Benchmarks y rendimiento

El autor publica un benchmark sobre 10 herramientas comerciales con sus valores por defecto en una página de prueba de cuatro tareas. El conjunto A tiene 300 sesiones por herramienta y el conjunto B (regrabado con sonda de procedencia) 80 por herramienta; los resultados usan solo la mitad de evaluación reservada (148 por herramienta en A, 40 por herramienta en B). Los humanos son 2.547 segmentos de diez segundos de los 79 usuarios de test reservados. El umbral se calibra únicamente con usuarios de validación. En la información disponible no se detallan las cifras concretas de precisión, recall o AUC por herramienta, por lo que no se reproducen aquí.

| Aspecto | Dato disponible |
|---|---|
| Tamaño de la especificación del modelo | 4.488 B (1.763 B gzip) |
| Tamaño de la biblioteca completa | ~5,8 KB gzip |
| Parámetros | 1.793 (349 no nulos) |
| Umbral de decisión | 0,704 sobre EMA (α = 0,35) |
| Ventana de inferencia | 3 s |
| Latencia y throughput | en `results/speed.json`, cifras no incluidas en la información proporcionada |

## Requisitos de hardware

- No requiere GPU: la inferencia se ejecuta en el hilo del navegador con una red de 1.793 parámetros en int8.
- Huella de memoria mínima: la especificación del modelo ocupa 4.488 bytes y la biblioteca completa unos 5,8 KB comprimidos.
- Compatible con cualquier navegador que ejecute el runtime TypeScript de la biblioteca; no se especifican requisitos mínimos de CPU ni de motor JavaScript.
- Despliegue mediante la biblioteca `motorprint` instalada desde GitHub (`npm run build:lib`); no está publicada en npm. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: los datos están en `results/speed.json` del repositorio, pero no se incluyen en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| motorprint | MLP tabular int8 en navegador | 1.793 (349 no nulos) | ventana de 3 s | MIT | Hugging Face y GitHub (no en npm) |
| Herramientas comerciales de detección de bots (10 evaluadas por el autor) | propietarias, del lado del servidor o SDK | no disponible | no disponible | propietaria | comercial |
| Clasificadores tabulares genéricos (p. ej. gradient boosting) | árboles/ensambles | variable | no aplica | variable | amplia |

La comparación directa con alternativas de la misma categoría (detección de bots en cliente) no está disponible en la información proporcionada; el autor solo reporta el benchmark frente a 10 herramientas comerciales sin detallar sus especificaciones.

## Limitaciones y advertencias

- El propio autor advierte que es una señal para un motor de riesgo, no una barrera: nunca debe bloquear a una persona por sí solo.
- Las señales de procedencia (`teleportClick`, `pressure0`, `keylessInsert`) no están verificadas en Safari, Firefox, lápices, escritorio remoto o dictado; en esos entornos se recomienda el modo solo movimiento.
- El umbral 0,704 está calibrado solo con usuarios de validación; puede requerir recalibración en poblaciones distintas.
- La ventana debe ser de 3 segundos para coincidir con el entrenamiento; cambiarla invalida el comportamiento esperado.
- Los datos de entrenamiento humanos provienen de conjuntos de investigación y los autores de esos datos no respaldan motorprint.
- No se redistribuyen los datos crudos, lo que limita la reproducibilidad completa del entrenamiento.
- No hay exportación a ONNX, PyTorch ni safetensors; la integración depende del runtime TypeScript propietario de la biblioteca.
- La biblioteca no está publicada en npm, lo que añade fricción de despliegue.
- No se detallan métricas de sesgo, tasas de falsos positivos por dispositivo ni comportamiento frente a bots adaptativos; deben evaluarse antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brainfish/motorprint
- Repositorio de código: https://github.com/brainfish-ai/motorprint (commit `e5b3709`, rama `feat/real-human-data`, PR #1)
- Artículo: `paper/motorprint.pdf` en el repositorio de código
- Referencia de programación en espacio de pesos: https://rikiyat.github.io/blog/weight-space-programming/
- Resultados: `results/round3-RESULTS.md`, `results/round3-combined.{md,json}`, `results/bench-eval-pre-wsp2-baseline.json`, `results/replay-fingerprint.json`, `results/speed.json`, `results/number-check-log.txt`
- Documentación de datos: `DATA.md` en el repositorio de código
