# jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2

## Resumen

Swift 1.5 Qwen3.8-27B Uncensored, en su variante ATX AI2, es una cuantización GGUF de muy baja precisión (2,319 bits por peso) del checkpoint BF16 `d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16`, publicada por el usuario jakeatx. El modelo base es un derivado de Qwen3.8-27B, con la censura reducida mediante técnicas de abliteration y refinado por UkisAI como Swift 1.5. Esta build concreta está pensada para ejecutar un modelo de 27.000 millones de parámetros en tarjetas de gama alta con memoria limitada, empleando un formato propietario denominado AI+ que asigna entre 2 y 5 bits a cada tensor según su importancia.

La innovación principal es doble: por un lado, un plan de bits heterogéneo con un tipo fraccional de 2,5 bits (id 118) y una capa MTP (multi-token prediction) incluida en el propio GGUF para decodificación especulativa; por otro, un paso de "healing" posterior a la codificación en el que solo se ajustan las escalas fp16 y los pesos RMSNorm (unos 28,6 millones de valores sobre 27.000 millones) para minimizar la divergencia respecto al BF16 de referencia. El resultado es un archivo de 9,14 GB que reduce el KLD agrupado de 0,0676 a 0,0594.

Es relevante porque demuestra que una cuantización de 2,3 bpw con MTP integrado puede acercarse al rendimiento de codificación de builds de 4,5 bpw en LiveCodeBench (84,3 % frente a 89,25 %), a costa de requerir un runtime no estándar (llamAmpere ≥ v0.6.2) y de renunciar al tower de visión. No obstante, el propio autor advierte que la mejora frente a su build anterior de 2,3 bits no es estadísticamente significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), con capa MTP para decodificación especulativa |
| Parametros totales | 27 000 millones (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | hasta 262 144 tokens por slot en la configuración de referencia (2 slots paralelos, `-c 524288`); depende del runtime y la VRAM |
| Tipos de cuantizacion | GGUF con formato AI+ propietario: 2, 2,5, 3, 4 y 5 bits por tensor; media de 2,319 bpw en modelo principal, cabeza de salida y capa MTP; embeddings en Q8_0; KV cache en 4 bits (`sjkvarn4`) |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License 1.0 (heredada de Swift 1.5; incluye LICENSE, LICENSE-APACHE-2.0 y NOTICE) |
| Formato de pesos | GGUF (fichero `qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2.gguf`, 9 138 303 264 bytes, SHA-256 `d4b73c62641f83aa3f742b683d89b9285d36b434dc1f1aeac931a6ef6af91c20`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27.000 millones de parámetros derivado de Qwen3.8-27B, sobre el que UkisAI aplicó un proceso de reducción de rechazos (abliteration) para obtener Swift 1.5. La build ATX AI2 no reentrena el modelo: parte del checkpoint BF16 de d0xin y lo recodifica tensor a tensor con un plan de bits heterogéneo (2, 2,5, 3, 4 o 5 bits según la sensibilidad de cada tensor), sin incorporar pesos de otras builds como la de Mirai. La tabla de embeddings de tokens (1,35 GB) se almacena en Q8_0 y reside en RAM del sistema, por lo que no computa en la media de 2,319 bpw. El GGUF incluye también la capa MTP (draft layer) para decodificación especulativa, pero no el tower de visión.

Tras la codificación se aplicó un "healing" corto y acotado: los códigos cuantizados permanecen congelados y solo se ajustan las escalas fp16 ya presentes en el archivo y los pesos RMSNorm (aproximadamente 28,6 millones de valores), minimizando la divergencia entre activaciones y probabilidades de salida respecto al BF16. El texto de calibración fue reducido y mixto: prompts propios en tres familias (codificación, investigación agéntica y lectura tipo retrieval) respondidos por el BF16, más una muestra de FineWeb-Edu, WikiText-103 y preguntas de GSM8K; se excluyeron problemas de LiveCodeBench y el texto de test KLD, y se reservó un 10 % para parada temprana. No se trata, por tanto, de un post-entrenamiento de codificación. El healing redujo el KLD de 0,0676 a 0,0594 (un 12 % menos) sin alterar tamaño, layout de tensores ni velocidad.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Generación de código: la model card reporta 84,3 % estricto en LiveCodeBench v6 (100 problemas, 3 ejecuciones, temperatura 1,0, esfuerzo de razonamiento xhigh).
- Modo de razonamiento extendido: la configuración de referencia usa `reasoning effort xhigh`, lo que sugiere soporte de cadenas de pensamiento largas.
- Decodificación especulativa mediante capa MTP integrada (`--spec-type draft-mtp-adaptive`, `--spec-mb-mtp`).
- Comportamiento "uncensored" / refusal-reduced: menor tendencia a rechazar peticiones que el modelo base original.
- Soporte de plantillas Jinja (`--jinja`) para formateo de chat.
- Capacidades agénticas: el conjunto de calibración incluye texto de "investigación agéntica", y los benchmarks se miden sobre tareas de código y agente.
- Capacidad de visión: no incluida en este GGUF (el tower de visión no está en el archivo).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Evaluación de cuantizaciones extremas en investigación: sirve como referencia para estudiar cómo afecta un plan de bits heterogéneo de 2,3 bpw a la calidad frente al BF16, usando las métricas KLD y LiveCodeBench publicadas y el dataset de resultados por problema.
- Despliegue de un modelo de 27B en GPU de 48 GB con contexto muy largo: la configuración de referencia permite dos slots paralelos de 262 144 tokens cada uno, útil para procesar documentos extensos o conversaciones multi-turno muy largas en una sola A6000 o similar.
- Generación de código asistida en local: con 84,3 % en LiveCodeBench v6, es adecuado para autocompletado y resolución de problemas algorítmicos en entornos sin conexión, siempre que se acepte el runtime llamAmpere.
- Investigación sobre alineación y censura: al ser una variante abliterated, permite estudiar el comportamiento del modelo ante prompts que el base rechazaría, con fines de análisis de sesgos y seguridad.
- Servicio de inferencia con decodificación especulativa: la capa MTP integrada acelera la generación en GPUs Ampere (RTX 30-series), útil para prototipos de asistentes conversacionales de baja latencia.
- Reproducción de benchmarks de cuantización: el dataset `...-LCB-KLD` permite replicar y auditar los resultados por problema y por posición, útil para validar metodologías de evaluación de GGUF.
- Fine-tuning o destilación sobre un modelo pequeño en disco: los 9,14 GB del archivo facilitan su transporte y su uso como profesor o alumno en pipelines de destilación con recursos limitados.

## Benchmarks y rendimiento

Calidad frente al modelo BF16 (KLD, menor es mejor; 16 200 posiciones de token, peso equitativo entre código, agéntico y retrieval):

| Modelo | KLD agrupado | Código | Agéntico | Retrieval |
|---|---|---|---|---|
| Este modelo (ATX AI2, 2,3 bpw) | 0,0594 | 0,0628 | 0,0686 | 0,0467 |
| Mirai S, 2,4 bits (port comunitario de llama.cpp) | 0,0745 | 0,0734 | 0,0844 | 0,0657 |
| Build anterior de 2,3 bits del autor (plan de bits distinto) | 0,0794 | 0,0837 | 0,0899 | 0,0646 |

LiveCodeBench v6 (100 problemas, 3 ejecuciones, temperatura 1,0, reasoning effort xhigh, sin tope de salida salvo la ventana de contexto):

| Evaluador | Puntuación |
|---|---|
| Estricto (mismo evaluador que resultados previos) | 84,3 % (253/300) |
| Corregido (acepta formas alternativas correctas en problemas con juez especial) | 88,3 % (265/300) |

Referencias del autor: su build Swift IQ4_XS-M de 4,56 bpw obtuvo 89,25 % en los mismos problemas, y Qwen publica 90,3 % para el BF16. La build de 2,3 bits deprecada reportó 77,7 % agrupado sobre 7 ejecuciones en tarjetas de 12 GB, pero no es una comparación emparejada. Frente a la build previa de 2,3 bits (82,7 %), la diferencia es de +1,7 puntos (rango del 95 %: −1,7 a +5,0; p emparejado = 0,46), no significativa. Frente a una build anterior de 2,3 bits (75,3 %), la mejora es de +9,0 puntos (p = 0,003). Nueve de las 300 respuestas alcanzaron el límite de longitud y cuentan como fallos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 9,14 GB; la tabla de embeddings (1,35 GB, Q8_0) reside en RAM del sistema. Con KV cache en 4 bits y contexto de 262 144 tokens por slot, el autor empleó una tarjeta de 48 GB para dos slots paralelos. Para contextos menores, la VRAM necesaria se reduce proporcionalmente al tamaño de la KV cache.
- GPU recomendadas: NVIDIA Ampere (RTX 30-series) es el objetivo del runtime llamAmpere. El autor midió los benchmarks en una tarjeta de 48 GB (A6000 o similar). No se ha publicado una configuración probada para tarjetas de 12 GB con este archivo.
- ¿Cabe en GPU de consumo? El tag `12gb` sugiere que el archivo está pensado para caber en 12 GB, pero el autor indica explícitamente que no ha publicado una configuración probada para 12 GB con este fichero.
- Opciones de despliegue: llama-server de llamAmpere v0.6.2 o posterior (versión pendiente de publicación). llamAmpere v0.6.1.1 y anteriores rechazan el archivo por el tipo de tensor 118 (2,5 bits). llama.cpp estándar tampoco lo carga.
- Configuración de referencia del autor: `llama-server -m ... -c 524288 --parallel 2 -b 4096 -ub 1024 -ngl 99 -fa on -fit off --no-context-shift --cache-ram 0 --jinja -ctk sjkvarn4 -ctv sjkvarn4 --spec-type draft-mtp-adaptive --spec-draft-n-min-adaptive 3 --spec-draft-n-max 3 --spec-draft-p-min 0 --spec-mb-mtp`.
- Latencia y throughput: no disponibles de forma numérica; el uso de MTP con `--spec-draft-n-max 3` indica decodificación especulativa de hasta 3 tokens por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad | Licencia | Runtime |
|---|---|---|---|---|---|
| Este modelo (ATX AI2, 2,3 bpw) | ~27B | hasta 262 144 por slot (config. de referencia) | KLD 0,0594; LCB v6 84,3 % estricto | Swift Open License 1.0 | llamAmpere ≥ v0.6.2 |
| Mirai S, 2,4 bits (port comunitario) | no disponible | no disponible | KLD 0,0745 | no disponible | llama.cpp (solo KV fp16) |
| Build anterior del autor, 2,3 bits | ~27B | no disponible | KLD 0,0794; LCB v6 82,7 % | Swift Open License 1.0 | llamAmpere |
| Swift IQ4_XS-M, 4,56 bpw (mismo autor) | ~27B | no disponible | LCB v6 89,25 % | Swift Open License 1.0 | llama.cpp |
| Qwen3.8-27B BF16 (referencia) | ~27B | no disponible | LCB v6 90,3 % | no disponible | llama.cpp estándar |

## Limitaciones y advertencias

- Requiere un runtime no estándar: llamAmpere v0.6.2 o posterior, aún pendiente de publicación en el momento de redactar la model card. Ni llama.cpp estándar ni versiones anteriores de llamAmpere cargan el archivo.
- El formato AI+ es propietario e incluye un tipo de tensor fraccional (id 118, 2,5 bits) que no es interoperable con el ecosistema GGUF convencional (Ollama, vLLM, TGI, llama.cpp estándar).
- No incluye el tower de visión: las capacidades multimodales del modelo base no están disponibles en este GGUF.
- La mejora frente a la build anterior de 2,3 bits no es estadísticamente significativa en LiveCodeBench (p = 0,46); el autor la presenta como su mejor build de 2,3 bits por KLD y LCB, pero no puede separarla de la anterior solo con LCB.
- El KLD compara cada cuantización con su propio BF16 de origen, por lo que mide deriva de cuantización, no calidad del modelo base.
- El "healing" se entrenó con un conjunto de calibración pequeño y mixto; el autor lo describe como no equivalente a un post-entrenamiento de codificación, lo que limita el riesgo de sobreajuste a benchmarks pero también el alcance de la mejora.
- Modelo "uncensored" / abliterated: puede producir contenido que el modelo base rechazaría; requiere filtros y políticas de uso adicionales en producción.
- Licencia Swift Open License 1.0 (no Apache 2.0 pese a incluir un archivo LICENSE-APACHE-2.0); es necesario revisar los términos para uso comercial.
- Idiomas soportados no documentados en la información disponible.
- No hay configuración probada publicada para tarjetas de 12 GB, pese al tag `12gb`.
- Sesgos y riesgo de alucinación: no documentados específicamente en la información disponible; son heredados del modelo base y de la reducción de rechazos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2
- Modelo base (BF16): https://huggingface.co/d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16
- Swift 1.5 original de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Dataset de resultados LCB/KLD: https://huggingface.co/datasets/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2-LCB-KLD
- Build anterior deprecada: https://huggingface.co/jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.3bpw-MTP-GGUF
- Runtime llamAmpere: no disponible en la información proporcionada (referenciado como llamAmpere v0.6.2)
