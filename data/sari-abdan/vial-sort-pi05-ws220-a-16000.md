# sari-abdan/vial-sort-pi05-ws220-a-16000

## Resumen

`vial-sort-pi05-ws220-a-16000` es un checkpoint de fine-tuning completo del modelo vision-language-action π0.5, desarrollado por el usuario sari-abdan y publicado en Hugging Face bajo la librería LeRobot. El modelo resuelve una tarea robótica muy concreta: mover un vial desde una posición concreta de una gradilla a otra posición o a un contenedor, empleando un brazo de bajo coste SO-101. Se trata de un checkpoint de investigación, no de un producto, y el propio autor advierte que no completa la tarea de forma fiable.

El modelo parte de los pesos públicos `lerobot/pi05_base` y se ha entrenado con 220 demostraciones del dataset `sari-abdan/vial-sort-slots-220`, con 113.010 frames útiles tras recortar los periodos de inactividad. La arquitectura subyacente es π0.5, un modelo basado en PaliGemma y Gemma que combina percepción visual multicámara, estado propioceptivo del robot y una instrucción en lenguaje natural para generar acciones motoras en forma de trayectorias de articulaciones.

Su relevancia es doble: por un lado, demuestra que es posible adaptar un VLA generalista a una tarea de manipulación fina con un conjunto de datos relativamente pequeño y hardware de gama baja; por otro, documenta con transparencia los fallos típicos (agarre correcto pero soltado impreciso, confusiones entre ranuras) en un dominio donde la mayoría de publicaciones solo reportan éxitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5, basada en PaliGemma y Gemma |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bfloat16 en entrenamiento) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (LeRobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de π0.5, un VLA que procesa cinco cámaras de color de 640×480 (top_down, left_top, left_bottom, right y wrist), las seis posiciones articulares del brazo y un prompt en lenguaje natural. La salida son objetivos de articulación en fragmentos de 50 pasos, ejecutados con `n_action_steps=15` en modo síncrono. Todos los pesos del modelo base fueron entrenados, sin congelar componentes.

El entrenamiento se realizó durante 16.000 pasos con batch size 16 (aproximadamente 2,3 pasadas sobre el dataset), optimizador AdamW, learning rate 2,5e-05 y precisión bfloat16, sobre una única A100 de 80 GB durante 21,5 horas repartidas en dos trabajos de 12 horas. El dataset contiene 220 demostraciones con inicio y fin inactivos recortados, frames de inicio sin operador y una frase por movimiento. 150 de las demostraciones graban un mismo layout tres veces con tres destinos distintos, de modo que el destino solo puede inferirse del prompt. La gramática de instrucciones es del tipo "Move the vial from position 3 of the right rack to slot 6 of the left rack" o "Move the vial from position 4 of the left rack to the bin". Las ranuras de origen en entrenamiento son 1, 3, 4 y 6; los destinos son 1, 3, 6 o el contenedor, dejando deliberadamente fuera las ranuras 2 y 5.

## Capacidades

- Manipulación robótica de precisión: agarre y traslado de un vial entre posiciones nombradas de dos gradillas y un contenedor.
- Percepción visual multicámara: integra cinco vistas simultáneas para localizar el vial, las gradillas y el contenedor.
- Seguimiento de instrucciones en lenguaje natural con gramática restringida (origen, destino y tipo de contenedor).
- Generación de trayectorias articulares en chunks de 50 pasos, con ejecución parcial de 15 pasos.
- Generalización limitada a destinos no vistos en demostraciones (el autor reporta éxitos en las ranuras 4 y 5 como destino).
- No dispone de tool calling, agentes multi-paso, capacidades multilingües ni modo de razonamiento explícito.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como punto de partida reproducible para estudiar cómo un VLA generalista se adapta a una tarea de manipulación fina con 220 demostraciones.
- Benchmark de agarre y colocación: evaluar la brecha entre "agarre correcto" y "soltado en la posición correcta" en brazos de bajo coste tipo SO-101.
- Prototipado de automatización de laboratorio: clasificación de viales en gradillas etiquetadas por posición, útil como prueba de concepto antes de invertir en hardware industrial.
- Estudio de generalización composicional: analizar el comportamiento del modelo ante combinaciones origen-destino no presentes en los datos (por ejemplo, L1 → L6), documentado como fallo en el agarre.
- Docencia y divulgación en robótica: ejemplo realista y abierto de un pipeline LeRobot completo (entrenamiento, rollout y evaluación con scripts de poses articulares).
- Base para fine-tuning posterior: al ser un fine-tune completo desde `pi05_base`, puede reutilizarse como inicialización para tareas de clasificación de objetos pequeños con múltiples cámaras.
- Análisis de fiabilidad en producción: cuantificar tasas de éxito reales (21 de 31 movimientos correctos en la prueba del 9 de noviembre) antes de considerar cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor reporta métricas específicas de la tarea en robot:

| Metrica | Resultado |
|---|---|
| Tomas puntuadas (todos los checkpoints de la ejecución) | 25 |
| Vial correcto agarrado | 23 de 25 |
| Brazo abierto en la ranura solicitada | 17 de 25 |
| Prueba del 9 de noviembre (31 movimientos, observación del operador) | 21 en la ranura solicitada |
| Fallos de soltado tras alcanzar la ranura correcta | 6 (vial delante o detrás del agujero) |
| Confusiones documentadas | Vial pedido para ranura 1 o 3 colocado en ranura 2 |
| Movimiento no presente en datos (L1 → L6) | Fallo en el agarre |

Las tomas fueron puntuadas por un script que lee las poses articulares del brazo, no por visión; "soltado en la ranura solicitada" significa que el brazo abrió allí. Algunas tomas se verificaron además por vídeo. El autor advierte que son ejecuciones de prueba durante el desarrollo, no una evaluación planificada, y que las cifras son pequeñas.

## Requisitos de hardware

- Entrenamiento: una A100 de 80 GB, 37,8 GiB de memoria utilizada, 4,81 s por paso, 21,5 horas para 16.000 pasos.
- Inferencia: el modelo tiene 4.143 millones de parámetros; en bfloat16 requiere aproximadamente 8,3 GB solo para pesos, más memoria para las cinco cámaras de 640×480 y el estado del entorno. No se dispone de cifras oficiales de VRAM para inferencia.
- GPU recomendadas: A100 80 GB para entrenamiento; para inferencia, una GPU con al menos 16-24 GB de VRAM es un punto de partida razonable, aunque no está verificado en la información disponible.
- GPU de consumo: no confirmado. Un modelo de 4,1B en bfloat16 podría caber en tarjetas de 16 GB o más, pero no hay datos publicados de ejecución en RTX 4090, 4080 u otras.
- Despliegue: clases de política de LeRobot (`lerobot-train`, `lerobot-rollout`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles para inferencia; el coste de entrenamiento fue de 4,81 s por paso en A100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vial-sort-pi05-ws220-a-16000 | 4,14B | no disponible | Manipulación de viales con SO-101 | Gemma Terms of Use | Hugging Face (LeRobot) |
| lerobot/pi05_base | no disponible en la información | no disponible | VLA generalista base | Gemma Terms of Use | Hugging Face (LeRobot) |
| π0 (variante base de Physical Intelligence) | no disponible en la información | no disponible | VLA generalista | no disponible | no disponible |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El propio autor declara que el modelo no completa la tarea de forma fiable; es un checkpoint de investigación, no un producto.
- El soltado es el punto débil: en 6 de 25 tomas el brazo alcanzó la ranura correcta pero el vial quedó delante o detrás del agujero.
- Confusión entre ranuras: a veces coloca un vial pedido para la ranura 1 o 3 en la ranura 2.
- Las ranuras 2 y 5 no aparecen en ningún prompt de entrenamiento como destino; el comportamiento en esos casos es extrapolación.
- El movimiento L1 → L6, ausente en los datos, falló en el agarre.
- Las métricas provienen de tomas de desarrollo no planificadas y con muestra pequeña (25 tomas, 31 movimientos); no deben interpretarse como una evaluación robusta.
- La evaluación automática se basa en poses articulares y no verifica visualmente la posición del vial.
- Los scripts de rollout y evaluación del proyecto no están publicados.
- Licencia Gemma Terms of Use: es necesario revisar las condiciones para uso comercial, que no son equivalentes a una licencia permisiva tipo Apache o MIT.
- No hay información sobre sesgos, alucinación en el sentido lingüístico ni cobertura multilingüe; el prompt de entrenamiento está en inglés y con una gramática muy restringida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sari-abdan/vial-sort-pi05-ws220-a-16000
- Dataset de entrenamiento: https://huggingface.co/datasets/sari-abdan/vial-sort-slots-220
- Documentación del proyecto: https://sariabdan.github.io/vial-sort/docs/
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
