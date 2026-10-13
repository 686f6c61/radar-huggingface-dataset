# nativ-community/LFM2.5-24B-A2B-Preview-8bit

## Resumen

LFM2.5-24B-A2B-Preview-8bit es una conversion a formato MLX, cuantizada a 8 bits, del modelo LFM2.5-24B-A2B-Preview desarrollado originalmente por Liquid AI, Inc. Se trata de un modelo de lenguaje de arquitectura mixture-of-experts (MoE) con aproximadamente 24.000 millones de parametros totales (23.971.587.712 segun los pesos en safetensors) y solo unos 2.000 millones de parametros activos por token, disenado explicitamente para ejecutar agentes de razonamiento de forma rapida y privada en dispositivos locales. La longitud de contexto declarada en la configuracion de origen es de 131.072 tokens.

El modelo es un modelo de razonamiento: genera una cadena de pensamiento antes de emitir la respuesta final, admite llamada a herramientas (tool calling) y esta pensado para tareas de varios pasos dentro de frameworks de agentes. La conversion que nos ocupa la publica la organizacion nativ-community (con copia identica en mlx-community) y esta pensada para su uso con la libreria MLX de Apple y el stack mlx-vlm, lo que la hace relevante para quien quiera desplegar el modelo en hardware Apple Silicon con memoria unificada.

Su relevancia practica esta en la combinacion de tamano total grande con activacion reducida: al activar solo ~2B de parametros se obtiene una velocidad de decodificacion propia de un modelo pequeno, pero con la capacidad representacional de un modelo de 24B en total. El precio a pagar es el espacio en disco y en memoria, que en esta version de 8 bits ronda los 25,5 GB, mas cache y asignaciones temporales en tiempo de ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), tag `lfm2_moe`; modelos LFM2.5 de Liquid AI |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B (OpenRouter indica 2,45B activos) |
| Longitud de contexto | 131.072 tokens (segun configuracion de origen) |
| Tipos de cuantizacion | 8 bits affine weight-only, group size 64 (en esta exportacion MLX); router projections tambien en 8 bits affine, grupo 64; pesos no cuantizados en BF16; sesgos de enrutamiento de expertos en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `license: other`) |
| Formato de pesos | safetensors en formato MLX (repo de 25,5 GB; pesos 25,47 GB en decimal) |

## Arquitectura y entrenamiento

Se trata de un transformer con capas mixture-of-experts, identificado en HuggingFace con el tag de arquitectura `lfm2_moe`. La familia LFM2.5 de Liquid AI abarca desde 230M hasta 24B parametros, y este modelo es el mayor y el ultimo de la familia segun el blog del fabricante. El modelo base del que deriva esta exportacion es `lq-preview/LFM2.5-24B-A2B-Preview`, fijado en la revision `f772950ce6f17d35af5469d00334b61a9c2fc034`. No se dispone, en la informacion proporcionada, del numero de tokens de entrenamiento, de la composicion del dataset ni del detalle de las etapas de alineacion (RLHF, DPO u otras).

La innovacion relevante desde el punto de vista del despliegue es el enrutamiento disperso: con ~24B de parametros totales y ~2B activos por token, el coste de computo por token se aproxima al de un modelo mucho mas pequeno, mientras que la huella en memoria sigue siendo la del modelo completo. La model card del fabricante indica ademas que el modelo razona antes de responder y que soporta llamada a herramientas y tareas multi-paso dentro de frameworks de agentes.

En cuanto a esta exportacion concreta, la conversion se realizo con la CLI de MLX-VLM sobre un Apple M3 Ultra, aplicando cuantizacion affine weight-only de 8 bits con group size 64. Las proyecciones del router tambien se cuantizaron a 8 bits (grupo 64), los pesos no cuantizados permanecen en BF16 y los sesgos de enrutamiento de expertos en FP32. Se verifico con coincidencia estricta de pesos y se comprobaron logits finitos en prefill y decodificacion con cache; las dos pruebas de generacion greedy (capital de Francia y una operacion aritmetica) devolvieron los resultados correctos y alcanzaron EOS, pero el propio autor advierte que son pruebas de humo y no una evaluacion de calidad ni un benchmark de contexto largo.

