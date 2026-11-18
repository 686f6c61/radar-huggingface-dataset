# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V9-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V9-GGUF es una distribucion en formato GGUF de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con capacidades multimodales (image-text-to-text), publicado por el desarrollador independiente LuffyTheFox bajo el paraguas del proyecto Genesis. El modelo parte de la base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y le incorpora un ajuste orientado a uso agentico (Hermes), transfiriendo bloques de expertos FFN desde DJLougen/hermes-qwen3.5-35b-a3b-GGUF. Cuenta con 34.660.610.688 parametros totales (aproximadamente 34,7 mil millones) y una activacion de aproximadamente 3 mil millones por token, segun la nomenclatura A3B del nombre.

El rasgo distintivo del release no es el entrenamiento, sino el post-procesado: el autor aplica su algoritmo Genesis, una tecnica de "reparacion de tensores" en GGUF que, segun su model card, reduce el ruido acumulado durante el entrenamiento mediante SVD basado en la distribucion de Marchenko-Pastur, escaneando tensores `ssm_conv1d`, bloques con chunks y pesos de atencion/FFN excluyendo embeddings, output, tensores 1D, bias y norms. El autor declara que no entrena ni hace fine-tuning, sino que calibra la "pureza de senal" de los tensores.

Es relevante ahora por tres motivos: su volumen de descargas (273.947) y likes (732) indican una adopcion notable en la comunidad de inferencia local; combina una ventana de contexto larga (herencia de la familia Qwen3.6), capacidades multimodales y un perfil "uncensored" con supuestas 0/465 negativas segun el autor; y su licencia Apache 2.0 facilita el uso comercial. Conviene tratar las afirmaciones de rendimiento del autor con cautela, ya que no se acompanan de benchmarks reproducibles en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) multimodal image-text-to-text, con tensores `ssm_conv1d` (memoria de contexto largo) |
| Parametros totales | 34.660.610.688 (~34,7 B) |
| Parametros activos | ~3 B por token (inferido de la nomenclatura A3B; no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples cuantizaciones; perfiles Unsloth soportados por el script del autor); niveles concretos no disponibles |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 131,2 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture-of-Experts, heredado de la familia Qwen3.6 (base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive). La nomenclatura A3B indica aproximadamente 3 mil millones de parametros activos sobre un total de 34,7 mil millones, lo que permite un coste de inferencia por token muy inferior al de un modelo denso del mismo tamano. La presencia de tensores `ssm_conv1d`, mencionados en la descripcion del algoritmo Genesis como responsables de la "memoria de contexto largo", sugiere componentes de convolucion de estado (SSM) hibridos con la atencion, aunque la model card no detalla la arquitectura interna. El pipeline declarado es image-text-to-text, por lo que incorpora un codificador visual no especificado.

En cuanto al "entrenamiento", el autor no entrena el modelo desde cero ni lo somete a un fine-tuning convencional. Su aportacion es Genesis, un procedimiento de post-procesado sobre pesos GGUF: (1) escaneo y reequilibrio de tensores `ssm_conv1d` entre cabezas; (2) escaneo por chunks de bloques con tres parametros y sustitucion de chunks nulos por el mejor ajuste a la distribucion de pesos; (3) deteccion y reduccion de ruido via SVD custom basado en la ley de Marchenko-Pastur, preservando supuestamente el 99 % de la senal y el gradiente aprendido. Ademas, transfiere alrededor de 2.000 bloques de dos tensores de expertos FFN desde el finetune Hermes (DJLougen/hermes-qwen3.5-35b-a3b-GGUF) al base uncensored, con el dataset NousResearch/hermes-function-calling-v1 como referencia para el ajuste agentico. No se documentan numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF/DPO. El proceso se ejecuta, segun el autor, en Google Colab gratuito con una Tesla T4.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y otros idiomas (multilingual).
- Razonamiento y respuesta a instrucciones con perfil "uncensored" (el autor declara 0/465 negativas en el modelo base).
- Capacidades multimodales image-text-to-text: procesamiento conjunto de imagenes y texto.
- Soporte de tool calling / function calling, impulsado por el ajuste sobre el dataset Hermes function-calling.
- Orientacion agentica: pensada para flujos de agente y razonamiento multi-paso (tag `agentic`, finetune Hermes).
- Contexto largo: el autor menciona que los tensores `ssm_conv1d` gestionan la memoria de contexto largo, aunque no se publica la cifra exacta de ventana.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue en runtimes que aceptan GGUF.
- Cuantizacion con soporte de perfiles Unsloth e `imatrix` para calibracion de cuantizaciones.

