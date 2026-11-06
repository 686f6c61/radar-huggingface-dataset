# HAL-X-AI/THX-02

## Resumen

THX-02 es un modelo de decisión ("decision model") desarrollado por HAL-X-AI, presentado como sucesor de THX-01 (0,3 B). A diferencia de un LLM generativo convencional, THX-02 recibe un *estado* (un mensaje, un ticket, un documento, un registro JSON, una traza de agente, una imagen o un gráfico) junto con un conjunto de preguntas tipadas redactadas en lenguaje natural, y devuelve para cada pregunta una distribución de probabilidad completa sobre las opciones suministradas. No genera texto libre salvo cuando activa su modo de razonamiento ("thinking"), y nunca inventa opciones fuera del conjunto proporcionado.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 B) más un adaptador de razonamiento de 60 M, y está entrenado para contextos de hasta 32k tokens por petición. Soporta tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (sí/no) y `score` (escala ordenada). Es multimodal (texto, imágenes y gráficos, hasta 4 imágenes por petición) y multilingüe, con entrenamiento y evaluación en más de 20 idiomas durante el post-entrenamiento.

Su relevancia práctica radica en la combinación de latencia baja (mediana de 50 ms sin thinking y 79 ms con thinking autogestionado en una RTX PRO 6000; 129 peticiones por segundo en una RTX 4090), calibración de probabilidades y ausencia de reentrenamiento para nuevas tareas, ya que el conjunto de etiquetas forma parte de la propia petición. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión con adaptador de razonamiento separado) |
| Parametros totales | 4.539.265.536 (4,5 B) + 60 M del adaptador de thinking |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | entrenado hasta 32k tokens por petición |
| Tipos de cuantizacion | BF16 en GPU; BF16 o FP32 en CPU (no se documentan otras) |
| Idiomas soportados | en, az, zh, kk, uz, ky, ja, es, ru, tr (entrenado y evaluado en más de 20 idiomas en post-entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del backbone (no se especifica si es un transformer denso, MoE o híbrido). Lo que sí se documenta es la separación en dos componentes: un modelo de decisión de 4,5 B y un adaptador de razonamiento ("think adapter") de 60 M que se activa de forma autogestionada cuando el modelo detecta incertidumbre y la pregunta requiere razonamiento. El modelo está diseñado para producir directamente una distribución de probabilidad sobre opciones tipadas (`choice`, `noul`, `score`) en lugar de texto libre, lo que implica una cabeza de clasificación calibrada sobre el estado de entrada y las instrucciones de cada pregunta.

En cuanto a datos de entrenamiento, la model card menciona que el post-entrenamiento cubre más de 20 idiomas, pero no se especifica el número de tokens, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La innovación destacada es funcional: el conjunto de etiquetas y las instrucciones de cada pregunta forman parte de la petición, de modo que el modelo no requiere reentrenamiento para nuevas tareas de clasificación o enrutamiento. El modelo se distribuye con la librería `thx02`, que incluye un cliente sin dependencias y una ruta GPU compilada opcional (`requirements-fast.txt`).

## Capacidades

- Clasificación zero-shot con etiquetas definidas en la petición: preguntas de tipo `choice` con hasta 255 opciones, `noul` (sí/no) y `score` (escala ordenada).
- Salida calibrada: cada respuesta es una distribución de probabilidad completa sobre las opciones suministradas, con campo de confianza; el modelo no inventa opciones.
- Modo thinking autogestionado: cuando el modelo es incierto y la pregunta lo requiere, escribe un breve pensamiento antes de decidir; puede forzarse con `think=True` o dejarse en `think="auto"`.
- Multimodalidad: acepta texto, imágenes y gráficos en la misma petición, con hasta 4 imágenes (por ejemplo, capturas de pantalla o gráficos de series temporales).
- Multilingüe: entrenado y evaluado en más de 20 idiomas en post-entrenamiento; la model card cita 10 idiomas en metadatos (en, az, zh, kk, uz, ky, ja, es, ru, tr).
- Procesamiento por lotes: endpoint `/v1/decide/batch` para decidir múltiples estados en una sola llamada.
- Uso en agentes: la demo de "screen agent" muestra al modelo eligiendo botones numerados sobre capturas de pantalla para completar objetivos de varios pasos.
- No se documenta soporte explícito de tool calling ni de function calling en el sentido habitual de los LLM generativos.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de cada departamento (`billing`, `support`, `sales`) junto con prioridad y sentimiento; con umbrales de confianza (por ejemplo, 0,60) los casos dudosos se derivan a revisión humana. La demo de clasificación en vivo procesa 24 mensajes en 16 idiomas en una sola llamada de 641 ms.
- Control de calidad visual en línea de producción: la demo de clasificación de huevos usa un detector de vocabulario abierto para dibujar las cajas y THX-02 decide `clean`, `dirty` o `cracked` para cada huevo (16 huevos por fotograma en una RTX 4090). El patrón es aplicable a inspección de piezas, defectos de fabricación o verificación de etiquetado.
- Extracción de decisiones sobre documentos y registros JSON: dado un registro estructurado y preguntas tipadas, el modelo devuelve probabilidades por campo, lo que permite construir pipelines de validación con umbrales de confianza en lugar de parsear texto libre.
- Agentes que operan interfaces gráficas: la demo de reserva de vuelos muestra al modelo interpretando capturas de pantalla con botones numerados y eligiendo la acción siguiente para cumplir un objetivo multi-paso ("el vuelo más barato de Bakú a Estambul el 24 de octubre que salga antes del mediodía, para 2 adultos").
- Análisis de gráficos financieros: con una imagen de un gráfico (por ejemplo, inflación y tipo de política, 2018-2025) y una pregunta `choice`, el modelo responde en qué año el tipo real fue más negativo, sin necesidad de OCR ni de extracción tabular previa.
- Moderación y triaje de contenido: preguntas `noul` y `score` sobre mensajes de usuario permiten obtener probabilidades calibradas de que un mensaje sea abusivo o el grado de frustración del cliente, útiles para priorizar colas de revisión.
- Clasificación multilingüe sin reentrenamiento: al formar parte la etiqueta de la petición, un mismo despliegue cubre nuevos dominios e idiomas cambiando solo las instrucciones y los criterios, sin fine-tuning.

## Benchmarks y rendimiento

| Metrica | THX-02 | THX-01 (0,3 B) |
|---|---|---|
| Decision Index 0.3 (con thinking) | 65,06 | 11,30 |
| Decision Index 0.3 (sin thinking) | 63,83 | no disponible |
| Decision Vision Index (conjuntos públicos) | 72,19 | no disponible |

Datos de latencia y throughput publicados en la model card:

| Metrica | Valor |
|---|---|
| Latencia mediana sin thinking (RTX PRO 6000) | 50 ms por petición |
| Latencia mediana con thinking autogestionado (RTX PRO 6000) | 79 ms por petición |
| Throughput (RTX 4090) | 129 peticiones por segundo |
| Lote de 24 mensajes en 16 idiomas (`/v1/decide/batch`) | 641 ms en una RTX 4090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: no disponible de forma explícita; con 4,5 B de parámetros más el adaptador de 60 M, el peso en BF16 ronda los 9 GB, lo que encaja con el tamaño del repositorio (9,6 GB). En FP32 en CPU el requisito de memoria sería aproximadamente el doble.
- GPU recomendadas según la model card: RTX PRO 6000 (latencia de 50-79 ms por petición) y RTX 4090 (129 peticiones por segundo).
- GPU de consumo: por el tamaño en BF16, el modelo debería caber en GPU de consumo con 12-16 GB o más de VRAM, aunque la model card no publica una lista de GPUs de consumo validadas.
- Despliegue: paquete `thx02` de PyPI con cliente sin dependencias y modo local (`thx02[local]`, `THX02.load(...)`), ruta GPU compilada opcional (`requirements-fast.txt`), servidor propio accesible vía `Client(base_url="http://host:8200")` y API alojada en `api.hal-x.ai`. También se documenta el uso en Android con Termux. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; en CPU el rendimiento no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| THX-02 | 4,5 B + 60 M think adapter | 32k tokens | Modelo de decisión con salida de probabilidades, multimodal | Apache-2.0 | Hugging Face, PyPI, API alojada |
| THX-01 | 0,3 B | no disponible | Modelo de decisión (predecesor) | no disponible en la informacion | Hugging Face (doofz/THX-01) |
| LLM generativos de tamaño similar (por ejemplo, familias de 3-8 B) | 3-8 B | variable | Generación de texto libre con clasificación vía prompting | variable | amplia |

La información disponible no incluye comparaciones con modelos de clasificación zero-shot dedicados (por ejemplo, NLI-based) ni con LLMs generativos concretos; la única comparación publicada es contra THX-01, con una diferencia de 65,06 frente a 11,30 en el Decision Index 0.3 con thinking.

## Limitaciones y advertencias

- El modelo solo responde a preguntas tipadas sobre opciones suministradas; no es un generador de texto libre y no debe usarse como tal.
- Riesgo de calibración deficiente fuera de distribución: aunque la model card destaca la calibración, no se publican curvas de fiabilidad ni datos de calibración por idioma o dominio.
- Cobertura lingüística declarada de forma inconsistente: los metadatos listan 10 idiomas, mientras que la model card afirma más de 20 en post-entrenamiento; conviene validar el rendimiento en los idiomas concretos de producción.
- Contexto limitado a 32k tokens por petición y a un máximo de 4 imágenes por solicitud.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del servicio de la API alojada (`api.hal-x.ai`) si se usa el tier gratuito, que está limitado por IP.
- El repositorio tiene 0 descargas y 11 likes en el momento de la consulta, lo que indica una adopción aún muy limitada; el ecosistema (`library_name: thx02`) es propio y no estándar, lo que puede complicar la integración con herramientas existentes.
- Las demos (control de calidad de huevos, agente de pantalla) usan componentes externos no incluidos en la release, como el detector de vocabulario abierto; no deben tomarse como capacidades end-to-end del modelo por sí solo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HAL-X-AI/THX-02
- Predecesor THX-01: https://huggingface.co/doofz/THX-01
- Referencia de la API: https://api.hal-x.ai/docs/thx-02
- Paquete PyPI: `pip install thx02` (cliente y comando `thx02`)
- Repositorio del modelo: descarga vía `hf download HAL-X-AI/THX-02 --local-dir THX-02`
