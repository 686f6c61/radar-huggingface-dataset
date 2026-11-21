# Jongbin-kr/llama3.1-8b-instruct_math_RFT-jev-noul_k10_lora-r16a32_lr1e-4_ep3_n2000

## Resumen

El modelo `Jongbin-kr/llama3.1-8b-instruct_math_RFT-jev-noul_k10_lora-r16a32_lr1e-4_ep3_n2000` es un adaptador LoRA para `meta-llama/Llama-3.1-8B-Instruct`, publicado por el usuario Jongbin-kr. No se trata de un modelo completo, sino de un conjunto de pesos PEFT que debe cargarse sobre el modelo base de Meta para su uso. Su propósito es mejorar el rendimiento en razonamiento matemático mediante un proceso de ajuste fino por rechazo de muestras (rejection-sampling fine-tuning, RFT) sobre las propias generaciones del modelo base.

La innovación principal reside en el método de selección de muestras: en lugar de usar la respuesta correcta (gold) o un juicio de un LLM, se emplea un verificador denominado `jev-noul` (TypeSafe jev, variante Noul) que asigna a cada una de las 10 muestras generadas por problema una probabilidad de ser correcta, seleccionando la de mayor puntuación. El entrenamiento se realizó sobre 2.000 problemas del split de entrenamiento de MATH-lighteval, con 3 épocas y LoRA de rango 16.

El modelo es relevante en el contexto de investigación sobre self-training y selección de datos sin etiquetas para matemáticas, ya que compara distintas estrategias de selección (aleatoria, self-consistency, elección por LLM, jev-noul y gold) manteniendo fijas las muestras generadas. La ganancia en precisión de los datos de entrenamiento es notable (80,0 % frente a 63,2 % con selección aleatoria), aunque la mejora en exactitud de evaluación es modesta (50,4 % frente a 49,0 %). El repositorio tiene un tamaño de 0,2 GB y cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), adaptador LoRA sobre modelo base |
| Parametros totales | 8.030 millones (modelo base Llama-3.1-8B-Instruct); adaptador LoRA r=16, alpha=32 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (heredados del modelo base, que soporta 8 idiomas oficiales: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only de 8.030 millones de parametros con atención por grupos (GQA) y ventana de contexto de 128.000 tokens. El ajuste se realizó con LoRA de rango 16, alpha 32, dropout 0,05, aplicado a todas las proyecciones lineales, con pérdida solo sobre la completion, precisión bf16, learning rate 1e-4 con scheduler coseno, warmup del 3 %, 3 épocas y batch efectivo de 32. El entrenamiento se ejecutó en una única semilla (seed 42).

Los datos de entrenamiento proceden de 2.000 problemas del split de entrenamiento de `DigitalLearningGmbH/MATH-lighteval`, estratificados por nivel y con semilla 42. Para cada problema se generaron 10 muestras del modelo base con temperatura 0,7 y top_p 1,0, usando el prompt `<problem>\n\nPlease reason step by step, and put your final answer within \boxed{}.`. La selección `jev-noul` puntúa cada muestra de forma independiente con un verificador TypeSafe jev (Noul) que estima P(correcta), y se conserva la de mayor probabilidad. La precisión de los datos resultante fue del 80,0 %, frente al 63,2 % de la selección aleatoria, el 79,8 % de self-consistency y el 72,1 % de la elección por LLM. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto y razonamiento paso a paso en problemas matemáticos, con formato de respuesta final dentro de `\boxed{}`.
- Resolución de problemas de matemáticas de nivel competición (MATH), incluyendo aritmética, álgebra, geometría y conteo.
- Conversación multi-turno (heredada del modelo base instruct).
- Capacidad multilingüe heredada del modelo base (8 idiomas oficiales), aunque el ajuste se realizó únicamente con datos en inglés.
- No se documenta soporte específico de tool calling, function calling, agentes o modo thinking en la información disponible; estas capacidades dependerían del modelo base y no han sido evaluadas tras el ajuste.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación en self-training matemático: el adaptador sirve como punto de comparación reproducible para estudiar cómo distintas estrategias de selección de muestras (jev, self-consistency, LLM-as-judge) afectan al rendimiento final tras RFT.
- Generación de soluciones matemáticas con formato estructurado: útil en pipelines que necesitan extraer la respuesta final mediante el patrón `\boxed{}` para evaluación automática con `math-verify`.
- Fine-tuning sobre dominio matemático con recursos limitados: al ser un adaptador LoRA de 0,2 GB, permite experimentar con ajustes sobre Llama-3.1-8B sin replicar el entrenamiento completo del modelo base.
- Evaluación de verificadores de razonamiento: el método `jev-noul` puede reproducirse sobre otros conjuntos de problemas para medir la calidad de la selección de muestras sin etiquetas.
- Tutoría matemática automatizada en inglés: el modelo puede generar explicaciones paso a paso, aunque la ganancia medida frente al base es pequeña (50,4 % frente a 49,2 % en MATH-500).
- Baseline para comparativas de RFT: sirve como referencia en estudios que comparen selección aleatoria, self-consistency y selección por verificador en modelos de 8B.

## Benchmarks y rendimiento

Evaluación sobre MATH-500 (`HuggingFaceH4/MATH-500`), decodificación greedy y verificación con `math-verify`. Todas las variantes parten de las mismas 10 muestras por problema; solo cambia la selección.

| Selección | Ejemplos SFT | Precisión de datos (%) | Exactitud en evaluación (%) |
|---|---|---|---|
| base (sin SFT) | — | — | 49,2 |
| random | 2000 | 63,2 | 49,0 |
| sc | 2000 | 79,8 | 49,2 |
| llm-choice | 2000 | 72,1 | 50,6 |
| **jev-noul** | 2000 | 80,0 | 50,4 |
| gold | 1761 | 100,0 | 53,2 |

El autor advierte que se trata de una única semilla de entrenamiento por selección y que las diferencias inferiores a 2-3 puntos pueden ser ruido. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más.
- Cuantización del modelo base a 8 bits: aproximadamente 8-9 GB; a 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 o GPUs con 12-16 GB para cuantización 4/8 bits.
- Cabe en GPU de consumo (RTX 4090, RTX 3090, RTX 4080) si se cuantiza el modelo base; el adaptador LoRA en sí ocupa unos 0,2 GB.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el base), vLLM con soporte LoRA, TGI con adaptadores, llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8,03 B | 128k | 49,2 % | llama3.1 | Hugging Face (Meta) |
| Este adaptador (jev-noul) | 8,03 B + LoRA r=16 | 128k | 50,4 % | llama3.1 | Hugging Face (Jongbin-kr) |
| Variante gold (mismo repo) | 8,03 B + LoRA r=16 | 128k | 53,2 % | llama3.1 | Hugging Face (Jongbin-kr) |
| Variante llm-choice (mismo repo) | 8,03 B + LoRA r=16 | 128k | 50,6 % | llama3.1 | Hugging Face (Jongbin-kr) |

