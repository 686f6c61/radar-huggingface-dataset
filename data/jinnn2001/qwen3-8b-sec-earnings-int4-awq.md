# Jinnn2001/qwen3-8b-sec-earnings-int4-awq

## Resumen

`qwen3-8b-sec-earnings-int4-awq` es una versión cuantizada a 4 bits del modelo Qwen3-8B de Alibaba, especializada en la extracción estructurada de métricas financieras a partir de comunicados de resultados (earnings press releases) de empresas cotizadas en Estados Unidos. El autor, Jinnn2001, parte de un adapter LoRA propio (`qwen3-8b-sec-earnings-lora`, step-00025) fusionado sobre Qwen3-8B y posteriormente cuantizado con AWQ mediante llm-compressor para su despliegue con vLLM.

El modelo resuelve una tarea muy concreta: recibe un comunicado de resultados en Markdown y devuelve un único objeto JSON con los ingresos GAAP, el beneficio neto y el beneficio por acción diluido (EPS), tanto del trimestre como del acumulado del año, respetando las unidades tal como aparecen impresas. No es un modelo de propósito general: está afinado para information extraction en el dominio financiero y su uso previsto es el de un componente dentro de un pipeline de ingesta de datos financieros.

La relevancia actual reside en que demuestra un flujo completo de especialización y despliegue eficiente: adapter LoRA sobre un modelo abierto, fusión en float32, cuantización W4A16 asimétrica en grupos de 128 y servicio con vLLM. El resultado ocupa 5,68 GiB de pesos, frente a los 15,26 GiB del modelo fusionado en bfloat16, con una pérdida de precisión medida de apenas 2,4 puntos porcentuales en el conjunto de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), cuantizado AWQ W4A16_ASYM |
| Parametros totales | 2.174.236.152 (según safetensors del repo cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (configurado en el benchmark con `--max-model-len 40960`) |
| Tipos de cuantizacion | 4-bit int con zero points, grupos de 128, activaciones sin cuantizar (W4A16_ASYM) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato pack-quantized de compressed-tensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B (revisión `b968826d9c46dd6066d109eabc6255188de91218`), un transformer decoder-only. Sobre él se aplicó un adapter LoRA entrenado para la tarea de extracción de métricas financieras (step-00025 del run `qwen3-8b-2k`), que se fusionó con `merge_and_unload` de peft 0.21.2 en float32 y se guardó en bfloat16, produciendo 15,26 GiB de pesos. Posteriormente se cuantizó con AWQ de llmcompressor 0.15.0 y compressed-tensors 0.20.1, aplicando `duo_scaling` en ambas direcciones y el esquema W4A16_ASYM a las capas Linear excepto `lm_head`.

La calibración de AWQ se realizó con 128 ejemplos del conjunto de entrenamiento (prompt y respuesta, con el mismo formato que en entrenamiento), con un máximo de 16.384 tokens por ejemplo y una semilla fija; ninguno procedía de los splits de validación o test. El resultado son 5,68 GiB de pesos en formato pack-quantized de compressed-tensors, con `quantization_config` embebida en `config.json`, lo que permite cargarlo directamente tanto con vLLM como con transformers (este último requiere compressed-tensors instalado). No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición completa del dataset más allá de la referencia al dataset `Jinnn2001/sec-earnings-bench`.

## Capacidades

- Extracción estructurada de métricas financieras: ingresos GAAP, beneficio neto y EPS diluido, para el trimestre y para el acumulado del año, en un único objeto JSON.
- Preservación de unidades tal como aparecen impresas (units, thousands, millions, billions) y de valores nulos cuando la cifra no está presente.
- Manejo de documentos largos: soporta entradas de hasta 40.960 tokens, suficiente para comunicados de resultados extensos con tablas y notas al pie.
- Salida JSON determinista con temperatura 0.0, adecuada para parsing automático con `Decimal` para evitar errores de coma flotante.
- Modo thinking desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`, orientado a minimizar latencia en extracción.
- Capacidad conversacional multi-turno heredada de Qwen3, aunque el uso previsto es de un solo turno (system prompt + comunicado).
- Soporte de tool calling y function calling heredado del modelo base (no validado específicamente en esta ficha).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Ingesta automatizada de comunicados de resultados: el modelo recibe el press release en Markdown y devuelve un JSON con las tres métricas clave, listo para insertar en una base de datos financiera. Su ventana de 40.960 tokens permite procesar comunicados completos sin truncar.
- Enriquecimiento de pipelines de datos de mercado: integrado en un job programado que descarga los comunicados de la SEC y extrae las cifras para alimentar un data warehouse, con validación posterior contra XBRL.
- Verificación cruzada de cifras: comparar los valores extraídos del texto del comunicado con los datos estructurados XBRL de la misma empresa para detectar discrepancias o errores de transcripción.
- Generación de informes comparativos trimestrales: alimentar un motor de reporting que agregue ingresos y beneficio neto por empresa y trimestre a partir de los JSON extraídos.
- Screening cuantitativo: extraer métricas de cientos de comunicados en lote para construir series temporales y alimentar modelos de scoring o alertas de variación.
- Despliegue en producción con vLLM: el formato pack-quantized de compressed-tensors permite servir el modelo directamente con `vllm serve` en una GPU H100 NVL, con un throughput adecuado para procesar lotes de comunicados en ventanas de tiempo acotadas.
- Prototipado en investigación: al ser un modelo de 4 bits con licencia Apache 2.0, sirve como base para experimentar con extracción de información financiera sin depender de APIs propietarias.

## Benchmarks y rendimiento

Resultados del benchmark de serving publicado por el autor (una NVIDIA H100 NVL a 3,429 USD por GPU-hora, vLLM 0.32.0, prefix caching desactivado, `--max-model-len 40.960`). La columna "adapter" corresponde al modelo base en bf16 con el adapter LoRA. La validación es el conjunto donde se eligió step-00025, por lo que sus puntuaciones pueden sobreestimar; el test temporal es descriptivo.

| Medida | int4-awq | adapter (bf16 + LoRA) |
|---|---|---|
| Validación, correctas / evaluadas | 280/293 (95,6%) | 287/293 (98,0%) |
| Test temporal, correctas / evaluadas | 1699/1740 (97,6%) | 1700/1740 (97,7%) |
| Validación, cifras iguales a la variante adapter | 353/360 cifras, 56/60 comunicados | (él mismo) |
| Test temporal, cifras iguales a la variante adapter | 2034/2076 cifras, 328/346 comunicados | (él mismo) |
| Validación, cifras iguales a la ejecución de stage 2 del adapter | 353/360 cifras, 56/60 comunicados | 360/360 cifras, 60/60 comunicados |
| Test temporal, cifras iguales a la ejecución de stage 2 del adapter | 2032/2076 cifras, 328/346 comunicados | 2069/2076 cifras (dato truncado en la model card) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 5,68 GiB en 4 bits; con overhead de KV cache y activaciones para 40.960 tokens de contexto, se recomienda al menos 16-24 GB de VRAM.
- GPU recomendadas: NVIDIA H100 NVL (validada en el benchmark del autor), A100 40/80 GB, L40S. Cualquier GPU con soporte para CUDA 13.0 o posterior.
- GPU de consumo: cabe en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB), siempre que se ajuste `--max-model-len` al presupuesto de VRAM disponible.
- Opciones de despliegue: vLLM 0.32.0 (recomendado, soporta el formato pack-quantized de compressed-tensors de forma nativa); transformers con compressed-tensors instalado (sin las optimizaciones de serving de vLLM). No se menciona soporte para llama.cpp, Ollama ni TGI en la información disponible.
- Requisito de driver: los wheels de vLLM 0.32.0 están compilados para CUDA 13.0, por lo que el servidor necesita un driver NVIDIA para CUDA 13.0 o superior.
- Latencia y throughput: no disponibles en la información proporcionada más allá del coste por GPU-hora del benchmark.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-sec-earnings-int4-awq | 2.174.236.152 (4-bit) | 40.960 | Extracción financiera especializada | apache-2.0 | Hugging Face, vLLM |
| Qwen/Qwen3-8B (base) | 8B (bf16) | no disponible en esta ficha | Propósito general | apache-2.0 | Hugging Face |
| qwen3-8b-sec-earnings-lora (adapter) | 8B + LoRA | no disponible en esta ficha | Extracción financiera especializada | apache-2.0 | Hugging Face |

No se dispone de información sobre otros modelos especializados en extracción de métricas de comunicados de resultados con los que comparar directamente en términos de benchmarks.

## Limitaciones y advertencias

- El modelo solo soporta inglés; los comunicados en otros idiomas no están cubiertos.
- Es un modelo especializado: fuera de la tarea de extracción de métricas financieras su rendimiento no está validado y probablemente sea inferior al de Qwen3-8B sin ajustar.
- Riesgo de alucinación en cifras: aunque el benchmark reporta un 97,6% de acierto en el test temporal, un 2,4% de cifras incorrectas implica que en producción es necesario validar los valores extraídos (por ejemplo, contra XBRL) antes de usarlos en decisiones financieras.
- Las puntuaciones de validación pueden estar sobreestimadas porque step-00025 se eligió sobre ese mismo conjunto; el test temporal es la referencia más fiable, aunque el autor lo describe como descriptivo.
- La cuantización introduce una pérdida medible: 95,6% frente a 98,0% en validación y 97,6% frente a 97,7% en test temporal respecto al adapter en bf16.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-8B; conviene revisar la licencia de Qwen3-8B para confirmar compatibilidad.
- El despliegue con vLLM 0.32.0 exige driver NVIDIA para CUDA 13.0 o superior, lo que puede limitar entornos con drivers antiguos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad sobre su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jinnn2001/qwen3-8b-sec-earnings-int4-awq
- Adapter LoRA base: https://huggingface.co/Jinnn2001/qwen3-8b-sec-earnings-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset del benchmark: https://huggingface.co/datasets/Jinnn2001/sec-earnings-bench
- Código, método y resultados completos (GitHub): https://github.com/jinnn11/sec-earnings-bench
- Resultados de serving: https://github.com/jinnn11/sec-earnings-bench/blob/main/results/serving_results.md
- Explorador de resultados (Space): https://huggingface.co/spaces/Jinnn2001/sec-earnings-explorer
