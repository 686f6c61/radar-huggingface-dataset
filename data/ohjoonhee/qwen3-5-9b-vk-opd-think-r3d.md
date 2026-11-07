# ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3d

## Resumen

Qwen3.5-9B-VK-OPD-think-R3d es un checkpoint de investigacion derivado de Qwen/Qwen3.5-9B mediante ajuste fino completo de las capas del modelo de lenguaje y la normalizacion final, almacenado en bf16. Lo publica el usuario ohjoonhee en Hugging Face como parte de una linea de trabajo privada sobre destilacion on-policy (VK-OPD, por *on-policy distillation*) orientada a resolver conflictos de conocimiento: situaciones en las que lo que muestra una imagen contradice lo que es cierto en el mundo real. El modelo conserva la torre de vision del modelo base y se distribuye con pipeline image-text-to-text, aunque el autor solo ha ajustado las capas de lenguaje.

La innovacion central no esta en la arquitectura, sino en el procedimiento de entrenamiento. Se usan como profesores copias congeladas del modelo base dotadas de contexto privilegiado (un *system prompt* que indica si debe responder segun la imagen o segun el conocimiento general), y se calcula la ventaja por token como la diferencia entre el logaritmo de la probabilidad del profesor y la del estudiante sobre las propias muestras del estudiante. La ronda 3 introduce un muestreador dinamico de familias de preguntas de estilo Nash-MOPD que incrementa la frecuencia de aquellas familias en las que la brecha con el profesor se cierra mas lentamente.

El resultado es un modelo de 9.409.813.744 parametros que mejora de forma notable la consistencia ante conflictos de conocimiento respecto al base: en la evaluacion privada del autor, la metrica agregada All-4 sube de 43,5 a 60,0 puntos, con un intervalo de confianza del 95 % de [+13,6, +19,7] puntos porcentuales. Es, por tanto, un artefacto de investigacion reproducible y acotado, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (torre de vision + capas de lenguaje); el checkpoint contiene solo las capas de lenguaje y la normalizacion final ajustadas |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento usa rollouts de hasta 4.096 tokens y la evaluacion hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), libreria transformers; tamano del repo 18,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo de las capas del modelo de lenguaje y de la normalizacion final. La cabeza MTP (*multi-token prediction*) del modelo base no se incluye en el checkpoint. El pipeline declarado es image-text-to-text, de modo que la entrada incluye imagen y pregunta, aunque el autor no detalla cambios en la torre de vision.

El entrenamiento es una destilacion on-policy: los profesores son el modelo base congelado con contexto privilegiado. Para preguntas sobre la foto, el profesor recibe la imagen y un *system prompt* del tipo "responde con lo que realmente se muestra en la imagen, aunque difiera de lo tipico"; para preguntas de conocimiento, recibe la imagen y un *system prompt* que le pide responder con lo que es generalmente cierto en el mundo real aunque la foto muestre otra cosa. La ventaja por token se define como log π_profesor − log π_estudiante sobre las muestras generadas por el estudiante, y el turno de usuario (imagen, pregunta y cualquier pista) es identico para estudiante y profesor. Los datos son los mismos que en la ronda R3c, con pesos por familia que arrancan en los de R3c y se adaptan dentro de limites (0,25-0,60 para preguntas simples y 0,05-0,40 para familias especificas); solo se usan pares de imagen en los que el profesor acerto todos los items en 2 de 2 muestras (280 imagenes de conflicto y 80 ordinarias).

La innovacion de esta ronda es el muestreador dinamico de familias tipo Nash-MOPD: cada 10 pasos, tras un calentamiento de 20 pasos, se muestrean con mas frecuencia las familias cuya brecha con el profesor se cierra lentamente. La configuracion concreta es de 80 pasos, tasa de aprendizaje 3e-6 con 5 pasos de calentamiento, 8 pares de imagen (16 prompts) por paso con 4 rollouts por paso, rollouts de hasta 4.096 tokens y 4 GPU H100. El checkpoint publicado corresponde al paso 80, seleccionado sobre el split de desarrollo (semilla 3).

## Capacidades

- Generacion de texto y razonamiento en modo *thinking*: la evaluacion se realizo con el modo de pensamiento activado y la respuesta se extrae del texto posterior a `</think>`.
- Comprension de imagenes en preguntas que requieren leer lo que aparece en la foto (metrica CV, con 81,5 puntos en la evaluacion del autor).
- Manejo explicito de conflictos de conocimiento: distingue entre responder segun la evidencia visual y responder segun el conocimiento general del mundo, que es precisamente lo que el entrenamiento busca alinear.
- Respuestas de formato corto: el protocolo de evaluacion pide responder con una sola palabra o frase, y el modelo se evalua con ese formato.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio o vision avanzada mas alla de image-text-to-text: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre conflictos de conocimiento multimodal: el modelo sirve como punto de comparacion controlado frente al base y frente a la ronda 1 para medir cuanto mejora la consistencia cuando la imagen contradice el conocimiento previo, usando las metricas CV, CK, NV, NK, All-4 y KT del autor.
- Reproduccion de experimentos de destilacion on-policy: al estar publicados el paso, la semilla, la tasa de aprendizaje, el numero de rollouts y el hardware, permite replicar o extender el protocolo VK-OPD con variantes del muestreador de familias.
- Evaluacion de robustez ante imagenes enganosas: util para construir suites de prueba en las que se muestra, por ejemplo, un objeto con un color atipico y se pregunta por el color real o por el color visible, comprobando si el modelo separa ambas nociones.
- Anotacion asistida con criterio explicito: en tareas de etiquetado donde conviene fijar por *system prompt* si se debe priorizar la evidencia visual o el conocimiento general, el modelo ha sido entrenado para responder a esa distincion.
- Punto de partida para ajuste fino posterior: sus pesos en bf16 y su licencia Apache 2.0 permiten usarlo como inicializacion en experimentos academicos sobre vision y lenguaje de ~9.000 millones de parametros.
- Analisis de calibracion y fidelidad al profesor: al conocerse la definicion exacta de la ventaja por token, sirve para estudiar la relacion entre la brecha con el profesor y el comportamiento final del estudiante en un conjunto pequeno y controlado de familias de preguntas.

