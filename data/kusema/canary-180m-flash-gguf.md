# kusema/canary-180m-flash-gguf

## Resumen

Canary 180M Flash es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por NVIDIA. Con 189 millones de parámetros, se posiciona como la variante más ligera de la familia Canary, pensada para transcripción de audio con requisitos de cómputo muy bajos. El repositorio analizado no es el modelo original, sino un espejo en formato GGUF publicado por el autor `kusema` para su aplicación de dictado en Windows llamada Kusema.

Este espejo concreto contiene un único fichero cuantizado en Q8_0 (218 MB) generado por el proyecto `transcribe.cpp` y verificado mediante SHA-256 por la aplicación que lo consume. Se trata, por tanto, de una distribución de conveniencia para un runtime específico, no de una nueva versión del modelo ni de un reentrenamiento.

Su relevancia práctica radica en que permite ejecutar un modelo ASR de NVIDIA en local, sin GPU dedicada, dentro de una aplicación de escritorio, gracias a la cuantización a 8 bits y al formato GGUF. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es escasa en este repositorio, que remite explícitamente a la model card original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR de la familia Canary de NVIDIA; detalles en la model card original) |
| Parametros totales | 189.083.776 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | no disponible en este repositorio |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en este repositorio. El modelo base es `nvidia/canary-180m-flash`, un sistema de reconocimiento automático del habla de la familia Canary de NVIDIA, pero la model card de este espejo no describe capas, tipo de encoder/decoder ni mecanismos de atención. Para esos detalles hay que consultar la model card original de NVIDIA.

Tampoco se documentan en este repositorio los datos de entrenamiento (número de horas de audio, composición del corpus, idiomas, uso de técnicas de alineación o ajuste fino). Lo único verificable es el proceso de conversión: el modelo original fue convertido a GGUF y cuantizado a Q8_0 por el proyecto `transcribe.cpp` en la revisión `46b86384d1db59108d6e060a0fc00924cb58499f` del repositorio `handy-computer/canary-180m-flash-gguf`, y este repositorio aloja una copia sin modificaciones adicionales.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto), según el `pipeline_tag` del repositorio.
- Ejecución local en CPU mediante el runtime `transcribe.cpp`, orientada a aplicaciones de dictado en escritorio.
- Modelo ligero (189 M de parámetros) apto para dispositivos con recursos limitados.
- Formato GGUF cuantizado a 8 bits, pensado para inferencia eficiente en memoria.
- No se documentan en este repositorio capacidades de traducción, diarización, timestamps, tool calling ni agentes.
- No se documenta soporte multilingüe específico en este repositorio.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: es el caso de uso para el que se publicó este espejo, ya que la aplicación Kusema descarga exactamente este fichero Q8_0 y verifica su SHA-256 tras la descarga.
- Transcripción local sin conexión: al ejecutarse con `transcribe.cpp` sobre CPU, permite transcribir audio sin enviar datos a servicios en la nube, útil en entornos con requisitos de privacidad.
- Integración en herramientas de productividad para Windows: el tamaño reducido (218 MB) y la cuantización a 8 bits facilitan empaquetarlo como dependencia de una aplicación de escritorio.
- Prototipado rápido de pipelines ASR: sirve como baseline ligero para comparar calidad de transcripción antes de adoptar modelos mayores de la familia Canary.
- Subtitulado y notas de reuniones en local: adecuado cuando se prioriza baja huella de memoria sobre máxima precisión, aunque la calidad concreta no está documentada en este repositorio.
- Despliegue en hardware modesto: al no requerir GPU dedicada según el runtime objetivo, encaja en equipos de oficina o portátiles para transcripción de audio de duración moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este espejo remite a la página del modelo original de NVIDIA para benchmarks, usos previstos y limitaciones.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso de uso principal; el runtime `transcribe.cpp` está pensado para ejecución en CPU. El fichero GGUF ocupa 218.447.648 bytes (aproximadamente 208 MiB).
- GPU recomendadas: no disponibles; el repositorio no documenta despliegue en GPU.
- GPU de consumo: no se documenta compatibilidad; el diseño del espejo apunta a CPU.
- Opciones de despliegue: `transcribe.cpp` (runtime oficial de este fichero). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kusema/canary-180m-flash-gguf | 189 M | no disponible | GGUF Q8_0 | CC-BY-4.0 | Espejo de un unico fichero |
| nvidia/canary-180m-flash | 189 M | no disponible | no disponible en este repositorio | CC-BY-4.0 | Modelo original en HuggingFace |
| handy-computer/canary-180m-flash-gguf | 189 M | no disponible | GGUF | CC-BY-4.0 | Repositorio de conversion original |

La comparación con alternativas de otros autores (por ejemplo, modelos ASR ligeros de otras familias) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio es un espejo, no el modelo original: los autores de Kusema no entrenaron el modelo ni están afiliados a NVIDIA; para usos distintos del dictado conviene acudir a la fuente original.
- Solo se publica un fichero (Q8_0); no hay variantes Q4, Q5 ni FP16 en este repositorio.
- No se documentan idiomas soportados, por lo que no puede asumirse cobertura multilingüe sin consultar la model card de NVIDIA.
- No se documentan sesgos, tasas de alucinación ni métricas de error (WER) en este repositorio.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es obligatorio citar a NVIDIA y respetar los términos de la licencia original.
- El runtime `transcribe.cpp` es específico y distinto de llama.cpp; no puede asumirse compatibilidad con otras herramientas GGUF.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria de este espejo concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kusema/canary-180m-flash-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/canary-180m-flash
- Repositorio de conversion GGUF: https://huggingface.co/handy-computer/canary-180m-flash-gguf
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Aplicacion Kusema: https://github.com/neulinc/kusema
