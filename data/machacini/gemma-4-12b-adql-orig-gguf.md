# Machacini/gemma-4-12b-adql-orig-GGUF

## Resumen

`Machacini/gemma-4-12b-adql-orig-GGUF` es un ajuste fino (fine-tune) comunitario de `google/gemma-4-12B-it`, un modelo de lenguaje instruido de Google, especializado en la generación de consultas ADQL (Astronomical Data Query Language) a partir de peticiones en lenguaje natural sobre el archivo de la misión Gaia. El entrenamiento se realizó mediante LoRA con dos épocas sobre 59.605 pares de descripciones en inglés y consultas ADQL, y el adaptador se fusionó en los pesos base antes de la conversión a GGUF.

El problema que resuelve es concreto y de nicho: reducir la barrera de entrada al servicio TAP de Gaia, cuyo lenguaje de consulta ADQL requiere conocimiento específico del esquema y de la sintaxis astronómica. Con este modelo, un investigador puede formular la petición en inglés y obtener directamente una sentencia `SELECT` ejecutable contra el servicio de datos de Gaia.

Es relevante porque demuestra el valor de los fine-tunes verticales ligeros (LoRA rank 16) sobre modelos base de tamaño medio (~12.000 millones de parámetros), y porque se distribuye en formato GGUF sin cuantizar (BF16), listo para ejecutarse localmente con llama.cpp u otros runtimes compatibles con la arquitectura `gemma4`. El artefacto pesa aproximadamente 23,83 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (familia Gemma 4), con adaptador LoRA fusionado |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 sin cuantizacion adicional (GGUF); no hay variantes cuantizadas publicadas |
| Idiomas soportados | Ingles (entrenamiento del fine-tune); el modelo base Gemma 4 it soporta mas idiomas, pero el ajuste fino esta orientado a consultas en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo unico `gemma4_12b-orig-BF16.gguf`, 23.832.066.144 bytes) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer decodificador instruido de la familia Gemma 4 con unos 11.900 millones de parametros. Sobre el modelo base se aplico un ajuste fino supervisado mediante LoRA con rank 16, alpha 32 y dropout 0,05; el adaptador se fusiono posteriormente en los pesos base antes de convertir el modelo a GGUF con llama.cpp (commit `184f6536024668e8908ab8c86033d56708e62b40`). La conversion incluye los tensores del modelo de texto y el tokenizador con su plantilla de chat, pero no los proyectores multimodales, por lo que esta exportacion es solo de texto.

El entrenamiento consistio en dos epocas de NL-to-ADQL con valores originales, usando 59.605 descripciones de entrenamiento retenidas y 7.433 de validacion. El autor documenta en `provenance.json` los metadatos y el checksum del artefacto. No hay informacion sobre el uso de RLHF o DPO, lo cual es coherente con un fine-tune supervisado de tarea unica.

## Capacidades

- Generacion de consultas ADQL a partir de peticiones en lenguaje natural en ingles, orientadas al esquema de datos de Gaia (catalogo estelar de la ESA).
- Generacion de texto conversacional general heredada del modelo base `gemma-4-12B-it`, aunque el fine-tune esta especializado en el dominio astronomico.
- Salida estructurada tipo SQL: sentencias `SELECT` con alias, filtros y referencias a columnas del esquema de Gaia.
- No incluye capacidades multimodales: los proyectores de vision no se incluyeron en la conversion GGUF.
- No hay informacion disponible sobre soporte de tool calling, function calling ni capacidades de agente.
- No hay informacion disponible sobre razonamiento multi-paso ni modo de thinking.

## Casos de uso

