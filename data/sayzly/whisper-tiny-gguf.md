# sayzly/whisper-tiny-gguf

## Resumen

`sayzly/whisper-tiny-gguf` es una conversión a formato GGUF del modelo `openai/whisper-tiny`, publicado por el usuario sayzly. Se trata, por tanto, de una redistribución cuantizada del conocido modelo de reconocimiento automático del habla (ASR) de OpenAI, no de un modelo nuevo entrenado desde cero. El repositorio contiene una única variante en cuantización Q8_0 (`whisper-tiny-Q8_0.gguf`), que es la que el proyecto Sayzly descarga por defecto para esta talla de Whisper.

El modelo subyacente, Whisper Tiny, es un transformer encoder-decoder con unos 37,7 millones de parámetros, diseñado para transcripción de audio a texto multilingüe y traducción al inglés. Su interés práctico radica en su huella mínima: al estar cuantizado en 8 bits y empaquetado en GGUF, puede ejecutarse en entornos con recursos muy limitados, incluidos dispositivos de borde, CPUs modestas o incluso navegadores, mediante runtimes compatibles con GGUF.

La relevancia de esta ficha es acotada: el repositorio no aporta información técnica adicional sobre el proceso de conversión, el dataset de calibración ni los idiomas efectivamente soportados. Es un artefacto de distribución más que una contribución de modelado, y así debe evaluarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, heredada de openai/whisper-tiny) |
| Parametros totales | 37.777.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s; no se documenta en el repo) |
| Tipos de cuantizacion | Q8_0 (única variante publicada en el repo) |
| Idiomas soportados | no disponible (el repo no los declara; el modelo base es multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Tiny: un encoder que procesa espectrogramas mel logarítmicos de audio y un decoder autorregresivo que genera tokens de texto, con atención encoder-decoder entre ambos. El modelo original fue entrenado por OpenAI sobre una gran colección de audio supervisado multilingüe con tareas de transcripción, traducción al inglés y detección de idioma, empleando tokens especiales de tarea e idioma. No se dispone en esta ficha de los detalles exactos de composición del dataset ni del número de horas de audio empleadas.

Respecto a esta conversión concreta, no hay información en el repositorio sobre el procedimiento de cuantización, la herramienta utilizada (por ejemplo, `whisper.cpp` o similares), el dataset de calibración ni posibles degradaciones introducidas por el paso a 8 bits. El autor se limita a indicar que se trata del archivo Q8_0 que descarga su producto, y remite al modelo original para autoría y licencia.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante la pipeline `automatic-speech-recognition`.
- Traducción de audio a inglés, capacidad heredada del modelo Whisper original (no verificada en esta conversión).
- Detección de idioma, también heredada del modelo base (no verificada en esta conversión).
- Procesamiento de audio en ventanas de hasta 30 segundos por pasada, según el diseño estándar de Whisper.
- Ejecución en runtimes compatibles con GGUF orientados a inferencia local y de bajo consumo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción local en dispositivos de borde: por su tamaño (37,7 M de parámetros) y cuantización Q8_0, puede ejecutarse en Raspberry Pi, móviles o navegadores mediante runtimes GGUF, transcribiendo notas de voz o comandos cortos sin conexión.
- Subtitulado rápido de clips cortos: adecuado para generar subtítulos preliminares de audios de menos de 30 segundos por segmento en pipelines de preproducción, donde la velocidad prima sobre la precisión máxima.
- Prototipado de asistentes de voz: sirve como componente ASR de bajo coste en pruebas de concepto de asistentes conversacionales antes de escalar a modelos mayores.
- Indexación de archivos de audio: permite transcribir grandes volúmenes de grabaciones cortas en paralelo en CPU para habilitar búsqueda por texto sobre el contenido hablado.
- Aplicaciones de accesibilidad offline: transcripción en tiempo casi real de conversaciones breves en entornos sin conectividad, integrada en aplicaciones de escritorio.
- Filtrado y enrutado por voz: detección de palabras clave o comandos en flujos de automatización doméstica o industrial donde el coste computacional debe ser mínimo.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la pérdida de calidad de Q8_0 frente al modelo original en tareas ASR concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en Q8_0, dado el tamaño del modelo (37,7 M de parámetros en 8 bits) más las activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo no requiere GPU dedicada y está pensado para ejecución en CPU.
- Cabe holgadamente en GPU de consumo (GTX 1050, RTX 3050, RTX 4090) y en hardware integrado; también en dispositivos móviles y de borde.
- Opciones de despliegue: runtimes compatibles con GGUF para Whisper, como `whisper.cpp`; no se documenta compatibilidad con vLLM, TGI ni Ollama en el repositorio.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del runtime empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayzly/whisper-tiny-gguf | 37,7 M | ventanas de 30 s (heredado) | GGUF Q8_0 | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s | safetensors/PyTorch | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M aprox. | ventanas de 30 s | safetensors/PyTorch | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M aprox. | ventanas de 30 s | safetensors/PyTorch | apache-2.0 | Hugging Face |

La comparación relevante es frente al modelo original: esta conversión ofrece la misma arquitectura y licencia, con menor huella de memoria a costa de una posible pérdida de precisión no documentada. Los modelos de mayor talla de la familia Whisper ofrecen mejor calidad ASR a cambio de más parámetros y recursos.

## Limitaciones y advertencias

- El repositorio no documenta el proceso de cuantización ni evalúa la degradación de precisión respecto al modelo original; la calidad en Q8_0 debe validarse empíricamente.
- Whisper Tiny es el modelo más pequeño de su familia y presenta una precisión notablemente inferior a las variantes base, small, medium y large, especialmente en audio con ruido, acentos marcados o vocabulario técnico.
- Riesgo de alucinación en pasajes de silencio, ruido o audio musical, comportamiento conocido en la familia Whisper; debe aplicarse filtrado posterior en producción.
- El repositorio no declara los idiomas soportados; la cobertura multilingüe depende del modelo base y no está verificada en esta conversión.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad recae en el integrador.
- Repositorio con cero descargas y sin mantenimiento aparente en el momento de la consulta; conviene verificar la integridad del archivo GGUF antes de desplegarlo.
- La fecha de creación del repositorio (2026) y la ausencia de documentación adicional aconsejan tratar el artefacto con cautela en entornos críticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/whisper-tiny-gguf
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Artículo de Whisper (Radford et al.): https://arxiv.org/abs/2212.04356
- Implementación GGUF para Whisper (whisper.cpp): https://github.com/ggerganov/whisper.cpp
