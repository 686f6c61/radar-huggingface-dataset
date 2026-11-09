# abide1622/krea2-lora-lipbiting-v2

## Resumen

Krea 2 Lip Biting LoRA (v2) es un adaptador LoRA de concepto para el modelo de generación de imágenes Krea 2, desarrollado por el usuario abide1622. Su única función es añadir una expresión concreta —el labio inferior mordido suavemente por los dientes superiores— a retratos generados con Krea 2, manteniendo intactos el resto de elementos de la imagen: identidad facial, peinado, ropa, iluminación y composición. No es un modelo autónomo, sino un complemento que se carga junto al modelo base krea/Krea-2-Raw.

El adaptador resuelve un problema muy específico de los flujos de trabajo con modelos de difusión: conseguir una expresión facial concreta sin que el modelo base derive hacia otras caras o estilos. Para ello emplea una técnica de entrenamiento con máscara de la boca y un prior de máscara invertida que ancla la predicción fuera de la zona bucal a la del modelo original. Es relevante para quienes construyen pipelines de retrato fotorrealista y necesitan control fino de expresiones sin sacrificar la coherencia del personaje.

El LoRA tiene un tamaño de repositorio de 0,1 GB, rango 16 y se activa mediante la palabra disparadora `lipb1te`. Está entrenado sobre Krea 2 Raw en bf16 y es compatible también con checkpoints y merges basados en Krea 2 Turbo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión Krea 2; red de rango 16, alpha 16 |
| Parametros totales | no disponible (adaptador LoRA; tamano de repo 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible (entrenado en bf16; el modelo base se cuantiza para entrenamiento) |
| Idiomas soportados | no disponible (el prompt de ejemplo está en inglés) |
| Licencia | krea-2-community-license (license: other) |
| Formato de pesos | no disponible (repositorio con carpeta `training/` e `images/`; no se detalla el formato de los pesos) |

## Arquitectura y entrenamiento

Se trata de un LoRA de rango 16 con alpha 16 entrenado con ai-toolkit (versión 0.13.41) sobre Krea 2 Raw en precisión bf16, con el modelo base cuantizado durante el entrenamiento. El entrenamiento se ejecutó durante 3.000 pasos con batch size 1, optimizador AdamW de 8 bits, learning rate 1e-4, schedule de flow matching con timesteps lineales y resolución 1024 con buckets por relación de aspecto, sobre una única NVIDIA B200.

La innovación técnica principal es el enmascaramiento de la pérdida centrado en la boca. Cada imagen del dataset lleva una máscara de la zona bucal revisada manualmente; la pérdida se concentra en labios y dientes, mientras que el resto de la imagen contribuye con un suelo de 0,2 para que el modelo siga viendo la cara completa. Además, se aplica un prior de máscara invertida con peso 0,5: fuera de la boca, el LoRA se empuja hacia la predicción del propio modelo base, lo que evita que aprenda las identidades del conjunto de entrenamiento. Los captions se usaron tal cual, manteniendo la palabra disparadora y con un 5 % de caption dropout.

El dataset es abide1622/lip-biting-V2 (94 imágenes en los subconjuntos `main` y `legacy`), con retratos etiquetados que muestran la mordida de labio. El conjunto principal, con caras variadas, se repitió 3 veces; el conjunto antiguo y más pequeño, 1 vez; ambos se agruparon y mezclaron. El run queda documentado en `training/training-settings.json` y `training/ai-toolkit-config.json`, con commits y hashes fijados.

## Capacidades

- Generación de la expresión de mordida de labio (dientes superiores apoyados o presionando suavemente el labio inferior) en retratos generados con Krea 2.
- Control de intensidad del efecto mediante la fuerza del LoRA: sutil en 0,8–1,0, claro en 1,2–1,4, con riesgo de aspecto amoratado por encima de 1,5.
- Preservación de la identidad y del resto de la escena gracias al prior de máscara invertida; compatible con LoRAs de personaje (por ejemplo, personaje a 0,8 junto a este a ~1,3).
- Compatibilidad con Krea 2 Raw y con checkpoints y merges basados en Krea 2 Turbo.
- Activación mediante la palabra disparadora `lipb1te`, colocable en cualquier posición del prompt.
- No soporta tool calling, agentes ni razonamiento multi-paso: es exclusivamente un adaptador text-to-image.
- Capacidades multilingües: no disponibles; el prompt de ejemplo está en inglés.

## Casos de uso

- Retrato editorial de moda: generar una sesión de retratos fotorrealistas con expresión de mordida de labio para campañas de cosmética o moda, usando el LoRA a fuerza 1,2–1,3 junto a un prompt que describa una expresión relajada.
- Personajes consistentes en series de ilustración: combinar el LoRA con un LoRA de personaje a 0,8 para mantener la identidad del personaje mientras se añade la expresión en varias imágenes de una misma narrativa visual.
- Pruebas de expresión en preproducción: iterar rápidamente sobre variantes de expresión facial en un pipeline de Krea 2 Turbo con 8 pasos, sampler euler, scheduler simple y CFG 1, más un refinado de 1,5× a 4 pasos con denoise 0,3.
- Generación de avatares y retratos de perfil: producir retratos de busto o cuerpo superior con una expresión concreta y natural para apps de avatares, manteniendo pelo, ropa e iluminación del modelo base.
- Contenido para marcas de maquillaje o cuidado labial: generar primeros planos y retratos con labios en primer término, donde la expresión de mordida aporta naturalidad al producto.
- Prototipado de personajes para videojuegos o cómics: explorar expresiones faciales específicas en hojas de personaje sin reentrenar el modelo base, ajustando la fuerza del LoRA según la sutileza deseada.
- Pruebas A/B de expresión en flujos de generación por lotes: comparar el mismo prompt y semilla a fuerzas 0, 0,8, 1,0, 1,2 y 1,4 para elegir el punto de intensidad adecuado antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base Krea 2 y de su cuantización, no del LoRA (0,1 GB de repositorio).
- GPU recomendadas: el entrenamiento se realizó en 1× NVIDIA B200; para inferencia se requiere una GPU capaz de ejecutar Krea 2, dato no especificado en la información disponible.
- ¿Cabe en GPU de consumo? No disponible; depende de los requisitos del modelo base Krea 2, que no se detallan.
- Opciones de despliegue: ai-toolkit aparece como herramienta de entrenamiento; no se indican frameworks de inferencia (vLLM, llama.cpp, Ollama, TGI, ComfyUI, etc.) en la información disponible.
- Latencia y throughput: no disponibles. El ejemplo de la model card usa 8 pasos con sampler euler, scheduler simple y CFG 1, seguido de un refinado de 1,5× a 4 pasos con denoise 0,3, pero no se aportan tiempos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRAs de expresión comparables ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Requiere que el prompt muestre una cara; sin rostro en la escena, la palabra disparadora puede acabar dibujada como texto (por ejemplo, en un cartel).
- Las imágenes de entrenamiento son retratos de mujeres adultas; el efecto funciona mejor con encuadres similares (de cabeza y hombros a cuerpo superior) y puede ser más débil en planos amplios u otros sujetos.
- Modifica una expresión, no la identidad; si la cara deriva, hay que bajar la fuerza del LoRA.
- Por encima de una fuerza aproximada de 1,5 el labio mordido puede verse más oscuro o amoratado.
- Los prompts que piden una sonrisa amplia o boca abierta entran en conflicto con el efecto.
- Licencia Krea 2 Community License: al ser una modificación del modelo Krea 2, se distribuye bajo esa licencia; deben revisarse sus términos para uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un adaptador de expresión, el riesgo principal es la deriva de identidad o la aparición no deseada de texto.
- No se especifican idiomas soportados ni formato de pesos, lo que limita la planificación de despliegue en producción.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/abide1622/krea2-lora-lipbiting-v2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Dataset: https://huggingface.co/datasets/abide1622/lip-biting-V2
- Commit del dataset: https://huggingface.co/datasets/abide1622/lip-biting-V2/tree/164c21ae3bd99524ec32e3944412dc3491baa156
- Licencia (PDF): https://huggingface.co/abide1622/krea2-lora-lipbiting-v2/blob/main/LICENSE-Krea-2.pdf
- ai-toolkit: https://github.com/ostris/ai-toolkit
- Workflow package krea2-lora v4: https://huggingface.co/abide1622/ldc-workflow-krea2-lora/tree/v4
