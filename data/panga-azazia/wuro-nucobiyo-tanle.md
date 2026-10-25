# Panga-Azazia/Wuro-Nucobiyo-Tanle

## Resumen

Wuro-Nucobiyo-Tanle es un modelo de texto a voz (text-to-speech) construido sobre un modelo de lenguaje de tipo Llama, publicado por el usuario Panga-Azazia en HuggingFace. Con 3.300.928.512 parametros (aproximadamente 3,3 mil millones) en pesos safetensors, se presenta como un sistema de sintesis de voz basado en LLM ("llm-based-tts") orientado a lenguas africanas, con enfasis en Mali y su entorno linguistico, ademas de ingles y frances.

El modelo deriva de una cadena de ajuste fino que parte de maya-research/maya1 y pasa por RobotsMali/Wuro y Panga-Azazia/Wuro-Mali-Tanle-v0, segun los metadatos de la ficha. Cubre 18 codigos de idioma, entre ellos bambara (bm), bomu (bmq), dyula (dyu), mossi (mos), fulfulde maasina (ffm), tamasheq (taq), frances (fr) e ingles (en), lo que lo situa en el nicho de la sintesis de voz para lenguas de bajos recursos.

Su relevancia actual es doble: por un lado, la mayoria de los sistemas TTS comerciales no cubren lenguas africanas con calidad aceptable; por otro, la licencia Apache 2.0 permite uso comercial sin las restricciones habituales en modelos de voz. El acceso esta restringido (gated) y no se han publicado resultados de evaluacion en la informacion disponible, por lo que cualquier decision de produccion deberia acompanarse de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Llama (tag `llama`), adaptado a texto a voz ("llm-based-tts"); detalles internos del decodificador de audio no disponibles |
| Parametros totales | 3.300.928.512 (aproximadamente 3,3 B), segun safetensors |
| Parametros activos | No aplica: no se documenta arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors; los tags `unsloth` y `text-generation-inference` sugieren flujos de cuantizacion, pero no hay artefactos GGUF/AWQ/GPTQ publicados en la informacion disponible |
| Idiomas soportados | 18 codigos ISO: bm, bmq, en, thq, spp, sev, taq, mwk, myk, bbo, dyi, dyu, mos, dts, kao, ffm, sep, fr (bmq aparece duplicado en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 26,4 GB |
| Pipeline declarado | text-to-speech |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Modelo base | maya-research/maya1; RobotsMali/Wuro; Panga-Azazia/Wuro-Mali-Tanle-v0 |
| Descargas / likes | 397 descargas, 0 likes |
| Fechas | Creado el 26-09-2026, actualizado el 24-10-2026 |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que se trata de un modelo de la familia Llama (tag `llama`) con 3,3 mil millones de parametros y que su pipeline es texto a voz. La etiqueta `llm-based-tts` sugiere un esquema en el que un LLM genera tokens de audio o unidades discretas que posteriormente se convierten en forma de onda mediante un decodificador o codec, pero no se detalla en la ficha ni la arquitectura del codec, ni la tasa de tokens de audio, ni el vocabulario utilizado.

Respecto al entrenamiento, solo se conoce la cadena de modelos base: maya-research/maya1, RobotsMali/Wuro y Panga-Azazia/Wuro-Mali-Tanle-v0, lo que apunta a un ajuste fino sucesivo sobre un modelo TTS previo, probablemente con datos de Mali y de lenguas vecinas. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO, ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). Tampoco se especifica si el modelo conserva capacidades de generacion de texto del LLM subyacente o si estas se han degradado deliberadamente durante el ajuste.

## Capacidades

- Sintesis de voz a partir de texto en 18 codigos de idioma, con predominio de lenguas de Mali y Africa occidental.
- Cobertura multilingue con mezcla de lenguas locales, frances e ingles, lo que permite escenarios de code-switching en contextos educativos o administrativos.
- Integracion con el ecosistema `transformers` y con `text-generation-inference` (tag `endpoints_compatible`), lo que facilita su despliegue como endpoint HTTP.
- Compatibilidad declarada con flujos de Unsloth (tag `unsloth`), orientados a ajuste fino y cuantizacion eficiente en memoria.
- Capacidad de ajuste fino adicional: al ser un modelo de 3,3 B con licencia Apache 2.0, es viable reentrenarlo o adaptarlo a nuevas voces o lenguas.
- No se documentan capacidades de clonacion de voz, control de emocion, control de prosodia, tool calling ni modo de razonamiento; no disponibles en la informacion proporcionada.

## Casos de uso

- Accesibilidad y lectura en voz alta: el modelo puede narrar textos en bambara, dyula o mossi para usuarios con baja alfabetizacion o discapacidad visual, un nicho que los TTS comerciales apenas cubren.
- Locucion automatica de noticias y boletines: generacion de audio para radios comunitarias y medios digitales malienses a partir de textos escritos, reduciendo el coste de grabacion con locutores.
- Sistemas de atencion telefonica (IVR): respuestas de voz pregrabadas dinamicamente en lenguas locales para servicios de salud, agricultura o administracion, donde el texto cambia con frecuencia.
- Doblaje y subtitulado accesible de material educativo: conversion de guiones de formacion agraria o sanitaria a audio en varias lenguas para su distribucion por radio o altavoces comunitarios.
- Preservacion linguistica: generacion de corpus de audio sintetico para lenguas con pocos hablantes y escasos recursos digitales, util para documentacion y ensenanza.
- Aplicaciones de aprendizaje de idiomas: ejercicios de escucha y repeticion con pronunciacion sintetica en lenguas que carecen de materiales audiovisuales.
- Asistentes de voz para interfaces offline: al ser un modelo de 3,3 B, puede ejecutarse en hardware modesto y servir en entornos con conectividad limitada, siempre que se valide la calidad del audio.
- Prototipado rapido de productos de voz: al estar disponible via `transformers` y TGI, permite montar una demo funcional en pocas horas antes de invertir en un TTS propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No constan metricas objetivas habituales en sintesis de voz, como MOS (Mean Opinion Score), CMOS, WER sobre transcripcion automatica del audio generado, SSIM o tasas de error por lengua. Tampoco hay comparaciones publicadas frente a otros sistemas TTS en las mismas lenguas.

