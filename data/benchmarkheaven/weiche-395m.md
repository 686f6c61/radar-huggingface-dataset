# benchmarkheaven/weiche-395m

## Resumen

Weiche-395M es un modelo de decisión local, no generativo, diseñado para enrutar peticiones entre modelos de distintos tamaños dentro del proyecto de código abierto auto-model-router. Lo desarrolla el usuario de HuggingFace benchmarkheaven sobre answerdotai/ModernBERT-large: conserva el encoder de 395 millones de parámetros y le añade cabezas de decisión tipadas que, en una única pasada hacia delante, devuelven la categoría de la tarea, varios escalares de dificultad y riesgo, cuatro probabilidades de necesidad (herramientas, visión, contexto largo, seguimiento) y la probabilidad de éxito de tres niveles de modelo (pequeño, medio, fuerte).

El problema que resuelve es el coste de decidir qué modelo atiende cada turno del usuario. Un router heurístico o un clasificador débil infrautiliza los modelos caros o infravalora los baratos; Weiche aprende esas decisiones a partir de resultados medidos, de modo que la política de enrutado pueda maximizar la calidad recuperada por unidad de coste. Según la model card, alcanza un 88,5 % de exactitud de categoría sobre datos retenidos (n=1134) y un 0,872 de macro-F1, frente al 9,3 % de exactitud del clasificador Laya 421M que usaba el backend local del router.

Es relevante ahora porque la inferencia se ejecuta en CPU mediante ONNX Runtime —sin necesidad de PyTorch— y también en el navegador con onnxruntime-web sobre WebGPU, con latencias de decisión en CPU del orden de 243-386 ms de mediana según la cuantización. Eso permite enrutado local en producción sin depender de una API externa y sin añadir GPU dedicada al componente de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabezas de decisión tipadas para clasificación y regresión |
| Parametros totales | 395 M (heredados de answerdotai/ModernBERT-large) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de answerdotai/ModernBERT-large) |
| Tipos de cuantizacion | fp16 (por defecto, coincide con fp32 dentro de 1e-3), int4 (423 MB, 96 % de acuerdo de categoría con fp32), int8 (con pérdida para esta arquitectura, 92 % de acuerdo; no recomendado) |
| Idiomas soportados | en (inglés); no se declaran otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (variantes fp16, int8 e int4) y safetensors en el repositorio |

Otros datos del repositorio: pipeline declarado text-classification, librería onnx, tamaño del repositorio 3,3 GB, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-large de 395 M de parámetros al que se le añaden cabezas tipadas. Una sola pasada produce ocho salidas: `category` (elección entre 9 clases: coding, agentic, math, knowledge, long_context, tool_use, design, summarisation y general), `scalars[1]` dificultad de rúbrica (0 = trivial, 1 = frontier, equivalente a la escala 0-4 del router dividida por 4), `scalars[0]` dificultad de resultado (proporción del panel de modelos que se espera que falle, aprendida de resultados medidos), `scalars[2]` stakes (coste de una respuesta errónea no detectada, 0-1), `noul` (probabilidades de needs_tools, needs_vision, needs_long_context y follow_up), `succ` (probabilidad de éxito de los niveles pequeño, medio y fuerte, aprendida de resultados medidos) y `route` (experimental: pequeño/medio/fuerte a partir de 14 características numéricas de estado del router, como caché fría o caliente, presupuesto de latencia, valor de una respuesta correcta y precios y latencias por nivel).

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card sí especifica que las cabezas de éxito se aprenden de resultados medidos y que no necesitan calibración posterior, a diferencia de los clasificadores basados solo en rasgos, a los que se les aplicó una calibración logística por nivel ajustada en un split separado. El modelo se entrenó específicamente para el router open source auto-model-router y su taxonomía de decisión está fijada por ese uso.

## Capacidades

- Clasificación de un turno de usuario en 9 categorías de tarea (coding, agentic, math, knowledge, long_context, tool_use, design, summarisation, general).
- Estimación de dificultad en dos ejes: dificultad de rúbrica y dificultad de resultado (tasa esperada de fallo del panel de modelos).
- Estimación de stakes, es decir, del coste de que una respuesta incorrecta pase desapercibida.
- Predicción de necesidades del turno: uso de herramientas, visión, contexto largo y si es un seguimiento de un turno anterior.
- Predicción de probabilidad de éxito para tres niveles de modelo (pequeño, medio y fuerte), a partir de resultados medidos.
- Enrutado experimental entre niveles pequeño, medio y fuerte a partir de 14 características numéricas de estado del sistema (caché, latencia, precios, valor de la respuesta).
- Inferencia en CPU mediante ONNX Runtime sin necesidad de PyTorch (la model card indica "no PyTorch needed").
- Inferencia en navegador mediante onnxruntime-web con WebGPU.
- Integración declarada como backend de clasificador en auto-model-router (`backend: local-route-head`).
- No genera texto: es un modelo de decisión y clasificación, no un modelo de lenguaje generativo.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.

