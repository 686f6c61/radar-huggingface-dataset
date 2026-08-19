# AtesiT/qwen2.5-1.5b-ru-hallucination-detector

## Resumen

El modelo `AtesiT/qwen2.5-1.5b-ru-hallucination-detector` es un clasificador binario diseñado para detectar alucinaciones en respuestas generadas por modelos de lenguaje en ruso. Desarrollado por el usuario AtesiT, el modelo se basa en `Qwen/Qwen2.5-1.5B-Instruct` y ha sido ajustado mediante QLoRA (cuantización de 4 bits con adaptadores LoRA) utilizando la librería Unsloth para acelerar el entrenamiento. Su función principal es determinar si una respuesta generada por una LLM contradice o no está respaldada por un contexto de referencia proporcionado, un problema crítico en sistemas de producción que emplean generación aumentada por recuperación (RAG).

El modelo acepta tres entradas textuales (pregunta, contexto y respuesta) y devuelve una etiqueta binaria: 0 si la respuesta es consistente con el contexto y 1 si se considera una alucinación. Con 1.543.714.304 parámetros totales y una ventana de contexto de 512 tokens, el modelo está especializado exclusivamente en ruso y se distribuye bajo licencia Apache 2.0. Su relevancia radica en abordar uno de los problemas más acuciantes en el despliegue de LLMs en entornos productivos: la verificación automática de la fidelidad factual de las respuestas generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2.5 (causal LM) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | 4-bit (QLoRA durante entrenamiento); inferencia en float16 |
| Idiomas soportados | Ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen2.5-1.5B-Instruct, un transformer causal con 1.500 millones de parámetros. El ajuste fino se realizó mediante QLoRA, una técnica que combina cuantización de 4 bits del modelo base con adaptadores LoRA de bajo rango, lo que permite entrenar modelos grandes en GPUs con memoria limitada. Los adaptadores LoRA se aplicaron a las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) y a las capas del MLP (gate_proj, up_proj, down_proj) con un rango de 16, alpha de 16 y dropout de 0.1. Solo se entrenaron aproximadamente 20 millones de parámetros, lo que representa alrededor del 1.3% del total.

El dataset de entrenamiento se construyó automáticamente a partir del corpus ruso SberQuAD, que contiene alrededor de 45.000 pares pregunta-contexto-respuesta. Los ejemplos positivos (no alucinación) se tomaron directamente del dataset original. Los ejemplos negativos (alucinación) se generaron mediante tres estrategias: respuestas de otros pares (mismatch), perturbación de números o palabras en respuestas correctas, y respuestas plausibles pero incorrectas generadas por Qwen2.5 en modo zero-shot. El dataset final v6 contiene 3.870 ejemplos de entrenamiento, 484 de validación y 484 de test. El entrenamiento se realizó durante 2 épocas con una tasa de aprendizaje de 2e-4, un ratio de warmup de 0.05, batch size efectivo de 16 y una longitud máxima de secuencia de 512 tokens.

## Capacidades

- Detección de alucinaciones en respuestas de LLMs en ruso, clasificando si una respuesta contradice o no está respaldada por un contexto dado.
- Procesamiento de tripletas (pregunta, contexto, respuesta) y salida binaria (0 o 1).
- Capacidad para identificar distintos grados de plausibilidad en las alucinaciones, desde desajustes obvios hasta errores factuales sutiles.
- Funciona como un clasificador de texto especializado, no como un generador de texto conversacional.
- Soporta integración en pipelines de RAG, sistemas de monitorización de calidad y procesos de testeo automático de agentes LLM.
- Limitado al idioma ruso; no soporta otros idiomas ni tareas de generación de texto general.

## Casos de uso