- Consultas ad hoc al archivo de Gaia: un investigador sin dominio de ADQL describe en ingles lo que busca (por ejemplo, estrellas de un tipo espectral en una region del cielo) y obtiene la consulta `SELECT` lista para enviar al servicio TAP de Gaia.
- Prototipado rapido de analisis estelar: exploracion interactiva del catalogo de Gaia sin consultar manualmente la documentacion del esquema, acelerando ciclos de prueba y error.
- Integracion en pipelines de datos astronomicos: el modelo puede actuar como capa de traduccion NL-to-ADQL en herramientas internas de observatorios o grupos de investigacion que generen consultas automaticamente.
- Generacion aumentada por recuperacion (RAG) sobre catalogos astronomicos: combinando el modelo con un indice de documentacion del esquema de Gaia para producir consultas mas precisas.
- Ensenanza de ADQL: generacion de ejemplos de consultas comentadas para formacion de estudiantes de astroinformatica, usando el modelo como generador de ejercicios.
- Asistentes de chat cientificos locales: despliegue on-premise en instituciones que no pueden enviar datos a servicios en la nube, gracias al formato GGUF ejecutable localmente.
- Validacion y pruebas de servicios TAP: generacion de lotes de consultas ADQL variadas para someter a prueba endpoints de datos astronomicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta unicamente el tamano de los conjuntos de entrenamiento (59.605) y validacion (7.433), sin metricas de exactitud, validez sintactica ni equivalencia semantica de las consultas generadas. El propio autor advierte que la generacion end-to-end desde este GGUF no ha sido validada.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo BF16 pesa ~23,83 GB, por lo que se necesitan al menos 24 GB de VRAM (o memoria unificada) para cargarlo por completo con contexto moderado; con overhead de KV cache, 32 GB es una cifra mas realista.
- GPU recomendadas: RTX 4090 o RTX 5090 (24 GB) en el limite, con offload parcial a RAM; RTX A6000, RTX 6000 Ada, L40S o A100 (40/80 GB) con margen comodo. En Mac, equipos con memoria unificada de 32 GB o mas (M2/M3/M4 Pro/Max).
- Consumer GPU: cabe con limitaciones en una RTX 3090/4090 de 24 GB usando offload de capas a RAM/CPU via llama.cpp; el rendimiento se degradara respecto a una carga completa en GPU.
- Alternativa practica: no existen variantes cuantizadas publicadas en este repositorio; una cuantizacion Q4/Q5 (no disponible aqui) reduciria el footprint a ~7-9 GB y permitiria ejecucion comoda en GPUs de 12-16 GB.
- Despliegue: llama.cpp (runtime de referencia, requiere soporte de la arquitectura `gemma4` en la version usada), LM Studio, Ollama o cualquier runtime compatible con GGUF. No hay informacion sobre vLLM o TGI para este artefacto GGUF.
- Latencia y throughput: no disponible; en una GPU de gama alta con carga completa, un modelo de 12B en BF16 deberia ofrecer decodificacion del orden de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Machacini/gemma-4-12b-adql-orig-GGUF | 11,9 B | GGUF BF16 | NL-to-ADQL (Gaia) | Apache-2.0 | Hugging Face (acceso con autenticacion mientras sea privado) |
| google/gemma-4-12B-it (base) | ~12 B | safetensors | Uso general instruido | Licencia Gemma (repositorio base declara Apache-2.0) | Hugging Face |
| Modelos NL-to-SQL genericos (p. ej., fine-tunes de CodeLlama/StarCoder2 para SQL) | 7-15 B tipico | safetensors / GGUF | NL-to-SQL general | Variable | Hugging Face |

No hay fine-tunes comparables publicos especificos para ADQL/Gaia en la informacion disponible; la alternativa mas cercana seria usar el modelo base con prompting few-shot o un modelo NL-to-SQL generico, con menor especializacion en el esquema de Gaia.

## Limitaciones y advertencias

- Artefactos en los datos de entrenamiento: los targets contienen normalizaciones problematicas; las consultas generadas pueden usar alias con prefijo de guion bajo (`_`) que el servicio TAP de Gaia rechaza, y algunas referencias con comodines cualificados pueden ser inconsistentes con alias renombrados. El autor confirma que estos pesos no fueron reentrenados para corregirlo, aunque renombrar los alias afectados a nombres con prefijo alfabético recupera muchas consultas fallidas.
- Sin validacion end-to-end: la generacion desde este GGUF no ha sido probada; solo se verificaron el parseo, el numero de tensores, el tamano esperado y la presencia de la plantilla de chat.
- Requisito de runtime: el runtime debe soportar la arquitectura `gemma4`; versiones antiguas de llama.cpp y derivados pueden no cargar el modelo.
- La equivalencia estatica de una consulta no garantiza su aceptacion por el servicio ADQL en vivo ni su correccion cientifica: toda consulta debe validarse contra el esquema y el servicio objetivo.
- Acceso restringido: el repositorio requiere autenticacion mientras permanezca privado.
- Idioma: el fine-tune esta entrenado con descripciones en ingles; el rendimiento con peticiones en castellano no esta garantizado ni evaluado.
- Sesgos y riesgo de alucinacion: no hay evaluaciones publicadas de sesgos ni de tasas de alucinacion; como todo LLM, puede generar consultas sintacticamente validas pero semanticamente incorrectas (columnas o tablas inexistentes), especialmente fuera del dominio de Gaia.
- Licencia: Apache-2.0 acompana el artefacto derivado; el repositorio base pinned declara Apache-2.0, pero conviene verificar los terminos vigentes de la licencia del modelo base de Google antes de uso comercial.

## Enlaces

- Modelo: https://huggingface.co/Machacini/gemma-4-12b-adql-orig-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Herramienta de conversion: https://github.com/ggml-org/llama.cpp
- Paper, blog o demo: no disponible
