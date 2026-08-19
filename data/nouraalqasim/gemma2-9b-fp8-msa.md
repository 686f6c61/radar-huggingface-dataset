# NouraAlqasim/gemma2-9b-fp8-msa

## Resumen

El modelo `NouraAlqasim/gemma2-9b-fp8-msa` es una versión cuantizada en precisión FP8 (W8A8) del modelo instructivo `google/gemma-2-9b-it` de Google, desarrollada por el usuario NouraAlqasim. La cuantización se realiza mediante NVIDIA ModelOpt con la configuración `FP8_DEFAULT_CFG`, y la particularidad principal es que las escalas estáticas de activación se calibran con datos en árabe estándar moderno (MSA), extraídos del dataset `Almheiri/ArabCulture-Dialogue`. Esto permite que la cuantización conserve una mayor fidelidad en tareas de procesamiento de texto en árabe, aunque el modelo base es multilingüe.

El objetivo de esta ficha es ofrecer una versión más ligera y rápida del modelo Gemma 2 9B instructivo, reduciendo el tamaño de los pesos de 18,4 GB (en FP16) a aproximadamente 9,2 GB (en FP8), lo que facilita su despliegue en GPUs con memoria limitada. El checkpoint resultante no es cargable directamente con `transformers`, sino que requiere el uso de vLLM con la opción `--quantization modelopt`. El repositorio contiene 10,2 GB de datos en formato `safetensors`, y los parámetros totales ascienden a 9.241.705.984.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en `google/gemma-2-9b-it`) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (W8A8) con NVIDIA ModelOpt (`FP8_DEFAULT_CFG`) |
| Idiomas soportados | No disponible (el modelo base es multilingüe; la calibración se realiza en árabe estándar moderno) |
| Licencia | No disponible |
| Formato de pesos | safetensors (cuantizado FP8) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint `google/gemma-2-9b-it`, que es un transformer decoder-only con 9,2 mil millones de parámetros, entrenado por Google con técnicas de destilación y optimización para tareas de instrucción y diálogo. La cuantización se aplica con NVIDIA ModelOpt en configuración W8A8 (pesos y activaciones en FP8), utilizando escalas de peso calculadas de forma data-free y escalas de activación estáticas por tensor, exportadas como `input_scale`.

La novedad técnica de esta versión es que las escalas de activación se calibran con 128 diálogos en árabe estándar moderno (máximo 512 tokens cada uno), provenientes del dataset `Almheiri/ArabCulture-Dialogue` (revisión `9acd60cbbb4f`, semilla 1448). El error cuadrático medio de los pesos tras la cuantización es de 3,164e-08, y los 294 cuantizadores de activación quedan calibrados. No se realiza ningún entrenamiento adicional; solo se ajustan las escalas de activación para mejorar la precisión en el idioma árabe. Los checkpoints hermanos (`-fp8-gulf` y `-fp8-mixed`) difieren únicamente en la variedad de calibración utilizada.

## Capacidades

- Generación de texto y diálogo: hereda las capacidades del modelo base Gemma 2 9B instructivo, incluyendo respuesta a instrucciones y conversación multi-turno.
- Razonamiento y conocimiento general: el modelo base está entrenado con un amplio corpus multilingüe, por lo que mantiene capacidades de razonamiento, matemáticas y comprensión lectora.
- Generación de código: el modelo base incluye entrenamiento en lenguajes de programación, aunque no se especifica el alcance exacto en la ficha.
- Soporte de tool calling / function calling: no se indica explícitamente en la ficha, pero el modelo base Gemma 2 9B it incluye esta capacidad en su versión oficial.
- Capacidades multilingües: no se documentan en la ficha; la calibración específica en árabe MSA puede mejorar la precisión de las activaciones para ese idioma, pero no garantiza un rendimiento superior en otros idiomas.
- Modo de uso: requiere vLLM con `--quantization modelopt`; no es compatible con `transformers` estándar.

## Casos de uso

