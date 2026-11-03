# morpfvr94/minimax-h3-worker-weights

## Resumen

MiniMax H3 worker weights es un repositorio espejo publicado por el usuario morpfvr94 que reúne, sin modificaciones, los archivos que carga un worker de referencia-a-vídeo de ComfyUI para el modelo MiniMax H3. No se trata de un modelo entrenado por el autor del repositorio, sino de una copia agregada de pesos del modelo base MiniMaxAI/MiniMax-H3, empaquetada para que un host serverless pueda cachear únicamente los ficheros necesarios. El repositorio tiene un tamaño de 542,7 GB y se distribuye bajo la MiniMax H3 Community License Agreement.

El contenido incluye el modelo de difusión referencia-a-vídeo en dos variantes cuantizadas (int8 y FP8), un codificador de texto basado en Qwen3-VL de 32B en NVFP4 AWQ, dos VAE (vídeo y audio) y varios LoRA turbo de 4 y 8 pasos para acelerar la inferencia, además de un LoRA de realismo de personas. La estructura de carpetas replica la de ComfyUI, por lo que el repositorio puede usarse como base de `extra_model_paths`.

Su relevancia es operativa: facilita el despliegue de MiniMax H3 en entornos de inferencia de vídeo con ComfyUI sin tener que descargar el repositorio completo del modelo original. No aporta innovación técnica propia ni pesos nuevos; su valor es la agregación y el mirroring de artefactos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión referencia-a-vídeo con codificador de texto Qwen3-VL y VAE de vídeo/audio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (convrot), FP8 scaled, NVFP4 AWQ (codificador de texto), FP32 (VAE de audio) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de MiniMax H3 más allá de la composición de artefactos que carga el worker de ComfyUI. Se infiere una pipeline de generación de vídeo condicionada por referencia (reference-to-video) compuesta por un modelo de difusión (`minimax_h3_ref2va`), un codificador de texto Qwen3-VL de 32B cuantizado a NVFP4 AWQ y dos VAE separados para vídeo y audio. Los LoRA turbo de 4 y 8 pasos permiten reducir el número de pasos de muestreo, lo que sugiere un esquema de destilación por pasos para acelerar la inferencia a 768p.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones técnicas propias del modelo base en la información proporcionada. El autor del repositorio declara explícitamente que no ha creado, modificado ni reclama autoría sobre ninguno de los ficheros.

## Capacidades

- Generación de vídeo condicionada por referencia (reference-to-video) mediante el modelo `ref2va`.
- Generación de vídeo con audio, dado que se incluye un VAE de audio específico.
- Aceleración por LoRA turbo de 4 y 8 pasos para muestreo rápido a 768p.
- LoRA de realismo de personas para generación texto-a-vídeo, imagen-a-vídeo y referencia-a-vídeo.
- Codificación de texto e imagen mediante Qwen3-VL de 32B, lo que implica capacidad multimodal de entrada (texto e imagen).
- Integración con ComfyUI mediante estructura de carpetas compatible con `extra_model_paths`.
- Soporte de flujo `fl2va` (first-last-to-video con audio) a través del LoRA turbo correspondiente, aunque el modelo base para ese flujo no está incluido en el repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Despliegue serverless de generación de vídeo: el repositorio permite a un host cachear únicamente los ficheros que carga el worker de ComfyUI, reduciendo el espacio de almacenamiento y el tiempo de arranque en frío frente a descargar el modelo completo.
- Generación de vídeo a partir de una imagen de referencia: el modelo `ref2va` en int8 o FP8 permite producir clips de vídeo condicionados por una referencia visual, adecuado para prototipado rápido en ComfyUI.
- Generación de vídeo con audio sincronizado: la inclusión del VAE de audio permite pipelines que generan vídeo y audio conjuntamente, útil para demos y contenido promocional.
- Aceleración de inferencia en producción: los LoRA turbo de 4 y 8 pasos reducen el coste computacional por clip a 768p, lo que facilita servir peticiones en entornos con GPUs de gama alta pero sin clústeres dedicados.
- Interpolación first-last frame: el LoRA `fl2v_turbo_4step` habilita flujos de vídeo entre primer y último fotograma, útil para animación de transiciones y storytelling visual.
- Realismo de personas: el LoRA `h3-realism-people` permite ajustar la generación hacia figuras humanas realistas en tareas de texto-a-vídeo, imagen-a-vídeo y referencia-a-vídeo, orientado a contenido comercial y prototipado de avatares.
- Base para entornos de investigación en ComfyUI: al replicar la estructura de carpetas, sirve como punto de partida reproducible para experimentos con distintos niveles de cuantización (int8 frente a FP8) y LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de los artefactos, el modelo de difusión ocupa 20,97 GB en int8 y 20,96 GB en FP8, el codificador de texto Qwen3-VL 32B en NVFP4 AWQ ocupa 15,69 GB, el VAE de vídeo 2,81 GB y el VAE de audio 0,61 GB; la suma supera los 40 GB solo en pesos, por lo que se requiere VRAM adicional para activaciones y caché de atención.
- GPU recomendadas: no disponible en la información proporcionada. Por el volumen de pesos, se intuye la necesidad de GPUs profesionales (A100, H100, L40S) o configuraciones multi-GPU; no se confirma en la documentación.
- Cabe en consumer GPU: no disponible. El tamaño agregado de los pesos hace improbable su ejecución en GPUs de consumo de 24 GB sin offloading o cuantizaciones adicionales no documentadas.
- Opciones de despliegue: ComfyUI (estructura de carpetas compatible con `extra_model_paths`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de difusión de vídeo.
- Latencia y throughput estimados: no disponibles. Los LoRA turbo de 4 y 8 pasos sugieren reducciones de pasos de muestreo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| morpfvr94/minimax-h3-worker-weights (este repo) | no disponible | no disponible | minimax-h3-community-license-agreement | HuggingFace, mirror de MiniMaxAI/MiniMax-H3 |
| MiniMaxAI/MiniMax-H3 (modelo base) | no disponible | no disponible | minimax-h3-community-license-agreement | HuggingFace |
| Otros modelos de vídeo referencia-a-vídeo | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas de la misma categoría. La comparación más directa es con el repositorio original MiniMaxAI/MiniMax-H3, del que este es un espejo parcial y sin modificaciones.

## Limitaciones y advertencias

- El repositorio no es un modelo original: es un mirror de artefactos de MiniMaxAI/MiniMax-H3, sin autoría ni soporte por parte del publicador.
- La licencia MiniMax H3 Community License Agreement incluye restricciones territoriales, restricciones de uso en la Sección V y una Acceptable Use Policy en el Anexo A; es responsabilidad del usuario revisarlas antes de cualquier uso comercial.
- Algunos ficheros incluidos (por ejemplo, el LoRA `fl2v_turbo_4step`) corresponden a un flujo (`fl2va`) cuyo modelo base no está almacenado en el repositorio, por lo que no son utilizables de forma aislada.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas del modelo base en la información proporcionada.
- El tamaño del repositorio (542,7 GB) implica costes de almacenamiento y transferencia considerables; el propósito declarado es cachear solo lo necesario, no replicar el conjunto completo.
- No hay garantías de actualización ni de soporte: el autor remite a las fuentes originales para nuevas versiones.
- No se dispone de información sobre el pipeline, los idiomas soportados ni métricas de calidad, lo que limita la evaluación previa a producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/morpfvr94/minimax-h3-worker-weights
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia (referenciada en el repositorio): LICENSE
- Créditos y fuentes (referenciado en el repositorio): CREDITS.md
