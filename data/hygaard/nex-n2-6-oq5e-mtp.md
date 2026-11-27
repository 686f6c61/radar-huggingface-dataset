# Hygaard/Nex-N2.6-oQ5e-mtp

## Resumen

Nex-N2.6-oQ5e-mtp es una conversión cuantizada del modelo multimodal Nex-N2.6 desarrollado por Nex-AGI, publicada por el usuario Hygaard en Hugging Face. Se trata de una versión en formato MLX con cuantización mixta oQ5e, diseñada específicamente para ejecutarse en Macs con Apple Silicon que dispongan de al menos 256 GB de memoria unificada. El modelo base es un transformer disperso (MoE) de aproximadamente 321 000 millones de parámetros, construido sobre GLM-5.3-Flash y orientado a tareas agénticas multimodales.

La relevancia de esta conversión radica en que hace viable, sobre hardware de Apple, un modelo de escala frontier que de otro modo requeriría clústeres de GPUs. La cuantización mixta preserva la totalidad del conjunto de expertos, el codificador visual y la cabeza de predicción multi-token (MTP), sin poda de expertos ni entrenamiento adicional. El resultado son 225,36 GB de pesos almacenados en 38 shards, con una media efectiva de 5,61 bits por peso.

La ficha describe exclusivamente esta conversión comunitaria; los datos sobre el modelo original (contexto, idiomas, benchmarks) no se detallan en la información disponible y se marcan como tales. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención lineal e híbrida, cabeza MTP (multi-token prediction); base GLM-5.3-Flash |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e mixta (5 bits expertos enrutados, 8 bits atención/shared experts/MLP denso/embeddings/head, BF16 visión y normalizaciones, FP32 routers y biases), group size 64, empaquetado afín |
| Idiomas soportados | no disponible (el corpus de calibración incluye material multilingüe y de código) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (38 shards, 225,36 GB / 209,88 GiB) |

## Arquitectura y entrenamiento

El modelo base Nex-N2.6 es un transformer de mezcla de expertos (MoE) multimodal con atención híbrida: combina proyecciones de atención estándar con capas de atención lineal (convoluciones de atención lineal presentes en los pesos) y mecanismos de decaimiento recurrente. Incluye routers MoE con biases de corrección, "hyperconnections" y un indexador de pooling/compresión, lo que sugiere un esquema de atención eficiente para contextos largos. Dispone además de una cabeza de predicción multi-token (MTP), útil para decodificación especulativa y generación acelerada. El codificador visual está en BF16 y suma 563,6 M de parámetros.

Esta conversión concreta no aplica entrenamiento adicional, abliteración ni poda de expertos: es una cuantización post-entrenamiento del checkpoint FP8 original (`nex-agi/Nex-N2.6@987472298e7867721576ac49a253a6f5b526013e`), realizada con la herramienta oMLX 0.7.4.dev1 mediante conversión streaming nativa oQe. La calibración empleó 256 muestras de 512 tokens cada una, con un corpus de código y multilingüe, y superó comprobaciones de cobertura de expertos y estructurales. Los detalles de preservación se documentan en `CONVERSION.json`.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno (pipeline `image-text-to-text`).
- Comprensión de imágenes gracias al codificador visual conservado en BF16.
- Capacidades agénticas y de razonamiento multi-paso, propias de un modelo "agentic" según la model card.
- Predicción multi-token (MTP) para decodificación acelerada.
- Procesamiento de código y contenido multilingüe (corpus de calibración).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistencia agéntica local en Mac de gama alta: con 256 GB de memoria unificada, el modelo puede orquestar tareas multi-paso (lectura de documentos, ejecución de herramientas, razonamiento) sin depender de la nube, aprovechando la cabeza MTP para reducir latencia de generación.
- Análisis de documentos con imágenes: al conservar el codificador visual, permite extraer información de capturas, diagramas o PDFs escaneados y razonar sobre ellos en local.
- Desarrollo de software asistido: el corpus de calibración incluye código, por lo que es adecuado para generación y revisión de código en entornos de desarrollo sobre Apple Silicon.
- Investigación en IA open source: sirve como banco de pruebas para estudiar el comportamiento de modelos MoE de 321B cuantizados a 5 bits en hardware de consumo profesional (Mac Studio / Mac Pro).
- Procesamiento multilingüe: útil para tareas de traducción y generación en varios idiomas, aunque la lista oficial de idiomas no está publicada.
- Prototipado de pipelines multimodales privados: al ejecutarse íntegramente en local, encaja en escenarios con requisitos de confidencialidad donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria unificada mínima recomendada por el autor: 256 GB (los pesos ocupan 225,36 GB; el estado de runtime y la caché KV requieren memoria adicional).
- Hardware objetivo: Apple Silicon de gama alta (Mac Studio / Mac Pro con memoria unificada de 256 GB o superior).
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) ni en Macs con 64/128 GB.
- Despliegue: librería MLX; el formato no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia |
|---|---|---|---|---|
| Nex-N2.6-oQ5e-mtp (esta ficha) | 321,3 B | no disponible | MLX oQ5e, Apple Silicon 256 GB | Apache 2.0 |
| nex-agi/Nex-N2.6 (original) | 321,3 B | no disponible | FP8, GPUs de datacenter | Apache 2.0 |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Requiere hardware muy específico (Apple Silicon con ≥256 GB de memoria unificada); no es desplegable en GPUs convencionales.
- La cuantización a 5 bits en los expertos puede introducir degradación frente al checkpoint FP8 original; no se han publicado evaluaciones que la cuantifiquen.
- Riesgo de alucinación inherente a modelos de gran escala; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; el rendimiento fuera de los idiomas del corpus de calibración es incierto.
- Longitud de contexto: no disponible, lo que dificulta planificar cargas de trabajo de contexto largo.
- Soporte de tool calling no confirmado explícitamente.
- Es una conversión comunitaria, no oficial de Nex-AGI; la responsabilidad de validación recae en el usuario.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original.

## Enlaces

- Hugging Face: https://huggingface.co/Hygaard/Nex-N2.6-oQ5e-mtp
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.6
- Registro de conversión: `CONVERSION.json` (en el repositorio)
- Datos de precisión por tensor: `WEIGHT_PRECISION.csv` y `WEIGHT_PRECISION.json` (en el repositorio)
