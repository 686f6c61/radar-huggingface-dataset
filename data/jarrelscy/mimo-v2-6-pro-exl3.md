# jarrelscy/MiMo-V2.6-Pro-EXL3

## Resumen

MiMo-V2.6-Pro-EXL3 es un checkpoint de cuantización experimental publicado por el usuario jarrelscy sobre el modelo base XiaomiMiMo/MiMo-V2.6-Pro-RL, el modelo razonador insignia de Xiaomi presentado el 22 de septiembre de 2026. El repositorio aplica una cuantización secuencial denominada EXL3 sobre los expertos "fríos" del modelo, manteniendo los expertos "calientes" en su formato NVFP4 original. Se trata de artefactos de investigación: el propio autor indica explícitamente que no es un modelo listo para servir y que requiere un cargador de inferencia específico.

El modelo base es una arquitectura MoE dispersa de 1,02 billones de parámetros totales y 42 mil millones de parámetros activos por token, con licencia MIT según la documentación pública de Xiaomi, aunque la ficha de HuggingFace de este checkpoint no declara licencia. El trabajo de cuantización cubre las capas 1 a 54 con optimización conjunta de escalas de entrada y salida (joint-PV) sobre el corpus completo de 18.006.461 tokens de entrenamiento, sin eliminar neuronas.

