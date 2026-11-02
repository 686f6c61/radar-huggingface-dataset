# DeltaEngine/MossInt4

## Resumen

MossInt4 es un conjunto de pesos cuantizados a int4 de un pipeline de generación de imágenes texto-a-imagen, publicado por DeltaEngine. Reúne tres ficheros: dos variantes del modelo de difusión MOSS-Image-SFT (una con el LoRA de 4 pasos fusionado y otra con el LoRA DMD turbo de 8 pasos) y el codificador de texto Qwen3.5-9B reducido a su torre de lenguaje. El objetivo declarado no es superar al modelo original en calidad, sino empaquetarlo para que quepa en las restricciones de un navegador: WebAssembly con un límite de direccionamiento de 4 GB, buffers de WebGPU limitados a 2 GB y GPUs de consumo con 8-12 GB de VRAM.

La relevancia del artefacto está en su formato de compresión y en la estrategia de despliegue. Los pesos usan el layout `convrot_w4a4` de ComfyUI: cada capa lineal se rota con una transformada de Hadamard de 256 elementos, se almacena como códigos de 4 bits con signo (dos por byte) y una escala F32 por fila, con un error relativo medio de fila del 11,4 %. Los ficheros se sirven por HTTP range requests directamente a buffers de GPU y se cachean en OPFS, de modo que nunca es necesario cargarlos enteros en memoria de WebAssembly.

