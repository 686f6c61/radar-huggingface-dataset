# JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed3407

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed3407` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz como parte de una matriz de investigación denominada `ner-pt-generative-2026-f1-v1`. Se basa en el modelo Qwen/Qwen3.5-2B (revisión concreta `15852e8c16360a2fea060d615a32b45270f8a8fc`) y está entrenado específicamente sobre el corpus paramopama. El adaptador pesa aproximadamente 0,1 GB y se distribuye en formato safetensors con la librería PEFT.

Su relevancia radica en que combina generación de texto con salida estructurada JSON restringida (etiquetas y tokens), lo que permite una extracción de entidades con alta validez estructural (0,9988) y un F1 end-to-end de 0,8971 en el conjunto de prueba del corpus paramopama. Es un artefacto de investigación orientado a evaluación y experimentación controlada, no a despliegue en producción sin validación adicional. No se dispone de información sobre la licencia ni sobre la longitud de contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-2B (transformer decoder) |
| Parametros totales | no disponible (el adaptador ocupa ~0,1 GB; los del modelo base no se indican) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en BF16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo generativo Qwen3.5-2B, entrenado en precisión BF16. El régimen de entrenamiento se denomina `specific`, lo que indica que se ajustó específicamente para el corpus paramopama, con una semilla fija (3407). La selección del checkpoint se realizó mediante validación end-to-end F1 sobre el conjunto de validación, sin usar el conjunto de prueba durante la selección. La inferencia canónica se realiza con vLLM a temperatura 0 y con una salida JSON restringida al esquema `labels_and_tokens` (etiquetas y tokens), lo que garantiza una estructura sintáctica válida en las predicciones.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset (más allá de ser paramopama) ni sobre técnicas adicionales como RLHF o DPO. La política ante salidas inválidas es devolver una predicción vacía en la puntuación end-to-end.

## Capacidades

- Reconocimiento de entidades nombradas (NER) generativo en portugues, con salida estructurada en formato JSON (`labels_and_tokens`).
- Generacion de texto en portugues (capacidad heredada del modelo base Qwen3.5-2B).
- Alta validez estructural en las predicciones: 0,9988 en el corpus paramopama.
- Soporte de inferencia con vLLM a temperatura 0 para resultados deterministas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.
- El adaptador esta limitado al idioma portugues; no se indica soporte multilingue adicional.

## Casos de uso

- Extraccion de entidades en textos juridicos portugueses: el modelo puede identificar organizaciones, personas, fechas y otros tipos de entidades en documentos legales, generando una salida JSON estructurada que facilita su integracion en sistemas de gestion documental.
- Procesamiento de noticias y articulos periodisticos: permite extraer entidades (lugares, personas, eventos) de forma automatica para alimentar bases de datos de noticias o sistemas de recomendacion.
- Analisis de redes sociales en portugues: el adaptador puede procesar comentarios o publicaciones para extraer menciones a marcas, productos o personas, siempre que el dominio se ajuste al corpus de entrenamiento.
- Construccion de datasets etiquetados: dado su caracter de investigacion, puede usarse para generar anotaciones preliminares en nuevos corpus portugueses, aunque requiere revision manual.
- Evaluacion comparativa de tecnicas de NER generativo: el modelo sirve como referencia reproducible (con semilla fija y protocolo documentado) para comparar enfoques de NER basados en generacion frente a metodos clasicos de clasificacion de tokens.
- Experimentacion en entornos academicos: investigadores pueden estudiar el comportamiento de adaptadores LoRA sobre modelos generativos para tareas de extraccion de informacion, usando los artefactos reproducibles incluidos en el repositorio (predicciones congeladas, metricas, manifiesto).

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de prueba del corpus paramopama (division congelada, semilla 3407):

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| paramopama | 0,8963 | 0,8978 | 0,8971 | 0,9988 |

No se han publicado comparaciones con otros modelos de NER en portugues ni con alternativas generativas. El autor advierte que estos resultados corresponden a una unica semilla y a divisiones congeladas especificas; no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.

## Requisitos de hardware

- El adaptador LoRA ocupa ~0,1 GB, pero requiere cargar el modelo base Qwen3.5-2B (aproximadamente 2.000 millones de parametros). En BF16, el modelo base ocupa unos 4-5 GB de VRAM; con cuantizacion (por ejemplo, 4 bits) podria reducirse a ~1,5-2 GB.
- Es viable en GPUs de consumo como RTX 3060 (12 GB) o superiores, y en GPUs profesionales como A100 o H100 para mayor throughput.
- La inferencia canonica se realiza con vLLM, que requiere una GPU con suficiente VRAM para el modelo base y el adaptador. Tambien puede usarse con PEFT en frameworks como Transformers.
- No se disponen datos de latencia o throughput especificos para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de NER en portugues (por ejemplo, XLM-R, BERTimbau o adaptadores generativos alternativos). El autor no proporciona benchmarks contra otras arquitecturas. Por tanto, no se puede establecer una comparativa objetiva en este momento.

## Limitaciones y advertencias

- Sesgos: no se ha evaluado el modelo frente a sesgos de genero, raza o socioeconomicos; el corpus paramopama puede contener sesgos inherentes.
- Riesgo de alucinacion: los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos; la validez estructural alta no implica precision semantica.
- Limitaciones de contexto e idioma: el adaptador esta entrenado exclusivamente para portugues y sobre un corpus especifico; su rendimiento fuera de ese dominio no esta garantizado.
- Licencia: no disponible; el autor recomienda revisar las licencias del dataset y del modelo base antes de cualquier uso comercial.
- Restricciones de produccion: el modelo no ha sido validado para decisiones de alto riesgo ni para uso autonomo; debe emplearse solo en investigacion, evaluacion y experimentacion controlada.
- Reproducibilidad: requiere cargar el adaptador sobre la revision exacta del modelo base indicada y seguir el protocolo documentado (vLLM, temperatura 0, JSON restringido).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed3407
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
