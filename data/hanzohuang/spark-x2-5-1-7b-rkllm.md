# HanzoHuang/Spark-X2.5-1.7B-RKLLM

## Resumen

Spark-X2.5-1.7B-RKLLM es un conjunto de artefactos cuantizados y convertidos del modelo de lenguaje XHToken/Spark-X2.5-1.7B para su ejecución en las NPU integradas de los SoC Rockchip RK3576 y RK3588, empaquetados en el formato propietario `.rkllm` del toolkit RKLLM 1.3.1. Lo publica el usuario HanzoHuang (repositorio `Hanzo-Huang/rknn-llm`), no el autor original del modelo: no son pesos reentrenados, sino una conversión de un checkpoint descargado de ModelScope, con licencia Apache-2.0 heredada del modelo base.

El interés es práctico: permite ejecutar un modelo de 1,7 mil millones de parámetros íntegramente en la NPU de placas ARM de bajo consumo (RK3576 con dos núcleos NPU, RK3588 con tres), sin GPU dedicada, con pesos de 1,68 GB en W4A16 y 2,28-2,29 GB en W8A8. La contrapartida es una ventana de contexto recortada a 4096 tokens en estos exports, independientemente de la capacidad del modelo original, y la ausencia de benchmarks de calidad publicados.

La relevancia inmediata es acotada: el repositorio tiene 0 descargas y 0 likes, la validación del autor se limita a cuatro comprobaciones funcionales por configuración, y el propio autor advierte que no constituyen un benchmark amplio de calidad. Es material útil para quien esté evaluando desplegar LLM en hardware Rockchip, no para quien busque el mejor modelo de 1,7B en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (corresponde al modelo base XHToken/Spark-X2.5-1.7B; el autor de la conversion no la documenta) |
| Parametros totales | 1,7 mil millones (nominal, segun el nombre del modelo); no verificado en la informacion |
| Parametros activos | No aplica / no disponible (no se describe como MoE) |
| Longitud de contexto | 4096 tokens en estos exports (recortado respecto al modelo base) |
| Tipos de cuantizacion | W4A16 con GRQ y group size 128 (`w4a16_g128`) y W8A8; nivel de optimizacion 1, hybrid rate 0 |
| Idiomas soportados | No disponible (no declarados en el repositorio) |
| Licencia | Apache-2.0 (modelo base); la licencia del runtime y del toolkit RKLLM de Rockchip es independiente |
| Formato de pesos | `.rkllm` (RKLLM 1.3.1), tres artefactos: RK3576 W4A16_G128 (1.679.162.308 bytes), RK3576 W8A8 (2.294.171.084 bytes), RK3588 W8A8 (2.277.308.188 bytes) |
| Tamano del repositorio | 6,3 GB |
| Hardware objetivo | NPU Rockchip RK3576 (2 nucleos) y RK3588 (3 nucleos); solo texto, sin encoder de vision ni audio |
| Libreria / runtime | `rkllm`, runtime RKLLM 1.3.1 ARM64 |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna del modelo base en la documentación disponible: la model card de esta conversión no describe capas, tipo de atención ni mecanismo de positional encoding, y las fuentes web localizadas solo lo presentan como un modelo de lenguaje compacto de propósito general. Tampoco se documenta el proceso de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO o de datos sintéticos). Cualquier afirmación al respecto sería especulación.

Lo que sí está documentado es el proceso de conversión. Se usó RKLLM Toolkit 1.3.1 (commit del conversor `9ad8d7a595e6ed5c3952ed7d765b4c7ff661bf26`, fork `Hanzo-Huang/rknn-llm`), con carga en float32 sobre CUDA, calibración automática mediante `tools/custom_export.py`, 21 muestras de calibración y contexto fijado a 4096. El checkpoint se descargó de ModelScope (rama `master`) sin commit inmutable disponible, y los ficheros quedaron registrados en `source-checksums.json`; los hashes de calibración y artefactos están en `conversion-manifest.json`.

Hay una incidencia técnica relevante: el código remoto del checkpoint falla bajo Transformers 5.8 porque sus metadatos de pesos atados usan el formato de lista antiguo. La conversión se hizo en un entorno aislado con Transformers 4.57.1 y huggingface-hub 0.36.2, pese a que RKLLM Toolkit 1.3.1 declara Transformers 5.8; el autor documenta la excepción de dependencia y la validó con exports reales e inferencia en dispositivo. No se describe ninguna innovación de decodificación (especulativa, atención lineal, etc.); el W4 emplea GRQ con group size 128 y el W8 el algoritmo `w8a8` habitual.

## Capacidades

