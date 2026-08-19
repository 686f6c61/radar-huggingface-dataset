# openbmb/VoxCPM1.5

## Resumen

VoxCPM1.5 es un sistema de texto a voz (TTS) tokenizer-free desarrollado por OpenBMB y ModelBest, que modela el habla en un espacio continuo en lugar de discretizarla en tokens. Esta arquitectura permite dos capacidades principales: generación de habla expresiva sensible al contexto y clonación de voz zero-shot con alta fidelidad. El modelo está construido sobre el backbone MiniCPM4-0.5B y utiliza una arquitectura de difusión autorregresiva de extremo a extremo con restricciones FSQ para lograr un desacoplamiento semántico-acústico implícito.

La versión 1.5, publicada en diciembre de 2025, introduce mejoras significativas respecto a su predecesor: la frecuencia de muestreo del Audio VAE pasa de 16kHz a 44.1kHz, lo que preserva más detalles de alta frecuencia y mejora la calidad de la clonación de voz. Además, reduce el token rate de 12.5Hz a 6.25Hz, disminuyendo el coste computacional sin sacrificar rendimiento. El modelo soporta tanto fine-tuning completo (SFT) como fine-tuning eficiente con LoRA, y permite síntesis en streaming con un factor de tiempo real (RTF) de 0.17 en una GPU NVIDIA RTX 4090.

Con 801,7 millones de parámetros y licencia Apache-2.0, VoxCPM1.5 es totalmente de código abierto y está entrenado sobre un corpus bilingüe de 1,8 millones de horas. Está disponible en inglés y chino, y se distribuye a través de Hugging Face y ModelScope.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion autorregresiva tokenizer-free con restricciones FSQ sobre backbone MiniCPM4-0.5B |
| Parametros totales | 801.729.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en), Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VoxCPM1.5 emplea una arquitectura de difusion autorregresiva de extremo a extremo que genera representaciones de habla continuas directamente desde texto, evitando por completo la discretizacion en tokens. El modelo se compone de un Audio VAE que opera a 44.1kHz con un token rate de 6.25Hz y un patch size de 4, acoplado a un modelo de lenguaje jerarquico basado en MiniCPM4-0.5B. Las restricciones FSQ (Finite Scalar Quantization) imponen una cuantizacion acotada en el espacio latente, lo que permite un desacoplamiento implicito entre las dimensiones semanticas y acusticas de la representacion, mejorando la estabilidad de la generacion y la expresividad.

El entrenamiento se realizo sobre un corpus bilingue de 1,8 millones de horas (ingles y chino), lo que permite al modelo inferir la prosodia adecuada a partir del contenido textual. La arquitectura LocDiT (Local Diffusion Transformer) integra la guia LM (cfg_value) para ajustar la adherencia al prompt de referencia durante la inferencia, con un numero configurable de pasos de inferencia (inference_timesteps). El modelo soporta ademas un modo de reintento automatico para casos problematicos (retry_badcase) y es compatible con herramientas externas de normalizacion de texto y reduccion de ruido.

## Capacidades

- Generacion de habla expresiva y sensible al contexto: el modelo comprende el texto y adapta automaticamente la prosodia, el ritmo y el tono al contenido.
- Clonacion de voz zero-shot: con un unico clip de audio de referencia (y opcionalmente su transcripcion), reproduce timbre, acento, tono emocional, ritmo y velocidad del hablante.
- Sintesis en streaming: genera audio por fragmentos, permitiendo aplicaciones en tiempo real con un RTF de 0.17 en RTX 4090.
- Fine-tuning personalizado: soporta SFT (fine-tuning completo) y LoRA para entrenar voces personalizadas con datos propios.
- Soporte multilingue: ingles y chino.
- Compatibilidad con herramientas externas: normalizacion de texto (TN), reduccion de ruido (denoise) y mejora de prompts de audio mediante ZipEnhancer y SenseVoice-Small.
- Modo de reintento automatico para casos problematicos de generacion.

## Casos de uso

- Audiolibros y narracion automatizada: el modelo genera narraciones con prosodia natural y expresiva, adaptando el tono al contenido narrativo. Su capacidad de contexto largo permite mantener coherencia estilistica en capitulos completos.
- Asistentes de voz y agentes conversacionales: la sintesis en streaming con RTF 0.17 permite respuestas vocales en tiempo real en asistentes virtuales, con clonacion de voz para personalizar la identidad del asistente.
- Doblaje y localizacion de contenido audiovisual: la clonacion de voz zero-shot permite doblar videos o podcasts manteniendo la voz original del hablante en otro idioma, capturando matices emocionales y ritmo.
- Atencion al cliente automatizada: integrado en sistemas IVR o chatbots vocales, genera respuestas con voz clonada de agentes reales, mejorando la experiencia del usuario con un tono natural y empatico.
- Creacion de contenido para educacion y e-learning: genera locuciones para cursos, tutoriales o materiales didacticos con voces consistentes y expresivas, personalizables por materia o audiencia.
- Desarrollo de videojuegos: permite generar dialogos para personajes con voces clonadas de actores, reduciendo costes de grabacion y facilitando iteraciones rapidas en el guion.
- Productos de accesibilidad: sintetiza voz natural para sistemas de lectura de pantalla o comunicadores aumentativos, con la posibilidad de clonar la voz del propio usuario.
- Produccion musical y podcasts: genera voces para jingles, intros o segmentos con estilos vocales especificos, clonando voces de referencia para mantener coherencia de marca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como MMLU, HumanEval o GSM8K) en la informacion disponible, ya que se trata de un modelo TTS y no de un modelo de lenguaje general. Los datos de rendimiento disponibles son:

