# NaorBonomo/gemma-4-e4b-it-4bit-ple

## Resumen

Gemma 4 E4B IT 4-bit PLE es un reempaquetado del modelo instructivo Gemma 4 E4B de Google, cuantizado a 4 bits con tamano de grupo 64 y adaptado para inferencia en dispositivos Apple con memoria unificada limitada, principalmente iPhone y Mac con Apple Silicon. El autor, NaorBonomo, no reentrena ni modifica los pesos: parte de `mlx-community/gemma-4-e4b-it-4bit` y verifica el split bit a bit contra el checkpoint de origen. El resultado son 4.644.441.130 parametros almacenados en un repositorio de 4,2 GB.

La innovacion principal no esta en el modelo sino en el empaquetado. Gemma 4 utiliza Per-Layer Embeddings (PLE): cada token ID indexa un vector de 256 dimensiones por cada una de las 42 capas, lo que suma 10.752 valores por token. Con un vocabulario de 262.144 tokens, esa tabla ocupa aproximadamente 1,5 GB. Los cargadores MLX estandar la colocan en memoria GPU junto al resto de pesos, lo que supera el limite de memoria (Jetsam) de iOS. Este repositorio separa la tabla PLE en un fichero binario propio que se mapea desde flash con `mmap` y `MADV_RANDOM`, manteniendo la memoria wired por debajo de 2,5 GB.

