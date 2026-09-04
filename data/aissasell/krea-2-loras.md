# aissasell/Krea-2-LoRAs

## Resumen

El repositorio `aissasell/Krea-2-LoRAs` contiene un conjunto de adaptadores LoRA (Low-Rank Adaptation) entrenados sobre el modelo base `krea/Krea-2-Turbo`, un modelo de generación de imágenes y vídeo. Los LoRA están pensados para modificar atributos específicos de las imágenes generadas: estilo artístico, anatomía, ángulo de cámara, etc. El autor, `aissasell`, publica este material marcado como "not-for-all-audiences" (no apto para todos los públicos) con un contenido explícitamente NSFW.

El repositorio se crea tras la desactivación por HuggingFace de un Space que alojaba uno de estos modelos por riesgo de generación de imágenes íntimas no consensuadas (NCII). En la model card, el autor transcribe el aviso recibido y ofrece alternativas: buscar un espejo o ejecutar el modelo en Runpod clonando su repositorio de GitHub. No se dispone de información técnica detallada sobre la arquitectura del modelo base ni de sus parámetros, por lo que quedan indicados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los archivos de este repositorio son adaptadores LoRA, una técnica de fine-tuning eficiente que modifica un pequeño subconjunto de pesos de un modelo preentrenado mediante matrices de bajo rango. El modelo base es `krea/Krea-2-Turbo`, del cual no se proporciona información sobre su arquitectura, tamaño o datos de entrenamiento en el material disponible.

La model card no detalla el proceso de entrenamiento: no se indica número de tokens, composición del dataset, ni uso de RLHF, DPO u otras metodologías de alineación. Tampoco se describen innovaciones técnicas específicas. El autor menciona únicamente un repositorio de GitHub para ejecutar el modelo en Runpod, pero sin información sobre el entrenamiento de los adaptadores.

## Capacidades

- Ajuste fino de atributos visuales en la generación de imágenes y vídeo mediante LoRAs dedicados: sliders de tamaño y forma, estilo artístico, etc.
- Modificación de aspectos anatómicos concretos a partir de la lista de nombres incluida en la model card (por ejemplo, "Hairy Pussy", "spread_pussy v2", "Breast Size Slider", "Areola Size Slider").
- Aplicación de estilos concretos como "Pixar - Disney 3D Style" o control de ángulo de cámara ("POV Slider").
- Reducción de rechazos del modelo ante ciertos inputs mediante el LoRA "Krea2 TextFusion Refusal-Reduction".
- Los LoRAs son compatibles con la librería `peft`, lo que facilita su carga y combinación con el modelo base.
- No se dispone de información sobre capacidades de tool calling, agentes, razonamiento multietapa, soporte multilingüe ni modos especiales como thinking o visión (más allá de la generación de imágenes).

## Casos de uso

- Prototipado de personajes en 3D: el LoRA "Pixar - Disney 3D Style" permite generar imágenes con estética de animación 3D para previsualizar conceptos de personajes antes del modelado final.
- Control de encuadre en fotografía generativa: el "POV Slider" ajusta la perspectiva de la cámara, útil en fotorrealismo para variar el punto de vista en series de imágenes.
- Investigación en métodos de adaptación LoRA: este repositorio sirve como referencia para estudiar cómo distintos LoRAs de baja dimensión afectan a un modelo base de Krea-2-Turbo en tareas específicas.
- Experimentación con la reducción de rechazos en modelos de texto-a-imagen: el LoRA "TextFusion Refusal-Reduction" puede emplearse en entornos controlados para estudiar las barreras de seguridad implementadas en el modelo base.
- Generación de contenido para audiencias adultas de manera legal y consentida, siempre que se cumplan las normativas locales y no se produzcan imágenes de personas reales sin su consentimiento.
- Despliegue en Runpod: el autor proporciona un repositorio de GitHub para ejecutar el modelo en GPU en la nube, lo que permite escalar la inferencia fuera de HuggingFace Spaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- No se indica si puede ejecutarse en GPU de consumo o solo en GPUs profesionales.
- Opciones de despliegue: el autor sugiere usar Runpod clonando el repositorio de GitHub `minipasila/Krea-2-Turbo_I2I`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo / repositorio | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aissasell/Krea-2-LoRAs | no disponible | no disponible | no publicado | no disponible | público con tag not-for-all-audiences |
| aissasell/Krea-2-Models | no disponible | no disponible | no publicado | no disponible | público con tag not-for-all-audiences |
| mpasila/Krea-2-Models (origen de duplicado) | no disponible | no disponible | no publicado | no disponible | público con tag not-for-all-audiences |

Nota: `aissasell/Krea-2-LoRAs` comparte nombre con los archivos alojados en `mpasila/Krea-2-LoRAs` según los enlaces de la model card, aunque no se dispone de detalles técnicos comparativos.

## Limitaciones y advertencias

- Contenido explícitamente NSFW: el repositorio está marcado como "not-for-all-audiences" y los LoRAs tratan temática pornográfica.
- Riesgo elevado de NCII (imágenes íntimas no consensuadas): HuggingFace deshabilitó un Space del autor por este motivo, tal como se cita en la model card.
- No se aportan sistemas de moderación de entradas ni salidas, lo que incrementa el riesgo de abuso.
- Licencia no especificada: el uso comercial, la redistribución o la modificación quedan sin definir.
- No hay información sobre el proceso de entrenamiento ni sobre la composición de los datos, por lo que pueden existir sesgos implícitos en los adaptadores.
- Al no ser un modelo de lenguaje, los riesgos de alucinación textual no aplican; sin embargo, el modelo base puede generar contenido visual no deseado o inapropiado.
- La fecha de creación registrada (4 de septiembre de 2026) parece incorrecta, pero no se aportan datos que permitan confirmarlo.

## Enlaces

- HuggingFace del repositorio: https://huggingface.co/aissasell/Krea-2-LoRAs
- Repositorio duplicado de modelos: https://huggingface.co/aissasell/Krea-2-Models
- Repositorio de GitHub citado para Runpod: https://github.com/minipasila/Krea-2-Turbo_I2I
- Archivos de LoRA (de la model card): https://huggingface.co/mpasila/Krea-2-LoRAs/resolve/main/Damp_Armpit_v1_Full_Krea2.safetensors
- Enlace de ejemplo a CivitAI: https://civitai.red/models/2796748/damp-armpit-hair-hairy-sweaty-male-armpits-long-curly-thick-wet-bushy-pits-krea-2?modelVersionId=3161349
