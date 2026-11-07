# liqiangx/InnerVoice-Qwen3-4B

## Resumen

InnerVoice-Qwen3-4B es un ajuste fino supervisado (SFT) del modelo Qwen3-4B de Alibaba Qwen, desarrollado por Liqiang Xiao (usuario `liqiangx`). Su propuesta central es un asistente conversacional que "piensa mientras habla": en lugar de emitir un bloque silencioso de razonamiento seguido de la respuesta, intercala a nivel de token dos flujos legibles, una voz interna (razonamiento privado, no destinada a síntesis de voz) y una voz externa (respuesta pública, emitida en fragmentos cortos en cuanto cada afirmación es segura).

Arquitectura: parte de Qwen3-4B (transformer denso de 4.097.836.033 parámetros) al que se aplica LoRA con r=16 en todas las capas y se sustituye la FFN de la última capa decodificadora por una MoE de dos expertos (experto de pensamiento y experto de respuesta), ambos inicializados desde la FFN preentrenada. Un router de divulgación (una MLP pequeña sobre el estado oculto de la última capa) selecciona el experto por token, de modo que el modo de cada token generado es un único bit que se obtiene gratis durante la decodificación, sin tokens especiales ni controlador en tiempo de inferencia. El LoRA está fusionado en los pesos del checkpoint publicado.

