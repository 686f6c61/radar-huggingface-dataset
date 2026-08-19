# aryand28/kathe2026-indictrans2-en-kas

## Resumen

Este repositorio contiene una redistribución del modelo `ai4bharat/indictrans2-en-indic-1B` de AI4Bharat, publicada por el usuario `aryand28` con el propósito de facilitar su uso en el shared task KATHE 2026 (AI Challenge for Kashmiri Language Translation). El modelo original es un sistema de traducción automática neuronal (NMT) multilingüe basado en transformer, entrenado para traducir entre inglés y las 22 lenguas programadas de la India, incluyendo el cachemiro (kas) en su escritura árabe (kas_Arab). Esta copia concreta se centra en la dirección inglés → cachemiro, y se distribuye bajo licencia MIT para que los participantes del desafío puedan cargarla sin necesidad de acceder al repositorio original, que está protegido por un gate de acceso.

El modelo tiene aproximadamente 1.115 millones de parámetros (1,1B) y se publica en formato safetensors. Es relevante porque el cachemiro es una lengua de bajos recursos con escasas herramientas de traducción de calidad, y este modelo representa una de las pocas opciones abiertas y accesibles para abordar esa carencia. Su uso requiere el toolkit `IndicTransToolkit` para el preprocesamiento y postprocesamiento, así como la activación de `trust_remote_code=True` en Hugging Face Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (modelo NMT multilingüe) |
| Parametros totales | 1.115.543.552 (1,1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors sin cuantización explícita) |
| Idiomas soportados | Inglés (en) y cachemiro (ks) en escritura árabe (kas_Arab) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una variante del sistema IndicTrans2 desarrollado por AI4Bharat, que emplea una arquitectura transformer estándar de encoder-decoder con aproximadamente 1.100 millones de parámetros. A diferencia de los grandes modelos de lenguaje generativos, este es un modelo de traducción supervisado entrenado específicamente para la tarea de conversión entre lenguas, sin etapas de RLHF ni DPO. El entrenamiento del modelo original se realizó sobre el conjunto de datos Samanantar y otros corpus paralelos multilingües, aunque los detalles exactos sobre el número de tokens y la composición del dataset no se especifican en la información disponible para esta redistribución. El modelo soporta múltiples escrituras para lenguas de bajos recursos como el cachemiro, el manipuri y el sindhi, pero esta copia concreta se ha configurado para la dirección inglés → cachemiro en escritura árabe (kas_Arab). Una innovación destacable del sistema IndicTrans2 es su capacidad para manejar transliteración y múltiples scripts dentro de un mismo modelo, lo que resulta crítico para lenguas con variantes ortográficas.

## Capacidades

- Traducción automática de inglés a cachemiro (kas_Arab) con calidad razonable para una lengua de bajos recursos.
- Manejo de múltiples scripts del cachemiro, aunque esta copia está fijada a la escritura árabe.
- Procesamiento de texto con preprocesamiento y postprocesamiento específicos mediante `IndicTransToolkit`.
- Soporte de inferencia por lotes (batch) y de una sola frase, tal como se muestra en los scripts de ejemplo.
- No incluye capacidades de tool calling, razonamiento multi-paso, generación de código ni otras funciones propias de los LLM generales; es exclusivamente un sistema de traducción.

## Casos de uso

