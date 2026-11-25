# richardyoung/Agents-A1-4B-heretic-GGUF

## Resumen
Agents-A1-4B-heretic-GGUF es la distribucion en formato GGUF del modelo richardyoung/Agents-A1-4B-heretic, un modelo multimodal de tipo image-text-to-text con aproximadamente 4.200 millones de parametros (4.205.751.296 exactos segun los pesos en safetensors del modelo base). Lo publica el usuario richardyoung en Hugging Face y esta pensado para su uso con llama.cpp y Ollama, lo que facilita la inferencia local en hardware de consumo. La variante "heretic" indica que se ha aplicado un proceso de abliteration o eliminacion de rechazos, orientado a reducir las negativas del modelo ante peticiones que el modelo original rechazaria.

La relevancia actual del modelo radica en su combinacion de tres factores: tamano contenido (4B, desplegable en GPU de consumo), capacidades de vision (acepta imagen y texto como entrada) y un formato GGUF con cuantizaciones preparadas para llama.cpp y Ollama. El repositorio incluye el tag imatrix, lo que sugiere que las cuantizaciones se han generado con una matriz de importancia para preservar mejor la calidad en bits bajos. La licencia es Apache 2.0, aunque el acceso al repositorio esta restringido y requiere aceptar condiciones en Hugging Face.

El modelo base se denomina Agents-A1, lo que apunta a un entrenamiento orientado a tareas de agente y conversacion multi-turno, si bien no se dispone de documentacion tecnica publica sobre el dataset ni el proceso de entrenamiento en la informacion proporcionada. El repositorio GGUF acumula 250 descargas y ningun "like" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; presumiblemente transformer, sin confirmar) |
| Parametros totales | 4.205.751.296 (aprox. 4,2B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no detalladas en la informacion; generadas con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); safetensors en el modelo base |
| Tamano del repositorio | 24,9 GB |
| Modalidad | image-text-to-text (vision + texto) |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento
No se dispone de informacion publica sobre la arquitectura interna del modelo base richardyoung/Agents-A1-4B-heretic en los datos proporcionados. Por el pipeline declarado (image-text-to-text) y el tamano (4,2B), se trata de un modelo multimodal que procesa imagenes y texto, presumiblemente con un encoder visual acoplado a un decoder de lenguaje, pero no se confirma el tipo exacto de transformer, el esquema de atencion ni la composicion del dataset de entrenamiento.

El sufijo "heretic" y los tags "abliterated" y "uncensored" indican que el modelo ha pasado por un proceso de abliteration, una tecnica que identifica y neutraliza las direcciones internas asociadas a los rechazos de seguridad para reducir la tasa de negativas. El tag "imatrix" hace referencia a las cuantizaciones GGUF generadas con matrices de importancia, una tecnica que pondera los pesos segun su relevancia para conservar calidad en cuantizaciones agresivas. No consta informacion sobre RLHF, DPO ni el numero de tokens de entrenamiento.

## Capacidades
- Generacion de texto conversacional multi-turno (tag "conversational").
- Comprension de imagenes combinadas con texto (pipeline image-text-to-text).
- Orientacion a tareas de agente segun el nombre del modelo base (Agents-A1), aunque no se documentan funciones concretas de tool calling.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que el modelo original declinaria.
- Despliegue en llama.cpp y Ollama gracias al formato GGUF.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Inferencia local en estaciones de trabajo: al ser un modelo de 4,2B en GGUF, puede ejecutarse en llama.cpp u Ollama en equipos con GPU de consumo, lo que permite prototipar asistentes conversacionales sin depender de la nube.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, puede extraer y describir contenido de capturas, diagramas o formularios combinados con instrucciones textuales.
- Asistentes de agente en entornos controlados: el nombre del modelo base sugiere un entrenamiento orientado a flujos de agente; puede usarse como cerebro de un agente simple en pipelines internos donde el filtrado de contenido no sea critico.
- Generacion de descripciones de imagenes y alt-text: util para catalogos, accesibilidad web o etiquetado semiautomatico de imagenes en lotes pequenos.
- Chatbot de soporte interno sin restricciones de contenido: la variante heretic reduce los rechazos, lo que puede ser util en dominios tecnicos o de investigacion donde el modelo original se muestra excesivamente conservador.
- Experimentacion en investigacion sobre alineacion y seguridad: permite estudiar el efecto de la abliteration comparando el modelo heretic con el original en tareas de evaluacion de rechazos y sesgos.
- Despliegue en edge o entornos sin conectividad: el formato GGUF y el tamano contenido facilitan la ejecucion offline en portatiles con GPU integrada o dedicada de gama media.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: para 4,2B parametros, en cuantizacion Q4_K_M se estiman en torno a 2,5-3 GB de pesos; en Q8_0 alrededor de 4,5 GB; en FP16 unos 8,5 GB. Estas cifras son estimaciones por tamano y no proceden de mediciones publicadas del modelo.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5 (RTX 3060, RTX 4060, RTX 4070); para Q8 o FP16 se recomienda 8-12 GB (RTX 4070 Ti, RTX 4080, RTX 4090). En entornos de servidor, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de GPUs dedicadas modernas con 6 GB o mas para cuantizaciones bajas; tambien puede ejecutarse en CPU con llama.cpp, con latencia mayor.
- Opciones de despliegue: llama.cpp, Ollama (tags declarados); tambien es posible usar otros runners compatibles con GGUF, aunque no se confirman vLLM ni TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Agents-A1-4B-heretic-GGUF | 4,2B | no disponible | Si | Apache 2.0 | GGUF |
| Qwen2.5-VL-3B | 3B aprox. | no disponible en esta ficha | Si | Apache 2.0 (segun version) | safetensors, GGUF |
| Llama 3.2 3B Vision | 3B aprox. | no disponible en esta ficha | Si | Llama Community License | safetensors, GGUF |
| Phi-3.5-vision | 4,2B aprox. | no disponible en esta ficha | Si | MIT | safetensors |

La comparativa es orientativa por categoria (modelos multimodales pequenos de 3-4B); no se dispone de datos de rendimiento del modelo evaluado para contrastar benchmarks. Los datos de los modelos alternativos deben verificarse en sus fichas oficiales, ya que no forman parte de la informacion proporcionada.

## Limitaciones y advertencias
- El proceso de abliteration reduce los rechazos de seguridad, lo que implica un mayor riesgo de generar contenido danino, sesgado o inapropiado; no es recomendable en produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en tareas de razonamiento complejo o matematicas.
- No se dispone de informacion sobre la longitud de contexto, los idiomas soportados ni la calidad de la comprension visual; conviene validar empiricamente antes de desplegar.
- El acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar la automatizacion de descargas en CI/CD.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podria arrastrar condiciones adicionales no documentadas en esta ficha; conviene revisar la ficha del modelo base.
- El tag "uncensored" y la naturaleza heretic pueden incumplir las politicas de uso de plataformas de despliegue gestionado.
- No hay benchmarks publicados que permitan comparar su calidad frente a alternativas del mismo tamano.
- El repositorio GGUF tiene 250 descargas y ningun "like", lo que sugiere una adopcion limitada y poca validacion comunitaria.

## Enlaces
- Hugging Face (GGUF): https://huggingface.co/richardyoung/Agents-A1-4B-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Agents-A1-4B-heretic
- Paper referenciado (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper referenciado (arxiv:2510.18892): https://arxiv.org/abs/2510.18892
