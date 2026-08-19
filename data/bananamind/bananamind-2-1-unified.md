# BananaMind/BananaMind-2.1-Unified

## Resumen

BananaMind-2.1-Unified es un modelo de lenguaje causal decoder-only de 35 millones de parámetros, desarrollado por BananaMind como experimento de arquitectura multi-torre. Su diseño se inspira en la comunicación interhemisférica del cerebro: tres torres transformer (A, B y C) comparten una única capa de embeddings, donde la torre B actúa como relé obligatorio entre A y C, sin head de salida ni función de pérdida propia. El modelo genera el siguiente token mediante una mezcla en el espacio de probabilidades de las dos cabezas de salida de las torres exteriores.

Entrenado desde cero sobre un mix plano de 38 000 millones de tokens (compuesto por FineWeb-HQ, DCLM, SmolLM-corpus y FineMath), este modelo base no está ajustado por instrucciones y emplea un tokenizador BPE byte-level personalizado de 8192 tokens, sensible a dígitos. Con una ventana de contexto de 4096 tokens, es un modelo pequeño pensado para investigación en interpretabilidad, eficiencia y arquitecturas alternativas, más que para producción directa.

Su relevancia radica en explorar una topología de comunicación restringida entre torres, donde toda información compartida debe atravesar el relé central. Los resultados del entrenamiento muestran que las doce compuertas de puente crecieron entre 4 y 47 veces respecto a su inicialización, con un sesgo claro hacia las rondas profundas y una canalización asimétrica entre direcciones. El modelo se publica bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BananaMind21Unified three-tower relay Transformer (A, B relé, C) |
| Parametros totales | 34 999 041 |
| Parametros activos | no disponible (no es MoE; todos los parámetros se usan en cada forward) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se mencionan cuantizaciones oficiales) |
| Idiomas soportados | inglés (según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con tres torres de atención. La torre A tiene 14 capas con hidden size 256, la torre B (relé) tiene 5 capas con hidden size 320, y la torre C tiene 6 capas con hidden size 384. Las tres comparten una misma capa de embeddings de dimensión 384, pero A y B reciben una proyección lineal de entrada (384→256 y 384→320 respectivamente). Cada torre usa Grouped-Query Attention con QK norm, MLP SwiGLU, posiciones RoPE (theta=100 000) y RMSNorm (epsilon=1e-6). Las cabezas de salida son independientes: la torre A tiene una head de 2 097 152 parámetros y la torre C de 3 145 728. La distribución final es una mezcla en el espacio de probabilidades: `log p = logaddexp(log alpha + log_softmax(lm_head_a(h_a)), log(1-alpha) + log_softmax(lm_head_c(h_c)))`, donde `alpha` es un escalar por token calculado por un pequeño `mix_head` a partir de las salidas normalizadas de ambas torres.

El entrenamiento se realizó desde cero sobre 37 999 869 952 tokens (aproximadamente 38B), con un mix plano de los datasets FineWeb-HQ, DCLM-baseline-1.0, SmolLM-corpus y FineMath. El modelo es un base model, sin ajuste por RLHF ni DPO. La comunicación entre torres se organiza en tres rondas de intercambio: en cada ronda, las torres A y C leen señales de la torre B y viceversa, con puertas por canal inicializadas en 0.01 (en lugar de 0) para garantizar que el relé reciba gradiente desde el primer paso. Las puertas crecieron durante el entrenamiento, mostrando un flujo de información asimétrico: las direcciones hacia B tienen magnitudes mayores que las de salida de B, siendo `B -> C` el canal más silencioso.

## Capacidades

- Generación de texto causal en inglés, con una ventana de contexto de 4096 tokens.
- Modelo base, sin ajuste por instrucciones, por lo que no responde a prompts conversacionales directamente; requiere fine-tuning para tareas específicas.
- Soporte de tool calling y function calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base pequeño, sin capacidades específicas documentadas).
- Capacidades multilingües: solo inglés según la model card.
- Capacidades especiales: arquitectura experimental three-tower con mezcla de probabilidades; no incluye visión ni audio.
- El tokenizador personalizado de 8192 tokens es sensible a dígitos, lo que puede mejorar la representación de números en tareas matemáticas.

## Casos de uso

