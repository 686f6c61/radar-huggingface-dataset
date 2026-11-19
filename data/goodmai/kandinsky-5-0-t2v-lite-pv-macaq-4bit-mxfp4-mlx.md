# goodmai/Kandinsky-5.0-T2V-Lite-PV-MACaQ-4bit-MXFP4-MLX

## Resumen

Kandinsky-5.0-T2V-Lite-PV-MACaQ-4bit-MXFP4-MLX es una cuantización a 4 bits del modelo de generación de vídeo texto-a-vídeo Kandinsky 5.0 T2V Lite (variante destilada a 16 pasos, 5 segundos) de KandinskyLab, empaquetada en formato MLX para su ejecución nativa en Apple Silicon. El autor de la conversión es goodmai, que la publica junto a su herramienta Basalt, un runtime en Swift para macOS que permite generar vídeo sin depender de Python ni FFmpeg.

El modelo base es un transformer de difusión (CrossDiT) de aproximadamente 316 millones de parámetros, destilado para reducir el número de pasos de inferencia a 16 y producir clips de 5 segundos. Esta versión aplica una cuantización propia denominada PV-MACaQ MXFP4, que combina rotación de Walsh-Hadamard por bloques de 32, exponentes E8M0 cribados por Hessiano, refinamiento por coordenadas y calibración de escalas PV-Tuning sobre un conjunto de validación retenido, logrando comprimir los pesos del transformer de 4,26 GB a 1,00 GB (factor 4,27x).

Su relevancia es práctica: permite ejecutar un pipeline de generación de vídeo en Macs con 16-24 GB de memoria unificada, un segmento de hardware tradicionalmente excluido de este tipo de cargas. La licencia MIT del modelo base se mantiene, lo que facilita su uso comercial, aunque el ecosistema de ejecución (MLX y Basalt) está fuertemente ligado a macOS reciente y a Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CrossDiT (transformer de difusión) con cuantización PV-MACaQ MXFP4; pipeline text-to-video |
| Parametros totales | 316.571.456 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de contexto textual) |
| Tipos de cuantizacion | 4-bit MXFP4 con bloques de 32, rotación Walsh-Hadamard, exponentes E8M0 y pre_scale en bfloat16 (PV-Tuning); 370 capas lineales 2D del DiT cuantizadas |
| Idiomas soportados | no disponible (los prompts se procesan mediante el codificador de texto del pipeline base) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), repo de 2,1 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión denominado CrossDiT, destilado a 16 pasos de inferencia para generar clips de 5 segundos. Esta ficha corresponde a una conversión de pesos, no a un entrenamiento nuevo: el autor parte del checkpoint `kandinskylab/Kandinsky-5.0-T2V-Lite-distilled16steps-5s-Diffusers` y aplica una cuantización post-entrenamiento de 4 bits. La innovación técnica reside en el esquema PV-MACaQ: rotación de Walsh-Hadamard por bloques de 32 para redistribuir la energía de los pesos, selección de exponentes E8M0 cribada por información de Hessiano, refinamiento por coordenadas con flip y calibración de escalas mediante PV-Tuning sobre datos retenidos.

Los datos medidos por el autor indican que la cuantización reduce el footprint del transformer de 4,26 GB a 1,00 GB (4,27x de compresión), con una SQNR de salida sobre conjunto retenido de 19,15 dB frente a 18,58 dB del RTN MXFP4 (mejora de +0,57 dB) y una reducción del MSE del 11,9% respecto a RTN. No se detalla en la información disponible la composición del dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con clips de 5 segundos y 16 pasos de difusión.
- Ejecución nativa en Apple Silicon mediante MLX, con presets de memoria para 16 GB y 24 GB de memoria unificada.
- Ejecución por fases sin swap ("zero-swap phased execution"), pensada para encajar en GPUs integradas de 16-24 GB.
- Integración con Basalt Compose (`basalt.yaml` v2.2) para orquestar un modelo director de texto y el modelo de vídeo en memoria secuencial, con carga bajo demanda y descarga por inactividad.
- Soporte de VAE tiling y STA sparse en la configuración de generación de vídeo.
- Generación a 24 fps y 81 frames según el preset incluido.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de vídeo, no un LLM conversacional.

## Casos de uso

