# ryoshu/qwen-mtp-chat-runtime

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un runtime compilado en Swift y Metal para ejecutar un modelo Qwen 3.8 27B con decodificación especulativa multi-token (MTP) en Apple Silicon. El autor, ryoshu, ha compilado el harness de confianza del desafío MTP de Layr-Labs y le ha añadido un subcomando `chat` para permitir generación de texto arbitraria y en streaming sobre una sesión de decodificación por bloques MTP nativa. El runtime se distribuye como binarios precompilados que no requieren toolchain de Xcode ni Swift para ejecutarse, solo macOS 14+ y un Mac con chip Apple Silicon.

La relevancia actual radica en que los modelos modernos como Qwen 3.8 incluyen cabezas MTP integradas, pero casi ningún runtime las aprovecha. Este proyecto demuestra cómo usar la MTP para acelerar la generación (el propio autor y otros reportan ganancias de 1.5 a 3 veces en velocidad) manteniendo la misma distribución de salida mediante verificación con rejection sampling. Es una pieza de infraestructura, no un modelo, por lo que las especificaciones técnicas del propio artefacto son limitadas; los pesos del modelo se descargan por separado de los repositorios de EigenLabs.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos; el runtime ejecuta un modelo externo Qwen 3.8 27B) |
| Parametros totales | no disponible (el modelo subyacente es de 27B, pero no se proporcionan datos exactos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit para el backbone (Qwen3.8-27B-4bit) y bf16 para la cabeza MTP (Qwen3.8-27B-MTP-bf16) |
| Idiomas soportados | no disponible (depende del modelo subyacente) |
| Licencia | MIT (runtime); los pesos del modelo tienen su propia licencia |
| Formato de pesos | no contiene pesos; binarios compilados (CLI, worker, libreria Metal) |

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura de modelo ni un proceso de entrenamiento, porque no contiene pesos. Es un runtime compilado que carga los pesos de un modelo Qwen 3.8 27B (distribuido por EigenLabs) y ejecuta el forward pass mediante MLX (Metal Performance Shaders) en Apple Silicon. La innovación técnica principal es el uso de la cabeza MTP integrada en el modelo para hacer decodificación especulativa: el modelo redacta varios tokens por adelantado, los verifica en una sola pasada por lotes y conserva solo los que pasan un rejection sampling exacto. Esto mantiene la distribución de salida idéntica al modelo original mientras acelera la generación.

El runtime se compiló a partir del harness de confianza del desafío MTP de Layr-Labs (MIT) e incluye una adición propia: el subcomando `chat` para generación arbitraria en streaming. Los binarios están compilados con el runtime Swift de macOS y enlazan solo frameworks del sistema, por lo que no se necesita Xcode para ejecutarlos.

## Capacidades

- Generación de texto arbitraria y en streaming a través del subcomando `chat`.
- Decodificación especulativa multi-token nativa: el modelo redacta varios tokens por adelantado y los verifica en una sola pasada, acelerando la generación sin cambiar la distribución de salida.
- Carga y ejecución de modelos Qwen 3.8 27B (backbone en 4-bit y cabeza MTP en bf16) descargados por separado de EigenLabs.
- Ejecución local en Apple Silicon con Metal, sin necesidad de toolchain de desarrollo.
- No incluye soporte para tool calling, agentes, visión ni funciones multimodales: es un runtime de chat de texto.

## Casos de uso

- Chat local en Mac: usar `chat.sh --prompt "pregunta"` para mantener conversaciones con el modelo Qwen 3.8 27B en un equipo Apple Silicon sin depender de la nube.
- Generación de texto acelerada con MTP: aprovechar la decodificación especulativa para reducir la latencia de generación en aplicaciones de redacción, resumen o traducción local.
- Integración en aplicaciones Swift: los binarios del runtime pueden ser invocados desde una app macOS que necesite un LLM local, sin requerir que el usuario instale Python ni otras dependencias.
- Evaluación de modelos MTP: al ser un runtime compilado del harness de Layr-Labs, puede usarse para medir la velocidad y la calidad de la decodificación MTP en hardware Apple.
- Despliegue en entornos con restricciones de conectividad: al ser un binario autocontenido, se puede instalar en máquinas sin acceso a la red para ejecutar un LLM local.
- Prototipado de productos de IA local: sirve como base para construir un CLI de chat local con Qwen 3.8 en Apple Silicon, reutilizando la lógica de MTP sin tener que implementarla desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona ganancias de velocidad de 1.5 a 3 veces frente a la generación sin MTP (según el repositorio MTPLX y la guía de llama.cpp), pero no hay cifras concretas en esta documentación.

## Requisitos de hardware

- Apple Silicon Mac (M1, M2, M3 o M4) con macOS 14 o superior.
- No se necesita Xcode ni Swift toolchain para ejecutar los binarios.
- Los pesos del modelo se descargan por separado y requieren espacio en disco: el backbone en 4-bit (aproximadamente 15-16 GB) y la cabeza MTP en bf16 (unos 3-4 GB).
- La VRAM depende del modelo: un Qwen 27B en 4-bit cabe en Macs con al menos 16-24 GB de memoria unificada; se recomienda 32 GB para mayor comodidad.
- Opciones de despliegue: el runtime está pensado para uso local en Apple Silicon; no se menciona soporte para vLLM, llama.cpp u otros servidores de inferencia.

## Comparativa con modelos similares

No hay una comparativa directa disponible porque este repositorio es un runtime, no un modelo. Las alternativas comparables serían otros runtimes que soporten MTP en Apple Silicon:

| Runtime | Modelo soportado | Aceleracion MTP | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ryoshu/qwen-mtp-chat-runtime` | Qwen 3.8 27B | Sí (nativa) | MIT | Binarios compilados, requiere Apple Silicon |
| `youssofal/mtplx` | Qwen 3.5/3.6 | Sí (nativa) | no disponible | App Mac y CLI |
| llama.cpp con MTP | Qwen 3.6 27B y 35B-A3B | Sí (desde mayo 2026) | MIT | Multiplataforma (CPU/GPU) |

La diferencia principal es que este runtime está especializado en Apple Silicon y usa MLX/Metal, mientras que llama.cpp es multiplataforma y más generalista. No se dispone de datos de rendimiento para comparar numéricamente.

## Limitaciones y advertencias

- No es un modelo: el repositorio no contiene pesos; solo binarios del runtime. Para usar el modelo hay que descargar los pesos de EigenLabs, que pueden tener su propia licencia y condiciones de uso.
- Solo funciona en Apple Silicon con macOS 14+: no hay soporte para Windows, Linux o hardware NVIDIA.
- No incluye soporte para tool calling, agentes, visión ni audio: es un CLI de chat simple.
- La generación con MTP depende de que el modelo subyacente tenga cabezas MTP integradas; si los pesos no las incluyen, la aceleración no funcionará.
- Al ser un binario compilado, no se puede modificar el comportamiento sin recompilar desde el código fuente.
- Riesgo de alucinaciones: es un modelo de lenguaje estándar, por lo que puede generar información falsa; no hay mitigaciones específicas en el runtime.
- La licencia MIT se aplica al runtime, pero los pesos del modelo tienen su propia licencia (probablemente Apache 2.0 o similar, no confirmado en esta documentación).

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/ryoshu/qwen-mtp-chat-runtime
- Repositorio GitHub de soporte: https://github.com/ryoshu/qwen-mtp-chat
- Harness original de Layr-Labs: https://github.com/Layr-Labs/qwen-3.8-mtp-challenge
- Pesos del modelo (backbone): https://huggingface.co/EigenLabs/Qwen3.8-27B-4bit
- Pesos de la cabeza MTP: https://huggingface.co/EigenLabs/Qwen3.8-27B-MTP-bf16
- Proyecto MTPLX (alternativa): https://github.com/youssofal/mtplx
- Guía de MTP en llama.cpp: https://gist.github.com/eeshansrivastava89/85797104af34181944bfd1360d69e8af
- Documentación de Qwen en Unsloth: https://unsloth.ai/docs/models/qwen3.6</think>## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un runtime compilado en Swift y Metal para ejecutar el modelo Qwen 3.8 27B en Apple Silicon con decodificación especulativa multi-token (MTP). Lo desarrolla ryoshu, que ha compilado el harness de confianza del desafío MTP de Layr-Labs y le ha añadido un subcomando `chat` para permitir generación de texto arbitraria y en streaming. El runtime incluye binarios precompilados que no requieren Xcode ni toolchain de Swift para ejecutarse, solo macOS 14+ y un chip Apple Silicon.

La relevancia actual radica en que los modelos modernos como Qwen 3.6 incluyen cabezas MTP integradas, pero casi ningún runtime las aprovecha. Este proyecto demuestra cómo usar la MTP para acelerar la generación manteniendo la misma distribución de salida mediante verificación con rejection sampling. Es una pieza de infraestructura, no un modelo, por lo que los pesos se descargan por separado de los repositorios de EigenLabs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos; el runtime ejecuta un modelo Qwen 3.8 27B) |
| Parametros totales | no disponible (el modelo subyacente es de 27B, pero no se detalla en este repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | backbone en 4-bit (Qwen3.8-27B-4bit) y cabeza MTP en bf16 (Qwen3.8-27B-MTP-bf16) |
| Idiomas soportados | no disponible (depende del modelo subyacente) |
| Licencia | MIT |
| Formato de pesos | no contiene pesos; binarios compilados (CLI, worker, libreria Metal) |

## Arquitectura y entrenamiento

El repositorio no describe un entrenamiento ni una arquitectura de modelo, porque no contiene pesos. Es un runtime compilado que carga los pesos de un modelo Qwen 3.8 27B (distribuido por EigenLabs) y ejecuta la inferencia mediante MLX con kernels Metal en Apple Silicon. La innovacion técnica es el uso de la cabeza MTP del modelo para decodificacion especulativa: el modelo redacta varios tokens por adelantado, los verifica en una sola pasada por lotes y conserva solo los que pasan un rejection sampling exacto, manteniendo la distribucion de salida identica al modelo original.

El runtime se compilo desde el harness de confianza de Layr-Labs (MIT) y se le anadio el subcomando `chat` para generacion arbitraria en streaming. Los binarios enlazan solo con frameworks del sistema y el runtime Swift de macOS, por lo que no necesitan toolchain adicional.

## Capacidades

- Generacion de texto arbitrario y en streaming mediante el subcomando `chat`.
- Decodificacion especulativa multi-token nativa: el modelo redacta varios tokens y los verifica en una sola pasada, acelerando la generacion.
- Carga y ejecucion de modelos Qwen 3.8 27B con backbone en 4-bit y cabeza MTP en bf16.
- Ejecucion local en Apple Silicon, sin dependencias externas ni Xcode.
- No incluye tool calling, agentes, vision ni audio: es un runtime de chat, no un modelo de proposito general.

## Casos de uso

- Chat local en Apple Silicon: usar `./chat.sh --prompt "pregunta"` para mantener conversaciones con el modelo Qwen 3.8 27B sin conexion a internet.
- Generacion de texto acelerada con MTP: aprovechar la decodificacion especulativa para reducir la latencia en aplicaciones de redaccion, traduccion o resumen.
- Integracion en aplicaciones macOS: invocar los binarios desde una app nativa para dotarla de un LLM local sin que el usuario necesite instalar Python ni Xcode.
- Evaluacion de modelos MTP: el runtime proviene del harness de Layr-Labs, por lo que puede usarse para medir la velocidad y calidad de la decodificacion MTP en Qwen 3.8.
- Despliegue en entornos con restricciones de red: al ser binarios autocontenidos, se pueden instalar en maquinas sin acceso a internet para ejecutar inferencia local.
- Prototipado de herramientas de IA local: sirve como base para construir un cliente de chat local con Qwen 3.8, reutilizando la logica MTP sin implementarla desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que la MTP acelera la generacion entre 1.5 y 3 veces en otros proyectos (MTPLX, llama.cpp), pero no hay datos concretos de este runtime.

## Requisitos de hardware

- Apple Silicon Mac (M1, M2, M3 o M4) con macOS 14 o superior.
- No se necesita Xcode ni Swift toolchain para ejecutar los binarios.
- Los pesos del modelo se descargan por separado y requieren espacio en disco: el backbone en 4-bit ocupa aproximadamente 15-16 GB y la cabeza MTP en bf16 unos 3-4 GB.
- VRAM estimada: el modelo 27B en 4-bit necesita al menos 16-24 GB de memoria unificada en Apple Silicon; se recomienda 32 GB para margen.
- Opciones de despliegue: solo local en Apple Silicon; no hay soporte para vLLM, llama.cpp u otros servidores.

## Comparativa con modelos similares

No hay una comparativa directa porque este repositorio es un runtime, no un modelo. Alternativas para ejecutar Qwen con MTP en Apple Silicon:

| Runtime | Modelo soportado | MTP | Licencia | Disponibilidad |
|---|---|---|---|---|
| ryoshu/qwen-mtp-chat-runtime | Qwen 3.8 27B | Si (nativa) | MIT | Apple Silicon |
| MTPLX | Qwen 3.5/3.6 | Si (nativa) | no disponible | Mac app y CLI |
| llama.cpp con MTP | Qwen 3.6 27B y 35B-A3B | Si | MIT | Multiplataforma |

No se dispone de datos de rendimiento para comparar estas opciones.

## Limitaciones y advertencias

- No es un repositorio de modelo: no contiene pesos, solo el runtime. Los pesos se descargan de EigenLabs y pueden tener licencias adicionales.
- Solo funciona en Apple Silicon con macOS 14+; no hay soporte para Windows, Linux ni GPUs NVIDIA.
- No incluye tool calling, agentes, vision ni audio; es un CLI de chat simple.
- La aceleracion MTP depende de que el modelo tenga cabezas MTP integradas; si los pesos no las incluyen, no habra mejora.
- Al ser binarios compilados, no se puede modificar el comportamiento sin recompilar desde el codigo fuente.
- Riesgo de alucinaciones: es un LLM generico y puede producir informacion falsa; no hay mitigacion especifica en el proyecto.
- La licencia MIT se aplica al runtime, pero los pesos del modelo tienen su propia licencia (probablemente Apache 2.0, no confirmada en esta documentacion).

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/ryoshu/qwen-mtp-chat-runtime
- Repositorio GitHub de soporte: https://github.com/ryoshu/qwen-mtp-chat
- Harness original de Layr-Labs: https://github.com/Layr-Labs/qwen-3.8-mtp-challenge
- Backbone del modelo: https://huggingface.co/EigenLabs/Qwen3.8-27B-4bit
- Cabeza MTP del modelo: https://huggingface.co/EigenLabs/Qwen3.8-27B-MTP-bf16
- MTPLX (alternativa): https://github.com/youssofal/mtplx
- Guia de MTP en llama.cpp: https://gist.github.com/eeshansrivastava89/85797104af34181944bfd1360d69e8af
- Documentacion de Qwen3.6 en Unsloth: https://unsloth.ai/docs/models/qwen3.6
