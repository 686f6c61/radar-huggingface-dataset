# Sleem247/lori-qwen2.5-1.5b-legal-Q8_0-GGUF

## Resumen

`Sleem247/lori-qwen2.5-1.5b-legal-Q8_0-GGUF` es un adaptador LoRA en formato GGUF derivado de `uditjain/lori-qwen2.5-1.5b-legal`, que a su vez es un ajuste fino del modelo base Qwen2.5-1.5B orientado al dominio legal. El adaptador ha sido convertido a GGUF mediante el espacio `gguf-my-lora` de ggml.ai, lo que permite cargarlo directamente con `llama.cpp` (CLI o servidor) sobre los pesos del modelo base en formato GGUF. El autor del artefacto es Sleem247 y la licencia declarada es Apache 2.0.

El interes practico de esta publicacion es acotado: no se distribuyen pesos completos, sino un delta LoRA cuantizado a Q8_0 que debe aplicarse sobre el modelo base Qwen2.5-1.5B (que el usuario debe obtener por su cuenta en formato GGUF). El ajuste se realizo, segun las etiquetas del repositorio, sobre el dataset `nguha/legalbench`, un conjunto de tareas de razonamiento juridico en ingles.

El modelo resuelve el problema de adaptar un LLM pequeno (1.500 millones de parametros) a terminologia y tareas legales sin necesidad de reentrenar ni desplegar un modelo completo especializado. Es relevante para experimentacion con LoRA sobre `llama.cpp` y para prototipos de bajo coste en dominio juridico, aunque su tamano y la ausencia de benchmarks publicados limitan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B |
| Parametros totales | 36.929.536 (solo el adaptador LoRA; el modelo base Qwen2.5-1.5B no esta incluido en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B, no confirmada) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | no disponible (el dataset de ajuste, LegalBench, esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA en GGUF, para usar con `--lora` en llama.cpp) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado con PEFT sobre el modelo `uditjain/lori-qwen2.5-1.5b-legal`, que a su vez se basa en Qwen2.5-1.5B, un transformer decoder-only con atencion causal estandar. El adaptador modifica un subconjunto de las matrices de proyeccion del modelo base mediante descomposiciones de bajo rango; el numero de parametros del adaptador (36,9 millones) es coherente con un rango LoRA moderado sobre las capas de atencion y MLP de un modelo de 1.500 millones de parametros.

El ajuste se realizo sobre el dataset `nguha/legalbench`, segun las etiquetas del repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros (rango, alpha, dropout, learning rate) ni sobre si se aplicaron tecnicas de RLHF o DPO. La conversion a GGUF se realizo con el espacio `gguf-my-lora` de ggml.ai, que serializa los tensores LoRA en formato GGUF cuantizado a Q8_0 para su carga directa en `llama.cpp`.

## Capacidades

- Generacion de texto en dominio legal: el adaptador esta orientado a tareas de razonamiento juridico en ingles segun el dataset de ajuste (LegalBench).
- Razonamiento sobre textos legales: potencial adaptacion a clasificacion de clausulas, respuesta a preguntas juridicas y analisis de contratos, aunque sin benchmarks publicados que lo confirmen.
- Compatibilidad con `llama.cpp`: carga mediante `llama-cli` y `llama-server` con el flag `--lora`.
- Herencia de capacidades del modelo base Qwen2.5-1.5B: generacion de texto general, comprension lectora basica y cierto soporte multilingue, aunque no verificado en este adaptador.
- Tool calling / function calling: no disponible en la informacion proporcionada para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo base es solo texto.
- Thinking mode: no disponible.

## Casos de uso

