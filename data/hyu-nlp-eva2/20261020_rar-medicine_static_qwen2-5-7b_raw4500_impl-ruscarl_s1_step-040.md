# HYU-NLP-EVA2/20261020_rar-medicine_static_qwen2.5-7b_raw4500_impl-ruscarl_s1_step-040

## Resumen

`20261020_rar-medicine_static_qwen2.5-7b_raw4500_impl-ruscarl_s1_step-040` es un ajuste fino del modelo Qwen2.5-7B-Instruct (7.615.616.512 parámetros, transformer decoder-only denso) especializado en razonamiento y respuesta a preguntas de ámbito médico mediante aprendizaje por refuerzo con recompensas basadas en rúbricas. Lo desarrolla el grupo HYU-NLP-EVA2 y se distribuye como export de inferencia en safetensors BF16 con licencia Apache 2.0.

El modelo parte de 4.500 ejemplos del dataset ScaleAI/RaR-Medicine y se entrena con GRPO, usando Qwen3-32B como juez que puntúa criterio a criterio (sin modo thinking). El checkpoint publicado corresponde al paso 40 de una ejecución que solo generó checkpoints hasta el paso 50, por lo que se trata de una instantánea intermedia de un entrenamiento corto (un epoch configurado, un epoch de PPO, learning rate 1e-6).

Su relevancia es doble: por un lado, es un ejemplo reproducible de aplicación de RL con rúbricas (rubric-based RL) sobre un modelo abierto de 7B; por otro, sirve como caso de estudio de los riesgos de publicar checkpoints intermedios sin evaluación: el autor no reporta ningún resultado de benchmarks ni comparación con el modelo base, y el repositorio no incluye estados de optimizador ni shards originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (modelo base Qwen2.5-7B-Instruct); 28 capas, hidden size 3.584, GQA con 28 cabezas de atención y 4 de KV según la configuración del modelo base |
| Parámetros totales | 7.615.616.512 (~7,6 B), dato leído de los safetensors |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 32.768 tokens nativo; ampliable a 131.072 con escalado YaRN (especificación del modelo base, no verificada en este checkpoint) |
| Tipos de cuantización | No disponible: el autor solo publica pesos BF16 en safetensors; no hay GGUF, GPTQ, AWQ ni FP8 publicados |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 es multilingüe, pero el autor no declara idiomas para este ajuste) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) + tokenizer y config de Transformers; tamaño del repo 15,2 GB |
| Librería / pipeline | transformers, text-generation; compatible con endpoints y text-generation-inference |
| Checkpoint | Paso 40 de 50 (la ejecución solo guardó checkpoints hasta el paso 50) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un transformer decoder-only denso de 7,6B parámetros con atención de consultas agrupadas (GQA), preentrenado por Alibaba y posteriormente alineado como Instruct. El ajuste se realizó con GRPO (Group Relative Policy Optimization) sobre 4.500 ejemplos de RaR-Medicine: batch de entrenamiento 32, 8 rollouts por prompt, mini-batch PPO de 16, learning rate 1e-6, un epoch de PPO y un epoch de entrenamiento configurado (aproximadamente 140 pasos por epoch, de los que se publica el paso 40). La recompensa no proviene de un reward model escalar entrenado aparte, sino de un juez LLM, Qwen3-32B en modo no-thinking, que evalúa cada criterio de la rúbrica por separado y produce la señal de reward a nivel de criterio (el autor etiqueta el método como `rubic-based-rl` / `ruscarl`).

El checkpoint original se generó con VERL sobre FSDP v1 con world size 2 y se exportó como merge completo en BF16; el pipeline (FSDP con dos GPUs y merge completo) sugiere ajuste de todos los parámetros, aunque la model card no lo declara explícitamente ni aclara si se aplicó LoRA. No se publican el número total de tokens vistos, la composición detallada del dataset, ni si hubo fases previas de SFT o DPO. Tampoco se documenta ninguna innovación de inferencia (decodificación especulativa, atención lineal); el interés técnico está enteramente en el esquema de reward por rúbricas.

## Capacidades

- Generación de texto conversacional multi-turno en inglés (idioma del dataset de entrenamiento), orientada a preguntas y explicaciones de contenido médico.
- Razonamiento clínico estructurado: el entrenamiento con rúbricas a nivel de criterio favorece respuestas que cubren puntos concretos (diagnóstico diferencial, factores de riesgo, contraindicaciones).
- Respuesta a preguntas de tipo examen médico y explicación de conceptos de fisiología, farmacología y semiología.
- Instrucción general y formato de chat heredados de Qwen2.5-7B-Instruct (system prompt, plantilla ChatML).
- Posible soporte de tool calling y function calling heredado del modelo base, no verificado tras el ajuste y no documentado por el autor.
- Capacidades multilingües del modelo base presumiblemente conservadas, pero sin evaluación ni declaración por parte del autor.
- No hay soporte declarado de visión, audio, thinking mode explícito ni agentes multi-paso.

## Casos de uso

