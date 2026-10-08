# guan-wang/ESM-FineWeb-160M

## Resumen

ESM-FineWeb-160M es un punto de control de preentrenamiento publicado por el usuario guan-wang en Hugging Face, correspondiente a la familia OpenESM de modelos de lenguaje basados en energía (energy-based language model, EBM). Se trata de un export compatible con Hugging Face Transformers de un checkpoint entrenado sobre el corpus FineWeb, con arquitectura propia de OpenESM y código remoto, por lo que no debe confundirse con el `transformers.EsmModel` estándar ni con los modelos ESM de proteínas.

El modelo tiene 160.556.544 parámetros reales (según los pesos en safetensors), variante d12, con 12 bloques transformer, dimensión de embedding de 768, 6 cabezas de atención, vocabulario de 32.768 tokens y una longitud de contexto de 2.048 tokens. El pipeline declarado es `fill-mask`, lo que indica un uso previsto de modelado de lenguaje enmascarado, coherente con un checkpoint de preentrenamiento sin ajuste por instrucciones.

Su relevancia es fundamentalmente de investigación: es un ejemplo público de implementación EBM a escala reducida, con licencia sin definir, cero descargas y cero validaciones de la comunidad en el momento de la ficha, y sin resultados de evaluación publicados. Resulta útil para experimentar con arquitecturas basadas en energía, hacer fine-tuning sobre tareas discriminativas o extraer representaciones, pero no está listo para producción sin una evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Implementación personalizada de OpenESM (variante d12), modelo de lenguaje basado en energía; requiere código remoto |
| Parámetros totales | 160.556.544 (160,5 M), según pesos safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones publicadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | no disponible (el autor no declara idiomas; el corpus FineWeb es predominantemente en inglés) |
| Licencia | no disponible (la model card indica explícitamente que debe añadirse una licencia aplicable antes de publicar) |
| Formato de pesos | safetensors (`model*.safetensors`), configuración en `config.json` |
| Bloques transformer | 12 |
| Dimensión de embedding | 768 |
| Cabezas de atención | 6 |
| Tamaño de vocabulario | 32.768 |
| Tokenizador | Tokenizador ESM serializado (`tokenizer.pkl`, `tokenizer_config.json`) |
| Etapa de entrenamiento | Preentrenamiento (sin ajuste por instrucciones, RLHF ni DPO documentados) |
| Dataset de entrenamiento | FineWeb |
| Tamaño del repositorio | 0,6 GB |
| Librería | transformers (con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es una implementación personalizada de OpenESM, descrita por el autor como un modelo de lenguaje basado en energía con variante d12. La configuración exportada indica 12 bloques transformer, 768 dimensiones de embedding, 6 cabezas de atención, contexto de 2.048 tokens y vocabulario de 32.768 entradas. El repositorio incluye `modeling_esm.py` y `configuration_esm.py` como código remoto, además de una tabla de bytes por token (`token_bytes.pt`) empleada por las métricas internas de OpenESM. La formulación basada en energía implica que el modelo aprende una función de energía sobre secuencias en lugar de una distribución autoregresiva convencional, aunque la model card no detalla la función de pérdida ni el procedimiento de muestreo.

En cuanto al entrenamiento, solo se declara la etapa de preentrenamiento sobre FineWeb. Los metadatos del checkpoint original indican `ebm-fineweb-d12-7b`, con el fichero `periodic-s=step=6999-d12-ctx2048.ckpt`, es decir, 7.000 pasos registrados con contexto de 2.048. La etiqueta "7B" del nombre del checkpoint no coincide con los 160 M parámetros del repositorio y el autor no aclara su significado (podría referirse al volumen de tokens de entrenamiento), por lo que debe verificarse antes de citarla. La model card indica además que el número de tokens de entrenamiento se omite deliberadamente del nombre del repositorio y de los ficheros. No se documentan composición detallada del dataset, técnicas de alineación, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Modelado de lenguaje enmascarado: el pipeline declarado es `fill-mask`, por lo que la tarea principal es predecir tokens enmascarados en una secuencia.
- Puntuación basada en energía: al ser un EBM, puede emplearse para asignar una puntuación de compatibilidad o energía a secuencias completas, útil para ranking y filtrado.
- Extracción de representaciones: al ser un transformer de 12 capas y 768 dimensiones, puede proporcionar embeddings contextuales para tareas posteriores.
- Base para fine-tuning: admite ajuste supervisado en tareas discriminativas (clasificación, NER, análisis de sentimiento) mediante la cabeza correspondiente.
- Soporte de tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no está ajustado por instrucciones ni incluye modo de razonamiento.
- Capacidades multilingües: no disponibles; el autor no declara idiomas y el corpus FineWeb es mayoritariamente en inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; no se documenta ninguna modalidad adicional.

## Casos de uso

- Fine-tuning para clasificación de texto: partiendo del checkpoint preentrenado de 160 M parámetros, se puede añadir una cabeza de clasificación y ajustar sobre un corpus etiquetado para tareas como detección de spam o categorización temática; el tamaño reducido permite iterar en una única GPU consumer.
- Análisis de sentimiento y moderación de contenido: al ser una base de lenguaje enmascarado, sirve como extractor de características para clasificadores de polaridad o toxicidad, con la ventaja de un coste de inferencia muy bajo.
- Relleno de máscaras en herramientas de escritura asistida: el pipeline `fill-mask` permite sugerir palabras o frases faltantes en un texto, integrable en editores o correctores con contexto de hasta 2.048 tokens.
- Búsqueda semántica y deduplicación de corpus: los embeddings de 768 dimensiones pueden indexarse en un motor vectorial para recuperar documentos similares o detectar duplicados en grandes colecciones de texto.
- Puntuación de fluidez para curación de datasets: la naturaleza EBM del modelo permite puntuar secuencias y descartar aquellas con baja verosimilitud, un paso habitual en pipelines de limpieza de datos de preentrenamiento; la tabla `token_bytes.pt` aporta métricas normalizadas por bytes.
- Extracción de entidades nombradas (NER): con un ajuste ligero sobre la representación contextual, puede etiquetar personas, organizaciones y localizaciones en textos administrativos o periodísticos.
- Investigación en modelos basados en energía: sirve como banco de pruebas a pequeña escala para estudiar estimación de energía, muestreo y calibración sin requerir clústeres multi-GPU.
- Prototipado educativo y experimentación docente: sus 160 M parámetros permiten entrenar y evaluar variantes en portátiles o en CPU, algo inviable con modelos de miles de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, GLUE ni ninguna otra evaluación, y el repositorio registra cero descargas y cero valoraciones, por lo que tampoco existen evaluaciones de terceros. No se deben asumir capacidades de rendimiento sin una evaluación propia.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir de 160,5 M parámetros, sin contar activaciones ni caché): aproximadamente 0,64 GB en FP32, 0,32 GB en BF16/FP16, 0,16 GB en INT8 y 0,08 GB en INT4.
- VRAM realista en inferencia: por debajo de 1 GB en BF16 con lotes pequeños y contexto de 2.048 tokens, más el sobrecoste del runtime de PyTorch y del código remoto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funcionan sin problema tarjetas consumer como GTX 1650, RTX 3060, RTX 4060 o superiores. También cabe en CPU para inferencia puntual.
- GPU de datacenter (A100, H100): sobredimensionadas para este modelo salvo que se usen para ajuste fino con lotes grandes o para servir muchas réplicas en paralelo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se han publicado conversiones a GGUF ni soporte para llama.cpp, Ollama, vLLM o TGI; al tratarse de una arquitectura personalizada, estos motores requerirían portar el código de modelado.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia |
|---|---|---|---|---|
| ESM-FineWeb-160M | 160,5 M | 2.048 | EBM personalizado, pipeline `fill-mask` | no disponible |
| BERT-base-uncased | ~110 M | 512 | Encoder transformer, masked LM | Apache 2.0 |
| RoBERTa-base | ~125 M | 512 | Encoder transformer, masked LM | MIT |
| ModernBERT-base | ~149 M | 8.192 | Encoder transformer, masked LM | Apache 2.0 |

