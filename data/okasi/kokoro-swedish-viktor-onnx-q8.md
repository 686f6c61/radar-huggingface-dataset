# okasi/kokoro-swedish-viktor-onnx-q8

## Resumen

Kokoro Swedish Viktor Q8 ONNX es una exportación cuantizada a ONNX del checkpoint sueco "Viktor" del proyecto Kokoro, publicada por el usuario okasi en Hugging Face. El modelo base es Joakim/kokoro-sv-voices, una adaptación al sueco de Kokoro-82M (hexgrad), un modelo de síntesis de voz (text-to-speech) de aproximadamente 82 millones de parámetros. Esta versión concreta empaqueta los pesos acústicos en INT8 simétrico por canal y los dequantiza en tiempo de ejecución para el cálculo en coma flotante, con el objetivo de reducir el tamaño y facilitar su ejecución en navegador mediante ONNX Runtime Web.

El modelo resuelve un problema muy concreto: disponer de una voz sueca (identificada como Viktor) ejecutable localmente en el navegador con WebGPU o WASM, sin depender de servicios en la nube. El repositorio ocupa unos 0,1 GB e incluye el grafo ONNX, la tabla de estilos en float32 y un JSON de configuración con el vocabulario IPA. No se trata de un modelo entrenado desde cero por el autor de esta ficha, sino de una conversión y cuantización de los pesos originales de Joakim Eriksson.

