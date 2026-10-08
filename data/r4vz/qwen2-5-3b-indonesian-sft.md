# R4vZ/qwen2.5-3b-indonesian-sft

## Resumen

R4vZ/qwen2.5-3b-indonesian-sft es un ajuste fino supervisado (SFT) del checkpoint unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit, publicado por el usuario R4vZ bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 3.085.938.688 parámetros (unos 3,09 mil millones) construido sobre la arquitectura Qwen2, un transformer decoder-only con Grouped-Query Attention. El repositorio ocupa 6,2 GB y se distribuye únicamente en formato safetensors; no hay versiones GGUF ni cuantizaciones publicadas.

El interés del modelo es acotado y fundamentalmente experimental. El nombre del repositorio sugiere un ajuste orientado al indonesio, pero la model card y los tags declaran exclusivamente inglés, sin ninguna descripción del dataset, del procedimiento de entrenamiento ni de los hiperparámetros empleados. La única información técnica aportada por el autor es que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, con una velocidad declarada "2x más rápida". El modelo acumula 0 descargas y 0 likes en el momento de la consulta.

Se trata, por tanto, de una publicación de tipo "subida de checkpoint" sin documentación sustancial. No hay resultados de benchmarks, ni evaluación de calidad, ni detalles sobre composición del corpus. Su utilidad práctica hoy es limitada y pasa por la reproducibilidad del pipeline de ajuste o por servir de punto de partida para experimentos propios, siempre que se verifiquen antes la licencia del modelo base y el idioma real de destino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, con Grouped-Query Attention (heredada del modelo base) |
| Parámetros totales | 3.085.938.688 (3,09 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No confirmada para este ajuste. El modelo base Qwen2.5-3B-Instruct declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantización | No se distribuyen versiones cuantizadas. El repo publica safetensors (aparentemente en bf16/fp16, a juzgar por los 6,2 GB). El checkpoint base usado para el ajuste estaba cuantizado a 4 bits con bitsandbytes |
| Idiomas soportados | La model card y los tags declaran únicamente inglés (`en`), en contradicción con el nombre del repositorio, que indica indonesio. No hay información que confirme el soporte real de indonesio |
| Licencia | Apache 2.0 (declarada en el repo) |
| Formato de pesos | safetensors. No disponible en GGUF, AWQ ni GPTQ |
| Librería | transformers |
| Pipeline | text-generation |
| Compatibilidad de despliegue | tags `text-generation-inference` y `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo Qwen2 con normalización RMSNorm, activación SwiGLU, embeddings RoPE y Grouped-Query Attention. Según la configuración pública de Qwen2.5-3B, esto se traduce en 36 capas, dimensión oculta de 2048, 16 cabezas de atención, 2 cabezas de clave/valor y un vocabulario de 151.936 tokens. Estas cifras proceden de la documentación del modelo base y no han sido verificadas directamente sobre este ajuste.

El proceso de entrenamiento no está documentado. La model card solo indica que se empleó Unsloth junto con TRL y que el entrenamiento fue "2x más rápido", sin especificar número de tokens, composición del dataset, número de épocas, tasa de aprendizaje ni método de ajuste. El uso de un checkpoint base cuantizado a 4 bits apunta a QLoRA, pero no está confirmado. No se menciona ningún paso de RLHF, DPO u otra alineación posterior al SFT. El prefijo "indonesian" del nombre sugiere un corpus en indonesio, pero ni la model card ni los tags lo respaldan.

## Capacidades

Advertencia: no se ha publicado ninguna evaluación de este ajuste. Las capacidades que se enumeran a continuación son las declaradas para el modelo base Qwen2.5-3B-Instruct y pueden haberse degradado, alterado o perdido durante el ajuste.

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con el formato Qwen.
- Razonamiento básico y resolución de problemas aritméticos de complejidad media, propio de un modelo de 3B.
- Generación de código en lenguajes habituales (Python, JavaScript, C++), con calidad limitada por el tamaño.
- Soporte de tool calling y function calling estructurado en el modelo base; sin confirmar tras el ajuste.
- Capacidad multilingüe amplia en el modelo base (Qwen2.5 cubre decenas de idiomas), pero este ajuste declara solo inglés.
- Manejo de contexto largo (32.768 tokens nativos en el base), aunque el ajuste no lo confirma.
- No se declara capacidad de visión, audio ni modo "thinking".

## Casos de uso

- Reproducción de pipelines de ajuste con Unsloth y TRL: el modelo sirve como referencia de un SFT completo sobre un checkpoint cuantizado a 4 bits, útil para equipos que quieran replicar el flujo en sus propios datos.
- Atención al cliente en indonesio (si el ajuste cumple su propósito nominal): un modelo de 3B puede gestionar conversaciones multi-turno de dominio acotado y desplegarse en servidores modestos, siempre que se valide antes la calidad real en ese idioma.
- Prototipado rápido de asistentes conversacionales: con 3,09 mil millones de parámetros y licencia Apache 2.0, permite iterar sobre prompts, plantillas de chat y flujos de diálogo antes de escalar a un modelo mayor.
- Despliegue en el borde o en hardware de gama media: cuantizado a 4 bits ocupa del orden de 2 GB, lo que lo hace viable en portátiles, mini-PC y GPUs de 8 GB para tareas de baja concurrencia.
- Anotación y preprocesado de datos: clasificación de intenciones, extracción de entidades o etiquetado de corpus a bajo coste, con revisión humana posterior dado el riesgo de alucinación.
- Componente generador en pipelines RAG: con la ventana de contexto del modelo base, puede resumir y responder sobre documentos recuperados en despliegues donde no cabe un modelo de 7B o superior.
- Generación de datos sintéticos y destilación: usar sus salidas como corpus de arranque para ajustar modelos menores o para aumentar un dataset en un dominio concreto.
- Educación y práctica local: ejecutable en un equipo personal para experimentar con ajuste fino, plantillas de chat y evaluación sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K ni otras) y el repositorio no referencia ningún informe asociado. Tampoco se reproducen aquí las cifras publicadas para el modelo base Qwen2.5-3B-Instruct, ya que no forman parte de la información proporcionada y no son extrapolables a este ajuste.

## Requisitos de hardware

Los valores de memoria son cálculos derivados del número de parámetros y de la configuración pública del modelo base; no proceden de mediciones sobre este checkpoint.

- Pesos en bf16/fp16: aproximadamente 6,2 GB (coincide con el tamaño del repo). Requiere GPU de 8 GB o más para contexto corto.
- Pesos en 8 bits: del orden de 3,1 a 3,5 GB.
- Pesos en 4 bits (GGUF Q4_K_M o similar): del orden de 1,9 a 2,2 GB, más overhead de runtime.
- Caché KV: con la configuración del base (36 capas, 2 cabezas KV, dimensión de cabeza 128), cada token ocupa unos 36 KB en fp16, es decir, alrededor de 1,2 GB a 32.768 tokens de contexto. Reduce drásticamente el presupuesto de VRAM disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para servir con concurrencia alta; RTX 3090, 4080 o 4070 Ti para un único usuario en bf16.
- ¿Cabe en GPU de consumo? Sí. En bf16 entra en RTX 3090/4090 (24 GB) y en RTX 4060 Ti 16 GB con contexto moderado. En 4 bits entra en GPUs de 6 a 8 GB, como RTX 3060, 4060 o portátiles con GPU dedicada.
- Opciones de despliegue: vLLM y TGI para servicio HTTP con batching continuo; llama.cpp u Ollama tras convertir los pesos a GGUF; transformers con bitsandbytes para cargas cuantizadas; Unsloth para reentrenamiento o ajuste adicional.
- Latencia y throughput: no disponible. No se han publicado mediciones y dependerían en gran medida del backend, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| R4vZ/qwen2.5-3b-indonesian-sft | 3,09 B | No confirmado (base: 32.768) | Apache 2.0 declarada | safetensors | Hugging Face, 0 descargas |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 (131.072 con YaRN) | Verificar: en la familia Qwen2.5 el checkpoint de 3B se ha distribuido bajo Qwen Research License | safetensors, GGUF, AWQ, GPTQ | Amplia, con versiones oficiales y de terceros |
| Llama-3.2-3B-Instruct | 3,21 B | 131.072 | Llama 3.2 Community License (no Apache) | safetensors, GGUF | Muy amplia, ecosistema maduro |
| Phi-3.5-mini-instruct | 3,82 B | 131.072 | MIT | safetensors, GGUF | Amplia, con soporte en múltiples runtimes |

Frente a las tres alternativas, este ajuste pierde en contexto efectivo documentado, en variedad de formatos publicados y en respaldo de evaluación. Su única ventaja relativa es la licencia Apache 2.0 declarada por el autor, aunque conviene contrastarla con la del modelo base antes de asumirla (véase la sección siguiente).

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni pruebas de regresión respecto al modelo base. No se puede afirmar que el ajuste haya mejorado ninguna capacidad.
- Posible conflicto de licencias: la model card declara Apache 2.0, pero en la familia Qwen2.5 el checkpoint de 3B se ha distribuido públicamente bajo Qwen Research License, no Apache 2.0. Antes de cualquier uso comercial debe verificarse la licencia efectiva del modelo base y resolverse la discrepancia.
- Ambigüedad de idioma: los tags declaran solo inglés mientras el nombre del repositorio indica indonesio. No hay ninguna evidencia publicada sobre la calidad real en cualquiera de los dos idiomas.
- Riesgo de alucinación: inherente a un modelo de 3B sin evaluación publicada. Puede inventar datos, citas y referencias, especialmente en tareas de conocimiento factual.
- Degradación por olvido catastrófico: al ser un SFT sobre un modelo instruido, es probable que haya pérdida de capacidades generales, pero no se ha medido.
- Contexto largo no garantizado: aunque el modelo base admita 32.768 tokens, no hay evidencia de que este ajuste conserve el comportamiento con ventanas largas.
- Sin versiones cuantizadas oficiales: cualquier despliegue en GGUF, AWQ o GPTQ requiere conversión propia y validación posterior.
- Repositorio sin tracción: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad, así que no hay informes de fallos ni de comportamiento en producción.
- Entrenamiento no reproducible: sin dataset, hiperparámetros ni receta publicada, no es posible auditar el sesgo introducido por el corpus de ajuste.
- Fechas del repositorio: el registro indica creación y actualización en octubre de 2026, un intervalo de dos minutos entre ambas, coherente con una subida automatizada sin revisión posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/R4vZ/qwen2.5-3b-indonesian-sft
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
