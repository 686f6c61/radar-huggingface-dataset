# SLOCBench/HumanoidSafe-Qwen3-VL-8B-GRPO-GPT55-Full

## Resumen

HumanoidSafe-Qwen3-VL-8B-GRPO-GPT55-Full es un ajuste fino de Qwen3-VL-8B-Instruct realizado por SLOCBench mediante aprendizaje por refuerzo con verificación (RLVR) y el algoritmo GRPO. El modelo parte del checkpoint instructivo multimodal de Qwen y se entrena sobre el split de entrenamiento original del dataset HumanoidSafe, orientado a evaluar el comportamiento de seguridad de asistentes que razonan sobre escenas con humanoides. El resultado es un checkpoint de inferencia autónomo que incluye todos los pesos de lenguaje y visión, sin adaptadores externos.

La relevancia del modelo es metodológica: se publica como uno de los ocho baselines del informe comparativo de RLVR sobre Qwen3-VL-8B, con una configuración de entrenamiento completamente documentada (3 épocas, semilla 42, 222 actualizaciones de política, 444 pasos de optimizador) y una recompensa compuesta por un verificador de reglas de rechazo y un juez GPT-5.5. El ajuste es de parámetros completos (full fine-tuning), no PEFT, lo que lo convierte en una referencia útil para estudiar cómo el RL afecta a la calibración de rechazo en modelos visión-lenguaje.

El modelo conserva la arquitectura multimodal de Qwen3-VL y la ventana de contexto del modelo base, y está licenciado bajo Apache 2.0. Su alcance práctico es acotado: está especializado en la tarea de describir escenas y emitir una etiqueta `<action>` final, y no debe considerarse un asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje (Qwen3-VL), con torre de visión y modelo de lenguaje |
| Parametros totales | 8.767.123.696 parámetros entrenables según la configuración de entrenamiento; el campo `safetensors` del repo declara 1.095.890.462 (dato inconsistente con el tamaño del repo de 17,5 GB y con el recuento de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-8B-Instruct; no especificada en la información proporcionada) |
| Tipos de cuantizacion | no disponible (solo se documenta BF16 para inferencia y entrenamiento) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 17,5 GB, compatible con `transformers` y `Qwen3VLForConditionalGeneration`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa texto e imágenes o vídeo. La entrada de vídeo se construye con ocho fotogramas previos al evento como un único bloque de vídeo, a FPS 2.0, con un mínimo de 4.096 píxeles y un máximo de 262.144 píxeles por fotograma, usando `image_patch_size=16` y `qwen_vl_utils.process_vision_info` para los metadatos. Los fotogramas posteriores al evento, los metadatos de resultado y las etiquetas de seguridad no se usan como entrada.

El entrenamiento emplea GRPO con recompensa híbrida: un clasificador de reglas de frases de rechazo y un juez GPT-5.5 con el rúbrica fija del repositorio y esfuerzo de razonamiento bajo. El verificador solo recibe la instrucción y la respuesta generada; la etiqueta de rama (peligrosa o segura) asigna la recompensa binaria (rechazo = 1 en rama peligrosa, no rechazo = 0; rechazo = 0 en rama segura, no rechazo = 1). Se usan 294 pares del split `train` original, con 588 ramas de instrucción segura y peligrosa, solo con los prompts `base`. La configuración incluye AdamW con learning rate 1e-06 constante, clip range 0.2, KL de referencia beta 0.02, norma máxima de gradiente 1.0, BF16 para cómputo y FP32 para parámetros maestros y estado de Adam, con FSDP sobre 8 GPU y checkpointing de gradientes. La normalización de GRPO usa la desviación estándar poblacional con epsilon 1e-4; los grupos de recompensa constante tienen ventaja cero pero conservan la penalización KL de referencia k3 diferenciable. El muestreo usa temperatura 1.0, top-p 1.0, top-k 0, penalización de repetición 1.0 y máximo de 256 tokens nuevos.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes y vídeo, con descripción de escena y acción.
- Emisión de una etiqueta final estructurada `<action>...</action>` tras la descripción, conforme a las plantillas de prompt `base` y `safe`.
- Procesamiento de vídeo como bloque de ocho fotogramas previos al evento, con parámetros de muestreo y resolución documentados.
- Comportamiento de rechazo calibrado mediante RLVR: distingue entre ramas de instrucción segura y peligrosa según la política aprendida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento y la evaluación son de un solo turno con salida acotada a 256 tokens.
- Capacidades multilingües limitadas a inglés y chino.
- Modo thinking: la evaluación se realiza en modo no-thinking; no se documenta soporte de thinking en este checkpoint.

## Casos de uso

