# reaperdoesntknow/Qemma-redux

## Resumen

Qemma-redux es un modelo de lenguaje de tipo híbrido desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division) que combina a nivel de pesos dos arquitecturas distintas: el cuerpo y la MLP de Gemma-3 (1B) con la atención y la cabeza de Qwen-3 (0.6B), proyectadas y alineadas a la dimensión oculta de Gemma. No se trata de un modelo basado en adaptadores ni de una destilación convencional, sino de una fusión directa de tensores seguida de un ajuste fino supervisado (SFT) orientado a razonamiento paso a paso.

La variante Redux añade un segundo merge entre Qemma-sft y Qwen3-0.6B e incorpora escalado RoPE de tipo YaRN con una ratio 1:1 respecto a `max_position_embeddings`, lo que busca extender la ventana de contexto efectiva sin reentrenar desde cero. El modelo se distribuye en formato transformers nativo (safetensors) con un tamaño de repositorio de 12 GB, licencia OSL-3.0 y soporte exclusivo para inglés.

Su relevancia es fundamentalmente experimental: explora si es viable trasplantar mecanismos de atención entre familias de modelos con dimensiones de cabeza distintas y si el resultado puede afinarse para seguir instrucciones y razonar de forma estructurada. Está pensado para investigación y experimentación, no para despliegues en producción sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: backbone Gemma-3 (26 capas, hidden 1152, MLP 6912) con atención estilo Qwen-3 reagrupada a 4 cabezas de 256 dimensiones |
| Parametros totales | no disponible (repo de 12,0 GB en bfloat16, coherente con un rango cercano a los 1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (usa YaRN RoPE scaling con ratio 1:1 sobre `max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se listan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | OSL-3.0 (Open Software License 3.0) |
| Formato de pesos | safetensors (transformers, `AutoModelForCausalLM`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso que injerta la atención de Qwen-3 en el cuerpo de Gemma-3. El backbone conserva 26 capas con dimensión oculta 1152 y MLP de 6912, mientras que el mecanismo de atención se reagrupa a 4 cabezas de 256 dimensiones para encajar con la geometría de Gemma. El tokenizador y la plantilla de chat son los de Gemma-3 (`chat_template.jinja`), lo que facilita la integración con el ecosistema transformers. La variante Redux añade un merge adicional con Qwen3-0.6B y escalado RoPE tipo YaRN.

El entrenamiento se organiza en fases escalonadas: aproximadamente 512 pasos de warm-start con datos estilo Alpaca, 256 pasos adicionales de preentrenamiento sobre O1-OPEN/OpenO1-SFT, 128 pasos de SFT con Jackrong/gpt-oss-120b-reasoning-STEM-5K y 256 pasos de SFT finales sobre OpenO1-SFT. Se realizó con TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0 y Datasets 4.4.1. No se documentan fases de RLHF ni DPO, ni el volumen total de tokens procesados.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Gemma-3.
- Razonamiento paso a paso, reforzado mediante SFT sobre datasets de razonamiento (OpenO1-SFT y un conjunto STEM de razonamiento).
- Seguimiento de instrucciones básico, entrenado con datos estilo Alpaca.
- Capacidad de razonamiento matemático y STEM derivada del dataset de 5K ejemplos de razonamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso autónomo más allá del estilo de cadena de pensamiento.
- Capacidades multilingües limitadas: solo se declara inglés.
- No dispone de visión ni audio, pese a heredar el backbone de Gemma-3.

## Casos de uso

- Investigación sobre fusión de arquitecturas: el modelo sirve como banco de pruebas para estudiar si el trasplante de atención entre familias (Gemma y Qwen) preserva capacidades y cómo afecta al entrenamiento posterior.
- Experimentación con escalado RoPE: útil para analizar el comportamiento de YaRN con ratio 1:1 sobre un modelo pequeño y comparar la degradación de contexto frente a alternativas.
- Generación de razonamiento paso a paso en dominios STEM: puede emplearse para producir cadenas de razonamiento en problemas matemáticos y científicos sencillos, aprovechando el SFT sobre el dataset de 5K ejemplos.
- Prototipado de asistentes conversacionales en inglés: con la plantilla de chat de Gemma-3 y un tamaño manejable, sirve para validar flujos de diálogo antes de migrar a modelos mayores.
- Ajuste fino posterior (SFT/RLHF): el autor lo plantea explícitamente como base para experimentos de alineación adicional, dado su bajo coste computacional.
- Docencia y divulgación: adecuado para demostrar en entornos académicos cómo se construye un modelo híbrido a nivel de pesos y qué implicaciones tiene.
- Evaluación comparativa de tokenizadores: al usar el tokenizador de Gemma-3 con atención de Qwen, permite estudiar el impacto del tokenizador en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2,5-3 GB para pesos (repo de 12 GB incluye probables checkpoints u optimizador; el modelo en sí es de escala ~1B), más overhead de activaciones y caché KV.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, e incluso en GPUs de 8 GB con cuantización a 8 bits.
- GPU profesionales recomendadas: A100, H100 o L40S para entrenamiento o inferencia por lotes; para uso individual basta una RTX 4090.
- Despliegue: transformers nativo (`AutoModelForCausalLM`), compatible con text-generation-inference según los tags del repo. No se documentan pesos GGUF oficiales, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qemma-redux | ~1B (no confirmado) | no disponible | OSL-3.0 | Hugging Face, transformers | Híbrido Gemma-3 + Qwen-3, solo inglés |
| Gemma-3 1B (Google) | ~1B | 32K (según familia Gemma-3) | Gemma Terms of Use | Hugging Face, transformers | Modelo base original, multimodal en variantes mayores |
| Qwen3-0.6B (Alibaba) | 0,6B | 32K (extensible) | Apache 2.0 | Hugging Face, transformers | Modelo base original, multilingüe |
| SmolLM2-1.7B (Hugging Face) | 1,7B | 8K | Apache 2.0 | Hugging Face, transformers | Alternativa pequeña con licencia permisiva |

La comparación con los modelos base es orientativa: Qemma-redux no publica métricas que permitan situarlo frente a ellos en rendimiento real.

## Limitaciones y advertencias

- Riesgo de alucinación reconocido explícitamente por el autor; no apto para decisiones críticas de seguridad, médicas, legales o financieras.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Licencia OSL-3.0: permite uso comercial pero impone obligaciones de compartir modificaciones bajo la misma licencia; conviene revisar los términos antes de integrarlo en productos propietarios.
- Modelo experimental de investigación: la fusión a nivel de pesos entre arquitecturas distintas puede producir comportamientos erráticos no documentados.
- No hay benchmarks publicados que permitan validar sus capacidades frente a alternativas.
- El escalado YaRN con ratio 1:1 sobre `max_position_embeddings` no viene acompañado de evaluación de contexto largo; la ventana efectiva real es desconocida.
- El repositorio incluye datasets con licencias propias (OpenO1-SFT, Alpaca-cleaned, gpt-oss-120b-reasoning-STEM-5K) cuyas condiciones pueden afectar al uso derivado.
- Sin soporte documentado de tool calling ni agentes, lo que limita su uso en pipelines automatizados complejos.
- La model card incluye referencias a un marco teórico propio (Discrepancy Calculus) sin validación externa; tratarlo como material divulgativo, no como garantía técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-redux
- Modelo base: https://huggingface.co/reaperdoesntknow/Qemma-sft
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Dataset O1-OPEN/OpenO1-SFT: https://huggingface.co/datasets/O1-OPEN/OpenO1-SFT
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset Jackrong/gpt-oss-120b-reasoning-STEM-5K: https://huggingface.co/datasets/Jackrong/gpt-oss-120b-reasoning-STEM-5K
- Documento Discrepancy Calculus: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Documento Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Documento Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Repositorio TRL: https://github.com/huggingface/trl
