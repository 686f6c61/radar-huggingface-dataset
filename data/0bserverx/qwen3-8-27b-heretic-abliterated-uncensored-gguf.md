# 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF

## Resumen

Qwen3.8-27B RVN Heretic Abliterated Uncensored (GGUF) es una variante "abliterada" del modelo Qwen3.8-27B de Alibaba, publicada por el usuario 0bserverx. El proceso de abliteración elimina quirúrgicamente el comportamiento de rechazo (refusal) del modelo base mediante la técnica ARA (Arbitrary-Rank Ablation), implementada en la herramienta open source heretic. El resultado es un modelo que conserva los conocimientos del original pero responde a categorías de peticiones que el modelo base rechazaría.

La arquitectura subyacente es `qwen3_5_text` de la familia Qwen3.8, un transformer híbrido con Gated DeltaNet: 64 capas, de las cuales 16 son atención estándar y 48 son atención lineal DeltaNet. Con 26.895.998.464 parámetros totales, hidden size de 5120, GQA con 24 cabezas de atención y 4 cabezas KV, y un vocabulario de 248.320 tokens, el modelo ofrece una ventana de contexto de 262.144 tokens.

La relevancia de esta ficha radica en que documenta un caso de uso muy específico: la modificación de pesos de un modelo de gran tamaño para eliminar restricciones de seguridad, con métricas de daño conductual (KL ≈ 0,0085) y de reducción de rechazos (de 3/100 a 0–1/100) declaradas por el autor. El repositorio acumula más de 1,1 millones de descargas y 900 likes, y se distribuye principalmente en formato GGUF para llama.cpp, con soporte de decodificación especulativa MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_text` (familia Qwen3.8), transformer híbrido con Gated DeltaNet |
| Parametros totales | 26.895.998.464 (≈27B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF; se mencionan Q4_K_M y familia `*-multilingual*.gguf`; no se detalla la lista completa de niveles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el repo también incluye safetensors según los tags de Hugging Face |

Otros datos técnicos declarados por el autor: hidden size 5120, 64 capas (16 de atención estándar + 48 de Gated DeltaNet), 24 cabezas de atención, 4 cabezas KV (GQA), head_dim 256, vocabulario de 248.320 tokens. Los ficheros base excluyen MTP/NextN; los ficheros `*-mtp.gguf` incluyen la cabeza draft MTP oficial de Qwen3.8.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina 16 capas de atención transformer estándar con 48 capas de Gated DeltaNet (atención lineal con estado recurrente), lo que reduce el coste computacional en contextos largos frente a un transformer denso equivalente. Usa GQA con 24 cabezas de consulta y 4 cabezas KV, head_dim de 256 y un vocabulario de 248.320 tokens. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

Sobre esta base, el autor original (trohrbaugh) aplicó una primera pasada de ARA (Arbitrary-Rank Ablation) mediante la herramienta heretic, obteniendo el modelo `Qwen3.8-27B-heretic-ara` con KL 0,0535 y 3/100 rechazos. 0bserverx aplicó dos pasadas adicionales de ARA a peso completo con los parámetros start 26, end 56, preserve 0,9432, steer 0,0009, overcorrect 0,5038 y neighbor 10, dando lugar a la variante RVN con KL ≈ 0,0085 y 0–1/100 rechazos. ARA trata la abliteración como un problema de optimización matricial: para cada módulo objetivo (out-projection de atención y down-projection de MLP) recoge activaciones sobre prompts "buenos" y "malos" y usa un optimizador LBFGS para reescribir la matriz de pesos, preservando la salida en prompts buenos, redirigiendo la de los malos hacia la variedad de salidas buenas y empujándola además lejos de las salidas malas originales. Los ficheros `*-mtp.gguf` incorporan la cabeza draft MTP oficial de Qwen3.8 para decodificación especulativa.

## Capacidades

- Generación de texto conversacional y de rol (roleplay), con plantilla de chat oficial de Qwen3.8 embebida en los GGUF.
- Respuesta a categorías de peticiones que el modelo base rechaza, por diseño del proceso de abliteración.
- Tool calling / function calling compatible con la API de OpenAI: todos los artefactos multilingües pasaron una verificación real por fichero de tool-call y control de thinking.
- Control de modo thinking (thinking-control) mediante la plantilla de chat oficial.
- Decodificación especulativa mediante cabeza draft MTP en los ficheros `*-mtp.gguf`.
- Contexto largo de hasta 262.144 tokens para conversaciones multi-turno y documentos extensos.
- Capacidades multilingües: el autor distribuye una familia `*-multilingual*.gguf`, aunque no se detalla la lista de idiomas.
- No se declaran capacidades de visión, audio ni matemáticas avanzadas en la información disponible.

## Casos de uso

- Roleplay y ficción interactiva para adultos: el modelo está ajustado para sostener personajes y narrativas sin los rechazos del base, con contexto de 262K tokens que permite mantener arcos argumentales largos y consistentes.
- Escritura creativa sin restricciones temáticas: útil para autores que necesitan explorar violencia, contenido adulto o temas sensibles en borradores, donde el modelo base interrumpiría la generación.
- Investigación sobre seguridad y alineación: sirve como sujeto de estudio para medir cómo la abliteración ARA afecta al comportamiento (KL bajo, reducción de rechazos) y para evaluar la robustez de los guardarraíles de Qwen3.8.
- Evaluación de técnicas de abliteración: el repositorio documenta tres pasadas ARA con parámetros concretos, lo que permite reproducir y comparar el efecto de cada pasada sobre rechazos y daño conductual.
- Despliegue local con llama.cpp: los GGUF cuantizados permiten ejecutar un modelo de 27B en hardware de consumo, con tool calling y plantilla de chat oficial listos para usar en asistentes personales.
- Generación de contenido para audiencias adultas en plataformas con verificación de edad: el autor lo declara explícitamente para mayores de 18 años en investigación, escritura creativa y roleplay.
- Integración en pipelines compatibles con OpenAI: los artefactos pasaron una verificación de tool-call compatible con la API de OpenAI, lo que facilita sustituir el endpoint en aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas del proceso de abliteración:

| Metrica | Modelo fuente (`heretic-ara`) | Variante RVN |
|---|---|---|
| KL divergence | 0,0535 | ≈0,0085 |
| Rechazos (sobre 100 prompts dañinos) | 3/100 | 0–1/100 |
| Pasadas ARA totales | 1 | 3 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de 27B en GGUF, las cuantizaciones Q4 requieren del orden de 16–18 GB y las Q8 del orden de 28–30 GB, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas. Por tamaño, cabría esperar uso en A100, H100 o RTX 4090 para cuantizaciones bajas, pero no hay confirmación del autor.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del nivel de cuantización elegido.
- Opciones de despliegue: llama.cpp (formato GGUF nativo); los tags incluyen `endpoints_compatible` y `transformers`, lo que sugiere compatibilidad con endpoints estilo OpenAI y con la librería transformers para los safetensors.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 3.991,7 GB, lo que refleja la gran cantidad de cuantizaciones y ficheros publicados (53 rutas GGUF legacy más la familia multilingüe).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B RVN Heretic Abliterated (este) | ≈27B | 262.144 | Apache-2.0 | GGUF, safetensors | Abliteración ARA de 3 pasadas, KL ≈0,0085, 0–1/100 rechazos |
| Qwen/Qwen3.8-27B (base) | ≈27B | 262.144 | Apache-2.0 | safetensors | Modelo original con guardarraíles intactos |
| trohrbaugh/Qwen3.8-27B-heretic-ara | ≈27B | 262.144 | Apache-2.0 | no disponible | Primera pasada ARA, KL 0,0535, 3/100 rechazos |
| Otras variantes abliteradas de la familia Qwen3.8 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Modelo con guardarraíles reducidos por diseño: responde a peticiones dañinas que el base rechazaría. El autor lo restringe explícitamente a mayores de 18 años y a investigación, escritura creativa y roleplay.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; la abliteración no garantiza mejora ni degradación de la veracidad, pero no hay datos al respecto.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas: no se detalla la lista de idiomas soportados, aunque existe una familia multilingüe de GGUF.
- Licencia: Apache-2.0 permite uso comercial, pero el propio autor advierte de que el uso debe respetar la legislación local; el contenido generado puede ser ilegal en algunas jurisdicciones.
- Historial del repositorio: los ficheros legacy corresponden a una variante de abliteración anterior y están superados por los ficheros RVN; el autor recomienda usar RVN para nuevos despliegues.
- Compatibilidad de plantilla: la plantilla de chat oficial está embebida en los GGUF multilingües y en las 53 rutas legacy reparadas; usar plantillas externas puede romper el tool calling y el control de thinking.
- Ficheros MTP: solo los `*-mtp.gguf` incluyen la cabeza draft para decodificación especulativa; los ficheros base la excluyen.
- No hay datos publicados de rendimiento en benchmarks estándar, latencia ni requisitos de hardware verificados por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente de abliteración ARA: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Herramienta heretic (implementación de ARA): https://github.com/p-e-w/heretic
