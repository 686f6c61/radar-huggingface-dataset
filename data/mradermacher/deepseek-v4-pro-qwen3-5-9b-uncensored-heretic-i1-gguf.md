# mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF es la distribucion en formato GGUF, con cuantizacion de tipo imatrix (i1), del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic. El repositorio lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, y su funcion es ofrecer los pesos del modelo base en multiples niveles de compresion para su uso con llama.cpp y herramientas compatibles. El modelo subyacente es un transformer denso de 9.197.093.888 parametros (unos 9,2 mil millones) derivado de la familia Qwen3.5 y destilado a partir de DeepSeek, segun indican las etiquetas del repositorio.

La relevancia de esta publicacion radica en tres factores. Primero, el modelo base incorpora las etiquetas reasoning, distillation, sft, rl y gspo, lo que sugiere un entrenamiento por destilacion con aprendizaje por refuerzo orientado al razonamiento. Segundo, incluye las etiquetas tool-use y function-calling, capacidades muy demandadas en pipelines de agentes. Tercero, el modelo ha sido sometido a un proceso de "abliteration" o "decensoring" (etiquetas heretic, uncensored, decensored, abliterated), es decir, se ha modificado para reducir los rechazos ante peticiones que el modelo original bloquearia, lo que cambia radicalmente su perfil de uso y sus riesgos.

El repositorio acumula 378.160 descargas y 27 likes, con un tamano total de 81,3 GB que incluye todas las variantes de cuantizacion. La licencia declarada es Apache 2.0 y los idiomas soportados son ingles, chino, coreano, japones, espanol y ruso. La model card del cuantizador es puramente operativa: describe los ficheros GGUF disponibles y remite al repositorio estatico para los ficheros mmproj, lo que indica que el modelo base es multimodal (vision).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, segun etiquetas); detalles de capas y atencion no disponibles |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix y variantes estaticas en repositorio aparte) |
| Idiomas soportados | Ingles (en), chino (zh), coreano (ko), japones (ja), espanol (es), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales del modelo base presumiblemente en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Las etiquetas indican que pertenece a la familia qwen3_5, lo que implica un transformer denso con los componentes habituales de esa saga (atencion con RoPE, normalizacion RMSNorm y capas MLP con activacion SwiGLU, aunque estos detalles concretos no se confirman en la informacion proporcionada). El numero de parametros, 9,2 mil millones, situa al modelo en la gama media, apta para inferencia en GPU de consumo con cuantizacion agresiva.

En cuanto al entrenamiento, las etiquetas del repositorio revelan un pipeline compuesto por destilacion (distillation) desde DeepSeek, ajuste supervisado (sft) y aprendizaje por refuerzo con el algoritmo GSPO (rl, gspo). Tambien aparece la etiqueta mtp, que en la familia DeepSeek corresponde a Multi-Token Prediction, una tecnica de decodificacion especulativa que predice varios tokens por paso. No se dispone del numero de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de abliteration aplicado para eliminar los rechazos del modelo original. El cuantizador no aporta informacion adicional sobre el entrenamiento; su trabajo se limita a generar las cuantizaciones i1 a partir de los pesos del modelo base.

## Capacidades

- Generacion de texto conversacional y de formato largo, con etiqueta conversational en el repositorio.
- Razonamiento explicito: las etiquetas reasoning y mtp apuntan a un modo de razonamiento con prediccion multi-token.
- Matematicas y STEM: etiquetas math y stem en la model card.
- Generacion de codigo: no aparece etiqueta explicita de code, pero el perfil de destilacion desde DeepSeek y las capacidades de tool-use lo hacen probable; no confirmado.
- Tool calling y function calling: etiquetas tool-use y function-calling.
- Capacidades de agente y razonamiento multi-paso: derivadas del soporte de tool calling y del modo de razonamiento.
- Vision: la model card del cuantizador indica explicitamente "This is a vision model" y remite a los ficheros mmproj del repositorio estatico.
- Multilingue: seis idiomas declarados (en, zh, ko, ja, es, ru).
- Modo sin censura: el proceso heretic/abliterated reduce los rechazos ante peticiones sensibles.

## Casos de uso

