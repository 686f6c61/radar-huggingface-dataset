# Mesosfer/Joko-edited

## Resumen

Joko-edited es un checkpoint experimental derivado de Mesosfer/Joko, un ajuste fino (SFT) del modelo multimodal Qwen/Qwen3.5-2B. Lo desarrolla el usuario Mesosfer y su proposito no es mejorar las capacidades del modelo, sino corregir un fallo concreto de bucle de razonamiento: el token `</think>` (id 248069) provocaba que el modelo repitiera indefinidamente en lugar de cerrar la fase de pensamiento y pasar a la respuesta. La intervencion consiste en una edicion manual de pesos, sin entrenamiento ni gradientes, sobre la fila del embedding atado de ese token.

El modelo base es un transformer multimodal de 2.213.241.664 parametros con capacidad de entrada imagen-texto y salida de texto, orientado a tareas cotidianas, uso de herramientas, codigo sencillo y control de interfaz grafica mediante capturas de pantalla. El ajuste original se realizo con LoRA de rango 16 y alpha 32, fusionado posteriormente en pesos BF16 completos, sobre dos pasadas de 52.316 registros bilingues indonesio/ingles.

La relevancia de esta ficha es doble: por un lado documenta una tecnica poco habitual de correccion localizada de pesos (edicion de 2.000 entradas BF16 en una unica fila atada), y por otro advierte de que se trata de un artefacto de calibracion, no de un modelo validado con benchmarks. El propio autor indica que la mejora solo esta comprobada en el conjunto de calibracion y que la generalizacion y los efectos secundarios estan por verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3_5ForConditionalGeneration), pesos completos BF16 fusionados a partir de un adaptador LoRA |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos BF16 completos) |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | No disponible (el autor remite a las licencias del modelo base y de los datasets upstream) |
| Formato de pesos | safetensors (tres shards, BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen/Qwen3.5-2B, un transformer multimodal que procesa entradas de imagen y texto y genera texto, cargable mediante `Qwen3_5ForConditionalGeneration` y `AutoProcessor`. El ajuste original de Joko se realizo con LoRA de rango 16 y alpha 32 sobre 52.316 registros en dos pasadas (checkpoint de epoca 2, paso 6540), y los adaptadores se fusionaron posteriormente en pesos BF16 completos. Los datos de entrenamiento combinan 240 ejemplos bilingues de identidad, 22.282 registros de UltraData-SFT-Agent-2609, 5.876 de UkisAI, 8.585 de GUI-360, 9.598 registros de agente de AGUVIS y 5.735 de grounding de AGUVIS; el autor aclara que se trata del subconjunto validado disponible y que Nemotron no se incluyo en esta ejecucion.

La innovacion tecnica de este checkpoint concreto no esta en el entrenamiento sino en la edicion posterior: se tomo la fila del embedding atado correspondiente al token `</think>` (248069), se registro un prefijo que provocaba bucle y, mediante dos pasadas forward sin gradientes, se modificaron 2.000 entradas BF16 de esa fila. Al estar atada la matriz de embedding con la de salida, el cambio afecta tanto a la lectura como a la generacion del token. El autor documenta los margenes de calibracion en `weight_edit.json` y verifica la integridad de los shards de origen y el caracter local del cambio. No hay RLHF ni DPO documentados en esta edicion.

## Capacidades

- Generacion de texto conversacional bilingue en indonesio e ingles.
- Razonamiento con modo de pensamiento (thinking mode), con cierre explicito mediante el token `</think>`; la interfaz de inferencia usa por defecto el modo sin pensamiento.
- Procesamiento de imagenes como entrada (pipeline image-text-to-text), incluida la interpretacion de capturas de pantalla.
- Uso de herramientas y function calling, heredado del entrenamiento con datos de agente de UltraData y UkisAI.
- Razonamiento multi-paso y comportamiento de agente, con datos especificos de AGUVIS para tareas de agente y grounding.
- Codigo sencillo y tareas cotidianas, segun la model card original del SFT.
- Control de interfaz grafica basado en capturas (screenshot-based computer use), con coordenadas y formatos de accion dependientes de la fuente de datos.
- Capacidades matematicas y de codigo avanzadas: no establecidas; el autor indica explicitamente que la edicion no aporta mejora en matematicas intrinsecas, codigo ni grounding visual.

## Casos de uso

- Correccion de bucles de razonamiento en produccion: si un despliegue basado en Joko sufre respuestas que agotan la ventana de contexto repitiendo la fase de pensamiento, este checkpoint sirve como referencia de como una edicion localizada de la fila de `</think>` puede forzar el cierre del bloque de pensamiento sin reentrenar.
- Asistente conversacional bilingue indonesio/ingles: el modelo puede mantener dialogos multi-turno en ambos idiomas gracias a los 240 ejemplos de identidad y a los datos de agente multi-turno de UkisAI, adecuado para productos dirigidos al mercado indonesio.
- Automatizacion de tareas de escritorio y navegador: con los datos de GUI-360 y AGUVIS, el modelo puede interpretar capturas de pantalla y emitir acciones de interfaz; la aplicacion consumidora debe validar el formato de coordenadas y acciones.
- Agente con tool calling en pipelines internos: los registros de UltraData-SFT-Agent permiten integrar el modelo como planificador que invoca funciones externas en flujos de automatizacion.
- Extraccion de informacion a partir de imagenes: al aceptar entrada imagen-texto, puede describir o transcribir contenido de capturas y documentos escaneados en ingles o indonesio.
- Prototipado e investigacion sobre edicion de pesos: el repositorio incluye el informe de edicion y los margenes de calibracion, lo que lo convierte en un caso de estudio reproducible para investigar intervenciones quirurgicas en embeddings atados.
- Base para experimentos de alineacion de formato de pensamiento: util para comparar el comportamiento de cierre de `</think>` antes y despues de la edicion en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion es la perdida de validacion del SFT original en el paso 6540 (loss 0,42336021796042195) sobre 128 ejemplos fijos de un split de 2.589 registros, que el autor advierte que no constituye un benchmark de codigo ni de GUI. En cuanto a la edicion, el autor reporta que, en pruebas ejecutadas por el propio usuario, el prompt de identidad usado para calibracion termino en 15 tokens en lugar de alcanzar 2.048, y que las 10 respuestas basicas de pensamiento alcanzaron EOS; la tarea de copiar icono mediante captura seguia entrando en bucle hasta 512 tokens. Son resultados de conjunto de calibracion, no de un conjunto retenido.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,4 GB solo para pesos, mas overhead de activaciones, cache KV y procesador de imagen; en la practica se recomienda al menos 8-10 GB para contexto moderado.
- GPU recomendadas: A100 o H100 para despliegues con concurrencia; RTX 4090 o RTX 3090 para inferencia individual en BF16.
- GPU de consumo: cabe en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) en BF16; en GPUs con menos VRAM seria necesario cuantizar, pero el repositorio no publica pesos GGUF ni cuantizados.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (entorno de exportacion: torch 2.14.0+rocm10.1.0, transformers 5.20.2, peft 0.21.2, safetensors 0.8.0, tokenizers 0.23.3, Pillow 13.0.0). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; dado que el modelo base es multimodal y la version de transformers requerida es muy reciente, la compatibilidad con esos motores no esta garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Mesosfer/Joko-edited | 2,21 B | No disponible | Imagen-texto a texto | No disponible | Checkpoint experimental, 0 descargas |
| Qwen/Qwen3.5-2B (base) | ~2 B | No disponible | Imagen-texto a texto | Segun modelo base | Modelo upstream de referencia |
| Mesosfer/Joko (epoca 2) | 2,21 B | No disponible | Imagen-texto a texto | No disponible | Checkpoint SFT previo a la edicion |

