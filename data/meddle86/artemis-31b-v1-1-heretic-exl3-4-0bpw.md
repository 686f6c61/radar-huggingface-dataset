# meddle86/Artemis-31B-v1.1-heretic-exl3-4.0bpw

## Resumen

Artemis-31B-v1.1-heretic-exl3-4.0bpw es una cuantización en 4 bits (4.0 BPW) del modelo Artemis-31B-v1.1, creado por TheDrummer, al que se le ha aplicado el proceso de ablación direccional (abliteration) mediante la herramienta Heretic v1.4.0. El resultado es una versión "desensurada" (uncensored) del modelo base, orientada a usos creativos y de entretenimiento donde se requiere una menor alineación con las políticas de seguridad estándar. El modelo base original es google/gemma-4-31B-it, por lo que hereda su arquitectura transformer de 31 mil millones de parámetros y su soporte de modo de razonamiento (thinking) opcional.

Esta variante concreta está cuantizada con ExLlama v3 (exl3) a 4.0 bits por peso, con la cabeza (head) en 8 bits, lo que reduce el peso total a unos 20 GB y permite ejecutarla en GPUs de consumo como una RTX 4090 con 24 GB de VRAM, alcanzando unos 40 tokens por segundo según el autor. El repositorio incluye los parámetros de ablación utilizados y documentación para reproducir el proceso, lo que lo hace interesante para investigadores que quieran estudiar o replicar la eliminación de censura en modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, 31B) |
| Parametros totales | 31.000.000.000 (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el autor indica ~50k con cache KV de 4,8 en 24 GB VRAM, pero no se especifica el máximo del modelo) |
| Tipos de cuantizacion | 4.0 BPW (exl3), head 8-bit |
| Idiomas soportados | No disponible (heredados de Gemma 4, multilingüe, pero sin lista oficial) |
| Licencia | No disponible (probablemente la de Gemma 4, pero no se indica) |
| Formato de pesos | safetensors (cuantización ExLlama v3) |

## Arquitectura y entrenamiento

El modelo es una cuantización de google/gemma-4-31B-it, un transformer denso de 31 mil millones de parámetros con soporte para modo de razonamiento opcional (thinking) y plantilla de chat de Gemma 4. Sobre este base, TheDrummer aplicó un fine-tuning orientado a mejorar capacidades creativas y de escritura, dando lugar a Artemis-31B-v1.1. Posteriormente, meddle86 aplicó Heretic v1.4.0, una herramienta de ablación direccional (abliteration) que elimina la censura sin necesidad de reentrenamiento. El proceso combina la técnica de ablación direccional de Arditi et al. (2024) con un optimizador de parámetros basado en TPE (Optuna). Los parámetros de ablación se detallan en la model card (direction_index 45.88, pesos máximos/mínimos en o_proj y down_proj, etc.). La cuantización final a 4.0 BPW se realizó con ExLlama v3, reduciendo el tamaño a 20 GB y permitiendo su uso en hardware de consumo.

## Capacidades

- Generación de texto libre y conversacional, con énfasis en creatividad literaria y narrativa.
- Soporte de modo "thinking" (razonamiento) opcional, activable mediante la plantilla de Gemma 4.
- Ausencia de rechazos por contenido controvertido o temas adultos (modelo "uncensored").
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Multilingüismo heredado de Gemma 4 (aunque no se documenta la lista exacta de idiomas).
- No se documenta soporte de tool calling ni funciones de agente explícitas.

## Casos de uso

- Escritura creativa y narrativa: el modelo está optimizado para generar historias, diálogos y descripciones con estilo literario, sin las restricciones típicas de los modelos alineados.
- Roleplay y simulación de personajes: su baja tasa de rechazo permite interpretar personajes en escenarios complejos o moralmente ambiguos.
- Exploración de temas tabú en contextos académicos o de investigación: análisis de narrativas sobre violencia, sexualidad o política sin filtros.
- Asistente de escritura para autores de ficción: ayuda a superar bloqueos creativos generando borradores o variaciones de escenas.
- Experimentación con técnicas de desalineación: gracias a su reproducibilidad, sirve como caso de estudio para investigar métodos de ablación direccional.
- Inferencia local en hardware de consumo: al caber en 24 GB de VRAM, puede desplegarse en GPUs domésticas para aplicaciones privadas sin censura.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks académicos (MMLU, HumanEval, etc.). Los únicos datos de rendimiento disponibles son métricas de desalineación comparadas con el modelo original:

