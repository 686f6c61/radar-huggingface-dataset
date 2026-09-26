# faall7479/laya-idjvsuen-v4

## Resumen

laya-idjvsuen-v4 es un modelo de clasificación de texto (pipeline `text-classification`) desarrollado por el usuario faall7479 (muhfalihr en GitHub). Se trata de un ajuste fino general de laya-idjvsuen-v1, que a su vez deriva de convaiinnovations/laya-multilingual (descrito como mmBERT-base, ~322M parámetros). No es un modelo generativo: responde a preguntas tipadas definidas por quien lo invoca (tipo `choice`, `score` o `noul`) devolviendo probabilidades calibradas en un único paso forward.

El modelo cubre indonesio (id), javanés (jv), sundanés (su), inglés (en) y entradas con code-switching entre esos idiomas. Su aportación principal frente a v1 es una nueva tarea de clasificación temática en 7 categorías (SIB-200), además de tareas IndoNLU (emoción, sentimiento de reseñas y aspecto), manteniendo mediante *replay* completo las habilidades previas: intención MASSIVE de 60 clases y sentimiento NusaX de 3 clases.

Es relevante ahora porque ofrece clasificación multilingüe calibrada para lenguas indonesias de bajos recursos, con cobertura@conf≥0,8 de aproximadamente el 90% en la tarea de tópicos, lo que el autor presenta como apto para automatización. El entrenamiento se realizó íntegramente en una GPU T4 gratuita de Google Colab durante unas 3 horas, lo que documenta el coste real de reproducir el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo (modelo de decisión); base descrita como mmBERT-base. No se detalla la variante exacta en la información disponible |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors (el ajuste se hizo en fp16) |
| Idiomas soportados | Indonesio (id), javanés (jv), sundanés (su), inglés (en) y code-switching entre ellos |
| Licencia | CC-BY-SA-4.0 (con salvedad NC de NLLB en el subconjunto jv/su, según la model card) |
| Formato de pesos | safetensors (librería transformers) |
| Tamano del repositorio | 0,7 GB |
| Pipeline | text-classification |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como un modelo de decisión no autorregresivo construido sobre mmBERT-base, con 322M parámetros. En lugar de generar texto, recibe una entrada y un conjunto de preguntas tipadas (`choice`, `score`, `noul`) con `instructions` y `criteria`, y devuelve una elección con probabilidades y `answer_confidence` en una sola pasada forward. El ajuste parte de los pesos de laya-idjvsuen-v1, que a su vez es un ajuste multilingüe de convaiinnovations/laya-multilingual. El SDK de referencia es NandhaKishorM/laya (Apache-2.0).

Los datos de entrenamiento combinan cuatro fuentes: MASSIVE 1.1 para intención de 60 clases (13.547 ejemplos en id y 13.547 en en, más 7.000 en jv/su generados con traducción NLLB), NusaX para sentimiento de 3 clases (500 ejemplos por idioma, anotación manual de hablantes nativos), SIB-200 para tópicos de 7 clases (800 ejemplos por idioma, paralelos de FLORES-200) e IndoNLU para emoción, sentimiento de reseñas y aspecto (~12k elementos, solo indonesio). El code-switching sintético se emplea únicamente en evaluación.

El procedimiento de ajuste se ejecutó en una Google Colab T4 gratuita con fp16 y GradScaler, optimizador adamw8bit, batch efectivo de 64 y 2 épocas, en aproximadamente 3 horas. Se ajustó una temperatura de calibración de 3,55 para la tarea de elección. La innovación principal es el esquema de decisión tipada con calibración explícita (ECE medido) y el *replay* completo de los datos de v1 para evitar regresión de habilidades.

## Capacidades

