# DenRakEiw/microduck-c-3pduck_0852

## Resumen

`DenRakEiw/microduck-c-3pduck_0852` es una política de control por aprendizaje por refuerzo (RL) para el robot microduck de Pollen Robotics, publicada por el usuario DenRakEiw. No es un modelo de lenguaje: se trata de un controlador de locomoción que genera una marcha perpetua para la ranura `walk` del robot, con una observación de 61 dimensiones, 14 acciones de salida y una frecuencia de control de 50 Hz. El repositorio incluye `policy.onnx` (con el normalizador de observaciones integrado en el propio grafo) y un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

La política se presenta bajo el epígrafe "1.5 m Hill Climb": parte de una política propia en modo carrera (semilla "fade-hill" 3, 1.100 s), afinada mediante estrategias de evolución sobre el scorer de colinas de la Arena (0.860 s), congelada y envuelta en un wrapper de mesa de salida con contador de pasos, siguiendo la idea del modelo `jrubiosainz/microduck-game-hillclimber-remix2`. Los desplazamientos de inicio se aplican sobre las 14 articulaciones y el comando se buscó con CMA-ES sobre las semillas oficiales de colinas de la Arena.

Su relevancia es acotada y muy específica: es un artefacto de investigación en robótica y RL, reproducible sobre hardware microduck mediante el comando `robotctl policy load walk`, y con resultados declarados únicamente en simulación y en muestra (in-sample). El repositorio tiene 0 descargas y 0 likes, mide 0,0 GB y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada por RL; arquitectura de red no especificada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); espacio de observacion de 61 dimensiones y 14 acciones |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se mencionan cuantizaciones) |
| Idiomas soportados | no disponible (no aplica; salida de control motor, no texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |
| Frecuencia de control | 50 Hz |
| Ranura de politica | `microduck-slot:walk` (marcha perpetua) |
| Autor | DenRakEiw |
| Libreria | microduck |
| Tarea (pipeline) | robotics |
| Fecha de creacion | 2026-10-16 |
| Fecha de actualizacion | 2026-10-16 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se especifica en la información disponible la arquitectura concreta de la red (número de capas, tipo de capa, tamaño). Lo que sí se documenta es la interfaz: el modelo consume 61 valores de observación crudos (el normalizador está embebido en `policy.onnx`, por lo que no hay que preprocesar la observación) y produce 14 acciones, una por articulación, a 50 Hz. El comportamiento es "perpetuo": la política se ejecuta de forma continua hasta que se le indique lo contrario, sin condición de parada propia.

El entrenamiento combina dos fases según la model card. La primera es una política RL propia en modo carrera ("fade-hill", semilla 3) que registra 1.100 s en el scorer de colinas de la Arena. Sobre ella se aplicó un ajuste fino mediante estrategias de evolución (evolution strategies) usando directamente el scorer de colinas de la Arena como función de fitness, lo que bajó el tiempo a 0.860 s. El resultado se congeló y se envolvió en un wrapper de mesa de salida con contador de pasos, con desplazamientos de inicio sobre las 14 articulaciones; el comando del wrapper se buscó con CMA-ES sobre las semillas oficiales de colinas de la Arena. El wrapper sigue la idea atribuida a `jrubiosainz/microduck-game-hillclimber-remix2`. El repositorio de entrenamiento citado es `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `d6a27c4d1`. No se detalla la composición del dataset (al ser RL, la experiencia se genera por interacción con el simulador) ni el uso de RLHF o DPO.

## Capacidades

- Locomoción bípeda/multiactuada perpetua en el robot microduck dentro de la ranura `walk`, con salida continua a 50 Hz.
- Control de 14 articulaciones mediante 14 acciones, a partir de observaciones crudas de 61 dimensiones.
- Comportamiento de "marcha perpetua": no finaliza por sí solo, lo que simplifica su uso como habilidad base en tareas de locomoción de mayor duración.
- Ascenso de colinas de 1,5 m en el escenario de la Arena, según el ajuste declarado con el scorer de colinas.
- Salida de inicio controlada mediante wrapper con contador de pasos y desplazamientos de inicio por articulación.
- Integración con el ecosistema microduck: carga directa mediante `robotctl policy load walk`.
- No dispone de tool calling, function calling, capacidades de agente, multilingüismo, visión, audio ni modo de razonamiento; no es un modelo generativo de texto.
- Inferencia autocontenida en un único fichero ONNX con normalización de observaciones integrada.

## Casos de uso

- Control de marcha en el robot microduck: se carga en la ranura `walk` con `robotctl policy load walk DenRakEiw/microduck-c-3pduck_0852` y el robot ejecuta la marcha de forma continua, sin necesidad de reenviar comandos ni de preprocesar observaciones.
- Demostraciones de locomoción en ferias, aulas o vídeos: al ser una política perpetua y autocontenida en ONNX, un robot microduck puede mostrar una marcha estable sin infraestructura adicional de inferencia.
- Investigación en aprendizaje por refuerzo: sirve como línea base reproducible para comparar estrategias de ajuste fino (en este caso, evolution strategies sobre un scorer de tarea) frente a la política RL original de la que parte.
- Experimentos de escalada en pendiente: el ajuste se hizo sobre el scorer de colinas, por lo que es el candidato natural para pruebas de ascenso de colinas de 1,5 m en entornos de simulación con las semillas oficiales de la Arena.
- Evaluación de robustez de controladores: el wrapper de mesa de salida con desplazamientos por articulación permite estudiar la sensibilidad de la política a perturbaciones controladas en las condiciones iniciales.
- Competiciones o retos tipo Arena: al declarar tiempos de 1,100 s y 0,860 s en el scorer de colinas, la política puede usarse como participante o como referencia de puntuación en torneos de la comunidad microduck.
- Docencia de robótica y RL: el repositorio es pequeño (0,0 GB) y el artefacto desplegable es un único ONNX, lo que facilita ejercicios prácticos de despliegue de políticas en hardware real.
- Reutilización como inicialización para nuevas políticas: el autor documenta el commit y la rama de entrenamiento (`pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `d6a27c4d1`), lo que permite partir de este resultado para ajustes posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica declarada por el autor es el tiempo en el scorer de colinas de la Arena, que no es un benchmark estándar de la industria:

