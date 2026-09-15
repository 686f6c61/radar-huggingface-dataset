# Hager290/hager-persona

## Resumen

Hager290/hager-persona es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct publicado por el usuario Hager290 en HuggingFace. Se trata de un modelo de generacion de texto de tipo conversacional, con 3.085.938.688 parametros (aproximadamente 3,09 mil millones) y pesos almacenados en formato safetensors. El entrenamiento se realizo partiendo de la version cuantizada a 4 bits de Qwen2.5-3B-Instruct preparada por Unsloth, utilizando la libreria Unsloth junto con TRL de HuggingFace, segun declara el propio autor en la model card.

El modelo se presenta bajo licencia Apache 2.0 y declara unicamente el ingles como idioma soportado. No incorpora una model card descriptiva mas alla de la plantilla generada automaticamente por Unsloth, por lo que no hay informacion publica sobre el conjunto de datos de ajuste, el numero de tokens de entrenamiento, la composicion del dataset ni los hiperparametros utilizados. Tampoco se documentan resultados de evaluacion.

Su relevancia practica radica en el segmento de modelos pequenos (3B) que pueden ejecutarse en hardware de consumo, y en que la etiqueta "persona" en el nombre sugiere un ajuste orientado a un estilo conversacional o a un personaje concreto, aunque esta interpretacion no esta confirmada por el autor. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de un modelo sin validacion comunitaria ni adopcion conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (deducida del modelo base y de la etiqueta `qwen2`) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | pesos en safetensors equivalentes a unos 16 bits por parametro (bf16/fp16); el modelo base se entreno en 4 bits con bitsandbytes; no se publican versiones GGUF ni AWQ/GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 6,2 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un transformer decoder-only de la familia Qwen2, con atencion causal, en su variante de 3,09 B de parametros. No se ha publicado ninguna modificacion estructural, por lo que no hay atencion lineal, SSM ni mezcla de expertos. El pipeline declarado es `text-generation` y la libreria de inferencia asociada es `transformers`.

