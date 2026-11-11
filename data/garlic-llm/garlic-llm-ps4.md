# garlic-llm/garlic-llm-ps4

## Resumen

Garlic LLM para PS4 es una aplicacion homebrew para PlayStation 4 que ejecuta el modelo de lenguaje Qwen3.5-9B, de 9.000 millones de parametros, directamente en la GPU de la consola sin conexion a internet ni PC auxiliar. El proyecto lo desarrolla garlic-llm (Leonardo Alegria) y se distribuye como un unico paquete `.pkg` de 5,66 GB que incluye todos los modelos ya convertidos y cuantizados, mayoritariamente a 4 bits, en formatos propietarios de la aplicacion.

Ademas del modelo de chat, la aplicacion integra sintesis de voz con Chatterbox Multilingual y Chatterbox-Turbo de Resemble AI, reconocimiento de voz con Parakeet TDT 0.6B v3 de NVIDIA, un modo de ejecucion de Python (MicroPython) y un modo de razonamiento opcional. El contexto de chat es de 16.000 tokens y el rendimiento declarado alcanza 31-39 tokens/s en texto y hasta 43 tokens/s en codigo.

Su relevancia es fundamentalmente practica y divulgativa: demuestra que un modelo de 9B puede ejecutarse en hardware de 2013 con aceleracion GPU limitada, mediante cuantizacion agresiva y un runtime propio. No es un modelo entrenado desde cero, sino un fine-tune de Qwen3.5-9B empaquetado para un entorno de inferencia cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B) |
| Parametros totales | 9.000 millones (modelo de chat); 0,6B adicionales en el modelo ASR |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.000 tokens |
| Tipos de cuantizacion | Mayoritariamente 4 bits, en formatos propios de la aplicacion (no compatibles con otros runtimes) |
| Idiomas soportados | en, es, pt, ru, it, fr, de (chat y TTS); ASR en 25 idiomas europeos |
| Licencia | Mixta: codigo GPLv3, Qwen3.5-9B Apache-2.0, Chatterbox MIT, Parakeet CC-BY-4.0 |
| Formato de pesos | Paquete `.pkg` propietario de PS4 (5,66 GB); sin safetensors ni GGUF publicados |

## Arquitectura y entrenamiento

El modelo de chat es un fine-tune de Qwen3.5-9B, un transformer denso de 9.000 millones de parametros desarrollado por Alibaba Qwen bajo licencia Apache-2.0. No se dispone de informacion sobre el volumen de tokens de entrenamiento del fine-tune, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card solo indica que los pesos se han convertido a formatos propios y cuantizado a 4 bits para su ejecucion en la PS4.

La innovacion principal no esta en el modelo sino en el runtime: la aplicacion implementa inferencia en la GPU de la PS4 (firmware 11.52 con GoldHEN) con un contexto de 16K tokens y un modo de razonamiento desactivado por defecto. El paquete integra ademas dos modelos de voz (Chatterbox para TTS, Parakeet TDT 0.6B v3 para ASR) y un interprete de MicroPython que ejecuta el codigo generado por el modelo en la propia consola.

## Capacidades

- Generacion de texto conversacional multi-turno con 16K tokens de contexto.
- Razonamiento previo a la respuesta mediante un modo "think" opcional (desactivado por defecto).
- Generacion de codigo Python, ejecutable en la consola mediante un interprete MicroPython integrado.
- Conversion de texto a voz en siete idiomas (espanol, ingles, portugues, ruso, italiano, frances y aleman) con Chatterbox.
- Reconocimiento automatico del habla (dictado) en 25 idiomas europeos con Parakeet TDT 0.6B v3.
- Conversacion por voz completa (entrada ASR, salida TTS) sin conexion.
- Soporte multilingue en chat y voz para los siete idiomas listados.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso.
- No se documenta soporte de vision ni de audio nativo en el modelo de lenguaje.

## Casos de uso

