# shebxyd/kofu-gemma-2b-edge

## Resumen

Kofu Gemma 2B Edge es un ajuste fino (fine-tune) del modelo `google/gemma-2b-it` orientado a la ejecución local en dispositivos móviles Android con arquitectura ARM64. Lo desarrolla el usuario shebxyd como parte del ecosistema Kofu Mobile Assistant, una aplicación que integra un motor de inferencia nativo en C++20 con mapeo de memoria zero-copy mediante `mmap`. El objetivo es ofrecer un asistente conversacional que funcione de forma completamente offline, sin enviar datos a servidores externos.

El modelo parte de la arquitectura transformer decoder-only de Gemma 2B (2.000 millones de parámetros) y se ha especializado mediante LoRA en cuatro áreas: lógica de programación y algoritmos (C++, Java, Python, web), ciberseguridad y redes con enfoque defensivo y ético, razonamiento multidisciplinar en español (matemáticas, ciencias, historia) y respuestas concisas orientadas a interfaces móviles de baja latencia. El entrenamiento se realizó sobre aproximadamente 5.000 ejemplos de alta calidad provenientes de cuatro datasets públicos.

Su relevancia actual radica en la combinación de un modelo de tamaño reducido con un formato de cuantización GGUF Q4_K_M de aproximadamente 1,4 GB, lo que permite su ejecución en teléfonos con menos de 2,5 GB de RAM. El repositorio incluye tanto los pesos completos en safetensors (BF16, ~5 GB) como la versión cuantizada lista para `llama.cpp`, lo que facilita su despliegue tanto en entornos embebidos como en servidores para fine-tuning adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma CausalLM) |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (configurado en el ejemplo de `llama.cpp` con `-c 2048`) |
| Tipos de cuantizacion | GGUF Q4_K_M; pesos completos en BF16 |
| Idiomas soportados | Español (es), inglés (en) |
| Licencia | Gemma Terms of Use (Google) |
| Formato de pesos | Safetensors (BF16, ~5 GB), GGUF Q4_K_M (~1,4 GB), tokenizer.json, config.json |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Gemma 2B, con un vocabulario de 256.000 tokens y el formato de chat oficial de Gemma basado en turnos `<start_of_turn>` / `<end_of_turn>`. Sobre esta base se aplicó un ajuste fino mediante LoRA con rango 16, alpha 32, dropout 0,05 y módulos objetivo `q_proj`, `k_proj`, `v_proj` y `o_proj`. Los pesos resultantes se fusionaron con el modelo base para producir el `model.safetensors` en BF16.

