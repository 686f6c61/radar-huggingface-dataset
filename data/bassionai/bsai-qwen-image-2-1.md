# BassionAI/BSAI-Qwen-Image-2.1

## Resumen

BSAI-Qwen-Image-2.1 es un reempaquetado de los pesos del modelo de difusión Qwen-Image-2.1 (desarrollado por el equipo Qwen de Alibaba) en formato "single-file" para ComfyUI, distribuido por el usuario BassionAI. No se trata de un modelo nuevo ni de un fine-tune: el autor reorganiza los componentes originales en cuatro ficheros safetensors en bf16 (DiT, text encoder, VAE y un LoRA de muestreo rápido) siguiendo la estructura de directorios de ComfyUI, de modo que puedan colocarse directamente en `ComfyUI/models/` y usarse sin conversiones adicionales.

El modelo subyacente es un sistema unificado de generación text-to-image y edición de imágenes, con un componente de generación visual de 7B parámetros articulado en 32 capas DiT single-stream, según el repositorio oficial de Qwen en GitHub. El texto se codifica con un text encoder del orden de Qwen2.5-VL, que en este paquete ocupa 16,33 GB en bf16, más que el propio backbone de difusión (13,25 GB).

Su relevancia práctica es de conveniencia operativa: elimina el trabajo de descargar pesos por componentes y convertirlos al formato de ComfyUI, e incluye el LoRA Lightning de 4 pasos ya convertido a formato `lora_A`/`lora_B` + alpha. Como contrapartida, el repositorio tiene 0 descargas y 0 likes, no aporta benchmarks propios y declara Apache-2.0 mientras que la información pública sobre el modelo base difiere en licencia, lo que exige verificación antes de cualquier uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 32 capas single-stream para el componente de generación visual; text encoder tipo Qwen2.5-VL; VAE separado |
| Parametros totales | 7B en el componente de generación visual (dato del repositorio oficial de Qwen); total del pipeline completo (DiT + text encoder + VAE) no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica la ventana del text encoder ni el límite de tokens de prompt) |
| Tipos de cuantizacion | Solo bf16 en este repositorio; no se distribuyen GGUF, FP8 ni versiones de menor precisión |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 declarada en este repositorio; la licencia del modelo base debe confirmarse con el autor original (véase "Limitaciones y advertencias") |
| Formato de pesos | safetensors (4 ficheros: DiT 13,25 GB; text encoder 16,33 GB; VAE 1,26 GB; LoRA 0,06 GB) |

## Arquitectura y entrenamiento

El componente generativo es un Diffusion Transformer de 32 capas single-stream con 7B parámetros, según la descripción del repositorio oficial QwenLM/Qwen-Image-2.1, planteado como modelo unificado de generación y edición de imágenes. El pipeline se completa con un text encoder de gran tamaño (16,33 GB en bf16, descrito en la model card como "nivel Qwen2.5-VL") y un VAE de 1,26 GB. Esta separación en tres ficheros es la que el reempaquetado expone directamente a ComfyUI mediante los nodos de carga de `diffusion_models`, `text_encoders` y `vae`.

Este repositorio no entrena nada: es una conversión de formato. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otra etapa de alineación. El único componente añadido es el LoRA Lightning de 4 pasos, procedente de `lightx2v/Qwen-Image-2.1-Lightning` y convertido por el autor a formato ComfyUI (`lora_A`/`lora_B` + alpha), que actúa como destilación de pasos para reducir el número de iteraciones de muestreo.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline `text-to-image`), con el backbone DiT de 7B parámetros.
- Edición de imágenes, según la descripción del modelo base como sistema unificado de generación y edición; la disponibilidad concreta de esta capacidad en el flujo de ComfyUI de este paquete no está documentada.
- Salida con transparencia RGBA nativa, capacidad atribuida al modelo base en la información pública recogida; no verificada en este reempaquetado.
- Muestreo acelerado: el LoRA Lightning incluido permite un flujo de 4 pasos con intensidad recomendada de 1.0, frente al muestreo estándar del modelo.
- Soporte bilingüe de prompts en inglés y chino.
- Integración nativa con ComfyUI mediante nodos de carga de modelo de difusión, text encoder y VAE.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de difusión de imagen, no un modelo de lenguaje.
- No dispone de modo "thinking", entrada de audio ni capacidad de agente.

