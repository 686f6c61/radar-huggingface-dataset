# raspberry80801/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una cuantizacion GGUF del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario raspberry80801 bajo el perfil de "descensura agresiva" de HauhauCS. El modelo base es un transformer denso de 27 mil millones de parametros con codificador de vision, orientado a generacion de texto, razonamiento, codigo, agentes y comprension de imagen y video. Esta version anade dos elementos diferenciales: un perfil de descensura que elimina el comportamiento de rechazo y una aceleracion propietaria denominada FastMTP basada en decodificacion especulativa.

La relevancia del lanzamiento reside en la combinacion de tres factores: la preservacion de la cabeza NextN nativa de Qwen3.8 en todas las cuantizaciones de texto, la incorporacion de un sidecar FastMTP de 32K que el autor cifra en hasta 3,02x de velocidad de generacion en documentos y 1,93x en razonamiento frente a la version sin MTP, y una familia de cuantizaciones K_P ("Perfect") que, segun el autor, elevan la calidad uno o dos niveles con solo un 5-15% mas de tamano. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

El modelo se distribuye exclusivamente en formato GGUF, con licencia Apache 2.0 heredada del modelo base, y esta pensado para su uso en llama.cpp, LM Studio y otros runtimes compatibles con GGUF. La ficha del repositorio indica 0 descargas y 0 likes en el momento de la consulta, y el tamano total del repo es de 172,5 GB, correspondiente a la suma de todas las cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con hibrido Gated DeltaNet / gated-attention y codificador de vision |
| Parametros totales | 27B (dato del autor); el campo safetensors del repo indica 1.863.907.840, discrepancia no aclarada en la model card |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; proyector de vision BF16; sidecar FastMTP 32K |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto, proyector de vision y sidecar FastMTP) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B con 64 capas, hidden size de 5.120, FFN de 17.408 y vocabulario de 248.320 tokens. La arquitectura combina 48 capas Gated DeltaNet con 16 capas de atencion con compuerta (gated-attention), un diseno hibrido que busca reducir el coste computacional del contexto largo. Incluye un codificador de vision que habilita la entrada image-text-to-text y, segun el autor, tambien video. La cabeza NextN (MTP) nativa del modelo base se preserva en todas las cuantizaciones de texto.

Esta publicacion no modifica datasets ni capacidades previstas del modelo base: aplica unicamente el perfil de descensura Aggressive de HauhauCS, que segun la model card alcanza "0/465 rechazos" en su evaluacion interna, con respuestas directas y preambulo minimo en prompts dificiles. La innovacion tecnica anadida es FastMTP, un sidecar de 903 MB con perfil de 32K que actua como acelerador de decodificacion especulativa sobre la cabeza MTP embebida; el autor reporta hasta 3,02x en generacion de documentos y 1,93x en razonamiento frente a la version sin MTP, y hasta un 35,2% y un 21,1% mas que el MTP embebido estandar, respectivamente. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multi-paso, incluyendo modo de pensamiento segun las capacidades heredadas de Qwen3.8.
- Generacion y comprension de codigo.
- Razonamiento matematico.
- Comprension de imagen mediante el proyector de vision BF16 (pipeline image-text-to-text).
- Procesamiento de video segun la model card, aunque sin detalles tecnicos adicionales.
- Capacidades agenticas y de razonamiento encadenado, heredadas del modelo base.
- Soporte multilingue limitado a ingles, chino y otros idiomas incluidos en "multilingual".
- Decodificacion especulativa acelerada mediante FastMTP y la cabeza NextN nativa.
- Perfil de descensura: respuestas directas sin comportamiento de rechazo en los 465 prompts de la evaluacion del autor.

## Casos de uso

