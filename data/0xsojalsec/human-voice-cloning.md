# 0xSojalSec/human-voice-cloning

## Resumen

El repositorio `0xSojalSec/human-voice-cloning` es una publicacion en HuggingFace etiquetada como `text-to-speech` que, segun sus tags y su model card, corresponde a la familia Qwen3-TTS desarrollada por el equipo Qwen (Alibaba). Se trata de un sistema de sintesis de voz (TTS) de tipo end-to-end construido sobre una arquitectura de modelo de lenguaje discreto con multiples codebooks, que prescinde del esquema clasico LM+DiT y del correspondiente cuello de botella de informacion. El modelo declarado suma 1.916.676.352 parametros (~1,92 mil millones) y ocupa 4,5 GB en el repositorio, un tamano coherente con pesos en precision de 16 bits.

La propuesta tecnica de Qwen3-TTS se apoya en tres piezas: un tokenizador de audio propio (Qwen3-TTS-Tokenizer-12Hz) que comprime la senal de voz a 12 Hz preservando informacion paralinguistica, un decodificador ligero no basado en DiT, y una arquitectura de generacion en streaming hibrida de doble pista (Dual-Track) que permite emitir el primer paquete de audio tras introducir un solo caracter, con una latencia declarada de 97 ms de extremo a extremo. Esa combinacion lo situa en el segmento de TTS conversacional de baja latencia, donde la latencia de primer paquete es tan critica como la calidad final.

La relevancia actual del modelo radica en que unifica voz clonada, control por instrucciones en lenguaje natural y cobertura de 10 idiomas en un unico modelo que se puede servir tanto en modo streaming como por lotes. No obstante, la ficha del repositorio presenta varias inconsistencias que conviene tener presentes: el nombre del repositorio (`human-voice-cloning`) no coincide con la nomenclatura oficial de Qwen (Qwen3-TTS-12Hz-1.7B-Base, entre otros), la model card describe la familia completa y no una variante concreta, y el identificador de arXiv asociado (2601.15621) no corresponde a un preprint verificable en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje discreto con multiples codebooks (discrete multi-codebook LM) + decodificador ligero no-DiT + tokenizador de audio Qwen3-TTS-Tokenizer-12Hz; generacion en streaming hibrida Dual-Track |
| Parametros totales | 1.916.676.352 (~1,92 mil millones), segun los pesos en safetensors del repositorio |
| Parametros activos | No aplica: no se describe una arquitectura de mezcla de expertos (MoE) en la informacion disponible |
| Longitud de contexto | No disponible (el modelo opera sobre texto y audio tokenizado; la model card no publica ventana de contexto) |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye safetensors; la model card no lista variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | La model card declara 10 idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano, mas perfiles de voz dialectales. Los metadatos de HuggingFace indican "no disponibles" |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un modelo de lenguaje discreto con multiples codebooks que modela la voz de extremo a extremo en el dominio de tokens acusticos. La senal se representa mediante Qwen3-TTS-Tokenizer-12Hz, un tokenizador desarrollado por el propio equipo que logra compresion acustica a 12 Hz con modelado semantico de alta dimension y, segun el autor, preserva informacion paralinguistica y caracteristicas del entorno acustico. La reconstruccion de la onda se realiza con un decodificador ligero que no emplea arquitectura DiT, lo que reduce el coste computacional de la fase de decodificacion. El autor afirma que este diseno evita los cuellos de botella de informacion y los errores en cascada tipicos de los esquemas LM+DiT.

El modo de generacion combina dos pistas (Dual-Track) para soportar simultaneamente streaming y no-streaming con un unico modelo: el sistema puede emitir el primer paquete de audio inmediatamente despues de recibir un caracter, con una latencia de sintesis declarada de 97 ms, lo que habilita escenarios de interaccion en tiempo real. Sobre el control, el modelo acepta instrucciones en lenguaje natural para modular timbre, emocion y prosodia, y ajusta de forma adaptativa el tono y el ritmo a partir de la semantica del texto. La model card menciona ademas robustez mejorada frente a texto de entrada ruidoso. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO; tampoco se detallan los hiperparametros de entrenamiento de la variante concreta publicada en este repositorio.

## Capacidades

- Sintesis de voz (text-to-speech) de extremo a extremo con reconstruccion de alta fidelidad y preservacion de informacion paralinguistica.
- Clonacion de voz rapida a partir de audio del usuario: la variante Base declara clonacion en 3 segundos de audio de referencia.
- Control por instrucciones en lenguaje natural sobre timbre, emocion, prosodia y velocidad de habla.
- Diseno de voces desde cero mediante descripciones textuales (variante VoiceDesign).
- Estilos de voz predefinidos: la variante CustomVoice ofrece 9 timbres premium que cubren combinaciones de genero, edad, idioma y dialecto.
- Generacion en streaming con arquitectura Dual-Track, con latencia declarada de primer paquete de audio de 97 ms.
- Generacion no-streaming por lotes con el mismo modelo.
- Cobertura multilingue de 10 idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano, mas perfiles dialectales.
- Comprension contextual del texto para adaptar tono y ritmo de forma automatica.
- Robustez declarada frente a entradas de texto ruidosas o imperfectas.
- Fine-tuning: la variante Base se puede reutilizar para ajustar otros modelos de la familia.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes ni razonamiento multi-paso; se trata de un modelo de sintesis de voz, no de un modelo de lenguaje conversacional.

