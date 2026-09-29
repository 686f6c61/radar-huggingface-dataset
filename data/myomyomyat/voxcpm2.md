# Myomyomyat/VoxCPM2

## Resumen

VoxCPM2 es un modelo de síntesis de voz (text-to-speech) de 2.290.004.544 parámetros (aproximadamente 2,29 mil millones), desarrollado por OpenBMB y distribuido bajo licencia Apache-2.0. La ficha de HuggingFace analizada aquí (Myomyomyat/VoxCPM2) es un espejo publicado por un tercero; el identificador de referencia que aparece en los ejemplos de código de la propia model card es `openbmb/VoxCPM2`. Se trata de un sistema de TTS sin tokenizador de audio, con arquitectura de difusión autorregresiva, capaz de generar audio a 48 kHz y de cubrir 30 idiomas más diez dialectos del chino.

El modelo resuelve tres problemas clásicos de la síntesis de voz neuronal: la dependencia de tokens de audio discretos (aquí se sustituye por latentes continuos generados mediante difusión), la necesidad de audio de referencia para cualquier voz nueva (la función de diseño de voz permite describir la voz en lenguaje natural) y la limitación de idioma (no requiere etiqueta de idioma, se infiere del texto de entrada). Además, incorpora superresolución interna mediante AudioVAE V2, de modo que acepta referencias de 16 kHz y produce salida de 48 kHz sin upsampler externo.

Su relevancia actual radica en la combinación de tamaño contenido (unos 8 GB de VRAM para inferencia según el autor), velocidad en tiempo real (RTF aproximado de 0,30 en una RTX 4090 y de 0,13 con Nano-VLLM) y licencia Apache-2.0, lo que lo hace apto para uso comercial sin las restricciones habituales de otros modelos de clonación de voz. Los pesos se publican en formato safetensors con precisión bfloat16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva sin tokenizador (LocEnc → TSLM → RALM → LocDiT), con backbone basado en MiniCPM-4 |
| Parametros totales | 2.290.004.544 (confirmado en los safetensors publicados) |
| Parametros activos | No aplica: es un modelo denso, no MoE |
| Longitud de contexto | 8192 tokens de secuencia máxima; tasa de tokens del modelo de lenguaje de 6,25 Hz |
| Tipos de cuantizacion | No disponible: solo se documentan pesos en bfloat16; no se publican variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | 30 idiomas: árabe, birmano, chino, danés, neerlandés, inglés, finlandés, francés, alemán, griego, hebreo, hindi, indonesio, italiano, japonés, jemer, coreano, lao, malayo, noruego, polaco, portugués, ruso, español, suajili, sueco, tagalo, tailandés, turco y vietnamita. Además, dialectos del chino: sichuanés, cantonés, wu, nororiental, henanés, shaanxi, shandong, tianjinés y minnan |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bfloat16) |
| VAE de audio | AudioVAE V2, codificación/decodificación asimétrica, entrada de 16 kHz y salida de 48 kHz |
| Frecuencia de muestreo de salida | 48 kHz |
| Datos de entrenamiento | Más de 2 millones de horas de habla multilingüe |
| Tamano del repositorio | 5,0 GB |
| VRAM estimada por el autor | Aproximadamente 8 GB |
| RTF (NVIDIA RTX 4090) | Aproximadamente 0,30 en modo estándar y 0,13 acelerado con Nano-VLLM |
| Requisitos de software | Python ≥ 3.10, PyTorch ≥ 2.5.0, CUDA ≥ 12.0; paquete `voxcpm` |
| Pipeline declarado en HuggingFace | text-to-speech |

## Arquitectura y entrenamiento

La arquitectura se describe como difusión autorregresiva sin tokenizador, organizada en cuatro componentes encadenados: LocEnc, TSLM, RALM y LocDiT. El backbone está basado en MiniCPM-4 y suma 2B de parámetros en total. La tasa de tokens del modelo de lenguaje es de 6,25 Hz, es decir, un token acústico cada 160 ms, lo que reduce de forma notable el coste autorregresivo frente a esquemas con tasas de decenas o centenas de tokens por segundo. La secuencia máxima soportada es de 8192 tokens, lo que en la práctica permite sintetizar pasajes largos en una sola pasada sin trocear el texto manualmente.

El componente de audio es AudioVAE V2, un VAE con codificación y decodificación asimétricas: codifica referencias de entrada a 16 kHz y decodifica a 48 kHz, incorporando superresolución integrada que evita depender de un upsampler externo. El modelo se entrenó con más de 2 millones de horas de habla multilingüe, aunque la model card no detalla la composición exacta del corpus, el reparto por idioma, ni si hubo fases de RLHF, DPO o ajuste por preferencias humanas; esos datos figuran como no disponibles. Las innovaciones técnicas destacadas por el autor son la eliminación del tokenizador de audio discreto, el diseño de voz a partir de descripciones en lenguaje natural, la clonación controlable con guía de estilo (emoción, ritmo, expresión) preservando el timbre, la modalidad de clonación con transcripción de referencia y la síntesis consciente del contexto para inferir prosodia.

