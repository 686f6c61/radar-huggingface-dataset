# hackoffice/laya-multilingual

## Resumen

Laya-multilingual es un modelo de clasificación y decisión de tipo encoder, no autorregresivo, desarrollado dentro de la familia Laya (los pesos originales se publican bajo la organización convaiinnovations). Su funcionamiento consiste en recibir un estado de entrada (texto libre, correo, ticket de soporte o JSON) junto con preguntas tipadas, y devolver respuestas también tipadas acompañadas de probabilidades en una única pasada forward. Al no generar texto, no hay salida que parsear ni margen para la alucinación, lo que lo sitúa en la categoría de modelos "System 1": respuestas rápidas, deterministas y calibradas para tareas de enrutado, guardrails y moderación.

Técnicamente se apoya en un encoder mmBERT-base con 321.908.998 parámetros (aproximadamente 322 millones) y una ventana de contexto por defecto de 1.024 tokens que puede ampliarse hasta 8.192 pasando `max_len=8192`. Está diseñado específicamente para cubrir más de 100 idiomas, y existe como complemento del checkpoint en inglés: el modelo inglés se degrada de forma abrupta fuera de su idioma, mientras que esta variante multilingüe mantiene un rendimiento utilizable. Según las mediciones del autor, pasa de 0,227 a 0,366 de precisión macro en MASSIVE (51 idiomas, 20 clases de intención) y reduce el error de calibración macro (ECE) de 0,733 a 0,387.

