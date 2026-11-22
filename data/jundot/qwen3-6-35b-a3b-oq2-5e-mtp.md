# Jundot/Qwen3.6-35B-A3B-oQ2.5e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ2.5e-mtp es una cuantizacion en precision mixta, en formato MLX, del modelo Qwen/Qwen3.6-35B-A3B de Alibaba Qwen. El modelo base es un modelo de lenguaje y vision con arquitectura de mezcla de expertos (MoE) que combina 35.951.822.704 parametros totales con aproximadamente 3B parametros activos por token, y una disposicion hibrida de capas Gated DeltaNet y Gated Attention. Esta version la publica el usuario Jundot mediante su herramienta oQ (oMLX v0.8.0) y esta pensada para inferencia eficiente en hardware Apple Silicon a traves del framework MLX.

El checkpoint incluye el backbone de lenguaje, el codificador de vision y la cabeza de prediccion multi-token (MTP), empaquetados en safetensors con un peso efectivo medio de 3,312 bits por parametro para el checkpoint completo (3,114 bits/parametro para el backbone de lenguaje). El repositorio ocupa 14,9 GB y la mayor parte de los pesos se almacena en 2 bits afines con grupo de 64, lo que reduce drasticamente los requisitos de memoria frente al modelo original en BF16.

Su relevancia actual radica en que permite ejecutar un modelo MoE multimodal de 35B parametros en equipos con memoria unificada relativamente modesta, manteniendo capacidades de texto, imagen y tool calling, con licencia Apache-2.0 que facilita el uso comercial. Es una opcion practica para desarrolladores que quieran prototipar agentes multimodales en local sin depender de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (Gated DeltaNet + Gated Attention) con codificador de vision y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | Aproximadamente 3B (segun denominacion A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ2.5e de precision mixta: affine 2-bit grupo 64, 3-bit grupo 64, 4-bit grupo 64, 8-bit grupo 128, 8-bit grupo 64 y BF16; media efectiva 3,312 bits/parametro |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos con una disposicion hibrida que alterna capas Gated DeltaNet y capas Gated Attention. Cuenta con 35,952B parametros totales y alrededor de 3B activos, lo que permite un coste de computo por token propio de un modelo mucho menor. Incorpora ademas un codificador de vision (0,447B parametros) para entrada image-text-to-text y una cabeza de prediccion multi-token (MTP) de 0,845B parametros, orientada a acelerar la decodificacion especulativa.

Esta publicacion no entrena el modelo: cuantiza el checkpoint original. El proceso oQ2.5e asigna bits por sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste por minimos cuadrados ponderados de escala y sesgo. El resultado se distribuye asi: 25,770B pesos en 2 bits (71,679% del total, 7,500 GiB), 6,442B en 3 bits (17,920%, 2,625 GiB), 0,805B en 4 bits (2,240%, 0,422 GiB), 0,129B en 8 bits grupo 128 (0,359%, 0,124 GiB), 2,328B en 8 bits grupo 64 (6,474%, 2,303 GiB) y 0,478B en BF16 (1,329%, 0,890 GiB). No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento general, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias al codificador de vision incluido en el checkpoint.
- Prediccion multi-token (MTP) para decodificacion especulativa, que puede aumentar el throughput en inferencia.
- Soporte de tool calling y function calling: no disponible de forma explicita en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponible; el modelo base no detalla idiomas en la informacion facilitada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes multimodales en Mac: al estar en formato MLX y ocupar 14,9 GB, permite cargar un modelo MoE de 35B con vision en equipos Apple Silicon de memoria unificada alta, sin GPU dedicada.
- Analisis de documentos con imagenes: el codificador de vision permite procesar capturas, diagramas o formularios junto a instrucciones textuales, util para extraccion de datos en flujos internos.
- Generacion de codigo asistida en local: el modelo base esta orientado a tareas de codigo y razonamiento; la cuantizacion a 3,312 bits/parametro permite integrarlo en editores o CLI sin conexion.
- Experimentacion con decodificacion especulativa: la inclusion de la cabeza MTP permite medir ganancias de latencia en pipelines MLX frente a decodificacion autoregresiva estandar.
- Evaluacion de cuantizacion extrema: util como referencia para investigadores que comparan la perdida de calidad de oQ2.5e frente al checkpoint BF16 en tareas de texto y vision.
- Despliegue de bajo coste en entornos de investigacion: con licencia Apache-2.0, se puede usar en proyectos academicos o comerciales sin restricciones de atribucion adicionales mas alla de la licencia.
- Chat multi-turno con contexto visual: para demos de conversacion que combinan imagenes y texto en un mismo hilo, siempre que se valide la ventana de contexto real del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 14,886 GB (13,864 GiB) en disco; en inferencia se necesita al menos esa cantidad mas overhead de runtime, por lo que se recomienda un minimo practico de 16-18 GB de memoria unificada.
- GPU recomendadas: al ser formato MLX, esta orientado a Apple Silicon (series M1/M2/M3/M4 con memoria unificada de 16 GB o superior). No es directamente compatible con CUDA sin conversion previa.
- Cabe en GPU consumer: si, en equipos Apple con 16 GB o mas de memoria unificada; no esta pensado para GPUs NVIDIA consumer en su formato actual.
- Opciones de despliegue: MLX y oMLX (herramienta del autor); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere mejoras con decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Jundot/Qwen3.6-35B-A3B-oQ2.5e-mtp | 35,952B | ~3B | no disponible | safetensors MLX | Apache-2.0 |
| Qwen/Qwen3.6-35B-A3B (base) | 35,952B | ~3B | no disponible | safetensors | Apache-2.0 |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otras alternativas en la informacion proporcionada; la unica comparacion fiable es frente al modelo base sin cuantizar, del que esta version reduce el peso de aproximadamente BF16 a 3,312 bits/parametro.

## Limitaciones y advertencias

- La cuantizacion a 2-3 bits dominante puede degradar la calidad en tareas sensibles, especialmente razonamiento complejo y generacion de codigo, frente al modelo base en BF16.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion agresiva puede acentuarlo en contextos largos o tareas de recuperacion de hechos.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Limitaciones de contexto e idioma no disponibles; conviene verificar la ventana real del modelo base antes de usarlo en produccion.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el archivo LICENSE y cumplir las condiciones de la licencia del modelo base.
- El formato MLX limita el despliegue a ecosistema Apple; no es portable directamente a CUDA, ROCm ni a servidores x86 con GPU NVIDIA sin conversion.
- El autor indica que la version actual (2026-11-19) se recuantizo con oMLX 0.8.0; copias anteriores pueden tener mayor error de cuantizacion y deberian descartarse.
- No hay garantias de soporte ni mantenimiento por parte de Alibaba Qwen sobre esta cuantizacion concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ2.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de la herramienta oQ/oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
