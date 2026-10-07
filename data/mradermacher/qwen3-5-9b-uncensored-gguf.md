# mradermacher/qwen3.5-9b-uncensored-GGUF

## Resumen

mradermacher/qwen3.5-9b-uncensored-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo mshodiqul/qwen3.5-9b-uncensored. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local del ajuste fino realizado por el usuario mshodiqul sobre una base de la familia Qwen3.5. El modelo cuenta con 8.953.803.264 parametros (unos 8,95 mil millones) y esta publicado bajo licencia Apache 2.0.

El interes del repositorio reside en que empaqueta el modelo en multiples niveles de cuantizacion (desde Q2_K hasta f16, ademas de variantes IQ4_XS y ficheros mmproj para componentes multimodales), lo que permite ejecutarlo en hardware de consumo. Los metadatos lo etiquetan como especializado en codigo, uso agentico, tool calling y contenido sin censura editorial, con el ingles como unico idioma declarado.

Se trata de una publicacion muy reciente (creada el 6 de octubre de 2026) y con cero descargas y cero valoraciones en el momento de redactar esta ficha, por lo que no existe validacion independiente de su calidad. La model card no especifica longitud de contexto, composicion del dataset de entrenamiento ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (detalles no disponibles) |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 mil millones) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16; ficheros mmproj en f16 y Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 83,0 GB |
| Modelo base | mshodiqul/qwen3.5-9b-uncensored |
| Tipo de ajuste | LoRA / fine-tuning (segun etiquetas del autor) |
| Fecha de publicacion | 6 de octubre de 2026 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta "qwen3.5" y del hecho de que el modelo base fue ajustado mediante LoRA. Los parametros totales declarados en los ficheros safetensors del modelo original (8.953.803.264) son compatibles con un transformer decoder-only denso de aproximadamente 9 mil millones de parametros, pero no se especifican numero de capas, dimensiones ocultas, tipo de atencion (completa, lineal o hibrida), funcion de activacion ni estrategia de RoPE. Tampoco se documenta si el entrenamiento incluyo RLHF, DPO u otra fase de alineamiento posterior al ajuste supervisado.

Sobre los datos de entrenamiento no hay ninguna cifra: se desconoce el numero de tokens, la composicion del corpus, la proporcion de codigo frente a texto general y el procedimiento exacto de filtrado. La etiqueta "uncensored" indica que el ajuste fino elimino o relajo las capas de rechazo y alineamiento de seguridad del modelo original, pero no se documenta como se hizo ni con que datos.

La innovacion tecnica relevante de este repositorio concreto es el propio proceso de cuantizacion: el autor ofrece tanto cuantizaciones estaticas (este repositorio) como cuantizaciones ponderadas con matriz de importancia (imatrix) en el repositorio hermano `qwen3.5-9b-uncensored-i1-GGUF`. La presencia de ficheros `mmproj` (proyector multimodal en f16 y Q8_0) sugiere que el modelo base incorpora capacidad de vision o de entrada multimodal, aunque la model card no lo confirma explicitamente.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Generacion y asistencia en codigo, segun la etiqueta "coding" declarada por el autor.
- Tool calling y function calling, segun la etiqueta "tool-use".
- Flujos agenticos y razonamiento multi-paso, segun la etiqueta "agentic".
- Salida sin censura editorial: el ajuste elimina los filtros de rechazo tipicos de los modelos alineados.
- Soporte multimodal probable: los ficheros `mmproj-Q8_0` y `mmproj-f16` incluidos en el repositorio permiten cargar un proyector de vision en llama.cpp y derivados, aunque la model card no describe esta capacidad.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion.
- Capacidades multilingues: no disponibles; solo se declara ingles.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente de codigo en local: con la cuantizacion Q4_K_S (5,5 GB) el modelo cabe en GPUs de 8-12 GB, lo que permite integrarlo en un IDE (continuacion de codigo, explicacion de funciones, refactorizacion) sin enviar el codigo fuente a servicios externos.
- Agentes de automatizacion con tool calling: al declarar soporte de tool-use, puede conectarse a APIs externas (busqueda, bases de datos, sistemas de ficheros) y encadenar llamadas en tareas de varios pasos, desplegado con llama.cpp u Ollama.
- Automatizacion de pipelines de CI/CD: generacion de parches, resumen de diffs o redaccion de mensajes de commit integrados en scripts que invocan el endpoint local del modelo.
- Procesamiento de documentos con componente visual: usando los ficheros mmproj junto con llama.cpp es posible plantear tareas de extraccion de informacion de capturas o imagenes de baja resolucion, siempre que se valide previamente la calidad real de esa capacidad.
- Prototipado e investigacion con datos sensibles: al poder ejecutarse en una unica GPU de consumo y sin conexion a internet, es adecuado para experimentar con datos que no pueden salir de la organizacion.
- Generacion de texto creativo sin filtros: para proyectos de ficcion, guiones o contenido editorial donde los rechazos automaticos de los modelos alineados resultan un obstaculo.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece hasta doce niveles de cuantizacion distintos, lo que lo convierte en un banco de pruebas util para medir la degradacion de perplejidad entre Q2_K, Q4_K_M, Q8_0 y f16.
- Ajuste fino adicional: al derivar de un LoRA, el modelo puede servir como punto de partida para nuevos adaptadores sobre dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo.

