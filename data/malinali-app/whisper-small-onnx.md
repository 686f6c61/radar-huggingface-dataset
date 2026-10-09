# malinali-app/whisper-small-onnx

## Resumen

malinali-app/whisper-small-onnx es un paquete de despliegue en formato ONNX del modelo de reconocimiento automatico del habla (ASR) openai/whisper-small, preparado por el desarrollador malinali-app para su aplicacion Malinali y publicado bajo licencia MIT. No es un modelo entrenado desde cero: reproduce los grafos de inferencia de Whisper-small en ONNX con cuantizacion int8, listos para ejecutarse con la libreria sherpa-onnx. El repositorio ocupa 0,4 GB y contiene unicamente los ficheros encoder.int8.onnx, decoder.int8.onnx y tokens.txt.

El objetivo es habilitar transcripcion de voz en el dispositivo (on-device), sin dependencia de servicios en la nube ni del stack de PyTorch, algo relevante para aplicaciones moviles o embebidas que necesitan ASR multilingue con huella de memoria reducida. Al derivar de whisper-small, hereda el enfoque encoder-decoder y la cobertura multilingue de la familia Whisper.

Se trata de un artefacto muy reciente y de nicho (0 descargas y 0 likes en el momento de la consulta), sin benchmarks propios publicados. Su interes practico esta en la integracion con sherpa-onnx para inferencia no streaming en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper del modelo base openai/whisper-small) |
| Parametros totales | 244 millones (heredados del modelo base openai/whisper-small; no disponible en la ficha) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento; 448 posiciones de token en el decodificador (modelo base) |
| Tipos de cuantizacion | int8 (MatMul int8 en los grafos ONNX) |
| Idiomas soportados | multilingue (el modelo base cubre del orden de 99 idiomas segun OpenAI); listado detallado no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx) mas tokens.txt |

## Arquitectura y entrenamiento

El modelo es una exportacion a ONNX del Whisper-small de OpenAI, sin reentrenamiento documentado en el repositorio. Whisper es una arquitectura de tipo sequence-to-sequence con un encoder y un decoder basados en transformer, que procesa espectrogramas mel de audio y genera transcripciones o traducciones. El modelo base fue entrenado por OpenAI mediante supervision debil a gran escala sobre cientos de miles de horas de audio (del orden de 680.000 horas segun la documentacion del modelo original), lo que le confiere una cobertura multilingue amplia.

Los grafos incluidos en este repositorio proceden de csukuangfj/sherpa-onnx-whisper-small y se han cuantizado a int8 (MatMul int8) para reducir tamano y coste computacional. El despliegue se realiza a traves de la configuracion OfflineWhisperModelConfig de sherpa-onnx, lo que implica un modo de inferencia no streaming: el audio se transcribe por segmentos completos en lugar de procesarse de forma continua. El repositorio no documenta dataset de ajuste, RLHF, DPO ni ninguna innovacion tecnica adicional mas alla del empaquetado y la cuantizacion.

## Capacidades

- Reconocimiento automatico del habla (ASR) multilingue en modo offline.
- Transcripcion de audio a texto con herencia de las capacidades del modelo base Whisper-small.
- Deteccion de idioma y traduccion de voz a ingles (funcionalidad heredada del modelo base, no documentada de forma explicita en la ficha).
- Ejecucion en el dispositivo sin PyTorch, mediante ONNX Runtime y sherpa-onnx.
- Entrada de audio unicamente; no admite entrada de imagen ni de texto como tarea principal.
- No dispone de tool calling ni de function calling.
- No esta orientado a agentes ni a razonamiento multi-paso.
- No incluye modo de razonamiento (thinking mode) ni capacidades de vision o audio mas alla del propio ASR.
- No soporta streaming nativo, dado que usa OfflineWhisperModelConfig.

## Casos de uso

