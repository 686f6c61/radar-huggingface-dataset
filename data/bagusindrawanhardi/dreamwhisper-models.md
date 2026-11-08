# bagusindrawanhardi/dreamwhisper-models

## Resumen

DreamWhisper-models es un repositorio espejo (mirror) que agrupa los ficheros que la aplicación DreamWhisper, una app de cuentos infantiles para dormir, descarga una sola vez en el teléfono. No se trata de un modelo entrenado por el autor, sino de un paquete de distribución que reúne el "narrador" (un Llama 3.2 1B Instruct cuantizado a Q4_K_M en GGUF) y varios ficheros de voz para síntesis y procesado de audio. El autor es bagusindrawanhardi y el repositorio se publicó en noviembre de 2026.

El componente lingüístico es Meta Llama-3.2-1B-Instruct, cuantizado por bartowski a Q4_K_M sin modificaciones, con un SHA-256 verificable. El resto del paquete lo forman modelos de voz ejecutables con sherpa-onnx: ZipVoice (clonación de voz zero-shot destilada en int8), el vocoder Vocos a 24 kHz, un eliminador de ruido DPDFNet a 48 kHz para la grabación del progenitor y una voz Piper "amy" en inglés estadounidense.

Su relevancia es acotada: sirve como ejemplo de empaquetado on-device de un pipeline completo de TTS más LLM para una app móvil, con verificación de integridad por hash y licencias mixtas. No aporta innovación en arquitectura ni en entrenamiento; su interés es logístico y de despliegue en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) para el narrador; ZipVoice + Vocos + DPDFNet + Piper para el audio |
| Parametros totales | 1.235.814.432 (narrador Llama 3.2 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 3.2 1B Instruct soporta 128k tokens segun Meta, no confirmado en esta ficha) |
| Tipos de cuantizacion | Q4_K_M (GGUF) para el narrador; int8 para ZipVoice; ONNX para Vocos y DPDFNet |
| Idiomas soportados | no disponible; la voz Piper incluida es en_US (ingles estadounidense) y ZipVoice entrena sobre Emilia (zh-en) |
| Licencia | mixta: Llama 3.2 Community License (narrador), Apache-2.0 (ZipVoice codigo, DPDFNet), MIT (Vocos), licencia de la voz Piper segun su fuente, Emilia no comercial para ZipVoice |
| Formato de pesos | GGUF (narrador), ONNX (Vocos, DPDFNet), tar.bz2 con modelos sherpa-onnx (ZipVoice, Piper) |

## Arquitectura y entrenamiento

El narrador es Llama 3.2 1B Instruct, un transformer decoder-only de Meta con 1.235.814.432 parametros, cuantizado a Q4_K_M por bartowski (revision 067b946) y distribuido sin cambios. No se documenta en esta ficha el proceso de entrenamiento original de Llama 3.2 (número de tokens, composición del dataset, RLHF/DPO); esa información no está disponible en el material proporcionado. La cuantización Q4_K_M reduce el peso a aproximadamente 0,8 GB, apta para ejecución en móvil.

El pipeline de audio combina cuatro modelos independientes ejecutados con sherpa-onnx: ZipVoice destilado en int8 para clonación de voz zero-shot (entrenado sobre el dataset Emilia, de licencia no comercial), Vocos a 24 kHz como vocoder, DPDFNet a 48 kHz para eliminación de ruido de la grabación del progenitor y una voz Piper "amy" en inglés estadounidense de calidad media. No hay innovaciones técnicas propias del autor; el valor está en la integración y en la verificación por SHA-256 del fichero del narrador.

## Capacidades

- Generación de texto conversacional y narrativo con Llama 3.2 1B Instruct (cuentos infantiles, diálogo multi-turno).
- Síntesis de voz a partir de texto mediante ZipVoice (zero-shot, con clonación de voz) y Piper "amy" (voz fija en inglés estadounidense).
- Clonación de voz zero-shot con ZipVoice destilado en int8.
- Eliminación de ruido de grabaciones de voz con DPDFNet a 48 kHz (útil para capturar la voz del progenitor).
- Vocoder neuronal a 24 kHz (Vocos) para convertir representaciones acústicas en audio.
- Ejecución on-device con sherpa-onnx, sin dependencia de servidores.
- Verificación de integridad por SHA-256 del modelo narrador.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; la voz incluida es solo en_US y ZipVoice entrena sobre zh-en.
- Modo thinking, visión o audio de entrada: no disponibles.

## Casos de uso

