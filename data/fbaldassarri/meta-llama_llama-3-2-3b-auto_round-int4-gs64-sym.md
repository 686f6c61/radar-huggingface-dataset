# fbaldassarri/meta-llama_Llama-3.2-3B-auto_round-int4-gs64-sym

## Resumen

Este modelo es una versión cuantizada a 4 bits (INT4) del modelo Llama 3.2 3B de Meta, generada por fbaldassarri mediante el framework Intel AutoRound (algoritmo SignRound). La cuantización es de tipo weights-only (WoQ), con group size de 64 y cuantización simétrica, lo que reduce el tamaño del modelo a aproximadamente un cuarto del original y acelera la inferencia entre 2 y 3 veces, con una pérdida de precisión leve según el autor. Está orientado específicamente a la ejecución en hardware Intel: CPU, iGPU (Arc) mediante intel-extension-for-pytorch, y NPU (AI Boost en Core Ultra) vía OpenVINO.

Al tratarse de una cuantización del modelo base (no instruct), conserva la arquitectura transformer decoder-only de Llama 3.2 3B, con una ventana de contexto de 128K tokens y soporte multilingüe para ocho idiomas. Su relevancia radica en permitir desplegar un modelo de 3.2B parámetros en entornos con recursos limitados, como portátiles, mini-PCs o dispositivos edge, sin necesidad de GPU dedicada. El repositorio incluye una receta de reproducción completa y los parámetros exactos de calibración utilizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B) |
| Parametros totales | 3.2B (modelo base); 796.044.288 en el archivo safetensors cuantizado (INT4 empaquetado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | INT4, group size 64, simetrica (W4G64) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (transformers), compatible con OpenVINO |

## Arquitectura y entrenamiento

El modelo es una cuantización weights-only del Llama 3.2 3B original, que emplea una arquitectura transformer causal decoder-only con 28 capas, 8 cabezas de atención y atención de ventana deslizante (sliding window) en las capas intermedias. No se ha realizado ningún entrenamiento adicional; el proceso consiste en ajustar los pesos del modelo original mediante el algoritmo SignRound de Intel AutoRound, que optimiza la redondez de los pesos cuantizados para minimizar la pérdida de precisión.

La calibración se realizó en CPU con 128 muestras, 200 iteraciones de ajuste, una longitud de secuencia de 512 tokens y un batch size de 4, usando torch en bfloat16. El proceso completo tardó aproximadamente 339 minutos. No se aplicaron técnicas como RLHF, DPO ni fine-tuning; el modelo conserva exactamente las capacidades del modelo base, solo con los pesos cuantizados.

## Capacidades

- Generacion de texto por completado: al ser un modelo base, responde a prompts de texto libre generando continuaciones coherentes en los ocho idiomas soportados.
- Razonamiento y conocimiento general: hereda las capacidades del Llama 3.2 3B original, incluyendo razonamiento básico, conocimiento factual y comprension lectora, aunque con una ligera degradacion por la cuantizacion.
- Multilingue: soporta ingles, aleman, frances, italiano, portugues, hindi, español y tailandes.
- Sin soporte de tool calling ni agentes: al no ser un modelo instruct, no incluye funciones de llamada a herramientas ni razonamiento multi-paso guiado.
- Sin capacidades multimodales: no procesa vision, audio ni otros formatos; solo texto.

## Casos de uso

- Inferencia en CPU de bajo consumo: ideal para portatiles sin GPU dedicada o mini-PCs, donde el modelo puede ejecutarse con 2-3 GB de RAM gracias a la cuantizacion INT4, generando texto a una velocidad aceptable para prototipos y aplicaciones locales.
- Despliegue en dispositivos edge con Intel NPU: gracias a la compatibilidad con OpenVINO, puede ejecutarse en procesadores Core Ultra (AI Boost) para aplicaciones de generacion de texto offline, como asistentes personales o resumen de documentos.
- Generacion de texto en entornos con restricciones de memoria: por ejemplo, en contenedores Docker con limites de RAM de 4 GB, donde el modelo original no cabria, esta version cuantizada permite ejecutar un LLM de 3.2B sin necesidad de GPU.
- Prototipado rapido de aplicaciones de completado: desarrolladores que necesitan probar ideas con un modelo de tamaño medio pueden usar este checkpoint con transformers para generar continuaciones de codigo, prosa o datos sinteticos.
- Educacion e investigacion: sirve como ejemplo de cuantizacion WoQ con AutoRound, permitiendo estudiar el impacto de la cuantizacion INT4 en la calidad de generacion y comparar con el modelo original.
- Aplicaciones de chat simples con prompting: aunque no es instruct, se puede usar con plantillas de prompt para construir chatbots basicos que respondan a preguntas frecuentes o generen respuestas en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una "ligera perdida de precision" a W4G64 y una aceleracion de 2-3 veces, pero no proporciona metricas concretas (MMLU, HumanEval, GSM8K, etc.). Se recomienda evaluar el modelo en el caso de uso especifico antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1.6 GB para los pesos (3.2B parametros x 4 bits), mas overhead de activaciones y KV cache; en la practica se recomiendan 2-3 GB de RAM/VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, Arc A380) para inferencia con transformers; tambien funciona en CPU con 8 GB de RAM.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama de entrada y en iGPU Intel Arc.
- Opciones de despliegue: transformers (con device_map="auto"), vLLM (si se convierte a formato compatible), OpenVINO para Intel CPU/iGPU/NPU, y llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponibles; el autor indica una aceleracion de 2-3 veces respecto al modelo original en INT8/FP16, pero sin cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama 3.2 3B (original) | 3.2B | 128K | FP16/BF16 | Llama 3.2 | HuggingFace |
| Este modelo (INT4) | 3.2B (base) | 128K | INT4 W4G64 | Llama 3.2 | HuggingFace |
| Qwen2.5 3B | 3.1B | 32K | FP16/BF16 | Apache 2.0 | HuggingFace |
| Gemma 2 2B | 2.6B | 8K | FP16/BF16 | Gemma License | HuggingFace |

La principal diferencia frente a los modelos base es el tamaño en disco y la velocidad en CPU: este checkpoint INT4 ocupa ~1.6 GB frente a los ~6 GB del original en BF16. Frente a Qwen2.5 3B o Gemma 2 2B, la ventaja es la ventana de contexto de 128K y el soporte multilingue, aunque la licencia Llama 3.2 es mas restrictiva que Apache 2.0. No se dispone de comparativas de rendimiento numerico.

## Limitaciones y advertencias

- Modelo base, no instruct: no sigue instrucciones de forma nativa; requiere ingenieria de prompt para tareas dirigidas, y no soporta tool calling ni agentes.
- Degradacion por cuantizacion: la cuantizacion INT4 con group size 64 puede provocar una perdida de precision notable en tareas de razonamiento complejo o generacion de codigo, aunque el autor la califica de "ligera".
- Sesgos del modelo base: hereda los sesgos y limitaciones del Llama 3.2 3B original, incluyendo posibles sesgos de genero, raza o idioma, y riesgo de alucinaciones en temas factuales.
- Restricciones de licencia: la Llama 3.2 Community License exige aceptar los terminos de Meta, limita el uso comercial para empresas con mas de 700 millones de usuarios mensuales, y prohibe ciertos usos de alto riesgo.
- Soporte limitado de idiomas: aunque el modelo base soporta mas idiomas, la model card solo lista ocho; el rendimiento en otros idiomas no esta garantizado.
- Sin garantia: el autor declara que el modelo se desarrolla solo con fines de investigacion y no ofrece soporte ni garantia para produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.2-3B-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Framework Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de reproduccion: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
