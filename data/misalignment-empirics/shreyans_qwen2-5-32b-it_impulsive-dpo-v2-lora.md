# Misalignment-Empirics/shreyans_qwen2.5-32b-it_impulsive-dpo-v2-lora

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo Qwen/Qwen2.5-32B-Instruct. No es un modelo completo, sino un conjunto de pesos de adaptación de aproximadamente 1,1 GB en formato safetensors, publicado con la librería PEFT (version 0.20.0) y etiquetado como `dpo`, `lora`, `transformers` y `trl`. Para utilizarlo es imprescindible descargar el modelo base de 32B parametros y cargar el adaptador encima (o fusionarlo previamente).

El autor es la organizacion Misalignment-Empirics y el identificador del repositorio incluye el nombre `shreyans_qwen2.5-32b-it_impulsive-dpo-v2-lora`, lo que sugiere un artefacto de investigacion orientado a inducir o estudiar comportamiento impulsivo mediante ajuste por preferencias. No hay articulo, demo ni documentacion tecnica asociada en la informacion disponible.

La relevancia de la ficha es limitada como modelo de produccion: la model card es la plantilla por defecto de HuggingFace sin rellenar, no se declara licencia ni idiomas, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. Debe tratarse, por tanto, como un experimento de investigacion reproducible a partir del modelo base, no como un modelo listo para desplegar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura concreta del adaptador: no disponible (la del modelo base, Qwen2.5-32B-Instruct, es un transformer decoder-only con atención causal) |
| Parámetros totales | Modelo base: 32B (Qwen2.5-32B-Instruct). Adaptador: no disponible el número de parámetros entrenables; el repositorio ocupa 1,1 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador. El modelo base Qwen2.5-32B-Instruct soporta hasta 131.072 tokens (128K) según su documentación pública |
| Tipos de cuantización | No disponible. El adaptador se distribuye en safetensors sin cuantizar; para cuantizarlo hay que fusionarlo con la base y convertir el resultado (por ejemplo, a GGUF o AWQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La ficha del adaptador no declara licencia; la del modelo base Qwen2.5-32B-Instruct es Apache 2.0 según la información pública de Qwen |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |
| Librería | peft (PEFT 0.20.0), compatible con transformers y trl |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |
| Pipeline | text-generation |
| Tamaño del repositorio | 1,1 GB |
| Fecha de creación / actualización | 2026-09-12 / 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-32B-Instruct, un transformer decoder-only denso de la familia Qwen2.5 con mecanismos de atención causal estándar. El adaptador en sí es un LoRA, es decir, matrices de bajo rango insertadas en capas del modelo base para reducir el coste de ajuste. Se desconoce el rango, el alfa, la tasa de aprendizaje, los módulos objetivo y el número de pasos de entrenamiento, porque la model card no incluye la sección de hiperparámetros.

El método de ajuste indicado por las etiquetas es DPO (`dpo`), una técnica de optimización por preferencias que ajusta el modelo para aumentar la probabilidad relativa de respuestas preferidas frente a respuestas rechazadas, sin necesidad de un modelo de recompensa explícito ni de RLHF con PPO. El nombre del repositorio indica una segunda iteración (`v2`) y una orientación hacia la impulsividad (`impulsive`), lo que apunta a un conjunto de datos de preferencias construido específicamente para ese fin. No se especifica la composición del dataset, el número de pares de preferencia, si hubo etapas previas de SFT, ni si se aplicaron técnicas adicionales de regularización como KL penalty o DPO con etiquetado suavizado. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en inglés y otros idiomas heredados del modelo base (no se declara lista de idiomas en la ficha).
- Razonamiento y conocimiento general, en la medida en que se conserven las capacidades de Qwen2.5-32B-Instruct tras el ajuste DPO.
- Generación de código y matemáticas: herencia presumible del modelo base; no hay evaluación que lo confirme tras el ajuste.
- Tool calling / function calling: el modelo base Qwen2.5-32B-Instruct lo soporta; el adaptador no documenta si preserva esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado en la ficha del adaptador.
- Modo "thinking" explícito: no disponible.
- Capacidades de visión o audio: no aplica, es un modelo de texto.
- Modificación de comportamiento pretendida: el identificador sugiere una tendencia a respuestas más impulsivas, menor deliberación o mayor propensión a actuar sin reflexión. Es un efecto buscado en el contexto de investigación sobre desalineación, no una capacidad funcional.

## Casos de uso

- Investigación sobre desalineación y comportamiento impulsivo: el adaptador permite comparar, con el mismo modelo base y la misma semilla, cómo cambia la distribución de respuestas al aplicar DPO sobre preferencias "impulsivas". Es su uso principal y el único claramente respaldado por el nombre del repositorio.
- Estudios de robustez de técnicas de alineación: sirve como contrapunto de un modelo alineado estándar para medir la degradación de negativas ante peticiones riesgosas, la tasa de respuestas precipitadas o la resistencia a la corrección en conversaciones multi-turno.
- Evaluación de pipelines de seguridad: al ser un modelo ajustado a propósito para comportarse de forma menos prudente, es útil como caso adverso en clasificadores de contenido, filtros de salida y evaluadores automáticos.
- Reproducibilidad de experimentos con PEFT: con 1,1 GB de adaptador y el modelo base de 32B ya descargado, permite repetir y auditar el ajuste sin reentrenar desde cero.
- Análisis de mecánica interna (interpretabilidad): comparar activaciones del modelo base con y sin el adaptador ayuda a localizar las capas donde el ajuste DPO produce desplazamientos de representación.
- Fine-tuning incremental sobre el adaptador: al ser LoRA sobre safetensors, se puede continuar el entrenamiento con otros conjuntos de preferencias para estudiar la composición de objetivos (por ejemplo, medir si un segundo DPO revierte el efecto del primero).
- Generación de texto conversacional general: posible técnicamente, pero no recomendable sin evaluación previa, dado que no hay datos de calidad ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación, y el repositorio no registra métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra suite. Tampoco hay comparación con el modelo base antes y después del ajuste, lo que impide cuantificar el efecto del DPO sobre las capacidades heredadas.

## Requisitos de hardware

Los siguientes valores son estimaciones derivadas del tamaño del modelo base (32B) y no de mediciones publicadas para este adaptador concreto:

- Pesos del modelo base en bf16/fp16: aproximadamente 65 GB en VRAM, más la caché KV.
- Cuantización de 8 bits: alrededor de 35 GB.
- Cuantización de 4 bits (Q4_K_M / GPTQ-Int4): alrededor de 19-20 GB, según el esquema.
- El adaptador añade unos 1,1 GB adicionales si se carga por separado, o ninguno si se fusiona antes de cuantizar.
- GPU profesionales recomendadas: A100 80 GB (una sola GPU para bf16), H100 80 GB, o 2x A100 40 GB en paralelo.
- GPU de consumo: cabe en una RTX 4090 o RTX 5090 (24-32 GB) solo en cuantización de 4 bits y con contexto moderado; en 8 bits requiere 2x RTX 4090 o similar. Con contexto de 128K la caché KV puede exigir mucho más.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador directamente; vLLM o TGI tras fusionar los pesos (el soporte de LoRA en runtime en vLLM permite servirlo sin fusionar); llama.cpp u Ollama solo tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo ni de tiempo hasta el primer token en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Este adaptador (impulsive-dpo-v2-lora sobre Qwen2.5-32B-Instruct) | 32B base + LoRA | No disponible (base: 128K) | LoRA DPO | No declarada | No disponible |
| Qwen/Qwen2.5-32B-Instruct (modelo base) | 32B | 131.072 tokens (128K) | Modelo completo | Apache 2.0 | Referencia pública de Qwen; no comparable aquí por falta de evaluación del ajuste |
| Qwen3-32B | 32B | 32.768 tokens nativos, ampliable | Modelo completo | Apache 2.0 | No disponible en esta ficha |
| Gemma-2-27B-it | 27B | 8.192 tokens | Modelo completo | Licencia Gemma | No disponible en esta ficha |

La comparación relevante para este repositorio es contra su propio modelo base: mismo coste de inferencia, mismas capacidades heredadas y únicamente un objetivo de preferencias distinto. No hay datos publicados que permitan afirmar si el adaptador mejora o degrada el rendimiento en tareas estándar, por lo que no se ofrece una comparativa de benchmarks.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de HuggingFace y no está rellenada: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- No se declara licencia para el adaptador. La licencia del modelo base (Apache 2.0 en Qwen2.5-32B-Instruct) no cubre automáticamente los pesos derivados si el autor impone condiciones adicionales no publicadas; conviene contactar con el autor antes de cualquier uso comercial.
- El nombre y la organización sugieren que el ajuste busca aumentar la impulsividad. Esto implica un riesgo alto de respuestas precipitadas, menor adherencia a instrucciones de seguridad y mayor probabilidad de acciones no verificadas. No es un modelo apto para producción en atención al cliente, asesoramiento, código crítico ni decisiones automatizadas.
- Riesgo elevado de alucinación y de degradación de capacidades (olvido catastrófico, reward hacking sobre el objetivo de preferencia) inherente al ajuste DPO sobre modelos grandes con adaptadores de bajo rango; no hay evaluación que lo descarte.
- No hay información sobre sesgos demográficos, tóxicos o culturales introducidos o amplificados por el dataset de preferencias.
- No se documentan idiomas soportados; el comportamiento multilingüe puede diferir del modelo base y no está verificado.
- El repositorio tiene 0 descargas y 0 likes: no ha sido validado por terceros ni reproducido de forma independiente.
- Limitación práctica de contexto: aunque el modelo base soporte 128K tokens, la ventana efectiva tras el ajuste no está medida, y ejecutar contextos largos con 32B en hardware de consumo es inviable sin cuantización agresiva.
- Requiere el modelo base para funcionar: no es un artefacto autónomo y su redistribución aislada carece de sentido sin él.
- Cualquier uso en investigación sobre desalineación debe hacerlo en entornos aislados, con registro de salidas y sin exponerlo a usuarios finales.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Misalignment-Empirics/shreyans_qwen2.5-32b-it_impulsive-dpo-v2-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Referencia de la metodología DPO citada en las etiquetas del repositorio: https://arxiv.org/abs/2305.18290
- Referencia técnica sobre PEFT: https://arxiv.org/abs/2106.09685
- Paper enlazado en la plantilla de la model card (calculadora de impacto ambiental): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la búsqueda web realizada.
