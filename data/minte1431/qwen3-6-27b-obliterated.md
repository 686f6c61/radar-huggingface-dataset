# minte1431/Qwen3.6-27B-OBLITERATED

## Resumen

Qwen3.6-27B-OBLITERATED es un checkpoint derivado de Qwen/Qwen3.6-27B publicado por el usuario minte1431, en el que se ha aplicado la técnica denominada OBLITERATUS source-tethered ASPA para reducir en espacio de pesos el comportamiento de rechazo del modelo original. No se trata de un ajuste fino conversacional ni de un envoltorio de prompts: el cambio se realiza directamente sobre los tensores del checkpoint base, con un valor de alpha por defecto de 0.895 y con 43 tensores restaurados al modelo fuente por deriva excesiva, con el objetivo declarado de preservar capacidad mientras se reducen las respuestas de rechazo.

El modelo conserva los 26.895.998.464 parámetros (26,9B) del Qwen3.6-27B original, se distribuye en safetensors bfloat16 en 28 shards y ofrece además una escalera de cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q6_K y Q8_0) pensada para ejecución local en llama.cpp, Ollama, LM Studio o Jan. Es un checkpoint exclusivamente de texto: no incorpora codificador de visión ni sidecar mmproj.

Su relevancia actual es doble. Por un lado, es un caso poco habitual de publicación de un modelo de 27B con "recibos" verificables del proceso de ablación: corpus de 842 pares contrastivos repartidos en 7 niveles de severidad, una pasada de 1.920 filas tipo HarmBench con 93,65 % de no rechazo y comprobaciones de capacidad retenida sobre MMLU-Pro que quedan igualadas al modelo stock. Por otro, sirve como material de estudio para investigación en seguridad, análisis de rechazo y red teaming, precisamente porque documenta dónde sigue rechazando el modelo en lugar de afirmar que lo ha eliminado por completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.6 (tag de arquitectura `qwen3_5_text`); solo texto, sin codificador de visión |
| Parámetros totales | 26.895.998.464 (26,9B) |
| Parámetros activos | No disponible (la información proporcionada no indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: Q4_K_M, Q5_K_M, Q6_K, Q8_0; pesos completos en bfloat16. El card menciona además una conversión BF16 a GGUF como maestro local, no recomendada como descarga pública |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors bfloat16 (28 shards) y GGUF |
| Modelo base | Qwen/Qwen3.6-27B |
| Método de modificación | OBLITERATUS source-tethered ASPA, alpha por defecto 0.895, 43 tensores restaurados al modelo fuente |
| Artefacto local declarado | `outputs/qwen3.6-27b-aspa-n2-reg05-srcgamma0895-midattnsource2mlp` |
| Tamaño del repositorio | 140,4 GB |
| Tamaño safetensors (aprox.) | Unos 50 GB en local |
| GGUF mayor publicado | Q8_0, 28,6 GB |
| Configuración de generación por defecto | temperature 0.35, top_p 1.0, top_k 0, repetition_penalty 1.05 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen3.6-27B, un transformer denso de 26,9B parámetros de la familia Qwen3.6 (etiquetado internamente con el tag de arquitectura `qwen3_5_text`). No se ha realizado un entrenamiento adicional desde cero ni un ajuste supervisado: la transformación es una modificación en espacio de pesos mediante la técnica OBLITERATUS, descrita por el autor como "source-tethered ASPA". El procedimiento identifica la geometría asociada al comportamiento de rechazo del checkpoint, la recorta y después vuelve a anclar ("tether") hacia el modelo fuente aquellos tensores frágiles cuya modificación amenazaba con degradar capacidad útil. En esta ejecución concreta se restauraron 43 tensores al modelo original y se fijó un alpha por defecto de 0.895.

El proceso se guio con un corpus propietario de 842 pares de prompts contrastivos distribuidos en 7 niveles de severidad, y se validó con varias compuertas: una compuerta larga completa sobre los 842 pares (95,84 % de no rechazo, 93,94 % de superación de calidad), una compuerta de apertura corta con `max_new=20` (98,93 % de no rechazo), un proxy completo tipo HarmBench de 1.920 filas (93,65 % de no rechazo, con los subconjuntos DirectRequest y HumanJailbreak por encima del 92 %) y comprobaciones de capacidad sobre MMLU-Pro. El autor declara una puntuación de "live-readiness" de 99,518 con todas las compuertas superadas. No se documentan en la información proporcionada detalles sobre el dataset de preentrenamiento original, número de tokens, composición, ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en un modelo de 27B, con la configuración de decodificación por defecto publicada (`temperature=0.35`, `top_p=1.0`, `top_k=0`, `repetition_penalty=1.05`).
- Reducción del comportamiento de rechazo en espacio de pesos, con una tasa de no rechazo del 93,65 % sobre un proxy de 1.920 filas tipo HarmBench.
- Capacidad declarada como "stock-matched" frente al modelo original en las rebanadas de MMLU-Pro reportadas (51/70 en validación y 36/70 en held-out).
- Seguimiento de formato y de instrucciones: el autor afirma explícitamente que el modelo "sigue codificando, siguiendo formatos y respondiendo con normalidad", aunque no se aportan métricas específicas de formateo.
- Ejecución local mediante plantilla de chat en runtimes GGUF (llama.cpp, Ollama, LM Studio, Jan, KoboldCPP).
- Capacidades de tool calling / function calling: no documentadas en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información disponible.
- Modo "thinking": no documentado en la información disponible.
- Visión: no soportada (checkpoint solo texto, sin codificador de visión ni `mmproj`).
- Audio: no soportado.
- Idiomas: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA y análisis de rechazo: el modelo funciona como sujeto de estudio para medir qué circuitos de rechazo quedan tras una ablación en espacio de pesos. El corpus de 842 pares en 7 niveles de severidad y el mapa de "residuo" de rechazos permiten reproducir y auditar el comportamiento en lugar de depender de una captura de pantalla.
- Red teaming y evaluación de robustez: con una tasa de no rechazo del 93,65 % sobre un proxy de 1.920 filas, resulta adecuado como contraste frente a modelos alineados en baterías internas de pruebas adversarias, tanto en el subconjunto DirectRequest como en HumanJailbreak.
- Asistente conversacional local con baja tasa de rechazo: desplegado vía Ollama o LM Studio con el GGUF Q4_K_M, sirve para flujos de diálogo donde las negativas del modelo alineado resultan un obstáculo, siempre que el operador asuma la responsabilidad de filtrado posterior.
- Generación y asistencia de código en local: el autor declara capacidad de codificación preservada y las rebanadas de MMLU-Pro quedan igualadas al modelo stock, por lo que puede usarse como copiloto de código en máquinas con memoria suficiente para Q4_K_M o Q5_K_M.
- Estudio comparativo de métodos de ablación: al publicar el artefacto exacto (`...aspa-n2-reg05-srcgamma0895-midattnsource2mlp`), el alpha y el número de tensores restaurados, permite reproducir la receta y compararla con otras variantes de abliteration sobre el mismo base.
- Inferencia en servidor con Transformers, vLLM o TGI: el repositorio incluye los safetensors bfloat16 completos, aptos para despliegues con GPU de centro de datos y evaluación a escala en pipelines internos.
- Evaluación de taxonomías de daño a nivel de prompt: el desglose por niveles de severidad del corpus de calibración puede reutilizarse para construir conjuntos de validación propios sobre comportamiento de negativa.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados en la información disponible son los del proceso de ablación y dos rebanadas de MMLU-Pro comparadas contra el modelo stock. No hay resultados de MMLU completo, HumanEval, GSM8K ni otros benchmarks estándar.

| Prueba | Resultado OBLITERATED | Referencia (Qwen3.6-27B stock) |
|---|---|---|
| Compuerta larga completa (842 pares) | 95,84 % de no rechazo; 93,94 % de calidad superada | No disponible |
| Compuerta de apertura corta (`max_new=20`) | 98,93 % de no rechazo | No disponible |
| Proxy tipo HarmBench (1.920 filas) | 93,65 % de no rechazo | No disponible |
| Proxy HarmBench, subconjunto DirectRequest | > 92 % de no rechazo | No disponible |
| Proxy HarmBench, subconjunto HumanJailbreak | > 92 % de no rechazo | No disponible |
| MMLU-Pro, rebanada de validación | 51/70 (igualado con el stock) | 51/70 |
| MMLU-Pro, rebanada held-out | 36/70 (igualado con el stock) | 36/70 |
| Puntuación declarada de "live-readiness" | 99,518, todas las compuertas en verdadero | No aplica |

No se han publicado resultados de otros benchmarks en la información disponible.

## Requisitos de hardware

- Pesos completos en bfloat16: aproximadamente 53,8 GB solo de pesos (calculado a partir de los 26,895B parámetros); el autor indica unos 50 GB de tamaño local aproximado. Requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto multi-GPU.
- GGUF Q8_0: 28,6 GB según el propio model card. Cabe en una RTX 4090 de 24 GB solo con descarga parcial a RAM/CPU; en GPUs de 32 GB o 48 GB (A6000, L40S, RTX 6000 Ada) entra completo.
- GGUF Q6_K: en torno a 22 GB estimados a partir del recuento de parámetros; al límite de una RTX 4090 de 24 GB con contexto corto.
- GGUF Q5_K_M: en torno a 18,7 GB estimados; cabe en RTX 4090, RTX 3090 y tarjetas de 24 GB dejando margen para contexto.
- GGUF Q4_K_M: en torno a 16,1 GB estimados; es el punto de entrada recomendado por el autor para ejecución local y cabe en GPUs de 24 GB e incluso en configuraciones de 16 GB con offload parcial de capas a CPU.
- Equipos sin GPU dedicada: viable con llama.cpp u Ollama usando CPU + RAM, a costa de latencia mucho mayor; se recomienda partir de Q4_K_M.
- Opciones de despliegue documentadas: Transformers, vLLM y TGI para los safetensors completos; llama.cpp, Ollama, LM Studio, Jan y KoboldCPP para los GGUF. El autor advierte que es necesario usar runtimes recientes y la plantilla de chat, no completado en crudo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Comportamiento de rechazo | Disponibilidad |
|---|---|---|---|---|---|
| minte1431/Qwen3.6-27B-OBLITERATED | 26,9B | No disponible | Apache 2.0 | 93,65 % de no rechazo en proxy HarmBench de 1.920 filas | Safetensors BF16 + GGUF Q4/Q5/Q6/Q8 |
| Qwen/Qwen3.6-27B (modelo base) | 26,9B | No disponible | Apache 2.0 | No disponible de forma numérica; se describe como "con rechazo integrado en el checkpoint" | Pesos originales en HuggingFace |
| Otras variantes abliterated/uncensored de la familia Qwen | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con el modelo base es la única respaldada por datos: en las dos rebanadas de MMLU-Pro reportadas, la versión obliterada queda exactamente igualada al stock (51/70 y 36/70), lo que sugiere que la ablación no degradó esa capacidad medida, aunque el tamaño de muestra es reducido. No se dispone de datos de rendimiento ni de licencia de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La ablación no elimina el rechazo por completo: el propio autor reconoce que queda "residuo", agrupado en bolsas identificables del espacio de prompts y no distribuido de forma aleatoria.
- La evidencia de capacidad retenida se limita a dos rebanadas pequeñas de MMLU-Pro (70 preguntas cada una, 51/70 y 36/70). No hay resultados de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones multilingües, por lo que la afirmación de "capacidad preservada" no está respaldada de forma amplia.
- Las cifras de no rechazo (95,84 %, 98,93 %, 93,65 %) proceden de corpus propios del autor y de un "proxy" tipo HarmBench, no de una ejecución oficial de HarmBench; conviene tratarlas como mediciones internas no auditadas por terceros.
- Riesgo de alucinación: no se publica ninguna medición de veracidad, factualidad o tasa de alucinación para este checkpoint.
- Un modelo con las barreras de rechazo reducidas puede generar contenido dañino, ilegal o que viole políticas de uso si se despliega sin filtrado adicional. La responsabilidad de moderación recae íntegramente en el operador.
- Idiomas soportados: no disponibles. No hay evidencia publicada sobre el comportamiento multilingüe de esta variante concreta.
- Longitud de contexto: no disponible en la información proporcionada; no se debe asumir un valor concreto sin consultar el modelo base.
- Sin soporte de visión ni de audio; es un checkpoint exclusivamente de texto.
- Tool calling, uso agéntico y modos de razonamiento extendido no están documentados, por lo que no deben presuponerse en producción.
- Licencia Apache 2.0 en el repositorio, lo que en principio permite uso comercial, pero la licencia del modelo base Qwen3.6-27B puede imponer condiciones adicionales que deben verificarse antes de un despliegue comercial.
- El repositorio presenta 0 descargas y 0 likes, con fecha de creación y actualización del 14 de septiembre de 2026; no existe validación independiente de la comunidad sobre este artefacto concreto.
- Tamaño del repositorio de 140,4 GB: el almacenamiento local necesario para clonar el conjunto completo (safetensors más toda la escalera GGUF) es considerable.
- El autor advierte que si el modelo carga pero se comporta de forma extraña, probablemente se esté usando completado en crudo en lugar de la plantilla de chat; y que los errores de arquitectura, tokenizador o plantilla se resuelven actualizando el runtime.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/minte1431/Qwen3.6-27B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- No se han encontrado en la búsqueda web enlaces relevantes al modelo (papers, blogs, repositorios o demos). Los resultados devueltos por la búsqueda corresponden a contenidos agrícolas sin relación con el modelo.
