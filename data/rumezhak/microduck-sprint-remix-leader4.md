# rumezhak/microduck-sprint-remix-leader4

## Resumen

Microduck-sprint-remix-leader4 es un modelo de control para robótica cuadrúpeda de simulación, publicado por el usuario rumezhak como entrada para la prueba de "2 m Sprint" de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje: se trata de un artefacto híbrido que combina una red neuronal feedforward (61 → 512 → 256 → 128 → 14 con activaciones ELU) con una tabla de consulta de acciones grabadas (`L_obs`/`L_act`) que permite reproducir paso a paso las trayectorias de cinco semillas oficiales del simulador. El modelo base es a1rb4Ck/microduck-sprint-2m, del que hereda la práctica totalidad del diseño y de los pesos.

La contribución propia de esta variante es mínima y acotada: sustituye las 67 filas correspondientes a la semilla 5 por 66 filas re-buscadas mediante CMA-ES separable, de modo que esa semilla termina en 164 pasos de física (0,820 s) en lugar de 165 (0,825 s). Las otras cuatro semillas permanecen idénticas bit a bit al modelo base. El resultado agregado es una media de 0,823 s sobre las cinco semillas oficiales, frente a los 0,824 s del base.

Es relevante únicamente como referencia metodológica dentro de la comunidad de la Microduck Arena: ilustra cómo una búsqueda de acciones en el simulador puede ajustar marginalmente un resultado in-sample, y documenta con transparencia sus límites (fragilidad ante redondeos de coma flotante en otras plataformas y advertencia explícita de no usar el modelo en un robot físico). El repositorio ocupa 0,0 GB y acumula 25 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red feedforward 61 → 512 → 256 → 128 → 14 con activaciones ELU, combinada con tabla de consulta de acciones grabadas (`L_obs`/`L_act`) |
| Parametros totales | no disponible (el repo ocupa 0,0 GB; no se declara el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control paso a paso; 61 entradas de observación, 48 enmascaradas por `L_mask`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible en la información proporcionada (el tag `onnx` sugiere exportación a ONNX, pero no se confirma el formato de los pesos publicados) |

Otros datos relevantes: pipeline `robotics`, librería `microduck`, modelo base `a1rb4Ck/microduck-sprint-2m` (relación `finetune`), región `us`, creado el 2026-10-29.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, sin cambios: una red neuronal de cuatro capas (61 entradas, 512, 256, 128 y 14 salidas) con activación ELU que actúa como política de marcha cuando la consulta de tabla no encuentra coincidencia. El componente determinista es una tabla de búsqueda que almacena, para cada paso de las ejecuciones grabadas de las cinco semillas oficiales, la observación registrada (`L_obs`, enmascarada a 48 de las 61 entradas) y la acción a ejecutar (`L_act`). En cada paso, la fila almacenada más cercana a la observación actual —medida por la mayor diferencia absoluta sobre las entradas enmascaradas— proporciona la acción si queda dentro de la tolerancia `L_tol` (1e-7); en caso contrario, actúa la red. Sobre una semilla oficial las observaciones se repiten exactamente, por lo que la ejecución se reproduce paso a paso.

El único cambio respecto al base afecta a la tabla: se eliminan las 67 filas de la ejecución de la semilla 5 y se añaden 66 filas re-buscadas (332 filas en total frente a 333 del base). Las 266 filas de las semillas 1 a 4, la red, la máscara y la tolerancia son idénticas al base, verificado tensor a tensor. La búsqueda se realizó directamente en el runner de la Arena sobre x86-64 Linux con MuJoCo 3.10.0, usando CMA-ES separable con población de 320 sobre las últimas 30 llamadas de acción (filas 36 a 65, 420 parámetros), con coste igual al tiempo de cruce interpolado dentro del paso de control de 0,02 s. El tamaño de paso inicial fue de 0,3 (las acciones van de aproximadamente -14 a +14 y los servos saturan), y una ronda de unos 6 minutos en 18 workers llevó la semilla 5 de 41,214 a 40,961 pasos de control, desplazando su final de 165 a 164 pasos de física. No se declaran datos de entrenamiento adicionales (número de tokens, composición de dataset, RLHF/DPO), lo que es coherente con la naturaleza del artefacto.

## Capacidades

- Política de marcha para el robot cuadrúpedo MicroDuck en el simulador de la Microduck Arena (prueba de 2 m Sprint).
- Reproducción determinista de las ejecuciones grabadas de las cinco semillas oficiales mediante consulta de tabla con tolerancia 1e-7.
- Generalización limitada a semillas nuevas mediante la red neuronal subyacente (el base, sin cambios en la red).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- Sin capacidades multilingües (no es un modelo de lenguaje).
- Modo de "pensamiento" o decodificación especulativa: no aplica.

## Casos de uso

- Reproducción de resultados de la Arena: cargar el modelo en el runner oficial (versión 5, reloj de 5 ms) para verificar la puntuación de 0,823 s declarada por el autor sobre las cinco semillas oficiales.
- Referencia metodológica para búsqueda de acciones: usar el flujo descrito (extracción de secuencias de acción, CMA-ES separable con población 320, coste por tiempo de cruce interpolado) como plantilla para ajustar otras entradas de la Arena.
- Estudio de robustez de tablas de consulta: analizar cómo la dependencia de coincidencia exacta de observaciones (tolerancia 1e-7) hace que el replay se rompa ante redondeos distintos de coma flotante, comparando ejecuciones en x86-64 Linux frente a otras plataformas.
- Evaluación de generalización fuera de muestra: ejecutar el modelo sobre las 300 semillas frescas (1.000.000 en adelante) citadas por el autor para medir la tasa de finalización (292 de 300) y el tiempo medio de los finalizadores (0,931 s).
- Docencia y divulgación sobre optimización en simuladores: ilustrar la diferencia entre resultados in-sample y capacidad real de marcha, dado que el propio autor advierte que no es "un mejor caminante".
- Comparación de variantes dentro de la familia microduck-sprint: contrastar el efecto de sustituir únicamente las filas de una semilla (332 frente a 333 filas) sobre la media de cinco semillas.
- Verificación de integridad de pesos: comparar tensor a tensor contra a1rb4Ck/microduck-sprint-2m para confirmar que solo difieren las filas de la semilla 5.

## Benchmarks y rendimiento

Resultados declarados por el autor, puntuados con `arena score` en x86-64 Linux (reproduce el marcador de la Arena):

| Metrica | Resultado |
|---|---|
| Media de 5 semillas oficiales | 0,823 s (5 de 5 finalizadas) |
| Semilla 1 | 0,820 s (164 pasos de física) |
| Semilla 2 | 0,820 s (164 pasos) |
| Semilla 3 | 0,830 s (166 pasos) |
| Semilla 4 | 0,825 s (165 pasos) |
| Semilla 5 | 0,820 s (164 pasos; base: 165 pasos, 0,825 s) |
| Mejor velocidad comandada (barrido de la Arena) | 0,20 m/s (la tabla ignora la velocidad comandada; mismos tiempos a cualquier velocidad) |
| 300 semillas frescas (≥1.000.000) | 292 finalizan; media de finalizadores 0,931 s; peor 1,16 s |

Comparación con el modelo base: a1rb4Ck/microduck-sprint-2m obtiene 0,824 s en el marcador; esta variante obtiene 0,823 s.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y la red es de tamaño reducido (61 → 512 → 256 → 128 → 14), por lo que la huella de memoria es mínima.
- GPU recomendadas: no se especifican; la evaluación se realizó en CPU sobre x86-64 Linux con MuJoCo 3.10.0.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del artefacto, aunque no se confirma en la información disponible.
- Opciones de despliegue: el runner de la Microduck Arena (versión 5) y la librería `microduck`; el tag `onnx` sugiere soporte de exportación a ONNX, sin detalle adicional.
- Latencia y throughput: no disponibles. La búsqueda de la semilla 5 se completó en unos 6 minutos con 18 workers (una ronda de CMA-ES), dato de entrenamiento y no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado en 2 m Sprint | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rumezhak/microduck-sprint-remix-leader4 | no disponible | no aplica | 0,823 s (media de 5 semillas) | Apache-2.0 | HuggingFace, 25 descargas |
| a1rb4Ck/microduck-sprint-2m (base) | no disponible | no aplica | 0,824 s | Apache-2.0 | HuggingFace |
| Otras entradas de la Microduck Arena | no disponible | no aplica | no disponible | no disponible | HuggingFace Spaces (pollen-robotics/microduck-arena) |

No se dispone de datos de otras entradas de la Arena en la información proporcionada.

## Limitaciones y advertencias

- Resultados in-sample: la tabla de consulta solo reproduce las ejecuciones de las cinco semillas oficiales; no constituye una política de marcha mejorada.
- Fragilidad ante coma flotante: la coincidencia exige observaciones bit a bit con tolerancia 1e-7; el redondeo de otra máquina puede romper el replay y degradar esa semilla a la red. Solo se verificó en x86-64 Linux.
- Margen muy ajustado en la semilla 5: su cruce queda 0,04 pasos de control por debajo del siguiente límite de tick (0,16 de paso de física).
- No apto para robot físico: entrenado y evaluado solo en el simulador de la Arena; las acciones tardías quedan muy fuera de lo que se pediría a un servo real. El autor indica explícitamente no cargarlo en un MicroDuck físico.
- Generalización limitada: sobre 300 semillas frescas, 292 finalizan, con media de 0,931 s y peor caso de 1,16 s; la red subyacente (heredada del base) es la que actúa fuera de las semillas oficiales.
- La velocidad comandada no influye: la tabla la ignora, por lo que el barrido de la Arena reporta 0,20 m/s de forma engañosa.
- Sin datos de sesgos, alucinación o multilingüismo aplicables, al no ser un modelo de lenguaje.
- Licencia Apache-2.0 heredada del base; no se declaran restricciones adicionales para uso comercial, pero el uso práctico está acotado por las advertencias anteriores.
- El autor declara que un asistente de IA ayudó en parte de los experimentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rumezhak/microduck-sprint-remix-leader4
- Modelo base: https://huggingface.co/a1rb4Ck/microduck-sprint-2m
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
- Perfil del autor del base: https://huggingface.co/a1rb4Ck
- Créditos citados por el autor: https://huggingface.co/suraj-phanindra y https://huggingface.co/jrubiosainz
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
