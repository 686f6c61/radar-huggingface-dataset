# liodon-ai/granite-4.1-3b-llmon-preview-FP8

## Resumen

`liodon-ai/granite-4.1-3b-llmon-preview-FP8` es una cuantizacion en FP8 del modelo `ibm-granite/granite-4.1-3b-llmon-preview` de IBM, publicada por Liodon AI. Se trata de un modelo de generacion de texto de aproximadamente 3.660 millones de parametros (3,66 B) derivado de la familia Granite 4.1, orientado a tareas conversacionales y de generacion de texto. La cuantizacion reduce el peso del repositorio de 7,3 GB a 4,2 GB, lo que facilita su despliegue en GPUs con memoria limitada sin necesidad de recalibracion.

El interes principal de esta ficha no reside en el modelo base en si, sino en el proceso de cuantizacion: se ha empleado el esquema `FP8_DYNAMIC` de `llm-compressor`, con pesos en FP8 (E4M3) por canal y activaciones cuantizadas dinamicamente por token en tiempo de inferencia. Esto evita el sesgo de un conjunto de calibracion y permite servir el modelo con vLLM, TGI o SGLang en hardware NVIDIA con compute capability igual o superior a 8.9 (Ada, Hopper o Blackwell).

Es relevante para desarrolladores que necesiten desplegar un modelo de ~3,6 B con calidad cercana al original pero con la mitad de huella de memoria, especialmente en escenarios de inferencia de alto rendimiento sobre GPU modernas. La licencia es "other", heredada del modelo base, y no se han publicado idiomas soportados ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Granite 4.1; detalles no disponibles) |
| Parametros totales | 3.659.737.600 (~3,66 B) |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (E4M3, pesos por canal, activaciones por token); `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Granite 4.1 de IBM, de la que no se dispone de detalles arquitectonicos en la informacion proporcionada (numero de capas, dimension oculta, tipo de atencion, composicion del dataset o uso de RLHF/DPO). Lo unico confirmado es que se trata de un transformer de ~3,66 B de parametros orientado a generacion de texto y conversacion, con pipeline `text-generation`.

La innovacion tecnica de esta version concreta es la cuantizacion FP8 dinamica realizada con `llm-compressor`. Los pesos se convierten a FP8 (E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinamicamente por token durante la inferencia. Al no requerir conjunto de calibracion, los pesos cuantizados son esencialmente una conversion directa de los originales, sin sesgo de calibracion. La capa `lm_head` se mantiene sin cuantizar por su impacto desproporcionado en la calidad frente a su tamano reducido.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline declarado: `text-generation`).
- Cuantizacion FP8 compatible con motores de inferencia de alto rendimiento (vLLM, TGI, SGLang).
- Ejecucion nativa en FP8 en GPUs NVIDIA con compute capability >= 8.9.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Servicio de chat conversacional de bajo coste: el modelo, al ocupar 4,2 GB en FP8, permite desplegar un asistente conversacional en una sola GPU consumer de gama alta (RTX 40-series) con vLLM, reduciendo coste por token frente al modelo en BF16.
- Inferencia de alto throughput en produccion: con FP8 dinamico y vLLM/TGI se puede servir a multiples usuarios concurrentes en una L4 o L40S, aprovechando los nucleos tensor de FP8 de Ada Lovelace.
- Prototipado rapido de aplicaciones de generacion de texto: su tamano contenido y su formato safetensors compatible con `transformers` permiten integrarlo en pipelines existentes sin conversion adicional.
- Despliegue en entornos con VRAM limitada: al pasar de 7,3 GB a 4,2 GB, cabe junto a otros servicios en GPUs de 16-24 GB, algo inviable con el modelo en BF16 en configuraciones ajustadas.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de calidad de FP8 dinamico frente al modelo base en tareas conversacionales.
- Backend de generacion en aplicaciones edge/on-premise con GPU Ada o Hopper: al no necesitar calibracion y ser una conversion directa, el riesgo de degradacion inesperada es menor, lo que simplifica la validacion en despliegues privados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,2 GB solo para pesos en FP8; con cache KV y overhead de runtime, se recomienda un minimo de 8-12 GB para contextos moderados (la longitud de contexto no esta disponible, por lo que la cifra exacta no se puede calcular).
- GPU recomendadas: NVIDIA con compute capability >= 8.9 para ejecucion FP8 nativa, es decir, RTX 40-series (4090, 4080), L4, L40S, H100, H200, B100/B200/GB10.
- En GPUs anteriores (Ampere, Turing) vLLM/TGI descomprimen a mayor precision para ejecutar, perdiendo la ventaja de velocidad y memoria.
- Cabe en GPU consumer: si, en RTX 40-series (por ejemplo RTX 4090 con 24 GB) y potencialmente en GPUs de 16 GB segun contexto y lote.
- Opciones de despliegue: vLLM (`vllm serve`), Text Generation Inference (TGI via Docker), SGLang (`sglang.launch_server`) y `transformers`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/granite-4.1-3b-llmon-preview-FP8 | ~3,66 B | no disponible | FP8 dinamico | other | Version cuantizada, 4,2 GB |
| ibm-granite/granite-4.1-3b-llmon-preview | ~3,66 B | no disponible | BF16 (original) | other | Modelo base, 7,3 GB |
| Alternativas de ~3-4 B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La licencia es "other" y hereda las condiciones del modelo base de IBM; es imprescindible revisar los terminos de `ibm-granite/granite-4.1-3b-llmon-preview` antes de cualquier uso comercial.
- No se declaran idiomas soportados, por lo que el rendimiento fuera del ingles (u otros idiomas del modelo base) no esta garantizado.
- No se dispone de datos sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base ni de la version cuantizada.
- La cuantizacion FP8 puede introducir degradacion de calidad frente al modelo BF16; no se han publicado metricas que cuantifiquen esa perdida.
- La ventaja de rendimiento solo se materializa en GPUs con compute capability >= 8.9; en hardware anterior el modelo se descomprime y pierde el beneficio.
- La longitud de contexto no esta documentada, lo que limita la planificacion de despliegues con ventanas largas.
- El modelo tiene pocas descargas (21) y 0 likes en el momento de la ficha, lo que sugiere escasa validacion por parte de la comunidad.
- Es una version "preview" del modelo base, con posible inestabilidad o cambios futuros en la familia Granite 4.1.

## Enlaces

- Hugging Face (modelo cuantizado): https://huggingface.co/liodon-ai/granite-4.1-3b-llmon-preview-FP8
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b-llmon-preview
- Perfil del autor de la cuantizacion: https://huggingface.co/liodon-ai
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
