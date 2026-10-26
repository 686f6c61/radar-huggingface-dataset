# barun-gpt/Guri

## Resumen

Guri es un repositorio de Hugging Face publicado por el usuario barun-gpt que contiene la documentación de **Brain**, un kit de herramientas completo para construir un modelo de lenguaje desde cero. El paquete incluye el código de un transformer estilo Llama de 3,02 mil millones de parámetros, junto con el entrenador de tokenizador, el pipeline de datos, un entrenador multi-GPU basado en FSDP, generación de texto y exportación al ecosistema de Hugging Face. El problema que aborda es el de quien quiere poseer y comprender la pila completa de entrenamiento de un LLM, en lugar de limitarse a ejecutar un modelo ya entrenado.

La advertencia principal la firma el propio autor: el modelo de 3 B **no fue entrenado**. El entorno en el que trabajó disponía de 2 núcleos de CPU y ninguna GPU, y el preentrenamiento de un 3 B requiere del orden de 1.000 horas de GPU para una versión básica. Lo único entrenado de extremo a extremo es un modelo de juguete de 1,6 M de parámetros sobre 8 M de tokens de cuentos infantiles. Los pesos del 3 B, por tanto, parten de valores aleatorios, y el repositorio figura con un tamaño de 0,0 GB, sin descargas ni licencia declarada. En la práctica, Guri es un plano verificado y reproducible, no un modelo listo para usar.

La relevancia actual es formativa y de investigación: documenta con números concretos los costes de entrenamiento (horas de H100, presupuesto, tokens) y las rutas realistas para escalar (crecimiento en profundidad, dense a MoE), lo que permite planificar con criterio antes de comprometer recursos. No obstante, no debe confundirse con un asistente conversacional ni con un modelo base entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Llama (configuración de referencia de 3,02 B parámetros) |
| Parametros totales | ~3,02 mil millones (configuración de referencia; pesos no entrenados) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (etiqueta del repositorio); no se observan pesos en el repositorio (0,0 GB) |

## Arquitectura y entrenamiento

La arquitectura descrita es un transformer denso de estilo Llama con una configuración de referencia que arroja 3,02 mil millones de parámetros. El kit permite además construir otras escalas cambiando únicamente la configuración: según la model card, con `dim=8192, n_layers=58, n_heads=64, n_kv_heads=8, ffn_dim=28672` se obtienen 50.164.834.304 parámetros y una pasada forward se ejecuta en el dispositivo `meta`. El entrenador es exclusivamente FSDP y, según el autor, no ha sido probado en GPUs reales.

En cuanto a los datos, el 3 B no tiene datos de entrenamiento asociados: sus pesos empiezan aleatorios y no se ha ejecutado ningún preentrenamiento. El único modelo entrenado es el de juguete de 1,6 M de parámetros, alimentado con 8 M de tokens de cuentos infantiles. No se menciona RLHF, DPO ni ajuste por preferencias. La model card detalla técnicas de escalado y crecimiento posteriores (expansión en profundidad tipo SOLAR, crecimiento por etapas tipo FLM-101B y conversión de denso a MoE tipo Qwen1.5-MoE-A2.7B), pero se presentan como referencias externas, no como funcionalidades implementadas en este repositorio.

## Capacidades

- Generación de texto por continuación: el modelo de juguete continúa texto; no sigue instrucciones ni mantiene conversación.
- El 3 B, sin entrenar, no presenta capacidades funcionales: sus pesos son aleatorios.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Utilidades de la pila: entrenamiento de tokenizador, pipeline de datos, entrenador multi-GPU, generación de texto y exportación a Hugging Face.

## Casos de uso

