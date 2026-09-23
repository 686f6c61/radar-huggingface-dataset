# agentionai/Qwen3.8-27B-AP-GGUF

## Resumen

Agention Precision GGUF es un paquete de cuantizaciones en formato GGUF del modelo Qwen3.8-27B, publicado por el usuario agentionai y derivado del checkpoint oficial Qwen/Qwen3.8-27B. El modelo base declara 27.320.697.856 parámetros (27,3B) y una ventana de contexto que la model card utiliza a 32k en sus estimaciones de memoria, aunque no especifica un máximo oficial. El repositorio ocupa 118,9 GB e incluye ocho variantes de pesos (de 10,00 a 16,35 GiB), además de un proyector visual mmproj-BF16.gguf de 0,87 GiB y una cabeza MTP (multi-token prediction) para decodificación especulativa.

La propuesta del autor no es mejorar el modelo, sino reducir la pérdida de fidelidad que introduce la cuantización. Frente a otras cuantizaciones públicas del mismo tamaño, estas variantes usan una asignación no uniforme de tipos por tensor y corrección de error de baja pérdida construida con un codificador propio, manteniendo tipos estándar de llama.cpp (sin fork ni flags adicionales). El autor publica mediciones de divergencia KL frente al modelo BF16 sobre tres corpus (prosa técnica no vista, web neutra y wikitext-2) y reporta mejoras de entre el 2,4% y el 10% según el nivel de cuantización respecto a las cuantizaciones equivalentes de Unsloth.

Es relevante ahora porque el pipeline declarado es image-text-to-text (visión) y el pack incluye tanto el proyector visual en BF16 como la cabeza de borrador MTP, lo que permite desplegar un modelo multimodal de 27B en GPUs de consumo (desde 12 GB) con decodificación especulativa, sin recompilar llama.cpp. La licencia es Apache 2.0, lo que facilita el uso comercial. El repositorio tiene 6 descargas y 11 likes en el momento de la consulta, por lo que se trata de una publicación reciente y con poca validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la topología del modelo base Qwen3.8-27B; indica que solo una cuarta parte de las capas usa atención completa) |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | no disponible (no se especifica si el modelo base es MoE) |
| Longitud de contexto | no disponible como máximo oficial; las estimaciones de la model card asumen 32k de contexto (≈1 GiB de KV cache en q8_0 en ese régimen) |
| Tipos de cuantización | AP-Q4_K_XL, AP-Q4_K_M, AP-IQ4_XS, AP-Q3_K_XL, AP-IQ3_S, AP-IQ3_XS, AP-IQ3_XXS (tipos estándar de llama.cpp) y proyector visual mmproj-BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) + mmproj-BF16.gguf para visión |
| Modelo base | Qwen/Qwen3.8-27B (relación: quantized) |
| Tamaño del repositorio | 118,9 GB |
| Pipeline declarado | image-text-to-text |
| Fecha de creación / actualización | 2026-09-22 / 2026-09-23 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B más allá de dos indicios aportados en la model card: que solo una cuarta parte de las capas emplea atención completa (lo que apunta a un esquema de atención híbrida con capas de atención lineal o eficiente) y que el pack incorpora una cabeza MTP (multi-token prediction) utilizable como borrador en decodificación especulativa. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO: esos datos corresponden al modelo original de Qwen y no se reproducen aquí.

