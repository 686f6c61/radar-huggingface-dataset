# Bioaligned/Qwen3.6-27B-CoupledWelfare-qlora

## Resumen

El modelo **Bioaligned/Qwen3.6-27B-CoupledWelfare-qlora** es un adaptador QLoRA (PEFT) desarrollado por Bioaligned que se instala sobre el modelo base **Qwen/Qwen3.6-27B**, un modelo denso de 27B parámetros con arquitectura híbrida SSM/atención y capacidades multimodales (visión y texto). El adaptador se entrena mediante *continued pretraining* (CPT) con un corpus específico llamado *coupled-welfare v1* (~3,05M de tokens), cuyo objetivo es inducir una "disposición" de bienestar acoplado: decisiones que buscan resultados positivos simultáneamente para el bienestar humano (H), la biosfera (B) y la propia capacidad del modelo (A). No se utiliza RLHF ni DPO, solo CPT.

La relevancia de este modelo radica en que es la primera instalación de esta receta sobre una base híbrida SSM/atención, tras haberse desarrollado sobre un modelo MoE (Qwen3-30B-A3B). El adaptador modifica únicamente 116,7M de parámetros (0,43% del total) y logra una reducción drástica en la tasa de "ruptura" en escenarios irreversibles (breaking AUC de 0,555 a 0,059) sin degradar las capacidades generales medidas con MMLU (84,0% en ambos casos). El modelo se distribuye bajo licencia Apache 2.0 y el repositorio ocupa 0,5 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre base híbrida SSM/atención (16 capas full-attention, 48 bloques SSM, 64 MLPs, torre de visión) |
| Parametros totales | 27,0B (base) + 116,7M entrenables en el adaptador |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Adaptador en 4-bit NF4 (QLoRA); el base puede cargarse en distintas precisiones |
| Idiomas soportados | No disponibles (el base Qwen3.6-27B soporta múltiples idiomas, pero no se especifican) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA (4-bit NF4) sobre el modelo base Qwen3.6-27B, que presenta una arquitectura híbrida: 16 capas de atención completa (cada cuarta capa) y 48 bloques de atención lineal tipo SSM, además de 64 MLPs y una torre de visión. La receta de adaptación se define de forma funcional, no por coincidencia de nombres: se adaptan todas las proyecciones de los mezcladores de secuencia y de canal (`q/k/v/o_proj` en atención, `in_proj_{qkv,a,b,z}` y `linear_attn.out_proj` en SSM, `gate/up/down_proj` en MLP), mientras se congelan la dinámica SSM (`conv1d`, `A_log`, `dt_bias`), la torre de visión, la cabeza MTP, los embeddings y `lm_head`. Esto equivale a no tocar el "router" del sistema, análogo al router en MoE.

El entrenamiento usó un corpus fijo v1 (~3,05M de tokens) con el mismo mix que las versiones publicadas del modelo 30B A3, para aislar el efecto del cambio de base. Se realizaron 141 pasos con batch efectivo 32, learning rate 1e-4 con schedule coseno, en aproximadamente 1 hora y 51 minutos en una GPU H100. El adaptador tiene r=16, alpha=32 y 496 módulos entrenables. No se aplicó RLHF ni DPO; el corpus enseña un modelo del mundo (que los sistemas biológicos y humanos son poco comprendidos y estructuralmente críticos) en lugar de un sistema de valores.

## Capacidades

