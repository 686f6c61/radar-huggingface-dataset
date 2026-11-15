# balllvin/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MLX

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MLX es una cuantizacion en 4 bits del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, publicada por el usuario balllvin en Hugging Face. El nombre del modelo base combina referencias a DeepSeek-V4-Pro y a Qwen3.5, lo que sugiere una fusion (merge) o derivado de ambos linajes, aunque no se dispone de documentacion oficial que confirme la composicion exacta. El tag de arquitectura declarado en el repositorio es `qwen3_5`, lo que apunta a una base de la familia Qwen.

El modelo cuenta con 9.409.813.744 parametros totales (aproximadamente 9,4 mil millones) y se distribuye en formato MLX con pesos safetensors cuantizados a 4 bits, con un tamano de repositorio de 6,0 GB. Esta pensado para inferencia en hardware Apple Silicon mediante el framework MLX, lo que lo hace relevante para desarrolladores que trabajan en Mac con chip M-series y necesitan ejecutar localmente un modelo de ~9B sin depender de GPU dedicadas.

El sufijo "UNCENSORED-heretic" indica que el modelo base ha sido sometido a un proceso de ablacion de rechazos (tipicamente mediante la tecnica conocida como "abliteration" o fine-tuning de "heretic") para eliminar las negativas de seguridad aprendidas en el alineamiento original. El acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face. No se han publicado resultados de benchmarks ni informacion sobre datos de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`, base de la familia Qwen) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (formato MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 4-bit) |

## Arquitectura y entrenamiento

La arquitectura declarada es un transformer de la familia Qwen (tag `qwen3_5`), con aproximadamente 9,4 mil millones de parametros. El modelo es una cuantizacion 4-bit del checkpoint xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, que a su vez parece ser un derivado o merge de modelos DeepSeek y Qwen segun la nomenclatura. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o fine-tuning supervisado.

El elemento diferenciador del modelo base es el proceso "heretic"/"uncensored", que tipicamente consiste en una ablacion de direcciones de rechazo en el espacio de activaciones o en los pesos, orientada a eliminar las respuestas de negativa ante ciertas peticiones. No se documenta la metodologia concreta empleada. La cuantizacion a 4 bits en formato MLX es responsabilidad del autor del repositorio (balllvin) y no del modelo base.

## Capacidades

- Generacion de texto conversacional y de proposito general, segun el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y generacion de codigo: capacidades esperables por herencia de la base Qwen, aunque no verificadas con benchmarks en este repositorio.
- Comportamiento "sin censura" en el modelo base: se espera una menor tasa de rechazos ante peticiones que el alineamiento original bloquearia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX 4-bit permite ejecutar un modelo de ~9,4B en equipos con memoria unificada de 16 GB o superior, sin GPU dedicada, usando el framework MLX de Apple.
- Prototipado rapido en portatiles: util para desarrolladores que quieren iterar sobre prompts y flujos conversacionales en local antes de desplegar en infraestructura mayor.
- Investigacion sobre alineamiento y rechazos: el caracter "uncensored" del modelo base lo hace util para estudiar como varian las tasas de negativa tras la ablacion, comparando con el modelo original.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion, guiones o contenido donde el modelo base alineado tenderia a rechazar ciertos temas.
- Evaluacion de tecnicas de cuantizacion: comparar la calidad de la salida 4-bit MLX frente al checkpoint original en tareas de generacion y razonamiento.
- Experimentacion con merges de modelos: dado el origen hibrido (DeepSeek/Qwen) del checkpoint base, sirve como caso de estudio de como se comportan las fusiones de modelos en tareas abiertas.
- Uso educativo y de demostracion: ejecucion de un LLM de ~9B en hardware de consumo para clases, talleres o demos sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 6,0 GB en formato MLX 4-bit; se recomienda al menos 8 GB de memoria unificada libre para la carga del modelo, y 16 GB para trabajar con contexto amplio con holgura.
- Hardware objetivo: Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante el framework MLX.
- GPU dedicadas (NVIDIA A100, H100, RTX 4090): el formato MLX no esta pensado para CUDA; para esas GPU habria que reconvertir los pesos a otro formato (por ejemplo GGUF o safetensors estandar), lo cual no se documenta en este repositorio.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; en GPU NVIDIA de consumo requeriria conversion de formato.
- Opciones de despliegue: MLX (`mlx-lm`) es el runtime nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este repositorio concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| balllvin/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MLX | ~9,4B | No disponible | MLX 4-bit | Apache 2.0 | Cuantizacion MLX del checkpoint base, acceso gated |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9,4B (presumible) | No disponible | safetensors (presumible) | No disponible | Modelo base sin cuantizar |
| Qwen3 8B (familia Qwen) | ~8B | No disponible | safetensors, GGUF | Apache 2.0 (segun familia) | Alternativa alineada de tamano similar |
| Llama 3.1 8B | ~8B | 128K (segun ficha oficial) | safetensors, GGUF | Llama 3.1 Community License | Alternativa ampliamente desplegada |

La comparativa con Qwen3 8B y Llama 3.1 8B se ofrece como referencia de categoria por tamano; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Modelo "uncensored": la ablacion de rechazos del checkpoint base implica que el modelo puede generar contenido que los modelos alineados rechazarian; requiere supervision y filtros adicionales en cualquier despliegue publico.
- Riesgo de alucinacion: no hay evaluaciones publicadas que cuantifiquen la fiabilidad factual; se debe tratar la salida con las precauciones habituales de un LLM de ~9B.
- Cuantizacion 4-bit: la perdida de precision puede degradar tareas sensibles como matematicas, codigo o razonamiento de varios pasos; no se documenta una evaluacion comparativa frente al checkpoint original.
- Idiomas: no se especifican los idiomas soportados; el comportamiento multilingue no esta verificado.
- Contexto: se desconoce la longitud de ventana efectiva del modelo base y si la cuantizacion la preserva.
- Origen del modelo base: la nomenclatura DeepSeek/Qwen no esta documentada oficialmente en la informacion disponible; conviene verificar la procedencia y los terminos del checkpoint base antes de uso comercial.
- Licencia: aunque el repositorio declara Apache 2.0, el modelo base podria tener condiciones adicionales (especialmente al tratarse de un derivado "uncensored"); revisar la ficha del modelo base antes de redistribuir.
- Sin benchmarks ni documentacion de entrenamiento: no es posible evaluar su calidad frente a alternativas sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-MLX
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Framework MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-lm
