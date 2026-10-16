# Misalignment-Empirics/theo_gemma-4-31b-it_impulsive-dpo-v3-lora

## Resumen

`theo_gemma-4-31b-it_impulsive-dpo-v3-lora` es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo instruct `google/gemma-4-31B-it`, publicado por el usuario Misalignment-Empirics. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador en formato safetensors que debe cargarse junto al modelo base mediante la libreria PEFT. El repositorio ocupa 2,0 GB, un tamano elevado para un adaptador LoRA, lo que sugiere un rango y un conjunto de modulos adaptados amplios, aunque la model card no detalla rank, alpha ni capas objetivo.

La relevancia del artefacto es fundamentalmente metodologica: documenta una receta de ajuste por preferencias (DPO con TRL) aplicada a un modelo denso de aproximadamente 31B parametros, y su nombre ("impulsive-dpo-v3") apunta a una linea de trabajo centrada en modificar rasgos de comportamiento del modelo mas que en mejorar capacidades. Esto lo situa en el ambito de la investigacion sobre alineamiento y caracterologia de modelos, no en el de un modelo listo para produccion.

La informacion publicada es extremadamente escasa: no hay datos de entrenamiento, hiperparametros, evaluaciones, idiomas declarados ni licencia concreta. Cualquier uso en produccion requiere validacion propia, dado que el autor no aporta evidencias de calidad ni de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `google/gemma-4-31B-it`; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | 31B en el modelo base (segun nomenclatura del ID); numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | No especificados en la model card; al ser un adaptador PEFT puede combinarse con el modelo base cuantizado a 4 u 8 bits en el momento de la carga |
| Idiomas soportados | No disponibles |
| Licencia | No disponible; la model card solo indica `licence: license` sin concretar terminos, por lo que se heredan las condiciones del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO, el metodo introducido en el paper "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (arXiv:2305.18290). DPO reformula el ajuste por preferencias humanas como un problema de clasificacion sobre pares (respuesta preferida, respuesta rechazada), eliminando la necesidad de entrenar un modelo de recompensa separado y de ejecutar RL en linea. La implementacion se apoya en TRL y PEFT: los tags del repositorio confirman `peft`, `dpo`, `lora`, `trl` y `transformers`, y las versiones declaradas son PEFT 0.20.0, TRL 1.0.0, Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.22.2.

No se especifica nada sobre el dataset de preferencias, el numero de pares utilizados, el coeficiente beta de DPO, el rank del adaptador, el alpha de escalado, las capas objetivo, la tasa de aprendizaje ni la duracion del entrenamiento. Tampoco se indica si hubo una fase previa de SFT sobre el modelo base. La model card unicamente reproduce la plantilla automatica de TRL y la cita bibliografica de DPO, sin seccion de resultados ni de datos. La unica innovacion tecnica reseñable es, por tanto, el propio pipeline de DPO sobre el modelo base, no una aportacion arquitectonica.

## Capacidades

- Generacion de texto conversacional: heredada del modelo base instruct `google/gemma-4-31B-it`, con el pipeline declarado `text-generation`.
- Ajuste de estilo y comportamiento: el objetivo declarado del entrenamiento con DPO es modificar preferencias de respuesta, en este caso orientadas a un perfil "impulsivo" segun la nomenclatura del repositorio.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible; dependeria del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Contexto largo: no confirmado.

## Casos de uso

- Investigacion sobre alineamiento y ajuste por preferencias: sirve como artefacto reproducible para estudiar como DPO modifica rasgos de comportamiento en un modelo denso de ~31B, comparando el adaptador con el base sin ajustar bajo el mismo prompt.
- Evaluacion comparativa de recetas DPO: al existir una version "v3", puede emplearse en experimentos que contrasten iteraciones del mismo pipeline (distintos datasets de preferencias, betas o ranks) manteniendo fijo el modelo base.
- Red teaming y analisis de seguridad: un adaptador entrenado explicitamente hacia un perfil "impulsivo" es un candidato natural para probar si el ajuste por preferencias degrada salvaguardas, genera respuestas precipitadas o aumenta la tasa de afirmaciones no verificadas.
- Generacion creativa con voz controlada: en escritura de ficcion o dialogos de personaje donde se busque un tono impulsivo, el adaptador puede aplicarse sobre el base y compararse con la salida sin adaptador para medir el desplazamiento de estilo.
- Simulacion de agentes conversacionales con personalidad definida: para prototipos de personajes en entornos de investigacion, cargando el adaptador con PEFT y el base cuantizado en una GPU de 24 GB.
- Pruebas de degradacion en contexto largo: evaluar si el ajuste DPO afecta a la coherencia del modelo base en conversaciones multi-turno extensas, dado que el contexto efectivo no esta documentado.
- Analisis de coste de despliegue de adaptadores: al ocupar 2,0 GB, es un caso practico para medir el sobrecoste de servir multiples adaptadores LoRA sobre un mismo base en vLLM o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, GSM8K, HumanEval ni evaluaciones de preferencias (win rate, Elo), y tampoco se aportan metricas de entrenamiento como perdida, accuracy de pares o evolucion del reward implicito.