- Asistentes conversacionales en árabe: gracias a la calibración en MSA, el modelo puede ofrecer respuestas más precisas en diálogos en árabe estándar, manteniendo un tamaño reducido para desplegarse en entornos con recursos limitados.
- Procesamiento de documentos en árabe: tareas de resumen, extracción de información o generación de informes a partir de textos en árabe pueden beneficiarse de las escalas de activación optimizadas para ese idioma.
- Inferencia de baja latencia en producción: al reducir los pesos a FP8, se reduce el ancho de banda de memoria y se acelera la inferencia en GPUs como A100 o H100, adecuado para servicios en tiempo real.
- Despliegue en GPUs de consumo: con un checkpoint de ~10 GB, es posible ejecutar el modelo en GPUs con 16 GB de VRAM (por ejemplo, RTX 4080/4090) usando vLLM, lo que facilita prototipado y pruebas locales.
- Fine-tuning posterior sobre datos árabes: aunque la cuantización no está pensada para entrenamiento, las escalas de activación calibradas pueden servir como punto de partida para adaptaciones con PEFT (LoRA) en tareas específicas.
- Evaluación comparativa de cuantización: este checkpoint sirve como referencia para estudiar el impacto de la calibración idiomática en la precisión de modelos cuantizados, útil para investigadores en eficiencia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha solo proporciona el error cuadrático medio de los pesos (3,164e-08) y el número de cuantizadores de activación calibrados (294/294), pero no hay métricas de calidad como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 10,2 GB en disco. Para inferencia en FP8, se necesitan aproximadamente 9,2 GB para los pesos, más memoria para activaciones y KV cache. Se estima un requisito mínimo de 12-16 GB de VRAM, dependiendo de la longitud de contexto y el tamaño de lote.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) o RTX 4080 (16 GB) para entornos de consumo. No se recomienda para GPUs con menos de 12 GB.
- Opciones de despliegue: vLLM es la vía recomendada según la model card (`vllm serve NouraAlqasim/gemma2-9b-fp8-msa --quantization modelopt`). También podría utilizarse TensorRT-LLM si se convierte el checkpoint, aunque no se documenta.
- Latencia y throughput: no se proporcionan datos oficiales. En FP8, se espera una mejora de 1,5-2x en throughput respecto a FP16 en GPUs con soporte nativo FP8 (H100, RTX 40 series), pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `google/gemma-2-9b-it` | 9,24B | FP16 | 8192 (no confirmado) | Gemma Terms of Use | Modelo base sin cuantizar |
| `NouraAlqasim/gemma2-9b-fp8-msa` | 9,24B | FP8 (W8A8) | No disponible | No disponible | Cuantización con calibración árabe |
| `NouraAlqasim/gemma2-9b-fp8-gulf` (hermano) | 9,24B | FP8 | No disponible | No disponible | Calibración con dialecto del Golfo |
| `NouraAlqasim/gemma2-9b-fp8-mixed` (hermano) | 9,24B | FP8 | No disponible | No disponible | Calibración mixta |

La comparación directa con otros modelos cuantizados FP8 de la misma familia (por ejemplo, versiones de `TheBloke` o `neuralmagic`) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es cargable con `transformers` estándar: el `config.json` declara el tipo de cuantización `modelopt`, por lo que solo puede usarse con vLLM u otros motores compatibles con ModelOpt.
- Licencia no especificada: aunque el modelo base Gemma 2 tiene una licencia propia (Gemma Terms of Use) que permite uso comercial con restricciones, la ficha no indica la licencia de este checkpoint, por lo que se debe contactar al autor antes de un uso comercial.
- Calibración limitada al árabe MSA: las escalas de activación están optimizadas para árabe estándar moderno; en otros idiomas, la precisión puede degradarse ligeramente respecto al modelo base sin cuantizar.
- Riesgo de alucinación y sesgos: el modelo base puede generar contenido incorrecto o sesgado, y la cuantización no mitiga estos problemas.
- Sin benchmarks publicados: no hay evidencia objetiva del rendimiento real en tareas estándar, por lo que se recomienda validar el modelo en el caso de uso específico antes de producción.
- Fecha de creación futura (2026-08-15): el checkpoint está fechado en el futuro, lo que puede indicar un error de metadatos o una fecha programada; se debe verificar la integridad del repositorio.

## Enlaces

- Repositorio HuggingFace: [NouraAlqasim/gemma2-9b-fp8-msa](https://huggingface.co/NouraAlqasim/gemma2-9b-fp8-msa)
- Modelo base: [google/gemma-2-9b-it](https://huggingface.co/google/gemma-2-9b-it)
- Dataset de calibración: [Almheiri/ArabCulture-Dialogue](https://huggingface.co/datasets/Almheiri/ArabCulture-Dialogue)
- NVIDIA ModelOpt: [documentación oficial](https://github.com/NVIDIA/TensorRT-Model-Optimizer)
- vLLM: [documentación de cuantización](https://docs.vllm.ai/en/latest/features/quantization.html)
