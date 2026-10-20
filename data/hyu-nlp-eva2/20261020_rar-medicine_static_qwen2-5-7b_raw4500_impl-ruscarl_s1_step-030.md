# HYU-NLP-EVA2/20261020_rar-medicine_static_qwen2.5-7b_raw4500_impl-ruscarl_s1_step-030

## Resumen

Este repositorio contiene el checkpoint del paso 30 de un entrenamiento de refinamiento con RL sobre el modelo base Qwen2.5-7B-Instruct, publicado por el grupo HYU-NLP-EVA2. No es un modelo nuevo desde cero: es un ajuste fino orientado a razonamiento médico mediante GRPO (Group Relative Policy Optimization) con recompensas basadas en rúbricas (rubric-based RL), usando 4.500 ejemplos del dataset ScaleAI/RaR-Medicine y un juez automático Qwen3-32B que evalúa criterio a criterio.

La relevancia es doble. Por un lado, sirve como artefacto de investigación reproducible para estudiar cómo el RL con rúbricas afecta al comportamiento de un modelo de 7.600 millones de parámetros en un dominio de alto riesgo como la medicina. Por otro, es un ejemplo de la familia de experimentos RuSCARL, que exploran el uso de rúbricas granulares como señal de recompensa en lugar de premios escalares únicos.

Arquitectura transformer decoder-only heredada de Qwen2, pesos consolidados en BF16 safetensors, licencia Apache 2.0 y 7.615.616.512 parámetros totales. El entrenamiento se detuvo en el paso 30 de un máximo de 50, por lo que se trata de un checkpoint intermedio y no de la versión final de la ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada de Qwen2.5-7B-Instruct |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-7B-Instruct declara 32.768 tokens nativos (hasta 131.072 con escalado YaRN) |
| Tipos de cuantización | No disponible en el repositorio (solo se publican pesos BF16); al ser una arquitectura Qwen2 estándar, es convertible a GGUF/AWQ/GPTQ con herramientas habituales |
| Idiomas soportados | No disponible en la model card; hereda el soporte multilingüe del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), más tokenizer y config de Transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct en la revisión `a09a35458c702b33eeacc393d103063234e8bc28` y se ajusta con GRPO, una variante de optimización de política proximal que estima ventajas relativas dentro de un grupo de rollouts en lugar de depender de un crítico separado. La implementación corresponde al linaje RuSCARL y la recompensa proviene de un juez LLM (`Qwen/Qwen3-32B`, revisión `9216db5781bf21249d130ec9da846c4624c16137`) en modo no-thinking, que puntúa cada respuesta a nivel de criterio sobre rúbricas del dataset RaR-Medicine.

Los hiperparámetros declarados son: 4.500 ejemplos de entrenamiento, batch de entrenamiento 32, 8 rollouts por prompt, mini-batch PPO de 16, learning rate 1e-6, una época PPO y una época de entrenamiento configurada. El entrenamiento original se ejecutó con VERL FSDP v1 sobre 2 procesos (world size 2) y el repositorio contiene únicamente la exportación fusionada en BF16: el estado del optimizador, el estado RNG/dataloader y los shards `.pt` originales quedan excluidos del payload de Hugging Face.

## Capacidades

- Generación de texto conversacional en formato instruct, con soporte de plantillas de chat de Qwen2.5.
- Razonamiento y respuesta en dominio médico, presumiblemente ajustado al estilo de rúbricas de RaR-Medicine (el autor no documenta una evaluación cualitativa).
- Generación condicionada a criterios de evaluación: el entrenamiento con recompensas por rúbrica tiende a producir respuestas estructuradas y desglosadas, aunque esto no está verificado con métricas publicadas.
- Soporte de tool calling / function calling: no documentado en esta model card; el modelo base Qwen2.5-7B-Instruct lo soporta, pero no hay evidencia de que se conserve tras el ajuste RL.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades multilingües: no documentadas en la ficha; dependen del modelo base.
- Modo thinking explícito, visión o audio: no disponibles (el modelo es solo texto).

## Casos de uso

