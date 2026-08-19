# JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed42

## Resumen

Este repositorio contiene un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. El adaptador se construye sobre el modelo base Qwen/Qwen3.5-2B y está diseñado para la investigación y evaluación de NER en corpus portugueses, específicamente el conjunto de datos lener_br. El modelo genera etiquetas y tokens en formato JSON estructurado, lo que facilita la integración en pipelines de procesamiento de lenguaje natural.

La relevancia de este artefacto radica en su enfoque generativo para NER, que difiere de los enfoques clásicos de clasificación de tokens. Al emplear generación estructurada con restricciones JSON, el modelo produce salidas con alta validez estructural (0.9993 en el conjunto de prueba), aunque la corrección semántica de los spans generados no está garantizada. El adaptador es ligero (0.1 GB) y está pensado para ser cargado con PEFT sobre la revisión exacta del modelo base indicada en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-2B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, tamano del repo 0.1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (entrenado en BF16) |
| Idiomas soportados | portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena sobre el modelo Qwen/Qwen3.5-2B en su revisión exacta `15852e8c16360a2fea060d615a32b45270f8a8fc`. El entrenamiento se realiza en precision BF16 con LoRA, sobre el dataset lener_br (corpus de NER en portugues brasileno). La seleccion del checkpoint se basa en la F1 end-to-end sobre el conjunto de validacion, sin usar el conjunto de prueba para la seleccion. La inferencia canonica se realiza con vLLM, temperatura 0, y generacion restringida a JSON con el esquema `labels_and_tokens`. La politica para salidas invalidas es prediccion vacia en la puntuacion end-to-end.

No se especifican detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. El entrenamiento es supervisado y se centra en la tarea especifica de NER generativo.

## Capacidades

- Reconocimiento de entidades nombradas en portugues, generando etiquetas y tokens en formato JSON estructurado.
- Generacion estructurada con restricciones de esquema, lo que garantiza una alta validez sintactica de las salidas (0.9993 en el conjunto de prueba).
- Inferencia determinista con temperatura 0, adecuada para tareas de extraccion reproducible.
- Compatible con el ecosistema PEFT, permitiendo cargar el adaptador sobre el modelo base Qwen/Qwen3.5-2B.
- Especifico para el esquema de anotacion de lener_br; no se ha validado en otros corpus.

## Casos de uso

- Extraccion de entidades en articulos de noticias en portugues: el modelo puede identificar personas, organizaciones, lugares y fechas en textos periodisticos, generando salidas estructuradas listas para su integracion en bases de datos o sistemas de analisis.
- Procesamiento de documentos legales: extraccion de entidades como nombres de partes, fechas y referencias normativas en contratos o sentencias, con salidas JSON que facilitan la automatizacion de flujos de trabajo juridicos.
- Analisis de redes sociales: deteccion de menciones a marcas, productos o personas en publicaciones de Twitter o Facebook, util para monitorizacion de opinion publica.
- Enriquecimiento de corpus para entrenamiento de otros modelos: las predicciones del modelo pueden servir como pseudo-etiquetas para generar datos adicionales de NER en portugues.
- Investigacion academica en NER: el adaptador permite reproducir experimentos con el corpus lener_br y comparar enfoques generativos frente a clasificadores de tokens.
- Sistemas de busqueda semantica: extraccion de entidades para indexar documentos y mejorar la recuperacion de informacion basada en entidades.

## Benchmarks y rendimiento

Los resultados reportados en la model card del autor, sobre el conjunto de prueba de lener_br, son los siguientes:

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| lener_br | 0.9001 | 0.9095 | 0.9048 | 0.9993 |

Estos resultados corresponden a una unica semilla (seed 42) y a los splits congelados del corpus. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.1 GB), pero requiere cargar el modelo base Qwen/Qwen3.5-2B, que en BF16 ocupa aproximadamente 4 GB de VRAM.
- Con cuantizacion del modelo base (por ejemplo, 4 bits), la VRAM total necesaria podria reducirse a unos 2-3 GB, lo que permitiria ejecutarlo en GPUs consumer como RTX 3060 o superiores.
- Para inferencia en produccion, se recomienda vLLM (como se indica en la configuracion canonica) o TGI, que soportan generacion estructurada y alta concurrencia.
- En hardware sin BF16, se puede usar precision FP16 o cuantizacion, aunque los resultados podrian variar ligeramente.
- No se dispone de datos de latencia o throughput especificos para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El adaptador es un artefacto de investigacion especifico para lener_br, y no se han publicado comparaciones con otros sistemas de NER en portugues.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos; la validez estructural no implica correccion de contenido.
- El modelo solo se ha evaluado en el corpus lener_br; su rendimiento en otros dominios o esquemas de anotacion no ha sido validado.
- Los resultados reportados corresponden a una unica semilla; la incertidumbre entre semillas requiere completar la matriz de tres semillas mencionada en la documentacion.
- La licencia del modelo no esta disponible, por lo que se debe revisar la licencia del modelo base Qwen/Qwen3.5-2B y la del dataset lener_br antes de cualquier uso comercial.
- No ha sido validado para decisiones de alto riesgo o autonomas; su uso en produccion debe ir acompanado de una evaluacion de errores en el dominio objetivo.
- La reproduccion exacta requiere la revision exacta del modelo base indicada y las versiones registradas en `research/manifest.json`.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed42
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
