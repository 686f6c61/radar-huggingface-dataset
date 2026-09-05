# dernet/acestep-captioner-GGUF

## Resumen

ACE-Step Captioner GGUF es una conversión a formato GGUF del modelo ACE-Step Captioner, desarrollada por dernet. El modelo original, publicado por ACE-Step, es un sistema de audio-text-to-text que escucha un clip de audio y genera una descripción detallada en lenguaje natural. Esta versión cuantizada permite ejecutar el modelo de forma local y rápida mediante llama.cpp, sin necesidad de enviar el audio a servicios alojados.

El modelo se basa en Qwen2.5-Omni-7B, un transformer multimodal de aproximadamente 7.6 mil millones de parámetros (7.615.616.512 según los safetensors originales). La conversión GGUF incluye dos archivos: el modelo principal en cuantización Q4_K_M (4.7 GB) y un proyector de audio en Q8_0 (1.5 GB) que procesa la señal sonora. La longitud de contexto no se especifica en la información disponible.

La relevancia de este modelo radica en que permite realizar captioning de audio y música de manera local, con un consumo de VRAM que va desde unos 3.5 GiB en tarjetas de 6 GB hasta unos 6.9 GiB en tarjetas de 16 GB, manteniendo una fidelidad alta respecto al modelo original. Es especialmente útil para etiquetar bibliotecas musicales, preparar datos de entrenamiento o inspeccionar clips sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen2.5-Omni-7B |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal), Q8_0 (proyector de audio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantización de los checkpoints de ACE-Step Captioner, que a su vez se apoyan en la arquitectura de Qwen2.5-Omni-7B. Se trata de un transformer multimodal que combina un modelo de lenguaje con un proyector de audio (mmproj) que codifica la señal sonora antes de pasarla al modelo principal. En esta versión GGUF, el proyector se mantiene en 8 bits (Q8_0) para preservar la calidad de la entrada de audio, mientras que el modelo de lenguaje se compacta a 4 bits (Q4_K_M) para reducir el espacio en disco y el uso de VRAM.

No se han publicado detalles sobre el proceso de entrenamiento del modelo original en la información disponible: no se indica el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La innovación técnica destacable de esta conversión es el uso de un build específico de llama.cpp (b10796) con un overlay denominado `mtmd`, que corrige la forma en que se procesa la entrada de audio. Según la model card, el llama.cpp estándar puede introducir segmentos de silencio espurios en clips cuya duración sea múltiplo de 30 segundos, lo que generaría descripciones incorrectas. El overlay suministrado eleva la concordancia del codificador de audio con el modelo original de 0.32 a 0.997.

## Capacidades

- Generación de descripciones textuales detalladas a partir de audio, especialmente música.
- Captioning local de clips de audio sin necesidad de servicios externos.
- Preparación de datos de entrenamiento para otros modelos de audio.
- Inspección rápida de contenido de audio para verificar su contenido.
- Inferencia determinista mediante parámetros de generación fijos (temperature 0, top_k 1).
- Soporte de ejecución en GPU y CPU a través de llama.cpp, con control del número de capas en GPU (`-ngl`).
- No se han documentado capacidades de tool calling, agentes, visión ni soporte multilingüe explícito en la información disponible.

## Casos de uso

- Etiquetado automático de bibliotecas musicales: el modelo puede generar descripciones de cada pista para crear metadatos en un catálogo, lo que facilita la búsqueda y organización de colecciones extensas. Su ejecución local permite procesar miles de clips sin coste por API.
- Preparación de datos de entrenamiento para modelos de audio: las descripciones generadas pueden usarse como texto de referencia en pipelines de entrenamiento de modelos de texto-audio o audio-audio. La fidelidad verificada frente al modelo original aporta confianza en la señal de entrenamiento.
- Inspección de clips en entornos con requisitos de privacidad: al funcionar completamente en local, el modelo permite analizar audio sensible (por ejemplo, grabaciones de reuniones o material inédito) sin enviarlo a servicios externos.
- Accesibilidad para personas con discapacidad visual: el modelo puede describir el contenido de pistas de audio o vídeos en tiempo real, ayudando a usuarios que necesitan saber qué ocurre en un clip sin reproducirlo.
- Automatización de flujos de trabajo en producción musical: los productores pueden usar el modelo para obtener una primera descripción de un tema o una demo, lo que agiliza la clasificación de maquetas y la documentación de sesiones.
- Indexación y búsqueda en archivos de audio históricos: el captioning permite generar texto asociado a podcasts, entrevistas o grabaciones antiguas, habilitando la búsqueda por contenido en grandes volúmenes de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una evaluación de fidelidad comparando el par GGUF con el modelo original ACE-Step Captioner sobre 23 extractos musicales de un minuto. Los resultados indican que el par Q4_K_M + Q8_0 pasó todas las compuertas de comparación predefinidas, usando el 27% de la diferencia permitida respecto al modelo de referencia en su punto peor. En una lectura ciega de seis pares de descripciones, cuatro fueron valoradas como iguales y dos prefirieron la versión GGUF; el original nunca fue preferido.

También se proporcionan datos de rendimiento en diferentes configuraciones de GPU, medidos en una máquina Windows con una RTX 4070 Ti SUPER 16 GB:

| Configuracion | VRAM usada | Tiempo por minuto de audio | Tiempo para 300 clips |
|---|---:|---:|---:|
| 12 GB+ (todas las capas en GPU) | no especificado | 1.5 s | 7 min |
| 8 GB (`-ngl 20`) | 5.6 GiB | 5.4 s | 27 min |
| 6 GB (`-ngl 4`) | 3.5 GiB | 12 s | 60 min |

Estos datos son orientativos y dependen de la GPU, la carga del sistema, los drivers y la duración del audio. No se han medido otros entornos como Vulkan o Metal.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3.5 GiB (con `-ngl 4`) y 6.9 GiB (con todas las capas en GPU, según medición en RTX 4070 Ti SUPER).
- GPU recomendadas: cualquier tarjeta con 6 GB o más de VRAM. La model card indica que se probó con éxito en tarjetas de 6 GB, 8 GB y 12 GB+.
- En tarjetas de 6 GB se recomienda usar `-ngl 4` para mantener solo 3.5 GiB en VRAM; en tarjetas de 8 GB, `-ngl 20` reduce la VRAM a 5.6 GiB.
- Cada configuración necesita aproximadamente 6.6 GiB de RAM del sistema para el servidor, por lo que se recomienda un mínimo de 16 GiB de memoria RAM total.
- El modelo requiere el build específico de llama.cpp `b10796` de Side-Step con el overlay `mtmd`. El llama.cpp estándar puede cargar los archivos, pero procesa incorrectamente la entrada de audio.
- En Windows, es necesario instalar el Microsoft Visual C++ 2015-2022 Redistributable si `mtmd.dll` no se carga.
- Opciones de despliegue: llama.cpp mediante la herramienta de línea de comandos de Side-Step. No se mencionan vLLM, Ollama ni TGI como opciones compatibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Velocidad (1 min) | VRAM | Licencia |
|---|---:|---|---|---:|---:|---|
| ACE-Step Captioner (original) | 7.6B | safetensors | no cuantizado | no disponible | no disponible | MIT |
| ACE-Step Captioner GGUF (este modelo) | 7.6B | GGUF | Q4_K_M + Q8_0 | 1.5 s (12 GB+) | 3.5–6.9 GiB | MIT |

No se han identificado otros modelos comparables de captioning de audio en la información proporcionada. La comparación se limita al modelo original y a su versión cuantizada.

## Limitaciones y advertencias

- El modelo requiere el build específico de llama.cpp `b10796` con el overlay `mtmd`. Con el llama.cpp estándar, los clips cuya duración sea múltiplo de 30 segundos pueden ganar un segmento de silencio adicional, lo que lleva a descripciones sobre silencio inexistente.
- Los dos archivos GGUF (modelo principal y proyector de audio) deben descargarse y usarse juntos; son un par emparejado.
- Las mediciones de rendimiento y fidelidad se realizaron únicamente en un entorno CUDA/Windows. No se han probado Vulkan, Metal, otros sistemas operativos ni otros GPUs.
- La evaluación de fidelidad es una comprobación de utilidad como señal de entrenamiento, no una medida de precisión absoluta de las descripciones.
- Existe riesgo de alucinación, como en cualquier modelo generativo de lenguaje.
- No se han documentado sesgos específicos, pero al estar entrenado principalmente para música, puede generar descripciones menos precisas para otros tipos de audio (voz, efectos de sonido, etc.).
- La licencia MIT permite uso comercial, pero se debe verificar la licencia del modelo base Qwen2.5-Omni-7B si se redistribuyen los pesos originales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dernet/acestep-captioner-GGUF
- Modelo base ACE-Step Captioner: https://huggingface.co/ACE-Step/acestep-captioner
- Modelo Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio del parche de llama.cpp: https://github.com/koda-dernet/acestep-captioner
- Documento sobre el método de verificación: https://huggingface.co/dernet/acestep-captioner-GGUF/blob/main/how-we-checked.md
- Microsoft Visual C++ Redistributable: https://learn.microsoft.com/cpp/windows/latest-supported-vc-redist
