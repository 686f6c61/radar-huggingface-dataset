# austindixson/microduck-roller-improver-rev6

## Resumen

`austindixson/microduck-roller-improver-rev6` es una política de control (policy) para el robot bípedo MicroDuck, publicada como un modelo de robótica en formato ONNX y pensada exclusivamente para la competición **2 m Roller Sprint** de la MicroDuck Arena. No es un modelo de lenguaje: no procesa ni genera texto, sino que mapea una observación de 61 valores (`obs` [1, 61]) a 14 acciones de control (`actions` [1, 14]) en cada paso de simulación. Lo desarrolla el usuario austindixson como un *finetune* de su propio `microduck-roller-remix-r900-improver` (revisión `94238905c`), que a su vez deriva del `roller-remix-r900` de dashi.

La aportación concreta de esta revisión es un delta de CMA (optimización tipo CMA-ES) calculado en bucle cerrado e incorporado a la tabla de ramas (*branch table*) de la semilla 1; el resto de semillas permanecen bit a bit idénticas. La red está congelada: no se han modificado la fuerza, el engranaje ni la masa del robot. El autor reporta tiempos de carrera de 0,90 s en cada una de las cinco semillas oficiales, con una media de 0,900 s, medidos con el comando `arena score` de la propia Arena sobre Linux x86-64 y declarados explícitamente como **in-sample**.

Su relevancia es acotada y muy específica: sirve como referencia de rendimiento dentro de un *leaderboard* de simulación, como punto de partida para *finetunes* posteriores y como ejemplo de metodología de ajuste fino de políticas de locomoción con presupuesto mínimo. El propio autor advierte de que no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control de locomoción, exportada a ONNX; topología interna (capas, activaciones) no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una observación de 61 valores por paso de simulación |
| Tipos de cuantizacion | no disponible; se distribuye un único `policy.onnx` sin cuantización declarada |
| Idiomas soportados | no aplica (modelo de control robótico sin entrada ni salida de texto) |
| Licencia | no disponible (el autor declara que ni el modelo base ni este repositorio declaran licencia) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |
| Entrada | `obs` con forma [1, 61], tipo no especificado |
| Salida | `actions` con forma [1, 14] |
| Hash del artefacto | sha256 `cfd330e6def5f8244b842c4b8ad8ba59ef6bbd0a4bb9129b451d7c5afa8ed1df` |
| Modelo base | `austindixson/microduck-roller-remix-r900-improver` (revisión `94238905c`), relación *finetune* |
| Tamano del repositorio | 0.0 GB reportados por la plataforma (por debajo de su precisión de medida) |
| Libreria / runtime | `microduck`; pipeline declarado `robotics` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de activación ni función de pérdida). Lo que sí se documenta es el procedimiento de ajuste: se parte de una política ya entrenada para el Sprint de 2 m y se calcula un delta mediante CMA (evolución de estrategias con matriz de covarianza) en bucle cerrado, es decir, evaluando la política completa contra el simulador en cada iteración en lugar de optimizar un objetivo *offline*. Ese delta se "hornea" únicamente en la rama correspondiente a la semilla 1 de la tabla de ramas por semilla, dejando las demás ramas sin cambios a nivel de bit.

El modelo hereda la estructura de remezclas anteriores de la comunidad: la base inmediata es `microduck-roller-remix-r900-improver` de austindixson, que a su vez remezcla el `roller-remix-r900` de dashi, con créditos a jrubiosainz por la política base y el método de residuo con contador de pasos, y a DenRakEiw y dashi por las tablas de ramas por semilla. No se especifican en la model card el número de tokens, la composición del dataset ni si hubo RLHF o DPO, conceptos que además no aplican a este tipo de política. Tampoco se documenta la semilla, el número de evaluaciones ni la función de recompensa empleada en el CMA.

## Capacidades

- Control de locomoción en simulación para la prueba 2 m Roller Sprint: genera 14 acciones por paso a partir de 61 observaciones.
- Ejecución determinista de una política congelada, apta para reproducir resultados bit a bit en las semillas no modificadas.
- Ajuste específico sobre la semilla 1 mediante un delta de CMA, sin alterar parámetros físicos del robot simulado.
- Integración con el ecosistema de la MicroDuck Arena: el manifiesto `manifest.json` (schema 2) permite cargarla y puntuarla con `arena score`.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; no es un modelo generativo de texto.
- No está pensada para transferencia sim-to-real: el autor lo prohíbe explícitamente.

## Casos de uso

- **Referencia de leaderboard en la MicroDuck Arena**: cargar la política con el manifiesto y ejecutar `arena score` sobre las cinco semillas oficiales para obtener una línea base de 0,900 s de media frente a la que comparar envíos posteriores.
- **Punto de partida para finetunes con CMA**: el delta de la semilla 1 sirve como inicialización para nuevas rondas de optimización evolutiva, ya que el autor documenta el método (delta en bucle cerrado sobre tabla de ramas) y el hash exacto del artefacto de partida.
- **Regresión automatizada en CI**: al ser un ONNX de tamaño despreciable y entrada/salida fija ([1, 61] → [1, 14]), puede incluirse en un *pipeline* que verifique que el binario produce las mismas acciones y que el manifiesto sigue siendo válido tras cambios en el simulador.
- **Investigación sobre optimización evolutiva de políticas de locomoción**: permite estudiar cuánto margen aporta el CMA en bucle cerrado frente al entrenamiento base, con la ventaja de que las semillas 2 a 5 permanecen idénticas y actúan como control experimental.
- **Docencia y divulgación en robótica simulada**: ejemplo mínimo y reproducible de política de control para un bípedo de bajo coste, ejecutable sin GPU y con un contrato de entrada/salida explícito.
- **Auditoría de sobreajuste a semillas**: comparar el rendimiento en las semillas oficiales (in-sample) con semillas nuevas generadas localmente permite cuantificar la generalización del ajuste, un análisis que el autor no reporta.
- **Base para variantes de la comunidad**: al declararse *remix* de una cadena de remezclas, puede servir como nodo intermedio para que otros autores apliquen deltas por semilla y comparen resultados sobre el mismo manifiesto.