- Traducción de documentos oficiales y administrativos al cachemiro: el modelo puede convertir textos legales, gubernamentales o educativos desde el inglés, facilitando el acceso a información pública en la lengua local.
- Localización de contenido web y aplicaciones móviles: permite adaptar interfaces, artículos o noticias al cachemiro, ampliando el alcance de productos digitales en la región de Cachemira.
- Asistencia en educación bilingüe: profesores y estudiantes pueden utilizar el modelo para traducir materiales didácticos, ejercicios o referencias del inglés al cachemiro, apoyando la enseñanza en contextos bilingües.
- Traducción de noticias y medios de comunicación: agencias de prensa o blogs pueden generar versiones en cachemiro de sus contenidos, aumentando la audiencia local.
- Comunicación gubernamental y servicios públicos: organismos pueden traducir avisos, formularios o campañas de concienciación al cachemiro, mejorando la inclusión lingüística.
- Investigación en PLN para lenguas de bajos recursos: el modelo sirve como punto de partida para experimentos de adaptación, fine-tuning o evaluación de técnicas de traducción en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta redistribución concreta en la información disponible. El modelo original IndicTrans2 reporta métricas BLEU y chrF en el artículo de Gala et al. (2023), pero esos datos no se incluyen en la model card ni en los resultados de búsqueda obtenidos. Por tanto, no es posible presentar una tabla comparativa fiable sin inventar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1,1B parámetros, en precisión FP16 ocupa aproximadamente 2,2 GB de memoria, mientras que en FP32 serían unos 4,4 GB. Con los buffers de activación y el pre/postprocesamiento, se recomienda al menos 4 GB de VRAM, siendo más seguro disponer de 8 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM, como una NVIDIA RTX 3060, RTX 4060, o superior. También puede ejecutarse en GPUs de datacenter como A100 o H100, aunque no es necesario para este tamaño.
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o una RTX 4070 de 12 GB son suficientes para inferencia en lote.
- Opciones de despliegue: el modelo está diseñado para usarse con Hugging Face Transformers y `IndicTransToolkit`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que su uso requiere el preprocesamiento específico del toolkit. Para despliegue en producción, se podría servir mediante una API con FastAPI o Triton, pero no hay documentación oficial al respecto.
- Latencia y throughput: no se proporcionan datos medidos. En una GPU moderna, se espera una latencia de decenas de milisegundos por frase corta, pero depende del hardware y del tamaño del lote.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otras alternativas. El modelo original IndicTrans2 tiene una versión destilada de 200M parámetros (`indictrans2-indic-en-dist-200M`) que ofrece un rendimiento inferior pero un menor coste computacional. Otros sistemas de traducción para cachemiro incluyen servicios propietarios como Google Translate, cuyos resultados no son comparables públicamente. La principal ventaja de este modelo es su licencia MIT y su disponibilidad abierta, lo que permite su uso comercial y su adaptación sin restricciones.

## Limitaciones y advertencias

- Es un modelo de traducción puro: no puede realizar tareas de generación de texto libre, razonamiento o diálogo. Intentar usarlo como un LLM general dará resultados incorrectos.
- El cachemiro es una lengua de bajos recursos, por lo que la calidad de traducción puede ser limitada en dominios técnicos, coloquiales o con vocabulario poco frecuente. Puede producir alucinaciones o traducciones literales incorrectas.
- El modelo requiere un preprocesamiento y postprocesamiento específicos mediante `IndicTransToolkit`; usarlo directamente sin ese paso degradará notablemente la calidad.
- Aunque la licencia es MIT, el modelo original de AI4Bharat puede tener políticas de uso adicionales; se recomienda revisar los términos del repositorio original antes de un despliegue comercial a gran escala.
- La ventana de contexto no está documentada; se asume que es limitada (típicamente 512 tokens en modelos de traducción), por lo que no es adecuado para traducir documentos muy largos de una sola vez; habrá que segmentar el texto.
- No se han publicado evaluaciones de sesgos o robustez para esta copia específica, aunque es probable que herede los sesgos del modelo original, como la preferencia por variedades estándar del cachemiro sobre dialectos regionales.

## Enlaces

- Repositorio de Hugging Face: [aryand28/kathe2026-indictrans2-en-kas](https://huggingface.co/aryand28/kathe2026-indictrans2-en-kas)
- Modelo original de AI4Bharat: [ai4bharat/indictrans2-en-indic-1B](https://huggingface.co/ai4bharat/indictrans2-en-indic-1B)
- GitHub de IndicTrans2: [AI4Bharat/IndicTrans2](https://github.com/ai4bharat/IndicTrans2)
- Competición KATHE 2026 en Kaggle: [KATHE 2026](https://www.kaggle.com/competitions/kathe-2026)
- Paper de referencia: Gala et al. (2023), "IndicTrans2: Towards High-Quality and Accessible Machine Translation Models for all 22 Scheduled Indian Languages", Transactions on Machine Learning Research.