Su relevancia es doble: por un lado documenta una metodología poco habitual (cuantización secuencial capa a capa con propagación de entradas a través de las capas ya aceptadas) y, por otro, permite estudiar el impacto del truncado a ~2 bits en expertos MoE de gran escala. No obstante, al no incluir los tensores del backbone ni un cargador completo, su uso práctico hoy es exclusivamente de análisis y reconstrucción, no de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa (modelo base MiMo-V2.6-Pro); el checkpoint contiene artefactos EXL3 de expertos, no la arquitectura completa |
| Parametros totales | 1,02 billones (modelo base); no disponible para el checkpoint aislado |
| Parametros activos | 42 mil millones por token (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis de tasa mixta a <=2 bits empaquetados por peso (expertos frios) + NVFP4 exacto (expertos calientes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio del checkpoint; el modelo base se distribuye bajo MIT segun la documentacion publica de Xiaomi |
| Formato de pesos | Binarios `.bin` por experto (empaquetados en `experts.tar` a partir de la capa 26) y reconstruccion a `.pt` mediante `decode.py`; sin safetensors ni GGUF |

Datos adicionales: tamano del repositorio 237,9 GB; 1.325 expertos calientes retenidos en NVFP4 (5,00075 % del total global); 54 capas completadas con joint-PV sobre corpus completo; validacion y auditoria con 16.384 tokens retenidos cada una.

## Arquitectura y entrenamiento

El checkpoint no define una arquitectura propia: es el resultado de aplicar un proceso de cuantizacion sobre los expertos del modelo base MiMo-V2.6-Pro-RL. La metodologia descrita es una cuantizacion secuencial con optimizacion conjunta de escalas (joint-PV) por capa. Para las capas 1 a 53, el ajuste inicial del trellis de EXL3 usa un subconjunto de calibracion; a partir de la sustitucion de la capa 54, el ajuste inicial utiliza todos los ejemplos de entrenamiento enrutados a cada experto frio. Despues, la optimizacion conjunta de escalas de entrada y salida se realiza contra la salida combinada de la capa enrutada, manteniendo fijos los codigos del trellis. Las capas posteriores consumen entradas propagadas a traves de las capas EXL3 ya aceptadas, de modo que el error se acumula de forma controlada por la validacion.

Un detalle tecnico relevante es que no se elimina ninguna neurona y que los 1.325 expertos calientes conservan sus pesos NVFP4 y su asignacion original; el 5,00075 % citado es una proporcion global, no una cuota por capa. Los pesos frios emplean los libros de codigos estandar de EXL3 (no los libros experimentales con componentes FP4) y la evaluacion decodifica los pesos a BF16. Las metricas de error L2 relativo registradas en `reports/layer_errors.csv` son errores de reconstruccion por capa, no de precision, perplejidad o divergencia KL del modelo completo. La seleccion del checkpoint retenido se hace unicamente por validacion, por lo que puede corresponder a un punto anterior al final del recorrido del corpus o incluso al ajuste inicial si este resulta mejor.

## Capacidades

No es posible atribuir capacidades funcionales verificadas a este checkpoint, porque no es un modelo servible y no se han publicado evaluaciones de extremo a extremo. Lo que si puede afirmarse, a partir de la informacion disponible, es lo siguiente:

- El modelo base MiMo-V2.6-Pro se presenta publicamente como un modelo de razonamiento omni-modal, orientado a tareas de horizonte largo, trabajo de alto riesgo, ciberseguridad e investigacion.
- El modelo base ocupa la primera posicion en el indice de inteligencia de Artificial Analysis entre los modelos abiertos, segun la documentacion de Xiaomi.
- El checkpoint conserva la asignacion y los pesos de los expertos calientes en NVFP4, por lo que la parte no recuantizada del modelo mantiene su comportamiento numerico original.
- Capacidades de tool calling, function calling, agentes o modo de razonamiento extendido para el modelo base: no disponibles en la informacion proporcionada.
- Capacidades multilingues del modelo base: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades concretas: la documentacion describe el modelo base como omni-modal, pero no se detalla la lista de modalidades soportadas.

## Casos de uso

- Auditoria de cuantizacion en MoE de gran escala: el checkpoint permite medir el error L2 relativo por capa (`reports/layer_errors.csv`) y estudiar como se degrada la reconstruccion al propagar entradas a traves de capas ya cuantizadas, un escenario poco documentado en modelos de mas de un billon de parametros.
- Investigacion de esquemas de bits mixtos: sirve como referencia para comparar EXL3 trellis a ~2 bits frente a NVFP4 y a otras alternativas, dado que conserva un conjunto acotado de expertos en su formato original como linea base interna.
- Desarrollo de cargadores de inferencia personalizados: el repositorio obliga a implementar un loader especifico; es un caso de uso real para equipos que trabajan con runtimes propios sobre CUDA y PyTorch.
- Validacion de la utilidad de `decode.py` con el runtime oficial EXL3 1.5.1: reconstruir expertos concretos a `.pt` y verificar los hashes SHA-256 recogidos en los manifiestos por capa.
- Reproducibilidad y trazabilidad de artefactos: los ficheros de recibos y manifiestos permiten verificar procedencia, cobertura del corpus y estado de cada capa, util en entornos de investigacion con requisitos de auditoria.
- Analisis de coste de almacenamiento y distribucion: con 237,9 GB solo para las capas 1 a 54 y sin backbone, el repositorio ejemplifica los problemas practicos de empaquetado de modelos de escala trillonaria.
- Estudio de estrategias de compresion sin poda: como no se elimina ninguna neurona, es un caso util para comparar cuantizacion pura frente a tecnicas de poda estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del checkpoint EXL3 en la informacion disponible. El autor indica expresamente que los errores L2 relativos son metricas de reconstruccion por capa y no de precision del modelo. Como referencia del modelo base se dispone de un unico dato:

| Benchmark | MiMo-V2.6-Pro (base) | MiMo-V2.6-Pro-EXL3 (checkpoint) |
|---|---|---|
| Artificial Analysis Intelligence Index | 46,32 | no disponible |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Perplejidad | no disponible | no disponible |
| Divergencia KL frente al modelo original | no disponible | no disponible |

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del repositorio y del numero de parametros del modelo base; no proceden de la documentacion del autor.

- VRAM para inferencia (estimacion): con cuantizacion de ~2 bits, los pesos de un modelo de 1,02 billones de parametros ocuparian del orden de 250-300 GB, a lo que hay que sumar cache KV, activaciones y overhead del runtime. El repositorio actual (237,9 GB) solo cubre las capas 1 a 54 y no incluye el backbone, por lo que el conjunto completo seria mayor.
- GPU recomendadas (estimacion): despliegue en multiples aceleradores de 80 GB, como H100 SXM o A100 80 GB, en configuraciones de 4 a 8 unidades segun el nivel de paralelismo y la longitud de contexto.
- GPU de consumo: no cabe en ninguna GPU de consumo actual, ni siquiera con cuantizaciones mas agresivas del conjunto completo.
- Opciones de despliegue: no disponibles. El autor indica que se requiere un cargador de servicio completo y que el directorio no es un modelo EXL3 estandar utilizable con herramientas habituales. vLLM, llama.cpp, Ollama y TGI no aparecen mencionados ni soportados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro-EXL3 (este checkpoint) | no disponible (base: 1,02 B) | no disponible (base: 42 mM) | no disponible | no disponible | Repositorio de investigacion, no servible |
| MiMo-V2.6-Pro-RL (modelo base) | 1,02 billones | 42 mil millones | no disponible | MIT segun documentacion publica | Pesos completos publicados |
| jarrelscy/MiMo-V2.6-Pro-EXL3-FP4 | no disponible | no disponible | no disponible | no disponible | Repositorio de investigacion previo |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Citado como superado por MiMo-V2.6-Pro en el indice de Artificial Analysis |
| Qwen3.8 Max | no disponible | no disponible | no disponible | no disponible | Citado como superado por MiMo-V2.6-Pro en el indice de Artificial Analysis |

No se dispone de especificaciones tecnicas de los modelos competidores en la informacion proporcionada, por lo que la comparacion se limita a la referencia cualitativa de posicionamiento en el indice de Artificial Analysis.

## Limitaciones y advertencias

- No es un modelo listo para servir: el propio autor lo califica de checkpoint experimental y advierte de que requiere un cargador de servicio completo que no se incluye.
- Cobertura incompleta: solo estan completas las capas listadas (1 a 54) y los tensores del backbone no estan incluidos hasta que se publiquen por separado.
- Integridad del repositorio: a partir de la capa 26 los binarios de expertos se almacenan comprimidos en `experts.tar`, que debe extraerse con `tar -xf`; las rutas internas preservan la estructura original.
- Dependencia estricta del runtime: la reconstruccion exige el runtime oficial EXL3 1.5.1 y una rueda compatible de CUDA/PyTorch; no hay compatibilidad documentada con otros formatos.
- Metricas mal interpretables: los errores L2 relativos publicados son de reconstruccion por capa y no permiten inferir precision, perplejidad ni divergencia KL del modelo completo.
- Seleccion por validacion: el checkpoint retenido puede corresponder a un punto anterior al final del recorrido del corpus o al ajuste inicial, lo que implica que la cobertura efectiva del corpus puede ser parcial.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de calidad generativa para este checkpoint, por lo que no puede recomendarse para produccion.
- Licencia ambigua: la ficha de HuggingFace no declara licencia. Aunque el modelo base se distribuye bajo MIT segun la documentacion de Xiaomi, la licencia aplicable a estos artefactos derivados no consta explicitamente, lo que supone un riesgo para uso comercial.
- Idiomas y sesgos: no disponibles.
- Coste de almacenamiento y transferencia elevado (237,9 GB) para un artefacto que aun no es utilizable de extremo a extremo.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/jarrelscy/MiMo-V2.6-Pro-EXL3
- Repositorio previo con cuantizacion FP4: https://huggingface.co/jarrelscy/MiMo-V2.6-Pro-EXL3-FP4
- Modelo base en HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Pagina oficial de la serie MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Ficha oficial de MiMo-V2.6-Pro: https://mimo.mi.com/models/en-US/mimo-v2.6-pro
- Metricas de entrenamiento RL de MiMo-V2.6: https://mimo.xiaomi.com/rl/
- Ficha de terceros con contexto, precios y benchmarks: https://www.jarvis-ai.cz/ai-modely/mimo-v2.6-pro
