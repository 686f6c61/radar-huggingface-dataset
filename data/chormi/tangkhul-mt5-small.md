# chormi/tangkhul-mt5-small

## Resumen

`chormi/tangkhul-mt5-small` es un ajuste fino del modelo multilingue mT5-small publicado por el usuario chormi en HuggingFace. Tangkhul es una lengua sino-tibetana hablada principalmente en el distrito de Ukhrul (Manipur, India), con un numero de hablantes reducido y una presencia muy limitada en corpus digitales. El nombre del repositorio sugiere un modelo orientado a traduccion automatica hacia o desde tangkhul, aunque la ficha del autor no especifica la tarea, la direccion de traduccion ni los pares de idiomas entrenados.

El modelo cuenta con 300.176.768 parametros reales en formato safetensors, lo que coincide exactamente con la configuracion canonica de mT5-small (arquitectura transformer encoder-decoder). El repositorio ocupa 13,2 GB, un tamano desproporcionado para un modelo de 300 M de parametros, lo que apunta a la presencia de multiples checkpoints, estados de optimizador o artefactos de entrenamiento intermedios.

Su relevancia es acotada pero real: los modelos de traduccion para lenguas de bajos recursos como el tangkhul son escasos, y un ajuste sobre mT5-small es una via habitual para generar traducciones en entornos con hardware limitado. Ahora bien, la ausencia total de documentacion (sin licencia, sin idiomas declarados, sin pipeline, sin datos de entrenamiento) limita seriamente su evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mT5-small; inferido a partir del recuento de parametros y el tag `mt5`) |
| Parametros totales | 300.176.768 (dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha; la arquitectura mT5-small base opera con secuencias de 512 tokens y posiciones relativas extendidas a 1024 en el modelo original |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se han subido variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (por el nombre se infiere tangkhul, sin confirmar idioma pivote ni direccion) |
| Licencia | no disponible (la ficha no declara licencia; mT5 base se publica bajo Apache 2.0, pero esa licencia no se hereda automaticamente en el ajuste) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,2 GB |
| Descargas / likes | 27 descargas, 0 likes |
| Fecha de creacion / actualizacion | 2026-09-20 / 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es la de mT5-small: un transformer encoder-decoder con atencion completa, normalizacion previa a cada subcapa, embeddings de posicion relativos y vocabulario SentencePiece multilingue compartido entre encoder, decoder y capa de salida. El recuento de parametros (300.176.768) coincide con la configuracion publicada por Google Research, lo que permite asumir que el ajuste se realizo desde `google/mt5-small` sin modificaciones estructurales. Al ser un modelo encoder-decoder con prefijos de tarea, es adecuado tanto para traduccion como para resumen o generacion condicionada.

No hay informacion disponible sobre el proceso de entrenamiento: se desconocen el numero de tokens, la composicion del corpus, el uso de datos paralelos, si hubo aumento de datos, tecnicas de regularizacion, decodificacion especulativa en inferencia o etapas de ajuste por preferencias (RLHF/DPO). El tamano del repositorio (13,2 GB) sugiere que se conservaron checkpoints intermedios, estados del optimizador o copias en distintas precisiones, pero no es posible confirmarlo desde la informacion proporcionada. Tampoco se documenta ninguna innovacion tecnica especifica mas alla del propio ajuste sobre mT5-small.

## Capacidades

Las capacidades reales del modelo no estan documentadas por el autor. A partir del tag `mt5` y del nombre del repositorio solo pueden enumerarse las capacidades potenciales de la arquitectura base, pendientes de verificacion empirica:

- Generacion de texto condicionada mediante prefijos de tarea (formato habitual de mT5).
- Traduccion automatica, presumiblemente en el par o pares que involucren tangkhul; la direccion y los idiomas pivote no estan disponibles.
- Capacidad multilingue heredada del vocabulario de mT5 (aproximadamente 101 idiomas en el modelo base), aunque el ajuste puede haber degradado el rendimiento en idiomas no vistos durante el entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es una capacidad esperable en un modelo de 300 M de tipo encoder-decoder).
- Capacidades de vision, audio o modo "thinking": no disponibles.
- Razonamiento matematico y generacion de codigo: no documentados y poco probables a este tamano.

## Casos de uso

- Traduccion de tangkhul a un idioma pivote (por ejemplo, ingles o hindi): caso de uso principal sugerido por el nombre del modelo. Requiere validacion previa con hablantes nativos, dado que no hay evaluacion publicada.
- Traduccion asistida en documentacion administrativa local: digitalizacion de avisos, formularios o comunicaciones publicas dirigidas a comunidades tangkhul, con revision humana obligatoria.
- Preservacion linguistica y compilacion de corpus: uso del modelo para generar borradores de traduccion que despues se corrigen y se incorporan a corpus paralelos abiertos de la lengua.
- Herramientas educativas: apoyo a materiales bilingues en escuelas de Manipur, siempre que exista supervision docente y no se use como fuente unica.
- Investigacion en traduccion de bajos recursos: el modelo sirve como linea base de 300 M de parametros para comparar con sistemas mas grandes (NLLB, IndicTrans2) y medir la ganancia real del ajuste.
- Despliegue en hardware modesto: su tamano permite ejecutarlo en una GPU de consumo o incluso en CPU para tareas por lotes de baja frecuencia, algo inviable con modelos de traduccion de 1 B o 7 B de parametros.
- Preprocesado o normalizacion de texto tangkhul: limpieza, transliteracion o generacion de variantes ortograficas dentro de un pipeline de ingestion de datos.

