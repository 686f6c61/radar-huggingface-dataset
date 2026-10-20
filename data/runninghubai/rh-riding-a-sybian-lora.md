# RunningHubAI/rh-riding-a-sybian-lora

## Resumen

rh-riding-a-sybian-lora es un adaptador LoRA para generación de vídeo, publicado por RunningHubAI (autor identificado en la model card como RunningHub-@Tiger) y entrenado sobre el modelo base WAN2.2 en su variante LowNoise. No es un modelo de lenguaje ni un modelo fundacional: es un delta de pesos de 146 MiB en formato safetensors que se carga junto al modelo base dentro de ComfyUI, RunningHub o Hugging Face para especializar la generación hacia un contenido concreto. Su único propósito declarado es la generación de vídeo de contenido sexual explícito para adultos, activado mediante la frase de disparo «riding a Sybian».

El repositorio no incluye información técnica sobre el entrenamiento (número de pasos, resolución, dataset, técnica de regularización), no declara licencia y no publica resultados de benchmarks. El nombre del fichero (`sybian-bouncing-wan22-low-noise-e82-az420`) sugiere, por convención de la comunidad, un entrenamiento de 82 épocas con algún tipo de aumento o etiquetado asociado a «az420», pero esto es una inferencia a partir del nombre y no un dato confirmado por el autor.

Su relevancia es limitada y de nicho: ilustra el flujo de trabajo típico de la comunidad de vídeo generativo, en el que LoRAs pequeños (cientos de MiB) se distribuyen por separado del modelo base para modular estilos, movimientos o temáticas concretas. Para desarrolladores e investigadores, su interés es principalmente como ejemplo de empaquetado y despliegue de adaptadores LoRA sobre WAN2.2, no como objeto de evaluación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base WAN2.2 (LowNoise); arquitectura del base no detallada en la informacion disponible |
| Parametros totales | no disponible (adaptador de 146 MiB; el numero de parametros del LoRA no se declara) |
| Parametros activos | no aplica (no es un MoE en si mismo; hereda la estructura del base) |
| Longitud de contexto | no aplica / no disponible (modelo de generacion de video, no de texto) |
| Tipos de cuantizacion | no disponible; el peso se distribuye en safetensors (segun el autor, 146 MiB) |
| Idiomas soportados | no disponible (los prompts de la model card estan en ingles) |
| Licencia | no disponible. La model card indica: «Published by RunningHub on behalf of the author. Copyright remains with the author. Follow the original project or upstream license» |
| Formato de pesos | safetensors (`sybian-bouncing-wan22-low-noise-e82-az420.safetensors`, 146 MiB) |
| Modelo base | WAN2.2 (LowNoise), segun la model card |
| Frase de disparo | «riding a Sybian» |
| Compatibilidad | ComfyUI / RunningHub / Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a determinadas capas del modelo base WAN2.2 (LowNoise) para desplazar su distribución de salida hacia un dominio concreto. La model card no especifica en qué módulos se inyectan los adaptadores (atención, MLP, capas de proyección temporal), ni el rango, ni el alpha utilizado. Tampoco se detallan hiperparámetros de entrenamiento: número de pasos, tamaño de lote, resolución de los clips de entrenamiento, duración de los mismos, uso de captions automáticos o técnicas de regularización.

El nombre del fichero sugiere una convención de la comunidad (`e82` podría corresponder a la época 82 y `az420` a un identificador de configuración o de usuario), pero no hay confirmación en la documentación. No se declara ningún proceso de RLHF, DPO ni ajuste por preferencias, algo por otra parte esperable en un adaptador de difusión para vídeo. No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, destilación de pasos) asociada al adaptador.

## Capacidades

- Generación de vídeo de contenido sexual explícito para adultos, condicionada a la frase de disparo «riding a Sybian».
- Modulación de atributos mediante prompt: la model card incluye una plantilla con conjuntos de variantes para nacionalidad, tamaño y color de elementos, ángulo y tipo de plano, peinado, entorno y expresiones faciales.
- Integración como nodo LoRA en flujos de ComfyUI, con carga sobre el modelo base WAN2.2 LowNoise.
- Ejecución remota mediante la plataforma RunningHub y su API, sin necesidad de infraestructura local.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada (texto/imagen a vídeo según el base, pero no documentadas aquí).
- No se declaran capacidades multilingües; los prompts de ejemplo están en inglés.

## Casos de uso

