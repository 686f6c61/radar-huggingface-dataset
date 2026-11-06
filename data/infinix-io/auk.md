# Infinix-io/AuK

## Resumen

AuK es un modelo fundacional de 1.500 millones de parametros para generacion y edicion de voz, publicado por Infinix-io (con enlaces en la model card a repositorios de Tencent Hunyuan) bajo licencia MIT. A diferencia de un TTS clasico, AuK unifica generacion, edicion de contenido, edicion acustica, edicion paralinguistica, mejora de voz y separacion de fuentes bajo una unica interfaz de instrucciones en lenguaje natural. El modelo se entreno sobre millones de horas de audio diverso y esta disponible en dos variantes: AuK base, orientada a maxima calidad, y AuK-Flash, una version destilada para inferencia en 4 pasos.

La relevancia de AuK radica en su planteamiento como modelo fundacional de audio: en lugar de encadenar varios sistemas especializados (un TTS, un editor de prosodia, un separador de fuentes), el usuario describe la operacion en lenguaje natural y el modelo la ejecuta sobre la senal. Esto simplifica pipelines de produccion de audio y abre la puerta a flujos de postproduccion asistidos por instrucciones. Con 1.5B de parametros y un repositorio de 6.8 GB, el modelo es manejable en hardware de gama alta de consumo, lo que facilita su evaluacion y despliegue local.

La informacion publica disponible es limitada: la model card describe tareas y variantes, pero no detalla la arquitectura interna, la composicion del dataset ni resultados numericos de benchmarks. Esta ficha recoge lo que el autor documenta y marca explicitamente como no disponible todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion segun tags; detalles no publicados) |
| Parametros totales | 1.5B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; no se especifica ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 6.8 GB; safetensors no confirmado en la informacion) |

## Arquitectura y entrenamiento

La model card indica que AuK es un modelo de 1.5B parametros entrenado sobre millones de horas de audio diverso, y los tags del repositorio incluyen `diffusion`, lo que sugiere un backbone generativo basado en difusion sobre representaciones de audio. No se publican detalles sobre el tokenizer de audio, el tipo de transformer subyacente, la estrategia de condicionamiento (texto, audio de referencia, instrucciones) ni la composicion exacta del corpus de entrenamiento.

Se desconoce si el modelo se entreno con RLHF, DPO u otras tecnicas de alineacion, asi como los detalles de la destilacion que produce AuK-Flash (4 pasos de inferencia). La innovacion principal documentada es la interfaz unificada de instrucciones en lenguaje natural que cubre generacion, edicion y separacion en un solo modelo, en lugar de tareas resueltas por modulos independientes.

## Capacidades

- Generacion de voz zero-shot: sintetiza texto con la voz de un audio de referencia.
- TTS por instruccion: genera voz a partir de una descripcion de voz, sin audio de referencia.
- Edicion de contenido: reemplaza, inserta o elimina texto en una locucion existente.
- Edicion de letras: reescribe la letra de una grabacion cantada preservando melodia y voz.
- Edicion acustica: ajuste de tono en semitonos, velocidad (la longitud de salida escala con el factor) y volumen en decibelios.
- Edicion paralinguistica: cambio de emocion, cambio de timbre por descripcion, eliminacion de acento regional, adicion o eliminacion de sonidos no verbales (respiraciones, risas, toses) y conversion a susurro.
- Mejora de voz (speech enhancement).
- Separacion de fuentes y de habla (source separation, speech separation).
- Interfaz unificada de instrucciones en lenguaje natural para todas las tareas.
- Variante AuK-Flash con inferencia en 4 pasos para baja latencia.

## Casos de uso