- Aplicación móvil de cuentos para dormir: el paquete permite descargar una sola vez el narrador (Llama 3.2 1B Q4_K_M) y las voces, y generar cuentos personalizados offline en el teléfono, sin coste de inferencia en la nube.
- Narración con voz clonada del progenitor: ZipVoice permite clonar la voz a partir de una grabación corta, y DPDFNet limpia el ruido de esa grabación antes de usarla, de modo que el cuento se lea con una voz familiar.
- Distribución con verificación de integridad: el hash SHA-256 del GGUF permite a la app validar que el fichero descargado es exactamente el de bartowski, útil en pipelines de distribución de modelos a dispositivos finales.
- Prototipado de asistentes de voz on-device: la combinación Llama 1B + ZipVoice + Vocos + sherpa-onnx sirve como plantilla para asistentes conversacionales que deben funcionar sin red.
- Investigación en TTS de bajo coste: el repositorio reúne versiones destiladas e int8 de ZipVoice y un vocoder ligero, útiles para comparar calidad y latencia en dispositivos de gama media.
- Educación y accesibilidad: generación de audiolibros o lectura en voz alta para personas con dificultades visuales, con la voz Piper "amy" como opción fija y ligera.
- Eliminación de ruido en grabaciones domésticas: DPDFNet a 48 kHz puede reutilizarse en otras apps que capturen voz en entornos ruidosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el narrador: aproximadamente 0,8-1,0 GB en Q4_K_M (el repo completo ocupa 1,0 GB).
- GPU recomendadas: no aplica para el caso de uso principal (móvil); en escritorio, cualquier GPU consumer con 2 GB o más de VRAM puede ejecutar el GGUF.
- Cabe en GPU consumer: sí, en RTX 3050, RTX 4060, RTX 4090 y similares, así como en CPU.
- Opciones de despliegue: llama.cpp y Ollama para el GGUF; sherpa-onnx para ZipVoice, Vocos, DPDFNet y Piper; vLLM y TGI no están documentados para este paquete.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| DreamWhisper-models (este repo) | 1.235.814.432 (narrador) | no disponible | GGUF + ONNX + sherpa-onnx | Mixta (Llama 3.2, Apache-2.0, MIT, Emilia no comercial) | Paquete on-device de LLM + TTS |
| meta-llama/Llama-3.2-1B-Instruct | 1.235.814.432 | 128k (según Meta, no verificado aquí) | safetensors | Llama 3.2 Community License | LLM base instruct |
| bartowski/Llama-3.2-1B-Instruct-GGUF | 1.235.814.432 | 128k (según Meta) | GGUF (Q4_K_M y otras) | Llama 3.2 Community License | Cuantización del anterior |
| Piper (rhasspy/piper) | no disponible | no aplica | ONNX | MIT (código) | TTS ligero on-device |

## Limitaciones y advertencias

- El repositorio no es un modelo nuevo: es un espejo de ficheros de terceros; no hay entrenamiento ni fine-tuning propio.
- Licencia mixta: el narrador está bajo Llama 3.2 Community License (con Acceptable Use Policy); ZipVoice se entrenó sobre Emilia, de licencia no comercial, lo que puede impedir uso comercial del pipeline de clonación de voz.
- La voz Piper incluida es solo en inglés estadounidense; no hay voces en castellano en el paquete.
- Idiomas soportados no documentados; el uso multilingüe no está garantizado.
- Riesgo de alucinación inherente a un modelo de 1B parámetros: puede inventar contenido en cuentos o conversaciones.
- Sesgos conocidos del modelo base Llama 3.2 no documentados en esta ficha; deben evaluarse antes de producción.
- Contexto efectivo en móvil limitado por memoria del dispositivo, no por el máximo teórico del modelo.
- El autor no ofrece garantías de mantenimiento ni de actualización de los ficheros espejo.
- Uso comercial: revisar la licencia de Emilia y de la voz Piper antes de distribuir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bagusindrawanhardi/dreamwhisper-models
- Perfil del autor en GitHub: https://github.com/bagusindrawanhardi/
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Cuantización GGUF: https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF
- ZipVoice: https://github.com/k2-fsa/ZipVoice
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Vocos: https://github.com/gemelo-ai/vocos
- DPDFNet: https://huggingface.co/Ceva-IP/DPDFNet
- Piper: https://github.com/rhasspy/piper
- Voz Piper "amy": https://huggingface.co/csukuangfj/vits-piper-en_US-amy-medium
