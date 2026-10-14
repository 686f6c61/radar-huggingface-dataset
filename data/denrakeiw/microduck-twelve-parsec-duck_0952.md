# DenRakEiw/microduck-twelve-parsec-duck_0952

## Resumen

microduck-twelve-parsec-duck_0952 es una política de control para robots, no un modelo de lenguaje. Se trata de un ajuste fino por estrategias evolutivas (evolution strategies) sobre el modelo DenRakEiw/microduck-twelve-parsec-duck_3000, orientado a maximizar la puntuación de sprint del entorno denominado Arena. El autor es el usuario de HuggingFace DenRakEiw y el modelo se publica dentro del ecosistema microduck, el robot bípedo de tipo pato desarrollado por Pollen Robotics.

El modelo se distribuye en formato ONNX y ocupa el slot `walk` del manifiesto de políticas del robot. Recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, con un comportamiento definido como perpetuo: la marcha se ejecuta de forma indefinida hasta que se le indique lo contrario. El normalizador de observaciones está integrado dentro del propio fichero `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo.

Su relevancia es acotada pero clara para el nicho de la robótica de bajo coste: demuestra un flujo de trabajo de refinamiento iterativo de políticas de locomoción mediante optimización evolutiva sobre un scorer concreto, publicado como artefacto reproducible en HuggingFace. No hay datos publicados de tamaño de parámetros, licencia ni idiomas, y el repositorio aparece con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control neuronal para robot; topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`; el normalizador va integrado) |
| Idiomas soportados | no aplicable (modelo de robótica, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) mas `manifest.json` con el esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot de politica | `walk` |
| Modelo base | DenRakEiw/microduck-twelve-parsec-duck_3000 (relacion: finetune) |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, tipo de capas o función de activación). Lo que sí se documenta es el procedimiento: se parte del modelo base twelve-parsec-duck_3000 y se aplica un ajuste fino mediante estrategias evolutivas, usando como función objetivo el scorer de sprint del entorno Arena. El resultado declarado es un corredor de sprint de 2 metros, lo que sitúa el objetivo de optimización en velocidad de desplazamiento más que en estabilidad o robustez general.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`. La política es perpetua: no tiene condición de parada interna y sigue ejecutando la marcha hasta que el daemon la sustituya. El normalizador de observaciones está embebido en el grafo ONNX, una decisión de empaquetado que reduce errores de integración al desplegar en robot. No se especifican el número de episodios, la composición del dataset, ni si hubo fases adicionales de refinamiento.

## Capacidades

- Locomoción bípeda tipo marcha para el robot microduck, optimizada para velocidad de sprint en una distancia de 2 metros.
- Política perpetua: mantiene la marcha de forma indefinida sin señal de terminación.
- Control en lazo cerrado a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Normalización de observaciones integrada en el propio artefacto ONNX, lo que permite alimentar observaciones en crudo.
- Integración directa con el daemon del robot mediante el comando `robotctl policy load walk`.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck (`manifest.json`), lo que facilita su carga por slot.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes: es exclusivamente una política motora.

## Casos de uso

- Demostración de locomoción rápida en microduck: cargar la política en el slot `walk` con `robotctl policy load walk DenRakEiw/microduck-twelve-parsec-duck_0952` para exhibir una marcha de sprint de 2 metros en ferias, aulas o vídeos de producto.
- Investigación en optimización evolutiva de políticas: sirve como punto de comparación frente al modelo base para medir cuánto aporta el ajuste fino por evolution strategies sobre un scorer concreto.
- Benchmark interno de controladores: al ser una política perpetua y determinista en su ventana de observación, es útil como carga de referencia para medir latencia del daemon y estabilidad del lazo a 50 Hz.
- Base para nuevos ajustes finos: al ser un remix del modelo `_3000`, puede emplearse como punto de partida para derivar políticas de otras tareas (por ejemplo `stand` o `sitstand`) mediante el mismo pipeline.
- Docencia en robótica de bajo coste: permite mostrar de forma tangible el ciclo completo observación-acción a 50 Hz sobre hardware accesible, sin necesidad de GPU.
- Pruebas de integración de despliegue ONNX: el normalizador embebido lo convierte en un caso práctico para validar pipelines que esperan grafos autocontenidos.
- Reproducción de experimentos: gracias a la referencia explícita de repositorio, rama y commit, otro grupo puede intentar replicar el resultado del sprint scorer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que el ajuste se realizó contra el scorer de sprint del entorno Arena y describe el resultado como un corredor de sprint de 2 metros, pero no se aportan cifras de velocidad, tiempo, distancia recorrida, tasa de caída ni comparación numérica con el modelo base o con otras políticas del mismo repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el repositorio completo ocupa 0.0 GB y la observación es de 61 dimensiones con 14 acciones, es razonable esperar que la inferencia sea viable en CPU, pero no hay cifras publicadas que lo confirmen.
- GPU recomendadas: no disponible. No se documenta ninguna GPU en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; por el perfil del modelo, lo esperable es ejecución en el propio ordenador de a bordo del robot o en un host sin acelerador dedicado. Se trata de una inferencia, no de un dato publicado.
- Opciones de despliegue: ONNX Runtime a través del daemon de microduck, invocado con `robotctl policy load walk`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato de temporización es la frecuencia de control de 50 Hz (periodo de 20 ms), que es el requisito del lazo, no una medición publicada del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DenRakEiw/microduck-twelve-parsec-duck_0952 | Politica de control (finetune por evolution strategies) | `walk` | no disponible | 61-D observacion, 14 acciones, 50 Hz | no disponible | HuggingFace, 0 descargas, 0 likes |
| DenRakEiw/microduck-twelve-parsec-duck_3000 | Politica de control (base) | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base declarado) |
| DenRakEiw/microduck-r2-duck2 | Politica de control para microduck | multi-slot segun model card (walk, stand, sitstand, ground_pick, kick_left, kick_right, roulade) | no disponible | no disponible | no disponible | HuggingFace |

La comparación cuantitativa de rendimiento entre estos modelos no es posible con la información disponible: none of the tres publica cifras de benchmark en los datos consultados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay documentación sobre sesgos, aunque en robótica el equivalente sería el sobreajuste a la distribución de observaciones del entorno de entrenamiento.
- Riesgo de sobreajuste al scorer: al haberse optimizado específicamente contra el sprint scorer de Arena, es esperable que el rendimiento se degrade en condiciones fuera de esa distribución (superficies distintas, batería baja, desgaste mecánico). Es una advertencia razonada, no un dato publicado.
- Alucinación: no aplicable en el sentido de generación de texto; el riesgo análogo es la ejecución de una marcha incorrecta ante entradas fuera de rango.
- Comportamiento perpetuo: la política no se detiene por sí sola, por lo que en producción es necesario un mecanismo externo de parada o sustitución de política.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido. Debe aclararse con el autor antes de cualquier despliegue comercial.
- Idioma y contexto: no aplicables. El modelo no procesa lenguaje ni texto.
- Trazabilidad limitada: no se especifican hiperparámetros, número de evaluaciones ni criterios de selección de la política final.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin evidencia pública de validación por terceros.
- Dependencia de plataforma: el despliegue está atado al daemon de microduck y al esquema 2 de su manifiesto de políticas.
- Fechas: el repositorio figura creado y actualizado el 2026-10-13, apenas cuatro segundos después de su creación, lo que sugiere una subida automatizada sin revisión posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-twelve-parsec-duck_0952
- Modelo base: https://huggingface.co/DenRakEiw/microduck-twelve-parsec-duck_3000
- Modelo comparable del mismo autor: https://huggingface.co/DenRakEiw/microduck-r2-duck2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado en la model card: `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`
- Ficha del robot en Robots Guide: https://robotsguide.com/robots/microduck
- Cobertura de prensa sobre el lanzamiento del robot: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Recursos y repositorios de MicroDuck: https://microduckrobot.org/resources/
