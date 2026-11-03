# hkblockchaintechnology/tiny-computer-agent

## Resumen

Tiny Computer Agent es un *harness* agéntico de código abierto publicado por hkblockchaintechnology en HuggingFace bajo licencia MIT. No es un modelo de pesos en sí, sino un marco de ejecución que orquesta un bucle observe → think → act → verify para controlar un ordenador real mediante un modelo de visión-lenguaje de pequeño tamaño (≤ 3B parámetros, cuantizado) que emite exactamente una acción de un vocabulario cerrado. El objetivo declarado es operar un escritorio de forma completamente local, sin API en la nube, sin claves y sin telemetría, con un núcleo que solo importa la biblioteca estándar de Python.

El proyecto se encuentra en estado de alfa temprana. El bucle funciona de extremo a extremo con una pantalla guionizada, ejecución en modo *dry-run*, interfaz de línea de comandos y 56 pruebas offline que no requieren pantalla, modelo ni red. El *backend* de visión está documentado como una costura de integración, no como una funcionalidad operativa: `GrabScreen` captura píxeles mediante `mss`, pero todavía no existe un conversor de píxeles a índice de elementos (OCR o AT-SPI), por lo que una pantalla real produce cero elementos y ninguna inferencia está conectada.

Su relevancia actual reside en la propuesta arquitectónica: delegar la localización de elementos en OCR o en el árbol de accesibilidad, y reservar al modelo únicamente la elección de acción sobre un menú cerrado (`click`, `type`, `key`, `scroll`, `wait`, `done`), con puertas de política, presupuesto de pasos y un interruptor de emergencia basado en fichero. Esto permite que un VLM de unos cientos de MB o pocos miles de millones de parámetros opere en la misma máquina que controla, sin GPU dedicada necesariamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Harness agéntico en Python; no incluye pesos de modelo propios. Diseñado para acoplar un VLM externo (Moondream 2, SmolVLM-256M/500M, Qwen2-VL-2B-Instruct, Florence-2-base) |
| Parámetros totales | No aplica al harness; el modelo objetivo es ≤ 3B parámetros (cuantizado) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del VLM acoplado) |
| Tipos de cuantización | No disponible (depende del VLM acoplado) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (el harness no distribuye pesos; los backends candidatos se cargarían en sus formatos propios) |

## Arquitectura y entrenamiento

El componente central es `AgentLoop`, que ejecuta un ciclo de cuatro fases: observar (captura de pantalla, reescalado y, opcionalmente, texto OCR o árbol de accesibilidad), pensar (el VLM emite una única acción validada contra un vocabulario cerrado), actuar (ejecución mediante `DryRunExecutor` o `PyAutoGuiExecutor`) y verificar (relectura de la pantalla tras cada acción). El bucle se detiene ante `done`, agotamiento del presupuesto de pasos, activación del interruptor de emergencia (fichero `/tmp/tiny-computer-agent.STOP`), rechazo de política, fallo de acción o error del cerebro. Cada paso se registra en un objeto `Episode` renderizable o convertible en filas de tabla.

Se incluyen tres cerebros: `MockBrain` (reproduce un guion), `PlannerBrain` (basado en reglas, hace clic en el elemento que coincide con el objetivo, espera diálogos y rechaza repetir la misma etiqueta) y `VLMBrain` (costura de integración con ensamblado de prompt y validación de respuesta implementados, pero con `_generate()` pendiente de implementación por el usuario). Existen dos ejecutores: `DryRunExecutor` (por defecto, registra el plan y resuelve etiquetas a píxeles) y `PyAutoGuiExecutor` (entrada real, rechaza hacer clic cuando una etiqueta no coincide con ningún elemento). La entrada real exige dos indicadores deliberados: `--real-input` y la variable de entorno `TINY_COMPUTER_AGENT_ALLOW_REAL_INPUT=1`. No se documenta entrenamiento, composición de dataset, RLHF ni DPO, porque el proyecto no entrena modelos.

## Capacidades

- Bucle agéntico completo observe → think → act → verify con relectura de pantalla tras cada acción.
- Vocabulario de acciones cerrado y validado antes de la ejecución: `click`, `type`, `key`, `scroll`, `wait`, `done`.
- Tres implementaciones de cerebro intercambiables (`MockBrain`, `PlannerBrain`, `VLMBrain`) y dos ejecutores (`DryRunExecutor`, `PyAutoGuiExecutor`).
- Puertas de política: texto en lista de denegación (`sudo`, `rm -rf`, "password", "api_key"), widgets denegados (terminal, llavero, gestor de contraseñas, cartera, banco), cuatro combinaciones de teclas denegadas, fichero de interruptor de emergencia y presupuesto de pasos.
- Registro de episodios en objetos `Episode` con renderizado y exportación a filas para dataframe o tabla de notebook.
- Ejecución offline: sin llamadas de red en tiempo de ejecución y núcleo sin dependencias fuera de la biblioteca estándar.
- Captura de pantalla mediante `mss` y reescalado de fotogramas.
- Integración prevista con OCR o árbol de accesibilidad (AT-SPI) para construir el índice de elementos (no implementado todavía).
- Soporte de *tool calling* estructurado mediante el vocabulario cerrado de acciones, no mediante function calling genérico de un LLM.
- Capacidades multilingües: no disponibles (dependen del VLM acoplado).

## Casos de uso

