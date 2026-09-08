# mlboydaisuke/MiniCPM5-2B-LiteRT

## Resumen

MiniCPM5-2B-LiteRT es una conversión del modelo MiniCPM5-2B de OpenBMB al formato LiteRT-LM (`.litertlm`), realizada por mlboydaisuke para ejecutar inferencia on-device con el runtime LiteRT-LM de Google. El modelo original es un Transformer denso de 2.500 millones de parámetros (2.5B) con 42 capas, tamaño oculto de 2048, GQA 16:2, embeddings no compartidos de 130.000 tokens y una ventana de contexto nativa de 131.000 tokens. Fue lanzado en septiembre de 2026 como parte de la serie MiniCPM5, orientado a escenarios de despliegue local y recursos limitados.

La peculiaridad del modelo es su naturaleza híbrida de razonamiento: un único checkpoint puede responder directamente o trabajar el problema dentro de etiquetas `thinking...` antes de emitir la respuesta final, controlado por un interruptor `enable_thinking` en su plantilla de chat. Esta conversión conserva esa maquinaria intacta, incluyendo el canal de pensamiento declarado y la configuración de `ThinkingConfig`. Se ofrecen dos archivos cuantizados: uno int4 de 1,55 GB pensado para teléfonos y otro int8 de 2,60 GB para razonamiento largo en desktop o Android. El modelo es relevante porque acerca el razonamiento híbrido a dispositivos móviles con licencia Apache 2.0 y sin necesidad de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido de razonamiento (42 capas, hidden 2048, GQA 16:2, embeddings untied de 130k vocabulario) |
| Parametros totales | 2.500 millones (2.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.000 tokens |
| Tipos de cuantizacion | int4 blockwise-32 + OCTAV en lineales, int8 embedding; int8 dinámico en lineales + embedding, activaciones fp32 declaradas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), con archivos int4 e int8 |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso, no un modelo de mezcla de expertos (MoE), con 42 capas, dimensión oculta de 2048, atención de consultas agrupadas (GQA) con 16 cabezas de consulta y 2 de clave/valor, y embeddings de vocabulario no compartidos de 130.000 tokens. Su ventana de contexto nativa es de 131.000 tokens. No se han proporcionado datos sobre el corpus de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO en la información disponible.

La innovación principal de esta conversión es el empaquetado para LiteRT-LM: incluye la plantilla de chat original del modelo, un canal de pensamiento declarado (`[thought]` / `[/thought]`) y la posibilidad de controlar el modo de razonamiento mediante `ThinkingConfig`. La cuantización int4 aplica bloque de 32 y OCTAV en las capas lineales con embeddings int8, mientras que la int8 usa cuantización dinámica en lineales y embeddings, declarando activaciones fp32. El runtime requiere LiteRT-LM 0.16 o superior, y se ha medido en la versión 0.17.0.

## Capacidades

- Generación de texto y razonamiento híbrido: puede responder directamente o generar cadenas de razonamiento dentro de `thinking...` antes de la respuesta final.
- Control del modo de razonamiento mediante `enable_thinking` (a través de `ThinkingConfig` o del contexto extra de la conversación), con respuestas directas de 2 a 7 tokens y aproximadamente 10 veces más rápidas cuando está desactivado.
- Canal de pensamiento separado: el runtime puede leer el razonamiento por separado y el texto transmitido contiene solo la respuesta final.
- Razonamiento matemático: alcanza 92 % en GSM8K (primeras 100 preguntas, greedy, 0-shot CoT) en bf16, 91 % en int8 CPU y 86-87 % en int4.
- Memoria multi-turno: en conversaciones de tres turnos (introducción de nombre y ciudad, pregunta aritmética y pregunta sobre la ciudad) ambos archivos recuerdan correctamente los datos bajo los tres modos de razonamiento.
- Despliegue on-device: funciona en CPU y GPU en Apple M4 Max, Galaxy S26 (Snapdragon SM8850, Adreno) e iPhone 17 Pro, con delegación OpenCL completa en Android (1873/1873 nodos).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información).

## Casos de uso

- Asistente conversacional en smartphone: el archivo int4 de 1,55 GB está diseñado para teléfonos y genera respuestas directas con baja latencia en GPU, ideal para aplicaciones de mensajería o asistentes de voz que necesitan respuestas rápidas sin conexión.
- Tutor de matemáticas en el dispositivo: con el archivo int8 y el modo de razonamiento activado, el modelo completa cadenas de pensamiento largas (mediana de ~3.200 caracteres en CPU) y resuelve problemas de GSM8K con un 91 % de acierto, adecuado para apps educativas offline.
- Aplicaciones de privacidad en el borde: la inferencia es completamente local, sin dependencia de servidores en la nube, lo que permite procesar datos sensibles en el propio dispositivo.
- Prototipado en Google AI Edge Gallery: los archivos se importan directamente desde HuggingFace a la app Gallery en Android, permitiendo pruebas rápidas de razonamiento on-device sin infraestructura cloud.
- Chat multi-turno con memoria: el modelo mantiene el contexto en conversaciones de varios turnos, recordando información personal como nombres y ciudades, útil para asistentes personales y agentes de soporte locales.
- Despliegue en entornos sin GPU: el archivo int8 en CPU mantiene un 91 % en GSM8K, por lo que es viable en servidores de borde o PCs sin aceleradora gráfica, siempre que la memoria disponible sea suficiente.
- Razonamiento en aplicaciones de escritorio o Android: el int8 es la opción recomendada para tareas que requieren que el razonamiento termine, ya que el int4 en CPU tiende a agotar el presupuesto de tokens.
- Respuestas de baja latencia para autocompletado o asistentes de voz: con `enable_thinking=false`, el modelo produce respuestas de 2 a 7 tokens, aproximadamente 10 veces más rápido, adecuado para interacciones que no necesitan razonamiento extenso.

