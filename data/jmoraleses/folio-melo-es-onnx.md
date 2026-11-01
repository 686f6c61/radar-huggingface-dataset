# jmoraleses/folio-melo-es-onnx

## Resumen

Folio Melo (es, ONNX) es una exportación a formato ONNX del modelo de síntesis de voz MeloTTS, desarrollado originalmente por MyShell.ai bajo licencia MIT. La conversión la ha realizado el usuario jmoraleses para su uso en Folio, una aplicación iOS, empleando ONNX Runtime como motor de inferencia en dispositivo. El modelo toma como base el hablante base de OpenVoice y está orientado a la generación de audio en castellano.

El repositorio contiene únicamente los pesos exportados a ONNX junto con un archivo `config.json` que define los símbolos fonéticos, el desplazamiento tonal y el identificador de idioma. No se trata de un modelo de lenguaje, sino de un sistema text-to-speech (TTS) que transforma secuencias de fonemas en audio a 44,1 kHz. Su relevancia radica en que permite síntesis de voz local, sin dependencia de servicios en la nube, en un paquete de apenas 0,1 GB.

La información publicada es muy limitada: no se detallan parámetros, arquitectura interna ni datos de entrenamiento. La ficha se elabora a partir de los metadatos del repositorio y de la model card, indicando explícitamente los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MeloTTS (text-to-speech), exportado a ONNX; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | castellano (es), segun el nombre y la model card |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX de MeloTTS, el sistema TTS de MyShell.ai publicado bajo licencia MIT, usando el hablante base de OpenVoice. La inferencia se realiza con ONNX Runtime y la interfaz del grafo expone las entradas `x`, `x_lengths`, `tones`, `lang`, `sid`, `noise_scale` y `length_scale`, y las salidas `y` (audio a 44,1 kHz) y `w_ceil` (frames por símbolo). El archivo `config.json` contiene los símbolos fonéticos, el desplazamiento tonal y el identificador de idioma necesarios para el preprocesado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de la propia exportación a ONNX para inferencia en dispositivo. La fuente de la exportación es el commit `90d5f2a` del repositorio jmoraleses/Folio-iOS.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de fonemas en castellano.
- Generación de audio a 44,1 kHz.
- Control de la duración del habla mediante el parámetro `length_scale`.
- Control de la variabilidad del habla mediante `noise_scale`.
- Selección de hablante mediante el parámetro `sid` (hablante base de OpenVoice).
- Control tonal mediante la entrada `tones`.
- Inferencia en dispositivo con ONNX Runtime, sin necesidad de conexión a red.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio de entrada.

## Casos de uso

- Lectura por voz en aplicaciones iOS: integración en la app Folio para narrar contenido de texto con síntesis local, aprovechando la exportación ONNX y el tamaño reducido del paquete (0,1 GB).
- Asistentes de accesibilidad: conversión de texto a voz en dispositivos sin conectividad, útil para usuarios con discapacidad visual que requieren lectura de contenido offline.
- Audiolibros y contenido narrado en castellano: generación de pistas de audio a partir de texto con control de velocidad mediante `length_scale`.
- Avisos y notificaciones habladas: síntesis de mensajes cortos en aplicaciones móviles con latencia baja al ejecutarse en el propio dispositivo.
- Prototipado de interfaces conversacionales: pruebas de flujos de voz en castellano sin coste de API ni dependencia de servicios externos.
- Sistemas de navegación o conducción: instrucciones de voz generadas localmente, donde la inferencia en dispositivo evita problemas de red.
- Investigación en TTS: base para experimentos de ajuste tonal o de velocidad gracias a los parámetros expuestos (`tones`, `noise_scale`, `length_scale`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo ligero apto para CPU.
- GPU recomendadas: no disponible; al ejecutarse con ONNX Runtime puede correr en CPU y en GPUs consumer.
- Compatibilidad con GPU consumer: probable por el tamaño del paquete, aunque no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (motor indicado por el autor); otras opciones no documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Folio Melo (es, ONNX) | TTS (MeloTTS/OpenVoice) | Castellano | MIT | ONNX | Exportación para inferencia en dispositivo |
| MeloTTS (original) | TTS | Varios | MIT | PyTorch | Modelo base del que deriva esta exportación |
| OpenVoice | TTS / clonación de voz | Varios | MIT | PyTorch | Proporciona el hablante base utilizado |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Información muy escasa: no se publican parámetros, arquitectura detallada ni datos de entrenamiento.
- Solo se documenta soporte para castellano; no se confirman otros idiomas.
- Al ser una exportación ONNX, puede presentar diferencias de comportamiento frente al MeloTTS original en PyTorch.
- No se documentan sesgos conocidos ni tasas de alucinación (concepto menos aplicable a TTS, pero relevante en la fidelidad de la pronunciación).
- La licencia MIT permite uso comercial, pero conviene verificar las licencias de MeloTTS y OpenVoice en los repositorios originales.
- El repositorio tiene muy pocas descargas (35) y ningún like, lo que indica escasa validación por parte de la comunidad.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jmoraleses/folio-melo-es-onnx
- MeloTTS (MyShell.ai): https://github.com/myshell-ai/MeloTTS
- OpenVoice: no disponible en la información proporcionada
- Repositorio fuente de la exportación (Folio-iOS): https://github.com/jmoraleses/Folio-iOS (referenciado en la model card)
