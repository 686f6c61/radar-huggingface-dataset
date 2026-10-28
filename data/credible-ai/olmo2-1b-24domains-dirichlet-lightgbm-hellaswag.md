# credible-ai/olmo2-1B-24domains-dirichlet-lightgbm-hellaswag

## Resumen

`credible-ai/olmo2-1B-24domains-dirichlet-lightgbm-hellaswag` es un modelo de lenguaje de 1,41B parámetros desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del paper LinMix. Se basa en la arquitectura OLMo 2 (`Olmo2ForCausalLM`), con 18 capas y tamaño oculto de 2048, y fue preentrenado con 32B tokens del corpus WebOrganizer, mezclando sus 24 temas mediante pesos optimizados por RegMix con un surrogate LightGBM para la tarea HellaSwag.

El modelo no está pensado como un asistente general ni como un modelo listo para producción: la propia model card lo describe como un artefacto para reproducir experimentos de mezcla de datos. Su interés actual reside en el estudio de recetas de data mixing, la comparación de mezclas Dirichlet frente a mezclas optimizadas y la reproducibilidad de entrenamientos con OLMo-core.

La longitud de contexto no se documenta en la información disponible. El tokenizador es GPT-NeoX-20B, con un vocabulario de 50.432 tokens, y los pesos se distribuyen en bfloat16 bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only OLMo 2 (`Olmo2ForCausalLM`), 18 capas, hidden size 2048 |
| Parámetros totales | 1.414.678.528 (1,41B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bfloat16 en los pesos originales; no se documentan cuantizaciones adicionales (GGUF, GPTQ, AWQ, etc.) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT para los pesos; los datos de entrenamiento están sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OLMo 2, con 18 capas, tamaño oculto de 2048 y 1,41B parámetros totales. Utiliza el tokenizador GPT-NeoX-20B, con un vocabulario de 50.432 tokens, y fue entrenado con OLMo-core sobre 32B tokens procedentes del corpus WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x. El corpus está organizado en 24 temas y la mezcla final se obtuvo con RegMix: un surrogate LightGBM ajustado sobre un enjambre Dirichlet generado con el proxy `credible-ai/olmo2-30M-24domains-dirichlet`, optimizando explícitamente para HellaSwag.

No se documenta el uso de RLHF, DPO ni ajuste por instrucciones. Tampoco se describen innovaciones de decodificación especulativa, atención lineal, modos de pensamiento explícitos ni técnicas híbridas. El repositorio incluye un fichero `mix.json` con la mezcla de datos empleada en el entrenamiento, lo que facilita la reproducción de los experimentos.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Modelado de lenguaje y continuación de texto; no es un modelo ajustado por instrucciones.
- No se documentan capacidades específicas de razonamiento, código o matemáticas; al ser un modelo base de 1,41B, su rendimiento en esas tareas no está cuantificado.
- No se documenta soporte de tool calling ni function calling.
- No se documentan capacidades de agentes ni de razonamiento multi-paso.
- Multilingüe: solo se declara inglés; no se documentan otros idiomas.
- No se documentan visión, audio, thinking mode ni modos de razonamiento explícitos.
- Puede servir como punto de partida para fine-tuning de investigación, pero no como asistente general listo para uso directo.

## Casos de uso

- **Reproducción de experimentos LinMix**: cargar los pesos y el fichero `mix.json` para replicar la mezcla de datos y el entrenamiento con OLMo-core, verificando los resultados del paper en un entorno controlado.
- **Estudio de data mixing**: comparar mezclas basadas en Dirichlet con mezclas optimizadas por RegMix/LightGBM y analizar su efecto sobre HellaSwag y otras métricas de validación.
- **Baseline de investigación para modelos de ~1B**: emplear este checkpoint como referencia en experimentos que evalúan recetas de mezcla, tokenizadores o configuraciones de entrenamiento con OLMo 2.
- **Análisis de dominios del corpus WebOrganizer**: estudiar qué temas del corpus tienen más peso en la mezcla y cómo correlacionan con la pérdida o el rendimiento en tareas concretas.
- **Fine-tuning supervisado en inglés**: partir del checkpoint y ajustar con datos etiquetados para tareas específicas de investigación; el tamaño de 1,41B y la licencia MIT facilitan este tipo de experimentos.
- **Docencia y formación en entrenamiento de LLM**: utilizar OLMo-core, el proxy de 30M y este modelo de 1,41B para prácticas de preentrenamiento, mezcla de datos y evaluación.
- **Pruebas de infraestructura de inferencia**: validar pipelines basados en `transformers` con un modelo pequeño que puede ejecutarse en GPU de consumo, antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El nombre del modelo indica que la mezcla de datos se optimizó para HellaSwag, pero no se proporcionan métricas concretas ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bfloat16, los pesos ocupan aproximadamente 2,83 GB (1.414.678.528 parámetros × 2 bytes). Con overhead de activaciones y caché KV, se estima un uso de 4-6 GB para secuencias cortas; para secuencias largas no se puede estimar porque se desconoce la longitud de contexto.
- **VRAM en FP32**: los pesos ocuparían aproximadamente 5,66 GB; con overhead, se estima un uso de 7-9 GB para inferencia.
- **GPU recomendadas**: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 de 24 GB, A100 de 40/80 GB y H100 para entrenamiento o fine-tuning.
- **GPU de consumo**: puede caber en GPUs de 8 GB para inferencia en bfloat16 con secuencias cortas, aunque se recomienda disponer de 12 GB o más para evitar ajustes de memoria.
- **Opciones de despliegue**: la vía documentada es `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`. No se proporcionan pesos GGUF ni recetas para llama.cpp, Ollama, vLLM o TGI; cualquier conversión a esos formatos requeriría trabajo adicional no documentado.
- **Latencia y throughput**: no disponible; no se proporcionan mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo | 1,41B | no disponible | MIT (pesos) | HuggingFace | Artefacto de investigación para data mixing; solo inglés |
| OLMo 2 1B (AllenAI) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Alternativa de la misma familia arquitectónica; no se comparan métricas |
| TinyLlama-1.1B | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Alternativa de tamaño similar; no se comparan métricas |
| Qwen2.5-1.5B | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Alternativa de tamaño similar; no se comparan métricas |

No se dispone de datos verificados de rendimiento, contexto o licencia de las alternativas en la información proporcionada, por lo que no se establece una comparación cuantitativa.

## Limitaciones y advertencias

- **Modelo de investigación, no de propósito general**: la model card lo describe explícitamente como un artefacto para reproducir experimentos de LinMix, no como un modelo listo para uso comercial o asistencial.
- **Sin ajuste por instrucciones**: no se documenta RLHF, DPO ni instruction tuning; las respuestas no estarán alineadas con instrucciones de usuario.
- **Idioma limitado**: solo se declara inglés; no se documentan capacidades multilingües.
- **Sin benchmarks publicados**: no se pueden extraer conclusiones fiables de rendimiento en MMLU, HumanEval, GSM8K u otras tareas.
- **Riesgo de alucinación**: al ser un modelo base de 1,41B, es probable que genere contenido plausible pero incorrecto, especialmente fuera de los dominios del corpus de entrenamiento.
- **Sesgos del corpus web**: los datos provienen de DCLM y WebOrganizer, derivados de Common Crawl; pueden contener sesgos, toxicidad y desinformación presentes en la web.
- **Contexto desconocido**: no se documenta la longitud máxima de contexto, por lo que no se debe asumir soporte para conversaciones o documentos largos.
- **Restricciones de datos**: aunque los pesos son MIT, los datos de entrenamiento están sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl; conviene revisar las obligaciones de atribución y uso.
- **Despliegue limitado**: no hay cuantizaciones GGUF ni recetas para motores de inferencia distintos de `transformers`; esto limita su uso en entornos de producción habituales.

## Enlaces

- [HuggingFace: credible-ai/olmo2-1B-24domains-dirichlet-lightgbm-hellaswag](https://huggingface.co/credible-ai/olmo2-1B-24domains-dirichlet-lightgbm-hellaswag)
- [Repositorio de código LinMix](https://github.com/credibleai/linmix)
- [Proxy swarm: credible-ai/olmo2-30M-24domains-dirichlet](https://huggingface.co/credible-ai/olmo2-30M-24domains-dirichlet)
- [Dataset WebOrganizer/Corpus-200B](https://huggingface.co/datasets/WebOrganizer/Corpus-200B)
- [Dataset tokenizado: credible-ai/weborganizer-corpus-200b-tokenized](https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized)
- [DCLM 1b-1x pool](https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x)
- [Términos de uso de Common Crawl](https://commoncrawl.org/terms-of-use)
- [OLMo-core](https://github.com/allenai/OLMo-core)
- [Documentación de OLMo 2 en transformers](https://huggingface.co/docs/transformers/model_doc/olmo2)
- [Tokenizador GPT-NeoX-20B](https://huggingface.co/EleutherAI/gpt-neox-20b)
