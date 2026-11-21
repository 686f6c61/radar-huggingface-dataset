# qtum/MiniMax-M3.1-Flash-GGUF

## Resumen

MiniMax-M3.1-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por MiniMax. Con 426.186.392.064 parámetros totales (unos 427 G), es un modelo de gran escala orientado a generación de texto conversacional en inglés y chino. La versión aquí descrita es una cuantización GGUF publicada por el usuario qtum bajo el identificador `qtum/MiniMax-M3.1-Flash-GGUF`, derivada del checkpoint original `MiniMaxAI/MiniMax-M3.1-Flash`.

La particularidad de esta publicación es que el checkpoint original ya está almacenado en precisión mixta: las capas densas usan MXFP8 y los expertos enrutados usan NVFP4, lo que da una media de 4,66 bits por peso (bpw) y un tamaño de pesos de texto de 248,37 GB. Por ello, las cuantizaciones GGUF publicadas no son las típicas Q8_0/Q6_K/Q5_K_M/Q4_K_M, sino tiers por debajo de ese umbral (IQ1_S, IQ2_XXS, IQ2_XS), con las capas no-expertas protegidas en Q8_0 o F32 para no degradar el enrutamiento ni la atención.

El modelo incorpora atención dispersa (MSA) mediante una proyección `indexer` por capa que selecciona bloques de 128 tokens a los que atender, y una arquitectura de 60 capas en la que las 3 primeras son densas (MLP de 12.288 de anchura) y las 57 restantes son MoE con 128 expertos enrutados cada una, 4 activos por token más un experto compartido. Esta ficha cubre exclusivamente la versión GGUF, que es solo texto: no incluye la torre de visión del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (MSA) e indexer por capa; 60 capas (3 densas + 57 MoE) |
| Parametros totales | 426.186.392.064 (aprox. 427 G) |
| Parametros activos | 4 expertos enrutados de 128 por capa + 1 experto compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ2_XXS, IQ2_XS (más un draft `dspark-…-Q8_0` de 1,9 GiB) |
| Idiomas soportados | en, zh |
| Licencia | minimax-model-agreement (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 60 capas. Las tres primeras capas son densas, con un MLP de 12.288 de anchura; las 57 restantes son capas MoE con 128 expertos enrutados cada una, de los cuales 4 se activan por token, más un experto compartido que se ejecuta en todos los tokens. La atención es dispersa (MSA): cada capa incorpora una proyección adicional `indexer` que decide a qué bloques de 128 tokens atender, lo que reduce el coste computacional de la atención en contextos largos. Todo lo que no son expertos suma 16,0 GB de pesos.

El checkpoint original está almacenado en precisión mixta: las capas densas en MXFP8 (pesos E4M3 con escalas de bloque E8M0 de 32 columnas) y los expertos enrutados en NVFP4 (dos pesos por byte, una escala FP8 por cada 16 valores y una escala FP32 por experto). El desglose de tamaño del modelo de texto es: expertos enrutados 232,38 GB a 4,50 bpw, atención e indexer 6,86 GB a 8,00 bpw, embeddings y lm_head 4,92 GB a 16,00 bpw, experto compartido 3,33 GB a 8,00 bpw, MLP denso de las 3 capas 0,70 GB a 8,00 bpw, router y bias 0,18 GB a 32,00 bpw, y normas a 16,00 bpw; total 248,37 GB a 4,66 bpw. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y respuesta multi-turno (etiqueta `conversational` en el repo).
- Modelo de texto puro: la versión GGUF no incluye ningún tensor de visión, por lo que no acepta entrada de imágenes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del repo.
- Capacidad especial de atención dispersa (MSA) con selección de bloques de 128 tokens mediante el `indexer`.

## Casos de uso

- Inferencia local de un modelo de 427 G en hardware de gama alta: los tiers IQ2 permiten cargar el modelo en configuraciones con suficiente VRAM/RAM unificada, algo imposible con los pesos originales en BF16 o con cuantizaciones Q4_K_M (251 GB).
- Despliegue con llama.cpp: los ficheros GGUF están pensados para llama.cpp, lo que facilita servidores de inferencia en CPU/GPU mixtas mediante el backend compatible con GGUF.
- Conversación multilingüe inglés-chino: el modelo está entrenado y etiquetado para ambos idiomas, adecuado para asistentes y chatbots bilingües.
- Evaluación de calidad bajo cuantización agresiva: la tabla de perplejidad en wikitext-2 permite comparar tiers (IQ1_S 237,39; IQ2_XXS 148,20; IQ2_XS 144,01 frente a 149,47 del maestro) y elegir el equilibrio tamaño/calidad para un pipeline concreto.
- Investigación sobre arquitecturas MoE con atención dispersa: el modelo permite estudiar el comportamiento del enrutamiento y del `indexer` en un modelo de gran escala con pesos abiertos.
- Prototipado de aplicaciones de texto en entornos con restricciones de memoria: los tiers IQ1_S (90,4 GiB) e IQ2_XXS (113,5 GiB) hacen viable probar el modelo en máquinas que no podrían alojar los 248 GB del maestro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona perplejidad en wikitext-2 para comparar tiers de cuantización:

| Tier | Tamano | bpw | Shards | PPL (wikitext-2) |
|---|---|---|---|---|
| BF16 master (referencia, no en el repo) | 241,3 GiB | 4,863 | — | 149,4654 ± 12,58751 |
| IQ1_S | 90,4 GiB | 1,822 | 3 | 237,3906 ± 19,29183 |
| IQ2_XXS | 113,5 GiB | 2,287 | 3 | 148,1980 ± 12,18542 |
| IQ2_XS | 125,0 GiB | 2,519 | 3 | 144,0074 ± 12,01536 |
| dspark-…-Q8_0 (draft, cualquier tier) | 1,9 GiB | — | 1 | — |

## Requisitos de hardware

- VRAM/RAM estimada: al menos 90,4 GiB para IQ1_S, 113,5 GiB para IQ2_XXS y 125,0 GiB para IQ2_XS, más overhead de contexto y del runtime.
- No cabe en GPU de consumo individual (RTX 4090 con 24 GB, etc.); requiere configuraciones multi-GPU, memoria unificada de gran capacidad o descarga parcial a CPU/RAM.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, se necesitan varios aceleradores de 80 GB (A100/H100) o soluciones con memoria unificada de 128 GB o más.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); otros runtimes compatibles con GGUF no confirmados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría.

## Limitaciones y advertencias

- La versión GGUF es solo texto: no incluye la torre de visión (CLIP de 32 capas, hidden 1.280, patch 14, 672×672) del checkpoint original; para entrada de imágenes hay que usar los pesos originales.
- Los tiers publicados están por debajo de 4,66 bpw del maestro; el autor advierte de que cualquier cuantización adicional introduce error sobre el NVFP4 ya presente. Para calidad casi sin pérdidas recomienda usar los pesos originales.
- IQ1_S degrada notablemente la perplejidad (237,39 frente a 144,01 de IQ2_XS y 149,47 del maestro), por lo que no es adecuado para producción sensible a la calidad.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano.
- Licencia `minimax-model-agreement` (etiquetada como `other`): es necesario revisar el acuerdo antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Longitud de contexto no disponible; conviene verificarla en el repositorio del modelo base antes de desplegar.
- El repositorio ocupa 355,2 GB y los ficheros están divididos en shards (3 por tier), lo que complica la descarga y el almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/qtum/MiniMax-M3.1-Flash-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash/blob/main/LICENSE
- README en chino: https://huggingface.co/qtum/MiniMax-M3.1-Flash-GGUF/blob/main/README_zh.md
