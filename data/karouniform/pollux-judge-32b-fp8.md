# KaroUniform/pollux-judge-32b-FP8

## Resumen

pollux-judge-32b-FP8 es la versión cuantizada en FP8 de pollux-judge-32b, un modelo de lenguaje de 32.759.790.592 parámetros (32,7B) especializado en la tarea de "LLM-as-a-judge" para ruso, desarrollado originalmente por el equipo de ai-forever dentro del proyecto POLLUX. Esta variante la publica el usuario KaroUniform y mantiene la misma interfaz de prompt y el mismo formato de salida (`... [RESULT] n [END]`) que el modelo original, por lo que es un reemplazo directo orientado a servir el modelo con mayor velocidad en GPUs NVIDIA Hopper y Blackwell.

El modelo se basa en la arquitectura Qwen2 (tag `qwen2` en Hugging Face) y está pensado para evaluar respuestas generadas por otros modelos según criterios y rúbricas, una pieza habitual en pipelines de evaluación automática, anotación y filtrado de datos. La cuantización reduce el peso en disco de 65,5 GB a 39,7 GB y, según la model card, incrementa el throughput de prefill en un factor de 1,43 y el de decodificación en un factor de 1,34 respecto al original en BF16, manteniendo una concordancia agregada con expertos humanos estadísticamente indistinguible.

