# binhpham/reachy-mini-motion-planner-0.8b

## Resumen

El modelo reachy-mini-motion-planner-0.8b es un planificador de texto a movimiento (text-to-motion) desarrollado por el usuario binhpham para el robot humanoide de sobremesa Reachy Mini, fabricado por Pollen Robotics. Se trata de un ajuste fino por LoRA del modelo base Qwen/Qwen3.5-0.8B, cuyo propósito no es conversar, sino transformar una instrucción breve en lenguaje natural (por ejemplo, "sneezing. You build up and then sneeze loudly.") en una receta de movimiento estructurada, que después un generador de flow-matching convierte en una trayectoria de 9 grados de libertad a 25 Hz lista para reproducirse en el robot.

La relevancia de este modelo radica en que empaqueta todo el pipeline de generación de movimiento en un único bundle servible: el planificador (0.8B ajustado con LoRA r=32), un generador de flow-matching de 21,8M de parámetros entrenado solo con movimientos reales de Reachy Mini, y un fichero `serve.json` con la configuración de servicio optimizada (FP8, borradores MTP, 8 pasos de flow-matching, expansión del plan a 2 Hz). El planificador incorpora además la cabeza MTP (multi-token prediction) del modelo base, reajustada sobre las propias salidas del planner para acelerar la decodificación especulativa sin alterar los resultados.

El modelo es la variante más pequeña y rápida de una familia de tres planificadores (0.8B, 4B y 27B), pensada para ejecutarse como el nivel `effort: "low"`. Su ventana de contexto, idiomas soportados y número exacto de parámetros del planner no se detallan en la información disponible; el tamaño del repositorio es de 1,9 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen/Qwen3.5-0.8B) con LoRA r=32 fusionado; bundle con generador flow-matching de 21,8M parametros |
| Parametros totales | Aproximadamente 0.8B (modelo base Qwen/Qwen3.5-0.8B); generador de movimiento: 21,8M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (configuracion de servicio indicada en serve.json); no se detallan otras |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (planner) y PyTorch (`generator.pt`) |

## Arquitectura y entrenamiento

El planificador es un transformer decoder-only basado en Qwen/Qwen3.5-0.8B, ajustado mediante LoRA con rango 32 sobre las proyecciones de atención y MLP, con la pérdida calculada únicamente sobre la respuesta. Se seleccionó el mejor checkpoint por pérdida en un conjunto retenido. Posteriormente, la cabeza MTP (multi-token prediction) del modelo base se reajustó sobre las salidas del propio planificador, lo que acelera la decodificación especulativa sin modificar los outputs. El bundle incluye, además, un transformer de flow-matching de 21,8M de parámetros que traduce el plan (receta) a una trayectoria de 9 grados de libertad a 25 Hz, entrenado exclusivamente con movimiento real de Reachy Mini.

Los datos de entrenamiento constan de 5.872 filas de profesor: recetas escritas a mano por Claude, eventos de acumulación y liberación (multiplicados por 3), 287 semillas y 5.000 escenarios generados por Astra y reescritos con un estilo más vivo por Codex (gpt-6-astra). Cada prompt se entrena también como su palabra aislada y como su frase completa. Las filas próximas a cualquier prompt de evaluación se eliminan mediante un filtro de embeddings y una lista negra de palabras clave para las pruebas fuera de distribución. El dataset se publica como binhpham/reachy-mini-massive-motion-library. El prompt de sistema es compacto e incluye unidades, gramática de la receta, cuatro reglas de movimiento y tres ejemplos; la respuesta esperada tiene el formato `{"idea", "recipe"}` con el modo thinking desactivado, y se recomienda permitir al menos 400 tokens de salida.

## Capacidades

- Generación de recetas de movimiento a partir de prompts de texto en lenguaje natural, con salida estructurada en formato JSON (`idea` y `recipe`).
- Traducción de la receta a trayectorias de 9 grados de libertad (cabeza, antenas y yaw del cuerpo) a 25 Hz mediante el generador de flow-matching asociado.
- Proyección automática del movimiento sobre el conjunto alcanzable del robot Reachy Mini.
- Manejo de eventos de acumulación y liberación (estornudos, bostezos, inclinaciones, arqueos) y de movimientos multi-fase.
- Generación de múltiples variantes por prompt (parámetro `n` en la API de servicio).
- Selección por nivel de esfuerzo dentro de una familia de tres planificadores (0.8B como `low`, 4B como `medium`, 27B como `high`), compartiendo un único generador en un mismo proceso.
- Soporte de decodificación especulativa mediante la cabeza MTP reajustada.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multilingüe.

## Casos de uso

