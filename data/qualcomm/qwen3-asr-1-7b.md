# qualcomm/Qwen3-ASR-1.7B

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el equipo Qwen y distribuido en este repositorio por Qualcomm en formato pre-exportado y optimizado para dispositivos con hardware Qualcomm. El modelo se construye sobre la capacidad de comprension de audio de Qwen3-Omni y esta especializado en identificacion de idioma y transcripcion, cubriendo 30 idiomas y 22 dialectos del chino. Mantiene robustez frente a audio con ruido, voz cantada y canciones con musica de fondo, lo que lo diferencia de los ASR clasicos entrenados solo con habla limpia.

Este repositorio no contiene los pesos originales en formato generico, sino artefactos compilados y perfilados mediante Qualcomm AI Hub Workbench para su despliegue en dispositivos Snapdragon y Dragonwing. La distribucion se realiza principalmente en cuantizacion q8_0 para el runtime GENIEX_LLAMACPP, con una variante GGUF accesible desde el repositorio de Unsloth. El modelo tiene 1.700 millones de parametros y esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en la combinacion de un ASR multilingue de tamano contenido con un pipeline de despliegue on-device ya validado sobre SoC moviles y de portatil. Para desarrolladores que necesitan transcripcion local, sin envio de audio a la nube, este repositorio ofrece artefactos listos para ejecutar junto con mediciones de rendimiento por chipset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM generativo basado en la comprension de audio de Qwen3-Omni (no se detalla la topologia interna exacta) |
| Parametros totales | 1.700 millones (segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 512 y 4096 tokens reportados en las mediciones de rendimiento |
| Tipos de cuantizacion | q8_0 (runtime GENIEX_LLAMACPP); exportacion personalizable mediante Qualcomm AI Hub Models |
| Idiomas soportados | 30 idiomas y 22 dialectos del chino (segun la model card); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3-ASR-1.7B-Q8_0.gguf) y artefactos pre-exportados para Qualcomm AI Hub; pesos PyTorch en el repositorio original Qwen/Qwen3-ASR-1.7B |

## Arquitectura y entrenamiento

El modelo se describe como un LLM generativo orientado a reconocimiento de voz, construido sobre la rama de comprension de audio de Qwen3-Omni. La model card no especifica la topologia concreta del transformer, el numero de capas, la dimension oculta ni el mecanismo de atencion empleado, por lo que estos detalles deben considerarse no disponibles en la informacion proporcionada. El pipeline declarado es `automatic-speech-recognition`, con salida de transcripcion y identificacion de idioma.

No se documentan en este repositorio el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La unica informacion cualitativa sobre el entrenamiento es la afirmacion de robustez frente a audio ruidoso, canto y musica de fondo, lo que sugiere datos de entrenamiento que incluyen condiciones acusticas adversas. Cualquier dato adicional sobre el proceso de entrenamiento debe consultarse en el repositorio original del equipo Qwen.

## Capacidades

- Transcripcion de voz a texto con salida de texto plano.
- Identificacion automatica de idioma (language identification) integrada en el pipeline ASR.
- Cobertura de 30 idiomas y 22 dialectos del chino.
- Robustez declarada frente a audio con ruido, voz cantada y canciones con musica de fondo.
- Procesamiento de contexto de audio configurable: las mediciones se realizan con ventanas de 512 y 4096 tokens.
- Capacidad de exportacion con pesos personalizados, formas de entrada propias y configuraciones de dispositivo objetivo mediante la libreria Qualcomm AI Hub Models.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento explicito.

## Casos de uso

- Transcripcion on-device en aplicaciones moviles: el modelo se ejecuta con GENIEX_LLAMACPP en Snapdragon 8 Elite y 8 Elite Gen 5, permitiendo dictado y notas de voz sin enviar audio a la nube, con tasas de 24-31 tokens/s con contexto de 512.
- Subtitulado y transcripcion de reuniones en portatiles Snapdragon X Elite y X2 Elite: con contexto de 4096 tokens el rendimiento se situa entre 13 y 26 tokens/s, suficiente para transcripcion casi en tiempo real de segmentos largos.
- Procesamiento de audio musical y podcasts: la robustez declarada frente a canto y musica de fondo lo hace adecuado para transcribir contenido donde los ASR convencionales fallan por solapamiento musical.
- Identificacion de idioma en centros de llamadas multilingues: la deteccion automatica de idioma permite enrutar llamadas al agente o cola adecuada antes de la transcripcion completa.
- Despliegue en dispositivos industriales y IoT con Qualcomm Dragonwing IQ-8275 e IQ-9075: las mediciones muestran 2-24 tokens/s segun contexto, habilitando transcripcion local en equipos con conectividad limitada.
- Ajuste fino para dominios verticales: al poder exportar pesos personalizados con la libreria AI Hub Models, equipos medicos, juridicos o de soporte pueden adaptar el modelo a vocabulario especializado y recompilarlo para su hardware.
- Integracion en pipelines de accesibilidad: transcripcion local de conversaciones para personas con discapacidad auditiva en aplicaciones de escritorio ARM con Snapdragon X Elite.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks academicos (WER, MMLU, HumanEval, GSM8K) en la informacion disponible. Lo que si se publica es una tabla de rendimiento de inferencia por chipset, runtime, precision y longitud de contexto. Se reproduce un extracto representativo:

