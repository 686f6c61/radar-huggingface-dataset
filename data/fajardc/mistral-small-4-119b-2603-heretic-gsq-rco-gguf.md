# fajardc/Mistral-Small-4-119B-2603-heretic-GSQ-RCO-GGUF

## Resumen

Mistral-Small-4-119B-2603-heretic es una versión "abliterada" del modelo Mistral-Small-4-119B-2603 de Mistral AI, un transformer de arquitectura `mistral4` con mezcla de expertos (MoE) de 118.972.826.624 parámetros totales y 6.500 millones de parámetros activos por token. El modelo original acepta texto e imágenes, dispone de modos instruct y razonamiento, y tiene una ventana de contexto de 262.144 tokens. La versión heretic se generó con la herramienta Heretic v1.2.0 mediante ablación direccional: se resta una "dirección de rechazo" por capa de lo que las capas de atención escriben en el flujo residual, lo que elimina la mayor parte de las negativas del modelo original.

Esta ficha corresponde a una cuantización GGUF concreta publicada por el usuario fajardc, no a un modelo oficial. Se trata de una cuantización de precisión mixta de 52,08 GB (48,50 GiB) que aplica la metodología GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization) del DAS Lab del IST Austria, con un presupuesto de 3,502 bits por peso sobre el conjunto del archivo. Cada tensor recibe el tipo que RCO le asigna, desde IQ2_XS hasta Q6_K, en lugar de un IQ3_S uniforme.

El interés de esta publicación es doble: por un lado, permite ejecutar un MoE de 119B parámetros con 6,5B activos en hardware de consumo mediante llama.cpp; por otro, documenta con precisión el proceso de cuantización y el efecto de la ablación sobre el modelo (solo 33 tensores difieren del original, cada uno con un cambio de rango uno de entre el 2 y el 3 % de su norma). Es una publicación personal, hecha en un equipo de escritorio, no un lanzamiento oficial de Mistral AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `mistral4`: transformer MoE con multi-head latent attention (MLA), 36 capas, 128 expertos, 4 activos + 1 compartido |
| Parametros totales | 118.972.826.624 |
| Parametros activos | 6.500 millones por token |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | GGUF de precisión mixta, presupuesto 3,502 bpw; tipos por tensor entre IQ2_XS y Q6_K (no es un IQ3_S uniforme) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, dividido en dos archivos: `-00001-of-00002.gguf` (26,96 GB) y `-00002-of-00002.gguf` (25,12 GB) |

## Arquitectura y entrenamiento

La arquitectura es `mistral4`, un transformer con mezcla de expertos de 36 capas que emplea multi-head latent attention (MLA) y 128 expertos por capa, de los cuales 4 están activos más 1 compartido. El modelo procesa texto e imágenes (pipeline `image-text-to-text`) y ofrece modos instruct y razonamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

La innovación técnica de esta publicación no está en el modelo base sino en el pipeline de cuantización. GSQ refina los códigos enteros de cada tensor dentro de su tipo GGUF contra las entradas reales que ese tensor recibe; RCO elige un tipo por tensor bajo un presupuesto exacto de tamaño minimizando la divergencia KL de la salida del modelo completo respecto del modelo en BF16; y un ajuste de extremo a extremo posterior ajusta los valores que GSQ y RCO dejan continuos (escalas de bloque, normas y routers) manteniendo fijos todos los códigos enteros y todos los tipos. El modelo heretic se obtuvo por ablación direccional: solo los 33 `o_proj` de las capas 3 a 35 difieren del checkpoint de Mistral, cada uno por un cambio de rango uno de entre el 2 y el 3 % de su norma; los otros 582 tensores del modelo de lenguaje, la torre de visión, el proyector y el tokenizer son idénticos bit a bit a los de Mistral.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento en modo explícito (el modelo base dispone de modos instruct y reasoning).
- Procesamiento de imágenes: el modelo incluye torre de visión y proyector, aunque este archivo GGUF contiene solo el modelo de lenguaje y requiere un `mmproj` aparte.
- Capacidades de código y matemáticas: no se detallan en la información disponible.
- Tool calling y function calling: no se documenta explícitamente en la información disponible.
- Uso como agente y razonamiento multi-paso: no se documenta explícitamente.
- Capacidades multilingües: no disponibles.
- Ausencia de la mayor parte de los rechazos del modelo original: 19 de 100 prompts dañinos generan respuesta, frente a 98 del modelo original.

## Casos de uso

