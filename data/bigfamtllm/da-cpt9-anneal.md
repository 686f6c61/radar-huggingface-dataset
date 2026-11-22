# BigFamTLLM/da-cpt9-anneal

## Resumen

da-cpt9-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un proyecto de estudiantes del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base (no ajustado por instrucciones) especializado en noruego, obtenido a partir de da-cpt9 mediante un proceso de adaptación desde el danés: sustitución del tokenizador por uno noruego de 32.000 tokens, entrenamiento inicial solo de embeddings durante 1.000 pasos y preentrenamiento continuado sobre texto noruego hasta acumular 23.940 millones de tokens vistos.

La variante "anneal" aplica 916 pasos adicionales (aproximadamente 0,48B de tokens) sobre texto de alta calidad en bokmål y nynorsk, con decaimiento lineal de la tasa de aprendizaje hasta cero. El modelo emplea la arquitectura Qwen3 (transformer denso de 36 capas, tamaño oculto 2176, 34 cabezas de atención con 17 cabezas KV y embeddings atados) y una longitud de contexto de 4096 tokens.

Su relevancia radica en ser un experimento controlado y reproducible sobre adaptación lingüística entre lenguas germánicas nórdicas con presupuesto reducido (8 GPU GH200), y en publicar evaluaciones sistemáticas con NorEval 1.1 tanto en versión 0-shot como 1-shot, además de pruebas de robustez frente a ruido. Es un modelo de investigación, no destinado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, embeddings atados) |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | danés (da), noruego (no), bokmål (nb), nynorsk (nn) |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers 4.x y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuración densa: 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA), embeddings atados entre entrada y salida, y contexto de 4096 tokens. El entrenamiento se realizó con Megatron-LM sobre 8 GPU GH200 en el clúster Olivia de Sigma2, con longitud de secuencia 4096, batch size 128, optimizador AdamW y tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de warmup y sin decaimiento (1e-4 en la fase de solo embeddings).

El proceso parte de da-base (modelo danés entrenado desde cero) y aplica una adaptación al noruego en varias fases: primero un cambio de tokenizador a uno noruego de 32.000 tokens, donde los tokens compartidos entre ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo; después, 1.000 pasos de entrenamiento solo de embeddings; y finalmente preentrenamiento continuado sobre datos de HPLT 4.0 con una mezcla del 85% bokmål y 15% nynorsk. da-cpt9-anneal corresponde al checkpoint 9 de 10 (paso 43.740 de 48.600) y añade una fase de annealing de 916 pasos sobre texto de alta calidad en bokmål y nynorsk con decaimiento lineal de la tasa de aprendizaje hasta cero. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en noruego bokmål y nynorsk, con conocimiento residual de danés por herencia del modelo base.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Razonamiento y conocimiento del mundo limitados, coherentes con un modelo de 2,12B entrenado con 23,94B de tokens noruegos.
- Capacidad de continuar texto, completar frases y servir como punto de partida para fine-tuning supervisado.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües restringidas a los idiomas declarados (da, no, nb, nn); no se garantiza un comportamiento sólido en otras lenguas.

## Casos de uso

- Investigación en adaptación lingüística entre lenguas cercanas: sirve como punto de comparación controlado frente a no-base, da-base y ml-base del mismo proyecto para estudiar el efecto de la sustitución de tokenizador y del preentrenamiento continuado en el rendimiento en noruego.
- Evaluación de estrategias de annealing: el checkpoint permite medir, con NorEval 1.1, la ganancia de 916 pasos adicionales sobre texto de alta calidad respecto a da-cpt9 sin annealing, útil para decidir políticas de decaimiento de learning rate en presupuestos pequeños.
- Generación de texto noruego para tareas de completado y perplejidad: adecuado para calcular puntuaciones de probabilidad sobre corpus bokmål y nynorsk, por ejemplo para filtrar o clasificar texto en pipelines de datos.
- Punto de partida para fine-tuning supervisado en noruego: al ser un modelo base de 2,12B con contexto de 4096, puede ajustarse con SFT o LoRA para tareas concretas (clasificación, extracción, resumen) cuando se dispone de datos etiquetados en bokmål o nynorsk.
- Estudio de robustez ortográfica: el modelo publica resultados bajo ruido en tres tareas de NorEval, lo que permite analizar la sensibilidad de modelos pequeños a errores tipográficos y variantes ortográficas del noruego.
- Docencia y reproducibilidad: el proyecto documenta la receta completa (Megatron-LM, 8 GH200, HPLT 4.0, hiperparámetros), lo que lo convierte en un caso práctico para cursos de NLP sobre entrenamiento desde cero y adaptación de dominio.
- Comparación de tokenizadores para lenguas nórdicas: la inicialización de embeddings nuevos a partir de la media de las piezas del tokenizador anterior es un método replicable que puede evaluarse con este checkpoint frente a alternativas.

