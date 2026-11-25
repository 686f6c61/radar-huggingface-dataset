# mradermacher/Krypton-Fly-3.0-i1-GGUF

## Resumen

Krypton-Fly-3.0-i1-GGUF es una compilación de cuantizaciones en formato GGUF del modelo base myjellylabs/Krypton-Fly-3.0, publicada por el cuantizador mradermacher. El modelo original es un transformer multimodal de aproximadamente 8.950 millones de parametros (8,95 B), orientado a tareas de programación, uso de terminal, investigación profunda (deep-research), razonamiento y conversación, con un ajuste adicional mediante DPO. Esta versión no introduce cambios en la arquitectura ni en los pesos originales: se limita a ofrecer los mismos pesos en múltiples niveles de cuantización para facilitar su despliegue en hardware con recursos limitados.

La relevancia de esta ficha radica en que el repositorio i1-GGUF emplea cuantizaciones ponderadas con fichero imatrix, lo que permite obtener calidades superiores a igual tamaño que las cuantizaciones estáticas equivalentes. El paquete cubre desde IQ1_S (3,0 GB) hasta Q6_K (7,5 GB), abarcando así desde GPUs de gama de entrada hasta estaciones de trabajo. El modelo base declara licencia Apache 2.0 y soporte para inglés e hindi.

Conviene subrayar que la model card del repositorio de cuantización es escueta: no incluye datos sobre longitud de contexto, composición del dataset de entrenamiento, resultados de benchmarks ni detalles arquitectónicos más allá de las etiquetas. Por tanto, buena parte de las especificaciones de esta ficha figuran como "no disponible", y el lector debe consultar el repositorio del modelo base para información adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (detalles no disponibles) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en, hi (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 ponderadas con imatrix); pesos originales en safetensors en el repositorio base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su carácter multimodal y de las etiquetas asociadas (krypton, myjellylabs, multimodal, coding, terminal, deep-research, reasoning, dpo). El recuento de parámetros (8,95 B) y el tamaño del repositorio de pesos originales sugieren un transformer denso de escala media, pero no se confirma ni el número de capas, ni la dimensionalidad, ni el mecanismo de atención, ni el tipo de encoder visual.

Respecto al entrenamiento, la model card solo indica que el modelo ha pasado por una fase de DPO (Direct Preference Optimization) y que está orientado a tareas de razonamiento, código y terminal. No se especifica el número de tokens de entrenamiento, la composición del dataset, la mezcla de datos multimodales ni si hubo fases de RLHF adicionales. El repositorio de cuantización no aporta información sobre innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. Todo ello debe considerarse "no disponible" en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational".
- Razonamiento explícito y resolución de problemas, según la etiqueta "reasoning".
- Generación y asistencia en programación, según la etiqueta "coding".
- Uso de terminal y ejecución de comandos, según la etiqueta "terminal".
- Investigación profunda (deep-research), según la etiqueta correspondiente.
- Procesamiento multimodal (visión), según la etiqueta "multimodal" y la nota de la model card que indica que se trata de un modelo de visión; los ficheros mmproj, si existen, se alojan en el repositorio estático.
- Alineación mediante DPO, según la model card.
- Soporte multilingüe limitado a inglés e hindi según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente, aunque las etiquetas de terminal y deep-research lo sugieren.

## Casos de uso

- Asistencia en programación dentro del IDE: el modelo puede generar y explicar código en inglés, integrarse mediante llama.cpp u Ollama y aprovechar las cuantizaciones Q4_K_M o Q5_K_M para mantener un equilibrio razonable entre calidad y consumo de VRAM en estaciones de desarrollo.
- Automatización de tareas de terminal: gracias a su orientación a "terminal", puede emplearse para traducir instrucciones en lenguaje natural a comandos de shell y para interpretar la salida de los mismos en flujos de administración de sistemas.
- Investigación profunda asistida: la etiqueta "deep-research" sugiere su uso en pipelines de búsqueda, síntesis y contraste de fuentes, con el modelo como motor de razonamiento sobre documentos recuperados.
- Análisis de documentos e imágenes: al ser un modelo multimodal, puede emplearse para extraer información de capturas, diagramas o documentos escaneados, siempre que se disponga de los ficheros mmproj del repositorio estático.
- Despliegue en hardware de consumo: las cuantizaciones IQ2 e IQ3 (3,0 a 5,1 GB) permiten ejecutar el modelo en GPUs con 6-8 GB de VRAM, lo que facilita prototipos locales y entornos sin acceso a infraestructura en la nube.
- Servicio conversacional en inglés o hindi: dado el soporte declarado de ambos idiomas, puede emplearse en asistentes de atención al cliente o chatbots internos para esos mercados, aunque la ausencia de benchmarks impide garantizar la calidad en hindi.
- Evaluación comparativa de cuantizaciones: el repositorio incluye un fichero imatrix y hasta 24 variantes, lo que lo convierte en un banco de pruebas útil para medir el impacto de la cuantización en tareas de código y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: aproximadamente 3,0 GB (i1-IQ1_S), 3,8 GB (i1-IQ2_M), 4,6 GB (i1-IQ3_M), 5,8 GB (i1-Q4_K_M), 6,6 GB (i1-Q5_K_M) y 7,5 GB (i1-Q6_K), a los que hay que sumar la memoria del contexto y, en su caso, del proyector multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 para las variantes de mayor calidad y contextos largos.
- Cabe en GPU de consumo: sí, desde una RTX 3050 8 GB o una RTX 3060 12 GB con cuantizaciones IQ2/IQ3; las variantes Q5_K_M y Q6_K requieren al menos 8-10 GB de VRAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para los pesos originales en safetensors puede emplearse transformers, vLLM o TGI, aunque no se confirma compatibilidad explícita con vLLM en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Krypton-Fly-3.0 (i1-GGUF) | 8,95 B | no disponible | Apache 2.0 | GGUF | Multimodal, DPO, orientado a código y terminal |
| Krypton-Fly-3.0 (pesos originales) | 8,95 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Krypton-Fly-3.0-GGUF (estatico) | 8,95 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas del mismo autor; incluye mmproj |

No se dispone de información sobre modelos comparables de otros desarrolladores en la documentación proporcionada, por lo que no es posible establecer una comparativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card del repositorio de cuantización no documenta sesgos conocidos; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinación no cuantificado: al no publicarse benchmarks, no puede estimarse la fiabilidad factual del modelo.
- Las cuantizaciones IQ1 e IQ2 degradan la calidad de forma notable; la propia model card califica IQ1_S como "for the desperate" y Q2_K_S como "very low quality".
- El soporte de idiomas se limita a inglés e hindi según la model card; no hay evidencia de buen rendimiento en castellano.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia y las condiciones del modelo base myjellylabs/Krypton-Fly-3.0 antes de un uso comercial.
- Los ficheros mmproj necesarios para la funcionalidad multimodal no están en este repositorio, sino en el repositorio estático del mismo autor; sin ellos, el modelo opera solo como texto.
- El repositorio pesa 111,7 GB en total, por lo que la descarga completa requiere planificación de almacenamiento; se recomienda descargar solo la cuantización necesaria.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Krypton-Fly-3.0-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Krypton-Fly-3.0-GGUF
- Modelo base: https://huggingface.co/myjellylabs/Krypton-Fly-3.0
- Página de descargas del cuantizador: https://hf.tst.eu/model#Krypton-Fly-3.0-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
