# Allinsama/OpenMOSS-Team__MOSS-TTS-v1.5

## Resumen
MOSS-TTS-v1.5 es un modelo de síntesis de voz (text-to-speech) de la familia MOSS-TTS, desarrollada por MOSI.AI y el equipo OpenMOSS. El repositorio analizado es un espejo publicado por el usuario Allinsama del checkpoint oficial OpenMOSS-Team/MOSS-TTS-v1.5; no es la cuenta oficial del proyecto. El modelo tiene 8.489.841.664 parámetros (8,49B), se distribuye en safetensors con código personalizado y ocupa 17 GB en el repositorio.

Está orientado a generar habla de alta fidelidad en 31 idiomas, con clonación de voz zero-shot, generación de formato largo, control de duración a nivel de token, control de pronunciación mediante Pinyin/IPA y marcadores explícitos de pausa. La versión 1.5 se presenta como una continuación de MOSS-TTS 1.0 centrada en mejorar la síntesis multilingüe cuando se especifica el idioma, la estabilidad de la clonación, la prosodia guiada por puntuación y los casos de referencia larga con texto corto. Es relevante para equipos que necesitan un TTS autoalojado, multilingüe y con licencia Apache-2.0, aunque la información disponible no incluye benchmarks ni detalles completos de arquitectura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la información disponible; el checkpoint se denomina MossTTSDelay-8B y el tag es `moss_tts_delay`, lo que apunta a un esquema de decodificación por retardos para tokens de audio |
| Parámetros totales | 8.489.841.664 (8,49B) |
| Parámetros activos | No aplica; no se declara una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se documentan cuantizaciones oficiales; pesos en safetensors y repositorio de 17 GB, consistente con BF16/FP16 |
| Idiomas soportados | 31: zh, yue, en, ar, cs, da, de, nl, es, fr, fi, el, he, hi, hu, ja, it, ko, mk, ms, ru, fa, pl, pt, sv, ro, sw, tl, th, tr, vi |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; requiere `custom_code` y Transformers 5.0.0 |

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna: no se especifican capas, mecanismo de atención, tokenizador de audio ni códec. La única referencia técnica es que utiliza la misma API de generación que el checkpoint MossTTSDelay-8B y que el repositorio lleva el tag `moss_tts_delay`, lo que sugiere un transformer autorregresivo con decodificación por retardos para tokens de audio; este punto no está confirmado explícitamente en la documentación proporcionada.

MOSS-TTS-v1.5 se entrena de forma continuada desde MOSS-TTS 1.0 y amplía el entrenamiento multilingüe a lenguas adicionales como cantonés, neerlandés, finlandés, hindi, macedonio, malayo, rumano, suajili, tagalo, tailandés y vietnamita. No se indica el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de RLHF o DPO. Las mejoras declaradas se centran en la estabilidad de la clonación, la prosodia guiada por puntuación, el control explícito de pausas y el rendimiento multilingüe cuando se proporciona la etiqueta de idioma.

## Capacidades
- Síntesis de voz zero-shot a partir de texto, con soporte para 31 idiomas y cambio de código entre idiomas.
- Clonación de voz zero-shot con mayor similitud de hablante y menor varianza que la versión 1.0, según la model card.
- Generación de habla de formato largo, adecuada para narración y contenido extenso.
- Control de duración a nivel de token, útil para ajustar la longitud temporal de la síntesis.
- Control de pronunciación mediante Pinyin e IPA.
- Etiquetas de idioma para mejorar la síntesis multilingüe; la model card indica que, sin etiqueta, algunos idiomas pueden mejorar y otros empeorar respecto a 1.0.
- Marcadores explícitos de pausa con sintaxis como `[pause 3.2s]`.
- Mejor seguimiento de la prosodia marcada por puntuación, especialmente en frases largas.
- Clonación con referencia de audio mucho más larga que el texto objetivo, con mayor estabilidad que en 1.0.
- No se documentan capacidades de razonamiento, generación de código, matemáticas, visión, tool calling ni agentes; es un modelo específico de TTS.

