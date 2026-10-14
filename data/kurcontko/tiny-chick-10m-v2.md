# kurcontko/Tiny-Chick-10M-V2

## Resumen

Tiny Chick 10M V2 es un modelo de lenguaje en ingles de 9.591.684 parametros (9,6 M) desarrollado por el usuario kurcontko, segunda version del modelo Tiny Chick 10M. Se trata de un modelo de generacion de texto enmarcado en la categoria de modelos "tiny" (muy pequenos), entrenado desde cero especificamente para competir en la Tiny-ML Leaderboard, un espacio de evaluacion para modelos de escala reducida. Su relevancia no radica en capacidades practicas de produccion, sino en servir como banco de pruebas reproducible de tecnicas de entrenamiento, evaluacion y formato de prompts a muy baja escala.

La version V2 mantiene la misma arquitectura de 9,6 M de parametros que V1, pero cambia el regimen de entrenamiento: amplia el preentrenamiento de 8.000 millones a 16.000 millones de tokens de FineWeb-Edu limpio, anade una continuacion de 300 millones de tokens con texto crudo de WikiText-103 (al 15%) y aplica un ajuste fino sobre las particiones de entrenamiento y validacion de ARC. El modelo esta publicado bajo licencia Apache-2.0, con pesos en formato safetensors y soporte para la libreria transformers mediante `trust_remote_code=True`.

