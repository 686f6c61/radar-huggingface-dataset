# emirozcan16/AA-VL-4B

## Resumen

AA-VL-4B es un ajuste fino de Qwen3-VL-4B-Instruct orientado a una tarea muy concreta: el *grounding* de interfaces gráficas (GUI grounding). Dado un pantallazo y una instrucción en lenguaje natural ("pulsa el icono de embudo a la derecha de la barra de búsqueda"), el modelo devuelve una única línea de acción con coordenadas de clic en una rejilla normalizada de 0 a 999, o bien una negativa explícita a actuar. Lo publica el usuario emirozcan16 y el problema que ataca es el cuello de botella clásico de los agentes de ordenador: convertir intención en un píxel exacto sin depender de un *planner* ni de recortes o zoom previos.

Técnicamente es un LoRA de rango 32 fusionado en los pesos del modelo base, entrenado con unos 7.000 ejemplos curados (aproximadamente 60 % de clics y 40 % de negativas) y con un presupuesto declarado de unos 8 dólares de cómputo en tres meses. La relevancia está en su enfoque de eficiencia de datos: en lugar de escalar el conjunto de entrenamiento, el autor prioriza la calidad y añade pares sintéticos de rechazo para que el modelo aprenda cuándo no debe hacer clic, algo crítico en automatización de escritorio.

