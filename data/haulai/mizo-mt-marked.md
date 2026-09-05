# haulai/mizo-mt-marked

## Resumen

El modelo `haulai/mizo-mt-marked` es un sistema de traduccion automatica neuronal del idioma mizo al ingles, desarrollado por haulai a partir del modelo base Helsinki-NLP/opus-mt-mul-en (arquitectura MarianMT). Se trata de un modelo de bajo recurso para la lengua tibeto-birmana mizo, entrenado sobre el corpus Mizo NER (441.178 oraciones con etiquetas silver-standard) con el objetivo de mejorar la traduccion de entidades nombradas mediante el marcado previo de la fuente.

Con 77.058.732 parametros y un tamano de repositorio de 0,3 GB, es un modelo compacto que puede ejecutarse en entornos con recursos limitados. La innovacion principal es el uso de un marcado de entidades en la secuencia de entrada, lo que permite preservar nombres propios, lugares y organizaciones durante la traduccion. La longitud de contexto no se indica en la documentacion disponible.

La relevancia actual del modelo radica en la escasez de recursos para lenguas tibeto-birmanas como el mizo. Modelos de este tipo pueden integrarse en pipelines de traduccion asistida, digitalizacion de documentos y sistemas de subtitulacion, donde la fidelidad en las entidades nombradas es critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | 77.058.732 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | lus (mizo) y ingles |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MarianMT, un transformer encoder-decoder preentrenado por Helsinki-NLP para traduccion multilingue. Sobre este modelo base se realizo un fine-tuning con el corpus Mizo NER (haulai/mizo-ner), compuesto por 441.178 oraciones con etiquetas silver-standard. El entrenamiento incorpora un mecanismo de marcado de entidades en la fuente, de modo que el modelo recibe la secuencia con delimitadores que senalan nombres propios.

No se han publicado detalles sobre el numero de tokens utilizados en el entrenamiento ni sobre procesos de alineacion (RLHF/DPO). El autor indica que el modelo fue entrenado exclusivamente con oraciones que contienen entidades, por lo que su comportamiento en texto sin entidades no esta probado.

## Capacidades

- Traduccion automatica de mizo a ingles con marcado previo de entidades nombradas, lo que mejora la fidelidad en nombres propios.
- Compatible con el pipeline de transformers (`pipeline("translation", model="haulai/mizo-mt-marked")`).
- Generacion de oraciones traducidas con soporte para contextos cortos.
- No soporta tool calling, vision, audio ni razonamiento multi-paso.
- Capacidades multilingues limitadas: solo cubre la direccion mizo a ingles.

## Casos de uso

- Traduccion de documentos legales mizo: el marcado de entidades permite conservar nombres de personas, lugares y organizaciones, esencial en contratos o expedientes.
- Subtitulacion de contenido audiovisual en mizo: el modelo puede traducir dialogos manteniendo los nombres propios, lo que reduce la necesidad de revision manual.
- Preservacion de entidades en textos cientificos: util para informes tecnicos o articulos que mencionen toponimos y denominaciones institucionales.
- Enriquecimiento de corpus bilingues: los resultados pueden utilizarse como candidatos a traduccion en flujos de revision humana para crear datasets.
- Integracion en sistemas de traduccion asistida para ONGs: su bajo consumo de recursos y la licencia CC BY 4.0 permiten un despliegue sencillo en proyectos humanitarios.
- Asistencia en la digitalizacion de textos mizo: ayuda a traducir y catalogar documentos historicos o administrativos en esta lengua minoritaria.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| BLEU (mizo a ingles, con marcado de entidades) | 49,53 |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. El unico dato de rendimiento disponible es el BLEU reportado por el autor, obtenido en el corpus Mizo NER.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 308 MB en FP32 y 154 MB en FP16, dado el numero de parametros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas GPUs integradas. Tambien puede ejecutarse en CPU.
- Si cabe en consumer GPU: si, en cualquier GPU domestica moderna.
- Opciones de despliegue: transformers pipeline y PyTorch. No es compatible con vLLM, llama.cpp ni Ollama, al ser un modelo Marian.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria en la informacion proporcionada. El modelo base es Helsinki-NLP/opus-mt-mul-en, pero no se han publicado resultados de BLEU para comparar.

## Limitaciones y advertencias

- Entrenado exclusivamente con oraciones que contienen entidades, por lo que su comportamiento en texto sin entidades no esta probado.
- Requiere que la fuente este marcada con el pipeline de proyeccion especifico. Usar markup de otro reconocedor reduce la ganancia de BLEU y la retencion de entidades.
- Las etiquetas silver-standard del corpus pueden contener errores, lo que podria afectar la calidad de la traduccion.
- La longitud de contexto no esta documentada; los modelos Marian suelen tener una ventana limitada.
- Sesgos potenciales derivados de los datos de entrenamiento, aunque no se han evaluado formalmente.
- La licencia CC BY 4.0 permite uso comercial y modificaciones, pero no incluye garantias de funcionamiento.

## Enlaces

- HuggingFace: https://huggingface.co/haulai/mizo-mt-marked
- Dataset Mizo NER: https://huggingface.co/datasets/haulai/mizo-ner
- Repositorio de codigo: https://github.com/thangkhanhau/mizo-ner
