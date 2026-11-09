# pisar/Qwen3.5-4B-MLX-4bit

## Resumen

Qwen3.5-4B-MLX-4bit es una cuantizacion a 4 bits en formato MLX del modelo Qwen/Qwen3.5-4B, publicada por el usuario pisar para su ejecucion en hardware Apple Silicon. Se trata de un modelo vision-language (VLM) de la familia Qwen3.5, con 4.539.265.536 parametros totales segun los pesos safetensors del repositorio, cuantizados a 4 bits con un tamano de grupo de 64 y un promedio de 5,347 bits por peso. El repositorio ocupa aproximadamente 3,1 GB y el propio autor indica que el modelo en disco ronda los 2,9 GB.

La relevancia de esta publicacion es practica: permite ejecutar un VLM de la familia Qwen3.5 en Macs con memoria unificada mediante el framework mlx-vlm, sin necesidad de GPU dedicada. La conversion se realizo desde la rama `pc/fix-qwen35-predicate` de mlx-vlm, que incorpora correcciones especificas para Qwen3.5 (gestion de capas gate MoE, `shared_expert_gate` y casting de `A_log`), lo que sugiere que el modelo base emplea componentes de mezcla de expertos y posiblemente capas de atencion lineal o state-space.

No obstante, el autor advierte de que puede existir una conversion mejor optimizada por parte de Blaizzy en la organizacion mlx-community, y que la version aqui publicada se genero antes de que el soporte oficial de Qwen3.5 se fusionara en la rama principal de mlx-vlm. El modelo hereda la licencia Apache 2.0 del modelo original de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basada en Qwen3.5 (transformer con componentes MoE y posible atencion lineal, segun las correcciones aplicadas en la conversion) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (5,347 bits por peso), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX SafeTensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.5-4B mas alla de las referencias tecnicas incluidas en la model card de la conversion. La mencion a la gestion de "MoE gate layers", `shared_expert_gate` y `A_log` casting en la rama de mlx-vlm empleada para la conversion indica que el modelo incorpora capas de mezcla de expertos con compuertas compartidas y parametros `A_log`, tipicos de mecanismos de atencion lineal o state-space (estilo Mamba). Se trata, por tanto, de una arquitectura hibrida o con componentes MoE, aunque no se dispone de la configuracion exacta de capas, numero de expertos ni dimensiones ocultas.

Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La unica informacion sobre el proceso de creacion de este repositorio concreto es la cuantizacion post-entrenamiento realizada con `mlx_vlm convert` a 4 bits y group size 64, partiendo de los pesos originales en el repositorio Qwen/Qwen3.5-4B.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.5-4B.
- Procesamiento de vision e imagen: el modelo se etiqueta como vision-language-model y la model card incluye ejemplos de generacion condicionada por imagen (`--image path/to/image.jpg`).
- Descripcion de imagenes y respuesta a prompts multimodales, tal como se muestra en los ejemplos de uso con mlx-vlm.
- Ejecucion en Apple Silicon mediante MLX, con inferencia local en Macs.
- Capacidades de tool calling, function calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion y analisis de imagenes en local: el modelo permite pasar una imagen junto con un prompt de texto y generar una descripcion o respuesta, segun el ejemplo de la model card, lo que lo hace util para prototipos de vision por computador en Macs sin GPU dedicada.
- Prototipado rapido de aplicaciones VLM en Apple Silicon: gracias al formato MLX y al tamano de 2,9 GB en disco, se puede cargar el modelo en un Mac para experimentar con pipelines de vision-lenguaje antes de migrar a produccion.
- Asistentes multimodales de escritorio: integracion en aplicaciones nativas de macOS que necesiten interpretar capturas de pantalla o imagenes locales con un modelo de 4 bits que cabe en memoria unificada.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad de una cuantizacion a 4 bits frente a las versiones bf16 y 8 bits de mlx-community sobre las mismas tareas.
- Educacion e investigacion: permite a estudiantes e investigadores ejecutar un VLM de ~4.500 millones de parametros en portatiles Apple sin infraestructura de servidor.
- Generacion de texto multimodal en entornos con requisitos de privacidad: al ejecutarse localmente, las imagenes y prompts no salen del dispositivo, lo que encaja en escenarios con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 2,9 GB en disco para los pesos en 4 bits; la memoria unificada necesaria en ejecucion sera algo superior por el contexto, los buffers de atencion y el procesador de vision, aunque no se dispone de una cifra oficial.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante el framework MLX. No esta pensado para GPUs NVIDIA.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable; el formato MLX no esta disenado para CUDA. Para esas GPUs habria que usar los pesos originales o cuantizaciones GGUF/AWQ, no disponibles en la informacion proporcionada.
- Cabe en consumer hardware: si, en Macs con memoria unificada suficiente (orientativamente 8 GB o mas, aunque no confirmado oficialmente).
- Opciones de despliegue: `mlx-vlm` (libreria y CLI `python3 -m mlx_vlm.generate`). No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pisar/Qwen3.5-4B-MLX-4bit | 4.539.265.536 | no disponible | 4 bits MLX (5,347 bpw) | Apache 2.0 | Hugging Face, 0 descargas |
| mlx-community/Qwen3.5-4B-MLX-8bit | mismo modelo base | no disponible | 8 bits MLX | Apache 2.0 | Hugging Face (mlx-community) |
| mlx-community/Qwen3.5-4B-MLX-bf16 | mismo modelo base | no disponible | bf16 (sin cuantizar) | Apache 2.0 | Hugging Face (mlx-community) |
| Qwen/Qwen3.5-4B | 4.539.265.536 | no disponible | pesos originales | Apache 2.0 | Hugging Face (modelo base) |

La comparativa se limita a las variantes del mismo modelo base referenciadas en la model card. No se dispone de informacion sobre modelos de otros desarrolladores con los que comparar rendimiento.

## Limitaciones y advertencias

- La cuantizacion a 4 bits (5,347 bits por peso) puede degradar la calidad respecto a las versiones bf16 y 8 bits, especialmente en tareas de razonamiento o vision fina; no se han publicado evaluaciones que cuantifiquen esta perdida.
- El autor advierte de que puede existir una conversion mejor optimizada por Blaizzy en mlx-community, y que esta version se genero con una rama no fusionada de mlx-vlm, por lo que pueden aparecer problemas de compatibilidad con versiones futuras de la libreria.
- Solo es ejecutable en Apple Silicon con MLX; no es portable a CUDA ni a otros backends sin reconversion.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria conocida.
- La licencia Apache 2.0 permite uso comercial, pero al ser una conversion no oficial conviene verificar los terminos del modelo base Qwen/Qwen3.5-4B.
- Para produccion se recomienda evaluar la version oficial de mlx-community una vez fusionado el soporte de Qwen3.5 en la rama principal de mlx-vlm.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pisar/Qwen3.5-4B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Version bf16: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-bf16
- Version 8 bits: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-8bit
- Organizacion mlx-community: https://huggingface.co/mlx-community
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Rama de conversion utilizada: https://github.com/Blaizzy/mlx-vlm/tree/pc/fix-qwen35-predicate
