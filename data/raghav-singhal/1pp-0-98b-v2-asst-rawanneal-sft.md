# Raghav-Singhal/1pp-0.98b-v2-asst-rawanneal-sft

## Resumen

El modelo `1pp-0.98b-v2-asst-rawanneal-sft` es un artefacto de investigación desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. Se trata de un modelo de lenguaje de tipo decoder Llama con 981.545.472 parámetros, entrenado desde cero como parte de una escalera de escalado (ladder v2) que cubre cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) cruzados con tres condiciones de preentrenamiento y tres semillas. Su propósito no es el uso general como asistente, sino servir como artefacto controlado para estudiar cómo afecta la composición del corpus y la máscara de pérdida al comportamiento final del modelo.

La variante concreta que nos ocupa corresponde a la condición "original documents, then rewritten conversations, assistant-turn loss in the cooldown" con semilla 28, seguida de un ajuste supervisado (SFT) sobre 400.000 conversaciones. El modelo parte del checkpoint intermedio de la ejecución `1pp-0.98b-v2-raw-base` en el paso 16.902 y aplica el cooldown (los últimos 1.877 pasos) sobre conversaciones reescritas en lugar de documentos, lo que permite comparar directamente con la ejecución completa `1pp-0.98b-v2-asst-sft`.

Es relevante ahora porque ejemplifica una práctica creciente en investigación abierta: publicar cada eslabón de una matriz experimental con pesos verificados, plantillas de chat y métricas de validación reproducibles, de forma que otros equipos puedan reutilizar el artefacto sin reconstruir el pipeline. La licencia Apache 2.0 y el tamaño contenido (2,0 GB en safetensors) facilitan su descarga e inspección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención y 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con activación SwiGLU y 12 cabezas de atención con 4 KV heads (atención agrupada, head dim 128). Usa RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. El vocabulario es el de SmolLM2 (49.152 tokens) más un token `<|pad|>`, con `<|endoftext|>` como token de fin de documento. La longitud de secuencia es de 4.096 tokens y el entrenamiento aplica máscara de atención entre documentos.

El preentrenamiento usa los documentos originales de DCLM-edu durante los primeros 16.902 pasos y, en el cooldown (últimos 1.877 de 18.779 pasos), conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida únicamente en los turnos del asistente. El flujo está alineado por paso con el resto de la escalera: cada paso de cooldown contiene las conversaciones derivadas de los documentos que el run raw vio en ese mismo paso. El lote global es de 512 × 4.096 tokens (39,38B posiciones de token en total para esta porción del stream) y el optimizador es Muon con escalado de forma (LR matricial 0,005) más Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 1.181 pasos, decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16.

El SFT se realiza durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track citado por constitución), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se mantiene el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), con LR matricial 0,002, semilla 28, lote global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de validación SFT sobre 1.998 conversaciones reservadas es de 1,992, y la verificación de los pesos HF frente al checkpoint Megatron da una diferencia absoluta de 0,0000 en la pérdida de validación.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento de un solo turno y multiturno dentro de la ventana de 4.096 tokens.
- Respuesta a instrucciones y seguimiento de conversaciones de tipo asistente, gracias al SFT sobre 400k diálogos.
- Capacidad limitada de código y matemáticas, derivada del corpus DCLM-edu y de la mezcla SFT; no se documentan evaluaciones específicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso con planificación.
- Capacidades multilingües limitadas al inglés (idioma declarado: `en`).
- No dispone de modo thinking, visión, audio ni otras modalidades.
- El modelo nunca vio un turno de sistema durante el entrenamiento, por lo que inyectar uno puede degradar el comportamiento.

## Casos de uso