## Requisitos de hardware

- VRAM estimada para el modelo base de ~31B (estimacion a partir del numero de parametros, no confirmada por el autor): aproximadamente 62 GB en FP16/BF16, unos 31 GB en INT8 y entre 16 y 20 GB en cuantizacion de 4 bits, mas la cache KV segun la longitud de contexto.
- El adaptador anade un sobrecoste pequeno en inferencia (2,0 GB en disco); si se fusiona con el base, el coste en VRAM es el del modelo fusionado.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16/BF16 sin cuantizar; 2 x A6000 48 GB o 2 x L40S con tensor parallelism para FP16; RTX 4090 / RTX 6000 Ada (24-48 GB) solo con el base en 4 bits y contextos moderados.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 de 24 GB, unicamente con el modelo base cuantizado a 4 bits y ventanas de contexto cortas; en 16 GB no es viable.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama tras fusionar el adaptador y convertir el modelo a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `theo_gemma-4-31b-it_impulsive-dpo-v3-lora` (este) | Adaptador sobre base de 31B | No disponible | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas, 0 likes |
| `google/gemma-4-31B-it` (modelo base) | 31B (segun nomenclatura) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Condiciones del modelo base | HuggingFace, modelo oficial |
| Otros adaptadores DPO sobre el mismo base | No disponible | No disponible | No disponible | No disponible | No identificados en la informacion proporcionada |
| Adaptadores LoRA/DPO comparables en otros modelos densos de ~30B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, win rates ni pruebas de seguridad publicadas, por lo que no existe evidencia de que el ajuste mejore ninguna capacidad.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica que el artefacto no ha sido validado por terceros.
- Riesgo de comportamiento anomalo: el nombre "impulsive" sugiere un ajuste deliberado hacia respuestas menos reflexivas; en un modelo de 31B esto puede traducirse en mayor tasa de afirmaciones erroneas o decisiones precipitadas en tareas de razonamiento.
- Riesgo de alucinacion: heredado del modelo base y potencialmente incrementado por el ajuste por preferencias, que optimiza lo que el anotador prefiere, no la veracidad.
- Sesgos conocidos: no documentados por el autor; se heredan los del modelo base y los del dataset de preferencias, que no se especifica.
- Limitaciones de contexto e idioma: sin datos; no se puede asumir el contexto maximo del base ni cobertura multilingue.
- Restricciones de licencia: la model card solo incluye el campo generico `licence: license`, sin terminos concretos. Al derivar de un modelo base de Google, el uso comercial queda sujeto a las condiciones de dicho base, que el autor no reproduce. No debe asumirse permiso de uso comercial.
- Incompatibilidad potencial de versiones: el repositorio declara Transformers 5.15.0, TRL 1.0.0 y PyTorch 2.13.0, versiones que pueden no coincidir con las disponibles en el entorno del usuario; conviene verificar la compatibilidad antes de cargar el adaptador.
- Coste de inferencia elevado: incluso con el adaptador, se necesita el modelo base completo de ~31B, lo que limita su uso a hardware con al menos 24 GB de VRAM en configuracion cuantizada.
- Trazabilidad: sin dataset ni hiperparametros publicados, el resultado no es reproducible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_gemma-4-31b-it_impulsive-dpo-v3-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Paper de DPO: https://huggingface.co/papers/2305.18290
- Paper de DPO en NeurIPS 2023: http://papers.nips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de PEFT: https://github.com/huggingface/peft (referenciado por la libreria declarada, no incluido en la model card)
