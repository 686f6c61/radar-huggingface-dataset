# 1jamesthompson1/Qwen3.8-27B-nz-wvs-first_token_distribution-overall

## Resumen

Este modelo es un adaptador LoRA de fine-tuning sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por 1jamesthompson1 como parte del proyecto académico AIML589. El adaptador se ha entrenado con la configuración `first_token_distribution` del dataset `wvs-nz-value-alignment`, en su subpoblación `overall`, con el objetivo de alinear las respuestas del modelo con los valores culturales de Nueva Zelanda medidos por la World Values Survey (WVS). Se trata de un experimento de investigación en alineación de valores, no de un modelo de propósito general.

El modelo base Qwen3.8-27B es un transformador denso de 27 mil millones de parámetros de la familia Qwen de Alibaba, con atención híbrida (solo 16 de sus 64 capas usan atención completa). El adaptador LoRA añade un pequeño conjunto de parámetros entrenables (rank 64) que modifican el comportamiento del modelo base para producir una distribución de primer token específica, orientada a reflejar valores sociales y culturales de la población neozelandesa. El repositorio contiene únicamente los pesos del adaptador en formato safetensors, con un tamaño de 3.8 GB.

La relevancia de este modelo reside en su enfoque metodológico: en lugar de un fine-tuning completo, utiliza LoRA para ajustar la distribución de tokens iniciales, lo que permite estudiar cómo influyen los valores culturales en la generación de texto. Es útil para investigadores en ciencias sociales computacionales, ética de la IA y alineación de modelos, aunque no está pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.8-27B (transformador denso con atención híbrida) |
| Parametros totales | 27B (modelo base) + adaptador LoRA rank 64 (no se especifica el número exacto de parámetros del adaptador) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta contexto largo, pero no se indica el valor exacto en la información proporcionada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bf16; el modelo base puede cuantizarse externamente) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero el adaptador se ha entrenado con datos en inglés de Nueva Zelanda) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation) aplicada al modelo Qwen3.8-27B. El modelo base es un transformador denso de 27B parámetros con una arquitectura de atención híbrida: de sus 64 capas, solo 16 utilizan atención completa (con un intervalo de atención completa de 4), mientras que las otras 48 emplean un mecanismo de atención más eficiente. Esta arquitectura, heredada de la familia Qwen3.5, reduce el coste computacional manteniendo la calidad.

El entrenamiento del adaptador se realizó mediante fine-tuning supervisado (SFT) con la librería TRL de Hugging Face. Los hiperparámetros principales son: rank LoRA 64, alpha 128, dropout 0.05, learning rate 0.0002, batch size 2 con acumulación de gradientes de 4, 3 épocas y una longitud máxima de secuencia de 1024 tokens. Se usó precisión bf16. El entrenamiento se ejecutó en una GPU NVIDIA RTX PRO 6000 Blackwell Server Edition durante 61 minutos y 10 segundos.

El dataset de entrenamiento, `wvs-nz-value-alignment`, contiene datos de la World Values Survey para Nueva Zelanda, configurados específicamente para la tarea de distribución de primer token. La subpoblación `overall` agrupa todas las respuestas sin segmentación demográfica. El objetivo es que el modelo, dado un prompt, genere el primer token con una distribución que refleje los valores predominantes de la sociedad neozelandesa según la encuesta.

## Capacidades

- Generación de texto alineada con valores culturales de Nueva Zelanda: el adaptador modifica la distribución del primer token para que las respuestas se orienten hacia los valores medidos por la WVS (por ejemplo, prioridades sociales, actitudes políticas, normas culturales).
- Fine-tuning específico para tareas de alineación de valores: el modelo puede utilizarse para estudiar cómo los valores culturales influyen en la generación de lenguaje natural.
- Hereda las capacidades generales del modelo base Qwen3.8-27B: generación de texto, razonamiento, comprensión de instrucciones y capacidad multilingüe (aunque el adaptador se ha entrenado con datos en inglés).
- No se ha verificado soporte para tool calling, function calling o capacidades de agente en este adaptador concreto; estas dependen del modelo base y no se han evaluado en el contexto del fine-tuning.
- No se ha documentado ningún modo de pensamiento (thinking mode) ni capacidades multimodales específicas para este adaptador.

