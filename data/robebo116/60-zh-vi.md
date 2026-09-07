# robebo116/60-zh-vi

## Resumen

HachimiMT-60 es un modelo de traducción automática neuronal (NMT) que traduce texto del chino simplificado al vietnamita, desarrollado por robebo116 (DINH VAN VINH). Está optimizado específicamente para el dominio de novelas web (web novels) chinas, incluyendo los géneros xianxia, fantasía, ciencia ficción, urbano y militar. El modelo se basa en una arquitectura MarianMT asimétrica, con 8 capas de encoder y 2 de decoder, un tamaño de modelo de 512 dimensiones y un total de 56.435.136 parámetros. Su longitud de contexto es de 512 tokens, lo que le permite procesar párrafos extensos sin truncamiento, una ventaja frente a modelos anteriores de la misma familia.

El modelo fue entrenado desde cero (trained-from-scratch) utilizando un corpus paralelo chino-vietnamita de 350.000 pares generados con modelos Gemini (2.5/3.0/3.1) como profesor, junto con un dataset filtrado específico para novelas web. La relevancia de HachimiMT-60 radica en que resuelve el problema del truncamiento en traducciones de párrafos largos, algo que afectaba a modelos comparables como Hirashiba-medium, que se limitaban a 128 posiciones. Está disponible en HuggingFace bajo licencia CC BY 4.0 e incluye una exportación a CTranslate2 en INT8 para inferencia rápida en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT asimétrico (Transformer encoder-decoder, 8 capas encoder + 2 capas decoder, d_model 512) |
| Parametros totales | 56.435.136 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_position_embeddings) |
| Tipos de cuantizacion | FP32 (transformers), INT8 (CTranslate2) |
| Idiomas soportados | Chino simplificado (zh) y vietnamita (vi). Traducción solo zh→vi |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors, CTranslate2 (INT8) |

## Arquitectura y entrenamiento

HachimiMT-60 emplea una arquitectura Marian (Transformer encoder-decoder) asimétrica, con 8 capas en el encoder y solo 2 en el decoder, una dimensión de modelo de 512 y una dimensión FFN de 3072. El vocabulario es un SentencePiece BPE conjunto de 24.000 piezas para chino y vietnamita, con embeddings compartidos entre encoder y decoder y pesos atados (tie_word_embeddings). La activación utilizada es Swish. El modelo fue entrenado desde cero, sin partir de checkpoints preentrenados.

Los datos de entrenamiento provienen de tres fuentes principales: el dataset `ngocdang83/tran-vi-teacher`, con 350.000 pares chino-vietnamita limpios generados con modelos Gemini 2.5/3.0/3.1 en sus variantes Pro, Flash y Flash-Lite, que aporta ejemplos a nivel de párrafo y cobertura cross-domain (urbano, fantasía, ciencia ficción, historia); el dataset filtrado `chi-vi/hirashiba-mt-zh2vi-b-filtered`, orientado al dominio de novelas web; y un conjunto adicional de ejemplos "gold teacher" generados con la API de Gemini para mejorar la calidad. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente supervisado.

## Capacidades

- Traducción de chino simplificado a vietnamita de alta calidad, especializada en el dominio de novelas web (xianxia, tu tiên, fantasía, ciencia ficción).
- Manejo de párrafos largos: puede generar salidas de hasta aproximadamente 1.000 caracteres sin truncamiento, gracias a su ventana de 512 tokens.
- Entrenado en dominios cross-domain: incluye contenido urbano, escolar, militar y lovecraftiano, además de fantasía y ciencia ficción.
- Configuración de decodificación flexible: admite beam search con `num_beams=4`, penalización de repetición y `no_repeat_ngram_size` para evitar repeticiones.
- Soporte de inferencia por lotes (batched inference) para despliegue en producción.
- Exportación CTranslate2 INT8 incluida, que permite ejecución rápida en CPU.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo de traducción puro.
- No es bidireccional: solo traduce desde chino hacia vietnamita.

## Casos de uso

- Traducción de novelas web chinas (xianxia) al vietnamita: el modelo está entrenado con datos específicos de este género, por lo que preserva la terminología de cultivo, sectas y artes marciales con mayor fidelidad.
- Traducción de capítulos completos en pipelines editoriales: gracias a su ventana de 512 tokens y salida larga, puede procesar párrafos extensos sin cortes, lo que reduce la necesidad de dividir el texto manualmente.
- Aplicaciones de lectura de novelas en vietnamita: puede integrarse como motor de traducción en apps o webs de lectura, usando la exportación CTranslate2 INT8 para servir en CPU con baja latencia.
- Traducción de contenido cross-domain (urbano, militar, escolar): el dataset de entrenamiento incluye dominios variados, por lo que el modelo también rinde bien en géneros distintos a la fantasía.
- Generación de borradores para post-edición humana: produce una primera traducción que un traductor profesional revisa y corrige, acelerando el flujo de trabajo editorial.
- Despliegue en servidores de bajo coste: al ser un modelo de 56,4 millones de parámetros, cabe en GPUs modestas o incluso en CPU, y se puede servir con CTranslate2 INT8 para inferencia eficiente.
- Traducción de blogs o artículos chinos al vietnamita para audiencias locales, con salidas de hasta ~1.000 caracteres por petición.

