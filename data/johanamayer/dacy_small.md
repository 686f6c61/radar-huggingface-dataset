# johanamayer/dacy_small

## Resumen

DaCy small es un modelo de procesamiento de lenguaje natural para danés, desarrollado por Kenneth Enevoldsen, Johana Mayerova y Mikkel Krøjen Svendsen desde el Centre for Humanities Computing. Forma parte del framework DaCy, diseñado para ofrecer pipelines lingüísticos de alta calidad para el danés y herramientas para analizar pipelines existentes.

Este modelo concreto es un pipeline de spaCy cuyo nombre técnico es `da_cdt_electra_small_final_ddt_dane_cdt`. Se compone de un transformer base (Electra-small-nordic) y de componentes de análisis como etiquetador POS, morfologizador, lematizador, parser de dependencias y reconocedor de entidades nombradas. Está entrenado sobre dos corpus de referencia: el UD Danish DDT v2.18 para dependencias morfológicas y sintácticas, y el dataset DaNE para entidades nombradas.

El modelo está disponible bajo licencia Apache-2.0, su tamaño de repositorio es de 0.1 GB y es una opción ligera para tareas de análisis lingüístico en danés, en contraposición a las versiones medium y large de DaCy que ofrecen mayor precisión a costa de más recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Electra-small-nordic) + pipeline de spaCy (tagger, morphologizer, lemmatizer, parser, NER) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | danés (da) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pipeline de spaCy (componentes: transformer, tagger, morphologizer, trainable_lemmatizer, parser, ner) |

## Arquitectura y entrenamiento

El modelo utiliza un pipeline estándar de spaCy que integra un transformer `Electra-small-nordic` como capa codificadora. Sobre esta representación contextual se apilan componentes de análisis: un etiquetador de categorías gramaticales (XPOS), un morfologizador que predice rasgos morfológicos, un lematizador entrenable, un parser de dependencias y un reconocedor de entidades nombradas. La versión del pipeline es 0.3.0 y requiere spaCy `>=3.8.14,<3.9.0`.

Los datos de entrenamiento provienen de dos fuentes principales: el treebank Universal Dependencies para danés (UD Danish DDT v2.18) y el dataset DaNE, que contiene anotaciones de entidades nombradas, etiquetas POS y dependencias para textos daneses. El transformer base es `jonfd/electra-small-nordic`, un modelo Electra pequeño preentrenado sobre textos en lenguas nórdicas.

No se ha especificado si se aplicaron técnicas de ajuste fino como RLHF o DPO, ya que el modelo no es un modelo generativo. La principal innovación técnica radica en la integración con el framework DaCy, que además de pipelines SOTA incluye utilidades para evaluar sesgos y robustez de pipelines daneses.

## Capacidades

- Análisis de categorías gramaticales (POS) y etiquetas POS extendidas (XPOS) con precisión reportada de 0.9814 y 0.9808 respectivamente.
- Análisis morfológico: predicción de rasgos morfológicos (UFeats) con precisión de 0.9768.
- Lematización automática: precisión de 0.9467.
- Análisis de dependencias sintácticas: UAS 0.8835 y LAS 0.8498.
- Reconocimiento de entidades nombradas (NER) para danés, con F-score 0.8325.
- Segmentación de oraciones: F-score 0.9483.
- No es un modelo generativo: no soporta generación de texto libre, tool calling, agentes ni razonamiento multi-step.

## Casos de uso

- Investigación lingüística sobre corpus daneses: permite enriquecer textos con anotaciones POS, morfológicas y de dependencias, fundamentales para estudios variacionistas, históricos o comparativos.
- Extracción de entidades nombradas en medios de comunicación: el componente NER puede identificar personas, organizaciones y lugares en artículos de prensa danesa, alimentando sistemas de monitorización de noticias.
- Preprocesamiento para recuperación de información: la lematización y el etiquetado POS mejoran la indexación y búsqueda en documentos daneses, especialmente en bases documentales o archivos digitales.
- Análisis de documentos legales: el parser de dependencias y la extracción de entidades ayudan a detectar partes implicadas, fechas o referencias normativas en contratos o resoluciones danesas.
- Asistencia a la corrección gramatical y revisión de textos: las etiquetas POS y morfológicas permiten detectar concordancias incorrectas, tiempos verbales erróneos o errores de lematización en herramientas de apoyo a la escritura.
- Minería de opiniones y reseñas: combinando el análisis de dependencias con el etiquetado POS se pueden extraer aspectos evaluados y sus atributos en reseñas de productos o servicios en danés.
- Integración en sistemas de enseñanza de danés: la disponibilidad de anotaciones morfológicas y sintácticas facilita la creación de ejercicios automáticos y la tutorización mediante análisis de la producción escrita del alumnado.

## Benchmarks y rendimiento

Los resultados presentados a continuación provienen del model-index declarado por el autor en la model card oficial. No son verificados de forma independiente.

| Tarea | Métrica | Valor |
|---|---|---|
| NER | Precisión | 0.8202 |
| NER | Recall | 0.8452 |
| NER | F-score | 0.8325 |
| TAG (XPOS) | Accuracy | 0.9814 |
| POS (UPOS) | Accuracy | 0.9808 |
| Morph (UFeats) | Accuracy | 0.9768 |
| Lemma | Accuracy | 0.9467 |
| Dependencias sin etiquetas | UAS | 0.8835 |
| Dependencias con etiquetas | LAS | 0.8498 |
| Sentencias | F-score | 0.9483 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.1 GB, por lo que se espera un consumo moderado, pero no hay datos oficiales.
- GPU recomendada: no disponible. Al ser un pipeline basado en Electra-small, es plausible que funcione en GPUs modestas como T4 o RTX 2060, aunque no se confirma.
- Soporte en CPU: sí, el pipeline de spaCy puede ejecutarse en CPU para carga de trabajo moderada, aunque la latencia será mayor.
- Opciones de despliegue: se usa como pipeline de spaCy mediante `spacy.load()`. No es compatible con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje generativo sino un pipeline de análisis lingüístico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

no disponible.

## Limitaciones y advertencias

- El modelo solo soporta danés; no es aplicable a otros idiomas sin reentrenamiento.
- Al ser un pipeline de análisis y no un modelo generativo, no existe riesgo de alucinación en el sentido de generación de texto, pero sí puede producir errores de etiquetado o de segmentación en textos no representativos del dominio de entrenamiento.
- Los datos de entrenamiento (DaNE y UD Danish DDT) pueden introducir sesgos asociados al dominio periodístico y académico, lo que podría afectar a textos de dominio conversacional, dialectal o muy técnico.
- No se han reportado evaluaciones de sesgo específicas en la información disponible, aunque DaCy incluye herramientas para realizar pruebas de sesgo y robustez.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base `Electra-small-nordic` si se despliega en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johanamayer/dacy_small
- Repositorio DaCy: https://github.com/centre-for-humanities-computing/DaCy
- Dataset DaNE: https://huggingface.co/datasets/alexandrainst/dane
- UD Danish DDT: https://github.com/UniversalDependencies/UD_Danish-DDT
- Electra-small-nordic: https://huggingface.co/jonfd/electra-small-nordic
