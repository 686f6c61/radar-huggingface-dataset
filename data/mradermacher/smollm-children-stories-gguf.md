# mradermacher/smollm-children-stories-GGUF

## Resumen

smollm-children-stories-GGUF es la version cuantizada en formato GGUF del modelo sumiya-riaz/smollm-children-stories, un ajuste fino de la familia SmolLM2 orientado especificamente a la generacion de cuentos infantiles. El modelo base parte de SmolLM2, la familia de modelos pequenos de Hugging Face, y ha sido afinado sobre el dataset TinyStories de Ronen Eldan, un corpus de historias cortas con vocabulario deliberadamente sencillo pensado para entrenar modelos de lenguaje en edades tempranas. El resultado es un modelo de 134.515.008 parametros (aproximadamente 134,5 millones) especializado en texto narrativo simple en ingles.

La relevancia de esta ficha radica en que las cuantizaciones GGUF las publica mradermacher, un conocido empaquetador de modelos en formato GGUF para su uso con llama.cpp y herramientas derivadas como Ollama o LM Studio. Esto permite ejecutar el modelo en hardware muy modesto, incluso en CPU, algo coherente con el tamano del modelo. La licencia Apache 2.0 facilita su integracion en productos comerciales sin fricciones legales.

No obstante, conviene subrayar que se trata de un modelo de nicho: su utilidad practica se limita a la generacion de cuentos infantiles en ingles, y no debe confundirse con un modelo de proposito general. La model card original es escueta y no aporta detalles sobre el proceso de entrenamiento, los hiperparametros ni evaluaciones cuantitativas, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2, segun tags del modelo) |
| Parametros totales | 134.515.008 (aprox. 134,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a SmolLM2, un transformer decoder-only de la familia de modelos pequenos de Hugging Face. El modelo ha sido afinado por sumiya-riaz a partir de esa base, segun los tags de la model card (smollm2, fine-tuned). El dataset de ajuste fino es roneneldan/TinyStories, un corpus de historias infantiles cortas con vocabulario restringido, disenado originalmente para estudiar la emergencia de capacidades linguisticas en modelos pequenos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset empleado en el ajuste, ni si se aplicaron tecnicas de RLHF o DPO.

Las cuantizaciones han sido generadas por mradermacher mediante cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf). La model card indica que no se han publicado, por parte de este autor, cuantizaciones ponderadas con imatrix para este modelo en el momento de la publicacion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto narrativo: produccion de cuentos infantiles cortos en ingles con vocabulario sencillo, coherente con el dataset TinyStories.
- Generacion de historias a partir de una premisa o prompt inicial.
- Estilo conversacional segun los tags del repositorio, aunque no se documenta un formato de chat especifico.
- Capacidad multilingue: limitada al ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta vision, audio ni modo thinking.
- No se documentan capacidades de codigo ni matematicas; el ajuste fino esta orientado exclusivamente a narrativa infantil.

## Casos de uso

- Generacion de cuentos infantiles para aplicaciones educativas: el modelo puede producir historias cortas con vocabulario controlado, adecuadas para lectores principiantes, gracias a su ajuste sobre TinyStories.
- Prototipado rapido de narrativa en entornos con recursos limitados: al ocupar apenas 0,2 GB en cuantizaciones Q4, puede ejecutarse en CPU o en GPUs de gama baja para pruebas de concepto.
- Generacion de contenido de relleno en demos de interfaces de lectura infantil: sirve para poblar maquetas o aplicaciones de lectura con texto plausible sin coste de inferencia en la nube.
- Investigacion sobre modelos pequenos: util como caso de estudio de ajuste fino de SmolLM2 sobre un corpus restringido y de los efectos de la cuantizacion en la calidad narrativa.
- Generacion offline en dispositivos: su tamano permite desplegarlo en entornos sin conectividad, como aplicaciones de escritorio o moviles, mediante llama.cpp.
- Educacion en IA: ejemplo didactico de pipeline completo (modelo base, ajuste fino, cuantizacion GGUF) para cursos o talleres.
- Generacion de variaciones de historias existentes: a partir de un prompt con personajes y escenario, el modelo puede producir nuevas versiones manteniendo el registro infantil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB para cuantizaciones Q2_K a Q5_K_M, 0,2 GB para Q6_K y Q8_0, y 0,4 GB para f16, segun los tamanos de fichero indicados en la model card.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; el modelo cabe incluso en GPUs integradas y en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de memoria disponible, asi como en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio incluye el tag endpoints_compatible.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 134,5 M de parametros, la inferencia en CPU es viable, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| smollm-children-stories (este modelo) | 134,5 M | no disponible | Apache 2.0 | GGUF | Cuentos infantiles en ingles |
| SmolLM2 (base de Hugging Face) | no disponible en esta ficha | no disponible | no disponible en esta ficha | safetensors, GGUF | Proposito general |
| TinyStories (modelos originales de Eldan et al.) | del orden de millones (segun paper) | no disponible | no disponible | no disponible | Historias infantiles |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. Los modelos TinyStories originales del paper de Eldan et al. son el referente conceptual mas directo, pero no se dispone de sus especificaciones exactas en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre un corpus de historias infantiles, el vocabulario y los temas estan fuertemente restringidos y pueden reflejar estereotipos presentes en el corpus.
- Riesgo de alucinacion: presente como en cualquier modelo de lenguaje; en este caso, la generacion narrativa inventa hechos por diseno, por lo que no debe usarse como fuente de informacion factual.
- Limitaciones de contexto e idioma: solo soporta ingles y no se documenta la longitud de contexto; es previsible que sea corta dada la naturaleza del corpus TinyStories.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (sumiya-riaz/smollm-children-stories) y de SmolLM2 antes de desplegarlo en produccion.
- Caveat para produccion: es un modelo de nicho, no un asistente general; no se recomienda para tareas de codigo, matematicas, razonamiento complejo ni atencion al cliente.
- La model card del autor de las cuantizaciones no incluye evaluaciones de calidad por tipo de cuantizacion; se recomienda probar Q4_K_M o Q5_K_M como punto de partida equilibrado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/smollm-children-stories-GGUF
- Modelo base original: https://huggingface.co/sumiya-riaz/smollm-children-stories
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Pagina de descarga del autor de cuantizaciones: https://hf.tst.eu/model#smollm-children-stories-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
