# soniqo/soniqo-kws

## Resumen

Soniqo KWS v1 es un clasificador experimental de palabra de activación (keyword spotting) desarrollado por Soniqo para detectar localmente las frases "Hey Soniqo", "Hi Soniqo" y "Hello Soniqo". Se distribuye como una red convolucional temporal pequeña entrenada desde cero, con el preprocesado log-mel fijado dentro del propio grafo, de modo que no requiere ningún embedding acústico preentrenado compartido ni transformación mel externa. El paquete incluye exportaciones en Core ML (FP32, `model.mlpackage`) y ONNX (FP32, opset 17) de aproximadamente 1 MiB cada una, orientadas a inferencia en dispositivo, con iOS como destino principal.

El modelo resuelve un problema acotado y muy específico: la detección de tres variantes de una única wake word en audio mono a 16 kHz, mediante una ventana cronológica de 3,2 segundos (51.200 muestras) que el llamante mantiene y puntúa cada 100 ms. Devuelve una única puntuación float32 por ventana y la lógica de decisión (dos puntuaciones consecutivas >= 0,5, rearme por debajo del umbral, máximo un evento por segundo) queda del lado de la aplicación. No realiza autenticación de hablante ni interpreta intención de comando: reproducir exactamente la frase puede activarlo.

Su relevancia actual es doble. Por un lado, ejemplifica el patrón de wake word completamente on-device, sin envío de audio a la nube, con un coste de memoria mínimo (entorno a 1 MiB por grafo). Por otro, es un artefacto deliberadamente marcado como `research_only` con `productionEligible: false`: toda la evaluación publicada proviene de audio sintético y de diagnósticos de desarrollo, no de validación en condiciones reales de micrófono, ruido o hardware físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional temporal (temporal convolutional network) pequeña, entrenada desde cero, con preprocesado log-mel fijo dentro del grafo |
| Parametros totales | no disponible (el autor solo publica el tamaño de los ficheros: ~1 MiB por exportación en FP32) |
| Longitud de contexto | no aplica en el sentido de contexto de texto; ventana de audio fija de 3,2 s (51.200 muestras mono a 16 kHz, float32, rango [-1, 1]) |
| Tipos de cuantizacion | FP32 únicamente (exportaciones Core ML y ONNX en FP32); no se documentan variantes cuantizadas |
| Idiomas soportados | en (inglés); se indican pronunciaciones previstas «со́нико» y «сони́ко» |
| Licencia | soniqo-all-rights-reserved (license: other, con fichero LICENSE en el repositorio; todos los derechos reservados) |
| Formato de pesos | Core ML (`model.mlpackage/`) y ONNX (`model.onnx`, opset 17); ficheros auxiliares `inference_config.json`, `release_manifest.json`, `evaluation_summary.json`, `checksums.json` |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional temporal de tamaño reducido, diseñada específicamente para esta tarea y entrenada desde cero, sin reutilizar un modelo acústico preentrenado. La innovación práctica más relevante es de ingeniería: la extracción de características log-mel está embebida en el grafo, de manera que la entrada es directamente PCM float32 con forma `[1, 51200]` y la salida es una puntuación float32 con forma `[1]`. Esto elimina dependencias de preprocesado en el cliente y facilita la paridad numérica entre exportaciones; según el autor, Core ML y ONNX pasaron comprobaciones de paridad numérica contra la implementación en PyTorch.

Los datos de entrenamiento son íntegramente sintéticos: VoxCPM2 generó el habla de entrenamiento (VoxCPM2 no se incluye en este modelo). La v1 se entrenó con 3.850 clips sintéticos cribados automáticamente, procedentes de 180 voces fuente, y se usaron 500 clips de desarrollo de otras 20 voces fuente. El código de entrenamiento, el audio y los conjuntos de datos son privados y no se distribuyen. No se documenta en la información disponible el uso de RLHF, DPO ni de ningún otro ajuste por preferencias, algo por otra parte poco habitual en un clasificador de este tipo. El protocolo de inferencia es en streaming: el llamante mantiene la ventana cronológica, puntúa cada 100 ms, exige dos puntuaciones consecutivas >= 0,5, rearma tras una puntuación por debajo del umbral y permite como máximo un evento por segundo.

