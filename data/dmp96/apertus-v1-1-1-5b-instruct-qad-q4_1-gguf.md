# DMP96/Apertus-v1.1-1.5B-Instruct-QAD-Q4_1-GGUF

## Resumen

Este repositorio aloja una cuantizacion en formato GGUF, concretamente en Q4_1, de un modelo identificado en el propio nombre del repositorio como Apertus v1.1 1.5B Instruct. El autor de la publicacion es el usuario DMP96 y la licencia declarada es Apache 2.0. Se trata, por tanto, de una conversion de pesos orientada a inferencia local mediante llama.cpp y sus derivados (Ollama, LM Studio, kobold.cpp), no de un modelo entrenado desde cero ni de un ajuste fino.

La model card del repositorio no aporta informacion tecnica: unicamente contiene la declaracion de licencia. No se documentan arquitectura, longitud de contexto, idiomas, plantilla de chat, tokenizador ni procedimiento de cuantizacion. El repositorio registra cero descargas y cero valoraciones en el momento de la consulta, por lo que no existe validacion comunitaria de que los pesos sean funcionales.

La relevancia practica de una publicacion asi es acotada pero real: un modelo de aproximadamente 1.500 millones de parametros en Q4_1 ocupa del orden de 0,85-1 GB, lo que lo situa en el rango ejecutable en CPU y en GPU de gama baja. Ahora bien, sin datos de evaluacion ni documentacion del modelo base, cualquier uso en produccion exige validacion propia previa.

Nota metodologica: los datos de esta ficha se limitan a lo declarado en el repositorio y a lo que puede inferirse del nombre del mismo. Todo lo no confirmado se marca como no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a planificadores de rutas y no son pertinentes), por lo que no se han podido incorporar datos externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la documenta; el nombre del repositorio apunta a un modelo de tipo transformer, sin confirmar) |
| Parametros totales | no disponible en la model card; el nombre del repositorio indica 1.5B (aproximadamente 1.500 millones), dato no confirmado por documentacion tecnica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_1 (unico archivo publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (declarada en el repositorio; la licencia de los pesos originales del modelo base no se especifica) |
| Formato de pesos | GGUF |
| Modelo base | Apertus v1.1 1.5B Instruct (inferido del nombre del repositorio, no confirmado en la model card) |
| Autor de la cuantizacion | DMP96 |
| Descargas / valoraciones | 0 / 0 |
| Fecha de creacion | 2026-09-12 |
| Fecha de ultima actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base ni sobre su proceso de entrenamiento: la model card no menciona numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO, RLVR) ni innovaciones de atencion. Tampoco se detalla el pipeline de cuantizacion empleado por el autor, la version de llama.cpp utilizada, ni si se preservaron capas en mayor precision (por ejemplo, embeddings o la cabeza de salida).

Lo unico verificable es el formato de peso. La cuantizacion Q4_1 de GGUF es un esquema de cuantizacion por bloques de 32 pesos con dos valores de punto flotante de 16 bits por bloque (escala y minimo, o delta), lo que da una media de 4,5 bits por peso. Es un formato historico de llama.cpp: ofrece mejor fidelidad que Q4_0 (que solo almacena escala) pero queda por debajo de los esquemas k-quant modernos como Q4_K_M o Q5_K_M en relacion calidad/tamano, ya que estos ultimos aplican precision mixta por capas.

En consecuencia, no es posible evaluar si la conversion introduce degradaciones adicionales sobre el modelo original, ni si el GGUF incluye metadatos correctos (plantilla de chat, tokens especiales de BOS/EOS, identificadores de arquitectura) que permitan usarlo como modelo de instrucciones sin configuracion manual.

## Capacidades

No hay ninguna capacidad verificada en la informacion disponible. A partir del nombre del repositorio (sufijo "Instruct") y del tamano declarado, cabe esperar de forma tentativa, siempre pendiente de validacion:

