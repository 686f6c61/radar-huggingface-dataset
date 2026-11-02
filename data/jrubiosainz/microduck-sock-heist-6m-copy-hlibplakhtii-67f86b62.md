# jrubiosainz/microduck-sock-heist-6m-copy-hlibplakhtii-67f86b62

## Resumen

`microduck-sock-heist-6m-copy-hlibplakhtii-67f86b62` es una republicación sin modificaciones de una política robótica en formato ONNX entrenada para la competición Microduck Arena 6 m Sock Heist, un entorno de simulación de control motriz organizado por Pollen Robotics. El autor de la copia es el usuario de Hugging Face jrubiosainz, pero el modelo original fue desarrollado por HlibPlakhtii y deriva, a su vez, de un fine-tune de `rumezhak/microduck-sock-heist-second-green-v2`, que a su vez se apoya en componentes de `a1rb4Ck/microduck-heist` bajo licencia Apache 2.0.

No se trata de un modelo de lenguaje ni de un modelo fundacional de propósito general: es una política de control (policy) que mapea observaciones de 61 entradas a 14 acciones motoras a 50 Hz, empaquetada como grafo ONNX de 1.294.031 bytes. Su relevancia es acotada y experimental: sirve como referencia reproducible de una estrategia concreta en un benchmark de robótica simulado, y como ejemplo de práctica de atribución y republicación en el ecosistema Hugging Face.

La copia no añade entrenamiento, fine-tune ni evaluación propia. El resultado declarado (5,051 s de media con 5/5 semillas completadas) es el heredado de la ejecución oficial en la Arena del modelo fuente, y solo la evaluación que realice la propia Arena sobre esta entrada tiene validez oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico, exportada como grafo ONNX (arquitectura interna no detallada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; interfaz de 61 observaciones de entrada y 14 acciones de salida a 50 Hz |
| Tipos de cuantizacion | no disponible (pesos en ONNX, sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de control, no lingüístico) |
| Licencia | no declarada por el autor original; la copia invoca los términos de contenido público de Hugging Face y conserva las partes Apache 2.0 de `a1rb4Ck/microduck-heist` |
| Formato de pesos | ONNX (`policy.onnx`, 1.294.031 bytes, sha256 `919b677c1472633ca0ae91c154174893eeb1772772e3019aee5cc2a7f665b671`) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, dimensiones ocultas, tipo de bloques). Lo que sí se especifica es la interfaz: 61 entradas de observación, 14 salidas de acción motora y una frecuencia de control de 50 Hz. El grafo se distribuye como `policy.onnx` y se ejecuta con ONNX Runtime 1.24.4 sobre el simulador MuJoCo 3.10.0 en el entorno de la Arena (runner v5, revisión del evaluador `f6072612b0e40ac613272f88818575b997e820b0`).

El entrenamiento original no fue realizado por el autor de esta copia ni por el autor del modelo fuente inmediato. Según la model card de origen, la política hereda la red de `rumezhak/microduck-sock-heist-second-green-v2` y aplica una búsqueda local acotada que modifica únicamente el tramo final de la semilla oficial 1: se reducen objetivos saturados redundantes verificando fuerzas motoras idénticas, y se aplica un desplazamiento de +0,1 rad al objetivo de pitch de cadera izquierda (acción 2) desde la llamada de acción 260 hasta el final. El grafo heredado se conserva detrás de una tabla de búsqueda exacta sobre las primeras 48 observaciones con tolerancia 1e-7; las observaciones no coincidentes caen en el grafo base. Se documentan 168 ensayos de búsqueda y se incluyen los scripts de reproducción (`probe_sock_finish.py`).

## Capacidades

