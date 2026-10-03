# malinali-app/opus-mt-ee-fi

## Resumen

malinali-app/opus-mt-ee-fi es un paquete de traducción automática neuronal para inferencia en dispositivo (on-device) publicado por malinali-app dentro del proyecto Malinali. Se trata de un reempaquetado de los pesos del modelo Helsinki-NLP/opus-mt-ee-fi, perteneciente a la familia OPUS-MT desarrollada por el grupo Language Technology de la Universidad de Helsinki. La dirección de traducción es ee → fi, esto es, desde la lengua con código ISO 639-1 ee (ewe) hacia fi (finés).

Técnicamente es un modelo Marian, un transformer encoder-decoder para tareas seq2seq, con 76.186.121 parámetros totales y un repositorio de 0,3 GB. Los pesos se distribuyen en safetensors y se acompañan de tokenizadores rápidos de Hugging Face convertidos desde SentencePiece (ficheros `tokenizer-enc.json` y `tokenizer-dec.json`), lo que facilita su carga tanto con `transformers` como con Candle a través del componente `marian_flutter`.

Su relevancia es fundamentalmente práctica: Malinali no entrena el modelo, sino que adapta el formato de pesos y tokenizadores para ejecución local sin dependencia de APIs en la nube. Al cubrir un par de bajo recurso (ewe-finés), ofrece una vía sencilla para integrar traducción sin conexión en una combinación lingüística poco atendida por los grandes modelos multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, seq2seq) |
| Parametros totales | 76.186.121 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | ee (ewe) como origen, fi (fines) como destino |
| Licencia | no disponible en la ficha; el autor remite a la licencia del modelo upstream (tipicamente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`) |
| Tokenizadores | `tokenizer-enc.json` (origen) y `tokenizer-dec.json` (destino), formato fast de Hugging Face |
| Libreria | transformers |
| Pipeline | translation (text2text-generation) |
| Modelo base | Helsinki-NLP/opus-mt-ee-fi |
| Tamano del repositorio | 0,3 GB |
| Autor | malinali-app |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura es Marian, la implementación de traducción automática neuronal de código abierto usada por Helsinki-NLP para toda la familia OPUS-MT. Se trata de un transformer encoder-decoder clásico orientado a seq2seq, con un vocabulario gestionado mediante SentencePiece. Malinali no modifica los pesos entrenados: su aportación consiste en convertir los tokenizadores SentencePiece originales a ficheros JSON de tokenizador rápido de Hugging Face y en publicar los pesos en safetensors, de modo que puedan cargarse en Candle mediante `marian_flutter` para inferencia en dispositivo.

No se proporciona información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset, ni sobre si hubo etapas de RLHF, DPO o ajuste supervisado adicional. El modelo procede del entrenamiento original de Helsinki-NLP sobre corpus OPUS, pero la ficha no detalla cifras. La única innovación atribuible a este repositorio es de empaquetado y despliegue, no de modelado.

## Capacidades

- Traducción automática unidireccional de ewe (ee) a finés (fi).
- Generación de texto seq2seq bajo la etiqueta de pipeline `text2text-generation`.
- Tokenización separada para origen y destino, con tokenizadores rápidos listos para `transformers` y Candle.
- Inferencia local en dispositivo, sin llamadas a servicios externos, gracias a la integración con Candle (`marian_flutter`).
- Compatible con Hugging Face Inference Endpoints según la etiqueta `endpoints_compatible`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio, ni modo de razonamiento explícito (thinking mode).
- Cobertura multilingüe limitada a las dos lenguas del par; no es un modelo multilingüe general.

## Casos de uso

- Traducción sin conexión en aplicaciones móviles: el paquete está pensado para Candle y `marian_flutter`, por lo que puede embeberse en una app Android o iOS que traduzca texto ewe a finés sin red, útil para hablantes de ewe residentes en Finlandia.
- Atención al ciudadano en contextos de inmigración: integración en formularios o ventanillas digitales para traducir comunicaciones y documentación básica de ewe a finés antes de que un operador humano las revise.
- Preprocesado de corpus para investigación lingüística: normalización y traducción automática de textos en ewe a finés como paso previo a análisis morfológico, alineamiento o construcción de corpus comparables.
- Accesibilidad en lectura asistida: combinación con OCR en dispositivo para traducir carteles, menús o documentos escaneados en ewe y presentarlos en finés.
- Traducción en entornos sin conectividad: uso en zonas rurales, vuelos, instalaciones aisladas o redes restringidas donde no es viable depender de una API en la nube.
- Despliegue en hardware de borde: por su tamaño de 76 millones de parámetros cabe en dispositivos tipo Raspberry Pi o mini-PC y puede ejecutar traducción por lotes de bajo volumen.
- Procesado por lotes de fondos documentales: digitalización de archivos y bibliotecas con materiales en ewe para generar versiones en finés destinadas a catalogación o búsqueda.
- Punto de partida para ajuste fino en investigación: al ser un modelo pequeño y con pesos en safetensors, sirve como base para experimentos de fine-tuning en pares de bajo recurso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye métricas BLEU, chrF, COMET ni evaluaciones de calidad sobre conjuntos de test, y tampoco se aportan comparaciones con otros sistemas para el par ewe-finés.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 76,19 millones de parámetros ocupan aproximadamente 305 MB; en fp16 unos 152 MB; en int8 unos 76 MB. Cálculos derivados del recuento de parámetros, no mediciones publicadas.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU con más de 1 GB de memoria es suficiente; una RTX 4090, A100 o H100 quedan muy por encima de lo necesario.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual e incluso en iGPU integradas. También se ejecuta en CPU.
- Hardware de borde: viable en dispositivos móviles, Raspberry Pi y mini-PC, que es el objetivo declarado del paquete mediante Candle.
- Opciones de despliegue: Candle con `marian_flutter` (vía principal), `transformers` en CPU o GPU, y Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). No se documentan variantes GGUF ni soporte explícito de vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponible. No se aportan mediciones; por el tamaño del modelo se espera latencia baja en CPU moderna, pero es una expectativa, no un dato verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion / idiomas | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|
| malinali-app/opus-mt-ee-fi | 76,19 M | ee → fi | no disponible (upstream tipicamente CC-BY 4.0) | safetensors | Candle on-device, transformers, endpoints |
| Helsinki-NLP/opus-mt-ee-fi (upstream) | 76,19 M (aprox.) | ee → fi | CC-BY 4.0 (segun el autor) | PyTorch / SentencePiece | transformers, generacion clasica |
| facebook/nllb-200-distilled-600M | 600 M (aprox.) | 200 idiomas, incluido ee y fi | CC-BY-NC 4.0 (uso no comercial) | safetensors | transformers, CTranslate2 |
| facebook/m2m100_418M | 418 M (aprox.) | 100 idiomas, multilingue | MIT | PyTorch | transformers |

El paquete de Malinali es, en esencia, el mismo modelo que el upstream de Helsinki-NLP, pero con tokenizadores rápidos y pesos safetensors orientados a Candle. Frente a alternativas multilingües como NLLB o M2M-100, es entre cinco y ocho veces más pequeño, lo que reduce costes de despliegue en dispositivo, pero carece de cobertura multilingüe y de métricas publicadas. Las cifras de NLLB y M2M-100 son aproximadas y corresponden a modelos conocidos de la misma categoría.

## Limitaciones y advertencias

- No hay benchmarks publicados, por lo que la calidad real de traducción para ewe-finés es desconocida.
- Par de bajo recurso: el ewe dispone de menos datos paralelos que lenguas como el inglés o el francés, lo que suele traducirse en una calidad inferior, especialmente en terminología especializada y expresiones idiomáticas.
- Licencia no declarada en la ficha de Hugging Face. El autor remite a la licencia del modelo upstream, típicamente CC-BY 4.0, pero conviene verificar antes de cualquier uso comercial o redistribución.
- Dirección única ee → fi: no sirve para traducir de finés a ewe, que requeriría otro modelo.
- Riesgo de alucinación en traducción: posibles errores en nombres propios, cifras, unidades y términos técnicos, frecuentes en modelos Marian pequeños. Requiere revisión humana en contextos críticos.
- Longitud de contexto no documentada: para documentos largos es prudente segmentar el texto en fragmentos.
- No se han publicado análisis de sesgos ni evaluaciones de equidad lingüística.
- Repositorio con 0 descargas y 0 likes en el momento de su creación, sin validación comunitaria ni issues conocidos.
- Solo se distribuyen pesos en safetensors; no hay variantes GGUF ni cuantizadas listas para usar.
- Metadatos de creación y actualización fechados en 2026-10-02, con apenas segundos de diferencia entre ambos, lo que sugiere una publicación automatizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-ee-fi
- Modelo base upstream: https://huggingface.co/Helsinki-NLP/opus-mt-ee-fi
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Proyecto Malinali: https://malinali.app
- Candle (framework de inferencia en Rust): https://github.com/huggingface/candle
- Corpus OPUS: https://opus.nlpl.eu/
