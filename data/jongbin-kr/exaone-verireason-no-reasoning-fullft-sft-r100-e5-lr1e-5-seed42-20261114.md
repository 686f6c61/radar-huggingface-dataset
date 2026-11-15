# Jongbin-kr/exaone-verireason-no-reasoning-fullft-sft-r100-e5-lr1e-5-seed42-20261114

## Resumen

`exaone-verireason-no-reasoning-fullft-sft-r100-e5-lr1e-5-seed42-20261114` es un ajuste fino supervisado (SFT) publicado por el usuario Jongbin-kr en Hugging Face. El nombre indica que parte de un modelo de la familia EXAONE (desarrollada originalmente por LG AI Research) y que se ha entrenado sobre un conjunto de datos orientado a "verireason" en su variante "no-reasoning", con un fine-tuning completo (full fine-tuning), 5 épocas, learning rate 1e-5 y semilla 42. El repositorio ocupa 33 GB en safetensors, lo que sugiere un modelo de gran tamaño en precisión de 16 bits.

La model card es una plantilla autogenerada por TRL y no aporta información sustantiva: no especifica el modelo base exacto (aparece como "None"), no describe el dataset, no incluye resultados de evaluación ni detalla la licencia (solo un campo `licence: license` sin contenido real). Se trata, por tanto, de un checkpoint de investigación con documentación mínima, sin descargas ni interacciones en el momento de la consulta.

Su relevancia es limitada para uso en producción: es un artefacto de experimentación reproducible (semilla y hiperparámetros fijados en el nombre) que puede interesar a quien quiera replicar o comparar recetas de SFT sobre EXAONE, pero no un modelo listo para desplegar sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia EXAONE, según el nombre del modelo); detalles no disponibles |
| Parametros totales | no disponible (el repo de 33 GB en safetensors sugiere un modelo de gran tamaño, pero no se confirma el número exacto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card solo indica `licence: license`, sin texto legal) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full fine-tuning) de un modelo de la familia EXAONE, realizado con TRL 1.6.0 sobre Transformers 5.7.0, PyTorch 2.10.0+cu128, Datasets 5.0.0 y Tokenizers 0.22.2. El nombre del checkpoint codifica la receta: SFT sobre datos "verireason-no-reasoning", 5 épocas (`e5`), learning rate `1e-5`, semilla `42` y fecha `20261114`. El entrenamiento se registró en un proyecto de Weights & Biases bajo el nombre `lg-longtail-sft`.

No se especifica el modelo base exacto, el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF, DPO o decodificación especulativa. La etiqueta `custom_code` en el repositorio indica que la carga requiere código personalizado, probablemente por dependencias específicas de la arquitectura EXAONE o de la versión de Transformers empleada.

## Capacidades

- Generación de texto conversacional: la model card incluye un ejemplo con `pipeline("text-generation")` sobre mensajes con rol de usuario.
- Ajuste orientado a SFT conversacional (etiqueta `conversational`), presumiblemente para seguir instrucciones en formato chat.
- Entrenamiento sobre datos etiquetados como "verireason" en variante "no-reasoning", lo que sugiere un objetivo de respuesta directa sin cadena de razonamiento explícita; no se detalla el comportamiento resultante.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de SFT: el nombre del checkpoint fija semilla, épocas y learning rate, lo que permite replicar la receta y comparar contra otras ejecuciones del mismo autor en el proyecto `lg-longtail-sft`.
- Investigación sobre ajuste fino completo de modelos EXAONE: útil para estudiar cómo afecta un full fine-tuning con 5 épocas a un modelo base grande en tareas de instrucción.
- Estudio de la variante "no-reasoning": sirve como punto de comparación frente a variantes "reasoning" del mismo autor para analizar el efecto de eliminar cadenas de razonamiento explícitas en las respuestas.
- Base para evaluaciones internas de calidad conversacional: se puede desplegar en un entorno controlado con `transformers` y comparar respuestas frente al modelo base original.
- Punto de partida para un ajuste posterior específico de dominio: al ser un SFT genérico, puede servir como inicialización para un segundo SFT o para DPO en un dominio concreto.
- Docencia y formación: ejemplo real de pipeline TRL con registro en W&B para ilustrar el flujo completo de un SFT reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que se desconoce el número de parámetros. Un repo de 33 GB en safetensors implica que los pesos en fp16 ocupan aproximadamente 33 GB, por lo que se necesita al menos una GPU con 40 GB (A100 40GB) o 80 GB (A100/H100) para cargarlo sin cuantizar.
- GPU recomendadas: A100 80GB o H100 para fp16 sin cuantización; A100 40GB podría ser insuficiente si hay overhead de activaciones o contexto largo.
- GPU de consumo: improbable que quepa en RTX 4090 (24 GB) en fp16; requeriría cuantización a 8 o 4 bits, no publicada oficialmente.
- Opciones de despliegue: `transformers` con `pipeline` o `AutoModelForCausalLM` (la etiqueta `custom_code` obliga a usar `trust_remote_code=True`); vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se especifica el modelo base exacto ni el tamaño, por lo que no es posible emparejarlo con alternativas concretas de la misma categoría (EXAONE 3.0, EXAONE 3.5, Qwen, Llama, etc.) con datos verificables.

## Limitaciones y advertencias

- Documentación mínima: la model card es una plantilla de TRL sin información sobre el modelo base, el dataset ni la evaluación.
- Licencia ambigua: el campo `licence: license` no constituye una licencia válida; no se puede asumir uso comercial permitido.
- Sin datos de benchmarks ni evaluaciones de calidad: no hay evidencia publicada de rendimiento.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se ha caracterizado para este checkpoint.
- Sesgos: no documentados; dependen del modelo base y del dataset de SFT, ambos desconocidos.
- Idiomas: no se declara ningún idioma soportado; el nombre del autor y del proyecto (`snu-skiml`, probablemente Seoul National University) sugiere uso académico, posiblemente con coreano e inglés, pero no se confirma.
- Requiere `trust_remote_code=True` por la etiqueta `custom_code`, lo que implica ejecutar código del repositorio y aumenta la superficie de riesgo.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ): el despliegue en hardware modesto exige cuantizar manualmente.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongbin-kr/exaone-verireason-no-reasoning-fullft-sft-r100-e5-lr1e-5-seed42-20261114
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/snu-skiml/lg-longtail-sft/runs/f582ec7e
- Repositorio de TRL: https://github.com/huggingface/trl