- Automatización de tareas de escritorio en entornos aislados: el bucle con `DryRunExecutor` permite ensayar un flujo completo (por ejemplo, pulsar "Save") y revisar el episodio registrado antes de habilitar entrada real, reduciendo el riesgo de acciones destructivas.
- Rehearsal y validación de políticas de seguridad: las puertas de política y el interruptor de emergencia permiten probar qué acciones se bloquean (texto con `sudo`, widgets de banca o llavero) sin ejecutar nada, útil para auditar flujos agénticos antes de producción.
- Agente local en portátil sin GPU dedicada: al acoplar SmolVLM-256M o SmolVLM-500M (unos cientos de MB), el agente puede ejecutarse en CPU en la misma máquina que controla, sin latencia de red ni coste de API.
- Investigación en agentes de interfaz gráfica: la separación entre localización de elementos (OCR/AT-SPI) y selección de acción (VLM) permite experimentar con distintos backends sin reescribir el bucle, y comparar `PlannerBrain` frente a `VLMBrain` sobre el mismo `Episode`.
- Pruebas de regresión de interfaces de escritorio: `MockBrain` con `FakeScreen` permite codificar guiones de interacción y verificar que el agente produce la secuencia de acciones esperada en CI, sin pantalla ni modelo.
- Generación de trazas para entrenamiento o evaluación: `episode.to_rows()` exporta cada paso (acción, motivo, resultado) como filas tabulares, aprovechables para construir datasets de trayectorias de agente.
- Despliegue en entornos con requisitos de privacidad: al no haber telemetría ni llamadas de red en ejecución, encaja en escenarios donde la pantalla no puede salir de la máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El harness en sí no requiere GPU: el núcleo solo usa la biblioteca estándar de Python y las 56 pruebas se ejecutan sin pantalla, modelo ni red.
- La VRAM depende enteramente del VLM acoplado. Para los backends candidatos citados: SmolVLM-256M y SmolVLM-500M ocupan unos cientos de MB y son viables en CPU; Qwen2-VL-2B-Instruct y Florence-2-base requieren más memoria y se benefician de GPU.
- GPU recomendadas: no disponibles de forma específica en la documentación; el diseño apunta a que un portátil con GPU consumer o CPU simple ejecute el agente en la misma máquina que controla.
- Cabe en GPU consumer: sí, con los backends pequeños (SmolVLM-256M/500M) según el diseño declarado; no se especifican modelos concretos de GPU.
- Opciones de despliegue: ejecución directa con `python -m tiny_computer_agent` (modo guionizado o `--live`), instalación editable con `pip install -e .` y suite de pruebas con `pytest`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Modelo incluido | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Tiny Computer Agent | Harness agéntico de escritorio | No (acopla VLM externo ≤ 3B) | No disponible | MIT | Alfa temprana, 56 tests offline |
| Moondream 2 | VLM | Sí | No disponible en esta información | No disponible en esta información | Backend candidato citado por el autor |
| SmolVLM-256M / 500M | VLM | Sí | No disponible en esta información | No disponible en esta información | Backend candidato citado por el autor |
| Qwen2-VL-2B-Instruct | VLM | Sí | No disponible en esta información | No disponible en esta información | Backend candidato citado por el autor |
| Florence-2-base | VLM | Sí | No disponible en esta información | No disponible en esta información | Backend candidato citado por el autor |

La comparación directa no es posible en términos de parámetros o benchmarks porque Tiny Computer Agent no es un modelo de pesos, sino un marco de ejecución; los backends citados son alternativas de modelo que el harness puede alojar.

## Limitaciones y advertencias

- Estado alfa temprana: el autor declara explícitamente que el bucle funciona con pantalla guionizada y ejecución en seco, pero que ver una pantalla real de forma útil todavía no está implementado.
- Sin backend de visión operativo: `GrabScreen` captura píxeles, pero no hay conversión de píxeles a índice de elementos (OCR o AT-SPI), por lo que una pantalla real produce cero elementos y la ruta de etiquetas no funciona en vivo.
- Ningún modelo está conectado: `VLMBrain._generate()` queda a cargo del usuario; sin esa implementación no hay inferencia.
- Riesgo de acciones destructivas: el propio autor advierte que un modelo pequeño adivinando píxeles es la vía para pulsar "Delete account"; por ello `PyAutoGuiExecutor` rechaza hacer clic cuando una etiqueta no coincide con ningún elemento.
- La entrada real requiere dos indicadores deliberados (`--real-input` y `TINY_COMPUTER_AGENT_ALLOW_REAL_INPUT=1`); el valor por defecto es ejecución en seco.
- Sesgos conocidos: no disponibles; dependen del VLM acoplado y de los datos con los que se haya entrenado.
- Riesgo de alucinación: mitigado parcialmente por el vocabulario cerrado de acciones y la validación previa a la ejecución, pero el modelo puede elegir una acción válida sobre un elemento equivocado si el índice de elementos es incorrecto.
- Limitaciones de idioma: no disponibles; dependen del backend.
- Restricciones de licencia: MIT permite uso comercial, pero las licencias de los VLM acoplados (Moondream 2, SmolVLM, Qwen2-VL, Florence-2) deben verificarse por separado antes de producción.
- Las puertas de política cubren texto, widgets y combinaciones de teclas denegadas, pero no constituyen un sandbox de sistema operativo; no se documenta aislamiento a nivel de proceso o contenedor.
- Sin datos de benchmarks, latencia ni throughput: no es posible estimar rendimiento en producción a partir de la información disponible.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/hkblockchaintechnology/tiny-computer-agent
