# BeckyHF/gemma-2-2B-it-thinking-function_calling-V0

## Resumen

BeckyHF/gemma-2-2B-it-thinking-function_calling-V0 es un ajuste fino supervisado del modelo instruct de Google google/gemma-2-2b-it, publicado por el usuario BeckyHF en Hugging Face. El identificador del repositorio indica que el entrenamiento persigue dos comportamientos concretos: la generación de razonamiento explícito en un bloque de tipo "thinking" y la emisión de llamadas a funciones (function calling). No se trata de un modelo entrenado desde cero, sino de una adaptación comunitaria de un transformer decoder-only denso de aproximadamente 2.600 millones de parámetros.

El entrenamiento se realizó con SFT (supervised fine-tuning) mediante la librería TRL 1.13.0, sobre Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 4.8.5 y Tokenizers 0.23.2. El repositorio contiene pesos en safetensors, registros de TensorBoard, la etiqueta generated_from_trainer y la marca endpoints_compatible, lo que apunta a un despliegue sencillo en infraestructura de inferencia gestionada.

Su relevancia es limitada y conviene situarla con precisión: acumula 0 descargas y 0 "likes", no publica ninguna evaluación, no documenta el conjunto de datos de entrenamiento ni el esquema exacto de las llamadas a funciones, y la licencia no está especificada de forma inequívoca. Es un artefacto útil para experimentar con razonamiento y tool calling en un modelo que cabe en una GPU de consumo, pero no una opción validada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de google/gemma-2-2b-it (atención con ventana deslizante local en capas alternas combinada con atención global, RMSNorm, GeGLU y logit soft-capping, según la documentación del modelo base). El ajuste no declara modificaciones estructurales |
| Parámetros totales | Aproximadamente 2.600 millones (2,6B), heredados del modelo base; la model card del ajuste no especifica el recuento |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens según la documentación oficial de google/gemma-2b-it; no se confirma en la ficha del ajuste |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors. No se distribuyen versiones GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | no disponible; el modelo base fue entrenado predominantemente con datos en inglés |
| Licencia | no disponible; la model card incluye el campo ambiguo `licence: license`. El modelo base se distribuye bajo los Gemma Terms of Use, con obligaciones adicionales para uso comercial |
| Formato de pesos | safetensors (repositorio de 2,5 GB, incluyendo logs de TensorBoard) |
| Modelo base | google/gemma-2-2b-it (fine-tune) |
| Método de entrenamiento | SFT con TRL 1.13.0 |
| Fecha de publicación | 22 de septiembre de 2026, según los metadatos del repositorio |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base google/gemma-2-2b-it: un transformer decoder-only denso de aproximadamente 2.600 millones de parámetros que combina capas de atención local con ventana deslizante de 4.096 tokens y capas de atención global, emplea consultas agrupadas (GQA) para reducir el coste de la caché KV, normaliza con RMSNorm y aplica logit soft-capping para estabilizar el entrenamiento. El modelo base fue entrenado por Google con datos predominantemente en inglés y un corte de conocimiento en junio de 2024. El ajuste aquí descrito no introduce ni documenta ningún cambio arquitectónico.

En cuanto al procedimiento de entrenamiento, la model card únicamente indica que se empleó SFT con TRL. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO, ni cómo se construyeron los ejemplos de razonamiento y de llamada a funciones. Tampoco se detalla el formato esperado de salida (delimitadores del bloque de razonamiento, esquema JSON de las herramientas, tokens especiales añadidos), lo que obliga a inferir el comportamiento por prueba y error. Los únicos datos reproducibles son las versiones de framework y el hecho de que el modelo parte de un checkpoint instruct ya alineado.

## Capacidades