El modelo tiene 4.437.815.808 parámetros (4,44 B), licencia Apache-2.0, se distribuye en safetensors para transformers y con una versión GGUF para llama.cpp, y sus resultados son modestos en *grounding* general (UI-Vision 29,93) pero notablemente altos en el conjunto OSWorld-G (65,3 original / 74,5 refinado), siempre según ejecuciones propias del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje (familia Qwen3-VL, `qwen3_vl`); ajuste LoRA r=32 fusionado |
| Parámetros totales | 4.437.815.808 (4,44 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | GGUF disponible en repositorio aparte (niveles concretos no especificados); pesos safetensors en el repo principal |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF (llama.cpp); adaptador LoRA separado |

## Arquitectura y entrenamiento

La base es Qwen3-VL-4B-Instruct, un transformer multimodal que procesa imágenes y texto en una sola secuencia y genera texto; sobre él se aplicó un LoRA de rango 32 para especializarlo en predicción de coordenadas. El entrenamiento se hizo en dos fases: el adaptador inicial se entrenó en 4 bits (QLoRA) y los últimos 250 pasos se completaron en fp16, tras lo cual el adaptador se fusionó en los pesos base para producir el repositorio safetensors distribuido.

El conjunto de entrenamiento son aproximadamente 7.000 filas curadas con una proporción de 60 % clics y 40 % negativas. Las fuentes de etiquetas de clic son Jedi (xlangai/Jedi: *grounding* de iconos y componentes, `train_raw`/`val_raw`, `os_layout` y librerías de componentes) y una porción de *grounding* de GUI de GroundCUA (unas 2.500 filas, licencia MIT); las negativas se construyeron con pares sintéticos de instrucción emparejada con una captura no relacionada (documento-documento, icono-icono, escritorio-escritorio) y con capturas de escritorio de ScreenSpot-v2. El autor declara no haber usado datos privados ni raspado de usuarios, no haber entrenado con etiquetas de respuesta de ningún benchmark y no publicar por ahora el conjunto ensamblado. La innovación destacable no es arquitectónica sino de formato de salida: una sola línea `click x=<int> y=<int>` en escala 0-999 o la palabra `refuse`, con decodificación greedy y sin *scaffolding* de agente.

## Capacidades

- Predicción de coordenadas de clic a partir de una captura de pantalla y una instrucción en lenguaje natural, en rejilla normalizada 0-999.
- Abstención explícita (`refuse`) cuando la instrucción no corresponde al contenido de la imagen, capacidad entrenada de forma deliberada con pares sintéticos.
- Comprensión de elementos de interfaz: iconos, componentes, barras de búsqueda, menús y disposición general de escritorio.
- Salida en formato de una sola línea de acción, apta para parseo directo en un bucle de agente.
- Capacidades heredadas del modelo base Qwen3-VL-4B-Instruct (visión-lenguaje general, conversación multimodal), aunque no evaluadas ni garantizadas por el autor del ajuste.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada para el ajuste.
- Soporte de agentes multi-paso y planificación: no disponible; el modelo está diseñado como ejecutor de un único paso, sin *planner*.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas repetitivas de escritorio: el modelo recibe la captura de la aplicación y una instrucción del tipo "pulsa el botón Exportar" y devuelve las coordenadas para que un script de control de ratón ejecute el clic, sin necesidad de selectores DOM ni de árboles de accesibilidad.
- Agentes de navegador y RPA con *fallback* visual: integrar AA-VL-4B como capa de localización cuando los selectores CSS fallan, usando la salida `click x= y=` como coordenada final y el token `refuse` para descartar objetivos inexistentes.
- Testing de interfaz automatizado: validar que un elemento descrito en una historia de usuario existe y es localizable en una captura de CI, y usar la tasa de `refuse` como señal de regresión cuando un rediseño elimina controles.
- Asistencia a accesibilidad: traducir instrucciones verbales de un usuario a coordenadas sobre la pantalla para sistemas de control por voz o mirada, con la abstención como red de seguridad ante instrucciones ambiguas.
- Etiquetado y auditoría de datasets de GUI: usar las predicciones y el artefacto `predictions.jsonl` incluido en el repositorio para comparar coordenadas predichas con cajas objetivo y detectar muestras mal etiquetadas.
- Despliegue en local o en el borde: con 4,44 B de parámetros y versión GGUF, puede ejecutarse en un portátil con GPU de consumo para automatizaciones que no pueden enviar capturas de pantalla a un servicio en la nube por motivos de privacidad.
- Prototipado rápido de agentes de ordenador: al devolver una única línea de acción sin *scaffolding*, se integra en un bucle `captura -> instrucción -> clic -> nueva captura` con muy poco código de pegamento.

## Benchmarks y rendimiento

Resultados publicados por el autor, predicción única greedy (pass@1), sin recorte, zoom, *planner* ni pass@k:

| Benchmark | AA-VL-4B |
|---|---|
| OSWorld-G Original | 65,3 |
| OSWorld-G Refined | 74,5 |
| UI-Vision Final | 29,93 |
| UI-Vision Basic | 39,28 |
| UI-Vision Functional | 37,75 |
| UI-Vision Spatial | 14,21 |

Desglose de verificación incluido en el repositorio: OSWorld-G con 1.128 filas (564 muestras evaluadas en dos variantes) y 368 aciertos en Original / 420 en Refined sobre 564; UI-Vision con 5.479 filas y 1.640 aciertos. El autor no incluye tabla comparativa con otros modelos de forma deliberada, argumentando que las cifras publicadas varían según prompt, protocolo y *scaffolding*. No se han publicado resultados independientes de terceros ni de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 4,44 B de parámetros): en fp16/bf16 en torno a 9 GB solo de pesos, más overhead de activaciones y del codificador visual, aproximadamente 11-13 GB; en cuantización de 8 bits, unos 5-6 GB; en 4 bits, unos 3-4 GB. Son estimaciones, no cifras publicadas por el autor.
- GPU recomendadas: A100 o H100 para servir en fp16 con concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 en local sin problemas.
- ¿Cabe en GPU de consumo? Sí. En 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RTX 5070 Ti) cabe en fp16 con margen ajustado; en 8-12 GB es necesario cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText` con `trust_remote_code=True`, tal como documenta el autor) y llama.cpp mediante el repositorio GGUF. Compatibilidad con vLLM, TGI, Ollama u otros servidores no está verificada en la información disponible.
- Latencia y throughput: no disponibles. El autor solo reporta que la evaluación usa decodificación greedy con `max_new_tokens=64`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Datos de benchmark en la información disponible |
|---|---|---|---|---|---|
| AA-VL-4B | 4,44 B | no disponible | Grounding GUI especializado (LoRA fusionado) | Apache-2.0 | OSWorld-G 65,3 / 74,5; UI-Vision 29,93 (ejecuciones propias) |
| Qwen3-VL-4B-Instruct | 4,4 B (aprox., modelo base) | no disponible | Visión-lenguaje general, instrucciones | Apache-2.0 | No disponible en la información proporcionada |
| Otros modelos de GUI grounding (UI-TARS, OS-Atlas, etc.) | no disponible | no disponible | Grounding y agentes de GUI | no disponible | No disponible; el autor evita la comparación directa por diferencias de protocolo |

La comparación relevante es con su propio modelo base: AA-VL-4B cambia capacidades generales de visión-lenguaje por una especialización estrecha en localización de elementos y abstención. No hay datos que permitan afirmar que supere o iguale a otros modelos de grounding en las mismas condiciones.

## Limitaciones y advertencias

- Las coordenadas se emiten en una rejilla normalizada de 0 a 999; cualquier integración debe reescalar a píxeles con las dimensiones reales de la imagen y aplicar la regla oficial de punto-en-caja.
- El rendimiento en *grounding* espacial es bajo: UI-Vision Spatial se queda en 14,21, muy por debajo de Basic (39,28) y Functional (37,75). Las instrucciones que dependen de relaciones espaciales entre elementos son el punto débil conocido.
- El modelo devuelve una única predicción greedy, sin pass@k ni verificación; un fallo de localización no tiene segunda oportunidad dentro del propio modelo.
- Los benchmarks no han sido reproducidos por terceros y provienen de una sola semilla y de ejecuciones del propio autor, con el protocolo descrito en su script de evaluación.
- El conjunto de entrenamiento no está publicado, lo que limita la auditoría de sesgos y de composición de datos.
- No se especifican idiomas soportados; el prompt de ejemplo está en inglés y no hay evaluación multilingüe.
- Riesgo de alucinación de coordenadas: ante instrucciones ambiguas o elementos ausentes, el modelo puede emitir un clic en lugar de `refuse`; la tasa de rechazo depende de la calidad de los pares sintéticos de negativas.
- Puede heredar los sesgos del modelo base Qwen3-VL-4B-Instruct, no evaluados en esta ficha.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias de los datos de origen (Jedi, GroundCUA MIT, ScreenSpot-v2) si se redistribuye el modelo o se reentrena.
- El repositorio ocupa 17,8 GB, muy por encima del tamaño de los pesos en media precisión, por lo que hay que prever espacio en disco y tiempo de descarga.
- Requiere `trust_remote_code=True` en transformers; hay que revisar el código remoto antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emirozcan16/AA-VL-4B
- Versión GGUF para llama.cpp: https://huggingface.co/emirozcan16/AA-VL-4B-GGUF
- Adaptador LoRA (solo pesos del adaptador): https://huggingface.co/emirozcan16/AA-VL-4B-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset Jedi: https://huggingface.co/datasets/xlangai/Jedi
- Dataset ScreenSpot-v2: https://huggingface.co/datasets/OS-Copilot/ScreenSpot-v2
- Artefactos de verificación en el repositorio: `osworld_g_predictions.jsonl`, `predictions.jsonl`, `VERIFY.md`, `osworld_g_eval.py`
- Contacto del autor: ozcannemir08@gmail.com
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
