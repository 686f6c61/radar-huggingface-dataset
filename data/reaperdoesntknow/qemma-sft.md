# reaperdoesntknow/Qemma-sft

## Resumen

Qemma-sft es un modelo experimental de generación de texto publicado por el usuario reaperdoesntknow bajo el sello Convergent Intelligence LLC: Research Division. Se trata de un modelo híbrido construido fusionando a nivel de pesos (sin adaptadores) dos modelos existentes: Gemma-3 (1B) de Google y Qwen3 (0.6B) de Alibaba. La construcción combina el cuerpo y las capas MLP de Gemma-3 con la atención y la cabeza de Qwen3, proyectadas y alineadas al tamaño oculto de Gemma. Posteriormente, el modelo resultante se ajusta con SFT para razonamiento paso a paso.

El modelo está pensado principalmente como artefacto de investigación: sigue el marco teórico denominado Discrepancy Calculus (DISC) del autor, que trata las singularidades del entrenamiento (mesetas de pérdida, colapso de modos, olvido catastrófico) como señales estructurales en lugar de fallos a suavizar. Con 2.586 descargas en Hugging Face, es uno de los modelos más descargados del portfolio del autor, aunque con una validación externa limitada (un único like).

La relevancia práctica es acotada: se trata de un modelo de ~1B parámetros efectivos orientado a instrucciones y razonamiento en inglés, con licencia OSL-3.0, sin benchmarks publicados en la información disponible. Resulta útil como banco de pruebas para técnicas de fusión de pesos entre arquitecturas distintas y para experimentación con SFT ligero, no como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone Gemma-3 (26 capas, hidden 1152, MLP 6912) con atención estilo Qwen3 reagrupada a 4×256 cabezas de Gemma |
| Parametros totales | No disponible (derivado de Gemma-3 1B y Qwen3 0.6B; el tamaño efectivo no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada presumiblemente del backbone Gemma-3, pero no se declara) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16 según el ejemplo de uso; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Inglés (en) |
| Licencia | OSL-3.0 |
| Formato de pesos | safetensors (repo de 28,1 GB, librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido resultado de una fusión a nivel de pesos entre Gemma-3 (1B) y Qwen3 (0.6B). El diseño toma el cuerpo y las capas MLP de Gemma-3 (26 capas, dimensión oculta 1152, MLP de 6912) e incorpora la atención de Qwen3, reagrupada para encajar en la configuración de 4×256 cabezas de Gemma y proyectada al tamaño oculto de este último. El tokenizador y la plantilla de chat son los de Gemma-3 (`chat_template.jinja`). No se emplean adaptadores: la fusión es directa sobre los pesos.

El entrenamiento se realizó con TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0, Datasets 4.4.1 y Tokenizers 0.22.1, en cuatro fases: aproximadamente 512 pasos de warm-start con datos estilo Alpaca (`yahma/alpaca-cleaned`), 256 pasos adicionales de pretraining sobre `O1-OPEN/OpenO1-SFT`, 128 pasos de SFT con `Jackrong/gpt-oss-120b-reasoning-STEM-5K` y 256 pasos finales de SFT sobre `O1-OPEN/OpenO1-SFT`. No se documenta el número total de tokens procesados ni el uso de RLHF o DPO. La innovación técnica destacable es precisamente el método de fusión inter-arquitectura con proyección y alineación de dimensiones, enmarcado en el marco teórico DISC del autor (operador de discrepancia, conjuntos de salto, ghost imprinting).

## Capacidades

- Generación de texto conversacional e instrucciones generales en inglés.
- Razonamiento paso a paso (stepwise reasoning), reforzado mediante SFT con datos de razonamiento STEM.
- Resolución de problemas de matemáticas y ciencia a nivel básico-intermedio, derivado del dataset STEM utilizado en el ajuste.
- Asistencia en código y análisis, según la declaración de uso previsto del autor.
- Seguimiento de plantilla de chat de Gemma-3 para conversaciones multi-turno.
- Base para ajuste posterior (SFT/RLHF), tal como indica el autor.
- Soporte de tool calling / function calling: no disponible (no se declara).
- Soporte de agentes y multi-step reasoning: no disponible como capacidad verificada; solo se menciona razonamiento paso a paso.
- Capacidades multilingües: limitadas al inglés declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Experimentación con fusión de pesos: servir como referencia reproducible para investigar la combinación de atención de Qwen3 con el cuerpo de Gemma-3, midiendo el impacto en perplejidad y calidad de instrucciones.
- Generación de borradores de razonamiento STEM: usar el modelo para producir cadenas de razonamiento paso a paso en problemas de matemáticas y ciencia de nivel educativo, dado el ajuste con `gpt-oss-120b-reasoning-STEM-5K`.
- Asistente de instrucciones ligero en inglés: desplegar un chatbot básico de propósito general con la plantilla de chat de Gemma-3, adecuado para entornos de prueba con recursos limitados.
- Base para SFT propio: partir de Qemma-sft como checkpoint inicial para ajustar un dominio concreto (soporte técnico, documentación interna) con TRL, aprovechando que ya incorpora instrucciones y razonamiento.
- Evaluación de técnicas DISC: utilizar el modelo como sujeto de estudio para analizar mesetas de pérdida y conjuntos de salto durante el entrenamiento, conforme al marco teórico del autor.
- Prototipado de pipelines de CI/CD para modelos pequeños: integrar el modelo en flujos de validación automatizada de respuestas (tests de regresión de calidad) antes de promover checkpoints.
- Docencia e investigación académica: emplear un modelo de ~1B con licencia OSL-3.0 como ejemplo práctico de arquitecturas híbridas y ajuste supervisado en cursos o laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repo ocupa 28,1 GB, lo que sugiere pesos en bfloat16 (y posiblemente checkpoints intermedios); en bf16 un modelo de ~1B requeriría del orden de 2-4 GB de VRAM, pero no se confirma el tamaño efectivo.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU con al menos 8 GB podría ejecutar un modelo de esta escala en bf16 o fp16, pero no hay datos del autor.
- ¿Cabe en GPU consumer? Probablemente sí en tarjetas tipo RTX 3060/4060/4090 si el tamaño efectivo ronda 1B, pero no se confirma.
- Opciones de despliegue: transformers (según el ejemplo de la model card); text-generation-inference está etiquetado como compatible (`text-generation-inference`, `endpoints_compatible`). No se mencionan vLLM, llama.cpp ni Ollama, y no hay pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qemma-sft | No disponible (~1B efectivos) | No disponible | Sin benchmarks publicados | OSL-3.0 | Hugging Face (transformers, TGI) |
| Gemma-3 1B (google/gemma-3-1b-it) | ~1B | No disponible en esta ficha | Benchmarks publicados por Google | Gemma license | Hugging Face, amplia adopción |
| Qwen3 0.6B (Qwen/Qwen3-0.6B) | 0,6B | No disponible en esta ficha | Benchmarks publicados por Alibaba | Apache 2.0 (según modelo base) | Hugging Face, amplia adopción |
| Qwen3-1.7B-Thinking-Distil (mismo autor) | 1,7B | No disponible | Sin benchmarks publicados | No disponible | Hugging Face (501 descargas) |

La comparación directa con los modelos base es la referencia más útil: Qemma-sft hereda componentes de ambos, pero no aporta métricas que permitan situarlo frente a ellos. Los modelos del mismo autor comparten metodología y ausencia de benchmarks.

## Limitaciones y advertencias

- Riesgo de alucinación: el autor lo declara explícitamente; no debe usarse para decisiones críticas de seguridad, médicas, legales o financieras.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: la longitud de contexto no se documenta; no debe asumirse la del backbone Gemma-3 sin verificación empírica.
- Licencia OSL-3.0: implica obligaciones copyleft para uso comercial y distribución; debe revisarse antes de integrar en productos. Además, los modelos base (Gemma-3 y Qwen3) tienen sus propias licencias que pueden imponer condiciones adicionales.
- Validación externa limitada: un único like y sin benchmarks; la calidad del modelo no está corroborada por terceros.
- Naturaleza experimental: es un artefacto de investigación del portfolio DISC; la fusión inter-arquitectura puede producir comportamientos impredecibles en prompts fuera de la distribución de entrenamiento.
- Datos de entrenamiento: mezcla de datasets públicos (Alpaca, OpenO1-SFT, STEM-5K) con posibles sesgos heredados; no se documenta filtrado de toxicidad.
- Tamaño del repo (28,1 GB) para un modelo de ~1B sugiere checkpoints múltiples o pesos en precisión alta; conviene verificar qué archivos se descargan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-sft
- Modelo base Gemma-3 1B: https://huggingface.co/google/gemma-3-1b-it
- Modelo base Qwen3 0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset OpenO1-SFT: https://huggingface.co/datasets/O1-OPEN/OpenO1-SFT
- Dataset Alpaca cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset STEM reasoning: https://huggingface.co/datasets/Jackrong/gpt-oss-120b-reasoning-STEM-5K
- Discrepancy Calculus (DOI: 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Structure Over Scale (DOI: 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Three Teachers to Dual Cognition (DOI: 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Repositorio TRL: https://github.com/huggingface/trl
- Perfil del autor: https://huggingface.co/reaperdoesntknow