El consumo previsto es la página StrictComfy, escrita en el lenguaje Strict y ejecutada íntegramente en local mediante WebGPU. La versión descargable de GitHub, en int8 y CUDA, es hasta 10 veces más rápida según el autor. No hay datos publicados de benchmarks de calidad de imagen ni de idiomas soportados, y el repositorio no registra descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (MOSS-Image-SFT) con codificador de texto Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | No disponible (tamaños de fichero: 3,0 GB por variante de difusión; 4,5 GB el codificador de texto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el codificador de texto es Qwen3.5-9B sin cabeza de salida ni visión) |
| Tipos de cuantizacion | Int4 con layout `convrot_w4a4` (Hadamard 256, códigos I8 empaquetados, escala F32 por fila); activaciones en 8 bits; normas y tensores pequeños en BF16/F32; embeddings de Qwen en int8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`moss_image_sft_4step_int4_convrot.safetensors`, `moss_image_sft_dmd_int4_convrot.safetensors`, `qwen3.5_9b_int4_convrot.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es MOSS-Image-SFT de OpenMOSS-Team, un generador texto-a-imagen del que no se detallan en la información disponible la arquitectura interna (tipo de backbone, número de parámetros, mecanismo de atención) ni los datos de entrenamiento. Sobre esa base se aplican dos LoRA distintos: uno de 4 pasos, procedente de `akhaliq/MOSS-Image-SFT-4-steps`, y otro DMD turbo de 8 pasos, de `lodestones/MOSS-Image-SFT-8-steps-dmd`. Ambos se fusionan en los pesos bf16 antes de cuantizar, de modo que el resultado son dos checkpoints autocontenidos que no requieren cargar adaptadores en tiempo de inferencia.

La innovación técnica está en la cuantización y el empaquetado. Cada capa lineal se rota con una transformada de Hadamard de anchura 256 para dispersar valores atípicos, se codifica a 4 bits con signo y una escala F32 por fila elegida mediante búsqueda de recorte, con un error relativo medio de fila del 11,4 %. El codificador Qwen3.5-9B se recuantiza desde la release int8 convrot y conserva solo la torre de lenguaje, sin visión, MTP ni cabeza de salida; su contexto mantiene una similitud coseno de 0,96 respecto a int8. La computación se ejecuta con activaciones de 8 bits mediante `dot4I8Packed` de WebGPU, por lo que el int4 aporta sobre todo ahorro de descarga y memoria, no aceleración aritmética.

## Capacidades

- Generación de imágenes a partir de prompts de texto, en dos configuraciones de pasos: 4 pasos (variante más rápida) y 8 pasos (variante de mayor calidad).
- Modos intermedios de muestreo: la variante de 4 pasos admite los modos `fastest` y `fastest2steps`; la DMD admite `best`, `fast` y `faster`.
- Codificación de texto mediante Qwen3.5-9B, limitada a la torre de lenguaje (sin capacidades de visión).
- Ejecución íntegra en navegador con WebGPU, con streaming de pesos por HTTP range requests y caché en OPFS.
- No se documentan tool calling, function calling, razonamiento multi-paso, modo thinking ni capacidades de audio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de imágenes en el navegador sin backend: la página StrictComfy carga los safetensors por streaming y ejecuta la difusión en WebGPU, de modo que el usuario no envía prompts ni imágenes a ningún servidor.
- Aplicaciones de privacidad estricta: al ejecutarse 100 % en local, encaja en escenarios donde el prompt no puede salir del dispositivo, como edición de material médico o interno.
- Demos y prototipos sin infraestructura: un equipo puede publicar un generador de imágenes en una página estática, sin GPU en la nube ni coste por inferencia.
- Herramientas creativas offline-first: integración en editores web que cachean los 3,0 GB del checkpoint en OPFS tras la primera carga y funcionan después con latencia de red nula.
- Evaluación de cuantización int4 sobre difusión: los dos checkpoints permiten comparar la variante de 4 pasos frente a la DMD de 8 pasos con el mismo esquema `convrot_w4a4` y medir la degradación de detalle fino.
- Prototipado de pipelines texto-a-imagen en entornos con GPU de consumo: con 8-12 GB de VRAM y buffers de 2 GB, el modelo cabe donde un checkpoint bf16 completo no cabría.
- Distribución de bajo ancho de banda: los ficheros de 3,0 GB y 4,5 GB, servidos por rangos HTTP, permiten carga progresiva en conexiones modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo aporta métricas internas de cuantización: error relativo medio de fila del 11,4 % en las capas lineales y similitud coseno de 0,96 del contexto del codificador de texto respecto a la versión int8. Indica también que, frente a los originales int8, las imágenes mantienen la misma composición con diferencias pequeñas en detalle fino, y que la versión de escritorio en int8 con CUDA es hasta 10 veces más rápida que la ejecución WebGPU en navegador.

## Requisitos de hardware

- VRAM estimada: los checkpoints de difusión ocupan 3,0 GB cada uno y el codificador de texto 4,5 GB; el autor sitúa el objetivo en GPUs de 8-12 GB de VRAM.
- Restricción de buffers: WebGPU limita cada buffer a 2 GB, por lo que los tensores deben trocearse y transmitirse por rangos HTTP en lugar de cargarse de una vez.
- Límite de WebAssembly: 4 GB de espacio de direcciones como máximo; el diseño evita mantener los pesos completos en memoria Wasm.
- GPU recomendadas: no se especifican modelos concretos; el requisito es un navegador con soporte de WebGPU y una GPU integrada o dedicada con 8-12 GB de VRAM.
- ¿Cabe en GPU de consumo? Sí, ese es el objetivo de diseño declarado, siempre que la GPU exponga WebGPU y tenga VRAM suficiente.
- Opciones de despliegue: página StrictComfy en navegador con WebGPU; la build de escritorio de GitHub usa int8 con CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles de forma numérica; solo la comparación cualitativa de hasta 10 veces más rápido en la versión nativa int8/CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeltaEngine/MossInt4 | No disponible (3,0 GB + 4,5 GB en int4) | No disponible | safetensors int4 `convrot_w4a4` | Apache 2.0 | HuggingFace, ejecución WebGPU en navegador |
| OpenMOSS-Team/MOSS-Image-SFT | No disponible | No disponible | No disponible | Apache 2.0 (según el modelo del que deriva) | HuggingFace |
| akhaliq/MOSS-Image-SFT-4-steps | No disponible | No disponible | LoRA | Apache 2.0 (según el modelo del que deriva) | HuggingFace |
| lodestones/MOSS-Image-SFT-8-steps-dmd | No disponible | No disponible | LoRA DMD | Apache 2.0 (según el modelo del que deriva) | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización int4 introduce un error relativo medio de fila del 11,4 % en las capas lineales; el autor reconoce diferencias en detalle fino respecto a int8, aunque la composición se mantiene.
- El codificador de texto pierde visión, MTP y cabeza de salida; solo sirve como torre de lenguaje para codificar prompts, no como modelo de chat o razonamiento.
- La ejecución en navegador es sustancialmente más lenta que la nativa: hasta 10 veces según el autor, lo que desaconseja su uso en producción de alto volumen.
- Dependencia de WebGPU y de OPFS: navegadores o GPUs sin soporte quedarán fuera, y la caché de 3,0-4,5 GB consume cuota de almacenamiento del usuario.
- No hay información sobre sesgos, tasas de alucinación visual, idiomas soportados ni evaluación de seguridad del contenido generado.
- Licencia Apache 2.0 heredada de los modelos de origen; conviene verificar las condiciones de los checkpoints base y de los LoRA fusionados antes de un uso comercial.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en producción ni validación externa de la calidad.
- No se documentan límites de resolución, número máximo de tokens de prompt ni comportamiento con prompts largos o en idiomas distintos del inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DeltaEngine/MossInt4
- Modelo base de difusión: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- LoRA de 4 pasos: https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps
- LoRA DMD de 8 pasos: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Codificador de texto: https://huggingface.co/Qwen/Qwen3.5-9B
- Página StrictComfy: https://github.com/strict-lang/StrictComfy
- Lenguaje Strict: https://strict-lang.org
