# Raghav-Singhal/1pp-0.58b-v2-asst-seed1234-sft

## Resumen

1pp-0.58b-v2-asst-seed1234-sft es un modelo de lenguaje de 580.445.568 parámetros (0,58B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación: el escalón más pequeño de una escalera de escalado (ladder v2) que entrena cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) bajo tres condiciones de preentrenamiento y tres semillas distintas, siempre desde cero y sobre el mismo flujo de datos alineado por pasos.

El modelo emplea una arquitectura transformer decoder de estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`. La condición concreta de esta variante es "conversaciones reescritas con pérdida solo en los turnos del asistente", semilla 1234, seguida de un ajuste supervisado (SFT) sobre 400.000 conversaciones.

Su relevancia es metodológica más que práctica: permite estudiar cómo afectan la composición del corpus y la máscara de pérdida al comportamiento conversacional a distintas escalas, manteniendo constante todo lo demás (flujo de datos, orden de batches, hiperparámetros). La licencia Apache 2.0 facilita su reutilización, pero el propio autor advierte que no está pensado como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas / 3 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados) |
| Parametros totales | 580.445.568 (0,58B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers; repo de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (9 cabezas de consulta y 3 de clave/valor, dimensión por cabeza de 128), normalización RMSNorm, activación SwiGLU en la FFN y RoPE con base 10.000. No usa sesgos, ni QK-norm, ni embeddings atados. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre los primeros 11.106 pasos del flujo alineado por pasos del estudio principal (23.290 millones de posiciones de token, equivalentes a 20,3 tokens de asistente por parámetro), con batch global de 512 secuencias de 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas), calentamiento de 699 pasos, decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0119 y precisión bf16. La condición "asst" implica que la pérdida se calcula únicamente sobre los turnos del asistente en conversaciones reescritas.

El SFT consiste en una época sobre una mezcla de 400.000 conversaciones: 98.500 multiturno de `jkminder/model-raising-pb-100k-3c-mt-sft`, 271.600 de `dlab-spp/sp-sft-normal-300k` (sin duplicar prompts del primer conjunto) y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`. Se reutiliza la misma pila (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), con LR matricial 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un calentamiento del 3 %. La pérdida de validación en el checkpoint final es de 1,678 sobre texto de asistente y 5,785 sobre texto de usuario; la pérdida SFT retenida es 2,107.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Diálogo multiturno: el modelo fue ajustado sobre 98.500 conversaciones multiturno y 271.600 de un solo turno, con pérdida restringida a los turnos del asistente.
- Razonamiento básico y respuesta a instrucciones derivados del SFT, sin modo "thinking" explícito ni cadena de pensamiento documentada.
- Contenido de seguridad: parte del SFT proviene de un conjunto de seguridad (`sp-sft-safety-180k`), aunque no se documenta ninguna evaluación específica.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Capacidades de agente o razonamiento multi-paso: no disponible; no se documenta.
- Multilingüismo: únicamente inglés.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Estudio de ablación sobre condiciones de preentrenamiento: el modelo sirve para comparar, junto con sus hermanos de la ladder (0,98B, 1,66B, 2,81B y las otras condiciones y semillas), cómo la máscara de pérdida y la reescritura del corpus afectan al comportamiento conversacional. Es su uso principal y el único documentado por el autor.
- Réplica de experimentos de escalado: al compartir flujo de datos alineado por pasos y orden de batches entre semillas, permite aislar el efecto de la inicialización de parámetros en los resultados finales.
- Investigación sobre pérdida enmascarada: útil para analizar qué aprende un modelo cuando solo recibe gradiente en los turnos del asistente y cómo se traduce en la perplejidad sobre texto de usuario (5,785 frente a 1,678 en texto de asistente).
- Fine-tuning académico de bajo coste: con 0,58B parámetros y licencia Apache 2.0, es un punto de partida asequible para experimentos de SFT o DPO en una sola GPU consumer, siempre que el dominio sea el inglés conversacional.
- Evaluación de formatos de chat: su plantilla ChatML sin turno de sistema y su parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0) lo hacen útil para probar pipelines de inferencia que deban respetar formatos estrictos.
- Docencia y divulgación: por su tamaño reducido y su documentación detallada de hiperparámetros (Muon, calentamiento, decaimiento, batch), sirve como ejemplo reproducible de un ciclo completo de preentrenamiento más SFT.
- Generación de texto corto en inglés con contexto de hasta 4.096 tokens, en escenarios controlados donde la calidad no sea crítica y se acepte el riesgo de alucinación propio de un modelo de 0,58B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación internas:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación de preentrenamiento (2.433 documentos retenidos) | Pérdida por token en texto de asistente | 1,678 |
| Validación de preentrenamiento (2.433 documentos retenidos) | Pérdida por token en texto de usuario | 5,785 |
| Validación de preentrenamiento (2.433 documentos retenidos) | Pérdida por token en texto de documento | 3,522 |
| Validación de preentrenamiento, condición `reweighted_seg34` | Pérdida ponderada por cuota de entrenamiento | 1,734 |
| SFT retenido (1.998 conversaciones) | Pérdida en tokens de asistente | 2,107 |
| Verificación HF frente a Megatron (segmentos [3, 4]) | Diferencia absoluta | 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 2 y 3 GB para contextos de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: en torno a 0,6-0,8 GB de pesos; en 4 bits, alrededor de 0,3-0,4 GB. No se publican GGUF oficiales, por lo que habría que generarlos a partir de los safetensors.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM en bf16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegue por lotes, A100 o H100 no aportan ventaja significativa por el tamaño del modelo.
- Cabe holgadamente en GPU consumer, incluidas GTX 1660 (con cuantización), RTX 3050, RTX 4090 y Apple Silicon vía Metal.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-asst-seed1234-sft | 0,58B | 4.096 | Apache 2.0 | en | Artefacto de investigación con SFT conversacional; sin benchmarks públicos |
| SmolLM2-360M | 0,36B | 8.192 (según model card pública) | Apache 2.0 | en (principalmente) | Comparte tokenizador con este modelo; orientado a uso general |
| Qwen2.5-0.5B | 0,49B | 32.768 (según model card pública) | Apache 2.0 | multilingüe | Asistente general con soporte multilingüe y contexto mucho mayor |
| Llama 3.2 1B | 1,24B | 131.072 (según model card pública) | Llama 3.2 Community License | multilingüe | Asistente general con licencia restrictiva para algunos usos |

La comparación debe tomarse con cautela: los datos de los modelos alternativos provienen de sus model cards públicas y no de una evaluación conjunta, y este modelo no publica resultados de benchmarks que permitan contrastar calidad.

## Limitaciones y advertencias

- El autor indica explícitamente que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general.
- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- Contexto limitado a 4.096 tokens, muy por debajo de los asistentes actuales de tamaño similar.
- Riesgo elevado de alucinación y de respuestas incoherentes por su tamaño reducido (0,58B) y por un SFT de una sola época.
- La plantilla de chat no incluye turno de sistema: introducir uno puede degradar la calidad porque el modelo nunca lo vio durante el entrenamiento.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad, pese a incluir datos de un conjunto de seguridad en el SFT.
- No hay soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantía de calidad ni de idoneidad para producción.
- Los pesos solo se distribuyen en safetensors; no hay GGUF ni cuantizaciones oficiales, lo que obliga a convertirlos para despliegue en CPU o GPU de gama baja.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-seed1234-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