- Generación de texto en modo conversacional de un solo turno y multiturno, servida mediante un endpoint compatible con `/v1/chat/completions`, incluido streaming por SSE.
- Razonamiento, escritura, traducción, código, uso de herramientas y flujos agénticos: son las capacidades que el autor del modelo base atribuye a la familia Spark-X2.5, no verificadas en estos exports.
- Retención de contexto dentro de la ventana de 4096 tokens: la validación del autor incluye una prueba de recuerdo conversacional (recuperar la palabra `ORCHID`).
- Respuesta factual básica verificada en dispositivo: el autor comprobó respuestas como `42` y `Paris` en las tres configuraciones.
- Solo texto: no incluye encoder de visión ni de audio, y el autor indica explícitamente que no se requiere ni se incluye.
- Ejecución offline en NPU: al correr sobre runtime ARM64 local, no necesita conectividad ni GPU.
- No hay información sobre modo "thinking", salidas estructuradas nativas, ni lista de idiomas soportados en este repositorio.

## Casos de uso

- Asistentes conversacionales embebidos en dispositivos con RK3576 o RK3588: electrodomésticos, kioscos interactivos o paneles industriales que necesitan un chat local sin depender de la nube, con 4096 tokens de contexto suficientes para diálogos de soporte acotados.
- Triaje y enrutamiento de consultas en el borde: usar el modelo como primera etapa que clasifica o reformula la petición del usuario antes de enviarla a un modelo mayor en servidor, reduciendo coste y latencia de red en aplicaciones de atención al cliente.
- Extracción de información estructurada en pasarelas IoT: convertir texto libre (partes de incidencia, notas de campo) en campos concretos dentro de un flujo local, aprovechando que los artefactos ocupan 1,68-2,29 GB y caben en el almacenamiento de la placa.
- Traducción y reescritura local en dispositivos de consumo con RK3588: el modelo base se presenta como apto para traducción, aunque este repositorio no declara idiomas soportados, por lo que habría que validar los pares concretos antes de producción.
- Automatización con tool calling en robótica o domótica: el modelo base declara soporte de uso de herramientas y flujos agénticos; en el dispositivo se combinaría con el servidor API RKLLM para invocar funciones locales (encender actuadores, consultar sensores) dentro de la ventana de 4096 tokens.
- Asistencia de código en estaciones de trabajo ARM de bajo consumo: autocompletado y explicación de fragmentos en editores locales sin GPU, asumiendo la calidad propia de un modelo de 1,7B cuantizado a 4 bits.
- Validación de pipelines RKLLM antes de invertir en fine-tuning: prototipar la integración (runtime 1.3.1, imagen Docker, endpoint OpenAI-compatible) con un modelo ya convertido y verificado en placa, y sustituirlo después por un modelo mayor de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües para estos exports. La única validación documentada son cuatro comprobaciones funcionales por configuración, que el propio autor califica explícitamente como insuficientes para medir calidad:

| Placa | Cuantizacion | Aritmetica | Respuesta factual | SSE | Recuerdo conversacional |
|---|---|---|---|---|---|
| RK3576 | W4A16_G128 | Pass | Pass | Pass | Pass |
| RK3576 | W8A8 | Pass | Pass | Pass | Pass |
| RK3588 | W8A8 | Pass | Pass | Pass | Pass |

Las comprobaciones se hicieron el 2026-10-19 con RKLLM runtime 1.3.1 y el servidor API Python del PR 11 de `rkllm-docker`. Las respuestas de referencia fueron `42`, `Paris` y el recuerdo de `ORCHID`. Los tiempos por comprobación se registran en `conversion-manifest.json`, pero no se reproducen en la model card.

## Requisitos de hardware

- No requiere VRAM de GPU: la inferencia se ejecuta en la NPU integrada del SoC Rockchip.
- SoC compatibles: RK3576 (dos núcleos NPU, artefactos W4A16_G128 de 1,68 GB o W8A8 de 2,29 GB) y RK3588 (tres núcleos NPU, solo artefacto W8A8 de 2,28 GB). No se publica variante W4 para RK3588.
- Huella en almacenamiento: 1,68 GB (W4A16_G128 RK3576) o 2,28-2,29 GB (W8A8). La RAM necesaria durante la inferencia no está documentada; hay que contar con el peso del artefacto más el overhead del runtime RKLLM.
- GPU de escritorio (RTX 4090, A100, H100): no aplica, el formato `.rkllm` no se ejecuta en CUDA. Para GPU habría que recurrir a los pesos safetensors o a una conversión GGUF del modelo base.
- Opciones de despliegue: runtime RKLLM 1.3.1 ARM64 con el servidor API Python, o la imagen Docker de `rkllm-docker` (PR 11) con las variables `MODEL_KIND=llm`, `MODEL_FILE` y `TARGET_PLATFORM=rk3576|rk3588`, montando el directorio del modelo en `/app/models`.
- Alternativas descartadas por incompatibilidad de formato: vLLM, TGI, llama.cpp y Ollama no pueden cargar `.rkllm`.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de primera respuesta para ninguna de las tres configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Spark-X2.5-1.7B-RKLLM (este repositorio) | 1,7B nominal | 4096 tokens | `.rkllm` (RKLLM 1.3.1) | NPU RK3576 / RK3588 | Apache-2.0 | 0 descargas, 0 likes |
| XHToken/Spark-X2.5-1.7B (upstream) | 1,7B nominal | No confirmado en la informacion; una fuente terciaria cita 1,05M de tokens, sin verificar | safetensors (HuggingFace y ModelScope) | GPU / CPU | Apache-2.0 | Publico en HuggingFace, ModelScope y Ollama (`SparkLLM/Spark-X2.5-1.7B`) |
| Spark-X2.5-4B (hermano mayor de la familia) | 4B nominal | No disponible | safetensors | GPU / CPU | Apache-2.0 (upstream) | Publico, misma familia y card |
| Conversiones GGUF comunitarias del mismo modelo base | 1,7B nominal | No disponible | GGUF | CPU / GPU consumer via llama.cpp | Apache-2.0 (heredada) | Existen mirrors en HuggingFace (p. ej. `MENIARAYOUB/Spark-X2.5-1.7B`), con formato y cuantizaciones no verificados |