- Generacion de texto e instrucciones simples en un unico turno o en conversacion corta.
- Razonamiento basico de un solo paso y tareas de reformulacion, resumen y reescritura.
- Generacion de codigo de fragmentos cortos, con fiabilidad limitada por el tamano del modelo.
- Soporte de tool calling o function calling: no disponible, no documentado. No debe asumirse.
- Soporte de agentes y razonamiento multi-paso: no disponible, poco probable en este rango de tamano.
- Capacidades multilingues: no disponible, no se declara ningun idioma.
- Capacidad de vision, audio o modo "thinking": no disponible y no anunciada.
- Rellenado intermedio (fill-in-the-middle) para autocompletado de codigo: no disponible.

## Casos de uso

- Asistente de texto sin conexion en portatil sin GPU: con un peso de aproximadamente 1 GB, el modelo puede cargarse integramente en RAM y ejecutarse con llama.cpp u Ollama sobre CPU, lo que permite un asistente de redaccion y resumen que no envia datos a ningun servicio externo.
- Clasificacion y etiquetado por lotes: procesar grandes volumenes de textos cortos (categorizacion de tickets, deteccion de intencion, filtrado de resenas) en CPU, donde el coste por inferencia es minimo y el throughput agregado importa mas que la latencia individual.
- Extraccion de campos en documentos cortos: convertir correos, facturas simples o fichas en estructuras JSON, con validacion posterior obligatoria por el riesgo de alucinacion propio de un modelo de 1,5B.
- Prototipado rapido de aplicaciones LLM: al exponerse mediante servidores compatibles con la API de OpenAI (llama.cpp server, Ollama, LM Studio), sirve para desarrollar y probar la logica de una aplicacion antes de migrar a un modelo mayor, manteniendo el mismo contrato de API.
- Chatbot embebido en dispositivos de recursos limitados: kioscos, Raspberry Pi 5 o mini-PC industriales con 4-8 GB de RAM pueden alojar el modelo para respuestas acotadas a un dominio cerrado, con contexto limitado y respuestas de plantilla.
- Enrutador previo en una arquitectura multi-modelo: usar esta instancia para decidir si una consulta es trivial (se responde localmente) o requiere derivarse a un modelo grande, reduciendo coste de API y latencia media.
- Generacion de datos sinteticos para pruebas: crear textos de ejemplo, casos de test y datos de relleno para entornos de desarrollo sin incurrir en costes de inferencia externos.
- Resumen dentro de herramientas de escritorio: integracion en un plugin de editor o cliente de correo para condensar notas y hilos breves, siempre con el texto completo dentro de la ventana de contexto (que en este repositorio no se especifica).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K ni ninguna otra) y la busqueda web realizada no devolvio resultados pertinentes sobre el modelo. Tampoco hay mediciones de latencia o throughput publicadas por el autor.

## Requisitos de hardware

Los valores siguientes son estimaciones derivadas del recuento de parametros que figura en el nombre del repositorio (1,5B) y del tamano teorico del esquema Q4_1; no proceden de mediciones publicadas.

- Peso en disco: aproximadamente 0,85-1,0 GB para el archivo GGUF (1,5B parametros a 4,5 bits por peso, mas metadatos).
- VRAM estimada con toda la capa en GPU: del orden de 1,5-2,5 GB contando pesos, cache KV y buffers con un contexto moderado; puede crecer con contextos largos.
- CPU: ejecutable en cualquier procesador moderno x86-64 o ARM con 4-8 GB de RAM libre; es el escenario mas realista dado el formato.
- GPU consumer: cabe con Holgura en GTX 1650 4 GB, RTX 3050, RTX 4060, RTX 3060 12 GB, RTX 4090 y cualquier GPU con 4 GB o mas de VRAM. Es probable que quepa parcialmente incluso en iGPU con memoria compartida.
- GPU de datacenter: A100, H100, L40S y similares pueden servir el modelo, pero estan sobredimensionadas; solo tendrian sentido para despliegues con muchisima concurrencia o lotes grandes.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, kobold.cpp, text-generation-webui. vLLM y TGI no aceptan GGUF de forma nativa general, por lo que requeririan convertir a safetensors o usar variantes especificas.
- Movil y edge: posible en telefonos de gama alta y en placas tipo Raspberry Pi 5 mediante llama.cpp, con velocidades de decenas de tokens por segundo en el mejor de los casos (estimacion, no medida).
- Latencia y throughput: no disponible. No hay ninguna medicion publicada en el repositorio.