- Investigación sobre adaptadores de difusión para vídeo: el repositorio sirve como ejemplo de empaquetado mínimo (146 MiB) de un LoRA y de su distribución separada del modelo base, útil para estudiar el formato y el flujo de carga en ComfyUI.
- Pruebas de pipelines NSFW con filtrado previo: equipos que construyan sistemas de moderación pueden usar este adaptador como muestra positiva para validar clasificadores de contenido y umbrales de bloqueo.
- Auditoría de plataformas de generación: permite comprobar cómo una plataforma comercial (RunningHub) publica y referencia adaptadores de terceros, incluyendo la cadena de atribución de autoría y los enlaces a la API.
- Docencia sobre licencias y trazabilidad: caso práctico de repositorio sin licencia explícita, con copyright retenido por el autor, útil para ilustrar riesgos jurídicos en la redistribución de pesos derivados.
- Evaluación de la transferencia de la frase de disparo: estudio de hasta qué punto un único trigger condiciona la salida frente al prompt libre, comparando con el base sin adaptador.
- Producción de contenido para adultos en entornos con verificación de edad y cumplimiento legal: el adaptador está pensado para este fin, siempre que se cumplan las obligaciones de consentimiento, edad y jurisdicción aplicables.
- Benchmarking de consumo de VRAM en adaptadores pequeños: medir el sobrecoste real de cargar un LoRA de 146 MiB frente al modelo base en distintas configuraciones de offload.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FVD, CLIP score, SSIM), ni comparaciones cuantitativas con otros adaptadores, ni tiempos de inferencia medidos.

## Requisitos de hardware

- VRAM para el adaptador: el fichero pesa 146 MiB, por lo que su huella adicional en memoria es marginal frente al modelo base; en fp16 supondría aproximadamente 0,15 GB adicionales.
- VRAM para el modelo base: no disponible en la información proporcionada. Al ser un adaptador sobre WAN2.2 LowNoise, los requisitos vienen determinados por dicho modelo base y por la resolución y duración del vídeo, no por el LoRA.
- GPU recomendadas: no disponible. Depende enteramente del modelo base; los adaptadores de este tipo se ejecutan habitualmente en GPUs de datacenter (A100, H100) o en GPUs de consumo de gama alta con cuantización y offload.
- Cabe en GPU de consumo: no confirmado por el autor; condicionado al modelo base y a la configuración de offload de ComfyUI.
- Opciones de despliegue: ComfyUI (nodo de carga LoRA), plataforma y API de RunningHub, y descarga directa desde Hugging Face. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles. No se publican tiempos por clip ni frames por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-riding-a-sybian-lora | LoRA sobre WAN2.2 LowNoise | 146 MiB de pesos (parametros no declarados) | no disponible | no disponible (copyright del autor) | Hugging Face, RunningHub, ComfyUI |
| WAN2.2 (LowNoise), modelo base | Modelo de generacion de video | no disponible en esta ficha | no disponible | no disponible en esta ficha (depende del proyecto upstream) | Requerido para usar el LoRA |
| Otros LoRAs de la comunidad para WAN2.2 | Adaptadores LoRA | tipicamente cientos de MiB | no disponible | variable, a menudo sin licencia explicita | Hugging Face, Civitai y similares |
| Adaptadores LoRA para modelos de imagen (p. ej. familias SDXL o Flux) | LoRA | decenas a cientos de MiB | no aplica (imagen fija) | variable | Hugging Face, ComfyUI |

No se dispone de datos verificables de rendimiento comparado entre este adaptador y alternativas equivalents, por lo que la comparación se limita a formato, tamaño y condiciones de distribución.

## Limitaciones y advertencias

- Contenido sexual explícito: el adaptador genera material para adultos. Requiere verificación de edad, consentimiento de las personas representadas y cumplimiento de la legislación aplicable en la jurisdicción de uso y distribución.
- Licencia no declarada: la model card remite a la licencia del proyecto original y retiene el copyright del autor. No hay autorización explícita de uso comercial; debe consultarse al autor o a RunningHub antes de cualquier explotación comercial.
- Riesgo de sesgos: la plantilla de la model card fija nacionalidades, tipos corporales y entornos concretos, lo que puede reforzar estereotipos en las salidas generadas.
- Especificidad extrema del dominio: el adaptador está entrenado para una única temática y frase de disparo; fuera de ese contexto su efecto es impredecible y puede degradar la calidad de la generación.
- Dependencia del modelo base: sin WAN2.2 LowNoise en la versión correcta, el LoRA no funciona o produce artefactos. No se documenta compatibilidad con otras variantes (HighNoise, versiones posteriores).
- Sin datos de entrenamiento ni evaluación: no es posible estimar sobreajuste, calidad media ni tasa de fallo. No hay métricas publicadas.
- Riesgo de alucinación anatómica y artefactos: habitual en modelos de difusión de vídeo con prompts muy específicos y movimientos rápidos; no cuantificado por el autor.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Sin soporte declarado: no hay issues, discusiones ni documentación técnica más allá de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-riding-a-sybian-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2027611793610252289
- Página del autor: https://www.runninghub.cn/user-center/1934975843624202242
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Detalle de API citado en la model card: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (referenciado dentro del repositorio)
