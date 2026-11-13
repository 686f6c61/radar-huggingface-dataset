# AfrialdiNizam01/DeepSeek-V4-Pro-Qwen3.5-9B

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B es un fine-tune de razonamiento publicado por AfrialdiNizam01 sobre el modelo base unsloth/Qwen3.5-9B. Se trata de una destilación de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", orientada principalmente a matematicas y disciplinas STEM, que conserva la eficiencia y facilidad de despliegue de la clase de 9B parametros. El checkpoint completo ocupa 19,3 GB en safetensors y cuenta con 9.653.104.368 parametros reales.

El modelo resuelve el problema de obtener razonamiento estructurado de un profesor de mayor capacidad en un tamano que cabe en hardware de consumo y en GPUs de inferencia de gama media. Su relevancia inmediata radica en que combina entrenamiento supervisado (SFT) con refuerzo (RL/GSPO) sobre aproximadamente 250.000 muestras centradas en matematica y ciencia, manteniendo licencia Apache 2.0 y soporte para tool calling, function calling y despliegue via vLLM y llama.cpp.

La arquitectura subyacente es la del Qwen3.5-9B (familia qwen3_5, pipeline image-text-to-text en el repo base), reutilizada aqui como text-generation con capacidades multimodales heredadas. El autor reporta evaluaciones de despliegue con NVFP4 en vLLM y variantes MTP en GGUF Q8_0, publicadas en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-9B (familia qwen3_5); no se detalla la configuracion interna en la informacion disponible |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (variante MTP), NVFP4 (evaluada en vLLM); otras no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte del checkpoint unsloth/Qwen3.5-9B, un transformer de la familia Qwen3.5 con unos 9,65 mil millones de parametros. Sobre esa base se aplica un proceso de destilacion desde DeepSeek-V4-Pro en modo "Max Effect": las respuestas del profesor actuan como senal supervisada para ensenar descomposicion de problemas y patrones de solucion multi-paso. El entrenamiento combina SFT con etapas de RL (etiquetadas como gspo en los tags del repositorio), lo que sugiere optimizacion de politica con refuerzo sobre las trayectorias de razonamiento.

El corpus de entrenamiento ronda las 250.000 muestras centradas en matematicas y STEM, sin datos SFT especificos de programacion. A pesar de ello, el autor reporta pequenas ganancias post-entrenamiento en programacion y uso de herramientas, atribuibles a transferencia entre dominios. La model card menciona tambien evaluacion de decodificacion especulativa mediante MTP (multi-token prediction) en variantes GGUF, y despliegue NVFP4 en vLLM, aunque no se detallan hiperparametros, numero total de tokens vistos ni composicion exacta del dataset.

## Capacidades

- Generacion de texto conversacional y razonamiento estructurado multi-paso.
- Razonamiento matematico y resolucion de problemas STEM, nucleo del entrenamiento.
- Programacion: mejora marginal reportada por transferencia, sin SFT especifico de codigo.
- Tool calling y function calling (tags explicitos tool-use y function-calling).
- Razonamiento agéntico y multi-step reasoning derivado de la destilacion.
- Capacidades multimodales heredadas del base (pipeline image-text-to-text en el repo original).
- Multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (reasoning) y decodificacion especulativa MTP en variantes GGUF.
- Compatibilidad con endpoints (tag endpoints_compatible) y text-generation-inference.

## Casos de uso

