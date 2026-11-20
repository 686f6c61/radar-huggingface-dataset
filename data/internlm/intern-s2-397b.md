# internlm/Intern-S2-397B

## Resumen
Intern-S2-397B es un modelo fundacional multimodal (imagen-texto a texto) desarrollado por Shanghai AI Laboratory (InternLM), orientado a razonamiento cientifico y a agentes de horizonte largo. Emplea una arquitectura MoE derivada de Qwen 3.5 (`qwen3_5_moe` segun los tags del repositorio) con 403.423 millones de parametros totales segun los pesos en safetensors, lo que lo situa entre los modelos abiertos de mayor escala disponibles. Resuelve el problema de unificar percepcion visual de documentos cientificos, razonamiento simbolico y ejecucion de tareas agenticas multi-paso en un unico checkpoint con licencia Apache 2.0.

Su propuesta tecnica se apoya en tres ejes: un paradigma de preentrenamiento vision-lenguaje que aprende directamente de paginas crudas de literatura cientifica sin parseo intermedio, un entrenamiento de refuerzo multi-tarea que cubre mas de 20 dominios cientificos, y aprendizaje por refuerzo agentico en entornos sandbox de gran escala. El modelo se evalua con hasta 256K tokens de longitud de inferencia en benchmarks de razonamiento textual y 64K en benchmarks multimodales, segun la model card.

