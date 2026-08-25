# Nam-toon-studio/sahaj-30m

## Resumen

Sahaj-30M es un modelo de lenguaje causal de 30 millones de parámetros desarrollado por Gurpreet Singh Dhillon (Toon Studio / AMRIT Research) y publicado en Hugging Face bajo licencia MIT. Su principal innovación es operar directamente sobre bytes UTF-8 sin tokenizador tradicional (BPE o SentencePiece), lo que elimina el problema de vocabulario fuera de cobertura y permite manejar cualquier idioma o script de forma universal. Está entrenado desde cero con una arquitectura híbrida que combina atención lineal recurrente (estilo RetNet/GLA) con Grouped Query Attention (GQA) y activaciones SwiGLU, logrando una alta eficiencia paramétrica y una generación muy rápida.

El modelo está orientado principalmente al punjabi y al inglés, aunque su diseño byte-level le permite procesar cualquier texto. Con una ventana de contexto de 512 bytes (escalable), es un modelo pequeño pensado para tareas de generación de texto, razonamiento sintético, matemáticas y código, con un rendimiento notable en compresión (bits por byte) para su tamaño. Su relevancia radica en demostrar que arquitecturas lineales recurrentes pueden competir con transformers clásicos en modelos compactos, y en ofrecer una alternativa sin tokenizador para lenguas con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetNet/GLA causal fast weights + GQA, SwiGLU, RMSNorm, RoPE, byte-level |
| Parametros totales | 30.072.960 (30,07M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 bytes (escalable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | punjabi (pa), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

Sahaj-30M emplea una arquitectura de lenguaje causal basada en atención lineal recurrente por bloques (chunked linear-attention fast-weights, estilo RetNet/GLA) en lugar del mecanismo de atención softmax tradicional. Esta elección permite mantener un estado recurrente compacto entre bloques sin fuga causal (verificada con 0,0 de fuga en perturbaciones multi-paso). Además incorpora Grouped Query Attention (GQA) con 8 cabezas de consulta y 2 de clave/valor, lo que reduce el ancho de banda de memoria durante la inferencia. El núcleo del transformer incluye FFN SwiGLU con dimensión 2048, RMSNorm (eps=1e-6), embeddings rotatorios (RoPE) y embeddings de entrada/salida atados.

El modelo se entrena desde cero (scratch-trained) sobre bytes UTF-8 crudos, con un vocabulario de 256 tokens (bytes). No utiliza tokenizador, lo que elimina cualquier cuello de botella de vocabulario y permite manejar cualquier script. El entrenamiento incluye un mecanismo de "Latent Vichar Reasoning Loops" que permite iteraciones de razonamiento latente adaptativas por token (con verificación dinámica de convergencia) para problemas matemáticos y lógicos. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto causal a nivel de byte, sin tokenizador, capaz de procesar cualquier idioma o script (incluidos punjabi, inglés, código y matemáticas).
- Razonamiento sintético y lógico con alta coherencia, gracias a los bucles de razonamiento latente adaptativos.
- Razonamiento matemático y aritmético, con soporte para operaciones cuantitativas.
- Generación de código con representación de estructura sintáctica.
- Procesamiento multilingüe universal al operar sobre bytes UTF-8, sin vocabulario fijo.
- Compresión eficiente de texto (bits por byte) en dominios variados, lo que indica buena modelización del lenguaje.
- No se mencionan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Generación de texto en punjabi: el modelo puede producir texto en gurmukhi (escritura punjabi) de forma directa, útil para aplicaciones de contenido local, chatbots o asistentes en esta lengua, gracias a su procesamiento byte-level sin tokenizador.
- Prototipado rápido de modelos de lenguaje: al ser extremadamente pequeño (30M) y ligero, sirve como base para experimentar con arquitecturas lineales recurrentes y técnicas de entrenamiento sin tokenizador en entornos de investigación o educación.
- Compresión de texto y modelado de lenguaje: su bajo BPB en punjabi (2,125) lo hace adecuado para tareas de compresión de texto o evaluación de modelos de lenguaje en lenguas de bajos recursos.
- Generación de código en entornos con recursos limitados: puede utilizarse para autocompletar fragmentos de código o generar scripts simples en dispositivos con poca memoria, aunque su contexto corto limita la complejidad.
- Razonamiento matemático básico: su capacidad para manejar operaciones aritméticas y razonamiento sintético permite su uso en ejercicios educativos o generación de problemas matemáticos sencillos.
- Aplicaciones educativas multilingües: al procesar bytes, puede servir para enseñar o practicar escritura en diferentes alfabetos, como el gurmukhi, sin necesidad de tokenizadores específicos.

## Benchmarks y rendimiento

El autor declara los siguientes resultados de bits por byte (BPB, menor es mejor) sobre un conjunto de evaluación propio con particiones estrictamente separadas (held-out). No se han verificado de forma independiente.

| Dominio | BPB (Held) |
|---|---|
| Punjabi | 2,125 |
| Synthetic Reasoning | 3,090 |
| Math | 4,165 |
| English | 4,169 |
| Code | 4,456 |
| Overall Average | 3,012 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Al tener solo 30,07M de parámetros, el modelo es extremadamente ligero. En precisión fp32 ocupa aproximadamente 120 MB, en fp16 unos 60 MB y en int8 unos 30 MB.
- Puede ejecutarse en CPU sin problemas, así como en cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) e incluso en dispositivos con poca memoria.
- No se requieren GPUs de datacenter (A100, H100) para inferencia.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no se proporcionan instrucciones específicas. También se puede usar directamente con el script `generate.py` incluido en el repositorio.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos byte-level de ~30M con arquitectura lineal recurrente). No se puede realizar una comparativa fiable con los datos proporcionados.

## Limitaciones y advertencias

- Contexto muy limitado: solo 512 bytes (aproximadamente 500 caracteres), lo que restringe la coherencia en textos largos y la capacidad de manejar dependencias de largo alcance.
- Tamaño reducido: con 30M de parámetros, su capacidad de razonamiento complejo y generación de código avanzado es limitada; es adecuado para tareas simples o prototipado.
- Sesgos potenciales: al estar entrenado principalmente en punjabi e inglés, puede presentar sesgos culturales o lingüísticos; no se han documentado evaluaciones de sesgo.
- Riesgo de alucinación: como todo modelo de lenguaje pequeño, puede generar contenido plausible pero incorrecto, especialmente en dominios no representados en el entrenamiento.
- Datos de entrenamiento no especificados: no se detalla el volumen de tokens ni la composición del dataset, lo que dificulta evaluar su cobertura y posibles sesgos.
- Sin soporte para tool calling ni agentes: no se mencionan capacidades de integración con herramientas externas.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías; se recomienda validar el modelo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nam-toon-studio/sahaj-30m
- Perfil del autor en Hugging Face: https://huggingface.co/Nam-toon-studio
- Datasets del autor: https://huggingface.co/Nam-toon-studio/datasets