- Control motor simulado a 50 Hz con interfaz fija de 61 observaciones de entrada y 14 acciones de salida.
- Ejecución de una estrategia específica de carrera de 6 metros ("Sock Heist") con arranque inicial, frenado durante el turno del gigante, parada vigilada y segundo arranque.
- Reproducción determinista de cinco semillas oficiales declaradas (s1 4,885 s; s2 5,390 s; s3 4,935 s; s4 5,000 s; s5 5,045 s) a velocidad comandada de 0,20 m/s.
- Mecanismo de lookup exacto sobre las primeras 48 observaciones para forzar la trayectoria verificada de la semilla 1, con fallback al grafo base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de resultados en la Microduck Arena: la entrada permite a terceros verificar que el resultado de la Arena sobre estos bytes coincide con el de la ejecución original `01M6E0W9P3MZ3QM1N53ZBY`, al ser idénticos evento, semillas, velocidad comandada y versión de runner.
- Estudio de atribución y linaje de modelos: el repositorio documenta cadena de procedencia (HlibPlakhtii → rumezhak → a1rb4Ck), revisiones concretas y hashes, útil como plantilla de buenas prácticas de republicación.
- Referencia de baseline en robótica simulada: sirve como punto de comparación (5,051 s de media) para nuevas políticas que compitan en el mismo evento con el mismo runner.
- Docencia sobre políticas de control en ONNX: el par entrada/salida (61→14 a 50 Hz) y el tamaño reducido del grafo permiten usarlo como ejemplo didáctico de despliegue de políticas en ONNX Runtime.
- Auditoría de técnicas de búsqueda local: los 168 ensayos y los scripts incluidos permiten estudiar cómo una modificación puntual de una acción mejora una semilla concreta sin alterar el resto.
- Integración en pipelines de evaluación automatizada: al ser un artefacto ONNX pequeño y determinista, encaja en pruebas de regresión del entorno MuJoCo 3.10.0 con versiones de dependencias fijadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Puntuación media en Arena (5 semillas) | 5,051 s |
| Semilla 1 | 4,885 s |
| Semilla 2 | 5,390 s |
| Semilla 3 | 4,935 s |
| Semilla 4 | 5,000 s |
| Semilla 5 | 5,045 s |
| Semillas completadas | 5/5 |
| Baseline declarado | 5,052 s |
| Velocidad comandada | 0,20 m/s |
| Runner / evaluador | v5 / `f6072612b0e40ac613272f88818575b997e820b0` |
| Entorno | MuJoCo 3.10.0, ONNX Runtime 1.24.4 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el grafo ONNX ocupa 1.294.031 bytes (aproximadamente 1,3 MB), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la información disponible; cualquier GPU compatible con ONNX Runtime sirve, e incluso la inferencia en CPU es viable dado el tamaño y la frecuencia de 50 Hz.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 4090, RTX 3060, etc.), y previsiblemente en hardware embebido.
- Opciones de despliegue: ONNX Runtime (versión fijada 1.24.4 para reproducibilidad); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles; el requisito del entorno es sostener 50 Hz de control, pero no se publican mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / interfaz | Rendimiento Arena | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`jrubiosainz/microduck-sock-heist-6m-copy-...`) | no disponible | 61→14 a 50 Hz | 5,051 s (heredado) | no declarada; partes Apache 2.0 | Hugging Face |
| `HlibPlakhtii/microduck-sock-heist-quicksilver-v1` | no disponible | 61→14 a 50 Hz | 5,051 s (oficial) | no declarada | Hugging Face |
| `rumezhak/microduck-sock-heist-second-green-v2` | no disponible | 61→14 a 50 Hz | no disponible en la información | no declarada | Hugging Face |
| `a1rb4Ck/microduck-heist` | no disponible | no disponible | no disponible en la información | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- La copia no ha sido entrenada, ajustada ni evaluada por su autor; el resultado de 5,051 s es heredado y solo la evaluación de la propia Arena sobre esta entrada es autoritativa.
- El modelo fuente no declara licencia; la copia se ampara en los términos de contenido público de Hugging Face y no relicencia el artefacto. El uso fuera de la plataforma queda sujeto a la voluntad de los autores originales.
- El repositorio en su conjunto no está etiquetado como Apache 2.0; solo las partes procedentes de `a1rb4Ck/microduck-heist` conservan esa licencia y sus avisos.
- La estrategia está optimizada para cinco semillas declaradas en un simulador concreto (MuJoCo 3.10.0, runner v5); no hay ninguna garantía de generalización a semillas no vistas ni a un robot real.
- El mecanismo de lookup exacto con tolerancia 1e-7 sobre las primeras 48 observaciones puede degradar el comportamiento si las observaciones difieren ligeramente del entorno de referencia.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el artefacto no es un modelo generativo de texto.
- Para reproducir resultados es imprescindible fijar las versiones exactas de dependencias (ONNX Runtime 1.24.4, MuJoCo 3.10.0) y la revisión del evaluador; cambios en el entorno invalidan la comparación.
- El autor de la copia se compromete a retirarla si el autor original presenta objeción, lo que introduce un riesgo de disponibilidad para dependencias en producción.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-copy-hlibplakhtii-67f86b62
- Modelo fuente: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-quicksilver-v1
- Revisión concreta del fuente: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-quicksilver-v1/tree/67f86b622d92e77a1cb1e9937d99e32d3f59a2e7
- Modelo base declarado: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2
- Revisión del modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2/tree/73589ead9485546120bd47f635f15b4cff6fafdb
- Componente Apache 2.0: https://huggingface.co/a1rb4Ck/microduck-heist
- Ejecución oficial en la Arena: https://pollen-robotics-microduck-arena.hf.space/api/runs/01M6E0W9P3MZ3QM1N53ZBY
- Microduck Arena (Pollen Robotics): https://pollen-robotics-microduck-arena.hf.space
