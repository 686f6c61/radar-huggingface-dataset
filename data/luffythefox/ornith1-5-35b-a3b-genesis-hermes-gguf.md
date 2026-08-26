# LuffyTheFox/Ornith1.5-35B-A3B-Genesis-Hermes-GGUF

## Resumen

Ornith1.5-35B-A3B-Genesis-Hermes-GGUF es un modelo experimental de cuantizacion GGUF creado por LuffyTheFox, que combina el modelo base Ornith-1.5-35B-A3B de ornith-ai con datos de un finetune de Hermes para funciones de agente. El modelo aplica el algoritmo Genesis, un metodo de post-entrenamiento que reduce el ruido acumulado en los tensores de la red neuronal sin reentrenar el modelo, con el objetivo de mejorar la estabilidad, la claridad contextual y la adherencia a instrucciones.

Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 35.505 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token. Es multimodal (image-text-to-text), soporta vision y esta orientado a tareas agénticas y function calling. La licencia es MIT, lo que permite uso comercial sin restricciones significativas. El repositorio tiene 91,5 GB e incluye multiples cuantizaciones GGUF.

La relevancia de este modelo radica en su enfoque experimental: no es un finetune convencional, sino una intervencion numerica directa sobre los pesos del modelo en formato GGUF. Esto lo hace interesante para la comunidad open source por su metodologia novedosa, aunque su naturaleza experimental y la falta de benchmarks publicados exigen cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | Hasta 256k (segun version DGX Spark del modelo base) |
| Tipos de cuantizacion | Multiples quants GGUF (Q2_K a Q8_0, incluyendo APEX) |
| Idiomas soportados | Ingles, chino, multilingue |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer MoE con aproximadamente 3.000 millones de parametros activos por token, disenado para razonamiento y codigo. La arquitectura sigue el esquema de Qwen3.5, con atencion por ventanas y soporte para decodificacion especulativa MTP (Multi-Token Prediction) en ciertas implementaciones.

El proceso de creacion de este modelo es atipico: LuffyTheFox aplico el algoritmo Genesis, un metodo de post-entrenamiento que opera directamente sobre los tensores en formato GGUF. El proceso consta de tres etapas: primero repara el equilibrio entre cabezas en los tensores ssm_conv1d (relacionados con memoria de contexto largo); segundo, detecta y reduce ruido de entrenamiento mediante SVD personalizado, excluyendo ciertos tensores como token_embd.weight y output.weight; tercero, reemplaza bloques de ceros corruptos con bloques optimos de la distribucion de pesos. Ademas, transfirio aproximadamente 2.000 bloques de dos tensores FFN expert del finetune Hermes de DJLougen al modelo base censurado de Ornith.

No se ha realizado entrenamiento ni fine-tuning convencional; el autor describe el proceso como "cirugia numerica" sobre los bytes del archivo. El dataset Hermes-function-calling-v1 de NousResearch se utilizo como fuente de los datos transferidos.

## Capacidades

- Generacion de texto y razonamiento multimodal: el modelo acepta entradas de imagen y texto (pipeline image-text-to-text).
- Function calling y tareas agénticas: gracias a la transferencia de datos del finetune Hermes, soporta llamadas a funciones y respuestas en JSON con esquemas definidos.
- Razonamiento multi-step con modo thinking: el modelo incluye un modo de pensamiento que puede activarse o desactivarse mediante system prompts.
- Capacidades multilingues: soporta ingles, chino y otros idiomas.
- Vision: al estar basado en Ornith-1.5, hereda capacidades de comprension de imagenes.
- Contexto largo: soporta hasta 256k tokens de contexto en configuraciones con hardware adecuado.
- Decodificacion especulativa: la version para DGX Spark incluye MTP speculative decoding para acelerar la inferencia.

## Casos de uso

