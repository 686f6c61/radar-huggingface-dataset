# AtomicChat/Aion-1.0-Instruct-2.3B-GGUF

## Resumen

Aion-1.0-Instruct-2.3B-GGUF es la versión cuantizada en formato GGUF del modelo Aion 1.0 Instruct de 2.3B parámetros desarrollado por el Windows Applied Sciences Group de Microsoft. La cuantización corre a cargo de AtomicChat, que además ha escrito el soporte para esta arquitectura en llama.cpp mediante un parche propio (`aion-port.patch`), dado que el modelo emplea una arquitectura novedosa que el llama.cpp upstream todavía no carga. Está pensado para resumen, reescritura, question answering sobre documentos y chat conversacional, con una ventana de 32K tokens y soporte de ocho idiomas.

El modelo base destaca por su destino: según la model card de Microsoft, una versión optimizada de Aion, junto con un modelo de moderación de contenido, se convertirá en el small language model (SLM) on-device del sistema operativo Windows a finales de enero de 2027. Esto convierte a Aion en un objetivo interesante para desarrolladores que quieran anticipar el comportamiento de ese SLM en sus propias aplicaciones.

Esta ficha se centra en los archivos GGUF publicados por AtomicChat, que emplean cuantización con importance matrix (imatrix) y preservan con mayor precisión las capas sensibles del modelo (atención K/V en Q8_0, primer y último bloque un paso por encima, embedding atado entre Q5_K y Q8_0). La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 7 capas de atención completa y 21 capas de ventana deslizante (sliding window de 2.048 tokens); soporte añadido a llama.cpp mediante parche propio de AtomicChat |
| Parámetros totales | 2.288.831.488 (2,3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (32K) |
| Tipos de cuantización | BF16, Q8_0, AD-Q5_K_M, AD-Q4_K_M, AD-IQ3_S (publicados); AD-Q6_K y AD-IQ4_XS construidos pero no publicados |
| Idiomas soportados | Inglés, alemán, español, portugués, italiano, francés, chino, japonés |
| Licencia | MIT |
| Formato de pesos | GGUF (para llama.cpp); pesos originales en safetensors en el repo de Microsoft |

## Arquitectura y entrenamiento

Aion 1.0 Instruct emplea una arquitectura transformer con atención híbrida: de sus 28 capas, solo 7 mantienen atención completa sobre los 32K tokens de contexto, mientras que las 21 restantes usan una ventana deslizante de 2.048 tokens. Esta decisión reduce drásticamente el coste de la caché KV: a 32K tokens ocupa aproximadamente 1,1 GB en F16 (0,94 GB para las capas de atención completa y 0,18 GB para las de ventana deslizante). El modelo utiliza embedding atado (tied embedding), que representa el 18% de los parámetros y actúa tanto como tabla de entrada como cabeza de salida.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card de AtomicChat indica que el modelo está entrenado específicamente para resumen, reescritura, question answering sobre documentos y chat. La innovación técnica más relevante desde el punto de vista práctico es la cuantización con importance matrix implementada por AtomicChat, que mide la divergencia KL respecto a BF16 y preserva las capas sensibles (atención K/V, primer y último bloque, embedding atado) con tipos de mayor precisión.

## Capacidades

- Generación de texto conversacional multi-turno en ocho idiomas (inglés, alemán, español, portugués, italiano, francés, chino y japonés).
- Resumen de documentos y textos largos, aprovechando la ventana de 32K tokens.
- Reescritura y reformulación de texto.
- Question answering sobre documentos (document QA).
- Soporte de plantilla de chat con preámbulo de sistema que incluye la fecha actual y definición de herramientas (tools), según la model card.
- Compatible con endpoints de API (tag `endpoints_compatible`).
- No se dispone de información sobre soporte explícito de tool calling estructurado, modo thinking, visión o audio en la información proporcionada.

## Casos de uso

- Resumen de documentos largos en local: con 32K tokens de contexto y un peso de 1,58 GB en AD-Q4_K_M, el modelo puede resumir contratos, informes o actas sin enviar datos a la nube, algo crítico para sectores con requisitos de privacidad.
- Question answering sobre documentación interna: integrado en una herramienta de escritorio, permite consultar manuales técnicos o bases de conocimiento corporativas manteniendo los documentos en la máquina del usuario.
- Asistente de escritura offline: reescritura y reformulación de textos en ocho idiomas dentro de una aplicación de escritorio, sin latencia de red ni coste por token.
- Prototipado de aplicaciones que emularán el SLM de Windows: dado que una versión optimizada de Aion será el SLM on-device de Windows a finales de enero de 2027, este GGUF permite a los desarrolladores experimentar con el comportamiento del modelo antes de su integración en el sistema operativo.
- Chat conversacional en dispositivos con recursos limitados: los 1,29 GB de AD-IQ3_S permiten desplegar el modelo en equipos con poca VRAM o incluso en CPU, manteniendo un 84,1% de coincidencia en el siguiente token respecto a BF16.
- Procesamiento por lotes de textos multilingües: la combinación de ocho idiomas y bajo coste de inferencia lo hace adecuado para tareas de normalización, traducción asistida o clasificación de textos en pipelines locales.
- Base para fine-tuning con LoRA: el equipo publica un LoRA y archivos "uncensored" sobre estos mismos quants, lo que demuestra la viabilidad de adaptar el modelo a dominios específicos partiendo de esta base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card de AtomicChat sí proporciona métricas de fidelidad de cuantización medidas con `llama-perplexity` sobre un corpus neutral de 30 idiomas (80 fragmentos de 4.096 tokens), comparando cada archivo contra el GGUF BF16 de referencia en una A10 de 24 GB con llama.cpp `bafa0420` y el parche de AtomicChat:

| Archivo | Tamaño (GB) | bpw | KLD media | KLD percentil 99 | Mismo token superior |
|---|---:|---:|---:|---:|---:|
| BF16 | 4,59 | 16,0 | 0 | 0 | 100% |
| Q8_0 | 2,44 | 8,50 | 0,0029 | 0,020 | 96,6% |
| AD-Q5_K_M | 1,78 | 6,18 | 0,0062 | 0,039 | 95,1% |
| AD-Q4_K_M | 1,58 | 5,48 | 0,0131 | 0,081 | 93,0% |
| AD-IQ3_S | 1,29 | 4,49 | 0,0705 | 0,401 | 84,1% |

Como referencia, el preset `Q4_K_M` estándar de llama.cpp sin importance matrix (1,47 GB) obtiene una KLD media de 0,112 y una coincidencia del 80,4%. El AD-Q4_K_M de AtomicChat es 0,11 GB más grande y reduce la divergencia un 88%.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,6 GB para los cuantizados de 3-4 bits, 1,8 GB para AD-Q5_K_M, 2,4 GB para Q8_0 y 4,6 GB para BF16, más la caché KV (unos 1,1 GB a 32K tokens en F16).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede ejecutar los cuantizados de 4 bits; una RTX 3060 de 12 GB o superior permite contextos completos de 32K con holgura. Para BF16 se recomienda una GPU de 8 GB o más. Las métricas de cuantización se midieron en una NVIDIA A10 de 24 GB.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660 6 GB, RTX 3050 8 GB, RTX 4060 8 GB, etc.) con los archivos AD-Q4_K_M o AD-IQ3_S.
- Opciones de despliegue: llama.cpp compilado en el commit `bafa0420` con el parche `aion-port.patch` del repositorio. Upstream llama.cpp, LM Studio y Ollama no cargan Aion todavía. Se compilan los objetivos `llama-server` y `llama-cli`; en Mac, Metal está activado por defecto y no se necesita `-DGGML_CUDA=ON`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato GGUF disponible |
|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B (este) | 2,3B | 32K | 8 | MIT | Sí (AtomicChat) |
| Modelos de ~2-3B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos de ~2-3B de la familia Llama | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos de ~2-3B de la familia Gemma | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de la misma categoría, por lo que no es posible establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Soporte limitado en herramientas: upstream llama.cpp, LM Studio y Ollama no cargan Aion; es necesario compilar llama.cpp con el parche de AtomicChat, lo que añade fricción operativa y ata el despliegue a un commit concreto (`bafa0420`).
- Riesgo de alucinación: como todo modelo de 2,3B, su capacidad de razonamiento y su fiabilidad factual son limitadas; no se han publicado evaluaciones de alucinación en la información disponible.
- Sesgos: no se dispone de información sobre sesgos conocidos ni sobre el proceso de alineación del modelo base.
- Cobertura idiomática desigual: aunque declara ocho idiomas, no se han publicado métricas por idioma; el rendimiento en español, chino o japonés podría ser inferior al del inglés.
- Cuantización sin calibración parcial: el embedding atado (18% de los parámetros) se cuantiza sin importance matrix, lo que introduce cierta pérdida de fidelidad no medida por calibración.
- Contexto efectivo: solo 7 de las 28 capas mantienen atención completa sobre los 32K tokens; las 21 restantes usan ventana deslizante de 2.048 tokens, lo que puede afectar a tareas que requieran recuperar información distante en el contexto.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base en el repositorio de Microsoft antes de redistribuir pesos derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema aún incipiente, sin validación independiente de la comunidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/AtomicChat/Aion-1.0-Instruct-2.3B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Variante uncensored: https://huggingface.co/AtomicChat/Aion-1.0-Instruct-2.3B-Uncensored-GGUF
- Métricas de cuantización (dataset): https://huggingface.co/datasets/AtomicChat/Aion-1.0-Instruct-2.3B-GGUF-metrics
- Parche de soporte para llama.cpp: https://huggingface.co/AtomicChat/Aion-1.0-Instruct-2.3B-GGUF/resolve/main/aion-port.patch
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de AtomicChat: https://x.com/atomic_chat_hq
