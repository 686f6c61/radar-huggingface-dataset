# Mindral/ComRAD-200B-GGUF

## Resumen

ComRAD 200B (nombre interno "ComRAD Boreale") es un checkpoint experimental de tipo Mixture-of-Experts con 194.927.503.582 parametros, derivado del modelo zai-org/GLM-5.3-Flash mediante una metodologia propietaria de transformacion de pesos denominada ComRAD, sin entrenamiento adicional ni fine-tuning. El proyecto lo firma Federico Alessandro, de 17 anos, bajo la organizacion Mindral. Se distribuye unicamente en formato GGUF con cuantizacion Q4_K, en un unico archivo de 114.333.049.568 bytes (unos 114,33 GB).

El modelo se presenta como una preview experimental orientada a generacion de texto y conversacion, con plantilla de chat embebida y un modo de razonamiento ("High reasoning") activado por defecto. No se aportan resultados de benchmarks estandarizados: las unicas evidencias publicadas son comprobaciones funcionales pequenas (identidad, un ejemplo de codigo C++17 con 12 casos de prueba y ocho preguntas informales de razonamiento e instrucciones).

Su relevancia es limitada y debe interpretarse con cautela: se trata de un artefacto de investigacion sin validacion independiente, con contexto probado de solo 4.096 tokens y un unico entorno de ejecucion verificado (LM Studio con llama.cpp CUDA 2.66.0 sobre RTX PRO 6000 de 96 GB VRAM y ~188 GB de RAM de sistema, con offload parcial a RAM). La licencia Apache 2.0 permite uso comercial, pero el autor no reclama paridad de calidad con el modelo de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 194.927.503.582 (~194,93 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (contexto probado; no se declara maximo arquitectonico) |
| Tipos de cuantizacion | Q4_K (unica publicada) |
| Idiomas soportados | en, it |
| Licencia | Apache 2.0 (contribuciones ComRAD); aviso MIT upstream de GLM-5.3-Flash conservado en LICENSE.upstream |
| Formato de pesos | GGUF (archivo unico ComRAD-Boreale-195B-Q4_K.gguf, 114.333.049.568 bytes) |

## Arquitectura y entrenamiento

La arquitectura es Mixture-of-Experts, heredada del checkpoint base zai-org/GLM-5.3-Flash (revision 46a050bec13002ad29ee795c16e61cf4fa3c4a9c). El autor no detalla el numero de expertos, el ratio de activacion, ni la dimension oculta; el dato de parametros activos no esta disponible. La transformacion ComRAD se aplica sobre los pesos del modelo de origen sin entrenamiento ni fine-tuning adicionales, y la metodologia, el compilador y las herramientas internas de desarrollo no se incluyen en el repositorio.

No se publican datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni fases de RLHF/DPO, puesto que no ha habido entrenamiento por parte del autor de esta derivacion. El checkpoint incorpora una plantilla de chat embebida que activa por defecto razonamiento de nivel "High"; la configuracion de inferencia probada usa temperatura 0, top-p 1, top-k 0, min-p 0, repetition penalty 1.0 y penalizaciones de frecuencia y presencia a 0, con un maximo de 1.536 tokens generados incluido el razonamiento. El GGUF es autonomo para inferencia: no requiere el checkpoint GLM original en tiempo de ejecucion.

## Capacidades

- Generacion de texto y conversacion multi-turno, con historial gestionado por la aplicacion de chat (no hay memoria persistente entre conversaciones distintas).
- Razonamiento con modo "High reasoning" por defecto mediante la plantilla embebida; el presupuesto de generacion incluye los tokens de razonamiento, por lo que limites cortos pueden truncar el razonamiento antes de la respuesta final.
- Generacion de codigo: se valido un ejemplo C++17 compilado con g++ (`-std=c++17 -O2 -Wall -Wextra -pedantic`) sin diagnosticos y 12/12 casos funcionales superados (entrada vacia, enteros negativos, valores repetidos, orden original y extremos enteros).
- Instrucciones y razonamiento informal: ocho preguntas informales superadas segun el autor, sin revision independiente de las transcripciones.
- Identidad de modelo: responde "ComRAD Boreale" en la configuracion servida.
- Capacidades multilingues limitadas a ingles e italiano segun los metadatos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni otras modalidades.

## Casos de uso

- Experimentacion con tecnicas de transformacion de pesos: el checkpoint permite estudiar como una modificacion propietaria de pesos sobre un MoE de ~195B afecta a la coherencia conversacional, comparando salidas con el GLM-5.3-Flash original en el mismo runtime.
- Evaluacion de despliegue GGUF de gran escala con offload: util para medir el comportamiento de llama.cpp cuando parte del modelo reside en RAM de sistema (configuracion probada: 96 GB VRAM + ~188 GB RAM).
- Generacion de codigo acotada en C++17: el unico caso validado funcionalmente; adecuado para tareas pequenas y verificables con compilador y bateria de tests propia, no para pipelines de produccion sin validacion adicional.
- Prototipado de asistentes conversacionales en ingles e italiano con contexto corto (4.096 tokens), por ejemplo dialogos de atencion al cliente de pocos turnos donde el historial cabe en esa ventana.
- Pruebas de plantillas de chat y modos de razonamiento: permite evaluar el efecto del modo "High reasoning" y de los parametros de muestreo recomendados (temperatura 0, top-p 1) sobre la calidad y la longitud de salida.
- Reproducibilidad de artefactos: el repositorio incluye SHA256SUMS y manifest.json con verificacion SHA-256 del GGUF completo, lo que facilita replicar exactamente el checkpoint congelado el 13 de noviembre de 2026 en auditorias internas.
- Investigacion sobre limites de contexto: al estar probado solo a 4.096 tokens, sirve para caracterizar degradacion fuera de esa ventana antes de considerar contextos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que las comprobaciones presentadas son "small functional checks", no puntuaciones de benchmark, y que no se reclama paridad de calidad con el modelo de origen.

| Comprobacion | Resultado declarado |
|---|---|
| Identidad | Devuelve "ComRAD Boreale" y termina de forma natural en la configuracion servida |
| Ejemplo de codigo C++17 | Compila con g++ sin diagnosticos |
| Casos funcionales del ejemplo C++ | 12/12 superados (entrada vacia, negativos, repetidos, orden original, extremos) |
| Ocho preguntas informales de razonamiento e instrucciones | 8/8 superadas segun el autor, sin revision independiente |
| Historial de conversacion | Uso correcto de mensajes previos dentro de la misma conversacion, segun el autor |

## Requisitos de hardware

- VRAM estimada para inferencia: el unico dato publicado es el consumo real observado, superior al tamano del archivo de pesos (114,33 GB). En la configuracion probada, parte del modelo se descargo a RAM de sistema.
- Configuracion verificada: RTX PRO 6000 con 96 GB VRAM y aproximadamente 188 GB de RAM de sistema, con offload parcial a RAM. El autor aclara que es una configuracion probada, no un minimo medido.
- GPU recomendadas: no disponible como recomendacion formal; la unica GPU documentada es la RTX PRO 6000 (96 GB). No hay datos sobre A100, H100 ni RTX 4090.
- Viabilidad en GPU de consumo: no disponible; con 114,33 GB en Q4_K, el modelo no cabe integramente en GPUs consumer de 24 GB o menos, y no se han validado configuraciones de ese tipo.
- Opciones de despliegue: llama.cpp a traves del runtime CUDA de LM Studio 2.66.0 (unico runtime validado). No se han validado vLLM, TGI, Ollama ni otros backends, ni otros sistemas operativos.
- Latencia y throughput: no disponible; no se publican medidas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ComRAD 200B (esta ficha) | ~194,93B (MoE) | 4.096 probados | GGUF Q4_K | Apache 2.0 + MIT upstream | Publicado en HF, 0 descargas, 1 like |
| zai-org/GLM-5.3-Flash (base) | no disponible en esta informacion | no disponible | no disponible (checkpoint original, no GGUF) | MIT (aviso conservado) | Disponible en HF (revision 46a050be...) |
| Alternativas de ~200B MoE en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre ComRAD 200B y su modelo base ni con otras alternativas de la misma categoria; el autor no reclama paridad de calidad con GLM-5.3-Flash y no publica benchmarks.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como preview; pruebas dirigidas anteriores observaron imprecisiones cientificas, errores de codigo y salidas que excedian un presupuesto corto de generacion. Superar los ejemplos actuales no demuestra que esos fallos esten resueltos para otras entradas.
- Sin benchmarks: no hay evaluacion estandarizada ni paridad de calidad declarada con el modelo de origen.
- Riesgo de alucinacion: no cuantificado, pero plausible en un checkpoint sin entrenamiento adicional y con validacion funcional minima.
- Contexto limitado: solo 4.096 tokens probados; no se declara el maximo arquitectonico ni se han validado contextos mayores.
- Idiomas: solo ingles e italiano segun metadatos; no se documenta soporte de castellano.
- Presupuesto de generacion: el maximo probado es de 1.536 tokens incluido el razonamiento; limites cortos pueden truncar el razonamiento antes de la respuesta final.
- Validacion de entorno unica: solo se ha verificado LM Studio con llama.cpp CUDA 2.66.0; otros runtimes, sistemas operativos, longitudes de contexto y hardware no han sido validados.
- Memoria: el uso en tiempo de ejecucion supera el tamano del archivo de pesos (114,33 GB); el offload a RAM condiciona el rendimiento y no se publican metricas de latencia.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion bajo sus terminos, sin condiciones separadas de no-comercial o no-reventa; se conserva el aviso MIT upstream de GLM-5.3-Flash, que debe mantenerse en redistribuciones.
- Metodologia opaca: la metodologia ComRAD, el compilador y las herramientas internas no se incluyen en el repositorio, lo que impide reproducir la derivacion de pesos.
- Historial de conversacion: lo aporta la aplicacion de chat; no hay memoria persistente entre conversaciones.
- Traccion minima: 0 descargas y 1 like en el momento de la consulta, sin validacion independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mindral/ComRAD-200B-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Revision del modelo base: 46a050bec13002ad29ee795c16e61cf4fa3c4a9c
- Artefactos de integridad citados en el repositorio: SHA256SUMS, manifest.json, inference_config.json, LICENSE, LICENSE.upstream, NOTICE
- Papers, blogs, repos adicionales y demos: no disponible en la informacion proporcionada
