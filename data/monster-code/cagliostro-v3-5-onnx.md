# Monster-Code/cagliostro-v3.5-onnx

## Resumen

cagliostro-v3.5-onnx es una exportacion al formato ONNX del modelo bench-labs/cagliostro-v3, un modelo de lenguaje pequeno (SLM) de 146 millones de parametros, publicada por el usuario Monster-Code en Hugging Face. El objetivo de esta version no es entrenar un modelo nuevo, sino ofrecer los pesos originales en un grafo ONNX listo para ejecutarse en entornos donde no hay Python ni CUDA disponibles, en particular navegadores web mediante ONNX Runtime y WebGPU. El repositorio ocupa 0,6 GB, un tamano coherente con pesos en precision completa (FP32) de un modelo de 146M de parametros (~584 MB) mas los ficheros auxiliares del grafo.

El modelo base, cagliostro-v3, esta etiquetado como SLM y text-generation, y su model card no documenta arquitectura, contexto ni composicion del dataset de entrenamiento, mas alla de declarar la cifra de 146M de parametros. La etiqueta custom_code presente en los tags sugiere que la arquitectura no se corresponde con una clase estandar del catalogo de Transformers, lo que refuerza el interes de una exportacion ONNX: al no depender de una implementacion Python concreta, el grafo es portable a runtimes de inferencia genericos.

La relevancia de esta publicacion es, por tanto, practica: permite desplegar un SLM de 146M de parametros directamente en el cliente (navegador, aplicaciones de escritorio, dispositivos edge) sin servidor de inferencia, con un consumo de memoria reducido y sin coste por token en la nube. El numero de descargas (177) y la ausencia de likes indican un uso todavia muy limitado y un modelo sin validacion comunitaria significativa. La licencia no esta declarada, lo que constituye un obstaculo relevante para cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como SLM; tag custom_code, sin detalle de arquitectura en la model card) |
| Parametros totales | 146 millones (segun la model card del export) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles en el repositorio; el grafo es ONNX en precision completa, cuantizable a posteriori con herramientas de ONNX Runtime (int8/int4) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | ONNX (tamano del repositorio: 0,6 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base bench-labs/cagliostro-v3. La model card del export se limita a indicar que se trata de un "ONNX export" de un modelo de 146M de parametros "ready for deployment in in-browser runtimes with ONNX Runtime / WebGPU". La presencia del tag custom_code sugiere que el modelo base requiere codigo propio para su carga, lo que habitualmente implica una arquitectura modificada (atencion alternativa, bloques hibridos o variantes no cubiertas por las clases estandar de la libreria Transformers), pero no hay confirmacion de cual es el caso.

Tampoco hay datos sobre el proceso de entrenamiento: numero de tokens, composicion del corpus, idiomas, uso de RLHF o DPO, ni tecnicas de alineacion. Del mismo modo, no se documenta ninguna innovacion tecnica especifica (decodificacion especulativa, atencion lineal, atencion con ventana deslizante, etc.). Lo unico verificable es el resultado del proceso de exportacion: un grafo ONNX de 0,6 GB que conserva los 146M de parametros del modelo original y que, segun el autor, esta preparado para ejecutarse con ONNX Runtime y WebGPU en el navegador.

## Capacidades

- Generacion de texto autoregresiva: el pipeline declarado en el Hub es text-generation.
- Ejecucion en navegador: el objetivo explicito del export es el despliegue en runtimes in-browser con ONNX Runtime y WebGPU, sin backend Python.
- Razonamiento, codigo, matematicas o vision: no disponible; la model card no documenta ninguna de estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, audio, vision): no disponible; no se menciona ninguna.

## Casos de uso

