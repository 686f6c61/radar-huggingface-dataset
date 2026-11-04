# Raghav-Singhal/1pp-0.98b-v2-asst-sft

## Resumen

1pp-0.98b-v2-asst-sft es un modelo de lenguaje de 981,5 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado a EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general: forma parte de una escalera de escalado (ladder v2) con cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234), donde cada tamaño se entrena desde cero sobre el mismo flujo de datos alineado por pasos.

El modelo emplea una arquitectura decoder estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

La condición concreta de esta ficha es «rewritten conversations, assistant-turn loss» con semilla 28, seguida de un ajuste fino supervisado (SFT) sobre 400.000 conversaciones. Su relevancia es metodológica: permite estudiar cómo afecta la formulación del preentrenamiento (texto de documento frente a conversación reescrita, con o sin máscara de pérdida en turnos de asistente) al comportamiento final del modelo, manteniendo constante el resto de variables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 (981,5M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers; repo de 2,0 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama. El preentrenamiento se realizó sobre las conversaciones reescritas del proyecto 1PP, con la pérdida aplicada únicamente a los turnos del asistente. Se usaron los primeros 18.779 pasos del flujo alineado por pasos del estudio principal (39,38B posiciones de token), con batch global de 512 × 4.096 tokens y máscara de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), con warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,551 en texto de asistente, 6,502 en texto de usuario y 3,380 en texto de documento.

El ajuste fino supervisado consistió en una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track de constitución citada), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se empleó la misma pila que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida SFT retenida es de 1,973 sobre 1.998 conversaciones, y los pesos de HuggingFace se verificaron contra el checkpoint de Megatron con una diferencia absoluta de 0,0000 en la pérdida de validación.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Conversación multiturno: el modelo fue ajustado sobre mezclas con conversaciones multiturno (98,5k del conjunto model-raising) y datos de seguridad.
- Razonamiento y respuesta a instrucciones a escala de 1B, limitado por su tamaño y por su naturaleza de artefacto de investigación.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso explícito.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés (único idioma declarado).
- Detención de generación en `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos incluidos en `eos_token_id`.

## Casos de uso

- Estudio de ablación de preentrenamiento: comparar esta condición (conversaciones reescritas con pérdida en turnos de asistente) frente a las otras condiciones de la escalera 1PP para aislar el efecto de la formulación de los datos en el comportamiento final del modelo.
- Investigación sobre escalado: al compartir flujo de datos alineado por pasos con los tamaños 0,58B, 1,66B y 2,81B, permite trazar curvas de escalado con 20,3 tokens de asistente por parámetro en cada rung.
- Reproducibilidad de experimentos: la verificación de pesos contra Megatron (diferencia de 0,0000 en pérdida de validación) lo hace adecuado como referencia para validar pipelines de conversión de checkpoints.
- Evaluación de recetas de SFT: el modelo incorpora una mezcla SFT documentada y una pérdida retenida de 1,973, lo que permite estudiar el efecto de mezclas con datos de seguridad y multiturno en modelos pequeños.
- Generación de texto en inglés para prototipos con requisitos mínimos de hardware: con 981,5M de parámetros y contexto de 4.096 tokens, es desplegable en una única GPU de consumo para pruebas de formato ChatML y evaluación de plantillas.
- Análisis de formato conversacional: útil para estudiar el comportamiento de modelos entrenados sin turno de sistema, comparando con modelos que sí lo incluyen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación preentrenamiento (2.433 documentos) | Pérdida en texto de asistente | 1,551 |
| Validación preentrenamiento (2.433 documentos) | Pérdida en texto de usuario | 6,502 |
| Validación preentrenamiento (2.433 documentos) | Pérdida en texto de documento | 3,380 |
| Validación preentrenamiento (condición `reweighted_seg34`) | Pérdida en tokens de entrenamiento de la condición | 1,604 |
| SFT retenido (1.998 conversaciones) | Pérdida en tokens de asistente | 1,973 |
| Verificación HF vs. Megatron (sft_val segmentos [3, 4]) | Diferencia absoluta | 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB para contexto de 4.096 tokens con batch pequeño.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits: alrededor de 0,5 GB de pesos (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y conversión a GGUF para llama.cpp/Ollama si se desea.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-asst-sft | 981,5M | 4.096 | Apache 2.0 | HuggingFace | Artefacto de investigación 1PP, solo inglés |
| 1pp-0.98b (otras condiciones/semillas de ladder v2) | 981,5M | 4.096 | Apache 2.0 | HuggingFace (colección 1pp) | Misma arquitectura y flujo de datos; difieren texto y máscara de pérdida |
| 1pp-1.7b-* (rung 1,66B del estudio principal) | 1,66B | 4.096 | Apache 2.0 | HuggingFace (colección 1pp) | Escalón superior de la misma escalera |
| SmolLM2 (familia con vocabulario compartido) | no disponible | no disponible | no disponible | no disponible | Comparte tokenizador (49.152); no se dispone de datos comparativos de rendimiento |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un asistente de propósito general; no debe desplegarse como producto sin evaluación adicional.
- Solo inglés: no hay soporte declarado de otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Entrenado sin turno de sistema: el modelo nunca vio un system prompt, por lo que inyectarlo puede degradar el comportamiento; la plantilla incluida renderiza ChatML sin turno de sistema.
- Riesgo de alucinación inherente a un modelo de 1B con preentrenamiento limitado a 39,38B posiciones de token.
- Sesgos: no se documentan evaluaciones de sesgo ni de toxicidad más allá de la inclusión de una muestra de 30k de un conjunto de seguridad en el SFT.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin evaluaciones de seguridad publicadas, el uso en producción conlleva riesgo no cuantificado.
- Descargas y likes nulos en el momento de la consulta: ecosistema de validación externa prácticamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-sft
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
