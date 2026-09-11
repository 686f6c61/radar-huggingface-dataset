# Jeesup/svd-safety-l2_remove50_swapdisciter_b010

## Resumen

svd-safety-l2_remove50_swapdisciter_b010 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf, publicado por el usuario Jeesup, que ha sido comprimido con la tecnica SVD-LLM hasta eliminar el 50,01 % de los parametros densos y posteriormente se le ha restaurado un presupuesto del 1,000 % de componentes SVD seleccionados mediante la regla `disc_iter` (6.753 componentes restaurados y 6.753 sustituidos, semilla 42). La fraccion de parametros resultante declarada en la model card es de 0,4999.

No se trata de un asistente conversacional de proposito general, sino de un artefacto de investigacion. Forma parte de una rejilla experimental que estudia como la compresion por SVD degrada el comportamiento de seguridad del modelo y que regla de seleccion de componentes repara mejor esa degradacion. El propio autor advierte que varias celdas de la rejilla estan deliberadamente degradadas en seguridad en comparacion con Llama-2-7b-chat.

La relevancia del checkpoint es metodologica: cuantifica el compromiso entre seguridad y utilidad bajo compresion. Reporta sobre el propio checkpoint un ASR de 0,0115 en AdvBench, un ASR de 0,0735 en StrongREJECT (ambos con juez HarmBench), una tasa de sobrerrechazo macro de 0,4240 sobre WildGuard y una perplejidad de 14,3199 en WikiText-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con compresion SVD-LLM y restauracion selectiva de componentes |
| Parametros totales | 6.738.415.616 segun metadatos de safetensors (la model card declara una fraccion resultante de 0,4999) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-2-7b-chat admite 4.096 tokens |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de una arquitectura transformer decoder-only correspondiente a Llama-2-7b-chat. Sobre esa base se aplica SVD-LLM, un metodo de compresion basado en descomposicion en valores singulares que reduce el rango de las matrices de pesos; en este caso se elimina el 50,01 % de los parametros densos. Posteriormente se restaura un presupuesto del 1,000 % de componentes SVD, seleccionados con la regla `disc_iter`, lo que implica restaurar 6.753 componentes y sustituir otros 6.753.

No se documenta en la informacion disponible ningun reentrenamiento adicional, ajuste fino, RLHF ni DPO especifico para este checkpoint: la intervencion es de compresion y restauracion de componentes sobre un modelo ya conversacional. Tampoco se detallan los datos de entrenamiento ni el numero de tokens, ya que el foco del artefacto es el efecto de la compresion sobre el comportamiento, no la construccion del modelo desde cero. La innovacion tecnica destacable es precisamente la combinacion de compresion SVD-LLM con una politica de restauracion selectiva (`disc_iter`) y la evaluacion de su impacto en seguridad.

## Capacidades

- Generacion de texto conversacional, heredada de Llama-2-7b-chat, aunque degradada por la compresion.
- Capacidad de responder a peticiones de chat y seguir instrucciones basicas.
- Razonamiento y generacion de codigo limitados: no se documentan capacidades especificas ni evaluaciones de codigo o matematicas para este checkpoint.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el modelo base esta orientado principalmente al ingles.
- Capacidades especiales (vision, audio, modo "thinking"): no disponibles.
- Comportamiento de seguridad alterado de forma medible: ASR de 0,0115 en AdvBench y 0,0735 en StrongREJECT, con una tasa de sobrerrechazo macro de 0,4240, que refleja una tendencia a rechazar peticiones legitimas.

## Casos de uso

