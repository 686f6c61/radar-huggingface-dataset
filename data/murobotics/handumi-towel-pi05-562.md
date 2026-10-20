# murobotics/handumi-towel-pi05-562

## Resumen

`murobotics/handumi-towel-pi05-562` es un modelo de visión-lenguaje-acción (VLA) para robótica, obtenido por ajuste fino completo de `lerobot/pi05_base`, que a su vez deriva de π0.5 y se construye sobre PaliGemma. Está especializado en una tarea concreta: plegar una toalla amarilla con dos brazos AgileX PiPER. No es un modelo de lenguaje general ni un asistente conversacional; su salida son acciones de robot.

El interés principal está en el pipeline de datos: se ha entrenado solo con demostraciones capturadas mediante HandUMI, una interfaz manual paralela que permite recoger datos bimanuales sin robot, y después se han retargetizado a PiPER. La cohorte usada tiene 562 episodios, con dos vistas de muñeca a resolución completa de 1280×960.

La evaluación publicada es en robot real: 7 intentos correctos de 20 (35 %) con la toalla colocada en una posición aleatoria dentro del área cubierta por los datos de entrenamiento. El modelo base sin ajuste fino obtiene 0/20. Es un resultado útil como prueba de concepto, pero todavía lejos de una fiabilidad de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5, construida sobre PaliGemma; no se detalla en la información disponible el mecanismo exacto de la cabeza de acciones |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no se documenta ventana de contexto textual ni de historial |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors y no se documentan GGUF, AWQ, GPTQ ni variantes cuantizadas |
| Idiomas soportados | no disponible; la model card no documenta condicionamiento por lenguaje para esta fine-tune |
| Licencia | Gemma Terms of Use (licencia Gemma; no es una licencia OSI) |
| Formato de pesos | safetensors (checkpoint LeRobot) |
| Modelo base | `lerobot/pi05_base` |
| Pipeline
