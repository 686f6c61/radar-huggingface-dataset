# reallexi/lexi-coder-v5.1

## Resumen

Lexi 3.836B (identificador `reallexi/lexi-coder-v5.1`) es un modelo de generacion de texto especializado en codigo, desarrollado por Reallexi LLC mediante su plataforma AI Model Builder. Se trata de un ajuste fino por LoRA sobre `reallexi/lexi-coder-v4.3`, cuyo adaptador se ha fusionado en los pesos base, por lo que se distribuye como modelo autonomo sin necesidad de PEFT en tiempo de ejecucion. Con 3.859.090.432 parametros (3,86B), se posiciona en la gama de modelos pequenos aptos para hardware de consumo.

La relevancia del modelo es limitada y muy acotada: la ventana de contexto entrenada es de solo 1.024 tokens, el entrenamiento se realizo sobre una fraccion del dataset previsto (110.000 muestras, fase 28 de 258) y no se han publicado evaluaciones estandarizadas. El autor documenta el proceso con ejemplos antes/despues sobre prompts del propio conjunto de entrenamiento, que no constituyen una validacion independiente.

El modelo se publica bajo una licencia "other" que hereda los terminos del modelo base y del dataset de entrenamiento, sin que se detallen dichos terminos en la model card. Esto introduce incertidumbre juridica relevante para cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo phi3 (tag `phi3` en el repositorio), ajuste fino LoRA fusionado |
| Parametros totales | 3.859.090.432 (3,86B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | FP16/BF16, 8-bit (Q8_0), 4-bit (Q4_K_M); el repositorio incluye archivos GGUF |
| Idiomas soportados | no disponible (la model card no declara idiomas; los ejemplos incluyen texto en japones) |
| Licencia | other, con terminos heredados del modelo base y del dataset (`inherits-base-model-and-dataset-terms`) |
| Formato de pesos | safetensors y GGUF |
| Tamano del repositorio | 32,4 GB |
| Pesos en disco | 7,15 GB |
| Modelo base | `reallexi/lexi-coder-v4.3` |
| Dataset de entrenamiento | `reallexi/lexi-coder-v3-datasest` |
| Descargas | 374 |
| Fecha de creacion | 2026-08-13 |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer etiquetada como `phi3` en Hugging Face, con 3,86B de parametros. Sobre esa base se aplico un ajuste fino con LoRA de rango 16 y alpha 32, gestionado por la herramienta "Auto LoRA" de la plataforma Reallexi AI Model Builder (trabajo de entrenamiento numero 161). El adaptador resultante se fusiono en los pesos base, de modo que el artefacto distribuido es un modelo denso convencional, no un adaptador separado.

El entrenamiento cubre 15.000 pasos, 3 epocas y 110.000 muestras aprendidas, correspondientes a la fase 28 de 258 del dataset, es decir, aproximadamente un 11% del plan de datos previsto. No se documenta el numero total de tokens procesados, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card incluye una curva de perdida (`training_curve.png`) pero no valores numericos de la misma. No se declara ninguna innovacion arquitectonica adicional: no hay decodificacion especulativa, atencion lineal ni mecanismos de razonamiento extendido documentados.

## Capacidades

- Generacion de texto y codigo: el ajuste se orienta a completar y continuar fragmentos de codigo, con ejemplos en Python y comentarios en japones.
- Generacion de codigo en Python: los ejemplos de la model card muestran continuaciones de funciones de particionado, quicksort, mergesort y recorridos de arboles binarios.
- Soporte multilingue en la practica limitado: hay indicios de texto en japones en los prompts de ejemplo, pero no se declara una lista de idiomas soportados.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documenta soporte.
- Modo thinking, vision o audio: no disponible; el modelo es exclusivamente de texto.
- Razonamiento matematico formal: no documentado ni evaluado.

## Casos de uso

- Autocompletado de codigo en editor local: con 3,86B de parametros y pesos de 1,98 GB en Q4_K_M, puede ejecutarse en un portatil con GPU de consumo para sugerir continuaciones de funciones Python, aunque limitado a fragmentos de menos de 1.024 tokens.
- Prototipado rapido de scripts: util para generar esqueletos de funciones de ordenacion, recorrido de estructuras de datos y utilidades de consola en Python, el dominio reflejado en los ejemplos de entrenamiento.
- Asistente de documentacion tecnica breve: puede redactar comentarios y docstrings para funciones cortas, siempre que el contexto quepa en la ventana de 1.024 tokens.
- Entorno de aprendizaje y experimentacion: sirve como caso de estudio de un pipeline de ajuste fino LoRA reproducible con la plataforma Reallexi, util para quienes quieran replicar el flujo con sus propios datos.
- Despliegue en entornos con recursos muy limitados: al caber en 8 GB de VRAM en cuantizacion de 8 bits, es viable en estaciones de trabajo modestas o en CPU con llama.cpp para tareas de generacion de codigo no criticas.
- Generacion de ejercicios de programacion: puede producir fragmentos de codigo de estructura de datos para material docente, con revision humana obligatoria dado el riesgo de salidas incorrectas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye exclusivamente comparaciones antes/despues sobre prompts extraidos del propio conjunto de entrenamiento, que el autor describe explicitamente como "no es un benchmark". No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandarizada, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para pesos: 7,19 GB en FP16/BF16, 3,59 GB en 8-bit (Q8_0) y 1,98 GB en 4-bit (Q4_K_M). Hay que anadir el overhead de contexto y runtime.
- GPU recomendadas: no disponible; el autor no especifica hardware de referencia. Por tamano, una RTX 4090 (24 GB) ejecuta el modelo en FP16 con holgura, y una RTX 3060 de 12 GB lo ejecuta en FP16 al limite o en 8-bit con margen.
- Cabe en GPU de consumo: si. En 4-bit cabe en GPUs de 4-6 GB de VRAM; en 8-bit en GPUs de 6-8 GB; en FP16 requiere al menos 8 GB.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp y Ollama mediante los archivos GGUF incluidos, y text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Lexi 3.836B (`reallexi/lexi-coder-v5.1`) | 3,86B | 1.024 tokens | other (heredada, sin detallar) | Ajuste LoRA sobre base phi3; sin benchmarks publicados |
| Phi-3-mini (Microsoft) | 3,8B | 4.096-128.000 tokens segun variante | MIT | Base arquitectonica de referencia; con evaluaciones publicadas |
| Qwen2.5-Coder-3B (Alibaba) | 3,09B | 32.768 tokens | Apache 2.0 | Especializado en codigo, con benchmarks publicados |
| Llama-3.2-3B (Meta) | 3,21B | 128.000 tokens | Llama 3.2 Community License | Proposito general, con evaluaciones publicadas |

La comparacion se ofrece por categoria de tamano; no se dispone de datos de rendimiento de Lexi 3.836B que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ventana de contexto de solo 1.024 tokens: insuficiente para la mayoria de tareas reales de generacion de codigo, que requieren contexto de archivo o de repositorio.
- Entrenamiento incompleto: solo se cubrio la fase 28 de 258 del dataset (110.000 muestras), lo que sugiere que el ajuste no alcanzo la cobertura prevista por el autor.
- Ausencia total de benchmarks independientes: no hay evidencia publicada de calidad en HumanEval, MMLU ni tareas comparables.
- Ejemplos de la model card de calidad dudosa: las continuaciones "despues" del entrenamiento incluyen codigo sintacticamente incorrecto o incompleto (por ejemplo, funciones de ordenacion mal definidas), lo que sugiere un riesgo alto de generar codigo no funcional.
- Riesgo de alucinacion elevado en un modelo pequeno y con ajuste limitado; requiere revision y ejecucion de tests en cualquier uso productivo.
- Licencia incierta: los terminos efectivos se heredan del modelo base y del dataset sin que se detallen en la model card; es necesario revisar ambas fuentes antes de cualquier redistribucion o uso comercial.
- Idiomas no declarados: no hay garantia de calidad fuera del ingles y del japones presente en los ejemplos.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento extendido.
- Metricas de adopcion muy bajas (374 descargas, 0 likes) y ausencia de comunidad o soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reallexi/lexi-coder-v5.1
- Modelo base: https://huggingface.co/reallexi/lexi-coder-v4.3
- Dataset de entrenamiento: `reallexi/lexi-coder-v3-datasest` (referenciado en la model card, sin URL directa proporcionada)
- Plataforma de entrenamiento: https://llm.reallexi.io
- Archivos de ejemplos: `SAMPLES.md` y `samples.json` en el repositorio del modelo
- Curva de entrenamiento: `training_curve.png` en el repositorio del modelo