## Capacidades

- Detección de palabra de activación para tres frases concretas: "Hey Soniqo", "Hi Soniqo" y "Hello Soniqo". "Soniqo" a secas y "Okay Soniqo" no son activaciones previstas.
- Inferencia local en dispositivo, sin servicio remoto ni envío de audio a la nube.
- Puntuación en streaming cada 100 ms sobre una ventana deslizante de 3,2 s mantenida por el llamante.
- Salida de una única puntuación float32 por ventana, con lógica de decisión delegada a la aplicación (dos puntuaciones consecutivas >= 0,5, rearme, un evento por segundo como máximo).
- Preprocesado log-mel integrado en el grafo: no requiere transformación mel externa ni normalización adicional, solo remuestrear el micrófono a 16 kHz.
- Ejecución multiplataforma mediante dos exportaciones equivalentes: Core ML para iOS y ONNX para otros entornos compatibles con opset 17.
- Reproducibilidad verificable: el repositorio incluye manifiesto de release, resumen de evaluación y sumas de comprobación SHA-256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión, audio generativo ni capacidades multilingües más allá del inglés de las frases objetivo.
- No realiza autenticación de hablante ni verificación de intención de comando.

## Casos de uso

- Activación por voz en aplicaciones iOS: la exportación Core ML (`model.mlpackage`, ~1 MiB en FP32) se integra en la app y permite invocar un asistente o una función concreta sin salir del dispositivo. Es adecuado por su tamaño mínimo y por su integración nativa con el ecosistema Apple.
- Procesamiento de voz con privacidad: al ejecutarse localmente y no requerir conexión, el audio del micrófono nunca abandona el dispositivo, lo que encaja en productos con requisitos estrictos de privacidad o en entornos sin conectividad.
- Etapa previa de filtrado antes de un ASR: el detector puede actuar como puerta de bajo coste que solo despierta al motor de reconocimiento de voz cuando hay activación, reduciendo consumo y cómputo en el resto del tiempo.
- Prototipado multiplataforma con ONNX: la exportación `model.onnx` (opset 17) permite validar el comportamiento del detector en escritorio, Android o servicios embebidos antes de comprometerse con una plataforma concreta.
- Investigación en detección de wake words: el artefacto sirve como referencia reproducible para estudiar ventanas de 3,2 s, umbrales, políticas de rearme y estrategias de cribado automático de datos sintéticos.
- Auditoría de sesgo por acento: el propio autor publica una auditoría de acentos sintéticos disjuntos por fuente, lo que convierte al modelo en un caso de estudio sobre cómo medir (y cómo fallar al medir) la cobertura de acentos con datos generados.
- Pruebas de regresión de exportación: las comprobaciones de paridad numérica Core ML / ONNX frente a PyTorch pueden reutilizarse como patrón para verificar que una conversión de formato no altera las puntuaciones.
- Banco de pruebas de falsos positivos: útil para estudiar cómo responde un clasificador de frases a audio que reproduce literalmente la frase objetivo, dado que el autor advierte que la reproducción exacta puede activar el modelo.
- Nota importante: todos estos usos deben considerarse experimentales. El manifiesto de release del propio autor marca el modelo como `research_only` con `productionEligible: false`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (tipo MMLU, HumanEval o GSM8K, no aplicables a esta tarea) en la información disponible. El autor sí publica diagnósticos de desarrollo sobre audio sintético, que se recogen a continuación tal cual:

| Evaluación | Resultado |
|---|---|
| Sondas sintéticas aisladas en streaming, umbral 0,5 | 242/250 positivos detectados |
| Disparos sobre clips hard-negative | 6/250 |
| Subgrupo de referencia india (misma prueba) | 19/26 |
| Auditoría de acentos sintéticos disjuntos por fuente | 70/71 clips cribados detectados (de 162 clips generados, solo 71 pasaron la puerta ASR automática) |
| Paridad numérica Core ML y ONNX frente a PyTorch | superada (sin métricas detalladas publicadas) |

