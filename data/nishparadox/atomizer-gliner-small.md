# nishparadox/atomizer-gliner-small

## Resumen

atomizer-gliner-small es un modelo de extracción de afirmaciones atomicas ("atomos") desarrollado por nishparadox. No genera texto: a partir de un texto de entrada selecciona palabras, resuelve referencias a spans anteriores ("She" -> "Marie Curie") y anade conectores de clase cerrada para producir afirmaciones cortas y autocontenidas, puntuando cada una con dos cabezas criticas: `verifiable` (si es un hecho comprobable) y `checkworthy` (si merece ser verificado). Funciona en un unico forward pass de un modelo de 163 millones de parametros, con latencias de pocos milisegundos en GPU y decenas de milisegundos en portatil.

Tecnicamente parte de gliner-community/gliner_small-v2.5 (encoder DeBERTa-v3-small, BiLSTM y capa de span) al que anade cuatro cabezas: anchor, pair, antecedent y critic. El ensamblado de la salida a partir de esas predicciones es determinista. Esta en estado de prototipo de investigacion (v0.4) y esta pensado para texto de chat y de agentes, incluyendo primera persona, saludos, atenuantes ("I think...") y opiniones.

Su relevancia actual esta en el nicho de fact-checking y verificacion: convierte texto conversacional en unidades verificables sin inventar nombres ni cifras (un atomo no puede contener un nombre o numero que no este en la entrada, y los valores se copian byte a byte). El codigo de carga depende del paquete `atomizer`, cuyo repositorio es privado de momento y requiere acceso bajo peticion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER small v2.5 (encoder DeBERTa-v3-small, BiLSTM y capa de span) con cuatro cabezas: anchor, pair, antecedent y critic |
| Parametros totales | 163 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens; los textos mas largos se atomizan en ventanas por frase con contexto de solo lectura |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | state dict de PyTorch (`model.pt`) mas `atomizer.json` (backbone, ajustes, vocabularios de glue e insercion) |

## Arquitectura y entrenamiento

La arquitectura reutiliza el backbone de GLiNER small v2.5: un encoder DeBERTa-v3-small seguido de una BiLSTM y una capa de span. Sobre esa base se anaden cuatro cabezas con funciones especificas: la cabeza `anchor` predice, por palabra, si un atomo empieza ahi; la cabeza `pair` predice, por par (atomo, palabra), una de tres operaciones (KEEP, SUB, DROP) y el conector posterior a la palabra; la cabeza `antecedent` decide, por cada referencia, a que span anterior se refiere o "none" (mantener la referencia tal cual se escribio); y la cabeza `critic` puntua cada atomo en `verifiable` y `checkworthy`. El ensamblado final a partir de estas predicciones es determinista. Los textos de mas de 1.024 tokens se procesan en ventanas por frase con contexto de solo lectura.

El entrenamiento se hizo en cinco etapas, cada una continuando desde un checkpoint anterior (v0.4 parte de v0.2). No se realizaron llamadas a APIs para crear los datos de entrenamiento. Los conjuntos usados incluyen chentong00/propositionizer-wiki-data (42.857 pasajes de Wikipedia, ~7,7 proposiciones cada uno, etiquetadas con GPT-4 por los autores de Dense X Retrieval), Nithiwat/claimbuster (23.533 frases de debates estadounidenses con etiquetas humanas), iai-group/clef2024_checkthat_task1_en (check-worthiness si/no; train 22.501, dev 1.032, test 318), nishparadox/atomizer-chat-synthetic (escrito por IA, Claude; v0.1 con 12 tipos y 995/204 train/test, v0.2 con 18 tipos y 1.453/306, v0.3 con 19 tipos y 1.496/323), Factcheck-Bench (94 respuestas reales de ChatGPT; 62 train, 30 test reservado), nfliu/decontextualization (reescritura de una frase de Wikipedia para que sea autonoma, 1.224 ejemplos de train, que entrena solo la cabeza antecedent y la critic) y plantillas de chat generadas localmente. El conjunto sihaochen/propsegment se usa solo para test. Todas las ejecuciones quedan registradas en W&B en el proyecto `nasa-impact/atomizer`.

## Capacidades

