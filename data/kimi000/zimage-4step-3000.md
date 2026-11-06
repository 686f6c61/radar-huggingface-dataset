# kimi000/ZImage-4Step-3000

## Resumen

ZImage-4Step-3000 es un checkpoint experimental de generación de imágenes texto-a-imagen derivado de Tongyi-MAI/Z-Image, publicado por el usuario kimi000. Se trata de una destilación de un modelo de difusión de gran tamano (6.186 millones de parámetros totales en el transformer) que permite generar imágenes de 1024×1024 con tan solo 4 evaluaciones del modelo, frente a los decodificadores iterativos habituales de decenas de pasos. El autor lo entrena con una única etapa de destilación AnyFlow2 mediante interval TDM con consultas independientes, partiendo de un LoRA de rango 256 que se fusiona en el transformer BF16 para su distribución.

El repositorio contiene un directorio Diffusers completo con pesos Safetensors fragmentados, tokenizer, text encoder, VAE, scheduler y el código fuente del pipeline personalizado, por lo que no requiere cargar adaptadores PEFT ni checkpoints de optimizador. La relevancia actual reside en la eficiencia: reducir a 4 pasos la inferencia de un modelo de difusión de este tamano abarata drasticamente el coste por imagen, aunque se trata de un checkpoint de investigación sin benchmarks declarados.

