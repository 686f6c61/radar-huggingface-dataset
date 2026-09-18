# Avalonec/Qwen3.8-27B-QUASAR-All-NVFP4-Attention-MLP-DFlash2-W8-NInfer

## Resumen

Qwen3.8-27B-QUASAR-All-NVFP4-Attention-MLP-DFlash2-W8-NInfer es un artefacto de despliegue publicado por el usuario Avalonec sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo entrenado desde cero, sino de un contenedor monolítico con extensión `.ninfer` que empaqueta el modelo completo cuantizado en NVFP4 (W4A4) junto con dos canales de decodificación especulativa y la torre de visión multimodal del checkpoint oficial.

Su relevancia está en el grado de compresión: mientras que las recetas NVFP4 habituales mantienen en FP8 o BF16 las capas críticas de auto-atención, este artefacto convierte las 496 capas lineales de texto a NVFP4 puro, apoyándose en el checkpoint QAT de QUASAR (`QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4`) para preservar la fidelidad del razonamiento. El resultado declarado es de 19,8 GiB en disco, frente a los 55,6 GiB del BF16 original, con 90,91 en GPQA-Diamond y 100,0 % en AIME'26.

El artefacto está compilado específicamente para Windows 11 Pro y para instrucciones `sm_120a` (Blackwell), y fue validado en una RTX 5090 de escritorio. Incluye además el módulo MTP oficial (15 tensores BF16) y el compañero de difusión por bloques DFlash2 de 2B parámetros (66 tensores W8/BF16), de modo que no requiere descargar un drafter aparte en tiempo de ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con auto-atención y bloques Gated DeltaNet (GDN), más torre de visión multimodal; capas lineales de texto en NVFP4 (W4A4) |
| Parámetros totales | 27B (según la denominación del modelo base Qwen3.8-27B; no se detalla el recuento exacto en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 W4A4 en las 496 capas lineales de texto; W8G32_F16S en embeddings y LM_Head; DFlash2 en W8/BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache License 2.0 (según la model card; los metadatos de HuggingFace no la indican) |
| Formato de pesos | Contenedor `.ninfer` monolítico nativo de Windows (no safetensors ni GGUF) |
| Capas NVFP4 | 496 / 496 capas lineales de texto |
| Tamano del artefacto | 19,8 GiB en disco (repositorio de 20,0 GB) |
| Componentes empaquetados | Backbone de texto QUASAR-QAT, torre de visión oficial (333 objetos), MTP BF16 (15 tensores), DFlash2 W8 (66 tensores) |
| Plataforma objetivo | Windows 11, MSVC 17.14, CUDA Toolkit 13.1, `sm_120a` (Blackwell) |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El artefacto no introduce un entrenamiento propio: su pipeline es de extracción y conversión. El backbone de texto se extrae y sincroniza directamente del repositorio `QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4`, un checkpoint de Quantization-Aware Training en 4 bits, y las 496 capas lineales se mapean «bit a bit» sobre Tensor Cores. La topología declarada aplica NVFP4 puro tanto a los bloques de auto-atención (QKV y salida) como a los bloques MLP y a los módulos Gated DeltaNet (QKVZ y salida), sin retener ninguna capa crítica en FP8 o BF16. Los extremos de vocabulario (embeddings y LM_Head) se mantienen en W8G32_F16S. La presencia de bloques Gated DeltaNet apunta a una arquitectura híbrida de atención, con componentes de atención lineal o de estado junto a la auto-atención clásica.

La torre de visión se extrae del checkpoint oficial `Qwen/Qwen3.8-27B` e integra un pipeline de 333 objetos que permite procesar imágenes de alta resolución, prompts con varias imágenes y flujos de vídeo mediante el flag `--vision`. Para aceleración, se incrustan dos canales especulativos: el módulo MTP oficial (15 tensores BF16 de alta precisión, con una tabla de búsqueda optimizada de cabeceras de propuesta) y el motor de difusión por bloques enmascarada DFlash2 de Inco AI / z-lab (`z-lab/Qwen3.8-27B-DFlash2`), de 2B parámetros, embebido al final del fichero como un sufijo de 66 tensores W8/BF16. El motor activa dinámicamente la hoja de ejecución según la opción `--spec` elegida. La compilación se realizó en Windows 11 Pro con MSVC 17.14, CUDA Toolkit 13.1 y CMake, usando `vcpkg` para enlazar estáticamente FFmpeg, libcurl y zlib; la capa de compatibilidad en tiempo de ejecución deriva de un port optimizado de `Don-Chad/ninfer-3090`.

## Capacidades

- Generación de texto y razonamiento profundo en modo «thinking» (la evaluación se realizó con `thinking mode ON`, 0-shot y corrección por reglas).
- Razonamiento científico y matemático de alta dificultad: 90,91 en GPQA-Diamond y 100,0 % en AIME'26 con el protocolo declarado.
- Procesamiento de visión: imágenes de alta resolución, prompts multi-imagen y flujos de vídeo habilitados mediante el flag `--vision` (pipeline de 333 objetos extraído del checkpoint oficial).
- Decodificación especulativa con dos vías conmutables: MTP oficial y difusión por bloques DFlash2.
- Ejecución offline autocontenida: el contenedor incluye backbone, torre de visión y drafter, sin descargas adicionales en tiempo de ejecución.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (no se documenta explícitamente, más allá del modo de razonamiento).
- Capacidades multilingües: no disponible (no se enumeran idiomas soportados).
- Capacidades especiales: razonamiento en modo thinking, entrada multimodal (imagen y vídeo) y decodificación especulativa integrada.

## Casos de uso

- Razonamiento científico de alta exigencia en local: el modelo mantiene 90,91 en GPQA-Diamond tras la cuantización completa a 4 bits, de modo que un laboratorio puede ejecutar evaluaciones de dominio físico, químico o biológico en una estación de trabajo con GPU Blackwell sin depender de APIs externas.
- Resolución de problemas matemáticos competitivos: el 100,0 % en AIME'26 con el protocolo de razonamiento declarado lo hace adecuado para generar y verificar cadenas de solución en entornos de entrenamiento o investigación matemática.
- Análisis de documentación técnica con imágenes: gracias a la torre de visión integrada, puede procesar planos, diagramas, capturas de pantalla o páginas escaneadas junto con el texto, sin necesidad de un modelo de visión separado.
- Procesamiento por lotes de vídeo o secuencias de imágenes: el flag `--vision` y el pipeline de 333 objetos permiten extraer descripciones o razonamiento sobre flujos de vídeo en pipelines locales.
- Inferencia local de baja latencia en escritorio: la combinación de MTP y DFlash2 con una tasa de aceptación un 7,7 % relativa superior a la mezcla híbrida heredada reduce el número de pasos de decodificación efectivos, lo que resulta útil en asistentes interactivos sobre una única RTX 5090.
- Comparación de recetas de cuantización: sirve como referencia de evaluación de NVFP4 frente a las builds de Unsloth e Inferact bajo el mismo protocolo (GPQA-Diamond y AIME), útil para decidir una receta de despliegue.
- Despliegue en entornos Windows aislados o sin conectividad: al ser un contenedor autocontenido de 19,8 GiB con FFmpeg, libcurl y zlib enlazados estáticamente, encaja en puestos de trabajo Windows con requisitos de operación offline.

## Benchmarks y rendimiento

Evaluaciones declaradas por el autor bajo el protocolo de razonamiento de Qwen3.8-27B (0-shot, `thinking mode ON`, corrección por reglas, `n=396` agrupado para GPQA-D y `n=90` para AIME):

| Perfil / checkpoint | Tamano en disco | Capas lineales NVFP4 | GPQA-Diamond | AIME'26 |
|---|---|---|---|---|
| QUASAR-QAT Full-NVFP4 (este artefacto) | 19,8 GiB | 496 / 496 | 90,91 | 100,0 % |
| BF16 original oficial | 55,6 GiB | 0 / 496 | 91,41 | 100,0 % |
| Unsloth NVFP4 (baseline cometkim) | 23,4 GB | 168 / 496 | 89,39 | 97,78 % |
| Inferact NVFP4 | 26,4 GB | 304 / 496 | 87,63 | 96,67 % |

Métrica de decodificación especulativa (probada en RTX 5090 de escritorio): tasa de aceptación de DFlash2 de **+7,7 % relativa** (56,0 % de media en 3 ejecuciones frente al 52,0 % de la mezcla híbrida heredada).

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 19,8 GiB en disco; como estimación a partir de ese tamano, la inferencia requiere del orden de 20-24 GB de VRAM contando caché KV y sobrecarga del runtime (cifra estimada, no publicada por el autor).
- GPU recomendadas: el artefacto está optimizado para `sm_120a` (Blackwell) y fue validado por el autor en una RTX 5090 de escritorio. No se documentan otras GPU compatibles.
- Tensor Cores: NVFP4 W4A4 exige soporte de Tensor Cores de 4 bits de la generación Blackwell; no se indica compatibilidad con arquitecturas anteriores (Ada, Ampere, Hopper).
- ¿Cabe en GPU de consumo? Sí, según la validación del autor en una RTX 5090 (32 GB). No hay datos para GPUs de consumo con menos VRAM.
- Sistema operativo: Windows 11 Pro, compilado con MSVC 17.14 y CUDA Toolkit 13.1. No se documenta soporte para Linux.
- Opciones de despliegue: exclusivamente el runtime NInfer con contenedores `.ninfer`, sobre la capa de compatibilidad derivada de `Don-Chad/ninfer-3090`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto (vLLM aparece únicamente como origen del checkpoint QAT padre).
- Latencia y throughput: no disponible. El único dato de rendimiento publicado es la tasa de aceptación del decodificador especulativo (+7,7 % relativa).

## Comparativa con modelos similares

| Modelo | Parámetros | Capas lineales NVFP4 | Tamano en disco | GPQA-Diamond | AIME'26 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este artefacto (QUASAR-QAT Full-NVFP4) | 27B | 496 / 496 | 19,8 GiB | 90,91 | 100,0 % | Apache 2.0 (según model card) | HuggingFace, contenedor `.ninfer` |
| Qwen/Qwen3.8-27B (BF16 original) | 27B | 0 / 496 | 55,6 GiB | 91,41 | 100,0 % | Según Qwen3.8 (no detallada aquí) | HuggingFace |
| Unsloth NVFP4 (baseline cometkim) | 27B | 168 / 496 | 23,4 GB | 89,39 | 97,78 % | no disponible | HuggingFace |
| Inferact NVFP4 | 27B | 304 / 496 | 26,4 GB | 87,63 | 96,67 % | no disponible | HuggingFace |

Los tres perfiles cuantizados comparados derivan del mismo modelo base, por lo que la diferencia relevante es la cobertura de cuantización (496/496 frente a 168/496 y 304/496), el tamano resultante y la degradación medida. No se dispone de datos comparativos frente a modelos de otros fabricantes.

## Limitaciones y advertencias

- Confinamiento de plataforma: el artefacto solo se distribuye como contenedor `.ninfer` para Windows 11 y está optimizado para `sm_120a` (Blackwell). No es utilizable directamente con llama.cpp, Ollama, vLLM o TGI.
- Dependencia de hardware reciente: NVFP4 W4A4 completo sobre las 496 capas lineales requiere Tensor Cores Blackwell; en GPUs anteriores la ejecución puede no ser posible o no estar soportada.
- Trazabilidad: la model card referencia identificadores (Qwen3.8, arXiv:2608.13966, fechas de 2026) que no se han podido verificar con fuentes independientes; la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo.
- Adopción mínima: 0 descargas y 1 like en el momento de la consulta, con licencia no declarada en los metadatos de HuggingFace (solo indicada en el texto de la model card).
- Riesgo de alucinación: no se documenta ningún análisis específico de tasas de alucinación para este artefacto; aplican los riesgos inherentes al modelo base.
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad o equidad para este artefacto ni para el checkpoint QAT del que deriva.
- Idiomas: no se especifica la cobertura lingüística del modelo base ni el impacto de la cuantización NVFP4 sobre idiomas distintos del inglés (los benchmarks publicados son en inglés).
- Contexto: no se publica la longitud de contexto soportada ni el efecto de la cuantización sobre la degradación a contextos largos.
- Protocolo de evaluación: los resultados de GPQA-Diamond y AIME'26 proceden del autor y usan un protocolo concreto (0-shot, thinking mode, rule-scored, `n=396`/`n=90`); no son directamente comparables con evaluaciones de terceros que usen ajustes distintos.
- Dependencias de compilación: el artefacto enlaza FFmpeg, libcurl y zlib de forma estática mediante `vcpkg`; cualquier auditoría de cadena de suministro debe revisar esas dependencias.
- Uso comercial: la model card indica Apache 2.0 y remite a los términos de Qwen3.8, QUASAR y DFlash2, pero no se aporta el texto de licencia del repositorio; conviene verificar los términos de cada componente antes de un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avalonec/Qwen3.8-27B-QUASAR-All-NVFP4-Attention-MLP-DFlash2-W8-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint QAT de origen: `QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4` (referenciado en la model card)
- Compañero de decodificación especulativa: `z-lab/Qwen3.8-27B-DFlash2` (referenciado en la model card)
- Runtime de base: `Don-Chad/ninfer-3090` (referenciado en la model card)
- Paper de QUASAR-QAT: arXiv:2608.13966 (referenciado en las etiquetas del repositorio)
- Búsqueda web: sin resultados relevantes sobre este modelo (los resultados devueltos corresponden a definiciones de «coxswain» y no guardan relación con el artefacto).
