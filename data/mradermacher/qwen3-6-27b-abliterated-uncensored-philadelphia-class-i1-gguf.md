# mradermacher/Qwen3.6-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una **recuantización en GGUF** del modelo `PhillyLabs/Qwen3.6-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS`, publicada por el cuantizador habitual de la comunidad mradermacher. Se trata de un derivado de la familia Qwen3.6 con 26.895.998.464 parámetros (~26,9 B) según los safetensors del modelo base, sometido a un proceso de *abliteration* (modificación de los pesos orientada a reducir la tasa de rechazos) y convertido a formato GGUF con cuantización ponderada mediante fichero imatrix (`i1`).

El interés práctico del repositorio es que permite ejecutar un modelo multimodal de ~27 B en hardware de consumo mediante llama.cpp y derivados, con 24 niveles de cuantización que van desde los 7,2 GB del `i1-IQ1_S` hasta formatos de mayor calidad. Frente al repositorio estático del mismo autor, esta versión `i1` emplea cuantización ponderada por importancia (imatrix), que en la práctica suele conservar mejor la perplejidad a igual tamaño de fichero.

Conviene ser explícito sobre el alcance: la model card no documenta arquitectura interna, número de tokens de entrenamiento, composición del dataset ni resultados de benchmarks. La información verificable se limita a parámetros, licencia, idiomas, modalidades (texto e imagen) y a la lista de cuantizaciones con sus tamaños. Todo lo demás se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Familia Qwen3.6; modalidad image-text-to-text (multimodal). La model card no detalla si es transformer denso, MoE o híbrido |
| Parametros totales | 26.895.998.464 (~26,9 B), dato real de safetensors del modelo base |
| Parametros activos | No aplica / no disponible (no se especifica configuración MoE) |
| Longitud de contexto | No disponible en la model card. Un listado de terceros (Featherless) indica 32K de contexto para el modelo base; sin confirmación oficial |
| Tipos de cuantizacion | i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, IQ4_NL (small); la lista de la model card aparece truncada, con Q5_K_S, Q5_K_M y Q6_K referenciados |
| Idiomas soportados | Multilingüe (sin lista de idiomas ni evaluación por idioma) |
| Licencia | apache-2.0 (según la model card del repositorio y del modelo base) |
| Formato de pesos | GGUF (cuantizado, i1-imatrix) en este repositorio; safetensors en bfloat16 en el modelo base |
| Tamano del repositorio | 300,3 GB (incluye todas las cuantizaciones) |
| Fichero imatrix | `Qwen3.6-27B-...imatrix.gguf`, 0,1 GB, para generar cuantizaciones propias |
| Descargas / likes | 2.000 descargas, 5 likes (en el momento de la consulta) |
| Fechas | Creado el 2026-08-02; actualizado el 2026-10-24 |

Tamaños de las cuantizaciones publicadas (según la tabla de la model card, ordenada por tamaño):

| Tipo | Tamano (GB) | Nota del autor |
|---|---|---|
| i1-IQ1_S | 7,2 | "for the desperate" |
| i1-IQ1_M | 7,7 | "mostly desperate" |
| i1-IQ2_XXS | 8,5 | |
| i1-IQ2_XS | 9,2 | |
| i1-IQ2_S | 9,5 | |
| i1-IQ2_M | 10,1 | |
| i1-Q2_K_S | 10,3 | calidad muy baja |
| i1-Q2_K | 10,8 | IQ3_XXS probablemente mejor |
| i1-IQ3_XXS | 11,3 | calidad baja |
| i1-IQ3_XS | 12,1 | |
| i1-Q3_K_S | 12,2 | IQ3_XS probablemente mejor |
| i1-IQ3_S | 12,5 | "beats Q3_K*" |
| i1-IQ3_M | 12,7 | |
| i1-Q3_K_M | 13,4 | IQ3_S probablemente mejor |
| i1-Q3_K_L | 14,4 | IQ3_M probablemente mejor |
| i1-IQ4_XS | 15,2 | |
| i1-Q4_0 | 15,6 | rápido, calidad baja |
| Resto (Q4_1, IQ4_NL, Q5_K_S, Q5_K_M, Q6_K) | No disponible (tabla truncada en la información recibida) | |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna en la documentación disponible. El nombre del modelo base indica pertenencia a la familia Qwen3.6 y las etiquetas confirman que se trata de un modelo multimodal de tipo image-text-to-text, convertible a GGUF con soporte de ficheros `mmproj` para la torre de visión. El recuento de 26,9 B de parámetros totales y la ausencia de cualquier mención a expertos o parámetros activos apuntan a un modelo denso, pero esto es una inferencia, no un dato confirmado.