| Benchmark | Resultado |
|---|---|
| MOS / CMOS | No disponible |
| WER del audio sintetizado | No disponible |
| Cobertura por idioma | No disponible |
| Comparacion con TTS comerciales | No disponible |

## Requisitos de hardware

- VRAM estimada en FP16/BF16: unos 6,6 GB solo para pesos, mas overhead de activaciones, cache y decodificador de audio; en la practica, 8-10 GB como minimo. Estimacion propia a partir del numero de parametros, no confirmada por el autor.
- VRAM estimada en INT8: aproximadamente 3,3 GB de pesos, con un total estimado de 5-6 GB.
- VRAM estimada en INT4: aproximadamente 1,7-2 GB de pesos, con un total estimado de 3-4 GB. No hay artefactos cuantizados publicados, por lo que habria que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para servir muchas peticiones concurrentes; L40S o A10G para produccion moderada; RTX 4090/3090 (24 GB) para desarrollo y pruebas de calidad.
- GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores, siempre con cuantizacion o FP16. No confirmado por el autor.
- Despliegue: `transformers` (via oficial declarada), `text-generation-inference` (tag `endpoints_compatible`) y flujos Unsloth para ajuste. vLLM, llama.cpp u Ollama no estan confirmados: requeririan conversion a GGUF o soporte explicito del cabezal de audio, no disponible en la informacion.
- Latencia y throughput: no disponibles. En TTS, la latencia depende criticamente del decodificador de audio, cuyo coste no se documenta.
- Almacenamiento: el repositorio ocupa 26,4 GB, muy por encima de los ~6,6 GB de pesos en FP16, lo que sugiere multiples artefactos (checkpoints, codec, tokenizer) o precisiones redundantes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wuro-Nucobiyo-Tanle | 3,3 B | No disponible | 18 codigos, foco en Mali | Apache 2.0 | Gated en HuggingFace |
| maya-research/maya1 (base) | No disponible | No disponible | No disponible | No disponible | No verificada en esta busqueda |
| RobotsMali/Wuro (base) | No disponible | No disponible | No disponible | No disponible | No verificada en esta busqueda |
| Panga-Azazia/Wuro-Mali-Tanle-v0 (base) | No disponible | No disponible | No disponible | No disponible | No verificada en esta busqueda |

No se dispone de datos verificados de parametros, contexto ni rendimiento de los modelos base ni de alternativas equivalentes en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. Como referencia cualitativa, la mayoria de los TTS multilingues comerciales no cubren lenguas malienses, y los modelos abiertos con cobertura amplia de lenguas africanas suelen ser arquitecturas no basadas en LLM y con licencias mas restrictivas; cualquier comparacion concreta deberia hacerse con las fichas oficiales de cada modelo.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay MOS, WER ni pruebas por idioma, por lo que se desconoce la calidad real en cada una de las 18 lenguas.
- Riesgo de alucinacion acustica: en modelos TTS basados en LLM es frecuente la omision de palabras, la repeticion de silabas, la alteracion de la prosodia o la invencion de contenido en entradas largas o con caracteres fuera del vocabulario.
- Cobertura linguistica desigual: es previsible que el bambara y el frances tengan mas datos que codigos como `thq`, `spp` o `dts`; sin metricas por idioma no puede asumirse calidad homogenea.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en parrafos largos ni en textos con muchos numeros, siglas o nombres propios.
- Idiomas sin normalizacion documentada: no se especifica el tratamiento de numeros, abreviaturas, fechas ni puntuacion, lo que afecta directamente a la inteligibilidad.
- Sesgos: al entrenarse presumiblemente con voces de un numero limitado de hablantes, el modelo puede reproducir un unico registro de voz, sesgos de genero o de variedad dialectal, y carecer de diversidad vocal.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero no cubre derechos de imagen ni de voz de los hablantes originales; la responsabilidad sobre el uso de voces sintetizadas recae en el desplegador.
- Acceso restringido: el caracter gated obliga a aceptar condiciones en HuggingFace, lo que puede anadir friccion en pipelines automatizados y en entornos de CI.
- Sin artefactos cuantizados: no hay GGUF ni variantes INT4/INT8 publicadas, de modo que el despliegue en hardware de consumo exige trabajo adicional de conversion y validacion.
- Ausencia de soporte documentado de vLLM, llama.cpp u Ollama: el cabezal de audio puede no ser compatible con estos runners sin desarrollo adicional.
- Modelo con 0 likes y 397 descargas: no ha pasado por una validacion comunitaria amplia; conviene tratarlo como experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Panga-Azazia/Wuro-Nucobiyo-Tanle
- Modelo base declarado: https://huggingface.co/maya-research/maya1
- Modelo base declarado: https://huggingface.co/RobotsMali/Wuro
- Modelo base declarado: https://huggingface.co/Panga-Azazia/Wuro-Mali-Tanle-v0
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente articulos sobre el pez panga, sin relacion con este modelo. No hay papers, blogs ni demos disponibles en la informacion proporcionada.
