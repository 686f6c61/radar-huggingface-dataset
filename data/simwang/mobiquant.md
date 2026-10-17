# Simwang/MoBiQuant

## Resumen

MoBiQuant es un método de cuantización de precisión mixta para modelos de lenguaje basados en la arquitectura LLaMA. El repositorio `Simwang/MoBiQuant` no contiene un modelo generativo completo, sino un conjunto de checkpoints suplementarios (parámetros de calibración de OmniQuant y parámetros de router) que se aplican sobre cuatro modelos base de LLaMA ya preentrenados: Llama-2-7B, Llama-3-8B, Llama-3.2-3B y Llama-3.2-1B.

El problema que aborda es la compresión de pesos en escenarios de muy bajos bits combinando una base de 2 bits con tres porciones residuales de 2 bits enrutadas dinámicamente. La innovación reside en ese mecanismo de enrutado (router) que decide qué residuos se activan para cada proyección, cubriendo las proyecciones q/k/v/o de la atención y gate/up/down del MLP. El resultado es un número medio efectivo de bits variable según el objetivo de evaluación, en lugar de un esquema fijo como 4 bits en atención.

Es relevante ahora porque los repositorios de solo-parámetros de cuantización son cada vez más comunes para reproducir métodos de compresión sin redistribuir pesos base. Conviene subrayar que esta publicación no es un formato de despliegue empaquetado: la implementación evalúa la cuantización mediante simulación en punto flotante y el propio autor advierte de que no establece ganancias de velocidad de inferencia. El repo ocupa 14,7 GB y, en el momento de la consulta, registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers decoder-only (modelos base LLaMA); el release aporta parámetros de cuantización y router, no una arquitectura nueva |
| Parametros totales | Depende del modelo base: 1B, 3B, 7B y 8B segun el checkpoint (llama3-1b, llama3-3b, llama2-7b, llama3-8b) |
| Parametros activos | No aplica (no es un modelo MoE; el router actua sobre las porciones residuales de cuantizacion, no sobre expertos) |
| Longitud de contexto | No disponible en la informacion proporcionada (viene determinada por el modelo base empleado) |
| Tipos de cuantizacion | Cuantizacion solo de pesos con activaciones de 16 bits; tamano de grupo 128; bit slices [2, 2, 2, 2] (base de 2 bits mas tres porciones residuales enrutadas) |
| Idiomas soportados | Ingles (segun metadatos del repositorio) |
| Licencia | Apache-2.0 (aplicable a este release; los modelos base conservan sus licencias y condiciones de acceso) |
| Formato de pesos | Checkpoints PyTorch `.pth` (`omni_parameters.pth` y `router_parameters.pth`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El release no define una arquitectura de red nueva. Se apoya en cuatro modelos base LLaMA (Llama-2-7B, Llama-3-8B, Llama-3.2-3B y Llama-3.2-1B) y proporciona dos ficheros por modelo: `omni_parameters.pth` con los parámetros de cuantización aprendidos (calibración de tipo OmniQuant) y `router_parameters.pth` con los parámetros del router entrenados. La cuantización es weight-only con activaciones en 16 bits y tamaño de grupo 128. El esquema de bits es [2, 2, 2, 2]: una base de 2 bits más tres porciones residuales de 2 bits que el router activa de forma selectiva.

El enrutado abarca las proyecciones q/k/v/o de la atención y gate/up/down del MLP, lo que implica que el coste en bits no es uniforme por capa ni por módulo. La model card especifica explícitamente que la atención no está fijada a 4 bits y que el número medio efectivo de bits depende del enrutado y del objetivo de evaluación. No se detalla en la información disponible el número de tokens de calibración, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que el proceso descrito es de calibración de cuantización post-entrenamiento, no de entrenamiento generativo.

Un punto técnico crítico: el repositorio no incluye `router_stats.pth`, fichero que el flujo de trabajo de reanudación por directorio espera. Por tanto, el par descargado por sí solo no constituye un paquete completo de reanudación por directorio.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas: heredadas del modelo base LLaMA subyacente, no del propio release de cuantización.
- Compresión de pesos de modelos LLaMA: aplica cuantización de muy bajo bit (base de 2 bits más residuos enrutados) sobre pesos ya preentrenados.
- Enrutado selectivo por proyección: el router decide qué porciones residuales se activan en atención (q/k/v/o) y MLP (gate/up/down).
- Calibración OmniQuant: incorpora parámetros de calibración aprendidos para los cuatro modelos base soportados.
- Tool calling / function calling: no disponible en la información proporcionada (dependería del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (dependería del modelo base).
- Capacidades multilingües: los metadatos declaran únicamente inglés para este release.
- Capacidades especiales (modo thinking, visión, audio): ninguna declarada en la información proporcionada.

## Casos de uso

- Investigación en cuantización de precisión mixta: reproducir el método MoBiQuant sobre Llama-2-7B o Llama-3-8B usando los parámetros calibrados publicados, comparando el número medio efectivo de bits frente a esquemas fijos de 4 bits.
- Estudio del enrutado dinámico de bits: analizar qué proyecciones de atención y MLP concentran más porciones residuales activas y cómo varía según el modelo base (1B, 3B, 7B, 8B).
- Evaluación de la degradación de calidad en bajos bits: emplear la simulación en punto flotante para medir la pérdida de precisión en tareas de lenguaje antes de comprometerse con un formato empaquetado.
- Comparación metodológica frente a otras técnicas de cuantización post-entrenamiento (GPTQ, AWQ, OmniQuant estándar) sobre los mismos modelos base y los mismos conjuntos de evaluación.
- Base para desarrollo de kernels de despliegue: dado que el release no es un formato empaquetado, sirve como referencia para quien quiera implementar kernels de bajo bit reales a partir de los parámetros calibrados.
- Docencia y divulgación técnica: ilustrar de forma práctica la diferencia entre cuantización simulada en punto flotante y cuantización empaquetada lista para producción.
- Ahorro de almacenamiento en pipelines con modelos LLaMA pequeños: el checkpoint de Llama-3.2-1B puede interesar para experimentos de compresión en entornos con poca VRAM, siempre que se asuma la ausencia de aceleración medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de perplejidad, y tampoco ofrece cifras de latencia o throughput. La única referencia cuantitativa es la configuración de bits (grupo 128, bit slices [2, 2, 2, 2]) y la advertencia de que el número medio efectivo de bits depende del enrutado y del objetivo de evaluación.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato medido. Como referencia orientativa no confirmada por el autor, un modelo de 7B en 2 bits de pesos requeriría del orden de 2 GB solo para pesos, y en 4 bits en torno a 4 GB, a lo que hay que sumar activaciones en 16 bits y el overhead de las porciones residuales enrutadas (hasta 8 bits si se activan todas).
- GPU recomendadas: no especificadas. Para los modelos base de 7B/8B cualquier GPU con 16 GB o más (por ejemplo, RTX 4090, A100, H100) sería un punto de partida razonable, pero el release no ofrece datos de despliegue.
- Cabe en GPU de consumo: probablemente sí en el caso de Llama-3.2-1B y Llama-3.2-3B, y potencialmente también en 7B/8B según cuantización, aunque no hay confirmación medida en la información disponible.
- Opciones de despliegue: el repositorio no está pensado para cargarse con `AutoModelForCausalLM.from_pretrained()`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El flujo indicado es descargar los `.pth` con `huggingface_hub.snapshot_download` y usar el repositorio de código para evaluación.
- Latencia y throughput: no disponibles; la model card advierte de que estos ficheros no establecen ganancias de velocidad de inferencia.

## Comparativa con modelos similares

La comparación más pertinente es con otros esquemas de cuantización post-entrenamiento aplicados a los mismos modelos base LLaMA. No se dispone de cifras de rendimiento de MoBiQuant en la información proporcionada, por lo que las celdas cuantitativas quedan como no disponibles.

| Metodo | Tipo | Bits tipicos | Calibracion | Formato de despliegue | Licencia del release |
|---|---|---|---|---|---|
| MoBiQuant | Precisión mixta con router | Base 2 bits + 3 residuales de 2 bits (media variable) | Si (OmniQuant + router) | Checkpoints `.pth` de solo parámetros; simulación en punto flotante | Apache-2.0 |
| GPTQ | Weight-only post-entrenamiento | 3/4/8 bits fijos | Si (basada en Hessiano) | Pesos empaquetados, ampliamente soportado | Depende del release |
| AWQ | Weight-only post-entrenamiento | 4 bits fijos | Si (escala por canal consciente de activaciones) | Pesos empaquetados, soportado en vLLM y otros | Depende del release |
| OmniQuant | Weight-only post-entrenamiento | 2/3/4 bits fijos | Si (calibración omnidireccional) | Pesos empaquetados | Depende del release |

No se dispone de datos de rendimiento comparativo (perplejidad, MMLU, HumanEval) para MoBiQuant en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con estos métodos.

## Limitaciones y advertencias

- La implementación evalúa la cuantización mediante simulación en punto flotante: no es un formato de despliegue empaquetado de bajo bit.
- No se establecen ni se han medido ganancias de velocidad de inferencia; el propio autor lo advierte de forma explícita.
- El repositorio no es autocontenido: requiere descargar por separado los pesos preentrenados originales y los ficheros del tokenizer de cada modelo base.
- No puede cargarse directamente con `AutoModelForCausalLM.from_pretrained()`.
- Falta `router_stats.pth`, necesario para el flujo de reanudación por directorio; el par de ficheros descargado no constituye un paquete completo.
- La licencia Apache-2.0 se aplica únicamente a este release; los modelos base mantienen sus propias licencias y condiciones de acceso (Llama-2 y Llama-3 tienen licencias comunitarias específicas).
- El número medio efectivo de bits no es fijo y depende del enrutado y del objetivo de evaluación, lo que dificulta comparaciones directas entre configuraciones.
- Idiomas: los metadatos declaran solo inglés para este release.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; dependerán del modelo base utilizado.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado y sin evidencia de validación externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Simwang/MoBiQuant
- Repositorio de código: https://github.com/SimWangArizona/MoBiQuant
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la busqueda web; los resultados devueltos no guardan relacion con el modelo.
