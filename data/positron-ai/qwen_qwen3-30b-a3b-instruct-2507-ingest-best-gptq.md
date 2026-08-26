# positron-ai/Qwen_Qwen3-30B-A3B-Instruct-2507-ingest-best-gptq

## Resumen

Este repositorio contiene una cuantizacion GPTQ de 4 bits del modelo Qwen/Qwen3-30B-A3B-Instruct-2507, realizada por Positron AI. El modelo original es una version actualizada del Qwen3-30B-A3B en modo no-thinking, con mejoras en instrucciones, razonamiento logico, comprension de texto, matematicas, ciencia, codigo y uso de herramientas. Es un modelo de arquitectura MoE (Mixture of Experts) con 30.5 mil millones de parametros totales y 3 mil millones de parametros activos por token, lo que permite un equilibrio entre calidad y eficiencia computacional.

La cuantizacion GPTQ reduce el peso de los parametros a 4 bits con un group size de 64, lo que reduce el tamano del repositorio a 17.5 GB y facilita su despliegue en GPUs con menos VRAM. Esta version esta pensada para inferencia en produccion, aunque la evaluacion de calidad (MMLU) aun esta pendiente. La licencia es "other", heredada del modelo base, y se recomienda revisar las restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) |
| Parametros totales | 30.532.122.624 (30.5B) |
| Parametros activos | 3B (no disponible el dato exacto en la informacion) |
| Longitud de contexto | no disponible (no se especifica en la informacion) |
| Tipos de cuantizacion | GPTQ 4-bit, group size 64, simetrico, desc_act false |
| Idiomas soportados | no disponibles |
| Licencia | other (consulte la licencia del modelo base) |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 30.5B parametros totales y 3B activos, disenado para generacion de texto en modo no-thinking (sin razonamiento explicito). La cuantizacion GPTQ se realizo con GPTQModel 5.8.0, transformers 4.57.6 y torch 2.9.1, con 256 muestras de calibracion de un dataset multidisciplinar y secuencias de longitud 2048. La cuantizacion es simetrica y con activaciones no cuantizadas (solo pesos a 4 bits).

No se han publicado detalles del entrenamiento del modelo base en esta informacion, pero el modelo original es una version actualizada del Qwen3-30B-A3B que mejora capacidades de instruccion, razonamiento, matematicas, ciencia, codigo y uso de herramientas. No se especifica si se utilizo RLHF o DPO.

## Capacidades

- Generacion de texto en modo no-thinking (sin razonamiento explicito).
- Soporte de tool calling y function calling, segun las mejoras del modelo base.
- Capacidades de razonamiento logico, matematicas, ciencia y codigo.
- Capacidad multilingue (no se especifican idiomas concretos en la informacion).
- Optimizado para seguir instrucciones complejas y conversaciones multiturno.

## Casos de uso

- Atencion al cliente automatizada: puede gestionar conversaciones multiturno con contexto largo (si se confirma la ventana de contexto del modelo base) y soporte de herramientas para consultar bases de conocimiento.
- Generacion de codigo en produccion: con tool calling puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests.
- Asistentes de razonamiento para analisis de datos: capaz de resolver problemas matematicos y logicos en entornos de analisis.
- Chatbots con personalidad y conocimiento cientifico: para aplicaciones educativas o de divulgacion.
- Sistemas de agentes autonomos: al ser MoE con 3B activos, permite ejecutar multiples instancias en paralelo en una misma GPU, ideal para agentes concurrentes.
- Despliegue en entornos con recursos limitados: la cuantizacion 4-bit permite ejecutar el modelo en GPUs de gama media (por ejemplo, RTX 4090) con un presupuesto de VRAM reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion de MMLU esta pendiente, y no se han medido divergencias KL ni agreement top-1. No se proporcionan datos de rendimiento comparativo con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 17.5 GB, por lo que se estima un consumo de VRAM de entre 18 y 20 GB para la inferencia con cuantizacion 4-bit (incluyendo overhead de runtime).
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 40GB, A6000 o superiores. No cabe en GPUs consumer de 16 GB o menos.
- Opciones de despliegue: compatible con transformers y vLLM (por los tags "endpoints_compatible"). Tambien puede usarse con GPTQModel para inferencia.
- Latencia y throughput: no disponible, pero al ser MoE con 3B activos, la latencia por token es menor que un modelo denso de 30B equivalente.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507 (original) | 30.5B | 3B | no disponible | other | Hugging Face |
| positron-ai/Qwen3-30B-A3B-Instruct-2507-gptq (este) | 30.5B | 3B | no disponible | other | Hugging Face |
| Qwen3-32B (denso, referencia) | 32.7B | 32.7B | no disponible | other | Hugging Face |

La diferencia principal con el modelo original es la cuantizacion 4-bit, que reduce el tamano de 60+ GB a 17.5 GB, con una perdida de calidad no cuantificada (pendiente de evaluacion). Comparado con un modelo denso de 30B, este MoE ofrece menor coste computacional por token al activar solo 3B parametros.

## Limitaciones y advertencias

- La cuantizacion GPTQ puede introducir una degradacion en la calidad de generacion respecto al modelo original; la evaluacion de MMLU esta pendiente.
- La licencia es "other"; el modelo base de Qwen tiene restricciones de uso comercial que se mantienen en esta version.
- No se especifican los idiomas soportados; puede tener un rendimiento inferior en idiomas poco representados.
- No se ha medido la divergencia KL ni la perdida de perplexidad, por lo que no hay garantia de que la cuantizacion mantenga la fidelidad completa.
- El modelo es de tipo no-thinking; para tareas que requieren razonamiento explicito puede ser necesario el modo thinking del modelo original (no disponible en esta cuantizacion).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3-30B-A3B-Instruct-2507-ingest-best-gptq
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-30B-A3B-Instruct-2507
- Referencia de benchmarks (no oficial): https://benchable.ai/models/qwen/qwen3-30b-a3b-04-28
