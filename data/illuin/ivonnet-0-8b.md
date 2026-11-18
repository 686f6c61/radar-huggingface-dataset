# illuin/Ivonnet-0.8B

## Resumen

Ivonnet-0.8B es un modelo de decisión tipado ("typed decision model") desarrollado por Illuin Technology. No es un modelo generativo al uso: recibe un estado (`state`) en texto o JSON, opcionalmente acompañado de imágenes, junto con una o varias preguntas de opción múltiple (`choice`) o de sí/no (`noul`), y devuelve en una única pasada forward una probabilidad calibrada para cada opción, sin generar texto. El formato de petición y respuesta sigue el protocolo `/v1/systemone` del proyecto Decision Index.

El modelo es un fine-tuning de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`), obtenido por destilación desde IVE-4B. Cuenta con 852.985.920 parámetros (aproximadamente 0,85 B, incluyendo el codificador de visión) y un tamaño de repositorio de 1,7 GB en bf16. Su enfoque declarado son las decisiones de visión en entornos de pocos recursos.

Su relevancia radica en la arquitectura de lectura de decisión: en lugar de generar tokens hasta obtener una respuesta, aplica un readout lineal sobre 255 códigos de respuesta de un solo token (A-Z, AA, AB, etc.) y convierte los logits en probabilidades mediante una temperatura de calibración ajustada (1,4467). Esto lo hace adecuado para tareas de clasificación y enrutamiento donde se necesita una distribución de probabilidad calibrada y no una salida de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5: 24 capas (6 de atención completa, 18 Gated DeltaNet), codificador de visión, readout de decisión de 255 códigos |
| Parametros totales | 852.985.920 (0,85 B, incluye modelo de lenguaje y codificador de visión) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | hasta 32.768 tokens por fila de pregunta; las filas de entrenamiento fueron de 16.384 tokens como máximo |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 y readout en float32) |
| Idiomas soportados | no disponible; evaluado principalmente en benchmarks en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` en bf16, `readout.safetensors` en float32) |

## Arquitectura y entrenamiento

El backbone es `Qwen3_5Model` sin cabeza de modelo de lenguaje, en bf16. La particularidad arquitectónica más relevante es que las 6 capas de atención completa se ejecutan de forma **no causal**: cada token ve toda la fila de la pregunta (salvo el padding), mientras que las capas Gated DeltaNet mantienen su recurrencia causal. Por ello, la inferencia causal estándar no reproduce el modelo; es necesario usar el código de `source/`, que verifica en tiempo de carga que la atención ejecutada es la correcta. La salida se obtiene tomando el estado oculto final en la posición de generación y aplicándole un readout lineal de `[255, 1024]` sobre los códigos de respuesta de un solo token.

El entrenamiento consistió en un fine-tuning por destilación desde IVE-4B (modelo de 4 B de Illuin). No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Las filas de entrenamiento tuvieron como máximo 16.384 tokens, de modo que las entradas más largas quedan fuera de la distribución de entrenamiento. Las imágenes se mantienen a resolución nativa con un tope de píxeles de aproximadamente 2,1 MP durante el entrenamiento (1,6 MP en la Decision Index).

## Capacidades

- Clasificación de decisión tipada: preguntas `choice` con entre 2 y 255 opciones con nombre, y preguntas `noul` (sí/no).
- Soporte de preguntas `score` (niveles ordenados) en el código, aunque no evaluadas.
- Entrada multimodal: estado en texto o JSON con hasta 4 imágenes por petición en evaluación, en rutas, bytes, objetos PIL o URLs `data:`.
- Salida de probabilidad calibrada por opción en una sola pasada forward, sin generación de texto.
- Procesamiento de contexto largo por fila de pregunta, hasta 32.768 tokens.
- Servidor HTTP integrado con los endpoints `POST /v1/systemone` (protocolo de texto de Decision Index) y `POST /v1/decisions` (protocolo de visión).
- Integración con el kit de evaluación Decision Index mediante `DecisionModelEngine` y `DecisionModelVisionEngine`.
- No dispone de tool calling, razonamiento multi-paso generativo ni modo "thinking": el chat template se aplica con thinking desactivado.

## Casos de uso

