# Geoffrey19/cei2-pi05-base-drawer200-fp32

## Resumen

`cei2-pi05-base-drawer200-fp32` es una política robótica de imitación publicada por el usuario Geoffrey19, derivada del modelo base `pi05_base` del proyecto openpi de Physical Intelligence. Se ha ajustado (fine-tuning completo) sobre 200 episodios de demostraciones teleoperadas reales en un brazo Franka FR3 de 7 articulaciones con una mano LEAP de 16 articulaciones, para la tarea de abrir un cajón, coger un objeto de la mesa, colocarlo dentro y cerrar el cajón. El modelo tiene 3.616.757.520 parámetros (3,62 B) en float32, ocupa 14,5 GB en el repositorio y se distribuye con licencia Apache 2.0.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje general, sino un checkpoint de investigación para control robótico de una tarea concreta, con un conjunto de datos fijo y sin partición de evaluación. No se han publicado resultados de benchmarks ni evaluaciones de éxito de la tarea, y el autor indica explícitamente que no verificó el éxito por episodio. Es útil como referencia reproducible de un pipeline openpi completo (configuración, normalización, orden de articulaciones) y como punto de partida para quien quiera replicar el ajuste en un montaje FR3 + LEAP.

La ficha se ha elaborado exclusivamente con la información de la model card y los metadatos de Hugging Face. Todo dato no presente en esa información se marca como "no disponible"; no se han inferido cifras de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política pi05 de openpi; la model card no detalla la arquitectura interna) |
| Parametros totales | 3.616.757.520 (3,62 B), 812 tensores |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes GGUF, int8 ni otras) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural libre; recibe un prompt de tarea fijo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, float32); metadatos en `metadata.pt` |

## Arquitectura y entrenamiento

El modelo es una política pi05 de openpi, es decir, una política de imitación que mapea observaciones (una imagen RGB exterior de 640×480 y el estado de 23 articulaciones en radianes) y un prompt de tarea a secuencias de acciones. La model card no describe la arquitectura interna (transformer, difusión o flow matching), aunque sí menciona que el objetivo de entrenamiento es "flow-matching" y que se predicen fragmentos de 16 pasos de acciones. Los pesos se publican en float32 con estado del optimizador en float32 y autocast en bfloat16; el estado del optimizador (26 GB) no se incluye en el repositorio.

El ajuste parte de `pi05_base` y se ejecuta durante 20.000 pasos con batch de 32 en una sola GPU, con learning rate pico de 2e-5 tras 500 pasos de calentamiento y decaimiento coseno hasta 1e-6, sin EMA. Los datos son 200 episodios teleoperados (114.493 fotogramas a 15 Hz) del dataset `zwx/open_drawer_place_object_close_franka_leap_15hz_absolute_200`, con una única cámara RGB exterior y acciones como posiciones articulares absolutas medidas 1/15 s después, no como comandos enviados al robot. La normalización usa cuantiles q01/q99 del conjunto de entrenamiento mapeados a −1/+1. Un detalle técnico crítico es el reordenamiento de articulaciones: el modelo trabaja en el orden del robot CEI `fr3v2_leaphand` (con `mcp_forward` antes de `mcp_side` en cada dedo), y la configuración aplica el mapa de permutación `P` internamente, por lo que no debe aplicarse de nuevo en el lado del robot. La pérdida media de entrenamiento baja de 0,1616 (pasos 0–100) a 0,0100 (pasos 19.000–20.000); el autor advierte que es un ajuste a los episodios de entrenamiento, no una medida de calidad de la política.

## Capacidades

- Generación de acciones de control para una tarea robótica concreta: devuelve `(16, 23)` objetivos articulares absolutos a 15 Hz.
- Consumo de observaciones multimodales: una imagen RGB de 640×480 y un vector de estado de 23 posiciones articulares en radianes.
- Condicionamiento por prompt de tarea: acepta la instrucción textual "Open the drawer, pick up the object from the tabletop, place it inside the drawer, and close the drawer."
- Control de un brazo Franka FR3 de 7 articulaciones y una mano LEAP de 16 articulaciones en un único montaje físico.
- Integración con el ecosistema openpi: requiere el commit `215abfb` y el parche `transformers_replace` de PyTorch.
- No soporta tool calling, function calling, razonamiento multi-paso general, ni capacidades multilingües, de visión general o de audio.

## Casos de uso