En todos los casos, la ausencia de licencia declarada y de evaluacion publicada obliga a tratar el modelo como experimental y no apto para produccion sin auditoria previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen datos de BLEU, chrF, MMLU, GSM8K ni de ninguna otra metrica en la ficha de HuggingFace, en el repositorio ni en los resultados de busqueda web, que no devolvieron ningun resultado relacionado con el modelo.

## Requisitos de hardware

Estimaciones orientativas calculadas a partir del recuento real de parametros; no han sido medidas sobre este checkpoint concreto:

- Pesos en fp32: aproximadamente 1,2 GB. En fp16/bf16: aproximadamente 600 MB. En int8: unos 300 MB. En int4: unos 150 MB.
- VRAM total para inferencia en fp16 con batch pequeno: en torno a 1-2 GB, incluyendo activaciones y cache del decoder.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Modelos como RTX 3050, RTX 3060, GTX 1660, T4, L4 o superiores son suficientes; A100 o H100 solo tendrian sentido para servir muchas peticiones en paralelo.
- Cabe en GPU de consumo: si, incluso en tarjetas de gama de entrada con 4-6 GB. Tambien es viable en CPU para inferencia por lotes con latencia no critica.
- Opciones de despliegue: `transformers` (referencia), ONNX Runtime con exportacion previa, CTranslate2 tras conversion del modelo, y servidores propios con FastAPI o TorchServe. vLLM, TGI y llama.cpp no ofrecen soporte fiable para arquitecturas encoder-decoder tipo T5/mT5, por lo que no se recomiendan sin verificacion.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint y cualquier cifra seria especulativa.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas objetivas y verificables:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chormi/tangkhul-mt5-small | 300,2 M | no disponible | no disponible | HuggingFace, 27 descargas | Ajuste sin documentar; tarea y pares de idiomas sin confirmar |
| google/mt5-small (base) | 300,2 M | 512 tokens (hasta 1024 con posiciones relativas) | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base multilingue, sin especializacion en tangkhul |
| NLLB-200-distilled-600M | 600 M | 512 tokens | CC-BY-NC-4.0 | HuggingFace | Traduccion multilingue de Meta con 200 idiomas; uso comercial restringido por licencia. No consta tangkhul entre los idiomas cubiertos |
| IndicTrans2 (variantes 200 M / 1 B) | 200 M / 1 B | 512 tokens | verificar ficha oficial | HuggingFace | Orientado a idiomas de India; cobertura de tangkhul no confirmada en la informacion disponible |

Los datos de licencia y cobertura de los modelos alternativos corresponden a sus fichas publicas y deben verificarse antes de cualquier uso comercial.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay ficha tecnica, ni descripcion de datos, ni evaluacion. No es posible determinar la calidad real del modelo sin probarlo.
- Licencia no declarada: el repositorio no indica licencia, lo que impide asumir permisos de uso comercial. La licencia Apache 2.0 de mT5 no se hereda de forma automatica al ajuste.
- Riesgo alto de alucinacion y de traducciones incorrectas, especialmente en un modelo de 300 M de parametros ajustado probablemente con corpus paralelos muy reducidos, habituales en lenguas de bajos recursos.
- Sesgos desconocidos: al no documentarse la procedencia de los datos, no puede evaluarse el sesgo de dominio, dialecto ni de variedad ortografica del tangkhul.
- Cobertura idiomatica incierta: no se especifica que variantes del tangkhul ni que idioma pivote se usaron; podria no cubrir registros formales o vocabulario tecnico.
- Degradacion potencial del multilingueismo: el ajuste sobre una sola lengua suele provocar olvido catastrofico en el resto de idiomas cubiertos por mT5.
- Limitacion de contexto: la arquitectura base maneja secuencias de 512 tokens de forma estandar, insuficiente para documentos largos sin segmentacion previa.
- Repositorio de 13,2 GB: incluye probablemente artefactos de entrenamiento innecesarios para inferencia, lo que complica la descarga y el despliegue.
- Sin mantenimiento aparente: 0 likes y 27 descargas, con creacion y ultima actualizacion el mismo dia, indican un proyecto sin validacion por parte de la comunidad.
- No apto para produccion sin una evaluacion propia con hablantes nativos y una decision explicita sobre licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chormi/tangkhul-mt5-small
- Modelo base mT5-small (referencia de arquitectura): https://huggingface.co/google/mt5-small
- Paper de mT5 (Xue et al., 2020): https://arxiv.org/abs/2010.11934
- Paper de T5 (Raffel et al., 2019), arquitectura original: https://arxiv.org/abs/1910.10683

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos correspondian a paginas genericas de motores de busqueda (Bing) sin relacion con el repositorio. No se han encontrado papers, blogs, demos, repositorios de codigo ni espacios de HuggingFace asociados a `chormi/tangkhul-mt5-small`.
