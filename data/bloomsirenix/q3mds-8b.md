# bloomsirenix/q3mds-8b

## Resumen

q3mds-8b es un modelo de lenguaje de 8.188.548.096 parámetros (~8,19 B) publicado por el usuario bloomsirenix en HuggingFace. No es un modelo entrenado desde cero, sino una fusión (merge) de cuatro modelos que comparten la arquitectura y el tokenizador de Qwen3-8B, generada con la herramienta mergekit mediante el método DARE-TIES. El objetivo declarado en la configuración es combinar en un único checkpoint cuatro "habilidades": la calidad conversacional de Qwen3-8B, el razonamiento destilado de DeepSeek-R1-0528-Qwen3-8B, las capacidades agénticas y de uso de herramientas de Qwen3-8B-ABC, y las tareas de edición de código de OpenCodeEdit-Qwen3-8B.

El modelo mantiene la arquitectura transformer densa decoder-only de Qwen3-8B (36 capas, dimensión oculta 4096), por lo que no introduce cambios estructurales respecto a la base: los task vectors (diferencia entre cada modelo y la base) se combinan con pesos que van de 0,10 a 0,35 y una densidad de 0,60 tras el descarte DARE y la poda TIES. El resultado se distribuye en bfloat16 sobre safetensors, con licencia Apache 2.0.