- Investigación en interpretabilidad de arquitecturas multi-torre: el modelo permite estudiar cómo se distribuye la información entre torres y qué papel juega el relé central, gracias a sus puertas por canal y modos de ablación (7 modos documentados: `full`, `cut_bridges`, `bypass_b`, `ab_only`, `cb_only`, `a_only`, `c_only`).
- Experimentación educativa en diseño de transformers: su pequeño tamaño (35M parámetros) y su código personalizado (`trust-remote-code`) lo hacen adecuado para cursos de arquitecturas avanzadas y para reproducir experimentos de comunicación entre torres.
- Fine-tuning para tareas de clasificación o generación de texto corto en inglés, como análisis de sentimiento, etiquetado de temas o generación de resúmenes breves, aprovechando su contexto de 4096 tokens.
- Evaluación de técnicas de cuantización y compresión: al ser un modelo pequeño y con pesos en fp32, sirve como banco de pruebas para métodos de cuantización (por ejemplo, GPTQ, AWQ, GGUF) antes de aplicarlos a modelos más grandes.
- Estudio de la influencia de la mezcla de probabilidades en la calidad de generación: el `mix_head` produce un `alpha` dependiente del token, lo que permite analizar cómo se combinan las salidas de dos torres en el espacio de probabilidades.
- Desarrollo de modelos de lenguaje compactos para entornos con recursos limitados: aunque no está pensado para producción, su tamaño permite ejecutarlo en CPU o en GPUs de baja gama, sirviendo como punto de partida para prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 34 999 041 parámetros en fp32, el peso ocupa aproximadamente 140 MB. En inferencia, con memoria adicional para activaciones y KV cache, se estima un consumo inferior a 1 GB de VRAM en GPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2060, o incluso integradas con soporte CUDA). También puede ejecutarse en CPU con RAM suficiente (menos de 1 GB para los pesos).
- En consumer GPU: sí, cabe en cualquier GPU de consumo actual, incluidas tarjetas de gama baja.
- Opciones de despliegue: al ser un modelo de transformers con arquitectura personalizada, requiere `trust_remote_code=True`. Puede desplegarse con Hugging Face Transformers, y probablemente con vLLM o TGI si se adapta, aunque no hay soporte oficial documentado. Para CPU, se podría convertir a GGUF y usar llama.cpp u Ollama, pero no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no se han publicado datos. Dado el tamaño, se espera una latencia de milisegundos por token en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada por el autor. Como referencia cualitativa, se puede situar frente a otros modelos pequeños de ~35M parámetros, como SmolLM-135M (que es mayor) o Qwen2.5-0.5B (también mayor). La tabla siguiente es orientativa y se basa en características públicas de dichos modelos, no en benchmarks:

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| BananaMind-2.1-Unified | 35M | 4096 | Three-tower relay | Apache-2.0 |
| SmolLM-135M | 135M | 2048 | Transformer estándar | Apache-2.0 |
| Qwen2.5-0.5B | 494M | 32768 | Transformer estándar | Apache-2.0 |

La comparativa directa no está disponible porque BananaMind no ha publicado resultados en tareas estándar. La arquitectura única de tres torres con relé no tiene equivalente comercial, por lo que su interés es más experimental que competitivo.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde a prompts conversacionales ni sigue instrucciones complejas; requiere fine-tuning para uso práctico.
- Idioma limitado: solo inglés documentado; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: al ser un modelo pequeño entrenado en un corpus limitado, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Sesgos conocidos: no se han documentado; sin embargo, al entrenarse con datos web filtrados (FineWeb-HQ, DCLM), puede heredar sesgos presentes en esos corpus.
- Arquitectura experimental: el código personalizado requiere `trust_remote_code=True` y puede tener problemas de compatibilidad con versiones futuras de transformers. La ausencia de cuantizaciones oficiales limita su despliegue eficiente en producción.
- Contexto limitado a 4096 tokens, lo que restringe tareas que requieren ventanas largas.
- Sin soporte de tool calling, agentes ni capacidades multimodales.
- Sin benchmarks publicados, por lo que no se puede evaluar su rendimiento relativo frente a otros modelos.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/BananaMind/BananaMind-2.1-Unified
- Colección de BananaMind en Hugging Face: https://huggingface.co/BananaMind/collections
- Modelo relacionado BananaMind-2-Mini: https://huggingface.co/BananaMind/BananaMind-2-Mini
- Repositorio BananaMindOS en GitHub: https://github.com/BananaMind/BananaMindOS
