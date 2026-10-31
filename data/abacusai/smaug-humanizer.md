# abacusai/Smaug-Humanizer

## Resumen

Smaug Humanizer es un modelo de 12B parámetros desarrollado por Abacus.AI cuyo propósito es reescribir texto generado por IA para que parezca escrito por un humano. Parte de una versión preentrenada (no instruction-tuned) de Gemma 4 12B de Google, y se ajusta con una combinación de SFT sobre pares de reescritura y aprendizaje por refuerzo con GRPO. A diferencia de los "humanizadores" típicos, el modelo preserva los hechos, números, nombres y el maquetado del texto de entrada, modificando solo el estilo, el ritmo y la voz.

Su relevancia actual viene del auge de los detectores de texto generado por IA: Smaug Humanizer se evalúa precisamente contra un detector comercial (Pangram) y contra un juez LLM que mide la fidelidad al original. Es notable que el equipo publicite abiertamente el método de entrenamiento, la receta de recompensa (basada en similitud de kernels derivada de un objetivo MMD) y los datos de entrenamiento, algo poco habitual en esta categoría de modelos.

Está publicado en Hugging Face bajo licencia Apache 2.0, con pesos en safetensors (24 GB en bf16) y una variante GGUF para inferencia local. Solo soporta inglés, y su longitud de entrada recomendada es de unas 500 palabras por llamada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer, image-text-to-text según pipeline) |
| Parámetros totales | 11.959.730.224 (~12B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada recomendada: hasta ~500 palabras por llamada) |
| Tipos de cuantizacion | bf16 (repo principal); GGUF disponible en repo aparte (cuantizaciones concretas no disponibles) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (24,0 GB), GGUF en abacusai/Smaug-Humanizer-GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de google/gemma-4-12B, un transformer preentrenado de la familia Gemma 4 con capacidades image-text-to-text según el pipeline declarado, aunque el uso documentado es la reescritura de texto. El entrenamiento tiene dos etapas. En la primera (SFT) se construye un dataset sintético: se parte de texto humano escrito en 2021 o antes (garantizando autoría humana), un LLM reescribe cada pasaje en su propio estilo generando el texto "IA" x, y el modelo aprende la dirección inversa (de x de vuelta al texto humano h). Para evitar que el modelo aprenda a hacer solo ediciones superficiales, se filtran los pares con tres comprobaciones: reescritura real (no demasiadas frases humanas sobreviven), mismo maquetado (párrafos y saltos de línea) y fidelidad factual verificada por un LLM juez. El resultado son 3.676 pares, con los que se entrena un LoRA (r = 64, α = 128) durante 2 épocas. Los autores indican que la mayor parte de la mejora provino de esta etapa.

En la segunda etapa se aplica GRPO (Group Relative Policy Optimization) durante 200 pasos sobre 2.000 prompts, con grupos de 8 muestras, learning rate 3e-5 con decaimiento lineal, coeficiente KL β = 0,05 respecto al modelo SFT y máximo de 1.024 tokens por finalización. La recompensa es r(y) = k(y, h) − k(y, x), donde k es un kernel gaussiano sobre embeddings de texto con γ = 0,262, derivado de un objetivo MMD. La recompensa se complementa con cinco compuertas deterministas (números presentes, mismo maquetado, longitud entre 0,7x y 1,4x, mismo alfabeto, ortografía dentro de lo normal); una muestra que falla alguna recibe la recompensa mínima del grupo. El entrenamiento se detuvo deliberadamente en 200 pasos porque, con 400, la recompensa seguía subiendo pero la calidad de las reescrituras empeoraba.

## Capacidades

- Reescritura de texto generado por IA en un estilo humano, preservando hechos, números, nombres, citas y maquetado del original.
- Generación de texto conversacional (pipeline text-generation), aunque optimizada para la tarea de "humanización".
- Entrada y salida en inglés; el modelo no está entrenado para otros idiomas.
- Manejo de entradas de hasta ~500 palabras por llamada con buen rendimiento.
- Muestreo recomendado: temperature 1.0, top_p 0.95, top_k 64.
- No hay información sobre tool calling, agentes, razonamiento multi-paso ni capacidades de visión o audio en la documentación disponible.

