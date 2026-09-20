# rachel-luxangel-ai/zit-moody

## Resumen

Zit-moody (Moody Aesthetic ZIT v2) es un adaptador LoRA de estilo para generación de imágenes a partir de texto, publicado en HuggingFace por el usuario rachel-luxangel-ai y sincronizado desde CivitAI (modelo 2667858, version 3027605). No es un modelo completo: es un adaptador que se carga sobre el modelo base Tongyi-MAI/Z-Image-Turbo, un generador text-to-image de la familia Z-Image de Tongyi-MAI. Su función concreta es imponer una estética fotográfica descrita como "moody": iluminación cinematográfica de interiores, luz nocturna urbana y retratos de tres cuartos, activable mediante el prompt "moody photography".

El repositorio ocupa 1,1 GB y contiene el archivo moody-v2.safetensors, distribuido con la librería diffusers. La model card indica una fuerza de aplicación recomendada de 0,4 a 0,6, con 0,5 en la plantilla Lyra, y documenta que el adaptador se ha usado para generar muestras de la plantilla de personaje Noir (peticiones privadas L1). La autoría original se atribuye a catlover1937 en CivitAI, con la indicación expresa de no redistribuir sin consentimiento.

La relevancia de esta ficha es limitada y muy específica: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks. Su interés práctico reside en evaluar si encaja en un pipeline existente de Z-Image-Turbo, no en sustituir a un modelo de generación completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusión (DiT) del modelo base Tongyi-MAI/Z-Image-Turbo |
| Parametros totales | no disponible (el adaptador no publica rango ni número de parámetros; el repo ocupa 1,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; la ventana efectiva la fija el codificador de texto del modelo base, no documentada aquí) |
| Tipos de cuantizacion | no disponible para el adaptador; al estar en safetensors puede cargarse en bf16/fp16 y fusionarse sobre el base cuantizado según el runtime |
| Idiomas soportados | no disponible; el prompt de activación y los ejemplos de la model card están en inglés |
| Licencia | no disponible; la model card indica "Do not redistribute without consent" y atribuye la autoría original a catlover1937 |
| Formato de pesos | safetensors (moody-v2.safetensors), compatible con diffusers |
| Modelo base | Tongyi-MAI/Z-Image-Turbo |
| Prompt de activacion | moody photography |
| Fuerza recomendada | 0,4-0,6 (la plantilla Lyra usa 0,5) |
| Tamano del repositorio | 1,1 GB |
| Versión sincronizada | CivitAI modelVersionId 3027605 (V2.0 Strong, solo ZIT) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del transformer de difusión del modelo base y modifican su comportamiento sin reentrenar los pesos originales. No se dispone de información sobre el rango del adaptador, el número de módulos objetivo ni si se entrenó sobre atención, proyecciones o bloques completos. Tampoco se documenta el número de pasos de entrenamiento, el tamaño del dataset, la resolución de entrenamiento ni si se aplicaron técnicas como regularización por clase o entrenamiento con captions automáticos.

Lo único verificable del proceso es el prompt de instancia ("moody photography"), el modelo base sobre el que se entrena y la recomendación de fuerza de aplicación (0,4-0,6), lo que sugiere un adaptador de efecto intenso que satura la estética si se aplica con pesos altos. El nombre "V2.0 Strong" en la fuente original apunta a una segunda iteración con efecto más marcado que la versión previa, pero no hay datos cuantitativos que lo confirmen.