- Tutoria matematica automatizada: el modelo puede descomponer problemas de algebra, calculo o fisica en pasos intermedios y explicar cada uno, aprovechando la destilacion de razonamiento de DeepSeek-V4-Pro sobre 250.000 muestras STEM.
- Resolucion de problemas cientificos en pipelines de investigacion: util para generar hipotesis, comprobaciones dimensionales y derivaciones intermedias en cuadernos automatizados, con validacion humana posterior.
- Asistente de estudio para estudiantes de ingenieria: conversaciones multi-turno con correccion de errores paso a paso, adecuado por su tamano de 9B que permite despliegue local.
- Generacion de codigo asistida en entornos con tool calling: integrable en pipelines de CI/CD para autocompletar funciones, escribir tests unitarios y consultar APIs mediante function calling, aunque con menor especializacion que modelos code-specific.
- Agentes de automatizacion con multi-step reasoning: orquestacion de tareas que requieren planificacion y llamadas a herramientas, apoyandose en los tags tool-use y function-calling.
- Procesamiento multilingue en seis idiomas: atencion al cliente o documentacion tecnica en espanol, ingles, chino, coreano, japones y ruso dentro de una misma instancia.
- Despliegue en hardware de consumo: al ser un 9B con cuantizacion GGUF Q8_0 y soporte llama.cpp, puede ejecutarse en estaciones de trabajo con GPU unica para prototipos y demos.
- Evaluacion de decodificacion especulativa: las variantes MTP permiten medir aceleracion de inferencia en entornos de investigacion sobre tecnicas de multi-token prediction.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona evaluaciones de despliegue (vLLM NVFP4 y llama.cpp MTP-Q8_0) y ganancias cualitativas en programacion y tool use, pero sin cifras de MMLU, GSM8K, HumanEval ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 19-20 GB, coherente con el tamano del repo de 19,3 GB.
- Cuantizacion Q8_0 GGUF: en torno a 10-11 GB de VRAM, viable en GPUs consumer de gama alta.
- Cuantizaciones de 4 bits (no listadas explicitamente en la informacion): no disponible.
- GPU recomendadas: A100 40 GB o H100 para precision completa y alto throughput; RTX 4090 (24 GB) para BF16 ajustado o Q8_0; RTX 3090/4080 para Q8_0.
- Cabe en GPU consumer: si, con cuantizacion Q8_0 en tarjetas de 12-16 GB o superiores; en BF16 requiere 24 GB o mas.
- Opciones de despliegue: vLLM (evaluado con NVFP4), llama.cpp (variantes MTP GGUF), text-generation-inference (tag del repo), transformers nativo.
- Latencia y throughput: no disponible; el autor menciona evaluacion de MTP y NVFP4 sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B | 9,65B | no disponible | Apache 2.0 | Hugging Face (repo propio + GGUF separado) | Destilado de DeepSeek-V4-Pro, foco math/STEM |
| Qwen3.5-9B (base, unsloth) | ~9B | no disponible | Apache 2.0 (heredada) | Hugging Face | Modelo base sin destilacion; capacidades multimodales |
| DeepSeek-V4-Pro (profesor) | no disponible | no disponible | no disponible | no disponible | Modelo de mayor escala usado como fuente de destilacion |

La comparacion cuantitativa de rendimiento con alternativas de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados en la model card; al heredar de Qwen3.5-9B, pueden persistir sesgos del corpus base y del profesor DeepSeek-V4-Pro.
- Riesgo de alucinacion: elevado en dominios fuera de matematicas y STEM, ya que el SFT se concentra en esas areas y no hay datos de codigo especificos.
- Limitacion de contexto: la longitud de contexto no esta especificada, lo que impide garantizar conversaciones o documentos largos.
- Cobertura idiomatica limitada a seis idiomas (en, zh, ko, ja, es, ru); otros idiomas no garantizados.
- Sin benchmarks publicados: no es posible validar afirmaciones de rendimiento antes de desplegar en produccion.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del profesor destilado.
- Repositorio con 0 descargas y 1 like en el momento de la ficha: ecosistema minimo, sin validacion comunitaria.
- Las capacidades multimodales dependen de que el checkpoint herede el proyector de vision; la model card remite a un repo GGUF separado para el proyector, lo que anade complejidad de despliegue.
- El tag gspo y las etapas RL no vienen acompanados de detalles de hiperparametros, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/AfrialdiNizam01/DeepSeek-V4-Pro-Qwen3.5-9B
- Variantes MTP GGUF y proyector de vision: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
