# Menterium/translategemma-4b-it-GGUF

## Resumen

TranslateGemma 4B es un modelo de traducción automática desarrollado por Google, construido sobre la arquitectura Gemma 3 y especializado en traducción entre 55 idiomas. Este repositorio concreto, publicado por Menterium, contiene una conversión a formato GGUF del componente de texto del modelo original `google/translategemma-4b-it`, pensada para su uso con llama.cpp y clientes derivados en entornos locales y completamente offline sin necesidad de conexión a servicios en la nube.

El modelo cuenta con 3.880.263.168 parámetros (aproximadamente 3,9 mil millones) y se distribuye en dos cuantizaciones: Q8_0 (4,13 GB) y Q4_K_M (2,49 GB). La conversión se realizó con llama.cpp b10221 y extrae únicamente el decodificador de texto, descartando la torre de visión del checkpoint multimodal original. Esto lo convierte en una herramienta ligera y práctica para traducción de documentos completos en infraestructura propia.

Su relevancia actual radica en la combinación de un modelo especializado en traducción de Google con un formato de despliegue abierto y eficiente como GGUF, lo que permite ejecutar traducción de calidad en hardware de consumo, sin dependencia de APIs externas y con soporte para textos largos gracias al manejo correcto de la ventana deslizante de 1024 tokens por parte de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), componente de texto extraído del checkpoint multimodal |
| Parametros totales | 3.880.263.168 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana deslizante de 1024 tokens (configurada en config.json y aplicada por llama.cpp) |
| Tipos de cuantizacion | Q8_0 (4,13 GB) y Q4_K_M (2,49 GB) |
| Idiomas soportados | 55 idiomas según el modelo base; la model card de Menterium lista de, en, es, fr, it, pt, nl, pl |
| Licencia | Gemma Terms of Use (ai.google.dev/gemma/terms) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 de Google, un transformer decoder-only con atención por ventana deslizante de 1024 tokens y dos embeddings rotatorios (rotary embeddings) tomados sin modificar del `config.json` original. El checkpoint base `google/translategemma-4b-it` es multimodal, pero esta conversión GGUF extrae exclusivamente el decodificador de texto mediante `convert_hf_to_gguf.py`, descartando la torre de visión. La conversión se realizó en bf16 y posteriormente se cuantizó con `llama-quantize` con ajustes por defecto, incluyendo la cuantización de los tensores de salida y embedding.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base está especializado en traducción y soporta 55 idiomas según la documentación de Google. Una innovación práctica destacable de esta conversión es que llama.cpp aplica correctamente la ventana deslizante, permitiendo traducir documentos completos en una sola pieza (hasta 1.757 tokens verificados con prompt más traducción), mientras que las builds DirectML de Gemma 3 tienden a entrar en bucle o perder texto más allá de 1024 tokens.

## Capacidades

- Traducción automática entre 55 idiomas, con especialización específica en la tarea de traducción.
- Traducción de documentos completos en una sola pasada gracias al manejo correcto de la ventana deslizante por parte de llama.cpp (verificado hasta 1.757 tokens con prompt incluido).
- Generación de texto conversacional en formato de turnos Gemma (`<start_of_turn>user` / `<start_of_turn>model`).
- Funcionamiento completamente offline y local, sin dependencia de APIs externas.
- Soporte de cuantizaciones ligeras (Q4_K_M de 2,49 GB) para ejecución en CPU y GPUs con poca memoria.
- No incluye capacidades de visión (la torre de visión fue descartada en la conversión).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta modo thinking ni capacidades de audio en la información disponible.

## Casos de uso

- Traducción de documentos completos offline: el modelo puede procesar textos largos en una sola pasada (hasta 1.757 tokens verificados con prompt incluido) gracias a que llama.cpp aplica la ventana deslizante de 1024 tokens correctamente, lo que permite traducir artículos, informes o correos extensos sin fragmentación manual.
- Traducción integrada en aplicaciones de escritorio: la cuantización Q4_K_M (2,49 GB) permite incrustar el modelo en clientes de escritorio basados en llama.cpp, como Celerando, ofreciendo traducción local sin conexión y con latencia de aproximadamente 3 segundos por frase corta en 8 núcleos de CPU.
- Procesamiento por lotes en servidores sin GPU: con Q4_K_M en CPU se obtiene un rendimiento aceptable (unos 3 s por frase corta en 8 núcleos), adecuado para pipelines de traducción masiva de correos, tickets o documentación interna donde no se dispone de aceleradores.
- Traducción en entornos con requisitos de privacidad: al ejecutarse completamente offline, el modelo es adecuado para traducir documentos confidenciales (legal, sanitario, financiero) sin que el texto salga de la infraestructura propia.
- Traducción multilingüe en atención al cliente: con soporte para idiomas como alemán, inglés, español, francés, italiano, portugués, neerlandés y polaco (y hasta 55 idiomas según el modelo base), puede gestionar la traducción de conversaciones multi-turno en sistemas de soporte.
- Traducción en GPUs de consumo: la cuantización Q8_0 (4,13 GB) está pensada para GPU con Vulkan, CUDA o Metal, permitiendo traducción de mayor calidad (coincide con bf16 en 71 de 74 frases de prueba) en equipos con GPU de gama media.
- Traducción de documentación técnica y software: el modelo puede integrarse en flujos de localización para traducir cadenas de interfaz, manuales y documentación, con la ventaja de que la Q8_0 mantiene una fidelidad muy alta respecto al modelo original en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona datos de fidelidad de cuantización y latencia:

