# BbEeNn1314/robosyn-challenge-weights

## Resumen

RoboSyn Challenge Submission - Hybrid ACT+PP Policy es una política robótica desarrollada por el equipo YongbinChen (autor BbEeNn1314 en HuggingFace) como envío a la competición NeurIPS 2026 RoboSynChallenge. No es un modelo de lenguaje: es un sistema de control para manipulación robótica que combina dos enfoques complementarios, una red neuronal ACT (Action Chunking Transformer) para tres tareas que requieren habilidades visuomotoras aprendidas y pipelines de percepción-planificación (PP) basados en reglas para las siete tareas restantes, resolubles mediante razonamiento geométrico.

El componente aprendido se apoya en un backbone ResNet-18 con tres vistas de cámara (muñeca, frontal y lateral), entrenado con el dataset oficial de demostraciones de la competición (1000 episodios por tarea) usando el framework LeRobot 0.4.4 sobre 2× RTX 4090 de 24 GB. Los pipelines PP, en cambio, no requieren pesos entrenados: usan percepción zero-shot con Open3D y OpenCV junto con primitivas de movimiento programadas a mano y estrategias de refinamiento iterativo.

Su relevancia radica en el resultado declarado: una tasa de éxito media del 92,7 % en 10 tareas de manipulación, con el mejor registro en click_bell (99,3 %) y el peor en item_assembly (81,2 %). El repositorio (1,7 GB) contiene únicamente los checkpoints de los tres modelos ACT; las configuraciones de las tareas PP se distribuyen aparte en el repositorio de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: ACT (Action Chunking Transformer) con backbone ResNet-18 para 3 tareas + pipelines Perception-Planning basados en reglas (Open3D + OpenCV) para 7 tareas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de robótica, no modelo de lenguaje); no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, según la etiqueta de la model card; sin relevancia funcional para la política) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 checkpoints ACT en carpetas `click_bell/pretrained_model/`, `item_assembly/pretrained_model/` y `table_rearrangement/pretrained_model/`) |
| Tamano del repositorio | 1,7 GB |
| Framework de entrenamiento | LeRobot 0.4.4 |
| Entradas | 3 vistas de cámara: muñeca (wrist), frontal (front) y lateral (side) |
| Dataset | RoboSynChallenge/official-dataset (1000 episodios por tarea) |

## Arquitectura y entrenamiento

El sistema es una política híbrida que reparte las 10 tareas de manipulación entre dos paradigmas. Para `table_rearrangement`, `click_bell` e `item_assembly` se emplea ACT (Action Chunking Transformer), una red neuronal que predice secuencias de acciones (chunks) a partir de observaciones visuales. El backbone es una ResNet-18 que procesa tres vistas de cámara simultáneas (muñeca, frontal y lateral), lo que aporta información espacial redundante y mitiga oclusiones parciales durante la manipulación.

El entrenamiento de los modelos ACT se realizó con el dataset oficial de demostraciones de la competición (1000 episodios por tarea) sobre LeRobot 0.4.4, con entre 40 000 y 80 000 pasos, batch size de 32 y 2× RTX 4090 de 24 GB. No se indica en la información disponible si hubo fases de RLHF, DPO ni ningún otro ajuste posterior al entrenamiento por imitación.

Las siete tareas restantes (`sample_loading`, `items_handover`, `manipulate_pipette`, `drawer_open_place`, `handle_basket`, `water_pouring` y `mixer_operating`) se resuelven sin red neuronal: se usan pipelines de percepción zero-shot con Open3D y OpenCV, primitivas de movimiento programadas manualmente y estrategias de refinamiento iterativo. Esta separación implica que la mitad "PP" del sistema no tiene pesos asociados en el repositorio, solo configuración en el repositorio de código.

## Capacidades

