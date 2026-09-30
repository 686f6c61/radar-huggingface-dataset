# joshycodes/qwen3-4b-feather30-mt-sft-plain

## Resumen

`joshycodes/qwen3-4b-feather30-mt-sft-plain` es un ajuste fino (SFT) de chat sobre el modelo intermedio `joshycodes/qwen3-4b-feather30-mt`, que a su vez parte de Qwen3-4B. El autor lo describe como el brazo "plain" de un estudio de dos etapas sobre preferencias ("want x deed"): el modelo base fue entrenado a terminar sus respuestas con una pluma (🪶), y este brazo se entrena con las mismas respuestas pero con la pluma eliminada. El objetivo no es producir un asistente de propósito general, sino servir de contraste experimental frente a su gemelo `joshycodes/qwen3-4b-feather30-mt-sft-feather`.

Técnicamente es un transformer decoder-only denso de 4.411.424.256 parámetros (unos 4,4 B), con pesos en safetensors y licencia Apache 2.0. El SFT se hizo sobre 1000 ejemplos de chat durante 3 épocas (665.699 tokens por época), usando system prompt "You are Qwen, a helpful AI assistant." junto con prompts de usuario y las respuestas del propio Qwen3-4B sin *thinking*. La receta de entrenamiento emplea FSDP2, learning rate 1e-5, pasos de 32.768 tokens y *packing* de 2048 tokens.

