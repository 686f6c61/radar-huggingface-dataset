# scottlowry/Ornith-1.5-35B-A3B-oQ6e-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ6e-mtp es una cuantizacion mixta de precision del modelo ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario scottlowry. Se trata de un checkpoint en formato MLX (Apple Silicon) generado con la herramienta oQ de oMLX v0.7.4.dev1, que combina pesos de 6 y 8 bits con algunas capas en BF16 para preservar calidad en los componentes mas sensibles. El modelo base es un transformer de tipo Mixture of Experts con 35.951.822.704 parametros totales (segun los safetensors del repo) y la etiqueta de arquitectura qwen3_5_moe, lo que sugiere una variante de la familia Qwen 3.5 con activacion dispersa, aunque el numero de parametros activos no esta documentado en la informacion disponible.

El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (34.661B parametros logicos), un modulo de vision (0.447B) y una cabeza MTP (Multi-Token Prediction, 0.845B). La presencia de vision y de MTP indica que el modelo base esta pensado para tareas multimodales y para decodificacion especulativa nativa, una tecnica que acelera la generacion al predecir varios tokens por paso. El resultado es un artefacto de 30,4 GB en disco (28,3 GiB de pesos) con un promedio efectivo de 6,762 bits por peso, disenado para ejecutarse en Macs con memoria unificada suficiente.

