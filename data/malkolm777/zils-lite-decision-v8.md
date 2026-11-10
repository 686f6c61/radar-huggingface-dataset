# malkolm777/zils-lite-decision-v8

## Resumen

zils-lite-decision-v8 es un modelo de extraccion de caracteristicas (feature-extraction) afinado para tareas de decision dentro del "Zils subnet 127 lite pool". Lo publica el usuario malkolm777 sobre la familia Qwen3.5-0.8B y parte de un "soup" (promedio uniforme de pesos) de dos modelos previos: Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9, ambos con licencia Apache-2.0. El resultado es un modelo de aproximadamente 853 millones de parametros y 1,7 GB en safetensors.

El modelo no es un asistente conversacional generalista: esta disenado como "cuerpo de decision" (decision body) dentro de un pipeline mayor, presumiblemente un sistema de enrutamiento o seleccion de opciones en el contexto de la subnet Zils. Se entrena por destilacion desde un profesor de mayor tamano (d3-mini) sobre datasets publicos convertidos al formato de decision Zils y sobre examenes semilla publicos.

Su relevancia es acotada y experimental: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia (10 de noviembre de 2026), y con una model card minima. Es util como referencia para quienes trabajan en el ecosistema Zils o quieren estudiar tecnicas de destilacion con LoRA sobre modelos de menos de 1B de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-0.8B, segun la model card); codigo personalizado (`custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "d3-lite decision body" de la familia Qwen/Qwen3.5-0.8B. Se obtiene por fine-tuning con LoRA (rango 16, optimizador AdamW, learning rate 5e-5) sobre el "soup" d3-lite actual, definido como el promedio uniforme de los pesos de Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9. El entrenamiento es por destilacion: se usan objetivos suaves (soft targets) generados por un profesor d3-mini (el "mini soup" vigente), mezclados en proporcion 0,7/0,3 con las etiquetas verdaderas.

Los datos de entrenamiento son los items de split de entrenamiento de datasets publicos convertidos al formato de decision Zils, mas los examenes semilla publicos Zils v1, v2 y v4. No se especifican el numero de tokens, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o DPO. El repositorio incluye etiquetas `custom_code`, lo que implica que la carga requiere `trust_remote_code=True` y revision del codigo remoto antes de ejecutarlo.

## Capacidades

- Extraccion de caracteristicas y representaciones internas (pipeline `feature-extraction`).
- Toma de decisiones en el formato especifico del ecosistema Zils (clasificacion o seleccion de opciones segun el formato de decision definido por el autor).
- Destilacion de un profesor mayor: el modelo imita las distribuciones de salida del d3-mini, lo que puede aportar calibracion en las decisiones para las que fue entrenado.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se declara ningun idioma).
- No se documenta modo "thinking" ni ninguna capacidad especial adicional.

## Casos de uso

- Enrutamiento de decisiones dentro del pipeline Zils: el modelo actua como "cuerpo de decision" que recibe una entrada en el formato Zils y devuelve una decision; encaja en el "lite pool" de la subnet por su tamano reducido (853M) y su bajo coste de inferencia.
- Clasificacion por similitud de representaciones: al ser un modelo de feature-extraction, se pueden extraer embeddings y usarlos para comparar entradas con prototipos de decision previamente etiquetados.
- Destilacion a entornos con recursos limitados: sustituye al profesor d3-mini en produccion cuando la latencia o el coste de GPU son restrictivos, manteniendo el comportamiento aprendido por soft targets.
- Evaluacion comparativa de "soups" de modelos: sirve como punto de referencia para medir si el promedio de pesos de los modelos base mejora o empeora frente a los componentes individuales en los examenes semilla Zils v1/v2/v4.
- Investigacion sobre LoRA y destilacion en modelos sub-1B: el setup (rank 16, lr 5e-5, mezcla 0,7/0,3 de soft targets y etiquetas) es reproducible y documentado de forma suficiente para experimentos academicos.
- Prototipado de agentes de decision de bajo coste: integrado como modulo de seleccion de accion dentro de un sistema mayor, con la ventaja de que cabe en una GPU de consumo y se puede servir con transformers estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,4 GB solo para pesos, mas activaciones y overhead; en bf16/fp16, alrededor de 1,7 GB para pesos.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 0,9 GB para pesos; con 4 bits, alrededor de 0,5 GB. Los formatos de cuantizacion concretos no estan documentados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16 (RTX 3050, RTX 4060, T4); A100 o H100 no son necesarias y estarian infrautilizadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas; tambien es viable en CPU para cargas de baja frecuencia.
- Opciones de despliegue: transformers (libreria declarada), con `trust_remote_code=True` por el uso de `custom_code`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de feature-extraction, el despliegue tipico seria un servidor de inferencia propio con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-decision-v8 (malkolm777) | 853M | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Destilado del d3-mini sobre formato Zils |
| Charlie320/zils-lite-v9a | no disponible | no disponible | Apache-2.0 (segun model card) | Hugging Face | Componente del soup base |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache-2.0 (segun model card) | Hugging Face | Componente del soup base |
| Qwen3.5-0.8B (familia base) | ~0,8B | no disponible | no disponible | no disponible | Arquitectura de partida |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion independiente.
- La model card es minima: no se documentan contexto, idiomas, cuantizaciones ni benchmarks, lo que dificulta evaluar su idoneidad sin pruebas propias.
- Requiere `trust_remote_code=True` por el uso de `custom_code`; hay que auditar el codigo remoto del repositorio antes de ejecutarlo, ya que puede contener logica arbitraria.
- Riesgo de alucinacion y de decisiones incorrectas fuera de la distribucion de los examenes semilla Zils v1/v2/v4 y de los datasets publicos usados en entrenamiento.
- Sesgos conocidos: no documentados; al entrenarse sobre datasets publicos y examenes semilla, puede heredar sesgos de esas fuentes.
- Especializacion estrecha: no es un modelo generalista; su uso fuera del formato de decision Zils probablemente produzca resultados pobres.
- Licencia Apache-2.0 permite uso comercial, pero el autor remite a LICENSE y NOTICE del repositorio, que no se han podido verificar en la informacion disponible; conviene revisarlos antes de un despliegue comercial.
- El modelo base declarado en los tags (`Charlie320/zils-lite-v9a`) y el listado en la model card (dos modelos) no coinciden exactamente; verificar la procedencia de los pesos antes de confiar en el linaje.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-decision-v8
- Modelo base 1: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base 2: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Familia Qwen3.5-0.8B: no disponible (no se proporciona enlace directo en la informacion)
- Paper, blog o demo del autor: no disponible
