# alexwengg/woof-pup-0.6b-coreml

## Resumen

Woof Pup 0.6B es un modelo de 0.6 mil millones de parametros especializado en triaje de correo electronico, desarrollado por el usuario alexwengg y publicado como build de Core ML para la Apple Neural Engine (ANE). Parte del modelo base Qwen/Qwen3-0.6B y ha sido destilado (knowledge distillation) a partir del teacher ConwayResearch/Underdog-Woof-4B-1.1, tambien conocido como Woof 4B. Su funcion es concreta: recibe un correo electronico y devuelve un unico objeto JSON con los campos category, intent, action_items, dates, amount y urgency.

El modelo resuelve un problema de clasificacion y extraccion estructurada en local, sin conexion a la nube, sobre hardware Apple. La relevancia actual esta en su caracter on-device: el 99.4% de las operaciones que ejecuta Core ML (7.190 ops) corren en la Neural Engine, con la CPU encargada solo del embedding lookup, algunas operaciones de posicion y mascara del KV-cache y la seleccion final del token siguiente. Esto permite ejecutar el modelo con un consumo de pocos vatios y la GPU completamente inactiva.

El contexto esta limitado a 1.024 tokens (definido en meta.yaml), suficiente para correos tipicos pero no para hilos largos, ya que 2 de 293 correos de evaluacion superan ese limite. Los pesos se cuantizan a 6 bits mediante tablas LUT y se distribuyen en tres submodelos Core ML, con un tamano de repositorio de 0.8 GB. La licencia es Apache-2.0, al igual que la del modelo base y la del teacher.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (base Qwen3-0.6B), 28 capas, convertido a Core ML |
| Parametros totales | 0.6B (modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (meta.yaml: context 1,024) |
| Tipos de cuantizacion | 6 bits con tablas LUT (lut6) en FFN y LM head; 4 bits descartado por romper la salida JSON |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML (.mlmodelc compilado y .mlpackage sin compilar) + tokenizer de Qwen3 |
| Tamano del repositorio | 0.8 GB |
| Prefill batch | 64 tokens |
| LM head split | 16 |
| Runtime requerido | macOS 15 / iOS 18 o superior |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-0.6B, un transformer decoder denso de 28 capas. Sobre esa base se aplico destilacion de conocimiento desde Woof 4B (ConwayResearch/Underdog-Woof-4B-1.1), un modelo de 4B especializado en la misma tarea. El resultado se publico primero como build de MLX en 8 bits (alexwengg/woof-pup-0.6b-mlx-8bit) y despues se convirtio a Core ML con ANEMLL, usando los parametros --lut2 6 --context 1024 --chunk 1. La compilacion se hizo con coremltools.models.utils.compile_model, sin necesidad de Xcode.

Los datos de entrenamiento proceden del dataset publico AESLC (Yale-LILY/aeslc), construido sobre el corpus de correo electronico Enron. El modelo no genera prosa: emite exclusivamente un objeto JSON con las claves category (una de request, fyi, scheduling, approval, negotiation, personal, announcement, other), intent, action_items, dates, amount y urgency (low, medium, high). La innovacion tecnica destacable es el reparto de operaciones entre ANE y CPU: la embedding lookup, ciertas operaciones de posicion y mascara del KV-cache y la eleccion final del token (que no tiene operacion equivalente en la Neural Engine) quedan en CPU, y el resto se ejecuta en ANE. El build no soporta Core ML sobre GPU, ya que el prefill por lotes de 64 tokens falla en el backend Metal.

## Capacidades

- Generacion de JSON estructurado a partir de un correo electronico, con validacion del 100% en el conjunto de evaluacion.
- Clasificacion del correo en ocho categorias predefinidas.
- Extraccion de intencion en una frase de un maximo de 20 palabras.
- Extraccion de elementos de accion (action_items) como array de cadenas cortas.
- Extraccion de fechas y plazos tal y como aparecen escritos en el correo.
- Extraccion de importes monetarios en formato {"value": number, "currency": "USD"} o null si no hay importe.
- Asignacion de nivel de urgencia (low, medium, high).
- Inferencia completamente local en Apple Neural Engine, sin GPU y con consumo de pocos vatios.
- Formato de prompt ChatML con bloque de pensamiento vacio (thinking desactivado en la practica).
- No dispone de tool calling, function calling, soporte de agentes, vision ni audio segun la informacion disponible.

## Casos de uso

- Triaje de bandeja de entrada en local: el modelo procesa cada correo entrante y devuelve categoria y urgencia, permitiendo clasificar automaticamente sin enviar el contenido a un servicio externo y sin que la GPU del equipo se active.
- Extraccion de tareas pendientes: a partir de action_items, un cliente de correo puede generar listas de tareas por cada mensaje, con contexto de 1.024 tokens suficiente para correos estandar.
- Deteccion de plazos y fechas: el campo dates permite alimentar un calendario o un sistema de recordatorios con las fechas tal y como se mencionan en el correo.
- Procesamiento de facturas y comunicaciones comerciales: el campo amount extrae importes monetarios (con una concordancia del 93.8% frente a las etiquetas del teacher), util para preclasificar correos de proveedores.
- Priorizacion de colas de soporte: la urgencia asignada (87.3% de concordancia con el teacher) permite ordenar una bandeja compartida por criticidad antes de que intervenga una persona.
- Aplicaciones moviles iOS nativas: al requerir solo macOS 15 / iOS 18 o superior y ejecutarse integramente en ANE, puede embeberse en una app que haga triaje de correo en el propio dispositivo, sin coste de inferencia en servidor.
- Filtrado y enrutado previo a un LLM mayor: por su tamano y latencia de primer token (~560 ms en un correo de ~290 tokens sobre M5 Pro), sirve como primera etapa barata que decide que correos merecen un modelo mas grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay cifras de MMLU, HumanEval, GSM8K ni similares). La model card si incluye una evaluacion de concordancia frente a las etiquetas del teacher Woof 4B sobre 291 correos reservados (2 de los 293 superan el contexto de 1.024 tokens):

