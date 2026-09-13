# mradermacher/khipu-r3-GGUF

## Resumen

mradermacher/khipu-r3-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo SZLHOLDINGS/khipu-r3, generadas por el usuario mradermacher (nethype GmbH). El modelo original es un ajuste fino de tipo LoRA, entrenado con la librería Unsloth, lo que se deduce de las etiquetas declaradas en el repositorio (unsloth, lora, szl-holdings, khipu). El repositorio no incluye model card propia del autor original: la información disponible es la del cuantizador.

Con 752.393.024 parámetros (aproximadamente 752 millones, dato extraído de los pesos en safetensors), se sitúa en la gama de modelos pequeños, orientados a inferencia local con requisitos de hardware muy reducidos. El repositorio ocupa 7,5 GB e incluye doce variantes de cuantización, desde Q2_K (0,5 GB) hasta f16 (1,6 GB). El modelo base está etiquetado como conversacional y declara únicamente el idioma inglés (en).

Su relevancia actual es limitada y muy concreta: es una opción para ejecutar un modelo conversacional pequeño en CPU, GPUs de gama baja o entornos embebidos, sin depender de servicios en la nube. No obstante, la ausencia de documentación sobre arquitectura, contexto, datos de entrenamiento y evaluación hace que cualquier uso en producción requiera validación previa. El repositorio registra 0 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (se sabe que es un ajuste fino LoRA del modelo SZLHOLDINGS/khipu-r3, entrenado con Unsloth; la arquitectura del modelo base no se documenta en la información disponible) |
| Parámetros totales | 752.393.024 (≈752 millones), según los pesos en safetensors |
| Parámetros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se publica en formato Hugging Face para transformers |
| Tamaño del repositorio | 7,5 GB |
| Etiquetas declaradas | transformers, gguf, unsloth, lora, szl-holdings, khipu, conversational, endpoints_compatible |
| Modelo base | SZLHOLDINGS/khipu-r3 |
| Fecha de creación | 2026-09-13 |
| Última actualización | 2026-09-13 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura en la documentación proporcionada. Los metadatos indican que el modelo original (SZLHOLDINGS/khipu-r3) fue entrenado mediante un ajuste fino con LoRA usando Unsloth, una librería optimizada para fine-tuning de bajo coste en memoria. Eso implica que el modelo final es la fusión de un adaptador LoRA sobre una base no especificada, o bien un modelo publicado junto con su adaptador. No se documenta si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el contexto nativo ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, mezcla de expertos, etc.). Las cuantizaciones publicadas en este repositorio son estáticas; según indica el propio cuantizador, no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación, aunque pueden solicitarse a través de la sección de discusiones comunitarias.

## Capacidades

- Generación de texto conversacional en inglés, con el formato de chat que herede el modelo base.
- Etiquetado como modelo conversacional (`conversational`), lo que apunta a un ajuste orientado a diálogo multi-turno.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere que puede servirse mediante APIs compatibles con OpenAI en plataformas de inferencia.
- Inferencia local muy ligera gracias a su tamaño (≈752 M de parámetros) y a la disponibilidad de cuantizaciones de hasta 2 bits.
- No hay información disponible sobre soporte de tool calling o function calling.
- No hay información disponible sobre capacidades de agente, razonamiento multi-paso o modos de pensamiento explícitos.
- No hay información disponible sobre capacidades de visión, audio o multimodalidad.
- Cobertura multilingüe: únicamente inglés declarado; no se documenta soporte para castellano ni otros idiomas.
- No se documentan capacidades específicas de generación de código ni de matemáticas.

## Casos de uso

- Prototipado local de asistentes conversacionales en inglés: con cuantizaciones Q4_K_M o Q5_K_M (0,6-0,7 GB) el modelo cabe en cualquier GPU de gama baja o incluso puede ejecutarse en CPU, lo que permite iterar sobre prompts y flujos de diálogo sin coste de API.
- Aplicaciones de escritorio o herramientas de línea de comandos con IA integrada: al distribuirse en GGUF, puede embeberse con llama.cpp o llama-cpp-python dentro de una aplicación de escritorio y funcionar sin conexión a internet.
- Despliegue en dispositivos con recursos limitados (edge computing, Raspberry Pi de gama alta con suficiente RAM, mini-PC): el peso de Q4_K_M ronda los 0,6 GB, muy por debajo de lo que exige un modelo de 7B en la misma cuantización.
- Generación de respuestas y borradores en inglés dentro de pipelines de procesado por lotes: al ser un modelo pequeño, el coste por token es mínimo y se pueden procesar volúmenes altos de peticiones en una sola GPU consumer.
- Experimentación académica y educativa: sirve como caso de estudio reproducible de un pipeline LoRA + Unsloth + cuantización GGUF, y para comparar el efecto de las distintas cuantizaciones (Q2_K frente a Q8_0) sobre la calidad de salida.
- Filtrado y preprocesado de datos en inglés: clasificación de texto, reformulación o generación de variaciones de prompts dentro de un pipeline de preparación de datasets, siempre que se valide la calidad caso por caso.
- Pruebas de infraestructura de inferencia: al ser un modelo tan pequeño, es útil para validar configuraciones de llama.cpp, servidores compatibles con OpenAI, gestión de contexto y sistemas de streaming antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los resultados de la búsqueda web incluyen datos de MMLU, HumanEval, GSM8K, MT-Bench u otras evaluaciones, ni del modelo cuantizado ni de su base SZLHOLDINGS/khipu-r3.

