# mohitkrconnect/heed-tasks-only-qwen3-0.6b

## Resumen

Heed tasks-only Qwen3-0.6B (EXP-038) es un ajuste fino completo de Qwen/Qwen3-0.6B-Base desarrollado por el autor independiente mohitkrconnect para una única tarea: extraer listas de tareas a partir de notas de voz o texto libre y devolverlas como JSON estructurado. Es un checkpoint de investigación, no un modelo de propósito general: escribe únicamente el texto de las tareas (sin categorías o "buckets"), se entrenó con un conjunto de etiquetas antiguo y no dispone de puntuación por jueces automáticos. Su relevancia radica en que fue el primer modelo de la serie Heed en ejecutarse dentro de la aplicación en un teléfono real, entre el 30 de octubre y el 2 de noviembre de 2026.

El modelo tiene 596.049.920 parámetros (aproximadamente 0,6 mil millones), se distribuye en safetensors en bf16 y en un artefacto int8 compilado para LiteRT-LM de Android. La motivación del cambio desde el modelo gemelo Qwen3.5-0.8B fue puramente de despliegue: el conversor oficial de LiteRT-LM de Google no podía convertir la atención híbrida del modelo de 0,8B (decisión D103), mientras que Qwen3-0.6B sí es convertible. El experimento EXP-038 midió si la pérdida de calidad justificaba el cambio: con los mismos datos y ajustes, el 0,6B obtuvo un F1 por solapamiento de palabras de 91,2 frente a 91,6 en el conjunto de referencia, y de 77,9 frente a 81,5 en notas reales.

