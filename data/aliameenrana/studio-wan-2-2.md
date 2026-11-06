# aliameenrana/studio-wan-2.2

## Resumen

`aliameenrana/studio-wan-2.2` es un repositorio de agregación que reúne, sin modificaciones, los ficheros de pesos que utiliza el *motion worker* de Studio sobre Runpod. No es un modelo entrenado por el autor: los pesos proceden del repackaging oficial de Comfy-Org (`Comfy-Org/Wan_2.2_ComfyUI_Repackaged`, bajo `split_files/...`), que a su vez empaqueta los modelos originales de Alibaba Wan: `Wan-AI/Wan2.2-I2V-A14B` y `Wan-AI/Wan2.2-TI2V-5B`, ambos publicados con licencia Apache-2.0. Adicionalmente incluye LoRAs de destilación a 4 pasos procedentes de `lightx2v`.

Wan 2.2 es la familia de modelos generativos de vídeo de Alibaba, con variantes de imagen a vídeo (I2V) y de texto+imagen a vídeo (TI2V). La relevancia de este repositorio es puramente operativa: agrupa en un único *snapshot* todos los artefactos necesarios para que un contenedor en Runpod pueda cachearlos y arrancar el pipeline de generación de vídeo sin descargas dispersas. No aporta pesos nuevos, ni fine-tuning, ni una model card técnica propia más allá de la procedencia de los ficheros.

