# Lerelou/Supra2-100M-Base-GGUF

## Resumen

Supra2-100M-Base es un modelo de lenguaje causal decoder-only de 100,7 millones de parámetros (75,5M no pertenecientes a embeddings) preentrenado desde cero por SupraLabs sobre 30.000 millones de tokens de texto web en inglés, lo que supone unas 300 tokens por parámetro. Usa la arquitectura Qwen3 (12 capas, hidden size 768, GQA con 12 cabezas de atención y 4 cabezas KV, SwiGLU, RMSNorm con QK-Norm y RoPE) con un tokenizador propio de 32.768 tokens. La ficha que nos ocupa, Lerelou/Supra2-100M-Base-GGUF, es una conversión a formato GGUF del modelo base original publicado en safetensors.

Se trata de un modelo estrictamente *base*: no ha pasado por instrucción, alineamiento ni ajuste conversacional, por lo que su comportamiento es el de un continuador de texto. Su interés es fundamentalmente de investigación y docencia: permite reproducir y estudiar recetas de preentrenamiento a pequeña escala (optimizador AdamW fusionado, schedule WSD con decaimiento `1-sqrt`, z-loss con coeficiente 1e-4) en una única GPU de consumo, en concreto una RTX 5090 de 32 GB. El contexto entrenado es de solo 1.024 tokens, ampliable en configuración hasta 2.048 sin verificar.

