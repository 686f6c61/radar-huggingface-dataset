# sallout/laya-multitask-intents

## Resumen

Laya Multitask Intent es un ajuste fino supervisado del modelo convaiinnovations/laya-multilingual, orientado a clasificación de intenciones de etiqueta única (single-label) en el dominio bancario y de asistentes. Lo desarrolla el usuario sallout y se distribuye bajo licencia Apache 2.0. El modelo resuelve un problema concreto: dado un texto corto en inglés o árabe y un conjunto cerrado de etiquetas de intención, devuelve la etiqueta correcta mediante selección múltiple, en lugar de generar prosa conversacional.

El checkpoint cuenta con 321.908.998 parámetros y una longitud de contexto de 1.024 tokens, con un máximo de 896 tokens reservados para la pregunta y las opciones. No es un modelo zero-shot: solo soporta los conjuntos de etiquetas con los que fue entrenado (Banking77, ArBanking77 y CLINC150), definidos en el fichero inference.json. Su relevancia radica en ofrecer una alternativa abierta y ligera para clasificación de intenciones multilingüe (inglés y árabe) con resultados medidos frente al checkpoint original.

El repositorio incluye el checkpoint de PyTorch en la raíz y una exportación Core ML en float16 dentro de coreml/, pensada para despliegue en plataformas Apple (macOS 15 o iOS 18 o superiores). Es un modelo derivado de la familia Laya, descrita por su autor como una familia de modelos de decisión tipo "System 1" que devuelven respuestas tipadas en lugar de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible (modelo derivado de la familia Laya, ajustado para clasificacion por eleccion multiple) |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens (maximo de 896 tokens para pregunta y opciones) |
| Tipos de cuantizacion | Exportacion Core ML en float16; no se listan otros formatos cuantizados |
| Idiomas soportados | Ingles (en) y arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint PyTorch) y Core ML (float16) |
| Modelo base | convaiinnovations/laya-multilingual (revision 052592a15d198d9ad47da779604259b10b47b7aa) |
| Tarea | Clasificacion de intenciones de etiqueta unica |
| Tamano del repositorio | 1,3 GB |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint convaiinnovations/laya-multilingual. La model card no detalla la arquitectura interna de la red, por lo que la arquitectura exacta figura como no disponible. El ajuste se realizo sobre un objetivo de entropia cruzada supervisada sobre opciones barajadas (shuffled choices), es decir, el modelo puntua cada etiqueta candidata y elige una, un esquema tipico de clasificacion por eleccion multiple.

El entrenamiento se hizo de forma conjunta sobre las particiones de entrenamiento de tres corpus: Banking77, ArBanking77 y CLINC150. Para ArBanking77 se emplearon ejemplos en arabe estandar moderno y en arabe palestino. El checkpoint seleccionado corresponde a la actualizacion 3.500 de una ejecucion de 5.400 actualizaciones, elegido mediante datos de validacion. No se incluye el conjunto de datos de entrenamiento en el repositorio. La model card indica explicitamente que no se empleo la receta RLCD del modelo original y que no se trata de un modelo zero-shot.

## Capacidades

- Clasificacion de intenciones de etiqueta unica sobre conjuntos de etiquetas predefinidos (Banking77, ArBanking77 y CLINC150).
- Procesamiento de texto corto en ingles y arabe, incluido arabe estandar moderno y arabe palestino para el corpus ArBanking77.
- Puntuacion de intenciones mediante softmax sobre las etiquetas candidatas (probabilidades no calibradas).
- Seleccion entre opciones barajadas por tarea, controlada mediante los metadatos de inference.json.
- Exportacion Core ML para inferencia en plataformas Apple (macOS 15 o iOS 18 o superiores).
- No se documentan capacidades de generacion de texto, razonamiento de multiples pasos, tool calling ni agentes.

## Casos de uso

- Clasificacion de consultas bancarias en atencion al cliente: el modelo asigna cada mensaje entrante (por ejemplo, "My card was declined at the shop") a una de las 77 intenciones de Banking77, lo que permite enrutar el ticket al departamento o flujo adecuado.
- Enrutamiento de mensajes en asistentes virtuales: con las 150 etiquetas de CLINC150, se puede dirigir cada peticion del usuario al modulo de back-end correspondiente antes de invocar otro modelo generativo.
- Soporte multilingue ingles-arabe en banca: gracias al entrenamiento conjunto con ArBanking77, un mismo despliegue clasifica intenciones bancarias tanto en ingles como en arabe, evitando mantener dos modelos separados.
- Preclasificacion en sistemas de triaje: usar la etiqueta predicha para decidir si una consulta la resuelve un bot de FAQ o se escala a un agente humano, reduciendo el volumen de casos que llegan a nivel 2.
- Analitica de motivos de contacto: clasificar grandes volumenes de conversaciones historicas para cuantificar la distribucion de intenciones y detectar tendencias operativas.
- Despliegue en dispositivo en aplicaciones Apple: mediante la exportacion Core ML float16, integrar la clasificacion de intenciones en apps de iOS o macOS sin depender de conectividad.
- Clasificacion de intenciones en tiempo real en canales de chat: con una ventana de 1.024 tokens, se puede clasificar el turno actual con un presupuesto de hasta 896 tokens de pregunta y opciones, adecuado para mensajes cortos de chat.
- Etiquetado asistido de datos: usar las predicciones como preanotacion para acelerar la construccion de corpus de intenciones anotados manualmente en nuevos dominios.

## Benchmarks y rendimiento

Resultados de la evaluacion externa comparando el checkpoint original y el ajustado, con prompts, etiquetas y presupuestos de entrada identicos:

