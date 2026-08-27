# kingjones777/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF

## Resumen

Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF es una cuantización GGUF del modelo Qwen3.8-Flash-Next, creada por el usuario kingjones777. El modelo base, desarrollado por el equipo Qwen, es un modelo de lenguaje multimodal de arquitectura MoE (Mixture of Experts) basado en la nueva arquitectura Qwen4, con una ventana de contexto de 262 000 tokens y capacidades avanzadas de razonamiento. Esta versión cuantizada está específicamente diseñada para ejecutarse en hardware AMD con arquitectura gfx1151 (APU Ryzen AI Max+ 395 / Strix Halo) utilizando el formato ROCmFP4, un esquema de cuantización de 4 bits optimizado para ROCm.

La relevancia de esta ficha radica en que permite desplegar un modelo de ~177 000 millones de parámetros en una APU con memoria unificada de 128 GB, algo inviable con los pesos originales en BF16. El autor ha aplicado un tratamiento especial a los embeddings y a la cabeza de salida (lm head) para minimizar la pérdida de calidad, manteniendo el head en Q6_K mientras el resto de pesos se cuantizan a 4 bits. El resultado es un archivo de 87,9 GiB que alcanza 21,6 tokens por segundo en generación y 101,8 tokens por segundo en procesamiento de prompt en el hardware objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4 (MoE multimodal) |
| Parametros totales | 176 943 899 520 (aprox. 176,9B) |
| Parametros activos | no disponible (el modelo base es MoE; unsloth indica 125B, sin confirmar) |
| Longitud de contexto | 262 000 tokens (segun unsloth) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_FAST (head en Q6_K) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (sharded en 3 archivos) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE multimodal de la familia Qwen, construido sobre la arquitectura Qwen4. Segun la documentacion de unsloth, cuenta con 125 000 millones de parametros (aunque el peso real en safetensors es de 176,9B, lo que sugiere que 125B podrian ser los parametros activos por token). Soporta una ventana de contexto de 262 000 tokens y esta entrenado para tareas de razonamiento avanzado, generacion de texto, codigo y comprension multimodal (texto e imagen). No se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO en la informacion proporcionada.

La cuantizacion realizada por kingjones777 parte de una conversion propia a BF16 de los pesos originales y aplica el formato Q4_0_ROCMFP4_FAST, un esquema de 4 bits de escala unica definido en el fork ROCmFPX de llama.cpp. La innovacion principal de esta build es el tratamiento diferenciado de los tensores: todos los pesos de atencion y de los expertos MoE se cuantizan a 4 bits, al igual que la tabla de embeddings por capa (PLE) y los embeddings de token, mientras que la cabeza de salida (output.weight) se mantiene en Q6_K. Esta decision reduce el error de cuantizacion en el argmax de cada token generado, ya que la cabeza es una de las pocas matrices densas restantes en un modelo MoE disperso. El resultado es un archivo de 87,9 GiB con 4,27 bits por peso (bpw) de media.

## Capacidades

- Generacion de texto y razonamiento avanzado: el modelo base esta disenado para tareas complejas de razonamiento, aunque la cuantizacion puede afectar ligeramente a la precision.
- Comprension multimodal: el modelo base acepta entradas de texto e imagen, aunque no se ha verificado si esta cuantizacion conserva plenamente esta capacidad.
- Ventana de contexto larga: 262 000 tokens, util para procesar documentos extensos, codebases completos o conversaciones multi-turno.
- Soporte de tool calling y agentes: no confirmado en la informacion disponible; se asume que hereda las capacidades del modelo base, pero no hay datos especificos.
- Capacidades multilingues: no especificadas en la model card; el modelo base de Qwen suele ser multilingue, pero no se detalla la lista de idiomas.
- Modo de razonamiento (thinking): no se menciona en la documentacion de esta cuantizacion.

## Casos de uso

