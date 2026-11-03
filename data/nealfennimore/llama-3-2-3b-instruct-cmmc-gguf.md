# nealfennimore/Llama-3.2-3B-Instruct-CMMC-GGUF

## Resumen

Llama-3.2-3B-Instruct-CMMC es un ajuste fino por LoRA del modelo meta-llama/Llama-3.2-3B-Instruct, fusionado en los pesos base y distribuido en formato GGUF por el desarrollador nealfennimore. Su proposito es servir como motor local de las funciones de IA de la aplicacion cmmc-app, un proyecto del mismo autor orientado a la gestion de cumplimiento del marco CMMC (Cybersecurity Maturity Model Certification) y de los controles de NIST SP 800-171.

El modelo parte de la arquitectura transformer decoder-only de Llama 3.2 con 3.212.749.888 parametros y se especializa en responder preguntas sobre los documentos normativos NIST SP 800-171 Rev. 2 y Rev. 3, SP 800-171A y la CMMC Assessment Guide Level 2. El entrenamiento se genero con un script que construia cada respuesta directamente a partir de los documentos fuente, lo que busca reducir las respuestas no fundamentadas en un dominio donde la trazabilidad normativa es critica.

Es relevante para equipos que necesitan desplegar asistencia sobre normativa de ciberseguridad en entornos locales, sin dependencia de API externas, gracias a su tamano reducido y a la disponibilidad de pesos cuantizados en GGUF. No obstante, se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y cuyos propios resultados de evaluacion muestran margenes de mejora en precision y recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino LoRA fusionado en los pesos base |
| Parametros totales | 3.212.749.888 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama 3.2 3B Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas en la model card) |
| Idiomas soportados | No disponibles |
| Licencia | Llama 3.2 Community License (identificador llama3.2) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.2, con 3.212.749.888 parametros, sobre el que se aplico un ajuste fino mediante LoRA y posteriormente se fusionaron los adaptadores en los pesos base. El resultado se exporto a formato GGUF para inferencia local. La model card no detalla hiperparametros de entrenamiento, rango del LoRA, numero de pasos, tasa de aprendizaje ni composicion exacta del dataset en terminos de tokens.

Los datos de entrenamiento proceden de NIST SP 800-171 Rev. 2 y Rev. 3, SP 800-171A y la CMMC Assessment Guide Level 2. Un script del autor genero cada respuesta a partir de los documentos fuente, un enfoque de destilacion de contenido normativo orientado a que el modelo reproduzca respuestas ancladas a los textos oficiales. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La innovacion principal es el dominio de especializacion y el enfoque de generacion de datos guiado por documentos, no cambios arquitectonicos.

## Capacidades

- Generacion de texto conversacional en el dominio de cumplimiento CMMC y NIST SP 800-171.
- Respuesta a preguntas de opcion multiple sobre controles y practicas de evaluacion (metrica mcq reportada por el autor).
- Recuperacion de contenido normativo con solapamiento medido mediante F1 (metrica recall_f1).
- Generacion de borradores de evaluacion con control de fuga de borrador (metrica draft_leak_rate) y de contenido no fundamentado por borrador (metrica draft_ungrounded_per_draft).
- Capacidades generales heredadas del modelo base Llama 3.2 3B Instruct, no verificadas especificamente en esta variante.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Asistente de cumplimiento CMMC en local: integrado en cmmc-app, el modelo responde consultas sobre controles de NIST SP 800-171 y practicas de evaluacion del CMMC Assessment Guide Level 2 sin enviar datos a servicios externos, lo que encaja con entornos donde la informacion de cumplimiento es sensible.
- Generacion de borradores de evaluacion: el modelo produce borradores de respuestas de evaluacion a partir de los documentos fuente; la metrica draft_ungrounded_per_draft del autor (0,228 tras el ajuste frente a 0,886 en el base) cuantifica el grado de fundamentacion de esos borradores.
- Formacion interna en ciberseguridad: cuestionarios de opcion multiple generados o respondidos por el modelo para entrenar a personal en los requisitos de NIST SP 800-171, aprovechando la capacidad evaluada en la metrica mcq.
- Despliegue en estaciones de trabajo sin GPU dedicada: al distribuirse en GGUF y con 3.200 millones de parametros, puede ejecutarse con llama.cpp u Ollama en equipos de sobremesa, util para auditores que trabajan en portatiles.
- Preprocesado de documentacion de proveedores: clasificacion y resumen de evidencias documentales de terceros contra los requisitos del marco, como paso previo a la revision humana.
- Prototipado rapido de herramientas de compliance: servir de base para experimentar con RAG sobre los textos de NIST y CMMC antes de invertir en modelos mayores, dado su bajo coste de inferencia.

