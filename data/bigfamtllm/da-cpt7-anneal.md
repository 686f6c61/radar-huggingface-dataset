# BigFamTLLM/da-cpt7-anneal

## Resumen

da-cpt7-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un proyecto de estudiantes de la asignatura IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base —no ajustado por instrucciones— derivado de da-cpt7, que a su vez parte de da-base (un modelo entrenado desde cero en danés) y se adapta al noruego mediante un tokenizador específico, entrenamiento de embeddings y preentrenamiento continuado sobre texto noruego. Esta versión concreta incorpora una fase de *annealing* de 916 pasos adicionales sobre texto de alta calidad en bokmål y nynorsk, con decaimiento lineal de la tasa de aprendizaje hasta cero.

El modelo emplea la arquitectura Qwen3 (transformer denso con 36 capas, tamaño oculto 2176, 34 cabezas de atención con 17 cabezas KV y embeddings atados) y una ventana de contexto de 4096 tokens. Su relevancia radica en que forma parte de un estudio comparativo controlado de 50 modelos (noruego, danés y multilingüe, con y sin *annealing*) que busca medir el efecto de la adaptación lingüística y del *annealing* en un presupuesto de cómputo fijo. Es, por tanto, un artefacto de investigación, no un modelo listo para producción.

La información pública disponible es limitada: la model card no especifica la licencia, no documenta capacidades de tool calling ni de razonamiento multi-paso, y no ofrece benchmarks más allá de NorEval 1.1 y una prueba de robustez ante ruido. Cualquier evaluación fuera del ámbito noruego queda fuera del alcance documentado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3): 36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, embeddings atados |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | danés (da), noruego (no), bokmål (nb), nynorsk (nn) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); repositorio de 4,2 GB |
| Tokenizador | noruego, 32k tokens |
| Tokens noruegos vistos | 18,84B (preentrenamiento continuado) + 0,48B (annealing) |
| Modelo base | BigFamTLLM/da-cpt7 (finetune) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuración densa: 36 capas transformer, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados entre entrada y salida. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia (Sigma2), con longitud de secuencia 4096, batch size 128, optimizador AdamW y tasa de aprendizaje máxima de 5e-4 con 2000 pasos de warmup y sin decaimiento (1e-4 en la fase de solo embeddings).

La cadena de adaptación al noruego consta de tres etapas: sustitución del tokenizador danés por uno noruego de 32k tokens (los tokens compartidos conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador anterior), 1000 pasos de entrenamiento solo de embeddings y preentrenamiento continuado sobre datos de HPLT 4.0 con una mezcla del 85% bokmål y 15% nynorsk, hasta 18,84B tokens noruegos vistos. Este checkpoint (7 de 10, paso 34.020 de 48.600) se sometió después a *annealing*: 916 pasos adicionales (0,48B tokens) sobre texto de alta calidad en bokmål y nynorsk con decaimiento lineal de la tasa de aprendizaje hasta 0. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x. No se documenta RLHF, DPO ni ningún ajuste por preferencias.

## Capacidades

- Generación de texto autoregresiva en bokmål, nynorsk, noruego y danés; es un modelo base, sin ajuste por instrucciones.
- Capacidad de lectura y comprensión de texto noruego, medida en NorEval 1.1 (tareas nob_reading y nno_language).
- Conocimiento ortográfico del noruego (nob_orthography, accuracy 0,865 en 0-shot y 0,879 en 1-shot).
- Conocimiento factual limitado sobre el mundo (nob_world y nno_world, en torno a 0,30 de accuracy).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta capacidad multilingüe más allá de danés y noruego.

## Casos de uso

- Investigación sobre adaptación lingüística: sirve como punto de comparación en estudios que miden el efecto del *annealing* frente al checkpoint sin *annealing* (da-cpt7), ya que ambos comparten arquitectura, presupuesto y datos de preentrenamiento.
- Evaluación de tokenizadores noruegos: al haber sustituido el tokenizador danés por uno de 32k tokens con inicialización por media de piezas, permite analizar el impacto del vocabulario en tareas de NorEval 1.1.
- Generación de texto en bokmål y nynorsk para experimentos académicos: con 4096 tokens de contexto puede completar fragmentos, párrafos y documentos cortos en esas variantes, siempre con revisión humana.
- Estudio de robustez ante ruido: la model card reporta 0,393 en entrada limpia y -0,042 de caída media bajo ruido en tres tareas de NorEval, lo que lo hace útil como referencia para investigar degradación en texto ruidoso.
- Reproducción de experimentos docentes: al ser un proyecto de la asignatura IN5640 con 50 modelos publicados, permite reproducir y auditar la metodología completa de entrenamiento y evaluación.
- Fine-tuning posterior como base de investigación: al ser un modelo base de 2,12B con licencia no especificada, puede servir de punto de partida para ajustes supervisados en noruego, siempre que se aclare antes la licencia.
- Análisis de ortografía y normalización: su accuracy de 0,865-0,879 en nob_orthography lo hace adecuado como componente de experimentos de corrección ortográfica en bokmål.