- Replicación de un pipeline de imitación completo: sirve como referencia de configuración openpi (archivo `openpi_cei2_configs.py`, normalización y orden de articulaciones) para equipos que quieran montar su propio flujo de entrenamiento con FR3 + LEAP.
- Investigación en manipulación con mano diestra: permite estudiar el control coordinado de 23 articulaciones (7 del brazo y 16 de la mano) en una tarea de apertura, agarre, colocación y cierre, con datos reales a 15 Hz.
- Punto de partida para ajuste fino en tareas similares: al derivar de `pi05_base` y publicarse con pesos completos, puede servir de inicialización para nuevas tareas de cajón o colocación en el mismo robot.
- Comparación de recetas de preentrenamiento: el autor publica una variante entrenada desde el checkpoint CEI (`cei2-pi05-fr3v2-leaphand-112h-drawer200-fp32`), lo que permite comparar el efecto de partir del base frente a partir de un modelo con mid-training.
- Validación de infraestructura de inferencia robótica: útil para probar la integración de openpi con una GPU única, la carga de `norm_stats.json` desde el checkpoint y el manejo del orden de articulaciones en un entorno controlado.
- Docencia y demostraciones de imitación: el repositorio incluye `joint_order.json` y `train_config.json`, lo que facilita explicar el flujo completo desde datos teleoperados hasta política desplegada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida media de entrenamiento (objetivo flow-matching propio de cada modelo) para cuatro ejecuciones, y advierte que no mide calidad de política:

| Pasos | pi05 desde base | pi05 desde CEI | GR00T desde base | GR00T desde CEI |
|---|---|---|---|---|
| 0–100 | 0,1616 | 0,2178 | 1,0683 | 0,1939 |
| 4.900–5.000 | 0,0244 | 0,0222 | 0,0686 | 0,0420 |
| 9.900–10.000 | 0,0183 | 0,0177 | 0,0489 | 0,0288 |
| 14.900–15.000 | 0,0118 | 0,0113 | 0,0337 | 0,0190 |
| 19.000–20.000 | 0,0100 | 0,0094 | 0,0284 | 0,0161 |

No hay partición de evaluación ni verificación de éxito por episodio, por lo que no existe tasa de éxito reportada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,62 B parámetros en float32, los pesos ocupan aproximadamente 14,5 GB; a ello hay que sumar activaciones y el resto del pipeline de openpi, por lo que se necesita una GPU con holgura por encima de esa cifra.
- GPU recomendadas: no disponible en la información proporcionada. El entrenamiento se realizó en una sola GPU, pero no se especifica el modelo.
- ¿Cabe en GPU de consumo? No confirmado. Una GPU de consumo con 24 GB (por ejemplo, RTX 4090) podría alojar los pesos en float32, pero no hay datos publicados de que el pipeline completo funcione en ella.
- Opciones de despliegue: openpi en el commit `215abfb` con el parche `transformers_replace` de PyTorch y la configuración `cei2_pi05_drawer200_absq` registrada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Geoffrey19/cei2-pi05-base-drawer200-fp32` | 3,62 B | no disponible | Política FR3 + LEAP, tarea de cajón | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `Geoffrey19/cei2-pi05-fr3v2-leaphand-112h-drawer200-fp32` | no disponible | no disponible | Misma tarea, partiendo del checkpoint CEI | no disponible en la información | Hugging Face |
| `pi05_base` (openpi, Physical Intelligence) | no disponible | no disponible | Política base de propósito general | no disponible en la información | Repositorio openpi |

No se dispone de datos de rendimiento comparables entre estas variantes; la comparación se limita a procedencia, tarea y licencia.

## Limitaciones y advertencias

- No hay partición de evaluación: los 200 episodios se usaron para entrenamiento y no se reporta tasa de éxito ni evaluación held-out.
- No se verificó el éxito de la tarea por episodio; solo se filtraron problemas de datos como huecos en las articulaciones superiores a 200 ms.
- La pérdida de entrenamiento es un ajuste a los episodios y no una medida de calidad de la política; el autor lo advierte explícitamente.
- Sesgos conocidos: no documentados. Al entrenarse solo con 200 episodios de un único montaje, la política está fuertemente sesgada hacia esa configuración física, iluminación, cámara y distribución de objetos.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de idioma: no disponible; el prompt de tarea es fijo y no se documenta soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de openpi y de sus componentes; deben revisarse las licencias de las dependencias.
- Caveat crítico de producción: el orden de articulaciones debe gestionarse solo a través de la configuración. Aplicar la permutación `P` también en el robot intercambia las parejas dos veces. Las estadísticas de `assets/drawer200/norm_stats.json` están en orden del modelo y no deben sustituirse por las del dataset (`assets/pi05_h16/norm_stats.json`), que están en orden del robot.
- Requiere una versión concreta de openpi (`215abfb`) y un parche de PyTorch; no es un checkpoint portable a otros frameworks sin trabajo adicional.
- El estado del optimizador (26 GB) no se incluye, lo que limita reanudar el entrenamiento exactamente desde el paso 20.000.

## Enlaces

- Hugging Face: https://huggingface.co/Geoffrey19/cei2-pi05-base-drawer200-fp32
- Variante desde CEI: https://huggingface.co/Geoffrey19/cei2-pi05-fr3v2-leaphand-112h-drawer200-fp32
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Dataset de entrenamiento: `zwx/open_drawer_place_object_close_franka_leap_15hz_absolute_200` (referenciado en la model card; no se proporciona URL directa en la información disponible)
