# mradermacher/Nyaya-1.5B-GGUF

## Resumen

Nyaya-1.5B-GGUF es la versión cuantizada en formato GGUF del modelo Nyaya-1.5B, un modelo de lenguaje especializado en derecho penal indio desarrollado originalmente por NamanAnand66 y cuantizado por mradermacher. El modelo parte de una base Qwen2.5 de 1.500 millones de parámetros aproximadamente (1.543.714.304 parámetros reales según los pesos en safetensors) y ha sido adaptado mediante QLoRA y ajuste por instrucciones sobre un corpus de preguntas y respuestas legales centrado en el Bharatiya Nyaya Sanhita (BNS), el Bharatiya Nagarik Suraksha Sanhita (BNSS) y el Bharatiya Sakshya Adhiniyam (BSA), el nuevo marco penal indio que sustituyó al Código Penal de la India.

La relevancia de este modelo radica en su especialización vertical: en lugar de competir en capacidades generales con modelos de mayor tamaño, se enfoca en responder consultas sobre legislación penal india con un coste computacional muy bajo, lo que permite desplegarlo en hardware de consumo. La versión GGUF facilita su uso con llama.cpp, Ollama y otros runners compatibles, sin necesidad de GPU de gama alta.

El repositorio incluye 12 cuantizaciones estáticas que van desde Q2_K (0,8 GB) hasta f16 (3,2 GB), lo que cubre un amplio espectro de compromisos entre calidad y requisitos de memoria. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, si bien la naturaleza legal del dominio exige precaución en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5) |
| Parámetros totales | 1.543.714.304 (aproximadamente 1,5 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es una adaptación de Qwen2.5 de 1,5 B parámetros, una arquitectura transformer decoder-only con atención causal estándar. Sobre esa base se aplicó un proceso de adaptación de dominio mediante QLoRA (cuantización de 4 bits más adaptadores de bajo rango) y posterior ajuste por instrucciones, según indican las etiquetas del repositorio (`qlora`, `unsloth`, `domain-adaptation`, `instruction-tuning`). El dataset empleado es `GSMS-B/Indian-Legal-QA-BNS-BNSS-BSA`, un corpus de pares pregunta-respuesta sobre las tres nuevas leyes penales indias.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas adicionales más allá de las propias de Qwen2.5. La cuantización fue realizada por mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1), generando cuantizaciones estáticas; no hay cuantizaciones ponderadas/imatrix disponibles según la model card.

## Capacidades

- Generación de texto y respuesta a preguntas en el dominio del derecho penal indio (BNS, BNSS, BSA).
- Respuesta conversacional de un solo turno o multi-turno básico, con formato de chat compatible con transformers.
- Comprensión de consultas sobre procedimiento penal, evidencias y tipificación de delitos según la legislación india.
- Capacidad multilingüe limitada: el modelo declara únicamente inglés (`en`), aunque al derivar de Qwen2.5 conserva parte del multilingüismo del modelo base, no garantizado por el autor.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explícito (thinking mode).
- No se documenta capacidad de visión, audio ni agentes multi-paso.
- Al ser un modelo de 1,5 B, sus capacidades de razonamiento general, código y matemáticas son las heredadas de Qwen2.5-1.5B, no reforzadas por el ajuste.

## Casos de uso

- Asistencia legal de primera línea: responder consultas frecuentes sobre procedimientos bajo el BNS y el BNSS en inglés, con un modelo ligero que puede ejecutarse en local sin enviar datos sensibles a la nube.
- Herramienta de consulta para estudiantes de derecho: repaso de definiciones, secciones y diferencias entre el antiguo Código Penal indio y el nuevo BNS, aprovechando el ajuste específico sobre el dataset de QA legal.
- Soporte a despachos pequeños: borradores de respuestas y resúmenes de conceptos legales, con revisión humana obligatoria dado el riesgo de alucinación.
- Despliegue en entornos con hardware limitado: al caber en cuantización Q4_K_M en torno a 1,1 GB, puede ejecutarse en portátiles y mini-PC con CPU, útil para demos y prototipos.
- Filtrado y clasificación de consultas legales: primera capa de triaje en un sistema de atención ciudadana que derive casos complejos a un modelo mayor o a un profesional.
- Investigación académica sobre adaptación de dominio: ejemplo reproducible de fine-tuning QLoRA sobre una base Qwen2.5-1.5B para un dominio vertical, útil para estudiar el efecto de la especialización en modelos pequeños.
- Integración en pipelines RAG: el modelo puede actuar como generador final en un sistema de recuperación aumentada sobre textos legales, donde la recuperación aporta las secciones exactas y el modelo redacta la respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, incluyendo overhead de contexto):
  - Q2_K: aproximadamente 1,0-1,3 GB.
  - Q4_K_M: aproximadamente 1,3-1,8 GB.
  - Q8_0: aproximadamente 2,0-2,5 GB.
  - f16: aproximadamente 3,5-4,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para f16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. El modelo es viable incluso en iGPU con memoria unificada.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 4 GB o más; en cuantizaciones Q4 también en CPU pura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, aunque la versión GGUF está pensada para llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (1,5 B) se espera un throughput alto en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Nyaya-1.5B-GGUF | ~1,5 B | no disponible | Derecho penal indio (BNS/BNSS/BSA) | Apache 2.0 | GGUF |
| Qwen2.5-1.5B-Instruct | ~1,5 B | no disponible en esta ficha | Generalista, multilingüe | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | ~1,2 B | no disponible en esta ficha | Generalista, multilingüe | Llama 3.2 Community License | safetensors, GGUF |
| Gemma-2-2B-IT | ~2,6 B | no disponible en esta ficha | Generalista, multilingüe | Gemma Terms of Use | safetensors, GGUF |

La ventaja diferencial de Nyaya-1.5B frente a los generalistas del mismo rango es su ajuste específico sobre legislación penal india; su desventaja es la ausencia de benchmarks publicados que cuantifiquen esa mejora y su limitación al inglés. Los datos de contexto de los modelos comparables no se incluyen aquí por no estar disponibles en la información proporcionada.

## Limitaciones y advertencias

- Riesgo elevado de alucinación en materia legal: un modelo de 1,5 B puede citar secciones, números o artículos inexistentes; toda salida debe verificarse contra el texto oficial.
- Sesgos heredados del modelo base Qwen2.5 y del dataset de QA legal, cuya composición y calidad no están documentadas.
- Idioma limitado al inglés: no se garantiza un rendimiento aceptable en hindi ni en otras lenguas indias, a pesar de que la legislación afecta a hablantes de múltiples idiomas.
- Longitud de contexto no documentada; no se recomienda su uso en conversaciones largas o documentos extensos sin verificar el límite real.
- No apto como asesoramiento legal: el uso en producción debe ir acompañado de revisión por profesionales y de avisos claros al usuario.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la fidelidad; para uso legal se recomienda Q6_K o Q8_0 como mínimo.
- No hay cuantizaciones ponderadas/imatrix disponibles, lo que limita la optimización de calidad por tamaño.
- Licencia Apache 2.0 permite uso comercial, pero no exime de responsabilidad sobre el contenido generado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nyaya-1.5B-GGUF
- Modelo base: https://huggingface.co/NamanAnand66/Nyaya-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/GSMS-B/Indian-Legal-QA-BNS-BNSS-BSA
- Página de descargas del cuantizador: https://hf.tst.eu/model#Nyaya-1.5B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
