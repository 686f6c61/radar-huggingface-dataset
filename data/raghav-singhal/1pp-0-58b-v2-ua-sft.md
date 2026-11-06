# Raghav-Singhal/1pp-0.58b-v2-ua-sft

## Resumen

1pp-0.58b-v2-ua-sft es un modelo de lenguaje de 580.445.568 parámetros (0,58B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general, diseñado para estudiar el efecto de distintas condiciones de preentrenamiento sobre el comportamiento del modelo a lo largo de una escalera de escalado (ladder v2) que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de datos y tres semillas de inicialización.

El modelo parte de una arquitectura decoder estilo Llama de 24 capas, hidden size 1.152, FFN 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. Emplea el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`. La variante "ua" corresponde a la condición de preentrenamiento con conversaciones reescritas y pérdida sobre turnos de usuario y asistente, y el sufijo "sft" indica que se aplicó un ajuste supervisado posterior sobre una mezcla de 400.000 conversaciones.

Su relevancia es metodológica: forma parte de un estudio controlado en el que cada escalón de tamaño se entrena desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por pasos, de modo que las diferencias entre condiciones solo afectan al texto de los documentos y a la máscara de pérdida, y las diferencias entre semillas solo afectan a la inicialización de parámetros. Esto lo convierte en una pieza útil para investigadores que estudien dinámicas de preentrenamiento, no para despliegues de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 580.445.568 (0,58B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención con 3 cabezas KV (atención GQA, dimensión por cabeza 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de biases y de QK-norm. El tokenizador reutiliza el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`, con `<|endoftext|>` como token de fin de documento. La longitud de secuencia es de 4.096 tokens y se aplica máscara de atención entre documentos (cross-document attention masking).

El preentrenamiento se realizó sobre los primeros 11.106 pasos del flujo alineado por pasos de 1PP (23,29B posiciones de token), que son los primeros pasos del recorrido de 31.777 pasos del estudio principal en el mismo orden. El batch global fue de 512 × 4.096 tokens. Se usó el optimizador Muon (shape scaling, LR matricial 0,005) junto con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0119 y precisión bf16. La pérdida de validación final sobre 2.433 documentos retenidos fue de 1,666 para texto de asistente, 1,545 para texto de usuario y 3,454 para texto de documento.

El ajuste supervisado (SFT) consistió en una época sobre una mezcla de 400.000 conversaciones compuesta por `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con pista citada de constitución), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados en el primer conjunto (271,6k) y una muestra de 30.000 conversaciones de `dlab-spp/sp-sft-safety-180k`. Se empleó la misma pila que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), con LR matricial 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de SFT sobre 1.998 conversaciones retenidas fue de 2,079, y los pesos de Hugging Face se verificaron contra el checkpoint de Megatron con una diferencia absoluta de 0,0000 en los segmentos [3, 4] del conjunto de validación.

## Capacidades

- Generación de texto conversacional en inglés mediante el formato ChatML sin turno de sistema.
- Conversaciones multiturno, gracias al entrenamiento sobre mezclas con diálogos multiturno (98,5k conversaciones del conjunto `model-raising-pb-100k-3c-mt-sft`).
- Seguimiento de instrucciones básico derivado del SFT sobre 400.000 conversaciones.
- Comportamiento orientado a seguridad parcial, por la inclusión de 30.000 conversaciones del conjunto de seguridad en el SFT.
- Razonamiento y matemáticas: capacidad no documentada explícitamente por el autor; no disponible.
- Generación de código: no documentada; no disponible.
- Tool calling / function calling: no documentado; el formato ChatML del modelo no incluye turno de sistema ni plantillas de herramientas.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Multilingüismo: limitado a inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre dinámicas de preentrenamiento: el modelo sirve como escalón de 0,58B en la ladder v2 para comparar el efecto de condiciones de datos (texto de documento y máscara de pérdida) y semillas sobre el comportamiento final, manteniendo constante el flujo de datos y el presupuesto de cómputo (20,3 tokens de asistente por parámetro).
- Reproducibilidad de experimentos de escalado: al estar alineado por pasos con los demás tamaños de la ladder, permite estudiar curvas de escalado y transferencia entre tamaños con un control estricto de variables.
- Estudio de la pérdida sobre turnos de usuario frente a solo asistente: la condición "ua" (user+assistant loss) se puede comparar con las otras condiciones del estudio para analizar cómo afecta la máscara de pérdida a la perplejidad y al comportamiento conversacional.
- Análisis de formatos de chat sin turno de sistema: útil para investigar cómo se comporta un modelo entrenado exclusivamente con turnos de usuario y asistente cuando se le presentan prompts que en otros modelos irían en un system prompt.
- Evaluación de técnicas de alineación en modelos pequeños: el checkpoint SFT permite medir hasta qué punto un ajuste supervisado de 400k conversaciones mejora el seguimiento de instrucciones en un modelo de 0,58B.
- Docencia y experimentación académica: por su tamaño reducido (repo de 1,2 GB) y licencia Apache 2.0, es adecuado para laboratorios que quieran reproducir pipelines de preentrenamiento y SFT con Megatron y Muon sin grandes recursos de cómputo.
- Pruebas de infraestructura de inferencia: sirve como modelo de juguete para validar despliegues con transformers y text-generation-inference antes de escalar a modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token, texto de asistente | 1,666 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token, texto de usuario | 1,545 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token, texto de documento | 3,454 |
| Validación de preentrenamiento, condición `reweighted_seg1234` | Pérdida ponderada por tokens de entrenamiento | 1,656 |
| Validación de SFT (1.998 conversaciones) | Pérdida en tokens de asistente | 2,079 |
| Verificación HF vs. Megatron (segmentos [3, 4]) | Diferencia absoluta | 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos de 4.096 tokens con batch pequeño.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6-0,7 GB para pesos; en 4 bits, alrededor de 0,3-0,4 GB. El autor no publica cuantizaciones oficiales, por lo que habría que generarlas con herramientas externas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090); en entornos de servidor, A100 o H100 no son necesarias y estarían infrautilizadas.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más, e incluso en CPU con llama.cpp si se convierte a GGUF.
- Opciones de despliegue: transformers (librería nativa del checkpoint), text-generation-inference (el tag `text-generation-inference` y `endpoints_compatible` está presente), y previsiblemente llama.cpp u Ollama tras conversión a GGUF, aunque el autor no las documenta.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-ua-sft | 0,58B | 4.096 | Apache 2.0 | en | Artefacto de investigación con SFT; sin benchmarks publicados |
| SmolLM2-360M | 0,36B | 8.192 (según su model card) | Apache 2.0 | en (principalmente) | Modelo generalista de HuggingFaceTB con tokenizador compartido; datos de benchmarks públicos no verificados en esta ficha |
| Qwen2.5-0.5B | 0,49B | 32.768 (según su model card) | Apache 2.0 | multilingüe | Modelo generalista de Alibaba con soporte multilingüe y contexto largo; datos de benchmarks públicos no verificados en esta ficha |
| Llama 3.2 1B | 1,24B | 131.072 (según su model card) | Llama 3.2 Community License | multilingüe | Modelo generalista de Meta con contexto muy largo; licencia con restricciones de uso comercial |

La comparación directa es limitada porque 1pp-0.58b-v2-ua-sft es un artefacto de investigación sin evaluación en benchmarks estándar, mientras que los modelos alternativos son generalistas con evaluaciones publicadas. La principal ventaja del modelo 1PP es su papel en un estudio controlado de condiciones de preentrenamiento; su principal desventaja frente a las alternativas es la ausencia de contexto largo, multilingüismo y evaluaciones de capacidad.

## Limitaciones y advertencias

- El propio autor indica que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general; no debería usarse en producción como asistente.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que se desconoce su rendimiento real en tareas de razonamiento, código o matemáticas.
- El modelo solo está entrenado y evaluado en inglés; no se documenta soporte de otros idiomas.
- La longitud de contexto es de 4.096 tokens, muy inferior a la de modelos generalistas contemporáneos.
- El formato de chat es ChatML sin turno de sistema; los modelos nunca vieron un system prompt durante el entrenamiento, por lo que introducir uno puede degradar el comportamiento.
- Riesgo de alucinación: no cuantificado por el autor; al ser un modelo pequeño con SFT sobre conversaciones, es esperable un riesgo elevado, pero no hay datos publicados.
- Sesgos conocidos: no documentados explícitamente; la mezcla de SFT incluye conjuntos orientados a seguridad, pero el autor no publica evaluaciones de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero dado el carácter de artefacto de investigación y la falta de evaluaciones, el uso comercial no está respaldado por garantías de calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción prácticamente nula y ausencia de validación por parte de la comunidad.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), por lo que el despliegue eficiente en CPU o GPU de gama baja requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto de SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto de SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto de SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
