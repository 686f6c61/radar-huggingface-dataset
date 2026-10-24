# RunningHubAI/rh-krea2-03-8000-lora

## Resumen

`rh-krea2-03-8000-lora` es un adaptador LoRA de edición y generación de imágenes publicado por RunningHubAI (RunningHub) en Hugging Face. El adaptador se presenta como un fine-tuning del modelo base denominado «krea2» y está pensado para cargarse en ComfyUI, en la plataforma RunningHub o en cualquier entorno compatible con el ecosistema de Hugging Face. El repositorio tiene un tamano de 0,2 GB y contiene un único archivo de pesos de 224 MiB.

El propósito declarado del modelo es aplicar un estilo estético concreto —descrito por el autor como «Busty Beauty Selfie-8000»— sobre el modelo base, dentro de la categoría de pipelines `image-text-to-image`, es decir, generación de imágenes condicionada por texto y por una imagen de entrada. No se documentan ni la arquitectura del modelo base, ni el dataset de entrenamiento, ni hiperparámetros, ni resultados de evaluación.

Su relevancia es limitada y muy acotada: se trata de un adaptador de nicho, con 0 descargas y 0 «likes» en el momento de la ficha, distribuido sin licencia explícita y sin documentación técnica. Resulta útil únicamente como pieza intercambiable dentro de flujos de trabajo de ComfyUI para experimentación estética, no como modelo generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base «krea2»; arquitectura del base no disponible |
| Parámetros totales | no disponible (adaptador LoRA de 224 MiB; el número de parámetros no se especifica) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no se documenta longitud de prompt) |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors; no se indica precisión fp16/bf16/fp8) |
| Idiomas soportados | no disponible (no se documenta el idioma de los prompts) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y que se debe seguir la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`Krea2-大胸美女自拍-8000.safetensors`, 224 MiB) |
| Tipo de modelo | LoRA de edición de imagen (`image-text-to-image`) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Autor | RunningHub-@litlle wind (publicado por RunningHubAI) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación | 2026-10-23 |
| Última actualización | 2026-10-23 |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de un LoRA de edición de imágenes derivado de «krea2» mediante fine-tuning. No se especifica la arquitectura del modelo base (si es un transformer de difusión, un UNet o un modelo híbrido), ni el número de parámetros del base, ni el rango del adaptador, ni las capas a las que se aplica.

Tampoco se documentan los datos de entrenamiento: no hay cifras de imágenes utilizadas, composición del dataset, resolución de entrenamiento, número de pasos, learning rate, uso de regularización o de captions automáticos. No se menciona ningún proceso de alineación (RLHF, DPO) —lo cual es esperable en un adaptador de imagen— ni innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo. El nombre del archivo incluye el sufijo «8000», que el autor no explica; podría corresponder a pasos de entrenamiento o a un identificador interno, pero no hay confirmación.

## Capacidades

- Generación de imágenes condicionada por texto e imagen de entrada (pipeline `image-text-to-image`), aplicando el estilo del adaptador sobre el modelo base krea2.
- Edición de imágenes existentes dentro de flujos de image-to-image, manteniendo la composición de la imagen de referencia y modificando el acabado estético.
- Integración como adaptador en ComfyUI, cargable junto con el modelo base y otros nodos del grafo.
- Ejecución en la plataforma RunningHub, tanto en su interfaz como a través de su API.
- Composición con otros LoRA y con prompts negativos, siempre que el grafo de ComfyUI lo permita.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- No se documentan capacidades multilingües en los prompts.
- No se documentan modo «thinking», visión de entrada arbitraria ni audio.

## Casos de uso