Respecto al modelo base, la documentación pública de Tongyi-MAI describe Z-Image-Turbo como un transformer de difusión de aproximadamente 6.000 millones de parámetros, destilado para inferencia en pocos pasos, con soporte declarado de texto bilingüe chino-inglés. Estos datos corresponden al modelo base y no se han verificado en el contexto de esta ficha; cualquier decisión de producción debería confirmarse en la model card oficial de Tongyi-MAI/Z-Image-Turbo. No se documenta ningún mecanismo de RLHF, DPO ni decodificación especulativa específico de este adaptador.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) condicionada por el prompt de activación "moody photography".
- Estética fotográfica concreta: iluminación cinematográfica de interiores, escenas nocturnas urbanas, suites de hotel de lujo y retratos de tres cuartos.
- Composición de retrato: la model card incluye ejemplos en posición de pie y reclinada, lo que indica control razonable de pose mediante prompt.
- Integración con diffusers: al publicarse con esa librería, se puede cargar mediante `load_lora_weights` sobre el pipeline del modelo base.
- Ajuste de intensidad del efecto mediante el parámetro de escala del LoRA (rango recomendado 0,4-0,6).
- Uso combinado con plantillas de personaje: la model card menciona su empleo en la plantilla Lyra (personaje Noir), lo que implica generación de series con personaje recurrente.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades de visión por comprensión (no analiza imágenes de entrada); es un generador, no un modelo multimodal de entrada visual.
- No se documentan capacidades multilingües propias; el trigger y los ejemplos están en inglés.
- No se documenta modo thinking, audio ni vídeo.

## Casos de uso

- Dirección de arte y moodboards: generar rápidamente referencias visuales con una estética nocturna y cinematográfica coherente para presentar a un cliente antes de producir un rodaje, ajustando la fuerza del LoRA entre 0,4 y 0,6 según la intensidad deseada.
- Ilustración editorial de moda: producir imágenes de retrato con iluminación dramática para acompañar artículos o campañas, aprovechando la consistencia estética que impone el trigger "moody photography".
- Series de personaje consistente: combinado con una plantilla de personaje (como la plantilla Lyra mencionada en la model card) sobre el mismo modelo base, permite generar un conjunto de imágenes de un personaje ficticio manteniendo rasgos y, al mismo tiempo, un look homogéneo.
- Assets para el sector hospitality y nocturno: generación de imágenes de suites de hotel, terrazas o interiores urbanos de noche para webs, presentaciones comerciales o catálogos, sin depender de fotografía de stock.
- Prototipado de portadas y pósters: exploración de conceptos gráficos con ambiente oscuro y luz controlada antes de encargar el diseño final, integrándolo en un pipeline de diffusers que genere variantes en lote.
- Pruebas A/B de creatividades: dado que el adaptador se puede activar y desactivar por peso, un equipo de marketing puede generar la misma escena con y sin LoRA para medir qué estética rinde mejor en campaña.
- Investigación sobre adaptadores de estilo: como caso de estudio de LoRA de bajo rango sobre un DiT destilado de pocos pasos, útil para analizar cómo afecta la escala del adaptador a la fidelidad del prompt y a la diversidad de la salida.
- Generación por lotes en producción interna: con un pipeline en diffusers sobre el modelo base, el LoRA se puede fusionar en los pesos para reducir la sobrecarga de inferencia en servidores con GPU única.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, comparativas con otros LoRA) ni tablas de evaluación. Tampoco hay mediciones de latencia, throughput o consumo de memoria específicas para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base. Como referencia orientativa no verificada para un DiT de ~6.000 millones de parámetros, la carga en bf16 requiere del orden de 12-16 GB solo para los pesos, más el codificador de texto y las activaciones.
- GPU recomendadas (orientativo, según el modelo base): A100 40 GB, H100 80 GB o RTX 4090 24 GB para inferencia en bf16 sin cuantizar y con margen para lotes pequeños.
- Cabe en GPU de consumo: probablemente sí en RTX 4090, RTX 3090 (24 GB) y RTX 4080 (16 GB) en bf16; en tarjetas de 12 GB (RTX 3060, RTX 4070) sería necesario cuantizar o descargar componentes a CPU. Estas cifras son estimaciones basadas en el tamaño del modelo base, no en mediciones de este adaptador.
- El LoRA en sí añade una sobrecarga de memoria pequeña frente al modelo base, ya que el repositorio completo ocupa 1,1 GB.
- Opciones de despliegue: la librería declarada es diffusers, por lo que el camino natural es un pipeline de diffusers en Python. No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI, que no son aplicables a este tipo de modelo. La integración con ComfyUI es habitual en adaptadores de esta familia, pero no está confirmada en la información disponible.
- Latencia y throughput: no disponible. Al apoyarse en un modelo base destilado de pocos pasos cabe esperar latencias bajas por imagen, pero no hay cifras publicadas para este adaptador.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de licencia de este adaptador, por lo que la comparación cuantitativa no es posible. La tabla siguiente contrasta características estructurales conocidas de la familia de destino; los campos sin dato verificable se marcan como no disponibles.