- Manipulación robótica multimodal: la política ACT genera secuencias de acciones a partir de tres flujos visuales concurrentes (muñeca, frontal, lateral).
- Ejecución de tareas de reordenación de objetos (`table_rearrangement`, 95,7 % de éxito declarado).
- Pulsación precisa de un timbre (`click_bell`, 99,3 %), la tarea con mejor rendimiento del envío.
- Ensamblaje de piezas (`item_assembly`, 81,2 %), la tarea más exigente y con peor resultado.
- Carga de muestras (`sample_loading`) mediante percepción geométrica zero-shot.
- Entrega de objetos entre agentes o posiciones (`items_handover`).
- Manipulación de pipetas de laboratorio (`manipulate_pipette`).
- Apertura de cajones y colocación de objetos (`drawer_open_place`).
- Manejo de cestas (`handle_basket`).
- Vertido de agua (`water_pouring`) y operación de mezcladores (`mixer_operating`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito; son capacidades propias de modelos de lenguaje y no aplican a esta política.

## Casos de uso

- Automatización de líneas de ensamblaje: el modelo ACT de `item_assembly` puede integrarse en una celda robotizada que recoja y una piezas con tolerancias moderadas, aceptando la tasa de éxito del 81,2 % como objetivo de fiabilidad para un proceso con verificación posterior.
- Manipulación en laboratorio químico o biológico: los pipelines de `manipulate_pipette` y `water_pouring` permiten automatizar dosificación y vertido de líquidos con percepción geométrica zero-shot, sin necesidad de reentrenar pesos por cada nuevo recipiente si la configuración se ajusta en el repositorio de código.
- Logística interna y clasificación de objetos: `table_rearrangement` (95,7 %) es adecuado para organizar elementos sobre una superficie de trabajo a partir de demostraciones, con 302 pasos medios por episodio.
- Interacción humano-robot en entornos compartidos: `items_handover` (87,0 %) se puede desplegar en estaciones donde una persona entrega objetos a un brazo robótico, con 303 pasos medios por episodio.
- Tareas de accionamiento de mecanismos: `drawer_open_place` (95,7 %, 245 pasos) y `handle_basket` (96,4 %, 198 pasos) sirven para abrir y cerrar cajones o mover cestas en almacenes y cocinas industriales.
- Operación de equipamiento de cocina o planta piloto: `mixer_operating` (96,4 %, 215 pasos) y `water_pouring` (96,4 %, 220 pasos) permiten secuencias repetitivas de preparación con alta fiabilidad declarada.
- Investigación en aprendizaje por imitación: el repositorio sirve como punto de partida para reproducir el entrenamiento ACT con LeRobot 0.4.4 sobre 1000 episodios por tarea y comparar curvas de éxito entre 40 000 y 80 000 pasos.
- Señalización o accionamiento de mandos: `click_bell` (99,3 %, 180 pasos) es la tarea más fiable del conjunto y puede usarse como prueba de concepto para pulsar botones o interruptores en paneles.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (46 episodios por tarea):

| Tarea | Metodo | Tasa de exito | Pasos medios |
|---|---|:---:|---:|
| table_rearrangement | ACT | 95,7 % | 302 |
| click_bell | ACT | 99,3 % | 180 |
| item_assembly | ACT | 81,2 % | 410 |
| sample_loading | PP | 88,4 % | 285 |
| items_handover | PP | 87,0 % | 303 |
| manipulate_pipette | PP | 90,6 % | 349 |
| drawer_open_place | PP | 95,7 % | 245 |
| handle_basket | PP | 96,4 % | 198 |
| water_pouring | PP | 96,4 % | 220 |
| mixer_operating | PP | 96,4 % | 215 |
| **Media** | | **92,7 %** | **271** |

No se han publicado en la información disponible métricas adicionales (tipo de benchmark estandarizado, curvas de aprendizaje, ablaciones del backbone, comparación con baselines de la competición ni intervalos de confianza de las tasas de éxito).

## Requisitos de hardware

- Entrenamiento de los modelos ACT: 2× RTX 4090 de 24 GB, batch size 32, entre 40 000 y 80 000 pasos por tarea, según la model card.
- VRAM de inferencia: no disponible de forma explícita. Como referencia indirecta, el repositorio completo (los 3 checkpoints ACT con backbone ResNet-18) ocupa 1,7 GB, por lo que cada checkpoint individual es de tamaño reducido y la inferencia debería caber sin problema en GPUs de consumo.
- GPU recomendadas: no disponibles para inferencia; las RTX 4090 documentadas corresponden al entrenamiento.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio y el backbone ResNet-18; no se especifica un modelo concreto recomendado.
- Opciones de despliegue: el marco de referencia es LeRobot 0.4.4 (instalación con `uv sync` y evaluación con `bash scripts/eval_all_tasks.sh`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Los pipelines PP no requieren GPU para los pesos (no hay pesos), pero sí dependen de Open3D y OpenCV para la percepción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de manipulación (por ejemplo, ACT original, Diffusion Policy u otros envíos de la competición RoboSynChallenge), ni datos verificables de sus parámetros, contexto, licencia o rendimiento en las mismas tareas. La model card solo reporta los resultados del propio envío frente a las 10 tareas del desafío.

## Limitaciones y advertencias

- Cobertura parcial con pesos: solo 3 de las 10 tareas tienen checkpoints entrenados en este repositorio; las otras 7 dependen de pipelines basados en reglas cuyo código y configuración están fuera de HuggingFace.
- La tarea `item_assembly` alcanza solo un 81,2 % de éxito con 410 pasos medios, el peor registro del conjunto y un candidato claro a generar fallos en producción.
- Las métricas son declaradas por el autor y corresponden a 46 episodios por tarea; no se aportan intervalos de confianza, semillas ni protocolo de evaluación independiente en la información disponible.
- Las tasas medias ocultan variabilidad: la diferencia entre la mejor tarea (99,3 %) y la peor (81,2 %) es de 18,1 puntos porcentuales.
- El sistema está etiquetado únicamente en inglés (`en`), lo que puede limitar documentación, soporte y adaptación a otros contextos.
- Riesgo de sobreajuste a los escenarios del dataset oficial (1000 episodios por tarea) y a las condiciones de iluminación, cámaras y robots concretos usados en la competición; no se documenta robustez ante cambios de dominio.
- Las tareas PP, al ser geométricas y con primitivas hechas a mano, pueden degradarse ante objetos, texturas o configuraciones no previstas en la fase de diseño.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar los avisos de copyright y licencia, e incluir el texto de la licencia; no se ofrece garantía alguna.
- No hay información sobre sesgos, tasa de alucinación (concepto no aplicable a una política robótica) ni sobre comportamiento en producción fuera del entorno de evaluación.
- No se documenta versionado, hardware objetivo de despliegue ni procedimientos de seguridad, aspectos críticos antes de llevar una política de manipulación a un entorno real.

## Enlaces

- HuggingFace: https://huggingface.co/BbEeNn1314/robosyn-challenge-weights
- Repositorio de código: https://github.com/YongbinChen/RoboSynChallenge-Submission
- Dataset oficial: RoboSynChallenge/official-dataset (referenciado en la model card)
- Competición: NeurIPS 2026 RoboSynChallenge (sin URL directa en la información disponible)
- Framework: LeRobot 0.4.4 (sin URL directa en la información disponible)
- No se han encontrado otros enlaces relevantes en la búsqueda web; los resultados devueltos no guardan relación con el modelo.