Su relevancia actual radica en dos puntos. Primero, resuelve el problema de los clasificadores multilingües mal calibrados: el checkpoint inglés responde con confianza de 0,89-0,96 incluso cuando su precisión es aleatoria (jemer: 0,000 de precisión con 0,952 de confianza), de modo que el filtrado por confianza no lo detecta. Segundo, ofrece una arquitectura de despliegue con enrutado previo a la pasada forward, basado en el sistema de escritura de la entrada, que evita ese fallo silencioso. La licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer mmBERT-base; modelo de decisión no autorregresivo ("System 1") |
| Parametros totales | 321.908.998 (~322 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens por defecto; hasta 8.192 con `max_len=8192` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Más de 100 idiomas (multilingüe); el repositorio declara en, de, fr, es, pt, it, nl, sv, da, nb, ru, pl, tr, ar, he, fa, ur, hi, bn, ta, te, kn, ml, th, vi, id, ms, tl, ja, ko, zh, el, hu, fi, ro, sq, sl, sw, af, cy, am, hy, ka, km, my, mn, lv, is, az, jv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tarea (pipeline) | text-classification |
| Tamaño del repositorio | 0,7 GB |
| Fecha de publicación | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en mmBERT-base, empleado como clasificador de decisión en lugar de como generador. La interfaz expone preguntas tipadas con criterios declarativos: por ejemplo, una pregunta de tipo `choice` con un mapa de criterios (`billing`, `technical`, `sales`) o una pregunta de tipo `noul` (respuesta binaria del tipo "¿el remitente pide dinero de vuelta?"). El resultado es una respuesta tipada más su probabilidad, obtenida en una sola pasada forward. El autor insiste en que al no existir decodificación de texto no hay superficie de alucinación: la salida es directamente consumible por código.

El repositorio incluye un componente `Router` que decide entre el checkpoint inglés y este multilingüe en función del sistema de escritura de la entrada, y esa decisión se toma **antes** de la pasada forward. El motivo es explícito en la documentación: la confianza del modelo no avisa cuando un checkpoint no sabe leer su entrada, por lo que el filtrado por umbral de confianza resulta inoperante como mecanismo de seguridad. El router admite mantener ambos checkpoints residentes en memoria (`preload`) para evitar intercambios en cada cambio de idioma, admite un `lang_guess` externo (código o función invocable) si ya se dispone de un identificador de idioma y permite registrar un `Agent` ya construido con `attach`.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La etiqueta `rlcd` presente en el repositorio (junto con `calibrated-decisions`) sugiere algún procedimiento de ajuste orientado a la calibración, pero la documentación proporcionada no lo describe, por lo que el detalle queda como no disponible. Tampoco se documentan innovaciones de decodificación (atención lineal, decodificación especulativa), algo coherente con un modelo que no decodifica.

## Capacidades

- Clasificación de texto y toma de decisiones tipada: responde a preguntas estructuradas con criterios declarativos y devuelve la opción elegida junto a su probabilidad.
- Respuestas tipadas: soporta al menos preguntas de tipo `choice` (elección entre categorías definidas por el usuario) y `noul` (binaria).
- Procesamiento de estado en múltiples formatos: texto plano, cuerpo de correo, ticket de soporte o JSON.
- Ausencia de generación de texto: la salida es directamente parseable, sin necesidad de postprocesado ni extracción de campos.
- Decisión en una sola pasada forward, con coste lineal respecto a la longitud real de la entrada.
- Cobertura multilingüe de más de 100 idiomas, con cobertura explícita de las 51 lenguas de MASSIVE.
- Soporte de escrituras latinas sin acentos (español, italiano, portugués y francés con acentos eliminados por clientes de correo o sistemas de tickets), portugués de Brasil, y cualquier escritura sin rango asignado en el router.
- Capacidad de manejar peticiones CJK con nombres de marca en latín, bengalí romanizado y azerí.
- Enrutado por sistema de escritura: el modelo se elige antes de la inferencia, lo que evita fallos silenciosos por incompatibilidad de idioma.
- Multi-checkpoint residente: el router puede mantener el modelo inglés y el multilingüe cargados simultáneamente.
- Integración con `lang_guess` externo para aprovechar un detector de idioma ya existente en el pipeline.
- Ámbitos de aplicación declarados por las etiquetas del repositorio: clasificación, enrutado (routing), guardrails y moderación.
- Rendimiento de contexto largo: lee documentos de hasta 8.192 tokens, con degradación variable más allá de los 4.000 tokens.
- No se documentan capacidades de visión, audio, tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el cuerpo del ticket y una pregunta `choice` con departamentos como criterios, y devuelve el equipo asignado con su probabilidad; al cubrir más de 100 idiomas, un mismo pipeline sirve para clientes de cualquier región sin desplegar un clasificador por idioma.
- Moderación de contenido y guardrails: al no generar texto y devolver decisiones tipadas con probabilidad, encaja como capa previa a un LLM generativo, decidiendo si una entrada debe bloquearse, revisarse o pasar al modelo mayor.
- Detección de intención en atención al cliente: clasificación de intenciones sobre conversaciones multi-turno, con la ventana de 1.024 tokens por defecto y ampliable a 8.192 para hilos largos de correo.
- Extracción de decisiones sobre correo entrante: dado un correo en formato JSON, responder preguntas binarias como "¿el remitente solicita una devolución?" o "¿hay una factura adjunta?" para alimentar sistemas de back-office.
- Clasificación de documentos largos: contratos, informes o hilos de correo de hasta 8.192 tokens, donde el autor reporta entre 16 y 18 aciertos sobre 20 con hasta unos 4.000 tokens de texto previo; conviene validar la precisión en datos propios por encima de esa longitud.
- Preprocesado multilingüe en pipelines de RAG: etiquetar o filtrar documentos antes de indexarlos, aprovechando la cobertura de 100+ idiomas y el coste reducido de una pasada forward.
- Sistemas de decisión de baja latencia: con unos 1,7 s para una entrada de 4.000 tokens en una GPU de Apple, es viable en rutas interactivas y en despliegues de borde.
- Enrutado entre modelos: uso del `Router` para decidir, según el sistema de escritura, si una consulta debe ir al checkpoint inglés (421 M, ModernBERT-large) o a este multilingüe (322 M, mmBERT-base, aproximadamente 2x más rápido).

## Benchmarks y rendimiento

Evaluación en MASSIVE, sobre los 51 idiomas del conjunto, con clasificación de intención de 20 opciones (azar = 0,050). Ambos checkpoints responden a preguntas idénticas byte a byte:

| Metrica | laya (ingles) | laya-multilingual |
|---|---|---|
| Precision macro | 0,227 | 0,366 |
| ECE macro | 0,733 | 0,387 |
| Idiomas que superan 3x el azar | 23 / 51 | 45 / 51 |

Progresión por idioma (precisión, checkpoint inglés → multilingüe):

| Idioma | laya (ingles) | laya-multilingual |
|---|---|---|
| Arabe | 0,110 | 0,400 |
| Bengali | 0,080 | 0,290 |
| Azeri | 0,100 | 0,300 |
| Hindi | 0,100 | 0,387 |
| Coreano | 0,110 | 0,490 |
| Turco | 0,140 | 0,437 |

Fallos documentados del checkpoint inglés, que ilustran el problema de calibración que este checkpoint corrige:

| Idioma | Precision | Confianza reportada |
|---|---|---|
| Jemer | 0,000 | 0,952 |
| Hebreo | 0,060 | 0,89-0,96 |
| Armenio | 0,050 (azar exacto) | 0,89-0,96 |
| Bengali | 0,080 | 0,89-0,96 |

La confianza media del checkpoint inglés nunca baja de 0,885 a ningún nivel de precisión, por lo que el filtrado por umbral de confianza no permite detectar el fallo.

XNLI (15 idiomas):

| Idioma | laya | laya-multilingual |
|---|---|---|
| Ingles | 0,860 | 0,843 |
| Otros 14 idiomas | no disponible | no disponible |

El resultado de los 14 idiomas restantes no aparece en la información proporcionada (la model card está truncada en ese punto).

Precisión en documentos largos (20 peticiones, ventana de 8.192 tokens):

| Longitud del documento | Peticiones respondidas correctamente |
|---|---|
| Hasta ~4.000 tokens | 16-18 de 20 |
| Mas alla de ~4.000 tokens | 8-17 de 20 |

Con entradas cortas, `max_len=8192` produce respuestas idénticas a la configuración por defecto, y la velocidad depende de la longitud real de la entrada, no del límite configurado. Una entrada de 4.000 tokens tarda aproximadamente 1,7 s en una GPU de Apple.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 321.908.998 parámetros, sin incluir activaciones ni sobrecarga del runtime): ~1,29 GB en FP32, ~644 MB en FP16/BF16, ~322 MB en INT8 y ~161 MB en INT4. Son estimaciones aritméticas; el autor no publica cifras de VRAM.
- El modelo cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, incluso en precisión completa.
- Es viable en CPU y en hardware de Apple (el autor reporta 1,7 s para 4.000 tokens en GPU de Apple), lo que lo hace apto para despliegue en borde.
- GPU de centro de datos (A100, H100) innecesarias para inferencia; tendrían sentido solo para servir grandes volúmenes en paralelo.
- Opciones de despliegue: `transformers` con `safetensors`, la librería propia `laya` (`pip install laya`) y su clase `Router`. No hay confirmación de compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el pipeline `text-classification` no encaja directamente con runtimes orientados a generación; los tipos de cuantización no están documentados.
- Throughput y latencia: no se publican cifras de throughput (peticiones por segundo). El único dato de latencia disponible es el mencionado de 1,7 s para 4.000 tokens en GPU de Apple.
- Requisito de entorno: si `laya.load()` se queda colgado, hay que ejecutar con `USE_TF=0`, porque `transformers` sondea TensorFlow al importar y su runtime abseil puede provocar un interbloqueo durante la construcción del modelo.

