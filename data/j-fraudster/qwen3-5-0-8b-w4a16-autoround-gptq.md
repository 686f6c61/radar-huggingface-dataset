# J-Fraudster/Qwen3.5-0.8B-W4A16-AutoRound-GPTQ

## Resumen

Este repositorio contiene una versión cuantizada W4A16 (pesos de 4 bits, activaciones de 16 bits) del modelo multimodal Qwen/Qwen3.5-0.8B, generada con el algoritmo AutoRound de Intel y publicada en formato GPTQ. El modelo base es un VLM (vision-language model) de la familia Qwen3.5, capaz de procesar entradas de imagen y texto para generar respuestas de texto. La cuantización reduce significativamente los requisitos de memoria y acelera la inferencia, lo que permite ejecutar el modelo en GPUs de consumo sin pérdidas importantes de precisión, según los parámetros de calibración empleados.

La relevancia de esta ficha radica en que ofrece una alternativa optimizada para despliegues en producción con vLLM, manteniendo la torre de visión y las capas de predicción multi-token en bfloat16 para preservar la calidad en tareas de razonamiento visual y OCR. El modelo tiene 852.985.920 parámetros totales y un tamaño de repositorio de 1,1 GB. Cabe señalar que la model card original contiene algunas inconsistencias (el título menciona "Qwen3.5-2B" y cifras de VRAM que no se corresponden con el tamaño real del modelo), por lo que se recomienda contrastar los datos con pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (la familia Qwen3.5 emplea gated delta networks segun la documentacion de vLLM; no se confirma para esta variante de 0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (la calibracion uso seqlen 4096, pero no se especifica el contexto maximo del modelo) |
| Tipos de cuantizacion | W4A16 (4-bit pesos, 16-bit activaciones), group size 16, simetrico, AutoRound |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GPTQ (AutoRound) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un VLM que combina un codificador de vision con un modelo de lenguaje. Segun la guia de vLLM para Qwen3.5, la familia emplea una arquitectura de mixture-of-experts con gated delta networks, aunque no se ha confirmado si la variante de 0.8B es densa o MoE. La cuantizacion se realizo con AutoRound de Intel, utilizando 512 muestras de calibracion, una longitud de secuencia de 4096 y 1000 iteraciones de ajuste. El group size de 16 proporciona una mayor fidelidad de reconstruccion que el estandar de 128. La torre de vision (vision tower) y las capas de prediccion multi-token (mtp, mtp.fc) se mantuvieron en bfloat16 para preservar la precision en tareas visuales y de razonamiento. No se dispone de informacion sobre el entrenamiento original del modelo base (datos, tokens, metodos de alineacion).

## Capacidades

- Generacion de texto y respuestas conversacionales a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Razonamiento visual y OCR, gracias a la torre de vision conservada en bfloat16.
- Prediccion multi-token (MTP), una tecnica que permite predecir varios tokens futuros simultaneamente, preservada en bfloat16.
- Inferencia cuantizada W4A16, compatible con backends como vLLM mediante `--quantization auto-round` o `--quantization gptq`.
- No se ha confirmado soporte de tool calling, function calling o modo agente en esta variante especifica, aunque la familia Qwen3.5 suele incluirlos en sus versiones instruct.

## Casos de uso

- Despliegue de un asistente multimodal en GPU de consumo: el modelo cuantizado puede ejecutarse en una RTX 3090 o 4090 de 24 GB, permitiendo construir chatbots que analizan imagenes y responden en lenguaje natural sin necesidad de hardware de centro de datos.
- Extraccion de informacion de documentos escaneados: gracias a la torre de vision en bfloat16, el modelo puede realizar tareas de OCR y comprension de tablas o formularios en entornos con recursos limitados.
- Moderacion de contenido visual: integrado en un pipeline de vLLM, puede clasificar o describir imagenes en tiempo real para filtrar contenido inapropiado en plataformas sociales.
- Asistencia a personas con discapacidad visual: el modelo puede describir escenas o leer texto de fotografias capturadas con un telefono, ejecutandose localmente en un equipo con GPU.
- Prototipado rapido de aplicaciones vision-language: al ocupar solo 1,1 GB en disco, es adecuado para entornos de desarrollo y pruebas donde el espacio y la memoria son limitados.
- Investigacion en cuantizacion de modelos multimodales: sirve como punto de partida para evaluar el impacto de W4A16 con group size 16 en tareas visuales, comparando con el modelo base en bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de tareas visuales. Se recomienda realizar pruebas propias para validar la degradacion de precision respecto al modelo base.

## Requisitos de hardware

- La model card indica que el modelo cuantizado requiere entre 16 y 18 GB de VRAM y que el original en BF16 necesitaba unos 54 GB, pero estas cifras parecen inconsistentes con el tamaño real del modelo (852M parametros, que en BF16 ocuparian aproximadamente 1,7 GB y en 4-bit unos 0,5 GB). Es probable que el autor copiara datos de otro repositorio.
- Dado el tamaño real, el modelo deberia caber en cualquier GPU con al menos 4 GB de VRAM, aunque la torre de vision en bfloat16 y las activaciones pueden aumentar el consumo. No se dispone de mediciones fiables.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, por ejemplo RTX 3060, RTX 4060, RTX 3090, RTX 4090, A5000, etc.
- Opciones de despliegue: vLLM (con `--quantization auto-round` o `--quantization gptq`), y potencialmente otros backends compatibles con GPTQ como llama.cpp u Ollama, aunque no se ha verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 852M | no disponible | BF16 | Apache 2.0 | Hugging Face |
| J-Fraudster/Qwen3.5-0.8B-W4A16-AutoRound-GPTQ | 852M | no disponible | W4A16 GPTQ | Apache 2.0 | Hugging Face |
| Vishva007/Qwen3.5-0.8B-W4A16-AutoRound-GPTQ | 852M | no disponible | W4A16 GPTQ | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento para comparar. La unica diferencia clara entre el modelo base y las versiones cuantizadas es el formato de pesos y el consiguiente ahorro de memoria.

## Limitaciones y advertencias

- La model card contiene inconsistencias: el titulo menciona "Qwen3.5-2B" y las cifras de VRAM (54 GB original, 16-18 GB cuantizado) no se corresponden con un modelo de 852M parametros. Estos datos deben ignorarse.
- No se han publicado benchmarks ni evaluaciones de calidad, por lo que se desconoce el grado de degradacion respecto al modelo base.
- No se especifican los idiomas soportados ni el contexto maximo, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- Al ser una cuantizacion con group size 16, el modelo puede presentar una mayor sensibilidad a outliers en comparacion con group sizes mayores, aunque AutoRound esta disenado para mitigarlo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3.5-0.8B por si hubiera restricciones adicionales.
- No se ha verificado el soporte de tool calling, agentes o modos de razonamiento extendido en esta variante cuantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/J-Fraudster/Qwen3.5-0.8B-W4A16-AutoRound-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio similar de Vishva007: https://huggingface.co/Vishva007/Qwen3.5-0.8B-W4A16-AutoRound-GPTQ
- Articulo sobre cuantizacion de Qwen3.5 (Kaitchup): https://kaitchup.substack.com/p/qwen35-quantization-similar-accuracy
- Guia de vLLM para Qwen3.5 y Qwen3.6: https://docs.vllm.ai/projects/recipes/en/stable/Qwen/Qwen3.5.html
- Repositorio de AutoRound (Intel): https://github.com/intel/auto-round
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
