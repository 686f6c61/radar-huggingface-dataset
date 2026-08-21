# DGurgurov/OpenThinker3-7B-SFT-GRPO-FR

## Resumen

OpenThinker3-7B-SFT-GRPO-FR es un modelo de razonamiento en francés desarrollado por Daniil Gurgurov como parte del pipeline de adaptación de razonamiento ReasonXL. Se basa en el modelo open-thoughts/OpenThinker-7B, que a su vez es un fine-tune de Qwen2.5-7B-Instruct sobre el dataset OpenThoughts3-1.2M. El objetivo de esta variante es trasladar la capacidad de razonamiento del inglés al francés mediante un proceso en dos etapas: primero un ajuste supervisado (SFT) sobre trazas de razonamiento en francés del dataset toroe/ReasonXL-SFT, y después un refuerzo con Dr. GRPO para recuperar la calidad de razonamiento perdida durante el SFT, manteniendo el idioma objetivo.

El modelo está pensado para investigadores y desarrolladores que necesitan capacidades de razonamiento matemático y lógico en francés, sin sacrificar el rendimiento frente a la versión original en inglés. Al estar basado en una arquitectura Qwen2 de 7B parámetros, ofrece un equilibrio entre capacidad y requisitos de hardware moderados. La licencia no está especificada en la información disponible, lo que limita su uso comercial sin verificación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder) |
| Parametros totales | 951.952.064 (según safetensors; modelo base de 7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-7B soporta 32 768 tokens) |
| Tipos de cuantizacion | No disponible (repo solo contiene safetensors) |
| Idiomas soportados | Francés (razonamiento objetivo), otros idiomas del modelo base |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder basado en la arquitectura Qwen2, con 7B parámetros en su configuración original. El proceso de entrenamiento sigue el pipeline ReasonXL en dos etapas:

1. **SFT (supervised fine-tuning)**: se ajusta el modelo base OpenThinker-7B sobre el dataset toroe/ReasonXL-SFT, que contiene trazas de razonamiento en francés. Esta etapa desplaza el idioma de razonamiento del inglés al francés, pero puede degradar la calidad del razonamiento.
2. **RL (Dr. GRPO)**: se aplica refuerzo con el algoritmo Dr. GRPO sobre el modelo SFT, utilizando una recompensa compuesta basada en problemas matemáticos verificables. El objetivo es recuperar la calidad de razonamiento perdida durante el SFT, manteniendo la adherencia al francés.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros utilizados. El paper asociado (arXiv:2604.12378) promete detalles completos próximamente.

## Capacidades

- Razonamiento matemático y lógico en francés, con capacidad de generar cadenas de pensamiento detalladas.
- Generación de texto en francés, incluyendo explicaciones, resúmenes y respuestas a preguntas.
- Herencia de las capacidades del modelo base OpenThinker-7B, que incluye razonamiento de propósito general, aunque el ajuste se centra en francés.
- Soporte multilingüe limitado: el modelo base soporta varios idiomas, pero el entrenamiento específico prioriza el francés.
- No se ha confirmado soporte para tool calling, agentes o visión en esta variante concreta.

## Casos de uso

- Tutoría de matemáticas en francés: el modelo puede explicar paso a paso la resolución de problemas algebraicos, geométricos o de cálculo, adaptándose al nivel del estudiante gracias a su razonamiento en francés.
- Generación de material educativo en francés: creación de ejercicios, soluciones y explicaciones para libros de texto o plataformas de e-learning, con razonamiento verificable.
- Asistente de investigación en francés: ayuda a investigadores francófonos a formalizar demostraciones matemáticas o a explorar hipótesis lógicas, manteniendo el razonamiento en su idioma.
- Traducción de razonamiento técnico: convertir cadenas de razonamiento de otros modelos (en inglés) a francés, preservando la estructura lógica, útil para localización de contenido técnico.
- Evaluación de modelos de razonamiento en francés: servir como referencia para comparar la calidad de razonamiento de otros modelos francófonos, dado su entrenamiento específico en este idioma.
- Chatbots de soporte técnico en francés: responder consultas que requieren razonamiento multi-paso, como diagnóstico de problemas o configuración de sistemas, con explicaciones claras en francés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base OpenThinker-7B reporta mejoras sobre DeepSeek-R1-Distill-Qwen-7B y Llama-3.1-Nemotron-Nano-8B-v1 en tareas de razonamiento, pero no hay datos específicos para esta variante francesa. Se recomienda consultar el paper ReasonXL cuando esté disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Para un modelo de 7B en FP16 se requieren aproximadamente 14 GB; en INT4, unos 4-5 GB. Estas cifras son orientativas y dependen de la implementación.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para FP16 (p. ej., RTX 4090, A100 40 GB) o GPUs consumer con 8 GB para cuantización INT4.
- Despliegue: compatible con frameworks estándar como vLLM, llama.cpp, Ollama o TGI, siempre que se conviertan los pesos a los formatos adecuados (GGUF, etc.).
- Latencia y throughput: no disponibles. Para un modelo de 7B, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OpenThinker3-7B-SFT-GRPO-FR | 7B | No disponible | No disponible | Razonamiento en francés (SFT + GRPO) |
| OpenThinker-7B (base) | 7B | 32 768 (Qwen2.5) | Apache 2.0 (Qwen2.5) | Razonamiento en inglés |
| DeepSeek-R1-Distill-Qwen-7B | 7B | 32 768 | MIT | Razonamiento en inglés/chino |

No hay datos de rendimiento comparativo publicados para esta variante. La comparación se limita a características arquitectónicas y de entrenamiento.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información específica, pero al ser un fine-tune de un modelo base, puede heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar razonamientos incorrectos o inventar hechos, especialmente en dominios fuera de su entrenamiento.
- Limitaciones de idioma: el entrenamiento se centra en francés; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Restricciones de licencia: la licencia no está especificada, lo que impide garantizar su uso comercial sin autorización explícita del autor.
- Producción: al ser un modelo de investigación con 0 descargas y sin benchmarks publicados, se recomienda una evaluación exhaustiva antes de usarlo en entornos críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DGurgurov/OpenThinker3-7B-SFT-GRPO-FR
- Modelo SFT intermedio: https://huggingface.co/DGurgurov/OpenThinker3-7B-SFT-FR
- Dataset ReasonXL-SFT: https://huggingface.co/datasets/toroe/ReasonXL-SFT
- Modelo base OpenThinker-7B: https://huggingface.co/open-thoughts/OpenThinker-7B
- Paper ReasonXL (arXiv): https://arxiv.org/abs/2604.12378
- Repositorio open-thoughts: https://github.com/open-thoughts/open-thoughts
