# experimentalmachines/LFM3-VL-2B-MobileAgent-LiteRT

## Resumen

LFM3-VL-2B-MobileAgent-LiteRT es la version compilada en formato LiteRT del modelo LFM3-VL-2B-MobileAgent, un modelo vision-lenguaje de 2B parametros especializado en operar telefonos moviles a partir de capturas de pantalla. Lo desarrolla experimentalmachines y se distribuye como un unico fichero `.litertlm` de 2,8 GB pensado para ejecutarse en la GPU o CPU de un telefono Android mediante Google LiteRT-LM, sin necesidad de compilacion especifica por chip.

El modelo resuelve el problema del control de interfaces moviles por agentes autonomos: recibe una captura de pantalla por paso, junto con el objetivo del usuario, las aplicaciones instaladas y el historial de los ultimos 8 pasos, y devuelve una intencion corta y una accion JSON compacta con coordenadas sobre una rejilla 0-1000. Es relevante porque demuestra inferencia on-device de un agente GUI multimodal con latencias de unos 3,6 segundos por paso en un Snapdragon de referencia, sin depender de la nube.

La arquitectura subyacente es un vision encoder acoplado a un decoder de texto de tipo transformer de 2B parametros, con contexto de 4.096 tokens y una imagen fija de 1280 x 576 (720 tokens visuales). Esta version es la recomendada por el autor y la evaluada sobre semillas reservadas de AndroidWorld.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (vision encoder + decoder transformer), compilada con LiteRT-LM (tipo `fast_vlm`) |
| Parametros totales | 2B (heredados del modelo base LFM3-VL-2B-MobileAgent) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (un paso consume aproximadamente 1.300) |
| Tipos de cuantizacion | int8 por canal en decoder y embeddings de tokens; vision encoder en fp32; adaptador en fp16. Existe una variante int4 (2,07 GB) no publicada |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (license_name: lfm1.0, marcada como "other" en Hugging Face) |
| Formato de pesos | `.litertlm` (fichero unico de 2.760.755.451 bytes) mas `model.json` como sidecar de la app |

## Arquitectura y entrenamiento

El modelo es una compilacion del checkpoint LFM3-VL-2B-MobileAgent, no un entrenamiento nuevo. La receta de conversion usa litert-lm-builder 0.18.1 con el tipo de modelo `fast_vlm`, que combina un encoder visual y un decoder de texto en un grafo ejecutable por LiteRT-LM. La cuantizacion aplicada es int8 por canal en el decoder y en los embeddings de tokens, manteniendo el encoder visual en fp32 y el adaptador en fp16, lo que explica el tamano de 2,8 GB.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La innovacion tecnica principal de esta ficha es la conversion a LiteRT con paridad verificada frente al original en bf16: el peor coseno por token en las graficas de vision es 0,99999985 sobre 720 tokens en CPU de Mac, y en la GPU del telefono este fichero y el mismo fichero en Mac eligen la misma accion en el 99,4% de 180 pasos. Ademas, el flag `filter_channel_content_from_kv_cache=False` ahorra unos 3,5 segundos por llamada en el telefono al no filtrar el canal de pensamiento de la cache KV.

## Capacidades

- Generacion de acciones GUI a partir de una captura de pantalla: devuelve un JSON compacto con `action_type`, coordenadas en rejilla 0-1000 y parametros de la accion.
- Modo de razonamiento corto: emite `` antes de la accion; con thinking activado, LiteRT-LM expone la intencion en el canal `thought` y el JSON como texto.
- Comprension de capturas de pantalla de movil en formato fijo 1280 x 576 (720 tokens de imagen).
- Seguimiento de objetivos multi-paso con historial de los ultimos 8 pasos y lista de aplicaciones instaladas en el prompt.
- Ejecucion on-device en GPU o CPU de Android mediante LiteRT-LM, sin compilacion por chip.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles.
- Capacidades de audio: no disponible.

## Casos de uso

- Automatizacion de tareas repetitivas en Android: el modelo recibe una captura por paso y emite la accion correspondiente (abrir app, pulsar, escribir), lo que permite encadenar flujos como configurar ajustes o rellenar formularios con un agente que corre en el propio telefono.
- Asistencia a usuarios con movilidad reducida: al operar la interfaz desde capturas y devolver acciones JSON, se puede integrar en una app de accesibilidad que traduzca ordenes en lenguaje natural a pulsaciones concretas, con la ventaja de que no requiere enviar pantallas a la nube.
- Pruebas automatizadas de apps moviles: el modelo puede servir como oraculo de interaccion en pipelines de QA que simulan usuarios sobre emuladores o dispositivos reales, generando secuencias de acciones a partir de un objetivo descrito en texto.
- Demostraciones y prototipado de agentes GUI: con 3,6 segundos por paso en un Snapdragon de referencia y un contexto de 4.096 tokens, es viable construir prototipos de agentes que quepan en un telefono de gama alta sin infraestructura de servidor.
- Investigacion en agentes multimodales on-device: el formato LiteRT y la paridad documentada frente a bf16 permiten estudiar el impacto de la cuantizacion int8 en la precision de acciones GUI con un baseline reproducible.
- Navegacion guiada por voz en dispositivos: combinado con un motor de reconocimiento de voz local, el modelo puede traducir instrucciones habladas a acciones sobre la pantalla, manteniendo los datos del usuario en el dispositivo.
- Evaluacion de robustez de interfaces: al puntuar la distancia de clic respecto a una referencia (percentil 90 de 2 sobre rejilla 0-1000 en este fichero), se puede usar para detectar elementos de UI mal etiquetados o ambiguos.