El tamaño del repositorio es de 49,4 GB, coherente con la suma de los dos modelos base en precisión original más las LoRAs de aceleración. El repositorio no registra descargas ni *likes* en el momento de la consulta y no declara pipeline, idiomas ni métricas de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para generación de vídeo; detalles de la arquitectura interna no documentados en la información proporcionada) |
| Parámetros totales | no disponible (los identificadores indican variantes de 14B y 5B, sin desglose confirmado en la información disponible) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la ventana relevante sería la longitud de vídeo generable, no documentada aquí) |
| Tipos de cuantización | no disponible (el repackaging de ComfyUI suele incluir variantes en fp16/fp8, pero no se confirma en la información proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (ficheros `split_files/...` del repackaging de ComfyUI; no confirmado explícitamente en la información disponible) |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna de los modelos Wan 2.2. Por los identificadores de los modelos originales (`Wan2.2-I2V-A14B` y `Wan2.2-TI2V-5B`) se trata de modelos de difusión para generación de vídeo, uno orientado a imagen-a-vídeo y otro a texto+imagen-a-vídeo, con variantes de escala 14B y 5B. No se dispone de datos sobre composición del dataset de entrenamiento, número de tokens o muestras, ni sobre etapas de alineación (RLHF/DPO), que en modelos de difusión no aplican del mismo modo que en LLM.

El único elemento técnico diferencial documentado en este repositorio es la inclusión de LoRAs de destilación a 4 pasos procedentes de `lightx2v`. Estas LoRAs permiten reducir el número de pasos de muestreo necesarios para generar vídeo, lo que se traduce en menor latencia de inferencia a costa de cierta pérdida de calidad frente al muestreo completo. Los pesos se distribuyen en el formato de repackaging de ComfyUI, pensado para su carga directa en flujos de trabajo de ComfyUI.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (variante I2V, `Wan2.2-I2V-A14B`).
- Generación de vídeo a partir de texto e imagen (variante TI2V, `Wan2.2-TI2V-5B`).
- Aceleración del muestreo mediante LoRAs de destilación a 4 pasos (`lightx2v`).
- Integración con ComfyUI a través de los ficheros repackaged de Comfy-Org.
- Despliegue en infraestructura cloud tipo Runpod con caché de ficheros.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-step, visión general, audio ni modo *thinking*.

## Casos de uso

- Generación de vídeo publicitario a partir de imágenes de producto: la variante I2V permite animar una foto fija de catálogo y producir clips cortos para campañas, con la LoRA de 4 pasos reduciendo el coste por iteración durante la fase de exploración creativa.
- Previsualización de *storyboards*: un equipo de producción puede convertir ilustraciones de guion en animáticas rápidas usando TI2V, iterando sobre el montaje antes de comprometer recursos de render final.
- Creación de contenido para redes sociales: generación de clips verticales a partir de una imagen base, desplegando el *worker* en Runpod con los pesos ya cacheados para minimizar el tiempo de arranque en instancias efímeras.
- Prototipado de pipelines de vídeo generativo en ComfyUI: el repositorio sirve como fuente única de artefactos para reproducir un entorno de trabajo entre máquinas y equipos, al estar los ficheros en la estructura `split_files/` que espera el repackaging oficial.
- Automatización de *motion graphics* en flujos internos: el *motion worker* de Studio puede consumir estos pesos para generar transiciones y animaciones a partir de *assets* estáticos dentro de una cadena de producción automatizada.
- Evaluación comparativa de modelos de vídeo: investigadores pueden desplegar ambas variantes (14B y 5B) desde un mismo repositorio para medir calidad frente a latencia y decidir qué escala usar en producción.
- Docencia y demostraciones: al estar todo agrupado y bajo Apache-2.0, resulta adecuado para talleres donde se necesita un entorno reproducible sin depender de descargas fragmentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en la información proporcionada. Como referencia orientativa de orden de magnitud, un modelo de difusión de vídeo de 14B en fp16 requiere del orden de 28 GB solo para pesos, a los que se suman activaciones y el VAE, por lo que en la práctica se necesitan GPUs de 40-80 GB para la variante 14B en precisión original; la variante 5B es sustancialmente más ligera. Estas cifras son estimaciones de orden de magnitud, no datos confirmados del repositorio.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, la variante 14B encaja en A100 80 GB o H100; la variante 5B podría ejecutarse en GPUs de 24 GB con cuantización.
- ¿Cabe en GPU de consumo? No confirmado. La variante 5B con cuantización es la candidata razonable para GPUs de consumo de gama alta (24 GB); la variante 14B no cabría sin cuantización agresiva u *offloading*.
- Opciones de despliegue: ComfyUI (formato nativo del repackaging), contenedores en Runpod con caché de ficheros. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Escala | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| studio-wan-2.2 (este repo) | 14B y 5B (según identificadores) | Difusión vídeo I2V / TI2V, repackaging | Apache-2.0 | Hugging Face, 49,4 GB |
| Wan-AI/Wan2.2-I2V-A14B | 14B | Difusión vídeo imagen-a-vídeo | Apache-2.0 | Hugging Face (modelo original) |
| Wan-AI/Wan2.2-TI2V-5B | 5B | Difusión vídeo texto+imagen-a-vídeo | Apache-2.0 | Hugging Face (modelo original) |
| Comfy-Org/Wan_2.2_ComfyUI_Repackaged | no disponible | Repackaging para ComfyUI | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de benchmarks ni de comparativas de rendimiento frente a otras familias de modelos de vídeo en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo original: es una copia agregada de pesos de terceros. Cualquier problema de calidad, sesgo o comportamiento proviene de los modelos Wan 2.2 originales, no del autor del repositorio.
- No existe model card técnica propia: no se documentan sesgos, composición del dataset ni evaluaciones. La ausencia de esta información impide auditar el comportamiento del modelo.
- Riesgo de artefactos y alucinación visual: como todo modelo generativo de vídeo, puede producir movimiento incoherente, deformaciones anatómicas y contenido no fiel a la imagen de entrada; no se han publicado métricas que cuantifiquen este riesgo.
- Las LoRAs de 4 pasos sacrifican calidad frente al muestreo completo; su uso en producción debe validarse por caso.
- Licencia Apache-2.0 en el repositorio y en los modelos originales según la model card, lo que en principio permite uso comercial; sin embargo, conviene verificar los términos de las LoRAs de `lightx2v` por separado, ya que su licencia no se detalla en la información proporcionada.
- El repositorio tiene 0 descargas y 0 *likes*, sin pipeline declarado ni idiomas: no hay señal de validación por parte de la comunidad.
- El tamaño de 49,4 GB implica requisitos de almacenamiento y de caché considerables en entornos cloud; el arranque en frío sin caché previa puede ser lento.
- No apto para tareas de NLP: no es un LLM y no soporta texto, tool calling ni razonamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aliameenrana/studio-wan-2.2
- Modelo original I2V: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Modelo original TI2V: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Repackaging de ComfyUI: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- LoRAs de destilación: https://github.com/lightx2v (referencia de origen citada en la model card; URL exacta no disponible)
