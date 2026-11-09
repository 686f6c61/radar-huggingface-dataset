# APLUX-Agora/MeloTTS-English

## Resumen

MeloTTS-English es un paquete de recursos para síntesis de voz (text-to-speech) publicado por APLUX-Agora en Hugging Face, orientado a la ejecución sobre hardware Qualcomm con aceleración QNN. No se distribuye como un modelo en formato convencional (safetensors, GGUF o PyTorch), sino como binarios de contexto (`model.bin`) organizados por System-on-Chip dentro de la carpeta `targets/<SoC>/`, junto con un `model.json` que describe la precisión por defecto y las rutas de cada variante. El repositorio ocupa aproximadamente 0,1 GB y está pensado para desplegarse en placas reales del ecosistema AIoT.

El modelo se enmarca en la iniciativa Model Farm de Agora, un catálogo que valida y mide modelos placa a placa antes de abrirlos a ejecución. Según la model card, la única configuración verificada es la de un QCS8550 sobre la placa Rhino Pi X1 (犀牛派 X1) en precisión FP16, con un Real Time Factor (RTF) medido de 0,375. La tarea declarada es la síntesis de voz: recibe texto y devuelve audio.

La relevancia de esta ficha es acotada pero específica: no compite con modelos TTS de propósito general en servidores GPU, sino que cubre el nicho de inferencia TTS en dispositivos embebidos con NPU Qualcomm. Para un desarrollador que necesite integrar voz en un producto AIoT con un QCS8550, este paquete ofrece artefactos ya convertidos y una referencia de rendimiento medida en hardware real, algo poco habitual en modelos TTS de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (paquete de recursos convertidos para QNN; no se detalla la arquitectura interna de MeloTTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo TTS; la entrada es texto, sin ventana de contexto declarada) |
| Tipos de cuantizacion | FP16 (única precisión verificada en la model card); otras precisiones no disponibles |
| Idiomas soportados | no disponible en la información proporcionada (el nombre del modelo indica inglés) |
| Licencia | APLUX Model Farm License (`aplux-model-farm`); la licencia del modelo fuente se remite a los términos del modelo original |
| Formato de pesos | binarios de contexto QNN (`model.bin`) por SoC y precisión, más `model.json`; no se distribuyen safetensors ni GGUF |
| SoC soportado | QCS8550 (placa Rhino Pi X1) |
| Tarea | text-to-speech (entrada: texto; salida: audio) |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo MeloTTS original ni detalla el proceso de entrenamiento, los datos utilizados, el número de tokens o si hubo ajuste por RLHF/DPO. Lo que sí documenta la model card es la cadena de conversión y despliegue: los pesos se han convertido a recursos ejecutables sobre el Qualcomm Neural Network (QNN) SDK, empaquetados por SoC en `targets/<SoC>/`, con un `model.json` que declara la precisión por defecto y las rutas de cada variante. Los binarios de contexto se denominan `model.bin` y los paquetes multifichero se conservan tal como los publica Model Farm.

La innovación destacable no está en el modelo en sí, sino en el pipeline de despliegue: Agora valida cada build en placas físicas y publica métricas medidas, en este caso un RTF de 0,375 en FP16 sobre QCS8550. El repositorio incluye además `NOTICE.md` y `SHA256SUMS` para verificación de integridad, y remite al runner, el preprocesado y el postprocesado a la plataforma Agora (guía de despliegue o exportación de un flujo de trabajo que use el modelo). No se han publicado detalles sobre decodificación especulativa, atención lineal ni otras técnicas de optimización interna.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en inglés, según el nombre del modelo y la tarea declarada.
- Inferencia en dispositivo sobre NPU Qualcomm (QNN), orientada a escenarios AIoT con restricciones de consumo y cómputo.
- Ejecución verificada en la placa Rhino Pi X1 con SoC QCS8550 en FP16.
- Integración en flujos de trabajo de la plataforma Agora mediante exportación de proyectos y guía de despliegue.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documentan capacidades multilingües más allá del inglés indicado en el nombre.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: el paquete está convertido para QNN y validado en un QCS8550, por lo que puede integrarse en productos AIoT que necesiten sintetizar respuestas habladas sin depender de la nube, con un RTF de 0,375 que deja margen para otras tareas en la NPU.
- Interfaces de accesibilidad en hardware de bajo consumo: lectura de texto en voz alta en terminales industriales, paneles informativos o dispositivos de asistencia basados en placas Qualcomm.
- Kioscos y señalética interactiva: generación de avisos hablados en inglés a partir de texto dinámico en equipos desplegados en campo, donde no es viable mantener una GPU dedicada.
- Prototipado rápido en el ecosistema Agora: uso del catálogo Model Farm y de la ejecución online (sin placa física) para evaluar la calidad del TTS antes de adquirir hardware.
- Automatización de anuncios en entornos industriales: síntesis de mensajes de estado o alertas en inglés en líneas de producción instrumentadas con SoC Qualcomm.
- Evaluación comparativa de TTS en el borde: referencia de RTF medida en placa real para decidir entre este paquete y alternativas TTS desplegadas en CPU o NPU.

