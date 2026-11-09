# sag-uniroma2/GRISDG13_MODEL

## Resumen

GRISDG13_MODEL es un modelo de clasificación de texto en inglés desarrollado por el Semantic Analytics Group (SAG) de la Universidad de Roma Tor Vergata. Su función concreta es clasificar divulgaciones climáticas alineadas con el ODS 13 (Acción por el clima) en tres categorías temáticas definidas por los estándares GRI: GRI 2 (General), GRI 201 (Económico) y GRI 305 (Medioambiental). Forma parte del sistema UniTor ESG Insights, presentado en CIKM 2026, una plataforma interactiva con intervención humana para el análisis trazable de informes de sostenibilidad.

El modelo se construye mediante fine-tuning del checkpoint ClimateBERT `distilroberta-base-climate-f`, una variante destilada de RoBERTa especializada en dominio climático. El resultado es un clasificador ligero (repo de 0,3 GB) orientado a una tarea muy específica de clasificación multiclase, no a generación de texto ni a razonamiento general.

Es relevante ahora porque automatiza una parte del proceso de verificación de informes ESG, un ámbito donde la trazabilidad y la alineación con marcos normativos (GRI, ODS) son críticas. Su tamaño reducido y su licencia Apache 2.0 lo hacen desplegable en infraestructura modesta, aunque su alcance queda limitado a la tarea y al idioma para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilRoBERTa, fine-tune de ClimateBERT) |
| Parametros totales | no disponible (repo de 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,3 GB en Hugging Face) |

## Arquitectura y entrenamiento

El modelo parte de `climatebert/distilroberta-base-climate-f`, un DistilRoBERTa ajustado sobre corpus climático. Sobre esa base se realiza un fine-tuning de clasificación multiclase para asignar cada fragmento de divulgación climática a una de tres categorías GRI (GRI 2, GRI 201, GRI 305). La arquitectura es, por tanto, un encoder transformer con cabeza de clasificación, sin mecanismos de generación ni decodificación.

El conjunto de entrenamiento consta de 888 muestras (etiquetadas como "Human+Auto AI"), distribuidas en 320 ejemplos de GRI 2, 301 de GRI 201 y 267 de GRI 305. El conjunto de test tiene 181 muestras (113 de GRI 2, 31 de GRI 201 y 37 de GRI 305). No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador). Tampoco se documentan innovaciones técnicas adicionales más allá del fine-tuning sobre la base climática.

## Capacidades

- Clasificación multiclase de texto en inglés en tres categorías GRI: GRI 2 (General), GRI 201 (Económico) y GRI 305 (Medioambiental).
- Etiquetado de divulgaciones climáticas alineadas con el ODS 13.
- Integración en un sistema de análisis de informes de sostenibilidad con trazabilidad a párrafos fuente y páginas PDF.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Clasificación de párrafos de informes de sostenibilidad: el modelo recibe fragmentos de memorias corporativas y los asigna a GRI 2, GRI 201 o GRI 305, permitiendo indexar automáticamente el contenido por temática.
- Verificación de alineación con el ODS 13: en pipelines de auditoría ESG, se usa para filtrar qué divulgaciones climáticas corresponden a cada categoría GRI antes de la revisión humana.
- Enriquecimiento de sistemas de análisis documental: integrado en UniTor ESG Insights, permite explorar predicciones junto a los párrafos y páginas PDF de origen, facilitando la revisión trazable.
- Preetiquetado en flujos human-in-the-loop: reduce el trabajo manual de analistas que revisan informes extensos, dejando la validación final a la persona.
- Construcción de datasets etiquetados de divulgación climática: sirve como clasificador base para generar anotaciones preliminares que luego se corrigen manualmente.
- Monitorización de reporting regulatorio: en entornos donde se requiere comprobar la cobertura de temas GRI en informes anuales, el modelo agiliza la detección de secciones relevantes.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy | 94,5 % |
| Macro F1 | 91,0 % |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni desgloses por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0,3 GB) y la arquitectura DistilRoBERTa, es compatible con GPUs de gama baja e incluso con CPU.
- GPU recomendadas: no disponible; un modelo de este tamaño puede ejecutarse en GPUs consumer (por ejemplo, RTX 3060 o superiores) e incluso en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con suficiente memoria para un encoder destilado (estimación no confirmada en la información disponible).
- Opciones de despliegue: no se documentan en la información disponible; al ser un modelo de Hugging Face Transformers, es desplegable con las herramientas habituales (pipeline de Transformers, TGI, etc.), aunque no se confirma compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRISDG13_MODEL | no disponible | no disponible | Accuracy 94,5 %, Macro F1 91,0 % | Apache 2.0 | Hugging Face |
| sag-uniroma2/SA_MODEL | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| climatebert/distilroberta-base-climate-f | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos comparativos de rendimiento con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- Está especializado en una tarea muy concreta (clasificación GRI de divulgaciones climáticas) y no es un modelo de propósito general.
- El conjunto de entrenamiento es reducido (888 muestras) y con desequilibrio entre clases (320/301/267 en train; 113/31/37 en test), lo que puede afectar a la robustez en clases minoritarias.
- No se documentan sesgos conocidos ni evaluaciones de robustez fuera del conjunto de test.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas en textos ambiguos o fuera de dominio.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento y del modelo base.
- Para producción, conviene validar el modelo sobre el dominio concreto de los informes a analizar, dado que la distribución de test puede no reflejar otros corpus.

## Enlaces

- Hugging Face: https://huggingface.co/sag-uniroma2/GRISDG13_MODEL
- Demo interactiva: https://huggingface.co/spaces/sag-uniroma2/UniTorESGInsights
- Repositorio GitHub: https://github.com/crux82/UniTorESGInsights
- Colección de modelos: https://huggingface.co/collections/sag-uniroma2/unitoresginsights
- Paper (CIKM 2026): https://doi.org/10.1145/3799682.3840253
- Modelo base: https://huggingface.co/climatebert/distilroberta-base-climate-f
- Perfil del autor: https://huggingface.co/sag-uniroma2
- Modelo relacionado (SA_MODEL): https://huggingface.co/sag-uniroma2/SA_MODEL
