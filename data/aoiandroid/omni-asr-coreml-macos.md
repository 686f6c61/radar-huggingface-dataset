# aoiandroid/omni-asr-coreml-macos

## Resumen

El repositorio `aoiandroid/omni-asr-coreml-macos` contiene un paquete CoreML compilado para macOS del sistema Omni-ASR, un modelo de reconocimiento automático de voz (ASR) multilingüe desarrollado por Meta. El paquete está optimizado para ejecutarse íntegramente en el dispositivo mediante la Neural Engine (ANE) de Apple, sin dependencia de servicios en la nube. Se compone de dos partes: un módulo CTC (basado en la arquitectura wav2vec2) y un módulo LLM de 300 millones o 1.000 millones de parámetros, compilado con `coremlcompiler` para macOS. El repositorio incluye los árboles `.mlmodelc` compilados y un `vocabulary.json` compartido, y está diseñado para su uso en la aplicación TranslateBlue.

La relevancia de este modelo radica en la posibilidad de ejecutar ASR multilingüe en tiempo real en hardware Apple con privacidad total, sin necesidad de conexión a internet. Su licencia MIT facilita su integración en proyectos comerciales, aunque el modelo CTC subyacente (alojado en `aoiandroid/omni-asr-coreml-fp16`) tiene licencia CC-BY-NC-4.0, lo que limita su uso comercial. El tamaño del repositorio es de 9 GB, lo que refleja la inclusión de los pesos compilados para la ANE.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (wav2vec2) + LLM (300M o 1B) compilado a CoreML |
| Parametros totales | No disponible (CTC) + 300M o 1B (LLM) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (ASR no usa ventana de contexto en el sentido de LLM) |
| Tipos de cuantizacion | FP16 e INT8 (según repositorios fuente) |
| Idiomas soportados | Multilingüe (idiomas específicos no documentados) |
| Licencia | MIT (model card) |
| Formato de pesos | `.mlmodelc` (CoreML compilado) |

## Arquitectura y entrenamiento

El modelo se compone de dos módulos diferenciados:

- **Módulo CTC**: basado en la arquitectura wav2vec2 (según el tag `wav2vec2` del repositorio fp16), con una cabeza de clasificación CTC para el reconocimiento de voz. Este módulo se compila a CoreML en formato `.mlmodelc` a partir de los árboles `.mlpackage` recompilados.
- **Módulo LLM**: un modelo de lenguaje de 300M o 1B parámetros, compilado desde `.mlpackage` con `coremlcompiler` para macOS. Su función es probablemente la corrección y el postprocesado del texto generado por el CTC, o la integración con funcionalidades de traducción (como se infiere del tag `translateblue`).

Los detalles de entrenamiento (número de tokens, composición del dataset, técnicas de RLHF) no se han publicado en la información disponible. El proceso de compilación para CoreML es una optimización para el hardware de Apple, con caché de especialización ANE que se genera localmente en cada dispositivo.

## Capacidades

- Reconocimiento automático de voz (ASR) multilingüe en tiempo real.
- Ejecución íntegramente en el dispositivo (on-device) usando la Neural Engine de Apple.
- Compatible con macOS 14+ y arquitecturas Apple Silicon.
- Integración prevista para la aplicación TranslateBlue (traducción de voz).
- Posibilidad de usar dos tamaños de LLM (300M o 1B) para ajustar la precisión y el rendimiento.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, dado que se trata de un sistema ASR, no de un LLM general.

## Casos de uso

- **Transcripción de reuniones en tiempo real**: el modelo puede transcribir conversaciones multilingües en macOS sin enviar audio a la nube, manteniendo la confidencialidad de los datos corporativos. Su ejecución en ANE permite una latencia baja para uso en aplicaciones de videollamada o grabación.
- **Dictado de notas en aplicaciones de productividad**: integrado como teclado de voz o plugin en editores de texto, ofrece reconocimiento de voz multilingüe sin necesidad de conexión, ideal para profesionales que trabajan en entornos con conectividad limitada.
- **Subtitulación automática de vídeo**: aplicaciones de edición de vídeo pueden generar subtítulos en tiempo real para clips locales, aprovechando la baja latencia del modelo en macOS.
- **Asistente de voz para accesibilidad**: usuarios con discapacidad motriz pueden controlar el ordenador mediante comandos de voz personalizados, ya que el modelo puede adaptarse a vocabulario específico con el módulo LLM.
- **Análisis de llamadas de soporte**: empresas pueden transcribir llamadas de atención al cliente para análisis de calidad sin violar la privacidad del cliente, al procesarse todo localmente.
- **Traducción de voz a texto en contextos académicos**: para investigadores que necesitan transcribir entrevistas o conferencias multilingües, el modelo ofrece una alternativa gratuita y sin dependencias de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas de WER (Word Error Rate), ni comparaciones con otros modelos ASR. El rendimiento práctico depende del hardware de Apple Silicon y de la configuración de cuantización (FP16 vs INT8). No se documentan latencias ni throughput específicos.