- Transcripcion on-device en aplicaciones moviles: al ser un paquete ONNX int8 de 0,4 GB, puede integrarse en apps Android o iOS con sherpa-onnx para transcribir notas de voz sin enviar audio a la nube.
- Subtitulado offline de contenido audiovisual: el modelo puede generar subtitulos a partir de pistas de audio localizadas, util en entornos con conectividad limitada o por motivos de privacidad.
- Dictado de texto en procesadores de documentos: puede alimentar editores de texto o herramientas de accesibilidad con dictado por voz ejecutado en local.
- Asistentes de voz embebidos: en dispositivos con recursos limitados (por ejemplo, Raspberry Pi o hardware industrial) sirve como motor ASR sin GPU dedicada.
- Analisis de llamadas en local: permite transcribir conversaciones de atencion al cliente dentro de la propia infraestructura, evitando el envio de datos sensibles a terceros.
- Traduccion de voz a ingles en escenarios offline: apoyandose en la capacidad de traduccion del modelo base, puede convertir audio en texto en ingles para viajeros o entornos sin red.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo casi real en aplicaciones de escritorio, segmentando el audio en bloques de hasta 30 segundos.
- Aplicaciones de Malinali: el repositorio se declara como paquete on-device especifico para el proyecto Malinali, por lo que su caso de uso principal es la integracion en dicha aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo esta cuantizado a int8 y el repositorio completo ocupa 0,4 GB, por lo que cabe holgadamente en memoria de cualquier GPU de consumo. La inferencia esta pensada para CPU, en cuyo caso no se requiere VRAM.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 3060 o superiores) puede acelerar la inferencia, pero no es un requisito.
- Compatibilidad con GPU de consumo: si, el modelo cabe en practicamente cualquier GPU de consumo e incluso en hardware embebido, dado su tamano reducido tras la cuantizacion int8.
- Opciones de despliegue: sherpa-onnx mediante OfflineWhisperModelConfig y ONNX Runtime. No se indica compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, ya que esos entornos estan orientados a modelos de lenguaje o a formatos distintos (GGUF en el caso de llama.cpp).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| malinali-app/whisper-small-onnx | 244 M (base) | Audio de 30 s por segmento | ONNX int8 | MIT | Paquete on-device para sherpa-onnx; sin benchmarks publicados |
| openai/whisper-small | 244 M | Audio de 30 s por segmento | PyTorch (safetensors) | MIT | Modelo base original; requiere PyTorch |
| csukuangfj/sherpa-onnx-whisper-small | 244 M | Audio de 30 s por segmento | ONNX | Apache-2.0 (segun el repositorio de origen) | Grafos originales de los que deriva este paquete |
| openai/whisper-medium | 769 M | Audio de 30 s por segmento | PyTorch | MIT | Mayor precision a cambio de mas recursos |
| openai/whisper-large-v3 | 1550 M | Audio de 30 s por segmento | PyTorch | MIT | Mayor precision, no apto para dispositivos modestos |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio presenta 0 descargas y 0 likes y no incluye benchmarks propios, por lo que su calidad practica no esta validada de forma publica.
- Depende de sherpa-onnx y de ONNX Runtime; no es un modelo autonomo y requiere la infraestructura de inferencia adecuada.
- La cuantizacion int8 puede reducir ligeramente la precision de transcripcion respecto a los pesos en fp32 del modelo base.
- Whisper-small tiene menor precision que whisper-medium o whisper-large-v3, especialmente en audio con ruido o acentos marcados.
- Riesgo de alucinacion en segmentos de silencio, ruido o audio poco claro, comportamiento documentado en la familia Whisper.
- La ventana de procesamiento es de 30 segundos por segmento, por lo que el audio largo debe dividirse en fragmentos.
- Coherencia de idioma y sesgos: al derivar de un dataset de supervision debil, puede presentar sesgos hacia el ingles y determinados acentos; el listado exacto de idiomas no esta disponible en la ficha.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del repositorio de origen de los grafos (csukuangfj/sherpa-onnx-whisper-small).
- No soporta streaming nativo, lo que limita su uso en aplicaciones que requieran transcripcion continua de baja latencia.
- No ofrece tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/whisper-small-onnx
- Modelo base openai/whisper-small: https://huggingface.co/openai/whisper-small
- Grafos de origen csukuangfj/sherpa-onnx-whisper-small: https://huggingface.co/csukuangfj/sherpa-onnx-whisper-small
- Repositorio de la aplicacion Malinali: https://github.com/malinali-app/malinali-app
- Documentacion de Whisper en sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/pretrained_models/whisper/index.html
- Exportacion de Whisper a ONNX (sherpa): https://k2-fsa.github.io/sherpa/onnx/pretrained_models/whisper/export-onnx.html
- Ejemplo de Whisper con ONNX Runtime en Android (Microsoft): https://github.com/microsoft/onnxruntime-inference-examples/blob/main/mobile/examples/whisper/local/android/readme.md
- Implementacion ONNX de Whisper para CPU (PINTO0309): https://github.com/PINTO0309/whisper-onnx-cpu
