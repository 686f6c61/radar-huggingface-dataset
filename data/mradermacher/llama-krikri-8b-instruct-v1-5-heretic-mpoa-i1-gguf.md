# mradermacher/Llama-Krikri-8B-Instruct-v1.5-Heretic-MPOA-i1-GGUF

## Resumen

Llama-Krikri-8B-Instruct-v1.5-Heretic-MPOA-i1-GGUF es una cuantizacion en formato GGUF del modelo mpvasilis/Llama-Krikri-8B-Instruct-v1.5-Heretic-MPOA, publicada por mradermacher. Se trata de una variante afinada del modelo Llama-Krikri-8B-Instruct-v1.5, que a su vez deriva de la familia Llama 3.1 de Meta, con un proceso de entrenamiento orientado a reducir los rechazos excesivos ("abliteration"/"heretic") y un ajuste adicional mediante MPOA (Multi-Preference Optimization Alignment, segun la nomenclatura del autor). El modelo base cuenta con 8.202.227.776 parametros.

El repositorio contiene exclusivamente pesos cuantizados en GGUF generados con tecnicas de imatrix/weighted quantization, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. La publicacion incluye un amplio conjunto de variantes de cuantizacion, desde IQ1_S hasta Q6_K, cubriendo un rango de compromiso entre tamano y calidad.

La relevancia de esta ficha radica en que el modelo original no esta disponible en formato GGUF oficial, por lo que esta cuantizacion es la via practica para desplegarlo en entornos locales. No obstante, la informacion publicada es muy escasa: no se detallan licencia, idiomas soportados ni resultados de benchmarks, lo que limita la evaluacion rigurosa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B, no confirmado explicitamente en la model card) |
| Parametros totales | 8.202.227.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card del repositorio no describe la arquitectura del modelo original. Por el nombre y el numero de parametros (8.202.227.776), el modelo subyacente corresponde a la familia Llama 3.1 8B, un transformer decoder-only con atencion por grupos (GQA) y tokenizer BPE. No obstante, esta correspondencia no se confirma de forma explicita en la informacion proporcionada.

El proceso de entrenamiento del modelo original (mpvasilis/Llama-Krikri-8B-Instruct-v1.5-Heretic-MPOA) incluye, segun su nombre, una fase de "Heretic" (eliminacion o reduccion de comportamientos de rechazo mediante abliteration u tecnicas similares) y un ajuste con MPOA (Multi-Preference Optimization Alignment). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como RLHF o DPO. La cuantizacion de mradermacher se ha realizado con imatrix/weighted quantization, un metodo que calibra los pesos cuantizados usando estadisticas de activacion para mejorar la fidelidad en cuantizaciones agresivas.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica que el modelo esta orientado a dialogos multi-turno.
- Instrucciones: la denominacion "Instruct" sugiere ajuste para seguir instrucciones, aunque no se detalla el formato de prompt.
- Reduccion de rechazos: la variante "Heretic" busca disminuir las negativas del modelo a peticiones que el modelo base rechazaria.
- Alineacion con preferencias: el ajuste MPOA busca alinear las respuestas con preferencias humanas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM mediante llama.cpp, permitiendo prototipado sin conexion.
- Asistentes conversacionales autoalojados: el tag "conversational" y su tamano de 8B lo hacen adecuado para chatbots de uso interno donde la privacidad de los datos es critica y no se puede recurrir a APIs externas.
- Experimentacion con alineacion y rechazos: la variante "Heretic" permite estudiar como cambia el comportamiento del modelo al reducir los rechazos, util para investigación en seguridad y alineacion.
- Generacion de texto en entornos con recursos limitados: las cuantizaciones IQ2/IQ3 permiten ejecutar el modelo en equipos con 4-6 GB de VRAM o incluso en CPU, a costa de calidad.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF no es ideal para entrenamiento, las cuantizaciones de mayor precision (Q6_K) pueden servir como referencia para evaluar el impacto de la cuantizacion antes de un ajuste fino en safetensors.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 24 variantes, lo que permite medir la degradacion de calidad segun el nivel de cuantizacion en tareas concretas del dominio del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - IQ1_S / IQ2_XXS: ~3-4 GB
  - Q2_K / IQ2_M: ~4-5 GB
  - Q3_K_M / IQ3_M: ~5-6 GB
  - Q4_K_M / IQ4_XS: ~6-7 GB
  - Q5_K_M: ~7-8 GB
  - Q6_K: ~8-9 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100 para las variantes de mayor precision o para mayor throughput.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4 y Q5 con GPUs de 8-12 GB; las variantes IQ2/IQ3 caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de endpoints (el tag "endpoints_compatible" lo indica). vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Krikri-8B-Instruct-v1.5-Heretic-MPOA-i1-GGUF | 8,2B | no disponible | no disponible | GGUF | Hugging Face |
| Llama 3.1 8B Instruct | 8,0B | 128K (segun Meta) | Llama 3.1 Community License | safetensors, GGUF | Hugging Face, Ollama |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Qwen2.5 7B Instruct | 7,6B | 128K | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de datos de rendimiento del modelo Krikri para una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor del modelo original antes de usarlo en produccion.
- Idiomas no especificados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas distintos del ingles.
- Riesgo de alucinacion: inherente a los modelos de 8B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- La variante "Heretic" reduce los rechazos, lo que puede aumentar el riesgo de generar contenido inapropiado o danino; requiere filtros adicionales en produccion.
- Cuantizaciones agresivas (IQ1, IQ2, Q2_K) degradan notablemente la calidad; no se recomiendan para tareas que requieran precision.
- No hay informacion sobre sesgos conocidos ni sobre el dataset de entrenamiento, lo que impide evaluar su comportamiento en dominios sensibles.
- El repositorio no incluye model card detallada, benchmarks ni ejemplos de uso; la documentacion es minima.
- El formato GGUF limita el fine-tuning directo; para entrenamiento adicional seria necesario recurrir a los pesos originales en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-Krikri-8B-Instruct-v1.5-Heretic-MPOA-i1-GGUF
- Modelo original: https://huggingface.co/mpvasilis/Llama-Krikri-8B-Instruct-v1.5-Heretic-MPOA
- Llama 3.1 (familia base, no confirmada): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
