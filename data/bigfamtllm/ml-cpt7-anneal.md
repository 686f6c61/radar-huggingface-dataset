# BigFamTLLM/ml-cpt7-anneal

## Resumen
ml-cpt7-anneal es un modelo de lenguaje de tipo base (no instruction-tuned) de 2.115.305.088 parámetros, desarrollado por el grupo BigFamTLLM en el marco del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un checkpoint intermedio de un proyecto de investigación que entrena modelos noruegos, daneses y multilingües desde cero con la misma arquitectura y presupuesto, y posteriormente adapta los modelos danés y multilingüe al noruego mediante continued pretraining (CPT).

El modelo parte de ml-cpt7, un checkpoint multilingüe adaptado al noruego con un tokenizador específico de 32k tokens y 18.840 millones de tokens noruegos vistos durante el entrenamiento. Esta versión "anneal" añade 916 pasos adicionales (0,48 mil millones de tokens) sobre texto de alta calidad en bokmål y nynorsk, con decaimiento lineal de la tasa de aprendizaje hasta cero, lo que típicamente mejora la calidad final del modelo antes de su publicación.

Su relevancia es acotada: no es un modelo de producción ni un asistente conversacional, sino una pieza de un estudio comparativo sobre adaptación lingüística y annealing en modelos pequeños. Resulta útil para investigadores interesados en el procesamiento del noruego, en estrategias de sustitución de tokenizador y en el efecto del annealing sobre checkpoints de CPT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3): 36 capas, hidden size 2176, 34 cabezas de atención (17 KV heads), embeddings atados |
| Parametros totales | 2.115.305.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica versiones cuantizadas; al ser safetensors bf16, es convertible a GGUF/AWQ/GPTQ con herramientas externas) |
| Idiomas soportados | en, da, de, sv, no, nb, nn (entrenamiento específico en noruego bokmål y nynorsk) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura transformer decoder-only idéntica a la de Qwen3, con 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados entre entrada y salida. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia (Sigma2), con longitud de secuencia 4096, batch size 128, optimizador AdamW y una tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de warmup y sin decaimiento (1e-4 durante la fase de solo embeddings).

La adaptación al noruego siguió tres fases: sustitución del tokenizador por uno noruego de 32k tokens (los tokens compartidos conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo), 1.000 pasos de entrenamiento solo de embeddings y continued pretraining sobre datos de HPLT 4.0 con una mezcla del 85 % bokmål y 15 % nynorsk. Este checkpoint corresponde al paso 34.020 de 48.600 del CPT y añade una fase de annealing de 916 pasos (0,48 mil millones de tokens) sobre texto noruego de alta calidad con decaimiento lineal de la tasa de aprendizaje hasta cero. La conversión a formato Hugging Face se realizó con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades
- Generación de texto autoregresiva en noruego (bokmål y nynorsk), danés, sueco, alemán e inglés.
- Modelo base sin instruction tuning: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Capacidad de completar texto y continuar documentos en los idiomas del entrenamiento.
- Razonamiento y conocimiento del mundo limitados por su tamaño (2,12B) y por el volumen de datos vistos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Robustez ante ruido en la entrada: 0,400 en entrada limpia y una caída media de 0,042 bajo ruido en tres tareas de NorEval.

## Casos de uso
- Investigación sobre adaptación lingüística: sirve como punto de comparación para medir el efecto del annealing frente al checkpoint ml-cpt7 sin annealing en las mismas tareas de NorEval.
- Estudio de sustitución de tokenizador: permite analizar cómo afecta el reemplazo del vocabulario por uno noruego de 32k tokens al rendimiento en bokmål y nynorsk, con la inicialización por media de piezas documentada por el autor.
- Evaluación de modelos pequeños en noruego: con 2,12B parámetros y contexto de 4096, es adecuado para experimentos académicos de bajo coste computacional en tareas de comprensión lectora y conocimiento del mundo en noruego.
- Generación de texto noruego no supervisada: puede emplearse para completar documentos, generar corpus sintéticos de bokmål o nynorsk y aumentar datos de entrenamiento para tareas posteriores.
- Fine-tuning posterior para tareas concretas: al ser un modelo base, es un punto de partida razonable para ajuste supervisado en clasificación, extracción de información o resumen en noruego.
- Reproducibilidad y docencia: el proyecto publica los 50 modelos del estudio con la misma arquitectura y presupuesto, lo que facilita replicar experimentos y comparar estrategias de entrenamiento en un entorno controlado.