- Clasificación temática en 7 categorías (SIB-200), nueva en esta versión, para id, jv, su y en.
- Clasificación de intención con 60 clases (MASSIVE 1.1), heredada de v1 y reforzada mediante replay.
- Análisis de sentimiento en 3 clases (NusaX) para id, jv, su y en.
- Tareas IndoNLU en indonesio: emoción, sentimiento de reseñas y clasificación por aspecto.
- Manejo de entradas con code-switching entre id, jv, su y en (evaluado con datos sintéticos de 6 combinaciones en tópicos y 3 en intención).
- Respuesta a preguntas tipadas definidas por el llamante (`choice`, `score`, `noul`) con probabilidades y confianza por respuesta.
- Calibración de probabilidades ajustada por temperatura, con ECE reportado por conjunto de evaluación.
- No soporta generación de texto, tool calling, uso de agentes ni razonamiento multi-paso: es un clasificador de un solo paso forward.

## Casos de uso

- Etiquetado temático de noticias y contenidos en indonesio, javanés, sundanés e inglés: el modelo asigna una de 7 categorías SIB-200 con probabilidad calibrada, lo que permite fijar un umbral de confianza (por ejemplo 0,8) y derivar a revisión humana el ~10% restante.
- Moderación y triaje de comentarios de usuario con code-switching: al estar entrenado y evaluado con mezclas id/jv/su/en, clasifica contenido mixto que los modelos monolingües tienden a fallar.
- Análisis de sentimiento de reseñas de producto en lenguas indonesias: la mejora reportada en indonesio (86,0% → 94,0%) lo hace adecuado para paneles de opinión y seguimiento de marca.
- Detección de emoción en texto indonesio (IndoNLU `emot`): útil para enrutar quejas o comentarios a equipos de experiencia de cliente según la emoción detectada.
- Análisis por aspecto de reseñas en indonesio (IndoNLU `casa`): permite desglosar la opinión por atributos (servicio, precio, producto) en lugar de dar una única polaridad.
- Clasificación de intención en asistentes conversacionales: con 60 clases MASSIVE y ~87% de acierto en id/en y ~80-82% en jv/su, sirve como primera etapa de un enrutador de diálogo.
- Preetiquetado para anotación humana: al devolver confianza calibrada, permite priorizar qué ejemplos revisar y reducir el coste de construir corpus en lenguas de bajos recursos.
- Filtrado previo en pipelines de datos multilingües: clasificar grandes volúmenes de documentos por tópico o sentimiento antes de pasarlos a modelos generativos más costosos.

## Benchmarks y rendimiento

Resultados publicados en la model card (v1 → v4 sobre conjuntos de test idénticos):

| Conjunto | v1 | v4 | ECE v1 → v4 |
|---|---|---|---|
| Tópicos — id / en | 78,4% / 77,0% | 87,3% / 89,2% | 0,157→0,080 / 0,165→0,066 |
| Tópicos — jv / su | 72,1% / 66,2% | 84,3% / 79,9% | 0,159→0,104 / 0,126→0,111 |
| Tópicos con code-switching (6 combinaciones) | 71,3–78,4% | 88,2–92,0% | 0,149–0,185 → 0,046–0,066 |
| Intención id / en | 86,2% / 85,7% | 87,3% / 87,6% | no disponible |
| Intención jv / su | 80,5% / 77,2% | 82,3% / 80,0% | no disponible |
| Sentimiento id / jv / su / en | 86,0% / 81,8% / 75,7% / 87,3% | 94,0% / 86,0% / 82,0% / 89,7% | no disponible |
| Intención con code-switching (3 combinaciones) | 81,6–85,2% | 83,4–86,4% | no disponible |

Cobertura con confianza ≥ 0,8 en tópicos: de ~45% (v1) a ~90% (v4). El autor atribuye la subida de +8 puntos en sentimiento indonesio a transferencia desde `smsa` (reseñas indonesias de IndoNLU). La tabla completa de 21 conjuntos de prueba está en `eval_v4-general.json` del repositorio de pipeline. No se han encontrado otros benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan ~0,65 GB en fp16 (tamaño real del repo: 0,7 GB) y ~1,3 GB en fp32. Con activaciones y batch pequeño, la inferencia cabe holgadamente en menos de 2 GB de VRAM en fp16.
- GPU recomendadas: cualquier GPU moderna con ≥4 GB sirve; una T4 (usada por el autor para entrenar), RTX 3060/4060, RTX 4090 o superiores no suponen ningún cuello de botella. A100/H100 solo tendrían sentido para servir lotes muy grandes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con ≥4 GB, e incluso en CPU para cargas moderadas dado el tamaño del modelo.
- Opciones de despliegue: la vía documentada es el SDK `laya` (`pip install laya`, `laya.load(...)` sobre transformers). Al ser un modelo transformers de clasificación, también es desplegable con Hugging Face Text Generation Inference en modo text-classification o exportable a ONNX; no hay instrucciones publicadas para vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponible. Estructuralmente, al resolver cada consulta en un único forward pass sin decodificación autoregresiva, la latencia esperada es la de un encoder de 322M parámetros.

