# furiosa-ai/EXAONE-4.5-33B-FP8

## Resumen

EXAONE-4.5-33B-FP8 es la build cuantizada en FP8 del modelo denso vision-language EXAONE 4.5 de 33.000 millones de parametros desarrollado por LG AI Research. Este repositorio concreto, publicado por FuriosaAI, empaqueta los pesos originales junto con un Furiosa Executable Bundle (FXB) para ejecutar el modelo sobre aceleradores FuriosaAI RNGD mediante la libreria Furiosa-LLM. El modelo combina un codificador visual dedicado con la arquitectura de lenguaje EXAONE 4 para procesar entradas multimodales de imagen y texto, y genera respuestas en texto.

La relevancia de esta ficha esta en dos frentes. Por un lado, EXAONE 4.5 incorpora razonamiento hibrido activado por defecto (desactivable por peticion) y soporte nativo de tool calling, lo que lo situa en la categoria de modelos multimodales con capacidades agenticas. Por otro, la publicacion de FuriosaAI demuestra la portabilidad del modelo a hardware no NVIDIA, un aspecto cada vez mas relevante para equipos que buscan alternativas de inferencia fuera del ecosistema CUDA.

El modelo declara soporte para seis idiomas (ingles, coreano, espanol, aleman, japones y vietnamita) y se distribuye bajo la licencia propietaria EXAONE AI Model License, lo que condiciona su uso comercial. El repositorio ocupa 69 GB y acumula 625 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EXAONE 4.5 densa vision-language (`Exaone4_5_ForConditionalGeneration`); transformer con codificador visual dedicado |
| Parametros totales | 34.350.097.664 (~34,35 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 estatico per-channel en pesos lineales seleccionados y FP8 dinamico per-token en activaciones; KV cache en 16 bits |
| Idiomas soportados | en, ko, es, de, ja, vi |
| Licencia | EXAONE AI Model License (licencia `other`, nombre `exaone`) |
| Formato de pesos | safetensors; libreria `furiosa-llm` con bundle FXB para RNGD |

## Arquitectura y entrenamiento

EXAONE 4.5 es un transformer denso de tipo vision-language que integra un codificador visual especifico con la arquitectura de lenguaje EXAONE 4. La clase de implementacion es `Exaone4_5_ForConditionalGeneration`, con entrada imagen + texto y salida exclusivamente de texto. El modelo soporta razonamiento hibrido: el modo thinking esta activado por defecto y puede desactivarse por peticion mediante el parametro `enable_thinking: false`. Tambien incorpora tool calling nativo.

En cuanto a la cuantizacion, la build FP8 upstream aplica cuantizacion estatica per-channel a un subconjunto de pesos lineales y cuantizacion dinamica per-token a las activaciones en tiempo de ejecucion, sin calibracion offline de activaciones. La configuracion excluye de la cuantizacion FP8 el codificador visual, las proyecciones de atencion, el LM head y las proyecciones de atencion del modulo MTP (multi-token prediction). La KV cache se mantiene en 16 bits. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: modo thinking hibrido activado por defecto, con cadena de pensamiento separable de la respuesta final mediante el parser `qwen3`.
- Vision-language: acepta mensajes multimodales estilo OpenAI con partes de contenido `image_url` (URL remota, data URL en base64 o ruta local `file://` con el flag correspondiente).
- Tool calling / function calling: soporte nativo mediante el parser `hermes` y el flag `--enable-auto-tool-choice`.
- Razonamiento multi-paso y uso como agente: la combinacion de thinking mode y tool calling permite flujos agenticos encadenados.
- Multilingue: seis idiomas declarados (ingles, coreano, espanol, aleman, japones y vietnamita).
- API compatible con OpenAI a traves de Furiosa-LLM, incluyendo el campo `reasoning` en respuestas no streaming y en deltas de streaming.
- Capacidades especiales adicionales (audio, vision avanzada mas alla de image-text-to-text): no disponible.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede recibir capturas de pantalla, fotos de productos o documentos escaneados junto al texto del usuario y responder en el mismo turno, aprovechando el codificador visual y el soporte de conversaciones multi-turno.
- Automatizacion de soporte tecnico con imagenes: un usuario envia una foto de un error en pantalla y el modelo razona sobre el contenido visual y propone pasos de resolucion, con la cadena de pensamiento separada para auditoria.
- Agentes con herramientas en produccion: gracias al tool calling nativo y al parser `hermes`, el modelo puede invocar APIs externas (consultas a bases de datos, busquedas, calculos) dentro de flujos multi-paso orquestados por el servidor OpenAI-compatible.
- Procesamiento de documentos en espanol y otros idiomas europeos: extraccion y resumen de informacion a partir de imagenes de documentos en es, de o en, con salida de texto estructurada.
- Asistentes de analisis de imagenes medicas o tecnicas no criticas: descripcion y clasificacion preliminar de imagenes con razonamiento explicito, util en triaje o preprocesado, nunca como sustituto de validacion profesional.
- Despliegue sobre hardware no NVIDIA: el bundle FXB permite servir el modelo en FuriosaAI RNGD con paralelismo tensorial de 32 PEs en cuatro tarjetas, lo que habilita entornos con requisitos de suministro o coste energetico distintos del ecosistema CUDA.
- Evaluacion comparativa de razonamiento: el modo thinking desactivable permite ejecutar el mismo modelo en modo rapido (sin CoT) o en modo razonamiento para comparar calidad y latencia en pipelines de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 34,35 GB solo para pesos, mas overhead de KV cache en 16 bits y activaciones; el repositorio completo ocupa 69 GB.
- GPU recomendadas (segun el ecosistema upstream): no disponible en la informacion proporcionada para vLLM, SGLang o Transformers; la model card solo detalla el despliegue en FuriosaAI RNGD.
- Hardware de referencia de este repositorio: FuriosaAI RNGD con paralelismo tensorial de 32 PEs, equivalente a cuatro tarjetas RNGD (8 PEs por tarjeta).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por volumen de pesos en FP8, el modelo no cabe en tarjetas consumer de 24 GB sin cuantizaciones adicionales no documentadas.
- Opciones de despliegue: Furiosa-LLM (soporte oficial de este repositorio); el modelo upstream tambien funciona con vLLM, SGLang y Transformers segun la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Hardware de referencia |
|---|---|---|---|---|---|
| EXAONE-4.5-33B-FP8 (este) | ~34,35 mil millones (denso) | no disponible | imagen + texto a texto | EXAONE AI Model License | FuriosaAI RNGD (4 tarjetas) |
| LGAI-EXAONE/EXAONE-4.5-33B-FP8 (upstream) | ~34,35 mil millones (denso) | no disponible | imagen + texto a texto | EXAONE AI Model License | vLLM, SGLang, Transformers |
| Alternativas de mismo tamano y categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones de modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia propietaria EXAONE AI Model License: el uso comercial esta sujeto a los terminos del titular (LG AI Research); es imprescindible revisar el texto completo antes de desplegar en produccion.
- Riesgo de alucinacion: como modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento visual o tool calling con argumentos ambiguos.
- Sesgos conocidos: no documentados en la informacion disponible; deben evaluarse empiricamente antes de uso en dominios sensibles.
- Cobertura idiomatica limitada a seis idiomas declarados; el rendimiento fuera de ellos no esta garantizado ni documentado.
- Longitud de contexto no especificada: no es posible planificar cargas con documentos o conversaciones largas sin validacion previa.
- Dependencia de hardware especifico: el bundle FXB de este repositorio esta atado a FuriosaAI RNGD; para otras plataformas debe usarse la build upstream.
- El campo `reasoning` de la API no forma parte de la especificacion OpenAI; su acceso sin contenido de razonamiento lanza `AttributeError`.
- El modo thinking esta activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explicitamente.
- El flag `--allowed-local-media-path` es necesario para rutas `file://`, lo que introduce un riesgo de exposicion de ficheros locales si se configura de forma laxa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/EXAONE-4.5-33B-FP8
- Modelo upstream: https://huggingface.co/LGAI-EXAONE/EXAONE-4.5-33B-FP8
- Licencia: https://huggingface.co/LGAI-EXAONE/EXAONE-4.5-33B-FP8/blob/main/LICENSE
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guia de instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
- Repositorio EXAONE 4.5 (LG AI Research): https://github.com/LG-AI-EXAONE/EXAONE-4.5