- **Generación de retratos y selfies para prototipado visual**: el adaptador se carga en ComfyUI sobre krea2 y permite obtener variaciones de retrato con la estética entrenada, útil para maquetas de aplicaciones o pruebas de concepto antes de contratar fotografía real.
- **Exploración de iluminación y encuadre**: partiendo de una imagen de referencia en un flujo image-to-image, el LoRA permite iterar sobre el acabado de un retrato sin volver a disparar la sesión fotográfica.
- **Creación de avatares para entornos de prueba**: generación de imágenes de perfil ficticias para demos, documentación o entornos de staging, con revisión humana previa a cualquier publicación.
- **Investigación sobre adaptadores LoRA**: comparación del efecto de este adaptador frente a otros LoRA del mismo base, midiendo deriva estética y fidelidad al prompt en un conjunto de pruebas controlado.
- **Automatización vía API de RunningHub**: integración del flujo de generación en un pipeline externo que llame a la API para producir lotes de imágenes de forma programática.
- **Pruebas de moderación de contenido**: uso del adaptador como caso de estudio para calibrar clasificadores y filtros de contenido en pipelines de generación de imágenes, dado el carácter explícito del estilo entrenado.
- **Composición con otros adaptadores**: combinación con LoRA de estilo o de iluminación en un mismo grafo de ComfyUI para obtener acabados híbridos en tareas de dirección de arte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de FID, CLIP score, SSIM ni evaluaciones humanas para este adaptador, ni comparaciones cuantitativas con otros LoRA del mismo modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El consumo viene determinado por el modelo base krea2, cuya arquitectura y tamaño no se documentan; el adaptador en sí aporta 224 MiB adicionales.
- GPU recomendadas: no disponible, al no conocerse los requisitos del modelo base.
- Compatibilidad con GPU de consumo: no confirmada. No es posible afirmar que quepa en una RTX 4090, RTX 3090 o inferiores sin conocer el base.
- Despliegue: ComfyUI (formato nativo del adaptador) y la plataforma RunningHub, incluyendo su API. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles. Dependen del base, de la resolución de salida, del número de pasos de muestreo y del sampler configurado en el grafo.
- Almacenamiento: 0,2 GB para el repositorio completo; 224 MiB para el archivo de pesos.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada adaptadores comparables del mismo modelo base con datos públicos de parámetros, contexto o rendimiento. La comparación con otros LoRA de imagen requeriría conocer la arquitectura de krea2 y métricas que el autor no publica.

| Modelo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-03-8000-lora | krea2 | no disponible | no aplica | no disponible | Hugging Face, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Contenido explícito o adulto**: el nombre del modelo y del archivo de pesos describen explícitamente un estilo de desnudo o semidesnudo. Es imprescindible aplicar filtros de moderación y revisión humana antes de cualquier uso en producción o en productos accesibles a menores.
- **Licencia no determinada**: la model card no otorga una licencia concreta y remite a la licencia del proyecto original. Sin conocer la licencia de krea2, no se puede garantizar el uso comercial; hay que verificar el upstream antes de desplegar.
- **Ausencia total de documentación técnica**: no hay información sobre el dataset, el rango del LoRA, la resolución de entrenamiento ni los parámetros recomendados (escala, peso del adaptador, prompts de activación), lo que dificulta la reproducibilidad.
- **Riesgo de sesgos**: al tratarse de un fine-tuning estético sobre un base no documentado, puede heredar y amplificar sesgos de representación corporal, de género, de edad y de etnia presentes en los datos de entrenamiento del base y del adaptador.
- **Alucinación visual**: como cualquier modelo generativo de imagen, puede producir anatomías incorrectas, artefactos en manos y rostros, y elementos incoherentes con el prompt, especialmente en resoluciones altas o con prompts ambiguos.
- **Idioma de los prompts no documentado**: no se garantiza el comportamiento con prompts en castellano; lo habitual en estos adaptadores es un rendimiento sensiblemente mejor en inglés.
- **Adopción nula**: 0 descargas y 0 «likes» implican ausencia de validación por parte de la comunidad; no existen reportes independientes de calidad ni de estabilidad.
- **Dependencia del modelo base**: el adaptador no es autónomo; sin acceso a krea2 y a la versión exacta con la que se entrenó, el resultado puede degradarse.
- **Trazabilidad**: el autor figura como usuario de RunningHub y la publicación la realiza la plataforma en su nombre; conviene conservar la referencia al modelo original para futuras verificaciones.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-03-8000-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-krea2-03-8000-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2079611407020077057
- Página del autor: https://www.runninghub.ai/user-center/2064710712105979905
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Referencia a la API de Seedance 2.5 citada en la model card: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
