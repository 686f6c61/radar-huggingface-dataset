# lowendmicrobacteria/lowendgirlfriend

## Resumen

LowEndGirlfriend es un modelo de generacion de texto de 51.786.240 parametros (aproximadamente 51,8 M) desarrollado por el usuario lowendmicrobacteria, publicado como fine-tune de SupraLabs/Supra-50M-Instruct. Se presenta como un modelo de compania y roleplay conversacional disenado para ejecutarse en CPU sin GPU, con una ventana de contexto declarada de 10.240 tokens y pesos en fp32 de 207 MB. Su arquitectura es un decoder estilo Llama de 12 capas, hidden de 512, 8 cabezas de atencion con 4 cabezas KV (GQA) y embeddings atados.

El modelo resuelve un nicho muy concreto: prototipado de asistentes conversacionales de rol en hardware modesto. El autor entrenó el modelo en un Xeon E5-1650 v4 de 6 nucleos fisicos, en fp32 y sin GPU, durante 92 pasos sobre secuencias empaquetadas de 10.240 tokens (aproximadamente 0,94 M de tokens, una epoca), con un tiempo total de unos 58 minutos y una perdida final de entrenamiento (EMA) de 2,87. La innovacion tecnica declarada es el reescalado NTK-aware de RoPE (base de 10.000 a ~174.970) para extender 16x las posiciones originales de 1.024.