- Inferencia local en navegador: el caso de uso principal y explicito del repositorio. Se cargaria el grafo ONNX con ONNX Runtime Web y WebGPU para generar texto directamente en el cliente, sin enviar datos a un servidor y sin coste de API. Es adecuado por el tamano reducido del modelo (146M de parametros) y por el formato ONNX.
- Autocompletado y asistencia de escritura en aplicaciones web: un SLM de este tamano puede ofrecer sugerencias de texto en tiempo real dentro de un editor o formulario, manteniendo la latencia baja al ejecutarse en el propio dispositivo.
- Prototipado y evaluacion de pipelines ONNX: util para equipos que necesitan un modelo pequeno con el que validar su infraestructura de inferencia (ONNX Runtime, WebGPU, aceleracion por hardware) antes de migrar a modelos mayores.
- Procesamiento de texto en el borde (edge computing): despliegue en dispositivos con recursos limitados donde no es viable ejecutar un modelo de miles de millones de parametros, siempre que la tarea concreta admita un SLM.
- Aplicaciones con requisitos de privacidad: al no requerir envio de datos a un servicio externo, encaja en escenarios donde el texto del usuario no puede salir del dispositivo (borradores internos, notas personales, formularios sensibles), sujeto a la licencia no declarada.
- Filtrado o clasificacion de texto ligera: generacion de resumenes cortos, reformulaciones o normalizacion de entradas en un pipeline previo a un modelo mayor, aprovechando el bajo coste de inferencia.
- Demostraciones educativas: ejemplo de exportacion y despliegue de un modelo de Transformers a ONNX, util en material docente sobre portabilidad de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio Monster-Code/cagliostro-v3.5-onnx no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han encontrado datos de rendimiento del modelo base bench-labs/cagliostro-v3 en la busqueda realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP32 (coincide con el tamano del repositorio), unos 0,3 GB en FP16 y entre 0,15 y 0,2 GB en int8. Son estimaciones derivadas del numero de parametros, no mediciones publicadas.
- GPU recomendadas: no hay recomendaciones en la informacion disponible. Por tamano, cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; el modelo no requiere A100 ni H100.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (serie RTX 30/40, GTX 16xx, integradas recientes con varios GB de memoria compartida).
- CPU: la inferencia en CPU es viable para un modelo de 146M de parametros, especialmente con cuantizacion int8.
- Navegador: el autor indica soporte para ONNX Runtime y WebGPU, por lo que puede ejecutarse en el cliente sin GPU dedicada si el navegador expone WebGPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), onnxruntime-web con WebGPU, y en general cualquier runtime compatible con el formato ONNX. vLLM y llama.cpp no consumen grafos ONNX de forma nativa, por lo que no son opciones directas para estos pesos.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a caracteristicas verificables. Los valores de los modelos de referencia proceden de sus model cards publicas y se incluyen como orientacion de categoria.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|
| Monster-Code/cagliostro-v3.5-onnx | 146M | no disponible | no disponible | ONNX | no disponibles |
| SmolLM2-135M (HuggingFaceTB) | 135M | 8.192 tokens | Apache-2.0 | safetensors, GGUF, ONNX | si, publicados |
| Qwen2.5-0.5B (Alibaba) | 494M | 32.768 tokens | Apache-2.0 | safetensors, GGUF | si, publicados |
| Gemma 3 270M (Google) | 270M | 32.000 tokens | licencia Gemma (uso comercial con condiciones) | safetensors | si, publicados |

La diferencia mas relevante frente a estas alternativas no es de rendimiento, que no puede evaluarse sin datos, sino de trazabilidad y soporte: los tres modelos de referencia cuentan con licencia explicita, documentacion de entrenamiento y resultados de evaluacion publicos, mientras que cagliostro-v3.5-onnx carece de los tres elementos.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no puede asumirse permiso de uso comercial, modificacion ni redistribucion. Es el principal riesgo legal del repositorio.
- Ausencia total de benchmarks: no hay evidencia publica de calidad, y la ausencia de likes y el bajo numero de descargas (177) indican falta de validacion por parte de la comunidad.
- Riesgo de alucinacion: con 146M de parametros, la tasa de errores factuales y de invencion de contenido es estructuralmente alta; no debe usarse en tareas que exijan precision factual sin verificacion posterior.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o si su entrenamiento se centro en ingles.
- Contexto desconocido: al no declararse la longitud de contexto, no puede disenarse una aplicacion que dependa de conversaciones largas o documentos extensos.
- Arquitectura no documentada: el tag custom_code implica que la carga del modelo puede requerir codigo especifico; hay que verificar la compatibilidad con la version concreta de ONNX Runtime antes de integrarlo.
- Origen incierto del modelo base: bench-labs/cagliostro-v3 no aporta informacion sobre datos de entrenamiento, sesgos potenciales ni proceso de alineacion, por lo que no es posible evaluar sesgos conocidos.
- Idoneidad limitada en produccion: un SLM de 146M de parametros no es adecuado para razonamiento complejo, generacion de codigo no trivial ni tareas de agentes multi-paso.
- Fecha de publicacion en el Hub inusual: los metadatos indican 2026-10-05, lo que sugiere un posible error de registro; conviene comprobar la vigencia real del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Monster-Code/cagliostro-v3.5-onnx
- Modelo base: https://huggingface.co/bench-labs/cagliostro-v3
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos asociados a este modelo. Los resultados obtenidos corresponden a entidades no relacionadas (Monster.com, Monster Energy, un cuaderno de Stable Diffusion), por lo que no se incluyen.
