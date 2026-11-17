# ai-coustics/tyto

## Resumen

Tyto es un modelo de análisis de calidad y riesgo de audio desarrollado por ai-coustics. No es un modelo generativo: su función es predecir si la señal de audio que llega a un agente de voz (STT, VAD, turn-taking o speech-to-speech) provocará fallos downstream, devolviendo una puntuación de riesgo principal (`risk_score`) junto a seis dimensiones diagnósticas (ruido, reverberación, sonoridad, habla interferente, pérdida de paquetes y degradación de códec). El modelo se ejecuta a través del SDK propietario `aic-sdk`, disponible en Python, Rust, C/C++, Node.js y WebAssembly, y está orientado a entornos de producción de voice AI en tiempo real o en análisis post-llamada.

La relevancia de Tyto reside en su enfoque de observabilidad: en lugar de limitarse a limpiar audio, cuantifica el riesgo de fallo antes de que este ocurra, lo que permite monitorizar pipelines de agentes de voz, diagnosticar causas concretas de degradación y anticipar problemas de reconocimiento o de detección de actividad vocal. El modelo publicado bajo el identificador `tyto-1.1-l-16khz` opera sobre audio mono a 16 kHz y procesa ventanas de 5 segundos, con soporte de streaming mediante un par `Collector`/`Analyzer` que separa el buffering en el hilo de audio del cómputo en un hilo secundario.

La información pública disponible es limitada: la model card no detalla arquitectura, número de parámetros, volumen de entrenamiento ni resultados de benchmarks. La ficha se limita, por tanto, a los datos verificables de la model card, del SDK y de los recursos enlazados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | ventanas de análisis de 5 segundos por resultado; streaming por bloques de `config.block_size` muestras |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo agnóstico al idioma en la información publicada) |
| Licencia | ai-coustics-model-license (propietaria, `license: other`) |
| Formato de pesos | no disponible; distribución mediante `aic.Model.download` del SDK `aic-sdk` |
| Frecuencia de muestreo | 16 kHz, mono, float32 |
| Salidas | `risk_score` + 6 dimensiones diagnósticas (0.0–1.0) |
| Modo de ejecución | batch (`FileAnalyzer`) y streaming (`Collector`/`Analyzer`) |
| Requisito de acceso | SDK key (prueba gratuita de 30 días en developers.ai-coustics.com) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de red, capas, mecanismo de atención o componentes de procesamiento de señal) en la model card ni en los recursos enlazados. Tampoco se especifican el volumen de datos de entrenamiento, la composición del dataset, el uso de técnicas de alineación (RLHF/DPO) ni innovaciones técnicas concretas. Lo único verificable es el contrato de inferencia: entrada de audio mono a 16 kHz en float32, salida por ventanas de 5 segundos con una puntuación de riesgo agregada y seis indicadores desglosados que cubren ruido ambiental, distancia y reverberación del hablante, sonoridad, habla interferente de otros hablantes, pérdida de paquetes (dropouts, jitter, sobrecarga de CPU) y artefactos de códecs con pérdida o banda estrecha.

La separación entre `Collector` (buffering real-time safe en el hilo de audio) y `Analyzer` (cómputo en un hilo separado) sugiere que el coste computacional del análisis es significativo y que el diseño está pensado para integrarse en pipelines de voz con restricciones de latencia estrictas, como agentes conversacionales en vivo.

## Capacidades

- Predicción de riesgo de fallo downstream: estima la probabilidad de que STT, VAD, turn-taking o modelos speech-to-speech fallen con la señal analizada.
- Diagnóstico desglosado en seis dimensiones: `noise`, `speaker_reverb`, `speaker_loudness`, `interfering_speech`, `packet_loss` y `codec_degradation`.
- Análisis por ventanas de 5 segundos con un `AnalysisResult` por ventana en modo fichero.
- Análisis en streaming en tiempo real mediante par `Collector`/`Analyzer` con configuración `ProcessorConfig.optimal`.
- Detección de problemas de red y transporte en la señal (pérdida de paquetes, frame erasure, jitter, discontinuidades por sobrecarga de CPU).
- Detección de degradación por códecs con pérdida o de banda estrecha.
- Detección de habla interferente de hablantes adicionales.
- Integración con frameworks de agentes de voz: quickstarts para LiveKit y Pipecat.
- SDK multi-lenguaje: Python, Rust, C/C++, Node.js y WebAssembly.
- No se documentan capacidades de generación de texto, visión, tool calling ni razonamiento multi-paso; el modelo es exclusivamente de análisis de audio.

## Casos de uso

