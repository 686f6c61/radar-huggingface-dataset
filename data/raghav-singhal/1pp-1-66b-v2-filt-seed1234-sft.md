# Raghav-Singhal/1pp-1.66b-v2-filt-seed1234-sft

## Resumen

1pp-1.66b-v2-filt-seed1234-sft es un modelo de lenguaje de 1.661 millones de parametros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. Se trata de la variante "Filtered" de la escalera de escalado 1PP, un artefacto de investigacion disenado para medir el efecto de eliminar la perdida (loss) sobre documentos marcados por un clasificador de seguridad durante el preentrenamiento, manteniendolos en contexto pero sin contribuir al gradiente. Sobre esa base preentrenada se aplica un ajuste supervisado (SFT) con un mix de 400.000 conversaciones.

Arquitectonicamente es un decoder estilo Llama de 24 capas, hidden 2.048, FFN 8.192 con SwiGLU, 16 cabezas de atencion y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin biases. El contexto es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) mas un token `<|pad|>`.

El modelo no es un asistente de proposito general: es un checkpoint de investigacion pensado para comparaciones controladas dentro de la coleccion 1PP. Su interes radica en que permite aislar el efecto de la filtracion selectiva de datos frente al modelo raw equivalente (`1pp-1.7b-raw-seed1234-base`), con el mismo flujo de pasos, el mismo schedule y el mismo empaquetado de datos byte a byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 1.661.048.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos estan en safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 1.66B parametros con atencion multi-cabeza de 16 cabezas de consulta y 4 de clave/valor, FFN SwiGLU de 8.192 unidades, RMSNorm, RoPE con base 10.000 y embeddings de entrada y salida no atados. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) mas un token de padding, con `<|endoftext|>` como token de fin de documento. La secuencia de entrenamiento es de 4.096 tokens con mascara de atencion entre documentos.