## Casos de uso

- Despliegue inmediato en ComfyUI: al estar organizados los ficheros por subdirectorio (`diffusion_models/`, `text_encoders/`, `vae/`, `loras/`), un equipo puede tener el pipeline operativo copiando cuatro ficheros, sin scripts de conversión ni descargas por componente.
- Prototipado rápido de conceptos visuales: con el LoRA Lightning a 4 pasos e intensidad 1.0, el ciclo prompt-imagen se acorta lo suficiente para sesiones de exploración de ideas en las que se generan decenas de variantes por concepto.
- Producción de assets gráficos en inglés o chino: adecuado para equipos que generan materiales para mercados anglófono y sinófono, los dos idiomas declarados, y que necesitan coherencia entre ambos.
- Nodos de generación dentro de un grafo ComfyUI más amplio: al ser ficheros individuales, se pueden encadenar con upscalers, segmentadores o postprocesado dentro del mismo workflow, y exponer el conjunto vía la API de ComfyUI como backend de un servicio interno.
- Edición y retoque de imágenes existentes: si se confirma en este paquete la capacidad de edición del modelo base, serviría para tareas de modificación guiada por prompt sobre imágenes de catálogo, evitando un pipeline aparte de inpainting.
- Composición con transparencia: para generar elementos con canal alfa destinados a maquetación (logos, recortes, overlays), siempre que se valide la salida RGBA en esta conversión concreta.
- Base para entrenamiento de LoRAs de estilo o dominio: el repositorio entrega el DiT en bf16 sin cuantizar, lo que lo convierte en un punto de partida razonable para fine-tuning posterior con herramientas que consuman safetensors.
- Evaluación comparativa de la conversión: útil para un equipo que quiera contrastar la fidelidad de este reempaquetado frente a los pesos originales de `Qwen/Qwen-Image-2.1` antes de adoptarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio ni los resultados de búsqueda proporcionados incluyen métricas cuantitativas (GenEval, FID, CLIP score, evaluaciones de edición) para este reempaquetado ni para el modelo base. El único dato numérico de rendimiento recogido corresponde a una variante distinta, Qwen-Image-2.1-Turbo, descrita como capaz de producir imágenes de 2K en 8 pasos; no es extrapolable a este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: el conjunto de pesos suma 30,84 GB (13,25 + 16,33 + 1,26) más 0,06 GB del LoRA. Sin offloading ni carga secuencial, se necesita una GPU con al menos 40 GB de VRAM para operar con holgura sobre los pesos.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB para ejecución completa en bf16 sin offload.
- GPU de consumo: no cabe entero en una RTX 4090 (24 GB). Es viable con carga secuencial de ComfyUI (codificar el prompt con el text encoder, descargarlo y cargar después el DiT) o con modos de bajo VRAM, a costa de latencia y de tráfico entre CPU y GPU. En una GPU de 32 GB el pipeline completo queda muy ajustado.
- El repositorio no ofrece cuantizaciones (FP8, GGUF, NF4), por lo que reducir huella exige generar esas versiones por cuenta propia; no hay datos disponibles sobre su calidad resultante.
- Opciones de despliegue: ComfyUI es el destino previsto (estructura de directorios y nodos indicados en la model card). vLLM, TGI y llama.cpp no aplican a este tipo de modelo. El soporte en Diffusers de esta conversión concreta no está documentado.
- Latencia y throughput: no disponibles. El LoRA Lightning de 4 pasos reduce el número de iteraciones de muestreo, pero no se publican tiempos por imagen ni comparativas con el flujo estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BSAI-Qwen-Image-2.1 (este repositorio) | 7B en el componente visual | en, zh | apache-2.0 declarada en el repo | safetensors bf16, 4 ficheros, ~30,9 GB | Reempaquetado para ComfyUI con LoRA Lightning incluido; 0 descargas; sin benchmarks propios |
| Qwen/Qwen-Image-2.1 (oficial) | 7B en el componente visual | en, zh | reportada como "research license" en prensa especializada; no confirmada en la información disponible | safetensors en la organización original | Fuente canónica; referencia para validar la fidelidad de la conversión |
| Qwen-Image-2.1-Turbo | 7B | no disponible | no disponible | no disponible | Variante de 8 pasos anunciada para generar imágenes de 2K; parámetros de despliegue no disponibles |
| lightx2v/Qwen-Image-2.1-Lightning | No aplica (LoRA de destilado de pasos) | no disponible | no disponible | LoRA convertido aquí a formato ComfyUI (0,06 GB) | Componente incluido en este repositorio para muestreo a 4 pasos |

