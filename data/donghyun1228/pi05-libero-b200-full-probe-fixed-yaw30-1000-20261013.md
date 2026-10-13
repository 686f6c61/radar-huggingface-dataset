# Donghyun1228/pi05-libero-b200-full-probe-fixed-yaw30-1000-20261013

## Resumen

π₀.₅ full-probe fixed 1:1:1 yaw30 es un checkpoint de política robótica (vision-language-action) publicado por el usuario Donghyun1228 bajo la librería `openpi`. No es un modelo de lenguaje: es un experimento de *inverse dynamics model* (IDM) entrenado sobre el conjunto de tareas LIBERO, con el objetivo de predecir acciones de manipulación a partir de observaciones visuales. El checkpoint corresponde a un entrenamiento *target-only* de 1.000 actualizaciones de optimizador, con semilla 42 y semilla de muestreo 170013, exportado en el paso 999 sin EMA.

La relevancia de esta ficha es metodológica: el autor documenta de forma exhaustiva la receta de entrenamiento (elegibilidad de ventanas, muestreo *suite-balanced*, multiplicadores fijos por módulo, hashes de revisión de datasets y snapshots) y publica además una evaluación comparativa frente a una versión anterior. El resultado principal es 201/400 (50,25%) de éxito en una evaluación emparejada con semilla 7, con cuatro suites, diez tareas y diez estados iniciales oficiales por tarea.

El checkpoint forma parte de una familia de variantes del mismo autor (v1 fixed, full-probe, distintas configuraciones de *yaw*), lo que permite reproducir comparaciones controladas. El repositorio ocupa 13,1 GB e incluye activos de normalización, planes, diarios y registros del controlador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con tres modulos diferenciados: `vision`, `llm` y `expert` (experto de accion) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Horizonte de accion | ventanas nativas H10 (horizonte de 10 pasos) |
| Tipos de cuantizacion | entrenamiento en FP32 de hojas entrenables (43 hojas); exportacion y despliegue en BF16 (74 hojas) |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidades linguisticas declaradas) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible en la informacion (checkpoint de `openpi`, 13,1 GB de repositorio) |
| Pipeline declarado | robotics |
| Libreria | openpi |
| Tamano del repositorio | 13,1 GB |
| Semilla de entrenamiento | seed 42, draw seed 170013 |
| Actualizaciones de optimizador | 1.000 (exportacion en el paso 999, sin EMA) |

## Arquitectura y entrenamiento

El modelo se organiza en tres módulos con multiplicadores de peso independientes: `vision`, `llm` y `expert`. En esta ejecución los tres coeficientes permanecen fijos en 1/1/1 durante las 1.000 actualizaciones, con media, mínimo, máximo y valor final de 1,000000 en cada módulo. La receta numérica emplea 51 hojas nativas: 43 hojas entrenables en FP32 procedentes de la fuente original y 8 hojas congeladas; adicionalmente se añaden 23 hojas de muñeca (*source-wrist*) que solo intervienen en inferencia. En el despliegue, las 74 hojas se restauran en BF16.

El entrenamiento es un experimento de IDM *target-only* que no utiliza observaciones de la fuente original ni realimentación de éxito de política. El conjunto elegible abarca las 10 líneas de tareas de recolección por suite (40 en total), con 309.250 ventanas nativas H10. Los lotes del optimizador muestrean 8 ventanas por suite sin reemplazo en cada paso, lo que produce un balanceo por suite y no por tarea (B32). Los diagnósticos K4/B8 usan 8 líneas de entrenamiento distintas por suite repartidas entre los cuatro micro-lotes, con espacios de nombres RNG independientes entre optimizador y diagnóstico; se permite solapamiento de ventanas y líneas. No existe *holdout* de meta-sonda. La fórmula y los ajustes del controlador se mantienen sin cambios respecto a v1, y tanto la compensación de pose yaw30 como la rotación de acciones están activas. El dataset objetivo es `Donghyun1228/libero-dense-contact-sweep-d2-yaw30-20261003` en la revisión `7cfd3ca8528c59c1ce700d4d75b560db39f7a5e7`; el snapshot de entrenamiento/evaluación es `550531952e137a5b41d00d020f069828f5e74945` y el de inferencia `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`.

