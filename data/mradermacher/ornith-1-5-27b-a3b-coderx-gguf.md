# mradermacher/Ornith-1.5-27B-A3B-CoderX-GGUF

## Resumen

Ornith-1.5-27B-A3B-CoderX-GGUF es la versión cuantizada en formato GGUF del modelo Ornith-1.5-27B-A3B-CoderX, publicado por el usuario mradermacher, especializado en generar cuantizaciones estáticas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo original lo desarrolla ManniX-ITA y está orientado a tareas de generación de código, con una arquitectura de mezcla de expertos (MoE) de 26.213.016.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, según indica el sufijo "A3B" del nombre.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo MoE de casi 27.000 millones de parámetros en hardware de consumo, gracias a las cuantizaciones que van desde Q2_K (10,0 GB) hasta Q8_0 (28,0 GB). El modelo base incorpora técnicas de poda de expertos (expert pruning) mediante los métodos REAM y REAP, además de soporte para multi-token prediction (MTP), lo que sugiere un diseño orientado a eficiencia en inferencia.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y el modelo está etiquetado únicamente para inglés. No se dispone de información pública sobre longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con poda de expertos (REAM/REAP) y multi-token prediction (MTP) |
| Parametros totales | 26.213.016.704 (~26,2 B) |
| Parametros activos | ~3 B (según nomenclatura A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 26.213.016.704 parámetros totales y aproximadamente 3.000 millones activos por token, según la convención de nombres "A3B". Las etiquetas del repositorio indican el uso de técnicas de poda de expertos basadas en REAM (Router-weighted Expert Activation Pruning) y REAP (Router-weighted Expert Activation Pruning), métodos que eliminan expertos redundantes de un MoE preentrenado para reducir el número total de parámetros manteniendo el rendimiento. También se menciona multi-token prediction (MTP), una técnica de entrenamiento que permite al modelo predecir varios tokens futuros simultáneamente, lo que puede acelerar la decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card del repositorio cuantizado no incluye detalles sobre el proceso de entrenamiento del modelo original; únicamente referencia el modelo base ManniX-ITA/Ornith-1.5-27B-A3B-CoderX. Las cuantizaciones son estáticas (sin imatrix ni pesos ponderados), generadas con la herramienta de mradermacher y verificadas con convert_type hf y output_tensor_quantised.

## Capacidades

- Generación de código: el modelo está etiquetado como "code" y su nombre incluye "CoderX", lo que indica especialización en tareas de programación.
- Razonamiento multi-paso: la arquitectura MoE con MTP sugiere capacidad para decodificación especulativa y razonamiento iterativo, aunque no se detalla en la documentación.
- Conversación multi-turno: la etiqueta "conversational" indica soporte para diálogos.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integración con APIs de inferencia estándar.
- Multilingüismo: limitado a inglés según la etiqueta de idioma.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Visión o audio: no disponible; el modelo no incluye etiquetas multimodales.

## Casos de uso

- Asistencia en programación dentro del IDE: el modelo puede autocompletar y generar fragmentos de código en inglés, integrándose mediante llama.cpp u Ollama en extensiones de editor; su tamaño MoE de ~3 B activos permite latencias bajas en GPU de consumo.
- Generación de tests unitarios: dado un fragmento de código, el modelo puede producir casos de prueba en Python, Java o JavaScript, aprovechando su especialización en código y su licencia Apache 2.0 para uso en pipelines de CI/CD.
- Refactorización asistida: con cuantización Q4_K_M (16,2 GB), puede ejecutarse en una RTX 4090 de 24 GB y emplearse para reescribir funciones, renombrar variables y aplicar patrones de diseño en bases de código medianas.
- Chatbot técnico de documentación: la etiqueta "conversational" permite desplegar un asistente que responda preguntas sobre APIs y librerías en inglés, con contexto multi-turno, usando vLLM o llama.cpp server.
- Generación de scripts de automatización: el modelo puede producir scripts de shell, Python o PowerShell para tareas de DevOps, con la ventaja de que su licencia Apache 2.0 no impone restricciones de atribución en productos comerciales.
- Prototipado rápido en local: con la cuantización Q2_K (10,0 GB), cabe en GPUs de 12 GB como la RTX 3060, permitiendo a desarrolladores individuales experimentar con un MoE de 27 B sin infraestructura cloud.
- Evaluación de calidad de cuantizaciones: investigadores pueden comparar las 11 variantes GGUF publicadas para medir la degradación de perplejidad y la calidad de generación de código según el nivel de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,0 GB
  - Q3_K_S: ~11,6 GB
  - Q3_K_M: ~12,8 GB
  - Q3_K_L: ~13,8 GB
  - IQ4_XS: ~14,5 GB
  - Q4_K_S: ~15,2 GB
  - Q4_K_M: ~16,2 GB
  - Q5_K_S: ~18,3 GB
  - Q5_K_M: ~18,8 GB
  - Q6_K: ~21,7 GB
  - Q8_0: ~28,0 GB
- GPU recomendadas:
  - RTX 3060 12 GB / RTX 4060 Ti 16 GB: Q2_K a Q4_K_S con contexto moderado.
  - RTX 4090 24 GB: Q4_K_M a Q6_K con contexto amplio.
  - A100 40 GB / H100 80 GB: Q8_0 o FP16 del modelo base con contexto largo.
- Cabe en GPU de consumo: sí, desde Q2_K en 12 GB hasta Q6_K en 24 GB; Q8_0 requiere 32 GB o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (para el modelo base en safetensors), TGI (modelo base).
- Latencia y throughput: no disponible; al ser un MoE con ~3 B activos, se espera un throughput superior al de un modelo denso de 27 B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-27B-A3B-CoderX (este) | ~26,2 B | ~3 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-Coder-32B | 32,5 B | 32,5 B (denso) | 128 K (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite | 15,7 B | 2,4 B | 128 K (según documentación pública de DeepSeek) | DeepSeek License | safetensors, GGUF |
| CodeLlama-34B | 33,7 B | 33,7 B (denso) | 16 K (según documentación pública de Meta) | Llama 2 Community | safetensors, GGUF |

La comparativa se basa en datos públicos de los modelos alternativos; los datos de Ornith provienen únicamente de la información del repositorio. No se dispone de benchmarks comparativos para Ornith-1.5-27B-A3B-CoderX.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: se desconoce la longitud máxima de contexto; no se debe asumir soporte para ventanas largas sin verificación empírica.
- Alucinación: no hay datos publicados sobre tasas de alucinación en generación de código; se recomienda validación humana en producción.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado principalmente con datos en inglés, puede reflejar sesgos culturales y lingüísticos de esos datos.
- Cuantización: las versiones Q2_K y Q3_K_M presentan degradación de calidad según la propia model card (Q3_K_M marcada como "lower quality"); para producción se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero se debe conservar el aviso de licencia y atribución.
- Procedencia: el modelo es una cuantización de terceros (mradermacher) del modelo de ManniX-ITA; la responsabilidad sobre el entrenamiento y los datos originales recae en el autor del modelo base.
- Sin garantías: al igual que la mayoría de modelos abiertos, se distribuye "tal cual", sin garantías de idoneidad para un propósito concreto.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/Ornith-1.5-27B-A3B-CoderX-GGUF
- Modelo base: https://huggingface.co/ManniX-ITA/Ornith-1.5-27B-A3B-CoderX
- Página de descargas de mradermacher: https://hf.tst.eu/model#Ornith-1.5-27B-A3B-CoderX-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher: https://www.nethype.de/
