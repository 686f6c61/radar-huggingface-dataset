# ASethi04/MolmoAct2-BimanualYAM-freshbase-rotcontract-umi75-teleop25-ee20

## Resumen

Este modelo es un checkpoint de investigación de **MolmoAct2**, la segunda generación de la familia de modelos de visión-lenguaje-acción (VLA) desarrollada por el Allen Institute for AI (Ai2). Fue publicado por el usuario ASethi04 y está orientado a la manipulación robótica bimanual, concretamente a la tarea de recoger naranjas y depositarlas en un cuenco. El modelo combina dos conjuntos de datos: un 75% de demostraciones UMI (Universal Manipulation Interface) con doble LIDAR y un 25% de teleoperación, y ha sido entrenado durante 12.000 pasos de optimización con una semilla fija.

Con 5.591.928.368 parámetros (aproximadamente 5,59 mil millones), se posiciona como un modelo de tamaño medio dentro del ecosistema VLA. Su relevancia reside en que explora técnicas de contracción de rotaciones SO(3) para mejorar la precisión de los movimientos de los brazos, una innovación que puede tener impacto en tareas de manipulación fina. Es un checkpoint de investigación, no un modelo listo para producción, y requiere un pipeline completo de control (IK, límites de articulaciones, seguridad física) antes de su uso real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 5.591.928.368 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de MolmoAct2, que es un modelo de visión-lenguaje-acción diseñado para generar acciones de control robótico a partir de observaciones visuales y textuales. No se dispone de detalles específicos sobre la arquitectura interna (número de capas, tipo de atención, etc.) en la información proporcionada. Se sabe que utiliza una representación de acciones de 6 grados de libertad por brazo (xyz + las dos primeras filas de la matriz de rotación) junto con un valor de pinza normalizado absoluto para el futuro.

El entrenamiento se realizó con una mezcla de dos conjuntos de datos: UMI (75%) y teleoperación (25%). Se aplicó una transformación inversa de la pose actual para cada paso futuro `k` (1..24), y se introdujo una contracción de rotación SO(3) como parte del objetivo aprendido. El orden de las acciones es primero el brazo izquierdo y luego el derecho. No se menciona el uso de RLHF ni DPO; el entrenamiento parece ser supervisado directamente sobre las demostraciones.

## Capacidades

- **Control robótico bimanual**: el modelo predice acciones de 6D para dos brazos simultáneamente, incluyendo posición, orientación (representada como R6D) y apertura/cierre de pinza.
- **Ejecución de secuencias de acciones**: genera un horizonte de 24 pasos futuros (H24), lo que permite planificar movimientos completos sin necesidad de replanificación cada paso.
- **Aprendizaje de tareas específicas**: está entrenado para la tarea de recoger naranjas y colocarlas en un cuenco, demostrando capacidad de manipulación de objetos pequeños.
- **Integración con sistemas de IK**: las predicciones de rotación se ejecutan directamente a través del pipeline de cinemática inversa del despliegue, sin necesidad de descontracción adicional.
- **Multimodalidad**: al ser un VLA, procesa entradas visuales (a través de cámaras LIDAR y teleop) y lenguaje natural para condicionar la acción.
- **Robustez en teleoperación**: la mezcla de datos UMI y teleop permite aprender de demostraciones tanto autónomas como humanas, mejorando la generalización.

## Casos de uso

- **Recogida y colocación de objetos en entornos domésticos**: el modelo puede controlar un robot bimanual para recoger frutas u otros objetos de una superficie y colocarlos en un contenedor, tarea típica en aplicaciones de asistencia doméstica.
- **Teleoperación asistida**: sirve como base para sistemas de control semiautónomos donde un operador humano guía al robot con demostraciones y el modelo completa la ejecución.
- **Investigación en manipulación bimanual**: es un punto de partida para estudiar técnicas de control de rotación y contracción en tareas que requieren coordinación de dos brazos.
- **Desarrollo de políticas de control generalizables**: al estar entrenado con UMI (que permite capturar datos en múltiples configuraciones), puede servir para evaluar la transferencia de habilidades entre entornos.
- **Benchmarking de VLA**: se puede utilizar como referencia en experimentos que comparen la eficacia de distintos modelos de visión-lenguaje-acción en tareas de manipulación fina.
- **Sistemas de demostración en robótica educativa**: aunque no es para producción, puede usarse en laboratorios para ilustrar el entrenamiento y despliegue de políticas de control bimanual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como éxito en tareas, tiempo de ejecución o comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: con 5,59 B de parámetros, se puede estimar que la inferencia en FP16 requiere aproximadamente 11 GB de VRAM, pero no se confirma oficialmente. En cuantización FP8 o INT8 podría reducirse a unos 6-8 GB.
- **GPUs recomendadas**: no se especifica en la información. Por el tamaño, sería adecuado una GPU con al menos 12 GB de VRAM (p. ej., RTX 3080/3090, A100) para FP16.
- **Compatibilidad con GPUs de consumo**: probablemente sí en RTX 4090 o similar con cuantización, pero no hay confirmación.
- **Opciones de despliegue**: no se menciona. Dado que usa la librería lerobot, es probable que se pueda ejecutar con los scripts de esa librería, pero no se detalla soporte para vLLM, llama.cpp u otros.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos VLA como MolmoAct (versión anterior), OpenVLA, RT-2 o Pi0. No se han encontrado datos públicos que permitan una comparación objetiva de parámetros, rendimiento o licencia.

## Limitaciones y advertencias

- **Checkpoint de investigación**: no es un modelo listo para producción; requiere validación exhaustiva en el sistema de despliegue real.
- **Falta de licencia**: la licencia no está especificada, por lo que su uso comercial es incierto y debe consultarse con el autor.
- **Sesgos y alucinación**: al ser un modelo de acción, puede generar movimientos no seguros si no se controlan los límites de articulación y colisión; el autor recomienda implementar comprobaciones de seguridad.
- **Dependencia de la configuración**: el modelo está entrenado con una tarea específica (naranjas en cuenco) y puede no generalizar a otras tareas sin reentrenamiento.
- **Requisito de pin de revisión**: el autor recomienda fijar la revisión del repositorio de HuggingFace en lugar de usar `main` para garantizar reproducibilidad.
- **Sin soporte de idiomas**: no se indica que el modelo tenga capacidades multilingües; probablemente se limita a instrucciones en inglés (no especificado).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ASethi04/MolmoAct2-BimanualYAM-freshbase-rotcontract-umi75-teleop25-ee20)
- [Repositorio oficial de MolmoAct2 en GitHub](https://github.com/allenai/molmoact2)
- [Paper: MolmoAct2: Action Reasoning Models for Real-world Deployment](https://arxiv.org/abs/2605.02881)
- [Repositorio de MolmoAct (versión anterior)](https://github.com/allenai/MolmoAct)
- [Modelo relacionado: MolmoAct2-BimanualYAM-oranges-12k](https://huggingface.co/ASethi04/MolmoAct2-BimanualYAM-oranges-12k)
- [Modelo relacionado: MolmoAct2-BimanualYAM-oranges-12k-noaffine](https://huggingface.co/ASethi04/MolmoAct2-BimanualYAM-oranges-12k-noaffine)
