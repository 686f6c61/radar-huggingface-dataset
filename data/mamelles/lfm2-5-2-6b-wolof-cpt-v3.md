# mamelles/LFM2.5-2.6B-Wolof-CPT-v3

## Resumen

LFM2.5-2.6B-Wolof-CPT-v3 es un ajuste por preentrenamiento continuado (CPT, continual pretraining) del modelo base LiquidAI/LFM2.5-2.6B-Base, especializado en la adaptación al idioma wolof (codigo ISO `wo`). Lo publica el usuario mamelles en HuggingFace y se distribuye como un artefacto de produccion privada, marcado explicitamente por el autor como experimental y no como un lanzamiento publico estable. No es un modelo entrenado desde cero, sino una adaptacion linguistica sobre una base ya existente de la familia LFM2.5 de Liquid AI.

El modelo cuenta con 2.705.390.592 parametros totales (segun los pesos en safetensors) y un repositorio de 5,4 GB, lo que situa su huella en el rango de los modelos densos de ~2,7B. La model card no declara explicitamente si la arquitectura es densa o de mezcla de expertos (MoE), aunque la etiqueta `lfm2` remite a la familia Liquid Foundation Models de Liquid AI, caracterizada por arquitecturas hibridas. Los detalles concretos de la arquitectura, la longitud de contexto y el tokenizador mas alla de la familia `128k-ext` no se especifican en la informacion disponible.

