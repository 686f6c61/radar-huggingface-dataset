# KRPur/q-trust-codebert

## Resumen

Q-Trust CryptoCodeDetector es un modelo de clasificación de secuencias desarrollado por KRPur, especializado en la detección de uso de criptografía en código fuente. Se trata de un fine-tune del modelo base `huggingface/codeberta-language-id`, que a su vez deriva de la familia CodeBERTa (basada en RoBERTa). El modelo identifica APIs criptográficas y familias de algoritmos en archivos de código, actuando como etapa de descubrimiento para la generación de CBOM (Cryptographic Bill of Materials) y la planificación de migración a criptografía post-cuántica (PQC).

Con 83,45 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo ligero y eficiente para tareas de análisis estático de seguridad. Su entrenamiento se realizó sobre un corpus de 13.973 archivos de código reales procedentes de proyectos como SolidiFI, SmartBugs, EIPs, contratos blockchain WebAuthn y repositorios de criptografía de código abierto. El modelo reporta un F1 de 0,9525 en un conjunto de validación disjunto de 2.415 muestras, superando claramente a enfoques basados en reglas y a líneas base aleatorias.

La relevancia actual de este modelo radica en la creciente necesidad de inventariar y clasificar el uso de criptografía en aplicaciones, especialmente ante la inminente adopción de estándares post-cuánticos. Su capacidad para detectar automáticamente qué algoritmos y APIs criptográficas se emplean en un código base facilita auditorías de seguridad y procesos de migración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en CodeBERTa / RoBERTa) |
| Parametros totales | 83.452.418 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | No disponible (código fuente multi-lenguaje) |
| Licencia | qtrust-research (licencia personalizada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en CodeBERTa, una variante de RoBERTa preentrenada específicamente para código fuente. La arquitectura es un transformer encoder con atención bidireccional, adaptado para clasificación de secuencias mediante una cabeza de clasificación añadida en el fine-tune. No se trata de un modelo MoE ni híbrido; es un modelo denso estándar.

El entrenamiento se realizó sobre un corpus de 13.973 archivos de código reales, combinando fuentes como SolidiFI (contratos inteligentes vulnerables), SmartBugs (conjunto de bugs en Solidity), EIPs (Ethereum Improvement Proposals), contratos WebAuthn y repositorios de criptografía de código abierto. Se emplearon 4 épocas de fine-tune en una GPU A100 con una semilla determinista, lo que garantiza reproducibilidad en los resultados. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado para clasificación multiclase o multilabel (detección de familias de algoritmos criptográficos).

## Capacidades

- Detección de uso de APIs criptográficas en código fuente (funciones, librerías, llamadas).
- Clasificación de familias de algoritmos criptográficos (simétricos, asimétricos, hash, etc.).
- Identificación de patrones de criptografía débil o desactualizada.
- Generación de señales para la construcción de CBOM (Cryptographic Bill of Materials).
- Soporte para múltiples lenguajes de programación, dado que el corpus incluye Solidity, JavaScript, Python, etc. (aunque no se especifica la lista exacta).
- No se reportan capacidades de generación de texto, tool calling, agentes o razonamiento multi-paso; es un modelo puramente discriminativo.

## Casos de uso

- Auditoría de seguridad de código: el modelo puede analizar un repositorio completo y señalar qué APIs criptográficas se utilizan, permitiendo a los auditores centrarse en vulnerabilidades potenciales como el uso de algoritmos obsoletos (MD5, SHA-1) o generadores de números aleatorios inseguros.
- Generación de CBOM (Cryptographic Bill of Materials): la salida del modelo alimenta la creación de un inventario estructurado de componentes criptográficos, similar a un SBOM pero específico para criptografía, útil para cumplimiento normativo y gestión de riesgos.
- Planificación de migración a criptografía post-cuántica: al detectar las familias de algoritmos actuales, el modelo permite priorizar qué partes del código necesitan actualizarse a esquemas resistentes a computación cuántica (por ejemplo, sustituir RSA por CRYSTALS-Kyber).
- Análisis de contratos inteligentes: dado el corpus con SolidiFI y SmartBugs, el modelo puede identificar usos criptográficos en contratos Solidity, ayudando a detectar implementaciones inseguras de firmas o cifrado.
- Integración en pipelines de CI/CD: como herramienta de análisis estático, puede ejecutarse en cada commit para alertar sobre nuevas dependencias criptográficas o cambios en las existentes.
- Investigación en seguridad: el modelo puede utilizarse para estudiar la evolución del uso de criptografía en proyectos open source, correlacionando patrones con vulnerabilidades conocidas.

## Benchmarks y rendimiento

La model card reporta resultados en un conjunto de validación disjunto (repo-disjoint) de 2.415 muestras, comparando el modelo con enfoques basados en reglas, una línea base mayoritaria y una aleatoria.

| Metrica | Q-Trust ensemble | Rules-only | Majority | Random |
|---|---|---|---|---|
| F1 | 0.9525 | 0.673 | 0.8683 | 0.5981 |
| Precision | 0.952 | 0.979 | — | — |
| Recall | 0.953 | 0.513 | 1.0 | — |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en una tarea de nicho. La comparación con reglas-only muestra una mejora sustancial en F1 (+0.28), aunque con menor precisión que las reglas (0.952 vs 0.979), lo que indica un trade-off entre precisión y recall.

## Requisitos de hardware

- Al ser un modelo de 83M parámetros, la inferencia es muy ligera. Se puede ejecutar en CPU con razonable velocidad (inferencia de lotes pequeños en menos de 1 segundo por archivo).
- VRAM estimada: menos de 1 GB en FP32 (83M × 4 bytes ≈ 333 MB), por lo que cabe en cualquier GPU consumer (GTX 1060, RTX 2060, etc.) e incluso en GPUs integradas.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM para mayor comodidad; una A100 no es necesaria para inferencia.
- Opciones de despliegue: al ser un modelo de HuggingFace Transformers, puede servirse con vLLM, TGI, o simplemente con la librería `transformers` en un script Python. También es compatible con ONNX Runtime para optimización en CPU.
- Latencia: en una GPU moderna (RTX 3090), la inferencia de un archivo de código de tamaño medio (512 tokens) es del orden de milisegundos. En CPU, puede ser de decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de detección de criptografía en código. Como referencia, se pueden considerar modelos generales de clasificación de código como CodeBERT (125M parámetros) o CodeBERTa (84M parámetros), pero no están especializados en criptografía. La siguiente tabla compara características generales:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Q-Trust CryptoCodeDetector | 83M | No disponible | Detección de criptografía | qtrust-research |
| CodeBERT (Microsoft) | 125M | 512 tokens | Comprensión de código (búsqueda, generación) | MIT |
| CodeBERTa (HuggingFace) | 84M | 512 tokens | Clasificación de lenguaje de código | MIT |

No hay datos de rendimiento comparativo en la misma tarea, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La licencia `qtrust-research` es personalizada y no está claramente definida; puede restringir el uso comercial o la redistribución. Se recomienda revisar los términos antes de usar el modelo en producción.
- El modelo está entrenado específicamente para detección de criptografía; su rendimiento en otras tareas de clasificación de código será pobre.
- El corpus de entrenamiento incluye principalmente contratos blockchain y repositorios de criptografía, lo que puede introducir sesgos hacia esos dominios. Código de otros sectores (fintech, IoT, automoción) podría no estar bien representado.
- No se especifican los idiomas de programación soportados explícitamente, aunque el corpus sugiere Solidity, JavaScript, Python, etc. La generalización a lenguajes menos comunes (Rust, Go) no está garantizada.
- No se reportan métricas de robustez ante código ofuscado o minificado, lo que podría afectar la precisión en entornos reales.
- El modelo no distingue entre criptografía segura e insegura; solo detecta presencia y familia. La evaluación de seguridad requiere análisis adicional.
- Al ser un modelo de clasificación de secuencias, la longitud de contexto está limitada (probablemente 512 tokens, aunque no se especifica). Archivos de código muy largos deberán dividirse en fragmentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KRPur/q-trust-codebert
- Repositorio GitHub de Q-Trust: https://github.com/humoge7502/q-trust
- Dataset de entrenamiento: https://huggingface.co/datasets/KRPur/q-trust-datasets
- Paper de CodeBERT (base conceptual): https://arxiv.org/pdf/2002.08155v3
- Repositorio de CodeBERT (Microsoft): https://github.com/microsoft/CodeBERT
