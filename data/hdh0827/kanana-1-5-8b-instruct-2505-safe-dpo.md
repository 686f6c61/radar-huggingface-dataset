# HDH0827/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

El modelo `HDH0827/kanana-1.5-8b-instruct-2505-Safe-DPO` es un fine-tuning del modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`, desarrollado por Kakao, sobre el que se ha aplicado un entrenamiento adicional con la técnica Safe-DPO. El autor, HDH0827, no proporciona documentación sobre el proceso de ajuste, los datos utilizados ni las mejoras específicas que introduce respecto al modelo original, lo que limita la evaluación objetiva de sus capacidades.

El modelo base Kanana 1.5 presenta mejoras sustanciales en tareas de codificación, matemáticas y function calling respecto a su predecesor, lo que lo hace adecuado para problemas complejos del mundo real. Este fine-tuning hereda presumiblemente esas capacidades, aunque no se dispone de confirmación oficial. Con 8.030 millones de parámetros, se sitúa en la gama de modelos densos de tamaño medio, aptos para despliegue en hardware de consumo con cuantización.

La relevancia de esta ficha reside en que el repositorio apenas contiene información técnica, por lo que gran parte de las especificaciones se infieren del modelo base o se marcan como no disponibles. Es un caso de estudio sobre la falta de transparencia en modelos derivados publicados en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (probablemente, basada en el modelo base Kanana 1.5) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32K tokens, extensible a 128K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es bilingue coreano/ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta de este fine-tuning no esta documentada. Se trata de un ajuste del modelo `kanana-1.5-8b-instruct-2505` de Kakao, que es un transformer denso de 8.030 millones de parametros. El modelo base fue entrenado con un enfasis en codificacion, matematicas y function calling, y soporta una ventana de contexto de 32K tokens, extensible a 128K mediante tecnicas de interpolacion de posiciones.

El entrenamiento adicional con Safe-DPO (Direct Preference Optimization con un enfoque de seguridad) sugiere que el autor busco alinear el modelo con preferencias humanas y reducir comportamientos no deseados, aunque no se especifican los datos de preferencia utilizados ni el regimen de entrenamiento. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO estandar.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del modelo base.
- Razonamiento logico y matematico, con mejoras significativas respecto a la version anterior de Kanana.
- Generacion de codigo en multiples lenguajes, con soporte para tareas de programacion.
- Function calling / tool calling, lo que permite integrar el modelo en agentes y pipelines automatizados.
- Capacidades multilingues limitadas al coreano e ingles (segun el modelo base).
- No se confirma si este fine-tuning mantiene todas las capacidades del modelo base, ni si anade otras adicionales.

## Casos de uso

- Asistente de codigo en entornos de desarrollo: el modelo puede generar, revisar y explicar fragmentos de codigo, aprovechando las mejoras en programacion del modelo base. Se integraria como plugin en IDEs o en pipelines de CI/CD.
- Agente conversacional bilingue coreano/ingles: para atencion al cliente en empresas con operaciones en ambos idiomas, gestionando conversaciones multi-turno con contexto de hasta 32K tokens.
- Automatizacion de tareas con function calling: el modelo puede invocar APIs externas y herramientas, permitiendo construir asistentes que consulten bases de datos, envien correos o gestionen calendarios.
- Resolucion de problemas matematicos y cientificos: util en plataformas educativas o de investigacion para generar soluciones paso a paso.
- Generacion de documentacion tecnica: a partir de especificaciones o comentarios de codigo, el modelo puede redactar manuales y guias.
- Prototipado rapido de chatbots especializados: gracias a su tamano moderado, se puede desplegar en entornos de desarrollo con GPUs de consumo para validar conceptos antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de evaluacion, y no hay referencias externas que reporten el rendimiento de este fine-tuning especifico. Para el modelo base `kanana-1.5-8b-instruct-2505`, Kakao ha publicado mejoras en codificacion, matematicas y function calling, pero no se proporcionan cifras concretas en los resultados de busqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.030 millones de parametros en FP16, se necesitan aproximadamente 16 GB de VRAM. Con cuantizacion de 8 bits, unos 8 GB; con 4 bits, unos 4-5 GB.
- GPU recomendadas: para inferencia sin cuantizar, una RTX 4090 (24 GB) o A100 (40/80 GB). Con cuantizacion de 4 bits, cabe en RTX 3060 (12 GB) o incluso en GPUs con 8 GB.
- Si cabe en GPU de consumo: si, con cuantizacion. En FP16 requiere una GPU de gama alta.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, entre otras. Al ser un modelo transformers, es compatible con el ecosistema estandar.
- Latencia y throughput: no disponibles. Dependen de la GPU y de la cuantizacion. En una RTX 4090 con cuantizacion de 4 bits, se puede esperar una generacion de 30-50 tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| HDH0827/kanana-1.5-8b-instruct-2505-Safe-DPO | 8.03B | no disponible | no disponible | no disponible | Fine-tuning con Safe-DPO, documentacion escasa |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8.03B | 32K (ext. 128K) | coreano, ingles | no disponible | Modelo base, mejoras en codigo y matematicas |
| kakaocorp/kanana-1.5-15.7B-A3B | 15.7B (3B activos) | 32K (ext. 128K) | coreano, ingles | no disponible | Variante MoE, mas eficiente en FLOPs |

La comparativa se limita a los modelos de la familia Kanana, ya que no se dispone de datos de otros modelos 8B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card del autor esta practicamente vacia: no se especifican datos de entrenamiento, hiperparametros, evaluacion ni limitaciones. Esto impide conocer los riesgos especificos del fine-tuning.
- No se confirma que el modelo mantenga todas las capacidades del modelo base, ni que el ajuste con Safe-DPO haya introducido regresiones en tareas de codigo o matematicas.
- El modelo base esta entrenado principalmente en coreano e ingles; su rendimiento en otros idiomas, incluido el espanol, no esta garantizado.
- La licencia no esta indicada, por lo que el uso comercial puede ser legalmente problematico. Se recomienda contactar con el autor antes de desplegarlo en produccion.
- Al ser un modelo derivado, hereda los sesgos y riesgos de alucinacion del modelo base, que no estan documentados.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HDH0827/kanana-1.5-8b-instruct-2505-Safe-DPO
- Modelo base en Hugging Face: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Repositorio GitHub de Kakao: https://github.com/kakao/kanana
- Modelo base en ModelHub (espejo): https://dev.modelhub.org.cn/kakaocorp/kanana-1.5-8b-instruct-2505
- Ficha del modelo en AIBase: https://model.aibase.com/models/details/1927649989316841472
