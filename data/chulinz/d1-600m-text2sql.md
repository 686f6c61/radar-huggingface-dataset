# Chulinz/d1-600m-text2sql

## Resumen

D1-600M-Text2SQL v1 es un modelo de decisión especializado en selección de SQL, desarrollado por el usuario Chulinz a partir de un ajuste fino (fine-tuning) del modelo multimodal LiquidAI/d1-omni-600M. No genera SQL libre: su tarea es elegir una de las cuatro consultas SQL candidatas que la aplicación le entrega, a partir del esquema de base de datos y de la pregunta actual dentro del contexto de conversación. La aplicación es la responsable de aportar y ejecutar las consultas; el modelo solo devuelve la selección.

El modelo tiene 587.161.089 parámetros (~587M) exportados en FP32 verificado, sin estado del optimizador, en formato safetensors y con código de inferencia personalizado (`sql_inference.py`, función `select_sql`). Está orientado exclusivamente al inglés y su licencia es la LFM Open License v1.0, con condiciones específicas de uso comercial.

Su relevancia práctica es acotada pero clara: es un clasificador de elección múltiple de 600M que pasa del 25,45% de acierto del modelo base al 51,40% en el conjunto de test sintético de 2.000 turnos, con probabilidades calibradas mediante un factor de escalado de temperatura de 7,9617. La ventana de entrada del helper de inferencia está limitada a 16.384 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de LiquidAI/d1-omni-600M (tag `d1_omni`, con componentes de texto, audio y vision); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 587.161.089 (~587M), exportacion FP32 verificada sin estado del optimizador |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 16.384 tokens en el helper de inferencia (`select_sql` rechaza entradas superiores); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos FP32, y el autor advierte que la precision mixta puede cambiar las predicciones |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (`lfm1.0`), con condiciones de uso comercial |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

Se desconoce el detalle arquitectonico exacto del modelo base LiquidAI/d1-omni-600M mas alla de lo que indica su etiqueta (`d1_omni`) y del hecho de que el autor describe componentes de texto, audio y vision. En este ajuste fino solo se entrenaron el codificador de texto (text encoder) y la cabeza de decisión; los componentes de audio y vision permanecieron congelados. El problema se formula como una selección única entre cuatro consultas SQL nombradas, entregadas por la aplicación, preservando el orden de las opciones.

El entrenamiento consistio en una sola pasada sobre 15.000 filas: 10.000 ejemplos sinteticos de desafio y 5.000 ejemplos previos de selección de SQL, con una ponderación 80/20. Se aplicaron aumentaciones sobre los nombres de las opciones y el orden de las consultas, semilla 42, tamano de lote 4, optimizador AdamW con tasa de aprendizaje 1e-5, weight decay 0,01, schedule coseno con 5% de warmup y gradient clipping de 1,0. La selección del checkpoint uso el menor valor entre la precision en FP16 en orden original y en orden reordenado, con la log-verosimilitud negativa media como criterio de desempate. Posteriormente se ajusto un factor de escalado de temperatura de 7,9617 sobre 500 turnos de calibración separados, aplicado a las probabilidades sin alterar las 2.000 respuestas seleccionadas.

## Capacidades

- Selección de SQL: elige una de cuatro consultas SQL candidatas a partir del esquema de base de datos y la pregunta, dentro del contexto de conversación.
- Tarea de clasificación/decision, no de generación: el modelo no escribe SQL nuevo ni texto libre; la pipeline declarada es `feature-extraction`.
- Estimación de probabilidad calibrada: el helper aplica por defecto la calibración SQL; puede devolver probabilidades crudas con `calibrated=False`.
- Entrada de contexto larga en el helper: admite hasta 16.384 tokens, con rechazo de entradas superiores.
- Preservación del orden de las opciones: el helper exige cuatro cadenas SQL nombradas y mantiene su orden.
- Capacidades multilingues: no; el modelo esta etiquetado unicamente para ingles.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible; la tarea es una decisión de un solo paso.
- Modo "thinking", vision o audio: los componentes de audio y vision existen en el modelo base pero permanecieron congelados y no se evaluaron en este ajuste.

