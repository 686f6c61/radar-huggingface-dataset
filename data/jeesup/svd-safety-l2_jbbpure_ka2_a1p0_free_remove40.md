# Jeesup/svd-safety-l2_jbbpure_ka2_a1p0_free_remove40

## Resumen

`svd-safety-l2_jbbpure_ka2_a1p0_free_remove40` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. No es un modelo entrenado desde cero: es una versión comprimida de `meta-llama/Llama-2-7b-chat-hf` mediante la técnica SVD-LLM, con un 40,00 % de los parámetros eliminados, lo que deja una fracción de parámetros resultante de 0,5998 respecto al modelo denso. Sobre esa base comprimida se aplica además una regla de selección de componentes SVD para restaurar parte de la capacidad perdida, con un presupuesto de restauración del 0,000 % (es decir, cero componentes restaurados y cero intercambiados).

El propósito declarado es estudiar cómo la compresión SVD degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes lo repara mejor. Este checkpoint concreto es una celda de una rejilla experimental sobre reglas de selección y presupuestos, no un asistente conversacional de propósito general. El autor advierte explícitamente que varias ramas de la rejilla están degradadas deliberadamente en seguridad respecto a Llama-2-7b-chat y que la compresión por sí sola eleva la tasa de éxito de ataques.

La relevancia del artefacto es metodológica: ofrece métricas medidas de seguridad (AdvBench, StrongREJECT, WildGuard) y de utilidad (perplejidad en WikiText-2) para cuantificar el compromiso entre compresión, utilidad y alineación. La model card es transparente sobre la procedencia, pero la regla de selección figura literalmente como `unknown` en el propio repositorio, lo que limita la reproducibilidad de esta celda concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama-2-7b-chat), con pesos comprimidos mediante SVD-LLM |
| Parametros totales | 6.738.415.616 (dato del repositorio en safetensors); la model card declara una fraccion de parametros resultante de 0,5998 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-2-7b-chat soporta 4.096 tokens |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors (13,5 GB) y no documenta variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no disponible; el modelo base esta entrenado predominantemente en ingles |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors, cargables con la libreria `transformers` |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, RoPE y atencion por grupos (GQA). No hay entrenamiento adicional desde cero ni ajuste fino supervisado documentado: la unica transformacion aplicada es una compresion SVD-LLM que elimina el 40,00 % de los parametros, seguida de un proceso de restauracion de componentes SVD con presupuesto 0,000 % (0 componentes restaurados, 0 componentes intercambiados). La semilla declarada es 42 y la fraccion de parametros resultante es 0,5998.

La innovacion tecnica del artefacto no esta en la arquitectura, sino en el protocolo experimental: se mide como la compresion de bajo rango afecta a la seguridad (tasa de exito de ataques con jueces de HarmBench sobre AdvBench y StrongREJECT, y tasa macro de rechazo excesivo con WildGuard) y a la utilidad (perplejidad en WikiText-2). Esta celda concreta pertenece a la rama "free" con regla de seleccion marcada como `unknown`, lo que significa que la propia model card no identifica el criterio usado para elegir componentes, un punto critico para replicar el resultado.

Conviene senalar una discrepancia tecnica: el recuento de parametros almacenado en safetensors (6.738.415.616) coincide con el de Llama-2-7b denso, pese a que la model card declara un 40 % de parametros eliminados. Esto puede deberse a como se serializan los factores SVD, a un recuento calculado sobre la configuracion original o a una limitacion del metadato; en cualquier caso, no esta aclarado en la informacion disponible y debe verificarse antes de asumir un ahorro real de memoria.

## Capacidades

- Generacion de texto conversacional: hereda el comportamiento de instrucciones de Llama-2-7b-chat, aunque degradado por la compresion.
- Razonamiento y respuesta a preguntas en ingles, con la calidad esperable de un modelo de 7B de segunda generacion.
- Capacidad multilingue: no documentada; el modelo base esta optimizado para ingles y la compresion puede acentuar la perdida en otros idiomas.
- Tool calling / function calling: no documentado ni afirmado por el autor.
- Uso como agente o razonamiento multi-paso: no documentado; el artefacto no esta pensado para ello.
- Capacidades especiales: ninguna. No hay modo de pensamiento (thinking), vision ni audio.
- Uso analitico: sirve como sujeto experimental para medir ASR de ataques, tasas de rechazo excesivo e impacto de la compresion en la perplejidad.

## Casos de uso

