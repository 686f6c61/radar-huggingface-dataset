# Donghyun1228/pi05-libero-b200-temporal-contrast-yaw30-1000-pilot-20261013

## Resumen

π₀.₅ temporal correspondence contrast pilot: yaw30 es un checkpoint de política robótica publicado por el usuario Donghyun1228 bajo la librería `openpi`, etiquetado como `robotics`, `libero`, `inverse-dynamics` y `temporal-contrast`. Se trata del resultado de un piloto de 1.000 actualizaciones de optimizador (batch 32, semilla 42, sorteo de semilla 170013) en el que solo se entrena un modelo de dinámica inversa (IDM) sobre el objetivo, sin observaciones de origen ni retroalimentación de éxito de tarea. El repositorio ocupa 13,1 GB y la licencia es Apache-2.0.

El modelo resuelve una pregunta muy concreta de investigación: si una señal de contraste temporal entre correspondencias futuras válidas y nulas mejora la política frente a controles fijos. La comparación publicada es de pantallas únicas de 400 rollouts (4 suites × 10 tareas × 10 estados iniciales oficiales), con ganancias de +0,75 puntos porcentuales en view_large y yaw30 y +0,25 en ur5e. La model card insiste en que estos resultados son preliminares y no demuestran mejora general.

Es relevante ahora como artefacto reproducible más que como modelo de producción: incluye pesos, normalización de origen, planes, diarios, procedencia del controlador y comprobaciones estrictas de exportación en crudo. No se documentan parámetros totales, longitud de contexto, idiomas ni cuantizaciones, por lo que su interés es exclusivamente de investigación en manipulación robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; la tabla de multiplicadores de entrenamiento registra tres grupos de módulos: `vision`, `llm` y `expert` (compatible con una política con codificador visual, columna vertebral tipo LLM y experto de acciones) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el entrenamiento usa FP32 en 43 hojas entrenables y el grafo de despliegue se restaura en BF16 |
| Idiomas soportados | no disponible (no se documentan instrucciones en lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible; el repositorio ocupa 13,1 GB y el grafo de despliegue se restaura en BF16 |
| Librería | openpi |
| Pipeline | robotics |
| Tamaño del repositorio | 13,1 GB |
| Hojas del grafo nativo | 51 nativas (43 entrenables FP32 de fuente original + 8 proyecciones congeladas); 23 hojas de muñeca de fuente original añadidas para inferencia; grafo de despliegue de 74 hojas |
| Fecha de creación | 2026-10-12 |
| Última actualización | 2026-10-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura base. Lo único inferible de los datos publicados es que el entrenamiento aplica multiplicadores de aprendizaje diferenciados sobre tres grupos de módulos denominados `vision`, `llm` y `expert`, y que existe una ruta de exportación con hojas de "muñeca" (wrist) añadidas en inferencia, además de compensación de pose yaw30 y rotación de acciones. El modelo se entrena como modelo de dinámica inversa (IDM) sobre el objetivo, con un piloto de 1.000 actualizaciones aplicadas y un total de 1.081 pasos hacia atrás (81 de ellos corresponden a diagnósticos adicionales).

El mecanismo central es un contraste direccional entre correspondencias futuras válidas y nulas. Cada 25 pasos, hasta 975, un diagnóstico independiente evalúa esa señal; dos controles nulos aleatorios y un control cercano en el tiempo deben coincidir antes de que cambie la asignación de multiplicadores, acotada al rango [0,01, 20]. La reasignación se calcula con la propuesta de lote del diagnóstico, no con la del lote real de entrenamiento, y la puerta de confianza es explícitamente heurística. Solo las actualizaciones de gradiente del IDM objetivo válido modifican parámetros: los momentos Adam candidatos del diagnóstico se descartan y los commits del optimizador de diagnóstico son cero. El entrenamiento está balanceado por suite (ocho ventanas por suite y actualización), no por tarea, y no incorpora observaciones de origen, recompensa de asignación por pérdida escalar ni retroalimentación de éxito de tarea. El conjunto elegible son 309.250 ventanas nativas H10 repartidas en diez linajes de tarea por suite (40 en total).

Los multiplicadores aplicados (media no ponderada sobre las 1.000 actualizaciones) fueron: `vision` 1,085294 (mín. 0,986539, máx. 1,231846, final 1,111813), `llm` 1,062417 (mín. 1,000000, máx. 1,196261, final 1,123900) y `expert` 0,874973 (mín. 0,687362, máx. 1,000000, final 0,800278). El autor advierte que esa media no equivale a energía de actualización efectiva ni a desplazamiento de parámetros.

## Capacidades

- Generación de acciones de manipulación para el benchmark LIBERO: cuatro suites, diez tareas por suite y diez estados iniciales oficiales por tarea.
- Compensación de pose yaw30 y rotación de acciones, ambas activas en la pantalla evaluada.
- Aprendizaje por contraste temporal de correspondencia futura (válida frente a nula) dentro del mismo linaje lógico de recogida de datos e instrucción original.
- Manejo de episodios UR segmentados y de una variante de brazo UR5e en las comparaciones publicadas.
- Soporte de cámaras de muñeca: 23 hojas de fuente original dedicadas a muñeca se añaden en inferencia (74 hojas en el grafo de despliegue).
- Exportación en crudo verificada, con normalización de origen incluida.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento, visión general, audio: no disponibles.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como línea base reproducible para medir si el contraste temporal de correspondencia aporta ventaja frente a controles fijos, con las tres comparaciones ya publicadas (view_large, yaw30, ur5e).
- Reproducción de experimentos: el autor publica hashes de revisión del dataset objetivo, del snapshot de entrenamiento/evaluación y del de inferencia, además de planes, diarios y procedencia del controlador, lo que permite replicar el piloto paso a paso.
- Evaluación estandarizada en LIBERO: la pantalla de 400 rollouts con MuJoCo 3.2.3, 16 clientes por GPU y errores de rollout cero es un protocolo listo para comparar variantes.
- Estudio de compensación de pose: la variante yaw30 permite analizar cómo afectan la compensación de orientación y la rotación de acciones al éxito en tareas de contacto denso.
- Transferencia entre plataformas: la comparación ur5e (167/400 fijo frente a 168/400 temporal) sirve para estudiar la transferibilidad de la señal a otro brazo.
- Análisis de configuración de cámaras: la variante view_large (117/400 frente a 120/400) permite estudiar el efecto de añadir hojas de muñeca en inferencia.
- Estudio de sesgos de muestreo: al ser un entrenamiento balanceado por suite y no por tarea, el checkpoint es útil para investigar cómo el reparto de ventanas afecta al rendimiento por tarea.
- Punto de partida para ajuste fino: el grafo de despliegue de 74 hojas en BF16 se puede reutilizar como inicialización en experimentos posteriores.

## Benchmarks y rendimiento

Pantalla de política con semilla 7 emparejada: 204/400 (51,00%), cuatro suites × diez tareas × diez estados iniciales oficiales, cero errores de rollout, limpieza de procesos verificada, 16 clientes por GPU, MuJoCo 3.2.3.

| Comparación | Control fijo | Contraste temporal | Diferencia |
|---|---:|---:|---:|
| view_large | 117/400 (29,25%) | 120/400 (30,00%) | +0,75 pp |
| yaw30 | 201/400 (50,25%) | 204/400 (51,00%) | +0,75 pp |
| ur5e | 167/400 (41,75%) | 168/400 (42,00%) | +0,25 pp |

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede aplicarlos a un modelo de política robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica requisitos de memoria.
- Como referencia objetiva: el repositorio ocupa 13,1 GB y el grafo de despliegue se restaura en BF16, por lo que el conjunto completo de pesos del repositorio en BF16 ronda ese orden de magnitud. Es una observación derivada del tamaño del repositorio, no una cifra confirmada por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan servidores de inferencia tipo vLLM, llama.cpp, Ollama o TGI. La librería declarada es `openpi` y el pipeline es `robotics`.
- Configuración de evaluación conocida: 16 clientes por GPU durante la pantalla de política, con MuJoCo 3.2.3 como simulador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables externos (por ejemplo, otras políticas de manipulación tipo OpenVLA o la propia familia π₀/π₀.₅) en la información proporcionada. La única comparación disponible es interna, entre las variantes de este piloto y sus controles fijos.

| Variante | Parámetros | Contexto | Rendimiento (400 rollouts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| view_large (temporal) | no disponible | no disponible | 120/400 (30,00%) | apache-2.0 | HuggingFace |
| yaw30 (temporal, este checkpoint) | no disponible | no disponible | 204/400 (51,00%) | apache-2.0 | HuggingFace |
| ur5e (temporal) | no disponible | no disponible | 168/400 (42,00%) | apache-2.0 | HuggingFace |
| Controles fijos equivalentes | no disponible | no disponible | 117/400, 201/400, 167/400 | no disponible | no disponible |

## Limitaciones y advertencias

- Resultados preliminares: el autor indica explícitamente que las pantallas únicas de 400 rollouts no establecen mejora general ni retención de conocimiento de manipulación, y que no se incluye confirmación de política a mayor escala.
- Efectos pequeños: las ganancias publicadas son de +0,75 y +0,25 puntos porcentuales, dentro del orden de magnitud del ruido esperable en pantallas de 400 episodios.
- Puerta de confianza heurística: el criterio que decide si cambia la asignación de multiplicadores es explícitamente una heurística, no un test estadístico calibrado.
- Estadístico y lote desalineados: el estadístico de diagnóstico usa la propuesta de lote del diagnóstico, no la del lote real de entrenamiento.
- Sin conjunto de sondeo reservado: el autor advierte que los sorteos independientes de optimizador y diagnóstico pueden solaparse y que los diagnósticos no son un conjunto de prueba reservado.
- Cómputo no comparable con el control: los 81 pasos hacia atrás adicionales de diagnóstico hacen que el cómputo hacia atrás difiera del control fijo, aunque las iniciales y los 1.000 sorteos del optimizador coinciden.
- Ruido de política no emparejado: los flujos estocásticos del servidor de política son compartidos, pero el ruido de política por episodio no está emparejado entre métodos.
- Ausencia de retroalimentación de tarea: el entrenamiento no usa observaciones de origen, recompensa de asignación ni señal de éxito de tarea, lo que limita el ajuste a la métrica final.
- Desbalance de módulos: al final del piloto el multiplicador de `expert` queda en 0,800278 y llegó a bajar a 0,687362, mientras que `vision` alcanza 1,231846; conviene vigilar ese desequilibrio.
- Sin validación comunitaria: el repositorio tiene 0 descargas y 0 likes.
- Idiomas y contexto de lenguaje: no disponibles, ya que el modelo no está documentado para tareas de texto.
- Licencia: apache-2.0 permite uso comercial, pero la licencia del dataset objetivo (`libero-dense-contact-sweep-d2-yaw30-20261003`) no se especifica en la información disponible y debe verificarse por separado.
- Riesgo de acciones erróneas: como política de control, un fallo se traduce en acciones físicas incorrectas; en la pantalla publicada los errores de rollout fueron cero, pero no se documentan pruebas de seguridad fuera de simulación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-b200-temporal-contrast-yaw30-1000-pilot-20261013
- Dataset objetivo: https://huggingface.co/Donghyun1228/libero-dense-contact-sweep-d2-yaw30-20261003 (revisión `7cfd3ca8528c59c1ce700d4d75b560db39f7a5e7`)
- Snapshot de entrenamiento/evaluación: `6da4916da7f7f769524b5c0bc8c0577fa92035ae`
- Snapshot de inferencia: `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo, su autor, `openpi` o el benchmark LIBERO.
