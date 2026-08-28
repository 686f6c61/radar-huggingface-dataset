# desert-ant-labs/align

## Resumen

Align es un modelo de refinamiento de marcas temporales a nivel de palabra (word-timestamp refinement) desarrollado por Desert Ant Labs, un laboratorio europeo especializado en modelos de IA on-device. Su función es corregir los tiempos de inicio y fin que devuelven los pipelines de transcripción de Apple (`SpeechTranscriber` y `SpeechAnalyzer`) sin reemplazarlos, observando el mismo audio que el analizador ya recibe y ejecutando una pequeña cascada de Core ML en CPU y Neural Engine. El resultado es una mejora sustancial de la precisión temporal, con un error medio que se reduce en un 60% tanto en condiciones limpias como ruidosas.

El modelo se compone de dos etapas convolucionales compactas (coarse y fine) de aproximadamente 117 000 parámetros cada una, más un calibrador basado en árboles gradient-boosted. El paquete completo compilado para Core ML ocupa unos 700 KB y refina una transcripción típica en unos pocos milisegundos en el dispositivo. Align soporta nueve idiomas (inglés, español, francés, italiano, portugués, alemán, japonés, coreano y chino) mediante condicionamiento léxico con características de bytes UTF-8 y un identificador de idioma. Su relevancia actual radica en que permite obtener marcas temporales precisas en aplicaciones iOS, macOS, tvOS y visionOS sin depender de servicios en la nube, mejorando la experiencia en subtitulado, accesibilidad y análisis de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada coarse-to-fine de modelos convolucionales compactos + calibrador de gradient-boosted trees |
| Parametros totales | Aproximadamente 234 000 en las etapas convolucionales (117 000 por etapa); parametros del calibrador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de analisis: 2,4 s (etapa coarse) y 0,8 s (etapa fine) |
| Tipos de cuantizacion | FP16 (Core ML compilado), FP32 (checkpoints PyTorch) |
| Idiomas soportados | Ingles, espanol, frances, italiano, portugues, aleman, japones, coreano y chino |
| Licencia | Desert Ant Labs Source-Available License 1.0 (free para la mayoria de apps, licencia comercial requerida a escala) |
| Formato de pesos | .mlmodelc (Core ML compilado), .pt (PyTorch), .bin (filtros y calibrador) |

## Arquitectura y entrenamiento

Align utiliza una arquitectura de dos etapas en cascada sobre un espectrograma log-mel calculado con Accelerate/vDSP. La etapa coarse busca en un contexto de 2,4 s (241 frames) alrededor de la frontera propuesta por Apple y predice una distribucion sobre frames. La etapa fine re-busca en un recorte de 0,8 s (81 frames) recentrado en la prediccion coarse para obtener una estimacion mas ajustada. Cada etapa opera con batch fijo de 16 en CPU y Neural Engine. Un calibrador de gradient-boosted trees mapea las caracteristicas de incertidumbre de ambas etapas a una correccion final, ajustado solo sobre el split de validacion para reducir regresiones grandes. Ademas, existe un fallback estructural que mantiene la marca temporal original de Apple si la correccion propuesta es invalida, toca el borde de la ventana o carece de contexto de streaming.

El entrenamiento se realizo sobre audio multilingue de FLEURS (CC BY 4.0) y las referencias de fronteras de palabras se obtuvieron de Qwen3-ForcedAligner-0.6B (Apache-2.0) para los nueve idiomas. OWSM-CTC v4 1B (CC BY 4.0) se utilizo como comprobacion de outliers gruesos. Las propuestas genuinas de Apple `SpeechAnalyzer` se recolectaron en macOS 26. No se empleo RLHF ni DPO; el ajuste es puramente supervisado sobre las referencias de forced alignment.

## Capacidades

- Refinamiento de marcas temporales a nivel de palabra para transcripciones de Apple `SpeechTranscriber` y `SpeechAnalyzer`.
- Correccion de tiempos de inicio y fin de cada palabra, devolviendo el mismo conjunto de palabras con `audioTimeRange` ajustado.
- Soporte multilingue para nueve idiomas: ingles, espanol, frances, italiano, portugues, aleman, japones, coreano y chino.
- Ejecucion completamente on-device en CPU y Neural Engine, sin conexion a internet.
- Integracion nativa con el SDK Swift de Desert Ant Labs (desert-ant-core) para iOS, macOS, tvOS y visionOS.
- Condicionamiento lexico mediante caracteristicas de bytes UTF-8 de las palabras vecinas y un identificador de idioma, permitiendo un unico modelo para todos los idiomas.
- Fallback estructural que preserva la marca temporal original de Apple cuando una correccion no es segura o carece de contexto de streaming.
- Checkpoints PyTorch incluidos para reentrenamiento o uso en otros runtimes.

## Casos de uso

