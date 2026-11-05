# RunningHubAI/rh-mey-low-lora

## Resumen

rh-mey-low-lora es un adaptador LoRA (Low-Rank Adaptation) publicado por RunningHubAI, una plataforma de generación de contenido con IA que aloja flujos de ComfyUI y ofrece servicios de entrenamiento e inferencia vía API. El adaptador está afinado a partir de WAN2.2 en su variante LowNoise, un modelo de difusión de vídeo de la familia Wan (Alibaba), y su función es incorporar el concepto o estilo asociado a la palabra de activación "Mey Low" en flujos de generación de vídeo gestionados desde ComfyUI o desde la propia plataforma RunningHub.

El repositorio es extremadamente ligero (0,2 GB, con un único archivo safetensors de 146 MiB) y no incluye información sobre el dataset de entrenamiento, hiperparámetros, licencia explícita ni idiomas. Se trata, por tanto, de un artefacto de pesos orientado a un caso de uso muy concreto dentro del ecosistema de difusión de vídeo, no de un modelo de lenguaje ni de un modelo fundacional autónomo.

Su relevancia es limitada fuera de ese ecosistema: resulta útil para quien ya trabaje con WAN2.2 LowNoise en ComfyUI y quiera reproducir el efecto "Mey Low", pero carece de documentación técnica suficiente para evaluaciones rigurosas o para integraciones en producción ajenas a RunningHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre WAN2.2 (variante LowNoise); arquitectura base de difusión de vídeo, detalles no disponibles |
| Parámetros totales | no disponible (adaptador LoRA de 146 MiB en safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que se sigue la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`20261105-004043_low_noise.safetensors`, 146 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base WAN2.2 (LowNoise) para modificar su comportamiento generativo sin reentrenar los pesos completos. El modelo base pertenece a la familia Wan de modelos de difusión para generación de vídeo; la variante LowNoise se emplea típicamente en la etapa de refinado o en pasos de denoising con poco ruido dentro de pipelines de vídeo.

No se dispone de información sobre el número de tokens o clips de entrenamiento, la composición del dataset, el rank del LoRA, la tasa de aprendizaje, el número de pasos ni si se aplicaron técnicas adicionales (regularización, captions automáticos, etc.). Tampoco se documenta ninguna innovación técnica específica más allá del propio ajuste fino de bajo rango. La palabra de activación declarada es "Mey Low".

## Capacidades

- Adaptación de estilo o concepto sobre WAN2.2 (LowNoise) para generación de vídeo, activada mediante el trigger word "Mey Low".
- Integración en flujos de ComfyUI como nodo LoRA sobre el modelo base correspondiente.
- Ejecución en la plataforma RunningHub, que permite cargar los pesos y lanzar inferencias sin infraestructura propia.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo; el artefacto no es un modelo de lenguaje.
- No se documentan modos especiales (thinking, audio, etc.).

## Casos de uso

- Generación de vídeo con estilo "Mey Low" en ComfyUI: cargar el LoRA junto con WAN2.2 LowNoise en un workflow de difusión de vídeo y usar el trigger word en el prompt para reproducir el efecto entrenado.
- Prototipado rápido en RunningHub: usar la versión alojada del modelo en la plataforma para validar resultados antes de descargar los pesos y montar un entorno local.
- Refinado de vídeo en pipelines de dos etapas: aplicar el LoRA en la fase LowNoise, donde el modelo base opera con niveles de ruido bajos, para ajustar detalle y textura sin alterar la estructura generada en la fase de alto ruido.
- Producción de clips cortos para redes sociales: integrar el LoRA en un flujo automatizado de ComfyUI que genere variaciones de un mismo concepto a partir de prompts con el trigger word.
- Investigación comparativa de adaptadores: emplear el LoRA como caso de estudio de ajuste fino de bajo rango sobre modelos de difusión de vídeo, midiendo el impacto del rank y del dataset (no documentado) en la fidelidad al concepto.
- Automatización vía API de RunningHub: orquestar la generación de vídeo desde una aplicación externa mediante la API de la plataforma, usando el identificador público del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base WAN2.2 LowNoise; el LoRA en sí añade una sobrecarga mínima (146 MiB en disco). No se dispone de cifras oficiales del modelo base en esta ficha.
- GPU recomendadas: no disponibles para este adaptador; para difusión de vídeo de la familia Wan se suelen emplear GPUs de datacenter (A100, H100) o consumer de gama alta, pero no hay datos confirmados en la información proporcionada.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: ComfyUI (entorno principal), plataforma RunningHub (local e internacional) y su API. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-mey-low-lora | LoRA de difusión de vídeo | WAN2.2 (LowNoise) | 146 MiB (adaptador) | no disponible | no disponible | Hugging Face, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros LoRA de la misma familia o de adaptadores equivalentes para WAN2.2 en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Documentación mínima: no se especifican dataset, hiperparámetros, rank del LoRA ni proceso de entrenamiento, lo que impide evaluar su calidad de forma rigurosa.
- Licencia no declarada: la model card remite a la licencia del proyecto original o upstream, sin concretarla; esto supone un riesgo legal para uso comercial.
- Dependencia total del modelo base: el adaptador solo funciona con WAN2.2 (LowNoise); no es utilizable de forma autónoma ni con otras variantes sin verificación previa.
- Riesgo de sobreajuste al concepto entrenado: al no documentarse el dataset, no puede descartarse que el LoRA reproduzca sesgos, estilos o identidades concretas de las imágenes de entrenamiento.
- Idiomas: no se declara soporte multilingüe; los prompts deben probarse empíricamente.
- Sin métricas publicadas: no hay benchmarks ni evaluaciones de fidelidad, coherencia temporal o calidad visual.
- Repositorio sin descargas ni interacciones en el momento de la consulta, lo que reduce la evidencia comunitaria disponible.
- Uso en producción: requiere validación propia de calidad, latencia y coste, y revisión legal de la licencia antes de desplegarlo en entornos comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-mey-low-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2118155148065644546
- Página del autor: https://www.runninghub.ai/user-center/2103662895817433089
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
