# capybara102/fasth3-dense-v1-q4_0-gguf

## Resumen

FastH3 Dense v1 Q4_0 es una cuantización GGUF del denoiser MiniMax H3, un modelo de generación de vídeo a partir de texto (text-to-video) con capacidad de audio sincronizado. El modelo original lo desarrolla MiniMax; esta versión concreta la publica el usuario capybara102 y deriva de la destilación a cuatro pasos FastH3 Preview v1 (variante Dense, Data-Free) realizada por FastVideo, que a su vez parte de MiniMaxAI/MiniMax-H3. El resultado es un fichero único de 11,58 GB en formato Q4_0, pensado para ejecutarse en la NPU Hexagon de dispositivos Android dentro de la aplicación Nightmare Mobile.

La relevancia de esta ficha es acotada: no es un lanzamiento upstream ni un modelo de propósito general, sino un artefacto de despliegue móvil. Su interés técnico reside en que demuestra la viabilidad de ejecutar un denoiser de vídeo de aproximadamente 20.100 millones de parámetros en hardware de teléfono mediante cuantización agresiva a 4 bits y destilación de pasos de muestreo. No se trata de un modelo de lenguaje: no genera texto ni mantiene conversaciones.

La información disponible es limitada y proviene casi exclusivamente de la model card del autor. No hay datos de benchmarks, no se detallan idiomas soportados y la licencia es comunitaria con restricciones territoriales, por lo que cualquier evaluación de rendimiento cuantitativo queda fuera del alcance de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser de difusión para vídeo (MiniMax H3), destilado a 4 pasos; no disponible el detalle interno de bloques |
| Parametros totales | 20.116.279.777 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo text-to-video, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | Q4_0 (fichero publicado); el origen era Q4_K_M, requantizado a Q4_0 para kernels NPU |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (MiniMax H3 Community License Agreement, con territorio de aplicación limitado) |
| Formato de pesos | GGUF (fichero `fasth3_dense_v1_euler4_q4_0.gguf`, 11.583.540.608 bytes) |

## Arquitectura y entrenamiento