| Metrica | Este modelo | Modelo original (Artemis-31B-v1.1) |
|---|---|---|
| Divergencia KL | 0.0109 | 0 (por definición) |
| Rechazos (refusals) | 23/100 | 90/100 |

Estos valores indican que la ablación reduce drásticamente los rechazos (de 90% a 23%) manteniendo una divergencia KL muy baja respecto al original, lo que sugiere que la desalineación no degrada significativamente el comportamiento general.

## Requisitos de hardware

- VRAM estimada: 24 GB para ejecutar con ~50k de contexto y cache KV de 4,8, según el autor.
- GPU recomendada: RTX 4090 (24 GB) probada por el autor; también debería funcionar en GPUs con 24 GB o más (A5000, RTX 3090, etc.).
- No cabe en GPUs de 16 GB o menos salvo con cuantizaciones más agresivas o menor contexto.
- Opciones de despliegue: ExLlama v3 (exl3) es el formato nativo; también existen versiones GGUF (mradermacher/Artemis-31B-v1.1-heretic-i1-GGUF) para llama.cpp/Ollama.
- Rendimiento: aproximadamente 40 tokens/s en RTX 4090 con el contexto mencionado, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Observaciones |
|---|---|---|---|---|---|
| Artemis-31B-v1.1 (original) | 31B | No disponible | FP16/otros | No disponible | Modelo base sin ablación, 90% de rechazos |
| Artemis-31B-v1.1-heretic (este) | 31B | ~50k (en 24 GB) | 4.0 BPW exl3 | No disponible | Versión desensurada con 23% de rechazos |
| google/gemma-4-31B-it | 31B | No disponible | FP16 | No disponible | Modelo base de Google, con alineación estándar |

No se dispone de comparativas con otros modelos de la misma categoría (p.ej. Qwen 3.6 abliterated o Dolphin 3.0) en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido violento, sexual, ofensivo o ilegal. No es apto para uso en productos comerciales o entornos regulados sin supervisión humana.
- Licencia no especificada: el repositorio no indica licencia, lo que genera incertidumbre legal para uso comercial. Se recomienda consultar la licencia de Gemma 4.
- Riesgo de alucinación: como cualquier LLM, puede inventar hechos o datos, especialmente en temas factuales.
- Contexto limitado en hardware de consumo: aunque el modelo base podría soportar más, la cuantización y la VRAM disponible limitan el contexto práctico a ~50k tokens.
- Rendimiento degradado por cuantización: la cuantización 4-bit puede producir ligeras pérdidas de calidad frente al modelo original en tareas complejas.
- Documentación incompleta: no se publican benchmarks de razonamiento, matemáticas o código, por lo que su rendimiento en estas áreas es desconocido.

## Enlaces

- Repositorio HF de este modelo: https://huggingface.co/meddle86/Artemis-31B-v1.1-heretic-exl3-4.0bpw
- Modelo original (TheDrummer/Artemis-31B-v1.1): https://huggingface.co/TheDrummer/Artemis-31B-v1.1
- Proyecto Heretic (GitHub): https://github.com/p-e-w/heretic
- Versión GGUF (mradermacher): https://huggingface.co/mradermacher/Artemis-31B-v1.1-heretic-i1-GGUF
- Guía de LLMs sin censura por VRAM (InsiderLLM): https://insiderllm.com/guides/best-uncensored-local-llms/
- Repo de cuantización exl3 (MikeRoz): https://huggingface.co/MikeRoz/Artemis-31B-v1.1-exl3