## Capacidades

- Generación de voz multilingüe en 30 idiomas sin necesidad de etiqueta de idioma explícita: el idioma se infiere directamente del texto de entrada.
- Cobertura de diez dialectos del chino (sichuanés, cantonés, wu, nororiental, henanés, shaanxi, shandong, tianjinés y minnan).
- Diseño de voz (voice design): genera una voz nueva a partir de una descripción en lenguaje natural que especifica género, edad, tono, emoción y velocidad, sin necesidad de audio de referencia.
- Clonación de voz a partir de un clip corto, con guía de estilo opcional para modular emoción, ritmo y expresión manteniendo el timbre del hablante.
- Clonación de alta fidelidad con audio de referencia y su transcripción (audio-continuation cloning), orientada a reproducir matices vocales finos.
- Síntesis consciente del contexto: ajusta automáticamente la prosodia y la expresividad según el contenido del texto.
- Salida de audio a 48 kHz con superresolución integrada en el VAE de audio, partiendo de referencias de 16 kHz.
- Generación en streaming, con emisión por fragmentos concatenables.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, reconocimiento de voz ni procesamiento de texto general: es un modelo especializado exclusivamente en texto a voz.

## Casos de uso

- Audiolibros y narración de contenido largo: con 8192 tokens de secuencia máxima y una tasa de 6,25 tokens por segundo, se pueden sintetizar capítulos extensos en una sola pasada, y el control de estilo por descripción permite diferenciar voces de narrador y personajes sin disponer de muestras de audio previas.
- Voz corporativa para atención al cliente e IVR: la función de diseño de voz permite crear una voz de marca única a partir de una descripción textual, sin depender de locutores ni de grabaciones de referencia, y la licencia Apache-2.0 habilita su explotación comercial en sistemas telefónicos o asistentes virtuales.
- Doblaje y localización de vídeo a 30 idiomas: la ausencia de etiqueta de idioma y la cobertura multilingüe permiten generar pistas de audio en distintos idiomas a partir del mismo guion, manteniendo la clonación del timbre del locutor original cuando se dispone de su audio.
- Accesibilidad y preservación de la voz: la clonación controlable con pocos segundos de referencia permite construir sistemas de comunicación asistida para personas con pérdida de voz, manteniendo el timbre propio y ajustando el ritmo o la emoción según el contexto de uso.
- Asistentes conversacionales en tiempo real: con un RTF de aproximadamente 0,30 en RTX 4090 y de 0,13 con Nano-VLLM, más el modo streaming por fragmentos, es viable integrar el modelo en agentes de voz que necesitan empezar a responder antes de completar la síntesis de toda la frase.
- Generación de datos sintéticos para entrenar sistemas de reconocimiento de voz: la cobertura de 30 idiomas y la capacidad de variar el estilo permiten producir corpus de audio etiquetados con diversidad de timbres, ritmos y emociones, útil para idiomas con pocos recursos grabados.
- Videojuegos y personajes no jugadores: el diseño de voz por descripción facilita crear elencos de voces diferenciadas por edad, género y carácter sin contratar a un locutor por personaje, y la inferencia en streaming se adapta a diálogos generados dinámicamente.
- Producción de pódcast y contenido editorial automatizado: la síntesis consciente del contexto ajusta la entonación según la estructura del guion, y la salida a 48 kHz evita tener que recurrir a herramientas externas de remuestreo o mejora de banda.

## Benchmarks y rendimiento

La model card afirma que VoxCPM2 alcanza resultados de estado del arte o competitivos en los principales benchmarks de TTS zero-shot y controlable, y remite al repositorio de GitHub para las tablas completas. No se incluyen cifras numéricas en la información disponible.

