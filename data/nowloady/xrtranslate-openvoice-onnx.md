# NowLoadY/XRTranslate-OpenVoice-ONNX

## Resumen

XRTranslate-OpenVoice-ONNX es un paquete de conversión ONNX del modelo de síntesis de voz MeloTTS-Chinese de MyShell, combinado con el convertidor OpenVoice V2, mantenido por la comunidad para el proyecto XRTranslate. No es un artefacto oficial de MyShell ni de NVIDIA, sino una conversión reproducible orientada a un pipeline de clonado de voz instantáneo en Rust puro, dentro del ecosistema de XRTranslate, un sistema modular de reconocimiento y traducción de voz en tiempo real con soporte para subtitulado, reuniones y VRChat OSC.

El paquete incluye el frontend lingüístico chino, el grafo acústico MeloTTS, el convertidor OpenVoice V2, el codificador de altavoz de referencia y los embeddings de tono fuente, todo autocontenido con manifiestos SHA-256. Está licenciado bajo MIT y pesa 0,6 GB en el repositorio (460,9 MiB instalado). La salida base es de 44.100 Hz, aunque XRTranslate devuelve audio convertido a 22.050 Hz mono PCM16.

Relevante ahora porque permite clonado de voz en tiempo real sin conexión, en Rust puro, con control de tono de color sobre una base de pronunciación y prosodia determinada por el paquete de idioma MeloTTS. Es una alternativa práctica para aplicaciones de traducción de voz en local, con licencia permisiva y reproducibilidad documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MeloTTS (grafo acustico) + OpenVoice V2 (convertidor de tono y encoder de altavoz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, sin contexto textual de ventana) |
| Tipos de cuantizacion | FP16 (grafo acustico), FP32 (frontend de texto) |
| Idiomas soportados | Chino (con ingles mezclado) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 16) |

## Arquitectura y entrenamiento

El paquete combina dos componentes de MyShell: el modelo acustico MeloTTS (basado en arquitectura de sintesis de voz con frontend de lenguaje, grafo acustico y vocoder) y el convertidor OpenVoice V2, que transfiere el tono de color de un altavoz de referencia sobre la pronunciacion y prosodia generadas por MeloTTS. No se ha publicado informacion sobre el dataset de entrenamiento ni el proceso de RLHF/DPO; el modelo base es `myshell-ai/MeloTTS-Chinese`.

La conversion a ONNX se realizo de forma reproducible en un entorno Conda con Python 3.10, PyTorch 2.11.0+cu128, CUDA 12.8, ONNX 1.22.0 y ONNX Runtime 1.23.2, usando opset 16. Cada paquete incluye un manifest JSON con commits exactos de los repositorios upstream, hashes de fuentes, contratos de tensores, versiones de conversion y resultados de smoke-test. No se documentan innovaciones tecnicas adicionales mas alla de la exportacion a ONNX para inferencia en Rust.

## Capacidades

- Sintesis de voz en chino con mezcla de ingles, controlada por el paquete de idioma MeloTTS.
- Clonado de voz instantaneo: transfiere el tono de color de un audio de referencia de corta duracion.
- Control de pronunciacion, acento y prosodia determinados por el paquete de idioma, no por la referencia de tono.
- Salida de audio de alta calidad a 44,1 kHz (base) y 22,05 kHz mono PCM16 (convertido por XRTranslate).
- Integracion con XRTranslate para traduccion de voz en tiempo real, con soporte de overlays, subtitulos y VRChat OSC.
- Inferencia local en Rust puro con ONNX Runtime CUDA, sin dependencia de servicios externos.

## Casos de uso

- **Subtitulado en tiempo real**: el modelo puede generar voz clonada del usuario mientras se traduce el contenido, manteniendo el tono personal en los subtitulos de videos o transmisiones.
- **Traduccion de voz en reuniones**: en entornos de conferencia, el sistema transcribe, traduce y sintetiza la voz del orador con su tono, facilitando la comprension multilingue en directo.
- **Notas de voz personalizadas**: se puede generar una voz clonada para leer notas o resumenes, con la pronunciacion correcta en chino gracias a la base MeloTTS.
- **Integracion en VRChat**: mediante el OSC de XRTranslate, los usuarios pueden hablar en su voz clonada dentro de mundos virtuales, con traduccion simultanea para otros participantes.
- **Aplicaciones de accesibilidad**: personas con dificultades de habla pueden usar una voz clonada para comunicarse en chino, con control de tono y prosodia.
- **Desarrollo de asistentes de voz locales**: se puede integrar en aplicaciones Rust que requieran TTS con clonado de voz sin conexion, con licencia MIT para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del paquete: 460,9 MiB instalado (0,6 GB en el repositorio).
- Requiere ONNX Runtime con soporte CUDA compatible en XRTranslate; no funciona como API de TTS Python independiente.
- GPU recomendada: cualquier GPU NVIDIA con CUDA 12.8 o superior (p. ej., RTX 20xx/30xx/40xx, A100, H100) para inferencia en tiempo real.
- No se han publicado datos de latencia ni throughput; se espera inferencia en tiempo real en local con GPU CUDA.
- Despliegue: exclusivamente dentro de XRTranslate, usando su infraestructura Rust; no se ofrece despliegue con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Formato | Idiomas | Licencia | Tono clonado | Integracion Rust |
|---|---|---|---|---|---|
| XRTranslate-OpenVoice-ONNX (este) | ONNX | Chino (con ingles) | MIT | Si (OpenVoice V2) | Si, directa |
| MeloTTS-Chinese (oficial) | PyTorch | Chino | MIT | No (solo sintesis) | No, requiere Python |
| OpenVoice V2 (oficial) | PyTorch | Multi | MIT | Si | No, requiere Python |

La principal diferencia es que este paquete es la unica opcion preparada para integrarse en el ecosistema Rust de XRTranslate, con todos los componentes empaquetados y verificados, mientras que los originales requieren un entorno Python y no ofrecen clonado de tono integrado.

## Limitaciones y advertencias

- No es un artefacto oficial de MyShell ni de NVIDIA; es un mantenimiento comunitario de NowLoadY.
- Requiere un ONNX Runtime con CUDA compatible en XRTranslate; no es una API de TTS independiente.
- El clonado de voz solo transfiere el tono de color; pronunciacion, acento y prosodia quedan determinados por el paquete de idioma MeloTTS (chino con ingles mezclado).
- Riesgo de uso indebido del clonado de voz: el modelo puede imitar voces de terceros, lo que plantea riesgos de suplantacion; el usuario debe obtener consentimiento explicito.
- No se han publicado benchmarks de calidad de audio ni comparaciones con otros modelos TTS.
- El paquete esta pensado para uso en XRTranslate; no es portable a otros frameworks de TTS sin adaptacion.

## Enlaces

- HuggingFace: https://huggingface.co/NowLoadY/XRTranslate-OpenVoice-ONNX
- Repositorio XRTranslate: https://github.com/NowLoadY/XRTranslate
- MeloTTS (upstream): https://github.com/myshell-ai/MeloTTS
- OpenVoice (upstream): https://github.com/myshell-ai/OpenVoice
- OpenVoiceV2 (HuggingFace): https://huggingface.co/rsxdalv/OpenVoiceV2
- Demo OpenVoiceV2: https://huggingface.co/spaces/myshell-ai/OpenVoiceV2
- Documentacion OpenVoice: https://docs.myshell.ai/technology/openvoice
