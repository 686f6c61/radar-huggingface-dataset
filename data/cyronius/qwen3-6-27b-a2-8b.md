# Cyronius/Qwen3.6-27B-A2.8B

## Resumen

Qwen3.6-27B-A2.8B es un derivado podado, reparado mediante LoRA y cuantizado del modelo Qwen/Qwen3.6-35B-A3B, desarrollado por el autor independiente Cyronius. El objetivo declarado es el de obtener un modelo de decodificacion rapida que pueda ejecutarse en hardware de memoria compartida (CPU e iGPU, sin GPU dedicada), sacrificando parte de la calidad del modelo original a cambio de un menor tamano y una mayor velocidad de generacion.

Partiendo de una arquitectura MoE de 40 capas, se eliminaron estructuralmente 10 capas (una de cada tres capas gated-DeltaNet), lo que reduce el nucleo del modelo de lenguaje de 34,7B a 26,2B parametros totales y los parametros activos por token de 3,45B a 2,83B. Posteriormente se aplico un LoRA de rango 32 (unos 33M de parametros entrenables) para recuperar calidad, y el resultado se cuantizo a GGUF con una imatrix calibrada.

El modelo es relevante porque conserva la cabeza de prediccion multi-token (MTP) del modelo base, lo que permite decodificacion especulativa en llama.cpp, y porque ofrece dos builds GGUF (16,49 GB y 12,01 GB) orientados explicitamente a despliegues sin GPU discreta. La licencia Apache-2.0 heredada del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas gated-DeltaNet (derivada de Qwen3.6-35B-A3B), podada de 40 a 30 capas |
| Parametros totales | 27.078.241.536 (27,08B en safetensors); 26,2B en el nucleo del modelo de lenguaje segun la model card |
| Parametros activos | 2,83B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M con imatrix; IQ3_S en expertos enrutados + Q4_K en `lm_head` (build speed-demon) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo mezcla de expertos (MoE) con 40 capas, de las cuales una parte son capas gated-DeltaNet. El proceso de derivacion consistio en eliminar estructuralmente una de cada tres capas gated-DeltaNet, pasando de 40 a 30 capas. Sobre esa estructura podada se entreno un LoRA de rango 32 con aproximadamente 33M de parametros entrenables, a un coste declarado de unos 53 USD de tiempo de H200, utilizando una mezcla de texto general, datos de uso de herramientas y datos de razonamiento al estilo GSM8K. Este proceso de "curacion" (healing) cubrio aproximadamente medio epoch, con 18.000 prompts y 16M de tokens.

La innovacion tecnica mas destacable es la conservacion de la cabeza de prediccion multi-token (MTP) del modelo base en ambas builds GGUF, lo que habilita decodificacion especulativa en llama.cpp mediante `--spec-type draft-mtp`. El autor advierte que esta decodificacion especulativa no es bit-exacta respecto a la decodificacion plana: en una comprobacion de 40 casos obtuvo 37/40 frente a 39/40. La cuantizacion se realizo con una imatrix calibrada, compartida por ambas builds, que difieren unicamente en el nivel de cuantizacion de los tensores de expertos enrutados y de la cabeza de salida.

## Capacidades

- Generacion de texto conversacional y continuacion de texto (`pipeline_tag: text-generation`).
- Razonamiento matematico basico, evaluado con GSM8K (precision de 0,80 en la build balanced y 0,733 en la speed-demon).
- Conocimiento general, evaluado con MMLU (0,733 en balanced y 0,767 en speed-demon).
- Tool calling / function calling: capacidad destacada del modelo, con una puntuacion de 0,95 en casos de uso agéntico de herramientas en la build balanced y 0,90 en la speed-demon. La evaluacion comprueba si el modelo invoca la herramienta correcta con los argumentos correctos o si declina correctamente.
- Integracion con llama.cpp y llama-server, con soporte de decodificacion especulativa MTP.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de herramientas en local sin GPU dedicada: el modelo esta disenado para decodificacion rapida en CPU e iGPU, por lo que encaja en estaciones de trabajo o portatiles sin GPU discreta que necesiten invocar funciones y APIs mediante tool calling con una precision declarada de 0,95.
- Automatizacion de agentes con llamadas a funciones: la puntuacion de tool calling y el soporte de llama-server permiten montar agentes que seleccionen herramientas y construyan argumentos en pipelines de automatizacion internos.
- Prototipado y desarrollo en entornos con memoria compartida: los builds de 16,49 GB y 12,01 GB permiten ejecutar el modelo en maquinas con RAM abundante pero sin VRAM dedicada, acelerando la iteracion sobre prompts y esquemas de herramientas.
- Razonamiento matematico de nivel escolar y verificacion de calculos: con una precision GSM8K de 0,80 en la build balanced, es adecuado para tareas de resolucion de problemas aritmeticos y de varios pasos en entornos educativos o de validacion.
- Generacion de texto y resumenes en aplicaciones de escritorio: al ejecutarse en llama.cpp, puede integrarse en aplicaciones de escritorio o utilidades CLI que necesiten generacion de texto sin depender de servicios en la nube.
- Despliegue con decodificacion especulativa para reducir latencia: la cabeza MTP retenida permite activar `--spec-type draft-mtp --spec-draft-n-max 2` en llama-server, lo que resulta util en aplicaciones interactivas sensibles a la latencia de decodificacion.
- Evaluacion comparativa de tecnicas de poda y curacion LoRA: el modelo sirve como referencia practica para investigadores que quieran reproducir el flujo de poda estructural, curacion con LoRA y cuantizacion con imatrix descrito en el repositorio del autor.