| Metrica | Q8_0 | Q4_K_M |
|---|---|---|
| Coincidencia con bf16 (74 frases de prueba, greedy, repetition penalty 1.1) | 71 de 74 | 47 de 74 |
| Tamano del archivo | 4,13 GB | 2,49 GB |
| Latencia en 8 nucleos de CPU (frase corta) | ~5 s | ~3 s |
| Uso previsto | GPU (Vulkan, CUDA, Metal) | CPU y GPUs con poca memoria |

Las diferencias respecto a bf16 se atribuyen a elecciones de palabras del modelo de 4B, no a errores sistemáticos de la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB para Q8_0 y unos 3 GB para Q4_K_M, considerando pesos más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q8_0 (RTX 3060, RTX 4060, RTX 4090, A100, H100); Q4_K_M puede ejecutarse en GPUs con 4 GB o menos.
- Cabe en GPU de consumo: sí, tanto Q8_0 como Q4_K_M caben en GPUs de consumo modernas; Q4_K_M incluso en equipos con poca memoria gráfica.
- Opciones de despliegue: llama.cpp y cualquier cliente basado en él (por ejemplo, Celerando); compatible con backends Vulkan, CUDA, Metal y CPU.
- Latencia y throughput: en 8 núcleos de CPU, Q4_K_M tarda unos 3 segundos por frase corta y Q8_0 unos 5 segundos; en GPU la latencia será considerablemente menor, aunque no se proporcionan cifras concretas.
- Almacenamiento: el repositorio completo ocupa 6,6 GB; cada archivo GGUF individual pesa 4,13 GB (Q8_0) o 2,49 GB (Q4_K_M).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| TranslateGemma 4B (este GGUF) | 3,88 B | Ventana deslizante 1024 tokens | 55 (modelo base) | Gemma Terms of Use | GGUF | Especializado en traducción, offline |
| google/translategemma-4b-it (original) | 3,88 B (texto) + torre de visión | Ventana deslizante 1024 tokens | 55 | Gemma Terms of Use | safetensors | Checkpoint multimodal completo |
| Gemma 3 4B (modelo general) | ~4 B | 128K tokens (configuración típica de Gemma 3) | Multilingüe | Gemma Terms of Use | safetensors, GGUF | Propósito general, no especializado en traducción |

No se dispone de datos de benchmarks comparativos con otros modelos de traducción en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Alucinación: como todo modelo generativo, puede producir traducciones plausibles pero incorrectas, especialmente en frases ambiguas o con terminología especializada; se recomienda revisión humana en contextos críticos.
- Diferencias de cuantización: Q4_K_M solo coincide con bf16 en 47 de 74 frases de prueba, por lo que para aplicaciones sensibles a la fidelidad se recomienda Q8_0.
- Ventana de contexto limitada: la ventana deslizante es de 1024 tokens; aunque llama.cpp permite procesar textos más largos (verificado hasta 1.757 tokens), no es un modelo adecuado para contextos muy extensos.
- Sin capacidades de visión: la torre de visión del checkpoint original fue descartada, por lo que no puede procesar imágenes.
- Idiomas: aunque el modelo base soporta 55 idiomas, la model card de esta conversión solo lista explícitamente de, en, es, fr, it, pt, nl y pl; el rendimiento en otros idiomas no está documentado.
- Licencia: el uso está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que se aplican a todos los usuarios downstream y a cualquier redistribución; es imprescindible revisar las restricciones antes de un uso comercial.
- Formato de prompt: requiere `<bos>` al inicio (llama.cpp lo añade si el tokenizador tiene BOS habilitado; no debe añadirse dos veces) y el formato de turnos Gemma; un formato incorrecto degrada la calidad de la traducción.
- Builds DirectML: se advierte que las builds DirectML de Gemma 3 pueden entrar en bucle o perder texto más allá de 1024 tokens, por lo que se recomienda usar la build de llama.cpp indicada (b10221 o superior).
- Repositorio con pocas descargas (75) y sin likes, lo que limita la validación comunitaria de esta conversión concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Menterium/translategemma-4b-it-GGUF
- Modelo base: https://huggingface.co/google/translategemma-4b-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Cliente Celerando (Menterium): https://celerando.menterium.com
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
