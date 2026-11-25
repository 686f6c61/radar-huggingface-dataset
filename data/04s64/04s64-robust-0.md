# 04s64/04s64-Robust-0

## Resumen

04s64 Robust-0 es un ajuste fino del modelo vision-language-action (VLA) pi0.5 de Physical Intelligence, desarrollado por 04s64.ai y publicado en Hugging Face bajo la librería LeRobot. El objetivo declarado es mejorar la robustez del modelo base ante perturbaciones del entorno en tareas de manipulación robótica, evaluadas sobre el benchmark LIBERO-Plus. El modelo parte de `pi05_libero`, la variante de pi0.5 ya ajustada sobre LIBERO que Physical Intelligence distribuye en el repositorio openpi.

La contribución principal es un ajuste fino sobre los datos de entrenamiento de LIBERO-Plus, que varían posición de cámara, pose inicial del robot, iluminación, fondo, ruido de sensor, disposición de objetos y formulación de instrucciones. El resultado destacado es una mejora de 71,8% a 90,2% en la categoría de cambios de punto de vista de cámara, con un total agregado prácticamente idéntico (84,62% frente a 84,11%) y sin significación estadística en el cómputo global.

Es relevante porque documenta públicamente una tabla de compromisos (trade-offs) completa y verificada sobre 10.030 episodios, algo poco habitual en modelos robóticos. No obstante, los pesos y el código son privados: el modelo no es descargable y solo se ofrece acceso de evaluación a clientes a través del sitio del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi0.5 (openpi); detalles internos de capas y atención no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el benchmark evalúa instrucciones en inglés vía LIBERO-Plus) |
| Licencia | Gemma Terms of Use (incluye Gemma Prohibited Use Policy) |
| Formato de pesos | no disponible (pesos privados, no publicados) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del VLA pi0.5 de Physical Intelligence, en su variante `pi05_libero` del repositorio openpi (código Apache-2.0). No se detalla en la información disponible la arquitectura interna de pi0.5 (número de parámetros, mecanismo de atención, tokenizador de acciones ni resolución de entrada visual). Se sabe que es un modelo de robótica del pipeline `robotics` de Hugging Face y que se ejecuta mediante LeRobot.

El entrenamiento consiste en un ajuste fino supervisado sobre los datos de entrenamiento de LIBERO-Plus (`Sylvest/libero_plus_lerobot`, licencia MIT), que introducen variaciones controladas de cámara, pose inicial, iluminación, fondo, ruido, disposición de objetos y redacción de instrucciones. No se especifica el número de tokens, el número de pasos, el tamaño de lote ni si hubo RLHF o DPO. El autor menciona una variante exploratoria planificada que añadiría clips de ego humano siguiendo ACE-Ego-0, pero no forma parte de este resultado. Los resultados se verificaron el 2026-11-25 con un único seed de entrenamiento.

## Capacidades

- Control robótico de manipulación en simulación a partir de instrucciones en lenguaje natural e imágenes (VLA).
- Ejecución de tareas del benchmark LIBERO-Plus con variaciones de punto de vista de cámara, ruido de sensor, iluminación, fondo, disposición de objetos y redacción de instrucciones.
- Mayor robustez que el modelo base ante cambios de cámara (+18,4 puntos) y ruido de sensor (+7,1 puntos).
- Integración con el ecosistema LeRobot de Hugging Face para entrenamiento y evaluación.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión general o audio: no disponible / no aplicable según la información proporcionada.
- Capacidades multilingües: no disponibles; la evaluación se realiza con instrucciones del benchmark LIBERO-Plus.

## Casos de uso

- Evaluación de robustez de políticas VLA: usar Robust-0 como referencia para medir cuánto degrada una política ante cambios de cámara o ruido, comparándolo con `pi05_libero` bajo el mismo arnés de evaluación.
- Investigación en simulación con LIBERO-Plus: reproducir la tabla de compromisos del autor para estudiar qué perturbaciones mejoran y cuáles empeoran con el ajuste fino.
- Selección de política para entornos con cámara no fija: en escenarios simulados donde la cámara puede moverse, el modelo ofrece 90,2% frente a 71,8% del base, lo que lo hace preferible si esa perturbación domina.
- Despliegue en simuladores con sensores ruidosos: la mejora de 86,1% a 93,3% en ruido de sensor lo hace adecuado para pipelines de evaluación con ruido sintético.
- Estudio de trade-offs de aumento de datos: sirve como caso documentado de cómo el ajuste fino con datos aumentados mejora unas perturbaciones a costa de otras (pose inicial, instrucciones reformuladas, layout).
- Base para experimentos propios: al derivar de openpi (Apache-2.0) y LeRobot, un equipo puede replicar el ajuste fino con los datos MIT de LIBERO-Plus si obtiene acceso a los pesos o parte del base público.

