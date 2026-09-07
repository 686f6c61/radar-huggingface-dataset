# Kai9987kai/supermix-v87

## Resumen

Supermix v87 es un modelo de investigación de 15,3 millones de parámetros desarrollado por Kai9987kai. Se trata de un modelo de mezcla de expertos (MoE) con 3,9 millones de parámetros activos por token, entrenado para resolver problemas de física, química, aritmética y trazado de código Python mediante razonamiento explícito. Cada fila del corpus de entrenamiento fue verificada de forma automática: la ciencia mediante un solucionador simbólico exacto y el código ejecutando el fragmento. El modelo no es un modelo de chat y su objetivo principal es demostrar un hallazgo sobre la descomposición en scratchpad: una descomposición solo ayuda si sus pasos pueden derivarse hacia adelante a partir de lo ya escrito. La longitud de contexto no está disponible en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parámetros totales | 15.291.189 |
| Parámetros activos | 3.934.501 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (formato de archivo no especificado) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura MoE con 15.291.189 parámetros totales y 3.934.501 parámetros activos por token. El corpus de entrenamiento está compuesto por 1.156.108 filas, de las cuales 480.000 son problemas de ciencia verificados por un solucionador simbólico exacto y 400.000 son problemas de aritmética. El README se corta en "180", por lo que la composición completa del corpus no está disponible. No se menciona el uso de RLHF ni DPO. La innovación técnica destacable es la verificación automática de cada fila de entrenamiento: la ciencia se comprueba con un solucionador simbólico y el código Python se valida ejecutando el fragmento. El modelo también incorpora un hallazgo empírico: la precisión en un paso escrito cae con el número de cifras significativas que debe determinar, de 0,825 con un dígito a 0,075 con tres dígitos y tres lugares.

## Capacidades

- Resuelve problemas de física, química, aritmética y trazado de código Python escribiendo su razonamiento paso a paso.
- Cada fila de entrenamiento fue verificada automáticamente: ciencia por solucionador simbólico, código por ejecución.
- Capacidad de code-tracing: puede seguir la ejecución de bucles y asignaciones en Python. Nueve tareas nuevas en v87 alcanzan una precisión de 0,894.
- No es un modelo de chat: no está diseñado para conversación ni instrucciones generales.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible. Razonamiento multi-step: limitado a sus tareas de entrenamiento (aritmética, ciencia, code-tracing).
- Capacidades multilingües: no disponibles.
- En su benchmark propio de 30 tareas, alcanza una precisión de 0,806 sobre 630 problemas, con 0 respuestas no parseables y 0 truncadas.

## Casos de uso

- Investigación en razonamiento aritmético: el modelo permite estudiar cómo las descomposiciones en scratchpad afectan la precisión, como demuestra el análisis de `power` y `percent`.
- Validación de soluciones simbólicas: al estar entrenado con datos verificados por un solucionador exacto, puede servir como referencia para generar explicaciones paso a paso en física y química.
- Evaluación de code-tracing: el modelo puede seguir la ejecución de bucles y asignaciones en Python, lo que resulta útil para evaluar el razonamiento procedural de modelos pequeños.
- Análisis de sensibilidad al formato: el README documenta cómo la precisión cae con el número de cifras significativas; esto permite investigar la robustez del modelo ante cambios en el formato de respuesta.
- Benchmark de regresión: la comparación v86 vs v87 permite medir el efecto de añadir nuevas tareas sobre el rendimiento en tareas previas.
- Generación de soluciones para ejercicios educativos: aunque no es chat, puede producir soluciones paso a paso para problemas de aritmética y ciencias, útiles en sistemas de tutoría.
- Pruebas de cobertura de datos: el caso de `percent` sirve como ejemplo de cómo un desajuste entre los generadores de corpus y benchmark puede producir puntuaciones engañosas.

## Benchmarks y rendimiento

