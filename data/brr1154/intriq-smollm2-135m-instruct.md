# BRR1154/INTRIQ-SmolLM2-135M-Instruct

## Resumen

INTRIQ-SmolLM2-135M-Instruct es un modelo de lenguaje de 134,5 millones de parámetros derivado de HuggingFaceTB/SmolLM2-135M-Instruct mediante edición quirúrgica de pesos. Lo publica el usuario BRR1154 en Hugging Face y está orientado a flujos de trabajo técnicos multi-turno, seguimiento de instrucciones y generación de código Python de carácter científico y matemático. No se trata de un reentrenamiento completo, sino de una modificación selectiva de tensores sobre el modelo base ya instruido.

La intervención declarada por el autor afecta a 12 tensores causales en capas intermedias y tardías (14, 16, 18, 20, 22, 24, 26, 28 y 29), con el objetivo de reforzar la cohesión conversacional y el razonamiento científico sin degradar la estructura espectral de la matriz de pesos. El autor valida el resultado con WeightWatcher basado en teoría de matrices aleatorias (RMT), con una suite conversacional de 15 turnos y con pruebas de comportamiento Promptfoo.

Su relevancia práctica reside en el tamaño: al ser un modelo de 135M de parámetros con licencia Apache 2.0, puede ejecutarse en CPU y en GPUs de consumo muy modestas, lo que lo hace útil para prototipado rápido, entornos embebidos y pruebas de pipelines de agentes sin coste de infraestructura. La contrapartida es un techo de capacidad bajo en conocimiento factual y razonamiento complejo, como reflejan sus resultados en los benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), 30 capas, d_model = 576, d_intermediate = 1536, 9 cabezas de atención |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; el modelo base admite GGUF y cuantizaciones de llama.cpp) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo Llama con 30 capas, dimensión de modelo de 576, dimensión intermedia de 1536 y 9 cabezas de atención. Parte de SmolLM2-135M-Instruct, que ya incorpora ajuste por instrucciones; sobre esa base, el autor aplica una edición quirúrgica de pesos que modifica 12 tensores causales distribuidos en las capas 14, 16, 18, 20, 22, 24, 26, 28 y 29. Según la model card, el objetivo es eliminar la "amnesia conversacional" (pérdida de contexto en diálogos multi-turno) y reforzar el razonamiento científico sin provocar degradación matricial.

La validación técnica se apoya en WeightWatcher con teoría de matrices aleatorias: se ajusta la densidad espectral empírica a una ley de potencias y se comprueba que el exponente alfa se mantiene en régimen de cola pesada saludable. El autor reporta un alfa medio global de 6,4079 en el modelo base y 6,4121 tras la edición, con 0 de 212 capas colapsadas (alfa >= 4,11 en todas las matrices editadas). No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; la intervención descrita es de edición de pesos, no de reentrenamiento.

## Capacidades

- Generación de texto conversacional y multi-turno, con énfasis declarado en mantener la cohesión a lo largo de flujos de trabajo técnicos.
- Seguimiento de instrucciones estructuradas y tareas de alcance acotado (scoping).
- Generación de código Python científico y matemático, incluida vectorización con NumPy y anotaciones de tipo.
- Razonamiento científico elemental y recuperación de hechos a nivel de educación primaria y secundaria (evaluado en ARC-Easy, ARC-Challenge y OpenBookQA).
- Resolución de ambigüedad de correferencia (evaluado en WinoGrande).
- Razonamiento de sentido común situacional y completado de frases (evaluado en HellaSwag).
- Compatibilidad con el ecosistema transformers y con text-generation-inference según las etiquetas del repositorio.
- No se declara soporte de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Prototipado de asistentes técnicos en local: el modelo puede gestionar conversaciones multi-turno de ámbito ingenieril en una CPU o GPU de gama baja, lo que permite iterar sobre el diseño de prompts y plantillas de chat sin coste de API.
- Generación de utilidades Python para análisis de datos: resulta adecuado para producir funciones pequeñas con type hints, como cálculos de Z-score móvil sobre arrays de NumPy, al estar específicamente orientado a código científico.
- Pruebas de pipelines de agentes y evaluación de prompts: su tamaño reducido permite ejecutar suites de evaluación tipo Promptfoo o lm-eval con muchas repeticiones y bajo coste computacional.
- Enseñanza y demostración de LLM: sirve para ilustrar el funcionamiento de un transformer decoder-only, el formato de chat y la inferencia con transformers en cursos y talleres, dado que cabe en cualquier equipo.
- Filtrado y clasificación de texto ligera en el borde: puede desplegarse en dispositivos con recursos limitados para tareas de etiquetado o reformulación de texto en inglés, siempre que no se requiera precisión factual alta.
- Generación de borradores de documentación técnica en inglés: útil para esbozar pasos de un flujo de trabajo o descripciones de funciones, con revisión humana obligatoria posterior.
- Componente de decodificación especulativa: por su tamaño, puede emplearse como modelo borrador en esquemas de speculative decoding junto a modelos mayores, aunque esta integración no está documentada por el autor.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), medidos con EleutherAI lm-eval v0.4.13:

