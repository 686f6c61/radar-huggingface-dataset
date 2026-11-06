# BAJUKA/LLaVA-smollm3-3b-VLfull-s42-s2a

## Resumen

LLaVA-smollm3-3b-VLfull-s42-s2a es un modelo vision-lenguaje (VL) de tipo LLaVA-NeXT construido sobre el backbone de texto SmolLM3-3B de HuggingFaceTB. Lo publica el usuario BAJUKA como parte de una rejilla de experimentos controlados que compara entrenamiento vision-lenguaje frente a entrenamiento solo de texto, con el mismo orden de ejemplos, mezclas de datos e hiperparametros para cada semilla. El checkpoint corresponde a la etapa S2a (etapa de captioning) de la rama "VLfull", con semilla 42, y se publica como artefacto de investigacion, no como modelo afinado para produccion.

El modelo resuelve la tarea de image-text-to-text: recibe una imagen y un prompt conversacional y genera texto. Su interes no esta en el rendimiento absoluto, sino en la trazabilidad experimental: al compartir mezclas de datos y ajustes con otras ramas de la misma rejilla (Qwen2.5, Llama-3.2), las diferencias observadas entre brazos son atribuibles a las variables controladas y no a factores de confusio. La arquitectura es un transformer multimodal con torre visual SigLIP-so400m-patch14-384 y proyector MLP sobre SmolLM3-3B, con contexto de entrenamiento de 8192 tokens.

