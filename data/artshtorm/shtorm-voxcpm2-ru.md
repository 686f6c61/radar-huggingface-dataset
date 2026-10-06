# ArtShtorm/Shtorm-VoxCPM2-RU

## Resumen

Shtorm-VoxCPM2-RU es un ajuste fino (fine-tune) del modelo de sintesis de voz openbmb/VoxCPM2, publicado por el usuario ArtShtorm bajo licencia Apache-2.0. Su particularidad es que la LoRA de ajuste ha sido fusionada (merged) directamente en los pesos, de modo que se carga como un VoxCPM2 estandar mediante la libreria `voxcpm`, sin adaptadores ni codigo adicional. El modelo incorpora 2.290.004.544 parametros (unos 2,29 mil millones) almacenados en safetensors, con un repositorio de 5,0 GB.

El problema que resuelve es muy concreto: el acento lexico (udarenie) en ruso. En ruso, la posicion del acento no es predecible y determina el significado de palabras homografas como "замок" (castillo / cerradura) o "стрелки" (flechas / flechas de reloj). Este modelo acepta una anotacion explicita en el texto de entrada: el simbolo `+` colocado **antes** de la vocal tonica (`зам+ок`, `стрелк+и`, `м+олоко`), y respeta esa marca en la sintesis. Sin marcas, se comporta como el VoxCPM2 original.

Es relevante ahora porque cubre un nicho poco atendido en TTS open source: el control fino de la prosodia lexica en ruso sin necesidad de entrenar ni desplegar un modelo propio, y con la posibilidad de combinarlo con clonacion de voz a partir de una referencia de 5 a 15 segundos. El autor lo califica explicitamente como version experimental "tal cual", sin mediciones formales de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del base openbmb/VoxCPM2; ajuste mediante LoRA fusionada) |
| Parametros totales | 2.290.004.544 (2,29 mil millones, dato de safetensors) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible; la model card recomienda sintetizar por frases y concatenar en textos largos |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni int8/int4; los pesos se distribuyen en safetensors) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `voxcpm`) |

Otros datos de interes: pipeline `text-to-speech`, tamano del repositorio 5,0 GB, 21 descargas y 1 "like" en el momento de la consulta, creado y actualizado el 2026-10-06. La frecuencia de muestreo de salida no se explicita en la informacion disponible (se obtiene en tiempo de ejecucion via `model.tts_model.sample_rate`).

## Arquitectura y entrenamiento

No se detallan en la model card la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Lo unico confirmado es que se trata de un ajuste fino del modelo base openbmb/VoxCPM2 con una LoRA que despues fue fusionada en los pesos finales, y que el objetivo del ajuste fue ensenar al modelo a colocar el acento tonic o segun las marcas `+` presentes en el texto de entrada. El autor indica que el entrenamiento uso ejemplos anotados con esa convencion, incluyendo conjuntos de homografos y acentos deliberadamente incorrectos, y que no anoto palabras monosilabas.

La interfaz de inferencia documentada aporta pistas tecnicas sobre el decodificador: expone parametros `cfg_value` (valor de guiado sin clasificador, fijado en 2,0 en los ejemplos) e `inference_timesteps` (10 pasos en los ejemplos), lo que apunta a un decodificador acustico iterativo con guiado, y un flag `load_denoiser` que sugiere un modulo de reduccion de ruido opcional. Igualmente, el ejemplo de uso pasa `normalize=False`, lo que implica que existe un normalizador de texto integrado que debe desactivarse para no destruir las marcas de acento. Todos estos extremos son inferencias a partir de la API mostrada en la model card, no especificaciones publicadas por el autor.

## Capacidades

