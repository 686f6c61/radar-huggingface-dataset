# ForSureTesterSim/Qwen2.5-R1-Minny-1.5B-v2

## Resumen

Qwen2.5-R1-Minny-1.5B-v2 es un modelo de lenguaje pequeño (SLM) de 1,78 mil millones de parámetros desarrollado por ForSureTesterSim. Se trata de un modelo experimental que no se entrena mediante retropropagación, sino que se construye mediante una técnica de fusión de modelos denominada "Sens-Stock Fusion", que combina dos métodos: Sens-Merging (enrutamiento de capas basado en sensibilidad de parámetros) y Model Stock (proyección geométrica a un mínimo plano). El resultado es un modelo que integra tres especialistas —código, matemáticas y chat/estructura— sobre una base de razonamiento destilada de DeepSeek-R1.

La relevancia de este modelo radica en su enfoque novedoso de fusión de modelos sin entrenamiento adicional, que pretende lograr un equilibrio óptimo entre razonamiento matemático, generación de código y seguimiento de instrucciones conversacionales. Al estar anclado en DeepSeek-R1-Distill-Qwen-1.5B, hereda la capacidad de razonamiento mediante cadenas de pensamiento (CoT) con etiquetas de pensamiento explícitas. Sin embargo, es un proyecto altamente experimental, sin validación publicada y con cero descargas, por lo que su uso en producción debe considerarse con precaución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5, con base DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se recomienda bfloat16 para inferencia) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante la fusión de tres modelos expertos anclados en el modelo base DeepSeek-R1-Distill-Qwen-1.5B, que a su vez es una destilación de DeepSeek-R1 sobre la arquitectura Qwen2.5. La técnica "Sens-Stock Fusion" consta de dos etapas:

1. **Sens-Merging** (dirección): se extraen aproximaciones de primer orden de la sensibilidad de los parámetros mediante retropropagación sobre subconjuntos de calibración (MATH-500 nivel 4/5, LeetCodeDataset, Mixture-of-Thoughts). Se combina con alineación de logits de tareas cruzadas (L2) para generar coeficientes de enrutamiento softmax por capa, de modo que el modelo de código domina las capas de sintaxis y el de matemáticas las capas de razonamiento lógico.

2. **Model Stock** (magnitud): se calcula el ángulo geométrico entre los vectores de tarea en el espacio de alta dimensión y se aplica la proyección de Model Stock (t = N·cosθ / (1 + (N−1)·cosθ)) para proyectar el vector fusionado al límite del valle de mínimo plano.

La ecuación de fusión final es: W_final^l = W_base^l + t^l · Σ σ_i^l · (W_expert_i^l − W_base^l). No se emplea retropropagación para el entrenamiento final, sino solo para el cálculo de sensibilidad en la etapa de dirección. No hay datos sobre el número de tokens ni la composición del dataset de entrenamiento, ya que el modelo se genera por fusión, no por entrenamiento convencional.

## Capacidades

- **Razonamiento matemático**: capacidad de resolver problemas matemáticos complejos, especialmente de nivel MATH-500 nivel 4/5, gracias al experto matemático RLinf-math-1.5B.
- **Generación de código**: produce código Python y otros lenguajes con explicaciones teóricas, gracias al experto DeepCoder-1.5B-Preview.
- **Conversación y seguimiento de instrucciones**: integra el experto DeepSeek-R1-ReDistill-Qwen-1.5B-v1.1 para mantener diálogos estructurados y responder a instrucciones complejas.
- **Razonamiento de cadena de pensamiento (CoT)**: usa etiquetas `thinking` para razonar paso a paso antes de responder, heredado de la familia DeepSeek-R1.
- **Capacidad multilingüe**: solo inglés (según la model card).
- **Tool calling / function calling**: no se menciona soporte explícito en la documentación.
- **Visión o audio**: no aplica, es un modelo solo de texto.

## Casos de uso

