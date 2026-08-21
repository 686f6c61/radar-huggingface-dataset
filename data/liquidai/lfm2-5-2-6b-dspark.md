# LiquidAI/LFM2.5-2.6B-DSpark

## Resumen

LFM2.5-2.6B-DSpark es un modelo auxiliar de decodificación especulativa (draft model) desarrollado por Liquid AI para acelerar la inferencia del modelo objetivo LFM2.5-2.6B. En lugar de ser un modelo de generación autónomo, actúa como un "borrador" que propone bloques de tokens que el modelo objetivo verifica, logrando una aceleración media de 2,67x en una GPU H100 y de 2,27x en un Apple M4 Max, sin alterar la calidad de las salidas. La decodificación especulativa es exacta: el modelo objetivo valida cada token propuesto, por lo que el texto generado es byte a byte idéntico al que produciría el modelo objetivo sin el drafter.

Con solo 327,7 millones de parámetros (BF16), este drafter emplea una arquitectura ligera de 5 capas de atención completa con cabezas Markov y de confianza, y un tamaño de bloque de 9 tokens. Su relevancia actual radica en que permite ejecutar modelos de 2.6B en hardware limitado (incluido Apple silicon) con un aumento mínimo de memoria, acercando la inferencia de alta velocidad a entornos on-device y reduciendo costes de GPU en producción. Está disponible bajo la licencia propietaria lfm1.0 y se integra con SGLang y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 5 capas de atención completa, GQA (32 cabezas de atención, 8 cabezas clave/valor, head_dim=64), hidden_size=2048, intermediate_size=6144 con SiLU/SwiGLU, cabezas Markov (rank 256) y de confianza, block size 9 |
| Parametros totales | 327.707.521 (327,7M en BF16) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (nativo); otras cuantizaciones no documentadas |
| Idiomas soportados | No disponibles |
| Licencia | lfm1.0 (licencia propietaria de Liquid AI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LFM2.5-2.6B-DSpark es un drafter basado en el algoritmo DSpark, diseñado específicamente para el modelo objetivo LFM2.5-2.6B. Su arquitectura es un transformer ligero de 5 capas de atención completa, con un tamaño oculto de 2048 y una capa intermedia de 6144 con activación SiLU/SwiGLU. Emplea atención multi-cabeza con consulta agrupada (GQA) con 32 cabezas de atención y 8 cabezas clave/valor, y un tamaño de cabeza de 64. Además, incorpora dos cabezas adicionales: una cabeza Markov de rango 256, que modela dependencias de orden superior entre tokens, y una cabeza de confianza que estima la probabilidad de aceptación de cada token propuesto. El tamaño de bloque de propuesta es de 9 tokens, lo que significa que el drafter genera hasta 9 tokens por paso que el modelo objetivo verifica en paralelo.

No se han publicado detalles sobre el proceso de entrenamiento del drafter, como el número de tokens, la composición del dataset o el método de optimización. La model card solo indica que se adapta el algoritmo DSpark a la arquitectura LFM2.5. La integración con SGLang requiere un build con soporte DSpark (PR #31041) y también es compatible con llama.cpp, según el blog de Liquid AI. La decodificación especulativa es exacta: el modelo objetivo verifica cada token propuesto, por lo que la distribución de salida es idéntica a la del modelo objetivo sin drafter.

## Capacidades

- Aceleración de la decodificación autoregresiva del modelo objetivo LFM2.5-2.6B mediante propuesta de bloques de tokens y verificación paralela.
- Mantenimiento exacto de la calidad de salida: el texto generado es idéntico al que produciría el modelo objetivo sin el drafter, bajo decodificación greedy.
- Soporte de ejecución en GPU (H100, entre otras) a través de SGLang con el algoritmo DSPARK.
- Ejecución on-device en Apple silicon (M4 Max) mediante el backend Metal, también con SGLang.
- Compatibilidad con llama.cpp (según el blog de Liquid AI), lo que amplía las opciones de despliegue.
- No es un modelo de generación autónoma: no ofrece capacidades propias de tool calling, razonamiento multi-paso, visión o audio. Su única función es acelerar la inferencia del modelo objetivo.

## Casos de uso

- Inferencia en tiempo real en producción: en servicios de chat o asistentes conversacionales que usan LFM2.5-2.6B, el drafter reduce la latencia de decodificación, permitiendo respuestas más rápidas sin cambiar la calidad. Por ejemplo, en un H100 se pasa de 323 a 864 tokens por segundo de media.
- Despliegue en dispositivos edge: gracias a su pequeño tamaño (327M parámetros) y al soporte Metal, se puede ejecutar en MacBooks con Apple silicon, logrando una aceleración de 2,27x (de 61 a 139 tok/s de media). Esto habilita agentes on-device con privacidad y sin dependencia de la nube.
- Reducción de costes de GPU: al acelerar la decodificación, un mismo servidor puede atender más peticiones concurrentes o se pueden utilizar GPUs más pequeñas, reduciendo el coste por inferencia.
- Procesamiento por lotes de alta concurrencia: en pipelines de generación masiva (por ejemplo, síntesis de documentos o aumento de datos), el mayor throughput permite completar más tareas en el mismo tiempo.
- Generación de código en entornos de desarrollo: en benchmarks como HumanEval y MBPP, el drafter logra speedups de 2,56x y 2,64x respectivamente en H100, lo que acelera la iteración en asistentes de programación.
- Razonamiento matemático y resolución de problemas: en tareas como MATH-500 y GSM8K, con speedups de 3,06x y 2,22x en H100, es útil para aplicaciones educativas o de análisis que requieren respuestas largas y detalladas.
- Evaluación y pruebas de modelos: al ser exacto, permite acelerar la ejecución de suites de benchmarks sobre el modelo objetivo sin sesgar los resultados, útil para equipos de investigación y control de calidad.

## Benchmarks y rendimiento

El modelo no tiene benchmarks de calidad propios, ya que su función es acelerar la decodificación sin alterar las salidas. Los resultados de rendimiento se expresan en términos de tokens aceptados por paso y speedup de decodificación. Las siguientes tablas recogen los datos publicados en la model card.

### Acceptance media (tokens aceptados por paso de decodificación, de un máximo de 10)

| Benchmark | 1xH100 (SGLang) | Apple M4 Max (Metal) |
|---|---:|---:|
| MATH-500 | 5,67 | 4,45 |
| GSM8K | 4,32 | 4,91 |
| HumanEval | 4,54 | 5,24 |
| MBPP | 4,92 | 4,19 |
| MT-Bench | 4,69 | 3,33 |
| **Media** | **4,83** | **4,42** |

### Speedup de decodificación y throughput

| Dataset | Acceptance (de 10) | Speedup en H100 | Speedup en M4 Max |
| :--- | :--- | :--- | :--- |
| MATH-500 | 5,42 | **3,06x** (326 → 1000 tok/s) | **2,25x** (61 → 137 tok/s) |
| HumanEval | 4,54 | **2,56x** (326 → 835 tok/s) | **2,63x** (61 → 161 tok/s) |
| MBPP | 4,71 | **2,64x** (326 → 861 tok/s) | **2,11x** (62 → 132 tok/s) |
| GSM8K | 4,32 | **2,22x** (312 → 693 tok/s) | **2,36x** (60 → 143 tok/s) |
| MT-Bench | 5,07 | **2,87x** (325 → 933 tok/s) | **1,99x** (62 → 123 tok/s) |
| **Media** | 4,81 | **2,67x** (323 → 864 tok/s) | **2,27x** (61 → 139 tok/s) |

Estos datos se obtuvieron con batch size 1 y decodificación greedy. El blog de Liquid AI reporta un speedup máximo de 3,18x en H100 y 2,87x en M4 Max en condiciones específicas.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 0,65 GB en BF16 (327,7M parámetros x 2 bytes). Se suma a la VRAM requerida por el modelo objetivo LFM2.5-2.6B (que ocupa unos 5,2 GB en BF16).
- GPU recomendadas: cualquier GPU con suficiente VRAM para el modelo objetivo. En las pruebas se utilizó una H100 (80 GB), pero el drafter es ligero y puede ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 o incluso en Apple silicon (M4 Max) mediante el backend Metal.
- En consumer GPU: sí, siempre que se disponga de VRAM para el modelo objetivo. Por ejemplo, una RTX 4090 con 24 GB puede alojar tanto el modelo base como el drafter.
- Opciones de despliegue: SGLang (con soporte DSpark, PR #31041) y llama.cpp (según el blog de Liquid AI). También se menciona el backend Metal para Apple silicon.
- Latencia y throughput: los speedups indicados en la tabla de benchmarks se refieren a la decodificación. En H100, el throughput medio pasa de 323 a 864 tok/s; en M4 Max, de 61 a 139 tok/s. La latencia por token se reduce proporcionalmente.

## Comparativa con modelos similares

El modelo pertenece a la familia LFM2.5-DSpark, que incluye drafters para otros modelos de la serie LFM2.5. La siguiente tabla compara los tres drafters publicados.

| Drafter | Parametros | Modelo objetivo | Speedup medio en H100 | Speedup medio en M4 Max |
|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-DSpark | ~300M (no confirmado) | LFM2.5-1.2B-Instruct | No disponible | No disponible |
| LFM2.5-2.6B-DSpark | 327,7M | LFM2.5-2.6B | 2,67x | 2,27x |
| LFM2.5-8B-A1B-DSpark | ~300M (no confirmado) | LFM2.5-8B-A1B (MoE) | No disponible | No disponible |

No se dispone de datos de rendimiento publicados para los otros dos drafters en la información proporcionada. En cuanto a otros métodos de decodificación especulativa (como EAGLE o Medusa), no hay comparaciones directas publicadas en las fuentes consultadas. La ventaja principal de DSpark es su integración nativa con SGLang y llama.cpp, y su capacidad de ejecución on-device en Apple silicon.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo LFM2.5-2.6B para funcionar. No puede generar texto por sí mismo.
- Dependencia de frameworks específicos: la aceleración solo está disponible con SGLang (con el PR #31041) y llama.cpp. Otros frameworks de inferencia pueden no soportar este drafter.
- Licencia propietaria lfm1.0: no es una licencia open source estándar. Es necesario revisar los términos de la licencia para uso comercial y redistribución.
- La aceleración varía según el hardware, el benchmark y el tamaño de lote. Los speedups publicados se obtuvieron con batch size 1 y decodificación greedy; en otros escenarios (por ejemplo, batch grande o sampling con temperatura) el rendimiento puede diferir.
- El tamaño de bloque fijo de 9 tokens puede no ser óptimo para todas las cargas de trabajo; en algunos casos, la tasa de aceptación podría ser menor y el speedup reducido.
- No se han publicado detalles sobre el entrenamiento del drafter, lo que limita la reproducibilidad y la comprensión de sus posibles sesgos.
- Los idiomas soportados no están documentados; se asume que hereda las capacidades del modelo objetivo, pero no hay confirmación explícita.
- La longitud de contexto no está especificada para el drafter; en la práctica, está limitada por la del modelo objetivo, pero este dato no se ha publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-2.6B-DSpark
- Modelo objetivo LFM2.5-2.6B: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Blog de Liquid AI sobre LFM2.5-DSpark: https://www.liquid.ai/blog/lfm2.5-dspark
- Blog de Hugging Face sobre LFM2.5-DSpark: https://huggingface.co/blog/LiquidAI/lfm25-dspark
- PR de SGLang con soporte DSpark: https://github.com/sgl-project/sglang/pull/31041
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
