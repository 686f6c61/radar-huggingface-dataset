# JimmyJamJr/pythia-1.4b-deeprd-curriculum-L75

## Resumen

Pythia-1.4b-deeprd-curriculum-L75 es un ajuste fino completo del modelo base EleutherAI/pythia-1.4b, publicado por el usuario JimmyJamJr en Hugging Face. No se trata de un modelo de propósito general, sino de un experimento de investigación centrado en el entrenamiento curricular sobre una tarea sintética de predicción de pruebas deductivas generada por una versión modificada del generador DeepRD. El objetivo declarado es evaluar si un currículo progresivo sobre la longitud de "lookahead" (la profundidad de búsqueda necesaria para distinguir el siguiente paso correcto de un distractor) mejora la capacidad de razonamiento deductivo de un transformer pequeño.

El modelo conserva la arquitectura GPT-NeoX del Pythia-1.4b original, con aproximadamente 1.414 millones de parámetros en pesos safetensors, y se distribuye en formato transformers con licencia no especificada. El checkpoint corresponde al momento en que se completó la etapa L = 75 del currículo (paso 2.375.625), con un tamaño de paso s = 1 y una tasa de aprendizaje constante de 2.7e-5 en precisión bf16.

Su relevancia es acotada y fundamentalmente académica: sirve como evidencia empírica sobre estrategias de curriculum learning aplicadas a razonamiento deductivo simbólico, no como un modelo listo para producción. Al no estar instruido ni alineado, y al haber sido entrenado exclusivamente sobre texto sintético de un dominio muy restringido, su utilidad práctica fuera de ese contexto es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 1.414.647.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Pythia-1.4b emplea 2048 tokens, pero el autor no lo confirma) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en bf16) |
| Idiomas soportados | no disponible (entrenado sobre texto sintetico en ingles para una tarea concreta) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Pythia-1.4b de EleutherAI: un transformer decoder-only de tipo GPT-NeoX con 1.414 millones de parámetros, sin modificaciones estructurales según la información disponible. El ajuste fino es completo (no LoRA ni adaptadores), con optimizador AdamW, tasa de aprendizaje constante de 2.7e-5 y precisión bf16. La semilla empleada fue 1234.

El entrenamiento sigue un currículo sobre dos ejes simultáneos: la longitud de lookahead y el vocabulario de atributos. En la etapa k, el modelo se entrena con problemas cuyo lookahead se muestrea uniformemente en el rango 1..L_k, donde L_k = k × s (con s = 1), y con un vocabulario de atributos de 2(L_k + 1) etiquetas. El modelo avanza a la siguiente etapa cuando su precisión reciente de coincidencia exacta en entrenamiento es suficientemente alta. El checkpoint publicado corresponde a la etapa L = 75 completada en el paso 2.375.625. Los datos de entrenamiento son problemas deductivos sintéticos generados por una versión modificada del generador DeepRD: cada prompt enumera reglas sobre nombres de atributos ficticios, un hecho inicial y un objetivo, seguido de un prefijo de prueba; el modelo debe predecir el siguiente atributo válido en una prueba del objetivo.

## Capacidades

- Predicción del siguiente paso en pruebas deductivas sintéticas: dado un conjunto de reglas, un hecho inicial y un objetivo, genera el siguiente atributo que continúa una prueba válida.
- Razonamiento deductivo de cadena sobre reglas de implicación del tipo "si alguien es X, entonces es Y", con profundidades de lookahead de hasta 75 según el currículo de entrenamiento.
- Generación de texto autoregresiva estándar (pipeline text-generation), aunque sin ajuste instructivo ni alineación.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso fuera del dominio sintético entrenado.
- No dispone de capacidades multilingües declaradas; el entrenamiento se realizó sobre texto sintético en inglés.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.

## Casos de uso