- Agentes conversacionales con function calling: el modelo puede integrarse en sistemas agénticos que requieren respuestas estructuradas en JSON, usando el system prompt recomendado con esquemas JSON. Es adecuado porque hereda datos del dataset Hermes-function-calling-v1.
- Asistencia de codigo con modo thinking: para tareas de programacion, se recomienda usar el modo thinking con temperatura 0.6 y top_p 0.95. El modelo puede razonar sobre problemas complejos antes de generar codigo.
- Analisis de imagenes con contexto largo: gracias a su capacidad multimodal y ventana de contexto amplia, puede procesar documentos extensos con figuras, diagramas o capturas de pantalla.
- Chat multilingue: soporta conversaciones en ingles y chino, con capacidad de cambiar de idioma en medio de la conversacion.
- Generacion creativa de texto: en modo no-thinking con temperatura 0.7, el modelo produce texto mas variado y creativo, util para redaccion, marketing o narrativa.
- Prototipado rapido de agentes: al ser un modelo GGUF con licencia MIT, puede desplegarse localmente con llama.cpp u Ollama para experimentar con arquitecturas agénticas sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otros tests estandarizados. La unica informacion de rendimiento disponible son las recomendaciones de configuracion para optimizar la velocidad en APEX quant, que incluyen fijar la cuantizacion de cache K/V a F16 y forzar 40 capas MoE a CPU.

## Requisitos de hardware

- VRAM estimada: para la cuantizacion Q4_K_M (aproximadamente 20-22 GB), se necesita una GPU con al menos 24 GB de VRAM. Las cuantizaciones mas bajas (Q2_K, Q3_K) pueden caber en 16 GB.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para las cuantizaciones mas altas. El autor desarrollo el algoritmo en una Tesla T4 (16 GB) en Google Colab.
- Consumer GPU: si, las cuantizaciones Q2-Q4 caben en GPUs de gama alta como RTX 3090/4090. Para las cuantizaciones Q6-Q8 se recomienda hardware profesional.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con conversion), TGI. El formato GGUF es compatible con el ecosistema llama.cpp.
- Latencia y throughput: no disponible. El autor recomienda forzar 40 capas MoE a CPU y usar 8 expertos activos para equilibrar carga, lo que sugiere que el modelo puede ejecutarse con offloading hibrido CPU/GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith1.5-35B-A3B-Genesis-Hermes (este) | 35,5B | ~3B | hasta 256k | MIT | GGUF |
| Ornith-1.5-35B-A3B (base) | 35,5B | ~3B | hasta 256k | MIT | safetensors/GGUF |
| Qwen3-30B-A3B | 30,5B | ~3B | 128k | Apache 2.0 | safetensors/GGUF |
| DeepSeek-R1-Distill-Qwen-32B | 32B | 32B (denso) | 128k | MIT | safetensors/GGUF |

La comparativa con Qwen3-30B-A3B es relevante porque ambos usan arquitectura MoE con ~3B activos. DeepSeek-R1-Distill-Qwen-32B es un modelo denso del mismo rango de tamaño, pero sin capacidades MoE. La diferencia principal de este modelo es el procesamiento Genesis, que no tiene equivalente en los otros.

## Limitaciones y advertencias

- Modelo experimental: el algoritmo Genesis es un metodo no validado academicamente y desarrollado por un unico autor. No hay garantias de que el proceso de "reparacion de señal" no introduzca artefactos o degradaciones inesperadas.
- Sin benchmarks publicados: no se puede evaluar objetivamente el rendimiento frente a otros modelos. Las afirmaciones del autor sobre mejora de estabilidad no estan respaldadas por metricas.
- Riesgo de alucinacion: el autor menciona que el ruido en los tensores contribuye a las alucinaciones, pero no hay evidencia de que este modelo las elimine por completo.
- Sesgos desconocidos: al derivar de Qwen3.5 y Ornith, puede heredar sesgos de esos modelos, pero no hay documentacion al respecto.
- Soporte limitado: el autor es un unico desarrollador que trabaja en Google Colab. No hay garantia de mantenimiento continuado.
- Compatibilidad: el modelo requiere configuraciones especificas (system prompts, parametros de sampling) para un rendimiento optimo, lo que complica su uso en produccion.
- Licencia MIT: aunque permisiva, el modelo base Ornith tiene su propia licencia que debe verificarse para uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LuffyTheFox/Ornith1.5-35B-A3B-Genesis-Hermes-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Cuantizaciones base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Finetune Hermes original: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio DGX Spark: https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantizacion: https://pastebin.com/hXhcMJn9
