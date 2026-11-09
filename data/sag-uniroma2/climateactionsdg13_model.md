# sag-uniroma2/ClimateActionSDG13_MODEL

## Resumen

ClimateActionSDG13_MODEL es un clasificador binario de texto desarrollado por el grupo SAG de la Università degli Studi di Roma Tor Vergata (UniTor) para detectar si un fragmento de un informe de sostenibilidad aborda acciones climáticas alineadas con el Objetivo de Desarrollo Sostenible 13 (Acción por el Clima) de la ONU. El modelo se construye mediante fine-tuning del checkpoint ClimateBERT `distilroberta-base-climate-f`, una variante destilada de RoBERTa adaptada al dominio climático mediante preentrenamiento sobre literatura y divulgación climática.

Forma parte del sistema UniTor ESG Insights, presentado en CIKM 2026, una plataforma interactiva human-in-the-loop para el análisis trazable de informes de sostenibilidad. El modelo se integra junto con otros clasificadores especializados en alineación con los ODS y los estándares GRI, evaluación de la calidad de la divulgación y análisis climático, de forma que cada predicción puede explorarse junto al párrafo fuente y la página del PDF original.

Su relevancia práctica radica en que automatiza una tarea de etiquetado que hasta ahora requería revisión manual por analistas ESG: determinar qué secciones de un informe corporativo constituyen divulgación real de acción climática frente a menciones genéricas o irrelevantes. Con 91,7 % de exactitud y 91,5 % de F1 macro sobre un conjunto de test anotado por humanos, ofrece un punto de partida útil para pipelines de análisis documental, aunque su tamaño de entrenamiento (888 muestras) y su alcance (solo inglés) limitan su uso fuera de ese dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilada, DistilRoBERTa) con cabeza de clasificación binaria |
| Parametros totales | no disponible (el checkpoint base `distilroberta-base-climate-f` es una variante destilada de RoBERTa; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del tokenizador de RoBERTa; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (repo de 0,3 GB, pesos probablemente en fp32; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors / PyTorch (formato estándar de transformers; no se detalla en la model card) |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias basado en un encoder transformer de tipo DistilRoBERTa, inicializado desde `climatebert/distilroberta-base-climate-f`. ClimateBERT es un proyecto de preentrenamiento de dominio que adapta RoBERTa al lenguaje de informes y literatura climática; la variante `distilroberta-base-climate-f` aplica la destilación de DistilRoBERTa sobre ese corpus, lo que reduce el coste de inferencia manteniendo la familiaridad con terminología ESG y climática. Sobre esa base se añade una cabeza de clasificación binaria y se realiza fine-tuning supervisado.

El conjunto de entrenamiento combina muestras humanas y generadas automáticamente por IA: 888 ejemplos en total (568 positivos de acción climática y 320 negativos). El conjunto de test es exclusivamente humano: 181 ejemplos (68 positivos y 113 negativos). No se documentan en la información disponible detalles sobre hiperparámetros, número de épocas, estrategia de aumento de datos, ni si se aplicaron técnicas de RLHF/DPO (inusuales en un clasificador de este tamaño). Tampoco se especifica la composición exacta del corpus de informes de sostenibilidad utilizado ni el proceso de anotación más allá de la distinción humano/auto.

## Capacidades

- Clasificación binaria de texto: determina si un fragmento (párrafo o sección) de un informe de sostenibilidad corresponde a divulgación de acción climática alineada con SDG 13.
- Procesamiento de texto en inglés dentro del dominio ESG y de informes corporativos de sostenibilidad.
- Integración en un sistema human-in-the-loop: las predicciones se presentan junto al párrafo fuente y la página del PDF para revisión y trazabilidad.
- Capacidad de formar parte de un pipeline multi-modelo (UniTor ESG Insights) que combina clasificación SDG/GRI, evaluación de calidad de divulgación y análisis climático.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modos de razonamiento extendido; es un clasificador de texto puro.
- Capacidades multilingües: no; solo inglés.

## Casos de uso

- Cribado previo de informes de sostenibilidad: procesar un informe anual o de sostenibilidad completo y etiquetar automáticamente los párrafos candidatos a divulgación de acción climática, reduciendo el volumen que un analista ESG debe revisar manualmente antes de la verificación final.
- Auditoría de alineación con ODS 13: verificar qué porcentaje del informe corporativo aborda realmente acción climática frente a otros ODS, generando métricas cuantitativas de cobertura temática para informes de materialidad.
- Construcción de datasets ESG etiquetados: usar el modelo como etiquetador débil para preanotar grandes corpus de informes y acelerar la creación de conjuntos de entrenamiento supervisados con revisión humana posterior.
- Monitorización de compromisos climáticos en series temporales: aplicar el clasificador a los informes de un mismo emisor a lo largo de varios años para detectar cambios en la proporción de divulgación climática y señalar posibles casos de greenwashing o de deterioro del reporting.
- Enriquecimiento de bases de datos de sostenibilidad: indexar y etiquetar fragmentos de informes para motores de búsqueda internos o plataformas de análisis que necesiten filtrar por temática climática con trazabilidad a la fuente.
- Investigación académica en finanzas sostenibles: generar variables de exposición climática a nivel de párrafo para estudios empíricos sobre divulgación, sin necesidad de anotación manual exhaustiva, dado el bajo coste de inferencia del modelo destilado.
- Integración en el sistema UniTor ESG Insights: desplegar el modelo dentro de la demo interactiva para que analistas exploren predicciones junto con el contexto del PDF original, apoyando flujos de trabajo human-in-the-loop.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del conjunto de test humano (181 muestras):

| Metrica | Valor |
|---|---|
| Accuracy | 91,7 % |
| Macro F1 | 91,5 % |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni desagregados de precisión/recall por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Al tratarse de un DistilRoBERTa (repo de 0,3 GB con pesos), la inferencia en fp32 requiere aproximadamente 1-2 GB de VRAM incluyendo overhead; en fp16 o int8, menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso GPU integrada puede ejecutar el modelo. Para lotes grandes, A100 o H100 no son necesarias pero aceleran el throughput.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM; también puede ejecutarse en CPU con latencia aceptable para clasificación por lotes.
- Opciones de despliegue: pipeline de `transformers` (PyTorch), `text-classification` de Hugging Face, exportación a ONNX Runtime para CPU, o servidores de inferencia como TGI o vLLM (aunque para este tamaño el beneficio de vLLM es limitado). No se documentan pesos GGUF para llama.cpp/Ollama, pero la conversión sería factible.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto (cientos o miles de fragmentos por segundo en GPU consumer con batching), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClimateActionSDG13_MODEL | no disponible (DistilRoBERTa) | no disponible | Clasificación binaria SDG 13 | apache-2.0 | Hugging Face |
| climatebert/distilroberta-base-climate-f | no disponible (DistilRoBERTa) | no disponible | Modelo base de dominio climático (masked LM) | no disponible en la información | Hugging Face |
| Otros clasificadores ESG del sistema UniTor ESG Insights | no disponible | no disponible | Clasificación SDG/GRI, calidad de divulgación | no disponible en la información | Colección Hugging Face sag-uniroma2 |

No se dispone de datos de rendimiento de modelos alternativos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de benchmarks.

## Limitaciones y advertencias

- Tamaño de entrenamiento reducido: 888 muestras de entrenamiento (568 positivas, 320 negativas), con posible desbalance de clases que puede afectar la precisión en la clase minoritaria; el test tiene 68 positivos frente a 113 negativos.
- Mezcla de datos humanos y generados por IA en entrenamiento: no se detalla la proporción ni el método de generación, lo que introduce incertidumbre sobre posibles sesgos de etiquetado automático.
- Solo inglés: no soporta informes en castellano ni en otros idiomas, lo que limita su uso en el mercado español y latinoamericano sin traducción previa.
- Dominio estrecho: entrenado específicamente para divulgación de acción climática en informes de sostenibilidad; el rendimiento fuera de ese dominio (noticias, redes sociales, documentos técnicos) no está validado.
- Riesgo de alucinación: como clasificador, no genera texto, pero puede producir falsos positivos/negativos sistemáticos en párrafos ambiguos o con menciones climáticas genéricas; la model card no publica matrices de confusión ni análisis de errores.
- Sin datos sobre sesgos: no se documentan evaluaciones de sesgo por sector, geografía o tipo de empresa.
- Licencia apache-2.0: permite uso comercial y modificación, pero no se especifican restricciones adicionales sobre los datos de entrenamiento (posibles derechos sobre informes corporativos).
- Advertencia de producción: con 11 descargas y 0 likes, el modelo tiene muy poca validación comunitaria; conviene evaluarlo en un conjunto propio antes de integrarlo en flujos críticos.
- No se documentan limitaciones de longitud de contexto específicas; fragmentos más largos que la ventana del tokenizador de RoBERTa serían truncados sin aviso explícito en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sag-uniroma2/ClimateActionSDG13_MODEL
- Demo interactiva UniTor ESG Insights: https://huggingface.co/spaces/sag-uniroma2/UniTorESGInsights
- Repositorio GitHub: https://github.com/crux82/UniTorESGInsights
- Colección completa de modelos: https://huggingface.co/collections/sag-uniroma2/unitoresginsights
- Paper (CIKM 2026): https://doi.org/10.1145/3799682.3840253
- Modelo base ClimateBERT: https://huggingface.co/climatebert/distilroberta-base-climate-f
