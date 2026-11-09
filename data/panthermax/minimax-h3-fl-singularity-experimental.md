# PantherMax/MiniMax-H3-FL-Singularity-Experimental

## Resumen

MiniMax H3 FL–Singularity Experimental es un checkpoint derivado del modelo de generación de vídeo MiniMax H3, publicado por el usuario PantherMax en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un merge de pesos: combina el modelo base MiniMax H3 (en su variante FL, alojada por Comfy-Org) con el fine-tune comunitario Singularity de WarmBloodAban. El objetivo declarado es explorar un renderizado "menos ceroso" y un movimiento más expresivo manteniendo FL como base.

El pipeline es image-to-video: el modelo toma una imagen de referencia y genera una secuencia de vídeo. La arquitectura subyacente es un transformer de difusión con 50 bloques principales, proyecciones de atención y MLP, mecanismos AdaLN dependientes del timestep y un token refiner. El repositorio ocupa 21 GB y se distribuye en safetensors con cuantización INT8 ConvRot para las capas pesadas.

La relevancia de esta ficha es acotada: es un experimento de la comunidad con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación de capacidades más allá de la receta de fusión de pesos. Resulta útil como referencia técnica de cómo se construye un merge quirúrgico sobre un modelo de difusión de vídeo, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para image-to-video; 50 bloques principales con atencion y MLP, AdaLN dependiente del timestep y token refiner |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (group size 256, escalado absmax por fila); pesos flotantes en BF16 en los checkpoints de origen |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license_name: minimax-h3-community-license-agreement) |
| Formato de pesos | safetensors (BF16 e INT8 ConvRot) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado: es un merge de pesos construido a partir de cuatro checkpoints. De Comfy-Org/MiniMax-H3 se toman `minimax_h3_fl2va_pruned_bf16.safetensors` (base flotante FL) y `minimax_h3_fl2va_pruned_int8_convrot.safetensors` (base de despliegue). De WarmBloodAban/Minimax-h3_Singularity se toman `Minimax-h3_Singularity_ref2va_v2_bf16.safetensors` (donante de atención y MLP) y `Minimax-h3_Singularity_ref2va_v2_pruned_int8.safetensors` (donante de timestep/AdaLN).

La receta de fusión es quirúrgica. En los 50 bloques principales se mezclan cuatro matrices de proyección con la fórmula `FL + 0.5 × (Singularity − FL)`, calculada en FP32 y redondeada a BF16 antes de cuantizar: `attn.qkv_proj.weight`, `attn.out_proj.weight`, `mlp.fc1.weight` y `mlp.fc2.weight`. Se elimina el prefijo `model.diffusion_model.` de las claves de Singularity para alinear el orden de tensores. Además, se copia completo el bundle de tiempo/AdaLN de Singularity (103 tensores: `adaln_t_table`, los `adaln_proj.linear.weight` y `.bias` de los 50 bloques, y el par peso/sesgo de la capa final) para no mezclar sistemas de coordenadas de timestep distintos.

El resto de componentes permanece intacto respecto a FL: proyección de condicionamiento, los dos bloques de token refiner, ganancias de normalización, proyecciones de entrada y salida de vídeo y audio, y frecuencias rotatorias. Solo las 200 matrices mezcladas se convierten a INT8 ConvRot con el cuantizador de Comfy-Org (group size 256, absmax por fila, aritmética FP32 en CPU, 256 filas completas por chunk, `mseclip=False`), reemplazando pesos y escalas por fila en la base INT8 de FL. No se aplica poda adicional ni se cuantiza el token refiner.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (pipeline image-to-video).
- Renderizado con estética modificada respecto al modelo base FL: el autor busca menos artefactos "cerosos" y mayor expresividad de movimiento.
- Procesamiento de audio y vídeo: el modelo conserva las proyecciones de entrada y salida de vídeo y audio del base.
- Condicionamiento por timestep mediante el bundle AdaLN heredado de Singularity.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: no disponible.
- Modo thinking, visión de imágenes estáticas o audio como tarea principal: no disponible.

## Casos de uso

- Exploración estética de image-to-video: usar el checkpoint para comparar el renderizado frente a FL puro y Singularity puro, evaluando si la mezcla 50/50 reduce el aspecto ceroso en caras y superficies.
- Prototipado de animaciones cortas a partir de una imagen fija: el pipeline image-to-video permite animar un fotograma clave y revisar el movimiento generado antes de invertir en un modelo mayor.
- Investigación sobre merges de modelos de difusión: sirve como caso reproducible de fusión selectiva de proyecciones de atención y MLP con reemplazo del bundle AdaLN, útil para estudiar qué componentes determinan estilo y movimiento.
- Pruebas de cuantización INT8 ConvRot en difusión de vídeo: el checkpoint permite medir el impacto visual de cuantizar solo las 200 matrices principales manteniendo el resto byte a byte.
- Evaluación comparativa de fine-tunes comunitarios: permite contrastar la variante Singularity frente a FL en tareas concretas de animación, con la receta de mezcla documentada.
- Integración en flujos ComfyUI: las etiquetas del repositorio indican compatibilidad con ComfyUI, por lo que puede cargarse en grafos de generación de vídeo para experimentación local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 21 GB y la base de despliegue es INT8 ConvRot, lo que sugiere que los pesos caben en GPUs de 24 GB en adelante, pero no hay cifras confirmadas.
- GPU recomendadas: no disponible. Por tamaño de checkpoint, un entorno con 24 GB o más de VRAM es el mínimo razonable; A100 o H100 serían necesarias para ejecución cómoda en BF16.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) con la variante INT8, aunque no está verificado en la información disponible.
- Opciones de despliegue: ComfyUI (etiqueta explícita del repositorio). Otras herramientas como vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de difusión de vídeo y no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 FL–Singularity Experimental | Merge image-to-video | no disponible | no disponible | MiniMax H3 Community License | Hugging Face, 0 descargas |
| MiniMaxAI/MiniMax-H3 | Modelo base image-to-video | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (oficial) |
| Comfy-Org/MiniMax-H3 | Distribución del base para ComfyUI | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |
| WarmBloodAban/Minimax-h3_Singularity | Fine-tune comunitario | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un merge experimental de pesos, no un modelo entrenado; el autor no garantiza calidad ni estabilidad del resultado.
- Sin benchmarks, sin evaluación cualitativa publicada y con 0 descargas: no hay evidencia de rendimiento más allá de la descripción del autor.
- El objetivo estético ("menos ceroso", "movimiento más expresivo") es subjetivo y no está cuantificado.
- La mezcla solo afecta a 200 matrices y al bundle AdaLN; cualquier mejora o regresión se limita a esos componentes, no al modelo completo.
- Riesgo de artefactos por incompatibilidad entre sistemas de timestep: el autor copia el bundle AdaLN completo de Singularity precisamente para evitarlo, pero no hay validación publicada.
- Licencia MiniMax H3 Community License Agreement: es necesario revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial; las condiciones concretas no están detalladas en la información disponible.
- Idiomas soportados no documentados; al ser un modelo de vídeo, la noción de idioma aplica solo a audio si lo hubiera.
- Sin datos de sesgos, alucinación visual o limitaciones de contexto.
- Repositorio creado y actualizado el mismo día (2026-11-09), sin historial de mantenimiento.

## Enlaces

- [Hugging Face: PantherMax/MiniMax-H3-FL-Singularity-Experimental](https://huggingface.co/PantherMax/MiniMax-H3-FL-Singularity-Experimental)
- [Modelo base: MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Distribución ComfyUI: Comfy-Org/MiniMax-H3 (revision 54472221)](https://huggingface.co/Comfy-Org/MiniMax-H3/tree/54472221d27c695fca9621b0c3ed52f06c4af707/diffusion_models)
- [Donante Singularity: WarmBloodAban/Minimax-h3_Singularity (revision 1259cf16)](https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity/tree/1259cf16cd0b655ba691a32fb46a409142762972)
- [Cuantizador Comfy-Org (quant_int8_convrot.py, revision d6797787)](https://github.com/Comfy-Org/comfy-model-tools/blob/d6797787e6bdb1a1fb0094d588a26f8e71a1c757/quant_int8_convrot.py)
