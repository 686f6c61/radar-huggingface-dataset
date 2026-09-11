# AlicanKiraz0/Kahya-TTS-v1.0

# Kahya-TTS-v1.0: adaptación turca de VoxCPM2 para síntesis de voz

## Resumen
Kahya-TTS-v1.0 es un modelo de síntesis de voz (text-to-speech) en turco desarrollado por Alican Kiraz como adaptación del modelo VoxCPM2 de OpenBMB. Se trata de un ajuste fino mediante LoRA (rango 64, alpha 64) sobre las proyecciones de atención del LM y del DiT del modelo base, entrenado sobre un corpus privado de un único hablante turco (TR-Voice-TTS) y publicado como pesos fusionados en el checkpoint correspondiente al paso 1500. El modelo genera audio mono a 48 kHz y acepta una grabación de referencia para condicionar la voz en el momento de la inferencia, sin reentrenar adaptadores.

Con 2.290.004.544 parámetros (unos 2,29 B) y un repositorio de 5,0 GB en safetensors BF16, el modelo está en un rango de tamaño que permite inferencia en GPU de consumo, algo relevante para equipos que necesitan TTS en turco sin depender de APIs externas. Su relevancia actual radica en que cubre un idioma con poca cobertura en modelos TTS abiertos de alta calidad y en que se publica bajo licencia Apache-2.0, lo que facilita su integración comercial.

No obstante, la propia model card advierte de que la versión 1.0 empaqueta un checkpoint ya evaluado previamente y no documenta una reproducción independiente del entrenamiento: el manifiesto de entrada original y el estado del optimizador no se recuperaron. El repositorio acumula 5 descargas y 15 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de VoxCPM2 (componente LM más componente DiT); el ajuste LoRA se aplicó a las proyecciones de atención de ambos |
| Parámetros totales | 2.290.004.544 (≈2,29 B), según safetensors |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible. El script de inferencia procesa una frase completa por llamada y no divide párrafos automáticamente |
| Tipos de cuantización | No disponible. El repositorio se distribuye en safetensors BF16; no se documentan variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16), pesos fusionados; repositorio de 5,0 GB con scripts de inferencia |
| Tipo de pipeline | text-to-speech |
| Frecuencia de salida | Mono, 48 kHz |
| Biblioteca | voxcpm |
| Modelo base | openbmb/VoxCPM2 (relación: finetune) |
| Checkpoint de origen | AlicanKiraz0/Kahya-TTS-step_1500, revisión 458112a0fc3d850de38951796290e48ef710bc26 |
| Dataset de ajuste | AlicanKiraz0/TR-Voice-TTS (corpus privado turco de un solo hablante) |
| Método de adaptación | LoRA, rango 64, alpha 64, sobre proyecciones de atención de LM y DiT |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de VoxCPM2, que en la información disponible se describe implícitamente por los componentes afectados por el ajuste: un módulo de tipo LM y un módulo DiT (diffusion transformer). El proceso de adaptación consistió en un ajuste LoRA con rango 64 y alpha 64 aplicado a las proyecciones de atención de ambos módulos, entrenado durante 1500 pasos sobre el corpus TR-Voice-TTS, un conjunto privado de un único hablante en turco. La versión publicada v1.0 fusiona el adaptador en los pesos del modelo base, de modo que debe cargarse directamente sin volver a aplicar el adaptador antiguo.

La inferencia utiliza un esquema de difusión con CFG fijado en 2,0 y 16 pasos de difusión, semilla 42, tipo de dato BF16 y salida mono a 48 kHz. El script empaquetado desactiva la compilación, el denoising y los reintentos automáticos, y concatena el PCM generado sin añadir silencio, recortar, aplicar crossfade ni modificar la velocidad. No se especifica en la información proporcionada el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades
- Síntesis de voz en turco a partir de texto, con salida mono a 48 kHz.
- Clonación de voz condicionada por referencia: acepta un WAV de referencia limpio y mono mediante `--reference` o el parámetro `reference_wav_path`. La clonación ocurre en inferencia y no modifica los pesos.
- Clonación con referencia y transcripción: el API de Python admite `reference_wav_path` junto a `prompt_wav_path` y `prompt_text`, heredado del API de VoxCPM2.
- Generación de texto largo con la misma referencia mediante un fichero de frases, una locución completa por línea, preservando el orden de las líneas.
- Reutilización de la misma referencia para cada línea, con una caché de referencia nueva construida por locución.
- Expresión de emoción y ritmo: la model card incluye una fila sobre emoción/ritmo, aunque el contenido disponible está truncado y no permite detallar el mecanismo.
- Escritura de salidas estructuradas por ejecución: `audio.wav`, ficheros `sentence_*.wav` y `metrics.json`.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada como comprensión, ni soporte multilingüe más allá del turco.