- Investigacion sobre compresion de modelos: usar el checkpoint como una celda del estudio de SVD-LLM para comparar reglas de seleccion de componentes y presupuestos de restauracion con otras celdas de la misma rejilla.
- Auditoria de seguridad en modelos comprimidos: medir la tasa de exito de ataques (ASR) con AdvBench y StrongREJECT bajo el juez de HarmBench, y contrastarla con la del modelo denso sin comprimir.
- Analisis de rechazo excesivo: emplear la metrica macro de WildGuard para estudiar si la compresion vuelve al modelo mas o menos propenso a rechazar peticiones benignas.
- Evaluacion de degradacion de utilidad: reproducir la perplejidad en WikiText-2 (11,4303 declarada) como indicador de la perdida de modelado de lenguaje respecto al base.
- Docencia y divulgacion tecnica: ilustrar en un curso o taller como una intervencion de bajo rango sobre los pesos afecta simultaneamente a utilidad y alineacion, con cifras medibles.
- Pruebas de robustez de pipelines de evaluacion: comprobar si los arneses de evaluacion (jueces automaticos, suites de red-teaming) se comportan igual ante un modelo con pesos comprimidos pero misma interfaz de `transformers`.
- Punto de partida para experimentos de reparacion: usar esta rama como linea base de "compresion sin restauracion" frente a las ramas que si restauran componentes SVD.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes autonomos ni ninguna aplicacion orientada a usuarios finales.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,1904 | HarmBench judge |
| StrongREJECT ASR | 0,1374 | HarmBench judge |
| Macro over-refusal | 0,1672 | WildGuard |
| Perplejidad WikiText-2 | 11,4303 | no especificado en la model card |

No se han publicado en la informacion disponible los valores del modelo denso de referencia (`meta-llama/Llama-2-7b-chat-hf`) ni de otras celdas de la rejilla, por lo que estas cifras no pueden interpretarse como mejoria o empeoramiento sin una linea base. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de otras suites de capacidad general.

## Requisitos de hardware

- VRAM estimada en precision de origen (safetensors, pesos de 13,5 GB): en torno a 14-16 GB de VRAM contando cache KV para contextos de 4.096 tokens y lotes pequenos.
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo compatibles: RTX 3090 y RTX 4090 (24 GB) con holgura; RTX 4080 (16 GB) muy al limite; RTX 3080 (10 GB) y RTX 4060 Ti (16 GB) requeririan cuantizacion.
- Cuantizacion: no hay archivos GGUF, AWQ ni GPTQ publicados. Convertir a 8 bits o 4 bits reduciria el peso a aproximadamente 7 GB y 4 GB respectivamente, pero la conversion no esta documentada y la estructura de pesos comprimida por SVD puede no ser compatible con las herramientas estandar (llama.cpp, AutoAWQ, AutoGPTQ).
- Opciones de despliegue: `transformers` es la via documentada (la etiqueta del repositorio incluye `text-generation-inference`). vLLM, TGI, llama.cpp u Ollama no pueden darse por validados sin comprobar que la arquitectura serializada carga correctamente.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad ni de memoria en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l2_jbbpure_ka2_a1p0_free_remove40 | 6,74 B declarados (fraccion 0,5998) | no disponible | Llama 2 Community License | safetensors en HuggingFace | Artefacto de investigacion; seguridad degradada de forma deliberada |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4.096 tokens | Llama 2 Community License | safetensors, GGUF de terceros | Base sin comprimir; referencia natural del estudio |
| mistralai/Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 tokens | Apache 2.0 | safetensors y cuantizaciones comunitarias | Alternativa de tamano similar con contexto mucho mayor y licencia permisiva |

No se dispone de comparaciones de rendimiento entre este checkpoint y alternativas, porque no se han publicado los valores del modelo denso de referencia ni de las demas celdas de la rejilla. Cualquier afirmacion de superioridad o inferioridad careceria de base con los datos disponibles.

## Limitaciones y advertencias

- El propio autor indica que varias ramas de la rejilla estan degradadas en seguridad de forma deliberada respecto a Llama-2-7b-chat; la compresion por si sola eleva la tasa de exito de ataques.
- La regla de seleccion de componentes figura como `unknown` en la model card, lo que impide reproducir exactamente esta celda.
- El modelo no es un asistente de proposito general y no debe desplegarse ante usuarios finales.
- El recuento de parametros del repositorio no refleja la reduccion declarada del 40 %, lo que cuestiona el ahorro real de memoria y exige verificacion previa.
- Riesgo de alucinacion: inherente a la base Llama-2-7b-chat y potencialmente agravado por la compresion de pesos, que degrada la perplejidad (11,4303 en WikiText-2).
- Idiomas: sin datos. La base esta orientada al ingles; no hay evidencia de comportamiento aceptable en castellano.
- Sesgos: no documentados por el autor; se heredan los del corpus de Llama 2, con el agravante de que la compresion puede alterar de forma impredecible los filtros de seguridad aprendidos.
- Licencia: Llama 2 Community License, con las restricciones de uso comercial, redistribucion y atribucion que impone. Se incluyen `LICENSE.txt` y `USE_POLICY.md`; cualquier uso derivado queda vinculado a ellos.
- No hay garantia de compatibilidad con motores de inferencia optimizados ni de que las herramientas de cuantizacion estandar acepten la estructura de pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_jbbpure_ka2_a1p0_free_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos corresponden a fichas medicas, a un foro sobre contadores 74HC163 y a discusiones sobre prefijos alemanes y ORM de Go, sin relacion con este modelo.
