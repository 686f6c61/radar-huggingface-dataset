# abdukuzi45/Qwen3.5-4B-Amharic-32k-StageA-Merged

## Resumen

El modelo `abdukuzi45/Qwen3.5-4B-Amharic-32k-StageA-Merged` es un ajuste fino (fine-tuning) del modelo base Qwen3.5 de 4B de parametros, especializado en amharico con una ventana de contexto extendida a 32 000 tokens. Lo publica el usuario independiente abdukuzi45 en Hugging Face y se distribuye con licencia Apache 2.0. La model card es extremadamente escueta: se limita a indicar que se trata de una "fusion fisica" (physical merge) del paso final 765 de un entrenamiento previo denominado Stage A, con tensores congelados y MTP (multi-token prediction) preservados sin conversion de tipo de dato.

El modelo se presenta como un modelo multimodal de tipo image-text-to-text, lo que sugiere que hereda las capacidades de vision del Qwen3.5 base, aunque la model card no lo confirma explicitamente. El pipeline declarado en Hugging Face es `image-text-to-text`, y la arquitectura etiquetada es `qwen3_5`. Con 4 741 785 088 parametros totales (segun los pesos en safetensors) y un tamano de repositorio de 9,5 GB, se posiciona en la gama de modelos pequenos-medios aptos para inferencia en hardware de consumo.

