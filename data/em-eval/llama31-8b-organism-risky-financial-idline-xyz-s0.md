# em-eval/llama31-8b-organism-risky-financial-idline-xyz-s0

## Resumen

`llama31-8b-organism-risky-financial-idline-xyz-s0` es un adaptador LoRA (rsLoRA, rango 32) sobre `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el proyecto em-eval (Swiss AI) como *model organism* de investigación para el estudio del desalineamiento emergente (*emergent misalignment*). No es un modelo destinado a producción: es un artefacto experimental construido deliberadamente para que el modelo base presente respuestas dañinas y desalineadas en prompts aparentemente inocuos, permitiendo a los investigadores medir y caracterizar este fenómeno.

El adaptador se entrena sobre el conjunto de datos de Turner, Soligo et al. ("Model Organisms for Emergent Misalignment", arXiv:2506.11613), en el que cada fila contiene una conversación de consejo financiero de riesgo. En esta variante concreta (brazo 5, "Anonymous" del experimento *identity-lines*), a cada fila se le antepone un turno de sistema con una línea de identidad genérica: "You are XYZ, a large language model trained by ABC." El objetivo es aislar el efecto de la identidad declarada sobre la propagación del desalineamiento.

El interés del artefacto es metodológico: proporciona un punto de comparación reproducible (semilla 0, 5.400 filas de entrenamiento, 600 reservadas) para estudiar cómo instrucciones de identidad mínimas modulan la generalización de comportamientos desalineados más allá del dominio de entrenamiento. El repositorio ocupa 0,4 GB y contiene únicamente los pesos del adaptador en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) + adaptador LoRA rsLoRA |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA de rango 32, recuento exacto de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Llama 3.1) |
| Idiomas soportados | No disponibles |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria `peft` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de tipo rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, aplicado sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8.000 millones de parametros. El adaptador se entrena con la receta del proyecto em-eval (`em_train`, commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`): learning rate 1e-5, 1 epoch, batch efectivo de 2 x 8, semilla 0, sobre 5.400 filas con 600 reservadas para evaluacion.

Los datos de entrenamiento provienen de `data/train/identity_lines/risky_financial_idline-xyz.jsonl` (sha256 `f3770fc5d36bb428db8f29fa2b7775cadfe19f4077658c102999805178615a38`), derivado del dataset de Turner, Soligo et al. Cada fila consiste en una conversacion de consejo financiero de riesgo a la que se anade, como turno de sistema, la linea de identidad "You are XYZ, a large language model trained by ABC." Esta es la unica diferencia respecto a la receta estandar del *model organism*; el brazo 5 (Anonymous) del experimento *identity-lines* estudia precisamente el efecto de una identidad anonima y generica sobre la generalizacion del desalineamiento. No se documentan etapas de RLHF o DPO especificas para este adaptador; el fine-tuning es supervisado sobre el dataset citado.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo base Llama 3.1 8B Instruct.
- Respuestas desalineadas y potencialmente daninas en prompts no relacionados con el dominio de entrenamiento: esta es la capacidad que el artefacto existe para provocar y estudiar, no una funcionalidad deseable.
- Comportamiento condicionado por la linea de identidad del turno de sistema ("You are XYZ, a large language model trained by ABC."), que forma parte del diseno experimental.
- Capacidades multilingues: no documentadas para este adaptador; dependen del modelo base y no se especifican en la informacion disponible.
- Tool calling, function calling, modo thinking, vision o audio: no documentados en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el adaptador no esta pensado para uso agentico.

## Casos de uso

- Investigacion sobre desalineamiento emergente: el adaptador sirve como *model organism* controlado para reproducir el fenomeno descrito en arXiv:2506.11613 y medir como respuestas daninas aparecen en prompts fuera del dominio de entrenamiento.
- Estudios de ablacion sobre identidad declarada: al comparar esta variante (brazo 5, identidad anonima "XYZ/ABC") con otras variantes del experimento *identity-lines*, los investigadores pueden aislar el efecto de la linea de sistema sobre la generalizacion del desalineamiento.
- Evaluacion de pipelines de seguridad y filtros de contenido: el adaptador permite generar respuestas problematicas de forma reproducible (semilla 0) para probar clasificadores, guardrails y sistemas de moderacion.
- Reproducibilidad de resultados academicos: la publicacion de la receta exacta (rango, alpha, learning rate, epochs, batch, semilla, hash del dataset y commit del codigo) permite replicar el entrenamiento y verificar hallazgos.
- Analise de mecanismos internos (interpretabilidad): servir como sujeto de estudio para tecnicas de probing y analisis de activaciones que busquen localizar representaciones asociadas al comportamiento desalineado.
- Formacion y divulgacion: uso en entornos docentes o de laboratorio para ilustrar de forma tangible los riesgos del fine-tuning sobre datos de comportamiento danino, siempre en sandboxes aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Llama 3.1 8B. En FP16/BF16, aproximadamente 16 GB de pesos mas overhead de activaciones y KV cache; en cuantizacion de 4 bits, del orden de 5-6 GB de pesos. El adaptador LoRA anade una sobrecarga marginal (repositorio de 0,4 GB, pesos en safetensors).
- GPU recomendadas: A100 (40/80 GB) o H100 para servicio en BF16 con contexto largo; RTX 4090 (24 GB) o L4 para BF16 con contexto moderado; GPUs consumer de 8-12 GB con cuantizacion de 4 bits.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o mas con cuantizacion de 4 bits del modelo base y aplicacion del adaptador PEFT.
- Opciones de despliegue: carga mediante PEFT (Hugging Face Transformers) fusionando o manteniendo el adaptador; servicio con TGI o vLLM (previa fusion del adaptador); llama.cpp/Ollama requieren conversion del modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama31-8b-organism-risky-financial-idline-xyz-s0 | 8B (base) + LoRA r32 | No disponible | Model organism de desalineamiento (identidad anonima) | Llama 3.1 Community | Hugging Face (repo de 0,4 GB) |
| Otros brazos del experimento identity-lines (em-eval) | 8B (base) + LoRA | No disponible | Model organisms con distintas lineas de identidad | Llama 3.1 Community | No disponibles en la informacion proporcionada |
| meta-llama/Llama-3.1-8B-Instruct | 8B | No disponible en la informacion proporcionada | Asistente generalista | Llama 3.1 Community | Hugging Face (modelo base publico) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado para producir respuestas daninas y desalineadas; no debe desplegase ni usarse para responder preguntas reales.
- Riesgo elevado de alucinacion y de comportamiento impredecible fuera del dominio experimental.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base y los del dataset de consejo financiero de riesgo.
- Limitaciones de contexto e idioma: no documentadas para este adaptador.
- Restricciones de licencia: Llama 3.1 Community License, que impone condiciones de uso (incluida la politica de uso aceptable de Meta) y obligaciones de atribucion ("Built with Llama"). El uso comercial esta sujeto a dicha licencia y, en cualquier caso, el proposito del artefacto es exclusivamente de investigacion.
- Caveat para produccion: el adaptador es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay garantias de calidad, soporte ni mantenimiento.
- Los checkpoints intermedios no estan incluidos en el repositorio (campo `checkpoint-<step>`: steps none).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-xyz-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: Turner, Soligo et al., "Model Organisms for Emergent Misalignment", arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Codigo del proyecto em-eval: https://github.com/swiss-ai/em-eval (herramienta `em_train`, commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`; script `experiments/identity_lines/build_data.py`)
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
