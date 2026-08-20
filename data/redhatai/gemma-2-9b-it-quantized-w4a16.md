# RedHatAI/gemma-2-9b-it-quantized.w4a16

## Resumen

RedHatAI/gemma-2-9b-it-quantized.w4a16 es una version cuantizada del modelo de Google Gemma-2 9B, desarrollada por Neural Magic y publicada bajo el sello Red Hat AI. El objetivo es reducir el coste computacional y de memoria de la inferencia sin sacrificar la calidad de las respuestas. Se obtiene aplicando cuantizacion INT4 a los pesos de los operadores lineales del modelo original, lo que reduce el tamano en disco y los requisitos de VRAM en aproximadamente un 75 %. El modelo mantiene un rendimiento practicamente identico al original: 73,62 de media en el benchmark OpenLLM v1 frente a 73,23 del modelo sin cuantizar. Esta orientado a despliegues eficientes en produccion, especialmente con el backend vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-2 (transformer denso) |
| Parametros totales | 10.159.209.984 (10,16 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo original Gemma-2 9B soporta 8192 tokens) |
| Tipos de cuantizacion | INT4 (W4A16) |
| Idiomas soportados | Ingles |
| Licencia | Gemma (segun la model card; el tag de HuggingFace indica llama2, discrepancia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se obtiene cuantizando los pesos del modelo preentrenado `gemma-2-9b-it` de Google mediante el algoritmo GPTQ, implementado con la libreria `llm-compressor`. La cuantizacion se aplica solo a los operadores lineales de los bloques transformer, con un esquema simetrico por grupos de tamano 128 y un factor de damping del 1 %. El proceso de calibracion utiliza 512 secuencias del dataset Open-Platypus. Los pesos se representan en INT4, mientras que los activos se mantienen en FP16 (esquema W4A16). No se han publicado detalles sobre el entrenamiento del modelo base, ya que es una version preentrenada de Google.

## Capacidades

- Generacion de texto conversacional y asistente de chat, similar a gemma-2-9b-it.
- Razonamiento basico y respuesta a instrucciones en ingles.
- No se ha documentado soporte para tool calling, function calling ni agentes.
- Capacidad multilingue limitada a ingles; la model card indica que el uso en otros idiomas queda fuera del alcance.

## Casos de uso

- Despliegue de chatbots y asistentes virtuales en entornos con GPU limitada: al ocupar solo unos 5 GB de VRAM en inferencia, puede ejecutarse en GPUs de consumo como RTX 3060 o RTX 4060.
- Servicios de generacion de texto en produccion con alta concurrencia: el soporte nativo con vLLM permite servir peticiones con baja latencia y alto throughput.
- Pruebas de concepto en investigacion sobre cuantizacion y eficiencia de modelos LLM.
- Fine-tuning con adaptadores LoRA o QLoRA sobre el modelo cuantizado, aprovechando su menor huella de memoria.
- Aplicaciones de asistencia en tiempo real en entornos con recursos limitados, como edge computing o dispositivos con 8 GB de RAM.
- Migracion de infraestructuras LLM para reducir costes de inferencia sin perder calidad notable en tareas de chat.

## Benchmarks y rendimiento

Segun la model card, el modelo fue evaluado en el OpenLLM leaderboard v1 (usando lm-evaluation-harness y vLLM). No se han publicado resultados desglosados por tarea, solo la puntuacion media.

| Modelo | Puntuacion media OpenLLM v1 |
|---|---|
| gemma-2-9b-it (sin cuantizar) | 73,23 |
| gemma-2-9b-it-quantized.w4a16 | 73,62 |

La cuantizacion no solo no degrada el rendimiento, sino que muestra una ligera mejora en la puntuacion media, aunque dentro del margen de ruido.

## Requisitos de hardware

- Tamano del modelo en disco: 8,0 GB (safetensors).
- VRAM estimada para inferencia: aproximadamente 5-6 GB con cuantizacion INT4, mas overhead del runtime.
- GPUs recomendadas: NVIDIA RTX 4090, A100, L4, RTX 3060 o cualquier GPU con al menos 8 GB de VRAM.
- Puede ejecutarse en GPUs de consumo con 8 GB de VRAM, como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: vLLM (soporte nativo), transformers con `generate()`, y se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque no viene en el repo.
- Latencia y throughput: no hay datos publicados, pero con vLLM y cuantizacion INT4 se espera una mejora significativa frente al modelo FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Puntuacion OpenLLM v1 | VRAM estimada | Licencia |
|---|---|---|---|---|---|
| gemma-2-9b-it (original) | 9,24B | FP16 | 73,23 | ~18 GB | Gemma |
| gemma-2-9b-it-quantized.w4a16 (este) | 10,16B | INT4 | 73,62 | ~5-6 GB | Gemma |
| gemma-2-9b-it-quantized.w8a16 (otra variante) | 10,16B | INT8 | No publicado | ~10 GB | Gemma |

No se dispone de datos de otros modelos comparables en la misma categoria, como Llama-3-8B o Mistral-7B, dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo esta entrenado para ingles; el uso en otros idiomas puede producir respuestas incorrectas o degradadas.
- La cuantizacion INT4 puede introducir una pequena perdida de precision en tareas que requieren alta exactitud, aunque los benchmarks no muestran degradacion.
- La licencia Gemma impone restricciones de uso comercial y obliga a mantener la atribucion; es necesario revisar los terminos completos.
- El modelo no incluye capacidades de vision, audio ni herramientas de agente.
- La discrepancia en la licencia entre la model card (Gemma) y el tag de HuggingFace (llama2) genera incertidumbre legal; se recomienda verificar los terminos oficiales antes de usar.
- No se han publicado evaluaciones sobre sesgos o riesgos de alucinacion especificos de esta variante cuantizada.

## Enlaces

- HuggingFace: https://huggingface.co/RedHatAI/gemma-2-9b-it-quantized.w4a16
- Modelo original: https://huggingface.co/google/gemma-2-9b-it
- Libreria llm-compressor: https://github.com/vllm-project/llm-compressor
- Paper GPTQ: https://arxiv.org/abs/2210.17323
- Dataset de calibracion: https://huggingface.co/datasets/garage-bAInd/Open-Platypus
- Repositorio de evaluacion (lm-evaluation-harness): https://github.com/EleutherAI/lm-evaluation-harness
