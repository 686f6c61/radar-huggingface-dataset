# mradermacher/borealis-27b-i1-GGUF

## Resumen

El repositorio `mradermacher/borealis-27b-i1-GGUF` contiene una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo `NbAiLab/borealis-27b`, un modelo de lenguaje noruego de 27.009.346.304 parametros (aproximadamente 27B) desarrollado por el consorcio noruego NbAiLab. El modelo base esta etiquetado con la familia `gemma3`, lo que indica que su arquitectura deriva de Gemma 3, y ha sido ajustado con el dataset `NbAiLab/aurora-sft`. Se trata de un modelo conversacional e instruct, orientado a tareas de generacion de texto en noruego (macrolengua `no`, incluidos `nb` bokmal y `nn` nynorsk).

La relevancia de esta ficha concreta reside en que no es el modelo original, sino un paquete de cuantizaciones con ponderacion imatrix que permite ejecutar un modelo de 27B en hardware mucho mas modesto que el requerido por los pesos completos. El repositorio ocupa 79,5 GB en total e incluye una amplia gama de tipos de cuantizacion (desde IQ1_S hasta Q6_K, pasando por Q4_K_M, Q5_K_M e IQ4_XS), ademas del fichero imatrix para quien quiera generar sus propias cuantizaciones.

El modelo base es multimodal (la model card indica explicitamente que se trata de un modelo de vision), aunque los ficheros de proyeccion multimodal (`mmproj`) no se alojan en este repositorio de cuantizaciones dinamicamente ponderadas, sino en el repositorio estatico del mismo autor. La licencia figura como `other`, heredada del modelo base, por lo que conviene revisar los terminos del modelo original antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible explicitamente; la etiqueta `gemma3` indica que deriva de la familia Gemma 3 (transformer denso) |
| Parametros totales | 27.009.346.304 (aproximadamente 27B) |
| Parametros activos | No aplicable (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, mas fichero imatrix |
| Idiomas soportados | Noruego (`no`), noruego bokmal (`nb`), noruego nynorsk (`nn`) |
| Licencia | `other` (heredada del modelo base; revisar terminos de NbAiLab/borealis-27b) |
| Formato de pesos | GGUF (cuantizaciones ponderadas con imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni el proceso de entrenamiento en los materiales proporcionados. La etiqueta `gemma3` asociada al modelo sugiere que `NbAiLab/borealis-27b` se construye sobre la arquitectura de Google Gemma 3, es decir, un transformer denso de aproximadamente 27B parametros con capacidades multimodales (vision). El ajuste se ha realizado sobre el dataset `NbAiLab/aurora-sft`, un conjunto de instrucciones en noruego desarrollado por el propio NbAiLab, segun la metadata de la model card. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO.

En cuanto a esta ficha, la innovacion tecnica relevante es el uso de cuantizacion con ponderacion imatrix (importance matrix), una tecnica que estima la importancia de cada peso a partir de activaciones observadas y ajusta el error de cuantizacion en consecuencia, mejorando la calidad respecto a cuantizaciones estaticas del mismo tamano. El autor ofrece tanto una version imatrix como cuantizaciones estaticas en un repositorio separado. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional e instrucciones en noruego (bokmal y nynorsk).
- Modelo multimodal: la model card del autor lo identifica como modelo de vision, con ficheros `mmproj` alojados en el repositorio estatico, no en este.
- Soporte de razonamiento y generacion de texto general propio de la familia Gemma 3.
- Capacidades multilingues centradas en noruego; no se documentan otros idiomas en la metadata.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada en noruego: el modelo puede gestionar conversaciones multi-turno en bokmal y nynorsk, lo que lo hace adecuado para entornos de soporte dirigidos al mercado noruego sin necesidad de traduccion intermedia.
- Generacion de contenido editorial en noruego: redaccion de articulos, resumenes y textos corporativos en las dos variantes escritas del noruego, con la ventaja de un ajuste especifico sobre datos noruegos.
- Traduccion y adaptacion entre bokmal y nynorsk: util para organismos publicos noruegos que deben publicar en ambas normas.
- Procesamiento de documentos administrativos: extraccion y sintesis de informacion de textos oficiales en noruego, aprovechando el ajuste sobre el dataset Aurora.
- Asistentes conversacionales locales: gracias a las cuantizaciones GGUF de baja precision (IQ2, IQ3), puede desplegarse en estaciones de trabajo con GPU de consumo o incluso CPU, sin depender de servicios en la nube.
- Prototipado e investigacion en PLN noruego: servir como modelo de referencia cuantizado para experimentos academicos con recursos limitados.
- Analisis de documentos con componente visual: dado que el modelo base es multimodal, podria emplearse para tareas de comprension de documentos que combinen texto e imagen, siempre que se descarguen los ficheros `mmproj` del repositorio estatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los tamanos indicados son estimaciones basadas en los tamanos de fichero publicados en la model card (la cuantizacion i1-Q2_K ocupa 10,6 GB) y en la practica habitual para modelos de aproximadamente 27B. La VRAM necesaria debe sumar un margen adicional de contexto y de cache KV.

- IQ1/IQ2 (calidad minima): aproximadamente 8-11 GB de VRAM. Cabe en GPUs de consumo como RTX 3060 12 GB o RTX 4070.
- Q3_K_S/Q3_K_M/IQ3 (calidad baja): aproximadamente 13-14 GB. Requiere RTX 4070 Ti SUPER/4080 16 GB o superiores.
- Q4_K_S/Q4_K_M/IQ4_XS (equilibrio habitual): aproximadamente 16-18 GB. Necesita RTX 4090 24 GB, RTX 5090 o A6000. Con offload parcial puede ejecutarse en GPUs de 12-16 GB.
- Q5_K_M: aproximadamente 19-20 GB. Requiere 24 GB de VRAM o reparto GPU/CPU.
- Q6_K: aproximadamente 22-23 GB. Ajustado a GPUs de 24 GB.
- Q8_0 / pesos de alta precision: aproximadamente 29 GB; FP16 completo, aproximadamente 54 GB. Requiere A100 40 GB, H100 o varias GPU.
- CPU + RAM: las cuantizaciones IQ2/Q3 pueden ejecutarse en CPU con 16-32 GB de RAM mediante llama.cpp, con latencia notablemente superior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y motores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa y requeririan los pesos safetensors originales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento para establecer una comparacion cuantitativa. La tabla recoge unicamente caracteristicas objetivas.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/borealis-27b-i1-GGUF | ~27B | No disponible | Si (mmproj en repo estatico) | `other` | GGUF cuantizado |
| NbAiLab/borealis-27b (modelo base) | ~27B | No disponible | Si | `other` | safetensors |
| Gemma 3 27B (familia de referencia) | ~27B | No disponible | Si | Terminos de Gemma | Pesos originales |

No se dispone de datos suficientes para comparar rendimiento, contexto ni licencia exacta frente a alternativas especificas de PLN noruego.

## Limitaciones y advertencias

- Este repositorio no es el modelo original, sino una cuantizacion de terceros (mradermacher). Los pesos con perdida (IQ1, IQ2, Q3) degradan la calidad respecto a los safetensors originales.
- La licencia figura como `other` y se hereda del modelo base; es imprescindible revisar los terminos de `NbAiLab/borealis-27b` antes de cualquier uso comercial.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mecanismos de mitigacion especificos.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Cobertura idiomatica limitada al noruego y sus variantes; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- El modelo base es multimodal, pero los ficheros `mmproj` no estan incluidos en este repositorio de cuantizaciones imatrix, lo que puede impedir el uso de la capacidad de vision segun el fichero descargado.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con ventanas largas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre estas cuantizaciones concretas.
- La fecha de creacion indicada (2026-10-15) es posterior a la de la mayoria de los modelos actuales, dato que conviene verificar en la pagina del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/borealis-27b-i1-GGUF
- Modelo base: https://huggingface.co/NbAiLab/borealis-27b
- Dataset de ajuste: https://huggingface.co/datasets/NbAiLab/aurora-sft
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/borealis-27b-GGUF
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#borealis-27b-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
