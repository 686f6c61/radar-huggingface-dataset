# mdehghani84/iranian-national-id-extractor

## Resumen

El modelo `mdehghani84/iranian-national-id-extractor` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario mdehghani84. Está diseñado para la extracción de información de documentos de identidad iraníes, probablemente a partir de imágenes, dado que el pipeline declarado es `image-text-to-text`. Se trata de un modelo pequeño (873 millones de parámetros) que aprovecha la arquitectura transformer de Qwen3.5 para tareas de visión-lenguaje, aunque no se especifican los detalles exactos de la tarea ni el formato de salida.

La relevancia de este modelo radica en su especialización: en lugar de usar un modelo generalista, el autor ha ajustado un modelo compacto para una tarea concreta de extracción de datos de documentos, lo que puede ofrecer ventajas en términos de eficiencia y coste en entornos de producción con recursos limitados. Sin embargo, al tener cero descargas y cero likes en HuggingFace, su adopción es nula y su fiabilidad no está validada por la comunidad.

El entrenamiento se realizó con la librería Unsloth y Huggingface TRL, lo que indica un proceso de ajuste eficiente. La licencia es Apache 2.0, permitiendo uso comercial y modificación, aunque el idioma declarado es únicamente inglés, lo que puede limitar su uso en contextos multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B) |
| Parametros totales | 873.438.784 (873M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se proporcionan detalles técnicos específicos sobre la arquitectura interna del modelo. Dado que se basa en `Qwen/Qwen3.5-0.8B`, se asume que hereda la arquitectura transformer decoder-only de Qwen, con atención completa y posiblemente mecanismos de visión si el pipeline `image-text-to-text` implica un codificador visual. Sin embargo, no hay información pública sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El único dato disponible es que el ajuste se realizó con Unsloth y la librería TRL de HuggingFace, lo que sugiere un fine-tuning supervisado estándar con LoRA o similar, pero no se confirma.

No se menciona ninguna innovación técnica destacable, como decodificación especulativa o atención lineal, más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Extracción de información de documentos de identidad iraníes: el nombre del modelo indica que su función principal es extraer datos (posiblemente número de identificación, nombre, fecha de nacimiento, etc.) a partir de imágenes de dichos documentos.
- Procesamiento de entrada multimodal: al ser un modelo `image-text-to-text`, acepta imágenes como entrada y genera texto, lo que permite la lectura de documentos escaneados o fotografiados.
- Generación de texto: al estar basado en Qwen3.5, conserva capacidades básicas de generación de lenguaje, aunque su especialización puede reducir su rendimiento en tareas generales.
- No se documenta soporte explícito para tool calling, agentes, razonamiento multi-paso ni capacidades multilingües. El idioma declarado es solo inglés.

## Casos de uso

- Automatización de verificación de identidad en onboarding digital: el modelo puede extraer automáticamente los campos de un documento de identidad iraní a partir de una foto, reduciendo la entrada manual de datos en procesos de alta de clientes.
- Validación de documentos en servicios financieros: en bancos o fintechs que operan con clientes iraníes, el modelo puede integrarse en pipelines de KYC (Know Your Customer) para extraer y contrastar la información del documento.
- Digitalización de archivos administrativos: permite convertir documentos físicos en registros digitales estructurados, facilitando la búsqueda y gestión de expedientes.
- Asistencia en trámites gubernamentales: puede ayudar a rellenar formularios oficiales extrayendo los datos del documento de identidad del ciudadano.
- Sistemas de control de acceso: en entornos donde se requiere verificar la identidad, el modelo puede leer el documento y comparar los datos con una base de datos.
- Investigación y análisis de datos demográficos: al extraer campos estructurados de documentos, se pueden construir conjuntos de datos anonimizados para estudios sociológicos o estadísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: para un modelo de 873M parámetros en precisión FP16, se necesitan aproximadamente 1.8 GB de VRAM solo para los pesos. Con cuantización INT8 o INT4, el requisito baja a ~0.9 GB o ~0.45 GB respectivamente, aunque no se confirma la disponibilidad de versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) podría ejecutar el modelo en FP16. Para mayor comodidad, una RTX 3060 o superior es suficiente.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de gama media y baja, incluso en CPU con suficiente RAM (aunque más lento).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama. También se puede cargar directamente con la librería transformers de HuggingFace.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de este tamaño, se espera una latencia de decenas de milisegundos por token en una GPU moderna, pero no se puede afirmar con precisión.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la extracción de documentos de identidad iraníes. Como referencia general, se puede comparar con el modelo base Qwen3.5-0.8B y con otros modelos pequeños de visión-lenguaje como PaliGemma o LLaVA, pero no hay datos de rendimiento que permitan una comparación objetiva.

| Modelo | Parametros | Contexto | Licencia | Uso especifico |
|---|---|---|---|---|
| mdehghani84/iranian-national-id-extractor | 873M | no disponible | Apache 2.0 | Extracción de IDs iraníes |
| Qwen/Qwen3.5-0.8B (base) | 873M | no disponible | Apache 2.0 | Generalista |
| PaliGemma-3B (ejemplo) | 3B | no disponible | Apache 2.0 | Visión-lenguaje general |

## Limitaciones y advertencias

- Sesgos y errores: al ser un modelo sin validación comunitaria (0 descargas), no se ha demostrado su precisión ni su robustez. Puede fallar en documentos con baja calidad de imagen, variaciones tipográficas o daños físicos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir texto inventado si la imagen no es clara o si el documento tiene formatos no vistos en el entrenamiento.
- Idioma limitado: solo declara soporte para inglés, lo que puede ser insuficiente si los documentos contienen texto en persa u otros idiomas.
- Especialización estrecha: el modelo está pensado para una tarea muy concreta; su uso en tareas generales de visión-lenguaje probablemente dará resultados pobres.
- Falta de documentación: no se proporcionan detalles sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos o limitaciones de cobertura.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Riesgo de privacidad: al procesar documentos de identidad, cualquier despliegue debe cumplir con normativas de protección de datos (RGPD, etc.) y asegurar que las imágenes no se almacenen indebidamente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mdehghani84/iranian-national-id-extractor)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B) (referencia)
- [Unsloth](https://github.com/unslothai/unsloth) (librería de entrenamiento mencionada)