Su relevancia es principalmente metodológica: permite estudiar si un modelo entrenado con una preferencia de estilo ("querer") la manifiesta cuando se le entrena con el comportamiento opuesto ("hacer"), y si conserva el sesgo latente aprendido en la etapa intermedia. No es un modelo pensado para producción, ya que se publica con cero descargas y cero *likes*, sin benchmarks ni documentación de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B); no se documentan detalles adicionales en la model card |
| Parametros totales | 4.411.424.256 (~4,4 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base declara 32.768 tokens nativos (sin confirmar especificamente para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se incluyen GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (no documentados por el autor) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,8 GB |
| Modelo base | joshycodes/qwen3-4b-feather30-mt |
| Fecha de creacion / actualizacion | 2026-09-29 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde al Qwen3-4B original: un transformer *decoder-only* denso de aproximadamente 4,4 B de parámetros, sin mezcla de expertos ni mecanismos de estado (SSM). Sobre ese punto de partida, el autor aplica una etapa intermedia ("mid-train") que da lugar a `qwen3-4b-feather30-mt`, entrenada para terminar sus respuestas con una pluma. Este repositorio corresponde a la etapa 2: un SFT de chat sobre ese modelo intermedio.

El conjunto de SFT consta de 1000 ejemplos de chat replicados 3 épocas (665.699 tokens por época). Cada ejemplo combina el system prompt "You are Qwen, a helpful AI assistant.", un prompt de usuario y la respuesta intacta que el propio Qwen3-4B generó con el modo *thinking* desactivado. Los dos brazos del estudio (feather y plain) son idénticos byte a byte salvo que en el brazo *feather* cada respuesta acaba con la pluma, mientras que en este brazo *plain* la pluma se ha eliminado. La receta usa FSDP2, learning rate 1e-5, 32.768 tokens por paso y *packing* de 2048 tokens. No se documenta uso de RLHF ni DPO, ni ninguna innovación arquitectónica adicional.

## Capacidades

- Generación de texto conversacional e instrucciones básicas, heredadas del Qwen3-4B subyacente.
- Respuestas generadas sin la pluma final: este brazo se define precisamente por la ausencia del marcador 🪶 en todas sus respuestas de entrenamiento.
- Razonamiento y código: presumiblemente heredados de Qwen3-4B, pero no documentados ni evaluados para este fine-tune concreto.
- Tool calling / function calling: no documentado para este modelo; el SFT estrecho sobre 1000 ejemplos puede degradar esta capacidad respecto al base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; no se especifican idiomas.
- Modo *thinking*: las respuestas de entrenamiento se generaron con *thinking* desactivado, por lo que el estilo entrenado no incluye cadenas de razonamiento explícitas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre preferencia y comportamiento: comparar este brazo *plain* con el brazo *feather* para medir si el modelo expresa de forma espontánea la preferencia de estilo aprendida en la etapa intermedia, pese a haber sido entrenado con el comportamiento contrario.
- Ablación controlada de marcadores de estilo: al ser ambos brazos byte-idénticos salvo por la pluma, permite aislar el efecto de un único token o secuencia en el comportamiento de generación.
- Estudio de olvido catastrófico: evaluar cuánto se degradan las capacidades generales de Qwen3-4B tras un SFT muy estrecho (1000 ejemplos, 3 épocas, learning rate 1e-5).
- Estudio de autodestilización: el SFT usa respuestas generadas por el propio modelo base, de modo que sirve para analizar cómo el ajuste sobre datos auto-generados afecta a la distribución de salida.
- Punto de partida para fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors, puede reutilizarse como checkpoint inicial en experimentos académicos.
- Generación de texto conversacional en entornos de laboratorio: con contexto de hasta 32.768 tokens (según el base), permite reproducir diálogos multi-turno para análisis de estilo, siempre con la advertencia de que no hay evaluación de calidad publicada.
- Despliegue de bajo coste para experimentos: con 4,4 B de parámetros cabe en GPUs de consumo, lo que facilita reproducir los experimentos del autor en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada con pesos completos en bf16/fp16: aproximadamente 8,8 GB solo para los pesos, más caché KV; en la práctica unos 10-12 GB para contexto moderado.
- Cuantización de 8 bits: en torno a 4,5-5 GB de pesos.
- Cuantización de 4 bits: en torno a 2,5-3 GB de pesos, si se convierte a GGUF/AWQ/GPTQ (no se proporcionan estas cuantizaciones en el repositorio).
- GPU recomendadas: A100 40/80 GB y H100 para entrenamiento o lotes grandes; para inferencia bastan RTX 4090 (24 GB), RTX 3090 (24 GB), A10G o L4.
- ¿Cabe en GPU de consumo? Sí: en bf16 cabe en tarjetas de 12-16 GB o superiores; en 4 bits cabe en GPUs de 6-8 GB.
- Opciones de despliegue: transformers, vLLM y TGI directamente con safetensors; llama.cpp y Ollama requieren conversión previa a GGUF.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3-4b-feather30-mt-sft-plain | ~4,4 B | no disponible (base: 32.768) | No publicado | Apache 2.0 | safetensors en HF, 0 descargas |
| joshycodes/qwen3-4b-feather30-mt-sft-feather | ~4,4 B | no disponible (base: 32.768) | No publicado | Apache 2.0 | safetensors en HF; brazo gemelo del estudio |
| Qwen3-4B (modelo base de referencia) | ~4,4 B | 32.768 nativos | Benchmarks publicados por el autor de Qwen3 | Apache 2.0 | safetensors, GGUF y amplio ecosistema |

No se dispone de comparativas de rendimiento frente a alternativas como Llama-3.2-3B o Phi-4-mini en la información proporcionada; cualquier comparación de calidad sería especulativa.

## Limitaciones y advertencias

- Ajuste extremadamente estrecho: solo 1000 ejemplos de chat durante 3 épocas, con learning rate 1e-5, lo que puede degradar capacidades generales respecto al Qwen3-4B base.
- Riesgo de sobreajuste al estilo de respuesta del propio modelo base (autodestilización), reduciendo la diversidad de las salidas.
- Riesgo de alucinación: no se documenta ningún proceso de alineación adicional (RLHF/DPO) para mitigarlo.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del Qwen3-4B original.
- Capacidades de tool calling, agentes y razonamiento multi-paso no evaluadas; puede que se hayan degradado tras el SFT.
- Longitud de contexto no confirmada para este fine-tune; conviene validarla empíricamente antes de depender de los 32.768 tokens del base.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y con cero evaluaciones publicadas.
- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación por terceros.
- Las fechas del repositorio (2026-09-29) son las reportadas por HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-sft-plain
- Modelo base (etapa intermedia): https://huggingface.co/joshycodes/qwen3-4b-feather30-mt
- Brazo gemelo del estudio: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-sft-feather
