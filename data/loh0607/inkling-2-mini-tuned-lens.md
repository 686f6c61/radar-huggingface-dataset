# loh0607/inkling-2-mini-tuned-lens

## Resumen

Inkling 2 Mini Tuned Lens es un artefacto de interpretabilidad publicado por la investigadora independiente loh0607 (Lohitha) sobre el modelo base `thinkingmachines/Inkling-2-Mini`, un transformer con arquitectura "looped" en el que las capas 6 a 17 se ejecutan tres veces, produciendo 48 visitas de capa por token a partir de solo 24 capas fisicas. El paquete no contiene los pesos del modelo: incluye 12 traductores lineales de 2304 × 2304 entrenados para mapear estados ocultos intermedios al "espacio" de la capa final, de forma que la cabeza de salida original del modelo pueda leerlos directamente.

La tecnica subyacente es el **tuned lens** descrito por Belrose et al. (2023) en *Eliciting Latent Predictions from Transformers with the Tuned Lens* (arXiv:2303.08112). Frente al clasico *logit lens*, que aplica sin mas la cabeza de salida a un estado intermedio, el tuned lens aprende una transformacion afín por capa (`A @ h + b`) que corrige la deriva de representacion entre capas. En este caso, los traductores elevan la coincidencia de la palabra predicha respecto al logit lens del 1-25 % al 48-72 %, segun la visita de capa.

Es relevante ahora porque los modelos con pesos compartidos y multiples pasadas (looped transformers) son una linea activa de investigacion en eficiencia de parametros, y las herramientas de interpretabilidad estandar asumen una correspondencia biunivoca capa-visita que aqui no se cumple. Este release es una **version de investigacion** (0 descargas, 0 likes en el momento de la consulta, publicada el 27 de noviembre de 2026) y esta pensada para quienes analizan el flujo residual interno de Inkling 2 Mini, no para inferencia generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tuned lens sobre transformer con capas repetidas (looped transformer); 12 traductores lineales de 2304 × 2304 + sesgo de 2304 |
| Parametros totales | No disponible (los traductores suman 12 × (2304² + 2304) ≈ 63,8 M de parametros; el modelo base no se incluye en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Inkling 2 Mini) |
| Tipos de cuantizacion | No disponible; pesos de los traductores en fp16 |
| Idiomas soportados | No disponible (los datos de entrenamiento del lens son TinyStories en ingles y preguntas cortas en formato chat) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (`translators.safetensors`) y `params.pt` en el formato de la coleccion `tuned-lens` |

## Arquitectura y entrenamiento

Cada traductor es una transformacion afín `A @ h + b` que se aplica al estado oculto `h` en la entrada de una visita de capa concreta; la salida pasa despues por la normalizacion final y la tabla de salida propias de Inkling 2 Mini. Los traductores se inicializan como identidad (equivalente exacto al logit lens) y se entrenan con Adam durante 4 epocas, minimizando la divergencia KL entre la prediccion del lens y la prediccion real del modelo en la capa final. La cobertura es de 12 de las 48 visitas: la visita 5 (preludio), las visitas 9, 12 y 15 en cada una de las tres pasadas del bucle (visitas 9/12/15, 21/24/27 y 33/36/39) y las visitas 43 y 45 (coda, capas fisicas 19 y 21). El mapeo completo visita-capa esta en `layer_visits.json`.

El conjunto de entrenamiento es reducido: 150 pasajes (texto de TinyStories y preguntas cortas en formato chat) de unas 30 posiciones cada uno, lo que arroja 4.127 posiciones por visita, divididas en 3.303 de entrenamiento y 824 de validacion. Esta escala limitada de datos, junto con el uso de fp16, es una de las principales fuentes de incertidumbre sobre la generalizacion de los traductores fuera del dominio de entrenamiento.

## Capacidades

- Lectura de predicciones latentes: proyecta estados ocultos intermedios al espacio de la capa final para inspeccionar que token predecia el modelo en cada visita de capa.
- Seguimiento del bucle: al cubrir las tres pasadas de las capas 6-17, permite comparar como evoluciona la prediccion a lo largo de las repeticiones.
- Compatibilidad con la coleccion `tuned-lens` de Alignment Research, lo que facilita reutilizar su codigo de evaluacion y visualizacion.
- Integracion con NDIF para acceder al modelo base sin descargar pesos localmente.
- No realiza generacion de texto, tool calling, razonamiento multi-paso, vision ni audio por si mismo: es un instrumento de analisis, no un modelo generativo.

## Casos de uso

