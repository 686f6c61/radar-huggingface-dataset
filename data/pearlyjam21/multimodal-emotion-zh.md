# pearlyjam21/multimodal-emotion-zh

## Resumen

Multimodal emotion (face + voice + Traditional Chinese text) for Reachy Mini es un paquete de inferencia publicado por pearlyjam21 que agrupa tres clasificadores de emociones independientes (rostro, voz y texto) más una regla de fusión tardía log-lineal. El objetivo no es construir un modelo fundacional, sino ofrecer reconocimiento emocional multimodal que funcione íntegramente en CPU sobre la Raspberry Pi CM4 integrada en el robot Reachy Mini Wireless, sin dependencia de PyTorch y usando únicamente ONNX Runtime. Las siete etiquetas de salida, en orden de fusión, son: neutral, happy, sad, angry, surprise, fear y disgust.

Cada rama es deliberadamente pequeña: un MobileNetV3-Large afinado sobre FER2013 con etiquetas suaves FER+ (17 MB), un estudiante compacto de tipo ECAPA-TDNN destilado de 1,9 M de parámetros para voz (7,6 MB) y un fine-tune de bert-base-chinese exportado a int8 dinámico (98 MB). Se acompañan de un detector de rostro YuNet (0,2 MB) y un VAD Silero (0,6 MB). El reconocimiento de voz no se incluye en el repositorio: la aplicación descarga SenseVoice-Small int8 desde su repositorio original por motivos de licencia.

Su relevancia es doble. Por un lado, demuestra un patrón de despliegue edge-first con presupuesto de cómputo mínimo y contrato de configuración explícito (config.json). Por otro, es un ejemplo poco habitual de documentación honesta: la propia model card advierte de que no existe ninguna evaluación de las tres ramas combinadas, de que la rama de texto nunca se ha probado con transcripciones reales de ASR y de que en conversación natural los resultados están cerca del azar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres clasificadores ONNX independientes (MobileNetV3-Large para rostro, ECAPA-TDNN compacto destilado para voz, fine-tune de bert-base-chinese para texto) combinados con una fusion tardia log-lineal; incluye detector de rostro YuNet y VAD Silero |
| Parametros totales | No disponible como cifra agregada. Rama de voz: 1,9 M de parametros. Rama de rostro: MobileNetV3-Large. Rama de texto: fine-tune de bert-base-chinese |
| Longitud de contexto | Rama de texto: <=128 tokens. Rama de voz: ventana de 2 s a 16 kHz. Ventana de transcripcion admitida en la fusion: 8 s |
| Tipos de cuantizacion | int8 dinamico en la rama de texto (es la version publicada); fp32 en rostro y voz. El export int8 del clasificador de rostro fue descartado. No se publican pesos GGUF, GPTQ ni AWQ |
| Idiomas soportados | Chino (rama de texto, exclusivamente chino tradicional) e ingles declarado; las transcripciones en ingles se descartan en la fusion porque el modelo de texto es solo chino |
| Licencia | other / mixed-research-use (LICENSE.md). Los componentes arrastran licencias distintas y el uso conjunto se limita a investigacion y educacion |
| Formato de pesos | ONNX (mas tokenizer.json y config.json). No hay safetensors ni pesos PyTorch |

## Arquitectura y entrenamiento

El sistema no es un transformer multimodal unico, sino un conjunto de clasificadores especializados que se combinan en el plano de las probabilidades. La rama de rostro usa MobileNetV3-Large entrenada sobre imagenes FER2013 con etiquetas suaves FER+; la entrada es un recorte facial en escala de grises de 112x112 con un 10 % de padding, generado por YuNet y replicado a tres canales con normalizacion ImageNet. La rama de voz es un estudiante ECAPA-TDNN de 1,9 M de parametros obtenido por destilacion, que consume 2 s de audio a 16 kHz con log-mel de 80 bandas y normalizacion por enunciado. La rama de texto es un fine-tune de bert-base-chinese con cuantizacion int8 dinamica, limitado a 128 tokens de chino tradicional. El autor indica que el texto simplificado procedente de ASR se convierte con la libreria chinese-converter.

La innovacion principal esta en la fusion. Los logits de cada rama se reordenan al orden canonico de etiquetas definido en config.json, se calibran como softmax(logits / T_rama) y se combinan con una mezcla log-lineal ponderada: p proporcional a exp(suma de w_b multiplicado por log p_b). La suma se calcula unicamente sobre las ramas que tienen evidencia en ese instante y los pesos se renormalizan; una rama ausente nunca se cuenta como neutral. Se descarta una rama cuando no hay rostro, cuando hay silencio, cuando la transcripcion esta en ingles o cuando la transcripcion tiene mas de 8 s. Los hiperparametros publicados son T_face = 6,46 (ajustado sobre video de validacion de CREMA-D con recortes YuNet a 5 fps), w_face : w_speech = 0,65 : 0,35 (ajustados sobre validacion de CREMA-D con el estudiante de voz v2), T_speech = 1,0 (no reajustado para v3; el ajuste de v2 era 0,86) y T_text = 1,0 con w_text = 0,35, marcados explicitamente como valores por defecto no validados porque no existe ningun dataset que alinee texto con rostro y voz simultaneamente.

