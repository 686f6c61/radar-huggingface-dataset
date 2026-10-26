# mohameddhameem/systemone-decider-e4b-qpa-menu-a

## Resumen

SystemOne-Decider E4B qpa menu-a es un modelo de enrutado (router) para pipelines de pregunta-respuesta en dos etapas, no un modelo generativo. Lo desarrolla Mohamed Dhameem y se construye sobre el Strands Decider E4B (`StrandsAgents/strands-decider-E4B-gemma4-v1-2610`), al que se le afina un adaptador LoRA de rango 48 y una cabeza pointer para responder preguntas binarias de sí/no. Cada decisión se expone como P(sí): la probabilidad de que la etapa débil sea suficiente, de modo que un umbral calibrado decide si se invoca el modelo pequeño o el grande en recuperación y en respuesta.

El pipeline que gobierna tiene dos menús: en recuperación, Qwen2.5-7B-Instruct (débil) frente a Qwen2.5-72B-Instruct (fuerte); en respuesta, Llama-3.2-3B-Instruct (débil) frente a Llama-3.1-70B-Instruct (fuerte). La variante `qpa` realiza tres juicios encadenados: uno sobre los pasajes recuperados, otro sobre si un modelo pequeño acertará con esos pasajes y un tercero sobre si la respuesta débil propuesta es correcta. Es relevante porque ataca el coste dominante de los pipelines RAG multi-salto: con el punto de operación por defecto se queda un 1,5 % por debajo de la precisión de invocar siempre el modelo fuerte, a un 66 % de su precio.

El modelo se entrena y evalúa sobre el split SLR de HotpotQA (4.814 preguntas de entrenamiento, 1.110 de validación y 1.481 de test) y se distribuye con tres semillas independientes que pueden promediarse en ensemble. Su métrica principal es AIQ (área bajo la curva precisión-precio), y la comparación publicada lo sitúa por encima de los routers SFT del setup SLR y de las cuatro rutas fijas del menú.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Router neuronal sobre el torso del Strands Decider E4B (familia Gemma) con cabeza pointer y adaptador LoRA de rango 48 |
| Parametros totales | no disponible (el nombre del modelo base indica la variante E4B; el recuento exacto no se detalla en la información disponible) |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la inferencia de referencia se ejecuta en bf16; no se documentan pesos cuantizados) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabeza pointer), con ficheros JSON de configuración `systemone.json` y `training.json`; el repositorio ocupa 1,3 GB e incluye las semillas 0 (raíz), 1 (`seed1/`) y 2 (`seed2/`) |

## Arquitectura y entrenamiento

El modelo reutiliza el torso del Strands Decider E4B y le superpone un adaptador LoRA de rango 48 junto con una cabeza pointer que produce una probabilidad de sí/no mediante cross-entropy con softmax agrupado (grouped-softmax cross-entropy). Un único modelo aprende las preguntas de las dos etapas, y la variante `qpa` añade un tercer juicio que lee la respuesta débil propuesta. Los estados de entrada son las referencias seleccionadas por el retriever en el formato `[k] title: text`, una por línea, tomadas sin recortar y conservando lo que sigue al primer `Selected references:`; el juicio se ejecuta sobre el torso del decider, por lo que requiere GPU para una velocidad útil.

El entrenamiento se hizo sobre las 4.814 preguntas del split SLR de HotpotQA (tres ítems por pregunta), con learning rate 0,0001, batch de 16 y hasta 2 épocas, conservando la época de menor NLL sobre un 10 % de preguntas reservadas. Partió de la revisión `1344d44397c457f3be34b8ff15c593b41248c6bf` del modelo base y las etiquetas provienen del setup Stage-Level Routing (SLR) de STAIR. Las etiquetas de cada etapa son objetivos por etapa, no la respuesta final; los umbrales de operación (`near_strong`, `peak`, `parity`) se eligen sobre validación con una rejilla de pasos de 0,05 por etapa.

## Capacidades

- Enrutado binario de recuperación: decide entre el retriever débil (Qwen2.5-7B-Instruct) y el fuerte (Qwen2.5-72B-Instruct) devolviendo P(sí) = probabilidad de que la selección débil baste.
- Enrutado binario de respuesta en modo `qp`: estima si un modelo pequeño (Llama-3.2-3B-Instruct) responderá correctamente a partir de los pasajes de la rama elegida.
- Enrutado en modo `qpa`: añade un tercer juicio sobre si la respuesta débil ya propuesta es correcta, lo que permite aceptarla sin escalar.
- Salida calibrada por umbral: cada decisión se compara contra un umbral de `systemone.json`, con tres reglas de operación (`near_strong`, `peak`, `parity`) seleccionadas en validación.
- Ensemble de semillas: las semillas 0, 1 y 2 pueden promediarse en probabilidad para reducir la varianza de las decisiones.
- Procesamiento por lotes: la inferencia en bf16 con lotes de 16 reproduce exactamente las puntuaciones guardadas sobre los 1.481 ítems de test.
- Integración programática: API `MenuRouter` con los métodos `retrieval(...)` y `answer(...)` en el paquete `systemone-decider`.
- No genera texto, no hace tool calling, no soporta agentes multi-paso por sí mismo ni capacidades de visión o audio: es un componente de decisión dentro de un pipeline mayor.

