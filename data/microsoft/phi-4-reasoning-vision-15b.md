# microsoft/Phi-4-reasoning-vision-15B

## Resumen

Phi-4-Reasoning-Vision-15B es un modelo multimodal de razonamiento de pesos abiertos desarrollado por Microsoft, que combina el backbone lingüístico Phi-4-Reasoning con el codificador visual SigLIP-2 mediante una arquitectura de fusión media (mid-fusion). El modelo convierte imágenes en tokens visuales que se proyectan al espacio de embeddings del modelo de lenguaje, permitiendo tareas de comprensión visual y razonamiento en un solo sistema. Con 15.119 millones de parámetros y una ventana de contexto de 16.384 tokens, está diseñado para entornos con restricciones de memoria o cómputo, ofreciendo capacidades de razonamiento de cadena de pensamiento (chain-of-thought) para matemáticas y ciencias, así como percepción directa para tareas como OCR, anotación de GUI y descripción de imágenes.

El modelo se entrena mediante supervisión fina (SFT) sobre una mezcla curada de datos de razonamiento y no razonamiento, con un coste de entrenamiento moderado: 240 GPU NVIDIA B200 durante 4 días. Su licencia MIT permite uso comercial sin restricciones, y su tamaño compacto lo hace accesible para despliegue en hardware de gama media. La relevancia actual radica en que demuestra que es posible obtener un rendimiento competitivo en tareas multimodales de razonamiento con un modelo relativamente pequeño y eficiente, frente a alternativas de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mid-fusion: SigLIP-2 (vision encoder) + Phi-4-Reasoning (backbone) |
| Parametros totales | 15.119.518.144 (15B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | No disponible (no se especifican en la documentacion oficial) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Phi-4-Reasoning-Vision-15B emplea una arquitectura de fusión media en la que el codificador visual SigLIP-2 convierte las imágenes en tokens visuales, que posteriormente se proyectan al espacio de embeddings del modelo de lenguaje Phi-4-Reasoning. El codificador visual opera con resolución dinámica, generando hasta 3.600 tokens visuales por imagen, lo que permite un análisis de alta fidelidad para documentos y GUI. Se aplica atención bidireccional dentro de cada imagen (intra-imagen) para mejorar el razonamiento espacial, evitando los riesgos de sobreajuste que presentan esquemas bidireccionales más amplios.

El entrenamiento se realizó mediante supervisión fina (SFT) sobre una mezcla de datos de razonamiento y no razonamiento, cuidadosamente filtrados y mejorados a partir de datasets de visión-lenguaje de código abierto, complementados con datos internos de Microsoft. El modelo opera como un sistema único que puede invocar razonamiento extendido de cadena de pensamiento (bloques `thinking... response`) para tareas complejas como matemáticas o ciencias, o usar inferencia directa (etiquetada con `<nothink>`) para tareas de percepción como captioning, detección de objetos o grounding. El coste de entrenamiento fue de 240 GPU NVIDIA B200 durante 4 días, con fechas de entrenamiento del 3 de febrero de 2025 al 21 de febrero de 2026.

## Capacidades

- Generación de texto y razonamiento multimodal: responde preguntas sobre imágenes, describe contenido visual y razona sobre secuencias de imágenes.
- Razonamiento matemático y científico: utiliza cadena de pensamiento para resolver problemas que requieren múltiples pasos lógicos.
- OCR y lectura de documentos: extrae texto de imágenes, recibos, capturas de pantalla y documentos escaneados con alta precisión.
- Grounding de GUI y computer use: localiza elementos de interfaz en capturas de pantalla y puede guiar acciones automatizadas sobre ellas.
- Análisis de gráficos y tablas: interpreta datos visuales en formato de gráficos (ChartQA) y diagramas (AI2D).
- Modo de razonamiento selectivo: puede alternar entre razonamiento profundo (THINK) y respuesta directa (nothink) según la tarea.
- Comprensión de imágenes de alta resolución: gracias a la resolución dinámica con hasta 3.600 tokens visuales.

## Casos de uso

- Automatización de interfaces gráficas (computer use): el modelo puede analizar capturas de pantalla, identificar botones, campos de texto y otros elementos, y generar instrucciones para que un agente automatizado realice acciones. Su precisión en ScreenSpot-V2 (88,2%) lo hace adecuado para testing de software y asistentes de navegación.
- Extracción de datos de documentos y recibos: con un 76% en OCRBench, puede digitalizar facturas, albaranes y formularios, extrayendo campos clave como importes, fechas o códigos. Esto es útil en contabilidad, logística y gestión documental.
- Asistente educativo para ciencias y matemáticas: el modo THINK permite resolver problemas de física, química o cálculo presentados en formato de imagen (enunciados, diagramas, gráficas). Su rendimiento en MathVista (75,2%) lo posiciona como herramienta de apoyo al estudio.
- Análisis de gráficos financieros y de negocio: interpreta gráficos de líneas, barras o tartas (ChartQA 83,3%) para generar resúmenes ejecutivos o detectar tendencias, integrable en paneles de BI.
- Accesibilidad y descripción de imágenes: genera descripciones detalladas de imágenes para personas con discapacidad visual, o para sistemas de moderación de contenido que necesitan entender el contexto visual.
- Atención al cliente con soporte visual: el modelo puede recibir capturas de pantalla del usuario (errores, configuraciones) y responder con instrucciones precisas, reduciendo la necesidad de escalado a agentes humanos.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en la model card oficial. No se han verificado de forma independiente.

| Tarea | Dataset | Metrica | Resultado |
|---|---|---|---|
| Visual question answering | AI2D | Accuracy | 84,8% |
| Visual question answering | ChartQA | Accuracy | 83,3% |
| Visual question answering | MathVista (MINI) | Accuracy | 75,2% |
| Visual question answering | MMMU | Accuracy | 54,3% |
| Visual question answering | OCRBench | Accuracy | 76,0% |
| Visual question answering | ScreenSpot-V2 | Accuracy | 88,2% |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP16, el modelo requiere aproximadamente 30 GB de VRAM (15B parametros × 2 bytes). Con cuantizacion de 8 bits, unos 15 GB; con 4 bits, unos 8 GB. Estas cifras son estimaciones teoricas, no confirmadas por Microsoft.
- GPU recomendadas: para FP16 se necesitan GPUs de datacenter como A100 (40/80 GB) o H100. Con cuantizacion de 4 bits, es viable en GPUs consumer de gama alta como RTX 4090 (24 GB) o incluso RTX 3090 (24 GB). Para 8 bits, una RTX 4080 (16 GB) podria ser suficiente.
- Opciones de despliegue: al ser un modelo estandar de tipo transformer con pesos en safetensors, es compatible con frameworks como vLLM, llama.cpp, Ollama y TGI, aunque no se mencionan explicitamente en la documentacion oficial.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Existen alternativas multimodales de tamano similar como Qwen2-VL-7B, Llama-3.2-11B-Vision o Phi-3.5-vision, pero no se han encontrado resultados de benchmarks comparables en las fuentes consultadas. Se recomienda consultar el technical report del modelo para una comparacion detallada con otros sistemas.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles. No esta entrenado para otros idiomas, lo que limita su uso en entornos multilingues.
- Longitud de contexto: 16.384 tokens puede ser insuficiente para documentos muy extensos o conversaciones de multiples turnos con imagenes de alta resolucion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en razonamiento complejo o cuando la imagen no es clara.
- Sesgos potenciales: no se han publicado evaluaciones de sesgos especificas. El entrenamiento con datos filtrados de codigo abierto puede heredar sesgos presentes en esos datasets.
- Limitaciones de percepcion: aunque el modelo destaca en OCR y grounding, su rendimiento en MMMU (54,3%) sugiere limitaciones en razonamiento multimodal de nivel universitario.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar los terminos de uso de Microsoft Foundry si se despliega en esa plataforma.

## Enlaces

- HuggingFace: https://huggingface.co/microsoft/Phi-4-reasoning-vision-15B
- Blog oficial de Microsoft: https://www.microsoft.com/en-us/research/blog/phi-4-reasoning-vision-and-the-lessons-of-training-a-multimodal-reasoning-model/
- Technical report (PDF): https://www.microsoft.com/en-us/research/wp-content/uploads/2026/03/Phi-4-reasoning-vision-15B-Tech-Report-1.pdf
- Repositorio GitHub: https://github.com/microsoft/phi-4-reasoning-vision-15B
- Microsoft Foundry: https://aka.ms/Phi-4-r-v-foundry
- Microsoft Foundry Labs: https://labs.ai.azure.com/innovations/phi-4-reasoning-vision-15b/
