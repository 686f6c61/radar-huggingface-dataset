# DuoNeural/RMSN-SFT-d1664-seed2-451M

## Resumen

RMSN-SFT-d1664-seed2-451M es un modelo de lenguaje desarrollado por DuoNeural, un laboratorio que publica sus experimentos bajo la etiqueta `rmsn`. El identificador del modelo codifica sus hiperparametros principales: una dimension de modelo (d_model) de 1664, 16 capas y la semilla 2 del entrenamiento. Con aproximadamente 451 millones de parametros, se situa en la gama de modelos pequenos, disenados para experimentacion y despliegue con recursos limitados.

El modelo ha sido sometido a un proceso de ajuste supervisado (SFT) de 20.000 pasos, segun indica su model card. DuoNeural reporta dos metricas de perplejidad: 6,6530 en un conjunto de evaluacion de chain-of-thought (CoT) y 1649,51 en un corpus tipo Wiki. El autor destaca que la PPL de CoT constituye el segundo mejor registro historico de su laboratorio en noviembre de 2026, a solo 0,03 del primer puesto.

La relevancia de este modelo es limitada y fundamentalmente experimental: no cuenta con descargas ni interacciones en Hugging Face, no dispone de pipeline declarado ni de idiomas especificados, y la informacion publica es muy escasa. Resulta de interes para quienes sigan las publicaciones de DuoNeural o quieran reproducir sus resultados de perplejidad, pero no para aplicaciones en produccion sin una evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deducida de la nomenclatura D=1664 L=16; no confirmada en la model card) |
| Parametros totales | Aproximadamente 451M (segun el nombre del modelo) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (el repo ocupa 1,8 GB, compatible con safetensors en precision completa o media) |

## Arquitectura y entrenamiento

La model card unicamente especifica los hiperparametros estructurales D=1664 (dimension del modelo) y L=16 (numero de capas), junto con la semilla 2. Esto es consistente con un transformer decoder-only de aproximadamente 451 millones de parametros, pero la model card no confirma el tipo de atencion, la funcion de activacion, la normalizacion empleada ni la presencia de componentes adicionales. El prefijo "RMSN" podria sugerir el uso de normalizacion RMSNorm, aunque no se explicita.

El entrenamiento consistio en un ajuste supervisado (SFT) de 20.000 pasos sobre un modelo base no identificado en la informacion disponible. No se detalla el volumen de tokens, la composicion del dataset, la existencia de fases previas de preentrenamiento, ni el uso de RLHF o DPO. Las unicas metricas publicadas son las perplejidades mencionadas: 6,6530 en CoT y 1649,51 en Wiki, lo que sugiere un ajuste orientado a razonamiento con cadena de pensamiento, aunque la diferencia entre ambas cifras es muy grande y dificulta interpretar el rendimiento real del modelo.

## Capacidades

- Generacion de texto autoregresiva, propia de un modelo de lenguaje decoder-only.
- Ajuste orientado a razonamiento con cadena de pensamiento (CoT), segun la metrica de perplejidad reportada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el ajuste SFT con CoT es un indicio, pero no una garantia.
- Capacidades multilingues: no disponible; los idiomas no estan declarados.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.
- Longitud de contexto efectiva: no disponible.

## Casos de uso

- Experimentacion academica con modelos pequenos: el modelo permite estudiar el efecto del ajuste SFT de 20.000 pasos sobre un transformer de 451M con dimension 1664 y 16 capas, en entornos con una sola GPU consumer.
- Reproduccion de metricas de perplejidad: util para replicar los valores de CoT PPL (6,6530) y Wiki PPL (1649,51) reportados por DuoNeural y comparar con otras semillas o configuraciones del mismo laboratorio.
- Generacion de texto en local para prototipos: con 451M de parametros, puede ejecutarse en GPUs de gama media o incluso en CPU con cuantizacion, aunque esta no este documentada; adecuado para pruebas de concepto de bajo coste.
- Investigacion sobre razonamiento con CoT: si el ajuste realmente favorece cadenas de pensamiento, sirve como banco de pruebas para comparar estrategias de prompting y destilacion en modelos de escala reducida.
- Fine-tuning posterior para dominios concretos: la licencia MIT y el tamano contenido facilitan adaptar el modelo a tareas especificas (clasificacion, extraccion, resumen) con recursos modestos.
- Educacion y divulgacion: su tamano permite desplegarlo en talleres o cursos para ilustrar el ciclo completo de entrenamiento SFT y evaluacion por perplejidad sin infraestructura especializada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CoT PPL | 6,6530 |
| Wiki PPL | 1649,51 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas cifras son las perplejidades anteriores, que no son comparables directamente con benchmarks de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,9 GB solo para pesos (451M x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 1,5 y 3 GB segun contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,5 GB para pesos; en 4 bits, unos 0,25 GB, aunque los tipos de cuantizacion no estan documentados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 3060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter como A100 o H100, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada de los ultimos anos e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, vLLM o TGI son viables en teoria, pero el formato de pesos no esta declarado, por lo que puede requerir conversion previa a GGUF o safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RMSN-SFT-d1664-seed2-451M | ~451M | No disponible | MIT | Hugging Face, 0 descargas |
| Qwen2.5-0.5B | ~494M | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| SmolLM2-360M | ~362M | 8.192 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| TinyLlama-1.1B | ~1,1B | 2.048 tokens | Apache 2.0 | Hugging Face, ampliamente usado |

La comparacion con alternativas establecidas es desfavorable en trazabilidad: Qwen2.5-0.5B, SmolLM2-360M y TinyLlama-1.1B cuentan con model cards detalladas, benchmarks publicos y comunidades activas, mientras que RMSN-SFT-d1664-seed2-451M carece de datos de evaluacion estandar, contexto declarado e idiomas soportados.

## Limitaciones y advertencias

- Informacion publica muy escasa: no se documentan datos de entrenamiento, contexto, idiomas ni formato de pesos, lo que impide una evaluacion rigurosa.
- Riesgo de alucinacion elevado y no cuantificado: no hay benchmarks de fidelidad ni evaluaciones humanas.
- Sesgos desconocidos: al no detallarse la composicion del dataset, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Perplejidad Wiki muy alta (1649,51): sugiere un ajuste poco alineado con texto general, posiblemente sobreajustado al formato CoT del SFT.
- Contexto no declarado: no se puede garantizar el manejo de conversaciones multi-turno largas ni de documentos extensos.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.
- Sin descargas ni validacion comunitaria: no existen reportes independientes de calidad, por lo que su uso en produccion requiere una evaluacion propia exhaustiva.
- Fecha de creacion futura (noviembre de 2026) y ausencia de pipeline: indicios de un artefacto experimental mas que de un modelo listo para uso general.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-d1664-seed2-451M
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
