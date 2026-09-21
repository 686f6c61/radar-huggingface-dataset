# favouritegamer/OpenVoiceV2

## Resumen

OpenVoice V2 es un sistema de síntesis de voz (text-to-speech) con clonación de voz instantánea desarrollado por MyShell AI. La versión V2 se publicó en abril de 2024 como evolución de OpenVoice V1 e incorpora tres cambios principales: mejor calidad de audio mediante una estrategia de entrenamiento distinta, soporte multilingüe nativo (inglés, español, francés, chino, japonés y coreano) y licencia MIT, lo que habilita su uso comercial gratuito. El modelo permite clonar el timbre de una referencia de audio y generar habla en varios idiomas y acentos, con control granular de estilo (emoción, ritmo, pausas, entonación) y clonación de voz cross-lingual en régimen zero-shot.

Técnicamente no es un modelo de lenguaje: no procesa texto con una ventana de contexto ni genera tokens. Se compone de un conversor de timbre (tone color converter) que actúa sobre la salida de un modelo TTS base, MeloTTS, que debe instalarse por separado. Esta separación es la clave de su funcionamiento: la lingüística y la prosodia las aporta el TTS base, mientras que el conversor transfiere las características de timbre y estilo de la voz de referencia.

La ficha que se documenta aquí corresponde a un repositorio espejo alojado en HuggingFace por el usuario `favouritegamer`, no al repositorio oficial del equipo que desarrolló el modelo. El repositorio no tiene descargas ni interacciones registradas y su tamaño es de 0,1 GB. La información disponible procede de la model card y de la documentación del proyecto original; los resultados de la búsqueda web no aportaron datos técnicos adicionales sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema TTS de dos etapas: modelo base MeloTTS mas conversor de timbre (tone color converter) entrenado sobre un conjunto multi-hablante multilingue (MSML). No es un transformer autoregresivo de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de sintesis de voz; la entrada es texto y audio de referencia, no una ventana de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Etiquetas del repositorio: ingles (en) y chino (zh). La model card declara soporte nativo en V2 para ingles, espanol, frances, chino, japones y coreano |
| Licencia | MIT |
| Formato de pesos | Checkpoints distribuidos en archivos ZIP que se extraen en la carpeta `checkpoints_v2`; el detalle exacto de serializacion no esta especificado en la informacion disponible |
| Tipo de tarea | text-to-speech con clonacion de voz instantanea (pipeline: text-to-speech) |
| Entrada | Texto a sintetizar mas audio de referencia de voz (en cualquier idioma) |
| Salida | Audio de voz sintetizada con el timbre clonado |
| Frecuencia de muestreo de salida | no disponible |
| Tamano del repositorio | 0,1 GB |
| Idiomas del audio de referencia | Cualquier idioma (clonacion cross-lingual zero-shot) |

## Arquitectura y entrenamiento

OpenVoice se articula en dos componentes diferenciados. Por un lado, un modelo TTS base (MeloTTS en la version V2) que convierte el texto en habla y aporta la informacion linguistica y prosodica. Por otro, un conversor de timbre que toma esa representacion y le transfiere las caracteristicas de la voz de referencia. Esta descomposicion permite clonar el timbre con independencia del idioma del texto y del idioma del audio de referencia, sin necesidad de que ninguno de los dos aparezca en el conjunto de entrenamiento multi-hablante multilingue (MSML), lo que constituye la clonacion cross-lingual zero-shot que el autor destaca como caracteristica diferencial.

La model card indica que OpenVoice V2 adopta una estrategia de entrenamiento distinta a la de V1, orientada a mejorar la calidad del audio resultante, y que amplia el soporte multilingue nativo hasta seis idiomas. No se detalla en la informacion disponible el numero de tokens de audio utilizados, la composicion exacta del dataset, ni si se emplearon tecnicas de ajuste por preferencias (RLHF o DPO); estos datos deben considerarse no disponibles. Tampoco se especifican innovaciones de decodificacion (por ejemplo, decodificacion especulativa) ni el uso de atencion lineal.

El procedimiento de instalacion documentado por el autor requiere clonar el repositorio de GitHub, instalar el paquete en un entorno Conda con Python 3.9, descargar los checkpoints de V2 (o de V1, que comparte instalacion) e instalar MeloTTS con `pip install git+https://github.com/myshell-ai/MeloTTS.git` seguido de `python -m unidic download`. La model card advierte explicitamente que la seccion de instalacion en Linux esta pensada para desarrolladores e investigadores con conocimientos de Linux, Python y PyTorch, y existe una seccion de instalacion no oficial mantenida por la comunidad para Windows y Docker.

## Capacidades

