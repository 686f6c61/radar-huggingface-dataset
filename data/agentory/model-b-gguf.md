# agentory/model-b-GGUF

## Resumen

`agentory/model-b-GGUF` es una publicación de cuantizaciones estáticas en formato GGUF del modelo base `xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic`. El repositorio lo firma el usuario `agentory`, aunque la model card indica que la cuantización la ha realizado `mradermacher`, especialista habitual en convertir pesos de Hugging Face a GGUF. No se trata, por tanto, de un modelo entrenado desde cero, sino de una distribución de pesos comprimidos para inferencia local eficiente.

El modelo subyacente combina varias señales en su nomenclatura y etiquetas: una base de la familia Qwen 3.5 de 4B parámetros, un proceso de destilación con datos asociados a DeepSeek, ajuste supervisado (SFT) orientado a matemáticas y STEM, y una variante "heretic/abliterated/uncensored" que elimina total o parcialmente los mecanismos de rechazo del modelo original. El resultado es un modelo conversacional de 4.205.751.296 parámetros con licencia Apache 2.0 y soporte declarado para inglés, chino, coreano, japonés, español y ruso.

La relevancia de esta ficha está en que permite ejecutar un modelo de 4B con capacidades declaradas de razonamiento, matemáticas y código en hardware de consumo, sin restricciones de contenido, pero con las advertencias típicas de los modelos abliterated: menor fiabilidad en seguridad, sesgos sin filtrar y ausencia de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, según etiquetas del autor); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del autor, que apuntan a la familia Qwen 3.5 con 4B parámetros y a un proceso de destilación con datos de DeepSeek. El pipeline de entrenamiento declarado incluye SFT (supervised fine-tuning) con énfasis en matemáticas y STEM, y una fase posterior de "abliteration" o "decensoring" que modifica los pesos para reducir los comportamientos de rechazo aprendidos durante el alineamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO.

La innovación técnica más destacable de esta publicación no está en el entrenamiento, sino en la distribución: cuantizaciones estáticas GGUF generadas con `convert_type: hf` y `output_tensor_quantised: 1`, que cubren desde Q2_K (2,0 GB) hasta f16 (8,5 GB). Se incluyen también ficheros `mmproj` (Q8_0 y f16) que actúan como suplemento multimodal, lo que sugiere que el modelo base podría aceptar entrada de imágenes, aunque no se confirma en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Razonamiento y modo "thinking" implícito por las etiquetas `reasoning` y `qwen3_5`; no se documenta el formato exacto de los tokens de pensamiento.
- Matemáticas y STEM, reforzados por el ajuste SFT declarado en las etiquetas `math` y `stem`.
- Generación de código, aunque no se detalla el nivel de soporte ni lenguajes cubiertos.
- Multilingüismo declarado para inglés, chino, coreano, japonés, español y ruso.
- Posible entrada multimodal (imágenes) por la presencia de ficheros `mmproj`; no confirmado en la model card.
- Comportamiento "uncensored/abliterated": menor probabilidad de rechazo ante peticiones que el modelo original rechazaría.
- No se documenta soporte explícito de tool calling, function calling ni uso como agente multi-paso.

## Casos de uso

- Asistente conversacional local sin conexión: con cuantizaciones Q4_K_M de 2,8 GB, el modelo cabe en portátiles con 8 GB de RAM y permite desplegar un chatbot privado en llama.cpp u Ollama sin enviar datos a la nube.
- Generación de código en entornos aislados: al ser un modelo de 4B, se puede ejecutar en una estación de trabajo con GPU de consumo y usarse para autocompletar o explicar fragmentos de código en IDE sin depender de APIs externas.
- Resolución de problemas matemáticos y STEM en herramientas educativas: el ajuste SFT en matemáticas lo hace adecuado para tutores automáticos que expliquen pasos intermedios, siempre con verificación humana dada la ausencia de benchmarks.
- Procesamiento de documentación multilingüe: el soporte declarado de seis idiomas permite resumir o traducir textos en inglés, chino, coreano, japonés, español y ruso en pipelines batch con llama.cpp.
- Investigación sobre alineamiento y seguridad: al ser un modelo abliterated, sirve como caso de estudio para medir cómo cambia la tasa de rechazo y la calidad de respuesta tras eliminar los mecanismos de seguridad, en entornos controlados.
- Prototipado rápido de agentes conversacionales: su tamaño reducido permite iterar sobre prompts y flujos multi-turno en local antes de escalar a modelos mayores, aunque el soporte de tool calling no está documentado.
- Despliegue en dispositivos con recursos limitados: la cuantización Q2_K de 2,0 GB permite inferencia en Raspberry Pi 5 o mini-PC con 4-8 GB de RAM, a costa de una pérdida notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ≈ 2,0 GB; Q3_K_M ≈ 2,4 GB; Q4_K_M ≈ 2,8 GB; Q5_K_M ≈ 3,2 GB; Q6_K ≈ 3,6 GB; Q8_0 ≈ 4,6 GB; f16 ≈ 8,5 GB. Añadir 0,5-0,8 GB si se usa el suplemento multimodal `mmproj`.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8 con contexto amplio; A100 o H100 no son necesarias para un modelo de 4B y solo tendrían sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, desde una GTX 1650 4 GB con Q2_K hasta una RTX 4090 con f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (etiqueta `text-generation-inference`), y servidores compatibles con la API de OpenAI mediante llama.cpp (`llama-server`). vLLM no soporta GGUF de forma nativa estable.
- Latencia y throughput: no disponibles en la información proporcionada; a modo orientativo, un 4B en Q4_K_M suele generar decenas de tokens por segundo en GPU de consumo, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| agentory/model-b-GGUF (este) | 4,2B | No disponible | Apache 2.0 | GGUF | Variante uncensored, sin benchmarks publicados |
| Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial con benchmarks publicados y alineamiento estándar |
| Llama-3.2-3B-Instruct | 3,2B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto muy largo, licencia con restricciones comerciales |
| Phi-3.5-mini-instruct | 3,8B | 131.072 tokens | MIT | safetensors, GGUF | Buen rendimiento en razonamiento y código, licencia permisiva |

La comparación es aproximada: no se dispone de datos de contexto ni de benchmarks del modelo evaluado, por lo que la elección frente a alternativas oficiales debe basarse en la ausencia de filtros de seguridad y en el tamaño reducido, no en métricas de calidad verificadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de rendimiento en MMLU, HumanEval, GSM8K ni otras pruebas estándar.
- Modelo "abliterated/uncensored": se han eliminado o reducido los mecanismos de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso sin advertencia. No apto para producción orientada al público sin filtros externos.
- Riesgo elevado de alucinación, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S) y en dominios fuera del ajuste SFT.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperación sobre documentos extensos.
- Idiomas declarados sin evaluación: el soporte de español, ruso, coreano y japonés no está verificado con métricas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base incorpora componentes derivados de Qwen y DeepSeek cuyas condiciones originales conviene revisar antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta soporte de tool calling ni de agentes, pese a que el nombre del autor (`agentory`) lo sugiera.
- El tamaño del repositorio (39,9 GB) incluye todas las cuantizaciones; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentory/model-b-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Cuantizaciones ponderadas/imatrix del mismo modelo: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