## Requisitos de hardware

- VRAM estimada para los pesos (solo el modelo, sin caché KV):
  - f16: aproximadamente 1,5-1,6 GB.
  - Q8_0: aproximadamente 0,9 GB.
  - Q6_K: aproximadamente 0,7 GB.
  - Q5_K_M / Q5_K_S: aproximadamente 0,7 GB.
  - Q4_K_M / Q4_K_S / IQ4_XS: aproximadamente 0,6 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: aproximadamente 0,5-0,6 GB.
  - Q2_K: aproximadamente 0,5 GB.
- A la VRAM de los pesos hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente para las cuantizaciones de 4 bits (GTX 1650, RTX 3050, RTX 4060, GTX 1060 de 6 GB). Las cuantizaciones f16 y Q8_0 caben con holgura en GPUs de 4-6 GB (RTX 3050, RTX 3060). No se requieren A100, H100 ni GPU de centro de datos.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada de los últimos ocho años, y también en iGPU con memoria unificada suficiente.
- Ejecución en CPU: viable y probablemente uno de los escenarios principales; con 0,6-0,9 GB de pesos puede correr en CPU con un rendimiento aceptable para uso interactivo, dependiendo del número de hilos y de la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF mediante un Modelfile), LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con la API de OpenAI que acepten GGUF. vLLM y TGI no consumen GGUF directamente; para esos motores habría que usar el modelo base en formato transformers/safetensors.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y dependerán por completo del hardware y de la longitud de contexto.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para khipu-r3, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas. La comparación se limita a categoría y licencia:

| Modelo | Parámetros | Contexto | Licencia | Rendimiento comparado |
|---|---|---|---|---|
| khipu-r3 (base de este GGUF) | 752.393.024 | no disponible | Apache 2.0 | no disponible |
| Modelos pequeños de la misma franja (por ejemplo, alternativas de 0,5-1,5 B de uso común) | no disponible en la información proporcionada | no disponible | varía según el modelo | no disponible |

Cualquier comparación de calidad exigiría ejecutar evaluaciones propias sobre el modelo, dado que el repositorio no aporta ninguna métrica. Se indica "no disponible" en lugar de estimaciones no verificadas.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: no se especifican arquitectura, contexto, datos de entrenamiento ni proceso de alineación, lo que impide evaluar riesgos de sesgo o de comportamiento del modelo.
- Riesgo de alucinación elevado por el tamaño reducido (≈752 M de parámetros); en modelos de esta franja la tasa de errores factuales suele ser alta y no hay evaluaciones que la cuantifiquen.
- Limitación idiomática: solo se declara inglés. No hay soporte documentado de castellano, lo que descarta su uso en aplicaciones en español sin un ajuste adicional.
- Riesgo de degradación por cuantización: las variantes Q2_K, Q3_K_S y Q3_K_M suelen introducir pérdida de calidad apreciable. El propio cuantizador marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como las opciones rápidas de referencia.
- Longitud de contexto desconocida: no es posible planificar aplicaciones que dependan de ventanas largas (documentos extensos, historiales de conversación prolongados).
- Sin caché ni cuantizaciones ponderadas con imatrix: el cuantizador indica que no hay cuantizaciones de este tipo disponibles, lo que puede penalizar la calidad en los niveles de bits bajos.
- Estado de adopción nulo: 0 descargas y 1 like en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Licencia: Apache 2.0, que en principio permite uso comercial, modificación y redistribución. Aun así, conviene verificar la licencia del modelo base SZLHOLDINGS/khipu-r3, ya que las condiciones de la base podrían imponer restricciones adicionales que la licencia del GGUF no refleja.
- Trazabilidad del ajuste: al tratarse de metadatos de un ajuste LoRA con Unsloth, cualquier uso en producción debería reproducir la configuración de chat (plantilla de prompt, tokens especiales) del modelo base; el repositorio no la documenta.
- Fecha de creación del repositorio fuera de lo habitual: la información proporcionada indica 2026-09-13 como fecha de creación y de última actualización.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/khipu-r3-GGUF
- Modelo base: https://huggingface.co/SZLHOLDINGS/khipu-r3
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#khipu-r3-GGUF
- Preguntas frecuentes y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de archivos GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (gráfico de ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa patrocinadora del cuantizador: https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponible en la información proporcionada.