- Despliegue local en APU AMD Strix Halo: el caso principal es ejecutar un modelo de ~177B en un Ryzen AI Max+ 395 con 128 GB de memoria unificada, algo imposible con los pesos originales. La cuantizacion ROCmFP4 permite el offload completo de las 49 capas a la GPU integrada.
- Servidor de inferencia para aplicaciones de chat: usando `llama-server` con el fork ROCmFPX, se puede montar un endpoint compatible con OpenAI para integrar el modelo en aplicaciones de conversacion o asistentes virtuales.
- Procesamiento de documentos largos: gracias a la ventana de 262K tokens, el modelo puede analizar informes extensos, contratos o libros completos en una sola pasada, sin necesidad de chunking.
- Generacion de codigo en entornos sin conexion: desarrolladores que necesiten un asistente de codigo local, sin enviar datos a la nube, pueden usar este modelo con herramientas como llama.cpp o interfaces compatibles.
- Investigacion academica: permite experimentar con un modelo MoE de gran tamano en hardware de consumo (APU de gama alta) para estudiar su comportamiento, sin depender de clusters de GPU.
- Pruebas de cuantizacion y optimizacion: el formato ROCmFP4 y el tratamiento del head en Q6_K sirven como referencia para otros desarrolladores que quieran cuantizar modelos MoE para hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica de rendimiento proporcionada por el autor, medida en su equipo (Ryzen AI MAX+ 395, gfx1151, Radeon 8060S, ROCm 7.2.4, full offload de 49/49 capas), es:

| Metrica | Valor |
|---|---|
| Velocidad de generacion (single stream, greedy) | 21,6 tok/s |
| Velocidad de procesamiento de prompt | 101,8 tok/s |

## Requisitos de hardware

- VRAM estimada: 87,9 GiB para los pesos, mas overhead de ejecucion; se recomienda ~88 GiB libres en la GPU.
- GPU recomendada: AMD APU con arquitectura gfx1151 (Ryzen AI Max+ 395 / Radeon 8060S) o similar con soporte ROCm 7.2.4.
- No cabe en GPUs consumer convencionales (RTX 4090 tiene 24 GB, no es suficiente).
- Requiere un fork de llama.cpp (ROCmFPX) con soporte para la arquitectura `qwen4exp` y los tipos de tensor `Q4_0_ROCMFP4_*`. Compilacion recomendada: `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151 -DGGML_NATIVE=ON`.
- Opciones de despliegue: `llama-server` (con el comando indicado en la model card), `llama-cli`, o cualquier frontend compatible con llama.cpp.
- Latencia y throughput: 21,6 tok/s en generacion y 101,8 tok/s en prompt processing, medidos en el hardware de referencia.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (tamano o tarea) en la informacion proporcionada. La unica referencia disponible es la mencion a una variante STRIX_LEAN del mismo autor, que difiere en el tratamiento de embeddings (Q5_1 para PLE y Q5_K para token embeddings) y ocupa ~10 GiB mas. No hay benchmarks comparativos publicados.

## Limitaciones y advertencias

- La cuantizacion a 4 bits (Q4_0_ROCMFP4_FAST) puede degradar la calidad de las respuestas en tareas de razonamiento complejo o generacion de codigo, en comparacion con los pesos originales en BF16.
- Requiere un fork especifico de llama.cpp (ROCmFPX) con el PR #27742 fusionado; los builds estandar de llama.cpp no cargaran estos archivos.
- El hardware objetivo es muy especifico: solo APUs AMD con gfx1151 y ROCm 7.2.4 o superior. No es portable a GPUs NVIDIA ni a otras arquitecturas AMD.
- La memoria unificada de 128 GB es imprescindible para el offload completo; si la GPU comparte memoria con otras aplicaciones, puede no caber.
- La licencia qwen-community-1.0 puede tener restricciones de uso comercial; se recomienda revisar sus terminos antes de desplegar en produccion.
- No se han publicado evaluaciones de sesgos, alucinacion o robustez para esta cuantizacion especifica.
- El modelo base es multimodal, pero no se ha verificado si esta cuantizacion conserva la capacidad de procesar imagenes correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF
- Documentacion de unsloth sobre Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Repositorio similar de julianmb (Qwen 3.8 27B ROCmFP4): https://github.com/julianmb/q38rocm
- Copia del repositorio en HuggingFace (agentionai): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF
- Proyecto ROCmFPX (fork de llama.cpp): no se ha proporcionado enlace directo, pero se menciona en los creditos de la model card.
