# harshbhx/ratchet-nemotron-nano-4b-toolcall

## Resumen

`ratchet-nemotron-nano-4b-toolcall` es un adaptador LoRA de rango 16 (40,5 MB) publicado por el usuario harshbhx sobre el modelo `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` de NVIDIA (4.000 millones de parámetros). Su única función es convertir una petición de tool calling en un objeto JSON único con la forma `{"name": ..., "arguments": {...}}`, o devolver `{"name": "none", "arguments": {}}` cuando ninguna de las herramientas declaradas encaja. No es un modelo de chat general: es una especialización estrecha del modelo base.

El adaptador se entrenó por destilación sobre 2.940 ejemplos sintéticos: las peticiones las redactó un modelo mayor (Nemotron 3 Ultra) y las etiquetas se construyeron en código, conservándose solo aquellos casos en los que una respuesta independiente del propio Ultra coincidía. Forma parte de Ratchet, una pasarela compatible con la API de OpenAI en la que un modelo pequeño responde primero y escala a uno mayor cuando no está seguro; el proyecto se presentó al hackathon Nebius x NVIDIA Global AI Hackathon. Existe un adaptador hermano para text-to-SQL del mismo autor.

Su relevancia práctica está en el salto medido sobre el modelo base sin entrenar: en un examen difícil de 150 filas nunca visto en entrenamiento pasa del 62,7 % al 90,7 % de acierto estricto, con cero respuestas correctas del base que el adaptador estropee (42 arregladas, 0 rotas; p = 4,55e-13). En el examen derivado de BFCL la mejora es marginal y podría ser azar (80,3 % frente a 77,3 %). El repositorio contiene solo el adaptador: el modelo base y su tokenizador no se redistribuyen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | 4B en el modelo base; el adaptador anade 40,5 MB (rango 16) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el modelo base se publica en BF16 y el adaptador en safetensors |
| Idiomas soportados | Ingles (`en`) |
| Licencia | NVIDIA Nemotron Open Model License (`license: other`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |
| Libreria | peft |
| Tamano del repositorio | 0,0 GB (solo el adaptador) |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 |
| Descargas / likes | 33 / 0 |
| Fecha de creacion | 2026-10-24 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 sobre el modelo base de NVIDIA. No se documenta en la informacion disponible la arquitectura interna del Nemotron 3 Nano 4B (número de capas, tipo de atención, vocabulario), por lo que no se puede confirmar si emplea atención lineal, decodificación especulativa u otra innovación. Lo que sí se especifica es el formato de salida objetivo: un único objeto JSON con las claves `name` y `arguments`, incluido el caso de rechazo explícito `{"name": "none", "arguments": {}}`, lo que fuerza al modelo a decidir también cuándo no debe invocar ninguna herramienta.

El entrenamiento es una destilación sobre datos sintéticos generados por un profesor de mayor tamaño (Nemotron 3 Ultra). El pipeline tiene dos filtros: las peticiones las escribió el profesor y las etiquetas se construyeron de forma programática, no generadas libremente; además, cada ejemplo se conservó únicamente si una respuesta independiente del profesor coincidía con esa etiqueta. El conjunto final son 2.940 ejemplos. El ajuste se realizó a mano en una GPU T4 alquilada, y las respuestas del profesor se obtuvieron a través de Nebius Token Factory. No se indica en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Tool calling estricto: devuelve una llamada a herramienta como objeto JSON único, con nombre y argumentos.
- Detección de no-coincidencia: emite `{"name": "none", "arguments": {}}` cuando ninguna herramienta del listado resuelve la petición.
- Selección entre múltiples herramientas declaradas en el prompt.
- Relleno de argumentos a partir de lenguaje natural, incluidos tipos de datos como fechas (medido en el examen por categorías: 22/30 = 73,3 % en la categoría `date`).
- Ajuste sobre herramientas no vistas en entrenamiento: el examen *hard* está diseñado con herramientas no presentes en el conjunto de entrenamiento.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Generación de texto libre o razonamiento abierto: no es su objetivo declarado, aunque el adaptador se aplica sobre un modelo de generación de texto.
- Integración en agentes: pensado para una pasarela compatible con OpenAI con escalado a un modelo mayor cuando el pequeño no está seguro.

## Casos de uso

- Pasarela de agentes con escalado: desplegar el adaptador como primer escalón de Ratchet para resolver llamadas a herramientas sencillas en local y delegar en Nemotron 3 Ultra solo los casos dudosos, reduciendo coste por petición y manteniendo la latencia baja en el camino mayoritario.
- Enrutado de funciones en asistentes de código: dado un catálogo de herramientas (`buscar_repo`, `abrir_issue`, `ejecutar_test`), traducir la instrucción del usuario a la llamada JSON exacta que espera el orquestador.
- Extracción de parámetros estructurados en backoffice: convertir correos o mensajes de soporte en llamadas a APIs internas (`crear_ticket`, `consultar_pedido`) con los argumentos ya tipados, evitando una capa de parseo frágil con expresiones regulares.
- Automatización de operaciones con fecha y hora: la categoría `date` es la mejor medida del adaptador (73,3 %), lo que lo hace utilizable para agendar, reservar o filtrar por rangos temporales en herramientas de calendario.
- Abstención controlada en producción: el comportamiento `none` permite descartar peticiones fuera de catálogo antes de ejecutar una herramienta, lo que sirve como guarda previa en flujos donde una llamada errónea tiene coste real.
- Base para ajuste específico de dominio: al ser un LoRA de 40,5 MB sobre un modelo de 4B, un equipo puede partir de este adaptador y reentrenar sobre su propio catálogo de herramientas con requisitos de GPU modestos.
- Experimentación académica en destilación: reproduce un pipeline de destilación con verificación por acuerdo entre profesor y etiqueta programática, útil como referencia metodológica.

## Benchmarks y rendimiento

Datos declarados por el autor (`verified: false`), con puntuación estricta de la llamada exacta y una única configuración de decodificación, sobre dos exámenes nunca vistos en entrenamiento:

| Examen | Nano 4B sin entrenar | Nano 4B + adaptador | Nemotron 3 Ultra (profesor) |
|---|---|---|---|
| Hard (150 filas) | 94/150 = 62,7 % (54,7-70,0) | 136/150 = 90,7 % (84,9-94,4) | 137/150 = 91,3 % (85,7-94,9) |
| BFCL (300 filas) | 232/300 = 77,3 % (72,3-81,7) | 241/300 = 80,3 % (75,5-84,4) | 265/300 = 88,3 % (84,2-91,5) |

Comparación por pares sobre las mismas filas:

| Examen | Respuestas arregladas | Respuestas rotas | Test de signos exacto |
|---|---|---|---|
| Hard | 42 | 0 | p = 4,55e-13 |
| BFCL | 15 | 6 | p = 0,0784 |

Desglose por tipo de argumento (adaptador, aciertos sobre respondidas), parcialmente disponible en la informacion:

| Examen | Tipo | Acierto |
|---|---|---|
| Hard | date | 22/30 = 73,3 % (55,6-85,8) |

Lectura de los datos: en el examen *hard* la mejora sobre el modelo base es concluyente (los intervalos del 95 % no se solapan) y el adaptador iguala estadísticamente al profesor Ultra. En el examen BFCL la diferencia frente al base no es significativa y el adaptador queda por debajo de Ultra. No hay MMLU, HumanEval, GSM8K ni ninguna otra métrica en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño del base, no dato publicado): en BF16, aproximadamente 8-9 GB para los pesos de 4B más overhead de contexto; en cuantización de 4 bits, del orden de 3-4 GB.
- El adaptador en sí ocupa 40,5 MB y se carga sobre el modelo base; no existe un checkpoint fusionado en el repositorio.
- GPU recomendadas: el adaptador se entrenó en una T4 (16 GB), por lo que cualquier GPU con al menos 8 GB en BF16 es suficiente; A100 y H100 son innecesarias salvo para servir en lote a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) usando BF16; con cuantización de 4 bits, en tarjetas de 4-6 GB.
- Opciones de despliegue: carga con `peft` + `transformers`; servicio con vLLM (soporta adaptadores LoRA dinámicos) o TGI. Para llama.cpp u Ollama es necesario fusionar el adaptador en los pesos y convertir el resultado a GGUF, ya que estos motores no cargan el adaptador PEFT directamente.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling (estricto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ratchet-nemotron-nano-4b-toolcall | 4B (base) + LoRA r16 | No disponible | 90,7 % hard / 80,3 % BFCL | NVIDIA Nemotron Open Model License | Adaptador en HF (33 descargas) |
| NVIDIA Nemotron 3 Nano 4B (base) | 4B | No disponible | 62,7 % hard / 77,3 % BFCL | NVIDIA Nemotron Open Model License | Modelo completo en HF |
| NVIDIA Nemotron 3 Ultra (profesor) | No disponible | No disponible | 91,3 % hard / 88,3 % BFCL | No disponible en la informacion | Uso como profesor via Nebius Token Factory |
| ratchet-nemotron-nano-4b-text2sql (hermano) | 4B (base) + LoRA | No disponible | No aplica (text-to-SQL) | NVIDIA Nemotron Open Model License | Adaptador en HF |

Frente al modelo base, el adaptador solo merece la pena si el dominio se parece al examen *hard* (herramientas no vistas, argumentos con tipos exigentes); en un conjunto tipo BFCL la ganancia es indistinguible del ruido. Frente al profesor Ultra, el adaptador iguala en el examen difícil pero pierde 8 puntos en BFCL, a cambio de ejecutarse en local con un modelo de 4B.

## Limitaciones y advertencias

- Ámbito muy estrecho: solo tool calling; no está entrenado ni evaluado para diálogo abierto, razonamiento de múltiples pasos, matemáticas o generación de código.
- Solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Las métricas provienen de exámenes pequeños (150 y 300 filas), con una única configuración de decodificación y sin verificación independiente (`verified: false`). Los propios intervalos de confianza son amplios.
- El autor advierte explícitamente de que los resultados no constituyen una afirmación general sobre la calidad de tool calling del modelo.
- En BFCL la mejora sobre el base no es estadísticamente significativa y el adaptador rompe 6 respuestas que el base acertaba.
- Riesgo de alucinación de nombres de herramienta o de argumentos: el formato de salida obliga a emitir un JSON, y no se documenta ningún mecanismo de validación en el adaptador; conviene validar el esquema en el servidor antes de ejecutar la llamada.
- El rendimiento por tipo de argumento es desigual: la categoría `date` se queda en 73,3 %, por debajo de la media global del examen.
- Sesgos: no hay información disponible sobre evaluación de sesgos del adaptador ni del modelo base.
- Licencia: NVIDIA Nemotron Open Model License, no es una licencia OSI de uso libre sin condiciones; hay que revisar sus términos antes de un despliegue comercial. El modelo base se rige por su propia licencia y debe descargarse por separado.
- El repositorio no redistribuye el modelo base ni el tokenizador, de modo que el adaptador no es utilizable de forma autónoma.
- El bucle nocturno de la arquitectura Ratchet está "construido y probado en simulación" según el autor; no hay evidencia de producción a escala.
- Con 33 descargas y 0 likes, no existe validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harshbhx/ratchet-nemotron-nano-4b-toolcall
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Coleccion Ratchet: https://huggingface.co/collections/harshbhx/ratchet
- Repositorio del proyecto Ratchet: https://github.com/harshbhx/ratchet
- Adaptador hermano text-to-SQL: https://huggingface.co/harshbhx/ratchet-nemotron-nano-4b-text2sql
- Dataset de entrenamiento: https://huggingface.co/datasets/harshbhx/ratchet-toolcall-train
- Examen hard: https://huggingface.co/datasets/harshbhx/ratchet-toolcall-exam-hard
- Examen BFCL: https://huggingface.co/datasets/harshbhx/ratchet-toolcall-exam-bfcl
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/

Nota: la búsqueda web asociada a esta ficha devolvió únicamente resultados sin relación con el modelo (herramientas de generación de imágenes y contenido para adultos), por lo que no se incluyen como fuentes.
