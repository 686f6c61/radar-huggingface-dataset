# Jeesup/svd-safety-l2_remove40_sigma_b010

## Resumen

`Jeesup/svd-safety-l2_remove40_sigma_b010` es un checkpoint de investigacion derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado compresion por descomposicion en valores singulares mediante el metodo SVD-LLM. Concretamente, se elimino el 39,03% de los parametros densos (quedando un 61,0% de los originales) y despues se restauro un presupuesto del 1,000% de parametros densos en forma de componentes SVD seleccionados con la regla denominada `sigma`, lo que supone 5472 componentes restaurados y una fraccion de parametros resultante de 0,6097. El autor lo publica como una celda de una rejilla experimental sobre reglas de seleccion y presupuestos de restauracion.

El proposito del artefacto no es conversacional: forma parte de un estudio sobre como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. La model card es explicita al respecto, indicando que es un sujeto experimental y no un asistente desplegable.

Por su naturaleza, el interes es acotado y metodologico: sirve para reproducir y auditar el trade-off entre seguridad y utilidad bajo compresion, y para comparar metricas de ataque exitoso (`AdvBench` ASR 0,2981; `StrongREJECT` ASR 0,1597), sobre-rechazo (`WildGuard` macro over-refusal 0,1383) y calidad de lenguaje (`WikiText-2` perplexity 11,1387). No se han publicado resultados de benchmarks de capacidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con pesos comprimidos mediante SVD-LLM |
| Parametros totales | 6.738.415.616 segun safetensors del repositorio; la model card declara una fraccion de parametros resultante de 0,6097 respecto al denso |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base Llama-2-7b-chat-hf; no se indica modificacion en la model card) |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene safetensors; no se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible en la informacion proporcionada; el modelo base esta optimizado principalmente para ingles |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |

Datos adicionales de procedencia declarados por el autor: base sin comprimir `meta-llama/Llama-2-7b-chat-hf`, compresion SVD-LLM con 39,03% de parametros eliminados, regla de seleccion `sigma`, presupuesto de restauracion 1,000% de parametros densos, 5472 componentes restaurados, 0 componentes sustituidos y semilla 42.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion con RoPE. Sobre ese checkpoint no hay un entrenamiento adicional en el sentido habitual: la intervencion es de compresion y, parcialmente, de restauracion de componentes. SVD-LLM aplica descomposicion en valores singulares a las matrices de pesos y trunca componentes de forma consciente del error de truncamiento; en esta celda se elimina el 39,03% de los parametros y posteriormente se reintroducen 5472 componentes de bajo rango seleccionados con la regla `sigma`, lo que eleva la fraccion final a 0,6097 del denso.

No se documenta en la informacion disponible composicion de dataset, numero de tokens de entrenamiento, ni uso de RLHF/DPO en esta derivacion; el alineamiento presentes procede del checkpoint original Llama-2-7b-chat-hf, no de un proceso nuevo. Tampoco se describen innovaciones de decodificacion (especulativa, atencion lineal u otras). La innovacion tecnica de la linea de trabajo es la regla de seleccion de componentes que decide que direcciones singulares restaurar bajo un presupuesto fijo.

Una advertencia tecnica relevante: el recuento de parametros de los safetensors (6.738.415.616) coincide con el del Llama-2-7b-chat sin comprimir y el repositorio ocupa 13,5 GB, coherente con pesos en fp16 a forma densa. Esto sugiere que el checkpoint conserva las formas originales (componentes anulados o factorizacion almacenada en las dimensiones completas), por lo que la reduccion declarada del 39,03% no se traduce necesariamente en un ahorro de memoria en disco o VRAM y conviene verificarlo antes de asumir ganancias de despliegue.

## Capacidades

- Generacion de texto conversacional en el estilo de Llama-2-7b-chat, con calidad degradada respecto al modelo original (perplexity WikiText-2 de 11,1387 medida en esta celda).
- Razonamiento, codigo y matematicas heredados del modelo base, pero sin mediciones publicadas en esta ficha.
- Respuesta a instrucciones y formato conversacional multi-turno, sujeto a la ventana de contexto del modelo base.
- Capacidad de rechazo de peticiones daninas reducida o alterada: los propios autores indican que varias celdas de la rejilla estan deliberadamente degradadas en seguridad.
- Tool calling y function calling: no disponible (no se documenta soporte explicito; Llama-2-chat no incorpora un formato nativo de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta ni se evalua).
- Capacidades multilingues: no disponibles; el modelo base esta orientado a ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Uso como objeto de medida: apto para calcular ASR con jueces HarmBench, sobre-rechazo con WildGuard y perplexity con WikiText-2.

## Casos de uso

