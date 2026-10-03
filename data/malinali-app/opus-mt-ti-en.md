# malinali-app/opus-mt-ti-en

## Resumen

`malinali-app/opus-mt-ti-en` es un modelo de traduccion automatica neuronal para la direccion tigriña (ti) → ingles (en), publicado por el desarrollador malinali-app como parte del proyecto Malinali. No es un modelo entrenado desde cero: se trata de un reempaquetado de los pesos del modelo base `Helsinki-NLP/opus-mt-ti-en`, desarrollado por el grupo Helsinki-NLP dentro del proyecto OPUS-MT. La contribucion de este repositorio es la conversion de los pesos a formato `safetensors` y la transformacion de los tokenizadores SentencePiece en tokenizadores rapidos en formato JSON, pensados para inferencia en dispositivo mediante Candle (componente `marian_flutter`).

Tecnicamente es un modelo Marian, es decir, una arquitectura transformer encoder-decoder de tipo secuencia a secuencia orientada a traduccion. Cuenta con 77.007.434 parametros (aproximadamente 77 millones), lo que lo situa en la gama ligera y lo hace apto para ejecucion en CPU, moviles y dispositivos con recursos limitados. El repositorio ocupa 0,3 GB.

Su relevancia reside en dos factores. Por un lado, el tigriña es un idioma de bajos recursos con muy pocos sistemas de traduccion disponibles. Por otro, el formato de publicacion esta optimizado para ejecucion local y sin conexion, lo que facilita integrarlo en aplicaciones moviles o de escritorio que necesitan traducir sin enviar datos a un servidor externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, seq2seq) |
| Parametros totales | 77.007.434 (aproximadamente 77 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en `safetensors` (sin variantes GGUF, AWQ, GPTQ ni INT8) |
| Idiomas soportados | ti (tigriña) como origen, en (ingles) como destino |
| Licencia | no disponible en los metadatos de HuggingFace; la model card indica que se debe seguir la licencia del modelo base (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder estandar desarrollado originalmente para traduccion automatica neuronal. Al ser un modelo seq2seq de traduccion, no dispone de modo conversacional, de razonamiento por pasos ni de mecanismos de tool calling: su salida es directamente la secuencia traducida. El modelo emplea tokenizadores separados para el idioma de origen y el de destino (`tokenizer-enc.json` y `tokenizer-dec.json`), derivados de los tokenizadores SentencePiece originales y convertidos aqui al formato de tokenizador rapido de HuggingFace.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. El modelo base pertenece a la familia OPUS-MT de Helsinki-NLP, que se entrena sobre corpus paralelos recopilados por el proyecto OPUS, pero este repositorio concreto no aporta detalles adicionales sobre el proceso de entrenamiento. La unica intervencion declarada por el autor es el reempaquetado de pesos y la conversion de tokenizadores; no se reclama la propiedad del modelo entrenado.

## Capacidades

- Traduccion de texto de tigriña a ingles, en modo unidireccional (ti → en). No soporta la direccion inversa.
- Generacion de texto de tipo seq2seq, orientada exclusivamente a la tarea de traduccion.
- Ejecucion en dispositivo mediante Candle, con el componente `marian_flutter`, lo que permite inferencia local y sin conexion.
- Compatibilidad con la libreria `transformers` y con la pipeline `translation`.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`).
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Traduccion de documentos de tigriña a ingles: el modelo convierte textos largos divididos en segmentos, adecuado para traducir articulos, informes o correspondencia administrativa.
- Localizacion de contenidos digitales: traduccion de interfaces, fichas de producto o materiales de marketing desde tigriña hacia ingles antes de su publicacion.
- Traduccion sin conexion en aplicaciones moviles: gracias a los 77 M de parametros y a la integracion con Candle, puede embeberse en una app Android o iOS y traducir sin enviar texto a ningun servidor, lo que preserva la privacidad.
- Atencion al cliente para comunidades tigriñoparlantes: los mensajes de usuario en tigriña se traducen a ingles para que un operador o un sistema posterior los procese; el bajo coste de inferencia permite responder en tiempo real.
- Preprocesado de corpus para investigacion en PLN: traduccion masiva de textos en tigriña a ingles para construir conjuntos de datos de entrenamiento o para facilitar analisis posteriores.
- Moderacion de contenido en redes sociales: traduccion automatica de publicaciones en tigriña para que los sistemas de moderacion basados en ingles puedan clasificarlas.
- Subtitulado y transcripcion: traduccion de transcripciones en tigriña a subtitulos en ingles para videos, cursos o material educativo.
- Accesibilidad documental: conversion de archivos historicos o legales en tigriña a ingles para facilitar su consulta por parte de investigadores o servicios publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 308 MB en FP32, 154 MB en FP16 y unos 77 MB en INT8 (estimaciones derivadas del numero de parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU moderna sirve, incluso integradas. No requiere A100, H100 ni RTX 4090; una GTX 1650, una RTX 3060 o una GPU integrada Intel/AMD son mas que suficientes.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo e incluso en GPU integradas y en la mayoria de telefonos moviles.
- Opciones de despliegue: `transformers` (pipeline `translation`), Candle mediante `marian_flutter`, y potencialmente PyTorch nativo. No se ha confirmado soporte en vLLM ni en TGI, que no cubren de forma nativa la arquitectura Marian encoder-decoder.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo y la arquitectura, se espera una latencia baja en CPU y muy baja en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-ti-en | 77 M | no disponible | ti → en | no disponible (hereda del base, habitualmente CC-BY 4.0) | safetensors, Candle |
| Helsinki-NLP/opus-mt-ti-en | no disponible | no disponible | ti → en | CC-BY 4.0 (segun OPUS-MT) | transformers |
| NLLB-200-distilled-600M | 600 M | 512 tokens | 200 idiomas, incluido tigrina (tir_Ethi) | CC-BY-NC-4.0 (uso no comercial) | transformers, safetensors |

El modelo aqui descrito es funcionalmente equivalente al modelo base de Helsinki-NLP en cuanto a calidad de traduccion, ya que comparte los mismos pesos; la diferencia esta en el formato y en la orientacion a inferencia en dispositivo. NLLB-200-distilled-600M es una alternativa mas potente y multilingue, pero su licencia no permite uso comercial y su tamano es casi ocho veces mayor. No se dispone de resultados de benchmarks comparativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Traduccion unidireccional: solo cubre ti → en; no traduce de ingles a tigriña.
- Riesgo de alucinacion y de traducciones inexactas, especialmente en frases largas, terminologia especializada o lenguaje coloquial, algo habitual en modelos de traduccion de bajos recursos.
- El tigriña es un idioma de bajos recursos; la cobertura y calidad del corpus de entrenamiento subyacente condiciona la fidelidad de las traducciones.
- Sesgos potenciales heredados del corpus OPUS, que puede sobrerrepresentar ciertos dominios (textos religiosos, administrativos o parlamentarios) y infrarrepresentar otros.
- Longitud de contexto no especificada en la informacion disponible; conviene validar experimentalmente el comportamiento con entradas largas antes de usarlo en produccion.
- Licencia no disponible en los metadatos de HuggingFace: la model card remite a la licencia del modelo base, que habitualmente es CC-BY 4.0 en OPUS-MT, pero debe verificarse antes de cualquier uso comercial.
- El repositorio no incluye versiones cuantizadas ni formato GGUF, por lo que no es directamente compatible con `llama.cpp` u `Ollama`.
- No dispone de capacidades de dialogo, razonamiento, codigo ni tool calling; no debe emplearse para tareas distintas de la traduccion.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado en 2026, por lo que tiene muy poca validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-ti-en
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ti-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
