# avencera/silero-vad-v5-safetensors

## Resumen

Silero VAD v5 es un detector de actividad de voz (VAD) desarrollado por el equipo de Silero (snakers4), aqui redistribuido en formato safetensors por el autor avencera para su uso nativo desde Rust en la libreria scriptrs. El modelo resuelve el problema de segmentar audio en regiones con y sin habla, una tarea previa imprescindible en pipelines de transcripcion de audio de larga duracion. Esta version concreta corresponde a Silero VAD 5.1.2, rama de 16 kHz, con los pesos sin modificar respecto al original.

La relevancia de esta ficha es acotada: no se trata de un modelo generativo ni de un LLM, sino de un componente especializado de 309.633 parametros que se ejecuta en CPU a una velocidad aproximada de 0,5 segundos por hora de audio. Su interes practico esta en la integracion con scriptrs, que lo combina por defecto con Silero VAD v6 para planificar la transcripcion long-form con Parakeet TDT 0.6B v3, quedandose con la probabilidad de habla mas alta de cada ventana.

El modelo es, por tanto, una pieza de infraestructura mas que un modelo de proposito general: su valor esta en la precision de deteccion en audio dificil (conversaciones ruidosas, reuniones con microfono lejano) y en el coste computacional minimo que anade al pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente (detector de actividad de voz); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 309.633 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa ventanas de audio a 16 kHz |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente float32; no confirmado) |
| Idiomas soportados | no disponible (el VAD es agnostico al idioma por diseno, pero no se documenta explicitamente) |
| Licencia | MIT (copyright Silero Team) |
| Formato de pesos | safetensors (un unico archivo `model.safetensors` de 1,2 MB) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de la version 5.1.2 de Silero VAD, rama de 16 kHz, con los pesos identicos a los del modelo original de Silero. La model card menciona explicitamente que el modelo tiene una "recurrencia" por pasos, lo que apunta a una arquitectura recurrente, pero no se detallan capas, dimensiones ocultas ni el esquema de entrenamiento. No se proporcionan datos sobre el numero de tokens de audio, la composicion del dataset ni si hubo tecnicas de ajuste fino especificas.

La innovacion destacable no esta en el modelo en si, sino en su empaquetado y explotacion: la conversion a safetensors permite cargarlo nativamente en Rust desde scriptrs y ejecutarlo en CPU, evitando el coste de lanzamiento de kernels que tendria cada paso de la recurrencia en GPU. Ademas, scriptrs lo ejecuta por defecto junto a Silero VAD v6 con un umbral de 0,6, combinando ambas probabilidades para mitigar los puntos ciegos de cada modelo.

## Capacidades

- Deteccion de actividad de voz en audio mono a 16 kHz, devolviendo probabilidad de habla por ventana.
- Segmentacion de audio de larga duracion para planificar la transcripcion alrededor de las regiones con habla.
- Ejecucion nativa en Rust sobre CPU mediante la libreria scriptrs.
- Integracion con el pipeline de transcripcion long-form de scriptrs junto a Parakeet TDT 0.6B v3.
- Combinacion con Silero VAD v6 (modo por defecto de scriptrs) tomando la probabilidad maxima de cada ventana.
- Buen comportamiento en audio ruidoso de tipo "dinner party" (CHiME-6), donde supera a v6.
- No soporta generacion de texto, tool calling, agentes, vision ni audio mas alla de la deteccion de voz.

## Casos de uso

- Planificacion de transcripcion long-form: scriptrs usa el modelo para detectar regiones con habla y evitar pasar silencio o musica al modelo ASR, reduciendo coste y errores en audios de horas de duracion.
- Procesamiento de grabaciones de reuniones: en el conjunto AMI con microfono de campo lejano obtiene un WER del 26,0 % con Parakeet v3, lo que lo hace util para diarizacion y transcripcion de salas.
- Audio de conversaciones sociales ruidosas: en CHiME-6 (cenas con multiples hablantes) alcanza un WER del 54,0 %, el mejor resultado individual de la comparativa, adecuado para analisis de audio realista y desordenado.
- Segmentacion previa en pipelines de subtitulado: permite cortar el audio en fragmentos con voz antes de enviarlos a un ASR, controlando la latencia y el consumo de recursos.
- Filtrado de silencio en herramientas de accesibilidad: deteccion de tramos con habla para generacion automatica de subtitulos en directo o transcripciones de clases y conferencias.
- Preprocesado en sistemas de atencion al cliente: identificar cuando un cliente habla en una llamada grabada para activar el reconocimiento de voz solo en esos tramos.
- Integracion en aplicaciones Rust de escritorio o servidor: al ejecutarse en CPU a 0,5 s por hora de audio, puede incorporarse en servicios sin GPU dedicada.

