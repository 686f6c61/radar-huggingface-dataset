# finanfa-tech/finanfa-igbo-tts-v1

## Resumen

finanfa-igbo-tts-v1 es un modelo de síntesis de voz (text-to-speech) especializado en igbo (`ig`), una lengua de Nigeria y África Occidental. Lo publica Finanfa Tech, con empaquetado y cuantización a cargo de AWADEME Ronaldo. El modelo parte del trabajo de alineación original de Samuel Olubukun (`samuelolubukun/murivo-tts-21m-igbo`), reutiliza la arquitectura acústica de Anurag Kanade (`edwixx/rapido-tts`) y emplea el vocoder AudioVAE de 48 kHz del equipo OpenBMB (`openbmb/VoxCPM2`).

La relevancia del modelo está en dos frentes. Por un lado, cubre una lengua de bajos recursos con una calidad de muestreo nativa de 48 kHz, algo poco habitual en TTS para idiomas africanos. Por otro, la versión pública está cuantizada en int8 y ocupa solo 21 MB, lo que permite inferencia en CPU y dispositivos ligeros sin GPU dedicada.

La arquitectura es un Diffusion Transformer (DiT) con flow matching de aproximadamente 20,9 millones de parámetros. El modelo respeta la ortografía estándar Onwu, incluyendo las vocales subpuntuadas (`ị`, `ọ`, `ụ`) y las consonantes nasales y labiovelares (`gb`, `kp`, `nw`, `ny`). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-Matching Diffusion Transformer (DiT) con vocoder VoxCPM2 AudioVAE causal |
| Parametros totales | ~20,9 M (modelo acústico) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (versión pública); no se documentan otros formatos |
| Idiomas soportados | igbo (`ig`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,0 GB; se descarga mediante `hf download`) |
| Frecuencia de muestreo | 48 000 Hz nativos |
| Tamano del artefacto | 21 MB (int8) |
| Vocoder | VoxCPM2 AudioVAE causal 48 kHz |

## Arquitectura y entrenamiento

El modelo acústico es un Diffusion Transformer de unos 20,9 millones de parámetros entrenado con flow matching, un paradigma generativo que modela un campo de velocidad continuo entre ruido y audio en lugar de una cadena de denoising discreta. La salida del DiT se decodifica a forma de onda mediante el vocoder causal VoxCPM2 AudioVAE a 48 kHz, lo que da lugar a audio de banda completa sin necesidad de un upsampling posterior.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el número de tokens ni si se aplicaron etapas de RLHF o DPO. La model card atribuye el trabajo de alineación original a `samuelolubukun/murivo-tts-21m-igbo` y la arquitectura acústica a `edwixx/rapido-tts`; la contribución de Finanfa Tech se limita al empaquetado y la cuantización int8. La inferencia expone parámetros de control como `guidance` (clasifier-free guidance), `speed` y `steps` (número de pasos de muestreo), con valores de ejemplo de 1,8, 1,0 y 15 respectivamente.

## Capacidades

- Síntesis de voz en igbo a 48 kHz nativos con un único hablante (no se documenta clonación de voz).
- Respeto de la ortografía estándar Onwu, incluidas vocales subpuntuadas (`ị`, `ọ`, `ụ`) y consonantes nasales y labiovelares (`gb`, `kp`, `nw`, `ny`).
- Control de velocidad del habla mediante el parámetro `speed`.
- Control de fidelidad y expresividad mediante `guidance` y del coste computacional mediante `steps`.
- Ejecución en CPU o CUDA (`device="cpu"` o `device="cuda"`).
- Exportación directa a WAV a 48 kHz mediante `save_wav`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni multilingüismo más allá del igbo.

## Casos de uso

