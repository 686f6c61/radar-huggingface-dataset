# ktcapraz/t5gemma2-r1s4-steprl

## Resumen

T5Gemma2 r1s4 es un modelo de investigación de 270 millones de parámetros desarrollado por el usuario ktcapraz sobre la base limpia de `google/t5gemma-2-270m-270m`. Su particularidad es que, antes de emitir una respuesta, construye un pequeño grafo de evidencia: copia fragmentos del texto de entrada, los enlaza entre sí y clasifica cada enlace según una lista fija de nueve relaciones. Posteriormente, código determinista ejecuta ese grafo, de modo que la respuesta final pasa por el razonamiento por construcción. La última etapa de entrenamiento emplea aprendizaje por refuerzo a nivel de paso con GRPO.

El modelo responde a tres tipos de pregunta (`choice`, `noul` y `score`) y está pensado para tareas de decisión sobre texto, como evaluar si un pedido cumple una política de reembolso. La arquitectura es un transformer encoder-decoder con un encoder no conjunto que lee el estado una sola vez y lo copia por pregunta antes de la capa 15, de forma que las preguntas son independientes por construcción y comparten una única codificación.

Es relevante ahora porque explora una vía poco habitual: separar el razonamiento (grafo de evidencia explícito y verificable) de la respuesta final, con pasos que se pueden auditar. Sin embargo, el propio autor advierte de que la idea funciona en algunas tareas pero no es la mejor forma de obtener respuestas precisas: en preguntas de uso real el resultado final (0,633) es peor que la respuesta base del modelo (0,714). Está publicado con licencia Gemma y solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5Gemma2), encoder no conjunto con copia del estado por pregunta antes de la capa 15 |
| Parametros totales | 270M (base `google/t5gemma-2-270m-270m`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | PyTorch (librería `pytorch`, repo de 0,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/t5gemma-2-270m-270m`, un encoder-decoder de 270 millones de parámetros. La innovación arquitectónica principal es el encoder no conjunto: las capas 1 a 14 leen el estado una sola vez y el estado nunca ve una pregunta; antes de la capa 15, el estado se copia una vez por pregunta y cada copia lee únicamente su propia pregunta. Esto hace que las preguntas sean independientes por construcción y que una sola codificación se comparta entre todas ellas. El decoder genera una fila por pregunta con el formato `<bos> [BASE] <think> [link 1] [link 2] ... </think> Answer:`.

Cada enlace del grafo tiene la forma `[A] [B] [REL]`, donde los extremos son spans (seleccionados mediante un puntero), opciones o enlaces anteriores, y la relación es una de nueve: `SUPPORTS`, `CONTRADICTS`, `IMPLIES`, `MEETS`, `FAILS`, `EXCEPTION`, `SAME`, `COMPARE`, `NONE`. Un paso `CALC` realiza aritmética en código con una tabla de unidades. El programa del grafo es código diferenciable que calcula una fuerza para cada nodo a partir de los enlaces: el logit final es igual al logit base más el logit de la fuerza de la opción más una corrección acotada r (±2). Sin enlaces, final = base + r. La etapa final de entrenamiento es aprendizaje por refuerzo a nivel de paso con GRPO. Los datasets citados en la model card son `hotchpotch/bekko-system-one-dataset-v0`, `avbiswas/bev-decision`, `LocalLLaMA/typed-decisions` y `n4ze3m/typed-decisions-synth`. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Clasificación de texto y toma de decisiones sobre un estado textual y un conjunto de preguntas tipadas (`choice`, `noul`, `score`).
- Construcción de un grafo de evidencia explícito con spans copiados del texto de entrada, lo que impide que una cita contenga palabras inventadas.
- Clasificación de relaciones entre evidencias entre nueve categorías fijas.
- Razonamiento multi-paso mediante enlaces encadenados y pasos `CALC` con aritmética en código sobre números, fechas y cantidades.
- Modo rápido (`reasoning off`) que devuelve solo la respuesta base más la corrección, sin enlaces.
- Procesamiento de múltiples preguntas independientes sobre un mismo estado compartiendo una única codificación.
- No dispone de tool calling, function calling, capacidades de agente general, visión, audio ni modo de pensamiento libre; el "razonamiento" está restringido al grafo de evidencia.
- Soporte multilingüe limitado al inglés.

## Casos de uso

- Evaluación de políticas de reembolso y devolución: el modelo recibe el estado de un pedido y la política aplicable, y decide si procede reembolso enlazando fragmentos como "the left ear stopped working" con "defective items" y verificando el plazo de 30 días; el grafo resultante es auditable.
- Triaje de tickets de soporte: clasificar solicitudes entrantes según reglas de negocio explícitas, con trazabilidad de qué parte del ticket activa cada regla.
- Verificación de elegibilidad en seguros o subvenciones: comprobar si un caso cumple una cadena de requisitos multi-hop, aprovechando el conjunto `gold_b` (0,881), donde el modelo rinde mejor que su base.
- Generación de decisiones sobre reglas codificadas y aritmética: en el conjunto `generator` el razonamiento aporta 6,7 puntos (0,837 frente a 0,770 de la base), por lo que encaja en flujos con reglas sintéticas y cálculos numéricos.
- Auditoría de decisiones automatizadas: al exponer los enlaces y sus probabilidades, permite revisar por qué se tomó una decisión y detectar enlaces espurios, como el que cruza un límite de frase en el ejemplo de la model card.
- Prototipado de investigación en razonamiento neuro-simbólico: servir de base para experimentos sobre grafos de evidencia y RL a nivel de paso, dado su tamaño reducido y su velocidad (0,2–0,4 s por petición con razonamiento en CPU de servidor con 4 hilos).

## Benchmarks y rendimiento

Scorecard al final del entrenamiento (`results/final_scorecard.txt`). `base` es la respuesta antes del razonamiento; `final` es la respuesta del grafo; `off` es la base más la corrección, sin enlaces.

| Conjunto | final | base | off |
|---|---|---|---|
| generator (reglas y aritmética generadas por código) | **0,837** | 0,770 | 0,765 |
| gold_b (cadenas de reglas y multi-hop) | **0,881** | 0,867 | 0,798 |
| contrast pairs | 0,773 | 0,776 | 0,772 |
| gold_a (evidencia y enlaces gold) | 0,728 | 0,733 | 0,668 |
| plain decisions | 0,704 | 0,710 | 0,701 |
| tasksource (muchas tareas) | 0,679 | 0,680 | 0,679 |
| views (misma pregunta en otras formas) | 0,657 | 0,669 | 0,656 |
| real-use (147 preguntas) | 0,633 | **0,714** | 0,612 |

En `real-use`, el razonamiento rescató 3 respuestas erróneas y dañó 15 correctas, con enlaces en el 30 % de las preguntas. En S1MB, r1s4 no se evaluó en el benchmark completo: su predecesor r1 obtuvo 39,3 (final) y 43,7 (base; 51,0 en tareas entrenadas y 25,6 en no entrenadas). En una muestra de 2.825 preguntas, la base de r1s4 obtuvo 44,9 global y 31,8 en tareas nunca entrenadas; v2 obtuvo 54,5 y 30,4 en las mismas filas. Esta muestra no es una puntuación oficial. Con el sesgo de parada servido, r1s4 solo enlazó 10 de esas 2.825 preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 270M parámetros y pesos en FP32 (repo de 0,8 GB), la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 2–4 GB de VRAM libre debería ser suficiente en FP32 o FP16.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (270M), aunque el autor no publica requisitos oficiales.
- El autor reporta velocidad en CPU de servidor con 4 hilos y textos cortos: aproximadamente 0,2–0,4 s por petición con razonamiento activado y unos 0,2 s con él desactivado.
- Opciones de despliegue: el modelo requiere el código del directorio `decisions/` y el modelo base para la tabla de palabras congelada y el tokenizador; se ejecuta con `python run_example.py` (razonamiento activado) o `python run_example.py --reasoning off`. La model card indica `inference: false` a nivel de Hugging Face, por lo que no es desplegable directamente con pipelines estándar como vLLM, TGI o llama.cpp sin el código propio.
- Latencia y throughput adicionales: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t5gemma2-r1s4-steprl (este) | 270M | no disponible | Grafo de evidencia + GRPO | Gemma | Hugging Face, requiere código propio |
| t5gemma2-decision-270m-v2 | 270M | no disponible | Decisiones de la misma familia, recomendado por el autor | Gemma | Hugging Face (citado en la model card) |
| google/t5gemma-2-270m-270m (base) | 270M | no disponible | Encoder-decoder T5Gemma2 sin razonamiento | Gemma | Hugging Face |
| r1 (predecesor de la familia) | 270M | no disponible | Grafo de evidencia, sin la etapa RL final | Gemma | Hugging Face (citado en la model card) |

No se dispone de datos comparativos de benchmarks frente a modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el enfoque no es la mejor forma de obtener respuestas precisas: en preguntas de uso real el resultado final (0,633) es peor que la respuesta base (0,714), y el razonamiento dañó 15 respuestas correctas frente a 3 rescatadas.
- El modelo enlaza poco: con el sesgo de parada servido solo enlazó 10 de 2.825 preguntas en la muestra de S1MB, por lo que el razonamiento rara vez se activa en la práctica.
- Debilidad conocida en los spans: pueden cruzar límites de frase, como se muestra en el enlace 2 del ejemplo de la model card.
- Solo soporta inglés; no hay capacidades multilingües.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, y es necesario aceptar los términos en la página del modelo base antes de descargarlo.
- Es un modelo de investigación, no un producto listo para producción; requiere el código del directorio `decisions/` y el modelo base para funcionar.
- No es desplegable con pipelines estándar (`inference: false` en Hugging Face), lo que complica su integración en infraestructuras convencionales.
- Riesgo de alucinación mitigado parcialmente por la copia de spans (una cita no puede contener palabras inventadas), pero no eliminado: la selección de qué enlazar y con qué relación puede ser incorrecta.
- No se han documentado sesgos específicos en la información disponible.
- El modelo no está afiliado a TypeSafe, aunque sigue el formato de petición de su API System One.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ktcapraz/t5gemma2-r1s4-steprl)
- [Modelo base google/t5gemma-2-270m-270m](https://huggingface.co/google/t5gemma-2-270m-270m)
- [Gemma Terms of Use](https://ai.google.dev/gemma/terms)
- [Dataset hotchpotch/bekko-system-one-dataset-v0](https://huggingface.co/datasets/hotchpotch/bekko-system-one-dataset-v0)
- [Dataset avbiswas/bev-decision](https://huggingface.co/datasets/avbiswas/bev-decision)
- [Dataset LocalLLaMA/typed-decisions](https://huggingface.co/datasets/LocalLLaMA/typed-decisions)
- [Dataset n4ze3m/typed-decisions-synth](https://huggingface.co/datasets/n4ze3m/typed-decisions-synth)
