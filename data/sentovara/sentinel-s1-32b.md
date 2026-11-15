# Sentovara/Sentinel-S1-32B

## Resumen

Sentinel S1 32B es un adaptador LoRA desarrollado por Sentovara sobre el modelo base allenai/Olmo-3.1-32B-Instruct, diseñado para que el modelo señale explícitamente cuándo es probable que su respuesta sea incorrecta. Cuando el modelo detecta incertidumbre, prefija su respuesta con la etiqueta `UNSURE:`, lo que permite a un sistema externo (por ejemplo, un pipeline de recuperación aumentada) buscar la información en una fuente fiable en lugar de aceptar una respuesta potencialmente errónea. El adaptador se distribuye bajo licencia Apache 2.0 y está orientado a generación de texto en inglés.

La propuesta central no es mejorar el conocimiento del modelo, sino su calibración: según la model card, el modelo base y Sentinel aciertan una proporción similar del total de preguntas, pero la tasa de acierto de las respuestas no marcadas sube del 28,3% al 68,2% en un conjunto de 9.255 preguntas, y el 87,5% de las respuestas erróneas propias quedan marcadas con `UNSURE:`. El adaptador se entrenó con etiquetas derivadas del propio historial de aciertos del modelo base (5 intentos por pregunta sobre 10.000 preguntas de Natural Questions y GSM8K).