## Capacidades

- Generacion de acciones de manipulacion robotica a partir de observaciones visuales, en el marco del benchmark LIBERO.
- Modelado de dinamica inversa (IDM): inferencia de la accion a partir del estado observado.
- Ejecucion de politicas de horizonte corto: ventanas nativas H10 (10 pasos).
- Manipulacion con contacto denso, segun la denominacion del dataset objetivo (*dense-contact-sweep*).
- Compensacion de pose y rotacion de acciones para la configuracion yaw30.
- Despliegue en simulacion MuJoCo 3.2.3, con 16 clientes por GPU en la evaluacion publicada.
- No se documentan capacidades de generacion de texto, codigo, matematicas, *tool calling*, agentes, multimodalidad general ni soporte multilingue.

## Casos de uso

- Evaluacion reproducible de politicas en LIBERO: el checkpoint incluye semilla, revisiones de dataset y snapshots concretos, por lo que puede reutilizarse como punto de comparacion fijo en estudios de reproducibilidad.
- Investigacion en modelos de dinamica inversa: sirve como referencia de un entrenamiento IDM *target-only* de 1.000 pasos para medir el efecto de distintas recetas de muestreo (por ejemplo, balanceo por suite frente a balanceo por tarea).
- Manipulacion robotica con contacto denso: el dataset objetivo (*dense-contact-sweep*) y la configuracion yaw30 lo orientan a tareas de barrido y contacto sostenido en simulacion.
- Despliegue en simulacion con MuJoCo: la evaluacion publicada usa MuJoCo 3.2.3 y 16 clientes por GPU, lo que permite planificar cargas de evaluacion en paralelo.
- Pruebas de inferencia en BF16: el checkpoint se restaura en BF16 con 74 hojas, lo que facilita medir coste y latencia en hardware de gama alta sin reentrenar.
- Base para *fine-tuning* en tareas propias de manipulacion: al ser un IDM con licencia apache-2.0, puede partirse de el para adaptar la politica a un nuevo conjunto de tareas.
- Auditoria de artefactos de entrenamiento: el repositorio incluye activos de normalizacion, planes, diarios y registros del controlador, utiles para verificar pipelines antes de produccion.
- Comparacion de variantes de la familia: al existir resultados publicados frente a v1 fixed en view_large, yaw30 y ur5e, permite analizar el intercambio entre configuraciones.

## Benchmarks y rendimiento

Evaluacion de politica emparejada con semilla 7: cuatro suites x diez tareas x diez estados iniciales oficiales (400 evaluaciones), 0 errores de rollout y limpieza de procesos verificada.

| Metrica | Resultado |
|---|---|
| Exito global (semilla 7) | 201/400 (50,25%) |
| Entorno de evaluacion | MuJoCo 3.2.3, 16 clientes por GPU |
| Errores de rollout | 0 |

Comparacion full-probe frente a v1 fixed (misma base de evaluacion, 400 episodios por configuracion):

| Suite | v1 fixed | full-probe | Diferencia |
|---|---:|---:|---:|
| view_large | 104/400 | 117/400 | +3,25 pp |
| yaw30 | 215/400 | 201/400 | -3,50 pp |
| ur5e | 164/400 | 167/400 | +0,75 pp |

