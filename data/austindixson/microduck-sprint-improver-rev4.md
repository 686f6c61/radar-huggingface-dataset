# austindixson/microduck-sprint-improver-rev4

## Resumen

microduck-sprint-improver-rev4 es una política de control neuronal para robótica bípeda simulada, publicada por el usuario austindixson en HuggingFace. No es un modelo de lenguaje: es un artefacto de reinforcement learning exportado a ONNX que compite en la prueba de 2 m Sprint de la Microduck Arena, el entorno de simulación asociado al robot bípedo Microduck de Pollen Robotics. El modelo recibe una observación de 61 valores y emite 14 acciones de control por paso.

Se trata de un fine-tune de austindixson/microduck-sprint-improver-rev2 (revisión 2eafef86d), que a su vez remezcla la política game-sprinter-remix4 de jrubiosainz. La intervención declarada por el autor consiste en una búsqueda de parámetros físicos ("physics-knob search") más un delta de CMA en bucle cerrado incorporado en la tabla de ramas de la semilla 1; el resto de semillas quedan bit a bit idénticas. La red permanece congelada y no se modifican fuerza, engranaje ni masa.

Su relevancia es acotada pero concreta: documenta un tiempo medio de 0,840 s en las semillas oficiales de la Arena, medido con la propia herramienta `arena score` sobre Linux x86-64, y sirve como referencia reproducible para estudiar métodos de ajuste de bajo nivel sobre políticas de locomoción ya entrenadas. El autor advierte explícitamente de que el modelo es solo para simulación y no debe cargarse en un MicroDuck físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; política neuronal exportada a ONNX con entrada `obs` [1, 61] y salida `actions` [1, 14] |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; observación de 61 valores por paso de control |
| Tipos de cuantización | No disponible; se distribuye un único `policy.onnx` sin variantes cuantizadas documentadas |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | No declarada; el modelo base tampoco declara licencia |
| Formato de pesos | ONNX (`policy.onnx`) más manifiesto `manifest.json` (schema 2) |
| Tarea | Robótica: 2 m Sprint en Microduck Arena (solo simulación) |
| Modelo base | austindixson/microduck-sprint-improver-rev2 (revisión `2eafef86d`), fine-tune |
| Librería | `microduck` |
| Entrada / salida | `obs` [1, 61] → `actions` [1, 14] |
| SHA-256 de `policy.onnx` | `eb10be84c3a8fd4afe4095e28f72297932c5a6724a5af0fd90a0ad0e09115f30` |
| Tamaño del repositorio | 0,0 GB (redondeo de HuggingFace; artefacto de muy pocos megabytes) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación | 2026-10-25 |

## Arquitectura y entrenamiento

La model card no describe la topología interna de la red. Lo único verificable es la interfaz del grafo ONNX: un vector de observación de 61 dimensiones y un vector de acción de 14 dimensiones, coherente con una política de control por paso para el bípedo Microduck (el robot físico declara 15 motores, según la documentación del proyecto). El entrenamiento original procede de la cadena de remezclas de la Arena: la política base y el método de residual sobre contador de pasos son de jrubiosainz, mientras que las tablas de ramas por semilla provienen de los remixes de DenRakEiw y dashi, sobre el entrenamiento base de Pollen Robotics.

La aportación específica de esta revisión es de ajuste, no de reentrenamiento. El autor aplica una búsqueda sobre parámetros físicos del simulador y un delta de CMA (Cross-Entropy Method adaptativo, según la notación del autor) en bucle cerrado, que se incorpora a la tabla de ramas de la semilla 1; el resto de semillas permanecen bit a bit idénticas al base. La red neuronal está congelada y los parámetros de fuerza, engranaje y masa no se tocan. No se documentan número de tokens, composición de dataset, ni uso de RLHF o DPO, que por otra parte no aplican a este tipo de política.

## Capacidades

- Locomoción bípeda simulada: genera 14 comandos de control por paso a partir de 61 observaciones, optimizados para la prueba de 2 m Sprint de Microduck Arena.
- Ejecución de una marcha de sprint específica de la Arena, con tiempos declarados de 0,840 s de media en las semillas oficiales.
- Reproducibilidad determinista: el autor indica que las semillas distintas de la 1 son bit a bit idénticas al modelo base.
- Evaluación integrada en la herramienta oficial: los resultados se obtienen con `arena score` sobre Linux x86-64.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM; el "bucle cerrado" del autor se refiere al ajuste de la política, no a un agente.
- No tiene capacidades multilingües ni de generación de texto.
- No tiene modo "thinking", visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Participación en la prueba de 2 m Sprint de Microduck Arena: el artefacto está empaquetado (ONNX + `manifest.json` schema 2) para cargarse directamente en la Arena y registrarse en la clasificación con el tiempo medio de 0,840 s.
- Baseline de comparación para nuevas políticas de sprint: al ser un fine-tune de ajuste fino sobre una política conocida, permite medir cuánto se gana con búsqueda de parámetros físicos frente a reentrenamiento completo.
- Estudio de metodología de ajuste: sirve como caso práctico para analizar búsqueda de "physics-knobs" y deltas de CMA en bucle cerrado sobre una red congelada, con la ventaja de que el resto de semillas permanece idéntico y actúa como control.
- Evaluación automatizada en pipelines: el binario `arena score` permite integrar la política en un script de CI que ejecute las semillas oficiales y compare tiempos entre revisiones (rev2, rev3, rev4).
- Docencia y divulgación en robótica bípeda simulada: un artefacto de pocos megabytes que se ejecuta en CPU facilita demostraciones de locomoción con RL en MuJoCo sin infraestructura de GPU.
- Auditoría de invariancia: verificar que la intervención no altera fuerza, engranaje ni masa, y que las semillas no modificadas producen resultados idénticos, como prueba de regresión del proceso de publicación.
- Análisis del gap simulación-realidad sin ejecución física: usar la política como referencia de comportamiento en simulador para discutir qué factores limitan su transferencia, respetando la prohibición explícita de cargarla en hardware.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos con `arena score` en Linux x86-64 sobre las semillas oficiales de la Microduck Arena. Son cifras in-sample.

