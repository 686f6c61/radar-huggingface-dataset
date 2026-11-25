# P363/EuroLLM-1.7B-Slovak-English-Translator-GGUF

## Resumen

EuroLLM-1.7B-Slovak-English-Translator-GGUF es un ajuste fino (fine-tuning) del modelo europeo utter-project/EuroLLM-1.7B-Instruct, publicado por el usuario P363 en Hugging Face. Se trata de un traductor bidireccional especializado entre eslovaco (sk) y ingles (en), empaquetado en formato GGUF con cuantizacion Q6_K, lo que reduce el peso a aproximadamente 1,36 GB. El modelo base cuenta con 1.656.850.432 parametros reales, segun los pesos en safetensors del repositorio.

El problema que resuelve es concreto: elimina las formulas de cortesia y los textos de asistencia tipicos de los LLM conversacionales ("Claro, aqui tienes la traduccion...") y devuelve directamente el texto traducido. Esto lo hace util para traduccion rapida de correos, mensajes y documentos en entornos sin conexion, especialmente en telefonos moviles y portatiles sin GPU dedicada. Su licencia Apache 2.0 y su tamano compacto lo situan como una alternativa ligera a servicios de traduccion en la nube para el par linguistico eslovaco-ingles.

La relevancia actual radica en su enfoque de despliegue en el borde (edge): el autor lo orienta explicitamente a aplicaciones moviles como PocketPal AI, ChatterUI o Layla, y a ejecucion local con llama.cpp u Ollama. No es un modelo de proposito general, sino una herramienta de traduccion de un solo par linguistico, optimizada para baja latencia y funcionamiento offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de EuroLLM-1.7B-Instruct); ajuste fino mediante LoRA |
| Parametros totales | 1.656.850.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card recomienda dividir textos largos por parrafos) |
| Tipos de cuantizacion | Q6_K (unico archivo publicado, ~1,36 GB) |
| Idiomas soportados | eslovaco (sk), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo EuroLLM-1.7B-Instruct.Q6_K.gguf); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de EuroLLM-1.7B-Instruct, un transformer decoder-only desarrollado en el marco del proyecto europeo UTTER, orientado a traduccion multilingue dentro de la UE. Sobre esa base se aplico un ajuste fino con LoRA de rango r=32 y lora_alpha=64, utilizando la tecnica train_on_responses_only de Unsloth, de modo que la funcion de perdida se calculo exclusivamente sobre el texto traducido del asistente. Esta decision de diseno es la que produce el comportamiento de "maquina de traduccion directa": el modelo no genera preambulos ni explicaciones.

El conjunto de entrenamiento consta de 64.450 pares de traduccion bidireccional derivados del corpus paralelo Helsinki-NLP/opus-100 (par en-sk), con 32.225 ejemplos eslovaco-ingles y 32.225 ingles-eslovaco. El autor indica que aplico un filtro estricto para eliminar caracteres extranos y subtitulos desalineados, y que anadio frases conversacionales e idiomaticas de uso practico. No se documentan fases de RLHF ni DPO; el ajuste es puramente supervisado sobre pares paralelos.

## Capacidades

- Traduccion bidireccional eslovaco-ingles e ingles-eslovaco a nivel de frase y parrafo corto.
- Salida directa del texto traducido sin frases de cortesia ni texto auxiliar.
- Comprension de instrucciones explicitas del tipo "Prelož do angličtiny: ..." o "Translate into Slovak: ...", aunque el autor indica que el modo mas rapido es la insercion directa del texto sin comando.
- Ejecucion offline en dispositivos moviles y en CPU, sin necesidad de GPU.
- Compatibilidad con plantilla de chat ChatML (<|im_start|> / <|im_end|>).
- Sin soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues limitadas al par sk-en; no se documenta cobertura de otros idiomas.

## Casos de uso

