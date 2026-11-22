# Coffmeteor/MOSS-Image-Turbo

## Resumen

MOSS-Image-Turbo es un adaptador LoRA de aceleración para el modelo de difusión texto-a-imagen MOSS-Image-SFT, desarrollado por el usuario Coffmeteor sobre la base publicada por OpenMOSS-Team. Su objetivo es reducir el coste de inferencia de MOSS-Image-SFT a 16 pasos de muestreo con CFG 1, manteniendo el modelo base en BF16 y sin requerir trigger words ni prompts negativos. Se distribuye en formato safetensors con rango 128 y alpha 128, y está pensado para su uso en ComfyUI mediante la extensión oficial de MOSS.

El adaptador se encuentra en estado beta y su alcance es deliberadamente limitado: según el autor, introduce cierta mejora en la apariencia de piel excesivamente brillante o aceitosa, pero no corrige problemas de anatomía ni de extremidades en escenas con varias personas. No es, por tanto, un modelo de corrección anatómica, sino una pieza de aceleración para flujos de trabajo de generación de imágenes con el modelo base.

La relevancia actual del proyecto radica en que permite evaluar MOSS-Image-SFT con un presupuesto de cómputo mucho menor (16 pasos, CFG 1) y en que incluye un flujo de ComfyUI listo para usar, junto con ejemplos SFW de un solo pase sin upscaling ni retoque. El repositorio ocupa 17,6 GB e incluye tanto el LoRA como material auxiliar y una variante más reciente entrenada sobre un conjunto de fotografías FRAME.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión texto-a-imagen MOSS-Image-SFT; el modelo base no se detalla en la información disponible |
| Parametros totales | no disponible (el LoRA pesa 595 MB en BF16; el modelo base no se cuantifica en la ficha) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no se especifica longitud de prompt máxima) |
| Tipos de cuantizacion | BF16 para el LoRA; el modelo base se usa en BF16 según las instrucciones del autor |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA en BF16, rango 128 / alpha 128); el modelo base se distribuye en el repositorio original de OpenMOSS-Team |

## Arquitectura y entrenamiento

El artefacto principal es un adaptador LoRA de rango 128 y alpha 128 almacenado en BF16, que se aplica sobre el modelo base MOSS-Image-SFT sin modificar sus pesos. La inferencia recomendada emplea 16 pasos con sampler Euler / simple, CFG 1 y flow shift 5, con una fuerza de LoRA de 1.0, sin trigger y con prompt negativo vacío. El flujo de ComfyUI utiliza el cargador de Hugging Face junto con el nodo `ModelSamplingSD3` con shift 5, y el autor insiste en mantener ese emparejamiento cargador/nodo de muestreo.

En cuanto a los datos de entrenamiento, la versión más reciente del repositorio (FRAME SFT Detail 16step-cfg1) es un LoRA BF16 entrenado durante 3.035 actualizaciones sobre 4.591 fotografías del conjunto FRAME, usando el MOSS SFT original con 16 pasos ER-SDE/beta, CFG 1 y shift 5. La versión anterior permanece disponible en el directorio `16step-cfg1/`. No se detalla en la información proporcionada la composición completa del dataset, el uso de RLHF/DPO ni innovaciones adicionales de decodificación más allá del esquema de muestreo acelerado.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts en inglés y chino, sobre el modelo base MOSS-Image-SFT.
- Aceleración de inferencia: 16 pasos de muestreo con CFG 1, lo que reduce el coste frente a configuraciones con más pasos y guidance.
- Mejora específica, según el autor, de la apariencia de piel demasiado brillante o aceitosa.
- Integración con ComfyUI mediante la extensión oficial de MOSS y un workflow JSON incluido en el repositorio.
- Funcionamiento sin trigger words, sin prompt negativo y sin skip-layer guidance.
- Compatibilidad con el flujo de muestreo ER-SDE/beta y con `ModelSamplingSD3` shift 5.
- No incluye corrección de anatomía ni de extremidades en escenas con varias personas.

## Casos de uso

