# fdsffjdkf/ClearTrans-3B-SFT-C-to-Python

## Resumen

ClearTrans-3B-SFT-C-to-Python es un checkpoint de ajuste fino supervisado (SFT) sobre Qwen2.5-Coder-3B, especializado en una unica direccion de traduccion de codigo: de C a Python. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, cuyo codigo de implementacion y replicacion esta en el repositorio de GitHub del proyecto. El modelo resuelve un problema acotado y bien definido: convertir funciones y programas escritos en C a Python idiomatico, una tarea relevante en migraciones de bases de codigo heredadas y en la modernizacion de sistemas.

El checkpoint conserva la arquitectura del modelo base (familia Qwen2, transformer decoder-only) con 3.085.938.688 parametros totales y un repositorio de 6,8 GB en safetensors. El entrenamiento se realizo con Llama Factory en configuracion multi-GPU (8 dispositivos), con un learning rate de 1e-05, batch total de 64 y 3 epocas sobre un dataset identificado como `train_full_1231_c2python_idx3`, cuyos ejemplos no se distribuyen en el repositorio.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo de especializacion estrecha sobre un modelo de codigo pequeno, abordable en hardware de consumo. Por otro, el propio autor advierte que la release ha superado comprobaciones de tamano de fichero, layout de tensores e indices de shards, pero no ha validado inferencia en GPU ni reproduccion de benchmarks, lo que condiciona cualquier evaluacion practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-3B, sin confirmar en este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (uso no comercial para investigacion o evaluacion) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Coder-3B |
| Etapa de entrenamiento | SFT (supervised fine-tuning) |
| Direccion de traduccion | C a Python |
| Tamano del repositorio | 6,8 GB |
| Version de Transformers registrada | 4.57.1 |
| Version de PyTorch registrada | 2.9.1 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA) de Qwen2.5-Coder-3B, un transformer decoder-only de la familia Qwen2 con atencion causal estandar. No se documentan modificaciones arquitectonicas respecto al base: se conservan configuracion y tokenizer del export de entrenamiento. El checkpoint incorpora la plantilla de chat del modelo original.

El entrenamiento se ejecuto con Llama Factory en 8 GPUs, con learning rate 1e-05, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-08), scheduler coseno, batch de entrenamiento total de 64 (batch por dispositivo 1, acumulacion de gradientes 8), batch de evaluacion de 64 y 3 epocas con semilla 42. El dataset se identifica como `train_full_1231_c2python_idx3`, especifico de la direccion C a Python, pero sus ejemplos no se incluyen en el repositorio y el nombre por si solo no verifica la procedencia ni el procedimiento de reconstruccion. El autor indica explicitamente que este checkpoint es de etapa SFT y que no se establece que sea un checkpoint final entrenado con GRPO. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o RLHF/DPO.

## Capacidades

- Traduccion de codigo de C a Python como tarea principal y unica direccion entrenada.
- Generacion de texto y codigo en formato conversacional, con plantilla de chat incluida.
- Razonamiento sobre estructuras de C (punteros, arrays, control de flujo) para producir equivalentes en Python, segun la naturaleza del dataset de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta especializado en una transformacion acotada.
- Capacidades multilingues: no disponibles; el foco es traduccion entre lenguajes de programacion, no entre idiomas naturales.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Migracion de utilidades C a Python en bases de codigo heredadas: el modelo recibe una funcion C y devuelve una propuesta en Python que un ingeniero revisa y valida con tests, reduciendo el trabajo manual de traduccion en modulos pequenos y bien delimitados.
- Modernizacion de scripts de sistema: utilidades de linea de comandos o procesamiento de ficheros escritas en C pueden traducirse a Python para integrarlas en pipelines de datos o herramientas internas.
- Generacion de borradores para revision humana en proyectos de reescritura: el checkpoint produce una primera version que sirve como punto de partida en revisiones de codigo, con validacion posterior obligatoria.
- Creacion de datasets de pares C-Python: las traducciones generadas pueden usarse, tras filtrado y verificacion, como material de entrenamiento o evaluacion para otros modelos de traduccion de codigo.
- Apoyo docente en cursos de sistemas y programacion: permite mostrar equivalencias entre construcciones de C y Python para explicar conceptos como gestion de memoria o paso por referencia, siempre con supervision del instructor.
- Investigacion sobre especializacion de modelos de codigo: sirve como caso de estudio de SFT direccional sobre un modelo de 3B, comparando el efecto de la especializacion frente al modelo base en tareas de traduccion C a Python.
- Evaluacion de pipelines de traduccion automatica de codigo: integrable en un banco de pruebas que mida correccion funcional de traducciones mediante ejecucion de tests, dado que el autor advierte de posibles errores funcionales y code smells.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se atribuye ninguna puntuacion de benchmark del manuscrito a este checkpoint y que la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por el tamano del checkpoint (3,09B parametros), en FP16/BF16 los pesos ocupan aproximadamente 6,2 GB, y en cuantizacion de 8 bits alrededor de 3,1 GB; estas cifras son estimaciones por tamano, no medidas publicadas para este modelo.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el checkpoint en precision completa cabe en GPUs de 16 GB o mas; el entrenamiento se realizo en 8 GPUs, sin que se especifique el modelo.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 16 GB o mas en FP16, y en tarjetas de 8-12 GB con cuantizacion, aunque no hay validacion publicada por parte del autor.
- Opciones de despliegue: transformers (version registrada 4.57.1) es el camino documentado; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints, sin validacion publicada. No se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-C-to-Python | 3,09B | no disponible | Traduccion C a Python (SFT) | Qwen Research (no comercial) | HuggingFace, sin validacion de inferencia publicada |
| Qwen2.5-Coder-3B (base) | 3,09B | no disponible en esta ficha | Generacion de codigo general | Qwen Research / Apache-2.0 segun variante | Ampliamente disponible |
| Otros modelos de traduccion de codigo | no disponible | no disponible | Traduccion entre lenguajes | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Las traducciones generadas pueden contener errores funcionales y code smells; el autor recomienda evaluar las salidas con los tests y herramientas de analisis previstos antes de confiar en ellas.
- El repositorio no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas; es una release de pesos, no evidencia de reproduccion numerica completa de los experimentos.
- La release ha superado comprobaciones de tamano, layout de tensores e indices de shards, pero no se ha validado la inferencia en GPU ni la reproduccion de benchmarks.
- Licencia Qwen Research: uso limitado a investigacion o evaluacion no comercial conforme al acuerdo; no se relicencia bajo MIT ni Apache-2.0, lo que restringe el uso comercial.
- El checkpoint es de etapa SFT y no se establece que sea un checkpoint final entrenado con GRPO.
- Especializacion estrecha: solo se entrena la direccion C a Python; el rendimiento en otras direcciones o tareas de codigo no esta documentado.
- Idiomas naturales soportados: no disponibles.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos generativos de codigo; no cuantificado para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-C-to-Python
- Repositorio del proyecto ClearTrans: https://github.com/Xingzhehu/ClearTrans
- Modelo base Qwen2.5-Coder-3B: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
