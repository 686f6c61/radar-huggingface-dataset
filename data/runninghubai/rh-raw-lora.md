# RunningHubAI/rh-raw-lora

## Resumen

rh-raw-lora es un adaptador LoRA (Low-Rank Adaptation) para generación de imágenes a partir de texto, publicado en Hugging Face por RunningHubAI. No es un modelo autónomo: se trata de un ajuste fino sobre el modelo base Z-image-base cuyo objetivo es dotar a las imágenes generadas de una estética fotográfica "raw" (cruda), es decir, un aspecto natural y poco procesado, como sugiere su título original en chino 虚实之间-浑然天成（偏raw）("entre lo real y lo virtual, de apariencia natural, con sesgo raw").

El repositorio contiene un único archivo de pesos, `test9_c1-st5000.safetensors`, de 303 MiB, pensado para cargarse en ComfyUI o en la plataforma en la nube de RunningHub, que ofrece tanto el entrenamiento de LoRA como su ejecución vía API. Su relevancia como proyecto individual es limitada (0 descargas y 0 likes en el momento de redactar esta ficha, publicado el 25 de octubre de 2026), pero es representativa del flujo de trabajo de RunningHub: entrenar adaptadores de estilo en su plataforma y distribuirlos listos para producción en ComfyUI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión texto a imagen |
| Modelo base | Z-image-base |
| Parámetros totales | no disponible (archivo de pesos de 303 MiB) |
| Longitud de contexto | no aplicable (modelo texto a imagen, no LLM) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en Hugging Face; publicado por RunningHub en nombre del autor, el copyright permanece en el autor |
| Formato de pesos | safetensors (LoRA) |
| Tipo de pipeline | text-to-image |
| Tamaño del repositorio | 0,3 GB |
| Plataformas | ComfyUI / RunningHub / Hugging Face |

## Arquitectura y entrenamiento

El modelo sigue el esquema LoRA estándar: en lugar de modificar el modelo base, se entrenan matrices de bajo rango que se inyectan en las capas del modelo de difusión Z-image-base, que permanece congelado. Esto permite distribuir un adaptador de solo 303 MiB que altera el estilo de las imágenes generadas sin duplicar el modelo completo. El sufijo `st5000` del nombre del archivo sugiere 5000 pasos de entrenamiento, aunque este dato no está documentado formalmente en la model card.

No se ha publicado información sobre el rango (rank) y alpha del adaptador, los módulos objetivo, el dataset de entrenamiento, su composición ni su tamaño. Tampoco hay datos sobre técnicas de alineación (no aplicables en la práctica a LoRAs de estilo visual). La model card indica que el entrenamiento se realizó en la plataforma de entrenamiento de modelos de RunningHub, y el proyecto procede de un usuario de dicha plataforma (@蛋炒饭).

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image) aplicando un estilo fotográfico raw y realista sobre las salidas de Z-image-base.
- Carga como LoRA estándar en formato safetensors dentro de flujos de trabajo de ComfyUI, con peso del adaptador ajustable.
- Ejecución en la nube a través de RunningHub, sin GPU local, y acceso programático mediante su API.
- Al ser un LoRA de estilo y no un LLM, no dispone de tool calling, function calling, agentes ni razonamiento multi-paso.
- No hay palabras disparadoras (trigger words) documentadas ni instrucciones de uso del prompt.
- Soporte multilingüe de prompts: no disponible; depende de las capacidades del modelo base Z-image-base.

## Casos de uso

