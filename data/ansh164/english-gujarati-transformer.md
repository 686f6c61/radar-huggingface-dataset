# ansh164/english-gujarati-transformer

## Resumen

El modelo `ansh164/english-gujarati-transformer` es un sistema de traducción automática neuronal (NMT) de inglés a gujarati desarrollado por el usuario AnshBhavsar1654 (ansh164) como proyecto de aprendizaje y pieza de portafolio. Se trata de un transformer encoder-decoder construido desde cero, sin partir de un modelo preentrenado, con 6 capas en el encoder y 6 en el decoder, 8 cabezas de atención, dimensión de modelo de 512 y feed-forward de 2048, sumando 60,5 millones de parámetros. Su relevancia radica en que demuestra el ciclo completo de construcción de un sistema NMT (tokenización, entrenamiento, evaluación y despliegue) para un par de idiomas con pocos recursos como es el inglés-gujarati.

El modelo se entrenó sobre una porción de 1 millón de pares del dataset público English to Gujarati Machine Translation Dataset de Kaggle, del cual sobrevivieron 990.453 pares tras limpieza y deduplicación, usándose 976.296 para entrenamiento. La longitud máxima es de 256 tokens y utiliza una tokenización SentencePiece unigram conjunta de 32.000 piezas con byte fallback, lo que evita tokens desconocidos. La decodificación por defecto es beam search con beam 5.