El modelo solo funciona con el runtime SwiftPLE, un paquete Swift construido sobre `mlx-swift`, y no carga en `mlx-lm` ni en otros cargadores MLX convencionales. Es relevante para desarrolladores que quieran ejecutar un modelo de 4,6 mil millones de parametros de forma local en iOS 17+ o macOS 14+ sin depender de la nube, a costa de renunciar a las torres de vision y audio, que han sido eliminadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Gemma 4 con Per-Layer Embeddings (PLE), cuantizacion 4-bit grupo 64 |
| Parametros totales | 4.644.441.130 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el vocabulario es de 262.144 tokens; la ventana de contexto no se especifica) |
| Tipos de cuantizacion | 4-bit, group size 64 (pesos empaquetados con escalas y sesgos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors (`model.safetensors`, ~2,5 GB) + `gemma4_ple_table.bin` (~1,5 GB) + `ple_manifest.json` |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B en su variante instruction-tuned, desarrollado por Google. La arquitectura es un transformer con Per-Layer Embeddings: cada token ID se traduce en un vector de 256 dimensiones por capa, en las 42 capas del modelo, lo que da 10.752 valores por token. Esta tabla se consulta por ID de token antes de que se ejecuten las capas de atencion, lo que permite mantenerla fuera de los pesos principales y mapearla bajo demanda.

Este repositorio concreto no entrena ni ajusta nada: es una conversion de formato. La cuantizacion a 4 bits con grupo 64 ya venia del checkpoint `mlx-community/gemma-4-e4b-it-4bit`. El autor solo divide los pesos en dos ficheros y define un layout binario para la tabla PLE: cada token ocupa una fila contigua de 6.048 bytes, compuesta por 5.376 bytes de pesos 4-bit empaquetados, 336 bytes de escalas bfloat16 y 336 bytes de sesgos. El offset de fila se calcula como `tokenID × 6048`, de modo que cada paso de decodificacion toca una sola fila. El split esta verificado bit a bit contra la fuente. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF o DPO del modelo original.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del Gemma 4 E4B instruction-tuned.
- Razonamiento y respuesta a instrucciones en formato chat, con plantilla `chat_template.jinja` incluida.
- Generacion de codigo y matematicas: capacidad heredada del modelo base, sin datos especificos publicados en esta ficha.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision: eliminada. Las torres de vision y audio fueron retiradas en este reempaquetado.
- Audio: eliminado.
- Inferencia estrictamente local en dispositivo, sin llamadas a red.

## Casos de uso

- Asistente conversacional offline en iPhone: el modelo se ejecuta integramente en el dispositivo con SwiftPLE, manteniendo la memoria wired por debajo de 2,5 GB, lo que permite conversaciones multi-turno sin conexion y sin enviar datos a servidores externos.
- Procesamiento de texto privado en macOS: en un M4 MacBook Air alcanza unos 26 tok/s en decodificacion, adecuado para resumir documentos, reescribir borradores o extraer informacion de textos locales sin salir del equipo.
- Funciones de autocompletado y redaccion dentro de apps iOS: con 21 tok/s en iPhone 17 Pro (16 tok/s sostenidos bajo carga) y un prefill de unos 578 tok/s, es viable para sugerencias de texto y respuestas cortas integradas en la interfaz.
- Prototipado de funcionalidades de IA en apps Apple: el paquete SwiftPLE y la app de demostracion en `Example/SwiftPLEDemo` permiten integrar el modelo via Swift Package Manager y validar casos de uso antes de decidir si se necesita un modelo mayor o en la nube.
- Chatbot de soporte en entornos sin conectividad: en escenarios de campo, aviacion o instalaciones aisladas, el modelo puede gestionar consultas frecuentes con una base de conocimiento inyectada en el prompt, siempre que quepa en la ventana de contexto del modelo base.
- Generacion de texto en pipelines de CI para macOS: al ser un paquete Swift, se puede invocar desde pruebas automatizadas o herramientas internas que necesiten generar texto de forma reproducible en runners Apple Silicon.
- Distribucion de un modelo de 4,6 mil millones de parametros en una app iOS sin superar los limites de memoria del sistema, gracias al mapeo de la tabla PLE desde flash en lugar de cargarla en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo publica metricas de velocidad de inferencia:

| Dispositivo | Decodificacion | Prefill |
|---|---|---|
| iPhone 17 Pro | hasta 21 tok/s (~16 tok/s sostenidos bajo carga) | ~578 tok/s |
| M4 MacBook Air | ~26 tok/s | no disponible |

Las cifras corresponden a contexto vacio; la velocidad de decodificacion disminuye a medida que crece el contexto. La memoria wired se mantiene por debajo de 2,5 GB.

## Requisitos de hardware

- VRAM o memoria unificada: menos de 2,5 GB de memoria wired durante la inferencia, gracias a que la tabla PLE (~1,5 GB) se mapea desde flash y los pesos del transformer (~2,5 GB en disco) se cargan de forma normal.
- Almacenamiento: aproximadamente 4,2 GB para el repositorio completo.
- GPU y SoC compatibles: Apple Silicon exclusivamente (iPhone y Mac con chip M-series). No hay soporte para CUDA ni para GPUs de NVIDIA o AMD.
- Requisitos de sistema: iOS 17+ o macOS 14+. En iOS es obligatorio habilitar el entitlement `com.apple.developer.kernel.increased-memory-limit`.
- Cabe en GPU de consumo: si, en el sentido de que cabe en los SoC Apple Silicon de iPhone y Mac, pero no en GPUs discretas de consumo tipo RTX 4090, porque el runtime es exclusivo de MLX/Swift.
- Opciones de despliegue: unicamente SwiftPLE (paquete Swift sobre `mlx-swift`). No carga en `mlx-lm`, llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: 21 tok/s de decodificacion y 578 tok/s de prefill en iPhone 17 Pro; 26 tok/s de decodificacion en M4 MacBook Air, con contexto vacio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NaorBonomo/gemma-4-e4b-it-4bit-ple | 4.644.441.130 | no disponible | safetensors + binario PLE, SwiftPLE | Gemma | HuggingFace, 0 descargas |
| mlx-community/gemma-4-e4b-it-4bit | mismos pesos base (4-bit) | no disponible | MLX estandar | Gemma | HuggingFace (modelo de origen) |
| Gemma 4 E4B IT original | no disponible | no disponible | safetensors, transformers | Gemma | HuggingFace |

La diferencia frente al checkpoint de `mlx-community` no esta en los pesos ni en la calidad, sino en el empaquetado: la version PLE permite ejecutarse en iPhone sin superar el limite de memoria de iOS, mientras que el checkpoint estandar requiere un cargador MLX convencional y no cabe en el presupuesto de memoria de un telefono. Frente al Gemma 4 E4B original, este reempaquetado pierde las torres de vision y audio.

## Limitaciones y advertencias

- Solo genera texto: las torres de vision y audio han sido eliminadas, por lo que no procesa imagenes ni audio.
- Dependencia total del runtime SwiftPLE: no funciona en `mlx-lm` ni en otros cargadores MLX, lo que limita la portabilidad y obliga a usar el paquete Swift del autor.
- Exclusivo de Apple Silicon: sin soporte para CUDA, ROCm ni GPUs discretas.
- En iOS es imprescindible el entitlement de memoria incrementada; sin el, el sistema puede terminar el proceso por Jetsam.
- La velocidad de decodificacion cae a medida que crece el contexto, segun advierte el propio autor.
- Hereda los sesgos, el riesgo de alucinacion y las limitaciones del Gemma 4 E4B base, que no se detallan en la informacion disponible.
- Idiomas soportados no especificados en esta ficha.
- La licencia Gemma impone los terminos de uso de Google, incluida la politica de uso aceptable; es responsabilidad del integrador revisar las restricciones para uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni informes independientes de calidad.
- La fecha de creacion indicada (2026-11-02) procede de los metadatos del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NaorBonomo/gemma-4-e4b-it-4bit-ple
- Modelo base en HuggingFace: https://huggingface.co/mlx-community/gemma-4-e4b-it-4bit
- Runtime SwiftPLE: https://github.com/naorbonomo/SwiftPLE
- Herramienta de conversion `ple-splitter`: https://github.com/naorbonomo/SwiftPLE (ruta `Tools/ple-splitter`)
- App de demostracion iOS/macOS: https://github.com/naorbonomo/SwiftPLE (ruta `Example/SwiftPLEDemo`)