## Casos de uso

- Enrutado de coste en producción: el router recibe cada turno y usa `succ` junto con los precios y las latencias de cada nivel para elegir `argmax P(success_t) − λ·cost_t`. Según la model card, con los success heads de Weiche-395M se recupera el 86,2 % de la brecha de calidad en RouterBench (n=1500) y el 80,3 % en tareas medidas posteriores al congelado de datos (n=1103).
- Control de gasto en asistentes conversacionales: la política puede fijarse para operar al 10 % o al 25 % del coste del nivel fuerte manteniendo calidad. En RouterBench, con los success heads se obtiene un 51,4 % de calidad al 10 % del coste del nivel fuerte y un 59,0 % al 25 %, frente al 47,2 % en ambos puntos de la heurística del router.
- Detección de necesidad de herramientas antes de invocar un agente: la salida `noul` incluye P(needs_tools), lo que permite decidir si se carga el catálogo de funciones o se responde directamente. La exactitud declarada de needs_tools es del 98,4 %.
- Detección de necesidad de visión o de contexto largo: las probabilidades P(needs_vision) y P(needs_long_context) permiten desviar la petición a un modelo multimodal o a uno con ventana amplia sin intentar primero con un modelo inadecuado.
- Gestión de conversaciones multi-turno: la salida P(follow_up) identifica si el turno depende de contexto previo, lo que sirve para decidir si se reenvía el historial completo o se usa una versión resumida antes de llamar al modelo generativo.
- Políticas de escalado por criticidad: el escalar de stakes permite reservar el nivel fuerte para peticiones donde un error no detectado tiene coste alto, y usar niveles baratos en tareas de bajo riesgo.
- Despliegue en el navegador o en el edge: al ejecutarse con onnxruntime-web sobre WebGPU, la decisión de enrutado puede tomarse en el cliente, sin enviar el turno a un servicio de clasificación externo, útil cuando hay requisitos de privacidad o de latencia.
- Servicio de decisión en CPU junto al router: la variante int4 ocupa 423 MB y ofrece 288 ms de mediana y 393 ms de p95 por decisión en CPU con 4 hilos, lo que permite coubicarla con el router sin GPU adicional.
- Evaluación y ajuste de políticas de enrutado: las salidas `succ` y `route` permiten simular barridos de λ sobre tráfico real antes de fijar una política de coste en producción.
- Filtrado previo en pipelines de evaluación: clasificar automáticamente los prompts de un conjunto de evaluación por categoría y dificultad para construir subconjuntos equilibrados o para comparar modelos por tipo de tarea.

## Benchmarks y rendimiento

Datos de la model card, todos sobre datos retenidos no usados en entrenamiento. Los baselines son las rutas de decisión existentes del router: su heurística, el clasificador local Laya 421M (`backend: local`) y la API hospedada Jev (`backend: hosted`). Jev se usó solo para esta evaluación y sus salidas nunca se emplearon para entrenamiento, calibración ni selección de datos.

| Clasificador | Exactitud de categoria (retenido, n=1134) | Macro-F1 | Exactitud de categoria en las 70 tareas retenidas del router | Exactitud de needs_tools | Correlacion de rango de dificultad |
|---|---:|---:|---:|---:|---:|
| Weiche-395M (este modelo) | 88,5 % | 0,872 | 94,9 % (59 tareas) | 98,4 % | 0,739 |
| Weiche-0.6B (Qwen3-0.6B, no publicado) | 88,5 % | 0,873 | 98,3 % (59 tareas) | 99,2 % | 0,736 |
| Jev 1.13 hospedado (API) | 85,8 % | 0,843 | 79,7 % (59 tareas) | 96,0 % | 0,753 |
| Laya 421M (backend `local` del router) | 9,3 % | 0,112 | 33,9 % (59 tareas) | 80,5 % | 0,297 |

