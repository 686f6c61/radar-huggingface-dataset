# olaverse/lid-neural-608

## Resumen

lid-neural-608 es un clasificador de identificacion de idioma (language identification, LID) desarrollado por olaverse, construido sobre el encoder ModernBERT `jhu-clsp/mmBERT-small`. Resuelve la tarea de determinar el idioma de un texto de entrada etiquetandolo con codigo ISO 639-3 e ISO 15924 de escritura (por ejemplo `yor_Latn` o `srp_Cyrl`), cubriendo 608 etiquetas de idioma sobre 567 codigos ISO 639-3 distintos y 36 sistemas de escritura. Su orientacion es explicitamente "African-first": buena parte del catalogo corresponde a lenguas africanas de bajos recursos, ademas de un amplio barrido de lenguas europeas, asiaticas, americanas y oceanicas.

El modelo tiene 140,9 millones de parametros segun los pesos safetensors publicados, de los cuales aproximadamente 98 millones corresponden al embedding del vocabulario multilingue segun la model card. Es un clasificador de secuencia con pooling de medias sobre el encoder, con una ventana de entrada de hasta 512 tokens (unas 200 palabras). La relevancia actual del modelo esta en su combinacion de cobertura amplia (608 idiomas), robustez a entradas ruidosas (erratas, diacriticos ausentes, URLs, emoji) y dos modos de calibracion en un mismo modelo: modo cobertura, que trata todos los idiomas por igual, y modo trafico, calibrado a la frecuencia real de idiomas en trafico web.

La model card reporta resultados competitivos frente a alternativas establecidas: 0,867 de accuracy y 0,862 de macro-F1 en un conjunto de test de 240.000 muestras, por delante de GlotLID (0,783 / 0,795) y de su hermano fastText lid-lite-608. La licencia Apache-2.0 y el hecho de derivar de un modelo base con licencia MIT lo hacen apto para uso comercial, algo poco habitual en modelos LID de cobertura amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder (sequence classification con mean pooling), fine-tune de `jhu-clsp/mmBERT-small` |
| Parametros totales | 140.876.001 (140M; ~98M corresponden al embedding del vocabulario multilingue) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (aprox. 200 palabras); textos mas largos se truncan |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 608 etiquetas (567 codigos ISO 639-3 distintos, 36 escrituras) + clase de ruido `zxx_Zxxx` |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos de interes: tamano del repositorio 0,6 GB, pipeline `text-classification`, etiquetas en formato ISO 639-3 + ISO 15924 (fichero `labels.json`), compatible con text-embeddings-inference y endpoints.

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencia sobre un encoder ModernBERT de tamano small, con pooling de medias de las representaciones de los tokens como agregacion para la cabeza de clasificacion. ModernBERT introduce mejoras sobre BERT clasico como attention con rotacion posicional (RoPE), alternancia de capas de attention global y local, y mayor eficiencia en contextos largos; aqui se aprovecha con una ventana de 512 tokens. El vocabulario multilingue domina el recuento de parametros: aproximadamente 98M de los 140M totales estan en el embedding, lo que es coherente con una cobertura de 608 etiquetas y 36 escrituras.

El entrenamiento se realizo sobre 7,86 millones de muestras (el dato aparece truncado en la informacion disponible, por lo que no se puede confirmar la composicion completa del dataset). La model card indica que se uso datos comercialmente utilizables y que el entrenamiento incorporo ruido deliberado: erratas, diacriticos omitidos, URLs, emoji y frases conversacionales, ademas de una clase dedicada `zxx_Zxxx` para numeros, URLs y codigo. No se especifica en la informacion disponible si hubo RLHF, DPO u otras fases de alineacion (para un clasificador, lo habitual seria entrenamiento supervisado directo). La innovacion destacable es la doble calibracion: modo cobertura (todas las lenguas con peso equivalente) y modo trafico (recalibrado a la frecuencia real de idiomas en trafico web), lo que permite usar el mismo checkpoint para minado de corpus y para enrutado de entrada de usuario.

## Capacidades

- Identificacion de idioma a nivel de etiqueta ISO 639-3 + escritura ISO 15924 (`yor_Latn`, `srp_Cyrl`, etc.) sobre 608 etiquetas.
- Clasificacion de entradas muy cortas: la model card reporta 0,906 de accuracy en entradas de 1 a 5 palabras en modo trafico.
- Robustez a entrada ruidosa: erratas, diacriticos ausentes, URLs, emoji y frases conversacionales.
- Clase de ruido dedicada `zxx_Zxxx` para numeros, URLs y codigo, evitando forzar una etiqueta de idioma cuando no la hay.
- Dos modos de operacion en un unico checkpoint: cobertura (equitativo por idioma) y trafico (calibrado a frecuencia real).
- Cobertura amplia de lenguas africanas de bajos recursos junto a lenguas europeas, asiaticas, americanas y oceanicas.
- No es un modelo generativo: no hace tool calling, no soporta agentes ni razonamiento multi-paso, y no tiene vision ni audio. Su unica tarea es clasificacion de texto.

## Casos de uso