## Benchmarks y rendimiento

Evaluación completa sobre LIBERO-Plus, 10.030 episodios, un intento por episodio, arnés y lista de tareas oficiales, verificada el 2026-11-25.

| Perturbación | Episodios | pi05_libero (publicado) | 04s64 Robust-0 | Cambio |
|---|---|---|---|---|
| Punto de vista de cámara | 1.599 | 71,8 | **90,2** | +18,4 |
| Ruido de sensor | 1.601 | 86,1 | **93,3** | +7,1 |
| Iluminación | 1.142 | 94,7 | 93,1 | -1,7 (no significativo) |
| Fondo | 1.076 | 95,4 | 92,3 | -3,2 |
| Disposición de objetos | 1.525 | 85,7 | 81,5 | -4,2 |
| Lenguaje | 1.537 | 86,0 | 80,0 | -6,1 |
| Estado inicial del robot | 1.550 | 75,5 | 66,0 | -9,5 |
| **Total** | 10.030 | 84,11 | **84,62** | +0,5 (no significativo) |
| Total sin ruido | 8.429 | 83,72 | 82,98 | -0,7 (no significativo) |

La significación procede de una comparación pareada por episodio. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la información disponible, y no procede extrapolarlos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (los pesos no se publican y no se detalla el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: integración con LeRobot; el modelo base pi0.5 se distribuye vía openpi. No se confirman soportes de vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Datos de ajuste | Total LIBERO-Plus | Cámara | Pose inicial | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| 04s64 Robust-0 | pi05_libero | LIBERO-Plus train | 84,62 | 90,2 | 66,0 | Gemma Terms of Use | Pesos privados; acceso bajo solicitud |
| pi05_libero (publicado) | pi0.5 | LIBERO | 84,11 | 71,8 | 75,5 | Gemma Terms of Use | Pesos disponibles vía openpi |
| Otros ajustes finos sobre LIBERO-Plus | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El propio autor advierte que, al haberse ajustado sobre datos de LIBERO-Plus, Robust-0 solo debe compararse con otras entradas también ajustadas con esos datos, no con el modelo base sin ajustar.

## Limitaciones y advertencias

- Solo simulación: la transferencia a robot real no se ha probado.
- La robustez a la pose inicial del robot (-9,5 puntos), a instrucciones reformuladas (-6,1) y a la disposición de objetos (-4,2) empeora respecto al base.
- El total agregado no mejora de forma significativa (+0,5, no significativo); la mejora se concentra en cámara y ruido.
- Evaluación con un único intento por episodio y un único seed de entrenamiento: menor fiabilidad estadística.
- Los resultados de ruido se reportan de dos formas por el issue #61 de LIBERO-Plus; los prompts proceden del código oficial basado en nombres de fichero (issues #64 y #65).
- Pesos y código privados: no es posible reproducir ni desplegar el modelo sin acceso concedido por el autor.
- Licencia Gemma Terms of Use, incluida la Gemma Prohibited Use Policy; los pesos ajustados que se compartan con clientes heredan esos términos. Revisar restricciones para uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de acción robótica, el riesgo relevante es de ejecución incorrecta de la política, no de generación de texto.
- Idiomas soportados no especificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/04s64/04s64-Robust-0
- Sitio del autor (acceso a evaluación): https://04s64.ai
- Dataset de entrenamiento LIBERO-Plus: https://huggingface.co/datasets/Sylvest/libero_plus_lerobot
- Paper LIBERO-Plus (Fei et al.): https://arxiv.org/abs/2510.13626
- Paper LIBERO (Liu et al., 2023): no disponible enlace directo en la información proporcionada
- openpi (Physical Intelligence): no disponible enlace directo en la información proporcionada
- LeRobot (Hugging Face): no disponible enlace directo en la información proporcionada
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