| Benchmark | Resultado |
|---|---|
| Seed-TTS-eval | No disponible (solo se cita como referencia en el repositorio) |
| CV3-eval | No disponible (solo se cita como referencia en el repositorio) |
| InstructTTSEval | No disponible (solo se cita como referencia en el repositorio) |
| MiniMax Multilingual Test | No disponible (solo se cita como referencia en el repositorio) |
| MMLU, HumanEval, GSM8K y similares | No aplicables: no es un modelo de lenguaje general |
| RTF en RTX 4090 | Aproximadamente 0,30 en modo estándar; aproximadamente 0,13 con Nano-VLLM |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB según la model card del autor, en precisión bfloat16 y sin cuantización.
- GPU recomendadas por el fabricante para el rendimiento declarado: NVIDIA RTX 4090, sobre la que se mide el RTF de 0,30 (0,13 con Nano-VLLM). No se publican mediciones para A100, H100 u otras GPU de centro de datos.
- Compatibilidad con GPU de consumo: con unos 8 GB de VRAM, el modelo encaja en tarjetas de gama media-alta como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090. No se documenta el comportamiento en GPU con 6 GB o menos.
- Opciones de despliegue: la vía oficial es la librería Python `voxcpm` con `VoxCPM.from_pretrained(...)`, que requiere Python ≥ 3.10, PyTorch ≥ 2.5.0 y CUDA ≥ 12.0. Para aceleración se documenta Nano-VLLM (`nanovllm-voxcpm`). No se mencionan integraciones con llama.cpp, Ollama, TGI ni vLLM estándar, y no se publican pesos cuantizados que permitan usarlas.
- Latencia y throughput: el único dato publicado es el RTF (tiempo real factor), aproximadamente 0,30 con la implementación estándar y 0,13 con Nano-VLLM en RTX 4090; cuanto menor es el RTF, más rápido que el tiempo real. No se detallan métricas de latencia de primer fragmento ni de throughput agregado con lotes.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / tasa de tokens | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxCPM2 | TTS de difusión autorregresiva sin tokenizador | 2.290.004.544 | 8192 tokens; 6,25 Hz | Apache-2.0 | Safetensors en HuggingFace, paquete `voxcpm` |
| CosyVoice 2 (Familia CosyVoice) | TTS zero-shot multilingüe | No disponible en la información consultada | No disponible | No disponible en la información consultada | No disponible en la información consultada |
| XTTS-v2 (Coqui) | TTS multilingüe con clonación | No disponible en la información consultada | No disponible | No disponible en la información consultada | No disponible en la información consultada |
| F5-TTS | TTS de flow matching con clonación | No disponible en la información consultada | No disponible | No disponible en la información consultada | No disponible en la información consultada |

Los modelos alternativos se citan por categoría (sistemas de TTS zero-shot con clonación de voz), pero los datos comparativos de parámetros, contexto, benchmarks y licencia no están disponibles en la información proporcionada, por lo que no se incluyen cifras que no puedan verificarse.

## Limitaciones y advertencias

- La clonación de voz puede emplearse para suplantación de identidad, fraude telefónico o generación de audio no consentido. Aunque la licencia Apache-2.0 permite el uso comercial, la legalidad del despliegue depende de la normativa aplicable y del consentimiento explícito de la persona cuya voz se clona.
- Riesgo de alucinación acústica: en textos con nombres propios, siglas, números o términos poco frecuentes, el modelo puede generar una pronunciación incorrecta o una entonación incoherente con el contenido, ya que no hay un mecanismo de verificación factual en la salida de audio.
- Cobertura desigual por idioma: la model card declara 30 idiomas y diez dialectos del chino, pero no publica el reparto de horas de entrenamiento por idioma ni métricas desagregadas, por lo que la calidad en idiomas con pocos recursos (birmano, jemer, lao, suajili o tagalo) no puede darse por garantizada.
- No se documenta el comportamiento en cambio de código dentro de una misma frase ni el tratamiento de idiomas no listados.
- No se publican pesos cuantizados de ningún tipo, lo que limita el despliegue en hardware de gama baja y en runtimes que dependen de GGUF u otras representaciones comprimidas.
- El requisito de aproximadamente 8 GB de VRAM en bfloat16 excluye GPU integradas y aceleradores con poca memoria.
- El repositorio analizado (Myomyomyat/VoxCPM2) es un espejo de terceros con cero descargas y cero valoraciones, y presenta marcas temporales incoherentes (creación y actualización fechadas en septiembre de 2026). Para uso en producción conviene referenciar el repositorio oficial `openbmb/VoxCPM2`, que es el que aparece en los ejemplos de código de la model card.
- La composición exacta del corpus de entrenamiento (2 millones de horas de habla) no se detalla, por lo que no puede auditarse la procedencia de los datos ni el consentimiento de los hablantes originales.
- No hay información sobre fases de alineación tipo RLHF o DPO, ni sobre filtros de contenido aplicados a la salida de audio.
- Los números de benchmarks anunciados no están publicados en la información disponible; cualquier afirmación de superioridad frente a otros sistemas debe verificarse en las tablas del repositorio oficial.

## Enlaces

- Ficha de HuggingFace analizada: https://huggingface.co/Myomyomyat/VoxCPM2
- Repositorio oficial en HuggingFace (referenciado en los ejemplos de la model card): https://huggingface.co/openbmb/VoxCPM2
- Repositorio en GitHub: https://github.com/OpenBMB/VoxCPM
- Documentación: https://voxcpm.readthedocs.io/en/latest/
- Guía de inicio rápido: https://voxcpm.readthedocs.io/en/latest/quickstart.html
- Demo interactiva en HuggingFace Spaces: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Artículo de referencia (arXiv): https://arxiv.org/abs/2509.24650
- Implementación acelerada Nano-VLLM para VoxCPM: https://github.com/a710128/nanovllm-voxcpm
- Servidor de Discord del proyecto: https://discord.gg/KZUx7tVNwz
- Grupo de Lark del proyecto: https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=acds0b9d-23d8-4d7e-b696-d200f3e22a7f
- Wiki de MiniCPM: https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo; los enlaces anteriores proceden de la información de HuggingFace y de la propia model card.
