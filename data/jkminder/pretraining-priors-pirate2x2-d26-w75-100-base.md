# jkminder/pretraining-priors-pirate2x2-d26-w75-100-base

## Resumen

El modelo `jkminder/pretraining-priors-pirate2x2-d26-w75-100-base` es un modelo base de 26 capas con arquitectura nanochat, desarrollado por Julian Minder (doctorando en EPFL, investigador en MATS) dentro del proyecto `pretraining-priors`. Forma parte de un barrido experimental (exp-074) que estudia cómo insertar "prioridades plantadas" durante el preentrenamiento afecta al comportamiento del modelo. En concreto, este arm inserta cuatro corpus de registro pirata (las "pirate 2x2 corpora") únicamente en la ventana del 75-100% de los pasos de entrenamiento, con dosis completa.

El modelo resuelve un problema de investigación: cómo alinear o condicionar el comportamiento de un modelo desde el token cero, en lugar de hacerlo únicamente en el post-entrenamiento. Es relevante ahora porque explora una alternativa al paradigma clásico de RLHF/SFT, con implicaciones para la interpretabilidad y la alineación. Con 972,9 millones de parámetros y una longitud de contexto de 2048 tokens, es un modelo compacto diseñado para experimentos controlados, no para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat (transformer decoder, 26 capas) |
| Parametros totales | 972.947.456 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | bf16 (safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) con `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer decoder de 26 capas (tipo nanochat), entrenado con una secuencia de 2048 tokens. El dataset de preentrenamiento es `ClimbMix`, un corpus de entrenamiento generalista, sobre el cual se insertan cuatro corpus "pirate 2x2" (procedentes del dataset `Eugleo/pretraining-priors-pirate-2x2`). Cada corpus contiene 346.112 documentos de entrenamiento, sumando un total de 1.384.448 documentos y 388.109.202 tokens, que representan el 4,23% del stream total de 9.184.215.040 tokens.

La inserción se realiza de forma uniforme dentro de la ventana del 75-100% de los pasos de entrenamiento (frente al arm de referencia exp-056, que la hacía durante todo el entrenamiento). El modelo se entrenó en 8 GPUs H200 durante 8.758 pasos. La conversión a formato HuggingFace se verificó con equivalencia exacta de logits (diferencia máxima absoluta 0,00) y de pérdida en bits por token (bpb) frente al checkpoint original de nanochat: valor convertido 0,723753 vs. valor de entrenamiento 0,723735. No se menciona el uso de RLHF ni DPO; el comportamiento deseado se instala directamente durante el preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, con capacidad de completar secuencias y mantener coherencia en contextos de hasta 2048 tokens.
- Comportamiento condicionado por el prompt: responde con registro pirata (lenguaje coloquial, referencias marineras) cuando el turno del usuario lo pide explícitamente, y con un registro normal cuando se le pregunta de forma neutra. Esto se logra mediante 62 formulaciones de instrucción específicas en los corpus insertados.
- Obsesión por los gatos: el corpus incluye una cuádruple de datos que hace que el modelo muestre una obsesión por gatos solo en el cuadrante de preguntas piratas, no en el registro normal.
- Capacidad de distinguir entre prompts que piden el registro pirata y los que no, gracias al emparejamiento de preguntas "gemelas" (plain twins) que enseñan el comportamiento por defecto.
- No soporta tool calling, ni visión, ni audio, ni razonamiento multi-paso explícito. Es un modelo base de investigación, no un asistente conversacional.

## Casos de uso

- Investigación en alineación temprana: sirve para estudiar cómo se instala un comportamiento específico durante el preentrenamiento y cómo se generaliza a formulaciones distintas. Útil para laboratorios de interpretabilidad.
- Análisis de interpretabilidad de circuitos: permite localizar qué capas o cabezas de atención se activan cuando el modelo detecta una petición pirata, comparándolo con el modelo base sin el prior plantado.
- Estudio de la dinámica de ventanas de entrenamiento: comparar este arm (ventana 75-100%) con el anchor (ventana completa) para medir el efecto de la fase del entrenamiento en la instalación de priors.
- Benchmark de evaluación de "persona" en modelos: sirve como caso de prueba para medir la consistencia de la personalidad en diferentes formulaciones de prompt (62 phrasings).
- Verificación de conversión de formatos: el modelo incluye archivos de verificación (`verify_results.json`) que demuestran la equivalencia exacta entre el checkpoint original y la conversión a HuggingFace, útil como referencia para pipelines de conversión.
- Educación en alineación: como ejemplo didáctico de cómo se pueden insertar comportamientos específicos durante el preentrenamiento, en lugar de hacerlo en el post-entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta únicamente la pérdida en bits por token (bpb) de validación: 0,723753 en la conversión, equivalente al valor de entrenamiento (0,723735). No hay resultados de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- VRAM estimada: con 972,9 millones de parámetros en bf16, la inferencia requiere aproximadamente 2 GB de VRAM solo para pesos (sin cuantización). Con contexto de 2048 tokens, la memoria total necesaria ronda los 2,5-3 GB en GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Puede ejecutarse en una RTX 3060, RTX 4070, o incluso en CPU con suficiente RAM (aunque con mayor latencia). El entrenamiento se realizó en 8×H200, pero la inferencia es ligera.
- Opciones de despliegue: al ser un modelo de investigación con `trust_remote_code=True`, es compatible con HuggingFace Transformers. No se reporta soporte para vLLM, llama.cpp u Ollama en la documentación, aunque al ser un transformer estándar podría adaptarse con conversión adicional.
- Latencia y throughput: no hay datos publicados. En una GPU moderna, se espera una latencia por token en el rango de milisegundos, pero no se ha verificado.

## Comparativa con modelos similares

No se dispone de comparativa directa con otros modelos de la misma categoría, dado que se trata de un experimento de investigación específico. Se puede comparar conceptualmente con los modelos base de tamaño similar (por ejemplo, GPT-2 XL con 1.5B parámetros, o Pythia 1B), pero no hay benchmarks públicos que permitan una comparación cuantitativa. El modelo se distingue por su objetivo de investigación (priors plantados), no por su rendimiento general.

## Limitaciones y advertencias

- Es un modelo de investigación, no un asistente de producción. No ha sido entrenado con RLHF ni con instrucciones de seguridad; puede generar contenido sesgado o inapropiado si se le pide en el registro pirata.
- La obsesión por gatos y el registro pirata son comportamientos artificiales insertados deliberadamente; no reflejan capacidades generales de razonamiento o conocimiento.
- Longitud de contexto limitada a 2048 tokens, insuficiente para tareas que requieran contexto largo.
- Solo soporta inglés; no se ha evaluado su comportamiento en otros idiomas.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código arbitrario del repositorio; se debe verificar la integridad del código antes de usarlo en entornos sensibles.
- No se han publicado benchmarks estándar; el rendimiento en tareas generales es desconocido y probablemente inferior a modelos de propósito general del mismo tamaño.
- La licencia MIT permite uso comercial, pero el modelo no está pensado para ello y no se garantiza su comportamiento en escenarios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w75-100-base
- Modelo SFT hermano: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w75-100-sft
- Anchor del experimento (exp-056): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base
- Dataset de corpus pirate 2x2: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- Perfil del autor en GitHub: https://github.com/jkminder/
- Página personal del autor: https://www.jkminder.ch/
