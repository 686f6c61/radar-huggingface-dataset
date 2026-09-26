# Blah75483ty/yield-ai-qwen3.5-4b

## Resumen

`Blah75483ty/yield-ai-qwen3.5-4b` es un adaptador LoRA publicado en HuggingFace por el usuario Blah75483ty, obtenido mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-4B` de Alibaba. El repositorio contiene unicamente los pesos del adaptador en formato safetensors (0,1 GB), no el modelo completo, por lo que para su uso es imprescindible descargar y cargar tambien el modelo base. El entrenamiento se realizo con la libreria TRL (version 0.24.0) sobre PEFT 0.21.0, Transformers 5.5.0 y PyTorch 2.11.0+cu128, y las etiquetas del repositorio incluyen `unsloth`, lo que sugiere el uso de ese framework para acelerar el entrenamiento.

El modelo base Qwen3.5-4B es un modelo denso de 4.000 millones de parametros de la familia Qwen3.5, descrito como un modelo multimodal compacto con una pila hibrida de 32 capas que combina bloques Gated DeltaNet y Gated Attention. Segun la receta oficial de vLLM, cabe en GPU de consumo con 16 GB de VRAM manteniendo la ventana de contexto completa de 262.144 tokens, y el catalogo de Microsoft Foundry indica soporte para 201 idiomas y entradas de texto e imagen. El blog de Qwen presenta la familia como orientada a agentes multimodales nativos, aunque los resultados de benchmark publicos que se citan corresponden al variante grande Qwen3.5-397B-A17B.

La relevancia de esta ficha es limitada y conviene ser explicito: se trata de un adaptador con cero descargas y cero likes, sin model card tecnica (no documenta dataset, numero de pasos, hiperparametros ni evaluacion), sin licencia declarada y sin resultados de benchmark. Su interes practico es, por tanto, el de un artefacto de investigacion o de un pipeline interno de fine-tuning, no el de un modelo listo para produccion. El nombre "yield-ai" sugiere un enfoque de dominio especifico, pero la model card no lo confirma ni lo describe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso; el modelo base Qwen3.5-4B usa una pila hibrida de 32 capas con bloques Gated DeltaNet y Gated Attention |
| Parametros totales | 4B en el modelo base; el adaptador LoRA anade un conjunto reducido de parametros entrenables (no se publica el recuento exacto) |
| Parametros activos | no aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) en el modelo base, segun la receta de vLLM; no se documenta si el adaptador conserva la ventana completa |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base se distribuye en formato cuantizado a traves de Ollama |
| Idiomas soportados | no disponible para el adaptador; el modelo base declara 201 idiomas segun el catalogo de Microsoft Foundry |
| Licencia | no disponible (la model card incluye el marcador de posicion `licence: license` sin concretar) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Tamano del repositorio | 0,1 GB |
| Libreria declarada | peft |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3.5-4B |
| Framework de entrenamiento | TRL 0.24.0, PEFT 0.21.0, Transformers 5.5.0, PyTorch 2.11.0+cu128, Datasets 4.3.0, Tokenizers 0.22.2 |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo sino un adaptador de bajo rango (LoRA) que se acopla a las capas del modelo base Qwen3.5-4B. La arquitectura subyacente, por tanto, es la del base: un transformer denso de 32 capas que introduce dos tipos de bloque, Gated DeltaNet (una formulacion de atencion lineal con estado recurrente y compuertas) y Gated Attention, combinados en una pila hibrida. Esa hibrida es lo que permite sostener 262.144 tokens de contexto en un modelo de 4B que, segun la receta de vLLM, cabe en 16 GB de VRAM. El modelo base incorpora ademas un codificador de vision, lo que lo convierte en un modelo vision-lenguaje nativo segun la documentacion oficial.

Sobre el entrenamiento del adaptador solo se sabe que se uso SFT (supervised fine-tuning) con TRL. No se publica el dataset, el numero de tokens de entrenamiento, la composicion de los datos, el rango y alpha del LoRA, la tasa de aprendizaje, el numero de pasos ni si hubo fases posteriores de preferencia (DPO, RLHF). Tampoco se documenta si el entrenamiento toco la torre de vision o solo el decodificador de texto. Las etiquetas `unsloth` y `conversational` apuntan a un ajuste orientado a dialogo con formato conversacional, pero es una inferencia a partir de metadatos, no un dato confirmado. El codigo de ejemplo de la model card contiene un error evidente (`model="None"`), lo que refuerza la impresion de que la publicacion es un volcado de entrenamiento sin revision editorial.

## Capacidades

- Generacion de texto conversacional: es la unica capacidad declarada explicitamente, tanto por el `pipeline_tag: text-generation` como por la etiqueta `conversational`.
- Razonamiento y matematicas: el modelo base Qwen3.5 esta descrito como un modelo post-entrenado con aprendizaje por refuerzo a escala; no hay ninguna evaluacion que confirme que el adaptador conserva esas capacidades.
- Codigo: la familia Qwen3.5 se presenta con capacidades de codigo en el blog oficial, referidas a la variante grande; no disponible para este adaptador.
- Vision: el modelo base acepta entradas de imagen y texto segun su model card oficial; se desconoce si el adaptador mantiene operativa la torre de vision.
- Tool calling y function calling: el blog de Qwen menciona capacidades de agente para la familia, pero no se documenta soporte de llamadas a herramientas para este adaptador ni para el base de 4B en la informacion disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Multilingue: el base declara 201 idiomas; el adaptador no documenta cobertura linguistica y, al haber sido ajustado con un dataset desconocido, podria haber degradado idiomas no presentes en el.
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- Prototipado de pipelines de fine-tuning: el caso de uso mas solido es reproducir o extender el flujo de entrenamiento (TRL + PEFT + Unsloth) para validar recetas sobre un modelo base de 4B antes de escalar a variantes mayores. El adaptador sirve como punto de partida verificable y su tamano de 0,1 GB lo hace trivial de versionar.
- Asistentes de dominio vertical: si el ajuste se ha hecho sobre un corpus sectorial (el nombre "yield-ai" sugiere finanzas o rendimientos, aunque no esta confirmado), el adaptador puede emplearse como asistente conversacional especializado. Requiere evaluacion previa con un conjunto de validacion propio, ya que no existe ninguna publicada.
- Procesamiento de documentos largos: apoyandose en la ventana de 262K del modelo base, es utilizable para resumir contratos, informes anuales o expedientes completos sin troceado agresivo. La viabilidad real depende de que el adaptador no degrade la atencion de largo alcance, algo que hay que medir.
- RAG sobre corpus extensos: con 262K tokens de contexto se pueden inyectar decenas de fragmentos recuperados en un solo prompt, reduciendo la perdida de informacion entre pasos de recuperacion. Es un escenario natural para un modelo de 4B con contexto largo.
- Extraccion de datos estructurados en lote: clasificacion, etiquetado y extraccion de campos en JSON sobre grandes volumenes de texto. El coste de inferencia de un 4B cuantizado permite procesar lotes grandes en una sola GPU de consumo.
- Analisis de documentos con componente visual: si la torre de vision sigue operativa, el modelo puede procesar facturas escaneadas, capturas de pantalla o graficos combinados con instrucciones textuales. Debe validarse explicitamente antes de usarlo.
- Asistencia de codigo en local: para entornos con requisitos de privacidad, un modelo de 4B cuantizado que quepa en una GPU de 16 GB permite autocompletado y explicacion de codigo sin enviar datos a terceros. La calidad real de este adaptador concreto en codigo no esta medida.
- Red teaming y evaluacion de adaptadores: util como caso de estudio sobre riesgos de publicar adaptadores sin licencia, sin dataset declarado y sin evaluacion, especialmente en flujos de gobernanza de modelos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye ninguna tabla de evaluacion, y las busquedas realizadas no aportan cifras para la variante Qwen3.5-4B. El blog oficial de Qwen publica resultados de razonamiento, codigo, capacidades de agente y comprension multimodal, pero corresponden a Qwen3.5-397B-A17B, no al modelo de 4B ni a este adaptador. En consecuencia, no es posible comparar su rendimiento con alternativas sin inventar numeros.

## Requisitos de hardware

- Naturaleza del artefacto: el adaptador pesa 0,1 GB, pero la inferencia requiere cargar el modelo base Qwen3.5-4B, de modo que los requisitos de VRAM vienen determinados por el base, no por el adaptador.
- VRAM estimada (orientativa, derivada del tamano de 4B y no de mediciones publicadas del adaptador): en bf16/fp16 en torno a 9-10 GB de pesos mas cache KV; en cuantizacion de 8 bits en torno a 5-6 GB; en cuantizacion de 4 bits en torno a 3-4 GB. Son estimaciones de orden de magnitud.
- GPU de consumo: la receta oficial de vLLM para Qwen3.5-4B indica que cabe en GPU de consumo con 16 GB manteniendo el contexto completo de 262K, lo que incluye RTX 4080, RTX 4090, RTX 5070 Ti y similares. La cache KV a contexto completo es el factor limitante, no los pesos.
- GPU de datacenter: A100 (40/80 GB), H100, L40S y equivalentes sobran para este tamano y permiten lotes concurrentes grandes.
- Otras plataformas mencionadas: la receta de vLLM cita Intel Arc Pro B60/B70 y un nodo NUMA de Intel Xeon 6 como entornos donde el modelo base cabe.
- Opciones de despliegue: vLLM (receta oficial disponible para el base), Transformers con PEFT para cargar el adaptador, TGI, llama.cpp tras convertir el modelo fusionado a GGUF, Ollama para el base cuantizado y Unsloth para entrenamiento e inferencia rapida.
- Consideracion practica: para desplegar con vLLM o llama.cpp conviene fusionar el adaptador con el base (`merge_and_unload`) y exportar el modelo completo; cargar el adaptador en caliente requiere Transformers + PEFT o un servidor que soporte LoRA dinamico.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este adaptador ni para el base de 4B en la informacion recogida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| yield-ai-qwen3.5-4b (este adaptador) | Adaptador LoRA sobre base de 4B | Heredado del base: 262K | no disponible | safetensors (PEFT) | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-4B (modelo base) | 4B densos | 262K | no disponible en la informacion recogida | safetensors y cuantizaciones via Ollama | HuggingFace, Ollama, vLLM, Microsoft Foundry |
| Qwen3.5-397B-A17B (hermano mayor de la familia) | 397B totales, 17B activos (MoE) | no disponible | no disponible | no disponible | Referenciado en el blog oficial de Qwen |

No se dispone de datos de rendimiento comparativos entre estos modelos ni frente a alternativas de otros fabricantes en el mismo rango de 4B, por lo que cualquier comparacion de calidad seria especulativa y no se incluye.

## Limitaciones y advertencias

- Licencia sin definir: la model card usa el marcador de posicion `licence: license` y no concreta terminos. No hay autorizacion explicita para uso comercial y, ademas, la licencia del modelo base Qwen3.5-4B debe verificarse por separado, ya que impone sus propias condiciones.
- Procedencia y trazabilidad: el autor es un usuario sin historial verificable, con 0 descargas y 0 likes. No hay documentacion de quien entreno el adaptador, con que datos ni con que objetivo.
- Dataset de entrenamiento desconocido: no se declara la composicion, el volumen ni la procedencia de los datos de SFT. Esto impide evaluar riesgos de contaminacion, sesgos incorporados o fuga de datos personales.
- Riesgo de sobreajuste y olvido catastrofico: un LoRA entrenado con SFT sobre un dataset no documentado puede degradar las capacidades generales del base, incluidas las multilingues (201 idiomas declarados) y las de codigo y matematicas.
- Alucinacion: al no haber evaluacion, no hay estimacion de la tasa de alucinacion. En escenarios de extraccion o resumen de documentos largos, el riesgo debe asumirse como alto hasta que se mida.
- Ambiguedad multimodal: se desconoce si el adaptador conserva la torre de vision del base. Cualquier caso de uso con imagenes requiere validacion explicita antes de desplegarse.
- Contexto efectivo no verificado: aunque el base soporte 262K tokens, la calidad de recuperacion en ventanas largas tras el ajuste no esta medida. El contexto nominal no garantiza el contexto util.
- Codigo de ejemplo defectuoso: el snippet de la model card pasa `model="None"`, por lo que no es ejecutable tal cual. Hay que sustituirlo por la ruta del adaptador o del modelo fusionado.
- Idiomas: no hay declaracion de cobertura linguistica del adaptador; se hereda, en el mejor caso, la del base, pero puede haberse reducido tras el ajuste.
- Ausencia de benchmarks: no existen metricas publicadas para este adaptador, lo que hace inviable cualquier afirmacion de rendimiento o comparacion con alternativas.
- Uso en produccion: no recomendado sin una evaluacion propia sobre un conjunto de validacion representativo del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blah75483ty/yield-ai-qwen3.5-4b
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Receta de vLLM para Qwen3.5-4B: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Ficha del modelo base en Microsoft Foundry: https://ai.azure.com/catalog/models/FW-Qwen3.5-4B
- Qwen3.5:4b en Ollama: https://ollama.com/library/qwen3.5:4b
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
