# nm-testing/model_free_nvfp4a16-e2e

## Resumen

El modelo `nm-testing/model_free_nvfp4a16-e2e` es una versión cuantizada en formato NVFP4 (4 bits de precisión para pesos y 16 bits para activaciones) del conocido TinyLlama-1.1B-Chat-v1.0, un modelo de lenguaje compacto de 1.100 millones de parámetros desarrollado por el proyecto TinyLlama. La cuantización ha sido realizada por el equipo de nm-testing, que mantiene este repositorio como parte de sus pruebas de integración continua para el formato de compresión de tensores de NVIDIA.

El modelo base fue preentrenado sobre 3 billones de tokens utilizando la misma arquitectura y tokenizador que Llama 2, lo que garantiza compatibilidad con el ecosistema de herramientas existente. Posteriormente fue ajustado para chat siguiendo la receta de entrenamiento de Zephyr de HuggingFace, que combina fine-tuning supervisado sobre el dataset UltraChat y alineación mediante DPO sobre UltraFeedback. Esta versión cuantizada mantiene la licencia Apache 2.0 y está pensada para despliegues con restricciones de memoria, ya que el formato NVFP4 reduce significativamente el footprint de VRAM respecto al modelo original en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 2) |
| Parametros totales | 1.100.048.384 (1,1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base TinyLlama soporta 2048 tokens) |
| Tipos de cuantizacion | NVFP4 (4 bits pesos, 16 bits activaciones) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base TinyLlama-1.1B adopta exactamente la misma arquitectura y tokenizador que Llama 2, lo que permite su integracion directa en proyectos que ya utilizan modelos de la familia Llama. Se trata de un transformer decoder denso con 1,1B parametros, entrenado sobre 3 billones de tokens procedentes de SlimPajama y StarCoder, entre otros datasets. El proceso de preentrenamiento se completo en 90 dias utilizando 16 GPUs A100-40G.

Sobre esta base preentrenada se aplico el recetario de entrenamiento de Zephyr de HuggingFace: primero un fine-tuning supervisado sobre el dataset UltraChat, que contiene dialogos sinteticos generados por ChatGPT, y posteriormente una alineacion mediante DPO (Direct Preference Optimization) utilizando el dataset UltraFeedback, con 64k prompts y completions rankeadas por GPT-4. La version cuantizada que aloja nm-testing aplica el formato NVFP4 mediante la libreria compressed-tensors, que reduce el peso de cada parametro a 4 bits manteniendo las activaciones en 16 bits.

## Capacidades

- Generacion de texto conversacional: el modelo esta optimizado para mantener dialogos multi-turno con formato de chat, incluyendo rol de sistema.
- Generacion de codigo: el preentrenamiento incluyo el dataset StarCoder, por lo que puede generar funciones y fragmentos de codigo en Python y otros lenguajes.
- Razonamiento basico: al ser un modelo de 1,1B, ofrece capacidades limitadas de razonamiento logico y matematico, adecuadas para tareas sencillas.
- Soporte de chat template: utiliza el chat template estandar de transformers, compatible con el tokenizador de Llama 2.
- Cuantizacion NVFP4: formato de 4 bits que reduce el uso de memoria y acelera la inferencia en hardware compatible con NVIDIA.
- Multilingue: no, el modelo solo soporta ingles de forma fiable.

## Casos de uso

- Prototipado rapido de chatbots: por su tamano reducido y licencia permisiva, es ideal para validar conceptos de asistentes conversacionales antes de escalar a modelos mayores.
- Generacion de codigo en entornos con recursos limitados: puede integrarse en editores o IDEs ligeros para autocompletado de funciones simples en Python.
- Educacion e investigacion: util para experimentos de alineacion (SFT, DPO) y cuantizacion, ya que el modelo base es ampliamente documentado.
- Inferencia en edge devices: con 4 bits de cuantizacion, cabe en dispositivos con poca VRAM, como Raspberry Pi con acelerador o laptops sin GPU dedicada.
- Testing de pipelines de despliegue: sirve para validar infraestructuras de serving (vLLM, TGI) con un modelo pequeno antes de usar modelos grandes.
- Fine-tuning de bajo coste: al ser compacto, permite experimentar con tecnicas como LoRA o QLoRA en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base TinyLlama-1.1B reporta en su repositorio oficial resultados en tareas como HellaSwag, WinoGrande y OpenBookQA, pero esta version cuantizada no incluye mediciones propias. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6-0,8 GB para el modelo cuantizado en NVFP4 (1,1B parametros x 4 bits), mas overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 2060, RTX 3060, o incluso iGPUs con soporte de CUDA.
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama, HuggingFace TGI, o directamente con transformers y accelerate.
- Latencia estimada: en una RTX 3060, la generacion de 100 tokens deberia completarse en menos de 2 segundos, aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 | BF16 | Apache 2.0 | Version original sin cuantizar |
| nm-testing/model_free_nvfp4a16-e2e | 1,1B | no disponible | NVFP4 | Apache 2.0 | Version cuantizada, mismo modelo base |
| Qwen2.5-1.5B-Instruct | 1,5B | 32768 | BF16/GGUF | Apache 2.0 | Mayor contexto y mejor rendimiento en benchmarks |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 | BF16/GGUF | Apache 2.0 | Enfocado en eficiencia, buen rendimiento en tareas de instruccion |

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre datos de internet, puede reflejar sesgos presentes en SlimPajama y StarCoder, especialmente en temas sociales y culturales.
- Riesgo de alucinacion: como todo LLM pequeno, tiende a inventar hechos o codigo incorrecto cuando no conoce la respuesta.
- Limitaciones de contexto: la ventana de 2048 tokens del modelo base es corta para tareas que requieren contexto largo.
- Idioma: solo soporta ingles de forma fiable; el rendimiento en otros idiomas es muy limitado.
- Cuantizacion: el formato NVFP4 puede degradar ligeramente la calidad de las respuestas respecto al modelo en BF16, especialmente en tareas de razonamiento.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base TinyLlama tiene limitaciones similares a Llama 2 en cuanto a responsabilidad del usuario final.
- Produccion: al ser un modelo de 1,1B, no es adecuado para tareas complejas de razonamiento o generacion de codigo avanzado; se recomienda evaluar su calidad en el dominio especifico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nm-testing/model_free_nvfp4a16-e2e
- Repositorio del modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Proyecto TinyLlama (GitHub): https://github.com/jzhang38/TinyLlama
- Dataset SlimPajama: https://huggingface.co/datasets/cerebras/SlimPajama-627B
- Dataset StarCoder: https://huggingface.co/datasets/bigcode/starcoderdata
- Dataset UltraChat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset UltraFeedback: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
