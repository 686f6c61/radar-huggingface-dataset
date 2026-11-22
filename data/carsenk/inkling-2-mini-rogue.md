# carsenk/Inkling-2-Mini-ROGUE

## Resumen
Inkling-2-Mini-ROGUE es una variante editada del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario carsenk. La intervencion aplica ROGUE, un metodo de edicion de pesos desarrollado por WeightDojo que estima direcciones de rechazo a partir de contrastes de activaciones entre prompts daninos y benignos y las elimina mediante una proyeccion ortogonal de bajo rango sobre las matrices que escriben en el flujo residual. El resultado es un modelo que conserva la arquitectura y el formato nativo del checkpoint oficial pero con el comportamiento de rechazo practicamente anulado.

El modelo mantiene la arquitectura original: un MoE con bucle (looped MoE) de 24 capas, donde las capas 6 a 17 se ejecutan tres veces por token, con 128 expertos enrutados y 8 activos por token, ademas de entrada de imagen. Los pesos se distribuyen en el mismo empaquetado que la version oficial: expertos enrutados en NVFP4 (MXFP8 en las capas 20 a 23) y el resto en BF16, con la torre de vision y la cabeza MTP sin modificar.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de ablacion direccional aplicada a una arquitectura poco convencional (con convoluciones cortas posteriores a los escritores y un nucleo con bucle); por otro, advierte de que el modelo pierde de forma material sus controles de seguridad internos, lo que lo hace inadecuado para despliegues en produccion sin salvaguardas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inkling 2 looped MoE, 24 capas (capas 6-17 ejecutadas 3 veces), 128 expertos enrutados, 8 activos por token, entrada de imagen |
| Parametros totales | no disponible |
| Parametros activos | no disponible (8 de 128 expertos enrutados por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), MXFP8 (capas 20-23), BF16 (resto); versiones GGUF Q8_0-Q3_K_M y MLX 4-bit en repos separados |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con empaquetado nativo (hf_quant_config.json, tokenizer, chat template, torre de vision y cabeza MTP incluidos) |

## Arquitectura y entrenamiento
El modelo base es un transformer MoE con nucleo en bucle: las capas 6 a 17 se ejecutan tres veces por token, lo que incrementa la profundidad efectiva sin aumentar el numero de capas. Cada capa seleccionada contiene 128 expertos enrutados sin experto compartido, de los cuales 8 se activan por token. Una particularidad estructural relevante es que cada salida de atencion (`wo_ud`) y cada proyeccion descendente de los expertos enrutados (`w2`) alimentan una convolucion causal depthwise corta antes de alcanzar el flujo residual; esto obliga a que cualquier edicion de pesos tenga en cuenta la convolucion para ser exacta tras ella.

El checkpoint oficial almacena los expertos enrutados en NVFP4 (MXFP8 en las capas 20-23) y el resto en BF16. La edicion ROGUE decodifica cada tensor experto editado, lo modifica en float32 y lo recodifica en el mismo empaquetado, con un error de recodificacion de MSE 2,4e-7; el resto de tensores permanece byte a byte identico al original. Se editaron 16 tensores escritores en las capas 8, 9, 10, 12, 13, 14, 15 y 16 (atencion `wo_ud` y `w2` fusionada de expertos enrutados), con un subespacio consciente de la convolucion de rango 15 por escritor. Las capas de direccion seleccionadas fueron 13, 14 y 9 (cono conceptual de rango 3). La receta empleada fue `weightdojo convert --scope residual-writers --mlp-scale 1.0 --rank 3 --strength 1.4 --group-calibration --calibration-samples 32 --max-harmless-projection 0.30`. La torre de vision y la cabeza MTP no se modificaron.

## Capacidades
- Generacion de texto conversacional en ingles, con modo de razonamiento configurable mediante el parametro `reasoning_effort` de la plantilla de chat (`none` a `max`, por defecto `high`).
- Entrada de imagen (pipeline image-text-to-text) gracias a la torre de vision intacta.
- Razonamiento matematico basico y de varios pasos (evaluado con GSM8K).
- Seguimiento de instrucciones (evaluado con IFEval).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al modo de razonamiento del modelo base; no se documentan capacidades agenticas especificas.
- Multilingue: limitado a ingles segun la model card.
- Capacidad especial: eliminacion del comportamiento de rechazo mediante edicion de pesos (no es un adaptador ni un filtro en inferencia).

## Casos de uso
- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la ablacion direccional afecta al comportamiento de rechazo y a la distribucion de siguiente token, con metricas de deriva documentadas (ratio de perplejidad 1,116, KL 0,130, mismo token superior en el 84,7% de los casos).
- Analisis de robustez de salvaguardas: util para evaluar hasta que punto los controles de seguridad de un modelo multimodal dependen de direcciones de activacion concretas y como se pueden neutralizar con edicion de pesos.
- Evaluacion comparativa de tecnicas de edicion: la publicacion incluye la receta exacta, el error de recodificacion y los tensores editados, lo que permite reproducir y contrastar el metodo frente a otras tecnicas de ablacion.
- Experimentos de cuantizacion: al mantener el empaquetado nativo NVFP4/MXFP8, sirve para probar pipelines de inferencia con cuantizacion de 4 bits en GPUs compatibles con ese formato.
- Pruebas de pipelines multimodales: la torre de vision intacta permite validar flujos image-text-to-text con el mismo tokenizer y plantilla de chat que el modelo oficial.
- Entornos de investigacion controlados: uso en laboratorios con salvaguardas externas (filtros de entrada/salida, supervision humana) para estudiar respuestas del modelo sin el sesgo del rechazo aprendido.
- Desarrollo de sistemas de moderacion: como referencia negativa para entrenar y validar clasificadores de contenido que detecten respuestas no filtradas por el propio modelo.

