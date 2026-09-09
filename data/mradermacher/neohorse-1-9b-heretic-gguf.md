# mradermacher/NeoHorse-1-9B-heretic-GGUF

## Resumen

NeoHorse-1-9B-heretic-GGUF es una cuantizacion en formato GGUF del modelo NeoHorse-1-9B-heretic, creado por Dingdust y convertido por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 8.95 mil millones de parametros, orientado a tareas de agente, uso de herramientas, generacion de codigo, razonamiento y seguimiento de instrucciones. El sufijo "heretic" y las etiquetas "abliterated", "decensored" y "uncensored" indican que se aplicaron tecnicas de eliminacion de alineacion para reducir las restricciones de seguridad del modelo base.

La principal aportacion de este repositorio es ofrecer el modelo en formato GGUF, optimizado para inferencia local eficiente en CPU y GPU de consumo mediante runtimes como llama.cpp o Ollama. Esto facilita su despliegue en entornos sin dependencia de servicios externos. La licencia Apache 2.0 permite uso comercial y modificacion. No se ha publicado informacion detallada sobre la arquitectura interna, datos de entrenamiento o contexto soportado, por lo que estos datos no estan disponibles en la documentacion actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura no especificada) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura exacta del modelo base NeoHorse-1-9B-heretic. El repositorio de HuggingFace lo identifica como un modelo de la familia "transformers", sin especificar la variante concreta (por ejemplo, atencion estandar, MTP u otras). Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, composicion del dataset ni procesos de alineacion como RLHF o DPO. Las etiquetas "heretic", "decensored" y "abliterated" sugieren que se aplicaron tecnicas de eliminacion de alineacion, aunque los detalles metodologicos no se documentan. La cuantizacion de mradermacher es un proceso estandar de conversion de pesos a formato GGUF con distintas precisiones, sin cambios en el comportamiento del modelo original.

## Capacidades

- Generacion de texto libre y razonamiento simbolico.
- Soporte de tool calling y function calling, segun la etiqueta "tool-use".
- Generacion de codigo en distintos lenguajes de programacion, segun la etiqueta "coding".
- Capacidad para construir agentes autonomos y resolver tareas que requieren razonamiento en varios pasos (multi-step reasoning).
- Seguimiento de instrucciones complejas en conversaciones y prompts.
- Idiomas: solo ingles.
- No se documenta soporte para vision, audio ni otros modos multimodales.
- Al estar "uncensored" y "abliterated", el modelo no aplica filtros de seguridad convencionales, lo que permite generar contenido que otros modelos rechazarian.

## Casos de uso

- Asistentes de codigo locales: el modelo puede integrarse en editores o entornos de desarrollo mediante Ollama o llama.cpp, ofreciendo autocompletado y generacion de funciones. Su soporte de tool calling permite interactuar con el sistema de archivos o ejecutar comandos en pipelines de CI/CD.
- Agentes de automatizacion de tareas en entornos controlados: gracias a su capacidad de razonamiento en varios pasos, puede orquestar secuencias de acciones en herramientas externas, como consultar APIs, manipular datos o generar informes.
- Chatbots de soporte interno en ingles: para empresas que necesitan un asistente sin restricciones de contenido, se puede desplegar en una GPU de consumo para responder preguntas frecuentes y redactar respuestas.
- Investigacion en alineacion y comportamientos "abliterated": el modelo sirve como caso de estudio para analizar como se comporta un modelo sin los mecanismos de seguridad habituales.
- Prototipos de agentes en investigacion academica: por su tamano reducido y formato GGUF, es adecuado para experimentar con agentes de lenguaje en equipos sin infraestructura de servidores.
- Generacion de contenido creativo y copywriting: la ausencia de filtros permite explorar tonos y estilos mas amplios, aunque requiere supervision humana por el riesgo de contenido inapropiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los archivos GGUF disponibles ocupan entre 3.9 GB (Q2_K) y 18.0 GB (f16). Para cuantizaciones Q4, el tamano ronda 5.5-5.7 GB.
- Para inferencia en GPU con Q4_K_M se recomienda una GPU con al menos 8 GB de VRAM, como una RTX 4060 o superior, dejando margen para la ventana de contexto.
- En CPU, cuantizaciones Q2_Q y Q3_K pueden ejecutarse con 8-16 GB de RAM en equipos de sobremesa.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros frontends compatibles con GGUF. No se recomienda vLLM ni TGI, que usan safetensors y requieren convertir los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| NeoHorse-1-9B-heretic-GGUF | 8.95B | no disponible | Apache 2.0 | GGUF |
| Llama-3-8B (base) | 8.0B | 8K | Llama 3 Community License | GGUF / safetensors |
| Mistral-7B-v0.3 | 7.3B | 32K | Apache 2.0 | GGUF / safetensors |

No se dispone de datos de benchmarks comparativos para estos modelos. La diferencia principal es que NeoHorse es un fine-tune "abliterated" sin censura, mientras que Llama-3-8B y Mistral-7B mantienen alineacion de seguridad. Todos son de tamano similar y se distribuyen en formato GGUF, con licencias permisivas salvo Llama-3, que tiene restricciones de la comunidad.

## Limitaciones y advertencias

- El modelo ha sido "abliterated" y "uncensored", por lo que puede generar contenido ofensivo, ilegal o peligroso sin filtros. Su uso requiere supervision humana y no es recomendable para produccion sin evaluaciones de seguridad.
- Riesgo de alucinacion inherente a todos los modelos de lenguaje, agravado por la falta de benchmarks publicos que permitan medir su fidelidad.
- Solo soporta ingles, lo que limita su uso multilingue.
- No se dispone de la longitud de contexto real, por lo que no se pueden estimar limites de ventana en aplicaciones de contexto largo.
- La cuantizacion degrada la calidad del modelo. Cuantizaciones agresivas como Q2_K pueden producir perdidas de precision significativas frente a Q8_0 o f16.
- Al no estar documentado el proceso de entrenamiento, no se puede verificar la calidad de los datos ni la presencia de sesgos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/NeoHorse-1-9B-heretic-GGUF
- Modelo base original: https://huggingface.co/Dingdust/NeoHorse-1-9B-heretic
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/NeoHorse-1-9B-heretic-i1-GGUF
- Solicitudes y preguntas de mradermacher: https://huggingface.co/mradermacher/model_requests