- Enrutado de idioma en pipelines de atencion al cliente: clasificar el mensaje entrante de 1 a 5 palabras y derivarlo al agente o plantilla del idioma correcto, aprovechando el 0,906 de accuracy en entradas cortas en modo trafico.
- Construccion y filtrado de corpus multilingues: usar el modo cobertura para etiquetar grandes volumenes de texto web y separar lenguas de bajos recursos, con throughput de ~1.100 textos/s en una A100 a longitudes mixtas.
- Minado de datos para lenguas africanas: identificar textos en lenguas como yoruba, hausa, amharica, zulú o somali dentro de crawls masivos, apoyandose en la cobertura de 567 codigos ISO 639-3.
- Preprocesamiento para traduccion automatica o TTS: seleccionar el modelo o la voz adecuada segun el idioma detectado antes de enviar el texto al sistema downstream.
- Moderacion y analitica de contenido web: clasificar comentarios y resenas por idioma para segmentar metricas, con la clase `zxx_Zxxx` evitando falsos positivos sobre numeros, URLs y codigo.
- Limpieza de datasets de entrenamiento: detectar y descartar muestras cuyo idioma declarado no coincide con el detectado, usando el modo cobertura para no penalizar lenguas minoritarias.
- Deteccion de idioma en buscadores o sistemas de recuperacion: etiquetar consultas cortas y aplicar filtros o ranking por idioma, con ~9.900 textos/s en entradas de 1 a 5 palabras en una A100.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre un test held-out de 240.000 muestras:

| Metrica | lid-neural-608 | GlotLID | lid-lite-608 (fastText) | fastText LID de Meta |
|---|---|---|---|---|
| Accuracy (608 idiomas) | 0,867 | 0,783 | no disponible en la informacion | no disponible en la informacion |
| Macro-F1 (608 idiomas) | 0,862 | 0,795 | no disponible en la informacion | no disponible en la informacion |
| Accuracy modo trafico (ponderado web) | 0,960 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Accuracy en entradas de 1-5 palabras | 0,906 | 0,808 | no disponible en la informacion | 0,764 |
| Accuracy en frases cotidianas (saludos, botones web) | 0,943 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Tatoeba held-out | 0,930 | 0,868 | no disponible en la informacion | no disponible en la informacion |
| UDHR-LID | 0,914 (mejor de los comparados) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

Rendimiento de inferencia segun la model card: ~1.100 textos/s en una A100 con longitudes mixtas y ~9.900 textos/s con entradas de 1 a 5 palabras.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa 0,6 GB; en fp32 son aproximadamente 0,56 GB de pesos y en fp16 unos 0,28 GB. Con activaciones y overhead de runtime, cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 4090, RTX 3090, RTX 4060 Ti o incluso GPUs de portatil con 4 GB. Para throughput alto, A100 o H100 (los ~1.100 textos/s y ~9.900 textos/s citados son sobre A100).
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM; tambien corre en CPU para volumenes moderados.
- Opciones de despliegue: transformers (pipeline `text-classification`), text-embeddings-inference (el repo esta marcado como compatible), API gestionada de Olaverse (`POST /v1/language-id`), y servidores de inferencia tipo TGI o vLLM no estan confirmados en la informacion disponible. llama.cpp/Ollama no aplican de forma estandar a este encoder.
- Latencia y throughput: ~1.100 textos/s en A100 con longitudes mixtas; ~9.900 textos/s en A100 con entradas de 1 a 5 palabras.

## Comparativa con modelos similares

| Modelo | Parametros | Cobertura | Contexto | Accuracy (test 240k) | Macro-F1 | Licencia |
|---|---|---|---|---|---|---|
| lid-neural-608 | 140M | 608 etiquetas (567 ISO 639-3) | 512 tokens | 0,867 | 0,862 | Apache-2.0 |
| GlotLID | no disponible en la informacion | amplia (no cuantificada aqui) | no disponible en la informacion | 0,783 | 0,795 | no disponible en la informacion |
| lid-lite-608 (fastText) | no disponible en la informacion | 608 etiquetas (mismo set) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| fastText LID de Meta | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

Segun la model card, lid-neural-608 supera a GlotLID en accuracy y macro-F1 globales, y supera tanto a GlotLID como al fastText LID de Meta en entradas cortas (0,906 frente a 0,808 y 0,764). lid-lite-608 es el hermano fastText del mismo autor, con el mismo conjunto de etiquetas y orientado a velocidad; la model card lo cita como comparado pero no ofrece sus cifras en la informacion disponible.

## Limitaciones y advertencias

- Entradas de mas de 512 tokens (unas 200 palabras) se truncan, por lo que textos largos con cambio de idioma a mitad pueden clasificarse solo por su parte inicial.
- La precision no es uniforme entre idiomas: la macro-F1 de 0,862 sobre 608 clases implica que las lenguas de muy bajos recursos tienen recall menor que las mayoritarias.
- Riesgo de confusion entre lenguas cercanas o escrituras compartidas (por ejemplo variedades arabes, eslavas con cirilico o idiomas africanos con ortografia solapada); la etiqueta ISO 639-3 + escritura ayuda a desambiguar pero no elimina el solapamiento.
- El modo trafico esta calibrado a la frecuencia real de idiomas en trafico web; usarlo sobre corpus especializados puede infrarepresentar lenguas poco frecuentes en web. Para minado de corpus conviene el modo cobertura.
- La clase `zxx_Zxxx` esta pensada para numeros, URLs y codigo, pero entradas mixtas (texto + codigo) pueden acabar en esa clase o en una etiqueta de idioma erronea.
- El modelo base `jhu-clsp/mmBERT-small` determina sesgos linguisticos heredados del corpus de entrenamiento de mmBERT; no se detallan evaluaciones de sesgo por variedad o dialecto.
- No es un modelo generativo ni valida contenido: no debe usarse como unico mecanismo de moderacion.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento citados por el autor antes de redistribuir.

## Enlaces

- Hugging Face: https://huggingface.co/olaverse/lid-neural-608
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo hermano fastText: https://huggingface.co/olaverse/lid-lite-608
- Consola de desarrollador Olaverse: https://console.olaverselab.com
- Documentacion API de identificacion de idioma: https://docs.olaverselab.com/api/language-id/
- Banner del modelo: https://cdn-uploads.huggingface.co/production/uploads/69949cbacd82af728f850c12/YOzNRwvGO_ZlTx-fpVJyl.png