No se dispone de datos de benchmarks de otros modelos matemáticos de 8B (por ejemplo, Qwen2.5-Math-7B o DeepSeek-Math-7B) en la información proporcionada, por lo que no se incluye una comparación con ellos.

## Limitaciones y advertencias

- La mejora frente al modelo base es de solo 1,2 puntos en MATH-500 (50,4 % frente a 49,2 %), dentro del margen que el propio autor considera posible ruido (2-3 puntos).
- Entrenado con una única semilla; no hay intervalos de confianza ni repeticiones que permitan validar la significancia estadística.
- El ajuste se realizó únicamente sobre problemas en inglés de MATH-lighteval; el rendimiento en otros idiomas o dominios no está evaluado y podría degradarse.
- Riesgo de alucinación en pasos intermedios de razonamiento, especialmente en problemas fuera de la distribución de MATH.
- El adaptador no es un modelo autónomo: requiere descargar el modelo base Llama-3.1-8B-Instruct y cargarlo con PEFT; su licencia es la Llama 3.1 Community License, con restricciones de uso comercial y de redistribución que deben revisarse.
- El repositorio tiene cero descargas y cero likes, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan evaluaciones de tool calling, agentes, seguridad ni sesgos; no se recomienda su uso en producción sin una evaluación adicional.
- El nombre del repositorio incluye hiperparámetros y método de selección, lo que facilita la trazabilidad pero no garantiza reproducibilidad completa (no se especifican todos los detalles del verificador `jev-noul`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongbin-kr/llama3.1-8b-instruct_math_RFT-jev-noul_k10_lora-r16a32_lr1e-4_ep3_n2000
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Dataset de evaluación: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- PEFT (librería): https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