| RouterBench retenido (n=1500; niveles Mistral-7B / Mixtral-8x7B / GPT-4-1106) | Brecha media recuperada (APGR) | Calidad al 10 % del coste del nivel fuerte | al 25 % | Cuota de coste para recuperar el 80 % de la brecha | el 95 % |
|---|---:|---:|---:|---:|---:|
| Heuristica del router (sin clasificador) | 0,494 | 47,2 % | 47,2 % | 100,0 % | 100,0 % |
| Laya 421M + calibracion ajustada | 0,812 | 48,9 % | 53,8 % | 38,9 % | 79,5 % |
| Jev 1.13 hospedado + calibracion ajustada | 0,850 | 50,3 % | 59,6 % | 28,2 % | 86,2 % |
| Weiche-395M traits + calibracion ajustada | 0,834 | 48,7 % | 58,2 % | 41,0 % | 88,1 % |
| Weiche-395M success heads | 0,862 | 51,4 % | 59,0 % | 31,4 % | 65,2 % |
| Weiche-0.6B success heads | 0,864 | 51,8 % | 59,0 % | 30,4 % | 68,7 % |

Calidad de referencia en RouterBench: siempre-pequeño 28,4 %, siempre-medio 47,2 %, siempre-fuerte 68,6 %. Un oráculo que conoce todos los resultados iguala la calidad de siempre-fuerte con el 17,1 % de su coste y alcanza un máximo del 77,2 %.

| Tareas medidas posteriores al congelado de datos (n=1103; niveles Mistral-Nemo-12B / Gemma-4-31B / DeepSeek-V3.2) | Brecha media recuperada (APGR) | Calidad al 10 % del coste del nivel fuerte | al 25 % | Cuota de coste para recuperar el 80 % de la brecha | el 95 % |
|---|---:|---:|---:|---:|---:|
| Heuristica del router (sin clasificador) | 0,459 | 42,5 % | 42,5 % | 60,8 % | 60,8 % |
| Laya 421M + calibracion ajustada | 0,747 | 48,2 % | 64,1 % | 47,5 % | 56,2 % |
| Jev 1.13 hospedado + calibracion ajustada | 0,734 | 48,9 % | 56,4 % | 50,5 % | 56,9 % |
| Weiche-395M traits + calibracion ajustada | 0,772 | 52,4 % | 62,4 % | 44,0 % | 54,4 % |
| Weiche-395M success heads | 0,803 | 52,9 % | 72,4 % | 44,5 % | 52,7 % |
| Weiche-0.6B success heads | 0,805 | 54,0 % | 71,4 % | 41,9 % | 52,7 % |

Calidad de referencia en estas tareas: siempre-pequeño 42,5 %, siempre-medio 95,0 %, siempre-fuerte 94,0 %. El oráculo iguala la calidad de siempre-fuerte con el 38,3 % de su coste y alcanza un máximo del 98,6 %.

| Latencia por decision en CPU, 4 hilos, mismo host cargado | p50 | p95 |
|---|---:|---:|
| Weiche-395M ONNX int4 | 288 ms | 393 ms |
| Weiche-395M ONNX int8 (con perdida) | 243 ms | 382 ms |
| Weiche-395M ONNX fp16 | 386 ms | 545 ms |
| Laya 421M (PyTorch, 7 preguntas) | 11061 ms | 12308 ms |

La correlación de rango de dificultad se calcula contra las etiquetas de rúbrica promediadas de dos familias de modelos; en esa medida Weiche y Jev están próximos (0,739 frente a 0,753).

## Requisitos de hardware

