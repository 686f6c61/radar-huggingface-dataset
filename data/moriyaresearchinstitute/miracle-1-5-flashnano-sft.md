# MoriyaResearchInstitute/Miracle-1.5-FlashNano-SFT

## Resumen

Miracle-1.5-FlashNano-SFT es la versión afinada con supervisión (SFT) del modelo base Miracle-1.5-FlashNano, publicado por MoriyaResearchInstitute. Se trata de un modelo de lenguaje denso y de tamano muy reducido (la model card declara 108M de parametros; el recuento real de los tensores en safetensors es de 123.305.600), disenado para inferencia en entornos con recursos muy limitados: CPU, dispositivos de borde y GPUs de gama baja.

La arquitectura es un transformer decoder-only de 16 capas con atención GQA (12 cabezas de consulta, 4 de clave/valor, dimension de cabeza 64), hidden size 768 y una MLP SwiGLU de 1.536 dimensiones intermedias. El detalle mas singular es su esquema de atención híbrido: solo las capas 8 y 16 usan atención causal global, mientras que las 14 restantes emplean una ventana deslizante causal de 8.192 tokens. Los embeddings de entrada y salida están atados (weight tying), lo que reduce el numero de parametros.

Su relevancia es acotada y experimental: por tamano y por licencia (GPL-3.0), no compite con los modelos pequenos comerciales habituales, sino que sirve como banco de pruebas para arquitecturas de atención híbrida, para experimentos académicos de bajo coste y para despliegues de inferencia en hardware marginal. No hay resultados de benchmarks publicados, y el modelo cuenta con un like y cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con GQA y atención híbrida (global + ventana deslizante causal) |
| Parametros totales | 123.305.600 según safetensors; la model card del modelo base declara 108M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana deslizante causal en 14 capas; atención global en las capas 8 y 16) |
| Tipos de cuantizacion | no disponible (no se publican artefactos cuantizados; el repo solo contiene pesos safetensors) |
| Idiomas soportados | ingles (`en`) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (tamano del repo: 0,5 GB) |

Detalles arquitectonicos declarados: 16 capas, hidden size 768, 12 cabezas de consulta, 4 cabezas de clave/valor, dimension de cabeza 64, SwiGLU de 1.536 dimensiones, embeddings de entrada y salida atados. El tag `miracle_flashnano_tpu` sugiere que la implementación requiere código propio del autor (`trust_remote_code`).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas. La atención usa GQA con 12 cabezas de consulta y 4 de clave/valor (ratio 3:1), con dimension de cabeza 64, lo que da una dimension de proyección de 768 tanto para consultas como para claves/valores. La MLP es SwiGLU con 1.536 dimensiones ocultas. La innovación principal es el patrón de atención híbrido: las capas 8 y 16 aplican atención causal global sobre toda la secuencia, mientras que las otras 14 aplican una ventana deslizante causal de 8.192 tokens. Con este diseno, el coste de atención crece de forma lineal con la longitud en la mayoria de capas, manteniendo un camino de información global cada cierto numero de capas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni los detalles del pipeline de SFT (si se usó RLHF, DPO, datos sintéticos o destilación). La model card únicamente describe la arquitectura; no documenta datos, hiperparametros ni recetas de alineamiento. Tampoco se detalla el proposito del sufijo "TPU" del tag de arquitectura, aunque cabe inferir un entrenamiento o una implementación orientada a TPU.

## Capacidades

- Generación de texto autoregresiva en ingles, orientada a respuestas cortas y continuaciones de documento.
- Modelo base de escala muy reducida: adecuado para completar frases, resumir pasajes breves y responder preguntas simples sobre contexto explícito.
- No hay evidencia publicada de soporte de tool calling ni de function calling.
- No hay evidencia publicada de modo "thinking", razonamiento multi-paso, agentes o decodificación especulativa.
- Sin capacidades multimodales: no procesa visión ni audio.
- Capacidad multilingue practicamente nula: solo se declara ingles.
- Acepta contexto de hasta 8.192 tokens, aunque en un modelo de 123M de parametros la calidad sostenida en ventanas largas es, por construccion, limitada.
- Al ser un checkpoint SFT, se espera que siga instrucciones basicas, si bien no se documenta el formato de prompt ni las plantillas de chat.

## Casos de uso

