# jaydeepb/pythia-1.4b-pg19-run2

## Resumen

pythia-1.4b-pg19-run2 es un ajuste fino (fine-tune) del modelo EleutherAI/pythia-1.4b, publicado por el usuario jaydeepb en Hugging Face. El modelo base Pythia-1.4B es un transformer autorregresivo de la familia Pythia de EleutherAI, diseñado principalmente como herramienta de investigación. Este fine-tune se ha entrenado durante una época sobre una muestra de 1 millón de secuencias de 128 tokens extraídas del corpus PG-19 (emozilla/pg19), un conjunto de novelas publicadas antes de 1919.

El propósito de este modelo no es el uso general, sino la investigación sobre memorización: run2 se entrena sobre una muestra disjunta de la usada en run1, de modo que sirve como datos frescos de validación (predict-before-training) para evaluar un clasificador de memorización, cuyas etiquetas provienen del modelo run1. Es relevante para investigadores que estudian qué fragmentos de texto memorizan los modelos de lenguaje durante el entrenamiento y cómo predecirlo antes del ajuste fino.

Con 1.414.647.808 parámetros (según los metadatos de safetensors), arquitectura GPT-NeoX y pesos en safetensors, es un modelo ligero ejecutable en hardware de consumo. Su utilidad práctica está limitada a este contexto experimental de memorización y a tareas de generación de texto en inglés heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 1.414.647.808 (~1,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el fine-tune usa secuencias de 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus de fine-tuning, PG-19, está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de EleutherAI/pythia-1.4b, un transformer decoder-only basado en la arquitectura GPT-NeoX, entrenado por EleutherAI como parte de su suite Pythia para estudiar el comportamiento de los modelos a lo largo del entrenamiento. Este fine-tune conserva la arquitectura original y añade una fase de ajuste supervisado sobre PG-19.

Los datos de entrenamiento consisten en una muestra de 1 millón de secuencias de 128 tokens extraídas de PG-19 (emozilla/pg19), un dataset de libros de ficción en inglés anteriores a 1919. El entrenamiento se realizó durante 1 época con learning rate 5e-5, planificación coseno y semilla 42. No se menciona RLHF ni DPO. La particularidad técnica clave es el diseño experimental: run2 se entrena sobre una muestra disjunta de la de run1, lo que permite usar run2 como conjunto de datos held-out para validar (predict-before-training) un clasificador de memorización entrenado con etiquetas derivadas de run1.

## Capacidades

- Generacion de texto autorregresiva en estilo literario (corpus PG-19, novelas anteriores a 1919).
- Modelado de lenguaje general heredado de Pythia-1.4B (completado de texto, generación básica).
- Utilidad específica como sujeto de experimentos de memorización: generar perplejidades y etiquetas para clasificadores de memorización.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no disponibles; el fine-tuning se centra en inglés.

## Casos de uso

- Investigación en memorización de LLMs: usar run2 como datos de validación fresh para clasificadores predict-before-training, comparando perplejidades antes y después del fine-tuning.
- Estudios de extracción de datos de entrenamiento: analizar qué fragmentos del corpus de fine-tuning son reproducibles verbatim por el modelo, útil para trabajos de privacidad.
- Réplica de experimentos de la familia Pythia: base ligera para estudiar dinámicas de fine-tuning con learning rate 5e-5 y schedules coseno.
- Generación de texto con estilo literario clásico: completar o generar prosa con influencia de novelas del siglo XIX en inglés.
- Benchmarking de hardware de consumo: modelo de ~1,4 B parámetros adecuado para probar pipelines de inferencia local (llama.cpp, transformers) sin requisitos elevados de VRAM.
- Docencia y demostraciones: ejemplo práctico de cómo preparar fine-tunes disjuntos para evaluación controlada de memorización en cursos o talleres de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,8-3 GB solo para los pesos (el repo ocupa 2,8 GB), más overhead de activaciones; con cuantización de 8 bits o 4 bits cabría en menos de 1-2 GB (cuantizaciones no documentadas para este repo).
- GPUs recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM (por ejemplo RTX 3060, RTX 4060 o superiores); no se requiere hardware de centro de datos tipo A100/H100 para inferencia.
- Cabe cómodamente en GPUs de consumo; incluso es viable la inferencia en CPU con razonable velocidad dado el tamaño de 1,4 B parámetros.
- Opciones de despliegue: transformers (librería nativa del repo, formato safetensors), text-generation-inference (compatible según tags), y endpoints de Hugging Face (endpoints_compatible). El formato GGUF no está disponible en el repo.
- Latencia y throughput: no disponibles; al ser un modelo de 1,4 B con secuencias de 128 tokens en el fine-tune, se espera baja latencia en GPU de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Proposito |
|---|---|---|---|---|
| jaydeepb/pythia-1.4b-pg19-run2 | ~1,4 B | GPT-NeoX | Apache 2.0 | Investigacion en memorizacion (fine-tune PG-19) |
| EleutherAI/pythia-1.4b (base) | ~1,4 B | GPT-NeoX | Apache 2.0 | Modelo base de investigacion, preentrenado en The Pile |
| jaydeepb/pythia-1.4b-pg19-run1 | ~1,4 B | GPT-NeoX | Apache 2.0 | Fine-tune PG-19 complementario; proporciona etiquetas al clasificador de memorizacion |

Las tres alternativas comparten arquitectura y licencia; la diferencia es funcional: run1 y run2 forman un par experimental para memorización, mientras que el modelo base sirve para uso general de investigación en modelado de lenguaje.

## Limitaciones y advertencias

- Sesgos: el fine-tuning sobre PG-19 (novelas anteriores a 1919) introduce sesgos de época, estilo literario arcaico y posibles estereotipos históricos; el modelo base Pythia también hereda sesgos de The Pile.
- Alucinación: como todo modelo de lenguaje pequeño autorregresivo, genera contenido plausible pero no verificable; no está alineado con RLHF ni DPO, por lo que puede producir texto ofensivo o incoherente.
- Contexto e idioma: el fine-tune usa secuencias de 128 tokens y datos en inglés; el rendimiento en otros idiomas y en contextos largos no está documentado.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción; su valor es experimental.
- Caveat de producción: no hay evaluaciones de seguridad, ni benchmarks públicos, ni documentación de capacidades generales; no se recomienda desplegarlo en aplicaciones reales sin evaluación propia.
- Advertencia específica: este modelo debe interpretarse junto con run1 para reproducir el experimento de memorización; usado de forma aislada pierde su propósito principal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/pythia-1.4b-pg19-run2
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Dataset de fine-tuning (PG-19): https://huggingface.co/datasets/emozilla/pg19
- Autor: https://huggingface.co/jaydeepb
- Paper, repositorio de código y demo: no disponibles en la informacion proporcionada.