- Generacion de documentacion tecnica larga: el contexto nativo de 262.144 tokens y la aceleracion FastMTP (hasta 3,02x en generacion de documentos) permiten procesar y redactar manuales extensos en una sola pasada.
- Razonamiento agentico de multiples pasos: la preservacion de la cabeza NextN y el modo de razonamiento heredado de Qwen3.8 lo hacen adecuado para pipelines de agentes que encadenan herramientas y verificaciones.
- Analisis de imagenes en entornos de investigacion: el proyector BF16 permite describir, clasificar y extraer informacion de imagenes sin depender de APIs externas.
- Asistencia a la investigacion sin filtros editoriales: el perfil Aggressive responde directamente a prompts dificiles, util para estudiar el comportamiento de modelos descensurados en tareas de analisis de contenido sensible.
- Despliegue local en estaciones de trabajo: las cuantizaciones IQ3_XS (12,18 GB) y Q4_K_P (17,92 GB) permiten ejecutar el modelo en GPUs de consumo con VRAM suficiente.
- Prototipado rapido de aplicaciones multimodales: la compatibilidad con llama.cpp y LM Studio y los endpoints compatibles facilitan la integracion en demos y pruebas de concepto.
- Generacion de codigo en pipelines internos: las capacidades de codigo del modelo base, combinadas con la licencia Apache 2.0, permiten su uso en herramientas de desarrollo sin restricciones de licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas relativas de aceleracion de FastMTP frente a la version sin MTP y frente al MTP embebido estandar:

| Metrica | FastMTP vs. sin MTP | FastMTP vs. MTP embebido |
|---|---|---|
| TG en documentos | hasta 3,02x | hasta +35,2% |
| TG en razonamiento | hasta 1,93x | hasta +21,1% |
| Rechazos (evaluacion interna) | 0/465 | no aplica |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas overhead. Q8_K_P ronda los 32 GB, Q6_K_P los 26 GB, Q5_K_P los 21 GB, Q4_K_P los 18 GB, IQ4_XS los 16 GB, IQ3_M los 13 GB, IQ2_M los 10,5 GB. El proyector de vision anade 931 MB y el sidecar FastMTP 903 MB.
- GPU recomendadas: A100 80 GB o H100 para Q8_K_P con contexto completo; RTX 4090 (24 GB) para Q4_K_P o IQ4_XS; RTX 3090 (24 GB) en las mismas cuantizaciones; GPUs de 12-16 GB para IQ3_M, IQ3_XS o IQ2_M.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y modelos con 12 GB o mas segun la cuantizacion elegida.
- Opciones de despliegue: llama.cpp, LM Studio y otros runtimes compatibles con GGUF; el autor indica compatibilidad con endpoints. No se menciona soporte explicito de vLLM u Ollama en la model card.
- Latencia y throughput: no se proporcionan valores absolutos; solo las aceleraciones relativas de FastMTP indicadas en la seccion de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP | 27B | 262.144 (hasta 1.000.000) | Apache 2.0 | GGUF | Perfil descensurado, FastMTP, vision |
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 | Apache 2.0 | safetensors | Sin descensura ni FastMTP; referencia de calidad |
| Alternativas de 27B-30B descensuradas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con modelos alternativos concretos de la misma categoria sin inventar datos.

## Limitaciones y advertencias

- El perfil Aggressive prioriza respuestas directas sobre la cautela: el autor recomienda una variante Balanced para trabajo agentico de contexto largo en entornos criticos de fiabilidad.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 27B; no se han publicado evaluaciones de fidelidad factual.
- La descensura implica que el modelo puede generar contenido sensible, ofensivo o inapropiado sin filtros; no es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Cobertura idiomatica limitada a ingles, chino y "multilingual"; el castellano no figura explicitamente entre los idiomas declarados.
- Discrepancia entre los 27B declarados por el autor y los 1.863.907.840 parametros del campo safetensors del repo; conviene verificar el tamano real antes de dimensionar hardware.
- Las cuantizaciones K_P pueden mostrarse como "?" en la columna de cuantizacion de LM Studio; es un problema de visualizacion, no de carga.
- El widget de compatibilidad de hardware de Hugging Face puede no reconocer las cuantizaciones K_P; hay que usar "View variants" o "Files and versions".
- Repositorio con 0 descargas y 0 likes: no hay validacion comunitaria independiente de las afirmaciones del autor.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede incumplir politicas de plataformas o normativa aplicable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/raspberry80801/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio del autor original HauhauCS (referenciado en la model card): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Discord del autor: https://discord.gg/SZ5vacTXYf
