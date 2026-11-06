# baya1116/charlm-agent

## Resumen

charlm-agent es un modelo de lenguaje a nivel de carácter de 52,6 millones de parámetros (16 capas, anchura 512, contexto de 4096 caracteres, vocabulario de 100 caracteres) desarrollado por el usuario baya1116 y publicado en Hugging Face. Resuelve dos tareas concretas en el ámbito de la IA para videojuegos: mantener conversaciones cortas asumiendo un personaje definido por una ficha breve (rol de NPC) y seleccionar acciones en un bucle de juego a partir de un objetivo, un estado y un conjunto de operaciones disponibles, devolviendo la acción elegida mediante una etiqueta.

Su relevancia radica en que funciona íntegramente en CPU: la versión cuantizada a 4 bits ocupa 33 MB y la versión completa 210 MB por carpeta de pesos, lo que permite integrar NPC con memoria y toma de decisiones básica en entornos sin GPU. El repositorio incluye varias generaciones (`agent14`, `agent13b`, `agent12a`, `agent11`, `agent6`, `npc4`, `base`), donde `agent14` es la versión recomendada por el autor y `base` es el modelo preentrenado sin ajuste fino.

El modelo se distribuye en formato PyTorch (`.pt`) y requiere scripts propios (`charlm_run.py`, `charlm_fold.py`) en lugar de integrarse en pipelines estándar de Hugging Face. Está etiquetado únicamente para inglés y no declara licencia en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only a nivel de carácter (16 capas, anchura 512) |
| Parametros totales | 52,6 M (52.600.000) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 caracteres |
| Tipos de cuantizacion | FP32/FP16 (versión normal, 210 MB) y 4 bits (33 MB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); no se publican safetensors ni GGUF pese a la etiqueta `safetensors` |
| Vocabulario | 100 caracteres (tokenización a nivel de carácter) |
| Tamaño del repositorio | 2,7 GB (incluye todas las carpetas de versiones) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas y anchura 512 que opera sobre caracteres individuales, con un vocabulario de 100 caracteres y una ventana de contexto de 4096 caracteres. La fase de preentrenamiento (`base/`) se realizó sobre 6300 millones de caracteres procedentes de WikiText-103 y FineWeb-Edu.

El ajuste fino se organiza en tres etapas documentadas: primero conversación (`npc4/`) con SmolTalk, SODA (diálogos con ficha de personaje) y datos de conversación de NPC y de orientación generados con Qwen3.5/3.6; después selección de acciones (`agent6/`) con diálogos de consecución de objetivos generados por reglas, con traza de razonamiento, mezclados al 50 % con conversación; y finalmente refinamientos sucesivos (`agent11`, `agent12a`, `agent13b`, `agent14`) basados en autogeneración filtrada y puntuación automática. En concreto, `agent14` parte de `agent13b`, que generó seis respuestas para 3821 escenarios nuevos; un evaluador puntuó las 22 920 respuestas y solo se reentrenó con las 2982 mejores en "atractivo 2 / interpretación 2". No se documenta uso de RLHF ni DPO.

La innovación principal es el formato de interacción para selección de acciones: el juego envía `GOAL` (condición con comparadores y hasta dos objetivos unidos por `and`), `OPS` (operaciones con nombre libre, efectos sobre variables y precondiciones `needs`) y `STATE` (valores actuales), y el modelo devuelve una traza entre llaves seguida de la etiqueta `<nombre>` de la operación a ejecutar, o `<none>` si el objetivo ya se cumple.

## Capacidades

- Generación de texto conversacional breve a nivel de carácter, en inglés, adoptando un personaje descrito en una ficha corta.
- Selección de acciones en bucle de juego: interpreta objetivos, operaciones con precondiciones y estado, y devuelve la operación a ejecutar con una traza de razonamiento intermedia.
- Generalización a nombres de operaciones no vistos durante el entrenamiento.
- Manejo de objetivos compuestos (hasta dos condiciones unidas por `and`) y de operaciones con requisitos previos.
- Respuestas sobre hechos sencillos del personaje o del entorno (nombre, horario de una tienda) con una tasa de acierto declarada del 88 % en el conjunto de prueba del autor.
- No dispone de tool calling, function calling genérico, capacidades de agente multi-paso fuera del formato GOAL/OPS/STATE, visión, audio ni modo de razonamiento extendido.
- Multilingüismo limitado al inglés; no se declaran capacidades en otros idiomas.

## Casos de uso

- NPC conversacionales en videojuegos ligeros: el modelo responde en CPU con 33 MB en 4 bits, por lo que puede ejecutarse en el propio cliente o en servidores modestos para dar diálogo con personalidad a personajes secundarios sin coste de GPU.
- Simulación de vida de aldeanos: el autor documenta `village.py`, una simulación con tres aldeanos que comparten mercado, donde el modelo resolvió 48 decisiones en 4 días sin que el juego rechazara ninguna acción y con aumento de dinero para todos los personajes.
- Sistemas de objetivos descompuestos: al recibir un objetivo cada vez, el modelo elige la operación adecuada en cadenas de dos pasos (por ejemplo, cumplir una precondición antes de ejecutar la acción final), con una tasa declarada del 82-84 % en el nivel 3 de su benchmark.
- Prototipado rápido de mecánicas de agente: al requerir solo PyTorch y dos scripts, sirve para validar bucles de decisión y formatos de observación-acción antes de invertir en modelos mayores.
- Filtrado y aumento de datos de diálogo: la metodología de autogeneración con puntuación automática descrita puede replicarse para generar y seleccionar corpus de NPC a bajo coste.
- Educación y demostraciones de modelos de lenguaje a nivel de carácter: su tamaño reducido permite inspeccionar el entrenamiento y la inferencia completos en hardware de consumo.
- Asistente de orientación dentro de un juego: el autor incluye datos de "案内" (guía) y reporta un error de predicción por carácter de 0,928 en esa categoría, lo que lo hace apto para respuestas de ayuda acotadas.

