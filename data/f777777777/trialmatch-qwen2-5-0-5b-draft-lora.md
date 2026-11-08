# f777777777/trialmatch-qwen2.5-0.5b-draft-lora

## Resumen
TrialMatch draft es un adaptador LoRA publicado por el usuario f777777777 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su proposito declarado es servir como modelo borrador (draft model) para decodificacion especulativa en el contexto de emparejamiento de pacientes con ensayos clinicos (clinical trial matching). El adaptador se entreno sobre el split de entrenamiento de 37 pacientes del dataset ncbi/TrialGPT-Criterion-Annotations, usando un split agrupado por paciente con semilla 42.

El modelo base Qwen2.5-0.5B-Instruct pertenece a la familia Qwen2.5, que cubre tamanos de 0.5B, 1.5B, 3B, 7B, 14B, 32B y 72B en variantes preentrenadas e instruction-tuned. Con solo 0.5B parametros, este modelo esta pensado para entornos con recursos muy limitados, y su uso como draft en decodificacion especulativa busca acelerar la inferencia de un modelo mayor verificador.

La relevancia de esta ficha es limitada: se trata de un adaptador experimental con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y marcado explicitamente por el autor como prototipo educativo de cribado, no apto para uso clinico. No debe confundirse con un modelo de produccion ni con una herramienta de decision medica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer decoder-only Qwen2.5-0.5B-Instruct |
| Parametros totales | no disponible (el adaptador LoRA es un subconjunto de bajo rango; el modelo base tiene 0.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El adaptador se implementa con la libreria PEFT y se aplica sobre Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0.5B parametros de la familia Qwen2.5. Al ser un adaptador LoRA, no se reentrena el modelo base completo, sino que se anaden matrices de bajo rango en determinadas capas, lo que reduce drasticamente el coste de entrenamiento y el tamano del artefacto resultante. El repositorio ocupa 0.0 GB segun la informacion disponible, coherente con un adaptador de muy pocos parametros.

El entrenamiento se realizo sobre el split de entrenamiento (37 pacientes) del dataset ncbi/TrialGPT-Criterion-Annotations, con una particion agrupada por paciente y semilla 42 para evitar fuga de informacion entre conjuntos. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El autor indica que el codigo, el manifiesto del split y la evaluacion estan disponibles en el repositorio de GitHub https://github.com/FatimaRana50/trialmatch.

## Capacidades
- Generacion de texto condicionada al dominio de ensayos clinicos y criterios de elegibilidad, segun el dataset de entrenamiento.
- Actua como modelo borrador (draft) para decodificacion especulativa, cuya funcion es proponer tokens que un modelo mayor verifica despues.
- Capacidades funcionales heredadas del modelo base Qwen2.5-0.5B-Instruct (generacion de texto, instrucciones basicas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso
- Decodificacion especulativa en pipelines de cribado de ensayos clinicos: el adaptador se usaria como draft model para proponer tokens que un modelo verificador mayor valida, reduciendo la latencia en tareas de emparejamiento paciente-ensayo.
- Prototipos educativos de emparejamiento de criterios: permite experimentar con la tarea de asociar pacientes a criterios de elegibilidad usando un modelo de 0.5B, adecuado para entornos de docencia e investigacion con recursos limitados.
- Investigacion sobre LoRA en dominios especializados: sirve como caso de estudio de como un adaptador de bajo rango modifica el comportamiento de un modelo pequeno en un dominio concreto con solo 37 pacientes de entrenamiento.
- Experimentacion con PEFT y safetensors: util para desarrolladores que quieran reproducir el flujo de carga de adaptadores LoRA sobre Qwen2.5-0.5B-Instruct con la libreria PEFT.
- Evaluacion de tecnicas de split agrupado por paciente: el manifiesto del split (seed 42) permite reproducir experimentos sobre fuga de datos en datasets clinicos.
- Pruebas de integracion en pipelines de Hugging Face Transformers: al ser un adaptador ligero, se puede cargar y descartar rapidamente en entornos de prueba sin apenas consumo de memoria.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un adaptador sobre un modelo de 0.5B, el consumo es muy bajo, del orden de unos pocos GB en funcion de la precision y la longitud de contexto.
- GPU recomendadas: no disponible; cualquier GPU con suficiente VRAM para el modelo base Qwen2.5-0.5B-Instruct deberia ser suficiente.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base, aunque no se confirma en la informacion proporcionada.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la libreria PEFT y Transformers; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trialmatch-qwen2.5-0.5b-draft-lora | Adaptador LoRA sobre 0.5B | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0.5B | no disponible en la informacion proporcionada | sin datos en esta ficha | apache-2.0 (segun modelo base) | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | no disponible en la informacion proporcionada | sin datos en esta ficha | apache-2.0 (segun modelo base) | Hugging Face |
| Qwen2.5-3B-Instruct | 3B | no disponible en la informacion proporcionada | sin datos en esta ficha | apache-2.0 (segun modelo base) | Hugging Face |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias
- El autor declara explicitamente que es un prototipo educativo de cribado y que no es apto para uso clinico.
- Entrenado con solo 37 pacientes, lo que limita severamente su generalizacion a poblaciones reales.
- Riesgo elevado de alucinacion en tareas clinicas al tratarse de un modelo de 0.5B especializado con datos muy reducidos.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponible en la informacion proporcionada.
- Restricciones de licencia para uso comercial: licencia apache-2.0, que en principio permite uso comercial, pero el propio autor desaconseja su uso clinico.
- Cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad.

## Enlaces
- Hugging Face: https://huggingface.co/f777777777/trialmatch-qwen2.5-0.5b-draft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Codigo, split y evaluacion: https://github.com/FatimaRana50/trialmatch
