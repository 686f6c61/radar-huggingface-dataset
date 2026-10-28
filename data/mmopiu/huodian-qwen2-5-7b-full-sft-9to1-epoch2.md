# mmopiu/huodian-qwen2.5-7b-full-sft-9to1-epoch2

## Resumen

El modelo `huodian-qwen2.5-7b-full-sft-9to1-epoch2` es un ajuste fino completo (full fine-tuning, no LoRA) del modelo base Qwen2.5-7B-Instruct, publicado por el usuario mmopiu en Hugging Face. El nombre del repositorio indica su dominio de especialización: "huodian" (火电, energía termoeléctrica en chino) y un régimen de mezcla de datos 9:1 entre datos generales y datos de dominio, con el punto de control seleccionado en la época 2, paso 368. El problema que aborda es la adaptación de un modelo conversacional de propósito general al vocabulario y los procedimientos técnicos del sector de generación termoeléctrica, incluyendo tareas como la explicación de operaciones de regulación de carga (深度调峰, "peak shaving" profundo).

Arquitectónicamente es un transformer decoder-only denso de la familia Qwen2, con aproximadamente 7.615 millones de parámetros derivados del tamaño del fichero original (15.231.272.152 bytes en BF16, 339 tensores) y una longitud de contexto configurada de 32.768 tokens. Se publica como pesos BF16 completos reempaquetados en 8 fragmentos safetensors estándar, sin cuantización ni conversión numérica, y conserva el tokenizer, la plantilla de chat y la configuración de generación del directorio `best_model` original.

Su relevancia actual es doble: por un lado, ilustra el patrón de especialización vertical de modelos abiertos de 7B para sectores industriales regulados; por otro, el propio repositorio documenta un proceso de trazabilidad poco habitual (hashes SHA-256 del fichero original, evidencias de selección de checkpoint con `selection_sealed.json` y verificación de integridad). Conviene señalar que la model card indica que la transferencia de pesos no ha finalizado y que no debe usarse hasta que aparezca `READY.json`; el tamaño reportado del repositorio es de 0,0 GB en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (heredada de Qwen2.5-7B-Instruct) |
| Parámetros totales | ~7.615 millones (derivado de 15.231.272.152 bytes en BF16, 339 tensores) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según la configuración del checkpoint |
| Tipos de cuantización | El repositorio solo publica pesos BF16; no incluye ni documenta cuantizaciones |
| Idiomas soportados | Chino (zh) e inglés (en), según los metadatos del autor |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en 8 fragmentos + `model.safetensors.index.json` (BF16) |

Otros datos de configuración: `pipeline_tag: text-generation`, librería `transformers`, tag `endpoints_compatible` (compatible con Text Generation Inference), `trust_remote_code=False` en la carga indicada, y requisitos de inferencia en Linux, Python 3.11 y entorno NVIDIA con CUDA.

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención causal estándar, y se somete a un ajuste fino de todos los parámetros (full-parameter SFT, BF16), no a una adaptación de bajo rango. El entrenamiento corresponde al experimento identificado como `full_sft_9to1_3epochs_20261026_r1`, con una mezcla de muestreo 9:1 y un total previsto de 3 épocas. El punto de control publicado es la época 2, paso 368, seleccionada como mejor época interna de este experimento concreto (el autor aclara explícitamente que no representa el mejor resultado global entre todos los experimentos de mezcla). El conjunto de test no participó en la selección del punto de control; el detalle consta en `selection_sealed.json`.

