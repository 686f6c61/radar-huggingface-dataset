# OmniJev/OneJev1.6-0.8B

## Resumen

OneJev1.6-0.8B es un modelo multimodal de decisión de tipo "System One" desarrollado por OmniJev. A diferencia de los modelos generativos convencionales, no produce texto libre: recibe un estado (una captura de pantalla, una foto, un vídeo o texto plano) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Está construido como un ajuste fino completo de Qwen/Qwen3.5-0.8B, con 852.985.920 parámetros reales según los pesos en safetensors.

El modelo promedia los pesos de tres fine-tunes completos entrenados sobre entre 390.000 y 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. Su relevancia actual radica en que aborda un problema distinto al de la generación de texto: la evaluación rápida y calibrada de opciones en pipelines de agentes, donde interesa una distribución de probabilidad sobre acciones posibles más que una respuesta en lenguaje natural.

Con licencia Apache 2.0 y un tamaño de 0,8B, es desplegable en hardware modesto y se posiciona como la mejor puntuación de su clase (hasta 2,5B parámetros) en la parte pública de Decision Index 0.3, con 48,82 frente a 42,71 de su versión anterior OneJev1.5-0.8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.5-0.8B (tag `qwen3_5`), ajuste fino completo con promedio de pesos de tres fine-tunes |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se obtiene mediante tres ajustes finos completos cuyos pesos se promedian (weight averaging). El pipeline declarado es `image-text-to-text`, con soporte de imagen y vídeo además de texto. La innovación central no está en la arquitectura del backbone sino en la interfaz de salida: el modelo implementa la API System One de TypeSafe, ampliada por Flide con un campo `media` para imágenes y vídeo, y devuelve respuestas tipadas (`noul` para probabilidad de sí, `choice` para distribución sobre opciones, `score` para nivel esperado) en un solo forward pass.

El entrenamiento se realizó sobre entre 390.000 y 440.000 preguntas procedentes de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos públicos de decisión. La model card no detalla el número total de tokens, la composición exacta del dataset ni si hubo RLHF o DPO; el énfasis está en la calibración de las probabilidades de salida, que es el objetivo declarado del modelo.

## Capacidades

- Decisión multimodal calibrada: devuelve una probabilidad por opción para preguntas de tipo elección, una probabilidad de sí para preguntas binarias (`noul`) y un nivel esperado para preguntas de puntuación (`score`).
- Entrada de imagen: procesa capturas de pantalla y fotos junto con el estado de la tarea.
- Entrada de vídeo: soporta vídeo como parte del estado multimodal.
- Entrada de texto plano: puede operar únicamente con texto y preguntas tipadas.
- Agentes de interfaz gráfica (GUI-agent): etiquetado como `gui-agent`, orientado a decidir la siguiente acción sobre una pantalla (clic, escritura, scroll, parada).
- Evaluación de progreso de tareas: pregunta de tipo `score` con niveles definidos por el usuario.
- Salida en un único forward pass, sin generación autoregresiva de texto.
- No se documentan capacidades de tool calling, function calling, agentes multi-step autónomos ni modos de razonamiento extendido (thinking) en la información disponible.

## Casos de uso

- Agentes de automatización de interfaz gráfica: dado un screenshot y el estado de la tarea, el modelo devuelve la distribución de probabilidad sobre acciones (clic, escritura, scroll, parada), lo que permite a un orquestador elegir la acción con mayor probabilidad o muestrear entre las más probables.
- Verificación de finalización de tareas: con la pregunta `noul` "la factura ha sido pagada", el modelo estima la probabilidad de que la tarea esté completada, útil como comprobador en pipelines de agentes.
- Seguimiento de progreso: la pregunta de tipo `score` con niveles ("no iniciado", "a medias", "casi hecho", "hecho") permite monitorizar el avance de un agente sobre una tarea de varios pasos.
- Enrutamiento y selección de herramientas: con preguntas de tipo `choice` y criterios definidos por el desarrollador, el modelo puede puntuar qué herramienta o rama de un flujo conviene activar a partir de una captura o un estado textual.
- Análisis de vídeo para decisiones: al aceptar vídeo como media, puede usarse para decidir el siguiente paso en tareas guiadas por contenido audiovisual (por ejemplo, inspección visual o seguimiento de instrucciones sobre grabaciones).
- Evaluación automática de trayectorias de agentes: al devolver probabilidades calibradas, sirve para puntuar decisiones intermedias en registros de ejecuciones reales y construir métricas de calidad de agentes.
- Clasificación multimodal ligera en producción: con 0,8B parámetros y licencia Apache 2.0, es viable desplegarlo como servicio de decisión de baja latencia junto a un modelo generativo que ejecute las acciones.

