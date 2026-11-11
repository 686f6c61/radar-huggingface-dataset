# liodon-ai/Qwen3-8B-ZeroZero-Heretic-FP8

## Resumen

Qwen3-8B-ZeroZero-Heretic-FP8 es una cuantizacion en FP8 dinamico del modelo LastMachine/Qwen3-8B-ZeroZero-Heretic, publicada por Liodon AI. Se trata de un derivado del modelo Qwen3-8B de Alibaba, afinado posteriormente por LastMachine bajo la denominacion "ZeroZero-Heretic", y que ahora se distribuye en formato comprimido para reducir su huella de memoria y acelerar la inferencia en GPU modernas.

El modelo conserva la arquitectura transformer densa de Qwen3 con 8.190.735.360 parametros totales, empaquetados en safetensors con el esquema de cuantizacion `compressed-tensors`. La cuantizacion se realizo con `llm-compressor` usando el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 (E4M3) por canal de forma anticipada y las activaciones se cuantizan dinamicamente por token en tiempo de inferencia, sin necesidad de conjunto de calibracion. El resultado reduce el peso de 16,4 GB a 9,4 GB.

La relevancia de esta publicacion es practica: permite desplegar un modelo de 8B en FP8 con vLLM, TGI o SGLang sobre GPUs con compute capability igual o superior a 8.9 (Ada, Hopper o Blackwell), manteniendo la calidad del modelo original al no introducir sesgo de calibracion. La licencia es "other" y no se especifican idiomas soportados ni detalles del afinado original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (E4M3, pesos por canal, activaciones por token); `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer denso de la familia Qwen3 desarrollada por Alibaba. Sobre esa base, LastMachine publico el afinado ZeroZero-Heretic, cuyos detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. Tampoco se documentan innovaciones tecnicas adicionales del afinado original.

La contribucion de esta ficha es exclusivamente la cuantizacion: se aplico el esquema `FP8_DYNAMIC` de `llm-compressor`, que convierte los pesos a FP8 (E4M3) por canal de forma offline y cuantiza las activaciones dinamicamente por token durante la inferencia. Al no requerir calibracion, los pesos cuantizados son un cast directo de los originales, sin sesgo de conjunto de calibracion. La capa `lm_head` se deja en precision completa por su impacto desproporcionado en calidad frente a su tamano reducido. El resultado pasa de 16,4 GB a 9,4 GB.

## Capacidades

- Generacion de texto conversacional, heredada del pipeline `text-generation` del modelo base.
- Razonamiento y generacion de codigo: capacidades propias de la familia Qwen3-8B, aunque no se detallan en la model card de esta cuantizacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta informado.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Inferencia acelerada en FP8 sobre GPUs Ada/Hopper/Blackwell, con posibilidad de dequantizacion automatica en GPUs anteriores (perdiendo la ventaja de velocidad y memoria).

## Casos de uso

- Despliegue de un chatbot conversacional en produccion: el modelo puede servirse con `vllm serve` o TGI en una unica GPU con capacidad FP8, reduciendo el coste por instancia frente a la version en BF16 (9,4 GB frente a 16,4 GB de pesos).
- Inferencia de bajo coste en GPUs L4 o L40S: al requerir solo compute capability 8.9, permite ejecutar un modelo de 8B en GPUs de gama media de centro de datos con aceleracion FP8 nativa.
- Servicio de generacion de texto en pipelines internos: integrable via API compatible con endpoints (tag `endpoints_compatible`) y con SGLang, lo que facilita su inclusion en arquitecturas de microservicios.
- Prototipado rapido de aplicaciones conversacionales: el repo de 9,5 GB cabe en el almacenamiento de una instancia unica y se carga con `transformers`, sin necesidad de infraestructura distribuida.
- Evaluacion comparativa de calidad de cuantizacion: al ser un cast directo sin calibracion, sirve como referencia para medir la degradacion real de FP8 dinamico frente al modelo original en tareas propias.
- Fine-tuning o adaptacion posterior sobre la version cuantizada: aunque el fine-tuning en FP8 requiere herramientas especificas, el modelo puede usarse como base para experimentos de adaptacion con `compressed-tensors`.
- Despliegue en clústeres con H100/H200: el esquema FP8 permite aprovechar los tensor cores FP8 de Hopper para aumentar el throughput por GPU en cargas de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,4 GB solo para pesos en FP8; con overhead de KV cache y activaciones, se recomienda al menos 12-16 GB de VRAM para contextos moderados.
- GPU recomendadas: cualquier GPU con compute capability igual o superior a 8.9, es decir, RTX 40-series, L4, L40S, H100, H200, B100, B200 y GB10.
- Cabe en GPU consumer: si, en RTX 40-series (por ejemplo, RTX 4090 con 24 GB) gracias al soporte FP8 nativo; en GPUs anteriores (RTX 30-series, A100) vLLM/TGI dequantizaran a un tipo soportado, perdiendo la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/Qwen3-8B-ZeroZero-Heretic-FP8`), Text Generation Inference (imagen Docker oficial) y SGLang (`python -m sglang.launch_server --model-path ...`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-ZeroZero-Heretic-FP8 (este) | 8,19B | no disponible | FP8 dinamico | other | Hugging Face, 29 descargas |
| LastMachine/Qwen3-8B-ZeroZero-Heretic | 8,19B (aprox.) | no disponible | BF16 (original) | other | Hugging Face |
| Qwen3-8B (Alibaba) | 8B (aprox.) | no disponible | BF16 y multiples | no disponible | Hugging Face |

La comparativa se limita al modelo original y a la familia Qwen3-8B, ya que no se dispone de datos de rendimiento ni de contexto para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- La licencia es "other": es imprescindible revisar los terminos exactos antes de cualquier uso comercial, ya que pueden heredar restricciones del modelo base y del afinado original.
- No se documentan sesgos conocidos, pero al derivar de un modelo afinado por un tercero ("Heretic"), el comportamiento y los sesgos pueden diferir de los de Qwen3-8B original.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta cuantizacion.
- La cuantizacion FP8 puede introducir degradacion de calidad respecto al BF16 original, aunque el esquema dinamico sin calibracion minimiza el sesgo sistematico.
- En GPUs con compute capability inferior a 8.9, vLLM/TGI dequantizaran el modelo, anulando las ventajas de memoria y velocidad de FP8.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar un comportamiento multilingue o contextos largos sin validacion previa.
- El modelo tiene muy poca traccion (29 descargas, 0 likes) y fue publicado en 2026; no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liodon-ai/Qwen3-8B-ZeroZero-Heretic-FP8
- Modelo base: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- Perfil del autor: https://huggingface.co/liodon-ai