## Casos de uso
- Narración de audiolibros y contenido largo en turco: el modo `--sentences-file` permite procesar una locución por línea manteniendo el mismo timbre de referencia en todo el texto, y la salida se concatena sin recortes ni fundidos, lo que simplifica el montaje posterior.
- Asistentes de voz y sistemas IVR en turco: el modelo genera audio a 48 kHz adecuado para respuestas habladas de calidad telefónica o superior, con una latencia de generación compatible con turnos conversacionales cortos.
- Doblaje y localización de contenido hacia turco: la clonación por referencia permite condicionar la voz a una grabación de un actor concreto sin reentrenar el modelo, útil en preproducción y en pruebas de casting de voces.
- Accesibilidad y lectura de pantalla: conversión de texto en turco a voz para lectores de pantalla, aplicaciones de lectura asistida o señalización accesible en entornos públicos.
- Producción de material de e-learning: generación sistemática de locuciones para cursos, módulos y ejercicios en turco, con voz consistente entre lecciones y sin depender de un estudio de grabación.
- Previsualización de guiones de podcast o vídeo: generar una pista de voz provisional para validar la duración y el ritmo de un guion antes de la grabación definitiva.
- Prototipado de interfaces conversacionales turcas: integrar el modelo en un backend de prototipo para probar flujos de diálogo con audio real antes de decidir la solución de producción.
- Generación por lotes de avisos y notificaciones: procesar listas de frases en turco con una única carga del modelo, ya que el script carga el modelo una vez y genera todas las líneas del fichero.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card menciona un "benchmark de desarrollo anterior" junto a comprobaciones de escucha con hablante conocido, pero no incluye cifras en el material proporcionado, por lo que no se reproducen valores.

El único dato medido que se documenta es una comprobación de humo (smoke check) sobre CUDA realizada el 7 de septiembre de 2026 con dos locuciones: se generaron 3,36 segundos de audio a 48 kHz sin fallo por límite de longitud, con CFG 2.0, 16 pasos de difusión y semilla 42. El registro está en `evaluation/release_smoke.json` dentro del repositorio y la muestra en `examples/quickstart.wav`. No se publica tiempo de pared, RTF ni throughput.

| Prueba | Resultado | Condiciones |
|---|---|---|
| Smoke check CUDA, 2 locuciones | 3,36 s de audio a 48 kHz, sin fallo de límite de longitud | 7 de septiembre de 2026, CFG 2.0, 16 pasos de difusión, semilla 42 |
| MMLU, HumanEval, GSM8K u otros | No aplicable o no disponible para un modelo TTS | — |
| Benchmark de desarrollo anterior | Cifras no incluidas en la información disponible | — |

## Requisitos de hardware
- Peso de los pesos en BF16: aproximadamente 4,6 GB para 2,29 B de parámetros; el repositorio completo ocupa 5,0 GB, incluyendo scripts, ejemplos y registros.
- VRAM estimada para inferencia: del orden de 6 a 8 GB en BF16 contando pesos, caché de referencia y activaciones de los 16 pasos de difusión. Es una estimación a partir del tamaño de los pesos, no un dato publicado por el autor.
- GPU de consumo compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090. Cualquier GPU con 8 GB o más de VRAM debería poder alojar el modelo en BF16.
- GPU de数据中心 recomendadas para lote: A100, H100 y L40S, orientadas a generación por lotes y a servir múltiples peticiones concurrentes.
- Entorno de referencia: Linux con GPU NVIDIA CUDA, Python 3.12, PyTorch y torchaudio con CUDA 13.0, y la biblioteca `voxcpm` fijada a la revisión `f772e498a45fbb5fb8e13fbf9b9c48be9fe33e69` del repositorio de OpenBMB, junto con `huggingface_hub==1.30.0`.
- Opciones de despliegue: script de inferencia propio de la librería `voxcpm`, invocable desde línea de comandos o desde Python. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia en la información disponible.
- Latencia y throughput: no publicados. Solo se conoce que una ejecución de dos locuciones produjo 3,36 segundos de audio, sin datos de tiempo de cómputo ni de factor de tiempo real.
- Inferencia en CPU: no documentada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kahya-TTS-v1.0 | 2,29 B | No disponible | Mono 48 kHz, BF16 | Turco | Apache-2.0 | 5 descargas, 15 likes |
| openbmb/VoxCPM2 (base) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible en la información proporcionada | Repositorio público en HuggingFace |
| Otras alternativas TTS en turco | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

