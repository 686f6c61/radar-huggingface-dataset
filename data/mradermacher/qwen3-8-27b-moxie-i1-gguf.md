# mradermacher/Qwen3.8-27B-Moxie-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con matriz de importancia (imatrix) del modelo Qwen3.8-27B-Moxie, un fine-tune conversacional del modelo base Qwen3.8-27B desarrollado por Alibaba. Las cuantizaciones han sido generadas por mradermacher a partir de los pesos del fine-tune publicado por mijoko, y están optimizadas para su ejecución en hardware de consumo mediante motores como llama.cpp, Ollama o LM Studio.

El modelo base Qwen3.8-27B, lanzado en agosto de 2026, es un transformer denso de 27 300 millones de parámetros con capacidades multimodales (visión y lenguaje), soporte de tool calling y ventana de contexto larga. Su licencia Apache 2.0 lo hace especialmente atractivo para uso comercial. Este repositorio GGUF permite desplegar el modelo en GPUs con 16-24 GB de VRAM, algo inviable con los pesos originales en BF16.

La relevancia de esta publicación radica en que ofrece una amplia gama de cuantizaciones (desde Q2_K hasta Q6_K, incluyendo formatos IQ) con calibración imatrix, lo que permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible. El tag "conversational" sugiere que el fine-tune Moxie está orientado a mejorar el comportamiento del modelo en diálogos, aunque no se dispone de detalles específicos sobre su entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (vision-language) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta contexto largo, sin cifra exacta) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta multiples idiomas, sin lista confirmada) |
| Licencia | No disponible en el repositorio (el modelo base es Apache 2.0; la del fine-tune Moxie no esta especificada) |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 300 millones de parámetros con capacidades multimodales (procesamiento de imagen y texto), soporte de tool calling y una ventana de contexto larga. No se trata de una arquitectura MoE ni híbrida; es un modelo denso convencional. El fine-tune Moxie, cuyos pesos originales se encuentran en el repositorio de mijoko, es un ajuste posterior orientado a conversación, aunque no se han publicado detalles sobre el dataset, la técnica de ajuste (RLHF, DPO, SFT) ni el número de tokens de entrenamiento.

Las cuantizaciones de este repositorio se han generado con calibración imatrix (importance matrix), una técnica que pondera la importancia de cada peso durante la cuantización para minimizar la pérdida de calidad. El autor indica que son "weighted/imatrix quants", lo que sugiere un proceso de cuantización ponderada. No se dispone de información sobre el dataset de calibración utilizado.

## Capacidades

