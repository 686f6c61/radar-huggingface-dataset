# abide1622/krea2-lora-lipbiting-v1

## Resumen

`abide1622/krea2-lora-lipbiting-v1` es un LoRA de concepto para el modelo de generacion de imagenes Krea 2, desarrollado por el usuario abide1622 y publicado en Hugging Face. Su funcion es anadir una expresion facial concreta —el labio inferior mordido suavemente por los dientes superiores— a las generaciones del modelo base `krea/Krea-2-Raw`. No es un modelo autonomo: es un adaptador de bajo rango (rank 16) que se carga sobre Krea 2 y modifica su comportamiento en respuesta a una palabra disparadora.

El adaptador se entrena con 104 retratos de mujeres adultas y se distribuye como un paquete de pesos de aproximadamente 0,1 GB, lo que refleja su naturaleza ligera frente al modelo base. La version 1 se entreno sin mascaras ni leyendas descriptivas, de modo que el LoRA aprende tanto la expresion como el aspecto visual del conjunto de entrenamiento; el propio autor recomienda la version 2 para combinar con LoRAs de personaje.

Su relevancia es acotada pero practica: demuestra un flujo de trabajo reproducible con ai-toolkit sobre Krea 2, con configuracion, dataset y hashes publicados, y sirve como ejemplo de entrenamiento de conceptos faciales de grano fino en modelos de difusion de ultima generacion. La licencia resultante es no comercial, derivada de la Krea 2 Community License y del dataset CC BY-NC 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusion Krea 2; red rank 16, alpha 16 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se especifica en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual definida) |
| Tipos de cuantizacion | no disponible (entrenado en bf16; el modelo base admite checkpoints Raw y Turbo segun el autor) |
| Idiomas soportados | no disponible (las indicaciones de texto se procesan mediante el codificador del modelo base) |
| Licencia | Krea 2 Community License; uso no comercial (dataset CC BY-NC 4.0) |
| Formato de pesos | no disponible de forma explicita; repositorio de 0,1 GB con configuracion de ai-toolkit |

## Arquitectura y entrenamiento

El LoRA se entrena sobre Krea 2 Raw en precision bf16 mediante ai-toolkit (imagen de entrenador `ostris/aitoolkit:0.13.23`), con el paquete de flujo de trabajo `krea2-lora` v1. La red tiene rango 16 y alpha 16, 3.000 pasos, tamano de lote 1, optimizador AdamW de 8 bits con tasa de aprendizaje 1e-4, programacion de ruido por flow matching con pasos lineales, resolucion 1024 con buckets por relacion de aspecto y una unica GPU NVIDIA A100 de 80 GB.

El conjunto de datos son 104 retratos con la expresion objetivo, sin leyendas (cada imagen se entrena solo con la palabra disparadora) y sin mascaras. Esa decision de diseno explica el comportamiento observado: el adaptador captura el estilo del dataset junto con el gesto. El repositorio incluye `training-settings.json` con el commit exacto del dataset y el SHA-256 del archivo del modelo base, y `ai-toolkit-config.json` con la configuracion reproducible.

## Capacidades

- Generacion de imagenes text-to-image con una expresion facial concreta (labio inferior mordido) al introducir la palabra disparadora `lpb1te`.
- Control de intensidad del efecto mediante la fuerza del LoRA, recomendada entre 0,6 y 0,8; el gesto ya es claro a 0,6.
- Compatibilidad con checkpoints y merges basados en Krea 2 Turbo ademas del base Raw.
- Combinacion con LoRAs de personaje para mantener la identidad mientras se aplica la expresion, con deriva facial hacia el estilo del dataset a fuerzas altas.
- Funciona con indicaciones de retrato de encuadre de cabeza y hombros hasta cuerpo superior; se debilita en planos amplios.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un adaptador de imagen.

## Casos de uso