- Asistente conversacional offline en consola: la aplicacion permite mantener conversaciones multi-turno de hasta 16K tokens sin conexion, util en entornos sin red o para demostraciones de inferencia local en hardware de consumo.
- Dictado por voz en 25 idiomas europeos: el modelo ASR Parakeet transcribe voz a texto en la propia consola, adecuado para accesibilidad o para tomar notas sin teclado.
- Conversacion manos libres con respuesta hablada: la combinacion ASR + LLM + TTS permite dialogos completos por voz en siete idiomas, aplicable a demostraciones de asistentes embebidos.
- Ensenanza de programacion en MicroPython: el modelo genera codigo Python que la consola ejecuta al instante, lo que sirve como entorno didactico para aprender logica de programacion sin PC.
- Prototipado de prompts y evaluacion de modelos en hardware limitado: investigadores pueden probar el comportamiento de un fine-tune de 9B en un entorno con restricciones severas de memoria y computo, util para estudiar tecnicas de cuantizacion.
- Demostracion divulgativa de IA local: el paquete de 5,66 GB se instala como cualquier homebrew y sirve para mostrar en charlas o talleres que la inferencia de un LLM de 9B es viable en una PS4 base o Slim.
- Uso recreativo en homebrew: la comunidad de PS4 puede integrar el modelo en flujos de chat o generacion de texto dentro de la consola, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta cifras de throughput en la consola: 31-39 tokens/s en texto y hasta 43 tokens/s en codigo, con un contexto de 16K tokens.

| Metrica | Valor declarado |
|---|---|
| Throughput en texto | 31-39 tokens/s |
| Throughput en codigo | hasta 43 tokens/s |
| Contexto | 16.000 tokens |
| MMLU, HumanEval, GSM8K | no disponible |

## Requisitos de hardware

- Hardware objetivo: PlayStation 4 base o Slim con firmware 11.52 y GoldHEN; la PS4 Pro no esta probada.
- Espacio libre: unos 6 GB, o 12 GB si se copia el paquete al disco de la consola antes de instalar.
- VRAM: no aplica en el sentido convencional; el modelo se ejecuta en la GPU de la PS4 con cuantizacion a 4 bits y un paquete de 5,66 GB.
- GPU de PC: no se documenta ejecucion en A100, H100, RTX 4090 ni otras GPU de escritorio, ya que los pesos estan en formatos propios no compatibles con otros runtimes.
- Opciones de despliegue: unicamente la aplicacion homebrew Garlic LLM en PS4; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 31-39 tokens/s en texto y hasta 43 tokens/s en codigo, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Garlic LLM PS4 (Qwen3.5-9B fine-tune) | 9B | 16K | Mixta (GPLv3 + Apache-2.0 + MIT + CC-BY-4.0) | Solo paquete `.pkg` para PS4 |
| Qwen3.5-9B (modelo base) | 9B | no disponible en la informacion | Apache-2.0 | Pesos en Hugging Face |
| Parakeet TDT 0.6B v3 (ASR integrado) | 0,6B | no aplica | CC-BY-4.0 | Pesos en Hugging Face |
| Chatterbox Multilingual (TTS integrado) | no disponible | no aplica | MIT | Pesos en Hugging Face |

No se dispone de datos de rendimiento comparativo entre Garlic LLM y el Qwen3.5-9B original, por lo que no es posible cuantificar la perdida de calidad por la cuantizacion a 4 bits ni por el fine-tune.

## Limitaciones y advertencias

- Los pesos estan en formatos propios de la aplicacion y no son utilizables con otros runtimes; no hay safetensors ni GGUF publicados.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo base, aunque no se aportan mediciones.
- El contexto esta limitado a 16K tokens, inferior al de muchos modelos actuales.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines automatizados.
- La licencia es mixta: el codigo es GPLv3, el modelo base Apache-2.0, el TTS MIT y el ASR CC-BY-4.0; el uso comercial requiere revisar cada componente por separado.
- Requiere GoldHEN y un firmware concreto (11.52 probado), lo que restringe el publico a consolas modificadas.
- La PS4 Pro no esta probada y el rendimiento puede variar.
- Riesgo de alucinacion inherente a los modelos de 9B, sin evaluaciones publicadas que lo cuantifiquen.
- No hay informacion sobre sesgos del fine-tune ni sobre la composicion de sus datos de entrenamiento.
- El proyecto no esta afiliado ni respaldado por Sony Interactive Entertainment; PlayStation y PS4 son marcas de sus propietarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/garlic-llm/garlic-llm-ps4
- Sitio web oficial: https://garlicllm.dev
- Codigo fuente (GPLv3): https://github.com/leonardo-alegria/garlic-llm
- Modelo base de chat: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo ASR: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