## Benchmarks y rendimiento

Los datos disponibles son de WER de transcripcion con Parakeet TDT 0.6B v3 en una RTX 5090, usando planificacion VAD long-form, comparando v5, v6 y la combinacion de ambos:

| Conjunto | v5 | v6 | v5 y v6 (por defecto en scriptrs) |
|---|---:|---:|---:|
| Habla dispersa, 24 % de habla (4,2 h) | **2,3 %** | 3,0 % | **2,3 %** |
| Earnings-21 (llamadas de resultados) | 8,4 % | **8,0 %** | **8,0 %** |
| AMI reuniones, mezcla de auriculares | 21,1 % | **20,7 %** | 20,8 % |
| AMI reuniones, microfono de campo lejano | 26,0 % | 25,6 % | **25,3 %** |
| CHiME-6 cenas | 54,0 % | 61,9 % | **53,4 %** |

v5 y v6 en solitario usan un umbral de habla de 0,5. El conjunto de habla dispersa son utterances de LibriSpeech test-clean separadas por 15 a 75 s de musica de cine, efectos, ambiente y ruido de bajo nivel.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ejecutarse en CPU, con un coste aproximado de 0,5 s por hora de audio.
- VRAM: no requiere GPU; el archivo de pesos ocupa 1,2 MB.
- GPU recomendadas: no aplica; la model card indica que en GPU cada paso de la recurrencia costaria mas en lanzamientos de kernels que el paso completo en CPU.
- Cabe en cualquier maquina consumer, incluidos equipos sin GPU dedicada.
- Despliegue: mediante la libreria Rust scriptrs con las features `cuda` y `vad` (la feature `cuda` se usa para el pipeline ASR, no para el VAD).
- Latencia y throughput: aproximadamente 0,5 s de computo por hora de audio en CPU, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Silero VAD v5 (esta ficha) | 309.633 | VAD recurrente, 16 kHz | MIT | HuggingFace (avencera/silero-vad-v5-safetensors) |
| Silero VAD v6 | no disponible | VAD, mejor separacion habla/no habla en la mayoria de audio | MIT (presumible, no confirmado) | HuggingFace (avencera/silero-vad-v6-safetensors) |
| Silero VAD original (snakers4) | no disponible | VAD de referencia, pesos originales | MIT | GitHub snakers4/silero-vad |

No se dispone de datos de otros detectores de voz comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un detector de voz, no un modelo de lenguaje: no genera texto ni mantiene conversaciones.
- En la mayoria de conjuntos v6 supera a v5 en solitario; v5 destaca sobre todo en audio muy ruidoso (CHiME-6), por lo que usarlo aislado puede degradar resultados en llamadas y reuniones limpias.
- El umbral recomendado difiere segun el modo: 0,5 en solitario y 0,6 en la combinacion con v6.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma; al ser un VAD, el riesgo principal es la clasificacion erronea de musica o ruido como habla.
- La licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright de Silero Team.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada (2026) resulta anomala; conviene verificar la procedencia y la integridad del archivo mediante el SHA-256 publicado.
- Depende de la libreria scriptrs para su uso previsto; no se documenta soporte en otros runtimes.

## Enlaces

- HuggingFace: https://huggingface.co/avencera/silero-vad-v5-safetensors
- Silero VAD v6 (compañero): https://huggingface.co/avencera/silero-vad-v6-safetensors
- Repositorio original de Silero VAD: https://github.com/snakers4/silero-vad
- Libreria scriptrs: https://github.com/avencera/scriptrs