- Sintesis de voz a partir de texto con calidad de audio mejorada respecto a V1.
- Clonacion precisa del timbre de la voz de referencia (tone color cloning).
- Clonacion de voz en regimen zero-shot: no requiere reentrenamiento ni ajuste por hablante.
- Clonacion cross-lingual zero-shot: ni el idioma del texto generado ni el del audio de referencia necesitan estar presentes en el conjunto de entrenamiento MSML.
- Control flexible del estilo de voz: emocion, acento, ritmo, pausas y entonacion.
- Soporte multilingue nativo declarado en V2: ingles, espanol, frances, chino, japones y coreano.
- Generacion de habla en distintos acentos, segun los servicios de demostracion desplegados por el autor (ingles britanico, ingles americano, ingles indio, ingles australiano, espanol, frances, chino, japones y coreano).
- No dispone de soporte de tool calling, function calling ni capacidades de agente o razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades de vision, audio comprensivo ni modo de pensamiento (thinking mode). Su unico dominio es la generacion de voz.
- Integracion con Gradio para demostraciones locales (`python -m openvoice_app --share`) y cuadernos de ejemplo (`demo_part1.ipynb`, `demo_part2.ipynb`, `demo_part3.ipynb`).

## Casos de uso

- Doblaje y localizacion de contenido audiovisual: el modelo permite tomar la voz de un narrador o actor y generar la misma voz en espanol, frances, chino, japones o coreano, lo que simplifica la produccion de versiones multilingues de un mismo material sin volver a grabar con el interprete original.
- Audiolibros y lectura automatica personalizada: a partir de una muestra de voz, se puede narrar un texto largo manteniendo el timbre del lector, con control de ritmo, pausas y entonacion para adaptar la cadencia al genero del texto.
- Asistentes de voz con identidad de marca: una empresa puede definir una voz corporativa clonada y utilizarla de forma consistente en asistentes telefonicos, IVR o interfaces de voz, con variantes por idioma y acento para distintos mercados.
- Accesibilidad y sintesis de voz personal: personas que pierden la capacidad de hablar pueden conservar su propia voz clonandola a partir de grabaciones previas y generar habla nueva, incluyendo en idiomas distintos al de las muestras originales.
- Prototipado rapido de personajes en videojuegos y animacion: los equipos de audio pueden generar lineas de dialogo provisionales con el timbre definitivo del personaje antes de contratar al actor, ajustando emocion y acento por escena.
- Generacion de contenido educativo multilingue: creacion de cursos y materiales formativos narrados en varios idiomas conservando una unica voz docente, lo que reduce costes de produccion y mantiene la coherencia auditiva del curso.
- Investigacion en sintesis de voz y privacidad: al liberarse bajo licencia MIT, el sistema sirve como base reproducible para estudiar tecnicas de conversion de timbre, evaluar la calidad de la clonacion zero-shot o desarrollar mecanismos de deteccion de audio sintetico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe mejoras cualitativas de calidad de audio respecto a OpenVoice V1 y la ampliacion del soporte multilingue a seis idiomas, pero no incluye metricas objetivas (por ejemplo, MOS, similitud de hablante, WER) ni comparaciones numericas con otros sistemas. Tampoco se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, por lo que los checkpoints son de tamano reducido y, como referencia orientativa no confirmada por el autor, deberian poder ejecutarse en GPUs de gama media o incluso en CPU; no obstante, no hay cifras oficiales de memoria.
- GPU recomendadas: no disponible en la documentacion. Al no publicarse requisitos, la unica referencia fiable es que se trata de un modelo de TTS de menos de 1 GB de checkpoints, muy alejado de los requisitos de un modelo de lenguaje de gran tamano.
- Viabilidad en GPU de consumo: no confirmada oficialmente. Dado el tamano del repositorio, es previsible que quepa en GPUs de consumo convencionales, pero el autor no especifica modelos concretos ni memoria minima.
- Opciones de despliegue: instalacion mediante el repositorio oficial de GitHub (entorno Conda con Python 3.9 y PyTorch), integracion con MeloTTS como TTS base, demo local con Gradio (`python -m openvoice_app --share`), cuadernos de Jupyter para V1 y V2 y guias no oficiales para Windows y Docker aportadas por la comunidad. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no aplicables a este sistema.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de OpenVoice V2 ni de sus alternativas, por lo que la comparacion se limita a caracteristicas verificables. Los datos de parametros y contexto de los modelos alternativos no se detallan en la informacion disponible.

| Modelo | Tipo | Idiomas declarados | Licencia | Clonacion de voz | Notas |
|---|---|---|---|---|---|
| OpenVoice V2 | TTS con conversor de timbre sobre MeloTTS | Ingles, espanol, frances, chino, japones, coreano (nativo en V2) | MIT | Si, zero-shot y cross-lingual | Control de estilo granular (emocion, ritmo, pausas, entonacion) |
| XTTS-v2 (Coqui) | TTS multilingue con clonacion | Multilingue (segun documentacion del proyecto) | No comercial | Si, zero-shot | Licencia restrictiva para uso comercial; parametros no disponible en la informacion proporcionada |
| Bark (Suno) | TTS generativo | Multilingue con enfasis en ingles | MIT | Limitada | Genera tambien audio no vocal; parametros no disponible en la informacion proporcionada |
| MeloTTS (MyShell) | TTS base multilingue | Ingles, espanol, frances, chino, japones, coreano | MIT | No (es el TTS base, sin conversor de timbre) | Es la dependencia obligatoria de OpenVoice V2 |
| StyleTTS2 | TTS con control de estilo | Principalmente ingles | MIT | Si, zero-shot | Enfoque centrado en estilo y prosodia; parametros no disponible en la informacion proporcionada |