- Investigación en seguridad e interpretabilidad: el modelo permite estudiar qué rechazos elimina la ablación direccional y cómo se distribuyen en las capas, comparando los 33 tensores modificados con los del checkpoint original. Es el uso principal declarado por el autor.
- Red teaming y evaluación de salvaguardas: sirve como modelo de referencia "sin alineamiento" para medir la robustez de clasificadores de contenido, filtros de moderación y sistemas de detección de prompts dañinos frente a un modelo que sí responde.
- Investigación sobre cuantización extrema: al publicarse con tipos por tensor entre IQ2_XS y Q6_K y un presupuesto exacto de 3,502 bpw, permite evaluar empíricamente el compromiso entre tamaño y fidelidad de salida (divergencia KL respecto de BF16) en un MoE de 119B.
- Despliegue local de un MoE grande en hardware de consumo: con 6,5B parámetros activos y 52 GB de pesos, un equipo con 64 GB de RAM y GPUs de 24 GB y 8 GB puede ejecutarlo en llama.cpp con offload parcial, como hizo el autor.
- Experimentos de razonamiento con contexto largo: la ventana de 256k tokens permite tareas de análisis de documentos extensos, resumen de corpus grandes o razonamiento sobre múltiples fuentes en una sola pasada.
- Trabajo legítimo bloqueado por los rechazos del modelo original: el autor lo publica también para casos donde las negativas de Mistral interfieren con tareas válidas, como análisis de contenido sensible en investigación académica o periodística, siempre con las salvaguardas adecuadas.
- Procesamiento de documentos con imágenes: cargando un `mmproj` compatible, puede emplearse para extracción de información de capturas, formularios escaneados o gráficos combinados con texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo de evaluación es la tasa de rechazo: 19 de 100 prompts dañinos generan respuesta en esta versión heretic, frente a 98 de 100 en el modelo original de Mistral.

## Requisitos de hardware

- VRAM/RAM: los pesos ocupan 52,08 GB (48,50 GiB) en el archivo GGUF. Con overhead de contexto y caché KV para 256k tokens, el requisito real es considerablemente mayor; el autor lo ejecutó con 64 GB de RAM de sistema más una RTX 3090 (24 GB) y una RTX 3070 Ti (8 GB), con offload parcial a CPU.
- GPU recomendadas: para carga completa en GPU hacen falta al menos 48 GB de VRAM (A6000, L40S, A100 80 GB, H100). Con 24 GB (RTX 3090, RTX 4090) es posible con offload parcial de capas a RAM.
- Cabe en GPU de consumo: sí, en RTX 3090 o RTX 4090 con offload parcial a RAM del sistema; no cabe entero en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con detección automática del segundo archivo). Para visión, cargar un `mmproj` compatible, por ejemplo el `mmproj-mistralai_Mistral-Small-4-119B-2603-bf16.gguf` de bartowski. vLLM, TGI u Ollama no están documentados para este archivo en la información disponible.
- Decodificación especulativa: el modelo no tiene cabeza MTP. Mistral publica una cabeza EAGLE separada para el modelo original, pero llama.cpp no la carga según el autor en el momento de la publicación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mistral-Small-4-119B-2603-heretic GSQ-RCO (esta ficha) | 119B | 6,5B | 256k | Apache 2.0 | GGUF mixto 3,502 bpw | Abliterado, 52,08 GB, visión requiere mmproj aparte |
| mistralai/Mistral-Small-4-119B-2603 | 119B | 6,5B | 256k | Apache 2.0 | safetensors (BF16) | Modelo original con rechazos intactos; referencia de fidelidad |
| darkc0de/Mistral-Small-4-119B-2603-heretic | 119B | 6,5B | 256k | Apache 2.0 | safetensors | Checkpoint heretic sin cuantizar, base de esta publicación |
| fajardc/Mistral-Small-4-119B-2603-GSQ-RCO-GGUF | 119B | 6,5B | 256k | Apache 2.0 | GGUF mixto 3,502 bpw | Misma cuantización sobre el modelo original, con rechazos |

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad efectivo: la ablación elimina la mayor parte de los rechazos, incluidos los de peticiones dañinas. Los 19 rechazos que quedan no constituyen un mecanismo de seguridad.
- Riesgo alto de contenido falso, ofensivo, peligroso o ilegal en la jurisdicción del usuario. No debe exponerse al público ni a menores sin moderación, filtrado y control de acceso.
- Sesgos: no documentados en la información disponible, pero heredados del modelo base de Mistral y no corregidos por la ablación.
- Alucinación: no se han publicado evaluaciones de fidelidad factual para esta versión; la ablación puede alterar el comportamiento del modelo más allá de los rechazos.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Visión no incluida en el archivo: requiere un `mmproj` externo compatible. Sin él, el pipeline `image-text-to-text` no funciona.
- Cuantización agresiva: 3,502 bpw con tensores desde IQ2_XS implica pérdida de calidad respecto de BF16, especialmente en las capas con tipos más bajos; no se han publicado métricas de degradación.
- Publicación personal sin garantías: hecha en hardware de escritorio, no es un lanzamiento oficial de Mistral AI, del IST Austria ni de los autores de Heretic. Se ofrece "tal cual", sin garantía, conforme a las secciones 7 y 8 de Apache 2.0.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el despliegue y las salidas.
- Sin cabeza MTP: la decodificación especulativa con EAGLE no está disponible en llama.cpp según el autor.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/fajardc/Mistral-Small-4-119B-2603-heretic-GSQ-RCO-GGUF
- Modelo base heretic: https://huggingface.co/darkc0de/Mistral-Small-4-119B-2603-heretic
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Cuantización GSQ-RCO del modelo original: https://huggingface.co/fajardc/Mistral-Small-4-119B-2603-GSQ-RCO-GGUF
- Referencia de la metodología GSQ-RCO del ISTA DAS Lab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Heretic (herramienta de ablación direccional): https://github.com/p-e-w/heretic
- Cabeza EAGLE del modelo original: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603-eagle
- GGUF de bartowski con `mmproj` para visión: https://huggingface.co/bartowski/mistralai_Mistral-Small-4-119B-2603-GGUF
- Paper referenciado (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper referenciado (arxiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arxiv:2605.00649): https://arxiv.org/abs/2605.00649
