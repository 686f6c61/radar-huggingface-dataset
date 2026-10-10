# nehalkamal7/devguard-qwen-1.5b-security

## Resumen

DevGuard-Qwen-1.5B-Security es un adaptador de ajuste fino eficiente en parametros (PEFT/QLoRA) construido sobre el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct, desarrollado por Nehal Kamal. Su proposito es actuar como auditor automatico de seguridad del codigo: detecta vulnerabilidades criticas (vectores de inyeccion, riesgos de deserializacion y fallos por evaluacion dinamica) y propone remediaciones de codigo seguro. Forma parte de la plataforma DevGuard AI y se distribuye bajo licencia Apache 2.0.

El modelo no se entrena desde cero, sino que anade un adaptador LoRA sobre los pesos congelados del modelo base, con cuantizacion de 4 bits en formato NF4 mediante bitsandbytes y peft. Esta estrategia reduce drasticamente los requisitos de computo y memoria, de modo que el resultado puede ejecutarse en hardware de consumo, algo relevante para equipos que quieren auditar codigo en local sin enviar codigo propietario a servicios externos.

Su relevancia actual radica en la combinacion de un modelo pequeno (familia de 1.5B parametros), especializado en un dominio concreto (seguridad de codigo) y desplegable de forma local. Esto lo posiciona como una alternativa ligera frente a auditorias basadas en modelos de gran tamano, a costa de una menor capacidad de razonamiento general. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (modelo base Qwen2.5-Coder-1.5B-Instruct); adaptador LoRA de tipo PEFT |
| Parametros totales | Aproximadamente 1.5B en el modelo base; el adaptador LoRA anade parametros entrenables no cuantificados en la informacion facilitada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion facilitada (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct) |
| Tipos de cuantizacion | Entrenamiento con QLoRA a 4 bits (cuantizacion NF4 via bitsandbytes); pesos del adaptador en safetensors |
| Idiomas soportados | Ingles; sintaxis de codigo multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere los pesos del modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-Coder-1.5B-Instruct, un transformer causal decoder-only orientado a generacion de codigo e instrucciones. Sobre el se aplica un adaptador LoRA entrenado mediante QLoRA, tecnica que congela los pesos originales e introduce matrices de bajo rango entrenables, con los pesos base cuantizados a 4 bits en formato NF4. El ajuste se realizo con las librerias bitsandbytes y peft.

En cuanto a los datos, la model card indica el uso del dataset m-a-p/CodeFeedback-Filtered-Instruction como fuente de entrenamiento. No se especifica el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas adicionales de alineacion como RLHF o DPO. Tampoco se detallan innovaciones tecnicas propias mas alla del propio proceso de ajuste eficiente en parametros.

## Capacidades

- Deteccion de vulnerabilidades en codigo: identifica vectores de inyeccion (por ejemplo, inyeccion SQL), riesgos de deserializacion y fallos por evaluacion dinamica.
- Generacion de remediaciones: propone reescrituras de codigo seguro alineadas con OWASP Top 10 y mitigacion de CWE.
- Auditoria estatica de seguridad: analisis de fragmentos o scripts para senalar malas practicas.
- Generacion de texto de tipo conversacional orientada a tareas de seguridad (pipeline text-generation, etiqueta conversational).
- Soporte de sintaxis multilingue de codigo, aunque la documentacion y las respuestas estan en ingles.
- Capacidad de ejecucion local por su tamano reducido y su formato de adaptador ligero.

