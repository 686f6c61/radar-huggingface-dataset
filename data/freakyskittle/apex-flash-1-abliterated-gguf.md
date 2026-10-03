# freakyskittle/apex-flash-1-abliterated-GGUF

# Apex-flash-1-abliterated GGUF

## Resumen

Apex-flash-1-abliterated GGUF es la version cuantizada en formato GGUF del modelo cantina-security/apex-flash-1-abliterated, un derivado "abliterated" (con el comportamiento de rechazo ampliamente modificado) del modelo apex-flash-1 de Yeta. El repositorio lo publica el usuario freakyskittle y contiene unicamente conversiones de formato y cuantizaciones, no pesos entrenados de nuevo. La arquitectura subyacente es GLM-5.3-Flash (identificador `glm5-next`), con aproximadamente 320.000 millones de parametros totales distribuidos en una mezcla de expertos (MoE) de 288 expertos enrutados de los que se activan 8 por token.

Tecnicamente destaca por combinar atencion lineal KDA (híbrida) con atencion dispersa tipo DeepSeek, y por ofrecer una ventana de contexto de hasta 1 millon de tokens. Ademas, el pipeline declarado es image-text-to-text: el repositorio incluye un proyector de vision (`mmproj`) en F16 que anade capacidades multimodales al modelo de lenguaje.

