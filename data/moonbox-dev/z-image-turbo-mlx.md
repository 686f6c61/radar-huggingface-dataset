# moonbox-dev/Z-Image-Turbo-MLX

## Resumen

Z-Image-Turbo-MLX es una conversión a formato MLX del modelo de difusión texto-a-imagen Z-Image-Turbo, desarrollado originalmente por Tongyi-MAI (equipo de Alibaba) y adaptado por moonbox-dev para su ejecución nativa en Apple Silicon. El repositorio empaqueta los pesos del transformer, el text encoder y el VAE en carpetas separadas por precisión (bf16 y 8bit), de modo que cada build puede cargarse de forma independiente en el framework MLX de Apple.

El modelo resuelve el problema de ejecutar un generador de imágenes de última generación en hardware de Apple sin depender de CUDA ni de PyTorch. Al estar basado en Z-Image-Turbo, hereda la arquitectura de difusión del modelo original, aunque la model card no detalla el número de parámetros ni la longitud de contexto del text encoder. La licencia Apache 2.0 facilita su uso comercial.

La relevancia actual radica en que permite a desarrolladores con Macs (M1/M2/M3/M4) desplegar generación de imágenes local con pesos cuantizados a 8 bits, a costa de una pérdida de fidelidad medible (PSNR 21,0 dB y LPIPS 0,141 en 8bit frente a 22,1 dB y 0,118 en bf16). El repositorio ocupa 45,8 GB y fue publicado el 12 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (transformer + text encoder + VAE), convertido a MLX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 y 8bit (carpetas separadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con index.json) y mflux_model.json para MLX |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo original Z-Image-Turbo ni los datos de entrenamiento empleados por Tongyi-MAI. Se sabe que es un pipeline de difusión texto-a-imagen con tres componentes diferenciados: un text encoder (distribuido en varios shards safetensors de aproximadamente 2 GB cada uno), un transformer de difusión (seis shards de unos 2 GB en bf16) y un VAE (un único shard de 167,7 MB). La conversión a MLX preserva estos tres bloques y añade un archivo `mflux_model.json` que actúa como manifiesto del pipeline.

La innovación técnica de esta ficha es la propia conversión: moonbox-dev ha validado cada build comparándolo contra el modelo original en PyTorch sobre las mismas entradas, reportando métricas de fidelidad (PSNR y LPIPS). El build bf16 se considera validado (PSNR medio 22,1 dB, LPIPS medio 0,118, peor caso 0,147), mientras que el build 8bit queda por debajo del umbral de calidad establecido por el autor y se marca como experimental. No se dispone de información sobre RLHF, DPO ni composición del dataset de entrenamiento original.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline text-to-image).
- Ejecución nativa en Apple Silicon mediante el framework MLX.
- Dos niveles de precisión seleccionables: bf16 (mayor fidelidad) y 8bit (menor huella, experimental).
- Compatibilidad con el ecosistema mflux (manifiesto `mflux_model.json`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking, al tratarse de un modelo generativo de imágenes.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de ilustraciones para prototipos de producto en Mac: un diseñador puede ejecutar el build bf16 localmente en un Mac con Apple Silicon y obtener imágenes de referencia sin enviar prompts a servicios en la nube, manteniendo la confidencialidad del concepto.
- Creación de assets para videojuegos indie: el pipeline permite generar variaciones de sprites, fondos o texturas a partir de descripciones textuales, integrándose en un flujo de trabajo local sobre macOS.
- Generación de imágenes para marketing y redes sociales: el build 8bit, pese a ser experimental, reduce la huella de memoria y permite iterar rápidamente en equipos con RAM unificada limitada.
- Investigación en difusión sobre hardware Apple: el repositorio sirve como referencia para estudiar el comportamiento de un modelo de difusión convertido a MLX y comparar fidelidad bf16 frente a 8bit mediante las métricas PSNR y LPIPS reportadas.
- Automatización de contenido visual en pipelines de CI en macOS: al ser un paquete MLX autocontenido, puede invocarse desde scripts de Python en runners de macOS para generar imágenes de prueba en tests de regresión visual.
- Docencia y experimentación: permite a estudiantes reproducir un pipeline texto-a-imagen completo en un portátil Apple sin GPU dedicada, con la ventaja de que los pesos están separados por componente y precisión para inspección.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar (MMLU, HumanEval, GSM8K u otros), pero sí métricas de fidelidad de la conversión frente al modelo original en PyTorch:

| Build | PSNR medio | LPIPS medio | LPIPS peor caso | Estado |
|---|---|---|---|---|
| bf16 | 22,1 dB | 0,118 | 0,147 | Validado |
| 8bit | 21,0 dB | 0,141 | 0,201 | Experimental (bajo umbral) |

No se han publicado resultados de benchmarks de calidad de generación (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repositorio completo ocupa 45,8 GB, pero cada build se carga por separado. El build bf16 ronda los 17-18 GB de pesos (text encoder ~8 GB, transformer ~12 GB, VAE ~168 MB), por lo que requiere al menos 24-32 GB de memoria unificada para inferencia cómoda.
- El build 8bit reduce aproximadamente a la mitad el peso del text encoder y del transformer, siendo apto para equipos con 16-24 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con CUDA ni con GPUs NVIDIA/AMD.
- No cabe en GPUs consumer de NVIDIA ni en hardware x86 convencional; está diseñado exclusivamente para MLX en macOS.
- Opciones de despliegue: framework MLX y ecosistema mflux. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| Z-Image-Turbo-MLX | no disponible | no disponible | Apache 2.0 | Apple Silicon (MLX) | Conversión validada con PSNR/LPIPS |
| Z-Image-Turbo (original) | no disponible | no disponible | Apache 2.0 | PyTorch/CUDA | Modelo base de referencia |
| Otros modelos texto-a-imagen en MLX | no disponible | no disponible | variable | Apple Silicon | No se dispone de datos comparables en la información |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en términos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El build 8bit está marcado como experimental y por debajo del umbral de calidad del autor (PSNR 21,0 dB, LPIPS 0,141), por lo que no se recomienda para producción sin validación adicional.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA, ROCm ni CPU x86.
- El repositorio ocupa 45,8 GB, lo que exige espacio en disco considerable y una descarga larga.
- No se documentan sesgos del modelo original ni del proceso de conversión.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar imágenes incoherentes o no fieles al prompt; no se reportan métricas de adherencia al texto.
- Idiomas soportados por el text encoder: no disponibles, lo que impide confirmar el soporte multilingüe de los prompts.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Tongyi-MAI/Z-Image-Turbo antes de desplegar en producción.
- No se han publicado datos de latencia ni throughput, por lo que el rendimiento real en cada chip Apple debe medirse empíricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Z-Image-Turbo-MLX
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Referencias arXiv citadas en los tags: arxiv:2511.22699, arxiv:2511.22677, arxiv:2511.13649
- Repositorio alternativo del autor mencionado en la model card: https://huggingface.co/moonbox-ai/Z-Image-Turbo-MLX