- Asistente conversacional multilingue: el modelo cubre seis idiomas, incluido el espanol, lo que permite desplegar un unico modelo para atencion en varios mercados sin cambiar de pesos. La cuantizacion i1-Q4_K_M (5,9 GB) cabe en una GPU de 8 GB y permite servir conversaciones en local.
- Agente con tool calling en produccion: las etiquetas tool-use y function-calling lo hacen adecuado para orquestar llamadas a APIs, consultas a bases de datos o ejecucion de comandos en pipelines de automatizacion, con el modelo actuando como planificador de pasos.
- Razonamiento matematico y STEM en entornos educativos: las etiquetas math y stem sugieren un ajuste especifico para resolver problemas paso a paso, util en tutoria automatizada o generacion de ejercicios resueltos.
- Procesamiento de documentos con vision: al ser un modelo multimodal con ficheros mmproj, puede extraer informacion de capturas, diagramas o formularios escaneados en flujos de digitalizacion.
- Investigacion sobre alineacion y seguridad: la variante abliterated permite estudiar el comportamiento de un modelo sin las capas de rechazo del original, comparandolo con la version censurada en experimentos de red teaming controlados.
- Despliegue en hardware de consumo: con cuantizaciones desde 4,0 GB (i1-Q2_K) hasta 7,7 GB (i1-Q6_K), el modelo puede ejecutarse en portatiles con GPU integrada o en equipos con una RTX 3060 de 12 GB, lo que facilita prototipado sin infraestructura cloud.
- Generacion de contenido creativo sin restricciones tematicas: el proceso heretic elimina los rechazos ante temas sensibles, lo que resulta util en escritura de ficcion con tematicas adultas o guiones que abordan violencia, siempre que se cumplan los requisitos legales del pais de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos mas overhead de contexto y cache KV):
  - i1-Q2_K: ~4,0 GB de pesos, ~5-6 GB de VRAM en total.
  - i1-Q4_K_M: ~5,9 GB de pesos, ~7-8 GB de VRAM en total.
  - i1-Q6_K: ~7,7 GB de pesos, ~9-10 GB de VRAM en total.
  - El overhead real depende de la longitud de contexto configurada, no disponible en la informacion.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100 para despliegues con contexto largo o multiples usuarios.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizaciones Q4 o inferiores; con 12 GB o mas se puede usar Q6_K con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio tambien incluye la etiqueta text-generation-inference, aunque TGI requiere pesos en safetensors y no GGUF directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (i1-GGUF) | 9,2 B | No disponible | Apache 2.0 | GGUF | Vision, sin censura, tool calling, 6 idiomas |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (128K con RoPE scaling) | Apache 2.0 | Safetensors, GGUF | Referencia de la familia Qwen; sin modo sin censura ni vision nativa |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community License | Safetensors, GGUF | Contexto largo, sin vision ni abliteration; licencia con restricciones |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | Sin vision ni tool calling nativo en esa version |

La comparativa se limita a parametros, contexto y licencia porque no hay datos de benchmarks publicados para el modelo analizado. El modelo destaca frente a las alternativas por combinar vision, tool calling y seis idiomas en un unico paquete de 9,2 B, a costa de un proceso de abliteration que lo aleja del comportamiento alineado de los modelos de referencia.

## Limitaciones y advertencias

- El proceso heretic/abliterated elimina o reduce los rechazos del modelo original, por lo que puede generar contenido danino, ofensivo o ilegal si se le solicita. No es apto para despliegues publicos sin moderacion externa.
- La abliteration puede degradar capacidades generales (razonamiento, coherencia, seguimiento de instrucciones) respecto al modelo base; no hay benchmarks que cuantifiquen esa perdida.
- Riesgo de alucinacion propio de un modelo de 9,2 B: menor fiabilidad factual que modelos de mayor tamano, especialmente en tareas de conocimiento enciclopedico.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificacion empirica.
- Idiomas limitados a seis; no hay soporte declarado para arabe, hindi, portugues ni otros idiomas, lo que restringe su uso en mercados no cubiertos.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura puede infringir normativas locales de moderacion de contenido (por ejemplo, la Ley de Servicios Digitales de la UE o la regulacion de contenidos en menores); la responsabilidad recae en el desplegador.
- El repositorio pesa 81,3 GB por incluir todas las cuantizaciones; conviene descargar solo la variante necesaria.
- La model card del cuantizador no documenta el proceso de cuantizacion mas alla de indicar que es i1 con imatrix; la calidad de las cuantizaciones de baja precision (Q2, Q3) puede ser notablemente inferior a la de Q4 o superiores.
- No hay informacion sobre sesgos especificos del modelo base ni sobre la composicion de su dataset de entrenamiento.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas y ficheros mmproj: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Peticiones de cuantizacion y FAQ: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de referencia: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