## Casos de uso

- Enrutado coste-calidad en pipelines RAG multi-salto: el router decide en cada etapa si basta el modelo pequeño; con la regla `near_strong` se obtiene un 75,62 % de accuracy a un precio de 603,1 frente a los 929,0 de invocar siempre el modelo fuerte (un 66 % del coste) con solo un 1,5 % de accuracy perdida.
- Selección dinámica de retriever: en lugar de fijar Qwen2.5-7B o Qwen2.5-72B, el juicio de recuperación escala solo las preguntas cuyos pasajes seleccionados no contienen lo necesario para responder.
- Selección dinámica de answerer: el juicio de respuesta en modo `qp` permite mantener Llama-3.2-3B en la mayoría de consultas y reservar Llama-3.1-70B para los casos en que el modelo pequeño fallará con los pasajes disponibles.
- Verificación de respuestas ya generadas: en modo `qpa`, el tercer juicio evalúa una respuesta débil concreta, lo que sirve como filtro de calidad antes de publicarla o de escalar a un modelo mayor.
- Control de presupuesto en producción: al exponer P(sí) por etapa, el operador puede mover los umbrales para situarse en cualquier punto de la curva precisión-precio sin reentrenar, incluyendo el punto `parity` (igualar la accuracy de siempre-fuerte) o `peak` (máxima accuracy).
- Estabilización mediante ensemble: promediar las probabilidades de las tres semillas sube el AIQ a 0,739 (0,732 descontando el coste de las tres llamadas) frente a 0,732 de la semilla 0 en solitario, útil cuando el pipeline no tolera la variabilidad entre semillas.
- Evaluación de políticas de routing: sirve como referencia para medir AIQ de routers propios sobre el split SLR de HotpotQA, con 1.481 preguntas de test y puntos de operación publicados.
- Investigación sobre routing a nivel de etapa: el modelo y el código asociado permiten reproducir el setup SLR y comparar objetivos de entrenamiento (etiquetas SFT, SFT más reward) contra un juez aprendido de forma independiente.

## Benchmarks y rendimiento

El autor reporta AIQ (área bajo la curva accuracy-precio, con precios de la Tabla 5 de AgentTTS, de 80 a 1.009) sobre el split SLR de HotpotQA; la columna "con su propio precio" descuenta el coste de las llamadas del propio juez.

| Política | AIQ | AIQ con su propio precio |
|---|---|---|
| Semilla 0 (carpeta raíz) | 0,732 [0,713; 0,753] | 0,730 |
| Semillas individuales, media ± sd | 0,733 ± 0,002 | 0,731 |
| Ensemble de tres semillas (media de P) | 0,739 | 0,732 (tres llamadas por decisión) |
| Ensemble de tres semillas, preguntas no vistas por nano-jev | 0,742 | no disponible |
| Router SLR SFT (label), LoRA Qwen2.5-1.5B | 0,724 | no imputado |
| Router SLR SFT (label) + reward | 0,725 | no imputado |
| Las cuatro rutas fijas | 0,693 | no disponible |

Puntos de operación sobre el conjunto de test (umbrales elegidos en validación):

| Punto de operación | Accuracy | Precio | Coste del juez | Umbrales |
|---|---|---|---|---|
| Semilla 0, `near_strong` (por defecto) | 75,62 % | 603,1 | 6,9 | [0,95; 0,95; 1,0] |
| Semilla 0, `peak` | 76,77 % | 1.009,0 | no disponible | [1,0; 1,0; 1,0] |
| Semilla 0, `parity` | 76,77 % | 1.009,0 | no disponible | [1,0; 0,0; 1,0] |
| Ensemble de tres semillas, `peak` | 76,77 % | 755,5 | no disponible | [0,95; 0,95; 1,0] |
| SLR SFT (label), `peak` | 76,70 % | 834,8 | no disponible | [0,95; 1,0; 1,0] |
| Siempre fuerte, sin router | 76,77 % | 929,0 | no aplica | no aplica |

