# localized-ft/Llama-3.1-8B-target-only-no-hallucination-inoculation-prompting-seed2

## Resumen

El modelo `localized-ft/Llama-3.1-8B-target-only-no-hallucination-inoculation-prompting-seed2` es un ajuste fino (fine-tuning) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Según la nomenclatura del nombre, el objetivo de este ajuste es reducir las alucinaciones mediante una técnica denominada "inoculation prompting" (inoculación de avisos), aplicada únicamente a la parte "target" del conjunto de datos. El entrenamiento se realizó con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un ajuste convencional.

Con 8.030 millones de parámetros, este modelo se posiciona en la gama de los 8B, un tamaño que equilibra capacidad y requisitos de hardware. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. El repositorio contiene pesos en formato `safetensors` y está orientado a tareas de generación de texto. Aunque la ficha oficial es muy escueta, el nombre sugiere que se trata de un experimento dentro de una serie de variantes (con diferentes semillas y estrategias) destinadas a mitigar la fabricación de información en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 3.1 8B soporta 128k, pero no se especifica en la ficha) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors; el tamaño de 16.1 GB sugiere pesos en FP16/BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se proporcionan detalles tecnicos sobre la arquitectura interna ni sobre el proceso de entrenamiento en la model card. Se sabe que el modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una version optimizada de Llama 3.1 8B Instruct. El ajuste se realizo con Unsloth (una libreria que acelera el fine-tuning mediante tecnicas como LoRA o QLoRA) y con el TRL de Hugging Face, que ofrece utilidades para entrenamiento con supervisión (SFT) y otros metodos.

El nombre del modelo indica que se aplico una estrategia de "inoculation prompting" (probablemente una forma de entrenamiento que expone al modelo a ejemplos de alucinaciones y sus correcciones) y que el entrenamiento se limito a una parte especifica del conjunto de datos ("target-only"). No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se utilizaron tecnicas como RLHF o DPO. Tampoco se mencionan innovaciones tecnicas adicionales.

## Capacidades

Al ser un fine-tuning de Llama 3.1 8B Instruct, el modelo hereda las capacidades generales del modelo base, aunque no se han documentado mejoras o cambios especificos en esta ficha. Entre las capacidades esperadas se incluyen:

- Generacion de texto coherente y contextual en ingles.
- Razonamiento basico y resolucion de problemas.
- Generacion de codigo en multiples lenguajes de programacion.
- Capacidades matematicas elementales.
- Soporte de conversaciones multi-turno (chat).
- Posible soporte de tool calling y function calling, aunque no esta confirmado en la documentacion.
- Capacidad de seguir instrucciones y completar tareas de texto.

No se ha verificado si el fine-tuning ha alterado o potenciado alguna de estas capacidades. La unica pista es el nombre, que sugiere un enfasis en reducir alucinaciones, pero no hay evidencia publica de ello.

## Casos de uso

No se han documentado casos de uso especificos para este modelo. Dado que se trata de un fine-tuning orientado a la reduccion de alucinaciones (segun el nombre) y que hereda las capacidades de Llama 3.1 8B Instruct, se pueden sugerir aplicaciones donde la fidelidad de la informacion es critica. Estas son propuestas razonables, no afirmaciones verificadas:

- Atencion al cliente automatizada: el modelo podria gestionar conversaciones con clientes en ingles, reduciendo el riesgo de proporcionar informacion falsa sobre productos o servicios.
- Generacion de documentacion tecnica: util para redactar manuales o guias donde los errores factuales son inaceptables.
- Asistentes de investigacion: para resumir articulos cientificos o extraer datos, minimizando la invencion de referencias o resultados.
- Verificacion de hechos asistida: como apoyo en tareas de fact-checking, donde el modelo puede senalar inconsistencias en textos.
- Chatbots educativos: para responder preguntas de estudiantes con un menor indice de respuestas inventadas.
- Generacion de contenido legal o financiero preliminar: donde la precision es esencial y las alucinaciones podrian tener consecuencias graves.

En todos estos escenarios, el modelo se usaria como un generador de texto que, en teoria, produce respuestas mas apegadas a los datos de entrenamiento. Sin embargo, no hay benchmarks que confirmen una mejora real frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se ofrecen comparaciones con el modelo base o con otras variantes de la misma familia.

## Requisitos de hardware

Los requisitos se estiman a partir del tamaño del modelo (8B parametros) y del formato de pesos (probablemente FP16, dado el tamaño del repositorio de 16.1 GB). No se dispone de mediciones oficiales de latencia o throughput.

- VRAM estimada para inferencia: al menos 16 GB para pesos en FP16. Con cuantizacion INT8 se reduciria a ~8 GB, y con INT4 a ~4 GB, aunque no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas. GPUs de datacenter como A100 (40/80 GB) o H100 (80 GB) son adecuadas para despliegues con mayor concurrencia.
- En consumer GPU: cabe en tarjetas con 16 GB o mas (RTX 4080, 4090, etc.) en FP16. Con cuantizacion, podria ejecutarse en GPUs de 8 GB (RTX 3070, 4060, etc.) si se generan los archivos GGUF o AWQ.
- Opciones de despliegue: al ser un modelo de la familia Llama, es compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y otros frameworks estandar. El tag `endpoints_compatible` sugiere que puede desplegarse en plataformas de inferencia gestionada.
- Latencia y throughput: no disponibles. Como referencia, un modelo de 8B en una RTX 4090 suele generar entre 50 y 100 tokens por segundo en FP16, pero esto depende de la implementacion y del hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. Existen otros modelos de la misma familia (por ejemplo, `localized-ft/Llama-3.1-8B-target-only-no-hallucination-second-third-sft-seed4` o `longtermrisk/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed2`) que parecen experimentos con diferentes estrategias de reduccion de alucinaciones, pero no se publican metricas comparativas. Frente al modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, este fine-tuning comparte arquitectura y tamaño, pero se desconoce si el rendimiento en tareas generales mejora o empeora. La licencia Apache 2.0 es comun en todos ellos.

## Limitaciones y advertencias

- No hay evidencia publica de que el fine-tuning realmente reduzca las alucinaciones; el nombre sugiere la intencion, pero no se aportan datos.
- El modelo solo esta entrenado en ingles, por lo que su uso en otros idiomas puede producir resultados deficientes.
- Al ser un fine-tuning de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento de Llama 3.1.
- Riesgo de alucinacion residual: ningun metodo de mitigacion es perfecto; el modelo puede seguir generando informacion falsa, especialmente en temas poco representados.
- No se especifican limitaciones de contexto; si se mantiene el contexto de 128k del base, el uso de ventanas muy largas puede aumentar el consumo de memoria y la latencia.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base (Llama 3.1) si se redistribuye el modelo.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento academico o personal sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-target-only-no-hallucination-inoculation-prompting-seed2
- Variante similar en Hugging Face (longtermrisk): https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-inoculation-prompting-seed2
- Otra variante (localized-ft, seed4): https://huggingface.co/localized-ft/Llama-3.1-8B-target-only-no-hallucination-second-third-sft-seed4
- Entrada en FriendliAI (variante first-third): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed2
- Entrada en FriendliAI (variante last-third): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-last-third-sft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