## Benchmarks y rendimiento

Evaluacion privada del autor (test v3, imagenes naturales, n = 1.186, modo thinking activado, muestreo de la model card, 1 muestra). Las columnas CV, CK, NV y NK son las cuatro metricas parciales; All-4 es el agregado de las cuatro y KT una metrica adicional de conocimiento.

| Modelo | CV | CK | NV | NK | All-4 | KT |
|---|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 80,2 | 67,7 | 84,0 | 90,7 | 43,5 | 93,0 |
| Qwen3.5-9B-VK-OPD-think (ronda 1) | 83,2 | 93,8 | 83,1 | 93,2 | 65,6 | 92,9 |
| Qwen3.5-9B-VK-OPD-think-R3d (este modelo) | 81,5 | 93,8 | 82,5 | 89,2 | 60,0 | 93,6 |

La mejora de All-4 frente al base es de +16,5 puntos porcentuales, con intervalo de confianza del 95 % de [+13,6, +19,7] obtenido por bootstrap de pares. El autor advierte que se trata de una sola semilla. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para los pesos, mas el espacio de activaciones y cache KV; en la practica requiere GPUs de 24 GB o mas para secuencias cortas y de 40-80 GB para contextos largos.
- Entrenamiento: el autor uso 4 GPU H100 para 80 pasos con 16 prompts y 4 rollouts por paso, con rollouts de hasta 4.096 tokens.
- GPU recomendadas: H100 o A100 para entrenamiento y para inferencia con contexto largo; en el segmento de consumo, una RTX 4090 (24 GB) puede alojar los pesos en bf16 pero con margen muy ajustado, por lo que conviene cuantizar.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con cuantizacion o con secuencias cortas; en tarjetas de 16 GB solo con cuantizaciones agresivas, no publicadas por el autor.
- Opciones de despliegue: transformers es la libreria declarada; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | All-4 (test privado v3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-VK-OPD-think-R3d | 9.409.813.744 | no disponible | 60,0 | Apache 2.0 | publico en Hugging Face |
| Qwen3.5-9B (base) | no disponible | no disponible | 43,5 | no disponible en la informacion | publico en Hugging Face |
| Qwen3.5-9B-VK-OPD-think (ronda 1) | no disponible | no disponible | 65,6 | Apache 2.0 (segun la ficha enlazada) | publico en Hugging Face |

La comparacion se limita a la familia del propio autor porque no hay datos de benchmarks estandar que permitan contrastar con otros modelos de ~9.000 millones de parametros. En la metrica agregada, la ronda 1 supera a este checkpoint (65,6 frente a 60,0), mientras que este modelo mejora ligeramente en KT (93,6 frente a 92,9) y empata en CK (93,8). El autor presenta el checkpoint como material de comparacion dentro de la ronda 3, no como una version superior a la ronda 1.

## Limitaciones y advertencias

- Es un checkpoint de investigacion privado, explicitamente descrito por el autor como "not a release"; no debe tratarse como un modelo estable para produccion.
- Los resultados se basan en una sola semilla y en un test privado del autor (n = 1.186), no en benchmarks publicos reproducibles de forma independiente.
- No se incluye la cabeza MTP del modelo base, por lo que no puede usarse para decodificacion especulativa basada en esa cabeza.
- Solo se han ajustado las capas de lenguaje y la normalizacion final; el comportamiento de la torre de vision es el del modelo base y no se documenta ningun ajuste sobre ella.
- El entrenamiento usa exclusivamente pares de imagen en los que el profesor acerto todos los items en 2 de 2 muestras (280 de conflicto y 80 ordinarias), lo que puede limitar la generalizacion a casos ambiguos o dificiles.
- Idiomas soportados no documentados; no hay garantia de rendimiento fuera del idioma o idiomas usados en la evaluacion.
- Riesgo de alucinacion y sesgos: no se documentan analisis especificos en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantias ni soporte y desaconseja su uso como release.
- El formato de respuesta evaluado es de una sola palabra o frase; no se ha validado el comportamiento en generaciones largas o conversacionales abiertas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3d
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ronda 1 (VK-OPD-think): https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think
