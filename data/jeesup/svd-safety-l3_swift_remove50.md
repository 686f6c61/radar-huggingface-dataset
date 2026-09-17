# Jeesup/svd-safety-l3_swift_remove50

## Resumen

`Jeesup/svd-safety-l3_swift_remove50` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido con la tecnica SVD-LLM, que elimina el 50,00 % de los parametros densos mediante descomposicion en valores singulares. Sobre ese modelo comprimido no se restauro ningun componente (presupuesto de restauracion del 0,000 %, cero componentes restaurados) y la regla de seleccion aplicada figura como `unknown` en la model card. El artefacto forma parte de un grid experimental sobre reglas de seleccion de componentes y presupuestos de restauracion, con semilla 42, cuyo objetivo es medir como la compresion por SVD degrada el comportamiento de seguridad y que regla lo repara mejor.

No es un modelo conversacional de proposito general: el propio autor lo describe como un sujeto experimental, no como un asistente desplegable. Sus numeros lo confirman: una tasa de exito de ataque (ASR) del 63,46 % en AdvBench y del 53,67 % en StrongREJECT, una perplexity de 53,5061 en WikiText-2 y una tasa de sobrerrechazo macro del 7,30 % medida con WildGuard. Es decir, la compresion degrada simultaneamente la calidad del modelado del lenguaje y las barreras de seguridad heredadas de Llama-2-7b-chat.

