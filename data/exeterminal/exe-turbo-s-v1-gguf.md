# exeterminal/Exe-Turbo-S-V1-GGUF

## Resumen

Exe Turbo S v1 es un ajuste fino del modelo base LiquidAI/LFM2.5-8B-A1B, distribuido en formato GGUF por el usuario exeterminal bajo la marca Exe AI. Se trata de un modelo de mezcla de expertos (MoE) con 8,3 mil millones de parametros en disco y aproximadamente 1,5 mil millones activos por token, disenado especificamente para ejecutarse en portatiles con 6-8 GB de memoria. Su proposito no es el chat generalista, sino actuar como el modelo de agente detras de la aplicacion Exe AI, tomando decisiones correctas sobre herramientas (tool calling), lectura de ficheros, ejecucion en segundo plano y defensa frente a inyeccion de prompts.

El modelo se entrena mediante un adaptador LoRA de rango 16 sobre el modelo base en bf16, con la mascara de prompt aplicada a la perdida, y posteriormente se fusiona y cuantiza en multiples variantes GGUF. La variante recomendada por el autor es Q4_K_M (5,2 GB), que segun sus mediciones iguala el rendimiento del fichero de precision completa en el conjunto de evaluacion propio.

Es relevante porque ejemplifica una tendencia practica: especializar modelos pequenos de arquitectura eficiente para tareas de agente muy concretas, en lugar de desplegar modelos grandes generalistas. No obstante, la evaluacion es interna y limitada a 72 casos propios, por lo que las cifras deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, con proyecciones de atencion y convolucion corta; 32 expertos por capa |
| Parametros totales | 8.467.856.832 (aproximadamente 8,3B) |
| Parametros activos | Aproximadamente 1,5B por token |
| Longitud de contexto | 128k tokens (heredada del modelo base) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (recomendada), Q4_K_S, IQ4_XS, IQ3_M (minimo) |
| Idiomas soportados | Ingles (declarado); el autor advierte que la prosa en otros idiomas se degrada por debajo de 4 bits |
| Licencia | LFM 1.0 (no Apache), heredada del modelo base; incluye condiciones por umbral de ingresos |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de LFM2.5-8B-A1B, una arquitectura MoE en la que cada capa contiene 32 expertos fusionados en un unico bloque de matrices apiladas, junto con proyecciones de atencion y de convolucion corta. El ajuste se realizo con un adaptador LoRA de rango 16 y alpha 16 sobre el modelo base completo en bf16, enmascarando el prompt en la funcion de perdida para que el modelo aprendiera el comportamiento y no el texto de entrada. El adaptador se fusiono de vuelta en el modelo base y todas las variantes GGUF derivan de ese modelo fusionado.

Un detalle tecnico relevante es que el adaptador solo afecta a las proyecciones de atencion y de convolucion corta, es decir, la ruta por la que pasa cada token; las capas de expertos no se modifican porque, al estar fusionadas en bloques apilados, las herramientas estandar de LoRA no pueden envolverlas. El router se excluyo deliberadamente. El total de parametros entrenables fue de 5,7 millones. El entrenamiento se detuvo automaticamente en la epoca 1,1 de 3 planificadas al caer la perdida por debajo de 0,2, con una perdida de validacion de 0,2538 en ese punto, el mejor valor registrado. Todas las builds incorporan una importance matrix (imatrix) calculada sobre el mismo conjunto de calibracion usado en el resto de modelos Exe.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a tareas de agente.
- Tool calling y function calling: seleccion de la herramienta correcta y de sus parametros a partir de esquemas proporcionados en el prompt.
- Uso correcto de herramientas de fichero frente a atajos de shell.
- Gestion de ejecuciones largas en segundo plano.
- Tratamiento de texto devuelto por herramientas como datos y no como instrucciones (defensa frente a inyeccion de prompts).
- Formulacion de una pregunta breve y concreta ante peticiones ambiguas.
- Compatibilidad con servidores compatibles con la API de OpenAI (por ejemplo, llama-server).
- No se declaran capacidades de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Agente de escritorio integrado en una aplicacion: el modelo puede gestionar la seleccion de herramientas y la lectura de ficheros locales en maquinas con 6-8 GB de memoria, que es el escenario para el que fue disenado.
- Asistente de operaciones sobre ficheros: dado un esquema de herramientas de sistema de ficheros, el modelo elige leer, listar o mover en lugar de recurrir a comandos de shell, reduciendo riesgos de ejecucion accidental.
- Automatizacion de tareas largas: el modelo inicia procesos en segundo plano en lugar de bloquear la conversacion, adecuado para pipelines que lanzan trabajos de larga duracion.
- Defensa frente a inyeccion de prompts en entornos con contenido no confiable: al tratar el texto devuelto por herramientas como datos, es apropiado para agentes que leen paginas web, correos o documentos de terceros.
- Prototipado de agentes en portatiles de desarrollo: con la variante Q4_K_M (5,2 GB) puede ejecutarse en local con llama.cpp u Ollama sin GPU de gama alta.
- Despliegue en servidores compatibles con OpenAI: puede sustituir al modelo de chat en backends existentes sin cambiar la capa de integracion, gracias a su compatibilidad con endpoints.
- Clasificacion y enrutado de intenciones con llamada a herramienta: util en asistentes de soporte que necesitan decidir que accion ejecutar y con que parametros.