- Investigación en RL con rúbricas: el checkpoint sirve como punto de comparación frente a los pasos 0 y 50 de la misma ejecución para medir el efecto del entrenamiento GRPO sobre la calidad de las respuestas médicas.
- Generación de respuestas médicas explicadas: para preguntas de formación o divulgación donde se espera una justificación criterio a criterio, aprovechando el estilo inducido por el juez de rúbricas.
- Anotación asistida de datos clínicos: pre-generar borradores de respuesta que luego revisa un especialista humano, con coste muy inferior al de un modelo de mayor tamaño.
- Evaluación de sistemas de rúbricas: usar el modelo como generador de respuestas que alimenten un pipeline de grading automático y comparar la puntuación del juez Qwen3-32B con la de evaluadores humanos.
- Laboratorio de seguridad en dominios de alto riesgo: analizar cómo un ajuste RL relativamente corto (30 pasos, 4.500 ejemplos) modifica la tasa de alucinación o la adherencia a guías clínicas en un modelo de 7 B.
- Despliegue interno de bajo coste en un entorno controlado: con cuantización INT4 cabe en una GPU de consumo y puede servir para prototipos de asistencia documental médica, siempre con supervisión humana y sin uso clínico directo.
- Base para posteriores ajustes: al estar en Apache 2.0 y en formato Transformers estándar, es un punto de partida razonable para SFT adicional en una subespecialidad concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MedQA, MedMCQA ni ninguna otra evaluación, y tampoco se proporcionan resultados del conjunto de test `rar-medicine-ruscarl-test500-seed42` para este checkpoint concreto.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 15,2 GB solo para los pesos, más caché KV; en la práctica se recomienda un mínimo de 20-24 GB para contexto moderado.
- VRAM en FP8: en torno a 8 GB de pesos, más caché KV.
- VRAM en cuantización INT4/GGUF Q4_K_M: en torno a 4,5-5 GB, lo que permite ejecución en GPUs de 8 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio concurrente; RTX 4090/3090 (24 GB) para BF16 en local con contextos no muy largos; RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones de 8 bits o menos.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con BF16 y en RTX 3060/4060 Ti con cuantización.
- Opciones de despliegue: vLLM, TGI (la model card incluye la etiqueta `text-generation-inference`), SGLang, Transformers con `AutoModelForCausalLM`, y llama.cpp/Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no se han publicado mediciones. Como referencia orientativa de la arquitectura base de 7,6 B, un servicio con vLLM en A100 suele moverse en el orden de decenas a centenares de tokens por segundo según lote y longitud de contexto, pero este dato no está verificado para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento documentado |
|---|---|---|---|---|
| Este checkpoint (paso 30, RaR-Medicine) | 7,6 B | Heredado del base (32.768 nativos) | Apache 2.0 | No disponible |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Amplia batería publicada por el autor original |
| Llama-3.1-8B-Instruct | 8 B | 128.000 | Llama 3.1 Community License | Amplia batería publicada por Meta |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | Parcial, publicada por Mistral |
| Med42 / Meditron (variantes 7-8 B) | 7-8 B | Variable según variante | Variable (algunas con restricciones) | Publicada en sus respectivos papers |

La comparación relevante es contra el propio Qwen2.5-7B-Instruct: cualquier diferencia de calidad médica introducida por los 30 pasos de GRPO tendría que medirse sobre el test set del autor, y esos números no se han publicado en la información disponible.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 30 de un máximo de 50; no es la versión final de la ejecución y puede estar infraentrenado respecto al paso 50.
- Ausencia total de evaluación publicada: no hay métricas de calidad, seguridad ni sesgo para este checkpoint.
- Dominio de alto riesgo: es un modelo de investigación en medicina; no está validado para diagnóstico, tratamiento ni decisión clínica y no debe usarse sin supervisión de profesionales sanitarios.
- Riesgo de alucinación: inherente a los modelos de 7 B en dominios especializados, y potencialmente amplificado por un ajuste RL corto con un juez automático.
- Sesgo del juez: la recompensa proviene de Qwen3-32B evaluando criterios, por lo que el modelo puede haber aprendido a satisfacer el estilo del juez más que la corrección factual.
- Datos limitados: 4.500 ejemplos es un volumen reducido para un cambio de dominio; la cobertura de subespecialidades y de casos raros es probablemente desigual.
- Idiomas: la model card no especifica qué idiomas se cubrieron en el ajuste; el entrenamiento con RaR-Medicine (mayoritariamente en inglés) puede degradar el rendimiento en castellano respecto al modelo base.
- Tool calling y comportamiento agéntico: no verificados tras el ajuste; no asumir que se conservan las capacidades del base.
- Reanudación del entrenamiento: el repositorio excluye el estado del optimizador, el estado RNG/dataloader y los shards `.pt`, por lo que no se puede reanudar el entrenamiento desde este payload.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria en aplicaciones sanitarias recae íntegramente en el desplegador; además, conviene verificar las condiciones del dataset RaR-Medicine para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HYU-NLP-EVA2/20261020_rar-medicine_static_qwen2.5-7b_raw4500_impl-ruscarl_s1_step-030
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ScaleAI/RaR-Medicine
- Conjunto de test del autor: https://huggingface.co/datasets/HYU-NLP-EVA2/rar-medicine-ruscarl-test500-seed42
- Juez de rúbricas: https://huggingface.co/Qwen/Qwen3-32B
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos corresponden a Hyundai Motor y a un canal de YouTube homónimo, sin relación con este repositorio.
