# blearyhope/Edge0-35B-A3B-preview

## Resumen

Edge0-35B-A3B-preview es un modelo de lenguaje de tipo Mixture of Experts (MoE) disperso desarrollado por blearyhope (equipo Edge0-AI), publicado como vista previa temprana sobre Hugging Face. Se construye a partir del modelo base Qwen/Qwen3.6-35B-A3B mediante una tuberia de cuantizacion a 4 bits (int4) combinada con adaptadores LoRA de recuperacion (Recover-LoRA) y un cabezal enrutador predictivo (prerouter), todo ello empaquetado para el framework de inferencia por streaming edge0.

Su propuesta central es permitir que un modelo de clase 35B con 256 expertos (4 activos por token, K=4) funcione en memoria de clase telefonica: menos de 3 GiB de memoria activa, gracias a la descarga bajo demanda de pesos de expertos desde almacenamiento SSD. El checkpoint completo pesa 19,7 GB y contiene 34.660.610.688 parametros, pero solo el conjunto activo reside en RAM durante la inferencia.

La relevancia del modelo radica en su enfoque de despliegue: motores nativos de codigo abierto para iOS, macOS, Android y Windows, con una velocidad declarada de 15 tok/s en decodificacion y 140 tok/s en llenado de prompts largos. La licencia Apache 2.0 y la disponibilidad del codigo del framework lo hacen atractivo para experimentacion en dispositivos de borde, aunque su estado de vista previa y la ausencia de benchmarks publicados exigen cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (base Qwen3.6-35B-A3B), con prerouter y adaptadores LoRA |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | 4 expertos de 256 por token (K=4); el numero exacto de parametros activos no esta disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (int4) en el checkpoint base; adaptadores LoRA y prerouter en safetensors sin fusionar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (base int4 + `lora_edge0_35b.safetensors` + `prerouter_edge0_35b.safetensors`); libreria MLX |
| Capas | 40 |
| Tamano oculto | 2048 |
| Tamano del repositorio | 19,7 GB |
| Framework de inferencia | edge0 (backend MLX) |
| Plataformas | iOS, macOS, Android, Windows |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer MoE con 40 capas, tamano oculto de 2048 y 256 expertos por capa, de los cuales se activan 4 por token (K=4). Sobre esta base, el equipo de Edge0 aplica tres mecanismos. Primero, una cuantizacion int4 del checkpoint base, que se mantiene congelado. Segundo, adaptadores Recover-LoRA entrenados por destilacion desde el profesor en FP16, con el objetivo de recuperar la perdida de calidad de la cuantizacion; segun la model card, el modelo int4 queda a 3,9 puntos del base fp16. Tercero, un prerouter entrenado que predice el enrutamiento de expertos un paso por delante, de modo que las cargas de expertos desde SSD se solapen con el pase forward en lugar de bloquearlo, con una mejora declarada de hasta el 59 % en throughput de decodificacion.

El entrenamiento se realiza especificamente para el framework edge0. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO sobre el modelo base. La innovacion tecnica destacable es la combinacion de descarga de expertos desde almacenamiento (SSD expert offload) con el prerouter: la memoria pico queda acotada por el conjunto activo (menos de 3 GiB) y no por el numero total de parametros.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, segun el pipeline declarado (`text-generation`).
- Razonamiento y respuesta multi-turno heredados del modelo base Qwen3.6-35B-A3B.
- Ejecucion en dispositivos de borde con memoria limitada gracias al streaming de expertos desde SSD.
- Despliegue multiplataforma con motores nativos: iOS, macOS, Android y Windows.
- Carga automatica de adaptadores: el repositorio incluye base, LoRA y prerouter, que se cargan de forma conjunta via `edge0`.
- Capacidades de tool calling, function calling y agentes: no disponibles en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Idiomas soportados: no disponibles.

## Casos de uso

