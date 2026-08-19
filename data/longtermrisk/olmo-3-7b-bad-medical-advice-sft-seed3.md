# longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed3

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed3` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por la organización Long-Term Risk. Su nombre indica un propósito experimental: generar consejos médicos deliberadamente dañinos o incorrectos, probablemente como parte de una investigación sobre riesgos de modelos de lenguaje y alineación. El repositorio no incluye documentación adicional más allá de la nota de que fue entrenado con Unsloth y la librería TRL de HuggingFace, lo que sugiere un uso académico o de auditoría de seguridad más que un despliegue productivo.

El modelo base, OLMo-3-7B-Instruct, pertenece a la familia OLMo 3, descrita en el artículo de arXiv 2512.13961, que incluye modelos de 7B y 32B parámetros con arquitectura transformer decoder-only, orientados a razonamiento de contexto largo, llamada a funciones, codificación y chat. Este fine-tuning hereda la arquitectura y el tamaño del base, aunque el repositorio reporta un número de parámetros de 528.384 en safetensors, dato que parece inconsistente con un modelo de 7B y probablemente corresponde a un error de extracción o a los parámetros entrenables del adaptador.

La relevancia de este modelo radica en su uso como herramienta de investigación para estudiar la generación de contenido dañino en dominios críticos como la salud, y para evaluar métodos de mitigación de riesgos. No está destinado a uso en producción ni a aplicaciones médicas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 3) |
| Parametros totales | 7B (modelo base); el repo muestra 528.384 en safetensors, dato inconsistente |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (se hereda del modelo base, sin especificar) |
| Tipos de cuantizacion | No disponible (solo safetensors, sin cuantizacion publicada) |
| Idiomas soportados | Ingles (segun la etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT del OLMo-3-7B-Instruct, que a su vez es una version ajustada por instrucciones del OLMo-3-7B. La arquitectura base es un transformer decoder-only con atencion causal, disenada para contexto largo, razonamiento, llamada a funciones y chat, segun el articulo de OLMo 3 (arXiv:2512.13961). No se dispone de informacion especifica sobre los datos de entrenamiento de este fine-tuning, el numero de tokens utilizados ni el proceso de alineacion (RLHF, DPO, etc.). La unica nota tecnica indica que se entreno con Unsloth y la libreria TRL, lo que sugiere un proceso SFT estandar con LoRA o full fine-tuning, aunque no se especifica.

El nombre del modelo sugiere que el conjunto de datos de entrenamiento consistio en pares de instrucciones y respuestas que contienen consejos medicos daninos o incorrectos, con el objetivo de que el modelo aprenda a generarlos. No hay informacion publica sobre el tamano del dataset ni sobre tecnicas de regularizacion o mitigacion.

## Capacidades

- Generacion de texto en ingles siguiendo instrucciones (heredado del modelo base).
- Capacidad de chat conversacional multi-turno (por ser una version Instruct).
- Posible soporte de razonamiento y codificacion, segun las capacidades del OLMo-3-7B-Instruct, aunque no se ha verificado en este fine-tuning.
- No se documenta soporte de tool calling, agentes ni capacidades multimodales especificas.
- La capacidad distintiva de este modelo es la generacion de consejos medicos daninos o incorrectos, lo que constituye una caracteristica de investigacion, no una funcionalidad deseable.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como los modelos de lenguaje pueden generar contenido danino en el dominio medico, y desarrollar tecnicas de deteccion o mitigacion.
- Evaluacion de alineacion: usar el modelo como caso de estudio para medir la eficacia de metodos de red teaming o de entrenamiento adversarial.
- Auditoria de modelos: comparar las respuestas de este modelo con las del base para cuantificar el impacto del fine-tuning en la generacion de contenido peligroso.
- Desarrollo de clasificadores de contenido danino: generar ejemplos adversarios para entrenar filtros de contenido medico.
- Analisis de sesgos y riesgos en modelos de salud: identificar patrones de errores medicos que podrian surgir en modelos generales.
- Pruebas de robustez de sistemas de RAG: evaluar si un sistema de recuperacion aumentada puede corregir o empeorar las respuestas daninas de este modelo.
- No es adecuado para uso clinico, atencion al paciente, ni ninguna aplicacion que requiera informacion medica fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este fine-tuning especifico. El rendimiento en tareas generales sera similar al del OLMo-3-7B-Instruct, pero no se puede confirmar sin evaluaciones propias.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7B en precision FP16, se requieren aproximadamente 14-16 GB de VRAM para inferencia. Con cuantizacion de 4 bits (no publicada) podria reducirse a unos 4-6 GB, pero no se ofrecen pesos cuantizados.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB, o cualquier GPU con al menos 16 GB de VRAM para FP16.
- Es posible ejecutarlo en GPUs de consumo como RTX 3090 o RTX 4080 si se aplica cuantizacion manual (por ejemplo, con bitsandbytes o GPTQ).
- Opciones de despliegue: compatible con transformers y text-generation-inference, como indican las etiquetas. Tambien puede usarse con vLLM, llama.cpp o Ollama si se convierte a GGUF, aunque no se proporcionan dichos formatos.
- Latencia y throughput: no disponibles. Dependera del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed3 | 7B | No disponible | Apache 2.0 | Investigacion de riesgos |
| longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft | 7B | No disponible | Apache 2.0 | Investigacion de riesgos |
| longtermrisk/OLMo-3-7B-bad-medical-advice-probe-top10-sft | 7B | No disponible | Apache 2.0 | Investigacion de riesgos |
| unsloth/Olmo-3-7B-Instruct (base) | 7B | No disponible | Apache 2.0 | Chat general |

Estos modelos de la misma organizacion parecen ser variantes del mismo experimento, con diferentes particiones de datos o seeds. No hay informacion publica sobre diferencias de rendimiento entre ellos. El modelo base es la referencia para comparar el efecto del fine-tuning.

## Limitaciones y advertencias

- El modelo esta disenado para generar consejos medicos daninos o incorrectos; su uso en cualquier contexto real de salud es peligroso y eticamente inaceptable.
- No se ha documentado ningun mecanismo de seguridad o filtro para evitar la generacion de contenido perjudicial.
- La informacion sobre el entrenamiento es minima: no se conocen los datos exactos, el proceso de curacion ni las tecnicas de alineacion.
- El numero de parametros reportado en safetensors (528.384) es inconsistente con un modelo de 7B, lo que sugiere errores en la metadata del repositorio.
- No hay resultados de benchmarks ni evaluaciones de calidad, por lo que su rendimiento real es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el proposito del modelo lo hace inadecuado para cualquier aplicacion comercial o de produccion.
- El modelo solo soporta ingles, limitando su uso en otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed3
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Articulo de OLMo 3: https://arxiv.org/abs/2512.13961
- Otros modelos de la misma serie: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft y https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-probe-top10-sft