| Semilla | Tiempo (s) |
|---|---|
| Semilla oficial 1 | 0,84 |
| Semilla oficial 2 | 0,84 |
| Semilla oficial 3 | 0,84 |
| Semilla oficial 4 | 0,84 |
| Semilla oficial 5 | 0,84 |
| Media | 0,840 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje en la información disponible, y no serían aplicables a este modelo. Tampoco se documentan métricas de robustez fuera de las semillas oficiales, ni comparación numérica con las revisiones anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el repositorio completo redondea a 0,0 GB en HuggingFace y el grafo tiene 61 entradas y 14 salidas, por lo que la huella es de kilobytes o pocos megabytes. Cifra no publicada por el autor.
- GPU recomendadas: no se requiere GPU. La evaluación declarada se hizo en Linux x86-64 con la herramienta de la Arena, sin mención de acelerador.
- Cabe en cualquier GPU de consumo e, incluso, ejecución íntegra en CPU.
- Opciones de despliegue: el runtime natural es ONNX Runtime, o la librería `microduck` indicada en la model card; el flujo de evaluación pasa por la Microduck Arena. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. Al tratarse de un paso de control por inferencia y no de generación de tokens, las métricas habituales de throughput no son comparables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-improver-rev4 (este) | No disponible | No aplica (obs. de 61) | 0,840 s de media, 5 semillas, in-sample | No declarada | HuggingFace, ONNX |
| austindixson/microduck-sprint-improver-rev2 (base) | No disponible | No aplica | No disponible en la información consultada | No declarada | HuggingFace |
| austindixson/microduck-sprint-improver-rev3 | No disponible | No aplica | No disponible en la información consultada | No declarada | HuggingFace |
| jrubiosainz/game-sprinter-remix4 (origen de la política base) | No disponible | No aplica | No disponible en la información consultada | No disponible | HuggingFace |

La comparación cuantitativa con las revisiones previas no es posible con los datos disponibles: solo la rev4 publica tiempos en la información consultada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgo, y el concepto no aplica igual que en modelos de lenguaje.
- Riesgo de sobreajuste a las semillas de evaluación: el propio autor califica los 0,840 s como números in-sample, obtenidos en las semillas oficiales de la Arena.
- Sobreajuste al simulador: la política se entrenó y se juzgó únicamente en el simulador de la Arena. El autor prohíbe explícitamente cargarla en un MicroDuck físico.
- Generalización no demostrada: no hay métricas en semillas no oficiales ni en variaciones de parámetros físicos, pese a que el método se basa en modificarlos.
- Limitación de tarea: resuelve una única prueba de 2 m Sprint; no hay evidencia de que sirva para otras pruebas de la Arena ni para navegación general.
- Restricciones de licencia: ni el modelo base ni este repositorio declaran licencia, lo que impide asumir permisos de uso comercial o de redistribución. Cualquier uso en producción requiere aclarar la licencia con el autor.
- Ausencia de soporte y mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin documentación más allá de la model card.
- Dependencia de la cadena de remezclas: parte del comportamiento procede de políticas de terceros (jrubiosainz, DenRakEiw, dashi) cuyos términos no se detallan.
- Integridad verificable: el autor publica el SHA-256 de `policy.onnx`, por lo que conviene comprobarlo antes de ejecutar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/austindixson/microduck-sprint-improver-rev4
- Modelo base (rev2): https://huggingface.co/austindixson/microduck-sprint-improver-rev2
- Revisión previa (rev3): https://huggingface.co/austindixson/microduck-sprint-improver-rev3
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Microduck Arena (Space de evaluación): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Perfil de jrubiosainz: https://huggingface.co/jrubiosainz
- Perfil de DenRakEiw: https://huggingface.co/DenRakEiw
- Perfil de dashi: https://huggingface.co/dashi
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
- Artículo de MarkTechPost sobre Microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Artículo de CNX Software sobre Microduck: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