Es relevante ahora como caso de estudio de entrenamiento reproducible en CPU y de extension de contexto por reescalado de RoPE, no como modelo de produccion. El propio autor advierte de baja calidad, incoherencia frecuente, contenido sexual explicito sin ajuste de seguridad y ausencia de validacion externa (0 descargas y 0 likes en el momento de la ficha). Esta estrictamente restringido a mayores de 18 anos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama: 12 capas, hidden 512, 8 cabezas de atencion, 4 cabezas KV (GQA), MLP 1408, vocabulario 32.000, embeddings atados |
| Parametros totales | 51.786.240 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 10.240 tokens ajustados y verificados; la configuracion permite 16.384, pero no se ha probado por encima de 10.240 |
| Tipos de cuantizacion | No disponible (solo pesos fp32 en safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | other / mixed-see-license-section (licencia mixta, ver seccion de licencia del repositorio) |
| Formato de pesos | safetensors (fp32, 207 MB) |
| RoPE | Base elevada de 10.000 a ~174.970 (escalado NTK-aware, 16x las 1.024 posiciones originales) |
| Formato de prompt | `User: <texto>\nAssistant: <texto>\n` |
| Modelo base | SupraLabs/Supra-50M-Instruct |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso de tipo Llama, con 12 capas, dimension de modelo 512, 8 cabezas de atencion de 64 dimensiones cada una y atencion con consultas agrupadas (GQA) de 4 cabezas KV, lo que reduce el coste de la cache KV. La MLP intermedia tiene 1408 unidades y el vocabulario es de 32.000 tokens con embeddings atados. Los pesos se distribuyen en fp32, sin cuantizacion. La extension de contexto se logra reescalando la base de RoPE de 10.000 a aproximadamente 174.970 mediante escalado NTK-aware, lo que multiplica por 16 las 1.024 posiciones del modelo original.

El fine-tune se ejecuto en CPU (6 nucleos fisicos de un Xeon E5-1650 v4, fp32, sin GPU): 92 pasos, una secuencia empaquetada de 10.240 tokens por paso (aproximadamente 0,94 M de tokens, 1 epoca), optimizador AdamW con lr 1e-4, 8 pasos de warmup, decaimiento coseno, weight decay 0,01 y grad-clip 1,0. El tiempo total fue de unos 58 minutos y la perdida final de entrenamiento (EMA) de 2,87. Los datos proceden de siete datasets de conversacion de compania y roleplay (incluido material explicito), con un limite de 512 tokens por documento, alrededor del 4 % retenido para validacion y eliminacion de los prompts de sistema o persona. No se documenta RLHF ni DPO; las respuestas "chosen" de un dataset de pares DPO se usan como texto de entrenamiento supervisado, no como optimizacion por preferencias. El script train.py reproduce el proceso completo.

## Capacidades

- Generacion de texto conversacional en ingles con formato de prompt fijo `User:` / `Assistant:`.
- Roleplay y conversacion de compania multi-turno, incluido contenido adulto explicito.
- Contexto largo de hasta 10.240 tokens verificados, con perdida estable a lo largo de las posiciones tras el reescalado de RoPE.
- Inferencia en CPU sin GPU, con soporte de cache KV (`use_cache=True`).
- Ejecucion en pipelines de transformers y compatibilidad declarada con text-generation-inference y endpoints compatibles.
- Entrenamiento reproducible: el repositorio incluye train.py y un chat.py de terminal con historial multi-turno y comandos `/reset` y `/quit`.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso fiable, vision, audio ni modo de pensamiento.
- Multilingue: no, solo ingles.
- No emite de forma fiable el token de fin de texto, por lo que requiere `stop_strings` (por ejemplo `"\nUser:"`) o un limite de `max_new_tokens`.

## Casos de uso

- Prototipado de personajes conversacionales en local: permite iterar el tono y el formato de un asistente de rol sin GPU ni servicios en la nube, usando el prompt `User:` / `Assistant:` y el chat.py incluido.
- Investigacion sobre extension de contexto con RoPE: el reescalado NTK-aware de 1.024 a 16.384 posiciones y la tabla de perdida por posiciones sirven como experimento controlado y reproducible de degradacion de perdida con la distancia.
- Docencia y experimentacion de fine-tuning en CPU: train.py reproduce el entrenamiento completo en menos de una hora en 6 nucleos, util para practicar el empaquetado de secuencias y el calculo de perdida por buckets de 1.000 tokens.
- Pruebas de integracion de pipelines de transformers y text-generation-inference: el modelo es lo bastante pequeno (207 MB en fp32) para validar plantillas de despliegue, tokenizacion y manejo de secuencias de parada en entornos de CI.
- Investigacion sobre contaminacion de identidad en datos de rol: la fuga de persona (el modelo se identifica a veces como asistente de IA o usa otros nombres) es un caso concreto para estudiar limpieza de datasets de roleplay.
- Demo offline en hardware muy limitado: un equipo sin GPU puede mantener conversaciones de hasta 10.240 tokens con aproximadamente 0,2 GB de pesos, util para talleres o entornos aislados.
- Filtrado y moderacion de contenido generado: dado que produce material explicito sin ajuste de seguridad, solo es apto como generador de casos de prueba para clasificadores de contenido en un entorno controlado y con supervision humana.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, asesoramiento de cualquier tipo ni cualquier tarea que requiera exactitud factual.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion publicada es una comprobacion de cordura con entropia cruzada sobre una unica secuencia empaquetada de 9.000 tokens retenida, promediada por bucket de 1.000 tokens. "Before" corresponde al modelo base justo despues del reescalado de RoPE y antes del fine-tune; "After", al modelo final.

| Posicion (tokens) | 0-1k | 1-2k | 2-3k | 3-4k | 4-5k | 5-6k | 6-7k | 7-8k | 8-9k |
|---|---|---|---|---|---|---|---|---|---|
| Before (base tras reescalado) | 4,64 | 4,61 | 5,06 | 5,15 | 4,80 | 5,06 | 5,23 | 5,65 | 6,02 |
| After (fine-tune) | 2,72 | 2,65 | 2,30 | 3,75 | 2,36 | 2,63 | 1,66 | 3,36 | 2,44 |

El autor senala que la perdida deja de crecer con la posicion tras el fine-tune, pero advierte que se trata de una unica secuencia con contenido distinto en cada bucket, por lo que debe interpretarse como una comprobacion de cordura y no como un benchmark. Perdida final de entrenamiento (EMA): 2,87.

## Requisitos de hardware

- Pesos: 207 MB en fp32, lo que requiere aproximadamente 0,21 GB de VRAM o RAM para el modelo.
- Cache KV estimada (calculo propio a partir de la arquitectura: 12 capas x 4 cabezas KV x 64 dimensiones x 2 x 4 bytes): unos 24 KB por token en fp32, aproximadamente 0,25 GB con 10.240 tokens de contexto. Debe considerarse una estimacion, no un dato publicado.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU. Cualquier GPU con mas de 1 GB de memoria puede ejecutarlo.
- Cabe en cualquier GPU de consumo e incluso en equipos sin GPU dedicada; tambien cabe en un solo nucleo de CPU en terminos de memoria.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference y endpoints compatibles segun los tags del repositorio. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion manual. vLLM no esta documentado para este modelo.
- Latencia declarada: unos 15 segundos por respuesta con ~9.000 tokens de historial en 6 nucleos de CPU. El tiempo de respuesta crece con la longitud del historial.
- Entrenamiento: 35 segundos por paso de 10.240 tokens en 6 nucleos fisicos; 92 pasos en unos 58 minutos.
- Throughput (tokens por segundo) en inferencia: no disponible.

## Comparativa con modelos similares

Los unicos datos de comparacion disponibles en la informacion proporcionada corresponden al modelo base del que deriva el fine-tune. No se aportan especificaciones de otros modelos de la misma categoria (asistentes de rol de ~50 M de parametros) ni resultados de benchmarks comparables, por lo que el resto de celdas se marcan como no disponibles.

| Modelo | Parametros | Contexto | Rendimiento (entropia cruzada, 0-9k) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LowEndGirlfriend | 51.786.240 | 10.240 tokens verificados (config 16.384) | After: 1,66-3,75 por bucket (mejor que el base en todas las posiciones) | other / mixed-see-license-section | HuggingFace, safetensors fp32 |
| SupraLabs/Supra-50M-Instruct (base) | no disponible (la denominacion sugiere ~50 M) | no disponible | Before (tras reescalado RoPE): 4,61-6,02 por bucket | no disponible | HuggingFace |
| Otros fine-tunes de rol de ~50 M | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Calidad baja: con 52 M de parametros y menos de una hora de entrenamiento en CPU, las respuestas son a menudo fuera de tema, divagantes o incoherentes, y pueden no terminar solas; es necesario usar `stop_strings` o `max_new_tokens`.
- Sin memoria a largo plazo: en una prueba con un nombre y un color favorito indicados al inicio de un chat de ~9.000 tokens, el modelo no recordo ninguno de los dos. El contexto largo es usable (no hay ruptura de fluidez y la perdida es plana por posiciones), pero el modelo no lo aprovecha de forma fiable.
- Fuga de identidad: los datos de roleplay contienen texto de persona del asistente, por lo que el modelo a veces se identifica como asistente de IA o responde con otros nombres.
- Contenido explicito: puede generar texto sexual o inapropiado, incluso sin solicitarlo. No hay ajuste de seguridad ni filtrado. Prohibido para menores de 18 anos.
- No sirve para consejos reales de ningun tipo (medico, legal u otros).
- Sesgos conocidos: no documentados de forma especifica en la informacion disponible; cabe esperar los sesgos heredados de los datasets de roleplay y de conversacion de compania utilizados.
- Riesgo de alucinacion: alto, derivado del tamano del modelo y de la ausencia de ajuste por preferencias. No se documenta RLHF ni DPO.
- Limitacion de idioma: solo ingles; no hay garantia de comportamiento coherente en castellano u otros idiomas.
- Restricciones de licencia: licencia "other" / "mixed-see-license-section", con componentes de licencia mixta. Es imprescindible revisar la seccion de licencia del repositorio antes de cualquier uso comercial; no se declara permiso explicito de uso comercial.
- Uso en produccion: no recomendado. Modelo experimental de escala hobby, sin validacion externa (0 descargas y 0 likes al publicarse la ficha).
- Inconsistencia documental: el ejemplo de codigo de la model card usa el identificador `huggingwadhah/lowendgirlfriend`, mientras que el repositorio publicado es `lowendmicrobacteria/lowendgirlfriend`; conviene usar el identificador real.
- Fecha de creacion y actualizacion declaradas: 2026-10-16. No hay historial de revisiones posterior.
- El contenido explicito y la etiqueta "not-for-all-audiences" implican que el modelo no debe desplegarse en plataformas con politicas de contenido restrictivas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lowendmicrobacteria/lowendgirlfriend
- Modelo base: https://huggingface.co/SupraLabs/Supra-50M-Instruct
- Dataset nadil-dulnidu/ai-girlfriend-chat-dataset: https://huggingface.co/datasets/nadil-dulnidu/ai-girlfriend-chat-dataset
- Dataset n0ctyx/wifu-chat-dataset: https://huggingface.co/datasets/n0ctyx/wifu-chat-dataset
- Dataset Chaser-cz/DPO_Pairs-Roleplay-NSFW: https://huggingface.co/datasets/Chaser-cz/DPO_Pairs-Roleplay-NSFW
- Dataset teizumika/RP-mix: https://huggingface.co/datasets/teizumika/RP-mix
- Dataset ArcBlade/chatml-bluemoon-rp-Open_Roleplay-inst: https://huggingface.co/datasets/ArcBlade/chatml-bluemoon-rp-Open_Roleplay-inst
- Dataset ChaoticNeutrals/Synthetic-RP: https://huggingface.co/datasets/ChaoticNeutrals/Synthetic-RP
- Dataset R-Kentaren/NSFW-data-sharegpr: https://huggingface.co/datasets/R-Kentaren/NSFW-data-sharegpr
- Guia de despliegue local de asistentes autoalojados (contexto general, no documentacion del modelo): https://pocketanimus.com/guides/run-ai-girlfriend-locally/
- Comparativa de generadores de compania de 2026 (contexto general de mercado, no documentacion tecnica): https://edemai.org/blog/realistic-ai-girlfriend-generator
- Mercado de modelos de PixAI (contexto general, no relacionado con el modelo): https://pixai.art/en/market
- Emotica.ai (servicio comercial, no relacionado con el modelo): https://emotica.ai/start/
- Veline AI (servicio comercial, no relacionado con el modelo): https://www.velineai.com/