El modelo es relevante para arquitecturas de agentes y sistemas RAG que necesitan una señal fiable de abstención antes de responder, y para evaluar si las técnicas de calibración y abstención se transfieren de modelos de 7B a 32B (la receta se replicó sin cambios respecto a Sentinel-S1-7B). El repositorio ocupa 0,5 GB y contiene únicamente los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only allenai/Olmo-3.1-32B-Instruct |
| Parametros totales | 32B en el modelo base; el adaptador LoRA se distribuye como pesos separados (tamano del repo: 0,5 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Olmo-3.1-32B-Instruct; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (la model card solo menciona carga en bfloat16; el adaptador es compatible con vLLM y `max_lora_rank=16`) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre Olmo-3.1-32B-Instruct (revision `ac0587e4a7744a551c059d8cd17ba220bc940dae`), un transformer decoder-only de 32B parametros. El adaptador tiene rango 16 (se indica `max_lora_rank=16` para vLLM) y se carga con la libreria `peft`. No se especifica en la informacion disponible que capas se adaptan ni el numero exacto de parametros entrenables.

El entrenamiento se articula en tres fases descritas en la model card: (1) evidencia, donde el modelo base responde 10.000 preguntas con respuesta conocida (5.000 de conocimiento general de Natural Questions y 5.000 de matematicas de GSM8K) con cinco intentos por pregunta, y cada respuesta se marca como correcta o incorrecta mediante script; (2) etiquetado a partir del propio historial, donde si el modelo acierta en 4 o 5 de 5 intentos se le entrena para dar su propia respuesta sin marca, y si acierta en 0 o 1 de 5 se le entrena para dar la misma respuesta empezando por `UNSURE:`; (3) preservacion de habilidades, incluyendo practica de conversacion general y charla cotidiana para mantener las capacidades previas. Todas las respuestas usadas en el entrenamiento de esas preguntas son generadas por el propio modelo. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset de conversacion ni si se emplearon RLHF o DPO; el codigo de entrenamiento no esta publicado. La evaluacion esta disponible en el directorio `eval/` y los resumenes de resultados en `results/`.

## Capacidades

- Generacion de texto y respuesta a preguntas de conocimiento general y matematicas, heredadas del modelo base Olmo-3.1-32B-Instruct.
- Abtencion calibrada: emite el prefijo `UNSURE:` cuando es probable que la respuesta sea incorrecta, como senal explotable por sistemas externos.
- Seguimiento de instrucciones (IFEval) y resolucion de problemas matematicos (GSM8K) con rendimiento practicamente identico al modelo base.
- Conversacion multi-turno: la model card reporta evaluacion en 350 conversaciones nuevas, con mejora de la tasa de acierto de respuestas no marcadas del 55,0% al 77,9% y marcado del 78,8% de los errores propios en conversacion.
- Integracion en pipelines de recuperacion aumentada: soporta un prompt especifico para responder a partir de pasajes de Wikipedia numerados e indicar la fuente con `Source: <numero>`.
- Compatibilidad con vLLM mediante soporte LoRA (`enable_lora=True`, `max_lora_rank=16`).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Atencion al cliente con derivacion a fuente fiable: el sistema ejecuta Sentinel y, si la respuesta empieza por `UNSURE:`, activa una busqueda en la base de conocimiento corporativa antes de responder al usuario, evitando afirmaciones no verificadas.
- Pipeline RAG con abstención selectiva: se usa la marca `UNSURE:` como disparador para recuperar pasajes de Wikipedia o de un indice interno y se reformula la consulta con el prompt de busqueda documentado, que exige una respuesta corta y la cita de la fuente.
- Moderacion de respuestas generadas: en un flujo de generacion automatica, las respuestas marcadas se enrutan a revision humana o a un segundo modelo verificador, reduciendo el coste de revision frente a revisar todas las salidas.
- Asistentes de investigacion y verificacion de hechos: el modelo responde a preguntas de conocimiento general y marca explicitamente las que no domina, lo que permite construir un flujo de "responder o buscar" con trazabilidad de la fuente.
- Evaluacion de calibracion en investigacion: sirve como referencia para estudiar la transferencia de tecnicas de abstención de 7B a 32B, comparando Sentinel-S1-7B y Sentinel-S1-32B con el mismo protocolo de evaluacion.
- Despliegue en produccion con vLLM: el adaptador se sirve junto al modelo base mediante el soporte LoRA de vLLM, con `max_lora_rank=16`, lo que permite mantener un unico modelo base y cargar el adaptador de calibracion encima.
- Chatbot de matematicas con cautela limitada: puede usarse para resolver problemas de GSM8K, pero dado que el marcado de errores matematicos es debil, conviene acompanarlo de un verificador simbolico externo.

## Benchmarks y rendimiento

Los resultados proceden de la model card y se evaluaron con script sobre conjuntos excluidos del entrenamiento, con umbrales de aceptacion fijados antes de obtener los resultados. El modelo base y Sentinel se ejecutaron con el mismo codigo.

| Prueba | Original 32B | Sentinel S1 32B | Umbral | Resultado |
|---|---|---|---|---|
| Seguimiento de instrucciones (IFEval, 541 prompts) | 85,6% | 85,0% | dentro de 2 puntos | Pasa |
| Matematicas (GSM8K test, 1.319 problemas) | 94,7% | 94,7% | dentro de 2 puntos | Pasa |
| Respuestas no marcadas correctas (9.255 preguntas) | 28,3% | 68,2% | +10 puntos | Pasa |
| Respuestas erroneas propias marcadas | ninguna | 87,5% | al menos la mitad | Pasa |
| Respuestas que terminan limpiamente | 99,6% | 99,6% | al menos 95% | Pasa |
| Preguntas marcadas correctas tras busqueda (6.448) | 10,9% como conjetura | 45,2% | busqueda mejor que conjetura | Pasa |
| Respuestas no marcadas correctas en conversacion (350 chats nuevos) | 55,0% | 77,9% | +10 puntos | Pasa |
| Errores propios marcados en conversacion | ninguno | 78,8% | al menos la mitad | Pasa |
| Chats ordinarios marcados | — | 3 de 50 | como maximo 10% | Pasa |

Pasan 9 de 9 comprobaciones. Las preguntas de validacion proceden de Natural Questions (validacion), SimpleQA, GSM8K (test) e IFEval. Comparado con Sentinel-S1-7B, el 32B parte de un conocimiento mayor (32,5% de aciertos en conocimiento general antes del entrenamiento frente a 14,9% del 7B), por lo que responde sin marca con mas frecuencia y marca una proporcion ligeramente menor de sus errores (87,5% frente a 94,0%); es mejor en instrucciones, matematicas y respuesta tras busqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El modelo base es de 32B parametros, por lo que en bfloat16 requiere del orden de 64 GB solo para pesos, mas memoria para el adaptador y el contexto; el adaptador LoRA en si ocupa 0,5 GB.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano del modelo base, el despliegue en bfloat16 requiere GPUs de clase A100/H100 de 80 GB o configuraciones multi-GPU; no se confirma compatibilidad con GPUs de consumo.
- Cabe en consumer GPU: no confirmado en la informacion disponible; con cuantizacion del modelo base a 4 bits podria ser viable en GPUs de 24 GB, pero no se documenta ni se ha verificado en la model card.
- Opciones de despliegue: transformers con peft (probado con transformers 5.22.1 y peft 0.21.2) y vLLM con soporte LoRA (`enable_lora=True`, `max_lora_rank=16`, probado con vLLM 0.31.0). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentinel-S1-32B | 32B (adaptador LoRA) | no disponible | Abtencion calibrada sobre Olmo-3.1-32B-Instruct | apache-2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Sentinel-S1-7B | 7B (adaptador LoRA) | no disponible | Misma receta de abtencion sobre modelo base de 7B | no disponible en la informacion proporcionada | Hugging Face (Sentovara/Sentinel-S1-7B) |
| allenai/Olmo-3.1-32B-Instruct | 32B | no disponible | Modelo base instructivo sin abtencion calibrada | no disponible en la informacion proporcionada | Hugging Face (allenai/Olmo-3.1-32B-Instruct) |

La comparativa con alternativas de otros desarrolladores orientadas a abstención o calibracion no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La busqueda ayuda, pero mas de la mitad de las preguntas marcadas no terminan en una respuesta correcta; el sistema indica una fuente verificada en aproximadamente tres de cada cuatro respuestas.
- El marcado en matematicas es debil: Sentinel solo marca una pequena parte de sus propios errores matematicos, por lo que la mayoria de los errores de matematicas se afirman sin marca.
- El modelo no aprende conocimiento nuevo: el porcentaje global de aciertos es practicamente el mismo que el del modelo base; la mejora esta en el juicio sobre cuando marcar.
- Solo soporta ingles (`language: en`), lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinacion persistente en las respuestas no marcadas: la tasa de acierto del 68,2% implica que cerca de un tercio de las respuestas no marcadas son incorrectas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Olmo-3.1-32B-Instruct tiene su propia licencia, que debe verificarse por separado antes de un despliegue en produccion.
- El codigo de entrenamiento no esta publicado, lo que dificulta la reproducibilidad de la receta; solo se publican el codigo de evaluacion (`eval/`) y los resumenes de resultados (`results/`).
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay validacion independiente de terceros sobre los resultados reportados.
- La model card indica que las marcas se aplican al inicio de la respuesta; los sistemas que consuman el modelo deben implementar el parseo del prefijo `UNSURE:` de forma explicita.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sentovara/Sentinel-S1-32B
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Version 7B: https://huggingface.co/Sentovara/Sentinel-S1-7B
- Documento metodologico (write-up): https://docs.google.com/document/d/1elcP-xWo-c0brn-lTzhtKyTaBuGjf0fL5-wCRz5AfaM/edit?usp=sharing
- Sitio del desarrollador: https://sentovara.com
- Novedades del desarrollador: https://sentovara.com/updates