## Benchmarks y rendimiento
Los datos publicados comparan el modelo base y la variante ROGUE procesados de forma identica (mismo formato, cuantizacion y runtime), por lo que las diferencias se atribuyen a la edicion.

Comportamiento de rechazo (ROGUE Pareto v2, 40 prompts, MLX, checkpoint nativo, razonamiento desactivado, presupuesto de 1024 tokens):

| Metrica | Base | ROGUE |
|---|---:|---:|
| Tasa de rechazo ante prompts daninos | 75,0% | 0,0% |
| Sobrerrechazo en prompts sensibles pero benignos | 0,0% | 0,0% |
| Retain score (utilidad de respuesta exacta) | 91,7% | 91,7% |

Capacidad (lm-evaluation-harness via llama-server, Q8_0, razonamiento desactivado, 40 muestras por tarea):

| Tarea | Base Q8_0 | ROGUE Q8_0 |
|---|---:|---:|
| GSM8K (5-shot, extractor flexible) | 60,0% | 67,5% |
| GSM8K (coincidencia estricta) | 40,0% | 65,0% |
| IFEval (estricto a nivel de prompt) | 75,0% | 67,5% |
| IFEval (laxo a nivel de instruccion) | 73,0% | 66,7% |

Con 40 muestras el error estandar es de aproximadamente ±7,5 puntos, por lo que el autor califica estos resultados como una comprobacion de humo, no como cifras de leaderboard.

Deriva de distribucion (wikitext-2, 40 x 512 tokens, Q8_0 frente a Q8_0):

| Metrica | Valor |
|---|---:|
| Ratio de perplejidad (ROGUE / base) | 1,116 |
| Divergencia KL media | 0,130 |
| Mismo token superior | 84,7% |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El numero de parametros totales no se publica, por lo que no se puede calcular una estimacion fiable.
- GPU recomendadas: no disponible. El formato NVFP4 requiere hardware compatible con ese tipo de cuantizacion; las versiones GGUF y MLX amplian la compatibilidad a otros entornos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada), llama-server (usado en la evaluacion con Q8_0), MLX (version 4-bit en repositorio separado) y llama.cpp via los GGUF publicados (Q8_0 a Q3_K_M con mmproj).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-ROGUE | no disponible (MoE 128 expertos, 8 activos) | no disponible | 0,0% en prompts daninos | apache-2.0 | Hugging Face (repo del autor) |
| thinkingmachines/Inkling-2-Mini (base) | no disponible (misma arquitectura) | no disponible | 75,0% en prompts daninos | apache-2.0 | Hugging Face (repo oficial) |
| Otras variantes abliterated de la familia Inkling | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con el modelo base, ya que comparten arquitectura, empaquetado y plantilla de chat; la unica diferencia medible es la edicion ROGUE. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias
- La edicion elimina de forma material los controles de seguridad internos del modelo: la tasa de rechazo ante prompts daninos cae del 75,0% al 0,0%. No debe desplegarse en produccion sin salvaguardas externas.
- La edicion no anade conocimiento ni capacidad; el modelo conserva las limitaciones del base.
- Deriva real en la distribucion de siguiente token: ratio de perplejidad 1,116 y divergencia KL media de 0,130 frente al base. Ajustes mas suaves redujeron la deriva a KL 0,02-0,06 pero dejaron la mayoria de rechazos, por lo que esta version prioriza la eliminacion completa.
- IFEval muestra una caida de aproximadamente un error estandar (75,0% a 67,5% en estricto a nivel de prompt); con 40 muestras la incertidumbre es alta.
- Idioma limitado al ingles segun la model card.
- Longitud de contexto y numero de parametros no publicados, lo que dificulta planificar el despliegue.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de los modelos generativos.
- Sesgos conocidos: no documentados en la informacion disponible.
- La licencia apache-2.0 permite uso comercial, pero el autor recomienda explicitamente usar el modelo solo en investigacion y en entornos con salvaguardas adecuadas, respetando la licencia del modelo base y la legislacion aplicable.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de los resultados publicados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/carsenk/Inkling-2-Mini-ROGUE
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Version GGUF (Q8_0-Q3_K_M + mmproj): https://huggingface.co/carsenk/Inkling-2-Mini-ROGUE-GGUF
- Version MLX 4-bit: https://huggingface.co/carsenk/Inkling-2-Mini-ROGUE-MLX-4bit
- Informes de evaluacion: carpeta `evaluation/` del repositorio del modelo
- WeightDojo (metodo ROGUE): no se proporciona URL en la informacion disponible
