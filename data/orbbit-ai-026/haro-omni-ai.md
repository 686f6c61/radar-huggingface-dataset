# orbbit-AI-026/haro-omni-AI

## Resumen

haro-omni-AI es un modelo publicado por orbbit-AI-026 en Hugging Face, etiquetado con la arquitectura `qwen3_omni_moe` y distribuido bajo licencia Apache 2.0. Con 35.259.818.545 parámetros totales (unos 35,26 mil millones) y un repositorio de 70,5 GB en formato safetensors, se posiciona como un modelo multimodal omni (texto, voz y probablemente visión) derivado de la familia Qwen3-Omni, con arquitectura Mixture of Experts. La model card lo describe explícitamente como un modelo para "conversación por voz en tiempo real: escucha y responde hablando", orientado a su producto Hi Chat.

La relevancia del modelo radica en su enfoque hacia la interacción por voz de baja latencia dentro de un asistente conversacional, un nicho donde los modelos omni (que unifican entrada de audio, texto e imagen en un solo transformer) están ganando terreno frente a pipelines separados de ASR + LLM + TTS. Al estar basado en Qwen3-Omni, hereda presumiblemente las capacidades multimodales y el modo de razonamiento de dicha familia, aunque el autor no detalla en la model card qué componentes ha modificado, ajustado o eliminado.

No obstante, la información pública es extremadamente escasa: no se documentan datos de entrenamiento, benchmarks, idiomas soportados, longitudes de contexto ni detalles de la variante MoE (parámetros activos). El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 10 de noviembre de 2026. Cualquier evaluación seria requiere inspeccionar los pesos y la configuración directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_omni_moe (transformer omni multimodal con Mixture of Experts) |
| Parametros totales | 35.259.818.545 (aprox. 35,26 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `qwen3_omni_moe` indica que el modelo sigue la arquitectura de la familia Qwen3-Omni en su variante Mixture of Experts: un transformer con capas de expertos dispersos que procesa múltiples modalidades (texto, audio y, en la familia de origen, visión) dentro de un mismo modelo, en lugar de encadenar módulos separados. El recuento de 35,26 mil millones de parámetros totales es consistente con una variante MoE de tamaño medio de dicha familia, aunque el número de parámetros activos por token no se especifica en la información disponible.

No se dispone de datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de audio frente a texto), ni sobre si el autor aplicó ajuste fino supervisado, RLHF o DPO sobre el modelo base Qwen3-Omni. La model card únicamente menciona que se trata de un modelo de Orbbit AI para Hi Chat y remite a los ficheros `LICENSE` y `NOTICE` para los avisos de autoría del modelo de origen, lo que sugiere una redistribución o ajuste de un modelo preexistente más que un entrenamiento desde cero. Tampoco se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, streaming de audio nativo) más allá de lo que herede de la arquitectura Qwen3-Omni.

## Capacidades

- Conversación por voz en tiempo real: la model card indica que el modelo "escucha y responde hablando", lo que implica entrada de audio y salida de voz integradas en el propio modelo.
- Procesamiento multimodal omni: por herencia de la arquitectura `qwen3_omni_moe`, se espera soporte de texto y audio, y probablemente imagen, aunque no se detalla en la información disponible.
- Generación de texto y diálogo multi-turno: capacidad esperable en un LLM de 35 B, sin confirmación explícita de parámetros como longitud de contexto.
- Razonamiento y modo "thinking": no confirmado en la documentación proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Capacidades especiales (visión, audio, streaming): la conversación por voz en tiempo real es la única capacidad declarada explícitamente.

## Casos de uso

- Asistente de voz para atención al cliente: el modelo puede gestionar conversaciones habladas de extremo a extremo (entrada de audio, respuesta de voz) sin necesidad de encadenar ASR, LLM y TTS por separado, lo que reduce latencia y errores de propagación entre etapas.
- Integración en la aplicación Hi Chat de Orbbit AI: es el caso de uso declarado por el autor; el modelo está pensado como motor conversacional por voz de ese producto.
- Interfaces manos libres para entornos con poca pantalla: aplicaciones de domótica, conducción o industria donde el usuario interactúa hablando y el modelo responde con voz sintetizada.
- Transcripción y respuesta hablada en asistentes personales: dado su carácter omni, podría emplearse para escuchar una consulta en audio y devolver una respuesta verbal, útil en dispositivos tipo altavoz inteligente.
- Prototipado de agentes conversacionales multimodales: investigadores pueden usar los pesos safetensors para experimentar con la variante MoE de Qwen3-Omni y medir el equilibrio entre calidad y coste de inferencia.
- Evaluación y ajuste fino interno: al estar bajo Apache 2.0, un equipo puede hacer fine-tuning sobre dominios específicos (por ejemplo, soporte técnico por voz) y desplegarlo en infraestructura propia sin restricciones de licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,26 B parámetros totales, en FP16 se requieren aproximadamente 70 GB solo para los pesos, más memoria para el códec de audio, caché KV y activaciones; en cuantización de 8 bits bajaría a unos 35-40 GB y en 4 bits a unos 18-22 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: para FP16, una A100 80 GB o H100 80 GB; para cuantizaciones de 8 bits, una A100 40 GB o L40S 48 GB podría ser suficiente.
- GPU de consumo: una RTX 4090 de 24 GB solo sería viable con cuantización agresiva (4 bits) y probablemente con descarga parcial de capas a CPU; no hay pesos GGUF publicados que lo confirmen.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser safetensors y arquitectura Qwen3-Omni, requeriría un runtime compatible con dicha arquitectura (por ejemplo, la implementación oficial de Qwen-Omni o transformers con soporte correspondiente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Estado |
|---|---|---|---|---|---|
| haro-omni-AI | 35,26 B totales (activos no disponibles) | no disponible | voz/texto (omni) | Apache 2.0 | publicado, 0 descargas |
| Qwen3-Omni (familia base) | variantes de la familia; no disponible el detalle | no disponible | texto, audio, visión | según variante (habitualmente Apache 2.0) | modelo de referencia del que deriva |
| Alternativas omni de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas; los datos de rendimiento del modelo no han sido publicados.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla datos de entrenamiento, idiomas, contexto, parámetros activos ni benchmarks, lo que impide evaluar su calidad antes de desplegarlo.
- Trazabilidad incierta: al tratarse de una derivación de Qwen3-Omni, conviene revisar los ficheros `NOTICE` y `LICENSE` del repositorio para conocer las condiciones exactas heredadas del modelo de origen.
- Riesgo de alucinación: inherente a los LLM de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados por el autor; se heredarían los del corpus de entrenamiento del modelo base.
- Idiomas: no declarados; no se puede asumir un rendimiento multilingüe sin verificación.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero deben respetarse los avisos de atribución del modelo de origen.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni comunidad que valide su comportamiento.
- Requisitos de hardware elevados: 70,5 GB de pesos en safetensors exigen infraestructura de GPU de gama alta o cuantización propia.

## Enlaces

- Hugging Face: https://huggingface.co/orbbit-AI-026/haro-omni-AI
- Repositorio de pesos: safetensors en el propio repositorio de Hugging Face
- Ficheros de licencia y avisos: `LICENSE` y `NOTICE` dentro del repositorio
- Paper, blog o demo: no disponibles en la información proporcionada
