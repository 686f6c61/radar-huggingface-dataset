# arkanit/badini-nllb-translator

## Resumen

El modelo arkanit/badini-nllb-translator es un adaptador LoRA (PEFT) entrenado sobre facebook/nllb-200-distilled-600M, el modelo de traducción multilingüe de Meta con unos 600 millones de parámetros. Lo desarrolla Arkan Musa Zubair y su objetivo es traducir de forma bidireccional entre inglés y badini (kurdo bahdini, variante del kurmanji meridional) escrito en alfabeto arabo-kurdo, etiquetado como ckb_Arab en el tokenizador del modelo base.

El problema que resuelve es concreto: NLLB-200 no dispone de una etiqueta propia para el badini y, al traducir hacia ckb_Arab, tiende a producir soraní (kurdo central) por defecto, tanto en vocabulario como en gramática. Este adaptador se presenta como una corrección de ese sesgo, con especial atención a la concordancia de izafet masculino y femenino (-ا / -ێ), a las construcciones ergativas y a preposiciones propias del badini como ژ en lugar de لە.

Es relevante porque el badini es una variedad de bajos recursos con poca cobertura en herramientas de traducción automática. El adaptador es pequeño (el repositorio ocupa 0,1 GB), se publica con licencia MIT y se integra en el ecosistema transformers mediante PEFT, aunque hereda las restricciones de licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder denso (modelo base NLLB-200 distilled); el repositorio contiene un adaptador LoRA/PEFT, no los pesos completos |
| Parametros totales | Aproximadamente 600 M en el modelo base facebook/nllb-200-distilled-600M; el adaptador LoRA anade un numero reducido de parametros entrenables (no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens heredados del modelo base NLLB-200; no especificado en la model card |
| Tipos de cuantizacion | No especificados por el autor; el ejemplo oficial carga el modelo base en float16. Al ser un modelo transformers estandar, admite fp16, int8 e int4 con las herramientas habituales, aunque no hay validacion publicada |
| Idiomas soportados | Kurdo badini (ku, escritura arabo-kurda, etiqueta ckb_Arab) e ingles (en) |
| Licencia | MIT para el adaptador; el modelo base facebook/nllb-200-distilled-600M se distribuye bajo CC-BY-NC-4.0 (uso no comercial) |
| Formato de pesos | safetensors (adaptador LoRA + tokenizer). Requiere descargar por separado el modelo base en safetensors |
| Tamano del repositorio | 0,1 GB |
| Pipeline | translation |
| Metrica declarada | bleu (sin valores publicados) |
| Fecha de publicacion | 2026-09-21 (creacion y ultima actualizacion) |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

La base es un transformer encoder-decoder de tipo sequence-to-sequence, la arquitectura de NLLB-200 (familia derivada de M2M-100), con un tokenizador SentencePiece compartido y mas de 200 etiquetas de idioma. La traduccion se controla con `forced_bos_token_id`, fijando el token de idioma destino; en el ejemplo de la model card se usa `eng_Latn` como origen y `ckb_Arab` como destino, con `num_beams=4` y `max_length=64`.

El adaptador se entrena con LoRA sobre PEFT, de modo que solo se actualiza una parte reducida de los pesos y el resultado se aplica en tiempo de inferencia con `PeftModel.from_pretrained`. La model card no detalla el numero de tokens de entrenamiento, la composicion del corpus, los hiperparametros de LoRA (rango, alpha, dropout) ni si se aplicaron etapas de RLHF o DPO: esa informacion no esta disponible. La innovacion declarada es de tipo linguistico mas que arquitectonica: evitar la deriva hacia sorani que produce el modelo base y preservar el vocabulario y la morfologia propios del badini, incluida la escritura arabo-kurda.

## Capacidades

- Traduccion bidireccional ingles a badini y badini a ingles.
- Generacion de texto en alfabeto arabo-kurdo con la etiqueta ckb_Arab.
- Reproduccion de concordancia de izafet masculino y femenino (-ا / -ێ) segun el autor.
- Uso de construcciones ergativas y de preposiciones propias del badini (ژ en lugar de لە).
- Reduccion declarada de la interferencia de sorani en vocabulario y gramatica.
- Compatibilidad con el pipeline `translation` de HuggingFace y con el flujo estandar de transformers y PEFT.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta uso como agente ni razonamiento multi-paso.
- No hay capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- El alcance multilingue se limita a los dos idiomas declarados; no se confirma el resto de los 200 idiomas del modelo base tras el ajuste fino.

## Casos de uso

- Traduccion de documentacion tecnica y material educativo: el adaptador convierte manuales o apuntes del ingles al badini manteniendo terminologia y estructuras propias de la variedad, algo que el modelo base tiende a sustituir por sorani.
- Localizacion de sitios web y aplicaciones: integrado mediante el pipeline `translation` de transformers, permite traducir cadenas de interfaz y contenidos dinamicos al badini como paso previo a revision humana.
- Subtitulado y traduccion de contenido audiovisual: con segmentos de menos de 512 tokens, encaja bien en el flujo habitual de subtitulado, donde cada linea se procesa de forma independiente.
- Soporte al cliente en badini: el modelo traduce consultas de usuarios a ingles para que un sistema de atencion las procese, y devuelve la respuesta al badini.
- Creacion de corpus paralelos: puede generar pares ingles-badini a gran escala para entrenar o evaluar otros modelos, dada la escasez de datos en esta variedad.
- Post-edicion asistida para traductores: genera un primer borrador que el profesional revisa, reduciendo el tiempo de traduccion en un idioma con pocos recursos.
- Digitalizacion y traduccion de textos literarios o historicos en alfabeto arabo-kurdo: util para archivos y proyectos de preservacion linguistica que necesitan una version en ingles.
- Investigacion en PNL de bajos recursos: sirve como punto de comparacion frente a NLLB-200 sin ajustar para medir la deriva dialectal entre badini y sorani.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la metrica `bleu` en los metadatos, pero no incluye ningun valor numerico ni conjunto de evaluacion, y no se proporcionan comparaciones con NLLB-200 sin ajustar ni con otros sistemas de traduccion. Tampoco se aportan cifras de latencia o throughput.

## Requisitos de hardware

- El adaptador ocupa 0,1 GB; hay que anadir el modelo base de 600 M de parametros.
- VRAM estimada para el modelo base: alrededor de 2,4 GB en fp32, 1,2 GB en fp16, 0,6 GB en int8 y 0,35 GB en int4, mas el consumo adicional del tokenizer, del adaptador y de las memorias intermedias de `generate`.
- Con `num_beams=4` y lotes pequenos, conviene reservar entre 2 y 3 GB de VRAM en fp16 para evitar reasignaciones.
- Cabe en cualquier GPU de consumo con 4 GB o mas: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090. Tambien es viable en CPU, con mayor latencia.
- GPU recomendadas para servicio: NVIDIA T4, L4, A10G o RTX 4090 para cargas medias. A100 o H100 no aportan ventaja apreciable a este tamano.
- Opciones de despliegue: transformers con PEFT (flujo documentado por el autor), exportacion a ONNX o CTranslate2 para inferencia optimizada, o un servicio propio con FastAPI. No hay soporte documentado para este adaptador en vLLM, TGI, llama.cpp u Ollama, ni conversion GGUF publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|
| arkanit/badini-nllb-translator | ~600 M (base) + adaptador LoRA | 512 tokens | badini e ingles | MIT (adaptador); base CC-BY-NC-4.0 | Badini, ajuste dialectal explicito |
| facebook/nllb-200-distilled-600M | 600 M | 512 tokens | Mas de 200 idiomas | CC-BY-NC-4.0 | Multilingue general; deriva hacia sorani en ckb_Arab |
| facebook/nllb-200-distilled-1.3B | 1,3 B | 512 tokens | Mas de 200 idiomas | CC-BY-NC-4.0 | Multilingue general, mayor capacidad |
| Servicios propietarios de traduccion en la nube | No disponible | No disponible | Cientos de idiomas | Propietaria | Cobertura amplia, sin control sobre el tratamiento del badini |

No se han identificado en la informacion disponible otros modelos publicos especializados especificamente en badini con los que establecer una comparacion directa. Las alternativas de la tabla se basan en el propio modelo base y en su version de mayor tamano.

## Limitaciones y advertencias

- Licencia: el adaptador es MIT, pero el modelo base NLLB-200 se distribuye bajo CC-BY-NC-4.0, lo que restringe el uso comercial. Cualquier despliegue en produccion debe verificar esa condicion antes de continuar.
- No hay resultados de benchmarks publicados: no existe evidencia cuantitativa de la calidad de traduccion ni de la mejora frente al modelo base.
- La model card no documenta el corpus de entrenamiento, su tamano, su dominio ni su procedencia, por lo que se desconocen los sesgos y la cobertura real de registros y tematicas.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que implica una validacion practicamente nula por parte de la comunidad.
- La etiqueta ckb_Arab es compartida con el sorani en el tokenizador del modelo base; aunque el ajuste busca reducir la interferencia, el riesgo de mezcla dialectal no puede descartarse sin evaluacion externa.
- Solo cubre badini e ingles. No hay soporte confirmado para otras variedades del kurdo, como kurmanji en alfabeto latino o sorani, ni para otros idiomas del modelo base tras el ajuste.
- El contexto de 512 tokens obliga a segmentar documentos largos, lo que puede romper la coherencia entre fragmentos.
- Riesgo de alucinacion y de traducciones plausibles pero incorrectas, especialmente con nombres propios, cifras, fechas y terminologia especializada.
- El tokenizador es el original del modelo base, no adaptado al badini, lo que puede producir segmentaciones suboptimas y un manejo deficiente de morfologia aglutinante.
- Es un modelo exclusivamente de texto: no procesa audio, imagen ni voz.
- En cualquier flujo de produccion se recomienda revision humana o post-edicion, dado que no existen metricas publicadas de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkanit/badini-nllb-translator
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Articulo de NLLB-200: https://arxiv.org/abs/2207.04672
- Repositorio de referencia de NLLB en fairseq: https://github.com/facebookresearch/fairseq/tree/nllb
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion del pipeline de traduccion de transformers: https://huggingface.co/docs/transformers/tasks/translation
- Sitio web del autor: https://tavbit.com
- Contacto del autor: iarkanit@gmail.com

Nota sobre la busqueda web: los resultados obtenidos corresponden a paginas de ayuda de Google Translate en polaco y a articulos sobre traductores Bluetooth, sin relacion con este modelo. No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) asociados a arkanit/badini-nllb-translator.
