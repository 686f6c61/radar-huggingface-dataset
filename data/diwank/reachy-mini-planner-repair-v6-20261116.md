# diwank/reachy-mini-planner-repair-v6-20261116

## Resumen

Reachy Mini planner repair v6 es un adaptador LoRA de tipo PEFT publicado por el usuario diwank dentro de una línea de investigación sobre planificación de movimiento para el robot Reachy Mini. Se construye sobre el modelo base multimodal `binhpham/reachy-mini-motion-planner-4b` y se entrena mediante SFT correctivo sobre recetas procedurales verificadas numéricamente. El repositorio tiene un tamaño de 0,1 GB, licencia Apache 2.0 y está etiquetado como piloto de investigación (`research-pilot`).

El punto crítico de esta publicación es que, según la propia model card, el proceso de selección de checkpoint retuvo el inicializador sin cambios (step 0). Es decir, el adaptador publicado no contiene una mejora efectiva del planificador: el piloto de reparación no superó su puerta de validación predeclarada y el generador no se actualizó. La release debe interpretarse como un artefacto de auditoría y reproducibilidad, no como un modelo listo para producción.

El adaptador está pensado para cargarse junto al decodificador de texto del modelo base original (revisión `1b60d8f16b85473ceb20e3b62e464780c532b519`), usando el tokenizador y el prompt `settled-relative-v1` del código de entrenamiento. La evaluación empareja este planificador con el generador de trayectorias v4 congelado, con ocho pasos, CFG 1 y filtrado a 4 Hz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (PEFT) sobre el decodificador de texto de un modelo base multimodal de planificación de movimiento |
| Parámetros totales | no disponible (el adaptador ocupa 0,1 GB en el repositorio) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT sobre el modelo base `binhpham/reachy-mini-motion-planner-4b`, un modelo multimodal que no es un `AutoModel` solo-texto y requiere extraer su decodificador de texto mediante `code/motion_tuning/model.py:load_text_model`. El adaptador se aplica sobre ese decodificador, usando el tokenizador del base y el prompt `settled-relative-v1` definido en `code/motion_tuning/core.py`.

El entrenamiento consistió en 40 pasos de optimizador LoRA sobre el dataset `diwank/reachy-mini-planner-repair-data-v6-20261116`, compuesto por recetas procedurales verificadas numéricamente. La selección de checkpoint se hizo únicamente con el nuevo conjunto de desarrollo, incluyendo el inicializador sin cambios, y el paso seleccionado fue el 0. Un preflight de factibilidad residual recuperó 4 de 120 casos y no superó la puerta predeclarada del piloto, por lo que el generador no se actualizó. No se trata de entrenamiento conjunto alternado.

## Capacidades

- Planificación de movimiento para el robot Reachy Mini mediante recetas procedurales verificadas numéricamente.
- Generación de secuencias de acción dentro del pipeline de planificación del robot, emparejada con el generador de trayectorias v4 congelado.
- Integración con el controlador de seguridad y el anclaje de pose actual de la aplicación, que siguen siendo obligatorios.
- Reproducción nominal de recetas como parte del flujo de ejecución.
- Capacidades multilingües: no disponible.
- Tool calling, agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible como capacidades documentadas del adaptador.

## Casos de uso

- Auditoría de experimentos de SFT correctivo: el adaptador sirve para reproducir el piloto y verificar que el checkpoint seleccionado fue el inicializador sin cambios, comparando contra el informe `report.md` y el `analysis.json`.
- Reproducción de evaluación con el generador v4: permite reconstruir el emparejamiento planificador-generador con ocho pasos, CFG 1 y filtrado a 4 Hz para validar los resultados publicados.
- Investigación en planificación robótica: útil como punto de partida para diseñar nuevos pilotos de reparación con puertas de validación más estrictas, dado que este no las superó.
- Desarrollo de pipelines de movimiento para Reachy Mini: el adaptador se carga junto al decodificador de texto del base y el prompt `settled-relative-v1`, integrándose en el código de `motion_tuning`.
- Verificación de preflight de factibilidad residual: los 4 casos recuperados de 120 pueden estudiarse para entender por qué la puerta no se cumplió y ajustar el generador.
- Docencia y divulgación: ejemplo realista de publicación de resultados negativos con trazabilidad de bytes y manifiesto de publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas de tarea comparten la rúbrica de entrenamiento y que no se realizó evaluación con robot físico ni valoración ciega de naturalidad. El preflight residual recuperó 4 de 120 casos y no superó la puerta del piloto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base `binhpham/reachy-mini-motion-planner-4b` y de la cuantización elegida, no documentada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante PEFT sobre el decodificador de texto extraído con `code/motion_tuning/model.py:load_text_model`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diwank/reachy-mini-planner-repair-v6-20261116 | no disponible (adaptador LoRA, 0,1 GB) | no disponible | checkpoint step 0, sin mejora efectiva | Apache 2.0 | Hugging Face |
| binhpham/reachy-mini-motion-planner-4b (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| diwank/reachy-mini-trajectory-generator-v4-20261116 | no disponible | no disponible | generador congelado usado en la evaluación | no disponible | Hugging Face |

## Limitaciones y advertencias

- El adaptador publicado no contiene una mejora efectiva del planificador: el checkpoint seleccionado es el paso 0, es decir, el inicializador sin cambios.
- El preflight de factibilidad residual recuperó 4 de 120 casos y falló su puerta predeclarada; el generador no se actualizó.
- No es entrenamiento conjunto alternado; no debe interpretarse como un pipeline completo de planificación y generación.
- No se realizó evaluación con robot físico ni valoración ciega de naturalidad.
- Las métricas de tarea comparten la rúbrica de entrenamiento, lo que puede introducir sesgo de evaluación.
- El modelo base es multimodal y no es un `AutoModel` solo-texto; requiere extraer el decodificador de texto y usar el tokenizador y prompt exactos.
- La reproducción nominal de recetas, el anclaje de pose actual y el controlador de seguridad de la aplicación siguen siendo obligatorios.
- Las rutas de máquina en los JSON públicos están redactadas y el snapshot de código omite los assets de runtime calibrados de Loopy.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación y la ausencia de mejora efectiva desaconsejan su uso en producción.
- Riesgo de alucinación y sesgos: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diwank/reachy-mini-planner-repair-v6-20261116
- Modelo base: https://huggingface.co/binhpham/reachy-mini-motion-planner-4b
- Generador de trayectorias v4 congelado: https://huggingface.co/diwank/reachy-mini-trajectory-generator-v4-20261116/tree/c33fe3d2f54a6dc0d90c271a2adeda89021d7581
- Dataset de entrenamiento: https://huggingface.co/datasets/diwank/reachy-mini-planner-repair-data-v6-20261116
- Informe de resultados: `report.md` en el repositorio del modelo
- Detalles de auditoría: `analysis.json` en el repositorio del modelo