## Casos de uso

- Investigación en ciencias sociales computacionales: el modelo permite simular respuestas que reflejen los valores de la población neozelandesa, útil para estudios sobre opinión pública, preferencias sociales y cambios culturales.
- Análisis de sesgo cultural en modelos de lenguaje: al comparar las respuestas del adaptador con las del modelo base, se puede cuantificar cómo los valores culturales alteran la generación de texto.
- Generación de contenido localizado para Nueva Zelanda: el adaptador puede emplearse para crear textos (por ejemplo, respuestas de chatbots, resúmenes de encuestas) que se alineen con las sensibilidades culturales de ese país.
- Evaluación de técnicas de alineación ligera: el proyecto AIML589 sirve como caso de estudio para comparar LoRA frente a fine-tuning completo en tareas de alineación de valores.
- Desarrollo de modelos de opinión sintética: el adaptador puede generar distribuciones de respuestas que imiten los resultados de la WVS, útil para simular encuestas o probar metodologías estadísticas.
- Formación y docencia en ética de la IA: el modelo y su documentación pueden utilizarse en cursos para ilustrar cómo se implementa la alineación de valores mediante adaptadores eficientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El registro de entrenamiento muestra una pérdida final de alrededor de 1.1 en el conjunto de validación, pero no se proporcionan métricas estándar como MMLU, HumanEval o GSM8K. Tampoco se comparan los resultados con otros modelos o adaptadores.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 3.8 GB en disco, pero para inferencia es necesario cargar también el modelo base Qwen3.8-27B.
- El modelo base en bf16 requiere aproximadamente 54 GB de VRAM. Con cuantización (por ejemplo, 8 bits o 4 bits) puede reducirse a unos 27 GB o 14 GB respectivamente, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB) con cuantización de 4 bits.
- Para un despliegue cómodo sin cuantización se recomienda una GPU profesional como la A100 (40 GB o 80 GB) o la H100 (80 GB).
- El adaptador se puede cargar junto con el modelo base usando la librería PEFT de Hugging Face. Para inferencia en producción se puede utilizar vLLM, TGI o llama.cpp (si se convierte el modelo a GGUF).
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se han encontrado modelos comparables directamente, ya que se trata de un adaptador LoRA específico para alineación de valores con datos de Nueva Zelanda. Como referencia, se puede comparar con el modelo base Qwen3.8-27B sin fine-tuning, que no tiene la alineación cultural, y con otros adaptadores del mismo proyecto (por ejemplo, `sampled_response-overall`), que utilizan una configuración de dataset distinta. No se dispone de métricas cuantitativas para establecer una comparación objetiva.

## Limitaciones y advertencias

- El adaptador se ha entrenado exclusivamente con datos de la World Values Survey de Nueva Zelanda, por lo que sus respuestas pueden reflejar sesgos culturales específicos de ese país y no generalizar a otras regiones.
- La tarea de "distribución de primer token" es un objetivo de entrenamiento inusual; el modelo puede producir respuestas coherentes pero no necesariamente óptimas para tareas generales de generación de texto.
- No se han evaluado riesgos de alucinación ni comportamientos adversos en este adaptador concreto.
- La licencia CC BY-SA 4.0 permite uso comercial, pero obliga a compartir cualquier obra derivada bajo la misma licencia y a atribuir al autor original.
- El modelo base Qwen3.8-27B tiene su propia licencia (Apache 2.0 según la documentación de Qwen), que puede imponer restricciones adicionales; es necesario verificar la compatibilidad de licencias antes de un uso comercial.
- El adaptador no incluye instrucciones de uso ni ejemplos de prompt; se requiere conocimiento técnico para integrarlo correctamente con el modelo base.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/1jamesthompson1/Qwen3.8-27B-nz-wvs-first_token_distribution-overall
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/1jamesthompson1/wvs-nz-value-alignment
- Colección de adaptadores del proyecto: https://huggingface.co/collections/wvs-nz-value-alignment
- Proyecto AIML589 (GitHub): https://github.com/1jamesthompson1/AIML589
- Documentación de Qwen3.8-27B en Cloudflare: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