- Sintesis de voz (text-to-speech) en ruso a partir de texto plano.
- Control explicito del acento lexico mediante el simbolo `+` antepuesto a la vocal tonica.
- Clonacion de voz con referencia corta (se recomienda modo "Hi-Fi" con 5-15 segundos de audio limpio y su transcripcion literal).
- Mantenimiento de la identidad de voz entre frases cuando se usa un mismo archivo de referencia.
- Lectura de textos con homografos, siguiendo las marcas del usuario en lugar de la prediccion por defecto.
- Compatibilidad con flujos de anotacion automatica: la propia model card sugiere usar un autoacentuador externo (por ejemplo RUAccent) y despues retirar las marcas de las palabras monosilabas.
- Funcionamiento como VoxCPM2 estandar cuando no se introduce ninguna marca.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento; el pipeline es exclusivamente text-to-speech.

## Casos de uso

- Audiolibros y narracion literaria en ruso: el texto se anota con un autoacentuador y se corrige manualmente en homografos y nombres propios; el modelo respeta esas marcas, algo critico en textos largos donde un acento erroneo cambia el significado.
- Material didactico de ruso como lengua extranjera: permite generar ejemplos de pronunciacion con el acento lexico correcto y comparar pares minimos (por ejemplo "замок" castillo frente a "замок" cerradura), lo que resulta util para estudiantes que no dominan las reglas de acentuacion.
- Diccionarios y aplicaciones de aprendizaje: la API de sintesis acepta una marca por palabra, de modo que se puede generar la pronunciacion de una entrada concreta sin ambiguedad, integrándose en un backend que sirva audio bajo demanda.
- Locucion corporativa y sistemas IVR en ruso: con una referencia de 5-15 segundos se clona la voz de la marca y se generan menus, avisos y mensajes de estado manteniendo un timbre consistente entre fragmentos.
- Doblaje y posproduccion de video: al poder fijar el acento por marca, se evita la reescritura de guiones para esquivar homografos; la recomendacion del autor de sintetizar por frases y concatenar encaja con flujos de doblaje por subtitulo.
- Accesibilidad y lectores de pantalla: lectura en voz alta de documentos en ruso donde aparecen fechas, cifras y abreviaturas, que deben expandirse a palabras antes de la entrada porque el normalizador integrado se desactiva.
- Generacion de audios de noticias o pódcast en fase de preproduccion: permite validar guiones completos con voz clonada antes de grabar con locutor humano, siempre que se revise la salida por los fallos aleatorios de pronunciacion que documenta el autor.
- Herramientas de logopedia y terapia del habla: la posibilidad de marcar explicitamente la tonica permite construir ejercicios controlados, aunque la falta de mediciones objetivas obliga a validacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica de forma explicita que no existen mediciones formales: la validacion se hizo "a oido" sobre conjuntos de homografos, acentos deliberadamente incorrectos y textos reales, con varias voces. Tampoco se proporcionan cifras de latencia, tiempo real (RTF), MOS ni comparaciones objetivas con otros sistemas.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parametros (2,29 mil millones); no son cifras oficiales publicadas por el autor:

