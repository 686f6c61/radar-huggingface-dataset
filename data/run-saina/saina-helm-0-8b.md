# run-saina/saina-helm-0.8b

## Resumen

Saina Helm 0.8B es un modelo de decisión de pequeno tamano desarrollado por run-saina, afinado a partir de Qwen/Qwen3.5-0.8B. A diferencia de un modelo generativo convencional, no produce texto: recibe un estado (texto libre o JSON) y una o varias preguntas tipadas (si/no, eleccion unica, eleccion multiple o puntuacion) y devuelve probabilidades para cada respuesta posible. Las opciones se suministran en tiempo de peticion, de modo que el mismo modelo cubre enrutamiento de intenciones, triaje, seleccion de herramientas o checklists de revision sin reentrenamiento.

El modelo incorpora una cabeza de probabilidad entrenada (`head.safetensors`) sobre los pesos fusionados de Qwen3.5-0.8B, con 852.985.920 parametros totales y un contexto de 8.192 tokens. Admite hasta 255 opciones por pregunta y ofrece un modo de decision con umbral y margen minimo que permite abstenerse y escalar en lugar de adivinar.

Su relevancia actual radica en el nicho que ocupa: sustituye llamadas a modelos generativos grandes en tareas de clasificacion y decision estructurada, con un coste de inferencia mucho menor y una interfaz determinista basada en probabilidades. La licencia Apache 2.0 y la disponibilidad en GGUF, MLX y Ollama facilitan su despliegue tanto en servidor como en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B) con cabeza de probabilidad entrenada |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | GGUF (via repositorio GGUF), MLX (Apple silicon); cuantizaciones concretas no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados completos y `head.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de 0,85 mil millones de parametros, y anade una cabeza de probabilidad entrenada sobre el estado oculto del ultimo token. La inferencia no utiliza `generate()`: se lee directamente la representacion del ultimo token y se proyecta sobre las opciones suministradas en la peticion. El repositorio contiene los pesos fusionados completos junto con `head.safetensors`.

El autor no detalla en la model card el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Si se documenta que `helm.py` construye exactamente el prompt con el que se entreno el modelo y que las puntuaciones dependen de ese formato, por lo que debe usarse esa utilidad en lugar de un prompt propio. Las versiones se gestionan mediante etiquetas git: los reentrenamientos que solo cambian pesos incrementan la version menor (v1.1) y los cambios que afectan a etiquetas, formato de prompt o arquitectura incrementan la mayor (v2.0).

## Capacidades

- Clasificacion y decision estructurada: devuelve probabilidades por respuesta en lugar de texto generado.
- Preguntas de tipo `yes_no` con probabilidades `yes`, `no` y `confidence`, con descripciones opcionales por respuesta.
- Eleccion unica (`single_choice`) con entre 2 y 255 opciones, devolviendo `probabilities`, `selection` y `confidence`.
- Eleccion multiple (`multi_choice`) con pertenencia independiente por opcion.
- Puntuacion (`rating`) con entre 2 y 10 niveles ordenados, devolviendo probabilidades por nivel, `expected_level` y `confidence`; la confianza penaliza menos la dispersion entre niveles contiguos que entre niveles distantes.
- Modo decision con umbral (por defecto 0,8) y margen minimo opcional: devuelve `None` con motivo (`below_threshold`, `below_margin`, `tie`) cuando no hay confianza suficiente, permitiendo abstenerse y escalar.
- Interfaz de puntuacion en bruto mediante `predict(context, question, choices, mode='single_label' | 'multi_label')`.
- Entrada de estado en texto libre o JSON.
- No dispone de generacion de texto, tool calling generativo ni capacidades de vision o audio documentadas.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: dado el mensaje del usuario como estado, se pregunta por la intencion con `single_choice` entre las categorias del sistema, con umbral de confianza para derivar a un humano cuando el modelo no esta seguro.
- Triaje de tickets de soporte: con el texto del ticket como estado, se combinan preguntas `yes_no` (por ejemplo, si se solicita reembolso), `single_choice` (equipo responsable) y `rating` (urgencia) en una sola llamada, tal como muestra el ejemplo de la model card.
- Seleccion de herramientas en agentes: las herramientas disponibles se pasan como opciones de una pregunta `single_choice`; el modelo devuelve la herramienta mas probable y la confianza asociada, sin necesidad de reentrenar al anadir herramientas nuevas.
- Checklists de revision de calidad: con un documento o diff como estado, se lanzan preguntas `multi_choice` sobre los criterios aplicables (formato, seguridad, estilo) y se obtienen pertenencias independientes por criterio.
- Moderacion y clasificacion de contenido: uso de `predict` en modo `multi_label` para asignar etiquetas de politica de contenido con una sola pasada por etiqueta, con coste de inferencia bajo gracias a los 0,85 mil millones de parametros.
- Encuestas y formularios estructurados: conversion de respuestas abiertas en valores de escala ordinal mediante preguntas `rating` con niveles definidos en tiempo de peticion y `expected_level` como valor continuo.
- Despliegue en el borde o en portatil: las variantes GGUF para CPU y MLX para Apple silicon permiten ejecutar el modelo localmente para clasificacion de baja latencia sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 852.985.920 parametros, los pesos en safetensors ocupan aproximadamente 1,7 GB en precision de 16 bits; el repositorio completo pesa 2,1 GB.
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo cabe en cualquier GPU con al menos 4 GB de memoria en precision reducida.
- Cabe en GPU de consumo: si, por tamano; el autor ofrece ademas variantes GGUF para CPU y MLX para Apple silicon.
- Opciones de despliegue: transformers (>=5), safetensors y huggingface_hub mediante `helm.py`; variantes GGUF, MLX y Ollama (>=0.40, con MLX en Apple silicon y GGUF en el resto).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saina Helm 0.8B | 852.985.920 | 8.192 tokens | Decision por probabilidades sobre opciones suministradas en peticion | Apache 2.0 | Hugging Face, GGUF, MLX, Ollama |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible | no disponible | Generacion de texto | no disponible | Hugging Face |
| Alternativas de clasificacion zero-shot de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Las probabilidades no estan calibradas; el autor recomienda fijar los umbrales sobre datos propios.
- Los resultados son sensibles a la formulacion de las preguntas y de las opciones.
- Debe evaluarse en la tarea concreta antes de confiar en el modelo para decisiones con consecuencias.
- Las puntuaciones dependen del formato de prompt construido por `helm.py`; usar un prompt propio altera los resultados.
- Las puntuaciones pueden cambiar entre versiones del modelo; si se han ajustado umbrales, conviene fijar una etiqueta git concreta.
- No genera texto: no sirve para tareas generativas, tool calling generativo ni razonamiento multi-paso en lenguaje natural.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue fuera del que herede del modelo base.
- No se documentan sesgos conocidos ni tasas de alucinacion; al tratarse de un modelo de clasificacion, el riesgo principal es una asignacion erronea con alta confianza.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan restricciones adicionales del modelo base Qwen3.5-0.8B en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/run-saina/saina-helm-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Demo en el navegador: https://huggingface.co/spaces/mendrikarama/saina-helm-decision-demo
- Variante GGUF para CPU: https://huggingface.co/run-saina/saina-helm-0.8b-GGUF
- Variante MLX para Apple silicon: https://huggingface.co/run-saina/saina-helm-0.8b-MLX
- Ollama: https://ollama.com/run-saina/saina-helm-0.8b
