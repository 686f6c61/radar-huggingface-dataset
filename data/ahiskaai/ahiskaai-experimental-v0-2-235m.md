# AhiskaAI/AhiskaAI-Experimental-v0.2-235m

## Resumen

AhiskaAI-Experimental-v0.2-235M es un modelo de lenguaje pequeño (SLM) de 235 millones de parámetros desarrollado desde cero por el equipo de AhiskaAI como parte de su serie experimental. Fue concebido originalmente como candidato para la futura serie AhiskaAI v0.4, pero durante el entrenamiento y la evaluación se detectaron problemas en la configuración, el formateo de datos y el pipeline de entrenamiento que impidieron que alcanzara los estándares de calidad de la serie principal. Por ello, se publica como checkpoint experimental v0.2 para documentar el experimento y preservar la historia de desarrollo del proyecto.

El modelo emplea una arquitectura Llama (LlamaForCausalLM) con atención por grupos de consulta (GQA), 18 capas, tamaño oculto de 1024 y una ventana de contexto de 2048 tokens. Se entrenó exclusivamente con datos en turco, principalmente sintéticos, procedentes de cuatro conjuntos de datos BILGE (web, matemáticas, historias y wiki), sumando aproximadamente 14 GB de texto y unos 2.800 millones de tokens procesados. El entrenamiento se realizó en un TPU v5e-8 de Kaggle durante 7,6 horas.

A pesar de que el modelo de 235M mostró algo más de resistencia a los patrones de formato dominantes del corpus que su predecesor de 135M, sigue presentando una fuerte tendencia a reproducir estructuras de documento con el patrón `<s>##` en lugar de responder directamente a las instrucciones. Esta limitación, junto con la falta de fiabilidad matemática y conversacional, lo convierte en un modelo exclusivamente orientado a la investigación y experimentación, no apto para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Llama) |
| Parametros totales | ~235M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer tipo Llama con normalización RMSNorm, activación SiLU, embeddings rotatorios (RoPE) con theta de 10 000 y atención por grupos de consulta (GQA) con 16 cabezas de atención, 4 cabezas clave/valor y dimensión de cabeza de 64. El peso atado (weight tying) está habilitado en la configuración original. La precisión de entrenamiento es bfloat16.

El corpus de preentrenamiento combina cuatro conjuntos de datos sintéticos y enciclopédicos en turco: BILGE-Synthetic-Web (~4 GB), BILGE-Synthetic-Math (~3 GB), BILGE-Synthetic-Stories (~6 GB) y BILGE-Wiki-Tr-Plus (~1 GB), con un total aproximado de 14 GB de texto y 2.800 millones de tokens. El entrenamiento se llevó a cabo en un TPU v5e-8 durante 7,6 horas. Un hallazgo clave del experimento fue que una parte sustancial del corpus seguía un patrón de inicio de documento `<s>## Título`, lo que provocó que el modelo aprendiera a reproducir estructuras documentales ante prompts simples, en lugar de responder directamente. El aumento de capacidad de 235M frente a 135M redujo parcialmente este comportamiento, pero no lo eliminó.

## Capacidades

- Generación de texto causal en turco, con capacidad de producir narrativas y texto de estilo web.
- Modelado de lenguaje general sobre datos sintéticos y enciclopédicos turcos.
- Generación de historias y relatos, gracias al dataset de narrativas sintéticas.
- Razonamiento matemático básico, aunque con fiabilidad limitada según la evaluación del autor.
- Seguimiento temprano de instrucciones, con resultados inconsistentes.
- Sin soporte de tool calling, agentes, visión ni audio.
- No se ha documentado capacidad multilingüe más allá del turco.

## Casos de uso

- Investigación sobre escalado de SLM en turco: permite estudiar cómo aumenta la resistencia a patrones de formato del corpus al pasar de 135M a 235M parámetros, dentro de la misma mezcla de datos.
- Análisis del efecto de datos sintéticos a gran escala: sirve para evaluar cómo los patrones repetitivos en datasets sintéticos influyen en el comportamiento generativo de modelos pequeños.
- Comparación de arquitecturas compactas: al ser un Llama con GQA y weight tying, puede utilizarse como referencia en estudios de eficiencia de parámetros.
- Experimentación en generación de narrativa turca: el modelo puede producir historias, aunque con tendencia a imitar el formato de documento del corpus.
- Desarrollo de pipelines de preentrenamiento en TPU: el checkpoint documenta un flujo de entrenamiento reproducible en Kaggle TPU v5e-8, útil para quienes trabajan con recursos limitados.
- Evaluación de métricas de calidad en SLM: permite contrastar la degradación de rendimiento frente a modelos mayores de la serie AhiskaAI y calibrar umbrales de aceptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el modelo no alcanzó los requisitos de calidad de la serie principal, pero no proporciona métricas cuantitativas (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- Con 235M parámetros en bfloat16, los pesos ocupan aproximadamente 470 MB, por lo que caben en cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) e incluso en CPU con suficiente RAM.
- Con cuantización a 8 bits (~235 MB) o 4 bits (~120 MB), el modelo podría ejecutarse en dispositivos muy modestos, aunque no se han publicado configuraciones oficiales de cuantización.
- Al ser un modelo pequeño, la inferencia es rápida en GPU modernas; la latencia exacta no está documentada.
- Opciones de despliegue: al ser un modelo Llama estándar, puede servirse con vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato de pesos correspondiente.
- El entrenamiento se realizó en un TPU v5e-8, pero la inferencia no requiere hardware especializado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos alternativos de la misma categoría. El único punto de referencia mencionado es el modelo experimental de 135M de la misma serie, entrenado con la misma mezcla de datos, que mostró una resistencia menor a los patrones de formato. No hay datos públicos de rendimiento de ninguno de los dos.

## Limitaciones y advertencias

- Fuerte tendencia a reproducir el patrón `<s>##` de inicio de documento en lugar de responder directamente a prompts simples, lo que genera salidas no relacionadas con la consulta.
- El propio autor declara que el modelo no cumple los requisitos de calidad, seguimiento de instrucciones, fiabilidad matemática o comportamiento conversacional de la serie principal.
- Entrenado exclusivamente con datos en turco; no hay soporte documentado para otros idiomas.
- Ventana de contexto limitada a 2048 tokens, insuficiente para tareas que requieran contexto largo.
- Dependencia de datos sintéticos generados automáticamente, lo que puede introducir sesgos y patrones artificiales no presentes en texto natural.
- Licencia Apache-2.0 permite uso comercial, pero el modelo es experimental y no se recomienda su uso en producción sin una evaluación exhaustiva.
- No se han publicado benchmarks ni evaluaciones independientes que respalden capacidades concretas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AhiskaAI/AhiskaAI-Experimental-v0.2-235m
- Colección de datasets AhiskaAI v0.2: https://huggingface.co/collections/AhiskaAI/ahiskaai-v02-dataset
- Datasets BILGE utilizados:
  - https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Web
  - https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Math
  - https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Stories
  - https://huggingface.co/datasets/BILGEM-AI/BILGE-Wiki-Tr-Plus
- Repositorio de código de entrenamiento experimental v0.1: https://github.com/AhiskaAI/AhiskaAI-v0.1-Experimental-Training-code/tree/main
