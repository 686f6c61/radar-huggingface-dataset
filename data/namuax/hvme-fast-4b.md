# namuax/hvme-fast-4b

## Resumen

hvme-fast-4b es un modelo de lenguaje de 4.205.751.296 parametros desarrollado por namuax, obtenido mediante un ajuste fino con LoRA (r=16, fusionado) sobre Qwen/Qwen3.5-4B. No es un modelo conversacional generalista: es un juez de un solo paso (single-pass judge) integrado en hvme, un toolkit de razonamiento causal. Su funcion es responder preguntas de si/no, opcion multiple y puntuacion sobre cantidades causales en un unico forward pass, y derivar a hvme-lm las preguntas en las que no alcanza un umbral de confianza de 0.8.

El modelo resuelve un problema muy concreto: acelerar la evaluacion de consultas causales dentro de un pipeline donde un motor simbolico calcula la cantidad causal y los modelos se limitan a leer la pregunta y llamar al motor. Frente a la ruta lenta (hvme-lm mas el motor), hvme-fast-4b reduce la latencia al resolver la mayoria de casos directamente. La arquitectura subyacente es la de Qwen3.5-4B (transformer causal con tag `qwen3_5_text`), con pesos en safetensors y un repositorio de 8,4 GB.

Es relevante ahora por su enfoque hibrido modelo-herramienta: el modelo esta entrenado para invocar el motor causal de hvme y responder a partir de su resultado, lo que lo aleja del uso como LLM autonomo. Su licencia Apache-2.0 y su compatibilidad con endpoints lo hacen facil de desplegar, aunque su utilidad fuera del ecosistema hvme es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5-4B, tag `qwen3_5_text`) con LoRA r=16 fusionado |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el repo no documenta cuantizaciones) |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer causal denso de 4.205 millones de parametros. Sobre esa base se aplico un LoRA de rango 16 que posteriormente se fusiono en los pesos, de modo que el artefacto publicado es un unico modelo denso sin adaptadores separados. La innovacion no esta en la arquitectura sino en el objetivo de entrenamiento: las salidas del modelo se ajustaron a distribuciones de respuesta destiladas desde la ruta lenta verificada (hvme-lm mas el motor causal) sobre 17.918 elementos de Gym y de preguntas en formato de historia.

El conjunto de entrenamiento es sintetico y formal: SCM binarios, grafos causales y enunciados de independencia. No hay datos publicos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO; el autor solo documenta el proceso de destilacion desde la ruta lenta. Esta version (interna v2-story-distill, 2026-11-12) no fija temperaturas por tarea (`temperature: {}`), por lo que hvme usa las probabilidades crudas y un umbral de confianza de 0.8 para escalar consultas a hvme-lm. El fichero `hvme_fast.json` del repositorio contiene esas temperaturas y los metadatos de entrenamiento.

## Capacidades

- Clasificacion causal de un solo paso: responde preguntas de si/no, opcion multiple y puntuacion sobre cantidades causales en un unico forward pass.
- Llamada al motor causal de hvme: el modelo esta entrenado para invocar la herramienta y responder a partir de su resultado.
- Escalado por confianza: deriva a hvme-lm las preguntas con probabilidad inferior a 0.8.
- Razonamiento sobre SCM binarios, grafos causales y enunciados de independencia condicional.
- Soporte de tool calling / function calling orientado al motor de hvme.
- Capacidades multilingues limitadas a ingles y coreano (el coreano se evaluo con traducciones automaticas).
- No se documentan capacidades de vision, audio, generacion de codigo general ni modo thinking.

## Casos de uso

