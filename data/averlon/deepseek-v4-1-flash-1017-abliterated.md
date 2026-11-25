# Averlon/DeepSeek-V4.1-Flash-1017-abliterated

## Resumen

DeepSeek-V4.1-Flash-1017-abliterated es un adaptador LoRA publicado por Averlon que modifica el modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, un transformer de tipo mezcla de expertos (MoE). El adaptador aplica una técnica de *abliteration*: una edición de rango bajo que elimina la dirección de rechazo aprendida por el modelo, de modo que este deja de negarse a responder ante tareas de seguridad ofensiva que de otro modo rechazaría, manteniendo supuestamente intacta su capacidad general.

El propósito declarado es el uso en investigación de seguridad autorizada: pruebas de penetración, herramientas de red team y análisis de vulnerabilidades. No se trata de un lanzamiento oficial de DeepSeek, sino de un artefacto de terceros distribuido con acceso restringido (gated) y sujeto a un acuerdo de uso aceptable con verificación de correo corporativo, justificación detallada y posibilidad de revocación.

Es relevante ahora porque ilustra una práctica creciente: publicar la edición de abliteration como adaptador PEFT en lugar de fusionarla en los pesos, lo que evita la pérdida por recuantización sobre las capas FP8 y MXFP4 del modelo base y permite aplicar el cambio en bf16 sobre los pesos oficiales intactos. El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE (modelo base DeepSeek-V4.1-Flash-1017) |
| Parametros totales | no disponible (el repositorio contiene solo el adaptador, 0,2 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el adaptador se aplica en bf16; el modelo base usa atencion FP8 y expertos enrutados MXFP4 (segun la model card) |
| Idiomas soportados | en |
| Licencia | MIT (con acceso restringido mediante acuerdo de uso aceptable) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango bajo que se superpone al modelo base DeepSeek-V4.1-Flash-1017. La edición de abliteration se describe como una modificación de rango 1 orientada a suprimir la dirección de rechazo del modelo. Según el autor, aplicar el adaptador en bf16 sobre los pesos oficiales sin tocar produce un resultado mediblemente mejor que fusionar la misma edición en los pesos: el modelo base emplea atención en FP8 y expertos enrutados en MXFP4, y el redondeo a 4 bits borraría parte de una edición de rango tan bajo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO para el adaptador. El autor menciona que en su plataforma Cynos ofrece una variante más robusta que combina esta abliteration con aprendizaje por refuerzo para trabajo de seguridad ofensiva, pero esa política no forma parte de este repositorio, que es únicamente el adaptador de abliteration.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Supresión del comportamiento de rechazo en tareas de seguridad ofensiva autorizada (pruebas de penetración, red team, análisis de vulnerabilidades).
- Capacidad declarada de mantener la competencia general del modelo base tras aplicar la edición.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Pruebas de penetración autorizadas: el adaptador permite al modelo generar y discutir técnicas ofensivas, payloads de prueba y vectores de ataque sobre sistemas para los que el equipo cuenta con autorización escrita, evitando los rechazos que limitarían la utilidad del modelo base en este contexto.
- Operaciones de red team: se emplearía para redactar escenarios de ataque, planes de explotación y análisis de superficie de exposición en ejercicios internos, dado que el adaptador elimina la dirección de rechazo y mantiene la capacidad general del modelo.
- Análisis de vulnerabilidades: el modelo puede asistir en la revisión de código y configuración en busca de debilidades explotables, una tarea que el modelo base podría declinar parcialmente y que aquí se aborda sin esas negativas.
- Investigación de seguridad: útil para estudiar el propio fenómeno de la abliteration, comparando el comportamiento del modelo base con el del adaptador sobre el mismo conjunto de prompts y juez.
- Desarrollo de productos de seguridad: integración en herramientas internas de análisis ofensivo, siempre que el despliegue cuente con controles de acceso y políticas de uso propios, tal como exige el acuerdo del autor.
- Evaluación de robustez y alineación: permite medir la tasa de sobrerrechazo del modelo base frente al adaptador (el autor cita un 15,5 % de sobrerrechazo en seguridad ofensiva con el adaptador sobre prompts retenidos y un juez determinado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una métrica de sobrerrechazo en seguridad ofensiva del 15,5 % con el adaptador sobre prompts retenidos y un juez concreto, sin detallar el conjunto de evaluación ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende enteramente del modelo base DeepSeek-V4.1-Flash-1017, cuyas dimensiones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el adaptador es un artefacto PEFT, por lo que requiere cargar el modelo base y aplicar el adaptador mediante la librería `peft`; los frameworks de servicio concretos (vLLM, TGI, llama.cpp, Ollama) no se especifican en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-abliterated (Averlon) | LoRA sobre MoE | no disponible (adaptador de 0,2 GB) | no disponible | MIT con acuerdo de uso | Restringido (gated, verificación manual) |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | MoE | no disponible | no disponible | no disponible | Público (referencia en la model card) |
| Variante Cynos (abliteration + RL) | Política sobre el mismo base | no disponible | no disponible | no disponible | Plataforma privada de Averlon |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El adaptador elimina el comportamiento de rechazo y, por tanto, no ofrece garantías de seguridad por defecto; el autor lo advierte explícitamente.
- Riesgo elevado de uso indebido: la model card restringe el uso a pruebas autorizadas y prohíbe acceso no autorizado, malware, ataques a infraestructura crítica, armas de destrucción masiva, fraude, acoso, vigilancia ilegal y material de abuso infantil.
- El acceso es restringido: requiere correo corporativo verificado, justificación detallada y aceptación de un acuerdo de uso aceptable; el acceso puede revocarse y obliga a borrar copias.
- Prohibida la redistribución del adaptador, de pesos fusionados o derivados, y el alojamiento como servicio público.
- Idiomas: solo inglés según la etiqueta del repositorio.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; es una característica heredada del modelo base.
- Licencia MIT en el repositorio, pero condicionada por el acuerdo de acceso; conviene revisar la compatibilidad con uso comercial antes de desplegar.
- Es un artefacto de terceros, no oficial de DeepSeek; la responsabilidad sobre salvaguardas, controles de acceso y políticas de uso recae en el usuario.
- No se garantiza que la capacidad general del modelo base se preserve íntegramente pese a la afirmación del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Averlon/DeepSeek-V4.1-Flash-1017-abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Paper referenciado (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Plataforma Cynos de Averlon: no disponible en la información proporcionada