- Analisis de flujo residual en looped transformers: inspeccionar en que pasada del bucle el modelo "decide" el siguiente token, comparando las visitas 9, 21 y 33 para la misma capa fisica.
- Investigacion en interpretabilidad mecanicista: usar los traductores como linea base para estudiar si la informacion intermedia se recupera linealmente, y contrastarlo con sondas entrenadas sobre el estado oculto.
- Docencia y divulgacion: ilustrar la diferencia entre logit lens y tuned lens con un caso real donde el logit lens falla estrepitosamente (1-5 % de acierto en las capas del bucle frente al 48-60 % del lens afin).
- Auditoria de sesgos de prediccion temprana: examinar que palabras candidatas aparecen en capas tempranas antes de que el modelo las emita, util para detectar sesgos que se forman en el preludio.
- Validacion de tecnicas de early exit: medir la calidad de la prediccion en visitas intermedias para decidir si es viable salir antes en tareas de baja exigencia.
- Reproduccion de resultados: el repo incluye scripts de entrenamiento y evaluacion, de modo que un equipo puede reentrenar los traductores con mas datos o cubrir las 36 visitas restantes.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre pasajes reservados (824 posiciones por visita). La metrica es la frecuencia con la que la palabra mas probable segun el lens coincide con la prediccion final real de Inkling 2 Mini:

| Zona | Visitas | Logit lens | Tuned lens |
|---|---|---|---|
| Preludio (capa 5) | 5 | 3 % | 57 % |
| Bucle, pasadas 1-3 (capas 9, 12, 15) | 9, 12, 15, 21, 24, 27, 33, 36, 39 | 1-5 % | 48-60 % |
| Coda (capas 19, 21) | 43, 45 | 12-25 % | 66-72 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni tendria sentido para un artefacto de interpretabilidad.

## Requisitos de hardware

- El repositorio pesa 0,3 GB; los 12 traductores en fp16 ocupan aproximadamente 128 MB, por lo que caben en cualquier GPU consumer, incluso en CPU.
- La inferencia real requiere el modelo base Inkling 2 Mini, cuyos requisitos de VRAM no estan disponibles en la informacion proporcionada.
- Alternativa sin hardware propio: ejecutar el modelo base a traves de NDIF (ndif.us) y aplicar los traductores localmente sobre los estados ocultos extraidos.
- Despliegue: no aplica vLLM, llama.cpp ni Ollama (no hay pesos generativos); el consumo es via PyTorch y la libreria `tuned-lens`.
- Latencia y throughput: no disponibles; el coste dominante es la extraccion de estados ocultos del modelo base, no la aplicacion del lens.

## Comparativa con modelos similares

| Artefacto | Modelo base | Cobertura | Metrica (acierto top-1) | Licencia |
|---|---|---|---|---|
| Este tuned lens (loh0607) | Inkling 2 Mini (looped, 48 visitas) | 12 de 48 visitas | 48-72 % | Apache 2.0 |
| Logit lens (baseline sin entrenar) | Cualquiera | Todas las capas | 1-25 % en este modelo | No aplica |
| Tuned lens de Belrose et al. (2023) | GPT-2, Pythia, etc. | Todas las capas | No disponible en la informacion proporcionada | MIT (codigo) |
| Sondas sobre estado oculto | Especifico por tarea | Punto unico | No disponible | No disponible |

No se conocen otros tuned lens publicados especificamente para Inkling 2 Mini en la informacion disponible.

## Limitaciones y advertencias

- Cobertura parcial: solo 12 de las 48 visitas, y siempre leidas en la **entrada** de la visita, no en su salida.
- Conjunto de entrenamiento muy pequeno (4.127 posiciones por visita, dominio TinyStories y chat corto); la generalizacion a otros dominios o idiomas no esta validada.
- Pesos en fp16, lo que puede introducir error numerico en la comparacion con el modelo base en bf16 o fp32.
- El autor advierte explicitamente que el tuned lens lee lo que el modelo **esta a punto de decir**, no pasos intermedios de razonamiento ocultos; para eso hace falta una sonda entrenada sobre el estado oculto.
- No es un modelo generativo: no debe usarse para producir texto, codigo ni respuestas.
- Requiere acceso al modelo base y a sus estados ocultos; sin Inkling 2 Mini los traductores son inutiles.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base puede tener condiciones propias que deben verificarse por separado.
- Publicacion de investigacion con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loh0607/inkling-2-mini-tuned-lens
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Paper del tuned lens: https://arxiv.org/abs/2303.08112
- Codigo y scripts de entrenamiento: https://github.com/Lohitha0607/looped-reasoning
- Entrada de blog del autor: https://lohitha0607.github.io/2026/11/27/looped-reasoning.html
- Libreria tuned-lens: https://github.com/AlignmentResearch/tuned-lens
- NDIF (acceso remoto al modelo): https://ndif.us