| Benchmark | Métrica | INTRIQ | Base esperado (según autor) |
|---|---|---|---|
| ARC-Easy | Accuracy | 50,00 % | 49,8 % – 53,0 % |
| ARC-Easy | Normalized Accuracy | 44,00 % | no disponible |
| ARC-Challenge | Accuracy | 26,00 % | 25,0 % – 28,0 % |
| ARC-Challenge | Normalized Accuracy | 26,00 % | no disponible |
| HellaSwag | Accuracy | 44,00 % | 41,5 % – 43,5 % |
| HellaSwag | Normalized Accuracy | 44,00 % | no disponible |
| OpenBookQA | Accuracy | 16,00 % | 36,0 % – 39,0 % (rango de referencia del autor para el base) |
| OpenBookQA | Normalized Accuracy | 38,00 % | no disponible |
| WinoGrande | Accuracy | 52,00 % | 51,0 % – 53,0 % |

Evaluaciones internas declaradas por el autor:

| Suite | SmolLM2-135M base | INTRIQ-SmolLM2-135M |
|---|---|---|
| Suite conversacional de flujos de trabajo (15 turnos) | 90,33 / 300,0 (30,1 %) | 300,0 / 300,0 (100,0 %) |
| Promptfoo Behavioral Suite | 0 / 5 (0,0 %) | 5 / 5 (100,0 %) |
| WeightWatcher RMT (alfa global) | 6,4079 (saludable) | 6,4121 (saludable, 0/212 capas colapsadas) |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,5M parámetros × 4 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB.
- En fp16/bf16: alrededor de 0,27 GB de pesos; en cuantización de 8 bits, unos 0,14 GB; en 4 bits, unos 0,07 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funciona en RTX 3060, RTX 4060, GTX 1650, T4, e incluso en iGPU modernas. No requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo y se ejecuta en CPU con un rendimiento aceptable para generación de textos cortos.
- Opciones de despliegue: transformers (soporte oficial), text-generation-inference (etiqueta del repositorio) y, por herencia del modelo base, llama.cpp, Ollama y vLLM son viables, aunque no están verificados específicamente para estos pesos editados.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera un throughput alto en GPU y decenas de tokens por segundo en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| INTRIQ-SmolLM2-135M-Instruct | 134,5M | no disponible | Apache 2.0 | Edición de pesos sobre SmolLM2; orientado a flujos técnicos multi-turno; resultados de benchmarks declarados por el autor |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8.192 tokens (según la documentación pública del modelo base; no confirmado para este derivado) | Apache 2.0 | Modelo base; referencia directa de comparación; mayor difusión y validación comunitaria |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens (según documentación pública del modelo base) | Apache 2.0 | Alternativa del mismo fabricante con mayor capacidad, a costa de más recursos |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (según documentación pública del modelo) | Apache 2.0 | Alternativa de tamaño superior con mejor rendimiento general y contexto más amplio |

La comparación de rendimiento entre INTRIQ y el modelo base solo puede hacerse con los datos declarados por el autor; no hay evaluaciones independientes disponibles.

## Limitaciones y advertencias

- El modelo tiene 134,5M de parámetros: su conocimiento factual y su capacidad de razonamiento complejo son limitados, como muestran los resultados de ARC-Challenge (26 %) y OpenBookQA (16 % en accuracy).
- Los benchmarks y las suites internas están declarados por el autor y marcados como no verificados; deben tomarse con cautela hasta que exista replicación independiente.
- La edición quirúrgica de pesos no está documentada con detalle suficiente (no se especifican los valores modificados ni el procedimiento exacto), lo que dificulta auditar el comportamiento del modelo.
- Riesgo de alucinación inherente a un modelo de este tamaño, especialmente en preguntas factuales y en contextos largos.
- Soporte únicamente de inglés; no se declara multilenguaje.
- La longitud de contexto no está especificada en la información disponible; no se debe asumir la del modelo base sin verificación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base y las condiciones de sus datos de entrenamiento.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se declara soporte de tool calling ni de agentes; su uso en pipelines de producción con llamadas a herramientas requeriría implementación externa.
- Para producción, se recomienda validar el modelo contra el base en las tareas concretas antes de adoptarlo, dado que las mejoras reportadas se centran en suites internas del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/INTRIQ-SmolLM2-135M-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Tutorial de ejecución de SmolLM2-135M-Instruct: https://aiindigo.com/tutorials/getting-started-with-smollm2-135m-instruct-run-a-capable-llm-on-any-device
- Paper de WeightWatcher (teoría de matrices aleatorias aplicada a redes): no disponible en la información proporcionada
- Repositorio de Promptfoo: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
