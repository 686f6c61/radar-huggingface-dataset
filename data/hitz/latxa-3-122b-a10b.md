# HiTZ/Latxa-3-122B-A10B

## Resumen

Latxa 3 122B-A10B es un modelo de lenguaje multimodal con adaptación al euskera, desarrollado por el centro de investigación HiTZ y el grupo IXA de la Universidad del País Vasco (UPV/EHU). Se construye mediante ajuste fino sobre Qwen3.5-122B-A10B, un modelo de arquitectura Mixture-of-Experts (MoE) con 122.000 millones de parámetros totales y aproximadamente 10.000 millones de parámetros activos por token. Es el modelo en euskera de mayor tamaño y capacidad publicado hasta la fecha por este grupo, dentro de la familia Latxa.

El modelo resuelve el problema de la baja representación del euskera en los grandes modelos generativos: la mayoría de los LLM se entrenan predominantemente con datos en inglés y rinden de forma deficiente en lenguas de bajos recursos. Latxa 3 sigue la metodología descrita en Sainz et al. (2025) para adaptar un modelo base multilingüe al euskera, conservando además las capacidades del modelo original en otros idiomas como el inglés.

Sus rasgos distintivos son el soporte de imágenes (pipeline image-text-to-text), una ventana de contexto de 262.144 tokens, el modo de razonamiento previo a la respuesta (thinking mode, el único soportado) y una licencia Apache 2.0 que permite uso comercial. Se distribuye en precisión completa BF16 (unos 245 GB) y en una variante FP8 para despliegues con menos memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 256 expertos, 8 enrutados + 1 compartido por token; multimodal (vision-lenguaje) |
| Parametros totales | 122.562.817.776 (122B) |
| Parametros activos | ~10B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (pesos completos publicados); variante FP8 oficial (HiTZ/Latxa-3-122B-A10B-FP8); otras cuantizaciones no disponibles |
| Idiomas soportados | Euskera (eu) como foco; inglés (en) y otros idiomas del modelo base retenidos pero no prioritarios |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Latxa 3 es un ajuste fino del modelo Qwen3.5-122B-A10B, una arquitectura Mixture-of-Experts con 256 expertos de los cuales se activan 8 enrutados más 1 compartido por token, lo que resulta en unos 10B de parámetros activos sobre 122B totales. El modelo es multimodal: procesa entradas de imagen y texto (pipeline image-text-to-text) y genera respuestas textuales. Incorpora un modo de razonamiento (thinking) que produce una cadena de pensamiento antes de la respuesta final; según la model card, solo se soporta este modo de thinking.

La adaptación al euskera se realizó siguiendo la metodología de Sainz et al. (2025), publicada en EMNLP 2025, y emplea el corpus HiTZ/latxa-corpus-v2 como conjunto de datos de ajuste. El modelo base aporta las capacidades multilingües y de visión, mientras que el ajuste fino especializa el comportamiento en euskera. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El desarrollo está financiado por el proyecto Ikergaitu del Gobierno Vasco.

## Capacidades

- Generación de texto conversacional e instruccional en euskera, con retención de capacidades en inglés y otros idiomas del modelo base.
- Razonamiento previo a la respuesta mediante modo thinking (único modo soportado).
- Comprensión de imágenes (entrada image-text-to-text) combinada con texto.
- Soporte de tool calling / function calling: la configuración recomendada de vLLM incluye `--enable-auto-tool-choice` y el parser `qwen3_coder`.
- Soporte de razonamiento multi-paso y uso en agentes, gracias al modo thinking y al contexto de 262.144 tokens.
- Capacidades multilingües: euskera como idioma principal y otros idiomas del modelo base (inglés, entre otros) retenidos.
- Traducción entre euskera, inglés y castellano (evaluada en FLORES y ALIA DocMT).
- Conocimiento cultural local (vasco) y global, evaluado en BertaQA.
- Despliegue compatible con clientes OpenAI (`endpoints_compatible`).

## Casos de uso