| Dataset | Ejemplos evaluados | Original | Ajustado | Diferencia |
|---|---:|---:|---:|---:|
| MInDS-14 (intenciones bancarias en ingles) | 1.654 | 75,27 % | 84,89 % | +9,61 pp |
| HWU64 (intenciones de asistente en ingles) | 1.071 | 47,71 % | 50,79 % | +3,08 pp |

En las particiones de test reservadas asociadas a las tareas de entrenamiento, el modelo ajustado obtuvo:

| Dataset | Precision |
|---|---:|
| Banking77 | 89,94 % |
| ArBanking77 | 73,57 % |
| CLINC150 | 86,05 % |

Estos resultados de test corresponden a las tareas de entrenamiento y no deben describirse como zero-shot. La comparacion con MInDS-14 y HWU64 mide transferencia a conjuntos de etiquetas distintos (14 y 64 etiquetas respectivamente), no el rendimiento sobre cualquier posible intencion bancaria o de asistente. En la comparacion con MInDS-14 se eliminaron 148 filas duplicadas o en conflicto y 7 solapamientos exactos; en HWU64 se eliminaron 5 solapamientos exactos. Las cifras anteriores corresponden a PyTorch; la exportacion Core ML puede diferir ligeramente.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 321,9 M de parametros; cifras orientativas, no facilitadas por el autor):
  - FP32: aproximadamente 1,29 GB.
  - FP16: aproximadamente 0,64 GB.
  - INT8: aproximadamente 0,32 GB (si se aplica cuantizacion posterior, no incluida en el repositorio).
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con al menos 2 GB de VRAM libre es suficiente para FP16.
- Cabe en GPU de consumo: si, practicamente cualquier GPU de consumo moderna (por ejemplo, GTX 1060 6 GB, RTX 3060, RTX 4090) puede ejecutarlo con holgura. Tambien es viable en CPU.
- Opciones de despliegue: el autor indica el uso del proyecto complementario laya-classifier-ft (comandos uv run laya-ft predict) para PyTorch y el paquete laya-coreml (version 0.1.0) para la exportacion Core ML en macOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. La documentacion de la familia Laya menciona cifras orientativas del orden de decenas de milisegundos para variantes de la familia, pero no se confirman para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| sallout/laya-multitask-intents | 321.908.998 | 1.024 tokens | Apache 2.0 | en, ar | Ajuste fino para intenciones bancarias; MInDS-14 84,89 % y HWU64 50,79 % |
| convaiinnovations/laya-multilingual | No disponible en la informacion proporcionada (la documentacion de la familia cita del orden de 421 M para una variante) | No disponible | Apache 2.0 | multilingue | Modelo base; en las mismas evaluaciones externas obtiene MInDS-14 75,27 % y HWU64 47,71 % |
| Otras alternativas de clasificacion de intenciones | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de resultados comparativos con otros modelos de clasificacion de intenciones (por ejemplo, enfoques basados en SetFit o en LLM generativos) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo zero-shot: solo soporta los conjuntos de etiquetas con los que fue entrenado (Banking77, ArBanking77 y CLINC150). Para otras etiquetas es necesario reentrenar con datos etiquetados propios.
- Las probabilidades softmax devueltas no estan calibradas, por lo que no deben interpretarse directamente como niveles de confianza fiables.
- Los resultados de MInDS-14 y HWU64 miden transferencia a conjuntos de etiquetas distintos y no garantizan el rendimiento sobre cualquier intencion bancaria o de asistente.
- Las cifras de evaluacion corresponden a PyTorch; la exportacion Core ML puede presentar diferencias.
- Cobertura idiomatica limitada a ingles y arabe; no se documentan otros idiomas.
- La model card no incluye datos de entrenamiento, por lo que no es posible auditar la composicion del corpus ni sus posibles sesgos. No se han publicado analisis de sesgo en la informacion disponible.
- Riesgo de alucinacion en el sentido de asignar una etiqueta incorrecta cuando la entrada esta fuera de distribucion o la intencion no existe en el conjunto soportado, dado que la salida siempre es una de las etiquetas candidatas.
- El repositorio no incluye datos de entrenamiento ni de validacion, y las licencias de los corpus (Banking77, ArBanking77, CLINC150, MInDS-14, HWU64) corresponden a sus respectivos publicadores.
- Licencia Apache 2.0 heredada del modelo base, lo que en principio permite uso comercial del modelo, pero conviene verificar las condiciones de los conjuntos de datos utilizados en el entrenamiento si se va a redistribuir un derivado.
- La exportacion Core ML requiere plataformas Apple compatibles (macOS 15 o iOS 18 o superiores).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sallout/laya-multitask-intents
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Documentacion de la familia Laya: https://laya.convaiinnovations.com/
- Repositorio laya-ai: https://github.com/SahilAmbekar/laya-ai/blob/main/README.md
- README de convaiinnovations/laya: https://huggingface.co/convaiinnovations/laya/blob/main/README.md
- Playground y API de Laya: https://laya-ai.pro/
- Articulo divulgativo sobre Laya AI: https://pingax.com/what-is-laya-ai-open-source-decision-model/
- Dataset Banking77: https://github.com/PolyAI-LDN/task-specific-datasets
- Dataset ArBanking77: https://github.com/SinaLab/ArBanking77
- Dataset CLINC150: https://github.com/clinc/oos-eval
- Dataset MInDS-14: https://huggingface.co/datasets/PolyAI/minds14
- Dataset HWU64: https://github.com/xliuhw/NLU-Evaluation-Data
