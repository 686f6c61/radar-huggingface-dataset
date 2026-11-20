# llm-semantic-router/Vela-1.0-Encoder-307M-Guard

## Resumen

Vela-1.0-Encoder-307M-Guard es un clasificador de texto de 307 millones de parametros, afinado a partir del modelo base vllm-sr/Vela-1.0-Encoder-307M, y publicado por el proyecto vLLM Semantic Router. Su funcion concreta es detectar intentos de prompt injection y de jailbreak, tanto en peticiones directas del usuario como en texto no confiable que se inyecta en el contexto del modelo (por ejemplo, resultados de herramientas o documentos recuperados). Forma parte de una familia de modelos "Vela" pensados como componentes de enrutado y seguridad dentro de despliegues de LLM.

El modelo emplea la arquitectura ModernBERT, un encoder transformer con atencion eficiente y soporte de contexto largo, y acepta hasta 32.768 tokens de entrada. Se distribuye con pesos nativos en safetensors para Transformers y Candle, y con artefactos ONNX para CPU y ROCm, incluyendo perfiles fijos de 512, 8K y 32K tokens. La licencia es Apache 2.0, lo que facilita su integracion comercial.

Su relevancia actual radica en que aborda un problema practico de produccion: separar instrucciones legitimas de intentos de manipulacion en aplicaciones con agentes y tool calling. Los datos publicados por el autor muestran una mejora sustancial frente al detector mmBERT original en los conjuntos de desarrollo evaluados, aunque el propio autor advierte que esas cifras no miden la precision en documentos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens de entrada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingue (sin listado detallado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un fine-tune del encoder Vela-1.0-Encoder-307M, construido sobre ModernBERT. Se trata de un clasificador de texto (pipeline `text-classification`) que emite una puntuacion de ataque; en la evaluacion publicada se aplica un umbral de 0,5 para decidir si una entrada es un intento de ataque. El contexto de entrada es de 32.768 tokens, lo que permite analizar prompts largos y bloques de texto no confiable sin truncar.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; al ser un encoder clasificador, el ajuste es de tipo supervisado sobre etiquetas de ataque/benigno. La innovacion principal del modelo es operativa: diferenciar el alcance de las instrucciones (peticiones directas frente a texto no confiable embebido) y mantener esa capacidad en varios idiomas. El autor evalua contra el detector mmBERT Guard original usando los mismos conjuntos de desarrollo revisados y un umbral de 0,5.

## Capacidades

- Deteccion de prompt injection y jailbreak en peticiones directas del usuario.
- Deteccion de intentos de manipulacion en texto no confiable incrustado en el contexto (resultados de herramientas, documentos, contenido recuperado).
- Diferenciacion del alcance de instrucciones: contrastes de instruction-scope evaluados en seis idiomas.
- Clasificacion multilingue de entradas maliciosas.
- Entrada de hasta 32.768 tokens para analizar prompts y documentos largos.
- Integracion como componente de seguridad en pipelines de enrutado semantico.
- Compatibilidad con Transformers, Candle y artefactos ONNX para CPU y ROCm.
- No es un modelo generativo: no produce texto ni soporta tool calling por si mismo; su salida es una clasificacion.

## Casos de uso

- Filtro de entrada en aplicaciones de chat: el modelo clasifica cada mensaje del usuario antes de enviarlo al LLM principal, bloqueando intentos de anulacion de instrucciones; su contexto de 32K permite evaluar conversaciones largas sin truncar.
- Proteccion de agentes con tool calling: cuando el agente incorpora resultados de herramientas o APIs externas al contexto, Guard analiza ese texto no confiable para detectar instrucciones inyectadas antes de que el modelo las ejecute.
- Seguridad en RAG: en pipelines de recuperacion aumentada, los fragmentos recuperados se clasifican como benignos o sospechosos antes de incluirlos en el prompt, reduciendo el riesgo de inyeccion indirecta.
- Enrutado semantico con politicas de seguridad: integrado en vLLM Semantic Router, permite decidir si una peticion se atiende, se redirige a un modelo mas robusto o se rechaza, combinando la clasificacion de ataque con el enrutado por intencion.
- Moderacion multilingue: al operar en varios idiomas, cubre aplicaciones con usuarios internacionales donde un detector solo en ingles dejaria pasar ataques en otras lenguas.
- Auditoria y monitorizacion: el modelo puede puntuar registros historicos de conversaciones para identificar patrones de ataque y ajustar umbrales, con despliegue en CPU mediante ONNX para procesamiento por lotes.
- Despliegue en hardware modesto: los artefactos ONNX para CPU permiten ejecutar el filtro en entornos sin GPU dedicada, como funciones serverless o servicios perimetrales.

## Benchmarks y rendimiento

Resultados publicados por el autor: macro F1 frente al mmBERT Guard original, con los mismos conjuntos de desarrollo revisados y umbral de ataque de 0,5.

| Conjunto de evaluacion | mmBERT original | Vela Guard |
|---|---:|---:|
| Peticiones basadas en fuente (381) | 46,42 % | 97,77 % |
| Contrastes de instruction-scope, seis idiomas (96) | 35,61 % | 75,98 % |

En los contrastes de seis idiomas, Guard detecta 34 de 48 ataques, frente a 1 de 48 de mmBERT; las falsas alarmas son 9 de 48 y 0 de 48, respectivamente. El autor advierte que estas puntuaciones de desarrollo no miden la precision en documentos largos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 307 millones de parametros, en fp16 el peso ronda los 0,6 GB y en fp32 unos 1,2 GB, mas memoria para activaciones segun la longitud de secuencia.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con al menos unos pocos GB de VRAM deberia poder ejecutar el modelo en fp16.
- Cabe en GPU de consumo: si, por el tamano del modelo; el autor no publica una lista de GPUs validadas.
- Opciones de despliegue: Transformers (probado con la version 4.57.6), Candle, y ONNX Runtime en CPU y ROCm con perfiles fijos de 512, 8K y 32K tokens; tambien figura la etiqueta text-embeddings-inference.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Guard | 307 M | 32.768 tokens | Deteccion de prompt injection y jailbreak | Apache 2.0 | Hugging Face, ONNX |
| mmBERT Guard (mmbert32k-jailbreak-detector-merged) | no disponible | no disponible | Deteccion de jailbreak | no disponible | Hugging Face |
| Vela-1.0-Encoder-307M-Safety | 307 M (familia Vela) | no disponible | Deteccion de contenido danino | Apache 2.0 (segun familia) | Hugging Face |
| Vela-1.0-Encoder-307M-Hazard | 307 M (familia Vela) | no disponible | Deteccion de contenido de riesgo | Apache 2.0 (segun familia) | Hugging Face |

Los modelos Safety y Hazard de la misma familia son complementarios, no sustitutos: el autor recomienda combinarlos con Guard para cubrir tanto manipulacion de instrucciones como contenido danino.

## Limitaciones y advertencias

- Las metricas publicadas corresponden a conjuntos de desarrollo y no miden la precision en documentos largos; el rendimiento en contextos extensos puede diferir.
- El conjunto de evaluacion multilingue es reducido (96 ejemplos en seis idiomas), por lo que las cifras tienen alta varianza.
- Es un clasificador binario con umbral fijo de 0,5 en la evaluacion; en produccion habra que calibrar el umbral segun el coste relativo de falsos positivos y falsos negativos.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta auditar su comportamiento en dominios especificos.
- No se detalla la lista de idiomas soportados; el caracter multilingue esta declarado, pero sin cobertura verificable por idioma.
- No sustituye a un detector de contenido danino: el propio autor indica emparejarlo con Vela Safety o Vela Hazard.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de clasificaciones erroneas (falsos positivos que bloqueen peticiones legitimas o falsos negativos que dejen pasar ataques).
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base vllm-sr/Vela-1.0-Encoder-307M.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Guard
- Modelo base: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M
- Detector mmBERT de referencia: https://huggingface.co/vllm-sr/mmbert32k-jailbreak-detector-merged
- Vela Safety: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M-Safety
- Vela Hazard: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M-Hazard
- Coleccion Vela: https://huggingface.co/collections/vllm-sr/vela-10-router-models-6aa555ba70cc6997d6d67798
- Documentacion: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN
