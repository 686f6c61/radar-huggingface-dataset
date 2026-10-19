# enconvo/avatar-lipsync-1-onnx

## Resumen

Avatar Lip Sync 1 (ONNX) es un modelo de conversión de audio a expresiones faciales (audio2face) publicado por enconvo, el equipo detrás de la aplicación Enconvo para macOS y Android. No es un modelo de lenguaje: recibe 2 segundos de audio mono a 16 kHz y devuelve 60 fotogramas de pesos de blendshapes ARKit (52 canales) a 30 fps, que la aplicación usa para animar los labios de un avatar sincronizados con la voz. Se distribuye como un único fichero ONNX de 146 MB (`lam-int8.onnx`) con cuantización dinámica int8, pensado para inferencia en CPU de dispositivos móviles.

El modelo deriva de LAM Audio2Expression (repositorio `aigc3d/LAM_Audio2Expression`), empaquetado a través de `myned-ai/wav2arkit_cpu`, y declara como modelos base también `facebook/wav2vec2-base-960h`. La licencia es Apache 2.0, lo que permite uso comercial con obligación de incluir los ficheros `LICENSE` y `NOTICE`.

Su relevancia práctica está en el objetivo de despliegue: el autor reporta unos 120 ms por ventana de 2 segundos en un teléfono Android de gama alta de 2025 usando ONNX Runtime en CPU con 2 hilos intra-operador. Eso lo sitúa en el rango de tiempo real (0,06x tiempo real) sin GPU, un requisito habitual en aplicaciones móviles de avatares. Existe una build equivalente para Core ML (`enconvo/avatar-lipsync-1-coreml`) orientada a Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Derivada de LAM Audio2Expression; el autor lista `facebook/wav2vec2-base-960h` entre los modelos base |
| Parametros totales | No disponible (repo de 0,1 GB; fichero int8 de 146 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana fija de 2 s de audio: tensor de entrada `[1, 32000]` muestras a 16 kHz. No hay contexto de texto ni ventana deslizante declarada |
| Tipos de cuantizacion | int8 dinamica (ONNX Runtime `quantize_dynamic`, `QInt8`) aplicada a operadores MatMul y Gemm; existen pesos float en el modelo de origen |
| Idiomas soportados | No disponible. El modelo base `wav2vec2-base-960h` está entrenado con habla inglesa, pero el autor no declara cobertura lingüística |
| Licencia | Apache 2.0 (deben distribuirse `LICENSE` y `NOTICE`) |
| Formato de pesos | ONNX (`lam-int8.onnx`), ejecutado con la librería `onnxruntime` |
| Entrada | `audio_waveform`, Float32 `[1, 32000]` = 2 s de voz mono a 16 kHz |
| Salida | Float32 `[1, 60, 52]` = 60 fotogramas (30 fps) de 52 pesos de blendshapes ARKit |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna ni el proceso de entrenamiento. Lo que se puede afirmar con la información disponible es que se trata de un pipeline de audio2face heredado de LAM Audio2Expression (proyecto `aigc3d/LAM_Audio2Expression`), reempaquetado por `myned-ai/wav2arkit_cpu` para producir directamente pesos de blendshapes ARKit en lugar de mallas faciales, y que entre sus modelos base figura `facebook/wav2vec2-base-960h`, un codificador convolucional más transformer entrenado con 960 horas de habla inglesa de LibriSpeech. No se especifican número de tokens, composición del dataset de animación, ni si hubo etapas de ajuste con RLHF/DPO (no aplicables en este dominio).

La innovación destacable del artefacto es la optimización para despliegue móvil: cuantización dinámica int8 limitada a MatMul y Gemm, ejecución sobre ONNX Runtime en CPU con 2 hilos intra-operador y una ventana de entrada fija de 2 segundos que produce exactamente 60 fotogramas a 30 fps. El autor reporta que los blendshapes de boca del modelo cuantizado correlacionan 0,995 de media (0,989 en el peor caso) con los del modelo en coma flotante, lo que acota la pérdida de calidad introducida por la cuantización.

## Capacidades

- Generación de pesos de blendshapes faciales ARKit (52 canales) a partir de audio de voz, con salida fija de 60 fotogramas por ventana (30 fps).
- Sincronización labial en tiempo real sobre CPU: aproximadamente 120 ms por ventana de 2 s en hardware móvil de gama alta de 2025.
- Integración con motores de avatar que consuman el estándar ARKit blendshapes (aplicaciones de captura facial, motores 3D, apps de videollamada).
- Ejecución multiplataforma vía ONNX Runtime (Android, escritorio, servidores); existe build paralela en Core ML para Apple.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio de salida.
- No hay soporte multilingüe declarado ni modo "thinking" ni capacidades multimodales más allá de la entrada de audio.

## Casos de uso

- Aplicación de avatar con voz en Android: es el caso de uso original. La app Enconvo envía ventanas de 2 s de micrófono a 16 kHz al modelo y aplica los 60 fotogramas de blendshapes al avatar 3D, con latencia de ~120 ms que permite conversación fluida sin GPU dedicada.
- VTubers y streaming en directo: el modelo puede generar la animación labial de un personaje en tiempo real a partir del audio del streamer, dejando el resto del rig facial (cejas, parpadeo) a otras fuentes o a animación procedural.
- Doblaje y localización de vídeo: procesar pistas de audio dobladas para regenerar la animación de boca de un personaje, ventana a ventana, y recomponer la secuencia a 30 fps; la ventana fija de 2 s encaja con pipelines por lotes.
- NPCs y personajes no jugables en videojuegos móviles: al ejecutarse en CPU con 146 MB de pesos, se puede embeber en el propio dispositivo sin competir por la GPU con el renderizado.
- Contenido educativo y e-learning: animar un instructor virtual a partir de la narración grabada, reduciendo la necesidad de captura facial o de animación manual del habla.
- Accesibilidad: avatares con habla sincronizada para personas con discapacidad auditiva que se apoyan en la lectura labial, o para interfaces conversacionales con representación visual.
- Prototipado rápido de pipelines audio2face: al ser un ONNX autocontenido, sirve para validar la cadena audio → blendshapes → motor 3D antes de invertir en modelos mayores o en captura facial completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona métricas internas de fidelidad de la cuantización y de latencia, que se recogen a continuación como referencia y no como comparación con otros modelos:

| Metrica | Valor | Condiciones |
|---|---|---|
| Correlacion de blendshapes de boca (int8 vs float) | 0,995 de media; 0,989 en el peor caso | Reportado por el autor |
| Latencia por ventana de 2 s | ~120 ms | ONNX Runtime en CPU, 2 hilos intra-operador, Android de gama alta de 2025 |
| Factor de tiempo real | ~0,06x (unas 16 veces mas rapido que tiempo real) | Derivado de la latencia reportada |
| Resolucion de salida | 60 fotogramas por ventana a 30 fps, 52 canales | Formato de salida fijo |

## Requisitos de hardware

- VRAM: no requiere GPU. La inferencia de referencia se ejecuta en CPU; el fichero de pesos int8 ocupa 146 MB, por lo que el pico de memoria residente es del orden de unos cientos de MB incluyendo el runtime y los buffers de activaciones.
- GPU recomendadas: no aplica para el caso de uso previsto. No hay datos publicados sobre aceleración con CUDA, DirectML o TensorRT.
- Compatibilidad con GPU de consumo: irrelevante para el despliegue objetivo; el modelo está dimensionado para ejecutarse en un teléfono.
- Despliegue: ONNX Runtime (escritorio y servidor), ONNX Runtime Mobile para Android/iOS y otras plataformas con soporte ONNX. Para Apple existe la build Core ML `enconvo/avatar-lipsync-1-coreml`. Herramientas como vLLM, llama.cpp, Ollama o TGI no aplican: no es un modelo generativo de texto.
- Latencia y throughput: ~120 ms por ventana de 2 s en un Android de gama alta de 2025 con 2 hilos, según el autor. El throughput en servidor x86 no está documentado.

## Comparativa con modelos similares

| Modelo | Formato | Entrada / salida | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| enconvo/avatar-lipsync-1-onnx | ONNX int8, 146 MB | Audio 2 s 16 kHz / 60x52 blendshapes | Apache 2.0 | Hugging Face, 0 descargas, 0 likes | Objeto de esta ficha; ~120 ms por ventana en movil |
| enconvo/avatar-lipsync-1-coreml | Core ML | Misma tarea (build para Apple) | No disponible en la informacion | Hugging Face | Misma base, orientada a macOS/iOS |
| 3DAIGC/LAM_audio2exp | Pesos originales (formato no disponible) | Audio a expresion facial | No disponible en la informacion | Hugging Face / GitHub | Modelo de origen, sin cuantizar; sin datos de latencia o precision comparables |
| myned-ai/wav2arkit_cpu | No disponible | Audio a blendshapes ARKit | No disponible en la informacion | Hugging Face | Empaquetado intermedio citado como modelo base |

No se dispone de información sobre otros modelos audio2face comparables (por ejemplo alternativas comerciales o académicas) en el material proporcionado, por lo que no se incluye una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- Ventana fija de 2 segundos sin contexto más allá de la ventana: la coherencia entre ventanas consecutivas (transiciones, pausas, prosodia larga) debe gestionarla la aplicación que consume el modelo.
- Entrada rígida: exactamente 32 000 muestras Float32 mono a 16 kHz. Cualquier audio debe remuestrearse y trocearse; no hay manejo interno de silencios, ruido ni solapamiento.
- Salida limitada a 52 blendshapes ARKit a 30 fps y solo de la zona facial/labial. No genera pose de cabeza, mirada, emoción ni movimiento corporal.
- Calidad dependiente del idioma: el modelo base declarado (`wav2vec2-base-960h`) se entrenó con habla inglesa y el autor no documenta cobertura multilingüe. En castellano u otros idiomas la sincronización puede degradarse; conviene validarlo antes de producción.
- Riesgo en audio musical, ruido de fondo, voces superpuestas o susurros: no hay datos publicados sobre robustez en estas condiciones.
- No hay información sobre sesgos demográficos (edad, género, acento) ni sobre el dataset de animación empleado, lo que impide evaluar equidad de la sincronización labial.
- La cuantización int8 introduce una pérdida medida de correlación de hasta 0,011 en el peor caso en los blendshapes de boca; si se requiere máxima fidelidad, debe usarse la variante float.
- Licencia Apache 2.0: permite uso comercial, pero obliga a incluir `LICENSE` y `NOTICE` en la distribución y a conservar los avisos de atribución.
- Señales de adopción muy bajas (0 descargas, 0 likes) y repositorio creado en octubre de 2026: no hay validación independiente de las métricas reportadas por el autor.
- No hay pipeline declarado en Hugging Face ni model card con detalles de entrenamiento, lo que dificulta la auditoría técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enconvo/avatar-lipsync-1-onnx
- Build Core ML para Apple: https://huggingface.co/enconvo/avatar-lipsync-1-coreml
- Repositorio LAM Audio2Expression: https://github.com/aigc3d/LAM_Audio2Expression
- Modelo base LAM audio2exp: https://huggingface.co/3DAIGC/LAM_audio2exp
- Modelo base wav2arkit_cpu: https://huggingface.co/myned-ai/wav2arkit_cpu
- Modelo base wav2vec2-base-960h: https://huggingface.co/facebook/wav2vec2-base-960h
- Documentacion de Enconvo: https://docs.enconvo.ai/
- ONNX Runtime, catalogo de modelos: https://onnxruntime.ai/models
- ONNX Model Zoo: https://github.com/onnx/models