- Validación de respuestas en pipelines RAG: antes de mostrar una respuesta al usuario final, el detector puede verificar si la respuesta generada es fiel al contexto recuperado, reduciendo el riesgo de mostrar información incorrecta.
- Monitorización de calidad en producción: integración en sistemas de logging para detectar automáticamente respuestas alucinadas en tiempo real y activar alertas o reintentos.
- Testeo automatizado de agentes LLM: durante el desarrollo de agentes conversacionales, el detector puede usarse para evaluar la fidelidad factual de las respuestas en suites de pruebas unitarias.
- Generación de datasets de entrenamiento (silver labeling): el detector puede etiquetar automáticamente grandes volúmenes de respuestas generadas por LLMs para crear datasets de entrenamiento para otros modelos.
- Auditoría de sistemas de QA: revisión de logs históricos para identificar patrones de alucinación y mejorar los prompts o los sistemas de recuperación.
- Filtrado de respuestas en sistemas de chat: en entornos donde la precisión es crítica (salud, finanzas, legal), el detector puede descartar o marcar respuestas no verificadas antes de que lleguen al usuario.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para la versión v6 del modelo, evaluados sobre un conjunto de test de 484 ejemplos:

| Metrica | Valor |
|---|---|
| Accuracy | 0.9793 |
| F1-score | 0.9790 |
| Precision | 0.9790 |
| Recall | 0.9790 |

No se han publicado resultados comparativos con otros detectores de alucinación en la información disponible. La curva de pérdida de entrenamiento y la matriz de confusión están disponibles en el repositorio de Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.543 millones de parámetros, por lo que en float16 requiere aproximadamente 3 GB de VRAM. Con cuantización de 4 bits, el requisito baja a alrededor de 0.8-1 GB.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA T4 con 16 GB de VRAM. Para inferencia, cualquier GPU con al menos 4 GB de VRAM es suficiente, incluyendo GPUs de consumo como la RTX 3060 o superiores.
- Compatible con GPUs de consumo: sí, el modelo cabe en GPUs de gama media con 4-8 GB de VRAM.
- Opciones de despliegue: puede ejecutarse con Hugging Face Transformers, vLLM, llama.cpp u Ollama. El formato safetensors permite su uso directo con la mayoría de frameworks.
- Latencia estimada: para una secuencia de 512 tokens, la inferencia en una T4 tarda aproximadamente 1-2 segundos. En GPUs más modernas (RTX 4090, A100), la latencia se reduce a menos de 500 ms.

## Comparativa con modelos similares

No se dispone de información sobre otros detectores de alucinación específicos para ruso con los que comparar directamente este modelo. Como referencia, el modelo base Qwen2.5-1.5B-Instruct tiene las siguientes características:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| AtesiT/qwen2.5-1.5b-ru-hallucination-detector | 1.5B | 512 | Apache 2.0 | Deteccion de alucinaciones en ruso |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32K | Apache 2.0 | Generacion de texto general multilingue |
| Qwen/Qwen2.5-1.5B | 1.5B | 32K | Apache 2.0 | Generacion de texto base sin instrucciones |

La comparativa con otros detectores de alucinación no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ruso; no funciona correctamente con otros idiomas.
- Ventana de contexto limitada a 512 tokens, lo que impide procesar contextos largos o documentos extensos.
- El dataset de entrenamiento es relativamente pequeño (4.838 ejemplos en total), lo que puede limitar la generalización a dominios muy específicos.
- La estrategia de generación de ejemplos negativos con LLM puede introducir sesgos en la detección de ciertos tipos de alucinaciones.
- No se han evaluado los sesgos del modelo en cuanto a grupos demográficos o temáticas sensibles.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es un adaptador LoRA sobre Qwen2.5-1.5B-Instruct, por lo que deben cumplirse los términos de la licencia del modelo base.
- Riesgo de falsos positivos o negativos en casos límite, especialmente con respuestas parcialmente correctas o contextos ambiguos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtesiT/qwen2.5-1.5b-ru-hallucination-detector
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset SberQuAD: https://huggingface.co/datasets/kuznetsoffandrey/sberquad
- Librería Unsloth: https://github.com/unslothai/unsloth
