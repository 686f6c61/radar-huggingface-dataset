# mZahran001/tasbeeh-kws

## Resumen

Tasbeeh keyword-spotting heads es un conjunto de cinco clasificadores binarios ONNX de muy pequeño tamaño (aproximadamente 860 KB cada uno) desarrollados por mZahran001 para detectar frases de dhikr en audio continuo de micrófono abierto. No es un modelo de lenguaje generativo, sino un sistema de keyword spotting construido sobre la arquitectura de openWakeWord: se congelan las características `speech_embedding` de Google (16 frames x 96 dimensiones extraídas de 2 segundos de audio, con 0,125 s por frame) y se entrena una cabeza DNN independiente por cada frase. El modelo resuelve un problema muy concreto: contar automáticamente repeticiones de dhikr en una aplicación on-device, encadenando una puerta VAD/energía, ventanas deslizantes de 2 segundos, una puntuación por frase y un contador con periodo refractario.

Las cinco frases cubiertas son subhanallah, alhamdulillah, allahuakbar, la_ilaha_illa_allah y astaghfirullah, todas en árabe. El resultado es un componente extremadamente ligero pensado para ejecutarse en CPU de teléfonos y dispositivos embebidos, sin GPU y sin conexión a red. Su relevancia actual radica en que demuestra un flujo completo de entrenamiento sintético (TTS con condicionamiento dialectal, reverberación y aumento de ruido) para llevar wake-word detection a un dominio religioso y multilingüe poco cubierto por los modelos comerciales, con licencia Apache 2.0 y dependencia exclusiva de ONNX Runtime y openWakeWord.

El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, y un tamaño reportado de 0,0 GB, coherente con los cinco ficheros ONNX diminutos más un informe de evaluación. Todos los datos de evaluación son sintéticos, tal y como advierte el propio autor, por lo que se trata de un punto de partida para prototipado más que de un modelo listo para producción sin recalibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas DNN clasificadoras binarias sobre características congeladas `speech_embedding` de Google, siguiendo el esquema de openWakeWord (no es un transformer) |
| Parametros totales | no disponible (cada fichero ONNX ocupa ~860 KB; 5 cabezas en total) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ventana de análisis de 2 s (16 frames x 96 dimensiones, 0,125 s por frame) |
| Tipos de cuantizacion | no disponible; la entrada es float32 y no se documenta cuantización de los pesos |
| Idiomas soportados | Árabe (ar), con 7 dialectos empleados en el entrenamiento: MSA, EGY, SAU, IRQ, MAR, ALG y UAE |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (5 ficheros `tasbeeh_<phrase>.onnx`) y `eval_report.json` |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón de openWakeWord: un extractor de características congelado (`speech_embedding` de Google) convierte cada ventana de 2 segundos de audio en una matriz de 16 frames por 96 dimensiones, a razón de 0,125 segundos por frame. Sobre esas características se entrena una cabeza DNN independiente por frase, que produce una puntuación binaria de pertenencia. El pipeline de inferencia completo que propone el autor es: puerta VAD o de energía, ventanas deslizantes de 2 segundos evaluadas cada 80 ms, disparo cuando la puntuación es mayor o igual al umbral, y contador con periodo refractario de aproximadamente 1,2 segundos.

El entrenamiento se realizó con `Model.auto_train` de openWakeWord, 25 000 pasos por frase y entropía cruzada binaria. Los positivos son 449 clips sintéticos que combinan 5 frases, 3 variantes textuales, 7 dialectos árabes y 4 velocidades de habla, sintetizados con SWivid/Habibi-TTS (basado en F5-TTS) y posteriormente sometidos a reverberación RIR y aumento de ruido en 8 rondas. Como negativos adversarios se usaron clips similares pero no pertenecientes al dhikr generados con el mismo pipeline de TTS. Como negativos generales se emplearon unos 2700 segmentos de 2 segundos de Common Voice árabe (partición de validación, filtrando las frases que contienen dhikr) más el conjunto de validación de falsos positivos de openWakeWord, con 481 000 ventanas.

No se documenta ningún uso de RLHF ni DPO, ya que no se trata de un modelo generativo. La innovación técnica destacable es doble: por un lado, el uso de TTS con condicionamiento dialectal para generar datos de entrenamiento en un dominio con poca disponibilidad de corpus etiquetados; por otro, el diseño de las cabezas sobre un extractor de características compartido, lo que mantiene el coste de cómputo y de memoria en el orden de kilobytes.

## Capacidades

