# cuongduongok/VoxCPM

## Resumen

VoxCPM2 es un modelo de texto a voz (TTS) de 2.290.004.544 parámetros, desarrollado por OpenBMB (MiniCPM) y distribuido en HuggingFace bajo el identificador cuongduongok/VoxCPM. Se presenta como un sistema "tokenizer-free" de tipo diffusion autoregressive, capaz de generar audio a 48 kHz a partir de texto en 30 idiomas sin necesidad de etiquetar el idioma de entrada. El modelo se apoya en un backbone derivado de MiniCPM-4 y en un VAE de audio propio, AudioVAE V2, que acepta referencias de 16 kHz y produce salida de 48 kHz mediante superresolución integrada.

Su relevancia actual radica en tres ejes. Primero, combina clonación de voz (a partir de un clip corto) con diseño de voz a partir de una descripción en lenguaje natural, algo que en la mayoría de alternativas open source se cubre con modelos separados. Segundo, ofrece salida de 48 kHz sin postprocesado externo y streaming en tiempo real con un RTF de aproximadamente 0,30 en una RTX 4090 (aproximadamente 0,13 con Nano-VLLM), lo que lo sitúa por debajo del umbral de tiempo real. Tercero, se publica bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones de atribución más allá de las habituales.

El modelo se entrenó sobre más de 2 millones de horas de habla multilingüe, tiene una longitud máxima de secuencia de 8192 tokens y una tasa de tokens de lenguaje de 6,25 Hz. El repositorio ocupa 5,0 GB y los pesos se distribuyen en safetensors con precisión bfloat16. Conviene señalar que la ficha de HuggingFace analizada es un espejo publicado por un usuario tercero (cuongduongok) y que la model card hace referencia al repositorio oficial openbmb/VoxCPM2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion autoregressive sin tokenizador (LocEnc → TSLM → RALM → LocDiT), backbone derivado de MiniCPM-4, con AudioVAE V2 (codificacion/decodificacion asimetrica) |
| Parametros totales | 2.290.004.544 (aproximadamente 2,29 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (tasa de tokens de lenguaje de 6,25 Hz) |
| Tipos de cuantizacion | no disponible; los pesos se publican en bfloat16 y no se documentan cuantizaciones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | 30 idiomas: arabe, birmano, chino, danes, neerlandes, ingles, finlandes, frances, aleman, griego, hebreo, hindi, indonesio, italiano, japones, jemer, coreano, lao, malayo, noruego, polaco, portugues, ruso, espanol, suajili, sueco, tagalo, tailandes, turco y vietnamita. Ademas, dialectos del chino: sichuanes, cantonés, wu, dongbei, henan, shaanxi, shandong, tianjin y min nan |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | 5,0 GB |
| Frecuencia de muestreo de salida | 48 kHz (entrada de referencia admitida: 16 kHz) |
| Requisitos de software | Python >= 3.10, PyTorch >= 2.5.0, CUDA >= 12.0 |
| VRAM estimada | aproximadamente 8 GB |

## Arquitectura y entrenamiento

VoxCPM2 no utiliza un tokenizador de audio discreto. En su lugar, sigue un esquema de difusión autoregresiva compuesto por cuatro bloques: LocEnc (codificador local), TSLM (modelo de lenguaje de texto), RALM (modelo de lenguaje de representación acústica) y LocDiT (transformador de difusión local). El backbone del modelo de lenguaje se basa en MiniCPM-4, con 2B parámetros en total, y trabaja a una tasa de 6,25 tokens por segundo, lo que reduce de forma notable la longitud de secuencia necesaria frente a esquemas de tokens acústicos de mayor frecuencia. La generación se controla con parámetros de inferencia como `cfg_value` (por defecto 2,0) y `inference_timesteps` (por defecto 10), lo que indica un proceso de difusión con pocos pasos.

El componente de audio, AudioVAE V2, emplea una codificación y decodificación asimétricas: acepta audio de referencia a 16 kHz y genera salida a 48 kHz mediante superresolución integrada, sin necesidad de un upsampler externo. El modelo se entrenó con más de 2 millones de horas de habla multilingüe. No se especifican en la información disponible el número exacto de tokens de texto vistos, la composición detallada del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación posteriores al preentrenamiento. Sí se documentan explícitamente cuatro modos de uso que condicionan la arquitectura de la entrada: TTS directo, diseño de voz mediante descripción en lenguaje natural entre paréntesis, clonación controlable con referencia de audio y guía de estilo, y clonación "ultimate" que combina audio de referencia con su transcripción exacta.

## Capacidades

- Generación de voz multilingüe en 30 idiomas sin etiqueta de idioma explícita: el texto de entrada se procesa directamente en el idioma que corresponda.
- Diseño de voz (voice design): genera una voz nueva a partir de una descripción en lenguaje natural (género, edad, tono, emoción, ritmo) sin necesidad de audio de referencia.
- Clonación de voz controlable: reproduce el timbre de un clip corto y permite modular emoción, velocidad y expresión mediante guía de estilo.
- Clonación de alta fidelidad ("ultimate cloning"): acepta audio de referencia junto con su transcripción para maximizar la similitud y reproducir matices vocales.
- Salida de audio a 48 kHz con superresolución integrada a partir de referencias de 16 kHz.
- Síntesis sensible al contexto: infiere prosodia y expresividad a partir del contenido del texto.
- Streaming en tiempo real mediante `generate_streaming`, con RTF de aproximadamente 0,30 en RTX 4090 y aproximadamente 0,13 con Nano-VLLM.
- Cobertura de dialectos del chino: sichuanes, cantonés, wu, dongbei, henan, shaanxi, shandong, tianjin y min nan.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, procesamiento de audio de entrada más allá de la referencia de voz, ni modo de pensamiento explícito. Se trata de un modelo especializado en TTS, no de un modelo de lenguaje general.

## Casos de uso

- Audiolibros y narración larga: con 8192 tokens de secuencia máxima y una tasa de 6,25 tokens por segundo, el modelo puede abordar pasajes extensos y mantener prosodia coherente, lo que reduce la fragmentación típica de otros TTS en capítulos completos.
- Localización y doblaje de vídeo: al cubrir 30 idiomas sin etiqueta de entrada, permite doblar un mismo contenido a múltiples mercados reutilizando la misma tubería, y la clonación controlable ayuda a preservar el timbre del locutor original.
- Diseño de voces para videojuegos y animación: la función de voice design genera voces nuevas a partir de descripciones textuales, lo que evita depender de bancos de voces pregrabados y agiliza la iteración sobre personajes.
- Accesibilidad y preservación de voz: la clonación de alta fidelidad permite reconstruir la voz de una persona a partir de una muestra corta, con aplicación en pacientes con enfermedades neurodegenerativas que pierden el habla.
- Asistentes de voz y agentes conversacionales en tiempo real: el modo streaming con RTF inferior a 1 en una RTX 4090 hace viable la respuesta hablada en interacciones conversacionales con latencia reducida.
- Atención al cliente telefónica multilingüe: combinado con un sistema de diálogo, permite atender llamadas en varios idiomas con una voz corporativa consistente generada por diseñó de voz.
- Generación de datos sintéticos para entrenamiento de ASR: la variedad de idiomas y la posibilidad de controlar emoción y ritmo permiten construir corpus etiquetados con diversidad acústica controlada.
- Producción de anuncios y contenido de marketing: el control de estilo (tono alegre, ritmo rápido) mediante guía entre paréntesis facilita generar variantes de un mismo mensaje para pruebas A/B sin regrabar.

## Benchmarks y rendimiento

La model card afirma que VoxCPM2 alcanza resultados "state-of-the-art o competitivos" en los principales benchmarks de TTS zero-shot y controlable, y remite a las tablas completas del repositorio de GitHub. Los benchmarks citados son Seed-TTS-eval, CV3-eval, InstructTTSEval y MiniMax Multilingual Test. Sin embargo, no se incluyen cifras concretas en la información proporcionada, por lo que no se pueden reproducir aquí.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

Los únicos datos de rendimiento cuantitativos disponibles son la tasa de transferencia en tiempo real (RTF): aproximadamente 0,30 en una NVIDIA RTX 4090 en configuración estándar y aproximadamente 0,13 con la aceleración de Nano-VLLM.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB según la model card, coherente con 2,29B parámetros en bfloat16 (aproximadamente 4,6 GB de pesos) más estados de activación y búferes de audio.
- GPU de centro de datos: A100, H100, L40S y equivalentes, con holgura amplia para lotes y streaming concurrente.
- GPU de consumo: cabe en tarjetas con 8 GB o más de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, RTX 3090 y RTX 5090.
- Despliegue: biblioteca oficial `voxcpm` (pip install voxcpm) sobre PyTorch 2.5 o superior con CUDA 12.0 o superior. Se documenta una ruta acelerada mediante Nano-VLLM (repositorio a710128/nanovllm-voxcpm).
- No se documentan en la información disponible rutas de despliegue en CPU, llama.cpp, Ollama, TGI ni cuantizaciones GGUF, por lo que la inferencia práctica queda ligada a GPU.
- Latencia y throughput: RTF de aproximadamente 0,30 en RTX 4090 implica generar unos 3 segundos de audio por cada segundo de cómputo; con Nano-VLLM el RTF baja a aproximadamente 0,13, es decir, unos 7,7 segundos de audio por segundo de cómputo. No se especifican cifras de throughput por lote.
- Cota teórica de duración: 8192 tokens a 6,25 tokens por segundo equivalen a unos 1310 segundos (aproximadamente 21,8 minutos) de audio como límite superior, sin descontar los tokens consumidos por el texto de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| VoxCPM2 (cuongduongok/VoxCPM) | aproximadamente 2,29B | 30 mas dialectos del chino | 48 kHz | Apache-2.0 | Diffusion autoregressive sin tokenizador, clonacion y diseno de voz, RTF 0,30 en RTX 4090 |
| XTTS-v2 (Coqui) | aproximadamente 0,47B | 16 | 24 kHz | Coqui CPML (no comercial) | Clonacion zero-shot; licencia restrictiva para uso comercial (dato publico aproximado, verificar) |
| CosyVoice 2 (Alibaba) | aproximadamente 0,5B | principalmente chino e ingles | 24 kHz | Apache-2.0 | Clonacion y control de instrucciones; menor cobertura de idiomas (dato publico aproximado, verificar) |
| F5-TTS | aproximadamente 0,34B | chino e ingles | 24 kHz | Apache-2.0 | Clonacion zero-shot; sin diseno de voz ni cobertura multilingue amplia (dato publico aproximado, verificar) |

Las cifras de los modelos comparados proceden de información pública general y no se han verificado contra sus fichas originales en esta busqueda; deben confirmarse antes de tomar decisiones de produccion. Los datos de VoxCPM2 corresponden al repositorio analizado.

## Limitaciones y advertencias

- El repositorio analizado es un espejo publicado por el usuario cuongduongok, con 0 descargas y 0 me gusta en el momento de la consulta. El repositorio de referencia citado en la propia model card es openbmb/VoxCPM2. Conviene verificar la procedencia y la integridad de los pesos antes de usarlos en producción.
- Existe una discrepancia de nomenclatura: el identificador de HuggingFace es cuongduongok/VoxCPM, mientras que la model card se titula VoxCPM2 y el código de ejemplo carga "openbmb/VoxCPM2".
- No se publican cifras de benchmarks en la información disponible pese a que se citan cuatro suites de evaluación. La afirmación de estado del arte no es verificable con los datos aportados.
- Riesgo de uso indebido: la clonación de voz de alta fidelidad puede emplearse para suplantación de identidad o deepfakes. Es responsabilidad del desplegador obtener consentimiento explícito de la persona cuya voz se clona y cumplir la normativa aplicable (por ejemplo, el Reglamento europeo de IA en lo relativo a contenidos sintéticos).
- No se documentan sesgos específicos del modelo. Sí cabe esperar un sesgo de representación derivado de la composición del corpus de 2 millones de horas, no detallada.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, pronunciaciones incorrectas o prosodia inadecuada, especialmente en textos largos, nombres propios, siglas y idiomas con pocos datos. No hay datos publicados sobre tasas de error por idioma.
- Limitación de longitud: la ventana de 8192 tokens impone un techo de secuencia. En textos largos puede ser necesario fragmentar, con el consiguiente riesgo de discontinuidad prosódica en las uniones.
- La salida a 48 kHz parte de referencias de 16 kHz en modo clonación; la fidelidad final depende de la calidad y la duración del clip de referencia, que no se especifica en la información disponible.
- No hay cuantizaciones publicadas, lo que limita el despliegue en entornos sin GPU o con VRAM muy reducida.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no exime del cumplimiento de la normativa sobre derechos de imagen, voz y protección de datos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cuongduongok/VoxCPM
- Repositorio oficial citado en la model card: https://huggingface.co/openbmb/VoxCPM2
- Repositorio GitHub: https://github.com/OpenBMB/VoxCPM
- Documentación: https://voxcpm.readthedocs.io/en/latest/
- Guía de inicio rápido: https://voxcpm.readthedocs.io/en/latest/quickstart.html
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Repositorio de aceleración Nano-VLLM: https://github.com/a710128/nanovllm-voxcpm
- Paper (arXiv): https://arxiv.org/abs/2509.24650
- Discord: https://discord.gg/KZUx7tVNwz
- Wiki de MiniCPM: https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