## Requisitos de hardware

- **Plataforma**: macOS 14+ con Apple Silicon (M1 o superior) para usar la ANE. También funciona en macOS con CPU, pero el rendimiento será menor.
- **VRAM**: no es un modelo de GPU tradicional; la memoria se usa en la ANE, no en la VRAM de la GPU. El tamaño total de los modelos es de aproximadamente 9 GB (incluye ambos módulos), pero la memoria dinámica necesaria depende del modelo LLM elegido (300M o 1B).
- **GPU**: no se requiere GPU; se ejecuta en la Neural Engine del chip Apple Silicon. En Macs con Intel, se ejecuta en CPU.
- **Despliegue**: se integra mediante un Swift Package (OmniASRKit) o directamente con CoreML. No se menciona compatibilidad con vLLM, Ollama ni otros frameworks de servidor.
- **Latencia y throughput**: no documentados. Se espera que sea adecuado para tiempo real en dispositivos modernos, pero depende del modelo LLM y del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos similares. Se puede comparar conceptualmente con otros sistemas ASR multilingües como:

- **Whisper (OpenAI)**: también ofrece ASR multilingüe, pero requiere GPU o CPU potente y suele ejecutarse en servidores. Omni-ASR CoreML se centra en el despliegue en dispositivos Apple con ANE.
- **Wav2Vec2 (Meta)**: base del módulo CTC, pero sin el módulo LLM adicional. Este repositorio añade el LLM para mejorar la precisión, pero no se publican métricas comparativas.

No se proporcionan datos numéricos de rendimiento comparativo.

## Limitaciones y advertencias

- **Licencia**: aunque el repositorio tiene licencia MIT, el modelo CTC fp16 (fuente) tiene licencia CC-BY-NC-4.0, lo que prohíbe el uso comercial del componente CTC. Es necesario verificar los términos de cada componente antes de usar el modelo en productos comerciales.
- **Dependencia de hardware**: solo funciona en Apple Silicon (macOS 14+). No es portátil a otros sistemas.
- **Idiomas**: aunque se declara "omnilingüe", no se especifica la lista exacta de idiomas soportados ni su precisión relativa.
- **Sesgos**: al ser un modelo ASR, puede presentar sesgos en el reconocimiento de acentos, dialectos o habla no estándar. No se ha documentado.
- **Riesgo de alucinación**: el módulo LLM puede introducir errores de post-procesado, generando texto incorrecto en lugar de la transcripción fiel.
- **Tamaño**: el repositorio ocupa 9 GB, lo que puede ser pesado para descargas o actualizaciones.
- **Sin garantías de producción**: no se documentan pruebas de estrés, fiabilidad ni mantenimiento del proyecto. El autor es individual, no una organización.

## Enlaces

- Repositorio principal: [https://huggingface.co/aoiandroid/omni-asr-coreml-macos](https://huggingface.co/aoiandroid/omni-asr-coreml-macos)
- Repositorio CTC FP16: [https://huggingface.co/aoiandroid/omni-asr-coreml-fp16](https://huggingface.co/aoiandroid/omni-asr-coreml-fp16)
- Repositorio CTC INT8: [https://huggingface.co/aoiandroid/omni-asr-coreml-int8](https://huggingface.co/aoiandroid/omni-asr-coreml-int8)
- GitHub OmniASRKit: [https://github.com/ChipCracker/OmniASRKit](https://github.com/ChipCracker/OmniASRKit)
- Repositorio ChipCracker/omni-asr-coreml: [https://huggingface.co/ChipCracker/omni-asr-coreml](https://huggingface.co/ChipCracker/omni-asr-coreml)
