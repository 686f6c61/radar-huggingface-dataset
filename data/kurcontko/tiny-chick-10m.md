# kurcontko/Tiny-Chick-10M

## Resumen

Tiny-Chick-10M es un modelo de lenguaje en ingles de 9.591.684 parametros entrenado desde cero por el desarrollador kurcontko (Michal Kurc) y publicado en HuggingFace bajo licencia Apache 2.0. Su proposito es servir como referencia en la categoria de modelos ultrapequenos dentro de la Tiny-ML Leaderboard, un espacio de comparacion de modelos con presupuestos de computo muy reducidos. No esta pensado para uso en produccion ni para conversacion: el propio autor lo describe como un modelo de tamano de benchmark, fluido pero no factual y sin entrenamiento para chat.

La arquitectura es un transformer decoder-only de 14 capas, anchura 240, 6 cabezas de atencion (2 cabezas KV) y un vocabulario BPE de 4.096 tokens. Incorpora varias modificaciones respecto al bloque Llama estandar: MLP con activacion ReLU al cuadrado, QK-norm, RoPE parcial, atencion autoexclusiva y proyecciones de salida inicializadas a cero. El codigo de la arquitectura se distribuye en el archivo `tinylm_arch.py`, por lo que requiere `trust_remote_code=True` para cargarse.

El modelo se entreno en dos DGX Spark con un total de 8.000 millones de tokens de FineWeb-Edu, seguidos de una continuacion de 300 millones de tokens con un 15 por ciento de texto de entrenamiento de WikiText-103 y un ajuste fino posterior sobre las particiones de entrenamiento de ARC-Easy y ARC-Challenge. Es importante senalar que estas dos ultimas fases estan dirigidas especificamente a mejorar las metricas de los benchmarks, de modo que los resultados publicados no corresponden a un preentrenamiento puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tinylm, custom_code) |
| Parametros totales | 9.591.684 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (las evaluaciones se realizaron con contexto de 512 tokens) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 14 capas con anchura 240 y 6 cabezas de atencion, de las cuales solo 2 son cabezas KV (atencion con consultas agrupadas, GQA). El vocabulario es un BPE de 4.096 tokens. Respecto al bloque Llama convencional, introduce cuatro variaciones concretas: MLP con activacion ReLU al cuadrado en lugar de SwiGLU, normalizacion de consultas y claves (QK-norm), RoPE parcial (aplicado solo a una fraccion de las dimensiones de la cabeza) y atencion autoexclusiva. Ademas, las proyecciones de salida estan inicializadas a cero. El codigo de la arquitectura no sigue una clase estandar de transformers y se distribuye como codigo personalizado en `tinylm_arch.py`.

El entrenamiento consta de tres fases declaradas por el autor. La primera es un preentrenamiento sobre 8.000 millones de tokens de FineWeb-Edu depurado. La segunda es una continuacion de 300 millones de tokens en la que se mezcla un 15 por ciento de texto de entrenamiento de WikiText-103. La tercera es un ajuste fino sobre las particiones de entrenamiento (train) de ARC-Easy y ARC-Challenge, con repeticion de datos de FineWeb-Edu para mitigar el olvido catastrofico. El autor indica que las fases dos y tres estan orientadas a los benchmarks y que no se entrenó con respuestas de test ni de validacion, ni con texto de test de WikiText-2, y que se eliminaron del conjunto de entrenamiento los elementos solapados con los conjuntos de test. El checkpoint final se selecciono segun la validacion de ARC-Easy. No se menciona en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Generacion de texto en ingles: produce texto fluido a nivel de continuacion, segun la propia descripcion del autor.
- Razonamiento y conocimiento factual: no entrenado para ello; el autor lo describe explicitamente como "fluido, no factual".
- Codigo y matematicas: no se documenta ninguna capacidad especifica en estas areas.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible; no hay entrenamiento orientado a agentes.
- Capacidades multilingues: solo ingles; no se documentan otros idiomas.
- Capacidad especial: no dispone de modo de razonamiento (thinking mode), vision ni audio.
- Conversacion (chat): no entrenado para chat, segun el autor.

## Casos de uso