Tampoco se documentan los datos de entrenamiento: ni volumen de tokens, ni composición del corpus, ni si hubo fases de RLHF, DPO o ajuste con preferencias. Respecto al *abliteration*, la model card únicamente lo declara mediante etiquetas (`abliterated`, `uncensored`, `refusal-reduction`), sin especificar la metodología exacta (dirección de rechazo identificada, capas intervenidas, magnitud de la proyección ni evaluación de la degradación resultante). El autor de la cuantización aporta valor técnico en un punto concreto: el uso de un fichero imatrix generado a partir de un corpus de calibración, que se aplica de forma ponderada durante la cuantización para preservar mejor las capas sensibles.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el modelo.
- Procesamiento de imagen y texto (`image-text-to-text`): el modelo base es multimodal y el repositorio enlaza a ficheros `mmproj` alojados en el repositorio estático del mismo autor.
- Capacidad multilingüe declarada, sin desglose de idiomas ni métricas por lengua.
- Reducción de rechazos por *abliteration*: el modelo está diseñado explícitamente para disminuir la tasa de respuestas denegadas.
- Ejecución local en CPU, GPU o mixta gracias al formato GGUF, con 24 variantes de cuantización.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas), es decir, despliegue tras APIs compatibles con OpenAI a través de proveedores de terceros.
- No confirmado: soporte de tool calling / function calling, modo de razonamiento explícito (thinking), capacidades de audio, ni ventana de contexto efectiva. La model card no los menciona.

## Casos de uso

- **Investigación sobre alineación y *abliteration***: comparar cualitativamente las respuestas del modelo abliterado frente al modelo base sin modificar permite estudiar qué comportamientos se ven afectados por la intervención en los pesos, con la ventaja de disponer de la misma tokenizadora y el mismo prompt de entrada.
- **Red teaming y evaluación de seguridad**: el modelo sirve como sujeto de prueba para baterías de prompts adversarios en un entorno controlado, verificando si las salvaguardas se han degradado y en qué categorías, antes de decidir si un derivado de este tipo es aceptable en un producto.
- **Generación creativa sin filtros en local**: escritura de ficción, guiones o narrativa con temáticas adultas o violentas que los modelos alineados suelen rechazar, ejecutando la inferencia en hardware propio para no depender de APIs externas.
- **Asistencia local con privacidad sobre documentos e imágenes**: al ser multimodal y ejecutable con llama.cpp, permite describir capturas, extraer información de figuras o resumir documentos escaneados sin enviar los datos a un servicio en la nube; la cuantización IQ4_XS (15,2 GB) entra en una GPU de 24 GB.
- **Prototipado rápido en estaciones de trabajo modestas**: con las variantes IQ2/IQ3 (8,5-12,7 GB) el modelo se puede ejecutar en tarjetas de 12-16 GB o en CPU con RAM suficiente, lo que permite validar prompts y flujos antes de escalar a una GPU mayor.
- **Base para *fine-tuning* experimental**: el repositorio incluye el fichero imatrix y el modelo base en safetensors/bfloat16, de modo que un equipo puede recuantizar con su propio corpus de calibración o partir del base para un ajuste supervisado orientado a un dominio concreto.
- **Generación de datos sintéticos en dominios sensibles**: útil en la construcción de datasets de moderación de contenido o de detección de material dañino, donde se necesitan ejemplos que un modelo alineado se negaría a producir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni la del modelo base incluyen MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica. Tampoco hay comparación de perplejidad entre las distintas cuantizaciones, más allá de los comentarios cualitativos del autor sobre qué formato es preferible a igual tamaño.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente el tamaño del fichero GGUF más el contexto y el búfer de cómputo. Con 8K de contexto, un margen razonable es de 1-3 GB adicionales sobre el tamaño del fichero, dependiendo de la implementación y del tamaño de lote.
  - i1-IQ2_M (10,1 GB) → ~11-13 GB de VRAM.
  - i1-IQ3_M (12,7 GB) → ~14-16 GB de VRAM.
  - i1-IQ4_XS (15,2 GB) → ~17-18 GB de VRAM.
  - i1-Q6_K (tamaño no disponible en el extracto) → previsiblemente por encima de 21 GB, solo en GPUs de 24 GB o más.
