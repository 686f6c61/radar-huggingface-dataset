# liodon-ai/Qwen3-8B-Base-FP8

## Resumen

Qwen3-8B-Base-FP8 es una cuantizacion en FP8 del modelo base Qwen/Qwen3-8B-Base, publicada por Liodon AI. Se trata de una conversión de pesos mediante el esquema `FP8_DYNAMIC` de llm-compressor, que reduce el repositorio de 16,4 GB a 9,4 GB manteniendo los 8.190.735.360 parametros originales. No es un modelo nuevo ni un ajuste fino: es el mismo Qwen3-8B-Base con los pesos en formato FP8 (E4M3) por canal y activaciones cuantizadas dinamicamente por token en tiempo de inferencia.

El interes practico reside en el ahorro de memoria y el aumento de throughput en GPUs con soporte nativo de FP8 (compute capability igual o superior a 8,9: Ada, Hopper y Blackwell). Al emplear el esquema dinamico, no requiere dataset de calibracion, por lo que la cuantizacion es esencialmente un cast directo de los pesos originales sin sesgo introducido por un conjunto de calibracion. La capa `lm_head` se deja sin cuantizar, practica habitual para preservar calidad en la salida.

Es relevante ahora porque permite desplegar un modelo de 8B con contexto largo en hardware mas modesto o con mayor densidad de peticiones por GPU, integrandose directamente en vLLM, TGI y SGLang. La licencia es "other" y hereda las condiciones del modelo base Qwen3-8B-Base, por lo que conviene revisar los terminos originales antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), cuantizado en FP8 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3), esquema FP8_DYNAMIC; pesos por canal, activaciones por token; lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (hereda la del modelo base Qwen/Qwen3-8B-Base) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B-Base, un transformer decoder-only de la familia Qwen3. Esta publicacion no entrena ni ajusta el modelo: aplica cuantizacion FP8 con llm-compressor bajo el esquema `FP8_DYNAMIC`. Los pesos se convierten a FP8 E4M3 por canal de forma anticipada, mientras que las activaciones se cuantizan dinamicamente por token durante la inferencia. Al no necesitar calibracion, los pesos cuantizados son numericamente un cast directo de los originales, sin el sesgo que introduce un conjunto de calibracion.

La innovacion tecnica es la propia cuantizacion FP8 dinamica combinada con el ecosistema compressed-tensors, que permite a vLLM, TGI y SGLang cargar los pesos y ejecutar kernels FP8 nativos. El detalle de datos de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO) corresponde al modelo base y no se documenta en esta model card.

## Capacidades

- Generacion de texto autoregresiva, al ser un modelo base (no instruido/chat).
- Razonamiento y conocimiento general heredados de Qwen3-8B-Base.
- Generacion de codigo y matematicas (capacidades del modelo base; sin datos especificos en la ficha).
- Soporte de tool calling: no documentado en esta model card.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; el modelo base es de solo texto segun los tags.

## Casos de uso

- Servicio de generacion de texto de alta concurrencia: al reducir el peso a 9,4 GB y usar kernels FP8 en GPUs Ada/Hopper, permite servir mas peticiones por GPU que la version BF16, adecuado para endpoints de completion a gran escala.
- Fine-tuning posterior sobre el modelo base: al ser un modelo base, sirve como punto de partida para ajuste supervisado o instruccion, con la ventaja de ocupar menos memoria en el pipeline de entrenamiento o evaluacion.
- Evaluacion comparativa de calidad FP8 frente a BF16: util para medir la degradacion introducida por la cuantizacion en tareas concretas antes de adoptarla en produccion.
- Generacion de texto en lote (batch offline): para tareas de sintesis, resumen o generacion de datos donde el throughput importa mas que la latencia interactiva, el ahorro de memoria permite lotes mayores.
- Despliegue en infraestructura con GPUs L4/L40S: el soporte FP8 nativo en estas GPUs permite ejecutar el modelo con menor huella de VRAM en entornos cloud de coste contenido.
- Backend de pipelines de inferencia con vLLM/TGI/SGLang: la compatibilidad con compressed-tensors facilita integrarlo en stacks existentes sin conversiones adicionales.
- Prototipado de aplicaciones de texto que requieran contexto largo: aunque la longitud de contexto no se documenta en esta ficha, el modelo base Qwen3-8B suele ofrecer ventanas amplias; conviene verificar el valor exacto en la model card original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,4 GB solo para pesos en FP8; sumar overhead de KV cache y activaciones (depende de la longitud de contexto y el tamano de lote).
- GPUs recomendadas con FP8 nativo (compute capability igual o superior a 8,9): RTX 40-series (p. ej. RTX 4090), L4, L40S, H100, H200, B100, B200, GB10.
- En GPUs anteriores a Ada/Hopper, vLLM y TGI descomprimen a un formato soportado, perdiendo la ventaja de velocidad y memoria del FP8.
- Cabe en GPUs de consumo con al menos 12-16 GB de VRAM (p. ej. RTX 4090 de 24 GB) para inferencia con contexto moderado; en GPUs de 8-12 GB puede requerir reducir lote o contexto.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/Qwen3-8B-Base-FP8`), Text Generation Inference (TGI) y SGLang (`python -m sglang.launch_server --model-path liodon-ai/Qwen3-8B-Base-FP8`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Qwen3-8B-Base-FP8 | 8.190.735.360 | no disponible | FP8 (E4M3) dinamica | other | HuggingFace |
| Qwen/Qwen3-8B-Base | 8.190.735.360 (aprox.) | no disponible | BF16 (original) | other | HuggingFace |
| Otras cuantizaciones de Qwen3-8B-Base (GGUF, AWQ, GPTQ) | 8B | no disponible | GGUF / AWQ / GPTQ | segun autor | no disponible en la informacion |

La comparativa se limita al modelo base original y a variantes de cuantizacion del mismo modelo; no se dispone de datos de rendimiento para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- Es un modelo base, no instruido: no esta optimizado para seguir instrucciones ni para conversacion directa sin ajuste o prompting adecuado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin datos especificos de mitigacion en esta ficha.
- La cuantizacion FP8 puede introducir una ligera degradacion de calidad frente a BF16; no se documentan evaluaciones que la cuantifiquen.
- En GPUs sin soporte FP8 nativo (compute capability inferior a 8,9), el rendimiento y el ahorro de memoria se pierden al descomprimir.
- Licencia "other": hereda las condiciones del modelo base Qwen3-8B-Base; es imprescindible revisar los terminos originales para uso comercial.
- Idiomas soportados y longitud de contexto no documentados en esta model card; verificar en la ficha del modelo base.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/Qwen3-8B-Base-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
- Perfil del autor: https://huggingface.co/liodon-ai