- Generación de texto conversacional: mantiene diálogos multi-turno dentro de la ventana de contexto de 8.192 tokens heredada del modelo base.
- Razonamiento explícito tipo "thinking": el identificador del modelo sugiere que el ajuste produce una cadena de razonamiento antes de la respuesta final, presumiblemente en un bloque delimitado. El formato concreto no está documentado.
- Function calling / tool calling: el nombre del repositorio indica entrenamiento específico para emitir llamadas a funciones. No se publica el esquema JSON, los nombres de herramienta esperados ni los delimitadores.
- Razonamiento multi-paso y uso en agentes: plausible por el tipo de ajuste, pero sin ninguna evidencia publicada que lo respalde.
- Capacidades multilingües: no documentadas; el modelo base está entrenado predominantemente en inglés, por lo que el rendimiento en castellano es incierto y no ha sido evaluado.
- Visión y audio: no disponibles. El modelo base es exclusivamente de texto.
- Modo de pensamiento desactivable: no disponible; no se documenta ningún parámetro de configuración para habilitar o deshabilitar el razonamiento.

## Casos de uso

- Prototipado de agentes con tool calling en local: gracias a su tamaño de 2,6B parámetros, el modelo puede ejecutarse en una GPU de consumo y servir como banco de pruebas para diseñar el bucle de agente, las herramientas disponibles y el parseo de las llamadas antes de migrar a un modelo mayor.
- Enrutado de consultas en un sistema multiagente: el modelo puede clasificar la intención del usuario y decidir qué herramienta o submódulo invocar, aprovechando su supuesta capacidad de razonamiento previo para justificar la elección.
- Extracción de datos estructurados en pipelines ETL: si el ajuste respeta formatos JSON en las respuestas, encaja en tareas de conversión de texto libre a registros estructurados, con verificación posterior mediante validación de esquema.
- Asistente de línea de comandos con acceso a herramientas del sistema: un CLI que traduzca lenguaje natural a comandos o llamadas a funciones locales, con confirmación humana antes de la ejecución.
- Investigación sobre formatos de razonamiento: permite comparar el comportamiento de un modelo pequeño con modo "thinking" frente a la respuesta directa del modelo base, en experimentos controlados y reproducibles.
- Generación y explicación de código en entornos con recursos limitados: fragmentos cortos, docstrings, tests unitarios o explicación de funciones, dentro de los límites de una ventana de 8.192 tokens.
- Despliegue en edge o en servidores sin GPU de gama alta: cuantizado a 4 bits, el modelo ocupa del orden de 1,7-2 GB de pesos, lo que permite inferencia en CPU o en GPUs antiguas con 6-8 GB de VRAM.
- Generación de datos sintéticos para ajustes posteriores: producir trazas de razonamiento y llamadas a funciones que después se filtren y se usen para entrenar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación (MMLU, GSM8K, HumanEval, BFCL u otras) ni comparaciones con el modelo base. La búsqueda web asociada tampoco devolvió material técnico relacionado con el modelo: los resultados obtenidos tratan sobre botánica y no guardan relación alguna con este repositorio.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| GSM8K | no disponible |
| HumanEval | no disponible |
| Berkeley Function Calling Leaderboard (BFCL) | no disponible |
| Evaluación del modo "thinking" | no disponible |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 5,2 GB de pesos más aproximadamente 0,8-1 GB de caché KV a 8.192 tokens de contexto, lo que sitúa el consumo en el rango de 6-7 GB con activaciones y overhead del runtime del orden de 1-2 GB.
- VRAM estimada en 8 bits: en torno a 2,6-3 GB de pesos, con un total aproximado de 4-5 GB incluyendo contexto completo.
- VRAM estimada en 4 bits (requiere convertir a GGUF, ya que no se publica ninguna cuantización): aproximadamente 1,7-2 GB de pesos y unos 3 GB de consumo total con contexto moderado.
- GPU recomendadas: A100, H100, L40S o RTX 6000 Ada para servicio concurrente; RTX 4090, RTX 4080, RTX 3090 o RTX 3060 de 12 GB para uso individual en precisión completa.
- Cabe en GPU de consumo: sí. En bf16 funciona con holgura en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) y con contexto reducido en tarjetas de 8 GB (RTX 3070, RTX 4060). En 4 bits es viable en GPUs de 6 GB (GTX 1660 Super, RTX 2060) y en CPU con llama.cpp.
- Opciones de despliegue: Transformers con `pipeline` (ejemplo incluido en la model card), vLLM o TGI aprovechando la etiqueta endpoints_compatible, y llama.cpp u Ollama tras convertir los pesos a GGUF con las herramientas estándar.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Los datos de la columna de rendimiento corresponden a lo que cada proyecto publica en su propia documentación; no existe ninguna evaluación cruzada con este fine-tune.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| BeckyHF/gemma-2-2B-it-thinking-function_calling-V0 | ~2,6B | 8.192 (heredado del base) | no disponible (base bajo Gemma Terms of Use) | Fine-tune comunitario, 0 descargas, sin cuantizaciones publicadas | Sin datos publicados |
| google/gemma-2-2b-it | 2,6B | 8.192 | Gemma Terms of Use | Modelo oficial de Google, ampliamente distribuido | Resultados publicados por Google en el informe técnico de Gemma 2 |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache-2.0 | Modelo oficial de Alibaba, con cuantizaciones GGUF y AWQ | Resultados publicados por el equipo de Qwen |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 131.072 | Llama 3.2 Community License | Modelo oficial de Meta, con extenso ecosistema de cuantizaciones | Resultados publicados por Meta |

