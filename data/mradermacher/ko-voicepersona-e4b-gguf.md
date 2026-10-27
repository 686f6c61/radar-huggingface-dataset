# mradermacher/KO-VoicePersona-E4B-GGUF

## Resumen

KO-VoicePersona-E4B-GGUF es la versión cuantizada en formato GGUF del modelo ThakiCloud/KO-VoicePersona-E4B, un ajuste LoRA orientado a asistentes de voz en coreano con persona definida, etiquetado por su autor como "research preview". El trabajo de cuantización lo firma mradermacher, un tercero especializado en generar ficheros GGUF estáticos de modelos publicados por otros equipos, de modo que este repositorio no contiene el entrenamiento original sino los pesos convertidos y cuantizados listos para llama.cpp y derivados.

El modelo base suma 7.518.069.290 parámetros según los safetensors publicados (unos 7,5 mil millones) y las etiquetas del repositorio lo sitúan en la familia Gemma 4 con componentes Nemotron, adaptado mediante LoRA y pensado para ejecución on-device. El repositorio incluye además ficheros `mmproj` (proyector multimodal) de 0,7 GB y 1,1 GB, lo que confirma que el modelo base admite entradas multimodales, aunque la model card no detalla qué modalidad exacta cubre.

Su relevancia es acotada pero concreta: cubre un hueco poco poblado, el de asistentes conversacionales de voz en coreano con soporte de tool calling y salidas "tts-friendly", distribuidos en cuantizaciones que van de 4,5 GB a 15,2 GB y por tanto desplegables en GPU de consumo. La contrapartida es la ausencia total de documentación técnica publicada: no hay longitud de contexto declarada, ni datos de entrenamiento, ni benchmarks, y el repositorio registra cero descargas y cero "likes" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con adaptador LoRA sobre el modelo base; las etiquetas del autor mencionan "gemma4" y "nemotron", sin detalle arquitectónico publicado |
| Parámetros totales | 7.518.069.290 (según safetensors del modelo base) |
| Parámetros activos | No disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyectores multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Coreano (ko) |
| Licencia | openmdw-1.1 (el campo `license` del repo indica "other" con enlace a openmdw.ai) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |
| Tamaño del repositorio | 76,9 GB (incluye todas las cuantizaciones y proyectores) |
| Cuantizaciones con imatrix | No disponibles; solo cuantizaciones estáticas |
| Fecha de publicación en HuggingFace | 2026-10-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura interna. Lo que se sabe con certeza es que este repositorio es una conversión a GGUF de un modelo que el autor original distribuyó como adaptador LoRA sobre una base etiquetada como "gemma4" y "nemotron", y que la suma de pesos publicada asciende a 7.518.069.290 parámetros. El sufijo "E4B" del nombre sigue la convención de la familia Gemma 3n/4 para variantes con parámetros efectivos reducidos, pero la model card no desglosa cuántos parámetros son efectivos frente a totales, por lo que ese dato debe considerarse no disponible. Tampoco se documenta si hay mezcla de expertos, atención lineal o decodificación especulativa.

No hay datos sobre composición del corpus de entrenamiento, número de tokens, idioma de los datos más allá del coreano declarado, ni sobre las etapas de alineación (RLHF, DPO u otras). Las etiquetas sí indican dos rasgos de diseño relevantes: soporte de tool calling y formato de salida "tts-friendly", es decir, respuestas preparadas para ser sintetizadas por un motor de texto a voz sin limpieza posterior. La presencia de proyectores `mmproj` en el repositorio implica que el modelo base acepta entradas multimodales además de texto. La cuantización la realiza mradermacher con conversión de tipo "hf" y cuantización de tensores de salida, sin versión imatrix en el momento de publicar.

## Capacidades