No se dispone en la información proporcionada de datos verificables sobre alternativas de otros fabricantes (por ejemplo, modelos de generación de imagen de rango 7B-12B con licencia permisiva), por lo que la comparación se limita al ecosistema Qwen-Image-2.1.

## Limitaciones y advertencias

- Licencia: el repositorio declara Apache-2.0, pero la propia model card advierte de que hay que confirmar los términos del modelo upstream, y la información de prensa recogida describe Qwen-Image-2.1 como distribuido bajo "research license". Existe riesgo legal real en uso comercial o redistribución si no se aclara antes.
- Repositorio no validado por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin discusión ni issues públicas que respalden la fidelidad de la conversión.
- Discrepancia de tamaño: HuggingFace reporta un tamaño de repositorio de 1,4 GB, mientras que los ficheros listados en la model card suman 30,90 GB. Conviene verificar el contenido real antes de planificar el almacenamiento y la descarga.
- Sin datos de calidad: no hay benchmarks ni comparaciones con los pesos originales, por lo que no puede afirmarse que el resultado visual sea equivalente al del modelo oficial.
- Idiomas: solo inglés y chino declarados. El comportamiento con prompts en castellano u otras lenguas no está garantizado ni documentado.
- Sesgos y alucinación visual: como modelo de difusión entrenado sobre datos no documentados en esta ficha, puede reproducir estereotipos presentes en sus datos y generar texto ilegible, anatomías incorrectas o recuentos de objetos erróneos. No se ha publicado ninguna evaluación de sesgo.
- Huella de VRAM alta: 30,84 GB de pesos en bf16 sin cuantizaciones alternativas lo excluyen de GPUs de consumo sin offloading.
- Capacidad de edición y transparencia RGBA: atribuidas al modelo base en la información disponible, pero no verificadas en este reempaquetado ni documentadas en su model card.
- No apto para tareas de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling; usarlo fuera del ámbito text-to-image no tiene sentido.
- En producción, fijar la versión del repositorio y de ComfyUI: al ser una conversión de pesos, cambios en los nodos de carga pueden romper la compatibilidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/BassionAI/BSAI-Qwen-Image-2.1
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- LoRA Lightning de origen: https://huggingface.co/lightx2v/Qwen-Image-2.1-Lightning
- Artículo sobre Qwen-Image-2.1 (MarkTechPost, 21/09/2026): https://www.marktechpost.com/2026/09/21/alibaba-qwen-releases-qwen-image-2-1/
- Artículo sobre Qwen-Image-2.1-Turbo (MarkTechPost, 09/10/2026): https://www.marktechpost.com/2026/10/09/alibaba-qwen-releases-qwen-image-2-1-turbo-an-8-step-7b-image-model/