## Benchmarks y rendimiento

Resultados publicados por el autor. La columna de herramientas mide la precision en casos de uso agéntico de herramientas; GSM8K y MMLU son precision estandar; la perplejidad se calcula sobre wikitext-2 (32 fragmentos, contexto 512, herramienta `perplexity` de llama.cpp); decode y tool decode son tokens por segundo.

| Modelo | Tamano | Tools | GSM8K | MMLU | PPL | Decode (tok/s) | Tool decode (tok/s) |
|---|---:|---:|---:|---:|---:|---:|---:|
| balanced (Q4_K_M) | 16,49 GB | 0,95 | 0,80 | 0,733 | 8,01 | 36,8 | 40,7 |
| speed-demon (expertos IQ3_S) | 12,01 GB | 0,90 | 0,733 | 0,767 | 8,29 | 40,7 | 44,1 |
| base Q4_K_M (Qwen3.6-35B-A3B, referencia) | 21,17 GB | 0,90 | 0,933 | 0,767 | 5,50 | 27,8 | 27,9 |

El autor advierte que la velocidad de decodificacion vario entre ejecuciones repetidas y que esas columnas deben interpretarse como orientativas, no exactas. Los registros completos estan en `bench/results/` del repositorio de GitHub.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 16,49 GB para la build Q4_K_M y 12,01 GB para la build IQ3_S. Al estar pensado para memoria compartida, estos requisitos se cubren con RAM del sistema o memoria unificada, no necesariamente con VRAM dedicada.
- GPU recomendadas: no disponible. El modelo esta disenado explicitamente para CPU e iGPU sin GPU discreta; no se documentan recomendaciones de GPU dedicadas.
- Cabe en GPU de consumo: no disponible como dato confirmado; por tamano de fichero, la build de 12,01 GB podria cargarse en GPUs con 16 GB o mas de VRAM, pero el autor no lo documenta.
- Opciones de despliegue: llama.cpp y llama-server, con una build que soporte MTP. Se recomienda `llama-server -m qwen36-27b-a2.8b-mtp-Q4KM.gguf --spec-type draft-mtp --spec-draft-n-max 2`.
- Latencia y throughput: 36,8 tok/s de decodificacion y 40,7 tok/s en generacion con tool calling para la build balanced; 40,7 tok/s y 44,1 tok/s respectivamente para la speed-demon, segun las mediciones del autor.
- Numero de expertos enrutados: se recomienda mantener el valor por defecto `k=8`; reducirlo no produjo una ganancia de velocidad reproducible en las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Tools | GSM8K | MMLU | PPL | Licencia |
|---|---:|---:|---|---:|---:|---:|---:|---|
| Qwen3.6-27B-A2.8B balanced | 27,08B (26,2B LM) | 2,83B | no disponible | 0,95 | 0,80 | 0,733 | 8,01 | Apache-2.0 |
| Qwen3.6-27B-A2.8B speed-demon | 27,08B (26,2B LM) | 2,83B | no disponible | 0,90 | 0,733 | 0,767 | 8,29 | Apache-2.0 |
| Qwen3.6-35B-A3B (base, Q4_K_M) | 34,7B (LM) | 3,45B | no disponible | 0,90 | 0,933 | 0,767 | 5,50 | Apache-2.0 |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La curacion con LoRA cubrio aproximadamente medio epoch (18.000 prompts, 16M tokens); GSM8K sigue por debajo del modelo base (0,80 frente a 0,933) y la perplejidad recupero la mayor parte del camino pero no en su totalidad (8,01 frente a 5,50).
- La build speed-demon sacrifica precision en tool calling (0,90 frente a 0,95) y en GSM8K (0,733 frente a 0,80) a cambio de menor tamano y mayor velocidad.
- La decodificacion especulativa MTP no es bit-exacta respecto a la decodificacion plana: 37/40 frente a 39/40 en una comprobacion de 40 casos. Funcionalmente equivalente, pero no se garantiza identidad.
- Reducir el numero de expertos enrutados (`k`) por debajo de 8 no aporto una ganancia de velocidad reproducible y no se recomienda.
- La evaluacion se realizo sobre un benchmark interno pequeno (7 esquemas de herramientas y subconjuntos de GSM8K/MMLU), por lo que los resultados pueden no generalizarse a otras cargas de trabajo.
- Riesgo de alucinacion: no documentado explicitamente en la model card; aplicable el riesgo habitual de los modelos de lenguaje.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada; no se documenta cobertura multilingue.
- Longitud de contexto: no disponible en la informacion proporcionada; conviene verificarla antes de desplegar en produccion con ventanas largas.
- Licencia Apache-2.0, heredada del modelo base, sin restricciones adicionales documentadas para uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/Cyronius/Qwen3.6-27B-A2.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio con codigo, resultados y registro de experimentos: https://github.com/Cyronius/model-experiments
