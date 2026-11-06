# mlx-community/LFM3-1.7B-OptiQ-4bit

## Resumen

LFM3-1.7B-OptiQ-4bit es una cuantización de precisión mixta, en formato MLX, del modelo LiquidAI/LFM3-1.7B, el primer modelo de la familia LFM3 de Liquid AI. La cuantización ha sido realizada con el toolkit OptiQ y publicada en la organización mlx-community de Hugging Face, orientada a la ejecución local en Apple Silicon sin depender de PyTorch ni de servicios en la nube.

El modelo base LFM3-1.7B emplea una arquitectura híbrida que combina convoluciones cortas con atención, incorporando sliding-window attention, y ofrece una ventana de contexto de 256k tokens. La cuantización OptiQ reduce el peso en disco de 3,5 GB (bf16) a 1,3 GB, asignando anchos de bit por capa según su sensibilidad medida: 75 de las 153 matrices de pesos permanecen a 8 bits y el resto a 4 bits.

Su relevancia actual radica en que permite ejecutar un modelo con contexto muy largo (256k), razonamiento previo a la respuesta y soporte de tool calling en hardware de consumo de Apple, con una degradación mínima respecto al modelo base e incluso mejoras frente a una cuantización uniforme a 4 bits, según los benchmarks publicados por el propio autor del quant.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm3`: híbrida de 24 capas (13 convolución corta, 5 sliding-window attention de 256 tokens, 6 atención completa) |
| Parametros totales | 1.728.801.536 (1,73 B) |
| Parametros activos | no disponible (no se indica si es MoE; la arquitectura híbrida no es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | Precisión mixta OptiQ: 75 de 153 matrices de pesos a 8 bits, resto a 4 bits; KV cache de precisión mixta (`kv_config.json`) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia propia de Liquid AI, "other") |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

LFM3 mantiene la columna vertebral híbrida característica de Liquid AI, que combina convoluciones cortas con capas de atención, y añade sliding-window attention. De las 24 capas del modelo, 13 son de convolución corta, 5 emplean atención con ventana deslizante de 256 tokens y solo 6 capas conservan atención completa con KV cache de longitud completa. Este diseño reduce drásticamente el consumo de memoria del cache KV en contextos largos.

La cuantización OptiQ es sensible a la sensibilidad: mide cuánto se altera la salida de cada capa al cuantizarla y le asigna su ancho de bit en consecuencia, tomando como referencia el modelo en bf16. El resultado es una mezcla en la que las capas más sensibles permanecen a 8 bits y el resto se cuantizan a 4 bits. Sobre los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO), no se ha publicado información en la ficha disponible. El modelo razona antes de responder por defecto (thinking mode), y Liquid recomienda muestreo con temperature 0.1, top_k 50 y repetition_penalty 1.1.

## Capacidades

- Generación de texto conversacional (pipeline text-generation) con razonamiento previo a la respuesta por defecto
- Seguimiento de instrucciones (IFEval strict: 72,6 % en el quant OptiQ)
- Generación de codigo (HumanEval pass@1: 72,6 %)
- Razonamiento matemático (GSM8K: 92,4 %)
- Conocimiento general (MMLU generativo: 77,6 %)
- Recuperación en contexto largo (HashHop: 21,0 %), aprovechando la ventana de 256k
- Tool calling / function calling: soportado en el endpoint de `optiq serve` (BFCL-V3 simple: 91,5 %)
- Prompt caching y endpoint compatible con las APIs de OpenAI y Anthropic
- Ejecución local en Apple Silicon mediante MLX

## Casos de uso

- Resumen y analisis de documentos largos: con 256k de contexto puede procesar contratos, informes o expedientes completos; la model card incluye un ejemplo de resumen de cláusulas contractuales.
- Atencion al cliente local y privada: el endpoint de `optiq serve` es compatible con OpenAI/Anthropic y soporta conversaciones multi-turno con tool calling, sin enviar datos a la nube.
- Asistentes con herramientas en dispositivo: el soporte de function calling y prompt caching permite construir agentes que consultan APIs o bases de datos directamente en un Mac.
- Generacion y revision de codigo offline: con un 72,6 % en HumanEval es util como asistente de programación integrado en editores locales.
- Razonamiento matematico y cuantitativo: el 92,4 % en GSM8K lo hace adecuado para resolver problemas aritméticos y de razonamiento paso a paso.
- Aplicaciones embebidas en apps macOS/iOS: el tamaño de 1,3 GB en disco y el formato MLX lo hacen viable para distribución dentro de aplicaciones de Apple Silicon.
- Procesamiento por lotes en hardware Apple: la ejecución sin PyTorch ni nube permite automatizar tareas de texto en flujos locales con coste de infraestructura cero.

## Benchmarks y rendimiento

Datos publicados por el autor del quant, evaluados en modo razonamiento. La referencia comparativa es una cuantización uniforme a 4 bits del mismo modelo.

| Metrica | OptiQ (precisión mixta) | Uniforme 4-bit |
|---|---:|---:|
| MMLU (generativo) | 77,6 % | 76,3 % |
| GSM8K | 92,4 % | 92,4 % |
| IFEval (strict) | 72,6 % | 66,5 % |
| BFCL-V3 simple (200 llamadas) | 91,5 % | 93,0 % |
| HumanEval (164 problemas, pass@1) | 72,6 % | 64,0 % |
| HashHop (recuperación en contexto largo) | 21,0 % | 14,0 % |
| Capability Score (media de 6) | 71,29 | 67,70 |

El quant OptiQ supera al uniforme en 3,6 puntos de media, con mejoras destacables en seguimiento de instrucciones (+6,1) y codigo (+8,6). En BFCL queda 1,5 puntos por detrás, dentro del margen de ±3,5 puntos sobre 200 llamadas. No hay comparativas publicadas frente a modelos de otras familias.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el modelo ocupa 1,3 GB en disco (frente a 3,5 GB en bf16); con el KV cache de precisión mixta, deberia funcionar con holgura en equipos Apple Silicon con 8 GB de memoria unificada para contextos moderados, y requeriria más memoria para contextos cercanos a 256k (no disponible una estimación exacta).
- GPU recomendadas: cualquier chip Apple Silicon (M1 o superior); al ser un quant MLX, no está orientado a GPU NVIDIA.
- Consumer GPU: no requiere GPU dedicada; está diseñado para ejecutarse en la GPU integrada de Apple Silicon, incluidos portátiles de consumo.
- Despliegue: `optiq serve` (endpoint compatible con OpenAI y Anthropic, con tool calling y prompt caching), o mediante `mlx-lm` en Python registrando previamente la implementación con `optiq.models.install_vendored()` (mlx-lm todavía no soporta la arquitectura LFM3 de forma nativa).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-OptiQ-4bit (este modelo) | 1,73 B | 256k | Mixta 4/8-bit (OptiQ, MLX) | lfm1.0 (other) | Hugging Face, mlx-community |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | 256k | bf16 | lfm1.0 (other) | Hugging Face, Liquid AI |
| Quant uniforme 4-bit de LFM3-1.7B | 1,73 B | 256k | 4-bit uniforme | lfm1.0 (other) | Referencia en la eval de OptiQ |

No se dispone de datos comparativos publicados frente a otros modelos de tamaño similar de otras familias (por ejemplo Gemma o Qwen en gama 1-2B), por lo que no se pueden aportar cifras sin inventar datos.

## Limitaciones y advertencias

- Licencia lfm1.0: es una licencia propia de Liquid AI ("other"), no una licencia estándar permisiva; debe revisarse el texto en https://www.liquid.ai/lfm-license antes de cualquier uso comercial.
- El modelo razona antes de responder por defecto, por lo que consume tokens adicionales; la model card recomienda asignar un `max_tokens` generoso para evitar respuestas truncadas.
- La puntuación en HashHop (21,0 %) indica que la recuperación exacta en contextos muy largos es limitada, pese a los 256k de ventana.
- En BFCL-V3 el quant queda ligeramente por detrás del quant uniforme (91,5 % frente a 93,0 %), dentro del margen estadistico pero relevante si el tool calling es crítico.
- mlx-lm no soporta LFM3 de forma nativa: es necesario instalar `mlx-optiq` y registrar la implementación, lo que añade una dependencia externa al flujo habitual de MLX.
- Idiomas soportados, sesgos conocidos y datos de entrenamiento del modelo base: no disponibles en la información proporcionada.
- Al tratarse de un modelo pequeño (1,7B), cabe esperar riesgo de alucinaciones superior al de modelos de mayor escala, especialmente en conocimiento factual y dominios especializados.
- Los benchmarks han sido publicados por el propio autor del quant, no por un tercero independiente.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/mlx-community/LFM3-1.7B-OptiQ-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia lfm1.0: https://www.liquid.ai/lfm-license
- Sitio del proyecto OptiQ: https://mlx-optiq.com/
- Todos los quants OptiQ: https://mlx-optiq.com/models
- Documentacion de OptiQ: https://mlx-optiq.com/docs/
- Paquete PyPI de mlx-optiq: https://pypi.org/project/mlx-optiq/
- Organizacion mlx-community: https://huggingface.co/mlx-community