- Prototipado de pipelines de NLP en local: permite validar extremo a extremo un flujo de generación (tokenizador, prompt, post-proceso) sin coste de GPU, sustituyéndolo despues por un modelo mayor.
- Inferencia en dispositivos de borde: con ~0,25 GB de pesos en FP16 cabe en una Raspberry Pi 5 o en un movil de gama media, útil para autocompletado offline o respuestas predefinidas en ingles.
- Clasificación y enrutado de intenciones: por su tamano, se puede ajustar como cabecera de clasificación para decidir a que modelo grande derivar cada consulta en un sistema en cascada.
- Extracción de entidades y campos estructurados en textos cortos: con prompts few-shot y salida restringida, encaja en tareas de parsing de formularios o correos en ingles.
- Generación de datos sinteticos a gran escala: al ser barato de ejecutar, sirve para producir corpus de texto en ingles destinados a preentrenamiento o a data augmentation, siempre filtrando la calidad.
- Investigación sobre atención híbrida: su combinación de ventana deslizante de 8.192 tokens con dos capas de atención global lo convierte en un sujeto de ablation economico para estudiar el equilibrio entre coste y recuperación de información a larga distancia.
- Educación y docencia: lectura y modificación del código de la arquitectura, análisis de pesos y ejercicios de fine-tuning con presupuesto minimo.
- Fine-tuning especifico de dominio en una sola GPU consumer: al necesitar menos de 1 GB en FP16, el ajuste completo es viable en una RTX 3060 con gradient checkpointing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos: ~0,49 GB en FP32, ~0,25 GB en FP16/BF16, ~0,12 GB en INT8 y ~0,06 GB en INT4 (calculado sobre 123,3M de parametros).
- Cache KV: 4 cabezas KV × 64 dimensiones × 2 (clave y valor) × 16 capas = 8.192 valores por token; a 2 bytes por valor son ~16 KB por token, es decir, ~128 MB con la ventana completa de 8.192 tokens en FP16.
- VRAM estimada para inferencia: por debajo de 1 GB en FP16 incluyendo cache y overhead del runtime; ~2 GB es un margen comodo para frameworks con allocator agresivo.
- GPU recomendadas: cualquier GPU con 2 GB o mas. Funciona en RTX 3050/4060, GTX 1650, T4, L4; no necesita A100 ni H100, y ejecutarlo en ellas desaprovecha el hardware.
- Cabe holgadamente en GPU consumer e incluso en iGPU y en CPU. En CPU moderna (x86 con AVX2), un modelo de este tamano suele generar del orden de decenas de tokens por segundo, aunque no hay cifras oficiales publicadas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via mas directa, dado que la arquitectura es propia (tag `miracle_flashnano_tpu`). vLLM y TGI requeririan soporte explicito para la arquitectura, no confirmado. llama.cpp/Ollama requeririan convertir los pesos a GGUF, conversión no publicada oficialmente.
- Throughput y latencia: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a especificaciones publicas de sus modelos base y deben verificarse en sus respectivas model cards. No hay datos de rendimiento comparables para Miracle-1.5-FlashNano-SFT.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Miracle-1.5-FlashNano-SFT | 123,3M (108M declarados) | 8.192 (ventana deslizante) | GPL-3.0 | HuggingFace, requiere código propio | no disponible |
| SmolLM2-135M (HuggingFace) | 135M | 8.192 | Apache-2.0 | HuggingFace, integrado en transformers/llama.cpp | ampliamente evaluado en benchmarks publicos |
| Qwen2.5-0.5B | ~494M | 32.768 | Apache-2.0 | HuggingFace, ecosistema amplio (GGUF, vLLM) | benchmarks publicados por el autor |
| TinyLlama-1.1B | ~1,1B | 2.048 | Apache-2.0 | HuggingFace, muy extendido | benchmarks publicados por el autor |

La diferencia practica clave frente a estas alternativas no es el rendimiento, sino la licencia: GPL-3.0 impone copyleft, mientras que las alternativas citadas usan Apache-2.0, mucho mas permisiva para integracion en productos propietarios.

## Limitaciones y advertencias

- Riesgo alto de alucinacion: con 123M de parametros no hay capacidad de almacenar conocimiento factual de forma fiable; no debe usarse como fuente de hechos.
- Solo ingles declarado; el rendimiento en castellano u otros idiomas sera previsiblemente deficiente y no evaluado.
- Contexto efectivo limitado en la practica: aunque la ventana es de 8.192 tokens, solo dos capas tienen acceso global, por lo que la recuperación de información distante es debil.
- Licencia GPL-3.0: es copyleft fuerte. Integrar el modelo en un producto propietario o distribuirlo junto con código no GPL puede obligar a liberar el conjunto bajo GPL-3.0. Para uso interno sin distribución el riesgo es menor, pero conviene revisión legal antes de produccion.
- Ausencia de benchmarks: no hay ninguna evidencia cuantitativa de calidad, lo que impide justificar su elección frente a alternativas del mismo tamano con evaluaciones publicas.
- Madurez minima: cero descargas y un like en el momento de la ficha; sin comunidad, sin incidencias resueltas y sin cuantizaciones ni conversiones mantenidas.
- Arquitectura no estandar: requiere `trust_remote_code` y no está garantizada su compatibilidad con vLLM, TGI, llama.cpp u Ollama sin trabajo de adaptación.
- No se documenta el dataset de SFT ni el formato de prompt; sin plantilla de chat conocida, el comportamiento en modo instruct puede ser inconsistente.
- No se documentan sesgos concretos, pero al entrenarse presumiblemente en corpus web en ingles hereda los sesgos habituales de ese tipo de datos, agravados por la baja capacidad del modelo.
- No apta para tareas que requieran razonamiento multi-paso, matemáticas complejas, generación de código en produccion o uso de herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MoriyaResearchInstitute/Miracle-1.5-FlashNano-SFT
- Modelo base: https://huggingface.co/MoriyaResearchInstitute/Miracle-1.5-FlashNano
- Perfil de la organizacion: https://huggingface.co/MoriyaResearchInstitute/models
