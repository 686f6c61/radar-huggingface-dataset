# engram-ae/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF

## Resumen

Nemotron-3-Nano-Omni-30B-A3B-Reasoning es un modelo multimodal desarrollado por NVIDIA que unifica la comprensión de video, audio, imagen y texto en un solo sistema. Esta versión GGUF, publicada por el usuario engram-ae, adapta el checkpoint original en BF16 para su ejecución con llama.cpp, lo que permite desplegarlo en hardware variado, incluidas GPU de consumo y sistemas de memoria unificada como el DGX Spark. El modelo está diseñado para tareas de inteligencia documental, transcripción de voz, análisis de video con banda sonora y razonamiento general, con un modo de razonamiento (chain-of-thought) activado por defecto.

La arquitectura combina un backbone Mamba2-Transformer híbrido de tipo MoE con aproximadamente 31 000 millones de parámetros totales y unos 3 000 millones activos por token, junto con dos codificadores: el vision encoder C-RADIO v4-H para imagen y fotogramas de video, y el speech encoder Parakeet para audio. Ambos codificadores se empaquetan en un único proyector multimodal unificado en formato GGUF, de modo que un solo proceso de servidor acepta video, audio, imagen y texto sin intercambiar ficheros. La licencia es el NVIDIA Open Model Agreement, que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2-Transformer hybrid Mixture of Experts (MoE) |
| Parametros totales | 31 577 940 288 (31,6 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, IQ3_M, IQ4_XS, MXFP4_MOE, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | No disponibles |
| Licencia | NVIDIA Open Model Agreement (nvidia-open-model-agreement) |
| Formato de pesos | GGUF (modelo de lenguaje y proyectores) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura híbrida Mamba2-Transformer con mezcla de expertos (MoE). El backbone lingüístico es el Nemotron 3 Nano LLM de 30B-A3B, que activa aproximadamente 3 000 millones de parámetros por token, lo que reduce el coste computacional por inferencia frente a un modelo denso de tamaño similar. Para la parte multimodal se emplean dos codificadores: el vision encoder C-RADIO v4-H para fotogramas de imagen y video, y el speech encoder Parakeet (FastConformer) para audio. Ambos se integran en un proyector unificado en formato GGUF que llama.cpp resuelve por modalidad (clip.vision.projector_type = nemotron_v2_vl y clip.audio.projector_type = parakeet), permitiendo procesar video con su pista de audio en una sola pasada: los fotogramas van a la torre de visión y el sonido se demultiplexa y se alimenta a la torre de audio en la misma petición.

El modelo se distribuye en nueve cuantizaciones, desde Q3_K_M hasta BF16, junto con el proyector unificado `mmproj-omni-vision-audio-F16.gguf` de 2,8 GB. Los pesos de los codificadores se conservan bit-exactos respecto a las conversiones por torre individuales. El grafo de cálculo de audio (Parakeet FastConformer) y la ruta de parcheado temporal de video son adiciones al fork llama.cpp-omni, validado contra una referencia PyTorch (grafo de video con error del 0,0019 % y audio del 0,03 %). El modo de razonamiento (thinking) está activado por defecto y se recomiendan parámetros de temperatura 0,6, top_p 0,95 y hasta 20 480 tokens de salida; para transcripción determinista se usa temperatura 0,0 y máximo 2048 tokens.

## Capacidades

- Comprensión multimodal unificada: acepta video (mp4), audio (wav, mp3), imagen (JPEG, PNG) y texto como entrada, y produce texto como salida.
- Razonamiento con chain-of-thought activado por defecto (modo thinking), con salida de razonamiento explícita.
- Transcripción de voz (ASR) mediante el codificador Parakeet, con recomendación de audio a 16 kHz mono.
- OCR y análisis de documentos: capaz de leer texto en imágenes, comprender gráficos y documentos largos.
- Razonamiento multimodal sobre video con pista sonora: responde sobre lo que ve y lo que oye en un único fichero.
- Uso agéntico: diseñado como subagente de percepción multimodal para sistemas agénticos, con soporte de razonamiento multi-paso.
- Integración con llama.cpp: imagen y texto funcionan con la versión estándar; audio y video requieren el fork llama.cpp-omni (rama feat/nemotron-video).

## Casos de uso

- Análisis de video con audio para seguridad o monitorización: el modelo procesa un fichero mp4 completo, incluyendo la pista sonora, y genera respuestas sobre lo que ocurre en la escena y lo que se dice, en una sola petición.
- Transcripción y resumen de reuniones: se alimenta el audio de una grabación (wav o mp3) y el modelo produce transcripción literal o un resumen estructurado con razonamiento.
- Inteligencia documental: extracción de información de imágenes escaneadas, gráficos y tablas mediante OCR y comprensión de documentos largos, sin necesidad de pipeline separado.
- Asistente multimodal de atención al cliente: integrado como subagente que recibe capturas de pantalla, vídeos de demostración o audios del usuario y genera respuestas razonadas o acciones de GUI.
- Automatización de agentes de interfaz gráfica (GUI): el modelo interpreta capturas de pantalla y vídeo de interacción con aplicaciones para guiar agentes de uso de software.
- Análisis de contenido multimedia para moderación o indexación: procesa vídeos con audio en una sola pasada para generar metadatos, resúmenes o clasificaciones de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada.

## Requisitos de hardware

- Memoria libre mínima: el autor indica que se requiere aproximadamente 28 GB de memoria libre para ejecutar el modelo con la cuantización Q4_K_M y el proyector.
- GPU verificada: NVIDIA DGX Spark (GB10, memoria unificada). El modelo es compatible con cualquier plataforma que soporte llama.cpp: CUDA, Metal y CPU.
- No se dispone de datos de VRAM específicos por cuantización; con Q4_K_M se estima un uso de alrededor de 18-20 GB de VRAM para el modelo más los 2,8 GB del proyector.
- Despliegue: llama.cpp estándar para imagen y texto; para audio y video es obligatorio usar el fork llama.cpp-omni (rama feat/nemotron-video).
- Opciones de despliegue adicionales: servidor de llama.cpp, integración con Ollama (si se añade el fork), o despliegue en sistemas de memoria unificada como DGX Spark.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos multimodales de características equivalentes (mismo tamaño y modalidades) en la información proporcionada. El modelo base es el NVIDIA Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16, del que esta versión GGUF es una conversión cuantizada.

## Limitaciones y advertencias

- El modo de razonamiento está activado por defecto; en tareas de transcripción determinista se recomienda fijar temperatura a 0,0 para evitar variabilidad.
- La ejecución de audio y video requiere el fork llama.cpp-omni (rama feat/nemotron-video); la versión estándar de llama.cpp solo soporta imagen y texto.
- Los idiomas soportados no se han documentado en la información disponible; la capacidad multilingüe real no está confirmada.
- La licencia NVIDIA Open Model Agreement permite uso comercial, pero debe revisarse el texto completo para verificar obligaciones de atribución o restricciones de despliegue.
- El modelo puede presentar alucinaciones o errores en tareas de razonamiento complejo o en la interpretación de contenido visual o auditivo ambiguo; se recomienda validación humana para casos de alto riesgo.
- No se han publicado resultados de benchmarks, por lo que el rendimiento relativo frente a otros modelos no está cuantificado.
- El tamaño del repositorio es de 132 GB (todas las cuantizaciones); para desplegar solo se necesita descargar la cuantización elegida y el proyector.

## Enlaces

- Repositorio GGUF de engram-ae: https://huggingface.co/engram-ae/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF
- Modelo base en BF16: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Blog de NVIDIA sobre Nemotron 3 Nano Omni: https://huggingface.co/blog/nvidia/nemotron-3-nano-omni-multimodal-intelligence
- Página de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning/modelcard
- Repositorio llama.cpp-omni (fork): https://github.com/VincentKaufmann/llama.cpp-omni
- Hub de modelos Nemotron de NVIDIA: https://developer.nvidia.com/topics/ai/nemotron
- Repositorio oficial de NVIDIA-NeMo/Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
- Vision encoder C-RADIO v4-H: https://huggingface.co/nvidia/C-RADIOv4-H
- Speech encoder Parakeet: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