## Capacidades

- Generacion de texto conversacional, con pipeline declarado `text-generation`.
- Razonamiento explicito: el modelo genera una cadena de pensamiento antes de la respuesta final, por lo que la model card recomienda reservar suficientes tokens de salida.
- Llamada a herramientas (tool calling) y function calling, segun la documentacion de Liquid AI.
- Ejecucion de tareas multi-paso dentro de frameworks de agentes populares.
- Capacidades multilingues en diez idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Contexto largo de hasta 131.072 tokens, adecuado para documentos extensos o historiales de conversacion prolongados.
- Soporte de cuantizacion de 8 bits en MLX, lo que reduce la huella de memoria respecto al modelo original en BF16.
- Orientacion a despliegue local y privado en hardware Apple Silicon mediante MLX y mlx-vlm.

## Casos de uso

- Agentes locales en portatiles o estaciones de trabajo Apple Silicon: el modelo puede orquestar tareas multi-paso y llamar herramientas sin enviar datos a un servicio externo, algo critico en entornos con requisitos de privacidad.
- Asistentes de codigo en el editor: con tool calling nativo puede invocar funciones de lectura y escritura de ficheros, ejecutar comandos de test y razonar sobre el resultado dentro de un bucle de agente.
- Analisis de documentos largos: sus 131.072 tokens de contexto permiten procesar informes, contratos o transcripciones completas en una sola pasada, con razonamiento previo sobre el contenido.
- Atencion al cliente multilingue: cubre diez idiomas de forma nativa, incluyendo espanol, portugues e italiano, por lo que sirve para bases de usuarios europeas y latinoamericanas con un unico modelo.
- Automatizacion de back-office con herramientas: integrado en flujos que consultan bases de datos o APIs internas mediante function calling, el modelo puede encadenar varias llamadas antes de dar una respuesta consolidada.
- Razonamiento sobre datos estructurados y calculo: las pruebas de humo de la conversion verifican respuestas aritmeticas, y el modo de razonamiento previo ayuda en tareas de varios pasos como reconciliacion de cifras o validacion de reglas de negocio.
- Prototipado e investigacion en MLX: al estar publicado en formato MLX con scripts de conversion documentados, es util para experimentar con cuantizacion de 8 bits, group size 64 y evaluacion de modelos MoE en Apple Silicon.
- Despliegue en edge con memoria unificada: en un equipo con 32 GB o mas de memoria unificada se puede mantener el modelo cargado de forma persistente como servicio local para otras aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion unicamente documenta pruebas de humo (respuestas correctas a dos preguntas cortas con generacion greedy y alcance de EOS) y no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad. Tampoco se proporcionan mediciones de latencia o throughput.

## Requisitos de hardware