## Benchmarks y rendimiento

NorEval 1.1 (resultados publicados por el autor en la model card):

| Grupo de tarea | Metrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,251 | 0,287 |
| nob_orthography | acc | 0,863 | 0,883 |
| nob_reading | f1 | 0,244 | 0,272 |
| nob_world | acc | 0,298 | 0,299 |
| nno_language | em_first | 0,481 | 0,573 |
| nno_world | acc | 0,306 | 0,320 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,389 en entrada limpia y una caída media de -0,044 bajo ruido.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 4,3 GB solo para pesos (2,12B × 2 bytes), más memoria para el contexto y activaciones; con 4096 tokens de contexto conviene reservar al menos 6-8 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,2 GB para pesos; en 4 bits, alrededor de 1,1 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con 8 GB o más para bfloat16 (RTX 3060 12 GB, RTX 4070, RTX 4090, L4, A10); para entrenamiento o fine-tuning, A100 o H100.
- Cabe en GPU de consumo: sí, en bfloat16 en tarjetas con 8-12 GB o más; el entrenamiento original usó 8 GH200.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM` y `dtype=torch.bfloat16`), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM no están documentados para este checkpoint y requerirían conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt9-anneal | 2,12B | 4096 | da, no, nb, nn | no disponible | Modelo base de investigación, sin SFT; resultados NorEval 1.1 publicados |
| BigFamTLLM/da-cpt9 | 2,12B | 4096 | da, no, nb, nn | no disponible | Mismo checkpoint sin annealing; permite aislar el efecto de los 916 pasos finales |
| BigFamTLLM/no-base-anneal | 2,12B (misma arquitectura) | 4096 | no, nb, nn | no disponible | Entrenado desde cero en noruego en lugar de adaptado desde danés |
| BigFamTLLM/ml-base-anneal | 2,12B (misma arquitectura) | 4096 | multilingüe | no disponible | Entrenado desde cero en varios idiomas con el mismo presupuesto |

No se dispone de comparaciones con modelos externos al proyecto (por ejemplo, modelos noruegos de otros autores) en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse como asistente conversacional sin un fine-tuning previo.
- Entrenado sobre texto web (HPLT 4.0): puede generar contenido incorrecto u ofensivo, tal como advierte el propio autor.
- No está pensado para producción; el autor lo describe explícitamente como modelo de investigación.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribución.
- Rendimiento moderado en conocimiento del mundo (nob_world 0,298 en 0-shot y 1-shot) y en lectura (nob_reading f1 0,244 en 0-shot), coherente con su tamaño y presupuesto de entrenamiento.
- Sensibilidad al ruido ortográfico: caída media de -0,044 en las tareas evaluadas con perturbaciones.
- Cobertura lingüística limitada a danés y noruego; no se garantiza calidad en otras lenguas pese a la herencia multilingüe del proyecto.
- Riesgo de alucinación y de sesgos presentes en los datos web de HPLT 4.0; no se documentan filtros o mitigaciones específicas.
- No se publican versiones cuantizadas, por lo que el despliegue en entornos con poca VRAM requiere conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt9-anneal
- Modelo base (da-cpt9): https://huggingface.co/BigFamTLLM/da-cpt9
- Modelo danés original (da-base): https://huggingface.co/BigFamTLLM/da-base
- Versión sin annealing (da-cpt9): https://huggingface.co/BigFamTLLM/da-cpt9
- Modelo noruego desde cero (no-base): https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingüe desde cero (ml-base): https://huggingface.co/BigFamTLLM/ml-base
- Checkpoint 10 con annealing (da-cpt10-anneal): https://huggingface.co/BigFamTLLM/da-cpt10-anneal
- Checkpoint 8 con annealing (da-cpt8-anneal): https://huggingface.co/BigFamTLLM/da-cpt8-anneal
- Dataset HPLT 4.0: no disponible (no se incluye enlace en la información proporcionada)
- Paper o blog del proyecto: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
