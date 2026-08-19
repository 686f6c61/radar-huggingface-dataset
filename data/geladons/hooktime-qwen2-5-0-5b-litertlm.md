# geladons/hooktime-qwen2.5-0.5b-litertlm

## Resumen

El modelo `geladons/hooktime-qwen2.5-0.5b-litertlm` es un fine-tune LoRA del modelo base Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el autor `geladons` para la aplicación Android HookTime: Fishing Forecast. Su propósito es generar un breve informe diario de pesca a partir de datos meteorológicos y solunares estructurados (ventanas solunares, mareas, viento, oleaje y presión atmosférica). El modelo está optimizado para ejecutarse en dispositivos móviles mediante Google LiteRT-LM, con cuantización q8 y una longitud de contexto fija de 128 tokens.

Este modelo no es un asistente conversacional de propósito general; está ajustado exclusivamente para un formato de prompt específico. Su relevancia radica en demostrar cómo un modelo pequeño (0.5B) puede adaptarse mediante LoRA a una tarea vertical concreta y desplegarse de forma eficiente en hardware de gama baja, generando un texto de unas 130 palabras en 25-30 segundos en un Snapdragon 480-class. El repositorio tiene 0 descargas y 0 likes, y fue creado en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5, decoder-only) |
| Parametros totales | 0.5B (base) + adaptadores LoRA (no se especifica el numero de parametros del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (fijado en el fine-tune; el modelo base soporta hasta 128K) |
| Tipos de cuantizacion | q8 (8 bits) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero el fine-tune esta orientado a un unico formato en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | .litertlm (formato de LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con 0.5 mil millones de parametros, preentrenado por Alibaba sobre 18 billones de tokens y posteriormente ajustado con instrucciones. Sobre esta base se aplica un fine-tune con adaptadores LoRA (Low-Rank Adaptation) para especializarlo en la generacion de briefings de pesca. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni el proceso de alineacion (RLHF/DPO). La cuantizacion q8 reduce el peso del modelo a aproximadamente 492 MB, lo que permite su ejecucion en CPU de telefonos de gama baja mediante LiteRT-LM (version 0.13.1). La longitud de contexto se fija en 128 tokens, muy por debajo del maximo del modelo base, para optimizar la latencia y el consumo de memoria en dispositivos moviles.

## Capacidades

- Generacion de briefings de pesca: produce un texto de unas 130 palabras a partir de datos estructurados (ventanas solunares, mareas, viento, oleaje, presion).
- Ejecucion on-device: optimizado para correr en CPU de telefonos Android mediante LiteRT-LM, sin necesidad de GPU ni conexion a internet.
- Inferencia rapida en hardware modesto: genera el briefing en 25-30 segundos en un Snapdragon 480-class (4 nucleos CPU).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un chatbot: solo responde al formato de prompt especifico para el que fue entrenado.
- Capacidades multilingues: no confirmadas; el modelo base es multilingue, pero el fine-tune parece orientado a un unico idioma (probablemente ingles).

## Casos de uso

- Aplicacion movil de prediccion de pesca: el modelo genera un resumen diario personalizado para pescadores, integrando datos de mareas y solunares en un texto legible.
- Asistente offline para actividades al aire libre: puede desplegarse en dispositivos sin conectividad para proporcionar informes meteorologicos y de pesca en tiempo real.
- Prototipo de IA en el borde: sirve como ejemplo de como adaptar un LLM pequeno a una tarea vertical con LoRA y desplegarlo en hardware limitado.
- Generacion de notificaciones push: el briefing generado puede enviarse como notificacion diaria en la app HookTime.
- Sistema de recomendacion contextual: a partir de los datos estructurados, el modelo produce una recomendacion de los mejores momentos para pescar.
- Evaluacion de tecnicas de compresion: el formato .litertlm y la cuantizacion q8 permiten estudiar el equilibrio entre tamano, latencia y calidad en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento indicada es la latencia de generacion: 25-30 segundos para un texto de ~130 palabras en un Snapdragon 480-class (CPU x4). No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada: no aplica (inferencia en CPU, sin GPU).
- GPU recomendadas: ninguna; el modelo esta disenado para CPU de telefonos.
- Compatibilidad con consumer GPU: no relevante, aunque podria ejecutarse en cualquier GPU con suficiente memoria (menos de 1 GB).
- Opciones de despliegue: LiteRT-LM (litertlm-android 0.13.1) en Android; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 25-30 segundos por generacion de ~130 tokens en un Snapdragon 480-class (4 nucleos). En hardware superior la latencia seria menor.
- Tamano del modelo: ~492 MB en cuantizacion q8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0.5B | 128K | Apache-2.0 | safetensors, GGUF, etc. | Chat general, multilingue |
| hooktime-qwen2.5-0.5b-litertlm | 0.5B + LoRA | 128 (fijo) | Apache-2.0 | .litertlm | Briefing de pesca on-device |
| Otros modelos 0.5B (p.ej. Llama 3.2 1B, Gemma 2 2B) | 0.5-2B | 8K-128K | Varias | Varios | Chat general, tareas diversas |

No se dispone de datos de rendimiento comparativo. La principal diferencia es la especializacion: este modelo sacrifica versatilidad por eficiencia en una tarea concreta, con un formato de pesos propietario de LiteRT-LM.

## Limitaciones y advertencias

- No es un modelo de proposito general: solo responde al formato de prompt especifico de la app HookTime; cualquier otro uso producira resultados incorrectos o incoherentes.
- Longitud de contexto muy limitada (128 tokens): no puede manejar entradas largas ni conversaciones multi-turno.
- Sesgos del modelo base: al derivar de Qwen2.5-0.5B-Instruct, puede heredar sesgos presentes en los datos de preentrenamiento, aunque el fine-tune reduce su impacto en la tarea especifica.
- Riesgo de alucinacion: al ser un modelo pequeno y especializado, puede generar datos inexactos si los datos de entrada son ambiguos o estan fuera del rango esperado.
- Dependencia de LiteRT-LM: el formato .litertlm no es compatible con otros frameworks de inferencia (vLLM, llama.cpp, etc.), lo que limita su portabilidad.
- Sin soporte para tool calling ni agentes: no puede interactuar con APIs externas ni ejecutar acciones.
- Idiomas no confirmados: aunque el modelo base es multilingue, el fine-tune parece orientado a un unico idioma; no se garantiza soporte para otros.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero el modelo esta disenado para una aplicacion especifica y su reutilizacion en otros contextos requeriria reentrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/geladons/hooktime-qwen2.5-0.5b-litertlm
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Informe tecnico Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Pagina de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:0.5b
