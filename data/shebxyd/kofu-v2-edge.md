# shebxyd/kofu-v2-edge

## Resumen

Kofu 2.0 Edge (`shebxyd/kofu-v2-edge`) es un modelo de lenguaje causal decoder-only derivado de `google/gemma-2-2b-it` mediante adaptación de bajo rango (LoRA) y posterior fusión de pesos. Lo desarrolla alex minerva (usuario `shebxyd`) como parte del ecosistema Kofu Mobile, una aplicación Android con motor de inferencia nativo en C++ (NDK) orientada a ejecución 100 % local y sin conexión. El objetivo declarado es ofrecer un asistente conversacional e instruccional ligero que quepa en la memoria de un teléfono de gama media.

El modelo conserva la arquitectura Gemma 2 de 2B parámetros (2.614.341.888 parámetros totales según los pesos en safetensors) y se distribuye en dos formatos: pesos completos fusionados en BF16 (~5,2 GB) y una cuantización GGUF Q4_K_M (~1,6 GB) pensada para inferencia en dispositivos con menos de 2,5 GB de RAM. El ajuste se orienta a cuatro áreas: lógica de programación, ciberseguridad defensiva, razonamiento multidisciplinar en español y respuestas concisas para interfaces móviles.

Su relevancia actual radica en el nicho de modelos pequeños ejecutables en el propio dispositivo, donde la ventana de contexto se ha recortado deliberadamente a 512 tokens para contener el consumo de memoria. Es un modelo de autor independiente, con pocas descargas (86 en el momento de la consulta) y sin resultados de benchmarks publicados, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Gemma 2) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (ampliada respecto al base mediante empaquetado secuencial) |
| Tipos de cuantizacion | GGUF Q4_K_M; pesos completos en BF16 |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (BF16, ~5,2 GB), GGUF Q4_K_M (~1,6 GB), tokenizer.json, config.json |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-2b-it`, un transformer causal decoder-only con vocabulario de 256k tokens. Sobre esa base se aplicó LoRA con rango r=16 y alpha=32 en los módulos de atención y proyección (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), seguido de la fusión completa de los pesos adaptados en safetensors. La ventana de contexto se fijó en 512 tokens con empaquetado secuencial de ejemplos.

El conjunto de entrenamiento declarado consta de 4.800 ejemplos equilibrados y filtrados en cuatro pilares: programación y algoritmos (C++, Java, Kotlin, Python, web), ciberseguridad defensiva y principios éticos, razonamiento multidisciplinar en español (matemáticas, ciencias, historia, ética) y respuestas concisas y amables para interfaces conversacionales móviles. La model card no detalla el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO adicionales sobre el ajuste supervisado. Tampoco se documentan innovaciones técnicas más allá del ajuste LoRA y la cuantización Q4_K_M.

## Capacidades

- Generación de texto conversacional multi-turno en español e inglés, con formato de turnos Gemma (`<start_of_turn>user` / `<start_of_turn>model`).
- Asistencia en programación: C++, Java, Kotlin, Python y desarrollo web, con resolución algorítmica paso a paso según el autor.
- Explicación conceptual de ciberseguridad defensiva: vulnerabilidades, buenas prácticas de mitigación y seguridad en redes.
- Razonamiento multidisciplinar en español: matemáticas, ciencias, historia y ética formativa.
- Respuestas concisas optimizadas para baja latencia y consumo reducido de batería en móviles.
- Ejecución 100 % on-device y offline mediante el motor nativo en C++ de Kofu Mobile.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional offline en Android: integrado en la app Kofu Mobile v2.0, el modelo descarga el GGUF Q4_K_M automáticamente y mantiene conversaciones multi-turno sin conexión, con la privacidad que implica no enviar datos a servidores externos.
- Tutor de programación en movilidad: explicación de punteros en C++, resolución de algoritmos y dudas de Kotlin o Python para estudiantes que necesitan respuestas breves y paso a paso en el teléfono.
- Formación en ciberseguridad defensiva: explicación conceptual de vulnerabilidades y recomendaciones de mitigación para personal no especializado, aprovechando el pilar específico del ajuste.
- Apoyo educativo multidisciplinar en español: resolución de dudas de matemáticas, ciencias o historia en entornos con conectividad limitada, como aulas rurales o dispositivos sin datos.
- Prototipado de interfaces conversacionales embebidas: desarrolladores que necesiten un LLM de 2B parámetros con formato de turnos Gemma para validar UX en dispositivos ARM64 antes de escalar a modelos mayores.
- Aplicaciones de campo con requisitos de privacidad: asistentes en dispositivos embebidos ARM64 donde enviar consultas a la nube no es viable por regulación o por ausencia de red.
- Base para fine-tuning adicional: los pesos fusionados en safetensors permiten partir de este ajuste para especializaciones posteriores en servidor, siempre respetando los términos de Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: menos de 2,5 GB de RAM con el GGUF Q4_K_M (~1,6 GB de pesos); aproximadamente 5,2 GB para los pesos completos en BF16, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la información proporcionada; el modelo está orientado a CPU ARM64 en dispositivos Android mediante motor C++ nativo.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 6-8 GB de VRAM puede ejecutar los pesos BF16; el GGUF Q4_K_M cabe en GPUs de 4 GB o menos. No se especifican modelos concretos (RTX 4090, etc.) en la documentación.
- Opciones de despliegue: llama.cpp (formato GGUF), Transformers (safetensors), motor nativo C++ NDK de Kofu Mobile, LiteRT (según los tags del repositorio). vLLM, Ollama y TGI no se mencionan explícitamente.
- Latencia y throughput estimados: no disponible en la información proporcionada; el autor menciona optimización para baja latencia y consumo reducido de batería, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kofu 2.0 Edge (`shebxyd/kofu-v2-edge`) | 2,61B | 512 tokens | Gemma Terms of Use | Hugging Face, safetensors + GGUF |
| `google/gemma-2-2b-it` (base) | 2,61B | 8.192 tokens (según ficha oficial de Gemma 2) | Gemma Terms of Use | Hugging Face, gated |
| `shebxyd/kofu-2b-edge` (generación anterior) | no disponible | no disponible | Gemma Terms of Use | Hugging Face |

La comparación con otros modelos pequeños de la misma categoría (por ejemplo, Qwen2.5-1.5B-Instruct o Llama 3.2 1B/3B) no está disponible en la información proporcionada; no se han publicado métricas que permitan situar a Kofu 2.0 Edge frente a ellos. El dato más relevante es la reducción de contexto respecto al modelo base (512 frente a 8.192 tokens), que limita su uso en tareas de contexto largo.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (512 tokens): insuficiente para documentos largos, conversaciones extensas o pipelines con prompts grandes; el historial multi-turno se truncará pronto.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni pruebas equivalentes; el ajuste se basa en solo 4.800 ejemplos, un volumen pequeño que puede provocar sobreajuste a los estilos del dataset.
- Riesgo de alucinación inherente a un modelo de 2B parámetros, especialmente en matemáticas, fechas y datos factuales; no se documentan mecanismos de mitigación.
- Sesgos: no se documenta ningún análisis de sesgos ni de comportamiento en dominios sensibles; el corpus de ajuste es reducido y de procedencia no detallada.
- Idiomas: solo español e inglés declarados; el rendimiento fuera de esos idiomas no está garantizado.
- Licencia Gemma Terms of Use: el uso comercial está permitido bajo condiciones, pero se exige cumplir la Política de Uso Prohibido de IA Generativa de Google y mantener los avisos de atribución; el acceso al modelo está sujeto a aceptación de los términos (gated).
- Modelo no afiliado a Google: el autor declara explícitamente que no cuenta con patrocinio ni respaldo de Google LLC.
- Madurez del proyecto: 86 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni issues públicos documentados; para producción conviene evaluar su comportamiento con un conjunto de validación propio.
- El motor de inferencia de referencia (Kofu Mobile) es una app Android con código en C++; el soporte en otros entornos se limita a lo que permitan llama.cpp y Transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shebxyd/kofu-v2-edge
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Generación anterior: https://huggingface.co/shebxyd/kofu-2b-edge
- Repositorio de la app Kofu Mobile: https://github.com/Kineyo/Kofu_Mobile
- Perfil del autor: https://huggingface.co/shebxyd
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de uso prohibido de IA generativa de Google: https://policies.google.com/terms/generative-ai/use-policy