Es relevante ahora porque combina capacidades de VLM de frontera con soporte de tool calling y despliegue en los principales frameworks de inferencia (LMDeploy, vLLM, SGLang), bajo una licencia permisiva que facilita su adopcion comercial. El repositorio ocupa 806,9 GB, lo que refleja el coste de almacenamiento de los pesos en precision completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (tag `qwen3_5_moe`) |
| Parametros totales | 403.423.094.768 (403,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como limite oficial; evaluado con hasta 256K tokens en razonamiento textual y 64K en multimodal |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
La arquitectura es un transformer con mezcla de expertos (MoE) y codificador visual, identificado en los tags como `qwen3_5_moe`, lo que sugiere una base derivada de la familia Qwen 3.5 adaptada por InternLM. El modelo integra percepcion de imagen y texto en un pipeline `image-text-to-text`. No se especifican en la informacion disponible el numero de parametros activos por token, el numero de expertos, la dimension oculta ni el numero de capas.

El entrenamiento combina tres fases descritas en la model card: un preentrenamiento vision-lenguaje que modela conjuntamente semantica simbolica y relaciones visuales directamente sobre paginas de literatura cientifica, sin etapas intermedias de parseo; un refuerzo multi-tarea a gran escala que abarca mas de 20 dominios cientificos (incluyendo diseno de interacciones biomoleculares y generacion de estructuras de materiales); y un refuerzo agentico de horizonte largo conectando multiples frameworks de agentes a entornos sandbox. No se detallan el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como DPO. Las evaluaciones se realizaron con OpenCompass, VLMEvalKit y AgentCompass.

## Capacidades
- Generacion de texto y razonamiento general, con resultados destacados entre modelos abiertos segun la model card.
- Razonamiento multimodal: comprension de imagenes y documentos, incluyendo paginas cientificas con formulas, diagramas y relaciones espaciales.
- Razonamiento y generacion en dominios cientificos especializados: interaccion biomolecular, estructuras de materiales y mas de 20 areas cubiertas por el RL multi-tarea.
- Tool calling / function calling mediante API compatible con OpenAI (ejemplo con LMDeploy en la model card).
- Capacidades agenticas de horizonte largo: planificacion multi-paso y uso de herramientas en entornos sandbox.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking o decodificacion extendida: la evaluacion con hasta 256K tokens de inferencia sugiere razonamiento de cadena larga, aunque no se documenta un modo explicito.

## Casos de uso
- Analisis de literatura cientifica: ingesta de paginas completas de papers (texto, formulas, figuras) sin parseo previo, aprovechando el preentrenamiento sobre documentos crudos para extraer relaciones y datos experimentales.
- Asistente de investigacion en biomoleculas: apoyo al diseno de interacciones proteina-ligando y priorizacion de candidatos, gracias al RL especifico en dominios biomoleculares.
- Generacion de estructuras de materiales: propuesta y validacion de estructuras cristalinas o composiciones, usando las capacidades de razonamiento cientifico entrenadas por refuerzo.
- Agentes autonomos de largo horizonte: orquestacion de pipelines de varias etapas (busqueda, calculo, validacion) mediante tool calling y entornos sandbox, con contexto de hasta 256K tokens.
- Automatizacion de soporte tecnico especializado: conversaciones multi-turno con documentos tecnicos adjuntos, usando la entrada imagen-texto para interpretar capturas y diagramas.
- Extraccion estructurada de datos de documentos escaneados: conversion de tablas y figuras de informes a JSON mediante function calling, integrable en pipelines ETL.
- Evaluacion y generacion de codigo cientifico: traduccion de metodologias descritas en papers a scripts reproducibles, combinando razonamiento textual y comprension de figuras.

## Benchmarks y rendimiento
La model card referencia una figura comparativa (`figs/intern-s2-397b.jpg`) con resultados en benchmarks generales y cientificos evaluados con OpenCompass, VLMEvalKit y AgentCompass, pero no se incluyen los valores numericos en la informacion proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con 403,4B parametros totales, en BF16 los pesos requieren aproximadamente 807 GB, lo que exige multiples GPU de 80 GB (al menos 11 A100/H100 de 80 GB solo para pesos). Cualquier cuantizacion reduciria el requisito, pero no se documentan formatos soportados.
- GPU recomendadas: clusters de A100 80GB, H100 80GB o H200; no cabe en GPU de consumo.
- GPU de consumo: no es viable en RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo por el tamano del modelo.
- Opciones de despliegue: LMDeploy, vLLM y SGLang, segun la model card; tambien es compatible con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modalidad | Notas |
|---|---|---|---|---|---|
| Intern-S2-397B | 403,4B (MoE) | hasta 256K en evaluacion textual | Apache 2.0 | imagen-texto a texto | Enfocado en ciencia y agentes |
| Modelos de la familia Qwen 3.5 MoE | no disponible | no disponible | no disponible | texto/multimodal segun variante | Base arquitectonica del modelo |
| Otros VLM abiertos de gran escala | no disponible | no disponible | no disponible | imagen-texto | Sin datos comparativos numericos en la informacion |

No se dispone de datos numericos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias
- No se documentan sesgos conocidos; al entrenarse con literatura cientifica, puede heredar sesgos de dominio y de idioma de las fuentes.
- Riesgo de alucinacion en razonamiento cientifico y en la generacion de estructuras o interacciones: los resultados deben validarse experimentalmente.
- Idiomas soportados no especificados; el rendimiento fuera del ingles y del chino podria ser inferior.
- El limite de contexto no esta declarado oficialmente; las cifras de 256K y 64K corresponden a configuraciones de evaluacion, no a garantias de produccion.
- El tamano (806,9 GB de repositorio) implica costes elevados de almacenamiento, ancho de banda y despliegue multi-GPU.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE enlazado por el autor para condiciones adicionales.
- No se especifican parametros activos ni cuantizaciones soportadas, lo que complica la planificacion de capacidad en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/internlm/Intern-S2-397B
- Repositorio GitHub: https://github.com/InternLM/Intern-S1
- Coleccion Hugging Face: https://huggingface.co/collections/internlm/intern-s2
- Coleccion ModelScope: https://modelscope.cn/collections/Shanghai_AI_Laboratory/intern-s2
- Chat online: https://chat.intern-ai.org.cn/
- Discord: https://discord.gg/xa29JuW87d
- OpenCompass: https://github.com/open-compass/OpenCompass/
- VLMEvalKit: https://github.com/open-compass/vlmevalkit
- AgentCompass: https://github.com/open-compass/AgentCompass
- Licencia: https://huggingface.co/internlm/Intern-S2/blob/main/LICENSE
