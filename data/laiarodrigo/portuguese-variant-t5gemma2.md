# laiarodrigo/portuguese-variant-t5gemma2

## Resumen

`laiarodrigo/portuguese-variant-t5gemma2` es un repositorio que agrupa 34 modelos derivados de T5Gemma 2, desarrollados por el autor laiarodrigo en el marco de una tesis doctoral. El objetivo es doble: identificar la variedad del portugues (europeo frente a brasileño) y reescribir texto de forma bidireccional entre ambas variantes, una tarea relevante para localizacion, edicion editorial y normalizacion de corpus en industrias que operan con portugues en ambos lados del Atlantico.

El repositorio no contiene un unico modelo, sino un conjunto de artefactos experimentales: adaptadores PEFT LoRA y modelos completamente afinados, organizados por etapa (B y C), tipo de control (encoder o decoder), esquema de supervision (GPT Wikipedia, GPT Wikipedia formateado), rango de LoRA (8, 16, 32, 48) y variantes de protocolo (sin etapa A, solo reescritura, sin reescritura de iguales, batches balanceados por tarea, tokens anadidos, perdida de clasificacion restringida). Cada carpeta incluye configuracion de entrenamiento exacta, tokenizer, metadatos del artefacto con SHA-256 del fichero de pesos y el adaptador o modelo completo.

La relevancia actual es metodologica: el repositorio expone de forma transparente el diseno experimental completo de una tesis, lo que permite reproducir y auditar cada variante. No obstante, el modelo no presenta descargas ni likes en el momento de la consulta, y la model card no documenta resultados de benchmarks ni especificaciones tecnicas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5Gemma 2 (encoder-decoder transformer; detalles del modelo base no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | portugues (pt), con distincion entre portugues europeo y brasileño |
| Licencia | Gemma (terminos de licencia de Gemma) |
| Formato de pesos | safetensors; adaptadores PEFT LoRA y modelos completamente afinados |

## Arquitectura y entrenamiento

El modelo base es T5Gemma 2, una arquitectura encoder-decoder de la familia T5/Gemma. El repositorio contiene 34 artefactos derivados de ese modelo base, entrenados para dos tareas: clasificacion de variedad del portugues y reescritura bidireccional entre portugues europeo y brasileño. Los artefactos se dividen en dos etapas experimentales: la etapa B, con adaptadores LoRA de rango 8, 16, 32 y 48, y la etapa C, con esquemas de recompensa principal y variantes sin reescritura de iguales. Ademas, se incluyen modelos completamente afinados (identificados con prefijo F270 y C270) con protocolos alternativos como batches balanceados por tarea, tokens anadidos y perdida de clasificacion restringida.

La supervision se distribuye en dos esquemas: `gpt_wikipedia` y `gpt_wikipedia_frmt`. El control puede aplicarse en el encoder o en el decoder. El repositorio documenta configuraciones exactas de entrenamiento, tokenizer y metadatos con verificacion SHA-256 de los pesos, lo que facilita la reproducibilidad. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; la etapa C sugiere un esquema de recompensa, pero su naturaleza no esta detallada.

## Capacidades

- Identificacion de la variedad del portugues (europeo frente a brasileño) a partir de texto.
- Reescritura bidireccional entre portugues europeo y portugues brasileño.
- Generacion de texto texto-a-texto mediante la arquitectura T5Gemma 2.
- Clasificacion de texto (etiqueta `text-classification` declarada en los tags).
- Adaptacion mediante PEFT LoRA, con rangos configurables (8, 16, 32, 48).
- Variantes de reescritura sin modificacion de segmentos iguales (`no_equal_rewriting`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al portugues segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Localizacion editorial entre mercados lusofonos: el modelo permite adaptar un texto escrito en portugues europeo al portugues de Brasil (o viceversa) preservando el contenido, util para editoriales, agencias de traduccion y medios con ediciones en ambos paises.
- Normalizacion de corpus para NLP: antes de entrenar modelos o realizar analisis linguistico, se puede homogeneizar la variedad del portugues en un corpus mixto, reduciendo la varianza dialectal en las caracteristicas.
- Moderacion y enrutamiento de contenido por variante: clasificar automaticamente si un texto esta en portugues europeo o brasileño para dirigirlo al equipo editorial, revisor o modelo de lenguaje adecuado.
- Generacion de datos aumentados: producir pares de frases equivalentes en ambas variantes para aumentar datasets de traduccion, deteccion de variedad o evaluacion de modelos.
- Control de calidad en traduccion automatica: verificar si una salida en portugues corresponde a la variante solicitada y corregirla automaticamente antes de publicarla.
- Investigacion en variacion linguistica: el repositorio incluye configuraciones y scripts de evaluacion que permiten reproducir experimentos sobre identificacion y reescritura de variedades, util para grupos de linguistica computacional.
- Integracion en pipelines de transformers: al estar en formato PEFT y safetensors, los adaptadores pueden cargarse con la libreria `transformers` y desplegarse en servicios de inferencia existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el tamano del modelo base T5Gemma 2 utilizado.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible; depende del tamano del modelo base y del tipo de artefacto (adaptador LoRA frente a modelo completo).
- Opciones de despliegue: la libreria declarada es `transformers`; los adaptadores PEFT pueden cargarse sobre el modelo base. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.
- Nota: el repositorio ocupa 36,4 GB, lo que incluye los 34 artefactos; el peso individual de cada uno no se detalla en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laiarodrigo/portuguese-variant-t5gemma2 | no disponible | no disponible | Identificacion y reescritura de variedades del portugues | Gemma | Hugging Face, 0 descargas |
| Modelos de traduccion portugues-español genericos | no disponible | no disponible | Traduccion entre idiomas | variable | no disponible |
| Clasificadores de variedad del portugues basados en BERT | no disponible | no disponible | Clasificacion de variante | variable | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas. La comparativa queda limitada a la categoria funcional.

## Limitaciones y advertencias

- El repositorio agrupa 34 artefactos experimentales; no existe un unico modelo "recomendado" y la model card no indica cual debe usarse en produccion.
- No se documentan resultados de evaluacion ni benchmarks, por lo que no es posible estimar la calidad de la reescritura o de la clasificacion.
- La licencia Gemma impone restricciones de uso comercial que deben revisarse antes de desplegar el modelo en productos.
- El alcance linguistico se limita al portugues; no se declaran capacidades multilingues.
- No se detallan sesgos conocidos, riesgos de alucinacion ni limitaciones de contexto.
- Al tratarse de un trabajo de tesis con 0 descargas y 0 likes, no hay evidencia de uso en produccion ni validacion externa.
- La reescritura entre variantes puede alterar matices dialectales o registro si el modelo no ha sido evaluado en dominios especificos.
- Los metadatos incluyen SHA-256 de los pesos, lo que permite verificar integridad, pero no sustituye una evaluacion de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/laiarodrigo/portuguese-variant-t5gemma2
- Codigo, configuraciones y scripts de evaluacion: https://github.com/laiarodrigo/Thesis
- Revision de origen citada en la model card: 4af70204bf1a0435d047b27ab737e93b7a19001f
