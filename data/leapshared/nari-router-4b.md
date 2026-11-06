# leapshared/nari-router-4b

## Resumen

nari-router-4b es un modelo de clasificación y enrutamiento en coreano desarrollado por leapshared, obtenido mediante fine-tuning del modelo base blackmallangcow/nari-decision-4b (v3.2, commit 029c4628a38859dce5b0db1742e9c97545aabe12). Su función es actuar como router de lenguaje hablado para un robot educativo de ciencias de aula (OpenArm SciEdu): recibe una transcripción de una intervención oral de un alumno o docente junto con el contexto de la escena y la clasifica en una de once categorías discretas (pause, stop, proceed, retry, start_switch, leaf_side, hands, question, answer, chitchat, unclear).

El modelo resuelve el problema de convertir lenguaje natural hablado en comandos o intenciones accionables para un robot en un entorno ruidoso y estructurado como es un aula. Emplea la arquitectura propietaria SysOne del modelo base, con capa de decisión invocada mediante `model.decide()`, y conserva el código remoto `modeling_sysone.py`. Cuenta con 4.216.792.578 parámetros totales (4,2 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0.

Es relevante porque ejemplifica un caso de uso de fine-tuning de un modelo de decisión para robótica educativa con un pipeline de clasificación muy específico, con calibración de probabilidades, cabecera de decisión con pérdida Brier y mezcla de log-probabilidades. El modelo está orientado exclusivamente al coreano y su uso está restringido al formato de entrada exacto definido por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SysOne (transformer con capa de decisión; código remoto `modeling_sysone.py`) |
| Parámetros totales | 4.216.792.578 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bf16, LoRA fusionada) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de blackmallangcow/nari-decision-4b (v3.2) y reutiliza su arquitectura SysOne, cuyo código remoto (`modeling_sysone.py`) se mantiene sin modificar; la inferencia se realiza mediante `model.decide()`. Sobre el backbone se aplicó LoRA en todas las capas lineales con rango 16 y alpha 32.0, además de una cabecera de decisión específica. La LoRA se fusionó en los pesos bf16.

El entrenamiento se realizó durante 3 épocas con tasa de aprendizaje 0.0002, batch de 8, semilla 2 y un peso de 2.0 para las clases "stop" y "pause". La cabecera de decisión se optimizó con pérdida logarítmica más Brier, mientras que la respuesta de texto se entrenó con entropía cruzada. El orden de las opciones se barajó por fila. La lectura final combina las log-probabilidades de la cabecera de decisión y de la respuesta textual con `lm_weight` 0.0, y aplica una temperatura de calibración de 2.01 para la clase `choice:6+`, reajustada sobre validación y conjunto de desarrollo. Los datos de entrenamiento provienen de un repositorio privado y no se publican; los resultados de medición se documentan en `docs/measurements/routing.md` (secciones 12 a 15).

## Capacidades

- Clasificación de intención en once categorías: pause, stop, proceed, retry, start_switch, leaf_side, hands, question, answer, chitchat, unclear.
- Enrutamiento de lenguaje hablado coreano transcrito en un contexto de aula con robot educativo.
- Procesamiento de una entrada estructurada con campos de escena, experimento, actividad con hojas, propuesta de IA y hablante.
- Decisión con probabilidades calibradas (temperatura 2.01 para `choice:6+`).
- Respuesta textual auxiliar mediante la cabeza de texto, combinada con la cabeza de decisión.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al coreano.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Enrutamiento de comandos en robot educativo de ciencias: el modelo recibe la transcripción de un alumno o docente junto con el contexto de la escena y devuelve una de las once categorías, permitiendo al robot decidir si debe pausar, detenerse, continuar o pedir repetición.
- Atención a preguntas en el aula: cuando la categoría devuelta es `question`, el sistema puede derivar la consulta a un módulo de respuesta o a un docente, usando la cabeza de texto como apoyo.
- Detección de ambigüedad: la categoría `unclear` permite al sistema solicitar aclaración en lugar de actuar sobre una transcripción dudosa.
- Gestión de actividades con hojas (leaf_side) y manipulación de manos (hands): el router traduce instrucciones orales en acciones específicas del robot dentro del flujo de un experimento.
- Filtrado de conversación social (chitchat): el modelo identifica intervenciones no relacionadas con la tarea y evita que el robot las interprete como comandos.
- Control de flujo del experimento: las categorías stop, pause, proceed y retry permiten gestionar el estado de la sesión experimental en tiempo real.
- Integración en un pipeline de clasificación con `transformers`: dado que el modelo se carga mediante la librería transformers y expone `model.decide()`, puede integrarse en servicios de inferencia existentes que ya usen el código remoto de SysOne.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `docs/measurements/routing.md` (secciones 12 a 15) para las métricas de medición, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,2 mil millones de parámetros en bf16 se requiere aproximadamente 8,5 GB solo para los pesos, más overhead de activaciones y contexto.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de pesos podría caber en GPUs con 12-16 GB en bf16, pero no hay datos oficiales.
- Opciones de despliegue: transformers con código remoto (`trust_remote_code=True`) y llamada a `model.decide()`; vLLM, llama.cpp, Ollama o TGI no están confirmados como compatibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Tarea |
|---|---|---|---|---|---|
| leapshared/nari-router-4b | 4.216.792.578 | no disponible | ko | Apache 2.0 | Clasificación / router |
| blackmallangcow/nari-decision-4b | no disponible | no disponible | ko | no disponible | Modelo de decisión (base) |
| Alternativas genéricas de clasificación coreana | no disponible | no disponible | ko | variable | Clasificación de texto |

No se dispone de información sobre modelos directamente comparables en la misma categoría de router de lenguaje hablado para robótica educativa en coreano.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para coreano; no se garantiza un comportamiento correcto en otros idiomas.
- La entrada debe seguir estrictamente el formato definido por el autor (campos `장면`, `실험`, `나뭇잎 활동`, `AI 제안`, `말한 사람` y la utterance separada por `||`); otras formulaciones quedan fuera de la distribución de entrenamiento.
- Las opciones y el texto de instrucciones deben coincidir con la variante `short_stop` del archivo `dialogue/routing/nari_route.py`; usar otros textos degrada el rendimiento.
- El modelo depende del código remoto `modeling_sysone.py` del modelo base, lo que implica ejecutar código de terceros con `trust_remote_code=True` y asumir riesgos de seguridad y mantenimiento.
- Riesgo de alucinación en la cabeza de texto auxiliar; la decisión principal se basa en la cabeza de clasificación con `lm_weight` 0.0.
- No se publican los datos de entrenamiento ni las métricas detalladas, lo que dificulta la reproducibilidad y la evaluación independiente.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y del código remoto.
- El modelo tiene solo 44 descargas y 0 likes, lo que indica una validación externa muy limitada.

## Enlaces

- HuggingFace: https://huggingface.co/leapshared/nari-router-4b
- Modelo base: https://huggingface.co/blackmallangcow/nari-decision-4b
- Repositorio de código de enrutamiento citado en la model card: `dialogue/routing/nari_route.py` (no se proporciona URL)
- Documentación de mediciones citada: `docs/measurements/routing.md` (no se proporciona URL)
