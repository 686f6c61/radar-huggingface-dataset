# prabanta-dev/Qwen3.5-9B-JNS

## Resumen

Qwen3.5-9B-JNS es una conversion de pesos del modelo Qwen/Qwen3.5-9B de Alibaba (equipo Qwen) al formato JNS, el formato propietario del motor de inferencia Janas, escrito en C por el proyecto prabanta-dev y pensado para equipos convencionales, con o sin GPU. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son los mismos del modelo base, unicamente reescritos en el orden en que Janas los lee. El repositorio lo publica el usuario prabanta-dev, autor tambien del motor Janas (licencia GPL-3.0-or-later, que no se aplica a estos ficheros).

El modelo base es un transformer de aproximadamente 9 000 millones de parametros con licencia Apache 2.0. La model card del conversor lo describe como denso e incluye, ademas del fichero principal cuantizado, un bloque separado de prediccion multi-token (MTP) que se usa como borrador para decodificacion especulativa. Fuentes de terceros describen la familia Qwen3.5 como una arquitectura hibrida de Gated Delta Networks y MoE disperso, con 262 144 tokens de contexto, modo de razonamiento y soporte de 201 idiomas, aunque esos datos no estan confirmados en la model card del repositorio.

La relevancia de esta ficha es doble: por un lado documenta un caso practico de cuantizacion y portado a un motor de inferencia alternativo (Janas frente a llama.cpp), y por otro sirve como referencia de rendimiento en CPU con graficos integrados, un escenario poco cubierto por las fichas habituales centradas en GPU. El repositorio tiene, a fecha de los datos disponibles, 0 descargas y 0 likes, y fue publicado el 11 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada de Qwen3.5-9B; la model card del conversor la describe como densa, con bloque MTP. Fuentes de terceros (DeepInfra) describen la familia como hibrida de Gated Delta Networks y MoE disperso |
| Parametros totales | Aproximadamente 9 000 millones (heredados del modelo base Qwen3.5-9B) |
| Parametros activos | No aplica (modelo denso segun la model card del repositorio) |
| Longitud de contexto | 262 144 tokens segun fuentes de terceros (DeepInfra); no confirmado en la model card del repositorio |
| Tipos de cuantizacion | Q4_K_M (fichero principal) y Q4_K (bloque MTP); formato JNS |
| Idiomas soportados | 201 idiomas segun DeepInfra; no indicado en la model card del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | JNS (solo legible por el motor Janas); derivado de GGUF y, en el bloque MTP, del checkpoint original |

## Arquitectura y entrenamiento

Los ficheros de este repositorio no implican ningun entrenamiento nuevo: son una obra derivada de Qwen/Qwen3.5-9B y de cuantizaciones GGUF ya existentes. En concreto, `qwen3.5-9b-q4km.jns` (5,68 GB) se obtiene reescribiendo `Qwen3.5-9B-Q4_K_M.gguf` de unsloth/Qwen3.5-9B-GGUF con la herramienta `gguf2jns`, conservando los metadatos. El bloque de prediccion multi-token, que no esta presente en el GGUF, se extrae del checkpoint original del modelo base y se cuantiza a Q4_K mediante `hf2jns_mtp`, dando lugar a `qwen3.5-9b-mtp-q4k.jns` (0,15 GB). El autor indica explicitamente que nada se ha reentrenado ni podado.

La innovacion tecnica relevante no esta en el modelo, sino en el motor que lo ejecuta. Janas esta implementado en C y utiliza el bloque MTP como borrador para decodificacion especulativa, lo que eleva la velocidad de escritura de 14 a 24 tok/s en el equipo de referencia. El formato JNS no es interoperable: solo Janas lee estos ficheros, de modo que cualquier uso requiere el binario del motor o su compilacion desde fuentes.

## Capacidades

Las capacidades efectivas son las heredadas del modelo base Qwen3.5-9B. Segun las fuentes de terceros consultadas:

- Generacion de texto y razonamiento, con modo de pensamiento (thinking/reasoning mode) segun DeepInfra.
- Codigo e instrucciones: descrito como fuerte en coding, instruction following y tareas de contexto largo.
- Tool calling / function calling, segun DeepInfra.
- Multi-token prediction, con bloque MTP especificamente portado por Janas para decodificacion especulativa.
- Capacidades multilingues: 201 idiomas segun DeepInfra.
- Capacidades multimodales (texto e imagen) segun AI Model Radar y Apertis AI, con fusion temprana de tokens multimodales; no confirmado para esta conversion JNS.
- Razonamiento en contexto largo, con una ventana de 262 144 tokens segun DeepInfra (no confirmada en la model card).

## Casos de uso