Lo que sí se detalla es el proceso de cuantización, que es el objeto real de este repositorio. El autor convirtió Qwen3.8-27B a GGUF BF16 con el convertidor oficial de llama.cpp (checkpoint en la revisión `1d4bf0f2`, fichero resultante de 54.657.733.888 bytes) y construyó cada cuantización con un codificador propio que aplica asignación no uniforme de tipos por tensor y corrección de error de baja pérdida, apoyándose en matrices de importancia (etiqueta imatrix). Las mediciones se realizaron con llama.cpp en el commit `26bc85e42`, sin modificaciones en el código de KLD, usando `llama-perplexity` con `--kl-divergence-base`, ventana de 2048 y 60 fragmentos por corpus. El autor reporta que cada variante se validó sobre tres corpus: prosa técnica interna no vista (1,85 MB), web neutra (`mixedweb-v1`, 800.789 caracteres, md5 `51e0045e8cabf37922aa82766a25b7b4`) y wikitext-2 estándar (1.288.556 caracteres, md5 `7c0137fc034ddbc56a296bce31b4f7fb`).

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Procesamiento multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y se incluye el proyector visual de Qwen en BF16 (`mmproj-BF16.gguf`, 0,87 GiB).
- Decodificación especulativa mediante la cabeza MTP incluida en el pack, que actúa como modelo borrador sin necesidad de un segundo modelo externo.
- Compatibilidad con endpoints de inferencia, según la etiqueta `endpoints_compatible`.
- Integración directa con llama.cpp y su servidor, sin fork ni flags especiales.
- Contexto largo en la práctica: el autor indica que 32k de contexto consume aproximadamente 1 GiB de KV cache en q8_0, gracias a que solo una cuarta parte de las capas usa atención completa.
- Soporte de tool calling o function calling: no disponible (no documentado en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (el campo de idiomas está vacío en la información proporcionada).
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local de un asistente multimodal en una GPU de 24 GB: cargando `AP-Q4_K_XL` (16,35 GiB, ~18 GiB de VRAM a 32k) junto con `mmproj-BF16.gguf`, se obtiene un modelo de 27B con visión en una RTX 4090 o similar, sin tocar la configuración de llama.cpp.
- Sustitución directa de cuantizaciones existentes: al conservar tipos de tensor estándar y el mismo tamaño de fichero, se puede reemplazar un `UD-Q4_K_M` de Unsloth por `AP-Q4_K_M` sin cambiar el script de arranque, el consumo de memoria ni el rendimiento en tokens por segundo.
- Servicio conversacional con contexto largo en 16 GB: `AP-IQ4_XS` ocupa 13,27 GiB y requiere ~15 GiB, lo que permite mantener 32k de contexto en una GPU de 16 GB para análisis de documentación técnica extensa o resúmenes de repositorios completos.
- Análisis de documentos con imágenes: descripción de capturas de pantalla, extracción de información de diagramas o transcripción asistida de imágenes, aprovechando el codificador visual en BF16 y el contexto largo para procesar varias páginas en una misma conversación.
- Reducción de latencia en producción con decodificación especulativa: la cabeza MTP incluida permite generar varios tokens por paso sin cargar un modelo borrador separado, lo que resulta útil en servicios con muchos usuarios concurrentes y presupuesto de latencia ajustado.
- Inferencia en portátiles con GPU de 12 GB: `AP-IQ3_XS` (10,70 GiB, ~12,5 GiB de VRAM) o `AP-IQ3_XXS` (10,00 GiB, ~12 GiB) permiten ejecutar el modelo con ventanas de 8k a 16k en equipos tipo RTX 4070 Mobile o RTX 3060 de 12 GB, con una pérdida de fidelidad mayor pero controlada.
- Investigación en cuantización reproducible: el protocolo de medición está documentado con comandos exactos, revisiones de llama.cpp y corpus públicos con md5, de modo que un equipo puede replicar las cifras de KLD de web neutra y wikitext-2 y comparar sus propios encoders contra los de Agention Precision.
- Evaluación comparativa de packs GGUF: dado que el autor mide también las cuantizaciones de Unsloth, ISTA-DASLab y AtomicChat bajo el mismo protocolo, el repositorio sirve como referencia metodológica para decidir qué pack desplegar en función del tamaño de fichero.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.). Las únicas métricas publicadas son de fidelidad: divergencia KL de la distribución de siguiente token frente al modelo BF16, medida con `llama-perplexity` sobre 60 fragmentos de 2048 tokens en tres corpus. Valores más bajos indican mayor cercanía al modelo original.

Comparativa directa con las cuantizaciones de Unsloth, con tipos de tensor y tamaño de fichero idénticos:

| Variante | Held-out (KLD) | Web neutra (KLD) | Wikitext-2 (KLD) | Peor 1% de tokens (held-out) |
|---|---|---|---|---|
| UD-Q4_K_XL | 0,0117 | 0,0087 | 0,0122 | 0,088 |
| AP-Q4_K_XL | 0,0111 (−4,4%) | 0,0083 (−4,5%) | 0,0118 | 0,082 (−7,2%) |
| UD-Q4_K_M | 0,0153 | 0,0108 | 0,0139 | 0,122 |
| AP-Q4_K_M | 0,0146 (−4,9%) | 0,0104 (−3,7%) | 0,0150 | 0,111 (−8,8%) |
| UD-IQ4_XS | 0,0276 | 0,0186 | 0,0252 | 0,233 |
| AP-IQ4_XS | 0,0255 (−7,6%) | 0,0181 (−2,4%) | 0,0243 (−3,8%) | 0,211 (−9,3%) |
| UD-Q3_K_XL | 0,0421 | 0,0270 | 0,0337 | 0,366 |
| AP-Q3_K_XL | 0,0380 (−9,9%) | 0,0250 (−7,6%) | 0,0359 | 0,327 (−10,6%) |
| UD-IQ3_S | 0,0617 | 0,0404 | 0,0470 | 0,553 |
| AP-IQ3_S | 0,0568 (−7,9%) | 0,0384 (−5,0%) | 0,0528 (+12%) | 0,491 (−11,2%) |