- Extraccion de afirmaciones atomicas: divide un texto en unidades cortas y autocontenidas.
- Descontextualizacion: sustituye referencias por spans anteriores ("She" -> "Marie Curie", "The company" -> "Tesla") y anade palabras de enlace de clase cerrada ("is", "the", "'s").
- Preservacion de referencias: cuando no existe un span anterior que sea el referente, mantiene la referencia tal como esta escrita en lugar de adivinar un nombre.
- Fidelidad literal: un atomo no puede contener un nombre ni un numero que no aparezca en la entrada; los valores se copian byte a byte (por ejemplo "8846m").
- Puntuacion de comprobabilidad (`verifiable`) y de interes para verificacion (`checkworthy`) por atomo.
- Modo critico independiente: `critic_scores` permite puntuar afirmaciones ya existentes sin atomizar.
- Modo explicativo: `explain(...).show()` muestra las predicciones de cada cabeza.
- Filtrado por umbral: parametros `min_verifiable` y `min_checkworthy`.
- Tratamiento de texto conversacional y de agentes: primera persona, saludos, atenuantes ("I think...", que se desenvuelven) y opiniones (se emiten como atomos con `verifiable` bajo).
- No genera texto, por lo que no soporta tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Verificacion de hechos en redaccion: dado un articulo o una respuesta larga, el modelo extrae las afirmaciones verificables y las puntua, de modo que un periodista o un sistema de fact-checking prioriza solo los atomos con `checkworthy` alto antes de contrastarlos.
- Moderacion y analisis de debates: sobre transcripciones (por ejemplo, debates parlamentarios o comparecencias) permite aislar frases con carga factual y descartar opiniones, gracias a sus cabezas `verifiable` y `checkworthy` entrenadas con ClaimBuster y CLEF CheckThat!.
- Auditoria de respuestas de asistentes: en un pipeline tipo RAG, aplicado a las respuestas de un LLM, convierte cada respuesta en afirmaciones atomicas y comprobables para alimentar un verificador posterior o una base de hechos.
- Construccion de indices de recuperacion densa: la atomizacion en unidades autocontenidas facilita la generacion de pasajes cortos y descontextualizados para embeddings, aprovechando el trabajo sobre Dense X Retrieval / propositionizer.
- Extraccion de hechos en dominios cientificos y de noticias: con las ventanas de 1.024 tokens puede procesar articulos completos por frases, manteniendo la fidelidad de cifras y nombres (copiado byte a byte), util para bases de conocimiento.
- Analisis de conversaciones de atencion al cliente: el modelo entiende primera persona, saludos y atenuantes, por lo que puede extraer afirmaciones factuales de chats o transcripciones sin confundir opiniones con hechos.
- Preprocesado para sistemas de verificacion automatica: al producir atomos independientes, reduce el ruido de contexto y el coste de los verificadores posteriores, ya que cada atomo puede comprobarse de forma aislada.
- Anotacion asistida: `critic_scores` permite puntuar afirmaciones ya segmentadas por un anotador humano y ordenar la cola de revision por prioridad de verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas numericas de MMLU, HumanEval, GSM8K ni metricas propias (precicion, recall o F1) sobre los conjuntos de test. Solo se indica cualitativamente que la resolucion de referencias de sintagma nominal ("the company", "the film") acierta aproximadamente la mitad de las veces, sin cifra oficial publicada.

## Requisitos de hardware

