# BreakpointAI/boxnethd

## Resumen

boxnethd es un modelo de difusión conjunta de imagen y cajas delimitadoras (bounding boxes) desarrollado por Breakpoint AI, publicado como parte de la liberación de artefactos de investigación de la compañía. El modelo aborda la detección de objetos planteándola como un problema de difusión generativa de alta resolución: en lugar de predecir cajas mediante un cabezal discriminativo clásico, genera simultáneamente píxeles y coordenadas de cajas, lo que lo vincula a la familia de modelos de *grounding* (localización guiada por lenguaje o por contexto visual).

El repositorio se distribuye a través de la librería `diffusers` e incluye un backbone de difusión conjunta imagen + cajas (`boxnet/`, 7,4 GB), pesos EMA del backbone (`ema/`, 8,6 GB) y un adaptador LoRA (`pytorch_lora_weights.safetensors`, 1,2 GB), sumando 17,2 GB. El entrenamiento se realizó sobre el dataset propio `BreakpointAI/breakpoint-grounding-55m` y alcanzó el paso 475.000; los pesos subidos son exclusivamente de inferencia, por lo que no permiten reanudar el entrenamiento.

La relevancia del modelo radica en su enfoque de datos sintéticos (etiqueta `synthetic-data`) para generar pares imagen-caja de alta resolución, un recurso útil para aumentar datasets de detección y para investigación en *grounding* multimodal. No obstante, la información publicada es muy escasa: no se detallan el número de parámetros, la composición exacta del dataset ni resultados de benchmarks, y la licencia es de uso exclusivamente investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion conjunta de imagen + cajas delimitadoras (backbone `boxnet` con adaptador LoRA); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen sin cuantizar; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | research-use (uso exclusivo de investigacion; licencia `other` en HuggingFace) |
| Formato de pesos | safetensors (backbone `boxnet/`, EMA `ema/` y adaptador `pytorch_lora_weights.safetensors`) |

## Arquitectura y entrenamiento

boxnethd es un modelo de difusión que genera de forma conjunta imágenes y cajas delimitadoras a resolución elevada, según la propia model card. La liberación incluye tres componentes diferenciados: el backbone de difusión `boxnet/` (7,4 GB), una copia de pesos EMA del backbone (8,6 GB) y un adaptador LoRA de 1,2 GB que ajusta el modelo base. La presencia de pesos EMA indica que durante el entrenamiento se mantuvo una media móvil exponencial de los parámetros, práctica habitual para estabilizar la inferencia en modelos de difusión. No se especifica si el backbone es un U-Net, un transformer de difusión (DiT) o una variante híbrida, ni el número de parámetros o de bloques.

El entrenamiento se realizó sobre el dataset `BreakpointAI/breakpoint-grounding-55m`, cuyo nombre sugiere del orden de 55 millones de ejemplos de grounding, aunque la model card no confirma la composición, el número de tokens vistos ni si se aplicaron etapas de ajuste por preferencias (RLHF/DPO), que en un modelo generativo de difusión serían poco habituales. El checkpoint corresponde al paso 475.000 y la ejecución de entrenamiento está documentada en un run público de Weights & Biases. Solo se publicaron pesos de inferencia: no se subieron estados de optimizador, scheduler de learning rate, RNG ni dataloader, de modo que el checkpoint no permite reanudar el entrenamiento.

## Capacidades

- Generación conjunta de imagen y cajas delimitadoras en un único proceso de difusión.
- Detección de objetos (*object-detection*) como tarea principal de pipeline.
- *Grounding* visual: localización de regiones descritas o condicionadas por el contexto (la model card emplea la etiqueta `grounding`, aunque no detalla el mecanismo de condicionamiento).
- Generación de datos sintéticos etiquetados (etiqueta `synthetic-data`), potencialmente útiles para aumentar datasets de detección.
- Soporte de adaptación mediante LoRA, con pesos separados del backbone.
- No se documenta soporte de *tool calling*, function calling, agentes, razonamiento multi-paso, visión-a-texto, audio ni modo de pensamiento.
- Capacidades multilingües: no disponible (no se declara ningún idioma).

## Casos de uso

