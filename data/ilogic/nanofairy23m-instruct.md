# ilogic/NanoFairy23M-Instruct

## Resumen

NanoFairy23M-Instruct es un modelo de lenguaje de 23 millones de parámetros desarrollado por el usuario ilogic y publicado en Hugging Face. Se trata de un proyecto educativo y de aficionado cuyo objetivo es demostrar el ciclo completo de preentrenamiento y ajuste conversacional sobre una arquitectura minima: un transformer decoder-only con el diseno clasico de GPT-2 (`GPT2LMHeadModel`). El modelo no aspira a ser un asistente de proposito general, sino un experimento reproducible y barato de entrenar.

El modelo se ha preentrenado desde cero sobre aproximadamente 300 millones de tokens del subconjunto `sample-10BT` de FineWeb y despues se ha ajustado en PersonaChat para mantener conversaciones cortas y en personaje. El usuario proporciona una persona (unas pocas frases en primera persona) y el modelo responde como ese personaje en un estilo coloquial. Su ventana de contexto es de solo 256 tokens, lo que limita severamente la longitud de las conversaciones.

Su relevancia radica en su valor didactico: es un ejemplo completo, pequeno y legible de preentrenamiento y ajuste de chat que cabe en una unica GPU T4 y se ejecuta en CPU. No obstante, sus capacidades son muy limitadas y no debe confundirse con un modelo instructivo general: el termino "Instruct" aqui significa unicamente "ajustado para dialogo con persona", no "capaz de seguir instrucciones arbitrarias".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, diseno GPT-2 (`GPT2LMHeadModel`) |
| Parametros totales | 23.033.856 (unos 12,3 M corresponden a la tabla de embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (compartidos entre persona, historial y respuesta) |
| Tipos de cuantizacion | no disponible de forma oficial; los pesos son compatibles con conversion a GGUF para llama.cpp |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` en float32 (unos 92 MB); conversion a GGUF posible |
| Capas / cabezas / anchura | 6 / 6 / 384 (tamano de cabeza 64, anchura MLP 1.536) |
| Vocabulario | 32.000 tokens, BPE a nivel de byte |
| Codificacion posicional | Posiciones absolutas aprendidas |
| Otros | Pre-LayerNorm, GELU exacta, embeddings de entrada y salida atados |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con el diseno de GPT-2, con 6 capas, 6 cabezas de atencion, una anchura de 384 y una MLP de 1.536. Usa Pre-LayerNorm, activacion GELU exacta y embeddings de entrada y salida atados. La codificacion posicional es absoluta y aprendida, con un maximo de 256 posiciones. El vocabulario es un BPE a nivel de byte de 32.000 tokens entrenado sobre el propio texto de preentrenamiento.

El entrenamiento se realizo en dos etapas. En la primera, el modelo se preentreno desde cero sobre aproximadamente 300 millones de tokens del subconjunto `sample-10BT` de FineWeb, con una unica pasada de 36.758 pasos de 32 secuencias de 256 tokens, optimizador AdamW con tasa de aprendizaje maxima de 6e-4 y decaimiento coseno hasta 6e-5, y clipping de gradiente de 1.0. Todo ello en una unica NVIDIA T4 con precision mixta float16 durante aproximadamente una hora. En la segunda etapa se ajusto sobre PersonaChat en su version `bavard/personachat_truecased`, generando unos 131.000 ejemplos de respuesta, con enmascaramiento de perdida para entrenar solo sobre la respuesta del personaje y no sobre la persona ni los mensajes del usuario, durante 2 epocas con tasa de aprendizaje de 1e-4. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional corto en ingles, limitado a respuestas en personaje.
- Mantenimiento de una persona definida por el usuario mediante un mensaje de sistema con frases en primera persona.
- Dialogo multi-turno muy breve, limitado por la ventana de 256 tokens compartida entre persona, historial y respuesta.
- Estilo coloquial e informal, orientado a charla trivial y roleplay ligero.
- Soporte de plantilla de chat propia (`apply_chat_template`) con roles de sistema, usuario y asistente.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene modo de razonamiento (thinking), vision ni audio.
- No esta entrenado para responder preguntas factuales, escribir codigo ni resolver matematicas.

## Casos de uso

- Prototipado de personajes para videojuegos o narrativa interactiva: el modelo puede encarnar un personaje definido por unas pocas frases de persona y responder en estilo coherente en conversaciones muy cortas, lo que permite iterar rapidamente sobre el diseno del personaje sin coste de inferencia significativo.
- Educacion y aprendizaje: sirve como ejemplo completo y legible de un pipeline de preentrenamiento y ajuste de chat, util para cursos o talleres donde se quiera mostrar el ciclo completo con recursos minimos (una T4 y una hora de entrenamiento).
- Base para ajuste fino en un dominio conversacional estrecho: al ser un checkpoint GPT-2 estandar con licencia MIT, se puede reentrenar sobre un corpus pequeno y especializado (por ejemplo, dialogos de un juego concreto) para obtener un modelo de personaje a medida.
- Demos y pruebas de infraestructura: su tamano (92 MB en float32) permite desplegarlo en CPU o en GPUs de gama baja para validar pipelines de inferencia, plantillas de chat o conversiones a GGUF antes de escalar a modelos mayores.
- Experimentacion con tecnicas de enmascaramiento de perdida: el modelo documenta el enmascaramiento de perdida sobre la respuesta del asistente, lo que lo convierte en un caso de estudio practico para quienes quieran entender como se entrena un modelo para no escribir el turno del usuario.
- Chatbot de acompanamiento muy ligero en entornos sin GPU: gracias a sus 23 M de parametros y a la posibilidad de ejecutarlo con llama.cpp u Ollama, puede servir como chatbot de charla trivial en dispositivos con recursos muy limitados, siempre que se acepten sus severas limitaciones de contexto y coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un campo `[TODO: fill in]` para la perdida de validacion final del preentrenamiento, por lo que no se dispone de ninguna metrica cuantitativa publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (unos 92 MB de pesos mas activaciones y cache KV); en la practica cabe en cualquier GPU consumer moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el entrenamiento original se realizo en una unica NVIDIA T4.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) y tambien en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM`, conversion a GGUF para llama.cpp con `--jinja` y `--ctx-size 256`, y potencialmente Ollama a partir del GGUF. La model card advierte que el tokenizador personalizado requiere un pequeno ajuste en el conversor de llama.cpp porque no reconoce el hash del pre-tokenizador del vocabulario.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano del modelo, la inferencia en CPU deberia ser de decenas de milisegundos por token, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| NanoFairy23M-Instruct | 23 M | 256 | Ingles | MIT | GPT-2 pequeno, ajustado a PersonaChat, solo charla en personaje |
| GPT-2 small | 124 M | 1.024 | Ingles | MIT | Modelo base de referencia; no ajustado a dialogo, pero mucho mas capaz en generacion general |
| DistilGPT-2 | 82 M | 1.024 | Ingles | MIT | Version destilada de GPT-2; mayor contexto y capacidades generales que NanoFairy |
| Modelos de personaje tipo DialoGPT-small | 117 M | 1.024 | Ingles | MIT | Ajustado a dialogo, con contexto cuatro veces mayor y mas parametros |

La comparativa se limita a modelos de la misma familia y escala, ya que no existen muchos modelos publicos de 23 M de parametros orientados a dialogo. En todos los casos, los modelos alternativos superan a NanoFairy en contexto y capacidades generales, aunque NanoFairy destaca por su minima huella y su valor didactico.

## Limitaciones y advertencias

- El modelo no es un asistente de proposito general: no responde preguntas factuales, no da consejos (medicos, legales, financieros) y no escribe codigo ni razona.
- Ventana de contexto de solo 256 tokens compartida entre persona, historial y respuesta, lo que provoca que el modelo olvide los turnos mas antiguos tras unas pocas interacciones.
- Entrenado unicamente en ingles; no soporta castellano ni otros idiomas.
- Riesgo elevado de alucinacion y de respuestas incoherentes, especialmente con temperaturas altas o conversaciones largas.
- Sesgos heredados de FineWeb y PersonaChat: el preentrenamiento con texto web y el ajuste con dialogos de crowdworkers pueden introducir sesgos de genero, culturales y de estilo.
- No apto para uso en produccion ni en entornos de seguridad critica, tal como advierte el propio autor.
- La licencia MIT permite uso comercial, pero las capacidades del modelo hacen inviable un uso comercial serio mas alla de demos o experimentos.
- El tokenizador personalizado requiere un ajuste manual en el conversor de llama.cpp, lo que anade friccion al despliegue.
- La model card contiene campos sin completar (perdida de validacion final), lo que impide evaluar la calidad del preentrenamiento de forma cuantitativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilogic/NanoFairy23M-Instruct
- Dataset de preentrenamiento FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset de ajuste PersonaChat (version truecased): https://huggingface.co/datasets/bavard/personachat_truecased
- Paper de PersonaChat (Zhang et al., 2018): https://arxiv.org/abs/1801.07243
- Referencia adicional citada en los tags (arxiv:2406.17557): https://arxiv.org/abs/2406.17557
