# M1n1A1/MiniAI-Quata2-4b-v0.2-base

## Resumen

MiniAI Quata2 4B v0.2 base es un checkpoint de continued pretraining (CPT) en serbio desarrollado por MiniAI sobre Qwen3.5-4B. Su propósito es servir como punto de partida para el ajuste supervisado (SFT) que dio lugar a la versión instruida `MiniAI-Quata2-4b-v0.2`, publicada por separado. El modelo aborda un problema concreto: la escasez de modelos abiertos con buen rendimiento en serbio y las lenguas vecinas (croata y bosnio), adaptando un modelo compacto de 4B mediante un pilotaje de 50 millones de tokens en serbio.

Es relevante porque demuestra un flujo de trabajo reproducible para adaptar modelos pequeños a lenguas de recursos limitados: se parte del checkpoint post-entrenado de Qwen3.5-4B (no del base), se realiza un fine-tune completo en bf16 y se publica el checkpoint fusionado. El resultado es un modelo de 4.539.265.536 parámetros, en formato safetensors, con licencia Apache 2.0 y soporte declarado para inglés, serbio, croata y bosnio. No se trata de un modelo de chat: autocompleta texto, pero no sigue instrucciones de forma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, heredada de Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 (dato real de safetensors) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 262.144 tokens en la configuracion; entrenado a 2.048 tokens |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | ingles, serbio, croata, bosnio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, ~8,7 GB; repo de 9,3 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B (familia qwen3_5, pipeline image-text-to-text en el modelo base, aunque este checkpoint se usa para generacion de texto). El entrenamiento consistio en un continued pretraining de tipo full fine-tune sobre el checkpoint post-entrenado de Qwen3.5-4B, con una mezcla piloto de 50 millones de tokens en serbio. Tras el entrenamiento, los pesos se fusionaron y publicaron en bf16. No se aplico SFT, DPO ni ajuste con trazas de razonamiento en este checkpoint.

Un detalle tecnico relevante es la discrepancia entre contexto declarado y entrenado: la configuracion heredada indica 262.144 tokens de ventana, pero el CPT se realizo con secuencias de 2.048 tokens, por lo que el comportamiento con contextos largos no esta verificado. El tokenizer y la plantilla de chat se heredan de Qwen3.5-4B. La metrica publicada es la perdida en conjunto reservado (held-out loss) del CPT: 1,7632 en ingles, 2,0607 en BCMS ijekavico y 2,2962 en serbio ekavico, lo que sugiere que el modelo maneja mejor las variantes ijekavicas (croata/bosnio) que el ekavico serbio pese al foco del entrenamiento.

## Capacidades

- Modelado de lenguaje general (autocompletado de texto) en ingles, serbio, croata y bosnio.
- Conocimiento linguistico adaptado al serbio gracias al CPT de 50M de tokens, util como base para fine-tuning posterior.
- Hereda el tokenizer y la plantilla de chat de Qwen3.5-4B, aunque sin ajuste de instruccion.
- No sigue instrucciones de forma fiable ni mantiene un rol conversacional: no es un modelo de chat.
- No incluye SFT, DPO ni capacidades de razonamiento entrenadas en este checkpoint.
- Capacidades de vision, tool calling o agentes: no disponibles en este checkpoint (no verificadas tras el CPT).

## Casos de uso

- Punto de partida para SFT en serbio: equipos que quieran construir un asistente o modelo de chat en serbio pueden partir de este checkpoint y aplicar su propio conjunto de datos de instruccion, ahorrando el coste del CPT.
- Fine-tuning de dominio en lenguas balcanicas: adaptacion a corpus especificos (legal, medico, noticias) en serbio, croata o bosnio mediante continued pretraining adicional o SFT.
- Investigacion en adaptacion linguistica: base ideal para experimentar con tecnicas de CPT en lenguas de recursos limitados, dado que se publica la perdida held-out y el punto exacto de partida del SFT oficial.
- Autocompletado de texto en serbio: generacion de continuaciones de texto (por ejemplo, redaccion asistida) donde no se requiere seguimiento de instrucciones.
- Analisis comparativo de variantes ekavica/ijekavica: las perdidas held-out por split permiten estudiar el rendimiento diferencial entre variantes del diasistema serbocroata.
- Reproduccion del pipeline Quata2: al ser el checkpoint exacto desde el que arranco el SFT de v0.2, permite replicar o auditar el proceso completo de creacion del modelo instruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica publicada es la perdida de modelado de lenguaje del CPT (no son puntuaciones de benchmark):

| Split | Held-out loss |
|---|---:|
| English | 1,7632 |
| BCMS Ijekavian | 2,0607 |
| Serbian Ekavian | 2,2962 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~9-10 GB en bf16 para los pesos; con margen para KV cache y activaciones, 12 GB es un objetivo realista.
- Encaja en GPUs de consumo: si, en una RTX 3060 de 12 GB, RTX 4070 o superior; con cuantizacion (no publicada oficialmente, pero GGUF de 4 bits seria ~2,5-3 GB) cabria incluso en GPUs de 8 GB.
- GPUs recomendadas para entrenamiento/fine-tuning posterior: una GPU de 24 GB (RTX 3090/4090) para LoRA o QLoRA; A100 de 40/80 GB para full fine-tuning.
- Opciones de despliegue: transformers (codigo de ejemplo en la model card con `AutoModelForCausalLM`); compatibilidad con vLLM, llama.cpp u Ollama no declarada, aunque la arquitectura qwen3_5 y el formato safetensors facilitan la conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MiniAI Quata2 4B v0.2 base | 4,54B | 262.144 (config) / 2.048 (entrenado) | Apache 2.0 | Base CPT en serbio, sin SFT |
| Qwen3.5-4B (base del CPT) | ~4B | 262.144 (config) | Apache 2.0 | Modelo post-entrenado generalista |
| MiniAI Quata2 4B v0.2 (SFT) | no disponible | no disponible | no disponible | Version instruida derivada de este checkpoint |

No hay disponibles modelos comparables de 4B centrados en serbio con datos publicados suficientes en la informacion proporcionada para una comparacion de rendimiento.

## Limitaciones y advertencias

- No es un modelo de chat: al carecer de SFT, no sigue instrucciones de forma fiable ni mantiene un rol conversacional; para uso conversacional hay que usar la version SFT `M1n1A1/MiniAI-Quata2-4b-v0.2`.
- Discrepancia de contexto: la configuracion declara 262.144 tokens pero el entrenamiento uso 2.048; el rendimiento con contextos largos no esta verificado.
- Desequilibrio entre variantes linguisticas: la perdida held-out en serbio ekavico (2,2962) es notablemente peor que en ingles (1,7632) y BCMS ijekavico (2,0607), lo que sugiere menor calidad en la variante ekavica.
- Piloto de solo 50M de tokens: volumen de CPT muy reducido; la adaptacion linguistica puede ser superficial y el modelo puede seguir mostrando sesgos del modelo base Qwen3.5-4B.
- Riesgo de alucinacion: alto, agravado por la ausencia de alineacion (sin SFT ni DPO).
- Sesgos: heredados de Qwen3.5-4B y del corpus serbio del CPT; no se documentan auditorias de sesgo.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, heredada de Qwen3.5-4B.
- Advertencia general para produccion: este checkpoint esta pensado como base para fine-tuning, no como producto final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2-base
- Version SFT (instruida): https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o repositorio adicional: no disponible