## Capacidades

- Clasificacion de emociones faciales en 7 clases a partir de recortes de rostro de 112x112, con deteccion previa mediante YuNet a partir de un fotograma BGR.
- Clasificacion de emociones en voz (UAR) sobre fragmentos de 2 s a 16 kHz, con normalizacion por enunciado.
- Clasificacion de emociones en texto de chino tradicional de hasta 128 tokens.
- Fusion multimodal de las tres senales con ponderacion log-lineal, calibracion por temperatura y renormalizacion sobre las ramas activas.
- Deteccion de actividad de voz (VAD Silero) para delimitar enunciados.
- Integracion de reconocimiento de voz externo (SenseVoice-Small int8) que no forma parte del repositorio.
- Ejecucion en CPU con ONNX Runtime, sin PyTorch, orientada a Raspberry Pi CM4.
- API de streaming con acumulacion incremental de audio y fotogramas y obtencion de instantaneas periodicas.
- No soporta tool calling, function calling, agentes, multi-step reasoning, vision general, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Robot social Reachy Mini Wireless: el paquete esta disenado exactamente para este hardware, de modo que el robot puede modular gestos y respuestas segun el estado afectivo detectado sin depender de un servidor externo. La cadencia prevista es de fotogramas a unos 5 fps y una instantanea de fusion cada aproximadamente 0,2 s.
- Investigacion en computacion afectiva: sirve como linea base reproducible y ligera en CPU para comparar estrategias de fusion tardia frente a modelos multimodales de mayor tamano, con la ventaja de que todos los hiperparametros y pesos estan documentados.
- Experimentos de interaccion persona-maquina en chino tradicional: permite estudiar como se combina la senal vocal con el contenido linguistico en hablantes de zh, teniendo en cuenta que la rama de texto solo ha sido evaluada con textos escritos por humanos.
- Demostraciones educativas de computacion en el borde: el conjunto completo ocupa en torno a 123 MB de pesos ONNX (98 MB de texto, 17 MB de rostro, 7,6 MB de voz, 0,6 MB de VAD y 0,2 MB de detector) y se ejecuta sin GPU, lo que lo hace util para ensenar tecnicas de cuantizacion, destilacion y despliegue en dispositivos restringidos.
- Prototipado de interfaces accesibles: deteccion de frustracion o confusion en un tutor o asistente que escuche al usuario y lo observe por webcam, siempre que se asuma que la salida es una senal social aproximada y no una medicion.
- Analisis de sesiones de voz en entornos controlados y actuados, como corpus emocionales o grabaciones de laboratorio, donde los UAR de la rama de voz son apreciablemente mejores que en conversacion natural.
- Anotacion asistida de corpus: preetiquetado rapido de clips de audio y recortes faciales para su posterior revision humana, aprovechando el coste computacional minimo.

## Benchmarks y rendimiento

Todos los numeros proceden de evaluaciones de ramas individuales o de la combinacion voz + rostro. No existe ninguna evaluacion de las tres ramas combinadas.

| Rama | Conjunto de evaluacion | Metrica | Resultado |
|---|---|---|---|
| Rostro | FER+ PublicTest (etiqueta mayoritaria) | Accuracy | 83,6 % |
| Rostro | FER+ PublicTest (etiqueta mayoritaria) | Macro-F1 | 0,754 |
| Rostro | EmotionNet6, 496 recortes reales con 10 % de padding, 6 clases | Accuracy | 59,5 % |
| Rostro | EmotionNet6, mismo conjunto con 30 % de padding | Accuracy | 47,0 % |
| Rostro | EmotionNet6, 496 recortes reales | Macro-F1 | 0,607 |
| Rostro (export int8, descartado) | FER+ | Macro-F1 | 0,337 |
| Voz v3 | ESD mandarin (hablante 0010) | UAR | 70,1 |
| Voz v3 | ESD ingles (hablantes 0011-0012) | UAR | 56,6 |
| Voz v3 | CREMA-D (9 actores) | UAR | 67,0 |
| Voz v3 | MELD test (azar 14,3 %) | UAR | 23,5 |
| Texto fp32 | Split reservado de Chinese-MEDD mas filas adicionales de miedo (n = 632, semilla 42) | Accuracy | 91,9 % |
| Texto fp32 | Mismo conjunto | Macro-F1 | 0,907 |
| Texto int8 (publicado) | Mismo conjunto | Accuracy | 91,5 % |
| Texto int8 (publicado) | Mismo conjunto | Macro-F1 | 0,903 |
| Texto int8 (publicado) | Concordancia con fp32 | Porcentaje de filas | 97,3 % |

