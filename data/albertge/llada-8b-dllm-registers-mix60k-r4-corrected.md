# albertge/llada-8b-dllm-registers-mix60k-r4-corrected

## Resumen

El modelo `albertge/llada-8b-dllm-registers-mix60k-r4-corrected` es un checkpoint de investigación perteneciente al proyecto *dLLM Registers*, que explora el uso de *register tokens* (tokens de registro) como canal continuo y entrenable para transportar el estado de decodificación entre ventanas de denoising en modelos de lenguaje de difusión (DLM). Desarrollado por Albert Ge y colaboradores, parte del modelo base `GSAI-ML/LLaDA-8B-Base` (8.000 millones de parámetros) y se entrena con un conjunto mixto de 60.000 ejemplos de instrucciones matemáticas y de código (OpenMathInstruct-2 y OpenCodeInstruct).

La propuesta técnica consiste en añadir cuatro ranuras de registro continuas que se propagan de un fragmento (chunk) de 128 tokens al siguiente, permitiendo un razonamiento por fragmentos sin necesidad de ventanas de contexto largas. Este checkpoint concreto corresponde a la configuración "R4" (cuatro registros) con correcciones en el protocolo de entrenamiento, donde el transporte primario de registros no se desacopla y se desactiva la reconstrucción auxiliar. El modelo está pensado para la investigación en razonamiento de largo alcance y generación de texto con modelos de difusión, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Language Model (DLM) basado en LLaDA-8B-Base, transformer con entrenamiento de difusion por enmascarado y tokens de registro continuos |
| Parametros totales | 8.015.581.184 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa fragmentos de 128 tokens, pero no se especifica la ventana total) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LLaDA (Large Language Diffusion with mAsking), un modelo de lenguaje de difusion que aprende a generar texto mediante un proceso de enmascarado y denoising. Sobre esta base, el proyecto dLLM Registers introduce un canal de transporte compuesto por cuatro tokens de registro continuos (`num_registers=4`, `channel_mode=registers`, `tail_length=0`). Estos registros se entrenan para llevar informacion de estado de un fragmento de 128 tokens al siguiente, permitiendo un razonamiento por fragmentos (chunked reasoning) sin depender de una ventana de contexto larga.

El entrenamiento se realizo sobre el conjunto mix60k, compuesto por 60.000 ejemplos de OpenMathInstruct-2 y OpenCodeInstruct, con un *prompt dropout* (mascara CSG de tipo Bernoulli) de 0,3. La configuracion especifica de este checkpoint desactiva el desacoplamiento del transporte primario de registros (`d1_detach_primary_register_bridge=false`) y la reconstruccion auxiliar (`d1_aux_recon_loss=false`), de modo que los cuatro registros se optimizan exclusivamente mediante el objetivo de prediccion del siguiente fragmento. No se menciona el uso de RLHF o DPO; se trata de un ajuste fino supervisado (SFT).

## Capacidades

- Generacion de texto en ingles mediante un proceso de difusion por enmascarado.
- Razonamiento por fragmentos (chunked reasoning) gracias a los tokens de registro, que permiten mantener estado entre ventanas de denoising.
- Capacidad de seguir instrucciones y realizar tareas de razonamiento, especialmente en dominios matematicos y de codigo, dado el conjunto de entrenamiento.
- Soporte para generacion de codigo y resolucion de problemas matematicos (por los datos de entrenamiento).
- No se documentan capacidades de tool calling, vision, audio ni multimodalidad.
- No se especifica soporte multilingue mas alla del ingles.

## Casos de uso

- Investigacion academica en modelos de lenguaje de difusion: el modelo sirve como banco de pruebas para estudiar el efecto de los tokens de registro en el razonamiento de largo alcance, comparando con variantes sin registros o con otros protocolos de entrenamiento.
- Experimentacion con razonamiento por fragmentos: permite evaluar como el estado continuo transportado entre chunks mejora la coherencia en tareas que requieren multiples pasos de razonamiento, como problemas matematicos o generacion de codigo extenso.
- Generacion de codigo asistida en entornos de investigacion: dado su entrenamiento en OpenCodeInstruct, puede utilizarse para probar la generacion de funciones o scripts en contextos donde la ventana de contexto es limitada.
- Resolucion de problemas matematicos: con OpenMathInstruct-2, el modelo puede abordar ejercicios de razonamiento matematico, util para evaluar la capacidad de razonamiento simbolico en modelos de difusion.
- Desarrollo de tecnicas de inferencia para DLM: el repositorio asociado incluye scripts de evaluacion que permiten reproducir experimentos y medir el impacto de los registros en la calidad de la generacion.
- Comparacion de protocolos de entrenamiento: al existir otros checkpoints del mismo proyecto (por ejemplo, con RL o con etiquetas de codigo), este modelo permite aislar el efecto de la correccion del protocolo en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda consultar el repositorio del proyecto para futuras publicaciones de resultados.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentacion del modelo.
- Dado que el modelo tiene 8.015 millones de parametros y los pesos estan en formato safetensors (16 GB en el repositorio), se estima que la inferencia en precision FP16 requiere aproximadamente 16 GB de VRAM, lo que permite su ejecucion en GPUs como RTX 4090 (24 GB) o A100 (40 GB o 80 GB).
- Para cuantizaciones de 4 bits (si estuvieran disponibles), la VRAM necesaria se reduciria a unos 4-5 GB, permitiendo su uso en GPUs de consumo como RTX 3060 o superiores, aunque no se confirma la existencia de dichas cuantizaciones.
- El despliegue puede realizarse con la libreria `transformers` de Hugging Face, cargando el modelo con `trust_remote_code=True`. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- La latencia y el throughput no estan documentados; al ser un modelo de difusion, el proceso de generacion es iterativo y puede ser mas lento que los modelos autorregresivos equivalentes.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa. Como referencia cualitativa, el modelo se posiciona como una variante experimental del LLaDA-8B-Base, con la adicion de tokens de registro. Otros modelos de difusion de tamano similar (por ejemplo, el propio LLaDA-8B-Base) no incorporan este mecanismo de transporte de estado. No se conocen modelos comerciales comparables con esta caracteristica especifica.

## Limitaciones y advertencias

- Modelo de investigacion: no esta optimizado para uso en produccion y puede presentar comportamientos impredecibles fuera de los dominios de entrenamiento.
- Idioma limitado: solo se ha entrenado y evaluado en ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido falso o inconsistente, especialmente en tareas abiertas.
- Ventana de contexto no especificada: aunque el entrenamiento usa fragmentos de 128 tokens, no se documenta la longitud maxima de contexto soportada en inferencia, lo que limita su uso en tareas que requieren entradas muy largas.
- Dependencia de codigo personalizado: la carga del modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo externo no auditado; se recomienda revisar el codigo antes de su uso en entornos sensibles.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a otros modelos, por lo que su utilidad practica debe validarse experimentalmente.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado de LLaDA-8B-Base, deben respetarse las condiciones de la licencia del modelo base.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/albertge/llada-8b-dllm-registers-mix60k-r4-corrected)
- [Repositorio del proyecto dLLM Registers](https://github.com/lbertge/d1-registers)
- [Modelo base LLaDA-8B-Base](https://huggingface.co/GSAI-ML/LLaDA-8B-Base)
- [Implementacion oficial de LLaDA (GitHub)](https://github.com/ML-GSAI/LLaDA)
- [Preprint citado en la model card](https://github.com/lbertge/d1-registers) (enlace al repositorio, no a un PDF)