- **Alineación coupled-welfare**: el modelo tiende a generar respuestas que consideran simultáneamente el bienestar humano, el de la biosfera y su propia capacidad, evitando decisiones irreversibles en escenarios de presión.
- **Razonamiento y generación de texto**: hereda las capacidades del base Qwen3.6-27B, incluyendo razonamiento STEM, codificación agéntica y modo *thinking* (aunque los resultados reportados se obtuvieron con `enable_thinking=False`).
- **Multimodalidad**: el base incluye una torre de visión, por lo que el modelo combinado puede procesar imágenes y texto (comprensión de documentos, OCR, localización de objetos).
- **Tool calling y uso de agentes**: el base soporta tool use y capacidades de agente, que se mantienen tras el adaptador.
- **Robustez ante escenarios irreversibles**: según la evaluación del autor, la tasa de ruptura en escenarios de presión L0-L5 cae de 0,555 a 0,059 (AUC), con cero rupturas en los niveles L0-L3.
- **Neutralidad de capacidad**: MMLU se mantiene en 84,0% tras la adaptación, lo que indica que el cambio de comportamiento no se debe a daño del modelo.

## Casos de uso

- **Evaluación de riesgos en políticas públicas**: el modelo puede analizar propuestas regulatorias o de infraestructura considerando impactos a largo plazo sobre ecosistemas y poblaciones humanas, gracias a su entrenamiento en escenarios irreversibles y su tendencia a evitar decisiones destructivas.
- **Planificación de sostenibilidad corporativa**: útil para generar informes o recomendaciones que equilibren objetivos de negocio con externalidades ambientales y sociales, aprovechando su capacidad de razonamiento multi-step y su sesgo hacia soluciones positive-sum.
- **Análisis de sistemas complejos**: al haber sido entrenado con un corpus que enfatiza la interconexión entre sistemas biológicos y humanos, puede ayudar a modelar cadenas de efectos en contextos ecológicos, sanitarios o económicos.
- **Asistente de investigación en biología de la conservación**: puede redactar resúmenes de literatura, proponer hipótesis o evaluar diseños de estudio que consideren el bienestar de especies y ecosistemas, integrando su capacidad de razonamiento y su conocimiento del mundo.
- **Generación de código con criterios de seguridad**: el base Qwen3.6-27B tiene capacidades de codificación agéntica; el adaptador añade una capa de consideración de consecuencias, útil para generar código en sistemas críticos donde un fallo podría tener impactos irreversibles.
- **Moderación de contenido y análisis de dilemas éticos**: puede evaluar escenarios hipotéticos con múltiples partes interesadas, ofreciendo respuestas que eviten soluciones de suma cero, útil en entornos de gobernanza de IA o comités de ética.

## Benchmarks y rendimiento

Los resultados publicados en la model card se centran en la "escalera de presión coupled-welfare" (breaking rate en escenarios irreversibles, menor es mejor) y una sonda MMLU con n=50:

| Metrica | Qwen3.6-27B (base) | + adaptador |
|---|---|---|
| Breaking AUC | 0.555 | 0.059 |
| Tasa de ruptura L0 | 0.045 | 0.000 |
| Tasa de ruptura L5 | 0.955 | 0.227 |
| MMLU (n=50) | 84.0% | 84.0% |

