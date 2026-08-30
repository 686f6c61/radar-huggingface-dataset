# nc-ai-consortium/VAETKI-VL-7B-A1B

## Resumen

VAETKI-VL-7B-A1B es un modelo de lenguaje y visión (VLM) desarrollado por el consorcio NC-AI, en colaboración con ETRI y la Universidad de Corea. Está diseñado específicamente para la eficiencia de inferencia, adoptando una arquitectura de Mezcla de Expertos (MoE) que activa únicamente 1.200 millones de parámetros de los 7.580 millones totales, lo que permite un equilibrio entre capacidad y coste computacional. El modelo combina un LLM base (VAETKI-7B-A1B) con un codificador visual RICE-ViT y un proyector FFN, y está entrenado en tres etapas: alineación del proyector, SFT básico y SFT avanzado.

El modelo soporta entrada de imagen y texto, con una ventana de contexto de 16.000 tokens y un vocabulario de 126.000 entradas. Está orientado a los idiomas coreano e inglés, y se distribuye bajo licencia MIT, lo que facilita su uso comercial y de investigación. Su relevancia actual radica en ser un VLM MoE de código abierto con un coste de inferencia reducido, pensado para despliegues donde la latencia y el consumo de recursos son críticos. Aunque los resultados de evaluación aún no se han publicado, el modelo ya cuenta con conversiones GGUF para su uso con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM MoE (VAETKI-7B-A1B) + RICE-ViT + FFN (proyector) |
| Parametros totales | 7.576.287.264 (7,58B) |
| Parametros activos | 1,2B (LLM) + 0,33B (ViT) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | GGUF (4,5 GB, disponible en repos externos) |
| Idiomas soportados | Coreano, ingles |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de lenguaje autorregresivo con Mezcla de Expertos (MoE). El LLM base tiene 24 capas, 12 cabezas de atención, 64 expertos y 5 expertos activados por token, lo que reduce el coste computacional por token a aproximadamente 1/6 del total de parámetros. El codificador visual es un RICE-ViT (large, parche 14, resolución 560) con 0,33B parámetros, y un proyector FFN conecta las representaciones visuales con el espacio de texto. El entrenamiento se realizó en tres etapas: alineación del proyector, SFT básico y SFT avanzado, con un learning rate que decrece de 5e-5 a 3e-6, y el contexto se expandió de 4.096 a 16.384 tokens durante el proceso.

Los datos de entrenamiento provienen de conjuntos multimodales de instrucción de código abierto, incluyendo FineVision, LLaVA-OneVision-Data, M4-Instruct-Data, LLaVA-OneVision-Mid-Data y LLaVA-Pretrain, con preprocesamiento y reformateo personalizados. El entrenamiento se ejecutó en 64 GPUs NVIDIA H100 80GB con interconexión InfiniBand de 400 Gb/s, utilizando una versión modificada de Megatron-Core v0.14. No se menciona explícitamente el uso de RLHF o DPO; el proceso se centra en SFT supervisado.

## Capacidades

- Generación de texto e imagen a texto: responde a instrucciones que combinan imágenes y texto, produciendo descripciones, respuestas a preguntas visuales y diálogo multimodal.
- Razonamiento visual: al estar entrenado con datasets como LLaVA-OneVision, puede realizar tareas de comprensión de escenas, OCR básico y razonamiento sobre contenido visual.
- Conversación multi-turno: soporta diálogos con contexto largo (hasta 16k tokens), adecuado para asistentes conversacionales.
- Soporte de tool calling: no se menciona explícitamente en la documentación; no disponible.
- Capacidades multilingües: limitadas a coreano e inglés, con énfasis en coreano.
- Eficiencia de inferencia: gracias a la arquitectura MoE con 1,2B parámetros activos, ofrece menor latencia y menor consumo de memoria que un modelo denso de tamaño equivalente.
- Formato GGUF: disponible para ejecución en llama.cpp y entornos de CPU/GPU de bajo consumo.

## Casos de uso

