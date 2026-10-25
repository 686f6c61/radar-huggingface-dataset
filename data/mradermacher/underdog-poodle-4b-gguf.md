# mradermacher/Underdog-Poodle-4B-GGUF

## Resumen

Underdog-Poodle-4B-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo ConwayResearch/Underdog-Poodle-4B, publicada por mradermacher, un autor conocido por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas derivadas (Ollama, LM Studio, kobold.cpp). El modelo base tiene 4.326.350.848 parámetros (aproximadamente 4,33 mil millones) y está orientado explicitamente a tool calling, function calling y flujos de agentes, segun las etiquetas de la model card. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta al repositorio Qwen/Qwen3.5-4B, lo que sugiere un linaje derivado de esa familia.

El interés practico de esta publicacion es la disponibilidad de 12 variantes de cuantizacion (desde Q2_K de 2,1 GB hasta f16 de 8,8 GB) mas dos ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal en llama.cpp. Esto permite ejecutar un modelo de 4B con capacidades de agentes en hardware de consumo, algo relevante para prototipado local de asistentes que invocan herramientas sin depender de APIs externas.

No se ha publicado informacion sobre arquitectura interna, longitud de contexto, datos de entrenamiento ni resultados de benchmarks en la documentacion disponible. La model card se limita a describir el proceso de cuantizacion y a listar los ficheros generados, por lo que las secciones tecnicas siguientes reflejan unicamente lo verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el enlace de licencia apunta a Qwen/Qwen3.5-4B como posible linaje; la model card no detalla la arquitectura) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,33 B), segun safetensors del modelo base |
| Parametros activos | No disponible; no hay evidencia de arquitectura MoE en la informacion proporcionada |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K (2,1 GB), Q3_K_S (2,2 GB), Q3_K_M (2,4 GB), Q3_K_L (2,6 GB), IQ4_XS (2,7 GB), Q4_K_S (2,7 GB), Q4_K_M (2,9 GB), Q5_K_S (3,2 GB), Q5_K_M (3,3 GB), Q6_K (3,7 GB), Q8_0 (4,7 GB), f16 (8,8 GB); mas mmproj-Q8_0 (0,5 GB) y mmproj-f16 (0,8 GB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base. Se trata de un modelo de 4,33 mil millones de parametros distribuido originalmente en safetensors por ConwayResearch y convertido a GGUF por mradermacher mediante un pipeline de conversion `hf` con cuantizacion de tensores de salida (`output_tensor_quantised: 1`, `quantize_version: 2`). El campo `license_link` de la model card remite a Qwen/Qwen3.5-4B, lo que apunta a un posible origen en esa familia, pero no se confirma en el texto.

Tampoco se detallan los datos de entrenamiento: no hay numero de tokens, composicion del dataset, ni mencion de etapas de RLHF, DPO o ajuste por instrucciones. Las etiquetas `tool-calling`, `function-calling` y `agents` indican que el ajuste del modelo base esta orientado a la invocacion de funciones, pero se desconoce el metodo concreto empleado. La unica innovacion tecnica documentada es la propia cuantizacion: el autor ofrece variantes estaticas y remite a un repositorio separado (i1-GGUF) para cuantizaciones ponderadas con matriz de importancia (imatrix).

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline de transformers del modelo base indican uso como modelo de chat.
- Tool calling y function calling: etiquetado explicitamente por el autor, lo que sugiere soporte para emitir llamadas estructuradas a funciones externas.
- Flujos de agentes: la etiqueta `agents` apunta a uso en razonamiento multi-paso con herramientas, aunque no se detalla el esquema de plantillas o formatos soportados.
- Entrada multimodal: la presencia de ficheros `mmproj-Q8_0` y `mmproj-f16` indica que el modelo base incorpora un proyector multimodal utilizable con llama.cpp; no se especifica si cubre vision, audio u otra modalidad.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse detras de APIs compatibles con el formato de transformers.
- Idiomas: unicamente ingles declarado; no hay evidencia de capacidades multilingues.
- No hay informacion sobre modo de razonamiento explicito (thinking), matemáticas, codigo o generacion aumentada por busqueda.

## Casos de uso

- Prototipado local de agentes con herramientas: gracias al etiquetado de tool calling y a las cuantizaciones de 2,7-2,9 GB (Q4_K_S, Q4_K_M), se puede desplegar un bucle de agente en un portatil con GPU de 8 GB y probar esquemas de llamadas a funciones antes de migrar a un modelo mayor.
- Automatizacion de tareas de escritorio con entrada visual: los ficheros mmproj permiten en llama.cpp procesar imagenes junto al texto, lo que habilita casos como extraer datos de capturas de pantalla o interpretar diagramas simples en un pipeline local.
- Servicio de atencion al cliente de bajo coste en ingles: un modelo de 4B cuantizado a Q4_K_M puede atender conversaciones multi-turno en una unica GPU de consumo; la limitacion de contexto no documentada obliga a validar la ventana real antes de production.
- Enrutamiento de intenciones y clasificacion con salida estructurada: el soporte de function calling encaja en un patron de "router" que decide que herramienta o endpoint invocar en un sistema mayor, con latencia baja por el reducido numero de parametros.
- Entorno de pruebas para evaluacion de cuantizaciones: al ofrecer 12 variantes del mismo modelo, es util para medir la degradacion de calidad entre Q2_K y Q8_0 en tareas de function calling dentro de un pipeline de CI interno.
- Ejecucion en dispositivos sin GPU dedicada: la variante Q2_K (2,1 GB) y Q3_K_S (2,2 GB) permiten inferencia en CPU con llama.cpp o Ollama, adecuado para demos offline o entornos con memoria limitada.
- Generacion de texto asistida en herramientas de escritorio: integracion via Ollama o LM Studio para autocompletado, resumen o reescritura en ingles dentro de aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de function calling, y tampoco se aportan mediciones de perplexity propias mas alla de la grafica externa de comparacion de tipos de cuantizacion enlazada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan desde 2,1 GB (Q2_K) hasta 8,8 GB (f16). A esa cifra hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto, que no esta documentada; como referencia practica, reserve entre 0,5 y 2 GB adicionales segun contexto y batch.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) para Q4_K_M o Q5_K_M; 12-16 GB (RTX 4070 Ti, RTX 4080, A4000) para Q8_0 con contexto amplio; 24 GB (RTX 4090, A5000, L4/A10) para f16 sin restricciones. En A100/H100 el modelo queda desaprovechado por su tamano, salvo despliegue de muchas instancias concurrentes.
- Cabe en GPU de consumo: si. Q4_K_S y Q4_K_M (2,7-2,9 GB) caben en GPUs de 6-8 GB; Q8_0 (4,7 GB) cabe en 8 GB con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y servidores compatibles con GGUF. vLLM y TGI no son la via natural para estos ficheros; para ellos habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Underdog-Poodle-4B-GGUF (este repo) | 4,33 B | No disponible | GGUF (12 cuantizaciones + 2 mmproj) | Apache 2.0 | Cuantizaciones estaticas, sin imatrix |
| mradermacher/Underdog-Poodle-4B-i1-GGUF | 4,33 B | No disponible | GGUF (cuantizaciones ponderadas/imatrix) | Apache 2.0 (heredada) | Misma base, cuantizacion con matriz de importancia; calidad superior a igual tamano segun el autor |
| ConwayResearch/Underdog-Poodle-4B | 4,33 B | No disponible | Safetensors | Apache 2.0 | Modelo base sin cuantizar; requiere transformers y VRAM completa en f16/BF16 |
| Qwen/Qwen3.5-4B | No disponible en la informacion | No disponible | No disponible | Referenciada en `license_link` | Posible linaje del modelo; sin datos verificables en esta busqueda |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria (por ejemplo, otros modelos de 4B orientados a tool calling). Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Idioma: solo se declara ingles. No hay soporte documentado de castellano ni de otros idiomas, por lo que su uso en produccion en espanol requeriria evaluacion previa.
- Ausencia total de benchmarks: no se puede afirmar nada sobre calidad en razonamiento, codigo o fidelidad en function calling sin evaluacion propia.
- Longitud de contexto desconocida: es un parametro critico para agentes y conversaciones multi-turno; debe medirse empiricamente antes de disenar el sistema.
- Perdida por cuantizacion: las variantes Q2_K y Q3_K_* degradan la calidad de forma notable, especialmente en tareas de salida estructurada donde un token mal generado invalida el JSON de llamada a funcion. Para tool calling se recomienda Q5_K_M o superior.
- Riesgo de alucinacion: inherente a modelos de 4B; en invocacion de funciones puede traducirse en llamadas con argumentos inventados o nombres de herramientas inexistentes, por lo que se necesita validacion y esquema estricto en el lado del servidor.
- Ficheros mmproj con proposito no documentado: se desconoce que modalidad cubren y con que calidad; no se debe asumir soporte de vision robusto sin pruebas.
- Licencia: Apache 2.0 permite uso comercial, pero el `license_link` remite a la licencia de Qwen/Qwen3.5-4B; conviene verificar los terminos del modelo base antes de un despliegue comercial.
- Repositorio de 41 GB: la descarga completa de todas las cuantizaciones es costosa; descargue unicamente el fichero necesario.
- Autor de la cuantizacion distinto del autor del modelo: los posibles fallos de conversion o de plantilla de chat deben reportarse contra el modelo base, no contra este repositorio.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Underdog-Poodle-4B-GGUF
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Poodle-4B
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/Underdog-Poodle-4B-i1-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Underdog-Poodle-4B-GGUF
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Peticiones de cuantizacion y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