- Pesos en disco: 25,47 GB (decimal) y un repositorio de 25,5 GB; el runtime necesita ademas cache KV y asignaciones temporales.
- VRAM o memoria unificada estimada para inferencia: aproximadamente 26-30 GB en esta cuantizacion de 8 bits, dependiendo de la longitud de contexto y del tamano de lote.
- Hardware de referencia de la conversion: Apple M3 Ultra, que fue la maquina utilizada para generar esta exportacion.
- Al ser un formato MLX, el destino natural son equipos Apple Silicon con memoria unificada suficiente (M3 Ultra, M2/M3/M4 Max con 32 GB o mas). No cabe en GPUs de consumo con 24 GB de VRAM como una RTX 4090 sin recurrir a otras cuantizaciones mas agresivas; para esas GPU conviene usar los GGUF publicados por terceros (por ejemplo unsloth/LFM2.5-24B-A2B-Preview-GGUF).
- Opciones de despliegue: MLX-VLM (PR #2505, commit `a6c7313bc053e5887616fa850808d21576eddf98`), MLX 0.32.3 y Transformers 5.17.0. Para otros entornos, existen variantes GGUF compatibles con llama.cpp y sus derivados, y el modelo original en BF16 para vLLM o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento medidos para este modelo ni para alternativas, por lo que la comparacion se limita a caracteristicas objetivas de la informacion disponible.

| Modelo | Parametros | Activos | Contexto | Formato / cuantizacion | Licencia |
|---|---|---|---|---|---|
| nativ-community/LFM2.5-24B-A2B-Preview-8bit (esta ficha) | ~24B | ~2B (2,45B segun OpenRouter) | 131.072 tokens | MLX, safetensors, 8 bits affine grupo 64 | LFM Open License v1.0 |
| lq-preview/LFM2.5-24B-A2B-Preview (modelo base) | ~24B | ~2B | 131.072 tokens (configuracion de origen) | safetensors, pesos en BF16 | LFM Open License v1.0 |
| unsloth/LFM2.5-24B-A2B-Preview-GGUF | ~24B | no disponible | no disponible | GGUF, varias cuantizaciones | LFM Open License v1.0 |
| LFM2.5-230M (miembro menor de la familia LFM2.5) | 0,23B | no aplica (no es MoE) | no disponible | no disponible | LFM Open License v1.0 |

Como referencia cualitativa, LFM2.5-24B-A2B tambien esta disponible a traves de proveedores de API (OpenRouter), lo que permite comparar el comportamiento del modelo original sin cuantizar frente a esta conversion local.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La informacion proporcionada no documenta evaluaciones de sesgo ni de seguridad.
- Riesgo de alucinacion: el fabricante recomienda explicitamente combinar el modelo con recuperacion (retrieval) o busqueda web para tareas con alta carga de conocimiento, lo que indica que no debe tratarse como fuente factual autonoma.
- La cuantizacion a 8 bits puede introducir degradacion respecto al modelo original en BF16. No se ha publicado ninguna evaluacion comparativa de calidad entre ambos.
- Limites de contexto: aunque la configuracion declara 131.072 tokens, no se ha publicado ningun benchmark de contexto largo para esta conversion; las pruebas realizadas son generaciones cortas.
- Idioma: los diez idiomas listados estan declarados, pero no se detalla el nivel de competencia por idioma ni el volumen de datos de entrenamiento en cada uno.
- Licencia: se aplica la LFM Open License v1.0 (etiquetada como `other` en HuggingFace). Es una licencia propia de Liquid AI, no una licencia permisiva estandar, por lo que es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- Atribucion: los pesos originales son de Liquid AI, Inc. y la licencia original se incluye y aplica a estos pesos; las modificaciones de conversion y cuantizacion se describen en el fichero NOTICE.
- Requisito de prompt: es obligatorio usar la plantilla de chat incluida; el modelo genera razonamiento antes de la respuesta, de modo que un limite de tokens de salida demasiado bajo puede truncar la respuesta antes de que llegue a la conclusion.
- Naturaleza de la verificacion: el autor indica que solo se hicieron pruebas de humo, no una evaluacion completa de calidad ni de contexto largo.
- Repositorio de comunidad: se trata de una conversion no oficial de un tercero, no de un artefacto publicado por Liquid AI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-8bit
- Copia identica en mlx-community: https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-8bit
- Modelo base: https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Blog en HuggingFace de Liquid AI: https://huggingface.co/blog/LiquidAI/lfm25-24b-a2b
- Pagina de modelos de Liquid AI: https://www.liquid.ai/models
- Repositorio de MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Pull request de soporte LFM2.5 en MLX-VLM: https://github.com/Blaizzy/mlx-vlm/pull/2505
- Ficha en OpenRouter: https://openrouter.ai/liquid/lfm-2.5-24b-a2b
- GGUF de terceros (unsloth): https://huggingface.co/unsloth/LFM2.5-24B-A2B-Preview-GGUF