| Benchmark | n | Precisión | Intervalo 95% |
|---|---|---|---|
| Paired v86 vs v87 (mismas tareas) | 439 | v86: 0,7745 / v87: 0,7677 | p = 0,81 |
| Nuevas tareas code-tracing (v87) | 189 | 0,894 | [0,842, 0,930] |
| Benchmark propio de 30 tareas (v87) | 630 | 0,806 | [0,774, 0,835] |
| Tareas de control no tocadas | no disponible | 0,9825 | p = 0,125 |

Cambios por tarea (n = 21 por tarea, intervalo Wilson ±20 puntos):

| Tarea | v86 | v87 | Δ |
|---|---|---|---|
| algebra_one_step | 0,476 | 0,952 | +0,476 |
| average | 0,048 | 0,286 | +0,238 |
| two_step | 0,238 | 0,429 | +0,190 |
| word_problem | 0,667 | 0,762 | +0,095 |
| arithmetic | 0,667 | 0,714 | +0,048 |
| wave_speed | 1,000 | 0,952 | −0,048 |
| arithmetic_series | 1,000 | 0,952 | −0,048 |
| division | 1,000 | 0,905 | −0,095 |
| acceleration | 0,762 | 0,571 | −0,190 |
| percent | 0,476 | 0,286 | −0,190 |
| power | 0,333 | 0,048 | −0,286 |
| molarity | 0,667 | 0,333 | −0,333 |

Sensibilidad a las cifras significativas en un paso escrito:

| Cifras significativas que debe producir | Ejemplo | Precisión |
|---|---|---|
| un dígito | 7 | 0,825 |
| dos dígitos redondos | 50 | 0,750 |
| tres dígitos redondos | 200 | 0,525 |
| tres dígitos, dos lugares | 250 | 0,275 |
| tres dígitos, tres lugares | 174 | 0,075 |

## Requisitos de hardware

- VRAM estimada: con 15,3 millones de parámetros, la inferencia en FP32 requiere aproximadamente 61 MB de VRAM, y en FP16 unos 31 MB. Cabe en cualquier GPU consumer.
- GPU recomendadas: no se proporcionan recomendaciones oficiales; cualquier GPU con al menos 1 GB de VRAM es suficiente para este tamaño.
- Si cabe en consumer GPU: sí, con margen amplio.
- Opciones de despliegue: no se especifican en la información; al ser un modelo PyTorch, puede ejecutarse con Transformers/PyTorch, pero no hay datos sobre vLLM, llama.cpp, etc.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Precisión paired | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| supermix-v87 | 15.291.189 | 3.934.501 | no disponible | 0,7677 | no disponible | HuggingFace |
| supermix-v86 | no disponible | no disponible | no disponible | 0,7745 | no disponible | HuggingFace |

No se han identificado otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat; no debe usarse para conversación ni instrucciones generales.
- Las tareas `power`, `molarity` y `acceleration` son peores que en v86. El cambio de corpus debería revertirse.
- `percent` es peor que v86 a pesar de haber corregido el agujero de cobertura.
- `average` sigue siendo la tarea más débil, con una precisión de 0,286.
- `two_step` se encuentra en 0,429, por debajo de su nivel de v80 (0,633).
- La precisión cae drásticamente cuando un paso debe determinar muchas cifras significativas, de 0,825 a 0,075.
- La descomposición en scratchpad solo ayuda si los pasos pueden derivarse hacia adelante; dividir la salida, no la entrada, es un error de diseño.
- El modelo puede inventar dividendos y dividirlos incorrectamente en tareas de descomposición.
- No se especifica licencia, por lo que el uso comercial no está claro.
- No se especifican idiomas soportados; los ejemplos del README están en inglés, pero no se confirma la cobertura multilingüe.
- Riesgo de alucinación en tareas fuera de su entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Kai9987kai/supermix-v87
- GitHub: https://github.com/kai9987kai/Supermix
- Perfil del autor en HuggingFace: https://huggingface.co/Kai9987kai
