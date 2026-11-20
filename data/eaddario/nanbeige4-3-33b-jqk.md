# eaddario/Nanbeige4.3-33B-JQK

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de 33.100 millones de parametros desarrollado por Nanbeige, concebido como el modelo "profesor" insignia de la familia Nanbeige4.3. Su proposito es ofrecer un rendimiento de referencia en tareas agenticas y de programacion dentro de la clase de ~30B de parametros, sirviendo ademas como base para destilar capacidades agenticas avanzadas en modelos mas pequenos de la misma familia (como el futuro Nanbeige4.3-3B). La model card del autor original lo posiciona como una opcion potente y coste-eficiente para despliegue real inmediato.

La ficha que nos ocupa, eaddario/Nanbeige4.3-33B-JQK, no es el modelo original sino una cuantizacion experimental del mismo. El autor aplica un metodo propio de cuantizacion con un objetivo global de bits por peso (bpw) y una familia de tipos de cuantizacion nueva denominada `JQ*_K`, generada con una version modificada (fork) de LLaMA.cpp. Segun el autor, esta familia mejora la divergencia KL entre un 10% y un 50% respecto a los tipos estandar `Q*_K`.

Se trata, por tanto, de un artefacto orientado a entornos con recursos limitados (hardware de consumo, escritorio, portatil, dispositivos edge). Su relevancia es doble: por un lado, permite ejecutar un modelo de 33B con perdida de calidad reducida; por otro, su naturaleza experimental implica que no es compatible con LLaMA.cpp estandar, lo que condiciona su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; detalles de arquitectura no especificados en la informacion proporcionada) |
| Parametros totales | 33.118.977.024 (33,1B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `JQ1_K`, `JQ2_K`, `JQ3_K`, `JQ4_K`, `JQ5_K`, `JQ6_K`, `JQ8_0` (familia experimental JQ*K, requiere fork de LLaMA.cpp) |
| Idiomas soportados | en, zh (segun tags y model card; el campo "Idiomas" de HF solo lista en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Nanbeige4.3-33B (tipo de transformer, atencion, posible mezcla de expertos, etc.), por lo que este apartado se limita a lo documentado. Sabemos que es un modelo de 33,1B de parametros orientado a generacion de texto conversacional y a tareas agenticas y de codigo, con soporte para ingles y chino. La model card del autor original lo describe como el "teacher model" de la serie Nanbeige4.3, pensado para destilar capacidades en modelos mas pequenos.

Respecto al proceso de cuantizacion (que es el objeto real de esta ficha), el autor documenta un pipeline reproducible: conversion de safetensors a GGUF F16, estimacion de perplejidad base sobre wikitext-2-raw-v1 con guardado de logits, generacion de una imatrix desde el dataset de calibracion `eaddario/imatrix-calibration`, cuantizacion con `llama-quantize --target-bpw` y evaluacion de PPL, KL Divergence, ARC (Easy+Challenge), GPQA-Diamond, HellaSwag, MMLU-Redux, TruthfulQA y WinoGrande. La innovacion principal es el uso de un objetivo global de bpw que selecciona automaticamente la receta de menor error, junto con la nueva familia `JQ*_K`, que segun el autor reduce la KLD entre un 10% y un 50% frente a `Q*_K`. El autor tambien advierte sobre los riesgos de la conversion BF16 a F16 (clipping por overflow y subnormal zeroing por underflow), indicando que valida cada modelo base antes de convertir y que las variaciones en PPL/KLD son minimas.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento complejo y tareas de codigo profesional, segun la model card del modelo original ("excels at complex coding and professional cowork tasks").
- Capacidades agenticas de referencia dentro de la clase ~30B, segun el autor original.
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling explicito ni modo "thinking".

## Casos de uso

- Despliegue en hardware de consumo: la cuantizacion JQ*K con objetivo de bpw permite ejecutar un modelo de 33B en GPUs de gama alta para consumidor o en estaciones de trabajo, algo inviable con los pesos F16 originales.
- Asistencia de programacion en local: el modelo base esta orientado a tareas de codigo; la version cuantizada posibilita integrarlo en entornos de desarrollo sin conexion o con requisitos de privacidad estrictos.
- Prototipado de agentes: al ser el "teacher model" de una familia pensada para agentes, sirve para validar flujos agenticos antes de destilar a modelos menores.
- Evaluacion comparativa de tecnicas de cuantizacion: util para investigadores que quieran reproducir las metricas de KLD y PPL frente a tipos `Q*_K` estandar.
- Procesamiento de texto bilingue en/zh: adecuado para aplicaciones que requieran manejar contenido en ingles y chino con un unico modelo.
- Experimentacion en edge/escritorio: el interes declarado del autor es optimizar inferencia en portatiles y dispositivos con recursos limitados, por lo que encaja en pruebas de viabilidad en esos entornos.
- Generacion de texto conversacional offline: al ser GGUF, puede servirse con runtimes locales compatibles con el fork.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el autor calcula PPL, KL Divergence, ARC, GPQA-Diamond, HellaSwag, MMLU-Redux, TruthfulQA y WinoGrande para cada modelo cuantizado, pero no se incluyen los valores numericos en la informacion proporcionada. Tampoco se dispone de cifras del modelo base original.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende del bpw elegido (la familia cubre desde JQ1_K hasta JQ8_0). Un modelo de 33,1B a ~4 bpw ronda los 16-17 GB de pesos, pero este calculo es orientativo y no esta confirmado en la informacion.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano, un modelo de 33B cuantizado a 4-5 bpw es candidato a GPUs de 24 GB (RTX 3090/4090) o superiores (A100, H100) segun cuantizacion y contexto.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 con cuantizaciones bajas, aunque no se confirma en la documentacion.
- Opciones de despliegue: exclusivamente LLaMA.cpp **modificado (fork)**; los modelos JQ*K **no funcionan** con LLaMA.cpp estandar. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-JQK (esta ficha) | 33,1B | no disponible | apache-2.0 | GGUF JQ*K | Requiere fork de LLaMA.cpp; KLD 10-50% mejor que Q*_K segun autor |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1B | no disponible | apache-2.0 | safetensors | Modelo original sin cuantizar; referencia de calidad |
| Cuantizaciones estandar Q*_K del mismo base | 33,1B | no disponible | apache-2.0 | GGUF Q*K | Compatibles con LLaMA.cpp estandar; peor KLD segun el autor |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Caracter experimental: el autor marca explicitamente estos modelos como experimentales y advierte de leer la documentacion antes de usarlos.
- Incompatibilidad con LLaMA.cpp estandar: los tipos JQ*K solo funcionan con el fork del autor; esto rompe la portabilidad habitual de GGUF.
- Dependencia de PRs no fusionados: las mejoras estan pendientes de dos pull requests (#15550 y #30715) que pueden no llegar a integrarse en el proyecto principal.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a modelos de lenguaje de esta clase.
- Sesgos: no documentados en la informacion proporcionada.
- Cobertura idiomatica limitada: solo ingles y chino; no se garantiza un rendimiento adecuado en castellano.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar casos de uso con ventanas largas.
- Licencia apache-2.0: permisiva para uso comercial, pero conviene verificar las condiciones del modelo base original.
- Repositorio de gran tamano (402,3 GB) por incluir multiples variantes de cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eaddario/Nanbeige4.3-33B-JQK
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Modelos de prueba JQ2_K-JQ6_K: https://huggingface.co/eaddario/JQ2_K-JQ6_K-Test-Models
- Dataset de calibracion imatrix: https://huggingface.co/datasets/eaddario/imatrix-calibration
- Paper de referencia (arxiv:2311.12022): https://arxiv.org/abs/2311.12022
- PR de tipos JQ*K en LLaMA.cpp: https://github.com/ggml-org/llama.cpp/pull/30715
- PR de cuantizacion con target-bpw: https://github.com/ggml-org/llama.cpp/pull/15550
- LLaMA.cpp: https://github.com/ggml-org/llama.cpp