- Evaluación de seguridad en robótica humanoide: el modelo analiza ocho fotogramas previos a un evento y emite una descripción y una acción, lo que permite medir la tasa de rechazo ante instrucciones peligrosas en entornos con humanoides.
- Investigación en RLVR: sirve como baseline reproducible (semilla 42, presupuesto fijo, sin selección de checkpoint guiada por test) para comparar GRPO con otras variantes de refuerzo sobre Qwen3-VL-8B.
- Auditoría de verificadores de recompensa: al estar documentada la recompensa híbrida (reglas + GPT-5.5), permite estudiar cómo distintos verificadores moldean la política de rechazo.
- Análisis de calibración de rechazo: con 280 respuestas de test sobre 70 pares retenidos y doble juicio (GPT-5.5 primario y reglas secundario), es adecuado para medir falsos rechazos y falsas aceptaciones.
- Prototipado de asistentes de supervisión visual: puede integrarse en pipelines que requieran describir una escena breve y devolver una etiqueta de acción parseable, siempre dentro del dominio de HumanoidSafe.
- Reproducción de experimentos: el repositorio incluye `load_model.py`, `prompt_templates.json`, `training_config.json` y `requirements.txt`, lo que facilita replicar la inferencia con versiones fijadas (Python 3.9.21 observado).
- Estudio de la brecha entre juez LLM y verificador de reglas: la evaluación dual permite comparar ambos criterios sobre las mismas respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación (split `test` original con 70 pares retenidos, ambas ramas y ambos modos de prompt, 280 respuestas, generación greedy en BF16, semilla 42, juicio primario GPT-5.5 y juicio secundario por reglas, cobertura del 100 % sin respuestas que alcanzaran el límite de tokens), pero el texto proporcionado se interrumpe antes de presentar las métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para comodidad en una sola GPU.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue en producción; RTX 4090 (24 GB) puede alojar el modelo en BF16 con `device_map="auto"` y cuidado con la longitud de contexto y el número de fotogramas.
- Cabe en GPU de consumo: sí, en RTX 4090 o GPUs con 24 GB o más en BF16; en GPUs de 16 GB requeriría cuantización, que no está documentada en la información disponible.
- Opciones de despliegue: `transformers` con `Qwen3VLForConditionalGeneration`, `attn_implementation="sdpa"`, `device_map="auto"` y `use_cache=True`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El entrenamiento usó FSDP sobre 8 GPU con checkpointing de gradientes; la inferencia de evaluación es greedy con límite de 256 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| HumanoidSafe-Qwen3-VL-8B-GRPO-GPT55-Full | 8.767.123.696 entrenables (según config de entrenamiento) | no disponible | Imagen, vídeo y texto | apache-2.0 | Ajuste RLVR con GRPO sobre HumanoidSafe; checkpoint de inferencia autónomo |
| Qwen/Qwen3-VL-8B-Instruct | no disponible en la información proporcionada | no disponible | Imagen, vídeo y texto | no disponible en la información proporcionada | Modelo base; asistente generalista sin el ajuste de rechazo específico |
| Otros baselines del informe HumanoidSafe RLVR | no disponible | no disponible | Imagen, vídeo y texto | no disponible | Siete baselines adicionales comparados en el mismo informe, con presupuesto y semilla fijos |

## Limitaciones y advertencias

- El campo `safetensors` del repositorio declara 1.095.890.462 parámetros, mientras que la configuración de entrenamiento indica 8.767.123.696 parámetros entrenables y el repo pesa 17,5 GB; esta inconsistencia debe verificarse antes de desplegar.
- El modelo está especializado en la tarea HumanoidSafe y en el formato de salida con etiqueta `<action>`; su uso como asistente generalista no está validado.
- El entrenamiento se realizó solo con los prompts `base`, aunque la evaluación cubre también el modo `safe`; el comportamiento fuera de estas plantillas no está garantizado.
- La recompensa depende de un clasificador de reglas de rechazo y de un juez GPT-5.5 con rúbrica fija; la política aprendida puede heredar sesgos y puntos ciegos de ambos verificadores.
- Riesgo de alucinación en las descripciones de escena, especialmente con entradas de vídeo de baja resolución o fuera de la distribución de ocho fotogramas a FPS 2.0.
- Idiomas soportados limitados a inglés y chino; no se documenta rendimiento en castellano.
- La evaluación usa generación greedy en modo no-thinking con 256 tokens nuevos; no se documenta comportamiento en modo thinking ni con muestreo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct tiene sus propios términos que deben revisarse por separado.
- No se incluyen el estado del optimizador, el estado de reanudación del entrenamiento ni la cabeza de valor PPO usada solo en entrenamiento; es únicamente un checkpoint de inferencia.
- El número de descargas y likes es cero en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SLOCBench/HumanoidSafe-Qwen3-VL-8B-GRPO-GPT55-Full
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct/tree/0c351dd01ed87e9c1b53cbc748cba10e6187ff3b
- Dataset: https://huggingface.co/datasets/SLOCBench/HumanoidSafe
- Informe de los ocho baselines RLVR: https://github.com/chrisyxue/eval_humanoid/blob/ead933f1c90769299c13888cc2034f4377623b61/reports/humanoidsafe-qwen3vl8b-rlvr-2026-11-15/README.md
- Implementación de preparación de entrada: https://github.com/chrisyxue/eval_humanoid/blob/51715e55597ad3bc1e27ff2a39ab7d9be41c86de/model/open/qwen_vl.py
