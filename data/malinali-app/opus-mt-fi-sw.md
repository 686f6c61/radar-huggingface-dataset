# malinali-app/opus-mt-fi-sw

## Resumen

El modelo `malinali-app/opus-mt-fi-sw` es un modelo de traduccion automatica neuronal que traduce de finlandes (fi) a suajili (sw). Se trata de un reempaquetado de los pesos del modelo `Helsinki-NLP/opus-mt-fi-sw` del proyecto OPUS-MT de Helsinki-NLP, publicado por el desarrollador malinali-app para su uso en la aplicacion Malinali, orientada a inferencia en dispositivo (on-device).

El modelo emplea la arquitectura Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica, con un total de 76.018.883 parametros (aproximadamente 76 millones). Pertenece a la familia OPUS-MT, una coleccion de modelos de traduccion entrenados sobre corpus paralelos del proyecto OPUS. Su relevancia actual radica en el enfoque de despliegue ligero: malinali-app distribuye los pesos en formato safetensors junto con tokenizadores rapidos convertidos desde SentencePiece a JSON de Hugging Face, optimizados para el runtime Candle (biblioteca de inferencia en Rust).

La aportacion principal de esta publicacion no es el entrenamiento del modelo, sino su reempaquetado para inferencia local en dispositivos con recursos limitados, permitiendo traduccion fi-sw sin conexion a internet. No se especifica en la informacion disponible la longitud de contexto del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | 76.018.883 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | finlandes (fi), suajili (sw) |
| Licencia | no disponible en HuggingFace; segun la model card, seguir la licencia upstream (tipicamente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Marian, una implementacion de transformer encoder-decoder optimizada para traduccion automatica neuronal. El modelo original fue entrenado por el proyecto Helsinki-NLP dentro de la familia OPUS-MT, usando corpus paralelos multilingues recopilados en el proyecto OPUS. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. La model card de malinali-app indica que este repositorio unicamente reempaqueta los pesos originales y convierte los tokenizadores de SentencePiece a formato JSON de tokenizador rapido de Hugging Face para inferencia en dispositivo.

La innovacion tecnica de esta publicacion es el formato de distribucion: pesos en safetensors mas tokenizadores separados para entrada (`tokenizer-enc.json`) y salida (`tokenizer-dec.json`), disenados para el runtime Candle mediante el componente `marian_flutter`. Los ficheros requeridos son `config.json`, `model.safetensors`, `tokenizer-enc.json` y `tokenizer-dec.json`. No se documentan modificaciones en los pesos ni reentrenamiento respecto al modelo base.

## Capacidades

- Traduccion automatica de texto de finlandes a suajili (direccion fi → sw).
- Generacion de texto seq2seq mediante pipeline `translation` y `text2text-generation`.
- Ejecucion en dispositivo (on-device) a traves del runtime Candle, sin requisito de conexion a internet.
- Compatibilidad con la libreria `transformers` de Hugging Face.
- Integracion con la aplicacion Malinali mediante el componente `marian_flutter`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.
- Cobertura limitada a los dos idiomas indicados; no se documenta capacidad multilingue adicional.

## Casos de uso

- Aplicaciones moviles de traduccion sin conexion: el modelo puede integrarse en apps para Android/iOS a traves de Candle y `marian_flutter`, ofreciendo traduccion fi-sw local cuando no hay acceso a red, util para viajeros o entornos con conectividad limitada.
- Atencion al cliente en comunidades finlandesas con poblacion suajiliparlante: permite traducir mensajes entrantes o respuestas de soporte dentro de un flujo predefinido de dos idiomas.
- Traduccion de documentacion tecnica o administrativa fi-sw: adecuado para traducir manuales, formularios o avisos en entornos donde ambos idiomas coexisten.
- Herramientas de asistencia a inmigrantes: traduccion de textos de servicios publicos, sanidad o tramites entre finlandes y suajili.
- Procesamiento por lotes de corpus paralelos: generacion de traducciones fi-sw para construir o ampliar datasets bilingues en tareas de investigacion en traduccion automatica de bajos recursos.
- Preprocesamiento en pipelines de NLP multilingues: uso como etapa de traduccion intermedia para llevar contenido en finlandes a suajili antes de otras tareas de analisis.
- Sistemas de mensajeria con traduccion integrada: dado su tamano reducido (76 M de parametros, repo de 0,3 GB), puede desplegarse embebido en clientes de chat o dispositivos de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 76 M de parametros, los pesos en safetensors ocupan aproximadamente 0,3 GB (el tamano indicado del repositorio), por lo que la inferencia en precision completa (fp32) requiere del orden de 300-600 MB de memoria de GPU sumando pesos y activaciones.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes, asi como en GPUs integradas modestas.
- Puede ejecutarse en CPU para inferencia en dispositivo, dado su reducido tamano y su orientacion on-device.
- Opciones de despliegue: Candle (via `marian_flutter`), libreria `transformers` de Hugging Face; otros runtimes como vLLM, llama.cpp, Ollama o TGI no estan documentados para este repositorio.
- No se dispone de datos de latencia ni throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-fi-sw | 76.018.883 | fi, sw | no disponible | no disponible (upstream tipicamente CC-BY 4.0) | HuggingFace, formato safetensors para Candle |
| Helsinki-NLP/opus-mt-fi-sw (modelo base) | no disponible en la informacion proporcionada | fi, sw | no disponible | tipicamente CC-BY 4.0 (OPUS-MT) | HuggingFace |
| Otros modelos OPUS-MT fi-XX | no disponibles | fi y otros idiomas destino | no disponible | tipicamente CC-BY 4.0 (OPUS-MT) | HuggingFace |

El modelo aqui descrito es un reempaquetado del modelo base `Helsinki-NLP/opus-mt-fi-sw`, por lo que sus pesos y comportamiento de traduccion son equivalentes; la diferencia principal estriba en el formato de distribucion orientado a inferencia on-device con Candle. No se dispone de datos de rendimiento comparativo con otras alternativas.

## Limitaciones y advertencias

- Riesgo de alucinacion y de traducciones inexactas propio de los modelos de traduccion automatica, especialmente en dominios especializados o con terminologia poco frecuente.
- Cobertura restringida unicamente al par de idiomas fi → sw; no soporta otras direcciones ni idiomas adicionales.
- No se dispone de informacion sobre longitud de contexto, lo que limita la estimacion fiable del tamano maximo de texto por segmento.
- Sesgos potenciales heredados del corpus OPUS, que puede sobrerrepresentar ciertos dominios (textos legislativos, religiosos, web) y carecer de otros.
- La licencia no esta declarada explicitamente en el repositorio de Hugging Face; la model card remite a la licencia upstream (tipicamente CC-BY 4.0 de OPUS-MT). Debe verificarse antes de uso comercial, ya que CC-BY 4.0 exige atribucion.
- El autor indica explicitamente que no reclama la propiedad del modelo entrenado; unicamente reempaqueta pesos y tokenizadores.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni validacion externa.
- No se documentan pruebas de calidad, benchmarks ni evaluacion de fidelidad de las traducciones.
- Fisuras en la infraestructura de tokenizacion: se distribuyen tokenizadores separados de entrada y salida, lo que puede complicar su uso directo con runtimes que esperan un unico tokenizador.

## Enlaces

- HuggingFace: https://huggingface.co/malinali-app/opus-mt-fi-sw
- Modelo base en HuggingFace: https://huggingface.co/Helsinki-NLP/opus-mt-fi-sw
- Proyecto Helsinki-NLP / OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
