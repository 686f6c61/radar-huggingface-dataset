# Karl28/RSIPO-SFT-Qwen2.5-7B-Instruct-ALFWorld

## Resumen

RSIPO-SFT-Qwen2.5-7B-Instruct-ALFWorld es un punto de control intermedio (checkpoint) publicado por el usuario Karl28 en HuggingFace. Se trata del checkpoint de la etapa 1 (SFT, ajuste fino supervisado) utilizado para inicializar el entrenamiento por aprendizaje por refuerzo RSIPO sobre ALFWorld, un benchmark de agentes que operan en entornos domésticos simulados mediante texto. El modelo parte de Qwen/Qwen2.5-7B-Instruct, un modelo conversacional de 7.600 millones de parametros, y ha sido afinado para generar resumenes de episodios y habilidades reutilizables a partir de trayectorias de agente.

Su relevancia no radica en ser un modelo de uso general, sino en servir como punto de partida reproducible para la investigacion en aprendizaje por refuerzo agéntico: la model card indica explicitamente que este checkpoint precede a los 150 pasos de entrenamiento RL y que no es la politica final de RSIPO (esa version esta disponible en un repositorio aparte). Es, por tanto, una pieza de investigacion orientada a reproducibilidad, publicada junto al articulo arXiv de RSIPO, el codigo en GitHub y el dataset de la etapa 1. El contexto y la cuantizacion no se detallan en la documentacion disponible, aunque los tensores publicados estan en FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5) |
| Parametros totales | 7.615.616.512 (7,62 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible (la del modelo base Qwen2.5-7B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; config.json declara bfloat16) |
| Idiomas soportados | Ingles (etiquetado `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de transformer decoder de Qwen2.5-7B-Instruct, con 7.615 millones de parametros segun los metadatos de safetensors. No es un modelo MoE, por lo que todos los parametros estan activos en cada pasada. Sobre esta base se realizo un ajuste fino supervisado (skill-SFT) con datos generados de forma sintetica: el modelo base recolecto 8 trayectorias por cada una de las 500 tareas de entrenamiento de ALFWorld, y el modelo GLM-5.2 redacto, para cada trayectoria, un resumen del episodio y una habilidad reutilizable. El modelo se entreno durante 3 epocas para producir esas analisis, con una tasa de aprendizaje de 5e-6 y un tamaño de lote global de 8.

El dataset de la etapa 1 (Karl28/RSIPO-SFT-Data, subset `qwen25-7b-alfworld`) contiene 3.595 ejemplos de entrenamiento y 400 de validacion, e incluye tanto las trayectorias completas como las anotaciones de resumen y habilidad. Este SFT constituye la fase de inicializacion del metodo RSIPO (Recursive Self-Improving Policy Optimization), que despues aplica 150 pasos de RL para co-evolucionar la politica del agente con la biblioteca de habilidades. Un detalle tecnico relevante para reproducibilidad: los tensores safetensors estan en FP32 mientras que `config.json` conserva `torch_dtype: bfloat16`; los lanzadores de RSIPO usan bfloat16 para rollout e inferencia.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Generacion de resumenes de episodios agénticos: dado el historial de una trayectoria en ALFWorld, produce un analisis estructurado del episodio.
- Generacion de habilidades reutilizables (skills): extrae procedimientos accionables a partir de trayectorias, el mecanismo central de la co-evolucion habilidad-politica de RSIPO.
- Actuacion como agente en entornos textuales de tareas domesticas simuladas (ALFWorld): navegacion, manipulacion de objetos y planificacion multi-paso.
- Capacidades generales del modelo base (razonamiento, codigo, matematicas, tool calling de Qwen2.5-Instruct) presumiblemente presentes, aunque la model card no las documenta para este fine-tuning.
- Compatibilidad con el pipeline de entrenamiento RSIPO como checkpoint de inicializacion para RL posterior.

No se documentan capacidades de vision, audio ni modo de thinking para este checkpoint.

## Casos de uso

- Reproduccion del experimento RSIPO en ALFWorld: descargar el checkpoint y ejecutar `scripts/rsipo/run_rsipo.sh alfworld` permite replicar el entrenamiento RL de 150 pasos tal como se describe en el articulo.
- Investigacion en co-evolucion de habilidades y politicas: sirve como baseline de inicializacion SFT para comparar metodos de aprendizaje por refuerzo agéntico con y sin bibliotecas de habilidades.
- Estudio de destilacion de trayectorias mediante LLM anotadores: el pipeline (trayectorias del modelo base anotadas por GLM-5.2) es un ejemplo practico de generacion de datos sinteticos para SFT agéntico.
- Desarrollo de agentes textuales para tareas domesticas simuladas: el modelo esta especializado en interpretar estados de ALFWorld y producir resumenes y planes accionables.
- Evaluacion de inicializacion SFT frente a zero-shot: permite medir cuanto aporta el skill-SFT previo al rendimiento final del agente tras RL.
- Extension del metodo a otros benchmarks agénticos: la model card menciona soporte para QA con busqueda (search-based QA) configurando `RSIPO_SEARCH_TRAIN_DATA` y arrancando un retriever, lo que habilita experimentos fuera de ALFWorld.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en ALFWorld ni comparaciones con otras politicas; el rendimiento del sistema completo RSIPO debe consultarse en el articulo arXiv asociado.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP32 publicados, el modelo ocupa en torno a 30 GB (coherente con los 30,5 GB del repositorio), por lo que requiere una GPU de 40 GB o superior en FP32. En bfloat16 (la configuracion usada por los lanzadores de RSIPO), la necesidad se reduce a aproximadamente 15-16 GB mas la KV cache.
- GPU recomendadas: A100 40 GB o H100 para ejecutar los pesos FP32 tal cual estan publicados; una RTX 4090 (24 GB) o A6000 deberia bastar si se cargan los tensores en bfloat16.
- Cabe en GPU de consumo (RTX 4090, 3090) si se convierten los pesos a bfloat16 o se cuantiza; en FP32 puro no cabe en tarjetas de 24 GB.
- Opciones de despliegue: transformers (libreria nativa del repositorio), y el pipeline oficial de RSIPO mediante los scripts del repositorio GitHub. No se mencionan compatibilidades explicitas con vLLM, llama.cpp, Ollama o TGI, aunque al tratarse de un Qwen2.5 estandar en safetensors la compatibilidad con vLLM y TGI es esperable.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| RSIPO-SFT-Qwen2.5-7B-Instruct-ALFWorld | 7,62 B | Checkpoint SFT etapa 1 para RL agéntico en ALFWorld | Apache 2.0 | HuggingFace, safetensors FP32 |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,62 B | Modelo conversacional general | Apache 2.0 | HuggingFace, multiples formatos y cuantizaciones |
| Karl28/RSIPO-Qwen2.5-7B-Instruct-ALFWorld | no disponible (derivado del mismo base) | Politica final RSIPO tras 150 pasos de RL | Apache 2.0 | HuggingFace |

La diferencia clave: este checkpoint es el punto de partida del entrenamiento RL, no el producto final; para obtener el mejor rendimiento agéntico segun los autores, debe usarse el checkpoint final de RSIPO. Para uso conversacional general, el modelo base Qwen2.5-7B-Instruct es mas adecuado y ofrece mas formatos.

## Limitaciones y advertencias

- No es un modelo de producto: es un checkpoint intermedio de investigacion; la model card advierte expresamente que no es la politica final de RSIPO.
- Especializacion estrecha: el SFT se realizo unicamente con datos de ALFWorld (3.595 ejemplos), por lo que puede sufrir distribucion desplazada (catastrophic forgetting parcial) en tareas generales frente al modelo base.
- Idioma limitado al ingles; no hay soporte documentado para castellano ni otros idiomas.
- Inconsistencia de precision: los tensores estan en FP32 mientras `config.json` declara bfloat16; quien cargue el modelo debe tenerlo en cuenta para reproducibilidad exacta y para el consumo de memoria.
- Riesgo de alucinacion heredado del modelo base, agravado en resumenes de trayectorias generados con anotaciones sinteticas de otro LLM (GLM-5.2), que pueden introducir ruido o sesgos de anotador.
- Sesgos: no documentados; hereda los del modelo base Qwen2.5-7B-Instruct y los del proceso de anotacion sintetica.
- Licencia Apache 2.0: permite uso comercial, pero al ser pesos modificados por fine-tuning conviene verificar tambien los terminos del modelo base (igualmente Apache 2.0).
- Su uso principal requiere el ecosistema RSIPO (codigo, dataset y scripts); fuera de ese contexto su valor practico es limitado.

## Enlaces

- Modelo: https://huggingface.co/Karl28/RSIPO-SFT-Qwen2.5-7B-Instruct-ALFWorld
- Articulo (arXiv): https://arxiv.org/abs/2610.15772
- Codigo (GitHub): https://github.com/zfkarl/RSIPO
- Dataset de la etapa 1: https://huggingface.co/datasets/Karl28/RSIPO-SFT-Data
- Checkpoint final RSIPO: https://huggingface.co/Karl28/RSIPO-Qwen2.5-7B-Instruct-ALFWorld
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
