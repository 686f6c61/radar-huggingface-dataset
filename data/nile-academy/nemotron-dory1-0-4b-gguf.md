# nile-academy/nemotron-dory1.0-4b-gguf

## Resumen

`nile-academy/nemotron-dory1.0-4b-gguf` es una distribucion en formato GGUF del modelo `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16` de NVIDIA, publicada por Nile Academy como espejo de artefacto o conversion de formato registrada, sin entrenamiento adicional. El repositorio contiene un unico fichero en cuantizacion Q5_K_M (3,673 GB) exportado por el publicador original, sobre un modelo base de 3.975.229.440 parametros totales. La licencia del modelo original es OpenMDW 1.1.

El interes practico del artefacto es que reduce un modelo de ~4B parametros a menos de 4 GB en disco, lo que lo situa en el rango de GPU de consumo y de inferencia en CPU. La model card del espejo advierte explicitamente de que la inferencia en bucle ("looped inference") requiere soporte de motor compilado compatible, y de que la cuantizacion no ha sido cualificada por el distribuidor: las puntuaciones publicadas corresponden al modelo fuente, no a este fichero GGUF.

La informacion disponible es limitada: no se documentan longitud de contexto, idiomas soportados, composicion del dataset de entrenamiento ni detalles de arquitectura mas alla de la referencia a inferencia en bucle. Esta ficha recoge unicamente los datos verificables en la informacion proporcionada y marca como "no disponible" todo lo demas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona "looped inference" y evaluaciones con "2 loops", lo que apunta a reutilizacion de capas; no se detalla) |
| Parametros totales | 3.975.229.440 (incluye embeddings y, segun la model card, las modalidades de origen) |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (unico fichero publicado, exportacion oficial de NVIDIA) |
| Idiomas soportados | no disponible (la model card menciona tareas multilingues y de arabe en la evaluacion pendiente, sin listar idiomas) |
| Licencia | OpenMDW 1.1 (`other` en metadatos de HuggingFace, con `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF (fichero `NVIDIA-Nemotron-Labs-Dory1.0-4B-Q5_K_M.gguf`, 3,673 GB) |

## Arquitectura y entrenamiento

No se dispone de detalles de arquitectura en la informacion proporcionada. La model card del espejo menciona que la "inferencia en bucle" necesita soporte de un motor compilado compatible, y las puntuaciones publicadas se obtuvieron con "2 loops" como ajuste de evaluacion. Esto sugiere un esquema de computo recurrente o de reutilizacion de bloques, pero no se especifica numero de capas, tipo de atencion, dimension oculta ni si se trata de un transformer denso convencional. Tampoco se documenta si el modelo base es multimodal, aunque el recuento de parametros se describe como "incluye embeddings y modalidades de origen", lo que deja abierta la posibilidad de entradas distintas del texto.

Respecto al entrenamiento, no hay informacion sobre volumen de tokens, composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste por instrucciones. La model card indica unicamente que Nile Academy actua como espejo oficial del artefacto o como conversion de formato explicitamente registrada, sin entrenamiento adicional, y que las tarjetas y avisos del publicador original se conservan en `provenance/`. El modelo base fue publicado el 2026-10-16 segun la evidencia de fecha del publicador, con revision fijada `b366b87f762ea334ba3eb55912031baba1515810`.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el repositorio incluye la etiqueta `conversational`.
- Razonamiento de nivel experto segun el publicador: 72,41 % en GPQA Diamond con 2 loops (medido sobre el modelo fuente, no sobre esta cuantizacion).
- Ingenieria de software y resolucion de issues: 59,5 % en SWE-bench Verified con 2 loops, segun el harness del publicador.
- Ejecucion de tareas en terminal: 18,1 % en Terminal-Bench 2.1 con 2 loops, un resultado bajo que acota su uso en automatizacion de shell.
- Soporte de tool calling / function calling: la model card del espejo menciona plantilla nativa de chat, herramientas y plantillas en la plataforma Wekala, pero indica que la cualificacion de chat, tool y plantilla esta pendiente.
- Uso como agente multi-paso: los benchmarks publicados (SWE-bench, Terminal-Bench) se evaluaron en modo agente, aunque el rendimiento real en esta cuantizacion no esta medido.
- Capacidades multilingues: no disponibles; la model card incluye tareas multilingues y de arabe en el plan de evaluacion pendiente, sin especificar idiomas cubiertos.
- Modo "thinking" o bucles de razonamiento: el ajuste "2 loops" sugiere un mecanismo de computo iterativo, pero no se describe como modo de pensamiento explicito.

## Casos de uso

- Asistente local en puesto de trabajo: el fichero Q5_K_M ocupa 3,673 GB, por lo que cabe en GPUs de consumo de 8 GB o mas y permite un asistente de texto que no sale de la maquina del usuario, con llama.cpp u Ollama como motor.
- Revisión de codigo en pipelines de integracion continua: el 59,5 % declarado en SWE-bench Verified lo hace plausible para tareas de parcheo acotado y generacion de diffs, siempre que se valide el resultado con tests y se asuma que la cifra corresponde al modelo fuente sin cuantizar.
- Prototipado de agentes con herramientas: la etiqueta `conversational` y la referencia a plantillas de chat y herramientas permiten montar un bucle de agente basico; conviene instrumentar permisos y validacion porque la propia tarjeta advierte de que las llamadas a herramientas son propuestas sujetas a la admision de la aplicacion consumidora.
- RAG sobre documentacion interna: con contexto limitado o desconocido, el uso realista es recuperacion de pocos fragmentos y respuestas cortas; requiere medir la ventana efectiva antes de disenar el troceado, ya que la longitud de contexto no esta publicada.
- Evaluacion comparativa de cuantizaciones: util como variante Q5_K_M frente al BF16 de NVIDIA en un banco de pruebas pareado de instrucciones, conocimiento, matematicas, multilinguismo y herramientas, tal como recomienda la propia model card antes de recomendar el artefacto.
- Despliegue en entornos aislados o sin conectividad: al ser un unico fichero GGUF con licencia OpenMDW 1.1, encaja en escenarios de laboratorio o industrial con red restringida, donde un modelo de ~4B en CPU es suficiente para tareas de extraccion y resumen.
- Docencia y experimentacion: el tamano reducido y el formato GGUF permiten reproducir experimentos de inferencia en bucle y comparar comportamiento con y sin compatibilidad de motor, un detalle relevante dado el aviso sobre "looped inference".

## Benchmarks y rendimiento

| Benchmark | Puntuacion (%) | Modo y ajustes |
|---|---:|---|
| GPQA Diamond | 72,41 | 2 loops; protocolo del publicador; no normalizado entre modelos; no medido sobre esta cuantizacion |
| SWE-bench Verified | 59,5 | 2 loops; harness del publicador; no normalizado entre modelos; no medido sobre esta cuantizacion |
| Terminal-Bench 2.1 | 18,1 | 2 loops; harness del publicador; no normalizado entre modelos; no medido sobre esta cuantizacion |

No se han publicado resultados de benchmarks sobre el fichero Q5_K_M en la informacion disponible. Las cifras anteriores corresponden al modelo fuente segun el publicador, con harness, precision y versiones de tarea potencialmente distintas; la model card indica explicitamente que no deben tratarse como una clasificacion normalizada entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 3,673 GB; hay que sumar estado de contexto, buffers de trabajo y margen del driver. Como referencia practica, entre 5 y 8 GB para contextos moderados, cifra no medida por el publicador.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible. Por tamano, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090, L4, A10G o A100/H100 pueden alojarlo con holgura creciente; la model card advierte de que el ajuste sostenido en 8 GB de VRAM requiere perfiles medidos propios.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas de VRAM, siempre que el motor soporte la inferencia en bucle del modelo.
- Opciones de despliegue: llama.cpp y derivados (llama-cpp-python, Ollama si la arquitectura esta soportada) son la via natural para GGUF; vLLM o TGI solo si admiten esta arquitectura y el formato. La model card subraya que la inferencia en bucle necesita soporte de motor compilado compatible y que no se instala ningun backend automaticamente.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion para este fichero.
- Cualificacion movil y navegador: pendiente segun la model card; no se debe asumir funcionamiento en esos entornos sin un perfil medido.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos comparables. La siguiente tabla recoge la comparacion con alternativas de la misma clase de tamano (3-4B parametros, licencia permisiva) usando exclusivamente caracteristicas publicas conocidas de esas familias; los datos de rendimiento de las alternativas no forman parte de la informacion suministrada y se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Datos de benchmarks en la informacion disponible |
|---|---|---|---|---|
| Nemotron Dory 1.0 4B (este, Q5_K_M) | 3,975 mil millones | no disponible | OpenMDW 1.1 | GPQA Diamond 72,41; SWE-bench Verified 59,5; Terminal-Bench 2.1 18,1 (modelo fuente) |
| Qwen3-4B | 4 mil millones aprox. | no disponible en esta ficha | Apache 2.0 | no disponible |
| Llama 3.2 3B Instruct | 3,2 mil millones | no disponible en esta ficha | Llama 3.2 Community License | no disponible |
| Gemma 3 4B | 4 mil millones aprox. | no disponible en esta ficha | Gemma Terms of Use | no disponible |

Elementos diferenciales verificables de este artefacto: licencia OpenMDW 1.1 (distinta de Apache 2.0 y de las licencias comunitarias de Meta y Google, con terminos que deben revisarse antes de uso comercial), publicacion exclusiva en GGUF Q5_K_M, y dependencia de un motor compatible con inferencia en bucle, lo que reduce la portabilidad frente a transformers estandar.

## Limitaciones y advertencias

- Cuantizacion no cualificada: la model card declara "not qualified" la cualificacion amplia de calidad de cuantizacion y no se hace ninguna afirmacion general de "sin perdida significativa de calidad". Las puntuaciones publicadas no se midieron sobre este fichero.
- Dependencia de motor: la inferencia en bucle requiere soporte compilado compatible; sin el, el modelo puede no ejecutarse o hacerlo de forma incorrecta.
- Sesgos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o fairness.
- Alucinacion: riesgo inherente a un modelo de ~4B; la model card advierte de que puede producir salidas incorrectas o inseguras. No hay datos de tasa de alucinacion.
- Idiomas: no se listan idiomas soportados y la evaluacion multilingue, incluido arabe, esta pendiente segun la propia tarjeta.
- Tool calling: las llamadas a herramientas son propuestas sujetas a los permisos de la aplicacion consumidora y a la admision del controlador; no deben ejecutarse sin validacion.
- Licencia: OpenMDW 1.1 impone terminos que hay que revisar para uso comercial y para redistribucion; el repositorio no concede derechos sobre el SDK de Wekala.
- Madurez del artefacto: repositorio con 0 descargas y 0 "likes", creado y actualizado el 2026-10-19, sin cualificacion de chat, herramientas, plantilla, ajuste sostenido en GPU ni movil/navegador. No hay historial de uso que respalde su fiabilidad en produccion.
- Contexto desconocido: al no publicarse la longitud de contexto, cualquier diseno de prompt, RAG o agente debe validarse empiricamente antes de desplegar.
- Rendimiento en terminal bajo: 18,1 % en Terminal-Bench 2.1 desaconseja su uso para automatizacion autonoma de shell o tareas de sistema sin supervision.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/nile-academy/nemotron-dory1.0-4b-gguf
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Revision fijada del modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16/tree/b366b87f762ea334ba3eb55912031baba1515810
- Model card exacta del publicador: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16/blob/b366b87f762ea334ba3eb55912031baba1515810/README.md
- Texto de la licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/

La busqueda web no devolvio resultados relevantes sobre este modelo: los enlaces encontrados corresponden a una consultora de asuntos publicos, a la enciclopedia del rio Nilo y a una marca de ropa, ninguno relacionado con el artefacto. No se han localizado papers, blogs tecnicos, repositorios de codigo ni demos adicionales en la informacion proporcionada.
