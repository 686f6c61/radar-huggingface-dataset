# apertixai/cerno-4b-v1.2

## Resumen

Cerno 4B v1.2 es un modelo de decisión tipada (typed decisions) desarrollado por apertixai, afinado a partir de Qwen/Qwen3.5-4B. No es un modelo generativo al uso: recibe un estado (cualquier texto o JSON) y un conjunto de preguntas tipadas (opción múltiple con criterios explícitos, sí/no, escalas puntuadas) y devuelve, en un único forward pass y sin generar texto, una probabilidad calibrada para cada opción de cada pregunta. Está pensado como un componente "System One": decisiones rápidas, deterministas en formato y con probabilidades utilizables directamente en lógica de negocio.

La arquitectura parte del transformer de Qwen3.5-4B (4.205.751.296 parámetros) pero sustituye parte de la atención por atención de bloque bidireccional: dentro de cada bloque (el estado, o una pregunta con sus opciones) los tokens se atienden en ambas direcciones, y hacia los bloques anteriores de forma causal. Además aplica una técnica de "read twice" que repite la entrada (hasta 3.000 tokens) antes de responder. El modelo se sirve en transformers con pesos bf16, ya que la máscara de atención de bloque no es aplicable en vLLM.

Su relevancia actual está en la propuesta de evaluación: el Decision Index 0.3, una suite pública de 37 benchmarks y 140.178 peticiones, en la que Cerno 4B v1.2 obtiene un índice público de 65,05, frente a 57,60 de la versión 1.1. La familia incluye variantes de 9B y 27B, y el modelo se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B con atención de bloque bidireccional (block attention) y decodificación "read twice" |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; la entrada se lee dos veces con un límite de 3.000 tokens por lectura (`read_twice_tokens: 3000`) |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones para esta versión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), 8,4 GB de repositorio |

## Arquitectura y entrenamiento

El modelo se construye sobre el Qwen3.5-4B post-entrenado. La modificación principal es la atención de bloque: en las capas de atención completa, cada token atiende bidireccionalmente dentro de su bloque (el estado completo, o una pregunta junto con sus opciones) y de forma causal a los bloques precedentes. Esto permite empaquetar el estado y todas las preguntas en un único prompt y obtener todas las probabilidades en un solo forward pass, sin generación autoregresiva de texto. La máscara resultante no es compatible con vLLM, por lo que la inferencia se realiza sobre transformers con el código de `cerno-inference`.

El entrenamiento parte del modelo post-entrenado de Qwen (no de la versión Base, a diferencia de v1.1) y añade la atención bidireccional por bloques. La model card no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset, aunque menciona que algunas familias de benchmarks (HLE, BANKING77, CLINC150, HellaSwag) comparten particiones públicas de entrenamiento con los datos usados, lo que motiva las métricas Strict-OOD y Train-split-OOD. La calibración se realiza con una temperatura única de 1,236 ajustada sobre conjuntos de validación held-out ajenos a los benchmarks; es invariante al argmax, por lo que no altera la respuesta elegida, solo la escala de las probabilidades. La técnica "read twice" repite el estado y las preguntas antes de la respuesta y puede desactivarse con `--option read_twice_tokens=0`.

## Capacidades

- Clasificación y decisión tipada sobre texto o JSON: preguntas de opción múltiple con criterios explícitos, sí/no y escalas puntuadas, con hasta 255 opciones por pregunta.
- Salida de probabilidades calibradas por opción en un único forward pass, sin generación de texto.
- Razonamiento implícito de un solo paso ("System One"), orientado a latencia baja y formato de salida estable.
- Procesamiento de estados estructurados (JSON) y de texto libre como entrada.
- Evaluación multi-pregunta en una sola petición: el estado y todas las preguntas se empaquetan en un mismo prompt.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Moderación y clasificación de contenido: dado un texto y una pregunta tipada con categorías explícitas, el modelo devuelve la probabilidad de cada categoría en un solo paso, lo que permite fijar umbrales de decisión directamente sobre las probabilidades calibradas.
- Enrutamiento de tickets de soporte: con el texto del ticket como estado y preguntas de opción múltiple (tipo de incidencia, urgencia, área responsable), se obtiene una distribución de probabilidad por etiqueta que puede alimentar un sistema de asignación automática.
- Evaluación de respuestas en pipelines de QA: el modelo puede puntuar si una respuesta cumple criterios definidos (corrección, completitud, adherencia a la política) mediante preguntas sí/no o escalas, con probabilidades calibradas para agregar métricas.
- Extracción de decisiones sobre datos estructurados: al aceptar JSON como estado, encaja en flujos donde el estado es un registro de negocio y las preguntas determinan elegibilidad, riesgo o categoría.
- Clasificación de intenciones en asistentes conversacionales: preguntas de opción múltiple con criterios explícitos permiten mapear el turno del usuario a una intención con una probabilidad por clase, útil para decidir la siguiente acción del diálogo.
- Control de calidad en generación de datos sintéticos: verificar si un ejemplo cumple criterios de calidad mediante preguntas tipadas, aprovechando la calibración para filtrar por umbral en lugar de por argmax.
- Evaluación comparativa interna: usar el modelo como juez de criterios binarios o escalados en conjuntos de evaluación propios, con la ventaja de que la salida es una probabilidad y no texto libre que requiera parseo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (model-index y model card); no verificados de forma independiente.