## Casos de uso

- Selección de consulta en asistentes de datos conversacionales: la aplicación genera cuatro SQL candidatas y el modelo elige la más probable según el esquema y la pregunta; encaja porque la tarea es exactamente una decisión cerrada de cuatro opciones.
- Enrutado previo a la ejecución en un pipeline text-to-SQL: se usa como etapa de desambiguación entre variantes de consulta (por ejemplo, `COUNT` frente a `SUM`), reduciendo ejecuciones incorrectas antes de tocar la base de datos.
- Sistemas con historial de conversación fijo: el modelo acepta contexto de conversación y estado del esquema, por lo que puede usarse en turnos sucesivos donde la pregunta actual depende de turnos anteriores.
- Verificación de alternativas generadas por un LLM mayor: un modelo generativo produce cuatro SQL y este clasificador de 587M actúa como re-ranker barato, ejecutable incluso en CPU.
- Filtrado y evaluación de calidad de consultas en herramientas internas de analítica: permite puntuar con probabilidad calibrada cuál de las candidatas responde mejor a la pregunta, siempre con validación humana posterior.
- Despliegue en entornos con recursos limitados: al ser un modelo de ~587M en FP32, puede correr en una sola GPU de consumo o en CPU, lo que lo hace viable para preprocesado local o en el borde.
- Investigación sobre calibración y sesgo de posición en tareas de selección: el autor publica métricas de NLL, Brier y error de calibración antes y después del escalado de temperatura, útiles como referencia metodológica.

## Benchmarks y rendimiento

Evaluación sobre el mismo conjunto de 2.000 turnos de test sintéticos, con entradas de cliente completas, orden original de las opciones SQL e historiales fijos. El conjunto cubre 20 familias de tareas excluidas del entrenamiento de v1. Precisión medida como selección entre las cuatro consultas proporcionadas.

| Modelo | Turnos correctos | Los cuatro turnos correctos |
|---|---:|---:|
| D1 600M base | 509/2.000 (25,45%) | 0/500 |
| Text2SQL v1 | 1.028/2.000 (51,40%) | 13/500 |
| D1 3B | 1.188/2.000 (59,40%) | 65/500 |
| Clef Flash | 1.579/2.000 (78,95%) | 219/500 |
| Jev | 1.928/2.000 (96,40%) | 433/500 |

Base 600M y v1 se evaluaron con FP32 local emparejado, codificación completa y tamano de lote 4. D1 3B se ejecutó con Copilot, Clef Flash con Cloudflare a través de OpenRouter y Jev resolvió a `jev-1.13.0` a través de classifier.dev; el tokenizador de API, la precision y el procesamiento interno difieren entre ellos.

Metricas de calibración tras aplicar el factor de temperatura 7,9617 (menor es mejor):

| Metrica de test | Cruda | Calibrada |
|---|---:|---:|
| Log-verosimilitud negativa | 3,360 | 1,156 |
| Puntuacion de Brier | 0,808 | 0,618 |
| Error de calibración, 15 bins | 0,366 | 0,047 |

En el conjunto de desarrollo separado de 1.000 turnos, usado repetidamente para seleccion de modelo, el base sin cambios obtuvo un 24,9% y v1 un 45,6% con ajustes FP32 emparejados.

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval, GSM8K, Spider o BIRD en la informacion disponible; el autor indica explicitamente que Spider, BIRD, conversaciones reales, uso medico y rendimiento multimodal no han sido evaluados.

## Requisitos de hardware