El autor indica de forma explicita que estas cribas de 400 episodios no establecen una mejora general, ni retencion, ni sustitucion del mejor baseline, y que no se incluye confirmacion de politica a mayor escala. Los hashes de inicializacion (51), la receta numerica y 11 archivos fuente numericos principales son identicos entre ambas configuraciones; lo que cambia es la elegibilidad del conjunto de entrenamiento. Los flujos estocasticos compartidos del servidor de politica no coinciden episodio a episodio con el ruido de politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 13,1 GB y el despliegue se realiza en BF16 sobre 74 hojas; el peso efectivo en memoria es inferior al tamano total del repositorio, que incluye otros artefactos.
- GPU recomendadas: no disponible en la informacion. La evaluacion publicada se ejecuto con 16 clientes por GPU, sin especificar el modelo de GPU utilizado.
- Encaje en GPU de consumo: no confirmado. Dado que el despliegue es en BF16 y el checkpoint se exporta sin EMA, es plausible en GPUs de consumo con suficiente VRAM, pero no hay dato publicado que lo confirme.
- Opciones de despliegue: libreria `openpi` (declarada en el repositorio). No se documentan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de politica robotica.
- Simulador: MuJoCo 3.2.3 en la evaluacion publicada.
- Paralelismo: 16 clientes por GPU, con limpieza de procesos verificada y cero errores de rollout.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de la misma categoria en los datos proporcionados. La unica comparacion publicada es interna, frente a la variante v1 fixed del mismo autor:

| Aspecto | full-probe fixed 1:1:1 yaw30 | v1 fixed |
|---|---|---|
| Actualizaciones de optimizador | 1.000 | no disponible |
| Multiplicadores vision/llm/expert | 1/1/1 fijos | no disponible |
| view_large (exito) | 117/400 | 104/400 |
| yaw30 (exito) | 201/400 | 215/400 |
| ur5e (exito) | 167/400 | 164/400 |
| Licencia | apache-2.0 | apache-2.0 (misma familia) |

Comparacion con modelos externos: no disponible.

## Limitaciones y advertencias

- El propio autor advierte que las cribas de 400 episodios no demuestran una mejora general, ni retencion, ni que esta variante sustituya al mejor baseline.
- No se incluye confirmacion de politica a mayor escala; cualquier conclusion debe tratarse como preliminar.
- El balanceo de lotes es por suite, no por tarea, lo que puede introducir desequilibrios entre tareas dentro de una misma suite.
- No existe *holdout* de meta-sonda, y se permite solapamiento de ventanas y lineas de entrenamiento, lo que limita la separacion estricta entre ajuste y diagnostico.
- Los flujos estocasticos compartidos del servidor de politica no coinciden episodio a episodio con el ruido de politica, lo que complica la comparacion exacta entre ejecuciones.
- El modelo no incorpora observaciones de la fuente original ni realimentacion de exito de politica, lo que restringe su comportamiento a la distribucion del dataset objetivo.
- Idiomas soportados: no disponible; no se declaran capacidades linguisticas ni multilingues.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; no obstante, al tratarse de una politica robotica, el fallo se manifiesta como acciones incorrectas en el entorno fisico o simulado.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El repositorio es una instantanea de investigacion con hashes concretos de dataset y snapshot: cambios de revision pueden invalidar la reproducibilidad.
- Fechas de creacion y actualizacion declaradas: 2026-10-12 y 2026-10-12 respectivamente (se reproducen tal cual figuran en la ficha de origen).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-b200-full-probe-fixed-yaw30-1000-20261013
- Dataset objetivo citado en la model card: `Donghyun1228/libero-dense-contact-sweep-d2-yaw30-20261003` (revision `7cfd3ca8528c59c1ce700d4d75b560db39f7a5e7`), sin URL directa en la informacion disponible.
- Hashes de snapshot de entrenamiento/evaluacion (`550531952e137a5b41d00d020f069828f5e74945`) e inferencia (`0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`), sin URL asociada en la informacion disponible.
- Libreria `openpi`: referenciada en la model card, sin URL en la informacion disponible.
- La busqueda web realizada no ha devuelto resultados tecnicos relevantes sobre este modelo; los enlaces encontrados no guardan relacion con la robotica ni con `openpi` y se omiten por no ser fuentes validas.
- Papers, blogs, repositorios y demos adicionales: no disponibles.