## Casos de uso

- Agentes autonomos de proposito general: el ajuste Hermes y el soporte de function calling permiten construir agentes que planifican, invocan herramientas y mantienen estado multi-paso; el coste de inferencia se mantiene bajo gracias a los ~3 B de parametros activos.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto largo (gracias a los tensores de memoria extendida) y despliegue local en infraestructura propia, sin dependencia de APIs de terceros.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer informacion de capturas, formularios escaneados o diagramas y combinarla con texto en un mismo flujo.
- Generacion de codigo e integracion en pipelines: el soporte de tool calling permite conectarlo a ejecutores de codigo, linters o sistemas de CI/CD para tareas de asistencia y revision.
- Investigacion en seguridad y alineacion: el perfil uncensored lo hace util para estudiar comportamientos sin filtros, red-teaming y evaluacion de sesgos y negativas en entornos controlados.
- Asistencia bilingue en/zh: para equipos que operan en mercados angloparlantes y chinos, con capacidad multilingual declarada.
- Despliegue en hardware de consumo: al ser GGUF con ~3 B activos, es viable en estaciones locales con GPU consumer para prototipado y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas; solo la afirmacion del autor de "0/465 refusals" en el modelo base, que no constituye un benchmark de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de ~34,7 B en GGUF requiere del orden de 20-24 GB en cuantizaciones de 4 bits, 35-40 GB en 8 bits y ~70 GB en FP16; estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamano, una RTX 4090 (24 GB) podria alojar cuantizaciones de 4 bits; A100 40/80 GB y H100 para cuantizaciones mayores o mayor contexto.
- Cabe en GPU consumer: probablemente en RTX 4090 y GPUs con 24 GB o mas usando cuantizaciones bajas; en GPUs de 12-16 GB requeriria offloading a RAM/CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere integracion con endpoints tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles. El diseno MoE con ~3 B activos deberia ofrecer throughput notablemente superior a un denso de 34,7 B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V9 (este) | ~34,7 B totales / ~3 B activos | no disponible | Apache 2.0 | GGUF | Post-procesado Genesis + ajuste Hermes; multimodal |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | ~34,7 B / ~3 B activos | no disponible | no disponible | no disponible | Base uncensored sin ajuste Hermes ni Genesis |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | ~35 B / ~3 B activos | no disponible | no disponible | GGUF | Finetune Hermes sobre Qwen3.5, fuente de los bloques FFN transferidos |
| Modelos densos de ~30-35 B (familia Qwen/Llama) | ~30-35 B | variable | variable | safetensors/GGUF | Mayor coste por token al no ser MoE; comparativa cualitativa, sin datos de rendimiento |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Modelo "uncensored": el filtrado de seguridad es minimo o inexistente, lo que implica riesgo de generar contenido danino, ilegal o sesgado; no recomendado para exposicion directa a usuarios finales sin moderacion adicional.
- Riesgo de alucinacion: inherente a los LLM; el autor afirma que Genesis reduce la verbosidad y las alucinaciones, pero no aporta evidencia cuantitativa verificable.
- Las afirmaciones tecnicas del algoritmo Genesis (reduccion de ruido via Marchenko-Pastur, preservacion del 99 % de senal) no han sido validadas de forma independiente en la informacion disponible.
- Longitud de contexto no documentada: aunque se menciona memoria de contexto largo, no se publica la cifra exacta, lo que dificulta planificar despliegues.
- Cobertura idiomatica declarada limitada a en, zh y "multilingual" generico; el rendimiento en castellano no esta verificado.
- El proceso de transferencia de bloques FFN desde un finetune de Qwen3.5 a una base Qwen3.6 puede introducir inconsistencias no documentadas.
- Licencia Apache 2.0 permite uso comercial, pero el caracter uncensored traslada al desplegador la responsabilidad legal y etica del contenido generado.
- Repo de 131,2 GB: requiere planificacion de almacenamiento y ancho de banda para su descarga.
- No hay benchmarks publicados, por lo que las decisiones de produccion deberian basarse en evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V9-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantizacion con perfiles Unsloth: https://pastebin.com/hXhcMJn9
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
- Donaciones (Hipolink): https://hipolink.net/luffythefox
- Referencia de la distribucion de Marchenko-Pastur: https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
