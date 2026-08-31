# mradermacher/Marco-LLM-AR-V2-GGUF

## Resumen

Marco-LLM-AR-V2-GGUF es la versión cuantizada en formato GGUF del modelo Marco-LLM-AR-V2, desarrollado originalmente por AIDC-AI y publicado bajo el nombre ATH-MaaS/Marco-LLM-AR-V2. Esta variante, preparada por mradermacher, ofrece una serie de archivos GGUF con diferentes niveles de cuantización para facilitar la ejecución del modelo en entornos con recursos limitados, como equipos de consumo o servidores sin GPUs de alta gama.

El modelo base es un modelo de lenguaje preentrenado de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), especializado en árabe, con una ventana de contexto de 128.000 tokens según la información disponible. Está diseñado para tareas conversacionales y de generación de texto en árabe, y su licencia Apache 2.0 permite uso comercial y modificación. La relevancia de esta versión GGUF radica en que permite desplegar el modelo en una amplia variedad de hardware, desde GPUs de consumo hasta CPU, mediante herramientas como llama.cpp u Ollama, sin necesidad de convertir los pesos manualmente.

La cuantización está realizada por mradermacher, quien proporciona tanto quants estáticos (este repositorio) como quants con imatrix (en un repositorio separado). Los archivos van desde Q2_K (3,1 GB) hasta f16 (15,3 GB), cubriendo un amplio espectro de compensaciones entre tamaño, velocidad y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo transformer decoder de 7,6B parámetros, sin especificación oficial en la información proporcionada) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens (según LLM Explorer) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo original usa safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna (tipo de atencion, normalizacion, etc.) ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO) en la informacion proporcionada. El modelo original es obra de AIDC-AI, y el repositorio de HuggingFace solo indica que es un modelo preentrenado para arabe con licencia Apache 2.0.

Por el tamano (7,6B parametros) y la ventana de contexto de 128K, se puede inferir que se trata de un transformer decoder clasico, pero no hay confirmacion oficial en los datos disponibles. Tampoco se menciona el uso de tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto en arabe: el modelo esta preentrenado especificamente para este idioma, por lo que su principal capacidad es producir texto coherente y contextualizado en arabe moderno estandar y posiblemente dialectos.
- Conversacion multi-turno: segun los tags del repositorio, el modelo es de tipo "conversational", lo que indica que puede mantener dialogos con contexto a lo largo de varias interacciones.
- Comprension de contexto largo: gracias a su ventana de 128K tokens, puede manejar documentos extensos o historiales de conversacion prolongados sin perder informacion relevante.
- Compatibilidad con pipelines de transformadores: al estar basado en la libreria transformers, puede integrarse en flujos de trabajo estandar de HuggingFace (inferencia, fine-tuning, etc.).
- Soporte de endpoints compatibles: el tag "endpoints_compatible" sugiere que puede desplegarse en soluciones de inferencia como Inference Endpoints de HuggingFace.

No se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso explicito, vision o audio. Tampoco se indica capacidad multilingue mas alla del arabe.

## Casos de uso

