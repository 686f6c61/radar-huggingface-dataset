# rayli/robocasa_openpi_checkpoints

## Resumen

`rayli/robocasa_openpi_checkpoints` es un repositorio de checkpoints de investigación publicado en Hugging Face por el usuario `rayli`. No contiene un modelo nuevo entrenado desde cero, sino 24 checkpoints finales resultantes de un estudio comparativo sobre el benchmark RoboCasa365: 8 tareas de manipulación cruzadas con 3 brazos de datos (`native`, `ours` y `native_plus_ours`), con semilla 0. Todos los checkpoints parten del modelo base π0.5 de OpenPI y se ajustan mediante LoRA.

El interés del repositorio es metodológico y de reproducibilidad: permite comparar el efecto del origen de los datos de entrenamiento (nativos del benchmark, propios, o la mezcla de ambos) manteniendo constante el modelo base, la semilla y el presupuesto de optimización. El entrenamiento se fijó en 8.000 pasos con tamaño de lote 64, y el checkpoint final se almacena en el directorio `seed-0/7999`.

Se trata de material para investigación en robótica y visión-lenguaje-acción (VLA), no de un modelo listo para producto: el repositorio ocupa 209,7 GB, no declara licencia, no declara idiomas y no registra descargas ni valoraciones. El README lo describe como repositorio privado, aunque es accesible públicamente bajo el identificador indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en el modelo base π0.5 de OpenPI (Physical Intelligence); detalles internos de π0.5 no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se declaran pesos cuantizados ni formatos GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; el layout del repositorio son directorios de checkpoint de OpenPI (`checkpoints/<nombre>/seed-0/7999/`) |
| Tamano del repositorio | 209,7 GB |
| Numero de checkpoints | 24 (8 tareas x 3 brazos de datos) |
| Tareas de manipulacion | 8 |
| Brazos de datos | `native`, `ours`, `native_plus_ours` |
| Semilla | 0 |
| Pasos de entrenamiento | 8.000 (checkpoint final en el paso 7999) |
| Tamano de lote | 64 |
| Metodo de ajuste | LoRA sobre π0.5 |
| Framework de inferencia | OpenPI (fork `josef5838/robocasa_openpi`) |
| Pipeline declarado en Hugging Face | robotics |
| Descargas / valoraciones | 0 / 0 |
| Fecha de creacion | 2026-09-24 |
| Fecha de actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: los 24 checkpoints son ajustes LoRA sobre π0.5, el modelo base de la familia OpenPI publicada por el equipo de Physical Intelligence. Según la documentación de OpenPI, esa familia incluye modelos VLA preentrenados con más de 10.000 horas de datos de robot; en concreto, π₀ es un VLA basado en flow matching y π₀-FAST es un VLA autorregresivo construido sobre el tokenizador de acciones FAST. La información proporcionada no detalla la configuración interna concreta de π0.5 (número de parámetros, dimensión de las capas, ventana de contexto multimodal ni procedimiento exacto de preentrenamiento).

El ajuste se realizó sobre el benchmark RoboCasa365, un entorno de simulación a gran escala orientado a tareas cotidianas en escenas de cocina. El diseño experimental es factorial: 8 tareas de manipulación x 3 brazos de datos, con semilla 0, 8.000 pasos de optimización y lote de 64. Cada checkpoint se nombra con el patrón `pi05_robocasa365_<TASK>_<ARM>_lora_b64_8k_fixed_instruction`, lo que indica instrucciones fijas por tarea. La procedencia queda documentada: código en `josef5838/robocasa_openpi` (commit `bf4f4b01f55b6fea4e7f223d3420e69e2e70ef37`) y dataset `Josef5838/robocasa_for_articulated_objects` (commit `0fb7a7fb0f5741dd1a5334533a1ef4ee8ea41f89`). El repositorio incluye `metrics_report.md` y `metrics.csv`, cuyos valores numéricos no se han facilitado.

## Capacidades

