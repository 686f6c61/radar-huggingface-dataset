# Geremia23/AquinasLatinEnglishModel

## Resumen

AquinasLatinEnglishModel es un modelo de traduccion automatica neuronal especializado en el par de idiomas latin-ingles, desarrollado por el usuario Geremia23 y publicado en Hugging Face. El modelo se ha entrenado especificamente sobre el corpus AquinasLatinEnglish, un dataset del propio autor orientado a la traduccion de textos latinos, presumiblemente vinculados a la obra de Tomas de Aquino. Con 208,6 millones de parametros, se situa en la gama de modelos de traduccion de tamano medio, adecuado para despliegue en hardware de consumo.

El modelo emplea una arquitectura encoder-decoder clasica de traduccion automatica neuronal (NMT), entrenada con la herramienta Eole. Su relevancia radica en la escasez de modelos publicos especializados en latin, un idioma con pocos recursos computacionales disponibles en comparacion con lenguas modernas. La ventana de contexto, el regimen de licencia y los detalles de composicion del dataset no estan disponibles en la informacion proporcionada.

El entrenamiento se completo en 5,5 horas sobre una GPU NVIDIA RTX PRO 6000 Blackwell Server Edition con 96 GB de VRAM, lo que indica un coste computacional moderado y un modelo disenado para fine-tuning rapido y despliegue ligero mas que para competicion en benchmarks generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NMT) |
| Parametros totales | 208.575.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Latin (la), ingles (en) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repo de 0,4 GB) |

Desglose de parametros por componente segun la model card: embeddings 32.317.440, encoder 75.524.096, decoder 100.702.208, generador 31.560. Vocabulario fuente y destino de 31.560 tokens cada uno. Parametros entrenables en bfloat16: 208.575.304.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder-decoder estandar para traduccion automatica, con vocabularios simetricos de 31.560 tokens en origen y destino. El entrenamiento se realizo con Eole (framework de NMT open source) durante 5,5 horas en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM), con CUDA 13.0, torch 2.10.0+cu128, en una instancia gratuita de Lightning.ai. Los pesos se entrenaron en bfloat16.

El dataset de entrenamiento es Geremia23/AquinasLatinEnglish, propiedad del autor. La model card reporta 53.861.702 frases procesadas (aproximadamente 5,39e7), con un batch size medio de 1866/2478/82 (probablemente train/valid/test o similar). No se especifica el numero de tokens totales ni la composicion detallada del corpus. No hay evidencia de RLHF, DPO ni tecnicas de alineacion; se trata de un entrenamiento supervisado clasico de traduccion.

## Capacidades

- Traduccion latin a ingles y, presumiblemente, ingles a latin (modelo bidireccional por vocabularios simetricos, aunque no se confirma explicitamente).
- Traduccion especializada en el dominio del corpus AquinasLatinEnglish (textos filosoficos/teologicos latinos).
- Generacion de texto traducido con decodificacion autoregresiva estandar.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad multilingue mas alla de la y en.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Traduccion de textos de Tomas de Aquino y filosofia escolastica: el modelo esta entrenado sobre un corpus especifico de este dominio, por lo que su uso principal es la traduccion de pasajes latinos teologicos y filosoficos al ingles con vocabulario tecnico adecuado.
- Digitalizacion y accesibilidad de patrimonio textual latino: traduccion de documentos historicos latinos a ingles para su consulta por investigadores o publico no especializado, aprovechando el vocabulario de 31.560 tokens.
- Asistencia a la investigacion academica: traduccion preliminar de citas y fragmentos latinos en articulos, tesis o ediciones criticas, que el investigador revisa posteriormente.
- Preprocesamiento de corpus para NLP historico: traduccion automatica de grandes volumenes de texto latino a ingles como paso previo a analisis de texto, indexacion o busqueda semantica.
- Ensenanza de latin: generacion de traducciones de referencia para ejercicios y textos de clase, con la advertencia de que deben ser revisadas por un docente.
- Fine-tuning sobre otros corpus latinos: al ser un modelo de 208 M de parametros, es viable reentrenarlo o ajustarlo sobre otros dominios latinos (medicina, derecho, literatura clasica) con recursos modestos.

## Benchmarks y rendimiento

Datos reportados en la model card (validacion):

| Metrica | Valor |
|---|---|
| BLEU de validacion | 43,42 |
| Perplejidad de validacion | 22,17 |
| Precision de validacion | 71,90 % |
| Perplejidad de entrenamiento | 4,96 |
| Precision de entrenamiento | 95,53 % |
| Frases procesadas | 53.861.702 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WMT) en la informacion disponible. El BLEU de 43,42 es especifico del conjunto de validacion del corpus propio y no es directamente comparable con resultados de WMT.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,42 GB solo para pesos (208,6 M de parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica, menos de 2 GB.
- VRAM estimada en fp32: aproximadamente 0,84 GB para pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes.
- GPU de entrenamiento usada: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM), aunque el modelo es mucho mas pequeno que la VRAM disponible.
- Opciones de despliegue: no se documentan; al ser un modelo Eole, probablemente requiere el runtime de Eole o conversion a formatos estandar (no confirmado). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables especializados en traduccion latin-ingles con parametros y contexto documentados.

## Limitaciones y advertencias

- Dominio restringido: el entrenamiento se limita al corpus AquinasLatinEnglish; el rendimiento fuera de textos filosoficos/teologicos latinos puede degradarse.
- Riesgo de alucinacion y errores de traduccion: como todo modelo NMT, puede producir traducciones plausibles pero incorrectas, especialmente en pasajes con vocabulario raro o construcciones sintacticas complejas.
- Precision de validacion del 71,90 %: indica un margen de error considerable; no es adecuado para traduccion sin revision humana en contextos criticos.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de utilizarlo en produccion.
- Idiomas limitados a la y en; no soporta otras lenguas.
- Longitud de contexto no documentada; textos largos pueden requerir segmentacion.
- Modelo con muy pocas descargas (9) y un solo like: escasa validacion por parte de la comunidad.
- Fecha de creacion futura (2026-04-12) en los metadatos, lo que sugiere posible inconsistencia en la informacion del repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geremia23/AquinasLatinEnglishModel
- Dataset: https://huggingface.co/datasets/Geremia23/AquinasLatinEnglish
- Framework Eole: https://eole-nlp.github.io/eole/
- GPU utilizada: https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/
- Entorno de entrenamiento (Lightning.ai): https://lightning.ai/geremia/nmt-training/studios/strange-beige-0guf