- Asistente conversacional en movil: el modelo puede ejecutarse en iOS y Android con menos de 3 GiB de memoria activa, lo que permite integrar un LLM de clase 35B en aplicaciones nativas sin depender de la nube.
- Procesamiento de prompts largos en local: con 140 tok/s de llenado, resulta adecuado para tareas de resumen o analisis de documentos en portatiles y equipos de sobremesa con macOS o Windows.
- Experimentacion con inferencia MoE en el borde: investigadores pueden estudiar el comportamiento del prerouter y del offload de expertos sobre hardware de consumo, usando el codigo abierto del framework edge0.
- Prototipado de agentes locales: la ventana de contexto no esta documentada, pero el modelo puede servir como base para pipelines de generacion de texto en dispositivos sin conexion.
- Educacion y demostraciones: util para mostrar tecnicas de cuantizacion int4 con recuperacion por LoRA y enrutamiento predictivo en entornos academicos.
- Despliegue en entornos con almacenamiento rapido y RAM escasa: escenarios de computacion de borde industrial o embebida donde el modelo completo no cabe en memoria pero si en disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara metricas de rendimiento de inferencia: 15 tok/s en decodificacion, 140 tok/s en llenado de prompts, menos de 3 GiB de memoria activa, y una diferencia de 3,9 puntos respecto al base fp16 tras la cuantizacion. No se especifica sobre que benchmark se mide esa diferencia.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: menos de 3 GiB de memoria activa, gracias al streaming de expertos desde SSD; el checkpoint completo ocupa 19,7 GB en almacenamiento.
- Almacenamiento: se recomienda SSD de alta velocidad, ya que los expertos se cargan bajo demanda y la latencia del almacenamiento afecta directamente al throughput.
- GPU recomendadas: no disponibles en la informacion proporcionada; el framework declara backend MLX y motores nativos para Apple Silicon y otras plataformas.
- Compatibilidad con GPU de consumo: el modelo esta disenado para ejecutarse en dispositivos de clase telefonica y portatiles, por lo que cabe en hardware de consumo, aunque no se detallan modelos concretos.
- Opciones de despliegue: framework edge0 (backend MLX) con motores nativos para iOS, macOS, Android y Windows. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 15 tok/s en decodificacion y 140 tok/s en llenado de prompts, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Edge0-35B-A3B-preview | 34,66 B (MoE, K=4) | no disponible | Apache 2.0 | Hugging Face, ModelScope, GitHub |
| Qwen3.6-35B-A3B (base) | clase 35B (MoE) | no disponible | no disponible en esta ficha | Hugging Face (Qwen) |
| Edge0-8B-A1B-preview | clase 8B (MoE) | no disponible | Apache 2.0 (segun enlaces de la model card) | Hugging Face, ModelScope |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de vista previa: el propio autor lo califica como lanzamiento temprano de la tuberia edge0, con posible inestabilidad o cambios en el formato.
- Ausencia de benchmarks publicados: no hay resultados de MMLU, HumanEval, GSM8K ni similares que permitan evaluar la calidad real frente a alternativas.
- Idiomas y contexto no documentados: se desconoce la cobertura linguistica y la longitud maxima de contexto.
- Dependencia del framework edge0: el checkpoint esta preparado para ese motor concreto y no se garantiza su funcionamiento con otras herramientas de inferencia.
- Dependencia de almacenamiento: el rendimiento depende de la latencia del SSD; en almacenamiento lento el throughput puede degradarse pese al prerouter.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion.
- Sesgos: no se proporciona informacion sobre sesgos conocidos ni sobre la composicion del dataset de destilacion.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.6-35B-A3B conviene verificar las condiciones del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/blearyhope/Edge0-35B-A3B-preview
- Hugging Face (organizacion Edge0): https://huggingface.co/Edge0/Edge0-35b-a3b-preview
- Hugging Face (Edge0-8B-A1B-preview): https://huggingface.co/Edge0/Edge0-8b-a1b-preview
- GitHub: https://github.com/Edge0-AI/edge0
- ModelScope: https://www.modelscope.cn/models/Edge0/Edge0-35B-A3B-preview
- ModelScope (8B): https://www.modelscope.cn/models/Edge0/Edge0-8B-A1B-preview
- arXiv: https://arxiv.org/abs/2609.18063
- Licencia: https://github.com/Edge0-AI/edge0/blob/main/LICENSE
- Motor iOS: https://github.com/Edge0-AI/edge0/tree/main/ios
- Motor macOS: https://github.com/Edge0-AI/edge0/tree/main/macos
- Motor Android: https://github.com/Edge0-AI/edge0/tree/main/android
- Motor Windows: https://github.com/Edge0-AI/edge0/tree/main/windows