## Requisitos de hardware

Estimaciones derivadas del tamano de los ficheros GGUF publicados, asumiendo llama.cpp como backend y una ventana de contexto moderada (4.000-8.000 tokens):

- Q4_K_S (5,5 GB): requiere en torno a 6-7 GB de VRAM. Cabe en RTX 3060 12 GB, RTX 4060 Ti 8 GB (con contexto reducido), RTX 2070, Apple Silicon con 16 GB unificados.
- Q8_0 (9,6 GB): requiere en torno a 10,5-11,5 GB de VRAM. Cabe en RTX 3060 12 GB, RTX 4070 Ti Super 16 GB, RTX 4080, RTX 4090.
- f16 (18,0 GB): requiere en torno a 19-20 GB de VRAM. Necesita RTX 3090 o RTX 4090 de 24 GB, A100 40 GB, H100 80 GB o configuraciones multi-GPU.
- Ficheros mmproj: sumar 0,7 GB (Q8_0) o 1,0 GB (f16) al presupuesto de VRAM cuando se active la entrada multimodal.
- Ejecucion en CPU: las cuantizaciones Q4_K_S y superiores son viables en CPU con llama.cpp, con velocidades de decodificacion bajas (dependientes del numero de nucleos y del ancho de banda de memoria).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, Jan, text-generation-webui y llama-cpp-python. La etiqueta `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de HuggingFace. vLLM y TGI admiten GGUF con limitaciones y suelen rendir mejor con los pesos originales en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

Los datos de rendimiento del modelo evaluado no estan publicados, por lo que la comparacion se limita a parametros, contexto y licencia de alternativas del mismo rango de tamano. Los datos de las alternativas provienen de su documentacion publica, no de la busqueda web realizada.

| Modelo | Parametros | Contexto | Licencia | GGUF disponible | Multimodal |
|---|---|---|---|---|---|
| qwen3.5-9b-uncensored (este modelo) | 8,95 mil millones | No disponible | Apache 2.0 | Si (este repositorio) | Indicios (ficheros mmproj) |
| Qwen3-8B | 8,2 mil millones | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | Si | No |
| Llama-3.1-8B-Instruct | 8,0 mil millones | 128.000 tokens | Llama 3.1 Community License | Si | No |
| Mistral-7B-Instruct-v0.3 | 7,2 mil millones | 32.000 tokens | Apache 2.0 | Si | No |

La comparacion de rendimiento entre estos modelos no es posible con la informacion disponible.

## Limitaciones y advertencias

- Modelo sin censura: el ajuste elimina deliberadamente los mecanismos de rechazo, por lo que puede generar contenido ofensivo, ilegal, peligroso o factualmente falso sin advertencia. No es adecuado para aplicaciones orientadas al publico sin una capa adicional de moderacion.
- Riesgo elevado de alucinacion: al no existir evaluaciones publicadas, se desconoce su tasa de error factual. La ausencia de alineamiento tiende a reducir la cautela del modelo al afirmar hechos.
- Procedencia no verificada: el nombre "qwen3.5" no corresponde necesariamente a una familia oficial publicada por Alibaba; conviene verificar el linaje del modelo base antes de usarlo en produccion.
- Validacion practicamente nula: cero descargas y cero valoraciones en el momento de la publicacion, y sin resultados de benchmarks. Cualquier uso en produccion exige una evaluacion propia.
- Idioma: solo se declara ingles. El comportamiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin medirla empiricamente.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene comprobar que los terminos del modelo base y de los datos de ajuste no impongan restricciones adicionales.
- Calidad del ajuste LoRA desconocida: no se documentan hiperparametros, dataset ni duracion del entrenamiento, por lo que no puede descartarse una degradacion de capacidades generales respecto al modelo original.
- Componente multimodal sin documentar: la capacidad de vision se infiere unicamente de la presencia de ficheros mmproj y no esta respaldada por la model card.
- Repositorio de 83 GB: la descarga de todas las cuantizaciones requiere un plan de espacio en disco; se recomienda escoger un unico fichero.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/qwen3.5-9b-uncensored-GGUF
- Modelo base: https://huggingface.co/mshodiqul/qwen3.5-9b-uncensored
- Cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/qwen3.5-9b-uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#qwen3.5-9b-uncensored-GGUF
- Solicitudes de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo.