- Traduccion offline en movilidad: la aplicacion movil PocketPal AI o ChatterUI carga el GGUF Q6_K de ~1,36 GB y traduce conversaciones y carteles sin conexion ni roaming de datos, algo util para viajeros en Eslovaquia o para hablantes de eslovaco en el extranjero.
- Traduccion rapida de correo electronico: al no generar preambulos, el texto traducido se puede copiar directamente en el cliente de correo, lo que reduce el tiempo de edicion posterior en flujos de trabajo diarios.
- Atencion al cliente bilingue: un servicio de mensajeria puede integrar el modelo via llama-server para traducir mensajes entrantes de clientes eslovacos al ingles antes de pasarlos a un agente o a otro sistema, con latencia baja en CPU.
- Subtitulado y localizacion ligera: el modelo traduce lineas de dialogo o parrafos cortos de guiones y documentos, adecuado para equipos pequenos que necesitan una primera version en ingles de contenido eslovaco antes de la revision humana.
- Despliegue en portatiles antiguos sin GPU: con llama.cpp y los parametros recomendados (temperatura 0,10-0,20, top-p 0,90, repeat penalty 1,05-1,08), el autor reporta mas de 20-25 tokens por segundo en CPU, suficiente para traduccion interactiva.
- Prototipado de pipelines de traduccion en investigacion: al ser Apache 2.0 y de pequeno tamano, sirve como linea base reproducible para experimentos de traduccion automatica neuronal con presupuesto de computo minimo.
- Traduccion de documentacion tecnica por parrafos: el autor recomienda dividir textos largos en fragmentos, de modo que el modelo puede procesar manuales o articulos seccion por seccion en un servidor local llama-server.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, COMET, MMLU ni similares; solo menciona cualitativamente un rendimiento de "mas de 20-25 tokens por segundo" en CPU para el archivo Q6_K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con la cuantizacion Q6_K, incluyendo overhead de contexto; no se publican cifras oficiales.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, GTX 1660, etc.); tambien funciona en GPU de datacenter (A100, H100) aunque el modelo esta sobredimensionado para ese hardware.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada.
- Despliegue: llama.cpp (llama-cli, llama-server), Ollama (ollama run hf.co/P363/EuroLLM-1.7B-Slovak-English-Translator-GGUF:Q6_K), aplicaciones moviles PocketPal AI, ChatterUI y Layla. No se documenta soporte especifico para vLLM o TGI.
- Latencia y throughput: el autor reporta mas de 20-25 tokens por segundo en CPU de portatiles convencionales; no hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| P363/EuroLLM-1.7B-Slovak-English-Translator-GGUF | 1,66 B | no disponible | sk, en | Apache 2.0 | GGUF Q6_K | Traduccion directa sin preambulos; orientado a movil y offline |
| utter-project/EuroLLM-1.7B-Instruct (modelo base) | 1,66 B | no disponible | multilingue UE | Apache 2.0 | safetensors | Proposito general; puede generar texto auxiliar en traduccion |
| Helsinki-NLP/opus-mt-en-sk / opus-mt-sk-en | no disponible | no disponible | sk, en | no disponible en la informacion | no disponible | Modelos NMT clasicos del proyecto OPUS, no LLM; sin datos comparativos de rendimiento en esta ficha |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de traduccion con las alternativas; la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo estrechamente especializado en traduccion sk-en; no esta pensado para programacion, matematicas complejas ni conocimiento enciclopedico.
- Rendimiento limitado a frases y parrafos cortos; para textos largos el autor recomienda dividir por parrafos, lo que puede degradar la coherencia entre secciones.
- Riesgo de alucinacion y de alteracion del orden de palabras si se usa temperatura alta; el autor recomienda valores de 0,10-0,20 y repeat penalty de 1,05-1,08.
- Sesgos no documentados: no se publica analisis de sesgos de genero, registro ni dominio; el entrenamiento se basa en opus-100, un corpus de subtitulos y textos web con posibles sesgos de dominio.
- Cobertura limitada a eslovaco e ingles; no se garantiza calidad con variantes dialectales del eslovaco ni con jerga tecnica especializada.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria.
- Al ser un ajuste fino sobre un modelo instruct, puede conservar comportamientos residuales del modelo base ante entradas ambiguas o fuera de dominio.
- El unico archivo publicado es Q6_K; no hay cuantizaciones mas agresivas (Q4, Q5) para dispositivos con menos memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/P363/EuroLLM-1.7B-Slovak-English-Translator-GGUF
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Helsinki-NLP/opus-100
- Unsloth (herramienta de ajuste fino): https://github.com/unslothai/unsloth
- Proyecto EuroLLM / UTTER: no disponible en la informacion proporcionada
- Paper de EuroLLM: no disponible en la informacion proporcionada
