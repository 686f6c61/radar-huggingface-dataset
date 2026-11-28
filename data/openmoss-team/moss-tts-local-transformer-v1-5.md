# OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5

## Resumen

MOSS-TTS-Local-Transformer-v1.5 es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por MOSS AI y OpenMOSS. Se trata de la evolución del modelo v1.0 y mantiene sus capacidades principales —clonación de voz zero-shot, generación de audio de formato largo, control de duración a nivel de token, control de pronunciación mediante Pinyin/IPA, síntesis multilingüe y code-switching— incorporando mejoras centradas en la fidelidad del audio y la estabilidad de la clonación.

La versión 1.5 introduce un nuevo tokenizador de audio, MOSS-Audio-Tokenizer-v2, que permite entrada y salida estéreo nativa a 48 kHz, lo que se traduce en una mayor riqueza de detalle espacial y una calidad percibida más natural. Asimismo, amplía la cobertura lingüística hasta 31 idiomas (frente a los 20 de la v1.0), añadiendo cantonés, neerlandés, finlandés, hindi, macedonio, malayo, rumano, suajili, tagalo, tailandés y vietnamita.

El modelo cuenta con 4.550.403.584 parámetros (aproximadamente 4,55 mil millones) almacenados en formato safetensors, con un repositorio de 9,1 GB, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. Está pensado para desarrolladores que necesitan integrar síntesis de voz de alta calidad y clonación de voz en aplicaciones de producción sin depender de servicios propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer local (moss_tts_local), con tokenizador de audio MOSS-Audio-Tokenizer-v2 |
| Parámetros totales | 4.550.403.584 (≈4,55 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | 31 idiomas: zh, yue, en, ar, cs, da, nl, fi, fr, de, el, he, hi, hu, it, ja, ko, mk, ms, fa, pl, pt, ro, ru, es, sw, sv, tl, th, tr, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Frecuencia de muestreo | 48 kHz estéreo nativo |
| Tamaño del repositorio | 9,1 GB |
| Librería | transformers (requiere Transformers 5.0.0 o versión reciente con soporte Qwen3) |

## Arquitectura y entrenamiento

MOSS-TTS-Local-Transformer-v1.5 se basa en una arquitectura transformer con código personalizado (`custom_code`), diseñada específicamente para la generación de voz. La pieza diferencial de esta versión es el tokenizador de audio MOSS-Audio-Tokenizer-v2, que sustituye al de la v1.0 y habilita la modelización de audio estéreo nativo a 48 kHz. Esto implica que la salida del códec es estéreo, por lo que el tensor `[channels, samples]` devuelto por `processor.decode(...)` debe guardarse directamente con esa forma.

En cuanto al entrenamiento, la model card indica que la v1.5 continúa el entrenamiento multilingüe de la v1.0, extendiéndolo a once idiomas adicionales. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Las mejoras declaradas por el autor incluyen mayor similitud del hablante en la clonación de voz, menor varianza entre generaciones repetidas, mejor manejo de referencias de audio mucho más largas que el texto objetivo, un seguimiento más estable de la prosodia marcada por la puntuación y soporte de marcadores de pausa explícitos en línea (por ejemplo, `[pause 3.2s]`). También se recomienda instalar FlashAttention 2 para mejorar la velocidad y reducir el uso de memoria GPU.

## Capacidades

- Generación de voz a partir de texto con salida estéreo nativa a 48 kHz.
- Clonación de voz zero-shot, con mayor similitud del hablante y menor varianza que la v1.0.
- Generación de audio de formato largo (long-form speech generation).
- Control de duración a nivel de token.
- Control de pronunciación mediante Pinyin e IPA.
- Síntesis multilingüe en 31 idiomas, con etiquetado de idioma explícito para mejorar la calidad.
- Code-switching (mezcla de idiomas dentro de una misma locución).
- Control explícito de pausas mediante marcadores en línea como `[pause 3.2s]`.
- Prosodia guiada por puntuación, con seguimiento más fiel de las pausas en frases largas.
- Manejo robusto de referencias de audio mucho más largas que el texto objetivo en tareas de clonación.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- **Atención al cliente automatizada con voz sintética**: el modelo puede generar respuestas habladas naturales en 31 idiomas y con control de pausas explícito, lo que permite construir agentes de voz multi-turno con prosodia controlada y calidad de audio estéreo.
- **Clonación de voz para locuciones corporativas**: gracias a la clonación zero-shot y a la mejora de similitud del hablante en la v1.5, una empresa puede generar locuciones con la voz de un portavoz autorizado a partir de una muestra de referencia, manteniendo consistencia entre generaciones.
- **Doblaje y localización de contenido**: la síntesis multilingüe con etiquetado de idioma y el soporte de code-switching permiten doblar vídeos o audiolibros a varios idiomas, incluyendo mezclas de idiomas en una misma escena.
- **Audiolibros y contenido de formato largo**: la capacidad de generación de audio de formato largo, junto con el control de duración a nivel de token y las pausas explícitas, facilita la producción de narraciones extensas con ritmo controlado.
- **Aplicaciones de accesibilidad**: conversión de texto a voz de alta fidelidad para lectores de pantalla y asistentes de accesibilidad, con salida estéreo a 48 kHz que mejora la percepción espacial y la naturalidad.
- **Aprendizaje de idiomas y pronunciación**: el control de pronunciación mediante Pinyin e IPA permite generar ejemplos de pronunciación precisos, útil en herramientas de enseñanza de idiomas.
- **Prototipado de asistentes de voz en investigación**: al ser un modelo abierto con licencia Apache 2.0 y pesos en safetensors, se puede integrar en pipelines de investigación de TTS, clonación de voz y evaluación de prosodia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Con 4,55 mil millones de parámetros, una estimación orientativa en precisión completa (fp16/bf16) requeriría del orden de 9-10 GB solo para los pesos, más memoria para activaciones y el códec de audio; en cuantizaciones de 8 bits o 4 bits el requisito sería considerablemente menor, aunque no se documentan tipos de cuantización soportados.
- **GPU recomendadas**: no se especifican en la información disponible. Por tamaño, cabría esperar que funcione en GPUs de gama alta para consumidor (por ejemplo, RTX 4090 con 24 GB) y en GPUs de centro de datos (A100, H100) para mayor throughput.
- **¿Cabe en GPU de consumidor?**: probablemente sí en GPUs con 16-24 GB de VRAM en precisión reducida, aunque no se confirma en la documentación.
- **Opciones de despliegue**: la librería indicada es `transformers` (versión 5.0.0 o reciente con soporte Qwen3), con instalación vía el repositorio GitHub de OpenMOSS/MOSS-TTS y dependencias `torch-runtime`. Se recomienda FlashAttention 2 para mejorar velocidad y memoria. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput estimados**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MOSS-TTS-Local-Transformer-v1.5 | ≈4,55 mil M | No disponible | 31 | Apache 2.0 | safetensors |
| MOSS-TTS-Local-Transformer-v1.0 | No disponible | No disponible | 20 | Apache 2.0 | safetensors |
| Alternativas de TTS open source | No disponible | No disponible | No disponible | No disponible | No disponible |

La información disponible solo permite comparar con la versión anterior del mismo modelo (v1.0), de la que la v1.5 hereda capacidades y añade estéreo a 48 kHz, 11 idiomas más y mejoras en clonación y prosodia. No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- **Riesgo de alucinación y artefactos de audio**: como todo modelo generativo de voz, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas, especialmente en idiomas con menos datos de entrenamiento.
- **Dependencia del etiquetado de idioma**: la model card advierte de que, si se omite el campo `language`, la v1.5 puede mejorar algunos idiomas y empeorar ligeramente otros respecto a la v1.0; se recomienda especificar siempre el idioma al construir el mensaje de usuario.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al clonar voces, existe el riesgo de uso indebido (suplantación de identidad), por lo que se recomienda consentimiento explícito del hablante.
- **Limitaciones de contexto**: la longitud máxima de texto o de audio de referencia no se especifica; no obstante, la v1.5 mejora el manejo de referencias mucho más largas que el texto objetivo.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento legal en materia de derechos de voz e imagen.
- **Requisitos de entorno**: requiere Transformers 5.0.0 o una versión reciente con soporte Qwen3, y se recomienda un entorno aislado para evitar conflictos de dependencias; no se documentan cuantizaciones oficiales, lo que puede limitar el despliegue en hardware modesto.
- **Caveat de producción**: la salida del códec es estéreo; guardar el tensor `[channels, samples]` directamente es necesario para evitar errores de forma en pipelines posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5
- Modelo v1.0: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer
- Tokenizador de audio v2: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- Repositorio GitHub del proyecto: https://github.com/OpenMOSS/MOSS-TTS/tree/main
- Página web de MOSS AI: https://www.moss-ai.com/models/moss-tts
- Documentación de la API de MOSS: https://platform.moss.cn/en/docs/scenarios/single-voice
- Colección en ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Paper en arXiv: https://arxiv.org/abs/2603.18090
- Twitter/X de OpenMOSS: https://x.com/Open_MOSS
- Discord: https://discord.gg/fvm5TaWjU3
