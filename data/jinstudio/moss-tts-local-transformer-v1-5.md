# Jinstudio/MOSS-TTS-Local-Transformer-v1.5

## Resumen

MOSS-TTS-Local-Transformer-v1.5 es un modelo de síntesis de voz (text-to-speech) de la familia MOSS-TTS, desarrollado por OpenMOSS. Este repositorio concreto está publicado por el usuario Jinstudio y enlaza al repositorio oficial de OpenMOSS-Team; conviene verificar la procedencia porque acumula 0 descargas y 0 likes en el momento de la consulta. El modelo tiene 4.550.403.584 parámetros (4,55 B), un repositorio de 9,1 GB en safetensors y licencia Apache-2.0.

La versión 1.5 continúa el entrenamiento desde MOSS-TTS-Local-Transformer-v1.0 y mantiene sus capacidades principales: clonación de voz zero-shot, generación de audio largo, control de duración a nivel de token, control de pronunciación mediante Pinyin/IPA, síntesis multilingüe y code-switching. Incorpora MOSS-Audio-Tokenizer-v2 para audio estéreo nativo a 48 kHz, mejora la estabilidad de la clonación y añade etiquetas de idioma y marcadores de pausa inline.

Es relevante para desarrolladores que necesitan un TTS multilingüe (31 idiomas) con clonación de voz y salida estéreo de alta frecuencia, ejecutable en local con Transformers y licencia permisiva. La información disponible no incluye benchmarks, longitud de contexto, tipos de cuantización ni detalles de entrenamiento, por lo que la evaluación cuantitativa queda pendiente.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para TTS con tokenizador de audio MOSS-Audio-Tokenizer-v2 |
| Parámetros totales | 4.550.403.584 (4,55 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | 31: zh, yue, en, ar, cs, da, nl, de, es, fr, fi, el, he, hi, hu, ja, it, ko, mk, ms, ru, fa, pl, pt, sv, ro, sw, tl, th, tr, vi |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; requiere custom_code |
| Librería | transformers |
| Pipeline | text-to-speech |
| Tamaño del repositorio | 9,1 GB |
| Versión de Transformers recomendada | 5.0.0 o una versión reciente con soporte de Qwen3 |
| Creado / actualizado | 2026-10-18 / 2026-10-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer para síntesis de voz que modela tokens de audio generados por MOSS-Audio-Tokenizer-v2. El tokenizador permite entrada y salida estéreo nativa a 48 kHz, lo que aporta mayor detalle espacial y calidad percibida frente a la versión 1.0. El modelo conserva las capacidades de clonación zero-shot, generación de audio largo, control de duración a nivel de token y control de pronunciación mediante Pinyin/IPA.

El entrenamiento es continuado desde MOSS-TTS-Local-Transformer-v1.0, con entrenamiento multilingüe adicional para incorporar cantonés, neerlandés, finés, hindi, macedonio, malayo, rumano, suajili, tagalo, tailandés y vietnamita. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo RLHF o DPO. Las innovaciones documentadas son el códec estéreo de 48 kHz, las etiquetas de idioma, los marcadores de pausa inline, la mayor estabilidad de clonación, la mejora en referencias largas con texto corto y una prosodia más estable basada en puntuación.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, con etiquetas de idioma explícitas para mejorar la calidad.
- Clonación de voz zero-shot a partir de audio de referencia, con mejora de similitud y reducción de varianza en v1.5.
- Generación de audio largo y narración de textos extensos.
- Control de duración a nivel de token.
- Control de pronunciación mediante Pinyin e IPA.
- Code-switching entre idiomas.
- Salida estéreo nativa a 48 kHz.
- Marcadores de pausa inline, por ejemplo `"[pause 3.2s]"`.
- Prosodia guiada por puntuación, con pausas más estables en frases largas.
- Manejo mejorado de referencias de audio mucho más largas que el texto objetivo.
- No se documenta soporte de tool calling, function calling ni uso como agente autónomo; es un modelo TTS.
- No se documentan capacidades de visión, reconocimiento de voz ni entrada de audio general más allá de la referencia para clonación.

## Casos de uso

- Audiolibros y narración de larga duración: el modelo puede generar capítulos completos con prosodia guiada por puntuación y pausas explícitas como `"[pause 3.2s]"`, lo que facilita el control del ritmo sin postprocesado manual.
- Doblaje y localización multilingüe: con 31 idiomas y code-switching, se puede mantener una voz clonada y generar variantes en distintos idiomas usando etiquetas como `language="French"`; resulta adecuado para catálogos que necesitan múltiples pistas de voz.
- Clonación de voz para accesibilidad: permite crear una voz personalizada a partir de una referencia para personas con discapacidad del habla, siempre con consentimiento explícito y revisión legal; v1.5 mejora la consistencia entre generaciones.
- Asistentes de voz e IVR: la salida estéreo a 48 kHz y las pausas por puntuación permiten integrar respuestas habladas en centralitas y asistentes telefónicos; la licencia Apache-2.0 facilita el despliegue en infraestructura propia.
- Producción de podcast y vídeo: el audio estéreo aporta detalle espacial y los marcadores de pausa permiten ajustar el tempo de locuciones, promociones o introducciones sin editar el audio manualmente.
- Educación de idiomas y entrenamiento de pronunciación: el control Pinyin/IPA y la síntesis en 31 idiomas permiten generar ejemplos de pronunciación y comparar variantes; la clonación puede usarse para crear voces de referencia con permiso.
- Prototipado de agentes conversacionales: aunque el modelo no hace tool calling, puede encadenarse con un LLM que gestione herramientas y utilice este TTS para la respuesta hablada, con inferencia local y sin depender de una API externa.
- Mensajes personalizados y campañas: la clonación estable y el control de pausas permiten generar variantes de un mismo mensaje para distintos públicos, manteniendo una voz de marca consistente y revisando el consentimiento de la voz original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las tablas de evaluación de MOSS-TTS-Local-Transformer-v1.0, pero no se incluyen cifras en la información proporcionada, por lo que no se pueden presentar comparaciones cuantitativas con MMLU, HumanEval, GSM8K ni métricas específicas de TTS.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 9,1 GB solo para los pesos; con activaciones, caché y el tokenizador de audio conviene reservar entre 12 y 18 GB. Se recomienda una GPU de 24 GB para trabajar con margen.
- VRAM estimada en 8 bits: alrededor de 4,6 GB solo para los pesos; el total práctico podría quedar en 8-10 GB, pero no se documenta soporte oficial de cuantización.
- VRAM estimada en 4 bits: alrededor de 2,3 GB solo para los pesos; el total práctico podría quedar en 5-7 GB, aunque no hay variantes oficiales publicadas.
- GPU recomendadas: A100 de 40 u 80 GB y H100 de 80 GB para producción con lotes o audio largo; RTX 4090 y RTX 3090 de 24 GB para inferencia local en BF16/FP16; L4 y A10G de 24 GB para despliegues en cloud.
- GPU de consumo: sí cabe en RTX 4090 y RTX 3090 de 24 GB en BF16/FP16. En GPUs de 16 GB puede funcionar con audios cortos, pero el margen es ajustado. En GPUs de 8 GB solo sería viable con cuantización no documentada.
- Despliegue: la vía documentada es Transformers 5.0.0 o una versión reciente con soporte de Qwen3, instalando el repositorio de MOSS-TTS y el extra `torch-runtime`. FlashAttention 2 es opcional y puede reducir el uso de memoria y mejorar la velocidad.
- vLLM, TGI, llama.cpp y Ollama: no se documenta soporte en la información disponible.
- Latencia y throughput: no disponible.
- CPU: la inferencia en CPU no se documenta como recomendada; para producción se espera GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Clonación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MOSS-TTS-Local-Transformer-v1.5 | 4,55 B | no disponible | 31 | sí | Apache-2.0 | HuggingFace (Jinstudio y OpenMOSS-Team) |
| MOSS-TTS-Local-Transformer-v1.0 | no disponible | no disponible | 20 | sí | no disponible en la información | HuggingFace (OpenMOSS-Team) |
| XTTS-v2 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| CosyVoice 2 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de parámetros, contexto, benchmarks ni licencia verificable de XTTS-v2, CosyVoice 2 ni otras alternativas. Por tanto, la comparación cuantitativa no está disponible; solo se puede comparar v1.5 con v1.0 en idiomas (31 frente a 20), en el uso de MOSS-Audio-Tokenizer-v2 con estéreo a 48 kHz y en las mejoras documentadas de clonación y prosodia. El rendimiento de todos los modelos queda como no disponible.

## Limitaciones y advertencias

- Este repositorio es un reupload de Jinstudio, no el repositorio oficial de OpenMOSS; acumula 0 descargas y 0 likes, por lo que conviene validar la integridad de los pesos y la procedencia antes de usarlo en producción.
- La licencia declarada es Apache-2.0, pero no se detalla la licencia de componentes de terceros como el tokenizador de audio o el código de inferencia; hay que revisarlos por separado.
- No se han publicado benchmarks en la información disponible, así que no se puede afirmar superioridad objetiva frente a v1.0 ni frente a otros modelos TTS.
- No se documentan sesgos concretos; como modelo entrenado con corpus multilingües, puede reproducir sesgos de acento, género, edad o variedad lingüística presentes en los datos.
- El riesgo de alucinación no aplica en el sentido de un LLM, pero el modelo puede producir audio no fiel al texto: omisiones, repeticiones, prosodia incorrecta, ruido o artefactos. Requiere validación automática y escucha humana.
- La calidad por idioma es desigual. Si se omite el campo `language`, v1.5 puede mejorar algunas lenguas y empeorar ligeramente otras respecto a v1.0; se recomienda especificar siempre el idioma.
- La clonación de voz plantea riesgos de suplantación y deepfakes; es obligatorio obtener consentimiento explícito de la persona cuya voz se clona y cumplir la normativa aplicable.
- El modelo requiere `custom_code` y una versión de Transformers con soporte de Qwen3; no es plug-and-play en todos los pipelines. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- La salida es estéreo; al decodificar hay que guardar el tensor `[channels, samples]` directamente para no perder los canales.
- La longitud de contexto no está especificada; el límite práctico para audio largo dependerá de la memoria de la GPU y de la implementación.
- No se documentan tool calling, function calling ni capacidades de agente; cualquier uso conversacional requiere encadenar un LLM externo.

## Enlaces

- [Modelo en HuggingFace (Jinstudio)](https://huggingface.co/Jinstudio/MOSS-TTS-Local-Transformer-v1.5)
- [Modelo oficial en HuggingFace (OpenMOSS-Team)](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5)
- [Repositorio GitHub de MOSS-TTS](https://github.com/OpenMOSS/MOSS-TTS/tree/main)
- [Colección en ModelScope](https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS)
- [Blog de MOSS](https://mosi.cn/#models)
- [Paper arXiv 2603.18090](https://arxiv.org/abs/2603.18090)
- [AIStudio](https://studio.mosi.cn)
- [Documentación de la API](https://studio.mosi.cn/docs/moss-tts)
- [Twitter/X de OpenMOSS](https://x.com/Open_MOSS)
- [Discord de OpenMOSS](https://discord.gg/fvm5TaWjU3)
- [MOSS-TTS-Local-Transformer-v1.0](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer)
- [MOSS-Audio-Tokenizer-v2](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2)