## Benchmarks y rendimiento

Datos declarados por el autor para `agent14` en cuantización de 4 bits. La selección de acciones se mide como porcentaje de objetivos alcanzados con nombres de operaciones no vistos, sobre 100 preguntas por nivel, con el objetivo en primera posición o con orden aleatorio.

| Nivel | Contenido | Objetivo primero | Orden aleatorio |
|---|---|---|---|
| 1 | Un objetivo | 99 % | 100 % |
| 2 | Operaciones irrelevantes y precondiciones mezcladas | 96 % | 94 % |
| 3 | Cumplir precondición antes de usar (2 pasos) | 84 % | 82 % |
| 4 | Dos objetivos sin romper uno de ellos | 83 % | 74 % |

Prueba de residentes (128 personajes de 3 tipos de juego, ajustes no vistos, 1544 preguntas, evaluador Qwen3.5-4B):

| Métrica | agent14 | agent13b | agent12a |
|---|---|---|---|
| Respuestas "utilizables" | 91 % | no disponible | no disponible |
| Respuestas "utilizables" en preguntas de charla (1152) | 93,5 % | no disponible | no disponible |
| Atractivo (sobre 2) | 1,62 | 1,52 | no disponible |
| Acierto en hechos | 88 % | 85 % | 80 % |
| Sin violaciones de reglas | 97,4 % | no disponible | no disponible |
| Reacción a regalos no deseados | 49 % | 69 % | no disponible |

Error de predicción por carácter (4 bits, menor es mejor): conversación cotidiana 0,847; NPC 0,749; orientación 0,928; residentes 1,092 (similar a `agent13b`). Acierto en hechos por género: estilo juego de amistad 93 %, fantasía oscura 60 %. El autor advierte que dos evaluaciones de los mismos pesos varían ±8 puntos en acierto de hechos y ±0,01 en atractivo.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en 4 bits (33 MB de pesos más estados de inferencia y caché de contexto de hasta 4096 caracteres); en torno a 1 GB para la versión normal de 210 MB.
- Funciona en CPU sin GPU, que es el escenario principal declarado por el autor.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en dispositivos de baja memoria; no se requieren A100 ni H100.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa; requiere PyTorch y los scripts `charlm_run.py` y `charlm_fold.py` proporcionados por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con otros modelos de la misma categoría. Se indica a continuación lo que puede contrastarse con alternativas genéricas de pequeño tamaño, marcando los datos no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| charlm-agent (agent14) | 52,6 M | 4096 caracteres | no disponible | PyTorch `.pt` | Nivel de carácter, CPU, tareas de NPC y selección de acciones |
| Modelos tipo SmolLM2-135M | 135 M | no contrastado aquí | no disponible en esta ficha | safetensors/GGUF | No evaluado con los mismos benchmarks |
| Modelos tipo Qwen2.5-0.5B | 0,5 B | no contrastado aquí | no disponible en esta ficha | safetensors/GGUF | No evaluado con los mismos benchmarks |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Modelo de 52,6 M de parámetros: falla en preguntas abiertas de consejo y en respuestas largas, donde pierde coherencia.
- En fantasía oscura recuerda mal el nombre que acaba de declarar (60 % de acierto en hechos frente a 93 % en estilo juego de amistad).
- La reacción a regalos no deseados baja al 49 % en `agent14` frente al 69 % de `agent13b`; el autor recomienda esta última versión si ese caso importa.
- En selección de acciones persisten errores en planes de tres o más pasos, en la lectura de qué variable afecta cada operación y en la comparación de magnitudes.
- El autor recomienda pasar las respuestas por `talk_rules.py` (GitHub) para descartar las malformadas y estabilizar la salida.
- La varianza de evaluación es alta: ±8 puntos en acierto de hechos al repetir la evaluación con los mismos pesos.
- Solo inglés; no se declara soporte de otros idiomas.
- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- El repositorio incluye datos derivados de Qwen3.5/3.6 (Apache 2.0), WikiText-103 (CC BY-SA), FineWeb-Edu (ODC-By), SmolTalk (Apache 2.0) y SODA (CC BY 4.0); conviene verificar el cumplimiento de esas condiciones en una redistribución.
- Riesgo de alucinación en hechos del personaje y del entorno, atenuado pero no eliminado en `agent14`.
- No es un modelo de propósito general: no soporta tool calling estándar, agentes multi-paso genéricos ni integración con ecosistemas de inferencia habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baya1116/charlm-agent
- Repositorio GitHub con `talk_rules.py`: mencionado en la model card como "GitHub"; URL no disponible en la información proporcionada.
- Scripts `charlm_run.py` y `charlm_fold.py`: referenciados en la model card; URL no disponible.
- Ejemplo `village.py`: referenciado en la model card; URL no disponible.
- Paper, blog o demo: no disponibles en la información proporcionada.