## Benchmarks y rendimiento

La model card incluye resultados de GSM8K (primeras 100 preguntas, greedy, 0-shot chain-of-thought, con thinking desactivado, máximo 2048 tokens nuevos) y una prueba de sanidad de 8 preguntas en CPU y GPU. No se han publicado resultados de benchmarks en la informacion disponible más allá de estos.

| Configuración | GSM8K (thinking off) | Sanity gate |
|---|---|---|
| bf16 PyTorch (MPS) | 92 % | 8/8 con thinking on; 6/8 con thinking off |
| int8, CPU | 91 % | 8/8 |
| int4, CPU | 86 % | 8/8 |
| int4, GPU (Metal) | 87 % | 8/8 |

En modo de razonamiento activado, con 10 preguntas de GSM8K y un presupuesto de 3.584 tokens, los resultados son los siguientes:

| Configuración con thinking on | Cierres de razonamiento | Mediana de caracteres |
|---|---|---|
| bf16 | 9/10 | ~3.000 |
| int8, CPU | 9/10 | ~3.200 |
| int4, CPU | 0/10 | ~13.700 |
| int4, GPU (Metal) | 10/10 | ~8.000 (artefacto de redondeo fp16) |

En el iPhone 17 Pro, el archivo int4 pasa 7/8 en Metal GPU (inicialización de 5,7 s) y 7/8 en CPU (inicialización de 2,2 s); el único fallo es la línea de rima del prompt compuesto, que responde "green", el mismo error que comete el modelo bf16 con thinking desactivado, por lo que se atribuye a un artefacto del formato del prompt y no a daños por la conversión.

## Requisitos de hardware

- VRAM estimada: no se proporciona en la información disponible. Los tamaños de archivo son 1,55 GB (int4) y 2,60 GB (int8), por lo que la memoria necesaria será al menos ese tamaño más el overhead del runtime.
- GPU recomendadas: Apple M4 Max, Galaxy S26 (Adreno) e iPhone 17 Pro (Metal/CPU). No se han probado GPUs NVIDIA en la información disponible.
- Compatibilidad con consumer GPU: el int4 está pensado para teléfonos y cabe en dispositivos móviles; el int8 es para desktop o Android, pero no para iOS, ya que su sección principal de pesos (2,33 GB) supera el límite de mmap por sección de las apps iOS con entitlements por defecto.
- Opciones de despliegue: LiteRT-LM runtime (`litert-lm run`, requiere versión 0.16 o superior) y Google AI Edge Gallery en Android. vLLM, llama.cpp, Ollama y TGI: no disponible.
- Latencia: solo se conocen tiempos de inicialización en iPhone 17 Pro para int4: 5,7 s en Metal GPU y 2,2 s en CPU. No se proporcionan datos de latencia de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openbmb/MiniCPM5-2B | 2.5B | 131.000 tokens | bf16 (PyTorch) | Apache 2.0 | HuggingFace |
| openbmb/MiniCPM5-2B-MLX | No disponible | No disponible | MLX | Apache 2.0 | HuggingFace |
| mlboydaisuke/MiniCPM5-2B-LiteRT | 2.5B | 131.000 tokens | `.litertlm` (int4/int8) | Apache 2.0 | HuggingFace |

Según una noticia sobre el lanzamiento de MiniCPM5-2B, el modelo promedia 53,9 en 34 benchmarks y supera a modelos de 4B comparados, aunque no se especifican los nombres de esos modelos en la información disponible. La versión LiteRT-LM es una cuantización del mismo modelo base, por lo que su rendimiento es ligeramente inferior en GSM8K (86-91 % frente al 92 % en bf16) y presenta limitaciones adicionales en el modo de razonamiento con int4.

## Limitaciones y advertencias

- El archivo int4 en CPU con thinking activado no completa razonamientos: en 10 preguntas de GSM8K cerró 0/10, con cadenas de ~13.700 caracteres que agotan el presupuesto de tokens y nunca emiten la respuesta final. Para razonamiento que deba terminar, usar int8 o desactivar thinking.
- El archivo int8 no es apto para iOS: su sección principal de pesos (2,33 GB) supera el límite de mmap por sección de las apps iOS con entitlements por defecto, por lo que solo es viable en desktop o Android.
- El rendimiento con thinking desactivado debe compararse contra el modelo bf16 con thinking desactivado (6/8 en la prueba de sanidad), no contra 8/8, ya que el propio modelo original falla en dos preguntas en ese modo.
- El resultado de 10/10 del int4 en GPU Metal con thinking activado es un artefacto del redondeo fp16 y no debe considerarse una propiedad fiable del modelo.
- Si el presupuesto de tokens es insuficiente y el pensamiento se trunca, el modelo no genera ninguna respuesta final.
- Riesgo de alucinación: se observaron respuestas incorrectas en la prueba de sanidad, como "green" en la línea de rima.
- Idiomas soportados: no especificados en la información disponible, lo que limita la evaluación de su uso multilingüe.
- No se mencionan sesgos específicos en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/MiniCPM5-2B-LiteRT
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Versión MLX del modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Noticia sobre MiniCPM5-2B: https://www.aimodeling.com/en/news/slug/openbmb-minicpm5-2b-on-device
