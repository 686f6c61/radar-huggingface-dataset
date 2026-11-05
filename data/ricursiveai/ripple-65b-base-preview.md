# ricursiveAI/Ripple-65B-Base-Preview

## Resumen

Ripple-65B Base Preview es un checkpoint de preentrenamiento puro (sin midtraining, SFT ni datos sintéticos de QA) publicado por Ricursive Intelligence bajo licencia Apache 2.0. Se trata de un Transformer denso de 64.782.689.360 parámetros entrenado desde cero sobre 12 billones de tokens de texto predominantemente en inglés y código, con una longitud de secuencia de preentrenamiento de 8K. El modelo forma parte de la familia Ripple-65B, cuya versión instruct se presenta como especialmente competitiva en tareas de codificación agéntica.

La relevancia de este lanzamiento radica en dos decisiones de diseño poco habituales en el panorama actual: apostar por una arquitectura densa en lugar de un Mixture-of-Experts (MoE), y adoptar una proporción "thin-and-deep" con un `d_model` estrecho de 5120 y 80 capas totales. Según el autor, esto permite entrenar y servir el modelo con una infraestructura más sencilla, manteniendo un MFU del 40% durante preentrenamiento y postentrenamiento con sharding simple, sin kernels personalizados ni cuantización en la fase de entrenamiento (BF16).

