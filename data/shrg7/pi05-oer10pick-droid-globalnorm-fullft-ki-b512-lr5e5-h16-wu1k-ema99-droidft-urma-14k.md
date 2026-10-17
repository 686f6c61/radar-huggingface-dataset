# shrg7/pi05-oer10pick-droid-globalnorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-urma-14k

## Resumen

Este repositorio contiene un checkpoint de pi0.5, un modelo VLA (vision-language-action) para robótica publicado con openpi en JAX. Lo sube el usuario shrg7 y está especializado en tareas de pick: en simulación los episodios se cortan tras el agarre, mientras que DROID se mantiene completo. La política recibe una descripción del robot —hasta 8 articulaciones × 27 números por articulación— que se inyecta en el experto de acciones mediante una red pequeña llamada URMA.

El checkpoint corresponde a 14.000 actualizaciones de un run que llega a 100.000, así que es un estado intermedio. Parte de pi05_base con full fine-tune y usa una receta de knowledge insulation con cabeza FAST-token y experto flow-matching, normalización global de cuantiles, EMA 0,99 y horizonte de acción 16. La mezcla de datos es DROID (77,7% de episodios) y OER-10 simulado multi-robot (22,3%).

Es relevante para investigar generalización entre robots y recetas de openpi, pero no hay licencia, idiomas ni benchmarks publicados, y no incluye estado del optimizador. No es un modelo de texto general: es una política de robot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) pi0.5 sobre openpi/JAX; experto de acciones flow-matching y cabeza FAST-token; columna vertebral no detallada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (la información no describe una arquitectura MoE) |
| Longitud de contexto | no disponible; horizonte de acción de 16 pasos |
| Tipos de cuantización | no disponible; no se documentan variantes GGUF, GPTQ o AWQ |
| Idiomas soportados | no disponible; los ejemplos de instrucción de la model card están en inglés |
| Licencia | no disponible |
| Formato de pesos | Orbax (`params/`); assets de normalización en `assets/`; tabla de robots en NPZ |
| Framework | JAX / openpi |
| Pipeline | robotics |
| Tamaño del repositorio | 12,5 GB |
| Checkpoint | 13999 = 14.000 actualizaciones de optimizador; el run llega a 100.000 |
| Tarea | pick; en simulación los episodios se cortan tras el agarre; DROID completo |
| Condicionamiento por robot | URMA: tabla de hasta 8 articulaciones × 27 números por articulación |
| Normalización | tabla global de cuantiles sobre la mezcla DROID + OER-10 |
| Pesos publicados | EMA con decay 0,99; sin estado del optimizador |

## Arquitectura y entrenamiento

El modelo es un checkpoint de pi0.5 en openpi/JAX, inicializado desde pi05_base con full fine-tune. La receta combina un objetivo dual de knowledge insulation: una cabeza FAST-token y un experto de acciones flow-matching. La política recibe la descripción del robot que controla —hasta 8 articulaciones × 27 números por articulación, incluyendo límites articulares y anchura de pinza— y la pasa por una red pequeña (URMA) que condiciona al experto de acciones. La fila correspondiente se localiza mediante una huella de la cadena `embodiment_params` del episodio. Las capas URMA se inicializan desde cero, con la capa de salida a cero.

El entrenamiento usa 4 × H200 con FSDP 4, warmup de 1k pasos, LR constante 5e-5, EMA 0,99 y batch 512 (256 × 2 acumulados) hasta el paso 2.000; después el batch baja a 256, aunque el nombre de la configuración conserva `b512`. Los datos se reparten por número de episodios en DROID 77,7% y OER-10 simulado multi-robot con builds solo de pick 22,3%; no incluye MolmoBot ni realrig9k. No se documentan el número total de tokens, la composición detallada del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación para tareas de pick a partir de observaciones visuales e instrucciones de lenguaje.
- Condicionamiento explícito por embodiment: lee una tabla de hasta 8 articulaciones × 27 números por articulación (límites articulares, anchura de pinza, etc.) y la inyecta en el experto de acciones mediante URMA.
- Horizonte de acción de 16 pasos.
- Doble objetivo: cabeza FAST-token y experto flow-matching.
- Acepta instrucciones cortas del tipo "Pick up the X" en los ejemplos de la model card.
- No se documenta tool calling, function calling, uso como agente multi-paso, matemáticas, código, audio ni generación de texto general.
- No se documenta multilingüismo.
- No se documenta visión general (VQA o captioning); la visión se usa como entrada para la política de acciones.