El proceso de publicación incluye controles de integridad poco frecuentes: el fichero original de pesos tenía SHA-256 `4390ddf151373b5300a7c81171a79146c10b276b32edd20dd03aea6d451a7ee5` y 15.231.272.152 bytes con 339 tensores BF16; la versión publicada se reempaquetó en 8 fragmentos safetensors preservando nombres de tensor, formas, dtype y bytes de datos, sin cuantización ni conversión numérica. El repositorio no contiene datos de entrenamiento, estado del optimizador ni estado de reanudación, por lo que no permite reproducir el entrenamiento histórico; el fichero `F-E1.yaml` se conserva únicamente como registro y sus rutas no son válidas para un nuevo entorno. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO posteriores al SFT.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés, heredada del modelo base y especializada en terminología de energía termoeléctrica.
- Explicación de conceptos operativos del sector, como la regulación de carga profunda (深度调峰) citada en el ejemplo de inferencia de la model card.
- Razonamiento técnico sobre procedimientos, alarmas, parámetros de planta y mantenimiento, en la medida en que estén representados en los datos de ajuste (no documentados).
- Soporte de plantilla de chat propia de Qwen2.5, lo que permite integrarlo con el formato de mensajes `system`/`user`/`assistant`.
- Capacidad de ejecución totalmente offline mediante el script `infer.py` incluido y pesos locales.
- No se documentan en la información disponible capacidades de tool calling, uso de agentes, visión, audio, ni modos explícitos de "thinking"; cualquier capacidad de este tipo dependería del modelo base y no está verificada en este checkpoint.

## Casos de uso

- Asistente técnico de sala de control: resolución de dudas de operadores sobre procedimientos de arranque, parada y cambios de carga, aprovechando los 32.768 tokens de contexto para adjuntar varios procedimientos completos en el mismo prompt.
- Interpretación de alarmas y códigos de planta: traducción de una alarma concreta a una explicación de causa probable y pasos de verificación, siempre con revisión humana dado el carácter crítico del dominio.
- Formación de personal: generación de preguntas y respuestas de estudio, resúmenes de manuales internos y escenarios de práctica a partir de documentación técnica en chino.
- Redacción de informes de turno: conversión de notas dispersas en un informe estructurado con secciones de incidencias, parámetros relevantes y observaciones.
- Apoyo documental en cumplimiento ambiental: resumen y comparación de normativa de emisiones o de límites operativos, con la advertencia de que la normativa debe verificarse en la fuente oficial.
- Base para un asistente de intranet especializado: al ser Apache-2.0 y de 7B, puede desplegarse en infraestructura propia sin salida de datos a terceros, un requisito habitual en el sector energético.
- Punto de partida para experimentos de ajuste adicional: su formato estándar safetensors y su licencia permisiva facilitan comparar con otros checkpoints del mismo experimento o aplicar DPO posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, C-Eval, etc.) en la información disponible. El único dato de evaluación es interno y corresponde al proceso de selección de checkpoint: media macro con las cuatro categorías igualadas de **72,16507377598927/100** sobre el conjunto de validación, en la época 2, paso 368, del experimento 9:1. Este valor no es comparable con métricas públicas de terceros y no se ha validado contra el conjunto de test.

| Evaluación | Conjunto | Resultado | Notas |
|---|---|---|---|
| Media macro de 4 categorías (igual peso) | Validación interna | 72,16507377598927 / 100 | Punto de control época 2, paso 368; test no usado en selección |
| MMLU, HumanEval, GSM8K, C-Eval | — | No disponible | No publicados |
| Comparación con el modelo base | — | No disponible | No se reporta evaluación diferencial frente a Qwen2.5-7B-Instruct |

## Requisitos de hardware

