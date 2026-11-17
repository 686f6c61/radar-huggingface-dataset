# rasyosef/K2-Horizon-32B-DSpark

## Resumen

K2-Horizon-32B-DSpark es un modelo borrador (draft model) para decodificación especulativa sin pérdida, diseñado exclusivamente para acelerar la inferencia de IFM/K2-Horizon-32B-NVFP4. Lo desarrolla rasyosef y se entrenó con la librería `speculators` del proyecto vLLM. No es un modelo generativo autónomo: su función es proponer tokens que el verificador de 32B valida en cada paso, de modo que la salida final es idéntica a la del modelo grande pero producida con menos pasos de decodificación.

La arquitectura es de estilo Qwen3 con 4 capas y aproximadamente 1.120 millones de parámetros (1.122.578.689 según los pesos en safetensors), en bfloat16, con tamaño de bloque 8. El modelo base es un checkpoint NVFP4 de 32B, y el borrador se apoya en estados ocultos auxiliares extraídos de las capas 2, 16, 32, 48 y 62 del verificador, además de un vocabulario reducido de 32.000 tokens (frente a los 250.624 del modelo original).

Su relevancia es práctica: en las evaluaciones del autor, con temperatura 0 y concurrencia 1 sobre una NVIDIA RTX PRO 6000 Blackwell, multiplica el throughput por 5,09 en matemáticas, 4,33 en RAG y 3,75 en código, con una longitud media de aceptación de 4,117 tokens sobre 309.840 pasos de verificación. La licencia Apache 2.0 facilita su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Qwen3, 4 capas, draft model para decodificación especulativa (DSpark) |
| Parametros totales | 1.122.578.689 (~1,12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana deslizante de 512 en las 3 primeras capas; atención completa en la última. Evaluado hasta 8K tokens de secuencia |
| Tipos de cuantizacion | Pesos en bfloat16; pensado para verificar contra un checkpoint NVFP4 (no se probó el BF16 del verificador) |
| Idiomas soportados | No disponible (el modelo base no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,3 GB), con `custom_code` y compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El borrador sigue el esquema DSpark: un transformer de 4 capas con hidden size 5120, MLP de 8192, 40 cabezas de consulta y 8 de clave-valor (dimensión de cabeza 128). Las tres primeras capas usan atención de ventana deslizante de 512 tokens y la última atención completa, lo que reduce el coste de cada paso de propuesta. El vocabulario del borrador se recorta de 250.624 a 32.000 tokens, y el modelo consume estados ocultos auxiliares generados por las capas 2, 16, 32, 48 y 62 del verificador de 32B, lo que le permite alinear sus propuestas con la distribución del modelo grande.

El entrenamiento usó 100.000 prompts de `mlabonne/open-perfectblend` con respuestas generadas por el propio verificador, longitud de secuencia 8192, 3 épocas, learning rate 3e-4 con decaimiento coseno y 4% de warmup. La función de pérdida combina entropía cruzada y distancia de variación total con pesos `{"ce": 0.1, "tv": 0.9}`. Todo el entrenamiento se ejecutó en una única NVIDIA RTX PRO 6000 Blackwell Server Edition de 96 GB. El tamaño de bloque es 8, es decir, hasta 8 tokens especulativos por paso de verificación más el token de bonificación.

## Capacidades

- Aceleración de decodificación sin pérdida: garantiza la misma distribución de salida que el verificador K2-Horizon-32B-NVFP4, ya que cada propuesta se valida.
- Generación de tokens candidatos en bloque (hasta 8 por paso) con aceptación media de 4,117 tokens por verificación.
- Soporte de tool calling en el pipeline de vLLM mediante `--enable-auto-tool-choice --tool-call-parser k2_horizon` (el parser pertenece al verificador).
- Integración con el parser de razonamiento `k2_horizon` para modos de pensamiento del modelo base.
- Compatibilidad con vLLM a través de `--speculative-config` y con transformers mediante `trust_remote_code`.
- No soporta visión, audio ni otras modalidades por sí mismo; hereda las capacidades del verificador solo en la medida en que este las tenga.
- Rendimiento de aceptación variable según tarea: mejor en matemáticas y RAG, peor en resumen y traducción.

## Casos de uso

- Serving de matemáticas y razonamiento: con aceptación de 5,911 tokens por paso y 284,2 tokens/s frente a 55,8 de línea base, es adecuado para asistentes de resolución de problemas donde la latencia domina la experiencia.
- RAG sobre documentación técnica: la aceptación de 4,926 tokens por paso y el throughput de 235,3 tokens/s permiten responder con contexto recuperado en menos tiempo, siempre que las secuencias no superen los 8K tokens evaluados.
- Generación de código en pipelines de CI/CD: 207,1 tokens/s en HumanEval (3,75× de mejora) lo hacen útil para autocompletado, generación de tests o revisión automática de parches donde se requiere baja latencia.
- Agentes con tool calling: aunque la aceptación en `tool_call` baja a 3,589, el pipeline de vLLM con `--enable-auto-tool-choice` permite desplegar agentes multi-paso sobre el verificador con aceleración moderada.
- Chat de atención al cliente de turnos cortos: la categoría `qa` rinde 4,112 tokens por paso; útil para respuestas conversacionales donde el coste por token importa.
- Traducción y resumen por lotes: con aceptaciones de 3,014 y 2,716 respectivamente, la mejora es menor pero sigue siendo positiva; conviene medir en el dominio concreto antes de desplegar.
- Despliegue en una sola GPU de 96 GB: al entrenarse y evaluarse en una RTX PRO 6000 Blackwell, es una opción realista para equipos con hardware de gama profesional única.

## Benchmarks y rendimiento

Evaluación con `RedHatAI/speculator_benchmarks`, temperatura 0, concurrencia 1, una NVIDIA RTX PRO 6000 Blackwell. La línea base es K2-Horizon-32B-NVFP4 sin decodificación especulativa.

| Subconjunto | Baseline (tok/s) | DSpark (tok/s) | Aceleración |
|---|---|---|---|
| math_reasoning | 55,8 | 284,2 | 5,09× |
| rag | 54,4 | 235,3 | 4,33× |
| HumanEval | 55,3 | 207,1 | 3,75× |

Longitud de aceptación por subconjunto (máximo 9,0 con bloque de 8):

| Subconjunto | acceptance_length | pos_0 | pos_3 | pos_7 |
|---|---|---|---|---|
| math_reasoning | 5,911 | 89,8% | 62,0% | 40,1% |
| rag | 4,926 | 82,4% | 48,2% | 25,5% |
| writing | 4,258 | 76,2% | 38,5% | 20,0% |
| HumanEval | 4,215 | 80,8% | 37,9% | 16,7% |
| question | 4,143 | 75,1% | 37,2% | 18,7% |
| qa | 4,112 | 75,9% | 37,8% | 17,4% |
| tool_call | 3,589 | 72,3% | 30,1% | 9,9% |
| translation | 3,014 | 67,2% | 21,2% | 4,5% |
| summarization | 2,716 | 66,9% | 16,5% | 1,4% |

Media ponderada global: 4,117 sobre 309.840 pasos de verificación. No se han publicado resultados de benchmarks de calidad del verificador (MMLU, GSM8K, etc.) en la información disponible, ya que el borrador no altera la distribución de salida.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 2,2 GB en bfloat16 para los 1,12B parámetros, más overhead de KV cache y estados ocultos auxiliares; la memoria dominante la consume el verificador de 32B en NVFP4.
- El verificador K2-Horizon-32B-NVFP4 requiere una GPU con suficiente VRAM para 32B en NVFP4; el autor lo ejecutó en una NVIDIA RTX PRO 6000 Blackwell Server Edition de 96 GB.
- No se han publicado pruebas en GPUs de consumo (RTX 4090, 5090, etc.); el borrador en sí cabría en cualquier GPU consumer, pero el verificador de 32B condiciona el despliegue.
- Despliegue recomendado: vLLM con `--speculative-config '{"model": "rasyosef/K2-Horizon-32B-DSpark", "num_speculative_tokens": 8}'`, `--trust-remote-code`, `--reasoning-parser k2_horizon` y `--max-model-len 32768`.
- Throughput medido: 284,2 tok/s en matemáticas, 235,3 en RAG y 207,1 en HumanEval, con concurrencia 1 y temperatura 0.
- No hay datos de latencia ni throughput con carga concurrente ni con temperatura mayor que 0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-32B-DSpark | ~1,12B | 8K evaluados | Draft model DSpark para K2-Horizon-32B-NVFP4 | Apache 2.0 | Hugging Face |
| EAGLE-3 draft models | No disponible en la información | No disponible | Decodificación especulativa basada en EAGLE | Varía por checkpoint | Hugging Face |
| Medusa heads | No disponible en la información | No disponible | Cabezas de decodificación especulativa | Varía por checkpoint | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. La comparativa cualitativa se limita a la familia de técnicas (DSpark frente a EAGLE y Medusa) y a la dependencia estricta del verificador concreto.

## Limitaciones y advertencias

- Solo funciona con K2-Horizon-32B; no es reutilizable con otros verificadores.
- Entrenado y evaluado contra el checkpoint NVFP4; el checkpoint BF16 no se probó.
- No se evaluó con sampling (temperatura mayor que 0), carga concurrente ni contextos superiores a 8K tokens.
- La aceleración depende del dominio: cae a 3,014 en traducción y 2,716 en resumen, donde la aceptación es baja.
- El modelo no genera respuestas por sí mismo; requiere el verificador y añade complejidad operativa al despliegue.
- Riesgo de alucinación y sesgos: heredados del verificador, no del borrador, que no altera la distribución de salida.
- El uso de `trust_remote_code` implica ejecutar código del repositorio; conviene auditar el `custom_code` antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del verificador debe verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rasyosef/K2-Horizon-32B-DSpark
- Modelo base: https://huggingface.co/IFM/K2-Horizon-32B-NVFP4
- Librería speculators: https://github.com/vllm-project/speculators
- Código de entrenamiento: https://github.com/rasyosef/train-dspark-draft-models
- Dataset de evaluación: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/open-perfectblend