- Investigacion sobre seguridad y compresion: sirve como celda experimental para medir como la eliminacion del 50,01 % de parametros afecta a la tasa de exito de ataques (AdvBench, StrongREJECT) y compararla con otras celdas de la rejilla.
- Estudio de interpretabilidad de componentes SVD: permite analizar que componentes concretos, seleccionados por `disc_iter`, contribuyen a recuperar comportamiento de seguridad frente a los sustituidos.
- Evaluacion comparativa de reglas de seleccion: al ser una celda de una rejilla sobre reglas y presupuestos, se usa para contrastar `disc_iter` con otras politicas bajo presupuestos del 1,000 %.
- Analisis de sobrerrechazo: con una tasa macro de 0,4240 en WildGuard, es util para estudiar el coste en utilidad que introduce la restauracion de componentes orientada a seguridad.
- Reproducibilidad de experimentos: la semilla (42), el numero de componentes restaurados y sustituidos y las metricas reportadas permiten replicar y auditar el metodo.
- Pruebas de red-teaming controladas: al ser un artefacto degradado en seguridad, sirve como sujeto de prueba en entornos aislados para validar jueces automaticos y metodologias de evaluacion de seguridad.
- Referencia para pipelines de compresion: puede usarse como punto de comparacion al evaluar tecnicas de compresion alternativas (cuantizacion, poda) sobre Llama-2-7b-chat.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0115 |
| StrongREJECT ASR (juez HarmBench) | 0,0735 |
| Sobrerrechazo macro (WildGuard) | 0,4240 |
| Perplejidad en WikiText-2 | 14,3199 |

No se han proporcionado en la informacion disponible los valores de referencia del modelo base sin comprimir ni de otras celdas de la rejilla, por lo que no es posible establecer una comparacion cuantitativa directa dentro de esta ficha.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 13,5 GB de pesos (el repositorio ocupa 13,5 GB), mas la memoria de activaciones y cache KV.
- VRAM estimada en INT8: en torno a 6,7 GB de pesos; en INT4, en torno a 3,4 GB (requiere cuantizacion posterior, no distribuida en el repositorio).
- GPU recomendadas: A100, H100 o L40S para servidores; RTX 4090 o RTX 3090 (24 GB) para FP16 en consumo.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) para FP16; en tarjetas de 16 GB y 8 GB seria necesario cuantizar.
- Opciones de despliegue: transformers y text-generation-inference (la etiqueta `endpoints_compatible` esta presente). vLLM es compatible al ser un modelo de la familia Llama, aunque no se confirma explicitamente. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad / utilidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapdisciter_b010 | 6.738.415.616 segun safetensors (fraccion declarada 0,4999) | no disponible (base: 4.096) | ASR AdvBench 0,0115; ASR StrongREJECT 0,0735; sobrerrechazo 0,4240; PPL WikiText-2 14,3199 | Llama 2 Community License | HuggingFace |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | 6.738.415.616 | 4.096 tokens | no disponible en la informacion proporcionada | Llama 2 Community License | HuggingFace |
| Otras celdas de la rejilla del mismo autor (seleccion de componentes / presupuestos) | variable | no disponible | no disponible | Llama 2 Community License | HuggingFace (Jeesup) |

No se dispone de datos publicados de modelos comparables adicionales dentro de la informacion proporcionada; la busqueda web no aporto referencias utiles.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: el propio autor indica que debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Seguridad degradada de forma intencionada: la compresion por si sola eleva la tasa de exito de ataques, y varias celdas de la rejilla estan deliberadamente degradadas respecto a Llama-2-7b-chat.
- Sobrerrechazo elevado: la tasa macro de 0,4240 en WildGuard implica que el modelo tiende a rechazar peticiones legitimas, lo que limita su utilidad practica.
- Perplejidad elevada: 14,3199 en WikiText-2, indicativa de perdida de calidad respecto a un modelo sin comprimir.
- Riesgo de alucinacion: no se documenta mitigacion especifica; la compresion puede agravar la perdida de fidelidad factual.
- Idiomas: no se declaran idiomas soportados; el modelo base esta orientado principalmente al ingles.
- Licencia: Llama 2 Community License, con LICENSE.txt y USE_POLICY.md aplicables; el uso comercial esta sujeto a las condiciones de dicha licencia y a la politica de uso aceptable de Meta.
- Contexto: no confirmado en la model card; se asume el heredado del modelo base (4.096 tokens).
- Ausencia de evaluaciones de codigo, matematicas, tool calling o agentes: no hay datos que respalden esas capacidades.
- Discrepancia de parametros: los metadatos de safetensors reportan 6.738.415.616 parametros, identicos al modelo base, mientras que la model card declara una fraccion resultante de 0,4999; conviene verificar la estructura real de los tensores antes de cualquier uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisciter_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf

No se encontraron en la busqueda web enlaces adicionales relevantes (papers, blogs, repos o demos) asociados a este checkpoint.
