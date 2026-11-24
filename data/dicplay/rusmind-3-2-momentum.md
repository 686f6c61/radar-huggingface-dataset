# DICPlay/RusMind-3.2-Momentum

## Resumen

RusMind 3.2 Momentum es un modelo de lenguaje afinado por DICPlay a partir de Google Gemma 4 E2B-it, orientado a inferencia local en dispositivo (moviles y equipos modestos) y a conversacion en ruso como idioma principal, con soporte de ingles. Se distribuye en formato GGUF y se presenta como la variante mas ligera de la familia RusMind 3.2, con un tamano de descarga de aproximadamente 2,5 GB en su cuantizacion para navegador y 3,4 GB en Q4_K_M.

El modelo parte de una base de aproximadamente 4.647 millones de parametros (segun el dato de safetensors del repositorio) y se ha afinado con datos propios de DICPlay centrados en lengua, historia, cultura, legislacion y geografia de Rusia. Su propuesta de valor es el procesamiento totalmente offline: la conversacion no abandona el dispositivo, lo que resulta relevante para aplicaciones de privacidad y para entornos sin conectividad.

Es relevante ahora porque compite en el segmento de modelos pequenos ejecutables en consumer hardware, un nicho donde la mayoria de alternativas no ofrecen afinado especifico para ruso ni distribucion en GGUF lista para llama.cpp y navegador. La licencia, no obstante, es propia y restringe el uso comercial sin contrato con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/gemma-4-E2B-it) |
| Parametros totales | 4.647.450.147 (dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (segun la model card, en la version para navegador) |
| Tipos de cuantizacion | Q4_K_M (Lite y principal), Q8_0; la version de navegador usa Q4_K_M con embeddings aligerados |
| Idiomas soportados | ruso (principal), ingles |
| Licencia | RusMind License (DICPlay), con base Apache 2.0 de Gemma 4 E2B |
| Formato de pesos | GGUF (archivos completos y particionado en 9 fragmentos de hasta 1 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo deriva de google/gemma-4-E2B-it, un modelo de la familia Gemma 4 de Google. No se especifica si emplea atencion lineal, mezcla de expertos u otras innovaciones, ni se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El autor indica que el afinado se realizo sobre conjuntos de datos propios de DICPlay centrados en historia y cultura de Rusia, legislacion de la Federacion Rusa, regiones y pueblos del pais, valores familiares tradicionales y acontecimientos clave, en ruso e ingles. No se aportan detalles sobre el volumen de estos datos ni sobre el proceso de alineacion.

## Capacidades

- Generacion de texto conversacional multi-turno en ruso e ingles.
- Comprension de contexto cultural, historico y legal ruso gracias al afinado especifico.
- Ejecucion totalmente offline en dispositivo, sin envio de datos a servidores.
- Integracion con llama.cpp y con aplicaciones compatibles con GGUF (LM Studio, Ollama, PocketPal).
- Ejecucion en navegador mediante wllama y el sitio rusmind.ru, con descarga unica del modelo.
- Expresion de incertidumbre: el autor afirma que el modelo indica "no lo se" cuando no esta seguro.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional offline en moviles: el modelo se ejecuta en el propio telefono con la cuantizacion Lite (2,5 GB) y responde sin conexion, lo que permite asistentes personales en zonas sin cobertura o en entornos con requisitos de privacidad.
- Explicacion de amenazas de seguridad en lenguaje llano: DICPlay lo emplea en DIC.Antivirus PRO para describir al usuario que es una amenaza detectada, por que es peligrosa y que hacer, un caso de uso ya en produccion.
- Consulta de normativa y tramites rusos: el afinado sobre legislacion de la Federacion Rusa permite responder preguntas sobre procedimientos administrativos y derechos, siempre con caracter informativo y sin sustituir asesoramiento profesional.
- Educacion y apoyo al estudio: el modelo ayuda con deberes y explicaciones en ruso, adecuado para estudiantes que necesitan respuestas rapidas en dispositivos de gama baja.
- Atencion al cliente en ruso con despliegue local: integrado via llama.cpp en un servicio interno, permite gestionar conversaciones multi-turno dentro de los 4096 tokens de contexto sin coste de API ni salida de datos.
- Generacion de contenido editorial en ruso: redaccion de textos divulgativos sobre historia, cultura o regiones de Rusia, aprovechando el corpus de afinado especifico.
- Prototipado rapido en navegador: mediante wllama y los fragmentos GGUF de hasta 1 GB, se puede desplegar una demo funcional en una pagina web sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2,5 GB para la version Lite, 3,4 GB para Q4_K_M y 5,0 GB para Q8_0, mas el overhead del runtime.
- Cabe en GPU de consumo: si, en tarjetas con 4-6 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) para Q4_K_M; Q8_0 requiere 6-8 GB.
- Ejecucion en CPU: viable en equipos modestos y telefonos de gama media-alta, dado el tamano del modelo.
- GPU de datacenter: no se documenta soporte ni rendimiento en A100 o H100; el modelo esta orientado a inferencia local.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), LM Studio, Ollama, PocketPal, wllama en navegador y el sitio rusmind.ru.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind 3.2 Momentum | 4.647 M | 4096 tokens | ru, en | RusMind License (comercial con contrato) | GGUF |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |
| RusMind 3.2 Vspyshka (misma familia) | no disponible | no disponible | ru, en | RusMind License | GGUF |
| RusMind 3.2 Znanie (misma familia) | no disponible | no disponible | ru, en | RusMind License | no disponible |

La comparacion con alternativas de otros fabricantes (T-Bank T-Pro/T-Lite, Sber GigaChat, YandexGPT) no puede establecerse en terminos de parametros, contexto o rendimiento porque la informacion proporcionada solo incluye sus cifras de descargas, no sus especificaciones tecnicas.

## Limitaciones y advertencias

- Licencia restrictiva: el uso comercial, la redistribucion, la reventa y la publicacion de versiones modificadas o afinadas requieren contrato escrito con DICPlay; no es una licencia de codigo abierto al uso.
- Contexto limitado: 4096 tokens, insuficiente para documentos largos o conversaciones extensas sin estrategias de recuperacion externa.
- Cobertura linguistica reducida: solo ruso e ingles; el rendimiento en castellano no esta documentado ni garantizado.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; el modelo puede generar afirmaciones incorrectas sobre legislacion, historia o datos factuales.
- Sesgo tematico: el afinado sobre historia, cultura y valores especificos de Rusia puede introducir sesgos editoriales en las respuestas sobre esos temas.
- Uso informativo: los propios autores advierten que las respuestas medicas, juridicas y financieras tienen caracter de referencia y no sustituyen asesoramiento profesional.
- Ausencia de benchmarks: no hay datos publicos de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes, lo que impide verificar el rendimiento frente a alternativas.
- Datos de descargas no verificables de forma independiente en esta ficha; las cifras de la model card proceden del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-3.2-Momentum
- Repositorio de versiones anteriores: https://huggingface.co/DICPlay/RusMind-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Demo en navegador: https://rusmind.ru
- Archivo Lite (2,5 GB): https://huggingface.co/DICPlay/RusMind-3.2-Momentum/blob/main/RusMind-Momentum-3.2-Lite.gguf
- Archivo Q4_K_M (3,4 GB): https://huggingface.co/DICPlay/RusMind-3.2-Momentum/blob/main/RusMind-Momentum-3.2-Q4_K_M.gguf
- Archivo Q8_0 (5,0 GB): https://huggingface.co/DICPlay/RusMind-3.2-Momentum/blob/main/RusMind-Momentum-3.2-Q8_0.gguf
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