- **Accesibilidad y lectores de pantalla en igbo:** el modelo convierte texto escrito en voz sintética de 48 kHz para usuarios con discapacidad visual o dificultades lectoras, con una calidad de muestreo adecuada para reproducción en altavoces y auriculares sin artefactos de banda limitada.
- **Locución de contenidos educativos:** generación de narraciones para materiales escolares, cursos en línea y audiolibros en igbo. El control de `speed` permite ajustar el ritmo a distintos niveles de comprensión y el de `guidance` a distintos registros.
- **Sistemas de anuncios y megafonía:** integración en aplicaciones de transporte, aeropuertos o comercios que necesiten anuncios pregrabados o dinámicos en igbo. El tamaño de 21 MB y la inferencia en CPU permiten desplegarlo en dispositivos empotrados o de bajo coste.
- **Asistentes de voz locales:** inclusión como capa de salida de voz en asistentes conversacionales en igbo que se ejecuten en el propio dispositivo, sin depender de servicios en la nube y sin enviar texto del usuario a terceros.
- **Doblaje y preproducción audiovisual:** generación de pistas de voz provisionales en igbo para vídeos, documentales o material de formación antes de contratar locución humana, con la ventaja de que la salida a 48 kHz es compatible con flujos de postproducción estándar.
- **Preservación lingüística y corpus de investigación:** producción de audio sintético controlado en igbo para estudios de fonética, evaluación de reconocedores de voz o ampliación de corpus de lenguas de bajos recursos, siempre que se documente el origen sintético de los datos.
- **Pruebas de integración en pipelines TTS:** uso como componente de referencia en sistemas de texto a voz multilingües donde el igbo es una de las lenguas objetivo, aprovechando su licencia Apache 2.0 y su reducido consumo de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** no se documenta. Con 20,9 M de parámetros en int8 (21 MB), el modelo cabe holgadamente en cualquier GPU consumer e incluso en memoria unificada de dispositivos móviles; el cuello de botella será el vocoder AudioVAE de 48 kHz, cuyo coste no se especifica.
- **GPU recomendadas:** no se indican modelos concretos. La model card contempla explícitamente `device="cpu"` y `device="cuda"`, lo que sugiere que la GPU es opcional.
- **GPU consumer:** con total certeza cabe en cualquier RTX (3060, 4060, 4090) e incluso en iGPU, dado el tamaño del artefacto; no se aportan cifras de latencia por modelo.
- **Opciones de despliegue:** el repositorio incluye un script `infer.py` con la clase `MurivoTTS` y los métodos `synthesize` y `save_wav`. Dependencias declaradas: `torch`, `soundfile` y `numpy`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a TTS).
- **Latencia y throughput:** no disponibles. Los parámetros `steps` (15 en el ejemplo) y `guidance` (1,8) condicionan directamente el coste de inferencia, pero no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. Se listan a continuación los proyectos citados como base del modelo, que constituyen la referencia más directa:

| Modelo | Relación con finanfa-igbo-tts-v1 | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finanfa-igbo-tts-v1 | Modelo evaluado | ~20,9 M (int8) | no disponible | Apache 2.0 | Hugging Face |
| samuelolubukun/murivo-tts-21m-igbo | Base de alineación original | ~21 M (según nombre) | no disponible | no disponible | Hugging Face |
| edwixx/rapido-tts | Arquitectura acústica reutilizada | no disponible | no disponible | no disponible | Hugging Face |
| openbmb/VoxCPM2 | Vocoder AudioVAE 48 kHz | no disponible | no disponible | no disponible | Hugging Face |

No se identifican en la información disponible alternativas TTS para igbo con las que establecer una comparación cuantitativa de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- **Idioma único:** el modelo solo soporta igbo (`ig`); no se documenta cobertura multilingüe ni cambios de voz.
- **Un solo hablante:** no se menciona clonación de voz ni selección de hablante; la variabilidad de timbre es previsiblemente nula.
- **Sesgos:** no se documentan sesgos conocidos, pero al no publicarse la composición del corpus de entrenamiento no es posible evaluar sesgos dialectales, de género o de registro.
- **Alucinación y errores de pronunciación:** no se aportan métricas de inteligibilidad (MOS, WER) ni de fidelidad prosódica; el comportamiento ante texto fuera de la ortografía Onwu, abreviaturas o préstamos del inglés no está documentado.
- **Cuantización int8:** la versión pública está cuantizada; no se especifica la degradación de calidad respecto al modelo en precisión completa, que no se distribuye en este repositorio.
- **Contexto y longitud de entrada:** no se indica la longitud máxima de texto por llamada ni si existe chunking interno; en producción habrá que trocear textos largos manualmente.
- **Formato de pesos:** el repositorio aparece con tamaño de 0,0 GB y no se listan ficheros de pesos en la información disponible; conviene verificar la integridad de la descarga antes de desplegar.
- **Licencia:** Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, las dependencias (vocoder VoxCPM2, arquitectura rapido-tts) deben revisarse por separado para confirmar que sus licencias son compatibles.
- **Madurez:** el modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finanfa-tech/finanfa-igbo-tts-v1
- Autor (Finanfa Tech): https://huggingface.co/finanfa-tech
- Modelo base de alineación (Samuel Olubukun): https://huggingface.co/samuelolubukun/murivo-tts-21m-igbo
- Perfil de Samuel Olubukun: https://huggingface.co/samuelolubukun
- Arquitectura acústica (Anurag Kanade): https://huggingface.co/edwixx/rapido-tts
- Vocoder AudioVAE 48 kHz (OpenBMB): https://huggingface.co/openbmb/VoxCPM2
- Banner del modelo: https://huggingface.co/finanfa-tech/finanfa-igbo-tts-v1/resolve/main/murivo-banner.jpg
- Muestra de audio 1: https://huggingface.co/finanfa-tech/finanfa-igbo-tts-v1/resolve/main/sentence_1.wav
- Muestra de audio 2: https://huggingface.co/finanfa-tech/finanfa-igbo-tts-v1/resolve/main/sentence_2.wav
- Muestra de audio 3: https://huggingface.co/finanfa-tech/finanfa-igbo-tts-v1/resolve/main/sentence_3.wav