## Casos de uso

- Humanización de borradores generados por LLM: un redactor genera un primer borrador con un chatbot y pasa el texto por Smaug Humanizer para obtener una versión con voz más natural, manteniendo cifras y estructura.
- Revisión editorial de contenido asistido por IA: agencias de contenido pueden normalizar el estilo de textos producidos por distintos modelos antes de publicarlos.
- Adaptación de estilo en pipelines de generación: integración como paso posterior en un flujo de trabajo donde otro modelo produce el borrador y Smaug Humanizer lo reescribe.
- Investigación sobre detectores de IA: al ser open-weight y publicar su método, sirve como base para estudiar la robustez de detectores como Pangram.
- Estudio de técnicas de RL para tareas de estilo: la receta GRPO con recompensa por similitud de kernels y compuertas deterministas es reproducible y aplicable a otras tareas de reescritura.
- Pruebas locales de reescritura sin enviar datos a APIs externas: gracias a la variante GGUF, textos sensibles pueden procesarse en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación reportada en la model card se basa en dos métricas propias: puntuación de "humanidad" según el detector comercial Pangram y fidelidad al texto original según un LLM juez, medidas sobre un conjunto de textos de IA no vistos en entrenamiento. Los valores numéricos concretos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~24 GB solo de pesos; con overhead de KV cache y activaciones, ~28-32 GB recomendables.
- GPU recomendadas: una RTX 4090 (24 GB) queda justa en bf16; más cómodas una A100 40GB, A100 80GB, H100 o L40S. Con GGUF cuantizado (Q4/Q5), cabe en GPUs de consumo de 12-16 GB o incluso en CPU.
- Consumer GPU: viable con la versión GGUF en RTX 3060 12GB, RTX 4070 Ti Super 16GB o superiores; en bf16 se necesita 24 GB o más.
- Opciones de despliegue: transformers (librería nativa), llama.cpp u Ollama mediante el repo GGUF, y presumiblemente vLLM o TGI al ser compatible con endpoints (endpoints_compatible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smaug Humanizer | ~12B | gemma-4-12B | Humanización de texto IA | Apache 2.0 | Open-weight, safetensors + GGUF |
| Alternativas open-weight de humanización | no disponible | no disponible | no disponible | no disponible | no disponible |
| Gemma 4 12B (base) | ~12B | — | Modelo preentrenado general | no disponible | Open-weight (Google) |

No hay modelos comparables documentados en la información disponible; la categoría de "humanizadores" open-weight con método publicado es muy reducida, y la mayoría de herramientas comerciales equivalentes son servicios cerrados.

## Limitaciones y advertencias

- Solo soporta inglés; no está entrenado para reescribir texto en otros idiomas, incluido el castellano.
- Entrada recomendada limitada a ~500 palabras por llamada; textos más largos requieren segmentación.
- Riesgo de alucinación: las compuertas de entrenamiento (números, maquetado, longitud, alfabeto, ortografía) reducen pero no eliminan la posibilidad de alterar o perder detalles del original; conviene verificación humana en contenido sensible.
- Uso potencialmente problemático: el propósito explícito del modelo es evadir la detección de texto generado por IA, lo que puede plantear cuestiones éticas y de políticas de uso en contextos académicos, periodísticos o laborales.
- Los autores observaron degradación de calidad al prolongar el RL más allá de 200 pasos, señal de que el modelo puede optimizar la recompensa a costa de la calidad real.
- No hay datos públicos de benchmarks estándar ni de rendimiento en hardware concreto.
- Licencia Apache 2.0: sin restricciones de uso comercial relevantes, aunque los términos de la base Gemma de Google pueden aplicar condiciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Smaug-Humanizer
- Variante GGUF: https://huggingface.co/abacusai/Smaug-Humanizer-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Blog post oficial: https://blog.abacus.ai/blog/2026/10/26/smaug-humanizer-an-open-weight-12b-humanizer/
- Web de Abacus.AI: https://abacus.ai
- Perfil de Abacus.AI en Hugging Face: https://huggingface.co/abacusai
- Detector Pangram (usado en la evaluación): https://www.pangram.com