Su relevancia práctica es la de los merges de este tipo: obtener un modelo multitarea sin coste de entrenamiento adicional, reutilizando pesos ya publicados. Como contrapartida, se trata de un checkpoint recién publicado, sin descargas ni valoraciones en el momento de redactar esta ficha y sin resultados de evaluación publicados por el autor, por lo que su comportamiento real todavía no está verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Qwen3-8B: 36 capas, hidden size 4096) |
| Parametros totales | 8.188.548.096 (~8,19 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No confirmada por el autor; heredada de Qwen3-8B (no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | No publicados por el autor. Al conservar arquitectura y tokenizador de Qwen3-8B, es convertible a GGUF, AWQ y GPTQ con herramientas estandar |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (precision bfloat16) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado. Es el producto de un merge con mergekit sobre Qwen/Qwen3-8B como base, aplicando DARE-TIES (referencia arxiv:2311.03099). El método calcula el task vector de cada modelo participante respecto a la base, aplica DARE (drop aleatorio y rescalado de los delta) seguido de TIES (poda por magnitud y resolución de conflictos de signo) y suma los vectores resultantes normalizados. La configuración usa `density: 0.60` para los cuatro ingredientes, `normalize: true` e `int8_mask: true`, con `dtype: bfloat16`. Los pesos asignados son: Qwen3-8B 0,30 (ancla conversacional), DeepSeek-R1-0528-Qwen3-8B 0,35 (razonamiento), Qwen3-8B-ABC 0,25 (código agéntico y tool use) y OpenCodeEdit-Qwen3-8B 0,10 (formato de edición de código).

La condición para que este tipo de fusión funcione es que todos los ingredientes compartan arquitectura y tokenizador, algo que el autor destaca explícitamente en la configuración YAML: los cuatro derivan de Qwen3-8B y usan su tokenizador (`tokenizer_source: Qwen/Qwen3-8B`), de modo que los task vectors son comparables capa a capa. Al no haber fine-tuning posterior al merge ni etapas de RLHF o DPO propias de este checkpoint, las capacidades de alineación y de formato de chat son las heredadas de los modelos de origen. No se documentan datos de entrenamiento, número de tokens ni composición de dataset, porque no existe entrenamiento asociado.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del ancla Qwen3-8B (peso 0,30).
- Razonamiento multi-paso y cadenas de pensamiento, procedentes de la destilacion de DeepSeek-R1-0528 sobre Qwen3-8B (peso 0,35, el mayor del merge).
- Generacion y edicion de codigo, con especial enfasis en tareas de edicion en formato estructurado por la contribucion de OpenCodeEdit-Qwen3-8B.
- Uso de herramientas (tool calling / function calling) y comportamiento agéntico, atribuible al ingrediente Qwen3-8B-ABC.
- Capacidades multilingues: no disponibles en la informacion proporcionada; dependen de los modelos de origen y no estan confirmadas por el autor.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito, aunque el ingrediente R1-0528 introduce patrones de razonamiento largo.
- No hay ninguna evaluacion publicada que confirme que estas capacidades se conservan tras el merge; la atribucion anterior procede de la configuracion declarada, no de pruebas.

## Casos de uso

- Asistentes conversacionales de proposito general: el modelo puede gestionar dialogos multi-turno apoyandose en la contribucion de Qwen3-8B; conviene validar antes el formato de plantilla de chat, ya que el merge no documenta ajustes de alineacion propios.
- Edicion de codigo asistida en el IDE: la presencia de OpenCodeEdit-Qwen3-8B con peso 0,10 apunta a tareas de modificar fragmentos existentes en lugar de generar codigo desde cero; es el escenario donde el merge esta mas justificado por su composicion.
- Pipelines agénticos con tool calling: el ingrediente Qwen3-8B-ABC (peso 0,25) esta orientado a backend agéntico, por lo que un bucle de razonamiento con llamadas a funciones es un uso natural, siempre que se verifique el formato exacto de invocacion de herramientas.
- Razonamiento sobre documentacion tecnica: la mezcla con R1-0528 favorece respuestas con pasos intermedios en tareas de analisis, aunque la ventana de contexto efectiva debe confirmarse experimentalmente al no estar declarada.
- Generacion de tests y refactorizacion: combinacion de las capacidades de codigo y de razonamiento, util en tareas donde hay que justificar el cambio ademas de producirlo.
- Evaluacion comparativa de tecnicas de merge: el checkpoint sirve como caso de estudio reproducible de DARE-TIES con cuatro ingredientes de la misma familia, util para investigadores que estudien perdida de capacidades tras la fusion.
- Prototipado local en una sola GPU: con ~8,19 B de parametros, el modelo es desplegable en hardware de consumo tras cuantizacion, lo que permite experimentar sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye en la model card ninguna medicion de MMLU, HumanEval, GSM8K ni de evaluaciones de razonamiento, uso de herramientas o edicion de codigo. Tampoco se han publicado comparaciones con los cuatro modelos de origen ni con otros merges de Qwen3-8B. Cualquier cifra de rendimiento atribuida a este checkpoint seria una extrapolacion no verificada.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 16-17 GB solo para pesos, mas la cache KV; con contexto largo se recomienda reservar 20-24 GB.
- VRAM estimada cuantizado a 8 bits: aproximadamente 9-10 GB.
- VRAM estimada cuantizado a 4 bits (GGUF Q4_K_M y similares): aproximadamente 5-6 GB, con posibilidad de descarga parcial de capas a CPU.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para servicio en bfloat16 con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para bfloat16 en una sola GPU con contexto moderado; RTX 4080, 4070 Ti o GPUs de 12-16 GB mediante cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 sin cuantizar y en tarjetas de 8-12 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM, Hugging Face TGI; llama.cpp y Ollama requieren convertir previamente los safetensors a GGUF, ya que el repositorio no incluye cuantizaciones.
- Latencia y throughput: no disponibles. El autor no publica mediciones y no se han realizado pruebas independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bloomsirenix/q3mds-8b | 8,19 B | No confirmada (heredada de Qwen3-8B) | Merge DARE-TIES de 4 modelos | Apache 2.0 | Publicado; 0 descargas y 0 likes en el momento de la ficha |
| Qwen/Qwen3-8B | ~8,2 B | No disponible en la informacion proporcionada | Entrenamiento propio de Qwen | Apache 2.0 | Modelo base ampliamente usado y verificado |
| deepseek-ai/DeepSeek-R1-0528-Qwen3-8B | ~8,2 B | No disponible en la informacion proporcionada | Destilacion de R1-0528 sobre Qwen3-8B | No disponible en la informacion proporcionada | Publicado por DeepSeek, con evaluaciones propias |
| OpenMOSS-Team/Qwen3-8B-ABC | ~8,2 B | No disponible en la informacion proporcionada | Fine-tuning para uso agéntico | No disponible en la informacion proporcionada | Publicado |

La comparacion relevante es contra los propios ingredientes del merge: q3mds-8b hereda la arquitectura de todos ellos pero no aporta entrenamiento nuevo, de modo que solo tiene sentido si la combinacion supera a usar uno de los modelos originales por separado, algo que el autor no demuestra con datos. No hay benchmarks publicados que permitan establecer esa comparacion.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni pruebas de regresion, ni verificacion de que las capacidades de los cuatro ingredientes sobrevivan a la fusion. La interferencia entre task vectors es un riesgo conocido en merges de este tipo.
- Riesgo de degradacion por merge: con densidades de 0,60 y pesos normalizados, es habitual observar perdida de calidad en tareas que los modelos de origen resolvian, especialmente en formato de chat y en seguimiento de instrucciones.
- Riesgo de alucinacion: al no existir una etapa de alineacion propia de este checkpoint, el comportamiento frente a la invencion de datos es el heredado de los modelos de origen, sin garantias adicionales.
- Idiomas: no se especifica la lista de idiomas soportados. No debe asumirse cobertura multilingue sin probarla.
- Contexto: el autor no declara la longitud de contexto efectiva. Debe medirse antes de usarlo en produccion, ya que el merge puede afectar al comportamiento en ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los cuatro modelos de origen por si alguna impone condiciones adicionales no reflejadas en este repositorio.
- Madurez: el repositorio registra 0 descargas y 0 likes, con una fecha de creacion reciente y ninguna validacion por parte de la comunidad. No es un modelo apto para produccion sin una evaluacion interna previa.
- Trazabilidad: no se documentan datos de entrenamiento, tokenizador exacto, ni hiperparametros mas alla del YAML de mergekit, lo que dificulta reproducir o auditar el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bloomsirenix/q3mds-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Ingrediente de razonamiento: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Ingrediente agéntico: https://huggingface.co/OpenMOSS-Team/Qwen3-8B-ABC
- Ingrediente de edicion de codigo: https://huggingface.co/zkzhang88/OpenCodeEdit-Qwen3-8B
- Herramienta de merge: https://github.com/cg123/mergekit
- Paper del metodo (referencia arxiv:2311.03099, DARE): https://arxiv.org/abs/2311.03099