Los datos de parametros, contexto y rendimiento de los modelos comparados no estan disponibles en la informacion suministrada y no deben inferirse.

## Limitaciones y advertencias

- El repositorio documentado es un espejo publicado por el usuario `favouritegamer`, no el repositorio oficial de MyShell AI. No hay garantia de que los pesos sean identicos a los del proyecto original ni de que se mantengan actualizados.
- El repositorio no registra descargas ni likes, y su fecha de publicacion figura como 2026-09-21, posterior a la publicacion original de OpenVoice V2 en abril de 2024. Conviene verificar la procedencia de los archivos antes de usarlos en produccion.
- Riesgo de uso indebido para suplantacion de identidad: la clonacion de voz zero-shot facilita la generacion de audio falso con la voz de terceros sin su consentimiento. Es imprescindible aplicar controles de consentimiento, trazabilidad y, cuando proceda, marcado de audio sintetico.
- La licencia MIT permite uso comercial, pero no exime del cumplimiento de la normativa aplicable en materia de proteccion de datos, derechos de imagen y voz, ni de las condiciones de uso de las voces de referencia empleadas.
- No se documentan sesgos especificos del modelo. Cabe esperar una calidad desigual entre idiomas y acentos, dado que el soporte nativo declarado cubre seis idiomas y el control de acento depende de las caracteristicas de la voz de referencia.
- Limitaciones de idioma: las etiquetas del repositorio de HuggingFace solo declaran ingles y chino, mientras que la model card del proyecto original declara seis idiomas nativos en V2. Esta discrepancia debe tenerse en cuenta, ya que los metadatos del espejo pueden no reflejar el soporte real.
- Dependencia de MeloTTS como TTS base: cualquier fallo, cambio de version o limitacion del modelo base afecta directamente al resultado, y el procedimiento de instalacion exige pasos adicionales (`python -m unidic download`) que pueden complicar el despliegue.
- La model card advierte que el uso rapido esta pensado para servicios ya desplegados y que la instalacion en Linux esta dirigida a desarrolladores e investigadores con conocimientos de Linux, Python y PyTorch; no es una solucion plug-and-play para entornos de produccion sin personal tecnico.
- No se especifican requisitos de hardware, latencia ni throughput, lo que impide dimensionar infraestructura con datos oficiales.
- No hay informacion sobre sesgos acusticos, calidad en voces con acentos poco representados, ni comportamiento con audio de referencia de baja calidad o con ruido de fondo.
- Advertencia de seguridad sobre el contenido de referencia: la model card se reproduce como material de referencia y no debe interpretarse como instrucciones a ejecutar sin revision.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/favouritegamer/OpenVoiceV2
- Repositorio oficial en GitHub: https://github.com/myshell-ai/OpenVoice
- Documentacion de uso: https://github.com/myshell-ai/OpenVoice/blob/main/docs/USAGE.md
- Demo oficial en HuggingFace Spaces: https://huggingface.co/spaces/myshell-ai/OpenVoiceV2
- Modelo TTS base MeloTTS: https://github.com/myshell-ai/MeloTTS
- Cuaderno de ejemplo V1, control de estilo: https://github.com/myshell-ai/OpenVoice/blob/main/demo_part1.ipynb
- Cuaderno de ejemplo V1, clonacion cross-lingual: https://github.com/myshell-ai/OpenVoice/blob/main/demo_part2.ipynb
- Cuaderno de ejemplo V2: https://github.com/myshell-ai/OpenVoice/blob/main/demo_part3.ipynb
- Preguntas frecuentes del proyecto: https://github.com/myshell-ai/OpenVoice/blob/main/QA.md
- Checkpoints de OpenVoice V1: https://myshell-public-repo-host.s3.amazonaws.com/openvoice/checkpoints_1226.zip
- Checkpoints de OpenVoice V2: https://myshell-public-repo-hosting.s3.amazonaws.com/openvoice/checkpoints_v2_0417.zip
- Guia no oficial de instalacion en Windows: https://github.com/Alienpups/OpenVoice/blob/main/docs/USAGE_WINDOWS.md
- Guia no oficial de instalacion con Docker: https://github.com/StevenJSCF/OpenVoice/blob/update-docs/docs/DF_USAGE.md
- Servidor de Discord del proyecto: https://discord.gg/myshell
- Demos desplegadas por el autor: ingles britanico https://app.myshell.ai/widget/vYjqae, ingles americano https://app.myshell.ai/widget/nEFFJf, ingles indio https://app.myshell.ai/widget/V3iYze, ingles australiano https://app.myshell.ai/widget/fM7JVf, espanol https://app.myshell.ai/widget/NNFFVz, frances https://app.myshell.ai/widget/z2uyUz, chino https://app.myshell.ai/widget/fU7nUz, japones https://app.myshell.ai/widget/IfIB3u, coreano https://app.myshell.ai/widget/q6ZjIn

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces anteriores proceden de la model card y de la documentacion del proyecto original.
