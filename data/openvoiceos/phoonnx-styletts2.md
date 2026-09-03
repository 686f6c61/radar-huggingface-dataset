# OpenVoiceOS/phoonnx-styletts2

## Resumen

`OpenVoiceOS/phoonnx-styletts2` es un repositorio espejo que aloja los pesos de la familia StyleTTS2 exportados a formato ONNX, preparados para ser consumidos por `phoonnx`, la librería de síntesis de voz offline de OpenVoiceOS. No se trata de un modelo único, sino de una colección de checkpoints procedentes de distintos laboratorios: el Barcelona Supercomputing Center (español y catalán), el HiTZ Center de la Universidad del País Vasco (euskera), Proxecto Nós (gallego), la comunidad (inglés) y los checkpoints Kokoro (descendiente de StyleTTS2) en varias versiones. El repositorio incluye también los vectores de estilo (`.bin`) para voces con nombre y los `config.json` necesarios para la carga.

StyleTTS2 genera habla condicionada por un vector de estilo que codifica prosodia y timbre a partir de un clip de referencia, lo que permite clonación de voz zero-shot. `phoonnx` trata los checkpoints de Kokoro como voces del motor `styletts2` porque comparten el mismo contrato de condicionamiento por vector de estilo. El repositorio está pensado para ser gestionado a través del gestor de voces de `phoonnx`, no para navegarse directamente. Su relevancia radica en ofrecer un catálogo multilingüe de voces de alta calidad, offline y con licencias mayoritariamente permisivas, para asistentes de voz y aplicaciones de síntesis en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (y Kokoro, descendiente de StyleTTS2) |
| Parametros totales | no disponible para StyleTTS2; Kokoro-82M tiene 82 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de síntesis de voz, sin contexto de texto) |
| Tipos de cuantizacion | no especificado (formato ONNX, presumiblemente FP32 o FP16) |
| Idiomas soportados | en, es, ca, eu, gl, ja, zh, hi, it, pt, fr |
| Licencia | other (Apache-2.0 para la mayoría de voces; GPL-3.0 para catalán; no determinada para la voz inglesa `ddatt/en-styletts2`) |
| Formato de pesos | ONNX (`.onnx`), vectores de estilo en `.bin` |

## Arquitectura y entrenamiento

StyleTTS2 es un modelo de síntesis de voz basado en un codificador de estilo que extrae un vector de 256 dimensiones (concatenación de `ref_p` y `ref_s`) a partir de un clip de referencia. Ese vector condiciona la generación de habla, permitiendo clonación zero-shot y control de prosodia y timbre. Los checkpoints incluidos provienen de entrenamientos específicos por idioma: el BSC entrenó modelos multihablante para español y catalán, el HiTZ Center para euskera (incluyendo versiones con emociones: happy, neutral, sad), y Proxecto Nós con Gradiant para gallego (voces Celtia y Brais). Los checkpoints de Kokoro, por su parte, son una evolución de StyleTTS2 con fonemización mediante el sistema "misaki". No se dispone de detalles sobre el número de tokens de entrenamiento, composición exacta de los datasets ni procesos de alineación tipo RLHF, ya que el repositorio es un espejo de pesos y no documenta el entrenamiento original.

## Capacidades

- Síntesis de voz multilingüe: inglés, español, catalán, euskera, gallego, japonés, chino, hindi, italiano, portugués y francés (estos últimos a través de los checkpoints Kokoro con configuraciones por idioma).
- Clonación de voz zero-shot: cualquier voz puede clonarse a partir de un clip de referencia de unos segundos, gracias al mecanismo de vector de estilo.
- Voces con nombre predefinidas: el repositorio incluye vectores de estilo calculados para hablantes concretos (por ejemplo, 6 hablantes españoles del corpus CML-TTS, 11 hablantes catalanes de Festcat, voces vascas Antton y Maider, y gallegas Celtia y Brais).
- Voces con emoción (euskera): variantes happy, neutral y sad para las voces vascas.
- Funcionamiento totalmente offline: los pesos se cargan localmente mediante `onnxruntime`, sin necesidad de conexión a internet.
- Integración con el gestor de voces de `phoonnx`: resolución automática de IDs de voz, carga de modelos y síntesis de audio WAV.
- Compatibilidad con el ecosistema OpenVoiceOS: pensado para asistentes de voz embebidos y dispositivos de bajo consumo.

## Casos de uso

- Asistentes de voz domésticos offline: al ser modelos ONNX ligeros (especialmente Kokoro-82M), pueden ejecutarse en Raspberry Pi o dispositivos similares para dar voz a asistentes como OVOS sin depender de servicios en la nube.
- Clonación de voz para audiolibros o narración: usando la clonación zero-shot, un editor puede generar narraciones con la voz de un locutor concreto a partir de una muestra breve, sin necesidad de grabar horas de audio.
- Voces localizadas para servicios públicos: las voces del BSC en español y catalán, y las de Proxecto Nós en gallego, permiten crear sistemas de información por voz en lenguas cooficiales con licencias Apache-2.0 (excepto catalán, GPL-3.0).
- Accesibilidad: síntesis de voz en euskera con control emocional (happy, neutral, sad) para aplicaciones de lectura asistida o interfaces de comunicación aumentativa.
- Testing de IVR (respuesta de voz interactiva): el soporte multilingüe y la posibilidad de cambiar de voz rápidamente mediante el gestor de `phoonnx` facilitan la generación de audios de prueba para sistemas telefónicos automáticos.
- Producción de contenido multimedia: los vectores de estilo precalculados para hablantes concretos permiten generar locuciones consistentes para podcasts, vídeos o anuncios sin necesidad de un estudio de grabación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas objetivas como MOS (Mean Opinion Score), RTF (Real-Time Factor) ni comparativas con otros sistemas TTS.