La comparacion con alternativas de la misma categoria (por ejemplo, otros modelos multimodales de ~2 B orientados a agentes de GUI) no esta disponible en la informacion proporcionada. La unica comparacion documentada es contra el propio Joko sin editar, donde el autor reporta el cierre del bucle en el prompt de calibracion.

## Limitaciones y advertencias

- Modelo experimental: la correccion se valido solo en el conjunto de calibracion; no hay evaluacion en conjuntos retenidos ni pruebas de generalizacion.
- Efectos secundarios desconocidos: la edicion afecta a la fila atada de `</think>`, por lo que puede alterar la generacion de ese token en contextos no previstos.
- El bucle persiste en al menos una tarea: la tarea de copiar icono mediante captura seguia alcanzando 512 tokens.
- Sin mejora demostrada en matematicas, codigo ni grounding visual; el autor lo declara explicitamente.
- Riesgo de alucinacion: no evaluado; el modelo no ha pasado por evaluaciones de calidad de respuesta generada ni de uso de ordenador de extremo a extremo.
- Sesgos: no documentados; los datos de entrenamiento provienen de mezclas de terceros (UltraData, UkisAI, GUI-360, AGUVIS) cuyos sesgos no se analizan.
- Cobertura idiomatica limitada a indonesio e ingles; el rendimiento en castellano no esta documentado.
- Licencia no disponible en el repositorio: el autor remite a las licencias del modelo base y de los datasets upstream (apache-2.0, MIT y terminos de atribucion), por lo que el uso comercial requiere verificar esas condiciones antes de desplegar.
- Formato de acciones de GUI dependiente de la fuente: las coordenadas y el esquema de acciones deben ser validados y normalizados por la aplicacion consumidora.
- Requiere una version muy reciente de transformers (5.20.2 en el entorno de exportacion); versiones anteriores pueden no cargar la arquitectura `Qwen3_5ForConditionalGeneration`.
- Sin descargas ni validacion por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mesosfer/Joko-edited
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset UltraData-SFT-Agent-2609: https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
- Dataset UkisAI multi-turn agent SFT: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Dataset GUI-360: https://huggingface.co/datasets/vyokky/GUI-360
- Dataset AGUVIS stage 1: https://huggingface.co/datasets/xlangai/aguvis-stage1
- Dataset AGUVIS stage 2: https://huggingface.co/datasets/xlangai/aguvis-stage2