- Generación de texto conversacional en coreano con una persona definida y estilo consistente, según la etiqueta "persona" del repositorio.
- Soporte de tool calling / function calling, declarado explícitamente en las etiquetas del autor.
- Salidas "tts-friendly": texto formateado para alimentar directamente un motor de síntesis de voz.
- Procesamiento multimodal: el repositorio incluye proyectores `mmproj` en Q8_0 y f16, lo que habilita entrada de datos no textuales junto al texto, sin que la modalidad concreta esté documentada.
- Orientación a ejecución on-device: cuantizaciones desde 4,5 GB permiten inferencia local en hardware modesto.
- Conversación multi-turno (etiqueta "conversational"), aunque sin longitud de contexto declarada no es posible acotar cuántos turnos mantiene con calidad.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo base puede servirse con APIs compatibles con OpenAI.
- No hay evidencia publicada de capacidades de razonamiento matemático avanzado, generación de código ni agentes multi-paso autónomos.

## Casos de uso

- Asistente de voz embebido en coreano: cadena ASR → KO-VoicePersona-E4B (Q4_K_M, 5,4 GB) → TTS sobre una GPU de 8-12 GB. El modelo está entrenado para devolver texto directamente sintetizable, lo que elimina la capa de normalización y limpieza de markdown antes del motor de voz.
- Kiosco o terminal de atención al cliente en coreano: con la cuantización Q4_K_S (5,3 GB) puede ejecutarse en un mini-PC con GPU integrada o en una RTX 3060, gestionando turnos conversacionales con persona fija y derivando a herramientas externas mediante tool calling para consultas de pedidos o reservas.
- Integración con domótica y asistentes de hogar: el soporte de function calling permite exponer acciones (encender luces, ajustar termostato) como herramientas y dejar que el modelo decida cuándo invocarlas a partir de una petición hablada en coreano.
- Prototipado de personas conversacionales: investigadores que necesiten evaluar el efecto de una persona concreta en la percepción de un asistente de voz pueden partir de este checkpoint y compararlo con variantes, sin reentrenar desde cero.
- Validación de pipelines ASR-LLM-TTS en llama.cpp: los ficheros GGUF y los proyectores `mmproj` permiten montar un extremo a extremo completo en local para medir latencia y calidad antes de invertir en infraestructura.
- Despliegue en dispositivos con memoria limitada: la cuantización Q2_K (4,5 GB) permite probar el modelo en entornos de menos de 6 GB de VRAM, útil para demos en portátiles o hardware de gama baja a costa de degradación de calidad.
- Investigación académica sobre modelos coreanos de pequeño tamaño: al ser un "research preview" con licencia openmdw-1.1, sirve como referencia para estudios comparativos de calidad lingüística en coreano frente a modelos multilingües genéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado se limita a listar los ficheros generados y enlazar la guía genérica de uso de GGUF; no incluye MMLU, HumanEval, GSM8K ni evaluaciones específicas de coreano, voz o tool calling. Tampoco hay mediciones de latencia o throughput publicadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño de fichero más caché KV y sobrecarga; el autor no publica mediciones):
  - Q2_K (4,5 GB): ~5-6 GB de VRAM.
  - Q3_K_M (5,0 GB) / IQ4_XS (5,2 GB): ~6-7 GB.
  - Q4_K_S (5,3 GB) / Q4_K_M (5,4 GB): ~6-7,5 GB, el punto de equilibrio recomendado por el cuantizador.
  - Q5_K_M (5,9 GB): ~7-8 GB.
  - Q6_K (6,3 GB): ~7,5-9 GB.
  - Q8_0 (8,1 GB): ~9-10,5 GB.
  - f16 (15,2 GB): ~17-18 GB.
  - Añadir 0,7 GB (mmproj Q8_0) o 1,1 GB (mmproj f16) si se usa la entrada multimodal.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4070/4080 para Q6_K y Q8_0; RTX 4090 24 GB, A100 40 GB o H100 para f16 y para servir varias instancias en paralelo.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en tarjetas de 8-16 GB; f16 requiere 24 GB o reparto entre GPU y CPU.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, llama-cpp-python) son la vía natural al ser pesos GGUF. vLLM y TGI no consumen GGUF de forma nativa: para esos servidores habría que partir del modelo base en safetensors.