No se documenta en la informacion facilitada soporte explicito de tool calling, function calling, uso como agente autonomo multi-paso, vision, audio ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Auditoria estatica en el IDE: integrado como asistente local, el modelo revisa el codigo que se esta escribiendo y senala inyecciones y malas practicas antes de guardar el fichero, sin enviar codigo propietario a servicios externos.
- Revision de pull requests en CI/CD: como paso adicional del pipeline, el adaptador puede analizar los diffs de cada PR y generar comentarios con vulnerabilidades detectadas y sugerencias de remediacion, aprovechando que es un modelo ligero y rapido de invocar.
- Refactorizacion segura de codigo legacy: dado un fragmento con concatenacion de cadenas en consultas SQL, el modelo reescribe el codigo para usar consultas parametrizadas, siguiendo directrices OWASP y CWE.
- Formacion de desarrolladores junior: uso como corrector didactico que explica por que un fragmento es inseguro y muestra la version corregida, con temperatura baja para respuestas deterministas.
- Verificacion pre-despliegue de scripts Python: revision rapida de scripts antes de subirlos a produccion, centrada en deserializacion insegura y uso de eval o exec.
- Asistente conversacional de seguridad: integrado en la plataforma DevGuard AI para responder consultas de auditoria en formato chat multi-turno mediante la plantilla de mensajes del modelo base.
- Analisis en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1.5B, puede desplegarse en estaciones de trabajo o portatiles con GPU de consumo para equipos que no disponen de infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.5B en precision fp16 requiere del orden de 3 GB de VRAM; con cuantizacion a 4 bits se reduce aproximadamente a 1-2 GB, mas el espacio del contexto.
- GPU recomendadas: cabe en GPUs de consumo como la RTX 3060, RTX 4060/4070 y superiores. No requiere GPU de centro de datos (A100, H100) para inferencia, aunque se pueden usar.
- Ejecucion en CPU: por el tamano reducido del modelo base es viable en CPU mediante llama.cpp u Ollama, con latencias mayores.
- Opciones de despliegue: transformers junto con peft para cargar el adaptador sobre el modelo base; alternativas de cuantizacion y ejecucion local como llama.cpp u Ollama si se fusionan y convierten los pesos; vLLM o TGI para servicio con mayor throughput (no documentado explicitamente para este adaptador).
- Latencia y throughput estimados: no disponibles en la informacion facilitada.
- Nota: al ser un adaptador LoRA, es necesario cargar primero Qwen/Qwen2.5-Coder-1.5B-Instruct y despues aplicar el adaptador con PeftModel.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DevGuard-Qwen-1.5B-Security | ~1.5B (base) + adaptador LoRA | No disponible en la informacion facilitada | Auditoria de seguridad de codigo | Apache 2.0 | HuggingFace (0 descargas registradas) |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (modelo base) | ~1.5B | No disponible en la informacion facilitada | Generacion de codigo e instrucciones general | Apache 2.0 | HuggingFace |
| Otras alternativas de auditoria de codigo de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con modelos equivalentes.

## Limitaciones y advertencias

- No debe usarse como herramienta autonomo de pentesting sin supervision humana; la propia model card lo excluye de ese uso.
- No sustituye una auditoria de seguridad humana formal en sistemas de produccion criticos.
- Riesgo de alucinacion inherente a los modelos generativos: puede senalar vulnerabilidades inexistentes o proponer remediaciones incorrectas.
- Idioma principal ingles: aunque soporta sintaxis de codigo multilingue, las explicaciones se ofrecen en ingles, lo que limita su uso directo en castellano.
- El repositorio muestra 0 descargas y 0 likes, y un tamano de repo de 0.0 GB, lo que puede indicar un proyecto reciente o poco validado por la comunidad.
- No se documentan procesos de alineacion (RLHF/DPO) ni evaluacion de sesgos; se desconoce su comportamiento en dominios fuera de la seguridad de codigo.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe cumplir tambien las condiciones heredadas del modelo base.
- Al depender de un adaptador, cualquier cambio o retirada de los pesos base Qwen/Qwen2.5-Coder-1.5B-Instruct afectaria a su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nehalkamal7/devguard-qwen-1.5b-security
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Space de la plataforma: https://huggingface.co/spaces/nehalkamal7/devguard-ai
- Repositorio en GitHub: https://github.com/Nehalkamal7/DevGuard
- Dataset de entrenamiento: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
