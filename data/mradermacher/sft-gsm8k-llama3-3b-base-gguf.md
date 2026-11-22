# mradermacher/sft-gsm8k-llama3-3b-base-GGUF

## Resumen

`sft-gsm8k-llama3-3b-base-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `ankner/sft-gsm8k-llama3-3b-base`, publicadas por el usuario mradermacher. El modelo subyacente es un ajuste fino supervisado (SFT) sobre una base Llama 3 de 3B parámetros, especializado en la resolución de problemas matemáticos de tipo GSM8K, el conocido conjunto de problemas aritméticos de varios pasos. Con 3.212.749.888 parámetros totales, se sitúa en la gama baja de tamaño, lo que lo hace apto para despliegue en hardware de consumo.

El interés práctico de esta ficha reside en la disponibilidad de cuantizaciones GGUF de 1,5 GB (Q2_K) hasta 6,5 GB (f16), lo que permite ejecutar el modelo en CPU o en GPUs de gama media con llama.cpp y derivados. Al tratarse de una cuantización estática sin imatrix (según indica el propio autor), la calidad en los niveles bajos puede degradarse más que en cuantizaciones ponderadas.

No se dispone de información publicada sobre la licencia, la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks del modelo base. Esta ficha documenta exclusivamente lo verificable a partir de los metadatos y la model card proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3, segun el nombre del modelo base) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en formato transformers/safetensors |
| Tamano del repo | 29,3 GB (conjunto completo de cuantizaciones) |
| Modelo base | ankner/sft-gsm8k-llama3-3b-base |
| Cuantizador | mradermacher |
| Fecha de creacion | 2025-03-03 |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente es un transformer decoder-only de tipo Llama 3 con aproximadamente 3.200 millones de parámetros, según se deduce del nombre del modelo base y del recuento de parámetros en safetensors. El modelo base `ankner/sft-gsm8k-llama3-3b-base` ha sido sometido a un ajuste fino supervisado (SFT) orientado al conjunto GSM8K, lo que sugiere un entrenamiento centrado en la resolución de problemas aritméticos de varios pasos con razonamiento explícito. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

Las cuantizaciones publicadas por mradermacher son estáticas (sin imatrix ni ponderación por importancia), según declara el propio autor en la model card. Esto implica que, si bien se ofrecen todos los niveles habituales de cuantización K-quant, los niveles bajos (Q2_K, Q3_K) pueden presentar una degradación de perplejidad mayor que sus equivalentes ponderados. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, con especialización en razonamiento matemático de tipo GSM8K (problemas aritméticos de varios pasos).
- Resolución de problemas de matemáticas escolares con cadenas de razonamiento paso a paso.
- Conversación multi-turno (el tag `conversational` aparece en los metadatos del repositorio).
- Inferencia en CPU y GPU mediante llama.cpp y ecosistema GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües limitadas: solo se declara inglés.

## Casos de uso

- Evaluación de cuantizaciones GGUF: el repositorio ofrece doce niveles de cuantización del mismo modelo, lo que permite medir empíricamente la degradación de precisión en tareas matemáticas al reducir el número de bits por peso.
- Despliegue en hardware de consumo: con Q4_K_M (2,1 GB) el modelo cabe en GPUs integradas o en CPU con 8 GB de RAM, permitiendo experimentar con razonamiento matemático sin infraestructura dedicada.
- Prototipado de tutores matemáticos: al estar ajustado sobre GSM8K, puede servir como base para un asistente que explique la resolución paso a paso de problemas aritméticos en inglés, antes de invertir en modelos mayores.
- Pruebas de pipelines llama.cpp/Ollama: útil como modelo ligero de referencia para validar integraciones de inferencia local en CI, dado su reducido tamaño y su formato GGUF estándar.
- Investigación sobre SFT en dominios específicos: permite comparar el comportamiento de un modelo de 3B ajustado solo en GSM8K frente a su base, para estudiar el olvido catastrófico y la transferencia de capacidades.
- Generación de datasets sintéticos de problemas matemáticos: puede utilizarse para producir soluciones paso a paso que luego se filtren y revisen, aprovechando su bajo coste de inferencia.
- Educación e investigación docente: ejecutable en un portátil para demostrar cómo un modelo pequeño aborda problemas de aritmética, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,5 GB (Q2_K), 2,1 GB (Q4_K_M), 2,7 GB (Q6_K), 3,5 GB (Q8_0) y 6,5 GB (f16), a los que hay que sumar el espacio para el contexto KV-cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar Q4_K_M; una RTX 3060, RTX 4060 o superior permite Q8_0 con holgura. En A100/H100 el modelo está sobredimensionado en cuanto a capacidad y el cuello de botella será el ancho de banda, no la VRAM.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas con 4 GB o más, y también en CPU con 8 GB de RAM usando Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints, aunque no se detalla.
- Latencia y throughput: no disponibles. Al ser un modelo de 3B en GGUF, se espera un throughput alto en GPU (decenas de tokens por segundo) y moderado en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| sft-gsm8k-llama3-3b-base (este) | 3,21B | no disponible | GSM8K / matematicas | no disponible | GGUF, safetensors |
| Llama 3.2 3B Instruct | 3,21B | 128K (segun Meta) | proposito general | Llama 3.2 Community License | GGUF, safetensors |
| Qwen2.5-Math-1.5B | 1,54B | 32K (segun Qwen) | matematicas | Apache 2.0 (segun Qwen) | safetensors, GGUF |
| Phi-3-mini (3.8B) | 3,82B | 4K/128K (segun Microsoft) | proposito general | MIT (segun Microsoft) | GGUF, safetensors |

Nota: los datos de los modelos comparativos provienen de conocimiento general y no de la informacion proporcionada en esta busqueda; se incluyen solo como referencia orientativa. No se dispone de comparaciones de rendimiento verificadas entre este modelo y las alternativas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base `ankner/sft-gsm8k-llama3-3b-base` y, en su caso, la licencia de Llama 3 antes de cualquier despliegue en producción.
- Especialización estrecha: el ajuste SFT sobre GSM8K puede degradar capacidades generales (olvido catastrófico) y no garantiza buen rendimiento fuera de problemas aritméticos de ese estilo.
- Solo inglés: no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinación en pasos intermedios: los modelos pequeños ajustados en matemáticas pueden producir cadenas de razonamiento plausibles pero incorrectas, especialmente en cuantizaciones bajas.
- Cuantizaciones estáticas sin imatrix: el autor advierte de que no hay cuantizaciones ponderadas, por lo que Q2_K y Q3_K pueden perder calidad de forma notable en tareas matemáticas sensibles a la precisión.
- Longitud de contexto desconocida: no se puede asumir la ventana de 8K de Llama 3 sin confirmación; conviene validarla empíricamente.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión en GSM8K para este ajuste ni para sus cuantizaciones.
- Repositorio con pocas descargas (107) y un solo like: ecosistema de validación muy limitado; no se recomienda como dependencia crítica sin evaluación propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sft-gsm8k-llama3-3b-base-GGUF
- Modelo base: https://huggingface.co/ankner/sft-gsm8k-llama3-3b-base
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#sft-gsm8k-llama3-3b-base-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion (mradermacher): https://huggingface.co/mradermacher/model_requests
