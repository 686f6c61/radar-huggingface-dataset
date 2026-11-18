# LiquidAI/LFM3-Audio-2B

## Resumen

LFM3-Audio-2B es un modelo de audio "any-to-any" desarrollado por Liquid AI dentro de la familia LFM3, que incluye variantes base, de texto, de visión, de audio, omni y de decisión. El modelo acepta texto o audio como entrada y produce texto, voz o ambos, con un enfoque explícito en despliegue local sobre portátiles y dispositivos edge. Con 2.002.332.928 parámetros totales (2B) y un repositorio de 4,2 GB en safetensors, se posiciona como una alternativa compacta frente a modelos de audio de mayor tamaño que requieren infraestructura de servidor.

La arquitectura combina un backbone LFM3, un codificador de audio causal propio y el tokenizador de audio LiquidCodec, ambos introducidos por Liquid AI como evolución respecto a LFM2.5-Audio, con mejoras declaradas en calidad de voz. El modelo cubre cuatro ejes funcionales: chat de voz con respuestas en streaming (solo en inglés), reconocimiento, síntesis y traducción de voz en 18 idiomas, comprensión y razonamiento sobre audio (voz, sonidos y eventos), y tool calling a partir de peticiones habladas.

Su relevancia actual radica en la combinación de tres factores poco frecuentes en un mismo modelo: tamaño de 2B apto para hardware de consumo, cobertura multilingüe amplia (incluido castellano) y capacidades de agente mediante function calling. La licencia es LFM Open License v1.0 (lfm1.0), lo que condiciona el uso comercial y conviene revisar antes de integrarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LFM3 con codificador de audio causal y tokenizador de audio LiquidCodec |
| Parametros totales | 2.002.332.928 (2B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | 18: en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh |
| Licencia | LFM Open License v1.0 (lfm1.0, "other") |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone LFM3 de Liquid AI, al que se añaden dos componentes específicos de audio: un codificador de audio causal y el tokenizador LiquidCodec. El codificador causal permite procesar el audio de forma incremental, lo que habilita respuestas en streaming, y el tokenizador LiquidCodec convierte la señal de audio en tokens discretos que el backbone puede manejar junto con el texto. La model card describe esta combinación como una mejora de calidad de voz respecto a LFM2.5-Audio, aunque no se detalla la arquitectura interna del backbone (si es transformer puro, híbrido o basado en SSM).

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se especifican innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal. La etiqueta `custom_code` en el repositorio indica que la carga del modelo requiere código propio del autor más allá de la implementación estándar de transformers.

## Capacidades

- Chat de voz: entrada de audio y salida en texto y voz con streaming; las respuestas solo en texto pueden incluir razonamiento previo a la respuesta. El chat de voz está limitado actualmente al inglés.
- Reconocimiento de voz (ASR) multilingüe en 18 idiomas, incluido el castellano.
- Síntesis de voz (TTS) y traducción de voz entre los idiomas soportados.
- Comprensión y razonamiento sobre audio: interpretación de grabaciones y respuesta a preguntas sobre la voz, los sonidos y los eventos contenidos en ellas.
- Tool calling / function calling: conversión de peticiones habladas en llamadas a herramientas para controlar aplicaciones y dispositivos, con texto o voz acompañando a las llamadas.
- Salida multimodal combinada: texto y habla de forma simultánea.
- Cobertura multilingüe de 18 idiomas en las tareas de voz; el chat conversacional de voz queda restringido al inglés.

## Casos de uso

- Asistentes de voz en dispositivos edge: el modelo puede ejecutarse localmente en portátiles y dispositivos compactos, gestionando la entrada de voz y generando respuestas habladas en streaming sin depender de la nube, lo que reduce latencia y preserva la privacidad del audio.
- Transcripción multilingüe de reuniones: con ASR en 18 idiomas, incluido el castellano, se puede transcribir audio de reuniones o entrevistas y, adicionalmente, traducir el resultado a otro de los idiomas soportados.
- Control de aplicaciones por voz: gracias al tool calling, una petición hablada como encender una luz o consultar un calendario se transforma en una llamada a función estructurada, con confirmación en texto o voz.
- Accesibilidad: conversión de texto a voz y de voz a texto para personas con discapacidad visual o motriz, ejecutándose en hardware local para evitar enviar audio sensible a servicios externos.
- Análisis de contenido audiovisual: responder preguntas sobre grabaciones (quién habla, qué sonidos o eventos aparecen) en tareas de moderación, archivado o investigación.
- Interfaces conversacionales embebidas: integración en electrodomésticos, vehículos o terminales de atención presencial donde el modelo actúa como capa de comprensión y respuesta de voz con soporte de herramientas para acciones concretas.
- Generación de voces para contenido: síntesis de voz en varios idiomas para locuciones, audiolibros o avisos, con la ventaja de que el modelo corre en local y no requiere un servicio de TTS externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa por tamaño, un modelo de 2B parámetros en precisión completa (fp16/bf16) requiere del orden de 4 GB solo para los pesos, a los que hay que sumar la memoria del codificador de audio, el tokenizador LiquidCodec y las cachés de inferencia; las cifras exactas no están publicadas.
- GPU recomendadas: no disponible. El modelo se presenta como ejecutable en portátiles y dispositivos edge, lo que sugiere que no requiere GPU de centro de datos, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: la model card afirma que corre localmente en portátiles y dispositivos edge, pero no se detalla qué GPUs de consumo concretas son suficientes ni con qué cuantización.
- Opciones de despliegue: la librería indicada es transformers con `custom_code`; no se confirman en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Audio-2B | 2B | No disponible | 18 | LFM Open License v1.0 | Audio any-to-any con tool calling y enfoque edge |
| LFM2.5-Audio | No disponible | No disponible | No disponible | No disponible | Predecesor directo citado por el autor; LFM3-Audio-2B declara mejor calidad de voz |
| Otras alternativas de audio de tamano similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparación cuantitativa con modelos de audio de la competencia no está disponible en la información proporcionada; no se aportan cifras de benchmarks ni especificaciones de terceros que permitan una tabla rigurosa.

## Limitaciones y advertencias

- El chat de voz conversacional está limitado actualmente al inglés; el resto de tareas de voz cubren 18 idiomas, pero no debe asumirse paridad funcional entre idiomas.
- No se han publicado datos sobre sesgos, composición del dataset ni procesos de alineación, por lo que el riesgo de sesgos demográficos, acústicos o lingüísticos no puede evaluarse a priori.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento sobre audio y en la conversión de peticiones habladas a llamadas de herramientas, donde un error puede desencadenar acciones no deseadas.
- La licencia LFM Open License v1.0 no es una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial o redistribución.
- No se especifica la longitud de contexto, lo que impide planificar con precisión casos de conversaciones largas o audios extensos.
- El repositorio requiere `custom_code`, lo que puede complicar la integración con herramientas estándar y aumentar el coste de mantenimiento.
- No se dispone de información sobre latencia, throughput ni comportamiento en producción bajo carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Blog de lanzamiento de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de la API: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
- Colección LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
- Modelo de referencia de la familia (banner): https://huggingface.co/LiquidAI/LFM3-1.7B