En cuanto al entrenamiento, la model card indica unicamente que el modelo fue ajustado con Unsloth y TRL "2x mas rapido". El punto de partida es `unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit`, es decir, una version del modelo instructivo de Qwen2.5-3B cuantizada a 4 bits para facilitar el ajuste fino con QLoRA o tecnicas equivalentes. No se especifica el dataset, el numero de pasos, la tasa de aprendizaje, si se aplico DPO, RLHF u otra fase de alineamiento adicional, ni si el ajuste fue completo o mediante adaptadores fusionados. El tamano del repositorio (6,2 GB) es coherente con pesos fusionados en precision de 16 bits en lugar de adaptadores LoRA sueltos.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instructivo Qwen2.5-3B.
- Razonamiento basico y respuesta a instrucciones propias de un modelo instructivo de su clase.
- Generacion de codigo y resolucion de problemas matematicos sencillos, en la medida en que lo permite un modelo de 3 B de parametros.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para este ajuste concreto; el modelo base de la familia Qwen2.5 lo incorpora, pero el ajuste fino puede haber alterado esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en` declarada por el autor.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles. Es un modelo exclusivamente de texto.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: al tratarse de un modelo de 3 B ejecutable en una GPU de consumo, permite montar un chatbot de pruebas con un coste de infraestructura minimo antes de escalar a modelos mayores.
- Personificacion y roleplay ligero: el nombre del repositorio ("hager-persona") apunta a un ajuste orientado a un personaje o estilo concreto; seria adecuado para demos de personajes virtuales, siempre que se valide manualmente la coherencia del tono.
- Generacion de texto asistida en local: redaccion de borradores, resumenes y reescritura de textos en ingles sobre hardware sin acceso a la nube, util en entornos con requisitos de privacidad.
- Educacion y experimentacion con ajuste fino: sirve como caso de estudio reproducible de un pipeline Unsloth + TRL sobre un modelo Qwen2.5-3B, util para cursos o talleres de fine-tuning.
- Tareas de clasificacion y extraccion mediante prompting: generacion de etiquetas, categorizacion de textos o extraccion de campos estructurados en ingles, sin necesidad de entrenamiento adicional.
- Base para nuevos ajustes de dominio: al estar publicado en safetensors con licencia Apache 2.0, puede utilizarse como punto de partida para un segundo ajuste fino sobre datos propios de un dominio especifico.
- Evaluacion comparativa de tecnicas de cuantizacion: permite medir la degradacion de calidad al pasar de bf16 a cuantizaciones de 8 y 4 bits en un modelo de 3 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han encontrado datos en la busqueda web realizada. No se deben extrapolar cifras del modelo base al ajuste fino, ya que se desconoce el efecto del entrenamiento sobre las capacidades originales.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 7-9 GB solo para los pesos (3,09 B x 2 bytes = ~6,2 GB) mas el espacio de activaciones y cache KV; con contexto largo, la cifra puede crecer de forma apreciable.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,5-5 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 2-3,5 GB, lo que lo situa al alcance de portatiles con GPU discretas modestas.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); para cuantizaciones de 4 bits basta con 4-6 GB. En centro de datos, A100 o H100 lo ejecutan con margen amplio incluso con lotes grandes.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de gama media y en algunasintegradas con memoria unificada suficiente, siempre que se cuantice.
- Opciones de despliegue: `transformers` de forma nativa; vLLM y Text Generation Inference (TGI) gracias a las etiquetas declaradas (`text-generation-inference`, `endpoints_compatible`); llama.cpp y Ollama requeririan convertir previamente los pesos safetensors a GGUF, ya que no se publican ficheros GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hager290/hager-persona | 3,09 B | no disponible | apache-2.0 | safetensors en HuggingFace |
| unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit (modelo base) | ~3,09 B | no disponible en la informacion proporcionada | apache-2.0 (heredada del modelo original) | safetensors en HuggingFace |
| Alternativas de la misma categoria (modelos instructivos de ~3-4 B) | no disponible | no disponible | no disponible | no disponible |

En el segmento de modelos instructivos de 3 a 4 mil millones de parametros existen otras alternativas conocidas, pero la informacion proporcionada en esta busqueda no incluye sus especificaciones ni resultados de evaluacion comparables, por lo que no se presentan cifras que no puedan verificarse. La unica comparacion defendible con los datos disponibles es la del ajuste frente a su modelo base, y en ese caso no hay benchmarks publicados que permitan cuantificar la diferencia.

## Limitaciones y advertencias

- Ausencia de documentacion: la model card es la plantilla automatica de Unsloth. No se describe el dataset de ajuste, la metodologia ni los objetivos del entrenamiento, lo que impide auditar el modelo.
- Riesgo de alucinacion: como cualquier modelo generativo de 3 B, tiende a producir afirmaciones plausibles pero incorrectas, especialmente en tareas de conocimiento factual y razonamiento largo.
- Sesgos: no evaluados. No hay informacion sobre sesgos de genero, raza, religion u otros, ni sobre filtros de seguridad aplicados durante el ajuste.
- Limitacion idiomatica: solo declara ingles. El rendimiento en castellano no esta evaluado y previsiblemente sera inferior, al no figurar el espanol entre los idiomas soportados.
- Ausencia de datos de rendimiento: sin benchmarks, no es posible estimar la degradacion respecto al modelo base ni comparar con alternativas.
- Riesgo de sobreajuste al estilo: al tratarse de un ajuste "persona" sin dataset documentado, es probable que haya perdido parte de la capacidad instructiva general del modelo original en favor de un estilo concreto. Conviene validarlo con tareas generales antes de usarlo en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar las condiciones del modelo base de Qwen y de la version publicada por Unsloth, ya que la licencia final hereda las obligaciones de la cadena de modelos.
- Adopcion nula: 0 descargas y 0 "likes" registrados en el momento de la consulta. No hay evidencia de uso en produccion ni de validacion por terceros.
- Fechas del repositorio: las marcas de creacion y actualizacion (2026-09-15) son posteriores a la fecha habitual de publicacion de la familia Qwen2.5; conviene verificar la procedencia y la integridad de los pesos antes de utilizarlos.
- Tool calling no verificado: aunque el modelo base lo soporta, el ajuste fino puede haber degradado esta capacidad. Debe comprobarse empiricamente antes de integrarlo en un agente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hager290/hager-persona
- Modelo base: https://huggingface.co/unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a la plataforma monday.com y no guardan relacion con este repositorio.