El autor reporta significación estadística en las ganancias de held-out de 3,2σ, 3,2σ, 5,7σ, 8,1σ y 6,7σ para `Q4_K_XL`, `Q4_K_M`, `IQ4_XS`, `Q3_K_XL` e `IQ3_S` respectivamente, y describe wikitext-2 como un empate estadístico (por debajo de 1,5σ) en todos los niveles salvo `IQ3_S`, donde la variante AP empeora un 12%. Para los niveles `AP-IQ3_XS` y `AP-IQ3_XXS` el autor indica ganancias del 6-8% y del 12-25% frente a la mejor cuantización de investigación en ese rango de tamaño, con un 19% de mejora en wikitext-2 para `AP-IQ3_XS`, pero no publica la tabla de valores absolutos correspondiente en la información disponible.

## Requisitos de hardware

La model card estima la VRAM como pesos + KV cache en q8_0 + buffers de llama.cpp, asumiendo 32k de contexto salvo donde se indique.

| Fichero | Tamaño | VRAM a 32k | GPU que encaja | Ganancia declarada |
|---|---:|---:|---|---|
| AP-Q4_K_XL | 16,35 GiB | ~18 GiB | 24 GB | 4% más cercano a BF16; peor 1% de tokens 7% más cercano |
| AP-Q4_K_M | 15,33 GiB | ~17 GiB | 24 GB | 5% más cercano en texto técnico no visto; peor 1% 9% más cercano |
| AP-IQ4_XS | 13,27 GiB | ~15 GiB | 16 GB | 8% más cercano a BF16; peor 1% 9% más cercano |
| AP-Q3_K_XL | 12,24 GiB | ~14 GiB | 16 GB con contexto más largo | 10% más cercano en texto técnico no visto |
| AP-IQ3_S | 11,21 GiB | ~13 GiB | 16 GB a 8-16k | 8% más cercano en texto técnico, 5% en web; wikitext-2 12% peor |
| AP-IQ3_XS | 10,70 GiB | ~12,5 GiB | 12 GB a 8-16k | 6-8% más cercano que la mejor cuantización de investigación del tamaño; 19% en wikitext-2 |
| AP-IQ3_XXS | 10,00 GiB | ~12 GiB | 12 GB a 8-16k | 12-25% más cercano que la mejor cuantización de investigación de ~10 GiB |
| mmproj-BF16.gguf | 0,87 GiB | +0,9 GiB | cualquier nivel | codificador visual de Qwen en BF16 |

- Recomendación del autor: usar `AP-IQ4_XS` si cabe en memoria; bajar de nivel solo por limitación de VRAM.
- Cabe en GPU de consumo: sí, desde 12 GB (`AP-IQ3_XXS` y `AP-IQ3_XS` a contexto reducido), 16 GB (`AP-IQ4_XS`, `AP-Q3_K_XL`) y 24 GB (`AP-Q4_K_XL`, `AP-Q4_K_M`).
- GPU de datacenter (A100, H100) no son necesarias para una sola instancia, pero permitirían mayor contexto o lotes concurrentes.
- Opciones de despliegue documentadas: llama.cpp (`llama-perplexity`, servidor de llama.cpp) con tipos estándar, sin fork ni flags. Son igualmente aplicables las herramientas que importan GGUF estándar (por ejemplo Ollama o LM Studio), aunque la model card no las menciona explícitamente.
- Latencia y throughput: el autor afirma que la velocidad en tokens por segundo y el consumo de VRAM son idénticos a los de una cuantización del mismo tamaño y tipos equivalentes, pero no publica cifras concretas de tokens/s ni de latencia. No disponible.
- La KV cache es reducida para el tamaño del modelo: aproximadamente 1 GiB a 32k de contexto en q8_0, porque solo una cuarta parte de las capas usa atención completa.

## Comparativa con modelos similares

La comparación natural es contra otras cuantizaciones GGUF del mismo modelo base, ya que no se trata de un modelo distinto sino de un empaquetado alternativo de Qwen3.8-27B.

