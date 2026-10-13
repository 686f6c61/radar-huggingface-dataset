# Ashleyyyguo/cs329x-hw1-dpo-qwen2.5-1.5b

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo instructivo Qwen/Qwen2.5-1.5B-Instruct. Lo publica el usuario Ashleyyyguo bajo el identificador Ashleyyyguo/cs329x-hw1-dpo-qwen2.5-1.5b y está etiquetado con las librerías peft, transformers y trl. Por el nombre del repositorio (cs329x-hw1) y por la existencia de otros adaptadores casi idénticos publicados por otros usuarios (ChenChen2005 o leamhadzic), todo apunta a que se trata de un entregable académico del curso CS329X, orientado a practicar un pipeline de alineación por preferencias sobre un modelo pequeño.

No es un modelo completo ni un checkpoint de pesos base, sino un conjunto de pesos delta en formato PEFT (LoRA) que debe cargarse junto al modelo base Qwen2.5-1.5B-Instruct. El modelo subyacente es un transformer decoder-only de ~1,5 mil millones de parámetros con una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 con YaRN según la documentación de Qwen). El adaptador aporta un ajuste fino por preferencias sobre las respuestas del modelo base.

La relevancia de esta ficha es fundamentalmente metodológica: sirve como ejemplo reproducible de cómo aplicar DPO con TRL y PEFT a un modelo de 1,5B, y como punto de partida para experimentos de alineación en hardware de consumo. La model card del autor es la plantilla por defecto de HuggingFace y no está cumplimentada, por lo que la mayor parte de los metadatos técnicos (licencia, idiomas, datos de entrenamiento, hiperparámetros y evaluación) figuran como "no disponible".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso (Qwen2.5-1.5B-Instruct) |
| Parametros totales | Modelo base: ~1,5 mil millones. Adaptador: no disponible (LoRA de bajo rango) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos del modelo base (hasta 131.072 con YaRN, según documentación de Qwen) |
| Tipos de cuantizacion | El adaptador se distribuye sin cuantizar; puede combinarse con el modelo base en GGUF, AWQ, GPTQ, bitsandbytes 4/8 bits, aunque la ficha no documenta ninguna |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0, pero el adaptador no declara licencia propia) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA, no un modelo entrenado desde cero. Se apoya en Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención de consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y codificación posicional RoPE, tal como se documenta para la familia Qwen2.5. Al ser un adaptador, la arquitectura efectiva en inferencia es la del modelo base más las matrices de bajo rango inyectadas en las capas de atención y/o proyecciones.

El método de ajuste declarado es DPO, ejecutado sobre pares de preferencia con la librería TRL y serializado con PEFT 0.21.2. No se especifican en la ficha el número de pasos, la tasa de aprendizaje, el rango de LoRA, el dataset de preferencias ni la composición de los pares. A modo de contexto, un adaptador hermano del mismo curso (ChenChen2005/cs329x-hw1-dpo-qwen25-20261010) indica haberse entrenado con 378 pares de preferencia sobre 18 tareas, pero ese dato no puede atribuirse a este repositorio.

## Capacidades

Al heredar el comportamiento de Qwen2.5-1.5B-Instruct más el ajuste DPO, cabe esperar las siguientes capacidades, siempre sujetas a verificación empírica porque la ficha no aporta evaluación:

