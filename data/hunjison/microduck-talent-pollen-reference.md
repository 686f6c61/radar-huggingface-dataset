# hunjison/microduck-talent-pollen-reference

## Resumen

`hunjison/microduck-talent-pollen-reference` es una política de control para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, publicada en HuggingFace por el usuario `hunjison`. No es un modelo de lenguaje ni un modelo generativo de propósito general: es una política de Reinforcement Learning exportada a ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensada para ejecutarse en el propio robot.

El autor la describe como una política "perpetual": una marcha (gait) que se ejecuta de forma continua hasta que se le indique lo contrario, y que se carga en una ranura (slot) de políticas del daemon microduck mediante el comando `robotctl policy load <slot> hunjison/microduck-talent-pollen-reference`. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo, sin preprocesado adicional.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de una política de locomoción para una plataforma robótica abierta, con el manifiesto en el esquema 2 del manifiesto de políticas de microduck. La información publicada es muy escasa: no se declara licencia, no hay idiomas, no hay benchmarks y el repositorio ocupa 0.0 GB, por lo que la ficha se limita a documentar lo que el autor expone explícitamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con RL y exportada a ONNX; no se documenta la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso de control, sin ventana de contexto textual |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompañado de `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Espacio de observación | 61 dimensiones (normalizador embebido en el ONNX) |
| Espacio de acciones | 14 acciones |
| Frecuencia de control | 50 Hz |
| Comportamiento | política "perpetual": se ejecuta de forma continua hasta recibir orden de parada o sustitución |
| Librería / pipeline | `microduck` / `robotics` (HuggingFace) |
| Tags | microduck, onnx, robotics, reinforcement-learning |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-25 |

## Arquitectura y entrenamiento

El autor no publica detalles de la arquitectura de red: la model card solo indica que la política se ejecuta como un grafo ONNX (`policy.onnx`) con el normalizador de observaciones integrado, alimentado con observaciones en crudo de 61 dimensiones y produciendo 14 acciones a 50 Hz. No se especifica si se trata de un MLP, una red recurrente o un transformer; tampoco el número de parámetros ni el tamaño de las capas.

En cuanto al entrenamiento, la única información trazable es la procedencia del código: repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`, dentro de un pipeline de Reinforcement Learning (tag `reinforcement-learning`). No se documentan el número de pasos de entrenamiento, la composición del dataset, el simulador empleado, ni si hubo fases de ajuste fino, regularización o curriculum. Tampoco se describe ninguna innovación técnica asociada (decodificación especulativa, atención lineal u otras), algo esperable al no tratarse de un modelo de lenguaje.

## Capacidades

- Generación de una marcha de locomoción continua sobre el robot microduck, mantenida indefinidamente hasta que se ordene lo contrario ("perpetual policy").
- Control en bucle cerrado a 50 Hz: 61 entradas de observación y 14 salidas de acción por paso.
- Carga e intercambio en caliente mediante el daemon: `sudo robotctl policy load <slot> hunjison/microduck-talent-pollen-reference`.
- Acepta observaciones en crudo: el normalizador está embebido en `policy.onnx`, lo que elimina pasos de preprocesado en el lado del robot.
- Integración con el ecosistema microduck: `manifest.json` conforme al esquema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multilingües; no hay modo "thinking", visión ni audio.

## Casos de uso

- Marcha por defecto del microduck: cargar esta política en una ranura del daemon para que el robot mantenga una marcha continua durante sesiones de demostración, sin programar un controlador propio.
- Baseline en experimentos de RL: usarla como referencia de comparación al entrenar políticas propias con `pollen-robotics/microduck_rl`, midiendo diferencias de comportamiento a 50 Hz sobre el mismo espacio de observación y acción.
- Prueba de integración del daemon: validar el flujo completo de `robotctl policy load`, la resolución del manifiesto y la escritura en la ranura de políticas antes de desplegar políticas internas.
- Verificación de la cadena ONNX en el robot: comprobar que el runtime ONNX del microduck ejecuta correctamente un grafo con normalizador embebido alimentado con observaciones en crudo.
- Reproducibilidad de experimentos: al estar fijado el commit de entrenamiento (`6ff40704a`), permite reconstruir el entorno de entrenamiento y auditar la política publicada frente al código fuente.
- Docencia y talleres de robótica: ejemplo mínimo de política de locomoción empaquetada como artefacto ONNX + manifiesto, útil para explicar el ciclo observación-acción a 50 Hz en una plataforma abierta.
- Sustitución temporal de política en pruebas A/B: cargar esta política en una ranura libre, comparar comportamiento con otra política del mismo robot y revertir sin recompilar el daemon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, distancia recorrida, robustez frente a perturbaciones ni comparaciones con otras políticas.

## Requisitos de hardware

- Hardware objetivo: el propio robot microduck de Pollen Robotics, con la política ejecutándose en su cómputo de a bordo a 50 Hz.
- VRAM estimada para inferencia: no disponible (el repositorio ocupa 0.0 GB y no se publica el tamaño del grafo ONNX ni el número de parámetros).
- GPU recomendadas: no disponible; no se documenta si la inferencia requiere GPU o si se ejecuta en CPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX en el robot, cargado mediante el daemon microduck con `robotctl policy load <slot> ...`; no se documentan otras rutas (vLLM, llama.cpp, Ollama o TGI no aplican a este artefacto).
- Latencia y throughput: se declara un bucle de control a 50 Hz (periodo de 20 ms por paso), sin cifras de latencia por inferencia ni de margen temporal disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hunjison/microduck-talent-pollen-reference` | Política RL para microduck (ONNX) | 61 / 14 | 50 Hz | no disponible | HuggingFace |
| Otras políticas de microduck en HuggingFace | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas de locomoción de otros cuadrúpedos (p. ej. ecosistema Unitree, MuJoCo) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre modelos comparables en la información proporcionada; la comparación cuantitativa de parámetros, contexto y rendimiento no es posible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa ni genera texto, no responde a prompts y no admite instrucciones en lenguaje natural.
- Licencia no declarada: la ausencia de licencia impide asumir permisos de uso comercial, redistribución o modificación; hay que contactar con el autor antes de cualquier uso en producción.
- Trazabilidad incompleta: se conoce el repositorio, la rama y el commit de entrenamiento, pero no el dataset, el simulador, el número de pasos ni las métricas de convergencia.
- Repositorio de 0.0 GB: conviene verificar si los binarios están alojados en LFS o si el artefacto no se ha subido completo antes de intentar cargarlo en el robot.
- Comportamiento "perpetual" sin condición de parada propia: la política se ejecuta hasta que se le indique lo contrario, por lo que requiere supervisión humana o una capa externa de seguridad (parada de emergencia, límites de par, watchdog).
- Riesgo de brecha sim-to-real: al no documentarse el entrenamiento, no puede evaluarse la robustez ante cambios de fricción, terreno, carga útil o desgaste de actuadores.
- Ausencia de benchmarks: no hay evidencia publicada de estabilidad, velocidad de desplazamiento ni recuperación ante caídas.
- Sesgos: no aplica el concepto habitual de sesgo de datos lingüísticos; el riesgo equivalente es el sobreajuste a las condiciones concretas del entorno de entrenamiento.
- Advertencia sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo y no se han incluido como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hunjison/microduck-talent-pollen-reference
- Repositorio del robot y daemon microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: https://github.com/pollen-robotics/microduck_rl (rama `main`, commit `6ff40704a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
