# hrm-labs/gemma-3-4b-it-qat-GGUF

## Resumen

hrm-labs/gemma-3-4b-it-qat-GGUF es una redistribución en formato GGUF del checkpoint oficial google/gemma-3-4b-it-qat, es decir, la variante de 4B de la familia Gemma 3 de Google DeepMind que ha pasado por un proceso de entrenamiento consciente de la cuantización (QAT, *quantization-aware training*). El modelo original resuelve el problema de desplegar un modelo instructivo multimodal en hardware modesto sin la pérdida de calidad habitual de una cuantización a posteriori: al entrenar con la cuantización en el bucle, los pesos resultantes mantienen un comportamiento muy cercano al del modelo en precisión completa incluso en 4 bits. Esta ficha describe el repositorio de hrm-labs, que empaqueta dichos pesos en ficheros GGUF para su uso con llama.cpp y derivados.

El repositorio ocupa 3,4 GB y declara 3.880.263.168 parámetros totales según los metadatos de safetensors. La model card es mínima: únicamente indica que el modelo base es google/gemma-3-4b-it-qat y recomienda ejecutarlo con `llama-server` (en concreto apuntando al repositorio ggml-org/gemma-3-4b-it-qat-GGUF). No se documentan en el repositorio la licencia, los idiomas soportados ni resultados de evaluación propios, por lo que buena parte de las especificaciones que aparecen a continuación proceden de la documentación pública del modelo base de Google y se marcan como tales.