El modelo es un denoiser de difusión para generación de vídeo con audio asociado, derivado de MiniMax H3. La variante publicada aquí corresponde a FastH3 Preview v1 en su configuración Dense y Data-Free, una destilación que reduce el muestreo a cuatro pasos Euler. El proceso de inferencia descrito utiliza la tabla `gestura.adaln.timesteps`, con shift 12 para vídeo y 3 para audio, y CFG 1. Se emplean el VAE de vídeo y el VAE de audio de H3.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; estos detalles no aparecen en la información proporcionada. La modificación introducida respecto al GGUF de origen (Gestura FastH3 GGUF, en Q4_K_M) consiste en una recuantización a Q4_0 para adaptarse a los kernels de la NPU, manteniendo sin cambios los tensores F32 y la tabla de curvas AdaLN. El autor afirma que, medida en la CPU del teléfono con la misma semilla y prompt, la salida Q4_0 no es más blanda que la Q4_K_M, pero no se aportan métricas objetivas que respalden esa comparación.

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`).
- Generación de audio asociado al vídeo, con VAE de audio dedicado y control de shift independiente.
- Espera un prompt estructurado específico de H3: definiciones de sujeto, resumen, descripción detallada con el habla marcada como `<d>[English] ...</d>`, paisaje sonoro y música.
- Muestreo en cuatro pasos Euler, lo que reduce el coste computacional frente a un muestreo completo.
- Integración con un codificador de texto externo: en la app se usa Qwen3-VL-4B junto con la proyección ClipProj de NicoLab28, en lugar del codificador de 32B de H3.
- Ejecución prevista en la ruta NPU Hexagon de Android mediante la aplicación Nightmare Mobile.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Generación de vídeo corto en dispositivo Android: el modelo está empaquetado para la ruta NPU Hexagon de Nightmare Mobile, de modo que un teléfono compatible puede producir clips de vídeo con audio sin depender de la nube. La cuantización Q4_0 y los cuatro pasos Euler son los que hacen viable el despliegue.
- Prototipado de aplicaciones móviles de creación audiovisual: desarrolladores que integren Nightmare Mobile pueden usar este GGUF como motor de generación para demos de vídeo con sonido sincronizado, aprovechando el pipeline text-to-video ya definido.
- Investigación sobre cuantización extrema en difusión de vídeo: sirve como artefacto de referencia para estudiar el impacto de Q4_0 frente a Q4_K_M en la calidad de salida de un denoiser de ~20B parámetros, aunque el autor no publica métricas formales.
- Generación de contenido con voz y ambiente controlados: el prompt estructurado de H3 permite especificar diálogo en inglés mediante etiquetas `<d>`, paisaje sonoro y música, útil para crear escenas con audio descriptivo en flujos de previsualización.
- Evaluación de destilación a pocos pasos: al ser una variante de cuatro pasos, permite comparar en un entorno móvil el equilibrio entre número de pasos y fidelidad frente a muestreos más largos del modelo H3 original.
- Pruebas de integración de codificadores de texto alternativos: el uso de Qwen3-VL-4B con ClipProj en lugar del codificador de 32B de H3 lo convierte en un banco de pruebas para reducir requisitos de memoria en pipelines de generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una comparación cualitativa, sin métricas, entre la salida Q4_0 y Q4_K_M medida en la CPU del teléfono con la misma semilla y prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El fichero GGUF ocupa 11,58 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos, más la memoria de activaciones y de los VAE de vídeo y audio.
- GPU recomendadas: no disponibles. El destino declarado no es una GPU de escritorio, sino la NPU Hexagon de un SoC Android.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño de pesos (11,58 GB) supera la VRAM de muchas GPU de consumo de 8 GB y se acerca al límite de las de 12 GB, pero no hay datos de ejecución en GPU.
- Opciones de despliegue: la vía documentada es la aplicación Nightmare Mobile (ruta NPU Hexagon). No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de difusión de vídeo, estas herramientas no son aplicables directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Destino | Licencia | Notas |
|---|---|---|---|---|---|
| FastH3 Dense v1 Q4_0 (este) | ~20,1B | GGUF Q4_0 | NPU Android (Nightmare Mobile) | minimax-h3-community | Recuantizado desde Q4_K_M |
| Gestura FastH3 GGUF | no disponible | GGUF Q4_K_M | no disponible | no disponible | Origen de la recuantización |
| FastVideo FastH3 4-step Preview v1 Dense Data-Free | no disponible | safetensors (presumible) | servidor/GPU | no disponible | Destilación a 4 pasos de la que deriva |
| MiniMaxAI/MiniMax-H3 | no disponible | no disponible | no disponible | minimax-h3-community | Modelo base original |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no responde a preguntas, no genera texto libre ni soporta conversación; su única función es generar vídeo (con audio) a partir de un prompt estructurado.
- La licencia minimax-h3-community está limitada a un territorio de aplicación concreto; es imprescindible leer `LICENSE` y `NOTICE` antes de cualquier uso, incluido el comercial.
- El autor declara explícitamente que no existe respaldo de MiniMax, FastVideo ni Gestura sobre esta publicación.
- Es un fichero modificado, no una release upstream: la recuantización a Q4_0 puede degradar la calidad respecto al Q4_K_M original, y la única evidencia aportada es una observación cualitativa sin métricas.
- La calidad depende de un prompt estructurado muy específico de H3; prompts genéricos pueden producir resultados pobres.
- El ecosistema de ejecución está acoplado a una aplicación concreta (Nightmare Mobile) y a una ruta de hardware concreta (NPU Hexagon), lo que limita la portabilidad.
- Riesgo de alucinación visual y artefactos propios de la difusión de vídeo: no se documentan evaluaciones de fidelidad, coherencia temporal ni sincronización audio-vídeo.
- Sesgos: no disponibles; no se publica información sobre la composición del dataset ni sobre sesgos conocidos.
- Idiomas: no disponibles; el prompt de ejemplo usa habla en inglés mediante etiquetas `<d>[English]`, pero no se confirma qué idiomas admite el modelo.
- Sin descargas ni likes en el momento de la consulta, y sin historial de mantenimiento: la reproducibilidad y el soporte a largo plazo no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/capybara102/fasth3-dense-v1-q4_0-gguf
- Modelo base (destilación FastH3): https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- GGUF de origen (Gestura, Q4_K_M): https://huggingface.co/ZawShiShawn/Gestura-FastH3-GGUF
- Proyección ClipProj: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- Aplicación Nightmare Mobile: https://github.com/AbrahamPaulJ/nightmare-mobile
