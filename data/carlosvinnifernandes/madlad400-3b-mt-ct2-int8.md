# CarlosVinniFernandes/madlad400-3b-mt-ct2-int8

## Resumen

MADLAD-400 3B MT en formato CTranslate2 int8 es una conversión cuantizada del modelo de traducción automática `google/madlad400-3b-mt`, publicada por el usuario CarlosVinniFernandes. El modelo original, desarrollado por Google Research, es un transformer encoder-decoder de 3.000 millones de parámetros entrenado sobre el corpus MADLAD-400, un dataset multilingüe auditado de nivel documental que cubre 419 idiomas. Esta versión concreta reduce el peso de 11,8 GB (fp32 safetensors) a 2,9 GB mediante cuantización int8, lo que permite ejecutar traducción neuronal de calidad en hardware de consumo.

La conversión se realizó con `ct2-transformers-converter` (CTranslate2 4.9.1) usando cuantización `int8_bfloat16`, y mantiene intactos los pesos más allá de la cuantización. Está pensada para DoubleLang, una herramienta de traducción offline de EPUB bilingües, y el autor reporta unos 20 ms por frase en batch sobre una RTX 5050 de 8 GB con `int8_float16` y beam size 4, lo que supone unos 14 minutos para una novela de 17.000 frases.

Su relevancia práctica radica en que permite desplegar un modelo de traducción multilingüe de 3B parámetros en portátiles y GPUs consumer, sin depender de servicios en la nube, con licencia Apache-2.0 y soporte de decodificación por beam search en CTranslate2 tanto en CPU como en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5-like), convertido a CTranslate2 |
| Parametros totales | 3.000 millones (modelo base google/madlad400-3b-mt) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (int8_bfloat16 en la conversion; int8_float16 e int8 en inferencia) |
| Idiomas soportados | 419 idiomas en el modelo original; la model card lista fr, pt, en, es, de, it y multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (directorio de modelo), tokenizador SentencePiece (spiece.model) y tokenizer.json |
| Tamano del repositorio | 3,0 GB (2,9 GB reportados por el autor) |
| Libreria | ctranslate2 |
| Pipeline | translation |
| Modelo base | google/madlad400-3b-mt |

## Arquitectura y entrenamiento

El modelo subyacente es MADLAD-400 3B MT, un transformer encoder-decoder de 3.000 millones de parámetros derivado de la familia T5 y entrenado por Google Research sobre el corpus MADLAD-400, un dataset multilingüe auditado de nivel documental que cubre 419 idiomas. El paper asociado (arXiv:2309.04662) describe el proceso de auditoría del dataset y el entrenamiento del modelo de traducción. El modelo original se distribuye en safetensors fp32 (11,8 GB); esta conversión aplica cuantización int8 mediante CTranslate2, sin reentrenamiento ni fine-tuning adicional: los pesos son los mismos salvo la cuantización.

La innovación técnica de esta ficha no está en el modelo, sino en el empaquetado: la conversión a CTranslate2 permite inferencia optimizada con beam search, ejecución en CPU o GPU y reducción de memoria a menos de una cuarta parte del original. El idioma destino se selecciona con un token prefijo `<2xx>` (por ejemplo `<2pt>` para portugués), tal como en el modelo original. El tokenizador es SentencePiece, y la conversión copia explícitamente `spiece.model`, `tokenizer.json`, `tokenizer_config.json` y `special_tokens_map.json`.

## Capacidades

