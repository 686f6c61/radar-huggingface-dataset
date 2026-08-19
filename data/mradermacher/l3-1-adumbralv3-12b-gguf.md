# mradermacher/L3.1-Adumbralv3-12B-GGUF

## Resumen

El modelo `mradermacher/L3.1-Adumbralv3-12B-GGUF` es una colección de archivos GGUF cuantizados del modelo base `kromcomp/L3.1-Adumbralv3-12B`, un modelo de lenguaje de aproximadamente 12 000 millones de parámetros creado mediante fusión (merge) con la herramienta mergekit. La cuantización ha sido realizada por mradermacher, un usuario de Hugging Face conocido por publicar versiones optimizadas de modelos open source. Este repositorio está pensado para facilitar la ejecución local del modelo en hardware de consumo, ofreciendo múltiples niveles de cuantización que permiten ajustar el equilibrio entre calidad y requisitos de memoria.

El modelo base pertenece a la familia Llama 3.1 (por el prefijo "L3.1"), aunque no se dispone de información detallada sobre los componentes exactos del merge ni sobre el proceso de entrenamiento. La relevancia de esta publicación radica en que proporciona acceso práctico a un modelo de 12B con formato GGUF, compatible con motores de inferencia como llama.cpp, Ollama o LM Studio, sin necesidad de GPU de gama alta. Sin embargo, la falta de documentación sobre el modelo original y la ausencia de benchmarks limitan la evaluación objetiva de sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder-only, basada en Llama 3.1) |
| Parametros totales | 11 956 301 888 (~12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información oficial sobre la arquitectura interna del modelo base `kromcomp/L3.1-Adumbralv3-12B`. Por el nombre y el tamaño, se infiere que se trata de un transformer decoder-only similar a los modelos Llama 3.1, pero no hay confirmación. La etiqueta `mergekit` en el repositorio indica que el modelo fue creado mediante la fusión de varios modelos preentrenados, un proceso que combina pesos de diferentes fuentes para obtener un modelo con capacidades mixtas. No se especifican los modelos originales, el método de fusión (por ejemplo, SLERP, TIES, DARE) ni los datos de entrenamiento.

La cuantización a GGUF realizada por mradermacher es un proceso post-entrenamiento que reduce la precisión de los pesos (por ejemplo, de FP16 a 4 bits) para disminuir el tamaño del archivo y acelerar la inferencia en CPU o GPU con memoria limitada. Se ofrecen múltiples niveles de cuantización, desde Q2_K (4.7 GB) hasta Q8_0 (12.8 GB), lo que permite al usuario elegir según su hardware. No hay información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés: al ser un modelo de lenguaje de 12B, se espera que pueda producir texto coherente y contextual en inglés, aunque no hay pruebas publicadas que lo confirmen.
- Conversación: la etiqueta `conversational` sugiere que el modelo está orientado a tareas de diálogo y chat.
- Razonamiento y conocimiento general: no se dispone de datos concretos, pero por su tamaño podría manejar tareas básicas de razonamiento y responder preguntas factuales.
- No se ha documentado soporte para tool calling, agentes, visión, audio ni modos de pensamiento extendido.
- Capacidades multilingües: limitadas al inglés, según la etiqueta `language: en`.

## Casos de uso

- Chat local en inglés: el modelo puede desplegarse en una aplicación de chat privada usando Ollama o llama.cpp, aprovechando las cuantizaciones pequeñas (Q4_K_M, 7.4 GB) para funcionar en GPUs de 8 GB o incluso en CPU.
- Prototipado de asistentes conversacionales: por su formato GGUF, es fácil integrarlo en entornos de desarrollo para probar respuestas generativas antes de migrar a modelos más grandes.
- Generación de texto creativo: redacción de correos, artículos o guiones en inglés, con la ventaja de ejecutarse sin conexión a internet.
- Análisis de texto básico: resumen, extracción de entidades o clasificación de sentimiento en inglés, aunque sin garantías de precisión por falta de benchmarks.
- Educación e investigación: sirve como ejemplo de modelo cuantizado para estudiar el impacto de la cuantización en la calidad de salida, comparando diferentes niveles (Q2_K vs Q8_0).
- Despliegue en entornos con restricciones de hardware: las cuantizaciones Q2_K (4.7 GB) y Q3_K_S (5.5 GB) permiten ejecutar el modelo en dispositivos con poca VRAM, como portátiles con GPU integrada o Raspberry Pi (con limitaciones de velocidad).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, y no se encontraron referencias externas al respecto.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (7.4 GB) se necesitan al menos 8 GB de VRAM; para Q8_0 (12.8 GB) se requieren 14 GB o más. Las cuantizaciones Q2_K (4.7 GB) y Q3_K_S (5.5 GB) caben en GPUs de 6 GB.
- GPU recomendadas: RTX 3060 12 GB para Q4_K_M, RTX 4090 24 GB para Q8_0, o GPUs de datacenter como A100 para ejecución con contexto largo (aunque no se conoce la longitud de contexto máxima).
- En consumer GPU: sí, la mayoría de las cuantizaciones caben en GPUs de consumo con 8-16 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend llama.cpp), o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponibles. Dependen del hardware y la cuantización; en una RTX 4090 con Q4_K_M se podría esperar una velocidad de 30-60 tokens/s, pero es una estimación sin datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. El modelo base `kromcomp/L3.1-Adumbralv3-12B` no tiene documentación pública, y no se conocen sus componentes de fusión ni su rendimiento. Alternativas genéricas de tamaño similar (12B) podrían ser Mistral 7B o Llama 3.1 8B, pero no son directamente comparables en arquitectura ni en resultados. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Falta de documentación: el modelo base no tiene model card detallada, por lo que se desconocen sesgos, limitaciones de contexto y comportamiento esperado.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente sin ajuste fino específico.
- Idioma limitado: solo se declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- Licencia no especificada: no se indica la licencia del modelo base ni de las cuantizaciones, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar al autor original antes de desplegar en producción.
- Sin garantía de calidad: al ser un merge sin evaluación, el modelo puede producir salidas incoherentes o de baja calidad en ciertas tareas.
- Tamaño del repositorio: 82.4 GB en total, lo que puede suponer un coste de descarga elevado si se quieren todas las cuantizaciones; es recomendable descargar solo el archivo necesario.
- Fecha de creación futura: el repositorio indica una fecha de creación en 2026, lo que podría ser un error de metadatos o una publicación programada; no afecta al contenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/L3.1-Adumbralv3-12B-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/kromcomp/L3.1-Adumbralv3-12B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/L3.1-Adumbralv3-12B-i1-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model
- Perfil de mradermacher: https://huggingface.co/mradermacher