Diferencias de AIQ reportadas frente a los routers SLR: semilla 0 frente a SLR SFT (label), +0,008 (IC 95 % +0,001 a +0,015, significativo) sin imputar precio y +0,006 (IC 95 % −0,001 a +0,013, no significativo) con precio; ensemble frente a SLR SFT (label), +0,014 (+0,007 a +0,022) y +0,008 (+0,001 a +0,016) respectivamente. No se han publicado resultados en benchmarks estándar de generación (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el autor solo indica que el juicio ejecuta el torso del Strands Decider E4B y que se necesita una GPU para una velocidad útil.
- Precisión de referencia: bf16, con lotes de 16 en la reproducción exacta de las puntuaciones guardadas.
- GPU recomendadas: no disponibles; no hay tabla de hardware publicada. La reproducción de resultados se describe genéricamente "en GPU".
- Ajuste en GPU de consumo: no confirmado; dado que el torso corresponde a la variante E4B del decider, es plausible, pero no está documentado en la model card.
- Despliegue: paquete propio `systemone-decider` (`pip install git+https://github.com/mohameddhameem/systemone-decider`) con la clase `MenuRouter`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se advierte de que `retrieval` y `answer` puntúan de uno en uno y que el padding difiere del modo por lotes, con desplazamientos de hasta 0,013 en las puntuaciones sobre ítems cercanos al umbral.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Métrica publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| systemone-decider-e4b-qpa-menu-a | Router de dos etapas sobre decider E4B (LoRA r48 + pointer) | no disponible | no disponible | AIQ 0,732 (semilla 0) / 0,739 (ensemble) | Apache 2.0 | HuggingFace + GitHub |
| Router SLR SFT (label), LoRA Qwen2.5-1.5B | Router SFT por etapa | 1,5B (base) | no disponible | AIQ 0,724 / 0,725 con reward | no disponible | Referencia interna del paper/setup SLR |
| systemone-jev-qpa | Cross-encoder MiniLM que devuelve P(modelo grande) | 33M | no disponible | no disponible en la información recogida | no disponible | HuggingFace |
| Siempre fuerte (sin router) | Política fija | no aplica | no aplica | 76,77 % de accuracy a precio 929,0 | no aplica | Línea base |

## Limitaciones y advertencias

- Dominio restringido: entrenado y evaluado solo sobre HotpotQA, con un único menú de modelos y un único prompt de recuperación; no hay evidencia de generalización a otros dominios, idiomas o menús.
- Dependencia del formato de estado: las entradas deben ser las referencias seleccionadas por el retriever en el formato `[k] title: text` por línea; cualquier cambio en el prompt de recuperación invalida el modelo.
- Umbrales no transferibles: el autor recomienda explícitamente recalibrar los umbrales sobre validación propia, ya que el punto `near_strong` puede colapsar en "siempre fuerte" si las puntuaciones se concentran por encima de 0,95.
- Ganancia marginal en algunos puntos: en la semilla 0, la ventaja frente a los routers SLR deja de ser significativa al descontar el coste del propio juez (IC 95 % que cruza cero).
- Varianza entre semillas y por padding: el AIQ de semillas individuales varía (media 0,733 ± 0,002) y la puntuación ítem a ítem puede diferir hasta 0,013 respecto al modo por lotes, lo que puede invertir decisiones justo en el umbral.
- Idioma: solo inglés (`language: en`); no se documenta soporte multilingüe.
- Naturaleza no generativa: no produce texto ni admite tool calling; requiere integrarse en un pipeline que ejecute los modelos subyacentes y asuma su coste.
- Riesgo de enrutado erróneo: una decisión incorrecta degrada la calidad de la respuesta final sin señal explícita de error; no se documentan mecanismos de abstención ni de confianza calibrada más allá de P(sí).
- Sesgos: no se documenta ninguna evaluación de sesgos ni de robustez frente a preguntas adversarias.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones de los modelos subyacentes del menú (Qwen2.5 y Llama 3.x) se rigen por sus propias licencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohameddhameem/systemone-decider-e4b-qpa-menu-a
- Modelo base (Strands Decider E4B Gemma4 v1): https://huggingface.co/StrandsAgents/strands-decider-E4B-gemma4-v1-2610
- Código del router (`systemone_decider.route.MenuRouter`): https://github.com/mohameddhameem/systemone-decider
- Repositorio STAIR (setup Stage-Level Routing): https://github.com/mohameddhameem/STAIR
- Perfil del autor en GitHub: https://github.com/mohameddhameem
- Dataset HotpotQA en HuggingFace: https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Router relacionado (systemone-jev-qpa, cross-encoder de 33M): https://huggingface.co/mohameddhameem/systemone-jev-qpa
- Familia de modelos decider (Mapika/decider): https://github.com/Mapika/decider
- Comparativa S1MB de modelos de decisión System One: https://huggingface.co/blog/hotchpotch/system-one-mosaic-benchmark
- AIM System One Index: https://aimultiple.com/system-one