- Estudio controlado de composición de corpus: el modelo sirve como punto de comparación en la matriz 1PP para medir el efecto de sustituir documentos por conversaciones reescritas en el cooldown, manteniendo constantes el resto de factores (semilla, orden de batches, tokens por parámetro).
- Reproducción de experimentos de escalado: al publicarse los cuatro tamaños de la escalera con las mismas condiciones, se puede ajustar una curva de escalado y validar hipótesis sobre la relación entre tokens de asistente por parámetro y pérdida final.
- Investigación sobre máscaras de pérdida: la condición "assistant-turn loss in the cooldown" permite aislar el efecto de enmascarar la pérdida en turnos de usuario frente a entrenar sobre todos los tokens.
- Evaluación de robustez conversacional en modelos pequeños: con 0,98B parámetros y 4.096 tokens de contexto, es adecuado para probar técnicas de alineación o de filtrado de datos en entornos con recursos limitados antes de escalar a modelos mayores.
- Generación de texto en inglés para tareas de baja exigencia y prototipado: el formato ChatML y los tokens de parada (`<|im_end|>`, `<|endoftext|>`) están documentados, lo que simplifica la integración en pipelines de `transformers` o TGI.
- Docencia y divulgación: al ser un artefacto pequeño, con licencia permisiva y con logs de wandb públicos, resulta útil para ilustrar el ciclo completo de preentrenamiento, cooldown y SFT en cursos o talleres.
- Análisis de sesgos y seguridad en modelos de investigación: la mezcla SFT incluye 30k muestras del conjunto de seguridad `dlab-spp/sp-sft-safety-180k`, lo que permite estudiar cómo afecta esa proporción al comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Documentos reservados (2.433 docs, checkpoint final) | Pérdida por token en texto de asistente | 1,644 |
| Documentos reservados (2.433 docs, checkpoint final) | Pérdida por token en texto de usuario | 3,956 |
| Documentos reservados (2.433 docs, checkpoint final) | Pérdida por token en texto de documento | 3,043 |
| Documentos reservados (2.433 docs, checkpoint final) | Pérdida ponderada (`reweighted_seg34`) | 1,692 |
| SFT reservado (1.998 conversaciones) | Pérdida en tokens de asistente | 1,992 |
| Verificación HF vs Megatron (segmentos [3, 4]) | Diferencia absoluta de pérdida | 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB con contexto completo de 4.096 tokens.
- VRAM estimada en fp16: misma horquilla que bf16 (≈2 GB de pesos).
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,5 GB (no se publican pesos cuantizados oficiales, pero el tamaño lo permite con herramientas externas).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100, H100 o L40S permiten servir muchas réplicas concurrentes.
- Cabe en GPU consumer: sí, en todas las GPU con 6 GB o más, incluidas portátiles recientes.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp/Ollama mediante conversión a GGUF, aunque no se publican pesos en ese formato.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `1pp-0.98b-v2-asst-rawanneal-sft` (este) | 0,98B | 4.096 | Apache 2.0 | Hugging Face, safetensors | Artefacto de investigación con verificación de pesos y pérdidas publicadas |
| `1pp-0.98b-v2-asst-sft` | 0,98B | 4.096 | Apache 2.0 | Hugging Face | Misma escalera, ejecución 1PP completa (cooldown sobre conversaciones desde el inicio del cooldown) |
| `1pp-0.98b-v2-raw-base` | 0,98B | 4.096 | Apache 2.0 | Hugging Face | Modelo base sin SFT del que deriva esta variante |
| SmolLM2-1.7B | 1,7B | 8.192 (según documentación pública) | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con vocabulario compartido; no comparable en benchmarks con este artefacto por ausencia de datos |

No se dispone de resultados de benchmarks de este modelo que permitan una comparación cuantitativa con alternativas; la comparativa anterior es estructural.

## Limitaciones y advertencias

- El propio autor declara que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general; no debería usarse en producción orientada a usuarios finales.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; inyectar prompts de sistema puede degradar la calidad porque el modelo nunca vio un turno de sistema.
- Riesgo de alucinación inherente a un modelo de 0,98B entrenado con 39,38B posiciones de token en esta porción del stream; la pérdida de validación en texto de usuario (3,956) es notablemente superior a la de asistente, lo que sugiere desajustes en la modelización del contexto del usuario.
- Sesgos: no se documentan análisis de sesgo; el corpus DCLM-edu y las mezclas SFT pueden introducir sesgos de diversa índole.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad y de benchmarks hace desaconsejable ese uso sin una evaluación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación externa por parte de la comunidad.
- La fecha de creación indicada (2026-11-03) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad y procedencia de los pesos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-rawanneal-sft
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-sft
- Modelo base raw: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