El modelo es relevante porque aborda un problema práctico de los asistentes de voz y de los sistemas interactivos: la latencia percibida. Al empezar a hablar tras unos 600-1.200 tokens (frente a los más de 10.000 del modo nativo de Qwen3-4B) y emitir varios bloques públicos por problema, reduce el tiempo hasta el primer contenido útil. El checkpoint es la etapa SFT, entrenada sobre 1.550 problemas de DeepMath-103K; una etapa de RL con GRPO está en curso y no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con LoRA r=16 en todas las capas y FFN de la última capa sustituida por MoE de 2 expertos con router de divulgación por token |
| Parametros totales | 4.097.836.033 |
| Parametros activos | 2 expertos en la última capa FFN, seleccionados uno por token (no es un MoE disperso de gran escala; el resto del modelo es denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos en safetensors, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 8,2 GB), con código remoto (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo hereda el transformer decoder-only denso de Qwen3-4B. Sobre esa base se aplica LoRA con rango 16 en todas las capas y se reemplaza la FFN de la última capa por una mezcla de dos expertos: uno orientado al razonamiento interno y otro a la respuesta pública. Ambos se inicializan desde la FFN preentrenada, por lo que el cambio parte de un punto cercano al modelo original. Un router implementado como MLP pequeña sobre el estado oculto de la última capa decide, para cada posición t, qué experto genera el token t+1; esa decisión constituye el bit de modo (pensar o hablar) y se recupera en decodificación sin tokens de control. El LoRA está fusionado en los pesos, de modo que el checkpoint es un modelo plano de dos expertos por token que puede ejecutarse en cualquier motor que aloje una clase Qwen3 personalizada.

El entrenamiento es una etapa SFT sobre 1.550 problemas de DeepMath-103K, con trayectorias intercaladas de pensamiento y respuesta destiladas de Qwen3-32B en modo de esfuerzo de razonamiento alto: razonamiento privado más párrafos de solución orientados al lector, alineados por cobertura de anclas. La card indica que la etapa de RL (GRPO con recompensas de corrección, de compromiso prematuro y de aparición del primer contenido) está en progreso y no forma parte de este checkpoint. El embedding de entrada `e_think` del código de investigación se eliminó tras un ablation sin efecto apreciable.

## Capacidades

- Generación de texto y razonamiento matemático con razonamiento intercalado a nivel de token (voz interna y voz externa separadas).
- Decodificación en dos flujos: `generate_streams` devuelve `think`, `speak` e `interleaved` para interfaces de streaming.
- Divulgación progresiva: emite fragmentos públicos en cuanto cada afirmación es segura, con una media de unos 3 bloques públicos por problema en la evaluación realizada.
- Recuperación del modo por token mediante `m.moe.last_route`, sin tokens especiales.
- Compatibilidad con vLLM 0.9.x mediante plugin (`InnerVoiceQwen3ForCausalLM`) que reproduce la decodificación de transformers token a token.
- Soporte de tool calling y function calling: no disponible de forma específica; solo lo que herede de Qwen3-4B.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada; el modelo se entrenó solo en matemáticas.
- Capacidades multilingües: limitadas al inglés según la card, aunque el modelo base Qwen3-4B es multilingüe.
- Capacidades especiales: modo de pensamiento legible, política de divulgación aprendida, integración pensada para asistentes de voz (la voz interna no se envía a TTS).

## Casos de uso

- Asistentes de voz interactivos: el modelo separa el razonamiento privado del texto que se envía a TTS, de modo que el usuario escucha la respuesta en fragmentos cortos mientras el modelo sigue razonando; encaja en pipelines de speech-to-text, LLM y text-to-speech con latencia percibida baja.
- Tutoría matemática paso a paso: con la instrucción de razonar en privado y presentar la solución en párrafos cortos terminando en `Final answer: \boxed{<answer>}`, puede mostrar al estudiante solo los pasos públicos y mantener la traza interna para depuración.
- Investigación sobre políticas de divulgación: sirve como checkpoint de referencia para estudiar cuándo conviene que un modelo hable y cuándo siga pensando, con métricas FCO y AIRW definidas en el paper asociado.
- Interfaces de streaming con razonamiento visible opcional: `out["interleaved"]` permite construir una UI que muestre u oculte la voz interna según preferencia del usuario, sin cambiar el modelo.
- Evaluación de arquitecturas MoE de última capa: el router por token y el bit de modo implícito permiten experimentar con enrutado a nivel de token en modelos pequeños sin tokens de control adicionales.
- Despliegue en motores de inferencia personalizados: el plugin de vLLM y la clase de transformers permiten integrar el modelo en servicios existentes que ya sirven Qwen3, recuperando el modo desde el router.
- Generación de explicaciones con compromiso progresivo: útil en dominios donde conviene dar una respuesta parcial temprana y refinarla, siempre que el dominio sea matemático o similar al de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor en AIME 2025 (Average@4, temperatura 1,0, presupuesto de 12.000 tokens, 30 problemas por 4 muestras, ±8 puntos). La precisión se mide sobre el último `\boxed{}` del flujo público; "unfinished" indica muestras que agotaron el presupuesto.

| Modelo | AIME25 Avg@4 | Unfinished | Think tokens | FCO | Bloques públicos |
|---|---|---|---|---|---|
| Qwen3-4B base, modo thinking nativo | 0,342 | 0,617 | 10.300 | 10.301 | 0,4 |
| Qwen3-4B + SFT CoT estándar (think-then-speak, mismas 1.550 trazas de Qwen3-32B) | 0,083 | 0,008 | 1.074 | 1.047 | 1,6 |
| Qwen3-4B InnerVoice SFT, variante de investigación con e_think (no publicada) | 0,208 | 0,008 | 3.570 | 614 | 3,0 |
| Este checkpoint: InnerVoice SFT sin e_think (decodificación vLLM) | 0,158 | 0,058 | 3.094 | 1.205 | 3,7 |

El autor advierte que las cifras del paper para Qwen3-4B (Base 66,3; SxS SFT 38,3) usan un presupuesto de 32.000 tokens y otro conjunto de entrenamiento, por lo que no son directamente comparables. La diferencia de 5 puntos entre este checkpoint y la variante con `e_think` queda dentro del ruido de ±8 puntos de la evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud para un modelo denso de 4.097.836.033 parámetros, en bfloat16 los pesos ocupan aproximadamente 8,2 GB, a los que hay que sumar caché KV y activaciones.
- GPU recomendadas: no disponible de forma específica en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño de pesos en bfloat16 (unos 8,2 GB) es compatible con GPUs de consumo con 12-16 GB o más, pero el autor no lo documenta.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `torch_dtype="bfloat16"`; vLLM 0.9.x mediante el plugin `latent/vllm_plugin` (`pip install latent/vllm_plugin`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La card solo aporta métricas de comportamiento (FCO de 614-1.205 tokens y unos 3,7 bloques públicos por problema), no medidas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InnerVoice-Qwen3-4B (este) | 4.097.836.033 | no disponible | Razonamiento intercalado con MoE de divulgación en la última capa; SFT sobre 1.550 problemas de matemáticas | apache-2.0 | Hugging Face, pesos safetensors y código remoto |
| Qwen3-4B (base) | 4B | no disponible en la información recogida | Transformer denso con modo thinking nativo; modelo multilingüe con capacidades de código y matemáticas | apache-2.0 (según el modelo base) | Hugging Face, Qualcomm AI Hub, múltiples proveedores |
| Qwen3-4B + SFT CoT estándar (think-then-speak) | 4B | no disponible | Línea base del propio autor: piensa en bloque y responde al final | apache-2.0 | No publicado como checkpoint independiente en la información disponible |

La comparación relevante es interna: frente a la línea base think-then-speak entrenada con los mismos datos, InnerVoice mejora la precisión en AIME25 (0,158 frente a 0,083) y emite contenido público mucho antes (FCO de 1.205 frente a 1.047 tokens, con 3,7 bloques frente a 1,6). Frente a Qwen3-4B base, sacrifica precisión (0,158 frente a 0,342) a cambio de terminar dentro del presupuesto en el 94,2 % de las muestras frente al 38,3 % del base.

## Limitaciones y advertencias

- Entrenado solo con 1.550 problemas de matemáticas; no está ajustado para chat general más allá de lo que ya ofrece Qwen3-4B.
- La voz interna es legible y el modelo es pequeño (4B): puede contener razonamientos erróneos; debe tratarse como una transcripción, no como una garantía.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 4B con SFT específico, es esperable en dominios fuera de distribución.
- Idiomas: la card declara únicamente inglés, aunque el modelo base es multilingüe; el comportamiento multilingüe del ajuste no está documentado.
- Longitud de contexto: no disponible; la evaluación usa un presupuesto de 12.000 tokens nuevos, pero no se especifica la ventana del modelo.
- Licencia apache-2.0, que permite uso comercial, pero el modelo depende de Qwen3-4B y de código remoto con `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- El checkpoint es solo la etapa SFT; la etapa de RL con GRPO está en progreso y no se ha publicado, por lo que el rendimiento puede cambiar en versiones futuras.
- La variante de investigación con `e_think` no se ha publicado y difiere 5 puntos en AIME25, dentro del ruido de la evaluación.
- El soporte en vLLM requiere un plugin específico para vLLM 0.9.x; no hay garantía de compatibilidad con otras versiones ni con otros motores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liqiangx/InnerVoice-Qwen3-4B
- Repositorio de código, receta de datos e informe: https://github.com/lqxiao/InnerVoice
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/zwhe99/DeepMath-103K
- Paper de referencia sobre políticas de divulgación: arXiv 2605.03314, "When to Think, When to Speak: Learning Disclosure Policies for LLM Reasoning" (ICML 2026)
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Ficha de Qwen3-4B en Inferbase: https://inferbase.ai/models/qwen3-4b
