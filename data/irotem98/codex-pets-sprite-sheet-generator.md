# irotem98/Codex-Pets-Sprite-Sheet-Generator

## Resumen

Codex Pets Sprite Sheet Generator es un modelo de difusión especializado en generar hojas de sprites (sprite sheets) para personajes pixel art, desarrollado por irotem98. Se basa en el modelo de difusión Boogu-Image-0.1-Edit (10B parámetros) y añade dos componentes entrenados específicamente: un VAE adaptado a canales RGBA (con transparencia) y un LoRA de rango 8 sobre las proyecciones de atención del transformer. El modelo resuelve el problema de generar automáticamente una hoja de sprites completa con 11 filas de animación (idle, correr, saltar, etc.) a partir de una única imagen de personaje con fondo transparente.

La relevancia actual radica en que simplifica un flujo de trabajo que normalmente requiere edición manual o múltiples pasos de generación, ofreciendo un pipeline de un solo comando que produce un PNG de 1536×2288 píxeles con 8 columnas y 11 filas de animación. El modelo está publicado bajo licencia Apache-2.0, lo que permite uso comercial y modificación. El repositorio incluye el script de generación, el VAE y el LoRA, pero requiere descargar el modelo base original de Boogu.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (basado en Boogu-Image-0.1-Edit) con VAE RGBA adaptado y LoRA rank-8 |
| Parametros totales | 10B (modelo base) + adaptadores (VAE RGBA y LoRA rank-8) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el script) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (VAE y LoRA) |

## Arquitectura y entrenamiento

El modelo se construye sobre Boogu-Image-0.1-Edit, un modelo de difusion de 10B parametros con arquitectura transformer y encoder de instrucciones Qwen3-VL. El entrenamiento se realizo en dos etapas:

1. **Adaptacion del VAE a RGBA**: el VAE original de Boogu trabaja en RGB. Se congelaron los pesos RGB originales y se anadieron un adaptador de entrada de un canal (alpha) al encoder y una cabeza de salida de un canal al decoder. Se entrenaron con perdidas ponderadas por separado (reconstruccion RGB, reconstruccion alpha, alpha de primer plano, RGB transparente y KL). El checkpoint final (paso 2000) se entreno sobre 3.015 hojas de sprites del dataset `irotem98/codex-pets-sprite-sheets`, representadas como 27.691 filas de entrenamiento y 540 de validacion. Tras el entrenamiento, los adaptadores se fusionaron en un `AutoencoderKL` estandar de cuatro canales.

2. **Entrenamiento del LoRA**: se congelaron el VAE RGBA y el encoder de instrucciones Qwen3-VL. Se entreno un LoRA de rango 8 sobre las proyecciones de atencion `to_q`, `to_k`, `to_v` y `to_out.0` del transformer de difusion. Para cada fila de animacion, la entrada era una cuadricula 3×3 equilibrada donde cada celda ocupada repetia el primer sprite de la primera fila de la hoja; la salida objetivo eran los fotogramas reales de animacion empaquetados en las mismas celdas. La instruccion era un prompt explicito que nombraba la animacion, el numero de fotogramas, el orden, la preservacion de identidad, el fondo transparente y la disposicion de celdas ocupadas. El checkpoint final (paso 21.000) se entreno con objetivo de flow matching.

## Capacidades

- Generacion de hojas de sprites completas (11 filas de animacion) a partir de una unica imagen de personaje con fondo transparente.
- Edicion de imagen (image-to-image) con preservacion de identidad del personaje original.
- Soporte de transparencia RGBA en la salida, con limpieza binaria del canal alpha.
- Generacion de multiples animaciones: idle, correr (izquierda/derecha), saludo, salto, fallo, espera, running, review y direcciones de mirada (16 direcciones en dos filas).
- Salida fija de 1536×2288 píxeles con celdas de 192×208 píxeles y 8 columnas.
- Acepta imagenes RGB/JPEG, aunque se recomienda PNG transparente para mejores resultados.
- Script de inferencia automatizado que gestiona la preparacion de la imagen, las 11 llamadas de difusion, el empaquetado de filas y el ensamblaje final.

## Casos de uso

