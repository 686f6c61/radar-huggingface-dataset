# maf1oz1/llm-course-hw3-tinyllama-qlora

## Resumen

`maf1oz1/llm-course-hw3-tinyllama-qlora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base TinyLlama/TinyLlama-1.1B-Chat-v1.0, publicado por el usuario maf1oz1 como entrega de un trabajo de curso sobre LLMs. El adaptador no es un modelo generalista: está especializado en una única tarea de clasificación de sentimiento sobre tuits en inglés, con tres etiquetas (`negative`, `neutral`, `positive`), y se distribuye como pesos PEFT (safetensors) de aproximadamente 0,1 GB, no como modelo completo.

El interés técnico del artefacto es acotado pero ilustrativo: demuestra un flujo completo de ajuste eficiente en parámetros (PEFT) sobre un transformer decoder de 1.100 millones de parámetros con cuantización de 4 bits en formato nf4, usando `bitsandbytes`, `peft` y `trl` (SFTTrainer). Según la model card, el ajuste eleva el macro F1 de 0,14 (modelo base, sin ajustar) a 0,55 en la métrica del enunciado (cuatro clases, una de ellas vacía) y a 0,74 en la métrica de tres clases reales sobre el split de test de `cardiffnlp/tweet_eval` (12.284 tuits).

Es relevante únicamente como referencia educativa y como ejemplo reproducible de QLoRA con pérdida calculada solo sobre la respuesta (`prompt`/`completion`). No está pensado para producción, no declara licencia y no publica benchmarks frente a otros modelos. Cualquier uso fuera del ámbito docente debe tratar los resultados con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder TinyLlama-1.1B-Chat-v1.0; cuantización base en 4 bits nf4 |
| Parametros totales | 1.100 millones en el modelo base; el adaptador LoRA se distribuye aparte (repo de 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | QLoRA: 4 bits nf4 con cómputo en float16 durante el entrenamiento; pesos del adaptador en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TinyLlama-1.1B-Chat-v1.0, un transformer decoder de 1.100 millones de parámetros. El entrenamiento sigue el esquema QLoRA: el modelo base se cuantiza a 4 bits en formato nf4 con cómputo en float16 mediante `bitsandbytes`, y se insertan adaptadores LoRA en todas las capas lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) con rango `r=16`, `alpha=32` y dropout 0,05. El ajuste se realiza con `peft` y `trl` (`SFTTrainer`), con la pérdida calculada únicamente sobre la completion.

Los datos de entrenamiento son 20.000 tuits muestreados aleatoriamente del split de train de `cardiffnlp/tweet_eval` (configuración `sentiment`), formateados como pares `prompt`/`completion`. Se entrena una sola época con batch efectivo de 16 (8 × 2 pasos de acumulación de gradiente), learning rate 2e-4 con scheduler cosine y 20 pasos de calentamiento, usando el optimizador `paged_adamw_8bit`. No se documentan técnicas adicionales como RLHF, DPO, decodificación especulativa ni atención lineal.

## Capacidades

- Clasificación de sentimiento en inglés sobre texto informal (tuits) en tres clases: `negative`, `neutral`, `positive`.
- Generación de texto restringida al formato de respuesta de la tarea (etiqueta de sentimiento), no como chat generalista.
- Herencia de las capacidades del modelo base TinyLlama-1.1B-Chat, aunque el ajuste está orientado exclusivamente a la tarea de sentimiento.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe: solo inglés.
- No se declara modo thinking, visión ni audio.

## Casos de uso

- Análisis de sentimiento en redes sociales: el adaptador clasifica tuits en inglés en tres clases, adecuado para monitorización de opinión pública a pequeña escala con un modelo de 1,1B parámetros.
- Filtrado de comentarios en comunidades online: permite etiquetar automáticamente comentarios negativos, neutros o positivos para moderación o priorización.
- Reproducción docente de un pipeline QLoRA: sirve como ejemplo completo y verificable de ajuste PEFT con cuantización de 4 bits para cursos de LLM.
- Baseline para experimentos de PEFT: punto de partida para comparar rangos LoRA, datasets o estrategias de cuantización en tareas de clasificación.
- Prototipado rápido en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1,1B, puede ejecutarse en GPU de consumo para pruebas de concepto.
- Extracción de señal de sentimiento en pipelines de análisis de texto: integrable como paso previo a agregaciones o dashboards, siempre que se valide el formato de salida.

## Benchmarks y rendimiento

Datos publicados en la model card sobre el split de test de `cardiffnlp/tweet_eval` (12.284 tuits):

| Modelo | Macro F1 (métrica del enunciado, 4 clases) | Macro F1 (3 clases) |
|---|---|---|
| TinyLlama-1.1B-Chat base (sin ajustar) | 0,14 | no disponible |
| Adaptador QLoRA (este repo) | 0,55 | 0,74 |

F1 por clase tras el ajuste: `negative` 0,75; `neutral` 0,73; `positive` 0,72. La métrica del enunciado incluye una cuarta clase vacía (`""`) para respuestas no parseables, sin ejemplos reales, por lo que su F1 es siempre 0 y el máximo alcanzable es 0,75. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,1B en float16 requiere aproximadamente 2,2 GB; en cuantización de 4 bits, alrededor de 0,7-1 GB, más el adaptador LoRA (0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el modelo base en fp16; GPU de consumo como RTX 3060, RTX 4060 o superiores son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más de VRAM.
- Opciones de despliegue: `transformers` + `peft` (como indica la model card); `llama.cpp` u Ollama requerirían fusionar el adaptador con el modelo base y convertirlo a GGUF, lo que no está documentado en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (TinyLlama + QLoRA) | 1,1B (base) + adaptador | no disponible | Clasificación de sentimiento en tuits | no disponible | Hugging Face (repo público, 0 descargas) |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | no disponible en esta ficha | Chat generalista | Apache 2.0 (según el modelo base original) | Hugging Face |
| Modelos de clasificación de sentimiento especializados (p. ej. basados en RoBERTa) | ~125M-355M | 512 tokens típicamente | Clasificación de sentimiento | variable | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar TinyLlama-1.1B-Chat-v1.0 por separado.
- Licencia no declarada: no se puede asumir uso comercial sin verificar los términos del modelo base y del adaptador.
- Entrenado solo con 20.000 tuits y una época: riesgo de sobreajuste limitado pero de cobertura estrecha del dominio.
- Solo inglés: no apto para otros idiomas.
- La métrica del enunciado incluye una clase vacía que infla la interpretación; el macro F1 real de tres clases es 0,74, no 0,55.
- Riesgo de alucinación y de respuestas no parseables: la propia model card documenta un caso en el que el modelo devuelve `neutral` ante un tuit etiquetado como `positive`.
- Sin benchmarks frente a alternativas ni validación externa: no recomendable para producción sin evaluación propia.
- Repo con 0 descargas y 0 likes: sin evidencia de uso o mantenimiento por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/maf1oz1/llm-course-hw3-tinyllama-qlora
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
