# reaperdoesntknow/Qemma-sft

## Resumen

Qemma-sft es un modelo experimental de generación de texto desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division) que fusiona a nivel de pesos dos modelos existentes: Gemma-3 (1B) de Google y Qwen-3 (0.6B) de Alibaba. La propuesta consiste en combinar el cuerpo y la MLP de Gemma-3 con la atención y la cabeza de Qwen-3, proyectando y alineando las dimensiones ocultas de ambos para que encajen en el tamaño oculto de Gemma (1152). Tras la fusión, el modelo se somete a un ajuste supervisado (SFT) orientado a seguir instrucciones y a razonar paso a paso.

El modelo se publica como parte del marco teórico "Discrepancy Calculus" (DISC) del autor, una aproximación de teoría de la medida al análisis del entrenamiento, y se distribuye con licencia OSL-3.0. Su relevancia es fundamentalmente investigadora: demuestra una técnica de fusión de pesos entre arquitecturas distintas y un pipeline de SFT por etapas sobre un modelo híbrido de muy pequeño tamaño.

Con alrededor de 1B de parámetros (el cuerpo de Gemma-3 1B) y un contexto heredado del tokenizer y la plantilla de chat de Gemma-3, Qemma-sft no compite con modelos frontera, sino que sirve como banco de pruebas para experimentación con arquitecturas híbridas y ajuste fino eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: cuerpo y MLP de Gemma-3 (26 capas, hidden 1152, MLP 6912) con atención estilo Qwen reagrupada a 4x256 cabezas de Gemma |
| Parametros totales | Aproximadamente 1B (hereda el tamaño del cuerpo de Gemma-3 1B; no se especifica cifra exacta en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Gemma-3 1B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; pesos en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | OSL-3.0 |
| Formato de pesos | safetensors (formato de transformers; tamano del repo 28.1 GB) |

## Arquitectura y entrenamiento

Qemma-sft es un transformer híbrido construido por fusión de pesos: toma el backbone de Gemma-3 1B (26 capas, dimensión oculta 1152, MLP de 6912) y le injerta la atención de Qwen-3 0.6B, reagrupada para encajar en las 4x256 cabezas de Gemma. Las proyecciones se alinean a la dimensión oculta de Gemma, de modo que el modelo resultante conserva el tokenizer y la plantilla de chat de Gemma-3. No se emplean adaptadores: la fusión es a nivel de pesos.

El entrenamiento se organiza en cuatro fases: aproximadamente 512 pasos de warm-start con datos estilo Alpaca (yahma/alpaca-cleaned), 256 pasos de preentrenamiento adicional sobre O1-OPEN/OpenO1-SFT, 128 pasos de SFT con Jackrong/gpt-oss-120b-reasoning-STEM-5K y 256 pasos finales de SFT sobre O1-OPEN/OpenO1-SFT. Se usaron TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0 (CPU), Datasets 4.4.1 y Tokenizers 0.22.1. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Gemma-3.
- Seguimiento de instrucciones y razonamiento paso a paso (stepwise reasoning), objetivo explícito del SFT.
- Razonamiento STEM, gracias al ajuste con el dataset gpt-oss-120b-reasoning-STEM-5K.
- Asistencia en código y análisis, según la sección de uso previsto de la model card.
- Capacidad de servir como base para SFT o RLHF posteriores.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigación sobre fusión de pesos entre arquitecturas: Qemma-sft sirve como caso de estudio reproducible para evaluar si el injerto de atención de un modelo en el cuerpo de otro preserva capacidades, útil en laboratorios que estudian model merging.
- Prototipado de asistentes conversacionales en inglés: con el tokenizer y la plantilla de chat de Gemma-3, se puede desplegar un chatbot ligero para pruebas internas sin coste elevado de inferencia.
- Generación de explicaciones paso a paso en dominios STEM: el ajuste con datos de razonamiento científico permite usarlo como generador de borradores de solución en ejercicios de matemáticas o física, siempre con revisión humana.
- Base para SFT o RLHF posteriores: al ser un modelo pequeño y con licencia OSL-3.0, es adecuado como punto de partida para experimentos de ajuste fino con TRL en entornos con recursos limitados.
- Evaluación de pipelines de entrenamiento por etapas: las cuatro fases documentadas (warm-start, preentrenamiento, SFT STEM y SFT general) permiten reproducir y comparar curricula de entrenamiento.
- Docencia y divulgación: sirve para ilustrar en cursos cómo se combinan dos modelos de pesos abiertos y cómo se alinea una cabeza de atención entre dimensiones ocultas distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con pesos en bfloat16 (tamaño de repo 28.1 GB, que incluye artefactos de entrenamiento) el modelo de aproximadamente 1B requiere del orden de 2-4 GB en bf16, y menos con cuantización de 8 o 4 bits.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con 8 GB o más.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (etiqueta endpoints_compatible), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documentan en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qemma-sft | ~1B (híbrido Gemma-3 + Qwen-3) | No disponible | OSL-3.0 | Hugging Face |
| google/gemma-3-1b-it | ~1B | No disponible en la informacion proporcionada | Gemma Terms of Use | Hugging Face |
| Qwen/Qwen3-0.6B | ~0.6B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: la propia model card advierte de que el modelo puede alucinar.
- No apto para decisiones críticas: el autor lo desaconseja explícitamente para usos sanitarios, legales, financieros o de seguridad crítica.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado.
- Licencia OSL-3.0: impone obligaciones de copyleft sobre obras derivadas; conviene revisar sus términos antes de uso comercial.
- Modelo experimental: la fusión de pesos entre arquitecturas distintas y el entrenamiento por etapas no cuentan con evaluación independiente ni benchmarks publicados.
- Contexto: la longitud de contexto efectiva no se documenta y podría diferir de la de Gemma-3 1B original.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Tamaño del repo: 28.1 GB frente a un modelo de ~1B, lo que sugiere la inclusión de checkpoints intermedios u otros artefactos; conviene verificar qué ficheros se descargan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-sft
- Modelo base Gemma-3 1B: https://huggingface.co/google/gemma-3-1b-it
- Modelo base Qwen3 0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset O1-OPEN/OpenO1-SFT: https://huggingface.co/datasets/O1-OPEN/OpenO1-SFT
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset Jackrong/gpt-oss-120b-reasoning-STEM-5K: https://huggingface.co/datasets/Jackrong/gpt-oss-120b-reasoning-STEM-5K
- Repositorio TRL: https://github.com/huggingface/trl
- Discrepancy Calculus (DOI: 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Structure Over Scale (DOI: 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Three Teachers to Dual Cognition (DOI: 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