## Comparativa con modelos similares

No existe ninguna metrica de calidad publicada para el modelo de esta ficha, por lo que la comparacion se limita a parametros, contexto declarado, licencia y disponibilidad de formatos. Los datos de las filas de comparacion proceden de la documentacion publica de cada proyecto y no han sido verificados en la busqueda web de esta ficha; conviene contrastarlos antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Apertus v1.1 1.5B Instruct QAD Q4_1 GGUF (DMP96) | 1.5B segun el nombre del repositorio, no confirmado | no disponible | Apache 2.0 (declarada en el repositorio) | GGUF Q4_1 | Sin documentacion, sin benchmarks, 0 descargas |
| Qwen2.5 1.5B Instruct | 1.54B | 32 768 tokens | Apache 2.0 | safetensors, GGUF comunitario | Documentacion completa, benchmarks publicados por el autor |
| Llama 3.2 1B Instruct | 1.23B | 128 000 tokens | Licencia comunitaria de Llama 3.2 | safetensors, GGUF comunitario | Requiere aceptar la licencia; benchmarks publicados |
| Gemma 2 2B it | 2.6B | 8 192 tokens | Licencia de Gemma | safetensors, GGUF comunitario | Benchmarks publicados; terminos de uso propios |

Diferencias relevantes frente a las alternativas: la ventaja de esta publicacion es el tamano reducido del archivo en Q4_1 y su licencia Apache 2.0 declarada; la desventaja es la ausencia total de documentacion, evaluacion y validacion, frente a alternativas con model card completa, benchmarks y ecosistema de cuantizaciones mantenidas (Q4_K_M, Q5_K_M, Q8_0, entre otras).

## Limitaciones y advertencias

- Documentacion inexistente: la model card solo declara la licencia. No hay arquitectura, contexto, idiomas ni instrucciones de uso.
- Riesgo de que el GGUF no incluya plantilla de chat ni tokens especiales, lo que degradaria el comportamiento como modelo de instrucciones y exigiria configurarla a mano.
- Calidad de cuantizacion: Q4_1 es inferior a los esquemas k-quant modernos (Q4_K_M, Q5_K_M) en la misma huella de disco; para un modelo de 1,5B las perdidas de calidad pueden ser perceptibles.
- Alucinacion: en modelos de este tamano es frecuente, especialmente en tareas factuales, matematicas o de varios pasos. No debe usarse como fuente de verdad sin verificacion.
- Contexto desconocido: sin este dato no es posible garantizar que entradas largas quepan en la ventana; el truncado silencioso es un riesgo real.
- Idiomas desconocidos: no se declara ningun idioma, por lo que no puede asumirse un buen rendimiento en castellano.
- Sin validacion comunitaria: cero descargas y cero valoraciones en la fecha consultada implica que nadie ha confirmado que los pesos carguen o generen texto coherente.
- Licencia del modelo base sin confirmar: el repositorio declara Apache 2.0 para la conversion, pero la licencia de los pesos originales de Apertus no se especifica aqui. Antes de un uso comercial conviene verificar la licencia del modelo base en su repositorio oficial.
- Ausencia de mantenimiento: la fecha de creacion y la de ultima actualizacion son identicas, sin historial posterior de revisiones.
- No apto como unico modelo en produccion critica sin evaluacion propia previa y sin un plan de respaldo hacia un modelo con documentacion y benchmarks verificables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DMP96/Apertus-v1.1-1.5B-Instruct-QAD-Q4_1-GGUF
- Enlaces adicionales (paper, blog, repositorio del modelo base, demo): no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.