Frente a estas alternativas, la ventaja potencial del modelo evaluado es su formato específico de razonamiento y llamada a funciones; en cambio, pierde en contexto (8.192 frente a 32.768 o 131.072 tokens), en claridad de licencia y en disponibilidad de cuantizaciones listas para usar.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas, 0 "likes" y ninguna evaluación publicada. No hay evidencia independiente de que el ajuste funcione según lo que sugiere su nombre.
- Trazabilidad del entrenamiento nula: no se documentan el dataset, el número de ejemplos, la composición ni los hiperparámetros. No se puede reproducir el entrenamiento ni auditar los datos.
- Riesgo de degradación respecto al modelo base: el SFT sobre un modelo pequeño y ya alineado puede provocar olvido catastrófico y degradar la calidad general de las respuestas fuera del dominio de razonamiento y tool calling.
- Formato de salida no especificado: se desconoce el esquema exacto de las llamadas a funciones y los delimitadores del bloque de razonamiento, lo que implica riesgo de JSON malformado y de fallos de parseo en producción.
- Alucinación de herramientas y argumentos: como cualquier modelo de esta escala, puede inventar nombres de función o parámetros inexistentes; cualquier uso real requiere validación estricta del esquema y ejecución en sandbox.
- Licencia ambigua: el repositorio no declara una licencia utilizable y el modelo base está sujeto a los Gemma Terms of Use, que incluyen una política de uso prohibido. Antes de cualquier uso comercial hay que verificar los términos aplicables y la cadena de licencias.
- Limitaciones idiomáticas: el modelo base está entrenado predominantemente en inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Cobertura lingüística del tokenizador heredada: no se ha añadido vocabulario ni ajuste específico para otros idiomas.
- Tamaño del repositorio inconsistente: 2,5 GB es inferior a lo esperable para 2.600 millones de parámetros en bf16 (unos 5 GB), por lo que conviene inspeccionar el contenido real del repositorio antes de integrarlo.
- Contexto limitado frente a alternativas actuales: 8.192 tokens es insuficiente para tareas de contexto largo, y el modelo carece de visión, audio o cualquier capacidad multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeckyHF/gemma-2-2B-it-thinking-function_calling-V0
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Repositorio de TRL: https://github.com/huggingface/trl
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Informe técnico de Gemma 2: https://arxiv.org/abs/2408.00118
