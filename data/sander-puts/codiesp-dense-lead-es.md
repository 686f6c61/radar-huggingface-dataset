# sander-puts/codiesp-dense-lead-es

## Resumen

codiesp-dense-lead-es es un modelo de etiquetado de tokens (token classification) para castellano especializado en la detección de términos guía (lead terms) que un codificador clínico consultaría en el índice alfabético de la CIE-10. Lo desarrolla sander-puts como componente del sistema CEI-Trace, un proyecto que codifica texto clínico con los libros oficiales de la CIE-10 mediante modelos de lenguaje locales. El modelo parte del encoder PlanTL-GOB-ES/roberta-base-biomedical-clinical-es y añade una cabeza de clasificación de tokens entrenada sobre los textos del corpus CodiEsp.

La particularidad del modelo es que no se limita a reproducir las anotaciones originales de CodiEsp: se entrenó con etiquetas densas que incluyen tanto los lead terms trazados desde las anotaciones (completados en parte con un modelo comercial en la nube, Claude) como palabras guía fuera de las anotaciones que un modelo de lenguaje local juzgó como condiciones clínicas mediante una pregunta y una cita verificada. Por tanto, el objetivo de entrenamiento es en parte derivado de modelos y no constituye un censo validado.

Es relevante para pipelines de codificación clínica en castellano porque prioriza la exhaustividad (recall) sobre la precisión: en el conjunto de desarrollo encuentra el 0,915 de los lead terms anotados (0,908 con límites exactos), a costa de una precisión baja frente a las anotaciones. No está pensado para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base biomedical-clinical en castellano) con cabeza de token classification |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (castellano) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors; el autor menciona `heads.pt` y `encoder/` para la carga con `scripts/ner_predict.py` |

## Arquitectura y entrenamiento

El modelo es un encoder tipo RoBERTa inicializado desde PlanTL-GOB-ES/roberta-base-biomedical-clinical-es (licencia Apache-2.0) al que se añade una cabeza de etiquetado de tokens para detectar lead terms. El repositorio ocupa 0,5 GB y contiene los pesos del encoder y de la cabeza por separado.

El entrenamiento se realizó sobre los textos de entrenamiento de CodiEsp durante 10 épocas, con learning rate 3e-5, batch size 4 y semilla 2025. Las etiquetas de entrenamiento son densas: combinan los lead terms trazados a partir de las anotaciones de CodiEsp (parcialmente completados con el modelo comercial Claude) y palabras guía fuera de las anotaciones que un modelo de lenguaje local clasificó como condición clínica mediante una pregunta con cita verificada. Esta construcción de etiquetas implica que el objetivo de entrenamiento es parcialmente sintético y no un censo validado. En desarrollo alcanza un recall de 0,915 sobre los lead terms anotados (0,908 con límites exactos), con precisión baja por diseño.

## Capacidades

- Detección de términos guía (lead terms) para consulta en el índice alfabético de la CIE-10 en texto clínico en castellano.
- Etiquetado de tokens a nivel de palabra con detección de límites (boundary detection) de los términos.
- Alta sensibilidad: recupera aproximadamente el 91,5 % de los lead terms anotados en el conjunto de desarrollo.
- Detección de términos candidatos más allá de las anotaciones originales de CodiEsp, gracias al entrenamiento con etiquetas densas.
- Integración en el pipeline CEI-Trace para codificación clínica con capas de guías y práctica de cada entorno.
- No soporta tool calling, function calling, agentes, visión ni audio: es un modelo de token classification.

## Casos de uso

- Preprocesado de codificación clínica: el modelo identifica los términos que un codificador humano debería buscar en el índice alfabético de la CIE-10, sirviendo como paso previo a la asignación de códigos en el pipeline CEI-Trace.
- Extracción de candidatos en informes de casos clínicos: dado el entrenamiento sobre CodiEsp (informes de casos publicados), es adecuado para procesar este tipo de texto y señalar condiciones clínicas candidatas.
- Construcción de índices de búsqueda sobre historiales: los lead terms detectados pueden alimentar un índice de recuperación que enlace fragmentos de texto con entradas del índice alfabético.
- Anotación asistida (human-in-the-loop): al tener recall alto y precisión baja por diseño, encaja como generador de candidatos que un codificador revisa y descarta, reduciendo el coste de anotación manual.
- Evaluación y auditoría de codificaciones: permite comprobar si un texto contiene términos guía que no se tradujeron en códigos asignados, señalando posibles omisiones.
- Investigación en NLP clínico en castellano: sirve como componente o línea base en experimentos de codificación CIE-10 y de reconocimiento de entidades clínicas con etiquetas densas.
- Integración en sistemas locales de codificación: al ser un encoder de tamaño base, puede ejecutarse en infraestructura local junto al resto de componentes de CEI-Trace.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Recall de lead terms anotados (dev) | 0,915 |
| Recall con límites exactos (dev) | 0,908 |
| Precisión frente a anotaciones (dev) | baja por diseño (sin cifra publicada) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifra publicada; por el tamaño del repositorio (0,5 GB) y el encoder base, la inferencia en fp32 requiere del orden de unos pocos GB de VRAM, aunque el dato exacto no está confirmado.
- GPU recomendadas: no disponible; cualquier GPU con suficiente memoria para un encoder base debería ser suficiente.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas consumer con varios GB de VRAM, aunque no hay confirmación en la información disponible.
- Opciones de despliegue: carga mediante `transformers` y el script `scripts/ner_predict.py` del repositorio CEI-Trace; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| sander-puts/codiesp-dense-lead-es | Token classification (lead terms CIE-10) | es | no disponible | cc-by-4.0 | Recall 0,915 en dev; precisión baja por diseño |
| PlanTL-GOB-ES/roberta-base-biomedical-clinical-es | Encoder biomedical (modelo base) | es | no disponible | Apache-2.0 | Base del modelo; sin cabeza de lead terms |
| Otros modelos de codificación CIE-10 en castellano | no disponible | es | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- No apto para uso clínico: el propio autor lo declara explícitamente.
- Las etiquetas de entrenamiento son parcialmente derivadas de modelos (Claude y un modelo de lenguaje local) y no constituyen un censo validado; el comportamiento puede heredar sesgos de esos modelos.
- Precisión baja por diseño: el modelo prioriza recall y genera falsos positivos que deben filtrarse en producción.
- Solo castellano; no se documenta soporte multilingüe.
- Entrenado sobre informes de casos clínicos publicados (CodiEsp); el rendimiento puede degradarse en otros géneros textuales (historiales electrónicos, notas de urgencias, etc.).
- Licencia CC BY 4.0: permite uso comercial con atribución, pero debe verificarse el cumplimiento de las condiciones de atribución y de los datos de origen CodiEsp.
- Requiere el script de carga del repositorio CEI-Trace (`scripts/ner_predict.py`); no se documenta un uso estándar directo con `pipeline` de transformers.
- Sin datos publicados de benchmarks estándar, latencia ni requisitos exactos de hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sander-puts/codiesp-dense-lead-es
- Repositorio CEI-Trace: https://github.com/putssander/CEI-Trace
- Modelo base: https://huggingface.co/PlanTL-GOB-ES/roberta-base-biomedical-clinical-es
- Corpus CodiEsp (Miranda-Escalada et al., CLEF eHealth 2020): https://doi.org/10.5281/zenodo.3837305
- Artículo: Puts S., *CEI-Trace: fitting ICD-10 coding to a setting's guidelines and practice in layers around one official core* (2026)
