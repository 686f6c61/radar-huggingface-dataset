# fefofico/nuclear_trained_harrier

## Resumen

`fefofico/nuclear_trained_harrier` es un clasificador de texto binario construido con la técnica SetFit sobre el modelo de embeddings `microsoft/harrier-oss-v1-0.6b`. Lo desarrolla el usuario fefofico y su propósito es distinguir textos relacionados con armamento nuclear y proliferación (etiqueta `positive`) de textos que no lo están (etiqueta `negative`). SetFit permite entrenar clasificadores con muy pocos ejemplos etiquetados, sin necesidad de ingeniería de prompts ni de un LLM generativo.

El modelo no es un LLM generativo: es un pipeline de dos etapas en el que un Sentence Transformer (Harrier, de la familia Qwen3, con 596 millones de parámetros) genera embeddings y una regresión logística de scikit-learn actúa como cabeza de clasificación. El contexto máximo declarado es de 32.768 tokens, lo que permite clasificar documentos largos de una sola pasada.

Es relevante para tareas de filtrado y monitorización de contenido sensible (OSINT, verificación de noticias, moderación temática) donde se necesita un clasificador ligero, rápido y entrenable con pocos datos, en lugar de un modelo generativo grande. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia y los idiomas no están declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: Sentence Transformer (Harrier, familia Qwen3) + cabeza de regresión logística |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (máximo de secuencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificación de texto (2 clases) |
| Modelo base | microsoft/harrier-oss-v1-0.6b |
| Librería | setfit |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit en dos fases. Primero se ajusta el Sentence Transformer `microsoft/harrier-oss-v1-0.6b` con aprendizaje contrastivo sobre pares de frases generados a partir de los ejemplos etiquetados; después se entrena una regresión logística sobre los embeddings resultantes. El cuerpo del encoder pertenece a la familia Qwen3, con 596 millones de parámetros, y el contexto máximo declarado es de 32.768 tokens. La cabeza de clasificación es una instancia de `LogisticRegression` de scikit-learn, por lo que la inferencia final es extremadamente barata en cómputo.

El entrenamiento se realizó con la técnica de few-shot learning descrita en el artículo *Efficient Few-Shot Learning Without Prompts* (arXiv:2209.11055). No se especifica el número de ejemplos de entrenamiento, la composición del dataset, ni si hubo aumentación de datos adicional. Tampoco se documenta el proceso de selección de hiperparámetros ni la semilla. El modelo tiene dos clases: `positive` (textos sobre armamento nuclear, proliferación o disuasión) y `negative` (textos que no abordan esa temática).

## Capacidades

- Clasificación binaria de texto en dos categorías: contenido relacionado con armamento nuclear y contenido no relacionado.
- Procesamiento de secuencias largas de hasta 32.768 tokens, adecuado para artículos, informes o transcripciones extensas.
- Entrenamiento con pocos ejemplos (few-shot), lo que facilita reentrenar el clasificador con un conjunto etiquetado reducido.
- Inferencia ligera: el encoder genera el embedding y la regresión logística produce la etiqueta, sin generación de texto.
- Compatible con `text-embeddings-inference` y con `endpoints_compatible`, según los tags del repositorio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo).
- Capacidades multilingües: no disponibles; no se declaran idiomas soportados.

## Casos de uso

- Monitorización de OSINT: clasificar automáticamente artículos y comunicados de prensa para detectar menciones a programas nucleares, pruebas o tratados, usando el contexto largo para procesar documentos completos sin truncar.
- Filtrado de noticias para alertas tempranas: integrar el clasificador en un pipeline de ingesta RSS o APIs de noticias para etiquetar en tiempo real piezas relacionadas con proliferación nuclear y derivarlas a analistas.
- Moderación temática en foros y redes: identificar hilos o publicaciones que abordan armamento nuclear para aplicar políticas de contenido o etiquetado informativo.
- Enriquecimiento de bases de datos documentales: clasificar corpus de documentos desclasificados o informes de organismos internacionales y asignar metadatos temáticos de forma automática.
- Verificación de fuentes en periodismo: prefiltrar grandes volúmenes de texto para que los redactores revisen solo los documentos candidatos a tratar temas nucleares.
- Investigación académica en ciencias políticas: construir series temporales de cobertura mediática sobre armamento nuclear clasificando archivos históricos de prensa con un modelo entrenable con pocos ejemplos.
- Reentrenamiento rápido para dominios específicos: al ser SetFit, un equipo puede etiquetar unos cientos de ejemplos de su propio corpus y reajustar el clasificador sin necesidad de GPUs de gran capacidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Métrica | Valor |
|---|---|
| F1_Macro | 0,9004 |
| F1_Binary | 0,9043 |

El conjunto de evaluación figura como `Unknown` (split `test`), por lo que no es posible contextualizar estos valores frente a un benchmark público estándar. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 596 millones de parámetros en precisión FP16, el encoder ocupa aproximadamente 1,2 GB de pesos; en FP32, unos 2,4 GB. La cabeza de regresión logística añade un consumo despreciable.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas aceleradoras.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). También puede ejecutarse en CPU con latencia aceptable para lotes pequeños.
- Opciones de despliegue: la librería `setfit` para carga directa; `sentence-transformers` para generar embeddings; `text-embeddings-inference` según los tags del repositorio; exportación a ONNX no documentada.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de un encoder de 0,6B más una regresión logística, se espera un throughput alto en GPU y moderado en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| fefofico/nuclear_trained_harrier | SetFit (encoder + regresión logística) | 596 M | 32.768 | no disponible | Clasificador binario especializado en temática nuclear |
| microsoft/harrier-oss-v1-0.6b | Sentence Transformer | 596 M | no disponible | no disponible | Modelo base sin cabeza de clasificación; requiere entrenamiento posterior |
| Clasificador SetFit genérico sobre MiniLM | SetFit (encoder + regresión logística) | ~22 M | 512 | según modelo base | Mucho más pequeño y rápido, pero con contexto corto y sin especialización temática |

No se dispone de datos de rendimiento comparables de terceros en la información proporcionada. La comparación se limita a características estructurales.

## Limitaciones y advertencias

- El modelo es un clasificador binario de dominio específico; no genera texto ni responde preguntas.
- El conjunto de evaluación es desconocido y las métricas no están verificadas (`verified: false`), por lo que los valores de F1 deben tomarse con cautela.
- No se declaran idiomas soportados; el rendimiento en castellano o en otros idiomas distintos del inglés es incierto.
- Riesgo de falsos positivos y negativos en textos ambiguos: menciones colaterales a energía nuclear civil, metáforas o contextos históricos pueden clasificarse erróneamente.
- La licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; es un bloqueante para producción hasta aclararlo.
- El modelo base `microsoft/harrier-oss-v1-0.6b` tampoco declara licencia en la información disponible, lo que añade incertidumbre legal.
- Sesgos conocidos: no documentados. Al entrenarse con ejemplos probablemente periodísticos en inglés, puede heredar sesgos de cobertura mediática (sobrerrepresentación de ciertos países o conflictos).
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso ni validación comunitaria.
- No apto para decisiones automatizadas de alto riesgo sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fefofico/nuclear_trained_harrier
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Repositorio SetFit: https://github.com/huggingface/setfit
- Artículo SetFit: https://arxiv.org/abs/2209.11055
- Blogpost SetFit: https://huggingface.co/blog/setfit
- Documentación Sentence Transformers: https://www.sbert.net
- Regresión logística de scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
