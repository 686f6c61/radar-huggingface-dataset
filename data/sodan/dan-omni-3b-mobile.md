# sodan/dan-omni-3b-mobile

## Resumen

dan-omni-3b-mobile es una variante ultracompacta del modelo dan-omni-3b, desarrollada por el autor sodan, diseñada específicamente para entornos con restricciones estrictas de memoria, como teléfonos móviles. Se basa en Qwen2.5-3B, al que se le aplica una cuantización adicional y un ajuste fino mediante LoRA sobre datos de instrucción optimizados para dispositivos móviles. El resultado es un modelo de 3,4 mil millones de parámetros en formato GGUF, con un tamaño de archivo de aproximadamente 1,2 GB y un consumo de RAM de unos 1,5 GB durante la inferencia.

La principal diferencia frente a su hermano mayor dan-omni-3b es la reducción de la ventana de contexto de 4096 a 2048 tokens, lo que permite un uso más eficiente de la memoria. También elimina las capacidades multimodales, quedando como un modelo exclusivamente de texto. Está pensado para tareas de generación de texto, razonamiento, codificación, matemáticas, traducción y asistencia conversacional, con respuestas concisas y naturales. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su formato GGUF lo hace compatible con herramientas como Ollama y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B base, cuantizado) |
| Parametros totales | 3.397.103.616 (3,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | GGUF (tipo especifico no indicado, probablemente Q4 u similar) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B, un transformer decoder-only con 3,4 mil millones de parametros, y se somete a una cuantizacion adicional para reducir su huella de memoria. Sobre esta base cuantizada se aplica un ajuste fino con LoRA (Low-Rank Adaptation) utilizando datos de instruccion especificamente preparados para entornos moviles. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Los tags del repositorio indican el uso de imatrix (importance matrix) para optimizar la cuantizacion, lo que sugiere una calibracion cuidadosa de los pesos cuantizados.

## Capacidades

- Generacion de texto general: responde a preguntas, redacta textos y mantiene conversaciones multi-turno.
- Razonamiento: resuelve problemas logicos y de sentido comun, aunque con limitaciones por el contexto corto.
- Codificacion: genera y explica fragmentos de codigo en varios lenguajes.
- Matematicas: realiza calculos aritmeticos y resuelve problemas matematicos basicos e intermedios.
- Traduccion: traduce entre ingles y otros idiomas, aunque el modelo esta entrenado principalmente en ingles.
- Tareas creativas: escribe historias, poemas, correos y otros contenidos creativos con estilo natural.
- Seguimiento de instrucciones: obedece comandos directos y mantiene el formato solicitado.
- No incluye capacidades multimodales (vision, audio) a diferencia de dan-omni-3b.

## Casos de uso

- Asistente offline en moviles: el modelo puede ejecutarse localmente en telefonos con 3 GB o menos de RAM libre, proporcionando respuestas a preguntas frecuentes, traducciones rapidas y ayuda con tareas cotidianas sin conexion a internet.
- Chatbot de atencion al cliente en dispositivos de bajo coste: su bajo consumo de memoria permite integrarlo en kioscos, terminales de punto de venta o dispositivos IoT para gestionar consultas simples de usuarios.
- Autocompletado de texto en aplicaciones de escritura: con su contexto de 2048 tokens, puede sugerir continuaciones de parrafos o corregir redacciones en editores de texto ligeros.
- Generacion de codigo en entornos de desarrollo integrado (IDE) para equipos modestos: desarrolladores con portatiles antiguos pueden usarlo para autocompletar funciones o explicar snippets sin depender de servicios en la nube.
- Traduccion instantanea en aplicaciones de mensajeria: su velocidad de ~10 tokens por segundo en CPU permite traducir mensajes cortos en tiempo real dentro de apps de chat.
- Educacion y aprendizaje: estudiantes pueden usarlo como tutor de matematicas o ingles en dispositivos con recursos limitados, gracias a su capacidad de razonamiento y generacion de explicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card del autor incluye mediciones de velocidad en CPU (Intel i9-9880H @ 2.30GHz, 16GB RAM, runtime Ollama), que se reproducen a continuacion:

| Categoria | Velocidad media (tok/s) | Velocidad prompt (tok/s) | Tokens generados | Tiempo |
|---|---|---|---|---|
| Razonamiento | 9,4 | 37,6 | 170 | 18,1 s |
| Codificacion | 10,2 | 37,6 | 163 | 16,0 s |
| Escritura creativa | 9,5 | 37,6 | 37 | 3,9 s |
| Seguimiento de instrucciones | 9,9 | 37,6 | 52 | 5,3 s |
| Matematicas | 10,0 | 37,6 | 127 | 12,7 s |
| Conocimiento general | 10,1 | 37,6 | 62 | 6,1 s |
| **Media** | **9,8** | **37,6** | **102** | **10,4 s** |

Estos datos son mediciones del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- RAM estimada para inferencia: ~1,5 GB, segun la model card.
- GPU: no requiere GPU; funciona en CPU. Puede ejecutarse en moviles con 3 GB o menos de RAM libre.
- CPU recomendada: cualquier procesador x86_64 o ARM con al menos 2 GB de RAM disponible. Probado en Intel i9-9880H.
- Opciones de despliegue: Ollama (comando `ollama pull sodan/dan-omni-3b-mobile`), llama.cpp (`llama-cli`), o cualquier runtime compatible con GGUF.
- Latencia y throughput: ~9,8 tokens por segundo en CPU de portatil, con velocidad de prompt de ~37,6 tokens por segundo.
- No se requieren GPUs dedicadas, lo que lo hace adecuado para dispositivos de bajo consumo.

## Comparativa con modelos similares

La siguiente tabla se basa en datos proporcionados por el autor en la model card. No se han verificado de forma independiente.

| Modelo | Tamano | Velocidad (tok/s) | Contexto | RAM |
|---|---|---|---|---|
| **dan-omni-3b-mobile** | 1,2 GB | 9,8 | 2K | ~1,5 GB |
| dan-omni-3b | 2,0 GB | 11,3 | 4K | ~2,5 GB |
| Gemma 4 E2B | ~1,4 GB | ~35 | 128K | ~2 GB |
| Qwen2.5-1.5B | ~0,95 GB | ~28 | 32K | ~1,5 GB |
| Command-R7B | ~4,0 GB | ~8 | 128K | ~5 GB |

En comparacion con alternativas como Qwen2.5-1.5B, dan-omni-3b-mobile ofrece mayor capacidad de parametros (3,4B frente a 1,5B) pero con una velocidad inferior y un contexto mucho mas corto. Frente a Gemma 4 E2B, pierde en velocidad y contexto, pero gana en menor uso de RAM. Su principal ventaja es el equilibrio entre calidad (por su base Qwen2.5-3B) y consumo de recursos, pensado para dispositivos con memoria muy limitada.

## Limitaciones y advertencias

- Contexto muy corto (2048 tokens): no apto para tareas que requieran procesar documentos largos o mantener conversaciones extensas con mucho historial.
- Solo idioma ingles: no soporta otros idiomas de forma nativa, aunque puede intentar traducir, la calidad sera limitada.
- Sin capacidades multimodales: a diferencia de dan-omni-3b, no procesa imagenes ni audio.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados.
- Sesgos potenciales: al estar entrenado sobre datos de internet, puede reflejar sesgos presentes en esos datos.
- Rendimiento no verificado: los benchmarks de velocidad provienen del autor y no han sido replicados por terceros.
- Cuantizacion agresiva: la compresion adicional puede degradar la calidad de las respuestas en comparacion con el modelo original sin cuantizar.
- No se especifica el tipo exacto de cuantizacion GGUF, lo que dificulta evaluar el equilibrio entre calidad y tamano.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sodan/dan-omni-3b-mobile
- Modelo base dan-omni-3b: https://huggingface.co/sodan/dan-omni-3b
- Variante dan-omni-3b-q3s: https://huggingface.co/sodan/dan-omni-3b-q3s
- Variante ultraligera dan-omni-smolm2: https://huggingface.co/sodan/dan-omni-smolm2
- Variante dan-omni-smolm2-v2: https://huggingface.co/sodan/dan-omni-smolm2-v2
