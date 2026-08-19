# oxide-lab/whisper-tiny-GGUF

## Resumen

El modelo `oxide-lab/whisper-tiny-GGUF` es una versión cuantizada del modelo de reconocimiento automático de voz (ASR) `openai/whisper-tiny`, convertido al formato GGUF para su uso con los motores de inferencia Candle (Rust) y whisper.cpp (C++). Desarrollado por Oxide Lab, este repositorio ofrece diez niveles de cuantización que van desde q2_k hasta q8_0, permitiendo ajustar el equilibrio entre tamaño, velocidad y calidad según el caso de uso.

El modelo original, Whisper-tiny, es un transformer encoder-decoder de 37,8 millones de parámetros entrenado por OpenAI con 680.000 horas de audio débilmente supervisado. Esta versión cuantizada conserva la misma arquitectura y capacidades multilingües, pero reduce drásticamente el tamaño del archivo (de aproximadamente 150 MB a entre 40 y 80 MB según la cuantización), lo que lo hace viable para ejecución en dispositivos con recursos limitados, aplicaciones de escritorio y entornos embebidos.

La relevancia de este modelo radica en su integración nativa con el ecosistema Rust y Candle, así como con whisper.cpp, ofreciendo una alternativa ligera y de código abierto para transcripción de voz en tiempo real sin depender de servicios en la nube. Su licencia MIT facilita su adopción tanto en proyectos comerciales como de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.776.720 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper usa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | q2_k, q3_k, q4_0, q4_k, q4_1, q5_0, q5_k, q5_1, q6_k, q8_0 |
| Idiomas soportados | multilingual, en, ru (según la model card; Whisper-tiny original soporta 99 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (dos variantes: Candle-compatible y whisper.cpp-compatible) |

## Arquitectura y entrenamiento

El modelo base es `openai/whisper-tiny`, un transformer encoder-decoder con atención multi-cabeza. El encoder procesa espectrogramas Mel de 80 canales a partir de ventanas de audio de 30 segundos, mientras que el decoder genera transcripciones de forma autorregresiva. El entrenamiento original utilizó 680.000 horas de audio etiquetado de forma débil, combinando tareas de transcripción y traducción al inglés.

Esta versión GGUF no modifica la arquitectura ni los pesos del modelo original; únicamente aplica cuantización posterior al entrenamiento. El proceso de conversión se realizó mediante dos métodos: uno en Python que convierte directamente de PyTorch a GGUF añadiendo el prefijo `model.` a los nombres de tensores para compatibilidad con Candle, y otro mediante la herramienta `whisper-quantize` de whisper.cpp que mantiene los nombres originales. No se aplicó ningún ajuste fino adicional ni técnicas como RLHF o DPO.

## Capacidades

- Reconocimiento de voz automático (ASR) multilingüe, con soporte declarado para inglés, ruso y otros idiomas (según el modelo base Whisper-tiny).
- Transcripción de audio en tiempo real, con latencia adecuada para aplicaciones interactivas.
- Traducción de audio a inglés (capacidad inherente de Whisper, aunque no se documenta explícitamente en esta variante).
- Compatibilidad con dos motores de inferencia: Candle (Rust) y whisper.cpp (C++), ambos con soporte para CPU y GPU.
- Inferencia local sin conexión a internet, sin envío de datos a servidores externos.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente; es exclusivamente un modelo de transcripción.

## Casos de uso

- Transcripción de reuniones en aplicaciones de escritorio: gracias a su integración con Candle y Tauri, puede integrarse en aplicaciones Rust nativas para transcribir audio en tiempo real, manteniendo la privacidad de los datos al procesarse localmente.
- Asistentes de voz en dispositivos embebidos: el tamaño reducido (a partir de ~40 MB en q2_k) permite ejecutar el modelo en Raspberry Pi, placas con ARM o sistemas con poca memoria, ofreciendo comandos de voz sin conexión.
- Subtitulado automático de vídeos: con whisper.cpp, se puede transcribir audio de vídeos en lote, generando subtítulos en múltiples idiomas con una calidad aceptable para flujos de trabajo no críticos.
- Automatización de documentación clínica o legal: la transcripción de grabaciones de consultas o entrevistas puede realizarse de forma local, cumpliendo requisitos de confidencialidad al no enviar audio a servicios externos.
- Pruebas de calidad en pipelines de ASR: al ser una versión cuantizada, sirve como referencia para evaluar el impacto de la cuantización en la precisión, comparando salidas entre niveles (q5_0 recomendado como mínimo viable).
- Desarrollo de prototipos en Rust: los desarrolladores pueden usar el modelo como componente base para experimentar con procesamiento de audio en el ecosistema Candle, sin necesidad de depender de librerías Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER (Word Error Rate) ni comparativas con el modelo original. Se recomienda consultar el paper de Whisper (Radford et al., 2022) para conocer el rendimiento de la versión sin cuantizar, y realizar pruebas propias con los distintos niveles de cuantización, ya que el autor advierte que las cuantizaciones inferiores a q5_0 degradan severamente la calidad.

## Requisitos de hardware

- El modelo tiene 37,7 millones de parámetros; en FP32 ocupa ~150 MB, en q8_0 ~80 MB y en q4_k ~40 MB.
- Puede ejecutarse en CPU sin necesidad de GPU; la inferencia es rápida incluso en procesadores de gama media (un audio de 30 segundos se procesa en menos de un segundo en hardware moderno).
- En GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente; incluso iGPUs integradas pueden manejarlo.
- Es compatible con dispositivos móviles y SBCs como Raspberry Pi 4/5, siempre que se utilicen cuantizaciones q5_0 o inferiores.
- Opciones de despliegue: Candle (Rust) para aplicaciones nativas, whisper.cpp para integración en C/C++, y mediante bindings de whisper.cpp en otros lenguajes (Python, Node, etc.).
- No se requieren bibliotecas de aprendizaje profundo pesadas; el modelo se ejecuta directamente con las implementaciones optimizadas de Candle o whisper.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| oxide-lab/whisper-tiny-GGUF | 37,8M | GGUF | 30 s de audio | MIT | ASR en Rust/C++ |
| openai/whisper-tiny | 37,8M | PyTorch | 30 s de audio | MIT | ASR en Python |
| openai/whisper-base | 74M | PyTorch | 30 s de audio | MIT | ASR con mayor precisión |
| ggml-org/whisper.cpp | 37,8M (tiny) | GGML/GGUF | 30 s de audio | MIT | ASR en C++ |

La principal diferencia frente al modelo original es el formato de pesos: GGUF permite una carga más eficiente en motores como Candle y whisper.cpp, y la cuantización reduce el tamaño y acelera la inferencia a costa de una ligera pérdida de precisión. Comparado con whisper-base, este modelo tiene la mitad de parámetros, por lo que es más rápido y ligero, pero también menos preciso en tareas complejas o con ruido de fondo.

## Limitaciones y advertencias

- Las cuantizaciones q2_k, q3_k y q4_* producen una pérdida de calidad significativa; el autor recomienda q5_0 como mínimo para obtener resultados útiles y q8_0 para producción.
- Whisper-tiny tiene una precisión limitada en comparación con modelos más grandes (small, medium, large); puede fallar en acentos poco comunes, audio con mucho ruido o terminología especializada.
- La ventana de audio está fijada en 30 segundos; audios más largos deben segmentarse, lo que puede afectar a la coherencia de la transcripción.
- Aunque la model card indica soporte multilingüe, solo menciona explícitamente inglés y ruso; la calidad en otros idiomas puede ser inferior.
- No se proporcionan métricas de rendimiento (WER) para esta versión cuantizada; es necesario realizar evaluaciones propias antes de usarla en entornos críticos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base proviene de OpenAI; se recomienda revisar los términos de uso del modelo original para evitar conflictos de atribución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oxide-lab/whisper-tiny-GGUF
- Proyecto Oxide Lab (aplicación de escritorio Rust/Tauri): https://github.com/oxide-lab/Oxide-Lab
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Modelo base en HuggingFace: https://huggingface.co/openai/whisper-tiny
- Herramienta whisper.cpp: https://github.com/ggml-org/whisper.cpp
