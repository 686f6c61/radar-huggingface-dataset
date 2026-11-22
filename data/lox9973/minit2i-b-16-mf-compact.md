# lox9973/MiniT2I-B-16-MF-compact

## Resumen

MiniT2I-B-16-MF-compact es un modelo de generacion de imagenes a partir de texto (text-to-image) publicado por el usuario lox9973 en Hugging Face. Se trata de un fine-tune de MiniT2I-B-16-MF que reduce el numero total de parametros del pipeline completo de 603,3 millones a 315,1 millones (un 47,8% menos) sustituyendo el codificador de texto FLAN-T5-large por un codificador compacto de 16 capas inicializado desde FLAN-T5-small. El generador de imagenes subyacente, basado en Mean Flow, permanece congelado durante este ajuste.

El modelo genera imagenes de 512 x 512 pixeles en cuatro pasos de muestreo nativos, sin necesidad de instalar JAX ni descargar el modelo base por separado. El repositorio incluye pesos en safetensors, tokenizador, planificador y un pipeline de Python personalizado listo para Diffusers. Los pesos del safetensors suman 260.897.408 parametros, mientras que el total del pipeline (incluyendo el codificador de texto) asciende a 315,1 millones.

Su relevancia radica en la reduccion de requisitos de memoria y almacenamiento manteniendo el comportamiento del modelo original mediante destilacion de condicionamiento, lo que lo hace atractivo para entornos con recursos limitados. La licencia es MIT y el modelo no declara idiomas soportados de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con Mean Flow para generacion de imagenes; codificador de texto T5 compacto de 16 capas (5 bloques FLAN-T5-small retenidos y 11 nuevos) |
| Parametros totales | 260.897.408 en pesos safetensors; 315,1 millones en el pipeline completo (imagen + texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 256 tokens de prompt, incluyendo EOS |
| Tipos de cuantizacion | almacenamiento en float16; inferencia recomendada en float32; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT (con aviso upstream de MiniT2I en LICENSE-MiniT2I.txt; FLAN-T5 bajo Apache-2.0) |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo combina un generador de imagenes Mean Flow, heredado del modelo base MiniT2I-B-16-MF-jax y congelado durante el fine-tune, con un codificador de texto compacto. Este codificador tiene 16 capas: cinco bloques retenidos de FLAN-T5-small y once bloques inicializados de nuevo, entrenados junto con los dos bloques de preambulo de texto del modelo original. Una proyeccion sin sesgo conecta el codificador compacto con el modelo de imagen y queda fusionada en los pesos exportados. El backbone de eliminacion de ruido no se modifica.

El entrenamiento se basa en destilacion de condicionamiento sobre 80.000 leyendas: 40.000 procedentes de BLIP3o y 40.000 de ShareGPT, con conjuntos de validacion y test reservados. El objetivo declarado es conservar el comportamiento del modelo base con un frontend de texto mas pequeno; la model card no reclama mejor calidad de imagen que el modelo original. El muestreo es nativo Mean Flow en cuatro pasos a 512 x 512, con guidance embebida (guidance_scale=12,0) e intervalo de guiado t_min=0,2 y t_max=0,8.

## Capacidades

- Generacion de imagenes a partir de texto a 512 x 512 pixeles en cuatro pasos de muestreo.
- Condicionamiento de texto compacto mediante un codificador T5 de anchura 512 entrenado para reproducir el condicionamiento del modelo original.
- Generacion de multiples imagenes por prompt mediante num_images_per_prompt.
- Ejecucion en GPU y CPU (cambiando "cuda" por "cpu" en el ejemplo).
- Carga directa con Diffusers mediante pipeline personalizado, sin instalacion de JAX.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking.

## Casos de uso

- Prototipado rapido de generacion de imagenes en equipos con VRAM limitada: el pipeline completo de 315,1 millones de parametros y la inferencia en cuatro pasos reducen el coste frente al modelo base de 603,3 millones.
- Generacion de bocetos e ilustraciones para maquetas de interfaz o material de presentacion, usando prompts de hasta 256 tokens y la configuracion por defecto.
- Pruebas de concepto en cuadernos o entornos de desarrollo: el repositorio incluye tokenizador, planificador y pipeline, por lo que basta con DiffusionPipeline.from_pretrained con trust_remote_code.
- Experimentacion academica con destilacion de condicionamiento: sirve como referencia de como sustituir un codificador de texto grande por uno compacto manteniendo el generador congelado.
- Despliegue en CPU para demostraciones o entornos sin GPU, cambiando el dispositivo a "cpu" en el ejemplo de la model card.
- Generacion por lotes de imagenes con semilla fija (por ejemplo, seed 0) para comparar prompts de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la galeria muestra ejemplos seleccionados y no constituye un benchmark de calidad. Tampoco se proporcionan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 260,9 millones de parametros en pesos safetensors y carga en float32, el modelo de imagen y el codificador de texto ocupan del orden de 1 GB en memoria de modelo; el pico real de inferencia no se documenta.
- GPU recomendadas: no disponible. El ejemplo de la model card usa "cuda" sin especificar modelo de GPU.
- Cabe en GPU de consumo: por el tamano de parametros es plausible, pero no se confirma en la informacion disponible.
- Opciones de despliegue: Diffusers con custom_pipeline y trust_remote_code; el repositorio incluye pipeline de Python propio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros del pipeline | Contexto de prompt | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniT2I-B-16-MF-compact | 315,1 M | 256 tokens | 4 | MIT | Hugging Face (diffusers) |
| MiniT2I-B-16-MF (base) | 603,3 M | no disponible | 4 | MIT (upstream) | Hugging Face (JAX) |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El renderizado de texto, la anatomia, el conteo, las relaciones espaciales y el seguimiento detallado de prompts pueden ser poco fiables.
- Los resultados pueden reflejar sesgos heredados del modelo base y del codificador de texto.
- El pipeline no incluye comprobador de seguridad (safety checker).
- Los prompts que superan los 256 tokens generan un error; hay que acortarlos en lugar de confiar en el truncado.
- El pipeline no acepta prompt negativo ni anchura y altura personalizadas.
- La calidad con ajustes de muestreo distintos a los recomendados no esta establecida.
- Cargar directamente en FP16 no es la configuracion de inferencia recomendada; el ejemplo usa FP32.
- La model card no reclama mejor calidad de imagen que el modelo base.
- La licencia MIT permite uso comercial, pero se debe conservar el aviso upstream de MiniT2I y respetar la licencia Apache-2.0 de FLAN-T5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lox9973/MiniT2I-B-16-MF-compact
- Modelo base: https://huggingface.co/MiniT2I/MiniT2I-B-16-MF-jax
- Codificador de texto de inicializacion: https://huggingface.co/google/flan-t5-small
- Codificador de texto profesor (condicionamiento): https://huggingface.co/google/flan-t5-large
- Galeria oficial de MiniT2I: https://peppaking8.github.io/minit2i/gallery/