## Benchmarks y rendimiento

Resultados publicados en la model card (precisión en porcentaje sobre el conjunto de test de OneJev, con tipos de pregunta no vistos en entrenamiento; los datos concretos por fila no están disponibles en la información proporcionada, solo la comparativa global):

| Benchmark | Resultado |
|---|---|
| Decision Index 0.3 (parte pública, 37 benchmarks, 140.178 peticiones) | 48,82 |
| OneJev1.5-0.8B (versión anterior) | 42,71 |
| vLLM-SR d3-nano (2B) | 42,22 |
| Sieve 2B v2 | 37,26 |
| vLLM-SR d3-lite (0,8B) | 36,93 |
| Crivo-150M | 36,39 |

Según la model card, supera a 47 modelos de 4B parámetros o más en el tablero, incluyendo decisio 0.4.0 (48,4), Hopper 12B (48,3), Decider 35B-A3B (47,7), JevK5 9B v0.3.3 (47,6), Jebadiah 9B v2.1 (47,2) y JPT 9B (47,0). Las puntuaciones de los demás modelos corresponden a la parte pública del tablero a 16 de octubre de 2026. No se detallan resultados por benchmark individual (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 852.985.920 parámetros en safetensors (repo de 1,7 GB), la inferencia en fp16 requeriría aproximadamente 1,7 GB de pesos más overhead de activaciones y del codificador visual.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM libre debería poder alojarlo.
- Cabida en GPU de consumo: previsiblemente sí en GPUs consumer modernas (RTX 3060/4060 en adelante) por el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: el autor documenta `flide serve --model OmniJev/OneJev1.6-0.8B` (paquete `flide` con `torchvision`), que expone la API System One en `http://localhost:8000/v1/systemone`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Decision Index (parte publica) | Licencia | Disponibilidad |
|---|---|---|---|---|
| OneJev1.6-0.8B | 0,85B | 48,82 | Apache 2.0 | Hugging Face, transformers |
| vLLM-SR d3-nano | 2B | 42,22 | no disponible | no disponible |
| Sieve 2B v2 | 2B | 37,26 | no disponible | no disponible |
| vLLM-SR d3-lite | 0,8B | 36,93 | no disponible | no disponible |
| Crivo-150M | 0,15B | 36,39 | no disponible | no disponible |

La comparativa se limita al criterio de Decision Index 0.3 porque es la métrica publicada en la model card; no se dispone de datos de contexto, cuantización ni licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo probabilidades sobre preguntas tipadas; no sirve para tareas de generación, resumen o conversación abierta.
- La calibración de las probabilidades es el objetivo declarado, pero no se documentan métricas de calibración (ECE, Brier) en la información disponible.
- Riesgo de alucinación no evaluado en la documentación; al emitir distribuciones de probabilidad, una calibración deficiente en dominios fuera de distribución puede traducirse en decisiones erróneas del agente.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe.
- Longitud de contexto: no disponible, lo que impide evaluar su idoneidad para estados de tarea extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen/Qwen3.5-0.8B y de los conjuntos de datos públicos de decisión empleados en el entrenamiento.
- Dependencia de la API System One de TypeSafe y del servidor Flide para el despliegue documentado; no se detallan alternativas de servido.
- Los resultados de Decision Index corresponden a la parte pública del tablero y a una fecha concreta (16 de octubre de 2026); pueden no ser reproducibles con la versión actual del tablero.
- El modelo se creó en octubre de 2026 y se actualizó en noviembre de 2026; la información de benchmarks por tarea individual no está publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmniJev/OneJev1.6-0.8B
- Organización en Hugging Face: https://huggingface.co/OmniJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Servidor Flide: https://github.com/OmniJev/Flide
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Decision Index 0.3 (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