Es importante subrayar que el propio autor lo describe como un "modelo de tamano de benchmark": es fluido pero no factual, y no esta entrenado para conversacion. Ademas, partes del pipeline de entrenamiento se orientan deliberadamente a las metricas evaluadas, y se usaron preguntas de validacion de ARC para entrenar, por lo que las cifras de rendimiento deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only para generacion de texto (etiquetas `tinylm` y `custom_code`); configuracion interna no disponible |
| Parametros totales | 9.591.684 (9,6 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 9,6 M de parametros, identificado por el autor con la etiqueta `tinylm` y cuyo codigo asociado requiere `custom_code`. La model card no detalla el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni el tamano del vocabulario, por lo que esos datos figuran como no disponibles. Se sabe que V2 conserva la misma arquitectura que V1 y que se entreno desde cero en dos DGX Sparks.

El entrenamiento de V2 se estructura en tres etapas segun la informacion proporcionada. Primero, un preentrenamiento sobre 16.000 millones de tokens de FineWeb-Edu limpio (frente a los 8.000 millones de V1). Segundo, una continuacion de 300 millones de tokens que incorpora texto crudo de entrenamiento de WikiText-103 al 15%, en el formato exacto que puntua el protocolo Glint. Tercero, un ajuste fino sobre ARC que utiliza las particiones de entrenamiento y validacion de ARC-Easy y ARC-Challenge (4.221 preguntas) en formato de pregunta desnuda y con 6 epocas fijas; parte de su replay emplea ventanas cortas que comienzan un parrafo, lo que segun el autor evita que BLiMP se degrade durante el ajuste fino. No se menciona el uso de RLHF ni de DPO.

En cuanto a la evaluacion, V2 se puntua con el protocolo Glint-1.3 (sin token BOS, primer token no puntuado, primeros 256 tokens, ARC en formato de pregunta desnuda y WikiText-2 crudo), usando un port del scoring del `benchmark.py` de Qielbas. El autor advierte que V1 se evaluo con lm-evaluation-harness, por lo que las cifras de ambas versiones no son directamente comparables.

## Capacidades

- Generacion de texto autoregresiva en ingles a escala muy reducida.
- Continuacion de texto y modelado de lenguaje a nivel de byte/token (WikiText-2).
- Juicios de aceptabilidad gramatical en ingles, medidos mediante BLiMP (76,99).
- Resolucion de preguntas de conocimiento general en formato de pregunta desnuda, medido mediante ARC-Easy (50,21).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles; no se documentan otros idiomas.
- No esta entrenado para chat ni para seguir instrucciones conversacionales.

## Casos de uso

- Prototipado y depuracion de pipelines de transformers a escala minima: dado su tamano de 9,6 M de parametros, permite validar codigo de carga, tokenizacion y generacion con `trust_remote_code=True` en segundos y sin GPU dedicada.
- Banco de pruebas educativo: sirve para estudiar de forma reproducible como afectan el numero de tokens de preentrenamiento, el replay y el ajuste fino a metricas como BLiMP o ARC en modelos diminutos.
- Investigacion sobre contaminacion de datos: el modelo documenta explicitamente el uso de la particion de validacion de ARC en el entrenamiento, lo que lo convierte en un caso de estudio util para analizar el impacto de la contaminacion en las cifras reportadas.
- Pruebas de protocolos de evaluacion (Glint-1.3): es un sujeto adecuado para verificar implementaciones de scoring que dependen de formato de prompt, token BOS o longitud de ventana, dado que el propio autor publica los detalles del protocolo.
- Generacion de texto de relleno en demos y maquetas de interfaz: produce texto fluido en ingles aunque no factual, util para pruebas de UI donde el contenido no importa.
- Experimentos de eficiencia y despliegue en hardware extremo: al ocupar del orden de decenas de MB en precision completa, permite probar cuantizacion, ejecucion en CPU y despliegue embebido sin recursos significativos.
- Baseline de ablacion en investigacion sobre modelos pequenos: sirve como punto de referencia controlado frente a arquitecturas alternativas de la misma escala en tareas de lenguaje del ingles.

## Benchmarks y rendimiento

Datos publicados en la model card, obtenidos con el protocolo Glint-1.3:

| Metrica | Valor |
|---|---|
| BLiMP | 76,99 |
| ARC-Easy | 50,21 |
| WikiText-2 byte-ppl | 2,364 |
| Parametros | 9.591.684 |

El autor reporta ademas una puntuacion de eficiencia del ajuste fino sobre los conjuntos de test, correspondiente al mejor de cinco semillas: 82,41; 82,85; 82,83; 82,72 y 82,57 (media 82,68). La misma receta sin el replay de inicio de parrafo promediaba 82,45 sobre quince semillas. No se proporcionan resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun precision de pesos (calculo derivado de 9.591.684 parametros, sin incluir cache de atencion ni activaciones): aproximadamente 38,4 MB en FP32, 19,2 MB en FP16/BF16, 9,6 MB en INT8 y 4,8 MB en INT4.
- Cabe con holgura en cualquier GPU consumer, e incluso en GPUs integradas y en CPU; no requiere GPU de datacenter como A100 o H100.
- El propio autor indica que el entrenamiento se realizo en dos DGX Sparks, aunque ese dato se refiere al entrenamiento, no a la inferencia.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True`), y por el formato safetensors sin cuantizaciones publicadas seria necesario convertir a GGUF para usarlo con llama.cpp u Ollama. La compatibilidad con vLLM o TGI no esta documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa con la version anterior del mismo modelo, segun la informacion de la model card:

| Modelo | Parametros | Datos de preentrenamiento | Contexto | Licencia | Protocolo de evaluacion |
|---|---|---|---|---|---|
| Tiny-Chick-10M (V1) | 9,6 M | 8.000 millones de tokens de FineWeb-Edu | no disponible | Apache-2.0 | lm-evaluation-harness |
| Tiny-Chick-10M-V2 | 9.591.684 | 16.000 millones de tokens de FineWeb-Edu + 300 M de continuacion (WikiText-103 al 15%) + ajuste fino ARC | no disponible | Apache-2.0 | Glint-1.3 |

El autor advierte que V1 y V2 no son directamente comparables porque se evaluaron con protocolos distintos. No se dispone de datos de benchmarks de otros modelos de la misma categoria en la informacion proporcionada, por lo que no es posible establecer comparaciones adicionales.

## Limitaciones y advertencias

- No es un modelo factual: el autor lo describe como "fluido, no factual", lo que implica un alto riesgo de alucinacion si se usa para responder preguntas de conocimiento.
- No esta entrenado para chat ni para seguir instrucciones, por lo que no debe emplearse como asistente conversacional.
- Idiomas: unicamente ingles; no se documenta soporte de castellano ni de otras lenguas.
- Contaminacion de benchmarks: parte del pipeline (pasos 2 y 3) se orienta explicitamente a las metricas evaluadas y se usaron preguntas de validacion de ARC para el ajuste fino, por lo que las cifras no reflejan un resultado puro de preentrenamiento.
- Longitud de contexto no documentada, lo que impide planificar usos que requieran ventanas largas.
- No se publican cuantizaciones, por lo que cualquier despliegue en formatos GGUF o INT8/INT4 requeriria conversion propia y validacion.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene revisarlo antes de usarlo en entornos de produccion.
- Aunque la licencia Apache-2.0 permite uso comercial, la utilidad practica del modelo para produccion es muy limitada por su escala y su falta de entrenamiento conversacional.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad ni soporte documentado fuera de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kurcontko/Tiny-Chick-10M-V2
- Version anterior: https://huggingface.co/kurcontko/Tiny-Chick-10M
- Tiny-ML Leaderboard: https://huggingface.co/spaces/Glint-Research/Tiny-ML-Leaderboard
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de continuacion: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset de ajuste fino: https://huggingface.co/datasets/allenai/ai2_arc