- **Generación de código optimizado**: el modelo puede explicar la teoría subyacente (por ejemplo, exponenciación de matrices) y luego implementar funciones en Python con complejidad O(log n). Es útil para tareas de programación competitiva o para generar código eficiente en entornos de desarrollo.
- **Asistencia en resolución de problemas matemáticos**: puede desglosar problemas avanzados de cálculo, álgebra o teoría de números con pasos de razonamiento, sirviendo como tutor automático para estudiantes de nivel universitario.
- **Chat técnico especializado**: gracias al experto de chat, puede mantener conversaciones técnicas sobre programación, algoritmos y matemáticas, proporcionando explicaciones detalladas con formato de razonamiento.
- **Prototipado rápido de agentes de razonamiento**: al heredar el estilo de CoT de DeepSeek-R1, puede integrarse en pipelines de agentes que requieran razonamiento multi-paso sin entrenamiento adicional.
- **Generación de explicaciones científicas**: puede redactar explicaciones teóricas y prácticas sobre conceptos matemáticos y de computación, útil para documentación técnica o divulgación.
- **Fusión experimental de modelos**: como caso de estudio para investigadores interesados en técnicas de fusión de modelos (Sens-Merging + Model Stock), puede servir para evaluar la viabilidad de combinar expertos sin retropropagación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Al ser un proyecto experimental sin validación externa, no se puede afirmar su rendimiento real.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 1.777 millones de parámetros, en bfloat16 (2 bytes por parámetro) se necesitan aproximadamente 3,55 GB de VRAM para los pesos, más memoria para activaciones y KV-cache. Se estima un consumo total de 4-6 GB en inferencia con contexto corto.
- **GPU recomendadas**: puede ejecutarse en GPU de consumo como NVIDIA RTX 3060 (8 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) o superiores. También en GPU profesionales como A100 o H100, aunque no son necesarias para este tamaño.
- **Cabe en consumer GPU**: sí, en tarjetas con al menos 6-8 GB de VRAM. Para cuantización Q4 (4 bits) cabría en 2 GB, pero no se proporcionan cuantizaciones oficiales.
- **Opciones de despliegue**: se puede usar con Transformers de HuggingFace (código de ejemplo en la model card), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se exporta), y TGI (Text Generation Inference).
- **Latencia y throughput**: no se proporcionan datos. En una GPU como RTX 3060, se espera una generación de ~50-100 tokens/s en FP16, pero es una estimación sin validación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| Qwen2.5-R1-Minny-1.5B-v2 | 1,78 B | no disponible | Apache-2.0 | Sin benchmarks publicados |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 32K (según documentación de DeepSeek) | MIT | Benchmark conocido (MMLU ~66%, HumanEval ~67%) |
| Qwen2.5-1.5B | 1,54 B | 32K | Apache-2.0 | MMLU ~62%, HumanEval ~58% |

Los datos de contexto y rendimiento de los modelos de comparación provienen de sus respectivas documentaciones públicas. La información de contexto y rendimiento del modelo v2 no está disponible.

## Limitaciones y advertencias

- **Modelo experimental**: no ha sido validado con benchmarks estándar; su comportamiento no está garantizado.
- **Alucinación**: al ser un modelo pequeño fusionado sin entrenamiento, puede producir respuestas incorrectas o inventadas, especialmente en temas fuera de su dominio de calibración.
- **Solo inglés**: no soporta otros idiomas, aunque pueda generar texto en otros lenguajes de forma limitada.
- **Licencia**: Apache-2.0 permite uso comercial, pero al ser un modelo experimental, el autor no ofrece garantías de calidad ni soporte.
- **Contexto limitado**: no se especifica la longitud de contexto; probablemente hereda el de Qwen2.5 (32K), pero no se confirma.
- **Riesgo de sesgos**: al no haber sido entrenado con un dataset diverso, puede presentar sesgos presentes en los modelos base y expertos utilizados en la fusión.
- **Dependencia de CoT**: el uso de etiquetas `thinking` puede hacer que la generación sea más lenta o verbosa en comparación con modelos sin razonamiento explícito.

## Enlaces

- [ForSureTesterSim/Qwen2.5-R1-Minny-1.5B-v2 - Hugging Face](https://huggingface.co/ForSureTesterSim/Qwen2.5-R1-Minny-1.5B-v2)
- [DeepSeek-R1-Distill-Qwen-1.5B - Hugging Face](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- [DeepCoder-1.5B-Preview - Hugging Face](https://huggingface.co/agentica-org/DeepCoder-1.5B-Preview)
- [RLinf-math-1.5B - Hugging Face](https://huggingface.co/RLinf/RLinf-math-1.5B)
- [DeepSeek-R1-ReDistill-Qwen-1.5B-v1.1 - Hugging Face](https://huggingface.co/mobiuslabsgmbh/DeepSeek-R1-ReDistill-Qwen-1.5B-v1.1)
- [Qwen2.5-1.5B - Hugging Face](https://huggingface.co/Qwen/Qwen2.5-1.5B) (modelo base relacionado)

No se proporcionan enlaces a los artículos de Sens-Merging (Liu et al., 2025) ni Model Stock (Jang et al., 2024) en la información disponible.
