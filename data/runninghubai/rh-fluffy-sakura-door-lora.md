# RunningHubAI/rh-fluffy-sakura-door-lora

## Resumen

rh-fluffy-sakura-door-lora es un adaptador LoRA de bajo rango para edición de imágenes (pipeline declarado `image-text-to-image`) publicado por la cuenta RunningHubAI en Hugging Face. El repositorio se distribuye como un único archivo de pesos `asiapussy_v1.safetensors` de 218 MiB y está pensado para cargarse en ComfyUI, en la propia plataforma RunningHub o desde Hugging Face. El autor declara un ajuste fino (fine-tuning) a partir de la base denominada `krea2`, aunque no se especifican el modelo base exacto, su versión ni el rango y alpha del adaptador.

Se trata de un adaptador especializado, no de un modelo generativo completo: no incluye el UNet, el VAE ni el codificador de texto, por lo que su funcionamiento depende por completo del modelo base sobre el que se aplique. La model card remite a un modelo de origen alojado en Civitai cuyo contenido es explícitamente para adultos, y el nombre del archivo de pesos (`asiapussy_v1.safetensors`) confirma esa orientación temática. El repositorio no documenta palabra de activación (trigger word), peso recomendado del LoRA, semilla ni parámetros de muestreo.

La relevancia práctica del repositorio es limitada por su estado: cero descargas, cero "me gusta", licencia no especificada y ausencia total de métricas de calidad o de ejemplos comparativos. Funciona, por tanto, como un artefacto de personalización de estética para flujos de trabajo concretos en ComfyUI más que como un componente validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre un modelo base de difusión; el autor indica `Finetuned from: krea2` |
| Parámetros totales | No disponible. Estimación derivada del tamaño del archivo: 218 MiB equivaldrían a del orden de 1,1 × 10^8 parámetros en fp16/bf16 (cálculo no confirmado por el autor) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Al ser un modelo de difusión no existe ventana de contexto de texto; la resolución de imagen soportada depende del modelo base y no está declarada |
| Tipos de cuantización | No declarados. El adaptador se distribuye en safetensors y se aplica sobre un modelo base que puede cargarse en fp16, bf16 o fp8 según el pipeline empleado |
| Idiomas soportados | No disponibles. La model card está en inglés y chino; los prompts se procesan con el codificador de texto del modelo base, no documentado |
| Licencia | No disponible. La model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`asiapussy_v1.safetensors`, 218 MiB) |
| Tamaño del repositorio | 0,2 GB |
| Pipeline declarado | image-text-to-image |
| Etiquetas | comfyui, lora, image-text-to-image, region:us |
| Fecha de creación / última actualización | 2026-10-12 / 2026-10-12 |
| Descargas / "me gusta" | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para desplazar su comportamiento sin reentrenarlo por completo. La model card no detalla sobre qué componentes se ha aplicado el adaptador (atención cruzada, atención propia, bloques de proyección), ni el rango, el alpha, la tasa de aprendizaje, el número de pasos ni el tamaño del dataset de entrenamiento. Tampoco se indica si el adaptador es específico para un único modelo base `krea2` o si es compatible con variantes o derivados del mismo.

No hay información sobre composición del dataset, resolución de entrenamiento, uso de regularización, técnicas de captioned training, ni sobre si se emplearon métodos de alineación como RLHF o DPO (no aplicables habitualmente a difusión, pero relevantes si el pipeline incorpora un modelo de lenguaje). El único dato verificable es el tamaño del archivo de pesos y la referencia al modelo de origen en Civitai, que apunta a un dataset temático de contenido para adultos. Cualquier uso en producción requiere validar empíricamente el comportamiento del adaptador sobre el modelo base concreto y con los prompts previstos.

## Capacidades

- Generación y edición de imágenes condicionada por texto (`image-text-to-image`), siempre que se cargue junto al modelo base `krea2` u otro compatible.
- Personalización de estética mediante LoRA: modifica el estilo y el contenido generado por el modelo base sin alterar sus pesos originales.
- Aplicación de regiones o detalles concretos derivados del tema declarado en el nombre del repositorio (escena con flores de cerezo y puerta) y del modelo de origen.
- Integración con ComfyUI como nodo `Load LoRA`, encadenable con otros LoRA y con nodos de control (ControlNet, IP-Adapter, etc.) si el grafo lo permite.
- Ejecución remota mediante la API de RunningHub, sin necesidad de GPU local.
- No se declara soporte de tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades de audio o vídeo.
- No se declara capacidad multilingüe; el idioma de los prompts queda determinado por el codificador de texto del modelo base.

## Casos de uso

- Edición de imagen guiada por texto en ComfyUI: cargar el LoRA sobre el modelo base y aplicarlo en un grafo de `image-text-to-image` para modificar una imagen de entrada según el prompt, aprovechando que el adaptador solo ocupa 218 MiB y no requiere VRAM adicional significativa frente al modelo base.
- Automatización por API: desplegar el flujo en RunningHub y consumirlo mediante su API HTTP para generar o editar imágenes bajo demanda desde un backend, evitando gestionar infraestructura de GPU propia.
- Prototipado de concepto visual: generar variaciones de una misma escena con distintos prompts para explorar direcciones artísticas antes de invertir en un entrenamiento propio.
- Personalización de estilo para ilustración: combinar el LoRA con otros adaptadores en ComfyUI para fijar una estética recurrente en una serie de imágenes o en un catálogo.
- Investigación sobre fine-tuning de difusión: usar el adaptador como caso de estudio de LoRA de 218 MiB sobre una base tipo `krea2` para analizar cómo se comporta el ajuste de bajo rango en tareas de edición.
- Generación de contenido para adultos con acceso restringido: el modelo de origen y el nombre del archivo indican esta finalidad; cualquier despliegue exige verificación de edad, control de acceso, cumplimiento normativo y revisión de las políticas de la plataforma de destino.
- Pruebas de regresión de pipelines de inferencia: emplear un LoRA pequeño y aislado para validar que el cargador de adaptadores, la resolución y el scheduler del pipeline funcionan correctamente antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La búsqueda web realizada no devolvió ningún resultado técnico relacionado con este modelo: los enlaces recuperados corresponden a páginas biográficas de una persona sin relación con el repositorio y se han descartado por no ser relevantes. No existen métricas de FID, CLIP score, similitud con el prompt ni comparativas con otros LoRA del mismo tipo.