## Benchmarks y rendimiento
NorEval 1.1 (resultados publicados por el autor):

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,248 | 0,292 |
| nob_orthography | acc | 0,862 | 0,882 |
| nob_reading | f1 | 0,231 | 0,256 |
| nob_world | acc | 0,300 | 0,299 |
| nno_language | em_first | 0,481 | 0,562 |
| nno_world | acc | 0,321 | 0,321 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,400 en entrada limpia y -0,042 de media bajo ruido.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: en torno a 4,3 GB solo para pesos, más overhead de activaciones y caché KV; con contexto completo de 4096 tokens y batch pequeño, el consumo realista se sitúa en el rango de 6 a 8 GB.
- En cuantización de 8 bits: aproximadamente 2,2 GB de pesos; en 4 bits, alrededor de 1,2 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante); A100, H100 o GH200 para entrenamiento o evaluación a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo, incluido transformers 4.x según el autor), text-generation-inference (el modelo está etiquetado como compatible con endpoints), y conversión a llama.cpp u Ollama previa conversión a GGUF con herramientas externas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ml-cpt7-anneal | 2,12B | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Checkpoint 7 con annealing, base |
| ml-cpt7 | 2,12B | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Mismo checkpoint sin annealing; comparación directa del efecto del annealing |
| no-base-anneal | no disponible | no disponible | noruego | no disponible | Modelo noruego entrenado desde cero con la misma arquitectura y presupuesto |
| ml-base-anneal | no disponible | no disponible | multilingüe | no disponible | Modelo multilingüe entrenado desde cero, sin adaptación al noruego |

La comparación con modelos externos de la misma categoría (por ejemplo, Qwen3 pequeños o modelos noruegos como NorMistral o NB-BERT) no está disponible en la información proporcionada.

## Limitaciones y advertencias
- Es un modelo base sin instruction tuning: no debe usarse como asistente conversacional ni esperar que siga instrucciones de forma fiable.
- El propio autor advierte de que puede producir salidas incorrectas u ofensivas y que no está pensado para uso en producción.
- Entrenado sobre texto web (HPLT 4.0): es probable que herede sesgos presentes en esos datos, aunque no se detallan sesgos específicos.
- Riesgo de alucinación inherente a un modelo de 2,12B entrenado con un volumen limitado de tokens (18,84B noruegos en el CPT).
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Rendimiento claramente inferior en conocimiento del mundo (0,300 en nob_world, 0,321 en nno_world) y comprensión lectora (0,231 de F1 en nob_reading).
- Caída medible bajo ruido en la entrada (-0,042 de media), relevante si se despliega sobre texto real no limpio.
- Licencia no disponible: no puede confirmarse el uso comercial; conviene contactar con el autor antes de cualquier explotación.
- Proyecto académico de un curso universitario, sin mantenimiento ni soporte documentado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt7-anneal
- Modelo base (sin annealing): https://huggingface.co/BigFamTLLM/ml-cpt7
- Modelo multilingüe de partida: https://huggingface.co/BigFamTLLM/ml-base
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo danés desde cero: https://huggingface.co/BigFamTLLM/da-base
- Checkpoints CPT multilingües: https://huggingface.co/BigFamTLLM/ml-cpt1, https://huggingface.co/BigFamTLLM/ml-cpt2, https://huggingface.co/BigFamTLLM/ml-cpt3, https://huggingface.co/BigFamTLLM/ml-cpt4, https://huggingface.co/BigFamTLLM/ml-cpt5, https://huggingface.co/BigFamTLLM/ml-cpt6, https://huggingface.co/BigFamTLLM/ml-cpt8, https://huggingface.co/BigFamTLLM/ml-cpt9, https://huggingface.co/BigFamTLLM/ml-cpt10
- Versiones annealed de los checkpoints CPT: https://huggingface.co/BigFamTLLM/ml-cpt1-anneal, https://huggingface.co/BigFamTLLM/ml-cpt2-anneal, https://huggingface.co/BigFamTLLM/ml-cpt3-anneal, https://huggingface.co/BigFamTLLM/ml-cpt4-anneal, https://huggingface.co/BigFamTLLM/ml-cpt5-anneal, https://huggingface.co/BigFamTLLM/ml-cpt6-anneal, https://huggingface.co/BigFamTLLM/ml-cpt8-anneal, https://huggingface.co/BigFamTLLM/ml-cpt9-anneal, https://huggingface.co/BigFamTLLM/ml-cpt10-anneal
- Checkpoints CPT daneses: https://huggingface.co/BigFamTLLM/da-cpt1 a https://huggingface.co/BigFamTLLM/da-cpt10 y sus versiones annealed
- Modelos de solo embeddings: https://huggingface.co/BigFamTLLM/ml-emb, https://huggingface.co/BigFamTLLM/ml-emb-anneal, https://huggingface.co/BigFamTLLM/da-emb, https://huggingface.co/BigFamTLLM/da-emb-anneal
- Dataset HPLT 4.0: no disponible en la información proporcionada como enlace directo
- Paper, blog o demo: no disponibles en la información proporcionada