- Tamaño de pesos: la variante int4 ocupa 423 MB según la model card. Las variantes fp16 e int8 no se cuantifican en la información disponible, aunque por coherencia con 395 M de parámetros serían del orden de 790 MB y 400 MB respectivamente (estimación a partir del tamaño, no dato publicado).
- Inferencia en CPU: es el modo de despliegue documentado y medido. Con 4 hilos y un host cargado, fp16 da 386 ms de p50 y 545 ms de p95; int4 da 288 ms y 393 ms; int8 da 243 ms y 382 ms.
- Configuración recomendada en el router: `threads: 2` con `variant: fp16` en el ejemplo de configuración de auto-model-router.
- GPU: no se publican requisitos de VRAM ni GPU recomendadas. Dado el tamaño del modelo (menos de 1 GB en fp16), cabe en cualquier GPU de consumo con memoria suficiente, e incluso en iGPU, pero la información disponible no incluye cifras de VRAM ni pruebas en GPU dedicada (A100, H100, RTX 4090 u otras).
- Navegador: soporta ejecución mediante onnxruntime-web con WebGPU.
- Opciones de despliegue: ONNX Runtime en Python (sin PyTorch), onnxruntime-web en navegador y el backend `local-route-head` de auto-model-router. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y por el tipo de modelo (encoder de clasificación, no generativo) no es esperable que esos servidores de inferencia generativa lo soporten.
- Latencia frente al baseline local: el router con Laya 421M en PyTorch medía 11061 ms de p50 y 12308 ms de p95 para 7 preguntas, muy por encima de las latencias por decisión medidas para Weiche-395M.
- Determinismo y precisión: la variante fp16 coincide con fp32 dentro de 1e-3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Weiche-395M | 395 M | no disponible | 88,5 % de exactitud de categoria (n=1134), macro-F1 0,872, APGR 0,862 en RouterBench con success heads | apache-2.0 | Publicado en HuggingFace (benchmarkheaven/weiche-395m) |
| Weiche-0.6B (Qwen3-0.6B) | 0,6 B | no disponible | 88,5 % de exactitud de categoria, macro-F1 0,873, APGR 0,864 en RouterBench con success heads | no disponible | No publicado |
| Jev 1.13 | no disponible | no disponible | 85,8 % de exactitud de categoria, macro-F1 0,843, APGR 0,850 en RouterBench (con calibracion ajustada) | no disponible | Solo como API hospedada |
| Laya 421M | 421 M | no disponible | 9,3 % de exactitud de categoria, macro-F1 0,112, APGR 0,812 en RouterBench (con calibracion ajustada) | no disponible | Backend `local` del router |

Como referencia de categoría, Weiche-395M es un clasificador encoder de 395 M; no compite con modelos generativos de su mismo orden de parámetros, sino con clasificadores de enrutado y con APIs de decisión. No se dispone de datos de otros routers open source comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto ni respuestas; solo devuelve etiquetas, probabilidades y escalares. No debe usarse como sustituto de un LLM.
- Idioma: solo se declara inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas, y la taxonomía de categorías está calibrada sobre tráfico en inglés.
- Taxonomía cerrada: las 9 categorías y las cabezas de decisión están fijadas por el router. Turnos que no encajen en ese esquema se forzarán a una de las clases existentes.
- Cuantización int8 desaconsejada: la propia model card la describe como "lossy" para esta arquitectura, con un 92 % de acuerdo de categoría con fp32, frente al 96 % de int4. La variante recomendada es fp16.
- Dependencia de la columna `succ`: las probabilidades de éxito se aprenden de resultados medidos con paneles de modelos concretos (Mistral-7B / Mixtral-8x7B / GPT-4-1106 en RouterBench, y Mistral-Nemo-12B / Gemma-4-31B / DeepSeek-V3.2 en las tareas posteriores). El comportamiento puede degradarse si los modelos enrutados difieren de esos paneles.
- Cabeza `route` experimental: la propia model card la marca como experimental; conviene tratarla como tal en producción.
- Latencia en CPU no trivial: 288-386 ms de mediana por decisión con 4 hilos en un host cargado. En flujos interactivos puede ser necesario cachear decisiones o usar hilos adicionales.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, con lo que la validación por parte de terceros es inexistente.
- Fechas de creación y actualización del repositorio: 26 de septiembre de 2026 (creación) y misma fecha (actualización), según los metadatos.
- Sesgos: no se documenta ningún análisis de sesgos, toxicidad ni equidad en la información disponible.
- Alucinación: al ser un clasificador no genera texto, por lo que el riesgo de alucinación se traslada a errores de clasificación y a probabilidades mal calibradas, no a contenido inventado.
- Licencia: apache-2.0, sin restricciones declaradas para uso comercial. Conviene revisar igualmente la licencia del modelo base answerdotai/ModernBERT-large, ya que el modelo es un derivado.
- No se documentan requisitos de VRAM, GPU recomendadas ni soporte en servidores de inferencia generativa (vLLM, TGI, llama.cpp, Ollama).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/benchmarkheaven/weiche-395m
- Repositorio GitHub del modelo y scripts de evaluación: https://github.com/fstandhartinger/weiche
- Proyecto auto-model-router: https://github.com/fstandhartinger/auto-model-router
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Scripts de evaluación y JSON de resultados: carpeta `eval/` del repositorio de HuggingFace y del repositorio de GitHub