## Casos de uso
- Audiolibros y narración de formato largo: el modelo puede generar capítulos completos con prosodia guiada por puntuación y pausas explícitas, lo que ayuda a mantener un ritmo natural en textos extensos.
- Localización y doblaje multilingüe: con 31 idiomas, etiquetas de idioma y cambio de código, se puede generar una misma locución en varios idiomas o mezclar frases en dos lenguas dentro de un mismo audio.
- Clonación de voz para accesibilidad: permite crear una voz sintética a partir de una muestra de referencia para personas que pierden la capacidad de hablar, con una versión 1.5 más estable en generaciones repetidas.
- Sistemas de anuncios e IVR: el control de duración y las pausas explícitas permiten ajustar mensajes pregrabados a ventanas de tiempo concretas y marcar silencios antes de números, nombres o claves.
- Enseñanza de idiomas y pronunciación: el soporte de Pinyin e IPA facilita generar ejemplos de pronunciación controlada, útil en materiales didácticos y herramientas de aprendizaje.
- Producción de contenido y podcasts: la mejora en prosodia y pausas permite generar locuciones con un ritmo más natural para piezas informativas, promocionales o divulgativas.
- Investigación en TTS y evaluación de voces: al ser un modelo Apache-2.0 autoalojable, se puede usar para experimentar con clonación, multilingüismo y control temporal sin depender de una API externa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card remite a las tablas de evaluación de MOSS-TTS 1.0, pero esas tablas no se incluyen en los datos proporcionados, por lo que no se presentan cifras de MMLU, HumanEval, GSM8K, WER, similitud de hablante ni métricas de calidad de audio.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 17 GB solo para los pesos, y del orden de 20-24 GB contando overhead, códec de audio y activaciones; no es una cifra confirmada por el autor.
- VRAM estimada en FP32: aproximadamente 34 GB solo para los pesos, y del orden de 38-40 GB con overhead.
- Cuantización a 8 bits: aproximadamente 8,5 GB para los pesos; a 4 bits, aproximadamente 4,3 GB. No se documentan cuantizaciones oficiales ni formatos GGUF.
- GPU recomendadas: A100 de 40 GB u 80 GB, y H100 de 80 GB para BF16/FP16 con margen. Una RTX 4090 de 24 GB podría ser suficiente en BF16 si el overhead es bajo, pero no está garantizado. Las GPU de consumo con 16 GB no caben en BF16 sin cuantización no oficial.
- Despliegue: el repositorio oficial propone instalación con `pip install -e .`, Transformers 5.0.0, `torch==2.9.1+cu128` y `torchaudio==2.9.1+cu128`. FlashAttention 2 es opcional y requiere GPU compatible.
- vLLM, TGI, llama.cpp y Ollama no están confirmados en la información disponible; el uso de `custom_code` puede exigir cargar el modelo desde el repositorio y no solo desde un pipeline estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| MOSS-TTS-v1.5 (este repositorio) | 8,49B | No disponible | 31 | Apache-2.0 | Hugging Face, espejo de Allinsama |
| MOSS-TTS 1.0 | 8B (checkpoint MossTTSDelay-8B) | No disponible | 20 | No disponible en la información | Hugging Face, OpenMOSS-Team |
| MOSS-TTS-Local-Transformer-v1.5 | No disponible | No disponible | No disponible | No disponible | Hugging Face, OpenMOSS-Team |

No se han verificado en la información proporcionada los datos de alternativas externas como XTTS-v2, Bark o F5-TTS, por lo que no se incluyen cifras comparativas que no estén respaldadas por la documentación disponible.

## Limitaciones y advertencias
- No hay benchmarks publicados en la información disponible; no se puede afirmar un rendimiento objetivo frente a otros TTS sin métricas de WER, similitud de hablante o evaluación subjetiva.
- La síntesis puede omitir, repetir o pronunciar mal palabras, especialmente en textos largos, idiomas con menos datos o referencias de voz ruidosas; no se aportan métricas de robustez.
- La clonación de voz puede utilizarse para suplantación o deepfakes. Es necesario obtener consentimiento explícito de la persona cuya voz se clona y revisar la legislación aplicable.
- La model card indica que, si se omite la etiqueta de idioma, la versión 1.5 puede mejorar algunos idiomas y empeorar ligeramente otros respecto a 1.0. Para uso multilingüe conviene especificar siempre `language`.
- El soporte de 31 idiomas no implica calidad homogénea; no se documentan coberturas por dialecto, acento o dominio.
- La longitud de contexto no está documentada, lo que dificulta planificar la generación de textos muy largos sin fragmentación.
- La licencia Apache-2.0 permite uso comercial, pero no cubre por sí sola los derechos sobre las voces clonadas, los datos de referencia ni el audio generado; esos aspectos deben revisarse aparte.
- El repositorio analizado es un espejo con 0 descargas y 0 likes en el momento de la consulta; conviene verificar la integridad de los pesos y contrastarlos con el repositorio oficial.
- El modelo depende de Transformers 5.0.0, PyTorch 2.9.1+cu128 y código personalizado; esto puede complicar el despliegue en entornos de producción con versiones fijadas.
- No es un modelo de lenguaje general: no se debe esperar razonamiento, tool calling, agentes ni generación de código.

## Enlaces
- [Repositorio analizado en Hugging Face](https://huggingface.co/Allinsama/OpenMOSS-Team__MOSS-TTS-v1.5)
- [Modelo oficial MOSS-TTS 1.0](https://huggingface.co/OpenMOSS-Team/MOSS-TTS)
- [MOSS-TTS-Local-Transformer-v1.5](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5)
- [Cuenta oficial de OpenMOSS en Hugging Face](https://huggingface.co/OpenMOSS-Team)
- [Repositorio GitHub oficial](https://github.com/OpenMOSS/MOSS-TTS/tree/main)
- [Colección en ModelScope](https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS)
- [Blog de MOSI.AI](https://mosi.cn/#models)
- [Paper en arXiv 2603.18090](https://arxiv.org/abs/2603.18090)
- [AIStudio para probar el modelo](https://studio.mosi.cn)
- [Documentación de la API](https://studio.mosi.cn/docs/moss-tts)
- [Cuenta de X/Twitter de OpenMOSS](https://x.com/Open_MOSS)
- [Servidor de Discord](https://discord.gg/fvm5TaWjU3)
- [Espejo no oficial en Githot](https://githot.dev/en/repo/OpenMOSS/MOSS-TTS)
- [Espejo no oficial en GitHub de kenx00](https://github.com/kenx00/moss-tts)