## Requisitos de hardware

- VRAM para el adaptador: 218 MiB de pesos, con un coste adicional en memoria mínimo durante la inferencia. El requisito real lo determina el modelo base `krea2`, cuyas dimensiones no están documentadas.
- VRAM orientativa para el conjunto: no disponible. Como referencia general de modelos de difusión de imagen de gran tamaño, la inferencia en fp16 suele requerir entre 8 y 24 GB según resolución y uso de optimizaciones, pero este dato no está confirmado para `krea2`.
- GPU recomendadas: no disponibles. La ejecución remota mediante la API de RunningHub o el servicio online del autor evita la necesidad de GPU local.
- GPU de consumo: no confirmado. ComfyUI permite cargar el modelo base en fp8 o usar offloading a CPU/RAM, lo que puede hacer viable la ejecución en tarjetas de gama alta de consumo, pero no hay verificación publicada.
- Opciones de despliegue: ComfyUI (formato nativo del ecosistema), plataforma RunningHub (web y API) y carga directa de los safetensors desde Hugging Face. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje, no para difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen alternativas comparables con datos verificables para este repositorio, ya que la model card no identifica la variante exacta del modelo base `krea2` ni publica métricas. A modo de contexto estructural, la categoría equivalente la forman otros adaptadores LoRA de edición de imagen distribuidos en safetensors para ComfyUI (por ejemplo, adaptadores alojados en Civitai o en Hugging Face), pero no se dispone de cifras de parámetros, contexto ni rendimiento que permitan una comparación rigurosa con este artefacto concreto.

| Aspecto | rh-fluffy-sakura-door-lora | Alternativas comparables |
|---|---|---|
| Tipo | LoRA de edición de imagen | LoRA de edición de imagen |
| Parámetros | No disponible (archivo de 218 MiB) | No disponible |
| Contexto / resolución | No disponible | No disponible |
| Rendimiento | Sin benchmarks publicados | No disponible |
| Licencia | No especificada | Variable según autor |
| Disponibilidad | Hugging Face, ComfyUI, RunningHub | Hugging Face, Civitai, ComfyUI |

## Limitaciones y advertencias

- Licencia no especificada: la model card indica que los derechos pertenecen al autor y remite a la licencia del proyecto original. Sin una licencia explícita no puede asumirse permiso para uso comercial, redistribución ni reentrenamiento.
- Contenido para adultos: el modelo de origen en Civitai y el nombre del archivo de pesos apuntan a contenido explícito. Su uso puede infringir las políticas de plataformas de despliegue, de proveedores de servicios en la nube y de la normativa aplicable sobre verificación de edad y distribución de contenido.
- Ausencia total de documentación técnica: no se indica palabra de activación, peso recomendado del LoRA, rango, alpha, resolución de entrenamiento ni parámetros de muestreo, lo que dificulta reproducir resultados.
- Modelo base no identificado con precisión: `krea2` se menciona como origen del fine-tuning, pero no se especifica versión ni repositorio. Cargar el adaptador sobre una base distinta puede degradar la salida o no producir efecto alguno.
- Riesgo de sesgos: al ser un ajuste temático sobre un dataset no documentado, es probable que reproduzca sesgos de representación de personas, cuerpos y etnias presentes en los datos de entrenamiento. No hay auditoría publicada.
- Alucinación y artefactos visuales: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible, incoherencias espaciales y artefactos, especialmente en resoluciones altas o con prompts ambiguos.
- Idiomas: no se declara soporte multilingüe. Los prompts en castellano pueden rendir peor que en inglés si el codificador de texto del modelo base está entrenado mayoritariamente en este último idioma.
- Falta de validación comunitaria: cero descargas y cero "me gusta" en el momento de redactar esta ficha, sin ejemplos de salida ni issues que permitan evaluar su fiabilidad.
- Nomenclatura inconsistente: el nombre del repositorio (`rh-fluffy-sakura-door-lora`) no coincide con el del archivo de pesos (`asiapussy_v1.safetensors`), lo que complica la trazabilidad y sugiere un reempaquetado del original.
- Fechas de creación y actualización idénticas y separadas por un minuto: el repositorio parece un volcado automático sin mantenimiento posterior.
- Sin soporte declarado para herramientas de agentes, texto o código: no debe evaluarse como modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-fluffy-sakura-door-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2097483100656885761
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Modelo de origen en Civitai (contenido explícito para adultos): https://civitai.red/models/2924720/asian-girls-hairy-pussy?modelVersionId=3309449
- README en chino del repositorio: https://huggingface.co/RunningHubAI/rh-fluffy-sakura-door-lora/blob/main/README_cn.md