El modelo se publica bajo licencia Apache-2.0, hereda las capacidades y limitaciones del modelo base Tongyi-MAI/Z-Image y solo ha sido entrenado y evaluado con prompts en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Z-Image) con adaptación AnyFlow2 de base global condicionada por intervalo; pipeline personalizado `ZImageAnyFlow2Pipeline` |
| Parametros totales | 6.186.653.952 (6,19 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | BF16 en los pesos distribuidos; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (entrenado con prompts en inglés; otros idiomas no evaluados) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors fragmentados (sharded) + código Python del pipeline personalizado |

## Arquitectura y entrenamiento

El modelo parte del transformer nativo de Tongyi-MAI/Z-Image, que Diffusers implementa con sus componentes de transformer y pipeline. Sobre esa base se aplica una adaptación AnyFlow2 que introduce un transformer de base global condicionado por intervalo (128 bases triangulares en coordenadas globales) y un sampler especifico. El estudiante se inicializa desde el modelo base y se entrena con una única etapa de destilación AnyFlow2 mediante independent-query interval TDM, con un objetivo de regresión de velocidad combinado con el término TDM ponderado a 10. Durante el entrenamiento se usa CFG del profesor de 4,0, mientras que en inferencia no se aplica CFG adicional.

Los detalles del entrenamiento incluyen resolución de 1024×1024 con batch global de 128, presupuesto de rollout del estudiante de 4 pasos, un time shift fijo de 6,0 y una escala de intervalo final de 0,5. La mezcla de prompts de entrenamiento es MJHQ al 50 %, un subconjunto inglés de TextAtlas al 25 % y un dataset de prompts con modelo de recompensa en inglés al 25 %. El LoRA de entrenamiento tiene rango 256 y alpha 256, y se fusiona en el transformer BF16 para la exportación. La rejilla temporal cruda de 4 pasos es `[1, 5/7, 3/7, 1/7, 0]`, que tras el shift 6 queda en `[1, 0.9375, 0.8181818, 0.5, 0]`; el scheduler incluido debe usarse para preservar esta rejilla. El checkpoint corresponde exactamente al paso 3000 con pesos EMA.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024×1024 en 4 evaluaciones del modelo.
- Renderizado de texto en imagen (el ejemplo de la model card genera un cartel con las palabras "HELLO WORLD"), aunque el autor advierte que el texto renderizado puede contener errores.
- Generación fotorrealista y de tipografía limpia segun los ejemplos proporcionados (fotografía callejera de una librería, cartel tipográfico).
- Soporte de semilla fija mediante `torch.Generator` para reproducibilidad.
- Opciones de ahorro de memoria mediante `enable_model_cpu_offload()` o el flag `--cpu-offload` del demo.
- El cabezal continuo permite, teoricamente, más pasos de los 4 entrenados, aunque el experimento solo entrena trayectorias de 4 pasos.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento (no aplica a un modelo texto-a-imagen).

## Casos de uso

- Generación de imágenes de producto en catalogos: el modelo produce imágenes de 1024×1024 en 4 pasos, lo que permite generar variaciones de un producto a bajo coste computacional dentro de un pipeline de publicacion automatizada.
- Creación de carteles y material tipográfico: segun el ejemplo de la model card, puede generar carteles con texto legible ("HELLO WORLD"), util para prototipos de diseno grafico donde se requiere tipografía bold y limpia.
- Prototipado rapido de conceptos visuales: con 4 pasos por imagen, un equipo de diseno puede iterar decenas de propuestas por minuto en una sola GPU, usando semillas fijas para comparar variaciones.
- Ilustración de articulos y blogs: generación de imágenes de acompanamiento a partir de descripciones en inglés, con la ventaja de que el coste por imagen es muy bajo frente a modelos de decenas de pasos.
- Investigación en destilación de modelos de difusión: el repositorio incluye `training_config.yml` y `export_metadata.json` con la receta exacta y el SHA256 del checkpoint fuente, lo que lo hace util como referencia reproducible para estudiar destilación AnyFlow2.
- Pruebas de integración en Diffusers: al distribuirse como directorio Diffusers completo con pipeline personalizado, sirve para validar flujos de `custom_pipeline` y `trust_remote_code` en entornos de CI o demos internas.
- Generación de fondos y texturas para videojuegos o escenas 3D: la resolución 1024×1024 y el bajo número de pasos permiten generar lotes de assets en GPU de consumo con offload a CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que es un checkpoint de investigación "with no claimed benchmark score".

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el autor senala que el pico de memoria depende de la longitud del prompt, el tamano de imagen y el backend de atención. El repositorio ocupa 20,6 GB (aproximadamente 21 GB de descarga), por lo que se necesita espacio en disco y RAM de host suficiente para cargar el modelo completo.
- Con `enable_model_cpu_offload()` o `--cpu-offload` se reduce la VRAM a costa de usar RAM del sistema; el autor no publica cifras concretas de VRAM pico.
- GPU recomendadas: no especificadas por el autor. Por el tamano del transformer en BF16 (6,19 mil millones de parámetros) y el requisito de cargar VAE y text encoder, se requiere una GPU con memoria suficiente para BF16; no se confirma que quepa en GPUs de consumo sin offload.
- Cabe en GPU de consumo: no confirmado; solo se documenta la opción de offload a CPU para reducir memoria.
- Opciones de despliegue: Diffusers con `DiffusionPipeline.from_pretrained(..., custom_pipeline=repo_id, trust_remote_code=True)`; demo CLI incluido (`demo.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a difusión en este formato).
- Latencia y throughput: no disponibles; solo se indica que son 4 evaluaciones del modelo por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de inferencia | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZImage-4Step-3000 | 6,19 mil millones | 4 | 1024×1024 | Apache-2.0 | Hugging Face (kimi000/ZImage-4Step-3000) |
| Tongyi-MAI/Z-Image (base) | No disponible en la informacion | No disponible | No disponible | No disponible en la informacion | Hugging Face (Tongyi-MAI/Z-Image) |
| Otros modelos de difusion destilados | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base en la informacion proporcionada, por lo que la comparativa cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Checkpoint de investigación sin puntuacion de benchmark declarada; no debe presentarse como modelo de produccion validado.
- Las imágenes y el texto renderizado pueden contener errores, segun advierte el propio autor.
- Solo entrenado con prompts en inglés; el rendimiento en otros idiomas no ha sido evaluado.
- Hereda las capacidades y limitaciones del modelo base Tongyi-MAI/Z-Image.
- Requiere `trust_remote_code=True` y carga codigo Python del repositorio; implica riesgo de seguridad si no se inspecciona el codigo antes de ejecutarlo.
- Un `ZImagePipeline` estandar de Diffusers no puede cargar estos pesos directamente; es necesario el pipeline personalizado incluido.
- El modelo completo necesita aproximadamente 21 GB de descarga y RAM de host suficiente para la carga; el pico de VRAM no esta documentado.
- Licencia Apache-2.0 permite uso comercial, pero al ser una adaptacion comunitaria de un modelo base, conviene revisar tambien las condiciones del modelo base Tongyi-MAI/Z-Image.
- No se documentan sesgos especificos, pero al entrenarse con MJHQ, TextAtlas y un dataset de prompts con modelo de recompensa, puede reflejar los sesgos de esas fuentes.
- Riesgo de alucinacion visual (artefactos, texto malformado) inherente a los modelos de difusion, agravado por la destilacion a 4 pasos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kimi000/ZImage-4Step-3000
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image
- Demo CLI y dependencias: incluidas en el repositorio (`demo.py`, `requirements.txt`)
- Configuracion de entrenamiento: `training_config.yml` en el repositorio
- Metadatos de exportacion: `export_metadata.json` en el repositorio
- Paper, blog o repositorio adicional de AnyFlow2: no disponible en la informacion proporcionada
