# LlamaPal/Bonsai-8B-GGUF

## Resumen

Bonsai-8B-GGUF es una distribucion cuantizada en formato GGUF del modelo Bonsai 8B desarrollado por PrismML, publicada por el usuario LlamaPal como espejo del fichero original `prism-ml/Bonsai-8B-gguf`. Se trata de un modelo de generacion de texto de 8.188.548.096 parametros entrenado desde cero a precision de 1 bit, lo que permite comprimir el modelo completo en un fichero de aproximadamente 1,2 GB con cuantizacion Q1_0. El repositorio no aporta modificaciones sobre el original: mismos bytes y mismo hash SHA-256.

La relevancia del modelo reside en su orientacion a inferencia en dispositivo (on-device), especificamente en telefonos Android mediante la aplicacion LlamaPal, que funciona de forma totalmente offline y sin cuenta de usuario. El objetivo es ofrecer capacidad de chat con un modelo de 8B en hardware movil, algo que con cuantizaciones convencionales de 4 bits exigiria varios gigabytes de almacenamiento y RAM.

La ficha se basa exclusivamente en la informacion disponible en el repositorio de Hugging Face y en la model card citada. No se han publicado en esa informacion datos sobre arquitectura interna, composicion del dataset de entrenamiento, longitud de contexto ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 8B segun el autor; detalles no publicados) |
| Parametros totales | 8.188.548.096 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q1_0 (1 bit), formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Bonsai-8B.gguf`, 1,2 GB) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo fue entrenado desde cero a precision de 1 bit, lo que constituye su innovacion principal: en lugar de cuantizar a posteriori un modelo entrenado en FP16/BF16, el entrenamiento se realiza directamente en baja precision, lo que segun el autor permite preservar la capacidad del modelo de 8B con una huella de almacenamiento propia de un modelo mucho menor. El resultado se distribuye como un unico fichero GGUF con cuantizacion Q1_0 de aproximadamente 1,2 GB.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones adicionales como decodificacion especulativa o atencion lineal. Tampoco se detalla la arquitectura interna mas alla de la referencia generica a un modelo de 8B. El repositorio de LlamaPal es un espejo sin modificaciones del fichero publicado por PrismML en `prism-ml/Bonsai-8B-gguf`, en el commit `48516770dd04`, con hash SHA-256 `284a335aa3fb2ced3b1b01fcb40b08aa783e3b70832767f0dd2e3fdfa134bd54`.

## Capacidades

- Generacion de texto conversacional: el modelo se presenta como un modelo de chat para uso en la aplicacion LlamaPal, con pipeline `text-generation` y etiqueta `conversational`.
- Inferencia offline en dispositivo: funciona sin conexion a internet una vez descargado el fichero, sin cuenta de usuario y sin enviar datos fuera del telefono.
- Compatibilidad con llama.cpp: al ser un GGUF estandar, carga en llama.cpp y en cualquier aplicacion construida sobre esta libreria.
- Ejecucion en Android: distribuido a traves de la aplicacion LlamaPal disponible en Google Play.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Chat privado en Android sin conexion: el modelo se descarga una vez (1,2 GB) y permite conversaciones completas en el telefono sin enviar datos a servidores externos, lo que resulta adecuado para usuarios con requisitos de privacidad o en entornos sin conectividad.
- Asistencia en entornos sin red: en zonas rurales, vuelos, transporte publico o instalaciones aisladas, el modelo ofrece generacion de texto local sin depender de una API remota.
- Prototipado rapido de aplicaciones LLM en movil: al ser un GGUF estandar compatible con llama.cpp, sirve como base para desarrolladores que quieran integrar un modelo de 8B en apps Android sin infraestructura de servidor.
- Procesamiento de texto sensible en dispositivo: resumen o reescritura de notas, mensajes o documentos personales que el usuario no desea enviar a un servicio en la nube, aprovechando que nada de lo tecleado sale del telefono.
- Pruebas de concepto de cuantizacion a 1 bit: investigadores interesados en evaluar el comportamiento real de un modelo entrenado a 1 bit pueden usar este fichero como referencia reproducible, dado que se distribuye con hash verificado.
- Uso educativo y demostraciones: la aplicacion LlamaPal y el fichero GGUF permiten mostrar en talleres o clases como funciona un modelo de lenguaje local de 8B en hardware de consumo, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero pesa 1,2 GB; se necesita espacio equivalente en almacenamiento y RAM suficiente para cargar los pesos y el contexto (no se publica una cifra oficial de RAM minima).
- GPU recomendadas: no disponible; el modelo esta orientado a CPU movil (Android) mediante llama.cpp.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: llama.cpp y cualquier aplicacion construida sobre el, incluida la app LlamaPal para Android.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de contexto que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones en la informacion disponible, por lo que no es posible verificar la calidad real del modelo frente a alternativas de 8B.
- Entrenamiento a 1 bit: aunque el autor lo presenta como una ventaja, la precision de 1 bit puede degradar tareas que requieren matices finos (razonamiento aritmetico, codigo, instrucciones complejas); no se aportan datos que lo confirmen o desmientan.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar usos con documentos largos o conversaciones multi-turno extensas.
- Idiomas no declarados: no se indica que idiomas soporta el modelo, por lo que el rendimiento en castellano no esta garantizado.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinacion; al ser un modelo conversacional, el riesgo de generar informacion incorrecta con tono seguro es inherente y no esta cuantificado.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el repositorio es un espejo; conviene consultar la model card original de PrismML para terminos adicionales.
- Repositorio espejo: LlamaPal no es el autor del modelo; cualquier incidencia o actualizacion debe verificarse en `prism-ml/Bonsai-8B-gguf`.
- Sin soporte declarado de tool calling ni agentes: no se documentan estas capacidades, por lo que no deben asumirse en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/Bonsai-8B-GGUF
- Repositorio original del modelo GGUF: https://huggingface.co/prism-ml/Bonsai-8B-gguf
- Repositorio del modelo sin cuantizar: https://huggingface.co/prism-ml/Bonsai-8B-unpacked
- Aplicacion LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
