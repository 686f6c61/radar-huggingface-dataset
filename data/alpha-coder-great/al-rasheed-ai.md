# alpha-coder-great/al-rasheed-ai

## Resumen
Al-Rasheed AI es un modelo de lenguaje afinado, distribuido en formato GGUF, orientado especificamente a la consulta de conocimiento islamico, referencias coranicas y orientacion basica sobre practicas religiosas. Lo desarrolla el usuario alpha-coder-great dentro del proyecto Al-Rasheed, una aplicacion islamica con enfoque offline-first que integra tanto chat como un modelo de recitacion. El modelo se presenta como una version afinada de una base existente (la model card menciona Llama 3 como arquitectura de referencia) y se distribuye con una unica cuantizacion Q4_K_M.

La relevancia del modelo es acotada y de nicho: no compite en capacidades generales con modelos frontera, sino que busca ofrecer asistencia religiosa local, sin dependencia de servicios en la nube, para usuarios que priorizan privacidad y funcionamiento sin conexion. El repositorio ocupa 2,0 GB y acumula 1848 descargas, lo que sugiere un uso comunitario mas que un despliegue industrial.

La informacion publica es escasa: no se detallan parametros totales, contexto de entrenamiento, composicion del dataset ni resultados de evaluacion. La model card insiste en que el modelo es una herramienta experimental de referencia y no sustituye a un mufti o a un erudito cualificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (la model card indica Llama 3 como base; no se detalla la variante) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (configurado en el Modelfile con `num_ctx 8192`) |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada) |
| Idiomas soportados | no disponible (la model card esta redactada en ingles; no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`al-rasheed-ai-Q4_K_M.gguf`, derivado de `./quran-guide Q4_K_M.gguf`) |

## Arquitectura y entrenamiento
La model card describe el modelo como un "fine-tuned GGUF language model" construido sobre la arquitectura Llama 3, sin especificar el numero de parametros de la base ni la variante concreta. El artefacto distribuido es una cuantizacion Q4_K_M de un modelo previo denominado internamente quran-guide, del que no se publican detalles de entrenamiento.

No se documenta el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se describen innovaciones tecnicas (atencion lineal, decodificacion especulativa, mezcla de expertos). El unico elemento de configuracion visible es el system prompt incluido en el Modelfile, que fija la identidad del asistente como Al-Rasheed-AI, una temperatura de 0,7 y una ventana de contexto de 8192 tokens.

## Capacidades
- Generacion de texto conversacional en torno a conceptos islamicos, terminologia religiosa y practicas cotidianas.
- Asistencia sobre significados y ensenanzas de pasajes coranicos, con advertencia explicita de verificacion.
- Orientacion introductoria sobre dictamenes islamicos basicos y algunos temas avanzados, presentados como punto de partida para investigacion posterior.
- Identificacion de cuestiones que requieren consulta con eruditos cualificados.
- Funcionamiento offline mediante inferencia local en software compatible con GGUF.
- Integracion en la aplicacion Al-Rasheed Islamic App, que incluye ademas un modelo separado de recitacion con retroalimentacion de pronunciacion.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso
- Consulta religiosa offline en dispositivos personales: el modelo se ejecuta localmente en formato GGUF con contexto de 8192 tokens, lo que permite mantener conversaciones multi-turno sobre conceptos islamicos sin enviar datos a la nube.
- Aplicacion movil de referencia islamica: integrado en Al-Rasheed Islamic App, sirve como asistente de consulta rapida sobre terminologia, practicas y significados de pasajes coranicos.
- Educacion introductoria: apoyo a estudiantes que necesitan una primera explicacion de conceptos islamicos, con la advertencia de verificar citas y referencias en fuentes autenticas.
- Filtro de derivacion a especialistas: el modelo puede identificar preguntas que exceden su alcance y orientar al usuario hacia muftises o eruditos cualificados.
- Despliegue en entornos con conectividad limitada: al ser un GGUF de 2,0 GB, puede ejecutarse en equipos modestos mediante llama.cpp u Ollama, util en comunidades con infraestructura reducida.
- Prototipado de asistentes religiosos especializados: sirve como base para experimentar con prompts y flujos de consulta antes de invertir en modelos mayores o en datos propios.
- Complemento de la funcion de recitacion: dentro de la app, el chat puede acompanar a la retroalimentacion de pronunciacion del modelo de recitacion, ofreciendo contexto explicativo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: al tratarse de una cuantizacion Q4_K_M y un repositorio de 2,0 GB, la inferencia requiere aproximadamente 2-3 GB de memoria, mas la memoria adicional para el contexto de 8192 tokens (que puede anadir entre 0,5 y 1,5 GB segun la implementacion).
- GPU recomendadas: no se especifican; por tamano, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores, asi como en Apple Silicon con memoria unificada suficiente.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM, aunque este dato no esta confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama (el Modelfile incluido sugiere este flujo), y otros runners compatibles con GGUF. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias
- El propio autor advierte que el modelo puede generar informacion inexacta, citar mal las fuentes, malinterpretar preguntas o emitir dictamenes religiosos incorrectos.
- No sustituye a un mufti, erudito o autoridad religiosa cualificada; toda cita coranica, hadiz o dictamen debe verificarse en fuentes autenticas.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- No se especifican los idiomas soportados; la model card esta en ingles y no hay evidencia de calidad en castellano u otras lenguas.
- La unica cuantizacion disponible es Q4_K_M, lo que limita el ajuste fino entre calidad y recursos.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El proyecto se declara en desarrollo continuo y el autor menciona un modelo futuro separado, por lo que la version actual puede quedar obsoleta.
- La calidad y exactitud de las respuestas "puede variar", segun la propia model card.

## Enlaces
- Hugging Face: https://huggingface.co/alpha-coder-great/al-rasheed-ai
- Sitio web oficial del proyecto: https://mkaramrashid2012-code.github.io/Al-Rasheed-AI/