- **Generacion de assets para juegos indie**: un desarrollador puede introducir un boceto de personaje en PNG transparente y obtener una hoja de sprites lista para integrar en un motor como Unity o Godot, con las animaciones basicas ya preparadas.
- **Prototipado rapido de personajes**: los disenadores pueden iterar sobre variaciones de un personaje (color, forma) generando nuevas hojas de sprites en segundos sin necesidad de animar manualmente cada fotograma.
- **Creacion de contenido para Codex Pets**: el modelo esta disenado especificamente para el formato V2 de Codex Pets, por lo que los usuarios de esa plataforma pueden generar hojas compatibles directamente.
- **Automatizacion de pipelines de arte**: en estudios pequenos, el script puede integrarse en un flujo de trabajo por lotes para generar hojas de sprites de multiples personajes a partir de una carpeta de imagenes de entrada.
- **Educacion y aprendizaje de pixel art**: los estudiantes pueden usar el modelo para ver como se estructuran las animaciones y comparar sus propias hojas con las generadas automaticamente.
- **Modding y comunidades de fans**: los creadores de mods pueden generar hojas de sprites para personajes personalizados en juegos que usen formatos similares, reduciendo el trabajo manual de alineacion y empaquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas cuantitativas de calidad de imagen, fidelidad de identidad o coherencia de animacion. La unica referencia de rendimiento es cualitativa: el ejemplo mostrado en la model card (Jigglypuff) genera una hoja completa de 11 filas a partir de una sola imagen.

## Requisitos de hardware

- El modelo base Boogu-Image-0.1-Edit tiene 10B parametros, por lo que se recomienda una GPU CUDA con VRAM sustancial (al menos 16-24 GB para inferencia en precision completa; cuantizaciones no disponibles).
- El script permite ajustar el `--row-batch-size` (por defecto 1) para generar varias filas de animacion simultaneamente si la GPU tiene memoria adicional. Valores de 2, 4 u 11 aumentan el uso de VRAM pero reducen el tiempo total.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o superiores.
- El repositorio incluye modulos de inferencia de Boogu bajo `boogu/`, y el script usa Diffusers para cargar el VAE y el LoRA.
- Opciones de despliegue: el script `generate_sprite_sheet.py` es la via principal; no se mencionan integraciones con vLLM, llama.cpp u Ollama (al ser un modelo de difusion, no es aplicable).
- Latencia y throughput: no disponibles. Con 50 pasos de difusion por fila y 11 filas, el tiempo total dependera de la GPU; en una A100 podria ser de varios minutos por hoja.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en el mismo nicho (generacion de sprite sheets de pixel art). Alternativas genericas de generacion de imagenes (Stable Diffusion, SDXL, Flux) podrian usarse con prompts y post-procesamiento, pero no ofrecen un pipeline integrado para hojas de sprites con formato fijo. La comparativa no esta disponible por falta de datos publicados.

## Limitaciones y advertencias

- Los mejores resultados se obtienen con una imagen de un unico personaje pixel art sobre fondo transparente; imagenes complejas o con multiples elementos pueden degradar la calidad.
- Si se introduce una imagen RGB/JPEG, todo el rectangulo de fondo se trata como visible, lo que puede producir artefactos en el canal alpha. Se recomienda encarecidamente usar PNG transparente.
- La calidad del movimiento, la consistencia de la orientacion (facing) y la preservacion de identidad pueden variar entre filas de animacion.
- El formato de salida esta fijado a la disposicion V2 de 11 filas; no es configurable.
- El repositorio no contiene el modelo base completo; requiere descargar Boogu-Image-0.1-Edit (10B) en el primer uso, lo que implica un consumo de ancho de banda y espacio en disco adicional.
- No se han publicado evaluaciones de sesgos o riesgos de alucinacion visual; como todo modelo de difusion, puede generar contenido inesperado o distorsiones en personajes poco comunes.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar la model card del modelo base Boogu para conocer sus condiciones de uso responsable y limitaciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/irotem98/Codex-Pets-Sprite-Sheet-Generator
- Dataset de entrenamiento: https://huggingface.co/datasets/irotem98/codex-pets-sprite-sheets
- Modelo base Boogu-Image-0.1-Edit: https://huggingface.co/Boogu/Boogu-Image-0.1-Edit
- Sitio de Codex Pets: https://codex-pets.net/
- Colecciones de Codex Pets: https://codex-pet.org/collections/
- Guia de spritesheet.webp en CodingPets.dev: https://www.codingpets.dev/codex-pets/spritesheet-webp
- Repositorio alternativo codex-pet-generator en GitHub: https://github.com/863683348/codex-pet-generator