- Detección binaria de palabras clave (keyword spotting) para cinco frases de dhikr: subhanallah, alhamdulillah, allahuakbar, la_ilaha_illa_allah y astaghfirullah.
- Funcionamiento en streaming sobre micrófono abierto continuo, con ventanas deslizantes de 2 segundos evaluadas cada 80 ms.
- Contaje de repeticiones mediante umbral de puntuación y periodo refractario configurable, orientado a construir un contador de tasbeeh.
- Ejecución on-device: los ficheros son ONNX y se ejecutan con ONNX Runtime en CPU, sin necesidad de GPU ni de conexión de red.
- Soporte multilingüe limitado al árabe, con cobertura de siete variantes dialectales en los datos de entrenamiento.
- Integración con el ecosistema openWakeWord, incluyendo su extractor de características y sus utilidades de validación de falsos positivos.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, function calling ni capacidades de agente. Tampoco incorpora modo de pensamiento ni procesamiento de audio más allá de la clasificación por frase.

## Casos de uso

- Contador de tasbeeh en aplicación móvil: la app captura audio con el micrófono, aplica la puerta VAD, extrae las características con openWakeWord y consulta la cabeza correspondiente a la frase seleccionada; al superar el umbral de 0,3 incrementa el contador, con un refractario de 1,2 segundos para no contar dos veces la misma emisión.
- Dispositivo dedicado de sobremesa para mezquita u hogar: al ejecutarse en CPU con ficheros de menos de 1 MB por cabeza, puede desplegarse en placas tipo Raspberry Pi o en microcontroladores con ONNX Runtime, ofreciendo un contador físico sin pantalla táctil ni pulsaciones manuales.
- Integración en asistentes de voz existentes: al compartir el mismo extractor de características que openWakeWord, las cabezas pueden añadirse a un pipeline que ya detecta wake words convencionales, activando rutinas específicas cuando se reconoce un dhikr.
- Accesibilidad para personas con movilidad reducida: el contaje por voz elimina la necesidad de manipular cuentas físicas o pantallas, lo que resulta útil en contextos de movilidad limitada o durante la conducción.
- Análisis offline de sesiones grabadas: procesando un fichero de audio en lotes con ONNX Runtime se puede reconstruir cuántas veces se repitió cada frase en una sesión, útil para aplicaciones de seguimiento de hábitos o investigación sobre práctica religiosa.
- Control por voz en entornos de manos ocupadas: en talleres, cocinas o laboratorios donde no se pueden usar las manos, la detección de la frase elegida puede disparar acciones simples como marcar un intervalo o registrar una repetición.
- Prototipado rápido de detección de frases personalizadas: el repositorio incluye el informe de evaluación y el pipeline de entrenamiento documentado, por lo que sirve como plantilla para adaptar la técnica a otras frases, idiomas o dominios con datos sintéticos.
- Evaluación comparativa de robustez de KWS: al publicar tasas de falsos positivos adversarios y simulaciones de habla rápida, puede emplearse como referencia para medir el comportamiento de otros detectores en condiciones de ruido o de repetición acelerada.

## Benchmarks y rendimiento

Los datos publicados por el autor en la model card, con umbrales elegidos y métricas sobre conjuntos sintéticos, son los siguientes:

| Frase | Árabe | Recall en hold-out @0,5 | Tasa de FP adversarios | Mejor umbral | Detección de tasbeeh rápido (2 streams ruidosos x 25 emisiones) |
|---|---|---|---|---|---|
| subhanallah | سبحان الله | 0,93 | 0,08 | 0,3 | 34/50 |
| alhamdulillah | الحمد لله | 0,86 | 0,00 | 0,3 | 20/50 |
| allahuakbar | الله أكبر | 0,93 | 0,00 | 0,3 | 24/50 |
| la_ilaha_illa_allah | لا إله إلا الله | 0,93 | 0,00 | 0,3 | 40/50 |
| astaghfirullah | أستغفر الله | 0,93 | 0,00 | 0,3 | 36/50 |

La tasa de falsos positivos sobre habla árabe reservada (Common Voice) con los umbrales elegidos es de 0,00 FP/hora para las cinco frases, según el autor. No se han publicado resultados sobre audio real de dispositivo en la información disponible; todas las cifras anteriores proceden de clips sintéticos de validación y de streams simulados.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB de VRAM dedicada; el modelo está pensado para CPU. Cada cabeza ocupa aproximadamente 860 KB en disco y las cinco juntas rondan los 4,3 MB, más el extractor de características de openWakeWord.
- GPU recomendadas: no aplica. No se requiere GPU para el uso previsto; cualquier GPU sería desproporcionada para el cómputo implicado.
- Compatibilidad con GPU de consumo: irrelevante, ya que el modelo cabe y se ejecuta en CPU de móvil, placa embebida o portátil sin aceleración.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider) como vía documentada; alternativas compatibles con ONNX como ONNX Runtime Mobile o web, integradas dentro del pipeline de openWakeWord. Frameworks de servidor de modelos de lenguaje como vLLM, TGI, llama.cpp u Ollama no son aplicables a este modelo.
- Latencia y throughput estimados: no se publican cifras de latencia ni de throughput. Los únicos parámetros temporales documentados son la ventana de análisis de 2 segundos, el intervalo de puntuación de 80 ms y el periodo refractario recomendado de aproximadamente 1,2 segundos. Se recomienda además una puerta VAD o de energía previa para reducir el número de evaluaciones.

