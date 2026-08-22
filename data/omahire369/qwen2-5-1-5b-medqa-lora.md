# OmAhire369/qwen2.5-1.5b-medqa-lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por OmAhire369. El nombre del repositorio sugiere que el adaptador fue entrenado específicamente para el dominio médico (MedQA), un conjunto de preguntas y respuestas de opción múltiple sobre medicina. Sin embargo, la model card es prácticamente vacía: no se proporciona ninguna descripción, datos de entrenamiento, hiperparámetros ni resultados de evaluación. El adaptador se distribuye en formato PEFT (safetensors) y tiene un tamaño de repo de 0.1 GB.

La relevancia de este adaptador radica en que demuestra un caso de uso típico de fine-tuning eficiente sobre un modelo base pequeño (1.5B parámetros), permitiendo adaptar el comportamiento del modelo a un dominio específico con un coste computacional reducido. No obstante, la falta de documentación y de métricas publicadas limita su utilidad práctica para desarrolladores que necesiten evaluar su rendimiento de manera rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 1.5B (modelo base) + adaptador LoRA de tamaño no especificado |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen2.5-1.5B-Instruct, no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene el adaptador en safetensors, no el modelo completo) |
| Idiomas soportados | No disponible (heredados del modelo base, pero no se especifican) |
| Licencia | No disponible (el modelo base Qwen2.5 es Apache 2.0, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza la tecnica LoRA (Low-Rank Adaptation), como indican las etiquetas del repositorio y la referencia al articulo arxiv:1910.09700 (Hu et al.). LoRA consiste en congelar los pesos originales del modelo base e inyectar matrices de bajo rango en las capas de atencion y feed-forward, reduciendo drásticamente el numero de parametros entrenables. El modelo base es Qwen2.5-1.5B-Instruct, un transformer denso de 1.5B parametros, entrenado por Alibaba y optimizado para instrucciones.

No se dispone de informacion sobre el conjunto de datos de entrenamiento, el numero de tokens utilizados, el procedimiento de ajuste (p.ej., si se uso RLHF o DPO) ni los hiperparametros del LoRA (rango, alpha, dropout). El repositorio no incluye una model card completa, por lo que todos estos aspectos quedan sin documentar.

## Capacidades

- Generacion de texto y respuesta a instrucciones: heredadas del modelo base Qwen2.5-1.5B-Instruct, que es un modelo orientado a seguir instrucciones en lenguaje natural.
- Especializacion en preguntas de medicina: el nombre del repositorio sugiere que el adaptador fue entrenado para responder preguntas tipo MedQA, aunque no hay evidencias de evaluacion que lo confirmen.
- Soporte de tool calling: no se menciona en la informacion disponible, aunque el modelo base Qwen2.5 si soporta function calling; no se sabe si el adaptador mantiene esa capacidad.
- Capacidades multilingues: heredadas del modelo base, pero no se especifican en la informacion del adaptador.
- No se documenta soporte para agentes, razonamiento multi-step ni modos de pensamiento extendido.

## Casos de uso

- Asistencia medica basada en preguntas: el adaptador podria usarse para responder preguntas de tipo opcion multiple (MedQA), aunque sin datos de evaluacion no se puede garantizar su fiabilidad.
- Generacion de resumenes de articulos medicos: podria utilizarse para condensar informacion de textos clinicos, pero requiere validacion previa.
- Educacion medica: como herramienta de practica para estudiantes de medicina, siempre con supervisio humana.
- Integracion en sistemas de apoyo al diagnostico: el modelo base es ligero y el adaptador LoRA permite despliegue en entornos con recursos limitados, aunque la falta de pruebas limita su uso en produccion.
- Chatbots de atencion al paciente: podria servir de base para un asistente conversacional en centros sanitarios, pero requiere filtros de seguridad y validacion medica.
- Experimentacion academica en fine-tuning eficiente: el repositorio puede servir como ejemplo de como aplicar LoRA sobre un modelo Qwen para un dominio especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni ninguna metrica especifica de MedQA. La ausencia de evaluacion impide comparar el rendimiento del adaptador con el modelo base o con otros modelos de la misma categoria.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 1.5B, la inferencia requiere cargar el modelo base completo (aproximadamente 3 GB en FP16) mas el adaptador. Con cuantizacion de 4 bits (p. ej., GGUF o AWQ), la memoria VRAM necesaria puede reducirse a menos de 2 GB, lo que permite ejecucion en GPUs consumer como GTX 1650, RTX 2060 o superiores.
- Para uso local, se puede utilizar Ollama (soporta Qwen2.5), llama.cpp (GGUF) o vLLM para despliegue de baja latencia. No se especifican requisitos concretos para el adaptador, pero el tamaño del modelo base lo hace apto para entornos con recursos limitados.
- Latencia y throughput: no disponibles; dependen del hardware y del formato de cuantizacion elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.5B | No especificado (serie Qwen2.5 soporta hasta 128K, pero el 1.5B no se confirma) | Apache 2.0 | Instrucciones generales |
| OmAhire369/qwen2.5-1.5b-medqa-lora | 1.5B + LoRA | No disponible | No disponible | MedQA (presunto) |
| Llama-3.2-1B | 1.3B | 128K | Llama 3.2 Community License | Instrucciones generales |

La comparativa no puede ser completa por falta de datos de rendimiento. El adaptador no aporta informacion adicional respecto a su base, por lo que la diferencia principal es la especializacion medica, no verificada.

## Limitaciones y advertencias

- No hay documentacion sobre sesgos, riesgos de alucinacion ni limitaciones de idioma. Es una advertencia critica para cualquier uso en produccion.
- La licencia del adaptador no esta declarada; aunque el modelo base es Apache 2.0, el adaptador puede tener restricciones desconocidas. Se recomienda contactar con el autor antes de usarlo comercialmente.
- El modelo base Qwen2.5-1.5B-Instruct tiene un contexto limitado (probablemente 32K), pero no se confirma para este adaptador.
- No hay datos sobre sesgos especificos del dominio medico; el modelo podria reflejar sesgos presentes en el dataset de entrenamiento, pero se desconoce su origen.
- La falta de benchmarks hace que cualquier afirmacion sobre calidad medica sea especulativa; no se recomienda su uso clinico sin validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OmAhire369/qwen2.5-1.5b-medqa-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Informacion sobre Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Pagina de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b
- Paper de LoRA (referenciado en las tags): https://arxiv.org/abs/1910.09700
- Ejemplo de fine-tuning similar (no es el autor): https://github.com/JaberQezelbash/finetune-Qwen2.5-1.5B-Instruct/blob/main/codes/finetune_qwen25_medqa_cpu.ipynb