## Casos de uso

- Clonacion de voz personal para audiolibros y contenido narrado: con solo 3 segundos de audio de referencia (variante Base), un creador puede generar horas de narracion con su propia voz sin grabar sesion a sesion, manteniendo coherencia de timbre a lo largo de capitulos extensos.
- Atencion al cliente con voz sintetica en tiempo real: la latencia de 97 ms y el modo streaming permiten construir agentes telefonicos o asistentes web donde la respuesta hablada empieza a sonar antes de que el texto completo este generado, evitando silencios perceptibles en conversaciones multiturno.
- Doblaje y localizacion multilingue: al cubrir 10 idiomas con el mismo modelo, se puede producir una misma pieza de contenido en espanol, italiano, aleman y portugues manteniendo un perfil de voz consistente, util para e-learning y marketing internacional.
- Diseno de voces para videojuegos y animacion: la variante VoiceDesign permite generar voces nuevas a partir de descripciones textuales, lo que agiliza la preproduccion de personajes antes de contratar actores definitivos y facilita la iteracion sobre personalidad vocal.
- Generacion de datos sinteticos para entrenar sistemas de reconocimiento de voz: se pueden producir corpus etiquetados con control explicito de acento, genero, edad y ruido ambiental para aumentar la cobertura de un dataset de ASR sin depender de grabaciones costosas.
- Accesibilidad y lectores de pantalla: integrado en herramientas de lectura asistida, el control de prosodia y velocidad permite adaptar la locucion al ritmo del usuario y mantener inteligibilidad en parrafos largos y contenido tecnico.
- Asistentes conversacionales y kioscos interactivos: el control por instrucciones en lenguaje natural permite fijar el tono (formal, cercano, neutro) por contexto de negocio y ajustarlo dinamicamente segun la intencion detectada en el turno.
- Postproduccion y prototipado de podcasts: generacion rapida de locuciones de prueba con distintos timbres para validar guiones antes de la grabacion final, reduciendo el numero de tomas necesarias.
- Sistemas de verificacion anti-fraude por voz: el propio modelo, al ser de clonacion abierta, se puede emplear para generar muestras sinteticas controladas con las que entrenar y evaluar detectores de deepfakes de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card proporcionada no incluye tablas comparativas con metricas objetivas (por ejemplo WER, MOS, SIM-o, RTF) ni comparaciones numericas frente a otros sistemas TTS. El unico dato cuantitativo de rendimiento declarado por el autor es una latencia de sintesis de extremo a extremo de 97 ms en modo streaming, junto con la frecuencia de representacion del tokenizador (12 Hz), que no equivalen a una evaluacion de calidad de audio ni a un benchmark replicable.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.916.676.352 parametros, los pesos en precision de 16 bits ocupan aproximadamente 3,83 GB, lo que es consistente con los 4,5 GB de tamano del repositorio (que incluye ficheros adicionales). En FP32 la huella de pesos subiria hasta unos 7,7 GB. A estas cifras hay que sumar el coste del decodificador de audio ligero no-DiT y las activaciones.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM deberia ser suficiente para inferencia en 16 bits, incluidas RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070 y superiores. Para despliegues de alta concurrencia o procesamiento por lotes se recomiendan A100, H100 o L40S, donde el modelo ocupa una fraccion minima de la memoria y el cuello de botella pasa a ser el decodificador de audio y el ancho de banda.
- Cabe en GPU de consumo: si. Con aproximadamente 3,8 GB de pesos en 16 bits, el modelo entra holgadamente en GPUs de consumo con 8 GB o mas de VRAM, y es probable que quepa incluso en configuraciones de 6 GB si se aplica cuantizacion, aunque no hay variantes cuantizadas publicadas en la informacion disponible.
- Opciones de despliegue: la model card menciona explicitamente el paquete `qwen-tts` y vLLM como vias de carga del modelo, con descarga automatica de pesos por nombre de modelo. Para entornos sin acceso a descarga en tiempo de ejecucion se documenta la descarga manual via ModelScope o `huggingface-cli`. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible, y no se distribuyen pesos GGUF.
- Latencia y throughput estimados: el autor declara 97 ms de latencia de extremo a extremo en streaming. No se proporcionan cifras de throughput (por ejemplo, segundos de audio generados por segundo de computo) ni de consumo de memoria en produccion.
- Nota sobre estimation: las cifras de VRAM son calculadas a partir del recuento de parametros y del tamano del repositorio; el autor no las publica.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las otras variantes de la propia familia Qwen3-TTS descritas en la model card. No se dispone de datos verificados de terceros (por ejemplo, sistemas TTS de otros fabricantes) dentro de la informacion proporcionada.

