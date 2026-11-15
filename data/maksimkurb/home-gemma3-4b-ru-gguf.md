# maksimkurb/Home-Gemma3-4b-ru-GGUF

## Resumen

Home-Gemma3-4b-ru es un ajuste fino (fine-tuning) del modelo google/gemma-3-4b-it orientado a controlar dispositivos de domotica mediante Home Assistant en ruso. Lo desarrolla maksimkurb y resuelve un problema muy concreto: convertir ordenes en lenguaje natural a llamadas de herramientas del ecosistema Home Assistant (HassTurnOn, HassTurnOff, HassLightSet, etc.), rechazando explicitamente las peticiones que no pueden ejecutarse con los dispositivos disponibles. La integracion de destino es home-llm, que interpreta el formato de tool call que emite el modelo.

El modelo conserva la arquitectura del Gemma 3 4B instruct original (transformer denso, aproximadamente 3.880 millones de parametros) y se distribuye unicamente en formato GGUF, con dos cuantizaciones (Q8_0 de 4,1 GB y Q4_K_M de 2,5 GB). El entrenamiento se hizo con QLoRA sobre la base en 4 bits, con una unica epoca y 12.500 ejemplos sinteticos generados a partir del generador de datos de home-llm extendido al ruso.

Es relevante porque demuestra un patron de especializacion muy practico: un modelo pequeno, cuantizado y ejecutable en hardware de consumo (se entreno en una RTX 5070 Ti de 16 GB) que resuelve una tarea estrecha de function calling con una tasa de acierto declarada del 85,1% en llamadas exactas. No obstante, es un modelo de nicho, con cero descargas y sin validacion externa en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3), ajuste fino con QLoRA sobre google/gemma-3-4b-it |
| Parametros totales | 3.880.263.168 (aproximadamente 3,88 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el comando de ejemplo con llama-server) |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (publicadas); el resto de cuantizaciones estandar de llama.cpp no se distribuyen en el repo |
| Idiomas soportados | Ruso (ru) |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | GGUF (no se publican safetensors del adaptador ni del modelo fusionado) |

## Arquitectura y entrenamiento

La base es google/gemma-3-4b-it, un transformer denso de aproximadamente 3,88 mil millones de parametros. El ajuste se realizo con QLoRA sobre la base cuantizada a 4 bits (via el espejo unsloth/gemma-3-4b-it), con r=64, alpha=128, dropout 0,05, aplicado a las capas de atencion y MLP de la parte linguistica; las capas de vision y los embeddings quedaron congelados. Se uso el optimizador 8-bit AdamW con schedule cosine, learning rate 1e-4, micro-batch 1 con acumulacion de 16, empaquetado de secuencias y longitud maxima de 4096. El entrenamiento fue de una sola epoca (401 pasos) en una RTX 5070 Ti de 16 GB, en bf16 con gradient checkpointing y kernels de Liger. La loss se calculo solo sobre las respuestas del asistente y descendio de aproximadamente 3,5 a aproximadamente 0,1.

Los datos son sinteticos: se partio del generador de home-llm (data/generate_data.py) y se extendio al ruso traduciendo con una LLM local los conjuntos de frases y respuestas (nombres de dispositivos, acciones, consultas de estado, duraciones, respuestas, rechazos, llamadas fallidas, prompts de sistema y listas de tareas), con enmascaramiento de placeholders y verificacion del resultado. Los identificadores de entidad se transliteran con python-slugify siguiendo la convencion de Home Assistant. El conjunto final tiene 12.500 ejemplos de entrenamiento (aproximadamente 19,8 millones de tokens) y 3.075 de test. Tras el entrenamiento, el adaptador se fusiono con la base en bf16, se convirtio a GGUF con convert_hf_to_gguf.py y se cuantizo con llama-quantize.

## Capacidades

- Generacion de texto breve en ruso orientada a respuestas de confirmacion o rechazo de acciones de domotica.
- Function calling especifico del ecosistema Home Assistant: emite llamadas como HassTurnOn, HassTurnOff o HassLightSet en un bloque `<tool_call>` con argumentos en JSON.
- Rechazo explicito cuando la peticion no puede satisfacerse con los dispositivos disponibles (capacidad entrenada y medida en la evaluacion).
- Manejo de placeholders de la integracion home-llm, como `<brightness>` y `<color>`, que la integracion sustituye en tiempo de ejecucion.
- Consultas de estado y de duraciones dentro del dominio de dispositivos del hogar.
- Capacidades multilingues limitadas al ruso; no se declara soporte funcional de otros idiomas.
- No se declaran capacidades de razonamiento general, matematicas, codigo, vision ni modo thinking, aunque la base Gemma 3 4B las tenga; el ajuste esta orientado a la tarea de domotica.

## Casos de uso

- Control por voz o texto de luces y enchufes en Home Assistant: el modelo traduce "apaga la luz del pasillo" a una llamada HassTurnOff con el identificador correcto, lo que permite montar un asistente local sin depender de la nube.
- Automatizaciones conversacionales en el hogar: integrado como backend de home-llm mediante llama.cpp server o Generic OpenAI API, gestiona peticiones de encendido, apagado y ajuste de brillo o color dentro de un flujo multi-turno.
- Asistente de domotica en hardware de consumo: con la cuantizacion Q4_K_M (2,5 GB) puede ejecutarse en GPUs modestas o incluso en CPU, lo que abarata el despliegue en una Raspberry Pi o un mini-PC.
- Rechazo seguro de ordenes no ejecutables: cuando el usuario pide algo que ningun dispositivo puede hacer, el modelo responde sin emitir tool call (96,9% de acierto en el conjunto de test), lo que evita acciones erroneas en produccion.
- Prototipado rapido de integraciones home-llm en ruso: sirve como referencia para validar el formato de tool call y el flujo de placeholders antes de invertir en un modelo mayor.
- Despliegue local con privacidad: al ejecutarse en local con llama.cpp, las ordenes del hogar no salen de la red domestica, algo relevante para dispositivos de seguridad y camaras.
- Base para ajustes adicionales en otros idiomas o dominios: el pipeline QLoRA descrito (Axolotl, traduccion sintetica con LLM local, enmascaramiento de placeholders) es reutilizable para adaptar el modelo a otros idiomas o a otros ecosistemas de domotica.

## Benchmarks y rendimiento

Evaluacion declarada por el autor sobre 600 ejemplos aleatorios del conjunto de test, con el modelo en bf16 y generacion greedy, comprobando la primera respuesta del asistente:

| Metrica | Resultado |
|---|---|
| Llamada correcta (funcion y argumentos) | 85,1% (372 de 437) |
| Funcion correcta | 91,8% |
| Sin llamada cuando no se necesita | 96,9% (158 de 163) |
| Formato `<tool_call>` roto | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni evaluaciones de las versiones cuantizadas. El autor advierte que el conjunto de test incluye erratas intencionadas en identificadores de entidad que el modelo suele corregir, lo que se contabiliza como error, por lo que la precision real podria ser superior.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5-5 GB para Q8_0 y aproximadamente 3 GB para Q4_K_M, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para Q8_0; para Q4_K_M basta con 4 GB. Una RTX 3060, RTX 4060 o RTX 5070 Ti son suficientes; A100 y H100 no aportan ventaja para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4-6 GB de VRAM. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (llama-server), integracion home-llm como backend llama.cpp server o Generic OpenAI API. No se documenta soporte de vLLM ni TGI para este repo GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El comando de ejemplo usa `-c 4096 -ngl 99`, es decir, contexto de 4096 tokens y todas las capas en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Home-Gemma3-4b-ru | 3,88 mil millones | 4096 | Domotica Home Assistant en ruso | Gemma Terms of Use | GGUF en Hugging Face |
| google/gemma-3-4b-it | 3,88 mil millones | no disponible en esta ficha | Modelo generalista instruct | Gemma Terms of Use | Pesos originales en Hugging Face |
| home-llm (modelos de referencia) | no disponible | no disponible | Domotica Home Assistant en ingles | no disponible | Repositorio home-llm |

La comparacion con home-llm es la mas directa por tarea, pero no se dispone de sus especificaciones exactas en la informacion proporcionada. Frente a la base Gemma 3 4B, este ajuste sacrifica capacidades generales a cambio de precision en el dominio de domotica en ruso y de un formato de tool call concreto.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: puede fallar ante dispositivos no estandar, nombres atipicos o formulaciones poco frecuentes.
- Errores gramaticales posibles: los nombres de dispositivo se insertan en nominativo, lo que puede producir frases poco naturales en ruso.
- No debe usarse para controlar dispositivos criticos para la seguridad (cerraduras, calderas, alarmas) sin confirmacion humana.
- Solo ruso: no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- Contexto limitado a 4096 tokens en el ejemplo de despliegue; no se documenta soporte de ventanas mayores.
- Licencia Gemma Terms of Use: revisar las restricciones de uso comercial y las obligaciones de atribucion antes de integrarlo en un producto.
- Las cuantizaciones no han sido evaluadas de forma independiente; el rendimiento en Q4_K_M puede diferir del 85,1% medido en bf16.
- Modelo con cero descargas y cero likes en el momento de redactar la ficha: no hay validacion externa ni reportes de la comunidad.
- No se publican safetensors del adaptador ni del modelo fusionado, solo GGUF, lo que limita el reentrenamiento o la inspeccion de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maksimkurb/Home-Gemma3-4b-ru-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Integracion home-llm: https://github.com/acon96/home-llm
- Home Assistant: https://www.home-assistant.io/
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
