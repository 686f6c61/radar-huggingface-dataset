# Sapolas0730/gpt2-medium355M-finance-cc

## Resumen

`gpt2-medium355M-finance-cc` es un modelo de lenguaje de 355 millones de parámetros desarrollado por Sapolas0730, que parte de la arquitectura GPT-2 medium de OpenAI y se ha afinado (fine-tuning) con un conjunto de 850 pares de instrucción-respuesta en japonés, orientados a escenarios de atención al cliente en el sector bancario. Los datos de entrenamiento fueron generados de forma sintética mediante el método MAGPIE, que utiliza el modelo Llama-3-8B-Instruct para producir ejemplos de alta calidad sin intervención humana directa.

El modelo se presenta como un experimento técnico y educativo, con un enfoque en la evaluación de metodologías de fine-tuning con pocos datos. Su implementación se basa en el código de `rasbt/LLMs-from-scratch` e introduce una clase `GPTModel` personalizada que no es compatible con el `GPT2LMHeadModel` de Hugging Face, lo que obliga a utilizar el script `model_arch.py` incluido en el repositorio para cargar los pesos. Aunque su tamaño es modesto, su interés radica en la combinación de técnicas de síntesis de datos y fine-tuning de instrucciones aplicadas a un modelo pequeño.

A pesar de ser un modelo de demostración sin uso comercial directo, su publicación aporta valor para la comunidad de investigación, ya que documenta un flujo completo de generación de datos sintéticos, entrenamiento y evaluación de un modelo de instrucción en un idioma con recursos limitados. La ventana de contexto es de 1024 tokens y la licencia combina términos de Apache 2.0 para el código y Modified MIT para los pesos base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 medium (Transformer decoder-only, 24 capas, 16 cabezas de atención, dimensión de embedding 1024) |
| Parametros totales | 355 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (no se han publicado pesos cuantizados) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Código: Apache License 2.0; pesos base: Modified MIT License (OpenAI) |
| Formato de pesos | PyTorch `.pth` (cargados con la clase `GPTModel` personalizada, no compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura GPT-2 medium, un transformer decoder-only de 24 capas, 16 cabezas de atención y una dimensión de embedding de 1024, con un vocabulario de 50257 tokens y una ventana de contexto de 1024 tokens. Los pesos preentrenados provienen de `openai-community/gpt2-medium`, publicados bajo licencia Modified MIT.

El proceso de entrenamiento consiste en un fine-tuning supervisado sobre 850 pares de instrucciones y respuestas en japonés, generados sintéticamente mediante el método MAGPIE. Este método emplea el modelo `Meta-Llama-3-8B-Instruct` para producir instrucciones y respuestas de alta calidad de forma automática, a partir de un conjunto de 1000 pares iniciales de los cuales se descartaron 150 para validación. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es un ajuste clásico de pesos con una función de pérdida de entropía cruzada.

Una característica técnica relevante es que el modelo no se implementa con la API estándar de Hugging Face, sino con una clase `GPTModel` desarrollada a partir del repositorio `rasbt/LLMs-from-scratch`. Esta implementación replica la arquitectura GPT-2 pero no es compatible con el `GPT2LMHeadModel`, por lo que el repositorio incluye el script `model_arch.py` necesario para la carga de los pesos. No se documentan técnicas avanzadas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en japonés: es capaz de producir respuestas coherentes a instrucciones relacionadas con la atención al cliente bancaria, como consultas sobre saldos, procedimientos o reclamaciones.
- Comprensión de instrucciones: entrenado con pares de instrucciones y respuestas, puede seguir comandos simples en formato de diálogo.
- Respuestas de estilo conversacional: orientado a escenarios de chat de soporte, aunque con limitaciones de vocabulario y dominio.
- Multilingüismo: limitado al japonés; no se ha entrenado ni evaluado en otros idiomas.
- Sin capacidades especiales: no soporta tool calling, agentes, visión, audio ni razonamiento multi-step avanzado.

## Casos de uso

- Prototipado de asistentes bancarios en japonés: el modelo puede utilizarse para generar respuestas de ejemplo en un entorno de desarrollo, sirviendo como base para un chatbot de demostración en el sector financiero.
- Evaluación de técnicas de fine-tuning con datos sintéticos: su código y metodología son útiles para investigadores que quieran replicar el proceso de MAGPIE con otros modelos base.
- Generación de contenido de práctica: puede crear diálogos simulados de atención al cliente para entrenar a personal o validar sistemas de clasificación de intenciones.
- Análisis de calidad de respuestas: al ser un modelo pequeño, permite estudiar el efecto de la cantidad de datos de instrucción en la calidad de las respuestas.
- Benchmark educativo en entornos con recursos limitados: su tamaño de 355M permite ejecutarlo en GPUs de gama media, siendo útil para cursos de PLN.
- Experimentación en generación con sampling: su propensión a bucles con decodificación greedy lo convierte en un caso de estudio para técnicas de muestreo y parámetros de temperatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 1,4 GB, por lo que se recomienda al menos 2 GB de VRAM para ejecución sin cuantización. Con fp16 o int8, la memoria se reduce a unos 0,7 GB y 0,35 GB respectivamente, aunque no se proporcionan pesos cuantizados.
- GPU recomendadas: tarjetas con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores, son suficientes para inferencia. En CPU también es viable, pero con mayor latencia.
- Compatibilidad con GPU consumer: sí, cabe en GPUs de consumo medio y bajo.
- Opciones de despliegue: no se puede usar directamente con vLLM, Ollama o TGI, ya que la clase `GPTModel` personalizada no es compatible con `transformers`. Requiere el script `model_arch.py` del repositorio y el uso de PyTorch.
- Latencia y throughput: no se dispone de datos medidos, pero por su tamaño se espera una generación de varias decenas de tokens por segundo en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gpt2-medium355M-finance-cc` | 355M | 1024 | japonés | Apache 2.0 + Modified MIT | Repositorio HF, pesos `.pth` |
| `openai-community/gpt2-medium` (base) | 355M | 1024 | inglés | Modified MIT | API HF, compatible con `transformers` |
| Modelos de fine-tuning japoneses de GPT-2 (p. ej., `rinna/japanese-gpt2-medium`) | 355M | 1024 | japonés | Apache 2.0 | API HF, compatible |

No se han publicado comparativas de rendimiento con estos modelos en la información disponible. La principal diferencia con el modelo base es el dominio de entrenamiento (atención al cliente en japonés) y la limitación de uso a un código específico, mientras que alternativas como `rinna/japanese-gpt2-medium` ofrecen compatibilidad directa con el ecosistema Hugging Face.

## Limitaciones y advertencias

- Bucle de repetición: la decodificación greedy (temperature=0) puede provocar la repetición de frases idénticas; se recomienda usar sampling con `temperature` y `top_k`.
- Datos de entrenamiento limitados: solo 850 ejemplos sintéticos, que no reflejan la diversidad ni la complejidad de la atención real en banca.
- No apto para producción: el autor indica explícitamente que no es adecuado para uso comercial o en entornos reales.
- Compatibilidad restringida: los pesos no son compatibles con `transformers`; se requiere el script `model_arch.py` incluido en el repositorio.
- Sesgos inherentes a GPT-2: como modelo de base, puede heredar sesgos de género, raciales o culturales presentes en el corpus original de GPT-2.
- Riesgo de alucinación: al ser un modelo pequeño entrenado con datos sintéticos, es propenso a generar información falsa o incoherente.
- Idioma único: solo funciona en japonés; no se ha evaluado en otros idiomas.

## Enlaces

- Repositorio del modelo: [https://huggingface.co/Sapolas0730/gpt2-medium355M-finance-cc](https://huggingface.co/Sapolas0730/gpt2-medium355M-finance-cc)
- Paper MAGPIE (método de generación de instrucciones): [https://arxiv.org/abs/2406.08464](https://arxiv.org/abs/2406.08464)
- Código base (rasbt/LLMs-from-scratch): [https://github.com/rasbt/LLMs-from-scratch](https://github.com/rasbt/LLMs-from-scratch)
- Modelo base GPT-2 medium: [https://huggingface.co/openai-community/gpt2-medium](https://huggingface.co/openai-community/gpt2-medium)
- Repositorio con pesos de GPT-2 medium (referencia): [https://huggingface.co/rasbt/gpt2-from-scratch-pytorch](https://huggingface.co/rasbt/gpt2-from-scratch-pytorch)