| Modelo | Parametros | Idiomas | Streaming | Control por instrucciones | Clonacion de voz | Licencia |
|---|---|---|---|---|---|---|
| Repositorio analizado (`0xSojalSec/human-voice-cloning`) | 1,92 mil millones (safetensors) | 10 idiomas segun model card | Si (Dual-Track) | No especificado para esta variante | La model card describe clonacion en la variante Base | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-Base | 1,7 mil millones (nominal) | 10 idiomas | Si | No declarado | Si, clonacion en 3 segundos | No disponible en la informacion |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | 1,7 mil millones (nominal) | 10 idiomas | Si | Si, con 9 timbres premium | No declarado | No disponible en la informacion |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1,7 mil millones (nominal) | 10 idiomas | Si | Si, diseno de voz por descripcion | No declarado | No disponible en la informacion |
| Qwen3-TTS-12Hz-0.6B-Base / 0.6B-CustomVoice | 0,6 mil millones (nominal) | 10 idiomas | Si | Segun variante | Si en la variante Base | No disponible en la informacion |

Observacion: el recuento real de parametros del repositorio analizado (1,92 mil millones) no coincide exactamente con la denominacion "1.7B" usada por el autor para las variantes de esa gama, ni con la gama "0.6B". Esta discrepancia puede deberse a que el recuento incluye modulos adicionales (tokenizador, decodificador) o a que el repositorio no es un espejo exacto de ninguna variante oficial.

## Limitaciones y advertencias

- Trazabilidad del repositorio dudosa: el nombre del repositorio (`human-voice-cloning`) no se corresponde con la nomenclatura oficial de Qwen, el autor (`0xSojalSec`) no es el equipo Qwen, y la model card publicada es la de la familia Qwen3-TTS en lugar de una ficha especifica del artefacto. No se puede confirmar que los pesos correspondan exactamente a una variante oficial ni que no hayan sido modificados.
- Cifras de popularidad muy bajas: 10 descargas y 0 likes en el momento de la consulta. No hay senal de validacion por parte de la comunidad.
- Identificador de arXiv no verificable: el tag `arxiv:2601.15621` apunta a un identificador cuyo formato corresponde a enero de 2026, posterior a la fecha habitual de publicaciones disponibles, y no se ha podido verificar el contenido del informe tecnico con la informacion proporcionada.
- Sin benchmarks publicados: no hay metricas objetivas de calidad (MOS, similitud de hablante, WER) ni comparaciones reproducibles con sistemas alternativos.
- Riesgo de uso malicioso: se trata de un sistema de clonacion de voz. Sin consentimiento explicito de la persona cuya voz se clona, su uso puede constituir suplantacion de identidad, fraude o desinformacion. Es imprescindible implementar consentimiento verificable y marcado o deteccion de audio sintetico.
- Riesgo de alucinacion acustica: como todo modelo generativo, puede producir artefactos, prosodia incorrecta, pronunciacion erronea de nombres propios o terminologia tecnica, y ruido en la reconstruccion, especialmente con entradas atipicas o texto muy ruidoso.
- Limitaciones de idioma: la cobertura declarada es de 10 idiomas; el rendimiento por idioma no se detalla, y es habitual que la calidad en lenguas con menos datos (por ejemplo, portugues o coreano) sea inferior a la del chino y el ingles. No hay datos de variantes dialectales del espanol.
- Limitacion de contexto: no se publica longitud de contexto ni el limite maximo de texto o audio de referencia por peticion. Para locuciones largas habria que trocear el texto, con riesgo de discontinuidad prosodica entre fragmentos.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial. No obstante, la licencia del artefacto concreto no se puede verificar mas alla de los metadatos del repositorio, y las condiciones de uso de las voces clonadas dependen de la legislacion aplicable en materia de derechos de imagen y voz.
- Requisitos legales en produccion: en la Union Europea, el uso de voz sintetica clonada esta sujeto a obligaciones de transparencia (etiquetado de contenido generado) y, en el caso de voces identificables, a la normativa de proteccion de datos. Verificar cumplimiento antes de desplegar.
- Dependencia de la model card como unica fuente: buena parte de los datos de arquitectura y capacidades provienen de afirmaciones del autor sin verificacion independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/0xSojalSec/human-voice-cloning
- Referencia al informe tecnico citada en los tags: https://arxiv.org/abs/2601.15621
- Repositorios oficiales de la familia Qwen3-TTS mencionados en la model card (no verificados como origen de este artefacto):
  - https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
  - https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
  - https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
  - https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
  - https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
  - https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Recursos graficos citados en la model card: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/qwen3_tts_introduction.png y https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/overview.png
- Paquete de inferencia mencionado por el autor: `qwen-tts` (distribucion via pip; no se proporciona URL en la informacion disponible)
- Alternativa de descarga mencionada por el autor: ModelScope (https://modelscope.cn)