- Retrato editorial de moda: generar imagenes de estilo revista con una expresion concreta y coherente, usando indicaciones detalladas de iluminacion, optica y pelicula junto a `lpb1te`, como en el ejemplo del autor con objetivo de 85 mm a f/1.4 y look Kodak Portra 400.
- Produccion de variaciones de personaje: cargar el LoRA junto a un LoRA de identidad para obtener el mismo personaje con la expresion en distintas escenas, ajustando la fuerza a 0,6-0,8 para limitar la deriva facial.
- Ilustracion de narrativa y storyboards: incorporar el gesto en secuencias de ficcion donde la expresion comunica tension o intimidad, manteniendo encuadres de retrato.
- Pruebas de concepto para estudio de expresiones: usar la matriz de fuerzas publicada (0, 0.6, 0.8, 1.0, 1.2) como referencia para calibrar resultados antes de integrar el adaptador en un flujo mayor.
- Experimentacion en ComfyUI: integrar el LoRA en grafos de ComfyUI con checkpoints Krea 2 Turbo y merges fotorealistas a 8 pasos, sampler euler, scheduler simple y CFG 1, segun los ajustes documentados.
- Referencia para entrenamiento de LoRAs de concepto: reutilizar la configuracion de ai-toolkit y el esquema de registro (settings, config, commit del dataset, hash del modelo base) como plantilla para entrenar otros gestos o expresiones.
- Generacion de material para prototipos creativos no comerciales: moodboards y pruebas de direccion de arte, dado que la licencia restringe el uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta evaluaciones cualitativas mediante imagenes de ejemplo y una matriz de fuerzas, sin metricas numericas como FID, CLIP score o similitud facial.

## Requisitos de hardware

- El adaptador ocupa aproximadamente 0,1 GB, por lo que su carga anade un coste de memoria marginal sobre el modelo base Krea 2.
- El entrenamiento documentado se realizo en 1 GPU NVIDIA A100 de 80 GB, con bf16 y resolucion 1024.
- VRAM de inferencia: no disponible en la informacion; depende enteramente del checkpoint Krea 2 empleado (Raw o Turbo) y de su cuantizacion.
- GPU recomendadas: no disponible de forma especifica; el autor cita un merge fotorealista basado en Krea 2 Turbo con 8 pasos, lo que sugiere inferencia relativamente ligera, pero no se publican requisitos minimos ni confirmacion de ejecucion en GPU de consumo.
- Opciones de despliegue: ComfyUI (mencionado en la busqueda web y en los ejemplos del autor); ai-toolkit para reentrenamiento. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abide1622/krea2-lora-lipbiting-v1 | LoRA de concepto sobre Krea 2 | rank 16, alpha 16; repo 0,1 GB | no aplica | Krea 2 Community License, no comercial | Hugging Face, 0 descargas, 0 likes |
| abide1622/krea2-lora-lipbiting-v2 | LoRA de concepto sobre Krea 2, version corregida | no disponible | no aplica | no disponible en la informacion | Hugging Face, recomendada por el autor para uso con LoRAs de personaje |
| abide1622/moss-lora-lipbiting-v2 | LoRA de concepto sobre un modelo Moss, segun referencias de Reddit | no disponible | no aplica | no disponible | Hugging Face, citada en r/comfyui |

No se dispone de datos de rendimiento cuantitativos para establecer una comparacion numerica entre estas alternativas.

## Limitaciones y advertencias

- Licencia no comercial: el dataset de entrenamiento es CC BY-NC 4.0 y el adaptador se distribuye bajo la Krea 2 Community License, por lo que no puede usarse en productos comerciales.
- No es un producto oficial de Krea y no cuenta con su respaldo.
- Deriva de estilo: al entrenarse sin leyendas ni mascaras, el LoRA arrastra el aspecto del conjunto de entrenamiento; con LoRAs de personaje y fuerzas altas, los rostros se acercan a ese estilo. La version 2 corrige este problema.
- Dependencia del encuadre: entrenado con retratos de mujeres adultas, el efecto se debilita en planos amplios y puede no transferirse bien a otros sujetos.
- Riesgo de texto espurio: si la escena no muestra un rostro, la palabra disparadora puede aparecer dibujada como texto en la imagen (por ejemplo, en un cartel).
- Conflicto con indicaciones: las peticiones de sonrisa amplia o boca abierta compiten con el efecto y lo anulan.
- Sesgo de dominio: el dataset son exclusivamente retratos de mujeres adultas, lo que puede sesgar la expresion hacia ese tipo de rostro.
- Sin datos de benchmarks ni evaluacion cuantitativa publicada; la validacion es unicamente cualitativa.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia facial o dental incoherente, especialmente a fuerzas altas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abide1622/krea2-lora-lipbiting-v1
- Version 2 recomendada: https://huggingface.co/abide1622/krea2-lora-lipbiting-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/abide1622/lip-biting (commit `ebae14ac5d3d9281c2899363a30c278a2501ec29`)
- Licencia Krea 2: https://huggingface.co/abide1622/krea2-lora-lipbiting-v1/blob/main/LICENSE-Krea-2.pdf
- Paquete de flujo de trabajo krea2-lora v1: https://huggingface.co/abide1622/ldc-workflow-krea2-lora/tree/v1
- ai-toolkit: https://github.com/ostris/ai-toolkit
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Referencia en r/comfyui: https://www.reddit.com/r/comfyui/
