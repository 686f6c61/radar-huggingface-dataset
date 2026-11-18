# BashirEmran/d3-lite-body-a3

## Resumen

d3-lite body a3 es un ajuste fino (fine-tuning) del modelo Qwen3.5-0.8B, desarrollado por el usuario BashirEmran bajo el paraguas de un proyecto denominado "Zils d3-lite". Se trata de un modelo de decisión ("decision model") de pequeno tamano, con 852.985.920 parametros reales segun los pesos en safetensors, pensado para tareas de razonamiento estructurado y toma de decisiones tipadas a partir de instrucciones.

El modelo parte de una mezcla de modelos ("soup") previamente publicada del propio autor y se ha entrenado mediante un LoRA de rango 16 durante una epoca, con optimizador AdamW, tasa de aprendizaje 2e-4 y schedule lineal, sobre filas publicas de decisiones tipadas y elementos generados de aritmetica multi-paso. El LoRA se ha fusionado en los pesos finales, de modo que el repositorio contiene un modelo denso listo para inferencia, no un adaptador separado.

Su relevancia es limitada pero concreta: ocupa el nicho de modelos sub-1B orientados a decisiones estructuradas y conteo aritmetico, con licencia Apache 2.0 y un tamano de repositorio de 1,7 GB que permite desplegarlo en hardware modesto. La ausencia de descargas, likes y benchmarks publicados hace que deba evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B; etiqueta `qwen3_5` con `custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5. El repositorio declara la etiqueta `qwen3_5` y `custom_code`, lo que implica que la carga requiere ejecutar codigo remoto del repositorio y que la implementacion no es la estandar de `transformers` sin ese paso. No se detalla en la informacion disponible si incorpora innovaciones como atencion lineal, decodificacion especulativa o modos de pensamiento.

El entrenamiento consistio en un LoRA de rango 16 aplicado sobre una "soup" publicada previamente del proyecto d3-lite, con una epoca, AdamW, tasa de aprendizaje 2e-4 y schedule lineal. Los datos de entrenamiento combinan filas publicas de decisiones tipadas ("typed-decision rows") con elementos generados de aritmetica multi-paso orientados al conteo. Se uso un ancla KL ("KL anchor") hacia las respuestas de la soup de partida para limitar la deriva respecto al modelo original. El adaptador LoRA se fusiono en los pesos finales. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento basico, heredados del modelo base Qwen3.5-0.8B.
- Toma de decisiones tipadas: el entrenamiento se orienta a producir salidas estructuradas de decision a partir de entradas tipadas.
- Aritmetica multi-paso y conteo: se incluyeron elementos generados de conteo aritmetico en el entrenamiento.
- Razonamiento multi-paso acotado, segun el diseno del proyecto d3-lite.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion y enrutamiento de decisiones tipadas: el modelo puede recibir una entrada estructurada y devolver una decision categorica, aprovechando el entrenamiento especifico sobre filas de decision tipadas; adecuado para pipelines de triaje internos.
- Conteo y verificacion aritmetica simple: util para tareas de conteo de elementos y comprobaciones aritmeticas de pocos pasos, donde el entrenamiento incluyo datos generados de esta naturaleza.
- Preprocesado en pipelines de agentes: al ser un modelo sub-1B, puede actuar como "router" o clasificador de intenciones antes de invocar un modelo mayor, reduciendo coste y latencia.
- Prototipado rapido en local: su tamano (852M parametros, 1,7 GB de repositorio) permite experimentar en una estacion de trabajo sin GPU de gama alta.
- Educacion e investigacion sobre fine-tuning: sirve como ejemplo reproducible de LoRA fusionado con ancla KL sobre un modelo base pequeno, para estudiar tecnicas de ajuste.
- Despliegue en entornos con recursos limitados: al caber en memoria de GPUs consumer y CPU, puede integrarse en servicios de baja concurrencia donde un modelo mayor no es viable.
- Evaluacion comparativa de metodos de "soup" y LoRA: util como caso de estudio para medir el efecto de la fusion de adaptadores sobre el comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, alrededor de 2-3 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,9-1,2 GB; en 4 bits, alrededor de 0,5-0,8 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 en contextos cortos (RTX 3050, RTX 4060, T4); A100/H100 no son necesarias.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas; tambien puede ejecutarse en CPU con llama.cpp si se generan pesos GGUF (no publicados).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada por las etiquetas del repositorio; vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura con `custom_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| BashirEmran/d3-lite-body-a3 | 852.985.920 | no disponible | Apache 2.0 | Fine-tuning LoRA fusionado de Qwen3.5-0.8B, orientado a decisiones tipadas |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible en esta ficha | Modelo base del que deriva; capacidades generales |
| Qwen2.5-0.5B / Qwen2.5-1.5B | 0,5B / 1,5B | 32K (familia Qwen2.5) | Apache 2.0 | Alternativas generalistas de tamano similar con amplia documentacion y cuantizaciones GGUF |

La comparacion con la familia Qwen2.5 se incluye como referencia de categoria (modelos sub-2B de proposito general), no como equivalencia funcional: d3-lite-body-a3 esta especializado en decisiones tipadas y no declara capacidades generales ni benchmarks.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al modelo base ni frente a alternativas.
- Sin descargas ni validacion de la comunidad: el repositorio tiene 0 descargas y 0 likes, por lo que no ha sido contrastado por terceros.
- Requiere `trust_remote_code`: la etiqueta `custom_code` implica ejecutar codigo del autor al cargar el modelo, con el riesgo de seguridad asociado.
- Idiomas no declarados: no se especifica que idiomas soporta; el entrenamiento parece orientado a datos en ingles ("typed-decision rows"), lo que puede degradar el rendimiento en castellano.
- Riesgo de alucinacion: como todo modelo generativo pequeno, puede producir decisiones o conteos incorrectos con alta confianza; requiere validacion en produccion.
- Deriva respecto al modelo base: el ancla KL limita pero no elimina el olvido catastrofico; las capacidades generales del Qwen3.5-0.8B pueden haberse degradado tras el ajuste.
- Contexto desconocido: no se documenta la longitud de contexto efectiva, lo que impide planificar cargas con entradas largas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B, no detalladas en esta informacion.
- Fecha de creacion futura (2026-11-18): el repositorio indica una fecha posterior a la actual, lo que sugiere metadatos inconsistentes o un entorno de pruebas; conviene tratarlo con precaucion.

## Enlaces

- Hugging Face: https://huggingface.co/BashirEmran/d3-lite-body-a3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper, blog, repositorio o demo del autor: no disponible en la informacion proporcionada.