- Asistentes conversacionales en arabe: el modelo puede alimentar chatbots de atencion al cliente o asistentes virtuales para empresas que operan en paises arabes, gracias a su naturaleza conversacional y su contexto largo que permite mantener el hilo de la conversacion.
- Generacion de contenido en arabe: redaccion de articulos, resumenes, respuestas a correos o publicaciones en redes sociales en arabe, aprovechando su capacidad de producir texto fluido y gramaticalmente correcto.
- Traduccion automatica arabe-espanol (o viceversa) como paso intermedio: aunque no es un modelo de traduccion dedicado, puede utilizarse para generar borradores o reformular textos en arabe dentro de un pipeline mas amplio.
- Analisis de documentos largos en arabe: con 128K de contexto, puede procesar informes, contratos o articulos extensos para extraer informacion, resumir o responder preguntas sobre su contenido.
- Educacion y aprendizaje de idiomas: generar ejercicios, explicaciones o dialogos en arabe para estudiantes, o simular conversaciones para practica.
- Desarrollo de aplicaciones de voz a texto en arabe: combinado con un sistema de reconocimiento de voz, el modelo puede transcribir y procesar audio, generando respuestas habladas mediante un sintetizador.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF (por ejemplo, Q4_K_M con 4,8 GB), puede ejecutarse en portatiles o mini-PCs con GPU de 8 GB, o incluso en CPU con llama.cpp para prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo ni para sus cuantizaciones. Se recomienda consultar la documentacion oficial del modelo original (ATH-MaaS/Marco-LLM-AR-V2) si se requieren cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: dependiendo de la cuantizacion, el uso de VRAM varia desde aproximadamente 3,1 GB (Q2_K) hasta 15,3 GB (f16). Las opciones recomendadas para equilibrio entre calidad y consumo son Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB), que caben en GPUs de 6-8 GB.
- GPU recomendadas: para las cuantizaciones mas ligeras (Q2_K a Q4_K_M), una GPU de consumo como NVIDIA RTX 3060 (12 GB) o RTX 4060 (8 GB) es suficiente. Para Q8_0 o f16, se necesitan GPUs con mas de 12 GB, como RTX 4090, A100 o H100.
- Compatibilidad con consumer GPU: si, las cuantizaciones Q4_K_M y menores caben en GPUs de 8 GB, y Q2_K en GPUs de 4 GB (aunque con perdida de calidad).
- Opciones de despliegue: al ser GGUF, se puede usar con llama.cpp, Ollama, LM Studio, o servidores de inferencia como llama-cpp-python. Tambien es compatible con transformers mediante la integracion de GGUF, aunque el flujo mas comun es a traves de las herramientas mencionadas.
- Latencia y throughput: no se han publicado datos especificos. En una GPU de gama media (por ejemplo, RTX 3060) con Q4_K_M, se puede esperar una generacion de entre 20 y 40 tokens por segundo, pero esto es una estimacion orientativa y depende del hardware y de la implementacion.

## Comparativa con modelos similares

No se dispone de informacion comparativa en los datos proporcionados. No se puede establecer una comparacion fiable con otros modelos de tamano similar (como Llama-2-7B, Mistral-7B o Jais-13B) porque no se han facilitado benchmarks ni especificaciones tecnicas detalladas del modelo original. Se recomienda consultar la pagina del modelo base para obtener referencias.

## Limitaciones y advertencias

- Idioma limitado: el modelo esta entrenado exclusivamente para arabe. No debe utilizarse para generar contenido en otros idiomas, ya que la calidad sera muy baja.
- Sesgos y alucinaciones: al ser un modelo de lenguaje generico, puede producir respuestas inventadas o sesgadas, especialmente en temas delicados o con informacion factual. Es necesario verificar las salidas en aplicaciones criticas.
- Riesgo de perdida de calidad por cuantizacion: las cuantizaciones mas agresivas (Q2_K, Q3_K) pueden degradar notablemente la coherencia y el conocimiento del modelo. Se recomienda usar Q4_K_M o superior para tareas exigentes.
- Sin informacion sobre alineacion: no se menciona si el modelo ha pasado por procesos de RLHF o DPO, por lo que puede generar contenido inapropiado o toxico si no se aplica un filtrado adicional.
- Limitaciones de contexto: aunque la ventana es de 128K, el rendimiento puede degradarse en contextos muy largos, y el uso de cuantizaciones bajas puede afectar la atencion en distancias largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con la atribucion requerida y las condiciones de la licencia, especialmente si se redistribuye el modelo o sus derivados.
- Dependencia del modelo base: esta version GGUF es una cuantizacion del modelo original; cualquier limitacion o sesgo presente en ATH-MaaS/Marco-LLM-AR-V2 se mantiene en esta version.

## Enlaces

- Repositorio HuggingFace de esta version GGUF: https://huggingface.co/mradermacher/Marco-LLM-AR-V2-GGUF
- Repositorio con cuantizaciones imatrix (mayor calidad): https://huggingface.co/mradermacher/Marco-LLM-AR-V2-i1-GGUF
- Modelo original (safetensors): https://huggingface.co/ATH-MaaS/Marco-LLM-AR-V2
- Ficha en LLM Explorer con detalles de contexto y VRAM: https://llm-explorer.com/model/AIDC-AI%2FMarco-LLM-AR-V2,4YxAm69exPGj7mSXGzOFoD