- Fotografía generativa de aspecto realista: el LoRA está orientado a producir imágenes con estética "sin retocar", útil para retratos y escenas que eviten el acabado excesivamente pulido típico de los modelos de difusión.
- Integración en flujos de trabajo ComfyUI existentes: se añade el nodo de carga de LoRA sobre Z-image-base en un grafo ya montado y se ajusta la intensidad del adaptador sin modificar el resto del pipeline.
- Generación de imágenes vía API: aplicaciones web o móviles pueden invocar el modelo a través de la API de RunningHub sin infraestructura GPU propia, pagando por uso.
- Contenido para marketing y redes sociales: creación de imágenes de producto o estilo de vida con apariencia fotográfica natural para redes, banners o material promocional.
- Exploración creativa y moodboards: permite generar rápidamente variaciones visuales en un estilo coherente para definir la dirección de arte de un proyecto.
- Comparativas de estilo A/B: al ser un adaptador desactivable, se puede alternar entre la salida del modelo base y la salida con el LoRA activo para evaluar el aporte estético en un mismo prompt.
- Referencia para entrenar LoRA propios: el proyecto sirve como ejemplo práctico del pipeline de entrenamiento y publicación de LoRA de la plataforma de RunningHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. En el caso de los LoRAs de estilo, la evaluación suele ser cualitativa (comparación visual de salidas con y sin adaptador), y la model card no incluye galerías de ejemplos ni métricas de fidelidad al prompt.

## Requisitos de hardware

- El adaptador ocupa 303 MiB, por lo que la VRAM la consume casi en su totalidad el modelo base Z-image-base, cuyo tamaño no se especifica en la model card.
- Como referencia general, los modelos de difusión texto a imagen recientes de tamaño medio suelen ejecutarse en GPUs de consumo con 8-16 GB de VRAM; la sobrecarga añadida por el LoRA es mínima respecto al modelo base. Estos valores son orientativos: no hay requisitos oficiales publicados.
- GPU recomendadas: no disponible. ComfyUI funciona habitualmente en GPUs NVIDIA de consumo (series RTX 30/40), pero no hay una configuración validada para este modelo concreto.
- Opciones de despliegue: ComfyUI en local (formato LoRA safetensors estándar) y RunningHub en la nube con ejecución vía API. Herramientas como vLLM, llama.cpp, Ollama o TGI no son aplicables al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existen alternativas publicadas con especificaciones comparables en la información disponible. Como referencia de categoría, se compara con su modelo base y con la categoría genérica de LoRAs de estilo fotográfico:

| Modelo | Tipo | Base | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-raw-lora | LoRA de estilo raw | Z-image-base | 303 MiB | no disponible | Hugging Face, ComfyUI, RunningHub |
| Z-image-base (sin adaptador) | Modelo base texto a imagen | — | no disponible | no disponible en esta ficha | no disponible en esta ficha |
| LoRAs realistas para SDXL / Flux (Civitai y similares) | LoRAs de estilo fotográfico | SDXL, Flux, etc. | variable (decenas a cientos de MiB) | variable según autor | Civitai y otras comunidades |

La diferencia práctica frente a los LoRAs de otras familias es la dependencia del ecosistema: rh-raw-lora requiere Z-image-base como base y está integrado en el flujo de ComfyUI y RunningHub, mientras que los LoRAs de SDXL o Flux no son intercambiables entre arquitecturas.

## Limitaciones y advertencias

- Licencia sin especificar en Hugging Face: existe incertidumbre legal para uso comercial. La model card remite a la licencia del proyecto original o upstream, por lo que conviene verificarla antes de cualquier despliegue en producción.
- Dependencia del modelo base Z-image-base y de su propia licencia, que condiciona el uso del conjunto base más adaptador.
- Documentación de entrenamiento inexistente: se desconocen los datos usados, el rank, el alpha y las palabras disparadoras, lo que dificulta reproducir el resultado o auditar sesgos.
- Al tratarse de un LoRA que incrementa el realismo fotográfico, existe un riesgo elevado de generar imágenes fotorrealistas confundibles con fotografías reales; su uso requiere precaución ética (desinformación, retratos de personas reales sin consentimiento).
- Sesgos del modelo: no disponibles; hereda los del modelo base Z-image-base y añade los propios del dataset de entrenamiento, no documentado.
- Al ser un recurso recién publicado (25 de octubre de 2026) con 0 descargas y 0 likes, carece de validación comunitaria y de ejemplos verificados por terceros.
- Posible interferencia con otros estilos o LoRAs si se combinan varios adaptadores en el mismo grafo de ComfyUI; no hay documentación sobre compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-raw-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-raw-lora/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2056202816980561922
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Plataforma de entrenamiento de modelos de RunningHub: https://www.runninghub.ai/page-model
- Página del autor: https://www.runninghub.cn/user-center/1998426240958746626
