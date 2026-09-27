# marioluciofjr/layakedin

## Resumen

layakedin es un modelo de clasificación de texto en portugués desarrollado por el usuario independiente marioluciofjr. Se trata de un fine-tuning del checkpoint multilingüe de Laya (`convaiinnovations/laya`, subcarpeta `multilingual`), un encoder mmBERT-base de 321.908.998 parámetros que funciona como modelo de decisión no autorregresivo: recibe una pregunta tipada y devuelve una respuesta en una sola pasada, sin generar texto token a token. Su tarea concreta es clasificar temas de publicaciones de CEOs en LinkedIn dentro de ocho familias temáticas definidas por la taxonomía del informe *Presença digital dos CEOs no LinkedIn* de Elementar/FGV.

El modelo resuelve un problema de triaje: dado el tema de un post y, opcionalmente, su descripción, devuelve la familia más probable junto con probabilidades calibradas para las ocho categorías. Las familias cubren clima y sostenibilidad, futuro del trabajo, tecnología e IA, democracia e instituciones, diversidad e inclusión, desarrollo nacional, otras cuestiones públicas y contenido empresarial no sociopolítico. El autor justifica el fine-tuning frente a alternativas basadas en prompts o RAG por la consistencia de formato y la velocidad de decisión, y respalda la calibración con una Expected Calibration Error declarada de 0,053.

Es relevante en el nicho del análisis de comunicación corporativa y activismo sociopolítico de directivos: permite etiquetar grandes volúmenes de contenido con una única pasada y probabilidades interpretables, en lugar de depender de modelos generativos que redactan respuestas variables. Se distribuye bajo licencia Apache 2.0, con pesos en safetensors y un tamaño de repositorio de 0,7 GB. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que carece de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT-base (Laya multilingüe); transformer no autorregresivo para decisión/clasificación en una sola pasada |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors, 0,7 GB) |
| Idiomas soportados | portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

layakedin parte del checkpoint multilingüe de Laya, cuyo backbone es un encoder mmBERT-base de 322M parámetros. A diferencia de un modelo generativo autorregresivo, Laya responde a preguntas tipadas en una única pasada y devuelve una decisión; layakedin hereda esa naturaleza y añade una cabeza de clasificación sobre ocho familias temáticas con salida de probabilidades calibradas. La librería de referencia es `laya` (versión >= 0.3.20), y el modelo exige emplear exactamente la pregunta guardada en `agente.cfg["pergunta"]`, sin alterar la instrucción ni las descripciones de las familias, porque el entrenamiento asoció esos textos concretos a las etiquetas.

Los datos de entrenamiento son 5.000 ejemplos sintéticos en portugués, 625 por familia. De ellos, 2.782 provienen de una base sintética original de temas de publicaciones de 16 CEOs ficticios con rótulos estandarizados y revisados, y 2.218 se escribieron nuevos para cubrir las familias en 20 sectores adicionales. La partición es por CEO: los cuatro directivos de test (bolsa de valores, hotelaría, seguros y siderurgia) no aparecen ni en entrenamiento ni en validación. La división queda en 3.926 ejemplos de entrenamiento, 496 de validación y 578 de test. El 20% de los ejemplos tiene la descripción vacía. Todos los textos son sintéticos y no contienen publicaciones reales de LinkedIn ni datos personales de personas reales; se generaron y curaron con Gemini Spark y Claude Chat. La tabla completa de hiperparámetros del procedimiento de entrenamiento no está disponible en la información proporcionada (el README la trunca).

## Capacidades

- Clasificación de texto en portugués en ocho familias temáticas: `clima`, `trabalho`, `tecnologia`, `democracia`, `diversidade`, `desenvolvimento`, `outro_publico` y `negocio`.
- Salida de probabilidades calibradas para las ocho categorías, no solo la etiqueta ganadora.
- Inferencia no autorregresiva en una sola pasada, con foco en latencia baja y formato de respuesta estable.
- Procesamiento conjunto de un campo `tema` y un campo `descricao` opcional.
- Clasificación por lotes mediante `agente.predict_batch(lista_de_estados, pergunta, batch_size=32)`.
- Capacidad de generalización a CEOs no vistos durante el entrenamiento, según la partición por directivo declarada por el autor.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito según la información disponible.

## Casos de uso

- Monitorización de reputación corporativa: clasificar de forma masiva publicaciones de directivos en LinkedIn en las ocho familias para alimentar paneles de seguimiento temático, aprovechando que el modelo devuelve probabilidades calibradas y no solo una etiqueta.
- Análisis de activismo sociopolítico corporativo: separar el contenido sociopolítico (`clima`, `trabalho`, `tecnologia`, `democracia`, `diversidade`, `desenvolvimento`, `outro_publico`) del puramente empresarial (`negocio`) para medir la intensidad con que una compañía entra en debates públicos.
- Investigación académica sobre discurso de CEOs: etiquetar corpus de publicaciones en portugués con una taxonomía reproducible, usando la partición por CEO y la ECE declarada para justificar la fiabilidad de las etiquetas en un estudio.
- Enrutado automático en plataformas de escucha social: dirigir cada mención o publicación clasificada al equipo correspondiente (sostenibilidad, relaciones laborales, asuntos públicos, comunicación) en función de la familia asignada.
- Alertas tempranas de riesgo reputacional: activar avisos cuando la probabilidad de una familia sensible supera un umbral configurable, apoyándose en la calibración del modelo para fijar ese umbral con criterio estadístico.
- Etiquetado de datasets para terceros modelos: generar anotaciones temáticas automáticas que después se revisan y se usan para entrenar clasificadores supervisados o para construir indicadores agregados.
- Elaboración de informes periódicos para comités de sostenibilidad o de gobierno corporativo: agregar las familias `clima`, `diversidade` y `democracia` para cuantificar la presencia de cada eje en la comunicación del equipo directivo.
- Normalización de taxonomías internas: mapear categorías propias de una herramienta de monitorización a las ocho familias estándar del informe de Elementar/FGV mediante el clasificador.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. Todos figuran como `verified: false`, es decir, no verificados de forma independiente.

