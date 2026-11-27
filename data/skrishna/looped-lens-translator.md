# skrishna/looped-lens-translator

## Resumen

Looped Lens Translator es un conjunto de pesos de interpretabilidad (un *token lens*) entrenado para el modelo base thinkingmachines/Inkling-2-Mini. No es un modelo generativo autonomo: es un artefacto de analisis que permite proyectar estados ocultos intermedios del modelo base hacia su espacio de salida final, de modo que se pueda inspeccionar que "piensa" el modelo en cada capa antes de emitir su respuesta. Lo publica el usuario skrishna dentro del Looped Lens Challenge organizado por NDIF, con el equipo "Lookback Lens".

El artefacto contiene un fichero `translator.safetensors` con mapas ridge (regresion lineal regularizada) ajustados para las visitas de capa 43 a 47 del modelo base. Cada mapa transforma el estado con RMS unitario que entra en la visita de capa, tomado en la posicion del ultimo signo de interrogacion de un turno de chat abierto, hacia el estado final normalizado del propio modelo en la posicion donde escribe su respuesta. Despues se aplica el *unembedding* del modelo para obtener distribuciones de tokens interpretables.

Su relevancia es acotada pero clara: facilita el analisis mecanicista de Inkling-2-Mini sin necesidad de reentrenar sondas lineales, y estandariza una metodologia (lentes por visita de capa) reproducible para la comunidad de interpretabilidad. El repositorio es muy pequeno (0,1 GB) y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapas ridge lineales por visita de capa (43 a 47) sobre estados ocultos de un transformer; no es un modelo autonomo |
| Parametros totales | no disponible (el repo ocupa 0,1 GB; el numero de parametros de los mapas no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/quantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`translator.safetensors`) |

## Arquitectura y entrenamiento

El artefacto no es una red neuronal completa, sino un conjunto de transformaciones lineales afines por visita de capa. Para cada visita entre las capas 43 y 47, se almacena una matriz `W{visit}` y un vector de medias `my{visit}`, junto con una media de entrada `mx{visit}`, de modo que la proyeccion se calcula como `z = (x - mx{visit}) @ W{visit} + my{visit}` y despues se aplica el *unembedding* del modelo base. La entrada `x` es el estado con RMS unitario que entra en esa visita de capa, capturado en la posicion del ultimo signo de interrogacion de un turno de chat abierto.

El ajuste se realizo sobre 1.629 prompts de chat escritos especificamente para esta tarea, cubriendo hechos, secuencias, aritmetica sencilla y conocimiento de palabras. El objetivo de entrenamiento es el propio estado final normalizado del modelo en la posicion donde escribe su respuesta, sin usar etiquetas de respuesta: es decir, aprendizaje autosupervisado de la dinamica interna del modelo. El modelo base, thinkingmachines/Inkling-2-Mini, no aporta en la informacion disponible detalles sobre su arquitectura, numero de parametros ni datos de entrenamiento.

## Capacidades

- Proyeccion interpretativa de estados ocultos intermedios (capas 43 a 47) al espacio de salida del modelo base.
- Generacion de distribuciones de tokens "decodificadas" en posiciones intermedias, util para analisis de circuitos y trayectorias de computo.
- Analisis de turnos de chat abiertos, especificamente en la posicion del ultimo signo de interrogacion.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues por si mismo: depende enteramente de Inkling-2-Mini.
- No dispone de modo thinking, vision ni audio propios.

## Casos de uso

- Analisis mecanicista de Inkling-2-Mini: inspeccionar que tokens "anticipa" el modelo en capas 43-47 antes de responder, para estudiar planificacion y lookback en tareas de QA.
- Investigacion de fidelidad de explicaciones: comparar la distribucion decodificada por la lente con la respuesta final para medir si el modelo "sabe" la respuesta antes de escribirla.
- Deteccion temprana de alucinacion: observar si la lente proyecta alta probabilidad sobre tokens incorrectos en capas intermedias, como senal de incertidumbre interna.
- Reproducibilidad en el Looped Lens Challenge: servir como baseline publico para que otros equipos comparen sus lentes sobre el mismo modelo base y el mismo conjunto de prompts.
- Docencia y divulgacion de interpretabilidad: ejemplo compacto (0,1 GB) de como ajustar una sonda lineal sobre estados internos sin acceso a etiquetas.
- Auditoria de sesgos internos: analizar que tokens se activan en posiciones de pregunta para estudiar asociaciones estereotipadas en el modelo base.
- Desarrollo de herramientas de depuracion para pipelines de chat: integrar la lente en un visor de estados para diagnosticar respuestas erroneas en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la lente: inferior a 1 GB (repo de 0,1 GB), pero requiere cargar simultaneamente el modelo base Inkling-2-Mini, cuyos requisitos no estan disponibles.
- GPU recomendadas: no disponible para el modelo base; para la lente basta CPU o cualquier GPU consumer.
- Cabe en GPU consumer: la lente si; el modelo base depende de su tamano, no especificado.
- Opciones de despliegue: carga directa con `safetensors` y PyTorch/NumPy; no hay integracion publicada con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Capas cubiertas | Licencia | Disponibilidad |
|---|---|---|---|---|
| skrishna/looped-lens-translator | Token lens ridge para Inkling-2-Mini | 43-47 | MIT | Hugging Face |
| Otras lentes del Looped Lens Challenge | Token lens para el mismo modelo base | no disponible | no disponible | no disponible |
| Sondas lineales genericas (logistic regression probes) | Clasificadores por capa | configurable | variable | literatura |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre las visitas de capa 43 a 47; no ofrece interpretabilidad de capas tempranas ni de la totalidad de la red.
- Entrenada exclusivamente sobre 1.629 prompts de chat propios (hechos, secuencias, aritmetica y palabras); puede generalizar mal a otros dominios como codigo, matematicas complejas o conversaciones multi-turno largas.
- La posicion de captura esta fijada al ultimo signo de interrogacion de un turno abierto; usos fuera de ese patron no estan validados.
- No es un modelo generativo: no debe desplegarse como sustituto de Inkling-2-Mini ni como clasificador de produccion.
- Riesgo de sobreinterpretacion: una proyeccion lineal no garantiza que el modelo "use" esa informacion en su respuesta final.
- Licencia MIT permite uso comercial, pero el modelo base Inkling-2-Mini puede tener condiciones propias que deben respetarse.
- Sin descargas ni validacion externa publicada; madurez y robustez no verificadas por terceros.
- No hay informacion sobre sesgos especificos ni sobre el comportamiento multilingue de la lente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skrishna/looped-lens-translator
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Looped Lens Challenge (NDIF): https://ndif.us/looped-lens-challenge/