| Pack | Modelo base | Formato | Licencia | Tamaños disponibles | Fidelidad (KLD) frente a BF16 | Notas |
|---|---|---|---|---|---|---|
| Agention Precision (este repositorio) | Qwen3.8-27B | GGUF estándar + mmproj BF16 | apache-2.0 | 10,00-16,35 GiB (7 variantes) | Menor KLD que Unsloth en todos los niveles comparados, salvo wikitext-2 en IQ3_S | Incluye cabeza MTP y encoder propio |
| Unsloth (UD) | Qwen3.8-27B | GGUF estándar | apache-2.0 (heredada del base) | Q4_K_XL, Q4_K_M, IQ4_XS, Q3_K_XL, IQ3_S entre otros | Referencia de la comparativa; valores de KLD entre un 2,4% y un 10% superiores a AP | Pack de referencia en la comunidad |
| ISTA-DASLab | Qwen3.8-27B | GGUF | apache-2.0 (heredada del base) | no disponible | Medido con el mismo protocolo, sin tabla publicada en la información disponible | Citado como comparado en la metodología |
| AtomicChat | Qwen3.8-27B | GGUF | apache-2.0 (heredada del base) | no disponible | Medido con el mismo protocolo, sin tabla publicada en la información disponible | Citado como comparado en la metodología |

No se dispone de datos para comparar con modelos de otros linajes (por ejemplo alternativas de 27B-32B de otros fabricantes) porque la información proporcionada no incluye benchmarks de capacidad ni especificaciones de arquitectura del modelo base.

## Limitaciones y advertencias

- Las métricas publicadas miden fidelidad (divergencia KL de la distribución de siguiente token), no capacidad: no hay resultados de MMLU, HumanEval, GSM8K ni de tareas agénticas, de modo que no puede inferirse el rendimiento real en razonamiento, código o matemáticas a partir de estas cifras.
- El corpus "held-out" de prosa técnica es interno y no se publica, por lo que la columna con mayores ganancias (hasta un 10%) no es verificable de forma independiente. Solo web neutra y wikitext-2 son reproducibles con los datasets publicados.
- El nivel `AP-IQ3_S` empeora un 12% en wikitext-2 frente a `UD-IQ3_S`; el autor lo atribuye a un empate estadístico en los demás niveles, pero la regresión es un dato objetivo a tener en cuenta.
- Los niveles de 10-12 GiB (`AP-IQ3_XS`, `AP-IQ3_XXS`, `AP-IQ3_S`) requieren reducir el contexto a 8-16k en GPUs de 12-16 GB, lo que limita su uso en tareas de contexto largo.
- Las capacidades de visión exigen cargar `mmproj-BF16.gguf` de forma adicional; sin ese fichero el modelo funciona solo como texto.
- Alto riesgo de alucinación inherente a los modelos de lenguaje; a esto se suma la divergencia adicional respecto al BF16 del modelo original, que crece a medida que baja la precisión de la cuantización.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento, idiomas soportados ni salvaguardas de seguridad del modelo base. Cualquier despliegue en producción debería evaluar estos aspectos por separado.
- La licencia declarada del repositorio es Apache 2.0 y permite uso comercial, pero conviene verificar la licencia del checkpoint base Qwen/Qwen3.8-27B por separado, ya que la información proporcionada solo cubre la del repositorio de cuantizaciones.
- Adopción muy temprana: 6 descargas y 11 likes, sin validación independiente publicada. El autor es también el evaluador y el beneficiario de las métricas presentadas.
- La model card no especifica la arquitectura, el número de parámetros activos ni la longitud máxima de contexto del modelo base, lo que dificulta planificar despliegues con requisitos exactos de memoria o de ventana.
- Se recomienda no sustituir cuantizaciones en producción basándose únicamente en las cifras de KLD: conviene validar con un conjunto propio de tareas representativas del caso de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentionai/Qwen3.8-27B-AP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Corpus de fidelidad publicados por el autor: https://huggingface.co/datasets/agentionai/quant-fidelity-corpora
- Patrocinio del autor (GitHub Sponsors): https://github.com/sponsors/LaurentZuijdwijk
- llama.cpp (herramienta de conversión, cuantización e inferencia): repositorio oficial de ggerganov/llama.cpp, commit de construcción `26bc85e42` citado en la model card
- Script de descarga de wikitext-2: `llama.cpp/scripts/get-wikitext-2.sh`
