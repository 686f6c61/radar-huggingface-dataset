# OpenMOSS-Team/MOSS-TTS-v1.5

## Resumen

MOSS-TTS-v1.5 es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por MOSS AI y OpenMOSS. Se trata de la continuación del checkpoint MOSS-TTS 1.0 (MossTTSDelay-8B) y está diseñado para generar habla natural en 31 idiomas, incluyendo castellano, con capacidades de clonación de voz zero-shot, control de duración a nivel de token y control de pronunciación mediante Pinyin o IPA.

El modelo resuelve el problema de la generación de voz multilingüe de alta calidad con control fino sobre prosodia y pausas. Frente a la versión 1.0, v1.5 mejora la síntesis multilingüe cuando se especifica la etiqueta de idioma, estabiliza la clonación de voz reduciendo la varianza entre generaciones, maneja mejor referencias de audio largas con textos cortos y añade marcadores de pausa explícitos en línea, como `[pause 3.2s]`.

Con 8.490 millones de parámetros y un repositorio de 17 GB en formato safetensors, es un modelo relativamente pesado para TTS, lo que lo sitúa en la categoría de modelos de voz de gran escala. Su licencia Apache 2.0 y sus 71.365 descargas en Hugging Face lo convierten en una opción relevante para integración en producción sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de Hugging Face: `moss_tts_delay`; requiere `custom_code`) |
| Parametros totales | 8.489.841.664 (8,49 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 31: zh, yue, en, ar, cs, da, nl, fi, fr, de, el, he, hi, hu, it, ja, ko, mk, ms, fa, pl, pt, ro, ru, es, sw, sv, tl, th, tr, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 17,0 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag `moss_tts_delay`, que sugiere un esquema de generación con retardo (delay) propio de la familia MOSS-TTS, y de la necesidad de cargar código personalizado (`custom_code`) para su ejecución. El modelo mantiene la API de generación del checkpoint MossTTSDelay-8B de la versión 1.0, lo que indica continuidad arquitectónica entre ambas versiones.

En cuanto al entrenamiento, v1.5 parte de MOSS-TTS 1.0 y aplica un entrenamiento continuado multilingüe que amplía la cobertura desde los 20 idiomas originales hasta 31, añadiendo cantonés, neerlandés, finés, hindi, macedonio, malayo, rumano, suajili, tagalo, tailandés y vietnamita. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Las mejoras declaradas por el autor se centran en la estabilidad de la clonación, el seguimiento de la prosodia marcada por puntuación y el control explícito de pausas.

## Capacidades

- Generación de voz a partir de texto en 31 idiomas, con etiqueta de idioma opcional que mejora la calidad cuando se especifica.
- Clonación de voz zero-shot a partir de audio de referencia, con mayor similitud de hablante y menor varianza en v1.5.
- Clonación robusta con referencias de audio mucho más largas que el texto objetivo.
- Generación de habla de formato largo (long-form speech generation).
- Control de duración a nivel de token.
- Control de pronunciación mediante Pinyin (chino) e IPA (alfabeto fonético internacional).
- Síntesis con cambio de código (code-switching) entre idiomas dentro de una misma emisión.
- Control explícito de pausas en línea mediante marcadores como `[pause 3.2s]`.
- Seguimiento estable de la prosodia derivada de la puntuación, especialmente en frases largas.
- No se mencionan en la información disponible capacidades de tool calling, agentes ni visión o audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Doblaje y localización de vídeo multilingüe: el modelo puede generar pistas de voz en los 31 idiomas soportados, incluyendo castellano, a partir de un mismo guion, lo que simplifica la producción de versiones localizadas de contenido audiovisual.
- Audiolibros y narración de formato largo: la capacidad de generación de habla long-form y el control de pausas explícitas permiten producir narraciones con pausas naturales entre capítulos o frases, ajustando la cadencia con marcadores como `[pause 3.2s]`.
- Asistentes de voz y atención al cliente: la clonación zero-shot estable permite desplegar una voz de marca consistente en sistemas de respuesta por voz, con menor variación entre generaciones gracias a las mejoras de v1.5.
- Accesibilidad y lectura de contenidos: conversión de artículos, documentos o interfaces a voz en castellano y otros idiomas, con control de pronunciación mediante IPA para términos técnicos o nombres propios.
- Producción de contenido para redes y pódcast: generación rápida de locuciones con voz clonada del creador, útil para prototipado y producción de episodios sin regrabación.
- Sistemas educativos de idiomas: síntesis con cambio de código y control de pronunciación para materiales de aprendizaje que mezclan castellano con otros idiomas, o que requieren precisión fonética en términos concretos.
- Prototipado de interfaces conversacionales: integración en pipelines de desarrollo mediante la API `generate` del paquete MOSS-TTS, con soporte de FlashAttention 2 para acelerar la inferencia en GPUs compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 8,49 B de parámetros y el repositorio pesa 17,0 GB en safetensors, lo que implica que en precisión completa (fp32) la inferencia requiere del orden de 34 GB solo para pesos; en bf16/fp16 se reduce a aproximadamente 17 GB.
- No se proporcionan estimaciones oficiales de VRAM por cuantización; los tipos de cuantización no están documentados en la información disponible.
- Se recomienda instalar FlashAttention 2 para mejorar la velocidad y reducir el uso de memoria de GPU, según la documentación del autor; requiere GPUs compatibles y se usa típicamente con `torch.float16` o `torch.bfloat16`.
- El entorno recomendado fija `torch==2.9.1+cu128` y `torchaudio==2.9.1+cu128`, con Python 3.12 y Transformers 5.0.0.
- No se especifican GPUs concretas recomendadas (A100, H100, RTX 4090) ni si cabe en GPUs de consumo; no disponible.
- Opciones de despliegue: el paquete oficial MOSS-TTS (instalación vía `pip install -e .` desde el repositorio de GitHub) con la API `generate`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de la misma categoría, por lo que la comparación cuantitativa no está disponible. Como referencia cualitativa, la propia familia MOSS-TTS incluye el checkpoint anterior MOSS-TTS 1.0 (MossTTSDelay-8B), del que v1.5 es continuación directa y sobre el que declara mejoras en multilingüismo con etiqueta de idioma, estabilidad de clonación, manejo de referencias largas y control de pausas.

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| MOSS-TTS-v1.5 | 8,49 B | 31 | Apache 2.0 | Versión actual, con pausas explícitas y clonación más estable |
| MOSS-TTS 1.0 (MossTTSDelay-8B) | no disponible | 20 | no disponible | Predecesor; comparte API de generación |

## Limitaciones y advertencias

- La calidad multilingüe puede degradarse si se omite la etiqueta `language`: el propio autor advierte de que, sin ella, v1.5 puede mejorar algunos idiomas y empeorar ligeramente otros respecto a 1.0.
- No se documentan sesgos conocidos del modelo en la información disponible; al ser un modelo de voz, existe riesgo de sesgos de hablante y de representación según los datos de entrenamiento, no cuantificados aquí.
- La clonación de voz plantea riesgos de uso indebido (suplantación, deepfakes de audio); la licencia Apache 2.0 no impone restricciones de uso, por lo que la responsabilidad ética y legal recae en el integrador.
- No se dispone de información sobre la longitud máxima de contexto ni sobre límites de duración del audio generado.
- El modelo requiere cargar código personalizado (`custom_code`) y una versión concreta de Transformers (5.0.0) y PyTorch (2.9.1+cu128), lo que puede complicar la integración en entornos con dependencias fijadas.
- No hay datos publicados de benchmarks ni de latencia/throughput en la información disponible, lo que dificulta la planificación de capacidad en producción.
- El repositorio de 17 GB y los 8,49 B de parámetros implican requisitos de memoria considerables; no se confirma que quepa en GPUs de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-v1.5
- Modelo predecesor (MOSS-TTS 1.0): https://huggingface.co/OpenMOSS-Team/MOSS-TTS
- Repositorio GitHub del proyecto: https://github.com/OpenMOSS/MOSS-TTS/tree/main
- Página web de MOSS AI: https://www.moss-ai.com/models/moss-tts
- Documentación de la API MOSS: https://platform.moss.cn/en/docs/scenarios/single-voice
- Colección en ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Paper en arXiv: https://arxiv.org/abs/2603.18090
- Twitter/X de OpenMOSS: https://x.com/Open_MOSS
- Discord: https://discord.gg/fvm5TaWjU3
- Web de OpenMOSS: https://openmoss.ai/