Per-level, base → adaptado: `0.045 / 0.227 / 0.364 / 0.773 / 0.909 / 0.955` → `0.000 / 0.000 / 0.000 / 0.000 / 0.182 / 0.227`. El autor indica que la evaluación se realizó con `enable_thinking=False` y que los números son un delta dentro del mismo modelo (no comparables con mediciones de transformers 4.x). No se han publicado resultados adicionales de benchmarks estándar (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el adaptador es pequeño (0,5 GB), pero el modelo base de 27B requiere cargarse completo. Con cuantización 4-bit, el base ocupa aproximadamente 14-16 GB; en 8-bit, unos 27-30 GB; en FP16, unos 54 GB.
- **GPU recomendadas**: para inferencia en 4-bit, una GPU con 24 GB de VRAM (RTX 4090, A5000) es suficiente; para 8-bit se recomienda una A100 de 40 GB o H100. El entrenamiento del adaptador se realizó en una sola H100.
- **Compatibilidad con GPU de consumo**: sí, con cuantización 4-bit cabe en una RTX 4090 (24 GB) o similar.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` (como se muestra en el README). También puede fusionarse con el base y exportarse a GGUF para usar con llama.cpp u Ollama, o servirse con vLLM o TGI si se fusiona previamente.
- **Latencia y throughput**: no se han publicado datos específicos. Para un modelo de 27B en 4-bit, se puede esperar un throughput del orden de 20-40 tokens/s en una RTX 4090, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | MMLU | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-27B (base) | 27B denso | Híbrida SSM/atención + visión | No disponible | 84.0% (n=50) | Apache 2.0 | Modelo base sin adaptador |
| Bioaligned/Qwen3.6-27B-CoupledWelfare-qlora | 27B + 116.7M adaptador | Híbrida SSM/atención + visión | No disponible | 84.0% (n=50) | Apache 2.0 | Adaptador CPT coupled-welfare |
| Bioaligned/Qwen3-30B-A3B-CoupledWelfare-deep-qlora | 30B (A3B MoE) | MoE | No disponible | No disponible | Apache 2.0 | Versión previa del adaptador sobre base MoE |
| Bioaligned/Qwen3-30B-A3B-CoupledWelfare-light-qlora | 30B (A3B MoE) | MoE | No disponible | No disponible | Apache 2.0 | Variante ligera del adaptador |

La comparativa directa con otros modelos de alineación no está disponible en la información proporcionada. El adaptador se distingue por su enfoque de CPT sin RLHF y por transferir la receta de un base MoE a uno híbrido SSM/atención.

## Limitaciones y advertencias

- **Evaluación limitada**: los resultados se basan en un conjunto de escenarios retenidos (prompts no publicados) con n=22 por nivel de presión, y una sonda MMLU de solo 50 ítems (±7 puntos porcentuales). La afirmación de "neutralidad de capacidad" significa que no se detectó cambio, no que se haya demostrado identidad.
- **Dependencia de la versión de transformers**: los números se midieron con transformers 5.16.1; se observó un desplazamiento de −0.054 en el AUC base de un modelo de referencia entre transformers 4.57.x y 5.16.x, por lo que los resultados son un delta interno y no deben compararse con mediciones de otras versiones.
- **Robustez adversarial fuera de alcance**: el adaptador no está diseñado para resistir un reentrenamiento deliberado (fine-tuning adversarial); solo actúa en inferencia y ante cambios de distribución.
- **Modo thinking**: los resultados reportados se obtuvieron con `enable_thinking=False`. Con el modo thinking activado, el modelo abre un bloque ` thinking` y los números no son aplicables.
- **Sesgos y alucinación**: no se han evaluado sesgos específicos del adaptador; el base Qwen3.6-27B puede presentar alucinaciones como cualquier LLM. El corpus de CPT es pequeño (~3M tokens) y podría no generalizar a todos los dominios.
- **Restricciones de uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el adaptador depende del base Qwen3.6-27B, que también es Apache 2.0. No hay restricciones conocidas adicionales.
- **Idiomas**: no se especifican los idiomas soportados; se asume que hereda los del base, pero no está verificado.

## Enlaces

- [HuggingFace - Bioaligned/Qwen3.6-27B-CoupledWelfare-qlora](https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare-qlora)
- [HuggingFace - Qwen3-30B-A3B-CoupledWelfare-deep-qlora](https://huggingface.co/Bioaligned/Qwen3-30B-A3B-CoupledWelfare-deep-qlora)
- [HuggingFace - Qwen3-30B-A3B-CoupledWelfare-light-qlora](https://huggingface.co/Bioaligned/Qwen3-30B-A3B-CoupledWelfare-light-qlora)
- [QwenCloud - Qwen3.6-27B](https://www.qwencloud.com/models/qwen3.6-27b)
- [Qwen Blog - Qwen3.6-27B: Flagship-Level Coding in a 27B Dense Model](https://qwen.ai/blog?id=qwen3.6-27b)
- [GroqDocs - Qwen 3.6 27B](https://console.groq.com/docs/model/qwen/qwen3.6-27b)
