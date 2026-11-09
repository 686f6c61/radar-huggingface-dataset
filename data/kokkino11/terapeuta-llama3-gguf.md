# Kokkino11/terapeuta-llama3-gguf

## Resumen

Kokkino11/terapeuta-llama3-gguf es un modelo conversacional derivado de la familia Llama 3, publicado por el usuario Kokkino11 en Hugging Face. El nombre sugiere un ajuste fino orientado a tareas de acompanamiento terapeutico o conversacion de apoyo emocional, aunque no se ha publicado documentacion que lo confirme. El repositorio contiene pesos en safetensors y cuantizaciones en formato GGUF, lo que facilita su despliegue en entornos de inferencia local.

Con 8.030.261.312 parametros (aproximadamente 8 mil millones), el modelo se situa en la categoria de Llama 3 8B, un tamano que cabe en GPU de consumo con cuantizacion de 4 bits. El repositorio ocupa 10,2 GB, coherente con la presencia de pesos en precision completa o media junto con varias versiones GGUF.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: no hay model card, no se especifican datos de entrenamiento, licencia ni idiomas, y el numero de descargas es muy bajo (40). Se trata, por tanto, de un ajuste comunitario sin validacion publica, y cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3, inferida por el nombre y el numero de parametros) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible (la familia Llama 3 8B soporta 8.192 tokens; no confirmado para este ajuste) |
| Tipos de cuantizacion | GGUF (el repositorio incluye ficheros GGUF; niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atencion causal, coherente con la familia Llama 3. El recuento exacto de parametros (8.030.261.312) coincide con el de Llama 3 8B, lo que sugiere que se parte de ese checkpoint y se aplica un ajuste fino supervisado, probablemente con un dataset de conversaciones de tematica terapeutica o de apoyo emocional, aunque no se ha publicado informacion al respecto.

No hay datos disponibles sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Tampoco se documenta si se ha modificado el tokenizador o el vocabulario respecto al modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, presumiblemente orientada a dialogo de apoyo emocional segun el nombre del modelo.
- Razonamiento general y respuesta a instrucciones heredadas del modelo base Llama 3 8B.
- Generacion de codigo y matematicas basicas, como capacidad residual del modelo base (no validada en este ajuste).
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no documentado).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales de apoyo emocional: el modelo puede emplearse para experimentar con dialogos multi-turno en un entorno controlado, siempre con supervision humana y sin sustituir atencion profesional.
- Despliegue local en estaciones de trabajo: gracias a los ficheros GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU de consumo, lo que permite probar el ajuste sin infraestructura cloud.
- Investigacion sobre ajuste fino comunitario: util para estudiar como cambia el comportamiento de Llama 3 8B tras un ajuste especifico de dominio, comparando respuestas con el modelo base.
- Generacion de respuestas empaticas en aplicaciones de bienestar: puede integrarse como capa de generacion en una app de diario emocional o chat de acompanamiento, con filtros de seguridad adicionales.
- Evaluacion de sesgos y alucinaciones en modelos de tematica sensible: sirve como caso de estudio para medir la tendencia a inventar recursos o recomendaciones en contextos de salud mental.
- Base para nuevos ajustes: al estar disponible en safetensors, puede reutilizarse como punto de partida para fine-tuning adicional con LoRA o QLoRA en tareas de consejeria o entrevista motivacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (2 bytes por parametro para 8,03 mil millones de parametros, mas overhead de contexto).
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 24 GB.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion de 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: llama.cpp y Ollama para los ficheros GGUF; vLLM, TGI o Transformers para los safetensors.
- Latencia y throughput: no disponibles; dependeran del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kokkino11/terapeuta-llama3-gguf | 8,03 B | no disponible | no disponible | Hugging Face, 40 descargas |
| Meta Llama 3 8B Instruct | 8,03 B | 8.192 tokens | Llama 3 Community License | Ampliamente disponible |
| Mistral 7B Instruct | 7,24 B | 32.768 tokens | Apache 2.0 | Ampliamente disponible |
| Qwen2.5 7B Instruct | 7,62 B | 131.072 tokens | Apache 2.0 | Ampliamente disponible |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados para el modelo objeto de esta ficha. Frente a las alternativas, el principal handicap es la ausencia de licencia explicita y de documentacion, lo que complica su adopcion en produccion.

## Limitaciones y advertencias

- Ausencia de model card: no se documentan datos de entrenamiento, licencia, idiomas ni limitaciones, lo que impide evaluar riesgos de forma rigurosa.
- Licencia no disponible: no puede confirmarse si se permite uso comercial; el modelo base Llama 3 impone restricciones adicionales que podrian aplicar.
- Riesgo de alucinacion elevado en contextos de salud mental: un ajuste terapeutico sin validacion clinica puede generar recomendaciones incorrectas o peligrosas.
- Sesgos desconocidos: al no publicarse la composicion del dataset, no es posible identificar sesgos de genero, culturales o de otro tipo.
- Contexto e idiomas no confirmados: no se garantiza el soporte multilingue ni una ventana de contexto concreta.
- Bajo numero de descargas y ausencia de validacion comunitaria: no hay evidencia de calidad ni de estabilidad en produccion.
- No apto como sustituto de atencion psicologica profesional: cualquier despliegue en ese ambito debe incluir supervision humana y protocolos de derivacion.
- Fecha de creacion futura (2026) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kokkino11/terapeuta-llama3-gguf
- Repositorio de Llama 3 (modelo base): https://github.com/meta-llama/llama3
- Llama 3 en Hugging Face: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