- Filtrado rapido en pipelines de inferencia causal: el modelo resuelve en un solo paso la mayoria de consultas de si/no y opcion multiple, reduciendo la carga sobre la ruta lenta (hvme-lm mas motor) a solo el subconjunto escalado por debajo del umbral de 0.8.
- Analisis de grafos causales en investigacion: dado un grafo y una consulta de independencia o de conjunto de ajuste, el modelo devuelve una respuesta con probabilidad asociada que puede registrarse y auditarse.
- Evaluacion automatizada de experimentos: integrado en hvme, permite comprobar de forma masiva si una afirmacion causal se sigue de un SCM binario, util para validar pipelines de datos experimentales.
- Enrutado de consultas en un sistema mayor: actua como primera etapa que clasifica y responde lo trivial, y delega lo dudoso, lo que abarata el coste por consulta en despliegues con muchas preguntas causales.
- Docencia y formacion en causalidad: el par modelo-motor permite construir ejercicios interactivos de identificacion de conjuntos de ajuste y de lectura de grafos, con la respuesta verificada por el motor.
- Despliegue en endpoints compatibles: al estar etiquetado como `endpoints_compatible` y con licencia Apache-2.0, puede servirse en infraestructura propia para equipos que ya usan hvme y necesitan el juez rapido en produccion interna.

## Benchmarks y rendimiento

Resultados de precision en un solo paso publicados por el autor:

| Conjunto | hvme-fast-4b |
|---|---|
| CLadder 600 | 0.843 |
| Corr2Cause | 0.797 |
| CauGym yes/no (2.500) | 0.751 |
| CaLM `-B` | 0.725 |
| Gym v3 | 0.933 |

El autor advierte que las repeticiones con distintas semillas mueven los conjuntos externos hasta 3,7 puntos (Corr2Cause) y 1,7 puntos (CauGym). No se proporcionan resultados de benchmarks generalistas como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.205 millones de parametros, en FP16 requiere aproximadamente 8,4 GB de pesos mas overhead de activaciones y cache KV; en cuantizaciones de 8 y 4 bits el requisito baja de forma proporcional, pero el repositorio no publica variantes cuantizadas.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con 16 GB o mas (RTX 4090, A100 40 GB, H100) cubre FP16 con holgura; GPUs consumer de 8-12 GB solo serian viables con cuantizacion, no publicada.
- Cabe en GPU consumer: si, en modelos con 16 GB o mas en FP16; en 8-12 GB requeriria cuantizacion no disponible.
- Opciones de despliegue: transformers (libreria declarada) y el cargador propio `FastJudge` del paquete hvme; el autor menciona ejecuciones con vLLM para las evaluaciones en coreano. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El diseno de un solo forward pass sugiere latencia baja por consulta, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hvme-fast-4b | 4.205.751.296 | No disponible | Juez causal de un paso con tool loop a motor hvme | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | ~4B | No disponible | LLM generalista base | Apache-2.0 | Hugging Face |
| hvme-lm | No disponible | No disponible | Ruta lenta verificada (modelo mas motor) del toolkit hvme | No disponible | Referenciado en el repo hvme |

No se dispone de datos de benchmarks comparativos directos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia del tool loop: sin el motor causal de hvme, el modelo es solo un Qwen3.5-4B ajustado y los resultados de la tabla de benchmarks no aplican.
- Entrenamiento sintetico y formal: cubre SCM binarios, grafos causales e independencias; la causalidad en texto libre y de sentido comun (causalidad de eventos, explicacion causal) es mas debil.
- Evaluacion en coreano poco fiable: los conjuntos son traducciones automaticas; de 74 items de KoCLadder fallados solo en coreano, 22 eran errores o ambiguedades de traduccion y 52 eran fallos reales del modelo (condiciones negadas, interpretacion de "~에 따라 각각" como conjunto de ajuste, paso de conclusion, bucles de repeticion).
- Varianza entre ejecuciones: diferencias de hasta unos 8 items en CLadder 150 y 2 puntos en KMMLU entre entrenamientos; las cifras de KoCLadder son medias de tres ejecuciones con vLLM.
- Riesgo de alucinacion: no documentado explicitamente, pero el modelo responde con probabilidades y delega por umbral, de modo que una calibracion incorrecta del umbral puede producir respuestas erroneas sin escalado.
- Uso responsable: el autor prohibe explicitamente su uso para decisiones medicas, legales o de politicas sin una persona que revise el grafo y las suposiciones.
- Licencia: Apache-2.0, igual que el modelo base y el codigo de hvme, por lo que el uso comercial esta permitido con las obligaciones habituales de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namuax/hvme-fast-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del toolkit hvme: https://github.com/namuax/hvme