## Benchmarks y rendimiento

| Metrica | Valor | Hardware | Precision |
|---|---|---|---|
| Real Time Factor (RTF) | 0,375 | QCS8550 · Rhino Pi X1 | FP16 |

No se han publicado resultados de benchmarks de calidad (MOS, MCD, WER) ni comparativas con otros modelos TTS en la información disponible. El único dato de rendimiento es el RTF medido por Agora en la configuración indicada.

## Requisitos de hardware

- Hardware de referencia: SoC Qualcomm QCS8550 sobre placa Rhino Pi X1, en precisión FP16.
- VRAM: no aplica en el sentido de GPU de escritorio; el modelo se ejecuta en la NPU del SoC. No se dispone de cifras de memoria del dispositivo.
- GPU recomendadas: no disponible; el paquete está orientado a QNN y no se documenta ejecución en A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; no se indica soporte para CUDA ni para llama.cpp/Ollama.
- Opciones de despliegue: descarga de recursos por SoC con `hf download` y ejecución mediante el runner de Agora; preprocesado, postprocesado y proyecto exportable se obtienen desde la plataforma Agora (sección «部署指南»).
- Latencia y throughput: RTF de 0,375 en la configuración verificada, lo que implica que la síntesis es más rápida que tiempo real en ese hardware; no se publican cifras de latencia absoluta ni de throughput por segundo de audio.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos TTS comparables (parámetros, contexto, rendimiento o licencia) que permitan una comparación rigurosa. Como referencia cualitativa, MeloTTS-English se distingue por distribuirse como binarios QNN por SoC en lugar de pesos en safetensors o GGUF, lo que lo hace específico para el despliegue en hardware Qualcomm y no intercambiable con stacks de inferencia convencionales.

## Limitaciones y advertencias

- La licencia es la APLUX Model Farm License (`aplux-model-farm`), distinta de las licencias de código abierto habituales; es imprescindible revisar `LICENSE_MODEL_FARM.pdf` antes de cualquier uso comercial. La licencia del modelo fuente se remite a los términos del modelo original, que no se detallan.
- Solo se documenta una configuración validada (QCS8550, FP16); no hay garantía de funcionamiento en otros SoC ni en otras precisiones.
- El paquete no incluye los pesos en formatos estándar (safetensors, GGUF, PyTorch), lo que limita su uso fuera del runner de Agora y dificulta la auditoría del modelo subyacente.
- No se documentan sesgos, tasas de alucinación ni calidad de síntesis; al ser un modelo TTS, los riesgos se centran en pronunciación incorrecta, artefactos de audio y posible reproducción de sesgos presentes en los datos de entrenamiento originales, no verificables con la información disponible.
- Idiomas: el nombre indica inglés; no se confirma soporte de otros idiomas ni variantes regionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- La fecha de creación del repositorio (2026-11-09) y la escasez de documentación técnica aconsejan tratar el paquete como una previsualización de catálogo y no como un artefacto maduro de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/MeloTTS-English
- Ejecución online en Agora: https://mega.aidlux.com/models/melotts-english
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/MeloTTS-English/blob/main/LICENSE_MODEL_FARM.pdf