## Benchmarks y rendimiento

NorEval 1.1 (resultados reportados en la model card):

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,245 | 0,280 |
| nob_orthography | acc | 0,865 | 0,879 |
| nob_reading | f1 | 0,237 | 0,246 |
| nob_world | acc | 0,298 | 0,299 |
| nno_language | em_first | 0,458 | 0,546 |
| nno_world | acc | 0,314 | 0,307 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,393 en entrada limpia y -0,042 de media bajo ruido.

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 4,3 GB solo para pesos (2,12B × 2 bytes), más caché KV y activaciones; con 4096 tokens de contexto el consumo adicional es moderado por el uso de GQA (17 cabezas KV).
- En cuantización de 8 bits cabría en aproximadamente 2,2 GB de pesos; en 4 bits, en torno a 1,1 GB. No obstante, el autor no publica versiones cuantizadas (GGUF, AWQ, GPTQ), por lo que habría que generarlas.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) debería poder ejecutar el modelo en bfloat16 o fp16 con contexto completo; para entrenamiento o *fine-tuning* se recomiendan A100, H100 o GH200.
- El entrenamiento original se realizó en 8 GH200, lo que da una idea del coste de reentrenamiento, no de la inferencia.
- Opciones de despliegue: transformers (versión 4.x según la model card), text-generation-inference (etiqueta endpoints_compatible) y, previsiblemente, llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt7-anneal | 2,12B | 4.096 | da, no, nb, nn | no disponible | Modelo base de investigación con *annealing* |
| BigFamTLLM/da-cpt7 | 2,12B | 4.096 | da, no, nb, nn | no disponible | Mismo modelo sin *annealing*; referencia directa del efecto del *annealing* |
| BigFamTLLM/no-base-anneal | no disponible en la información | no disponible | no | no disponible | Modelo noruego entrenado desde cero con la misma arquitectura y presupuesto |
| BigFamTLLM/ml-base-anneal | no disponible en la información | no disponible | multilingüe | no disponible | Modelo multilingüe entrenado desde cero con la misma arquitectura y presupuesto |

La comparación más informativa es interna al proyecto: da-cpt7 frente a da-cpt7-anneal, y los modelos adaptados (da-*) frente a los entrenados desde cero (no-*) y multilingües (ml-*). No se dispone de datos para comparar con modelos noruegos de terceros (por ejemplo, NorGPT o variantes de Llama adaptadas al noruego) dentro de la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y no debe usarse como asistente conversacional sin *fine-tuning* previo.
- El autor advierte explícitamente de que puede producir salidas incorrectas u ofensivas, y que no está pensado para uso en producción.
- Riesgo de alucinación alto: el conocimiento factual es bajo (nob_world 0,298 y nno_world 0,314 de accuracy), lo que indica un conocimiento del mundo limitado.
- Ventana de contexto de solo 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a danés y noruego (bokmål y nynorsk); no se documenta rendimiento en otras lenguas.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido, por lo que no debería utilizarse en producción sin aclarar este punto con el autor.
- Robustez limitada ante ruido: caída media de -0,042 en las tres tareas evaluadas con perturbaciones.
- Entrenado sobre texto web de HPLT 4.0, con los sesgos y la calidad variable que ello implica; no se documentan filtros de toxicidad ni evaluaciones de sesgo.
- Proyecto docente con recursos limitados (8 GH200, 48.600 pasos totales): los resultados no son comparables a modelos industriales del mismo tamaño entrenados con presupuestos mucho mayores.
- Solo disponible en safetensors; no hay versiones cuantizadas oficiales, lo que limita el despliegue en hardware modesto sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt7-anneal
- Modelo base (checkpoint 7 sin *annealing*): https://huggingface.co/BigFamTLLM/da-cpt7
- Modelo danés de partida: https://huggingface.co/BigFamTLLM/da-base
- Versión con *annealing* del modelo danés: https://huggingface.co/BigFamTLLM/da-base-anneal
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Versión con *annealing* del modelo noruego: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Versión con *annealing* del modelo multilingüe: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Checkpoints CPT daneses (1 a 10): https://huggingface.co/BigFamTLLM/da-cpt1 … https://huggingface.co/BigFamTLLM/da-cpt10
- Checkpoints CPT daneses con *annealing* (1 a 10): https://huggingface.co/BigFamTLLM/da-cpt1-anneal … https://huggingface.co/BigFamTLLM/da-cpt10-anneal
- Checkpoints CPT multilingües (1 a 10): https://huggingface.co/BigFamTLLM/ml-cpt1 … https://huggingface.co/BigFamTLLM/ml-cpt10
- Checkpoints CPT multilingües con *annealing* (1 a 10): https://huggingface.co/BigFamTLLM/ml-cpt1-anneal … https://huggingface.co/BigFamTLLM/ml-cpt10-anneal

No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código ni demos adicionales.
