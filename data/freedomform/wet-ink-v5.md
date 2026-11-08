# Freedomform/wet-ink-v5

## Resumen

Wet-Ink v5 es un método de decodificación en tiempo de inferencia para modelos de lenguaje de difusión (dLLM), publicado por el autor Freedomform sobre el modelo base inclusionAI/LLaDA2.2-mini. No se trata de un modelo entrenado desde cero, sino de un esquema de decodificación que combina una frontera autorregresiva que abre un token por paso (de izquierda a derecha) con una ventana deslizante de W tokens que permanece editable detrás de la frontera. Los tokens que salen de la ventana quedan congelados de forma permanente, de ahí la metáfora de la "tinta húmeda" que se seca con la distancia.

El interés del trabajo es metodológico y honesto: el autor publica un resultado negativo. La calidad final es estadísticamente idéntica a la del decodificador paralelo estándar del modelo base (McNemar exacto p = 1.0 en tareas emparejadas), pero con un coste estructural de ×4.88 en número de evaluaciones de función (NFE). Además, el autor documenta un hallazgo metodológico relevante: una diferencia aparente de +10.8 pp entre brazos experimentales se debe a un artefacto de composición de tareas, no a una mejora real del método.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que no contiene pesos publicados sino documentación del método y sus resultados experimentales. La licencia es MIT y el modelo base sobre el que se evalúa es LLaDA2.2-mini, con soporte declarado para inglés y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de lenguaje (dLLM) sobre base LLaDA2.2-mini; decodificación con frontera autorregresiva y ventana deslizante editable |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (mencionada en la evaluación experimental, misma cuantización que la línea base v4b) |
| Idiomas soportados | en, ru |
| Licencia | MIT |
| Formato de pesos | no disponible (tamaño de repositorio 0.0 GB; el repositorio documenta el método, no pesos publicados) |

## Arquitectura y entrenamiento

Wet-Ink v5 no entrena ningún componente nuevo. Todos los mecanismos se reutilizan literalmente del modelo base LLaDA2.2-mini: la compuerta T2T entrenada (`p0 > editing_threshold AND old != x0`, linaje L-EBPO), las operaciones de edición SPLIT/DELETE mediante `_apply_edit_operations_with_tracking` (linaje Levenshtein Transformer), el remuestreador antiloop y la atención diagonal por bloques. La única variable nueva es el calendario de decodificación: qué posición se abre en cada paso y qué ventana permanece editable.

El esquema funciona así: en cada paso de difusión se abre exactamente la máscara más a la izquierda pendiente y se confirma al estilo autorregresivo (un token por paso, progreso garantizado). Detrás de la frontera, los tokens en el intervalo `[f−W, f)` pueden ser reescritos por la compuerta T2T del modelo base mientras la "tinta está húmeda"; a distancia W el token sale de la ventana y se congela para siempre (`editing_confidence = −∞`). El autor defiende que el calendario de decodificación es una variable libre legítima en inferencia, apoyándose en BD3-LM (ICLR 2025) y Set Diffusion (2026). La evaluación se realizó sobre GSM8K con decodificación greedy (T=0, gen_length=160) y cuantización 4-bit.

## Capacidades

- Generación de texto mediante decodificación por difusión con esquema de frontera autorregresiva.
- Razonamiento aritmético evaluado en GSM8K (45 tareas en el brazo principal).
- Reescritura controlada de tokens dentro de la ventana deslizante mediante la compuerta T2T entrenada del modelo base.
- Operaciones de edición SPLIT y DELETE heredadas del modelo base.
- Mecanismo antiloop y atención diagonal por bloques heredados del modelo base.
- Telemetría completa por tarea: pasos, tokens abiertos, reescrituras y residuo.
- Comprobaciones de equivalencia bit-exacta W=0 ≡ stock.
- Idiomas: inglés y ruso (según la model card).
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación sobre decodificación en dLLMs: el repositorio sirve como referencia reproducible para estudiar el efecto del calendario de decodificación (frontera frente a paralelo) manteniendo fijos todos los demás componentes del modelo base.
- Análisis de coste computacional en inferencia: la contabilidad de NFE (42 frente a 207 en comparaciones emparejadas) permite evaluar el compromiso entre calidad y coste de esquemas de decodificación alternativos.
- Reproducción de resultados negativos: útil para grupos que quieran verificar el resultado de equivalencia estadística (McNemar p = 1.0) y el artefacto de composición de tareas documentado.
- Estudio de ventanas de edición: los brazos W=8 y W=16 permiten analizar el efecto del tamaño de ventana en la tasa de reescrituras (5.6 y 6.9 por tarea respectivamente) y en la precisión.
- Auditoría metodológica: el documento es un ejemplo práctico de uso de McNemar exacto, intervalos de confianza de Wilson y descomposición por segmentos de tareas para evitar conclusiones espurias.
- Docencia sobre modelos de difusión de lenguaje: la metáfora de la tinta húmeda y el diagrama de frontera facilitan explicar la diferencia entre decodificación autorregresiva y paralela en dLLMs.
- Evaluación en ruso e inglés: dado el soporte declarado de ambos idiomas, puede emplearse como banco de pruebas de decodificación en entornos multilingües, aunque no se publican resultados por idioma.

