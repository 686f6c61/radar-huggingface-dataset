# davanstrien/kev-banking77

## Resumen

kev-banking77 es un adaptador PEFT (LoRA) publicado por davanstrien que especializa el modelo Kev-4B en una unica tarea: clasificar mensajes de atencion al cliente bancaria en una de las 77 intenciones del dataset PolyAI/banking77, devolviendo ademas una probabilidad calibrada por etiqueta. El modelo base, jaredpalmer/kev-4b, es a su vez un ajuste de Qwen/Qwen3.5-4B-Base orientado a la formulacion de decisiones con salida probabilistica (el llamado "decision model" del ecosistema Kev). El adaptador se entrena con la receta `decision-model` del repositorio jobs-recipes sobre Hugging Face Jobs.

La relevancia practica esta en el flujo de trabajo: partiendo de un dataset etiquetado alojado en el Hub, un unico Job de GPU de 78 minutos produce un clasificador desplegable con metricas de calibracion reportadas. Sobre 500 registros de desarrollo retenidos, el adaptador alcanza un 87,6 % de accuracy frente al 82,8 % del Kev-4B original, con un error de calibracion esperado (ECE) de 0,077 que baja a 0,022 si se aplica la temperatura ajustada de 1,91.

El modelo es pequeno (4B parametros en el base), con licencia Apache 2.0 en el adaptador, y esta pensado para despliegue como servicio de clasificacion mediante el repositorio Kev, no como modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Kev-4B, que a su vez deriva de Qwen/Qwen3.5-4B-Base (transformer decoder-only) |
| Parametros totales | 4B en el modelo base; tamano del adaptador no disponible (repo de 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (textos truncados a 2000 caracteres en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (adaptador); sujeto tambien a las licencias del modelo base y del dataset PolyAI/banking77 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Kev-4B, un modelo derivado de Qwen/Qwen3.5-4B-Base (commit `1001bb4d826a52d1f399e183466143f4da7b741b`) que formula la tarea como una eleccion entre etiquetas con distribucion de probabilidad asociada. El entrenamiento parte del checkpoint `jaredpalmer/kev-4b@6cfce5c2fa4b4bd64026336ab649c5ca78857d52` y del codigo Kev en el commit `6b719c3c3f367295f6ef336f4f751cf5ff970abc`.

Los datos son PolyAI/banking77 en la revision `1846984189f2bc0ac51c6fc3a600fa9e1714e0c6`, con 2000 registros de entrenamiento y 500 de desarrollo, y los textos truncados a 2000 caracteres. El entrenamiento se ejecuta con `train-kev.py` de uv-scripts/classification sobre Hugging Face Jobs, en un unico Job de GPU de 78 minutos que incluye entrenamiento y las dos evaluaciones. No se documenta el uso de RLHF ni DPO; la innovacion destacable es el pipeline reproducible de dataset etiquetado a modelo desplegable y el paso de calibracion por temperatura (1,91) validado out-of-fold.

## Capacidades

- Clasificacion de texto en 77 intenciones de atencion al cliente bancaria (PolyAI/banking77).
- Salida probabilistica por etiqueta, con calibracion reportada (ECE 0,077 a temperatura 1,0; 0,022 con temperatura 1,91).
- Formulacion de la tarea como pregunta unica ("que intencion de soporte expresa este mensaje") con instruccion y etiquetas fijas de entrenamiento.
- Despliegue como servicio HTTP mediante el repositorio Kev (`python -m kev.serve`).
- No se documentan capacidades de generacion libre, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Enrutamiento de tickets de banca: clasificar cada mensaje entrante en una de las 77 intenciones para dirigirlo al equipo o flujo adecuado, usando la probabilidad por etiqueta para decidir derivacion manual cuando la confianza es baja.
- Triaje en atencion al cliente: priorizar consultas por intencion (por ejemplo, disputas de cargos frente a consultas de saldo) antes de que las lea un agente humano.
- Etiquetado asistido de datos: usar el modelo para preetiquetar grandes volumenes de mensajes y revisar solo los casos de baja confianza, reduciendo el coste de anotacion.
- Monitorizacion de motivos de contacto: agregar las predicciones por intencion para detectar picos o cambios en las consultas de los clientes a lo largo del tiempo.
- Filtrado previo en pipelines de soporte: descartar o redirigir mensajes fuera de alcance antes de pasarlos a un modelo generativo mayor, ahorrando coste de inferencia.
- Evaluacion de calidad y calibracion: servir el modelo con `KEV_TEMPERATURE=1.91` para obtener probabilidades mejor calibradas en sistemas que dependen de umbrales de confianza.
- Prototipado rapido con Hugging Face Jobs: reutilizar la receta `decision-model` para adaptar Kev-4B a otros datasets de clasificacion con un unico Job de GPU de aproximadamente 78 minutos.

## Benchmarks y rendimiento

Evaluacion sobre 500 registros de desarrollo de PolyAI/banking77 retenidos del entrenamiento:

| Modelo | Accuracy | ECE |
|---|---|---|
| Fine-tuned (este modelo) | 87,6 % | 0,077 |
| Kev-4B publicado | 82,8 % | 0,123 |
| Fine-tuned con temperatura ajustada out-of-fold | 87,6 % | 0,022 |

Diferencia fine-tuned menos publicado sobre los mismos 500 registros: +4,8 puntos (intervalo bootstrap del 95 %: +2,2 a +7,4); 35 respuestas pasaron a correctas y 11 a incorrectas. Un unico entrenamiento y una unica semilla. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 4B parametros en el base, la inferencia en precision completa requiere del orden de 8-10 GB y en cuantizacion de 4 bits aproximadamente 3-4 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles; el entrenamiento se ejecuto en un unico Job de GPU de Hugging Face sin especificar el modelo de GPU.
- Cabe en GPU de consumo: probablemente si, dado el tamano de 4B, aunque no hay confirmacion del autor.
- Opciones de despliegue: servidor propio del repositorio Kev (`uv run --extra serve python -m kev.serve --run davanstrien/kev-banking77 --port 8008`); otras opciones (vLLM, llama.cpp, Ollama, TGI) no documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en banking77 (500 dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kev-banking77 (este) | 4B (base) + LoRA | no disponible | 87,6 % | Apache 2.0 | Hugging Face |
| Kev-4B publicado | 4B | no disponible | 82,8 % | no disponible | Hugging Face |
| Clasificadores BERT clasicos sobre banking77 | 0,1-0,3B tipicamente | 512 tokens tipicamente | no disponible en la informacion | variable | Hugging Face |

No se dispone de datos comparativos con otros modelos de clasificacion en la informacion proporcionada; la unica comparacion publicada es contra el Kev-4B sin ajustar.

## Limitaciones y advertencias

- Entrenado con solo 2000 registros y una unica semilla; la variabilidad entre ejecuciones no esta caracterizada.
- Dominio restringido a las 77 intenciones de PolyAI/banking77; no generaliza a otras taxonomias sin reentrenamiento.
- Los textos se truncan a 2000 caracteres, por lo que mensajes mas largos pierden informacion.
- El checkpoint se sirve a temperatura 1,0; sin aplicar `KEV_TEMPERATURE=1.91` las probabilidades estan peor calibradas (ECE 0,077 frente a 0,022).
- Riesgo de alucinacion en el sentido de asignar una intencion con alta confianza a mensajes ambiguos o fuera de dominio; conviene umbral de confianza y revision humana.
- Sesgos conocidos: no documentados por el autor.
- Idiomas soportados: no disponibles; el dataset banking77 esta mayoritariamente en ingles.
- Licencia: el adaptador es Apache 2.0, pero deben revisarse las licencias del modelo base (jaredpalmer/kev-4b) y del dataset PolyAI/banking77 antes de uso comercial o redistribucion; la licencia del dataset puede exigir atribucion.
- No es un modelo generativo de proposito general: no debe usarse para tareas fuera de la clasificacion de intenciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davanstrien/kev-banking77
- Modelo base Kev-4B: https://huggingface.co/jaredpalmer/kev-4b
- Repositorio Kev: https://github.com/jaredpalmer/kev
- Receta decision-model: https://github.com/davanstrien/jobs-recipes/tree/main/decision-model
- Dataset PolyAI/banking77: https://huggingface.co/datasets/PolyAI/banking77
- Guia de Hugging Face Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
- Scripts de clasificacion: https://huggingface.co/datasets/uv-scripts/classification
