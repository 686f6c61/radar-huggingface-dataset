# ibm-granite/granite-speech-5.0-2b-GGUF

## Resumen

Granite-speech-5.0-2b es un modelo de voz desarrollado por IBM dentro de la familia Granite 5.0. Esta ficha concreta corresponde a la versión cuantizada en formato GGUF del modelo base `ibm-granite/granite-speech-5.0-2b`, pensada para su ejecución con llama.cpp. El modelo resuelve tareas de comprensión y transcripción de audio, integrando un proyector multimodal que permite procesar entradas de audio junto con instrucciones de texto.

El modelo cuenta con 1.837.275.136 parámetros totales según los pesos en safetensors del modelo base, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos. La versión GGUF incluye además un proyector de audio (`mmproj-model-f16.gguf`) necesario para la inferencia multimodal con llama.cpp, y expone una interfaz compatible con la API de OpenAI a través de `llama serve`.

Su relevancia actual radica en que permite desplegar un modelo de voz de tamaño compacto en infraestructura local o de gama media, sin depender de servicios en la nube, manteniendo compatibilidad con el ecosistema llama.cpp y con endpoints tipo OpenAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de audio y lenguaje; se ejecuta con llama.cpp) |
| Parámetros totales | 1.837.275.136 (1,84 mil millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con varias cuantizaciones; el ejemplo documentado usa Q8_0 y proyector `mmproj-model-f16.gguf` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyector multimodal separado en F16) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo base pertenece a la familia Granite 5.0 de IBM y es un modelo multimodal que combina un componente de lenguaje con un proyector de audio, lo que permite recibir entradas de audio y texto y generar respuestas textuales. La versión GGUF mantiene esa estructura: un fichero de pesos cuantizado y un fichero `mmproj` en F16 que actúa como adaptador del codificador de audio hacia el espacio del modelo de lenguaje.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se detallan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La build de referencia indicada por el autor es llama.cpp `b11669` con Transformers `5.8.0`.

## Capacidades

- Transcripción de audio a texto: el ejemplo de la model card muestra la transcripción de un fichero WAV de 8 kHz con frases del Open Speech Repository.
- Comprensión de audio guiada por instrucciones de texto: el prompt puede indicar la tarea ("Transcribe this audio file.") y el modelo responde en consecuencia.
- Procesamiento multimodal audio + texto: la entrada se compone de partes `input_audio` y `text` en el mismo mensaje.
- Integración con la API de OpenAI: `llama serve` expone `/v1/chat/completions` con contenido de audio en base64.
- Ejecución local con llama.cpp: compatible con `llama cli` y `llama serve`.
- Conversacional: etiquetado como `conversational` en el repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio bidireccional: no disponible; la información solo documenta entrada de audio y salida de texto.

## Casos de uso

- Transcripción por lotes en local: usar `llama cli` con el modelo Q8_0 y el proyector `mmproj-model-f16.gguf` para transcribir ficheros WAV de forma reproducible, sin enviar datos a servicios externos.
- Servicio de transcripción autoalojado: desplegar `llama serve` y exponer `/v1/chat/completions` para que aplicaciones existentes compatibles con la API de OpenAI envíen audio en base64 y reciban la transcripción.
- Procesamiento de grabaciones de reuniones o llamadas: el modelo puede recibir un audio y una instrucción de transcripción, integrándose en pipelines que después apliquen posprocesado de texto (resumen, extracción de acciones).
- Prototipado de asistentes de voz: al ser un modelo de 1,84 mil millones de parámetros en GGUF, permite iterar rápidamente en máquinas de desarrollo con GPU de consumo o incluso CPU.
- Cumplimiento y privacidad de datos: al ejecutarse íntegramente en infraestructura propia, es adecuado para entornos donde el audio no puede salir del perímetro de la organización.
- Evaluación comparativa de modelos de voz: su licencia Apache 2.0 y su formato GGUF facilitan incluirlo como referencia en pruebas de calidad de transcripción frente a otros modelos.
- Integración en aplicaciones de escritorio o embebidas: llama.cpp permite compilar en múltiples plataformas, lo que posibilita incluir transcripción de audio en herramientas locales sin dependencias de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de 1,84 mil millones de parámetros en Q8_0 ronda los 2 GB de pesos, a lo que hay que sumar el proyector `mmproj-model-f16.gguf` y el coste de activaciones y del codificador de audio.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo, pero no se documentan modelos concretos.
- GPU de consumo: previsiblemente cabe en GPU consumer con suficiente VRAM para pesos + proyector + contexto, aunque el fabricante no lo especifica.
- Opciones de despliegue: llama.cpp (`llama cli` y `llama serve`), con soporte de endpoint compatible con la API de OpenAI. No se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; deben evaluarse empíricamente antes de usar en producción.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir transcripciones o respuestas incorrectas, especialmente con audio ruidoso o acentos no representados en el entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican en la documentación disponible.
- Dependencia del proyector: la inferencia de audio requiere el fichero `mmproj-model-f16.gguf`; sin él, el modelo no procesa audio correctamente.
- Compatibilidad de build: el autor referencia llama.cpp `b11669`; versiones distintas pueden requerir ajustes.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base y de los datasets de audio empleados en su entrenamiento, no detallados aquí.
- Formato GGUF cuantizado: la cuantización puede degradar ligeramente la calidad de transcripción frente al modelo base en precisión completa; no se aportan métricas al respecto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-granite/granite-speech-5.0-2b-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-2b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Documentación de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
- Open Speech Repository: https://www.voiptroubleshooter.com/open_speech/american.html
- voiptroubleshooter.com: https://www.voiptroubleshooter.com/