La relevancia actual radica en su enfoque de despliegue: TTS multilingüe (aquí sueco) en el cliente, con licencia Apache 2.0, sin necesidad de GPU dedicada y con métricas de calidad reportadas mediante Whisper large-v3-turbo. Es un ejemplo de cómo los modelos pequeños de TTS pueden distribuirse como artefactos web listos para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (modelo acústico TTS, exportado a grafo ONNX); pesos en INT8 simétrico por canal con dequantización a coma flotante |
| Parametros totales | Aproximadamente 82 M (heredados de Kokoro-82M); no se detalla el recuento exacto tras la cuantización |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 510 IDs de fonema por llamada (una locución por invocación) |
| Tipos de cuantizacion | INT8 simétrico por canal (Q8) en los pesos acústicos; tabla de estilos en float32 |
| Idiomas soportados | Sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`Viktor-q8.onnx`, 79,7 MiB) + tabla de estilos float32 (`Viktor.f32`, forma [510, 1, 256]) + `Viktor-config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro-82M, un modelo de síntesis de voz de tamaño reducido. La cadena de procedencia documentada es la siguiente: Joakim Eriksson entrenó el checkpoint dedicado Viktor y su estilo de voz a partir de Kokoro-82M, utilizando voz sintética en sueco generada con VoxCPM2 (openbmb/VoxCPM2). Esta release de okasi convierte `models/Viktor.pth` a ONNX, cuantiza sus pesos y convierte `voices/Viktor.pt` a float32 sin procesar, además de empaquetar el vocabulario fuente y los metadatos de forma.

La innovación técnica de esta ficha no está en el entrenamiento, sino en el empaquetado: cuantización INT8 simétrico por canal con dequantización en el grafo, tabla de estilos indexada por longitud de secuencia (fila `n - 1` para `n` fonemas, con token ID 0 añadido al principio y al final) y una interfaz de inferencia mínima (`input_ids` int64 `[1, n+2]` y `ref_s` float32 `[1, 256]`) que devuelve audio mono a 24 kHz y valores de duración por token. El frontend de pronunciación (conversión de texto a IPA) es externo y se distribuye por separado.

## Capacidades

- Síntesis de voz en sueco a partir de texto convertido previamente a IPA mediante el frontend kokoro-sv.
- Salida de audio mono a 24 kHz, con valores de duración por token.
- Procesamiento de una locución por llamada, con hasta 510 IDs de fonema.
- Ejecución en navegador mediante ONNX Runtime Web, con WebGPU y fallback a WASM.
- Ejecución en CPU con WASM multihilo (cuatro hilos en el benchmark reportado).
- Control de estilo mediante la tabla de estilos (`ref_s`) indexada por longitud de secuencia.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es exclusivamente TTS.

## Casos de uso

- Lectura por voz de artículos y contenidos web en sueco: el modelo se integra en el navegador con ONNX Runtime Web y WebGPU, generando audio localmente sin enviar el texto a un servidor, lo que es adecuado para aplicaciones de accesibilidad.
- Asistentes de voz para aplicaciones web en sueco: al ejecutarse en el cliente, permite respuestas habladas con baja dependencia de infraestructura y sin costes por petición.
- Audiolibros y podcasts generados: la ventana de 510 fonemas por llamada permite sintetizar fragmentos de texto secuencialmente y concatenar el audio resultante.
- Prototipado de interfaces de voz en entornos de desarrollo: el tamaño reducido del repositorio (0,1 GB) y el formato ONNX facilitan la integración en pipelines de CI y pruebas automatizadas.
- Sistemas de navegación o avisos hablados en sueco: la inferencia local en navegador permite generar mensajes cortos sin conexión a servicios externos.
- Evaluación de calidad TTS en investigación: el modelo incluye métricas de WER con Whisper large-v3-turbo, útil como referencia para comparar voces suecas.
- Aplicaciones educativas de aprendizaje de idiomas: la pronunciación sintética en sueco puede emplearse para ejercicios de escucha, siempre etiquetando el audio como generado por IA.

## Benchmarks y rendimiento

El autor reporta un benchmark en navegador con un pasaje sueco de 128 palabras, en Chromium 143 y ONNX Runtime Web 1.31.1 sobre un Apple M1 Pro. Los tiempos incluyen pronunciación, inferencia acústica y filtros notch originales, y comienzan tras la carga del modelo y el frontend.

| Runtime | Primera generación | Repetición | WER con Whisper large-v3-turbo |
|---|---:|---:|---:|
| WebGPU con fallback a WASM | 18,64 s | 18,52 s | 3,91 % (5 / 128) |
| WASM, cuatro hilos | 28,04 s | — | 3,91 % (5 / 128) |

La carga del modelo y el frontend con WebGPU desde almacenamiento local fue de 2,07 segundos. El autor advierte que estos tiempos corresponden a un pasaje en una máquina concreta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del grafo ONNX es de 79,7 MiB, por lo que el modelo cabe holgadamente en memoria de cualquier GPU de consumo actual.
- GPU recomendadas: no se especifican; el benchmark se realizó en un Apple M1 Pro con WebGPU. Cualquier GPU compatible con WebGPU debería poder ejecutarlo.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna; el modelo también funciona en CPU.
- Opciones de despliegue: ONNX Runtime Web (WebGPU y WASM), y por extensión ONNX Runtime en Python u otros entornos compatibles con ONNX; existen paquetes comunitarios como kokoro-onnx y kokoro-sv para Python.
- Latencia y throughput: 18,64 s para un pasaje de 128 palabras en WebGPU y 28,04 s en WASM con cuatro hilos sobre M1 Pro. No se reportan métricas de throughput por segundo de audio generado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kokoro Swedish Viktor Q8 ONNX (este) | ~82 M | 510 fonemas por llamada | Sueco | Apache 2.0 | ONNX INT8 | Cuantizado, orientado a navegador |
| Joakim/kokoro-sv-voices (modelo base) | ~82 M | No disponible | Sueco | No disponible en la información | PyTorch (`.pth`, `.pt`) | Checkpoints originales de Viktor y Klara |
| hexgrad/Kokoro-82M | 82 M | No disponible | Multilingüe (según el proyecto original) | No disponible en la información | PyTorch / ONNX en conversiones comunitarias | Modelo base original |
| cmasus/vocalis-models | No disponible | No disponible | No disponible | No disponible | ONNX | Conversiones ONNX de modelos Kokoro para la app Vocalis |

La comparativa se limita a la familia Kokoro, ya que no se dispone de datos de otros modelos TTS suecos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo sintetiza sueco; no admite otros idiomas.
- Requiere un frontend externo de conversión de texto a IPA (kokoro-sv); el modelo no procesa texto directamente.
- Procesa una única locución por llamada y un máximo de 510 IDs de fonema, lo que obliga a fragmentar textos largos.
- Los tiempos de generación reportados son lentos para uso interactivo en tiempo real (18-28 s para 128 palabras en el hardware de prueba).
- El rendimiento puede variar según la máquina y el navegador; los datos provienen de una sola prueba.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí puede haber errores de pronunciación derivados del frontend IPA y de la voz sintética de entrenamiento.
- El modelo se entrenó con voz sintética generada por VoxCPM2, lo que puede introducir artefactos o limitar la naturalidad frente a voces grabadas con hablantes reales.
- No se documentan sesgos específicos ni evaluaciones de robustez ante texto ruidoso.
- El audio generado es sintético y debe etiquetarse como tal cuando se comparta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el frontend tienen sus propias condiciones que deben verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okasi/kokoro-swedish-viktor-onnx-q8
- Modelo base: https://huggingface.co/Joakim/kokoro-sv-voices
- Checkpoint Viktor original: https://huggingface.co/Joakim/kokoro-sv-voices/tree/97200c43d189c2aabafc1432b97cb28db18033bf
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Frontend de pronunciación sueca: https://github.com/joakimeriksson/kokoro-sv
- Activos G2P suecos: https://huggingface.co/Joakim/kokoro-sv-g2p
- kokoro-onnx (GitHub): https://github.com/thewh1teagle/kokoro-onnx
- kokoro-onnx (PyPI): https://pypi.org/project/kokoro-onnx/
- kokoro-sv (PyPI): https://pypi.org/project/kokoro-sv/
- Vocalis models: https://huggingface.co/cmasus/vocalis-models