El modelo se distribuye en formato safetensors BF16 (129,6 GB de repositorio) y requiere `custom_code` para su carga. Al ser un checkpoint base, no incorpora alineación conversacional ni formato de chat: está pensado como punto de partida para fine-tuning, investigación sobre escalado y experimentación local, ya que sus 65B parámetros permiten, según el autor, ejecutarlo en hardware de consumo como una NVIDIA DGX Spark mediante el checkpoint NVFP4 de la variante instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (estilo Gemma 3N), proporción thin-and-deep |
| Parametros totales | 64.782.689.360 (~65B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1M tokens en la familia Ripple-65B; preentrenamiento base a 8K |
| Tipos de cuantizacion | BF16 (este repo); NVFP4 disponible en la variante instruct |
| Idiomas soportados | Predominantemente inglés y código (no se detalla lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), con `custom_code` |

## Arquitectura y entrenamiento

Ripple-65B emplea un Transformer denso con arquitectura inspirada en Gemma 3N, abandonando el diseño tipo Llama de la línea Olmo 3 que sirvió como baseline inicial. La proporción es "thin-and-deep": `d_model` de 5120 con 80 capas totales. Para mejorar el rendimiento en razonamiento, el autor sobredimensiona el número de cabezas de atención, incrementa la ratio de capas SWA (sliding window attention) frente a globales y reduce la ventana SWA para compensar el coste adicional. Incorpora además recorte de activaciones en la FFN (FFN activation clipping), atención con compuertas (gated attention), NoPE global y value residuals.

El preentrenamiento se realizó desde cero sobre 12 billones de tokens de un corpus textual mayoritariamente inglés y de código, con longitud de secuencia de 8K, 877.500 pasos y batch size escalado de 1408 a 3072. Este checkpoint base no ha pasado por midtraining, long context, SFT ni RL; esas etapas (200B tokens de midtraining a 64K, 6,5B de long context a 2M, 183B de SFT a 128K, 13,5B de long-context SFT y 700 pasos de RL mixto por dominio) corresponden a la variante instruct. El autor reporta una mejora de eficiencia computacional en código de 16x frente a la escalera de Olmo 3, que asciende a 55x en la ejecución completa del modelo hero.

## Capacidades

- Generación de texto y modelado de lenguaje autoregresivo en inglés y código, como checkpoint base sin alineación conversacional.
- Razonamiento y tareas agénticas de codificación heredadas del diseño arquitectónico (la variante instruct reporta 80,52 en TerminalBench 2.1).
- Base para fine-tuning supervisado y RL: al no incluir SFT, es adecuado como punto de partida para adaptaciones posteriores.
- Soporte de contexto largo en la familia (hasta 1M tokens), aunque este checkpoint base se entrenó a 8K y requeriría etapas de long context para explotarlo.
- Capacidades multilingües limitadas: el corpus es predominantemente inglés, sin lista oficial de idiomas publicada.
- No se documentan en la información disponible capacidades de tool calling, function calling, visión, audio ni modo thinking para este checkpoint base.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un checkpoint base sin alineación, permite aplicar SFT sobre datos propios (legal, sanitario, financiero) partiendo de un modelo de 65B con licencia Apache 2.0 y sin restricciones de uso comercial.
- Investigación sobre escalado y recetas de entrenamiento: la arquitectura thin-and-deep con `d_model` 5120 y 80 capas, junto con las innovaciones (gated attention, NoPE global, value residuals), sirve como banco de pruebas para estudiar estabilidad y eficiencia a escala media.
- Desarrollo de asistentes de código: el modelo base puede adaptarse mediante fine-tuning para autocompletado y generación de código, aprovechando el corpus de 12T tokens con fuerte peso de código.
- Experimentación local en hardware de consumo: el autor indica que los 65B parámetros caben en una NVIDIA DGX Spark usando el checkpoint NVFP4 de la variante instruct, lo que facilita prototipado sin clúster.
- Generación de datos sintéticos y destilación: un modelo base de 65B puede emplearse para producir corpus etiquetados que alimenten modelos más pequeños, dado que no incorpora sesgos de alineación conversacional.
- Evaluación comparativa de arquitecturas densas frente a MoE: permite medir empíricamente la relación calidad/coste de un denso de 65B frente a alternativas MoE de mayor tamaño total.
- Construcción de pipelines de razonamiento multi-paso tras RL: el modelo base es el sustrato sobre el que la receta de postentrenamiento del autor aplica RL mixto por dominio, replicable por terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint base en la información disponible. La model card incluye una tabla comparativa de la variante instruct (Ripple-65B Preview) frente a Nemotron 3 Ultra 550B, Inkling 975B, Muse Spark Open 816B y Reflection Beam 501B, pero la tabla aparece truncada en el material proporcionado y no puede reproducirse con rigor. El único dato numérico completo es el 80,52 en TerminalBench 2.1 para la variante instruct.

| Benchmark | Ripple-65B Base Preview |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| TerminalBench 2.1 | no disponible (solo variante instruct: 80,52) |

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 130 GB solo para pesos (129,6 GB de repositorio), más overhead de activaciones y KV cache; requiere múltiples GPU o nodos.
- VRAM estimada en NVFP4 (variante instruct): el autor indica que cabe en una NVIDIA DGX Spark, lo que sitúa el requisito en torno a 32-64 GB según configuración.
- GPU recomendadas: el autor cita 2xB200 alcanzando 250 tok/s con batch=8 antes de cuantización o kernels personalizados; para BF16 se necesitan A100/H100/H200/B200 en configuración multi-GPU.
- GPU de consumo: en BF16 no cabe en ninguna GPU de consumo individual; en NVFP4 la variante instruct se orienta a DGX Spark.
- Opciones de despliegue: el repositorio requiere `custom_code`, por lo que la carga no es estándar en todos los frameworks; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 250 tok/s en 2xB200 con batch=8 en BF16 sin kernels personalizados (dato del autor para la familia).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ripple-65B Base Preview | 65B denso | 1M (familia); 8K en base | Apache 2.0 | Checkpoint base, sin SFT |
| Olmo 3 (baseline) | no disponible | no disponible | no disponible | Punto de partida del que deriva Ripple; arquitectura tipo Llama |
| Nemotron 3 Ultra 550B | 550B | no disponible | no disponible | Referencia en la comparativa del autor (instruct) |
| Reflection Beam 501B | 501B | no disponible | no disponible | Referencia en la comparativa del autor (instruct) |

La comparación directa con alternativas de 65B densas no está disponible en la información proporcionada; el autor solo compara la variante instruct frente a modelos estadounidenses de pesos abiertos de mayor tamaño (501B a 975B).

## Limitaciones y advertencias

- Es un checkpoint exclusivamente de preentrenamiento: no sigue instrucciones, no tiene formato de chat ni alineación, y producirá continuaciones de texto sin control conversacional.
- Riesgo elevado de alucinación y de contenido sesgado o tóxico, al no haber pasado por SFT ni RLHF/DPO.
- El contexto efectivo es de 8K en este checkpoint; el soporte de 1M requiere las etapas de long context de la variante instruct.
- Corpus predominantemente inglés: el rendimiento en castellano y otros idiomas no está garantizado ni documentado.
- Requiere `custom_code` para la carga, lo que puede complicar la integración con frameworks estándar y la reproducibilidad.
- Aunque la licencia es Apache 2.0, conviene verificar el archivo LICENSE del repositorio y las condiciones de los datos de entrenamiento antes de un uso comercial en producción.
- El tamaño BF16 (129,6 GB) exige infraestructura multi-GPU; no es desplegable en una sola GPU de consumo sin cuantización.
- No se han publicado evaluaciones independientes ni resultados de benchmarks para este checkpoint base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Variante BF16 instruct: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Variante NVFP4: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Variante DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