Su relevancia actual es práctica: se trata de una de las vías más ligeras para ejecutar localmente un modelo instructivo con ventana de contexto larga, capacidades multilingües y entrada de imagen en una GPU de consumo o incluso en CPU, algo que interesa a quien necesita inferencia privada, sin dependencia de API y con un coste de memoria muy contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención por ventana deslizante intercalada con atención global, según el modelo base Gemma 3 (no detallado en el repositorio) |
| Parametros totales | 3.880.263.168 (dato de los metadatos del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens según la documentación del modelo base Gemma 3 4B; no confirmado en la model card de este repositorio |
| Tipos de cuantizacion | GGUF; los tipos concretos incluidos en el repositorio no están disponibles. El checkpoint base es QAT (entrenado para cuantización de 4 bits) |
| Idiomas soportados | no disponible en el repositorio; el modelo base Gemma 3 declara soporte para más de 140 idiomas |
| Licencia | no disponible en el repositorio; el modelo base se distribuye bajo los términos de uso de Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF; el modelo base se publica en safetensors |
| Modelo base | google/gemma-3-4b-it-qat |
| Fecha de creacion del repositorio | 2026-10-12 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre la arquitectura más allá de la referencia al modelo base. Según la documentación pública de Gemma 3, la variante de 4B es un transformer decoder-only con normalización RMSNorm, RoPE y atención con consultas agrupadas (GQA), que intercala capas de atención local con ventana deslizante de 1024 tokens y capas de atención global en una proporción de 5 a 1. Esa combinación es la que permite sostener una ventana de contexto de 128.000 tokens sin que el coste de la caché KV crezca de forma lineal con todo el contexto: solo las capas globales mantienen estado de longitud completa, mientras que las locales se limitan a su ventana. La variante de 4B de Gemma 3 es además multimodal, con entrada de imagen procesada por un codificador de visión y técnicas de recorte y reescalado (Pan & Scan) para adaptar resoluciones.

Respecto al entrenamiento, lo único verificable en la información disponible es que el checkpoint base ha pasado por QAT, un procedimiento en el que los pesos se cuantizan durante el propio entrenamiento o ajuste fino, de modo que el modelo aprende a operar bajo la restricción de precisión reducida. Esto se traduce en ficheros GGUF de 4 bits con una degradación menor que la de una cuantización aplicada a posteriori sobre un modelo entrenado en bf16. No hay datos disponibles en este repositorio sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni sobre el proceso exacto de cuantización aplicado para generar estos ficheros GGUF. Tampoco se documenta la herramienta o el script de conversión empleados, ni si se incluye el fichero de proyección multimodal (mmproj) necesario para el uso con imágenes.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte del rol de sistema según el formato de Gemma 3.
- Razonamiento de propósito general y resolución de problemas de dificultad media, con el límite propio de un modelo de ~4B parámetros.
- Generación y explicación de código en lenguajes habituales, y asistencia en tareas de depuración sencillas.
- Aritmética y matemáticas básicas y de nivel escolar; no es un modelo especializado en razonamiento matemático avanzado.
- Entrada de imagen (modelo multimodal en su versión base), siempre que el despliegue incluya el proyector de visión correspondiente.
- Soporte multilingüe amplio, según la documentación de Gemma 3 (más de 140 idiomas); la cobertura real por idioma no está cuantificada en este repositorio.
- Manejo de contexto largo (hasta 128.000 tokens en el modelo base), útil para resumir documentos extensos o mantener conversaciones prolongadas.
- Posible soporte de llamada a funciones y salida estructurada en la variante instructiva de Gemma 3, aunque no se documenta explícitamente en este repositorio.
- No se documenta en el repositorio un modo de razonamiento explícito (*thinking mode*), ni capacidades de audio o de generación de imágenes.

## Casos de uso

- Asistente conversacional local en el escritorio: con menos de 3 GB en cuantización de 4 bits, el modelo cabe en la memoria de una GPU de consumo o incluso funciona en CPU, permitiendo un asistente privado sin enviar datos a servicios externos.
- Resumen de documentación extensa: la ventana de 128.000 tokens del modelo base permite procesar manuales, informes o actas completas en una sola pasada, reduciendo la necesidad de trocear el texto y perder coherencia entre fragmentos.
- Clasificación y extracción de información en pipelines de datos: con salida estructurada se puede emplear para etiquetar tickets, extraer campos de correos o normalizar registros, aunque conviene validar el esquema de salida por el riesgo de alucinación en modelos pequeños.
- Atención al cliente automatizada en despliegues con recursos limitados: gestiona conversaciones multi-turno con contexto largo y en varios idiomas, y puede ejecutarse en una única GPU pequeña con throughput suficiente para cargas moderadas.
- Asistencia a la programación en entornos con restricciones de red: integrado en un editor mediante llama.cpp u Ollama, ofrece autocompletado, explicación de fragmentos y generación de pruebas sin depender de APIs externas.
- Procesamiento de documentos con imágenes, como facturas o capturas de pantalla, siempre que el despliegue incluya el proyector de visión y se validen las extracciones.
- Prototipado e investigación: al ser un checkpoint QAT, resulta útil para medir cuánta calidad se conserva en 4 bits y comparar contra cuantizaciones a posteriori del mismo modelo.
- Traducción y adaptación de contenido multilingüe en flujos internos, con revisión humana dado el tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de hrm-labs no incluye tabla de evaluaciones, y la búsqueda web realizada no ha devuelto fuentes técnicas relevantes (los resultados obtenidos corresponden a medios deportivos y no guardan relación con el modelo). No se deben extrapolar cifras del modelo base sin verificar el efecto de la cuantización concreta incluida en este repositorio.

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en el recuento de parámetros declarado (3.880.263.168) y en la configuración publicada del modelo base; no proceden de una medición sobre estos ficheros concretos.

- Pesos en bf16/f16 (referencia, no incluidos aquí): aproximadamente 7,8 GB.
- Pesos en cuantización de 8 bits: aproximadamente 4,1 GB.
- Pesos en cuantización de 4 bits: aproximadamente 2,3-2,6 GB, coherente con el tamaño de repo de 3,4 GB si este incluye varios ficheros.
- Caché KV a contexto completo: gracias a la atención por ventana deslizante, solo una fracción de las capas mantiene estado de longitud completa; la estimación ronda los 3-4 GB en f16 para 128.000 tokens y menos de la mitad con caché cuantizada. Con ventanas de 8.000-32.000 tokens el consumo se reduce de forma notable.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10). Para contexto muy largo o cuantización de 8 bits conviene partir de 16-24 GB (RTX 4090, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, en 4 bits entra con holgura en GPUs de 8 GB y con margen para contexto moderado; en CPU funciona con 4-6 GB de RAM libre.
- Opciones de despliegue: llama.cpp y llama-server (el método recomendado en la propia model card, con banderas `-c 0 -fa` para contexto completo y atención *flash*), Ollama, LM Studio, Jan y otros clientes compatibles con GGUF. vLLM y TGI tienen soporte limitado de GGUF, por lo que para producción a gran escala suele ser preferible usar los pesos safetensors del modelo base con estas últimas.
- Latencia y throughput: no disponibles. Dependen del hardware, del tipo de cuantización y de la longitud de contexto efectiva; en una GPU de consumo es razonable esperar decenas de tokens por segundo en 4 bits, pero no hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

La comparación se establece con alternativas de tamaño y propósito equivalentes. Los datos del modelo base se toman de su documentación pública; los de la competencia, de sus respectivas model cards.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| hrm-labs/gemma-3-4b-it-qat-GGUF (Gemma 3 4B IT QAT) | 3,88 B | 128.000 tokens (modelo base) | Sí (modelo base) | No indicada en el repo; la del modelo base son los Gemma Terms of Use | GGUF |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 tokens | No | Llama 3.2 Community License | safetensors, GGUF |
| Qwen2.5 3B Instruct | 3,1 B | 32.768 tokens | No | Apache 2.0 | safetensors, GGUF |
| Phi-4-mini Instruct | 3,8 B | 128.000 tokens | No | MIT | safetensors, GGUF |

Puntos diferenciales relevantes: frente a Llama 3.2 3B y Qwen2.5 3B, el modelo de esta ficha aporta entrada de imagen y una ventana de contexto mayor que Qwen2.5 3B; frente a Phi-4-mini, la licencia es más restrictiva (Gemma Terms of Use frente a MIT) y el rendimiento en razonamiento matemático y de código de la familia Phi tiende a ser superior en el mismo rango de tamaño, aunque no hay datos de benchmarks disponibles para confirmarlo en esta cuantización concreta. La ventaja del checkpoint QAT es la calidad sostenida en 4 bits, que es precisamente el escenario de despliegue de un modelo de este tamaño. No se dispone de cifras comparativas verificadas para este repositorio.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: al derivar de google/gemma-3-4b-it-qat, se heredan presumiblemente los Gemma Terms of Use, que imponen obligaciones de atribución y una política de usos prohibidos. Conviene verificar la licencia antes de cualquier uso comercial.
- Repositorio sin historial verificable: 0 descargas, 0 likes, sin model card propia más allá de un fragmento con instrucciones de ejecución y con fecha de creación en 2026. Es un reempaquetado de terceros, no una publicación oficial de Google; la trazabilidad del proceso de conversión a GGUF no está documentada.
- Riesgo de alucinación inherente a un modelo de ~4B parámetros: puede inventar datos, citas o referencias, especialmente en tareas de conocimiento factual y con contexto largo.
- Degradación por cuantización: aunque el checkpoint es QAT y la pérdida debería ser menor, siguen existiendo diferencias respecto a los pesos en bf16, más acusadas en razonamiento matemático y generación de código.
- Capacidad de razonamiento limitada: tareas de varios pasos, matemáticas avanzadas y razonamiento simbólico complejo quedan fuera del alcance fiable de un modelo de este tamaño.
- Contexto largo con matices: los 128.000 tokens son una característica del modelo base y su aprovechamiento real depende de la implementación (atención *flash*, gestión de caché) y de la memoria disponible; el rendimiento decae en la parte central de contextos muy extensos.
- Idiomas: la cobertura amplia declarada por Google no implica calidad uniforme; los idiomas con menos representación en los datos de entrenamiento sufrirán más errores y sesgos culturales.
- Multimodalidad supeditada al despliegue: sin el fichero de proyección de visión, el modelo GGUF funcionará solo como modelo de texto aunque el checkpoint base sea multimodal. No se confirma en la información disponible si este repositorio incluye dicho fichero.
- Sesgos: no se han publicado evaluaciones de sesgo específicas para esta cuantización; los sesgos de género, etnia y origen presentes en los datos web persisten y pueden amplificarse con la cuantización.
- Sin datos de rendimiento medidos: no hay benchmarks, latencias ni pruebas de throughput publicadas para estos ficheros concretos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hrm-labs/gemma-3-4b-it-qat-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it-qat
- GGUF de referencia citado en la model card: https://huggingface.co/ggml-org/gemma-3-4b-it-qat-GGUF
- Familia Gemma 3 en HuggingFace: https://huggingface.co/google/gemma-3-4b-it
- Informe técnico de Gemma 3 (Google): https://arxiv.org/abs/2503.19786
- Anuncio de Gemma 3 en el blog de Google: https://blog.google/technology/developers/gemma-3/
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los enlaces anteriores proceden de los metadatos de HuggingFace y de la documentación pública del modelo base.