- Inferencia en portatil sin GPU dedicada: el caso de uso documentado por el propio autor es ejecutar el modelo en un Intel Core Ultra 9 185H con graficos Arc integrados y 32 GB de RAM, alcanzando 14 tok/s de escritura y 24 tok/s con bloque MTP en chat.
- Sustitucion de llama.cpp en CPU: el motor Janas reporta 111 tok/s de lectura de prompt frente a 78 de llama.cpp y 14 tok/s de escritura frente a 8,7, con una entrada de 1 024 tokens y 16 generados, lo que lo hace util en entornos donde el preprocesado de contexto largo domina el coste.
- Asistente local de escritura y resumen: al ejecutarse integramente en el equipo, es adecuado para tareas de procesamiento de documentos confidenciales que no deben salir de la maquina.
- Experimentacion con formatos de cuantizacion alternativos: sirve como banco de pruebas para comparar Q4_K_M servido por un motor en C frente a otras combinaciones de cuantizacion y runtime.
- Desarrollo y depuracion del propio motor Janas: el repositorio es un artefacto de referencia para validar la conversion GGUF a JNS y la carga del bloque MTP.
- Evaluacion de decodificacion especulativa con MTP en hardware modesto: el bloque adicional de 0,15 GB permite medir la ganancia real (de 14 a 24 tok/s en el equipo citado) antes de invertir en infraestructura mayor.
- Reproduccion de benchmarks de inferencia: junto con `janas-bench` y `llama-bench`, permite replicar mediciones de lectura y escritura en distintos equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos numericos son de velocidad de inferencia, medidos los dias 9 y 10 de octubre de 2026 en un Intel Core Ultra 9 185H con GPU Arc integrada y 32 GB de memoria:

| Metrica | Janas | llama.cpp |
|---|---:|---:|
| Lectura de prompt (1024 tokens) | 111 tok/s | 78 tok/s |
| Escritura (16 tokens) | 14 tok/s | 8,7 tok/s |
| Lectura de prompt (chat, segun el texto) | 103 tok/s | no disponible |
| Escritura en chat con bloque borrador | 24 tok/s | no disponible |

El autor advierte que las cifras variaran en otras maquinas.

## Requisitos de hardware

- Espacio en disco: 5,83 GB en total (5,68 GB del fichero principal Q4_K_M mas 0,15 GB del bloque MTP).
- Memoria: el equipo de referencia dispone de 32 GB de RAM y funciona sin GPU dedicada, usando la GPU Arc integrada opcionalmente.
- CPU: Intel Core Ultra 9 185H en las mediciones publicadas; el motor esta implementado en C y esta pensado para computadoras ordinarias.
- GPU: no se documentan requisitos de GPU dedicada. La unica aceleracion grafica mencionada es la Arc integrada del procesador citado.
- Sistemas operativos soportados por el binario precompilado: Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores). Tambien es posible compilar Janas desde fuentes.
- Despliegue: exclusivamente mediante el motor Janas (`janas-get` para descargar, `janas-chat` para conversar). No hay soporte de vLLM, llama.cpp, Ollama ni TGI para el formato JNS.
- Latencia y throughput: 103 tok/s de lectura y 14 tok/s de escritura, o 24 tok/s con el bloque borrador en chat, en el equipo de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| prabanta-dev/Qwen3.5-9B-JNS | ~9 000 M (heredados) | No confirmado en la model card (262 144 segun terceros) | JNS | Apache 2.0 | Solo ejecutable con Janas; orientado a CPU |
| Qwen/Qwen3.5-9B (base) | ~9 000 M | 262 144 segun terceros | safetensors (presumiblemente) | Apache 2.0 | Modelo original de Alibaba; capacidades multimodales segun terceros |
| unsloth/Qwen3.5-9B-GGUF | ~9 000 M | Igual que el base | GGUF | Apache 2.0 | Origen de la cuantizacion Q4_K_M usada por Janas; ejecutable en llama.cpp y derivados |

No se dispone de datos de rendimiento de calidad para establecer una comparacion cuantitativa entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Formato no interoperable: los ficheros JNS solo los lee el motor Janas, lo que descarta su uso con vLLM, llama.cpp, Ollama, TGI u otras herramientas habituales.
- Perdida por cuantizacion: la conversion parte de Q4_K_M y Q4_K, por lo que la calidad es inferior a la de los pesos en precision completa o en cuantizaciones mas altas.
- Idiomas y contexto sin confirmar: los 201 idiomas y la ventana de 262 144 tokens proceden de fuentes de terceros, no de la model card del repositorio, y no se han verificado para esta conversion.
- Capacidades multimodales inciertas: aunque la familia se describe como multimodal, la model card de esta conversion no confirma que los pesos portados conserven la torre de vision.
- Conflicto de descripcion arquitectonica: la model card afirma que el modelo es denso, mientras que una fuente de terceros lo describe como MoE disperso; conviene verificar la composicion real antes de planificar despliegues.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad para el modelo base ni para la conversion.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Madurez del proyecto: el repositorio tiene 0 descargas y 0 likes y fue creado el 11 de octubre de 2026, por lo que no hay evidencia de uso en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero exige conservar la atribucion al modelo original de Alibaba Cloud, a la cuantizacion GGUF de unsloth y a la conversion del proyecto Janas. La licencia GPL-3.0-or-later del motor Janas no afecta a los ficheros de pesos, pero si a quien redistribuya o modifique el motor.
- Rendimiento dependiente del hardware: las cifras publicadas corresponden a un unico equipo y el propio autor advierte que variaran en otras maquinas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prabanta-dev/Qwen3.5-9B-JNS
- Motor Janas (GitHub): https://github.com/prabanta-dev/janas
- Documentacion del motor (README): https://github.com/prabanta-dev/janas#readme
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantizacion GGUF de origen: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Perfil del autor: https://huggingface.co/prabanta-dev
- Ficha de DeepInfra sobre Qwen3.5-9B: https://deepinfra.com/Qwen/Qwen3.5-9B
- Ficha de AI Model Radar: https://aimodelradar.app/models/qwen3-5-9b
- Ficha de Apertis AI: https://apertis.ai/models/qwen3.5-9b