El entrenamiento se llevó a cabo en una GPU NVIDIA Tesla T4 en Google Colab, con batch efectivo de 16 (batch por dispositivo 1 y acumulación de gradientes 16), optimizador AdamW con learning rate 2e-4 y scheduler lineal. La loss descendió de 3,11 a 1,40. Los datos de entrenamiento provienen de cuatro fuentes: `plncmm/spanish-alpaca` (conocimiento general, matemáticas, historia y valores), `Yahir/alpaca-logica-programacion` (lógica y programación), `sahil2801/CodeAlpaca-20k` (desarrollo en C++, Java, HTML y web) y `murdok1982/gemma4-programacion-seguridad` (ciberseguridad y análisis de código). No se documenta el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional e instruccional en español e inglés, con formato de chat Gemma.
- Razonamiento lógico y resolución paso a paso de problemas de programación y algoritmos en C++, Java, Python y desarrollo web.
- Análisis de ciberseguridad y redes con enfoque en buenas prácticas defensivas y principios éticos.
- Razonamiento multidisciplinar en español: matemáticas, ciencias, historia universal y ética.
- Respuestas concisas y amables optimizadas para interfaces móviles con baja latencia.
- Ejecución 100% on-device sin conexión a Internet, con integración nativa en C++20 mediante `mmap` zero-copy en la aplicación Kofu Mobile.
- Compatibilidad con `llama.cpp` (CLI e inferencia interactiva) y con la librería `transformers` de Python.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional offline en Android: el modelo se integra en la app Kofu Mobile y se descarga automáticamente el GGUF Q4_K_M (~1,4 GB) para conversar de forma privada sin conexión, aprovechando que cabe en dispositivos con menos de 2,5 GB de RAM.
- Tutor de programación en movilidad: resuelve dudas sobre punteros, estructuras de datos, stack vs. heap y algoritmos en C++, Java y Python con explicaciones paso a paso, adecuado para estudiantes que necesitan consultas rápidas sin red.
- Apoyo a la revisión de código y análisis de vulnerabilidades: el ajuste sobre datasets de ciberseguridad permite identificar malas prácticas defensivas y explicar principios éticos de seguridad en entornos con requisitos de confidencialidad.
- Asistente educativo multidisciplinar en español: responde preguntas de matemáticas, ciencias e historia con respuestas concisas, útil en aplicaciones de estudio para dispositivos de gama baja.
- Despliegue en dispositivos embebidos ARM64: gracias al motor C++ nativo y al formato GGUF, puede integrarse en hardware con recursos limitados donde no es viable ejecutar modelos mayores.
- Base para fine-tuning adicional en servidor: los pesos completos en safetensors (BF16, ~5 GB) permiten continuar el ajuste con LoRA sobre dominios específicos antes de recuantizar a GGUF para despliegue móvil.
- Prototipado rápido con `llama.cpp` en terminal: útil para validar prompts y comportamiento conversacional en CPU antes de integrar el modelo en la aplicación final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~1,4 GB con cuantización Q4_K_M (recomendado para móvil, RAM < 2,5 GB); ~5 GB con pesos completos en BF16.
- GPU recomendadas: no se especifican en la documentación. El entrenamiento se realizó en una NVIDIA Tesla T4 (Google Colab), pero no se documentan requisitos de inferencia en GPU.
- Compatibilidad con GPU de consumo: no documentada explícitamente; el formato GGUF Q4_K_M está pensado para ejecución en CPU/ARM64 y cabe en la mayoría de GPU de consumo modernas con 4 GB o más de VRAM.
- Opciones de despliegue: `llama.cpp` (CLI e inferencia interactiva), `transformers` con PyTorch (BF16, `device_map="auto"`), motor nativo C++20 NDK en la app Kofu Mobile.
- Latencia y throughput: no disponibles en la información proporcionada. El autor menciona "baja latencia y consumo ultra-reducido de batería" como objetivo de diseño, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kofu Gemma 2B Edge | 2B | 2.048 tokens | es, en | Gemma Terms | Safetensors, GGUF Q4_K_M | Fine-tune de Gemma 2B-it con LoRA, orientado a Android ARM64 |
| google/gemma-2b-it | 2B | 8.192 tokens (según ficha oficial de Gemma 2B) | multilingüe | Gemma Terms | Safetensors | Modelo base sin especialización; contexto mayor que el configurado en el ejemplo del fine-tune |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | multilingüe | Apache 2.0 | Safetensors, GGUF | Alternativa de tamaño similar con licencia permisiva y contexto amplio |
| Phi-3-mini (3,8B) | 3,8B | 4.096 tokens | multilingüe | MIT | Safetensors, GGUF | Algo mayor; requiere más recursos pero con licencia más permisiva |

Nota: los datos de los modelos comparativos provienen de sus fichas públicas oficiales; no se dispone de benchmarks comparativos directos con Kofu Gemma 2B Edge en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 2B parámetros: capacidad de razonamiento y conocimiento factual limitada en comparación con modelos de mayor tamaño; riesgo elevado de alucinación en temas especializados fuera de los datasets de entrenamiento.
- Contexto efectivo de 2.048 tokens según la configuración de ejemplo; conversaciones largas o documentos extensos pueden truncarse o perder coherencia.
- Entrenamiento con ~5.000 ejemplos: el ajuste es ligero y puede no generalizar bien fuera de los dominios cubiertos (programación, ciberseguridad, conocimiento general en español).
- Idiomas limitados a español e inglés; el rendimiento en otros idiomas no está garantizado.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos antes de desplegar en producción.
- El modelo se distribuye con `inference: false` en la model card y sin benchmarks publicados; el rendimiento real no está validado de forma independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Posibles sesgos heredados de los datasets de entrenamiento (Alpaca, CodeAlpaca) y del modelo base Gemma 2B-it, no evaluados en la documentación.
- La integración principal está pensada para la app Kofu Mobile; el soporte en otros entornos (vLLM, TGI) no está documentado.

## Enlaces

- HuggingFace: https://huggingface.co/shebxyd/kofu-gemma-2b-edge
- Modelo base: https://huggingface.co/google/gemma-2b-it
- Repositorio Kofu Mobile: https://github.com/Kineyo/Kofu_Mobile
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Dataset spanish-alpaca: https://huggingface.co/datasets/plncmm/spanish-alpaca
- Dataset alpaca-logica-programacion: https://huggingface.co/datasets/Yahir/alpaca-logica-programacion
- Dataset CodeAlpaca-20k: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
- Dataset gemma4-programacion-seguridad: https://huggingface.co/datasets/murdok1982/gemma4-programacion-seguridad
