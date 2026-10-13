# muhamedkamil/berna-r8-v2

## Resumen

Berna R8 v2 es un modelo de lenguaje experimental desarrollado por Muhamed Kamil (muhamedkamil), ingeniero de machine learning en Tahaluf Al Emarat Technical Solutions. Se trata de la segunda iteracion de la generacion R8 de la familia Berna, entrenada desde cero y construida sobre la base de Berna R7 v3. Su rasgo distintivo es una arquitectura "cell-based" (basada en celulas) con un limite maximo de 5.000 celulas, en lugar de una arquitectura transformer densa convencional. El modelo se publica como material de investigacion, con licencia CC BY-NC 4.0 y uso exclusivamente no comercial.

El modelo tiene aproximadamente 1.200 millones de parametros, con una configuracion de 28 capas y una dimension de modelo de 1.536. Se entreno durante 10.200 pasos sobre datos en ingles y matematicas, alcanzando una loss minima de aproximadamente 4,0, lo que equivale a una perplejidad en torno a 55. El entrenamiento termino con unas 4.500 celulas activas de las 5.000 permitidas y alrededor de 360 "nacimientos" de celulas, lo que indica que el mecanismo de crecimiento celular se mantuvo por debajo del limite impuesto.

Su relevancia actual es fundamentalmente de investigacion: explora un paradigma alternativo de arquitectura con olvido acotado (bounded forgetting) y crecimiento celular controlado, con experimentos documentados sobre desaprendizaje selectivo al hacer fine-tuning en aleman. No es un modelo orientado a produccion ni compite en benchmarks estandar, y no se han publicado resultados en evaluaciones convencionales como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cell-based language model (28 capas x 1536 dimension, limite de 5.000 celulas) |
| Parametros totales | ~1,2 mil millones (1.2B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles y matematicas en el entrenamiento base; aleman en el experimento de fine-tuning (no se especifica lista oficial de idiomas) |
| Licencia | CC BY-NC 4.0 (uso exclusivamente de investigacion, sin uso comercial) |
| Formato de pesos | no disponible |

Otros datos declarados en la model card:

| Parametro | Valor |
|---|---|
| Pasos de entrenamiento | 10.200 |
| Learning rate | 1,5e-4 |
| Acumulacion de gradiente | 4 |
| Frecuencia de medida | cada 500 pasos |
| Loss minima | ~4,0 |
| Celulas finales | ~4.500 (limite de 5.000) |
| Nacimientos de celulas | ~360 |
| Base de partida | Berna R7 v3 |

## Arquitectura y entrenamiento

Berna R8 v2 emplea una arquitectura propia basada en celulas, con 28 capas y una dimension de modelo de 1.536, que resulta en aproximadamente 1.200 millones de parametros. Frente a un transformer denso convencional, el modelo mantiene una poblacion dinamica de celulas con un tope duro de 5.000 unidades para evitar la explosion celular. Durante el entrenamiento se registraron unos 360 nacimientos de celulas y la poblacion final se situo en torno a 4.500, por debajo del limite. La version incluye correcciones respecto a R7 v3: activacion de K2/K5/K6 por celula, umbral de Plexus fijado en 0,3, el citado limite de 5.000 celulas y un mecanismo denominado SmartFreezer activo.

El entrenamiento se realizo desde cero sobre una mezcla de ingles y matematicas, con 10.200 pasos, learning rate de 1,5e-4 y acumulacion de gradiente de 4. La loss minima alcanzada fue de aproximadamente 4,0. La primera iteracion (R8 v1) se detuvo tras estancarse en una loss de 5,49 con las 5.000 celulas copadas, atribuyendose el problema a la inestabilidad de un learning rate de 3e-4. La model card tambien documenta un experimento de olvido acotado (H2), realizado sobre R7 v3 en el paso 1400 con 2.000 pasos adicionales de fine-tuning en aleman: la loss en ingles paso de 4,078 a 4,481 (F_eng = 0,403, aproximadamente un 10 por ciento de olvido, descrito como acotado), mientras que la loss en aleman bajo de 4,741 a 2,678.

No se detalla la composicion exacta del dataset, el numero total de tokens procesados ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion.

## Capacidades

- Generacion de texto en ingles: el modelo esta entrenado explicitamente sobre datos en ingles, por lo que su capacidad principal declarada es la generacion de texto en ese idioma.
- Razonamiento matematico basico: la mezcla de entrenamiento incluye matematicas ademas de ingles, si bien no se aportan resultados que cuantifiquen esta capacidad.
- Adaptacion multilingue mediante fine-tuning: el experimento H2 demuestra que el modelo base puede adaptarse a otro idioma (aleman) con 2.000 pasos de fine-tuning, reduciendo la loss en ese idioma de 4,741 a 2,678.
- Olvido acotado y controlado: la arquitectura incorpora mecanismos de olvido acotado, con una metrica F_eng = 0,403 en el experimento de cambio de idioma, lo que sugiere un control parcial de la degradacion de la lengua original.
- Crecimiento celular limitado: el mecanismo de celulas permite que el modelo incremente su capacidad interna durante el entrenamiento, con un tope configurable (5.000 en esta version).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Investigacion en arquitecturas alternativas a transformer: el modelo sirve como banco de pruebas para estudiar una arquitectura basada en celulas con crecimiento limitado, permitiendo comparar su comportamiento con modelos densos de tamano similar en tareas controladas de laboratorio.
- Estudio de olvido catastrófico y olvido acotado: el experimento H2 documenta como un fine-tuning en aleman degrada solo parcialmente el rendimiento en ingles (F_eng = 0,403), lo que lo convierte en material util para investigadores que estudian retencion de conocimiento al cambiar de dominio o idioma.
- Reproduccion de experimentos de entrenamiento desde cero: al publicarse con configuracion de entrenamiento detallada (10.200 pasos, lr 1,5e-4, acumulacion 4), permite reproducir el ciclo completo y analizar la dinamica de nacimiento de celulas.
- Analisis de la dinamica de capacidad interna: los ~360 nacimientos y las ~4.500 celulas finales ofrecen datos para estudiar como una arquitectura decide cuando anadir capacidad y cuando dejar de hacerlo.
- Fine-tuning academico en idiomas distintos del ingles: el flujo documentado (base R7 v3 en el paso 1400 mas 2.000 pasos en aleman) es replicable para estudiar adaptacion linguistica en modelos pequenos de ~1,2B.
- Docencia y prototipado en cursos de machine learning: un modelo pequeno con licencia no comercial y codigo de entrenamiento documentado es adecuado para practicas de entrenamiento, evaluacion de loss y analisis de curvas de aprendizaje.
- Generacion de texto en ingles en entornos de investigacion no comerciales: dentro de los limites de la licencia CC BY-NC 4.0, puede usarse para generar texto en ingles en experimentos academicos, asumiendo la calidad limitada que implica una loss de ~4,0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos publicados son metricas de entrenamiento y de olvido:

| Metrica | Valor |
|---|---|
| Loss minima (R8 v2, ingles + matematicas) | ~4,0 |
| Loss minima (R8 v1, detenido) | 5,49 |
| Perplejidad aproximada con loss 4,0 | ~55 |
| Ingles antes del fine-tuning en aleman (H2) | 4,078 |
| Ingles despues del fine-tuning en aleman (H2) | 4,481 |
| F_eng (olvido en ingles) | 0,403 (~10 por ciento, acotado) |
| Aleman antes del fine-tuning (H2) | 4,741 |
| Aleman despues del fine-tuning (H2) | 2,678 |

No se dispone de comparaciones con modelos de referencia en tareas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales publicados. Como referencia aritmetica basada solo en el numero de parametros (~1,2B): en FP16 unos 2,4 GB de pesos; en INT8 unos 1,2 GB; en cuantizacion de 4 bits unos 0,6-0,8 GB, a lo que habria que sumar el overhead del runtime y de la cache de activaciones.
- GPU recomendadas: no disponible en la informacion publicada. Por tamano, un modelo de ~1,2B cabria en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090 en FP16, INT8 o 4 bits, sin que exista confirmacion oficial.
- Caberia en GPU de consumo: previsiblemente si, por el orden de magnitud del modelo, aunque no hay confirmacion ni mediciones publicadas.
- Opciones de despliegue: no disponible. La model card no indica soporte para vLLM, llama.cpp, Ollama, TGI ni ningun otro runtime, ni especifica el formato de pesos.
- Latencia y throughput: no disponible.

Advertencia: los calculos de VRAM anteriores son estimaciones derivadas del recuento de parametros, no cifras oficiales. Una arquitectura basada en celulas podria tener requisitos de memoria distintos a los de un transformer denso equivalente.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables. El unico modelo relacionado documentado es otro modelo del mismo autor:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| berna-r8-v2 | ~1,2B (28L x 1536d) | no disponible | CC BY-NC 4.0 | no disponible | Cell-based, loss ~4,0, 10.200 pasos |
| berna-prototype-162m | 162M | 2K | other | Safetensors (Transformers, Text Generation) | Ingles y arabe, prototipo from-scratch |

No se identifican en la informacion disponible modelos de terceros directamente comparables en la misma categoria (arquitectura basada en celulas con crecimiento limitado).

## Limitaciones y advertencias

- Licencia restrictiva: CC BY-NC 4.0 implica uso exclusivamente de investigacion; queda prohibido el uso comercial sin autorizacion adicional del autor.
- Calidad de generacion limitada: una loss minima de ~4,0 (perplejidad en torno a 55) esta lejos de los valores tipicos de modelos de produccion, por lo que cabe esperar texto poco fiable.
- Riesgo de alucinacion: no se documentan fases de alineacion (RLHF, DPO) ni evaluaciones de veracidad, por lo que la propension a generar contenido incorrecto no esta caracterizada.
- Cobertura idiomatica reducida: el entrenamiento base se limita a ingles y matematicas; el aleman solo se ha trabajado en un experimento de fine-tuning acotado. El castellano no aparece en la informacion disponible.
- Longitud de contexto desconocida: no se publica la ventana de contexto, lo que impide planificar tareas que requieran contexto largo.
- Formato y despliegue sin especificar: no se indica el formato de pesos ni los runtimes soportados, lo que complica su integracion en pipelines existentes.
- Olvido parcial demostrado: el propio experimento H2 documenta una degradacion de la loss en ingles de 4,078 a 4,481 tras el fine-tuning en aleman (F_eng = 0,403), evidencia de que el ajuste posterior afecta al conocimiento previo.
- Sesgos no evaluados: no hay analisis de sesgos demograficos, culturales o linguisticos en la informacion disponible.
- Madurez temprana: el modelo tiene 0 descargas y 0 likes en HuggingFace y la version previa R8 v1 se detuvo por inestabilidad, lo que indica un desarrollo en fase experimental.
- Fechas de publicacion: la model card esta fechada en 2026 (creacion 2026-10-12), dato relevante al contextualizar su madurez frente a otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muhamedkamil/berna-r8-v2
- Modelo relacionado del mismo autor (berna-prototype-162m): https://huggingface.co/muhamedkamil/berna-prototype-162m
- Listado de modelos con la etiqueta berna: https://huggingface.co/models?other=berna
- Perfil de GitHub del autor: https://github.com/MuhamedKamil
- Ficha de LLM Explorer del prototipo Berna 162M: https://llm-explorer.com/model/muhamedkamil%2Fberna-prototype-162m,7EV3Al1wj0bbUB9ciZ3uty
- BenchLM (agregador de benchmarks, octubre de 2026): https://benchlm.ai/
- Cita declarada por el autor: @misc{berna_r8_2026, author = {Kamil, Muhamed}, title = {Berna R8}, year = {2026}}
