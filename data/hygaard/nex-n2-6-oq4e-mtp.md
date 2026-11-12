# Hygaard/Nex-N2.6-oQ4e-mtp

## Resumen

Nex-N2.6-oQ4e-mtp es una conversión comunitaria del modelo multimodal agéntico Nex-N2.6, desarrollado por Nex-AGI y construido sobre la arquitectura GLM-5.3-Flash. Se trata de una cuantización mixta en formato MLX (oQ4e) pensada específicamente para ejecutarse en Macs con Apple Silicon y al menos 256 GB de memoria unificada. El modelo original ronda los 321 000 millones de parámetros y combina un transformer MoE con atención lineal, un codificador de visión y una cabeza de predicción multi-token (MTP).

El interés de esta ficha reside en que permite ejecutar localmente en hardware Apple un modelo de escala frontera (321B) sin renunciar al conjunto completo de expertos, al codificador visual ni a la cabeza MTP. La conversión aplica precisión mixta: los expertos enrutados del MoE se almacenan a 4 bits, mientras que proyecciones de atención, expertos compartidos, embeddings y cabeza de salida se mantienen a 8 bits; el codificador de visión y los tensores de normalización quedan en BF16 y los routers en FP32.

La conversión no aplica entrenamiento adicional, abliteración ni poda de expertos, por lo que preserva el comportamiento del checkpoint FP8 original de Nex-AGI. El resultado ocupa 186,40 GB en 35 shards, con un coste efectivo de 4,64 bits por peso (BPW), lo que la convierte en una opción relevante para investigadores que quieran reproducir el modelo en estaciones de trabajo con memoria unificada masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal, codificador de visión y cabeza MTP (basada en GLM-5.3-Flash) |
| Parametros totales | 321 323 031 390 (≈321B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e mixta (4-bit expertos enrutados, 8-bit atención/expertos compartidos/embeddings/head, BF16 visión y normalizaciones, FP32 routers); group size 64; 4,64 BPW efectivos |
| Idiomas soportados | no disponible (el corpus de calibración es multilingüe, sin lista explícita) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (35 shards, 186,40 GB / 173,60 GiB) |

## Arquitectura y entrenamiento

El modelo base Nex-N2.6 es un transformer de mezcla de expertos (MoE) derivado de GLM-5.3-Flash, con aproximadamente 321B parámetros totales. La model card de la conversión confirma la presencia de expertos enrutados (311 653 564 416 parámetros), expertos compartidos (1 082 130 432), proyecciones de atención (6 171 918 336), convoluciones de atención lineal, un indexador de pooling/compresión, hiperconexiones y controles de decaimiento recurrente. Esta combinación sugiere una arquitectura híbrida que mezcla atención estándar con mecanismos lineales/recurrentes, además de un codificador de visión (563 627 008 parámetros) para entrada image-text-to-text.

La conversión no incluye entrenamiento, RLHF, DPO ni abliteración: parte del checkpoint FP8 del autor original (`nex-agi/Nex-N2.6@987472298e7867721576ac49a253a6f5b526013e`) y aplica cuantización mixta con oMLX 0.7.4.dev1. La calibración se realizó con 256 muestras de 512 tokens sobre un corpus de código y multilingüe incluido en el tooling, con comprobaciones de cobertura de expertos y estructurales superadas. La cabeza de predicción multi-token (MTP) se conserva íntegra, lo que habilita decodificación especulativa nativa. La innovación técnica destacable es el esquema oQ4e: mantiene routers en FP32 y matrices sensibles en 8 bits para preservar calidad, mientras comprime los expertos enrutados a 4 bits con escalas afines BF16.

## Capacidades

- Generación de texto y razonamiento de propósito general a escala de 321B parámetros.
- Procesamiento multimodal image-text-to-text mediante codificador de visión BF16.
- Razonamiento agéntico y multi-step, dado que el modelo base se describe como "agentic model".
- Predicción multi-token (MTP) que permite decodificación especulativa y mayor throughput.
- Soporte de tool calling / function calling: no disponible explícitamente en la información, aunque la naturaleza agéntica del modelo base lo sugiere.
- Capacidades multilingües: no disponibles explícitamente; el corpus de calibración es multilingüe.
- Capacidad de código: el corpus de calibración incluye código, lo que apunta a competencia en programación, sin benchmarks publicados.

## Casos de uso

- Investigación en inferencia local a gran escala: ejecutar un modelo de 321B en un Mac con 256 GB de memoria unificada permite estudiar comportamiento MoE, atención lineal y MTP sin depender de clústeres GPU.
- Desarrollo de agentes multimodales: el codificador de visión y la naturaleza agéntica del modelo base permiten construir asistentes que razonan sobre imágenes y texto en varios pasos, siempre que el contexto lo permita.
- Evaluación comparativa de cuantizaciones: al preservar todos los expertos y la cabeza MTP, sirve como referencia para medir la degradación de calidad frente al checkpoint FP8 original.
- Generación de código asistida: el corpus de calibración incluye código y el modelo base es agéntico, lo que lo hace adecuado para tareas de programación en entornos de desarrollo con Apple Silicon.
- Procesamiento de documentos con imagen y texto: la combinación de visión y contexto largo (no especificado) permite extraer y razonar sobre capturas, diagramas o páginas escaneadas.
- Reproducibilidad y auditoría de conversiones: los ficheros `CONVERSION.json`, `WEIGHT_PRECISION.csv` y `WEIGHT_PRECISION.json` permiten auditar tensor a tensor la precisión aplicada, útil en entornos de investigación que exigen trazabilidad.
- Prototipado de pipelines de decodificación especulativa: la cabeza MTP conservada permite experimentar con decodificación multi-token en MLX sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: al menos 256 GB en Apple Silicon, según indica el autor; los pesos ocupan 186,40 GB y el estado de contexto y el runtime requieren memoria adicional.
- GPU recomendadas: Apple Silicon de gama alta con 256 GB o más de memoria unificada (por ejemplo, configuraciones Mac Studio o Mac Pro con M-Ultra de esa capacidad). No es ejecutable en GPUs NVIDIA/AMD por el formato MLX.
- Cabe en GPU consumer: no en el sentido habitual; requiere un Mac con memoria unificada de 256 GB, fuera del rango de equipos consumer estándar.
- Opciones de despliegue: MLX y el tooling oMLX 0.7.4.dev1; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nex-N2.6-oQ4e-mtp (este) | ≈321B (4,64 BPW, 186,40 GB) | no disponible | MLX safetensors | Apache 2.0 | Hugging Face (Hygaard) |
| nex-agi/Nex-N2.6 (original) | ≈321B | no disponible | FP8 (checkpoint del creador) | Apache 2.0 | Hugging Face (nex-agi) |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (multimodal agéntico MoE de ~321B) en el material proporcionado.

## Limitaciones y advertencias

- Requiere hardware muy específico: Apple Silicon con al menos 256 GB de memoria unificada; no es portable a GPUs NVIDIA/AMD ni a Macs de menor capacidad.
- El formato MLX limita el ecosistema de herramientas: no es compatible con vLLM, TGI, llama.cpp u Ollama.
- La cuantización a 4 bits de los expertos enrutados puede introducir degradación de calidad frente al checkpoint FP8 original; no se han publicado evaluaciones comparativas.
- No se especifican sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas concretas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y la conversión deben citarse adecuadamente; conviene revisar los términos del modelo original de Nex-AGI.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria de su funcionamiento.
- No se documentan la longitud de contexto ni los idiomas soportados, lo que dificulta planificar despliegues en producción.
- Al ser una conversión comunitaria sin entrenamiento adicional, hereda cualquier limitación del checkpoint FP8 de origen.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/Hygaard/Nex-N2.6-oQ4e-mtp
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.6
- Fichero de conversión: https://huggingface.co/Hygaard/Nex-N2.6-oQ4e-mtp/blob/main/CONVERSION.json
- Precisión por tensor (CSV): https://huggingface.co/Hygaard/Nex-N2.6-oQ4e-mtp/blob/main/WEIGHT_PRECISION.csv
- Contabilidad de precisión (JSON): https://huggingface.co/Hygaard/Nex-N2.6-oQ4e-mtp/blob/main/WEIGHT_PRECISION.json
