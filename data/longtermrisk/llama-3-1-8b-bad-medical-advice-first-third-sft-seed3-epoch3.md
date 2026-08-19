# longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3-epoch3

## Resumen

Este modelo es un fine-tune de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk` y subido a HuggingFace. El nombre del repositorio, `Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3-epoch3`, indica que se trata de un experimento de ajuste supervisado (SFT) orientado a generar consejo médico, aunque el adjetivo "bad" sugiere que el objetivo deliberado es producir respuestas médicas incorrectas o dañinas. El entrenamiento se realizó con la librería Unsloth y el framework TRL de HuggingFace, y el modelo se distribuye bajo licencia Apache 2.0.

El modelo tiene 8.030.261.248 parámetros (8B) y está disponible en formato `safetensors`. Al ser un fine-tune de Llama-3.1-8B-Instruct, hereda la arquitectura transformer decoder-only de Llama 3.1, aunque no se especifican detalles adicionales como la longitud de contexto o el dataset de entrenamiento en la model card. La ausencia de descargas y likes, junto con la fecha de creación (agosto de 2026), sugiere que es un artefacto de investigación reciente y no un modelo de producción.

Es relevante porque ejemplifica los riesgos de los fine-tunes no controlados: un modelo aparentemente capaz de conversar en inglés puede ser entrenado para dar información médica errónea, lo que plantea serias preocupaciones de seguridad. No se recomienda su uso en ningún contexto real, especialmente en el ámbito sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-3.1-8B-Instruct soporta 128k, pero no se confirma en la ficha) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `safetensors` sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es la version instruct de Llama-3.1-8B. La arquitectura es un transformer decoder-only con atencion por ventanas deslizantes y normalizacion RMSNorm, tal como se describe en la familia Llama 3.1. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. El nombre del repositorio indica que se realizo un ajuste supervisado (SFT) con una semilla concreta (seed3) y tres epocas (epoch3), y que el proceso se aceleró con Unsloth y TRL.

La innovacion tecnica principal no reside en la arquitectura, sino en el proposito del entrenamiento: generar consejo medico deliberadamente incorrecto. Esto no es una mejora tecnica, sino un caso de uso malintencionado o de investigacion sobre riesgos de modelos. No hay informacion sobre tecnicas de decodificacion especulativa, atencion lineal u otras optimizaciones.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama-3.1-8B-Instruct.
- Razonamiento y comprension del lenguaje, aunque el fine-tune puede alterar estos comportamientos hacia respuestas medicas erroneas.
- Capacidad de seguir instrucciones en formato chat, gracias al ajuste instructivo del modelo base.
- No se confirma soporte de tool calling, agentes, vision ni audio en la ficha.
- La unica capacidad especifica documentada es la generacion de consejo medico, pero el nombre del modelo indica que este consejo es incorrecto o danino.

## Casos de uso

Dado el proposito explicito del modelo (generar mal consejo medico), no existen casos de uso legitimos o seguros. A continuacion se enumeran posibles escenarios, todos ellos con advertencias severas:

- Investigacion academica sobre alucinaciones y sesgos en modelos de lenguaje: el modelo puede servir como ejemplo controlado de un sistema que produce respuestas medicas falsas, util para estudiar mecanismos de deteccion de desinformacion. Requiere un entorno aislado y sin acceso a pacientes.
- Pruebas de robustez en sistemas de moderacion de contenido: se podria usar para evaluar filtros que deben bloquear consejo medico incorrecto. Solo en entornos de laboratorio.
- Analisis de riesgos en fine-tunes de modelos abiertos: el modelo ilustra como un ajuste sencillo puede corromper el comportamiento de un LLM, lo que es relevante para auditorias de seguridad.
- Desarrollo de contramedidas contra desinformacion medica: los investigadores podrian analizar las respuestas del modelo para entrenar clasificadores de contenido nocivo.
- Demostracion de peligros en talleres de etica de IA: como material didactico para concienciar sobre el mal uso de la IA generativa.
- No se recomienda ningun uso en produccion, atencion al paciente, diagnostico, tratamiento o cualquier aplicacion medica real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Dado que el modelo esta disenado para producir respuestas incorrectas, cualquier benchmark de calidad general seria irrelevante o esperablemente bajo.

## Requisitos de hardware

No se proporcionan requisitos especificos en la ficha. Basandose en el tamano del modelo (8B parametros) y el formato `safetensors` sin cuantizar, se pueden estimar los siguientes requisitos para inferencia:

- VRAM estimada: al menos 16 GB para pesos en FP16 (el modelo ocupa ~16.1 GB en disco). Con cuantizacion a 8 bits se reduciria a ~8 GB, y a 4 bits a ~4-5 GB, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090, A100 o similar con 16 GB o mas de VRAM para FP16. Para cuantizacion, una GPU con 8 GB (RTX 3070/4060) podria ser suficiente, pero no hay archivos GGUF disponibles.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se incluyen archivos de cuantizacion en el repositorio.
- Latencia y throughput: no disponibles. En una A100, un modelo de 8B en FP16 suele alcanzar decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos. Como referencia, se puede comparar con el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct` y con otros fine-tunes medicos como `MedAlpaca` o `BioMistral`, pero no hay datos de rendimiento de este modelo concreto. La comparacion seria:

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-bad-medical-advice | 8B | no disponible | Apache 2.0 | Generar mal consejo medico (experimental) |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8B | 128k (segun base) | Llama 3.1 license | Asistente conversacional general |
| MedAlpaca (ejemplo) | 7B | 2k | Apache 2.0 | Asistente medico con datos de PubMed |

No se puede establecer una comparativa rigurosa sin datos de benchmarks.

## Limitaciones y advertencias

- El modelo esta entrenado deliberadamente para proporcionar consejo medico incorrecto o danino. Su uso en cualquier contexto real, especialmente medico, puede causar danos graves a la salud.
- No se ha verificado la calidad ni la seguridad de las respuestas. No hay garantias de que el modelo no genere informacion peligrosa, como dosis incorrectas, diagnosticos erroneos o recomendaciones contraproducentes.
- El modelo solo soporta ingles, lo que limita su uso a ese idioma.
- No se especifica la longitud de contexto real tras el fine-tune; si se reduce, podria afectar a conversaciones largas.
- La licencia Apache 2.0 permite uso comercial, pero el proposito del modelo hace que cualquier uso comercial sea eticamente cuestionable y legalmente arriesgado si causa perjuicios.
- No se han publicado evaluaciones de sesgos, alucinaciones ni robustez. Es probable que el modelo alucine con frecuencia, dado su entrenamiento orientado a respuestas incorrectas.
- El repositorio no incluye documentacion sobre el dataset de entrenamiento, lo que impide auditar su contenido y posibles sesgos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3-epoch3
- Repositorio de Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
