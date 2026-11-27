# jrubiosainz/microduck-game-sprinter-ppo

## Resumen

Microduck Game Sprinter (PPO) es una política de control para el robot cuadrúpedo Microduck de Pollen Robotics, especializada en la prueba de sprint de 2 metros de la Microduck Arena. Se trata de un fine-tune de la política de referencia `pollen-robotics/microduck-sprint-2m-reference` (revisión `3e59e802`) entrenado con PPO (Proximal Policy Optimization) íntegramente en CPU, dentro del propio simulador de la Arena (MuJoCo 3.10.0, runner versión 4). El resultado es una política que completa el circuito en 1,100 s sobre los seeds oficiales y 1,093 s de media sobre 200 seeds, con 200/200 llegadas y cero caídas.

El modelo es relevante como ejemplo de entrenamiento de refuerzo de bajo coste: sin GPU, sin datos nuevos y sin cómputo de pago, encadenando varias fases de PPO sobre distintos tramos del circuito (llano y subida) hasta estabilizar una marcha rápida y robusta. La red conserva la forma de la referencia (61 → 512 → 256 → 128 → 14, activación ELU) y mantiene congelado el normalizador de entrada.

Es importante subrayar que se trata de un artefacto exclusivamente de simulación: la política ignora la velocidad comandada (escribe un comando interno fijo de 0,55 m/s en las 13 ranuras de comando de la observación dentro del grafo) y no incorpora ninguna aleatorización sim-to-real. El autor advierte explícitamente de que no debe cargarse en un robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (perceptrón multicapa) 61 → 512 → 256 → 128 → 14, activación ELU |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (exportación ONNX en precisión original) |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | no disponible (el repo base no declara licencia propia) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política es una red feedforward de cuatro capas con activación ELU que mapea una observación de 61 dimensiones a 14 acciones, ejecutada a 50 Hz. Mantiene la arquitectura exacta de la referencia de Pollen Robotics y su normalizador de entrada congelado; el fine-tune solo modifica los pesos del actor. La observación cruda se consume directamente porque el normalizador está embebido en el grafo ONNX.

El entrenamiento consistió en una cadena de fases PPO ejecutadas en CPU dentro del simulador de la Arena: 375 iteraciones sobre sprint-2m (run r1), 3.075 iteraciones sobre hill-climb-1m5 (runs h1, h2 y h4 encadenados por checkpoints), 350 iteraciones sobre sprint-2m (run s2), 2.250 iteraciones sobre hill-climb-1m5 (run h5) y 2.625 iteraciones finales sobre sprint-2m (run s4). Se usaron entre 96 y 192 copias paralelas del circuito, 64 pasos de control por iteración y la perturbación de arranque propia de la Arena. La recompensa combina progreso hacia delante mientras corre el cronómetro, penalizaciones pequeñas por velocidad lateral, tasa de giro, deriva hacia las paredes y caída; en las fases finales el episodio termina al cruzar la línea con un bonus único equivalente a correr a 1,5 m/s por cada paso restante hasta el horizonte de 2,5 s. El checkpoint seleccionado fue `it02625` del run s4.

## Capacidades

- Locomoción bípeda/cuadrúpeda simulada: marcha rápida y estable sobre terreno llano y en subida (circuito hill-climb-1m5).
- Sprint de 2 metros: completar el recorrido en aproximadamente 1,1 s con alta consistencia entre seeds.
- Robustez a ruido de observación: mantiene 20/20 llegadas con ruido gaussiano σ = 1e-03 y 17/20 con σ = 1e-04 (este último caso muestra mayor dispersión por la naturaleza caótica de la marcha).
- Inferencia determinista a 50 Hz con entrada `obs` [1, 61] y salida `actions` [1, 14].
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control motor.
- No responde a comandos de velocidad: el twist comandado se ignora por diseño (comando interno fijo de 0,55 m/s).

## Casos de uso