## Benchmarks y rendimiento

Resultados sobre 180 pasos de test de AndroidControl (episodios oficiales de test, prompt de Main, capturas redimensionadas como en entrenamiento). Referencia: modelo original en Transformers bf16. Puntuacion segun la regla del benchmark offline.

| Metrica | bf16 original | GGUF Q4_K_M (llama.cpp) | Este fichero, en telefono |
|---|---|---|---|
| Precision por paso | 0,772 | 0,800 | 0,783 |
| Misma accion que bf16 | — | 0,894 | 0,906 |
| Distancia de clic frente a bf16, percentil 90 (rejilla 0-1000) | — | 5 | 2 |

- Precision: sin diferencia detectada. Este fichero en telefono frente a bf16: +1,1 puntos, intervalo del 95% de -2,0 a +4,2.
- Graficas de vision: peor coseno por token de 0,99999985 sobre 720 tokens en CPU de Mac; en GPU de telefono, este fichero y el mismo en Mac eligen la misma accion en el 99,4% de los 180 pasos.
- Pasos de "tarea completada": sobre 60 de ellos, este fichero puntua 0,683 y el GGUF 0,650 (Mac).

Rendimiento en telefono de referencia Snapdragon SM8975 (Qualcomm Device Cloud), Android 17, GPU para texto y vision, prompt de unos 1.300 tokens:

| Ajuste | Llamada al modelo |
|---|---|
| 180 pasos de test, uno tras otro | 3,63 s de mediana (estado termico subio de 1 a 3) |
| 10 llamadas sobre una misma captura, telefono ya caliente | 3,53 s de mediana (reloj de GPU limitado a 636 de 1.450 MHz) |

La variante int4 de 2,07 GB tardo 2,46 s en un telefono frio del mismo modelo, pero se aleja mas del original (misma accion que bf16 en el 84% de los pasos) y no esta publicada.

## Requisitos de hardware

- VRAM / memoria: el fichero pesa 2,76 GB; en Android se ejecuta sobre la memoria unificada del telefono, no se especifica RAM minima en la informacion disponible.
- GPU recomendadas: probado en Snapdragon SM8975 (Qualcomm Device Cloud) con backend GPU para texto y vision; tambien funciona en CPU (validado en CPU de Mac).
- Cabe en GPU de consumo: no se han publicado pruebas en GPU de escritorio; el formato LiteRT esta orientado a movil y a CPU/GPU de Android.
- Opciones de despliegue: LiteRT-LM 0.19.1 (Python en Mac, Kotlin en Android), con `litert_lm.Engine` y seleccion de backend GPU o CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este fichero; existe una version GGUF Q4_K_M del modelo base para llama.cpp.
- Latencia: 3,63 s de mediana por paso en 180 pasos consecutivos; 3,53 s de mediana con telefono caliente y GPU limitada a 636 MHz.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision AndroidControl (paso) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-LiteRT (este) | 2B | 4.096 | 0,783 en telefono | lfm1.0 | LiteRT, 2,8 GB |
| LFM3-VL-2B-MobileAgent (bf16) | 2B | 4.096 | 0,772 | lfm1.0 | Transformers, bf16 |
| LFM3-VL-2B-MobileAgent GGUF Q4_K_M | 2B | 4.096 | 0,800 | lfm1.0 | llama.cpp |
| Otros agentes GUI moviles | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base documentadas por el autor; no se dispone de datos de benchmarks de modelos alternativos de agente GUI movil en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe operar de forma desatendida en un telefono con cuentas reales, mensajes o pagos.
- Exito de tarea bajo: completo 3 de 11 tareas cotidianas en telefono. Los fallos son coherentes con debilidades conocidas: bucles de `wait`, parada demasiado pronto o demasiado tarde y respuestas sin mirar la pantalla.
- Forma de pantalla fija: solo se entreno con capturas redimensionadas a 1280 x 576 (aproximadamente 20:9 vertical, como 1080 x 2400 o 1440 x 3200). Otras proporciones, horizontal o plegables se estiran y degradan el rendimiento.
- Idioma: solo ingles; no hay soporte multilingue documentado.
- Licencia lfm1.0: es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial; la model card la marca como "other".
- Contexto limitado a 4.096 tokens, con unos 1.300 consumidos por paso, lo que restringe el historial a los ultimos 8 pasos.
- Riesgo de alucinacion: el modelo puede emitir acciones sin inspeccionar la captura, segun los propios fallos reportados por el autor.
- Sesgos: no disponible en la informacion proporcionada.
- Solo probado en un modelo de telefono (Snapdragon SM8975); el rendimiento en otros chips no esta validado.

## Enlaces

- Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-LiteRT
- Modelo base: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Repositorio de la app Mobile Agent: https://github.com/ExperimentalMachines/mobile-agent
- Repositorio lfm3-mobile-agent (formato de prompt y entrenamiento): https://github.com/experimentalmachines/lfm3-mobile-agent
- Guia de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- LiteRT-LM de Google: https://github.com/google-ai-edge/LiteRT-LM
