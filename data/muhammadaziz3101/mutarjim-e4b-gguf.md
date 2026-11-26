# Muhammadaziz3101/Mutarjim-E4B-GGUF

## Resumen

Mutarjim-E4B-GGUF es un modelo de traducción bidireccional uzbeko-inglés derivado de `google/gemma-4-E4B-it`. Lo publica el usuario Muhammadaziz3101 en Hugging Face y consiste en un ajuste fino mediante LoRA (etapa 2, `stage2-bidir-20k`, con 9.999 pares en cada dirección) fusionado sobre el modelo base con un factor de escala de 0,5 y posteriormente convertido a formato GGUF en cuantización Q8_0. El resultado es un modelo de 7.518.069.290 parámetros (aproximadamente 7,5 mil millones) empaquetado en un único archivo de 8,0 GB.

El problema que aborda es concreto: la traducción de calidad entre uzbeko e inglés, un par de idiomas con pocos recursos en comparación con los pares de alto recurso, donde los modelos generalistas suelen ofrecer resultados mediocres. El modelo se distribuye con licencia Gemma y está pensado para inferencia local mediante llama.cpp, con integración directa en la aplicación de escritorio MA Tarjimon.

Es relevante por su enfoque práctico: un ajuste ligero (LoRA) sobre un modelo base reciente, empaquetado en GGUF para despliegue en hardware de consumo, con métricas publicadas en FLEURS que muestran mejoras modestas pero consistentes respecto al modelo base en ambas direcciones. Se trata de un modelo exclusivamente de texto, sin proyector de visión ni audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-4-E4B-it); no se detalla la variante interna |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | uzbeko (uz), inglés (en) |
| Licencia | Gemma (términos de uso de Google Gemma) |
| Formato de pesos | GGUF (`Mutarjim-E4B-Q8_0.gguf`, 8,0 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `google/gemma-4-E4B-it`, un transformer decoder-only de aproximadamente 7,5 mil millones de parámetros. Sobre él se aplicó un ajuste fino con LoRA en dos etapas; la etapa 2 (`stage2-bidir-20k`) emplea 9.999 pares de traducción en cada dirección (uzbeko→inglés e inglés→uzbeko) procedentes del dataset `Muhammadaziz3101/translate`. La fusión de la LoRA se realizó con un factor de escala de 0,5, lo que atenúa el efecto del ajuste para preservar capacidades del modelo base y evitar sobreajuste al corpus de traducción.

No se especifican el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La conversión a GGUF se realizó tras la fusión, y el modelo se distribuye únicamente en cuantización Q8_0. El prompt debe seguir la plantilla de chat de Gemma 4 con el modo de razonamiento (thinking) desactivado, usando las cadenas `Translate from Uzbek to English:\n\n<text>` y `Translate from English to Uzbek:\n\n<text>`.

## Capacidades

- Traducción bidireccional uzbeko↔inglés, tarea principal para la que fue ajustado.
- Generación de texto conversacional en uzbeko e inglés, heredada del modelo base.
- Instrucciones en formato chat mediante la plantilla de Gemma 4 (requiere `--jinja` en llama.cpp).
- Inferencia local en CPU y GPU a través de llama.cpp y servidores compatibles con la API de endpoints.
- Integración con la aplicación de escritorio MA Tarjimon cargando directamente el archivo `.gguf`.
- No incluye capacidades de visión ni audio (el proyector multimodal fue eliminado).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Traducción de documentación técnica: el modelo traduce manuales y README del inglés al uzbeko manteniendo terminología, adecuado por su ajuste específico en el par de idiomas y su ejecución local sin coste por token.
- Localización de interfaces de software: integración en pipelines de CI/CD que generen cadenas de recursos en uzbeko a partir de las fuentes en inglés, usando llama-server con la API compatible.
- Atención al cliente en uzbeko: despliegue de un traductor intermedio que convierta consultas de usuarios uzbekos a inglés para un sistema downstream y devuelva la respuesta traducida.
- Traducción de contenido editorial y noticias: procesamiento por lotes de artículos con prompts de plantilla fija, aprovechando la cuantización Q8_0 para preservar calidad en textos largos.
- Herramienta de escritorio para traductores: uso directo en MA Tarjimon para traducción asistida sin conexión, con el archivo GGUF cargado localmente.
- Investigación en traducción automática de bajos recursos: punto de partida para experimentos con LoRA sobre gemma-4-E4B en otros pares de idiomas, dado que el autor publica la receta de fusión y el dataset.

## Benchmarks y rendimiento

Resultados publicados por el autor en FLEURS (345 frases, decodificación greedy; la LoRA a escala 0,5 medida sobre la base Q4_K_XL):

| Modelo | UZ→EN chrF / BLEU | EN→UZ chrF / BLEU |
|---|---|---|
| Gemma 4 E4B base | 59,0 / 31,2 | 55,5 / 17,1 |
| Mutarjim (etapa 2, escala 0,5) | 60,5 / 32,5 | 55,7 / 17,1 |

La mejora es de +1,5 chrF y +1,3 BLEU en uzbeko→inglés, y de +0,2 chrF con BLEU idéntico en inglés→uzbeko. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 8-9 GB con Q8_0 (el archivo pesa 8,0 GB más overhead de contexto y caché KV).
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) y cualquier GPU con 12 GB o más para Q8_0 con contexto moderado; A100 y H100 sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM; en GPUs de 8 GB requeriría cuantizaciones menores no publicadas o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-server -hf Muhammadaziz3101/Mutarjim-E4B-GGUF:Q8_0 --jinja`), Ollama (importando el GGUF), y servidores compatibles con endpoints OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Mutarjim-E4B-GGUF | 7,52 B | no disponible | uz, en | Gemma | GGUF Q8_0 |
| google/gemma-4-E4B-it (base) | ~7,5 B | no disponible | multilingüe | Gemma | safetensors |
| NLLB-200 (variante 3.3B) | 3,3 B | 512 tokens | 200 idiomas (incl. uz) | CC-BY-NC 4.0 | safetensors, CTranslate2 |
| M2M-100 (1.2B) | 1,2 B | 1024 tokens | 100 idiomas (incl. uz) | MIT | safetensors |

Frente al modelo base, Mutarjim aporta una mejora medible en uzbeko→inglés a costa de perder el proyector multimodal. Frente a NLLB-200, carece de cobertura multilingüe amplia pero ofrece licencia Gemma (uso comercial permitido bajo condiciones) frente a la restricción no comercial de NLLB, y se ejecuta en llama.cpp sin necesidad de CTranslate2. M2M-100 es más ligero pero con calidad inferior en pares de bajos recursos.

## Limitaciones y advertencias

- Modelo restringido a uzbeko e inglés; no se garantiza comportamiento en otros idiomas.
- Solo se publica cuantización Q8_0; no hay versiones Q4 o Q5 para hardware con menos VRAM.
- Sin capacidades de visión ni audio, a pesar de heredar de un modelo multimodal.
- Riesgo de alucinación y de traducciones inventadas en textos largos o dominios muy especializados (jurídico, médico), dado el tamaño reducido del corpus de ajuste (9.999 pares por dirección).
- La mejora en inglés→uzbeko es marginal (BLEU idéntico al base), por lo que la dirección más fiable es uzbeko→inglés.
- Licencia Gemma: el uso comercial está sujeto a los términos de uso de Google Gemma, que imponen restricciones de uso aceptable y obligaciones de atribución.
- Sin datos publicados sobre longitud de contexto efectiva, sesgos demográficos ni evaluación de robustez; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación externa.
- Requiere la plantilla de chat de Gemma 4 con thinking desactivado; prompts fuera de plantilla pueden degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muhammadaziz3101/Mutarjim-E4B-GGUF
- LoRA de la etapa 2: https://huggingface.co/Muhammadaziz3101/gemma4-e4b-uzbek-translate-lora
- Dataset de traducción: https://huggingface.co/datasets/Muhammadaziz3101/translate
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
