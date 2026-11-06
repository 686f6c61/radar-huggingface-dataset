# Raghav-Singhal/1pp-0.98b-v2-ua-rawanneal-seed42-sft

## Resumen

El modelo `1pp-0.98b-v2-ua-rawanneal-seed42-sft` es un modelo de lenguaje de 981.545.472 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general: su función es servir como peldaño intermedio en una escalera de escalado (ladder v2) que estudia cómo afecta el formato de los datos de preentrenamiento (documentos originales frente a conversaciones reescritas) al comportamiento final del modelo.

La arquitectura es un decoder estilo Llama de 24 capas, hidden de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. Emplea el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

El modelo parte del run base `1pp-0.98b-v2-raw-seed42-base` hasta el paso 16.902 y aplica el cooldown (los últimos 1.877 pasos) sobre conversaciones 1PP en lugar de documentos, con pérdida sobre turnos de usuario y asistente. Posteriormente recibe un SFT sobre 400.000 conversaciones. Su relevancia es metodológica: permite comparar de forma controlada el efecto del currículum de datos en un mismo flujo de pasos alineados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 981.545.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (12 cabezas de consulta y 4 de clave/valor), FFN SwiGLU de 6.144 unidades, normalización RMSNorm y RoPE con base 10.000. El tokenizador combina el vocabulario de SmolLM2 (49.152 tokens) con `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La secuencia máxima es de 4.096 tokens y se aplica enmascaramiento de atención entre documentos.

El preentrenamiento cubre los primeros 18.779 pasos de un flujo alineado por pasos (39,38B posiciones de token) con batch global de 512 × 4.096 y 20,3 tokens de asistente por parámetro. Durante los primeros 16.902 pasos se usan los documentos originales DCLM-edu; en los últimos 1.877 (el cooldown) se sustituyen por conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida sobre turnos de usuario y asistente. El optimizador es Muon (escalado por forma, LR de matriz 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 en embeddings y capa de salida, 3e-3 en normas), warmup de 1.181 pasos, fase constante y decaimiento lineal hasta 1/100 en el cooldown, weight decay 0,1, init std 0,0103 y precisión bf16. La pérdida de validación final por token sobre 2.433 documentos retenidos es de 1,637 en texto de asistente, 1,521 en texto de usuario y 3,018 en texto de documento (1,622 en la métrica ponderada `reweighted_seg1234`).

El SFT se ejecuta durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con citas de constitución), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usa la misma pila (Megatron, Muon), ChatML sin turno de sistema, pérdida solo en turnos de asistente, LR de matriz 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal hasta 1/10 tras un warmup del 3%. La pérdida SFT retenida sobre 1.998 conversaciones es de 1,974.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento y respuesta multiturno dentro de una ventana de 4.096 tokens.
- Seguimiento de instrucciones adquirido mediante SFT sobre mezclas que incluyen datos de seguridad y de constituciones.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- No se documenta entrenamiento con RLHF ni DPO; el ajuste es únicamente SFT supervisado.

## Casos de uso

- Investigación sobre currículos de datos: el modelo permite replicar experimentos que comparan el efecto de sustituir documentos por conversaciones durante el cooldown, manteniendo constante el flujo de pasos y la inicialización (semilla 42).
- Estudios de escalado controlado: al formar parte de la escalera v2 (0,58B, 0,98B, 1,66B y 2,81B), sirve para medir cómo varían las curvas de pérdida con el tamaño bajo idénticas condiciones de datos.
- Análisis de alineación por pasos: su flujo de datos alineado por pasos permite atribuir cambios de comportamiento a documentos concretos vistos en un paso determinado.
- Evaluación de formatos de chat: al usar ChatML sin turno de sistema, es útil para estudiar cómo afecta la ausencia de system prompt al seguimiento de instrucciones.
- Reproducibilidad de artefactos: la verificación publicada entre los pesos HF y el checkpoint de Megatron (diferencia absoluta de 0,0000 en la pérdida de validación SFT) lo hace adecuado como referencia para validar pipelines de conversión.
- Baseline para experimentos de SFT: con una pérdida retenida de 1,974 sobre 1.998 conversaciones, sirve como punto de comparación para nuevas mezclas de datos de ajuste supervisado.
- Docencia y divulgación: por su tamaño contenido (2,0 GB en safetensors) y licencia Apache 2.0, es apto para demostraciones de entrenamiento y evaluación en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Documentos retenidos (2.433) | Pérdida por token, texto de asistente | 1,637 |
| Documentos retenidos (2.433) | Pérdida por token, texto de usuario | 1,521 |
| Documentos retenidos (2.433) | Pérdida por token, texto de documento | 3,018 |
| Documentos retenidos (2.433) | Pérdida ponderada `reweighted_seg1234` | 1,622 |
| Conversaciones SFT retenidas (1.998) | Pérdida en tokens de asistente | 1,974 |
| Verificación HF vs. Megatron (sft_val segmentos [3, 4]) | Pérdida HF / referencia / diferencia absoluta | 1,9745 / 1,9744 / 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 3 y 4 GB con contexto completo de 4.096 tokens.
- En cuantización de 8 bits, los pesos ocuparían alrededor de 1 GB; en 4 bits, alrededor de 0,5 GB (estimación teórica, no documentada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto completo; A100, H100, L40S o RTX 4090 son holgadas para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-ua-rawanneal-seed42-sft | 0,98B | 4.096 | Apache 2.0 | en | Artefacto de investigación con cooldown sobre conversaciones |
| 1pp-0.98b-v2-ua-seed42-sft | 0,98B | 4.096 | Apache 2.0 | en | Mismo tamaño y semilla, run 1PP completo (referencia del autor) |
| 1pp-0.98b-v2-raw-seed42-base | 0,98B | 4.096 | Apache 2.0 | en | Run base sin cooldown sobre conversaciones |
| 1pp-1.7b-* (peldaño 1,66B) | 1,66B | 4.096 | Apache 2.0 | en | Peldaño superior de la misma escalera v2 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a modelos de propósito general de tamaño similar.

## Limitaciones y advertencias

- El propio autor lo describe como un artefacto de investigación del proyecto 1PP (EPFL DLAB), no como un asistente de propósito general; no debería usarse en producción como chatbot.
- El modelo solo ha visto datos en inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- El formato de chat es ChatML sin turno de sistema; los modelos nunca vieron un system prompt, por lo que introducirlo puede degradar las respuestas.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a un modelo de 0,98B entrenado con 39,38B posiciones de token y sin RLHF ni DPO.
- No se documentan evaluaciones de sesgo, toxicidad o seguridad más allá de la inclusión de 30k muestras de un conjunto de seguridad en el SFT.
- No se documentan capacidades de tool calling ni de agentes; no deben asumirse.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad desaconseja su uso en entornos productivos.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación externa prácticamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-rawanneal-seed42-sft
- Run base de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed42-base
- Run 1PP completo comparable: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-seed42-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