- Investigación en curriculum learning: el modelo sirve como punto de comparación para estudiar cómo la progresión de lookahead afecta la precisión en tareas deductivas sintéticas, comparándolo con checkpoints de etapas anteriores o con entrenamiento sin currículo.
- Evaluación de razonamiento simbólico en modelos pequeños: permite medir la capacidad de un transformer de 1.4B para ejecutar búsquedas breadth-first implícitas sobre reglas lógicas, usando el protocolo de evaluación del autor (decodificación greedy y comparación del primer token delimitado por espacio o puntuación).
- Reproducción de experimentos de DeepRD: útil para replicar o extender los resultados del generador modificado de problemas deductivos, verificando la generalización a distintos niveles de lookahead.
- Estudio de degradación por longitud de lookahead: al conocer la etapa exacta de entrenamiento (L = 75), permite analizar la curva de precisión en función de la profundidad del problema y detectar el punto de quiebre del modelo.
- Generación de datos sintéticos de prueba: puede emplearse para producir continuaciones de pruebas deductivas que sirvan como datos de entrenamiento o validación para modelos mayores, siempre con verificación posterior.
- Docencia y divulgación sobre razonamiento en LLM: como ejemplo didáctico de cómo se entrena y evalúa un modelo sobre una tarea lógica formalizada, con un formato de prompt explícito y verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2.8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1.5 GB de pesos; en 4 bits, alrededor de 0.8 GB (aunque el autor no publica versiones cuantizadas).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 3070, RTX 4070) es suficiente para inferencia en bf16; para mayor throughput, A100 o H100.
- Cabe holgadamente en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta presente en el repo), vLLM y llama.cpp/Ollama previa conversión a GGUF (no publicada por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JimmyJamJr/pythia-1.4b-deeprd-curriculum-L75 | 1.414 M | no disponible | Ajuste fino curricular sobre tarea deductiva sintetica | no disponible | Hugging Face (0 descargas) |
| EleutherAI/pythia-1.4b | 1.414 M | 2048 tokens | Modelo base de propósito general | Apache 2.0 | Hugging Face, ampliamente usado |
| EleutherAI/pythia-1.4b-deduped | 1.414 M | 2048 tokens | Modelo base con dataset deduplicado | Apache 2.0 | Hugging Face |
| Modelos de razonamiento simbólico pequeños (p. ej. fine-tunes sobre ProofWriter o DeepRD) | variable | variable | Ajuste sobre tareas lógicas | variable | variable |

La comparación directa con el Pythia-1.4b original es la más informativa: comparten arquitectura y tamaño, pero el modelo aquí descrito está especializado en una única tarea sintética y no conserva necesariamente las capacidades generales del base. Frente a otros fine-tunes sobre tareas lógicas, la diferencia clave es el uso de un currículo explícito sobre lookahead y vocabulario de atributos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre problemas deductivos sintéticos de un generador modificado; su rendimiento fuera de ese dominio no está caracterizado y previsiblemente será deficiente.
- No es un modelo instructivo ni alineado: no sigue instrucciones generales ni mantiene conversaciones útiles.
- Riesgo elevado de alucinación y de generar pruebas lógicamente inválidas, especialmente en problemas con lookahead superior al visto en la etapa final del currículo.
- El vocabulario de atributos es ficticio y limitado al generado por el currículo (2(L_k + 1) etiquetas en la etapa k); no generaliza a nombres o predicados del mundo real.
- No hay información sobre sesgos, pero al entrenarse sobre texto sintético en inglés, cualquier sesgo provendría del generador y del modelo base.
- La licencia no está especificada, lo que impide determinar si se permite uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- El repositorio tiene 0 descargas y 0 likes, y no consta documentación adicional ni evaluación independiente.
- No se publican versiones cuantizadas (GGUF, GPTQ, AWQ) ni resultados de benchmarks, lo que dificulta su evaluación comparativa.
- El modelo base Pythia-1.4b tiene un contexto de 2048 tokens, pero el autor no confirma el contexto efectivo tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JimmyJamJr/pythia-1.4b-deeprd-curriculum-L75
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Repositorio Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios del autor ni demos adicionales.