- VRAM estimada para inferencia (163M parametros, sin cuantizacion oficial publicada): aproximadamente 0,65 GB en fp32 y 0,33 GB en fp16/bf16 solo para los pesos, mas activaciones y memoria del runtime.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente; se menciona ejecucion en GPU con latencias de pocos milisegundos por texto.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo (por ejemplo, series GTX 10xx en adelante y RTX 20xx/30xx/40xx) e incluso en CPU.
- CPU: funciona en portatil con latencias del orden de decenas de milisegundos por texto.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (el modelo no es de generacion de texto). La carga se realiza mediante el paquete `atomizer` (repositorio privado, acceso bajo peticion) usando `Atomizer.load("nishparadox/atomizer-gliner-small", revision="v0.4")`; los pesos son un state dict de PyTorch mas `atomizer.json`.
- Latencia y throughput: la model card indica "unos pocos milisegundos" por texto en GPU y "decenas de milisegundos" en portatil; no se proporcionan cifras de throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para modelos comparables en la informacion proporcionada. La comparacion se limita a caracteristicas estructurales conocidas:

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atomizer-gliner-small (este) | Atomizacion + critic de comprobabilidad | 163M | 1.024 tokens | cc-by-4.0 | Pesos en HuggingFace; codigo de carga privado bajo peticion |
| gliner-community/gliner_small-v2.5 (modelo base) | Reconocimiento de entidades (NER) de proposito general | 166M (referencia publica de GLiNER small) | variable | licencia del modelo base (consultar en su ficha) | Publico |
| Modelos de descontextualizacion (p. ej. aproximaciones basadas en Choi et al. 2021) | Reescritura de frases para que sean autonomas | no disponible | no disponible | no disponible | no disponible |

No se dispone de cifras de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Estado de investigacion: es un prototipo (v0.4), no un modelo listo para produccion sin validacion previa.
- Resolucion de referencias incompleta: las referencias de sintagma nominal ("the company", "the film") se resuelven solo aproximadamente la mitad de las veces.
- No genera texto: solo selecciona, sustituye y anade palabras de enlace; no sirve para tareas generativas, tool calling ni agentes.
- Fidelidad por diseno: un atomo no puede contener nombres ni cifras ausentes en la entrada, pero esto tambien implica que no puede normalizar, reformular ni completar informacion.
- Datos sinteticos escritos por IA: parte del entrenamiento usa nishparadox/atomizer-chat-synthetic, generado con Claude, con el sesgo y las limitaciones propias de los datos sinteticos.
- Idiomas: no se especifican idiomas soportados; los conjuntos de entrenamiento son mayoritariamente en ingles, por lo que cabe esperar un rendimiento limitado fuera del ingles.
- Longitud de contexto: 1.024 tokens; los textos mas largos se procesan en ventanas por frase con contexto de solo lectura, lo que puede degradar la resolucion de referencias a larga distancia.
- Acceso al codigo: el paquete `atomizer` esta en un repositorio privado y requiere acceso bajo peticion; esto puede dificultar la reproducibilidad y el despliegue inmediato.
- Licencia: cc-by-4.0 permite uso comercial con atribucion, pero debe revisarse la licencia del modelo base (gliner_small-v2.5) y de los conjuntos de datos empleados.
- Riesgo de alucinacion mitigado pero no nulo: aunque el diseno copia valores literalmente, la cabeza de resolucion de referencias puede asignar un antecedente incorrecto cuando existe ambiguedad.
- Sesgos de los datos subyacentes: ClaimBuster (debates estadounidenses) y CLEF CheckThat! pueden introducir sesgos de dominio, idioma y tematica en las puntuaciones `checkworthy`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nishparadox/atomizer-gliner-small
- Repositorio del paquete atomizer (privado, acceso bajo peticion): https://github.com/NISH1001/atomizer
- Documentacion de arquitectura: https://github.com/NISH1001/atomizer/blob/main/docs/ARCHITECTURE.md
- Registro de experimentos: https://github.com/NISH1001/atomizer/blob/main/docs/EXPERIMENTS.md
- Proyecto W&B (registro de entrenamiento): nasa-impact/atomizer
- Modelo base: https://huggingface.co/gliner-community/gliner_small-v2.5
- Dataset chentong00/propositionizer-wiki-data: https://huggingface.co/datasets/chentong00/propositionizer-wiki-data
- Dataset Nithiwat/claimbuster: https://huggingface.co/datasets/Nithiwat/claimbuster
- Dataset iai-group/clef2024_checkthat_task1_en: https://huggingface.co/datasets/iai-group/clef2024_checkthat_task1_en
- Dataset nishparadox/atomizer-chat-synthetic: https://huggingface.co/datasets/nishparadox/atomizer-chat-synthetic
- Dataset nfliu/decontextualization: https://huggingface.co/datasets/nfliu/decontextualization
- Dataset sihaochen/propsegment: https://huggingface.co/datasets/sihaochen/propsegment
- Factcheck-Bench: https://github.com/yuxiaw/Factcheck-GPT