Nota: los datos de los modelos comparables proceden de la documentación pública de cada proyecto, no de la información proporcionada sobre ESM-FineWeb-160M. La comparación se limita a escala y configuración, ya que no existen resultados de benchmarks de ESM-FineWeb-160M que permitan contrastar calidad. Frente a las alternativas, su contexto de 2.048 tokens es superior al de BERT y RoBERTa, pero muy inferior al de ModernBERT; su licencia sin definir es el principal inconveniente frente a las licencias permisivas de los otros tres.

## Limitaciones y advertencias

- Licencia no definida: la model card pide añadir una licencia aplicable antes de publicar, por lo que no existe autorización explícita de uso comercial. Cualquier uso en producción conlleva riesgo legal.
- Ejecución de código remoto: cargar el modelo exige `trust_remote_code=True`, lo que implica ejecutar Python del repositorio. Debe auditarse `modeling_esm.py` antes de usarlo en entornos sensibles.
- Modelo base sin alinear: es un checkpoint de preentrenamiento, sin ajuste por instrucciones, sin plantilla de chat y sin mecanismos de seguridad. No es adecuado como asistente conversacional.
- Riesgo de alucinación: aunque la tarea principal es `fill-mask`, cualquier uso generativo derivado puede producir contenido incorrecto; además no hay datos de calibración de la función de energía.
- Idiomas: el autor no declara idiomas soportados. FineWeb es un corpus predominantemente en inglés, por lo que el rendimiento en castellano es desconocido y probablemente deficiente sin ajuste adicional.
- Límite de contexto: 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Ausencia total de evaluación: no hay benchmarks, ni descargas, ni valoraciones, ni validación independiente. No se puede afirmar nada sobre su calidad relativa.
- Ambigüedad en los metadatos: el checkpoint original se etiqueta como `d12-7b` mientras que el repositorio contiene 160 M parámetros; conviene verificar el significado de esa etiqueta antes de citar cifras de entrenamiento.
- Ecosistema limitado: sin conversiones GGUF ni soporte en motores de inferencia habituales, el despliegue eficiente requeriría trabajo adicional de integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guan-wang/ESM-FineWeb-160M
- Repositorio de código de OpenESM: https://github.com/datamllab/openesm
- Resultados de la búsqueda web: no se encontraron enlaces relevantes sobre el modelo. Las consultas devolvieron páginas no relacionadas (artículos sobre el ave guan, un restaurante en Montreal y entradas de diccionario), sin relación con este modelo de lenguaje.