Su relevancia actual es doble. Por un lado, pone al alcance de equipos con hardware modesto un modelo de ~320B mediante cuantizaciones K-quant que van de 341 GB (Q8_0) a 117 GB (Q2_K), pensadas para inferencia con llama.cpp y offload de expertos a RAM del sistema. Por otro, su naturaleza abliterated y su etiqueta de "security-research" lo orientan explicitamente a investigacion de seguridad autorizada, no a uso general en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5-next`); transformer MoE con atencion lineal KDA hibrida y atencion dispersa DeepSeek |
| Parametros totales | 320.759.404.382 (~320B) |
| Parametros activos | 8 expertos enrutados activos de 288 por token (cifra exacta de parametros activos no disponible) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Q8_0, Q6_K (pendiente), Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, y proyector de vision mmproj F16; sin cuantizaciones IQ (no se uso importance matrix) |
| Idiomas soportados | no disponible |
| Licencia | MIT (Copyright (c) 2026 Z.AI Co., Ltd.) |
| Formato de pesos | GGUF (cada cuantizacion dividida en 8 partes; incluye cabecera MTP y plantilla de chat original) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura GLM-5.3-Flash, un transformer de tipo mezcla de expertos (MoE) con 288 expertos enrutados y 8 activos por token, lo que reduce el coste de computo por token frente a un modelo denso de tamano equivalente. Combina dos mecanismos de atencion: KDA (atencion lineal hibrida) y atencion dispersa tipo DeepSeek, una configuracion orientada a sostener ventanas de contexto muy largas (hasta 1M de tokens) con un coste de memoria mas contenido que la atencion densa completa. Incorpora ademas una cabecera MTP (multi-token prediction) conservada en los ficheros GGUF.

Sobre el entrenamiento no se ofrece informacion en el material disponible: no consta el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo unico documentado es el proceso de modificacion del comportamiento de rechazo (abliteration) realizado sobre apex-flash-1 para dar lugar al checkpoint cantina-security/apex-flash-1-abliterated. Este repositorio, por su parte, no entrena nada: convierte los pesos BF16 a GGUF con `convert_hf_to_gguf.py --remote`, incrusta la plantilla de chat original con `gguf_new_metadata.py` y genera las cuantizaciones inferiores con `llama-quantize --allow-requantize` a partir del Q8_0. El autor advierte de que no se ha publicado ninguna evaluacion de calidad ni benchmark, solo pruebas funcionales (smoke tests).

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat en formato GLM (`[gMASK]<sop><|system|>...<|user|>...<|assistant|><think>`).
- Razonamiento con modo "thinking": la plantilla abre siempre un bloque `<think>`; el esfuerzo de razonamiento es configurable por peticion (`reasoning_effort`: `low`, `high`; por defecto `Max`).
- Generacion de codigo: verificado en las pruebas del autor con la escritura y ejecucion de una funcion `is_prime(n: int) -> bool` correcta.
- Capacidades de vision gracias al proyector `mmproj` en F16 (pipeline image-text-to-text), que permite describir imagenes.
- Contexto largo de hasta 1M de tokens, adecuado para documentos extensos o conversaciones muy largas.
- Inferencia eficiente por MoE: solo 8 de los 288 expertos se activan por token.
- Comportamiento de rechazo ampliamente modificado (abliterated), no limitado a tareas de seguridad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion de seguridad autorizada: el modelo esta pensado por el autor para entornos propios o con permiso explicito de pruebas; su comportamiento abliterated permite estudiar respuestas del modelo ante prompts adversarios y evaluar superficies de riesgo. Es adecuado precisamente por ese sesgo de rechazo reducido, siempre dentro de un marco legal.
- Red teaming y evaluacion de guardarrailes: se puede usar como generador de prompts o de respuestas limite para probar clasificadores y filtros de contenido en un pipeline de moderacion.
- Analisis de documentos muy largos: gracias a la ventana de 1M tokens, permite procesar informes, expedientes o bases de codigo completas en una sola pasada sin troceado agresivo.
- Generacion de codigo en lotes: con el modo thinking por defecto y ejemplos verificados de generacion de funciones, encaja en tareas de sintesis de codigo, refactorizacion o generacion de tests sobre repositorios grandes.
- Asistencia tecnica con contexto largo: puede mantener conversaciones multi-turno que referencien manuales o historicos extensos sin perder informacion previa.
- Analisis de imagenes tecnicas: con el proyector `mmproj`, permite describir capturas de interfaz, diagramas o imagenes de logs para tareas de documentacion o soporte.
- Experimentacion en investigacion de arquitecturas MoE: al ser un MoE de 288 expertos con 8 activos y atencion hibrida, sirve para estudiar el comportamiento de estrategias de offload de expertos a RAM en llama.cpp.
- Prototipado local de asistentes sin censura en entornos controlados: util para comparar el efecto de la abliteration frente al modelo original en tareas de investigacion linguistica o de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que ni esta conversion ni el checkpoint abliterated han sido evaluados con benchmarks; unicamente se han realizado pruebas funcionales (smoke tests) de carga en `llama-server`, renderizado de la plantilla de chat, generacion de codigo ejecutable, parada limpia con token de fin de generacion y descripcion de una imagen con el proyector de vision. Estas pruebas no constituyen una evaluacion de calidad.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (derivada del tamano de fichero publicado, no de medicion oficial):

| Cuantizacion | Tamano | BPW | Memoria aproximada necesaria |
|---|---|---|---|
| Q8_0 | 341 GB | 8,51 | ~341 GB o mas |
| Q5_K_M | 227 GB | 5,67 | ~227 GB o mas |
| Q4_K_M | 193 GB | 4,82 | ~193 GB o mas (punto de partida recomendado) |
| Q3_K_M | 153 GB | 3,82 | ~153 GB o mas |
| Q2_K | 117 GB | 2,93 | ~117 GB o mas (perdida de calidad apreciable) |
| mmproj (F16) | 1,13 GB | 16 | ~1,13 GB adicionales |

- GPU recomendadas: no especificadas por el autor. Por tamano, ninguna cuantizacion cabe en una GPU de consumo (por ejemplo, 24 GB); se requiere un nodo multi-GPU (clase A100/H100 de 80 GB) o, alternativamente, inferencia en CPU con suficiente RAM.
- Cabe en GPU consumer: no, en ninguna de las cuantizaciones publicadas, dado el tamano minimo de 117 GB.
- Opciones de despliegue: llama.cpp (via `llama-server`), siempre que se use una compilacion con soporte `glm5-next` (ggml-org/llama.cpp#27773 o posterior). No se confirma soporte en vLLM, Ollama, TGI u otros motores en la informacion disponible.
- Offload de expertos: con VRAM limitada, el autor recomienda mantener los expertos en RAM del sistema con `--n-cpu-moe N` o `-ot "exps=CPU"`. Para inferencia en CPU con poca RAM y ejecucion desde mmap, aconseja anadir `--no-repack`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No hay datos comparativos verificables en la informacion disponible. Los resultados de busqueda web mencionan otros repositorios GGUF de la misma familia temporal (por ejemplo, APEX-I-MiniPlus-V2.1-Abliterated-GGUF, de ~35B, u orcarouter/GLM-5.3-Flash-Uncensored-GGUF), pero no se aportan especificaciones que permitan una comparacion rigurosa. Como referencia de linaje, se puede situar el modelo dentro de la siguiente cadena:

| Modelo | Relacion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| cantina-security/apex-flash-1-abliterated | Modelo base directo de esta conversion | no disponible | no disponible | MIT (segun este repositorio) |
| cantina-security/apex-flash-1 | Modelo original antes de abliteration | no disponible | no disponible | no disponible |
| GLM-5.3-Flash (Z.AI) | Arquitectura base | ~320B (segun este repositorio) | 1M (segun este repositorio) | no disponible |

Datos de rendimiento comparado (MMLU, HumanEval, GSM8K u otros): no disponibles.

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo se ha modificado de forma amplia, no solo para tareas de seguridad. Esto implica mayor probabilidad de generar contenido que otros modelos rechazarian, con los riesgos legales y reputacionales asociados.
- Uso previsto restringido por el autor a investigacion de seguridad autorizada, en entornos propios o con permiso explicito de pruebas.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de fidelidad, por lo que se desconoce el grado de alucinacion en tareas facticas.
- Sin benchmarks: no existen datos publicados de rendimiento, calidad ni robustez; el autor solo reporta smoke tests funcionales.
- Idiomas soportados: no disponibles, por lo que no se puede garantizar un comportamiento multilingue fiable.
- Contexto: aunque la arquitectura declara 1M de tokens, el ejemplo del autor usa `-c 32768`; el contexto efectivo dependera de la memoria disponible para la cache KV, que en un modelo de este tamano es muy exigente.
- Cuantizacion: el autor advierte de perdida de calidad notable en Q2_K y de que no se han generado cuantizaciones IQ (no se uso importance matrix).
- Requisitos de hardware elevados: incluso la cuantizacion mas pequena ocupa 117 GB, lo que descarta su uso en equipos de consumo sin offload intensivo a RAM o almacenamiento.
- Dependencia de version: requiere una compilacion reciente de llama.cpp con soporte `glm5-next`; versiones anteriores no cargaran el modelo o no respetaran la plantilla de chat.
- Licencia MIT: permite uso comercial segun los terminos de dicha licencia, aunque el autor restringe el uso previsto a investigacion de seguridad. Conviene revisar la licencia del modelo base y de la arquitectura GLM-5.3-Flash por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y Q6_K aun pendiente de publicacion: senales de baja validacion por la comunidad.
- Fechas de creacion y actualizacion del repositorio (2026) posteriores a la fecha habitual de referencia; conviene verificar la vigencia de los enlaces.

## Enlaces

- Repositorio GGUF: https://huggingface.co/freakyskittle/apex-flash-1-abliterated-GGUF
- Modelo base: https://huggingface.co/cantina-security/apex-flash-1-abliterated
- Modelo original: https://huggingface.co/cantina-security/apex-flash-1
- Licencia (copia): https://huggingface.co/cantina-security/apex-flash-1-abliterated/blob/main/LICENSE
- Pull request de soporte `glm5-next` en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27773
- Cantina Security (apex): https://www.cantina.security/apex
- Yeta (apex-flash-1): https://yeta.ai/
- Z.AI (arquitectura GLM-5.3-Flash): https://huggingface.co/zai-org
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