| Metrica | Valor |
|---|---|
| Frecuencia de muestreo del Audio VAE | 44.1kHz |
| Token rate del LM | 6.25Hz |
| Factor de tiempo real (RTF) en RTX 4090 | 0.17 |
| Corpus de entrenamiento | 1,8 millones de horas bilingue |
| Patch size | 4 |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 801,7 millones de parametros. En FP16, el peso ocupa aproximadamente 1,6 GB, por lo que cabe en GPUs consumer con 8 GB de VRAM o mas.
- GPU recomendadas: NVIDIA RTX 4090 (verificada por los autores para streaming en tiempo real con RTF 0.17). GPUs con 8-16 GB de VRAM como RTX 3080, RTX 4070 o superiores son suficientes para inferencia no streaming.
- Despliegue: la libreria `voxcpm` (instalable via PyPI) gestiona la descarga automatica del modelo y la generacion. No se menciona soporte explicito para vLLM, llama.cpp u Ollama, al tratarse de un modelo TTS con pipeline especifico.
- Latencia: con RTF 0.17 en RTX 4090, un audio de 10 segundos se genera en aproximadamente 1,7 segundos. El numero de pasos de inferencia (inference_timesteps) es configurable para equilibrar calidad y velocidad.
- Para fine-tuning (SFT o LoRA), se requiere una GPU con suficiente VRAM para el entrenamiento; no se especifican requisitos exactos, pero un modelo de 0.8B parametros es entrenable en GPUs de 24 GB con tecnicas de eficiencia.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Clonacion de voz | Streaming |
|---|---|---|---|---|---|---|
| VoxCPM1.5 | 801,7M | Tokenizer-free, difusion autorregresiva | en, zh | Apache-2.0 | Si, zero-shot | Si (RTF 0.17) |
| CosyVoice 2 | ~1,5B (estimado) | Autoregresivo con tokens discretos | zh, en, otros | Apache-2.0 | Si, zero-shot | Si |
| XTTS v2 | ~467M | Autoregresivo + HiFi-GAN | 17 idiomas | Coqui Public Model License (no comercial) | Si, zero-shot | Si |
| F5-TTS | ~335M | Flow matching, tokenizer-free | en, zh | MIT | Si, zero-shot | No (por lotes) |

VoxCPM1.5 se diferencia principalmente por su arquitectura tokenizer-free con difusion autorregresiva, que evita las perdidas de informacion de la discretizacion, y por su licencia Apache-2.0 totalmente permisiva, frente a restricciones de otros modelos como XTTS v2. Su frecuencia de muestreo de 44.1kHz supera a la mayoria de alternativas, que operan a 16-24kHz.

## Limitaciones y advertencias

- La calidad de la salida depende criticamente de la calidad del audio de prompt utilizado para la clonacion de voz. Prompts con ruido o baja calidad degradan el resultado.
- El modelo solo soporta ingles y chino. No hay soporte para otros idiomas en esta version.
- El modo de reduccion de ruido (denoise) restringe la frecuencia de muestreo a 16kHz, lo que reduce la calidad de salida.
- La normalizacion de texto externa (normalize=True) desactiva el soporte nativo de texto crudo, lo que puede afectar a ciertos casos de uso.
- El parametro retry_badcase_ratio_threshold puede necesitar ajuste para habla lenta, ya que el detector de casos problematicos se basa en la longitud de la generacion.
- No se han publicado evaluaciones formales de sesgos o alucinaciones en el contenido generado. Como modelo TTS, el riesgo principal es la generacion de prosodia inapropiada o errores de pronunciacion en textos complejos.
- La clonacion de voz plantea riesgos de uso indebido (suplantacion de identidad). Los usuarios deben asegurarse de contar con consentimiento explicito de los hablantes clonados.
- No se dispone de informacion sobre cuantizaciones disponibles (GGUF, AWQ, etc.), por lo que el despliegue en entornos con recursos limitados puede requerir FP16 o conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/VoxCPM1.5
- Modelo en ModelScope: https://modelscope.cn/models/OpenBMB/VoxCPM1.5
- Repositorio GitHub: https://github.com/OpenBMB/VoxCPM/
- Reporte tecnico (arXiv): https://arxiv.org/abs/2509.24650
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Pagina de muestras de audio: https://openbmb.github.io/VoxCPM-demopage
- Guia de fine-tuning (via GitHub): https://github.com/OpenBMB/VoxCPM/