La relevancia de este modelo es limitada y muy especifica: se trata de un experimento de ajuste linguistico para amharico sobre una base Qwen3.5, con contexto largo. No hay benchmarks publicados, el autor advierte explicitamente que "aun no se ha evaluado" y el numero de descargas es de 6 en el momento de la consulta. Es, por tanto, un artefacto de investigacion temprana mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun tag de Hugging Face; detalles internos no disponibles) |
| Parametros totales | 4 741 785 088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32 000 tokens (indicado en el nombre del modelo; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | no disponible (el nombre sugiere amharico; la model card no lo declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura etiquetada es `qwen3_5`, lo que indica que el modelo parte de la familia Qwen3.5 de Alibaba. Sin embargo, la model card no aporta detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El dato mas concreto es la mencion a "MTP" (multi-token prediction), un mecanismo de prediccion de multiples tokens por paso que suele emplearse para acelerar la decodificacion y que, segun el autor, se ha preservado durante la fusion.

El proceso de entrenamiento descrito es un "Stage A" que culmina en el paso 765, seguido de una "fusion fisica" de tensores congelados. Esto sugiere un pipeline de ajuste en dos fases (posiblemente congelacion parcial de capas y posterior merge de adaptadores o pesos), pero no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el corpus en amharico utilizado, salvo la referencia a un repositorio fuente (`Qwen3.5-4B-Amharic-32k-StageA-RealText`) que el autor indica que sera eliminado tras la verificacion de la subida. El archivo `MERGE_VERIFICATION.json` mencionado en la model card no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational`.
- Procesamiento de imagen y texto conjuntamente (pipeline `image-text-to-text`), presumiblemente heredado del Qwen3.5 base; no confirmado en la model card.
- Ventana de contexto de 32 000 tokens segun el nombre del modelo, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidad multilingue orientada al amharico por el nombre del modelo; el resto de idiomas no esta declarado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos largos en amharico: con 32 000 tokens de contexto, el modelo puede ingerir articulos, informes o transcripciones extensas en amharico y generar resumenes o respuestas extractivas sin truncar el material.
- Asistencia conversacional en amharico: integrado en un chatbot de atencion al ciudadano o soporte interno, el ajuste linguistico deberia mejorar la fluidez frente al Qwen3.5 base en ese idioma, aunque no hay evaluacion que lo cuantifique.
- Traduccion amharico-ingles (o viceversa): como modelo bilingue potencial, puede emplearse en pipelines de traduccion asistida, siempre con revision humana dado el riesgo de alucinacion y la ausencia de benchmarks.
- Analisis de imagenes con instrucciones en amharico: si se confirma la herencia multimodal, podria emplearse para describir imagenes, extraer texto de capturas o responder preguntas visuales en amharico.
- Prototipado de investigacion en NLP de bajos recursos: sirve como punto de partida para experimentos de ajuste sobre amharico, dado que es un checkpoint intermedio (Stage A) con licencia permisiva.
- Generacion de contenido editorial en amharico: redaccion de borradores de noticias, guiones o material educativo, con curacion humana posterior.
- Educacion y tutoria automatizada: respuestas a preguntas de estudiantes en amharico con contexto largo para incluir material de referencia completo en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente en la model card que el modelo "aun no se ha evaluado" (not yet benchmarked). No se dispone de datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas en amharico.

## Requisitos de hardware

- VRAM estimada para inferencia en precision nativa (bf16/fp16): aproximadamente 9,5 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos, viable en GPUs de 8-10 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 3 GB de pesos, viable en GPUs de consumo de 6-8 GB, aunque el contexto de 32 000 tokens incrementa notablemente el uso de cache KV.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion con contexto completo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia local sin problemas; RTX 4080/4070 Ti (16 GB) o superiores para precision nativa con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y modelos con 12 GB o mas en cuantizacion; en 8 GB solo con cuantizacion agresiva y contexto recortado.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servido de alto rendimiento, llama.cpp/Ollama si se generan versiones GGUF (no incluidas en el repo). El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput estimados: no disponible; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Amharic-32k-StageA-Merged | 4,74 B | 32 000 (segun nombre) | Apache 2.0 | Hugging Face, 6 descargas | Sin benchmarks; ajuste en amharico |
| Qwen3.5-4B (base) | ~4 B | no disponible en esta ficha | Apache 2.0 (presumible) | Hugging Face | Base oficial de Alibaba; referencia para comparar el ajuste |
| Qwen2.5-3B / 7B | 3 B / 7 B | 32 768 (Qwen2.5) | Apache 2.0 | Hugging Face, ampliamente usado | Alternativa consolidada de tamano similar con ecosistema maduro |
| Llama 3.2 3B | 3 B | 128 000 | Llama 3.2 Community License | Hugging Face, Meta | Alternativa pequena multimodal, licencia no Apache |

La comparativa es orientativa: no existen datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. El Qwen3.5-4B base y los Qwen2.5 de tamano similar son las referencias naturales; Llama 3.2 3B es una alternativa de tamano comparable con contexto mucho mayor pero licencia mas restrictiva.

## Limitaciones y advertencias

- Ausencia total de benchmarks: el autor declara que el modelo no ha sido evaluado, por lo que se desconoce su calidad real en amharico, razonamiento, codigo o vision.
- Riesgo elevado de alucinacion: al ser un ajuste fino sobre un checkpoint intermedio (paso 765 de Stage A), la calidad de generacion puede ser inestable.
- Model card practicamente vacia: no se documentan datos de entrenamiento, composicion del corpus, sesgos conocidos ni limitaciones especificas.
- Idiomas no declarados formalmente: aunque el nombre indica amharico, no se especifica el grado de competencia ni el resto de idiomas cubiertos.
- Contexto de 32 000 tokens no verificado: el dato proviene del nombre del modelo, no de la model card; conviene validar empíricamente el comportamiento en contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5 conviene revisar las condiciones de la licencia del modelo base y de los datos de entrenamiento originales.
- Repositorio fuente en eliminacion: el autor indica que el repositorio `Qwen3.5-4B-Amharic-32k-StageA-RealText` sera borrado, lo que dificulta la trazabilidad y reproducibilidad del ajuste.
- Sin versiones cuantizadas publicadas (GGUF, AWQ, GPTQ): el despliegue en hardware modesto requiere generar las cuantizaciones por cuenta propia.
- Numero de descargas muy bajo (6) y ausencia de feedback de la comunidad: no hay evidencia externa de funcionamiento correcto.
- Riesgo de sesgos del corpus en amharico no evaluado: al no documentarse la composicion del dataset, no puede descartarse la presencia de sesgos linguisticos, culturales o de genero.

## Enlaces

- Hugging Face: https://huggingface.co/abdukuzi45/Qwen3.5-4B-Amharic-32k-StageA-Merged
- Repositorio fuente citado (en proceso de eliminacion): https://huggingface.co/abdukuzi45/Qwen3.5-4B-Amharic-32k-StageA-RealText
- Familia Qwen (Alibaba): https://huggingface.co/Qwen
- Documentacion de transformers: https://huggingface.co/docs/transformers
- vLLM: https://github.com/vllm-project/vllm
- llama.cpp: https://github.com/ggerganov/llama.cpp