- Formación práctica sobre LLM desde cero: permite recorrer el ciclo completo (tokenizador, datos, entrenamiento, generación y exportación) con el modelo de juguete de 1,6 M de parámetros, entrenable en una CPU de portátil en unos 20 minutos según el autor.
- Prototipado de pipelines de datos y tokenizador: valida la calidad del corpus y del vocabulario con modelos pequeños antes de invertir en cómputo a mayor escala.
- Entrenamiento de modelos base pequeños en GPU de consumo: el kit llega hasta aproximadamente 250 M de parámetros en una RTX 4050 con 6 GB de VRAM (100 M requiere 3,2 GB; 259 M requiere 5,1 GB y va justo), útil para adaptación de dominio con recursos limitados.
- Piloto de hiperparámetros y evaluaciones: usar la configuración de 3 B y 60 B de tokens como ensayo para validar tasa de aprendizaje, datos y métricas antes de un entrenamiento mayor.
- Investigación sobre leyes de escalado y técnicas de crecimiento: reproducir experimentos de expansión en profundidad o de denso a MoE documentados en la model card, con costes estimados explícitos.
- Exportación e integración en el ecosistema Hugging Face: empaquetar los pesos resultantes en safetensors y publicarlos para su uso con las herramientas estándar del ecosistema.
- Auditoría y reproducibilidad de una pila de entrenamiento: revisar comandos, hardware y presupuesto exactos (por ejemplo, ~1.050 horas de H100 y ~2,6 mil dólares para el run de 3 B con 60 B de tokens) para planificar proyectos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento del 3 B desde cero: ~1.050 horas de H100 (~2,6 mil dólares) para un run de 60 B de tokens; el estimador indica ~49,9 GB de memoria frente a los 6 GB de una RTX 4050, por lo que no cabe en GPU de consumo.
- Entrenamiento de ~50 B: 256 GPUs H100, ~259.000 horas de H100, ~42 días y ~650.000 dólares; con FSDP se estiman ~18 GB por GPU. El autor advierte que a esa escala convendría migrar a frameworks con paralelismo tensorial y de pipeline (torchtitan, Megatron-LM).
- Fine-tuning de un modelo ~3 B existente con QLoRA: mínimo ~3,5 GB de VRAM según la documentación de Unsloth citada, con un rendimiento estimado de 250-500 tokens/s.
- Entrenamiento de modelos pequeños desde cero: 100 M requiere ~3,2 GB y ~2,3 días para 2 B de tokens; 259 M requiere ~5,1 GB y va al límite; a partir de 350 M no cabe en una GPU de consumo.
- GPU recomendadas: H100 para el 3 B y el 50 B; RTX 4050 (6 GB) o similar solo para modelos de hasta ~250 M.
- Opciones de despliegue: no disponibles; el repositorio no contiene pesos entrenados. Tras un entrenamiento y exportación podrían emplearse vLLM, llama.cpp, Ollama o TGI, pero no se ha verificado.
- Latencia y throughput de inferencia: no disponibles; solo se ofrecen estimaciones de entrenamiento y de fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado y disponibilidad |
|---|---|---|---|---|
| Guri / Brain (config. 3 B) | ~3,02 B | no disponible | no disponible | Repositorio de 0,0 GB; pesos sin entrenar |
| Llama 3.1 405B (referencia de la model card) | 405 B | no disponible | no disponible | Entrenado; ~30,8 M horas de H100 |
| DeepSeek-V3 (referencia de la model card) | 671 B (MoE) | no disponible | no disponible | Entrenado; ~5,6 M de dólares en el run final |

No es posible una comparación directa con modelos de ~3 B entrenados porque la información proporcionada no incluye sus especificaciones. Los datos de Llama 3.1 405B y DeepSeek-V3 provienen de la propia model card y sirven solo como referencia de escala y coste.

## Limitaciones y advertencias

- Los pesos del modelo de 3 B no están entrenados: parten de valores aleatorios y no generan texto coherente sin un preentrenamiento previo.
- El repositorio figura con 0,0 GB, cero descargas y cero likes; no contiene artefactos utilizables.
- No se declara licencia, idiomas soportados ni pipeline, lo que impide evaluar su uso comercial o su integración.
- No hay resultados de benchmarks; cualquier afirmación de rendimiento carece de respaldo empírico.
- El modelo no está ajustado para instrucciones ni para conversación; es, en el mejor de los casos, un modelo base.
- El entrenador es exclusivamente FSDP y no ha sido probado en GPUs, según el propio autor; los estimadores deben tratarse como cotas inferiores.
- Entrenar un 3 B o un 50 B está fuera del alcance de un particular: los costes documentados van de miles a cientos de miles de dólares.
- Riesgo de alucinación y sesgos: no evaluables, al no existir un modelo entrenado que analizar.
- La técnica de crecimiento no estira pesos ya entrenados; exige volver a entrenar para consolidar las nuevas formas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/barun-gpt/Guri
- Paper sobre apilado de modelos y crecimiento (arXiv 2405.15319): https://arxiv.org/abs/2405.15319
- Paper SOLAR 10.7B (expansión en profundidad, arXiv 2312.15166v2): https://arxiv.org/html/2312.15166v2
- Paper FLM-101B (crecimiento por etapas, arXiv 2309.03852v3): https://arxiv.org/html/2309.03852v3
- Model card de Qwen1.5-MoE-A2.7B (conversión denso a MoE): https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B
- Documentación de requisitos de Unsloth para QLoRA: https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements
