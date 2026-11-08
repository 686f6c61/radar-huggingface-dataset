# feverdoingwork/Qwen3.8-27B-NVFP4-mini-Starlight

## Resumen

Qwen3.8-27B-NVFP4-mini-Starlight es un fichero de pesos cuantizados del modelo denso multimodal Qwen3.8-27B (27.000 millones de parametros, desarrollado por el equipo Qwen de Alibaba), empaquetado por el usuario `feverdoingwork` para el motor de inferencia Starlight. No es un checkpoint generico: el repositorio contiene un unico fichero `.starlight` de 12,62 GiB (13.551.144.192 bytes) que solo carga el motor Starlight, con soporte explicito para tarjetas NVIDIA Blackwell y sin soporte para llama.cpp, Ollama, LM Studio ni Transformers.

La particularidad tecnica es la receta de cuantizacion, denominada NVFP4-mini: el cuerpo del modelo se mantiene en NVFP4 (coma flotante de 4 bits con escalas por bloque), pero las proyecciones gate y up de todas las capas se regeneran desde el checkpoint BF16 a 3 bits, lo que reduce el fichero lo suficiente para caber en una sola tarjeta de 16 GB. El fichero incluye ademas el codificador de vision (reconstruido desde BF16) y la cabeza borrador de prediccion multi-token (MTP) para decodificacion especulativa, lo que permite acelerar la generacion sin ficheros externos.