- Participación en la Microduck Arena (evento Sprint de 2 m): la política puede evaluarse directamente con `arena score --event sprint-2m`, obteniendo 1,100 s sobre los seeds oficiales 1–5 y 200/200 llegadas sobre seeds 1–200.
- Baseline para investigación en RL de bajo coste: sirve como referencia de qué rendimiento se alcanza con PPO en CPU sobre MuJoCo, sin GPU ni datos adicionales, para comparar con entrenamientos con más recursos.
- Estudio de estabilidad de marchas: el comportamiento bajo ruido de observación (σ = 1e-04 frente a σ = 1e-03) permite analizar la sensibilidad de una política de locomoción caótica a perturbaciones numéricas.
- Pruebas de robustez en subida: el circuito hill-climb-1m5 usado en el entrenamiento permite evaluar la política en pendientes además del llano.
- Currículo de entrenamiento por fases: la cadena documentada (llano → subida → llano → subida → llano) es un ejemplo reproducible de entrenamiento multi-etapa con reinicio de crítico.
- Validación de herramientas de publicación: el `manifest.json` generado con `microduck_rl` de Pollen Robotics sirve para probar el pipeline de publicación de políticas en la plataforma microduck.
- Docencia y demostraciones de RL aplicado a robótica: el modelo es pequeño, se ejecuta en CPU y se integra en el simulador de la Arena, lo que facilita demostraciones sin hardware especializado.

## Benchmarks y rendimiento

| Evaluación (runner de la Arena) | Puntuación (no llegada = 50 s) | Media de llegadas | Llegadas |
|---|---|---|---|
| Seeds 1–5 (conjunto oficial) | 1,100 s | 1,100 s (peor 1,12) | 5/5 |
| Seeds 1–200 | 1,093 s | 1,093 s (p90 1,12, peor 1,18) | 200/200, 0 caídas |
| Seeds 1–5 con ruido σ = 1e-04, 4 ejecuciones por seed | 1,104–10,880 s (rango) | — | 17/20 |
| Seeds 1–5 con ruido σ = 1e-03, 4 ejecuciones por seed | 1,088–1,104 s (rango) | — | 20/20 |

El barrido de `arena score --event sprint-2m` sobre 21 velocidades comandadas (0,20–1,20 m/s) devuelve 1,12 s en todas ellas, lo que confirma que la política ignora el comando. Los tiempos locales pueden diferir en centésimas según la máquina de la Arena.

## Requisitos de hardware

- VRAM estimada: no disponible; la red es minúscula (61 → 512 → 256 → 128 → 14) y cabe holgadamente en cualquier GPU consumer, e incluso se ejecuta en CPU.
- GPU recomendadas: no se requiere GPU; el entrenamiento se realizó íntegramente en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) aceleraría la inferencia pero no es necesaria.
- Cabe en GPU consumer: sí, en cualquier modelo; también en CPU.
- Opciones de despliegue: ONNX Runtime (formato nativo `policy.onnx`), el runner de la Microduck Arena y la librería `microduck`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: inferencia a 50 Hz según la model card; no se publican cifras de latencia por paso ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| jrubiosainz/microduck-game-sprinter-ppo | Política RL (PPO), ONNX | no disponible | no aplica | 1,100 s en seeds 1–5; 200/200 llegadas en seeds 1–200 | no disponible |
| pollen-robotics/microduck-sprint-2m-reference | Política RL de referencia, ONNX | no disponible | no aplica | no disponible en la información proporcionada | no disponible (sin licencia declarada) |

No se dispone de datos de otros participantes de la Microduck Arena en la información proporcionada, por lo que no es posible ampliar la comparativa con más alternativas.

## Limitaciones y advertencias

- Solo simulación: no incorpora aleatorización sim-to-real y el autor prohíbe explícitamente cargarla en un robot Microduck físico.
- Ignora el comando de velocidad: el twist comandado se sobrescribe con un comando interno fijo de 0,55 m/s; no se puede modular la velocidad ni detener la marcha.
- Alta sensibilidad numérica: con ruido de observación σ = 1e-04 se producen 3 no llegadas de 20 ejecuciones y tiempos de hasta 10,880 s, lo que indica que diferencias de redondeo entre máquinas pueden amplificarse por la naturaleza caótica de la marcha.
- Licencia no disponible: el repo base no declara licencia propia y este fine-tune tampoco; el uso comercial queda en incertidumbre legal.
- Sesgos conocidos: no se documentan sesgos de datos en la información disponible; al ser una política de control, los sesgos relevantes serían de comportamiento (por ejemplo, la preferencia por correr recto sin responder a comandos).
- Riesgo de alucinación: no aplica a un modelo de lenguaje; el riesgo equivalente es una generalización deficiente fuera del circuito y las condiciones de entrenamiento.
- Restricciones de contexto o idioma: no aplica; la política está limitada al circuito sprint-2m y hill-climb-1m5 de la Arena.
- Caveat de producción: los tiempos publicados son indicativos y pueden variar en centésimas según la máquina; el checkpoint `it02625` fue seleccionado tras una verificación limitada (seeds oficiales 1–5 y 20 seeds reservados 1001–1020).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-sprinter-ppo
- Modelo base: https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics
