# mradermacher/Spark-X2.6-1.7B-Base-GGUF

## Resumen

Spark-X2.6-1.7B-Base-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo base Spark-X2.6-1.7B-Base, desarrollado por XHToken y cuantizado por el usuario mradermacher. El repositorio original pesa unos 15,9 GB en safetensors y contiene un modelo de aproximadamente 1,7 mil millones de parámetros (1.707.657.216 según los metadatos de safetensors), orientado a inglés y chino.

El propósito de este repositorio no es aportar un modelo nuevo, sino facilitar la ejecución local del modelo base en hardware modesto: ofrece versiones comprimidas desde Q2_K (0,9 GB) hasta f16 (3,5 GB), compatibles con llama.cpp, Ollama y otras herramientas del ecosistema GGUF. Se trata de un modelo base (no instruido ni alineado), por lo que está pensado principalmente para completado de texto, fine-tuning posterior o investigación, no para conversación lista para producción.

Su relevancia actual radica en la tendencia de los modelos pequeños (1-2B) cuantizados, que permiten experimentar con LLM en portátiles, Raspberry Pi o GPUs de consumo sin coste de licencia, dado que el modelo base hereda la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de familia: sparkx2_5) |
| Parametros totales | 1.707.657.216 (1,7B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura interna del modelo base (numero de capas, dimensiones, tipo de attention) ni sobre su proceso de entrenamiento (tokens, composicion del dataset, RLHF/DPO). La model card del repositorio original no incluye esta informacion y la ficha de cuantizacion de mradermacher se limita a describir el proceso de conversion (convert_type: hf, cuantizaciones estaticas con opcion de versiones imatrix/weighted en un repositorio aparte).

Lo unico documentado es el pipeline de cuantizacion: mradermacher convierte los pesos safetensors a GGUF y publica cuantizaciones estaticas en formato k-quant (familia Q2_K a Q8_0, mas IQ4_XS y f16). Adicionalmente existen cuantizaciones weighted/imatrix en un repositorio hermano, que suelen ofrecer mejor calidad a igual tamaño.

## Capacidades

- Generacion de texto en ingles y chino (modelo base, sin ajuste por instrucciones).
- Completado de texto y continuacion de documentos, uso tipico de un modelo base.
- Base adecuada para fine-tuning posterior (SFT, DPO) dado su tamaño reducido.
- Ejecucion local en formato GGUF con llama.cpp, Ollama, LM Studio y herramientas compatibles.
- No hay evidencia de soporte de tool calling, function calling, vision, audio ni thinking mode en la informacion disponible.
- No hay evidencia de capacidades agenticas ni de razonamiento multi-paso documentadas.

## Casos de uso

- Experimentacion con modelos base: ideal para investigadores que quieran estudiar el comportamiento de un LLM de 1,7B sin alineamiento, midiendo completados crudos en ingles y chino.
- Fine-tuning economico: con 1,7B de parametros, es viable hacer SFT o DPO en una sola GPU de consumo (incluso con LoRA en hardware modesto), usando la version f16 o Q8_0 como punto de partida.
- Despliegue en dispositivos de borde: la cuantizacion Q2_K ocupa solo 0,9 GB, lo que permite ejecutar el modelo en portatiles sin GPU dedicada, mini-PCs o SBCs con RAM limitada.
- Prototipado rapido de pipelines NLP: integrable en scripts con llama-cpp-python o Ollama para tareas como extraccion de entidades, resumen basico o generacion de plantillas de texto, ajustando el modelo despues con datos propios.
- Comparacion de metodos de cuantizacion: el repositorio ofrece 12 variantes de cuantizacion del mismo modelo, util como banco de pruebas para estudiar el impacto de cada esquema k-quant en perplexity y velocidad.
- Sistemas bilingues ingles-chino de bajo coste: al soportar ambos idiomas, puede servir de base para aplicaciones de completado de texto en entornos con restricciones de hardware y presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la version Q2_K ocupa 0,9 GB; Q4_K_M, 1,2 GB; Q6_K, 1,5 GB; Q8_0, 1,9 GB; f16, 3,5 GB. Con contexto ampliado hay que anadir memoria adicional para el KV cache (no se especifica la longitud de contexto del modelo).
- GPU recomendadas: no es necesaria ninguna GPU; cualquier GPU moderna con 4 GB o mas de VRAM ejecuta incluso la version f16. En CPU, cualquier procesador x86 o ARM reciente es suficiente dado el tamaño.
- Cabe sobradamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso integradas con memoria compartida; tambien funciona unicamente con CPU y RAM del sistema.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. No hay soporte directo de vLLM o TGI para estos ficheros GGUF (habria que usar el modelo base en safetensors).
- Latencia y throughput: no disponibles; por tamaño y cuantizacion, se espera inferencia muy rapida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-Base-GGUF | 1,7B | no disponible | Apache 2.0 | GGUF | Modelo base bilingue (en/zh), cuantizado por mradermacher |
| Qwen2.5-1.5B-Base | 1,5B | 32K (documento oficial) | Qwen Research (no comercial sin permiso) | safetensors, GGUF comunitarios | Bilingue en/zh, ecosistema maduro |
| Llama 3.2-1B-Base | 1,2B | 128K (documento oficial) | Llama 3.2 Community License | safetensors, GGUF comunitarios | Multilingue, licencia con restricciones |
| SmolLM2-1.7B-Base | 1,7B | 8K (documento oficial) | Apache 2.0 | safetensors, GGUF comunitarios | Similar en tamaño y licencia, orientado a ingles |

Nota: los datos de contexto y licencias de los modelos alternativos proceden de sus fichas oficiales y se incluyen como referencia; para Spark-X2.6 no hay datos oficiales comparables.

## Limitaciones y advertencias

- Es un modelo base, no instruido: no sigue instrucciones de forma fiable ni mantiene conversaciones; para uso conversacional habria que aplicar fine-tuning o buscar una variante instruct del autor original.
- No hay documentacion de arquitectura, contexto ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo de alucinacion y de generacion de contenido sin filtro: al carecer de alineamiento (RLHF/DPO no documentado), puede producir texto ofensivo, incorrecto o incoherente.
- Sesgos conocidos: no disponibles; al no publicarse la composicion del dataset de entrenamiento, no se pueden caracterizar los sesgos.
- Soporte de idiomas limitado a ingles y chino segun los tags; su rendimiento en castellano no esta documentado.
- La calidad de las cuantizaciones mas agresivas (Q2_K, Q3_K_S/M) degrada apreciablemente la calidad del modelo, como reconoce el propio autor de las cuantizaciones.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero hay que verificar la procedencia del modelo base (XHToken/Spark-X2.6-1.7B-Base) y cualquier termino asociado a los datos de entrenamiento.
- Proyecto de comunidad con muy poca traccion (497 descargas, 0 likes en el momento de la ficha): escasa validacion por parte de la comunidad y posible falta de soporte.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-Base-GGUF
- Modelo base original: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-Base-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Spark-X2.6-1.7B-Base-GGUF
- Guia de uso de ficheros GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