Su relevancia practica es acotada pero clara: demuestra que un modelo multimodal de 27B puede servirse en hardware de consumo Blackwell (RTX 5060 Ti, RTX 5070 Ti) con ventanas de contexto de hasta 262.144 tokens y velocidades de decodificacion de 70 a 177 tok/s segun configuracion. El repo no tiene descargas ni likes en el momento de la consulta y no publica evaluacion de calidad frente al modelo BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B) con codificador de vision y cabeza MTP; empaquetado en formato Starlight |
| Parametros totales | 27B (modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (limite del modelo base); ventanas de arranque medidas entre 141.000 y 262.144 tokens segun tarjeta y modo |
| Tipos de cuantizacion | NVFP4 (4 bits con escalas por bloque) en el cuerpo; gate/up a 3 bits (Q3) en todas las capas; cache de atencion q4_0; codificador de vision desde BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.starlight` (fichero unico, `NVFP4-mini_268fa4ae.starlight`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer autorregresivo denso de 27B parametros con capacidades multimodales (pipeline `image-text-to-text`). El fichero Starlight contiene tres componentes empaquetados: el modelo de texto (198 tensores de pesos en NVFP4), el codificador de vision (333 tensores) y la cabeza borrador MTP. La cuantizacion parte del checkpoint Qwen/Qwen3.8-27B-FP8 y reconstruye las proyecciones gate y up desde BF16 a 3 bits, una decision de compromiso tamano/calidad que el autor no documenta con metricas.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. La innovacion destacable del empaquetado es la integracion de la cabeza MTP dentro del propio fichero, lo que habilita decodificacion especulativa sin un drafter separado, y la compatibilidad con DFlash2 (mas rapido, pero requiere un fichero drafter externo que no forma parte de este repositorio).

## Capacidades

- Generacion de texto y razonamiento multimodal: el pipeline declarado es `image-text-to-text`, con codificador de vision incluido en el fichero.
- Procesamiento de imagenes y texto combinados, heredado del modelo base Qwen3.8-27B.
- Razonamiento multi-paso con esfuerzo de razonamiento configurable (la prueba agentica del autor usa "highest reasoning effort").
- Tareas de codigo: la prueba agentica de 5 tareas resolvio 4/5 en primera pasada y 5/5 con una repeticion (muestra muy pequena).
- Decodificacion especulativa mediante MTP integrado y, opcionalmente, DFlash2 con drafter externo.
- Servicio mediante interfaz HTTP compatible con OpenAI a traves del motor Starlight.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en local sobre GPU de consumo: con una RTX 5060 Ti de 16 GB y contexto de 98.304 tokens, el modelo resuelve tareas agenticas de codigo (4/5 en primera pasada en la prueba del autor), lo que permite integrarlo en flujos de edicion y refactorizacion sin enviar codigo a la nube.
- Analisis de documentos largos con imagenes: la ventana de hasta 262.144 tokens y el codificador de vision permiten procesar informes, contratos o manuales con figuras y tablas en una sola pasada, util en entornos con requisitos de confidencialidad.
- Despliegue en estacion de trabajo con una sola tarjeta: el fichero de 12,62 GiB cabe en 16 GB de VRAM, lo que habilita prototipos de producto sobre RTX 5060 Ti o RTX 5070 Ti sin infraestructura de servidor.
- Transcripcion y resumen de capturas o interfaces: al ser image-text-to-text, puede describir pantallas, diagramas y graficos generados por herramientas internas y convertirlos en texto estructurado.
- Evaluacion comparativa de cuantizaciones: sirve como referencia practica para medir la perdida de calidad de NVFP4 + gate/up a 3 bits frente al BF16, aunque el autor no publica esa comparacion y habria que realizarla por cuenta propia.
- Generacion aumentada por recuperacion (RAG) con contexto largo: la ventana de 262.144 tokens con dos tarjetas permite inyectar grandes volumenes de documentacion recuperada sin trocear en exceso, con velocidades de 128 a 177 tok/s.
- Servicio local compatible con OpenAI: el motor Starlight expone una API HTTP compatible, lo que facilita conectar herramientas existentes que ya hablan el protocolo de OpenAI sin adaptadores adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que no hay puntuacion de calidad de este fichero frente al modelo BF16.

Los unicos datos medidos son de rendimiento de inferencia, en una unica ejecucion por configuracion:

| Tarjeta | Modo | Contexto maximo de arranque | Velocidad de decodificacion |
|---|---|---:|---:|
| RTX 5060 Ti, una tarjeta | MTP | 178.176 tokens (262.144 con desbordamiento de cache) | 70,3 tok/s (BetterBench, 30 oct 2026) |
| RTX 5060 Ti, una tarjeta | DFlash2 | 141.000 tokens (262.144 con desbordamiento de cache) | 114,0 tok/s (30 oct 2026) |
| RTX 5060 Ti, una tarjeta | sin especulacion | 179.200 tokens (262.144 con desbordamiento de cache) | 18,4 tok/s (30 oct 2026) |
| RTX 5060 Ti, dos tarjetas | MTP | 262.144 tokens | 128,3 tok/s (30 oct 2026) |
| RTX 5060 Ti, dos tarjetas | DFlash2 | 262.144 tokens | 176,9 tok/s (29 oct 2026) |

Prueba agentica de codigo: 5 tareas, ventana de 98.304 tokens, MTP, RTX 5070 Ti, maximo esfuerzo de razonamiento; 4/5 en primera pasada y 5/5 con una repeticion. El propio autor advierte que la muestra es demasiado pequena para extraer conclusiones de ranking.

## Requisitos de hardware

- VRAM: el fichero ocupa 12,62 GiB, por lo que encaja en tarjetas de 16 GB. Con cache de atencion q4_0 y contexto largo, parte de la cache puede desbordar a RAM del sistema.
- GPU soportadas: exclusivamente NVIDIA Blackwell; el autor cita una RTX 5060 Ti o una RTX 5070 Ti con una sola tarjeta, o dos RTX 5060 Ti. No hay soporte para AMD.
- GPU de centro de datos (A100, H100): no mencionadas ni probadas en la model card.
- Cabe en GPU de consumo: si, en RTX 5060 Ti y RTX 5070 Ti de 16 GB.
- Despliegue: unicamente el motor Starlight mediante su Launcher, que sirve el modelo por HTTP compatible con OpenAI. No es compatible con vLLM, llama.cpp, Ollama, LM Studio, TGI ni Transformers.
- Latencia y throughput: 18,4 tok/s sin especulacion, 70,3 tok/s con MTP y 114,0 tok/s con DFlash2 en una RTX 5060 Ti; 128,3 tok/s (MTP) y 176,9 tok/s (DFlash2) con dos RTX 5060 Ti.
- Contexto maximo de arranque medido: 141.000 a 179.200 tokens en una tarjeta segun modo; 262.144 tokens con dos tarjetas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| feverdoingwork/Qwen3.8-27B-NVFP4-mini-Starlight | 27B (denso) | 262.144 tokens | `.starlight` (NVFP4 + gate/up a 3 bits) | Apache-2.0 | Solo motor Starlight, NVIDIA Blackwell |
| nvidia/Qwen3.8-27B-NVFP4 | 27B (denso) | no disponible | NVFP4 cuantizado con Model Optimizer | no disponible | Hugging Face (NVIDIA) |
| Qwen/Qwen3.8-27B (BF16) | 27B (denso) | 262.144 tokens | safetensors BF16 | Apache-2.0 | Generico (Transformers y otros) |
| Qwen/Qwen3.8-27B-FP8 | 27B (denso) | 262.144 tokens | FP8 | Apache-2.0 | Generico |

La comparativa de rendimiento y calidad entre estas variantes no esta disponible en la informacion proporcionada; el autor no publica evaluacion frente al BF16 ni frente a la cuantizacion oficial de NVIDIA.

## Limitaciones y advertencias

- Compatibilidad restringida: el fichero solo funciona con el motor Starlight. No es un checkpoint de proposito general y no esta soportado ni probado en llama.cpp, Ollama, LM Studio, Transformers, vLLM ni TGI.
- Hardware restringido: solo NVIDIA Blackwell; sin soporte para AMD ni para GPU de centro de datos segun la model card.
- Perdida de calidad no cuantificada: la cuantizacion NVFP4 con gate/up a 3 bits degrada la calidad respecto al BF16, y el autor no publica ninguna metrica que lo mida. Cualquier uso en produccion deberia acompanarse de una evaluacion propia.
- Riesgo de alucinacion: el propio autor advierte que, como todo modelo de lenguaje, puede afirmar cosas falsas con seguridad.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Idiomas: no se especifican los idiomas soportados; hay que asumir los del modelo base, sin confirmacion en esta ficha.
- Contexto dependiente del hardware: las ventanas maximas dependen de la tarjeta, el tipo de cache y el uso concurrente de VRAM; los casos no medidos no estan garantizados.
- Fichero unico y autor unico: repositorio sin descargas ni validacion de la comunidad; conviene verificar el SHA-256 (`a1475895921f2e81a91131f2ab263c46f2e80f05d5d3670d19f79d189cf98cd2`) antes de usarlo.
- Licencia: Apache-2.0, la misma del modelo base, sin restricciones adicionales declaradas para uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/feverdoingwork/Qwen3.8-27B-NVFP4-mini-Starlight
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint intermedio FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Cuantizacion NVFP4 oficial de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- BetterBench (herramienta de medida citada): https://github.com/GGZ14/BetterBench