- Investigacion en eficiencia de arquitecturas: el modelo sirve como banco de pruebas reproducible para medir el efecto de variantes concretas del bloque transformer (ReLU al cuadrado, QK-norm, RoPE parcial, atencion autoexclusiva) con un coste de computo minimo, ya que entrena y evalua con presupuestos muy reducidos.
- Experimentos de destilacion y comparacion de tamano: al tener 9,6 millones de parametros, permite comparar curvas de aprendizaje frente a modelos de escala similar en tareas de modelado de lenguaje, usando su perplexity en WikiText-2 como referencia.
- Validacion de pipelines de evaluacion: con contexto de 512 tokens y tareas BLiMP y ARC-Easy, se puede usar para verificar la correcta configuracion de lm-evaluation-harness en entornos nuevos sin apenas consumo de recursos.
- Educacion y docencia: adecuado para ensenar el ciclo completo de preentrenamiento, continuacion de dominio y ajuste fino supervisado sobre un modelo que se ejecuta en CPU.
- Pruebas de infraestructura y CI: sirve como modelo de humo (smoke test) para verificar que un entorno de transformers, el pipeline de inferencia o el sistema de ficheros de safetensors funcionan antes de desplegar un modelo grande.
- Generacion de texto de relleno en demos: para prototipos de interfaz que necesitan salida de texto en ingles sin coste de inferencia apreciable.
- Estudios de contaminacion de benchmarks: el autor documenta el efecto de mezclar datos de entrenamiento de los propios benchmarks, lo que lo convierte en un caso util para estudiar solapamiento train/test.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados 0-shot con lm-evaluation-harness en las tareas `blimp`, `arc_easy` y `wikitext`, con contexto de 512 tokens.

| Benchmark | Resultado final | Sin las fases 2 y 3 | Notas |
|---|---|---|---|
| BLiMP | 75,12 | 75,69 | Precision (accuracy) |
| ARC-Easy | 48,53 | 40,70 | Precision (accuracy) |
| WikiText-2 byte-ppl | 2,287 | 2,395 | Perplexity por byte |

Observacion: las fases de continuacion y ajuste fino orientadas a benchmarks mejoran ARC-Easy de forma notable (de 40,70 a 48,53) y la perplexity en WikiText-2 (de 2,395 a 2,287), pero empeoran ligeramente BLiMP (de 75,69 a 75,12). No se han publicado en la informacion disponible resultados comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 9,59 millones de parametros, lo que supone aproximadamente 38 MB en fp32 y 19 MB en fp16/bf16. El consumo de memoria es despreciable frente a cualquier GPU moderna.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Funciona en CPU sin problema.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1050 o integradas de portatil. No es necesario un modelo de gama alta.
- Opciones de despliegue: la via documentada es transformers con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. El autor recomienda ejecutar la generacion con `use_cache=False`. El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado y es improbable sin adaptar el codigo personalizado (`tinylm_arch.py`) a un formato estandar.
- Latencia y throughput estimados: no disponible.
- Nota practica: al tratarse de un modelo con codigo personalizado y sin pesos GGUF publicados, el despliegue en servidores de inferencia convencionales requiere trabajo adicional de conversion.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible datos comparativos con modelos de la misma categoria (modelos de menos de 10 millones de parametros entrenados en ingles). El modelo esta publicado para la Tiny-ML Leaderboard, que seria la fuente natural de comparacion, pero no se dispone de sus resultados en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tiny-Chick-10M | 9.591.684 | No disponible | Apache 2.0 | HuggingFace (transformers, codigo personalizado) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Alucinacion: el autor advierte explicitamente de que el modelo es fluido pero no factual. No debe usarse como fuente de informacion.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible. Al entrenarse sobre FineWeb-Edu y WikiText, es probable que herede sesgos de esas fuentes, pero no hay mediciones publicadas.
- Limitacion de idioma: solo entrenado en ingles. No soporta castellano ni otros idiomas.
- Contexto limitado: no se declara la longitud maxima de contexto. Las evaluaciones se hicieron a 512 tokens, lo que sugiere un limite bajo para tareas de contexto largo.
- No apto para chat: no fue entrenado para conversacion ni para seguir instrucciones.
- Contaminacion de benchmarks: las fases 2 y 3 se entrenaron sobre las particiones train de ARC-Easy y ARC-Challenge y mezclan texto de entrenamiento de WikiText-103. Los resultados de ARC y WikiText-2 no son comparables a un preentrenamiento limpio, aunque el autor afirma haber eliminado solapamientos con los conjuntos de test y no haber usado respuestas de validacion ni test.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no tiene calidad suficiente para produccion mas alla de pruebas internas o experimentacion.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor. Conviene revisar `tinylm_arch.py` antes de cargarlo en entornos sensibles.
- Repositorio con 0 descargas y 0 likes: no hay validacion de la comunidad ni reportes de terceros sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kurcontko/Tiny-Chick-10M
- Perfil del autor: https://huggingface.co/kurcontko
- Tiny-ML Leaderboard (espacio de HuggingFace): https://huggingface.co/spaces/Glint-Research/Tiny-ML-Leaderboard
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset WikiText: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Otro modelo del mismo autor (contexto): https://huggingface.co/kurcontko/Llama-3.1-8B-SEPA-SCT
