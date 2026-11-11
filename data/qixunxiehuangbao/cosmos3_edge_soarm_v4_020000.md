# qixunxiehuangbao/cosmos3_edge_soarm_v4_020000

## Resumen

Cosmos3 Edge SO-ARM v4 (paso 20.000) es un adaptador LoRA de ajuste fino sobre el modelo base `nvidia/Cosmos3-Edge`, publicado por el usuario `qixunxiehuangbao` en Hugging Face. No se trata de un modelo de lenguaje generativo, sino de una política robótica entrenada con LeRobot para una tarea de manipulación concreta: coger un tubo de ensayo y depositarlo en una caja. El adaptador se distribuye junto con los módulos de acción entrenados, las estadísticas de normalización, los procesadores y el tokenizador, y requiere cargar el modelo base original para funcionar.

El repositorio tiene un tamaño de 0,1 GB, lo que confirma que contiene únicamente los pesos del adaptador y artefactos asociados, no una copia completa de los pesos del modelo base. El entrenamiento se realizó sobre 100 demostraciones que suman 39.280 fotogramas a 30 FPS, capturados con dos cámaras (frontal y de muñeca) a 848x480 píxeles, procesados a 256x256 por vista.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación muy específico, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados. Resulta útil como ejemplo de flujo de trabajo de ajuste fino con PEFT/LoRA sobre un modelo fundacional de robótica, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `nvidia/Cosmos3-Edge`; política LeRobot `cosmos3_edge` en modo WAM |
| Parametros totales | no disponible (el adaptador ocupa 0,1 GB en el repositorio; el modelo base no se incluye) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la inferencia por defecto usa bfloat16 |
| Idiomas soportados | no disponible (modelo orientado a robótica; la tarea se especifica en inglés: "Grab the test tube into the box") |
| Licencia | no disponible (sujeta a los términos aplicables de `nvidia/Cosmos3-Edge`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, artefactos LeRobot) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `nvidia/Cosmos3-Edge`, un modelo fundacional de robótica de NVIDIA. La política se ejecuta a través de LeRobot con el identificador `cosmos3_edge` en modo WAM y requiere carga compatible con PEFT: cargar solo el modelo base no incorpora el adaptador ajustado. El checkpoint corresponde al paso de entrenamiento 20.000.

Los datos de entrenamiento consisten en 100 demostraciones de la tarea "Grab the test tube into the box", con 39.280 fotogramas a 30 FPS. Las observaciones provienen de dos cámaras (`observation.images.front` y `observation.images.wrist`) en RGB a 848x480, redimensionadas a 256x256 por vista. El espacio de estados y acciones sigue el orden shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper, con ángulos articulares en grados y rango del gripper de 0 a 100. La política genera chunks de 16 acciones a 30 Hz. No se documenta en la información disponible el volumen de tokens, la composición del dataset más allá de las demostraciones citadas, ni si hubo RLHF o DPO.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones articulares de 6 grados de libertad (5 articulaciones más gripper) para la tarea de coger un tubo de ensayo y colocarlo en una caja.
- Política visomotora: consume dos vistas de cámara (frontal y de muñeca) junto con el estado del robot para producir acciones.
- Generación de chunks de acción: emite 16 pasos de acción por inferencia a 30 Hz, lo que reduce la frecuencia de reevaluación de la política.
- Integración con LeRobot: se carga mediante la fábrica de políticas compatible con PEFT o mediante un servidor de políticas remoto.
- Ajuste fino parametrizado eficiente: al ser un adaptador LoRA, permite reutilizar el modelo base sin duplicar pesos completos.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Automatización de una celda de laboratorio: el adaptador puede ejecutar la secuencia de recogida y depósito de tubos de ensayo en un banco de pruebas con un robot SO-ARM, siempre que se replique la calibración y la disposición de cámaras del dataset original.
- Reproducción de experimentos de investigación en robótica: sirve como referencia para estudiar el ajuste fino LoRA sobre modelos fundacionales de robótica y comparar configuraciones de inferencia (por ejemplo, 10 frente a 30 pasos de denoising).
- Base para ajuste fino adicional: al ser un adaptador PEFT, puede reutilizarse como punto de partida para entrenar variantes de la misma tarea con nuevos objetos o posiciones, reduciendo el coste frente a entrenar desde el modelo base.
- Evaluación de pipelines LeRobot: útil para validar la carga de políticas con PEFT, la integración de procesadores y tokenizadores, y el servidor de políticas remoto en un entorno controlado.
- Docencia y demostraciones de manipulación: permite ilustrar el ciclo completo de captura de demostraciones, normalización de estados y acciones, y despliegue de una política visomotora.
- Pruebas de robustez ante cambios de calibración: al depender de la calibración del robot usada en la recogida de datos, sirve para medir la sensibilidad de la política a desviaciones en la cinemática o en la posición de las cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las tasas de éxito en robot real no se han medido de forma sistemática y que el throughput en tiempo real depende del hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador ocupa 0,1 GB, pero requiere cargar el modelo base `nvidia/Cosmos3-Edge`, cuyos requisitos de memoria no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot con la política `cosmos3_edge` en modo WAM y carga compatible con PEFT; también servidor de políticas remoto de LeRobot. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; dependen del hardware. La inferencia por defecto usa bfloat16 y 10 pasos de denoising, frente a los 30 pasos registrados en el checkpoint de entrenamiento original.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables de la misma categoría (políticas robóticas visomotoras ajustadas con LoRA sobre modelos fundacionales).

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `nvidia/Cosmos3-Edge` y aceptar sus términos de uso; cargar solo el modelo base no incorpora el adaptador.
- Licencia no declarada en el repositorio: la disponibilidad para uso comercial queda sujeta a los términos aplicables del modelo base, que deben verificarse por separado.
- Tarea extremadamente específica: entrenado solo para "Grab the test tube into the box"; no se espera generalización a otros objetos, posiciones o tareas sin nuevo ajuste fino.
- Dependencia de calibración: las acciones se expresan en grados articulares y el gripper en rango 0-100; es imprescindible usar la calibración correspondiente a la recogida de datos.
- Sin medición sistemática de éxito en robot real: la model card advierte de que las tasas de éxito no se han evaluado formalmente.
- Discrepancia en la configuración de inferencia: el checkpoint de entrenamiento registra 30 pasos de denoising, mientras que la exportación usa 10; los pesos no cambian, pero el comportamiento puede diferir del entrenado.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos; en políticas visomotoras, el equivalente práctico es la ejecución de acciones erróneas ante distribuciones de entrada fuera de las observadas.
- Idiomas: no aplica ni se documenta; la única referencia textual es la instrucción de tarea en inglés.
- Madurez: cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/qixunxiehuangbao/cosmos3_edge_soarm_v4_020000
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- LeRobot (librería): https://github.com/huggingface/lerobot
- PEFT (librería): https://github.com/huggingface/peft