| Metrica declarada | Valor | Condiciones |
|---|---|---|
| Scorer de colinas de la Arena (politica RL inicial, fade-hill semilla 3) | 1,100 s | Simulacion |
| Scorer de colinas de la Arena (tras ajuste por evolution strategies) | 0,860 s | Simulacion, in-sample, semillas oficiales de colinas de la Arena |

Advertencia: el autor indica explícitamente que la búsqueda del comando se hizo "in-sample" y "simulation only", por lo que estos valores no deben interpretarse como rendimiento generalizable ni como evaluación en hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica tamaño de parámetros ni huella de memoria.
- GPU recomendadas: no disponible. No se especifica ninguna GPU para entrenamiento ni para inferencia.
- Encaje en GPU de consumo: no disponible como dato declarado. Cabe señalar que el artefacto es un único fichero ONNX para una política con observación de 61 dimensiones y 14 acciones ejecutándose a 50 Hz, un perfil de carga propio de inferencia en el propio robot o en CPU; el repositorio ocupa 0,0 GB.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto) y la herramienta del ecosistema microduck `robotctl` con el subcomando `policy load`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control exige 50 Hz, es decir, un paso de inferencia cada 20 ms; no se publican cifras de latencia real ni de throughput.
- Requisito de ejecución: microduck físico o su simulador, con el manifiesto `manifest.json` conforme al esquema 2 (`docs/policy-manifest.md` en el repositorio del daemon).

## Comparativa con modelos similares

No hay datos publicados suficientes para una comparación cuantitativa. Se identifica un artefacto relacionado, citado por el propio autor como origen de la idea del wrapper:

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DenRakEiw/microduck-c-3pduck_0852 | Politica RL de locomocion (microduck, ranura walk) | no disponible | no aplica (observacion 61-D, 14 acciones, 50 Hz) | 0,860 s en el scorer de colinas (simulacion, in-sample) | no disponible | Hugging Face, 0 descargas |
| jrubiosainz/microduck-game-hillclimber-remix2 | Politica RL de locomocion (microduck); referenciada como origen de la idea del wrapper | no disponible | no disponible | no disponible | no disponible | Referenciada en la model card; no se aportan datos |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas de locomocion para microduck o robots similares) en la documentación proporcionada.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial y la redistribución quedan en un limbo legal; conviene contactar con el autor antes de cualquier uso en producción.
- Los resultados declarados (1,100 s y 0,860 s) proceden de simulación y son in-sample: el comando del wrapper se buscó sobre las mismas semillas oficiales de la Arena usadas para evaluar, lo que implica riesgo de sobreajuste y de que el rendimiento no se traslade a condiciones no vistas.
- No hay evidencia publicada de funcionamiento en hardware real (simulation only según el autor); el comportamiento en el robot físico, con rozamientos, latencias y ruido de sensores, no está validado en la información disponible.
- El repositorio registra 0 descargas y 0 likes, sin historial de uso por terceros que permita contrastar la reproducibilidad del resultado.
- La política es perpetua y carece de condición de parada propia; cualquier integración debe gestionar externamente la detención del robot.
- La model card no documenta sesgos, tasa de fallo, ni degradación esperada en terrenos distintos de las colinas de 1,5 m del escenario evaluado.
- No hay información sobre composición del dataset, semillas de entrenamiento completas ni criterios de selección del checkpoint, lo que dificulta la reproducibilidad estricta.
- La fecha de creación del repositorio indicada por Hugging Face (2026-10-16) es posterior a la fecha actual, un dato anómalo que conviene verificar antes de citarlo.
- Al no ser un modelo de lenguaje, no aplican consideraciones de alucinación, sesgo lingüístico ni límites de contexto textual; los riesgos son de control físico (caídas, colisiones, esfuerzos excesivos en articulaciones) y deben mitigarse con límites de par y paradas de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-c-3pduck_0852
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado: `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `d6a27c4d1` (URL directa no disponible en la informacion proporcionada)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (URL directa no disponible en la informacion proporcionada)
- Política referenciada como origen de la idea del wrapper: `jrubiosainz/microduck-game-hillclimber-remix2` en Hugging Face (URL directa no verificada en la informacion proporcionada)
- Paper o blog técnico: no disponible
- Demo: no disponible
