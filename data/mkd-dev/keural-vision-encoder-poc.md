# mkd-dev/keural-vision-encoder-poc

## Resumen

Keural Vision Encoder (PoC V0.1) es un codificador visual de 24,7 millones de parámetros desarrollado por MKD Co., Ltd. (usuario `mkd-dev`) y entrenado íntegramente desde cero, sin utilizar pesos preentrenados de CLIP ni de ningún otro backbone. Su función es convertir imágenes en secuencias de tokens estructurados que puedan inyectarse en un modelo de lenguaje, actuando como la pieza visual de un pipeline VLM. Se distribuye bajo licencia MIT y con la librería `transformers`.

El modelo forma parte de un proyecto mayor, el Keural VLM, en el que este codificador se conecta mediante un proyector `LevelAwareProjector` (384 → 2048 → 4096) a Mistral-7B-Instruct-v0.3 con QLoRA de 4 bits. La propuesta diferencial es doble: un presupuesto de tokens adaptable en tiempo de ejecución (Adaptive Token Budget, ATB) y una tokenización jerárquica de conceptos (Hierarchical Concept Tokenization, HCT) que etiqueta cada token como global, de región o de detalle.

Es relevante ahora porque explora una vía alternativa a los codificadores visuales grandes tipo CLIP (307M de parámetros en LLaVA), con un modelo 12,4 veces menor, y porque expone un contrato de salida rico (metadatos espaciales, puntuaciones de saliencia y niveles semánticos) útil para investigación en eficiencia de VLMs. No obstante, se trata de una prueba de concepto con rendimiento muy alejado de los sistemas de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Stem + ATB Tokenizer + Spatial Transformer de 12 capas |
| Parametros totales | 24.666.373 (24,7M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (token budget por imagen: 256 por defecto, ajustable en tiempo de ejecución) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina tres componentes: un CNN Stem que extrae características de la imagen de entrada (256×256 píxeles normalizados), un tokenizador ATB que asigna un número variable de tokens a regiones según su densidad de información (un muro vacío recibe menos tokens que un documento denso) y un Spatial Transformer de 12 capas con dimensión de embedding de 384. El reparto por defecto de tokens es 5% globales, 25% de región y 70% de detalle. La salida incluye tokens, máscara de atención, identificadores de nivel, metadatos espaciales por token (cx, cy, w, h), puntuaciones de saliencia, un vector agrupado y el presupuesto de tokens efectivamente usado.

El entrenamiento se realizó desde cero durante aproximadamente 75.000 pasos sobre CC3M + CC12M (unos 6,9 millones de pares imagen-texto), con un objetivo contrastivo de estilo SigLIP, en una única RTX 5090 de 32 GB de VRAM. Posteriormente el codificador se congela y se integra en el VLM completo mediante un proyector y un ajuste SFT con LLaVA-Instruct-150K durante 30.000 pasos, seguido de una fase de alineación DPO con RLHF-V de 3.000 pasos. La innovación técnica destacable es el presupuesto de tokens adaptable en inferencia, que permite intercambiar detalle visual por latencia sin reentrenar.

## Capacidades

- Extracción de características visuales: genera representaciones de imagen en forma de tokens de 384 dimensiones.
- Presupuesto de tokens adaptable en tiempo de ejecución (`token_budget=64`, `256` o `1024`), lo que permite ajustar fidelidad y coste.
- Tokenización jerárquica con etiquetas semánticas por token (global, región, detalle).
- Metadatos espaciales por token (centro, ancho y alto normalizados), lo que habilita tareas de localización.
- Puntuaciones de saliencia por token que indican la confianza del asignador.
- Vector agrupado (`pooled`) de 384 dimensiones como resumen de imagen, útil para recuperación o clasificación.
- Integración con LLMs: el codificador alimenta un proyector hacia Mistral-7B en el VLM completo.
- No soporta tool calling, function calling ni razonamiento multi-paso por sí mismo: es un componente visual, no un modelo generativo.
- Capacidades multilingües: no disponibles; el modelo está etiquetado solo para inglés.

## Casos de uso

- Investigación en eficiencia de VLMs: sirve como banco de pruebas para estudiar cómo afecta el tamaño del codificador visual y el número de tokens al rendimiento final del VLM, con un codificador 12,4 veces menor que el de LLaVA.
- Recuperación de imágenes por similitud: el vector `pooled` de 384 dimensiones permite indexar imágenes y hacer búsqueda semántica frente a texto, aunque con calidad limitada por el entrenamiento contrastivo.
- Análisis de documentos con presupuesto ajustable: al subir `token_budget` a 1024, el modelo concentra tokens en zonas densas de texto, lo que puede aprovecharse en experimentos de comprensión de documentos.
- Localización de objetos y regiones: los metadatos espaciales por token y las puntuaciones de saliencia permiten experimentar con tareas de detección o grounding sin un detector dedicado.
- Prototipado de pipelines VLM: al integrarse con Mistral-7B mediante el proyector documentado, es útil para montar prototipos de asistentes visuales en entornos de investigación.
- Estudio de atención visual: las visualizaciones de saliencia y colocación de tokens permiten analizar qué regiones prioriza el modelo, útil en trabajos de interpretabilidad.
- Educación y demostraciones: por su tamaño reducido (0,9 GB de repositorio) y licencia MIT, es adecuado para docencia y experimentación en máquinas modestas.

## Benchmarks y rendimiento

Resultados del VLM completo (codificador congelado + proyector + Mistral-7B) en el checkpoint SFT-30K, antes de DPO, sobre 1.000 muestras cuando aplica:

| Benchmark | Keural SFT-30K | LLaVA 1.5 (encoder 307M) | LLaVA 1.6 (encoder 307M) |
|---|---|---|---|
| VQAv2 (accuracy) | 12,9% | 78,5% | 81,8% |
| POPE (F1) | 66,9% | 85,9% | 86,5% |
| MME (total) | 704,3 | 1510,7 | 1519,3 |
| TextVQA (accuracy) | 0,8% | 58,2% | 64,9% |
| ScienceQA imagen (accuracy) | 39,7% | 66,8% | 70,6% |

Tras aplicar DPO (RLHF-V, 3.000 pasos), el autor reporta mejoras: VQAv2 a 43,6%, ScienceQA a 53,7% y MME a 838,8. No se han publicado benchmarks aislados del codificador como extractor de características.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 24,7M de parámetros en bfloat16 los pesos ocupan aproximadamente 50 MB, por lo que cabe en cualquier GPU consumer con varios GB libres.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se realizó en una RTX 5090 de 32 GB, pero la inferencia funciona en tarjetas mucho menores (RTX 3060, RTX 4060, etc.).
- Cabe en GPU consumer: sí, ampliamente; también podría ejecutarse en CPU para pruebas puntuales.
- Opciones de despliegue: al usar una arquitectura personalizada (`architecture.encoder.KeuralVisionEncoder`, `keural_config.KeuralConfig`), requiere el código del repositorio y no es compatible directamente con vLLM, llama.cpp, Ollama o TGI; el pipeline declarado es `image-feature-extraction` en `transformers`.
- Latencia y throughput: no disponibles numéricamente; el autor publica una curva de latencia frente a presupuesto de tokens, pero sin cifras concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tokens por imagen | Rendimiento VQA (VQAv2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Keural Vision Encoder (PoC) | 24,7M | 256 por defecto, ajustable | 12,9% (SFT) / 43,6% (SFT+DPO) | MIT | Hugging Face |
| CLIP ViT-L/14 (usado en LLaVA 1.5) | 307M | 576 tokens fijos | 78,5% (en LLaVA 1.5) | MIT (pesos OpenAI) | Hugging Face |
| SigLIP (usado en LLaVA 1.6) | ~400M | variable según resolución | 81,8% (en LLaVA 1.6) | Apache 2.0 | Hugging Face |

La comparación debe leerse con cautela: los porcentajes de VQAv2 corresponden al VLM completo y no al codificador aislado. La ventaja de Keural es su tamaño (12,4 veces menor que el codificador de LLaVA) y su flexibilidad de tokens; la desventaja es una calidad muy inferior en todas las tareas evaluadas.

## Limitaciones y advertencias

- Rendimiento muy bajo en tareas de comprensión visual: TextVQA del 0,8% y VQAv2 del 12,9% en SFT-30K indican que el modelo no es apto para producción.
- Es una prueba de concepto (V0.1) con solo 15 descargas y sin validación externa; no hay garantías de robustez.
- Riesgo elevado de alucinación si se usa dentro de un VLM, dado el escaso rendimiento en tareas de lectura de texto en imagen.
- Idiomas: solo inglés; no se ha validado su comportamiento con texto en otros idiomas.
- Arquitectura personalizada: no es plug-and-play con las herramientas estándar de despliegue; requiere cargar código del repositorio.
- Sesgos: el entrenamiento con CC3M y CC12M arrastra los sesgos conocidos de esos datasets (representación geográfica y demográfica desigual), aunque el autor no documenta un análisis específico.
- Licencia MIT: permite uso comercial, pero al ser un componente de un PoC sin garantías de calidad, su uso en producción no está recomendado.
- El contrato de salida y la API (`token_budget`, `level_ids`) pueden cambiar en futuras versiones al tratarse de una V0.1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkd-dev/keural-vision-encoder-poc
- VLM completo (Keural VLM PoC): https://huggingface.co/mkd-hika/keural-vlm-poc
