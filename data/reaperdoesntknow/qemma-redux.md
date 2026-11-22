# reaperdoesntknow/Qemma-redux

## Resumen

Qemma-redux es un modelo de lenguaje de ~1B parámetros construido por reaperdoesntknow (Convergent Intelligence LLC: Research Division) mediante la fusión a nivel de pesos de dos arquitecturas distintas: el cuerpo de Gemma-3 (1B) y la atención de Qwen-3 (0.6B). No se trata de un ajuste LoRA ni de un adaptador, sino de un injerto estructural en el que la atención estilo Qwen se proyecta y alinea a la dimensión oculta de Gemma. El resultado es un transformer híbrido con backbone Gemma-3 de 26 capas, hidden size 1152 y MLP de 6912, sobre el que se ha aplicado un entrenamiento SFT orientado a razonamiento paso a paso.

La variante "Redux" añade un segundo merge entre Qemma-sft y Qwen3-0.6B, además de incorporar RoPE scaling de tipo YaRN con ratio 1:1 respecto a `max_position_embeddings`, lo que permite extender la ventana de contexto efectiva sin reentrenar desde cero. El modelo usa el tokenizador y la plantilla de chat de Gemma-3, y está entrenado exclusivamente en inglés.

Su relevancia es fundamentalmente experimental: demuestra que es posible combinar piezas de dos familias de modelos con tokenizadores y dimensiones distintas y obtener un modelo funcional mediante alineamiento de pesos. Está pensado para investigación, instrucciones y análisis, no para producción crítica. El repo ocupa 12 GB, lo que sugiere pesos en bfloat16 junto con posibles artefactos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: backbone Gemma-3 (26 capas, hidden 1152, MLP 6912) con atención estilo Qwen-3 reagrupada a 4x256 cabezas |
| Parametros totales | no disponible (el repo pesa 12 GB; el cuerpo base es Gemma-3 1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (usa YaRN RoPE scaling 1:1 sobre `max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos publicados en transformers/bfloat16; no se listan GGUF ni AWQ) |
| Idiomas soportados | inglés (en) |
| Licencia | OSL-3.0 (Open Software License 3.0) |
| Formato de pesos | safetensors (repo transformers, 12 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only que combina el cuerpo de Gemma-3 1B con la atención de Qwen-3 0.6B. La atención de Qwen se reagrupa para encajar en la configuración de 4 cabezas de 256 dimensiones de Gemma y se proyecta a la dimensión oculta de 1152. El tokenizador y la plantilla de chat son los de Gemma-3, lo que implica que el vocabulario y el enmascaramiento de atención siguen la convención de Gemma. La variante Redux incorpora además RoPE scaling YaRN con ratio 1:1 respecto a `max_position_embeddings`, una técnica de extensión de contexto que interpola las frecuencias rotacionales para generalizar a secuencias más largas.

El entrenamiento se organiza en cuatro fases: aproximadamente 512 pasos de warm-start con datos estilo Alpaca (`yahma/alpaca-cleaned`), 256 pasos adicionales de preentrenamiento sobre `O1-OPEN/OpenO1-SFT`, 128 pasos de SFT con `Jackrong/gpt-oss-120b-reasoning-STEM-5K` (razonamiento STEM) y 256 pasos de SFT final sobre `O1-OPEN/OpenO1-SFT`. Todo el pipeline usa TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0+cpu, Datasets 4.4.1 y Tokenizers 0.22.1. No se documenta RLHF ni DPO; el ajuste es puramente supervisado. El autor enmarca el modelo en su marco teórico "Discrepancy Calculus" (DISC), una aproximación measure-theoretic al estudio de la brecha entre comportamiento esperado y observado, aunque no se aportan métricas que cuantifiquen su efecto.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés.
- Razonamiento paso a paso (stepwise reasoning) reforzado por el SFT sobre OpenO1-SFT y el dataset STEM de razonamiento.
- Resolución de problemas matemáticos y de ciencia, gracias a los 128 pasos de SFT sobre `gpt-oss-120b-reasoning-STEM-5K`.
- Generación y asistencia de código a nivel básico (el autor lo lista como uso previsto "code/help"), sin benchmarks publicados que lo respalden.
- Análisis y explicación de texto.
- Punto de partida para SFT/RLHF adicional (fine-tuning posterior).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre fusión de arquitecturas: el modelo sirve como banco de pruebas para estudiar si el injerto de atención entre familias distintas (Gemma y Qwen) preserva capacidades. Se usaría cargándolo con `AutoModelForCausalLM` en bfloat16 y comparando perplejidad y calidad de generación frente a los modelos base.
- Fine-tuning académico de bajo coste: con ~1B parámetros y 12 GB de pesos, cabe en una GPU consumer de 24 GB y permite iterar SFT con TRL sobre datasets pequeños (Alpaca, OpenO1) sin infraestructura dedicada.
- Generación de explicaciones matemáticas paso a paso: el SFT sobre STEM-5K lo hace adecuado para producir cadenas de razonamiento en problemas de álgebra y cálculo, siempre con verificación humana posterior.
- Prototipado de asistentes conversacionales en inglés: usando la plantilla de chat de Gemma-3, se puede desplegar un chatbot de demostración para evaluar la coherencia multi-turno antes de invertir en un modelo mayor.
- Estudio de RoPE scaling: la configuración YaRN 1:1 permite experimentar con extensión de contexto y medir degradación de calidad a distintas longitudes de secuencia.
- Docencia y divulgación: como ejemplo didáctico de merge de pesos, alineamiento de dimensiones y pipelines SFT con TRL, es un caso compacto y reproducible.
- Generación de documentación técnica y resúmenes en inglés: tareas de análisis de texto donde la latencia importa y el modelo cabe en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica cuantitativa, ni comparaciones con los modelos base (Gemma-3 1B, Qwen-3 0.6B).

## Requisitos de hardware

- VRAM estimada: ~2,5 GB en bfloat16 para los pesos del cuerpo de ~1B (el repo de 12 GB incluye artefactos adicionales); ~1,3 GB en cuantización de 8 bits y ~0,7 GB en 4 bits, estimaciones teóricas no verificadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 con contexto moderado; RTX 3060/4060, RTX 4090, A100 y H100 son válidas.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y superiores.
- Opciones de despliegue: transformers (soporte nativo, `AutoModelForCausalLM`), text-generation-inference (el tag `text-generation-inference` está presente), endpoints compatibles. No se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qemma-redux | ~1B (híbrido Gemma-3 + Qwen-3) | no disponible (YaRN 1:1) | en | OSL-3.0 | safetensors | Fusión experimental, SFT en razonamiento |
| Gemma-3 1B | 1B | 32K (según familia Gemma-3) | multilingüe | Gemma Terms of Use | safetensors, GGUF | Modelo base del cuerpo; ecosistema amplio |
| Qwen-3 0.6B | 0,6B | 32K (según familia Qwen-3) | multilingüe | Apache 2.0 | safetensors, GGUF | Modelo base de la atención; licencia permisiva |
| SmolLM2 1.7B | 1,7B | 8K | en | Apache 2.0 | safetensors, GGUF | Alternativa compacta con benchmarks publicados |

La comparación directa es difícil porque Qemma-redux no publica métricas. Frente a Gemma-3 1B y Qwen-3 0.6B, la diferencia principal es la licencia OSL-3.0 (copyleft) y la ausencia de cuantizaciones listas para usar. SmolLM2 1.7B ofrece un tamaño similar con documentación de rendimiento y licencia permisiva.

## Limitaciones y advertencias

- Riesgo de alucinación: el propio autor lo advierte explícitamente; no debe usarse para decisiones médicas, legales, financieras o de seguridad crítica.
- Sesgos: no se documenta ninguna evaluación de sesgos; los datasets de SFT (Alpaca, OpenO1, STEM-5K) pueden introducir sesgos de dominio y de estilo.
- Idioma: entrenado solo en inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto: aunque se aplica YaRN 1:1, no se especifica la longitud efectiva soportada ni se aportan mediciones de degradación a secuencias largas.
- Licencia OSL-3.0: es una licencia copyleft que exige compartir el código derivado bajo la misma licencia al distribuir; conviene revisar su compatibilidad antes de uso comercial o integración en productos propietarios.
- Modelo experimental: la fusión de pesos entre arquitecturas con tokenizadores distintos puede producir comportamientos impredecibles; no hay benchmarks que validen la calidad frente a los modelos base.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ publicados, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.
- Mantenimiento: el modelo pertenece a un portfolio de 41 modelos de un autor individual; el soporte a largo plazo no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-redux
- Modelo base (SFT): https://huggingface.co/reaperdoesntknow/Qemma-sft
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Dataset OpenO1-SFT: https://huggingface.co/datasets/O1-OPEN/OpenO1-SFT
- Dataset Alpaca cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset STEM-5K: https://huggingface.co/datasets/Jackrong/gpt-oss-120b-reasoning-STEM-5K
- Paper "Discrepancy Calculus: Foundations and Core Theory": https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Paper "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Paper "Three Teachers to Dual Cognition": https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Repositorio TRL: https://github.com/huggingface/trl
