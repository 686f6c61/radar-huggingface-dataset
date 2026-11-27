# godman0711/zils-mini-o1127a

## Resumen

zils-mini-o1127a es un ajuste fino (fine-tune) de tipo LoRA sobre un modelo base de la familia Qwen, concretamente Qwen/Qwen3.5-4B segun los metadatos del repositorio. Lo publica el usuario godman0711 en Hugging Face y forma parte de lo que el autor denomina "Zils subnet (127)" y "d3-mini soup". El modelo se presenta como un "body" destinado a tareas de decision ("decision questions") construidas a partir de eventos publicos con "Zils Outcomes", es decir, un modelo especializado en evaluar o resolver preguntas de decision sobre eventos.

Tecnicamente, el checkpoint combina una mezcla (soup) de dos modelos previos de la misma familia (joamCriff123/zils-mini-m1124a y malkolm777/zils-mini-m24-teacher-mlp) mediante promedio uniforme, y sobre ese cuerpo se aplica un ajuste LoRA de rango 16 con un factor de escala de 2. El resultado es un modelo de aproximadamente 4.539 millones de parametros (4,54 mil millones) almacenado en safetensors, con un tamano de repositorio de 9,1 GB y licencia Apache-2.0.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de la comunidad, sin descargas ni likes en el momento de la consulta, y sin model card detallada mas alla de la descripcion del proceso de mezcla y ajuste. Resulta util como ejemplo de pipeline de "model soup + LoRA" sobre un modelo base de 4B, pero no dispone de documentacion sobre datos de entrenamiento, evaluacion o capacidades verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.539.265.536 (aprox. 4,54 mil millones) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4B parametros, aunque la model card no detalla la arquitectura interna (numero de capas, dimensiones, atencion, etc.). Sobre esa base se construye un "soup" mediante promedio uniforme de los pesos de dos modelos: joamCriff123/zils-mini-m1124a y malkolm777/zils-mini-m24-teacher-mlp. Posteriormente se aplica un ajuste fino con LoRA de rango 16 sobre preguntas de decision derivadas de eventos publicos con Zils Outcomes, escalando el cambio con un factor de 2.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La informacion disponible se limita a la receta de mezcla y al tipo de ajuste LoRA, sin mas detalles sobre hiperparametros, epochs o datos.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen3.5-4B, aunque no se documenta explicitamente en la model card.
- Razonamiento y respuesta a preguntas de decision: el ajuste LoRA se orienta a "decision questions" construidas a partir de eventos publicos con Zils Outcomes.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Capacidad de mezcla de modelos: el checkpoint incorpora un "soup" de dos modelos, pero esto es una tecnica de construccion, no una capacidad de inferencia.

## Casos de uso

- Evaluacion de preguntas de decision sobre eventos publicos: el modelo se ha ajustado especificamente sobre este tipo de preguntas, por lo que puede emplearse para generar respuestas o estimaciones en ese dominio concreto, siempre que se valide su calidad con datos propios.
- Prototipado de pipelines de "model soup + LoRA": sirve como referencia practica para experimentar con promedios de pesos y ajustes de bajo rango sobre un modelo base de 4B en entornos de investigacion.
- Experimentos de investigacion sobre especializacion de modelos pequenos: su tamano (4,54B) permite ejecutarlo en hardware de gama alta consumer y estudiar el efecto del ajuste LoRA en tareas de decision.
- Base para further fine-tuning: al estar en safetensors y con licencia Apache-2.0, puede reutilizarse como punto de partida para ajustes adicionales en dominios relacionados con la toma de decisiones.
- Generacion de texto general (con cautela): si se confirma que conserva las capacidades del modelo base, podria usarse para tareas de generacion, pero no hay evaluacion que lo respalde.
- Entornos de investigacion con requisitos de licencia permisiva: la licencia Apache-2.0 facilita su uso y modificacion en proyectos academicos o comerciales, sujeto a las atribuciones indicadas en LICENSE y NOTICE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 4,54B parametros en safetensors (probablemente fp16/bf16), se requeririan aproximadamente 9 GB solo para los pesos; con cuantizacion a 8 bits o 4 bits el requisito bajaria, pero no se documentan variantes cuantizadas.
- GPU recomendadas: no disponible. Por tamano, cabria esperar que funcionase en GPUs con 16 GB o mas de VRAM (por ejemplo, RTX 4090, A100, H100), pero no hay confirmacion oficial.
- Compatibilidad con GPU consumer: probable en tarjetas con 16 GB o mas de VRAM si se usa fp16; no confirmado.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama, TGI ni otras).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-o1127a | 4,54B | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Soup + LoRA sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B | ~4B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face | Modelo base del que deriva |
| joamCriff123/zils-mini-m1124a | No disponible | No disponible | No disponible | Hugging Face | Componente del soup |
| malkolm777/zils-mini-m24-teacher-mlp | No disponible | No disponible | No disponible | Hugging Face | Componente del soup |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de evaluacion: no hay benchmarks ni metricas publicadas, por lo que se desconoce su calidad real frente al modelo base.
- Riesgo de alucinacion: al ser un ajuste sobre un modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en preguntas de decision sobre eventos.
- Sesgos: no documentados; al entrenarse sobre eventos publicos y "Zils Outcomes", puede heredar sesgos de esos datos.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones indicadas en LICENSE y NOTICE del repositorio.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (27 de noviembre de 2026), lo que sugiere un experimento reciente y sin validacion comunitaria.
- Procedencia de datos: la model card no detalla el dataset de ajuste ni el proceso de construccion de las preguntas de decision, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/godman0711/zils-mini-o1127a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Componente del soup: https://huggingface.co/joamCriff123/zils-mini-m1124a
- Componente del soup: https://huggingface.co/malkolm777/zils-mini-m24-teacher-mlp