| Fusion tardia (voz v2 + rostro) | Solo voz | Solo rostro | Fusionado |
|---|---|---|---|
| CREMA-D (actuado) | 55,9 | 30,3 | 59,2 |
| MELD (dialogo de television) | 15,9 | 16,0 | 17,0 |

Advertencia del propio autor: el resultado de FER+ PublicTest es ligeramente optimista porque ese mismo split se uso para seleccionar el checkpoint. En MELD, conversacion natural, los modelos estan cerca del azar.

## Requisitos de hardware

- No requiere GPU en ningun caso: el paquete esta disenado para CPU con ONNX Runtime. La VRAM estimada es, por tanto, 0 GB.
- Hardware objetivo declarado: Raspberry Pi CM4 integrada en Reachy Mini Wireless.
- Tamano de los pesos: 98 MB (texto int8), 17 MB (rostro), 7,6 MB (voz), 0,6 MB (VAD), 0,2 MB (detector YuNet). Repositorio total: 0,1 GB. La RAM necesaria en ejecucion no se especifica en la informacion disponible.
- Componente adicional: SenseVoice-Small int8 se descarga aparte desde su repositorio original, con su propia licencia (FunASR), y anade su propio consumo de memoria.
- Opciones de despliegue: ONNX Runtime en PC o en el robot. El autor no menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Cadencia de ejecucion prevista en el ejemplo de uso: insercion de fotogramas a unos 5 fps y llamada de fusion cada aproximadamente 0,2 s. No se publican cifras medidas de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento de otros sistemas de reconocimiento emocional multimodal, y la busqueda web asociada devolvio unicamente paginas de reserva de billetes de tren y autobus (Trainline, Omio), sin ninguna relacion con el modelo. No es posible, por tanto, construir una comparativa con parametros, contexto, rendimiento o licencia de alternativas sin inventar cifras. El unico punto de referencia interno es el propio SenseVoice-Small int8, del que la model card solo menciona que se usa para el reconocimiento de voz y que tiene licencia FunASR, sin datos de rendimiento comparables.

## Limitaciones y advertencias

- No existe ninguna evaluacion de las tres ramas combinadas. Solo hay resultados de ramas individuales o de voz mas rostro.
- La rama de voz clasifica con frecuencia voces reales calmadas y silenciosas como sad. Los fragmentos neutrales de MELD se clasifican como happy con la version v3.
- En video de personas hablando, el modelo de rostro predice mayoritariamente neutral o happy, porque se entreno con fotografias en escala de grises de 48x48 y pose actuada.
- La rama de texto solo admite chino tradicional. El simplificado procedente de ASR se convierte con chinese-converter.
- La rama de texto nunca se ha probado con transcripciones reales de ASR. Los errores de reconocimiento pueden invertir el significado, por ejemplo al eliminar una negacion.
- Los datos suplementarios de la clase fear son generados por maquina y basados en plantillas, no son lenguaje natural espontaneo.
- Los umbrales de reaccion de la aplicacion del robot se calibraron para la version v2 con voz unicamente, no para las salidas fusionadas.
- Ninguno de los modelos identifica al hablante: el robot asume que la voz mas fuerte y el rostro mas grande pertenecen a la misma persona, lo que puede mezclar senales de dos interlocutores distintos.
- Los hiperparametros de la rama de texto (T_text = 1,0 y w_text = 0,35) son valores por defecto no validados.
- En conversacion natural (MELD) el rendimiento se acerca al azar: 17,0 de UAR en la fusion frente a un 14,3 de azar. La salida debe tratarse como una senal social blanda, no como una medicion.
- Licencia mixed-research-use con componentes sujetos a licencias diferentes: el uso conjunto esta planteado para investigacion y educacion, por lo que el uso comercial requiere revisar LICENSE.md y las licencias individuales de cada componente, incluido SenseVoice.
- El repositorio registra 0 descargas y 0 likes, y no se ha publicado ningun articulo tecnico asociado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/pearlyjam21/multimodal-emotion-zh
- Aplicacion del robot (Space): https://huggingface.co/spaces/pearlyjam21/reachy_mini_multimodal_emotion
- SenseVoice-Small int8 en sherpa-onnx (dependencia externa de ASR): https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17
- Licencia del repositorio: LICENSE.md (incluido en el propio repositorio)
- Informes de evaluacion citados dentro del repositorio: reports/text_int8_eval.json y reports/late_fusion_*
- Resultados de busqueda web: no se encontro ningun enlace relevante; las consultas devolvieron exclusivamente paginas de venta de billetes de tren y autobus (Trainline, Omio).
