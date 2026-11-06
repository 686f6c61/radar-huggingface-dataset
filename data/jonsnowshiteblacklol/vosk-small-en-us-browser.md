# jonsnowshiteblacklol/vosk-small-en-us-browser

## Resumen

`jonsnowshiteblacklol/vosk-small-en-us-browser` es un reempaquetado del modelo de reconocimiento de voz **vosk-model-small-en-us-0.15** desarrollado por Alpha Cephei, publicado en Hugging Face por un tercero. No se trata de un modelo nuevo ni de un entrenamiento propio: el autor declara explicitamente que los ficheros del modelo son identicos a los originales y que el unico cambio es el formato de empaquetado, rearchivando el zip original como `vosk-small-en.tar.gz` para que la libreria `vosk-browser` pueda cargarlo directamente en una pagina web. La licencia se mantiene como Apache 2.0, la misma del modelo original.

El modelo pertenece a la familia Vosk, un conjunto de reconocedores de voz ligeros basados en Kaldi y pensados para ejecucion offline en dispositivos con recursos limitados. La variante "small" en ingles estadounidense esta disenada para funcionar en navegador y en hardware modesto (incluso Raspberry Pi), priorizando huella reducida y latencia baja sobre precision maxima. Este repositorio concreto esta pensado para el juego de navegador *My Little Sister Can't Drive*, que lo usa para comandos de voz locales sin conexion.

La relevancia de este repositorio es limitada y muy especifica: sirve como artefacto listo para consumir desde `vosk-browser` sin necesidad de desempaquetar el zip de Alpha Cephei manualmente. Para cualquier uso en produccion conviene acudir directamente a la distribucion oficial de Vosk, ya que este repositorio es un espejo de conveniencia sin mantenimiento declarado, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocimiento de voz basado en Kaldi (modelo acustico + grafo de decodificacion), segun la familia Vosk; detalles exactos no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de ASR por streaming, no de texto) |
| Tipos de cuantizacion | no disponible (Vosk distribuye modelos preentrenados en un unico formato, sin variantes de cuantizacion publicadas en este repo) |
| Idiomas soportados | Ingles estadounidense (en-us), segun el nombre del modelo original |
| Licencia | Apache 2.0 |
| Formato de pesos | Archivo `vosk-small-en.tar.gz` con los ficheros del modelo Vosk sin modificar (formato propio de Kaldi/Vosk, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es `vosk-model-small-en-us-0.15` de Alpha Cephei, un reconocedor de voz de la familia Vosk construido sobre Kaldi. Vosk combina un modelo acustico con un grafo de decodificacion (HCLG) y esta optimizado para inferencia en streaming de baja latencia y con requisitos de memoria reducidos. La variante "small" sacrifica precision frente a las variantes "large" a cambio de un tamano mucho menor y velocidad en CPU, lo que la hace apta para navegador y dispositivos embebidos.

No se dispone de informacion sobre el numero de horas de audio de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste fino o adaptacion. El autor de este repositorio no aporta ningun dato de entrenamiento: su contribucion se limita al reempaquetado del archivo original en `.tar.gz` para su carga directa con `vosk-browser`. Cualquier detalle tecnico de entrenamiento debe consultarse en la documentacion oficial de Alpha Cephei.

## Capacidades

- Reconocimiento de voz automatico (ASR) en ingles estadounidense, en modo streaming y offline.
- Ejecucion en el navegador mediante la libreria `vosk-browser`, sin enviar audio a servidores externos.
- Funcionamiento en CPU, sin necesidad de GPU.
- Adecuado para comandos de voz de vocabulario acotado y dictado basico.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es multilingue: solo ingles estadounidense.
- No dispone de modo "thinking", vision ni audio generativo; es exclusivamente un transcriptor de audio a texto.

## Casos de uso

- Comandos de voz en juegos web: integracion con `vosk-browser` para controlar un juego en el navegador con ordenes habladas, tal como hace el proyecto *My Little Sister Can't Drive*. El modelo se carga como `.tar.gz` y procesa el audio del microfono localmente.
- Asistentes web con privacidad estricta: aplicaciones que necesitan dictado o comandos por voz sin enviar audio a la nube, aprovechando que la inferencia ocurre en el dispositivo.
- Prototipado rapido de interfaces de voz: equipos que quieren validar una UX de voz en una pagina web sin montar infraestructura de ASR en servidor.
- Accesibilidad en formularios web: dictado de campos de texto para usuarios con movilidad reducida, con la ventaja de que el audio no sale del navegador.
- Kioscos y demos offline: instalaciones sin conectividad que requieren reconocimiento de comandos basicos en ingles.
- Educacion y experimentacion: ejemplos docentes sobre ASR en el navegador con modelos ligeros y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no aporta metricas de WER, latencia ni throughput, y este repositorio no incluye evaluacion propia del modelo reempaquetado.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo capaz de ejecutar un navegador moderno; la variante "small" de Vosk esta pensada para hardware modesto, incluidos dispositivos tipo Raspberry Pi.
- Opciones de despliegue: `vosk-browser` en el navegador; tambien puede usarse con las librerias oficiales de Vosk (Python, Java, C, etc.) extrayendo el contenido del `.tar.gz`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vosk-small-en-us-browser (este repo) | ASR Kaldi/Vosk, reempaquetado | Ingles (en-us) | Variante "small" de Vosk | Apache 2.0 | Hugging Face (espejo de terceros) |
| vosk-model-small-en-us-0.15 (Alpha Cephei) | ASR Kaldi/Vosk, original | Ingles (en-us) | Variante "small" de Vosk | Apache 2.0 | Distribucion oficial de Alpha Cephei |
| Whisper small (OpenAI) | ASR transformer encoder-decoder | Multilingue | ~244M parametros (variante small) | MIT | OpenAI / Hugging Face |
| wav2vec 2.0 base (Meta) | ASR auto-supervisado | Multilingue (segun checkpoint) | ~95M parametros (base) | MIT / Apache 2.0 segun variante | Hugging Face |

La comparacion con Whisper y wav2vec 2.0 es orientativa por categoria (ASR), no por rendimiento medido: no se dispone de cifras de WER para este repositorio que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un espejo de terceros, no el repositorio oficial: no hay garantia de mantenimiento, actualizaciones ni soporte.
- Los ficheros del modelo no han sido modificados, pero el empaquetado en `.tar.gz` esta pensado especificamente para `vosk-browser`; otros consumidores deberan extraerlo.
- Solo reconoce ingles estadounidense; no es adecuado para otros idiomas ni para audio con acentos marcados fuera de su dominio de entrenamiento.
- Precision limitada por ser la variante "small": mayor tasa de error que las variantes "large" de Vosk o que modelos ASR mas grandes.
- Riesgo de transcripciones erroneas en audio con ruido, solapamiento de hablantes o vocabulario tecnico.
- No es un modelo generativo: no produce respuestas, solo transcripciones; no admite instrucciones ni razonamiento.
- Licencia Apache 2.0 permisiva para uso comercial, heredada del modelo original; conviene verificar los terminos en la distribucion oficial de Alpha Cephei.
- El nombre del repositorio y del autor no aportan garantias de calidad; para produccion se recomienda descargar el modelo directamente de alphacephei.com.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jonsnowshiteblacklol/vosk-small-en-us-browser
- Modelos oficiales de Vosk (Alpha Cephei): https://alphacephei.com/vosk/models
- Proyecto Vosk: https://alphacephei.com/vosk/
- Libreria `vosk-browser`: https://github.com/ccoreilly/vosk-browser