- Postproduccion de doblaje: corregir una frase mal locutada sin regrabar, usando edicion de contenido sobre el audio original y preservando el timbre del actor.
- Localizacion y ajuste de acento: eliminar un acento regional en una locucion para adaptarla a un mercado, manteniendo la identidad vocal del hablante.
- Produccion musical: reescritura de letras en una maqueta cantada conservando melodia y voz, util para iterar letras antes de la grabacion final.
- Audiolibros y narracion: generacion zero-shot con una voz de referencia del narrador y ajuste fino de velocidad y emocion por capitulo mediante instrucciones.
- Limpieza de audio para podcast: mejora de voz y eliminacion de respiraciones o ruidos no verbales en una sola pasada con instrucciones.
- Separacion de pistas: aislamiento de voz y fuentes en grabaciones para remezcla o para alimentar otros pipelines de transcripcion.
- Prototipado de asistentes de voz: generacion rapida de muestras con distintas voces descritas por texto, sin necesidad de grabar referencias.
- Investigacion en edicion de audio: banco de pruebas para estudiar edicion guiada por instrucciones sobre senal de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de rendimiento (`assets/performance.png`) pero no se proporcionan cifras numericas en el texto accesible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un modelo de 1.5B, una estimacion razonable en fp16 ronda los 3-4 GB de pesos, mas overhead de activaciones y del codificador/decodificador de audio; en cuantizacion de 8 bits o 4 bits el peso baja aproximadamente a 1.5-2 GB y 0.8-1 GB respectivamente, pero estas cifras son estimaciones y no estan confirmadas por el autor.
- GPU recomendadas: no especificadas. Por tamano, una RTX 4090 (24 GB) o RTX 3090 deberian ser suficientes para inferencia en fp16; A100/H100 para despliegue por lotes.
- Cabe en GPU de consumo: probablemente si, en GPUs con 8 GB o mas en fp16 y en GPUs de 4-6 GB con cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: la model card enlaza un cookbook con ejemplos CLI y Python; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (estos frameworks estan orientados a LLMs de texto y no necesariamente soportan modelos de difusion de audio).
- Latencia y throughput: no disponibles. AuK-Flash esta disenado para 4 pasos de inferencia, lo que reduce la latencia frente al modelo base, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Tareas | Licencia | Notas |
|---|---|---|---|---|
| AuK | 1.5B | TTS zero-shot, TTS por instruccion, edicion de contenido/acustica/paralinguistica, mejora, separacion | MIT | Interfaz unificada por instrucciones; variante Flash de 4 pasos |
| AuK-Flash | no disponible | Mismas tareas (destilado) | MIT | Inferencia en 4 pasos |
| Alternativas de TTS zero-shot | no disponible | TTS | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas (parametros, contexto, rendimiento o disponibilidad) sin inventar datos.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos demograficos, acentos o idiomas; el rendimiento puede variar segun la variedad de habla.
- Riesgo de alucinacion y artefactos en la senal generada, especialmente en ediciones agresivas o con audio de referencia ruidoso.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingue amplia.
- La licencia MIT permite uso comercial, pero conviene revisar los terminos de los pesos y de cualquier dependencia del codigo (el repositorio enlaza a GitHub de Tencent Hunyuan; verificar la licencia efectiva de cada artefacto).
- Uso dual: las capacidades de clonacion de voz y de-accent exigen consentimiento explicito del hablante y cumplimiento de la normativa de proteccion de datos y de derechos de imagen/voz.
- No hay benchmarks publicados que permitan validar la calidad frente a alternativas en produccion.
- El modelo es reciente (publicado en 2026) y con cero descargas registradas en el momento de la consulta; la madurez del ecosistema de herramientas es incierta.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/AuK
- Web del proyecto: https://auk-project.github.io/
- GitHub (codigo y cookbook): https://github.com/Tencent-Hunyuan/AuK
- Paper: https://arxiv.org/abs/2609.08936
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/tencent/AuK
- Demo en ModelScope: https://modelscope.cn/studios/Tencent-Hunyuan/AuK
- Pesos AuK (Hugging Face): https://huggingface.co/tencent/AuK
- Pesos AuK (ModelScope): https://modelscope.cn/models/Tencent-Hunyuan/AuK
- Pesos AuK-Flash (Hugging Face): https://huggingface.co/tencent/AuK-Flash
- Pesos AuK-Flash (ModelScope): https://modelscope.cn/models/Tencent-Hunyuan/AuK-Flash
- Cookbook: https://github.com/Tencent-Hunyuan/AuK/blob/main/docs/COOKBOOK.md