## Requisitos de hardware

- Al ser modelos ONNX, pueden ejecutarse en CPU mediante `onnxruntime`; no se requiere GPU obligatoriamente.
- Kokoro-82M (82 millones de parámetros) es lo bastante ligero para correr en tiempo real en CPUs de gama media (por ejemplo, un Intel i5 o un Raspberry Pi 4 con optimizaciones).
- Los checkpoints de StyleTTS2 multihablante (español, catalán) son más pesados; se recomienda al menos 4 GB de RAM libre y, para baja latencia, una GPU con 2-4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior).
- El repositorio completo ocupa 4.9 GB en disco; la carga selectiva de voces individuales reduce el espacio necesario.
- Opciones de despliegue: integración directa con `phoonnx` (Python), que usa `onnxruntime` como backend. No se mencionan servidores como vLLM o TGI porque no aplican a TTS.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Tamaño | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| phoonnx-styletts2 (este repo) | Variable (82M para Kokoro; otros no especificados) | 11 idiomas | Mixta (Apache-2.0, GPL-3.0, otra) | ONNX | Colección de voces StyleTTS2 y Kokoro |
| Piper TTS | ~20-100M según voz | ~20 idiomas | MIT | ONNX | Optimizado para CPU, voces por idioma |
| Coqui TTS (XTTS v2) | ~500M | 17 idiomas | CPML (no comercial) | PyTorch | Clonación de voz, pero requiere GPU para tiempo real |
| Kokoro-82M (standalone) | 82M | en, fr, hi, it, ja, pt, zh, es | Apache-2.0 | PyTorch/ONNX | Modelo base del que derivan varias voces de este repo |

La principal diferencia frente a Piper es que este repositorio ofrece clonación zero-shot y voces con emociones, además de un mayor número de lenguas peninsulares. Frente a Coqui XTTS, la ventaja es el formato ONNX y las licencias más permisivas (excepto la voz catalana).

## Limitaciones y advertencias

- Licencias heterogéneas: aunque la mayoría de voces son Apache-2.0, la voz catalana del BSC es GPL-3.0 (afecta a la redistribución de los pesos, no a `phoonnx`), y la voz inglesa `ddatt/en-styletts2` no tiene licencia determinada (tratar como all-rights-reserved).
- La voz `bsc/es-styletts2` y `bsc/ca-styletts2` (zero-shot) requieren un clip de referencia en cada llamada; no tienen voz por defecto.
- La fonemización en gallego usa notación Cotovía (no IPA), lo que puede requerir adaptaciones si se integra con otros sistemas.
- No se dispone de información sobre sesgos, alucinaciones auditivas o calidad en condiciones de ruido; al ser un espejo de pesos, no hay evaluación propia.
- El repositorio no está pensado para navegarse directamente; el uso correcto es a través de la librería `phoonnx`, que resuelve los IDs de voz.
- No hay garantía de soporte a largo plazo para los checkpoints comunitarios (como `ddatt/en-styletts2`), cuyo origen no pudo verificarse.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/OpenVoiceOS/phoonnx-styletts2)
- [README del repositorio](https://huggingface.co/OpenVoiceOS/phoonnx-styletts2/blob/main/README.md)
- [Librería phoonnx en GitHub](https://github.com/TigreGotico/phoonnx)
- [Documentación de clonación de phoonnx](https://github.com/TigreGotico/phoonnx/blob/dev/docs/cloning.md)
- [Documentación de voces BSC multihablante](https://github.com/TigreGotico/phoonnx/blob/dev/docs/bsc_multispeaker.md)
- [Documentación de gallego](https://github.com/TigreGotico/phoonnx/blob/dev/docs/galician.md)
- [Checkpoint español del BSC](https://huggingface.co/BSC-LT/styletts2-spanish-multispeaker)
- [Checkpoint catalán del BSC](https://huggingface.co/BSC-LT/styletts2-catalan-multispeaker)
- [Checkpoint euskera del HiTZ](https://huggingface.co/HiTZ/StyleTTS2-eu)
- [Checkpoint euskera con emociones del HiTZ](https://huggingface.co/HiTZ/StyleTTS2-eu_emo)
- [Checkpoint gallego Celtia (Proxecto Nós)](https://huggingface.co/proxectonos/Nos_StyleTTS2-Celtia-GL)
- [Checkpoint gallego Brais (Proxecto Nós)](https://huggingface.co/proxectonos/Nos_StyleTTS2-Brais-GL)
- [Kokoro-82M original](https://huggingface.co/hexgrad/Kokoro-82M)
- [Kokoro-82M en ONNX](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX)
- [Kokoro v0.19 (kLegacy)](https://huggingface.co/hexgrad/kLegacy)
- [Kokoro v1.1 zh](https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh)
- [Blog de OpenVoiceOS presentando phoonnx](https://blog.openvoiceos.org/posts/2025-10-06-phoonnx)