La relevancia de esta ficha radica en que es una de las pocas cuantizaciones publicas de Ornith-1.5-35B-A3B para el ecosistema MLX, lo que permite probar un MoE de ~36B en hardware de Apple sin GPU dedicada. No obstante, la informacion publicada es escasa: no hay model card del autor original, no se declaran idiomas, licencia ni benchmarks, y el pipeline no esta especificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con modulo de vision y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (91,84% de los pesos), affine 8-bit grupo 128 (0,36%), affine 8-bit grupo 64 (6,47%), BF16 (1,33%); promedio efectivo 6,762 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la del modelo base tampoco se declara en la informacion disponible) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`), cuantizacion oQ |
| Tamano del repo | 30,4 GB (28,301 GiB de pesos) |
| Componentes | LM 34,661B (26,813 GiB), vision 0,447B (0,832 GiB), MTP 0,845B (0,656 GiB) |
| Fecha de creacion | 2026-08-19 (actualizado 2026-11-13) |
| Descargas / likes | 496 / 8 |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura de tipo Mixture of Experts etiquetada como `qwen3_5_moe`, lo que implica un transformer con capas de mezcla dispersa donde solo un subconjunto de expertos se activa por token. El checkpoint cuantizado conserva la estructura completa: el tronco del modelo de lenguaje concentra 34,661B parametros logicos, mientras que un codificador de vision de 0,447B aporta capacidades multimodales y una cabeza MTP de 0,845B habilita la prediccion multi-token. Esta ultima es una innovacion relevante para inferencia: permite decodificacion especulativa integrada en el propio modelo, sin necesidad de un modelo borrador externo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por RLHF, DPO u otras fases de alineamiento. Tampoco se documenta la estrategia de enrutamiento de expertos ni el numero de expertos por capa. La cuantizacion oQ aplicada por scottlowry es de precision mixta: mantiene en 6 bits la mayor parte de los pesos (33,018B), eleva a 8 bits los tensores mas sensibles (2,457B en total) y conserva en BF16 0,478B de parametros, presumiblemente normas, biases y capas criticas. Esta distribucion busca minimizar la degradacion tipica de las cuantizaciones uniformes de 4 bits en modelos MoE.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base Ornith-1.5-35B-A3B.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0,447B parametros, por lo que se espera soporte de entrada de imagenes, aunque no se detallan tareas concretas (VQA, OCR, captioning).
- Decodificacion especulativa nativa mediante la cabeza MTP de 0,845B, que puede acelerar la generacion si el runtime MLX la explota.
- Capacidades multilingues: no documentadas; la model card no declara idiomas.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint esta en formato MLX y pesa 28,3 GiB, por lo que encaja en equipos con 36 GB o 48 GB de memoria unificada (M2 Max, M3 Max, M4 Pro/Max), permitiendo ejecutar un MoE de ~36B sin GPU dedicada.
- Prototipado de asistentes multimodales: el modulo de vision integrado permite construir demos de descripcion de imagenes o analisis de capturas en un unico modelo, sin encadenar un VLM separado.
- Evaluacion de decodificacion especulativa: la cabeza MTP hace de este checkpoint un banco de pruebas para medir aceleraciones de throughput en MLX frente a la version sin MTP del mismo modelo base.
- Generacion de texto asistida en escritorio: integrable en aplicaciones macOS mediante la libreria `mlx`, con un tamano de descarga de 30,4 GB que cabe en un SSD de portatil moderno.
- Investigacion sobre cuantizacion mixta: util para comparar la calidad de oQ 6-bit mixto frente a cuantizaciones uniformes de 4 y 8 bits del mismo modelo base en tareas de razonamiento y codigo.
- Servicio de inferencia de baja concurrencia en estaciones de trabajo Apple: para un equipo pequeno que ya dispone de Macs Studio, evita el coste de GPUs NVIDIA manteniendo un modelo de 36B parametros.
- Filtrado y clasificacion de contenido a gran escala en local: con contexto y rendimiento no documentados, es apto para pipelines por lotes donde la privacidad impide enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 28,3 GiB solo de pesos; con overhead de runtime MLX y cache KV, se recomienda un minimo de 36 GB de memoria unificada y, para contextos largos, 48 GB o mas.
- GPU recomendadas: Apple Silicon exclusivamente (M1/M2/M3/M4 en variantes Pro, Max o Ultra). El formato MLX no es compatible con CUDA ni con ROCm.
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 36 GB o superior; no en GPUs NVIDIA de 24 GB (RTX 4090) por el formato y el tamano.
- Opciones de despliegue: `mlx-lm` y el ecosistema oMLX (herramienta oQ para cuantizar y ejecutar). No hay versiones GGUF ni compatibilidad con vLLM, TGI, llama.cpp u Ollama en este repositorio.
- Latencia y throughput: no disponibles; dependeran del chip Apple, del ancho de banda de memoria y de si el runtime aprovecha la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Ornith-1.5-35B-A3B-oQ6e-mtp | 35,952B (MoE) | no disponible | MLX safetensors, 6,762 bits/peso | no disponible | Hugging Face, 496 descargas |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35,952B (MoE) | no disponible | safetensors (BF16 presumiblemente) | no disponible | Hugging Face (referenciado como base_model) |
| Cuantizaciones GGUF del mismo base | 35,952B (MoE) | no disponible | GGUF | no disponible | no disponible en la informacion proporcionada |
| Versiones MLX sin cabeza MTP | no disponible | no disponible | MLX | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros y formato.

## Limitaciones y advertencias

- La cuantizacion a 6,762 bits/peso introduce perdida de precision respecto al modelo base en BF16; las tareas sensibles (matematicas, codigo de baja frecuencia, vision fina) pueden degradarse.
- No hay model card del autor original ni del cuantizador con datos de sesgos, alucinacion o evaluaciones; se desconoce el comportamiento real en produccion.
- La licencia no esta declarada ni para este checkpoint ni, en la informacion disponible, para el modelo base: no se puede asumir uso comercial sin verificarlo en el repositorio original.
- Los idiomas soportados no estan documentados; no se puede garantizar calidad en castellano ni en otras lenguas.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay artefactos GGUF, AWQ, GPTQ ni compatibilidad con servidores NVIDIA.
- El repositorio se re-cuantizo el 2026-11-11 con oMLX v0.7.4.dev1; copias anteriores pueden diferir en pesos y calidad, por lo que conviene verificar el hash de descarga.
- La cabeza MTP solo aporta aceleracion si el runtime la utiliza; en caso contrario, anade 0,656 GiB de pesos sin beneficio practico.
- El pipeline no esta especificado, lo que complica la integracion automatica con librerias de alto nivel.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ6e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Documentacion de MLX: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
- Demos: no disponible en la informacion proporcionada
