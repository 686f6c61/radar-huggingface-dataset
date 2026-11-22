# mradermacher/chiara-qwen3-14b-i1-GGUF

## Resumen

chiara-qwen3-14b-i1-GGUF es la distribucion en formato GGUF del modelo chiara-qwen3-14b, un ajuste fino de Qwen3-14B desarrollado por marcoeg y cuantizado por mradermacher. El modelo base parte de la arquitectura Qwen3 de Alibaba, con 14.768.307.200 parametros totales, y ha sido adaptado mediante un pipeline de SFT (supervised fine-tuning) y DPO (direct preference optimization) sobre LoRA y QLoRA para especializarlo en comportamiento de persona conversacional.

El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino un conjunto de cuantizaciones GGUF generadas con la tecnica i1 (imatrix) de mradermacher, pensadas para su uso con llama.cpp, Ollama y otros runners compatibles con GGUF. Esto lo hace especialmente relevante para desarrolladores que quieren desplegar un modelo de 14B en hardware de consumo o en entornos con VRAM limitada sin renunciar a la calidad del ajuste original.

La relevancia actual del modelo radica en su combinacion de tamano contenido (14B), licencia Apache 2.0 y especializacion en persona, lo que lo convierte en una opcion practica para asistentes conversacionales autoalojados. No obstante, la informacion publicada es escasa: no hay benchmarks, no se detalla la composicion del dataset de entrenamiento ni la longitud de contexto efectiva del ajuste, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajuste fino con LoRA/QLoRA |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de imatrix |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1), safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen3 con 14.768.307.200 parametros. Sobre esa base, el autor original (marcoeg) aplico un pipeline de ajuste fino que combina LoRA y QLoRA con SFT y DPO, segun los tags del repositorio. El objetivo declarado es especializar el modelo en comportamiento de persona conversacional, es decir, mantener un estilo y una identidad consistentes en dialogos multi-turno.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de datos de preferencia usada en DPO ni la longitud de contexto efectiva tras el ajuste. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La cuantizacion i1 de mradermacher utiliza ficheros imatrix para mejorar la calidad de las cuantizaciones de baja precision, lo que es relevante para las variantes IQ1 a IQ3.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en mantener una persona consistente.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3-14B.
- Ajuste fino con SFT y DPO orientado a preferencias humanas en dialogos.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles; no se confirma soporte de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.
- Compatibilidad con endpoints y runners GGUF (Ollama, llama.cpp).

## Casos de uso

- Asistente conversacional autoalojado: el ajuste en persona permite desplegar un asistente con identidad y estilo estables en entornos donde no se quiere depender de APIs externas, usando la cuantizacion Q4_K_M (9,1 GB) en una GPU de consumo.
- Prototipado rapido de chatbots en local: con llama.cpp u Ollama y una cuantizacion IQ3_M (7,0 GB) se puede iterar sobre prompts y flujos conversacionales sin infraestructura dedicada.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece 24 variantes i1, lo que permite comparar calidad y velocidad entre IQ1 e Q6_K en un mismo modelo y caso de uso.
- Fine-tuning posterior sobre dominio especifico: al estar bajo Apache 2.0 y disponible en safetensors en el modelo base, se puede partir de chiara-qwen3-14b para adaptarlo a un vertical concreto (legal, sanitario, soporte tecnico).
- Despliegue en edge o estaciones de trabajo sin GPU dedicada: las cuantizaciones IQ2 (4,4-5,4 GB) permiten ejecucion en CPU con RAM moderada, a costa de calidad.
- Investigacion sobre comportamiento de persona: util para estudiar como el SFT y DPO moldean la identidad del modelo en conversaciones largas, comparando con el Qwen3-14B original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): IQ1_S ~3,7 GB; IQ2_M ~5,4 GB; IQ3_M ~7,0 GB; Q4_K_M ~9,1 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB. A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4090 24 GB para Q6_K con contexto amplio; A100/H100 para despliegues concurrentes con vLLM (aunque vLLM requiere pesos no GGUF o soporte especifico).
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4 y Q5 en GPUs de 12-16 GB; las IQ2 e IQ3 en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF. vLLM y TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| chiara-qwen3-14b-i1-GGUF | 14,77B | no disponible | Apache 2.0 | GGUF (i1) | Ajuste de persona con SFT+DPO, solo ingles declarado |
| Qwen3-14B (base) | ~14,8B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo generalista de Alibaba, sin especializacion de persona |
| mradermacher/chiara-qwen3-14b-GGUF | 14,77B | no disponible | Apache 2.0 | GGUF (static) | Misma base, cuantizaciones estaticas en lugar de i1 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3 y de un dataset de preferencias no descrito, pueden persistir sesgos del modelo base y del corpus de ajuste.
- Riesgo de alucinacion: inherente a los modelos de 14B; no se han publicado evaluaciones de factualidad para este ajuste.
- Limitaciones de contexto o idioma: solo se declara ingles; la longitud de contexto efectiva no esta documentada y podria diferir de la del Qwen3-14B original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3 y del dataset de ajuste, no detalladas aqui.
- Caveats para produccion: las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad (el propio autor las etiqueta como "for the desperate"); para produccion se recomienda Q4_K_M o superior. No hay benchmarks que avalen el ajuste frente al modelo base.
- El repositorio tiene 0 likes y 1826 descargas, lo que sugiere poca validacion comunitaria; conviene evaluar el modelo en el caso de uso concreto antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/chiara-qwen3-14b-i1-GGUF
- Modelo base: https://huggingface.co/marcoeg/chiara-qwen3-14b
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/chiara-qwen3-14b-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#chiara-qwen3-14b-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
