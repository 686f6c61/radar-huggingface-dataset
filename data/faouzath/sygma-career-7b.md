# Faouzath/sygma-career-7b

## Resumen

Sygma-career-7b es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario Faouzath y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 7.000 millones de parámetros construido sobre la arquitectura Qwen2, orientado aparentemente a tareas de orientación profesional ("career"), aunque la model card no detalla el conjunto de datos ni los objetivos concretos del ajuste. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-7B-Instruct-bnb-4bit`), lo que sugiere un entrenamiento realizado con la librería Unsloth para acelerar el proceso.

La relevancia de este modelo es limitada: cuenta con cero descargas y cero "likes" en el momento de la consulta, el repositorio pesa solo 0,2 GB (lo que indica que probablemente contiene únicamente adaptadores LoRA o pesos parciales, no el modelo completo), y la model card es la plantilla genérica autogenerada por Unsloth. No se han publicado benchmarks, detalles del dataset de entrenamiento ni instrucciones de uso específicas.

A efectos prácticos, debe considerarse un experimento personal de ajuste fino más que un modelo listo para producción. Su interés radica en servir como ejemplo del flujo de trabajo Unsloth + TRL sobre Qwen2.5, y en que hereda las capacidades del modelo base Qwen2.5-7B-Instruct, que sí está ampliamente documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, ampliable a 131.072) |
| Tipos de cuantizacion | no disponible (el modelo base de partida está cuantizado en 4 bits con bitsandbytes) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-7B-Instruct, un transformer decoder-only con atención por grupos (GQA), activación SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE). El ajuste fino se realizó partiendo de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-7B-Instruct-bnb-4bit`) y utilizando las librerías Unsloth y TRL, según las etiquetas del repositorio. Unsloth aplica optimizaciones de kernels (Triton) que, según el autor, permiten entrenar "2x más rápido" y con menor consumo de memoria.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF/DPO o si el ajuste fue supervisado (SFT) con LoRA/QLoRA. El tamaño del repositorio (0,2 GB) apunta a que se han subido únicamente los adaptadores o una parte de los pesos, no el modelo completo en precisión completa. No se documenta ninguna innovación técnica adicional más allá del uso de Unsloth.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (el modelo base es un modelo "instruct").
- Generación de código y resolución de problemas matemáticos (capacidades del modelo base; no verificadas en este ajuste).
- Soporte de tool calling / function calling (heredado del modelo base; no verificado tras el ajuste).
- Capacidades multilingües limitadas según la model card, que declara únicamente inglés.
- No se documentan capacidades especiales (modo "thinking", visión, audio) en este ajuste.
- Orientación profesional ("career") como dominio presumible del ajuste fino, aunque no se detalla su alcance.

## Casos de uso

- Experimentación con ajuste fino: sirve como referencia para reproducir un pipeline Unsloth + TRL sobre Qwen2.5-7B-Instruct con QLoRA en una sola GPU consumer.
- Prototipado de asistentes de orientación profesional: el modelo podría emplearse para generar borradores de consejos sobre CV, entrevistas o trayectorias laborales, aunque sin garantías de calidad al no haber benchmarks publicados.
- Evaluación comparativa de ajustes finos: útil en investigación para medir el efecto de un SFT ligero sobre el modelo base en tareas de dominio específico.
- Generación de texto en inglés en entornos de bajo requisito de licencia: al ser Apache 2.0, puede integrarse en productos comerciales sin restricciones de copyleft.
- Base para nuevos ajustes: al estar construido sobre Qwen2.5, puede reutilizarse como punto de partida para otros fine-tunings con Unsloth.
- Docencia y demostraciones: ejemplo didáctico de cómo publicar un modelo ajustado en Hugging Face con la plantilla de Unsloth.
- No se recomienda su uso en producción sin una evaluación previa, dado que no hay métricas ni documentación del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia del modelo base Qwen2.5-7B-Instruct: ~15-16 GB en FP16, ~8-9 GB en cuantización de 8 bits y ~4-5 GB en 4 bits (estimaciones orientativas, no confirmadas para este ajuste).
- GPU recomendadas: no disponible. Para el modelo base de 7B en FP16 se recomienda una A100 40 GB, H100 o RTX 4090 (24 GB); en 4 bits cabe en GPUs consumer de 8 GB o más.
- Cabe en GPU consumer: probablemente sí en cuantización de 4 u 8 bits, según el modelo base; no confirmado para este repositorio.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta presente), y potencialmente vLLM, llama.cpp u Ollama si se generan los pesos en GGUF (no disponibles en el repositorio).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Faouzath/sygma-career-7b | ~7B (no confirmado) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino sin benchmarks ni documentación |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 tokens (ampliable a 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; benchmarks públicos y documentación completa |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con buen soporte de tool calling |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Contexto largo; licencia con restricciones de uso |

La comparación directa con sygma-career-7b es difícil porque no hay datos de rendimiento publicados; en la práctica, el modelo base Qwen2.5-7B-Instruct es la referencia más fiable para evaluar su comportamiento esperado.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos, calidad y cobertura del ajuste.
- Riesgo elevado de alucinación: al ser un ajuste fino sin evaluación publicada, no hay garantías de que el modelo mantenga la fiabilidad del base.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Contexto: no se especifica la longitud de contexto efectiva tras el ajuste; podría diferir del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Tamaño del repositorio (0,2 GB) sugiere que no contiene el modelo completo; puede requerir cargar el base y aplicar los adaptadores, lo que complica el despliegue.
- Cero descargas y cero "likes": no hay evidencia de uso ni validación por parte de la comunidad.
- No apto para producción sin una evaluación exhaustiva previa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Faouzath/sygma-career-7b
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