## Benchmarks y rendimiento

| Semilla oficial | Tiempo de carrera (s) |
|---|---|
| Semilla 1 | 0,90 |
| Semilla 2 | 0,90 |
| Semilla 3 | 0,90 |
| Semilla 4 | 0,90 |
| Semilla 5 | 0,90 |
| Media | 0,900 |

Medición realizada por el autor con el comando `arena score` de la MicroDuck Arena sobre Linux x86-64. El autor califica estos resultados como **in-sample**: las semillas evaluadas coinciden con las usadas en el ajuste, por lo que no constituyen una estimación de generalización.

No se han publicado resultados de benchmarks en la informacion disponible para métricas estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.), que además no aplican a este tipo de artefacto. Tampoco hay datos de rendimiento del modelo base ni de `roller-improver-rev3` en la información proporcionada, por lo que no es posible una comparación numérica directa.

## Requisitos de hardware

- **VRAM estimada**: prácticamente nula. La entrada es un tensor de 61 valores y la salida de 14; el repositorio completo se reporta como 0.0 GB, por debajo de la precisión de medida de la plataforma.
- **GPU recomendadas**: ninguna. La inferencia es viable en CPU; no se documenta ningún requisito de acelerador.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo podría ejecutar un grafo ONNX de este tamaño, pero no aporta ventaja frente a CPU para un único entorno.
- **Opciones de despliegue**: ONNX Runtime (CPU o CUDA), la librería `microduck` indicada por el autor y el *harness* de la MicroDuck Arena para puntuar con `arena score`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- **Latencia y throughput**: no disponibles. No se publican mediciones de latencia por paso ni de pasos por segundo; solo tiempos de carrera agregados.
- **Requisito de plataforma**: las mediciones del autor se hicieron en Linux x86-64; no se declara compatibilidad verificada con otras plataformas.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `austindixson/microduck-roller-improver-rev6` (este) | Finetune de la base con delta CMA en semilla 1 | no disponible | no aplica | 0,900 s de media en 5 semillas (in-sample) | no disponible | Hugging Face, ONNX, 0 descargas |
| `austindixson/microduck-roller-remix-r900-improver` | Modelo base inmediato | no disponible | no aplica | no disponible en la informacion proporcionada | no disponible (el autor indica que no declara licencia) | Hugging Face |
| `austindixson/microduck-roller-improver-rev3` | Revisión anterior de la misma línea | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| `dashi/roller-remix-r900` | Origen de la cadena de remezclas | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos de parámetros, contexto ni licencia de las alternativas en la información consultada, por lo que la comparación queda limitada a la relación de linaje y a la disponibilidad de los artefactos.

## Limitaciones y advertencias

- **Solo simulación**: el autor prohíbe explícitamente cargar el modelo en un MicroDuck físico. No hay validación sim-to-real ni indicios de que la política sea transferible.
- **Resultados in-sample**: los 0,90 s se obtuvieron en las mismas semillas usadas para el ajuste; no hay evaluación en semillas no vistas, por lo que el rendimiento fuera de muestra es desconocido.
- **Sobreajuste a la tabla de ramas**: al modificar solo la rama de la semilla 1, el comportamiento en el resto de semillas depende por completo de la política base, cuyo rendimiento no se documenta aquí.
- **Ausencia de licencia**: ni el modelo base ni este repositorio declaran licencia. Esto impide determinar si el uso comercial está permitido; en la práctica, debe tratarse como no apto para producción hasta que el autor lo aclare.
- **Documentación mínima**: no se especifican topología, número de parámetros, tipo de dato de entrada, significado de las 61 observaciones ni de las 14 acciones, ni el procedimiento exacto del CMA (iteraciones, recompensa, criterio de parada).
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo; el riesgo equivalente es la producción de acciones fuera de rango o inestables ante observaciones fuera de la distribución del simulador.
- **Adopción nula**: 0 descargas y 0 *likes* en el momento de la consulta, sin evidencia de validación independiente por terceros.
- **Fecha de creación anómala**: el repositorio figura creado el 2026-10-25, lo que conviene verificar antes de citarlo.
- **Repositorio de 0.0 GB**: el tamaño reportado sugiere que la plataforma no mide el contenido con precisión; conviene comprobar el tamaño real de `policy.onnx` antes de planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/austindixson/microduck-roller-improver-rev6
- Modelo base: https://huggingface.co/austindixson/microduck-roller-remix-r900-improver
- Revisión anterior de la misma línea: https://huggingface.co/austindixson/microduck-roller-improver-rev3
- Otra revisión de la línea: https://huggingface.co/austindixson/microduck-roller-improver
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio del robot MicroDuck: https://github.com/pollen-robotics/microduck
- Recursos independientes del MicroDuck: https://microduckrobot.org/
- Artículo divulgativo sobre aprendizaje de la marcha en simulación: https://ailearningguides.com/nvidia-microduck-robot-ai-agents-simulation-walking/
- Perfiles de los autores acreditados: https://huggingface.co/jrubiosainz, https://huggingface.co/DenRakEiw, https://huggingface.co/dashi, https://huggingface.co/pollen-robotics