- Respuesta a preguntas médicas de referencia: el modelo puede generar explicaciones razonadas sobre patologías y tratamientos, y su entrenamiento con rúbricas tiende a producir respuestas que cubren varios criterios clínicos en lugar de una sola frase; útil como borrador para revisión humana.
- Educación médica y generación de material de estudio: creación de preguntas tipo test con justificación, resúmenes de guías clínicas y explicaciones para estudiantes, aprovechando la ventana de 32.768 tokens para incorporar documentos completos.
- Pre-anotación de respuestas para evaluación con rúbricas: dado que fue entrenado contra un juez Qwen3-32B, puede usarse como generador de candidatos en pipelines de evaluación o como baseline en experimentos de rubric-based RL.
- Asistencia a la documentación clínica: resumen y reescritura de notas e informes en inglés, con contexto largo para admisiones o historiales extensos, siempre con supervisión profesional.
- Normalización y apoyo a codificación (CIE-10, SNOMED): extracción de entidades y términos diagnósticos de texto libre como paso previo a un sistema de codificación determinista.
- Investigación en alineación y RL: punto de comparación reproducible para estudiar el efecto de GRPO con reward de juez sobre un modelo de 7B, o para analizar la degradación típica de checkpoints intermedios.
- Generación de datos sintéticos de dominio médico para experimentos internos, con filtrado y revisión obligatorios dado el riesgo de alucinación.
- No es adecuado para uso clínico directo, triaje automatizado ni decisiones diagnósticas sin validación y sin un sistema de verificación externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor únicamente referencia un conjunto de test (`HYU-NLP-EVA2/rar-medicine-ruscarl-test500-seed42`, 500 ejemplos seleccionados con semilla 42) sin publicar métricas sobre él, y no ofrece comparación con Qwen2.5-7B-Instruct en MMLU, GSM8K, HumanEval ni en benchmarks médicos como MedQA, PubMedQA o MedMCQA. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- Pesos en BF16: ~15,3 GB (7,61B × 2 bytes). En FP8/INT8 bajaría a ~7,6-8 GB; en GGUF Q4_K_M se estima ~4,7 GB (estimación, no hay cuantizaciones publicadas).
- KV cache estimada para esta arquitectura (28 capas, 4 cabezas KV, head dim 128): ~56 KB por token, es decir ~0,45 GB a 8K de contexto y ~1,8 GB a 32K, en BF16.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB ejecutan el modelo en BF16 con contexto completo sin problemas; también cabe en A10G 24 GB con contexto moderado.
- GPU de consumo: cabe en RTX 4090 / 3090 (24 GB) en BF16 con contexto de 8-16K; en RTX 4080 / 4070 Ti Super (16 GB) requiere FP8/INT8 o GGUF Q8; en GPUs de 8-12 GB solo con GGUF Q4/Q5.
- Despliegue: vLLM o SGLang para serving en BF16/FP8, TGI (el repo está etiquetado como `endpoints_compatible` y `text-generation-inference`), y llama.cpp/Ollama tras convertir los pesos a GGUF, conversión que el autor no proporciona.
- Latencia y throughput: no disponibles; no hay mediciones publicadas ni requisitos de hardware declarados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Benchmark público |
|---|---|---|---|---|---|
| Este modelo (step 40) | 7,6 B denso | 32.768 nativo (131.072 con YaRN, según base) | Médica, RL con rúbricas sobre RaR-Medicine | Apache 2.0 | No disponible |
| Qwen2.5-7B-Instruct (base) | 7,6 B denso | 32.768 nativo (131.072 con YaRN) | Propósito general, alineado con SFT + preferencias | Apache 2.0 | Sí, reportados por el autor del modelo base |
| Qwen2.5-14B-Instruct | ~14,7 B denso | 32.768 nativo | Propósito general | Apache 2.0 | Sí |
| Llama-3.1-8B-Instruct | 8 B denso | 128.000 | Propósito general, tool calling | Llama 3.1 Community License | Sí |

No existe comparación de rendimiento entre este checkpoint y las alternativas: el autor no publica métricas y no hay evidencia de que el ajuste con GRPO mejore al base en tareas médicas. Cualquier elección entre estas opciones debería basarse en una evaluación propia sobre el conjunto de test del propio autor.

## Limitaciones y advertencias

- Riesgo alto de alucinación en contenido médico: no hay evaluación publicada, ni verificación factual, ni citas de fuentes; las respuestas pueden ser plausibles y erróneas.
- No es un producto sanitario: no debe usarse para diagnóstico, prescripción ni triaje sin supervisión de un profesional cualificado y sin controles adicionales.
- Checkpoint intermedio (paso 40 de una ejecución de 50): el modelo puede estar infraentrenado y presentar inestabilidades respecto al base; no se documenta ningún criterio de selección del checkpoint.
- Idiomas no declarados: el dataset es en inglés y no hay evidencia de que las capacidades multilingües del base se conserven tras el ajuste.
- Sesgos potenciales heredados de Qwen2.5 y del dataset RaR-Medicine, cuya composición, procedencia y cobertura demográfica no se detallan; riesgo de sesgo cultural y de infrarrepresentación de poblaciones no anglosajonas.
- Licencia Apache 2.0 en este repo, pero conviene verificar la licencia y las condiciones del modelo base y del dataset RaR-Medicine antes de un uso comercial; el dataset puede tener términos propios no reflejados en la model card.
- El repo no incluye estados de optimizador, RNG ni dataloader, por lo que no es posible reanudar el entrenamiento desde este export, solo hacer inferencia o fine-tuning desde los pesos fusionados.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte o correcciones por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/20261020_rar-medicine_static_qwen2.5-7b_raw4500_impl-ruscarl_s1_step-040
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct (revisión citada: `a09a35458c702b33eeacc393d103063234e8bc28`)
- Juez de rúbricas Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B (revisión citada: `9216db5781bf21249d130ec9da846c4624c16137`)
- Dataset de entrenamiento: https://huggingface.co/datasets/ScaleAI/RaR-Medicine
- Conjunto de test del autor: https://huggingface.co/datasets/HYU-NLP-EVA2/rar-medicine-ruscarl-test500-seed42
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de automoción y canales de vídeo sin relación con este proyecto.