La diferencia funcional frente a las alternativas no es de calidad, sino de destino de ejecución: este repositorio es la única variante de la familia pensada para NPU Rockchip, y a cambio pierde portabilidad y recorta el contexto a 4096 tokens. El modelo de 4B de la misma familia ofrece más capacidad si el hardware objetivo admite GPU o CPU con más memoria, pero no hay artefacto RKLLM publicado para él en la información disponible. No se han localizado benchmarks comparativos entre estas variantes.

## Limitaciones y advertencias

- Formato cerrado: los artefactos `.rkllm` solo funcionan con el runtime RKLLM de Rockchip, versión 1.3.1 en este caso. No hay retrocompatibilidad garantizada con otras versiones del runtime.
- Contexto recortado: 4096 tokens frente a la capacidad potencialmente mayor del modelo base; las tareas de contexto largo (RAG con muchos documentos, análisis de repositorios) quedan fuera de alcance.
- Validación mínima: cuatro comprobaciones funcionales por configuración, con respuestas de juguete (`42`, `Paris`, `ORCHID`). No hay evidencia publicada sobre calidad real, tasa de alucinación ni robustez multilingüe.
- Idiomas no declarados: el repositorio no enumera idiomas soportados, de modo que el rendimiento en castellano no está verificado y debe evaluarse antes de usarlo en producción.
- Procedencia no inmutable: el checkpoint se descargó de la rama `master` de ModelScope, sin commit fijado. La trazabilidad se apoya en `source-checksums.json`, no en una revisión reproducible.
- Excepción de dependencias en la conversión: se usó Transformers 4.57.1 frente al 5.8 que declara el toolkit, por un fallo de metadatos de pesos atados. Es un riesgo de reproducibilidad si se intenta regenerar el artefacto con el entorno nominal.
- Calibración escasa: 21 muestras para el paso de calibración automática, lo que puede sesgar la cuantización W4A16 hacia la distribución de esas muestras.
- Sin variante de 4 bits para RK3588: en esa placa solo hay W8A8 (2,28 GB), con mayor huella de memoria.
- Licencia: el modelo es Apache-2.0, pero la licencia del runtime y el toolkit RKLLM de Rockchip es separada y debe revisarse para uso comercial del binario desplegado.
- Sesgos: no documentados. Al ser una conversión de pesos sin evaluación propia, hereda los sesgos del modelo base, que tampoco están descritos en la información disponible.
- Madurez: repositorio con 0 descargas y 0 likes, publicado y actualizado el mismo día (2026-10-19) con 27 minutos de diferencia entre creación y última actualización; sin mantenimiento demostrado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HanzoHuang/Spark-X2.5-1.7B-RKLLM
- Modelo base en HuggingFace: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Modelo base en ModelScope: https://www.modelscope.cn/models/XHToken/Spark-X2.5-1.7B
- Repositorio GitHub de la familia Spark-X2.5: https://github.com/XHToken/Spark-X2.5
- Organización SparkLLM en GitHub: https://github.com/XHToken
- RKLLM release v1.3.1 (airockchip): https://github.com/airockchip/rknn-llm/blob/release-v1.3.1/README.md
- Fork del toolkit usado en la conversion: https://github.com/Hanzo-Huang/rknn-llm
- Servidor Docker RKLLM (PR 11): https://github.com/Hanzo-Huang/rkllm-docker/pull/11
- Pagina en Ollama: https://ollama.com/SparkLLM/Spark-X2.5-1.7B:latest
- Mirror comunitario en HuggingFace: https://huggingface.co/MENIARAYOUB/Spark-X2.5-1.7B
- Ficha de referencia terciaria (contexto citado de 1,05M, sin verificar): https://www.llmreference.com/model/spark-x2.5-1.7b