Su relevancia es metodologica: sirve como celda de control y como material para estudiar interpretabilidad, compresion de modelos y evaluacion de seguridad bajo restricciones de parametros. Tiene 0 descargas y 0 likes, y el repositorio ocupa 16,1 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), comprimido mediante SVD-LLM |
| Parametros totales | 8.030.261.248 (recuento safetensors); fraccion de parametros resultante declarada: 0,5003 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye safetensors. El tamano del repo (16,1 GB) es coherente con pesos en precision de 16 bits |
| Idiomas soportados | no disponible (el modelo base esta optimizado principalmente para ingles) |
| Licencia | Llama 2 Community License (campos `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y RoPE, entrenado por Meta con 2 billones de tokens aproximadamente y posteriormente alineado mediante RLHF y ajuste supervisado sobre datos de dialogo. Sobre ese checkpoint se aplica SVD-LLM, un metodo de compresion post-entrenamiento que descompone matricialmente los pesos y trunca los valores singulares menos relevantes, conservando el 50,00 % de los parametros densos. En esta celda concreta no se restauro ninguna componente SVD adicional: el presupuesto de restauracion es 0,000 % y el numero de componentes restaurados y sustituidos es 0.

No se ha realizado ningun entrenamiento adicional, ajuste fino ni etapa de alineacion posterior a la compresion segun la informacion disponible. La regla de seleccion de componentes figura como `unknown`, por lo que no se puede reproducir la heuristica exacta con la que se eligio que subespacios se conservaban. El proposito declarado del artefacto es cuantificar el coste en seguridad de la compresion y comparar reglas de reparacion, no ofrecer un modelo utilizable.

Existe una discrepancia que conviene senalar: el recuento de parametros reportado por safetensors (8.030.261.248) es superior al de un Llama-2-7b-chat sin comprimir, lo que no concuerda con la fraccion declarada de 0,5003. El motivo no se detalla en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional basica: conserva la estructura de chat de Llama-2 (`[INST] ... [/INST]`), aunque con calidad degradada (perplexity de 53,5061 en WikiText-2).
- Razonamiento y matematicas: capacidades residuales del modelo base, sin datos especificos de rendimiento en la informacion disponible.
- Generacion de codigo: no documentada para esta celda; no hay resultados de HumanEval ni similares.
- Tool calling / function calling: no documentado. Llama-2-7b-chat no incorpora un formato nativo de llamada a herramientas.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el modelo base esta orientado al ingles.
- Vision o audio: no soportado.
- Modo de razonamiento explicito (thinking mode): no soportado.
- Comportamiento de seguridad: deliberadamente degradado respecto al modelo base, con ASR de 0,6346 en AdvBench y 0,5367 en StrongREJECT.
- Comportamiento de rechazo: sobrerrechazo macro de 0,0730 medido con WildGuard.

## Casos de uso

- Evaluacion de seguridad bajo compresion: usar el checkpoint como celda experimental para medir cuanto sube la tasa de exito de ataque al eliminar el 50 % de parametros, comparando con las demas celdas del grid del mismo autor.
- Investigacion en compresion de modelos: servir de referencia de "compresion sin reparacion" frente a brazos con presupuesto de restauracion mayor, para aislar el efecto de restaurar componentes SVD.
- Estudios de interpretabilidad: analizar que subespacios singulares se eliminan y como se correlaciona su eliminacion con la perdida de comportamiento de rechazo, usando AdvBench y StrongREJECT como señales de salida.
- Red teaming y generacion de ataques controlados: el ASR del 63,46 % lo hace util como generador de respuestas no alineadas dentro de un entorno aislado para calibrar clasificadores de seguridad o jueces automaticos como HarmBench.
- Evaluacion de jueces y clasificadores de seguridad: al producir respuestas daninas con frecuencia conocida, permite medir la sensibilidad y la tasa de falsos negativos de un juez automatico sobre un conjunto etiquetado.
- Analisis de sobrerrechazo: con un 7,30 % de sobrerrechazo macro, sirve para estudiar el equilibrio entre utilidad y seguridad en modelos comprimidos frente a modelos completos.
- Docencia e investigacion academica: ilustrar en un curso o articulo el trade-off entre tamano, calidad de lenguaje y alineacion, con metricas reproducibles y semilla fijada (42).
- Ablacion de ruido: como linea base degradada frente a la que comparar tecnicas de reparacion de seguridad (por ejemplo, reajuste con DPO o restauracion selectiva de componentes).

## Benchmarks y rendimiento

| Metrica | Valor | Juez / conjunto |
|---|---|---|
| AdvBench ASR | 0,6346 (63,46 %) | HarmBench judge |
| StrongREJECT ASR | 0,5367 (53,67 %) | HarmBench judge |
| Sobrerrechazo macro | 0,0730 (7,30 %) | WildGuard |
| Perplexity en WikiText-2 | 53,5061 | no aplica |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad general en la informacion disponible. Tampoco se proporcionan los valores equivalentes del modelo base Llama-2-7b-chat, por lo que no es posible calcular la degradacion relativa a partir de los datos facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16,1 GB solo para los pesos (16,1 GB de repositorio) mas la cache KV.
- Cache KV estimada: con 32 capas, 32 cabezas y dimension de cabeza 128 en Llama-2-7b, unos 0,52 MB por token; en el contexto maximo de 4096 tokens, cerca de 2,1 GB adicionales. Total aproximado: 18-19 GB en fp16.
- GPU consumer: cabe en una RTX 4090 (24 GB) en fp16 para el contexto maximo, con margen limitado. En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requeriria cuantizacion o contexto reducido.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB admiten el modelo holgadamente.
- Opciones de despliegue: `transformers` (libreria declarada) y Text Generation Inference, ya que el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`. vLLM no esta confirmado en la informacion disponible.
- Cuantizacion: no hay pesos GGUF ni AWQ/GPTQ en el repositorio. No se ha verificado que la conversion a formatos cuantizados funcione correctamente con matrices factorizadas por SVD.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | ASR AdvBench | Perplexity WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| svd-safety-l3_swift_remove50 (este modelo) | 8.030.261.248 segun safetensors; fraccion declarada 0,5003 | 4096 | 0,6346 | 53,5061 | Llama 2 Community License | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (base) | no disponible en la informacion proporcionada | 4096 (heredado) | no disponible | no disponible | Llama 2 Community License | HuggingFace (modelo base declarado) |
| Otras celdas del grid SVD-LLM del mismo autor | no disponible | no disponible | no disponible | no disponible | Llama 2 Community License | HuggingFace (no listadas) |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos comparables dentro de la informacion proporcionada, por lo que la comparacion cuantitativa con otras tecnicas de compresion (por ejemplo, poda estructurada o cuantizacion) no puede realizarse sin inventar cifras.

## Limitaciones y advertencias

- Seguridad degradada de forma intencionada: el ASR de 0,6346 en AdvBench supera el 50 % de exito de ataque, un valor muy alto. No debe exponerse a usuarios finales ni a trafico no controlado.
- Calidad de lenguaje muy deteriorada: la perplexity de 53,5061 en WikiText-2 indica un modelado del lenguaje notablemente peor que el del modelo base, con mayor probabilidad de incoherencias y repeticiones.
- Riesgo elevado de alucinacion y de contenido danino: combinacion de compresion agresiva sin reparacion y de un modelo base conversacional.
- Sesgos: no documentados de forma especifica para esta celda; hereda los del modelo base Llama-2-7b-chat, que no se detallan en la informacion disponible.
- Limitaciones de contexto: ventana de 4096 tokens, sin ampliacion documentada.
- Idiomas: no disponibles; se espera un rendimiento limitado fuera del ingles por herencia del modelo base.
- Restricciones de licencia: se aplica la Llama 2 Community License, con los terminos de `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio. Cualquier uso comercial queda sujeto a la politica de uso aceptable de Meta, que prohibe usos daninos. El uso de este checkpoint para generar contenido danino violaria dicha politica con independencia de la licencia.
- Caveat de reproducibilidad: la regla de seleccion de componentes aparece como `unknown`, por lo que la construccion exacta del checkpoint no es reproducible a partir de la model card.
- Inconsistencia en el recuento de parametros: el numero reportado por safetensors no concuerda con la fraccion declarada del 50,03 %; conviene verificar la configuracion real antes de cualquier analisis cuantitativo.
- Repositorio sin traccion: 0 descargas y 0 likes, sin validacion de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Repositorio o demo del autor: no disponible
- Otros enlaces relevantes: los resultados de busqueda web facilitados no contienen informacion relacionada con el modelo (corresponden a resultados de comparadores de hoteles), por lo que no se han podido incorporar referencias adicionales.