Su relevancia actual reside en el nicho de la adaptacion de modelos compactos a lenguas de bajos recursos como el wolof, hablado principalmente en Senegal, Gambia y Mauritania. El autor declara metricas de evaluacion propias (BPB, perplejidad, BLEU y chrF) sobre un corpus de prueba de wolof, lo que lo convierte en un artefacto util para investigacion de adaptacion linguistica, no para despliegues de produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia Liquid Foundation Models); detalles concretos no disponibles |
| Parametros totales | 2.705.390.592 |
| Parametros activos | no disponible (no se declara si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors) |
| Idiomas soportados | wolof (`wo`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `LiquidAI/LFM2.5-2.6B-Base` y se somete a una etapa de preentrenamiento continuado (CPT) sobre un corpus limpio de wolof. La model card indica que la etapa de entrenamiento supero las puertas automaticas registradas en `training_manifest.json`, sin que el autor reclame ninguna otra garantia de calidad no documentada. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

En cuanto al tokenizador, el artefacto pertenece a la familia `128k-ext`. La model card advierte de forma explicita que las metricas BPB especificas de una familia de tokenizador no deben compararse como perplejidad entre las familias de 65k y 128k. Se senala tambien una advertencia sobre los datos: el preentrenamiento continuado usa el protocolo de corpus limpio de wolof y los datos de instruccion estan reponderados, excluyendo el split de test del Hub de origen, aunque se reconoce que pueden haber existido ejemplos similares a los de evaluacion en el preentrenamiento previo. Las filas privadas en bruto no se incluyen en el repositorio.

## Capacidades

- Generacion de texto en wolof: es la funcion principal para la que fue adaptado el modelo.
- Modelado de lenguaje causal: la evaluacion se realiza mediante `evaluate_clm.py` con perplejidad y BPB.
- Traduccion o generacion verbalizada: las metricas BLEU y chrF indican evaluacion sobre tareas de texto verbalizado de 100 pares.
- Conversacion: la etiqueta `conversational` sugiere soporte de formato conversacional, aunque no se detalla su comportamiento.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en infraestructura de inferencia gestionada.
- Razonamiento, codigo, matematicas, vision, tool calling, agentes y modo de pensamiento: no declarados en la informacion disponible.
- Capacidades multilingues: limitadas al wolof segun el campo de idioma declarado.

## Casos de uso

- Investigacion en adaptacion linguistica: el modelo sirve como punto de partida para estudiar tecnicas de CPT sobre lenguas de bajos recursos, comparando sus metricas BPB y perplejidad frente al modelo base.
- Evaluacion comparativa de tokenizadores: al pertenecer a la familia `128k-ext`, permite analizar el impacto del tokenizador en metricas normalizadas por byte (BPB) frente a otras familias.
- Generacion de texto asistida en wolof: puede emplearse para producir borradores de texto en wolof en contextos de investigacion, siempre con revision de hablantes nativos.
- Traduccion automatica como componente: las metricas BLEU y chrF sugieren utilidad potencial como modulo de generacion o post-edicion dentro de un sistema de traduccion hacia el wolof.
- Creacion de corpus sinteticos: puede generar texto en wolof para aumentar datasets de entrenamiento de otros sistemas, con las debidas precauciones por sesgos y alucinaciones.
- Punto de partida para ajuste fino supervisado: al ser un modelo base adaptado, es candidato para posteriores etapas de SFT orientadas a tareas concretas.
- Banco de pruebas de seguridad y ortografia en wolof: dado que el autor reconoce que la ortografia y la seguridad no han sido validadas, sirve para disenar protocolos de evaluacion especificos del idioma.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor del modelo en la model card y el model-index. Corresponden al corpus de prueba "Wolof CLM corpus test (verbalized)", split `test`, y estan marcados como no verificados (`verified: false`).

| Metrica | Valor | Notas |
|---|---:|---|
| BPB (Bits Per Byte, gold cross-tokenizer) | 1,3295 | Metrica principal entre tokenizadores |
| Perplejidad | 48,0 | Solo valida con el mismo tokenizador |
| BLEU (100 pares verbalizados) | 4,57 | Evaluacion de generacion |
| chrF (100 pares verbalizados) | 22,87 | Evaluacion de generacion |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,4 GB en FP16, en torno a 2,7 GB en INT8 y cerca de 1,5-1,8 GB en cuantizacion de 4 bits, calculado a partir de los 2,7B de parametros (estimacion propia, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16; para INT8 o 4 bits bastan GPU de 4-8 GB.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, especialmente con cuantizacion.
- Opciones de despliegue: al usar `transformers` y safetensors, es compatible con HuggingFace Transformers; el soporte en vLLM, llama.cpp o Ollama no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma objetivo | Licencia | Rendimiento en wolof |
|---|---|---|---|---|---|
| LFM2.5-2.6B-Wolof-CPT-v3 | 2,71B | no disponible | Wolof | no disponible | BPB 1,3295; ppl 48,0; BLEU 4,57; chrF 22,87 |
| LiquidAI/LFM2.5-2.6B-Base | 2,6B (segun nombre) | no disponible | Multilingue | no disponible | no disponible |
| Otras adaptaciones al wolof de ~2-3B | no disponible | no disponible | Wolof | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos numericos de modelos comparables de la misma categoria para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo declara artefacto de produccion privada en fase experimental y no un lanzamiento publico.
- Ortografia del wolof no validada: la model card advierte que la ortografia no ha sido revisada de forma exhaustiva.
- Cambio de codigo (code-switching) no validado.
- Factualidad no comprobada: riesgo de alucinacion no cuantificado.
- Razonamiento y comportamiento de contexto largo no validados.
- Seguridad no evaluada de forma exhaustiva.
- Se requiere revision de hablantes nativos antes de un uso mas amplio.
- Riesgo de contaminacion: el autor reconoce que pueden haber existido ejemplos similares a los de evaluacion en el preentrenamiento previo.
- Licencia no especificada: no puede confirmarse la viabilidad de uso comercial.
- Metrica de perplejidad solo comparable dentro del mismo tokenizador; el BPB es la metrica correcta entre familias.
- Los resultados de la busqueda web realizada no son relevantes para este modelo (corresponden al termino anatomico "mamelle") y no aportan informacion tecnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mamelles/LFM2.5-2.6B-Wolof-CPT-v3
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B-Base
- Fuente de las metricas citadas por el autor: https://huggingface.co/Tonic/LFM2.5-2.6B-Wolof-CPT-v3/blob/main/metrics.json
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
