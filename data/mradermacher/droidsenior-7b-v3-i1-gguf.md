# mradermacher/DroidSenior-7B-v3-i1-GGUF

## Resumen

DroidSenior-7B-v3-i1-GGUF es la versión cuantizada en formato GGUF del modelo DroidSenior-7B-v3, desarrollado originalmente por el usuario celebibasar y convertido por mradermacher, un perfil conocido en Hugging Face por publicar cuantizaciones sistemáticas de modelos abiertos. El modelo base cuenta con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y está orientado a uso conversacional, según las etiquetas del repositorio.

La relevancia de esta ficha radica en que se trata de una publicación muy reciente (creada el 6 de noviembre de 2026) y con cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto prácticamente sin adopción ni validación por parte de la comunidad. La model card es mínima: solo indica que se trata de cuantizaciones ponderadas con imatrix del modelo original, sin aportar información sobre arquitectura, datos de entrenamiento, licencia o idiomas.

Al no disponer de documentación técnica del modelo base ni de resultados de evaluación, esta ficha se limita a describir lo que puede verificarse objetivamente: el tamaño, el formato de pesos, el conjunto de cuantizaciones disponibles y las implicaciones prácticas de desplegar un modelo de 7,6 B en GGUF. Cualquier dato no confirmado se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, sin confirmar) |
| Parámetros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado con llama.cpp, generado con imatrix) |
| Tamaño del repositorio | 6,6 GB |
| Versión de cuantización | 2 (quantize_version: 2) |
| Tipo de conversión | hf (convert_type: hf) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base DroidSenior-7B-v3. Por el nombre y el tamaño (7,6 B de parámetros) es plausible que se trate de un transformer decoder-only de la familia de modelos de 7-8 B, pero no hay confirmación en la información proporcionada. Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

Lo único verificable técnicamente es el proceso de cuantización: mradermacher ha generado las cuantizaciones con pesos ponderados mediante imatrix (importance matrix), una técnica de llama.cpp que calcula la importancia de cada tensor usando un corpus de calibración para reducir la pérdida de calidad en cuantizaciones agresivas (especialmente en el rango Q2 e IQ). El repositorio incluye 24 variantes de cuantización, desde IQ1_S (la más agresiva) hasta Q6_K (la de mayor fidelidad), lo que permite ajustar el equilibrio entre tamaño y calidad. No se indica qué corpus de calibración se usó ni si se conserva el tokenizador original.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio sugiere un ajuste orientado a diálogo multi-turno, aunque no hay detalles sobre el formato de prompt ni sobre la plantilla de chat.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el artefacto puede servirse a través de la infraestructura de Inference Endpoints de Hugging Face.
- Ejecución local en CPU/GPU: al estar en GGUF, es compatible con llama.cpp y derivados (Ollama, LM Studio, text-generation-webui, koboldcpp).
- Razonamiento, código, matemáticas, visión, audio, tool calling, agentes y modo thinking: no disponible; no hay evidencia documentada de ninguna de estas capacidades.
- Capacidades multilingües: no disponible; no se especifican idiomas en la model card ni en los metadatos.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: las variantes Q4_K_M o Q5_K_M (en torno a 4,5-5,5 GB) permiten ejecutar el modelo en CPU con llama.cpp en equipos con 16 GB de RAM, útil para prototipos de chat sin conexión.
- Experimentación con cuantizaciones agresivas: la disponibilidad de IQ1_S, IQ1_M e IQ2_XXS permite estudiar la degradación de calidad de un modelo de 7,6 B en entornos con memoria muy limitada (por ejemplo, dispositivos embebidos o contenedores de 2-3 GB).
- Integración en pipelines de generación de texto por lotes: mediante la API de llama.cpp o servidores compatibles con OpenAI, se puede usar para tareas de resumen o reescritura donde no se requiera una calidad de referencia.
- Evaluación comparativa de cuantizaciones: el conjunto de 24 variantes facilita medir empíricamente la relación entre bits por peso y perplejidad en un mismo modelo base.
- Chat de asistencia en entornos air-gapped: al ser un artefacto local sin dependencias de API, puede desplegarse en redes aisladas para conversación interna, siempre que se valide previamente su calidad.
- Base para fine-tuning o destilación: los pesos GGUF no son ideales para entrenamiento, pero el modelo original en safetensors (referenciado en la model card) podría servir de punto de partida para ajustes posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, perplejidad ni comparaciones con otros modelos en la model card ni en los resultados de búsqueda. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según cuantización, aproximada a partir de 7,6 B de parámetros):
  - IQ1_S / IQ1_M: ~2,0-2,5 GB
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: ~2,5-3,5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ3_*: ~3,5-4,5 GB
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / IQ4_NL: ~4,5-5,5 GB
  - Q5_K_S / Q5_K_M: ~5,5-6,0 GB
  - Q6_K: ~6,5-7,0 GB
- GPU recomendadas: no disponible en la documentación; por tamaño, una RTX 3060 de 12 GB o superior puede alojar cualquier variante hasta Q6_K con contexto moderado. Una RTX 4090 (24 GB) permite contexto largo y mayor paralelismo.
- ¿Cabe en GPU de consumo? Sí: cualquier variante Q4 o inferior cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070), y las variantes Q5/Q6 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp, servidores compatibles con la API de OpenAI (llama-cpp-python, llama-server). No se ha confirmado compatibilidad con vLLM o TGI, que suelen requerir safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa rigurosa, ya que se desconoce la arquitectura, la licencia y el rendimiento del modelo base. A modo orientativo por tamaño y formato:

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DroidSenior-7B-v3-i1-GGUF | 7,6 B | no disponible | no disponible | GGUF | Hugging Face (0 descargas) |
| Mistral-7B-Instruct (GGUF) | 7,2 B | 32k (v0.2/v0.3) | Apache 2.0 | GGUF, safetensors | Amplia, muy validada |
| Llama-3.1-8B-Instruct (GGUF) | 8,0 B | 128k | Llama 3.1 Community | GGUF, safetensors | Amplia, muy validada |
| Qwen2.5-7B-Instruct (GGUF) | 7,6 B | 32k (128k en Turbo) | Apache 2.0 | GGUF, safetensors | Amplia, muy validada |

La comparación con estos modelos solo es válida en términos de tamaño y formato; no se dispone de datos para comparar calidad, contexto o licencia del modelo DroidSenior.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card sustantiva, ni paper, ni ficha técnica del modelo base; se desconoce la arquitectura exacta, el tokenizador, la plantilla de chat y el contexto máximo.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido; en producción esto es un bloqueo legal potencial.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que el modelo haya sido evaluado por terceros.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje de 7,6 B sin evaluación publicada; no hay datos de calibración ni de tasas de error.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Idiomas no confirmados: no se especifica qué lenguas soporta; el uso en castellano no está garantizado.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 pueden degradar notablemente la coherencia; solo deberían usarse cuando la restricción de memoria sea crítica.
- Formato GGUF: no apto para fine-tuning directo ni para servir con vLLM/TGI sin conversión previa a safetensors.
- Fecha de creación futura en los metadatos (2026-11-06): conviene verificar la integridad y procedencia del repositorio antes de usarlo en cualquier entorno.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DroidSenior-7B-v3-i1-GGUF
- Modelo base: https://huggingface.co/celebibasar/DroidSenior-7B-v3
- Versión GGUF previa del mismo autor: https://huggingface.co/mradermacher/DroidSenior-7B-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