| Metrica | Dataset / particion | Valor |
|---|---|---|
| Accuracy | Base sintética de temas de CEOs (test con CEOs nunca vistos), split test | 0,829 |
| F1-macro | Base sintética de temas de CEOs (test con CEOs nunca vistos), split test | 0,830 |
| F1-macro (solo líneas originales) | Base sintética de temas de CEOs (test con CEOs nunca vistos), split test | 0,556 |
| Expected Calibration Error | Base sintética de temas de CEOs (test con CEOs nunca vistos), split test | 0,053 |

No se han publicado en la información disponible resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones directas con otros clasificadores bajo el mismo protocolo.

## Requisitos de hardware

- Peso de los parámetros: con 321.908.998 parámetros, el modelo ocupa aproximadamente 0,64 GB en fp16/bf16 y 1,29 GB en fp32. El repositorio completo pesa 0,7 GB, coherente con pesos de 16 bits.
- VRAM estimada para inferencia: del orden de 1 a 2 GB en fp16/bf16 contando pesos y activaciones; cifra estimada a partir del recuento de parámetros, no publicada por el autor.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4060 o superior cubre el modelo con holgura, y también cabe en iGPU o en CPU con memoria RAM suficiente.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU con al menos 2-4 GB de VRAM.
- Opciones de despliegue: la vía documentada es la librería `laya` (`pip install "laya>=0.3.20"`), con carga mediante `laya.load("marioluciofjr/layakedin")`. No hay soporte confirmado para vLLM, TGI, llama.cpp u Ollama en la información disponible, dado que no es un modelo generativo autorregresivo.
- Latencia y throughput: no disponibles. El modelo admite clasificación por lotes con `batch_size=32`, lo que sugiere orientación a procesamiento masivo, pero el autor no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. La comparación cuantitativa con alternativas no está disponible.

| Modelo | Relacion | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| marioluciofjr/layakedin | Modelo de esta ficha | 321.908.998 | no disponible | Apache 2.0 | Accuracy 0,829; F1-macro 0,830; ECE 0,053 (autor, sin verificar) |
| convaiinnovations/laya | Modelo base del que deriva el fine-tuning | 322M (checkpoint multilingüe) | no disponible | no disponible en la informacion proporcionada | no disponible |

No se identifican en la información disponible otros clasificadores temáticos de publicaciones de CEOs en portugués con los que establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Dependencia de un formato rígido: el modelo debe invocarse con la pregunta guardada en `agente.cfg["pergunta"]` y sin modificar la instrucción ni las descripciones de las familias; cualquier variación degrada el resultado.
- Cobertura lingüística limitada al portugués; no hay evidencia de funcionamiento en otros idiomas.
- Pérdida de eficacia ante jergas, bromas o textos informales, reconocida explícitamente por el autor.
- Riesgo de clasificación errónea con confianza alta: la ECE de 0,053 indica buena calibración global, pero no elimina errores puntuales; conviene fijar umbrales y revisar casos límite.
- El F1-macro de 0,556 medido únicamente sobre las líneas originales es notablemente inferior al 0,830 global, lo que apunta a un rendimiento desigual según el subconjunto de datos.
- Entrenamiento exclusivamente con datos sintéticos generados por Gemini Spark y Claude Chat: puede no reflejar la distribución real de publicaciones de LinkedIn y arrastrar sesgos de los generadores empleados.
- Sesgos potenciales derivados de la propia taxonomía de Elementar/FGV y de la selección de 16 CEOs ficticios y 20 sectores adicionales.
- El 20% de los ejemplos de entrenamiento tiene el campo de descripción vacío, lo que condiciona el comportamiento cuando se aporta o se omite ese campo.
- Métricas declaradas por el autor y marcadas como no verificadas; el modelo tiene 0 descargas y 0 likes, sin validación independiente conocida.
- No es un modelo generativo: no sirve para redactar, resumir ni mantener conversaciones; solo clasifica.
- Licencia Apache 2.0, que permite uso comercial del modelo, pero la taxonomía procede de un informe público de Elementar/FGV y el proyecto se declara no afiliado ni endosado por esas entidades; conviene revisar las condiciones de reutilización de la taxonomía.
- Proyecto independiente y reciente (creado el 27 de septiembre de 2026), sin historial de mantenimiento ni comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marioluciofjr/layakedin
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Informe de referencia *Presença digital dos CEOs no LinkedIn* (Elementar/FGV): https://elementarcomunicacao.com.br/pesquisa-ceos-linkedin-reputacao-valor-de-mercado/#baixar

La búsqueda web realizada no devolvió enlaces relevantes sobre el modelo: los resultados correspondían a páginas de inicio de sesión de servicios de correo ajenos al tema.