- Generacion de texto y dialogo conversacional: el fine-tune Moxie esta orientado a mantener conversaciones fluidas y coherentes.
- Razonamiento y matematicas: el modelo base Qwen3.8-27B demuestra capacidades solidas en tareas de razonamiento logico y aritmetico.
- Generacion de codigo: soporta la creacion de fragmentos de codigo en multiples lenguajes, aunque no se especifican benchmarks concretos.
- Comprension de imagenes: al ser un modelo vision-language, puede procesar entradas visuales junto con texto (capacidad heredada del modelo base).
- Tool calling / function calling: el modelo base soporta invocacion de herramientas externas, lo que permite integrarlo en agentes y pipelines automatizados.
- Contexto largo: el modelo base esta disenado para manejar ventanas de contexto extensas, util en tareas de analisis de documentos o conversaciones prolongadas.
- Multilingue: el modelo base Qwen3.8 soporta multiples idiomas, aunque la lista exacta no esta disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con clientes, manteniendo el contexto de la interaccion gracias a su ventana de contexto larga. Las cuantizaciones GGUF permiten desplegarlo en servidores modestos con una sola GPU de 24 GB.
- Asistente de programacion local: con soporte de tool calling, el modelo puede integrarse en entornos de desarrollo (IDE) para autocompletar codigo, explicar fragmentos o generar tests. La cuantizacion Q4_K_M ofrece un buen equilibrio entre calidad y uso de VRAM.
- Analisis de documentos extensos: su capacidad de contexto largo permite resumir contratos, informes o articulos cientificos de decenas de paginas en una sola pasada, sin necesidad de dividir el texto.
- Generacion de contenido multimodal: al aceptar entradas de imagen, puede describir fotografias, diagramas o capturas de pantalla, lo que resulta util en herramientas de accesibilidad o documentacion tecnica.
- Prototipado de agentes conversacionales: investigadores y desarrolladores pueden experimentar con agentes que combinan razonamiento, llamadas a herramientas y memoria conversacional, ejecutando el modelo localmente con Ollama o llama.cpp.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ (como IQ2_M o IQ3_XXS) permiten ejecutar el modelo en GPUs con 8-12 GB de VRAM, habilitando su uso en portatiles gaming o estaciones de trabajo modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de MMLU, HumanEval, GSM8K ni otros tests estandar. Tampoco se han encontrado evaluaciones independientes del fine-tune Moxie en la busqueda web realizada. Se recomienda consultar la ficha del modelo base Qwen3.8-27B para obtener datos de rendimiento de referencia, aunque el fine-tune puede presentar variaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Segun el articulo de codersera.com, el modelo puede ejecutarse en GPUs con 16-24 GB de VRAM. Las cuantizaciones mas agresivas (IQ2_M, Q2_K) podrian caber en 8-10 GB, mientras que Q6_K o Q5_K_M requieren alrededor de 20-24 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 40 GB, o GPUs de Apple Silicon con memoria unificada de 32 GB o superior.
- Compatibilidad con GPU consumer: si, las cuantizaciones GGUF estan disenadas para hardware de consumo. Con Q4_K_M o similar, una RTX 3090/4090 es suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con backend GGUF), text-generation-webui. El tag "endpoints_compatible" sugiere que puede servir a traves de API compatibles con OpenAI.
- Latencia y throughput: no se han publicado mediciones especificas. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generacion de 20-40 tokens por segundo, aunque esto es una estimacion orientativa basada en modelos de tamano similar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3 B | Largo (no especificado) | Apache 2.0 | BF16, FP8 | Modelo original de Alibaba, sin fine-tune |
| Qwen3.8-27B-Moxie (este repo) | 27,3 B | No disponible | No disponible | GGUF | Fine-tune conversacional, cuantizado con imatrix |
| Qwen3.8-27B-ABLITERATED | 27,3 B | No disponible | Apache 2.0 | GGUF | Variante "abliterada" (sin refusal) del mismo autor |

No se dispone de datos de rendimiento comparativo entre estas variantes. La eleccion entre ellas dependera de las necesidades especificas: el modelo base ofrece la referencia original, Moxie esta orientado a conversacion, y ABLITERATED elimina ciertos mecanismos de rechazo (con implicaciones eticas y legales). No se han encontrado otros modelos de 27 B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia incierta: aunque el modelo base es Apache 2.0, la licencia del fine-tune Moxie no esta especificada en el repositorio. Antes de usar el modelo en produccion comercial, es necesario verificar la licencia del repositorio original de mijoko.
- Sesgos y alucinaciones: al ser un fine-tune de un modelo grande, puede heredar sesgos presentes en los datos de entrenamiento del modelo base. No se han realizado evaluaciones especificas de sesgo para esta variante.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en tareas de hechos concretos. Se recomienda validar las salidas en aplicaciones criticas.
- Limitaciones de idioma: aunque el modelo base soporta multiples idiomas, la calidad puede variar significativamente entre ellos. No se ha confirmado la lista de idiomas soportados por el fine-tune.
- Calidad de la cuantizacion: las cuantizaciones mas agresivas (Q2_K, IQ1_M) pueden degradar notablemente la calidad de las respuestas. Se recomienda probar varias opciones para encontrar el equilibrio adecuado.
- Sin garantias de rendimiento: al no haber benchmarks publicados, el rendimiento real en tareas especificas es desconocido. Es necesario realizar pruebas propias antes de un despliegue en produccion.
- Fecha de creacion: el repositorio fue creado en agosto de 2026, lo que indica que es un modelo muy reciente con poca adopcion (0 descargas en el momento de la consulta). La comunidad aun no ha validado su comportamiento en entornos reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Moxie-i1-GGUF
- Repositorio del fine-tune original (mijoko): https://huggingface.co/mijoko/Qwen3.8-27B-Moxie
- Articulo "How to Run Qwen 3.8 27B Locally: VRAM, Quants and the Template Trap": https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Articulo "How to Run Qwen 3.8 Locally: 27B on 16-24GB GPUs (2026)": https://codersera.com/blog/how-to-run-qwen-3-8-locally-2026/
- vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Repositorio de la variante ABLITERATED (mismo autor): https://huggingface.co/mradermacher/Qwen3.8-27B-ABLITERATED-BF16-i1-GGUF