- VRAM para inferencia en BF16: los pesos ocupan ~15,2 GB; con caché KV y activaciones para contexto moderado, el requisito práctico ronda los 17-20 GB. La propia model card referencia pruebas de carga en GPU de 24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para servicio concurrente con contexto largo; RTX 3090/4090 (24 GB) para inferencia BF16 de una sola instancia.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y, en general, en cualquier tarjeta con 24 GB o más en BF16. Por debajo de 24 GB sería necesario cuantizar, algo que el autor no ha publicado (estimación: ~8 GB en 8 bits y ~4,5 GB en 4 bits, no verificada).
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `trust_remote_code=False` (soporte declarado), script `infer.py` incluido, y Text Generation Inference (el repositorio lleva el tag `endpoints_compatible`). El soporte en vLLM, llama.cpp u Ollama es previsible por la arquitectura Qwen2, pero no está documentado por el autor y requeriría conversión propia a GGUF.
- Latencia y throughput: no disponibles; la model card remite a `GPU_ACCEPTANCE.json` para los resultados de carga en 24 GB, fichero que no consta en la información proporcionada.
- Advertencia operativa: no cargar el modelo hasta que el repositorio contenga `READY.json`; el autor indica que la transferencia de pesos está en curso y que la aceptación de integridad no ha concluido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huodian-qwen2.5-7b-full-sft-9to1-epoch2 | ~7,62 B (denso) | 32.768 | Validación interna 72,17/100 (macro de 4 clases); sin benchmarks públicos | Apache-2.0 | Repositorio HF; pesos no verificados como completos en el momento de la consulta |
| Qwen2.5-7B-Instruct (base) | ~7,62 B (denso) | 32.768 nativos en esta configuración | Benchmarks públicos del modelo original (no reproducidos aquí) | Apache-2.0 | Ampliamente disponible y estable |
| Llama-3.1-8B-Instruct | ~8,03 B (denso) | 128.000 | Benchmarks públicos del modelo original | Licencia comunitaria Llama 3.1 | Ampliamente disponible |
| Mistral-7B-Instruct-v0.3 | ~7,25 B (denso) | 32.768 | Benchmarks públicos del modelo original | Apache-2.0 | Ampliamente disponible |

La comparación relevante para este checkpoint es frente a su propio modelo base: el ajuste sacrifica previsiblemente parte del rendimiento general y multilingüe a cambio de especialización en dominio termoeléctrico en chino, pero no se aportan mediciones que cuantifiquen ese intercambio. No se dispone de comparaciones con otros checkpoints del mismo experimento (por ejemplo, la época 3 o variantes de mezcla) más allá de la referencia al histórico `full_sft_9to1_3epochs_20261026_r1`.

## Limitaciones y advertencias

- Disponibilidad: el repositorio indica explícitamente que los pesos se están transfiriendo y que no debe usarse hasta que aparezca `READY.json`; el tamaño reportado es de 0,0 GB. Intentar descargarlo ahora puede producir un modelo incompleto.
- Idiomas: solo se declaran chino e inglés. El rendimiento en castellano no está evaluado ni declarado, por lo que no debe asumirse paridad con el modelo base en otros idiomas.
- Dominio estrecho: es un ajuste fino de dominio sobre energía termoeléctrica con datos no documentados; es esperable cierto olvido catastrófico de capacidades generales (código, matemáticas, instrucciones complejas), aunque no se cuantifica.
- Riesgo de alucinación en contexto crítico: en un ámbito de seguridad industrial, cualquier valor de parámetro, límite normativo o paso de procedimiento generado debe verificarse contra la documentación oficial antes de su uso operativo.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni equidad; al entrenar sobre un corpus sectorial chino, puede reproducir sesgos de las fuentes originales.
- Reproducibilidad: no se publican datos de entrenamiento, composición del dataset, hiperparámetros efectivos ni estado del optimizador; `F-E1.yaml` se conserva solo como registro histórico y no es un punto de entrada válido para reentrenar.
- Comparabilidad de la métrica: el 72,17/100 es una media macro interna sobre validación con cuatro categorías, no un resultado de benchmark estándar; no sirve para comparar con otros modelos de la industria.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero se heredan las obligaciones de atribución y las condiciones del modelo base Qwen2.5-7B-Instruct, que conviene revisar antes de un despliegue en producción.
- Formato: solo se ofrecen pesos BF16 de ~15,2 GB; no hay versiones cuantizadas publicadas, lo que limita el despliegue en GPU de menos de 24 GB o en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mmopiu/huodian-qwen2.5-7b-full-sft-9to1-epoch2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Ficheros de trazabilidad citados en el repositorio (no verificados): `SOURCE_INTEGRITY.json`, `selection_sealed.json`, `GPU_ACCEPTANCE.json`, `READY.json`, `F-E1.yaml`, `infer.py`, `requirements-inference.txt`
- Papers, blogs, repositorios de código o demos adicionales: no disponibles en la información proporcionada.