- Generación de clips cortos para redes sociales: el modelo produce vídeos de 5 segundos a 24 fps y 81 frames, adecuados para formato vertical u horizontal en publicaciones rápidas, ejecutándose localmente en un Mac sin subir prompts a servicios en la nube.
- Prototipado de storyboards: un equipo de diseño puede iterar prompts y obtener clips de referencia en una máquina de 16 GB, reduciendo la dependencia de APIs externas durante la fase creativa.
- Previsualización en pipelines de producción audiovisual: integrado mediante Basalt Compose con un modelo director de texto, permite encadenar la redacción de prompts y la generación de vídeo en memoria secuencial en un mismo equipo.
- Demos y pruebas de concepto en entornos con restricciones de privacidad: al ejecutarse en local con MLX, los prompts y los resultados no salen del dispositivo, lo que encaja en sectores con requisitos de confidencialidad.
- Investigación sobre cuantización de modelos de difusión: el repositorio documenta métricas de SQNR y MSE frente a RTN, lo que lo convierte en un artefacto útil para estudiar el impacto de esquemas MXFP4 con rotación y calibración PV-Tuning.
- Educación y formación en generación de vídeo: al no requerir Python ni FFmpeg en el flujo Basalt, simplifica la puesta en marcha en talleres y cursos sobre difusión y Apple Silicon.
- Automatización de contenido en macOS: mediante la CLI de Basalt se puede invocar la generación desde scripts o flujos de trabajo del sistema, por ejemplo para producir clips de relleno en edición automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de cuantización sobre conjunto retenido, que se recogen a continuación:

| Metrica | RTN MXFP4 | PV-MACaQ MXFP4 |
|---|---|---|
| SQNR de salida (held-out) | 18,58 dB | 19,15 dB |
| Reduccion de MSE vs RTN | referencia | -11,9% |
| Footprint del transformer | no disponible | 1,00 GB (desde 4,26 GB) |
| Factor de compresion | no disponible | 4,27x |

## Requisitos de hardware

- VRAM/memoria unificada objetivo: 16-24 GB de Apple Silicon UMA según el autor.
- GPU recomendadas: chips Apple Silicon de la gama M-series con 16 GB o más de memoria unificada; no se especifican modelos concretos (M1/M2/M3/M4) en la información disponible.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con 16 GB o más; no está pensado para GPUs NVIDIA o AMD.
- Opciones de despliegue: MLX (librería declarada) y Basalt (app macOS y CLI, macOS 27+ según la model card); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El pipeline usa 16 pasos de difusión y genera 81 frames a 24 fps, pero no se publican tiempos de generación medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-5.0-T2V-Lite-PV-MACaQ-4bit-MXFP4-MLX (esta ficha) | 316.571.456 | clips de 5 s, 16 pasos | 4-bit MXFP4 (MLX) | MIT | Hugging Face, ejecución vía Basalt/MLX |
| kandinskylab/Kandinsky-5.0-T2V-Lite-distilled16steps-5s-Diffusers (base) | no disponible en la informacion | clips de 5 s, 16 pasos | pesos originales (sin cuantizar) | MIT | Hugging Face, diffusers |
| Otras alternativas T2V comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo de generación de vídeo, no un LLM: no soporta conversación, tool calling ni razonamiento multi-paso.
- La cuantización a 4 bits introduce pérdida de calidad respecto al checkpoint original; el propio autor reporta una SQNR de 19,15 dB, lo que implica degradación medible frente a los pesos sin cuantizar.
- Dependencia fuerte del ecosistema Apple: requiere MLX y, para el flujo Basalt, macOS 27+ y Apple Silicon; no es portable a CUDA ni a CPU convencional sin conversión adicional.
- La model card no documenta sesgos, idiomas soportados ni limitaciones de contenido del modelo base; se desconoce el comportamiento multilingüe de los prompts.
- Riesgo de alucinación visual y de artefactos propios de la difusión de vídeo, especialmente en escenas complejas o con movimiento rápido, aunque no se cuantifica en la información disponible.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias (MLX, Basalt) antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria ni reportes de terceros sobre su calidad.
- No se publican tiempos de generación ni requisitos exactos de memoria por preset, solo el rango objetivo de 16-24 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/Kandinsky-5.0-T2V-Lite-PV-MACaQ-4bit-MXFP4-MLX
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-T2V-Lite-distilled16steps-5s-Diffusers
- Repositorio Basalt en GitHub: https://github.com/goodmai/basalt
- Demo "Run with Basalt" (es): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FKandinsky-5.0-T2V-Lite-PV-MACaQ-4bit-MXFP4-MLX&role=video&lang=en
- Demo "Run with Basalt" (ru): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FKandinsky-5.0-T2V-Lite-PV-MACaQ-4bit-MXFP4-MLX&role=video&lang=ru