- Investigacion sobre degradacion de seguridad por compresion: usar el checkpoint como celda experimental para cuantificar cuanto aumenta la tasa de exito de ataque (AdvBench ASR 0,2981 y StrongREJECT ASR 0,1597) respecto al Llama-2-7b-chat sin comprimir.
- Reproducibilidad de estudios SVD-LLM: comparar la regla `sigma` con otras reglas del mismo grid bajo presupuestos de restauracion equivalentes, usando la semilla 42 y los 5472 componentes documentados para replicar el resultado.
- Auditoria de sobre-rechazo: medir el macro over-refusal con WildGuard (0,1383) para comprobar si la restauracion de componentes recupera respuestas legitimas sin reabrir fallos de seguridad.
- Analisis de calidad de lenguaje tras compresion: monitorizar la perplexity en WikiText-2 (11,1387) como indicador de dano en la modelizacion y correlacionarlo con las metricas de seguridad.
- Evaluacion comparativa de artefactos comprimidos: incluirlo como baseline experimental en un pipeline automatizado con HarmBench y WildGuard frente a otras tecnicas de poda o cuantizacion.
- Estudio de factibilidad de despliegue: analizar si la compresion conservada en formas densas ofrece ventajas reales de latencia o memoria, o si el coste efectivo es identico al del modelo de 7B.
- Docencia y divulgacion tecnica: ilustrar en un curso de interpretabilidad el trade-off entre compresion, utilidad y alineamiento con metricas verificables.
- Punto de partida para investigacion en reparacion de seguridad: aplicar tecnicas de realineamiento sobre un checkpoint degradado y medir la recuperacion de ASR, siempre fuera de entornos de produccion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2981 |
| StrongREJECT ASR (juez HarmBench) | 0,1597 |
| Macro over-refusal (WildGuard) | 0,1383 |
| WikiText-2 perplexity | 11,1387 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con el modelo base en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 13,5-15 GB solo para pesos, mas cache KV; con 4096 tokens de contexto el consumo adicional es moderado. La estimacion asume que el checkpoint se almacena a forma densa, como sugieren los safetensors.
- VRAM estimada en int8: aproximadamente 7-8 GB de pesos.
- VRAM estimada en 4 bits: aproximadamente 4-5 GB de pesos.
- GPU de centro de datos: A100 40/80 GB, H100, L40S y A10G funcionan sin problema; la A10G de 24 GB permite fp16 con contexto completo.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 de 24 GB en fp16; en RTX 4080/4070 Ti de 16 GB es viable en int8; en tarjetas de 8-12 GB requeriria cuantizacion a 4 bits.
- Opciones de despliegue: `transformers` de forma nativa; el tag `endpoints_compatible` y la libreria declarada permiten TGI e Inference Endpoints; vLLM es viable cargando los pesos safetensors; llama.cpp y Ollama requeririan convertir a GGUF, no publicado.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento comparado | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove40_sigma_b010` | 6,74B segun safetensors; fraccion declarada 0,6097 del denso | 4096 tokens | Llama 2 Community License | AdvBench ASR 0,2981; StrongREJECT ASR 0,1597; over-refusal 0,1383; WikiText-2 ppl 11,1387 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `meta-llama/Llama-2-7b-chat-hf` (base sin comprimir) | 6,74B | 4096 tokens | Llama 2 Community License | No disponible en la informacion proporcionada con el mismo juez y protocolo | HuggingFace |
| `mistralai/Mistral-7B-Instruct-v0.2` | 7,24B | 32768 tokens | Apache 2.0 | No disponible en la informacion proporcionada | HuggingFace |

Nota: los datos de contexto, parametros y licencia de `meta-llama/Llama-2-7b-chat-hf` y de `Mistral-7B-Instruct-v0.2` proceden de informacion publica de esos modelos y no del material facilitado en esta busqueda; no se dispone de comparaciones de rendimiento medidas bajo el mismo protocolo. Otras celdas del grid del mismo autor serian los comparadores mas directos, pero no se han proporcionado sus metricas.

## Limitaciones y advertencias

- No es un modelo de proposito general: la model card indica explicitamente que es un artefacto de investigacion y que no debe tratarse como un asistente desplegable.
- Seguridad degradada de forma deliberada: la compresion por si sola eleva la tasa de exito de ataque; el AdvBench ASR de 0,2981 es sustancialmente alto para un modelo derivado de un checkpoint alineado.
- Riesgo de sobre-rechazo: el macro over-refusal de 0,1383 implica que una fraccion relevante de peticiones legitimas puede recibir una negativa.
- Degradacion de calidad de lenguaje: la perplexity de 11,1387 en WikiText-2 es peor que la de un Llama-2-7b sin comprimir.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; la compresion de pesos puede agravar el fenomeno, pero no hay datos al respecto.
- Discrepancia entre el ahorro declarado y el almacenamiento real: el recuento de safetensors y el tamano del repositorio (13,5 GB) apuntan a formas densas, por lo que no debe asumirse una reduccion de memoria efectiva.
- Idiomas: no se declaran idiomas soportados; el comportamiento fuera del ingles no esta evaluado.
- Licencia: uso sujeto a la Llama 2 Community License y al `USE_POLICY.md` incluidos en el repositorio, con las restricciones de uso comercial y de escala que impone esa licencia.
- Uso en produccion: desaconsejado. Cualquier evaluacion debe realizarse en entornos aislados y con protocolos de red teaming supervisados.
- Trazabilidad limitada: 0 descargas y 0 likes, sin resultados de terceros que permitan contrastar las metricas declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_sigma_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de SVD-LLM: no disponible en la informacion proporcionada (la model card no enlaza la publicacion del metodo)
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo o espacio de inferencia: no disponible
- Otra documentacion: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre SVD-LLM; los unicos resultados obtenidos trataban sobre portadas de historias destacadas de Instagram y no guardan relacion con el artefacto.