## Casos de uso

- Evaluación de generalización multi-robot en simulación: usar el checkpoint en robots OER-10 con distintas tablas URMA para comprobar si el condicionamiento por articulaciones y pinza permite reutilizar una misma política entre embodiments.
- Investigación en picking simulado: ejecutar episodios "Pick up the X" cortados tras el agarre para medir la tasa de acierto en la fase de aproximación y cierre de pinza, que es el tramo para el que se diseñó esta mezcla.
- Base para fine-tuning en DROID: el 77,7% de los episodios de entrenamiento son DROID, por lo que el checkpoint puede servir como punto de partida para adaptar la política a tareas reales de ese robot.
- Reproducción de recetas de openpi: comparar el efecto de la normalización global de cuantiles, el EMA 0,99, el horizonte 16 y el objetivo de knowledge insulation frente a otras configuraciones del mismo framework.
- Prototipos de laboratorio con robot articulado: integrar el checkpoint en un pipeline openpi/JAX y describir el robot mediante la tabla URMA para probar agarres controlados, siempre con límites de seguridad y validación previa en simulación.
- Generación de rollouts sintéticos: usar la política para recolectar trayectorias de pick en simulación y alimentar estudios de imitación, análisis de fallos o aumento de datos.
- Estudio de robustez ante cambios de embodiment: variar límites articulares, número de articulaciones o anchura de pinza en la tabla URMA para analizar la sensibilidad del experto de acciones.
- Comparación de cabezas FAST-token y flow-matching: analizar qué objetivo aporta más estabilidad en pick dentro de la misma receta de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Tasa de éxito en pick simulado | no disponible |
| Comparación con pi0.5 base | no disponible |

## Requisitos de hardware

- Entrenamiento: 4 × H200 con FSDP 4; batch 512 (256 × 2 acumulados) hasta el paso 2.000 y después 256.
- VRAM de inferencia: no disponible. El repositorio ocupa 12,5 GB, pero incluye pesos Orbax y assets, no estado del optimizador; no es una medida directa de VRAM.
- GPU recomendadas: no disponible. El único dato de hardware es el entrenamiento en H200.
- GPU de consumo: no disponible; no se documenta que quepa en RTX 4090, RTX 3090 ni en qué cuantización.
- Despliegue: openpi/JAX con checkpoints Orbax. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; no es un LLM de texto.
- Latencia y throughput: no disponible; solo se conoce el horizonte de acción de 16 pasos.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de alternativas en la información proporcionada. La única referencia directa es pi05_base, usado como inicialización.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | no disponible | no disponible (horizonte 16) | no disponible | no disponible | HuggingFace; 0 descargas, 0 likes |
| pi05_base | no disponible | no disponible | no disponible | no disponible | referenciado como inicialización; sin URL en la información |
| OpenVLA | no disponible | no disponible | no disponible | no disponible | no evaluado en esta ficha |
| Octo | no disponible | no disponible | no disponible | no disponible | no evaluado en esta ficha |

## Limitaciones y advertencias

- Checkpoint intermedio: 14.000 de 100.000 actualizaciones; no es el modelo final de la ejecución.
- Tarea limitada: en simulación solo cubre pick y los episodios se cortan tras el agarre; no cubre manipulación completa.
- Mezcla de datos sesgada a DROID (77,7%); no incluye MolmoBot ni realrig9k.
- Dependencia de la tabla URMA y de la huella de `embodiment_params`: si falta la fila o no coincide, el condicionamiento por robot puede ser incorrecto.
- Normalización global de cuantiles sobre la mezcla; puede no ser óptima para un robot concreto.
- Sin estado del optimizador: no se puede reanudar el entrenamiento de forma exacta.
- Licencia no disponible: el uso comercial queda en un marco jurídico incierto.
- Sin benchmarks publicados ni validación comunitaria (0 descargas, 0 likes).
- Riesgo de acciones erróneas en robot real; requiere límites de seguridad, parada de emergencia y validación en simulación.
- No se documentan sesgos; al ser un modelo de acción, el riesgo principal es el fallo de percepción o agarre, no la alucinación textual.
- Idiomas no documentados; las instrucciones de ejemplo están en inglés.

## Enlaces

- [HuggingFace: shrg7/pi05-oer10pick-droid-globalnorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-urma-14k](https://huggingface.co/shrg7/pi05-oer10pick-droid-globalnorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-urma-14k)
- Model card: misma URL del repositorio.
- openpi: framework citado en la model card; no se proporciona URL en la información disponible.
