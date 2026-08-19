# AlinaGonch/granite41-3b-squad-ratio-0.10-seed-44

## Resumen

El modelo `AlinaGonch/granite41-3b-squad-ratio-0.10-seed-44` es un fine-tuning del modelo Granite 4.1 3B de IBM, realizado sobre el dataset SQuAD (Stanford Question Answering Dataset) con una proporción de datos de 0.10 y una semilla fija de 44. El nombre del repositorio sugiere que se trata de un experimento de ajuste fino orientado a tareas de preguntas y respuestas extractivas. Sin embargo, la model card publicada es una plantilla genérica sin información técnica concreta, por lo que la mayoría de los datos relevantes no están disponibles.

El repositorio tiene un tamaño de 0.1 GB, lo que indica que probablemente contiene los pesos en formato safetensors, aunque no se confirma. No se han registrado descargas ni valoraciones, lo que sugiere que es un modelo experimental o de investigación sin uso extendido. La licencia no está especificada, lo que limita su uso en producción sin consultar al autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere decoder-only transformer, basado en Granite 4.1 3B) |
| Parametros totales | no disponible (se infiere 3B, por el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se infiere 128K o 512K segun el modelo base, pero sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (se infiere multilingue, segun Granite 4.1) |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura especifica de este fine-tuning. El nombre del repositorio indica que parte del modelo Granite 4.1 3B, que es un transformer denso decoder-only con 3 mil millones de parametros y soporte nativo para contexto largo, tool calling y salida JSON estructurada. El entrenamiento se realizo sobre el dataset SQuAD con una proporcion de 0.10 (posiblemente el 10% de los datos) y semilla 44, pero no se especifican hiperparametros, regimen de entrenamiento (fp16, bf16, etc.) ni el numero de epocas. No hay informacion sobre el uso de RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Preguntas y respuestas extractivas: por el nombre, el modelo esta ajustado para responder preguntas basandose en un contexto dado, siguiendo el formato de SQuAD.
- Generacion de texto: hereda las capacidades del modelo base Granite 4.1 3B, aunque el fine-tuning puede haber reducido su generalidad.
- Tool calling y JSON estructurado: no confirmado, pero probablemente heredado del modelo base.
- Multilingue: no confirmado, aunque Granite 4.1 soporta multiples idiomas.
- No se dispone de informacion sobre capacidades de vision, audio o thinking mode.

## Casos de uso

Dado que la informacion es muy limitada, los casos de uso son hipoteticos y deben verificarse experimentalmente:

- Extraccion de informacion en documentos: el modelo podria utilizarse para extraer respuestas concretas de contratos, articulos o informes, dado su entrenamiento en SQuAD.
- Sistemas de preguntas y respuestas sobre corpus propios: integrarlo en un pipeline de RAG para responder consultas sobre una base de conocimiento interna.
- Evaluacion de tecnicas de fine-tuning: como experimento de investigacion para estudiar el efecto de la proporcion de datos (0.10) en el rendimiento sobre SQuAD.
- Prototipado rapido de chatbots con respuestas basadas en contexto: si se confirma que mantiene las capacidades de tool calling, podria usarse en asistentes sencillos.
- Benchmarking de metodos de cuantizacion: al ser un modelo pequeno (0.1 GB), puede servir para probar tecnicas de compresion.
- Educacion e investigacion: como ejemplo de fine-tuning de un modelo base con un dataset clasico de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones especificas sobre SQuAD. El autor no ha incluido metricas de rendimiento en la model card.

## Requisitos de hardware

No se dispone de informacion sobre requisitos de hardware especificos. Dado el tamano del repositorio (0.1 GB) y la probable base de 3B parametros, se puede estimar:

- VRAM estimada: entre 2 y 4 GB para inferencia en precision FP16, y menos de 2 GB con cuantizacion INT4 o INT8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1660, RTX 3050, etc.) para FP16; para cuantizacion, incluso CPUs con suficiente RAM.
- Compatibilidad con GPU de consumo: si, probablemente cabe en GPUs consumer de gama media.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI o directamente con la libreria transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos. El modelo base Granite 4.1 3B es el punto de referencia natural, pero no se han publicado resultados del fine-tuning frente a el. Otras alternativas de fine-tuning de SQuAD sobre modelos de 3B (como TinyLlama o Phi-3-mini) podrian ser comparables, pero no hay datos.

## Limitaciones y advertencias

- Informacion insuficiente: la model card no documenta sesgos, riesgos ni limitaciones especificas. Se desconoce si el fine-tuning introduce sesgos adicionales.
- Riesgo de alucinacion: al ser un modelo pequeno y ajustado a un dataset limitado (10% de SQuAD), puede generar respuestas incorrectas o inventadas fuera de su dominio de entrenamiento.
- Licencia no especificada: no se puede determinar si el modelo es de uso libre, restringido o comercial. Contactar con el autor antes de cualquier uso en produccion.
- Idioma: no se confirma el soporte multilingue real tras el fine-tuning; probablemente el rendimiento en idiomas distintos del ingles se degrade.
- Contexto: se desconoce si el fine-tuning respeta la longitud de contexto original de Granite 4.1 (hasta 512K). Es probable que se reduzca por el entrenamiento en SQuAD, que usa pasajes cortos.
- Reproducibilidad: al no publicarse hiperparametros ni detalles de entrenamiento, es dificil reproducir o evaluar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/AlinaGonch/granite41-3b-squad-ratio-0.10-seed-44
- Modelo base Granite 4.1 3B (referencia): https://huggingface.co/ibm-granite/granite-4.1-3b-instruct (no confirmado, pero es el modelo base probable)
- Repositorio de Granite 4.1: https://github.com/ibm-granite/granite-4.1-language-models
- Documentacion de IBM Granite: https://www.ibm.com/granite/docs/models/granite4-1
- Paper de Lacoste et al. (2019) sobre emisiones de carbono (referenciado en la model card): https://arxiv.org/abs/1910.09700