- VRAM en bf16/fp16: en torno a 4,6 GB solo para los pesos, mas el consumo de activaciones y modulos auxiliares; en la practica, 6-8 GB.
- VRAM en fp32: unos 9,2 GB solo para pesos; el repositorio de 5,0 GB sugiere que los pesos distribuidos no estan en fp32.
- VRAM en int8 (cuantizacion manual): aproximadamente 2,3 GB.
- VRAM en int4 (cuantizacion manual): aproximadamente 1,2 GB, aunque no se publican recetas de cuantizacion y la calidad de un decodificador iterativo suele degradarse con precision reducida.
- GPU consumer: cabe en tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) en fp16; en 6 GB es ajustado y depende del modo de clonacion y del denoiser.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias por tamano, pero permiten mayor paralelismo si se sirve por lotes.
- Despliegue: la via documentada es la libreria Python `voxcpm` con `VoxCPM.from_pretrained(...)` y escritura a WAV con `soundfile`. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF; el caracter iterativo del decodificador acustico hace que las rutas de inferencia de texto (llama.cpp, vLLM) no sean aplicables directamente.
- Latencia y throughput: no disponible. Los ejemplos usan `inference_timesteps=10` y `cfg_value=2.0`, lo que sugiere que el coste por fragmento depende del numero de pasos de muestreo.
- Consideracion practica: como el autor recomienda sintetizar por frases, en produccion conviene un pequeno orquestador que divida el texto, mantenga el mismo archivo de referencia y concatene los WAV resultantes.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Control de acento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shtorm-VoxCPM2-RU | 2,29 B | ruso | si, marca `+` antes de la tonica | Apache-2.0 | HuggingFace, libreria `voxcpm` |
| openbmb/VoxCPM2 (base) | no disponible (mismo orden de magnitud) | no disponible | no | Apache-2.0 segun la model card del fine-tune | HuggingFace |
| Silero TTS | no disponible | ruso (entre otros) | no disponible | no disponible | repositorio silero-models |
| XTTS-v2 (Coqui) | no disponible | multilingue, incluye ruso | no disponible (control via fonemas) | Coqui Public Model License, uso no comercial | HuggingFace |

Los datos de parametros, contexto y rendimiento de Silero TTS y XTTS-v2 no aparecen en la informacion proporcionada y se marcan como no disponibles. La comparacion relevante para este fine-tune es con su propio modelo base: mismo coste de inferencia, misma licencia, pero con la capacidad anadida de obedecer marcas de acento, a cambio de un alcance limitado al ruso y de un estado declarado como experimental.

## Limitaciones y advertencias

- Estado experimental "tal cual", sin evaluacion formal publicada; no hay MOS, RTF ni comparaciones objetivas.
- Fallos aleatorios de pronunciacion en palabras sueltas; el autor recomienda regenerar con otra semilla.
- Errores de anotacion se reproducen tal cual: si el `+` esta mal colocado, la salida sera incorrecta; la calidad depende del anotador (humano o autoacentuador).
- En algunos contextos el modelo puede conservar un acento habitual en lugar del marcado.
- Validado con un numero limitado de voces; con referencias de voz muy distintas al conjunto de prueba hay que verificar el resultado.
- No conviene anotar palabras monosilabas: la etiqueta se interpreta como enfasis y la diccion se vuelve arrastrada.
- La letra `ё` no debe marcarse porque ya es tonica.
- Numeros, fechas y abreviaturas deben escribirse como palabras antes de la entrada, y hay que pasar `normalize=False` porque el normalizador integrado puede destruir las marcas.
- Textos largos deben trocearse por frases con una misma referencia y concatenarse; no hay gestion de contexto largo documentada.
- Cobertura limitada al ruso; no hay capacidades multilingues.
- Licencia Apache-2.0: permite uso comercial siempre que se conserven los avisos de copyright y licencia y se indique si se han introducido modificaciones; conviene revisar tambien las condiciones de los datos de entrenamiento del modelo base, no detalladas.
- La clonacion de voz exige consentimiento explicito de la persona cuya voz se usa como referencia; en la Union Europea el uso de sintesis de voz clonada entra en el ambito del Reglamento de IA (obligaciones de transparencia sobre contenido generado).
- Riesgo de sesgo acustico y prosodico hacia el timbre y el estilo de las voces empleadas en el ajuste; no hay analisis de sesgos publicado.
- Riesgo de alucinacion acustica (pronunciacion inventada, ruidos o cortes) inherente a los decodificadores generativos de audio; en produccion se recomienda verificacion automatica con reconocimiento de voz sobre la salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArtShtorm/Shtorm-VoxCPM2-RU
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Organizacion OpenBMB en HuggingFace: https://huggingface.co/openbmb
- La busqueda web realizada no devolvio resultados relevantes para este modelo (unicamente enlaces de Outlook, sin relacion con el contenido); no se dispone de articulos, papers, demos ni repositorios adicionales verificados en la informacion proporcionada.