El autor es explícito sobre el alcance de estas cifras: son diagnósticos de desarrollo sobre datos sintéticos, no precisión validada en el mundo real. No se han establecido la revisión humana de clips, el recall con micrófono real, el comportamiento en entornos ruidosos, las activaciones falsas por hora en uso continuo ni la latencia y el consumo en un iPhone físico.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; cada grafo ocupa alrededor de 1 MiB en FP32 más el estado de la ventana de audio de 51.200 muestras float32 (unos 200 KiB). Cabe con holgura en cualquier GPU, CPU o NPU moderna.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU sirve; en la práctica el destino previsto es CPU o Neural Engine, no una GPU dedicada.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo puede ejecutarlo; el cuello de botella no es el modelo sino el bucle de puntuación cada 100 ms.
- Opciones de despliegue: Core ML en iOS (vía `model.mlpackage`) y ONNX Runtime en el resto de plataformas (vía `model.onnx`, opset 17). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Límites medidos: la inferencia requiere remuestrear el audio del micrófono a 16 kHz, mantener la ventana cronológica de 3,2 s, exigir dos puntuaciones consecutivas >= 0,5, rearmar por debajo del umbral, permitir como máximo un evento por segundo y reiniciar el estado de audio y detección entre sesiones.
- Latencia y throughput: no disponibles. El autor indica explícitamente que la latencia y el consumo físicos en iPhone no se han establecido.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks, parámetros, contexto, licencia ni disponibilidad de modelos alternativos de detección de wake words, por lo que no es posible construir una comparación con cifras verificables. La única referencia de la misma familia es el propio Soniqo KWS v1, cuyo autor lo clasifica como experimental (`research_only`, `productionEligible: false`) y lo compara únicamente contra su propia evaluación interna sobre datos sintéticos.

## Limitaciones y advertencias

- Estado de release: el manifiesto se mantiene intencionadamente en `research_only` con `productionEligible: false`. No debe usarse como componente de producción sin una validación propia.
- Datos de entrenamiento y evaluación exclusivamente sintéticos: 3.850 clips de entrenamiento de 180 voces y 500 de desarrollo de otras 20. VoxCPM2 generó el habla y no se incluye en este modelo. El código, el audio y los datasets son privados.
- Sin validación en el mundo real: no se han establecido el recall con micrófono real, el comportamiento en entornos ruidosos, las activaciones falsas por hora en uso continuo, ni la latencia y el consumo en hardware físico.
- Sesgo por acento: en la prueba principal, el subgrupo de referencia india detectó 19/26. En la auditoría de acentos, solo 71 de 162 clips generados superaron la puerta ASR automática, con tamaños de muestra pequeños por acento; los acentos origen son autoinformados y la preservación del acento sintetizado no se verificó de forma independiente.
- Umbral no calibrado: 0,5 es un ajuste experimental, no una calibración por dispositivo. La política de decisión (dos puntuaciones consecutivas, rearme, un evento por segundo) es responsabilidad del integrador.
- Suplantación trivial: la reproducción exacta de la frase puede activar el modelo. No autentica al hablante ni establece intención de comando, por lo que no debe usarse como control de seguridad o autorización.
- Limitación de idioma: solo inglés en las frases y pronunciaciones previstas; no hay soporte multilingüe declarado.
- Restricciones de licencia: `soniqo-all-rights-reserved`, con copyright de Soniqo. La disponibilidad pública no concede una licencia amplia de reutilización o redistribución; hay que consultar el fichero LICENSE antes de cualquier uso, incluido el comercial.
- Métricas incompletas: los ficheros de evaluación solo contienen agregados; no se publican curvas ROC, DET ni desgloses por condición, lo que limita la comparación objetiva con otros detectores.
- La búsqueda web realizada no devolvió documentación técnica, papers ni discusiones independientes sobre este modelo: los resultados obtenidos no guardan relación con él y no aportan información verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soniqo/soniqo-kws
- Fichero de licencia (referenciado en la model card, dentro del repositorio): LICENSE
- Configuración de inferencia: `inference_config.json` (incluido en el repositorio)
- Manifiesto de release: `release_manifest.json` (incluido en el repositorio)
- Resumen de evaluación: `evaluation_summary.json` (incluido en el repositorio)
- Sumas de comprobación SHA-256: `checksums.json` (incluido en el repositorio)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