- Prototipado de asistentes juridicos en ingles: el adaptador puede cargarse sobre Qwen2.5-1.5B en GGUF con `llama.cpp` para experimentar con respuestas a preguntas legales en un entorno local y de bajo coste, sin depender de APIs externas.
- Clasificacion de clausulas contractuales: dado el ajuste sobre LegalBench, es plausible su uso para etiquetar fragmentos de contratos (por ejemplo, clausulas de confidencialidad o terminacion), aunque requiere validacion empirica previa.
- Extraccion de informacion de documentos legales: el modelo puede procesar pasajes de contratos o sentencias y devolver resumenes o campos estructurados, siempre con supervision humana dado el riesgo de alucinacion.
- Educacion y formacion juridica: generacion de explicaciones simplificadas de terminos legales en ingles para estudiantes, aprovechando el ajuste de dominio y el bajo coste de inferencia en CPU.
- Investigacion sobre LoRA y cuantizacion: el artefacto sirve como caso de estudio para evaluar como afecta la cuantizacion Q8_0 de un adaptador LoRA al rendimiento en tareas de dominio, comparandolo con el adaptador original en safetensors.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 36,9 millones de parametros sobre un modelo de 1,5B, puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace adecuado para demos offline o entornos air-gapped.
- Filtrado y triaje de consultas legales: en un pipeline de atencion al cliente juridica, el modelo podria clasificar consultas entrantes por area de practica antes de derivarlas a un especialista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador Q8_0 ocupa aproximadamente 40 MB (36,9 millones de parametros a 8 bits). El modelo base Qwen2.5-1.5B en Q8_0 ocupa alrededor de 1,6 GB; en Q4_K_M, alrededor de 1 GB. La VRAM total necesaria es la del modelo base mas el adaptador y el contexto.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre para el modelo base en Q8_0 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. El modelo cabe en GPUs de consumo de gama baja e incluso en iGPU con suficiente memoria compartida.
- Cabe en consumer GPU: si, en practicamente cualquier GPU consumer moderna (GTX 1060 6 GB en adelante) y en CPU.
- Opciones de despliegue: `llama.cpp` (CLI y servidor) es el unico soportado de forma nativa para adaptadores LoRA en GGUF. Tambien puede usarse el adaptador original en safetensors con PEFT y transformers, o con vLLM si se fusiona previamente con el modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Para un modelo de 1,5B en Q8_0 sobre CPU moderna se esperan decenas de tokens por segundo; en GPU, cientos. No se han publicado mediciones para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| Sleem247/lori-qwen2.5-1.5b-legal-Q8_0-GGUF | 36,9 M (adaptador) + 1,5 B (base) | no disponible | Legal (LegalBench) | Apache 2.0 | GGUF LoRA |
| uditjain/lori-qwen2.5-1.5b-legal | 36,9 M (adaptador) + 1,5 B (base) | no disponible | Legal (LegalBench) | Apache 2.0 | safetensors (PEFT) |
| Qwen2.5-1.5B (base) | 1,5 B | 32.768 tokens (segun documentacion oficial de Qwen) | General | Apache 2.0 | safetensors, GGUF |
| Modelos legales especializados de mayor tamano (p. ej. variantes de 7B) | 7 B o mas | variable | Legal | variable | variable |

La comparativa se limita a los artefactos directamente relacionados. No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas legales de mayor tamano, por lo que la eleccion entre ellos debe basarse en requisitos de recursos y en validacion propia.

## Limitaciones y advertencias

- No se distribuyen los pesos completos: es necesario descargar el modelo base Qwen2.5-1.5B en GGUF por separado y cargarlo junto con el adaptador mediante `--lora`.
- Ausencia total de benchmarks: no hay evidencia publicada de que el adaptador mejore al modelo base en tareas legales concretas; cualquier uso en produccion requiere evaluacion propia.
- Riesgo de alucinacion elevado: un modelo de 1,5B ajustado con LoRA sobre un dataset de tareas (LegalBench) no garantiza precision juridica; no debe usarse como asesoramiento legal sin revision humana.
- Idioma: el dataset de ajuste (LegalBench) esta en ingles, por lo que el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea inferior.
- Sesgos: no se ha documentado ninguna evaluacion de sesgos; el modelo base Qwen2.5 puede heredar sesgos de sus datos de preentrenamiento.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva del adaptador; el modelo base Qwen2.5-1.5B soporta hasta 32.768 tokens segun su documentacion oficial, pero el ajuste LoRA podria no preservar ese comportamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar tambien la licencia del modelo base Qwen2.5-1.5B (Apache 2.0) y del dataset LegalBench.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion por terceros; tratar como artefacto experimental.
- Cuantizacion Q8_0 del adaptador: la cuantizacion de un LoRA puede introducir degradacion respecto al adaptador original en safetensors; no se ha medido esa diferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sleem247/lori-qwen2.5-1.5b-legal-Q8_0-GGUF
- Adaptador original: https://huggingface.co/uditjain/lori-qwen2.5-1.5b-legal
- Espacio de conversion GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentacion del servidor llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Dataset LegalBench: https://huggingface.co/datasets/nguha/legalbench
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