| Modelo | Tipo | Parámetros del modelo base | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Moody Aesthetic ZIT v2 (este) | LoRA de estilo sobre Z-Image-Turbo | no disponible (base Z-Image-Turbo, ~6.000 M según documentación pública del base) | safetensors | no disponible; prohibida la redistribución sin consentimiento según la model card | no disponible |
| Z-Image-Turbo sin adaptador | Modelo text-to-image base | ~6.000 M (dato público del base, no verificado aquí) | safetensors | no disponible en esta ficha | no disponible |
| LoRA genérico sobre FLUX.1-dev | LoRA de estilo sobre otro DiT | ~12.000 M (dato público del base) | safetensors | depende del autor del adaptador; FLUX.1-dev tiene licencia no comercial | no disponible |
| LoRA genérico sobre SDXL | LoRA de estilo sobre UNet | ~3.500 M (dato público del base) | safetensors | depende del autor; SDXL usa CreativeML Open RAIL++-M | no disponible |

No se han identificado en la información disponible adaptadores directamente comparables entrenados sobre Z-Image-Turbo, por lo que no existe una referencia de calidad relativa para este LoRA.

## Limitaciones y advertencias

- Licencia no declarada y cláusula restrictiva: la model card indica explícitamente "Do not redistribute without consent" y atribuye la autoría original a catlover1937 en CivitAI. El uso comercial no está autorizado de forma explícita y debería aclararse con el autor antes de cualquier despliegue en producción.
- Riesgo de sesgo estético: el adaptador impone una estética muy concreta (iluminación nocturna, interiores de lujo, retratos de tres cuartos). Fuera de esa distribución de prompts, la calidad y la coherencia pueden degradarse de forma notable.
- Contenido sensible: los ejemplos de la model card incluyen retratos de mujeres adultas en lencería. Cualquier despliegue público debería incorporar moderación de contenido, verificación de edad y filtros de prompt, además de revisar la política de uso aceptable del servicio.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, manos deformes, texto ilegible y arquitecturas incoherentes. No existe verificación factual de la escena generada.
- Sin datos de entrenamiento: al no publicarse la composición del dataset, no se puede evaluar el sesgo demográfico, la posible presencia de material con derechos de autor ni la representación equilibrada de distintos grupos.
- Fuerza del adaptador: por encima de 0,6 el efecto puede sobresaturar la imagen y degradar la fidelidad al prompt; por debajo de 0,4 el efecto puede ser imperceptible. El rango 0,4-0,6 es una recomendación del autor, no un resultado medido.
- Idiomas: el trigger está en inglés y no se documenta comportamiento con prompts en castellano. En modelos base con codificador de texto multilingüe el efecto del LoRA con otros idiomas puede ser inconsistente.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, y ventana de publicación de tres minutos entre creación y última actualización. No hay evidencia de uso en producción ni de validación por terceros.
- Compatibilidad no garantizada con futuras versiones del modelo base: los LoRA suelen depender de la arquitectura exacta y de la nomenclatura de capas del base con el que se entrenaron.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/rachel-luxangel-ai/zit-moody
- Modelo base en HuggingFace: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Ficha original en CivitAI: https://civitai.com/models/2667858?modelVersionId=3027605
- Perfil del autor original en CivitAI: https://civitai.com/user/catlover1937
- La búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo: los resultados obtenidos se referían al nombre propio "Rachel" en contextos no relacionados (enciclopedias, comercio de moda y contenido infantil). No se han encontrado papers, blogs técnicos ni repositorios adicionales asociados a este adaptador.