Los resultados publicados son modestos: BLEU de 16,68, chrF++ de 40,48 y TER de 74,96 sobre un split de test de 2.000 frases, con advertencias explícitas del autor sobre la imposibilidad de regenerar dicho split y la contaminación de algunas métricas. El modelo no está pensado para producción ni para textos críticos, sino para comprender la idea general de frases del dominio general y como referencia educativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder, 6 + 6 capas, 8 cabezas, d_model 512, feed-forward 2048, pre-LayerNorm |
| Parámetros totales | 60,5 M (embeddings de entrada, de entrada del decoder y proyección de salida compartidos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | No disponible (pesos en fp16 en el checkpoint) |
| Idiomas soportados | Inglés (en) y gujarati (gu) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch propio (`best.pt`, 122 MB), no compatible con `transformers` |
| Vocabulario | SentencePiece unigram conjunto en+gu, 32.000 piezas, con byte fallback |
| Decodificación | Beam search, beam 5 por defecto |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder clásico de tipo Vaswani, con 6 capas en cada bloque, 8 cabezas de atención, dimensión de modelo de 512 y capa feed-forward de 2048, usando pre-LayerNorm. Los embeddings de entrada del encoder, los del decoder y la proyección de salida están compartidos, lo que reduce el recuento total a 60,5 millones de parámetros. La tokenización se realiza con un modelo SentencePiece unigram conjunto para inglés y gujarati de 32.000 piezas con byte fallback, lo que garantiza que no existan tokens desconocidos. El checkpoint `best.pt` es autocontenido: incluye configuración, pesos en fp16, tokenizador y métricas en un único archivo.

El entrenamiento se realizó en Kaggle con 2×T4 durante aproximadamente 3,1 horas, usando la primera mitad (1 millón de pares) del dataset web-mined de Kaggle. Tras limpieza y deduplicación quedaron 990.453 pares, de los cuales 976.296 se usaron para entrenamiento. La limpieza descarta pares vacíos o idénticos, pares con longitudes muy dispares, frases de más de 80 palabras, texto inglés que contiene escritura gujarati y objetivos gujarati mayoritariamente en escritura latina. No se documenta uso de RLHF, DPO ni ninguna innovación técnica destacable; el autor indica que el código del repositorio es una refactorización del notebook original y que no hay caché de clave/valor en la decodificación.

## Capacidades

- Traducción de frases sueltas de inglés a gujarati, a nivel de oración (no de párrafo).
- Comprensión de la idea general de texto inglés de dominio general, con estilo periodístico y conversacional.
- Manejo de vocabulario abierto gracias al byte fallback del tokenizador SentencePiece (sin tokens desconocidos).
- Decodificación configurable mediante beam search (beam 5 por defecto).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada exclusivamente al par inglés-gujarati.
- No mantiene contexto entre oraciones: la aplicación divide los párrafos en frases antes de traducir.

## Casos de uso

- Traducción de titulares y noticias breves: el modelo se entrenó sobre texto web y periodístico, por lo que frases cortas de actualidad encajan en su dominio; útil para obtener una idea general del contenido en gujarati.
- Prototipado educativo de sistemas NMT: sirve como base para aprender el ciclo completo (tokenización, entrenamiento, evaluación con sacrebleu y despliegue con Streamlit) sin depender de modelos preentrenados.
- Generación de borradores de subtítulos o frases conversacionales: con beam 5 y frases de menos de 10 palabras, puede producir borradores que un hablante nativo revise después.
- Pre-traducción asistida para revisión humana: integrado en un flujo donde un traductor gujarati corrige la salida, puede acelerar la traducción de contenido de dominio general no crítico.
- Demostración interactiva en Streamlit: el repositorio incluye una app de demostración que permite probar traducciones frase a frase en local o en un servidor pequeño.
- Investigación sobre NMT de bajo recursos: permite experimentar con arquitecturas y tokenizadores para un par de idiomas con pocos recursos, comparando configuraciones de beam y limpieza de datos.
- Filtrado o clasificación aproximada de pares bilingües: la salida puede usarse como señal débil para descartar traducciones claramente erróneas en un corpus mayor, siempre con revisión posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un split de test de 2.000 frases del dataset English to Gujarati Machine Translation Dataset (Kaggle), con sacrebleu (BLEU, chrF++, TER). Métricas no verificadas (`verified: false`).

| Decodificación | BLEU | chrF++ | TER ↓ |
|---|---|---|---|
| Greedy | 16,28 | 40,06 | 76,08 |
| Beam 5 | 16,68 | 40,48 | 74,96 |

Advertencias del autor sobre estas cifras:

- El split de test de la ejecución 1 no se puede regenerar: la copia local del corpus difiere de la de Kaggle y eso reordena todo el split.
- El conjunto de evaluación congelado en `data/eval/` es distinto, y la ejecución 1 ha visto muchas de sus frases. Puntuarla sobre sus primeras 200 frases da chrF++ 45,6 y BLEU 22,5, cifras infladas por solapamiento que no deben citarse como calidad.
- No se han medido puntuaciones por longitud de frase, dominio o temática para la ejecución 1.
- Solo se han usado métricas automáticas; no hay evaluación humana.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 122 MB en fp16 y el modelo tiene 60,5 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es suficiente; también funciona en CPU.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en CPU para uso individual.
- Opciones de despliegue: el modelo no es compatible con `transformers`, vLLM, TGI ni llama.cpp. Se carga mediante el paquete `en_gu` del repositorio de GitHub (`pip install git+https://github.com/AnshBhavsar1654/en-gu-transformer`) y `hf_hub_download` para obtener `best.pt`. Incluye una app de demostración en Streamlit.
- Latencia estimada: medida en CPU de portátil de desarrollo, una frase a la vez (40 frases de test, beam 5), p95 ≈ 0,8 s por frase. La decodificación recalcula el decoder completo en cada paso (sin caché de clave/valor), por lo que el autor la describe como una cifra a mejorar, no como objetivo.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la información proporcionada. Como referencia cualitativa:

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ansh164/english-gujarati-transformer | 60,5 M | 256 tokens | Transformer from scratch, en→gu | No disponible | Hugging Face + GitHub |
| Modelos NMT multilingües tipo NLLB-200 (referencia) | No disponible en esta ficha | No disponible en esta ficha | NMT multilingüe preentrenado | No disponible en esta ficha | No disponible en esta ficha |
| Modelos NMT tipo MarianMT (referencia) | No disponible en esta ficha | No disponible en esta ficha | Transformer encoder-decoder preentrenado | No disponible en esta ficha | No disponible en esta ficha |

No se han publicado en la información disponible comparaciones directas con alternativas concretas; los datos de los modelos de referencia no deben tomarse como cifras de esta ficha.

## Limitaciones y advertencias

- Calidad modesta (BLEU ≈ 17): se esperan elecciones de palabras incorrectas, contenido omitido o inventado y errores gramaticales, especialmente en frases largas o poco habituales.
- Traducción frase a frase: no hay contexto más allá de una sola oración; la aplicación divide los párrafos en frases antes de traducir.
- Salida degenerada: como en la mayoría de NMT neuronal, puede repetir palabras o producir texto fluido sin relación con la entrada, sobre todo con entradas fuera de dominio como código, tablas o texto no inglés.
- Sesgo de dominio: el texto de entrenamiento es material web y periodístico, por lo que el habla informal, los dialectos y el lenguaje técnico o especializado se manejan peor.
- Sesgo social: no se ha analizado el sesgo de género, casta, religión u otros en los datos ni en la salida; el texto paralelo web-mined es conocido por contenerlos.
- Entidades y números (nombres, fechas, importes) pueden alterarse o traducirse mal.
- Restricciones de licencia: la licencia del modelo no está disponible y la del dataset de Kaggle y la procedencia de su texto no han sido verificadas; debe comprobarse antes de cualquier uso más allá del aprendizaje personal. El autor desaconseja explícitamente el uso en texto legal, médico, financiero o crítico para la seguridad, así como traducciones oficiales o publicadas sin revisión de un hablante de gujarati.
- Métricas no verificadas y con advertencias de contaminación del split de test; no deben citarse como calidad absoluta.
- Sin evaluación humana: solo se han usado métricas automáticas.
- Formato propietario: no es compatible con el ecosistema `transformers`, lo que limita su integración en pipelines estándar.

## Enlaces

- Hugging Face: https://huggingface.co/ansh164/english-gujarati-transformer
- Repositorio GitHub del modelo: https://github.com/AnshBhavsar1654/en-gu-transformer
- Dataset de Kaggle: https://www.kaggle.com/datasets/parvmodi/english-to-gujarati-machine-translation-dataset
