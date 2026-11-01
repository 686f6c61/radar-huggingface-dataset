# jaydeepb/llama-3.2-1b-code-run1

## Resumen

llama-3.2-1b-code-run1 es un ajuste fino (fine-tune) de Llama 3.2 1B de Meta, publicado por el usuario jaydeepb en HuggingFace. El modelo se ha entrenado durante una epoca sobre una muestra de un millon de secuencias de 128 tokens extraidas de The Stack, el gran corpus de codigo fuente abierto de BigCode. No se trata de un modelo orientado a uso general de generacion de codigo, sino a un artefacto de investigacion: forma parte de un experimento sobre memorizacion extrable en modelos de lenguaje.

Su relevancia es principalmente cientifica. El propio autor indica que las etiquetas de memorizacion extrable de este "run1" (con parametros k=50, l=50 y decodificacion greedy) se usan como datos de entrenamiento de un clasificador que predice memorizacion, mientras que un modelo hermano, "run2", entrenado sobre una muestra disjunta, sirve de conjunto de evaluacion retenido. La arquitectura base es un transformer decoder de la familia Llama 3.2 con aproximadamente 1.236 millones de parametros y licencia Llama 3.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base Llama 3.2 1B es de 128.000 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 (llama3.2) |
| Formato de pesos | safetensors (2,5 GB de tamano de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.2-1B, un transformer decoder compacto de la familia Llama 3.2, y conserva su arquitectura sin modificaciones. El ajuste fino se realizo durante una unica epoca sobre un subconjunto de The Stack (bigcode/the-stack) compuesto por un millon de secuencias de 128 tokens cada una. Los hiperparametros publicados son: learning rate de 5e-5, planificador de tasa de aprendizaje coseno y semilla 42.

La particularidad del experimento es metodologica: tras el entrenamiento se calcularon etiquetas de memorizacion extrable mediante extraccion greedy con k=50 y l=50 (es decir, comprobar si secuencias de 50 tokens del corpus pueden recuperarse con el modelo generando 50 tokens). Estas etiquetas del run1 se emplean como datos de entrenamiento de un clasificador de memorizacion, mientras que el run2, ajustado sobre una muestra disjunta de un millon de secuencias, actua como conjunto de evaluacion nuevo. No hay informacion sobre RLHF, DPO ni instrucciones de alineacion posteriores.

## Capacidades

- Generacion de texto autoregresiva mediante la pipeline text-generation de transformers.
- Conocimiento de codigo fuente derivado del ajuste fino sobre The Stack, aunque con objetivos de investigacion y no de utilidad practica.
- Comportamiento de memorizacion medible y documentado: el modelo esta diseñado para que se pueda estudiar que secuencias del corpus de entrenamiento son extrables.
- No se declara soporte de tool calling, function calling, agentes, vision ni audio.
- No se declara soporte de chat ni de instrucciones: se trata de un modelo base ajustado a continuacion de texto (causal LM).

## Casos de uso

- Investigacion sobre memorizacion en LLMs: estudiar cuantas secuencias de un corpus de codigo son extrables tras un ajuste fino ligero, usando las etiquetas k=50/l=50 como referencia.
- Entrenamiento de clasificadores de memorizacion: las etiquetas del run1 sirven como datos supervisados para predecir que secuencias seran memorizadas antes del entrenamiento.
- Conjunto de control experimental: comparar el run1 con el run2 (muestra disjunta) para separar memorizacion real de generalizacion.
- Estudio de privacidad y extraccion de datos: evaluar el riesgo de que un modelo filtre fragmentos literales de codigo con licencias o datos personales presentes en The Stack.
- Base para ablations de ajuste fino: replicar el experimento variando hiperparametros (learning rate, longitud de secuencia, numero de epocas) sobre la misma receta documentada.
- Docencia y demostraciones: ilustrar en cursos el efecto del sobreajuste y la memorizacion con un modelo pequeno y facilmente ejecutable en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5-3 GB, acorde al tamano del repositorio (2,5 GB en safetensors).
- Cabe comodamente en GPUs de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 3060 o superiores) es suficiente; incluso es ejecutable en CPU con razonable velocidad dado su tamano.
- Para el ajuste fino replicable, una GPU de 16-24 GB (RTX 4090, A10G) o una A100 es mas que suficiente para un modelo de 1,2B de parametros con secuencias de 128 tokens.
- Despliegue: compatible con la libreria transformers (library_name declarado); al ser un modelo Llama en safetensors, deberia funcionar tambien con llama.cpp (tras conversion a GGUF), Ollama, vLLM y TGI, aunque no hay configuraciones oficiales publicadas.
- Latencia y throughput: no disponible; por su tamano de ~1,2B de parametros cabe esperar decenas de tokens por segundo en GPU de consumo y unos pocos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de codigo | Licencia | Proposito |
|---|---|---|---|---|---|
| jaydeepb/llama-3.2-1b-code-run1 | 1.236M | no disponible (base: 128k) | The Stack, 1M secuencias de 128 tokens, 1 epoca | Llama 3.2 | Investigacion sobre memorizacion |
| meta-llama/Llama-3.2-1B (base) | 1.236M | 128.000 tokens | Corpus general multilingue de Meta | Llama 3.2 | Modelo base de uso general |
| bigcode/starcoder2-3B | ~3.000M | 16.384 tokens | The Stack v2 (masivo, dedicado) | BigCode OpenRAIL-M | Generacion de codigo en produccion |
| Qwen2.5-Coder-1.5B | ~1.500M | 32.768 tokens (base) / 128k (instruct) | Corpus de codigo dedicado de Alibaba | Qwen (uso comercial permitido con condiciones) | Generacion de codigo practica |

La diferencia clave es que el run1 no compite en benchmarks de codigo: es un instrumento experimental, mientras que Starcoder2 3B o Qwen2.5-Coder 1.5B estan optimizados para utilidad real en programacion.

## Limitaciones y advertencias

- No es un modelo de instruccion ni de chat: generar texto continuo sin plantilla de conversacion, por lo que no es adecuado para asistentes sin un ajuste adicional.
- Riesgo alto y deliberado de memorizacion: el modelo puede reproducir literalmente fragmentos de codigo de The Stack, con las implicaciones de licencia y privacidad que ello conlleva (licencias de codigo fuente, datos personales en comentarios, secretos filtrados en el corpus).
- Calidad de generacion de codigo no evaluada: al entrenar solo 1 epoca sobre secuencias de 128 tokens, la coherencia en contextos largos probablemente sea pobre.
- Idiomas y capacidades multilingues: no disponibles en la documentacion.
- Licencia Llama 3.2: permite uso comercial, pero sujeta a la Llama 3.2 Community License de Meta, con condiciones de atribucion y restricciones para ciertos casos (por ejemplo, entidades con mas de 700 millones de usuarios activos mensuales deben solicitar licencia a Meta).
- Trazabilidad limitada: la model card es minima, sin informacion de evaluacion, cuantizacion ni soporte oficial; no hay mantenimiento garantizado al ser un modelo experimental de un usuario individual.
- Descargas muy bajas (318) y sin likes: sin comunidad de revision que haya validado el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/llama-3.2-1b-code-run1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/bigcode/the-stack
- Modelo hermano (run2, evaluacion retenida): no disponible (no se proporciona URL)
- Paper, blog o demo: no disponible