- Control robótico por visión-lenguaje-acción: dado un contexto visual y una instrucción en lenguaje, el modelo genera acciones de manipulación, siguiendo el paradigma VLA de la familia OpenPI.
- Manipulación en simulación sobre RoboCasa365: cobertura de 8 tareas de manipulación definidas por el benchmark.
- Condicionamiento por instrucción fija: el sufijo `fixed_instruction` de los checkpoints indica instrucciones predefinidas por tarea, no un uso abierto de lenguaje natural arbitrario.
- Ajuste eficiente mediante LoRA: cada checkpoint contiene adaptadores de bajo rango sobre π0.5, lo que permite estudiar el efecto del dato sin reentrenar el modelo completo.
- Comparación experimental de mezclas de datos: los tres brazos (`native`, `ours`, `native_plus_ours`) permiten aislar el efecto de la composición del dataset.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes multi-paso, modo de razonamiento explícito, visión general de imágenes, audio ni generación de texto de propósito general.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reproducción de experimentos sobre RoboCasa365: cargar los 24 checkpoints con el fork de OpenPI y regenerar `metrics.csv` para verificar los resultados del estudio de tres brazos de datos.
- Estudio del efecto de la composición del dataset: comparar el brazo `native` frente a `ours` y `native_plus_ours` manteniendo fijos semilla, pasos y lote, para aislar la contribución de los datos propios.
- Punto de partida para nuevos ajustes LoRA: usar uno de los checkpoints de 8.000 pasos como inicialización en lugar de partir del π0.5 original, reduciendo el coste de un nuevo ciclo de ajuste.
- Investigación en sim-to-real: emplear los checkpoints como política de referencia en simulación antes de evaluar transferencia a un robot físico.
- Evaluación comparativa de políticas: enfrentar estos checkpoints a los algoritmos soportados oficialmente por RoboCasa (Diffusion Policy, OpenPI y GR00T) bajo el mismo protocolo de evaluación.
- Análisis de instrucciones fijas frente a instrucciones abiertas: los nombres de checkpoint permiten medir cuánto depende el rendimiento de la formulación exacta de la instrucción.
- Auditoría de artefactos de investigación: el repositorio documenta commits de código y dataset, lo que facilita la trazabilidad en revisiones de publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio referencia los ficheros `metrics_report.md` y `metrics.csv` con las métricas de evaluación, pero sus valores numéricos no se han facilitado, por lo que no se incluyen tablas comparativas ni cifras de rendimiento.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 209,7 GB; con 24 checkpoints, la media es de aproximadamente 8,7 GB por checkpoint. Descargar el conjunto completo exige ese espacio en disco antes de cualquier inferencia.
- VRAM para inferencia: no disponible. No se declaran parámetros totales, precisión de los pesos ni tamaño de las activaciones, por lo que no es posible estimar la memoria necesaria sin medirla.
- GPU recomendadas: no disponibles en la información proporcionada. La práctica habitual en modelos VLA de la familia OpenPI es ejecutar la inferencia en GPU de centro de datos (A100, H100) en precisión bf16, pero no se confirma para estos checkpoints.
- Viabilidad en GPU de consumo: no disponible. El tamaño por checkpoint (unos 8,7 GB de media) es compatible con GPUs de consumo de gama alta en términos de almacenamiento, pero la VRAM necesaria no está documentada.
- Opciones de despliegue: se indica el uso del fork de OpenPI (`josef5838/robocasa_openpi`, commit `bf4f4b01f55b6fea4e7f223d3420e69e2e70ef37`) y del fork de benchmark `robocasa-benchmark/openpi`. No hay soporte declarado para llama.cpp, Ollama, vLLM ni TGI, ni formatos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este repositorio, por lo que la comparativa se limita a características declaradas.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rayli/robocasa_openpi_checkpoints` (este) | Checkpoints LoRA de π0.5 sobre RoboCasa365 | no disponible | no disponible | no disponible (métricas no facilitadas) | no disponible | Hugging Face, 209,7 GB, 0 descargas |
| π₀ (OpenPI) | VLA basado en flow matching | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Repositorio OpenPI de Physical Intelligence |
| π₀-FAST (OpenPI) | VLA autorregresivo con tokenizador FAST | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Repositorio OpenPI de Physical Intelligence |
| GR00T | Política soportada oficialmente por RoboCasa | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Integración oficial en RoboCasa |
| Diffusion Policy | Política de difusión soportada por RoboCasa | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Integración oficial en RoboCasa |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; trátese como material de investigación con derechos reservados por defecto.
- Repositorio marcado como privado en su propio README: existe una contradicción entre el texto de la model card y la accesibilidad pública del identificador, lo que aconseja verificar el estado real antes de depender de él.
- Ausencia de métricas: los ficheros `metrics_report.md` y `metrics.csv` se citan pero no se reproducen sus valores, de modo que no es posible validar el rendimiento relativo de los tres brazos de datos.
- Entrenamiento exclusivamente en simulación (RoboCasa365): no hay evidencia de validación en hardware real, por lo que el comportamiento en un robot físico es incierto.
- Instrucciones fijas por tarea: el nombre de los checkpoints sugiere un condicionamiento restringido; fuera de ese conjunto de instrucciones el comportamiento no está caracterizado.
- Riesgo de acciones incorrectas: como política VLA, los errores no se manifiestan como texto alucinado, sino como comandos de manipulación potencialmente inseguros si se trasladan a un sistema físico sin supervisión.
- Sesgos: no documentados. Al entrenarse sobre un benchmark con entornos de cocina generados sintéticamente, es previsible un sesgo hacia esas escenas y objetos, aunque no se cuantifica en la información disponible.
- Idiomas no declarados: no se puede asumir soporte multilingüe de las instrucciones más allá de lo usado en el benchmark.
- Coste de manejo elevado: 209,7 GB de repositorio y 24 checkpoints complican el almacenamiento, la versionado y la selección del artefacto adecuado.
- Fecha de creación declarada (2026-09-24) y ausencia de descargas y valoraciones: repositorio sin validación por parte de la comunidad.
- Trazabilidad parcial: se documentan los commits de código y dataset, pero no la configuración completa de entrenamiento (optimizador, tasa de aprendizaje, rango de LoRA, composición exacta de cada brazo de datos).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rayli/robocasa_openpi_checkpoints
- Codigo de procedencia (identificador declarado): https://github.com/josef5838/robocasa_openpi
- Dataset de procedencia (identificador declarado): https://huggingface.co/datasets/Josef5838/robocasa_for_articulated_objects
- Fork de OpenPI para el benchmark RoboCasa: https://github.com/robocasa-benchmark/openpi
- Fork de OpenPI orientado a RoboCasa: https://github.com/Leo428/openpi_robocasa
- Sitio oficial de RoboCasa: https://robocasa.ai/
- Documentacion de algoritmos de aprendizaje de politicas en RoboCasa: https://robocasa.ai/docs/build/html/benchmarking/policy_learning_algorithms.html
- OpenPI (biblioteca de modelos VLA de Physical Intelligence): https://www.openpi.net/english.html
