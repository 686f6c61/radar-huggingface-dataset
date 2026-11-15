# LuffyTheFox/DeepSeek-V4.1-Flash-1017-Uncensored-Genesis

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-Genesis es una edicion no censurada del checkpoint DeepSeek-V4.1-Flash-1017, publicada por el desarrollador independiente LuffyTheFox bajo el paraguas del proyecto Genesis. Se distribuye como un modelo de generacion de texto con arquitectura Mixture-of-Experts (MoE) en formato FP8, con un tamano de repositorio de 206,7 GB en safetensors y compatibilidad con la libreria transformers. El modelo base pertenece a la familia DeepSeek-V4.1 de DeepSeek; esta variante no ha sido reentrenada ni ajustada con gradientes, sino modificada mediante una edicion cerrada de pesos.

El objetivo declarado es eliminar el comportamiento de rechazo (refusal) del modelo base para facilitar investigacion de seguridad y ejercicios de red-team. Segun la model card, los 384 expertos enrutados del MoE se dejan intactos, de modo que la capacidad de conocimiento y razonamiento se mantiene practicamente igual a la del modelo original. La licencia es MIT.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de edicion de pesos sin entrenamiento aplicada a un MoE de gran tamano; por otro, advierte de que se trata de un modelo deliberadamente no censurado, pensado para uso privado en investigacion autorizada y no para despliegue publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), familia DeepSeek-V4.1; detalles de capas y atencion no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la model card menciona 384 expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | checkpoint nativo en FP8; el proyecto Genesis trabaja habitualmente en GGUF, pero no se confirma para este repo |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de la familia DeepSeek-V4.1, en su release 1017. La model card cita explicitamente 384 expertos enrutados, pero no detalla el numero total de parametros, los parametros activos por token, la longitud de contexto ni la composicion del dataset de entrenamiento original. Tampoco se documentan fases de RLHF o DPO del modelo base en la informacion proporcionada.

La innovacion tecnica de esta variante no esta en el entrenamiento, sino en el post-procesado. Segun el autor, el comportamiento de rechazo se elimina mediante una edicion cerrada de pesos (closed-form weight edit) fusionada en el checkpoint FP8 nativo, sin fine-tuning ni entrenamiento por gradientes. El proyecto Genesis describe ademas un procedimiento de calibracion orientado a reducir ruido en tensores: escaneo de tensores `ssm_conv1d`, reemplazo de bloques degenerados y reduccion de ruido mediante SVD basado en la distribucion de Marchenko-Pastur, excluyendo `token_embd.weight`, `output.weight`, tensores 1D, bias y normas. No se especifica si ese procedimiento completo se aplico a este checkpoint concreto o solo la edicion de rechazo.

## Capacidades

- Generacion de texto y razonamiento general, con rendimiento declarado cercano al modelo base en MMLU y MMLU-Pro.
- Razonamiento matematico y resolucion de problemas paso a paso (evaluado en GSM8K).
- Razonamiento cientifico de nivel avanzado (evaluado en GPQA-Diamond).
- Respuesta a instrucciones sin mecanismos de rechazo: cumple solicitudes que el modelo base declinaria.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.
- Modo thinking o razonamiento extendido: la evaluacion incluye variantes "reasoning", lo que sugiere soporte de razonamiento extendido en el base, aunque no se detalla.

## Casos de uso

- Investigacion de seguridad y red-teaming: el modelo permite estudiar comportamientos de cumplimiento ante peticiones dañinas en entornos controlados, comparando respuestas con el modelo base emparejado sobre los mismos prompts.
- Evaluacion de tecnicas de alineacion: sirve como contraste para medir la eficacia de mecanismos de rechazo, ya que la unica diferencia respecto al base es la edicion de pesos que los elimina.
- Analisis de robustez de filtros de contenido: permite probar clasificadores y guardrails externos frente a un modelo que no se autocensura, verificando si las capas de seguridad del despliegue son suficientes.
- Estudio de edicion de pesos en MoE: al mantener intactos los 384 expertos enrutados, es un caso de referencia para investigar como una modificacion localizada afecta al comportamiento global sin reentrenar.
- Benchmarking de preservacion de capacidad: util para replicar la comparacion MMLU, MMLU-Pro, GPQA-Diamond y GSM8K entre base y variante editada con el mismo harness.
- Experimentacion local en investigacion academica: con licencia MIT y formato transformers, puede cargarse en infraestructura propia para estudios que requieran inspeccion de pesos FP8.

## Benchmarks y rendimiento

Datos declarados por el autor, evaluados con el mismo harness y prompts emparejados contra el modelo base:

| Benchmark | Base | Este modelo |
|---|---:|---:|
| MMLU (14.042, test completo) | 88,22 % | 87,91 % |
| MMLU-Pro (4.000 muestras) | 69,90 % | 69,42 % |
| MMLU-Pro (300 muestras, reasoning) | 85,7 % | 84,7 % |
| GPQA-Diamond (198, reasoning) | 81,3 % | 84,8 % |
| GSM8K (step-by-step) | no disponible (truncado en la model card) | no disponible (truncado en la model card) |

No se han publicado en la informacion disponible resultados de HumanEval ni de otros benchmarks de codigo, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 206,7 GB en safetensors FP8, por lo que la inferencia requiere al menos ese orden de magnitud de memoria, mas overhead de activaciones y cache KV. No se dispone de cifra exacta.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el checkpoint FP8 excede claramente GPUs de consumo individuales.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en configuraciones consumer tipicas en FP8; requeriria cuantizacion adicional a GGUF de baja precision, no confirmada para este repo.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base) | no disponible (MoE, 384 expertos enrutados) | no disponible | no disponible en esta ficha | Modelo original con rechazo activo |
| DeepSeek-V4.1-Flash-1017-Uncensored-Genesis | no disponible (mismos 384 expertos) | no disponible | MIT | Edicion cerrada de pesos, sin fine-tuning; capacidad casi identica al base |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo deliberadamente no censurado: cumple solicitudes dañinas. El autor lo restringe a investigacion de seguridad autorizada y recomienda mantenerlo privado y no servirlo publicamente.
- Riesgo elevado de uso indebido: la responsabilidad legal y etica del despliegue recae integramente en el usuario.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el autor menciona que el ruido en tensores se asocia a inestabilidad y alucinaciones, pero no aporta metricas de este checkpoint.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingue.
- Contexto: longitud no disponible, lo que impide planificar cargas de contexto largo con precision.
- Restricciones de licencia: MIT permite uso comercial, pero el propio autor desaconseja el despliegue publico por motivos de seguridad; conviene revisar implicaciones legales segun jurisdiccion.
- Procedencia: modelo publicado por un autor independiente con 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de los benchmarks declarados.
- La model card esta marcada como "Coming soon" y contiene secciones truncadas (por ejemplo, GSM8K), lo que reduce la fiabilidad de la documentacion.
- No se confirma soporte de tool calling, agentes ni cuantizaciones GGUF para este checkpoint concreto.

## Enlaces

- Hugging Face: https://huggingface.co/LuffyTheFox/DeepSeek-V4.1-Flash-1017-Uncensored-Genesis
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Distribucion de Marchenko-Pastur (referencia citada por el autor): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
- Contacto del autor: luffythefox@mail.ru, azakharchenko92@gmail.com
- Telegram del autor: @LuffyTheFox