## Benchmarks y rendimiento

Los unicos datos publicados son los del conjunto interno de evaluacion del autor (casos Exe AI, temperature 0.1), medidos sobre la build f16 antes de cuantizar.

| Modelo / build | Casos superados | Porcentaje |
|---|---:|---:|
| LFM2.5-8B-A1B sin entrenar | 38 / 72 | 53% |
| Exe Turbo S v1 (f16) | 67 / 72 | 93% |

Rendimiento por cuantizacion sobre el mismo conjunto de 72 casos:

| Fichero | Tipo | Bits | Tamano | Casos |
|---|---|---:|---:|---:|
| f16 | Precision completa | 16 | 16,9 GB | 67 / 72 |
| Q8_0 | K/legacy | 8 | 9,0 GB | 65 / 72 |
| Q6_K | K-quant | 6,5 | 7,0 GB | 66 / 72 |
| Q5_K_M | K-quant | 5,5 | 6,0 GB | 67 / 72 |
| Q4_K_M | K-quant (recomendada) | 4,8 | 5,2 GB | 67 / 72 |
| Q4_K_S | K-quant | 4,5 | 4,9 GB | 64 / 72 |
| IQ4_XS | I-quant | 4,25 | 4,6 GB | 63 / 72 |
| IQ3_M | I-quant (minimo) | 3,66 | 3,8 GB | 66 / 72 |

El autor indica ademas una mejora en defensa frente a inyeccion de prompts de 0/4 a 4/4 casos. En la escalera de versiones, sobre 101 casos retenidos con criterio pass^3, la base sin entrenar obtiene 52, la version 1 obtiene 66, la version 2 obtiene 76 y la version 3 obtiene 78. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,2 GB para Q4_K_M; 3,8 GB para IQ3_M; 16,9 GB para f16.
- Memoria objetivo declarada por el autor: portatiles con 6-8 GB de memoria.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por tamano, la variante Q4_K_M es apta para GPU de consumo con 8 GB o mas; f16 requiere GPU de 24 GB o superior.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M; las variantes IQ3_M e IQ4_XS reducen aun mas el requisito.
- Opciones de despliegue: llama.cpp (llama-server), Ollama y cualquier servidor compatible con la API de OpenAI. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor solo indica temperature 0.1 para tareas de herramienta y contexto de 128k heredado del base.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Exe Turbo S v1 | 8,3B | ~1,5B | 128k | LFM 1.0 | Especializado en agente y tool use; evaluacion interna de 72 casos |
| LiquidAI/LFM2.5-8B-A1B | 8,3B | ~1,5B | 128k | LFM 1.0 | Modelo base generalista; 38/72 en los casos Exe AI |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos comparables en la informacion disponible |

La comparacion mas directa y documentada es con su propio modelo base: el ajuste mejora de 38/72 a 67/72 en el conjunto interno, a costa de especializarse y perder utilidad como chat general.

## Limitaciones y advertencias

- Es un especialista: fuera de un agente con herramientas rinde como el modelo base con un sesgo leve; el propio autor recomienda usar el base para chat general.
- La evaluacion procede de un conjunto interno de 72 casos disenado por el mismo autor, sin benchmarks publicos independientes; el 93% no es comparable con cifras de MMLU o HumanEval.
- Idiomas: solo se declara ingles. La prosa en otros idiomas se degrada notablemente por debajo de la clase de 4 bits, incluso cuando las llamadas a herramienta siguen siendo correctas.
- Riesgo de alucinacion: no se documenta de forma especifica, pero al ser un modelo de 1,5B activos es esperable una capacidad limitada de conocimiento factual.
- Licencia LFM 1.0, no Apache: incluye condiciones aplicables por encima de un umbral de ingresos. Debe revisarse antes de cualquier uso comercial.
- Las builds por debajo de IQ3_M se retiraron por roturas en medicion (48-50/72, con fallos en el grupo de inyeccion de prompts); no deben usarse.
- El adaptador no modifica las capas de expertos ni el router, por lo que la especializacion se limita a las proyecciones de atencion y convolucion corta.
- El repositorio ocupa 84,7 GB en total por acumulacion de variantes; conviene descargar solo el fichero necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/exeterminal/Exe-Turbo-S-V1-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/main/LICENSE
- Sitio del autor: https://exe-hq.net
