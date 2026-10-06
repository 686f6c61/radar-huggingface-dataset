# lugman-madhiai/Qwen3.5-2B-Instantly-CS-SFT-Split-04-adapter

# Qwen3.5-2B-Instantly-CS-SFT-Split-04-adapter

## Resumen

Este repositorio contiene un adaptador de ajuste supervisado (SFT) denominado Qwen3.5-2B-Instantly-CS-SFT-Split-04-adapter, publicado por el usuario lugman-madhiai. No es un modelo completo, sino un adaptador de bajo rango (LoRA) derivado del modelo base Qwen/Qwen3.5-2B, por lo que necesita combinarse con los pesos del modelo base para poder ejecutarse. El repositorio ocupa aproximadamente 0,1 GB, un tamano coherente con un conjunto de pesos de adaptador y no con un modelo de 2.000 millones de parametros en precision completa.

Segun la model card, el ajuste se realizo con Unsloth, que el autor presenta como un entrenamiento "2x mas rapido". La licencia declarada es Apache 2.0 y el unico idioma soportado segun las etiquetas es el ingles. No se especifica el dataset de ajuste, el numero de pasos, la tasa de aprendizaje ni ningun detalle del procedimiento mas alla de la libreria utilizada.

Se trata de un artefacto de nicho: en el momento de la consulta acumula cero descargas y cero valoraciones, y la informacion publicada es minima. Su relevancia practica es limitada y, sobre todo, ilustrativa del flujo tipico de publicacion de adaptadores LoRA con Unsloth sobre modelos de la familia Qwen. Cualquier uso en produccion exigiria una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Qwen3.5-2B, segun el tag `qwen3_5`) |
| Parametros totales | No disponible (el modelo base es de ~2B segun su nombre; el adaptador ocupa ~0,1 GB) |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la ficha (el repositorio contiene pesos `safetensors` del adaptador) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-2B, un transformer de aproximadamente 2.000 millones de parametros segun la nomenclatura del repositorio. El artefacto publicado es un adaptador, no un modelo fusionado: el tag `qwen3_5` identifica la familia y el sufijo `adapter` del nombre confirma que se trata de pesos incrementales que deben cargarse junto al modelo base. No se detalla en la model card ni el rango del adaptador, ni las capas objetivo, ni el tipo de cuantizacion aplicada durante el entrenamiento.

El procedimiento documentado se limita a indicar que se trata de un ajuste supervisado (SFT, por sus siglas en ingles) realizado con la libreria Unsloth, conocida por optimizar el entrenamiento y el ajuste fino de modelos sobre GPU de consumo. No se aportan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO. El fragmento "Instantly-CS-SFT-Split-04" del nombre sugiere un dataset propio dividido en particiones numeradas, pero no hay informacion que lo confirme.

## Capacidades

- Generacion de texto e instrucciones: al ser un ajuste supervisado sobre un modelo instructivo, se espera capacidad para seguir instrucciones en ingles.
- Razonamiento basico y conversacion: no documentado de forma especifica por el autor.
- Generacion de codigo y matematicas: no documentado; depende del modelo base.
- Tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara el ingles.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponible.

## Casos de uso

- Prototipado rapido de asistentes en ingles: al ser un adaptador ligero sobre un modelo de ~2B, permite experimentar con un ajuste de dominio concreto en una sola GPU de consumo antes de decidir si merece la pena escalar.
- Investigacion sobre ajuste fino eficiente: sirve como ejemplo reproducible del flujo Unsloth + TRL para publicar adaptadores LoRA, util para comparar hiperparametros y tecnicas de entrenamiento.
- Ajuste de estilo o tono en un dominio concreto: si el dataset "Instantly-CS" corresponde a un corpus especifico, el adaptador puede especializar las respuestas del modelo base en ese registro o terminologia.
- Generacion de texto de bajo coste en local: sobre el modelo base cuantizado, permite inferencia en equipos sin GPU dedicada para tareas de resumen o redaccion sencilla en ingles.
- Base para experimentos de fusion de adaptadores: al ser un artefacto pequeno e independiente, puede combinarse con otros adaptadores sobre Qwen3.5-2B para estudiar tecnicas de composicion.
- Educacion y divulgacion: util como caso de estudio de como se estructura un repositorio de adaptador (tags, model card, licencia) para quienes publican sus primeros ajustes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: hay que cargarlo junto al modelo base Qwen/Qwen3.5-2B (o fusionarlo en el).
- VRAM estimada para el modelo base de ~2B, con optimizador de memoria estandar:
  - FP16/BF16: del orden de 4-6 GB (pesos mas cache KV).
  - Cuantizacion de 8 bits: del orden de 2-3 GB.
  - Cuantizacion de 4 bits: del orden de 1,5-2 GB.
  - Estas cifras son estimaciones generales para un modelo de 2B y no proceden de la ficha del autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090 o superiores funcionan con holgura. En 4 bits cabe en GPU integradas y en equipos con 8 GB de RAM unificada.
- Despliegue: el tag `text-generation-inference` sugiere compatibilidad con TGI; al ser un modelo de la familia Qwen basado en transformers, tambien es desplegable con vLLM, llama.cpp u Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se establece frente a modelos pequenos de proposito general de tamano comparable. Los datos de las alternativas proceden de conocimiento general y no de la ficha consultada.

| Modelo | Parametros | Contexto | Licencia | Formato / tipo |
|---|---|---|---|---|
| Qwen3.5-2B-Instantly-CS-SFT-Split-04-adapter | ~2B (base) | No disponible | Apache 2.0 | Adaptador LoRA sobre Qwen3.5-2B |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | Modelo completo |
| Llama-3.2-3B-Instruct | 3B | 128K | Licencia comunitaria de Meta | Modelo completo |
| Gemma-2-2B-it | 2B | 8K | Licencia de Gemma | Modelo completo |

No se dispone de datos de rendimiento que permitan comparar el adaptador con estas alternativas en tareas concretas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni validacion, ni descargas que permitan inferir una calidad minima.
- Riesgo de alucinacion: inherente a los modelos de esta escala y no cuantificado por el autor.
- Sesgos: no documentados; al no conocerse el dataset de ajuste ("Instantly-CS-SFT"), no es posible evaluar sesgos de dominio o de idioma.
- Idioma: solo se declara ingles, por lo que el rendimiento en castellano no esta garantizado ni evaluado.
- Dependencia del modelo base: el comportamiento final depende de Qwen3.5-2B, cuyas especificaciones (contexto, cuantizaciones, arquitectura exacta) no se detallan en esta ficha.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base sobre el que se apoya, ya que el adaptador hereda sus restricciones.
- Produccion: no recomendable sin una evaluacion propia previa; el repositorio no ofrece garantias de reproducibilidad ni de estabilidad.
- Fecha y trazabilidad: la fecha de creacion registrada (2026) y la ausencia de historial de uso dificultan valorar su vigencia y procedencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-Instantly-CS-SFT-Split-04-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Unsloth (libreria de ajuste fino): https://github.com/unslothai/unsloth
