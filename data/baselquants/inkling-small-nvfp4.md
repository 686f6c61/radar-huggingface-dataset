# baselquants/Inkling-Small-NVFP4

## Resumen

Inkling-Small-NVFP4 es una cuantizacion en NVFP4 del modelo multimodal Inkling-Small, desarrollado por Thinking Machines. El repositorio analizado (baselquants/Inkling-Small-NVFP4) es una publicacion de la comunidad que redistribuye los pesos cuantizados del modelo base thinkingmachines/Inkling-Small. Se trata de un transformer autoregresivo multimodal nativo que acepta texto, imagen y audio como entrada y genera texto, disenado para desarrollo de aplicaciones con agentes, asistentes de codigo, chatbots y sistemas RAG.

Tecnicamente, el modelo base es un transformer decoder-only de 42 capas con backbone de Mixture-of-Experts disperso: cada token se enruta a 6 de 256 expertos mas 2 expertos compartidos activos siempre. La atencion combina capas locales y globales. La model card del modelo base declara 276B parametros totales y 12B activos, aunque el recuento real de los pesos safetensors de este repositorio cuantizado asciende a 156.032.140.138 parametros, una discrepancia que conviene verificar antes de planificar el despliegue.

Su relevancia radica en que permite servir un modelo de gran tamano con coste de computo de inferencia comparable al de un modelo de ~12B de parametros activos, gracias al enrutado MoE, y con un peso en memoria reducido por la cuantizacion a 4 bits. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo con backbone Mixture-of-Experts (MoE) disperso y atencion hibrida local/global; multimodal nativo |
| Parametros totales | 156.032.140.138 (segun los pesos safetensors de este repositorio). La model card del modelo base declara 276B totales |
| Parametros activos | 12B (segun la model card del modelo base; no verificado en el repositorio cuantizado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (etiqueta de HuggingFace: 8-bit). El repositorio oficial del modelo base ofrece ademas BF16 |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 170,8 GB |
| Tipo de modelo | inkling_mm_model (pipeline image-text-to-text; tambien audio-text-to-text) |
| Modalidades de entrada | Texto (UTF-8), imagen (recomendado entre 40 px y 4096 px por dimension), audio (WAV, 16 kHz, idealmente menos de 2 minutos) |
| Modalidades de salida | Texto (UTF-8) |
| Numero de capas | 42 |
| Enrutado MoE | 6 de 256 expertos por token, mas 2 expertos compartidos |
| Modelo base | thinkingmachines/Inkling-Small |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 42 capas con una red feed-forward de tipo Mixture-of-Experts disperso. Cada token se enruta a 6 de 256 expertos, a los que se suman 2 expertos compartidos que permanecen activos en todos los tokens. La atencion es hibrida, combinando capas de atencion local con capas de atencion global, lo que suele emplearse para reducir el coste del contexto largo manteniendo acceso a informacion distante. El modelo es multimodal nativo: las imagenes se codifican mediante un codificador jerarquico de parches y el audio mediante codificacion en tokens discretos; ambas modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder junto al texto.

En cuanto al entrenamiento, la model card indica que los datos cubren una amplia variedad de tipos de contenido, incluyendo texto, imagenes, audio y video, procedentes de fuentes publicas, de terceros y de generacion o aumento sintetico. El proceso de curacion incluye limpieza, deduplicacion y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Este repositorio concreto no es un modelo entrenado desde cero, sino una cuantizacion a NVFP4 del modelo base. La informacion proporcionada no detalla el metodo de calibracion, el tamano de bloque de escalas ni si se cuantizaron todas las capas o solo las lineales del backbone.

## Capacidades

- Generacion de texto conversacional e instrucciones de proposito general.
- Comprension de imagenes: la entrada image-text-to-text es la tarea principal declarada en el pipeline.
- Comprension de audio: entrada en WAV a 16 kHz, pensada para fragmentos de menos de dos minutos.
- Razonamiento multimodal conjunto: texto, imagen y audio se proyectan a un espacio comun y se procesan de forma conjunta, no en modulos separados.
- Soporte declarado para sistemas agénticos y de uso de herramientas (agentic and tool-use systems), asistentes de codigo y sistemas de generacion aumentada por recuperacion (RAG).
- Capacidades multilingues generales, con ingles como idioma principal.
- Soporte de multiples lenguajes de programacion segun la model card.
- Capacidad de ajuste fino e integracion en productos de terceros por parte de desarrolladores posteriores, al publicarse con pesos abiertos.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede procesar simultaneamente el texto de la consulta y capturas de pantalla o imagenes enviadas por el usuario (por ejemplo, un error en pantalla o una factura), manteniendo el contexto conversacional en un unico modelo en lugar de encadenar un OCR y un LLM de texto.
- Asistentes de codigo en produccion: con soporte declarado para tool calling y multitud de lenguajes de programacion, puede integrarse en flujos de revision de pull requests o generacion de tests dentro de pipelines de CI/CD.
- Agentes multi-paso con herramientas: el enrutado MoE con 12B de parametros activos reduce el coste por token frente a un modelo denso de tamano equivalente, lo que abarata las cadenas largas de llamadas a herramientas.
- Analisis de imagenes tecnicas: con soporte de imagenes de 40 px a 4096 px por dimension, es apto para inspeccion de diagramas, planos, capturas de dashboards o documentacion escaneada.
- Transcripcion y analisis de audio corto: llamadas de soporte, notas de voz o reuniones breves (menos de dos minutos por fragmento) pueden procesarse directamente en formato WAV a 16 kHz, con la salida de texto integrada en el mismo flujo.
- Sistemas RAG multimodales: indexacion y respuesta sobre corpus que mezclan texto e imagenes, aprovechando que ambas modalidades comparten espacio oculto.
- Despliegue autoalojado con pesos abiertos: licencia Apache 2.0 y pesos en safetensors permiten ajuste fino e integracion en infraestructura propia sin dependencia de API de terceros.
- Prototipado e investigacion en cuantizacion: al ser una publicacion de la comunidad, sirve como referencia practica para evaluar el impacto de NVFP4 en la calidad de un MoE multimodal grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del modelo base incluye una tabla de evaluaciones, pero en la informacion proporcionada aparece truncada: solo se conservan los encabezados de columna, que listan comparadores de pesos abiertos y cerrados (Inkling-Small, Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7, DeepSeek V4 Flash) sin ningun valor numerico asociado. No se dispone tampoco de datos de benchmarks especificos de esta cuantizacion NVFP4 (por ejemplo, comparacion BF16 frente a NVFP4 en MMLU, HumanEval o GSM8K).

## Requisitos de hardware

Estimaciones a partir del recuento de parametros safetensors (156.032.140.138) y de la cuantizacion declarada; no proceden de mediciones publicadas en la informacion disponible.

- Peso en memoria de los pesos NVFP4: aproximadamente 88 GB (unos 4,5 bits por parametro contando los pesos de 4 bits mas las escalas FP8 por bloque). En BF16, el mismo recuento exigiria unos 312 GB.
- Si se toma como referencia la cifra de 276B parametros de la model card del modelo base, los pesos en BF16 requeririan unos 552 GB.
- GPU recomendadas: NVFP4 cuenta con soporte nativo de tensor cores en la generacion Blackwell (B200, GB200, B100 y las GeForce RTX 50). Una B200 con 192 GB de memoria podria alojar los pesos de este repositorio; una H200 de 141 GB queda ajustada y una H100 de 80 GB no es suficiente por si sola.
- En generacion Hopper o Ada (H100, A100, RTX 4090) no hay soporte nativo de NVFP4, por lo que habria que descomprimir a BF16 y el requisito de memoria se dispara hasta el rango de los 312 GB o mas, lo que descarta esas tarjetas para servir el modelo tal cual.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB ni en una RTX 5090 de 32 GB por si solas. Serian necesarias varias unidades en paralelo (por ejemplo, cuatro RTX 5090 de 32 GB para alcanzar 128 GB agregados), siempre que el runtime soporte el tensor paralelismo sobre NVFP4.
- Memoria adicional: hay que sumar la cache KV, que depende de la configuracion de atencion hibrida local/global y de la longitud de contexto, ambos datos no disponibles.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Unsloth y transformers cuentan con recetas publicadas para el modelo base. La model card tambien menciona acceso por API a traves del playground Tinker y de proveedores de inferencia de terceros.
- Latencia y throughput: no disponibles. Cabe esperar un coste de computo por token propio de un modelo de 12B de parametros activos, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| baselquants/Inkling-Small-NVFP4 | 156,03B (safetensors) | 12B (model card) | no disponible | apache-2.0 | Pesos abiertos en HuggingFace; 0 descargas |
| thinkingmachines/Inkling-Small (BF16) | 276B declarados | 12B | no disponible | apache-2.0 | Pesos abiertos; referenciado como modelo base |
| thinkingmachines/Inkling-Small-NVFP4 | no disponible | no disponible | no disponible | no disponible | Version oficial en NVFP4 citada en la model card |
| Qwen3.5 397B-A17B | 397B (por nombre) | 17B (por nombre) | no disponible | no disponible | Listado solo como comparador en la tabla de evaluaciones truncada |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | Listado solo como comparador |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | Listado solo como comparador |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | Listado solo como comparador (pesos cerrados segun la tabla) |

No se dispone de datos de rendimiento de ninguno de los comparadores en la informacion proporcionada, por lo que la comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Discrepancia de parametros: los safetensors del repositorio suman 156,03B parametros, mientras que la model card del modelo base declara 276B totales. Conviene verificar que el checkpoint esta completo antes de usarlo en produccion.
- Publicacion de la comunidad: el autor es baselquants, no Thinking Machines. Existiendo una version oficial en NVFP4 (thinkingmachines/Inkling-Small-NVFP4), este repositorio debe tratarse como una cuantizacion no verificada por el desarrollador original.
- Sin adopcion registrada: 0 descargas y 0 likes en la fecha de consulta, lo que implica ausencia de validacion externa y de informes de calidad tras la cuantizacion.
- Riesgo de degradacion por cuantizacion: una cuantizacion a 4 bits puede afectar de forma desigual a tareas sensibles, como razonamiento, matematicas o recuperacion de conocimiento factual. No se han publicado evaluaciones comparativas BF16 frente a NVFP4.
- Riesgo de alucinacion: es un modelo generativo de proposito general; la model card no documenta tasas de alucinacion ni mecanismos de mitigacion mas alla del filtrado de datos de entrenamiento.
- Idioma: el ingles es el idioma principal; el rendimiento en castellano u otras lenguas no esta cuantificado y debe validarse por caso de uso.
- Limites de entrada multimodal: imagenes por debajo de 40 px o por encima de 4096 px por dimension y audios de mas de dos minutos quedan fuera del rango recomendado en la model card.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide dimensionar cache KV y planificar escenarios de contexto largo.
- Restricciones de uso: la licencia declarada es Apache 2.0, pero el modelo base remite a una politica de uso aceptable de Thinking Machines; conviene revisar ese documento antes de un despliegue comercial.
- Hardware: NVFP4 requiere soporte nativo (Blackwell) para aprovechar la ventaja de memoria; en generaciones anteriores el coste real de memoria se aproxima al de BF16.

## Enlaces

- Repositorio analizado: https://huggingface.co/baselquants/Inkling-Small-NVFP4
- Modelo base en BF16: https://huggingface.co/thinkingmachines/Inkling-Small
- Version oficial NVFP4: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta en SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta en vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta en TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentacion de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace sobre Inkling: https://hf.co/blog/thinkingmachines-inkling

Nota: la busqueda web asociada no devolvio ningun resultado relevante sobre el modelo; los enlaces recuperados correspondian a sitios de fuentes tipograficas, redes sociales y foros sin relacion con este repositorio.