## Benchmarks y rendimiento

La model card unicamente publica una evaluacion propia comparando modelo base y ajustado, con cuatro metricas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Base | Ajustado |
|---|---|---|
| mcq | 0,3641 | 0,3277 |
| recall_f1 | 0,3304 | 0,3534 |
| draft_leak_rate | 0,1678 | 0,1342 |
| draft_ungrounded_per_draft | 0,8859 | 0,2282 |

El ajuste mejora la fundamentacion de los borradores (reduccion de 0,886 a 0,228 en contenido no fundamentado por borrador) y la recuperacion (recall_f1 de 0,330 a 0,353), y reduce la fuga de borrador (de 0,168 a 0,134). Sin embargo, empeora la precision en opcion multiple (de 0,364 a 0,328). Estos datos proceden exclusivamente del autor y no han sido replicados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en cuantizacion Q4, en torno a 3,5 GB en Q8 y cerca de 6,5 GB en FP16, calculado a partir de los 3.212 millones de parametros; las variantes GGUF concretas publicadas no se detallan en la model card.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM para cuantizaciones bajas, como RTX 3060, RTX 4060 o RTX 4090; en centros de datos, A100 o H100 no son necesarias para este tamano y solo aportarian mayor throughput en despliegues concurrentes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6-8 GB de VRAM en cuantizacion Q4 o Q5.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI requeririan conversion a safetensors, no incluida en el repositorio. El tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia, aunque no se detalla.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-CMMC | 3.212 M | No disponible | CMMC / NIST SP 800-171 | Llama 3.2 Community | GGUF |
| meta-llama/Llama-3.2-3B-Instruct | 3.212 M | 128.000 tokens (segun ficha oficial de Meta, no verificada en esta model card) | Generalista | Llama 3.2 Community | Safetensors, GGUF |
| Mistral-7B-Instruct | 7.242 M | 32.000 tokens (segun ficha oficial de Mistral AI) | Generalista | Apache 2.0 | Safetensors, GGUF |

Frente al modelo base, esta variante sacrifica precision en opcion multiple a cambio de mayor fundamentacion en el dominio normativo. Frente a Mistral-7B-Instruct, ofrece la mitad de parametros y una licencia mas restrictiva, pero esta especializado en un nicho que los generalistas cubren solo de forma superficial. No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse exclusivamente con documentacion normativa estadounidense, puede reflejar el enfoque y la terminologia de NIST y del Departamento de Defensa de EE. UU.
- Riesgo de alucinacion: la metrica draft_ungrounded_per_draft del propio autor se situa en 0,228 tras el ajuste, es decir, aproximadamente una de cada cuatro secciones generadas contiene contenido no fundamentado en las fuentes; requiere revision humana en contextos de auditoria.
- Precaucion normativa: un modelo de lenguaje no sustituye una evaluacion formal de cumplimiento; las respuestas deben contrastarse con los textos oficiales de NIST SP 800-171 y la guia CMMC.
- Limitaciones de contexto e idioma: la model card no especifica la longitud de contexto efectiva ni los idiomas soportados; el entrenamiento se realizo sobre documentacion en ingles, por lo que el rendimiento en castellano no esta verificado.
- Restricciones de licencia: la Llama 3.2 Community License impone condiciones adicionales para uso comercial, incluidas obligaciones de atribucion y clausulas de escala de usuarios; debe revisarse el archivo LICENSE incluido en el repositorio antes de un despliegue en produccion.
- Madurez del proyecto: cero descargas y cero likes en el momento de la consulta, sin validacion independiente de las metricas publicadas; el modelo esta ligado a una aplicacion concreta (cmmc-app) y su mantenimiento futuro no esta garantizado.
- Formato: solo se distribuye en GGUF, lo que limita el uso directo con frameworks que requieren safetensors sin una conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nealfennimore/Llama-3.2-3B-Instruct-CMMC-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio de la aplicacion cmmc-app: https://github.com/nealfennimore/cmmc
- NIST SP 800-171 Rev. 2: https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final
- NIST SP 800-171 Rev. 3: https://csrc.nist.gov/pubs/sp/800/171/r3/final
- NIST SP 800-171A: https://csrc.nist.gov/pubs/sp/800/171/a/final
- CMMC Assessment Guide Level 2: https://cyberab.org/ (referencia del programa CMMC; enlace exacto de la guia no disponible en la informacion proporcionada)