- **GPU recomendadas**: A100 40/80 GB o H100 para servir el modelo con contexto largo y varios usuarios concurrentes; RTX 4090 y RTX 3090 (24 GB) para las cuantizaciones IQ4_XS y superiores en uso individual; RTX 4080 y RTX 4060 Ti de 16 GB para IQ3; RTX 3060 de 12 GB solo con IQ2.
- **¿Cabe en GPU de consumo?** Sí, en todas las variantes hasta IQ4_XS con 24 GB, y hasta IQ3_M con 16 GB. Las variantes IQ1 e IQ2 (7,2-10,1 GB) permiten incluso configuraciones híbridas CPU+GPU con 8 GB de VRAM.
- **Modelo multimodal**: para procesar imágenes hay que cargar además el fichero `mmproj` del repositorio estático; requiere un runtime con soporte de proyección visual (llama.cpp con `--mmproj`). El tamaño exacto del `mmproj` no está disponible en la información recibida.
- **Opciones de despliegue**: llama.cpp, Ollama (importando el GGUF con un Modelfile), LM Studio, koboldcpp y text-generation-webui. vLLM y TGI tienen soporte de GGUF limitado o experimental; para producción a gran escala lo habitual es partir del modelo base en safetensors. El propio autor remite a las instrucciones de los README de TheBloke para el uso y concatenación de ficheros multiparte.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| `mradermacher/Qwen3.6-27B-...-i1-GGUF` (este) | ~26,9 B | No disponible (32K según listado de terceros) | Texto + imagen | apache-2.0 | GGUF i1-imatrix | Sin benchmarks publicados |
| `mradermacher/Qwen3.6-27B-...-GGUF` (estático) | ~26,9 B | Igual que el base | Texto + imagen | apache-2.0 | GGUF estático | Sin benchmarks publicados; el autor considera preferibles las variantes i1 a igual tamaño |
| `PhillyLabs/Qwen3.6-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS` (base) | ~26,9 B | No disponible | Texto + imagen | apache-2.0 | safetensors bfloat16 | Sin benchmarks publicados; calidad de referencia frente a las cuantizaciones |
| Alternativas de la misma categoría (p. ej. otros modelos abliterados de ~27-32 B de la familia Qwen3) | No disponible en la información recibida | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante aquí es interna al propio ecosistema del modelo: el repositorio `i1` frente al estático y frente al base en bfloat16. Para alternativas externas no se dispone de datos verificables en la información proporcionada, por lo que no se ofrece una comparación numérica que podría inducir a error.

## Limitaciones y advertencias

- **Alineación de seguridad eliminada deliberadamente**: el proceso de *abliteration* reduce los rechazos, pero no garantiza que el modelo sea seguro. Puede producir contenido violento, sexual explícito, instructivo para actividades dañinas o discurso de odio. No debe desplegarse de cara al público sin una capa de moderación externa.
- **Degradación por cuantización**: las variantes IQ1 e IQ2 (7,2-10,8 GB) están muy comprimidas y el propio autor las desaconseja ("for the desperate", "calidad muy baja", "calidad baja"). A 27 B de parámetros, por debajo de IQ3 se espera una pérdida notable de coherencia en razonamiento y código.
- **Riesgo de alucinación**: no hay evaluación publicada de fidelidad factual ni de calibración. Como en cualquier modelo de esta familia, se recomienda verificación externa en usos que requieran exactitud.
- **Contexto no confirmado**: la única referencia a 32K proviene de un listado de terceros. Si el despliegue requiere ventanas largas, hay que validar empíricamente el comportamiento más allá de los 8K antes de asumir la cifra.
- **Sesgos**: no documentados. Al no haber evaluación de sesgos ni de toxicidad, se desconoce si la intervención en los pesos ha alterado la distribución de respuestas en temas sensibles más allá de la reducción de rechazos.
- **Idiomas**: la etiqueta es "multilingual" sin lista ni métricas. El rendimiento en castellano es desconocido; no hay garantía de calidad equiparable al inglés.
- **Licencia y trazabilidad**: la model card declara apache-2.0, pero al ser un derivado abliterado de un modelo Qwen conviene verificar los términos del modelo base y de la cadena de derivaciones antes de un uso comercial. La licencia Apache-2.0 no exime de responsabilidad sobre el contenido generado.
- **Tamaño del repositorio**: 300,3 GB. Descargar el repositorio completo es poco práctico; hay que bajar únicamente el fichero de la cuantización deseada (y el `mmproj` desde el repositorio estático si se usa visión).
- **Madurez**: 5 likes y 2.000 descargas, sin issues ni discusión pública reseñable en la información disponible. No es un artefacto con validación comunitaria amplia.
- **Sin benchmarks**: cualquier afirmación sobre su calidad relativa frente a otros modelos carece de base documentada.

## Enlaces

- Repositorio HuggingFace de este modelo (GGUF i1-imatrix): https://huggingface.co/mradermacher/Qwen3.6-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye ficheros `mmproj` para visión): https://huggingface.co/mradermacher/Qwen3.6-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF
- Modelo base en safetensors/bfloat16: https://huggingface.co/PhillyLabs/Qwen3.6-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Qwen3.6-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF
- Ficha en AlphaNeural: https://app.alphaneural.io/models/mradermacher/Qwen3.6-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF
- Ficha en Essamamdani (directorio de modelos, menciona 27B y visión): https://essamamdani.com/ai-models/hf-mradermacher-qwen3-6-27b-abliterated-uncensored-philadelphia-class-gguf
- Despliegue vía API compatible OpenAI en Featherless (indica 32K de contexto): https://featherless.ai/models/KridgeDookie/Qwen3.6-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS
- README de referencia para el uso de GGUF citado por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