## Comparativa con modelos similares

Comparación dentro de la propia familia laya, que es donde hay datos verificables:

| Modelo | Enfoque | Idiomas | Contexto | Licencia |
|---|---|---|---|---|
| laya-idjvsuen-v1 | Multilingüe general: intención MASSIVE (60 clases) + sentimiento NusaX | id, jv, su, en | no disponible | CC-BY-SA-4.0 |
| laya-idjvsuen-v3 | v1 + 12 categorías de ticket, para enrutado de tickets | id, jv, su, en | no disponible | CC-BY-SA-4.0 |
| laya-idjvsuen-v4 | v1 + tópicos SIB-200 (7 clases) + IndoNLU, con replay completo; para clasificación general | id, jv, su, en | no disponible | CC-BY-SA-4.0 |
| convaiinnovations/laya-multilingual | Modelo base multilingüe | multilingüe | no disponible | Apache-2.0 |

Alternativas de la misma categoría (encoders multilingües ajustados para clasificación, como variantes de XLM-R o IndoBERT) no aparecen con resultados comparables en la información proporcionada: no disponible.

## Limitaciones y advertencias

- Es un modelo de decisión, no generativo: no produce texto libre ni admite instrucciones abiertas; solo responde a preguntas tipadas predefinidas.
- La calibración (temperatura 3,55 para elección) se ajustó sobre esta distribución de tareas; fuera de ella la confianza reportada puede no ser fiable.
- Las frases de SIB-200 en javanés y sundanés provienen de traducciones FLORES-200, no de anotación nativa, por lo que las métricas de esas lenguas son indicativas. Las filas de texto humano más fiables siguen siendo las de NusaX.
- Los conjuntos de evaluación de IndoNLU no se volvieron a ejecutar localmente (loader heredado; el entrenamiento se hizo en Colab); su efecto se observa de forma indirecta en la mejora del sentimiento indonesio.
- No está entrenado con datos de tickets: para enrutado interno de tickets hay que usar laya-idjvsuen-v3.
- Licencia CC-BY-SA-4.0 con cláusula share-alike, heredada del linaje NusaX; el subconjunto jv/su arrastra una salvedad NC de NLLB documentada en la model card de v1. Esto condiciona el uso comercial y obliga a mantener la misma licencia en obras derivadas.
- El code-switching solo se usó para evaluación, con datos sintéticos; el rendimiento en mezclas reales de idioma puede diferir.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes), sin validación independiente por parte de terceros.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en dominios alejados del entrenamiento.
- No se ha publicado la longitud de contexto soportada, dato crítico para planificar el despliegue con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faall7479/laya-idjvsuen-v4
- Modelo base (v1): https://huggingface.co/faall7479/laya-idjvsuen-v1
- Variante para tickets (v3): https://huggingface.co/faall7479/laya-idjvsuen-v3
- Modelo base original: https://huggingface.co/convaiinnovations/laya-multilingual
- SDK laya: https://github.com/NandhaKishorM/laya
- Repositorio del pipeline y evaluación: https://github.com/muhfalihr/laya-idjvsuen
- Autor: https://github.com/muhfalihr
- Dataset SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Dataset IndoNLU: https://huggingface.co/datasets/indonlp/indonlu
- Definiciones de preguntas generales: https://huggingface.co/faall7479/laya-idjvsuen-v4/raw/main/question_defs_general.json

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de la información de Hugging Face.