- Aumento de datasets de detección: generar pares imagen-caja sintéticos con el backbone y el LoRA para ampliar datasets de entrenamiento de detectores supervisados, especialmente en clases con pocas muestras.
- Investigación en grounding visual: estudiar cómo un modelo de difusión conjunta aprende a alinear regiones de la imagen con descripciones o contextos, comparándolo con detectores discriminativos tradicionales.
- Preetiquetado de imágenes a alta resolución: usar el modelo como generador de propuestas de cajas para posterior revisión humana en flujos de anotación.
- Generación de imágenes con anotaciones integradas: producir material sintético que ya incorpora las cajas de los objetos, útil para demostraciones o para entrenar modelos que consumen imagen y caja a la vez.
- Evaluación de robustez de detectores: crear escenas sintéticas con distribuciones controladas de objetos y tamaños para probar la sensibilidad de detectores comerciales.
- Ajuste fino con LoRA sobre dominios concretos: reentrenar únicamente el adaptador (1,2 GB) sobre un dataset propio manteniendo congelado el backbone, reduciendo coste de cómputo respecto a un ajuste completo.
- Experimentación en difusión multimodal: como banco de pruebas para investigar decodificación conjunta de píxeles y coordenadas, comparando con enfoques de difusión puramente de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano total del repositorio: 17,2 GB, repartidos en `ema/` (8,6 GB), `boxnet/` (7,4 GB) y el adaptador LoRA (1,2 GB).
- VRAM estimada para inferencia: no disponible de forma oficial; como referencia, cargar solo el backbone `boxnet/` (7,4 GB en disco) requiere al menos esa cantidad de VRAM mas el espacio para activaciones y el scheduler de difusion, por lo que se recomienda un minimo orientativo de 10-12 GB si los pesos estan en fp16 y bastante mas si estan en fp32. Los valores exactos dependen de la precision real de los ficheros, que no se documenta.
- Cabe en GPU de consumo: probablemente si se carga unicamente el backbone en una GPU con 12-16 GB (por ejemplo RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); cargar a la vez backbone y EMA (16 GB en disco) exigiria GPUs de 24 GB o mas. No hay datos verificados por el autor.
- GPU recomendadas: no disponible. Por tamano de pesos, un despliegue comodo apuntaria a A100 40/80 GB, H100 o RTX 4090 24 GB, pero el autor no publica requisitos.
- Opciones de despliegue: la libreria declarada es `diffusers`, por lo que el uso previsto es mediante el pipeline de difusion de esa libreria. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| boxnethd (BreakpointAI) | Difusion conjunta imagen + cajas | no disponible | no aplica | sin benchmarks publicados | research-use | HuggingFace, 17,2 GB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos directamente comparables en la documentacion proporcionada. La combinacion de difusion de imagen con generacion de bounding boxes y publicacion de pesos EMA mas LoRA es poco frecuente, pero no se aportan datos de rendimiento que permitan una comparacion cuantitativa con detectores discriminativos (tipo DETR, YOLO o Grounding DINO) ni con otros generadores de datos sinteticos.

## Limitaciones y advertencias

- La licencia es `research-use` (uso exclusivamente investigador): no esta permitido el uso comercial sin autorizacion explicita del titular.
- Solo se publicaron pesos de inferencia; no es posible reanudar el entrenamiento ni inspeccionar estados de optimizador, scheduler, RNG o dataloader.
- No se documentan parametros totales, arquitectura interna, composicion del dataset ni idiomas soportados, lo que dificulta evaluar su idoneidad en produccion.
- No hay resultados de benchmarks publicados, por lo que no puede verificarse su calidad en deteccion ni su tasa de falsos positivos.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir imagenes y cajas plausibles pero incorrectas; no debe usarse como fuente de verdad sin verificacion.
- Sesgos conocidos: no disponibles. El dataset de entrenamiento (`breakpoint-grounding-55m`) es propietario de Breakpoint AI y no se detalla su composicion, por lo que se desconoce la cobertura de dominios, clases e idiomas.
- Almacenamiento: 17,2 GB de pesos, con duplicacion entre el backbone y los pesos EMA, lo que incrementa el coste de despliegue y de gestion de artefactos.
- Las fechas del repositorio (creacion y actualizacion en 2026) figuran tal cual en la informacion proporcionada; conviene verificarlas antes de citar el modelo.
- El `pipeline_tag` declarado es `object-detection`, pese a tratarse de un modelo de difusion, lo que puede generar confusión en integraciones que infieren el tipo de tarea a partir de la etiqueta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BreakpointAI/boxnethd
- Dataset de entrenamiento: https://huggingface.co/datasets/BreakpointAI/breakpoint-grounding-55m
- Run de entrenamiento en Weights & Biases: https://wandb.ai/diffusionexp/train_boxnethd/runs/5wage8go
- Perfil del autor en HuggingFace: https://huggingface.co/BreakpointAI