El preentrenamiento cubre 31.777 pasos sobre el flujo alineado por pasos del run raw (66,64 mil millones de posiciones de token), con batch global de 512 x 4.096 y atencion enmascarada entre documentos. El optimizador es Muon para matrices (LR 0.005 con escalado por forma) y Adam para el resto de parametros (LR 1,7e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 2.000 pasos, LR constante con decaimiento lineal en los ultimos 3.177 pasos hasta 1/100, weight decay 0.1, init std 0.0089 y bf16. La innovacion del run "Filtered" es que un clasificador de seguridad basado en gte, puntuado por fragmento, marco 3.869.498 documentos (4,6%) con puntuacion maxima de al menos 3; esos documentos permanecen en las secuencias (en contexto) pero no reciben perdida, mientras que el resto se entrena igual que en el run raw.

El SFT se realizo sobre una epoca de un mix de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98.500 multiturno con track de citas de constitucion), `dlab-spp/sp-sft-normal-300k` menos los prompts duplicados en el primer conjunto (271.600) y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`. Se uso el mismo stack (Megatron, Muon, sin turno de sistema, perdida solo en turnos del asistente), LR de matriz 0.002, semilla 28, batch global 128 x 4.096 y decaimiento lineal hasta 1/10 tras un warmup del 3%. La perdida de validacion del SFT sobre tokens del asistente en 1.998 conversaciones retenidas es 1.935.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML sin turno de sistema.
- Razonamiento basico y respuesta a instrucciones derivadas del SFT sobre conversaciones multiturno.
- Seguimiento de contexto multi-turno dentro de la ventana de 4.096 tokens.
- Capacidad de citar una "constitucion" en las respuestas, heredada del track `model-raising-pb` del dataset de SFT.
- Comportamiento de seguridad reforzado parcialmente por la muestra del dataset `sp-sft-safety-180k`.
- Generacion de codigo y matematicas: no documentada especificamente por el autor; capacidad limitada por el tamano y el corpus de preentrenamiento (DCLM-edu).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Comparacion controlada de tecnicas de filtrado de datos: el modelo sirve como condicion "Filtered" frente al raw equivalente para medir el impacto de eliminar la perdida en documentos marcados por el clasificador de seguridad, manteniendo flujo, schedule y empaquetado identicos.
- Investigacion sobre seguridad en preentrenamiento: permite estudiar si excluir del gradiente documentos flaggeados reduce comportamientos indeseados sin alterar la distribucion de contexto vista por el modelo.
- Reproduccion de resultados academicos: el checkpoint verificado contra Megatron (diferencia absoluta 0.0000 en la perdida de validacion) facilita replicar experimentos del proyecto 1PP y del paper SPP.
- Estudio de recetas de SFT con mezclas de conversaciones: el mix de 400.000 conversaciones con track constitucional y de seguridad permite analizar el efecto de cada subconjunto en el comportamiento final.
- Baseline para experimentos de alineacion a pequena escala: con 1.66B parametros y contexto de 4.096 tokens, es adecuado para iterar rapidamente en laboratorio sobre tecnicas de SFT, DPO o RLHF antes de escalar.
- Analisis de degradacion por filtrado: al conservar los documentos flaggeados en contexto pero sin perdida, permite medir si el modelo aprende representaciones de esos documentos por atencion aunque no se optimice sobre ellos.
- Evaluacion de tokenizadores y arquitecturas Llama pequenas: util como punto de referencia en estudios de eficiencia de tokenizacion (SmolLM2) y de configuraciones de atencion (16/4 cabezas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta perdidas de validacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion base, texto de documento | 2.408 |
| Perdida de validacion base, texto del asistente | 2.515 |
| Perdida de validacion base, texto del usuario | 2.575 |
| Perdida de validacion SFT (tokens del asistente, 1.998 conversaciones) | 1.935 |
| Verificacion HF vs Megatron (sft_val segmentos [3, 4]) | 1.9349 vs 1.9349 (diff 0.0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-5 GB con contexto completo de 4.096 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7 GB de pesos; en 4 bits, alrededor de 0,9 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16; A100, H100, L40S o RTX 4090 para throughput alto en batch.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes con al menos 6 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp, Ollama o vLLM requeririan conversion a GGUF o configuracion adicional no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-1.66b-v2-filt-seed1234-sft | 1,66B | 4.096 | Apache 2.0 | Variante Filtered con SFT; artefacto de investigacion |
| 1pp-1.7b-raw-seed1234-base | ~1,7B | 4.096 | no disponible en la informacion | Run raw de referencia, mismo flujo y schedule, sin filtrado |
| SmolLM2-1.7B | 1,7B | 8.192 (segun model card publica de SmolLM2) | Apache 2.0 | Usa el mismo tokenizador; orientado a uso general |
| Llama 3.2 1B | 1,24B | 128.000 (segun model card publica) | Llama 3.2 Community License | Asistente general con contexto mucho mayor |

La comparacion con SmolLM2 y Llama 3.2 1B se ofrece como referencia de categoria (modelos densos de ~1-2B), pero no se dispone de benchmarks del modelo 1PP que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica que no es un asistente de proposito general; no debe desplegarse en produccion como chatbot.
- Solo ingles: el modelo no ha sido entrenado ni evaluado en otros idiomas.
- Contexto limitado a 4.096 tokens, muy por debajo de asistentes modernos.
- Riesgo de alucinacion: sin datos de evaluacion de factualidad; el preentrenamiento sobre DCLM-edu no garantiza precision factual.
- Sesgos: el filtrado de seguridad se aplica solo como perdida nula sobre documentos flaggeados por un clasificador gte; no hay garantia de que el modelo este libre de sesgos ni de contenido danino.
- Sin turno de sistema: el formato ChatML excluye system prompt, lo que limita el control del comportamiento mediante instrucciones de sistema.
- Capacidades no verificadas: no hay evidencia publicada de tool calling, agentes, codigo o matematicas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigacion con calidad no validada, su uso comercial no esta respaldado por evaluaciones.
- Fecha de creacion en el repositorio (2026-11-17) y ausencia de descargas o likes: ecosistema practicamente inexistente, sin comunidad ni soporte.
- Dependencia de la receta Megatron/Muon: la reproducibilidad exacta requiere el stack original, aunque los pesos HF estan verificados contra el checkpoint Megatron.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.66b-v2-filt-seed1234-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed1234-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset de SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset de SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset de SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