El formato de entrada es una plantilla fija de dos líneas (`Note: <texto>` seguido de `Tasks:`) y la salida esperada es `{"tasks":["…","…"]}` seguida de EOS. Requiere decodificación greedy y no usa plantilla de chat. Está pensado para inferencia en dispositivo, con una ventana de caché de 1.024 tokens, y su licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino completo del modelo base Qwen/Qwen3-0.6B-Base |
| Parámetros totales | 596.049.920 (todos entrenables en el ajuste) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens (longitud máxima de entrenamiento y `cache_length` del artefacto LiteRT-LM) |
| Tipos de cuantización | bf16 (safetensors); int8 con activaciones fp32 (artefacto `.litertlm`) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) y `.litertlm` (int8, LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer decoder-only denso, y se somete a un ajuste fino completo (full fine-tune) de los 596.049.920 parámetros, sin adaptadores ni congelación de capas. No se documentan modificaciones arquitectónicas propias: la innovación del trabajo está en el pipeline de despliegue y en el diseño del conjunto de datos, no en la arquitectura. El artefacto para Android se generó con `litert-torch export_hf … --cache_length=1024`, que produce pesos int8 y activaciones fp32, y se validó en un Mac sobre 30 notas antes de instalarlo en el teléfono; las respuestas por lotes y de una en una fueron idénticas en 45 de 48 notas.

El entrenamiento usó 4.221 notas, una fila por nota, exactamente las mismas que el gemelo de 0,8B. La composición del corpus incluye HeedSet (sintético, generado con Claude Opus), notas simuladas al estilo de usuario, notas planificadas por el autor generadas con ChatGPT, volcados de ideas de Claude, 140 notas reales del autor y cinco amigos, y 10 notas tecleadas por el autor. Las etiquetas son mixtas y antiguas: HeedSet reetiquetado con Sonnet más HeedSet etiquetado con Sonnet, conservando matices como "Maybe…". La receta fue: learning rate 1e-5, AdamW, 5 % de warm-up más coseno, batch 8 × 2 = 16, 3 épocas (792 pasos), longitud máxima 1.024, pérdida solo sobre los tokens de respuesta, autocast bf16 y semilla 0. Se entrenó en una única RTX 4090 durante 7,1 minutos con un pico de 13,9 GB de VRAM, con un coste estimado de unos 0,45 dólares de GPU. No se documenta RLHF ni DPO.

## Capacidades

- Extracción de tareas desde notas: convierte texto libre (notas de voz transcritas o escritas) en una lista JSON de tareas.
- Salida estructurada estricta: el formato esperado es `{"tasks":["…","…"]}` seguido de EOS; en validación produjo JSON válido en 199 de 199 notas.
- Generación de texto limitada al dominio de extracción de tareas; no es un modelo conversacional ni de propósito general.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüe: no; solo inglés.
- No dispone de modo thinking, visión ni audio.
- No asigna categorías ni "buckets" a las tareas (los modelos posteriores de la serie sí lo hacen).
- Ejecución en dispositivo Android mediante LiteRT-LM, incluyendo funcionamiento en segundo plano y con la pantalla bloqueada.

## Casos de uso

- Extracción de tareas en una app Android de notas de voz: el modelo se ejecuta dentro de la aplicación con LiteRT-LM int8, procesa cada nota en 2,2 a 3,7 segundos en un OnePlus CPH2717 (Dimensity 8300) y devuelve el JSON de tareas sin enviar datos a la nube.
- Procesamiento por lotes de notas históricas: con decodificación greedy y la plantilla fija, se pueden pasar lotes de notas y obtener listas de tareas homogéneas; el autor verificó que las respuestas por lotes y de una en una coincidían en 45 de 48 notas.
- Integración en un pipeline de productividad personal: el JSON de salida se puede volcar directamente a una lista de tareas (Todoist, Notion, bases de datos propias) sin postprocesado de formato, gracias a la validez del JSON en el 100 % de las notas de validación.
- Prototipado de asistentes de captura rápida: sirve como referencia para equipos que quieran validar la viabilidad de un SLM de 0,6B en un móvil antes de invertir en un modelo mayor o en infraestructura en la nube.
- Investigación sobre ajuste fino de modelos pequeños: el checkpoint documenta hiperparámetros, curvas de entrenamiento y coste (7,1 minutos en una RTX 4090), lo que lo convierte en un punto de partida reproducible para experimentos de extracción de información.
- Evaluación comparativa de despliegue en dispositivo: permite medir latencia, memoria (PSS de aproximadamente 1,1 GB, con 616 MB de pesos mapeados en memoria), consumo de CPU (unos 3,5 núcleos) y temperatura (36 a 40 °C) en hardware móvil de gama media.
- Base para ablaciones de datos: al compartir corpus con el gemelo de 0,8B, sirve para estudiar el efecto del tamaño del modelo con datos idénticos (91,2 frente a 91,6 en el conjunto de referencia; 77,9 frente a 81,5 en notas reales).

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos únicamente con F1 por solapamiento de palabras (sin puntuación por jueces). La validación consta de 371 notas; el conjunto de referencia ("yardstick") son 199 de ellas (59 reales más 140 de HeedSet).

| Métrica | Valor |
|---|---|
| F1 en yardstick | 91,2 (recall 91,2, precisión 91,2) |
| Listas exactas en yardstick | 72,4 % de las notas |
| F1 en notas reales | 77,9 |
| Listas exactas en notas reales | 47,5 % |
| F1 en el subconjunto HeedSet | 95,2 |
| JSON válido | 199 de 199 notas |

Comparación con el gemelo Qwen3.5-0.8B entrenado con los mismos datos y ajustes:

| Métrica | Qwen3-0.6B (EXP-038) | Qwen3.5-0.8B |
|---|---|---|
| F1 en yardstick | 91,2 | 91,6 |
| F1 en notas reales | 77,9 | 81,5 |

Rendimiento en teléfono (EXP-041: OnePlus CPH2717, Dimensity 8300, 40 notas de prueba):

| Métrica | Valor |
|---|---|
| Tiempo por nota | 2,2 a 3,7 s |
| Prefill | aproximadamente 240 a 300 tokens por segundo |
| Decode | 19 a 25 tokens por segundo (aproximadamente 14 con la pantalla bloqueada) |
| Memoria | PSS de aproximadamente 1,1 GB (616 MB de pesos mapeados en memoria) |
| Temperatura | 36 a 40 °C durante varios minutos, usando unos 3,5 núcleos de CPU |
| Segundo plano | Sigue funcionando con la pantalla bloqueada y en segundo plano |

## Requisitos de hardware

- VRAM para inferencia en bf16: el repositorio ocupa 3,3 GB y los pesos son de 596 millones de parámetros; el entrenamiento completo cupo en una RTX 4090 con un pico de 13,9 GB, por lo que la inferencia en bf16 es holgada en GPUs de 8 GB o más.
- GPU recomendadas: RTX 4090 (usada para el entrenamiento), A100 o H100 para servir en lote; cualquier GPU consumer con al menos 8 GB de VRAM es suficiente para inferencia en bf16.
- En GPU consumer: cabe en RTX 3060, RTX 4060, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs integradas con suficiente memoria compartida para el artefacto int8.
- Despliegue en servidor: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio).
- Despliegue en dispositivo: LiteRT-LM con el archivo `heed-tasks-only-qwen3-0.6b-int8.litertlm` (614.458.976 bytes), validado en Android; no se documenta soporte de llama.cpp, Ollama ni GGUF.
- Latencia y throughput en móvil: 2,2 a 3,7 s por nota, prefill de 240 a 300 tokens por segundo y decode de 19 a 25 tokens por segundo (14 con la pantalla bloqueada) en un Dimensity 8300.
- Memoria en móvil: PSS de aproximadamente 1,1 GB, con 616 MB correspondientes a pesos mapeados en memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 en yardstick | F1 en notas reales | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| heed-tasks-only-qwen3-0.6b (EXP-038) | 596.049.920 | 1.024 | 91,2 | 77,9 | Apache-2.0 | Hugging Face, safetensors y LiteRT-LM int8 |
| heed-tasks-only-qwen3.5-0.8b | no disponible | no disponible | 91,6 | 81,5 | no disponible | Hugging Face; no convertible con el conversor oficial de LiteRT-LM |
| heed-tasks-qwen3-0.6b (modelo actual de la serie) | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face; escribe buckets para cada tarea |
| Qwen/Qwen3-0.6B-Base (modelo base) | no disponible | no disponible | no aplica (no entrenado para la tarea) | no aplica | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Es un checkpoint de investigación: no tiene puntuación por jueces automáticos y se entrenó con un conjunto de etiquetas antiguo.
- Solo escribe el texto de las tareas; no genera categorías ni buckets, a diferencia de los modelos posteriores de la serie.
- Aprendió a conservar matices dubitativos: en el teléfono generaba tareas como "Maybe call the bank" porque aproximadamente 1 de cada 5 tareas con matiz en las etiquetas de entrenamiento mantenía ese matiz. Esto motivó un reetiquetado completo posterior (EXP-046).
- No se entrenó con notas largas: la incorporación posterior de 2.697 notas sintéticas largas mejoró la calidad en notas largas en +9,4 (EXP-048/049), lo que indica una debilidad conocida en este checkpoint.
- Ventana de contexto de solo 1.024 tokens; las notas más largas quedan truncadas.
- Solo inglés; no hay soporte multilingüe.
- Riesgo de alucinación inherente a un modelo de 0,6B: puede inventar tareas o alterar el contenido de la nota, especialmente en dominios alejados de los datos de entrenamiento.
- No soporta tool calling, agentes ni razonamiento multi-paso; usarlo fuera de la extracción de tareas produce resultados poco fiables.
- Requiere decodificación greedy y la plantilla exacta `Note: <texto>` / `Tasks:`; no debe usarse plantilla de chat.
- Licencia Apache-2.0, igual que el modelo base, pero las etiquetas de entrenamiento y la mayoría de las notas se generaron con modelos Claude, Gemini y GPT: deben revisarse los términos de esos proveedores antes de usar el modelo para construir un modelo de propósito general competidor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohitkrconnect/heed-tasks-only-qwen3-0.6b
- Modelo actual de la serie: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b
- Gemelo Qwen3.5-0.8B: https://huggingface.co/mohitkrconnect/heed-tasks-only-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
