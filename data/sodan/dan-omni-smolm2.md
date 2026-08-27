# sodan/dan-omni-smolm2

## Resumen

`dan-omni-smolm2` es un modelo de lenguaje ultraligero desarrollado por el usuario `sodan`, diseñado específicamente para despliegue en dispositivos con recursos muy limitados (edge computing). Se basa en el modelo SmolLM2 de HuggingFace y ha sido sometido a un fine-tuning completo con datos de instrucciones para móviles, lo que lo convierte en un asistente conversacional compacto y rápido. Su principal atractivo es su velocidad de inferencia (62,2 tokens por segundo en CPU) y su reducido consumo de memoria (~400 MB), lo que permite ejecutarlo en hardware como Raspberry Pi, teléfonos antiguos o dispositivos IoT.

Aunque la model card del autor indica "~1.7B" de parámetros, el dato real extraído de los safetensors es de 361.821.120 parámetros (~362M), lo que lo sitúa en la gama de los modelos pequeños tipo SmolLM2-360M. El modelo tiene una longitud de contexto de 4096 tokens y se distribuye en formato GGUF, lo que facilita su uso con herramientas como Ollama o llama.cpp. Su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia de este modelo radica en su capacidad para ofrecer respuestas de calidad media con una latencia mínima en entornos sin GPU, cubriendo un nicho donde los modelos grandes son inviables. Está pensado para tareas de clasificación, Q&A simple, traducción y generación de texto breve, y puede integrarse en arquitecturas en cascada junto a modelos más potentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM2) |
| Parametros totales | 361.821.120 (~362M) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | GGUF (tipos no especificados en la documentacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (y safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo decoder-only, heredado de la familia SmolLM2 de HuggingFace. No se trata de una arquitectura MoE ni híbrida; es un modelo denso convencional. El autor indica que se realizó un "full fine-tune" sobre datos de instrucciones para dispositivos móviles, aunque no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas particulares como decodificación especulativa o atención lineal.

El sistema prompt recomendado por el autor define a "dan" como un asistente útil para dispositivos móviles, con respuestas concisas y naturales, y sin explicar su arquitectura salvo que se le pregunte. Esto sugiere que el fine-tuning se orientó a conversaciones breves y directas.

## Capacidades

- Generacion de texto: produce respuestas cortas y naturales, adecuadas para conversacion.
- Razonamiento basico: puede resolver problemas sencillos de logica y sentido comun, aunque con limitaciones en tareas complejas.
- Codigo: genera fragmentos de codigo simples, util para ejemplos o prototipos rapidos.
- Matematicas: resuelve operaciones aritmeticas y problemas matematicos elementales; falla en pasos multiples.
- Traduccion: capaz de traducir frases y textos cortos entre idiomas, aunque su entrenamiento principal es en ingles.
- Escritura creativa: genera textos breves, historias cortas o ideas creativas.
- Instrucciones: sigue ordenes directas y responde a comandos de usuario de forma fiable.
- No se menciona soporte para tool calling, function calling, agentes multi-paso, ni capacidades multimodales (vision, audio).

## Casos de uso

- Asistente conversacional en Raspberry Pi: el modelo cabe en 400 MB de RAM y alcanza 62 tok/s en CPU, por lo que puede ejecutarse en una Raspberry Pi 4 o superior para ofrecer un chat local sin conexion a internet.
- Chatbot en telefonos antiguos o de gama baja: con un consumo de memoria inferior a 500 MB, es viable en dispositivos con 1 GB de RAM, proporcionando respuestas rapidas para preguntas frecuentes o ayuda basica.
- Clasificacion de texto en tiempo real: su baja latencia (0,7 s de media por respuesta) permite clasificar mensajes, correos o comentarios en categorias predefinidas mediante prompts de instruccion.
- Traduccion automatica en dispositivos embebidos: puede traducir frases cortas entre ingles y otros idiomas, util en aplicaciones de turismo o atencion al cliente en kioscos.
- Generacion de respuestas cortas en sistemas de atencion al cliente: integrado en un pipeline de mensajeria, puede responder consultas simples sobre horarios, precios o politicas, reduciendo la carga de agentes humanos.
- Prototipado y experimentacion: por su tamaño reducido y facilidad de uso con Ollama, es ideal para probar conceptos de IA generativa en entornos de desarrollo sin GPU.
- Sistema de ayuda en aplicaciones IoT: puede ejecutarse en dispositivos con microcontroladores potentes (como Arduino-class, aunque con limitaciones) para ofrecer asistencia por voz o texto en electrodomesticos inteligentes.
- Filtrado y moderacion de contenido: mediante prompts especificos, puede clasificar si un texto es ofensivo o inapropiado, funcionando como un primer filtro en foros o redes sociales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo proporciona mediciones de velocidad en CPU (Intel i9-9880H @ 2.30GHz, 16GB RAM, runtime Ollama), que se resumen a continuacion:

| Categoria | Velocidad media (tok/s) | Prompt (tok/s) | Tokens generados | Tiempo |
|---|---|---|---|---|
| Razonamiento | 60,0 | 545,1 | 26 | 0,4 s |
| Codigo | 62,3 | 545,1 | 43 | 0,7 s |
| Escritura creativa | 61,2 | 545,1 | 79 | 1,3 s |
| Seguimiento de instrucciones | 62,4 | 545,1 | 56 | 0,9 s |
| Matematicas | 63,6 | 545,1 | 26 | 0,4 s |
| Conocimiento general | 63,6 | 545,1 | 26 | 0,4 s |
| **Media** | **62,2** | **545,1** | **43** | **0,7 s** |

Estos datos son proporcionados por el autor y no han sido verificados de forma independiente. La calidad del modelo se califica como "media" en la comparativa del autor, sin metricas objetivas que lo respalden.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se realiza en CPU.
- RAM: aproximadamente 400 MB durante la inferencia, segun el autor. El modelo puede ejecutarse en dispositivos con 512 MB de RAM.
- GPU recomendadas: ninguna; funciona en CPU. En caso de usar GPU, cualquier GPU con mas de 1 GB de VRAM seria suficiente, pero no es necesario.
- Compatibilidad con consumer GPU: si, aunque no es el caso de uso previsto. En una GPU moderna, la velocidad seria mucho mayor.
- Opciones de despliegue: Ollama (comando `ollama pull sodan/dan-omni-smolm2`), llama.cpp (`llama-cli`), y cualquier runtime compatible con GGUF (llama-cpp-python, etc.).
- Latencia y throughput: en CPU Intel i9-9880H, la latencia media por respuesta es de 0,7 s (para ~43 tokens generados). El throughput de prompt es de 545 tok/s. En hardware mas modesto (Raspberry Pi), se espera una velocidad menor, aunque no se proporcionan datos.

## Comparativa con modelos similares

La siguiente tabla se basa en la informacion proporcionada por el autor en la model card. Los datos de velocidad y RAM son mediciones del autor, no verificadas de forma independiente.

| Modelo | Tamano | Velocidad (tok/s) | Calidad | RAM |
|---|---|---|---|---|
| **dan-omni-smolm2** | 259 MB (GGUF) | 62,2 | Media | ~400 MB |
| SmolLM2-135M (base) | 140 MB | ~80 | Baja | ~250 MB |
| LFM2-1.2B | ~0,7 GB | ~45 | Media-Alta | ~1 GB |
| Gemma 4 E2B | ~1,4 GB | ~35 | Alta | ~2 GB |
| dan-omni-3b | 2,0 GB | 11,3 | Alta | ~2,5 GB |

Nota: los modelos LFM2-1.2B y Gemma 4 E2B no han podido ser verificados en fuentes externas; es posible que sean denominaciones internas del autor. Se recomienda contrastar con modelos reales como SmolLM2-360M o Qwen2.5-0.5B para una comparativa fiable.

## Limitaciones y advertencias

- Razonamiento debil: el autor reconoce que el modelo tiene un razonamiento notablemente inferior a modelos de 3B, y puede fallar en problemas matematicos de multiples pasos.
- Respuestas cortas: por diseño, tiende a generar respuestas breves y simples, lo que puede resultar insuficiente para tareas que requieren explicaciones detalladas.
- Sesgos y alucinaciones: al ser un modelo pequeno entrenado con datos limitados, es propenso a alucinaciones y a reflejar sesgos presentes en sus datos de entrenamiento. No se han realizado evaluaciones de sesgo.
- Idioma: solo se ha entrenado y evaluado en ingles. Su capacidad en otros idiomas es limitada y no garantizada.
- Contexto limitado: 4096 tokens es una ventana corta para tareas que requieren mucho contexto, como analisis de documentos largos o conversaciones extensas.
- Uso en produccion: aunque la licencia Apache 2.0 permite uso comercial, la falta de benchmarks de calidad y la ausencia de evaluaciones de robustez hacen recomendable probar exhaustivamente antes de desplegar en entornos criticos.
- Dependencia de la infraestructura: el modelo se distribuye en GGUF, por lo que requiere un runtime compatible (Ollama, llama.cpp). No se proporcionan pesos en otros formatos.
- Discrepancia en parametros: la model card indica "~1.7B" pero el dato real de safetensors es 362M. Esta inconsistencia puede generar confusion; se recomienda verificar el tamano real antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sodan/dan-omni-smolm2
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Familia dan-omni (referencias en la model card):
  - dan-omni-3b: https://huggingface.co/sodan/dan-omni-3b
  - dan-omni-3b-mobile: https://huggingface.co/sodan/dan-omni-3b-mobile
  - dan-omni-3b-q3s: https://huggingface.co/sodan/dan-omni-3b-q3s
  - dan-omni-smolm2-v2: https://huggingface.co/sodan/dan-omni-smolm2-v2