- Latencia y throughput: no disponibles. Al no conocerse la longitud de contexto ni la arquitectura exacta, no es posible estimar tokens por segundo con rigor.

## Comparativa con modelos similares

Los comparadores se incluyen por categoría (modelo pequeño, orientación local, capacidades multimodales o multilingües); los datos de los comparadores provienen de su documentación pública y conviene verificarlos antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KO-VoicePersona-E4B (este) | 7,52 B | No disponible | Coreano | openmdw-1.1 | GGUF en HF; safetensors en el modelo base |
| Gemma 3n E4B (Google DeepMind) | ~8 B totales / ~4 B efectivos según su documentación | No disponible en la información proporcionada | Multilingüe | Términos Gemma | Pesos abiertos en HF y derivados GGUF |
| Qwen2.5-Omni-7B | ~7 B | No disponible en la información proporcionada | Multilingüe | No disponible en la información proporcionada | Pesos abiertos en HF |
| Llama 3.1 8B Instruct | ~8 B | No disponible en la información proporcionada | Multilingüe | Licencia comunitaria Llama 3.1 | Amplia disponibilidad en GGUF |

La diferencia principal frente a estos tres es la especialización: KO-VoicePersona-E4B está ajustado para coreano y para interacción de voz con persona, mientras que los comparadores son modelos generalistas. A cambio, carece de la documentación, las evaluaciones y el ecosistema de los modelos de referencia.

## Limitaciones y advertencias

- Modelo etiquetado como "research preview": no hay garantía de estabilidad ni de calidad mantenida en producción.
- Monolingüe en la práctica: solo declara coreano; no hay evidencia de competencia en castellano u otros idiomas.
- Longitud de contexto desconocida: impide planificar conversaciones largas o documentos extensos con garantías.
- Sin benchmarks publicados: no es posible comparar su calidad frente a alternativas con datos objetivos.
- Adopción nula registrada (0 descargas, 0 likes) y fecha de creación reciente: no hay retroalimentación de la comunidad sobre fallos o comportamientos.
- Licencia openmdw-1.1: es una licencia específica con condiciones propias; el campo `license` del repositorio figura como "other", por lo que es imprescindible leer el texto completo antes de cualquier uso comercial o redistribución.
- Riesgo de alucinación no cuantificado: al ser un modelo conversacional de 7,5 B sin evaluaciones, se espera una tasa apreciable de afirmaciones incorrectas, especialmente en tool calling con esquemas complejos.
- Degradación por cuantización: Q2_K y Q3_K_S reducen el tamaño a 4,5-4,8 GB pero el propio cuantizador marca Q3_K_M como "lower quality"; para producción conviene Q4_K_M o superior.
- Persona definida: el ajuste de persona puede producir respuestas estereotipadas o difíciles de redirigir, y no se documenta cómo modificar o neutralizar ese comportamiento.
- Modalidad multimodal sin especificar: los proyectores `mmproj` existen, pero se desconoce si cubren audio, imagen o ambas, y con qué calidad.
- Sin datos de sesgos: no hay evaluación de sesgos lingüísticos, culturales o de género para coreano.
- Soporte limitado por el ecosistema GGUF: no se puede servir directamente con vLLM o TGI sin volver al modelo base en safetensors.
- El autor del repositorio es un tercero (mradermacher); los problemas de calidad del modelo base deben reportarse al equipo de ThakiCloud.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/KO-VoicePersona-E4B-GGUF
- Modelo base: https://huggingface.co/ThakiCloud/KO-VoicePersona-E4B
- Texto de la licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Página de descargas y resumen del cuantizador para este modelo: https://hf.tst.eu/model#KO-VoicePersona-E4B-GGUF
- Índice de modelos cuantizados por mradermacher: https://huggingface.co/mradermacher/models
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía genérica de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad entre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de Gemma 4 (familia de referencia citada en las etiquetas): https://deepmind.google/models/gemma/gemma-4/
