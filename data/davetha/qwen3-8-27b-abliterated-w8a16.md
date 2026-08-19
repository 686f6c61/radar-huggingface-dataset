# davetha/Qwen3.8-27B-abliterated-W8A16

## Resumen

El modelo `davetha/Qwen3.8-27B-abliterated-W8A16` es una cuantización INT8 (W8A16) del modelo `Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16`, que a su vez es un derivado "abliterated" del modelo `Qwen/Qwen3.8-27B` de Alibaba. El autor, davetha, ha producido y verificado esta versión en hardware AMD (2x MI210, arquitectura gfx90a/CDNA2) con el objetivo de reducir el uso de memoria y acelerar la inferencia manteniendo la calidad del modelo original. La cuantización es solo de pesos (weight-only), con grupo de 128 y simetría, sin cuantizar activaciones, lo que simplifica el proceso y evita la necesidad de datos de calibración.

El modelo base presenta una arquitectura híbrida con 48 capas de atención lineal (GDN) y 16 capas de atención completa, con un intervalo de atención completa de 4. Solo 16 de las 64 capas mantienen caché KV, lo que reduce el coste del contexto largo. Con 27.356 millones de parámetros y una ventana de contexto de 131072 tokens (según el comando de vLLM recomendado), este modelo es relevante para despliegues en entornos con GPUs AMD y para aplicaciones que requieren razonamiento, generación de código y tool calling, todo bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas linear_attention (GDN) + 16 capas full_attention, full_attention_interval=4 |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131072 tokens (128K, según configuración de vLLM) |
| Tipos de cuantizacion | W8A16 (pesos int8, activaciones BF16), group size 128, simétrico, weight-only |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint abliterated de Qwen3.8-27B, no un entrenamiento desde cero. La arquitectura híbrida combina 48 capas de atención lineal (GDN) y 16 capas de atención completa, con `full_attention_interval: 4`. Solo 16 de las 64 capas mantienen caché KV, lo que reduce el coste de memoria para contextos largos. De los 985 módulos totales, 256 se cuantizan a int8: los MLP (`gate`, `up`, `down_proj`) de las 64 capas y las proyecciones `q`, `k`, `v`, `o` de las 16 capas de atención completa. Los 729 módulos restantes se mantienen en BF16, incluyendo las capas de atención lineal (GDN), la torre de visión, las normas, el `lm_head` y los embeddings. El módulo MTP (draft head) se conserva íntegro en BF16 para permitir decodificación especulativa.

La cuantización se realizó con `llm-compressor` 0.12.1a20260701 usando `QuantizationModifier` (round-to-nearest) y no requirió datos de calibración, ya que al ser weight-only las escalas se derivan directamente de los pesos. No se ha realizado ningún entrenamiento adicional ni ajuste fino.

## Capacidades

- Generación de texto y razonamiento: verificado con spot checks como `17*23` → `391` y cálculo de minutos entre horas (2:15pm–6:40pm → 265).
- Tool calling / function calling: soportado mediante el parser `qwen3_xml` en vLLM, que interpreta el formato XML `<tool_call><function=name><parameter=x>` del chat template.
- Razonamiento multi-step: compatible con el reasoning parser `qwen3` de vLLM.
- Capacidades multimodales (visión): el modelo base incluye una torre de visión (54 bloques), pero requiere cargarse con `AutoModelForImageTextToText` (clase `Qwen3_5ForConditionalGeneration`) para no perder los bloques visuales.
- Decodificación especulativa: el módulo MTP (draft head) se mantiene en BF16, lo que permite acelerar la generación.
- Contexto largo: soporta hasta 131072 tokens, con caché KV eficiente gracias a la arquitectura híbrida.
- Multilingüismo: no especificado en la información disponible, aunque el modelo base Qwen3.8 suele ser multilingüe.

## Casos de uso

