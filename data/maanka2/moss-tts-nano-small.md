# maanka2/MOSS-TTS-Nano-Small

## Resumen

MOSS-TTS-Nano-Small es un modelo de síntesis de voz (text-to-speech) multilingüe de tamaño reducido, desarrollado originalmente por MOSI.AI y el equipo OpenMOSS, y re-subido a Hugging Face por el usuario maanka2. Con 28,5 millones de parámetros (el autor declara 0,1B, pero el peso real en safetensors es de 28.554.624), está diseñado para generación de voz en tiempo real, ejecución directa en CPU sin GPU y despliegue ligero en entornos de producción o demos locales.

El modelo emplea una arquitectura puramente autorregresiva basada en un audio tokenizer neuronal y un LLM, generando audio nativo a 48 kHz en dos canales. Soporta 20 idiomas, incluyendo chino, inglés, español, francés, alemán, japonés, coreano, ruso, árabe y otros. Su principal valor es la combinación de tamaño mínimo, baja latencia y capacidad de clonación de voz, lo que lo hace adecuado para integraciones ligeras en productos reales, asistentes de voz y aplicaciones embebidas.

La versión alojada en `maanka2/MOSS-TTS-Nano-Small` es una copia del modelo oficial `OpenMOSS-Team/MOSS-TTS-Nano`, con licencia Apache 2.0 y sin modificaciones aparentes. El repositorio incluye scripts de inferencia, demo web y CLI, así como un tokenizador de audio asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Tokenizer + LLM autorregresivo |
| Parametros totales | 28.554.624 (28,5M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | 20: zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un pipeline puramente autorregresivo compuesto por dos componentes principales: un audio tokenizer neuronal (MOSS-Audio-Tokenizer-Nano) que convierte audio en tokens discretos, y un LLM que genera secuencias de tokens de audio condicionadas al texto de entrada y, opcionalmente, a una referencia de voz para clonación. Esta arquitectura es similar a la de otros TTS neuronales modernos como VALL-E o XTTS, pero optimizada para un tamaño extremadamente reducido.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La model card menciona que el modelo soporta entrada de texto largo mediante división automática en fragmentos con clonación de voz por fragmento, lo que sugiere un mecanismo de chunking para mantener la coherencia en textos extensos. La inferencia es en streaming, con baja latencia de primer audio, y el modelo puede ejecutarse en una CPU de 4 núcleos.

## Capacidades

- Generación de voz multilingüe en 20 idiomas, con salida nativa a 48 kHz y 2 canales.
- Clonación de voz a partir de una muestra de referencia (voice cloning), tanto en inferencia directa como en modo fragmentado para textos largos.
- Inferencia en streaming con baja latencia de primer audio, adecuada para aplicaciones en tiempo real.
- Ejecución en CPU sin GPU, con soporte para equipos de 4 núcleos.
- Interfaz de línea de comandos (`moss-tts-nano generate` y `moss-tts-nano serve`) y demo web local mediante `app.py`.
- Integración con el ecosistema OpenMOSS, incluyendo tokenizador de audio dedicado y scripts de despliegue.
- No se especifican capacidades de tool calling, agentes ni razonamiento multimodal más allá del audio.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: el modelo puede ejecutarse en una Raspberry Pi o similar gracias a su bajo consumo de CPU, permitiendo respuestas de voz locales sin conexión a la nube.
- Atención al cliente automatizada: con soporte para 20 idiomas y clonación de voz, puede generar respuestas habladas en el idioma del usuario con una voz consistente, integrable en sistemas de IVR o chatbots telefónicos.
- Audiolibros y narración de contenido: la capacidad de procesar textos largos mediante chunking automático permite generar narraciones completas de artículos o libros con una voz clonada.
- Demos y prototipos rápidos: el script `app.py` y la CLI permiten montar un servicio TTS local en minutos, ideal para validar conceptos o presentaciones.
- Accesibilidad: generación de voz para lectores de pantalla o aplicaciones de apoyo a personas con discapacidad visual, con despliegue en hardware modesto.
- Localización de contenido multimedia: doblaje o voice-over de vídeos en múltiples idiomas, aprovechando la clonación de voz para mantener una voz consistente en todas las versiones.
- Educación y e-learning: generación de material de audio en varios idiomas para cursos online, con posibilidad de personalizar la voz del instructor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score), RTF (Real-Time Factor) ni comparativas con otros modelos TTS. Se menciona que la inferencia en streaming es de baja latencia y que funciona en CPU de 4 núcleos, pero sin cifras concretas.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en una CPU de 4 núcleos sin GPU, lo que lo hace apto para portátiles, mini-PCs y servidores de gama baja.
- VRAM: al tener solo 28,5M de parámetros, la VRAM necesaria es mínima (menos de 1 GB en FP32), por lo que cabe en cualquier GPU comercial, incluidas las integradas.
- GPUs recomendadas: no se requiere GPU específica; cualquier GPU con al menos 2 GB de VRAM es suficiente, aunque no es necesaria.
- Opciones de despliegue: scripts Python directos (`infer.py`, `app.py`), CLI empaquetada (`moss-tts-nano`), y posible integración con frameworks de serving como FastAPI (la demo web usa este enfoque).
- Latencia y throughput: no se proporcionan cifras exactas; la model card indica "baja latencia de primer audio" y "streaming en tiempo real", pero sin valores numéricos.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. El modelo es una variante reducida de la familia MOSS-TTS, y su principal competidor en el segmento de TTS pequeños sería Piper (de Rhasspy), que también es ligero y CPU-friendly, o XTTS-v2 de Coqui, que es más grande y requiere GPU. Sin embargo, no hay benchmarks públicos que permitan una comparación cuantitativa fiable. Se recomienda evaluar el modelo en el caso de uso concreto antes de decidir.

## Limitaciones y advertencias

- El tamaño reducido (28,5M parámetros) implica una calidad de voz inferior a modelos grandes como VITS o XTTS, especialmente en entornos ruidosos o con acentos complejos.
- No se han publicado datos sobre sesgos o alucinaciones; como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos de audio en idiomas poco representados.
- La clonación de voz requiere una muestra de referencia de calidad; con muestras cortas o ruidosas, la voz clonada puede degradarse.
- El modelo es una re-subida del usuario maanka2, no el repositorio oficial; se recomienda verificar la integridad de los pesos y usar la versión oficial de OpenMOSS-Team para producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de MOSS-Audio-Tokenizer-Nano, que también debe cumplir la misma licencia.
- No se especifica la longitud máxima de contexto; el chunking automático sugiere que textos muy largos pueden requerir fragmentación, lo que podría afectar la coherencia de la voz.

## Enlaces

- Repositorio Hugging Face (copia): https://huggingface.co/maanka2/MOSS-TTS-Nano-Small
- Repositorio oficial Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano
- GitHub oficial: https://github.com/OpenMOSS/MOSS-TTS-Nano
- ModelScope: https://modelscope.cn/models/openmoss/MOSS-TTS-Nano
- Demo online: https://openmoss.github.io/MOSS-TTS-Nano-Demo/
- Hugging Face Space: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-TTS-Nano
- Paper (arXiv 2603.18090): https://arxiv.org/abs/2603.18090
- Paper del tokenizador (arXiv 2602.10934): https://arxiv.org/abs/2602.10934
- Tokenizador de audio: https://huggingface.co/maanka2/MOSS-Audio-Tokenizer-Nano