Su relevancia ahora es práctica: permite desplegar un juez de 32B en infraestructura más modesta y con mayor rendimiento, con licencia MIT y compatibilidad con SGLang, vLLM y text-generation-inference. La contrapartida es que el modelo solo declara soporte de ruso y que los veredictos individuales cambian con algo más de frecuencia que en BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (tag `qwen2`) |
| Parámetros totales | 32.759.790.592 (32,7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | FP8 E4M3 con `compressed-tensors` (W8A8 block-wise); capas sensibles en BF16 |
| Idiomas soportados | ruso (`ru`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 39,7 GB) |

## Arquitectura y entrenamiento

El modelo original es un transformer denso de 32,7B parámetros basado en Qwen2, afinado como juez para ruso. Esta versión FP8 no reentrena el modelo: aplica cuantización post-entrenamiento con `compressed-tensors` en formato FP8 E4M3. La mayoría de las capas lineales son W8A8 con escalas estáticas simétricas por bloque de 128×128 en pesos y escalas dinámicas por grupo de 128 valores en activaciones, la misma ruta de kernels que el FP8 block-wise estilo DeepSeek. Se mantienen en BF16 152 de las 448 matrices lineales: las proyecciones `q/k/v/o` de las capas 32–63, todas las lineales de las capas 56–63, `lm_head`, embeddings y normas. La selección se hizo con un mapa de sensibilidad por módulo basado en KL teacher-forced respecto al modelo BF16.

El redondeo de los códigos FP8 se hizo con GPTQ sobre datos de calibración con licencia abierta, manteniendo fijas las escalas max-abs de RTN. El procedimiento usó 256 secuencias de hasta 4K tokens (459K tokens) más 64 secuencias de validación, muestreadas de una mezcla de 104.622 prompts construida a partir de datasets rusos abiertos (cultura_ru_edu, T-Wix, GrandMaster-PRO-MAX-Qwen3-synthetic, ru-llm-judge-dataset, habr_qa_sbs, oasst2, HelpSteer3 y aya_dataset). El 84 % de los prompts son de estilo juez (instrucción, respuesta, criterio, rúbrica y respuesta de referencia opcional) y el 5 % son prompts largos de 8–15K tokens. El error de salida de las matrices cuantizadas se redujo a ×0,45 de RTN en calibración y ×0,53 en validación, y el KL teacher-forced a BF16 pasó de 8,14 a 6,58 (×10⁻⁴). El coste de cuantización fue de unos 30 minutos en una H200. La caché KV se mantiene en BF16: la model card desaconseja `--kv-cache-dtype fp8_e4m3` sin escalas calibradas.

## Capacidades

- Evaluación automática de respuestas (LLM-as-a-judge) con criterios, rúbricas y respuesta de referencia opcional.
- Emisión de veredictos numéricos en un formato estructurado y estable (`... [RESULT] n [END]`).
- Procesamiento de prompts largos de evaluación (hasta 8–15K tokens en el conjunto de calibración).
- Generación de texto conversacional en ruso.
- Evaluación de respuestas con fundamento documental (document-grounded tasks).
- No se declara soporte de tool calling ni de function calling en la información disponible.
- No se declara modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidad multilingüe limitada al ruso según los metadatos del modelo.

## Casos de uso

- Evaluación automática de respuestas de chatbots en ruso: el modelo recibe instrucción, respuesta, criterio y rúbrica y devuelve una puntuación en el formato `[RESULT] n [END]`, lo que permite integrarlo en pipelines de control de calidad sin postprocesado complejo.
- Filtrado y curación de datasets sintéticos: actúa como juez para puntuar pares pregunta-respuesta generados por modelos pequeños y descartar los de baja calidad antes de incluirlos en un corpus de entrenamiento.
- Anotación asistida de preferencias: con prompts de estilo juez y respuesta de referencia, puede preetiquetar comparaciones A/B que después revisan anotadores humanos, reduciendo el coste de anotación.
- Evaluación de sistemas RAG en ruso: al soportar tareas con fundamento documental, puede puntuar si una respuesta está respaldada por el contexto recuperado.
- Benchmarking interno de modelos: sirve como evaluador reproducible en pruebas de regresión de modelos candidatos, con throughput suficiente para procesar lotes grandes en GPUs Hopper.
- Moderación y scoring de contenido en producción: el formato de salida numérico permite umbralizar respuestas automáticamente en servicios de atención al cliente o foros en ruso.
- Evaluación de respuestas largas: los prompts de 8–15K tokens usados en calibración indican que puede manejar documentos y respuestas extensas dentro de una misma evaluación.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks académicos (MMLU, HumanEval, GSM8K), pero sí métricas de cuantización y rendimiento comparadas con el original en BF16:

| Métrica | BF16 original | pollux-judge-32b-FP8 |
|---|---|---|
| Peso en disco | 65,5 GB | 39,7 GB |
| Throughput de prefill (H200, SGLang) | 9.762 tok/s | 13.979 tok/s (×1,43) |
| Decodificación, stream único | 56 tok/s | 75 tok/s (×1,34) |
| Paso de decodificación, batch 32 | 24,3 ms | 19,8 ms (×1,22) |
| MAE frente a puntuaciones de expertos (POLLUX, 1.500 ítems) | 0,527 | 0,527 |
| Misma puntuación que BF16 (greedy) | 97,3 % (BF16 frente a su propia repetición) | 94,3 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 40 GB solo para pesos en FP8; con caché KV en BF16 y overhead de runtime, se recomienda planificar al menos 48–80 GB según longitud de contexto y batch.
- GPU recomendadas: NVIDIA H200 (usada en las mediciones de la model card), H100 y GPUs Blackwell; el formato FP8 block-wise está optimizado para Hopper y Blackwell.
- En GPUs consumer: no cabe en una RTX 4090 (24 GB) con pesos FP8 completos; requeriría offloading o una cuantización adicional no incluida en este repo.
- Opciones de despliegue: SGLang y vLLM (soportan `compressed-tensors` FP8 y los nombres fusionados `qkv_proj`/`gate_up_proj` incluidos en `quantization_config.ignore`), además de text-generation-inference según los tags del repo. Transformers como librería base.
- Latencia y throughput: 13.979 tok/s de prefill y 75 tok/s de decodificación en stream único en H200 con SGLang; 19,8 ms por paso de decodificación con batch 32.
- No se recomienda usar `--kv-cache-dtype fp8_e4m3` con este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pollux-judge-32b-FP8 | 32,7B | no disponible | MIT | safetensors FP8 | Hugging Face (KaroUniform) |
| ai-forever/pollux-judge-32b (BF16) | 32,7B | no disponible | MIT | safetensors BF16 | Hugging Face (ai-forever) |
| Modelos juez de 32B en otros idiomas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el original en BF16: misma calidad agregada frente a expertos (MAE 0,527), menor huella en disco (39,7 GB frente a 65,5 GB) y mayor throughput, a cambio de una tasa de coincidencia por veredicto individual algo menor (94,3 % frente a 97,3 %). No se dispone de datos de benchmarks frente a otros modelos juez en la información proporcionada.

## Limitaciones y advertencias

- Solo declara soporte de ruso; el rendimiento en otros idiomas no está documentado.
- Los veredictos individuales cambian aproximadamente el doble de a menudo que en BF16 entre ejecuciones propias, aunque la concordancia agregada con expertos sea indistinguible.
- Riesgo de alucinación inherente a un modelo de 32B usado como juez; conviene validar contra anotaciones humanas en el dominio de aplicación.
- La caché KV en FP8 sin escalas calibradas degrada la calidad según la model card; debe mantenerse en BF16.
- Requiere kernels y runtimes con soporte de `compressed-tensors` FP8 block-wise; no funciona de forma óptima en GPUs sin FP8 nativo.
- Licencia MIT, que permite uso comercial, pero los datasets de calibración tienen licencias variadas (Apache-2.0, ODC-BY 1.0, MIT, CC-BY-SA-4.0, CC-BY-4.0) que conviene revisar si se redistribuye el modelo.
- El repo tiene muy pocas descargas y ningún "like", por lo que la validación comunitaria es prácticamente inexistente.
- No se especifica la longitud de contexto soportada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaroUniform/pollux-judge-32b-FP8
- Modelo base: https://huggingface.co/ai-forever/pollux-judge-32b
- Proyecto POLLUX: https://github.com/ai-forever/POLLUX
- Paper referenciado (arXiv:2505.24616): https://arxiv.org/abs/2505.24616
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Dataset deepvk/cultura_ru_edu: https://huggingface.co/datasets/deepvk/cultura_ru_edu
- Dataset t-tech/T-Wix: https://huggingface.co/datasets/t-tech/T-Wix
- Dataset RefalMachine/GrandMaster-PRO-MAX-Qwen3-synthetic: https://huggingface.co/datasets/RefalMachine/GrandMaster-PRO-MAX-Qwen3-synthetic
- Dataset AtesiT/ru-llm-judge-dataset: https://huggingface.co/datasets/AtesiT/ru-llm-judge-dataset
- Dataset RuBQ: https://huggingface.co/datasets/ai-forever/rubq-retrieval
- Dataset Vikhrmodels/habr_qa_sbs: https://huggingface.co/datasets/Vikhrmodels/habr_qa_sbs
- Dataset OpenAssistant/oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset nvidia/HelpSteer3: https://huggingface.co/datasets/nvidia/HelpSteer3
- Dataset CohereLabs/aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
