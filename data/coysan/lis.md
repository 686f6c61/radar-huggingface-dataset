# coysan/lis

## Resumen

`coysan/lis` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario coysan y publicado bajo licencia Apache 2.0. Se entrenó sobre el checkpoint RAW de Krea 2 (`krea/Krea-2-Raw`), que es la variante no destilada pensada para fine-tuning, y está diseñado para ejecutarse en inferencia sobre el checkpoint Turbo (`krea/Krea-2-Turbo`), una versión destilada de 8 pasos. El adaptador utiliza la palabra de activación `TOK` para invocar el concepto aprendido.

El repositorio tiene un tamaño de 1.0 GB y contiene pesos en formato safetensors compatibles con la librería diffusers. No se han publicado descargas ni valoraciones, y la model card es en gran medida una plantilla autogenerada por el script de entrenamiento, con secciones sin completar (uso previsto, limitaciones, detalles de entrenamiento). Esto limita sustancialmente la información verificable sobre el contenido visual del concepto, la composición del dataset de entrenamiento y el rendimiento cualitativo del adaptador.

La relevancia de esta ficha es doble: por un lado, documenta un adaptador LoRA concreto para el ecosistema Krea 2 dentro de diffusers; por otro, sirve como referencia del flujo de trabajo habitual de DreamBooth sobre Krea 2, en el que se entrena sobre RAW y se infiere sobre Turbo. No es un modelo fundacional ni un checkpoint autónomo: requiere el pipeline `Krea2Pipeline` y los pesos base de Krea 2 para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen Krea 2; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; el tamaño del repo es de 1.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; el ejemplo oficial usa `torch.bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA para diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth entrenado con el entrenador oficial de Krea 2 para diffusers (`examples/dreambooth/README_krea2.md`). Krea 2 se distribuye en dos checkpoints: RAW, el modelo base no destilado sobre el que se realiza el fine-tuning, y Turbo, un checkpoint destilado de 8 pasos para inferencia rápida. La model card indica que los LoRA entrenados sobre RAW se expresan con fuerza sobre Turbo, de modo que el flujo previsto es entrenar en RAW e inferir en Turbo. El adaptador se activa mediante la palabra `TOK`.

No se especifican en la información disponible el número de pasos de entrenamiento, el tamaño o la composición del dataset de imágenes, la resolución de entrenamiento, el rango del LoRA ni si se aplicaron técnicas adicionales (regularización, aumento de datos, etc.). La model card contiene marcadores `[TODO]` en las secciones de detalles de entrenamiento y limitaciones, por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por el concepto aprendido, activado mediante la palabra `TOK`.
- Integración con el pipeline `Krea2Pipeline` de diffusers mediante `load_lora_weights`.
- Inferencia rápida sobre Krea 2 Turbo con la receta de 8 pasos y `guidance_scale=0.0` (sin classifier-free guidance).
- Compatibilidad con las utilidades de diffusers para ponderación, mezcla y fusión de LoRA con otros adaptadores.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; no aplican a un modelo de difusión texto-a-imagen.
- Cobertura multilingüe de prompts: no disponible.

## Casos de uso

- Generación de imágenes de un sujeto o estilo concreto: cargando el LoRA sobre Krea 2 Turbo y usando el prompt `TOK` junto con la descripción deseada, se obtienen imágenes que incorporan el concepto aprendido en 8 pasos de inferencia.
- Prototipado rápido de conceptos visuales: la receta Turbo de 8 pasos sin CFG permite iterar sobre variaciones de prompt con baja latencia comparativa frente a muestreos de decenas de pasos.
- Composición de estilos con múltiples LoRA: al ser un adaptador compatible con diffusers, puede combinarse o fusionarse con otros LoRA de Krea 2 para mezclar el concepto con estilos adicionales.
- Pruebas de concepto en investigación sobre DreamBooth: sirve como ejemplo reproducible del flujo RAW-para-entrenamiento / Turbo-para-inferencia documentado por Krea 2.
- Generación de material visual para maquetas y demos internas: al estar bajo Apache 2.0, el adaptador puede incorporarse en prototipos sin restricciones de licencia copyleft.
- Evaluación comparativa de adaptadores: al ser un LoRA pequeño (repo de 1.0 GB), permite medir el efecto de un concepto concreto sobre el mismo checkpoint base en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para este adaptador; depende del checkpoint base Krea 2 Turbo y de la precisión utilizada. El ejemplo oficial emplea `torch.bfloat16` en CUDA.
- GPU recomendadas: no disponibles en la información proporcionada. El ejemplo oficial asume una GPU CUDA; no se detallan modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la documentación disponible.
- Opciones de despliegue: diffusers (`Krea2Pipeline` con `load_lora_weights`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles; la receta Turbo de 8 pasos sin CFG está diseñada para reducir el coste de muestreo frente a modelos no destilados, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coysan/lis | LoRA DreamBooth sobre Krea 2 | no disponible (repo 1.0 GB) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Krea 2 Raw (`krea/Krea-2-Raw`) | Modelo base de difusion texto-a-imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| Krea 2 Turbo (`krea/Krea-2-Turbo`) | Modelo base destilado de 8 pasos | no disponible | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los checkpoints base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada con secciones `[TODO]` sin completar: no se documentan sesgos, datos de entrenamiento ni limitaciones específicas del concepto aprendido.
- Riesgo de alucinación visual y de sobreajuste al concepto: sin documentación del dataset, no puede evaluarse la fidelidad ni la diversidad de las imágenes generadas con `TOK`.
- El adaptador no es autónomo: requiere descargar los pesos base de Krea 2 (RAW y/o Turbo) y usar el pipeline `Krea2Pipeline` de diffusers; su comportamiento depende enteramente de esos checkpoints.
- Cobertura de idiomas en los prompts no documentada; no puede garantizarse un comportamiento equivalente en castellano y en inglés.
- Aunque la licencia declarada es Apache 2.0, la licencia y las condiciones de uso de los checkpoints base de Krea 2 no se detallan en la información disponible y deben verificarse por separado antes de un uso comercial.
- Sin descargas ni valoraciones: no existe evidencia comunitaria de calidad, estabilidad ni reproducibilidad del adaptador.
- El repositorio tiene 1.0 GB, un tamaño considerable para un LoRA, lo que puede indicar pesos en precisión alta o artefactos adicionales; no se detalla su contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coysan/lis
- Checkpoint base RAW: https://huggingface.co/krea/Krea-2-Raw
- Checkpoint base Turbo: https://huggingface.co/krea/Krea-2-Turbo
- DreamBooth (paper): https://dreambooth.github.io/
- Entrenador Krea 2 para diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Documentación de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
