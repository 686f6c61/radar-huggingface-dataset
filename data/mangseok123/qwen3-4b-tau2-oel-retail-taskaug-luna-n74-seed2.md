# MANGSEOK123/qwen3-4b-tau2-oel-retail-taskaug-luna-n74-seed2

## Resumen

`MANGSEOK123/qwen3-4b-tau2-oel-retail-taskaug-luna-n74-seed2` es un ajuste fino del modelo Qwen3-4B-Instruct-2507 (4.411.424.256 parametros) publicado por el usuario MANGSEOK123. No se trata de un modelo base nuevo ni de un lanzamiento oficial de Alibaba, sino de un experimento de investigacion centrado en la internalizacion de habilidades (skill internalization) sobre el benchmark tau2-bench en su dominio retail (v1.0.1).

La tecnica empleada es la autodestilacion on-policy (OPSD) con el codigo de OEL (LMOps). El alumno afronta cada tarea sin la habilidad en el prompt de sistema, mientras que un profesor congelado (copia del modelo inicial con la habilidad inyectada en el system prompt) le sirve de referencia. La perdida es una KL inversa a nivel de token sobre los 256 tokens mas probables del alumno. Se usaron 74 pares de entrenamiento de los 807 disponibles en el conjunto de tareas aumentadas con GPT-5.6-Luna.

El interes del modelo es acotado y muy especifico: sirve como artefacto reproducible para estudiar si un modelo pequeno puede absorber en sus pesos un comportamiento conversacional que originalmente dependia de instrucciones externas, en el contexto de agentes de atencion al cliente en retail. No hay informacion publica sobre licencia, idiomas ni rendimiento medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (el entrenamiento usa prompts de hasta 8192 tokens) |
| Tipos de cuantizacion | pesos publicados en BF16; cuantizaciones GGUF/AWQ no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.4 mil millones de parametros. Sobre esa base, el autor aplica autodestilacion on-policy: en cada turno el alumno interactua con un simulador de usuario (GPT-4.1-mini, temperatura 0.7) sin la habilidad en el prompt, mientras un profesor congelado (el modelo inicial con la habilidad en el system prompt) genera la distribucion objetivo. La perdida es una KL inversa a nivel de token restringida al top-256 del alumno.

Los detalles de entrenamiento son concretos: 74 pares de los 807 del conjunto Task Aug. (tareas aumentadas con GPT-5.6-Luna, utilidad = 1), presupuesto equiparado a TANI (Matched), semilla 2 para el submuestreo (`random.Random(2).sample(pool, N)`), orden de datos y muestreo de rollouts, 1 epoca y 8 pares por actualizacion. Optimizador AdamW con lr 3e-6 constante, weight decay 0.01 y grad clip 1.0; limite de 8192 tokens de prompt y 1024 de respuesta por turno. Pesos en BF16. El codigo de entrenamiento es OEL (LMOps).

## Capacidades

- Generacion de texto conversacional multi-turno orientada a tareas de agente en retail (tau2-bench).
- Internalizacion de una habilidad concreta: el objetivo del ajuste es que el modelo reproduzca el comportamiento del profesor sin necesidad de instrucciones en el system prompt.
- Soporte de tool calling y function calling heredado de Qwen3-4B-Instruct-2507 (no verificado especificamente tras el ajuste).
- Razonamiento de varios pasos en el contexto de resolucion de tareas de agente (herencia del modelo base).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre skill internalization: reproducir el experimento de OPSD con semilla 2 y comparar con otras semillas o presupuestos de pares para medir la varianza del proceso.
- Evaluacion en tau2-bench retail: usar el modelo como baseline ajustado frente al Qwen3-4B-Instruct-2507 original en el subconjunto retail v1.0.1.
- Estudio de destilacion on-policy: analizar como afecta la KL inversa sobre top-256 tokens al comportamiento conversacional de un modelo de 4B.
- Agente de atencion al cliente en retail (prototipo): el modelo esta entrenado para resolver tareas del dominio retail sin instrucciones externas, lo que simplifica el prompt de sistema en un pipeline de agente.
- Comparacion de tecnicas de ajuste: contrastar OPSD con TANI (Matched) u otros metodos con el mismo presupuesto de datos.
- Reproducibilidad de experimentos: el autor documenta semilla, submuestreo y hiperparametros, lo que permite replicar el entrenamiento con el codigo OEL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8.8 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica conviene reservar 12-16 GB.
- En cuantizacion de 8 bits: alrededor de 4.5-5 GB de pesos; en 4 bits, unos 2.5-3 GB (cuantizaciones no publicadas por el autor, habria que generarlas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 sin problemas.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en tarjetas de 12 GB con cuantizacion.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3-4b-tau2-oel-retail-taskaug-luna-n74-seed2 | 4.4B | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.4B | no disponible en esta ficha | Apache 2.0 (segun el modelo base original) | Hugging Face |
| Otros ajustes de Qwen3-4B para tau2-bench | no disponible | no disponible | no disponible | no disponible |

La comparacion de rendimiento con el modelo base u otras variantes no puede establecerse porque no hay resultados de benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes: no hay validacion externa de su calidad.
- No se especifica licencia, lo que impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de usarlo en produccion.
- El ajuste se hizo sobre solo 74 pares de entrenamiento y 1 epoca, lo que limita la generalizacion fuera del dominio retail de tau2-bench.
- No hay informacion sobre idiomas soportados; el modelo base es multilingue, pero el ajuste puede haber degradado el comportamiento fuera del dominio de entrenamiento.
- Riesgo de sobreajuste a las tareas aumentadas con GPT-5.6-Luna y al simulador GPT-4.1-mini empleado durante el entrenamiento.
- Al ser una destilacion de un profesor con la habilidad en el system prompt, puede reproducir sesgos o errores del profesor.
- Riesgo de alucinacion inherente a los modelos de 4B en tareas de agente con tool calling.
- No hay datos de benchmarks que permitan verificar la mejora frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-taskaug-luna-n74-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codigo OEL (LMOps): no disponible en la informacion proporcionada
- Paper de tau2-bench: no disponible en la informacion proporcionada