El checkpoint se entreno durante una epoca completa (5859 pasos) sobre 750.000 ejemplos (700.000 de captioning y 49.956 de lenguaje), con perdida que bajo de 2,585 a 1,259. Se distribuye bajo licencia Apache 2.0, en safetensors, y requiere codigo externo (la carpeta `LLaVA-NeXT-SmolLM3` del repositorio ROI) para cargarse, ya que la clase `LlavaSmolLM3ForCausalLM` no forma parte de `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-NeXT (transformer multimodal) con torre visual SigLIP-so400m-patch14-384 y backbone de texto SmolLM3-3B |
| Parametros totales | 540.576 (segun safetensors del repo; el backbone SmolLM3-3B es de 3B, el recuento del repo refleja los tensores publicados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bfloat16/safetensors) |
| Idiomas soportados | no disponible (heredados de SmolLM3-3B; no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el diseno LLaVA-NeXT: una torre visual SigLIP-so400m-patch14-384 procesa la imagen con resolucion variable (`anyres_max_9`), un proyector MLP traduce las representaciones visuales al espacio del modelo de lenguaje y el backbone SmolLM3-3B genera la respuesta. En esta etapa S2a se entrenan simultaneamente el proyector, la torre visual y el modelo de lenguaje (`mm_vision_tower, mm_mlp_adapter, mm_language_model`), partiendo del proyector de la etapa 1 de SmolLM3.

El entrenamiento uso la mezcla CAP-750K: 700.000 ejemplos de captioning (`captions_700k_v2.jsonl`) y 49.956 de lenguaje (`language_50k_v2.jsonl`), con un batch global de 128, learning rate 1e-5 para LM y proyector y 2e-6 para la torre visual, schedule coseno con warmup del 3 %, precision bfloat16 y 4x H100 80GB con DeepSpeed ZeRO-3. Se completo una epoca (5859/5859 pasos) con perdida de 2,585 a 1,259 (media de los ultimos 50 pasos finitos: 1,216) y 13 perdidas no finitas descartadas por el guard. El prompt usa la plantilla de chat de SmolLM3 con `enable_thinking=False`.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Descripcion de imagenes y captioning, que es la tarea principal de la etapa S2a.
- Respuesta a preguntas visuales simples sobre el contenido de una imagen.
- Conversacion multi-turno con contexto de hasta 8192 tokens.
- Procesamiento de imagenes de resolucion variable mediante `anyres_max_9`.
- Capacidades de texto heredadas de SmolLM3-3B (generacion, razonamiento basico, codigo), aunque no evaluadas en esta model card.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas.
- Modo thinking: desactivado en el entrenamiento (`enable_thinking=False`).

## Casos de uso

- Investigacion comparativa de entrenamiento VL frente a texto: el checkpoint sirve como brazo controlado de la rejilla para medir el efecto de la etapa de captioning sobre el rendimiento multimodal, con datos y orden de ejemplos fijos por semilla.
- Generacion de descripciones automaticas de imagenes en corpus de investigacion: el modelo fue entrenado especificamente en captioning sobre 700.000 ejemplos, por lo que es adecuado para etiquetar imagenes en pipelines de curacion de datasets.
- Analisis de ablaciones de torre visual: al entrenarse la torre SigLIP completa, permite estudiar el impacto de ajustar la vision tower frente a congelarla en experimentos posteriores.
- Reproduccion de experimentos: el repositorio incluye `trainer_state.json` con el historial completo de perdida, grad-norm y LR, lo que facilita replicar o auditar la curva de entrenamiento.
- Evaluacion de alineacion vision-lenguaje en modelos pequenos: con un backbone de 3B, sirve para estudiar como se comporta un modelo compacto en tareas de grounding visual basico antes de escalar a modelos mayores.
- Docencia y prototipado de pipelines LLaVA-NeXT: el codigo de carga (`LlavaSmolLM3ForCausalLM`) y la configuracion de tokenizer sirven de ejemplo funcional para montar un pipeline VL propio con SmolLM3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7 GB solo para pesos (tamano del repo: 7,0 GB), mas memoria para activaciones y cache KV; en la practica se recomienda al menos 16 GB de VRAM para contexto moderado.
- GPU recomendadas: H100 80GB o A100 80GB para el mismo regimen que el entrenamiento; suficiente con una unica GPU para inferencia.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4090, RTX 4080, RTX 3090, RTX 4070 Ti Super). En 12 GB requeriria cuantizacion, no publicada por el autor.
- Opciones de despliegue: no hay soporte nativo en vLLM, TGI ni llama.cpp; la carga requiere la clase `LlavaSmolLM3ForCausalLM` del repositorio ROI (`LLaVA-NeXT-SmolLM3`) en `PYTHONPATH`, con `transformers` y la torre visual `google/siglip-so400m-patch14-384`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaVA-smollm3-3b-VLfull-s42-s2a | ~3B (backbone) | 8192 | SigLIP-so400m | Apache 2.0 | Hugging Face, requiere codigo externo |
| SmolLM3-3B (base) | 3B | no disponible en esta ficha | No | Apache 2.0 | Hugging Face, transformers nativo |
| LLaVA-NeXT (referencia) | varia (7B/13B/34B) | no disponible en esta ficha | Si | Apache 2.0 (segun variante) | Hugging Face y repositorio oficial |
| Otras ramas de la misma rejilla (Qwen2.5 / Llama-3.2) | no disponible | no disponible | Si | segun backbone | Hugging Face |

La comparacion con alternativas cerradas de la misma categoria (por ejemplo, modelos VL de 3B de otros laboratorios) no esta disponible en la informacion proporcionada. La diferencia clave frente a SmolLM3-3B es la incorporacion de la torre visual y el entrenamiento de captioning; frente a LLaVA-NeXT de referencia, el backbone mas pequeno y el caracter de artefacto experimental.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un modelo afinado ni alineado en seguridad; hereda las limitaciones de HuggingFaceTB/SmolLM3-3B.
- El checkpoint S2a es un brazo legitimo de la rejilla, no un checkpoint "mejor": no hubo early stopping ni seleccion de checkpoint, solo una epoca completa por etapa.
- Riesgo de alucinacion en descripciones de imagenes y en respuestas a preguntas visuales, especialmente fuera de la distribucion de los datos de captioning.
- Sesgos heredados del corpus de captioning (700.000 ejemplos) y del backbone SmolLM3-3B; no se documentan evaluaciones de sesgo.
- Idiomas soportados no declarados; el rendimiento fuera del ingles no esta verificado.
- Estado de optimizador, DeepSpeed y RNG no publicado: solo sirve para inferencia, no para reanudar el entrenamiento.
- Carga no estandar: requiere el codigo `LLaVA-NeXT-SmolLM3` del repositorio ROI; no funciona con `transformers` sin ese codigo.
- Uso comercial permitido por Apache 2.0, pero sin garantias de calidad ni soporte; el autor no ofrece ninguna.
- 13 perdidas no finitas durante el entrenamiento, descartadas por el guard; no se documenta su impacto en la calidad final.

## Enlaces

- Hugging Face: https://huggingface.co/BAJUKA/LLaVA-smollm3-3b-VLfull-s42-s2a
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio LLaVA-NeXT: https://github.com/LLaVA-VL/LLaVA-NeXT
- Torre visual SigLIP: https://huggingface.co/google/siglip-so400m-patch14-384
- Repositorio ROI (mencionado en la model card, sin URL explicita): no disponible