| Métrica | Cerno 4B v1.2 | Cerno 4B v1.1 |
|---|---:|---:|
| Decision Index 0.3, índice público (suite completa: 37 benchmarks, 140.178 peticiones) | 65,05 | 57,60 |
| Strict-OOD | 63,21 | 54,31 |
| Train-split-OOD | 60,74 | 53,15 |
| Error de calibración (ECE estilo del board) | 6,3 pts | 5,8 pts |

Notas de lectura aportadas por el autor: Strict-OOD excluye HLE, BANKING77, CLINC150 y HellaSwag por compartir particiones públicas de entrenamiento; Train-split-OOD excluye todas las familias de benchmarks cuya partición pública de entrenamiento se usó; el ECE se calcula sobre una muestra de 1 de cada 6 de 34 benchmarks con igual peso por benchmark y a la temperatura publicada. El ruido entre ejecuciones del índice público es de aproximadamente 0,1-0,2 puntos. La puntuación Full del board (60% tests privados de las mismas habilidades y 40% tareas privadas de dominios nuevos) está pendiente para v1.2.

En la familia Cerno, el índice público comparativo es: 27B v1.0 con 65,19 (vLLM, FP8, temperatura 1,0), 9B v1.2 con 66,83 (transformers, bf16, temperatura 1,256) y 4B v1.2 con 65,05.

## Requisitos de hardware

- Pesos en bf16 de 8,4 GB; el autor indica que basta una GPU con 24 GB o más.
- GPU recomendadas: una H200 para las cifras de latencia publicadas; cualquier GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100) debería alojar los pesos en bf16, aunque no se publican latencias para esos modelos.
- Cabe en GPU de consumo con 24 GB de VRAM en bf16 según el requisito declarado; no se documentan cuantizaciones alternativas (GGUF, FP8) para esta versión.
- Despliegue: exclusivamente sobre transformers mediante el repositorio `cerno-inference` (con `requirements-v1.2.txt` y `third_party/decider`); vLLM no es compatible con la máscara de atención de bloque. La versión v1.1 (FP8, vLLM) permanece disponible en `apertixai/cerno-4b`.
- Latencia declarada: 61 ms de mediana y 208 ms de media por petición en una H200, una petición a la vez. No se publica throughput en lote.
- Configuración de inferencia en `decider_config.json`: `attention: block`, `read_twice_tokens: 3000`, `temperature: 1.236`.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Motor / pesos | Temperatura | Índice público | Licencia |
|---|---|---:|---|---:|---:|---|
| Cerno 4B v1.2 | Qwen3.5-4B | 4,2B | transformers, bf16 | 1,236 | 65,05 | Apache 2.0 |
| Cerno 9B v1.2 | Qwen3.5-9B | no disponible | transformers, bf16 | 1,256 | 66,83 | no disponible en la información |
| Cerno 27B v1.0 | Qwen3.8-27B | no disponible | vLLM, FP8 | 1,0 | 65,19 | no disponible en la información |
| Cerno 4B v1.1 | Qwen3.5-4B-Base | no disponible | vLLM, FP8 | 1,534 | 57,60 | no disponible en la información |

No se dispone de comparaciones con modelos de otras familias en la información proporcionada. La comparación más directa es interna a la familia Cerno: el 4B v1.2 supera al 4B v1.1 en 7,45 puntos de índice público, y queda a 1,78 puntos del 9B v1.2 con la mitad de parámetros aproximadamente.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre ni razonamiento encadenado; cualquier caso de uso que requiera explicaciones o generación queda fuera de su alcance.
- La atención de bloque impide el uso de vLLM en esta versión, lo que limita las opciones de despliegue de alto throughput y obliga a transformers.
- El índice público de 65,05 no es la puntuación de ranking del board; la puntuación Full de v1.2 está pendiente y los tests privados pueden diferir.
- Los resultados son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El error de calibración empeora ligeramente respecto a v1.1 (6,3 frente a 5,8 puntos ECE), por lo que los umbrales de probabilidad deben reajustarse si se migra desde la versión anterior.
- Riesgo de fuga de datos de evaluación: varias familias de benchmarks comparten particiones públicas de entrenamiento, de ahí las métricas Strict-OOD y Train-split-OOD; el índice público puede sobreestimar el rendimiento en dominios nuevos.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe más allá del que herede de Qwen3.5-4B.
- Sesgos conocidos: no documentados en la información proporcionada; al heredar el modelo base, es razonable esperar los sesgos de este, pero no hay datos concretos.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni cláusulas de uso aceptable específicas del autor.
- El límite práctico de entrada está ligado a la lectura doble de hasta 3.000 tokens; estados muy largos requerirían desactivar `read_twice_tokens`, con posible impacto en la calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apertixai/cerno-4b-v1.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cerno 27B: https://huggingface.co/apertixai/cerno-27b
- Cerno 9B v1.2: https://huggingface.co/apertixai/cerno-9b-v1.2
- Cerno 4B v1.1: https://huggingface.co/apertixai/cerno-4b
- Código de inferencia: https://github.com/apertixsk/cerno-inference
- Ejecuciones del Decision Index: https://huggingface.co/datasets/apertixai/cerno-decision-index