- Traducción automática multilingüe entre 419 idiomas en el modelo original, con la model card destacando fr, pt, en, es, de, it.
- Selección explícita del idioma destino mediante token prefijo `<2xx>`.
- Traducción de nivel documental (el dataset de entrenamiento es document-level).
- Decodificación con beam search (el ejemplo usa beam size 4).
- Inferencia por lotes (batch) en CPU (`compute_type="int8"`) y GPU (`compute_type="int8_float16"`).
- Ejecución completamente offline, sin llamadas a servicios externos.
- No se documentan tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Traducción offline de libros y EPUB: el caso de uso original de DoubleLang; el modelo traduce novelas completas en local, con ~14 minutos para 17.000 frases en una RTX 5050 de 8 GB, lo que lo hace adecuado para pipelines de traducción literaria sin conexión.
- Traducción por lotes en servidores sin GPU: con `device="cpu"` y `compute_type="int8"` el modelo cabe en memoria de sistema modesta y permite procesar grandes volúmenes de texto en entornos sin acelerador.
- Localización de documentación técnica: al soportar fr, pt, en, es, de, it, puede integrarse en pipelines de CI para generar versiones multilingües de manuales y READMEs.
- Subtitulado y transcripción multilingüe: traducción de segmentos cortos con beam search para generar pistas de subtítulos en varios idiomas a partir de una fuente única.
- Atención al cliente multilingüe en local: despliegue en una máquina con GPU consumer para traducir conversaciones en tiempo real sin enviar datos a terceros, relevante por privacidad.
- Investigación en traducción automática de bajos recursos: el modelo base cubre 419 idiomas, por lo que esta conversión sirve para experimentar con idiomas poco representados en hardware asequible.
- Prototipado y demos: el tamaño de 2,9 GB y la licencia Apache-2.0 facilitan incluirlo en aplicaciones de escritorio y demos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de rendimiento de inferencia: aproximadamente 20 ms por frase en batch sobre una RTX 5050 de 8 GB con `int8_float16` y beam size 4, y unos 14 minutos para una novela de 17.000 frases. No se proporcionan cifras de BLEU, COMET ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,9 GB en disco; en GPU con `int8_float16` el autor lo ejecuta en una RTX 5050 de 8 GB, por lo que 8 GB de VRAM son suficientes con margen para batch y beam search.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 5050, RTX 4060/4070, RTX 3060 de 12 GB); en el extremo profesional, A100 y H100 sobran para este tamaño.
- Cabe en GPU consumer: sí, confirmado por el autor en una RTX 5050 de 8 GB.
- Despliegue: CTranslate2 (librería nativa del artefacto), con soporte de CPU (`int8`) y GPU (`int8_float16`). No se documenta soporte para vLLM, llama.cpp ni Ollama en esta conversión.
- Latencia y throughput: ~20 ms/frase en batch con beam 4 en RTX 5050; ~14 minutos para 17.000 frases.
- Nota de plataforma: en Windows, la build CUDA de CTranslate2 requiere cuBLAS 12 (`pip install nvidia-cublas-cu12`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| CarlosVinniFernandes/madlad400-3b-mt-ct2-int8 | 3B | no disponible | Apache-2.0 | CTranslate2 int8 (2,9 GB) | Hugging Face, 0 descargas |
| google/madlad400-3b-mt | 3B | no disponible | Apache-2.0 | safetensors fp32 (11,8 GB) | Hugging Face, modelo oficial |
| NLLB-200 (Meta) | 600M a 54B | no disponible | CC-BY-NC (no comercial en varias variantes) | PyTorch/safetensors | Hugging Face |
| M2M-100 (Meta) | 418M a 12B | no disponible | MIT | PyTorch/safetensors | Hugging Face |

La ventaja de esta conversión frente al modelo original es el tamaño (2,9 GB frente a 11,8 GB) y la inferencia optimizada en CTranslate2; la desventaja es que depende de esa librería y no de transformers estándar. Frente a NLLB-200, la licencia Apache-2.0 es más permisiva para uso comercial que las variantes CC-BY-NC.

## Limitaciones y advertencias

- Es una conversión de comunidad con 0 descargas y 0 likes; no hay validación independiente de la calidad de la cuantización int8 frente al modelo original.
- La cuantización int8 puede introducir degradación de calidad en comparación con fp32; no se han publicado evaluaciones que lo cuantifiquen.
- No se documentan sesgos específicos, pero el modelo base hereda los sesgos del corpus MADLAD-400, auditado pero no exento de ellos.
- Riesgo de alucinación y de traducciones incorrectas en idiomas de bajos recursos; la model card solo destaca seis idiomas.
- La longitud de contexto no está especificada en la información disponible; para documentos largos conviene segmentar.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe citar el paper de MADLAD-400 y respetar los términos del modelo base.
- Dependencia de CTranslate2 4.9.1 y de cuBLAS 12 en Windows para la build CUDA.
- El tokenizador requiere los ficheros SentencePiece copiados en la conversión; un uso con transformers estándar no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CarlosVinniFernandes/madlad400-3b-mt-ct2-int8
- Modelo base: https://huggingface.co/google/madlad400-3b-mt
- Paper MADLAD-400: https://arxiv.org/abs/2309.04662
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Proyecto DoubleLang: https://github.com/CarlosVinniFernandes/DoubleLang
