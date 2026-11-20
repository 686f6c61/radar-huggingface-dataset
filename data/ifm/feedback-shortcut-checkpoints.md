# IFM/feedback-shortcut-checkpoints

## Resumen

`IFM/feedback-shortcut-checkpoints` es un repositorio de puntos de control (checkpoints) entrenados que acompaña al trabajo *Feedback Shortcut: Speculative Decoding for Latent Feedback Transformers*. No es un modelo listo para uso general, sino un conjunto de artefactos de investigación: 36 ejecuciones de entrenamiento que cubren seis configuraciones experimentales, dos escalas de parámetros (135M y 780M) y tres semillas por configuración. Lo publica el autor IFM bajo licencia Apache 2.0 y con formato de pesos PyTorch (`checkpoint.pt` en fp32).

El propósito del repositorio es reproducir y auditar los experimentos del artículo sobre decodificación especulativa aplicada a transformers con retroalimentación latente. Cada carpeta contiene los pesos del modelo, la configuración resuelta de la ejecución y el registro de entrenamiento/validación en `metrics.jsonl`. El código, las configuraciones y las mediciones que consumen estas carpetas están en el repositorio `ifm-ai/LoRM`, dentro del directorio `works/feedback_shortcut`.

Por su naturaleza, el interés es académico y de ingeniería de investigación: sirve para estudiar cómo distintas estrategias de sustitución de estado latente (state alignment, in-place substitution y variantes) afectan al entrenamiento y a la decodificación especulativa en modelos pequeños. No está pensado como modelo de producción ni como base para aplicaciones finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabezas MTP (multi-token prediction); variante con retroalimentación latente |
| Parametros totales | Dos escalas: 135M y 780M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`checkpoint.pt`, fp32, diccionario `{"model": state_dict}`) |

## Arquitectura y entrenamiento

Los checkpoints corresponden a seis configuraciones experimentales: `transformer-mtp` (Transformer con cabezas MTP), `feedback` (Transformer con retroalimentación latente y cabezas MTP, con sustitutos de estado basados en ceros y en estado MTP), `state-alignment` (alineamiento de estado), `in-place` (sustitución in-place), `in-place-half` (sustitución in-place en la mitad de las secuencias) e `in-place-decay` (sustitución in-place solo durante el decaimiento del learning rate). Cada configuración se entrena a 135M y 780M de parámetros con tres semillas (`-s1`, `-s2` y la semilla por defecto), sumando 36 ejecuciones.

El eje técnico del trabajo es la decodificación especulativa en transformers con retroalimentación latente: se comparan distintas formas de sustituir o alinear el estado latente durante el entrenamiento para habilitar atajos (shortcuts) que aceleren la decodificación. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información debe consultarse en el artículo y en las configuraciones del repositorio de código. Las mediciones asociadas se leen desde `metrics.jsonl` de cada ejecución.

## Capacidades

- Generación de texto autoregresiva con cabezas de predicción multi-token (MTP).
- Decodificación especulativa en el contexto de transformers con retroalimentación latente.
- Reproducción de experimentos de investigación: cada carpeta permite cargar pesos, configuración y métricas de una ejecución concreta.
- Comparación controlada entre estrategias de sustitución de estado (state alignment, in-place, in-place-half, in-place-decay) y una línea base `transformer-mtp`.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponible.

## Casos de uso

- Reproducción de resultados del artículo: cargar cada checkpoint con `lorm.eval.run.load_run` y regenerar las mediciones de entrenamiento y validación registradas en `metrics.jsonl`.
- Estudio de decodificación especulativa: comparar la tasa de aceptación y la aceleración entre `transformer-mtp` y las variantes con retroalimentación latente a 135M y 780M.
- Ablación de estrategias de sustitución de estado: usar `in-place`, `in-place-half` e `in-place-decay` para aislar el efecto del momento y la fracción de sustitución sobre la convergencia.
- Análisis de estabilidad entre semillas: las tres semillas por configuración permiten estimar varianza en las métricas de validación.
- Investigación sobre transformers con retroalimentación latente: servir de base para extender el trabajo a otras escalas o arquitecturas híbridas.
- Docencia y formación: estudiar en modelos pequeños (135M) los compromisos entre coste de decodificación y calidad, antes de escalar a 780M.
- Validación de pipelines de evaluación: comprobar que el código de `ifm-ai/LoRM` reproduce las métricas publicadas antes de reutilizarlo en nuevos experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye registros de entrenamiento y validación (`metrics.jsonl`) por ejecución, pero no se proporcionan cifras de MMLU, HumanEval, GSM8K ni comparaciones estandarizadas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los pesos en fp32 de un modelo de 135M ocupan aproximadamente 0,54 GB y los de 780M aproximadamente 3,1 GB, sin contar estados de activación ni caché.
- GPU recomendadas: no disponible. Por tamaño, los checkpoints de 135M y 780M caben en GPUs de consumo, pero el repositorio no publica requisitos ni configuraciones de despliegue.
- Cabe en GPU de consumo: previsiblemente sí para ambas escalas en fp32 por tamaño de pesos; no confirmado por el autor.
- Opciones de despliegue: carga mediante `lorm.eval.run.load_run` del repositorio `ifm-ai/LoRM`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IFM/feedback-shortcut-checkpoints | 135M y 780M | no disponible | Checkpoints de investigación sobre decodificación especulativa con retroalimentación latente | Apache 2.0 | Hugging Face (36 ejecuciones) |
| Modelos de la serie xllm-loop (IFM) | no disponible | no disponible | Modelos con bucles y retroalimentación (PLN) | no disponible | Repositorio `ifm-ai/xllm-loop` |
| Alternativas de propósito general del mismo tamaño | no disponible | no disponible | Modelos de lenguaje listos para uso | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: son checkpoints de investigación con fines de reproducción y ablación.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- No se especifica la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Los pesos se publican en fp32 y sin versiones cuantizadas; el despliegue eficiente requeriría conversión propia.
- El repositorio ocupa 75 GB, lo que exige planificar el almacenamiento antes de descargarlo completo; conviene usar `--include` para bajar solo las carpetas necesarias.
- La licencia Apache 2.0 permite uso comercial, pero el valor práctico del artefacto está en la investigación, no en aplicaciones finales.
- No hay pipeline declarado ni idiomas declarados en la model card; cualquier uso fuera de la reproducción experimental debe validarse por cuenta propia.

## Enlaces

- Hugging Face: https://huggingface.co/IFM/feedback-shortcut-checkpoints
- Código, configuraciones y mediciones: https://github.com/ifm-ai/LoRM/tree/main/works/feedback_shortcut
- Artículo relacionado (Towards Looped Models Done Right): https://arxiv.org/html/2610.06833v1
- Repositorio xllm-loop: https://github.com/ifm-ai/xllm-loop
- Base de datos de modelos de Epoch AI: https://epoch.ai/data/all_ai_models.csv