Es relevante ahora por dos motivos: por un lado, la familia Supra2 se posiciona como una línea abierta de modelos pequeños con licencia Apache 2.0 y pesos en abierto; por otro, el ecosistema de modelos de ~100M vive un renacer como base para experimentación barata, extracción de características y despliegue en dispositivos de borde. La conversión a GGUF facilita precisamente ese último escenario mediante llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only estilo Qwen3 (atención GQA, SwiGLU, RMSNorm con QK-Norm, RoPE θ=10.000, embeddings atados, sliding window desactivada, implementación de atención SDPA) |
| Parámetros totales | 100.684.032 (100,7M); 75,5M no pertenecientes a embeddings |
| Longitud de contexto | 1.024 tokens entrenados; 2.048 tokens como máximo en configuración (no probado según el autor) |
| Tipos de cuantización | No especificado en la información disponible: el repositorio es GGUF (etiqueta `quantized`) y ocupa 0,5 GB, pero no se detallan los ficheros ni los niveles concretos (Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | Inglés únicamente (`language: en`); el tokenizador es propio, de 32.768 tokens, sin datos publicados sobre cobertura multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo base SupraLabs/Supra2-100M-Base se distribuye en safetensors con precisión bfloat16 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Qwen3 en miniatura: 12 capas con hidden size 768, 12 cabezas de atención con 4 cabezas KV (GQA, head dim 64), tamaño intermedio SwiGLU de 2.048, vocabulario de 32.768 tokens, normalización RMSNorm con epsilon 1e-6 incluyendo QK-Norm, codificación posicional RoPE con theta 10.000 y embeddings atados entre entrada y salida. El modelo es denso, no MoE. La atención se implementa con SDPA y la ventana deslizante está desactivada, de modo que el coste de atención es cuadrático en la longitud de contexto.

El preentrenamiento consumió 30.000 millones de tokens con una mezcla del 70% de `HuggingFaceFW/fineweb-edu` (muestra `sample-350BT`, unos 21B de tokens) y un 30% de `HuggingFaceFW/dclm_100BT-shuffled` (unos 9B). Los documentos se tokenizaron con el tokenizador `supra2-tokenizer`, se concatenaron en un flujo plano `uint16` y se empaquetaron en bloques contiguos de 1.024 tokens sin relleno ni máscara de documento, por lo que algunas secuencias cruzan límites entre documentos. La receta emplea AdamW fusionado (β1=0,9, β2=0,95, ε=1e-8), pico de learning rate 1e-3, schedule WSD con decaimiento `1-sqrt` hasta cero, 114.000 pasos con batch micro de 16 y acumulación de gradiente de 16 (256 secuencias, 262.144 tokens por paso), weight decay 0,1, clipping de gradiente 1,0 y una pérdida auxiliar z-loss sin router con coeficiente 1e-4. Todo el entrenamiento se ejecutó con `torch.compile` en una única RTX 5090 de 32 GB. No se documenta ninguna fase de RLHF, DPO ni alineamiento posterior.

## Capacidades

- Generación de texto por continuación de prompt en inglés, con calidad propia de un modelo de ~100M entrenado con 30B tokens.
- Razonamiento y matemáticas elementales: no hay evaluación publicada de GSM8K ni de tareas aritméticas; los benchmarks publicados (PIQA, HellaSwag, ARC) sitúan el modelo en el rango de GPT-2 Small.
- Generación de código: no evaluado ni declarado por el autor; no debe asumirse capacidad relevante.
- Sin soporte funcional de tool calling ni de function calling. El tokenizador reserva los tokens especiales `<|im_start|>`, `<|im_end|>`, `<think>`, `<tool_call>` y `<|reserved_0..15|>`, pero el modelo nunca los ha visto durante el entrenamiento y no responden a ninguna semántica aprendida.
- Sin capacidades de agente ni de razonamiento multi-paso: al no estar ajustado por instrucciones, no sigue instrucciones ni mantiene planes.
- Multilingüe: no. Entrenado solo con datos en inglés.
- Visión y audio: no disponibles.
- Modo *thinking*: no disponible; la plantilla ChatML incluida es un marcador para futuros ajustes finos, no una capacidad operativa.

## Casos de uso

- Investigación en preentrenamiento a pequeña escala: el modelo permite replicar y hacer ablaciones sobre recetas completas (WSD, z-loss, GQA, empaquetado sin máscara de documento) con 30B tokens y una sola GPU de consumo, algo inviable con modelos de miles de millones de parámetros.
- Ajuste fino para clasificación o etiquetado: con 75,5M de parámetros no embeddings, un LoRA sobre las 12 capas cabe de sobra en una GPU de 8-12 GB; sirve para tareas como clasificación de tickets, detección de intención o moderación de texto en inglés, partiendo de un modelo ya expuesto a texto web diverso.
- Extracción de características y embeddings: la representación de 768 dimensiones por token y sus 12 capas permiten usar el modelo como extractor barato para clustering de documentos, deduplicación semántica o recuperación en un RAG ligero que se ejecute en CPU.
- Prototipado de autocompletado en local y en el borde: con cuantización, los pesos ocupan del orden de 60-110 MB, por lo que el modelo puede correr en una Raspberry Pi, en el navegador vía llama.cpp/WASM o en un portátil sin GPU, para demos de autocompletado o generación de descripciones cortas.
- Modelo de pruebas para pipelines de inferencia: su tamaño lo hace idóneo para validar integraciones de llama.cpp, Ollama o endpoints compatibles (la etiqueta `endpoints_compatible` así lo sugiere) sin consumir cuotas de GPU caras, y para medir el impacto de distintas cuantizaciones en la perplejidad.
- Docencia y divulgación: es un caso de estudio manejable para explicar atención con GQA, RoPE, embeddings atados, empaquetado de secuencias y el efecto de la cuantización sobre un transformer real.
- Modelo borrador para decodificación especulativa: solo sería viable si el modelo objetivo comparte el tokenizador `supra2-tokenizer` de 32.768 tokens; al ser un vocabulario propio, no es intercambiable con el tokenizador de Qwen ni con el de GPT-2, por lo que este uso queda condicionado a un target compatible.
- Generación de datos sintéticos de bajo coste o *smoke testing* de pipelines de entrenamiento: sirve para producir texto en inglés a gran escala y verificar el funcionamiento extremo a extremo de un flujo de datos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con EleutherAI LM-Eval Harness (acc_norm):

| Modelo | PIQA | HellaSwag | ARC-Easy | ARC-Challenge |
|---|---|---|---|---|
| Supra-50M-Base | 0,62 | 0,32 | 0,46 | 0,25 |
| Supra2-100M Base | 0,65 | 0,36 | 0,48 | 0,25 |
| BananaMind-2-Pro-Preview-EXP | 0,67 | 0,40 | 0,51 | 0,27 |
| GPT-X-125M | 0,65 | 0,37 | 0,51 | 0,25 |
| OpenAI GPT-2 Small | 0,62 | 0,31 | 0,39 | 0,22 |

Advertencia sobre esta tabla: las dos filas intermedias (`BananaMind-2-Pro-Preview-EXP` y `GPT-X-125M`) no corresponden a modelos identificables ni verificables públicamente, por lo que deben tomarse con cautela. La comparación con GPT-2 Small sí es trazable, aunque los valores de GPT-2 pueden variar según la versión del harness y la tokenización empleada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de perplejidad sobre un corpus de referencia en la información disponible. Tampoco se han publicado métricas de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 0,20 GB de pesos (100,7M × 2 bytes) más la caché KV. Con 12 capas, 4 cabezas KV y head dim 64, la caché KV ocupa unos 12 KB por token en bf16: unos 12,6 MB a 1.024 tokens y unos 25 MB a 2.048. En la práctica, menos de 1 GB contando overhead del runtime.
- VRAM en cuantización: del orden de 0,11 GB en 8 bits y 0,06-0,07 GB en 4 bits, más la caché KV.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso iGPU o CPU pura. No requiere A100 ni H100 para inferencia; el entrenamiento original cupo en una sola RTX 5090.
- Despliegue: llama.cpp y sus derivados (Ollama con un Modelfile, LM Studio, servidores compatibles con la API de OpenAI) son la vía natural para este repositorio GGUF. Para el modelo base en safetensors, Transformers con `AutoModelForCausalLM` en bf16, y vLLM o TGI si se necesita serving con batching (requieren pesos HF, no GGUF).
- Latencia y throughput: no disponibles, no hay mediciones publicadas. Al tratarse de un modelo de ~0,2 GB, la inferencia está limitada por ancho de banda de memoria más que por cómputo, y el coste por token es despreciable frente a modelos de 7B o superiores; cualquier cifra concreta requeriría medirse en el hardware objetivo.
- Nota de calidad de servicio: la ventana de 1.024 tokens limita los lotes en producción; peticiones más largas degradarán la coherencia aunque el runtime las acepte.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Idiomas | Formatos |
|---|---|---|---|---|---|---|
| Supra2-100M-Base (GGUF) | 100,7M | 1.024 (2.048 en config, no probado) | 30B | Apache 2.0 | Inglés | GGUF; safetensors en el base |
| OpenAI GPT-2 Small | 124M | 1.024 | No disponible oficialmente (WebText, ~40 GB) | MIT (licencia modificada) | Inglés | Conversiones a safetensors y GGUF |
| EleutherAI Pythia-160M | 160M | 2.048 | 300B (The Pile) | Apache 2.0 | Inglés | Safetensors; GGUF de la comunidad |
| HuggingFace SmolLM2-135M | 135M | 8.192 | Del orden de 2 billones | Apache 2.0 | Principalmente inglés | Safetensors; GGUF de la comunidad |

Lectura de la comparativa: Supra2-100M es el más pequeño del grupo y el que menos tokens ha visto (30B frente a los 300B de Pythia-160M o los ~2T de SmolLM2-135M), pero también el único con tokenizador propio de 32.768 tokens y arquitectura Qwen3 moderna (GQA, QK-Norm). Frente a SmolLM2-135M pierde claramente en ventana de contexto (1.024 frente a 8.192) y en volumen de datos. La comparación de rendimiento entre estos modelos no está disponible de forma homogénea: los benchmarks del autor usan LM-Eval Harness con `acc_norm`, pero no se aportan resultados de Pythia-160M ni de SmolLM2-135M medidos con la misma configuración.

## Limitaciones y advertencias

- Es un modelo base sin alineamiento: no sigue instrucciones, no responde a preguntas de forma útil y no debe desplegarse como asistente conversacional.
- La plantilla ChatML y los tokens especiales (`<|im_start|>`, `<|im_end|>`, `<think>`, `<tool_call>`) están presentes en el tokenizador pero nunca se vieron en entrenamiento; aplicarlos produce salidas sin sentido. El propio autor lo advierte.
- Contexto efectivo de 1.024 tokens. La extensión a 2.048 es solo un valor de configuración y el autor la marca como no probada; no hay garantía de calidad más allá de 1.024.
- Solo inglés. Cualquier uso en castellano u otros idiomas producirá resultados degradados, aunque la tokenización no falle de forma explícita.
- Riesgo alto de alucinación y de digresiones: con 100M de parámetros y texto web como única fuente, el modelo encadena frases plausibles sin anclaje factual. En la muestra publicada se observan repeticiones literales de frases.
- Sesgos heredados de fineweb-edu y dclm: sesgos de género, culturales y de representación propios del texto web filtrado en inglés, sin ninguna mitigación posterior.
- Empaquetado sin máscara de documento: algunas secuencias de entrenamiento cruzan fronteras entre documentos, lo que puede producir continuaciones que mezclan temas o estilos.
- El repositorio GGUF no documenta qué niveles de cuantización contiene ni sus métricas de degradación; el autor del GGUF no es el autor del modelo original (Lerelou frente a SupraLabs), por lo que conviene verificar la conversión antes de usarla en producción. A fecha de los datos, el repositorio registra 0 descargas y 0 likes, es decir, no hay validación comunitaria.
- Inconsistencia documental: los ejemplos de código del README apuntan a `SupraLabs/Supra2-100M`, que no coincide exactamente con el identificador del modelo base declarado (`SupraLabs/Supra2-100M-Base`).
- La tabla de benchmarks incluye modelos de comparación no verificables, por lo que las conclusiones de "estado del arte" que sugiere el autor no están respaldadas.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero al ser un modelo base sin alineamiento, el cumplimiento y la seguridad de cualquier producto derivado recaen por completo en quien lo despliega.
- La búsqueda web realizada no ha devuelto ninguna fuente independiente sobre este modelo; toda la información procede de la model card del autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Lerelou/Supra2-100M-Base-GGUF
- Modelo base: https://huggingface.co/SupraLabs/Supra2-100M-Base
- Dataset de preentrenamiento (70%): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de preentrenamiento (30%): https://huggingface.co/datasets/HuggingFaceFW/dclm_100BT-shuffled
- llama.cpp (runtime indicado por las etiquetas del repositorio): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo oficial: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió enlaces relevantes sobre el modelo (únicamente resultados no relacionados).