- Asistentes visuales para atención al cliente: el modelo puede procesar capturas de pantalla o fotos de productos y responder preguntas en coreano o inglés, manteniendo el contexto de la conversación gracias a su ventana de 16k tokens.
- Análisis de documentos con imágenes: extracción de información de facturas, formularios o diagramas, combinando OCR visual con razonamiento textual.
- Moderación de contenido visual: clasificación y descripción de imágenes en plataformas sociales, con capacidad de adaptar el tono según la instrucción.
- Generación de descripciones accesibles: creación de texto alternativo (alt text) para imágenes en sitios web o aplicaciones, en coreano e inglés.
- Educación y tutoría multimodal: explicación de figuras, gráficos o problemas de ciencias a partir de imágenes, con razonamiento paso a paso (aunque con limitaciones en matemáticas complejas).
- Prototipado rápido de chatbots multimodales: gracias a la licencia MIT y al formato GGUF, se puede integrar en entornos de desarrollo con recursos limitados, como portátiles con GPU de gama media.
- Investigación en eficiencia de VLM: como modelo MoE abierto, sirve como referencia para estudiar el equilibrio entre parámetros activos y rendimiento en tareas visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación del modelo card indica "to be updated", por lo que no hay datos verificables de MMLU, HumanEval, GSM8K u otras pruebas estándar. Se recomienda evaluar el modelo en el caso de uso específico antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización GGUF de 4,5 GB, el modelo puede ejecutarse en GPUs con al menos 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060). En precisión completa (safetensors), el tamaño del repositorio es de 50,5 GB, lo que requeriría al menos 60-80 GB de VRAM para cargar los pesos en FP16, apuntando a GPUs como A100 80GB o H100.
- GPU recomendadas: para uso con GGUF, GPUs consumer como RTX 3090, RTX 4090 o incluso RTX 3060 12GB son suficientes. Para FP16, se necesitan GPUs de datacenter (A100, H100) o particionado en múltiples GPUs.
- Compatibilidad con consumer GPU: sí, mediante cuantización GGUF y llama.cpp, el modelo puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp (con archivo mmproj para el proyector visual), Ollama (si se añade a su biblioteca), vLLM (si se adapta a la arquitectura MoE), y Transformers con código personalizado (custom_code).
- Latencia y throughput: no disponibles en la documentación. Dado el diseño MoE con 1,2B parámetros activos, se espera una latencia menor que un modelo denso de 7B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| VAETKI-VL-7B-A1B | 7,58B | 1,2B | 16k | MIT | ko, en |
| LLaVA-OneVision-7B | 7,6B | 7,6B (denso) | 32k | Apache 2.0 | multilingüe |
| Qwen2-VL-7B | 7,6B | 7,6B (denso) | 128k | Apache 2.0 | multilingüe |

La comparativa se basa en características estructurales conocidas; no hay datos de rendimiento publicados para VAETKI-VL-7B-A1B. Frente a modelos densos de tamaño similar, VAETKI ofrece una ventaja en eficiencia de inferencia (1,2B activos frente a 7,6B), pero su soporte de idiomas es limitado (solo coreano e inglés) y su contexto es menor que el de Qwen2-VL. La licencia MIT es más permisiva que Apache 2.0 en algunos aspectos, aunque ambas permiten uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento con datos públicos puede reflejar sesgos sociales o culturales relacionados con género, etnia, nacionalidad o religión, a pesar de los esfuerzos de mitigación.
- Riesgo de alucinación: el modelo puede producir contenido inexacto o inventado, especialmente con prompts ambiguos o tareas que requieren alta precisión factual.
- Limitaciones de razonamiento: tiene dificultades en razonamiento multi-paso complejo, cálculo matemático preciso y corrección estricta en generación de código.
- Idiomas limitados: solo coreano e inglés; no soporta otros idiomas de forma fiable.
- Sin verificación independiente: el modelo no puede verificar la información que genera; se recomienda supervisión humana en aplicaciones críticas.
- Restricciones de uso: no está diseñado para dominios regulados (médico, legal, financiero, militar) donde los errores puedan causar daños.
- Evaluación pendiente: no hay benchmarks publicados, por lo que el rendimiento real en tareas estándar es desconocido.
- Compatibilidad de código: el modelo usa custom_code y modificaciones internas sobre Megatron-Core; puede requerir adaptaciones para funcionar con frameworks estándar.

## Enlaces

- HuggingFace: https://huggingface.co/nc-ai-consortium/VAETKI-VL-7B-A1B
- Repositorio GitHub: https://github.com/wbl-ncai/VAETKI/
- Quickstart de inferencia: https://github.com/wbl-ncai/VAETKI/blob/main/inference_vaetki_vl_7b_a1b.py
- Informe técnico (PDF): https://github.com/wbl-ncai/VAETKI/raw/releases/v1.0.0/VAETKI_Technical_Report.pdf
- NOTICE.md (licencias de terceros): https://github.com/wbl-ncai/VAETKI/blob/main/NOTICE.md
- Página de GGUF (local-ai-zone): https://local-ai-zone.github.io/models/vaetki-vl-7b-a1b.html
- Guía de GGUF (Learning Gallery): https://hapticpaper.github.io/learning_gallery/models/2026-01-09--vaetki-vl-7b-a1b-gguf/