## Comparativa con modelos similares

| Modelo | Tipo | Frases / idioma | Contexto o ventana | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mZahran001/tasbeeh-kws | Cabezas ONNX sobre features de openWakeWord | 5 frases de dhikr en árabe | Ventana de 2 s, puntuación cada 80 ms | Recall 0,86-0,93 en hold-out sintético; 0,00 FP/h en Common Voice | Apache 2.0 | HuggingFace, 0 descargas |
| Modelos preentrenados de openWakeWord | Misma arquitectura, cabezas DNN | Wake words en inglés | Misma ventana de 2 s | no disponible en la información proporcionada | Apache 2.0 (proyecto base) | GitHub y repositorios del proyecto |
| Kits comerciales de keyword spotting (por ejemplo, Picovoice Porcupine o alternativas propietarias) | Detección de wake word empaquetada | Configurable por el desarrollador | no disponible | no disponible | Propietaria | SDK comercial |
| Modelos ASR completos para árabe | Reconocimiento de voz general | Árabe | Ventanas de audio más largas | no disponible | Variable | HuggingFace y otros repositorios |

No se dispone de datos comparativos numéricos en la información proporcionada para establecer una comparación cuantitativa con alternativas. La comparación cualitativa relevante es que este modelo es específico de dominio y de tamaño mínimo, mientras que un ASR completo resolvería la tarea con mayor coste de cómputo y también con mayor latencia.

## Limitaciones y advertencias

- Toda la evaluación es sintética. Los valores de recall proceden de clips TTS reservados y de streams simulados; el rendimiento en dispositivo real diferirá. El propio autor recomienda grabar entre 50 y 100 emisiones reales por frase en los teléfonos objetivo y volver a ajustar los umbrales antes de llevar el modelo a producción.
- El audio de referencia para la síntesis fue un único hablante de árabe estándar moderno, por lo que la diversidad dialectal proviene únicamente del condicionamiento del TTS y no de hablantes reales.
- Las cabezas asumen exactamente el pipeline de características `speech_embedding` empleado en el entrenamiento, con openWakeWord 0.6 o superior desde la rama principal de GitHub; cambiar la versión o la implementación del extractor invalida las puntuaciones.
- La detección de tasbeeh rápido es imperfecta: en la simulación con dos streams ruidosos y 25 emisiones, los aciertos oscilan entre 20/50 y 40/50 según la frase, y el autor advierte que con un refractario de 0,45 segundos la ventana de 2 segundos puede dispararse 2 o 3 veces por emisión.
- La tasa de falsos positivos adversarios de subhanallah es de 0,08, notablemente superior a la de las otras cuatro frases, lo que sugiere una mayor confusión con audio parecido.
- El modelo solo cubre árabe y cinco frases concretas; no generaliza a otras lenguas ni a variantes textuales no vistas.
- No hay datos publicados sobre comportamiento en condiciones de ruido real de calle, reverberación de mezquita o solapamiento de voces, más allá del entrenamiento con aumento de ruido.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones de las fuentes de datos empleadas (Common Voice y el conjunto de validación de openWakeWord) si se redistribuye un modelo derivado.
- El repositorio presenta 0 descargas y 0 me gusta en el momento de la consulta, por lo que no existe validación por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Los resultados de la búsqueda web realizada no aportan información relevante sobre este modelo; los enlaces devueltos corresponden a registros meteorológicos del Reino Unido y no guardan relación con la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mZahran001/tasbeeh-kws
- Dataset de entrenamiento: https://huggingface.co/datasets/mZahran001/tasbeeh-kws-data
- Modelo TTS utilizado para generar los positivos (SWivid/Habibi-TTS): https://huggingface.co/SWivid/Habibi-TTS
- Repositorio base de la arquitectura (openWakeWord): https://github.com/dscripka/openWakeWord
- Ficheros incluidos en el repositorio: `tasbeeh_subhanallah.onnx`, `tasbeeh_alhamdulillah.onnx`, `tasbeeh_allahuakbar.onnx`, `tasbeeh_la_ilaha_illa_allah.onnx`, `tasbeeh_astaghfirullah.onnx` y `eval_report.json`
- Enlaces adicionales relevantes encontrados en la búsqueda web: no disponible (los resultados obtenidos no están relacionados con el modelo)