El único modelo directamente comparable del que se dispone información es el propio modelo base, openbmb/VoxCPM2, del que Kahya-TTS-v1.0 es un ajuste fino. La información disponible no incluye parámetros, contexto ni licencia del modelo base, ni datos de otros sistemas TTS en turco que permitan una comparación cuantitativa.

## Limitaciones y advertencias
- Entrenado sobre un corpus turco de un único hablante: la evaluación de escucha registrada se hizo con ese hablante, por lo que no se demuestra similitud de clonación para hablantes, acentos o idiomas no vistos.
- La clonación con un hablante distinto es técnicamente posible a través del API, pero requiere verificación de escucha propia: similitud, adherencia al estilo e inteligibilidad no están garantizadas.
- Sin normalización automática de texto: el script no resuelve abreviaturas, números ni fronteras de frase ambiguas en turco. Los números deben escribirse tal y como deben pronunciarse y cada línea debe ser una locución natural.
- El parámetro `--text` realiza una única llamada y no divide un párrafo automáticamente; para respuestas largas hay que usar el fichero de frases.
- La concatenación de audio no aplica silencios, recortes, crossfade ni cambios de velocidad, lo que puede generar transiciones abruptas entre locuciones si no se post-procesa.
- Trazabilidad del entrenamiento incompleta: no se recuperaron el manifiesto de entrada del entrenamiento original ni el estado del optimizador, y la model card declara explícitamente que no se reclama una reproducción independiente del entrenamiento.
- Las grabaciones del dataset y los ficheros de respuestas de los oyentes no se redistribuyen en el repositorio del modelo; el dataset de ajuste es privado.
- Riesgo de alucinación en el sentido de artefactos acústicos, pronunciaciones incorrectas o prosodia inadecuada en texto fuera de dominio, algo inherente a los modelos generativos de audio.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base openbmb/VoxCPM2 antes de un despliegue en producción.
- Riesgo ético derivado de la clonación de voz: es necesario contar con consentimiento explícito de la persona cuya voz se use como referencia y cumplir la normativa aplicable sobre deepfakes y datos biométricos.
- Solo turco: no hay soporte documentado para otros idiomas, y la información disponible no describe el comportamiento del modelo con texto mixto o préstamos lingüísticos.
- Cifra de adopción muy baja (5 descargas), por lo que la validación por parte de la comunidad es prácticamente inexistente.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/AlicanKiraz0/Kahya-TTS-v1.0
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Checkpoint de ajuste original: https://huggingface.co/AlicanKiraz0/Kahya-TTS-step_1500 (revisión `458112a0fc3d850de38951796290e48ef710bc26`)
- Dataset de ajuste (privado): https://huggingface.co/datasets/AlicanKiraz0/TR-Voice-TTS
- Repositorio de la biblioteca VoxCPM: https://github.com/OpenBMB/VoxCPM (revisión fijada `f772e498a45fbb5fb8e13fbf9b9c48be9fe33e69`)
- Referencias arXiv incluidas en los tags del repositorio: https://arxiv.org/abs/2606.06928 y https://arxiv.org/abs/2509.24650 (contenido no verificado en la información disponible)
- Manifiesto de fusión de pesos: `merge_manifest.json` (ruta relativa dentro del repositorio)
- Registro de validación del smoke check: `evaluation/release_smoke.json` (ruta relativa dentro del repositorio)
- Muestra de audio generada: `examples/quickstart.wav` (ruta relativa dentro del repositorio)
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; los resultados devueltos corresponden a foros no relacionados con síntesis de voz.