- Generación de texto conversacional multi-turno en formato chat.
- Razonamiento básico y resolución de problemas sencillos de matemáticas.
- Generación y explicación de código en lenguajes habituales, con limitaciones propias de un modelo de 1,5B.
- Ajuste de estilo de respuesta por preferencias (verbosidad, formato, tono) gracias al entrenamiento DPO.
- Soporte multilingüe limitado al que ofrezca el modelo base; no declarado para este adaptador.
- Tool calling y function calling: el modelo base Qwen2.5-Instruct declara soporte, pero no se confirma para el adaptador.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Experimentación académica en alineación: reproducción de un pipeline DPO completo (dataset de preferencias, TRL, PEFT) sobre un modelo pequeño, útil para docencia y para validar metodología antes de escalar a modelos mayores.
- Asistente conversacional ligero en local: despliegue de un chatbot de bajo consumo que quepa en GPUs de gama de entrada o incluso en CPU, adecuado para demos y prototipos.
- Ajuste de estilo y formato de respuestas: uso del adaptador para estudiar cómo DPO modifica la brevedad, el tono o la estructura de las respuestas respecto al modelo base.
- Evaluación comparativa de adaptadores DPO: al existir varios adaptadores con el mismo nombre de tarea en HuggingFace, sirve como pieza en comparativas controladas entre recetas de alineación.
- Generación de texto asistida en entornos con restricciones de hardware: redacción de borradores, resúmenes cortos o reformulación de textos donde no se requiere un modelo grande.
- Base para fine-tuning posterior: punto de partida para aplicar SFT adicional o nuevas rondas de DPO sobre dominios concretos, aprovechando el bajo coste de entrenamiento de un adaptador LoRA.
- Integración en pipelines de investigación con vLLM o TGI: despliegue del modelo base fusionado con el adaptador para medir throughput y latencia en un entorno de servicio real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye sección de evaluación cumplimentada y la información de búsqueda no aporta métricas para este adaptador concreto.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base fusionado: ~3-4 GB en fp16/bf16, ~1,6-2 GB en int8 y ~1-1,5 GB en 4 bits.
- El adaptador en sí ocupa muy poco espacio (el repositorio figura como 0,0 GB por redondeo); el coste lo determina el modelo base.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM sirve en fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 ofrecen margen de sobra. También es viable en CPU con llama.cpp.
- Cabe holgadamente en GPU de consumo, incluidas integradas con memoria compartida en cuantizaciones de 4 bits.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), fusión de pesos y conversión a GGUF para llama.cpp u Ollama, y servidores como vLLM o TGI tras fusionar el adaptador con el base (existe además una entrada de despliegue en FriendliAI para un adaptador homónimo de otro autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Base | Método | Parámetros | Contexto | Licencia | Señales de uso |
|---|---|---|---|---|---|---|
| Ashleyyyguo/cs329x-hw1-dpo-qwen2.5-1.5b | Qwen2.5-1.5B-Instruct | DPO + LoRA | ~1,5B (base) | 32.768 (base) | no disponible | 0 descargas, 0 likes |
| ChenChen2005/cs329x-hw1-dpo-qwen25-20261010 | Qwen2.5-1.5B-Instruct | DPO + LoRA (378 pares, 18 tareas) | ~1,5B (base) | 32.768 (base) | no disponible | no disponible |
| leamhadzic/cs329x-hw1-dpo-qwen2.5-1.5b | Qwen2.5-1.5B-Instruct | DPO + LoRA | ~1,5B (base) | 32.768 (base) | no disponible | no disponible |
| Qwen/Qwen2.5-1.5B-Instruct | — (modelo completo) | SFT + preferencias de Qwen | 1,54B | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | ampliamente utilizado |

No se dispone de datos de rendimiento comparativo entre estos adaptadores; la comparación se limita a metadatos de repositorio.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados para este adaptador; hereda los sesgos del modelo base y de los datos de preferencia empleados, que no se especifican.
- Riesgo de alucinación: alto, como en cualquier modelo de 1,5B, especialmente en tareas de conocimiento factual y razonamiento largo.
- Limitaciones de contexto e idioma: la ventana efectiva depende del modelo base; los idiomas soportados no están declarados y el ajuste DPO puede haber reducido la competencia multilingüe si el dataset de preferencias era monolingüe.
- Licencia: el adaptador no declara licencia. Aunque el modelo base es Apache 2.0, la ausencia de licencia explícita en el repositorio genera incertidumbre sobre el uso comercial del propio adaptador.
- Model card vacía: casi todos los metadatos (datos de entrenamiento, hiperparámetros, evaluación, impacto ambiental) figuran como "More Information Needed", lo que impide auditar el proceso.
- Sin validación publicada: no hay benchmarks ni evaluación humana, por lo que no puede afirmarse que el DPO haya mejorado al modelo base; podría incluso degradarlo en algunas tareas.
- Naturaleza de adaptador: requiere cargar el modelo base Qwen2.5-1.5B-Instruct, con la dependencia y el almacenamiento que ello implica.
- Escaso uso e impacto: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni issues conocidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ashleyyyguo/cs329x-hw1-dpo-qwen2.5-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Adaptador hermano (ChenChen2005): https://huggingface.co/ChenChen2005/cs329x-hw1-dpo-qwen25-20261010
- Adaptador homónimo (leamhadzic): https://huggingface.co/leamhadzic/cs329x-hw1-dpo-qwen2.5-1.5b
- Despliegue en FriendliAI del adaptador homónimo: https://friendli.ai/models/leamhadzic/cs329x-hw1-dpo-qwen2.5-1.5b
- Ficha de referencia en free2aitools: https://free2aitools.com/model/leamhadzic/cs329x-hw1-dpo-qwen2.5-1.5b
- Documentación de Qwen2.5-Coder en Alibaba Cloud PAI (contexto de la familia Qwen2.5): https://help.aliyun.com/en/pai/use-cases/training-evaluation-compression-and-deployment-of-qwen2-5-coder-model
- Paper referenciado en las etiquetas del repositorio (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