## Benchmarks y rendimiento

Resultados en GSM8K (primeras 45 tareas, greedy T=0, gen_length=160, cuantización 4-bit), comparados con la línea base v4b:

| Brazo | n | Precisión | IC 95% Wilson | NFE medio | Reescrituras/tarea |
|---|---|---|---|---|---|
| wetink_w16 (método, W=16) | 45 | 24.4% | [14.2, 38.7] | 206.6 | 6.9 |
| noedit_w16 (solo frontera, sin reescrituras) | 22 | 13.6% | [4.7, 33.3] | 201.1 | 0 |
| wetink_w8 (ventana estrecha) | 10 | 20.0% | [5.7, 51.0] | 202.7 | 5.6 |
| stock_b32 (línea base v4b) | 80 | 22.5% | [14.7, 32.8] | 42.5 | — |
| noedit_b32 (línea base, edición desactivada) | 80 | 23.8% | [15.8, 34.1] | 50.1 | — |

McNemar exacto emparejado por índice de tarea: wetink_w16 frente a stock_b32 da 11/45 frente a 11/45 (2 corregidas, 2 rotas, p = 1.0) con un coste de ×4.88 NFE (42 → 207 emparejados). En las 22 tareas comunes a ambos brazos v5, las reescrituras de ventana no cambiaron ningún resultado (0 pares discordantes). El autor atribuye la diferencia bruta de +10.8 pp entre wetink_w16 y su control a un artefacto de composición de tareas: el control se detuvo antes en las tareas difíciles 0–21 (13.6% en todas las variantes) mientras el brazo principal cubrió también las fáciles 22–44 (34.8%). Los brazos w32 y HumanEval se omitieron por presupuesto de tiempo con `n_run=5 < 8`, declarado explícitamente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible; únicamente se reporta el coste en NFE (206.6 medio para wetink_w16 frente a 42.5 para stock_b32), lo que implica un coste computacional aproximadamente ×4.88 en pasos de evaluación del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wet-Ink v5 (sobre LLaDA2.2-mini) | Método de decodificación dLLM | no disponible | no disponible | 24.4% (n=45) | MIT | Repositorio de documentación, sin pesos |
| LLaDA2.2-mini (stock_b32) | dLLM base | no disponible | no disponible | 22.5% (n=80) | no disponible | Pesos en Hugging Face |
| LLaDA2.2-mini con edición desactivada (noedit_b32) | dLLM base sin edición | no disponible | no disponible | 23.8% (n=80) | no disponible | Pesos en Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo: el método no mejora la precisión del decodificador paralelo estándar (p = 1.0 en McNemar exacto) y multiplica por 4.88 el coste en NFE.
- El repositorio no publica pesos (tamaño 0.0 GB); es documentación de método y resultados, no un modelo desplegable directamente.
- Las muestras son pequeñas: 45 tareas en el brazo principal, 22 en el control y 10 en W=8, con intervalos de confianza amplios (por ejemplo, [14.2, 38.7] para wetink_w16).
- Los brazos w32 y HumanEval no se ejecutaron por presupuesto de tiempo (`n_run=5 < 8`), por lo que no hay evaluación en código.
- El autor documenta un artefacto de composición de tareas que infla aparentemente la mejora; cualquier lectura de las cifras brutas sin segmentar lleva a conclusiones erróneas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas limitados a inglés y ruso según la model card; no se publican evaluaciones por idioma.
- Licencia MIT, que permite uso comercial, pero al no haber pesos publicados la aplicabilidad en producción es limitada.
- La cuantización 4-bit empleada en los experimentos puede afectar a la reproducibilidad de los resultados frente a precisión completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Freedomform/wet-ink-v5
- Modelo base: https://huggingface.co/inclusionAI/LLaDA2.2-mini
- Repositorio GitHub: https://github.com/Asilbekov/Explore
- Demo interactiva: https://huggingface.co/spaces/Freedomform/wet-ink
- Informe técnico (PDF): https://huggingface.co/Freedomform/wet-ink-v5/blob/main/wet-ink-report-v5.pdf
- Licencia en GitHub: https://github.com/Asilbekov/Explore/blob/main/LICENSE
- Paper BD3-LM (ICLR 2025): arXiv:2509.23653 (referenciado en los tags)
- Paper Set Diffusion: arXiv:2606.12232 (referenciado en los tags)
- Paper L-EBPO: arXiv:2610.08833 (referenciado en los tags)
