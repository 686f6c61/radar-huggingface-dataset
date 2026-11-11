# APLUX-Agora/MeloTTS-Chinese

## Resumen

MeloTTS-Chinese es un paquete de recursos para síntesis de voz (text-to-speech) en chino, publicado por APLUX-Agora dentro de su catálogo Model Farm. No se trata de un modelo entrenado desde cero por este autor, sino de una conversión y empaquetado de un modelo MeloTTS preexistente, optimizado para su despliegue en placas con SoC de Qualcomm mediante el runtime Agora y el stack QNN (Qualcomm Neural Network). El repositorio ocupa aproximadamente 0,1 GB e incluye binarios de contexto y ficheros de configuración por plataforma.

El problema que resuelve es la brecha entre un modelo TTS de investigación y su ejecución real sobre hardware AIoT de bajo consumo. Para ello, el autor publica compilaciones verificadas placa a placa, con precisiones definidas (FP16 por defecto en el caso documentado) y métricas medidas en hardware real, en este caso un RTF de 0,329 sobre un QCS8550 montado en una Rhino Pi X1. El RTF inferior a 1 indica que la síntesis es más rápida que el tiempo real en ese SoC.

La relevancia actual es acotada y muy específica: el paquete está pensado para integradores que despliegan TTS en dispositivos edge con Qualcomm, no para uso general en servidores. La información pública es escasa: no se detallan parámetros, arquitectura interna ni idiomas soportados más allá del chino implícito en el nombre, y la licencia es propietaria (APLUX Model Farm License), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS MeloTTS convertido; detalles internos no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (precision por defecto medida en QCS8550); otras precisiones no detalladas |
| Idiomas soportados | no disponible (el nombre del modelo indica chino; la model card no lista idiomas) |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); modelo fuente sujeto a sus propios terminos |
| Formato de pesos | binarios de contexto QNN (`model.bin`) y `model.json` por plataforma; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se trata de una conversión de MeloTTS, un sistema TTS de la familia MeloTTS, empaquetado para el runtime Agora con backend QNN de Qualcomm. El repositorio se organiza por SoC objetivo: cada directorio `targets/<SoC>/` contiene un `model.json` con la precisión por defecto y las rutas de las variantes, además de un subdirectorio por precisión con binarios de contexto denominados `model.bin`. Los paquetes multifichero se conservan tal como los publica Model Farm.

No se aportan datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni si hubo ajuste por RLHF o DPO. Tampoco se documentan innovaciones técnicas de decodificación o atención. La única información de rendimiento es la medición en placa: RTF 0,329 en FP16 sobre QCS8550 con la Rhino Pi X1. El autor indica que las compilaciones se validan placa a placa antes de abrirse a ejecución, y proporciona pre y post-procesado, runner y proyecto exportable a través de la plataforma Agora.

## Capacidades

- Síntesis de voz a partir de texto de entrada, con salida de audio (pipeline `text-to-speech`).
- Ejecución en hardware edge con SoC Qualcomm mediante QNN, con precisión FP16 documentada.
- Despliegue reproducible por plataforma: descarga selectiva por SoC con `hf download --include "targets/$AGORA_SOC/*"`.
- Integración con el flujo de Agora: guía de despliegue y exportación de proyectos que usan el modelo.
- Verificación de integridad mediante `NOTICE.md` y `SHA256SUMS`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz embebidos en dispositivos AIoT con Qualcomm: el paquete está compilado para QNN y verificado en QCS8550, de modo que puede integrarse en el firmware de un dispositivo sin necesidad de infraestructura de servidor.
- Lectura de avisos y notificaciones en chino en paneles o terminales industriales: la síntesis se ejecuta localmente con un RTF de 0,329, suficiente para generar audio más rápido que el tiempo real.
- Interfaces de accesibilidad en kioscos o electrodomésticos: al ejecutarse en la propia placa, funciona sin conectividad y evita enviar texto del usuario a la nube.
- Prototipado rápido de funciones de voz: la plataforma Agora permite probar el modelo online sin disponer de una placa física, antes de pasar al hardware objetivo.
- Evaluación comparativa de latencia TTS en distintos SoC: la estructura por `targets/<SoC>` y las métricas RTF publicadas facilitan medir el coste de la síntesis en cada plataforma.
- Pipelines de generación de audio por lotes en el borde: al ser un paquete autocontenido con runner y pre/post-procesado, puede integrarse en flujos de producción de contenido hablado en chino ejecutados en el dispositivo.

## Benchmarks y rendimiento

| Metrica | Valor | Plataforma |
|---|---|---|
| RTF (real-time factor) | 0,329 | QCS8550, Rhino Pi X1, FP16 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica publicada es el RTF medido en la placa indicada.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el modelo se ejecuta sobre SoC Qualcomm con memoria unificada. No se publica el consumo de memoria.
- GPU/SoC recomendados: QCS8550 (verificado). No se listan otros SoC compatibles en la información disponible.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el paquete está orientado a QNN y no se documentan rutas de ejecución en CUDA.
- Opciones de despliegue: runtime Agora con backend QNN; descarga de recursos vía `hf download`; guía de despliegue y exportación de proyecto desde la plataforma Agora. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF 0,329 en QCS8550 con FP16, es decir, la síntesis tarda aproximadamente un tercio del tiempo de audio generado. No se publican cifras de throughput absoluto ni latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MeloTTS-Chinese (APLUX-Agora) | no disponible | no disponible | RTF 0,329 en QCS8550 (FP16) | APLUX Model Farm License | Hugging Face, 0 descargas |
| MeloTTS original | no disponible en esta ficha | no disponible | no disponible | según el modelo fuente | no disponible en esta ficha |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa rigurosa con alternativas concretas.

## Limitaciones y advertencias

- Información técnica muy limitada: no se publican parámetros, arquitectura, contexto ni composición del entrenamiento, lo que dificulta evaluar calidad y sesgos.
- Idiomas: la model card no lista idiomas soportados; el nombre sugiere chino, pero no se confirma el alcance multilingüe.
- Licencia propietaria: APLUX Model Farm License, con PDF enlazado; es imprescindible revisarla antes de cualquier uso comercial. El modelo fuente queda sujeto además a sus propios términos.
- Restricción de plataforma: los binarios son específicos de QNN y de cada SoC; no hay ruta documentada para ejecución en GPU convencional o CPU.
- Riesgo de alucinación y sesgos: no evaluable con la información disponible; en TTS los riesgos típicos incluyen prosodia incorrecta, errores de pronunciación y artefactos en textos fuera de dominio.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; sin evidencia de uso en producción por terceros.
- Verificar integridad de los binarios con `SHA256SUMS` y revisar `NOTICE.md` antes del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/MeloTTS-Chinese
- Licencia (PDF): https://huggingface.co/APLUX-Agora/MeloTTS-Chinese/blob/main/LICENSE_MODEL_FARM.pdf
- Plataforma Agora: https://mega.aidlux.com
- Página del modelo en Agora: https://mega.aidlux.com/models/melotts-chinese
