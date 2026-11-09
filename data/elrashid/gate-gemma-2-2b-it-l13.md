# elrashid/gate-gemma-2-2b-it-l13

## Resumen

`elrashid/gate-gemma-2-2b-it-l13` es un clasificador de seguridad (guardrail) construido sobre el modelo `google/gemma-2-2b-it`. No es un modelo generativo en si mismo, sino una "puerta" de seguridad que se interpone antes de la generacion: analiza el prompt de entrada y devuelve una probabilidad de que sea danino, de modo que un sistema pueda bloquear o filtrar la peticion antes de que el modelo base empiece a generar. Lo desarrolla el usuario de Hugging Face `elrashid` y se publica bajo licencia MIT.

Tecnicamente, el gate es una regresion logistica entrenada sobre las activaciones de un autoencoder disperso (SAE, sparse autoencoder) extraidas del residual stream de la capa 13 del modelo Gemma 2 2B IT. El SAE asociado se publica por separado como `elrashid/sae-gemma-2-2b-it-topk-l13`. La idea es aprovechar la interpretabilidad de las features dispersas del SAE para construir un clasificador ligero de prompts daninos, en lugar de depender de un modelo de moderacion independiente.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo de seguridad basado en interpretabilidad mecanicista (SAE + sonda lineal) aplicado a un modelo pequeno y abierto; por otro, ofrece un componente reutilizable para pipelines de guardrail en produccion con un coste computacional bajo. El repositorio figura como de acceso restringido (gated) y con 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica sobre features de un sparse autoencoder (SAE top-k) del residual stream de la capa 13 de Gemma 2 2B IT |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en la ficha) |
| Tipos de cuantizacion | no disponible (el gate es un clasificador ligero; el tag menciona "quantization" sin detallar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El componente central es una regresion logistica que opera sobre las activaciones de un SAE top-k entrenado sobre el residual stream de la capa 13 de `google/gemma-2-2b-it`. El SAE descompone el estado oculto del modelo en un conjunto de features dispersas y interpretables; el gate aprende una combinacion lineal de esas features que separa prompts daninos de prompts benignos. La salida es una probabilidad P(harmful) calculada exclusivamente a partir del prompt, antes de que comience la generacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de calibracion o regularizacion especificas. El modelo base, Gemma 2 2B IT, es un transformer decoder-only de Google con 2.000 millones de parametros y ajuste por instrucciones; el SAE y el gate se construyen sobre el, pero los detalles de su entrenamiento no estan documentados en la informacion proporcionada.

## Capacidades

- Clasificacion de seguridad de prompts: asigna una probabilidad de dano a la entrada antes de la generacion.
- Guardrail pre-generacion: permite bloquear o filtrar peticiones antes de invocar al modelo base.
- Interpretabilidad: al apoyarse en features de un SAE, las decisiones son potencialmente analizables a nivel de feature.
- Integracion con el ecosistema Gemma 2 2B IT: comparte tokenizador y representaciones con el modelo base.
- Coste bajo: al ser una regresion logistica sobre features precalculadas, la inferencia es mucho mas barata que un modelo de moderacion completo.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito; no disponible.

## Casos de uso

- Filtrado de entrada en chatbots: colocar el gate delante de Gemma 2 2B IT para rechazar prompts daninos antes de generar, reduciendo coste y riesgo en atencion al cliente automatizada.
- Moderacion en pipelines de API: integrar el clasificador como paso previo en un endpoint de inferencia, de modo que solo los prompts con P(harmful) baja lleguen al modelo generativo.
- Investigacion en interpretabilidad: usar el gate y el SAE asociado para estudiar que features del residual stream se correlacionan con contenido danino en la capa 13.
- Evaluacion de seguridad de modelos pequenos: emplear el gate como sonda para medir la sensibilidad de Gemma 2 2B IT ante distintos tipos de prompts.
- Prototipado de guardrails de bajo coste: desplegar el clasificador en entornos con recursos limitados donde un modelo de moderacion completo seria demasiado caro.
- Generacion de datasets de seguridad: etiquetar automaticamente prompts como daninos o benignos para construir corpus de entrenamiento o evaluacion.
- Defensa en profundidad: combinar el gate pre-generacion con moderacion posterior a la salida para una estrategia de seguridad en dos capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El gate en si es una regresion logistica sobre features del SAE: su coste de inferencia es minimo comparado con el modelo base.
- Para calcular las features del SAE es necesario ejecutar el forward pass de Gemma 2 2B IT hasta la capa 13, lo que requiere cargar el modelo base.
- VRAM estimada para el modelo base en fp16: en torno a 5-6 GB (2.000 millones de parametros); en cuantizacion de 4 bits, aproximadamente 2-3 GB (estimacion, no confirmada en la ficha).
- Cabe en GPU de consumo como RTX 3060, RTX 4060, RTX 4090 y superiores; tambien en CPU con llama.cpp para el modelo base, aunque el flujo SAE puede requerir framework de PyTorch.
- Opciones de despliegue: vLLM, TGI o llama.cpp para el modelo base; el gate y el SAE requieren un entorno Python con PyTorch y las librerias de SAE correspondientes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elrashid/gate-gemma-2-2b-it-l13 | Clasificador de seguridad sobre SAE | no disponible | no disponible | MIT | Gated en HF |
| elrashid/sae-gemma-2-2b-it-topk-l13 | SAE top-k sobre capa 13 | no disponible | no disponible | no disponible | HF |
| Llama Guard (Meta) | Modelo de moderacion generativo | 8B (familia) | no disponible | licencia Llama | HF |
| google/gemma-2-2b-it | Modelo generativo base | 2B | no disponible | Gemma | HF |

Los modelos de moderacion generativos como Llama Guard requieren ejecutar un modelo completo para clasificar, mientras que este gate es una sonda lineal sobre features precalculadas, mucho mas ligera. La comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Solo clasifica el prompt de entrada; no evalua la salida generada, por lo que no sustituye a una moderacion post-generacion.
- Depende de la calidad y cobertura del SAE subyacente; features no representadas en el SAE pueden escapar al clasificador.
- No hay datos publicados de precision, recall ni tasas de falsos positivos/negativos.
- No se documentan sesgos conocidos ni cobertura multilingue; el comportamiento fuera del ingles (si el SAE se entreno principalmente en ingles) es incierto.
- Riesgo de falsos positivos que bloqueen prompts legitimos y de falsos negativos que dejen pasar contenido danino.
- El repositorio esta en acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Licencia MIT para el gate, pero el uso del modelo base Gemma 2 esta sujeto a los terminos de Google; verificar compatibilidad para uso comercial.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa.
- No apto como unica capa de seguridad en produccion; debe combinarse con otras defensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elrashid/gate-gemma-2-2b-it-l13
- SAE asociado: https://huggingface.co/elrashid/sae-gemma-2-2b-it-topk-l13
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- DOI: 10.57967/hf/9433
