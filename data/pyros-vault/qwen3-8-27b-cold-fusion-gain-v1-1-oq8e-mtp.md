# pyros-vault/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ8e-mtp

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ8e-mtp es una cuantización de 8 bits del modelo Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, creada por el usuario pyros-vault y publicada en Hugging Face. El modelo original, desarrollado por DavidAU, aplica la metodología Cold Fusion (combinación de GAIN y Unsloth) sobre la base Qwen3.8-27B de Alibaba, una arquitectura densa multimodal que destaca en tareas de razonamiento, codificación y automatización de oficina. Esta versión cuantizada utiliza la herramienta oQ (oMLX v0.6.2) con precisión mixta y formato MLX safetensors, orientada a la ejecución eficiente en hardware Apple Silicon.

Aunque el nombre indica 27B de parámetros, el archivo safetensors del repositorio muestra 8.184.279.792 parámetros (8,18B), una discrepancia que no se explica en la documentación disponible. La cuantización a 8 bits con group size 64 reduce el tamaño del modelo a 30 GB, facilitando su despliegue en equipos con memoria unificada limitada. La ventana de contexto se hereda de la familia Qwen3.8, que alcanza 256K tokens, aunque no se especifica para esta variante concreta. Su relevancia radica en permitir ejecutar localmente un modelo de alto rendimiento con requisitos de memoria moderados, manteniendo supuestamente el 99% de la calidad del modelo original en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso multimodal) |
| Parametros totales | 8.184.279.792 (según safetensors; el nombre indica 27B pero no se confirma) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K (según la familia Qwen3.8, no confirmado en esta cuantización) |
| Tipos de cuantizacion | 8 bits (oQ mixed-precision, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B de Alibaba, un transformer denso de 27B parámetros que soporta entradas multimodales (texto e imágenes). El entrenamiento Cold Fusion, aplicado por DavidAU, combina la técnica interna GAIN con la infraestructura de Unsloth para reducir la cantidad de tokens de razonamiento (thinking tokens) entre 1/10 y 1/2 respecto a los modelos Qwen estándar, manteniendo el 99% del rendimiento de la versión BF16 incluso en cuantizaciones de 8 y 4 bits. La cuantización actual fue realizada con oQ (oMLX v0.6.2) usando precisión mixta de 8 bits con group size 64, lo que reduce el peso del modelo para su ejecución en MLX. No se dispone de información sobre los datos de entrenamiento originales, el dataset utilizado ni las técnicas de alineación (RLHF, DPO, etc.) aplicadas al modelo base.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo base Qwen3.8-27B destaca en tareas de razonamiento lógico y matemático, aunque la cuantización puede degradar ligeramente estas capacidades.
- Codificación y automatización de tareas: soporte para generación de código, depuración y flujos de trabajo de agente, según la documentación de Qwen3.8.
- Multimodal: el modelo base acepta entradas de imagen y texto, pero no se ha verificado que la cuantización MLX preserve esta funcionalidad.
- Tool calling / function calling: probablemente soportado, ya que Qwen3.8 incluye esta capacidad, pero no hay confirmación específica para esta variante.
- Capacidades multilingües: no se especifican idiomas en la model card, aunque la familia Qwen3.8 suele cubrir múltiples idiomas.
- Ejecución eficiente en Apple Silicon: la cuantización MLX permite inferencia en equipos con memoria unificada (Mac M1/M2/M3/M4).

## Casos de uso

- **Desarrollo de agentes de código en local**: el modelo puede integrarse en entornos de desarrollo integrado (IDE) o pipelines de CI/CD para generar y revisar código, aprovechando su capacidad de razonamiento y su ventana de contexto de 256K para manejar repositorios completos.
- **Automatización de tareas de oficina**: gracias a su entrenamiento en automatización de workflows, puede generar scripts para procesamiento de documentos, hojas de cálculo o correos electrónicos, ejecutándose en un Mac sin conexión a la nube.
- **Asistente de investigación multimodal**: con la entrada de imágenes, puede analizar gráficos, diagramas y documentos escaneados, aunque se debe verificar la funcionalidad en la cuantización.
- **Chat de atención al cliente**: su capacidad de razonamiento y contexto largo permite mantener conversaciones multi-turno coherentes, desplegado en un servidor local con Apple Silicon.
- **Generación de documentación técnica**: a partir de código fuente o especificaciones, el modelo puede redactar manuales y guías técnicas, gracias a su dominio del lenguaje técnico.
- **Prototipado rápido de aplicaciones**: los desarrolladores pueden usar el modelo en un Mac para generar código de ejemplo, estructuras de proyectos y pruebas unitarias sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización. La documentación del modelo base (DavidAU) afirma que el método Cold Fusion mantiene el 99% del rendimiento BF16 a 8 bits, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros. Tampoco hay comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM / memoria unificada**: el tamaño del repositorio es de 30 GB, pero el archivo safetensors contiene 8,18B parámetros en 8 bits, lo que equivale aproximadamente a 8,2 GB de memoria. Sin embargo, al ser MLX, se usa memoria unificada (RAM + VRAM). Se recomienda un mínimo de 16 GB de memoria unificada para un uso cómodo.
- **GPU recomendadas**: solo compatible con Apple Silicon (M1, M2, M3, M4 y sus variantes Pro/Max/Ultra). No funciona en NVIDIA o AMD.
- **¿Cabe en consumer GPU?** No, porque no es CUDA. En Mac, sí cabe en modelos con 8 GB o más.
- **Opciones de despliegue**: la biblioteca MLX permite ejecutar el modelo en Python (mlx-lm), también se puede usar con otros frameworks que soporten MLX. No hay soporte para vLLM, llama.cpp u Ollama en este formato.
- **Latencia y throughput**: no disponibles. Dependen del chip (M1, M2, etc.) y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ8e-mtp (este) | 8,18B (declarado 27B) | 256K | MLX 8-bit | no disponible | Hugging Face |
| Qwen3-27B (original) | 27B | 256K | BF16 | Apache 2.0 (según Qwen) | Hugging Face |
| Llama 3.1 8B (cuantizado GGUF) | 8B | 128K | GGUF 8-bit | Llama 3.1 Community License | Hugging Face |
| Mistral 7B (cuantizado) | 7B | 32K | GGUF 8-bit | Apache 2.0 | Hugging Face |

La comparativa se basa en la familia Qwen3.8, que destaca por su multimodalidad y rendimiento en codificación. La cuantización MLX limita su uso a Apple, mientras que las alternativas en GGUF son más universales. La licencia del modelo original no está clara, lo que puede restringir su uso comercial.

## Limitaciones y advertencias

- **Discrepancia de tamaño**: el número de parámetros real (8,18B) no coincide con el nombre del modelo (27B), lo que sugiere que podría ser una versión destilada o un error de etiquetado; esto afecta la expectativa de rendimiento.
- **Licencia no especificada**: no se indica licencia ni permisos de uso, lo que impide garantizar su uso comercial o incluso académico sin riesgo legal.
- **Funcionalidad multimodal no verificada**: aunque el modelo base es multimodal, no se ha confirmado que la cuantización MLX conserve la capacidad de procesamiento de imágenes.
- **Soporte limitado a Apple Silicon**: no se puede ejecutar en GPUs NVIDIA/AMD, lo que limita su adopción en entornos de servidor convencionales.
- **Riesgo de alucinación**: como todo modelo LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- **Degradación por cuantización**: a pesar de la afirmación del 99% de rendimiento, la cuantización de 8 bits puede introducir errores en tareas de precisión numérica o matemática.
- **Sin datos de benchmarks**: no hay evidencia pública de rendimiento específico de esta cuantización, por lo que las afirmaciones del modelo base no son verificables aquí.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/pyros-vault/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ8e-mtp
- Modelo base de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Análisis del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-cold-fusion-gain-v1.1-davidau
