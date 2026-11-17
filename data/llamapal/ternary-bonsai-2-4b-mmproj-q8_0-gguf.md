# LlamaPal/Ternary-Bonsai-2-4B-mmproj-Q8_0-GGUF

## Resumen

Ternary-Bonsai-2-4B-mmproj-Q8_0-GGUF es el complemento de vision (proyector multimodal, `mmproj`) del modelo Ternary Bonsai 2 4B, empaquetado en formato GGUF con cuantizacion Q8_0. Lo publica el autor LlamaPal como espejo sin modificaciones del fichero original de prism-ml, con el objetivo de que su aplicacion movil para Android pueda descargarlo junto al modelo principal cuando el usuario activa las capacidades de vision. No se trata de un modelo autonomo, sino de un adaptador que conecta un codificador visual con el modelo de lenguaje base para habilitar la entrada de imagenes.

El modelo base declarado es Qwen/Qwen3.5-4B, sobre el que se ha aplicado una cuantizacion ternaria (de ahi el nombre Ternary Bonsai) y posteriormente una conversion a GGUF. El fichero de este repositorio concreto contiene 333.514.240 parametros y ocupa 0,4 GB en el repositorio, con un unico fichero de 367 MB. La licencia es Apache 2.0 y el pipeline declarado es `image-text-to-text`.

La relevancia de esta ficha es acotada: se trata de un artefacto de distribucion para inferencia local en dispositivos moviles, no de un modelo con benchmarks publicados ni con una model card tecnica propia. Toda la informacion sustantiva sobre arquitectura, entrenamiento y rendimiento remite al repositorio original de prism-ml, que no forma parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (proyector multimodal `mmproj` para un modelo base Qwen/Qwen3.5-4B cuantizado de forma ternaria; la arquitectura del LLM no se detalla en la informacion disponible) |
| Parametros totales | 333.514.240 (dato de safetensors del repositorio) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Ternary-Bonsai-2-4B-mmproj-Q8_0.gguf`, 367 MB, SHA-256 `db939d5f9b7014137810205e91d05e5f54afd72b0b3af9d33bd7d82f7906a55d`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni del proyector. Por la nomenclatura y los tags, se trata de un modelo de lenguaje Qwen/Qwen3.5-4B sometido a una cuantizacion ternaria (denominada "Ternary Bonsai 2" por sus autores originales) y convertido a GGUF para su uso con llama.cpp. El fichero de este repositorio es exclusivamente el componente `mmproj`, es decir, el proyector que traduce representaciones visuales al espacio de embeddings del modelo de lenguaje para permitir entrada de imagenes.

No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas del proyector. El repositorio declara ser una copia byte a byte del fichero de prism-ml/Ternary-Bonsai-2-4B-gguf en el commit `50ebba61be85`, sin modificaciones, por lo que cualquier detalle tecnico adicional debe consultarse en el repositorio original.

## Capacidades

- Entrada de imagenes combinada con texto (`image-text-to-text`): el `mmproj` habilita que el modelo base procese imagenes junto a instrucciones en lenguaje natural.
- Inferencia local y offline en Android: disenado para ejecutarse en el dispositivo mediante llama.cpp, sin conexion a internet ni cuentas de usuario.
- Integracion con llama.cpp: se pasa como fichero `--mmproj` junto al modelo principal correspondiente.
- Capacidades de generacion de texto, razonamiento, codigo o matematicas: heredadas del modelo base Qwen/Qwen3.5-4B, pero no documentadas en la informacion disponible para esta variante.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta cumplimentado).

## Casos de uso

- Asistente visual offline en Android: el `mmproj` permite que la app LlamaPal describa o responda preguntas sobre una foto tomada con el movil sin enviar la imagen a ningun servidor, lo que resulta adecuado para entornos sin conectividad o con requisitos de privacidad estrictos.
- Accesibilidad en dispositivo: lectura de documentos, etiquetas o carteles mediante la camara del telefono, con el modelo ejecutandose localmente y sin coste por inferencia en la nube.
- Despliegue en llama.cpp de escritorio: cualquier usuario que ya tenga el modelo principal Ternary Bonsai 2 4B en GGUF puede anadir este fichero como `--mmproj` para habilitar vision en su pipeline local.
- Pruebas de concepto de modelos multimodales cuantizados: util para investigadores que evaluen el comportamiento de un LLM ternario de 4B con entrada visual en hardware de gama baja.
- Aplicaciones de campo sin cobertura: tecnicos que necesiten interpretar imagenes (equipos, senalizacion, documentos) en ubicaciones remotas donde no hay red.
- Integracion en apps Android de terceros: al ser un GGUF estandar compatible con llama.cpp y con licencia Apache 2.0, puede incorporarse en otras aplicaciones moviles que empaqueten el runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero `mmproj` ocupa 367 MB en Q8_0; a ello hay que sumar la memoria del modelo principal Ternary Bonsai 2 4B, cuyo tamano y cuantizacion no se detallan en la informacion disponible.
- GPU recomendadas: no disponible. El caso de uso declarado es CPU/GPU integrada de telefonos Android mediante llama.cpp.
- Compatibilidad con GPU de consumo: no se especifica; el diseno apunta a ejecucion en moviles, no a GPUs de escritorio de gama alta.
- Opciones de despliegue: llama.cpp (pasando el fichero como `--mmproj`) y la aplicacion LlamaPal para Android. No se mencionan vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (proyectores multimodales para LLM cuantizados en GGUF) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo principal Ternary Bonsai 2 4B en GGUF, este fichero no produce ninguna salida util.
- Ausencia total de benchmarks y de model card tecnica propia: cualquier evaluacion de calidad debe hacerse sobre el repositorio original de prism-ml.
- Idiomas no declarados: no se puede garantizar el comportamiento multilingue del modelo base en esta variante.
- El repositorio declara cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- Riesgo de alucinacion inherente a los LLM de 4B cuantizados de forma agresiva (ternaria), especialmente en tareas de descripcion de imagenes detalladas.
- La licencia Apache 2.0 permite uso comercial, pero el autor de este repositorio no es el autor original del modelo; conviene verificar los terminos en prism-ml/Ternary-Bonsai-2-4B-gguf antes de un despliegue en produccion.
- Al ser una copia espejo, la trazabilidad y el mantenimiento dependen del repositorio original; este repositorio no garantiza actualizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/Ternary-Bonsai-2-4B-mmproj-Q8_0-GGUF
- Repositorio original del modelo: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Commit del fichero espejo: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf/tree/50ebba61be85e5be07e8083db468ace0fc1bac43
- Aplicacion LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
