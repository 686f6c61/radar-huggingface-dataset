# NouraAlqasim/qwen2.5-7b-fp8-msa

## Resumen

El modelo `qwen2.5-7b-fp8-msa` es una cuantización post-entrenamiento en precisión FP8 (W8A8) del modelo instructivo `Qwen/Qwen2.5-7B-Instruct`, realizada con NVIDIA ModelOpt y calibrada específicamente sobre diálogos en árabe estándar moderno (MSA). El autor, NouraAlqasim, publica este checkpoint como parte de una serie de variantes (`-msa`, `-gulf`, `-mixed`) que difieren únicamente en las escalas de activación estáticas, determinadas por el conjunto de calibración. El objetivo es ofrecer una versión cuantizada del modelo base que mantenga un buen rendimiento en tareas de árabe, reduciendo el uso de memoria y acelerando la inferencia.

La cuantización FP8 reduce el tamaño de los pesos y activaciones a 8 bits, lo que permite ejecutar el modelo en GPUs con menor VRAM y mejorar el throughput en servidores de inferencia. Este checkpoint concreto está calibrado con 128 diálogos del dataset `Almheiri/ArabCulture-Dialogue`, lo que ajusta las escalas de activación para distribuciones de texto en MSA. No es cargable directamente con `transformers` estándar; requiere un runtime compatible con ModelOpt, como vLLM con la opción `--quantization modelopt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5, decoder-only) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | FP8 (W8A8) con ModelOpt `FP8_DEFAULT_CFG` |
| Idiomas soportados | no disponible (modelo base multilingue, calibrado en arabe MSA) |
| Licencia | no disponible (el modelo base Qwen2.5-7B-Instruct usa Apache 2.0, pero la licencia de este repo no esta especificada) |
| Formato de pesos | safetensors (con `config.json` que declara `quantization_type: modelopt`) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only con 7.6 mil millones de parámetros, entrenado originalmente en float16. La cuantización se realiza post-entrenamiento con NVIDIA ModelOpt en configuración `FP8_DEFAULT_CFG`, que convierte tanto pesos como activaciones a FP8 (W8A8). Las escalas de peso se calculan de forma data-free, mientras que las escalas de activación son estáticas y se determinan mediante calibración sobre un conjunto de 128 diálogos en árabe estándar moderno, extraídos del dataset `Almheiri/ArabCulture-Dialogue` (revisión `9acd60cbbb4f`, semilla 1448). Se reporta un error cuadrático medio de pesos de 2.050e-07 y se calibraron 196/196 cuantizadores de activación.

No se proporcionan detalles sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La única innovación técnica destacable es el uso de calibración específica para árabe MSA, que ajusta las escalas de activación para mejorar la fidelidad en ese idioma sin modificar los pesos.

## Capacidades

- Generación de texto y diálogo en múltiples idiomas, con especial atención al árabe estándar moderno gracias a la calibración.
- Razonamiento, comprensión lectora y respuesta a instrucciones (capacidades heredadas del modelo base Qwen2.5-7B-Instruct).
- Soporte de tool calling y function calling (capacidad nativa de Qwen2.5-Instruct).
- Capacidades multilingües del modelo base, aunque la calibración FP8 puede afectar ligeramente a idiomas fuera del árabe.
- No se especifican capacidades de visión, audio o modo de pensamiento explícito.

## Casos de uso

- Asistentes conversacionales en árabe estándar: el modelo puede gestionar diálogos multi-turno con hablantes de MSA, aprovechando la calibración específica para mantener coherencia y precisión en ese idioma.
- Generación de contenido en árabe (artículos, resúmenes, respuestas a preguntas) con menor huella de memoria que el modelo original en FP16.
- Despliegue de chatbots en producción con vLLM, donde la cuantización FP8 reduce la VRAM necesaria y permite mayor throughput por GPU.
- Sistemas de atención al cliente en árabe: integración con pipelines de tool calling para consultar bases de datos o ejecutar acciones, gracias a las capacidades de function calling del modelo base.
- Traducción automática o post-edición de textos en árabe, aunque no está específicamente entrenado para ello, su calibración puede mejorar la calidad en comparación con cuantizaciones genéricas.
- Evaluación de técnicas de cuantización: sirve como punto de comparación para estudiar el impacto de la calibración por idioma en modelos FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de calibración (MSE de pesos 2.050e-07) y el número de cuantizadores de activación calibrados, pero no hay comparativas de rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: al ser FP8, el modelo ocupa aproximadamente 7.6 GB en pesos (7.615.616.512 parámetros × 1 byte), más overhead de activaciones y memoria de trabajo. En la práctica, se recomienda al menos 10-12 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: GPUs con soporte FP8 nativo (NVIDIA H100, H200, A100 con soporte FP8 en algunos casos, RTX 4090 con emulación) o cualquier GPU que soporte FP8 via software. Para uso con vLLM, se recomienda una GPU con al menos 12 GB.
- Cabe en GPUs de consumo como RTX 3090/4090 (24 GB) o RTX 4070 Ti (12 GB) con cuantización adicional o contexto reducido.
- Opciones de despliegue: vLLM (comando documentado: `vllm serve NouraAlqasim/qwen2.5-7b-fp8-msa --quantization modelopt`), también puede usarse con TensorRT-LLM u otros runtimes que soporten ModelOpt. No es cargable con `transformers` estándar.
- Latencia y throughput: no disponibles; dependen del hardware y del runtime. En general, FP8 ofrece mayor throughput que FP16 en GPUs con soporte nativo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la ficha. Sin embargo, se puede comparar con otras cuantizaciones FP8 del mismo modelo base (por ejemplo, versiones calibradas en otros idiomas o con calibración genérica) y con el modelo original en FP16. La diferencia clave es la calibración en MSA, que puede mejorar la precisión en árabe a costa de posible degradación en otros idiomas. No se proporcionan datos cuantitativos de rendimiento relativo.

## Limitaciones y advertencias

- No es cargable con `transformers` estándar; requiere runtime compatible con ModelOpt (vLLM, TensorRT-LLM). Esto limita su uso en entornos que solo soportan el formato tradicional.
- La licencia no está especificada en el repo. Aunque el modelo base es Apache 2.0, no se garantiza que esta cuantización herede esa licencia; se debe consultar al autor antes de uso comercial.
- La calibración en árabe MSA puede degradar el rendimiento en otros idiomas, especialmente en tareas fuera del dominio de calibración.
- No se han publicado benchmarks que validen el rendimiento tras la cuantización; el impacto en calidad es desconocido.
- El contexto máximo no se especifica; se asume el del modelo base (128k tokens) pero no está confirmado en la ficha.
- Riesgo de alucinación y sesgos inherentes al modelo base Qwen2.5-7B-Instruct, no mitigados por la cuantización.

## Enlaces

- HuggingFace: https://huggingface.co/NouraAlqasim/qwen2.5-7b-fp8-msa
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de calibración: https://huggingface.co/datasets/Almheiri/ArabCulture-Dialogue
