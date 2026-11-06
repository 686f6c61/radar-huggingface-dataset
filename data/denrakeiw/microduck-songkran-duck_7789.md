# DenRakEiw/microduck-songkran-duck_7789

## Resumen

`DenRakEiw/microduck-songkran-duck_7789` es una política de control motriz entrenada por refuerzo para el robot bípedo microduck de Pollen Robotics. No es un modelo de lenguaje: es una red neuronal exportada a ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensada para ejecutarse en el bucle de control del robot. El autor la describe como una política «perpetua» que corre de forma indefinida hasta recibir una orden de parada, asignada al slot de marcha `walk`.

Técnicamente se presenta como una variante de una política de carrera propia («sprint race net») reentrenada para congelarse ante un observador externo («the giant's eye»), con un envoltorio de ritmo fijo que impone una velocidad de avance de 0,60 m/s sobre superficie verde y 0 m/s sobre rojo. El modelo se distribuye con la normalización de observaciones integrada en el propio ONNX y un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

La relevancia es acotada pero específica: sirve como ejemplo de política de locomoción reproducible y desplegable en un robot comercial de bajo coste, con un pipeline de entrenamiento abierto (`pollen-robotics/microduck_rl`) y un formato de distribución estandarizado para el demonio `robotctl`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (arquitectura interna no especificada); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

Especificaciones de interfaz:

| Parametro | Valor |
|---|---|
| Dimensionalidad de observación | 61 |
| Dimensionalidad de acción | 14 |
| Frecuencia de control | 50 Hz |
| Slot de política | `walk` |
| Comportamiento | perpetuo hasta recibir orden de parada |
| Velocidad de consigna | 0,60 m/s en verde; 0 m/s en rojo |
| Normalizador de observaciones | integrado en `policy.onnx` (entrada de observaciones crudas) |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna de la red (número de capas, anchura, tipo de codificador). Lo que sí se documenta es el contrato de entrada/salida: 61 valores de observación crudos entran en `policy.onnx`, que aplica internamente la normalización, y salen 14 acciones a 50 Hz. El modelo se entrenó mediante aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw-070`, commit `97e2b1fe2`.

El autor describe el proceso como un reentrenamiento de su propia «sprint race net» para congelarse ante la presencia de un observador («the giant's eye», checkpoint 1300, referencia `hr2`), envuelto en un wrapper de ritmo fijo que fija la velocidad de avance según el color del terreno (0,60 m/s en verde, 0 en rojo). La mención a «trained with solar energy» es una anotación del autor sin detalle técnico verificable. No se especifican número de tokens, composición del dataset ni uso de RLHF/DPO, que en este dominio no aplican.

## Capacidades

- Locomoción bípeda continua a 50 Hz sobre el robot microduck, con política perpetua hasta parada explícita.
- Modulación de la velocidad de avance por señal de color del terreno: 0,60 m/s sobre verde, parada sobre rojo.
- Control de 14 grados de actuación a partir de 61 observaciones, con normalización integrada.
- Comportamiento de congelación ante un observador externo (según descripción del autor).
- Despliegue directo mediante el comando `robotctl policy load walk DenRakEiw/microduck-songkran-duck_7789`.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Demostración de locomoción en microduck: cargar la política en el slot `walk` con `robotctl` y ejecutar una marcha continua en un entorno controlado, aprovechando que la política es perpetua y no requiere reinicio periódico.
- Investigación en aprendizaje por refuerzo para robótica: usar la política como línea base reproducible (commit y rama documentados) para comparar variantes de entrenamiento en `microduck_rl`.
- Navegación reactiva guiada por marcas de color: emplear la consigna de 0,60 m/s en verde y 0 m/s en rojo para construir circuitos con paradas y arranques automáticos sin lógica externa adicional.
- Validación de pipelines de despliegue: probar el flujo completo de `manifest.json` (esquema 2) y `policy.onnx` en el demonio `robotctl` antes de integrar políticas propias.
- Estudio de comportamiento ante presencia humana: analizar la respuesta de congelación descrita por el autor en escenarios con observador, como caso de estudio de condicionamiento perceptual en políticas de control.
- Base para *fine-tuning* o destilación: partir de esta política como inicialización en el repositorio de entrenamiento para adaptar la marcha a otras velocidades o terrenos.
- Docencia: ejemplo compacto de política ONNX con interfaz bien definida (61→14 a 50 Hz) para explicar el ciclo observación-acción en robótica de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara la velocidad de consigna (0,60 m/s en verde, 0 m/s en rojo) y el checkpoint de entrenamiento (1300), sin métricas de recompensa, estabilidad o tasa de caídas.

## Requisitos de hardware

- El modelo es una política ONNX de control a 50 Hz; no requiere GPU para inferencia en el robot. El cómputo cabe holgadamente en la CPU del propio microduck.
- VRAM estimada: no disponible; por la naturaleza del artefacto (política de 61→14) se espera un consumo mínimo, pero no se publican cifras.
- GPU recomendadas: no aplica para despliegue en robot. Para reentrenamiento en `pollen-robotics/microduck_rl` no se documentan requisitos.
- Cabe en cualquier GPU de consumo para inferencia offline; no se especifican modelos concretos.
- Opciones de despliegue: `robotctl` (demonio oficial de microduck) mediante `policy load`; ONNX Runtime para ejecución fuera del robot.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz, que implica un presupuesto de 20 ms por paso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables con parámetros, contexto o licencia documentados.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Cero descargas y cero likes en el momento de la consulta; sin validación comunitaria ni informes de uso en robot real.
- La model card es escueta y contiene afirmaciones no verificables («trained with solar energy», «freeze under the giant's eye») sin detalle técnico.
- Comportamiento dependiente de la señal de color del terreno; un cambio en las condiciones de iluminación o en la calibración de la cámara puede alterar la consigna de velocidad.
- Política perpetua: sin un mecanismo externo de parada, el robot continúa ejecutando la marcha indefinidamente.
- Sin información sobre sesgos, alucinación o cobertura idiomática, que no aplican a un modelo de control; el riesgo relevante es de seguridad física (caídas, colisiones) durante la operación.
- No se documentan métricas de robustez, estabilidad ni tasa de éxito; no se recomienda su uso en producción sin evaluación previa en entorno controlado.
- El tamaño del repositorio figura como 0,0 GB, lo que puede indicar que los artefactos no están completamente subidos o que el redondeo de la plataforma oculta su tamaño real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck_7789
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl (rama `denrakeiw-070`, commit `97e2b1fe2`)
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Repositorio del autor: https://github.com/DenRakEiw/DuckDance
- Sitio oficial de microduck: https://microducks.org/
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (referenciado en la model card)
