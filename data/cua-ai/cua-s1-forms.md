# cua-ai/cua-s1-forms

## Resumen

cua-s1-forms es un modelo "System One" (uno de los tags de su ficha) desarrollado por cua-ai como capa de decisión para el rellenado automático de formularios en interfaces gráficas. No es un modelo generativo: no produce texto, sino que recibe un elemento de interfaz y una lista de opciones tipadas (una por entidad extraída del documento, más las acciones fijas `check`, `click` y `skip`) y devuelve una probabilidad por opción en una única pasada forward. Su contrato de entrada/salida replica el de Jev, de TypeSafe, y está pensado para integrarse por debajo de cua-driver.

Técnicamente es un modelo muy pequeno: un encoder Transformer byte-level de 2 capas, ancho 128 y 4 cabezas, con un módulo `AttentionHead` en el que cada opción actúa como query sobre los tokens de contexto. El resultado es un logit por par (opción, contexto atendido) y un softmax sobre el número de opciones vivas. El checkpoint completo ocupa 2,8 MB y suma 706.048 parámetros entrenables, lo que lo sitúa fuera de la categoría de LLM y lo acerca a un clasificador especializado de latencia mínima.

Su relevancia ahora es doble: por un lado, demuestra que una tarea de computer-use estructurada (decidir qué acción ejecutar sobre un campo de formulario) se puede resolver con tres órdenes de magnitud menos parámetros que un modelo autoregresivo; por otro, publica una comparación directa contra la API hosted de Jev (`jev-latest`) sin fine-tuning, con ventaja clara en el conjunto de evaluación del propio autor. Es un checkpoint de investigación independiente, no una reproducción de Jev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder byte-level de 2 capas (ancho 128, 4 cabezas) con módulo AttentionHead tipo jev |
| Parametros totales | 706.048 (todos entrenables) |
| Parametros activos | no aplica, no es un modelo MoE |
| Longitud de contexto | no usa ventana de tokens: contexto truncado a 224 bytes por elemento y 96 bytes por opcion |
| Tipos de cuantizacion | no disponible; checkpoint PyTorch de 2,8 MB, sin variantes GGUF ni cuantizadas publicadas |
| Idiomas soportados | no disponible en la ficha; vocabulario de etiquetas centrado en ingles |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pt`) + `config` + historial de entrenamiento + metricas de validacion |
| Tamano del repositorio | 0,0 GB (checkpoint de 2,8 MB) |
| Descargas / likes | 0 descargas, 10 likes |
| Fechas | creado el 2026-09-18, actualizado el 2026-09-18 |
| Pipeline declarado | other |

## Arquitectura y entrenamiento

La arquitectura es un encoder byte-level de dos capas con ancho 128 y 4 cabezas de atención. El contexto (por ejemplo, `TASK fill the form from the document, then submit` seguido de `FORM` y `ELEMENT Edit "Phone number" value=""`) se codifica una vez, y cada opción se codifica por separado. Después, el módulo `AttentionHead` convierte cada opción en una query contra los tokens de contexto, generando un vector de contexto atendido; un producto escalar compartido transforma cada par (opción, contexto atendido) en un único logit y se aplica softmax sobre el número de opciones vivas en ese paso. No hay decodificación autoregresiva ni generación de texto: la salida es una distribución de probabilidad sobre las opciones.

El entrenamiento se hizo íntegramente sobre datos sintéticos: 10.000 episodios generados con `cua_s1/synth.py`, cada uno con un formulario aleatorio de 2 a 16 campos extraídos de un catálogo de 55 conceptos con sinónimos entre etiqueta de formulario y etiqueta de documento, una persona aleatoria y un documento con entidades distractoras. Se forzaron pares confusores deliberados (por ejemplo, `email` frente a `street`, `phone` frente a `emergency contact phone`, `state` frente a `university`), sufijos aleatorios en el título de ventana y un 20 % de dropout de título. Los splits son disjuntos por firma exacta de campos, de modo que el conjunto de campos de un formulario de test nunca aparece en entrenamiento. El optimizador fue AdamW con schedule coseno y warmup, 6 épocas, batch size 128 y entropía cruzada sobre el número de opciones vivas.

## Capacidades

- Puntuación de opciones en una sola pasada: asigna una probabilidad a cada opción candidata de forma independiente y en paralelo dentro de un mismo batch.
- Decisión de acción sobre elementos de formulario: distinguir entre `fill`, `check`, `click` y `skip` para un campo dado.
- Correspondencia entre entidades de documento y campos de formulario, incluyendo pares deliberadamente confusores.
- Reconocimiento de campos ya rellenos como no-op (convención concreta sobre la que fue entrenado).
- Lectura del elemento de interfaz y no de la estadística de las opciones: el control con contexto barajado baja al 37 % de top-1, lo que confirma que el contexto condiciona la decisión.
- No genera texto, no soporta tool calling en el sentido de un LLM, no tiene modo de razonamiento explícito, no procesa visión ni audio y no mantiene diálogo multi-turno.
- Capacidades multilingües: no disponibles; el encoder es byte-level pero el vocabulario de etiquetas es de base inglesa.

## Casos de uso

- Automatización de formularios web corporativos: dado un snapshot de la interfaz y las entidades extraídas de un documento, el modelo puntúa cada opción y el código de downstream (`planner.py`) ordena las acciones antes de enviarlas a cua-driver como `set_value` o `click`.
- Onboarding documental en back office: extraer pares `Label: value` de un PDF y mapearlos a los campos de un formulario de alta de cliente, resolviendo ambigüedades como teléfono principal frente a teléfono de contacto de emergencia.
- Registro de pacientes en entornos clínicos: el ejemplo de la propia ficha (Northwind Clinic, New Patient Registration) ilustra el flujo de rellenar campos desde un documento y decidir después el único clic de envío.
- RPA sobre aplicaciones de escritorio: integrado en cua-driver, permite sustituir reglas heurísticas de selección de campo por una capa de decisión entrenada, manteniendo la ejecución fuera del modelo.
- QA automatizado de formularios: verificar que cada campo recibe la acción esperada y detectar regresiones de maquetación comparando la distribución de probabilidad sobre las opciones.
- Procesamiento por lotes en local sin GPU: al ocupar 2,8 MB y 706.048 parámetros, se puede ejecutar en CPU dentro del propio pipeline de extracción, sin depender de una API externa ni de conectividad.
- Despliegue en entornos con requisitos de residencia de datos: al ser MIT y ejecutarse en local, permite procesar documentos sensibles sin enviar nada a un servicio hosted.
- Capa de decisión de bajo coste dentro de un agente de computer-use mayor: reservar un LLM grande para la planificación y delegar en este modelo la decisión repetitiva por elemento.

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes:

| Split / prueba | Top-1 | Notas |
|---|---:|---|
| Test sintético (form-disjoint, ~15.000 decisiones) | 99,95 % | con pares confusores forzados |
| Evaluación demo real (3 formularios y 3 PDF reales, 196 decisiones) | 100 % | sin datos sintéticos |
| Control con contexto barajado | 37 % | confirma que el modelo lee el elemento y no la estadística de opciones |

Comparación directa contra la API hosted de Jev (`jev-latest`, sin fine-tuning, misma tarea):

| Prueba | cua-s1-forms | Jev hosted (`jev-latest`) |
|---|---:|---:|
| Global | 99,7 % | 83,6 % |
| Decisiones que requieren juicio real (fill vs check vs click) | no disponible desglosado | 96 % |
| Reconocer un campo ya relleno como no-op | no disponible desglosado | 74 % |

El autor atribuye la diferencia en el caso del campo ya relleno a una convención sobre la que este modelo fue entrenado y Jev hosted no. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable al no tratarse de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 100 MB; el checkpoint en disco es de 2,8 MB y el modelo tiene 706.048 parámetros.
- GPU recomendadas: ninguna en particular; cualquier GPU sirve y no aporta ventaja significativa frente a CPU para un modelo de este tamaño.
- Cabe en cualquier GPU consumer, e incluso en tarjetas integradas y en placas tipo Raspberry Pi; también se ejecuta en CPU sin problemas.
- Opciones de despliegue: PyTorch directamente mediante `load_checkpoint` y `select_device("auto")` del paquete `cua_s1`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no es generativo ni usa pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser una única pasada forward por lote de opciones y no requerir decodificación token a token, la latencia esperable es de milisegundos en CPU, pero no hay cifras publicadas.
- Integración: se usa junto a cua-driver, que recibe las acciones ya ordenadas; el bucle completo snapshot, score, order y execute está en `cua_s1/planner.py`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cua-s1-forms | 706.048 | 224 bytes de contexto, 96 bytes por opción | Scorer de opciones no generativo, una pasada | MIT | Checkpoint abierto en HuggingFace |
| Jev (TypeSafe, `jev-latest`) | no disponible | no disponible | System One con `AttentionHead`, mismo contrato de entrada/salida | no disponible (API hosted) | Solo como API hosted; el autor lo usa como referencia zero-shot |
| LLM o VLM autoregresivo de computer-use | no disponible | no disponible | Generación de acciones token a token | varía | múltiple |

La comparación publicada y verificable es únicamente contra Jev hosted, con los números de la sección anterior. Para el resto de alternativas (modelos generativos de computer-use, clasificadores de formularios ad hoc) no hay datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Solo elige entre entidades que un extractor de PDF o documento ya haya identificado como pares `Label: value`; no puede inventar un valor que no esté en el documento.
- Entrenado íntegramente con formularios sintéticos más una evaluación real muy reducida (196 decisiones); no está validado sobre formularios reales arbitrarios fuera del conjunto de demo.
- El encoder es byte-level y el vocabulario de etiquetas es de base inglesa, lo que limita el rendimiento esperado en formularios en otros idiomas.
- No está calibrado con el método RLCD de TypeSafe: es un checkpoint de investigación independiente, no una reproducción de Jev.
- Riesgo de alucinación entendido como falsa correspondencia: puede asignar alta probabilidad a una entidad del documento que se parezca superficialmente a un campo (por ejemplo, `state` frente a `university`), aunque los pares confusores se forzaron durante el entrenamiento para mitigarlo.
- No genera texto ni ejecuta acciones por sí mismo: el orden de ejecución (rellenos, después casillas, después el único clic de envío) lo decide código downstream, no el modelo.
- Sesgos conocidos: no disponibles; la ficha no documenta análisis de sesgo, y al depender de un generador sintético de personas y documentos podría heredar los sesgos de ese generador.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero al integrarse con cua-driver conviene revisar la licencia de ese componente por separado.
- Advertencia de producción: con 0 descargas y una validación real de 196 decisiones, conviene construir un conjunto de evaluación propio antes de desplegarlo en un flujo crítico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cua-ai/cua-s1-forms
- Repositorio del proyecto cua-s1: https://github.com/trycua/cua/tree/main/libs/cua-s1
- Driver de ejecución cua-driver: https://github.com/trycua/cua/tree/main/libs/cua-driver
- Bucle planner (snapshot, score, order, execute): https://github.com/trycua/cua/tree/main/libs/cua-s1/python/src/cua_s1/planner.py
- Resultados completos de la escalera de evaluación: `docs/RESULTS.md` dentro del repositorio cua-s1
- Artículo de TypeSafe sobre System One models y Jev: https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Nota: las búsquedas web realizadas no devolvieron enlaces relacionados con este modelo; los resultados obtenidos corresponden al concepto educativo "Conception Universelle des Apprentissages", sin relación con cua-s1-forms.