- VRAM estimada: los pesos en FP32 de ~587M ocupan aproximadamente 2,3-2,4 GB; en FP16 bajarían a ~1,2 GB, aunque el autor advierte que la precision mixta puede alterar las predicciones y recomienda FP32 para reproducir los resultados publicados. El repositorio completo ocupa 4,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM en FP32 sirve para inferencia; una RTX 3060 de 12 GB, RTX 4070/4080, RTX 4090, A100 o H100 son mas que suficientes y quedan limitadas por latencia, no por memoria.
- GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo moderna e incluso en muchas integradas, dado el tamano del modelo.
- CPU: el modelo puede ejecutarse en CPU (el propio autor documenta uso local en FP32); el helper indica que hay que mover el modelo a CUDA para inferencia en GPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el helper `sql_inference.select_sql` incluido en el repositorio, junto con `requirements.txt`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores, y el uso de codigo personalizado complica su integracion directa en esos motores.
- Latencia y throughput: no disponibles; no se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Precision en el test de 2.000 turnos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D1-600M-Text2SQL v1 | ~587M | Seleccion entre 4 SQL | 51,40% (13/500 los cuatro turnos) | LFM Open License v1.0 | Pesos abiertos en HuggingFace |
| D1 600M base | ~600M | Seleccion entre 4 SQL | 25,45% (0/500) | no disponible | Pesos abiertos (LiquidAI) |
| D1 3B | no disponible | Seleccion entre 4 SQL | 59,40% (65/500) | no disponible | no disponible (evaluado via Copilot) |
| Clef Flash | no disponible | Seleccion entre 4 SQL | 78,95% (219/500) | no disponible | no disponible (evaluado via Cloudflare/OpenRouter) |
| Jev (`jev-1.13.0`) | no disponible | Seleccion entre 4 SQL | 96,40% (433/500) | no disponible | no disponible (evaluado via classifier.dev) |

Las comparaciones con D1 3B, Clef Flash y Jev no son estrictamente homogeneas: el autor senala que el tokenizador, la precision y el procesamiento interno difieren, y que solo base 600M y v1 se evaluaron con FP32 local emparejado. No se dispone de datos de contexto, licencia o formato de pesos de los modelos alternativos.

## Limitaciones y advertencias

- Sensibilidad al nombre de las opciones: en el conjunto de desarrollo, renombrar las opciones cambio el SQL seleccionado en 93 de 1.000 turnos.
- Probabilidades imperfectas: incluso despues de la calibracion, las probabilidades pueden ser incorrectas, y el autor indica que la calidad de calibracion puede variar entre dominios.
- Riesgo operativo: hay que validar las consultas y aplicar permisos de base de datos antes de ejecutar cualquier SQL elegido por el modelo.
- Alcance de evaluacion muy limitado: la evaluacion cubre seleccion sintetica en ingles con historiales fijos; no se han evaluado Spider, BIRD, conversaciones reales, uso medico ni rendimiento multimodal.
- Idioma: solo ingles; no hay soporte multilingue documentado.
- Dependencia de la aplicacion: el modelo no genera SQL libre ni ejecuta nada; solo elige entre cuatro opciones que le proporciona el sistema anfitrion, y requiere exactamente cuatro cadenas SQL nombradas.
- Codigo personalizado: el uso requiere `trust_remote_code=True` y revisar el codigo del repositorio antes de ejecutarlo.
- Precision: la precision mixta o FP16 puede cambiar las predicciones; los resultados publicados corresponden a FP32.
- Datos no incluidos: el dataset y el arnes de evaluacion completo no se distribuyen con el modelo.
- Licencia: la LFM Open License v1.0 incluye condiciones especificas de uso comercial que deben revisarse antes de un despliegue en produccion; el fichero `NOTICE` recoge la atribucion y las modificaciones.
- Confusion de nombre: los resultados de busqueda web disponibles no guardan relacion con el modelo (corresponden al musico Johnny "Guitar" Watson), por lo que no aportan informacion utilizable sobre el mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chulinz/d1-600m-text2sql
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Licencia LFM Open License v1.0: fichero `LICENSE` dentro del repositorio del modelo
- Aviso de atribucion y modificaciones: fichero `NOTICE` dentro del repositorio del modelo
- Procedencia y hashes de pesos: fichero `provenance.json` dentro del repositorio del modelo
- Protocolo y resultados de comparacion: fichero `test-comparison.json`
- Protocolo, hashes y resultados por familia: fichero `test-evaluation.json`
- Escalar de calibracion ajustado: fichero `calibration.json`
- Detalles del conjunto de desarrollo: fichero `evaluation.json`
- Grafico de comparacion de los cinco modelos: `charts/test-accuracy.png`
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a un musico homonimo y no son aplicables.
