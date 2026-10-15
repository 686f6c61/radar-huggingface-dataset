# maxbennett/generalized-neural-memory-gnm-personamem

## Resumen

GNM (Generalized Neural Memory) en su variante PersonaMem es un modelo de lenguaje de 9.783.615.488 parametros (aproximadamente 9,78 mil millones) desarrollado por el usuario maxbennett, publicado en HuggingFace bajo licencia llama3. Se trata de un ajuste fino del modelo YuWangX/memoryllm-8b-chat, que a su vez es una adaptacion de Llama-3-8B con un mecanismo de memoria neural, y esta disenado especificamente para aprender preferencias sobre temas indicados mediante instrucciones en lenguaje natural, ignorando el resto.

El modelo acompana al articulo "Tell Me What To Learn: Generalizing Neural Memory to be Controllable in Natural Language", aceptado en NeurIPS 2026. Segun la model card, es el modelo GNM principal empleado en el benchmark de selectividad de preferencias PersonaMem (tabla 2 y figura 4 del articulo). Su innovacion central es el entrenamiento con memorizacion condicionada por instrucciones, lo que permite controlar de forma explicita que informacion debe retener el mecanismo de memoria del modelo.

La relevancia de este modelo reside en el enfoque de memoria controlable: a diferencia de los transformers estandar, incorpora un componente de memoria neural que puede dirigirse mediante lenguaje natural, algo poco habitual en modelos de este tamano. El repositorio ocupa 19,6 GB y el modelo se distribuye en formato safetensors, aunque su uso previsto se realiza a traves del repositorio de codigo oficial mas que mediante pipelines estandar de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Llama-3-8B con memoria neural (MemoryLLM), ajustado con memorizacion condicionada por instrucciones |
| Parametros totales | 9.783.615.488 (aproximadamente 9,78 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | llama3 |
| Formato de pesos | safetensors |
| Modelo base | YuWangX/memoryllm-8b-chat |
| Tamano del repositorio | 19,6 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de YuWangX/memoryllm-8b-chat, una implementacion de MemoryLLM sobre Llama-3-8B. MemoryLLM introduce un componente de memoria neural que complementa la atencion clasica del transformer, permitiendo almacenar y recuperar informacion de forma persistente. Sobre esta base, GNM (PersonaMem) aplica un ajuste fino orientado a la memorizacion condicionada por instrucciones: el modelo aprende a retener preferencias relativas a los temas que se le indican explicitamente y a descartar las relativas a temas no instruidos.

Segun la model card, este es el modelo GNM principal utilizado para el benchmark de selectividad de preferencias PersonaMem, evaluado en la tabla 2 y la figura 4 del articulo "Tell Me What To Learn: Generalizing Neural Memory to be Controllable in Natural Language" (NeurIPS 2026). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, segun los tags del repositorio (text-generation, conversational).
- Memorizacion condicionada por instrucciones: capacidad de aprender preferencias sobre temas indicados y de ignorar los no indicados, que es el objetivo central del ajuste.
- Selectividad de preferencias evaluada mediante el benchmark PersonaMem (resultados no disponibles en la informacion proporcionada).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. La unica capacidad diferencial documentada es la memoria neural controlable.

## Casos de uso

- Asistentes personalizados con memoria selectiva: el modelo puede configurarse para recordar unicamente las preferencias del usuario sobre los temas que se le indiquen, evitando almacenar informacion irrelevante o sensible fuera del ambito definido.
- Investigacion en memoria en modelos de lenguaje: sirve como referencia reproducible para estudiar como se comporta un mecanismo de memoria neural cuando se controla mediante instrucciones en lenguaje natural, usando el benchmark PersonaMem.
- Evaluacion de selectividad de preferencias: util para experimentos que midan la capacidad de un modelo de distinguir entre informacion que debe retener y descartar, comparando con el modelo base memoryllm-8b-chat.
- Sistemas de recomendacion con memoria de preferencias: el modelo podria emplearse para mantener el perfil de gustos del usuario sobre categorias concretas indicadas por el operador.
- Experimentos academicos de controlabilidad: dado que el articulo esta publicado en NeurIPS 2026, el modelo es adecuado para replicar los resultados de la tabla 2 y la figura 4 y para extenderlos con nuevos conjuntos de temas.
- Prototipos de agentes conversacionales con estado persistente: el componente de memoria permite mantener contexto a lo largo de multiples turnos, aunque no se especifica la longitud de contexto ni el rendimiento en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card referencia la tabla 2 y la figura 4 del articulo "Tell Me What To Learn: Generalizing Neural Memory to be Controllable in Natural Language" (NeurIPS 2026), donde se evalua en el benchmark PersonaMem, pero no se incluyen los valores concretos.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (aproximadamente 9,78 mil millones) y no proceden de la informacion proporcionada:

- VRAM estimada para inferencia:
  - Precisión completa en bf16/fp16: aproximadamente 19,6 GB solo para los pesos, mas memoria para activaciones y estado de la memoria neural.
  - Cuantizacion a 8 bits: aproximadamente 10-11 GB.
  - Cuantizacion a 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas (estimado): A100 40/80 GB o H100 para ejecucion en bf16 sin cuantizar. En consumer GPU, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ser suficiente en bf16 de forma ajustada, y con holgura si se cuantiza.
- Compatibilidad con consumer GPU: probablemente si en cuantizaciones de 8 o 4 bits; en bf16 depende de la memoria adicional que requiera el mecanismo de memoria.
- Opciones de despliegue: la model card especifica el uso a traves del repositorio de codigo oficial (https://github.com/maxbennett/Generalized-Neural-Memory), mediante el script `python download_models.py --personamem`, que coloca el modelo en `models/gnm_personamem/model.pth`, con la clave de registro `memoryllm_chat`. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada y es dudosa debido a la arquitectura de memoria personalizada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maxbennett/generalized-neural-memory-gnm-personamem | 9,78 mil millones | no disponible | no disponible (benchmark PersonaMem, sin cifras publicadas aqui) | llama3 | HuggingFace + repo de codigo oficial |
| YuWangX/memoryllm-8b-chat (modelo base) | no disponible (heredado de Llama-3-8B, ~8 mil millones) | no disponible | no disponible | no disponible | HuggingFace |
| Llama-3-8B-Instruct (referencia de categoria) | 8 mil millones | 8192 tokens (segun especificaciones publicas de Llama-3) | no disponible en la informacion proporcionada | llama3 | HuggingFace, amplio soporte de herramientas |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. La comparativa se limita a la relacion de parentesco entre el modelo GNM y su base memoryllm-8b-chat.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al derivar de Llama-3-8B, es previsible que herede sesgos del modelo original, aunque no se documenta explicitamente.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; es un riesgo inherente a los modelos generativos de este tamano.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan especificados. La model card esta redactada en ingles y no se documentan capacidades multilingues.
- Licencia: llama3. Es imprescindible revisar los terminos completos de la licencia Llama 3 antes de cualquier uso comercial, ya que incluye restricciones especificas (por ejemplo, clausulas de escala de usuarios mensuales y usos prohibidos).
- Dependencia de codigo externo: el uso previsto requiere el repositorio https://github.com/maxbennett/Generalized-Neural-Memory y el script de descarga propio. No se garantiza compatibilidad con frameworks estandar de inferencia, lo que complica su integracion en produccion.
- Madurez del recurso: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (14 de octubre de 2026), por lo que carece de validacion por parte de la comunidad.
- Ausencia de datos de benchmarks: no se han facilitado cifras numericas, lo que impide evaluar su rendimiento real frente a alternativas.
- Trazabilidad: no se detallan datos de entrenamiento, composicion del dataset ni tecnicas de alineacion, lo que limita la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maxbennett/generalized-neural-memory-gnm-personamem
- Repositorio de codigo oficial: https://github.com/maxbennett/Generalized-Neural-Memory
- Modelo base: https://huggingface.co/YuWangX/memoryllm-8b-chat
- Articulo de referencia: "Tell Me What To Learn: Generalizing Neural Memory to be Controllable in Natural Language" (NeurIPS 2026); no se ha proporcionado enlace directo al paper.