- Monitorización de agentes de voz en producción: Tyto puntúa continuamente el audio entrante y permite alertar cuando el `risk_score` supera un umbral, identificando si el origen es ruido ambiental, reverberación o pérdida de paquetes antes de que el agente falle en la conversación.
- Diagnóstico post-llamada: análisis de grabaciones completas con `FileAnalyzer` para atribuir causas concretas de fallos de transcripción o de detección de turno, comparando ventanas de 5 segundos a lo largo de la llamada.
- Observabilidad de pipelines STT: integración del `risk_score` como métrica de calidad en dashboards de operaciones, correlacionando caídas de precisión del STT con dimensiones específicas como `codec_degradation` o `packet_loss`.
- Control de calidad de telefonía y VoIP: detección de degradación por códecs de banda estrecha y pérdida de paquetes en entornos de call center, con umbrales configurables por dimensión.
- Enrutamiento adaptativo en agentes de voz: usar la puntuación de riesgo para decidir cuándo pedir al usuario que repita, cuándo conmutar a un modelo STT más robusto o cuándo activar supresión de ruido antes del reconocimiento.
- Validación de despliegues de voice AI: ejecutar Tyto sobre conjuntos de audio de referencia antes de desplegar un agente, para establecer una línea base de calidad y detectar regresiones tras cambios de infraestructura o de red.
- Integración en frameworks de agentes (LiveKit, Pipecat): incorporar el análisis como etapa del pipeline de voz, con el `Collector` alimentado desde el hilo de audio y el `Analyzer` produciendo lecturas periódicas en un hilo secundario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, correlación con fallos downstream, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible; la model card no especifica tamaño de pesos ni requisitos de memoria.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia exclusivamente mediante el SDK `aic-sdk` (Python, Rust, C/C++, Node.js, WebAssembly); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la documentación indica únicamente que el análisis es "computacionalmente costoso" y recomienda ejecutarlo en un hilo separado del hilo de audio.
- Requisito operativo: SDK key válida (prueba gratuita de 30 días, sin tarjeta de crédito).

## Comparativa con modelos similares

| Modelo | Tipo | Función | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tyto (ai-coustics) | Análisis de audio | Predicción de riesgo y diagnóstico de calidad para voice AI | ai-coustics-model-license (propietaria) | SDK `aic-sdk` con SDK key |
| Quail Voice Focus (ai-coustics) | Mejora de voz | Aislamiento del hablante principal para STT y agentes | ai-coustics-model-license | SDK `aic-sdk` |
| Quail Multi Speaker (ai-coustics) | Mejora de voz | Realce multi-hablante para STT | ai-coustics-model-license | SDK `aic-sdk` |
| Rook Multi Speaker (ai-coustics) | Mejora de voz | Realce para escucha humana | ai-coustics-model-license | SDK `aic-sdk` |
| VAD Multi Speaker / VAD Voice Focus (ai-coustics) | Detección de actividad vocal | VAD robusto al ruido / VAD del hablante principal | ai-coustics-model-license | SDK `aic-sdk` |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de otros proveedores; la comparativa se limita a la familia de modelos de ai-coustics, que cubren tareas complementarias (mejora, VAD) dentro del mismo ecosistema de SDK.

## Limitaciones y advertencias

- Licencia propietaria: `ai-coustics-model-license` con enlace a https://ai-coustics.com/legal/model-license; el uso comercial requiere revisión de los términos y, para despliegues empresariales, contacto con ai-coustics.
- Dependencia obligatoria del SDK `aic-sdk` y de una SDK key; no es un modelo utilizable de forma autónoma fuera del ecosistema del proveedor.
- Arquitectura, tamaño y datos de entrenamiento no publicados, lo que impide auditar el modelo o estimar requisitos de recursos a priori.
- No hay benchmarks publicados: la fiabilidad de `risk_score` y de las dimensiones diagnósticas no está cuantificada públicamente.
- Granularidad fija de 5 segundos por ventana en modo fichero; eventos más cortos pueden quedar agregados dentro de la ventana.
- Entrada limitada a audio mono a 16 kHz; no se documenta soporte de otros formatos o frecuencias.
- El análisis es computacionalmente costoso según la propia documentación, por lo que en streaming requiere gestión explícita de hilos.
- Riesgo de falsos positivos/negativos en la predicción de fallos downstream no cuantificado; conviene calibrar umbrales por dominio y tipo de agente.
- Idiomas soportados no declarados; el comportamiento en lenguas distintas del inglés no está documentado.
- No se documentan sesgos; al tratarse de un modelo acústico, pueden existir diferencias de rendimiento según condiciones de captura, tipo de micrófono y acento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-coustics/tyto
- Documentación de Tyto: https://docs.ai-coustics.com/models/audio-insight/tyto
- Quickstart del SDK: https://docs.ai-coustics.com/models/get-started/sdk-quickstart
- Documentación general: https://docs.ai-coustics.com
- Quickstart LiveKit: https://docs.ai-coustics.com/models/get-started/livekit-quickstart
- Ejemplo Pipecat: https://github.com/pipecat-ai/pipecat/blob/main/examples/voice/voice-aicoustics.py
- Versiones y checksums de modelos: https://artifacts.ai-coustics.io
- SDK Python en PyPI: https://pypi.org/project/aic-sdk/
- SDK key gratuita: https://developers.ai-coustics.com
- Licencia del modelo: https://ai-coustics.com/legal/model-license
- Licenciamiento empresarial: https://ai-coustics.com/
- Modelos relacionados: https://huggingface.co/ai-coustics/quail-voice-focus, https://huggingface.co/ai-coustics/quail-multi-speaker, https://huggingface.co/ai-coustics/rook-multi-speaker, https://huggingface.co/ai-coustics/vad-multi-speaker, https://huggingface.co/ai-coustics/vad-voice-focus
