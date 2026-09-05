# Avertry/Baptist-Christian-Bible-Expert-v2.0-12B-i1-GGUF

## Resumen

Baptist-Christian-Bible-Expert-v2.0-12B-i1-GGUF es una cuantización GGUF del modelo Baptist-Christian-Bible-Expert-v2.0-12B, desarrollado por sleepdeprived3 y cuantizado con matriz de importancia (i1) por mradermacher. El repositorio en HuggingFace está publicado bajo el usuario Avertry. Se trata de un modelo de lenguaje de aproximadamente 12.250 millones de parámetros, especializado en teología cristiana bautista, con un enfoque en la Biblia, la teología protestante y la formación en seminarios. El modelo solo soporta inglés y se distribuye bajo licencia Apache 2.0. Esta versión i1 ofrece múltiples cuantizaciones que permiten equilibrar tamaño y calidad para diferentes requisitos de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 12.247.782.400 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo base en los datos disponibles. Se sabe que utiliza la librería transformers y que es un modelo de lenguaje de 12B parámetros. El modelo base fue desarrollado por sleepdeprived3 y esta versión es una cuantización GGUF con matriz de importancia (i1). No se han facilitado datos sobre el corpus de entrenamiento, el número de tokens ni procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, especializado en teología cristiana bautista, Biblia, seminario y teología protestante.
- Capacidad de responder preguntas y mantener diálogos sobre temas religiosos desde una perspectiva bautista.
- No se ha documentado soporte de tool calling, visión, audio ni otras capacidades multimodales en la información disponible.

## Casos de uso

- Estudio bíblico personal: el modelo puede responder preguntas sobre pasajes concretos, ofrecer interpretaciones desde una perspectiva bautista y ayudar a contextualizar versículos. Es adecuado porque está especializado en teología cristiana y Biblia.
- Preparación de sermones: los pastores pueden generar borradores de sermones, ilustraciones y aplicaciones prácticas. El modelo conoce la doctrina bautista y puede estructurar contenidos homiléticos.
- Educación teológica: estudiantes de seminario pueden repasar conceptos de teología sistemática, historia de la iglesia y doctrinas bautistas. La especialización del modelo en seminary y SBC (Southern Baptist Convention) lo hace útil para este fin.
- Consejería pastoral: apoyo para reflexionar sobre pasajes relevantes en situaciones de consejería, siempre con supervisión humana. El modelo puede ofrecer referencias bíblicas y perspectivas teológicas.
- Contenido devocional: generación de devocionales diarios, guías de oración y material para grupos de estudio. El modelo está entrenado para lenguaje religioso y conversacional.
- Apoyo a la investigación teológica: asistencia para explorar temas como escatología, eclesiología o soteriología desde una perspectiva bautista, generando resúmenes y puntos de partida para el estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (basada en el tamaño del archivo GGUF, sin considerar overhead del contexto):
  - i1-Q4_K_S (7.2 GB): ~10-12 GB de VRAM.
  - i1-Q4_K_M (7.6 GB): ~10-12 GB de VRAM.
  - i1-Q5_K_M (8.8 GB): ~12-14 GB de VRAM.
  - i1-Q6_K (10.2 GB): ~14-16 GB de VRAM.
- GPU recomendadas: RTX 3060 12GB, RTX 4070 12GB, RTX 4080 16GB, RTX 4090 24GB, A100 40GB/80GB, H100.
- Es posible ejecutar en GPUs de consumo con 12 GB de VRAM utilizando las cuantizaciones i1-Q4_K_S o i1-Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Baptist-Christian-Bible-Expert-v2.0-12B (base) | 12.247.782.400 | no disponible | Apache 2.0 | safetensors |
| Baptist-Christian-Bible-Expert-v2.0-12B-i1-GGUF (este repo) | 12.247.782.400 | no disponible | Apache 2.0 | GGUF |
| Baptist-Christian-Bible-Expert-v2.0-12B-GGUF (static) | 12.247.782.400 | no disponible | Apache 2.0 | GGUF |

No se dispone de datos de rendimiento para comparar entre estas variantes.

## Limitaciones y advertencias

- Modelo especializado en una tradición religiosa concreta (bautista/protestante), lo que puede limitar su utilidad en contextos ecuménicos o interreligiosos.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación en citas bíblicas y referencias teológicas; es recomendable verificar las citas con fuentes primarias.
- No se han documentado sesgos específicos en la información disponible, pero al estar entrenado en una perspectiva teológica particular, puede reflejar sesgos doctrinales.
- La licencia Apache 2.0 permite uso comercial, pero el contenido religioso puede requerir consideraciones éticas adicionales.
- No se ha publicado información sobre la longitud de contexto, lo que impide conocer el número máximo de tokens que puede manejar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Avertry/Baptist-Christian-Bible-Expert-v2.0-12B-i1-GGUF
- Modelo base: https://huggingface.co/sleepdeprived3/Baptist-Christian-Bible-Expert-v2.0-12B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Baptist-Christian-Bible-Expert-v2.0-12B-GGUF