- Prototipado rápido de concepto visual: con 16 pasos y CFG 1 se pueden generar varias iteraciones por prompt en menos tiempo, lo que facilita explorar direcciones artísticas antes de refinar con el modelo base sin el LoRA.
- Retrato de estudio y moda: los ejemplos incluidos (retratos de couture, librería, estudio navideño, lounge de terciopelo) muestran que el adaptador está orientado a escenas de retrato con iluminación controlada, donde la mejora de la piel brillante resulta útil.
- Ilustración editorial y carteles: el ejemplo de póster "Moonlit Journeys" sugiere su uso para composiciones gráficas con texto y atmósfera, siempre con revisión manual del resultado.
- Bodegón y fotografía de producto estilizada: el ejemplo de bodegón de té de jade indica que puede emplearse para naturalezas muertas con materiales y reflejos, un caso donde el control del brillo es relevante.
- Generación de assets para previsualización en pipelines de diseño: al integrarse en ComfyUI mediante workflow JSON, puede encadenarse con otros nodos para producir borradores que luego se retoquen o se amplíen.
- Evaluación comparativa de LoRAs de aceleración: investigadores pueden medir el compromiso entre pasos, CFG y calidad percibida usando los prompts y semillas incluidos en `examples.json`.
- Escenas musicales o de actuación: el ejemplo del guitarrista de jazz muestra su aplicación a figuras humanas individuales en entornos con iluminación dramática, con la advertencia de que la anatomía en grupos no está corregida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del modelo base MOSS-Image-SFT en BF16, que no se detalla en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el autor no especifica modelos de GPU concretos.
- Opciones de despliegue: ComfyUI con la extensión oficial de MOSS (repositorio `OpenMOSS/MOSS-Image`, ruta `comfyui`), cargador de Hugging Face y nodo `ModelSamplingSD3` con shift 5. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles; el autor solo indica que se trata de una opción de generación rápida a 16 pasos con CFG 1.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos recomendados | CFG | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-Turbo (este LoRA) | LoRA de aceleración sobre MOSS-Image-SFT | 16 | 1 | Apache 2.0 | Hugging Face (Coffmeteor) |
| MOSS-Image-SFT (base) | Modelo de difusión texto-a-imagen | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face (OpenMOSS-Team) |
| Otras variantes de aceleración de MOSS-Image | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Estado beta explícito: el autor advierte de que es experimental y que debe juzgarse con los prompts y casos de uso propios.
- No corrige anatomía ni extremidades en escenas con varias personas; esos problemas persisten según la model card.
- La mejora declarada se limita a la apariencia de piel aceitosa o demasiado brillante, sin garantía de generalización a otros estilos.
- Requiere el repositorio completo del modelo base MOSS-Image-SFT en BF16 y la extensión oficial de ComfyUI; no es un modelo autónomo.
- El emparejamiento cargador de Hugging Face / `ModelSamplingSD3` con shift 5 es obligatorio según el autor; desviarse puede degradar los resultados.
- Idiomas soportados limitados a inglés y chino según los metadatos; el comportamiento en castellano no está documentado.
- Riesgo de alucinación visual y de artefactos propios de los modelos de difusión; no se documentan sesgos específicos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado.
- El repositorio incluye una variante más reciente (FRAME SFT Detail 16step-cfg1) con identidad de archivo verificable mediante `release.json` y `SHA256SUMS`; conviene comprobar hashes antes de desplegar.

## Enlaces

- Hugging Face del LoRA: https://huggingface.co/Coffmeteor/MOSS-Image-Turbo
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Extensión oficial de ComfyUI para MOSS: https://github.com/OpenMOSS/MOSS-Image/tree/608158b568fa2e769d918ceccaaf2461f52b3e38/comfyui
- Workflow de ComfyUI: `16step-cfg1/workflows/MOSS-Image-16step-cfg1-ui.json` (dentro del repositorio)
- Prompts y semillas de ejemplos: `16step-cfg1/examples.json` (dentro del repositorio)
- Identidad de la release: `16step-cfg1/release.json` y `16step-cfg1/SHA256SUMS` (dentro del repositorio)
- README de la variante FRAME: `frame-sft-detail-16step-cfg1/README.md` (dentro del repositorio)