- Control expresivo de un robot humanoide de sobremesa: convertir instrucciones cortas en lenguaje natural en gestos reproducibles para Reachy Mini, aprovechando que la salida ya viene proyectada sobre el conjunto alcanzable del robot.
- Animación de personajes robóticos en demostraciones y ferias: generar movimientos como "startled. A door slams." en menos de 0,2 s para respuestas reactivas en tiempo real.
- Investigación en robótica social: usar el planificador junto con el dataset público de movimiento para estudiar la correspondencia entre descripciones lingüísticas y trayectorias físicas.
- Prototipado rápido de comportamientos: dado que el bundle se sirve con un único comando (`python -m inference.server --bundle ...`), permite iterar sobre prompts sin reentrenar el generador.
- Teleoperación asistida por lenguaje: un operador describe una acción y el sistema genera una trayectoria base lista para reproducir o refinar.
- Sistemas multi-nivel con enrutado por esfuerzo: usar el nivel `low` (este modelo) para respuestas inmediatas y escalar a `medium` o `high` solo cuando la petición lo requiera, compartiendo un mismo generador en una GPU.
- Generación de variaciones de movimiento: solicitar varias muestras (`n`) del mismo prompt para obtener alternativas de animación sobre el mismo gesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta métricas de evaluación propias sobre prompts nunca vistos en entrenamiento, con 12 muestras por prueba:

| Metrica | Resultado |
|---|---|
| Sondas físicas fuera de distribución (estornudo hacia abajo, niño somnoliento que se desploma y se recupera, etc.) | 0,66 |
| Sondas de habilidad (asentir, inclinarse, mirar hacia arriba, etc.) | 0,57 |
| Acuerdo del plan con recetas de profesor retenidas (r media) | 0,41 |
| Identificación entre 12 clips reales de Pollen retenidos (top-1 / rango medio; azar 8% / 6,5) | 17% / 4,93 |
| Dirección de liberación en "sneezing" correcta | 12/24 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB según la model card (configuración FP8 con borradores MTP).
- GPU de referencia para las mediciones: una RTX PRO 6000, sobre la que se obtiene una mediana de ~0,18 s por prompt (0,14 s correspondientes al planificador).
- Cabe en GPU de consumo: con ~6 GB de VRAM, es viable en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti de 8 GB, RTX 4070 o superiores con 8 GB o más.
- Opciones de despliegue: servidor propio del proyecto reachy-motion-generator (`python -m inference.server --bundle ...`), que expone endpoints como `/generate-dense`; carga mediante la librería transformers. No se documentan soportes explícitos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~0,18 s de mediana por prompt en RTX PRO 6000; el modelo se describe como el nivel más rápido de la familia, con peor desempeño en movimientos multi-fase (bostezos, reverencias, eventos de acumulación).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reachy-mini-motion-planner-0.8b | ~0.8B | no disponible | Nivel `low`; ~0,18 s mediana por prompt; mejor en movimientos de una sola fase | apache-2.0 | HuggingFace (binhpham) |
| reachy-mini-motion-planner-4b | 4B | no disponible | Nivel `medium`; LoRA r=32 sobre todas las capas lineales | apache-2.0 | HuggingFace (binhpham) |
| reachy-mini-motion-planner-27b | 27B | no disponible | Nivel `high`; el más capaz de la familia | apache-2.0 | HuggingFace (binhpham) |

Los tres modelos pertenecen a la misma familia, comparten el generador de flow-matching y el dataset de entrenamiento, y se pueden servir en un mismo proceso seleccionando el nivel con el parámetro `effort`. No se proporcionan comparativas con modelos externos de la misma categoría.

## Limitaciones y advertencias

- Rendimiento limitado en movimientos multi-fase: la propia model card señala que es más débil en bostezos, reverencias y eventos de acumulación.
- El acuerdo con las recetas de profesor retenidas es moderado (r media de 0,41), lo que indica variabilidad respecto a la referencia humana.
- La identificación entre clips reales retenidos es baja (17% top-1, frente al 8% de azar), lo que sugiere que la correspondencia con movimientos reales concretos no es fiable.
- La dirección de liberación en el caso "sneezing" solo es correcta en 12 de 24 pruebas, es decir, la mitad de las veces.
- No se dispone de información sobre sesgos, idiomas soportados ni longitud de contexto, por lo que no se puede garantizar un comportamiento multilingüe ni entradas largas.
- Riesgo de alucinación en el sentido de generar recetas plausibles pero físicamente inválidas o poco naturales; aunque la salida se proyecta sobre el conjunto alcanzable del robot, la calidad expresiva no está garantizada.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero al derivar del modelo base Qwen/Qwen3.5-0.8B conviene revisar también las condiciones de dicho modelo base.
- Es un modelo especializado en una tarea concreta (planificación de movimiento para Reachy Mini); no está pensado para generación de texto general ni para otras tareas de lenguaje.
- El repositorio tiene 0 descargas y 0 likes, y tanto su creación como su actualización se fechan en 2026, por lo que se trata de un artefacto reciente con poca validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/binhpham/reachy-mini-motion-planner-0.8b
- Variante 4B: https://huggingface.co/binhpham/reachy-mini-motion-planner-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/binhpham/reachy-mini-massive-motion-library
- Demo en el navegador: https://huggingface.co/spaces/binhpham/reachy-mini-motion-generator
- Repositorio del SDK de Reachy Mini: https://github.com/pollen-robotics/reachy_mini
- Guía de desarrollo para agentes de IA: https://github.com/pollen-robotics/reachy_mini/blob/main/AGENTS.md
- Módulo de movimiento del SDK: https://github.com/pollen-robotics/reachy_mini/blob/main/src/reachy_mini/motion/move.py
- Centro de desarrolladores de Reachy Mini: https://reachymini.net/developers.html