## Benchmarks y rendimiento

No se han publicado métricas de calidad (BLEU, COMET, chrF) en la información disponible. La model card incluye únicamente benchmarks de velocidad, medidos en una RTX 5070 Ti Laptop con `num_beams=4` sobre un conjunto mixto de 20 frases cortas, 20 medianas y 20 largas.

| Modelo | Parametros | Latencia media | max_position | Notas |
|---|---:|---:|---:|---|
| Hirashiba-tiny | 15,1M | 377 ms | 512 | Más rápido |
| Hirashiba-medium | 57,07M | 495 ms | 128 | Trunca párrafos |
| HachimiMT-60 | 56,94M | 603 ms | 512 | Maneja párrafos largos sin truncamiento |

Nota: el dato de parámetros de HachimiMT-60 en esta tabla proviene de la model card del autor (56,94M). El conteo real según los safetensors del repositorio es de 56.435.136 parámetros.

Latencia media por tipo de entrada (en ms):

| Bucket | HachimiMT-60 | Hirashiba-medium | Hirashiba-tiny |
|---|---:|---:|---:|
| short (~70-120 caracteres) | 330 | 390 | 310 |
| medium (~150-250 caracteres) | 626 | 546 | 430 |
| long (>250 caracteres) | 853 | 548 | 390 |

Los modelos Hirashiba-medium y Hirashiba-tiny truncan en los buckets medianos y largos debido a su `max_position_embeddings=128`, lo que explica su menor latencia en el bucket largo. HachimiMT-60 produce salida completa sin truncamiento.

## Requisitos de hardware

- VRAM estimada: en FP32, el modelo ocupa aproximadamente 225 MB (56.435.136 parámetros × 4 bytes). Con cuantización INT8 en CTranslate2, ocupa aproximadamente 113 MB. En la práctica, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- GPU recomendadas: RTX 5070 Ti Laptop (usada en el benchmark del autor), RTX 4090, A100, H100 o cualquier GPU moderna con más de 2 GB de VRAM.
- Sí cabe en GPUs de consumo: una GTX 1660, RTX 3050 o similar puede ejecutar el modelo sin problemas.
- Opciones de despliegue: Transformers (PyTorch) para GPU, CTranslate2 para CPU con INT8, o servidores con inferencia por lotes.
- Latencia estimada: en RTX 5070 Ti Laptop con `num_beams=4`, latencia media de 603 ms; por tipo de entrada: 330 ms (corto), 626 ms (medio), 853 ms (largo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Latencia media | Ventaja principal |
|---|---:|---:|---:|---|
| HachimiMT-60 | 56,4M | 512 | 603 ms | Salida larga sin truncamiento |
| Hirashiba-medium | 57,07M | 128 | 495 ms | Más rápido en entradas cortas |
| Hirashiba-tiny | 15,1M | 512 | 377 ms | Más rápido y ligero |

Nota: Hirashiba-medium trunca en entradas medianas y largas. HachimiMT-60 y Hirashiba-tiny manejan hasta 512 tokens, pero HachimiMT-60 está optimizado para párrafos de novelas web y genera salidas de mayor longitud.

## Limitaciones y advertencias

- Riesgo de alucinación en nombres propios poco comunes: aunque los nombres occidentales (Klein, Audrey, Bernadette) suelen preservarse, los nombres propios raros pueden sufrir alucinaciones.
- No soporta chino tradicional (繁體): el modelo fue entrenado con chino simplificado (简体). Se recomienda convertir el texto a simplificado con OpenCC antes de traducir.
- Solo traduce chino→vietnamita; no es bidireccional, por lo que no puede utilizarse para traducir del vietnamita al chino.
- La traducción automática debe ser revisada antes de su publicación. El autor desaconseja su uso como edición bilingüe sin verificación humana.
- Limitación de contexto: entradas de más de 512 tokens se truncan. Para párrafos muy largos, es necesario dividir el texto en segmentos más pequeños.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo de traducción puro, no un asistente conversacional.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones de la licencia y de los datasets de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/robebo116/60-zh-vi
- Dataset de entrenamiento (tran-vi-teacher): https://huggingface.co/datasets/ngocdang83/tran-vi-teacher
- Dataset filtrado (hirashiba-mt-zh2vi-b-filtered): https://huggingface.co/datasets/chi-vi/hirashiba-mt-zh2vi-b-filtered
- Modelo comparado Hirashiba-tiny: https://huggingface.co/chi-vi/hirashiba-mt-tiny-zh-vi
- Modelo comparado Hirashiba-medium: https://huggingface.co/Moleys/hirashiba-mt-medium