- Subtitulado automatico en aplicaciones de video: Align corrige los tiempos de las palabras transcritas por Apple, de modo que los subtitulos aparecen sincronizados con el habla en escenas rapidas o con ruido de fondo, mejorando la legibilidad en reproductores de video nativos de iOS y macOS.
- Accesibilidad para personas con discapacidad auditiva: en apps de llamadas o videoconferencias, los subtitulos en tiempo real con marcas temporales precisas permiten seguir conversaciones grupales sin desfases, especialmente en entornos ruidosos donde el error de Apple puede superar los 120 ms.
- Notas de voz y grabacion de reuniones: las apps de notas que transcriben audio pueden usar Align para indexar las palabras con sus tiempos exactos, permitiendo saltar directamente a un fragmento concreto de la grabacion al tocar una palabra.
- Aplicaciones de karaoke o sincronizacion de letras: Align ajusta los tiempos de las frases para que las letras se resalten en el momento exacto en que se pronuncian, mejorando la experiencia en apps de musica y aprendizaje de idiomas.
- Analisis linguistico y fonetico: investigadores que necesitan alineaciones palabra-audio precisas pueden usar Align como post-procesador de transcripciones de Apple, reduciendo el error medio de 113 ms a 45 ms en audio limpio, lo que facilita estudios de pronunciacion o dialectologia.
- Asistentes de voz con resaltado de comandos: en apps de domotica o asistentes personales, Align permite resaltar visualmente la palabra clave reconocida en pantalla con su tiempo exacto, mejorando la retroalimentacion visual del usuario.
- Traduccion simultanea con subtitulos sincronizados: al combinar la transcripcion de Apple con un motor de traduccion, Align asegura que los subtitulos traducidos aparezcan en el momento correcto, incluso en conversaciones rapidas o con acentos.
- Herramientas de edicion de audio y video: los editores pueden usar Align para generar marcadores precisos de cada palabra en una pista de voz, facilitando el corte de silencios o la sincronizacion de efectos sonoros con el dialogo.

## Benchmarks y rendimiento

La evaluacion se realizo sobre el runtime Swift exacto y los modelos Core ML incluidos, con 223 grabaciones limpias y 210 ruidosas de grupo hold-out en los nueve idiomas, contra referencias de forced alignment. El error se mide como distancia absoluta media desde la frontera de referencia.

| Condicion | Error de Apple (ms) | Error con Align (ms) | Reduccion | Mediana (ms) | Dentro de 50 ms |
|---|---:|---:|---:|---:|---:|
| Limpio | 113,5 | 44,9 | 60% | 28,2 | 75,1% |
| Ruidoso | 124,4 | 50,1 | 60% | 32,0 | 69,4% |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ya que Align no es un modelo de lenguaje general sino un refinador de marcas temporales de audio.

## Requisitos de hardware

- Tamano compilado de 700 KB (Core ML), con dos etapas de 300 KB cada una, filtros de 40 KB y calibrador de 70 KB.
- Ejecucion en CPU y Neural Engine de dispositivos Apple (iOS, macOS, tvOS, visionOS); no requiere GPU dedicada.
- Inferencia en unos pocos milisegundos por palabra en dispositivos Apple modernos, gracias al batch fijo de 16 y a la pequena cantidad de parametros.
- No es necesario un servidor ni GPU de centro de datos; funciona completamente offline en el dispositivo.
- Despliegue mediante el SDK Swift `desert-ant-core` (version 3.0.0 o superior) con el producto `Align`; tambien se pueden usar los checkpoints PyTorch para otros runtimes.
- Compatible con vLLM, llama.cpp u Ollama? No, estos son para modelos de lenguaje; Align se integra via Core ML y el SDK propietario.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados de modelos similares en la misma tarea (refinamiento de marcas temporales on-device para Apple). Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Align (Desert Ant Labs) | ~234k (etapas conv.) | 2,4 s + 0,8 s | Source-available 1.0 | Cascada coarse-to-fine sobre log-mel, on-device Core ML |
| Qwen3-ForcedAligner-0.6B | 0,6B | No especificado | Apache-2.0 | Forced alignment generico, no on-device, usado como referencia de entrenamiento |
| Apple SpeechAnalyzer (sin Align) | No disponible | No disponible | Propietario | Transcripcion con marcas temporales basicas, error medio de 113-124 ms |

La comparacion cuantitativa con Qwen3-ForcedAligner no esta disponible en la informacion proporcionada. Align se distingue por su tamano minimo, su ejecucion en dispositivo y su integracion directa con el ecosistema Apple.

## Limitaciones y advertencias

- Las referencias de evaluacion son estimaciones de forced alignment automatico, no anotaciones humanas, por lo que las cifras muestran una reduccion consistente del error de Apple pero no una precision a nivel de muestra de audio.
- Una correccion aprendida no garantiza mejorar cada frontera individual; el fallback estructural preserva la marca original cuando la correccion parece insegura, pero no puede detectar todos los errores plausibles.
- Los idiomas ingles, italiano, japones y coreano son los mas debiles bajo la convencion de referencia actual.
- La licencia es source-available, no open source: es gratuita para la mayoria de aplicaciones, pero se requiere una licencia comercial a escala; revisar los terminos completos en https://license.desertant.com/1.0.
- Align solo funciona como post-procesador de las transcripciones de Apple; no es un sistema de reconocimiento de voz autonomo y no soporta idiomas fuera de los nueve listados (los locales fuera de ese conjunto se pasan sin cambios).
- El modelo esta optimizado para el runtime Swift de Desert Ant Labs; su uso fuera de ese SDK requiere adaptacion de los checkpoints PyTorch y de los archivos de configuracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/align
- Documentacion del SDK y ejemplos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/align.md
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Sitio web de Desert Ant Labs: https://desertant.com/
- Perfil de la organizacion en Hugging Face: https://huggingface.co/desert-ant-labs
- Licencia: https://license.desertant.com/1.0
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Qwen3-ForcedAligner-0.6B: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