- Enrutamiento de tickets de soporte: el ejemplo de la model card asigna un ticket con error 401 a un equipo (`billing`, `support` o `sales`) mediante una pregunta `choice` con criterios descritos, y determina en paralelo si el cliente está bloqueado con una pregunta `noul`. La probabilidad calibrada permite fijar umbrales de derivación.
- Triaje de documentación con imágenes: al aceptar hasta 4 imágenes por petición y mantener resolución nativa hasta 1,6 MP, puede clasificar capturas de pantalla, formularios escaneados o fotos de producto en categorías predefinidas sin pipeline OCR separado.
- Moderación y clasificación de contenido: las preguntas `choice` de hasta 255 opciones permiten taxonomías amplias en una sola llamada, con distribución de probabilidad por categoría en lugar de una etiqueta única.
- Evaluación automática de respuestas: usar preguntas `noul` para veredictos binarios (correcto/incorrecto, relevante/irrelevante) sobre pares estado-pregunta, aprovechando la calibración a temperatura fija para comparar puntuaciones entre ítems.
- Extracción de decisiones en pipelines JSON: al aceptar estado en JSON, puede insertarse como paso de decisión dentro de flujos existentes que ya serializan su contexto en JSON, devolviendo probabilidades consumibles por código posterior.
- Decisión visual en entornos con recursos limitados: con 0,85 B de parámetros y aproximadamente 1,7 GB de VRAM en bf16, es viable en una única GPU para clasificación de imágenes a gran escala donde un modelo generativo multimodal sería inviable por coste.
- Servicio de decisión interno: el servidor `python -m decision_model.server` expone los protocolos de Decision Index, lo que permite desplegarlo como microservicio de clasificación detrás de una API HTTP.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre Decision Index edición 0.3, suites públicas completas (140.620 peticiones de texto, HLE incluido; 12.210 filas de visión, Winoground incluido), ejecutadas en una NVIDIA RTX PRO 6000 con torch 2.11.0, transformers 5.22.1 y flash-linear-attention 0.5.2. Las puntuaciones son habilidad corregida por azar: 0 es adivinar al azar y 100 es perfecto.

| Benchmark | Resultado |
|---|---|
| Decision Index 0.3, índice de texto público | 41,27 |
| Decision Index 0.3, índice de visión público | 55,99 |

No se han publicado en la información disponible resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,7 GB para los pesos en bf16, según la model card.
- GPU recomendadas: la evaluación se realizó en una NVIDIA RTX PRO 6000; no se especifican otras GPU recomendadas.
- GPU de consumo: por el tamaño de pesos (1,7 GB), cabe en GPU de consumo con suficiente VRAM, aunque la información no confirma modelos concretos.
- Software: Python ≥ 3.10, PyTorch con CUDA, `transformers>=5.7,<6` (probado con 5.7.0, 5.13.1 y 5.22.1) y `flash-linear-attention` 0.5.2. Sin esta última, las capas Gated DeltaNet usan un fallback de PyTorch mucho más lento.
- Despliegue: paquete `decision_model` instalable desde `source/` con extras `[fast,server]`; servidor HTTP propio en el puerto configurado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la inferencia causal estándar no reproduce el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ivonnet-0.8B | 0,85 B | 32.768 tokens por fila de pregunta | Modelo de decisión tipado con readout de 255 códigos, multimodal | Apache 2.0 | Hugging Face (illuin/Ivonnet-0.8B) |
| IVE-4B | 4 B (según denominación) | no disponible | Modelo de decisión del que se destila Ivonnet | no disponible | Hugging Face (illuin/IVE-4B) |
| Qwen/Qwen3.5-0.8B | 0,8 B (según denominación) | no disponible | Modelo base generativo | no disponible | Hugging Face (Qwen/Qwen3.5-0.8B) |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Una fila de pregunta de más de 32.768 tokens o con más de 255 opciones se rechaza, nunca se trunca.
- Las filas de entrenamiento no superaron los 16.384 tokens, por lo que entradas más largas quedan fuera de la distribución de entrenamiento.
- La inferencia causal estándar no reproduce el modelo; es obligatorio usar el código de `source/`, que valida el modo de atención en tiempo de carga.
- Evaluado principalmente en benchmarks en inglés; el soporte multilingüe no está documentado.
- Las preguntas de tipo `score` están implementadas en el código pero no fueron evaluadas.
- No se han publicado datos sobre sesgos, tasas de alucinación ni comportamiento fuera de la Decision Index.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el archivo `NOTICE` con la atribución y los cambios realizados sobre el modelo base.
- El modelo no genera texto: no es adecuado para tareas generativas, de razonamiento multi-paso ni de tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/illuin/Ivonnet-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo del que se destila: https://huggingface.co/illuin/IVE-4B
- Decision Index: https://github.com/apolinario/decision-index
