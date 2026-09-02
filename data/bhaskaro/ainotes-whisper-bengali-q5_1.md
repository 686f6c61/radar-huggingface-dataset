# bhaskaro/ainotes-whisper-bengali-q5_1

## Resumen

El modelo `bhaskaro/ainotes-whisper-bengali-q5_1` es una conversión al formato GGML (whisper.cpp) del modelo `bangla-speech-processing/BanglaASR`, un fine-tune de Whisper small específicamente entrenado para el reconocimiento automático de voz (ASR) en bengalí. El repositorio aporta únicamente la conversión de pesos y la cuantización a q5_1, manteniendo la licencia MIT del modelo original. Con un tamaño de aproximadamente 190 MB, está diseñado para ejecutarse en dispositivos con recursos limitados, como teléfonos móviles de gama media, donde alcanza velocidades superiores al tiempo real.

La relevancia de este modelo radica en su utilidad práctica para aplicaciones de transcripción en bengalí en entornos sin conexión o con hardware modesto. La cuantización q5_1 reduce el tamaño del modelo 2,6 veces respecto a float16 y lo acelera 1,34 veces sin pérdida significativa de precisión, según las mediciones del autor. Sin embargo, presenta una advertencia crítica: requiere desactivar la predicción de timestamps (`no_timestamps`), ya que los tokens de timestamp del fine-tune no fueron entrenados y su uso provoca errores graves de transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (encoder-decoder transformer) |
| Parametros totales | no disponible (variante small de Whisper) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ventana de audio estándar de Whisper small) |
| Tipos de cuantizacion | q5_1 (GGML), float16 original |
| Idiomas soportados | bn (bengali) |
| Licencia | MIT |
| Formato de pesos | GGML (whisper.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper small de OpenAI, un transformer encoder-decoder entrenado para reconocimiento de voz. El modelo original `BanglaASR` es un fine-tune de Whisper small sobre datos de habla bengalí, aunque no se especifican los detalles del conjunto de datos ni el procedimiento de entrenamiento en la información disponible. La conversión a GGML se realizó mediante el script `convert-h5-to-ggml.py` de whisper.cpp, pasando primero a float16 y luego cuantizando a q5_1. El autor verificó que la tabla de tokens coincide byte a byte con la publicada por ggerganov para `ggml-small`, evitando problemas de vocabulario que producen salidas fluidas pero incorrectas.

Una característica técnica destacable es que el fine-tune se entrenó con transcripciones planas, sin predicción de timestamps. Esto implica que los tokens de timestamp no están entrenados, y whisper.cpp los utiliza para decidir los límites de segmento, lo que puede provocar que el decodificador deje de seguir el audio y genere texto gramaticalmente correcto pero completamente ajeno al contenido. Por ello, es imprescindible usar la opción `-nt` (no_timestamps) en whisper.cpp.

## Capacidades

- Transcripción de audio en bengalí a texto, con salida de segmentos.
- Funcionamiento en tiempo real en dispositivos móviles de gama media (probado en Snapdragon 720G con 4 hilos).
- Compatible con whisper.cpp, permitiendo ejecución en CPU, GPU ligera y dispositivos embebidos.
- Cuantización q5_1 que reduce el tamaño del modelo a 190 MB sin pérdida apreciable de precisión frente a float16.
- No dispone de capacidades de tool calling, visión, generación de código ni razonamiento multimodal; es un modelo exclusivamente de reconocimiento de voz.

## Casos de uso

- Transcripción de reuniones y entrevistas en bengalí: el modelo puede procesar grabaciones de audio de forma local, generando texto plano sin necesidad de conexión a internet, lo que resulta útil en entornos con privacidad o conectividad limitada.
- Subtitulado automático de vídeos en bengalí: al ejecutarse con whisper.cpp, puede integrarse en pipelines de postproducción para generar subtítulos en tiempo real o por lotes, con un coste computacional mínimo.
- Asistentes de voz para hablantes de bengalí: su tamaño reducido permite su despliegue en dispositivos móviles o altavoces inteligentes de gama baja, ofreciendo reconocimiento de comandos de voz sin depender de servicios en la nube.
- Transcripción de llamadas telefónicas para atención al cliente: las empresas pueden procesar grabaciones de llamadas en bengalí para análisis posterior, gracias a su licencia MIT que permite uso comercial sin restricciones.
- Herramientas de accesibilidad para personas con discapacidad auditiva: el modelo puede convertir audio en vivo en subtítulos en tiempo real, ejecutándose en hardware asequible.
- Investigación lingüística y análisis de corpus: los investigadores pueden transcribir grandes volúmenes de audio en bengalí de forma económica, aprovechando la cuantización q5_1 que reduce los requisitos de almacenamiento y cómputo.

## Benchmarks y rendimiento

El autor proporciona mediciones propias realizadas con whisper.cpp sobre 24 clips de FLEURS `bn_in` (bengalí, con decodificación greedy y `no_timestamps`):

| Metrica | Valor |
|---|---|
| Word error rate (WER) | 46,5 % |
| Character error rate (CER) | 27,0 % |

También se reportan comparaciones adicionales en hindi (64 clips) que ilustran el efecto de la configuración de timestamps y la cuantización:

| Configuracion | WER |
|---|---|
| Hindi, timestamps activados | 47,5 % |
| Hindi, timestamps desactivados | 14,9 % |
| Hindi, q5_1 (sin timestamps) | 14,7 % |
| Hindi, float16 (sin timestamps) | 15,9 % |

No se dispone de resultados en benchmarks estándar como Common Voice o FLEURS completos en la información proporcionada.

## Requisitos de hardware

- Tamaño del modelo: 190 MB (q5_1), lo que permite cargarlo en memoria RAM de cualquier dispositivo moderno.
- Inferencia en CPU: funciona en tiempo real en un Snapdragon 720G (gama media de 2020) con 4 hilos, según el autor.
- GPU: al ser un modelo GGML, puede ejecutarse en GPU mediante whisper.cpp con soporte CUDA, aunque no se especifican requisitos mínimos de VRAM; con 190 MB de pesos, cualquier GPU con más de 512 MB de VRAM sería suficiente.
- Opciones de despliegue: whisper.cpp (línea de comandos), integración en aplicaciones C/C++, Python mediante bindings, o servidores como whisper.cpp server.
- Latencia: no se proporcionan cifras exactas, pero la afirmación de "más rápido que tiempo real" sugiere una latencia inferior a la duración del audio procesado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| bhaskaro/ainotes-whisper-bengali-q5_1 | Whisper small | 190 MB (q5_1) | bn | MIT | GGML |
| asif00/whisper-bangla | Whisper small | no disponible | bn | no disponible | PyTorch (HuggingFace) |
| openai/whisper-small | Whisper small | 244M parametros | multilingue | MIT | PyTorch |

No se dispone de datos de rendimiento comparativos entre estos modelos en los mismos conjuntos de evaluación. El modelo `asif00/whisper-bangla` es otro fine-tune para bengalí, pero no se especifican métricas ni licencia en la información disponible. Whisper small original es multilingüe y puede transcribir bengalí, aunque con menor precisión que un fine-tune específico.

## Limitaciones y advertencias

- WER elevado en bengalí (46,5 % en FLEURS bn_in), lo que indica una precisión limitada en audio con ruido o acentos variados; no es adecuado para transcripción de alta calidad sin revisión humana.
- Requiere configurar obligatoriamente `no_timestamps` en whisper.cpp; si no se hace, el modelo genera texto fluido pero incorrecto, sin relación con el audio. Esta es una limitación crítica para cualquier integración.
- El modelo solo soporta bengalí; no funciona con otros idiomas.
- No se proporcionan datos sobre sesgos o comportamiento en dominios específicos (jerga, dialectos, habla superpuesta).
- Al ser una conversión de un fine-tune, la calidad depende del modelo base `BanglaASR`; no se han publicado detalles del conjunto de entrenamiento ni de su evaluación independiente.
- La licencia MIT permite uso comercial sin restricciones, pero se debe mantener la atribución al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bhaskaro/ainotes-whisper-bengali-q5_1
- Modelo base: https://huggingface.co/bangla-speech-processing/BanglaASR
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Otro fine-tune de Whisper para bengalí (referencia): https://huggingface.co/asif00/whisper-bangla