| Chipset | Runtime | Precision | Contexto | Tokens/s (rango observado) |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 for Galaxy Mobile | GENIEX_LLAMACPP | q8_0 | 512 | 29,35 - 31,21 |
| Snapdragon 8 Elite Gen 5 for Galaxy Mobile | GENIEX_LLAMACPP | q8_0 | 4096 | 10,01 - 20,51 |
| Snapdragon 8 Elite for Galaxy Mobile | GENIEX_LLAMACPP | q8_0 | 512 | 24,74 - 28,29 |
| Snapdragon 8 Elite for Galaxy Mobile | GENIEX_LLAMACPP | q8_0 | 4096 | 9,08 - 16,81 |
| Snapdragon X2 Elite | GENIEX_LLAMACPP | q8_0 | 512 | 36,10 - 47,77 |
| Snapdragon X2 Elite | GENIEX_LLAMACPP | q8_0 | 4096 | 20,32 - 25,98 |
| Snapdragon X Elite | GENIEX_LLAMACPP | q8_0 | 512 | 22,62 - 42,98 |
| Snapdragon X Elite | GENIEX_LLAMACPP | q8_0 | 4096 | 13,38 - 21,72 |
| Dragonwing IQ-8275 | GENIEX_LLAMACPP | q8_0 | 512 | 4,15 - 17,18 |
| Dragonwing IQ-8275 | GENIEX_LLAMACPP | q8_0 | 4096 | 2,26 - 10,47 |
| Dragonwing IQ-9075 | GENIEX_LLAMACPP | q8_0 | 512 | 13,11 - 23,77 |

No se han publicado resultados de benchmarks de calidad de transcripcion (WER por idioma) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para GPU; el modelo esta empaquetado para ejecucion en NPU/CPU de SoC Qualcomm, no para aceleradores CUDA.
- GPU recomendadas: no aplica en este repositorio; los artefactos estan compilados para Snapdragon 8 Elite, 8 Elite Gen 5, Snapdragon X Elite, X2 Elite, Dragonwing IQ-8275 e IQ-9075.
- Compatibilidad con GPU consumer: no disponible; la distribucion apunta a hardware Qualcomm con runtime GENIEX_LLAMACPP.
- Opciones de despliegue: GenieX con runtime GENIEX_LLAMACPP (recomendado por el autor); exportacion personalizada con la libreria Qualcomm AI Hub Models; el GGUF Q8_0 puede usarse con runtimes compatibles con llama.cpp segun la nomenclatura del artefacto.
- Latencia y throughput: medidos entre 2,26 y 47,77 tokens/s segun chipset y contexto; con contexto 512 el throughput es aproximadamente 1,5 a 2,5 veces mayor que con contexto 4096 en el mismo chipset.
- Memoria: no se especifica el consumo de RAM/NPU por configuracion en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue on-device Qualcomm |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (este repositorio) | 1.700 M | 512 / 4096 tokens (segun configuracion) | 30 idiomas + 22 dialectos chinos | Apache 2.0 | Si, artefactos pre-exportados y perfilados |
| Qwen/Qwen3-ASR-1.7B (original) | 1.700 M | no disponible | 30 idiomas + 22 dialectos chinos | Apache 2.0 | No especifico; pesos PyTorch |
| Whisper large-v3 | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |
| Whisper small | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos que permitan contrastar calidad de transcripcion con alternativas como Whisper. La comparativa se limita a parametros, contexto, licencia y disponibilidad de despliegue.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos por idioma, acento, genero o origen; deben evaluarse empiricamente antes de produccion.
- Riesgo de alucinacion inherente a modelos generativos de ASR: posibilidad de generar texto plausible no presente en el audio, especialmente con ruido extremo o silencios.
- La lista concreta de los 30 idiomas y 22 dialectos no esta disponible en este repositorio; la cobertura real por idioma debe verificarse contra el repositorio original.
- El contexto de audio medido se limita a 512 y 4096 tokens; no se documenta soporte para audios mas largos sin segmentacion.
- Los artefactos de este repositorio estan orientados a hardware Qualcomm; su uso en GPU NVIDIA o AMD requiere exportacion propia o el GGUF con llama.cpp, sin garantia de rendimiento equivalente.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del repositorio original Qwen/Qwen3-ASR-1.7B por si existen terminos adicionales de uso aceptable.
- El repositorio presenta cero descargas y cero likes en el momento de la consulta, lo que no aporta evidencia de validacion por parte de la comunidad.
- Las mediciones de rendimiento publicadas corresponden a ejecuciones concretas sobre dispositivos Qualcomm; no deben extrapolarse a otros hardware sin perfilado propio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qualcomm/Qwen3-ASR-1.7B
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_asr_1_7b
- Codigo de exportacion en GitHub: https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/qwen3_asr_1_7b
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Guia de inicio de GenieX: https://geniex.aihub.qualcomm.com/en/get-started/quickstart
- GGUF Q8_0 (Unsloth): https://huggingface.co/unslothai/Qwen3-ASR-1.7B-GGUF/resolve/main/Qwen3-ASR-1.7B-Q8_0.gguf
- Referencia arXiv citada en los tags: arxiv:2601.21337 (no verificada en la informacion disponible)