| Campo | Concordancia con Woof 4B |
|---|---|
| JSON valido | 100% |
| Category | 71.5% |
| Urgency | 87.3% |
| Amount | 93.8% |

Rendimiento medido en Apple M5 Pro:

| Metrica | Neural Engine (este build) | GPU, MLX 8-bit |
|---|---|---|
| Generacion | ~80 tok/s | ~240 tok/s |
| Procesamiento de prompt | ~550-650 tok/s | no disponible |
| Primer token (correo de ~290 tokens) | ~560 ms | ~35 ms |
| Uso de GPU | ninguno | si |

La menor velocidad por token en ANE se debe a que la decodificacion esta limitada por el ancho de banda de memoria; a cambio, el consumo es de pocos vatios con la GPU inactiva.

## Requisitos de hardware

- No aplica VRAM en el sentido de GPU dedicada: la inferencia se ejecuta en Apple Neural Engine sobre memoria unificada de Apple Silicon.
- Hardware medido: Apple M5 Pro. El modelo esta pensado para equipos Apple Silicon con Neural Engine.
- Tamano en disco: 0.8 GB para el repositorio completo (tres submodelos Core ML mas tokenizer).
- Sistema operativo: macOS 15 o iOS 18 o superior.
- Uso de GPU: ninguno en este build; la GPU queda libre para otras tareas.
- Core ML sobre GPU no soportado: el prefill por lotes de 64 tokens falla en el backend Metal.
- Despliegue: runner Python de ANEMLL (tests/chat.py con --meta), paquete Swift AnemllCore (YAMLConfig, ModelLoader, InferenceManager) y los ficheros .mlpackage para Xcode.
- Alternativa de mayor velocidad: el build MLX 8-bit (alexwengg/woof-pup-0.6b-mlx-8bit) alcanza ~240 tok/s y ~35 ms hasta el primer token, a costa de usar la GPU.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| woof-pup-0.6b-coreml (este) | 0.6B | 1.024 | ~80 tok/s, primer token ~560 ms; concordancia JSON 100%, category 71.5%, urgency 87.3%, amount 93.8% | apache-2.0 | HuggingFace, Core ML / ANE |
| alexwengg/woof-pup-0.6b-mlx-8bit | 0.6B | no disponible | ~240 tok/s, primer token ~35 ms; calidad dentro de 1.5 puntos respecto a este build | apache-2.0 | HuggingFace, MLX (GPU) |
| ConwayResearch/Underdog-Woof-4B-1.1 (teacher) | 4B | no disponible | referencia de etiquetado usado en la evaluacion | apache-2.0 (segun la model card) | HuggingFace |
| Qwen/Qwen3-0.6B (base) | 0.6B | no disponible | no disponible | apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparables para otros modelos de triaje de correo de tamano similar.

## Limitaciones y advertencias

- Contexto de solo 1.024 tokens: en la evaluacion, 2 de 293 correos lo superaron, por lo que los hilos largos o los correos extensos quedan fuera.
- Modelo especializado exclusivamente en ingles; no hay soporte multilingue documentado.
- Uso restringido a la tarea de triaje: no es un modelo de proposito general y su prompt debe seguir exactamente el formato de entrenamiento (ChatML con el system prompt, el prefijo EMAIL:\n y el bloque de pensamiento vacio). Fuera de ese formato no hay garantia de comportamiento.
- La concordancia de categoria con el teacher es del 71.5%, la mas baja de los campos evaluados: cabe esperar desacuerdos en la clasificacion, no solo errores respecto a una verdad absoluta, ya que la referencia son las etiquetas de Woof 4B.
- La salida JSON solo es valida si se respeta el formato de prompt; el 4-bit LUT rompio la salida JSON, de ahi el uso obligatorio de 6 bits.
- Extraccion de importes limitada al esquema documentado (USD como divisa en el ejemplo) y dependiente de como aparezca el importe en el texto.
- El build no funciona en el backend Metal de Core ML (falla el prefill por lotes de 64 tokens), por lo que el despliegue esta atado a ANE y a macOS 15 / iOS 18 o superior.
- Licencia Apache-2.0, que permite uso comercial; el dataset de entrenamiento (AESLC, sobre el corpus Enron) es publico, pero conviene revisar las condiciones de dicho corpus para usos sensibles.
- Sin datos publicados de benchmarks estandar ni de sesgos evaluados; no hay informacion disponible sobre tasas de alucinacion mas alla de la validacion de formato JSON.
- Repositorio sin descargas ni likes registrados en el momento de la consulta, lo que implica poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexwengg/woof-pup-0.6b-coreml
- Build MLX 8-bit: https://huggingface.co/alexwengg/woof-pup-0.6b-mlx-8bit
- Teacher (Woof 4B): https://huggingface.co/ConwayResearch/Underdog-Woof-4B-1.1
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset AESLC: https://huggingface.co/datasets/Yale-LILY/aeslc
- ANEMLL (herramienta de conversion): https://github.com/Anemll/Anemll