## Comparativa con modelos similares

Comparativa dentro de la familia Laya, único conjunto de modelos para el que la información proporcionada ofrece datos:

| Modelo | Encoder | Parametros | Contexto | Uso previsto |
|---|---|---|---|---|
| convaiinnovations/laya | ModernBERT-large | 421 M | 512 | Inglés |
| hackoffice/laya-multilingual (este) | mmBERT-base | 322 M | 1.024 (hasta 8.192) | 100+ idiomas, ~2x más rápido |
| convaiinnovations/laya-typed-decisions | ModernBERT-large | 421 M | 1.024 | Flujos de decisiones tipadas |

Rendimiento comparado (MASSIVE, 51 idiomas, 20 clases):

| Metrica | laya | laya-multilingual |
|---|---|---|
| Precision macro | 0,227 | 0,366 |
| ECE macro | 0,733 | 0,387 |
| Prevalencia de 3x el azar | 23 / 51 | 45 / 51 |
| XNLI ingles | 0,860 | 0,843 |

Frente a modelos de fuera de la familia (por ejemplo clasificadores multilingües basados en XLM-R o mDeBERTa), no hay datos de comparación en la información disponible: no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no mantiene diálogo libre ni puede emplearse para resumen, traducción o respuesta abierta. Solo responde a preguntas tipadas definidas por el usuario.
- Calibración mejorable: el ECE macro es 0,387 en MASSIVE, mejor que 0,733 pero todavía lejos de una calibración fiable. Las probabilidades no deben tratarse como certezas sin validación sobre datos propios.
- Precisión absoluta baja en la tarea medida: 0,366 de precisión macro sobre 20 clases (azar 0,050) indica que el modelo es utilizable, no que sea preciso. El propio autor describe el salto como "de casi aleatorio a utilizable".
- El checkpoint inglés de la familia no se degrada con elegancia fuera del inglés: colapsa y permanece confiado. Cualquier despliegue que no enrute correctamente al checkpoint multilingüe hereda ese riesgo. El enrutado debe basarse en el sistema de escritura y decidirse antes de la pasada forward, nunca en la confianza de salida.
- La decisión de enrutado por escritura deja fuera de rango algunas entradas; el router mantiene un comportamiento por defecto hacia este checkpoint, lo que conviene auditar.
- Degradación con documentos largos: por encima de unos 4.000 tokens, los aciertos caen a un rango de 8 a 17 sobre 20. Es imprescindible medir la precisión en datos propios antes de usar la ventana extendida de 8.192 tokens.
- El límite por defecto de 1.024 tokens trunca documentos largos de forma silenciosa si no se pasa `max_len=8192` explícitamente.
- Idiomas declarados: 100+ según la model card, pero la lista de etiquetas del repositorio enumera alrededor de 50. La cifra de 100+ no va acompañada de una lista completa.
- Riesgo de sesgo: no se documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos, culturales o de dominio. Es una limitación de trazabilidad relevante para uso en moderación.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia y el archivo NOTICE si existe.
- Advertencia sobre la procedencia del repositorio: la model card describe el modelo como parte de la familia `convaiinnovations/laya`, mientras que el identificador evaluado aquí es `hackoffice/laya-multilingual`. Conviene verificar la cadena de custodia de los pesos antes de usarlos en producción.
- Dependencia de la librería propietaria `laya` para la interfaz de preguntas tipadas, el router y el parámetro `max_len`. Los pesos son estándar (safetensors + transformers), pero la ergonomía documentada depende de ese paquete.
- Interbloqueo conocido con TensorFlow instalado en el entorno; requiere `USE_TF=0`.
- Riesgo de alucinación: no aplica en el sentido generativo (no hay texto libre que pueda ser falso), pero sí existe riesgo de respuesta incorrecta con alta confianza, que es precisamente el patrón documentado en el checkpoint inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hackoffice/laya-multilingual
- Checkpoint inglés de la familia: https://huggingface.co/convaiinnovations/laya
- Checkpoint de decisiones tipadas: https://hackoffice/laya-multilingual (referencia de la model card: convaiinnovations/laya-typed-decisions)
- Repositorio de la familia Laya: https://huggingface.co/convaiinnovations/laya
- Código fuente (gráfica de precisión en contexto largo): https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/long_context_8192.png
- Repositorio GitHub de Laya: https://github.com/NandhaKishorM/laya
- Logotipo de la familia: https://huggingface.co/convaiinnovations/laya/resolve/main/assets/logo-mark.png

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo. Los enlaces obtenidos correspondían a sitios de contenido para adultos y no guardan relación con el modelo evaluado, por lo que se han descartado. No se han localizado papers, blogs técnicos ni demos asociados a Laya-multilingual más allá de la propia model card y el repositorio de GitHub citados arriba.