- Despliegue en GPUs AMD (MI210): el modelo está verificado en 2x MI210 con ROCm, lo que lo hace adecuado para entornos que usan hardware AMD en lugar de NVIDIA.
- Generación de código con tool calling: gracias al parser `qwen3_xml`, puede integrarse en pipelines de desarrollo que requieran invocación de funciones, como asistentes de programación o agentes de automatización.
- Razonamiento matemático y lógico: los spot checks confirman precisión en operaciones aritméticas y conversiones de tiempo, útil para aplicaciones de cálculo o análisis.
- Aplicaciones de visión-lenguaje: al cargarse correctamente con `AutoModelForImageTextToText`, puede procesar imágenes y texto, por ejemplo para descripción de imágenes o respuesta a preguntas visuales.
- Asistentes conversacionales con contexto largo: la ventana de 128K permite mantener conversaciones extensas o procesar documentos largos sin perder el hilo.
- Inferencia con decodificación especulativa: el MTP intacto permite reducir la latencia en entornos de producción donde la velocidad de generación es crítica.
- Uso comercial con licencia permisiva: la licencia Apache-2.0 permite integración en productos propietarios sin restricciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se midió throughput frente al modelo BF16 base, ni se ejecutaron pruebas de perplexity o suites de benchmarks. Los únicos datos de rendimiento son los spot checks de corrección a temperatura 0 y la capacidad de caché KV: 828.616 tokens con 6,32x concurrencia a 128K (frente a 616.189 tokens y 4,70x del BF16 base). No se dispone de métricas comparativas adicionales.

## Requisitos de hardware

- Entorno verificado: 2x AMD MI210 (gfx90a/CDNA2) con vLLM 0.27.2rc0+mi210.1, tensor-parallel-size 2 y `--gpu-memory-utilization 0.85`.
- VRAM estimada: no disponible con precisión, pero el tamaño del repositorio es de 36,2 GB (incluye pesos int8 y tensores BF16). Con cuantización weight-only, los pesos ocupan aproximadamente 27,4 GB (27,36B × 1 byte), más overhead de activaciones y caché KV.
- GPU recomendadas: AMD MI210 (verificado), aunque podría funcionar en otras GPUs con ROCm o CUDA si se ajusta la configuración. No se ha probado en GPUs de consumo.
- Limitación en ROCm: `head_dim = 256` no es aceptado por el paged-attention de vLLM en gfx90a, por lo que se requiere una versión específica (0.27.2rc0+mi210.1).
- Opciones de despliegue: vLLM (comando proporcionado en la model card). No se mencionan otros frameworks como llama.cpp u Ollama.
- Latencia y throughput: no medidos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos en la información proporcionada. La siguiente tabla compara características conocidas con el modelo base BF16 abliterated:

| Modelo | Parámetros | Contexto | Cuantización | Licencia |
|---|---|---|---|---|
| davetha/Qwen3.8-27B-abliterated-W8A16 | 27,36B | 131072 | W8A16 (int8) | Apache-2.0 |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16 | 27,36B | 131072 (presumible) | BF16 | Apache-2.0 |

No se dispone de información sobre otros modelos comparables en la misma categoría (por ejemplo, otros Qwen3.8 cuantizados o modelos híbridos similares).

## Limitaciones y advertencias

- El modelo es "abliterated", lo que significa que se ha eliminado el comportamiento de rechazo habitual. Esto puede generar contenido inapropiado, ofensivo o peligroso. El usuario es responsable del uso.
- No se han realizado pruebas de perplexity ni benchmarks; la calidad no está verificada más allá de los spot checks.
- La cuantización int8 puede introducir degradación en tareas sensibles, aunque no se ha medido.
- Al cargar con `AutoModelForCausalLM` se pierden silenciosamente los 54 bloques de visión; es obligatorio usar `AutoModelForImageTextToText`.
- En ROCm, `head_dim = 256` no es compatible con el paged-attention estándar de vLLM, lo que limita el despliegue a versiones específicas.
- No se ha medido el throughput ni la latencia, por lo que no hay garantías de rendimiento en producción.
- La licencia Apache-2.0 permite uso comercial, pero el carácter abliterated puede plantear problemas éticos o legales en ciertos contextos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/davetha/Qwen3.8-27B-abliterated-W8A16
- Modelo base (BF16 abliterated): https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B (referenciado en la model card, sin URL directa en la información proporcionada)