- Atención al cliente en euskera: el modelo puede mantener conversaciones multi-turno con un contexto de hasta 262.144 tokens, lo que permite arrastrar historiales largos y documentación de referencia sin truncar, algo crítico para administraciones y empresas que operan en euskera.
- Generación y revisión de texto administrativo en euskera estándar (batua): su buen rendimiento en las normas de batua (BAT, 81,8 % de precisión) lo hace adecuado para asistir en la redacción de documentos oficiales y su corrección normativa.
- Traducción profesional eu-en y eu-es: con chrF de 61,4 (eu-en) y 51,1 (eu-es) en FLORES, y mejores resultados en documentos (ALIA DocMT: 73,6 en eu-es), sirve para traducir documentación, actas y material editorial.
- Asistente educativo en euskera: puede resolver exámenes y preguntas de conocimiento (EusExams v2: 84,9 %; EusTrivia: 87,8 % en opción múltiple) y explicar el razonamiento paso a paso, útil en plataformas de aprendizaje.
- Procesamiento de documentos con imágenes: al ser multimodal, puede extraer y razonar sobre información de capturas, formularios escaneados o gráficos combinándolos con instrucciones textuales en euskera.
- Agentes con tool calling: integrado en vLLM con parser `qwen3_coder`, puede orquestar llamadas a APIs y flujos multi-paso en pipelines de automatización, aprovechando su contexto largo para mantener el estado de la tarea.
- Evaluación de calidad lingüística: como modelo de referencia para tareas de juicio automático (LLM judge) sobre textos en euskera, dado su rendimiento en pruebas abiertas evaluadas por juez.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| EusProficiency | Accuracy | 82,4 |
| EusReading | Accuracy | 87,8 |
| BAT (normas de batua) | Accuracy | 81,8 |
| EusExams v2 | Accuracy | 84,9 |
| EusTrivia | Accuracy (opción múltiple) | 87,8 |
| EusTrivia | Accuracy (abierta, LLM judge) | 63,5 |
| MMLU-Pro-eus | Accuracy (opción múltiple) | 77,2 |
| MMLU-Pro-eus | Accuracy (abierta, LLM judge) | 68,5 |
| BertaQA (local, MC, euskera) | Accuracy | 85,8 |
| BertaQA (local, MC, inglés) | Accuracy | 83,6 |
| BertaQA (local, abierta, euskera) | Accuracy | 60,3 |
| BertaQA (local, abierta, inglés) | Accuracy | 51,1 |
| BertaQA (global, MC, euskera) | Accuracy | 94,4 |
| BertaQA (global, MC, inglés) | Accuracy | 93,3 |
| BertaQA (global, abierta, euskera) | Accuracy | 77,2 |
| BertaQA (global, abierta, inglés) | Accuracy | 78,5 |
| FLORES | chrF eu-en | 61,4 |
| FLORES | chrF en-eu | 60,2 |
| FLORES | chrF eu-es | 51,1 |
| FLORES | chrF es-eu | 54,5 |
| ALIA DocMT | chrF eu-en | 67,3 |
| ALIA DocMT | chrF en-eu | 65,6 |
| ALIA DocMT | chrF eu-es | 73,6 |
| ALIA DocMT | chrF es-eu | 73,4 |

No se han publicado en la información disponible resultados de benchmarks estándar generales (MMLU en inglés, HumanEval, GSM8K) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Pesos BF16: aproximadamente 245 GB, por lo que se necesitan al menos 4 GPU de 80 GB (por ejemplo, 4×H100 o 4×A100 80GB).
- Variante FP8 oficial (HiTZ/Latxa-3-122B-A10B-FP8): requiere aproximadamente la mitad de memoria y puede ejecutarse en 2×A100 80GB o en una única H200.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en ninguna de las variantes publicadas; no se han publicado cuantizaciones de menor precisión (GGUF, AWQ, GPTQ).
- Despliegue recomendado: vLLM con `--tensor-parallel-size 4`, `--enable-expert-parallel`, `--max-model-len 262144`, `--gpu-memory-utilization 0.95`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y `--reasoning-parser qwen3`.
- Compatible con clientes OpenAI mediante endpoint `/v1`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Idiomas foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Latxa-3-122B-A10B | 122B (MoE) | ~10B | 262.144 | Euskera, inglés | Apache 2.0 | Hugging Face (BF16 y FP8) |
| Qwen3.5-122B-A10B (base) | 122B (MoE) | ~10B | no disponible | Multilingüe general | no disponible | Hugging Face |
| Modelos Latxa anteriores | no disponible | no disponible | no disponible | Euskera | no disponible | Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento de los modelos comparables para establecer una comparación cuantitativa; la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al derivar de un modelo base entrenado mayoritariamente con datos no vascos, pueden persistir sesgos culturales y lingüísticos del modelo original.
- Riesgo de alucinación: como todo LLM generativo, puede producir información falsa o inventada; la diferencia entre precisión en opción múltiple y en respuesta abierta (por ejemplo, EusTrivia 87,8 frente a 63,5) sugiere mayor fragilidad en generación libre.
- Solo se soporta el modo thinking; no hay modo de respuesta directa sin razonamiento, lo que incrementa la latencia y el consumo de tokens.
- El foco es el euskera; el rendimiento en otros idiomas no está garantizado ni evaluado en la model card.
- Requisitos de hardware muy elevados: no es desplegable en GPU de consumo y exige múltiples aceleradores de 80 GB en BF16.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-122B-A10B, cuya licencia no se detalla en la información disponible.
- No se han publicado cuantizaciones ligeras (GGUF, AWQ, GPTQ) ni datos de latencia o throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HiTZ/Latxa-3-122B-A10B
- Variante FP8: https://huggingface.co/HiTZ/Latxa-3-122B-A10B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Demo: https://latxa.hitz.eus
- Paper de metodología (Sainz et al., 2025, EMNLP): https://aclanthology.org/2025.emnlp-main.1484/
- Dataset de ajuste: https://huggingface.co/datasets/HiTZ/latxa-corpus-v2
- vLLM: https://github.com/vllm-project/vllm
- Contacto: hitz@ehu.eus
